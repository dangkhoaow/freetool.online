"use client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Filter } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import PagesList from "@/components/admin/pages-list"

export default async function PagesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  const query = searchParams.q || ""
  const status = searchParams.status || "all"

  // Fetch pages with filtering
  const pages = await db.page.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status !== "all" ? { status } : {}),
    },
    include: {
      parent: {
        select: {
          title: true,
          slug: true,
        },
      },
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pages</h1>
        <Button asChild>
          <Link href="/site-management/pages/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Page
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search pages..."
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

      <PagesList pages={pages} />
    </div>
  )
}

