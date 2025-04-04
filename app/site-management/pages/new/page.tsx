import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import PageForm from "@/components/admin/page-form"

export default async function NewPagePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  // Get all pages for parent selection
  const pages = await db.page.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: {
      title: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Page</h1>
      <PageForm pages={pages} />
    </div>
  )
}

