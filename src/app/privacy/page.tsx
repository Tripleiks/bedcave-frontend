import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
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
              <Shield className="w-5 h-5 text-[#00d4ff]" />
              <span className="font-mono text-[#00d4ff]">Privacy</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 font-mono">
            Privacy Policy
          </h1>

          <div className="prose prose-invert max-w-none font-mono text-gray-300 space-y-6">
            <p>
              This Privacy Policy describes how your personal information is collected, used, and shared when you visit Bedcave.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Information We Collect</h2>
            <p>
              When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Operate and maintain the website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Improve our website and user experience</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Data Retention</h2>
            <p>
              We will retain your information for our records unless and until you ask us to delete this information.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Changes</h2>
            <p>
              We may update this privacy policy from time to time in order to reflect changes to our practices or for other operational, legal or regulatory reasons.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Contact Us</h2>
            <p>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us.
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
