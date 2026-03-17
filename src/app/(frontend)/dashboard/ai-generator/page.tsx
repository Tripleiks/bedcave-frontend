"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Image as ImageIcon,
  FileText,
  Loader2,
  Save,
  ArrowLeft,
  Wand2,
  Download,
  Database,
  Library,
  X,
  Check,
  Search,
} from "lucide-react";
import Link from "next/link";

interface GeneratedPost {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  keywords: string[];
  sources?: string[];
}

interface GeneratedImage {
  id: string;
  url: string;
  thumb: string;
  author: string;
  authorUrl: string;
  description: string;
}

interface LibraryImage {
  id: string;
  url: string;
  title: string;
  prompt: string;
  tags: string[];
  category: string;
  createdAt: string;
}

const categories = [
  { value: "docker", label: "Docker", icon: "🐳" },
  { value: "hardware", label: "Hardware", icon: "🔧" },
  { value: "homelab", label: "Homelab", icon: "🏠" },
  { value: "news", label: "News", icon: "📰" },
  { value: "tutorial", label: "Tutorial", icon: "📚" },
];

export default function AIGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("docker");
  const [sticky, setSticky] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  
  // Library state
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");

  // Load library images
  useEffect(() => {
    fetchLibraryImages();
  }, []);

  const fetchLibraryImages = async () => {
    try {
      const response = await fetch("/api/images/library");
      const data = await response.json();
      if (data.success) {
        setLibraryImages(data.images);
      }
    } catch (error) {
      console.error("Failed to load library images:", error);
    }
  };

  const selectFromLibrary = (libraryImage: LibraryImage) => {
    setImage({
      id: libraryImage.id,
      url: libraryImage.url,
      thumb: libraryImage.url,
      author: "Grok Aurora AI (Library)",
      authorUrl: "https://x.ai",
      description: libraryImage.title
    });
    setShowLibrary(false);
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setSaved(false);
    
    try {
      // Generate blog content
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setGeneratedPost(data.data);
      
      // Search for image
      setImageLoading(true);
      try {
        const imageResponse = await fetch(
          `/api/unsplash/search?query=${encodeURIComponent(data.data.title)}&orientation=landscape`
        );
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          if (imageData.success && imageData.data) {
            setImage(imageData.data);
          } else {
            console.warn("Image API returned no data:", imageData);
            setImage(null);
          }
        } else {
          const errorData = await imageResponse.json().catch(() => ({}));
          console.error("Image API error:", imageResponse.status, errorData);
          alert(`Image generation failed: ${errorData.error || `HTTP ${imageResponse.status}`}`);
          setImage(null);
        }
      } catch (imageError: any) {
        console.error("Image fetch error:", imageError);
        alert(`Image error: ${imageError.message}`);
        setImage(null);
      } finally {
        setImageLoading(false);
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      const errorMessage = error.message || "Unknown error";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setImageLoading(false);
    }
  };

  const downloadMDX = () => {
    if (!generatedPost) return;
    
    const date = new Date().toISOString().split("T")[0];
    
    // Create frontmatter
    const frontmatter = `---
title: "${generatedPost.title}"
date: "${date}"
excerpt: "${generatedPost.excerpt}"
category: "${category}"
coverImage: "${image?.url || ''}"
tags: [${generatedPost.tags.map((t: string) => `"${t}"`).join(', ')}]
author: "Grok Aurora"
sticky: ${sticky}
sources: ${JSON.stringify(generatedPost.sources || [])}
---`;

    const mdxContent = `${frontmatter}\n\n${generatedPost.content}`;
    
    // Create blob and download
    const blob = new Blob([mdxContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    const slug = generatedPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    a.href = url;
    a.download = `${slug}.mdx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSaved(true);
  };

  const regenerateImage = async () => {
    if (!generatedPost?.title) return;
    setImageLoading(true);
    
    try {
      const imageResponse = await fetch(
        `/api/grok/search?query=${encodeURIComponent(generatedPost.title)}&orientation=landscape`
      );
      
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        setImage(imageData.data);
      }
    } catch (error) {
      console.error("Image search error:", error);
    } finally {
      setImageLoading(false);
    }
  };

  // Save cover image to library
  const saveImageToLibrary = async () => {
    if (!image?.url || !generatedPost?.title) return;
    
    try {
      const response = await fetch("/api/images/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: image.url,
          title: generatedPost.title,
          prompt: generatedPost.title,
          tags: generatedPost.tags || [],
          category: category || "general",
          source: "grok-aurora",
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Image saved to library:", data.image?.id);
        return data.image;
      } else {
        const error = await response.json();
        console.warn("⚠️ Failed to save image to library:", error.error);
      }
    } catch (error) {
      console.error("❌ Error saving image to library:", error);
    }
    return null;
  };

  const publishPost = async () => {
    if (!generatedPost) return;
    setPublishing(true);

    try {
      const response = await fetch("/api/payload/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generatedPost.title,
          content: generatedPost.content,
          category,
          tags: generatedPost.tags,
          excerpt: generatedPost.excerpt,
          imageUrl: image?.url,
          sticky,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to publish");
      }

      const data = await response.json();
      setPublished(true);
      alert(`✅ In Payload gespeichert! Post ID: ${data.postId} — Slug: ${data.slug}`);
    } catch (error: any) {
      console.error("Publish error:", error);
      alert(`❌ Fehler: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#13131f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/new-post" 
                className="flex items-center gap-2 text-[#64748b] hover:text-[#00d4ff] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-mono text-sm">Back</span>
              </Link>
              <div className="h-6 w-px bg-[#1e293b]" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ffbe0b]" />
                <span className="font-mono text-lg font-bold">AI Blog Generator</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#64748b]">Powered by Perplexity AI + Grok Aurora</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden mb-8">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
              <Wand2 className="w-4 h-4 text-[#8338ec]" />
              <span className="font-mono text-xs text-[#64748b]">$ ai.generate --prompt</span>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Category Selection */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-4 py-2 rounded font-mono text-sm transition-all ${
                      category === cat.value
                        ? "bg-[#00d4ff]/20 border border-[#00d4ff] text-[#00d4ff]"
                        : "bg-[#1e293b] border border-transparent text-[#64748b] hover:border-[#64748b]"
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Sticky Checkbox */}
              <div className="flex items-center gap-3 py-2">
                <button
                  onClick={() => setSticky(!sticky)}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm transition-all ${
                    sticky
                      ? "bg-[#ffbe0b]/20 border border-[#ffbe0b] text-[#ffbe0b]"
                      : "bg-[#1e293b] border border-transparent text-[#64748b] hover:border-[#64748b]"
                  }`}
                >
                  <span className="mr-2">{sticky ? "📌" : "📍"}</span>
                  {sticky ? "STICKY POST" : "MARK AS STICKY"}
                </button>
                <span className="text-xs text-[#64748b] font-mono">
                  {sticky ? "// Will appear in featured section" : "// Click to feature this post"}
                </span>
              </div>

              {/* Prompt Input */}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your blog topic... (e.g., 'Docker Compose tutorial for beginners', 'Intel NUC 13 review', 'Homelab network setup guide')"
                  className="w-full h-32 px-4 py-3 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-[#64748b] font-mono">
                  {prompt.length} chars
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateContent}
                disabled={loading || !prompt.trim()}
                className="w-full py-4 rounded bg-[#8338ec] text-white font-mono font-bold hover:bg-[#8338ec]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    GENERATING CONTENT...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    GENERATE BLOG POST
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {generatedPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Generated Content Preview */}
              <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#39ff14]" />
                    <span className="font-mono text-xs text-[#64748b]">Generated Content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={publishPost}
                      disabled={publishing || published}
                      className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-bold transition-all ${
                        published
                          ? "bg-[#39ff14] text-[#0a0a0f]"
                          : "bg-[#00d4ff] text-[#0a0a0f] hover:bg-[#00d4ff]/90"
                      } disabled:opacity-50`}
                    >
                      {publishing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          SAVING...
                        </>
                      ) : published ? (
                        <>
                          <Database className="w-4 h-4" />
                          SAVED!
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          SAVE TO PAYLOAD
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadMDX}
                      className="flex items-center gap-2 px-4 py-2 rounded bg-[#1e293b] text-[#00d4ff] font-mono text-sm font-bold hover:bg-[#1e293b]/80 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block font-mono text-xs text-[#64748b] mb-1">Title</label>
                    <h2 className="text-2xl font-bold text-white">{generatedPost.title}</h2>
                  </div>
                  
                  {/* Excerpt */}
                  <div>
                    <label className="block font-mono text-xs text-[#64748b] mb-1">Excerpt</label>
                    <p className="text-[#94a3b8]">{generatedPost.excerpt}</p>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="block font-mono text-xs text-[#64748b] mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {generatedPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-[#1e293b] text-[#00d4ff] font-mono text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Content Preview */}
                  <div>
                    <label className="block font-mono text-xs text-[#64748b] mb-2">Content Preview</label>
                    <div className="bg-[#0a0a0f] rounded p-4 font-mono text-sm text-[#94a3b8] max-h-96 overflow-y-auto whitespace-pre-wrap">
                      {generatedPost.content.substring(0, 1000)}...
                    </div>
                  </div>
                  
                  {/* Sources */}
                  {generatedPost.sources && generatedPost.sources.length > 0 && (
                    <div>
                      <label className="block font-mono text-xs text-[#64748b] mb-2">Sources</label>
                      <div className="bg-[#0a0a0f] rounded p-4 border border-[#1e293b]">
                        <ul className="space-y-2">
                          {generatedPost.sources.map((source, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-[#00d4ff] font-mono text-xs">[{index + 1}]</span>
                              <a 
                                href={source} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#64748b] hover:text-[#00d4ff] font-mono text-xs break-all transition-colors"
                              >
                                {source}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Section */}
              <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#ff006e]" />
                    <span className="font-mono text-xs text-[#64748b]">Cover Image</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLibrary(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#1e293b] text-[#64748b] hover:text-[#00d4ff] hover:border-[#00d4ff] font-mono text-xs transition-all"
                    >
                      <Library className="w-3 h-3" />
                      FROM LIBRARY
                    </button>
                    <button
                      onClick={regenerateImage}
                      disabled={imageLoading}
                      className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#1e293b] text-[#64748b] hover:text-[#ff006e] hover:border-[#ff006e] font-mono text-xs transition-all"
                    >
                      {imageLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          NEW IMAGE
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {image ? (
                    <div className="space-y-3">
                      <img
                        src={image.url}
                        alt={image.description || "Cover image"}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <p className="text-xs text-[#64748b] text-center font-mono">
                        Image by <a href={image.authorUrl} target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">{image.author}</a>
                      </p>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center bg-[#0a0a0f] rounded-lg gap-4">
                      <p className="text-[#64748b] font-mono text-sm">No image selected</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowLibrary(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded border border-[#00d4ff] text-[#00d4ff] font-mono text-sm hover:bg-[#00d4ff]/10 transition-all"
                        >
                          <Library className="w-4 h-4" />
                          Select from Library
                        </button>
                        <span className="text-[#64748b] font-mono text-sm">or</span>
                        <button
                          onClick={regenerateImage}
                          disabled={imageLoading}
                          className="flex items-center gap-2 px-4 py-2 rounded bg-[#ff006e] text-white font-mono text-sm hover:bg-[#ff006e]/90 transition-all disabled:opacity-50"
                        >
                          {imageLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Generate New
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Library Selection Modal */}
              <AnimatePresence>
                {showLibrary && (
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
                      className="w-full max-w-4xl max-h-[80vh] rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden flex flex-col"
                    >
                      {/* Modal Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                        <div className="flex items-center gap-2">
                          <Library className="w-4 h-4 text-[#00d4ff]" />
                          <span className="font-mono text-sm text-[#00d4ff]">$ select_from_library.sh</span>
                        </div>
                        <button
                          onClick={() => setShowLibrary(false)}
                          className="text-[#64748b] hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Search */}
                      <div className="p-4 border-b border-[#1e293b]">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                          <input
                            type="text"
                            value={librarySearch}
                            onChange={(e) => setLibrarySearch(e.target.value)}
                            placeholder="Search library images..."
                            className="w-full pl-10 pr-4 py-2 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                      
                      {/* Image Grid */}
                      <div className="flex-1 overflow-y-auto p-4">
                        {libraryImages.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-[#64748b] font-mono text-sm mb-4">// No images in library yet</p>
                            <button
                              onClick={() => {
                                setShowLibrary(false);
                                regenerateImage();
                              }}
                              className="px-4 py-2 rounded bg-[#00d4ff] text-[#0a0a0f] font-mono text-sm hover:bg-[#00d4ff]/90 transition-colors"
                            >
                              Generate First Image →
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {libraryImages
                              .filter(img => 
                                img.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
                                img.tags.some(tag => tag.toLowerCase().includes(librarySearch.toLowerCase()))
                              )
                              .map((libraryImage) => (
                                <button
                                  key={libraryImage.id}
                                  onClick={() => selectFromLibrary(libraryImage)}
                                  className="group relative rounded-lg border border-[#1e293b] bg-[#0a0a0f] overflow-hidden hover:border-[#00d4ff]/50 transition-all text-left"
                                >
                                  <div className="aspect-video">
                                    <img
                                      src={libraryImage.url}
                                      alt={libraryImage.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-2">
                                    <p className="font-mono text-xs text-white truncate">{libraryImage.title}</p>
                                    <p className="font-mono text-[10px] text-[#64748b]">
                                      {new Date(libraryImage.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {image?.id === libraryImage.id && (
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#00d4ff] flex items-center justify-center">
                                      <Check className="w-4 h-4 text-[#0a0a0f]" />
                                    </div>
                                  )}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Modal Footer */}
                      <div className="px-4 py-3 border-t border-[#1e293b] bg-[#0f0f1a] flex items-center justify-between">
                        <span className="font-mono text-xs text-[#64748b]">
                          {libraryImages.length} images in library
                        </span>
                        <button
                          onClick={() => setShowLibrary(false)}
                          className="px-4 py-2 rounded border border-[#1e293b] text-[#64748b] font-mono text-sm hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instructions */}
              <div className="rounded-lg border border-[#1e293b] bg-[#0f0f1a] p-4">
                <p className="font-mono text-sm text-[#64748b]">
                  {published ? (
                    <><span className="text-[#39ff14]">✓</span> In Payload gespeichert und sofort live! Im Admin unter /admin einsehbar.</>
                  ) : (
                    <><span className="text-[#ffbe0b]">⚠</span> Klick "SAVE TO PAYLOAD" um direkt in Payload CMS zu speichern, oder "DOWNLOAD" für ein MDX-Backup.</>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
