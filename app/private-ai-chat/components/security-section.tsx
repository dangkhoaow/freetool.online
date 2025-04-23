"use client"

import { Shield, Lock, Eye, Server, Database, Zap } from "lucide-react"

export default function SecuritySection() {
  const securityFeatures = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "100% Private Processing",
      description:
        "All AI processing happens locally in your browser using WebGPU acceleration. No conversation data is ever sent to external servers, ensuring your sensitive information remains 100% private at all times.",
    },
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: "Military-Grade Encryption",
      description:
        "Chat history is secured with 256-bit AES-GCM encryption using the Web Crypto API before being stored in your browser's IndexedDB, protecting your sensitive data even in case of browser vulnerabilities.",
    },
    {
      icon: <Eye className="h-8 w-8 text-blue-600" />,
      title: "Zero Tracking Guarantee",
      description:
        "Unlike other AI chat tools, we don't track your conversations or usage patterns. There are no analytics or tracking cookies tied to your chat activities, ensuring complete anonymity for private conversations.",
    },
    {
      icon: <Server className="h-8 w-8 text-blue-600" />,
      title: "Transparent Model Security",
      description:
        "We use only transparent, open-source language models that have been independently reviewed by the AI safety community, avoiding black-box proprietary systems with unknown data handling practices.",
    },
    {
      icon: <Database className="h-8 w-8 text-blue-600" />,
      title: "Complete Data Control",
      description:
        "You maintain full ownership and control over your data. Export or delete your private chat history at any time with a single click - no questions asked, no cloud copies retained.",
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: "Offline Privacy Mode",
      description:
        "After initial model download, disconnect completely from the internet for maximum privacy. Our tool functions 100% offline with no external connections needed - truly private AI chatting.",
    },
  ]

  return (
    <section className="py-16 px-4 bg-gray-50" id="private-ai-chat-security">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-block p-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Industry-Leading Security & Privacy by Design</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our Private AI Chat is built from the ground up with unprecedented security and privacy protection as the top priority. 
            As the first browser-based WebGPU-accelerated AI chat, we've engineered a unique approach to guarantee your sensitive conversations remain 100% private.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300">Advanced Technical Security Details for Private AI Chat</h3>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500 dark:text-blue-400">•</div>
              <div>
                <strong>WebGPU-Powered Model Security:</strong> Models are loaded directly from verified sources like Hugging Face and
                run through WebGPU, which provides sandboxed execution isolated from other browser processes, preventing cross-contamination of data.
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500 dark:text-blue-400">•</div>
              <div>
                <strong>256-bit AES Encryption:</strong> Military-grade AES-GCM 256-bit encryption with unique initialization vectors is used for
                local storage encryption, the same standard used by financial institutions and government agencies for sensitive data protection.
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500 dark:text-blue-400">•</div>
              <div>
                <strong>Complete Offline Processing:</strong> After initial model download, the private AI chat tool can function entirely offline with no
                external connections needed - perfect for air-gapped systems or highly sensitive environments where network isolation is required.
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500 dark:text-blue-400">•</div>
              <div>
                <strong>Zero-Server Architecture:</strong> Unlike all other AI chat applications, there are no backend API calls for
                processing or storing your data. Every aspect of the conversation happens locally on your device with complete privacy.
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500 dark:text-blue-400">•</div>
              <div>
                <strong>Private Key Management:</strong> Encryption keys are generated and stored exclusively on your device using secure browser key storage,
                ensuring that even in the event of a browser vulnerability, your sensitive chat data remains encrypted and protected.
              </div>
            </li>
          </ul>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-900 dark:border dark:border-gray-700 text-center">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Our Privacy Commitment for Private AI Chat</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            As pioneers in browser-based private AI chat technology, we're committed to providing the most secure, private AI conversation experience possible.
            Your sensitive data never leaves your device, giving you complete confidence when discussing confidential or personal matters.
          </p>
          <a 
            href="#chat-tool" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Private AI Chat Now
          </a>
        </div>
      </div>
    </section>
  )
} 