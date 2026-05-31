"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";

const fade    = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const STATUSES = [
  { key: "accepted",  label: "Qabul qilindi"   },
  { key: "pickup",    label: "Yukni olmoqda"    },
  { key: "on_way",    label: "Yo'lda kelmoqda"  },
  { key: "delivered", label: "Yetkazildi"       },
];

const CURRENT_STATUS = "on_way";

const DRIVER = {
  name:   "Jasur Toshmatov",
  phone:  "+998 90 123 45 67",
  rating: 4.8,
  trips:  312,
  eta:    "~8 daqiqa",
};

export default function TgOrderTrackingPage() {
  const { tg } = useTelegram();
  const [called, setCalled] = useState(false);

  const currentIdx = STATUSES.findIndex(s => s.key === CURRENT_STATUS);

  // MainButton — qo'ng'iroq
  useEffect(() => {
    if (!tg) return;
    tg.MainButton.setText("Haydovchiga qo'ng'iroq");
    tg.MainButton.setParams({ color: "#C8F135", text_color: "#000000" });
    tg.MainButton.show();
    const handler = () => {
      setCalled(true);
      setTimeout(() => setCalled(false), 3000);
    };
    tg.MainButton.onClick(handler);
    return () => {
      tg.MainButton.offClick(handler);
      tg.MainButton.hide();
    };
  }, [tg]);

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4 space-y-5"
    >

      {/* Sarlavha */}
      <motion.div variants={fade} className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-white/35 text-xs font-bold uppercase tracking-widest">
            Kuzatish
          </p>
          <h1 className="text-lg font-bold mt-0.5">Yo&apos;lda kelmoqda</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C8F135]/10 border border-[#C8F135]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8F135] animate-pulse" />
          <span className="text-[#C8F135] text-xs font-bold">{DRIVER.eta}</span>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div variants={fade}
        className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl p-4 space-y-3">
        {STATUSES.map((s, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s.key} className="flex items-center gap-3">
              {/* Indicator */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                done   ? "bg-green-500/15 border border-green-500/20" :
                active ? "bg-[#C8F135]/15 border border-[#C8F135]/20" :
                         "bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/8"
              }`}>
                {done ? (
                  <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
                    <path d="M1 4.5l2.5 2.5L9 1" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : active ? (
                  <div className="w-2 h-2 rounded-full bg-[#C8F135] animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-white/15" />
                )}
              </div>

              {/* Label */}
              <span className={`text-sm font-medium ${
                done   ? "text-green-500 dark:text-green-400" :
                active ? "text-[#C8F135]" :
                         "text-gray-400 dark:text-white/25"
              }`}>{s.label}</span>

              {active && (
                <span className="ml-auto text-[#C8F135] text-xs font-bold">{DRIVER.eta}</span>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Haydovchi */}
      <motion.div variants={fade}
        className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl p-4">
        <p className="text-gray-500 dark:text-white/35 text-[10px] font-bold uppercase tracking-widest mb-3">
          Haydovchi
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-white/8 flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 dark:text-white/40"/>
              <path d="M3 20c0-4.418 3.582-7 8-7s8 2.582 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gray-400 dark:text-white/40"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">{DRIVER.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3L3.1 8.5l.5-2.7-2-1.9 2.7-.4z" fill="#C8F135"/>
                </svg>
                <span className="text-[#C8F135] text-xs font-bold">{DRIVER.rating}</span>
              </div>
              <span className="text-gray-400 dark:text-white/25 text-xs">{DRIVER.trips} ta safar</span>
            </div>
          </div>
          {/* Qo'ng'iroq */}
          <a href={`tel:${DRIVER.phone}`}
            className="w-10 h-10 rounded-xl bg-[#C8F135]/10 border border-[#C8F135]/20 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M11 10.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7.5 7 4.5 3.5 2.5 5c.5 4 4.5 8 8.5 8.5l1.5-2L11 10.5z" stroke="#C8F135" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </motion.div>

      {/* Call toast */}
      {called && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 max-w-[398px] mx-auto bg-green-500 text-white text-sm font-semibold px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-xl">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11 10.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7.5 7 4.5 3.5 2.5 5c.5 4 4.5 8 8.5 8.5l1.5-2L11 10.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          {DRIVER.phone}
        </motion.div>
      )}

    </motion.div>
  );
}
