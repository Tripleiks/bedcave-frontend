import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
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

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 font-mono">
            Legal Notice / Imprint
          </h1>

          <div className="prose prose-invert max-w-none font-mono text-gray-300 space-y-6">
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Information pursuant to § 5 TMG</h2>
            <p>
              Bedcave<br />
              [Your Name]<br />
              [Your Street Address]<br />
              [Your City, Postal Code]<br />
              Germany
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Contact</h2>
            <p>
              Email: contact@bedcave.com<br />
              Website: https://bedcave.com
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Disclaimer</h2>
            <h3 className="text-xl font-bold text-white mt-6 mb-3">Liability for Content</h3>
            <p>
              As a service provider, we are responsible for our own content on these pages in accordance with § 7 para.1 TMG (German Telemedia Act) and general laws. However, according to §§ 8 to 10 TMG, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
            </p>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">Liability for Links</h3>
            <p>
              Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages.
            </p>

            <h3 className="text-xl font-bold text-white mt-6 mb-3">Copyright</h3>
            <p>
              The content and works created by the site operators on these pages are subject to German copyright law. The duplication, processing, distribution, and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.
            </p>

            <p className="text-sm text-[#64748b] mt-12">
              Last updated: March 2026
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
