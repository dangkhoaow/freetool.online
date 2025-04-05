import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "../ui/badge"
import Link from "next/link"

interface RecentActivityProps {
  recentPages: any[]
}

export default function RecentActivity({ recentPages }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>The latest content updates in your CMS</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentPages.length > 0 ? (
            recentPages.map((page) => (
              <div key={page.id} className="flex items-start">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    <Link href={`/site-management/pages/${page.id}/edit`} className="hover:underline">
                      {page.title}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })} by{" "}
                    {page.createdBy.name}
                  </p>
                  <div className="flex items-center pt-2">
                    <Badge
                      variant={
                        page.status === "PUBLISHED"
                          ? "default"
                          : page.status === "APPROVED"
                            ? "success"
                            : page.status === "PENDING"
                              ? "warning"
                              : page.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                      }
                    >
                      {page.status.charAt(0) + page.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
