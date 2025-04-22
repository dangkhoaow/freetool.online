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
    <div className="min-h-screen bg-gray-50">
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

      <HeroSection
        title="Private AI Chat with"
        titleHighlight="Local Processing"
        description="Chat with AI models that run 100% in your browser. No data is sent to any server, ensuring complete privacy for your sensitive conversations."
        badge="Browser-Based AI Chat"
        primaryButtonText="Start Chatting"
        secondaryButtonText="Learn More"
        primaryButtonHref="#chat-tool"
        secondaryButtonHref="#features"
      />

      <div id="chat-tool" className="scroll-mt-16">
        <AIChatClientWrapper />
      </div>

      <div id="features" className="scroll-mt-16">
        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Our Private AI Chat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                <h3 className="text-xl font-semibold mb-2">Complete Privacy</h3>
                <p className="text-gray-600">
                  All conversations stay on your device with no data transmitted
                  to external servers
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                <h3 className="text-xl font-semibold mb-2">
                  WebGPU Acceleration
                </h3>
                <p className="text-gray-600">
                  Utilizes your GPU for faster inference, enabling smooth
                  conversations
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                <h3 className="text-xl font-semibold mb-2">Encrypted Storage</h3>
                <p className="text-gray-600">
                  Chat history encrypted locally using the Web Crypto API for
                  added security
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                <h3 className="text-xl font-semibold mb-2">Multiple Models</h3>
                <p className="text-gray-600">
                  Choose from various lightweight LLMs optimized for browser
                  execution
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div id="guide" className="scroll-mt-16">
        <ToolGuide />
      </div>

      <div id="faq" className="scroll-mt-16">
        <FaqSection />
      </div>

      <div id="security" className="scroll-mt-16">
        <SecuritySection />
      </div>

      <Footer />
    </div>
  );
} 