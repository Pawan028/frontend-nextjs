 // middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  console.log('🔒 Middleware check:', { pathname, hasToken: !!token });

  // Public routes that don't require authentication
  const publicRoutes = ['/auth', '/auth/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    console.log('❌ No token - redirecting to /auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // If has token and trying to access auth pages, redirect to dashboard
  if (token && isPublicRoute) {
    console.log('✅ Has token on auth page - redirecting to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If has token and on root, redirect to dashboard
  if (token && pathname === '/') {
    console.log('✅ Has token on root - redirecting to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If no token and on root, redirect to auth
  if (!token && pathname === '/') {
    console.log('❌ No token on root - redirecting to /auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
