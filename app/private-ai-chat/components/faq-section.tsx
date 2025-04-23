"use client"

export default function FaqSection() {
  const faqs = [
    {
      question: "What is Private AI Chat and how does it protect my privacy?",
      answer:
        "Private AI Chat is the first browser-based tool that allows you to chat with AI language models running entirely on your device. Unlike traditional AI chat services like ChatGPT, your conversations never leave your computer, ensuring 100% privacy for sensitive or confidential information. We pioneered this approach to provide a secure alternative to server-based AI chat solutions.",
    },
    {
      question: "How does WebGPU-powered browser-based AI work?",
      answer:
        "Our innovative tool uses WebGPU technology to run optimized language models directly in your web browser. The AI models are downloaded to your device once and then executed locally using your computer's GPU for acceleration. This breakthrough approach enables private conversations without sending any data to external servers, while maintaining responsive performance comparable to cloud-based solutions.",
    },
    {
      question: "What AI models are available in this private browser chat?",
      answer:
        "We currently support state-of-the-art lightweight models including Gemma 2B (from Google) and Phi-3 Mini (from Microsoft) that have been specifically optimized for browser execution. These models deliver impressive performance while being efficient enough to run on consumer hardware. As the first browser-based private AI chat, we carefully select models that balance capability with local processing requirements.",
    },
    {
      question: "Is my private chat history securely saved?",
      answer:
        "Yes, your chat history is saved locally on your device using military-grade 256-bit encryption (via Web Crypto API) before being stored in your browser's IndexedDB. No conversation data is ever sent to our servers. You maintain complete control - you can clear your chat history at any time or export it for safekeeping. This zero-server approach guarantees maximum privacy for your sensitive conversations.",
    },
    {
      question: "What are the system requirements for the private AI chat?",
      answer:
        "For optimal performance with our WebGPU-accelerated private AI chat, we recommend using Chrome or Edge browser with hardware that supports WebGPU acceleration (most computers from 2017 onwards). The tool will work on most modern devices but may be slower on older hardware. You'll need at least 4GB of available system memory and a standard internet connection for the initial model download. After download, you can chat privately even offline.",
    },
    {
      question: "How does this private AI chat differ from ChatGPT or other AI services?",
      answer:
        "Unlike ChatGPT, Claude, or other traditional AI services that send your conversations to their servers for processing (raising significant privacy concerns), our tool runs entirely in your browser. Your data never leaves your device, providing complete privacy. While our models may not match the largest server-based solutions like GPT-4, they offer a truly private alternative with no usage limits, data collection, or subscription fees - perfect for sensitive conversations.",
    },
    {
      question: "Can I use this offline AI chat after loading the model?",
      answer:
        "Yes! Once you've downloaded a model, you can use our private AI chat entirely offline. The model files are cached in your browser, so you only need to download them once (unless you clear your browser cache or we update the models). This makes it perfect for secure conversations in environments without internet access or where network privacy is a concern.",
    },
    {
      question: "Is this WebGPU-powered private AI chat really free to use?",
      answer:
        "Yes, our Private AI Chat is completely free to use with no hidden costs, data collection, usage limits, or subscription fees. We pioneered this technology because we believe everyone deserves access to AI tools that respect their privacy. As the first and best browser-based private AI chat solution, we're committed to maintaining this free service while continuing to improve its capabilities.",
    },
    {
      question: "How fast is browser-based AI chat compared to server solutions?",
      answer:
        "Our WebGPU-accelerated private AI chat provides surprisingly responsive performance, generating responses in seconds rather than minutes. While the largest server models may be slightly faster, our local processing approach eliminates network latency and server queues. Most users find the modest speed difference is well worth the significant privacy benefits, especially for sensitive conversations where data security is paramount.",
    },
    {
      question: "What types of conversations are best for private browser-based AI chat?",
      answer:
        "Our private AI chat excels at handling sensitive conversations involving personal information, confidential business data, health information, financial details, or creative work you want to keep private. It's ideal for users concerned about data privacy, those working in regulated industries, or anyone who values keeping their conversations completely secure and local to their device without server processing.",
    },
  ]

  return (
    <section className="py-12 px-4 bg-white" id="private-ai-chat-faq">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-4">Frequently Asked Questions About Private AI Chat</h2>
        <p className="text-center text-gray-700 mb-12 max-w-3xl mx-auto">
          Everything you need to know about our revolutionary browser-based private AI chat tool powered by WebGPU
        </p>
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