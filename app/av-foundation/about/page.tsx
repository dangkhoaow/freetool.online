import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { 
  Heart, 
  Users, 
  BookOpen, 
  Award, 
  ArrowRight, 
  Palette, 
  Globe, 
  Target,
  Star,
  Calendar,
  Building
} from "lucide-react"

export default function AVAboutPage() {
  const missionValues = [
    {
      icon: Heart,
      title: "Cultural Preservation",
      description: "Safeguarding Vietnamese artistic heritage for future generations through digital documentation and conservation efforts.",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      icon: BookOpen,
      title: "Education & Outreach",
      description: "Providing comprehensive educational resources about Vietnamese art history, techniques, and cultural significance.",
      gradient: "from-secondary/20 to-secondary/5",
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Connecting artists, scholars, collectors, and art enthusiasts to foster appreciation of Vietnamese culture.",
      gradient: "from-accent/20 to-accent/5",
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description: "Making Vietnamese art accessible worldwide through our digital platform and international partnerships.",
      gradient: "from-primary/15 to-secondary/10",
    },
  ]

  const achievements = [
    {
      number: "25+",
      label: "Years Experience",
      description: "Dedicated to Vietnamese art preservation"
    },
    {
      number: "500+",
      label: "Artworks Catalogued",
      description: "Comprehensive digital collection"
    },
    {
      number: "50+",
      label: "Featured Artists",
      description: "From historical to contemporary"
    },
    {
      number: "10K+",
      label: "Global Visitors",
      description: "Art enthusiasts worldwide"
    }
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
              <Building className="w-4 h-4" />
              About Our Foundation
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              About A&V
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Foundation
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Dedicated to preserving, promoting, and sharing the rich heritage of Vietnamese art through 
              digital innovation, cultural education, and community engagement.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Target className="w-4 h-4" />
                  Our Mission
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  Preserving Vietnamese
                  <span className="block text-primary">Cultural Heritage</span>
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    The A&V Foundation was established with the vision of becoming the world's leading digital repository 
                    for Vietnamese art and cultural heritage. Our mission encompasses the comprehensive documentation of 
                    artistic movements, support for contemporary artists, and education about Vietnamese cultural traditions.
                  </p>
                  <p>
                    Through our innovative digital platform, we bridge the gap between traditional Vietnamese art and 
                    modern accessibility, ensuring that this invaluable cultural heritage remains alive and accessible 
                    for future generations to discover, learn from, and be inspired by.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 p-3">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/av-foundation/vietnamese-art-gallery.png"
                    alt="Vietnamese art gallery showcasing traditional and contemporary works"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Floating achievement card */}
              <div className="absolute -top-6 -right-6 bg-white dark:bg-card p-6 rounded-2xl shadow-xl glass">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Artworks Preserved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
              <Heart className="w-4 h-4" />
              Our Core Values
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              What Drives Our
              <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Passion
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our foundation is built on four pillars that guide every aspect of our work in preserving 
              and promoting Vietnamese artistic heritage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {missionValues.map((value, index) => (
              <Card
                key={value.title}
                className={`group modern-card border-0 bg-gradient-to-br ${value.gradient} backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-white dark:bg-card rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{value.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-br from-card to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
              <Award className="w-4 h-4" />
              Our Impact
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Achievements &
              <span className="block bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Milestones
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center border-0 bg-gradient-to-br from-white/50 to-white/20 dark:from-card/50 dark:to-card/20 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-4xl font-bold text-primary mb-2">{achievement.number}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-foreground">{achievement.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History & Vision */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-secondary/10 to-accent/10 p-3">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/av-foundation/vietnamese-lotus-mountain-painting.png"
                    alt="Traditional Vietnamese lotus mountain painting representing our cultural heritage"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Floating element */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl glass">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-secondary" />
                  <div>
                    <p className="text-sm font-semibold">Since 1999</p>
                    <p className="text-xs text-muted-foreground">Preserving Heritage</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4" />
                  Our Story
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  A Legacy of
                  <span className="block text-secondary">Cultural Stewardship</span>
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Founded in 1999, the A&V Foundation began as a small initiative by art historians and cultural 
                    enthusiasts who recognized the urgent need to preserve Vietnam's rapidly disappearing artistic traditions. 
                    What started as a modest documentation project has evolved into the world's most comprehensive 
                    digital repository of Vietnamese art.
                  </p>
                  <p>
                    Today, we continue to expand our reach, partnering with museums, universities, and cultural institutions 
                    worldwide to ensure that Vietnamese artistic heritage remains accessible, studied, and celebrated 
                    across all communities and generations.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="font-semibold px-8 py-6 rounded-xl">
                  <Link href="/av-foundation/collection" className="flex items-center gap-2">
                    Explore Our Collection
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="font-semibold px-8 py-6 rounded-xl glass bg-transparent"
                >
                  <Link href="/av-foundation/artists">Meet Our Artists</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              Join Our Community
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Be Part of Our
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Cultural Mission
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Whether you're an art enthusiast, researcher, collector, or simply curious about Vietnamese culture, 
              we invite you to explore our collection and join our growing community of cultural advocates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-semibold px-8 py-6 rounded-xl text-lg">
                <Link href="/av-foundation/news" className="flex items-center gap-2">
                  Latest News & Events
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="font-semibold px-8 py-6 rounded-xl text-lg glass bg-transparent"
              >
                <Link href="/av-foundation/shop">Visit Our Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
