"use client"

import { Shield, Lock, Eye } from "lucide-react"

export default function SecuritySection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Security & Privacy</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your files and data are always secure with our online conversion tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Processing</h3>
            <p className="text-gray-600">
              All file processing happens directly in your browser. Your files never leave your device and are not
              uploaded to any server.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Data Storage</h3>
            <p className="text-gray-600">
              We don't store your images or any data related to them. Once you close the browser tab, all data is
              automatically deleted.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Privacy Control</h3>
            <p className="text-gray-600">
              You have full control over your data. Our tools are designed with privacy in mind, ensuring your content
              remains private.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
