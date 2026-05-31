"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type OrderStatus =
  | "pending" | "accepted" | "picked" | "loaded"
  | "on_way"  | "completed" | "delivered" | "cancelled";

interface Order {
  id:            string;
  from_address:  string;
  to_address:    string;
  vehicle_type:  string;
  price:         number;
  status:        OrderStatus;
  cargo_type?:   string;
  cargo_weight?: number;
  driver_id?:    string | null;
  created_at:    string;
}

interface Driver {
  full_name?:     string;
  vehicle_model?: string;
  plate_number?:  string;
}

const STATUS_TEXT: Record<string, { text: string; color: string }> = {
  pending:   { text: "Haydovchi qidirilmoqda", color: "text-yellow-600 dark:text-yellow-400" },
  accepted:  { text: "Haydovchi qabul qildi",  color: "text-blue-600   dark:text-blue-400"   },
  picked:    { text: "Yuk olindi",              color: "text-blue-600   dark:text-blue-400"   },
  loaded:    { text: "Yuk olindi",              color: "text-blue-600   dark:text-blue-400"   },
  on_way:    { text: "Yo'lga chiqildi",         color: "text-blue-600   dark:text-blue-400"   },
  completed: { text: "Yetkazib berildi",        color: "text-green-600  dark:text-green-400"  },
  delivered: { text: "Yetkazib berildi",        color: "text-green-600  dark:text-green-400"  },
  cancelled: { text: "Bekor qilindi",           color: "text-red-500    dark:text-red-400"    },
};

const ACTIVE = new Set(["pending", "accepted", "picked", "loaded", "on_way"]);
const DONE   = new Set(["completed", "delivered", "cancelled"]);

const muted = "dark:text-white/40 text-gray-500";
const main  = "dark:text-white text-gray-900";
const card  = "dark:bg-white/[0.03] bg-gray-50 dark:border-white/8 border border-gray-200 rounded-2xl";

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="max-w-lg space-y-4 animate-pulse">
      <div className="h-6 dark:bg-white/8 bg-gray-200 rounded w-40" />
      <div className={`${card} p-6 space-y-3`}>
        {[80, 60, 70, 50, 65, 45].map((w, i) => (
          <div key={i} className={`h-3 dark:bg-white/8 bg-gray-200 rounded`} style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

// ── Row helper ────────────────────────────────────────────────────────────────
function Row({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b dark:border-white/8 border-gray-100 last:border-0">
      <span className={`text-sm flex-shrink-0 ${muted}`}>{label}</span>
      <span className={`text-sm font-semibold text-right ${accent ? "text-[#C8F135]" : main}`}>{value}</span>
    </div>
  );
}

// ── Asosiy content ────────────────────────────────────────────────────────────
function TrackingContent() {
  const params  = useParams();
  const router  = useRouter();
  const orderId = params.id as string;

  const [order,      setOrder]      = useState<Order | null>(null);
  const [driver,     setDriver]     = useState<Driver | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── Order yuklash ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()
      .then(({ data, error }) => {
        if (error) setError("Buyurtma topilmadi");
        else setOrder(data as Order);
        setLoading(false);
      });
  }, [orderId]);

  // ── Driver ma'lumotlari ──────────────────────────────────────────────────
  useEffect(() => {
    if (!order?.driver_id) return;
    supabase
      .from("driver_profiles")
      .select("full_name, vehicle_model, plate_number")
      .eq("user_id", order.driver_id)
      .single()
      .then(({ data }) => { if (data) setDriver(data as Driver); });
  }, [order?.driver_id]);

  // ── Real-time ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    const ch = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => setOrder(prev => ({ ...prev, ...payload.new } as Order))
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [orderId]);

  // ── Bekor qilish ─────────────────────────────────────────────────────────
  async function cancel() {
    if (!order || order.status !== "pending") return;
    setCancelling(true);
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    router.push("/orders");
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) return <Skeleton />;

  if (error || !order) return (
    <div className="max-w-lg">
      <div className={`${card} p-8 text-center`}>
        <p className={`${muted} text-sm mb-4`}>{error ?? "Buyurtma topilmadi"}</p>
        <Link href="/orders" className={`text-sm font-semibold ${main} hover:text-[#C8F135] transition-colors`}>
          ← Buyurtmalarga qaytish
        </Link>
      </div>
    </div>
  );

  const st        = STATUS_TEXT[order.status] ?? STATUS_TEXT.cancelled;
  const isActive  = ACTIVE.has(order.status);
  const isDone    = DONE.has(order.status);

  // Driver satrini yig'ish
  const driverStr = driver?.full_name
    ? [
        driver.full_name,
        driver.vehicle_model,
        driver.plate_number,
      ].filter(Boolean).join(" · ")
    : null;

  return (
    <div className="max-w-lg space-y-4">

      {/* Back + header */}
      <div className="flex items-center justify-between">
        <Link href="/orders" className={`text-sm ${muted} hover:${main} transition-colors`}>
          ← Buyurtmalar
        </Link>
        {isActive && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-500 dark:text-green-400 text-xs font-semibold">Jonli</span>
          </div>
        )}
      </div>

      {/* ID */}
      <div>
        <h1 className={`text-2xl font-bold ${main}`}>
          Buyurtma #{orderId.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      {/* Asosiy karta */}
      <div className={`${card} px-5 py-1`}>
        <Row label="Qayerdan"  value={order.from_address} />
        <Row label="Qayerga"   value={order.to_address} />
        <Row label="Holat"
          value={
            <span className={`font-semibold ${st.color}`}>{st.text}</span>
          }
        />
        {driverStr && (
          <Row label="Haydovchi" value={driverStr} />
        )}
        {!driverStr && order.driver_id && (
          <Row label="Haydovchi" value="Ma'lumot yuklanmoqda..." />
        )}
        {order.cargo_type && (
          <Row label="Yuk"
            value={`${order.cargo_type}${order.cargo_weight ? ` · ${order.cargo_weight} kg` : ""}`}
          />
        )}
        <Row label="Mashina"   value={<span className="capitalize">{order.vehicle_type}</span>} />
        <Row label="Narx"      value={`${order.price.toLocaleString()} so'm`} accent />
      </div>

      {/* Yetkazildi banner */}
      {(order.status === "delivered" || order.status === "completed") && (
        <div className="bg-green-500/8 border border-green-500/20 rounded-2xl p-4 text-center">
          <p className="text-green-600 dark:text-green-400 font-semibold text-sm">
            Buyurtmangiz muvaffaqiyatli yetkazildi
          </p>
        </div>
      )}

      {/* Bekor qilish (faqat pending) */}
      {order.status === "pending" && (
        <button
          onClick={cancel}
          disabled={cancelling}
          className="w-full h-11 border border-red-500/25 text-red-500 dark:text-red-400 font-semibold text-sm rounded-xl hover:bg-red-500/6 hover:border-red-500/40 transition-all disabled:opacity-50"
        >
          {cancelling ? "Bekor qilinmoqda..." : "Bekor qilish"}
        </button>
      )}

      {/* Done — yangi zakaz */}
      {isDone && (
        <Link href="/order/new"
          className="flex items-center justify-center w-full h-11 bg-[#C8F135] text-black font-bold text-sm rounded-xl hover:bg-[#e0b315] transition-colors">
          + Yangi buyurtma
        </Link>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <TrackingContent />
    </Suspense>
  );
}
