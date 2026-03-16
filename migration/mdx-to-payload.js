const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// MDX frontmatter parser
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  try {
    return yaml.load(match[1]) || {};
  } catch (e) {
    console.error('YAML parse error:', e);
    return {};
  }
}

// Get content after frontmatter
function getContent(content) {
  const match = content.match(/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/);
  return match ? match[1].trim() : content;
}

// Main function
async function migratePosts() {
  const postsDir = path.join(process.cwd(), 'content/posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
  
  const posts = [];
  
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    const mdxContent = getContent(content);
    
    const slug = file.replace('.mdx', '');
    
    posts.push({
      title: frontmatter.title || 'Untitled',
      slug: slug,
      excerpt: frontmatter.excerpt || '',
      content: mdxContent,
      category: frontmatter.category || 'news',
      tags: frontmatter.tags || [],
      author: frontmatter.author || 'AI',
      publishedAt: frontmatter.publishedAt || frontmatter.date || new Date().toISOString(),
      featuredImage: frontmatter.image || null,
      status: 'published',
      featured: frontmatter.featured || false,
    });
  }
  
  console.log(`Found ${posts.length} posts to migrate`);
  
  // Save to JSON for import
  fs.writeFileSync('migration/posts-data.json', JSON.stringify(posts, null, 2));
  console.log('Posts data saved to migration/posts-data.json');
  
  return posts;
}

migratePosts().catch(console.error);
