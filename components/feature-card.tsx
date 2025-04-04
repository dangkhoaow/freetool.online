import { Target, Eye, Heart, Award, Users, Lightbulb } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const getIcon = () => {
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
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-4">{getIcon()}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

