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
    { text: `[OK] Connection established: ${generateIP()}`, type: "success" as const },
    { text: `[WARN] Intrusion detection active`, type: "warning" as const },
    { text: `[...] Decrypting security protocols...`, type: "output" as const },
    { text: `[OK] Access granted: ROOT`, type: "success" as const },
    { text: `./exploit_payload --type=buffer-overflow`, type: "command" as const },
    { text: `[ERR] Segmentation fault at 0x7FFF`, type: "error" as const },
    { text: `./retry --force`, type: "command" as const },
    { text: `[OK] Payload delivered successfully`, type: "success" as const },
    { text: `./download --files=classified`, type: "command" as const },
    { text: `[...] Downloading 847MB...`, type: "output" as const },
    { text: `[OK] Transfer complete`, type: "success" as const },
  ];

  useEffect(() => {
    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < commands.length) {
        setLines(prev => [...prev.slice(-8), { ...commands[lineIndex], id: Date.now() }]);
        lineIndex++;
      } else {
        lineIndex = 0;
        setLines([]);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-black/90 border border-[#00ff00]/60 rounded overflow-hidden">
      <div className="px-2 py-1 bg-[#00ff00]/20 border-b border-[#00ff00]/50">
        <span className="text-[#00ff00] text-[10px] uppercase font-bold font-mono tracking-wider">SYSTEM TERMINAL v2.1</span>
      </div>
      <div className="flex-1 p-2 overflow-hidden font-mono space-y-0.5">
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className={`text-[9px] leading-tight ${
              line.type === "command" ? "text-[#00ffff]" :
              line.type === "success" ? "text-[#00ff00]" :
              line.type === "error" ? "text-[#ff3333]" :
              line.type === "warning" ? "text-[#ffaa00]" :
              "text-[#00ff00]/60"
            }`}
          >
            {line.type === "command" && "> "}{line.text}
          </motion.div>
        ))}
        <span className={`text-[#00ff00] text-[9px] ${cursorVisible ? "opacity-100" : "opacity-0"}`}>▮</span>
      </div>
    </div>
  );
}

function RadarScanner() {
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#00ff00" strokeWidth="1" opacity="0.5" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#00ff00" strokeWidth="0.8" opacity="0.4" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="#00ff00" strokeWidth="0.6" opacity="0.3" />
        <circle cx="50" cy="50" r="10" fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
        <line x1="50" y1="4" x2="50" y2="96" stroke="#00ff00" strokeWidth="0.4" opacity="0.25" />
        <line x1="4" y1="50" x2="96" y2="50" stroke="#00ff00" strokeWidth="0.4" opacity="0.25" />
        <motion.line
          x1="50" y1="50" x2="50" y2="6"
          stroke="#00ff00"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        />
        <motion.circle cx="72" cy="30" r="3" fill="#ff0040" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
        <motion.circle cx="30" cy="70" r="3" fill="#ffaa00" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.8 }} />
      </svg>
      <div className="text-[9px] text-[#00ff00] font-mono mt-1 tracking-widest">SYS.SCANNER</div>
    </div>
  );
}

function StatusBar({ time }: { time: Date }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-5 bg-black/80 border-b border-[#00ff00]/40 flex items-center px-3 justify-between text-[9px] font-mono z-20">
      <div className="flex items-center gap-2">
        <span className="text-[#00ff00] font-bold">SYS.SHODAN</span>
        <span className="text-[#00ff00]/30">|</span>
        <span className="text-[#00ff00]/70">SECURE CONNECTION</span>
        <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-[#ff0040] ml-1">● LIVE</motion.span>
      </div>
      <div className="flex items-center gap-3 text-[#00ff00]/90">
        <span>CPU: {Math.floor(Math.random() * 15 + 18)}%</span>
        <span>MEM: {Math.floor(Math.random() * 20 + 35)}%</span>
        <span className="text-[#00ff00]/60">{time.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

function CornerFrame() {
  return (
    <div className="absolute inset-2 pointer-events-none z-10">
      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[#00ff00]/50" />
      <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-[#00ff00]/50" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-[#00ff00]/50" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[#00ff00]/50" />
    </div>
  );
}

function CyberGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.08] pointer-events-none">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, #00ff00 1px, transparent 1px), linear-gradient(to bottom, #00ff00 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          transform: 'perspective(600px) rotateX(60deg) translateY(-20px)',
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
          className="absolute inset-0 pointer-events-none z-10 opacity-30"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)',
          }}
        />
        
        {/* Subtle Grid */}
        <CyberGrid />
        
        {/* Top gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff00]/8 via-transparent to-transparent pointer-events-none" />
        
        {/* Status Bar */}
        <StatusBar time={time} />
        
        {/* Corner Frame */}
        <CornerFrame />
        
        {/* Main Content */}
        <div className="absolute inset-0 top-5 flex items-stretch px-4 py-2 gap-4">
          
          {/* Left - Radar */}
          <div className="w-1/4 flex items-center justify-center">
            <RadarScanner />
          </div>
          
          {/* Center - SHODAN Eye */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg width="140" height="90" viewBox="0 0 60 40">
                <ellipse cx="30" cy="20" rx="28" ry="18" fill="none" stroke="#00ff00" strokeWidth="1.5" />
                <ellipse cx="30" cy="20" rx="22" ry="13" fill="none" stroke="#00ff00" strokeWidth="1" opacity="0.6" />
                <ellipse cx="30" cy="20" rx="16" ry="9" fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.4" />
                <motion.ellipse 
                  cx="30" cy="20" rx="8" ry="5" 
                  fill="#00ff00"
                  animate={{ rx: [8, 10, 8], ry: [5, 6, 5] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </svg>
            </motion.div>
            <div className="text-[14px] text-[#00ff00] font-mono tracking-[0.25em] mt-2 font-bold">
              SHODAN
            </div>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-2 text-[11px] font-mono text-[#ff0040] tracking-widest font-bold"
            >
              ⚠ UNAUTHORIZED ACCESS DETECTED
            </motion.div>
          </div>
          
          {/* Right - Terminal */}
          <div className="w-1/3 h-full">
            <SystemTerminal />
          </div>
        </div>
      </div>
    </div>
  );
}
