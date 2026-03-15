"use client";

import { motion } from "framer-motion";
import { ArticleCard } from "@/components/article-card";
import { HeroSection } from "@/components/hero-section";
import { NewsTicker } from "@/components/news-ticker";
import { CloudStatusBanner } from "@/components/cloud-status-banner";
import { YouTubeCarousel } from "@/components/youtube-carousel";
import { Post } from "@/lib/mdx/posts";
import { Terminal, ArrowRight, Cpu, Mail, Code2, Clock, Quote, Activity, Search, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface HomeContentProps {
  recentPosts: Post[];
  stickyPosts: Post[];
}

// System Stats Component
function SystemStats() {
  const [stats, setStats] = useState({
    cpu: 42,
    ram: 68,
    containers: 12,
    uptime: { days: 14, hours: 3, mins: 27 }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 30) + 30,
        ram: Math.floor(Math.random() * 20) + 60,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
        <Activity className="w-4 h-4 text-[#ff006e]" />
        <span className="font-mono text-xs text-[#64748b]">$ htop --no-interactive</span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-[#ff006e]">{stats.cpu}%</div>
          <div className="font-mono text-xs text-[#64748b]">CPU</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-[#00d4ff]">{stats.ram}%</div>
          <div className="font-mono text-xs text-[#64748b]">RAM</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-[#39ff14]">{stats.containers}</div>
          <div className="font-mono text-xs text-[#64748b]">Containers</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-sm font-bold text-[#ffbe0b]">
            {stats.uptime.days}d {stats.uptime.hours}h
          </div>
          <div className="font-mono text-xs text-[#64748b]">Uptime</div>
        </div>
      </div>
    </div>
  );
}

// Typing Command Component
function TypingCommand() {
  const commands = [
    "docker-compose up -d",
    "git push origin main",
    "kubectl get pods",
    "apt update && apt upgrade",
    "systemctl restart nginx",
    "cd ~/homelab && ls -la",
  ];
  
  const [currentCmd, setCurrentCmd] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const cmd = commands[currentCmd];
    
    if (isDeleting) {
      if (displayText === "") {
        setIsDeleting(false);
        setCurrentCmd((prev) => (prev + 1) % commands.length);
      } else {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText === cmd) {
        const timeout = setTimeout(() => setIsDeleting(true), 2000);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setDisplayText(cmd.slice(0, displayText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [displayText, isDeleting, currentCmd, commands]);

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
        <TerminalSquare className="w-4 h-4 text-[#8338ec]" />
        <span className="font-mono text-xs text-[#64748b]">$ watch -n 1 echo</span>
      </div>
      <div className="p-6 font-mono text-sm">
        <span className="text-[#39ff14]">user@bedcave</span>
        <span className="text-white">:</span>
        <span className="text-[#00d4ff]">~/homelab</span>
        <span className="text-white">$ </span>
        <span className="text-[#e2e8f0]">{displayText}</span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-[#00d4ff] ml-1 align-middle"
        />
      </div>
    </div>
  );
}

// Quick Commands Component
function QuickCommands() {
  const commands = [
    { label: "Latest Post", href: "#latest", icon: ArrowRight, color: "#00d4ff" },
    { label: "Random", href: "/blog", icon: Terminal, color: "#ffbe0b" },
    { label: "Search", href: "#", icon: Search, color: "#39ff14" },
  ];

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
        <Terminal className="w-4 h-4 text-[#39ff14]" />
        <span className="font-mono text-xs text-[#64748b]">$ alias --list</span>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {commands.map((cmd) => (
            <Link
              key={cmd.label}
              href={cmd.href}
              className="group flex items-center gap-2 px-4 py-2 rounded border font-mono text-xs font-bold transition-all hover:scale-105"
              style={{ 
                borderColor: cmd.color,
                color: cmd.color,
                backgroundColor: `${cmd.color}10`
              }}
            >
              <cmd.icon className="w-3 h-3" />
              <span>{cmd.label.toUpperCase()}</span>
            </Link>
          ))}
        </div>
        <div className="mt-3 text-center font-mono text-xs text-[#64748b]">
          // quick shortcuts
        </div>
      </div>
    </div>
  );
}

// Digital Clock Component
function DigitalClock() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour12: false }));
      setDate(now.toISOString().split("T")[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
        <Clock className="w-4 h-4 text-[#00d4ff]" />
        <span className="font-mono text-xs text-[#64748b]">$ date --iso-8601</span>
      </div>
      <div className="p-6 text-center">
        <div className="font-mono text-3xl font-bold text-[#00d4ff] tracking-wider">
          {time || "00:00:00"}
        </div>
        <div className="font-mono text-sm text-[#64748b] mt-2">
          {date || "1970-01-01"}
        </div>
      </div>
    </div>
  );
}

// Tech Stack Pills Component
function TechStackPills() {
  const stack = [
    { name: "Next.js", color: "#e2e8f0" },
    { name: "Tailwind", color: "#38bdf8" },
    { name: "MDX", color: "#f97316" },
    { name: "Vercel", color: "#000000" },
    { name: "Docker", color: "#2496ed" },
  ];

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
        <Code2 className="w-4 h-4 text-[#39ff14]" />
        <span className="font-mono text-xs text-[#64748b]">$ cat stack.json</span>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {stack.map((tech) => (
            <motion.span
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * stack.indexOf(tech) }}
              className="px-3 py-1.5 rounded-full font-mono text-xs font-bold border"
              style={{ 
                borderColor: tech.color,
                color: tech.color,
                backgroundColor: `${tech.color}10`
              }}
            >
              {tech.name}
            </motion.span>
          ))}
        </div>
        <div className="mt-4 text-center font-mono text-xs text-[#64748b]">
          // powered by
        </div>
      </div>
    </div>
  );
}

// Quote Ticker Component
function QuoteTicker() {
  const quotes = [
    "There is no cloud, it's just someone else's computer",
    "It works on my machine - famous last words",
    "Docker: because 'works on my machine' wasn't good enough",
    "Homelab: where your electricity bill goes to die",
    "Kubernetes is just Borg for the rest of us",
    "Have you tried turning it off and on again?",
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
        <Quote className="w-4 h-4 text-[#ffbe0b]" />
        <span className="font-mono text-xs text-[#64748b]">$ fortune | cowsay</span>
      </div>
      <div className="p-6 flex items-center justify-center min-h-[100px]">
        <motion.p
          key={currentQuote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-sm text-[#94a3b8] text-center italic"
        >
          &ldquo;{quotes[currentQuote]}&rdquo;
        </motion.p>
      </div>
    </div>
  );
}

export function HomeContent({ recentPosts, stickyPosts }: HomeContentProps) {
  // Newsletter State
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");
  const [subscribeMessage, setSubscribeMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setSubscribeStatus("error");
      setSubscribeMessage("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);
    setSubscribeStatus("idle");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setSubscribeStatus("success");
      setSubscribeMessage("Successfully subscribed! Check your inbox.");
      setEmail("");
    } catch (error: any) {
      setSubscribeStatus("error");
      setSubscribeMessage(error.message || "Failed to subscribe");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <HeroSection />

      {/* Cloud Status Banner */}
      <CloudStatusBanner />

      {/* Featured / Sticky Posts - Terminal Style */}
      {stickyPosts.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
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
        </div>
      )}

      {/* Live News Ticker */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <NewsTicker />
        </motion.div>
      </div>

      {/* YouTube AI Videos Carousel - Under Latest News */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-xl border border-[#1e293b] bg-[#13131f]/50 overflow-hidden"
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff006e]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbe0b]" />
              <div className="w-3 h-3 rounded-full bg-[#39ff14]" />
            </div>
            <span className="ml-4 font-mono text-xs text-[#64748b]">user@bedcave:~$ youtube-dl --search="AI latest" --top-10</span>
          </div>
          
          <div className="p-6">
            <YouTubeCarousel />
          </div>
        </motion.div>
      </div>

      {/* Supporting Technology - Moved under YouTube Carousel */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1e293b] border border-[#1e293b]">
              <Terminal className="w-4 h-4 text-[#ffbe0b]" />
              <span className="font-mono text-sm text-[#ffbe0b]">$ cat technology.conf</span>
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
                  href="https://omarchy.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#8338ec] font-mono text-sm hover:underline"
                >
                  <span>omarchy.org</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Tech Dashboard - Clock, Stack & Quotes */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Digital Clock */}
            <DigitalClock />
            
            {/* Tech Stack Pills */}
            <TechStackPills />
            
            {/* Quote Ticker */}
            <QuoteTicker />
          </div>
        </motion.section>

        {/* Latest Posts - Symmetrical Grid (max 11 posts: 2 featured + 9 standard) */}
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
              <span className="font-mono text-sm text-[#39ff14]">$ ls -la /latest/ (max 11 items)</span>
            </div>
            <div className="flex-1 h-px bg-[#1e293b]" />
            <Link 
              href="/blog" 
              className="font-mono text-sm text-[#64748b] hover:text-[#00d4ff] transition-colors flex items-center gap-2"
            >
              view_all --list
              <ArrowRight className="w-4 h-4" />
            </Link>
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
          
          {/* Next 9 posts - standard size (max 11 total) */}
          {recentPosts.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.slice(2, 11).map((post, index) => (
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

          {/* More Button - if there are more than 11 posts */}
          {recentPosts.length > 11 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 flex justify-center"
            >
              <Link
                href="/blog"
                className="group flex items-center gap-3 px-6 py-3 rounded-lg border border-[#1e293b] bg-[#13131f] hover:border-[#00d4ff]/50 hover:bg-[#1a1a2e] transition-all"
              >
                <span className="font-mono text-sm text-[#64748b] group-hover:text-[#00d4ff]">
                  $ ls -la /blog/ | more
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#1e293b] text-[#64748b] group-hover:text-[#00d4ff] group-hover:bg-[#00d4ff]/10 transition-colors">
                  +{recentPosts.length - 11} more
                </span>
                <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#00d4ff] group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
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
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      disabled={isSubscribing}
                      className="w-full pl-12 pr-4 py-4 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubscribing}
                    className="group px-8 py-4 rounded bg-[#00d4ff] text-[#0a0a0f] font-mono font-bold hover:bg-[#00d4ff]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isSubscribing ? "PROCESSING..." : "EXECUTE"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
                
                {/* Status Message */}
                {subscribeStatus !== "idle" && (
                  <div className={`mt-4 p-3 rounded font-mono text-sm ${
                    subscribeStatus === "success" 
                      ? "bg-[#39ff14]/10 border border-[#39ff14] text-[#39ff14]" 
                      : "bg-[#ff006e]/10 border border-[#ff006e] text-[#ff006e]"
                  }`}>
                    {subscribeMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* System Dashboard - Stats, Typing, Quick Commands - MOVED TO END */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 mb-4"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1e293b] border border-[#1e293b]">
              <Activity className="w-4 h-4 text-[#ff006e]" />
              <span className="font-mono text-sm text-[#ff006e]">$ htop --system-overview</span>
            </div>
            <div className="flex-1 h-px bg-[#1e293b]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Stats */}
            <SystemStats />
            
            {/* Typing Command */}
            <TypingCommand />
            
            {/* Quick Commands */}
            <QuickCommands />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
