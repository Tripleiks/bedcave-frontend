# Payload CMS MDX-Migration via REST API Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 13 MDX-Posts aus `migration/posts-data.json` via Payload REST API mit JWT-Authentifizierung in die Datenbank importieren.

**Architecture:** Das Import-Skript (`migration/import-to-payload.js`) wird vollständig neu geschrieben: interaktiver Credential-Prompt (kein Passwortspeicher), JWT-Login via `/api/users/login`, Markdown→Lexical-Konvertierung, und idempotenter POST je Post. Zuvor werden 3 fehlende Kategorien in `collections/BlogPosts.ts` ergänzt.

**Tech Stack:** Node.js 25 (CommonJS), Payload CMS 3.79.1, SQLite, Next.js 16 dev server

---

## Chunk 1: Collection-Erweiterung und Skript-Grundgerüst

### Task 1: Fehlende Kategorien in BlogPosts ergänzen

**Files:**

- Modify: `collections/BlogPosts.ts`

> Diese Änderung MUSS vor dem ersten Import-Run aktiv sein. Ohne sie schlägt jeder POST für `homelab`, `docker`, `hardware` mit einem Validation Error fehl.

- [ ] **Step 1.1: Kategorien ergänzen**

Öffne `collections/BlogPosts.ts`. Das `category`-Feld hat aktuell diese Options-Liste:

```ts
options: [
  { label: 'AI Tools', value: 'ai-tools' },
  { label: 'Development', value: 'development' },
  { label: 'Design', value: 'design' },
  { label: 'News', value: 'news' },
  { label: 'Tutorial', value: 'tutorial' },
],
```

Erweitere sie auf:

```ts
options: [
  { label: 'AI Tools',   value: 'ai-tools'   },
  { label: 'Development', value: 'development' },
  { label: 'Design',     value: 'design'     },
  { label: 'News',       value: 'news'       },
  { label: 'Tutorial',   value: 'tutorial'   },
  { label: 'Homelab',    value: 'homelab'    },
  { label: 'Docker',     value: 'docker'     },
  { label: 'Hardware',   value: 'hardware'   },
],
```

- [ ] **Step 1.2: TypeScript-Fehler prüfen**

```bash
cd /Users/heino/GitHub/bedcave-frontend
npx tsc --noEmit 2>&1 | head -20
```

Erwartetes Ergebnis: keine Fehler (oder nur vorhandene, nicht neue).

- [ ] **Step 1.3: Committen**

```bash
git add collections/BlogPosts.ts
git commit -m "feat: add homelab, docker, hardware categories to BlogPosts"
```

---

### Task 2: Import-Skript Grundgerüst schreiben

**Files:**

- Rewrite: `migration/import-to-payload.js`

Das bestehende Skript wird vollständig ersetzt. Wir bauen es in Teilen auf.

- [ ] **Step 2.1: Grundgerüst mit Konstanten und Hilfsfunktionen schreiben**

Ersetze den gesamten Inhalt von `migration/import-to-payload.js` mit:

```js
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PAYLOAD_URL = 'http://localhost:3000';
// postsData wird in main() geladen, damit require() keine Seiteneffekte hat
// (wichtig für Smoke-Tests und zukünftige Unit-Tests)

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wartet darauf dass der Payload-Server antwortet.
 * Payload 3.x hat keinen /api/health — GET /api/users gibt 401 zurück wenn der Server läuft.
 */
async function waitForServer() {
  const maxRetries = 30;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(`${PAYLOAD_URL}/api/users`);
      // 401 = Server läuft, kein Fehler — Payload verlangt Auth für diese Route
      if (res.status === 401 || res.ok) {
        console.log('✓ Server bereit');
        return;
      }
    } catch (_) {
      // Connection refused — Server noch nicht da
    }
    console.log(`Warte auf Server... (${i}/${maxRetries})`);
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Server nicht erreichbar nach 30 Versuchen');
}

/**
 * Fragt eine Zeile interaktiv ab. Für das Passwort wird kein Echo angezeigt.
 */
function prompt(question, silent = false) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: silent ? null : process.stdout,
      terminal: true,
    });

    if (silent) {
      process.stdout.write(question);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      let input = '';
      process.stdin.on('data', function handler(char) {
        if (char === '\r' || char === '\n') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', handler);
          process.stdout.write('\n');
          rl.close();
          resolve(input);
        } else if (char === '\u0003') {
          // Ctrl+C
          process.exit();
        } else if (char === '\u007f') {
          // Backspace
          if (input.length > 0) input = input.slice(0, -1);
        } else {
          input += char;
        }
      });
    } else {
      rl.question(question, answer => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

/**
 * Konvertiert einen Markdown-String in ein minimales Lexical-JSON-Dokument.
 * Der gesamte Text wird als einzelner Paragraph-Node eingewickelt.
 * Markdown-Formatierung bleibt als Rohtext erhalten (kann im Admin-Panel nachbearbeitet werden).
 */
function markdownToLexical(markdown) {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text',
              version: 1,
              text: markdown || '',
              format: 0,
              detail: 0,
              mode: 'normal',
              style: '',
            },
          ],
        },
      ],
    },
  };
}

/**
 * Truncated excerpt auf maximal 500 Zeichen (BlogPosts maxLength: 500).
 */
function truncateExcerpt(text) {
  if (!text) return '';
  return text.length > 500 ? text.slice(0, 497) + '...' : text;
}

/**
 * Normalisiert ein Date-Only-String ("2026-03-15") zu ISO 8601 datetime.
 */
function toISODateTime(dateString) {
  if (!dateString) return new Date().toISOString();
  return new Date(dateString).toISOString();
}

module.exports = { waitForServer, prompt, markdownToLexical, truncateExcerpt, toISODateTime };
```

