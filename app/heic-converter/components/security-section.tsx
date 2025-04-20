"use client"

import { Shield, Lock, Eye, Server } from "lucide-react"
import { useEffect, useState } from "react"

export default function SecuritySection() {
  const [conversionMode, setConversionMode] = useState("browser")
  
  // Get conversion mode from settings
  useEffect(() => {
    // Attempt to get the current setting from localStorage
    if (typeof window !== 'undefined') {
      try {
        const settings = JSON.parse(localStorage.getItem('heicConverterSettings') || '{}')
        if (settings.conversionMode) {
          setConversionMode(settings.conversionMode)
        }
      } catch (e) {
        console.error('Error parsing settings:', e)
      }
      
      // Listen for settings changes
      const handleSettingsChange = (e: StorageEvent) => {
        if (e.key === 'heicConverterSettings') {
          try {
            const settings = JSON.parse(e.newValue || '{}')
            if (settings.conversionMode) {
              setConversionMode(settings.conversionMode)
            }
          } catch (e) {
            console.error('Error parsing settings:', e)
          }
        }
      }
      
      window.addEventListener('storage', handleSettingsChange)
      return () => window.removeEventListener('storage', handleSettingsChange)
    }
  }, [])
  
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Security & Privacy</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {conversionMode === "browser" 
              ? "With browser-based conversion, your files never leave your device."
              : "Your files and data are always secure with our HEIC converter."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Processing</h3>
            {conversionMode === "browser" ? (
              <p className="text-gray-600">
                All file processing happens directly in your browser. Your files never leave your device and are not
                uploaded to any server.
              </p>
            ) : (
              <p className="text-gray-600">
                Files are temporarily uploaded to our secure servers for processing and automatically deleted after conversion.
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Data Storage</h3>
            {conversionMode === "browser" ? (
              <p className="text-gray-600">
                We don't store your images or any data related to them. Everything stays on your device and is
                automatically cleared when you close the browser tab.
              </p>
            ) : (
              <p className="text-gray-600">
                We don't permanently store your images. All uploaded files are automatically deleted once the conversion is complete or after 24 hours.
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {conversionMode === "browser" ? (
                <Eye className="h-6 w-6 text-blue-600" />
              ) : (
                <Server className="h-6 w-6 text-blue-600" />
              )}
            </div>
            {conversionMode === "browser" ? (
              <>
                <h3 className="text-xl font-bold mb-2">Local Processing</h3>
                <p className="text-gray-600">
                  Your privacy is guaranteed as all processing happens locally. No external services can access your images.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">Advanced Features</h3>
                <p className="text-gray-600">
                  Server processing enables advanced AI optimization, higher quality output and additional format options.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
