"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Mario Farben
const C = {
  _: "transparent",
  R: "#e52521", // Rot
  B: "#0045ad", // Blau
  S: "#ffcc99", // Haut
  H: "#6d4c41", // Braun
  Y: "#fdd835", // Gelb
};

// Mario Pixel Art Frames (12x16)
const marioFrames = [
  // Frame 0 - Stehen
  [
    [C._, C._, C._, C.R, C.R, C.R, C.R, C.R, C._, C._, C._, C._],
    [C._, C._, C.R, C.R, C.R, C.R, C.R, C.R, C.R, C.R, C._, C._],
    [C._, C._, C.H, C.H, C.H, C.S, C.S, C.H, C.S, C._, C._, C._],
    [C._, C.H, C.S, C.H, C.S, C.S, C.S, C.H, C.S, C.S, C._, C._],
    [C._, C.H, C.S, C.H, C.H, C.S, C.S, C.S, C.H, C.S, C.S, C._],
    [C._, C.H, C.H, C.S, C.S, C.S, C.S, C.H, C.H, C.H, C._, C._],
    [C._, C._, C._, C.S, C.S, C.S, C.S, C.S, C.S, C._, C._, C._],
    [C._, C._, C.R, C.R, C.Y, C.B, C.R, C.R, C._, C._, C._, C._],
    [C._, C.R, C.R, C.R, C.B, C.B, C.B, C.R, C.R, C.R, C._, C._],
    [C.R, C.R, C.R, C.R, C.B, C.B, C.B, C.R, C.R, C.R, C.R, C._],
    [C.S, C.S, C.R, C.B, C.S, C.B, C.S, C.B, C.R, C.S, C.S, C._],
    [C.S, C.S, C.S, C.B, C.B, C.B, C.B, C.B, C.S, C.S, C.S, C._],
    [C.S, C.S, C.B, C.B, C.B, C.B, C.B, C.B, C.B, C.S, C.S, C._],
    [C._, C._, C.B, C.B, C.B, C._, C.B, C.B, C.B, C._, C._, C._],
    [C._, C.H, C.H, C.H, C._, C._, C.H, C.H, C.H, C._, C._, C._],
    [C.H, C.H, C.H, C.H, C._, C._, C.H, C.H, C.H, C.H, C._, C._],
  ],
  // Frame 1 - Laufen 1
  [
    [C._, C._, C._, C.R, C.R, C.R, C.R, C.R, C._, C._, C._, C._],
    [C._, C._, C.R, C.R, C.R, C.R, C.R, C.R, C.R, C.R, C._, C._],
    [C._, C._, C.H, C.H, C.H, C.S, C.S, C.H, C.S, C._, C._, C._],
    [C._, C.H, C.S, C.H, C.S, C.S, C.S, C.H, C.S, C.S, C._, C._],
    [C._, C.H, C.S, C.H, C.H, C.S, C.S, C.S, C.H, C.S, C.S, C._],
    [C._, C.H, C.H, C.S, C.S, C.S, C.S, C.H, C.H, C.H, C._, C._],
    [C._, C._, C._, C.S, C.S, C.S, C.S, C.S, C.S, C._, C._, C._],
    [C._, C._, C.R, C.R, C.Y, C.B, C.R, C.R, C._, C._, C._, C._],
    [C._, C.R, C.R, C.R, C.B, C.B, C.B, C.R, C.R, C.R, C._, C._],
    [C.R, C.R, C.R, C.R, C.B, C.B, C.B, C.R, C.R, C.R, C.R, C._],
    [C.S, C.S, C.R, C.B, C.S, C.B, C.S, C.B, C.R, C.S, C.S, C._],
    [C.S, C.S, C.S, C.B, C.B, C.B, C.B, C.B, C.S, C.S, C.S, C._],
    [C._, C.S, C.B, C.B, C.B, C.B, C.B, C.B, C.B, C.S, C._, C._],
    [C._, C.B, C.B, C.B, C._, C._, C.B, C.B, C.B, C.B, C._, C._],
    [C.H, C.H, C.H, C._, C._, C._, C.H, C.H, C.H, C._, C._, C._],
    [C.H, C.H, C.H, C.H, C._, C._, C._, C.H, C.H, C.H, C._, C._],
  ],
  // Frame 2 - Laufen 2
  [
    [C._, C._, C._, C.R, C.R, C.R, C.R, C.R, C._, C._, C._, C._],
    [C._, C._, C.R, C.R, C.R, C.R, C.R, C.R, C.R, C.R, C._, C._],
    [C._, C._, C.H, C.H, C.H, C.S, C.S, C.H, C.S, C._, C._, C._],
    [C._, C.H, C.S, C.H, C.S, C.S, C.S, C.H, C.S, C.S, C._, C._],
    [C._, C.H, C.S, C.H, C.H, C.S, C.S, C.S, C.H, C.S, C.S, C._],
    [C._, C.H, C.H, C.S, C.S, C.S, C.S, C.H, C.H, C.H, C._, C._],
    [C._, C._, C._, C.S, C.S, C.S, C.S, C.S, C.S, C._, C._, C._],
    [C._, C._, C.R, C.R, C.Y, C.B, C.R, C.R, C._, C._, C._, C._],
    [C._, C.R, C.R, C.R, C.B, C.B, C.B, C.R, C.R, C.R, C._, C._],
    [C.R, C.R, C.R, C.R, C.B, C.B, C.B, C.R, C.R, C.R, C.R, C._],
    [C.S, C.S, C.R, C.B, C.S, C.B, C.S, C.B, C.R, C.S, C.S, C._],
    [C.S, C.S, C.S, C.B, C.B, C.B, C.B, C.B, C.S, C.S, C.S, C._],
    [C.S, C.S, C.B, C.B, C.B, C.B, C.B, C.B, C.B, C.S, C.S, C._],
    [C.B, C.B, C.B, C._, C._, C.B, C.B, C.B, C._, C._, C._, C._],
    [C._, C.H, C.H, C._, C._, C.H, C.H, C.H, C._, C._, C._, C._],
    [C._, C.H, C.H, C.H, C._, C.H, C.H, C.H, C.H, C._, C._, C._],
  ],
  // Frame 3 - Springen
  [
    [C._, C._, C._, C._, C._, C.R, C.R, C.R, C.R, C._, C._, C._],
    [C._, C._, C._, C.R, C.R, C.R, C.R, C.R, C.R, C.R, C._, C._],
    [C._, C._, C.H, C.H, C.H, C.S, C.S, C.H, C.S, C._, C._, C._],
    [C._, C.H, C.S, C.H, C.S, C.S, C.S, C.H, C.S, C.S, C._, C._],
    [C._, C.H, C.S, C.H, C.H, C.S, C.S, C.S, C.H, C.S, C.S, C._],
    [C._, C.H, C.H, C.S, C.S, C.S, C.S, C.H, C.H, C.H, C._, C._],
    [C._, C._, C.S, C.S, C.S, C.S, C.S, C.S, C.S, C.S, C._, C._],
    [C._, C.R, C.R, C.Y, C.B, C.R, C.R, C._, C._, C._, C._, C._],
    [C.R, C.R, C.R, C.B, C.B, C.B, C.R, C.R, C.R, C._, C._, C._],
    [C.R, C.R, C.R, C.R, C.B, C.B, C.B, C.R, C.R, C.R, C.R, C._],
    [C.S, C.S, C.R, C.B, C.S, C.B, C.S, C.B, C.R, C.S, C.S, C._],
    [C._, C.S, C.S, C.B, C.B, C.B, C.B, C.B, C.S, C.S, C._, C._],
    [C._, C._, C.B, C.B, C.B, C.B, C.B, C.B, C.B, C._, C._, C._],
    [C._, C.B, C.B, C.B, C._, C._, C.B, C.B, C.B, C.B, C._, C._],
    [C.H, C.H, C.H, C._, C._, C._, C._, C.H, C.H, C.H, C._, C._],
    [C._, C.H, C.H, C._, C._, C._, C.H, C.H, C._, C._, C._, C._],
  ],
];

