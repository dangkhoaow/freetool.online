"use client"

import { useEffect } from "react"
import { 
  UserPlus, 
  FolderPlus, 
  ListTodo, 
  PieChart, 
  ArrowRight 
} from "lucide-react"
import Image from "next/image"

export default function UsageGuide() {
  // Log component mounting for debugging
  useEffect(() => {
    console.log("[PROJLY:LANDING] UsageGuide component mounted")
    return () => {
      console.log("[PROJLY:LANDING] UsageGuide component unmounted")
    }
  }, [])

  // Steps data with icons and descriptions
  const steps = [
    {
      icon: <UserPlus className="h-8 w-8 text-blue-600" />,
      title: "Create Your Account",
      description:
        "Sign up for a free Projly account in seconds. No credit card required, just your email and a password.",
    },
    {
      icon: <FolderPlus className="h-8 w-8 text-blue-600" />,
      title: "Create Your First Project",
      description:
        "Set up a new project with a title, description, deadline, and assign team members to collaborate.",
    },
    {
      icon: <ListTodo className="h-8 w-8 text-blue-600" />,
      title: "Add Tasks & Subtasks",
      description:
        "Break your project down into manageable tasks. Assign responsibilities, set deadlines, and track progress.",
    },
    {
      icon: <PieChart className="h-8 w-8 text-blue-600" />,
      title: "Monitor Progress",
      description:
        "Use the dashboard and analytics to track project status, team performance, and resource allocation in real-time.",
    },
  ]
  
  console.log("[PROJLY:LANDING] UsageGuide rendering steps:", steps.length)
  
  return (
    <section id="how-it-works" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">How Projly Works</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started with Projly in just a few simple steps. Our intuitive interface makes project
            management accessible for teams of all sizes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-10">
            {steps.map((step, index) => {
              console.log(`[PROJLY:LANDING] Rendering step: ${step.title}`)
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center dark:text-white">
                      {step.title}
                      {index < steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 ml-2 text-blue-500" />
                      )}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="relative rounded-xl overflow-hidden shadow-xl h-[400px] border border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-full h-[320px] relative">
                  <Image 
                    src="/images/projly-og.jpg" 
                    alt="Projly Dashboard Preview" 
                    className="object-cover rounded-lg"
                    fill
                    priority
                    unoptimized // Using unoptimized for placeholder. Replace with actual image.
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
                  The Projly dashboard provides a comprehensive overview of your projects
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
