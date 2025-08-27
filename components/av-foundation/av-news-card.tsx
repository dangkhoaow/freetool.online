import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import type { NewsEvent } from "@/lib/av-foundation/news-data"

interface AVNewsCardProps {
  newsEvent: NewsEvent
}

export function AVNewsCard({ newsEvent }: AVNewsCardProps) {
  const categoryLabels = {
    "foundation-event": "Foundation Event",
    "community-news": "Community News",
    "community-support": "Community Support",
    "exhibition": "Exhibition"
  }

  const categoryColors = {
    "foundation-event": "bg-primary/10 text-primary",
    "community-news": "bg-secondary/10 text-secondary",
    "community-support": "bg-accent/10 text-accent",
    "exhibition": "bg-muted text-muted-foreground"
  }

  return (
    <Link href={`/av-foundation/news/${newsEvent.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={newsEvent.image || "/av-foundation/placeholder.svg"}
            alt={newsEvent.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge 
              className={`text-xs font-medium ${categoryColors[newsEvent.category]}`}
              variant="secondary"
            >
              {categoryLabels[newsEvent.category]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(newsEvent.date), { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
            {newsEvent.title}
          </h3>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">{newsEvent.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>By {newsEvent.author}</span>
            {newsEvent.featured && (
              <Badge variant="outline" className="text-xs">
                Featured
              </Badge>
            )}
          </div>
          {newsEvent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {newsEvent.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {newsEvent.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{newsEvent.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
