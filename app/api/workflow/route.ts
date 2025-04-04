import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pageId, action, comment } = await req.json()

    if (!pageId || !action) {
      return NextResponse.json({ error: "Page ID and action are required" }, { status: 400 })
    }

    // Check if page exists
    const page = await db.page.findUnique({
      where: {
        id: pageId,
      },
    })

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Check permissions based on action
    if (action === "APPROVE" && session.user.role !== "ADMIN" && session.user.role !== "APPROVER") {
      return NextResponse.json({ error: "Insufficient permissions to approve content" }, { status: 403 })
    }

    if (action === "PUBLISH" && session.user.role !== "ADMIN" && session.user.role !== "PUBLISHER") {
      return NextResponse.json({ error: "Insufficient permissions to publish content" }, { status: 403 })
    }

    if (action === "REJECT" && session.user.role !== "ADMIN" && session.user.role !== "APPROVER") {
      return NextResponse.json({ error: "Insufficient permissions to reject content" }, { status: 403 })
    }

    // Determine new status based on action
    let newStatus
    switch (action) {
      case "APPROVE":
        newStatus = "APPROVED"
        break
      case "PUBLISH":
        newStatus = "PUBLISHED"
        break
      case "REJECT":
        newStatus = "REJECTED"
        break
      case "SUBMIT":
        newStatus = "PENDING"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update page status
    const updatedPage = await db.page.update({
      where: {
        id: pageId,
      },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    })

    // Create workflow history entry
    await db.workflowHistory.create({
      data: {
        pageId,
        action,
        comment: comment || "",
        performedById: session.user.id,
      },
    })

    return NextResponse.json(updatedPage)
  } catch (error) {
    console.error("Error updating workflow:", error)
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const pageId = searchParams.get("pageId")

    if (!pageId) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 })
    }
    return NextResponse.json({ error: "Page ID is required" }, { status: 400 })

    // Fetch workflow history for the page
    const workflowHistory = await db.workflowHistory.findMany({
      where: {
        pageId,
      },
      include: {
        performedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(workflowHistory)
  } catch (error) {
    console.error("Error fetching workflow history:", error)
    return NextResponse.json({ error: "Failed to fetch workflow history" }, { status: 500 })
  }
}

