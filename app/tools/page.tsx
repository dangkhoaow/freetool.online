import { Metadata } from "next";
import { ArrowRight, Image, Film, FileType, Zap, Shield, Palette, Code, QrCode, Ruler, CheckSquare, FileArchive, Eye, MessageSquare, Flame } from "lucide-react";
import Footer from "@/components/footer";
import ToolsGrid from "@/components/tools-grid";

export const metadata: Metadata = {
  title: "All Online Tools | FreeTool Online",
  description: "Browse our complete collection of free, browser-based tools. Convert files, manipulate images, generate content, and more without installing any software.",
  keywords: "free online tools, browser tools, all tools, web utilities, online utilities, free software alternatives",
};

// Define tool categories for filtering
const categories = [
  { id: "all", name: "All Tools" },
  { id: "file", name: "File Processing" },
  { id: "image", name: "Image Tools" },
  { id: "text", name: "Text & Code" },
  { id: "utility", name: "Utilities" },
];

// Define all tools with their categories
const allTools = [
  {
    id: "private-ai-chat",
    title: "Private AI Chat",
    description: "Chat with AI that runs entirely in your browser. No data sent to servers, ensuring complete privacy.",
    icon: <MessageSquare className="h-16 w-16 text-blue-600" />,
    color: "from-blue-50 to-purple-50",
    textColor: "text-blue-600",
    category: "utility",
    isHot: true,
  },
  {
    id: "heic-converter",
    title: "HEIC Converter",
    description: "Convert HEIC images from your iPhone to JPG, PNG, WEBP, or PDF formats with our AI-powered optimization.",
    icon: <Image className="h-16 w-16 text-blue-500" />,
    color: "from-blue-50 to-cyan-50",
    textColor: "text-blue-500",
    category: "image",
    isHot: false,
  },
  {
    id: "code-editor",
    title: "Code Editor",
    description: "Write, run, and save JavaScript code directly in your browser. No installation required.",
    icon: <Code className="h-16 w-16 text-blue-600" />,
    color: "from-blue-50 to-indigo-50",
    textColor: "text-blue-600",
    category: "text",
    isHot: false,
  },
  {
    id: "color-picker",
    title: "Color Picker",
    description: "Select, convert, and save colors in RGB, HEX, and HSL formats. Copy color codes with one click.",
    icon: <Palette className="h-16 w-16 text-red-500" />,
    color: "from-red-50 to-yellow-50",
    textColor: "text-red-500",
    category: "utility",
    isHot: false,
  },
  {
    id: "qr-code-generator",
    title: "QR Code Generator",
    description: "Create custom QR codes for URLs, text, and more. Customize, download, and share instantly.",
    icon: <QrCode className="h-16 w-16 text-purple-600" />,
    color: "from-purple-50 to-blue-50",
    textColor: "text-purple-600",
    category: "utility",
    isHot: false,
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between different units of measurement. Supports length, weight, temperature, and more.",
    icon: <Ruler className="h-16 w-16 text-green-600" />,
    color: "from-green-50 to-teal-50",
    textColor: "text-green-600",
    category: "utility",
    isHot: false,
  },
  {
    id: "todo-list",
    title: "Todo List",
    description: "A simple, effective way to manage your tasks with automatic saving to your browser.",
    icon: <CheckSquare className="h-16 w-16 text-cyan-600" />,
    color: "from-cyan-50 to-blue-50",
    textColor: "text-cyan-600",
    category: "utility",
    isHot: false,
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
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-pink-600"
      >
        <text x="3" y="18" fontSize="20" fontWeight="bold">A</text>
      </svg>
    ),
    color: "from-pink-50 to-purple-50",
    textColor: "text-pink-600",
    category: "text",
    isHot: false,
  },
  {
    id: "steganography-tool",
    title: "Steganography Tool",
    description: "Hide secret messages within images using advanced steganography techniques. 100% private.",
    icon: <Eye className="h-16 w-16 text-indigo-600" />,
    color: "from-indigo-50 to-blue-50",
    textColor: "text-indigo-600",
    category: "image",
    isHot: false,
  },
  {
    id: "gif-to-frames",
    title: "GIF to Frames",
    description: "Extract individual frames from animated GIFs. Choose your output format and frames per second.",
    icon: <Film className="h-16 w-16 text-purple-500" />,
    color: "from-purple-50 to-pink-50",
    textColor: "text-purple-500",
    category: "image",
    isHot: false,
  },
  {
    id: "pdf-tools",
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDF files with ease. Powerful PDF manipulation.",
    icon: <FileType className="h-16 w-16 text-green-500" />,
    color: "from-green-50 to-teal-50",
    textColor: "text-green-500",
    category: "file",
    isHot: false,
  },
  {
    id: "zip-compressor",
    title: "Zip Compressor",
    description: "Compress folders online, reduce zip file size, and secure files with password protection.",
    icon: <FileArchive className="h-16 w-16 text-amber-500" />,
    color: "from-amber-50 to-yellow-50",
    textColor: "text-amber-500",
    category: "file",
    isHot: false,
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-4 text-center dark:text-white">All Online Tools</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-center mb-12">
            Browse our complete collection of free, browser-based tools. All our tools run entirely in your browser, ensuring privacy and speed.
          </p>

          {/* Interactive Tools Grid with Categories */}
          <ToolsGrid tools={allTools} categories={categories} />

          {/* Category Sections for SEO */}
          <div className="mt-16 space-y-12">
            {categories.filter(c => c.id !== "all").map((category) => (
              <section key={category.id} id={category.id} className="pt-8">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2 dark:text-white dark:border-gray-700">{category.name}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTools
                    .filter((tool) => tool.category === category.id)
                    .map((tool) => (
                      <div 
                        key={tool.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md flex flex-col relative"
                      >
                        {tool.isHot && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                            <Flame className="h-3 w-3 mr-1" />
                            HOT
                          </div>
                        )}
                        <div className={`h-40 bg-gradient-to-r ${tool.color} dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center`}>
                          {tool.icon}
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex-grow">
                            <h3 className="text-xl font-bold mb-2 dark:text-white">{tool.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                              {tool.description}
                            </p>
                          </div>
                          <div className="mt-4">
                            <a 
                              href={`/${tool.id}`} 
                              className="inline-flex w-full justify-center items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
                              aria-label={`Use ${tool.title}`}
                            >
                              Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 