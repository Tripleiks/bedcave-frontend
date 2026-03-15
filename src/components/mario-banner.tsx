"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// 8-bit Mario mit richtiger Pixel Art (12x16)
function MarioSprite({ direction = "right", frame = 0 }: { direction?: "left" | "right"; frame?: number }) {
  // Mario Farben
  const R = "#e52521"; // Rot
  const B = "#0045ad"; // Blau  
  const S = "#ffcc99"; // Haut
  const H = "#6d4c41"; // Braun (Haare/Schuhe)
  const Y = "#fdd835"; // Gelb (Knöpfe)
  const _ = "transparent";

  // 3 Lauf-Frames für Animation
  const frames = [
    // Frame 1 - Stehend
    [
      [_, _, _, R, R, R, R, R, _, _, _, _],
      [_, _, R, R, R, R, R, R, R, R, _, _],
      [_, _, H, H, H, S, S, H, S, _, _, _],
      [_, H, S, H, S, S, S, H, S, S, _, _],
      [_, H, S, H, H, S, S, S, H, S, S, _],
      [_, H, H, S, S, S, S, H, H, H, _, _],
      [_, _, _, S, S, S, S, S, S, _, _, _],
      [_, _, R, R, Y, B, R, R, _, _, _, _],
      [_, R, R, R, B, B, B, R, R, R, _, _],
      [R, R, R, R, B, B, B, R, R, R, R, _],
      [S, S, R, B, S, B, S, B, R, S, S, _],
      [S, S, S, B, B, B, B, B, S, S, S, _],
      [S, S, B, B, B, B, B, B, B, S, S, _],
      [_, _, B, B, B, _, B, B, B, _, _, _],
      [_, H, H, H, _, _, H, H, H, _, _, _],
      [H, H, H, H, _, _, H, H, H, H, _, _],
    ],
    // Frame 2 - Laufen Schritt 1
    [
      [_, _, _, R, R, R, R, R, _, _, _, _],
      [_, _, R, R, R, R, R, R, R, R, _, _],
      [_, _, H, H, H, S, S, H, S, _, _, _],
      [_, H, S, H, S, S, S, H, S, S, _, _],
      [_, H, S, H, H, S, S, S, H, S, S, _],
      [_, H, H, S, S, S, S, H, H, H, _, _],
      [_, _, _, S, S, S, S, S, S, _, _, _],
      [_, _, R, R, Y, B, R, R, _, _, _, _],
      [_, R, R, R, B, B, B, R, R, R, _, _],
      [R, R, R, R, B, B, B, R, R, R, R, _],
      [S, S, R, B, S, B, S, B, R, S, S, _],
      [S, S, S, B, B, B, B, B, S, S, S, _],
      [S, S, B, B, B, B, B, B, B, S, S, _],
      [_, _, B, B, B, _, B, B, B, _, _, _],
      [_, H, H, H, _, _, _, B, B, B, _, _],
      [H, H, H, H, _, _, H, H, H, _, _, _],
    ],
    // Frame 3 - Laufen Schritt 2  
    [
      [_, _, _, R, R, R, R, R, _, _, _, _],
      [_, _, R, R, R, R, R, R, R, R, _, _],
      [_, _, H, H, H, S, S, H, S, _, _, _],
      [_, H, S, H, S, S, S, H, S, S, _, _],
      [_, H, S, H, H, S, S, S, H, S, S, _],
      [_, H, H, S, S, S, S, H, H, H, _, _],
      [_, _, _, S, S, S, S, S, S, _, _, _],
      [_, _, R, R, Y, B, R, R, _, _, _, _],
      [_, R, R, R, B, B, B, R, R, R, _, _],
      [R, R, R, R, B, B, B, R, R, R, R, _],
      [S, S, R, B, S, B, S, B, R, S, S, _],
      [S, S, S, B, B, B, B, B, S, S, S, _],
      [S, S, B, B, B, B, B, B, B, S, S, _],
      [_, B, B, B, _, _, B, B, B, _, _, _],
      [_, H, H, _, _, H, H, H, _, _, _, _],
      [H, H, H, H, _, H, H, H, H, _, _, _],
    ],
  ];

  const currentFrame = frames[frame % 3];

  return (
    <div 
      className="inline-block"
      style={{ 
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
        imageRendering: "pixelated",
      }}
    >
      <div 
        className="grid gap-0"
        style={{ 
          gridTemplateColumns: "repeat(12, 3px)",
          gridTemplateRows: "repeat(16, 3px)",
        }}
      >
        {currentFrame.flat().map((color, i) => (
          <div 
            key={i} 
            style={{ 
              width: 3, 
              height: 3, 
              backgroundColor: color,
            }} 
          />
        ))}
      </div>
    </div>
  );
}

