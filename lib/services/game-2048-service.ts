// Game constants
export const GRID_SIZE = 4
export const CELL_COUNT = GRID_SIZE * GRID_SIZE
export const WINNING_VALUE = 2048

// Game state interface
export interface GameState {
  grid: number[][]
  score: number
  bestScore: number
  gameOver: boolean
  won: boolean
  history: {
    grid: number[][]
    score: number
  }[]
}

// Direction enum
export enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

// Initialize a new game state
export function initializeGame(): GameState {
  const savedState = loadGameState()
  if (savedState) {
    return savedState
  }

  const grid = createEmptyGrid()
  addRandomTile(grid)
  addRandomTile(grid)

  return {
    grid,
    score: 0,
    bestScore: loadBestScore(),
    gameOver: false,
    won: false,
    history: [],
  }
}

// Create an empty grid
export function createEmptyGrid(): number[][] {
  return Array(GRID_SIZE)
    .fill(0)
    .map(() => Array(GRID_SIZE).fill(0))
}

// Add a random tile (2 or 4) to an empty cell
export function addRandomTile(grid: number[][]): void {
  const emptyCells = []

  // Find all empty cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        emptyCells.push({ row, col })
      }
    }
  }

  // If there are empty cells, add a random tile
  if (emptyCells.length > 0) {
    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    grid[row][col] = Math.random() < 0.9 ? 2 : 4 // 90% chance of 2, 10% chance of 4
  }
}

// Check if the game is over (no more moves possible)
export function isGameOver(grid: number[][]): boolean {
  // Check if the grid is full
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        return false // There's an empty cell, game is not over
      }
    }
  }

  // Check if there are any possible merges
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = grid[row][col]

      // Check right
      if (col < GRID_SIZE - 1 && grid[row][col + 1] === value) {
        return false // There's a possible merge, game is not over
      }

      // Check down
      if (row < GRID_SIZE - 1 && grid[row + 1][col] === value) {
        return false // There's a possible merge, game is not over
      }
    }
  }

  return true // No empty cells and no possible merges, game is over
}

// Check if the player has won (reached 2048)
export function checkWin(grid: number[][]): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === WINNING_VALUE) {
        return true
      }
    }
  }
  return false
}

// Move tiles in a direction and return if the grid changed
export function moveTiles(gameState: GameState, direction: Direction): { moved: boolean; scoreGain: number } {
  // Save the current state to history before making a move
  const historyEntry = {
    grid: JSON.parse(JSON.stringify(gameState.grid)),
    score: gameState.score,
  }

  let moved = false
  let scoreGain = 0

  // Create a copy of the grid to work with
  const newGrid = JSON.parse(JSON.stringify(gameState.grid))

  switch (direction) {
    case Direction.UP:
      for (let col = 0; col < GRID_SIZE; col++) {
        const result = moveLine(getColumn(newGrid, col))
        if (result.moved) {
          setColumn(newGrid, col, result.line)
          moved = true
          scoreGain += result.scoreGain
        }
      }
      break

    case Direction.RIGHT:
      for (let row = 0; row < GRID_SIZE; row++) {
        const line = [...newGrid[row]].reverse()
        const result = moveLine(line)
        if (result.moved) {
          newGrid[row] = result.line.reverse()
          moved = true
          scoreGain += result.scoreGain
        }
      }
      break

    case Direction.DOWN:
      for (let col = 0; col < GRID_SIZE; col++) {
        const line = getColumn(newGrid, col).reverse()
        const result = moveLine(line)
        if (result.moved) {
          setColumn(newGrid, col, result.line.reverse())
          moved = true
          scoreGain += result.scoreGain
        }
      }
      break

    case Direction.LEFT:
      for (let row = 0; row < GRID_SIZE; row++) {
        const result = moveLine(newGrid[row])
        if (result.moved) {
          newGrid[row] = result.line
          moved = true
          scoreGain += result.scoreGain
        }
      }
      break
  }

  if (moved) {
    // Update the game state
    gameState.grid = newGrid
    gameState.score += scoreGain
    gameState.history.push(historyEntry)

    // Check if the player has won
    if (!gameState.won && checkWin(newGrid)) {
      gameState.won = true
    }

    // Add a new random tile
    addRandomTile(gameState.grid)

    // Check if the game is over
    if (isGameOver(gameState.grid)) {
      gameState.gameOver = true
    }

    // Update best score if needed
    if (gameState.score > gameState.bestScore) {
      gameState.bestScore = gameState.score
      saveBestScore(gameState.bestScore)
    }

    // Save the game state
    saveGameState(gameState)
  }

  return { moved, scoreGain }
}

