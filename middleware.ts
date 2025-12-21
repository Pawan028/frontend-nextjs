 // middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  console.log('🔒 Middleware check:', { pathname, hasToken: !!token });

  // All auth-related routes (login, register, verify, forgot-password)
  const authRoutes = ['/auth'];
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/orders', '/wallet', '/settings', '/invoices', '/ndr', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Landing page
  const isLandingPage = pathname === '/';

  // If no token and trying to access protected route, redirect to auth
  if (!token && isProtectedRoute) {
    console.log('❌ No token on protected route - redirecting to /auth');
    const url = new URL('/auth', request.url);
    url.searchParams.set('redirect', pathname); // Remember where they wanted to go
    return NextResponse.redirect(url);
  }

  // If has token and trying to access auth pages (login/register only), redirect to dashboard
  // Allow verify-email and forgot-password even when logged in
  if (token && (pathname === '/auth' || pathname === '/auth/register')) {
    console.log('✅ Has token on auth page - redirecting to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Optional: If logged in and on landing page, redirect to dashboard
  // Comment this out if you want logged-in users to see landing page
  if (token && isLandingPage) {
    console.log('✅ Has token on landing - redirecting to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
