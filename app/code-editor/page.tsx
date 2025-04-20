import CodeEditor from "./components/code-editor"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "../../components/security-section"

export default function CodeEditorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Online JavaScript Code Editor</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Write, run, and save JavaScript code directly in your browser. No installation required.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <CodeEditor />
        </div>
      </section>

      {/* Feature Section */}
      <FeatureSection />

      {/* Tool Guide */}
      <ToolGuide />

      {/* FAQ Section */}
      <FaqSection />

      {/* Security Section */}
      <SecuritySection />
    </main>
  )
}
