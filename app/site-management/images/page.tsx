"use client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import ImageUploader from "@/components/admin/image-uploader"
import ImageGallery from "@/components/admin/image-gallery"

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  const query = searchParams.q || ""

  // Fetch images with filtering
  const images = await db.image.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { filename: { contains: query, mode: "insensitive" } },
              { altText: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      uploadedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Image Management</h1>
        <ImageUploader />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search images..."
            className="pl-8"
            defaultValue={query}
            onChange={(e) => {
              const params = new URLSearchParams(window.location.search)
              if (e.target.value) {
                params.set("q", e.target.value)
              } else {
                params.delete("q")
              }
              window.location.search = params.toString()
            }}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      <ImageGallery images={images} />
    </div>
  )
}

