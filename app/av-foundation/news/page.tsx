import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { newsEvents, getFeaturedNews } from "@/lib/av-foundation/news-data"
import { AVNewsCard } from "@/components/av-foundation/av-news-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter } from "lucide-react"

export default function AVNewsPage() {
  const featuredNews = getFeaturedNews()
  const regularNews = newsEvents.filter((news) => !news.featured)

  const categories = [
    { key: "all", label: "All News", count: newsEvents.length },
    {
      key: "foundation-event",
      label: "Foundation Events",
      count: newsEvents.filter((n) => n.category === "foundation-event").length,
    },
    {
      key: "community-news",
      label: "Community News",
      count: newsEvents.filter((n) => n.category === "community-news").length,
    },
    {
      key: "community-support",
      label: "Community Support",
      count: newsEvents.filter((n) => n.category === "community-support").length,
    },
    { key: "exhibition", label: "Exhibitions", count: newsEvents.filter((n) => n.category === "exhibition").length },
  ]

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
              <Calendar className="w-4 h-4" />
              Latest Updates
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              News &
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Events
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stay updated with the latest exhibitions, community programs, and cultural initiatives from the A&V
              Foundation.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-4 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Filter by Category</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={category.key === "all" ? "default" : "outline"}
                className="rounded-full"
              >
                {category.label}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Stories</h2>
              <p className="text-muted-foreground">Highlighting our most important news and events</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {featuredNews.map((news) => (
                <AVNewsCard key={news.id} newsEvent={news} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All News */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">All News & Events</h2>
            <p className="text-muted-foreground">
              Complete coverage of our foundation activities and community programs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularNews.map((news) => (
              <AVNewsCard key={news.id} newsEvent={news} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
