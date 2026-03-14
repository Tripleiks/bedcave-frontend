import { HomeContent } from "@/components/home-content";
import { getAllPosts } from "@/lib/mdx/posts";

// Server-Side Rendering mit MDX-Posts
export default async function Home() {
  // Alle MDX-Posts zur Build-Zeit laden
  const posts = getAllPosts();
  
  // Posts mit sticky=true aus dem Frontmatter filtern (maximal 3)
  const stickyPosts = posts.filter(post => post.sticky).slice(0, 3);
  // Alle Posts für "all-posts" (inkl. sticky posts)
  const allPosts = posts;

  return <HomeContent recentPosts={allPosts} stickyPosts={stickyPosts} />;
}
