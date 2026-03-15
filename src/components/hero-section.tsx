"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal, Cpu, HardDrive, Server, Zap, Copy, Check } from "lucide-react";
import Link from "next/link";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useState, useEffect } from "react";

// Live Terminal Component - Shows animated typing commands
function LiveTerminal() {
  const commands = [
    { cmd: "docker ps", output: "CONTAINER ID   IMAGE        STATUS        NAMES\n3f2a...1b2c   nginx:alpine Up 2 hours    web-proxy\n8d4e...9f1a   postgres:15  Up 5 days     database\n2c1b...4e5d   redis:7      Up 1 week     cache" },
    { cmd: "kubectl get pods", output: "NAME                      READY   STATUS    RESTARTS   AGE\nnginx-7854ff8877-x2k9p    1/1     Running   0          3d21h\npostgres-0                1/1     Running   1          7d2h\nhome-assistant-5d8f       1/1     Running   0          12d" },
    { cmd: "htop --no-color", output: "  1  [||||||||||||||||||||||||    42.3%]  Tasks: 127,  45 thr\n  2  [||||||||||||||||||          28.1%]  Load average: 0.45\nMem [|||||||||||||||           8.2G/32G]  Uptime: 14 days\nSwp [||                      512M/2G]   Docker: 12 running" },
    { cmd: "git status", output: "On branch main\nYour branch is ahead of 'origin/main' by 3 commits.\n  (use \"git push\" to publish your local commits)\n\nChanges to be committed:\n  modified:   src/app/page.tsx\n  new file:   content/posts/ai-guide.mdx" },
    { cmd: "ls -la ~/homelab/", output: "drwxr-xr-x  6 admin admin 4096 Mar 15 08:32 .\ndrwxr-xr-x 18 admin admin 4096 Jan 12 14:22 ..\n-rw-r--r--  1 admin admin  892 docker-compose.yml\n-rw-r--r--  1 admin admin 2048 .env\ndrwxr-xr-x  4 admin admin 4096 configs/\ndrwxr-xr-x  8 admin admin 4096 backups/" },
  ];

  const [currentCmdIndex, setCurrentCmdIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  const currentCommand = commands[currentCmdIndex];

  useEffect(() => {
    if (isTyping) {
      if (typedText.length < currentCommand.cmd.length) {
        const timeout = setTimeout(() => {
          setTypedText(currentCommand.cmd.slice(0, typedText.length + 1));
        }, 100 + Math.random() * 50);
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
        setTimeout(() => setShowOutput(true), 300);
      }
    } else {
      const timeout = setTimeout(() => {
        setShowOutput(false);
        setTypedText("");
        setIsTyping(true);
        setCurrentCmdIndex((prev) => (prev + 1) % commands.length);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [typedText, isTyping, currentCommand, currentCmdIndex, commands.length]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Terminal Window */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0a0a0f] overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-[#1e293b]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
          </div>
          <div className="flex-1 text-center">
            <span className="font-mono text-xs text-[#64748b]">user@bedcave:~</span>
          </div>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[#1e293b] transition-colors"
            title="Copy command"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#27ca40]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#64748b] hover:text-[#00d4ff]" />
            )}
          </button>
        </div>

        {/* Terminal Content */}
        <div className="p-4 font-mono text-sm min-h-[140px]">
          {/* Command Input */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#27ca40]">➜</span>
            <span className="text-[#00d4ff]">~</span>
            <span className="text-[#64748b]">$</span>
            <span className="text-[#e2e8f0]">{typedText}</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-2 h-4 bg-[#00d4ff] ml-0.5"
            />
          </div>

          {/* Command Output */}
          {showOutput && (
            <motion.pre
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-[#94a3b8] text-xs leading-relaxed whitespace-pre-wrap"
            >
              {currentCommand.output}
            </motion.pre>
          )}
        </div>

        {/* Terminal Footer - Status */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#13131f] border-t border-[#1e293b]">
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#64748b]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27ca40] animate-pulse" />
              bash
            </span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#64748b]">
            <span>cmd {currentCmdIndex + 1}/{commands.length}</span>
          </div>
        </div>
      </div>

      {/* Scroll hint below terminal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="flex justify-center mt-6"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1 text-[#64748b] font-mono text-xs"
        >
          <span>SCROLL_DOWN</span>
          <div className="w-px h-6 bg-gradient-to-b from-[#00d4ff] to-transparent" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

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
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"
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
    </WavyBackground>
  );
}
