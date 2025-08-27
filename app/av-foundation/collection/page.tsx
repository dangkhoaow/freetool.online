"use client"

import { useState, useMemo } from "react"
import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { AVArtworkCard } from "@/components/av-foundation/av-artwork-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { artworksData, getAllCategories, getAllPeriods } from "@/lib/av-foundation/artworks-data"
import { artistsData } from "@/lib/av-foundation/artists-data"
import { Search, Filter, Grid, List } from "lucide-react"

export default function AVCollectionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedArtist, setSelectedArtist] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const periods = getAllPeriods()
  const categories = getAllCategories()

  // Get all artists for filter
  const allArtists = useMemo(() => {
    return [
      { value: "all", label: "All Artists" },
      ...artistsData.map((artist) => ({ value: artist.id, label: artist.name })),
    ]
  }, [])

  // Filter artworks based on search and filters
  const filteredArtworks = useMemo(() => {
    return artworksData.filter((artwork) => {
      const matchesSearch =
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesPeriod = selectedPeriod === "all" || artwork.period === selectedPeriod
      const matchesCategory = selectedCategory === "all" || artwork.classification.category === selectedCategory
      const matchesArtist = selectedArtist === "all" || artwork.artist.id === selectedArtist

      return matchesSearch && matchesPeriod && matchesCategory && matchesArtist && artwork.passwordLevel === "public"
    })
  }, [searchQuery, selectedPeriod, selectedCategory, selectedArtist])

  return (
    <div className="min-h-screen bg-background">
      <AVNavigation />

      {/* Header */}
      <section className="bg-card py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">A&V Art Collection</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our comprehensive collection of Vietnamese artworks, featuring masterpieces from different periods
              and artistic movements, carefully preserved and documented for cultural heritage.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Showing {filteredArtworks.length} artworks</span>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search artworks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {/* Artist Filter */}
              <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select artist" />
                </SelectTrigger>
                <SelectContent>
                  {allArtists.map((artist) => (
                    <SelectItem key={artist.value} value={artist.value}>
                      {artist.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Period Filter */}
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Artworks Grid/List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArtworks.length > 0 ? (
            <div
              className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-6"}
            >
              {filteredArtworks.map((artwork) => (
                <AVArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No artworks found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedPeriod("all")
                  setSelectedCategory("all")
                  setSelectedArtist("all")
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
