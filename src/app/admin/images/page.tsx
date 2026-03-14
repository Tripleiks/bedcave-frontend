"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { 
  ArrowLeft, 
  ImageIcon, 
  Upload, 
  Copy, 
  Check, 
  Search, 
  Folder, 
  Grid, 
  List, 
  Trash2, 
  X,
  LogOut,
  FileImage,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageItem {
  filename: string;
  title: string;
  category: string;
  uploadDate: string;
  size: string;
  dimensions: string;
}

export default function ImageLibraryPage() {
  const { logout } = useAuth();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["All", "Hardware", "Docker", "Homelab", "General"];

  // Load images from manifest
  useEffect(() => {
    async function loadImages() {
      try {
        const response = await fetch("/images/posts/manifest.json");
        if (response.ok) {
          const data = await response.json();
          setImages(data.images || []);
        }
      } catch (error) {
        console.error("Failed to load images:", error);
      }
      setIsLoading(false);
    }
    loadImages();
  }, []);

  const filteredImages = images.filter(img => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || img.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyPath = (filename: string) => {
    const path = `/images/posts/${filename}`;
    navigator.clipboard.writeText(path);
    setCopied(filename);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload to a server
      // For now, we show instructions
      alert(`File selected: ${file.name}\n\nTo upload:\n1. Add to public/images/posts/\n2. Update manifest.json\n3. Commit and push`);
    }
  };

  const handleDelete = (filename: string) => {
    if (confirm(`Delete ${filename}?\n\nYou'll need to manually remove it from:\n- public/images/posts/${filename}\n- manifest.json`)) {
      setImages(prev => prev.filter(img => img.filename !== filename));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-[#00d4ff]">
          <div className="w-5 h-5 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
          <span>Loading library...</span>
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
                href="/admin/new-post" 
                className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                $ cd /admin
              </Link>
              <div className="h-6 w-px bg-[#1e293b]" />
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#39ff14]" />
                <span className="font-mono text-[#39ff14]">image-library</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#ff006e]/10 text-[#ff006e] font-mono text-xs hover:bg-[#ff006e]/20 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-mono">
                <span className="text-[#39ff14]">$</span> image_library.sh
              </h1>
              <p className="text-[#64748b] font-mono text-sm">
                // Manage post images and assets
              </p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#00d4ff] text-[#0a0a0f] font-mono font-bold hover:bg-[#00d4ff]/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              $ add_image
            </button>
          </div>

          {/* Filters & Search */}
          <div className="rounded-xl border border-[#1e293b] bg-[#13131f] p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search images..."
                  className="w-full pl-10 pr-4 py-2.5 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-[#64748b]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono focus:border-[#00d4ff] focus:outline-none transition-colors cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
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

          {/* Stats */}
          <div className="flex items-center gap-4 mb-6 font-mono text-sm">
            <span className="text-[#64748b]">
              Total: <span className="text-[#00d4ff]">{images.length}</span> images
            </span>
            <span className="text-[#64748b]">
              Filtered: <span className="text-[#ffbe0b]">{filteredImages.length}</span> images
            </span>
          </div>

          {/* Image Grid */}
          {filteredImages.length === 0 ? (
            <div className="rounded-xl border border-[#1e293b] bg-[#13131f] p-12 text-center">
              <FileImage className="w-16 h-16 text-[#1e293b] mx-auto mb-4" />
              <p className="text-[#64748b] font-mono">
                No images found. Add images to public/images/posts/
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <ImageCard 
                  key={image.filename} 
                  image={image} 
                  onCopy={() => handleCopyPath(image.filename)}
                  onDelete={() => handleDelete(image.filename)}
                  copied={copied === image.filename}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
              {filteredImages.map((image, index) => (
                <ImageListItem
                  key={image.filename}
                  image={image}
                  onCopy={() => handleCopyPath(image.filename)}
                  onDelete={() => handleDelete(image.filename)}
                  copied={copied === image.filename}
                  isLast={index === filteredImages.length - 1}
                />
              ))}
            </div>
          )}

          {/* Usage Instructions */}
          <div className="mt-8 rounded-lg border border-[#1e293b] bg-[#0f0f1a] p-6">
            <h3 className="font-mono text-sm text-[#ffbe0b] mb-4">$ usage_instructions.sh</h3>
            <div className="space-y-3 font-mono text-xs text-[#64748b]">
              <p><span className="text-[#00d4ff]">1.</span> Add images to <span className="text-[#39ff14]">public/images/posts/</span></p>
              <p><span className="text-[#00d4ff]">2.</span> Update <span className="text-[#39ff14]">manifest.json</span> with image metadata</p>
              <p><span className="text-[#00d4ff]">3.</span> Use in MDX: <span className="text-[#ffbe0b]">![Alt](/images/posts/filename.jpg)</span></p>
              <p><span className="text-[#00d4ff]">4.</span> Commit and push to deploy</p>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                <span className="font-mono text-sm text-[#00d4ff]">$ upload_image.sh</span>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-[#64748b] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="border-2 border-dashed border-[#1e293b] rounded-lg p-8 text-center hover:border-[#00d4ff]/50 transition-colors">
                  <Upload className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
                  <p className="text-[#64748b] font-mono text-sm mb-4">
                    Drag & drop or click to select
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded bg-[#00d4ff]/10 text-[#00d4ff] font-mono text-sm hover:bg-[#00d4ff]/20 transition-colors"
                  >
                    $ select_file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <div className="rounded bg-[#0a0a0f] p-4 font-mono text-xs text-[#64748b]">
                  <p className="text-[#ffbe0b] mb-2">// Note:</p>
                  <p>Images must be manually added to the repository.</p>
                  <p className="mt-2">Upload to: <span className="text-[#39ff14]">public/images/posts/</span></p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Image Card Component
function ImageCard({ 
  image, 
  onCopy, 
  onDelete, 
  copied 
}: { 
  image: ImageItem; 
  onCopy: () => void; 
  onDelete: () => void;
  copied: boolean;
}) {
  return (
    <div className="group rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden hover:border-[#00d4ff]/50 transition-all">
      {/* Image Preview */}
      <div className="aspect-video bg-[#0a0a0f] relative flex items-center justify-center">
        <FileImage className="w-12 h-12 text-[#1e293b]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13131f] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onCopy}
            className="p-2 rounded bg-[#00d4ff] text-[#0a0a0f] hover:bg-[#00d4ff]/90 transition-colors"
            title="Copy path"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded bg-[#ff006e] text-white hover:bg-[#ff006e]/90 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-mono text-sm text-white truncate" title={image.title}>
          {image.filename}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#64748b]">
          <span className="px-1.5 py-0.5 rounded bg-[#1e293b]">{image.category}</span>
          <span>{image.dimensions}</span>
        </div>
        <p className="text-[#64748b] text-xs mt-1">{image.size}</p>
      </div>
    </div>
  );
}

// Image List Item Component
function ImageListItem({ 
  image, 
  onCopy, 
  onDelete, 
  copied,
  isLast
}: { 
  image: ImageItem; 
  onCopy: () => void; 
  onDelete: () => void;
  copied: boolean;
  isLast: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 p-4 hover:bg-[#0a0a0f]/50 transition-colors ${!isLast ? "border-b border-[#1e293b]" : ""}`}>
      {/* Icon */}
      <div className="w-12 h-12 rounded bg-[#0a0a0f] flex items-center justify-center flex-shrink-0">
        <FileImage className="w-6 h-6 text-[#64748b]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm text-white truncate">{image.filename}</p>
        <div className="flex items-center gap-3 mt-1 text-xs font-mono text-[#64748b]">
          <span className="px-1.5 py-0.5 rounded bg-[#1e293b]">{image.category}</span>
          <span>{image.dimensions}</span>
          <span>{image.size}</span>
          <span>{image.uploadDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00d4ff]/10 text-[#00d4ff] font-mono text-xs hover:bg-[#00d4ff]/20 transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "copied!" : "copy"}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded text-[#ff006e] hover:bg-[#ff006e]/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
