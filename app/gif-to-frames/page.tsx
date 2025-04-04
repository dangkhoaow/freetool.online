"use client"

import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import FrameConverter from "./components/frame-converter"

export default function GifToFramesPage() {
  // Function to scroll to converter section
  const scrollToConverter = () => {
    const converterSection = document.getElementById('converter');
    if (converterSection) {
      converterSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Function to scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        title="GIF to Frames Converter"
        titleHighlight="with Precision Control"
        description="Convert animated GIFs, MP4, and MOV files into individual frames with customizable frame rates and output formats. Perfect for animation work, video editing, and creative projects."
        badge="Frame Extraction Tool"
        primaryButtonText="Start Converting"
        secondaryButtonText="Learn More"
        onPrimaryButtonClick={scrollToConverter}
        onSecondaryButtonClick={scrollToFeatures}
      />

      {/* Main Converter Tool */}
      <section id="converter" className="py-12 px-4 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <FrameConverter />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our GIF to Frames converter offers powerful features to give you complete control over frame extraction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
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
                  className="text-purple-600"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                  <line x1="7" y1="2" x2="7" y2="22"></line>
                  <line x1="17" y1="2" x2="17" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <line x1="2" y1="7" x2="7" y2="7"></line>
                  <line x1="2" y1="17" x2="7" y2="17"></line>
                  <line x1="17" y1="17" x2="22" y2="17"></line>
                  <line x1="17" y1="7" x2="22" y2="7"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Multiple Format Support</h3>
              <p className="text-gray-600">
                Extract frames from GIF, MP4, and MOV files with equal ease. Our tool handles various input formats without compromising quality.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">FPS Control</h3>
              <p className="text-gray-600">
                Choose between 10, 24, or 60 frames per second to extract exactly the frames you need for your project.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
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
                  className="text-green-600"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Batch Download</h3>
              <p className="text-gray-600">
                Download all extracted frames in a convenient ZIP archive or select individual frames to download separately.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
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
                  className="text-yellow-600"
                >
                  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                  <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Format Options</h3>
              <p className="text-gray-600">
                Save frames as PNG for maximum quality or JPG for reduced file size, depending on your specific needs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
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
                  className="text-red-600"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Privacy First</h3>
              <p className="text-gray-600">
                All processing happens in your browser. Your files never leave your device, ensuring complete privacy.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
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
                  className="text-cyan-600"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <line x1="9" y1="1" x2="9" y2="4"></line>
                  <line x1="15" y1="1" x2="15" y2="4"></line>
                  <line x1="9" y1="20" x2="9" y2="23"></line>
                  <line x1="15" y1="20" x2="15" y2="23"></line>
                  <line x1="20" y1="9" x2="23" y2="9"></line>
                  <line x1="20" y1="14" x2="23" y2="14"></line>
                  <line x1="1" y1="9" x2="4" y2="9"></line>
                  <line x1="1" y1="14" x2="4" y2="14"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Preview Capability</h3>
              <p className="text-gray-600">
                Preview each extracted frame before downloading to ensure you've got exactly what you need for your project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How To Use Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How To Use</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Converting your GIFs or videos to individual frames is easy with our simple step-by-step process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Choose Your Settings</h3>
              <p className="text-gray-600">
                Select your desired output format (PNG or JPG) and frames per second (10, 24, or 60 FPS) in the settings panel.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Upload Your File</h3>
              <p className="text-gray-600">
                Drag and drop your GIF, MP4, or MOV file into the upload area or click to browse your files.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Extract Frames</h3>
              <p className="text-gray-600">
                Click "Extract Frames" to begin the conversion process. The tool will process your file according to your settings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Preview Results</h3>
              <p className="text-gray-600">
                Browse through the extracted frames in the preview gallery to see each individual frame.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">5</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Download Frames</h3>
              <p className="text-gray-600">
                Download individual frames or click "Download All as ZIP" to get all frames in a single archive file.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">6</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Start New Conversion</h3>
              <p className="text-gray-600">
                Click "Convert Another File" to reset the tool and start a new conversion with different settings or files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our GIF to Frames converter.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-2">What file types can I convert?</h3>
              <p className="text-gray-600">
                Our tool supports animated GIF files, as well as MP4 and MOV video formats. We'll be adding support for more formats in the future.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-2">Which output format should I choose?</h3>
              <p className="text-gray-600">
                Choose PNG for the highest quality and lossless compression, especially for graphics with transparency. Choose JPG for smaller file sizes, ideal for photographs and when you need to save space.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-2">What FPS setting should I use?</h3>
              <p className="text-gray-600">
                10 FPS is good for basic animations and when you want fewer frames. 24 FPS is the standard for film and most animations. 60 FPS gives you the most detailed frame extraction, ideal for slow-motion analysis or when you need to capture every detail.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-2">Is there a file size limit?</h3>
              <p className="text-gray-600">
                Yes, the maximum file size is 100MB. This limit helps ensure optimal performance of our browser-based tool while still accommodating most GIFs and short video clips.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-2">Is this tool free to use?</h3>
              <p className="text-gray-600">
                Yes, our GIF to Frames converter is completely free with no watermarks or limitations on the number of conversions. We believe in providing high-quality tools accessible to everyone.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-2">Are my files secure?</h3>
              <p className="text-gray-600">
                Absolutely. All processing happens directly in your browser. Your files never leave your device or get uploaded to any server, ensuring complete privacy and security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
