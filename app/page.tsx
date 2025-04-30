import HeroSection from "../components/hero-section";
import Footer from "../components/footer";
import { Button } from "../components/ui/button";
import {
  ArrowRight,
  Flame,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ToolsSlider from "@/components/tools-slider";
import { tools } from "@/lib/config/tools";

// Define specific order for the home page tools
const homePageToolIds = [
  "private-ai-chat",
  "steganography-tool",
  "video-transcoder",
  "ai-data-visualization",
  "heic-converter",
  "code-editor",
  "color-picker",
  "qr-code-generator",
  "unit-converter",
  "todo-list",
  "font-generator",
  "gif-to-frames",
  "pdf-tools",
  "zip-compressor",
];

// Order tools based on the defined order and ensure non-null with proper TypeScript typing
const orderedTools = homePageToolIds
  .map(id => tools.find(tool => tool.id === id))
  .filter((tool): tool is typeof tools[0] => !!tool);

export const metadata = {
  title: "FreeTool Online - Free Browser-Based Tools for Everyday Tasks",
  description:
    "A collection of free, browser-based tools to help you convert, transform, and optimize your files without installing any software. All processing happens locally for complete privacy.",
};

export default function Home() {
  // Function to scroll to tools section
  const scrollToTools = () => {
    const toolsSection = document.getElementById("tools");
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Function to scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <HeroSection
        title="Free Online Tools for"
        titleHighlight="Everyday Tasks"
        description="A collection of free, browser-based tools to help you convert, transform, and optimize your files without installing any software."
        badge="100% Free Tools"
        primaryButtonText="Explore Tools"
        secondaryButtonText="View Features"
        primaryButtonHref="#tools"
        secondaryButtonHref="#features"
      />

      {/* Tools Section */}
      <section id="tools" className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">
              Our Free Online Tools
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful, browser-based tools that work directly in your browser.
              No downloads, no installations, just results.
            </p>
          </div>

          <ToolsSlider>
            {orderedTools.map((tool, index) => (
              <div
                key={tool.id}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
                  "transition-all hover:shadow-md flex-shrink-0 snap-start",
                  "w-[300px] flex flex-col relative",
                )}
              >
                {/* Hot Badge */}
                {tool.isHot && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                    <Flame className="h-3 w-3 mr-1" />
                    HOT
                  </div>
                )}
                {/* New Badge */}
                {tool.isNew && (
                  <div className="absolute top-2 right-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    NEW
                  </div>
                )}
                <div className={`h-40 flex items-center justify-center bg-gradient-to-r ${tool.color} dark:from-blue-900/20 dark:to-indigo-900/20`}>
                  {tool.icon}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-2 dark:text-white">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link
                        href={tool.href}
                        className="flex items-center justify-center gap-2"
                        aria-label={`Use ${tool.title}`}
                      >
                        Use Tool{" "}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </ToolsSlider>

          {/* View All Tools Button */}
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/tools" className="flex items-center gap-2">
                View All Tools <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">
              Why Choose Our Tools
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our tools are designed with simplicity, security, and performance
              in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">
                Fast Processing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All processing happens directly in your browser, ensuring quick
                results without waiting for server uploads.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">
                100% Secure
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your files never leave your device. All processing happens
                locally, ensuring complete privacy and security.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600 dark:text-purple-400"
                  aria-hidden="true"
                >
                  <path d="M12 2v4"></path>
                  <path d="M12 18v4"></path>
                  <path d="M4.93 4.93l2.83 2.83"></path>
                  <path d="M16.24 16.24l2.83 2.83"></path>
                  <path d="M2 12h4"></path>
                  <path d="M18 12h4"></path>
                  <path d="M4.93 19.07l2.83-2.83"></path>
                  <path d="M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">
                AI-Powered
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our tools use advanced AI algorithms to optimize your files,
                delivering superior results with every conversion.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-yellow-600 dark:text-yellow-400"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">
                Cross-Platform
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Works on all devices and browsers. Use our tools on desktop,
                tablet, or mobile without any compatibility issues.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600 dark:text-red-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">
                No Registration
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No sign-ups, no accounts, no email required. Just visit the site
                and start using our tools immediately.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-800">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyan-600 dark:text-cyan-400"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">
                Completely Free
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All our tools are 100% free to use with no hidden fees, no
                watermarks, and no limitations on the number of conversions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-700 dark:to-cyan-600 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Try our free online tools today and see the difference. No
            registration required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/#tools">Try Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
