"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit, Check, X } from "lucide-react"
import { getFavoriteColors, removeFavoriteColor, saveFavoriteColor } from "@/lib/services/color-picker-service"

interface FavoriteColor {
  id: string
  color: string
  name: string
  createdAt: string
  updatedAt: string
}

interface FavoriteColorsProps {
  onSelectColor: (color: string) => void
}

export default function FavoriteColors({ onSelectColor }: FavoriteColorsProps) {
  const [favorites, setFavorites] = useState<FavoriteColor[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = () => {
      const favs = getFavoriteColors()
      setFavorites(favs)
    }

    loadFavorites()

    // Add event listener for storage changes
    window.addEventListener("storage", loadFavorites)

    return () => {
      window.removeEventListener("storage", loadFavorites)
    }
  }, [])

  const handleRemove = (id: string) => {
    removeFavoriteColor(id)
    setFavorites(favorites.filter((f) => f.id !== id))
  }

  const handleEdit = (favorite: FavoriteColor) => {
    setEditingId(favorite.id)
    setEditName(favorite.name)
  }

  const handleSaveEdit = (id: string, color: string) => {
    saveFavoriteColor(color, editName)
    setFavorites(favorites.map((f) => (f.id === id ? { ...f, name: editName } : f)))
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-4">Favorite Colors</div>

        {favorites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't saved any favorite colors yet.</p>
            <p className="mt-2">Use the color picker and click "Save to Favorites" to add colors here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="flex items-center p-2 border rounded-md hover:bg-gray-50">
                <div
                  className="w-10 h-10 rounded-md border mr-3 cursor-pointer"
                  style={{ backgroundColor: favorite.color }}
                  onClick={() => onSelectColor(favorite.color)}
                />

                {editingId === favorite.id ? (
                  <div className="flex-1 flex items-center">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 mr-2"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveEdit(favorite.id, favorite.color)}
                      className="mr-1"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium">{favorite.name}</div>
                      <div className="text-sm text-gray-500">{favorite.color.toUpperCase()}</div>
                    </div>

                    <div className="flex">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(favorite)} className="mr-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRemove(favorite.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
