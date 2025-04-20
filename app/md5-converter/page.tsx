import ConverterTool from "./components/converter-tool"
import FeatureSection from "./components/feature-section"
import FaqSection from "./components/faq-section"
import ToolGuide from "./components/tool-guide"
import SecuritySection from "../../components/security-section"

export default function MD5ConverterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">MD5 Converter</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Securely convert text to MD5 hashes online or attempt to retrieve original text from MD5 hashes.
          </p>
        </div>

        <ConverterTool />
        <FeatureSection />
        <ToolGuide />
        <FaqSection />
        <SecuritySection />
      </div>
    </main>
  )
}
