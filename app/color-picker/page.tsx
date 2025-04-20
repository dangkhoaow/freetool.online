import HeroSection from "@/components/hero-section"
import SecuritySection from "@/components/security-section"
import ColorPicker from "./components/color-picker"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"

export default function ColorPickerPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection
        title="Free Online Color Picker Tool"
        description="Select, convert, and save colors in RGB, HEX, and HSL formats. Copy color codes with one click and create your own color palettes."
        imageUrl="/vibrant-color-selection.png"
      />

      <ColorPicker />

      <FeatureSection />

      <ToolGuide />

      <FaqSection />

      <SecuritySection
        title="Privacy & Security"
        description="Our color picker tool operates entirely in your browser. Your color data and preferences are stored locally on your device."
        features={[
          "No data is sent to our servers",
          "Your favorite colors are saved only in your browser's localStorage",
          "Works offline once the page is loaded",
        ]}
      />
    </main>
  )
}
