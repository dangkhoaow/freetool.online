import ConverterTool from "./components/converter-tool"
import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import AiFeatures from "@/components/ai-features"
import ToolGuide from "./components/tool-guide"
import FormatComparison from "@/components/format-comparison"
import FaqSection from "./components/faq-section"
import SecuritySection from "./components/security-section"

export const metadata = {
  title: "HEIC to JPG Converter | Free Online HEIC Converter Tool",
  description: "Convert HEIC photos to JPG, PNG, WEBP, or PDF formats online for free. AI-powered optimization for smaller file sizes without quality loss.",
}

export default function HeicConverterPage() {
  // Function to scroll to converter section
  const scrollToConverter = () => {
    const converterSection = document.getElementById('converter');
    if (converterSection) {
      converterSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Function to scroll to AI features section
  const scrollToAiFeatures = () => {
    const aiSection = document.getElementById('ai-features');
    if (aiSection) {
      aiSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        title="HEIC Converter Tool with"
        titleHighlight="AI Optimization"
        description="Transform your HEIC images to JPG, PNG, WEBP, or PDF with our advanced AI-powered converter. Get smaller file sizes without sacrificing quality."
        badge="AI-Powered Image Conversion"
        primaryButtonText="Start Converting"
        secondaryButtonText="Learn About AI Features"
        primaryButtonHref="#converter"
        secondaryButtonHref="#ai-features"
      />

      {/* Main Converter Tool */}
      <section id="converter" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <ConverterTool />
        </div>
      </section>

      {/* AI Features Section */}
      <AiFeatures />

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
