"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section id="faq" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">
            Get answers to common questions about our GIF to frames converter.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does browser-based processing work?</AccordionTrigger>
            <AccordionContent>
              Our browser-based solution processes your GIF files entirely within your web browser using modern 
              Web APIs like Canvas and Web Workers. Your files never leave your device - no data is sent to our 
              servers, providing enhanced privacy and security. The tool decodes the GIF format, extracts individual 
              frames, and converts them to your selected format (PNG or JPG) all in the browser.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Are there any limitations to browser-based processing?</AccordionTrigger>
            <AccordionContent>
              While browser-based processing offers privacy benefits, it does have some limitations:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Processing large GIFs might be slower than server-based solutions</li>
                <li>Very large GIFs may cause memory issues in some browsers</li>
                <li>Advanced optimization features may be more limited</li>
                <li>Processing performance depends on your device's capabilities</li>
              </ul>
              For most GIFs, the browser-based solution works perfectly and provides the benefit of complete privacy.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>How do I extract frames from a GIF?</AccordionTrigger>
            <AccordionContent>
              Simply upload your GIF file, choose your desired settings (output format, extraction mode, etc.), and click "Start Conversion." Our tool will process the GIF and extract all frames according to your specifications. You can then download individual frames or all frames as a ZIP archive.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>What output formats are supported?</AccordionTrigger>
            <AccordionContent>
              Currently, our converter supports PNG and JPG output formats. PNG is recommended for preserving transparency and image quality, while JPG is more suitable for smaller file sizes. You can adjust the quality setting for JPG files to balance quality and file size.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I extract specific frames from a GIF?</AccordionTrigger>
            <AccordionContent>
              Yes, our tool offers three extraction modes:
              <ul className="list-disc pl-6 mt-2">
                <li>Extract all frames - Gets every frame from the GIF</li>
                <li>
                  Extract frames at interval - Choose to extract every Nth frame (e.g., every 5th frame)
                </li>
                <li>
                  Extract specific frames - Manually specify which frame numbers to extract (e.g., "1, 5, 10, 15")
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Is there a limit to the GIF file size I can convert?</AccordionTrigger>
            <AccordionContent>
              With browser-based processing, the main limitation is your device's memory and processing power.
              Very large files (over 100MB) might cause performance issues in some browsers. For optimal performance,
              we recommend keeping files under 50MB. There is also a practical limit of 15 files that can be processed
              in a single batch.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>How can I save the extracted frames?</AccordionTrigger>
            <AccordionContent>
              After conversion, you'll see a gallery of extracted frames. You can:
              <ul className="list-disc pl-6 mt-2">
                <li>Download individual frames by clicking the "Download" button under each frame</li>
                <li>Download all frames at once as a ZIP archive using the "Download All as ZIP" button</li>
              </ul>
              All downloads are generated directly in your browser and start immediately without server processing.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>Is this tool really free to use?</AccordionTrigger>
            <AccordionContent>
              Yes, our GIF to frames converter is completely free to use with no hidden fees or watermarks. There are no limitations on the number of conversions or downloads. Since processing happens directly in your browser, we don't incur server costs for processing your files, allowing us to provide this tool at no cost.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