- [ ] **Step 2.2: Hilfsfunktionen im Node-REPL smoke-testen**

```bash
cd /Users/heino/GitHub/bedcave-frontend
node -e "
const assert = require('node:assert');
const { markdownToLexical, truncateExcerpt, toISODateTime } = require('./migration/import-to-payload.js');

// Test markdownToLexical
const result = markdownToLexical('# Hello\n**World**');
assert.strictEqual(result.root.type, 'root', 'root.type');
assert.strictEqual(result.root.children[0].type, 'paragraph', 'paragraph.type');
assert.strictEqual(result.root.children[0].textFormat, 0, 'paragraph.textFormat');
assert.strictEqual(result.root.children[0].children[0].text, '# Hello\n**World**', 'text.content');

// Test truncateExcerpt
assert.strictEqual(truncateExcerpt('a'.repeat(501)), 'a'.repeat(497) + '...', 'truncate >500');
assert.strictEqual(truncateExcerpt('short'), 'short', 'no truncate <500');
assert.strictEqual(truncateExcerpt('a'.repeat(500)), 'a'.repeat(500), 'no truncate =500');

// Test toISODateTime
const iso = toISODateTime('2026-03-15');
assert.ok(iso.includes('T'), 'ISO has T separator');
assert.ok(iso.endsWith('Z'), 'ISO ends with Z');

console.log('✓ Alle Hilfsfunktionen korrekt');
"
```

Erwartete Ausgabe: `✓ Alle Hilfsfunktionen korrekt`

Bei Fehler wirft `node:assert` einen `AssertionError` und beendet den Prozess mit Exit-Code 1 — dann die entsprechende Funktion korrigieren und wiederholen.

- [ ] **Step 2.3: Committen**

```bash
git add migration/import-to-payload.js
git commit -m "feat: add lexical converter, prompt, and helper utilities to import script"
```

---

## Chunk 2: Authentifizierung und Import-Loop

### Task 3: Auth-Funktionen schreiben

**Files:**

- Modify: `migration/import-to-payload.js`

> In diesem Task fügen wir Login, /me-Abfrage, und den Slug-Check hinzu.

- [ ] **Step 3.1: Auth-Funktionen an das Ende der Datei anfügen**

Ersetze die letzte Zeile `module.exports = ...` durch den folgenden vollständigen Block (der die Exports am Ende erweitert):

```js
// ─── Auth ───────────────────────────────────────────────────────────────────

/**
 * Meldet sich bei Payload an und gibt den JWT-Token zurück.
 */
async function login(email, password) {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Login fehlgeschlagen (${res.status}): ${JSON.stringify(body)}`);
  }
  const data = await res.json();
  return data.token;
}

/**
 * Gibt die ID des aktuell eingeloggten Users zurück.
 * Payload 3.x response shape: { user: { id, email, ... } }
 */
async function getMyUserId(token) {
  const res = await fetch(`${PAYLOAD_URL}/api/users/me`, {
    headers: { Authorization: `JWT ${token}` },
  });
  if (!res.ok) throw new Error(`/api/users/me fehlgeschlagen (${res.status})`);
  const data = await res.json();
  if (!data.user?.id) throw new Error('User-ID nicht in Response gefunden');
  return data.user.id;
}

/**
 * Prüft ob ein Post mit diesem Slug bereits existiert (idempotency guard).
 * Gibt den existierenden Post zurück oder null.
 */
