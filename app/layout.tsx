import type { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import { Metadata } from "next";
import ScrollToTop from "@/components/scroll-to-top";
import { ProductionProvider } from "@/components/production-detector";
import { GTMScripts } from "@/components/gtm-scripts";

const inter = Inter({ subsets: ["latin"] });

// For server components, rely on NODE_ENV and middleware cookie
const isProduction = process.env.NODE_ENV === 'production';

export const metadata: Metadata = {
  title: {
    template: '%s | FreeTool Online',
    default: 'FreeTool Online - Free Browser-Based Converter Tools',
  },
  description: "100% free web-based tools for everyday tasks. Convert, transform, and optimize your files without installing any software. All processing happens in your browser for complete privacy.",
  generator: "freetool.online",
  keywords: "free online tools, browser tools, file converter, browser-based utility, no-install tools",
  metadataBase: new URL('https://freetool.online'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freetool.online',
    siteName: 'FreeTool Online',
    title: 'FreeTool Online - Free Browser-Based Converter Tools',
    description: '100% free web-based tools for everyday tasks. Convert, transform, and optimize your files without installing any software.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeTool Online',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeTool Online',
    description: '100% free web-based tools for everyday tasks',
    images: ['/images/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Only place critical meta tags that can't be handled by Next.js metadata API */}
        <meta name="google-adsense-account" content="ca-pub-2317460280557760" />
      </head>
      <body className={inter.className}>
        <ProductionProvider>
          {/* GTM scripts will only be included in production environments */}
          <GTMScripts />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
            <ScrollToTop />
          </ThemeProvider>
        </ProductionProvider>
      </body>
    </html>
  );
}
