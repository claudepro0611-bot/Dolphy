import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULTS = [
  { id: "gazelle", name: "Gazelle", cap: "1.5 t", base: 25000, perKm: 1500 },
  { id: "medium",  name: "O'rta",   cap: "5 t",   base: 45000, perKm: 2500 },
  { id: "kamaz",   name: "Kamaz",   cap: "10 t",  base: 75000, perKm: 4000 },
];

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function loadPricing() {
  try {
    const { data, error } = await adminClient()
      .from("pricing")
      .select("id, name, cap, base, per_km");
    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({ id: p.id, name: p.name, cap: p.cap, base: p.base, perKm: p.per_km }));
    }
  } catch {}
  return DEFAULTS;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const truck = searchParams.get("truck");
  const km    = parseFloat(searchParams.get("km") ?? "0");

  const pricing = await loadPricing();

  if (truck) {
    const p = pricing.find(t => t.id === truck);
    if (!p) return NextResponse.json({ error: "Noto'g'ri mashina turi" }, { status: 400 });
    return NextResponse.json({ price: Math.round(p.base + km * p.perKm), base: p.base, perKm: p.perKm, km });
  }

  return NextResponse.json({ pricing });
}

export async function POST(req: NextRequest) {
  try {
    const { pricing } = await req.json();
    if (!Array.isArray(pricing)) return NextResponse.json({ error: "pricing array kerak" }, { status: 400 });

    const rows = pricing.map((p: any) => ({
      id:     p.id,
      name:   p.name,
      cap:    p.cap,
      base:   Number(p.base),
      per_km: Number(p.perKm),
    }));

    const { error } = await adminClient().from("pricing").upsert(rows, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server xatosi" }, { status: 500 });
  }
}
