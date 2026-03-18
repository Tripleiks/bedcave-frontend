import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  videoUrl: string;
  category: "generative-ai" | "claude-code" | "perplexity" | "ai-tools";
}

interface CacheEntry {
  videos: YouTubeVideo[];
  timestamp: number;
  isFallback: boolean;
}

// Simple in-memory cache (clears on server restart)
let videoCache: CacheEntry | null = null;
const CACHE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

// Format view count to human readable
function formatViewCount(count: string): string {
  const num = parseInt(count, 10);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return count;
}

// Format published date
function formatPublishedDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Categorize video based on title
function categorizeVideo(title: string): YouTubeVideo["category"] {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes("claude code") || lowerTitle.includes("claude 3.7") || lowerTitle.includes("claude sonnet")) {
    return "claude-code";
  }
  if (lowerTitle.includes("perplexity") || lowerTitle.includes("perplexity ai")) {
    return "perplexity";
  }
  if (lowerTitle.includes("gpt") || lowerTitle.includes("dall-e") || lowerTitle.includes("midjourney") || 
      lowerTitle.includes("stable diffusion") || lowerTitle.includes("generative ai") || 
      lowerTitle.includes("ai image") || lowerTitle.includes("ai art")) {
    return "generative-ai";
  }
  
  return "ai-tools";
}

