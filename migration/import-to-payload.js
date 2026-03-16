#!/usr/bin/env node

/**
 * Import MDX Posts to Payload CMS
 */

const fs = require('fs');
const postsData = JSON.parse(fs.readFileSync('./migration/posts-data.json', 'utf8'));
const PAYLOAD_URL = 'http://localhost:3000';

async function waitForServer() {
  let retries = 0;
  const maxRetries = 30;
  while (retries < maxRetries) {
    try {
      const response = await fetch(`${PAYLOAD_URL}/api/health`);
      if (response.ok) { console.log('✓ Server ready'); return true; }
    } catch (e) {}
    retries++;
    console.log(`Waiting for server... (${retries}/${maxRetries})`);
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Server not ready');
}

async function checkPostExists(slug) {
  try {
    const response = await fetch(`${PAYLOAD_URL}/api/blog-posts?where[slug][equals]=${slug}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.docs?.length > 0 ? data.docs[0] : null;
  } catch (error) { return null; }
}

async function createPost(post) {
  const payload = {
    title: post.title, slug: post.slug, excerpt: post.excerpt || '',
    content: post.content || '', category: post.category || 'news',
    tags: (post.tags || []).map(tag => ({ tag })), status: post.status || 'published',
    publishedAt: post.publishedAt || new Date().toISOString(), featured: post.featured || false, author: null,
  };
  try {
    const response = await fetch(`${PAYLOAD_URL}/api/blog-posts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log(`✓ Imported: ${post.title}`);
    return await response.json();
  } catch (error) {
    console.error(`✗ Failed: ${post.title}: ${error.message}`); throw error;
  }
}

async function importAll() {
  console.log(`\n🚀 Importing ${postsData.length} posts to Payload...\n`);
  await waitForServer();
  let imported = 0, skipped = 0, failed = 0;
  for (const post of postsData) {
    try {
      const existing = await checkPostExists(post.slug);
      if (existing) { console.log(`⏭  Skipping: ${post.title}`); skipped++; continue; }
      await createPost(post); imported++;
      await new Promise(r => setTimeout(r, 200));
    } catch (error) { failed++; }
  }
  console.log(`\n=== Summary ===`);
  console.log(`✓ Imported: ${imported} | ⏭ Skipped: ${skipped} | ✗ Failed: ${failed}`);
  console.log(`\n🎉 Done!`);
}

importAll().catch(e => { console.error('\n❌ Import failed:', e.message); process.exit(1); });
