import { notFound } from "next/navigation"
import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getArtworkById } from "@/lib/av-foundation/artworks-data"
import Link from "next/link"
import { ArrowLeft, Calendar, Ruler, Palette, MapPin, Shield, Thermometer, Eye, DollarSign } from "lucide-react"

interface AVArtworkPageProps {
  params: {
    id: string
  }
}

export default function AVArtworkPage({ params }: AVArtworkPageProps) {
  const artwork = getArtworkById(params.id)

  if (!artwork) {
    notFound()
  }

  const dimensionsText = artwork.dimensions.depth
    ? `${artwork.dimensions.height} × ${artwork.dimensions.width} × ${artwork.dimensions.depth} ${artwork.dimensions.unit}`
    : `${artwork.dimensions.height} × ${artwork.dimensions.width} ${artwork.dimensions.unit}`

  return (
    <div className="min-h-screen bg-background">
      <AVNavigation />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-16 mb-0">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/av-foundation/collection">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collection
          </Link>
        </Button>
      </div>

      {/* Artwork Header */}
      <section className="bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Artwork Image */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <img
                  src={artwork.images.primary || "/av-foundation/placeholder.svg"}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Gallery */}
              {artwork.images.gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {artwork.images.gallery.slice(1).map((image, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden bg-muted">
                      <img
                        src={image || "/av-foundation/placeholder.svg"}
                        alt={`${artwork.title} detail ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Artwork Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-2">{artwork.title}</h1>
                  {artwork.titleVietnamese && (
                    <p className="text-xl text-muted-foreground italic mb-4">{artwork.titleVietnamese}</p>
                  )}
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <Link
                      href={`/av-foundation/artists/${artwork.artist.slug}`}
                      className="hover:text-primary transition-colors font-medium"
                    >
                      {artwork.artist.name}
                    </Link>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{artwork.year}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{artwork.periodLabel}</Badge>
                  <Badge variant="outline">{artwork.classification.category.replace("-", " ")}</Badge>
                  <Badge variant="outline" className="capitalize">
                    {artwork.condition}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Palette className="w-4 h-4" />
                      <span className="font-medium">Medium</span>
                    </div>
                    <p>{artwork.medium}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ruler className="w-4 h-4" />
                      <span className="font-medium">Dimensions</span>
                    </div>
                    <p>{dimensionsText}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{artwork.description}</p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Technical Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Inventory Number</p>
                      <p className="font-mono">{artwork.inventoryNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Classification</p>
                      <p>{artwork.classification.subcategory}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Technique</p>
                      <p>{artwork.classification.technique}</p>
                    </div>
                    {artwork.weight && (
                      <div>
                        <p className="font-medium text-muted-foreground">Weight</p>
                        <p>
                          {artwork.weight.value} {artwork.weight.unit}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Storage Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Storage & Conservation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Location</p>
                      <p>{artwork.storage.location}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-muted-foreground flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          Temperature
                        </p>
                        <p>{artwork.storage.environment.temperature}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Humidity</p>
                        <p>{artwork.storage.environment.humidity}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Lighting</p>
                      <p>{artwork.storage.environment.lighting}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Security Level</p>
                      <Badge variant="outline" className="capitalize">
                        {artwork.storage.security}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Provenance */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Provenance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Acquisition</p>
                      <p className="capitalize">
                        {artwork.provenance.acquisition.method} from {artwork.provenance.acquisition.source}
                      </p>
                      <p className="text-xs text-muted-foreground">{artwork.provenance.acquisition.date}</p>
                    </div>

                    {artwork.provenance.previousOwners && artwork.provenance.previousOwners.length > 0 && (
                      <div>
                        <p className="font-medium text-muted-foreground">Previous Owners</p>
                        {artwork.provenance.previousOwners.map((owner, index) => (
                          <div key={index} className="ml-2">
                            <p>{owner.name}</p>
                            <p className="text-xs text-muted-foreground">{owner.period}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Exhibitions */}
              {artwork.provenance.exhibitions && artwork.provenance.exhibitions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Exhibition History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {artwork.provenance.exhibitions.map((exhibition, index) => (
                      <div key={index} className="space-y-1 text-sm">
                        <p className="font-medium">{exhibition.title}</p>
                        <p className="text-muted-foreground">{exhibition.venue}</p>
                        <p className="text-xs text-muted-foreground">{exhibition.date}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Valuation */}
              {artwork.estimatedValue && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Estimated Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="text-2xl font-bold text-foreground">
                        {artwork.estimatedValue.currency} {artwork.estimatedValue.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">As of {artwork.estimatedValue.date}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
