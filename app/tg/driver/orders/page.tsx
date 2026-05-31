"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useTelegram } from "@/hooks/useTelegram";

interface Order {
  id: string;
  from_address: string;
  to_address: string;
  vehicle_type: string;
  price: number;
  cargo_type?: string;
  created_at: string;
}

const VEHICLE_NAMES: Record<string, string> = {
  damas: "Damas", labo: "Labo", isuzu: "Isuzu", fura: "Fura",
  gazelle: "Gazelle", medium: "O'rta", kamaz: "Kamaz",
};

export default function TgDriverOrdersPage() {
  const router = useRouter();
  const { user } = useTelegram();
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [accepting, setAccepting] = useState<Record<string, boolean>>({});

  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  useEffect(() => {
    loadOrders();

    const ch = supabase
      .channel("driver-orders-rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: "status=eq.pending" },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders(prev => [newOrder, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as { id: string; status: string };
          if (updated.status !== "pending") {
            setOrders(prev => prev.filter(o => o.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("id, from_address, to_address, vehicle_type, price, cargo_type, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  async function acceptOrder(orderId: string) {
    setAccepting(prev => ({ ...prev, [orderId]: true }));
    const { error } = await supabase
      .from("orders")
      .update({ status: "accepted", driver_id: user?.id ?? null })
      .eq("id", orderId)
      .eq("status", "pending");

    console.log("accept error:", error);

    if (!error) {
      router.push(`/tg/driver/active/${orderId}`);
    } else {
      alert(error.message);
      setAccepting(prev => ({ ...prev, [orderId]: false }));
    }
  }

  function skipOrder(orderId: string) {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  }

  function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60)  return `${diff}s oldin`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min oldin`;
    return `${Math.floor(diff / 3600)}h oldin`;
  }

  return (
    <div className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Zakazlar</h1>
          <p className="dark:text-white/35 text-gray-500 text-xs mt-0.5">
            {loading ? "Yuklanmoqda..." : `${orders.length} ta yangi zakaz`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-500 text-[10px] font-bold">Jonli</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#C8F135]/30 border-t-[#C8F135] rounded-full animate-spin" />
        </div>
      )}

      {/* Bo'sh */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl dark:bg-white/[0.03] bg-gray-100 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="3" width="22" height="22" rx="3" stroke="#C8F135" strokeWidth="1.5" strokeOpacity="0.5"/>
              <path d="M8 14h12M8 9h12M8 19h7" stroke="#C8F135" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.5"/>
            </svg>
          </div>
          <p className="dark:text-white/40 text-gray-500 text-sm">Yangi zakazlar yo&apos;q</p>
          <p className="dark:text-white/20 text-gray-400 text-xs mt-1">Yangi zakaz kelganda avtomatik ko&apos;rinadi</p>
        </div>
      )}

      {/* Order list */}
      <AnimatePresence initial={false}>
        {orders.map(order => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="dark:bg-white/[0.04] bg-white border border-gray-200 dark:border-white/8 rounded-2xl p-4 mb-3"
          >
            {/* Route */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex flex-col items-center gap-1 mt-1 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C8F135]" />
                <div className="w-0.5 h-8 dark:bg-white/10 bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#F59E0B]" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <p className="text-xs dark:text-white/35 text-gray-400">Qayerdan</p>
                  <p className="text-sm font-semibold leading-tight truncate">{order.from_address}</p>
                </div>
                <div>
                  <p className="text-xs dark:text-white/35 text-gray-400">Qayerga</p>
                  <p className="text-sm font-semibold leading-tight truncate">{order.to_address}</p>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full dark:bg-white/[0.06] bg-gray-100 dark:text-white/60 text-gray-600">
                {VEHICLE_NAMES[order.vehicle_type] ?? order.vehicle_type}
              </span>
              {order.cargo_type && order.cargo_type !== "Belgilanmagan" && (
                <span className="text-xs px-2.5 py-1 rounded-full dark:bg-white/[0.06] bg-gray-100 dark:text-white/40 text-gray-500">
                  {order.cargo_type}
                </span>
              )}
              <span className="ml-auto text-xs dark:text-white/25 text-gray-400">{timeAgo(order.created_at)}</span>
            </div>

            {/* Price + Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-[#C8F135] font-black text-xl">{order.price.toLocaleString()}</p>
                <p className="dark:text-white/25 text-gray-400 text-[10px]">so&apos;m</p>
              </div>
              <button
                onClick={() => skipOrder(order.id)}
                disabled={accepting[order.id]}
                className="px-4 py-3 rounded-xl dark:bg-white/[0.04] bg-gray-100 dark:border border-white/10 dark:text-white/40 text-gray-500 text-sm font-bold active:scale-95 transition-transform disabled:opacity-40"
              >
                O&apos;tkazish
              </button>
              <button
                onClick={() => acceptOrder(order.id)}
                disabled={accepting[order.id]}
                className="flex-1 py-3 rounded-xl bg-[#C8F135] text-black font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 shadow-[0_2px_12px_rgba(200,241,53,0.25)]"
              >
                {accepting[order.id] ? "..." : "Qabul"}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
