"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";

const STATS = [
  { label: "Jami buyurtma", value: "0" },
  { label: "Sarflangan",    value: "0" },
  { label: "Reyting",       value: "—" },
];

const fade    = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function TgClientPage() {
  const { firstName } = useTelegram();

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4 space-y-5"
    >
      <motion.div variants={fade}>
        <p className="text-gray-500 dark:text-white/40 text-sm">Xush kelibsiz</p>
        <h1 className="text-2xl font-bold mt-0.5">Salom, {firstName}!</h1>
      </motion.div>

      <motion.div variants={fade}>
        <Link
          href="/tg/order/new"
          className="flex items-center justify-between w-full px-5 py-4 rounded-2xl font-bold text-base text-black shadow-[0_4px_24px_rgba(200,241,53,0.3)] active:scale-[0.98] transition-transform"
          style={{ background: "linear-gradient(135deg, #C8F135 0%, #E6B600 100%)" }}
        >
          <span>Buyurtma berish</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </motion.div>

      <motion.div variants={fade} className="grid grid-cols-3 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl p-3.5 text-center">
            <p className="text-[#C8F135] font-bold text-xl leading-none">{s.value}</p>
            <p className="text-gray-500 dark:text-white/35 text-[10px] mt-1.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fade} className="grid grid-cols-2 gap-3">
        {[
          { href: "/tg/history", label: "Tarix", sub: "Barcha buyurtmalar",
            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 7h8M6 10h8M6 13h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
          { href: "/tg/profile", label: "Profil", sub: "Ma'lumotlarim",
            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 18c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl p-4 flex items-center gap-3 active:bg-gray-200 dark:active:bg-white/[0.07] transition-colors">
            <span className="text-[#C8F135] flex-shrink-0">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-gray-400 dark:text-white/30 text-xs mt-0.5">{item.sub}</p>
            </div>
          </Link>
        ))}
      </motion.div>

    </motion.div>
  );
}
