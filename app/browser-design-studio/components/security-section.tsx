import { Shield, Server, Lock, Upload } from "lucide-react"

export default function SecuritySection() {
  return (
    <section id="security" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            100% Private <span className="text-rose-600">Local Processing</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Unlike other online design tools, our browser design studio processes everything locally on your device, ensuring complete privacy and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-start mb-4">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-full mr-4">
                <Shield className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Zero Data Collection</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your designs never leave your device. We don't collect any design data, and all processing happens entirely in your browser.
                </p>
              </div>
            </div>
            <div className="pl-16">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-sm text-gray-600 dark:text-gray-300">
                "Unlike cloud-based tools, we never have access to your designs because they never reach our servers."
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-start mb-4">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-full mr-4">
                <Server className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Complete Local Storage</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All your designs are stored locally in your browser's secure storage, with no cloud dependencies or account requirements.
                </p>
              </div>
            </div>
            <div className="pl-16">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-sm text-gray-600 dark:text-gray-300">
                "Your designs are saved to your device's IndexedDB storage, which is private to your browser and inaccessible to us or other websites."
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-start mb-4">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-full mr-4">
                <Lock className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Private AI Processing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI tools run entirely in your browser using TensorFlow.js, ensuring your designs aren't processed on remote servers or used for training.
                </p>
              </div>
            </div>
            <div className="pl-16">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-sm text-gray-600 dark:text-gray-300">
                "We use TensorFlow.js to run AI models directly in your browser, so design prompts and content stay private to your device."
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-start mb-4">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-full mr-4">
                <Upload className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No-Upload Design Process</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Import images, fonts, and resources directly into your browser with no server uploads, keeping your assets completely private.
                </p>
              </div>
            </div>
            <div className="pl-16">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-sm text-gray-600 dark:text-gray-300">
                "Files you import are processed directly by your browser. They're never transmitted to our servers, even temporarily."
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Privacy Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Feature</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Browser Design Studio</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Cloud-Based Tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-300">Data Storage</td>
                  <td className="p-3 text-sm text-green-600 dark:text-green-400">100% local on your device</td>
                  <td className="p-3 text-sm text-red-600 dark:text-red-400">Stored on company servers</td>
                </tr>
                <tr>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-300">Processing Location</td>
                  <td className="p-3 text-sm text-green-600 dark:text-green-400">Your browser only</td>
                  <td className="p-3 text-sm text-red-600 dark:text-red-400">Remote server processing</td>
                </tr>
                <tr>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-300">Internet Requirement</td>
                  <td className="p-3 text-sm text-green-600 dark:text-green-400">Works offline after initial load</td>
                  <td className="p-3 text-sm text-red-600 dark:text-red-400">Constant connection required</td>
                </tr>
                <tr>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-300">Your Data Access</td>
                  <td className="p-3 text-sm text-green-600 dark:text-green-400">Only you have access</td>
                  <td className="p-3 text-sm text-red-600 dark:text-red-400">Company has access</td>
                </tr>
                <tr>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-300">AI Training</td>
                  <td className="p-3 text-sm text-green-600 dark:text-green-400">Your designs aren't used for training</td>
                  <td className="p-3 text-sm text-red-600 dark:text-red-400">Often used to train company AI</td>
                </tr>
                <tr>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-300">Required Accounts</td>
                  <td className="p-3 text-sm text-green-600 dark:text-green-400">No account needed</td>
                  <td className="p-3 text-sm text-red-600 dark:text-red-400">Account with personal details</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
