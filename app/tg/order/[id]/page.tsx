"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";

const MOCK_ORDER = {
  id: "ORD-4821",
  from: "Chilonzor, 9-mavze",
  to: "Yunusobod, 19-mavze",
  price: 37_000,
  vehicle: "Gazelle · 1.5 t",
  driver: { name: "Jasur Toshmatov", phone: "+998 90 123 45 67", rating: 4.8, trips: 312 },
  eta: "12 daqiqa",
  distance: "8.4 km",
};

const STATUSES = [
  { key: "accepted",  label: "Qabul qilindi"     },
  { key: "pickup",    label: "Yukni olmoqda"      },
  { key: "on_way",    label: "Yo'lda"             },
  { key: "delivered", label: "Yetkazildi"         },
];

const CURRENT_STATUS: string = "on_way";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function TgOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tg } = useTelegram();
  const [called, setCalled] = useState(false);

  const order = { ...MOCK_ORDER, id };
  const currentIdx = STATUSES.findIndex(s => s.key === CURRENT_STATUS);
  const isActive = CURRENT_STATUS !== "delivered";

  useEffect(() => {
    if (!tg) return;
    if (isActive) {
      tg.MainButton.setText("Haydovchiga qo'ng'iroq");
      tg.MainButton.setParams({ color: "#F5C518", text_color: "#000000" });
      tg.MainButton.show();
      const handler = () => setCalled(true);
      tg.MainButton.onClick(handler);
      return () => { tg.MainButton.offClick(handler); tg.MainButton.hide(); return; };
    } else {
      tg.MainButton.hide();
    }
    return undefined;
  }, [tg, isActive]);

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="px-4 py-5 space-y-5"
    >
      {/* ID */}
      <motion.div variants={fade} className="flex items-center justify-between">
        <div>
          <p className="text-white/35 text-xs font-bold uppercase tracking-widest">Buyurtma</p>
          <h1 className="text-lg font-bold mt-0.5">{order.id}</h1>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5C518]/10 border border-[#F5C518]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse" />
            <span className="text-[#F5C518] text-xs font-bold">Faol</span>
          </div>
        )}
      </motion.div>

      {/* Progress */}
      <motion.div variants={fade}
        className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 space-y-3">
        {STATUSES.map((s, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          const pending = i > currentIdx;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                done   ? "bg-green-500/15 border border-green-500/20" :
                active ? "bg-[#F5C518]/15 border border-[#F5C518]/20" :
                         "bg-white/5 border border-white/8"
              }`}>
                {done ? (
                  <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
                    <path d="M1 4.5l2.5 2.5L9 1" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : active ? (
                  <div className="w-2 h-2 rounded-full bg-[#F5C518] animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                done    ? "text-green-400" :
                active  ? "text-[#F5C518]" :
                          "text-white/25"
              }`}>{s.label}</span>
              {active && (
                <span className="ml-auto text-[#F5C518] text-xs font-bold">{order.eta}</span>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Marshrut */}
      <motion.div variants={fade}
        className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          <p className="text-sm font-medium">{order.from}</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-0.5">
          <div className="w-2 flex-shrink-0 flex justify-center">
            <div className="w-px h-4 bg-white/10" />
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
          <p className="text-sm font-medium">{order.to}</p>
        </div>
      </motion.div>

      {/* Haydovchi */}
      <motion.div variants={fade}
        className="bg-white/[0.04] border border-white/8 rounded-2xl p-4">
        <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mb-3">Haydovchi</p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" className="text-white/40"/>
              <path d="M3 20c0-4.418 3.582-7 8-7s8 2.582 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/40"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">{order.driver.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3L3.1 8.5l.5-2.7-2-1.9 2.7-.4z" fill="#F5C518"/>
                </svg>
                <span className="text-[#F5C518] text-xs font-bold">{order.driver.rating}</span>
              </div>
              <span className="text-white/25 text-xs">{order.driver.trips} ta safar</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Narx */}
      <motion.div variants={fade}
        className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
        {[
          { label: "Mashina",  value: order.vehicle },
          { label: "Masofa",   value: order.distance },
          { label: "Narx",     value: `${order.price.toLocaleString()} so'm`, accent: true },
        ].map((row, i, arr) => (
          <div key={row.label}
            className={`flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-white/8" : ""}`}>
            <p className="text-white/40 text-sm">{row.label}</p>
            <p className={`text-sm font-bold ${row.accent ? "text-[#F5C518]" : "text-white"}`}>{row.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Call toast */}
      {called && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 bg-green-500 text-white text-sm font-semibold px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-xl"
          style={{ maxWidth: 430, margin: "0 auto" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10.5 9.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7 6l-3-3.5L2 4c.5 4 4.5 8 8.5 8.5l1.5-2-1.5-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          {order.driver.phone}
        </motion.div>
      )}
    </motion.div>
  );
}
