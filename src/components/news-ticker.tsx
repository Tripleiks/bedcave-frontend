"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Container, Server, Cloud, Cpu, Layers, RefreshCw, ExternalLink, Brain } from "lucide-react";

interface NewsItem {
  id: string;
  text: string;
  category: "docker" | "unraid" | "homelab" | "m365" | "azure" | "general" | "github" | "tech" | "ai";
  icon: string;
  color: string;
  isNew?: boolean;
  url?: string;
  source: string;
}

interface NewsData {
  success: boolean;
  items: NewsItem[];
  sources: {
    hackerNews: number;
    gitHub: number;
    devTo: number;
    productHunt: number;
    mastodon: number;
    fallback: number;
  };
  lastUpdated: string;
}

// Enhanced fallback data - 38 items covering all categories
const fallbackNews: NewsItem[] = [
  { id: "fb-1", text: "Docker Desktop 4.38 released with AI-assisted debugging", category: "docker", icon: "Container", color: "#2496ed", source: "Docker", isNew: true, url: "https://docker.com" },
  { id: "fb-2", text: "Kubernetes 1.32 introduces sidecar container enhancements", category: "docker", icon: "Container", color: "#2496ed", source: "K8s", url: "https://kubernetes.io" },
  { id: "fb-3", text: "Docker Compose 2.24 adds parallel build support", category: "docker", icon: "Container", color: "#2496ed", source: "Docker", isNew: true },
  { id: "fb-4", text: "Podman 5.0 reaches feature parity with Docker", category: "docker", icon: "Container", color: "#892ca0", source: "Podman" },
  
  { id: "fb-5", text: "Azure Container Apps now supports GPU workloads for AI", category: "azure", icon: "Cloud", color: "#0089d6", source: "Azure", isNew: true },
  { id: "fb-6", text: "Microsoft Azure AI Foundry simplifies model deployment", category: "azure", icon: "Cloud", color: "#0089d6", source: "Azure", isNew: true },
  { id: "fb-7", text: "Azure Static Web Apps adds Node.js 22 support", category: "azure", icon: "Cloud", color: "#0089d6", source: "Azure" },
  { id: "fb-8", text: "Azure DevOps updates pipeline YAML validation", category: "azure", icon: "Cloud", color: "#0078d4", source: "Azure DevOps" },
  { id: "fb-9", text: "Terraform 1.10 improves Azure provider performance", category: "azure", icon: "Cloud", color: "#8b5cf6", source: "HashiCorp" },
  
  { id: "fb-10", text: "Microsoft 365 Copilot gets custom agent support", category: "m365", icon: "Cloud", color: "#0078d4", source: "Microsoft", isNew: true },
  { id: "fb-11", text: "Exchange Online adds enhanced email encryption", category: "m365", icon: "Mail", color: "#0078d4", source: "Microsoft", isNew: true },
  { id: "fb-12", text: "Teams Premium introduces AI-powered recaps", category: "m365", icon: "MessageSquare", color: "#7c83db", source: "Microsoft Teams" },
  { id: "fb-13", text: "SharePoint Online boosts file sync performance", category: "m365", icon: "Folder", color: "#0078d4", source: "SharePoint" },
  { id: "fb-14", text: "Microsoft Intune adds macOS compliance policies", category: "m365", icon: "Shield", color: "#0078d4", source: "Intune" },
  { id: "fb-15", text: "Power Platform integrates GPT-4 Turbo", category: "m365", icon: "Zap", color: "#742774", source: "Power Platform", isNew: true },
  
  { id: "fb-16", text: "Proxmox VE 8.3 adds enhanced backup compression", category: "homelab", icon: "Server", color: "#e57000", source: "Proxmox" },
  { id: "fb-17", text: "Home Assistant 2025.3 with new Matter support", category: "homelab", icon: "Home", color: "#00d4ff", source: "HA", isNew: true },
  { id: "fb-18", text: "TrueNAS Scale 24.10 improves container management", category: "homelab", icon: "Database", color: "#0095d5", source: "TrueNAS" },
  { id: "fb-19", text: "Pi-hole 6.0 introduces native DoH support", category: "homelab", icon: "Shield", color: "#96060c", source: "Pi-hole", isNew: true },
  { id: "fb-20", text: "OpenWrt 23.05.5 adds WiFi 7 preliminary support", category: "homelab", icon: "Wifi", color: "#00c853", source: "OpenWrt" },
  { id: "fb-21", text: "Nginx Proxy Manager v3 beta now available", category: "homelab", icon: "Globe", color: "#ff6c00", source: "NPM" },
  
  { id: "fb-22", text: "Unraid 7.0 stable release announced with ZFS support", category: "unraid", icon: "HardDrive", color: "#ff6c00", source: "Unraid", isNew: true },
  { id: "fb-23", text: "Unraid adds official WireGuard VPN integration", category: "unraid", icon: "Shield", color: "#ff6c00", source: "Unraid" },
  { id: "fb-24", text: "Community Apps plugin reaches 1000+ containers", category: "unraid", icon: "Package", color: "#ff6c00", source: "CA" },
  { id: "fb-25", text: "Unraid Cloud Backup now supports Backblaze B2", category: "unraid", icon: "Cloud", color: "#ff6c00", source: "Unraid", isNew: true },
  
  { id: "fb-26", text: "OpenAI GPT-5 preview announced for developers", category: "ai", icon: "Brain", color: "#10a37f", source: "OpenAI", isNew: true },
  { id: "fb-27", text: "Claude 3.7 Sonnet introduces extended thinking mode", category: "ai", icon: "Brain", color: "#d97757", source: "Anthropic", isNew: true },
  { id: "fb-28", text: "Meta LLaMA 3 70B now available for commercial use", category: "ai", icon: "Brain", color: "#0081fb", source: "Meta" },
  { id: "fb-29", text: "Google Gemini 2.0 adds native image generation", category: "ai", icon: "Brain", color: "#4285f4", source: "Google", isNew: true },
  { id: "fb-30", text: "Mistral Large 2 outperforms GPT-4 on code tasks", category: "ai", icon: "Brain", color: "#ff7000", source: "Mistral" },
  { id: "fb-31", text: "Ollama 0.3 adds vision model support", category: "ai", icon: "Eye", color: "#ff6b6b", source: "Ollama", isNew: true },
  
  { id: "fb-32", text: "GitHub Actions now supports ARM64 runners natively", category: "github", icon: "GitBranch", color: "#39ff14", source: "GitHub", isNew: true },
  { id: "fb-33", text: "GitHub Copilot Workspace enters public beta", category: "github", icon: "Code", color: "#39ff14", source: "GitHub", isNew: true },
  { id: "fb-34", text: "GitHub Packages adds vulnerability scanning", category: "github", icon: "Package", color: "#39ff14", source: "GitHub" },
  
  { id: "fb-35", text: "RustDesk: New open-source remote desktop alternative", category: "tech", icon: "Monitor", color: "#39ff14", source: "GitHub", isNew: true },
  { id: "fb-36", text: "Next.js 15 brings Turbopack for faster builds", category: "tech", icon: "Layers", color: "#ffffff", source: "Vercel", isNew: true },
  { id: "fb-37", text: "Tailwind CSS 4.0 with performance improvements", category: "tech", icon: "Paintbrush", color: "#38bdf8", source: "Tailwind" },
  { id: "fb-38", text: "PostgreSQL 17 beta with enhanced JSON support", category: "tech", icon: "Database", color: "#336791", source: "PostgreSQL" },
];

