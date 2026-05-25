"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";

const fade    = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const DRIVER = {
  name:    "Jasur Toshmatov",
  phone:   "+998 90 123 45 67",
  rating:  4.8,
  trips:   312,
  vehicle: "Isuzu",
  plate:   "01A123BC",
  eta:     "~15 daqiqa",
};

export default function TgOrderFoundPage() {
  const router = useRouter();
  const { tg } = useTelegram();

  // MainButton — kuzatish
  useEffect(() => {
    if (!tg) return;
    tg.MainButton.setText("Kuzatish");
    tg.MainButton.setParams({ color: "#F5C518", text_color: "#000000" });
    tg.MainButton.show();
    tg.MainButton.enable();
    const handler = () => router.push("/tg/order/tracking");
    tg.MainButton.onClick(handler);
    return () => {
      tg.MainButton.offClick(handler);
      tg.MainButton.hide();
    };
  }, [tg, router]);

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4 space-y-5"
    >

      {/* Header */}
      <motion.div variants={fade} className="flex flex-col items-center gap-3 py-5">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.1 }}
          className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M4 15l7 7 15-15" stroke="#22C55E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
        <div className="text-center">
          <h1 className="text-xl font-bold">Haydovchi topildi!</h1>
          <p className="text-gray-500 dark:text-white/40 text-sm mt-1">
            Kelish vaqti:{" "}
            <span className="text-[#F5C518] font-bold">{DRIVER.eta}</span>
          </p>
        </div>
      </motion.div>

      {/* Haydovchi */}
      <motion.div variants={fade}
        className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-white/8 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" className="text-gray-400 dark:text-white/40"/>
              <path d="M4 21c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-gray-400 dark:text-white/40"/>
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{DRIVER.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3L3.1 8.5l.5-2.7-2-1.9 2.7-.4z" fill="#F5C518"/>
                </svg>
                <span className="text-[#F5C518] text-xs font-bold">{DRIVER.rating}</span>
              </div>
              <span className="text-gray-400 dark:text-white/25 text-xs">{DRIVER.trips} ta safar</span>
            </div>
          </div>

          {/* Qo'ng'iroq */}
          <a href={`tel:${DRIVER.phone}`}
            className="w-10 h-10 rounded-xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11 10.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7.5 7 4.5 3.5 2.5 5c.5 4 4.5 8 8.5 8.5l1.5-2L11 10.5z" stroke="#F5C518" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </motion.div>

      {/* Mashina */}
      <motion.div variants={fade}
        className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
        {[
          { label: "Mashina",        value: DRIVER.vehicle },
          { label: "Davlat raqami",  value: DRIVER.plate   },
        ].map((row, i, arr) => (
          <div key={row.label}
            className={`flex items-center justify-between px-4 py-3.5 ${
              i < arr.length - 1 ? "border-b border-gray-200 dark:border-white/8" : ""
            }`}>
            <p className="text-gray-500 dark:text-white/40 text-sm">{row.label}</p>
            <p className="text-sm font-bold">{row.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Qayta qo'ng'iroq tugmasi */}
      <motion.div variants={fade}>
        <a href={`tel:${DRIVER.phone}`}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl border border-gray-200 dark:border-white/8 text-sm font-semibold text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 active:scale-[0.98] transition-all">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M11 10.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7.5 7 4.5 3.5 2.5 5c.5 4 4.5 8 8.5 8.5l1.5-2L11 10.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          {DRIVER.phone}
        </a>
      </motion.div>

    </motion.div>
  );
}
