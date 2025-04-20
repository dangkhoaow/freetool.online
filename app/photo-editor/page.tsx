import PhotoEditor from "./components/photo-editor"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FAQSection from "./components/faq-section"
import SecuritySection from "../components/security-section"

export default function PhotoEditorPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container py-8 space-y-12">
        <h1 className="text-4xl font-bold text-center">Professional Online Photo Editor</h1>
        <p className="text-xl text-center max-w-3xl mx-auto text-muted-foreground">
          Edit your photos with professional tools. Supports layers, adjustments, filters, and more. All processing
          happens in your browser, ensuring your photos stay private.
        </p>

        <PhotoEditor />

        <div className="space-y-16 mt-16">
          <FeatureSection />
          <ToolGuide />
          <FAQSection />
          <SecuritySection />
        </div>
      </div>
    </main>
  )
}
