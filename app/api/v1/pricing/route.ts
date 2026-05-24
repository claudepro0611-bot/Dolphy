import { NextRequest, NextResponse } from "next/server";

const PRICING = {
  gazelle: { base: 25000, perKm: 1500 },
  medium:  { base: 45000, perKm: 2500 },
  kamaz:   { base: 75000, perKm: 4000 },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const truck = searchParams.get("truck") as keyof typeof PRICING;
  const km = parseFloat(searchParams.get("km") ?? "0");

  if (!PRICING[truck]) {
    return NextResponse.json({ error: "Noto'g'ri mashina turi" }, { status: 400 });
  }

  const p = PRICING[truck];
  const price = Math.round(p.base + km * p.perKm);
  return NextResponse.json({ price, base: p.base, perKm: p.perKm, km });
}
