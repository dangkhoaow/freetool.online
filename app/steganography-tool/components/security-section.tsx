import { Shield, Lock, Server } from "lucide-react"

export default function SecuritySection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Your Privacy Is Our Priority</h2>
          <p className="text-lg text-gray-600 mb-8">
            Our steganography tool processes everything locally in your browser. Your images and messages never leave
            your device.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <Shield className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Client-Side Processing</h3>
              <p className="text-gray-600">
                All encoding and decoding happens directly in your browser. No server processing required.
              </p>
            </div>

            <div className="text-center">
              <Server className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Data Uploads</h3>
              <p className="text-gray-600">
                Your images and text are never uploaded to any server. Everything stays on your device.
              </p>
            </div>

            <div className="text-center">
              <Lock className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Local Storage Only</h3>
              <p className="text-gray-600">
                Saved images are stored in your browser's localStorage, accessible only to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
