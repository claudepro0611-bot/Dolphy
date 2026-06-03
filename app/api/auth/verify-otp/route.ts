import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const g = globalThis as typeof globalThis & {
  _otpStore?: Map<string, { otp: string; expires: number; attempts: number }>;
};
if (!g._otpStore) g._otpStore = new Map();
const otpStore = g._otpStore;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "yotoq-dev-secret-change-in-production"
);

// Dev uchun admin raqamlari — production'da DB dan olinadi
const ADMIN_PHONES = [
  "+998900000000",  // test admin
  "+998901234567",  // test admin 2
];

function getRole(phone: string): "admin" | "client" {
  return ADMIN_PHONES.includes(phone) ? "admin" : "client";
}

export async function POST(req: NextRequest) {
  let phone: string, otp: string;
  try {
    ({ phone, otp } = await req.json());
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  if (!phone || !otp) {
    return NextResponse.json({ error: "Majburiy maydonlar" }, { status: 400 });
  }

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Kod 6 xonali bo'lishi kerak" }, { status: 400 });
    }
  } else {
    const record = otpStore.get(phone);
    if (!record) return NextResponse.json({ error: "Kod yuborilmagan yoki muddati o'tgan" }, { status: 400 });
    if (Date.now() > record.expires) {
      otpStore.delete(phone);
      return NextResponse.json({ error: "Kod muddati o'tdi" }, { status: 400 });
    }
    if (record.attempts >= 3) {
      otpStore.delete(phone);
      return NextResponse.json({ error: "Ko'p noto'g'ri urinish. Yangi kod oling." }, { status: 400 });
    }
    if (record.otp !== otp) {
      record.attempts++;
      return NextResponse.json({ error: "Kod noto'g'ri" }, { status: 400 });
    }
    otpStore.delete(phone);
  }

  const role = getRole(phone);
  const redirect = role === "admin" ? "/admin" : "/order/new";

  const token = await new SignJWT({ phone, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  const res = NextResponse.json({ success: true, role, redirect });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return res;
}
