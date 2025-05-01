"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Folder,
  FilePlus,
  Calendar,
  MoreHorizontal,
  Copy,
  Trash,
  Edit,
  Check,
  X
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Project } from "./site-builder-tool"

// Helper function to format dates without requiring date-fns
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  // Convert milliseconds to different time units
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  
  // For older dates, return full date
  return new Date(timestamp).toLocaleDateString()
}

interface ProjectPanelProps {
  projects: Project[]
  currentProject: Project | null
  onOpenProject: (project: Project) => void
  onCreateProject: (name: string) => void
  onRenameProject: (project: Project, newName: string) => void
  onDuplicateProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
}

export default function ProjectPanel({
  projects,
  currentProject,
  onOpenProject,
  onCreateProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject
}: ProjectPanelProps) {
  const [newProjectName, setNewProjectName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim())
      setNewProjectName("")
      setIsCreating(false)
    }
  }

  const handleStartRename = (project: Project) => {
    setEditingProjectId(project.id)
    setEditingName(project.name)
  }

  const handleFinishRename = (project: Project) => {
    if (editingName.trim()) {
      onRenameProject(project, editingName.trim())
    }
    setEditingProjectId(null)
    setEditingName("")
  }

  const handleCancelRename = () => {
    setEditingProjectId(null)
    setEditingName("")
  }

  const confirmDelete = (project: Project) => {
    setProjectToDelete(project)
    setIsDeleteDialogOpen(true)
  }

  const executeDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete)
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium dark:text-white">My Projects</h3>
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <FilePlus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </div>
        
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isCreating && (
          <Card className="mb-4 border-blue-200 dark:border-blue-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">New Project</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="mb-3"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject()
                  if (e.key === 'Escape') {
                    setIsCreating(false)
                    setNewProjectName("")
                  }
                }}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false)
                    setNewProjectName("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                >
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {filteredProjects.length === 0 && !isCreating ? (
          <div className="text-center py-8">
            <Folder className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-1 dark:text-white">No projects yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create a new project to get started
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <FilePlus className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map(project => (
              <Card
                key={project.id}
                className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                  currentProject?.id === project.id
                    ? "border-blue-500 dark:border-blue-600"
                    : ""
                }`}
                onClick={() => {
                  if (editingProjectId !== project.id) {
                    onOpenProject(project)
                  }
                }}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    {editingProjectId === project.id ? (
                      <div className="flex items-center space-x-2 w-full pr-8">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          className="h-8 text-sm"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFinishRename(project)
                            if (e.key === 'Escape') handleCancelRename()
                            e.stopPropagation()
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFinishRename(project)
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelRename()
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <CardTitle className="text-base">{project.name}</CardTitle>
                    )}
                    
                    {editingProjectId !== project.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleStartRename(project)
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            <span>Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onDuplicateProject(project)
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              confirmDelete(project)
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      Updated {formatRelativeTime(project.updatedAt)}
                    </span>
                  </div>
                  <div className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                    {project.pages.length} {project.pages.length === 1 ? 'page' : 'pages'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
