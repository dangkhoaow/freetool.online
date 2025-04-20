import { CheckCircle2 } from "lucide-react"

export default function FeatureSection() {
  return (
    <section id="features" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful PDF Tools at Your Fingertips</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of PDF tools helps you manage and manipulate your PDF files with ease, all from your
            web browser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
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
                className="text-blue-600"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Merge PDFs</h3>
            <p className="text-gray-600 mb-4">
              Combine multiple PDF files into a single document, perfect for creating comprehensive reports or
              presentations.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Merge unlimited PDF files</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Rearrange files before merging</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Preserve original formatting</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
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
                className="text-blue-600"
              >
                <path d="M21 11H3"></path>
                <path d="M21 4H3"></path>
                <path d="M21 18H3"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Split PDF</h3>
            <p className="text-gray-600 mb-4">
              Extract specific pages or split large PDF documents into smaller, more manageable files.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Extract single pages or ranges</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Split by page number or custom ranges</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Download individual pages or as a ZIP</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
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
                className="text-blue-600"
              >
                <path d="M5.2 6.2l1.4 1.4"></path>
                <path d="M12 1v2"></path>
                <path d="M18.8 6.2l-1.4 1.4"></path>
                <path d="M23 12h-2"></path>
                <path d="M18.8 17.8l-1.4-1.4"></path>
                <path d="M12 23v-2"></path>
                <path d="M5.2 17.8l1.4-1.4"></path>
                <path d="M1 12h2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Compress PDF</h3>
            <p className="text-gray-600 mb-4">
              Reduce PDF file size without significant quality loss, making it easier to share or store your documents.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Multiple compression levels</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Optimize images within PDFs</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Reduce file size by up to 80%</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
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
                className="text-blue-600"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">PDF to Image</h3>
            <p className="text-gray-600 mb-4">
              Convert PDF pages to high-quality images in various formats for use in presentations, websites, or social
              media.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Convert to JPG or PNG formats</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Extract specific pages or all pages</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Adjustable quality settings</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
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
                className="text-blue-600"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Image to PDF</h3>
            <p className="text-gray-600 mb-4">
              Convert multiple images into a single PDF document, perfect for creating photo albums or documentation.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Support for JPG, PNG, GIF, and more</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Customize page size and orientation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Rearrange images before conversion</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
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
                className="text-blue-600"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Privacy & Security</h3>
            <p className="text-gray-600 mb-4">
              All our PDF tools prioritize your privacy and security, ensuring your documents remain confidential.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Browser-based processing</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">No data storage on servers</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Secure and private conversion process</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
