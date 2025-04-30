import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Online Tools | FreeTool Online",
  description: "Explore our complete collection of free browser-based tools. All tools work directly in your browser with no uploads required for complete privacy.",
  keywords: "free online tools, browser tools, all tools, web utilities, online utilities, free software alternatives",
};

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
