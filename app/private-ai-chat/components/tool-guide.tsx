"use client"

import Image from "next/image"
import { Check, Shield, Zap, Lock } from "lucide-react"

export default function ToolGuide() {
  const steps = [
    {
      title: "Select Your Private AI Model",
      description:
        "Choose from our curated selection of private AI language models based on your specific needs. Each model is optimized for local browser execution using WebGPU acceleration.",
      image: "/images/ai-chat/select-model.jpg",
    },
    {
      title: "One-Time Secure Model Download",
      description:
        "The first time you use our private AI chat, your selected model is securely downloaded to your device. This happens only once as models are cached locally for future private conversations.",
      image: "/images/ai-chat/download-model.jpg",
    },
    {
      title: "Begin 100% Private Conversations",
      description:
        "Once the model is loaded, start typing your messages with complete privacy. The WebGPU-accelerated AI processes your input directly in your browser with no data ever leaving your device.",
      image: "/images/ai-chat/start-chat.jpg",
    },
    {
      title: "Customize Your Private AI Experience",
      description:
        "Fine-tune your private AI chat by adjusting parameters like temperature (creativity), maximum response length, and other settings for personalized, secure conversation experiences.",
      image: "/images/ai-chat/ai-settings.jpg",
    },
  ]

  const useCases = [
    "Draft confidential emails or sensitive messages with complete privacy",
    "Brainstorm proprietary ideas and intellectual property without server exposure",
    "Process personal, medical, or legal documents with zero data sharing",
    "Use private AI in restricted networks, regulated environments, or offline settings",
    "Analyze sensitive business data without exposing it to third-party services",
    "Develop creative work like writing or code without worry about ownership issues",
  ]

  return (
    <section className="py-16 px-4 bg-white" id="private-ai-chat-guide">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How Our Private AI Chat Tool Works with WebGPU</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our revolutionary private AI chat tool is the first to leverage modern WebGPU technology to run sophisticated AI models locally in your browser,
            ensuring 100% privacy for your sensitive conversations. Here's how to start experiencing truly private AI chatting:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-blue-100 text-blue-800 rounded-full h-10 w-10 flex items-center justify-center font-bold shrink-0">
                {index + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <div className="bg-gray-100 rounded-lg overflow-hidden h-48 w-full">
                  <Image 
                    src={step.image}
                    alt={step.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-8 border border-blue-100 dark:border-gray-700 mb-12">
          <h3 className="text-2xl font-bold mb-6 dark:text-white">Ideal Use Cases for WebGPU-Powered Private AI Chat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-full p-1 shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <p className="text-gray-700 dark:text-gray-300">{useCase}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="flex justify-center mb-4">
              <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center dark:text-white">Privacy-First Design</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our private AI chat was built from the ground up with a zero-server architecture. Unlike ChatGPT or other traditional AI services,
              your conversations are processed entirely locally, guaranteeing maximum privacy for sensitive information.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="flex justify-center mb-4">
              <Zap className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center dark:text-white">WebGPU Acceleration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We leverage cutting-edge WebGPU technology to harness your device's graphics processing unit, enabling fast, responsive AI conversations
              without server dependence. This breakthrough approach delivers private chat with performance previously only possible with cloud solutions.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="flex justify-center mb-4">
              <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center dark:text-white">Complete Data Control</h3>
            <p className="text-gray-600 dark:text-gray-300">
              With our private AI chat, you maintain full ownership of your conversation data. All chat history is encrypted locally with 256-bit encryption
              and never leaves your device, giving you confidence when discussing confidential or sensitive matters.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4 dark:text-white">Technical Requirements for Private AI Chat</h3>
          <div className="inline-block text-left">
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Modern browser with WebGPU support (Chrome, Edge, or Safari)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Device with GPU acceleration (most computers from 2017 onwards)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Minimum 4GB of available system memory for optimal private AI processing</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Internet connection only for initial model download (fully offline operation afterward)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a 
            href="#chat-tool" 
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium text-lg rounded-lg hover:bg-blue-700 transition-colors"
          >
            Experience Truly Private AI Chat Now
          </a>
        </div>
      </div>
    </section>
  )
} 