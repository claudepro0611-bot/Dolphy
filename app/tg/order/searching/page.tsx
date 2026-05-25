"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";

export default function TgOrderSearchingPage() {
  const router = useRouter();
  const { tg } = useTelegram();

  // 3 soniyadan keyin found sahifasiga o'tish
  useEffect(() => {
    const timer = setTimeout(() => router.push("/tg/order/found"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  // MainButton yashirish
  useEffect(() => {
    if (!tg) return;
    tg.MainButton.hide();
  }, [tg]);

  return (
    <div className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4 flex flex-col items-center justify-center gap-10">

      {/* Spinner */}
      <div className="relative w-28 h-28">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[3px] border-[#F5C518]/15 border-t-[#F5C518]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border-[2px] border-[#F5C518]/10 border-b-[#F5C518]/40"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="30" height="24" viewBox="0 0 30 24" fill="none" className="text-[#F5C518]">
            <rect x="1" y="3" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M19 7h6.5l3.5 7v6h-10V7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <circle cx="6" cy="21" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="24" cy="21" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </div>
      </div>

      {/* Matn */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold">Haydovchi izlanmoqda...</h2>
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
              className="w-2 h-2 rounded-full bg-[#F5C518]"
            />
          ))}
        </div>
        <p className="text-gray-500 dark:text-white/35 text-sm">
          Yaqin atrofdagi haydovchilar tekshirilmoqda
        </p>
      </div>

      {/* Bekor qilish */}
      <button
        onClick={() => router.push("/tg/order/new")}
        className="px-8 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/5 active:scale-[0.97] transition-all">
        Bekor qilish
      </button>
    </div>
  );
}
