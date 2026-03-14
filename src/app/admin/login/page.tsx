"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const { loginStep, login, verifyPin } = useAuth();
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
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

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const success = verifyPin(pin);
      if (!success) {
        setError("Invalid PIN. Access denied.");
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
              <span className="ml-4 font-mono text-xs text-[#64748b]">
                {loginStep === 1 ? "admin/login.sh" : "admin/2fa.sh"}
              </span>
            </div>
            <Link 
              href="/" 
              className="font-mono text-xs text-[#64748b] hover:text-[#00d4ff] transition-colors"
            >
              exit
            </Link>
          </div>

          <div className="p-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
                loginStep === 1 ? "bg-[#00d4ff] text-[#0a0a0f]" : "bg-[#00d4ff]/20 text-[#00d4ff]"
              }`}>
                1
              </div>
              <div className="w-8 h-px bg-[#1e293b]" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
                loginStep === 2 ? "bg-[#00d4ff] text-[#0a0a0f]" : "bg-[#1e293b] text-[#64748b]"
              }`}>
                2
              </div>
            </div>

            {loginStep === 1 ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff006e]/10 border border-[#ff006e]/30 mb-4">
                    <Lock className="w-8 h-8 text-[#ff006e]" />
                  </div>
                  <h1 className="text-2xl font-bold text-white font-mono mb-2">
                    Admin Access
                  </h1>
                  <p className="text-[#64748b] font-mono text-sm">
                    Step 1: Enter password
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* Password Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
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
                      <span className="animate-pulse">Verifying...</span>
                    ) : (
                      "CONTINUE"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ffbe0b]/10 border border-[#ffbe0b]/30 mb-4">
                    <KeyRound className="w-8 h-8 text-[#ffbe0b]" />
                  </div>
                  <h1 className="text-2xl font-bold text-white font-mono mb-2">
                    Two-Factor Auth
                  </h1>
                  <p className="text-[#64748b] font-mono text-sm">
                    Step 2: Enter PIN
                  </p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-6">
                  {/* PIN Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-mono text-[#00d4ff] mb-2">
                      <span>PIN (6 digits)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? "text" : "password"}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 pr-12 text-center text-2xl tracking-[0.5em] rounded bg-[#0a0a0f] border border-[#1e293b] text-white font-mono placeholder:text-[#64748b] placeholder:tracking-normal focus:border-[#ffbe0b] focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#ffbe0b] transition-colors"
                      >
                        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    disabled={isLoading || pin.length !== 6}
                    className="w-full py-3 rounded bg-[#ffbe0b] text-[#0a0a0f] font-mono font-bold hover:bg-[#ffbe0b]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Verifying...</span>
                    ) : (
                      "LOGIN"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
