import HeroSection from "@/components/hero-section"
import QRCodeGenerator from "./components/qr-code-generator"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "@/components/security-section"
import Footer from "@/components/footer"
import { QrCode, Download } from "lucide-react"

export default function QRCodeGeneratorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection
        title="Free Online QR Code"
        titleHighlight="Generator"
        description="Create custom QR codes for URLs, text, and more. Customize, download, and share your QR codes instantly. No sign-up required."
        badge="Free QR Code Generator"
        primaryButtonText="Generate QR Code"
        secondaryButtonText="Learn More"
        primaryButtonIcon={<QrCode className="h-5 w-5" />}
        secondaryButtonIcon={<Download className="h-5 w-5" />}
        primaryButtonHref="#qr-code-generator"
        secondaryButtonHref="#features"
      />

      <section id="qr-code-generator" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">QR Code Generator</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Enter your text or URL below to generate a QR code. Customize the appearance and download your QR code in
              various formats.
            </p>
          </div>
          <QRCodeGenerator />
        </div>
      </section>

      <FeatureSection />
      <ToolGuide />
      <FaqSection />
      <SecuritySection />
      <Footer />
    </main>
  )
}
