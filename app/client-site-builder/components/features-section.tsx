"use client"

import { MousePointer, Cpu, Wifi, Users, Download, Code } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

function FeatureCard({ title, description, icon, color }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("p-3 rounded-full w-fit mb-4", color)}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

export default function FeatureSection() {
  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-950">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 dark:text-white">Everything You Need to Build Amazing Websites</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our browser-based website builder combines powerful features with privacy-first technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Visual Drag & Drop"
            description="Build websites visually with our intuitive drag-and-drop interface. No coding required."
            icon={<MousePointer className="h-6 w-6 text-blue-600" />}
            color="bg-blue-100 dark:bg-blue-900/50"
          />
          
          <FeatureCard
            title="AI-Assisted Design"
            description="Get design suggestions and content recommendations with our browser-based AI technology."
            icon={<Cpu className="h-6 w-6 text-purple-600" />}
            color="bg-purple-100 dark:bg-purple-900/50"
          />
          
          <FeatureCard
            title="Offline-First"
            description="Work without internet connection. Your site is saved locally and syncs when you're back online."
            icon={<Wifi className="h-6 w-6 text-green-600" />}
            color="bg-green-100 dark:bg-green-900/50"
          />
          
          <FeatureCard
            title="Team Collaboration"
            description="Share your projects and collaborate in real-time using WebRTC and CRDTs for conflict resolution."
            icon={<Users className="h-6 w-6 text-amber-600" />}
            color="bg-amber-100 dark:bg-amber-900/50"
          />
          
          <FeatureCard
            title="Clean Code Export"
            description="Generate clean, optimized HTML, CSS, and JavaScript that can be hosted anywhere."
            icon={<Code className="h-6 w-6 text-teal-600" />}
            color="bg-teal-100 dark:bg-teal-900/50"
          />
          
          <FeatureCard
            title="Static Site Export"
            description="Export your complete site as a static site package ready for deployment on any hosting platform."
            icon={<Download className="h-6 w-6 text-rose-600" />}
            color="bg-rose-100 dark:bg-rose-900/50"
          />
        </div>
      </div>
    </section>
  )
}
