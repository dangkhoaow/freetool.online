import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { getProductBySlug, shopProducts, formatPrice } from "@/lib/av-foundation/shop-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AVProductCard } from "@/components/av-foundation/av-product-card"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { notFound } from "next/navigation"

interface AVProductDetailPageProps {
  params: {
    slug: string
  }
}

export default function AVProductDetailPage({ params }: AVProductDetailPageProps) {
  const product = getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = shopProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3)

  const categoryColors = {
    "original-artwork": "bg-primary/10 text-primary",
    prints: "bg-secondary/10 text-secondary",
    books: "bg-accent/10 text-accent",
    "cultural-items": "bg-primary/15 text-primary",
    accessories: "bg-secondary/15 text-secondary",
  }

  const categoryLabels = {
    "original-artwork": "Original Artwork",
    prints: "Prints",
    books: "Books",
    "cultural-items": "Cultural Items",
    accessories: "Accessories",
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <AVNavigation />
      
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-16 mb-0">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/av-foundation/shop" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </Button>
      </div>

      {/* Product Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 p-3">
              <div className="w-full h-full rounded-xl overflow-hidden">
                <img
                  src={product.images[0] || "/av-foundation/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {product.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={image || "/av-foundation/placeholder.svg"}
                      alt={`${product.title} - View ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={categoryColors[product.category]}>{categoryLabels[product.category]}</Badge>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              {product.artist && <p className="text-lg text-muted-foreground">by {product.artist}</p>}

              <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">{product.title}</h1>

              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge variant="destructive">Save {discountPercentage}%</Badge>
                  </>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="space-y-4 p-6 bg-card/50 rounded-2xl">
              <h3 className="font-semibold text-foreground">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.medium && (
                  <div>
                    <span className="text-muted-foreground">Medium:</span>
                    <p className="font-medium">{product.medium}</p>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <p className="font-medium">{product.dimensions}</p>
                  </div>
                )}
                {product.year && (
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <p className="font-medium">{product.year}</p>
                  </div>
                )}
                {product.edition && (
                  <div>
                    <span className="text-muted-foreground">Edition:</span>
                    <p className="font-medium">{product.edition}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Stock:</span>
                  <p className="font-medium">
                    {product.inStock ? `${product.stockQuantity} available` : "Out of stock"}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Actions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button size="lg" className="flex-1 font-semibold px-8 py-6 rounded-xl" disabled={!product.inStock}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button variant="outline" size="lg" className="px-6 py-6 rounded-xl bg-transparent">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {product.inStock && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-semibold px-8 py-6 rounded-xl bg-transparent"
                >
                  Buy Now
                </Button>
              )}
            </div>

            {/* Shipping & Returns */}
            <div className="space-y-4 p-6 bg-muted/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On orders over $200</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Authenticity Guarantee</p>
                  <p className="text-sm text-muted-foreground">Certificate of authenticity included</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">30-Day Returns</p>
                  <p className="text-sm text-muted-foreground">Easy returns and exchanges</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Related Products</h2>
              <p className="text-muted-foreground">More items from the same category</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <AVProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
