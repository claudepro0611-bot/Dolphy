"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
type FilterKey = "Bugun" | "Hafta" | "Oy" | "Yil";

interface ChartPoint { label: string; amount: number }
interface Transaction {
  id: string; from: string; to: string;
  amount: number; date: string; status: "paid" | "pending";
}
interface PeriodData {
  orders: number; amount: number; avg: number; distance: number;
  chart: ChartPoint[];
  transactions: Transaction[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const BALANCE = 1_250_000;

const MOCK: Record<FilterKey, PeriodData> = {
  Bugun: {
    orders: 3, amount: 85_000, avg: 28_333, distance: 42,
    chart: [
      { label: "08:00", amount: 0      },
      { label: "10:00", amount: 25_000 },
      { label: "12:00", amount: 25_000 },
      { label: "14:00", amount: 35_000 },
      { label: "16:00", amount: 0      },
      { label: "18:00", amount: 0      },
    ],
    transactions: [
      { id: "t1", from: "Chilonzor", to: "Yunusobod", amount: 35_000, date: "Bugun 14:22", status: "paid"    },
      { id: "t2", from: "Sergeli",   to: "Olmazor",   amount: 25_000, date: "Bugun 10:45", status: "paid"    },
      { id: "t3", from: "Uchtepa",   to: "Mirzo Ul.", amount: 25_000, date: "Bugun 09:10", status: "pending" },
    ],
  },
  Hafta: {
    orders: 24, amount: 850_000, avg: 35_417, distance: 340,
    chart: [
      { label: "18-May", amount: 120_000 },
      { label: "19-May", amount: 95_000  },
      { label: "20-May", amount: 180_000 },
      { label: "21-May", amount: 145_000 },
      { label: "22-May", amount: 160_000 },
      { label: "23-May", amount: 150_000 },
    ],
    transactions: [
      { id: "t1", from: "Chilonzor", to: "Yunusobod",    amount: 150_000, date: "23-May", status: "paid" },
      { id: "t2", from: "Bektemir",  to: "Shayxontoh.",  amount: 160_000, date: "22-May", status: "paid" },
      { id: "t3", from: "Mirzo Ul.", to: "Sergeli",      amount: 145_000, date: "21-May", status: "paid" },
      { id: "t4", from: "Olmazor",   to: "Uchtepa",      amount: 180_000, date: "20-May", status: "paid" },
    ],
  },
  Oy: {
    orders: 96, amount: 3_400_000, avg: 35_417, distance: 1_420,
    chart: [
      { label: "1-May",  amount: 580_000 },
      { label: "8-May",  amount: 720_000 },
      { label: "15-May", amount: 650_000 },
      { label: "22-May", amount: 810_000 },
      { label: "29-May", amount: 640_000 },
    ],
    transactions: [
      { id: "t1", from: "Chilonzor", to: "Yunusobod",   amount: 810_000, date: "22-29 May", status: "paid" },
      { id: "t2", from: "Bektemir",  to: "Shayxontoh.", amount: 650_000, date: "15-22 May", status: "paid" },
      { id: "t3", from: "Sergeli",   to: "Mirzo Ul.",   amount: 720_000, date: "8-15 May",  status: "paid" },
      { id: "t4", from: "Olmazor",   to: "Uchtepa",     amount: 580_000, date: "1-8 May",   status: "paid" },
    ],
  },
  Yil: {
    orders: 1_140, amount: 41_200_000, avg: 36_140, distance: 17_800,
    chart: [
      { label: "Yan",  amount: 2_800_000 },
      { label: "Fev",  amount: 3_200_000 },
      { label: "Mar",  amount: 3_900_000 },
      { label: "Apr",  amount: 3_400_000 },
      { label: "May",  amount: 3_850_000 },
      { label: "Iyun", amount: 4_100_000 },
    ],
    transactions: [
      { id: "t1", from: "Chilonzor", to: "Yunusobod",   amount: 4_100_000, date: "Iyun",  status: "paid" },
      { id: "t2", from: "Bektemir",  to: "Shayxontoh.", amount: 3_850_000, date: "May",   status: "paid" },
      { id: "t3", from: "Sergeli",   to: "Mirzo Ul.",   amount: 3_400_000, date: "Aprel", status: "paid" },
      { id: "t4", from: "Olmazor",   to: "Uchtepa",     amount: 3_900_000, date: "Mart",  status: "paid" },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n >= 1_000_000
    ? (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + " mln"
    : n >= 1_000
    ? (n / 1_000).toFixed(0) + " K"
    : String(n);
}
function fmtFull(n: number) {
  return n.toLocaleString("uz-UZ") + " so'm";
}

// ─── Stat icons ───────────────────────────────────────────────────────────────
const StatIcons = {
  orders: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="2.5" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M4 6.5h7M4 9h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  income: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2v11M4.5 5H9a2 2 0 0 1 0 4H5.5a2 2 0 0 0 0 4H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  avg: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 11L5 7.5l3 2 3-5 2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  distance: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="4" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="11" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5.5 11H9.5M4 9.5V7a1 1 0 0 1 1-1h3l2.5 2.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-white/50 text-[10px] mb-0.5">{label}</p>
      <p className="text-[#FFD100] font-bold text-sm">{fmtFull(payload[0].value)}</p>
    </div>
  );
}

// ─── Withdraw Modal ───────────────────────────────────────────────────────────
function WithdrawModal({ balance, onClose }: { balance: number; onClose: () => void }) {
  const [amount,  setAmount]  = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const num     = parseInt(amount.replace(/\D/g, "") || "0", 10);
  const isValid = num >= 10_000 && num <= balance;

  function handleAmount(val: string) {
    const d = val.replace(/\D/g, "");
    setAmount(d ? parseInt(d, 10).toLocaleString("uz-UZ") : "");
    setError("");
  }

  async function submit() {
    if (!isValid) { setError(num < 10_000 ? "Minimal summa: 10 000 so'm" : "Balansdan ko'p"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    setTimeout(onClose, 1800);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0,  opacity: 1, scale: 1    }}
        exit={{   y: 24, opacity: 0, scale: 0.97  }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="w-full max-w-md dark:bg-[#111] bg-white rounded-2xl p-6 shadow-2xl dark:border-white/10 border border-gray-200"
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="dark:text-white text-gray-900 font-bold text-base">Yechib olish</h3>
                  <p className="dark:text-white/40 text-gray-500 text-xs mt-0.5">
                    Mavjud: <span className="text-[#FFD100] font-bold">{fmtFull(balance)}</span>
                  </p>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg dark:bg-white/5 bg-gray-100 flex items-center justify-center dark:text-white/50 text-gray-500 hover:dark:text-white hover:text-gray-900 transition-all">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Tez summalar */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[100_000, 300_000, 500_000].map(q => (
                  <button key={q} onClick={() => { setAmount(q.toLocaleString("uz-UZ")); setError(""); }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      num === q
                        ? "border-[#FFD100] bg-[#FFD100]/10 text-[#FFD100]"
                        : "dark:border-white/10 border-gray-200 dark:text-white/50 text-gray-500 hover:border-[#FFD100]/40 hover:text-[#FFD100]"
                    }`}>
                    {fmt(q)}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className={`flex items-center h-13 rounded-xl border-2 mb-1 px-4 transition-all ${
                error ? "border-red-400" : num > 0 && isValid ? "border-[#FFD100]" : "dark:border-white/15 border-gray-200 dark:bg-white/5 bg-gray-50"
              }`}>
                <input
                  type="text" inputMode="numeric"
                  value={amount}
                  onChange={e => handleAmount(e.target.value)}
                  placeholder="100 000"
                  className="flex-1 bg-transparent dark:text-white text-gray-900 font-bold text-lg outline-none placeholder:dark:text-white/20 placeholder:text-gray-300"
                />
                <span className="dark:text-white/30 text-gray-400 text-sm font-medium">so'm</span>
              </div>
              {error && <p className="text-red-400 text-xs mb-3 px-1">{error}</p>}
              {!error && <p className="dark:text-white/25 text-gray-400 text-xs mb-4 px-1">Minimal: 10 000 so'm</p>}

              {/* Progress bar */}
              {num > 0 && num <= balance && (
                <div className="h-1 dark:bg-white/10 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((num / balance) * 100, 100)}%` }}
                    className="h-full bg-[#FFD100] rounded-full"
                  />
                </div>
              )}

              <button onClick={submit} disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isValid && !loading
                    ? "bg-[#FFD100] text-black hover:bg-[#E6BC00] shadow-[0_4px_20px_rgba(255,209,0,0.2)] active:scale-[0.98]"
                    : "dark:bg-white/8 bg-gray-100 dark:text-white/25 text-gray-400 cursor-not-allowed"
                }`}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Yuborilmoqda...</>
                ) : "Yechib olish"}
              </button>
            </motion.div>
          ) : (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                <svg width="24" height="20" viewBox="0 0 28 22" fill="none">
                  <path d="M2 11l7 7L26 2" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="dark:text-white text-gray-900 font-bold text-base">Muvaffaqiyatli!</p>
              <p className="dark:text-white/40 text-gray-500 text-sm">{fmtFull(num)} karta hisobiga o&apos;tkazildi</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const FILTERS: FilterKey[] = ["Bugun", "Hafta", "Oy", "Yil"];
const GROWTH: Record<FilterKey, string> = { Bugun: "+12%", Hafta: "+8%", Oy: "+15%", Yil: "+23%" };

export default function EarningsPage() {
  const [filter,       setFilter]       = useState<FilterKey>("Hafta");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [balance,      setBalance]      = useState(BALANCE);

  const data = MOCK[filter];

  const STATS = [
    { label: "Buyurtmalar", value: data.orders.toString(), unit: "ta",   icon: StatIcons.orders,   accent: "#4F8EF7" },
    { label: "Daromad",     value: fmt(data.amount),       unit: "so'm", icon: StatIcons.income,   accent: "#FFD100" },
    { label: "O'rtacha",    value: fmt(data.avg),          unit: "so'm", icon: StatIcons.avg,      accent: "#A78BFA" },
    { label: "Masofa",      value: data.distance.toString(), unit: "km", icon: StatIcons.distance, accent: "#22C55E" },
  ];

  return (
    <div className="space-y-6">

      {/* Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <WithdrawModal balance={balance} onClose={() => setShowWithdraw(false)} />
        )}
      </AnimatePresence>

      {/* ── Top row: balans + stats ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Balans kartasi */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="col-span-1 relative rounded-2xl overflow-hidden p-6 flex flex-col justify-between min-h-[160px]"
          style={{ background: "linear-gradient(135deg, #141400 0%, #2a2400 60%, #161400 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #FFD100 0%, transparent 70%)" }} />

          <div className="relative z-10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-[2px] mb-3">Umumiy balans</p>
            <motion.p key={balance} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="text-white font-bold text-3xl tabular-nums leading-none">
              {balance.toLocaleString("uz-UZ")}
            </motion.p>
            <p className="text-white/35 text-sm mt-1">so&apos;m</p>
          </div>

          <div className="relative z-10 mt-4">
            <button onClick={() => setShowWithdraw(true)}
              className="flex items-center gap-2 bg-[#FFD100] text-black font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#E6BC00] transition-all active:scale-95 shadow-[0_4px_16px_rgba(255,209,0,0.25)]">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v8M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Yechib olish
            </button>
          </div>
        </motion.div>

        {/* 4 stat kartasi (2×2) */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="dark:bg-white/[0.03] bg-white dark:border-white/8 border border-gray-200 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: s.accent + "18", color: s.accent }}>
                  {s.icon}
                </div>
                <span className="text-[10px] font-bold text-green-500 dark:bg-green-500/10 bg-green-50 border dark:border-green-500/15 border-green-100 px-2 py-0.5 rounded-full">
                  {GROWTH[filter]}
                </span>
              </div>
              <p className="font-bold text-2xl tabular-nums leading-none" style={{ color: s.accent }}>
                {s.value}
                <span className="text-xs font-medium ml-1 opacity-50">{s.unit}</span>
              </p>
              <p className="dark:text-white/35 text-gray-500 text-xs mt-1.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Filter ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex gap-1.5 dark:bg-white/[0.03] bg-gray-100 p-1 rounded-xl w-fit"
      >
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${
              filter === f
                ? "bg-[#FFD100] text-black shadow-[0_2px_8px_rgba(255,209,0,0.25)]"
                : "dark:text-white/40 text-gray-500 hover:dark:text-white/70 hover:text-gray-700"
            }`}>
            {f}
          </button>
        ))}
      </motion.div>

      {/* ── Bottom row: chart + transactions ── */}
      <div className="grid grid-cols-5 gap-5">

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="col-span-3 dark:bg-white/[0.03] bg-white dark:border-white/8 border border-gray-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="dark:text-white text-gray-900 font-semibold text-sm">Daromad grafigi</p>
            <span className="text-[#FFD100] text-xs font-bold dark:bg-[#FFD100]/10 bg-amber-50 px-2.5 py-1 rounded-lg border dark:border-[#FFD100]/15 border-amber-100">
              {filter}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.chart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(150,150,150,0.7)", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(150,150,150,0.7)", fontSize: 9 }}
                tickFormatter={v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${v/1_000}K` : String(v)}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,209,0,0.15)", strokeWidth: 1 }} />
              <Line
                type="monotone" dataKey="amount"
                stroke="#FFD100" strokeWidth={2.5}
                dot={{ fill: "#FFD100", r: 3, strokeWidth: 0 }}
                activeDot={{ fill: "#FFD100", r: 5, stroke: "rgba(255,209,0,0.3)", strokeWidth: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="col-span-2 dark:bg-white/[0.03] bg-white dark:border-white/8 border border-gray-200 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 dark:border-b dark:border-white/6 border-b border-gray-100">
            <p className="dark:text-white text-gray-900 font-semibold text-sm">Oxirgi to&apos;lovlar</p>
            <span className="dark:text-white/25 text-gray-400 text-xs">{data.transactions.length} ta</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={filter}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {data.transactions.map((tx, i) => (
                <div key={tx.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${
                    i < data.transactions.length - 1 ? "dark:border-b dark:border-white/5 border-b border-gray-50" : ""
                  }`}>

                  {/* Status dot */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.status === "paid"
                      ? "bg-[#FFD100]/10 border dark:border-[#FFD100]/15 border-amber-100"
                      : "dark:bg-white/5 bg-gray-50 dark:border-white/8 border-gray-100"
                  } border`}>
                    {tx.status === "paid" ? (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 6.5l3 3 6-6" stroke="#FFD100" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" className="dark:text-white/25 text-gray-300"/>
                        <path d="M6.5 4v3l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="dark:text-white/25 text-gray-300"/>
                      </svg>
                    )}
                  </div>

                  {/* Route */}
                  <div className="flex-1 min-w-0">
                    <p className="dark:text-white text-gray-900 font-medium text-sm truncate">
                      {tx.from} → {tx.to}
                    </p>
                    <p className="dark:text-white/30 text-gray-400 text-xs mt-0.5">{tx.date}</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm tabular-nums ${
                      tx.status === "paid" ? "text-[#FFD100]" : "dark:text-white/30 text-gray-400"
                    }`}>
                      +{tx.amount.toLocaleString("uz-UZ")}
                    </p>
                    <span className={`text-[10px] font-semibold ${
                      tx.status === "paid" ? "text-green-400" : "dark:text-white/25 text-gray-400"
                    }`}>
                      {tx.status === "paid" ? "To'landi" : "Kutilmoqda"}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
}
