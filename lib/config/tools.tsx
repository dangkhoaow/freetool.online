import { 
  ArrowRight, 
  Image, 
  Film, 
  FileType, 
  Zap, 
  Shield, 
  Palette, 
  Code, 
  QrCode, 
  Ruler, 
  CheckSquare, 
  FileArchive, 
  Eye, 
  MessageSquare, 
  Flame,
  BarChart3,
  Video,
  Camera,
  Pen,
  Layout
} from "lucide-react";
import React from "react";

export interface ToolConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  category: string;
  href: string;
  isHot?: boolean;
  isNew?: boolean;
}

// Define tool categories for filtering
export const categories = [
  { id: "all", name: "All Tools" },
  { id: "file", name: "File Processing" },
  { id: "image", name: "Image Tools" },
  { id: "text", name: "Text & Code" },
  { id: "utility", name: "Utilities" },
];

// Define all tools with their categories
export const tools: ToolConfig[] = [
  {
    id: "private-ai-chat",
    title: "Private AI Chat",
    description: "Chat with AI that runs entirely in your browser. No data sent to servers, ensuring complete privacy.",
    icon: <MessageSquare className="h-16 w-16" stroke="#2563eb" />,
    color: "from-blue-50 to-purple-50",
    textColor: "text-blue-600",
    category: "utility",
    href: "/private-ai-chat",
    isHot: true,
  },
  {
    id: "video-transcoder",
    title: "Video Transcoder",
    description: "Convert, trim, split, and merge videos directly in your browser. No upload needed for complete privacy.",
    icon: <Film className="h-16 w-16" stroke="#0891b2" />,
    color: "from-cyan-50 to-blue-50",
    textColor: "text-cyan-600",
    category: "file",
    href: "/video-transcoder",
    isNew: true,
  },
  {
    id: "heic-converter",
    title: "HEIC Converter",
    description: "Convert HEIC images from your iPhone to JPG, PNG, WEBP, or PDF formats with our AI-powered optimization.",
    icon: <Image className="h-16 w-16" stroke="#3b82f6" />,
    color: "from-blue-50 to-cyan-50",
    textColor: "text-blue-500",
    category: "image",
    href: "/heic-converter",
    isHot: true,
  },
  {
    id: "code-editor",
    title: "Code Editor",
    description: "Write, run, and save JavaScript code directly in your browser. No installation required.",
    icon: <Code className="h-16 w-16" stroke="#2563eb" />,
    color: "from-blue-50 to-indigo-50",
    textColor: "text-blue-600",
    category: "text",
    href: "/code-editor",
  },
  {
    id: "color-picker",
    title: "Color Picker",
    description: "Select, convert, and save colors in RGB, HEX, and HSL formats. Copy color codes with one click.",
    icon: <Palette className="h-16 w-16" stroke="#ef4444" />,
    color: "from-red-50 to-yellow-50",
    textColor: "text-red-500",
    category: "utility",
    href: "/color-picker",
  },
  {
    id: "qr-code-generator",
    title: "QR Code Generator",
    description: "Create custom QR codes for URLs, text, and more. Customize, download, and share instantly.",
    icon: <QrCode className="h-16 w-16" stroke="#9333ea" />,
    color: "from-purple-50 to-blue-50",
    textColor: "text-purple-600",
    category: "utility",
    href: "/qr-code-generator",
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between different units of measurement. Supports length, weight, temperature, and more.",
    icon: <Ruler className="h-16 w-16" stroke="#16a34a" />,
    color: "from-green-50 to-teal-50",
    textColor: "text-green-600",
    category: "utility",
    href: "/unit-converter",
  },
  {
    id: "todo-list",
    title: "Todo List",
    description: "A simple, effective way to manage your tasks with automatic saving to your browser.",
    icon: <CheckSquare className="h-16 w-16" stroke="#0891b2" />,
    color: "from-cyan-50 to-blue-50",
    textColor: "text-cyan-600",
    category: "utility",
    href: "/todo-list",
  },
  {
    id: "font-generator",
    title: "Font Generator",
    description: "Design and customize text with different fonts, styles, and colors. Export as images.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#db2777"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-16 w-16"
      >
        <text x="3" y="18" fontSize="20" fontWeight="bold">A</text>
      </svg>
    ),
    color: "from-pink-50 to-purple-50",
    textColor: "text-pink-600",
    category: "text",
    href: "/font-generator",
  },
  {
    id: "steganography-tool",
    title: "Steganography Tool",
    description: "Hide secret messages within images using advanced steganography techniques. 100% private.",
    icon: <Eye className="h-16 w-16" stroke="#4f46e5" />,
    color: "from-indigo-50 to-blue-50",
    textColor: "text-indigo-600",
    category: "image",
    href: "/steganography-tool",
    isHot: true,
  },
  {
    id: "gif-to-frames",
    title: "GIF to Frames",
    description: "Extract individual frames from animated GIFs. Choose your output format and frames per second.",
    icon: <Film className="h-16 w-16" stroke="#a855f7" />,
    color: "from-purple-50 to-pink-50",
    textColor: "text-purple-500",
    category: "image",
    href: "/gif-to-frames",
    isHot: true,
  },
  {
    id: "pdf-tools",
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDF files with ease. Powerful PDF manipulation.",
    icon: <FileType className="h-16 w-16" stroke="#22c55e" />,
    color: "from-green-50 to-teal-50",
    textColor: "text-green-500",
    category: "file",
    href: "/pdf-tools",
    isHot: true,
  },
  {
    id: "zip-compressor",
    title: "Zip Compressor",
    description: "Compress folders online, reduce zip file size, and secure files with password protection.",
    icon: <FileArchive className="h-16 w-16" stroke="#f59e0b" />,
    color: "from-amber-50 to-yellow-50",
    textColor: "text-amber-500",
    category: "file",
    href: "/zip-compressor",
    isHot: true,
  },
  {
    id: "ai-data-visualization",
    title: "AI Data Visualization",
    description: "Transform your data into beautiful charts and visualizations with AI assistance. No coding required.",
    icon: <BarChart3 className="h-16 w-16" stroke="#0d9488" />,
    color: "from-teal-50 to-green-50",
    textColor: "text-teal-600",
    category: "utility",
    href: "/ai-data-visualization",
    isNew: true,
  },
  {
    id: "privacy-media-recorder",
    title: "Privacy Media Recorder",
    description: "Record webcam, screen, and audio privately in your browser. No uploads, complete privacy with local processing.",
    icon: <Camera className="h-16 w-16" stroke="#7c3aed" />,
    color: "from-purple-50 to-indigo-50",
    textColor: "text-purple-600",
    category: "utility",
    href: "/privacy-media-recorder",
    isNew: true,
  },
  {
    id: "browser-design-studio",
    title: "Browser Design Studio",
    description: "Create professional graphics with our browser-based design suite. Vector editing, raster painting, text tools, and AI-enhanced features.",
    icon: <Pen className="h-16 w-16" stroke="#e11d48" />,
    color: "from-pink-50 to-purple-50",
    textColor: "text-pink-600",
    category: "image",
    href: "/browser-design-studio",
    isNew: true,
  },
  {
    id: "client-site-builder",
    title: "Client Site Builder",
    description: "Build professional websites with our drag-and-drop site builder. Entirely browser-based with privacy-first offline storage.",
    icon: <Layout className="h-16 w-16" stroke="#8b5cf6" />,
    color: "from-purple-50 to-indigo-50",
    textColor: "text-purple-600",
    category: "utility",
    href: "/client-site-builder"
  },
];
