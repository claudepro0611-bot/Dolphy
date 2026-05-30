"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";
import { supabase } from "@/lib/supabase/client";
import type { LatLng } from "@/components/TrackingMapClient";

const TrackingMapClient = dynamic(() => import("@/components/TrackingMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#111]">
      <div className="w-7 h-7 border-2 border-[#F5C518]/25 border-t-[#F5C518] rounded-full animate-spin" />
    </div>
  ),
});

const TASHKENT: LatLng      = [41.2995, 69.2401];
const TASHKENT_TO: LatLng   = [41.3550, 69.2951];

type OrderStatus = "pending" | "accepted" | "picked" | "on_way" | "delivered" | "cancelled";

interface Order {
  id: string;
  from_address: string;
  to_address:   string;
  from_lat?: number | null;
  from_lng?: number | null;
  to_lat?:   number | null;
  to_lng?:   number | null;
  driver_lat?: number | null;
  driver_lng?: number | null;
  status:      OrderStatus;
  vehicle_type: string;
  price:        number;
  driver_id?:   string | null;
}

interface DriverProfile {
  full_name?:     string;
  phone?:         string;
  rating?:        number;
  trips_count?:   number;
  vehicle_model?: string;
  plate_number?:  string;
}

const STATUSES: { key: OrderStatus; label: string }[] = [
  { key: "accepted",  label: "Qabul qilindi" },
  { key: "picked",    label: "Yukni olindi"  },
  { key: "on_way",    label: "Yo'lda"        },
  { key: "delivered", label: "Yetkazildi"    },
];

function statusIndex(s: OrderStatus) {
  return STATUSES.findIndex(x => x.key === s);
}

const fade    = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// ─── Haydovchi izlanmoqda ──────────────────────────────────────────────────────
function SearchingView({ orderId, onCancel }: { orderId: string; onCancel: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      {/* Spinner */}
      <div className="relative w-28 h-28">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[3px] border-[#F5C518]/15 border-t-[#F5C518]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border-2 border-[#F5C518]/10 border-b-[#F5C518]/35"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="30" height="24" viewBox="0 0 36 28" fill="none" className="text-[#F5C518]">
            <rect x="1" y="3" width="22" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M23 8.5h7.5l4 8V22H23V8.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <circle cx="7"  cy="24.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="29" cy="24.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>

      {/* Matn */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold">Haydovchi izlanmoqda...</h2>
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.85, 1, 0.85] }}
              transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.22 }}
              className="w-2 h-2 rounded-full bg-[#F5C518]"
            />
          ))}
        </div>
        <p className="text-gray-500 dark:text-white/35 text-sm">
          Yaqin atrofdagi haydovchilar tekshirilmoqda
        </p>
      </div>

      {/* Bekor qilish */}
      <button
        onClick={onCancel}
        className="px-8 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 text-sm font-semibold active:scale-[0.97] transition-all">
        Bekor qilish
      </button>
    </div>
  );
}

