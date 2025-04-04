import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import fs from "fs"
import path from "path"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const image = await db.image.findUnique({
      where: {
        id: params.id,
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    return NextResponse.json(image)
  } catch (error) {
    console.error("Error fetching image:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { altText } = await req.json()

    // Update the image metadata
    const image = await db.image.update({
      where: {
        id: params.id,
      },
      data: {
        altText,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error("Error updating image:", error)
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 })
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

    // Get the image to delete the file
    const image = await db.image.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Delete the file from the filesystem
    const filePath = path.join(process.cwd(), "public", image.path)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete the image from the database
    await db.image.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}

