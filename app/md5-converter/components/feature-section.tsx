import { Hash, Shield, Zap, Database, RotateCw, History } from "lucide-react"

export default function FeatureSection() {
  return (
    <section className="py-12 bg-gray-50 rounded-xl mb-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Hash className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Text to MD5 Conversion</h3>
            <p className="text-gray-600">
              Instantly convert any text string into its corresponding MD5 hash value with our fast and secure
              converter.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">MD5 to Text Lookup</h3>
            <p className="text-gray-600">
              Attempt to find the original text from an MD5 hash using our database of common words and phrases.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Client-Side Processing</h3>
            <p className="text-gray-600">
              All conversions happen directly in your browser. Your data never leaves your device, ensuring maximum
              privacy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Batch Processing</h3>
            <p className="text-gray-600">
              Convert multiple text strings to MD5 hashes simultaneously with our efficient batch processing feature.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <RotateCw className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Instant Results</h3>
            <p className="text-gray-600">
              Get immediate results with our high-performance converter, perfect for both small and large text inputs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Conversion History</h3>
            <p className="text-gray-600">
              Keep track of your recent conversions with our built-in history feature, making it easy to reference past
              results.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
