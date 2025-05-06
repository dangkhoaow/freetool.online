import VSCodeEditor from "./components/vs-code-editor"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "../../components/security-section"
import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"
import { Code, Play } from "lucide-react"

export default function CodeEditorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        title="Online VS Code-Like"
        titleHighlight="Editor"
        description="Write, run, and save code with a VS Code-like experience directly in your browser. No installation required."
        badge="Advanced Code Editor"
        primaryButtonText="Start Coding"
        secondaryButtonText="Run Code"
        primaryButtonIcon={<Code className="h-5 w-5" />}
        secondaryButtonIcon={<Play className="h-5 w-5" />}
        primaryButtonHref="#editor"
        secondaryButtonHref="#editor"
      />

      {/* Main Content */}
      <section id="editor" className="py-12 px-4 md:py-16">
        <div className="container mx-auto">
          <VSCodeEditor />
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <FeatureSection />
        </div>
      </section>

      {/* Tool Guide */}
      <section className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <ToolGuide />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <FaqSection />
        </div>
      </section>

      {/* Security Section */}
      <section className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <SecuritySection />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
