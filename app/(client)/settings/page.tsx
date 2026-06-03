"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useLang } from "@/components/Providers";
import { LANGS, type Lang } from "@/lib/i18n";

const fade      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";
const row   = "flex items-center justify-between px-5 py-4 hover:dark:bg-white/[0.04] hover:bg-gray-50 transition-colors cursor-pointer";
const sep   = "dark:border-b dark:border-white/8 border-b border-gray-100";

function GroupLabel({ label }: { label: string }) {
  return <p className={`px-1 mb-2 text-xs font-bold uppercase tracking-widest ${muted}`}>{label}</p>;
}

function Arrow() {
  return (
    <svg className={muted} width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M5 3l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-8 h-8 rounded-lg dark:bg-white/5 bg-gray-100 flex items-center justify-center dark:text-white/40 text-gray-500 flex-shrink-0">
      {children}
    </span>
  );
}

const Icons = {
  phone: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M10.5 9.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7 6l-3-3.5L2 4c.5 4 4.5 8 8.5 8.5l1.5-2-1.5-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  lock: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="2.5" y="6.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7.5" cy="10" r="1" fill="currentColor"/>
    </svg>
  ),
  card: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1.5" y="3.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 6.5h12" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4 9.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  bell: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2a4 4 0 0 0-4 4v3l-1 1.5h10L11.5 9V6a4 4 0 0 0-4-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M6 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  sun: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1M3.2 3.2l.7.7M11.1 11.1l.7.7M3.2 11.8l.7-.7M11.1 3.9l.7-.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  moon: (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <path d="M12 8.5A6 6 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  globe: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7.5 2C6 4 5 5.5 5 7.5s1 3.5 2.5 5.5M7.5 2C9 4 10 5.5 10 7.5S9 11 7.5 13M2 7.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
};

export default function SettingsPage() {
  const router        = useRouter();
  const { tr, lang, setLang } = useLang();
  const { theme, setTheme }   = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? theme === "dark" : false;

  function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="max-w-lg mx-auto space-y-6">

      <motion.div variants={fade}>
        <p className="text-[#C8F135] text-xs font-bold tracking-[3px] uppercase mb-1">Sozlamalar</p>
        <h1 className={`text-2xl font-bold ${main}`}>Sozlamalar</h1>
      </motion.div>

      {/* ── Hisob ── */}
      <motion.div variants={fade}>
        <GroupLabel label="Hisob" />
        <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl overflow-hidden">
          <Link href="/settings/phone" className={`${row} ${sep}`}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.phone}</RowIcon>
              <div>
                <p className={`text-sm font-semibold ${main}`}>Telefon o&apos;zgartirish</p>
                <p className={`text-xs ${muted}`}>+998 90 123 45 67</p>
              </div>
            </div>
            <Arrow />
          </Link>
          <Link href="/settings/pin" className={row}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.lock}</RowIcon>
              <div>
                <p className={`text-sm font-semibold ${main}`}>PIN o&apos;zgartirish</p>
                <p className={`text-xs ${muted}`}>Kirish kodi</p>
              </div>
            </div>
            <Arrow />
          </Link>
        </div>
      </motion.div>

      {/* ── To'lov ── */}
      <motion.div variants={fade}>
        <GroupLabel label="To'lov" />
        <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl overflow-hidden">
          <Link href="/settings/cards" className={row}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.card}</RowIcon>
              <div>
                <p className={`text-sm font-semibold ${main}`}>Kartalarim</p>
                <p className={`text-xs ${muted}`}>2 ta karta saqlangan</p>
              </div>
            </div>
            <Arrow />
          </Link>
        </div>
      </motion.div>

      {/* ── Bildirishnomalar ── */}
      <motion.div variants={fade}>
        <GroupLabel label="Bildirishnomalar" />
        <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl overflow-hidden">
          <Link href="/settings/notifications" className={row}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.bell}</RowIcon>
              <div>
                <p className={`text-sm font-semibold ${main}`}>Bildirishnomalar</p>
                <p className={`text-xs ${muted}`}>Push, SMS sozlamalari</p>
              </div>
            </div>
            <Arrow />
          </Link>
        </div>
      </motion.div>

      {/* ── Ilova ── */}
      <motion.div variants={fade}>
        <GroupLabel label="Ilova" />
        <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl overflow-hidden">

          {/* Mavzu */}
          <div className={`${row} ${sep}`}>
            <div className="flex items-center gap-3">
              <RowIcon>{mounted ? (isDark ? Icons.moon : Icons.sun) : Icons.sun}</RowIcon>
              <div>
                <p className={`text-sm font-semibold ${main}`}>
                  {mounted ? (isDark ? "Qorong'u rejim" : "Kunduzgi rejim") : "Kunduzgi rejim"}
                </p>
                <p className={`text-xs ${muted}`}>Ilova ko&apos;rinishi</p>
              </div>
            </div>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${isDark ? "bg-[#C8F135]" : "bg-gray-300 dark:bg-white/20"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${isDark ? "left-5" : "left-0.5"}`} />
            </button>
          </div>

          {/* Til */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-3">
              <RowIcon>{Icons.globe}</RowIcon>
              <p className={`text-sm font-semibold ${main}`}>Til</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLang(l.code as Lang)}
                  className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                    lang === l.code
                      ? "border-[#C8F135] bg-[#C8F135]/8 text-[#C8F135]"
                      : `dark:border-white/10 border-gray-200 ${muted} hover:dark:border-white/20 hover:border-gray-300`
                  }`}>
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Chiqish ── */}
      <motion.div variants={fade}>
        <button onClick={logout}
          className="w-full h-12 border dark:border-red-500/20 border-red-200 text-red-500 dark:text-red-400 font-semibold text-sm rounded-2xl hover:dark:bg-red-500/5 hover:bg-red-50 hover:dark:border-red-500/35 hover:border-red-300 transition-all">
          Chiqish
        </button>
      </motion.div>

      <motion.div variants={fade} className={`${muted} text-xs text-center pb-4`}>
        Dolphy v1.0.0
      </motion.div>

    </motion.div>
  );
}
