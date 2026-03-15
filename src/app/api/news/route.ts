import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Revalidate every 5 minutes

interface NewsItem {
  id: string;
  text: string;
  category: "docker" | "unraid" | "homelab" | "m365" | "azure" | "general" | "github" | "tech";
  icon: string;
  color: string;
  isNew?: boolean;
  url?: string;
  source: string;
}

// Fallback data if APIs fail
const fallbackNews: NewsItem[] = [
  { id: "fb-1", text: "Docker Desktop 4.37 released with AI integration", category: "docker", icon: "Container", color: "#2496ed", source: "Docker", isNew: true },
  { id: "fb-2", text: "Kubernetes 1.32 introduces new networking features", category: "docker", icon: "Container", color: "#2496ed", source: "K8s" },
  { id: "fb-3", text: "Azure Container Apps now supports GPU workloads", category: "azure", icon: "Cloud", color: "#0089d6", source: "Azure", isNew: true },
  { id: "fb-4", text: "Proxmox VE 8.3 adds enhanced backup compression", category: "homelab", icon: "Server", color: "#e57000", source: "Proxmox" },
  { id: "fb-5", text: "Microsoft 365 Copilot gets custom agent support", category: "m365", icon: "Cloud", color: "#0078d4", source: "Microsoft", isNew: true },
  { id: "fb-6", text: "GitHub Actions now supports ARM64 runners natively", category: "github", icon: "Layers", color: "#39ff14", source: "GitHub", isNew: true },
  { id: "fb-7", text: "Unraid 7.0 stable release announced", category: "unraid", icon: "Server", color: "#ff6c00", source: "Unraid", isNew: true },
  { id: "fb-8", text: "Home Assistant 2025.3 with new Matter support", category: "homelab", icon: "Server", color: "#00d4ff", source: "HA", isNew: true },
  { id: "fb-9", text: "Terraform 1.10 introduces new provider protocols", category: "azure", icon: "Cloud", color: "#8b5cf6", source: "HashiCorp" },
  { id: "fb-10", text: "RustDesk: New open-source remote desktop alternative", category: "tech", icon: "Cpu", color: "#39ff14", source: "GitHub", isNew: true },
  { id: "fb-11", text: "OpenAI GPT-5 preview announced for developers", category: "tech", icon: "Cpu", color: "#10a37f", source: "OpenAI", isNew: true },
  { id: "fb-12", text: "Next.js 15 brings Turbopack for faster builds", category: "tech", icon: "Layers", color: "#ffffff", source: "Vercel", isNew: true },
  { id: "fb-13", text: "Tailwind CSS 4.0 with performance improvements", category: "tech", icon: "Layers", color: "#38bdf8", source: "Tailwind" },
  { id: "fb-14", text: "PostgreSQL 17 beta with enhanced JSON support", category: "tech", icon: "Database", color: "#336791", source: "PostgreSQL" },
  { id: "fb-15", text: "Redis 8 adds new data structures", category: "tech", icon: "Database", color: "#dc382d", source: "Redis", isNew: true },
];

// Fetch HackerNews Top Stories
async function fetchHackerNews(): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const topStoriesRes = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!topStoriesRes.ok) throw new Error("Failed to fetch HN top stories");
    
    const storyIds: number[] = await topStoriesRes.json();
    const topIds = storyIds.slice(0, 6);
    
    const stories = await Promise.all(
      topIds.map(async (id) => {
        try {
          const storyRes = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
            { signal: controller.signal }
          );
          if (!storyRes.ok) return null;
          const story = await storyRes.json();
          
          const title = story.title?.toLowerCase() || "";
          let category: NewsItem["category"] = "tech";
          let icon = "Cpu";
          let color = "#64748b";
          
          if (title.includes("docker") || title.includes("container") || title.includes("kubernetes") || title.includes("k8s")) {
            category = "docker";
            icon = "Container";
            color = "#2496ed";
          } else if (title.includes("azure") || title.includes("aws") || title.includes("cloud")) {
            category = "azure";
            icon = "Cloud";
            color = "#0089d6";
          } else if (title.includes("server") || title.includes("homelab") || title.includes("nas") || title.includes("self-host")) {
            category = "homelab";
            icon = "Server";
            color = "#e57000";
          } else if (title.includes("github") || title.includes("git") || title.includes("open source")) {
            category = "github";
            icon = "Layers";
            color = "#39ff14";
          }
          
          return {
            id: `hn-${story.id}`,
            text: story.title,
            category,
            icon,
            color,
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            source: "HN",
            isNew: story.score > 100,
          };
        } catch {
          return null;
        }
      })
    );
    
    return stories.filter((s) => s !== null) as NewsItem[];
  } catch (error) {
    console.error("[News API] HackerNews fetch failed:", error);
    return [];
  }
}

export async function GET() {
  const requestStart = Date.now();
  
  try {
    console.log("[News API] Fetching tech news...");
    
    // Try to fetch from HackerNews
    const hnNews = await fetchHackerNews();
    
    // If we got news from APIs, mix with fallback
    let allNews: NewsItem[];
    if (hnNews.length > 0) {
      // Mix HN news with fallback (50/50)
      const mixed = [...hnNews.slice(0, 9), ...fallbackNews.slice(0, 9)];
      allNews = mixed.sort(() => Math.random() - 0.5); // Shuffle
    } else {
      allNews = fallbackNews;
    }
    
    // Ensure we have at least 18 items for 3 rows
    while (allNews.length < 18) {
      allNews = [...allNews, ...fallbackNews];
    }
    
    const limitedNews = allNews.slice(0, 18);
    
    const duration = Date.now() - requestStart;
    console.log(`[News API] ✅ Returning ${limitedNews.length} items in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      items: limitedNews,
      sources: {
        hackerNews: hnNews.length,
        fallback: fallbackNews.length,
      },
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("[News API] ❌ Failed:", error);
    
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      error: error.message,
      items: fallbackNews,
      sources: { hackerNews: 0, fallback: fallbackNews.length },
    }, { 
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}
