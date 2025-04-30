"use client";

import React from "react";
import { Check } from "lucide-react";

export default function ToolGuide() {
  const steps = [
    {
      title: "Device Setup",
      description:
        "Select and test your camera and microphone devices before recording. Visit the Devices tab to see all available devices and ensure they're working properly.",
    },
    {
      title: "Configure Options",
      description:
        "Choose your recording mode (webcam or screen), resolution, and frame rate. Enable privacy features like face blur and metadata stripping based on your needs.",
    },
    {
      title: "Start Recording",
      description:
        "Click the red record button to start. The timer will show your recording duration. You can pause and resume at any time, or stop when finished.",
    },
    {
      title: "Review & Edit",
      description:
        "After recording, find your video in the Recordings tab. Preview it, trim unwanted segments, or convert to different formats like MP4, WebM, or GIF.",
    },
    {
      title: "Save or Share",
      description:
        "Download your recording to your device or generate a temporary URL to share with others. All sharing options maintain your privacy with no server uploads.",
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">How to Use Privacy Media Recorder</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Follow these simple steps to create high-quality recordings while maintaining complete privacy.
        </p>
      </div>

      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-purple-600 dark:bg-purple-600 flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-purple-100 dark:border-purple-900">
          <h3 className="text-xl font-bold mb-4">Tips for Better Recordings</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                <Check className="h-4 w-4 text-green-600" />
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                Ensure good lighting when recording with webcam
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                <Check className="h-4 w-4 text-green-600" />
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                Use a headset for better audio quality
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                <Check className="h-4 w-4 text-green-600" />
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                Close unused tabs to improve recording performance
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                <Check className="h-4 w-4 text-green-600" />
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                Choose lower resolution for longer recordings to save space
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-purple-100 dark:border-purple-900">
          <h3 className="text-xl font-bold mb-4">Troubleshooting</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2">
                <span className="text-amber-600 font-bold">!</span>
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                If devices aren't showing up, check browser permissions
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2">
                <span className="text-amber-600 font-bold">!</span>
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                For screen recording issues, try a different browser
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2">
                <span className="text-amber-600 font-bold">!</span>
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                If processing is slow, try a smaller resolution or shorter clip
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2">
                <span className="text-amber-600 font-bold">!</span>
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                Clear browser storage if you experience performance issues
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
