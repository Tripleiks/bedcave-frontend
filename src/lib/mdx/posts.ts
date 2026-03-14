import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: string;
  readingTime: number;
  sources?: string[];
  aiModel?: string;
  sticky?: boolean;
}

const postsDirectory = path.join(process.cwd(), 'content/posts');

export function getAllPosts(): Post[] {
  // Ensure directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  // Recursively get all .mdx files from posts directory and subdirectories
  // EXCLUDE: archive/ folder (archived posts should not appear on site)
  function getMdxFiles(dir: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // Skip archive directory
      if (item.isDirectory() && item.name === 'archive') {
        continue;
      }
      
      if (item.isDirectory()) {
        files.push(...getMdxFiles(fullPath));
      } else if (item.name.endsWith('.mdx') || item.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  const mdxFiles = getMdxFiles(postsDirectory);
  const allPosts = mdxFiles
    .map((fullPath) => {
      // Create slug from relative path (e.g., "generated/filename" -> "generated-filename")
      const relativePath = path.relative(postsDirectory, fullPath);
      const slug = relativePath
        .replace(/\\/g, '/') // Windows path fix
        .replace(/\.mdx?$/, '')
        .replace(/\//g, '-');
      
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      // Calculate reading time
      const wordsPerMinute = 200;
      const wordCount = content.split(/\s+/g).length;
      const readingTime = Math.ceil(wordCount / wordsPerMinute);

      return {
        slug,
        title: data.title || slug,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        excerpt: data.excerpt || content.slice(0, 200).replace(/#.*\n/g, '').trim() + '...',
        content,
        coverImage: data.coverImage,
        category: data.category || 'General',
        tags: data.tags || [],
        author: data.author || 'Bedcave Team',
        readingTime,
        sources: data.sources || [],
        aiModel: data.aiModel,
        sticky: data.sticky || false,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return allPosts;
}

export function getPostBySlug(slug: string): Post | null {
  try {
    // First try direct path (legacy posts)
    let fullPath = path.join(postsDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(postsDirectory, `${slug}.md`);
    }
    
    // If not found, search recursively in subdirectories (exclude archive)
    if (!fs.existsSync(fullPath)) {
      function findMdxFile(dir: string, targetSlug: string): string | null {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const itemPath = path.join(dir, item.name);
          
          // Skip archive directory
          if (item.isDirectory() && item.name === 'archive') {
            continue;
          }
          
          if (item.isDirectory()) {
            const found = findMdxFile(itemPath, targetSlug);
            if (found) return found;
          } else if (item.name.endsWith('.mdx') || item.name.endsWith('.md')) {
            // Create slug from relative path to check match
            const relativePath = path.relative(postsDirectory, itemPath);
            const itemSlug = relativePath
              .replace(/\\/g, '/')
              .replace(/\.mdx?$/, '')
              .replace(/\//g, '-');
            if (itemSlug === targetSlug) {
              return itemPath;
            }
          }
        }
        return null;
      }
      
      const foundPath = findMdxFile(postsDirectory, slug);
      if (!foundPath) {
        return null;
      }
      fullPath = foundPath;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Calculate reading time
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/g).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    return {
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      excerpt: data.excerpt || content.slice(0, 200).replace(/#.*\n/g, '').trim() + '...',
      content,
      coverImage: data.coverImage,
      category: data.category || 'General',
      tags: data.tags || [],
      author: data.author || 'Bedcave Team',
      readingTime,
      sources: data.sources || [],
      aiModel: data.aiModel,
      sticky: data.sticky || false,
    };
  } catch {
    return null;
  }
}

export function getCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.map((post) => post.category));
  return Array.from(categories);
}

export function getPostsByCategory(category: string): Post[] {
  const posts = getAllPosts();
  return posts.filter((post) => post.category.toLowerCase() === category.toLowerCase());
}