async function findPostBySlug(slug) {
  const encodedSlug = encodeURIComponent(slug);
  const res = await fetch(
    `${PAYLOAD_URL}/api/blog-posts?where[slug][equals]=${encodedSlug}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.docs?.length > 0 ? data.docs[0] : null;
}

module.exports = {
  waitForServer, prompt, markdownToLexical, truncateExcerpt,
  toISODateTime, login, getMyUserId, findPostBySlug,
};
```

- [ ] **Step 3.2: Auth-Funktionen auf Exports prüfen**

```bash
cd /Users/heino/GitHub/bedcave-frontend
node -e "
const m = require('./migration/import-to-payload.js');
const required = ['waitForServer','prompt','markdownToLexical','truncateExcerpt','toISODateTime','login','getMyUserId','findPostBySlug'];
required.forEach(fn => {
  console.assert(typeof m[fn] === 'function', fn + ' ist nicht exportiert');
});
console.log('✓ Alle Funktionen exportiert');
"
```

Erwartete Ausgabe: `✓ Alle Funktionen exportiert`

- [ ] **Step 3.3: Committen**

```bash
git add migration/import-to-payload.js
git commit -m "feat: add JWT auth, user-me, and slug-check functions to import script"
```

---

### Task 4: Import-Loop und `main`-Funktion schreiben

**Files:**

- Modify: `migration/import-to-payload.js`

- [ ] **Step 4.1: `createPost`-Funktion und `main` anfügen**

Ersetze die letzte `module.exports = ...`-Zeile durch:

```js
// ─── Import ──────────────────────────────────────────────────────────────────

/**
 * Erstellt einen einzelnen Post via Payload REST API.
 * Loggt bei Fehler den vollständigen Response-Body (Payload gibt errors[] zurück).
 */
async function createPost(post, token, authorId) {
  const body = {
    title: post.title,
    slug: post.slug,
    // excerpt ist required: true in der Collection → leerer String würde Validation-Fehler auslösen
    excerpt: truncateExcerpt(post.excerpt) || (() => { throw new Error(`Post "${post.title}" hat kein excerpt`); })(),
    content: markdownToLexical(post.content || ''),
    category: post.category || 'news',
    tags: (post.tags || []).map(tag => ({ tag })),
    status: post.status || 'published',
    publishedAt: toISODateTime(post.publishedAt),
    featured: post.featured || false,
    author: authorId,
    // featuredImage weglassen wenn null — explizit null zu senden kann Payload-Validation auslösen
    ...(post.featuredImage ? { featuredImage: post.featuredImage } : {}),
  };

  const res = await fetch(`${PAYLOAD_URL}/api/blog-posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'Kein JSON in Response' }));
    console.error(`  → HTTP ${res.status}:`, JSON.stringify(errorBody, null, 2));
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Posts-Daten hier laden (nicht im Top-Level), damit require() keine Seiteneffekte hat
  const postsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'posts-data.json'), 'utf8')
  );

  console.log('\n🚀 Payload CMS — MDX Import\n');

  await waitForServer();

  const email    = await prompt('📧 Email:    ');
  const password = await prompt('🔑 Passwort: ', true);

  console.log('\n🔐 Anmelden...');
  const token    = await login(email, password);
  const authorId = await getMyUserId(token);
  console.log(`✓ Eingeloggt (User-ID: ${authorId})\n`);

  let imported = 0, skipped = 0, failed = 0;

  for (const post of postsData) {
    try {
      const existing = await findPostBySlug(post.slug);
      if (existing) {
        console.log(`⏭  Übersprungen: ${post.title}`);
        skipped++;
        continue;
      }

      await createPost(post, token, authorId);
      console.log(`✓  Importiert:   ${post.title}`);
      imported++;

      // Kurze Pause damit SQLite nicht überlastet wird
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`✗  Fehlgeschlagen: ${post.title} — ${err.message}`);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════');
  console.log(`✓  Importiert:   ${imported}`);
  console.log(`⏭  Übersprungen: ${skipped}`);
  console.log(`✗  Fehlgeschlagen: ${failed}`);
  console.log('═══════════════════════════════\n');

  if (failed > 0) {
    console.error('❌ Import mit Fehlern abgeschlossen.');
    process.exit(1);
  }
  console.log('🎉 Import erfolgreich abgeschlossen!');
}

module.exports = {
  waitForServer, prompt, markdownToLexical, truncateExcerpt,
  toISODateTime, login, getMyUserId, findPostBySlug, createPost,
};

// Nur ausführen wenn direkt aufgerufen (nicht bei require() in Tests)
if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ Import abgebrochen:', err.message);
    process.exit(1);
  });
}
```

- [ ] **Step 4.2: Syntax-Check**

```bash
cd /Users/heino/GitHub/bedcave-frontend
node --check migration/import-to-payload.js && echo "✓ Syntax OK"
```

Erwartete Ausgabe: `✓ Syntax OK`

- [ ] **Step 4.3: Exports nochmals prüfen**

```bash
node -e "
const m = require('./migration/import-to-payload.js');
const required = ['waitForServer','prompt','markdownToLexical','truncateExcerpt',
  'toISODateTime','login','getMyUserId','findPostBySlug','createPost'];
