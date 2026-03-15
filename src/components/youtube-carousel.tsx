"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronLeft, ChevronRight, Youtube, Eye, Clock } from "lucide-react";
import Image from "next/image";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  videoUrl: string;
}

interface YouTubeCarouselProps {
  videos?: YouTubeVideo[];
}

// Fallback data
const fallbackVideos: YouTubeVideo[] = [
  {
    id: "fallback-1",
    title: "AI Revolution 2025: What's Coming Next",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=480&h=270&fit=crop",
    channelTitle: "AI Explained",
    publishedAt: "2 days ago",
    viewCount: "1.2M",
    videoUrl: "https://youtube.com",
  },
  {
    id: "fallback-2",
    title: "OpenAI GPT-5 Leaks & Rumors",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=480&h=270&fit=crop",
    channelTitle: "Tech Review",
    publishedAt: "1 week ago",
    viewCount: "856K",
    videoUrl: "https://youtube.com",
  },
  {
    id: "fallback-3",
    title: "Claude 3.7: The AI That Thinks",
    thumbnail: "https://images.unsplash.com/photo-1676299081847-824916de030a?w=480&h=270&fit=crop",
    channelTitle: "Anthropic Labs",
    publishedAt: "3 days ago",
    viewCount: "423K",
    videoUrl: "https://youtube.com",
  },
  {
    id: "fallback-4",
    title: "Top 10 AI Tools for Developers 2025",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=480&h=270&fit=crop",
    channelTitle: "Dev Focus",
    publishedAt: "5 days ago",
    viewCount: "234K",
    videoUrl: "https://youtube.com",
  },
  {
    id: "fallback-5",
    title: "Machine Learning in 2025: Complete Guide",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=480&h=270&fit=crop",
    channelTitle: "AI Academy",
    publishedAt: "1 week ago",
    viewCount: "567K",
    videoUrl: "https://youtube.com",
  },
  {
    id: "fallback-6",
    title: "Google Gemini 2.0: Full Breakdown",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=480&h=270&fit=crop",
    channelTitle: "Google DeepMind",
    publishedAt: "4 days ago",
    viewCount: "892K",
    videoUrl: "https://youtube.com",
  },
  {
    id: "fallback-7",
    title: "AI Art Generation: Midjourney vs DALL-E 3",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=480&h=270&fit=crop",
    channelTitle: "Creative AI",
    publishedAt: "6 days ago",
    viewCount: "312K",
    videoUrl: "https://youtube.com",
  },
  {
    id: "fallback-8",
    title: "Building AI Agents with LangChain",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=480&h=270&fit=crop",
    channelTitle: "Code With AI",
    publishedAt: "2 weeks ago",
    viewCount: "178K",
    videoUrl: "https://youtube.com",
  },
  {
    id: "fallback-9",
    title: "AI in Cybersecurity: Threat Detection",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=480&h=270&fit=crop",
    channelTitle: "Security Weekly",
    publishedAt: "3 days ago",
    viewCount: "445K",
    videoUrl: "https://youtube.com",
  },
  {
    id: "fallback-10",
    title: "The Future of AI Hardware: Neural Chips",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=270&fit=crop",
    channelTitle: "Hardware AI",
    publishedAt: "1 week ago",
    viewCount: "678K",
    videoUrl: "https://youtube.com",
  },
];

export function YouTubeCarousel({ videos: propVideos }: YouTubeCarouselProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>(propVideos || fallbackVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!propVideos);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch videos from API
  useEffect(() => {
    if (propVideos) return;

    async function fetchVideos() {
      try {
        setLoading(true);
        const response = await fetch("/api/youtube/ai-videos");
        
        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }
        
        const data = await response.json();
        
        if (data.success && data.videos && data.videos.length > 0) {
          setVideos(data.videos);
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
      }
    }

    fetchVideos();
  }, [propVideos]);

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
        
        {/* Navigation Controls */}
        {videos.length > 3 && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
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
                      unoptimized={video.thumbnail.includes("unsplash")}
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