// ─── Tracking ko'rinishi ───────────────────────────────────────────────────────
function TrackingView({
  order,
  driver,
  fromPos,
  toPos,
  driverPos,
}: {
  order:     Order;
  driver:    DriverProfile | null;
  fromPos:   LatLng;
  toPos:     LatLng;
  driverPos: LatLng;
}) {
  const { tg } = useTelegram();
  const router = useRouter();
  const idx    = statusIndex(order.status);
  const isDelivered = order.status === "delivered";

  // Telegram MainButton — qo'ng'iroq yoki yangi zakaz
  useEffect(() => {
    if (!tg) return;

    if (isDelivered) {
      tg.MainButton.setText("Yangi zakaz");
      tg.MainButton.setParams({ color: "#F5C518", text_color: "#000000" });
      tg.MainButton.show();
      const h = () => router.push("/tg/order/new");
      tg.MainButton.onClick(h);
      return () => { tg.MainButton.offClick(h); tg.MainButton.hide(); };
    }

    if (driver?.phone) {
      tg.MainButton.setText("Haydovchiga qo'ng'iroq");
      tg.MainButton.setParams({ color: "#F5C518", text_color: "#000000" });
      tg.MainButton.show();
      const h = () => { window.location.href = `tel:${driver.phone}`; };
      tg.MainButton.onClick(h);
      return () => { tg.MainButton.offClick(h); tg.MainButton.hide(); };
    }

    tg.MainButton.hide();
    return () => { tg.MainButton.hide(); };
  }, [tg, driver?.phone, isDelivered, router]);

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="min-h-screen w-full max-w-[430px] mx-auto flex flex-col"
    >
      {/* Xarita — 58% ekran balandligi */}
      <div className="relative flex-shrink-0" style={{ height: "58vh" }}>
        <TrackingMapClient
          from={fromPos}
          to={toPos}
          driverPos={driverPos}
          progress={0}
        />

        {/* Jonli badge */}
        {!isDelivered && (
          <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-black/75 backdrop-blur-sm border border-green-500/30 px-3 py-1.5 rounded-full pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-bold">Jonli</span>
          </div>
        )}

        {/* Manzillar */}
        <div className="absolute bottom-12 left-4 z-[1000] bg-black/70 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-white text-xs font-medium">{order.from_address.split(",")[0]}</span>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 z-[1000] bg-black/70 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            <span className="text-white text-xs font-medium">{order.to_address.split(",")[0]}</span>
          </div>
        </div>

        {/* Yetkazildi overlay */}
        {isDelivered && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/45 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="text-center bg-green-500/15 border border-green-500/35 rounded-2xl px-8 py-6">
              <div className="text-5xl mb-2">✅</div>
              <p className="text-green-400 font-bold text-lg">Yetkazildi!</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Pastki panel */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">

        {/* Progress */}
        <motion.div variants={fade}
          className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-gray-500 dark:text-white/35 uppercase tracking-widest">Holat</p>
            {!isDelivered && (
              <span className="text-[#F5C518] text-xs font-bold">
                {STATUSES[idx]?.label ?? "Kutilmoqda"}
              </span>
            )}
          </div>
          {STATUSES.map((s, i) => {
            const done   = i < idx;
            const active = i === idx;
            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done   ? "bg-green-500/15 border border-green-500/20" :
                  active ? "bg-[#F5C518]/15 border border-[#F5C518]/20" :
                           "bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/8"
                }`}>
                  {done ? (
                    <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
                      <path d="M1 4.5l2.5 2.5L9 1" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : active ? (
                    <div className="w-2 h-2 rounded-full bg-[#F5C518] animate-pulse" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-white/15" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  done   ? "text-green-500 dark:text-green-400" :
                  active ? "text-[#F5C518]" :
                           "text-gray-400 dark:text-white/25"
                }`}>{s.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Haydovchi */}
        {driver && (
          <motion.div variants={fade}
            className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl p-4">
            <p className="text-gray-500 dark:text-white/35 text-[10px] font-bold uppercase tracking-widest mb-3">
              Haydovchi
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-white/8 flex items-center justify-center flex-shrink-0 text-xl">
                🧑
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{driver.full_name ?? "Haydovchi"}</p>
                {driver.vehicle_model && (
                  <p className="text-gray-400 dark:text-white/30 text-xs mt-0.5">
                    {driver.vehicle_model}{driver.plate_number ? ` · ${driver.plate_number}` : ""}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {driver.rating && (
                    <div className="flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                        <path d="M5.5 1l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3L3.1 8.5l.5-2.7-2-1.9 2.7-.4z" fill="#F5C518"/>
                      </svg>
                      <span className="text-[#F5C518] text-xs font-bold">{driver.rating}</span>
                    </div>
                  )}
                  {driver.trips_count && (
                    <span className="text-gray-400 dark:text-white/25 text-xs">{driver.trips_count} ta safar</span>
                  )}
                </div>
              </div>

              {/* Qo'ng'iroq */}
              {driver.phone && (
                <a href={`tel:${driver.phone}`}
                  className="w-10 h-10 rounded-xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M11 10.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7.5 7 4.5 3.5 2.5 5c.5 4 4.5 8 8.5 8.5l1.5-2L11 10.5z" stroke="#F5C518" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Marshrut + Narx */}
        <motion.div variants={fade}
          className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
          {[
            { label: "Dan",   value: order.from_address },
            { label: "Ga",    value: order.to_address   },
            { label: "Narx",  value: `${order.price.toLocaleString()} so'm`, accent: true },
          ].map((row, i, arr) => (
            <div key={row.label}
              className={`flex items-start justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-gray-200 dark:border-white/8" : ""}`}>
              <p className="text-gray-500 dark:text-white/40 text-sm flex-shrink-0 mr-3">{row.label}</p>
              <p className={`text-sm font-semibold text-right ${row.accent ? "text-[#F5C518]" : ""}`}>
                {row.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Yangi zakaz tugmasi (yetkazilgandan keyin, TG MainButton ishlamasa) */}
        {isDelivered && (
          <motion.button
            variants={fade}
            onClick={() => router.push("/tg/order/new")}
            className="w-full py-4 rounded-2xl bg-[#F5C518] text-black font-bold text-sm active:scale-[0.98] transition-all">
            + Yangi zakaz
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Asosiy komponent ─────────────────────────────────────────────────────────
function TgTrackingContent() {
  const params  = useParams();
  const router  = useRouter();
  const { tg }  = useTelegram();
  const orderId = params.id as string;

  const [order,   setOrder]   = useState<Order | null>(null);
  const [driver,  setDriver]  = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // MainButton yashirish (loading vaqtida)
  useEffect(() => {
    if (!tg) return;
    tg.MainButton.hide();
  }, [tg]);

  // ── 1. Order yuklash ────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()
      .then(({ data }) => {
        if (data) setOrder(data as Order);
        setLoading(false);
      });
  }, [orderId]);

  // ── 2. Driver profil ────────────────────────────────────────────────────
  useEffect(() => {
    if (!order?.driver_id) return;
    supabase
      .from("profiles")
      .select("full_name, phone, rating, trips_count, vehicle_model, plate_number")
      .eq("id", order.driver_id)
      .single()
      .then(({ data }) => {
        if (data) setDriver(data as DriverProfile);
      });
  }, [order?.driver_id]);

  // ── 3. Real-time ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`tg-order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(prev => ({ ...prev, ...payload.new } as Order));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  // ── Bekor qilish ────────────────────────────────────────────────────────
  async function handleCancel() {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    router.push("/tg/order/new");
  }

  // ── Koordinatalar ────────────────────────────────────────────────────────
  const fromPos = useMemo<LatLng>(() =>
    order?.from_lat && order.from_lng
      ? [order.from_lat, order.from_lng]
      : TASHKENT,
    [order?.from_lat, order?.from_lng]
  );

  const toPos = useMemo<LatLng>(() =>
    order?.to_lat && order.to_lng
      ? [order.to_lat, order.to_lng]
      : TASHKENT_TO,
    [order?.to_lat, order?.to_lng]
  );

  const driverPos = useMemo<LatLng>(() =>
    order?.driver_lat && order.driver_lng
      ? [order.driver_lat, order.driver_lng]
      : fromPos,
    [order?.driver_lat, order?.driver_lng, fromPos]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F5C518]/20 border-t-[#F5C518] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-bold">Zakaz topilmadi</p>
        <button onClick={() => router.push("/tg/order/new")}
          className="px-6 py-3 bg-[#F5C518] text-black font-bold rounded-2xl text-sm">
          Yangi zakaz
        </button>
      </div>
    );
  }

  if (order.status === "cancelled") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold">Zakaz bekor qilindi</h2>
          <p className="text-gray-500 dark:text-white/40 text-sm mt-1">Haydovchiga xabar yuborildi</p>
        </div>
        <button onClick={() => router.push("/tg/order/new")}
          className="px-8 py-3.5 bg-[#F5C518] text-black font-bold rounded-2xl text-sm active:scale-[0.97]">
          Yangi zakaz →
        </button>
      </div>
    );
  }

  if (order.status === "pending") {
    return <SearchingView orderId={orderId} onCancel={handleCancel} />;
  }

  return (
    <TrackingView
      order={order}
      driver={driver}
      fromPos={fromPos}
      toPos={toPos}
      driverPos={driverPos}
    />
  );
}

export default function TgOrderTrackingDynamicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F5C518]/20 border-t-[#F5C518] animate-spin" />
      </div>
    }>
      <TgTrackingContent />
    </Suspense>
  );
}
