#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PAYLOAD_URL = 'http://localhost:3000';
const XAI_API_KEY = process.env.XAI_API_KEY;

// ─── Helpers ────────────────────────────────────────────────────────────────

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
      rl.question(question, answer => { rl.close(); resolve(answer); });
    }
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Auth ────────────────────────────────────────────────────────────────────

async function login(email, password) {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login fehlgeschlagen (${res.status})`);
  const data = await res.json();
  return data.token;
}

// ─── Payload ─────────────────────────────────────────────────────────────────

async function getAllPosts(token) {
  const res = await fetch(
    `${PAYLOAD_URL}/api/blog-posts?limit=0&depth=0`,
    { headers: { Authorization: `JWT ${token}` } }
  );
  if (!res.ok) throw new Error(`Posts laden fehlgeschlagen (${res.status})`);
  const data = await res.json();
  return data.docs;
}

async function uploadMediaFromUrl(imageUrl, filename, token) {
  // Bild herunterladen
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Bild-Download fehlgeschlagen (${imgRes.status})`);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  // Als Multipart an Payload hochladen
  const { FormData, Blob } = require('buffer') && globalThis;
  const formData = new FormData();
  const altText = filename.replace(/-/g, ' ').replace('.jpg', '');
  formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), filename);
  formData.append('_payload', JSON.stringify({ alt: altText }));

  const res = await fetch(`${PAYLOAD_URL}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Media-Upload fehlgeschlagen (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.doc?.id ?? data.id;
}

async function updatePostImage(postId, mediaId, token) {
  const res = await fetch(`${PAYLOAD_URL}/api/blog-posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({ featuredImage: mediaId }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Post-Update fehlgeschlagen (${res.status}): ${err.slice(0, 200)}`);
  }
}

// ─── Grok Aurora ─────────────────────────────────────────────────────────────

const CATEGORY_STYLE = {
  'homelab':     'homelab server rack with glowing LEDs, dark background, cyberpunk aesthetic',
  'docker':      'Docker containers floating in digital space, blue geometric shapes, tech aesthetic',
  'hardware':    'computer hardware components, circuit boards, clean studio photography',
  'ai-tools':    'artificial intelligence neural network visualization, purple and blue neon',
  'development': 'software code on dark screen, developer workspace, modern tech',
  'design':      'UI/UX design interface, minimalist, clean lines, modern aesthetic',
  'news':        'abstract tech news background, digital newspaper, modern',
  'tutorial':    'step by step tech tutorial, digital learning, clean infographic style',
};

function buildPrompt(post) {
  const style = CATEGORY_STYLE[post.category] || 'modern technology, clean professional';
  return `Professional tech blog cover image for article: "${post.title}". Style: ${style}. Cinematic lighting, high quality, 16:9 aspect ratio. NO TEXT, NO WORDS, NO LETTERS in the image.`;
}

async function generateImage(prompt) {
  const res = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-imagine-image',
      prompt,
      n: 1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok Aurora API Fehler (${res.status}): ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const url = data.data?.[0]?.url;
  if (!url) throw new Error(`Kein Bild-URL in Response: ${JSON.stringify(data).slice(0, 200)}`);
  return url;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!XAI_API_KEY) {
    console.error('❌ XAI_API_KEY nicht gesetzt. Bitte in .env.local eintragen.');
    process.exit(1);
  }

  console.log('\n🎨 Grok Aurora — Blog Post Bilder Generator\n');

  const email    = await prompt('📧 Email:    ');
  const password = await prompt('🔑 Passwort: ', true);

  console.log('\n🔐 Anmelden...');
  const token = await login(email, password);
  console.log('✓ Eingeloggt\n');

  const posts = await getAllPosts(token);
  const withoutImage = posts.filter(p => !p.featuredImage);
  const withImage    = posts.filter(p =>  p.featuredImage);

  console.log(`📊 Posts gesamt:       ${posts.length}`);
  console.log(`✅ Bereits mit Bild:   ${withImage.length}`);
  console.log(`🎨 Bilder zu generieren: ${withoutImage.length}\n`);

  if (withoutImage.length === 0) {
    console.log('🎉 Alle Posts haben bereits ein Bild!');
    return;
  }

  let done = 0, failed = 0;

  for (const post of withoutImage) {
    try {
      const imagePrompt = buildPrompt(post);
      process.stdout.write(`🎨 ${post.title.slice(0, 60)}...\n   → Generiere Bild...`);

      const imageUrl = await generateImage(imagePrompt);
      process.stdout.write(' ✓\n   → Lade hoch...');

      const filename = `${post.slug.slice(0, 50)}.jpg`;
      const mediaId = await uploadMediaFromUrl(imageUrl, filename, token);
      process.stdout.write(` ✓ (Media ID: ${mediaId})\n   → Aktualisiere Post...`);

      await updatePostImage(post.id, mediaId, token);
      process.stdout.write(' ✓\n\n');

      done++;
      // Rate limiting — Grok Aurora braucht etwas Pause
      await sleep(3000);
    } catch (err) {
      process.stdout.write(` ✗\n`);
      console.error(`   ❌ Fehler: ${err.message}\n`);
      failed++;
      await sleep(1000);
    }
  }

  console.log('═══════════════════════════════');
  console.log(`✓  Generiert:    ${done}`);
  console.log(`✗  Fehlgeschlagen: ${failed}`);
  console.log('═══════════════════════════════\n');

  if (failed > 0) {
    console.error('⚠️  Einige Bilder konnten nicht generiert werden.');
    process.exit(1);
  }
  console.log('🎉 Alle Bilder erfolgreich generiert und eingebaut!');
}

main().catch(err => {
  console.error('\n❌ Abgebrochen:', err.message);
  process.exit(1);
});