// Mario Sprite Komponente
function MarioSprite({ 
  direction = "right", 
  frame = 0,
  isJumping = false,
}: { 
  direction?: "left" | "right"; 
  frame?: number;
  isJumping?: boolean;
}) {
  const currentFrame = isJumping ? marioFrames[3] : marioFrames[frame % 3];

  return (
    <div 
      className="inline-block"
      style={{ 
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
        imageRendering: "pixelated",
      }}
    >
      <div 
        className="grid"
        style={{ 
          gridTemplateColumns: "repeat(12, 2px)",
          gridTemplateRows: "repeat(16, 2px)",
          gap: 0,
        }}
      >
        {currentFrame.flat().map((color, i) => (
          <div 
            key={i} 
            style={{ 
              width: 2, 
              height: 2, 
              backgroundColor: color,
            }} 
          />
        ))}
      </div>
    </div>
  );
}

// Ground Block
function GroundBlock() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" className="flex-shrink-0">
      <rect x="0" y="0" width="32" height="32" fill="#c84c0c" stroke="#000" strokeWidth="2"/>
      <rect x="2" y="2" width="12" height="6" fill="#a03a08"/>
      <rect x="16" y="2" width="14" height="6" fill="#a03a08"/>
      <rect x="2" y="10" width="8" height="6" fill="#a03a08"/>
      <rect x="12" y="10" width="18" height="6" fill="#a03a08"/>
      <rect x="2" y="18" width="14" height="6" fill="#a03a08"/>
      <rect x="18" y="18" width="12" height="6" fill="#a03a08"/>
      <rect x="2" y="26" width="10" height="4" fill="#a03a08"/>
      <rect x="14" y="26" width="16" height="4" fill="#a03a08"/>
      <rect x="0" y="0" width="32" height="2" fill="#fcbcb0"/>
    </svg>
  );
}

