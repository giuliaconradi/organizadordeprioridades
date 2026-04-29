import { NextResponse, type NextRequest } from "next/server";

const USER_COOKIE = "app_user";
const ADMIN_COOKIE = "app_admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isAdmin = request.cookies.get(ADMIN_COOKIE)?.value === "1";
    if (pathname === "/admin/entrar") {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/entrar", request.url));
    }
    return NextResponse.next();
  }

  const userCookie = request.cookies.get(USER_COOKIE)?.value;
  const isLoggedIn =
    typeof userCookie === "string" && userCookie.trim().length > 0;

  if (pathname === "/entrar") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/tarefas/:path*", "/entrar", "/admin/:path*"],
};
