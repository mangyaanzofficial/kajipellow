import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "santanic_session";

// Middleware ini HANYA melakukan pengecekan cepat (ada/tidaknya cookie session).
// Validasi penuh (apakah session masih valid & role apa) tetap dilakukan di server
// (getCurrentUser() dari lib/session.ts) di setiap page/action yang butuh proteksi,
// karena middleware edge runtime tidak selalu bisa akses Prisma/DB secara langsung.

const DASHBOARD_PREFIX = "/dashboard";
const ADMIN_PREFIX = "/admin";
const AUTH_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if ((pathname.startsWith(DASHBOARD_PREFIX) || pathname.startsWith(ADMIN_PREFIX)) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_PATHS.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
