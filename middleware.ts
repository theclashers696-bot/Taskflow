import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPaths = ["/dashboard", "/tasks", "/teams", "/profile", "/settings"];
const authPaths = ["/login", "/sign-up", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuth = authPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
