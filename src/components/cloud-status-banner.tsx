"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity, Globe, Server, Zap } from "lucide-react";

interface CloudProvider {
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  status: "operational" | "degraded" | "outage";
  ping: number;
  region: string;
  uptime: string;
  icon: React.ReactNode;
}

const providers: CloudProvider[] = [
  {
    name: "Microsoft Azure",
    shortName: "AZURE",
    color: "#0089d6",
    bgColor: "rgba(0, 137, 214, 0.1)",
    status: "operational",
    ping: 24,
    region: "West Europe",
    uptime: "99.99%",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M5.483 18.3L24 5.7V0L0 12.9l5.483 5.4zm13.434-9.9l-5.483 9.9H24V8.4h-5.083zM0 24h24l-5.483-5.7H5.483L0 24z"/></svg>
  },
  {
    name: "Amazon Web Services",
    shortName: "AWS",
    color: "#ff9900",
    bgColor: "rgba(255, 153, 0, 0.1)",
    status: "operational",
    ping: 18,
    region: "eu-west-1",
    uptime: "99.95%",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 01-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 01-.287-.375 6.18 6.18 0 01-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.296.072-.583.16-.863.279-.12.048-.208.08-.263.088a.412.412 0 01-.152.024c-.135 0-.207-.096-.207-.287v-.455c0-.144.016-.248.056-.311a.647.647 0 01.24-.184c.28-.144.618-.263 1.014-.36.396-.095.813-.143 1.251-.143.95 0 1.644.216 2.091.647.439.432.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.503.127-.152.223-.311.272-.487.048-.176.08-.383.08-.623v-.287a6.13 6.13 0 00-.735-.136 6.36 6.36 0 00-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.295.838.295zm6.41.862c-.176 0-.296-.024-.375-.08-.08-.048-.143-.16-.199-.311L7.76 7.63c-.016-.048-.024-.12-.024-.2 0-.127.064-.2.191-.2h.727c.184 0 .31.024.375.08.08.048.142.16.199.312l1.36 5.52 1.083-5.52c.048-.2.112-.311.191-.36.08-.048.207-.072.383-.072h.583c.176 0 .296.024.375.072.08.048.15.16.199.36l1.104 5.592 1.398-5.592c.056-.2.12-.311.2-.36.08-.048.207-.072.383-.072h.69c.128 0 .2.063.2.2 0 .04-.008.08-.016.127a1.43 1.43 0 01-.056.2l-1.746 6.073c-.056.2-.12.311-.2.36-.08.048-.207.072-.375.072h-.623c-.176 0-.296-.024-.375-.08-.08-.048-.15-.16-.199-.311L12.38 9.01l-1.07 5.447c-.048.2-.112.311-.199.36-.08.048-.207.072-.375.072h-.623zm10.337.431c-.48 0-.958-.056-1.42-.167-.463-.112-.822-.239-1.067-.383a.847.847 0 01-.383-.312.68.68 0 01-.08-.335v-.503c0-.12.048-.184.144-.184.048 0 .096.008.152.024.056.016.112.048.176.08.28.127.582.224.91.287.327.064.654.096.982.096.519 0 .926-.088 1.21-.264.287-.176.439-.431.439-.766 0-.224-.072-.407-.215-.551-.144-.144-.383-.272-.718-.376l-1.03-.32c-.518-.16-.902-.399-1.15-.718-.247-.32-.375-.687-.375-1.102 0-.318.064-.607.191-.862.128-.255.303-.48.526-.67.223-.191.479-.335.774-.439.295-.104.614-.16.958-.16.167 0 .342.008.518.032.175.024.343.056.511.088.16.04.311.08.455.127.144.048.255.096.335.144v.503c0 .12-.048.184-.144.184-.08 0-.2-.04-.36-.112a3.01 3.01 0 00-1.42-.328c-.47 0-.846.088-1.118.264-.272.176-.407.423-.407.742 0 .231.08.423.24.574.16.152.447.304.862.439l1.115.352c.518.167.894.399 1.134.694.24.296.36.638.36 1.022 0 .335-.064.638-.199.91-.135.272-.319.511-.55.71-.231.2-.511.352-.838.46-.327.104-.686.16-1.078.16z"/></svg>
  },
  {
    name: "Google Cloud",
    shortName: "GCP",
    color: "#4285f4",
    bgColor: "rgba(66, 133, 244, 0.1)",
    status: "operational",
    ping: 22,
    region: "europe-west1",
    uptime: "99.99%",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12.19 2.38a9.344 9.344 0 00-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 004.077 1.356h5.173l.03-.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 00-7.82-7.03h-.006zm-8.27 7.75h.001c.967.035 1.815.456 2.38 1.122l.004.004.01.01a3.39 3.39 0 01.68 2.29c-.135 1.43-1.33 2.46-2.68 2.33-1.45-.135-2.56-1.44-2.42-2.89.12-1.27 1.22-2.25 2.43-2.26h.596zm4.94 0h.015c1.23-.015 2.28.975 2.34 2.205.06 1.24-.87 2.28-2.1 2.355-1.24.075-2.31-.85-2.45-2.085-.135-1.26.82-2.4 2.09-2.475h.095zm4.9 0h.01c1.2.015 2.21 1.02 2.2 2.22 0 1.225-.985 2.22-2.2 2.22-1.22 0-2.21-.995-2.21-2.22 0-1.205.97-2.195 2.17-2.22h.03z"/></svg>
  },
  {
    name: "Vercel",
    shortName: "VERCEL",
    color: "#ffffff",
    bgColor: "rgba(255, 255, 255, 0.1)",
    status: "operational",
    ping: 12,
    region: "fra1",
    uptime: "99.99%",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M24 22.525H0l12-21.05 12 21.05z"/></svg>
  }
];

