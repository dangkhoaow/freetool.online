"use client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkflowList from "@/components/admin/workflow-list"

export default async function WorkflowPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  const query = searchParams.q || ""
  const status = searchParams.status || "pending"

  // Fetch pages with workflow status
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
      status,
    },
    include: {
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
        <h1 className="text-3xl font-bold">Content Workflow</h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search content..."
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

      <Tabs
        defaultValue={status}
        onValueChange={(value) => {
          const params = new URLSearchParams(window.location.search)
          params.set("status", value)
          window.location.search = params.toString()
        }}
      >
        <TabsList>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <WorkflowList pages={pages.filter((page) => page.status === "PENDING")} status="PENDING" />
        </TabsContent>
        <TabsContent value="approved">
          <WorkflowList pages={pages.filter((page) => page.status === "APPROVED")} status="APPROVED" />
        </TabsContent>
        <TabsContent value="published">
          <WorkflowList pages={pages.filter((page) => page.status === "PUBLISHED")} status="PUBLISHED" />
        </TabsContent>
        <TabsContent value="rejected">
          <WorkflowList pages={pages.filter((page) => page.status === "REJECTED")} status="REJECTED" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

