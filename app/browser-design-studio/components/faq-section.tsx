import React from "react"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FaqSection() {
  const faqs = [
    {
      question: "How is Browser Design Studio different from other online design tools?",
      answer: "Browser Design Studio processes everything locally in your browser without any server uploads. This provides total privacy, works offline after initial load, and eliminates the need for accounts or subscriptions. We use WebAssembly and WebGL to achieve performance comparable to desktop applications while running entirely in your browser."
    },
    {
      question: "Are my designs saved automatically?",
      answer: "Yes! Your designs are automatically saved to your browser's local storage (IndexedDB) every 30 seconds. You can also manually save at any time. Since everything is stored locally on your device, you can access your designs even when offline."
    },
    {
      question: "What file formats can I export my designs to?",
      answer: "Browser Design Studio supports exporting to SVG, PNG, JPG, PDF, Adobe Illustrator (AI), and CSS. Vector designs are best exported as SVG or AI, while raster designs work best as PNG or JPG. PDF is ideal for print materials, and CSS export is perfect for web developers looking to implement designs with code."
    },
    {
      question: "Can I import my existing design files?",
      answer: "Yes, you can import SVG files, raster images (PNG, JPG, WebP), and custom fonts (TTF, OTF, WOFF, WOFF2). Simply drag and drop your files onto the canvas or use the import option in the file menu. All imported files are processed locally in your browser, ensuring your assets remain private."
    },
    {
      question: "How do the AI tools work without uploading my data?",
      answer: "We use TensorFlow.js to run machine learning models directly in your browser. The AI models are downloaded once when you first use an AI feature, then run entirely on your device. This approach ensures your designs and prompts remain private while still providing powerful AI-enhanced capabilities."
    },
    {
      question: "What are the system requirements for Browser Design Studio?",
      answer: "Browser Design Studio works best in modern browsers like Chrome, Edge, or Firefox. For optimal performance, we recommend using a device with at least 4GB of RAM. GPU acceleration (WebGL) is used when available but not required. For AI features, WebGL support is recommended. The tool works on both desktop and tablet devices with sufficient screen space."
    },
    {
      question: "Can I collaborate with others on designs?",
      answer: "Yes, Browser Design Studio includes a WebRTC-based collaboration feature that enables real-time collaboration with peer-to-peer connections. This means you can collaborate without your designs ever passing through our servers. Simply generate a share link and send it to collaborators. Changes are synchronized in real-time while maintaining privacy."
    },
    {
      question: "Is Browser Design Studio free to use?",
      answer: "Yes, Browser Design Studio is completely free to use with no hidden fees or subscriptions. Since all processing happens on your device and we don't need to maintain expensive cloud infrastructure for design processing, we can offer this tool for free. We may introduce optional premium features in the future, but the core functionality will always remain free."
    },
    {
      question: "What happens if I clear my browser data? Will I lose my designs?",
      answer: "If you clear your browser data including IndexedDB/local storage, you will lose your saved designs. We recommend regularly exporting important designs to your local file system. In the future, we plan to add a feature to back up designs to your device's file system using the File System Access API."
    },
    {
      question: "Can I use Browser Design Studio on mobile devices?",
      answer: "Browser Design Studio is primarily designed for desktop and tablet use due to the precision required for design work and the screen space needed for the interface. While basic functionality may work on larger mobile devices, we recommend using a device with a larger screen and preferably a mouse or stylus for the best experience."
    },
  ]

  return (
    <section id="faq" className="py-16 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about Browser Design Studio and how it works.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 text-left text-base sm:text-lg font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-1 text-gray-600 dark:text-gray-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Have more questions? <a href="#" className="text-rose-600 dark:text-rose-400 hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </section>
  )
}
