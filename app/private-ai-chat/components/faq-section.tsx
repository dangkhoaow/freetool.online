"use client"

export default function FaqSection() {
  const faqs = [
    {
      question: "What is Private AI Chat?",
      answer:
        "Private AI Chat is a browser-based tool that allows you to chat with AI language models that run entirely on your device. Unlike traditional AI chat services, your data never leaves your computer, ensuring complete privacy for sensitive or confidential conversations.",
    },
    {
      question: "How does browser-based AI work?",
      answer:
        "Our tool uses WebGPU technology to run optimized language models directly in your web browser. The AI models are downloaded to your device once and then executed locally using your computer's GPU. This allows for private conversation without sending any data to external servers.",
    },
    {
      question: "What models are available?",
      answer:
        "We currently support lightweight but capable models like Gemma 2B (from Google) and Phi-3 Mini (from Microsoft) that have been optimized to run efficiently in browsers. These models provide good performance while being small enough to run on consumer hardware.",
    },
    {
      question: "Is my chat history saved?",
      answer:
        "Yes, your chat history is saved locally on your device using encrypted browser storage (IndexedDB with Web Crypto API). No data is sent to our servers. You can clear your chat history at any time or export it for safekeeping.",
    },
    {
      question: "What are the system requirements?",
      answer:
        "For optimal performance, we recommend using Chrome or Edge browser with hardware that supports WebGPU acceleration. The tool will work on most modern computers but may be slower on older hardware. You'll need at least 4GB of available system memory and a decent internet connection for the initial model download.",
    },
    {
      question: "How does this differ from ChatGPT or other AI services?",
      answer:
        "Traditional AI services send your conversations to their servers for processing, which can raise privacy concerns. Our tool runs entirely in your browser, so your data never leaves your device. While our models may not be as powerful as server-based solutions like GPT-4, they offer a privacy-focused alternative with no usage limits.",
    },
    {
      question: "Can I use this offline after loading the model?",
      answer:
        "Yes! Once you've downloaded a model, you can use it offline. The model files are cached in your browser, so you only need to download them once (unless you clear your browser cache or we update the models).",
    },
    {
      question: "Is this tool really free to use?",
      answer:
        "Yes, our Private AI Chat is completely free to use with no hidden costs, data collection, or usage limits. We believe everyone should have access to AI tools that respect their privacy.",
    },
  ]

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 transition-all hover:shadow-md"
            >
              <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 