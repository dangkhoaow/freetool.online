import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import PdfToolsSection from "./components/pdf-tools-section"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "@/components/security-section"
import { FileText } from "lucide-react"

export default function PdfToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        title="All-in-One PDF Tools"
        titleHighlight="Free & Online"
        description="Powerful browser-based PDF tools to merge, split, compress, and convert your PDF files. No software installation required, 100% secure and private."
        badge="Multiple PDF Tools in One"
        primaryButtonText="Start Using PDF Tools"
        secondaryButtonText="Explore Features"
        primaryButtonIcon={<FileText className="h-5 w-5" />}
        primaryButtonHref="#pdf-tools"
        secondaryButtonHref="#features"
      />

      {/* Main PDF Tools Section */}
      <section id="pdf-tools" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <PdfToolsSection />
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />

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
