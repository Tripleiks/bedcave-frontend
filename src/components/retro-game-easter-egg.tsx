"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Volume2, VolumeX } from "lucide-react";

interface RetroCharacterProps {
  isActive: boolean;
  onClose: () => void;
}

// 8-bit Plumber Character - CSS Pixel Art
function PlumberCharacter({ 
  x, 
  y, 
  isJumping, 
  direction, 
  isWalking 
}: { 
  x: number; 
  y: number; 
  isJumping: boolean; 
  direction: "left" | "right";
  isWalking: boolean;
}) {
  return (
    <motion.div
      className="absolute z-50"
      style={{ 
        left: x, 
        bottom: y,
        width: 32,
        height: 32,
      }}
      animate={{
        y: isJumping ? -80 : 0,
      }}
      transition={{
        y: { type: "spring", stiffness: 200, damping: 20 },
      }}
    >
      {/* 8-bit Plumber - CSS Grid */}
      <div 
        className="grid gap-0"
        style={{ 
          gridTemplateColumns: "repeat(8, 4px)",
          gridTemplateRows: "repeat(8, 4px)",
          transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
        }}
      >
        {/* Row 1: Hat */}
        <div className="col-span-8 h-1 bg-red-600" />
        
        {/* Row 2: Hat + Face */}
        <div className="col-span-2 h-1 bg-red-600" />
        <div className="col-span-4 h-1 bg-amber-200" />
        <div className="col-span-2 h-1 bg-red-600" />
        
        {/* Row 3: Face + Eyes */}
        <div className="col-span-1 h-1 bg-red-600" />
        <div className="col-span-2 h-1 bg-amber-200" />
        <div className="col-span-1 h-1 bg-black" />
        <div className="col-span-1 h-1 bg-amber-200" />
        <div className="col-span-1 h-1 bg-black" />
        <div className="col-span-2 h-1 bg-amber-200" />
        
        {/* Row 4: Mustache + Nose */}
        <div className="col-span-1 h-1 bg-amber-200" />
        <div className="col-span-1 h-1 bg-black" />
        <div className="col-span-4 h-1 bg-black" />
        <div className="col-span-1 h-1 bg-amber-200" />
        <div className="col-span-1 h-1 bg-black" />
        
        {/* Row 5: Overalls Top */}
        <div className="col-span-2 h-1 bg-blue-600" />
        <div className="col-span-1 h-1 bg-red-600" />
        <div className="col-span-2 h-1 bg-blue-600" />
        <div className="col-span-1 h-1 bg-red-600" />
        <div className="col-span-2 h-1 bg-blue-600" />
        
        {/* Row 6: Overalls */}
        <div className="col-span-8 h-1 bg-blue-600" />
        
        {/* Row 7: Legs */}
        <div className="col-span-2 h-1 bg-blue-600" />
        <div className="col-span-2 h-1 bg-transparent" />
        <div className="col-span-2 h-1 bg-transparent" />
        <div className="col-span-2 h-1 bg-blue-600" />
        
        {/* Row 8: Boots */}
        <div className="col-span-3 h-1 bg-amber-800" />
        <div className="col-span-2 h-1 bg-transparent" />
        <div className="col-span-3 h-1 bg-amber-800" />
      </div>

      {/* Walking Animation - Bobbing */}
      {isWalking && !isJumping && (
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// Coin - 8-bit Style
function Coin({ x, y, collected }: { x: number; y: number; collected: boolean }) {
  if (collected) return null;
  
  return (
    <motion.div
      className="absolute z-40"
      style={{ left: x, bottom: y }}
      animate={{ 
        y: [0, -10, 0],
        rotateY: [0, 180, 360],
      }}
      transition={{ 
        y: { duration: 1, repeat: Infinity },
        rotateY: { duration: 0.5, repeat: Infinity },
      }}
    >
      <div 
        className="grid gap-0"
        style={{ 
          gridTemplateColumns: "repeat(4, 4px)",
          gridTemplateRows: "repeat(4, 4px)",
        }}
      >
        <div className="col-span-4 h-1 bg-yellow-500" />
        <div className="col-span-1 h-1 bg-yellow-600" />
        <div className="col-span-2 h-1 bg-yellow-300" />
        <div className="col-span-1 h-1 bg-yellow-600" />
        <div className="col-span-1 h-1 bg-yellow-600" />
        <div className="col-span-2 h-1 bg-yellow-300" />
        <div className="col-span-1 h-1 bg-yellow-600" />
        <div className="col-span-4 h-1 bg-yellow-500" />
      </div>
    </motion.div>
  );
}

// Platform
function Platform({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <div
      className="absolute z-30 flex"
      style={{ left: x, bottom: y, width: width * 8, height: 16 }}
    >
      {Array.from({ length: width }).map((_, i) => (
        <div key={i} className="w-8 h-4 bg-green-700 border-b-2 border-green-800" />
      ))}
    </div>
  );
}

export function RetroGameEasterEgg() {
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [score, setScore] = useState(0);
  
  // Game State
  const [playerX, setPlayerX] = useState(100);
  const [playerY, setPlayerY] = useState(0);
  const [velocityY, setVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isWalking, setIsWalking] = useState(false);
  
  // Coins
  const [coins, setCoins] = useState([
    { id: 1, x: 200, y: 150, collected: false },
    { id: 2, x: 400, y: 200, collected: false },
    { id: 3, x: 600, y: 120, collected: false },
    { id: 4, x: 300, y: 300, collected: false },
    { id: 5, x: 500, y: 250, collected: false },
  ]);

  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const MOVE_SPEED = 5;
  const GROUND_Y = 0;

  // Konami Code Detection
  useEffect(() => {
    const konamiCode = [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
      "b", "a"
    ];
    let currentIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[currentIndex]) {
        currentIndex++;
        if (currentIndex === konamiCode.length) {
          setIsActive(true);
          currentIndex = 0;
        }
      } else {
        currentIndex = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Game Loop
  useEffect(() => {
    if (!isActive) return;

    const gameLoop = setInterval(() => {
      // Apply gravity
      if (playerY > GROUND_Y || velocityY > 0) {
        setVelocityY(v => v + GRAVITY);
      }

      // Update position
      setPlayerY(y => {
        const newY = y + velocityY;
        if (newY <= GROUND_Y) {
          setIsJumping(false);
          setVelocityY(0);
          return GROUND_Y;
        }
        return newY;
      });

      // Check coin collection
      setCoins(prevCoins => 
        prevCoins.map(coin => {
          if (coin.collected) return coin;
          const dx = playerX - coin.x;
          const dy = playerY - coin.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 40) {
            setScore(s => s + 100);
            if (soundEnabled) {
              // Play coin sound
              const audio = new Audio();
              audio.src = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAACAgICAgICAgICAgICAgICAgICAf39/f39/f39/f39/f39/f39/f39/f39/f39/f39/";
              audio.play().catch(() => {});
            }
            return { ...coin, collected: true };
          }
          return coin;
        })
      );
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [isActive, playerX, playerY, velocityY, soundEnabled]);

  // Keyboard Controls
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case "ArrowLeft":
          setDirection("left");
          setIsWalking(true);
          setPlayerX(x => Math.max(0, x - MOVE_SPEED));
          break;
        case "ArrowRight":
          setDirection("right");
          setIsWalking(true);
          setPlayerX(x => Math.min(window.innerWidth - 40, x + MOVE_SPEED));
          break;
        case " ":
        case "ArrowUp":
          if (!isJumping && playerY <= GROUND_Y + 1) {
            setIsJumping(true);
            setVelocityY(JUMP_FORCE);
            if (soundEnabled) {
              // Play jump sound
              const audio = new Audio();
              audio.src = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAACAgICAgICAgICAgICAgICAgICAf39/f39/f39/f39/f39/f39/f39/f39/f39/f39/";
              audio.play().catch(() => {});
            }
          }
          break;
        case "Escape":
          setIsActive(false);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setIsWalking(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isActive, isJumping, playerY, soundEnabled]);

  const resetGame = () => {
    setPlayerX(100);
    setPlayerY(0);
    setVelocityY(0);
    setScore(0);
    setCoins(coins.map(c => ({ ...c, collected: false })));
  };

  return (
    <>
      {/* Activation Hint */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
          className="fixed bottom-4 right-4 z-40 opacity-30 hover:opacity-100 transition-opacity"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e293b] border border-[#2d3748]">
            <Gamepad2 className="w-4 h-4 text-[#00d4ff]" />
            <span className="font-mono text-[10px] text-[#64748b]">↑↑↓↓←→←→BA</span>
          </div>
        </motion.div>
      )}

      {/* Game Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm"
          >
            {/* Game UI */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-lg bg-[#1e293b] border border-[#2d3748]">
                  <span className="font-mono text-yellow-400">SCORE: {score.toString().padStart(6, '0')}</span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-[#1e293b] border border-[#2d3748]">
                  <span className="font-mono text-[10px] text-[#64748b]">
                    COINS: {coins.filter(c => c.collected).length}/{coins.length}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg bg-[#1e293b] border border-[#2d3748] hover:border-[#00d4ff]/50 transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#00d4ff]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#64748b]" />
                  )}
                </button>
                <button
                  onClick={resetGame}
                  className="px-3 py-2 rounded-lg bg-[#1e293b] border border-[#2d3748] hover:border-[#00d4ff]/50 transition-colors font-mono text-xs text-[#64748b]"
                >
                  RESET
                </button>
                <button
                  onClick={() => setIsActive(false)}
                  className="px-3 py-2 rounded-lg bg-red-600/20 border border-red-600/50 hover:bg-red-600/30 transition-colors font-mono text-xs text-red-400"
                >
                  EXIT [ESC]
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <div className="px-4 py-2 rounded-lg bg-[#1e293b]/80 border border-[#2d3748]">
                <span className="font-mono text-xs text-[#64748b]">
                  ← → to move | SPACE to jump | Collect coins!
                </span>
              </div>
            </div>

            {/* Game Area */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Background Grid */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #00d4ff 1px, transparent 1px),
                    linear-gradient(to bottom, #00d4ff 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Coins */}
              {coins.map(coin => (
                <Coin 
                  key={coin.id} 
                  x={coin.x} 
                  y={coin.y} 
                  collected={coin.collected} 
                />
              ))}

              {/* Platforms */}
              <Platform x={150} y={120} width={5} />
              <Platform x={350} y={180} width={4} />
              <Platform x={550} y={100} width={3} />
              <Platform x={250} y={280} width={6} />

              {/* Player */}
              <PlumberCharacter
                x={playerX}
                y={playerY}
                isJumping={isJumping}
                direction={direction}
                isWalking={isWalking}
              />

              {/* Ground */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-700 via-green-600 to-green-700"
                style={{ height: 4 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
