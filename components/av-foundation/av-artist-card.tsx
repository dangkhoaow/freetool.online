import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Artist } from "@/lib/av-foundation/artists-data"

interface AVArtistCardProps {
  artist: Artist
}

export function AVArtistCard({ artist }: AVArtistCardProps) {
  return (
    <Link href={`/av-foundation/artists/${artist.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={artist.profileImage || "/av-foundation/placeholder.svg"}
            alt={`Portrait of ${artist.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardHeader className="space-y-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{artist.name}</h3>
            <p className="text-sm text-muted-foreground">
              {artist.birthYear} - {artist.deathYear || "Present"}
            </p>
          </div>
          <Badge variant="secondary" className="w-fit text-xs">
            {artist.periodLabel}
          </Badge>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-2">{artist.biography}</p>
            <div className="flex flex-wrap gap-1">
              {artist.artisticStyle.slice(0, 2).map((style) => (
                <Badge key={style} variant="outline" className="text-xs">
                  {style}
                </Badge>
              ))}
              {artist.artisticStyle.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{artist.artisticStyle.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