// SVG Ground Block - klassischer Mario Block
function GroundBlock() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className="flex-shrink-0">
      {/* Hauptblock */}
      <rect x="0" y="0" width="32" height="32" fill="#c84c0c" stroke="#000" strokeWidth="2"/>
      {/* Stein Pattern */}
      <rect x="2" y="2" width="12" height="6" fill="#a03a08"/>
      <rect x="16" y="2" width="14" height="6" fill="#a03a08"/>
      <rect x="2" y="10" width="8" height="6" fill="#a03a08"/>
      <rect x="12" y="10" width="18" height="6" fill="#a03a08"/>
      <rect x="2" y="18" width="14" height="6" fill="#a03a08"/>
      <rect x="18" y="18" width="12" height="6" fill="#a03a08"/>
      <rect x="2" y="26" width="10" height="4" fill="#a03a08"/>
      <rect x="14" y="26" width="16" height="4" fill="#a03a08"/>
      {/* Highlights */}
      <rect x="0" y="0" width="32" height="2" fill="#fcbcb0"/>
    </svg>
  );
}

// Question Block mit Animation
function QuestionBlock() {
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
      className="flex-shrink-0"
    >
      <svg width="32" height="32" viewBox="0 0 32 32">
        {/* Block */}
        <rect x="0" y="0" width="32" height="32" fill="#f8b800" stroke="#000" strokeWidth="2"/>
        {/* Schrauben */}
        <circle cx="4" cy="4" r="1.5" fill="#b86e00"/>
        <circle cx="28" cy="4" r="1.5" fill="#b86e00"/>
        <circle cx="4" cy="28" r="1.5" fill="#b86e00"/>
        <circle cx="28" cy="28" r="1.5" fill="#b86e00"/>
        {/* Fragezeichen */}
        <text x="16" y="23" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#000" fontFamily="monospace">?</text>
        {/* Highlights */}
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
      <svg width="40" height="48" viewBox="0 0 40 48">
        {/* Pipe Körper */}
        <rect x="4" y="16" width="32" height="32" fill="#00a800" stroke="#000" strokeWidth="2"/>
        {/* Pipe Top (breiter) */}
        <rect x="2" y="0" width="36" height="18" fill="#00a800" stroke="#000" strokeWidth="2"/>
        {/* Highlights */}
        <rect x="2" y="0" width="36" height="3" fill="#00f800"/>
        <rect x="6" y="19" width="3" height="26" fill="#00f800" opacity="0.5"/>
      </svg>
    </div>
  );
}

