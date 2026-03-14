"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal, Cpu, HardDrive, Server, Zap } from "lucide-react";
import Link from "next/link";
import { WavyBackground } from "@/components/ui/wavy-background";

export function HeroSection() {
  const categories = [
    { icon: Terminal, label: "NEWS", href: "/blog", color: "#00d4ff" },
    { icon: Cpu, label: "HARDWARE", href: "/hardware", color: "#39ff14" },
    { icon: HardDrive, label: "DOCKER", href: "/docker", color: "#ff006e" },
    { icon: Server, label: "HOMELAB", href: "/homelab", color: "#ffbe0b" },
  ];

  return (
    <WavyBackground
      colors={["#00d4ff", "#39ff14", "#ff006e", "#ffbe0b", "#8338ec"]}
      waveWidth={50}
      backgroundFill="#0a0a0f"
      blur={10}
      speed="slow"
      waveOpacity={0.3}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Terminal-style badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-[#00d4ff]/30 bg-[#00d4ff]/5 mb-8"
          >
            <span className="text-[#00d4ff] font-mono text-sm">&gt;_</span>
            <span className="text-[#64748b] font-mono text-sm">SYSTEM.INIT</span>
            <span className="w-2 h-2 bg-[#39ff14] rounded-full animate-pulse" />
          </motion.div>

          {/* Main title with glitch effect */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 relative"
          >
            <span className="font-mono text-white relative inline-block">
              THE
              <motion.span 
                className="absolute -inset-1 text-[#ff006e] opacity-50"
                animate={{ x: [-2, 2, -2], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 5 }}
              >
                THE
              </motion.span>
            </span>
            <br />
            <span className="font-mono gradient-text glow-cyan">BEDCAVE</span>
            <span className="text-[#00d4ff] animate-pulse">_</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-[#94a3b8] mb-4 font-mono"
          >
            // Exploring technology, homelabs & modern development
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-[#94a3b8]/80 mb-12 max-w-2xl mx-auto"
          >
            From Docker containers to hardware reviews. Insights for the tech-curious mind. 
            Welcome to the cave.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link
              href="#latest"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#00d4ff] text-[#0a0a0f] font-mono font-bold rounded hover:bg-[#00d4ff]/90 transition-all box-glow-cyan overflow-hidden"
            >
              <span className="relative z-10">EXPLORE_ARTICLES</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 border border-[#1e293b] text-[#e2e8f0] font-mono rounded hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/5 transition-all"
            >
              <Zap className="w-4 h-4 text-[#ffbe0b]" />
              <span>LATEST_NEWS</span>
            </Link>
          </motion.div>

          {/* Category cards - Terminal style */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {categories.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="group block p-6 rounded-lg border border-[#1e293b] bg-[#13131f]/80 hover:border-[color:var(--hover-color)] hover:bg-[#1a1a2e] transition-all duration-300 backdrop-blur-sm"
                  style={{ "--hover-color": item.color } as React.CSSProperties}
                >
                  <item.icon 
                    className="w-8 h-8 mb-3 transition-colors duration-300" 
                    style={{ color: item.color }}
                  />
                  <span 
                    className="font-mono text-sm font-bold tracking-wider"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                  <div className="mt-2 h-px bg-[#1e293b] group-hover:w-full w-0 transition-all duration-500" style={{ backgroundColor: item.color }} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-[#64748b] font-mono text-xs"
        >
          <span>SCROLL_DOWN</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#00d4ff] to-transparent" />
        </motion.div>
      </motion.div>
    </WavyBackground>
  );
}
