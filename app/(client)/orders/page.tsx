"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type OrderStatus =
  | "pending" | "accepted" | "picked" | "loaded"
  | "on_way"  | "completed" | "delivered" | "cancelled";

interface Order {
  id:           string;
  from_address: string;
  to_address:   string;
  vehicle_type: string;
  price:        number;
  status:       OrderStatus;
  created_at:   string;
}

const ACTIVE = new Set<OrderStatus>(["pending", "accepted", "picked", "loaded", "on_way"]);

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Qidirilmoqda",  cls: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/8"  },
  accepted:  { label: "Topildi",       cls: "text-blue-600   dark:text-blue-400   bg-blue-500/8"    },
  picked:    { label: "Yuk olindi",    cls: "text-blue-600   dark:text-blue-400   bg-blue-500/8"    },
  loaded:    { label: "Yuk olindi",    cls: "text-blue-600   dark:text-blue-400   bg-blue-500/8"    },
  on_way:    { label: "Yo'lda",        cls: "text-blue-600   dark:text-blue-400   bg-blue-500/8"    },
  completed: { label: "Yetkazildi",    cls: "text-green-600  dark:text-green-400  bg-green-500/8"   },
  delivered: { label: "Yetkazildi",    cls: "text-green-600  dark:text-green-400  bg-green-500/8"   },
  cancelled: { label: "Bekor qilindi", cls: "text-red-500    dark:text-red-400    bg-red-500/8"     },
};

function formatDate(iso: string) {
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Bugun, " + d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return "Kecha";
  if (diff < 7)  return `${diff} kun oldin`;
  return d.toLocaleDateString("uz-UZ");
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="dark:bg-white/[0.03] bg-white dark:border-white/8 border border-gray-200 rounded-2xl overflow-hidden">
      {[1, 2, 3].map(i => (
        <div key={i} className="px-6 py-4 border-b dark:border-white/8 border-gray-100 last:border-0 flex items-center gap-5 animate-pulse">
          <div className="flex-1 space-y-2">
            <div className="h-3 dark:bg-white/8 bg-gray-200 rounded w-2/3" />
            <div className="h-3 dark:bg-white/5 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="h-3 dark:bg-white/8 bg-gray-200 rounded w-20" />
          <div className="h-6 dark:bg-white/5 bg-gray-100 rounded-full w-24" />
        </div>
      ))}
    </div>
  );
}

// ── Bo'sh holat ──────────────────────────────────────────────────────────────
function Empty() {
  return (
    <div className="dark:bg-white/[0.02] bg-white dark:border-white/8 border border-gray-200 rounded-2xl p-16 text-center">
      <div className="w-12 h-12 dark:bg-white/5 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="dark:text-white/20 text-gray-400">
          <rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 9h8M6 13h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="dark:text-white/50 text-gray-500 font-semibold text-sm">Hozircha buyurtma yo'q</p>
      <p className="dark:text-white/25 text-gray-400 text-xs mt-1.5 mb-6">Birinchi buyurtmangizni bering</p>
      <Link href="/order/new"
        className="inline-block bg-[#F5C518] text-black font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#e0b315] transition-colors">
        Buyurtma berish →
      </Link>
    </div>
  );
}

// ── Asosiy ──────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Kirish talab qilinadi"); setLoading(false); return; }

      const { data, error } = await supabase
        .from("orders")
        .select("id, from_address, to_address, vehicle_type, price, status, created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setOrders((data as Order[]) || []);
      setLoading(false);
    })();
  }, []);

  // Statistika
  const total     = orders.length;
  const done      = orders.filter(o => o.status === "delivered" || o.status === "completed").length;
  const spent     = orders
    .filter(o => o.status === "delivered" || o.status === "completed")
    .reduce((s, o) => s + o.price, 0);

  const muted = "dark:text-white/40 text-gray-500";
  const main  = "dark:text-white text-gray-900";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${main}`}>Buyurtmalar</h1>
          <p className={`${muted} text-sm mt-0.5`}>Barcha buyurtmalar tarixi</p>
        </div>
        <Link href="/order/new"
          className="bg-[#F5C518] text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#e0b315] transition-colors">
          + Yangi buyurtma
        </Link>
      </div>

      {/* Statistika */}
      {!loading && !error && total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Jami",        value: total },
            { label: "Yetkazildi",  value: done  },
            { label: "Sarflangan",  value: spent >= 1000 ? `${Math.round(spent / 1000)}K so'm` : `${spent} so'm` },
          ].map(s => (
            <div key={s.label}
              className="dark:bg-white/[0.03] bg-gray-50 dark:border-white/8 border border-gray-200 rounded-2xl p-4 text-center">
              <div className={`text-xl font-bold ${main}`}>{s.value}</div>
              <div className={`${muted} text-xs mt-0.5`}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Xato */}
      {error && (
        <div className="dark:bg-red-500/5 bg-red-50 border border-red-500/20 rounded-2xl p-5 text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* List */}
      {loading ? <Skeleton /> : orders.length === 0 ? <Empty /> : (
        <div className="dark:bg-white/[0.03] bg-white dark:border-white/8 border border-gray-200 rounded-2xl overflow-hidden">
          {orders.map((o, i) => {
            const st      = STATUS_MAP[o.status] ?? STATUS_MAP.cancelled;
            const isActive = ACTIVE.has(o.status);

            return (
              <div key={o.id}
                className={`flex items-center gap-4 px-6 py-4 ${i < orders.length - 1 ? "border-b dark:border-white/8 border-gray-100" : ""}`}>

                {/* Manzillar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    <span className={`text-sm font-medium ${main} truncate`}>{o.from_address}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <span className={`text-sm ${muted} truncate`}>{o.to_address}</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                  <span className={`text-xs ${muted}`}>{formatDate(o.created_at)}</span>
                  <span className={`text-sm font-semibold ${main}`}>{o.price.toLocaleString()} so'm</span>
                </div>

                {/* Status */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${st.cls}`}>
                  {st.label}
                </span>

                {/* Kuzatish tugmasi */}
                {isActive ? (
                  <Link href={`/order/${o.id}/tracking`}
                    className="flex-shrink-0 text-xs font-bold text-[#F5C518] border border-[#F5C518]/30 px-3 py-1.5 rounded-lg hover:bg-[#F5C518]/8 transition-colors whitespace-nowrap">
                    Kuzatish →
                  </Link>
                ) : (
                  <div className="w-[78px] flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
