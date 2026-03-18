# Payload CMS Migration Status

**Projekt:** Bedcave Frontend
**Abgeschlossen:** 17. März 2026
**Status:** ✅ Migration vollständig — Live auf bedcave.com

---

## Abgeschlossene Schritte

### 1. Payload CMS Installation & Konfiguration

- Payload CMS 3.79.1 mit SQLite-Adapter
- Collections: `Users`, `BlogPosts`, `Pages`, `Media`
- Globals: `Privacy`, `Legal`
- Vercel Blob Storage Plugin (nur in Production aktiv)
- Turso (libSQL) als Production-Datenbank

### 2. Daten-Migration (MDX → Payload)

- 13 Blog-Posts aus MDX-Dateien importiert
- 52 Bilder nach Vercel Blob hochgeladen (`migration/upload-media-to-blob.mjs`)
- 1 Admin-User angelegt

### 3. Frontend-Anpassung

- `/blog` — neue Übersichtsseite für alle Posts
- `/blog/[slug]` — Post-Detail über Payload Local API
- `/privacy` — Inhalt aus Payload Global `privacy`
- `/legal` — Inhalt aus Payload Global `legal`
- Footer-Link „new post" → `/admin`

### 4. AI Generator — Payload Integration

- `/dashboard/ai-generator` publiziert jetzt direkt in Payload CMS
- Neuer API-Endpunkt: `/api/payload/publish`
- Bild-Upload und Post-Erstellung über Payload Local API

### 5. Production Deployment

- Turso-Datenbank: `libsql://bedcave-tripleiks.aws-eu-west-1.turso.io`
- Vercel Blob Store: `bedcave-media`
- Alle Env Vars in Vercel gesetzt
- `.npmrc` mit `legacy-peer-deps=true` für Next.js 16 Canary-Kompatibilität
- `next.config.mjs` mit Blob-Hostname (`*.public.blob.vercel-storage.com`)

---

## Offene Punkte

- **Privacy & Legal Inhalte** — müssen manuell im Payload Admin (`/admin`) befüllt werden

---

## Migration Scripts (in `migration/`, zur Referenz)

| Script | Zweck |
| ------ | ----- |
| `mdx-to-payload.js` | MDX-Dateien parsen und extrahieren |
| `import-to-payload.js` | Posts in Payload importieren |
| `generate-post-images.js` | Titelbilder per Grok Aurora generieren |
| `upload-media-to-blob.mjs` | Lokale Bilder nach Vercel Blob hochladen |
| `seed-globals.js` | Privacy/Legal Globals mit Beispielinhalten befüllen |
