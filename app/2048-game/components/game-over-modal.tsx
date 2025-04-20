"use client"
import { Button } from "@/components/ui/button"
import { Trophy, X } from "lucide-react"

interface GameOverModalProps {
  won: boolean
  score: number
  onReset: () => void
  onContinue?: () => void
}

export default function GameOverModal({ won, score, onReset, onContinue }: GameOverModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
        {won ? (
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-yellow-100 p-3 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-300">
              <Trophy size={32} />
            </div>
          </div>
        ) : (
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900 dark:text-red-300">
              <X size={32} />
            </div>
          </div>
        )}

        <h3 className="mb-2 text-xl font-bold">{won ? "You Win!" : "Game Over!"}</h3>

        <p className="mb-4 text-gray-600 dark:text-gray-400">
          {won ? "Congratulations! You reached 2048!" : "No more moves available."}
        </p>

        <p className="mb-6 text-lg font-bold">Your score: {score}</p>

        <div className="flex flex-col gap-2">
          {won && onContinue && (
            <Button onClick={onContinue} variant="outline">
              Continue Playing
            </Button>
          )}
          <Button onClick={onReset}>New Game</Button>
        </div>
      </div>
    </div>
  )
}
