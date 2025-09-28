
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute = !isAuthPage && pathname !== '/';

  if (isAuthPage) {
    if (token) {
      // If user is logged in and tries to access login/register, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow unauthenticated users to access auth pages
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    if (!token) {
      // If user is not logged in and tries to access a protected route, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  if(pathname === '/') {
      if (token) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
      }
  }

  // Allow access if conditions are met
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
