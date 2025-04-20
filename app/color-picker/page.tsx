import HeroSection from "@/components/hero-section"
import SecuritySection from "@/components/security-section"
import ColorPicker from "./components/color-picker"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import Footer from "@/components/footer"
import { Palette, Eye } from "lucide-react"

export default function ColorPickerPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection
        title="Free Online Color Picker"
        titleHighlight="Tool"
        description="Select, convert, and save colors in RGB, HEX, and HSL formats. Copy color codes with one click and create your own color palettes."
        badge="Color Selection Tool"
        primaryButtonText="Pick Colors"
        secondaryButtonText="View Features"
        primaryButtonIcon={<Palette className="h-5 w-5" />}
        secondaryButtonIcon={<Eye className="h-5 w-5" />}
        primaryButtonHref="#color-picker"
        secondaryButtonHref="#features"
      />

      <section id="color-picker" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <ColorPicker />
        </div>
      </section>

      <section id="features" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <FeatureSection />
        </div>
      </section>

      <section className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <ToolGuide />
        </div>
      </section>

      <section className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <FaqSection />
        </div>
      </section>

      <section className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <SecuritySection />
        </div>
      </section>

      <Footer />
    </main>
  )
}