function StatusDot({ status, color }: { status: string; color: string }) {
  return (
    <motion.div
      className="w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      animate={{ 
        opacity: status === "operational" ? [1, 0.5, 1] : [1, 0.3, 1],
        scale: status === "operational" ? [1, 1.1, 1] : [1, 0.9, 1]
      }}
      transition={{ 
        duration: status === "operational" ? 2 : 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

function PingBars({ ping, color }: { ping: number; color: string }) {
  const bars = 4;
  const activeBars = Math.max(1, Math.min(bars, Math.floor((50 - ping) / 10)));
  
  return (
    <div className="flex items-end gap-0.5 h-4">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-sm"
          style={{ 
            backgroundColor: i < activeBars ? color : "rgba(255,255,255,0.1)",
            height: `${(i + 1) * 25}%`
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        />
      ))}
    </div>
  );
}

export function CloudStatusBanner() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="relative rounded-lg overflow-hidden border border-[#1e293b] bg-[#0a0a0f]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#13131f] border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#00d4ff]" />
            <span className="font-mono text-xs text-[#64748b]">$ cloud-status --region=eu --monitor</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[#64748b]">{currentTime.toLocaleTimeString()}</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[#ff006e]" />
              <div className="w-2 h-2 rounded-full bg-[#ffbe0b]" />
              <div className="w-2 h-2 rounded-full bg-[#39ff14]" />
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e293b]">
          {providers.map((provider) => (
            <motion.div
              key={provider.shortName}
              className="bg-[#0a0a0f] p-3 relative overflow-hidden group"
              whileHover={{ backgroundColor: "rgba(30, 41, 59, 0.5)" }}
              transition={{ duration: 0.2 }}
            >
              {/* Background glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at center, ${provider.color}10, transparent 70%)` }}
              />
              
              <div className="relative z-10">
                {/* Provider Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div style={{ color: provider.color }}>
                      {provider.icon}
                    </div>
                    <span className="font-mono text-xs font-bold" style={{ color: provider.color }}>
                      {provider.shortName}
                    </span>
                  </div>
                  <StatusDot status={provider.status} color={provider.status === "operational" ? "#39ff14" : "#ff006e"} />
                </div>

                {/* Status Text */}
                <div className="font-mono text-[10px] text-[#64748b] mb-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span className={provider.status === "operational" ? "text-[#39ff14]" : "text-[#ff006e]"}>
                    {provider.status.toUpperCase()}
                  </span>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#64748b]" />
                    <span className="font-mono text-[9px] text-[#64748b]">{provider.region}</span>
                  </div>
                  <PingBars ping={provider.ping} color={provider.color} />
                </div>

                {/* Ping & Uptime */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1e293b]/50">
                  <span className="font-mono text-[9px] text-[#64748b]">
                    {provider.ping}ms
                  </span>
                  <span className="font-mono text-[9px] text-[#39ff14]">
                    {provider.uptime}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#13131f] border-t border-[#1e293b]">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#64748b]">Region: <span className="text-[#00d4ff]">Europe</span></span>
            <span className="font-mono text-[10px] text-[#64748b]">Last check: <span className="text-[#39ff14]">2s ago</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#ffbe0b]" />
            <span className="font-mono text-[10px] text-[#ffbe0b]">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
