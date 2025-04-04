import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const page = await db.page.findUnique({
      where: {
        id: params.id,
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
    })

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error fetching page:", error)
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    // Check if slug already exists on a different page
    const existingPage = await db.page.findFirst({
      where: {
        slug,
        id: {
          not: params.id,
        },
      },
    })

    if (existingPage) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Update the page
    const page = await db.page.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        slug,
        content: content || "",
        parentId: parentId || null,
        status: status || "DRAFT",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error updating page:", error)
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to delete
    if (session.user.role !== "ADMIN" && session.user.role !== "APPROVER") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Delete the page
    await db.page.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting page:", error)
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 })
  }
}

