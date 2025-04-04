import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const altText = (formData.get("altText") as string) || ""

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Create images directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public/uploads")

    // Generate a unique filename
    const uniqueId = uuidv4()
    const fileExtension = file.name.split(".").pop()
    const filename = `${uniqueId}.${fileExtension}`
    const filepath = path.join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save image metadata to database
    const image = await db.image.create({
      data: {
        filename,
        originalFilename: file.name,
        path: `/uploads/${filename}`,
        mimeType: file.type,
        size: file.size,
        altText,
        uploadedById: session.user.id,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
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

    // Fetch images with filtering
    const images = await db.image.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { filename: { contains: query, mode: "insensitive" } },
                { altText: { contains: query, mode: "insensitive" } },
                { originalFilename: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}

