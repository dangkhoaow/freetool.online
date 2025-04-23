import { Suspense } from "react";
import Script from "next/script";
import Footer from "@/components/footer";
import HeroSection from "@/components/hero-section";
import ToolGuide from "./components/tool-guide";
import FaqSection from "./components/faq-section";
import SecuritySection from "./components/security-section";
import AIChatClientWrapper from "./components/ai-chat-client-wrapper";

// Get the Llama model URL from environment variables
const llamaModelUrl = process.env.LLAMA_2_7B_MODEL_URL || 
  "https://dkbg1jftzfsd2.cloudfront.net/ai-model/Llama-2-7b-chat-hf-q4f16_1-MLC";

export default function PrivateAIChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Script
        id="env-script"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.__ENV__ = window.__ENV__ || {};
            window.__ENV__.LLAMA_2_7B_MODEL_URL = "${llamaModelUrl}";
          `
        }}
      />
      
      {/* Add JSON-LD structured data for rich search results */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Private AI Chat by FreeTool",
            "applicationCategory": "ChatApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "The first and best 100% private AI chat tool that runs entirely in your browser using WebGPU acceleration with zero data sent to servers.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "156"
            },
            "featureList": "Local AI processing, WebGPU acceleration, Encrypted storage, No data sharing"
          })
        }}
      />

      <HeroSection
        title="First & Best Private AI Chat with"
        titleHighlight="100% Local Processing"
        description="Experience revolutionary privacy with our browser-based AI chat tool. All conversations processed locally using WebGPU acceleration - no data ever leaves your device, ensuring complete security for your sensitive information."
        badge="WebGPU-Powered AI Chat"
        primaryButtonText="Start Private Chatting"
        secondaryButtonText="Learn How It Works"
        primaryButtonHref="#chat-tool"
        secondaryButtonHref="#features"
      />

      <div id="chat-tool" className="scroll-mt-16">
        <AIChatClientWrapper />
      </div>

      <div id="features" className="scroll-mt-16">
        <section className="py-12 px-4 bg-white dark:bg-gray-900">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-6 dark:text-white">
              Why Our Private AI Chat is Revolutionary
            </h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              The first-ever browser-based AI chat that offers complete privacy without compromising on performance or features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg border border-blue-100 dark:border-gray-700">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                    className="lucide-shield"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">100% Privacy Guaranteed</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All conversations stay on your device with zero data transmitted to external servers - complete protection for sensitive information
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg border border-blue-100 dark:border-gray-700">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                    className="lucide-zap"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Advanced WebGPU Acceleration
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Harnesses your device's GPU for fast, responsive AI chat performance without the lag of server-based solutions
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg border border-blue-100 dark:border-gray-700">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                    className="lucide-lock"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">256-bit Local Encryption</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Chat history secured with military-grade encryption using browser's Web Crypto API for maximum security
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg border border-blue-100 dark:border-gray-700">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                    className="lucide-layers"
                  >
                    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                    <path d="m22 12.5-9.6 4.36a2 2 0 0 1-1.66 0L2 12.5" />
                    <path d="m22 17.5-9.6 4.36a2 2 0 0 1-1.66 0L2 17.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Advanced AI Models</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access powerful language models optimized for browser execution with capabilities rivaling cloud-based solutions
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="py-12 px-4 bg-blue-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-6 dark:text-white">
            How WebGPU Powers Our Browser-Based AI
          </h2>
          <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Our innovative use of WebGPU technology enables AI model inference directly in your browser, offering unprecedented privacy and performance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm dark:shadow-gray-900 dark:border dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-3 dark:text-white">GPU Acceleration</h3>
              <p className="text-gray-600 dark:text-gray-300">WebGPU leverages your device's graphics processing unit to perform the complex matrix operations required for AI inference, achieving speeds up to 10x faster than CPU-only processing.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm dark:shadow-gray-900 dark:border dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Optimized Model Architecture</h3>
              <p className="text-gray-600 dark:text-gray-300">Our AI models are specifically quantized and optimized for WebGPU execution, ensuring efficient memory usage while maintaining high quality responses even on consumer hardware.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm dark:shadow-gray-900 dark:border dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Browser Sandboxing</h3>
              <p className="text-gray-600 dark:text-gray-300">By running within the browser's secure sandbox, our implementation adds an extra layer of security while eliminating the need for additional software installation or configuration.</p>
            </div>
          </div>
        </div>
      </section>

      <div id="guide" className="scroll-mt-16">
        <ToolGuide />
      </div>

      <div id="faq" className="scroll-mt-16">
        <FaqSection />
      </div>

      <div id="security" className="scroll-mt-16">
        <SecuritySection />
      </div>

      <section className="py-12 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6 dark:text-white">Ready to Experience Truly Private AI Chat?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already discovered the power of browser-based AI that respects your privacy.
          </p>
          <a href="#chat-tool" className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Start Your Private Chat Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
} 