import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"
import TranscoderTool from "./components/transcoder-tool"
import FeaturesSection from "./components/features-section"
import SecuritySection from "./components/security-section"
import FaqSection from "./components/faq-section"
import ToolGuide from "./components/tool-guide"

export default function VideoTranscoderPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <HeroSection
        title="Video Transcoder with"
        titleHighlight="Browser GPU Acceleration"
        description="Convert video files to different formats directly in your browser. GPU-accelerated, private, and offline-capable with FFmpeg.wasm technology."
        badge="Local Video Processing"
        primaryButtonText="Start Converting"
        secondaryButtonText="Learn About Features"
        primaryButtonHref="#transcoder"
        secondaryButtonHref="#features"
      />

      {/* Main Transcoder Tool */}
      <section id="transcoder" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <TranscoderTool />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <FeaturesSection />
        </div>
      </section>

      {/* Tool Guide */}
      <section className="py-16 px-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto max-w-4xl">
          <ToolGuide />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl">
          <FaqSection />
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto max-w-4xl">
          <SecuritySection />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
