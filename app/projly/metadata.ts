import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projly | Free Project Management Tool with AI-Enhanced Productivity",
  description:
    "Projly is a comprehensive project management platform with task tracking, team collaboration, and analytics. Organize projects, assign tasks, and boost team productivity with AI-powered features.",
  keywords:
    "project management, task tracking, team collaboration, project organization, free project management, task assignment, AI project management, team productivity tool, resource management, project analytics",
  openGraph: {
    title: "Projly | Free Project Management Tool with AI-Enhanced Productivity",
    description:
      "Streamline your workflow with Projly's comprehensive project management platform. Organize projects, assign tasks, collaborate with teams, and track progress in real-time.",
    url: "https://freetool.online/projly",
    siteName: "FreeTool",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/projly-og.jpg",
        width: 1200,
        height: 630,
        alt: "Projly Project Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projly | Free Project Management Tool with AI-Enhanced Productivity",
    description:
      "Streamline your workflow with Projly's comprehensive project management platform. 100% free and secure.",
    images: ["/images/projly-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://freetool.online/projly",
  },
}
