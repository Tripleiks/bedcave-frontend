"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

// System Shock Retro Sci-Fi Banner
// Inspired by the 1994 cyberpunk classic

interface TerminalLine {
  id: number;
  text: string;
  type: "command" | "output" | "error" | "warning" | "success";
}

// Generate random hex data
function generateHexData(length: number): string {
  const chars = "0123456789ABCDEF";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
    if (i % 2 === 1 && i < length - 1) result += " ";
  }
  return result;
}

// Generate random IP
function generateIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// System Shock Terminal Component
function SystemTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands = [
    { text: "./hack_target --bypass-firewall", type: "command" as const },
    { text: `[OK] Connection established: ${generateIP()}`, type: "success" as const },
    { text: `[WARN] Intrusion detection active`, type: "warning" as const },
    { text: `[...] Decrypting security protocols...`, type: "output" as const },
    { text: `[OK] Access granted: ROOT`, type: "success" as const },
    { text: `./exploit_payload --type=buffer-overflow`, type: "command" as const },
    { text: `[ERR] Segmentation fault at 0x${generateHexData(8).replace(/ /g, "")}`, type: "error" as const },
    { text: `./retry --force`, type: "command" as const },
    { text: `[OK] Payload delivered successfully`, type: "success" as const },
    { text: `./download --files=classified`, type: "command" as const },
    { text: `[...] Downloading ${Math.floor(Math.random() * 999)}MB...`, type: "output" as const },
    { text: `[OK] Transfer complete`, type: "success" as const },
    { text: `./disconnect --clean-logs`, type: "command" as const },
  ];

  useEffect(() => {
    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < commands.length) {
        setLines(prev => [...prev.slice(-6), { ...commands[lineIndex], id: Date.now() }]);
        lineIndex++;
      } else {
        lineIndex = 0;
        setLines([]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="absolute right-4 top-4 bottom-4 w-64 bg-black/80 border border-[#00ff00]/30 rounded font-mono text-xs overflow-hidden">
      <div className="px-2 py-1 bg-[#00ff00]/10 border-b border-[#00ff00]/30 text-[#00ff00] text-[10px] uppercase tracking-wider">
        SYSTEM TERMINAL v2.1
      </div>
      <div ref={terminalRef} className="p-2 space-y-1 overflow-hidden h-[calc(100%-24px)]">
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-[10px] ${
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
        <span className={`text-[#00ff00] ${cursorVisible ? "opacity-100" : "opacity-0"}`}>▮</span>
      </div>
    </div>
  );
}

// Hex Dump Component
function HexDump() {
  const [hexData, setHexData] = useState<string[]>([]);

  useEffect(() => {
    const generateData = () => {
      const data = [];
      for (let i = 0; i < 8; i++) {
        const offset = (i * 16).toString(16).padStart(8, "0");
        const bytes = generateHexData(32);
        const ascii = bytes.replace(/[0-9A-F]{2}/g, (hex) => {
          const char = String.fromCharCode(parseInt(hex, 16));
          return char >= " " && char <= "~" ? char : ".";
        }).replace(/ /g, "");
        data.push(`${offset}  ${bytes}  |${ascii}|`);
      }
      return data;
    };

    setHexData(generateData());
    const interval = setInterval(() => {
      setHexData(generateData());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute left-4 bottom-8 font-mono text-[8px] text-[#00ff00]/40 leading-tight hidden md:block">
      {hexData.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}

// Radar/Scanner Component
function RadarScanner() {
  return (
    <div className="absolute left-4 top-4 w-20 h-20 hidden md:block">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
        
        {/* Scan line */}
        <motion.line
          x1="50" y1="50" x2="50" y2="5"
          stroke="#00ff00"
          strokeWidth="1"
          opacity="0.8"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        />
        
        {/* Blips */}
        <motion.circle
          cx="70" cy="30" r="2" fill="#ff0040"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
        <motion.circle
          cx="25" cy="60" r="2" fill="#ffaa00"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 2.5 }}
        />
      </svg>
      <div className="text-[8px] text-[#00ff00] text-center mt-1">SYS.SCANNER</div>
    </div>
  );
}

// Augmented Reality HUD Element
function ARHud() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#00ff00]/50" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#00ff00]/50" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#00ff00]/50" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#00ff00]/50" />
      
      {/* Center crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-30">
          <circle cx="20" cy="20" r="15" fill="none" stroke="#00ff00" strokeWidth="0.5" />
          <line x1="20" y1="5" x2="20" y2="12" stroke="#00ff00" strokeWidth="1" />
          <line x1="20" y1="28" x2="20" y2="35" stroke="#00ff00" strokeWidth="1" />
          <line x1="5" y1="20" x2="12" y2="20" stroke="#00ff00" strokeWidth="1" />
          <line x1="28" y1="20" x2="35" y2="20" stroke="#00ff00" strokeWidth="1" />
          <circle cx="20" cy="20" r="2" fill="#00ff00" />
        </svg>
      </div>
    </div>
  );
}

// Animated Data Stream
function DataStream() {
  const chars = "ABCDEF0123456789";
  const [stream, setStream] = useState<string[]>([]);

  useEffect(() => {
    const generateStream = () => {
      return Array.from({ length: 20 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      );
    };

    setStream(generateStream());
    const interval = setInterval(() => {
      setStream(generateStream());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute right-72 top-4 bottom-4 w-8 overflow-hidden hidden lg:block">
      <div className="flex flex-col items-center text-[#00ff00]/30 text-xs font-mono">
        {stream.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            {char}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// Cyberpunk Grid Background
function CyberGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00ff00 1px, transparent 1px),
            linear-gradient(to bottom, #00ff00 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px)',
          transformOrigin: 'center top',
        }}
      />
    </div>
  );
}

// Status Bar
function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-6 bg-black/60 border-b border-[#00ff00]/30 flex items-center px-4 justify-between text-[10px] font-mono text-[#00ff00]">
      <div className="flex items-center gap-4">
        <span>SYS.SHODAN v1.0</span>
        <span className="text-[#00ff00]/50">|</span>
        <span>SECURE CONNECTION</span>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[#ff0040]"
        >
          ● LIVE
        </motion.span>
      </div>
      <div className="flex items-center gap-4">
        <span>CPU: {Math.floor(Math.random() * 30 + 20)}%</span>
        <span>MEM: {Math.floor(Math.random() * 40 + 30)}%</span>
        <span>{time.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

export function SystemShockBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div 
        className="relative h-28 rounded-lg overflow-hidden border-2 border-[#00ff00]/50 bg-black"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Scanlines effect */}
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)',
          }}
        />
        
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff00]/5 to-transparent" />
        
        {/* Cyber Grid */}
        <CyberGrid />
        
        {/* Status Bar */}
        <StatusBar />
        
        {/* AR HUD */}
        <ARHud />
        
        {/* Terminal */}
        <SystemTerminal />
        
        {/* Radar */}
        <RadarScanner />
        
        {/* Hex Dump */}
        <HexDump />
        
        {/* Data Stream */}
        <DataStream />
        
        {/* Central SHODAN eye */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative"
          >
            <svg width="60" height="40" viewBox="0 0 60 40">
              {/* SHODAN eye shape */}
              <ellipse cx="30" cy="20" rx="25" ry="15" fill="none" stroke="#00ff00" strokeWidth="1" />
              <ellipse cx="30" cy="20" rx="20" ry="10" fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.5" />
              <ellipse cx="30" cy="20" rx="15" ry="6" fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.3" />
              {/* Pupil */}
              <motion.ellipse 
                cx="30" cy="20" rx="6" ry="3" 
                fill="#00ff00"
                animate={{ rx: [6, 8, 6], ry: [3, 4, 3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>
            <div className="text-[8px] text-[#00ff00] text-center mt-1 font-mono tracking-widest">
              SHODAN
            </div>
          </motion.div>
        </div>
        
        {/* Warning text */}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#ff0040] tracking-widest"
        >
          UNAUTHORIZED ACCESS DETECTED
        </motion.div>
      </div>
    </div>
  );
}
