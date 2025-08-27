import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Star } from "lucide-react"
import type { ShopProduct } from "@/lib/av-foundation/shop-data"

interface AVProductCardProps {
  product: ShopProduct
}

export function AVProductCard({ product }: AVProductCardProps) {
  const categoryLabels = {
    "original-artwork": "Original Artwork",
    "prints": "Prints",
    "books": "Books",
    "cultural-items": "Cultural Items",
    "accessories": "Accessories"
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
      <Link href={`/av-foundation/shop/${product.slug}`}>
        <div className="aspect-square overflow-hidden relative">
          <img
            src={product.images[0] || "/av-foundation/placeholder.svg"}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.originalPrice && (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
              Sale
            </Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="outline" className="bg-background">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[product.category]}
            </Badge>
            {product.stockQuantity <= 5 && product.inStock && (
              <Badge variant="outline" className="text-xs text-orange-600">
                Only {product.stockQuantity} left
              </Badge>
            )}
          </div>
          <Link href={`/av-foundation/shop/${product.slug}`}>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>
          {product.artist && (
            <p className="text-sm text-muted-foreground">by {product.artist}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          
          {(product.medium || product.dimensions) && (
            <div className="text-xs text-muted-foreground space-y-1">
              {product.medium && <p>{product.medium}</p>}
              {product.dimensions && <p>{product.dimensions}</p>}
              {product.edition && <p>{product.edition}</p>}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <Button 
            className="w-full" 
            disabled={!product.inStock}
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>

        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
