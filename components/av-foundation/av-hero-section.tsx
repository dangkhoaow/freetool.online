import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play, Star } from "lucide-react"

export function AVHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-animation opacity-10"></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-secondary/30 rounded-full blur-lg float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent/15 rounded-full blur-2xl float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              Trusted by 10,000+ Art Enthusiasts
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                Preserving
                <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Vietnamese Art
                </span>
                <span className="text-4xl lg:text-5xl text-muted-foreground">Heritage</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Discover the rich tapestry of Vietnamese art through our comprehensive collection, featuring renowned
                artists and their masterpieces spanning different periods of Vietnamese culture.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="group font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/av-foundation/collection" className="flex items-center gap-2">
                  Explore Collection
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="group font-semibold px-8 py-6 text-lg rounded-xl glass border-2 hover:bg-primary/5 bg-transparent"
              >
                <Link href="/av-foundation/artists" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Story
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Artworks</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-secondary">50+</div>
                <div className="text-sm text-muted-foreground">Artists</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-accent">100+</div>
                <div className="text-sm text-muted-foreground">Years History</div>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-8">
            <div className="relative group">
              {/* Main image container with modern styling */}
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-2">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/av-foundation/vietnamese-lotus-mountain-painting.png"
                    alt="Featured Vietnamese artwork showcasing traditional painting techniques"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Floating info cards */}
              <div className="absolute -top-4 -left-4 bg-white dark:bg-card p-4 rounded-2xl shadow-xl glass">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-semibold">Live Collection</p>
                    <p className="text-xs text-muted-foreground">Updated Daily</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl modern-card">
                <div className="text-center">
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-sm opacity-90">Curated Artworks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
