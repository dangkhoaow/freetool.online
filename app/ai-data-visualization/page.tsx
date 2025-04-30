import { Suspense } from "react"
import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "./components/security-section"
import DataVisualizationTool from "./components/visualization-tool"
import FeaturesSection from "./components/features-section"
import ProcessingSection from "./components/processing-section"

export default function AIDataVisualizationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <HeroSection
        title="AI Data Visualization with"
        titleHighlight="100% Private Processing"
        description="Transform your raw data into beautiful charts and insights with our AI-powered visualization tool. All processing happens locally in your browser - no data ever leaves your device."
        badge="Local AI-Powered Visualization"
        primaryButtonText="Start Visualizing"
        secondaryButtonText="Learn About Privacy"
        primaryButtonHref="#visualization-tool"
        secondaryButtonHref="#security"
      />

      {/* Main Visualization Tool */}
      <section id="visualization-tool" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <Suspense fallback={<div>Loading...</div>}>
            <DataVisualizationTool />
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
