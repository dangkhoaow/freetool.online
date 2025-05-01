"use client"

import { useState } from "react"
import { useDrag } from "react-dnd"
import { 
  Layout, 
  Type, 
  Image as ImageIcon, 
  List, 
  MessagesSquare, 
  CreditCard,
  Mail,
  Grid3X3,
  Book,
  MapPin,
  Search
} from "lucide-react"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Define component types and their default styles
export const BASE_COMPONENTS = [
  {
    id: "hero",
    name: "Hero Section",
    category: "layout",
    defaultStyles: {
      backgroundColor: "#ffffff",
      padding: "80px 20px"
    },
    defaultContent: "",
    aiPrompt: "Generate startup hero section with CTA",
    icon: <Layout className="h-5 w-5" />
  },
  {
    id: "features",
    name: "Features Grid",
    category: "layout",
    defaultStyles: {
      backgroundColor: "#ffffff",
      padding: "80px 20px"
    },
    defaultContent: "",
    aiPrompt: "Generate 3-column features section",
    icon: <Grid3X3 className="h-5 w-5" />
  },
  {
    id: "testimonials",
    name: "Testimonials",
    category: "content",
    defaultStyles: {
      backgroundColor: "#f8fafc",
      padding: "80px 20px"
    },
    defaultContent: "",
    aiPrompt: "Generate customer testimonials section",
    icon: <MessagesSquare className="h-5 w-5" />
  },
  {
    id: "pricing",
    name: "Pricing Table",
    category: "conversion",
    defaultStyles: {
      backgroundColor: "#ffffff",
      padding: "80px 20px"
    },
    defaultContent: "",
    aiPrompt: "Generate pricing table with 3 tiers",
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    id: "contact",
    name: "Contact Form",
    category: "conversion",
    defaultStyles: {
      backgroundColor: "#ffffff",
      padding: "80px 20px"
    },
    defaultContent: "",
    aiPrompt: "Generate contact form with map",
    icon: <Mail className="h-5 w-5" />
  },
  {
    id: "about",
    name: "About Section",
    category: "content",
    defaultStyles: {
      backgroundColor: "#ffffff",
      padding: "80px 20px"
    },
    defaultContent: "",
    aiPrompt: "Generate about us section with team members",
    icon: <Book className="h-5 w-5" />
  },
  {
    id: "gallery",
    name: "Image Gallery",
    category: "media",
    defaultStyles: {
      backgroundColor: "#ffffff",
      padding: "80px 20px"
    },
    defaultContent: "",
    aiPrompt: "Generate image gallery grid",
    icon: <ImageIcon className="h-5 w-5" />
  },
  {
    id: "faq",
    name: "FAQ Accordion",
    category: "content",
    defaultStyles: {
      backgroundColor: "#f8fafc",
      padding: "80px 20px"
    },
    defaultContent: "",
    aiPrompt: "Generate FAQ section with 5 questions",
    icon: <List className="h-5 w-5" />
  },
  {
    id: "cta",
    name: "Call to Action",
    category: "conversion",
    defaultStyles: {
      backgroundColor: "#4f46e5",
      padding: "80px 20px",
      color: "#ffffff"
    },
    defaultContent: "",
    aiPrompt: "Generate call to action section with button",
    icon: <Type className="h-5 w-5" />
  },
  {
    id: "location",
    name: "Location Map",
    category: "media",
    defaultStyles: {
      backgroundColor: "#ffffff",
      padding: "80px 20px"
    },
    defaultContent: "",
    aiPrompt: "Generate location section with embedded map",
    icon: <MapPin className="h-5 w-5" />
  }
]

interface ComponentCardProps {
  component: typeof BASE_COMPONENTS[0]
  onAddComponent: (component: typeof BASE_COMPONENTS[0]) => void
}

const ComponentCard = ({ component, onAddComponent }: ComponentCardProps) => {
  // Set up drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: "COMPONENT",
    item: { id: component.id, type: component.id, defaultStyles: component.defaultStyles },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag as any}
      className={cn(
        "flex items-center p-3 rounded-md border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 cursor-move hover:shadow-md transition-all",
        isDragging ? "opacity-50 shadow-lg" : "opacity-100"
      )}
      onClick={() => onAddComponent(component)}
    >
      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mr-3">
        {component.icon}
      </div>
      <div>
        <h4 className="text-sm font-medium dark:text-white">{component.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{component.category}</p>
      </div>
    </div>
  )
}

interface ComponentsPanelProps {
  onAddComponent: (component: typeof BASE_COMPONENTS[0]) => void
}

export default function ComponentsPanel({ onAddComponent }: ComponentsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  
  // Filter components based on search and category
  const filteredComponents = BASE_COMPONENTS.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "all" || component.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search components..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
          <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
          <TabsTrigger value="conversion" className="text-xs">Convert</TabsTrigger>
          <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="space-y-2 overflow-auto h-full">
            {filteredComponents.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onAddComponent={onAddComponent}
              />
            ))}
          </div>
        </TabsContent>
        
        {["layout", "content", "conversion", "media"].map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="space-y-2 overflow-auto h-full">
              {filteredComponents.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  onAddComponent={onAddComponent}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md">
        <h4 className="text-sm font-medium mb-2 dark:text-white">Tip:</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Drag and drop components onto the canvas, or click to add them to the bottom of your page.
        </p>
      </div>
    </div>
  )
}
