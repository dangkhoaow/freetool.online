import { Card, CardContent } from "@/components/ui/card"

export default function ToolGuide() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">How to Use</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Follow these simple steps to manage your tasks effectively.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 text-xl font-bold">1</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Add Tasks</h3>
            <p className="text-gray-600">
              Type your task in the input field and click the "Add Task" button or press Enter to add it to your list.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 text-xl font-bold">2</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Mark as Completed</h3>
            <p className="text-gray-600">
              Click the checkbox next to a task to mark it as completed. Completed tasks will be displayed with a
              strikethrough.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 text-xl font-bold">3</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Delete Tasks</h3>
            <p className="text-gray-600">
              Click the trash icon to remove a task from your list. This action cannot be undone, so be careful.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
