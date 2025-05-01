"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  File, 
  Plus, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal, 
  Trash,
  Edit,
  Copy
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Project } from "./site-builder-tool"

interface NavigationPanelProps {
  project: Project | null
  onPageChange: (pageId: string) => void
  onAddPage: () => void
  onRenamePage: (pageId: string, newName: string) => void
  onDeletePage: (pageId: string) => void
  onDuplicatePage: (pageId: string) => void
}

export default function NavigationPanel({
  project,
  onPageChange,
  onAddPage,
  onRenamePage,
  onDeletePage,
  onDuplicatePage
}: NavigationPanelProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    pages: true
  })
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }))
  }

  const handleStartRename = (pageId: string, currentName: string) => {
    setEditingPageId(pageId)
    setEditingName(currentName)
  }

  const handleFinishRename = () => {
    if (editingPageId && editingName.trim()) {
      onRenamePage(editingPageId, editingName.trim())
    }
    setEditingPageId(null)
    setEditingName("")
  }

  if (!project) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No active project
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-medium text-sm dark:text-white">Project Structure</h3>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onAddPage}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {/* Project folder */}
          <div>
            <div 
              className="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToggleFolder('project')}
            >
              {expandedFolders['project'] ? (
                <ChevronDown className="h-4 w-4 mr-1 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
              )}
              <Folder className="h-4 w-4 mr-1 text-amber-500" />
              <span className="text-sm">{project.name}</span>
            </div>
            
            {expandedFolders['project'] && (
              <div className="ml-6 mt-1 space-y-1">
                {/* Pages folder */}
                <div>
                  <div 
                    className="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleToggleFolder('pages')}
                  >
                    {expandedFolders['pages'] ? (
                      <ChevronDown className="h-4 w-4 mr-1 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
                    )}
                    <Folder className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="text-sm">Pages</span>
                  </div>
                  
                  {expandedFolders['pages'] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {project.pages.map(page => (
                        <div 
                          key={page.id}
                          className={`flex items-center justify-between px-2 py-1 rounded group ${
                            page.id === project.currentPageId 
                              ? "bg-blue-100 dark:bg-blue-900/30" 
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <div 
                            className="flex items-center flex-1 cursor-pointer"
                            onClick={() => onPageChange(page.id)}
                          >
                            <File className="h-4 w-4 mr-1 text-gray-500" />
                            {editingPageId === page.id ? (
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={handleFinishRename}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleFinishRename()
                                  if (e.key === 'Escape') {
                                    setEditingPageId(null)
                                    setEditingName("")
                                  }
                                }}
                                autoFocus
                                className="h-6 text-xs py-0 px-1"
                              />
                            ) : (
                              <span className="text-sm">{page.name}</span>
                            )}
                          </div>
                          
                          {editingPageId !== page.id && (
                            <div className="opacity-0 group-hover:opacity-100">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => handleStartRename(page.id, page.name)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    <span>Rename</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onDuplicatePage(page.id)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    <span>Duplicate</span>
                                  </DropdownMenuItem>
                                  {project.pages.length > 1 && (
                                    <DropdownMenuItem 
                                      onClick={() => onDeletePage(page.id)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Assets folder */}
                <div>
                  <div 
                    className="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleToggleFolder('assets')}
                  >
                    {expandedFolders['assets'] ? (
                      <ChevronDown className="h-4 w-4 mr-1 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
                    )}
                    <Folder className="h-4 w-4 mr-1 text-green-500" />
                    <span className="text-sm">Assets</span>
                  </div>
                  
                  {expandedFolders['assets'] && (
                    <div className="ml-6 mt-1">
                      <p className="text-xs text-gray-500 italic px-2">
                        No assets yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
