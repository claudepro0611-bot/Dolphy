"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Filter = "bugun" | "hafta" | "oy";

const ALL_ORDERS = [
  { id: "ORD-4821", from: "Chilonzor, 9-m",  to: "Yunusobod, 19-m", status: "delivered", price: 37_000, date: "Bugun 14:32",      filter: "bugun" },
  { id: "ORD-4820", from: "Sergeli, 17-m",   to: "Mirzo Ulug., 4-m",status: "delivered", price: 58_000, date: "Bugun 11:15",      filter: "bugun" },
  { id: "ORD-4819", from: "Olmazor, 8-m",    to: "Shayxontohur",    status: "cancelled", price: 32_000, date: "Kecha 18:40",      filter: "hafta" },
  { id: "ORD-4818", from: "Bektemir",         to: "Uchtepa, 5-m",   status: "delivered", price: 72_000, date: "Kecha 15:20",      filter: "hafta" },
  { id: "ORD-4817", from: "Yunusobod, 7-m",  to: "Sergeli, 14-m",   status: "delivered", price: 41_000, date: "3 kun oldin",      filter: "hafta" },
  { id: "ORD-4810", from: "Mirzo Ulug.",     to: "Chilonzor, 4-m",  status: "delivered", price: 28_000, date: "1 hafta oldin",    filter: "oy"    },
  { id: "ORD-4800", from: "Uchtepa, 3-m",    to: "Bektemir",        status: "delivered", price: 55_000, date: "10 kun oldin",     filter: "oy"    },
  { id: "ORD-4790", from: "Sergeli",          to: "Yunusobod",       status: "cancelled", price: 30_000, date: "12 kun oldin",     filter: "oy"    },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  delivered: { label: "Yetkazildi", color: "#22C55E", bg: "#22C55E18" },
  cancelled: { label: "Bekor",      color: "#EF4444", bg: "#EF444418" },
  active:    { label: "Faol",       color: "#C8F135", bg: "#C8F13518" },
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "bugun", label: "Bugun" },
  { key: "hafta", label: "Hafta" },
  { key: "oy",    label: "Oy"    },
];

export default function TgHistoryPage() {
  const [filter, setFilter] = useState<Filter>("hafta");

  const orders = ALL_ORDERS.filter(o =>
    filter === "oy"    ? true :
    filter === "hafta" ? ["bugun", "hafta"].includes(o.filter) :
    o.filter === "bugun"
  );

  const totalSpent   = orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.price, 0);
  const deliveredCnt = orders.filter(o => o.status === "delivered").length;

  return (
    <div className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4 space-y-5">

      {/* Sarlavha */}
      <div>
        <p className="text-gray-500 dark:text-white/35 text-xs font-bold uppercase tracking-widest mb-1">Tarix</p>
        <h1 className="text-xl font-bold">Buyurtmalar tarixi</h1>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 bg-gray-100 dark:bg-white/[0.04] p-1 rounded-xl">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === f.key
                ? "bg-[#C8F135] text-black shadow-[0_2px_8px_rgba(200,241,53,0.3)]"
                : "text-gray-500 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/60"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Yetkazildi", value: deliveredCnt },
          { label: "Sarflangan", value: `${(totalSpent / 1000).toFixed(0)}K` },
        ].map(s => (
          <div key={s.label} className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl p-4 text-center">
            <p className="text-[#C8F135] font-bold text-2xl">{s.value}</p>
            <p className="text-gray-500 dark:text-white/35 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ro'yxat */}
      <AnimatePresence mode="wait">
        <motion.div key={filter}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-2.5"
        >
          {orders.length === 0 ? (
            <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/8 rounded-2xl py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="3" y="4" width="20" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.6" className="text-gray-300 dark:text-white/20"/>
                  <path d="M8 11h10M8 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gray-300 dark:text-white/20"/>
                </svg>
              </div>
              <p className="text-gray-400 dark:text-white/35 text-sm font-semibold">Buyurtma topilmadi</p>
            </div>
          ) : (
            orders.map(o => {
              const s = STATUS_CFG[o.status];
              return (
                <Link key={o.id} href={`/tg/order/${o.id}`}
                  className="flex items-center gap-3 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl p-4 active:bg-gray-200 dark:active:bg-white/[0.07] transition-colors">

                  {/* Status icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
                    style={{ background: s.bg, borderColor: s.color + "25" }}>
                    {o.status === "delivered" ? (
                      <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
                        <path d="M1.5 6.5l3.5 3.5L12.5 1.5" stroke={s.color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke={s.color} strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{o.from}</p>
                    <p className="text-gray-400 dark:text-white/30 text-xs mt-0.5 truncate">→ {o.to}</p>
                    <p className="text-gray-300 dark:text-white/20 text-[10px] mt-1">{o.date}</p>
                  </div>

                  {/* Narx */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#C8F135] font-bold text-sm">{o.price.toLocaleString()}</p>
                    <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.label}</span>
                  </div>
                </Link>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
