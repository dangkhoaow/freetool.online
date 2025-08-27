import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { AVArtistCard } from "@/components/av-foundation/av-artist-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { artistsData, getAllPeriods } from "@/lib/av-foundation/artists-data"
import { Users, Filter, Search } from "lucide-react"

export default function ArtistsPage() {
  const periods = getAllPeriods()
  const totalArtists = artistsData.length
  const activePeriods = [...new Set(artistsData.map(artist => artist.period))]

  return (
    <div className="min-h-screen bg-background">
      <AVNavigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              Vietnamese Artists Collection
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              Discover Vietnamese
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Artists
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore the lives and masterworks of Vietnamese artists who shaped the cultural landscape 
              from the Đông Dương period to contemporary times.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-4 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">{totalArtists}</CardTitle>
                <p className="text-sm text-muted-foreground">Featured Artists</p>
              </CardHeader>
            </Card>
            <Card className="text-center border-0 bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-secondary">{activePeriods.length}</CardTitle>
                <p className="text-sm text-muted-foreground">Art Periods</p>
              </CardHeader>
            </Card>
            <Card className="text-center border-0 bg-gradient-to-br from-accent/10 to-accent/5">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-accent">100+</CardTitle>
                <p className="text-sm text-muted-foreground">Years Covered</p>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Period Filters */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Filter by Period</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <Badge 
                  key={period.value} 
                  variant={period.value === "all" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {period.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Artists by Period */}
          {periods.filter(p => p.value !== "all").map((period) => {
            const periodArtists = artistsData.filter(artist => artist.period === period.value)
            
            if (periodArtists.length === 0) return null

            return (
              <div key={period.value} className="mb-16">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{period.label}</h2>
                  <p className="text-muted-foreground">
                    {periodArtists.length} artist{periodArtists.length !== 1 ? 's' : ''} from this period
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {periodArtists.map((artist) => (
                    <AVArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-card to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Explore Their Masterpieces
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Discover the artworks that made these artists legendary. Browse our comprehensive 
            collection to see their techniques, styles, and cultural impact.
          </p>
          <Button asChild size="lg" className="font-semibold px-8 py-6 rounded-xl">
            <a href="/av-foundation/collection">
              View Art Collection
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
