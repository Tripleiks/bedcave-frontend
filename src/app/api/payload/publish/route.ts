import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

function markdownToLexical(markdown: string) {
  return {
    root: {
      type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
      children: [{
        type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
        textFormat: 0, textStyle: '',
        children: [{
          type: 'text', version: 1, text: markdown || '',
          format: 0, detail: 0, mode: 'normal', style: '',
        }],
      }],
    },
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 60);
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, tags, excerpt, imageUrl, sticky } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content required' }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Get author (first user in system)
    const users = await payload.find({ collection: 'users', limit: 1, overrideAccess: true });
    const authorId = users.docs[0]?.id;
    if (!authorId) {
      return NextResponse.json({ error: 'No users found in Payload' }, { status: 500 });
    }

    // Upload cover image if provided
    let mediaId: string | number | undefined;
    if (imageUrl) {
      try {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          const filename = `${generateSlug(title)}-${Date.now()}.jpg`;

          const media = await payload.create({
            collection: 'media',
            data: { alt: title },
            file: { data: buffer, mimetype: 'image/jpeg', name: filename, size: buffer.length },
            overrideAccess: true,
          });
          mediaId = media.id;
        }
      } catch (err) {
        console.warn('[Payload Publish] Image upload failed (non-critical):', err);
      }
    }

    // Unique slug: base + timestamp suffix to avoid conflicts
    const slug = `${generateSlug(title)}-${Date.now()}`;

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        title,
        slug,
        excerpt: (excerpt || title).slice(0, 500),
        content: markdownToLexical(content),
        category: category || 'news',
        tags: (tags || []).map((tag: string) => ({ tag })),
        status: 'published',
        publishedAt: new Date().toISOString(),
        featured: sticky || false,
        author: authorId,
        ...(mediaId ? { featuredImage: mediaId } : {}),
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      postId: post.id,
      slug: post.slug,
    });
  } catch (error: any) {
    console.error('[Payload Publish] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
