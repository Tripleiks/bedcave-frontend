"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal, Cpu, HardDrive, Server, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Client-only matrix rain component
function MatrixRain() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  // Matrix characters
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
  
  // Generate falling columns
  const columns = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${(i * 7) % 100}%`,
    delay: (i * 0.3) % 5,
    duration: 4 + (i % 4),
    char: chars[i % chars.length],
  }));
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {columns.map((col) => (
        <motion.div
          key={col.id}
          className="absolute font-mono text-[#00d4ff] text-xs leading-none"
          style={{ left: col.left, top: "-20px" }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ 
            y: ["0vh", "100vh"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: col.duration,
            repeat: Infinity,
            delay: col.delay,
            ease: "linear",
          }}
        >
          {/* Falling characters in column */}
          {Array.from({ length: 8 }).map((_, j) => (
            <motion.span
              key={j}
              className="block"
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: j === 0 ? [0.8, 1, 0.8] : [0.2, 0.6, 0.2],
                color: j === 0 ? ["#ffffff", "#00d4ff", "#ffffff"] : "#00d4ff"
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: j * 0.1,
              }}
            >
              {chars[(col.id + j) % chars.length]}
            </motion.span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Connection lines between random points
function ConnectionLines() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + (i * 8) % 80,
    y: 15 + (i * 13) % 70,
  }));
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
      {nodes.map((node, i) => 
        nodes.slice(i + 1).map((target, j) => {
          const distance = Math.sqrt(
            Math.pow(node.x - target.x, 2) + Math.pow(node.y - target.y, 2)
          );
          if (distance > 30) return null;
          
          return (
            <motion.line
              key={`${node.id}-${target.id}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${target.x}%`}
              y2={`${target.y}%`}
              stroke="#00d4ff"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 1, 0],
                opacity: [0, 0.5, 0.5, 0],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: (i * 0.5) % 5,
              }}
            />
          );
        })
      )}
    </svg>
  );
}

// Floating code snippets
function FloatingCode() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const snippets = [
    "{code}", "<div>", "npm i", "git push", "docker run", "sudo apt",
    "const x", "import", "export", "async", "await", "function"
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {snippets.map((snippet, i) => (
        <motion.div
          key={i}
          className="absolute font-mono text-[10px] text-[#00d4ff]/20"
          style={{ 
            left: `${10 + (i * 17) % 80}%`,
            top: `${20 + (i * 23) % 60}%`,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.4, 0.4, 0],
            y: [-20, -40],
            x: [0, (i % 2 === 0 ? 10 : -10)],
          }}
          transition={{
            duration: 5 + (i % 4),
            repeat: Infinity,
            delay: (i * 0.8) % 10,
          }}
        >
          {snippet}
        </motion.div>
      ))}
    </div>
  );
}

export function HeroSection() {
  const categories = [
    { icon: Terminal, label: "NEWS", href: "/category/news", color: "#00d4ff" },
    { icon: Cpu, label: "HARDWARE", href: "/category/hardware", color: "#39ff14" },
    { icon: HardDrive, label: "DOCKER", href: "/category/docker", color: "#ff006e" },
    { icon: Server, label: "HOMELAB", href: "/category/homeserver", color: "#ffbe0b" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Animated grid background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f]" />
      </div>

      {/* Background effects */}
      <MatrixRain />
      <ConnectionLines />
      <FloatingCode />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            className="text-lg sm:text-xl text-[#64748b] mb-4 font-mono"
          >
            // Exploring technology, homelabs & modern development
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-[#94a3b8] mb-12 max-w-2xl mx-auto"
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
              href="/category/news"
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
                  className="group block p-6 rounded-lg border border-[#1e293b] bg-[#13131f]/50 hover:border-[color:var(--hover-color)] hover:bg-[#1a1a2e] transition-all duration-300"
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
    </section>
  );
}

