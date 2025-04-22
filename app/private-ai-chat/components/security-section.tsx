"use client"

import { Shield, Lock, Eye, Server, Database } from "lucide-react"

export default function SecuritySection() {
  const securityFeatures = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Complete Privacy",
      description:
        "All processing happens locally in your browser. No data is sent to any external servers, ensuring your conversations remain 100% private.",
    },
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: "Encrypted Storage",
      description:
        "Chat history is encrypted using the Web Crypto API before being stored in your browser's IndexedDB, protecting your data even in case of browser vulnerabilities.",
    },
    {
      icon: <Eye className="h-8 w-8 text-blue-600" />,
      title: "No Tracking",
      description:
        "We don't track your conversations or usage patterns. There are no analytics or tracking cookies tied to your chat activities.",
    },
    {
      icon: <Server className="h-8 w-8 text-blue-600" />,
      title: "Open Model Architecture",
      description:
        "We use transparent, open-source language models that have been independently reviewed by the AI safety community.",
    },
    {
      icon: <Database className="h-8 w-8 text-blue-600" />,
      title: "Local Data Control",
      description:
        "You maintain full control over your data. Export or delete your chat history at any time with a single click.",
    },
  ]

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-block p-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Security & Privacy by Design</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our Private AI Chat is built from the ground up with your privacy and security as the top priority. Here's how
            we protect your data and conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">Technical Security Details</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500">•</div>
              <div>
                <strong>Model Security:</strong> Models are loaded directly from verified sources like Hugging Face and
                run through WebGPU, which provides sandboxed execution.
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500">•</div>
              <div>
                <strong>Encryption:</strong> AES-GCM 256-bit encryption with unique initialization vectors is used for
                local storage encryption.
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500">•</div>
              <div>
                <strong>Offline Processing:</strong> After model download, the tool can function entirely offline with no
                external connections needed.
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 text-blue-500">•</div>
              <div>
                <strong>No Backend Services:</strong> Unlike most AI applications, there are no backend API calls for
                processing or storing your data.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
} 