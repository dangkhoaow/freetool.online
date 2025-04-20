import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  const faqs = [
    {
      question: "What is the Font Generator tool?",
      answer:
        "The Font Generator is a free online tool that allows you to create custom styled text and export it as an image. You can customize font properties like family, size, weight, and style, as well as add colors, shadows, and backgrounds to create unique text designs.",
    },
    {
      question: "Can I use the generated text images commercially?",
      answer:
        "Yes, all text images you create with our Font Generator are free to use for both personal and commercial purposes. There are no licensing restrictions on the output images.",
    },
    {
      question: "What font families are available in the generator?",
      answer:
        "The Font Generator includes a variety of web-safe fonts like Arial, Verdana, Georgia, Times New Roman, and more. These fonts are widely supported across different devices and platforms, ensuring your text appears consistently.",
    },
    {
      question: "How do I save my font settings for future use?",
      answer:
        "You can save your current font settings as a preset by entering a name in the preset field and clicking the Save button. Your presets are stored in your browser's local storage and will be available when you return to the tool.",
    },
    {
      question: "Can I use the Font Generator offline?",
      answer:
        "Yes, once the page has loaded, all processing happens in your browser. You can use the Font Generator without an internet connection, allowing you to create and export text images anywhere.",
    },
    {
      question: "What image format does the tool export?",
      answer:
        "Currently, the Font Generator exports images in PNG format, which provides high quality and transparency support. This format is widely compatible with most applications and websites.",
    },
    {
      question: "Is there a limit to how much text I can style?",
      answer:
        "There's no strict character limit, but for best performance and visual quality, we recommend keeping your text reasonably concise. Very long texts might affect the tool's performance and may not fit well in the exported image.",
    },
    {
      question: "How can I create text with special effects like gradients or outlines?",
      answer:
        "Currently, the Font Generator supports solid colors and text shadows. For more advanced effects like gradients or outlines, you may need to use a dedicated image editing software with your exported text image.",
    },
    {
      question: "Will my text data be sent to any server?",
      answer:
        "No, all processing happens entirely in your browser. Your text and settings are not sent to any server, ensuring your data remains private and secure.",
    },
    {
      question: "Can I use custom fonts with the generator?",
      answer:
        "The Font Generator currently supports only web-safe fonts that are available in most browsers. Support for custom font uploads or integration with font libraries may be added in future updates.",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our Font Generator tool
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
