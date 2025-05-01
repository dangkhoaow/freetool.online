"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useToast } from "@/components/ui/use-toast"
import Canvas from "./canvas"
import ComponentsPanel from "./components-panel"
import StyleEditor from "./style-editor"
import NavigationPanel from "./navigation-panel"
import ProjectPanel from "./project-panel"
import ExportPanel from "./export-panel"
import AIPanel from "./ai-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Box, Cpu, Save, Download, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMediaQuery } from "@/hooks/use-media-query"
import useLocalStorage from "@/hooks/use-local-storage"
import useIndexedDB from "./hooks/use-indexed-db"

// Types
export interface UIBlock {
  id: string
  type: string
  content: string
  styles: Record<string, string>
  children?: UIBlock[]
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  pages: {
    id: string
    name: string
    blocks: UIBlock[]
  }[]
  currentPageId: string
}

export default function SiteBuilderTool() {
  const [activeTab, setActiveTab] = useState("components")
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [canvasMode, setCanvasMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { toast } = useToast()
  const { getAll, add, update, remove, isReady } = useIndexedDB()

  // Auto-save timer
  useEffect(() => {
    if (!currentProject) return

    const timer = setTimeout(() => {
      handleSaveProject(false)
    }, 15000)

    return () => clearTimeout(timer)
  }, [currentProject])

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      if (!isReady) return;
      
      try {
        const loadedProjects = await getAll<Project>("projects")
        setProjects(loadedProjects || [])
      } catch (error) {
        console.error("Failed to load projects:", error)
      }
    }

    if (isReady) {
      loadProjects()
    }
  }, [isReady]) // Depend on isReady to trigger loading when the database is initialized

  const handleSaveProject = async (showToast = true) => {
    if (!currentProject) return
    
    try {
      const updatedProject = {
        ...currentProject,
        updatedAt: Date.now()
      }
      
      await update("projects", updatedProject)
      setCurrentProject(updatedProject)
      
      if (showToast) {
        toast({
          title: "Project saved",
          description: "Your project has been saved successfully.",
          duration: 3000
        })
      }
    } catch (error) {
      console.error("Failed to save project:", error)
      toast({
        title: "Save failed",
        description: "There was an error saving your project.",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  const getCurrentPage = () => {
    if (!currentProject) return null
    return currentProject.pages.find(page => page.id === currentProject.currentPageId)
  }

  const handleBlockUpdate = (blockId: string, updatedBlock: UIBlock) => {
    if (!currentProject) return
    
    const currentPage = getCurrentPage()
    if (!currentPage) return
    
    const updateBlocksRecursively = (blocks: UIBlock[]): UIBlock[] => {
      return blocks.map(block => {
        if (block.id === blockId) {
          return updatedBlock
        }
        
        if (block.children?.length) {
          return {
            ...block,
            children: updateBlocksRecursively(block.children)
          }
        }
        
        return block
      })
    }
    
    const updatedPages = currentProject.pages.map(page => {
      if (page.id === currentProject.currentPageId) {
        return {
          ...page,
          blocks: updateBlocksRecursively(page.blocks)
        }
      }
      return page
    })
    
    setCurrentProject({
      ...currentProject,
      pages: updatedPages
    })
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col min-h-[70vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium dark:text-white">
              {currentProject?.name || "New Project"}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSaveProject()} 
              disabled={!currentProject}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!currentProject}
              onClick={() => setActiveTab("export")}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row h-full min-h-[600px]">
          {/* Left Sidebar */}
          <div className="w-full md:w-64 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-4 md:grid-cols-3 w-full">
                <TabsTrigger value="components">
                  <Box className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Components</span>
                </TabsTrigger>
                <TabsTrigger value="styles">
                  <Palette className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Styles</span>
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Cpu className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">AI Assist</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="md:hidden">
                  <Download className="h-4 w-4 mr-1 md:mr-2" />
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="components" className="flex-1 overflow-auto p-2">
                <ComponentsPanel onAddComponent={(component) => {
                  if (!currentProject) return
                
                  const currentPage = getCurrentPage()
                  if (!currentPage) return
                
                  const newBlock: UIBlock = {
                    id: `block-${Date.now()}`,
                    type: component.id,
                    content: component.defaultContent || "",
                    styles: component.defaultStyles || {},
                  }
                  
                  const updatedPage = {
                    ...currentPage,
                    blocks: [...currentPage.blocks, newBlock]
                  }
                  
                  const updatedPages = currentProject.pages.map(page => 
                    page.id === currentProject.currentPageId ? updatedPage : page
                  )
                  
                  setCurrentProject({
                    ...currentProject,
                    pages: updatedPages
                  })
                }} />
              </TabsContent>
              
              <TabsContent value="styles" className="flex-1 overflow-auto p-2">
                <StyleEditor 
                  selectedBlock={null} 
                  onStyleChange={(styles) => {
                    if (!currentProject) return
                  }}
                />
              </TabsContent>
              
              <TabsContent value="ai" className="flex-1 overflow-auto p-2">
                <AIPanel onApplySuggestion={(suggestion) => {
                  // Apply AI suggestions to the current design
                }} />
              </TabsContent>
              
              <TabsContent value="export" className="flex-1 overflow-auto p-2">
                <ExportPanel 
                  project={currentProject} 
                  onExport={(format) => {
                    // Handle export based on format (HTML, Static Site, etc.)
                  }} 
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Canvas Controls */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant={canvasMode === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCanvasMode("desktop")}
                >
                  Desktop
                </Button>
                <Button
                  variant={canvasMode === "tablet" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCanvasMode("tablet")}
                >
                  Tablet
                </Button>
                <Button
                  variant={canvasMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCanvasMode("mobile")}
                >
                  Mobile
                </Button>
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("project")}>
                  <Layers className="h-4 w-4 mr-1" />
                  Pages
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
              {!currentProject ? (
                <div className="flex items-center justify-center h-full flex-col">
                  <h3 className="text-xl font-medium mb-4 dark:text-white">No Project Open</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">
                    Create a new project or open an existing one to start building your website.
                  </p>
                  <Button onClick={() => {
                    const newProject: Project = {
                      id: `project-${Date.now()}`,
                      name: "New Project",
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                      pages: [
                        {
                          id: "page-1",
                          name: "Home",
                          blocks: []
                        }
                      ],
                      currentPageId: "page-1"
                    }
                    
                    // Save to IndexedDB
                    add("projects", newProject).then(() => {
                      setCurrentProject(newProject)
                      setProjects([...projects, newProject])
                      
                      toast({
                        title: "Project created",
                        description: "Your new project has been created successfully.",
                        duration: 3000
                      })
                    })
                  }}>
                    Create New Project
                  </Button>
                </div>
              ) : (
                <Canvas 
                  blocks={getCurrentPage()?.blocks || []} 
                  canvasMode={canvasMode}
                  onBlocksChange={(updatedBlocks) => {
                    if (!currentProject) return
                    
                    const currentPage = getCurrentPage()
                    if (!currentPage) return
                    
                    const updatedPages = currentProject.pages.map(page => {
                      if (page.id === currentProject.currentPageId) {
                        return {
                          ...page,
                          blocks: updatedBlocks
                        }
                      }
                      return page
                    })
                    
                    setCurrentProject({
                      ...currentProject,
                      pages: updatedPages
                    })
                  }}
                  onBlockSelect={(blockId) => {
                    // Set selected block for style editor
                  }} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
