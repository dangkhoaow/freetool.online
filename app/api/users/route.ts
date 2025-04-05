import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { password, ...userData } = await request.json()

    if (password) {
      const response = await fetch('/api/auth/hash-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const { hashedPassword } = await response.json();
      userData.password = hashedPassword;
    }

    // Validate required fields
    if (!userData.name || !userData.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const user = await db.user.create({
      data: {
        ...userData,
        role: userData.role || "PUBLISHER",
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('[USER_CREATE]', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    const role = searchParams.get("role") || "all"

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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
