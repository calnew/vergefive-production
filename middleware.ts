import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/dashboard", "/fix-list", "/fix", "/account-matches", "/buildout", "/report-card", "/account/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const entitlement = token.entitlement;
  if (entitlement !== "self_serve" && entitlement !== "done_with_you") {
    const upgradeUrl = new URL("/upgrade", request.url);
    upgradeUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(upgradeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/fix-list/:path*", "/fix/:path*", "/account-matches/:path*", "/buildout/:path*", "/report-card/:path*", "/account/settings/:path*"],
};
