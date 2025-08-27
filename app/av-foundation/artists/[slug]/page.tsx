import { notFound } from "next/navigation"
import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { AVArtworkCard } from "@/components/av-foundation/av-artwork-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getArtistBySlug } from "@/lib/av-foundation/artists-data"
import { getArtworksByArtist } from "@/lib/av-foundation/artworks-data"
import { CalendarDays, MapPin, Award, GraduationCap, Palette, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ArtistPageProps {
  params: {
    slug: string
  }
}

export default function ArtistPage({ params }: ArtistPageProps) {
  const artist = getArtistBySlug(params.slug)
  
  if (!artist) {
    notFound()
  }

  const artworks = getArtworksByArtist(artist.id)

  return (
    <div className="min-h-screen bg-background">
      <AVNavigation />
      
      {/* Back Navigation */}
      <section className="pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/av-foundation/artists" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Artists
            </Link>
          </Button>
        </div>
      </section>

      {/* Artist Hero */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary">
                  {artist.periodLabel}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
                  {artist.name}
                </h1>
                {artist.nameVietnamese && artist.nameVietnamese !== artist.name && (
                  <p className="text-2xl text-muted-foreground font-medium">
                    {artist.nameVietnamese}
                  </p>
                )}
                <div className="flex items-center gap-4 text-lg text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    {artist.birthYear} - {artist.deathYear || "Present"}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {artist.birthPlace}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Artistic Styles</h2>
                <div className="flex flex-wrap gap-2">
                  {artist.artisticStyle.map((style) => (
                    <Badge key={style} variant="outline" className="text-sm">
                      <Palette className="w-3 h-3 mr-1" />
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 p-3">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={artist.profileImage}
                    alt={`Portrait of ${artist.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Biography */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Biography</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {artist.biography}
            </p>
          </div>
        </div>
      </section>

      {/* Education, Awards, Exhibitions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Education */}
            {artist.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {artist.education.map((edu, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-semibold">{edu.institution}</p>
                      {edu.degree && (
                        <p className="text-sm text-muted-foreground">{edu.degree}</p>
                      )}
                      <p className="text-sm text-primary">{edu.year}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Awards */}
            {artist.awards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Awards & Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {artist.awards.map((award, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-semibold">{award.title}</p>
                      <p className="text-sm text-muted-foreground">{award.organization}</p>
                      <p className="text-sm text-primary">{award.year}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Exhibitions */}
            {artist.exhibitions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Notable Exhibitions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {artist.exhibitions.map((exhibition, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-semibold">{exhibition.title}</p>
                      <p className="text-sm text-muted-foreground">{exhibition.location}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-primary">{exhibition.year}</p>
                        <Badge variant="outline" className="text-xs">
                          {exhibition.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Artist's Artworks */}
      {artist.artworks.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Featured Artworks by {artist.name}
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore the masterpieces that define this artist's legacy
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artist.artworks.map((artwork) => {
                // Convert artist artwork to full artwork format for the card
                const fullArtwork = {
                  id: artwork.id,
                  inventoryNumber: `AV-${artwork.id}`,
                  title: artwork.title,
                  artist: {
                    id: artist.id,
                    name: artist.name,
                    slug: artist.slug,
                  },
                  year: artwork.year,
                  medium: artwork.medium,
                  dimensions: {
                    height: parseInt(artwork.dimensions.split('x')[0]),
                    width: parseInt(artwork.dimensions.split('x')[1]),
                    unit: "cm" as const,
                  },
                  description: artwork.description,
                  period: artist.period,
                  periodLabel: artist.periodLabel,
                  classification: {
                    category: "painting" as const,
                    subcategory: "Traditional",
                    technique: artwork.medium,
                  },
                  condition: "excellent" as const,
                  provenance: {
                    acquisition: {
                      date: "2024-01-01",
                      method: "collection" as const,
                      source: "Foundation Collection",
                    },
                  },
                  storage: {
                    location: "Foundation Archive",
                    environment: {
                      temperature: "18-20°C",
                      humidity: "45-55% RH",
                      lighting: "UV-filtered LED, <50 lux",
                    },
                    security: "high" as const,
                  },
                  images: {
                    primary: artwork.image,
                    gallery: [artwork.image],
                  },
                  isPublic: true,
                  passwordLevel: "public" as const,
                  tags: [],
                }

                return <AVArtworkCard key={artwork.id} artwork={fullArtwork} />
              })}
            </div>

            {artworks.length > 0 && (
              <div className="text-center mt-12">
                <Separator className="mb-8" />
                <h3 className="text-xl font-semibold mb-4">
                  More works by {artist.name} in our collection
                </h3>
                <Button asChild variant="outline">
                  <Link href={`/av-foundation/collection?artist=${artist.slug}`}>
                    View Complete Collection
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
