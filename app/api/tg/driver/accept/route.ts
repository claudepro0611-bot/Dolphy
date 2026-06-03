import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, driverId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "orderId kerak" }, { status: 400 });
    if (!driverId) return NextResponse.json({ error: "driverId kerak" }, { status: 400 });

    const db = adminClient();

    const { data, error } = await db
      .from("orders")
      .update({ status: "accepted", driver_id: driverId })
      .eq("id", orderId)
      .eq("status", "pending")
      .is("driver_id", null)
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Zakaz allaqachon qabul qilingan" }, { status: 409 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server xatosi" }, { status: 500 });
  }
}
