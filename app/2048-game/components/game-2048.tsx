"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import GameBoard from "./game-board"
import GameControls from "./game-controls"
import GameOverModal from "./game-over-modal"
import {
  initializeGame,
  moveTiles,
  resetGame,
  undoMove,
  Direction,
  type GameState,
} from "@/lib/services/game-2048-service"

export default function Game2048() {
  const [gameState, setGameState] = useState<GameState>(initializeGame)
  const [showWinModal, setShowWinModal] = useState(false)
  const [showLoseModal, setShowLoseModal] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameState.gameOver) return

      let direction: Direction | null = null

      switch (event.key) {
        case "ArrowUp":
          direction = Direction.UP
          break
        case "ArrowRight":
          direction = Direction.RIGHT
          break
        case "ArrowDown":
          direction = Direction.DOWN
          break
        case "ArrowLeft":
          direction = Direction.LEFT
          break
        default:
          return // Not an arrow key
      }

      // Prevent default behavior (scrolling)
      event.preventDefault()

      // Clone the game state to avoid direct mutation
      const newGameState = { ...gameState, grid: JSON.parse(JSON.stringify(gameState.grid)) }

      // Move tiles in the specified direction
      const { moved } = moveTiles(newGameState, direction)

      if (moved) {
        setGameState(newGameState)

        // Check for win/lose conditions
        if (newGameState.won && !showWinModal) {
          setShowWinModal(true)
        } else if (newGameState.gameOver && !showLoseModal) {
          setShowLoseModal(true)
        }
      }
    },
    [gameState, showWinModal, showLoseModal],
  )

  // Handle touch input for mobile devices
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y

    // Determine the direction of the swipe
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      let direction: Direction

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        direction = deltaX > 0 ? Direction.RIGHT : Direction.LEFT
      } else {
        // Vertical swipe
        direction = deltaY > 0 ? Direction.DOWN : Direction.UP
      }

      // Clone the game state to avoid direct mutation
      const newGameState = { ...gameState, grid: JSON.parse(JSON.stringify(gameState.grid)) }

      // Move tiles in the specified direction
      const { moved } = moveTiles(newGameState, direction)

      if (moved) {
        setGameState(newGameState)

        // Check for win/lose conditions
        if (newGameState.won && !showWinModal) {
          setShowWinModal(true)
        } else if (newGameState.gameOver && !showLoseModal) {
          setShowLoseModal(true)
        }
      }
    }

    setTouchStart(null)
  }

  // Handle undo
  const handleUndo = () => {
    const newGameState = { ...gameState, grid: JSON.parse(JSON.stringify(gameState.grid)) }
    if (undoMove(newGameState)) {
      setGameState(newGameState)
      setShowLoseModal(false)
    }
  }

  // Handle reset
  const handleReset = () => {
    const newGameState = { ...gameState }
    resetGame(newGameState)
    setGameState(newGameState)
    setShowWinModal(false)
    setShowLoseModal(false)
  }

  // Handle continue after winning
  const handleContinue = () => {
    setShowWinModal(false)
  }

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">2048</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Join the tiles, get to 2048!</p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-md bg-gray-200 p-2 dark:bg-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400">SCORE</div>
            <div className="text-xl font-bold">{gameState.score}</div>
          </div>
          <div className="rounded-md bg-gray-200 p-2 dark:bg-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400">BEST</div>
            <div className="text-xl font-bold">{gameState.bestScore}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 touch-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <GameBoard grid={gameState.grid} />
      </div>

      <GameControls onUndo={handleUndo} onReset={handleReset} />

      <div className="mt-6 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>HOW TO PLAY:</strong> Use your arrow keys to move the tiles. When two tiles with the same number
          touch, they merge into one!
        </p>
      </div>

      {showWinModal && (
        <GameOverModal won={true} score={gameState.score} onReset={handleReset} onContinue={handleContinue} />
      )}

      {showLoseModal && <GameOverModal won={false} score={gameState.score} onReset={handleReset} />}
    </div>
  )
}
