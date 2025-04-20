import HeroSection from "@/components/hero-section"
import { FontGenerator } from "./components/font-generator"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "@/components/security-section"
import Footer from "@/components/footer"
import { Edit, Type } from "lucide-react"

export default function FontGeneratorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection
        title="Create Custom Text with"
        titleHighlight="Font Generator"
        description="Design and customize text with different fonts, styles, weights, and colors. Export your creations as images for social media, designs, or presentations."
        badge="Typography Tool"
        primaryButtonText="Start Designing"
        secondaryButtonText="Learn More"
        primaryButtonIcon={<Type className="h-5 w-5" />}
        secondaryButtonIcon={<Edit className="h-5 w-5" />}
        primaryButtonHref="#font-generator"
        secondaryButtonHref="#features"
      />

      <section id="font-generator" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <FontGenerator />
        </div>
      </section>

      <div id="features">
        <FeatureSection />
      </div>

      <ToolGuide />
      <FaqSection />
      <SecuritySection />
      <Footer />
    </main>
  )
}
