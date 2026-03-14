"use client";

import { motion } from "framer-motion";
import { ArticleCard } from "@/components/article-card";
import { HeroSection } from "@/components/hero-section";
import { Post } from "@/lib/mdx/posts";
import { Terminal, ArrowRight, Cpu, Mail } from "lucide-react";
import Link from "next/link";

interface HomeContentProps {
  recentPosts: Post[];
  stickyPosts: Post[];
}

export function HomeContent({ recentPosts, stickyPosts }: HomeContentProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <HeroSection />

      {/* Content Sections */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Featured / Sticky Posts - Terminal Style */}
        {stickyPosts.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1e293b] border border-[#1e293b]">
                <Terminal className="w-4 h-4 text-[#00d4ff]" />
                <span className="font-mono text-sm text-[#00d4ff]">$ cat featured.log</span>
              </div>
              <div className="flex-1 h-px bg-[#1e293b]" />
              <Link href="#latest" className="font-mono text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors">
                view_all --tree
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stickyPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} variant="default" />
              ))}
            </div>
          </motion.section>
        )}

        {/* Latest Posts - Symmetrical Grid */}
        <motion.section 
          id="latest"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="scroll-mt-24"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1e293b] border border-[#1e293b]">
              <Cpu className="w-4 h-4 text-[#39ff14]" />
              <span className="font-mono text-sm text-[#39ff14]">$ ls -la /all-posts/ ({recentPosts.length} items)</span>
            </div>
            <div className="flex-1 h-px bg-[#1e293b]" />
          </div>

          {/* Featured Top 2 - larger */}
          {recentPosts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {recentPosts.slice(0, 2).map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="lg:row-span-1"
                >
                  <ArticleCard post={post} variant="featured" />
                </motion.div>
              ))}
            </div>
          )}
          
          {/* All remaining posts - standard size */}
          {recentPosts.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.slice(2).map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ArticleCard post={post} variant="default" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Newsletter Section - Terminal Command Style */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <div className="relative rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff006e]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbe0b]" />
                <div className="w-3 h-3 rounded-full bg-[#39ff14]" />
              </div>
              <span className="ml-4 font-mono text-xs text-[#64748b]">user@bedcave:~$ subscribe --newsletter</span>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="max-w-2xl">
                <h2 className="font-mono text-3xl font-bold text-white mb-4">
                  <span className="text-[#8338ec]">const</span>{" "}
                  <span className="text-[#00d4ff]">subscriber</span>{" "}={" "}
                  <span className="text-[#ff006e]">await</span>{" "}
                  <span className="text-[#ffbe0b]">newsletter</span>.{" "}
                  <span className="text-white">join</span>({""}
                  <span className="text-[#39ff14]">&quot;you@email.com&quot;</span>
                  );
                </h2>
                <p className="text-[#64748b] mb-8 font-mono text-sm">
                  // Get the latest tech insights, homelab tutorials, and hardware reviews 
                  <br />
                  // delivered directly to your inbox. No spam, just bytes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                    <input
                      type="email"
                      placeholder="you@email.com"
                      className="w-full pl-12 pr-4 py-4 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors"
                    />
                  </div>
                  <button className="group px-8 py-4 rounded bg-[#00d4ff] text-[#0a0a0f] font-mono font-bold hover:bg-[#00d4ff]/90 transition-all flex items-center justify-center gap-2">
                    <span>EXECUTE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Technology Sponsors */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1e293b] border border-[#1e293b]">
              <Terminal className="w-4 h-4 text-[#ffbe0b]" />
              <span className="font-mono text-sm text-[#ffbe0b]">$ cat sponsors.conf</span>
            </div>
            <div className="flex-1 h-px bg-[#1e293b]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Unifi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="group relative rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden hover:border-[#00d4ff]/50 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-6 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#00d4ff]" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <h3 className="font-mono text-xl font-bold text-white">UniFi</h3>
                </div>
                <p className="text-[#64748b] font-mono text-sm mb-4">
                  // Enterprise networking gear for your homelab. Access points, switches, and security gateways.
                </p>
                <a 
                  href="https://ui.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#00d4ff] font-mono text-sm hover:underline"
                >
                  <span>ui.com</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>

            {/* Unraid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden hover:border-[#ff6c00]/50 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff6c00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-6 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#ff6c00]/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#ff6c00]" fill="currentColor">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                    </svg>
                  </div>
                  <h3 className="font-mono text-xl font-bold text-white">Unraid</h3>
                </div>
                <p className="text-[#64748b] font-mono text-sm mb-4">
                  // NAS operating system with Docker support. The ultimate homelab OS for storage and apps.
                </p>
                <a 
                  href="https://unraid.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#ff6c00] font-mono text-sm hover:underline"
                >
                  <span>unraid.net</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>

            {/* Omarchy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden hover:border-[#8338ec]/50 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#8338ec]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-6 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#8338ec]/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#8338ec]" fill="currentColor">
                      <path d="M12 2L2 19h20L12 2zm0 3l8 14H4l8-14z"/>
                    </svg>
                  </div>
                  <h3 className="font-mono text-xl font-bold text-white">Omarchy</h3>
                </div>
                <p className="text-[#64748b] font-mono text-sm mb-4">
                  // Modern automation and orchestration platform. Streamline your workflows with AI-powered tools.
                </p>
                <a 
                  href="https://omarchy.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#8338ec] font-mono text-sm hover:underline"
                >
                  <span>omarchy.com</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
