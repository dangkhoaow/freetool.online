"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQSection() {
  const faqs = [
    {
      question: "Is this photo editor completely free to use?",
      answer:
        "Yes, our online photo editor is completely free to use with all core features available without any payment. We do not place watermarks on your exported images or limit the number of exports.",
    },
    {
      question: "Are my photos uploaded to your servers?",
      answer:
        "No. All photo editing happens directly in your browser. Your images are never uploaded to our servers, ensuring complete privacy and security. This also means faster editing since there's no upload/download time.",
    },
    {
      question: "What is the maximum resolution supported?",
      answer:
        "Our editor supports up to 8K resolution (7680×4320 pixels). However, performance may vary depending on your device's capabilities and available memory. For the best experience with very large images, we recommend using a modern computer with sufficient RAM.",
    },
    {
      question: "Can I use this editor on mobile devices?",
      answer:
        "Yes, our editor works on mobile devices, but the full feature set is optimized for desktop use. Some advanced tools may be harder to use on smaller screens. For basic edits, the mobile experience works well.",
    },
    {
      question: "Does the editor support PSD files?",
      answer:
        "Currently, we don't support importing or exporting PSD (Photoshop) files directly. However, you can import common image formats like PNG, JPEG, and WebP, and export to these formats as well as SVG for vector elements.",
    },
    {
      question: "How do I save my work in progress?",
      answer:
        "Currently, the editor doesn't support saving work in progress to resume later. We recommend completing your editing session in one go and exporting the final result. This feature is on our roadmap for future updates.",
    },
    {
      question: "Can I remove backgrounds from images?",
      answer:
        "Yes, our editor includes background removal tools. You can use the Magic Wand tool to select the background based on color similarity, or use the selection tools to manually define the background area you want to remove.",
    },
    {
      question: "What browsers are supported?",
      answer:
        "Our photo editor works best on modern browsers like Chrome, Firefox, Edge, and Safari (latest versions). We recommend using an up-to-date browser for the best performance and to ensure all features work correctly.",
    },
  ]

  return (
    <section id="faq" className="py-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
