import { getPostBySlug, lexicalToMarkdown, calculateReadingTime, resolveMediaUrl } from '@/lib/payload/posts';
import type { PayloadPost } from '@/lib/payload/types';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Tag, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from '@/components/code-block';

export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const markdownContent = lexicalToMarkdown(post.content);
  const readingTime = calculateReadingTime(markdownContent);
  const authorName = typeof post.author === 'object' ? post.author.name : 'Bedcave Team';

  const PAYLOAD_BASE = process.env.PAYLOAD_URL ?? 'http://localhost:3000';
  const featuredImageUrl = resolveMediaUrl(
    PAYLOAD_BASE,
    typeof post.featuredImage === 'object' && post.featuredImage !== null ? post.featuredImage?.url : undefined
  );

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#0f0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              $ cd /home
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/edit/${slug}`}
                className="font-mono text-xs text-[#ffbe0b] hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded border border-[#ffbe0b]/30 hover:border-[#ffbe0b]"
              >
                <Pencil className="w-3 h-3" />
                $ edit
              </Link>
              <div className="font-mono text-sm text-[#64748b]">
                bedcave.com/blog/{slug}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Category Badge */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] font-mono text-sm border border-[#00d4ff]/30">
              [{post.category.toUpperCase()}]
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-mono">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-8 font-mono text-sm text-[#64748b] border-b border-[#1e293b] pb-8">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {authorName}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {readingTime} min read
            </span>
          </div>

          {/* Featured Image */}
          {featuredImageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden border border-[#1e293b]">
              <img
                src={featuredImageUrl}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none font-mono">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-6 font-mono">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-mono">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-6 mb-3 font-mono">{children}</h3>,
                p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed font-mono">{children}</p>,
                code: ({ children }) => <code className="bg-[#1e293b] text-[#39ff14] px-2 py-1 rounded text-sm font-mono">{children}</code>,
                pre: CodeBlock,
              }}
            >
              {markdownContent}
            </Markdown>
          </div>

          {/* Tags */}
          {(post.tags ?? []).length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#1e293b]">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-[#64748b]" />
                {(post.tags ?? []).map(t => t.tag).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded bg-[#1e293b] text-[#00d4ff] font-mono text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-[#1e293b]">
            <Link
              href="/"
              className="font-mono text-[#00d4ff] hover:underline flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              $ cd /home
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
