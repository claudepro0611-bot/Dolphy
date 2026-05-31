"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase/client";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Order {
  id: string;
  status: string;
  price: number;
  vehicle_type: string;
  driver_id: string | null;
  created_at: string;
}

interface DriverUser {
  id: string;
  full_name?: string;
  phone?: string;
}

const DAYS_UZ    = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
const MONTHS_UZ  = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
const TRUCK_NAMES: Record<string, string>  = { gazelle: "Gazelle", medium: "O'rta", kamaz: "Kamaz" };
const TRUCK_COLORS: Record<string, string> = { gazelle: "#C8F135", medium: "#4F8EF7", kamaz: "#22C55E" };
const RANGES = ["Hafta", "Oy", "3 oy"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-white/15 rounded-xl px-3 py-2 text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-bold" style={{ color: p.color ?? "#C8F135" }}>
          {typeof p.value === "number" && p.value > 10000
            ? `${(p.value / 1_000_000).toFixed(1)}M so'm`
            : p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminStatsPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [range,   setRange]   = useState("Hafta");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme }     = useTheme();

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  async function fetchData() {
    const since = new Date();
    since.setMonth(since.getMonth() - 6);

    const [{ data: ordersData }, { data: usersData }] = await Promise.all([
      supabase
        .from("orders")
        .select("id, status, price, vehicle_type, driver_id, created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("users")
        .select("id, full_name, phone")
        .eq("role", "driver"),
    ]);

    if (ordersData) setOrders(ordersData);
    if (usersData)  setDrivers(usersData);
    setLoading(false);
  }

  const isDark      = !mounted || resolvedTheme === "dark";
  const axisColor   = isDark ? "rgba(255,255,255,0.3)"  : "rgba(0,0,0,0.4)";
  const gridColor   = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const cursorColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  // Last 7 days
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr));
    return {
      day:     DAYS_UZ[d.getDay()],
      count:   dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + (o.price || 0), 0),
    };
  });

  // Last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthOrders = orders.filter(o => {
      const od = new Date(o.created_at);
      return od.getFullYear() === year && od.getMonth() === month;
    });
    return {
      month:   MONTHS_UZ[month],
      revenue: monthOrders.reduce((s, o) => s + (o.price || 0), 0),
    };
  });

  // Vehicle type distribution
  const vehicleMap: Record<string, number> = {};
  orders.forEach(o => {
    const v = o.vehicle_type || "other";
    vehicleMap[v] = (vehicleMap[v] || 0) + 1;
  });
  const total    = orders.length || 1;
  const truckData = Object.entries(vehicleMap).map(([key, count]) => ({
    name:  TRUCK_NAMES[key] ?? key,
    value: Math.round((count / total) * 100),
    color: TRUCK_COLORS[key] ?? "#A78BFA",
  }));

  // Top drivers
  const driverMap:      Record<string, number> = {};
  const driverEarnings: Record<string, number> = {};
  orders.forEach(o => {
    if (o.driver_id) {
      driverMap[o.driver_id]      = (driverMap[o.driver_id]     || 0) + 1;
      driverEarnings[o.driver_id] = (driverEarnings[o.driver_id] || 0) + (o.price || 0);
    }
  });
  const topDrivers = Object.entries(driverMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, count]) => {
      const user   = drivers.find(u => u.id === id);
      const name   = user?.full_name || user?.phone || id.slice(0, 8);
      const earned = driverEarnings[id] || 0;
      return {
        name,
        orders: count,
        earned: earned >= 1_000_000 ? `${(earned / 1_000_000).toFixed(1)}M` : `${(earned / 1000).toFixed(0)}K`,
      };
    });

  const delivered    = orders.filter(o => o.status === "delivered");
  const totalRevenue = delivered.reduce((s, o) => s + (o.price || 0), 0);
  const avgPrice     = delivered.length ? Math.round(totalRevenue / delivered.length) : 0;
  const bestDay      = weeklyData.reduce((b, d) => d.count > b.count ? d : b, { day: "—", count: 0 });

  const SUMMARY = [
    { label: "Jami zakaz",    value: orders.length.toString(),                          sub: "6 oyda",       color: "#C8F135" },
    { label: "Jami daromad",  value: `${(totalRevenue / 1_000_000).toFixed(1)}M`,       sub: "so'm",         color: "#22C55E" },
    { label: "O'rtacha narx", value: avgPrice.toLocaleString(),                          sub: "so'm/zakaz",   color: "#4F8EF7" },
    { label: "Eng faol kun",  value: bestDay.day,                                        sub: `${bestDay.count} zakaz`, color: "#A78BFA" },
  ];

  function exportCsv() {
    const rows = [["Kun", "Zakazlar", "Daromad"], ...weeklyData.map(d => [d.day, d.count, d.revenue])];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "dolphy-stats.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const Skeleton = () => (
    <div className="h-[200px] dark:bg-white/[0.02] bg-gray-50 rounded-xl animate-pulse" />
  );

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
                  range === r ? "bg-[#C8F135] text-black" : "dark:text-white/40 text-gray-500 hover:dark:text-white hover:text-gray-900"
                }`}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={exportCsv}
            className="flex items-center gap-2 dark:border-white/15 border-gray-200 border dark:text-white/50 text-gray-500 text-xs font-bold px-4 py-2 rounded-xl hover:dark:border-white/30 hover:border-gray-400 hover:dark:text-white hover:text-gray-900 transition-all">
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
            {loading ? (
              <div className="h-8 w-16 dark:bg-white/5 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
            )}
            <p className="dark:text-white/25 text-gray-400 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="dark:text-white text-gray-900 font-bold text-sm mb-5">Haftalik zakazlar</h2>
        {loading ? <Skeleton /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorColor }} />
              <Bar dataKey="count" fill="#C8F135" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Line chart */}
      <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="dark:text-white text-gray-900 font-bold text-sm mb-5">Oylik daromad</h2>
        {loading ? <Skeleton /> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5}
                dot={{ fill: "#22C55E", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#22C55E" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Donut + Top drivers */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="dark:text-white text-gray-900 font-bold text-sm mb-4">Mashina turlari</h2>
          {loading ? (
            <div className="h-[130px] dark:bg-white/[0.02] bg-gray-50 rounded-xl animate-pulse" />
          ) : truckData.length === 0 ? (
            <p className="dark:text-white/30 text-gray-400 text-sm text-center py-10">Ma&apos;lumot yo&apos;q</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={truckData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {truckData.map((t, i) => <Cell key={i} fill={t.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {truckData.map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="dark:text-white/60 text-gray-500 text-xs">{t.name}</span>
                    </div>
                    <span className="font-black text-sm" style={{ color: t.color }}>{t.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="dark:text-white text-gray-900 font-bold text-sm mb-4">Top haydovchilar</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 dark:bg-white/[0.02] bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : topDrivers.length === 0 ? (
            <p className="dark:text-white/30 text-gray-400 text-sm text-center py-10">Haydovchi yo&apos;q</p>
          ) : (
            <div className="space-y-3">
              {topDrivers.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="dark:text-white/20 text-gray-300 text-xs font-black w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="dark:text-white text-gray-900 text-xs font-semibold truncate">{d.name}</p>
                    <p className="dark:text-white/25 text-gray-400 text-xs">{d.orders} zakaz</p>
                  </div>
                  <span className="text-[#C8F135] font-black text-sm flex-shrink-0">{d.earned}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
