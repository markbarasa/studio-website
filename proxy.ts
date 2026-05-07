import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const isAdmin = req.cookies.get("admin-auth")?.value;

  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

  // allow login page
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // protect admin
  if (isAdminPage && !isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};