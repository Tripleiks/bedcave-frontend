#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PAYLOAD_URL = 'http://localhost:3000';
// postsData wird in main() geladen, damit require() keine Seiteneffekte hat

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
      if (res.status === 401 || res.status === 403 || res.ok) {
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
          process.exit();
        } else if (char === '\u007f') {
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