// Validate if video exists by checking if thumbnail is accessible
async function validateVideoExists(videoId: string): Promise<boolean> {
  try {
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(thumbnailUrl, {
      method: "HEAD",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// Fetch videos for specific search queries
async function fetchVideosForQuery(apiKey: string, query: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
  try {
    console.log(`[YouTube API] Searching for: "${query}"`);
    
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoDuration", "medium");
    searchUrl.searchParams.set("order", "viewCount");
    searchUrl.searchParams.set("maxResults", maxResults.toString());
    searchUrl.searchParams.set("key", apiKey);
    searchUrl.searchParams.set("publishedAfter", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const searchRes = await fetch(searchUrl.toString(), { 
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });
    
    clearTimeout(timeoutId);
    
    if (!searchRes.ok) {
      const errorText = await searchRes.text();
      console.error(`[YouTube API] Search failed for "${query}":`, searchRes.status, errorText);
      return [];
    }
    
    const searchData = await searchRes.json();
    console.log(`[YouTube API] Found ${searchData.items?.length || 0} items for "${query}"`);
    
    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }
    
    // Get video IDs
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
    console.log(`[YouTube API] Fetching statistics for ${searchData.items.length} videos`);
    
    // Fetch video statistics
    const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    statsUrl.searchParams.set("part", "statistics,snippet");
    statsUrl.searchParams.set("id", videoIds);
    statsUrl.searchParams.set("key", apiKey);
    
    const statsRes = await fetch(statsUrl.toString(), { 
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });
    
    if (!statsRes.ok) {
      const errorText = await statsRes.text();
      console.error(`[YouTube API] Stats fetch failed:`, statsRes.status, errorText);
      return [];
    }
    
    const statsData = await statsRes.json();
    console.log(`[YouTube API] Got statistics for ${statsData.items?.length || 0} videos`);
    
    // Map and validate videos
    const videos: YouTubeVideo[] = [];
    
    for (const item of statsData.items) {
      const videoId = item.id;
      const thumbnail = item.snippet.thumbnails.high?.url || 
                       item.snippet.thumbnails.medium?.url || 
                       item.snippet.thumbnails.default?.url;
      
      // Skip if no thumbnail
      if (!thumbnail) {
        console.log(`[YouTube API] Video ${videoId} has no thumbnail, skipping`);
        continue;
      }
      
      // Skip if video is private or deleted (check statistics)
      const viewCount = item.statistics?.viewCount;
      if (viewCount === undefined || viewCount === null) {
        console.log(`[YouTube API] Video ${videoId} has no statistics (private/deleted), skipping`);
        continue;
      }
      
      videos.push({
        id: videoId,
        title: item.snippet.title,
        thumbnail: thumbnail,
        channelTitle: item.snippet.channelTitle,
        publishedAt: formatPublishedDate(item.snippet.publishedAt),
        viewCount: formatViewCount(viewCount || "0"),
        videoUrl: `https://youtube.com/watch?v=${videoId}`,
        category: categorizeVideo(item.snippet.title),
      });
    }
    
    console.log(`[YouTube API] Added ${videos.length} valid videos for "${query}"`);
    return videos;
  } catch (error: any) {
    console.error(`[YouTube API] Error fetching for "${query}":`, error.message, error.stack);
    return [];
  }
}

// Main function to fetch all targeted videos - OPTIMIZED for Quota
async function fetchTargetedVideos(apiKey: string): Promise<YouTubeVideo[]> {
  // Reduced from 10 to 3 queries to save quota
  const searchQueries = [
    { query: "Claude Code AI coding tutorial", category: "claude-code" as const },
    { query: "Perplexity AI search tutorial review", category: "perplexity" as const },
    { query: "generative AI tools Midjourney DALL-E 2024", category: "generative-ai" as const },
  ];
  
  const allVideos: YouTubeVideo[] = [];
  const videoIds = new Set<string>(); // Track unique videos
  
  // Fetch from each query
  for (const { query } of searchQueries) {
    try {
      const videos = await fetchVideosForQuery(apiKey, query, 3);
      
      for (const video of videos) {
        if (!videoIds.has(video.id)) {
          videoIds.add(video.id);
          allVideos.push(video);
        }
      }
    } catch (error) {
      console.error(`[YouTube API] Failed to fetch for "${query}":`, error);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Sort by view count and take top 10
  return allVideos
    .sort((a, b) => parseInt(b.viewCount.replace(/[^0-9]/g, "")) - parseInt(a.viewCount.replace(/[^0-9]/g, "")))
    .slice(0, 10);
}

// Fallback videos - thumbnail URLs verified working 2026-03
function getFallbackVideos(): YouTubeVideo[] {
  return [
    {
      id: "l8pRSuU81PU",
      title: "Let's build GPT: from scratch, in code, spelled out",
      thumbnail: "https://i.ytimg.com/vi/l8pRSuU81PU/hqdefault.jpg",
      channelTitle: "Andrej Karpathy",
      publishedAt: "2 years ago",
      viewCount: "3.8M",
      videoUrl: "https://youtube.com/watch?v=l8pRSuU81PU",
      category: "ai-tools",
    },
    {
      id: "VMj-3S1tku0",
      title: "The spelled-out intro to neural networks and backpropagation",
      thumbnail: "https://i.ytimg.com/vi/VMj-3S1tku0/hqdefault.jpg",
      channelTitle: "Andrej Karpathy",
      publishedAt: "2 years ago",
      viewCount: "4.1M",
      videoUrl: "https://youtube.com/watch?v=VMj-3S1tku0",
      category: "ai-tools",
    },
    {
      id: "3c-iBn73dDE",
      title: "Docker Tutorial for Beginners",
      thumbnail: "https://i.ytimg.com/vi/3c-iBn73dDE/hqdefault.jpg",
      channelTitle: "TechWorld with Nana",
      publishedAt: "3 years ago",
      viewCount: "7.2M",
      videoUrl: "https://youtube.com/watch?v=3c-iBn73dDE",
      category: "ai-tools",
    },
    {
      id: "bKFMS5C4CG0",
      title: "Docker Networking is CRAZY!! (and fun)",
      thumbnail: "https://i.ytimg.com/vi/bKFMS5C4CG0/hqdefault.jpg",
      channelTitle: "NetworkChuck",
      publishedAt: "4 years ago",
      viewCount: "560K",
      videoUrl: "https://youtube.com/watch?v=bKFMS5C4CG0",
      category: "ai-tools",
    },
    {
      id: "Sklc_fQBmcs",
      title: "Next.js in 100 Seconds // Plus Full Beginner's Tutorial",
      thumbnail: "https://i.ytimg.com/vi/Sklc_fQBmcs/hqdefault.jpg",
      channelTitle: "Fireship",
      publishedAt: "2 years ago",
      viewCount: "1.1M",
      videoUrl: "https://youtube.com/watch?v=Sklc_fQBmcs",
      category: "ai-tools",
    },
    {
      id: "zizonToFXDs",
      title: "Midjourney vs DALL-E 3 vs Stable Diffusion",
      thumbnail: "https://i.ytimg.com/vi/zizonToFXDs/hqdefault.jpg",
      channelTitle: "Matt Wolfe",
      publishedAt: "1 year ago",
      viewCount: "387K",
      videoUrl: "https://youtube.com/watch?v=zizonToFXDs",
      category: "generative-ai",
    },
    {
      id: "kCc8FmEb1nY",
      title: "Let's build the GPT Tokenizer",
      thumbnail: "https://i.ytimg.com/vi/kCc8FmEb1nY/hqdefault.jpg",
      channelTitle: "Andrej Karpathy",
      publishedAt: "1 year ago",
      viewCount: "1.2M",
      videoUrl: "https://youtube.com/watch?v=kCc8FmEb1nY",
      category: "ai-tools",
    },
    {
      id: "cdiD-9MMpb0",
      title: "Intro to Large Language Models",
      thumbnail: "https://i.ytimg.com/vi/cdiD-9MMpb0/hqdefault.jpg",
      channelTitle: "Andrej Karpathy",
      publishedAt: "1 year ago",
      viewCount: "3.6M",
      videoUrl: "https://youtube.com/watch?v=cdiD-9MMpb0",
      category: "generative-ai",
    },
    {
      id: "gAkwW2tuIqE",
      title: "Self-Hosted vs Cloud: The Ultimate Homelab Debate",
      thumbnail: "https://i.ytimg.com/vi/gAkwW2tuIqE/hqdefault.jpg",
      channelTitle: "NetworkChuck",
      publishedAt: "1 year ago",
      viewCount: "298K",
      videoUrl: "https://youtube.com/watch?v=gAkwW2tuIqE",
      category: "ai-tools",
    },
    {
      id: "1bUy-1hGZpI",
      title: "Kubernetes Tutorial for Beginners",
      thumbnail: "https://i.ytimg.com/vi/1bUy-1hGZpI/hqdefault.jpg",
      channelTitle: "TechWorld with Nana",
      publishedAt: "3 years ago",
      viewCount: "3.1M",
      videoUrl: "https://youtube.com/watch?v=1bUy-1hGZpI",
      category: "ai-tools",
    },
  ];
}

export async function GET() {
  const requestStart = Date.now();
  
  try {
    // Check cache first
    if (videoCache && (Date.now() - videoCache.timestamp < CACHE_DURATION_MS)) {
      console.log(`[YouTube API] ✅ Returning cached videos (${Math.round((Date.now() - videoCache.timestamp) / 1000 / 60)}m old)`);
      return NextResponse.json({
        success: true,
        videos: videoCache.videos,
        isFallback: videoCache.isFallback,
        count: videoCache.videos.length,
        cached: true,
        cacheAge: Math.round((Date.now() - videoCache.timestamp) / 1000),
      }, {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        },
      });
    }
    
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    console.log(`[YouTube API] Environment check - API Key exists: ${!!apiKey}`);
    
    if (!apiKey) {
      console.error("[YouTube API] YOUTUBE_API_KEY not configured");
      videoCache = {
        videos: getFallbackVideos(),
        timestamp: Date.now(),
        isFallback: true,
      };
      return NextResponse.json({
        success: true,
        videos: videoCache.videos,
        isFallback: true,
        count: 10,
        cached: false,
        message: "Using fallback videos - API key not configured",
      }, {
        headers: { "Cache-Control": "public, max-age=1800" },
      });
    }
    
    console.log("[YouTube API] Fetching targeted AI videos...");
    
    const videos = await fetchTargetedVideos(apiKey);
    
    // If no videos found or API error, use fallback
    if (videos.length === 0) {
      console.warn("[YouTube API] No valid videos found, using fallback");
      videoCache = {
        videos: getFallbackVideos(),
        timestamp: Date.now(),
        isFallback: true,
      };
      return NextResponse.json({
        success: true,
        videos: videoCache.videos,
        isFallback: true,
        count: 10,
        cached: false,
        message: "Using fallback videos - API quota exceeded or no videos found",
      }, {
        headers: { "Cache-Control": "public, max-age=1800" },
      });
    }
    
    // Store in cache
    videoCache = {
      videos,
      timestamp: Date.now(),
      isFallback: false,
    };
    
    const duration = Date.now() - requestStart;
    console.log(`[YouTube API] ✅ Returning ${videos.length} fresh videos in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      videos,
      isFallback: false,
      cached: false,
      count: videos.length,
      categories: {
        "claude-code": videos.filter(v => v.category === "claude-code").length,
        "perplexity": videos.filter(v => v.category === "perplexity").length,
        "generative-ai": videos.filter(v => v.category === "generative-ai").length,
        "ai-tools": videos.filter(v => v.category === "ai-tools").length,
      },
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
      },
    });
    
  } catch (error: any) {
    console.error("[YouTube API] ❌ Failed:", error);
    
    // Return cached or fallback on error
    if (videoCache) {
      return NextResponse.json({
        success: true,
        videos: videoCache.videos,
        isFallback: videoCache.isFallback,
        cached: true,
        error: error.message,
      }, { 
        status: 200,
        headers: { "Cache-Control": "public, max-age=1800" },
      });
    }
    
    return NextResponse.json({
      success: true,
      videos: getFallbackVideos(),
      isFallback: true,
      cached: false,
      error: error.message,
      count: 10,
    }, { 
      status: 200,
      headers: { "Cache-Control": "public, max-age=1800" },
    });
  }
}
