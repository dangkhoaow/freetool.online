import { notFound } from "next/navigation"
import { db } from "@/lib/db"

export default async function DynamicPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join("/")

  // Fetch the page from the database
  const page = await db.page.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
  })

  if (!page) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  )
}

