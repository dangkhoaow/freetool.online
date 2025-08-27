import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { shopProducts, getFeaturedProducts } from "@/lib/av-foundation/shop-data"
import { AVProductCard } from "@/components/av-foundation/av-product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Search, Filter, Grid, List } from "lucide-react"

export default function AVShopPage() {
  const featuredProducts = getFeaturedProducts()
  const regularProducts = shopProducts.filter((product) => !product.featured)

  const categories = [
    { key: "all", label: "All Products", count: shopProducts.length },
    {
      key: "original-artwork",
      label: "Original Artwork",
      count: shopProducts.filter((p) => p.category === "original-artwork").length,
    },
    { key: "prints", label: "Prints", count: shopProducts.filter((p) => p.category === "prints").length },
    { key: "books", label: "Books", count: shopProducts.filter((p) => p.category === "books").length },
    {
      key: "cultural-items",
      label: "Cultural Items",
      count: shopProducts.filter((p) => p.category === "cultural-items").length,
    },
    {
      key: "accessories",
      label: "Accessories",
      count: shopProducts.filter((p) => p.category === "accessories").length,
    },
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
              <ShoppingBag className="w-4 h-4" />
              Art Cozy Shop
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              Art
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Collection
              </span>
              <span className="text-3xl lg:text-4xl text-muted-foreground">Shop</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover and purchase carefully curated Vietnamese artworks, cultural items, and educational materials
              from our foundation collection.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-8">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search artworks, artists, or items..." className="pl-10 rounded-xl" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filter by:</span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                  <Grid className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <List className="w-4 h-4" />
                </Button>
              </div>
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

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Artworks</h2>
              <p className="text-muted-foreground">Handpicked masterpieces from our collection</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <AVProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">All Products</h2>
              <p className="text-muted-foreground">Browse our complete collection of artworks and cultural items</p>
            </div>

            <div className="text-sm text-muted-foreground">Showing {shopProducts.length} products</div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regularProducts.map((product) => (
              <AVProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
