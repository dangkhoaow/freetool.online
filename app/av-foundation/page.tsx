import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { AVHeroSection } from "@/components/av-foundation/av-hero-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Palette, Users, Calendar, ShoppingBag, ArrowRight } from "lucide-react"

export default function AVHomePage() {
  const features = [
    {
      icon: Palette,
      title: "Art Collection",
      description: "Explore our comprehensive collection of Vietnamese artworks spanning different periods and styles.",
      href: "/av-foundation/collection",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      icon: Users,
      title: "Artist Profiles",
      description: "Discover the stories and masterpieces of renowned Vietnamese artists.",
      href: "/av-foundation/artists",
      gradient: "from-secondary/20 to-secondary/5",
    },
    {
      icon: Calendar,
      title: "News & Events",
      description: "Stay updated with exhibitions, cultural events, and foundation activities.",
      href: "/av-foundation/news",
      gradient: "from-accent/20 to-accent/5",
    },
    {
      icon: ShoppingBag,
      title: "Art Shop",
      description: "Browse and purchase carefully selected artworks and cultural items.",
      href: "/av-foundation/shop",
      gradient: "from-primary/15 to-secondary/10",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AVNavigation />
      <AVHeroSection />

      <section className="py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              Discover Our Platform
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground">
              Discover Vietnamese
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Art Heritage
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From traditional Đông Dương period to contemporary works, explore the evolution of Vietnamese artistic
              expression through our curated platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={`group modern-card border-0 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-white dark:bg-card rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full bg-white/50 dark:bg-card/50 backdrop-blur-sm border-white/20 hover:bg-white/70 dark:hover:bg-card/70 transition-all duration-300"
                  >
                    <Link href={feature.href} className="flex items-center gap-2">
                      Learn More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-br from-card to-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  About Our Mission
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  About A&V
                  <span className="block text-primary">Foundation</span>
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    The A&V Foundation is dedicated to preserving, promoting, and sharing the rich heritage of
                    Vietnamese art. Our mission encompasses the documentation of artistic movements, support for
                    contemporary artists, and education about Vietnamese cultural traditions.
                  </p>
                  <p>
                    Through our comprehensive digital platform, we provide access to detailed artist profiles, artwork
                    documentation, and cultural resources that span from the colonial Đông Dương period to contemporary
                    Vietnamese art.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="font-semibold px-8 py-6 rounded-xl">
                  <Link href="/av-foundation/about" className="flex items-center gap-2">
                    Learn More About Us
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="font-semibold px-8 py-6 rounded-xl glass bg-transparent"
                >
                  <Link href="/av-foundation/contact">Get In Touch</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 p-3">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/av-foundation/vietnamese-art-gallery.png"
                    alt="A&V Foundation gallery space"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl glass">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">25+</div>
                  <div className="text-xs text-muted-foreground">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-foreground to-foreground/90 text-background py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-lg">A&V</span>
                </div>
                <span className="font-bold text-2xl">A&V Foundation</span>
              </div>
              <p className="text-lg opacity-80 leading-relaxed max-w-md">
                Preserving and promoting Vietnamese art heritage for future generations through digital innovation and
                cultural preservation.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">FB</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">IG</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">TW</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-lg">Quick Links</h3>
              <div className="space-y-3">
                {[
                  { href: "/av-foundation/artists", label: "Artists" },
                  { href: "/av-foundation/collection", label: "Collection" },
                  { href: "/av-foundation/news", label: "News & Events" },
                  { href: "/av-foundation/shop", label: "Shop" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block opacity-80 hover:opacity-100 hover:text-primary transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-lg">Contact</h3>
              <div className="space-y-3 opacity-80">
                <p>info@avfoundation.org</p>
                <p>+84 (0) 123 456 789</p>
                <p>Ho Chi Minh City, Vietnam</p>
              </div>
            </div>
          </div>

          <div className="border-t border-background/20 pt-8 text-center opacity-60">
            <p>&copy; 2024 A&V Foundation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
