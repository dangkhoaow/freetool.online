"use client"

import { useState, useEffect } from "react"
import { 
  FileText, 
  Search, 
  Lock, 
  BarChart4, 
  Calendar, 
  Users, 
  Download, 
  AlertTriangle 
} from "lucide-react"

export default function FeatureSection() {
  const [mounted, setMounted] = useState(false)

  // Log component mounting for debugging
  useEffect(() => {
    console.log("[CONTRACT:LANDING] FeatureSection component mounted")
    setMounted(true)
    return () => {
      console.log("[CONTRACT:LANDING] FeatureSection component unmounted")
    }
  }, [])

  // Features data with icons and descriptions
  const features = [
    {
      icon: <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Contract Management",
      description:
        "Create, edit, and organize contracts with intuitive tools. Manage contract types, statuses, and critical information efficiently.",
    },
    {
      icon: <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Advanced Search",
      description:
        "Quickly find contracts with powerful search functionality. Search by title, client, status, dates, and custom criteria.",
    },
    {
      icon: <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Deadline Tracking",
      description:
        "Never miss important contract deadlines. Get automatic notifications for expiring contracts and renewal dates.",
    },
    {
      icon: <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Secure Storage",
      description:
        "Store contract documents securely with enterprise-grade encryption. Control access with role-based permissions.",
    },
    {
      icon: <BarChart4 className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Analytics Dashboard",
      description:
        "Track contract performance with visual analytics. Monitor contract values, statuses, and trends over time.",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Multi-language Support",
      description:
        "Work in your preferred language with full Vietnamese and English support. Seamlessly switch between languages.",
    },
    {
      icon: <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Export & Import",
      description:
        "Export contracts to various formats including PDF and Excel. Bulk import existing contracts with ease.",
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Risk Management",
      description:
        "Identify and manage contract risks with automated alerts. Track compliance and important contract milestones.",
    },
  ]

  if (!mounted) {
    console.log("[CONTRACT:LANDING] FeatureSection rendering loading state")
    return <div className="py-12 px-4">Loading features...</div>
  }

  console.log("[CONTRACT:LANDING] FeatureSection rendering features:", features.length)
  
  return (
    <section id="features" className="py-16 px-4 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Comprehensive Contract Management Features</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Streamline your contract lifecycle with powerful tools designed to help you manage contracts 
            from creation to renewal with complete visibility and control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            console.log(`[CONTRACT:LANDING] Rendering feature: ${feature.title}`)
            return (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
