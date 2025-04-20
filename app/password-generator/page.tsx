import { PasswordGenerator } from "./components/password-generator"
import { FeatureSection } from "./components/feature-section"
import { ToolGuide } from "./components/tool-guide"
import { FaqSection } from "./components/faq-section"
import { SecuritySection } from "@/components/security-section"

export default function PasswordGeneratorPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <section className="bg-gradient-to-b from-blue-50 to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">Secure Password Generator</h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Create strong, random passwords with our free online tool. Customize length and character types for
              maximum security.
            </p>
          </div>

          <PasswordGenerator />
        </div>
      </section>

      <FeatureSection />
      <ToolGuide />
      <FaqSection />
      <SecuritySection />
    </main>
  )
}
