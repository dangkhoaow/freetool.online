import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { STATIC_RESOURCES, RESERVED_PATHS, CUSTOM_404_HTML } from './lib/static-resources'

// Log the number of dynamic resources loaded
console.log(`Middleware loaded with ${STATIC_RESOURCES.length} static resources and ${RESERVED_PATHS.length} reserved paths`);

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
  
  // Always skip Next.js internal routes, API routes, and other special paths
  if (RESERVED_PATHS.some((reservedPath: string) => path === reservedPath || path.startsWith(reservedPath + '/')) || path === '/sitemap.xml') {
    console.log(`Reserved path or sitemap.xml allowed: ${path}`);
    return response;
  }
  
  // Handle static resources (images, fonts, etc.)
  const isStaticResource = !!path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|bmp|tiff|pdf|txt|css|js|woff|woff2|ttf|otf|eot|wasm)$/i);
  
  if (isStaticResource) {
    // Check if it's a known static resource
    if (STATIC_RESOURCES.includes(path)) {
      return response;
    }
    
    // For unknown static resources, return a simple 404 JSON response
    console.log(`Static resource not found: ${path}`);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Resource not found',
        path: path
      }), 
      { 
        status: 404, 
        headers: { 
          'content-type': 'application/json',
          'x-handled-by': 'middleware'
        }
      }
    );
  }
  
  // For non-static routes, use a more aggressive validation approach
  
  // Root path is always valid
  if (path === '/') {
    return response;
  }
  
  // Get path segments for analysis
  const segments = path.split('/').filter(Boolean);
  
  // Create a simple validation function for segment names
  const isValidSegment = (segment: string) => {
    // Reject segments that look like files
    if (segment.includes('.')) return false;
    
    // Reject segments that start with underscore (Next.js convention)
    if (segment.startsWith('_')) return false;
    
    // Reject segments with special characters
    if (/[<>:"|?*]/.test(segment)) return false;
    
    return true;
  };
  
  // Known valid top-level routes
  const VALID_TOP_ROUTES = [
    'admin',
    'tools',
    'code-editor',
    'color-picker',
    'font-generator',
    'gif-to-frames',
    'heic-converter',
    'pdf-tools',
    'private-ai-chat',
    'qr-code-generator',
    'steganography-tool',
    'todo-list',
    'projly',
    'unit-converter',
    'zip-compressor',
    'site-management',
    'data-visualization-tool',
    'video-transcoder',
    'ai-data-visualization',
    'privacy-media-recorder',
    'browser-design-studio',
    'client-site-builder'
  ];
  
  // Check for valid top-level routes
  if (segments.length === 1) {
    const segment = segments[0];
    
    // Invalid segment format
    if (!isValidSegment(segment)) {
      console.log(`Invalid segment format: ${path}`);
      return new NextResponse(CUSTOM_404_HTML, {
        status: 404,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-handled-by': 'middleware'
        }
      });
    }
    
    // Check against known valid routes
    if (!VALID_TOP_ROUTES.includes(segment)) {
      console.log(`Unknown route: ${path}`);
      return new NextResponse(CUSTOM_404_HTML, {
        status: 404,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-handled-by': 'middleware'
        }
      });
    }
    
    // Valid top-level route
    return response;
  }
  
  // Handle nested routes (e.g., /private-ai-chat/debug)
  if (segments.length === 2) {
    const [parentSegment, childSegment] = segments;
    
    // Invalid segment format
    if (!isValidSegment(parentSegment) || !isValidSegment(childSegment)) {
      console.log(`Invalid nested segment format: ${path}`);
      return new NextResponse(CUSTOM_404_HTML, {
        status: 404,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-handled-by': 'middleware'
        }
      });
    }
    
    // Only certain parent segments can have child routes
    if (parentSegment === 'private-ai-chat' || parentSegment === 'site-management' || parentSegment === 'admin' || parentSegment === 'todo-list' || parentSegment === 'projly') {
      // Special known nested routes
      if (parentSegment === 'private-ai-chat' && childSegment === 'debug') {
        return response;
      }
      
      if (parentSegment === 'todo-list' && childSegment === 'projly') {
        console.log(`Todo-list projly route allowed: ${path}`);
        return response;
      }
      
      if (parentSegment === 'admin') {
        // Allow all admin nested routes
        return response;
      }
      
      if (parentSegment === 'projly') {
        // Allow all projly nested routes (login, dashboard, etc.)
        console.log(`Projly nested route allowed: ${path}`);
        return response;
      }
      
      if (parentSegment === 'site-management') {
        // Special handling for site management routes
        if (childSegment === 'login') {
          // Skip authentication check for login page
          const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
          if (token) {
            return NextResponse.redirect(new URL("/site-management", request.url))
          }
          return response;
        }
        
        // For protected routes, check authentication
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
        if (!token) {
          // Redirect to login if not authenticated
          return NextResponse.redirect(new URL("/site-management/login", request.url))
        }
        
        return response;
      }
    }
    
    // Unknown nested route
    console.log(`Unknown nested route: ${path}`);
    return new NextResponse(CUSTOM_404_HTML, {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-handled-by': 'middleware'
      }
    });
  }
  
  // Handle deeper nesting for specific routes
  if (segments.length > 2) {
    const [parentSegment, secondSegment, ...restSegments] = segments;
    
    // Allow todo-list/projly routes to have deeper nesting
    if (parentSegment === 'todo-list' && secondSegment === 'projly') {
      console.log(`Allowing deeper nesting for todo-list/projly route: ${path}`);
      return response;
    }
    
    // Allow projly routes to have deeper nesting
    if (parentSegment === 'projly') {
      console.log(`Allowing deeper nesting for projly route: ${path}`);
      return response;
    }
    
    // For all other paths, deep nesting is not supported
    console.log(`Deeply nested route not supported: ${path}`);
    return new NextResponse(CUSTOM_404_HTML, {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-handled-by': 'middleware'
      }
    });
  }
  
  // If we somehow get here, return a 404
  console.log(`Catch-all 404 for: ${path}`);
  return new NextResponse(CUSTOM_404_HTML, {
    status: 404,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-handled-by': 'middleware'
    }
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
