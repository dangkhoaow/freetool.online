import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import CompressorTool from "./components/compressor-tool"
import FeatureSection from "./components/feature-section"
import FaqSection from "./components/faq-section"
import ToolGuide from "./components/tool-guide"
import SecuritySection from "./components/security-section"
import { FileArchive, Zap } from "lucide-react"

export default function ZipCompressorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        title="Free Online Zip Compressor"
        titleHighlight="Reduce File Size"
        description="Compress folders online with our free zip file compressor. Reduce zip file size, secure files with password protection, and simplify file management."
        badge="Efficient Compression"
        primaryButtonText="Start Compressing"
        secondaryButtonText="Learn How It Works"
        primaryButtonIcon={<FileArchive className="h-5 w-5" />}
        secondaryButtonIcon={<Zap className="h-5 w-5" />}
        primaryButtonHref="#compressor"
        secondaryButtonHref="#guide"
      />

      {/* Main Compressor Tool */}
      <section id="compressor" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <CompressorTool />
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />

      {/* Tool Guide */}
      <ToolGuide />

      {/* Security Section */}
      <SecuritySection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
