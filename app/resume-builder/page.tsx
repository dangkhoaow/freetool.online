import HeroSection from "@/components/hero-section"
import ResumeBuilder from "./components/resume-builder"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "@/components/security-section"
import { FileText, Download, Save } from "lucide-react"

export default function ResumeBuilderPage() {
  return (
    <main className="min-h-screen">
      <HeroSection
        title="Create Professional Resumes with"
        titleHighlight="Free Resume Builder"
        description="Build impressive resumes in minutes with our easy-to-use resume builder. Customize templates, add your information, and download as PDF. No sign-up required."
        badge="Professional Resume Builder"
        primaryButtonText="Start Building"
        secondaryButtonText="Learn More"
        primaryButtonIcon={<FileText className="h-5 w-5" />}
        secondaryButtonIcon={<Download className="h-5 w-5" />}
        primaryButtonHref="#resume-builder"
        secondaryButtonHref="#features"
      />
      <ResumeBuilder />
      <FeatureSection />
      <ToolGuide />
      <FaqSection />
      <SecuritySection
        title="Your Resume Data is Secure"
        description="All your resume information is stored locally on your device. We never store your personal data on our servers."
        features={[
          {
            title: "Local Storage Only",
            description: "Your resume data is saved in your browser's localStorage and never sent to our servers.",
            icon: <Save className="h-6 w-6" />,
          },
          {
            title: "Offline Functionality",
            description: "Create and download resumes even without an internet connection.",
            icon: <Download className="h-6 w-6" />,
          },
          {
            title: "No Account Required",
            description: "No need to create an account or provide personal information to use our resume builder.",
            icon: <FileText className="h-6 w-6" />,
          },
        ]}
      />
    </main>
  )
}
