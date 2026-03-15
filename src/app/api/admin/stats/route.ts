import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

export const dynamic = "force-dynamic";

interface DashboardStats {
  newsletterCount: number;
  totalPosts: number;
  totalImages: number;
  aiGeneratedPosts: number;
  lastUpdated: string;
}

// Count newsletter subscribers from JSON file
async function getNewsletterCount(): Promise<number> {
  try {
    const subscribersPath = path.join(process.cwd(), "content", "subscribers.json");
    const data = await fs.readFile(subscribersPath, "utf-8");
    const subscribers = JSON.parse(data);
    return subscribers.length || 0;
  } catch {
    return 0;
  }
}

// Count total blog posts
async function getTotalPosts(): Promise<number> {
  try {
    const postsDir = path.join(process.cwd(), "content", "posts");
    const files = await fs.readdir(postsDir);
    const mdxFiles = files.filter(file => file.endsWith(".mdx"));
    return mdxFiles.length;
  } catch {
    return 0;
  }
}

// Count AI generated posts
async function getAIGeneratedPosts(): Promise<number> {
  try {
    const postsDir = path.join(process.cwd(), "content", "posts");
    const files = await fs.readdir(postsDir);
    const mdxFiles = files.filter(file => file.endsWith(".mdx"));
    
    let aiCount = 0;
    for (const file of mdxFiles) {
      try {
        const content = await fs.readFile(path.join(postsDir, file), "utf-8");
        const { data } = matter(content);
        // Check if post has AI-related indicators
        if (data.aiGenerated || data.tags?.includes("ai") || data.author === "AI" || data.coverImage?.includes("grok")) {
          aiCount++;
        }
      } catch {
        // Skip files that can't be read
      }
    }
    return aiCount;
  } catch {
    return 0;
  }
}

// Count images in library
async function getTotalImages(): Promise<number> {
  try {
    const libraryPath = path.join(process.cwd(), "content", "images", "library.json");
    const data = await fs.readFile(libraryPath, "utf-8");
    const library = JSON.parse(data);
    return library.images?.length || 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const [
      newsletterCount,
      totalPosts,
      totalImages,
      aiGeneratedPosts
    ] = await Promise.all([
      getNewsletterCount(),
      getTotalPosts(),
      getTotalImages(),
      getAIGeneratedPosts()
    ]);

    const stats: DashboardStats = {
      newsletterCount,
      totalPosts,
      totalImages,
      aiGeneratedPosts,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
      }
    });
  } catch (error: any) {
    console.error("[Admin Stats API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", message: error.message },
      { status: 500 }
    );
  }
}
