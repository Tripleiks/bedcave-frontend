"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Copy, Check, FileCode, Terminal, Tag, Calendar, User, Folder, Save, Loader2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPostBySlug } from "@/lib/mdx/posts";

export default function EditPostPage() {
  const { logout } = useAuth();
  const params = useParams();
  const slug = params.slug as string;
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    excerpt: "",
    category: "General",
    tags: "",
    author: "",
    content: "",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const categories = ["General", "Hardware", "Docker", "Homelab"];

  // Load existing post
  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);
      try {
        // Import the content directly
        const response = await fetch(`/api/posts/${slug}`);
        if (response.ok) {
          const post = await response.json();
          setFormData({
            title: post.title || "",
            date: post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            excerpt: post.excerpt || "",
            category: post.category || "General",
            tags: post.tags?.join(", ") || "",
            author: post.author || "Bedcave Team",
            content: post.content || "",
          });
        }
      } catch (error) {
        console.error("Failed to load post:", error);
        // Fallback: try to get from static data
        const { getPostBySlug } = await import("@/lib/mdx/posts");
        const post = getPostBySlug(slug);
        if (post) {
          setFormData({
            title: post.title,
            date: new Date(post.date).toISOString().split('T')[0],
            excerpt: post.excerpt,
            category: post.category,
            tags: post.tags.join(", "),
            author: post.author,
            content: post.content,
          });
        }
      }
      setIsLoading(false);
    }
    
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
  };

  const generateMDX = () => {
    const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t);
    
    return `---
title: "${formData.title}"
date: "${formData.date}"
excerpt: "${formData.excerpt}"
category: "${formData.category}"
tags: [${tagsArray.map(t => `"${t}"`).join(", ")}]
author: "${formData.author}"
---

${formData.content}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-[#00d4ff]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading post...</span>
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
            <Link 
              href="/admin/new-post" 
              className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              $ cd /admin
            </Link>
            <div className="flex items-center gap-2">
              <Save className="w-5 h-5 text-[#ffbe0b]" />
              <span className="font-mono text-[#ffbe0b]">edit/{slug}</span>
              <button
                onClick={logout}
                className="ml-4 flex items-center gap-1 px-3 py-1.5 rounded bg-[#ff006e]/10 text-[#ff006e] font-mono text-xs hover:bg-[#ff006e]/20 transition-colors"
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
              <span className="text-[#ffbe0b]">$</span> edit_post.sh
            </h1>
            <p className="text-[#64748b] font-mono text-sm">
              // Edit existing blog post: {slug}
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
                  <span className="ml-4 font-mono text-xs text-[#64748b]">{slug}.mdx</span>
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

                  {/* Content */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                      <span>content</span>
                      <span className="text-[#64748b] text-xs">// markdown supported</span>
                    </label>
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
                          {slug}.mdx (updated)
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
                <h3 className="font-mono text-sm text-[#ffbe0b] mb-3">$ update_instructions.sh</h3>
                <ol className="font-mono text-xs text-[#64748b] space-y-2 list-decimal list-inside">
                  <li>Ändere die gewünschten Felder</li>
                  <li>Kopiere den aktualisierten MDX-Code</li>
                  <li>Ersetze Inhalt in <span className="text-[#00d4ff]">content/posts/{slug}.mdx</span></li>
                  <li>Committe und pushe zu GitHub</li>
                  <li>Vercel deployt automatisch!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
