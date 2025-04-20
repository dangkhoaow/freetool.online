import Tile from "./tile"
import { GRID_SIZE } from "@/lib/services/game-2048-service"

interface GameBoardProps {
  grid: number[][]
}

export default function GameBoard({ grid }: GameBoardProps) {
  // Create an array of indices for the grid
  const indices = Array.from({ length: GRID_SIZE }, (_, i) => i)

  return (
    <div className="relative rounded-md bg-gray-300 p-2 dark:bg-gray-700">
      {/* Background grid */}
      <div className="grid grid-cols-4 gap-2">
        {indices.map((row) =>
          indices.map((col) => (
            <div key={`cell-${row}-${col}`} className="aspect-square rounded-md bg-gray-400 dark:bg-gray-600" />
          )),
        )}
      </div>

      {/* Tiles */}
      <div className="absolute inset-0 p-2">
        <div className="relative h-full w-full">
          {indices.map((row) =>
            indices.map(
              (col) =>
                grid[row][col] > 0 && <Tile key={`tile-${row}-${col}`} value={grid[row][col]} row={row} col={col} />,
            ),
          )}
        </div>
      </div>
    </div>
  )
}
