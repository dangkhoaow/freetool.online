"use client"

import { useState, useEffect } from "react"
import { 
  CalendarRange, 
  Kanban, 
  Users, 
  BarChart4, 
  FolderArchive, 
  CheckCircle, 
  GitBranch, 
  Bell 
} from "lucide-react"

export default function FeatureSection() {
  const [mounted, setMounted] = useState(false)

  // Log component mounting for debugging
  useEffect(() => {
    console.log("[PROJLY:LANDING] FeatureSection component mounted")
    setMounted(true)
    return () => {
      console.log("[PROJLY:LANDING] FeatureSection component unmounted")
    }
  }, [])

  // Features data with icons and descriptions
  const features = [
    {
      icon: <Kanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Project Management",
      description:
        "Create, edit, and organize projects with intuitive tools. Set deadlines, track progress, and manage resources efficiently.",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Task Tracking",
      description:
        "Assign and track tasks with detailed status updates. Use drag-and-drop functionality to prioritize and organize your workflow.",
    },
    {
      icon: <GitBranch className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Subtask Hierarchy",
      description:
        "Create parent-child relationships between tasks. Break down complex projects into manageable subtasks for better organization.",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Team Collaboration",
      description:
        "Invite team members, assign roles, and collaborate seamlessly. Email-based invitations make onboarding new members easy.",
    },
    {
      icon: <CalendarRange className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Calendar Integration",
      description:
        "View your projects and tasks in a calendar format. Get a clear timeline view of deadlines and milestones.",
    },
    {
      icon: <BarChart4 className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Analytics Dashboard",
      description:
        "Track project progress with visual analytics. Monitor team performance and resource allocation with interactive charts.",
    },
    {
      icon: <FolderArchive className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Resource Management",
      description:
        "Store and organize project-related files and resources. Keep all project assets in one accessible location.",
    },
    {
      icon: <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "Notifications",
      description:
        "Stay updated with task assignments and status changes. Never miss important project updates with real-time notifications.",
    },
  ]

  if (!mounted) {
    console.log("[PROJLY:LANDING] FeatureSection rendering loading state")
    return <div className="py-12 px-4">Loading features...</div>
  }

  console.log("[PROJLY:LANDING] FeatureSection rendering features:", features.length)
  
  return (
    <section id="features" className="py-16 px-4 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Powerful Features for Modern Teams</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Projly offers a comprehensive suite of tools designed to streamline your project management workflow
            and boost team productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            console.log(`[PROJLY:LANDING] Rendering feature: ${feature.title}`)
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
