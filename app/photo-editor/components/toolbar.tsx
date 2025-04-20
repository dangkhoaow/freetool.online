"use client"

import type React from "react"

import type { EditorTool } from "./photo-editor"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  MousePointer,
  TextSelectIcon as Selection,
  Wand2,
  Paintbrush,
  Eraser,
  Type,
  Square,
  Crop,
  Droplets,
  Hand,
  Plus,
  Trash,
  Undo,
  Redo,
  Upload,
} from "lucide-react"

interface ToolbarProps {
  currentTool: EditorTool
  setCurrentTool: (tool: EditorTool) => void
  onAddLayer: () => void
  onDeleteLayer: () => void
  canDeleteLayer: boolean
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Toolbar({
  currentTool,
  setCurrentTool,
  onAddLayer,
  onDeleteLayer,
  canDeleteLayer,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onUploadImage,
}: ToolbarProps) {
  const tools = [
    { id: "move" as EditorTool, icon: MousePointer, tooltip: "Move Tool (V)" },
    { id: "selection" as EditorTool, icon: Selection, tooltip: "Selection Tool (M)" },
    { id: "magicWand" as EditorTool, icon: Wand2, tooltip: "Magic Wand Tool (W)" },
    { id: "brush" as EditorTool, icon: Paintbrush, tooltip: "Brush Tool (B)" },
    { id: "eraser" as EditorTool, icon: Eraser, tooltip: "Eraser Tool (E)" },
    { id: "text" as EditorTool, icon: Type, tooltip: "Text Tool (T)" },
    { id: "shape" as EditorTool, icon: Square, tooltip: "Shape Tool (U)" },
    { id: "crop" as EditorTool, icon: Crop, tooltip: "Crop Tool (C)" },
    { id: "eyedropper" as EditorTool, icon: Droplets, tooltip: "Eyedropper Tool (I)" },
    { id: "hand" as EditorTool, icon: Hand, tooltip: "Hand Tool (H)" },
  ]

  return (
    <div className="w-16 bg-slate-50 dark:bg-slate-900 border-r flex flex-col">
      <TooltipProvider>
        <div className="p-2 space-y-2">
          {tools.map((tool) => (
            <Tooltip key={tool.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === tool.id ? "default" : "ghost"}
                  size="icon"
                  className={`w-full h-10 ${currentTool === tool.id ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setCurrentTool(tool.id)}
                >
                  <tool.icon className="h-5 w-5" />
                  <span className="sr-only">{tool.tooltip}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <Button
            variant={currentTool === "upload" ? "default" : "ghost"}
            size="icon"
            onClick={() => document.getElementById("image-upload")?.click()}
            className="relative w-full h-10"
            title="Upload Image (U)"
          >
            <Upload className="h-5 w-5" />
            <span className="sr-only">Upload Image</span>
            <input type="file" id="image-upload" className="sr-only" accept="image/*" onChange={onUploadImage} />
          </Button>
        </div>

        <div className="mt-auto p-2 space-y-2 border-t">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full h-10" onClick={onUndo} disabled={!canUndo}>
                <Undo className="h-5 w-5" />
                <span className="sr-only">Undo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full h-10" onClick={onRedo} disabled={!canRedo}>
                <Redo className="h-5 w-5" />
                <span className="sr-only">Redo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full h-10" onClick={onAddLayer}>
                <Plus className="h-5 w-5" />
                <span className="sr-only">Add Layer</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add Layer (Ctrl+Shift+N)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-10"
                onClick={onDeleteLayer}
                disabled={!canDeleteLayer}
              >
                <Trash className="h-5 w-5" />
                <span className="sr-only">Delete Layer</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Delete Layer (Delete)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
