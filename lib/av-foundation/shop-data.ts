export interface ShopProduct {
  id: string
  title: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  category: "original-artwork" | "prints" | "books" | "cultural-items" | "accessories"
  artist?: string
  medium?: string
  dimensions?: string
  year?: string
  edition?: string
  images: string[]
  inStock: boolean
  stockQuantity: number
  featured: boolean
  tags: string[]
}

export const shopProducts: ShopProduct[] = [
  {
    id: "1",
    title: "Lotus Pond at Dawn - Original Silk Painting",
    slug: "lotus-pond-dawn-original-silk-painting",
    description:
      "A masterful silk painting depicting the serene beauty of a lotus pond at dawn. This original work showcases traditional Vietnamese painting techniques with contemporary sensibilities.",
    price: 2500,
    category: "original-artwork",
    artist: "Nguyen Phan Chanh",
    medium: "Silk painting",
    dimensions: "60 x 80 cm",
    year: "2023",
    images: ["/av-foundation/artwork-young-woman-lotus.png", "/av-foundation/placeholder.png", "/av-foundation/placeholder.png"],
    inStock: true,
    stockQuantity: 1,
    featured: true,
    tags: ["silk painting", "lotus", "traditional", "original"],
  },
  {
    id: "2",
    title: "Village Life - Limited Edition Print",
    slug: "village-life-limited-edition-print",
    description:
      'High-quality giclée print of the beloved painting "Village Life" by Bui Xuan Phai. Limited edition of 50 prints, each numbered and signed.',
    price: 350,
    originalPrice: 450,
    category: "prints",
    artist: "Bui Xuan Phai",
    medium: "Giclée print on archival paper",
    dimensions: "40 x 50 cm",
    edition: "Limited edition 15/50",
    images: ["/av-foundation/artwork-village-scene.png", "/av-foundation/placeholder.png"],
    inStock: true,
    stockQuantity: 12,
    featured: true,
    tags: ["print", "village", "limited edition", "bui xuan phai"],
  },
  {
    id: "3",
    title: "Vietnamese Art History - Comprehensive Guide",
    slug: "vietnamese-art-history-comprehensive-guide",
    description:
      "A comprehensive 400-page guide to Vietnamese art history, featuring over 300 high-quality images and expert commentary from leading art historians.",
    price: 85,
    category: "books",
    dimensions: "25 x 30 cm",
    images: ["/av-foundation/placeholder.png", "/av-foundation/placeholder.png"],
    inStock: true,
    stockQuantity: 25,
    featured: false,
    tags: ["book", "art history", "educational", "reference"],
  },
  {
    id: "4",
    title: "Handcrafted Lacquer Jewelry Box",
    slug: "handcrafted-lacquer-jewelry-box",
    description:
      "Beautiful traditional Vietnamese lacquer jewelry box, handcrafted by master artisans. Features intricate mother-of-pearl inlay work.",
    price: 180,
    category: "cultural-items",
    medium: "Lacquer with mother-of-pearl inlay",
    dimensions: "15 x 10 x 8 cm",
    images: ["/av-foundation/placeholder.png", "/av-foundation/placeholder.png", "/av-foundation/placeholder.png"],
    inStock: true,
    stockQuantity: 8,
    featured: false,
    tags: ["lacquer", "jewelry box", "handcrafted", "mother-of-pearl"],
  },
  {
    id: "5",
    title: "Contemporary Abstract - Original Acrylic",
    slug: "contemporary-abstract-original-acrylic",
    description:
      "Bold contemporary abstract painting exploring themes of modern Vietnamese identity. Vibrant colors and dynamic composition.",
    price: 1800,
    category: "original-artwork",
    artist: "Le Thi Minh",
    medium: "Acrylic on canvas",
    dimensions: "70 x 90 cm",
    year: "2024",
    images: ["/av-foundation/artwork-old-quarter-morning.png", "/av-foundation/placeholder.png"],
    inStock: true,
    stockQuantity: 1,
    featured: true,
    tags: ["contemporary", "abstract", "acrylic", "original"],
  },
  {
    id: "6",
    title: "Traditional Ao Dai Silk Scarf",
    slug: "traditional-ao-dai-silk-scarf",
    description:
      "Luxurious silk scarf featuring traditional Ao Dai patterns. Perfect accessory celebrating Vietnamese cultural heritage.",
    price: 120,
    category: "accessories",
    medium: "Pure silk",
    dimensions: "90 x 90 cm",
    images: ["/av-foundation/placeholder.png", "/av-foundation/placeholder.png"],
    inStock: true,
    stockQuantity: 15,
    featured: false,
    tags: ["silk", "scarf", "ao dai", "traditional", "accessory"],
  },
  {
    id: "7",
    title: "Mountain Landscape - Watercolor Print Set",
    slug: "mountain-landscape-watercolor-print-set",
    description:
      "Set of three watercolor prints depicting the majestic mountains of Northern Vietnam. Each print is 30x40cm.",
    price: 220,
    originalPrice: 280,
    category: "prints",
    artist: "Tran Van Duc",
    medium: "Watercolor prints on fine art paper",
    dimensions: "30 x 40 cm (set of 3)",
    images: ["/av-foundation/vietnamese-lotus-mountain-painting.png", "/av-foundation/placeholder.png", "/av-foundation/placeholder.png"],
    inStock: true,
    stockQuantity: 20,
    featured: false,
    tags: ["watercolor", "mountain", "landscape", "print set", "northern vietnam"],
  },
  {
    id: "8",
    title: "Ceramic Tea Set - Traditional Design",
    slug: "ceramic-tea-set-traditional-design",
    description:
      "Handcrafted ceramic tea set featuring traditional Vietnamese motifs. Includes teapot, 4 cups, and serving tray.",
    price: 280,
    category: "cultural-items",
    medium: "Ceramic with traditional glazing",
    dimensions: "Teapot: 15cm height, Cups: 6cm diameter",
    images: ["/av-foundation/placeholder.png", "/av-foundation/placeholder.png", "/av-foundation/placeholder.png"],
    inStock: true,
    stockQuantity: 6,
    featured: false,
    tags: ["ceramic", "tea set", "traditional", "handcrafted"],
  },
]

export function getProductBySlug(slug: string): ShopProduct | undefined {
  return shopProducts.find((product) => product.slug === slug)
}

export function getFeaturedProducts(): ShopProduct[] {
  return shopProducts.filter((product) => product.featured)
}

export function getProductsByCategory(category: ShopProduct["category"]): ShopProduct[] {
  return shopProducts.filter((product) => product.category === category)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}
