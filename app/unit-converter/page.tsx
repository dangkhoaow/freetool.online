import HeroSection from "@/components/hero-section"
import { Zap, Ruler } from "lucide-react"
import UnitConverter from "./components/unit-converter"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "@/components/security-section"
import Footer from "@/components/footer"

export default function UnitConverterPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection
        title="Free Online Unit"
        titleHighlight="Converter Tool"
        description="Convert between different units of measurement with our free online unit converter. Supports length, weight, temperature, volume, area, and more. No signup required, works offline."
        badge="Instant Unit Conversion"
        primaryButtonText="Start Converting"
        secondaryButtonText="Learn More"
        primaryButtonIcon={<Ruler className="h-5 w-5" />}
        secondaryButtonIcon={<Zap className="h-5 w-5" />}
        primaryButtonHref="#converter"
        secondaryButtonHref="#features"
      />

      <section id="converter" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Unit Converter</h2>
          <UnitConverter />
        </div>
      </section>

      <FeatureSection />
      <ToolGuide />
      <FaqSection />
      <SecuritySection />
      <Footer />
    </main>
  )
}
