#!/usr/bin/env node
import { put } from '@vercel/blob';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = path.join(__dirname, '..', 'public', 'media');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN nicht gesetzt');
  process.exit(1);
}

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

async function main() {
  console.log('\n☁️  Upload Media → Vercel Blob\n');

  const files = await readdir(MEDIA_DIR);
  const imageFiles = files.filter(f => Object.keys(MIME_TYPES).some(ext => f.endsWith(ext)));

  console.log(`📁 ${imageFiles.length} Dateien gefunden\n`);

  let done = 0, failed = 0;

  for (const filename of imageFiles) {
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'image/jpeg';
    const filePath = path.join(MEDIA_DIR, filename);

    try {
      process.stdout.write(`  → ${filename.slice(0, 60)}...`);
      const buffer = await readFile(filePath);

      const blob = await put(`media/${filename}`, buffer, {
        access: 'public',
        contentType,
        token: BLOB_TOKEN,
        addRandomSuffix: false,
      });

      process.stdout.write(` ✓\n`);
      done++;
    } catch (err) {
      process.stdout.write(` ✗\n`);
      console.error(`     ❌ ${err.message}\n`);
      failed++;
    }
  }

  console.log('\n═══════════════════════════════');
  console.log(`✓  Hochgeladen: ${done}`);
  console.log(`✗  Fehlgeschlagen: ${failed}`);
  console.log('═══════════════════════════════\n');

  if (failed > 0) process.exit(1);
  console.log('🎉 Alle Bilder in Vercel Blob!');
}

main().catch(err => {
  console.error('❌ Abgebrochen:', err.message);
  process.exit(1);
});
