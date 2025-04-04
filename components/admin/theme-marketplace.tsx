"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Star } from "lucide-react"

export default function ThemeMarketplace() {
  const router = useRouter()
  const [themes, setThemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("popular")

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/themes/marketplace?q=${searchQuery}&sort=${sortBy}`)
        if (response.ok) {
          const data = await response.json()
          setThemes(data)
        } else {
          console.error("Failed to fetch marketplace themes")
        }
      } catch (error) {
        console.error("Error fetching marketplace themes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchThemes()
  }, [searchQuery, sortBy])

  const handleInstall = async (themeId: string) => {
    // In a real app, this would install the theme
    console.log("Installing theme:", themeId)

    // Simulate installation
    setTimeout(() => {
      router.refresh()
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search themes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading themes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <Card key={theme.id}>
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={theme.thumbnail || "/placeholder.svg"}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{theme.name}</CardTitle>
                    <CardDescription>by {theme.author}</CardDescription>
                  </div>
                  <Badge variant={theme.price === 0 ? "secondary" : "default"}>
                    {theme.price === 0 ? "Free" : `$${theme.price}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{theme.description}</p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(theme.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">({theme.rating.toFixed(1)})</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {theme.downloads.toLocaleString()} downloads
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleInstall(theme.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  {theme.price === 0 ? "Install" : "Purchase & Install"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

