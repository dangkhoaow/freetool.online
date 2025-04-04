"use client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import ThemesList from "@/components/admin/themes-list"
import ThemeMarketplace from "@/components/admin/theme-marketplace"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ThemesPage({
  searchParams,
}: {
  searchParams: { q?: string; tab?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  const query = searchParams.q || ""
  const tab = searchParams.tab || "installed"

  // Fetch installed themes
  const installedThemes = await db.theme.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      status: "INSTALLED",
    },
    orderBy: {
      installedAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Theme Management</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" /> Upload Theme
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search themes..."
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
      </div>

      <Tabs
        defaultValue={tab}
        onValueChange={(value) => {
          const params = new URLSearchParams(window.location.search)
          params.set("tab", value)
          window.location.search = params.toString()
        }}
      >
        <TabsList>
          <TabsTrigger value="installed">Installed Themes</TabsTrigger>
          <TabsTrigger value="marketplace">Theme Marketplace</TabsTrigger>
        </TabsList>
        <TabsContent value="installed">
          <ThemesList themes={installedThemes} />
        </TabsContent>
        <TabsContent value="marketplace">
          <ThemeMarketplace />
        </TabsContent>
      </Tabs>
    </div>
  )
}

