import TodoList from "./components/todo-list"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "../../components/security-section"
import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"
import { CheckSquare, List } from "lucide-react"

export default function TodoListPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection
        title="Free Online Todo"
        titleHighlight="List App"
        description="A simple, effective way to manage your tasks. Create, complete, and delete tasks with automatic saving to your browser."
        badge="Task Management Tool"
        primaryButtonText="Start Organizing"
        secondaryButtonText="View Features"
        primaryButtonIcon={<CheckSquare className="h-5 w-5" />}
        secondaryButtonIcon={<List className="h-5 w-5" />}
        primaryButtonHref="#todo-list"
        secondaryButtonHref="#features"
      />

      <section id="todo-list" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <TodoList />
        </div>
      </section>

      <section id="features" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <FeatureSection />
        </div>
      </section>

      <section className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <ToolGuide />
        </div>
      </section>

      <section className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <FaqSection />
        </div>
      </section>

      <section className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <SecuritySection />
        </div>
      </section>

      <Footer />
    </main>
  )
}
