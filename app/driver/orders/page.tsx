"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

interface Order {
  id: string;
  from_address: string;
  to_address:   string;
  vehicle_type: string;
  price:        number;
  status:       string;
  created_at:   string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  accepted:  { label: "Qabul",       color: "text-blue-400 bg-blue-500/10 border-blue-500/20"  },
  picked:    { label: "Yukni olindi", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  on_way:    { label: "Yo'lda",       color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  delivered: { label: "Yetkazildi",   color: "text-green-400 bg-green-500/10 border-green-500/20"  },
  cancelled: { label: "Bekor",        color: "text-red-400 bg-red-500/10 border-red-500/20"       },
};

const muted = "dark:text-white/40 text-gray-500";
const main  = "dark:text-white text-gray-900";

export default function DriverOrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("orders")
        .select("id, from_address, to_address, vehicle_type, price, status, created_at")
        .eq("driver_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data as Order[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className={`text-xl font-bold ${main}`}>Mening zakazlarim</h1>
        <p className={`${muted} text-sm mt-0.5`}>Qabul qilgan barcha zakazlar tarixi</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-7 h-7 text-[#FFD100]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
          </svg>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center
          dark:bg-white/[0.02] bg-white border dark:border-white/8 border-gray-200 rounded-2xl">
          <div className="text-3xl mb-3">📋</div>
          <p className={`${muted} text-sm font-semibold`}>Hozircha zakaz yo&apos;q</p>
          <p className={`${muted} text-xs mt-1 mb-4`}>Qabul qilgan zakazlar shu yerda ko&apos;rinadi</p>
          <Link href="/driver/dashboard"
            className="bg-[#FFD100] text-black font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#E6BC00] transition-all">
            Yangi zakazlar →
          </Link>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="space-y-3"
        >
          {orders.map(order => {
            const st = STATUS_LABEL[order.status] ?? { label: order.status, color: "text-gray-400 bg-gray-500/10 border-gray-500/20" };
            const isActive = ["accepted", "picked", "on_way"].includes(order.status);

            return (
              <motion.div
                key={order.id}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              >
                <Link
                  href={`/driver/orders/${order.id}`}
                  className="block dark:bg-white/[0.03] bg-white border dark:border-white/8 border-gray-200 rounded-2xl p-5
                    hover:dark:border-white/15 hover:border-gray-300 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-mono text-xs ${muted}`}>#{order.id.slice(0, 8).toUpperCase()}</p>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Aktiv
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        <p className={`text-sm font-semibold ${main} truncate`}>{order.from_address}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        <p className={`text-sm ${muted} truncate`}>{order.to_address}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#FFD100] font-bold text-base">{order.price.toLocaleString()}</p>
                      <p className={`${muted} text-xs`}>so&apos;m</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${st.color}`}>
                      {st.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${muted} capitalize`}>{order.vehicle_type}</span>
                      <span className={`text-xs ${muted}`}>
                        {new Date(order.created_at).toLocaleDateString("uz-UZ")}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                        className={`${muted} group-hover:dark:text-white group-hover:text-gray-900 transition-colors`}>
                        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
