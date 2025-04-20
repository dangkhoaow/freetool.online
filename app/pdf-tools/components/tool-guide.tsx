import { CheckCircle2 } from "lucide-react"

export default function ToolGuide() {
  return (
    <section id="guide" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How to Use Our PDF Tools</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our PDF tools are designed to be simple and intuitive. Follow these steps to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold">Select a Tool</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Choose the appropriate tool for your task from our comprehensive suite of PDF utilities.
            </p>
            <div className="overflow-hidden flex items-center justify-center" style={{ height: "205px" }}>
              <img
                src="/pdf-tools-select.png"
                alt="Select PDF Tool"
                style={{ maxWidth: "100px", height: "auto" }}
                className="w-full h-auto m-auto"
              />
            </div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span className="text-sm text-gray-600">Browse all available PDF tools</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span className="text-sm text-gray-600">Select the one that fits your needs</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold">Upload Your Files</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Drag and drop your PDF or image files into the upload area or click to browse your device.
            </p>
            <div className="overflow-hidden flex items-center justify-center" style={{ height: "205px" }}>
              <img
                src="/pdf-tools-upload.png"
                alt="Upload Files Step"
                style={{ maxWidth: "100px", height: "auto" }}
                className="w-full h-auto m-auto"
              />
            </div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span className="text-sm text-gray-600">Supports batch upload for multiple files</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span className="text-sm text-gray-600">Maximum file size: 100MB per file</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold">Process & Download</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure your settings if needed, process your files, and download the results.
            </p>
            <div className="overflow-hidden flex items-center justify-center" style={{ height: "205px" }}>
              <img
                src="/pdf-tools-download.png"
                alt="Process and Download Step"
                style={{ maxWidth: "100px", height: "auto" }}
                className="w-full h-auto m-auto"
              />
            </div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span className="text-sm text-gray-600">Customize settings for optimal results</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span className="text-sm text-gray-600">Download individual files or as a ZIP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold mb-6">Troubleshooting Tips</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">Files Not Uploading?</h4>
              <ul className="space-y-2">
                <li className="flex items-start items-center">
                  <div style={{ minWidth: "32px" }} className="text-center rounded-full bg-blue-100 p-1 mr-2 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <span className="text-gray-700">Check that your files are in the correct format</span>
                </li>
                <li className="flex items-start items-center">
                  <div style={{ minWidth: "32px" }} className="text-center rounded-full bg-blue-100 p-1 mr-2 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">2</span>
                  </div>
                  <span className="text-gray-700">Ensure each file is under the size limit</span>
                </li>
                <li className="flex items-start items-center">
                  <div style={{ minWidth: "32px" }} className="text-center rounded-full bg-blue-100 p-1 mr-2 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <span className="text-gray-700">Try using a different browser if issues persist</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-2">Processing Taking Too Long?</h4>
              <ul className="space-y-2">
                <li className="flex items-start items-center">
                  <div style={{ minWidth: "32px" }} className="text-center rounded-full bg-blue-100 p-1 mr-2 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <span className="text-gray-700">Large files take longer to process</span>
                </li>
                <li className="flex items-start items-center">
                  <div style={{ minWidth: "32px" }} className="text-center rounded-full bg-blue-100 p-1 mr-2 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">2</span>
                  </div>
                  <span className="text-gray-700">Try processing fewer files at once</span>
                </li>
                <li className="flex items-start items-center">
                  <div style={{ minWidth: "32px" }} className="text-center rounded-full bg-blue-100 p-1 mr-2 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <span className="text-gray-700">Check your internet connection speed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
