"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "@/components/Providers";

const ORDERS = [
  { id: "ORD-4821", from: "Chilonzor, 9-mavze", to: "Yunusobod, 19-mavze", status: "delivered", price: 37000, truck: "Gazelle", date: "Bugun, 14:32" },
  { id: "ORD-4790", from: "Sergeli, 17-mavze",  to: "Mirzo Ulugbek, 4-m",  status: "delivered", price: 58000, truck: "O'rta",   date: "Kecha, 11:15" },
  { id: "ORD-4751", from: "Olmazor, 8-mavze",   to: "Shayxontohur",        status: "cancelled", price: 32000, truck: "Gazelle", date: "3 kun oldin" },
  { id: "ORD-4720", from: "Bektemir",            to: "Uchtepa, 5-mavze",   status: "delivered", price: 72000, truck: "Kamaz",   date: "5 kun oldin" },
  { id: "ORD-4698", from: "Yunusobod, 7-mavze",  to: "Sergeli, 14-mavze",  status: "delivered", price: 41000, truck: "Gazelle", date: "1 hafta oldin" },
];

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function OrdersPage() {
  const { tr } = useLang();

  const STATUS: Record<string, { label: string; color: string }> = {
    delivered: { label: tr("delivered"), color: "#22C55E" },
    cancelled: { label: tr("cancelled"), color: "#EF4444" },
    active:    { label: tr("active"),    color: "#FFD100" },
  };

  const totalSpent = ORDERS.filter(o => o.status === "delivered").reduce((s, o) => s + o.price, 0);
  const delivered  = ORDERS.filter(o => o.status === "delivered").length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      <motion.div variants={fade} className="flex items-center justify-between">
        <div>
          <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-1">{tr("history")}</p>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900">{tr("history")}</h1>
        </div>
        <Link href="/order/new" className="bg-[#FFD100] text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#E6BC00] transition-colors">
          + {tr("newOrder")}
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fade} className="grid grid-cols-3 gap-4">
        {[
          { label: "Jami",           value: ORDERS.length },
          { label: tr("delivered"),  value: delivered },
          { label: "Sarflangan",     value: `${(totalSpent / 1000).toFixed(0)}K` },
        ].map(s => (
          <div key={s.label} className="dark:bg-white/[0.03] bg-gray-50 dark:border-white/10 border border-gray-200 rounded-2xl p-5 text-center hover:dark:border-white/20 hover:border-gray-300 transition-colors">
            <div className="text-2xl font-bold text-[#FFD100]">{s.value}</div>
            <div className="dark:text-white/40 text-gray-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {ORDERS.length === 0 ? (
        <motion.div variants={fade} className="dark:bg-white/[0.02] bg-gray-50 dark:border-white/8 border border-gray-200 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl dark:bg-white/5 bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="5" width="22" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.8" className="dark:text-white/20 text-gray-400"/>
              <path d="M8 12h12M8 17h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="dark:text-white/20 text-gray-400"/>
            </svg>
          </div>
          <p className="dark:text-white/50 text-gray-500 font-semibold text-lg">{tr("noOrders")}</p>
          <p className="dark:text-white/25 text-gray-400 text-sm mt-2 mb-6">{tr("noOrdersSub")}</p>
          <Link href="/order/new" className="inline-block bg-[#FFD100] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#E6BC00] transition-colors">
            {tr("placeOrder")} →
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={fade} className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {ORDERS.map((o, i) => {
            const s = STATUS[o.status];
            return (
              <Link key={o.id} href={`/order/${o.id}`}
                className={`flex items-center gap-5 px-6 py-4 hover:dark:bg-white/[0.04] hover:bg-gray-50 transition-colors group ${i < ORDERS.length - 1 ? "dark:border-b dark:border-white/8 border-b border-gray-100" : ""}`}>
                <span className="dark:text-white/30 text-gray-400 text-xs font-bold w-20 flex-shrink-0">{o.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="dark:text-white/70 text-gray-700 text-sm truncate">{o.from}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="dark:text-white/70 text-gray-700 text-sm truncate">{o.to}</span>
                  </div>
                </div>
                <span className="dark:text-white/30 text-gray-400 text-xs w-16 flex-shrink-0">{o.truck}</span>
                <span className="dark:text-white/25 text-gray-400 text-xs w-28 flex-shrink-0">{o.date}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{ color: s.color, backgroundColor: s.color + "15" }}>
                  {s.label}
                </span>
                <span className="text-[#FFD100] font-bold text-sm w-24 text-right flex-shrink-0">
                  {o.price.toLocaleString()}
                </span>
                <svg className="dark:text-white/15 text-gray-300 group-hover:dark:text-white/40 group-hover:text-gray-500 transition-colors flex-shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
