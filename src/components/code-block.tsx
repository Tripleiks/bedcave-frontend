'use client';

import { useState, ReactNode, isValidElement } from 'react';
import { Copy, Check } from 'lucide-react';

// Utility: Recursively extract text from React children
function extractText(children: ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (typeof children === 'number') {
    return String(children);
  }
  
  if (Array.isArray(children)) {
    return children.map(extractText).join('');
  }
  
  if (isValidElement(children) && children.props) {
    const props = children.props as { children?: ReactNode };
    return extractText(props.children);
  }
  
  return '';
}

export function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Extract all text content recursively
    const codeText = extractText(children);
    
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const language = className?.replace('language-', '') || 'text';

  return (
    <div className="relative group">
      <div className="absolute top-0 right-0 flex items-center gap-2 px-3 py-2">
        <span className="text-xs text-[#64748b] font-mono uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded transition-all ${
            copied 
              ? 'bg-[#39ff14]/20 text-[#39ff14]' 
              : 'bg-[#1e293b] text-[#64748b] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10'
          }`}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre
        className="bg-[#0f0f1a] border border-[#1e293b] rounded-lg p-4 pt-10 overflow-x-auto mb-4 font-mono text-sm"
        {...props}
      >
        <code className={className || 'text-[#94a3b8]'}>{children}</code>
      </pre>
    </div>
  );
}
