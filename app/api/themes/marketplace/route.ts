import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock data for theme marketplace
const marketplaceThemes = [
  {
    id: "theme-1",
    name: "Modern Business",
    description: "A clean, modern theme for business websites with multiple layout options.",
    version: "1.2.0",
    author: "ThemeForge",
    price: 0,
    thumbnail: "/placeholder.svg?height=300&width=400",
    downloads: 12500,
    rating: 4.7,
  },
  {
    id: "theme-2",
    name: "Creative Portfolio",
    description: "Showcase your work with this beautiful portfolio theme designed for creatives.",
    version: "2.0.1",
    author: "DesignLab",
    price: 49,
    thumbnail: "/placeholder.svg?height=300&width=400",
    downloads: 8300,
    rating: 4.9,
  },
  {
    id: "theme-3",
    name: "E-Commerce Pro",
    description: "A complete e-commerce solution with product listings, cart, and checkout pages.",
    version: "3.1.2",
    author: "ShopThemes",
    price: 79,
    thumbnail: "/placeholder.svg?height=300&width=400",
    downloads: 15200,
    rating: 4.6,
  },
  {
    id: "theme-4",
    name: "Minimalist Blog",
    description: "A clean, minimal theme perfect for bloggers and content creators.",
    version: "1.5.0",
    author: "ContentWorks",
    price: 0,
    thumbnail: "/placeholder.svg?height=300&width=400",
    downloads: 22100,
    rating: 4.8,
  },
  {
    id: "theme-5",
    name: "Corporate Enterprise",
    description: "Professional theme for large organizations with multiple department pages.",
    version: "2.3.0",
    author: "BusinessThemes",
    price: 129,
    thumbnail: "/placeholder.svg?height=300&width=400",
    downloads: 5600,
    rating: 4.5,
  },
  {
    id: "theme-6",
    name: "Educational Institute",
    description: "Designed for schools, colleges, and educational organizations.",
    version: "1.0.2",
    author: "EduThemes",
    price: 59,
    thumbnail: "/placeholder.svg?height=300&width=400",
    downloads: 7800,
    rating: 4.4,
  },
]

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    const sort = searchParams.get("sort") || "popular"

    // Filter themes based on search query
    let filteredThemes = marketplaceThemes
    if (query) {
      filteredThemes = marketplaceThemes.filter(
        (theme) =>
          theme.name.toLowerCase().includes(query.toLowerCase()) ||
          theme.description.toLowerCase().includes(query.toLowerCase()) ||
          theme.author.toLowerCase().includes(query.toLowerCase()),
      )
    }

    // Sort themes
    if (sort === "popular") {
      filteredThemes.sort((a, b) => b.downloads - a.downloads)
    } else if (sort === "rating") {
      filteredThemes.sort((a, b) => b.rating - a.rating)
    } else if (sort === "newest") {
      // In a real app, you would sort by date
      filteredThemes.sort((a, b) => b.version.localeCompare(a.version))
    } else if (sort === "price-low") {
      filteredThemes.sort((a, b) => a.price - b.price)
    } else if (sort === "price-high") {
      filteredThemes.sort((a, b) => b.price - a.price)
    }

    return NextResponse.json(filteredThemes)
  } catch (error) {
    console.error("Error fetching marketplace themes:", error)
    return NextResponse.json({ error: "Failed to fetch marketplace themes" }, { status: 500 })
  }
}

