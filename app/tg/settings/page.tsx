"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLang } from "@/components/Providers";
import { LANGS, type Lang } from "@/lib/i18n";
import { useTelegram } from "@/hooks/useTelegram";
import { useTgTheme } from "../tg-theme-ctx";

const fade    = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const row  = "flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors";
const sep  = "border-b border-gray-200 dark:border-white/6";
const card = "bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden";

function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/6 flex items-center justify-center text-gray-500 dark:text-white/40 flex-shrink-0">
      {children}
    </span>
  );
}

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-gray-400 dark:text-white/35">
      <path d="M5 3l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${on ? "bg-[#F5C518]" : "bg-gray-300 dark:bg-white/15"}`}>
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
      />
    </button>
  );
}

// Icons
const Icons = {
  phone: <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M10.5 9.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7 6l-3-3.5L2 4c.5 4 4.5 8 8.5 8.5l1.5-2-1.5-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  lock:  <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><rect x="2.5" y="6.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7.5" cy="10" r="1" fill="currentColor"/></svg>,
  card:  <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="3.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 6.5h12M4 9.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  bell:  <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M7.5 2a4 4 0 0 0-4 4v3l-1 1.5h10L11.5 9V6a4 4 0 0 0-4-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3"/></svg>,
  sun:   <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1M3.2 3.2l.7.7M11.1 11.1l.7.7M3.2 11.8l.7-.7M11.1 3.9l.7-.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  moon:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 8.5A6 6 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  globe: <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 2C6 4 5 5.5 5 7.5s1 3.5 2.5 5.5M7.5 2C9 4 10 5.5 10 7.5S9 11 7.5 13M2 7.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

export default function TgSettingsPage() {
  const router = useRouter();
  const { tg } = useTelegram();
  const { isDark, setIsDark } = useTgTheme();
  const { lang, setLang } = useLang();

  const [notifs, setNotifs] = useState({ orders: true, payment: true, push: true, sms: false });

  function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    tg?.close();
    router.push("/login");
  }

  function GroupLabel({ text }: { text: string }) {
    return <p className="px-1 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/35">{text}</p>;
  }

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4 space-y-5"
    >
      <motion.div variants={fade}>
        <p className="text-gray-500 dark:text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1">Sozlamalar</p>
        <h1 className="text-xl font-bold">Sozlamalar</h1>
      </motion.div>

      {/* Hisob */}
      <motion.div variants={fade}>
        <GroupLabel text="Hisob" />
        <div className={card}>
          <button className={`${row} ${sep} w-full`}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.phone}</RowIcon>
              <div className="text-left">
                <p className="text-sm font-semibold">Telefon</p>
                <p className="text-xs text-gray-500 dark:text-white/35">+998 90 123 45 67</p>
              </div>
            </div>
            <Arrow />
          </button>
          <button className={`${row} w-full`}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.lock}</RowIcon>
              <p className="text-sm font-semibold">PIN o&apos;zgartirish</p>
            </div>
            <Arrow />
          </button>
        </div>
      </motion.div>

      {/* To'lov */}
      <motion.div variants={fade}>
        <GroupLabel text="To'lov" />
        <div className={card}>
          <button className={`${row} w-full`}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.card}</RowIcon>
              <div className="text-left">
                <p className="text-sm font-semibold">Kartalarim</p>
                <p className="text-xs text-gray-500 dark:text-white/35">2 ta karta</p>
              </div>
            </div>
            <Arrow />
          </button>
        </div>
      </motion.div>

      {/* Bildirishnomalar */}
      <motion.div variants={fade}>
        <GroupLabel text="Bildirishnomalar" />
        <div className={card}>
          {[
            { key: "orders"  as const, label: "Buyurtmalar",  sub: "Holat o'zgarishi"  },
            { key: "payment" as const, label: "To'lov",        sub: "Pul o'tkazilganda" },
            { key: "push"    as const, label: "Push",          sub: "Ilova xabarlari"   },
            { key: "sms"     as const, label: "SMS",           sub: "Muhim xabarlar"    },
          ].map((item, i, arr) => (
            <div key={item.key} className={`${row} ${i < arr.length - 1 ? sep : ""}`}>
              <div className="flex items-center gap-3">
                <RowIcon>{Icons.bell}</RowIcon>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-white/35">{item.sub}</p>
                </div>
              </div>
              <Toggle on={notifs[item.key]} onToggle={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key] }))} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ilova */}
      <motion.div variants={fade}>
        <GroupLabel text="Ilova" />
        <div className={card}>
          {/* Mavzu */}
          <div className={`${row} ${sep}`}>
            <div className="flex items-center gap-3">
              <RowIcon>{isDark ? Icons.moon : Icons.sun}</RowIcon>
              <p className="text-sm font-semibold">
                {isDark ? "Qorong'u" : "Kunduzgi"}
              </p>
            </div>
            <Toggle on={isDark} onToggle={() => setIsDark(!isDark)} />
          </div>

          {/* Til */}
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3 mb-3">
              <RowIcon>{Icons.globe}</RowIcon>
              <p className="text-sm font-semibold">Til</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLang(l.code as Lang)}
                  className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                    lang === l.code
                      ? "border-[#F5C518] bg-[#F5C518]/8 text-[#F5C518]"
                      : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/35 hover:border-gray-300 dark:hover:border-white/20"
                  }`}>
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chiqish */}
      <motion.div variants={fade}>
        <button onClick={logout}
          className="w-full py-3.5 rounded-2xl border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/5 hover:border-red-500/35 transition-all">
          Chiqish
        </button>
      </motion.div>

      <motion.div variants={fade} className="text-gray-400 dark:text-white/35 text-[10px] text-center pb-2">
        Yotoq Mini App v1.0.0
      </motion.div>
    </motion.div>
  );
}
