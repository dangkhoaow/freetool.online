import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { getNewsEventBySlug, newsEvents } from "@/lib/av-foundation/news-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AVNewsCard } from "@/components/av-foundation/av-news-card"
import Link from "next/link"
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react"
import { notFound } from "next/navigation"

interface AVNewsDetailPageProps {
  params: {
    slug: string
  }
}

export default function AVNewsDetailPage({ params }: AVNewsDetailPageProps) {
  const news = getNewsEventBySlug(params.slug)

  if (!news) {
    notFound()
  }

  const relatedNews = newsEvents.filter((n) => n.id !== news.id && n.category === news.category).slice(0, 3)

  const categoryColors = {
    "foundation-event": "bg-primary/10 text-primary",
    "community-news": "bg-secondary/10 text-secondary",
    "community-support": "bg-accent/10 text-accent",
    exhibition: "bg-primary/15 text-primary",
  }

  const categoryLabels = {
    "foundation-event": "Foundation Event",
    "community-news": "Community News",
    "community-support": "Community Support",
    exhibition: "Exhibition",
  }

  return (
    <div className="min-h-screen bg-background">
      <AVNavigation />
      
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/av-foundation/news" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <Badge className={categoryColors[news.category]}>{categoryLabels[news.category]}</Badge>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">{news.title}</h1>

          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(news.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {news.author}
            </div>
          </div>

          <p className="text-xl text-muted-foreground leading-relaxed">{news.excerpt}</p>
        </header>

        {/* Featured Image */}
        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-primary/10 to-secondary/10 p-2">
          <div className="w-full h-full rounded-xl overflow-hidden">
            <img src={news.image || "/av-foundation/placeholder.svg"} alt={news.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-16">
          <div
            className="text-foreground leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-16">
          {news.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full">
              #{tag}
            </Badge>
          ))}
        </div>
      </article>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Related Stories</h2>
              <p className="text-muted-foreground">More news from the same category</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedNews.map((relatedItem) => (
                <AVNewsCard key={relatedItem.id} newsEvent={relatedItem} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
