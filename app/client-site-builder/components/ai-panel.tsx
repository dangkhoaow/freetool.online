"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Wand2, Sparkles, Copy, Check, RefreshCw } from "lucide-react"
import { BASE_COMPONENTS } from "./components-panel"

interface AIPanelProps {
  onApplySuggestion: (suggestion: string) => void
}

export default function AIPanel({ onApplySuggestion }: AIPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("content")
  const [copied, setCopied] = useState<number | null>(null)

  // Simulate AI text generation with some pre-defined responses
  const generateSuggestions = () => {
    if (!prompt.trim()) return

    setLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      let results: string[] = []
      
      // Generate content based on the active tab
      if (activeTab === "content") {
        results = [
          "Our platform provides intuitive tools that make website building accessible to everyone, regardless of technical expertise.",
          "Transform your online presence with our browser-based website creator. Design stunning websites with zero coding required.",
          "Create professional websites in minutes, not days. Our drag-and-drop tools make web design simpler than ever before."
        ]
      } else if (activeTab === "design") {
        results = [
          "Try using a gradient background from blue to purple with white text for better contrast.",
          "Add more whitespace between sections to improve readability and visual hierarchy.",
          "Consider using a more vibrant accent color for your call-to-action buttons to increase conversions."
        ]
      } else if (activeTab === "layout") {
        results = [
          "Split your hero section into two columns with image on the right and text on the left for better balance.",
          "Consider a zigzag layout for your features section to create visual interest and guide the reader's eye.",
          "Try a three-column layout for your testimonials with circular profile images and centered text."
        ]
      }
      
      setSuggestions(results)
      setLoading(false)
    }, 1500)
  }

  const handleCopy = (index: number) => {
    navigator.clipboard.writeText(suggestions[index])
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
        <div className="flex items-start">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium mb-1 dark:text-white">AI Design Assistant</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Get AI-generated content, design suggestions, and layout ideas that run entirely in your browser.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
          <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-0 space-y-4">
          <div>
            <Textarea
              placeholder="Describe the content you need (e.g., 'Write a compelling hero headline for a SaaS product')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] mb-2"
            />
            <Button 
              onClick={generateSuggestions} 
              disabled={loading || !prompt.trim()} 
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
          
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium dark:text-white">Suggestions:</h3>
              
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-3">
                    <p className="text-sm dark:text-white">{suggestion}</p>
                  </CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => handleCopy(index)}
                    >
                      {copied === index ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs"
                      onClick={() => onApplySuggestion(suggestion)}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Apply</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="design" className="mt-0 space-y-4">
          <div>
            <Textarea
              placeholder="Describe the design problem or ask for suggestions (e.g., 'Suggest a color scheme for a finance website')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] mb-2"
            />
            <Button 
              onClick={generateSuggestions} 
              disabled={loading || !prompt.trim()} 
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Design Ideas
                </>
              )}
            </Button>
          </div>
          
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium dark:text-white">Design Suggestions:</h3>
              
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-3">
                    <p className="text-sm dark:text-white">{suggestion}</p>
                  </CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => handleCopy(index)}
                    >
                      {copied === index ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs"
                      onClick={() => onApplySuggestion(suggestion)}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Apply</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="layout" className="mt-0 space-y-4">
          <div>
            <Textarea
              placeholder="Describe the layout you need help with (e.g., 'Suggest a layout for my product features')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] mb-2"
            />
            <Button 
              onClick={generateSuggestions} 
              disabled={loading || !prompt.trim()} 
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Layout Ideas
                </>
              )}
            </Button>
          </div>
          
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium dark:text-white">Layout Suggestions:</h3>
              
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-3">
                    <p className="text-sm dark:text-white">{suggestion}</p>
                  </CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => handleCopy(index)}
                    >
                      {copied === index ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs"
                      onClick={() => onApplySuggestion(suggestion)}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Apply</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-2 dark:text-white">Component AI Prompts</h3>
        <div className="space-y-2">
          {BASE_COMPONENTS.slice(0, 3).map((component) => (
            <Button
              key={component.id}
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setActiveTab("content")
                setPrompt(component.aiPrompt)
              }}
            >
              <Sparkles className="h-3.5 w-3.5 mr-2 text-blue-500" />
              {component.aiPrompt}
            </Button>
          ))}
          <Button
            variant="link"
            size="sm"
            className="px-0 text-xs"
          >
            View all component prompts
          </Button>
        </div>
      </div>
    </div>
  )
}
