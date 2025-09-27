
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');
  const { pathname } = request.nextUrl;

  const authRoutes = [
    '/login', 
    '/register', 
    '/create-or-restore', 
    '/create-wallet', 
    '/restore-wallet', 
    '/verify-mnemonic'
  ];
  
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If the user is authenticated
  if (token) {
    // If they are on an auth route, redirect to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // If they are on the root, rewrite to the main app page (dashboard)
    // This keeps the URL as "/" but shows the content from "(main)/page.tsx"
    if (pathname === '/') {
       return NextResponse.rewrite(new URL('/(main)', request.url))
    }
  } 
  // If the user is not authenticated
  else {
    // And they are trying to access a protected route
    if (!isAuthRoute && pathname !== '/') {
       return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all request paths except for those starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
