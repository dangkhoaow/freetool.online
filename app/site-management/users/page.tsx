"use client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import UsersList from "@/components/admin/users-list"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  // Check if user has admin role
  if (session.user.role !== "ADMIN") {
    redirect("/site-management")
  }

  const query = searchParams.q || ""
  const role = searchParams.role || "all"

  // Fetch users with filtering
  const users = await db.user.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(role !== "all" ? { role } : {}),
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button asChild>
          <Link href="/site-management/users/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
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

      <UsersList users={users} />
    </div>
  )
}

