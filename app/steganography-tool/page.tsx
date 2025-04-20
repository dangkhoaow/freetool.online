import HeroSection from "@/components/hero-section"
import SecuritySection from "@/components/security-section"
import SteganographyTool from "./components/steganography-tool"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import { Lock, ImageIcon, FileText } from "lucide-react"

export default function SteganographyToolPage() {
  return (
    <main className="flex flex-col min-h-screen">
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

      <div id="steganography-tool" className="container mx-auto px-4 py-12">
        <SteganographyTool />
      </div>

      <FeatureSection />

      <SecuritySection
        title="Your Privacy Is Our Priority"
        description="Our steganography tool processes everything locally in your browser. Your images and messages never leave your device."
        icon={<Lock className="h-12 w-12 text-blue-600" />}
      />

      <ToolGuide />

      <FaqSection />
    </main>
  )
}
