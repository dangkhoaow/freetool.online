"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection() {
  const faqs = [
    {
      question: "Is my recording truly private? Does any data leave my device?",
      answer:
        "Yes, your recordings are 100% private. All recording and processing happens entirely within your browser. No video, audio, or any other data is uploaded to any server. Even when you use features like face blur or format conversion, everything occurs locally on your device using WebAssembly technologies."
    },
    {
      question: "What browsers and devices are supported?",
      answer:
        "Our Privacy Media Recorder works on modern browsers including Chrome, Firefox, Edge, and Safari. For best performance, we recommend using Chrome or Edge on desktop. Mobile browser support varies, with Chrome on Android offering the best experience. iOS support depends on your device's iOS version, as Apple has varying levels of WebRTC support."
    },
    {
      question: "How does the face blur technology work?",
      answer:
        "Our face blur feature uses browser-based machine learning to detect faces in real-time during recording. When enabled, a blur effect is applied to detected facial regions while preserving the rest of the image. The intensity of the blur can be adjusted based on your preferences. This processing happens entirely on your device."
    },
    {
      question: "Can I record my screen and camera at the same time?",
      answer:
        "Yes, you can record your screen and include your webcam as a picture-in-picture overlay. Simply select 'Screen' as your recording mode and make sure both video and audio are enabled in your settings. You can choose which microphone to use alongside system audio capture."
    },
    {
      question: "How long can my recordings be?",
      answer:
        "The maximum length of your recordings depends on your device's available storage and memory. Since recordings are stored directly in your browser's IndexedDB storage, devices with more free space can handle longer recordings. For most modern devices, recording 30-60 minutes should work without issues."
    },
    {
      question: "Where are my recordings stored and how long do they last?",
      answer:
        "Recordings are stored in your browser's IndexedDB storage, which is specific to this website. They remain there until you manually delete them or clear your browser storage. Note that using private/incognito mode will delete recordings when you close your browser session."
    },
    {
      question: "What's the difference between the video formats (WebM, MP4, GIF)?",
      answer:
        "WebM is an open format that provides good compression and quality, ideal for web sharing. MP4 is widely compatible with most devices and applications but may result in larger file sizes. GIF is best for short, looping animations without audio, but results in the largest file sizes and reduced quality."
    },
    {
      question: "Can I edit my recordings after I've finished?",
      answer:
        "Yes, you can perform basic editing such as trimming (cutting the beginning and end) and changing the resolution or format. For more advanced editing like adding text or transitions, we recommend downloading your recording and using dedicated video editing software."
    },
    {
      question: "What does the 'Strip Metadata' feature do?",
      answer:
        "This feature removes identifying information embedded in video and image files, including GPS location, device information, creation dates, and other metadata. This helps protect your privacy when sharing recordings, as this information could otherwise be extracted from your files by recipients."
    },
    {
      question: "How can I share my recordings with others?",
      answer:
        "After recording, go to the Recordings tab and select the recording you want to share. You can download the file for manual sharing, or use the built-in Share option which creates a temporary URL (on supporting browsers). For security, remember that once downloaded, the recording exists outside the private browser environment."
    }
  ];

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Get answers to common questions about our Privacy Media Recorder tool.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
        <h3 className="text-xl font-semibold mb-3">Still have questions?</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you need more information or have specific questions about our Privacy Media Recorder,
          we're here to help.
        </p>
        <div className="flex justify-center">
          <a target="_blank"
            href="https://freetoolonline.com/contact-us.html?utm_source=external&utm_medium=freetool&utm_content=privacy-media-recorder"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
