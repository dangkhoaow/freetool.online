"use client"

import { useState, useEffect } from "react"
import { Shield, Lock, Eye, FileCheck } from "lucide-react"

export default function SecuritySection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log("[CONTRACT:LANDING] SecuritySection component mounted")
    setMounted(true)
    return () => {
      console.log("[CONTRACT:LANDING] SecuritySection component unmounted")
    }
  }, [])

  const securityFeatures = [
    {
      icon: <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />,
      title: "Enterprise-Grade Security",
      description: "Your contracts are protected with bank-level encryption and security protocols."
    },
    {
      icon: <Lock className="h-8 w-8 text-green-600 dark:text-green-400" />,
      title: "Data Encryption",
      description: "All contract data is encrypted both in transit and at rest using AES-256 encryption."
    },
    {
      icon: <Eye className="h-8 w-8 text-green-600 dark:text-green-400" />,
      title: "Access Control",
      description: "Role-based permissions ensure only authorized users can access sensitive contract information."
    },
    {
      icon: <FileCheck className="h-8 w-8 text-green-600 dark:text-green-400" />,
      title: "Audit Trails",
      description: "Complete audit logs track all contract activities for compliance and security monitoring."
    }
  ]

  if (!mounted) {
    return <div className="py-12 px-4">Loading security information...</div>
  }

  return (
    <section className="py-16 px-4 bg-green-50 dark:bg-green-950/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Security & Compliance</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We take the security of your contract data seriously. Our platform is built with 
            enterprise-grade security features to protect your sensitive business information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Your Data is Safe</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We implement industry best practices for data protection, including regular security audits, 
              automated backups, and compliance with international data protection standards.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                SOC 2 Compliant
              </span>
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                GDPR Compliant
              </span>
              <span className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                ISO 27001
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
