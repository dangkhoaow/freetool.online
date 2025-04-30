"use client";

import React from "react";
import { Camera, Shield, MonitorSmartphone, Cpu, Settings, Save } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Camera className="h-12 w-12 text-purple-600 mb-4" />,
      title: "Multi-Source Recording",
      description: "Capture video and audio from webcam, screen, or both simultaneously. Mix system audio with your microphone for professional recordings.",
    },
    {
      icon: <Shield className="h-12 w-12 text-purple-600 mb-4" />,
      title: "Complete Privacy Protection",
      description: "Your recordings never leave your device. All processing happens locally in your browser with no cloud uploads or server processing.",
    },
    {
      icon: <MonitorSmartphone className="h-12 w-12 text-purple-600 mb-4" />,
      title: "Device Management",
      description: "Detect and manage all connected cameras and microphones. Test each device individually before recording to ensure quality.",
    },
    {
      icon: <Cpu className="h-12 w-12 text-purple-600 mb-4" />,
      title: "Advanced Processing",
      description: "Trim, convert, and optimize recordings using powerful FFmpeg processing. Support for multiple formats including WebM, MP4, and GIF.",
    },
    {
      icon: <Settings className="h-12 w-12 text-purple-600 mb-4" />,
      title: "Resolution Control",
      description: "Choose from multiple resolution options from 360p to 4K. Adjust frame rate and quality settings for the perfect balance of size and quality.",
    },
    {
      icon: <Save className="h-12 w-12 text-purple-600 mb-4" />,
      title: "Local Storage",
      description: "All recordings are stored securely in your browser's IndexedDB. Easily manage, download, or share your recordings when needed.",
    },
  ];

  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Privacy-First Recording Technology
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our browser-based recording tool uses cutting-edge web technology to provide powerful features without compromising your privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow border border-purple-100 dark:border-purple-900"
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 p-8 rounded-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Why Browser-Based Recording?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-200">No software installation required</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-200">Works on any device with a modern browser</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-200">No account creation or login required</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-200">Complete privacy with local processing</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-200">Free to use with no limitations</span>
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-purple-100 dark:border-purple-900">
              <h4 className="text-xl font-semibold mb-4">Browser Technologies Used</h4>
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span>MediaRecorder API</span>
                  <span className="text-purple-600">Recording</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span>WebRTC</span>
                  <span className="text-purple-600">Device Access</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span>IndexedDB</span>
                  <span className="text-purple-600">Local Storage</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span>Canvas API</span>
                  <span className="text-purple-600">Blur Processing</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span>FFmpeg WebAssembly</span>
                  <span className="text-purple-600">Video Processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
