"use client"
import { Button } from "@/components/ui/button"
import { RotateCcw, RefreshCw } from "lucide-react"

interface GameControlsProps {
  onUndo: () => void
  onReset: () => void
}

export default function GameControls({ onUndo, onReset }: GameControlsProps) {
  return (
    <div className="flex justify-center gap-4">
      <Button variant="outline" onClick={onUndo} className="flex items-center gap-2">
        <RotateCcw size={16} />
        Undo
      </Button>
      <Button variant="outline" onClick={onReset} className="flex items-center gap-2">
        <RefreshCw size={16} />
        New Game
      </Button>
    </div>
  )
}
