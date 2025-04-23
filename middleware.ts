import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const response = NextResponse.next()
  
  // Set a production mode cookie if accessed from the production domain
  const host = request.headers.get('host') || '';
  const forwardedHost = request.headers.get('x-forwarded-host') || '';
  const hostToCheck = forwardedHost || host;
  
  if (hostToCheck === 'freetool.online' || hostToCheck === 'www.freetool.online') {
    response.cookies.set('isProduction', 'true', { 
      httpOnly: false,
      sameSite: 'strict',
      path: '/',
      secure: true
    });
  }
  
  // Check if the path starts with /site-management
  if (path.startsWith("/site-management")) {
    // Skip authentication check for login page
    if (path === "/site-management/login") {
      // If already authenticated, redirect to dashboard to prevent loops
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      if (token) {
        return NextResponse.redirect(new URL("/site-management", request.url))
      }
      return response
    }

    // For protected routes, check authentication
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/site-management/login", request.url))
    }
    
    return response
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