function getIconForCategory(category: string) {
  switch (category) {
    case "docker":
      return Container;
    case "azure":
    case "cloud":
      return Cloud;
    case "homelab":
    case "server":
      return Server;
    case "github":
      return Layers;
    case "ai":
      return Brain;
    default:
      return Cpu;
  }
}

function NewsRow({ 
  items, 
  direction = "left", 
  speed = 30,
  rowColor 
}: { 
  items: NewsItem[]; 
  direction?: "left" | "right"; 
  speed?: number;
  rowColor: string;
}) {
  if (items.length === 0) return null;
  
  const duplicatedItems = [...items, ...items, ...items];
  
  return (
    <div 
      className="relative overflow-hidden py-3 border-y border-[#1e293b]"
      style={{ 
        background: `linear-gradient(90deg, ${rowColor}05 0%, transparent 10%, transparent 90%, ${rowColor}05 100%)`,
        boxShadow: `inset 0 1px 0 0 ${rowColor}20, inset 0 -1px 0 0 ${rowColor}20`
      }}
    >
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{
          x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"],
        }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {duplicatedItems.map((item, index) => {
          const Icon = getIconForCategory(item.category);
          const content = (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1e293b] bg-[#13131f]/80 hover:bg-[#1a1a2e] transition-all duration-300 group cursor-pointer">
              <Icon className="w-4 h-4" style={{ color: item.color }} />
              <span className="font-mono text-sm text-[#e2e8f0] group-hover:text-white transition-colors">
                {item.text}
              </span>
              <span className="text-[10px] text-[#64748b] font-mono">[{item.source}]</span>
              {item.isNew && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono animate-pulse"
                  style={{ backgroundColor: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40` }}>
                  NEW
                </span>
              )}
              {item.url && <ExternalLink className="w-3 h-3 text-[#64748b] opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
          );
          
          return item.url ? (
            <a key={`${item.id}-${index}`} href={item.url} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <div key={`${item.id}-${index}`}>{content}</div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function NewsTicker() {
  const [newsData, setNewsData] = useState<NewsItem[]>(fallbackNews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiStatus, setApiStatus] = useState<string>("connecting...");

  const fetchNews = async () => {
    try {
      setLoading(true);
      setApiStatus("fetching...");
      
      const res = await fetch("/api/news", { cache: "no-store" });
      const data: NewsData = await res.json();
      
      if (data.success && data.items.length > 0) {
        setNewsData(data.items);
        setLastUpdated(new Date(data.lastUpdated));
        setApiStatus(`live (${data.sources.hackerNews > 0 || data.sources.gitHub > 0 ? 'api' : 'fallback'})`);
        setError(null);
      } else {
        setApiStatus("fallback mode");
      }
    } catch (err: any) {
      setError(err.message);
      setApiStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  // Setup SSE connection for real-time updates
  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    
    // Connect to SSE stream
    const eventSource = new EventSource("/api/news/stream");
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "news_update") {
          setNewsData(data.items);
          setLastUpdated(new Date(data.timestamp));
          setApiStatus("live (realtime)");
        }
      } catch {
        // Ignore non-JSON messages (like ping)
      }
    };
    
    eventSource.onerror = () => {
      // Silent fail - fallback to polling
    };
    
    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  // Ensure we have enough items for all rows - fill with fallback if needed
  const ensureMinimumItems = (items: NewsItem[], minCount: number) => {
    if (items.length >= minCount) return items;
    const result = [...items];
    while (result.length < minCount) {
      result.push(...fallbackNews.slice(0, minCount - result.length));
    }
    return result;
  };

  const allNews = ensureMinimumItems(newsData, 9);

  // Split news into 3 rows with at least 3 items each
  const row1 = allNews.filter((_, i) => i % 3 === 0);
  const row2 = allNews.filter((_, i) => i % 3 === 1);
  const row3 = allNews.filter((_, i) => i % 3 === 2);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0f0f1a] border-x border-t border-[#1e293b] rounded-t-lg">
        <Terminal className="w-4 h-4 text-[#00d4ff]" />
        <span className="font-mono text-xs text-[#64748b]">$ tail -f /var/log/news.log --follow</span>
        <div className="flex-1" />
        
        {/* Connection Status */}
        <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
          apiStatus.includes('live') ? 'text-[#39ff14] bg-[#39ff14]/10' : 
          apiStatus.includes('fallback') ? 'text-[#ffbe0b] bg-[#ffbe0b]/10' : 
          'text-[#ff006e] bg-[#ff006e]/10'
        }`}>
          ● {apiStatus}
        </span>
        
        <button
          onClick={fetchNews}
          disabled={loading}
          className="p-1 rounded hover:bg-[#1e293b] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#64748b] hover:text-[#00d4ff] ${loading ? 'animate-spin' : ''}`} />
        </button>
        
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff006e] animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-[#ffbe0b] animate-pulse delay-75" />
          <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse delay-150" />
        </div>
      </div>

      {/* Ticker Container */}
      <div className="border-x border-[#1e293b] bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/5 via-transparent to-[#ff006e]/5 pointer-events-none" />
        
        {loading && newsData.length === 0 ? (
          <div className="py-8 text-center">
            <div className="flex items-center justify-center gap-2 text-[#64748b] font-mono text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading news feed...
            </div>
          </div>
        ) : (
          <>
            {row1.length > 0 && <NewsRow items={row1} direction="left" speed={35} rowColor="#00d4ff" />}
            {row2.length > 0 && <NewsRow items={row2} direction="right" speed={40} rowColor="#ff006e" />}
            {row3.length > 0 && <NewsRow items={row3} direction="left" speed={45} rowColor="#39ff14" />}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f1a] border-x border-b border-[#1e293b] rounded-b-lg">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-[#64748b]">
            <span className="text-[#2496ed]">Docker</span>
            <span className="mx-2 text-[#1e293b]">|</span>
            <span className="text-[#e57000]">Homelab</span>
            <span className="mx-2 text-[#1e293b]">|</span>
            <span className="text-[#0089d6]">Azure</span>
            <span className="mx-2 text-[#1e293b]">|</span>
            <span className="text-[#39ff14]">GitHub</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="font-mono text-[10px] text-[#64748b]">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <span className="font-mono text-xs text-[#64748b]">{newsData.length} items</span>
        </div>
      </div>
    </div>
  );
}
