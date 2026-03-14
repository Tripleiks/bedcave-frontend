"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Post } from '@/lib/mdx/posts';
import { ArrowUpRight } from "lucide-react";

interface ArticleCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

// Terminal color scheme for categories
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'News': { bg: 'bg-[#00d4ff]/10', text: 'text-[#00d4ff]', border: 'border-[#00d4ff]/30' },
  'Hardware': { bg: 'bg-[#39ff14]/10', text: 'text-[#39ff14]', border: 'border-[#39ff14]/30' },
  'Docker': { bg: 'bg-[#ff006e]/10', text: 'text-[#ff006e]', border: 'border-[#ff006e]/30' },
  'Homeserver': { bg: 'bg-[#ffbe0b]/10', text: 'text-[#ffbe0b]', border: 'border-[#ffbe0b]/30' },
};

// 3D Tilt Wrapper Component
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Terminal Window Header Component
function TerminalHeader({ 
  filename, 
  category,
  variant = 'default'
}: { 
  filename: string; 
  category?: string;
  variant?: 'default' | 'featured' | 'compact';
}) {
  const colorScheme = category && categoryColors[category] 
    ? categoryColors[category] 
    : { bg: 'bg-[#00d4ff]/10', text: 'text-[#00d4ff]', border: 'border-[#00d4ff]/30' };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 bg-[#0f0f1a] border-b border-[#1e293b] ${
      variant === 'featured' ? 'px-5 py-4' : ''
    }`}>
      {/* Window Controls */}
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-[#ff006e]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbe0b]" />
        <div className="w-3 h-3 rounded-full bg-[#39ff14]" />
      </div>
      
      {/* Filename Tab */}
      <div className={`flex-1 flex items-center justify-center gap-2 mx-4 ${colorScheme.bg} ${colorScheme.border} border rounded px-3 py-1`}>
        <span className={`font-mono text-xs ${colorScheme.text}`}>
          {variant === 'featured' ? '~/articles/' : ''}{filename}
        </span>
      </div>
      
      {/* Category Badge */}
      {category && (
        <span className={`font-mono text-[10px] px-2 py-1 rounded ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border}`}>
          [{category.toUpperCase()}]
        </span>
      )}
    </div>
  );
}

export function ArticleCard({ post, variant = 'default', className = '' }: ArticleCardProps) {
  const imageUrl = post.coverImage;
  const altText = post.title;
  
  // Create filename from slug
  const filename = `${post.slug.slice(0, 20)}${post.slug.length > 20 ? '...' : ''}.md`;
  const mainCategory = post.category || 'Article';
  const author = post.author;
  
  // Format date as comment
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');

  if (variant === 'featured') {
    return (
      <TiltCard className={className}>
        <article className="group relative overflow-hidden rounded-lg bg-[#13131f] border border-[#1e293b] hover:border-[#00d4ff]/50 transition-all duration-500">
          <TerminalHeader 
            filename={filename} 
            category={mainCategory}
            variant="featured"
          />
          
          <Link href={`/post/${post.slug}`} className="block">
            {/* Content Area */}
            <div className="relative">
              {/* Image with aspect ratio */}
              <div className="aspect-[16/9] relative overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={altText}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e1e3f] to-[#13131f] flex items-center justify-center">
                    <span className="font-mono text-4xl font-bold text-[#00d4ff]/20">NO_IMG</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#13131f] via-transparent to-transparent" />
              </div>
              
              {/* Text Content Overlay */}
              <div className="p-5 pt-2">
                {/* Title as code */}
                <h2 className="font-mono text-xl font-bold text-white mb-3 group-hover:text-[#00d4ff] transition-colors line-clamp-2">
                  <span className="text-[#8338ec]">const</span>{" "}
                  <span className="text-[#ffbe0b]">title</span>{" "}={" "}
                  <span className="text-[#39ff14]">&quot;</span>
                  <span dangerouslySetInnerHTML={{ __html: post.title }} />
                  <span className="text-[#39ff14]">&quot;</span>;
                </h2>
                
                {/* Excerpt as comment */}
                <p className="text-[#64748b] line-clamp-2 mb-4 font-mono text-sm">
                  <span className="text-[#64748b]">// </span>
                  <span dangerouslySetInnerHTML={{ __html: post.excerpt.slice(0, 100) }} />
                </p>
                
                {/* Footer info */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    {author && (
                      <span className="text-[#00d4ff]">
                        @<span className="text-white">{author.toLowerCase().replace(/\s+/g, '_')}</span>
                      </span>
                    )}
                    <span className="text-[#64748b]">// {formattedDate}</span>
                  </div>
                  
                  <motion.div 
                    className="flex items-center gap-1 text-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ x: 2 }}
                  >
                    <span>OPEN</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </motion.div>
                </div>
              </div>
            </div>
          </Link>
        </article>
      </TiltCard>
    );
  }

  if (variant === 'compact') {
    const colorScheme = categoryColors[mainCategory] || categoryColors['News'];
    
    return (
      <motion.article 
        whileHover={{ scale: 1.02, x: 4 }}
        className={`group relative overflow-hidden rounded-lg bg-[#13131f] border border-[#1e293b] hover:border-[#00d4ff]/30 transition-all duration-300 ${className}`}
      >
        {/* Mini Terminal Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0f0f1a] border-b border-[#1e293b]">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff006e]" />
            <div className="w-2 h-2 rounded-full bg-[#ffbe0b]" />
            <div className="w-2 h-2 rounded-full bg-[#39ff14]" />
          </div>
          <div className={`flex-1 text-center ${colorScheme.bg} ${colorScheme.border} border rounded px-2 py-0.5`}>
            <span className={`font-mono text-[10px] ${colorScheme.text}`}>{filename.slice(0, 15)}...</span>
          </div>
        </div>
        
        <Link href={`/post/${post.slug}`} className="block p-3">
          <div className="flex gap-3">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 relative bg-[#1e293b]">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={altText}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-mono text-xs text-[#64748b]">IMG</span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-mono text-sm font-semibold text-white group-hover:text-[#00d4ff] transition-colors line-clamp-2 mb-1">
                <span dangerouslySetInnerHTML={{ __html: post.title }} />
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-[#64748b] font-mono">
                <span className={colorScheme.text}>[{mainCategory.toUpperCase()}]</span>
                <span>// {formattedDate}</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Default variant
  return (
    <TiltCard className={className}>
      <article className="group relative overflow-hidden rounded-lg bg-[#13131f] border border-[#1e293b] hover:border-[#00d4ff]/50 transition-all duration-500">
        <TerminalHeader filename={filename} category={mainCategory} />
        
        <Link href={`/post/${post.slug}`} className="block">
          {/* Image Area */}
          <div className="aspect-[16/10] relative overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={altText}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1e1e3f] to-[#13131f] flex items-center justify-center">
                <span className="font-mono text-3xl font-bold text-[#00d4ff]/20">IMG_NULL</span>
              </div>
            )}
            
            {/* Scanline effect on hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,212,255,0.03)_50%)] bg-[length:100%_4px]" />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            {/* Title as code variable */}
            <h3 className="font-mono text-base font-bold text-white group-hover:text-[#00d4ff] transition-colors line-clamp-2 mb-3">
              <span className="text-[#8338ec]">var</span>{" "}
              <span className="text-[#ffbe0b]">article</span>{" "}={" "}
              <span className="text-[#39ff14]">&quot;</span>
              <span dangerouslySetInnerHTML={{ __html: post.title }} />
              <span className="text-[#39ff14]">&quot;</span>;
            </h3>
            
            {/* Footer */}
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                {author && (
                  <span className="text-[#64748b]">
                    @<span className="text-[#00d4ff]">{author.toLowerCase().replace(/\s+/g, '_')}</span>
                  </span>
                )}
              </div>
              <span className="text-[#64748b]">// {formattedDate}</span>
            </div>
          </div>
        </Link>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_20px_rgba(0,212,255,0.1)]" />
      </article>
    </TiltCard>
  );
}