// Question Block
function QuestionBlock() {
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
      className="flex-shrink-0"
    >
      <svg width="24" height="24" viewBox="0 0 32 32">
        <rect x="0" y="0" width="32" height="32" fill="#f8b800" stroke="#000" strokeWidth="2"/>
        <circle cx="4" cy="4" r="1.5" fill="#b86e00"/>
        <circle cx="28" cy="4" r="1.5" fill="#b86e00"/>
        <circle cx="4" cy="28" r="1.5" fill="#b86e00"/>
        <circle cx="28" cy="28" r="1.5" fill="#b86e00"/>
        <text x="16" y="23" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#000" fontFamily="monospace">?</text>
        <rect x="2" y="2" width="28" height="2" fill="#fceea8"/>
        <rect x="2" y="28" width="28" height="2" fill="#b86e00"/>
      </svg>
    </motion.div>
  );
}

// Pipe
function Pipe() {
  return (
    <div className="flex-shrink-0">
      <svg width="32" height="40" viewBox="0 0 40 48">
        <rect x="4" y="16" width="32" height="32" fill="#00a800" stroke="#000" strokeWidth="2"/>
        <rect x="2" y="0" width="36" height="18" fill="#00a800" stroke="#000" strokeWidth="2"/>
        <rect x="2" y="0" width="36" height="3" fill="#00f800"/>
        <rect x="6" y="19" width="3" height="26" fill="#00f800" opacity="0.5"/>
      </svg>
    </div>
  );
}

