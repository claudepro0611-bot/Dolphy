"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import type { LatLng } from "@/components/TrackingMapClient";

const TrackingMapClient = dynamic(() => import("@/components/TrackingMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center dark:bg-[#111] bg-gray-100">
      <div className="w-7 h-7 border-2 border-[#C8F135]/25 border-t-[#C8F135] rounded-full animate-spin" />
    </div>
  ),
});

const TASHKENT: LatLng    = [41.2995, 69.2401];
const TASHKENT_TO: LatLng = [41.3550, 69.2951];

type OrderStatus = "accepted" | "picked" | "on_way" | "delivered" | "cancelled";

interface Order {
  id: string;
  from_address: string;
  to_address:   string;
  from_lat?:    number | null;
  from_lng?:    number | null;
  to_lat?:      number | null;
  to_lng?:      number | null;
  status:       OrderStatus;
  vehicle_type: string;
  price:        number;
  cargo_type?:  string;
  cargo_weight?: number;
  client_id?:   string | null;
}

const card  = "dark:bg-white/[0.03] bg-gray-50 dark:border-white/10 border border-gray-200 rounded-2xl";
const muted = "dark:text-white/40 text-gray-500";
const main  = "dark:text-white text-gray-900";

const STATUS_FLOW: { key: OrderStatus; label: string; next?: OrderStatus; nextLabel?: string }[] = [
  { key: "accepted",  label: "Qabul qilindi",  next: "picked",    nextLabel: "🚚 Yukni oldim"    },
  { key: "picked",    label: "Yukni olindi",   next: "on_way",    nextLabel: "▶ Yo'lga chiqdim"  },
  { key: "on_way",    label: "Yo'lda",         next: "delivered", nextLabel: "✅ Yetkazildi"      },
  { key: "delivered", label: "Yetkazildi ✅",  next: undefined,   nextLabel: undefined            },
];

