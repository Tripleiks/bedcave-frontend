import { HomeContent } from "@/components/home-content";
import { getAllPosts, resolveMediaUrl } from "@/lib/payload/posts";

// Server-Side Rendering with Payload CMS
export default async function Home() {
  const allPosts = await getAllPosts();

  // Posts with featured === true (max 3)
  const stickyPosts = allPosts.filter((post) => post.featured).slice(0, 3);

  // Remaining posts sorted by publishedAt desc for recent posts
  const recentPosts = allPosts
    .filter((post) => !post.featured)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const resolvedImageUrls: Record<string, string | undefined> = {};
  for (const post of allPosts) {
    const rawUrl = typeof post.featuredImage === 'object' && post.featuredImage !== null
      ? post.featuredImage.url
      : undefined;
    resolvedImageUrls[post.slug] = resolveMediaUrl('', rawUrl);
  }

  return (
    <HomeContent
      recentPosts={recentPosts}
      stickyPosts={stickyPosts}
      resolvedImageUrls={resolvedImageUrls}
    />
  );
}
