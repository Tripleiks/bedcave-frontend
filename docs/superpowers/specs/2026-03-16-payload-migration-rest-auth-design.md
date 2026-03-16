# Design: Payload CMS MDX-Migration via REST API mit Authentifizierung

**Datum:** 16. März 2026
**Status:** Genehmigt — Implementierung ausstehend
**Projekt:** bedcave-frontend

---

## Ziel

13 MDX-Posts aus `migration/posts-data.json` in die Payload CMS BlogPosts Collection importieren — über die Payload REST API mit JWT-Authentifizierung. Kein Server-seitiger Bypass, keine gespeicherten Credentials.

---

## Kontext & Ausgangslage

- Payload CMS 3.x mit SQLite ist installiert und migriert
- Die BlogPosts Collection hat kein öffentliches `create` → nur authentifizierte User können schreiben
- Das bestehende `migration/import-to-payload.js` scheitert weil:
  1. Kein JWT-Token → 401 Unauthorized
  2. `author: null` → Validation Error (Feld ist `required`)
  3. `content` als Plain-String → Lexical JSON erwartet
  4. Kategorien `homelab`, `docker`, `hardware` nicht in Collection definiert
- Dieses Dokument beschreibt den **Zielzustand** — das Skript wird vollständig neu geschrieben

---

## Lösung

### Schritt 0 — Manuell (einmalig, PREREQUISITE)

> ⚠️ **Das Import-Skript darf erst nach diesem Schritt ausgeführt werden.**

1. `collections/BlogPosts.ts` erweitern (Schritt 1 unten)
2. Server starten: `npm run dev` (lädt die geänderte Collection)
3. Admin-User anlegen: `http://localhost:3000/admin`

### Schritt 1 — `collections/BlogPosts.ts` erweitern (VOR dem Import-Run)

Drei fehlende Kategorien ergänzen. Die Posts-Daten enthalten `homelab`, `docker`, `hardware` — diese sind im `category`-Select-Feld (`required: true`) noch nicht definiert. Ohne diese Ergänzung schlägt jeder betroffene POST mit einem Validation Error fehl.

```ts
{ label: 'Homelab',  value: 'homelab'  },
{ label: 'Docker',   value: 'docker'   },
{ label: 'Hardware', value: 'hardware' },
```

**Nach dieser Änderung: Dev-Server neu starten.**

### Schritt 2 — `migration/import-to-payload.js` vollständig neu schreiben

#### 2a) Pfad-Handling

JSON-Datei mit `path.join(__dirname, 'posts-data.json')` laden (nicht `./migration/posts-data.json`). Das Skript muss aus dem Projektverzeichnis gestartet werden: `node migration/import-to-payload.js`.

#### 2b) Server-Readiness-Check

Payload 3.x hat **keinen** `/api/health`-Endpunkt. Stattdessen auf `/api/users` pollen:

```text
GET /api/users
→ 401 Unauthorized = Server läuft (Payload antwortet)
→ Connection refused = Server noch nicht bereit
```

Bis zu 30 Versuche mit 1s Pause.

#### 2c) Interactive Credentials via readline

```text
Ablauf beim Skriptstart:
  readline fragt: 📧 Email:    (sichtbar)
  readline fragt: 🔑 Passwort: (silent — kein Echo via raw mode)
```

- Keine Datei, kein Shell-History-Eintrag
- `process.stdin` in raw mode für Passwort

#### 2d) Authentifizierung

```text
POST /api/users/login
  Body: { email, password }
  → { token: "JWT eyJ..." }

GET /api/users/me
  Header: Authorization: JWT <token>
  → { user: { id: "abc123", ... } }   ← Payload 3.x response shape
```

Die User-ID wird als `author`-Wert für alle Posts verwendet.

**Bekannte Einschränkung:** Alle 13 Posts werden dem eingeloggten User zugewiesen, unabhängig vom originalen `author`-String in den JSON-Daten. Akzeptabel für eine Single-User-Blog-Migration.

**JWT-Expiry:** Kein Handling nötig für 13 Posts — Payload-Standard-JWT läuft nach 2h ab, der Import dauert Sekunden.

#### 2e) Content-Konvertierung: Markdown → Lexical JSON

