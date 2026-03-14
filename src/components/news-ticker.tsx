"use client";

import { motion } from "framer-motion";
import { Terminal, Container, Server, Cloud, Database, Cpu, Layers, Box, HardDrive, Activity } from "lucide-react";

interface NewsItem {
  id: string;
  text: string;
  category: "docker" | "unraid" | "homelab" | "m365" | "azure" | "general";
  icon: typeof Container;
  color: string;
  isNew?: boolean;
}

const newsData: NewsItem[] = [
  // Docker
  { id: "1", text: "Docker Desktop 4.26 released with improved containerd support", category: "docker", icon: Container, color: "#2496ed", isNew: true },
  { id: "2", text: "Docker Compose v2.24 adds new build options", category: "docker", icon: Layers, color: "#2496ed" },
  { id: "3", text: "Docker Hub introduces new security scanning features", category: "docker", icon: Box, color: "#2496ed" },
  { id: "4", text: "Kubernetes 1.29 now supports Docker Engine 24.x", category: "docker", icon: Container, color: "#2496ed" },
  
  // Unraid
  { id: "5", text: "Unraid 6.12.10 brings ZFS native support", category: "unraid", icon: HardDrive, color: "#ff6c00", isNew: true },
  { id: "6", text: "Community Apps Store reaches 2000+ applications", category: "unraid", icon: Database, color: "#ff6c00" },
  { id: "7", text: "Unraid 7.0 Beta available for testing", category: "unraid", icon: Server, color: "#ff6c00" },
  
  // Homelab
  { id: "8", text: "Proxmox VE 8.1 adds enhanced VM backup features", category: "homelab", icon: Server, color: "#e57000" },
  { id: "9", text: "TrueNAS Scale 23.10 introduces new apps catalog", category: "homelab", icon: Database, color: "#00d4ff", isNew: true },
  { id: "10", text: "Home Assistant 2024.1 with new dashboard widgets", category: "homelab", icon: Activity, color: "#41bdf5" },
  
  // M365
  { id: "11", text: "Microsoft 365 Copilot now available for SMBs", category: "m365", icon: Cloud, color: "#0078d4", isNew: true },
  { id: "12", text: "Exchange Online gets improved anti-phishing", category: "m365", icon: Box, color: "#0078d4" },
  { id: "13", text: "Teams Premium adds new AI features", category: "m365", icon: Layers, color: "#7b83eb" },
  
  // Azure
  { id: "14", text: "Azure Container Apps now supports Dapr 1.12", category: "azure", icon: Container, color: "#0089d6" },
  { id: "15", text: "AKS 1.28 with GA support for Azure Linux", category: "azure", icon: Cloud, color: "#0089d6", isNew: true },
  { id: "16", text: "Azure DevOps introduces new pipeline features", category: "azure", icon: Terminal, color: "#0089d6" },
  
  // General Tech
  { id: "17", text: "Intel NUC 14 Pro: First hands-on review", category: "general", icon: Cpu, color: "#39ff14" },
  { id: "18", text: "NVIDIA RTX 4090 passthrough working on Proxmox", category: "general", icon: Server, color: "#76b900" },
];

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
  // Duplicate items for seamless loop
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
        {duplicatedItems.map((item, index) => (
          <div 
            key={`${item.id}-${index}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1e293b] bg-[#13131f]/80 hover:bg-[#1a1a2e] transition-all duration-300 group cursor-pointer"
          >
            <item.icon 
              className="w-4 h-4 transition-colors duration-300" 
              style={{ color: item.color }}
            />
            <span className="font-mono text-sm text-[#e2e8f0] group-hover:text-white transition-colors">
              {item.text}
            </span>
            {item.isNew && (
              <span 
                className="px-2 py-0.5 rounded text-[10px] font-bold font-mono animate-pulse"
                style={{ 
                  backgroundColor: `${item.color}20`,
                  color: item.color,
                  border: `1px solid ${item.color}40`
                }}
              >
                NEW
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function NewsTicker() {
  // Split news into 3 rows
  const row1 = newsData.filter((_, i) => i % 3 === 0);
  const row2 = newsData.filter((_, i) => i % 3 === 1);
  const row3 = newsData.filter((_, i) => i % 3 === 2);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0f0f1a] border-x border-t border-[#1e293b] rounded-t-lg">
        <Terminal className="w-4 h-4 text-[#00d4ff]" />
        <span className="font-mono text-xs text-[#64748b]">$ tail -f /var/log/news.log --follow</span>
        <div className="flex-1" />
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff006e] animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-[#ffbe0b] animate-pulse delay-75" />
          <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse delay-150" />
        </div>
      </div>

      {/* Ticker Container */}
      <div className="border-x border-[#1e293b] bg-[#0a0a0f] relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/5 via-transparent to-[#ff006e]/5 pointer-events-none" />
        
        {/* Row 1 - Left, Cyan */}
        <NewsRow 
          items={row1} 
          direction="left" 
          speed={35}
          rowColor="#00d4ff"
        />
        
        {/* Row 2 - Right, Pink/Magenta */}
        <NewsRow 
          items={row2} 
          direction="right" 
          speed={40}
          rowColor="#ff006e"
        />
        
        {/* Row 3 - Left, Green */}
        <NewsRow 
          items={row3} 
          direction="left" 
          speed={45}
          rowColor="#39ff14"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f1a] border-x border-b border-[#1e293b] rounded-b-lg">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-[#64748b]">
            <span className="text-[#2496ed]">Docker</span>
            <span className="mx-2 text-[#1e293b]">|</span>
            <span className="text-[#ff6c00]">Unraid</span>
            <span className="mx-2 text-[#1e293b]">|</span>
            <span className="text-[#e57000]">Homelab</span>
            <span className="mx-2 text-[#1e293b]">|</span>
            <span className="text-[#0078d4]">M365</span>
            <span className="mx-2 text-[#1e293b]">|</span>
            <span className="text-[#0089d6]">Azure</span>
          </span>
        </div>
        <span className="font-mono text-xs text-[#64748b]">
          {newsData.length} items • Live feed
        </span>
      </div>
    </div>
  );
}
