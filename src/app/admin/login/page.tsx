"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Lock, Terminal, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const success = login(password);
      if (!success) {
        setError("Invalid password. Access denied.");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Terminal Window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden"
        >
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff006e]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbe0b]" />
                <div className="w-3 h-3 rounded-full bg-[#39ff14]" />
              </div>
              <span className="ml-4 font-mono text-xs text-[#64748b]">admin/login.sh</span>
            </div>
            <Link 
              href="/" 
              className="font-mono text-xs text-[#64748b] hover:text-[#00d4ff] transition-colors"
            >
              exit
            </Link>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff006e]/10 border border-[#ff006e]/30 mb-4">
                <Lock className="w-8 h-8 text-[#ff006e]" />
              </div>
              <h1 className="text-2xl font-bold text-white font-mono mb-2">
                Admin Access
              </h1>
              <p className="text-[#64748b] font-mono text-sm">
                Authentication required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full px-4 py-3 pr-12 rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] focus:border-[#00d4ff] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded bg-[#ff006e]/10 border border-[#ff006e]/30"
                >
                  <p className="text-[#ff006e] font-mono text-sm text-center">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded bg-[#00d4ff] text-[#0a0a0f] font-mono font-bold hover:bg-[#00d4ff]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-pulse">Authenticating...</span>
                ) : (
                  "LOGIN"
                )}
              </button>
            </form>

            {/* Hint */}
            <p className="text-center mt-6 text-[#64748b] font-mono text-xs">
              Default: "bedcave2026" (set via NEXT_PUBLIC_ADMIN_PASSWORD)
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
