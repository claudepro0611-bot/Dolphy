"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/Providers";

const MOCK_USER = {
  name: "Abdullayev Jasur",
  phone: "+998 90 123 45 67",
  joined: "Mart 2025",
  orders: 12, spent: 320000, rating: 4.9,
};

const card  = "dark:bg-white/[0.03] bg-gray-50 dark:border-white/10 border border-gray-200 rounded-2xl";
const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";
const fade      = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const MENU = [
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    label: "Buyurtmalar tarixi", href: "/orders",
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    label: "Sozlamalar", href: "/settings",
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    label: "Yordam", href: "#",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { tr } = useLang();

  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(MOCK_USER.name);
  const [saved,   setSaved]   = useState(false);

  function save() { setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function logout() { document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; router.push("/login"); }

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="max-w-lg mx-auto space-y-4">

      {/* Sarlavha */}
      <motion.div variants={fade} className="mb-2">
        <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-1">{tr("profile")}</p>
        <h1 className={`text-2xl font-bold ${main}`}>{tr("profile")}</h1>
      </motion.div>

      {/* Avatar kartasi */}
      <motion.div variants={fade} className={`${card} p-6`}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFD100] flex items-center justify-center text-black font-black text-2xl flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus
                className={`w-full dark:bg-white/8 bg-gray-100 border border-[#FFD100]/50 rounded-xl px-3 py-2 ${main} font-bold text-sm outline-none mb-1`} />
            ) : (
              <p className={`${main} font-bold text-lg`}>{name}</p>
            )}
            <p className={`${muted} text-sm`}>{MOCK_USER.phone}</p>
          </div>
          {editing ? (
            <button onClick={save} className="bg-[#FFD100] text-black font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#E6BC00] transition-all flex-shrink-0">
              {tr("save")}
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className={`border dark:border-white/15 border-gray-300 ${muted} text-xs font-bold px-4 py-2 rounded-xl hover:dark:border-white/30 hover:border-gray-400 transition-all flex-shrink-0`}>
              {tr("edit")}
            </button>
          )}
        </div>

        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 bg-green-500/10 border border-green-500/25 rounded-xl px-3 py-2 mb-4 overflow-hidden">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3.5 3.5L11 1" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-green-500 text-xs font-bold">{tr("saved")}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 dark:border-t dark:border-white/8 border-t border-gray-100">
          <div className={`flex items-center gap-2 ${muted} text-xs`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6 4v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {MOCK_USER.joined} dan beri foydalanuvchi
          </div>
        </div>
      </motion.div>

      {/* Statistika */}
      <motion.div variants={fade} className="grid grid-cols-3 gap-3">
        {[
          { label: "Zakazlar",   value: MOCK_USER.orders },
          { label: "Sarflangan", value: `${(MOCK_USER.spent / 1000).toFixed(0)}K` },
          { label: "Reyting",    value: MOCK_USER.rating },
        ].map(s => (
          <div key={s.label} className={`${card} p-4 text-center`}>
            <div className="text-2xl font-bold text-[#FFD100]">{s.value}</div>
            <div className={`${muted} text-xs mt-0.5`}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Menyu */}
      <motion.div variants={fade} className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {MENU.map((item, i) => (
          <Link key={item.label} href={item.href}
            className={`flex items-center justify-between px-5 py-4 hover:dark:bg-white/[0.04] hover:bg-gray-50 transition-colors ${i < MENU.length - 1 ? "dark:border-b dark:border-white/8 border-b border-gray-100" : ""}`}>
            <div className={`flex items-center gap-3 ${muted}`}>
              {item.icon}
              <span className={`text-sm font-semibold ${main}`}>{item.label}</span>
            </div>
            <svg className={muted} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ))}
      </motion.div>

      {/* Chiqish */}
      <motion.div variants={fade}>
        <button onClick={logout}
          className="w-full h-12 border border-red-500/25 text-red-400 font-bold text-sm rounded-2xl hover:bg-red-500/8 hover:border-red-500/40 transition-all">
          {tr("logout")}
        </button>
      </motion.div>

      <motion.div variants={fade} className={`${muted} text-xs text-center pb-4`}>
        Yotoq Logistics v1.0.0
      </motion.div>

    </motion.div>
  );
}
