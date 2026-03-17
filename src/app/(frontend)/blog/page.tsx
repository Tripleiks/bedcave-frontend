import { getAllPosts, resolveMediaUrl } from "@/lib/payload/posts";
import { ArticleCard } from "@/components/article-card";
import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";

export default async function BlogPage() {
  const posts = await getAllPosts();

  const PAYLOAD_BASE = process.env.PAYLOAD_URL ?? 'http://localhost:3000';
  const resolvedImageUrls: Record<string, string | undefined> = {};
  for (const post of posts) {
    const rawUrl = typeof post.featuredImage === 'object' ? post.featuredImage?.url : undefined;
    resolvedImageUrls[post.slug] = resolveMediaUrl(PAYLOAD_BASE, rawUrl);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
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
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#00d4ff]" />
              <span className="font-mono text-[#00d4ff]">All Posts</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 font-mono">
              <span className="text-[#00d4ff]">~/</span>blog
            </h1>
            <p className="text-[#64748b] font-mono">
              {posts.length} posts — homelabs, docker, hardware, and more.
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <ArticleCard
                  key={post.slug}
                  post={post}
                  variant="default"
                  resolvedImageUrl={resolvedImageUrls[post.slug]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#64748b] font-mono">No posts yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
