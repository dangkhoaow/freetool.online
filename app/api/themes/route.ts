import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    const status = searchParams.get("status") || "all"

    // Fetch themes with filtering
    const themes = await db.theme.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status !== "all" ? { status } : {}),
      },
      orderBy: {
        installedAt: "desc",
      },
    })

    return NextResponse.json(themes)
  } catch (error) {
    console.error("Error fetching themes:", error)
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { name, description, version, themeData } = await req.json()

    // Validate required fields
    if (!name || !version || !themeData) {
      return NextResponse.json({ error: "Name, version, and theme data are required" }, { status: 400 })
    }

    // Create the theme
    const theme = await db.theme.create({
      data: {
        name,
        description: description || "",
        version,
        themeData,
        status: "INSTALLED",
        installedAt: new Date(),
      },
    })

    return NextResponse.json(theme)
  } catch (error) {
    console.error("Error creating theme:", error)
    return NextResponse.json({ error: "Failed to create theme" }, { status: 500 })
  }
}

