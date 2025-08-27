import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A&V Foundation - Vietnamese Art Collection",
  description: "Preserving and showcasing Vietnamese art heritage through comprehensive artist profiles and artwork collections. Discover the rich tapestry of Vietnamese art from the Đông Dương period to contemporary works.",
  keywords: [
    "Vietnamese art",
    "art foundation", 
    "Vietnamese artists",
    "art collection",
    "Vietnamese culture",
    "silk painting",
    "lacquer art",
    "Đông Dương period",
    "contemporary Vietnamese art",
    "art heritage",
    "cultural preservation"
  ],
  openGraph: {
    title: "A&V Foundation - Vietnamese Art Collection",
    description: "Preserving and showcasing Vietnamese art heritage through comprehensive artist profiles and artwork collections",
    type: "website",
    locale: "en_US",
    siteName: "A&V Foundation",
    images: [
      {
        url: "/av-foundation/vietnamese-art-gallery.png",
        width: 1200,
        height: 630,
        alt: "A&V Foundation Gallery",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A&V Foundation - Vietnamese Art Collection",
    description: "Preserving and showcasing Vietnamese art heritage",
    images: ["/av-foundation/vietnamese-art-gallery.png"],
  },
  alternates: {
    canonical: "/av-foundation",
  },
  robots: {
    index: true,
    follow: true,
  },
};
