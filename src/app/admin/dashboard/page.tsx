"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  FileText, 
  ImageIcon, 
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
  RefreshCw,
  Brain,
  Globe,
  MousePointerClick
} from "lucide-react";

interface DashboardStats {
  newsletterCount: number;
  totalPosts: number;
  totalImages: number;
  aiGeneratedPosts: number;
  lastUpdated: string;
}

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
}

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

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend,
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  trend?: string;
  subtitle?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-[#00d4ff]/20 to-[#00d4ff]/5 border-[#00d4ff]/30",
    green: "from-[#39ff14]/20 to-[#39ff14]/5 border-[#39ff14]/30",
    yellow: "from-[#ffbe0b]/20 to-[#ffbe0b]/5 border-[#ffbe0b]/30",
    purple: "from-[#8338ec]/20 to-[#8338ec]/5 border-[#8338ec]/30",
    pink: "from-[#ff006e]/20 to-[#ff006e]/5 border-[#ff006e]/30",
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-xl border bg-gradient-to-br ${colorClasses[color]} p-6 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#64748b] font-mono text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white font-mono">{value}</h3>
          {subtitle && (
            <p className="text-[#64748b] font-mono text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-[${color === 'blue' ? '#00d4ff' : color === 'green' ? '#39ff14' : color === 'yellow' ? '#ffbe0b' : color === 'purple' ? '#8338ec' : '#ff006e'}]/10`}>
          <Icon className={`w-5 h-5 text-[${color === 'blue' ? '#00d4ff' : color === 'green' ? '#39ff14' : color === 'yellow' ? '#ffbe0b' : color === 'purple' ? '#8338ec' : '#ff006e'}]`} style={{ color: color === 'blue' ? '#00d4ff' : color === 'green' ? '#39ff14' : color === 'yellow' ? '#ffbe0b' : color === 'purple' ? '#8338ec' : '#ff006e' }} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#39ff14]" />
          <span className="text-[#39ff14] font-mono text-xs">{trend}</span>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string; 
  value: string; 
  icon: any;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-[#13131f] border border-[#1e293b]">
      <div className="p-2 rounded bg-[#00d4ff]/10">
        <Icon className="w-4 h-4 text-[#00d4ff]" />
      </div>
      <div>
        <p className="text-[#64748b] font-mono text-xs">{label}</p>
        <p className="text-white font-mono text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-[#00d4ff]">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#0f0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin" 
                className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                $ cd /admin/dashboard
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#1e293b] text-[#64748b] hover:text-[#00d4ff] font-mono text-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Title */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-white font-mono mb-2">
              <span className="text-[#8338ec]">const</span>{" "}
              <span className="text-[#00d4ff]">dashboard</span>
              <span className="text-white"> = </span>
              <span className="text-[#39ff14]">new</span>{" "}
              <span className="text-[#ffbe0b]">Analytics</span>();
            </h1>
            <p className="text-[#64748b] font-mono text-sm">
              // Site metrics and performance overview • Updated {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : '...'}
            </p>
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Newsletter Subscribers"
              value={stats?.newsletterCount || 0}
              icon={Mail}
              color="blue"
              subtitle="Active subscribers"
            />
            <KPICard
              title="Total Blog Posts"
              value={stats?.totalPosts || 0}
              icon={FileText}
              color="green"
              subtitle="Published articles"
            />
            <KPICard
              title="AI Generated Posts"
              value={stats?.aiGeneratedPosts || 0}
              icon={Brain}
              color="purple"
              subtitle="Claude AI generated"
            />
            <KPICard
              title="AI Images Library"
              value={stats?.totalImages || 0}
              icon={ImageIcon}
              color="yellow"
              subtitle="Grok Aurora generated"
            />
          </motion.div>

          {/* Analytics Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vercel Analytics Note */}
            <div className="lg:col-span-2 rounded-xl border border-[#1e293b] bg-[#13131f]/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff006e]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbe0b]" />
                  <div className="w-3 h-3 rounded-full bg-[#39ff14]" />
                </div>
                <span className="ml-4 font-mono text-xs text-[#64748b]">user@bedcave:~$ vercel analytics --overview</span>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Globe className="w-8 h-8 text-[#00d4ff]" />
                  <div>
                    <h3 className="text-xl font-bold text-white font-mono">Vercel Web Analytics</h3>
                    <p className="text-[#64748b] font-mono text-sm">Privacy-friendly, real-time metrics</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Page Views" value="View in Vercel" icon={MousePointerClick} />
                  <StatCard label="Unique Visitors" value="View in Vercel" icon={Users} />
                  <StatCard label="Bounce Rate" value="View in Vercel" icon={TrendingUp} />
                  <StatCard label="Avg. Duration" value="View in Vercel" icon={Clock} />
                </div>

                <div className="p-4 rounded-lg bg-[#00d4ff]/5 border border-[#00d4ff]/20">
                  <p className="text-[#64748b] font-mono text-sm">
                    <span className="text-[#00d4ff]">ℹ</span> Detailed analytics available in{" "}
                    <a 
                      href="https://vercel.com/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#00d4ff] hover:underline"
                    >
                      Vercel Dashboard →
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-[#1e293b] bg-[#13131f]/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
                <span className="font-mono text-xs text-[#64748b]">$ ls quick-actions/</span>
              </div>
              
              <div className="p-4 space-y-2">
                <Link
                  href="/admin/ai-generator"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 hover:bg-[#1e293b] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4 text-[#8338ec]" />
                    <span className="font-mono text-sm text-white">AI Generator</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#00d4ff] transition-colors" />
                </Link>
                
                <Link
                  href="/admin/new-post"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 hover:bg-[#1e293b] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#39ff14]" />
                    <span className="font-mono text-sm text-white">New Post</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#00d4ff] transition-colors" />
                </Link>
                
                <Link
                  href="/admin/images"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 hover:bg-[#1e293b] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-4 h-4 text-[#ffbe0b]" />
                    <span className="font-mono text-sm text-white">Image Library</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#00d4ff] transition-colors" />
                </Link>

                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 hover:bg-[#1e293b] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#00d4ff]" />
                    <span className="font-mono text-sm text-white">Vercel Dashboard</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#00d4ff] transition-colors" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="rounded-xl border border-[#1e293b] bg-[#13131f]/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b] bg-[#0f0f1a]">
              <span className="font-mono text-xs text-[#64748b]">$ tail -f /var/log/activity.log</span>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-center gap-3 text-[#64748b]">
                  <span className="text-[#39ff14]">✓</span>
                  <span>Dashboard initialized</span>
                  <span className="text-[#1e293b]">•</span>
                  <span className="text-[#1e293b]">Just now</span>
                </div>
                <div className="flex items-center gap-3 text-[#64748b]">
                  <span className="text-[#00d4ff]">ℹ</span>
                  <span>Vercel Analytics active</span>
                  <span className="text-[#1e293b]">•</span>
                  <span className="text-[#1e293b]">Tracking page views</span>
                </div>
                <div className="flex items-center gap-3 text-[#64748b]">
                  <span className="text-[#ffbe0b]">⚡</span>
                  <span>Newsletter system ready</span>
                  <span className="text-[#1e293b]">•</span>
                  <span className="text-[#1e293b]">{stats?.newsletterCount || 0} subscribers</span>
                </div>
                <div className="flex items-center gap-3 text-[#64748b]">
                  <span className="text-[#8338ec]">🤖</span>
                  <span>AI Generator operational</span>
                  <span className="text-[#1e293b]">•</span>
                  <span className="text-[#1e293b]">{stats?.aiGeneratedPosts || 0} posts generated</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
