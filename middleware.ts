import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Check if the path starts with /site-management
  if (path.startsWith("/site-management")) {
    // Skip authentication check for login page
    if (path === "/site-management/login") {
      // If already authenticated, redirect to dashboard to prevent loops
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      if (token) {
        return NextResponse.redirect(new URL("/site-management", request.url))
      }
      return NextResponse.next()
    }

    // For protected routes, check authentication
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/site-management/login", request.url))
    }
    
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/site-management/:path*"],
}
