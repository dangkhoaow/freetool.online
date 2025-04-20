import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "@/components/security-section"
import FormatComparison from "./components/format-comparison"
import { Film } from "lucide-react"
import ConverterWrapper from "./components/converter-wrapper"

export default function GifToFramesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        title="GIF to Frames Converter"
        titleHighlight="Extract Every Frame"
        description="Convert animated GIFs to individual PNG or JPG frames with our free online tool. Extract every frame or select specific intervals for perfect results."
        badge="Browser-Based Processing"
        primaryButtonText="Start Converting"
        secondaryButtonText="Learn How It Works"
        primaryButtonIcon={<Film className="h-5 w-5" />}
        primaryButtonHref="#converter"
        secondaryButtonHref="#guide"
      />

      {/* Main Converter Tool */}
      <section id="converter" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <ConverterWrapper />
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />

      {/* Format Comparison */}
      <FormatComparison />

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
