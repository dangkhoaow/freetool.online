import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"
import MediaRecorderTool from "./components/media-recorder-tool"
import FeaturesSection from "./components/features-section"
import SecuritySection from "./components/security-section"
import FaqSection from "./components/faq-section"
import ToolGuide from "./components/tool-guide"
import { Camera } from "lucide-react"

export default function PrivacyMediaRecorderPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <HeroSection
        title="Privacy Media Recorder with"
        titleHighlight="100% Local Processing"
        description="Record your webcam, screen, and audio directly in your browser. Complete privacy with zero uploads, local processing, and secure export options."
        badge="Privacy-First Recording"
        primaryButtonText="Start Recording"
        secondaryButtonText="Learn About Features"
        primaryButtonHref="#recorder"
        secondaryButtonHref="#features"
        primaryButtonIcon={<Camera className="h-5 w-5" />}
      />

      {/* Main Media Recorder Tool */}
      <section id="recorder" className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <MediaRecorderTool />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <FeaturesSection />
        </div>
      </section>

      {/* Tool Guide */}
      <section className="py-12 px-4 bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto max-w-6xl">
          <ToolGuide />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <FaqSection />
        </div>
      </section>

      {/* Security Section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl">
          <SecuritySection />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
