"use client";

import { motion } from "framer-motion";
import Link from 'next/link';
import { Terminal, Github, Twitter, Rss, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    categories: [
      { label: "NEWS", href: "/blog", color: "#00d4ff" },
      { label: "HARDWARE", href: "/hardware", color: "#39ff14" },
      { label: "DOCKER", href: "/docker", color: "#ff006e" },
      { label: "HOMELAB", href: "/homelab", color: "#ffbe0b" },
    ],
    resources: [
      { label: "PRIVACY", href: "/privacy" },
      { label: "LEGAL", href: "/legal" },
      { label: "RSS_FEED", href: "/feed" },
    ],
  };

  return (
    <footer className="w-full border-t border-[#1e293b] bg-[#0a0a0f]">
      {/* Terminal status bar */}
      <div className="border-b border-[#1e293b] bg-[#0f0f1a]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="text-[#39ff14]">● SYSTEM ONLINE</span>
              <span className="text-[#64748b]">uptime: {currentYear}d</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#64748b]">CPU: 42%</span>
              <span className="text-[#64748b]">MEM: 1.2GB</span>
              <span className="text-[#00d4ff]">LATENCY: 23ms</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand - Terminal Style */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Terminal className="w-5 h-5 text-[#00d4ff] group-hover:text-[#39ff14] transition-colors" />
              <span className="font-mono text-lg font-bold">
                <span className="text-white">BED</span>
                <span className="text-[#00d4ff]">CAVE</span>
              </span>
            </Link>
            <p className="font-mono text-sm text-[#64748b] leading-relaxed">
              // Tech insights, tutorials, and reviews for the modern developer 
              <br />
              // and homelab enthusiast. Built with code, powered by curiosity.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded bg-[#1e293b] text-[#64748b] hover:text-white hover:bg-[#00d4ff]/20 transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded bg-[#1e293b] text-[#64748b] hover:text-white hover:bg-[#00d4ff]/20 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="/feed" 
                className="p-2 rounded bg-[#1e293b] text-[#64748b] hover:text-white hover:bg-[#00d4ff]/20 transition-all"
              >
                <Rss className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
              <span className="text-[#39ff14]">$</span>
              <span>ls categories/</span>
            </h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center gap-2 font-mono text-sm text-[#64748b] hover:text-white transition-colors"
                  >
                    <span className="text-[#64748b] group-hover:text-[color:var(--link-color)] transition-colors" style={{ "--link-color": link.color } as React.CSSProperties}>
                      &gt;
                    </span>
                    <span style={{ color: link.color }}>
                      {link.label.toLowerCase()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
              <span className="text-[#ffbe0b]">$</span>
              <span>ls resources/</span>
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center gap-2 font-mono text-sm text-[#64748b] hover:text-white transition-colors"
                  >
                    <span className="text-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-[#1e293b]"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-[#64748b] flex items-center gap-2">
              <span className="text-[#ff006e]">❤</span>
              <span>Built with code in {currentYear}</span>
              <span className="text-[#1e293b]">|</span>
              <span>Powered by Next.js & Vercel</span>
            </p>
            <div className="flex items-center gap-4 font-mono text-xs text-[#64748b]">
              <span className="text-[#39ff14]">STATUS: 200 OK</span>
              <span className="text-[#1e293b]">|</span>
              <Link href="/privacy" className="hover:text-[#00d4ff] transition-colors">
                PRIVACY
              </Link>
              <span className="text-[#1e293b]">|</span>
              <Link href="/legal" className="hover:text-[#00d4ff] transition-colors">
                LEGAL
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
