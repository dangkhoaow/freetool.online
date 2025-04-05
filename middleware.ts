import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path starts with /site-management
  if (path.startsWith("/site-management")) {
    // Skip the login page
    if (path === "/site-management/login") {
      return NextResponse.next()
    }

    // Check for token in cookies (we now use localStorage in the client)
    // This middleware just won't block anything now, allowing the client-side
    // check to handle authentication
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/site-management/:path*"],
}
