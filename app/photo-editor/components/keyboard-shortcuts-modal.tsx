"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { key: "Ctrl+Z", description: "Undo" },
    { key: "Ctrl+Shift+Z / Ctrl+Y", description: "Redo" },
    { key: "Ctrl+N", description: "New Canvas" },
    { key: "Ctrl+O", description: "Open Image" },
    { key: "Ctrl+S", description: "Save Image" },
    { key: "Ctrl+E", description: "Export Image" },
    { key: "Ctrl++ / Ctrl+Scroll Up", description: "Zoom In" },
    { key: "Ctrl+- / Ctrl+Scroll Down", description: "Zoom Out" },
    { key: "Ctrl+0", description: "Reset Zoom to 100%" },
    { key: "V", description: "Move Tool" },
    { key: "M", description: "Selection Tool" },
    { key: "W", description: "Magic Wand Tool" },
    { key: "B", description: "Brush Tool" },
    { key: "E", description: "Eraser Tool" },
    { key: "T", description: "Text Tool" },
    { key: "C", description: "Crop Tool" },
    { key: "I", description: "Eyedropper Tool" },
    { key: "H", description: "Hand Tool" },
    { key: "Delete / Backspace", description: "Delete Selected Layer" },
    { key: "Ctrl+Shift+N", description: "New Layer" },
    { key: "Ctrl+J", description: "Duplicate Layer" },
    { key: "Alt+Click on Eye Icon", description: "Solo Layer (Hide All Others)" },
    { key: "Shift+Click on Eye Icon", description: "Toggle All Layers Visibility" },
    { key: "Ctrl+G", description: "Group Layers" },
    { key: "Ctrl+Shift+G", description: "Ungroup Layers" },
    { key: "?", description: "Show Keyboard Shortcuts" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">{shortcut.description}</span>
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">{shortcut.key}</code>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