Gesamter Markdown-String als einzelner Paragraph-Node:

```json
{
  "root": {
    "type": "root",
    "version": 1,
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "children": [
      {
        "type": "paragraph",
        "version": 1,
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "textFormat": 0,
        "textStyle": "",
        "children": [
          {
            "type": "text",
            "version": 1,
            "text": "<vollständiger Markdown-String>",
            "format": 0,
            "detail": 0,
            "mode": "normal",
            "style": ""
          }
        ]
      }
    ]
  }
}
```

**Bekannte Einschränkung:** Markdown-Sonderzeichen (`#`, `**`, Backticks) erscheinen im Admin-Panel als Rohtext. Kann manuell nachbearbeitet werden. Kein externer Parser nötig.

#### 2f) Datum-Normalisierung

`publishedAt` in den JSON-Daten ist ein Date-Only-String (`"2026-03-15"`). Payload erwartet ISO 8601 datetime. Normalisieren:

```js
publishedAt: post.publishedAt
  ? new Date(post.publishedAt).toISOString()
  : new Date().toISOString()
```

#### 2g) Excerpt-Validierung

`excerpt` hat `maxLength: 500`. Vor dem POST prüfen und ggf. truncaten:

```js
excerpt: (post.excerpt || '').length > 500
  ? (post.excerpt || '').slice(0, 497) + '...'
  : (post.excerpt || '')
```

#### 2h) POST mit Fehler-Logging

```text
POST /api/blog-posts
  Headers:
    Content-Type: application/json
    Authorization: JWT <token>
  Body:
    title, slug, excerpt (max 500), content (Lexical),
    category, tags: [{ tag: "wert" }, ...],
    status, publishedAt (ISO), featured,
    author (User-ID), featuredImage: null

Bei Fehler: Response-Body als JSON loggen (Payload gibt detaillierte errors[] zurück)
```

#### 2i) Idempotenz-Check (Slug)

```text
GET /api/blog-posts?where[slug][equals]=<encodeURIComponent(slug)>
→ docs.length > 0 → skip
```

URL-Encoding des Slugs mit `encodeURIComponent()`.

---

## Vollständiger Ablauf

```text
[Manuell] npm run dev → Server auf :3000
[Manuell] /admin → Admin-User anlegen
[Manuell] BlogPosts.ts → 3 Kategorien ergänzen → Server restart

node migration/import-to-payload.js
  ├─ JSON laden via __dirname
  ├─ Server-Readiness via GET /api/users (poll bis 200/401)
  ├─ 📧 Email eingeben
  ├─ 🔑 Passwort eingeben (silent)
  ├─ POST /api/users/login → JWT
  ├─ GET /api/users/me → { user: { id } }
  └─ Für jeden der 13 Posts:
       ├─ Slug prüfen (URL-encoded) → skip wenn existiert
       ├─ excerpt truncaten auf 500
       ├─ publishedAt → ISO 8601
       ├─ content → Lexical JSON wrappen
       └─ POST /api/blog-posts (mit JWT, featuredImage: null)
            ├─ Erfolg: ✓ Imported: <title>
            └─ Fehler: ✗ Failed: <title> + vollständiger Response-Body
  └─ Summary: imported / skipped / failed
```

---

## Dateien die geändert werden

| Datei                              | Änderung                      |
|------------------------------------|-------------------------------|
| `collections/BlogPosts.ts`         | 3 Kategorien ergänzen         |
| `migration/import-to-payload.js`   | Vollständig neu geschrieben   |

---

## Nicht im Scope

- Bilder / Media Collection — separater Schritt
- Autoren-Zuordnung pro Post (alle Posts → Import-User)
- Markdown-zu-Lexical Vollkonvertierung (bewusst vereinfacht)
- Production Deployment

---

## Erfolgskriterien

- [ ] Alle 13 Posts landen in der Payload Datenbank
- [ ] Kein HTTP 401 / 403 während des Imports
- [ ] Kein Validation Error für `author`, `content`, `category`, `publishedAt`, `excerpt`
- [ ] Script ist idempotent (zweiter Lauf skipped alle Posts)
- [ ] Keine Credentials in Code oder Dateien
- [ ] Fehler werden mit vollständigem Response-Body geloggt
