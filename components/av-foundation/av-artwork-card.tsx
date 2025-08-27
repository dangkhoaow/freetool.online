import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Artwork } from "@/lib/av-foundation/artworks-data"

interface AVArtworkCardProps {
  artwork: Artwork
}

export function AVArtworkCard({ artwork }: AVArtworkCardProps) {
  const dimensionsText = artwork.dimensions.depth
    ? `${artwork.dimensions.height} × ${artwork.dimensions.width} × ${artwork.dimensions.depth} ${artwork.dimensions.unit}`
    : `${artwork.dimensions.height} × ${artwork.dimensions.width} ${artwork.dimensions.unit}`

  return (
    <Link href={`/av-foundation/collection/${artwork.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={artwork.images.primary || "/av-foundation/placeholder.svg"}
            alt={artwork.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardHeader className="space-y-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
              {artwork.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {artwork.artist.name} • {artwork.year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {artwork.classification.category.replace("-", " ")}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {artwork.periodLabel.split(" ")[0]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <p>{artwork.medium}</p>
              <p>{dimensionsText}</p>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{artwork.description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
