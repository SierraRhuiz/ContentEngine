import { NextResponse, type NextRequest } from 'next/server';

// ============================================
// AUTH PERMANENTLY DISABLED
// This app runs without authentication.
// Delete this file and restore from git to re-enable auth.
// ============================================

export async function middleware(request: NextRequest) {
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
