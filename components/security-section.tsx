import { Shield, Lock, Eye, Cpu } from "lucide-react"

export default function SecuritySection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Security & Privacy</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your files and data are always secure with our browser-based conversion tools.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cpu className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Browser-Based</h3>
            <p className="text-gray-600">
              All processing happens locally in your browser. Your computer does the work, not our servers, keeping your data on your device.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Uploads</h3>
            <p className="text-gray-600">
              Your files are never uploaded to any server. All conversion happens directly in your browser, ensuring complete privacy.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Data Storage</h3>
            <p className="text-gray-600">
              We don't store your images or any data related to them. Once you close the browser tab, all processing data is automatically deleted.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Privacy Control</h3>
            <p className="text-gray-600">
              You have full control over your data. Our tools are designed with privacy-first architecture, ensuring your content remains private at all times.
            </p>
          </div>
        </div>
        
        <div className="mt-12 bg-green-50 p-6 rounded-xl max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-2 text-center">How Browser-Based Processing Protects You</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <div className="mr-2 mt-1">✓</div>
              <p>Your GIFs never travel across the internet - they stay within your browser</p>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1">✓</div>
              <p>No risk of server data breaches affecting your content</p>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1">✓</div>
              <p>Works even without internet connection once the page is loaded</p>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1">✓</div>
              <p>Conversion results are available immediately without waiting for server processing</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
