import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Private AI Chat - Secure and Private LLM - FreeTool.Online',
  description: 'Chat securely with AI that runs entirely in your browser. No data sent to servers, ensuring complete privacy for your conversations.',
  keywords: 'private ai chat, secure ai chat, browser-based ai, local ai, privacy-focused ai, free ai tools, no-server ai, data-private ai',
  openGraph: {
    title: 'Private AI Chat - Secure and Private LLM - FreeTool.Online',
    description: 'Chat securely with AI that runs entirely in your browser. No data sent to servers, ensuring complete privacy for your conversations.',
    url: 'https://freetool.online/private-ai-chat',
    siteName: 'FreeTool.Online',
    images: [
      {
        url: 'https://freetool.online/images/private-ai-chat-og.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeTool.Online Private AI Chat',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Private AI Chat - Secure and Private LLM - FreeTool.Online',
    description: 'Chat securely with AI that runs entirely in your browser. No data sent to servers, ensuring complete privacy for your conversations.',
    images: ['https://freetool.online/images/private-ai-chat-og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://freetool.online/private-ai-chat"
  },
}; 