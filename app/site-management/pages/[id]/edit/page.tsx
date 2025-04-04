import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import PageForm from "@/components/admin/page-form"

export default async function EditPagePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  // Get the page to edit
  const page = await db.page.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!page) {
    notFound()
  }

  // Get all pages for parent selection
  const pages = await db.page.findMany({
    where: {
      id: {
        not: params.id, // Exclude current page to prevent circular reference
      },
    },
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
      <h1 className="text-3xl font-bold">Edit Page: {page.title}</h1>
      <PageForm pages={pages} page={page} />
    </div>
  )
}

