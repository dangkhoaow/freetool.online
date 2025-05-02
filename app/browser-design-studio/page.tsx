import { Suspense } from "react"
import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "./components/security-section"
import DesignStudioTool from "./components/design-studio-tool"
import FeaturesSection from "./components/features-section"
import ProcessingSection from "./components/processing-section"
import { Pen } from "lucide-react"

export const metadata = {
  title: "Browser Design Studio | Free Online Professional Graphics Suite",
  description:
    "Create professional graphics with our browser-based design studio. Vector editing, raster painting, text tools, and AI-enhanced features - all with zero server uploads.",
}

export default function BrowserDesignStudioPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <HeroSection
        title="Professional Design Studio in"
        titleHighlight="Your Browser"
        description="Create stunning graphics with our complete design suite. Vector drawing, raster editing, text tools, and AI assistance - all processed 100% client-side for total privacy."
        badge="Zero-Upload Design Tool"
        primaryButtonText="Start Designing"
        secondaryButtonText="See Features"
        primaryButtonIcon={<Pen className="h-5 w-5" />}
        primaryButtonHref="#design-studio"
        secondaryButtonHref="#features"
      />

      {/* Main Design Studio Tool */}
      <section id="design-studio">
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            <DesignStudioTool />
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Processing Section - How it works */}
      <ProcessingSection />

      {/* Tool Guide */}
      <ToolGuide />

      {/* Security Section */}
      <SecuritySection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
