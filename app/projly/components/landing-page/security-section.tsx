"use client"

import { useEffect } from "react"
import { Shield, Lock, KeyRound, UserCheck } from "lucide-react"

export default function SecuritySection() {
  // Log component mounting for debugging
  useEffect(() => {
    console.log("[PROJLY:LANDING] SecuritySection component mounted")
    return () => {
      console.log("[PROJLY:LANDING] SecuritySection component unmounted")
    }
  }, [])

  // Security features data with icons and descriptions
  const securityFeatures = [
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: "JWT Authentication",
      description:
        "Secure authentication using industry-standard JSON Web Tokens ensures protected access to your account and data.",
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Data Encryption",
      description:
        "Your data is encrypted both in transit and at rest, providing comprehensive protection for your project information.",
    },
    {
      icon: <UserCheck className="h-8 w-8 text-blue-600" />,
      title: "Role-Based Access",
      description:
        "Granular permission controls let you decide exactly who can view, edit, or manage your projects and resources.",
    },
    {
      icon: <KeyRound className="h-8 w-8 text-blue-600" />,
      title: "Secure Password Management",
      description:
        "Passwords are hashed using bcryptjs with industry best practices to ensure your credentials remain protected.",
    },
  ]
  
  console.log("[PROJLY:LANDING] SecuritySection rendering security features:", securityFeatures.length)
  
  return (
    <section id="security" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Security You Can Trust</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            At Projly, we prioritize the security and privacy of your data with industry-leading protection measures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {securityFeatures.map((feature, index) => {
            console.log(`[PROJLY:LANDING] Rendering security feature: ${feature.title}`)
            return (
              <div key={index} className="flex gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our security practices align with industry standards to protect your valuable project data. 
            Regular security audits and updates ensure that Projly remains a secure platform for all your 
            project management needs.
          </p>
        </div>
      </div>
    </section>
  )
}
