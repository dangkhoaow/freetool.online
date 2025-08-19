"use client"

import { useState, useEffect } from "react"
import { FileText, Search, BarChart4, CheckCircle } from "lucide-react"

export default function UsageGuide() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log("[CONTRACT:LANDING] UsageGuide component mounted")
    setMounted(true)
    return () => {
      console.log("[CONTRACT:LANDING] UsageGuide component unmounted")
    }
  }, [])

  const steps = [
    {
      step: "1",
      icon: <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: "Create Your Contracts",
      description: "Start by creating new contracts or importing existing ones. Fill in all the essential details including parties, terms, and deadlines."
    },
    {
      step: "2",
      icon: <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: "Organize & Search",
      description: "Use powerful search and filtering tools to quickly find contracts. Organize by status, client, date, or any custom criteria."
    },
    {
      step: "3",
      icon: <BarChart4 className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: "Monitor & Analyze",
      description: "Track contract performance with visual analytics. Monitor expiration dates, renewal opportunities, and contract values."
    },
    {
      step: "4",
      icon: <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: "Automate & Optimize",
      description: "Set up automated notifications for important dates. Export reports and maintain compliance with ease."
    }
  ]

  if (!mounted) {
    return <div className="py-12 px-4">Loading usage guide...</div>
  }

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">How Contract Management Works</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started with contract management in four simple steps. Our intuitive interface 
            makes it easy to manage your entire contract lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((stepItem, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  {stepItem.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {stepItem.step}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">{stepItem.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{stepItem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
