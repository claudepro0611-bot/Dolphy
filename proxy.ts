import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "yotoq-dev-secret-change-in-production"
);

async function getRole(token: string): Promise<"admin" | "client" | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.role as "admin" | "client") ?? null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // ── Auth himoya ────────────────────────────────────────
  const needsAuth = ["/dashboard", "/order", "/orders", "/profile", "/settings", "/admin"];
  // "/driver" — hozircha ochiq (pending-approval haydovchilar kiradi)
  if (needsAuth.some(p => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin sahifalari — faqat admin roli
  if (pathname.startsWith("/admin") && token) {
    const role = await getRole(token);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Mijoz sahifalari — admin kirmasin
  const clientOnly = ["/dashboard", "/order", "/orders", "/profile", "/settings"];
  if (clientOnly.some(p => pathname.startsWith(p)) && token) {
    const role = await getRole(token);
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/order/:path*", "/orders/:path*",
    "/profile/:path*", "/settings/:path*", "/admin/:path*",
    // "/driver/:path*" — hozircha ochiq, tasdiqlangan keyin yoqiladi
  ],
};
