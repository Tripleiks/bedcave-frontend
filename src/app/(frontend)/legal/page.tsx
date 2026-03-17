import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { getPayload } from "payload";
import config from "@payload-config";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function LegalPage() {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "legal", overrideAccess: true });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#1e293b] bg-[#0f0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              $ cd /home
            </Link>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#ffbe0b]" />
              <span className="font-mono text-[#ffbe0b]">Legal</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 font-mono">
            {doc.title}
          </h1>

          <div className="prose prose-invert max-w-none font-mono text-gray-300 space-y-4">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-6 font-mono">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-mono">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-6 mb-3 font-mono">{children}</h3>,
                p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed font-mono">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside ml-4 space-y-2 mb-4 font-mono text-gray-300">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside ml-4 space-y-2 mb-4 font-mono text-gray-300">{children}</ol>,
                li: ({ children }) => <li className="font-mono text-gray-300">{children}</li>,
                a: ({ href, children }) => <a href={href} className="text-[#00d4ff] hover:underline">{children}</a>,
              }}
            >
              {doc.content}
            </Markdown>
          </div>

          {doc.lastUpdated && (
            <p className="text-sm text-[#64748b] mt-12 font-mono">
              Last updated: {doc.lastUpdated}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
