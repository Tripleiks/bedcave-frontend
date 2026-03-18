"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronLeft, ChevronRight, Youtube, Eye, Clock, RefreshCw } from "lucide-react";
import Image from "next/image";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  videoUrl: string;
  category?: "generative-ai" | "claude-code" | "perplexity" | "ai-tools";
}

interface YouTubeCarouselProps {
  videos?: YouTubeVideo[];
}

// Fallback data - thumbnail URLs verified working 2026-03
const fallbackVideos: YouTubeVideo[] = [
  {
    id: "l8pRSuU81PU",
    title: "Let's build GPT: from scratch, in code, spelled out",
    thumbnail: "https://i.ytimg.com/vi/l8pRSuU81PU/hqdefault.jpg",
    channelTitle: "Andrej Karpathy",
    publishedAt: "2 years ago",
    viewCount: "3.8M",
    videoUrl: "https://youtube.com/watch?v=l8pRSuU81PU",
  },
  {
    id: "VMj-3S1tku0",
    title: "The spelled-out intro to neural networks and backpropagation",
    thumbnail: "https://i.ytimg.com/vi/VMj-3S1tku0/hqdefault.jpg",
    channelTitle: "Andrej Karpathy",
    publishedAt: "2 years ago",
    viewCount: "4.1M",
    videoUrl: "https://youtube.com/watch?v=VMj-3S1tku0",
  },
  {
    id: "3c-iBn73dDE",
    title: "Docker Tutorial for Beginners",
    thumbnail: "https://i.ytimg.com/vi/3c-iBn73dDE/hqdefault.jpg",
    channelTitle: "TechWorld with Nana",
    publishedAt: "3 years ago",
    viewCount: "7.2M",
    videoUrl: "https://youtube.com/watch?v=3c-iBn73dDE",
  },
  {
    id: "bKFMS5C4CG0",
    title: "Docker Networking is CRAZY!! (and fun)",
    thumbnail: "https://i.ytimg.com/vi/bKFMS5C4CG0/hqdefault.jpg",
    channelTitle: "NetworkChuck",
    publishedAt: "4 years ago",
    viewCount: "560K",
    videoUrl: "https://youtube.com/watch?v=bKFMS5C4CG0",
  },
  {
    id: "Sklc_fQBmcs",
    title: "Next.js in 100 Seconds // Plus Full Beginner's Tutorial",
    thumbnail: "https://i.ytimg.com/vi/Sklc_fQBmcs/hqdefault.jpg",
    channelTitle: "Fireship",
    publishedAt: "2 years ago",
    viewCount: "1.1M",
    videoUrl: "https://youtube.com/watch?v=Sklc_fQBmcs",
  },
  {
    id: "zizonToFXDs",
    title: "Midjourney vs DALL-E 3 vs Stable Diffusion: AI Image Generation",
    thumbnail: "https://i.ytimg.com/vi/zizonToFXDs/hqdefault.jpg",
    channelTitle: "Matt Wolfe",
    publishedAt: "1 year ago",
    viewCount: "387K",
    videoUrl: "https://youtube.com/watch?v=zizonToFXDs",
  },
  {
    id: "kCc8FmEb1nY",
    title: "Let's build the GPT Tokenizer",
    thumbnail: "https://i.ytimg.com/vi/kCc8FmEb1nY/hqdefault.jpg",
    channelTitle: "Andrej Karpathy",
    publishedAt: "1 year ago",
    viewCount: "1.2M",
    videoUrl: "https://youtube.com/watch?v=kCc8FmEb1nY",
  },
  {
    id: "cdiD-9MMpb0",
    title: "Intro to Large Language Models",
    thumbnail: "https://i.ytimg.com/vi/cdiD-9MMpb0/hqdefault.jpg",
    channelTitle: "Andrej Karpathy",
    publishedAt: "1 year ago",
    viewCount: "3.6M",
    videoUrl: "https://youtube.com/watch?v=cdiD-9MMpb0",
  },
  {
    id: "gAkwW2tuIqE",
    title: "Self-Hosted vs Cloud: The Ultimate Homelab Debate",
    thumbnail: "https://i.ytimg.com/vi/gAkwW2tuIqE/hqdefault.jpg",
    channelTitle: "NetworkChuck",
    publishedAt: "1 year ago",
    viewCount: "298K",
    videoUrl: "https://youtube.com/watch?v=gAkwW2tuIqE",
  },
  {
    id: "1bUy-1hGZpI",
    title: "Kubernetes Tutorial for Beginners",
    thumbnail: "https://i.ytimg.com/vi/1bUy-1hGZpI/hqdefault.jpg",
    channelTitle: "TechWorld with Nana",
    publishedAt: "3 years ago",
    viewCount: "3.1M",
    videoUrl: "https://youtube.com/watch?v=1bUy-1hGZpI",
  },
];

