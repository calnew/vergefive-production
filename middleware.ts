import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/fix-list", "/fix", "/account-matches", "/buildout", "/report-card", "/account/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("vf_session")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/fix-list/:path*", "/fix/:path*", "/account-matches/:path*", "/buildout/:path*", "/report-card/:path*", "/account/settings/:path*"],
};
