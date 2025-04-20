import { CheckCircle, Save, Trash2, RefreshCw } from "lucide-react"
import FeatureCard from "@/components/feature-card"

export default function FeatureSection() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Features</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Our todo list tool offers everything you need to stay organized and productive.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          icon={<CheckCircle className="h-10 w-10 text-blue-500" />}
          title="Task Management"
          description="Easily add, complete, and delete tasks with a clean and intuitive interface."
        />

        <FeatureCard
          icon={<Save className="h-10 w-10 text-blue-500" />}
          title="Automatic Saving"
          description="Your tasks are automatically saved to your browser's local storage for persistence."
        />

        <FeatureCard
          icon={<Trash2 className="h-10 w-10 text-blue-500" />}
          title="Easy Cleanup"
          description="Remove completed tasks with a single click to keep your list organized."
        />

        <FeatureCard
          icon={<RefreshCw className="h-10 w-10 text-blue-500" />}
          title="Persistent Storage"
          description="Your todo list remains intact even when you close your browser or refresh the page."
        />
      </div>
    </section>
  )
}