function DriverOrderContent() {
  const params  = useParams();
  const router  = useRouter();
  const orderId = params.id as string;

  const [order,    setOrder]    = useState<Order | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [driverPos, setDriverPos] = useState<LatLng>(TASHKENT);
  const watchRef = useRef<number | null>(null);

  // ── Order yuklash ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setOrder(data as Order);
        setLoading(false);
      });
  }, [orderId]);

  // ── Real-time ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    const ch = supabase
      .channel(`driver-order-${orderId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => setOrder(prev => ({ ...prev, ...payload.new } as Order))
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [orderId]);

  // ── GPS kuzatuv — driver_lat/lng ni Supabase ga yuborish ─────────────
  useEffect(() => {
    if (!orderId || !navigator.geolocation) return;

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const latlng: LatLng = [pos.coords.latitude, pos.coords.longitude];
        setDriverPos(latlng);
        // Supabase ga joylashuvni yuborish
        supabase
          .from("orders")
          .update({ driver_lat: latlng[0], driver_lng: latlng[1] })
          .eq("id", orderId)
          .then(() => {});
      },
      (err) => console.warn("GPS error:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, [orderId]);

  // ── Status yangilash ──────────────────────────────────────────────────
  async function updateStatus(newStatus: OrderStatus) {
    if (!order) return;
    setUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      console.error("Status update error:", error);
    } else {
      setOrder(prev => prev ? { ...prev, status: newStatus } : prev);
    }
    setUpdating(false);
  }

  // ── Koordinatalar ─────────────────────────────────────────────────────
  const fromPos: LatLng = order?.from_lat && order.from_lng
    ? [order.from_lat, order.from_lng] : TASHKENT;
  const toPos: LatLng   = order?.to_lat && order.to_lng
    ? [order.to_lat, order.to_lng] : TASHKENT_TO;

  const curStep = STATUS_FLOW.find(s => s.key === order?.status);

  // ── Loading / Not found ───────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-[#C8F135]/20 border-t-[#C8F135] rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <p className={`${main} font-bold text-lg`}>Zakaz topilmadi</p>
      <Link href="/driver/dashboard" className="text-[#C8F135] text-sm font-semibold hover:underline">
        ← Dashboard ga qaytish
      </Link>
    </div>
  );

  if (order.status === "cancelled") return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <h2 className={`text-2xl font-bold ${main}`}>Zakaz bekor qilindi</h2>
        <p className={`${muted} text-sm mt-1`}>Mijoz tomonidan bekor qilindi</p>
      </div>
      <Link href="/driver/dashboard"
        className="bg-[#C8F135] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#b3d92f] transition-all">
        Yangi zakazlar →
      </Link>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-3 gap-6 max-w-5xl">

      {/* ── CHAP: Xarita ────────────────────────────────────── */}
      <div className="col-span-2 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#C8F135] text-xs font-bold tracking-[3px] uppercase">Aktiv zakaz</p>
            <h1 className={`${main} font-bold text-2xl mt-0.5`}>#{orderId.slice(0, 8).toUpperCase()}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-500/8 border border-green-500/15 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-500 dark:text-green-400 text-xs font-bold">GPS aktiv</span>
            </div>
            <Link href="/driver/dashboard"
              className={`text-xs ${muted} border dark:border-white/12 border-gray-200 px-3 py-2 rounded-xl hover:dark:border-white/25 transition-all`}>
              ← Ortga
            </Link>
          </div>
        </div>

        {/* Xarita */}
        <div className="relative rounded-2xl overflow-hidden dark:border-white/10 border border-gray-200 shadow-sm" style={{ height: 360 }}>
          <TrackingMapClient
            from={fromPos}
            to={toPos}
            driverPos={driverPos}
            progress={0}
          />

          {/* Manzil yorliqlari */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-black/70 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <span className="text-white text-xs font-medium">{order.from_address.split(",")[0]}</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 z-[1000] bg-black/70 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              <span className="text-white text-xs font-medium">{order.to_address.split(",")[0]}</span>
            </div>
          </div>

          {/* Delivered overlay */}
          {order.status === "delivered" && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/45 backdrop-blur-sm">
              <div className="bg-green-500/15 border border-green-500/35 rounded-2xl px-8 py-6 text-center">
                <div className="text-5xl mb-2">✅</div>
                <p className="text-green-400 font-bold text-xl">Yetkazildi!</p>
              </div>
            </div>
          )}
        </div>

        {/* Status progress */}
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`${main} font-bold`}>Holat</h3>
            <span className="text-[#C8F135] text-sm font-semibold">{curStep?.label}</span>
          </div>
          <div className="flex items-center">
            {STATUS_FLOW.map((s, i, arr) => (
              <div key={s.key} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-500 ${
                  STATUS_FLOW.findIndex(x => x.key === order.status) > i
                    ? "bg-[#C8F135] text-black"
                    : STATUS_FLOW.findIndex(x => x.key === order.status) === i
                    ? "bg-[#C8F135] text-black ring-4 ring-[#C8F135]/20"
                    : "dark:bg-white/8 bg-gray-200 dark:text-white/25 text-gray-400"
                }`}>
                  {STATUS_FLOW.findIndex(x => x.key === order.status) > i ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : i + 1}
                </div>
                {i < arr.length - 1 && (
                  <div className="flex-1 h-1 mx-1 rounded-full overflow-hidden dark:bg-white/8 bg-gray-200">
                    <div className={`h-full rounded-full transition-all duration-700 ${
                      STATUS_FLOW.findIndex(x => x.key === order.status) > i ? "w-full bg-[#C8F135]" : "w-0"
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STATUS_FLOW.map((s, i) => (
              <span key={s.key} className={`text-[10px] ${
                STATUS_FLOW.findIndex(x => x.key === order.status) >= i
                  ? "text-[#C8F135] font-semibold" : muted
              }`}>{s.label.replace(" ✅", "")}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── O'NG: Amallar + ma'lumotlar ────────────────────── */}
      <div className="col-span-1 space-y-4">

        {/* Asosiy tugma */}
        {curStep?.next && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => updateStatus(curStep.next!)}
            disabled={updating}
            className="w-full py-4 rounded-2xl bg-[#C8F135] text-black font-bold text-sm hover:bg-[#b3d92f] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(200,241,53,0.25)]"
          >
            {updating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                </svg>
                Yangilanmoqda...
              </span>
            ) : curStep.nextLabel}
          </motion.button>
        )}

        {/* Yetkazildi holat */}
        {order.status === "delivered" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-green-500/8 border border-green-500/20 rounded-2xl p-4 text-center mb-3">
              <p className="text-green-500 dark:text-green-400 font-bold text-sm">✅ Muvaffaqiyatli yetkazildi!</p>
            </div>
            <Link href="/driver/dashboard"
              className="flex items-center justify-center w-full py-3.5 rounded-2xl bg-[#C8F135] text-black font-bold text-sm hover:bg-[#b3d92f] transition-all">
              + Yangi zakaz qidirish
            </Link>
          </motion.div>
        )}

        {/* Marshrut */}
        <div className={`${card} p-5`}>
          <p className={`${muted} text-xs font-bold uppercase tracking-widest mb-4`}>Marshrut</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 mt-1 flex-shrink-0 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
              <div>
                <p className={`${muted} text-[10px] uppercase tracking-widest mb-0.5`}>Olinadi</p>
                <p className={`${main} text-sm font-semibold leading-snug`}>{order.from_address}</p>
              </div>
            </div>
            <div className="w-px h-4 dark:bg-white/8 bg-gray-200 ml-1.5" />
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1 flex-shrink-0 shadow-[0_0_6px_rgba(248,113,113,0.6)]" />
              <div>
                <p className={`${muted} text-[10px] uppercase tracking-widest mb-0.5`}>Yetkaziladi</p>
                <p className={`${main} text-sm font-semibold leading-snug`}>{order.to_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Yuk ma'lumotlari */}
        <div className={`${card} overflow-hidden`}>
          {[
            { label: "Mashina",  value: order.vehicle_type },
            ...(order.cargo_type ? [{ label: "Yuk",     value: order.cargo_type }] : []),
            ...(order.cargo_weight ? [{ label: "Og'irlik", value: `${order.cargo_weight} kg` }] : []),
            { label: "Narx",     value: `${order.price.toLocaleString()} so'm`, accent: true },
          ].map((row, i, arr) => (
            <div key={row.label}
              className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? "border-b dark:border-white/8 border-gray-200" : ""}`}>
              <p className={`${muted} text-sm`}>{row.label}</p>
              <p className={`text-sm font-bold capitalize ${'accent' in row && row.accent ? "text-[#C8F135]" : main}`}>
                {row.value}
              </p>
            </div>
          ))}
        </div>

        {/* Zakaz ID */}
        <p className={`${muted} text-xs text-center font-mono`}>
          {orderId}
        </p>
      </div>
    </div>
  );
}

export default function DriverOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-[#C8F135]/20 border-t-[#C8F135] rounded-full animate-spin" />
      </div>
    }>
      <DriverOrderContent />
    </Suspense>
  );
}
