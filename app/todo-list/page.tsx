import TodoList from "./components/todo-list"
import FeatureSection from "./components/feature-section"
import ToolGuide from "./components/tool-guide"
import FaqSection from "./components/faq-section"
import SecuritySection from "../../components/security-section"

export default function TodoListPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Free Online Todo List</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A simple, effective way to manage your tasks. Create, complete, and delete tasks with automatic saving to
            your browser.
          </p>
        </div>

        <div className="mb-16">
          <TodoList />
        </div>

        <FeatureSection />
        <ToolGuide />
        <FaqSection />
        <SecuritySection />
      </div>
    </main>
  )
}
