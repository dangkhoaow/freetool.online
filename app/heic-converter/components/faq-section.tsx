"use client"

export default function FaqSection() {
  const faqs = [
    {
      question: "What is a HEIC file?",
      answer: "HEIC (High Efficiency Image Container) is a file format for images that uses the HEIF (High Efficiency Image Format) standard. It was adopted by Apple in iOS 11 and macOS High Sierra as the default image format for storing photos, replacing JPEG. HEIC files offer better compression than JPEG while maintaining higher image quality."
    },
    {
      question: "Why should I convert HEIC to other formats?",
      answer: "While HEIC offers better quality and smaller file sizes, it's not universally supported. Converting to formats like JPG, PNG, or WEBP ensures compatibility with most devices, applications, websites, and services that may not support the newer HEIC format."
    },
    {
      question: "What's the difference between JPG, PNG, WEBP, and PDF formats?",
      answer: "JPG is widely compatible and good for photos but uses lossy compression. PNG supports transparency and uses lossless compression but creates larger files. WEBP offers excellent compression with good quality and transparency support but has less compatibility. PDF is a document format that preserves image quality and is ideal for printing or archiving multiple images."
    },
    {
      question: "How does the AI optimization work?",
      answer: "Our AI technology analyzes your images to apply smart enhancements. It optimizes compression based on image content, adjusts color and contrast, reduces noise, and sharpens details where needed. This results in better-looking images with smaller file sizes compared to standard conversion methods."
    },
    {
      question: "Is this converter completely free to use?",
      answer: "Yes, our HEIC converter is 100% free to use with no hidden fees or watermarks. There are no limits on the number of files you can convert, though there is a 50MB size limit per file."
    },
    {
      question: "Are my files secure when using this converter?",
      answer: "Absolutely. Your privacy and security are our top priorities. All file processing happens directly in your browser, and your files are never uploaded to or stored on our servers. Once you close the browser tab, all data is automatically deleted."
    },
    {
      question: "How many files can I convert at once?",
      answer: "You can convert up to 50 files at once with our batch processing feature. This limit helps ensure optimal performance and a smooth experience for all users."
    }
  ];

  return (
    <section id="faq" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
