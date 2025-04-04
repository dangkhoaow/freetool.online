import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path starts with /site-management
  if (path.startsWith("/site-management")) {
    // Skip the login page
    if (path === "/site-management/login") {
      return NextResponse.next()
    }

    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Redirect to login if not authenticated
    if (!session) {
      return NextResponse.redirect(new URL("/site-management/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/site-management/:path*"],
}

