import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, slug, content, parentId, status } = await req.json()

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 })
    }

    // Check if slug already exists
    const existingPage = await db.page.findUnique({
      where: { slug },
    })

    if (existingPage) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Create the page
    const page = await db.page.create({
      data: {
        title,
        slug,
        content: content || "",
        parentId: parentId || null,
        status: status || "DRAFT",
        createdById: session.user.id,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error creating page:", error)
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    const status = searchParams.get("status") || "all"

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

    return NextResponse.json(pages)
  } catch (error) {
    console.error("Error fetching pages:", error)
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
  }
}

