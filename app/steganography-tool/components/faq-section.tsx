import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  const faqItems = [
    {
      question: "What is steganography?",
      answer:
        "Steganography is the practice of concealing information within other non-secret data or a physical object to avoid detection. In digital steganography, data is hidden within digital files such as images, audio, or video files.",
    },
    {
      question: "How does image steganography work?",
      answer:
        "Image steganography works by making subtle changes to the pixel data of an image that are imperceptible to the human eye. Our tool uses the Least Significant Bit (LSB) technique, which replaces the least significant bit of each color channel in each pixel with bits from your hidden message or file.",
    },
    {
      question: "What types of files can I hide in an image?",
      answer:
        "You can hide any type of file in an image, including text documents, PDFs, small images, or even executable files. However, the size of the file you can hide depends on the dimensions of the carrier image - larger images can hide more data.",
    },
    {
      question: "Is there a size limit for the files I can hide?",
      answer:
        "Yes, the size limit depends on the dimensions of the carrier image. Each pixel can store 3 bits of data (one in each RGB channel), so the maximum file size in bytes is approximately (width × height × 3) ÷ 8, minus some overhead for metadata. The tool will automatically calculate and display the maximum file size for your selected image.",
    },
    {
      question: "Will hiding data affect the image quality?",
      answer:
        "The LSB steganography technique makes changes that are imperceptible to the human eye. However, the encoded image is saved as a PNG to prevent data loss, which might increase the file size compared to compressed formats like JPEG.",
    },
    {
      question: "Is steganography secure?",
      answer:
        "Basic steganography hides the existence of the message but doesn't encrypt it. For sensitive information, we recommend encrypting your data before hiding it. Remember that steganography is about hiding the existence of data, not necessarily securing it against targeted analysis.",
    },
    {
      question: "Can I use this tool offline?",
      answer:
        "Yes, once the page has loaded, the tool works entirely in your browser and doesn't require an internet connection. All processing happens locally on your device.",
    },
    {
      question: "Where are my steganographic images stored?",
      answer:
        "Your images are stored in your browser's localStorage, which means they're only accessible on the device and browser you used to create them. They're not uploaded to any server or cloud storage.",
    },
  ]

  return (
    <section className="py-16 bg-gray-50" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn more about steganography and how our tool works.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index + 1}`} className="bg-white rounded-lg border">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">{item.question}</AccordionTrigger>
                <AccordionContent className="px-6 pb-4">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
