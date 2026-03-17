"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import wpClient from "@/lib/wordpress-client";
import { WordPressPost } from "@/lib/wordpress-types";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function PostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      
      try {
        const fetchedPost = await wpClient.getPostBySlug(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="font-mono text-[#00d4ff]">
          <span className="animate-pulse">$ loading_post...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-[#ff006e] text-6xl mb-4">404</div>
          <div className="font-mono text-white mb-6">$ post_not_found</div>
          <Link 
            href="/" 
            className="font-mono text-[#00d4ff] hover:underline flex items-center gap-2 justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            $ cd /home
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const author = post._embedded?.author?.[0]?.name || "Anonymous";
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

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
            <div className="font-mono text-sm text-[#64748b]">
              bedcave.com/post/{slug}
            </div>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8 font-mono text-sm text-[#64748b]">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {date}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {author}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.categories?.length || 0} categories
            </span>
          </div>

          {/* Title */}
          <h1 
            className="text-4xl md:text-5xl font-bold text-white mb-8 font-mono"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {/* Featured Image */}
          {featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden border border-[#1e293b]">
              <img 
                src={featuredImage} 
                alt={post.title.rendered}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-invert prose-lg max-w-none font-mono text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

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
