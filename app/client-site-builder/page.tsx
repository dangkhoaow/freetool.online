import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import SecuritySection from "./components/security-section"
import FaqSection from "./components/faq-section"
import FeatureSection from "./components/features-section"
import SiteBuilderTool from "./components/site-builder-tool"
import ToolGuide from "./components/tool-guide"

export const metadata = {
  title: "Client Site Builder | Free Browser-Based Website Creator",
  description:
    "Create professional websites entirely in your browser with our privacy-focused site builder. Drag-and-drop interface, offline-first, and AI-assisted design. No data ever leaves your device.",
}

export default function ClientSiteBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <HeroSection
        title="Browser-Based Website Builder with"
        titleHighlight="Privacy Focus"
        description="Build professional websites directly in your browser with drag-and-drop tools, AI assistance, and zero server uploads. Your data stays on your device."
        badge="Privacy-First Site Builder"
        primaryButtonText="Start Building"
        secondaryButtonText="View Features"
        primaryButtonHref="#builder"
        secondaryButtonHref="#features"
      />

      {/* Main Builder Tool */}
      <section id="builder" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <SiteBuilderTool />
        </div>
      </section>

      {/* Features Section */}
      <section id="features">
        <FeatureSection />
      </section>

      {/* Tool Guide */}
      <ToolGuide />

      {/* FAQ Section */}
      <FaqSection />

      {/* Security Section */}
      <SecuritySection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
