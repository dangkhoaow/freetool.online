"use client"

export default function FaqSection() {
  const faqs = [
    {
      question: "Are these PDF tools really free to use?",
      answer:
        "Yes, all our PDF tools are completely free to use with no hidden fees, watermarks, or limitations. There are no limits on the number of files you can process, though there is a 100MB size limit per file.",
    },
    {
      question: "Are my PDF files secure when using these tools?",
      answer:
        "Absolutely. Your privacy and security are our top priorities. All file processing happens directly in your browser, and your files are never uploaded to or stored on our servers. Once you close the browser tab, all data is automatically deleted.",
    },
    {
      question: "What's the maximum file size I can upload?",
      answer:
        "For PDF tools, the maximum file size is 100MB per file. For image to PDF conversion, the limit is 10MB per image file. These limits help ensure optimal performance and a smooth experience for all users.",
    },
    {
      question: "Can I merge PDFs with different page sizes?",
      answer:
        "Yes, our merge PDF tool can combine PDFs with different page sizes. The original dimensions of each page will be preserved in the merged document, ensuring that your content appears exactly as it did in the original files.",
    },
    {
      question: "How do I extract specific pages from a PDF?",
      answer:
        "Use our Split PDF tool and select the 'Extract page range' or 'Extract specific pages' option. You can then enter the page numbers you want to extract (e.g., '1-5' for a range or '1,3,5,7' for specific pages).",
    },
    {
      question: "Will compressing my PDF reduce its quality?",
      answer:
        "Our PDF compression tool offers different compression levels to balance file size and quality. The 'Low' setting will maintain higher quality with less compression, while 'High' will maximize compression but may reduce quality, especially for images within the PDF.",
    },
    {
      question: "How can I rotate specific pages in my PDF?",
      answer:
        "Our Rotate PDF tool allows you to rotate entire documents or specific pages. Simply upload your PDF, enter the page range you want to rotate (e.g., 'all', '1-5', or '2,4,6'), and select your preferred rotation angle (90°, 180°, or 270°). This is perfect for fixing scanned documents or adjusting page orientation.",
    },
    {
      question: "Can I convert multiple images to a single PDF?",
      answer:
        "Yes, our Image to PDF tool allows you to upload multiple images and convert them into a single PDF document. You can rearrange the order of the images before conversion, and each image will become a separate page in the PDF.",
    },
    {
      question: "What image formats are supported for the Image to PDF tool?",
      answer:
        "Our Image to PDF tool supports all common image formats, including JPG, PNG, GIF, BMP, and WEBP. This ensures compatibility with virtually any image file you might need to convert.",
    },
  ]

  return (
    <section id="faq" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
