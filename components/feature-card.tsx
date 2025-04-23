import { Target, Eye, Heart, Award, Users, Lightbulb } from "lucide-react"
import React from "react"

interface FeatureCardProps {
  title: string
  description: string
  icon: string | React.ReactNode
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const getIcon = () => {
    if (React.isValidElement(icon)) {
      return icon
    }
    
    switch (icon) {
      case "Target":
        return <Target className="h-10 w-10 text-primary" />
      case "Eye":
        return <Eye className="h-10 w-10 text-primary" />
      case "Heart":
        return <Heart className="h-10 w-10 text-primary" />
      case "Award":
        return <Award className="h-10 w-10 text-primary" />
      case "Users":
        return <Users className="h-10 w-10 text-primary" />
      case "Lightbulb":
        return <Lightbulb className="h-10 w-10 text-primary" />
      default:
        return <Target className="h-10 w-10 text-primary" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-4">{getIcon()}</div>
      <h3 className="text-xl font-bold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}
