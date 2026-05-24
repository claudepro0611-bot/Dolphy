"use client";

import { motion } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";

const fade    = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const MOCK_USER = {
  phone:   "+998 90 123 45 67",
  joined:  "Mart 2025",
  orders:  12,
  spent:   320_000,
  rating:  4.9,
  saved:   2,          // karta
};

export default function TgProfilePage() {
  const { firstName } = useTelegram();

  const STATS = [
    { label: "Buyurtma",   value: MOCK_USER.orders },
    { label: "Reyting",    value: MOCK_USER.rating  },
    { label: "Karta",      value: MOCK_USER.saved   },
  ];

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="px-4 py-5 space-y-5"
    >

      {/* Avatar + ism */}
      <motion.div variants={fade} className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F5C518]/15 border border-[#F5C518]/20 flex items-center justify-center flex-shrink-0">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="10" r="5" stroke="#F5C518" strokeWidth="1.6"/>
            <path d="M4 26c0-5.523 4.477-9 10-9s10 3.477 10 9" stroke="#F5C518" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold">{firstName}</h1>
          <p className="text-white/40 text-sm mt-0.5">{MOCK_USER.phone}</p>
          <p className="text-white/25 text-xs mt-0.5">A&apos;zo: {MOCK_USER.joined}</p>
        </div>
      </motion.div>

      {/* Statistika */}
      <motion.div variants={fade} className="grid grid-cols-3 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-[#F5C518] font-bold text-2xl leading-none">{s.value}</p>
            <p className="text-white/35 text-[10px] mt-2">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Sarflangan */}
      <motion.div variants={fade}
        className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-white/35 text-xs uppercase tracking-wider mb-1">Jami sarflangan</p>
          <p className="text-[#F5C518] font-bold text-2xl">
            {(MOCK_USER.spent / 1000).toFixed(0)}K
            <span className="text-sm font-normal text-white/40 ml-1">so'm</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#F5C518]/10 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 3v16M7.5 7H13a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6H15" stroke="#F5C518" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
      </motion.div>

      {/* Info qatorlar */}
      <motion.div variants={fade}
        className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
        {[
          {
            icon: (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M10.5 9.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7 6l-3-3.5L2 4c.5 4 4.5 8 8.5 8.5l1.5-2-1.5-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            ),
            label: "Telefon",
            value: MOCK_USER.phone,
          },
          {
            icon: (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1.5" y="3.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1.5 6.5h12M4 9.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            ),
            label: "Saqlangan karta",
            value: `${MOCK_USER.saved} ta`,
          },
        ].map((row, i, arr) => (
          <div key={row.label}
            className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-white/8" : ""}`}>
            <span className="text-white/30 flex-shrink-0">{row.icon}</span>
            <div className="flex-1">
              <p className="text-white/35 text-[10px] uppercase tracking-wider">{row.label}</p>
              <p className="text-sm font-medium mt-0.5">{row.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

    </motion.div>
  );
}
