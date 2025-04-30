"use client";

import { Shield, Lock, XOctagon } from "lucide-react";

export default function SecuritySection() {
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full mb-3">
          <Shield className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-bold mb-3">Your Privacy Is Our Priority</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Our recording tool is designed from the ground up with your privacy in mind.
          Here's how we protect your data:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-purple-100 dark:border-purple-900">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">100% Local Processing</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            All recording and processing happens entirely within your browser.
            No data is ever sent to any server or cloud service.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-purple-100 dark:border-purple-900">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Secure Local Storage</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Recordings are stored securely in your browser's IndexedDB database,
            inaccessible to any website other than this one.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-purple-100 dark:border-purple-900">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full mb-4">
              <XOctagon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">No Tracking or Analytics</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            We don't use any tracking cookies or analytics. Your usage of this tool
            is completely private and not monitored in any way.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-8 rounded-2xl">
        <h3 className="text-2xl font-bold mb-6">Privacy Features</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-purple-600"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-1">Face Blur Technology</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically detect and blur faces in your recordings to protect identities.
                Adjust blur intensity as needed for the right level of anonymization.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-purple-600"
              >
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-1">Metadata Stripping</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically remove EXIF data, GPS coordinates, device information, and other
                metadata from your recordings to prevent information leakage.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-purple-600"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-1">Automatic Cleanup</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Option to automatically delete recordings after a set period of time
                to ensure they don't remain in your browser storage indefinitely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
