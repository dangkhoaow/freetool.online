import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Known static resources that should exist
const KNOWN_STATIC_RESOURCES = [
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/robots.txt'
];

// Reserved paths that aren't part of the public-facing app routes
const RESERVED_PATHS = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/ads.txt',
  '/manifest.webmanifest',
  '/health',
  '/not-found',
  '/ffmpeg',
  '/ffmpeg-core.js',
  '/ffmpeg-core.wasm'
];

// HTML for a simple 404 page that we'll return directly from middleware
// This avoids the need to rely on Next.js's internal error handling
const SIMPLE_404_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      text-align: center;
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 48px;
      margin: 0 0 16px;
      color: #e53e3e;
    }
    h2 {
      font-size: 24px;
      font-weight: 500;
      margin: 0 0 24px;
    }
    p {
      margin: 0 0 32px;
      color: #666;
    }
    a {
      display: inline-block;
      background-color: #3182ce;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    a:hover {
      background-color: #2c5282;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for doesn't exist or has been moved.</p>
    <a href="/">Back to Home</a>
  </div>
</body>
</html>`;

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
  if (RESERVED_PATHS.some(reservedPath => path === reservedPath || path.startsWith(reservedPath + '/'))) {
    return response;
  }
  
  // Handle static resources (images, fonts, etc.)
  const isStaticResource = !!path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|bmp|tiff|pdf|txt|css|js|woff|woff2|ttf|otf|eot|wasm)$/i);
  
  if (isStaticResource) {
    // Check if it's a known static resource
    if (KNOWN_STATIC_RESOURCES.includes(path)) {
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
      return new NextResponse(SIMPLE_404_HTML, {
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
      return new NextResponse(SIMPLE_404_HTML, {
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
      return new NextResponse(SIMPLE_404_HTML, {
        status: 404,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-handled-by': 'middleware'
        }
      });
    }
    
    // Only certain parent segments can have child routes
    if (parentSegment === 'private-ai-chat' || parentSegment === 'site-management' || parentSegment === 'admin') {
      // Special known nested routes
      if (parentSegment === 'private-ai-chat' && childSegment === 'debug') {
        return response;
      }
      
      if (parentSegment === 'admin') {
        // Allow all admin nested routes
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
    return new NextResponse(SIMPLE_404_HTML, {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-handled-by': 'middleware'
      }
    });
  }
  
  // Any deeper nesting is likely invalid
  if (segments.length > 2) {
    console.log(`Deeply nested route not supported: ${path}`);
    return new NextResponse(SIMPLE_404_HTML, {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-handled-by': 'middleware'
      }
    });
  }
  
  // If we somehow get here, return a 404
  console.log(`Catch-all 404 for: ${path}`);
  return new NextResponse(SIMPLE_404_HTML, {
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
