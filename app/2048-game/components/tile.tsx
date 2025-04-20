import { GRID_SIZE } from "@/lib/services/game-2048-service"

interface TileProps {
  value: number
  row: number
  col: number
}

export default function Tile({ value, row, col }: TileProps) {
  // Calculate the position of the tile
  const positionStyle = {
    top: `calc(${(row * 100) / GRID_SIZE}% + 0.5rem * ${row})`,
    left: `calc(${(col * 100) / GRID_SIZE}% + 0.5rem * ${col})`,
    width: `calc(${100 / GRID_SIZE}% - 0.5rem)`,
    height: `calc(${100 / GRID_SIZE}% - 0.5rem)`,
  }

  // Determine the background color based on the tile value
  const getBackgroundColor = () => {
    switch (value) {
      case 2:
        return "bg-[#eee4da] text-[#776e65]"
      case 4:
        return "bg-[#ede0c8] text-[#776e65]"
      case 8:
        return "bg-[#f2b179] text-white"
      case 16:
        return "bg-[#f59563] text-white"
      case 32:
        return "bg-[#f67c5f] text-white"
      case 64:
        return "bg-[#f65e3b] text-white"
      case 128:
        return "bg-[#edcf72] text-white"
      case 256:
        return "bg-[#edcc61] text-white"
      case 512:
        return "bg-[#edc850] text-white"
      case 1024:
        return "bg-[#edc53f] text-white"
      case 2048:
        return "bg-[#edc22e] text-white"
      default:
        return "bg-[#3c3a32] text-white" // For values > 2048
    }
  }

  // Determine the font size based on the number of digits
  const getFontSize = () => {
    const digits = value.toString().length
    if (digits <= 2) return "text-3xl"
    if (digits === 3) return "text-2xl"
    return "text-xl"
  }

  return (
    <div
      className={`absolute flex items-center justify-center rounded-md font-bold ${getBackgroundColor()} transition-all duration-100`}
      style={positionStyle}
    >
      <span className={`${getFontSize()}`}>{value}</span>
    </div>
  )
}
