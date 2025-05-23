import { NextRequest, NextResponse } from 'next/server';

// Pages that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/analytics',
  '/profile',
  '/settings',
];

// Pages that are only for non-authenticated users
const AUTH_ROUTES = [
  '/login',
  '/register',
];

// Define middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token')?.value;
  
  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if route is for non-authenticated users only
  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);
  
  // If user is trying to access protected route without auth, redirect to login
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and trying to access auth route, redirect to dashboard
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Continue for all other routes
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - public files (images, favicon, etc.)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
