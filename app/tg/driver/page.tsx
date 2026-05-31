"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useTelegram } from "@/hooks/useTelegram";

const fade    = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function TgDriverPage() {
  const router = useRouter();
  const { firstName } = useTelegram();

  const [online,       setOnline]       = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [todayCount,   setTodayCount]   = useState(0);
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("tg_driver_online");
    setOnline(saved === "true");
    fetchStats();

    const ch = supabase
      .channel("driver-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchStats)
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  async function fetchStats() {
    const today = new Date().toISOString().split("T")[0];
    const [{ count: pending }, { count: todayDone }] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("id", { count: "exact", head: true })
        .eq("status", "delivered").gte("created_at", today),
    ]);
    setPendingCount(pending ?? 0);
    setTodayCount(todayDone ?? 0);
  }

  function toggleOnline() {
    const next = !online;
    setOnline(next);
    localStorage.setItem("tg_driver_online", String(next));
  }

  if (!mounted) return null;

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4 space-y-5"
    >
      {/* Salom */}
      <motion.div variants={fade}>
        <p className="text-gray-500 dark:text-white/40 text-sm">Haydovchi paneli</p>
        <h1 className="text-2xl font-bold mt-0.5">Salom, {firstName}!</h1>
      </motion.div>

      {/* Online toggle */}
      <motion.div variants={fade}>
        <button
          onClick={toggleOnline}
          className={`w-full flex items-center justify-between px-5 py-5 rounded-2xl transition-all active:scale-[0.98] ${
            online
              ? "bg-[#C8F135] text-black shadow-[0_4px_24px_rgba(200,241,53,0.3)]"
              : "dark:bg-white/[0.05] bg-gray-100 dark:border border-white/10 dark:text-white text-gray-700"
          }`}
        >
          <div>
            <p className="font-black text-lg">{online ? "ONLINE" : "OFFLINE"}</p>
            <p className={`text-xs mt-0.5 font-medium ${online ? "opacity-60" : "dark:opacity-40 opacity-50"}`}>
              {online ? "Zakazlar qabul qilinmoqda" : "Bosing — ishga tayyor bo'ling"}
            </p>
          </div>
          <div className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${
            online ? "bg-black/20 justify-end" : "bg-gray-300 dark:bg-white/20 justify-start"
          }`}>
            <div className={`w-5 h-5 rounded-full ${online ? "bg-black/70" : "bg-white"}`} />
          </div>
        </button>
      </motion.div>

      {/* Statistika */}
      <motion.div variants={fade} className="grid grid-cols-2 gap-3">
        <div className="dark:bg-white/[0.04] bg-white border border-gray-200 dark:border-white/8 rounded-2xl p-4 text-center">
          <p className="text-[#F59E0B] font-black text-3xl">{pendingCount}</p>
          <p className="dark:text-white/35 text-gray-500 text-xs mt-1">Yangi zakazlar</p>
        </div>
        <div className="dark:bg-white/[0.04] bg-white border border-gray-200 dark:border-white/8 rounded-2xl p-4 text-center">
          <p className="text-[#22C55E] font-black text-3xl">{todayCount}</p>
          <p className="dark:text-white/35 text-gray-500 text-xs mt-1">Bugun yetkazildi</p>
        </div>
      </motion.div>

      {/* Zakazlar tugmasi */}
      <motion.div variants={fade}>
        <button
          onClick={() => router.push("/tg/driver/orders")}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl dark:bg-white/[0.04] bg-white border border-gray-200 dark:border-white/8 active:dark:bg-white/[0.07] active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8F135]/10 border border-[#C8F135]/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="14" height="14" rx="2" stroke="#C8F135" strokeWidth="1.4"/>
                <path d="M5 7h8M5 10h8M5 13h5" stroke="#C8F135" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Zakazlar</p>
              <p className="dark:text-white/35 text-gray-500 text-xs mt-0.5">
                {pendingCount > 0 ? `${pendingCount} ta yangi zakaz` : "Hozircha yangi zakaz yo'q"}
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center">
              <span className="text-black font-black text-[10px]">{pendingCount}</span>
            </div>
          )}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="dark:text-white/25 text-gray-400 ml-2">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </motion.div>

      {/* Chiqish */}
      <motion.div variants={fade}>
        <button
          onClick={() => { localStorage.removeItem("tg_role"); localStorage.removeItem("tg_driver_online"); router.replace("/tg"); }}
          style={{ width: "100%", padding: "14px", background: "#1E1E1E", color: "#ff4444", fontWeight: 600, borderRadius: "12px", border: "0.5px solid #ff4444" }}
        >
          Chiqish
        </button>
      </motion.div>
    </motion.div>
  );
}
