import HeroSection from "@/components/hero-section"
import { Zap, Ruler } from "lucide-react"
import UnitConverter from "./components/unit-converter"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "@/components/security-section"

export default function UnitConverterPage() {
  return (
    <main className="min-h-screen bg-white">
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

      <section id="converter" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Unit Converter</h2>
          <UnitConverter />
        </div>
      </section>

      <FeatureSection />
      <ToolGuide />
      <FaqSection />
      <SecuritySection
        title="Secure Unit Conversion"
        description="Our unit converter tool processes all conversions directly in your browser. No data is sent to our servers, ensuring complete privacy and security."
        features={[
          "All conversions happen locally in your browser",
          "No data is sent to our servers",
          "Works offline after initial page load",
          "No account or login required",
          "No tracking of your conversion history on our end",
          "Open source conversion formulas for transparency",
        ]}
      />
    </main>
  )
}
