import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

/**
 * Next.js 16 Proxy Interceptor
 * Replaces legacy middleware to control routing boundaries.
 */
export async function proxy(request) {
  const path = request.nextUrl.pathname;

  // 1. Bypass check for authentication API endpoints and the automated scheduler cron route
  const isApiAuthRoute = path.startsWith('/api/auth');
  const isCronRoute = path === '/api/cron';

  if (isApiAuthRoute || isCronRoute) {
    return NextResponse.next();
  }

  // 2. Decrypt and check the validity of the session cookie
  const sessionCookie = request.cookies.get('umeed_session')?.value;
  const session = decrypt(sessionCookie);

  // 3. User is NOT authenticated
  if (!session) {
    // Allow viewing the login page itself
    if (path === '/login') {
      return NextResponse.next();
    }

    // Protect all API routes with a clear JSON 401 response
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    // Redirect browser requests to the login screen
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. User IS authenticated
  // If trying to access /login, redirect back to the workspace
  if (path === '/login') {
    const dashboardUrl = new URL('/compose', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow proceeding to protected page or API
  return NextResponse.next();
}

/**
 * Configure routes that the proxy should intercept.
 * Excludes static files, dev assets, and favicon image.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
