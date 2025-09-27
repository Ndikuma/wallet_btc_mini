
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/create-or-restore') || pathname.startsWith('/create-wallet') || pathname.startsWith('/restore-wallet') || pathname.startsWith('/verify-mnemonic');
  
  // If the user is authenticated
  if (token) {
    // and tries to access an authentication page, redirect to the main dashboard.
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } 
  // If the user is not authenticated
  else {
    // and tries to access any page other than the landing page or auth pages,
    // redirect them to the login page.
    if (pathname !== '/' && !isAuthPage) {
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
