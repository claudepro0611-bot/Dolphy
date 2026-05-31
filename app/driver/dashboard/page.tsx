"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

interface Order {
  id: string;
  from_address: string;
  to_address: string;
  cargo_type: string;
  cargo_weight: number;
  vehicle_type: string;
  price: number;
  status: string;
  created_at: string;
  client_id?: string | null;
  driver_id?: string | null;
}

const fade    = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function DriverDashboardPage() {
  const router = useRouter();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Record<string, boolean>>({});

  // Mavjud pending buyurtmalarni yuklash
  useEffect(() => {
    supabase
      .from("orders")
      .select("id, from_address, to_address, cargo_type, cargo_weight, vehicle_type, price, status, created_at, driver_id, client_id")
      .eq("status", "pending")
      .is("driver_id", null)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("orders fetch error:", error.message);
        }
        console.log("orders loaded:", data?.length ?? 0, "ta | error:", error?.message ?? "yo'q");
        setOrders((data as Order[]) || []);
        setLoading(false);
      });
  }, []);

  // Real-time: yangi buyurtmalar
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as Order;
          if (newOrder.status === "pending") {
            setOrders(prev => [newOrder, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as Order;
          // Qabul qilingan buyurtmani ro'yxatdan olib tashlash
          if (updated.status !== "pending") {
            setOrders(prev => prev.filter(o => o.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Qabul qilish
  async function accept(orderId: string) {
    setActions(prev => ({ ...prev, [orderId]: true }));
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("orders")
      .update({ status: "accepted", driver_id: user?.id })
      .eq("id", orderId);

    if (error) {
      console.error("Accept error:", error);
      setActions(prev => ({ ...prev, [orderId]: false }));
    } else {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      router.push(`/driver/orders/${orderId}`);
    }
  }

  // Rad etish
  async function reject(orderId: string) {
    setActions(prev => ({ ...prev, [orderId]: true }));
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (error) {
      console.error("Reject error:", error);
      setActions(prev => ({ ...prev, [orderId]: false }));
    } else {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold dark:text-white text-gray-900">Yangi buyurtmalar</h1>
          <p className="text-sm dark:text-white/40 text-gray-500 mt-0.5">Real-time yangilanadi</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/8 border border-green-500/15">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
            {orders.length} ta kutmoqda
          </span>
        </div>
      </div>

      {/* Ro'yxat */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-7 h-7 text-[#C8F135]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
          </svg>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center
          dark:bg-white/[0.02] bg-white border dark:border-white/8 border-gray-200 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl dark:bg-white/5 bg-gray-100 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" className="dark:text-white/20 text-gray-300"/>
              <path d="M7 10h10M7 14h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="dark:text-white/20 text-gray-300"/>
            </svg>
          </div>
          <p className="dark:text-white/40 text-gray-500 text-sm font-semibold">Hozircha buyurtma yo&apos;q</p>
          <p className="dark:text-white/20 text-gray-400 text-xs mt-1">Yangi buyurtma kelganda avtomatik ko&apos;rinadi</p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
          <AnimatePresence>
            {orders.map(order => (
              <motion.div
                key={order.id}
                variants={fade}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                className="dark:bg-white/[0.03] bg-white border dark:border-white/8 border-gray-200 rounded-2xl p-5"
              >
                {/* Marshrut */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex flex-col items-center gap-1 mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <div className="w-px h-6 dark:bg-white/10 bg-gray-200" />
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold dark:text-white text-gray-900 truncate">{order.from_address}</p>
                    <p className="text-sm dark:text-white/40 text-gray-500 mt-2.5 truncate">{order.to_address}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#C8F135] font-bold text-base">{order.price.toLocaleString()}</p>
                    <p className="dark:text-white/25 text-gray-400 text-xs mt-0.5">so&apos;m</p>
                  </div>
                </div>

                {/* Tafsilot */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  {[
                    { label: order.vehicle_type },
                    { label: order.cargo_type },
                    { label: `${order.cargo_weight} kg` },
                  ].map((tag, i) => (
                    <span key={i}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg dark:bg-white/5 bg-gray-100 dark:text-white/50 text-gray-600">
                      {tag.label}
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] dark:text-white/20 text-gray-400">
                    {new Date(order.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Tugmalar */}
                <div className="flex gap-2">
                  <button
                    onClick={() => accept(order.id)}
                    disabled={actions[order.id]}
                    className="flex-1 py-2.5 rounded-xl bg-[#C8F135] text-black text-sm font-bold hover:bg-[#b3d92f] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actions[order.id] ? "..." : "✓ Qabul qilish"}
                  </button>
                  <button
                    onClick={() => reject(order.id)}
                    disabled={actions[order.id]}
                    className="flex-1 py-2.5 rounded-xl border dark:border-white/10 border-gray-200 text-sm font-semibold dark:text-white/50 text-gray-600 hover:dark:bg-white/5 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Rad etish
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
