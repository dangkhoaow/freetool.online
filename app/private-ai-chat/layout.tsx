import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Private AI Chat - Browser-Based Local Processing",
  description: "The first and best 100% private AI chat tool that runs entirely in your browser using WebGPU acceleration with zero data sent to servers.",
  keywords: "private AI chat, local AI processing, browser AI chat, WebGPU AI, private large language model, no-server AI, local LLM",
  openGraph: {
    title: "Private AI Chat - 100% Private Browser-Based AI",
    description: "Revolutionary privacy with browser-based AI chat - no data ever leaves your device, ensuring complete security for sensitive information.",
    images: [
      {
        url: "/images/private-ai-chat-og.jpg",
        width: 1200,
        height: 630,
        alt: "Private AI Chat by FreeTool",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Private AI Chat by FreeTool",
    description: "The first 100% private AI chat with zero data sent to servers",
    images: ["/images/private-ai-chat-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function PrivateAIChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="private-ai-chat-container w-full min-h-screen">
      {children}
    </div>
  );
} 