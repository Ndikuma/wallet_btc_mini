import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/create-or-restore') || pathname.startsWith('/restore-wallet') || pathname.startsWith('/create-wallet') || pathname.startsWith('/verify-mnemonic');
  
  // If user is authenticated
  if (token) {
    // If user is on an auth page, redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // If user is at root, redirect to dashboard
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // If user is not authenticated
  else {
    // If user is on a protected page (not public and not auth), redirect to login
    const isPublicPage = pathname === '/';
    if (!isPublicPage && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

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
