import { getPostsByCategory } from "@/lib/mdx/posts";
import { ArticleCard } from "@/components/article-card";
import Link from "next/link";
import { ArrowLeft, Cpu } from "lucide-react";

export default async function HardwarePage() {
  const posts = getPostsByCategory("Hardware");

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
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#39ff14]" />
              <span className="font-mono text-[#39ff14]">Hardware</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 font-mono">
              <span className="text-[#39ff14]">~/</span>hardware
            </h1>
            <p className="text-[#64748b] font-mono">
              Reviews, benchmarks, and recommendations for servers, mini PCs, and networking gear.
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <ArticleCard key={post.slug} post={post} variant="default" />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#64748b] font-mono">No hardware posts yet. Coming soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
