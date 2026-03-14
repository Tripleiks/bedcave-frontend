'use client';

import { MDXProvider } from '@mdx-js/react';
import { ReactNode } from 'react';

// Custom components for MDX rendering
const components = {
  h1: (props: any) => <h1 className="text-3xl font-bold text-white mb-6 font-mono" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-mono" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-bold text-white mt-6 mb-3 font-mono" {...props} />,
  p: (props: any) => <p className="text-gray-300 mb-4 leading-relaxed font-mono" {...props} />,
  a: (props: any) => <a className="text-[#00d4ff] hover:underline font-mono" {...props} />,
  code: (props: any) => (
    <code className="bg-[#1e293b] text-[#39ff14] px-2 py-1 rounded text-sm font-mono" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-[#0f0f1a] border border-[#1e293b] rounded-lg p-4 overflow-x-auto mb-4 font-mono text-sm" {...props} />
  ),
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
