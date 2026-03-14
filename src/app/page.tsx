import { HomeContent } from "@/components/home-content";
import { getAllPosts } from "@/lib/mdx/posts";

// Server-Side Rendering mit MDX-Posts
export default async function Home() {
  // Alle MDX-Posts zur Build-Zeit laden
  const posts = getAllPosts();
  
  // Ersten Post als "sticky" markieren (falls vorhanden)
  const stickyPosts = posts.length > 0 ? [posts[0]] : [];
  const remainingPosts = posts.length > 1 ? posts.slice(1) : posts;

  return <HomeContent recentPosts={remainingPosts} stickyPosts={stickyPosts} />;
}
