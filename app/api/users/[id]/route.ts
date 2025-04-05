import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role or is requesting their own data
    if (session.user.role !== "ADMIN" && session.user.id !== params.id) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const user = await db.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user has admin role or is updating their own data
    if (session.user.role !== "ADMIN" && session.user.id !== params.id) {
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

    // Check if email already exists on a different user
    const existingUser = await db.user.findFirst({
      where: {
        email: userData.email,
        id: {
          not: params.id,
        },
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Only admin can change roles
    if (session.user.role === "ADMIN" && userData.role) {
      // No change needed
    }

    const user = await db.user.update({
      where: { id: params.id },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('[USER_UPDATE]', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Prevent deleting the last admin
    if (params.id === session.user.id) {
      const adminCount = await db.user.count({
        where: {
          role: "ADMIN",
        },
      })

      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last admin user" }, { status: 400 })
      }
    }

    // Delete the user
    await db.user.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