// Cloud
function Cloud() {
  return (
    <motion.div
      animate={{ x: [0, 40, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg width="48" height="24" viewBox="0 0 64 32" className="opacity-90">
        <path 
          d="M8 24h48c4.4 0 8-3.6 8-8s-3.6-8-8-8c0-4.4-3.6-8-8-8-2.2 0-4.2 0.9-5.7 2.3C45.8 5.8 42.2 4 38 4c-6.6 0-12 5.4-12 12-4.4 0-8 3.6-8 8s3.6 8 8 8z" 
          fill="#fff" 
          stroke="#000" 
          strokeWidth="1"
        />
      </svg>
    </motion.div>
  );
}

// Bush
function Bush() {
  return (
    <svg width="36" height="18" viewBox="0 0 48 24" className="flex-shrink-0">
      <ellipse cx="12" cy="20" rx="10" ry="12" fill="#00a800" stroke="#000" strokeWidth="1"/>
      <ellipse cx="24" cy="16" rx="12" ry="14" fill="#00a800" stroke="#000" strokeWidth="1"/>
      <ellipse cx="36" cy="20" rx="10" ry="12" fill="#00a800" stroke="#000" strokeWidth="1"/>
    </svg>
  );
}

// Coin
function Coin() {
  return (
    <motion.div
      animate={{ 
        y: [0, -16, -16, 0],
        scaleX: [1, 0.1, 1, 1],
      }}
      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
      className="absolute"
    >
      <svg width="16" height="20" viewBox="0 0 20 24">
        <ellipse cx="10" cy="12" rx="8" ry="10" fill="#fdd835" stroke="#b8860b" strokeWidth="1"/>
        <text x="10" y="17" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#b8860b">$</text>
      </svg>
    </motion.div>
  );
}

// Goomba
function Goomba() {
  return (
    <motion.div
      animate={{ x: [-10, 10, -10] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="24" height="20" viewBox="0 0 28 24">
        <path d="M2 12 Q2 2 14 2 Q26 2 26 12 L26 20 L2 20 Z" fill="#8b4513" stroke="#000" strokeWidth="1.5"/>
        <ellipse cx="8" cy="10" rx="3" ry="4" fill="#fff" stroke="#000" strokeWidth="1"/>
        <ellipse cx="20" cy="10" rx="3" ry="4" fill="#fff" stroke="#000" strokeWidth="1"/>
        <circle cx="8" cy="10" r="1.5" fill="#000"/>
        <circle cx="20" cy="10" r="1.5" fill="#000"/>
        <line x1="5" y1="5" x2="11" y2="7" stroke="#000" strokeWidth="1.5"/>
        <line x1="17" y1="7" x2="23" y2="5" stroke="#000" strokeWidth="1.5"/>
        <path d="M4 20 L4 24 L10 24 L10 20" fill="#000"/>
        <path d="M18 20 L18 24 L24 24 L24 20" fill="#000"/>
      </svg>
    </motion.div>
  );
}

// Animierter Mario
function AnimatedMario({ 
  direction = "right", 
  duration = 10,
  delay = 0
}: { 
  direction?: "left" | "right"; 
  duration?: number;
  delay?: number;
}) {
  const [frame, setFrame] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isJumping) {
        setFrame(f => (f + 1) % 3);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [isJumping]);

  useEffect(() => {
    const jumpInterval = setInterval(() => {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(jumpInterval);
  }, []);

  return (
    <motion.div
      initial={{ x: direction === "right" ? -50 : 600 }}
      animate={{ x: direction === "right" ? 700 : -50 }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "linear",
        delay
      }}
      style={{ 
        position: "absolute",
        bottom: isJumping ? 80 : 32,
        zIndex: 20,
      }}
    >
      <motion.div
        animate={{ 
          y: isJumping ? [0, -50, 0] : [0, -2, 0],
        }}
        transition={{ 
          duration: isJumping ? 0.6 : 0.12, 
          repeat: isJumping ? 0 : Infinity,
          ease: isJumping ? "easeOut" : "linear"
        }}
      >
        <MarioSprite 
          direction={direction} 
          frame={frame} 
          isJumping={isJumping}
        />
      </motion.div>
    </motion.div>
  );
}

export function MarioBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const groundPattern = Array.from({ length: 35 }, (_, i) => {
    if (i % 10 === 5) return "question";
    if (i % 14 === 8) return "pipe";
    if (i % 7 === 3 && i > 0) return "bush";
    return "ground";
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div 
        className="relative h-24 rounded-lg overflow-hidden border-2 border-[#1e293b] bg-[#5c94fc]"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Himmel */}
        <div className="absolute inset-0 bg-[#5c94fc]" />
        
        {/* Wolken */}
        <div className="absolute top-1 left-[5%]">
          <Cloud />
        </div>
        <div className="absolute top-2 left-[35%]">
          <Cloud />
        </div>
        <div className="absolute top-1 right-[15%]">
          <Cloud />
        </div>
        <div className="absolute top-3 left-[65%]">
          <Cloud />
        </div>

        {/* Boden */}
        <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end justify-center px-2">
          {groundPattern.map((type, i) => (
            <div key={i} className="flex-shrink-0">
              {type === "question" && <QuestionBlock />}
              {type === "pipe" && <Pipe />}
              {type === "bush" && <div className="mb-1"><Bush /></div>}
              {type === "ground" && <GroundBlock />}
            </div>
          ))}
        </div>

        {/* Marios */}
        <AnimatedMario direction="right" duration={12} delay={0} />
        <AnimatedMario direction="left" duration={14} delay={6} />

        {/* Münzen */}
        <div className="absolute bottom-20 left-[18%]">
          <Coin />
        </div>
        <div className="absolute bottom-24 left-[38%]">
          <Coin />
        </div>
        <div className="absolute bottom-20 right-[22%]">
          <Coin />
        </div>

        {/* Goombas */}
        <div className="absolute bottom-8 left-[28%]">
          <Goomba />
        </div>
        <div className="absolute bottom-8 right-[32%]">
          <Goomba />
        </div>

        {/* HUD */}
        <div className="absolute top-1.5 left-3 font-mono text-[9px] leading-tight z-30">
          <div className="text-white drop-shadow-[1px_1px_0_#000]">MARIO</div>
          <div className="text-[#f8b800] drop-shadow-[1px_1px_0_#000]">000425</div>
        </div>
        
        <div className="absolute top-1.5 right-3 font-mono text-[9px] leading-tight text-right z-30">
          <div className="text-white drop-shadow-[1px_1px_0_#000]">WORLD</div>
          <div className="text-white drop-shadow-[1px_1px_0_#000]">1-1</div>
        </div>

        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 font-mono text-[9px] leading-tight text-center z-30">
          <div className="text-white drop-shadow-[1px_1px_0_#000]">TIME</div>
          <motion.div 
            className="text-[#f8b800] drop-shadow-[1px_1px_0_#000]"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            364
          </motion.div>
        </div>

        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] font-mono text-white/50 drop-shadow-[1px_1px_0_#000] z-30">
          8-BIT RETRO
        </div>
      </div>
    </div>
  );
}
