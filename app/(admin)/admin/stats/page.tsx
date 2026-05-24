"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const ORDERS_DATA = [
  { day: "Du",  count: 28, revenue: 980000  },
  { day: "Se",  count: 35, revenue: 1240000 },
  { day: "Ch",  count: 22, revenue: 810000  },
  { day: "Pa",  count: 41, revenue: 1560000 },
  { day: "Ju",  count: 38, revenue: 1390000 },
  { day: "Sh",  count: 52, revenue: 1920000 },
  { day: "Ya",  count: 19, revenue: 690000  },
];

const MONTHLY_DATA = [
  { month: "Yan", revenue: 18400000 },
  { month: "Fev", revenue: 21200000 },
  { month: "Mar", revenue: 19800000 },
  { month: "Apr", revenue: 24600000 },
  { month: "May", revenue: 28100000 },
  { month: "Iyn", revenue: 31400000 },
];

const TRUCK_DATA = [
  { name: "Gazelle", value: 58, color: "#FFD100" },
  { name: "O'rta",   value: 28, color: "#4F8EF7" },
  { name: "Kamaz",   value: 14, color: "#22C55E" },
];

const SUMMARY = [
  { label: "Jami zakaz",    value: "235",    sub: "bu hafta",  color: "#FFD100" },
  { label: "Jami daromad",  value: "8.6M",   sub: "so'm",      color: "#22C55E" },
  { label: "O'rtacha narx", value: "36 600", sub: "so'm/zakaz",color: "#4F8EF7" },
  { label: "Eng faol kun",  value: "Shanba", sub: "52 zakaz",  color: "#A78BFA" },
];

const RANGES = ["Hafta", "Oy", "3 oy"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-white/15 rounded-xl px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-bold" style={{ color: p.color ?? "#FFD100" }}>
          {typeof p.value === "number" && p.value > 1000
            ? `${(p.value / 1000).toFixed(0)}K so'm`
            : p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminStatsPage() {
  const [range, setRange]   = useState("Hafta");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme }   = useTheme();
  useEffect(() => setMounted(true), []);

  const isDark      = !mounted || resolvedTheme === "dark";
  const axisColor   = isDark ? "rgba(255,255,255,0.3)"  : "rgba(0,0,0,0.4)";
  const gridColor   = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const cursorColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  function exportCsv() {
    const rows = [
      ["Kun", "Zakazlar", "Daromad"],
      ...ORDERS_DATA.map(d => [d.day, d.count, d.revenue]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "yotoq-stats.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900">Statistika</h1>
          <p className="dark:text-white/30 text-gray-500 text-sm">Platforma ko&apos;rsatkichlari</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 dark:bg-white/5 bg-gray-100 dark:border-white/10 border border-gray-200 rounded-xl p-1">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  range === r ? "bg-[#FFD100] text-black" : "dark:text-white/40 text-gray-500 hover:dark:text-white hover:text-gray-900"
                }`}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={exportCsv}
            className="flex items-center gap-2 dark:border-white/15 border-gray-200 border dark:text-white/50 text-gray-500 text-xs font-bold px-4 py-2 rounded-xl hover:dark:border-white/30 hover:border-gray-400 hover:dark:text-white hover:text-gray-900 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v7M3.5 5.5l3 3 3-3M1 10h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map((s) => (
          <div key={s.label} className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl p-5 shadow-sm hover:dark:border-white/20 hover:border-gray-300 transition-colors">
            <p className="dark:text-white/30 text-gray-400 text-xs mb-2">{s.label}</p>
            <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="dark:text-white/25 text-gray-400 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Zakazlar bar chart */}
      <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="dark:text-white text-gray-900 font-bold text-sm mb-5">Haftalik zakazlar</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ORDERS_DATA} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorColor }} />
            <Bar dataKey="count" fill="#FFD100" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daromad line chart */}
      <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="dark:text-white text-gray-900 font-bold text-sm mb-5">Oylik daromad</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={MONTHLY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="revenue"
              stroke="#22C55E" strokeWidth={2.5}
              dot={{ fill: "#22C55E", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#22C55E" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mashina turlari + jadval */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Donut */}
        <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="dark:text-white text-gray-900 font-bold text-sm mb-4">Mashina turlari</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={TRUCK_DATA} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {TRUCK_DATA.map((t, i) => (
                    <Cell key={i} fill={t.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {TRUCK_DATA.map((t) => (
                <div key={t.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="text-white/60 text-xs">{t.name}</span>
                  </div>
                  <span className="font-black text-sm" style={{ color: t.color }}>{t.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top haydovchilar */}
        <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="dark:text-white text-gray-900 font-bold text-sm mb-4">Top haydovchilar</h2>
          <div className="space-y-3">
            {[
              { name: "Jasur Toshmatov", orders: 342, earned: "12.4M" },
              { name: "Sanjar Mirzayev", orders: 276, earned: "9.8M"  },
              { name: "Bobur Aliyev",    orders: 198, earned: "7.1M"  },
              { name: "Akbar Nazarov",   orders: 45,  earned: "1.6M"  },
            ].map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-white/20 text-xs font-black w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{d.name}</p>
                  <p className="dark:text-white/25 text-gray-400 text-xs">{d.orders} zakaz</p>
                </div>
                <span className="text-[#FFD100] font-black text-sm flex-shrink-0">{d.earned}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
