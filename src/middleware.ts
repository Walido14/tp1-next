import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  let isAuth = false;

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
      isAuth = true;
    } catch {
      isAuth = false;
    }
  }

  const { pathname } = req.nextUrl;
  const isPrivate =
    pathname.startsWith("/dashboard") || pathname.startsWith("/students");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isPrivate && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/students/:path*", "/login", "/register"],
};