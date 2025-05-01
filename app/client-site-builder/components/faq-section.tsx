"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Common questions about our browser-based website builder
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left text-lg font-medium dark:text-white">
              Is this really 100% browser-based with no server processing?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Yes! Our Client Site Builder runs entirely in your web browser. All the processing happens locally
              on your device, and your data is stored in your browser's built-in database (IndexedDB). None of
              your work is sent to our servers unless you explicitly choose to share or publish it.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left text-lg font-medium dark:text-white">
              How does the AI-assisted design work without sending data to servers?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              We use TensorFlow.js and WebAssembly to run lightweight AI models directly in your browser.
              These models are downloaded once when you load the tool, then run locally for tasks like
              generating text content, suggesting layouts, and optimizing designs. This approach ensures
              privacy while still providing smart assistance.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left text-lg font-medium dark:text-white">
              What happens if I lose internet connection while building my site?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              Our tool is designed as a Progressive Web App (PWA) with offline-first capabilities. Your work
              is continuously saved to your browser's local storage, so you can keep working even if your
              connection drops. When you reconnect, any cached resources that need updating will sync
              automatically.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left text-lg font-medium dark:text-white">
              How do I collaborate with team members if everything is local?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              We use peer-to-peer WebRTC connections and Conflict-free Replicated Data Types (CRDTs) to enable
              direct collaboration between team members without requiring server storage. When you share a project,
              it creates a secure peer connection that synchronizes changes in real-time while maintaining
              data privacy.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left text-lg font-medium dark:text-white">
              What type of websites can I build with this tool?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              You can build a wide variety of static websites including personal portfolios, business sites, 
              landing pages, blogs, event sites, and product showcases. The tool includes pre-designed components
              for common sections like headers, hero sections, feature grids, testimonials, pricing tables,
              contact forms, and more that you can customize to fit your needs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left text-lg font-medium dark:text-white">
              How do I publish my website once it's finished?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-300">
              When your site is ready, you can export it as clean, optimized HTML, CSS, and JavaScript files
              packaged in a ZIP archive. These files can then be uploaded to any web hosting service like GitHub
              Pages, Netlify, Vercel, or traditional web hosts. We also provide one-click deployment options for
              popular hosting platforms while still maintaining your privacy.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
