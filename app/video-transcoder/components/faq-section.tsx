"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  const faqs = [
    {
      question: "What video formats are supported for input and output?",
      answer: "Our browser-based video transcoder supports most common input formats including MP4, WebM, MOV, AVI, MKV, FLV, WMV, and more. For output, you can convert to MP4 (H.264/H.265/AV1), WebM (VP9/VP8), or keep the original format when using trim, split, or merge functions. MP4 is recommended for maximum compatibility across devices and platforms."
    },
    {
      question: "Is there a file size limit for video processing?",
      answer: "There is no hard file size limit since all processing happens directly in your browser. Our tool can handle videos of any size your device can manage, though larger files (over 500MB) may require more processing time and system resources. The practical limit depends on your device's memory and processing capabilities."
    },
    {
      question: "How is my privacy protected when using this video transcoder?",
      answer: "Your videos never leave your device - all converting, trimming, splitting, and merging happens locally in your browser using WebAssembly and FFmpeg.wasm technology. No video data is uploaded to any server, giving you complete privacy and security. This is why our tool is ideal for processing sensitive or confidential video content."
    },
    {
      question: "Can I use this online video tool without an internet connection?",
      answer: "Yes! Once you've loaded the page, the entire video transcoder tool can function without an internet connection. All the necessary code and processing libraries are downloaded to your browser on the initial load, making it perfect for processing videos in environments with limited connectivity."
    },
    {
      question: "What's the difference between the various video codecs?",
      answer: "H.264 (MP4) offers excellent compatibility across devices and platforms. H.265/HEVC provides better compression (25-50% smaller files) than H.264 at equivalent quality but has limited support on older devices. VP9 (WebM) is royalty-free with compression comparable to H.265. AV1 offers the best compression but requires more processing power. We recommend H.264 if compatibility is important and VP9/AV1 if file size is your priority."
    },
    {
      question: "How does the Convert function work?",
      answer: "Our Convert function allows you to change your video format, adjust quality (on a scale of 1-5), and modify resolution. It's ideal for optimizing videos for different platforms or reducing file size. You can convert between formats like MP4 and WebM, or keep the same format while adjusting quality and resolution. This process re-encodes the video data using the selected codec and quality settings."
    },
    {
      question: "How precise is the Trim function?",
      answer: "The Trim function offers frame-accurate precision for setting start and end points of your video. You can drag interactive handles on the timeline or enter exact timestamps manually. This makes it perfect for removing unwanted sections from videos, extracting specific clips, or creating highlight reels. Trimming creates a new video file containing only the selected portion without re-encoding the entire video when possible."
    },
    {
      question: "How does the Split function work and how many split points can I add?",
      answer: "The Split function allows you to divide your video into multiple segments by adding timestamp markers where cuts should occur. You can add up to 5 split points, creating a maximum of 6 separate video files. Each split point creates a clean cut, and all resulting segments are available for individual preview and download. This is ideal for breaking longer content into shorter, more manageable clips without quality loss."
    },
    {
      question: "How does the Merge function combine multiple videos?",
      answer: "The Merge function lets you combine multiple video files into a single continuous video. You can upload multiple videos, rearrange their order using up/down buttons, and trim the start/end points of each clip. Our web-based processor automatically handles format compatibility between clips and creates smooth transitions. You can merge videos of different formats, resolutions, and frame rates, though keeping these consistent provides the best results."
    },
    {
      question: "How does GPU acceleration work for video processing?",
      answer: "When available, we use WebGPU and hardware acceleration to offload video processing tasks to your graphics card. This can significantly speed up video transcoding, often providing 2-10x faster processing. The system automatically detects your hardware capabilities and optimizes accordingly. If your browser or device doesn't support hardware acceleration, processing will still work but may be slower as it will use your CPU instead."
    },
    {
      question: "Will transcoding, trimming, or splitting reduce my video quality?",
      answer: "Trimming and splitting operations maintain the original quality when using the 'copy' codec option. Converting to different formats or adjusting quality settings does involve re-encoding, which can affect quality. Our tool offers quality controls (1-5) to balance file size and visual quality. For highest quality, use a higher quality setting (4-5), though this will result in larger file sizes. Preview your video before downloading to ensure it meets your quality expectations."
    },
    {
      question: "Why is video processing taking a long time?",
      answer: "Video processing is computationally intensive, especially for high-resolution content. Processing time depends on your device's hardware, the video's resolution and length, and the chosen quality settings. For faster processing: 1) Use a more powerful device, 2) Reduce output quality or resolution, 3) Process shorter segments, 4) Use a modern browser that supports WebAssembly and GPU acceleration. Our real-time processing information shows speed and estimated time remaining."
    },
    {
      question: "Which browsers work best with this video transcoder tool?",
      answer: "Chrome, Edge, and other Chromium-based browsers generally offer the best performance and compatibility with our video transcoder, especially for GPU acceleration features. Firefox works for most features but may have limited hardware acceleration. Safari supports basic functionality but may have performance limitations with larger files. For best results, we recommend using the latest version of Chrome or Edge."
    }
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 dark:text-white">Frequently Asked Questions</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get answers to common questions about our free browser-based video converter, trimmer, splitter, and merger
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 text-left font-medium dark:text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-gray-600 dark:text-gray-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Still have questions about video processing?{" "}
          <a target="_blank" href="https://freetoolonline.com/contact-us.html?utm_source=external&utm_medium=freetool&utm_content=video-transcoder" className="text-blue-600 hover:underline dark:text-blue-400">
            Contact our support team
          </a>{" "}
          for more information
        </p>
      </div>
    </div>
  )
}
