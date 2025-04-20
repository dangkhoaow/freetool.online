import { ArrowRight } from "lucide-react"

export default function ToolGuide() {
  return (
    <section className="py-12 mb-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How to Use the MD5 Converter</h2>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-16 flex items-start justify-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Choose Conversion Direction</h3>
                <p className="text-gray-600 mb-4">
                  Select whether you want to convert text to an MD5 hash or attempt to look up the original text from an
                  MD5 hash.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Use the tabs at the top of the converter tool to switch between "Text to MD5" and "MD5 to Text"
                    modes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-16 flex items-start justify-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Enter Your Input</h3>
                <p className="text-gray-600 mb-4">
                  For text to MD5, type or paste the text you want to convert. For MD5 to text, enter the 32-character
                  MD5 hash.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">
                    <strong>Text to MD5:</strong> Any text string is acceptable, including spaces and special
                    characters.
                    <br />
                    <strong>MD5 to Text:</strong> Must be a valid 32-character hexadecimal string (0-9, a-f).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-16 flex items-start justify-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Convert or Look Up</h3>
                <p className="text-gray-600 mb-4">
                  Click the "Convert to MD5" or "Look Up Original Text" button to process your input.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">
                    For batch processing in Text to MD5 mode, check the "Batch Mode" option to convert each line
                    separately.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-16 flex items-start justify-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">View and Use Results</h3>
                <p className="text-gray-600 mb-4">
                  Your conversion results will appear below the input area. You can copy the results to your clipboard
                  with a single click.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">
                    For Text to MD5 conversions, your recent conversion history is saved locally on your device for easy
                    reference.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-600">Ready to convert your text to MD5 or look up an MD5 hash?</p>
              <p className="text-blue-600 font-medium flex items-center justify-center mt-2">
                Get started now <ArrowRight className="ml-2 h-4 w-4" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
