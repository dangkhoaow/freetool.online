"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-medium text-left dark:text-white">
              How is my data processed completely privately?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Our tool uses WebLLM technology to run an AI model directly in your browser. All data processing happens locally on your device, and your data is never sent to any external servers. This ensures complete privacy and security for your sensitive information.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-medium text-left dark:text-white">
              What file formats can I use for data input?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              You can upload CSV files, Excel spreadsheets (XLSX), or simply paste your data as text. The AI is designed to analyze and structure different data formats, including tabular data, JSON, and plain text with data points.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-medium text-left dark:text-white">
              What chart types are available for visualization?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Our tool supports a wide range of chart types including bar charts, line charts, pie charts, doughnut charts, polar area charts, radar charts, scatter plots, bubble charts, and stacked bar charts. The AI can also recommend the best chart type based on your data structure.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-medium text-left dark:text-white">
              Do I need a powerful computer to use the AI features?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              The tool is designed to work on most modern devices. It performs best on devices with WebGPU support (most up-to-date browsers on reasonably modern hardware). However, it will still function on less powerful devices, though the AI model loading and processing might take longer.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-lg font-medium text-left dark:text-white">
              Can I use this tool offline?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Yes! After the initial page load and AI model download, the tool functions entirely offline. You can create visualizations without an internet connection, making it perfect for working with sensitive data in secure environments.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-lg font-medium text-left dark:text-white">
              How do I save or share my visualizations?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              You can export your visualizations as PNG images by clicking the "Export as PNG" button in the chart view. The tool also automatically saves your recent visualizations in your browser's local storage, so you can access them later in the "Recent Charts" tab.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-lg font-medium text-left dark:text-white">
              How does the AI help with data visualization?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              The AI analyzes your raw data to identify patterns, structure, and relationships. It then transforms unstructured or semi-structured data into a format optimized for visualization. This includes identifying appropriate labels, datasets, and suggesting color schemes based on the selected chart type.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="text-lg font-medium text-left dark:text-white">
              Is there a limit to how much data I can visualize?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Since all processing happens in your browser, the practical limit depends on your device's capabilities. For optimal performance, we recommend datasets with up to a few thousand data points. Very large datasets may cause slower performance or memory limitations depending on your device.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
