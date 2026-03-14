'use client';

import { MDXProvider } from '@mdx-js/react';
import { ReactNode, useState } from 'react';
import { Copy, Check } from 'lucide-react';

// CodeBlock component with copy functionality
function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const codeText = typeof children === 'string' 
      ? children 
      : children?.props?.children || '';
    
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Extract language from className (e.g., "language-bash" -> "bash")
  const language = className?.replace('language-', '') || 'text';

  return (
    <div className="relative group">
      {/* Language badge and copy button */}
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

// Inline code component
function InlineCode({ children, ...props }: any) {
  return (
    <code 
      className="bg-[#1e293b] text-[#39ff14] px-2 py-1 rounded text-sm font-mono" 
      {...props}
    >
      {children}
    </code>
  );
}

// Custom components for MDX rendering
const components = {
  h1: (props: any) => <h1 className="text-3xl font-bold text-white mb-6 font-mono" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-mono" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-bold text-white mt-6 mb-3 font-mono" {...props} />,
  p: (props: any) => <p className="text-gray-300 mb-4 leading-relaxed font-mono" {...props} />,
  a: (props: any) => <a className="text-[#00d4ff] hover:underline font-mono" {...props} />,
  code: CodeBlock,
  inlineCode: InlineCode,
  pre: (props: any) => <div {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside text-gray-300 mb-4 font-mono ml-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside text-gray-300 mb-4 font-mono ml-4" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-[#00d4ff] pl-4 italic text-gray-400 mb-4 font-mono" {...props} />
  ),
  img: (props: any) => (
    <img className="rounded-lg border border-[#1e293b] my-4 max-w-full h-auto" {...props} />
  ),
  hr: () => <hr className="border-[#1e293b] my-8" />,
};

interface MDXComponentsProps {
  children: ReactNode;
}

export function MDXComponents({ children }: MDXComponentsProps) {
  return (
    <MDXProvider components={components}>
      {children}
    </MDXProvider>
  );
}