required.forEach(fn => {
  console.assert(typeof m[fn] === 'function', fn + ' fehlt');
});
console.log('✓ Alle', required.length, 'Funktionen exportiert');
"
```

Erwartete Ausgabe: `✓ Alle 9 Funktionen exportiert`

- [ ] **Step 4.4: Committen**

```bash
git add migration/import-to-payload.js
git commit -m "feat: add createPost and main import loop to migration script"
```

---

## Chunk 3: Manueller End-to-End Test

### Task 5: Admin-User anlegen und Import ausführen

> **Voraussetzungen:** Tasks 1–4 abgeschlossen. Dev-Server gestoppt.

- [ ] **Step 5.1: Dev-Server starten (Terminal 1)**

```bash
cd /Users/heino/GitHub/bedcave-frontend
npm run dev
```

Warten bis die Ausgabe erscheint:

```text
▲ Next.js 16.x
- Local: http://localhost:3000
✓ Ready in Xs
```

- [ ] **Step 5.2: Admin-User anlegen**

Browser öffnen: `http://localhost:3000/admin`

Payload zeigt beim ersten Start den "Create First User"-Dialog.

Felder ausfüllen:

- Email: `admin@bedcave.de` (oder eigene Email)
- Password: sicheres Passwort wählen
- Name: `Admin`

Auf "Create" klicken. Payload leitet zum Admin-Dashboard weiter — das bedeutet die Datenbank ist bereit.

- [ ] **Step 5.3: Import-Skript ausführen (Terminal 2)**

```bash
cd /Users/heino/GitHub/bedcave-frontend
node migration/import-to-payload.js
```

Erwartet:

```text
🚀 Payload CMS — MDX Import

✓ Server bereit
📧 Email:    admin@bedcave.de
🔑 Passwort:

🔐 Anmelden...
✓ Eingeloggt (User-ID: <id>)

✓  Importiert:   007 First Light: ...
✓  Importiert:   ...
[... 13 Zeilen ...]

═══════════════════════════════
✓  Importiert:   13
⏭  Übersprungen: 0
✗  Fehlgeschlagen: 0
═══════════════════════════════

🎉 Import erfolgreich abgeschlossen!
```

Bei Fehlern: Der vollständige Response-Body erscheint direkt unter dem fehlgeschlagenen Post. Häufigste Ursachen:

- `"category is not a valid option"` → Schritt 1.1 wurde nicht korrekt ausgeführt oder Server nach der Änderung nicht neu gestartet
- `"author: This field is required"` → `/api/users/me` liefert keine User-ID — Login-Credentials prüfen

- [ ] **Step 5.4: Idempotenz-Test**

```bash
node migration/import-to-payload.js
```

Alle 13 Posts müssen übersprungen werden:

```text
⏭  Übersprungen: <post-title>
[... 13 Zeilen ...]
✓  Importiert:   0
⏭  Übersprungen: 13
✗  Fehlgeschlagen: 0
```

- [ ] **Step 5.5: Im Payload Admin-Panel verifizieren**

Browser: `http://localhost:3000/admin`

Navigation: `Blog Posts` in der linken Sidebar

Erwartetes Ergebnis:

- 13 Einträge sichtbar
- Alle haben Status `published` (oder `draft` je nach Quelle)
- `author`-Feld zeigt den angelegten Admin-User
- `category`-Werte sind korrekt gesetzt

- [ ] **Step 5.6: MIGRATION_STATUS.md aktualisieren**

Ändere in `MIGRATION_STATUS.md`:

```markdown
## 🔄 In Arbeit  →  ## ✅ Abgeschlossen

### MDX-Posts Import
**Status:** ✅ 13 Posts erfolgreich importiert
**Datum:** 16. März 2026
```

Und den Fortschrittsbalken:

```text
[████████████████████] 90%

✅ Installation & Setup
✅ Collections definiert
✅ Datenbank initialisiert
✅ MDX-Posts extrahiert
✅ Posts importiert
⏳ Frontend anpassen
⏳ Testing & Deployment
```

- [ ] **Step 5.7: Abschließend committen**

```bash
git add MIGRATION_STATUS.md
git commit -m "docs: mark MDX import as completed in migration status"
```

---

## Zusammenfassung

| Task                    | Dateien                           | Aufwand |
|-------------------------|-----------------------------------|---------|
| 1 — Kategorien ergänzen | `collections/BlogPosts.ts`        | 2 min   |
| 2 — Hilfsfunktionen     | `migration/import-to-payload.js`  | 10 min  |
| 3 — Auth-Funktionen     | `migration/import-to-payload.js`  | 5 min   |
| 4 — Import-Loop         | `migration/import-to-payload.js`  | 10 min  |
| 5 — E2E-Test            | manuell                           | 5 min   |

**Nicht im Scope dieses Plans:** Media/Bilder-Import, Frontend-Anpassung, Production Deployment.
