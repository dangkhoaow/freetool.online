"use client"

import Image from "next/image"
import { Check } from "lucide-react"

export default function ToolGuide() {
  const steps = [
    {
      title: "Choose a Model",
      description:
        "Select from available language models based on your needs. Smaller models load faster but may have less capabilities.",
      image: "/images/ai-chat/select-model.svg",
    },
    {
      title: "Wait for Download",
      description:
        "The first time you use a model, it needs to be downloaded to your device. This only happens once as models are cached locally.",
      image: "/images/ai-chat/download-model.svg",
    },
    {
      title: "Start Chatting",
      description:
        "Once the model is loaded, you can start typing your messages. The model processes your input directly in your browser.",
      image: "/images/ai-chat/start-chat.svg",
    },
    {
      title: "Adjust Settings (Optional)",
      description:
        "Fine-tune the model's behavior by adjusting parameters like temperature (creativity) and maximum response length.",
      image: "/images/ai-chat/adjust-settings.svg",
    },
  ]

  const useCases = [
    "Draft emails or messages without privacy concerns",
    "Brainstorm ideas for sensitive projects",
    "Get help with personal or confidential documents",
    "Process data that can't leave your device",
    "Use AI in restricted networks or offline environments",
    "Learn and experiment with LLM outputs without usage limits",
  ]

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our Private AI Chat tool leverages modern web technologies to run AI models locally in your browser.
            Here's how to get started:
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
                <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                  {/* Placeholder for actual images */}
                  <div className="text-center text-gray-500">
                    <div className="mb-2">Image Placeholder</div>
                    <div className="text-xs">(Illustration for {step.title})</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-8 border border-blue-100">
          <h3 className="text-2xl font-bold mb-6">When to Use Private AI Chat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-full p-1 shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <p className="text-gray-700">{useCase}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Technical Requirements</h3>
          <div className="inline-block text-left">
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="bg-green-100 text-green-800 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Modern browser (Chrome, Edge, or Safari)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-green-100 text-green-800 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Device with WebGPU support (most computers from 2017 onwards)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-green-100 text-green-800 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>At least 4GB of available system memory</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-green-100 text-green-800 rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
                <span>Internet connection for initial model download</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
} 