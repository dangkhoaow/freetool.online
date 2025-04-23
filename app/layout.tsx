import type { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Script from "next/script";
import { Metadata } from "next";
import ScrollToTop from "@/components/scroll-to-top";

const inter = Inter({ subsets: ["latin"] });

// Function to check if we're in production environment
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
        {/* Google Tag Manager Script */}
        {isProduction && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-TQVXPQXZ');
              console.log('GTM loaded in production environment');
            `}
          </Script>
        )}
        
        {isProduction && (
          <noscript>
            <iframe 
              src="https://www.googletagmanager.com/ns.html?id=GTM-TQVXPQXZ"
              height="0" 
              width="0" 
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
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
      </body>
    </html>
  );
}
