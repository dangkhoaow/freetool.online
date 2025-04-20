import { Download, Save, RefreshCw, Eye } from "lucide-react"

export default function ToolGuide() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How to Use the Resume Builder</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow these simple steps to create a professional resume in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Enter Personal Information</h3>
                <p className="text-gray-600 mb-4">
                  Start by filling in your personal details, including your name, contact information, and professional
                  summary.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Provide your full name, email, and phone number</li>
                  <li>Add your address and optional website or LinkedIn profile</li>
                  <li>Write a compelling professional summary that highlights your strengths</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Add Education</h3>
                <p className="text-gray-600 mb-4">
                  Include your educational background, starting with your most recent degree or certification.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Click "Add Education" to create a new entry</li>
                  <li>Enter your institution, degree, and field of study</li>
                  <li>Specify the start and end dates</li>
                  <li>Add a description of relevant coursework or achievements (optional)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Add Work Experience</h3>
                <p className="text-gray-600 mb-4">
                  Detail your work history, starting with your current or most recent position.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Click "Add Experience" to create a new entry</li>
                  <li>Enter the company name, your position, and location</li>
                  <li>Specify the start and end dates (or check "I currently work here")</li>
                  <li>
                    Describe your responsibilities and achievements using action verbs and quantifiable results when
                    possible
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">List Your Skills</h3>
                <p className="text-gray-600 mb-4">
                  Highlight your relevant skills and rate your proficiency level for each one.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Click "Add Skill" to create a new entry</li>
                  <li>Enter the skill name (e.g., JavaScript, Project Management)</li>
                  <li>Use the slider to indicate your proficiency level</li>
                  <li>Add both technical and soft skills relevant to your target position</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">5</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Choose a Template</h3>
                <p className="text-gray-600 mb-4">
                  Select a professional template that best represents your personal brand and industry.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Browse through the available templates</li>
                  <li>Click on a template to select it</li>
                  <li>Consider which template is most appropriate for your industry and career level</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">6</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Preview and Download</h3>
                <p className="text-gray-600 mb-4">
                  Review your resume and download it as a PDF file ready to share with employers.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Click "Preview" to see how your resume will look</li>
                  <li>Review all sections for accuracy and completeness</li>
                  <li>Click "Download PDF" to save your resume</li>
                  <li>Your resume data is automatically saved in your browser for future editing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Additional Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Save className="h-4 w-4 text-blue-600" /> Auto-Save Feature
              </h4>
              <p className="text-gray-600">
                Your resume data is automatically saved in your browser's localStorage. You can close the browser and
                return later to continue working on your resume.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600" /> Reset Option
              </h4>
              <p className="text-gray-600">
                If you want to start over, you can click the "Reset Form" button. This will clear all your data, so use
                with caution.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" /> Preview Mode
              </h4>
              <p className="text-gray-600">
                Use the preview mode to see exactly how your resume will look before downloading. You can switch back to
                edit mode if you need to make changes.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Download className="h-4 w-4 text-blue-600" /> PDF Format
              </h4>
              <p className="text-gray-600">
                Your resume is downloaded as a PDF file, which is the preferred format for job applications as it
                maintains formatting across all devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
