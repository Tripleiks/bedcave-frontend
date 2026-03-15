import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  videoUrl: string;
}

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

// Fetch AI-related videos from YouTube
async function fetchAIVideos(): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.error("[YouTube API] YOUTUBE_API_KEY not configured");
    return getFallbackVideos();
  }
  
  try {
    // Search for AI-related videos
    const searchQueries = [
      "artificial intelligence latest",
      "AI technology 2024 2025",
      "machine learning tutorial",
      "OpenAI GPT Claude Gemini",
      "AI news today"
    ];
    
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", randomQuery);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoDuration", "medium"); // 4-20 minutes
    searchUrl.searchParams.set("order", "relevance");
    searchUrl.searchParams.set("maxResults", "15");
    searchUrl.searchParams.set("key", apiKey);
    searchUrl.searchParams.set("publishedAfter", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const searchRes = await fetch(searchUrl.toString(), { 
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });
    
    clearTimeout(timeoutId);
    
    if (!searchRes.ok) {
      const errorText = await searchRes.text();
      console.error("[YouTube API] Search failed:", searchRes.status, errorText);
      return getFallbackVideos();
    }
    
    const searchData = await searchRes.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      console.warn("[YouTube API] No videos found");
      return getFallbackVideos();
    }
    
    // Get video IDs for statistics
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
    
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
      console.error("[YouTube API] Stats fetch failed:", statsRes.status);
      return getFallbackVideos();
    }
    
    const statsData = await statsRes.json();
    
    // Map to our format
    const videos: YouTubeVideo[] = statsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: formatPublishedDate(item.snippet.publishedAt),
      viewCount: formatViewCount(item.statistics.viewCount || "0"),
      videoUrl: `https://youtube.com/watch?v=${item.id}`,
    }));
    
    // Sort by view count (popularity) and take top 10
    return videos
      .sort((a, b) => parseInt(b.viewCount.replace(/[^0-9]/g, "")) - parseInt(a.viewCount.replace(/[^0-9]/g, "")))
      .slice(0, 10);
      
  } catch (error: any) {
    console.error("[YouTube API] Error:", error.message);
    return getFallbackVideos();
  }
}

// Fallback videos when API fails or not configured
function getFallbackVideos(): YouTubeVideo[] {
  return [
    {
      id: "fallback-1",
      title: "AI Revolution 2025: What's Coming Next",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      channelTitle: "AI Explained",
      publishedAt: "2 days ago",
      viewCount: "1.2M",
      videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "fallback-2",
      title: "OpenAI GPT-5 Leaks & Rumors",
      thumbnail: "https://i.ytimg.com/vi/abcd1234/maxresdefault.jpg",
      channelTitle: "Tech Review",
      publishedAt: "1 week ago",
      viewCount: "856K",
      videoUrl: "https://youtube.com/watch?v=abcd1234",
    },
    {
      id: "fallback-3",
      title: "Claude 3.7: The AI That Thinks",
      thumbnail: "https://i.ytimg.com/vi/efgh5678/maxresdefault.jpg",
      channelTitle: "Anthropic Labs",
      publishedAt: "3 days ago",
      viewCount: "423K",
      videoUrl: "https://youtube.com/watch?v=efgh5678",
    },
    {
      id: "fallback-4",
      title: "Top 10 AI Tools for Developers 2025",
      thumbnail: "https://i.ytimg.com/vi/ijkl9012/maxresdefault.jpg",
      channelTitle: "Dev Focus",
      publishedAt: "5 days ago",
      viewCount: "234K",
      videoUrl: "https://youtube.com/watch?v=ijkl9012",
    },
    {
      id: "fallback-5",
      title: "Machine Learning in 2025: Complete Guide",
      thumbnail: "https://i.ytimg.com/vi/mnop3456/maxresdefault.jpg",
      channelTitle: "AI Academy",
      publishedAt: "1 week ago",
      viewCount: "567K",
      videoUrl: "https://youtube.com/watch?v=mnop3456",
    },
    {
      id: "fallback-6",
      title: "Google Gemini 2.0: Full Breakdown",
      thumbnail: "https://i.ytimg.com/vi/qrst7890/maxresdefault.jpg",
      channelTitle: "Google DeepMind",
      publishedAt: "4 days ago",
      viewCount: "892K",
      videoUrl: "https://youtube.com/watch?v=qrst7890",
    },
    {
      id: "fallback-7",
      title: "AI Art Generation: Midjourney vs DALL-E 3",
      thumbnail: "https://i.ytimg.com/vi/uvwx1234/maxresdefault.jpg",
      channelTitle: "Creative AI",
      publishedAt: "6 days ago",
      viewCount: "312K",
      videoUrl: "https://youtube.com/watch?v=uvwx1234",
    },
    {
      id: "fallback-8",
      title: "Building AI Agents with LangChain",
      thumbnail: "https://i.ytimg.com/vi/yzab5678/maxresdefault.jpg",
      channelTitle: "Code With AI",
      publishedAt: "2 weeks ago",
      viewCount: "178K",
      videoUrl: "https://youtube.com/watch?v=yzab5678",
    },
    {
      id: "fallback-9",
      title: "AI in Cybersecurity: Threat Detection",
      thumbnail: "https://i.ytimg.com/vi/cdef9012/maxresdefault.jpg",
      channelTitle: "Security Weekly",
      publishedAt: "3 days ago",
      viewCount: "445K",
      videoUrl: "https://youtube.com/watch?v=cdef9012",
    },
    {
      id: "fallback-10",
      title: "The Future of AI Hardware: Neural Chips",
      thumbnail: "https://i.ytimg.com/vi/ghij3456/maxresdefault.jpg",
      channelTitle: "Hardware AI",
      publishedAt: "1 week ago",
      viewCount: "678K",
      videoUrl: "https://youtube.com/watch?v=ghij3456",
    },
  ];
}

export async function GET() {
  const requestStart = Date.now();
  
  try {
    console.log("[YouTube API] Fetching AI videos...");
    
    const videos = await fetchAIVideos();
    
    const duration = Date.now() - requestStart;
    console.log(`[YouTube API] ✅ Returning ${videos.length} videos in ${duration}ms`);
    
    const isFallback = videos.some(v => v.id.startsWith("fallback"));
    
    return NextResponse.json({
      success: true,
      videos,
      isFallback,
      count: videos.length,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
      },
    });
    
  } catch (error: any) {
    console.error("[YouTube API] ❌ Failed:", error);
    
    return NextResponse.json({
      success: true,
      videos: getFallbackVideos(),
      isFallback: true,
      error: error.message,
      count: 10,
    }, { 
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
