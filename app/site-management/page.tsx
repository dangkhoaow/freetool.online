import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight } from "lucide-react"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import DashboardStats from "@/components/admin/dashboard-stats"
import RecentActivity from "@/components/admin/recent-activity"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  // Get counts for dashboard
  const pagesCount = await db.page.count()
  const imagesCount = await db.image.count()
  const usersCount = await db.user.count()
  const themesCount = await db.theme.count()

  // Get recent pages
  const recentPages = await db.page.findMany({
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/site-management/pages/new">Create New Page</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/" target="_blank">
              View Site <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <DashboardStats
        pagesCount={pagesCount}
        imagesCount={imagesCount}
        usersCount={usersCount}
        themesCount={themesCount}
      />

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <RecentActivity recentPages={recentPages} />
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Content Pending Approval</CardTitle>
              <CardDescription>Review and approve content submitted by content creators</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pending approval content would go here */}
              <p className="text-sm text-muted-foreground">No content pending approval</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
