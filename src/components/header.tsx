"use client";

import Link from 'next/link';
import { motion } from "framer-motion";
import { Terminal, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "NEWS", href: "/blog" },
    { label: "HARDWARE", href: "/hardware" },
    { label: "DOCKER", href: "/docker" },
    { label: "HOMELAB", href: "/homelab" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 z-50 w-full border-b border-[#1e293b] bg-[#0a0a0f]/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Terminal className="w-6 h-6 text-[#00d4ff] group-hover:text-[#39ff14] transition-colors" />
            <span className="font-mono text-xl font-bold tracking-tighter">
              <span className="text-white">BED</span>
              <span className="text-[#00d4ff]">CAVE</span>
              <span className="text-[#00d4ff] animate-pulse">_</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 font-mono text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors group"
              >
                <span className="text-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                <span className="ml-1">{item.label}</span>
                <motion.div
                  className="absolute bottom-0 left-0 h-px bg-[#00d4ff]"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[#64748b] hover:text-[#00d4ff] transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ 
          height: isMenuOpen ? "auto" : 0,
          opacity: isMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden border-t border-[#1e293b] bg-[#0a0a0f]"
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 font-mono text-sm text-[#64748b] hover:text-[#00d4ff] hover:bg-[#1e1e3f] rounded transition-all"
            >
              <span className="text-[#00d4ff]">&gt;</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </motion.div>
    </motion.header>
  );
}
