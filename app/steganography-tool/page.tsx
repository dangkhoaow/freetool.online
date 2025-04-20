import HeroSection from "@/components/hero-section"
import SecuritySection from "./components/security-section"
import SteganographyTool from "./components/steganography-tool"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import Footer from "@/components/footer"
import { ImageIcon, FileText } from "lucide-react"

export default function SteganographyToolPage() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <HeroSection
        title="Hide Secret Messages with"
        titleHighlight="Steganography"
        description="Securely hide text within images using advanced steganography techniques. Encode and decode messages without visible changes to your images. 100% private and works offline."
        badge="Privacy-Focused Steganography"
        primaryButtonText="Start Hiding Messages"
        secondaryButtonText="Learn How It Works"
        primaryButtonIcon={<ImageIcon className="h-5 w-5" />}
        secondaryButtonIcon={<FileText className="h-5 w-5" />}
        primaryButtonHref="#steganography-tool"
        secondaryButtonHref="#tool-guide"
      />

      {/* Main Steganography Tool */}
      <section id="steganography-tool" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <SteganographyTool />
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <FeatureSection />
        </div>
      </section>

      {/* Security Section */}
      <section className="py-12 px-4 md:py-16 bg-white">
        <div className="container mx-auto max-w-7xl">
          <SecuritySection />
        </div>
      </section>

      {/* Tool Guide */}
      <section id="tool-guide" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <ToolGuide />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 md:py-16 bg-white">
        <div className="container mx-auto max-w-7xl">
          <FaqSection />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
