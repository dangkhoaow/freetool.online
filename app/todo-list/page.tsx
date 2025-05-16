import TodoList from "./components/todo-list"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "../../components/security-section"
import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"
import { CheckSquare, List, FolderKanban } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

      <section className="py-6 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-2xl font-bold mb-4">Try Our Project Management Tool</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Need more robust task management? Use our project management tool to organize tasks by project, set priorities, and collaborate with your team.
          </p>
          <Link href="/todo-list/projects" passHref>
            <Button className="flex items-center mx-auto gap-2">
              <FolderKanban className="h-5 w-5" />
              Manage Projects
            </Button>
          </Link>
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
