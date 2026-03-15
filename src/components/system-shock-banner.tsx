"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TerminalLine {
  id: number;
  text: string;
  type: "command" | "output" | "error" | "warning" | "success";
}

function generateIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function SystemTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);

  const commands = [
    { text: "./hack_target --bypass-firewall", type: "command" as const },
    { text: `[OK] Connection: ${generateIP()}`, type: "success" as const },
    { text: `[WARN] Intrusion detected`, type: "warning" as const },
    { text: `[...] Decrypting...`, type: "output" as const },
    { text: `[OK] Access: ROOT`, type: "success" as const },
    { text: `./exploit_payload --type=overflow`, type: "command" as const },
    { text: `[OK] Payload delivered`, type: "success" as const },
  ];

  useEffect(() => {
    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < commands.length) {
        setLines(prev => [...prev.slice(-5), { ...commands[lineIndex], id: Date.now() }]);
        lineIndex++;
      } else {
        lineIndex = 0;
        setLines([]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-black/80 border border-[#00ff00]/50 rounded overflow-hidden">
      <div className="px-2 py-0.5 bg-[#00ff00]/20 border-b border-[#00ff00]/50 text-[#00ff00] text-[10px] uppercase font-bold font-mono">
        TERMINAL
      </div>
      <div className="flex-1 p-2 space-y-1 overflow-hidden font-mono">
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-[10px] leading-snug ${
              line.type === "command" ? "text-[#00ffff]" :
              line.type === "success" ? "text-[#00ff00]" :
              line.type === "error" ? "text-[#ff0040]" :
              line.type === "warning" ? "text-[#ffaa00]" :
              "text-[#00ff00]/70"
            }`}
          >
            {line.type === "command" && "> "}{line.text}
          </motion.div>
        ))}
        <span className={`text-[#00ff00] text-[10px] ${cursorVisible ? "opacity-100" : "opacity-0"}`}>▮</span>
      </div>
    </div>
  );
}

function RadarScanner() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg width="80" height="80" viewBox="0 0 100 100" className="opacity-90">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#00ff00" strokeWidth="1" opacity="0.5" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="#00ff00" strokeWidth="0.8" opacity="0.4" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="#00ff00" strokeWidth="0.6" opacity="0.3" />
        <line x1="50" y1="4" x2="50" y2="96" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
        <line x1="4" y1="50" x2="96" y2="50" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
        <motion.line
          x1="50" y1="50" x2="50" y2="6"
          stroke="#00ff00"
          strokeWidth="1.5"
          opacity="1"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        />
        <motion.circle cx="72" cy="28" r="2.5" fill="#ff0040" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} />
        <motion.circle cx="28" cy="68" r="2.5" fill="#ffaa00" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 1.5 }} />
      </svg>
      <div className="text-[9px] text-[#00ff00] font-mono mt-1 tracking-wider">SCANNER</div>
    </div>
  );
}

function StatusBar({ time }: { time: Date }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-5 bg-black/80 border-b border-[#00ff00]/40 flex items-center px-3 justify-between text-[10px] font-mono text-[#00ff00] z-30">
      <div className="flex items-center gap-3">
        <span className="font-bold">SYS.SHODAN</span>
        <span className="text-[#00ff00]/40">|</span>
        <span className="text-[#00ff00]/80">SECURE</span>
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-[#ff0040]">● LIVE</motion.span>
      </div>
      <div className="flex items-center gap-4">
        <span>CPU: {Math.floor(Math.random() * 15 + 20)}%</span>
        <span>MEM: {Math.floor(Math.random() * 20 + 30)}%</span>
        <span className="text-[#00ff00]/70">{time.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

function CornerFrame() {
  return (
    <div className="absolute inset-1 pointer-events-none">
      <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-[#00ff00]/60" />
      <div className="absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-[#00ff00]/60" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-[#00ff00]/60" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-[#00ff00]/60" />
    </div>
  );
}

function CyberGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, #00ff00 1px, transparent 1px), linear-gradient(to bottom, #00ff00 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(55deg) translateY(-30px) scale(1.2)',
          transformOrigin: 'center top',
        }}
      />
    </div>
  );
}

export function SystemShockBanner() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="relative h-48 rounded-lg overflow-hidden border-2 border-[#00ff00]/60 bg-black">
        {/* Scanlines */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 opacity-40"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.04) 2px, rgba(0,255,0,0.04) 4px)',
          }}
        />
        
        {/* Grid Background */}
        <CyberGrid />
        
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff00]/10 via-transparent to-transparent" />
        
        {/* Status Bar */}
        <StatusBar time={time} />
        
        {/* Corner Frame */}
        <CornerFrame />
        
        {/* Main Content - 3 Column Grid */}
        <div className="absolute inset-0 top-5 grid grid-cols-3 gap-2 px-3 py-2">
          
          {/* Left Column - Radar */}
          <div className="flex items-center justify-center">
            <RadarScanner />
          </div>
          
          {/* Center Column - SHODAN Eye */}
          <div className="flex flex-col items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <svg width="100" height="70" viewBox="0 0 60 40">
                <ellipse cx="30" cy="20" rx="26" ry="16" fill="none" stroke="#00ff00" strokeWidth="1.5" />
                <ellipse cx="30" cy="20" rx="20" ry="11" fill="none" stroke="#00ff00" strokeWidth="1" opacity="0.6" />
                <ellipse cx="30" cy="20" rx="14" ry="7" fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.4" />
                <motion.ellipse 
                  cx="30" cy="20" rx="7" ry="4" 
                  fill="#00ff00"
                  animate={{ rx: [7, 9, 7], ry: [4, 5, 4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </svg>
            </motion.div>
            <div className="text-[12px] text-[#00ff00] font-mono tracking-[0.3em] mt-1 font-bold">
              SHODAN
            </div>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-2 text-[11px] font-mono text-[#ff0040] tracking-wider font-bold"
            >
              ⚠ UNAUTHORIZED ACCESS
            </motion.div>
          </div>
          
          {/* Right Column - Terminal */}
          <div className="h-full py-1">
            <SystemTerminal />
          </div>
        </div>
      </div>
    </div>
  );
}