export function YouTubeCarousel({ videos: propVideos }: YouTubeCarouselProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>(propVideos || fallbackVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!propVideos);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Fetch videos from API
  const fetchVideos = useCallback(async (showLoading = true) => {
    if (propVideos) return;
    
    try {
      if (showLoading) setLoading(true);
      setIsRefreshing(true);
      setError(null);
      
      const response = await fetch("/api/youtube/ai-videos");
      
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      
      const data = await response.json();
      
      if (data.success && data.videos && data.videos.length > 0) {
        setVideos(data.videos);
        setLastRefreshed(new Date());
      } else {
        console.warn("[YouTube Carousel] No videos returned, using fallback");
        setVideos(fallbackVideos);
      }
    } catch (err: any) {
      console.error("[YouTube Carousel] Error fetching videos:", err);
      setError(err.message);
      setVideos(fallbackVideos);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [propVideos]);

  // Initial fetch
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsAutoPlaying(false);
    setCurrentIndex(0);
    await fetchVideos(true);
  }, [fetchVideos]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || videos.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, videos.length - 2));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, videos.length]);

  const goToPrevious = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, videos.length - 3) : prev - 1));
  }, [videos.length]);

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= videos.length - 3 ? 0 : prev + 1));
  }, [videos.length]);

  // Get visible videos (3 at a time)
  const visibleVideos = videos.slice(currentIndex, currentIndex + 3);
  
  // Pad with fallback if needed
  while (visibleVideos.length < 3 && videos.length >= 3) {
    visibleVideos.push(videos[visibleVideos.length]);
  }

  if (loading) {
    return (
      <div className="w-full">
        {/* Terminal Header */}
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">
              $ youtube-dl --search="AI latest"
            </h3>
            <p className="font-mono text-xs text-[#64748b]">Loading AI videos...</p>
          </div>
        </div>
        
        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-[#1e293b]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#1e293b] rounded w-3/4" />
                <div className="h-3 bg-[#1e293b] rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-3 bg-[#1e293b] rounded w-16" />
                  <div className="h-3 bg-[#1e293b] rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no videos available
  if (videos.length === 0) {
    return (
      <div className="w-full">
        {/* Terminal Header */}
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">
              $ youtube-dl --search="AI latest"
            </h3>
            <p className="font-mono text-xs text-[#64748b]">No videos available</p>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="rounded-xl border border-[#1e293b] bg-[#13131f] p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-[#1e293b]">
              <Youtube className="w-8 h-8 text-[#64748b]" />
            </div>
            <div>
              <h3 className="font-mono text-lg font-bold text-white mb-2">
                No AI Videos Available
              </h3>
              <p className="font-mono text-sm text-[#64748b] max-w-md">
                Unable to load AI-related videos from YouTube. This may be due to API limitations or network issues.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1e293b] bg-[#0a0a0f] hover:bg-[#1e293b] hover:border-[#39ff14]/50 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-[#39ff14] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-mono text-sm text-white">Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-900/20">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">
              $ youtube-dl --search="AI latest" --top-10
            </h3>
            <p className="font-mono text-xs text-[#64748b]">
              {videos.length} AI videos loaded • Updated hourly
            </p>
          </div>
        </div>
        
        {/* Navigation Controls + Refresh */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-[#1e293b] bg-[#13131f] hover:bg-[#1e293b] hover:border-[#39ff14]/50 transition-all duration-200 group disabled:opacity-50"
            aria-label="Refresh videos"
            title="Refresh video list"
          >
            <RefreshCw className={`w-4 h-4 text-[#64748b] group-hover:text-[#39ff14] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <div className="w-px h-6 bg-[#1e293b] mx-1" />

          {videos.length > 3 && (
            <>
              <button
                onClick={goToPrevious}
                className="p-2 rounded-lg border border-[#1e293b] bg-[#13131f] hover:bg-[#1e293b] hover:border-[#00d4ff]/50 transition-all duration-200 group"
                aria-label="Previous videos"
              >
                <ChevronLeft className="w-4 h-4 text-[#64748b] group-hover:text-[#00d4ff]" />
              </button>
              <span className="font-mono text-xs text-[#64748b] px-2">
                {currentIndex + 1}-{Math.min(currentIndex + 3, videos.length)} / {videos.length}
              </span>
              <button
                onClick={goToNext}
                className="p-2 rounded-lg border border-[#1e293b] bg-[#13131f] hover:bg-[#1e293b] hover:border-[#00d4ff]/50 transition-all duration-200 group"
                aria-label="Next videos"
              >
                <ChevronRight className="w-4 h-4 text-[#64748b] group-hover:text-[#00d4ff]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Video Carousel */}
      <div className="relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {visibleVideos.map((video, index) => (
              <motion.div
                key={`${video.id}-${currentIndex + index}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group"
              >
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden hover:border-[#ff006e]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#ff006e]/10"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video overflow-hidden bg-[#0a0a0f]">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="p-3 rounded-full bg-red-600 shadow-lg">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 font-mono text-xs text-white">
                      AI Video
                    </div>
                  </div>
                  
                  {/* Info Container */}
                  <div className="p-4 space-y-2">
                    {/* Title */}
                    <h4 className="font-mono text-sm font-bold text-white line-clamp-2 group-hover:text-[#00d4ff] transition-colors">
                      {video.title}
                    </h4>
                    
                    {/* Channel */}
                    <p className="font-mono text-xs text-[#64748b]">
                      {video.channelTitle}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1 text-[#64748b]">
                        <Eye className="w-3 h-3" />
                        <span className="font-mono text-xs">{video.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#64748b]">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono text-xs">{video.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Indicators */}
      {videos.length > 3 && (
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: Math.min(videos.length - 2, 8) }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(i);
              }}
              className={`h-1 rounded-full transition-all duration-200 ${
                i === currentIndex 
                  ? "w-6 bg-[#ff006e]" 
                  : "w-2 bg-[#1e293b] hover:bg-[#64748b]"
              }`}
              aria-label={`Go to video ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-4 px-2">
        <p className="font-mono text-xs text-[#64748b] text-center">
          <span className="text-[#ff006e]">▶</span> Click any video to watch on YouTube • 
          <span className="text-[#39ff14]"> Auto-refresh hourly</span>
        </p>
      </div>
    </div>
  );
}
