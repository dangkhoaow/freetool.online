import { FileText, Download, Save, Clock, Layout, Shield } from "lucide-react"

export default function FeatureSection() {
  return (
    <section id="features" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Resume Builder Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our resume builder provides all the tools you need to create a professional resume that stands out to
            employers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Layout className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
            <p className="text-gray-600">
              Choose from a variety of professionally designed templates to make your resume stand out.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick and Easy</h3>
            <p className="text-gray-600">
              Create a professional resume in minutes with our intuitive and user-friendly interface.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">PDF Download</h3>
            <p className="text-gray-600">
              Download your resume as a high-quality PDF file that's ready to share with employers.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Save className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Auto-Save</h3>
            <p className="text-gray-600">
              Your resume data is automatically saved to your browser's localStorage, so you never lose your work.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Sections</h3>
            <p className="text-gray-600">
              Easily add and organize sections for personal information, education, work experience, and skills.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600">
              Your resume data never leaves your device. All processing happens locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
