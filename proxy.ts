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
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/order/:path*", "/orders/:path*",
    "/profile/:path*", "/settings/:path*", "/admin/:path*",
    // "/driver/:path*" — hozircha ochiq, tasdiqlangan keyin yoqiladi
  ],
};