// Cloud SVG
function Cloud() {
  return (
    <motion.div
      animate={{ x: [0, 30, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    >
      <svg width="64" height="32" viewBox="0 0 64 32" className="opacity-80">
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
    <svg width="48" height="24" viewBox="0 0 48 24" className="flex-shrink-0">
      <ellipse cx="12" cy="20" rx="10" ry="12" fill="#00a800" stroke="#000" strokeWidth="1"/>
      <ellipse cx="24" cy="16" rx="12" ry="14" fill="#00a800" stroke="#000" strokeWidth="1"/>
      <ellipse cx="36" cy="20" rx="10" ry="12" fill="#00a800" stroke="#000" strokeWidth="1"/>
    </svg>
  );
}

// Coin Animation
function Coin() {
  return (
    <motion.div
      animate={{ 
        y: [0, -16, -16, 0],
        scaleX: [1, 0.2, 1, 1],
      }}
      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.3, ease: "easeInOut" }}
      className="absolute"
    >
      <svg width="20" height="24" viewBox="0 0 20 24">
        <ellipse cx="10" cy="12" rx="8" ry="10" fill="#fdd835" stroke="#b8860b" strokeWidth="1"/>
        <text x="10" y="17" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#b8860b">$</text>
      </svg>
    </motion.div>
  );
}

// Goomba mit Animation
function Goomba() {
  return (
    <motion.div
      animate={{ x: [-10, 10, -10] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="28" height="24" viewBox="0 0 28 24">
        {/* Körper */}
        <path d="M2 12 Q2 2 14 2 Q26 2 26 12 L26 20 L2 20 Z" fill="#8b4513" stroke="#000" strokeWidth="1.5"/>
        {/* Augen */}
        <ellipse cx="8" cy="10" rx="3" ry="4" fill="#fff" stroke="#000" strokeWidth="1"/>
        <ellipse cx="20" cy="10" rx="3" ry="4" fill="#fff" stroke="#000" strokeWidth="1"/>
        <circle cx="8" cy="10" r="1.5" fill="#000"/>
        <circle cx="20" cy="10" r="1.5" fill="#000"/>
        {/* Augenbrauen (böser Blick) */}
        <line x1="5" y1="5" x2="11" y2="7" stroke="#000" strokeWidth="1.5"/>
        <line x1="17" y1="7" x2="23" y2="5" stroke="#000" strokeWidth="1.5"/>
        {/* Füße */}
        <path d="M4 20 L4 24 L10 24 L10 20" fill="#000"/>
        <path d="M18 20 L18 24 L24 24 L24 20" fill="#000"/>
      </svg>
    </motion.div>
  );
}

// Laufende Mario Animation Komponente
function RunningMario({ direction = "right", duration = 6 }: { direction?: "left" | "right"; duration?: number }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 3);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={{ 
        x: direction === "right" ? [0, 600] : [0, -600],
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "linear",
      }}
      style={{ 
        position: "absolute",
        bottom: 36,
        left: direction === "right" ? "5%" : "85%",
      }}
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 0.15, repeat: Infinity }}
      >
        <MarioSprite direction={direction} frame={frame} />
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

  // Generiere Ground Pattern
  const groundPattern = Array.from({ length: 30 }, (_, i) => {
    if (i % 8 === 4) return "question";
    if (i % 12 === 7) return "pipe";
    if (i % 6 === 2 && i > 0) return "bush";
    return "ground";
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="relative h-28 rounded-lg overflow-hidden border-2 border-[#1e293b] bg-[#5c94fc]" style={{ imageRendering: "pixelated" }}>
        {/* Hintergrund Himmel Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#5c94fc] to-[#5c94fc]" />
        
        {/* Wolken */}
        <div className="absolute top-1 left-[10%]">
          <Cloud />
        </div>
        <div className="absolute top-3 left-[45%]">
          <Cloud />
        </div>
        <div className="absolute top-2 right-[15%]">
          <Cloud />
        </div>

        {/* Boden */}
        <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end px-2">
          {groundPattern.map((type, i) => (
            <div key={i} className="flex-shrink-0">
              {type === "question" && <QuestionBlock />}
              {type === "pipe" && <Pipe />}
              {type === "bush" && <div className="mb-2"><Bush /></div>}
              {type === "ground" && <GroundBlock />}
            </div>
          ))}
        </div>

        {/* Laufende Marios */}
        <RunningMario direction="right" duration={10} />
        <RunningMario direction="left" duration={12} />

        {/* Coins */}
        <div className="absolute bottom-24 left-[20%]">
          <Coin />
        </div>
        <div className="absolute bottom-32 left-[40%]">
          <Coin />
        </div>
        <div className="absolute bottom-24 right-[25%]">
          <Coin />
        </div>
        <div className="absolute bottom-36 left-[60%]">
          <Coin />
        </div>

        {/* Goombas */}
        <div className="absolute bottom-10 left-[30%]">
          <Goomba />
        </div>
        <div className="absolute bottom-10 right-[35%]">
          <Goomba />
        </div>

        {/* UI Overlay - Score etc */}
        <div className="absolute top-2 left-3 font-mono text-[10px] leading-tight">
          <div className="text-white drop-shadow-[1px_1px_0_#000]">MARIO</div>
          <div className="text-[#f8b800] drop-shadow-[1px_1px_0_#000]">000425</div>
        </div>
        
        <div className="absolute top-2 right-3 font-mono text-[10px] leading-tight text-right">
          <div className="text-white drop-shadow-[1px_1px_0_#000]">WORLD</div>
          <div className="text-white drop-shadow-[1px_1px_0_#000]">1-1</div>
        </div>

        <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[10px] leading-tight text-center">
          <div className="text-white drop-shadow-[1px_1px_0_#000]">TIME</div>
          <motion.div 
            className="text-[#f8b800] drop-shadow-[1px_1px_0_#000]"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            364
          </motion.div>
        </div>

        {/* Steuerung Hinweis */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/70 drop-shadow-[1px_1px_0_#000]">
          RETRO MODE • 8-BIT
        </div>
      </div>
    </div>
  );
}