// Helper function to get a column from the grid
function getColumn(grid: number[][], col: number): number[] {
  return grid.map((row) => row[col])
}

// Helper function to set a column in the grid
function setColumn(grid: number[][], col: number, column: number[]): void {
  for (let row = 0; row < GRID_SIZE; row++) {
    grid[row][col] = column[row]
  }
}

// Move a single line (row or column) and return if it changed
function moveLine(line: number[]): { line: number[]; moved: boolean; scoreGain: number } {
  const originalLine = [...line]
  let scoreGain = 0

  // Remove zeros
  const nonZeros = line.filter((cell) => cell !== 0)

  // Merge tiles
  const mergedLine = []
  for (let i = 0; i < nonZeros.length; i++) {
    if (i < nonZeros.length - 1 && nonZeros[i] === nonZeros[i + 1]) {
      const mergedValue = nonZeros[i] * 2
      mergedLine.push(mergedValue)
      scoreGain += mergedValue
      i++ // Skip the next tile since it's been merged
    } else {
      mergedLine.push(nonZeros[i])
    }
  }

  // Fill with zeros
  const newLine = [...mergedLine, ...Array(GRID_SIZE - mergedLine.length).fill(0)]

  // Check if the line changed
  const moved = !newLine.every((value, index) => value === originalLine[index])

  return { line: newLine, moved, scoreGain }
}

// Undo the last move
export function undoMove(gameState: GameState): boolean {
  if (gameState.history.length === 0) {
    return false
  }

  const lastState = gameState.history.pop()!
  gameState.grid = lastState.grid
  gameState.score = lastState.score
  gameState.gameOver = false
  gameState.won = checkWin(lastState.grid)

  // Save the updated game state
  saveGameState(gameState)

  return true
}

// Reset the game
export function resetGame(gameState: GameState): void {
  const grid = createEmptyGrid()
  addRandomTile(grid)
  addRandomTile(grid)

  gameState.grid = grid
  gameState.score = 0
  gameState.gameOver = false
  gameState.won = false
  gameState.history = []

  // Save the updated game state
  saveGameState(gameState)
}

// Save the game state to localStorage
export function saveGameState(gameState: GameState): void {
  try {
    localStorage.setItem(
      "2048_game_state",
      JSON.stringify({
        grid: gameState.grid,
        score: gameState.score,
        bestScore: gameState.bestScore,
        gameOver: gameState.gameOver,
        won: gameState.won,
        history: gameState.history,
      }),
    )
  } catch (error) {
    console.error("Failed to save game state:", error)
  }
}

// Load the game state from localStorage
export function loadGameState(): GameState | null {
  try {
    const savedState = localStorage.getItem("2048_game_state")
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (error) {
    console.error("Failed to load game state:", error)
  }
  return null
}

// Save the best score to localStorage
export function saveBestScore(score: number): void {
  try {
    localStorage.setItem("2048_best_score", score.toString())
  } catch (error) {
    console.error("Failed to save best score:", error)
  }
}

// Load the best score from localStorage
export function loadBestScore(): number {
  try {
    const savedScore = localStorage.getItem("2048_best_score")
    if (savedScore) {
      return Number.parseInt(savedScore, 10)
    }
  } catch (error) {
    console.error("Failed to load best score:", error)
  }
  return 0
}
