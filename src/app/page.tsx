"use client";

import { useEffect, useState } from "react";
import { HomeContent } from "@/components/home-content";
import wpClient from "@/lib/wordpress-client";
import { WordPressPost } from "@/lib/wordpress-types";

// Client-Side Datenladung nach dem Build
export default function Home() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [stickyPosts, setStickyPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { posts: fetchedPosts } = await wpClient.getPosts({ 
          per_page: 100,
          _embed: true,
        });
        setPosts(fetchedPosts);
        
        const sticky = await wpClient.getStickyPosts(3);
        setStickyPosts(sticky);
      } catch (error) {
        console.error("Fehler beim Laden der Posts:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="font-mono text-[#00d4ff]">
          <span className="animate-pulse">$ loading_posts...</span>
        </div>
      </div>
    );
  }

  return <HomeContent recentPosts={posts} stickyPosts={stickyPosts} />;
}
