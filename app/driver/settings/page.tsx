"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useLang } from "@/components/Providers";
import { LANGS, type Lang } from "@/lib/i18n";

const fade      = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";
const row   = "flex items-center justify-between px-5 py-4 hover:dark:bg-white/[0.03] hover:bg-gray-50 transition-colors";
const sep   = "dark:border-b dark:border-white/6 border-b border-gray-100";
const card  = "dark:bg-white/[0.03] bg-white dark:border-white/8 border border-gray-200 rounded-2xl overflow-hidden";

function Label({ text }: { text: string }) {
  return <p className={`px-1 mb-2 text-xs font-bold uppercase tracking-widest ${muted}`}>{text}</p>;
}

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={muted}>
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

// SVG icon set
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
  car: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 9V7l2-3h6l2 3v2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M1 9h13v2.5H1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="4" cy="11.5" r="1" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="11" cy="11.5" r="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  doc: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M4 1.5h5l3 3V13a.5.5 0 0 1-.5.5H3.5A.5.5 0 0 1 3 13V2a.5.5 0 0 1 .5-.5H4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M9 1.5V5h3M5 8h5M5 10.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
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

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
        enabled ? "bg-[#FFD100]" : "dark:bg-white/15 bg-gray-300"
      }`}>
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
      />
    </button>
  );
}

export default function DriverSettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);

  const [notifs, setNotifs] = useState({
    new_order:   true,
    cancel:      true,
    payment:     true,
    push:        true,
    sms:         false,
  });

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? theme === "dark" : true;

  function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  }

  function toggle(k: keyof typeof notifs) {
    setNotifs(p => ({ ...p, [k]: !p[k] }));
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl space-y-6">

      {/* ── Hisob ── */}
      <motion.div variants={fade}>
        <Label text="Hisob" />
        <div className={card}>
          <button className={`${row} ${sep} w-full`}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.phone}</RowIcon>
              <div className="text-left">
                <p className={`text-sm font-semibold ${main}`}>Telefon raqam</p>
                <p className={`text-xs ${muted}`}>+998 90 — — — —</p>
              </div>
            </div>
            <Arrow />
          </button>
          <button className={`${row} w-full`}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.lock}</RowIcon>
              <div className="text-left">
                <p className={`text-sm font-semibold ${main}`}>Parol o'zgartirish</p>
                <p className={`text-xs ${muted}`}>Kirish xavfsizligi</p>
              </div>
            </div>
            <Arrow />
          </button>
        </div>
      </motion.div>

      {/* ── Transport ── */}
      <motion.div variants={fade}>
        <Label text="Transport" />
        <div className={card}>
          <button className={`${row} ${sep} w-full`}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.car}</RowIcon>
              <div className="text-left">
                <p className={`text-sm font-semibold ${main}`}>Mashina ma'lumotlari</p>
                <p className={`text-xs ${muted}`}>Gazelle · 01 A 123 BC</p>
              </div>
            </div>
            <Arrow />
          </button>
          <button className={`${row} w-full`}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.doc}</RowIcon>
              <div className="text-left">
                <p className={`text-sm font-semibold ${main}`}>Hujjatlar</p>
                <p className={`text-xs ${muted}`}>Litsenziya, sug'urta</p>
              </div>
            </div>
            <Arrow />
          </button>
        </div>
      </motion.div>

      {/* ── To'lov ── */}
      <motion.div variants={fade}>
        <Label text="To'lov" />
        <div className={card}>
          <button className={`${row} w-full`}>
            <div className="flex items-center gap-3">
              <RowIcon>{Icons.card}</RowIcon>
              <div className="text-left">
                <p className={`text-sm font-semibold ${main}`}>Bank kartasi</p>
                <p className={`text-xs ${muted}`}>UZCARD •••• 9012</p>
              </div>
            </div>
            <Arrow />
          </button>
        </div>
      </motion.div>

      {/* ── Bildirishnomalar ── */}
      <motion.div variants={fade}>
        <Label text="Bildirishnomalar" />
        <div className={card}>
          {[
            { key: "new_order" as const, label: "Yangi zakaz",     sub: "Yangi zakaz kelganda" },
            { key: "cancel"   as const, label: "Bekor qilish",     sub: "Zakaz bekor qilinganda" },
            { key: "payment"  as const, label: "To'lov",           sub: "Pul o'tkazilganda" },
            { key: "push"     as const, label: "Push bildirishnoma", sub: "Ilova xabarnomalar", isLast: false },
            { key: "sms"      as const, label: "SMS",              sub: "Muhim xabarlar", isLast: true },
          ].map((item, i, arr) => (
            <div key={item.key} className={`${row} ${i < arr.length - 1 ? sep : ""}`}>
              <div className="flex items-center gap-3">
                <RowIcon>{Icons.bell}</RowIcon>
                <div>
                  <p className={`text-sm font-semibold ${main}`}>{item.label}</p>
                  <p className={`text-xs ${muted}`}>{item.sub}</p>
                </div>
              </div>
              <Toggle enabled={notifs[item.key]} onToggle={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Ilova ── */}
      <motion.div variants={fade}>
        <Label text="Ilova" />
        <div className={card}>

          {/* Mavzu */}
          <div className={`${row} ${sep}`}>
            <div className="flex items-center gap-3">
              <RowIcon>{mounted ? (isDark ? Icons.moon : Icons.sun) : Icons.sun}</RowIcon>
              <div>
                <p className={`text-sm font-semibold ${main}`}>
                  {mounted ? (isDark ? "Qorong'u rejim" : "Kunduzgi rejim") : "Rejim"}
                </p>
                <p className={`text-xs ${muted}`}>Ilova ko'rinishi</p>
              </div>
            </div>
            <Toggle enabled={isDark} onToggle={() => setTheme(isDark ? "light" : "dark")} />
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
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                    lang === l.code
                      ? "border-[#FFD100] bg-[#FFD100]/8 text-[#FFD100]"
                      : `dark:border-white/10 border-gray-200 ${muted} hover:dark:border-white/20 hover:border-gray-300`
                  }`}>
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Versiya */}
      <motion.div variants={fade}>
        <p className={`text-xs ${muted} text-center`}>Yotoq Haydovchi v1.0.0</p>
      </motion.div>

    </motion.div>
  );
}
