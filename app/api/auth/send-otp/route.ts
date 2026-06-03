import { NextRequest, NextResponse } from "next/server";

// globalThis orqali saqlash — verify-otp bilan umumiy store
const g = globalThis as typeof globalThis & {
  _otpStore?: Map<string, { otp: string; expires: number; attempts: number }>;
  _rateLimit?: Map<string, number[]>;
};
if (!g._otpStore)  g._otpStore  = new Map();
if (!g._rateLimit) g._rateLimit = new Map();

export async function POST(req: NextRequest) {
  let phone: string;
  try {
    ({ phone } = await req.json());
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  if (!phone || !/^\+998\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Telefon raqam noto'g'ri" }, { status: 400 });
  }

  // Rate limit: 5 ta request/daqiqa
  const now = Date.now();
  const history = (g._rateLimit!.get(phone) ?? []).filter((t) => now - t < 60_000);
  if (history.length >= 5) {
    return NextResponse.json({ error: "Juda ko'p urinish. 1 daqiqa kuting." }, { status: 429 });
  }
  g._rateLimit!.set(phone, [...history, now]);

  // OTP yaratish (production'da SMS yuboriladi)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  g._otpStore!.set(phone, { otp, expires: now + 5 * 60_000, attempts: 0 });

  // Development: consolega chiqarish
  console.log(`📱 OTP [${phone}]: ${otp}`);

  return NextResponse.json({ success: true, message: "SMS yuborildi" });
}
