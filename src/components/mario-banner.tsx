"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// 8-bit Mario Runner - CSS Pixel Art
function MarioRunner({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <motion.div
      animate={{ 
        y: [0, -4, 0],
        x: direction === "right" ? [0, 2, 0] : [0, -2, 0]
      }}
      transition={{ duration: 0.3, repeat: Infinity }}
      className="relative"
      style={{ 
        width: 16, 
        height: 16,
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)"
      }}
    >
      {/* 8-bit Mario - 16x16 */}
      <div className="grid grid-cols-4 gap-0 w-4 h-4 scale-[4] origin-top-left">
        {/* Row 1 */}
        <div className="col-span-1 bg-red-600" />
        <div className="col-span-2 bg-red-600" />
        <div className="col-span-1 bg-red-600" />
        {/* Row 2 */}
        <div className="col-span-1 bg-red-600" />
        <div className="col-span-2 bg-amber-200" />
        <div className="col-span-1 bg-red-600" />
        {/* Row 3 */}
        <div className="col-span-1 bg-amber-200" />
        <div className="col-span-1 bg-black" />
        <div className="col-span-1 bg-amber-200" />
        <div className="col-span-1 bg-black" />
        {/* Row 4 */}
        <div className="col-span-4 bg-blue-600" />
      </div>
    </motion.div>
  );
}

// Ground Block
function GroundBlock() {
  return (
    <div className="w-6 h-6 relative">
      <div className="absolute inset-0 bg-[#c84c0c] border-2 border-[#000]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#fcbcb0]" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#000] opacity-30" />
    </div>
  );
}

// Question Block
function QuestionBlock() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1 }}
      className="w-6 h-6 relative"
    >
      <div className="absolute inset-0 bg-[#f8b800] border-2 border-[#000]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#fceea8]" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#b86e00]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[#000] font-bold text-xs">?</span>
      </div>
    </motion.div>
  );
}

// Pipe
function Pipe() {
  return (
    <div className="w-8 h-12 relative">
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#00a800] border-2 border-[#000]" />
      <div className="absolute top-0 left-[-2px] right-[-2px] h-4 bg-[#00a800] border-2 border-[#000]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#00f800]" />
    </div>
  );
}

// Cloud
function Cloud() {
  return (
    <motion.div
      animate={{ x: [0, 20, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="absolute opacity-60"
    >
      <div className="flex items-end">
        <div className="w-4 h-4 bg-white" />
        <div className="w-6 h-6 bg-white" />
        <div className="w-4 h-4 bg-white" />
      </div>
    </motion.div>
  );
}

// Bush
function Bush() {
  return (
    <div className="flex items-end">
      <div className="w-4 h-4 bg-[#00a800] rounded-t-full" />
      <div className="w-6 h-6 bg-[#00a800] rounded-t-full" />
      <div className="w-4 h-4 bg-[#00a800] rounded-t-full" />
    </div>
  );
}

// Coin
function Coin() {
  return (
    <motion.div
      animate={{ 
        y: [0, -20, -20, 0],
        rotateY: [0, 180, 360]
      }}
      transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
      className="w-4 h-4 bg-[#f8b800] rounded-full border border-[#b86e00] flex items-center justify-center"
    >
      <span className="text-[8px] font-bold text-[#b86e00]">$</span>
    </motion.div>
  );
}

// Goomba
function Goomba() {
  return (
    <motion.div
      animate={{ x: [-20, 20, -20] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="w-6 h-4 relative"
    >
      <div className="absolute inset-0 bg-[#8b4513] rounded-t-full" />
      <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" />
      <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full" />
      <div className="absolute bottom-0 left-0 w-2 h-1 bg-[#000]" />
      <div className="absolute bottom-0 right-0 w-2 h-1 bg-[#000]" />
    </motion.div>
  );
}

export function MarioBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-24 bg-gradient-to-b from-[#5c94fc] to-[#5c94fc] overflow-hidden border-y-4 border-[#000]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)
          `
        }} />
      </div>

      {/* Clouds */}
      <div className="absolute top-2 left-[10%]">
        <Cloud />
      </div>
      <div className="absolute top-4 left-[60%]">
        <Cloud />
      </div>
      <div className="absolute top-1 left-[85%]">
        <Cloud />
      </div>

      {/* Ground Line Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="flex-shrink-0">
            {i % 7 === 3 ? <QuestionBlock /> : 
             i % 11 === 5 ? <Pipe /> :
             i % 5 === 0 && i > 0 ? (
               <div className="mb-1"><Bush /></div>
             ) : <GroundBlock />}
          </div>
        ))}
      </div>

      {/* Animated Elements */}
      <div className="absolute bottom-8 left-[5%]">
        <motion.div
          animate={{ x: [0, 800] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <MarioRunner direction="right" />
        </motion.div>
      </div>

      {/* Second Mario from opposite direction */}
      <div className="absolute bottom-8 right-[5%]">
        <motion.div
          animate={{ x: [0, -800] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 4 }}
        >
          <MarioRunner direction="left" />
        </motion.div>
      </div>

      {/* Coins */}
      <div className="absolute bottom-20 left-[25%]">
        <Coin />
      </div>
      <div className="absolute bottom-28 left-[45%]">
        <Coin />
      </div>
      <div className="absolute bottom-20 left-[70%]">
        <Coin />
      </div>

      {/* Goomba */}
      <div className="absolute bottom-8 left-[35%]">
        <Goomba />
      </div>
      <div className="absolute bottom-8 left-[55%]">
        <Goomba />
      </div>

      {/* Score Display */}
      <div className="absolute top-2 left-4 font-mono text-xs text-white drop-shadow-md">
        <div>MARIO</div>
        <div className="text-[#f8b800]">000125</div>
      </div>
      <div className="absolute top-2 right-4 font-mono text-xs text-white drop-shadow-md text-right">
        <div>WORLD</div>
        <div>1-1</div>
        <div className="text-[#f8b800]">TIME</div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          368
        </motion.div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/60">
        ↑ JUMP • ← → RUN • B DASH
      </div>
    </div>
  );
}
