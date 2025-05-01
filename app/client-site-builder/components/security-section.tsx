"use client"

import { Shield, Lock, Server, Database } from "lucide-react"

export default function SecuritySection() {
  return (
    <section className="py-16 px-4 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 dark:text-white">Privacy & Security</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your data's security is our top priority. Our Client Site Builder runs entirely in your browser.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            <div className="flex items-start mb-5">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mr-4">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">100% Client-Side Processing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All site building operations happen directly in your browser. Your project data never leaves your device unless you explicitly export or share it.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            <div className="flex items-start mb-5">
              <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-4">
                <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">No Server Storage</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Unlike traditional website builders, we don't store your designs on remote servers. Everything is saved locally in your browser using IndexedDB.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            <div className="flex items-start mb-5">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full mr-4">
                <Server className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Offline-First PWA</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Build websites even without an internet connection. Our Progressive Web App works offline and syncs changes when you're back online.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
            <div className="flex items-start mb-5">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full mr-4">
                <Database className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">Secure Export & Sharing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  When you're ready to share your work, you control how it's exported. Generate clean, optimized code that can be hosted anywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
