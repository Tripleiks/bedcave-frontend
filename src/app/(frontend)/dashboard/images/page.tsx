"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ImageIcon, 
  Copy, 
  Check, 
  Search, 
  Folder, 
  Grid, 
  List, 
  Trash2, 
  ExternalLink,
  Database,
  Calendar,
  Tag,
  Plus
} from "lucide-react";

interface ImageEntry {
  id: string;
  url: string;
  title: string;
  prompt: string;
  tags: string[];
  category: string;
  createdAt: string;
  usedInPosts: string[];
  source: string;
}

interface LibraryStats {
  totalImages: number;
  byCategory: Record<string, number>;
}

const categoryColors: Record<string, string> = {
  docker: "#2496ed",
  unraid: "#ff6c00",
  homelab: "#e57000",
  hardware: "#39ff14",
  m365: "#0078d4",
  azure: "#0089d6",
  general: "#00d4ff"
};

export default function ImagesLibraryPage() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/images/library");
      const data = await response.json();
      
      if (data.success) {
        setImages(data.images);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image from library?\n\nThis will remove it from the database but won't delete the file from Grok.")) {
      return;
    }
    
    setDeleteLoading(id);
    try {
      const response = await fetch(`/api/images/library?id=${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setImages(images.filter(img => img.id !== id));
        fetchImages(); // Refresh stats
      } else {
        const error = await response.json();
        alert(`Failed to delete: ${error.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete image");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || img.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Object.keys(stats?.byCategory || {})];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-[#00d4ff]">
          <div className="w-5 h-5 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
          <span>Loading image library...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#0f0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                $ cd /admin
              </Link>
              <div className="h-6 w-px bg-[#1e293b]" />
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#39ff14]" />
                <span className="font-mono text-[#39ff14]">image-library</span>
                <span className="text-[#64748b] font-mono text-sm">(AI Generated)</span>
              </div>
            </div>
            <Link
              href="/dashboard/ai-generator"
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#00d4ff] text-[#0a0a0f] font-mono font-bold hover:bg-[#00d4ff]/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Generate New
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white font-mono mb-2">
              <span className="text-[#8338ec]">const</span>{" "}
              <span className="text-[#00d4ff]">aiImageLibrary</span>
              <span className="text-white"> = </span>
              <span className="text-[#39ff14]">new</span>{" "}
              <span className="text-[#ffbe0b]">GrokCollection</span>();
            </h1>
            <p className="text-[#64748b] font-mono text-sm">
              // All AI-generated cover images from Grok Aurora
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <div className="p-4 rounded-lg border border-[#1e293b] bg-[#13131f]">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-[#64748b] font-mono text-xs">Total</span>
                </div>
                <span className="text-2xl font-bold text-white font-mono">
                  {stats.totalImages}
                </span>
              </div>
              
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div 
                  key={category}
                  className="p-4 rounded-lg border border-[#1e293b] bg-[#13131f]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[category] || "#64748b" }}
                    />
                    <span className="text-[#64748b] font-mono text-xs uppercase">
                      {category}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-white font-mono">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Search & Filter */}
          <div className="rounded-xl border border-[#1e293b] bg-[#13131f] p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or tags..."
                  className="w-full pl-10 pr-4 py-2.5 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-[#64748b]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono focus:border-[#00d4ff] focus:outline-none transition-colors cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-[#0a0a0f] rounded border border-[#1e293b] p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-[#1e293b] text-[#00d4ff]" : "text-[#64748b] hover:text-white"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-[#1e293b] text-[#00d4ff]" : "text-[#64748b] hover:text-white"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 font-mono text-sm">
              <span className="text-[#64748b]">
                Total: <span className="text-[#00d4ff]">{images.length}</span> images
              </span>
              <span className="text-[#64748b]">
                Filtered: <span className="text-[#ffbe0b]">{filteredImages.length}</span> images
              </span>
            </div>
          </div>

          {/* Image Grid */}
          {filteredImages.length === 0 ? (
            <div className="rounded-xl border border-[#1e293b] bg-[#13131f] p-12 text-center">
              <ImageIcon className="w-16 h-16 text-[#1e293b] mx-auto mb-4" />
              <p className="text-[#64748b] font-mono mb-4">
                {searchQuery || selectedCategory !== "all" 
                  ? "// No images match your filters"
                  : "// No images yet. Generate some with AI!"}
              </p>
              <Link
                href="/dashboard/ai-generator"
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#00d4ff] text-[#0a0a0f] font-mono text-sm hover:bg-[#00d4ff]/90 transition-colors"
              >
                Go to AI Generator →
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <ImageCard 
                  key={image.id} 
                  image={image} 
                  onCopy={() => handleCopy(image.url, image.id)}
                  onDelete={() => handleDelete(image.id)}
                  copied={copiedId === image.id}
                  deleteLoading={deleteLoading === image.id}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
              {filteredImages.map((image, index) => (
                <ImageListItem
                  key={image.id}
                  image={image}
                  onCopy={() => handleCopy(image.url, image.id)}
                  onDelete={() => handleDelete(image.id)}
                  copied={copiedId === image.id}
                  deleteLoading={deleteLoading === image.id}
                  isLast={index === filteredImages.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ImageCard({ 
  image, 
  onCopy, 
  onDelete, 
  copied,
  deleteLoading
}: { 
  image: ImageEntry; 
  onCopy: () => void; 
  onDelete: () => void;
  copied: boolean;
  deleteLoading: boolean;
}) {
  return (
    <div className="group rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden hover:border-[#00d4ff]/50 transition-all">
      <div className="aspect-video bg-[#0a0a0f] relative">
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onCopy}
            className="p-2 rounded bg-[#00d4ff] text-[#0a0a0f] hover:bg-[#00d4ff]/90 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <a
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded bg-[#1e293b] text-white hover:bg-[#00d4ff]/20 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onDelete}
            disabled={deleteLoading}
            className="p-2 rounded bg-[#ff006e] text-white hover:bg-[#ff006e]/90 transition-colors disabled:opacity-50"
            title="Delete from library"
          >
            {deleteLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className="font-mono text-sm text-white truncate mb-2" title={image.title}>
          {image.title}
        </p>
        
        <div className="flex items-center gap-2 mb-2">
          <span 
            className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase"
            style={{ 
              backgroundColor: `${categoryColors[image.category] || "#64748b"}20`,
              color: categoryColors[image.category] || "#64748b",
              border: `1px solid ${categoryColors[image.category] || "#64748b"}40`
            }}
          >
            {image.category}
          </span>
          {image.usedInPosts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/40">
              Used
            </span>
          )}
        </div>
        
        {image.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="w-3 h-3 text-[#64748b]" />
            {image.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] text-[#64748b] font-mono">
                #{tag}{i < Math.min(image.tags.length, 2) - 1 ? "," : ""}
              </span>
            ))}
            {image.tags.length > 2 && (
              <span className="text-[10px] text-[#64748b] font-mono">
                +{image.tags.length - 2}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#1e293b]">
          <Calendar className="w-3 h-3 text-[#64748b]" />
          <span className="text-[10px] text-[#64748b] font-mono">
            {new Date(image.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function ImageListItem({ 
  image, 
  onCopy, 
  onDelete, 
  copied,
  deleteLoading,
  isLast
}: { 
  image: ImageEntry; 
  onCopy: () => void; 
  onDelete: () => void;
  copied: boolean;
  deleteLoading: boolean;
  isLast: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 p-4 hover:bg-[#0a0a0f]/50 transition-colors ${!isLast ? "border-b border-[#1e293b]" : ""}`}>
      <div className="w-16 h-12 rounded bg-[#0a0a0f] flex-shrink-0 overflow-hidden">
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm text-white truncate">{image.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span 
            className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase"
            style={{ 
              backgroundColor: `${categoryColors[image.category] || "#64748b"}20`,
              color: categoryColors[image.category] || "#64748b",
              border: `1px solid ${categoryColors[image.category] || "#64748b"}40`
            }}
          >
            {image.category}
          </span>
          {image.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] text-[#64748b] font-mono">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-xs font-mono text-[#64748b]">
        <span>{new Date(image.createdAt).toLocaleDateString()}</span>
        {image.usedInPosts.length > 0 && (
          <span className="text-[#39ff14]">Used</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00d4ff]/10 text-[#00d4ff] font-mono text-xs hover:bg-[#00d4ff]/20 transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "copied!" : "copy"}
        </button>
        <a
          href={image.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded text-[#64748b] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={onDelete}
          disabled={deleteLoading}
          className="p-1.5 rounded text-[#ff006e] hover:bg-[#ff006e]/10 transition-colors disabled:opacity-50"
        >
          {deleteLoading ? (
            <div className="w-4 h-4 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
