"use client"

import HeroSection from "@/components/hero-section"
import ConverterTool from "@/components/converter-tool"
import AiFeatures from "@/components/ai-features"
import ToolGuide from "@/components/tool-guide"
import FormatComparison from "@/components/format-comparison"
import FaqSection from "@/components/faq-section"
import SecuritySection from "@/components/security-section"
import Footer from "@/components/footer"

export default function Home() {
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
        primaryButtonText="Start Converting"
        secondaryButtonText="Learn About AI Features"
        onPrimaryButtonClick={scrollToConverter}
        onSecondaryButtonClick={scrollToAiFeatures}
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

