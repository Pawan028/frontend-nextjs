import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Define which routes are public (accessible without authentication)
 */
const isPublicRoute = createRouteMatcher([
  '/',                    // Landing page
  '/sign-in(.*)',         // Clerk sign-in routes
  '/sign-up(.*)',         // Clerk sign-up routes
  '/auth(.*)',            // Auth redirect handler
  '/api/webhooks(.*)',    // Webhook endpoints (must be public)
]);

/**
 * Clerk middleware for authentication
 * - Protects all routes except public ones
 * - Redirects unauthenticated users to sign-in
 */
export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Allow public routes without authentication
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect all other routes
  const { userId } = await auth();

  if (!userId) {
    // Redirect to sign-in with return URL
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
