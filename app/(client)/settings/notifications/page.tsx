"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

interface ToggleItem { key: string; label: string; sub: string; }

const OrderIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <rect x="1" y="2" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M3.5 5.5h6M3.5 8h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const PayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1.5v10M4 4h3.5a2 2 0 0 1 0 4H4.5a2 2 0 0 0 0 4H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const ChanIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 2a4.5 4.5 0 0 1 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M6.5 4.5a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="6.5" cy="9" r="1.5" fill="currentColor" opacity=".6"/>
  </svg>
);

interface Group { title: string; icon: React.ReactNode; items: ToggleItem[] }

const GROUPS: Group[] = [
  {
    title: "Buyurtmalar",
    icon: <OrderIcon />,
    items: [
      { key: "order_new",    label: "Yangi buyurtma",     sub: "Buyurtma qabul qilinganida"      },
      { key: "order_status", label: "Holat o'zgarishi",   sub: "Haydovchi topildi, yuk olindi"   },
      { key: "order_cancel", label: "Bekor qilinish",     sub: "Buyurtma bekor qilinganda"       },
    ],
  },
  {
    title: "To'lov",
    icon: <PayIcon />,
    items: [
      { key: "pay_received", label: "To'lov keldi",       sub: "Karta hisobiga pul tushganda"    },
      { key: "pay_report",   label: "Oylik hisobot",      sub: "Har oyning 1-sanasida"           },
    ],
  },
  {
    title: "Kanal",
    icon: <ChanIcon />,
    items: [
      { key: "ch_push",      label: "Push bildirishnoma", sub: "Ilovadagi xabarnomalar"          },
      { key: "ch_sms",       label: "SMS",                sub: "Muhim xabarnomalar SMS orqali"   },
    ],
  },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
        enabled ? "bg-[#FFD100]" : "dark:bg-white/15 bg-gray-300"
      }`}>
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
      />
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();

  const [states, setStates] = useState<Record<string, boolean>>({
    order_new: true, order_status: true, order_cancel: false,
    pay_received: true, pay_report: false,
    ch_push: true, ch_sms: false,
  });

  const [saved, setSaved] = useState(false);

  function toggle(key: string) {
    setStates(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* Toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl bg-green-500 text-white text-sm font-semibold"
          >
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <path d="M1 7l4.5 4.5L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sozlamalar saqlandi
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orqaga */}
      <button onClick={() => router.push("/settings")}
        className={`flex items-center gap-2 ${muted} text-sm font-semibold hover:dark:text-white hover:text-gray-900 transition-colors`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Orqaga
      </button>

      {/* Sarlavha */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-1">Bildirishnomalar</p>
        <h1 className={`text-2xl font-bold ${main}`}>Bildirishnomalar</h1>
      </motion.div>

      {/* Guruhlar */}
      {GROUPS.map((group, gi) => (
        <motion.div key={group.title}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.07 }}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className={`dark:text-white/30 text-gray-400`}>{group.icon}</span>
            <p className={`text-xs font-bold uppercase tracking-wider ${muted}`}>{group.title}</p>
          </div>
          <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {group.items.map((item, i) => (
              <div key={item.key}
                className={`flex items-center justify-between px-5 py-4 ${i < group.items.length - 1 ? "dark:border-b dark:border-white/8 border-b border-gray-100" : ""}`}>
                <div className="flex-1 pr-4">
                  <p className={`text-sm font-semibold ${main}`}>{item.label}</p>
                  <p className={`text-xs ${muted} mt-0.5`}>{item.sub}</p>
                </div>
                <Toggle enabled={!!states[item.key]} onToggle={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Saqlash */}
      <motion.button
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        onClick={save}
        className="w-full h-13 py-3.5 rounded-2xl bg-[#FFD100] text-black font-bold text-sm hover:bg-[#E6BC00] transition-all shadow-[0_4px_20px_rgba(255,209,0,0.25)] active:scale-[0.98]"
      >
        Saqlash
      </motion.button>
    </div>
  );
}
