"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Brain, 
  FileText, 
  ImageIcon, 
  Settings,
  LogOut,
  ArrowRight,
  TrendingUp,
  Users,
  Globe
} from "lucide-react";

const adminModules = [
  {
    title: "Dashboard",
    description: "Site analytics and metrics",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    color: "#00d4ff",
    stats: "View metrics",
  },
  {
    title: "AI Generator",
    description: "Generate posts with Claude AI",
    icon: Brain,
    href: "/admin/ai-generator",
    color: "#8338ec",
    stats: "AI-powered",
  },
  {
    title: "New Post",
    description: "Create manual blog posts",
    icon: FileText,
    href: "/admin/new-post",
    color: "#39ff14",
    stats: "Manual editor",
  },
  {
    title: "Image Library",
    description: "AI-generated cover images",
    icon: ImageIcon,
    href: "/admin/images",
    color: "#ffbe0b",
    stats: "Grok Aurora",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function AdminIndexPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#0f0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2">
                <span className="text-[#64748b]">$</span>
                <span>cd /</span>
              </Link>
              <div className="h-6 w-px bg-[#1e293b]" />
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#ffbe0b]" />
                <span className="font-mono text-[#ffbe0b]">admin</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#ff006e]/10 text-[#ff006e] font-mono text-sm hover:bg-[#ff006e]/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white font-mono mb-4">
              <span className="text-[#8338ec]">sudo</span>{" "}
              <span className="text-[#00d4ff]">admin</span>
            </h1>
            <p className="text-[#64748b] font-mono text-lg">
              // System administration panel
            </p>
          </motion.div>

          {/* Admin Modules Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {adminModules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group relative rounded-xl border border-[#1e293b] bg-[#13131f] overflow-hidden hover:border-[color:var(--module-color)]/50 transition-all duration-300"
                style={{ "--module-color": module.color } as React.CSSProperties}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--module-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${module.color}15` }}
                    >
                      <module.icon className="w-6 h-6" style={{ color: module.color }} />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e293b] font-mono text-xs text-[#64748b]">
                      <span>{module.stats}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white font-mono mb-2 group-hover:text-[color:var(--module-color)] transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-[#64748b] font-mono text-sm mb-4">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-[#64748b] group-hover:text-[color:var(--module-color)] transition-colors font-mono text-sm">
                    <span>Access module</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-[#1e293b] bg-[#13131f] text-center">
              <TrendingUp className="w-5 h-5 text-[#39ff14] mx-auto mb-2" />
              <p className="text-[#64748b] font-mono text-xs">Analytics</p>
              <p className="text-white font-mono text-sm font-bold">Vercel</p>
            </div>
            <div className="p-4 rounded-lg border border-[#1e293b] bg-[#13131f] text-center">
              <Users className="w-5 h-5 text-[#00d4ff] mx-auto mb-2" />
              <p className="text-[#64748b] font-mono text-xs">Auth</p>
              <p className="text-white font-mono text-sm font-bold">2FA Active</p>
            </div>
            <div className="p-4 rounded-lg border border-[#1e293b] bg-[#13131f] text-center">
              <Globe className="w-5 h-5 text-[#ffbe0b] mx-auto mb-2" />
              <p className="text-[#64748b] font-mono text-xs">Status</p>
              <p className="text-white font-mono text-sm font-bold">Online</p>
            </div>
            <div className="p-4 rounded-lg border border-[#1e293b] bg-[#13131f] text-center">
              <Brain className="w-5 h-5 text-[#8338ec] mx-auto mb-2" />
              <p className="text-[#64748b] font-mono text-xs">AI Ready</p>
              <p className="text-white font-mono text-sm font-bold">Claude</p>
            </div>
          </motion.div>

          {/* Terminal Info */}
          <motion.div variants={itemVariants} className="mt-8 p-4 rounded-lg border border-[#1e293b] bg-[#0f0f1a]">
            <div className="flex items-center gap-2 text-[#64748b] font-mono text-sm">
              <span className="text-[#39ff14]">✓</span>
              <span>Admin session active</span>
              <span className="text-[#1e293b]">•</span>
              <span className="text-[#1e293b]">{new Date().toLocaleString()}</span>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
