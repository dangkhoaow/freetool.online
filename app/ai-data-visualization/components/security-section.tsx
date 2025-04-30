"use client"

import { Shield, Lock, Database, Server } from "lucide-react"

export default function SecuritySection() {
  return (
    <section id="security" className="py-16 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">
            100% Private and Secure Data Processing
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your data privacy is our top priority. Our tool processes everything locally on your device
            with no data ever sent to external servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="flex items-start mb-6">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm mr-4">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">No Data Leaves Your Device</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Unlike traditional visualization tools, our solution processes everything in your browser. Your data remains on 
                  your device at all times, eliminating data transmission risks and privacy concerns.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm mr-4">
                <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Browser Sandboxing Protection</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your data processing happens within the secure browser sandbox environment, providing an additional layer of 
                  isolation and security against potential threats.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg border border-blue-100 dark:border-gray-700">
            <div className="flex items-start mb-6">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm mr-4">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Encrypted Local Storage</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  When you save visualizations, they're stored securely in your browser's local storage with encryption. 
                  This ensures your data remains protected even while saved for future use.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm mr-4">
                <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Zero External Dependencies</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  After initial page load, our tool functions entirely offline. The AI model runs locally, eliminating reliance on 
                  external API calls that could expose your data to third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-8 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h3 className="text-2xl font-bold mb-2">Our Privacy Commitment</h3>
              <p className="text-blue-50">
                We believe data visualization shouldn't come at the cost of your privacy. Our browser-based approach ensures
                your sensitive information remains under your control at all times.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>No data collection</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>No server processing</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>No user tracking</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>No account required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
