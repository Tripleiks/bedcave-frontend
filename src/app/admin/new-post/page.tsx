"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { 
  ArrowLeft, Copy, Check, FileCode, Terminal, Tag, Calendar, User, Folder, 
  LogOut, ImageIcon, Plus, X, FileImage, Sparkles, Library, Search,
  Wand2, Loader2, Archive, Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LibraryImage {
  id: string;
  url: string;
  title: string;
  tags: string[];
  category: string;
  createdAt: string;
}

export default function NewPostPage() {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    excerpt: "",
    category: "General",
    tags: "",
    author: "Bedcave Team",
    content: "",
    coverImage: "",
  });
  
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archived, setArchived] = useState(false);
  
  // Cover Image State
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showGenerateImage, setShowGenerateImage] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState("");

  // Load available images
  useEffect(() => {
    async function loadImages() {
      try {
        const response = await fetch("/images/posts/manifest.json");
        if (response.ok) {
          const data = await response.json();
          setAvailableImages(data.images?.map((img: { filename: string }) => img.filename) || []);
        }
      } catch (error) {
        console.error("Failed to load images:", error);
      }
    }
    loadImages();
  }, []);

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

  const generateCoverImage = async () => {
    if (!formData.title) {
      alert("Please enter a title first!");
      return;
    }
    
    setImageGenerating(true);
    try {
      const response = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(formData.title)}&orientation=landscape`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setGeneratedImageUrl(data.data.url);
          setFormData(prev => ({ ...prev, coverImage: data.data.url }));
        }
      }
    } catch (error) {
      console.error("Image generation error:", error);
      alert("Failed to generate image");
    } finally {
      setImageGenerating(false);
    }
  };

  const selectLibraryImage = (image: LibraryImage) => {
    setFormData(prev => ({ ...prev, coverImage: image.url }));
    setShowLibrary(false);
    if (!showOutput) setShowOutput(true);
  };

  const categories = ["General", "Hardware", "Docker", "Homelab"];

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
  };

  const generateMDX = () => {
    const slug = generateSlug(formData.title);
    const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t);
    
    return `---
title: "${formData.title}"
date: "${formData.date}"
excerpt: "${formData.excerpt}"
category: "${formData.category}"
${formData.coverImage ? `coverImage: "${formData.coverImage}"` : ""}
tags: [${tagsArray.map(t => `"${t}"`).join(", ")}]
author: "${formData.author}"
---

${formData.content || "# Dein Inhalt hier\n\nSchreibe etwas Spannendes..."}
`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateMDX());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (!showOutput && value) setShowOutput(true);
  };

  const insertImage = (filename: string) => {
    const imageMarkdown = `\n\n![${filename.replace(/\.[^/.]+$/, "")}](/images/posts/${filename})\n\n`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + imageMarkdown
    }));
    setShowImagePicker(false);
    if (!showOutput) setShowOutput(true);
  };

  const archivePost = async () => {
    if (!formData.title) {
      alert("Please enter a title first!");
      return;
    }
    
    setArchiving(true);
    
    try {
      const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t);
      
      const response = await fetch("/api/posts/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content || "# Dein Inhalt hier\n\nSchreibe etwas Spannendes...",
          category: formData.category,
          tags: tagsArray,
          excerpt: formData.excerpt,
          imageUrl: formData.coverImage,
          author: formData.author,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to archive");
      }
      
      const data = await response.json();
      setArchived(true);
      alert(`✅ Archived successfully! File: ${data.path}`);
    } catch (error: any) {
      console.error("Archive error:", error);
      alert(`❌ Failed to archive: ${error.message}`);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#0f0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/" 
              className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              $ cd /home
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/ai-generator"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#ffbe0b]/10 text-[#ffbe0b] font-mono text-xs hover:bg-[#ffbe0b]/20 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI</span>
              </Link>
              <Link
                href="/admin/images"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#39ff14]/10 text-[#39ff14] font-mono text-xs hover:bg-[#39ff14]/20 transition-colors"
              >
                <ImageIcon className="w-3 h-3" />
                <span>images</span>
              </Link>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#39ff14]" />
                <span className="font-mono text-[#39ff14]">admin/new-post</span>
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
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 font-mono">
              <span className="text-[#39ff14]">$</span> create_new_post.sh
            </h1>
            <p className="text-[#64748b] font-mono text-sm">
              // Generate MDX blog posts with terminal precision
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              {/* Terminal Window */}
              <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
                {/* Window Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff006e]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbe0b]" />
                    <div className="w-3 h-3 rounded-full bg-[#39ff14]" />
                  </div>
                  <span className="ml-4 font-mono text-xs text-[#64748b]">post-config.json</span>
                </div>

                {/* Form Fields */}
                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                      <FileCode className="w-4 h-4" />
                      <span>title</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Dein Artikel-Titel..."
                      className="w-full px-4 py-3 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Date & Category Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>date</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className="w-full px-4 py-3 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono focus:border-[#00d4ff] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                        <Folder className="w-4 h-4" />
                        <span>category</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className="w-full px-4 py-3 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono focus:border-[#00d4ff] focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                      <Tag className="w-4 h-4" />
                      <span>tags</span>
                      <span className="text-[#64748b] text-xs">// comma separated</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange("tags", e.target.value)}
                      placeholder="docker, tutorial, homelab"
                      className="w-full px-4 py-3 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                      <User className="w-4 h-4" />
                      <span>author</span>
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => handleInputChange("author", e.target.value)}
                      placeholder="Bedcave Team"
                      className="w-full px-4 py-3 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                      <span>excerpt</span>
                      <span className="text-[#64748b] text-xs">// short description</span>
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange("excerpt", e.target.value)}
                      placeholder="Kurze Beschreibung für die Vorschau..."
                      rows={2}
                      className="w-full px-4 py-3 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>cover_image</span>
                    </label>
                    
                    {formData.coverImage ? (
                      <div className="rounded-lg border border-[#1e293b] bg-[#0a0a0f] overflow-hidden">
                        <div className="aspect-video relative">
                          <img
                            src={formData.coverImage}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                            className="absolute top-2 right-2 p-1.5 rounded bg-[#ff006e] text-white hover:bg-[#ff006e]/90 transition-colors"
                            title="Remove cover image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-3 flex items-center gap-2">
                          <button
                            onClick={() => setShowLibrary(true)}
                            className="flex-1 py-2 rounded border border-[#1e293b] text-[#64748b] hover:text-[#00d4ff] hover:border-[#00d4ff] font-mono text-xs transition-all"
                          >
                            <Library className="w-3 h-3 inline mr-1" />
                            Change from Library
                          </button>
                          <button
                            onClick={generateCoverImage}
                            disabled={imageGenerating}
                            className="flex-1 py-2 rounded border border-[#1e293b] text-[#64748b] hover:text-[#ff006e] hover:border-[#ff006e] font-mono text-xs transition-all disabled:opacity-50"
                          >
                            {imageGenerating ? (
                              <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3 inline mr-1" />
                            )}
                            Regenerate with AI
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-[#1e293b] bg-[#0a0a0f] p-6">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-[#64748b]" />
                          </div>
                          <p className="text-[#64748b] font-mono text-sm">No cover image selected</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowLibrary(true)}
                              className="px-4 py-2 rounded border border-[#00d4ff] text-[#00d4ff] font-mono text-sm hover:bg-[#00d4ff]/10 transition-all"
                            >
                              <Library className="w-4 h-4 inline mr-2" />
                              From Library
                            </button>
                            <button
                              onClick={generateCoverImage}
                              disabled={imageGenerating || !formData.title}
                              className="px-4 py-2 rounded bg-[#ff006e] text-white font-mono text-sm hover:bg-[#ff006e]/90 transition-all disabled:opacity-50"
                            >
                              {imageGenerating ? (
                                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4 inline mr-2" />
                              )}
                              Generate AI
                            </button>
                          </div>
                          {!formData.title && (
                            <p className="text-[#ffbe0b] font-mono text-xs">
                              // Enter a title to generate image
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff]">
                        <span>content</span>
                        <span className="text-[#64748b] text-xs">// markdown supported</span>
                      </label>
                      <button
                        onClick={() => setShowImagePicker(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#39ff14]/10 text-[#39ff14] font-mono text-xs hover:bg-[#39ff14]/20 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <ImageIcon className="w-3 h-3" />
                        insert image
                      </button>
                    </div>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      placeholder="# Überschrift\n\nDein Inhalt hier...\n\n- Listen\n- Code-Blöcke\n- Tabellen"
                      rows={12}
                      className="w-full px-4 py-3 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Image Gallery */}
              {availableImages.length > 0 && (
                <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                    <span className="font-mono text-xs text-[#64748b]">quick-insert.json</span>
                    <span className="font-mono text-xs text-[#39ff14]">{availableImages.length} images</span>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {availableImages.slice(0, 8).map((filename) => (
                        <button
                          key={filename}
                          onClick={() => insertImage(filename)}
                          className="aspect-square rounded bg-[#0a0a0f] border border-[#1e293b] hover:border-[#00d4ff] flex flex-col items-center justify-center gap-1 transition-all group"
                          title={`Insert ${filename}`}
                        >
                          <FileImage className="w-6 h-6 text-[#64748b] group-hover:text-[#00d4ff]" />
                          <span className="font-mono text-[10px] text-[#64748b] truncate w-full px-1 text-center">
                            {filename.slice(0, 10)}...
                          </span>
                        </button>
                      ))}
                    </div>
                    {availableImages.length > 8 && (
                      <button
                        onClick={() => setShowImagePicker(true)}
                        className="w-full mt-3 py-2 rounded bg-[#0a0a0f] border border-[#1e293b] text-[#64748b] font-mono text-xs hover:border-[#00d4ff] hover:text-[#00d4ff] transition-colors"
                      >
                        + {availableImages.length - 8} more images
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Output Preview */}
            <div className="space-y-4">
              <AnimatePresence>
                {showOutput && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden"
                  >
                    {/* Window Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#ff006e]" />
                          <div className="w-3 h-3 rounded-full bg-[#ffbe0b]" />
                          <div className="w-3 h-3 rounded-full bg-[#39ff14]" />
                        </div>
                        <span className="ml-4 font-mono text-xs text-[#64748b]">
                          {generateSlug(formData.title) || "new-post"}.mdx
                        </span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#00d4ff]/10 text-[#00d4ff] font-mono text-xs hover:bg-[#00d4ff]/20 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={archivePost}
                        disabled={archiving || archived}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs transition-all ${
                          archived
                            ? "bg-[#ffbe0b] text-[#0a0a0f]"
                            : "bg-[#8338ec] text-white hover:bg-[#8338ec]/90"
                        } disabled:opacity-50`}
                      >
                        {archiving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>saving...</span>
                          </>
                        ) : archived ? (
                          <>
                            <Archive className="w-4 h-4" />
                            <span>saved!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>save to repo</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Generated Code */}
                    <div className="p-4 overflow-x-auto">
                      <pre className="font-mono text-sm text-[#39ff14] whitespace-pre-wrap">
                        {generateMDX()}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instructions */}
              <div className="rounded-lg border border-[#1e293b] bg-[#0f0f1a] p-4">
                <h3 className="font-mono text-sm text-[#ffbe0b] mb-3">$ instructions.sh</h3>
                <ol className="font-mono text-xs text-[#64748b] space-y-2 list-decimal list-inside">
                  <li>Fülle das Formular aus</li>
                  <li>Klicke <span className="text-[#8338ec]">save to repo</span> um direkt zu speichern</li>
                  <li>Oder kopiere den MDX-Code und erstelle manuell</li>
                  <li>Vercel deployt automatisch bei GitHub Push!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

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
                        generateCoverImage();
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
                          onClick={() => selectLibraryImage(libraryImage)}
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
                          {formData.coverImage === libraryImage.url && (
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

      {/* Image Picker Modal */}
      <AnimatePresence>
        {showImagePicker && (
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
              className="w-full max-w-2xl max-h-[80vh] rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#39ff14]" />
                  <span className="font-mono text-sm text-[#00d4ff]">$ select_image.sh</span>
                </div>
                <button
                  onClick={() => setShowImagePicker(false)}
                  className="text-[#64748b] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {availableImages.length === 0 ? (
                  <div className="text-center py-12">
                    <FileImage className="w-16 h-16 text-[#1e293b] mx-auto mb-4" />
                    <p className="text-[#64748b] font-mono text-sm">
                      No images found.
                    </p>
                    <p className="text-[#64748b] font-mono text-xs mt-2">
                      Add images to public/images/posts/
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {availableImages.map((filename) => (
                      <button
                        key={filename}
                        onClick={() => insertImage(filename)}
                        className="aspect-square rounded-lg bg-[#0a0a0f] border border-[#1e293b] hover:border-[#00d4ff] flex flex-col items-center justify-center gap-2 p-3 transition-all group"
                      >
                        <FileImage className="w-10 h-10 text-[#64748b] group-hover:text-[#00d4ff]" />
                        <span className="font-mono text-xs text-[#64748b] group-hover:text-white truncate w-full text-center">
                          {filename}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-3 border-t border-[#1e293b] bg-[#0f0f1a]">
                <p className="text-[#64748b] font-mono text-xs text-center">
                  Click an image to insert: <span className="text-[#ffbe0b]">![alt](/images/posts/filename.jpg)</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
