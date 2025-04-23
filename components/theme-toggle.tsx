"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Only show the toggle after component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    // Return empty div with same dimensions to prevent layout shift
    return <div className="p-2 rounded-md bg-gray-800 dark:bg-gray-700 w-[36px] h-[36px]" />
  }

  // Use resolvedTheme to correctly detect the actual theme (including system preference)
  const currentTheme = resolvedTheme || theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
      title={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
    >
      {currentTheme === "dark" ? (
        <Sun size={20} className="text-yellow-300" />
      ) : (
        <Moon size={20} className="text-gray-300" />
      )}
    </button>
  )
} 