"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface Order {
  id: string;
  from_address: string;
  to_address: string;
  status: string;
  price: number;
  vehicle_type: string;
  driver_id: string | null;
  created_at: string;
}

const STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Kutilmoqda", color: "#F59E0B" },
  accepted:  { label: "Qabul",      color: "#4F8EF7" },
  active:    { label: "Faol",       color: "#C8F135" },
  delivered: { label: "Yetkazildi", color: "#22C55E" },
  cancelled: { label: "Bekor",      color: "#EF4444" },
};

const card  = "dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl";
const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

export default function AdminDashboard() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("id, from_address, to_address, status, price, vehicle_type, driver_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setOrders(data);
    setLoading(false);
  }

  const today = new Date().toISOString().split("T")[0];

  const stats = {
    total:     orders.length,
    today:     orders.filter(o => o.created_at.startsWith(today)).length,
    delivered: orders.filter(o => o.status === "delivered").length,
    pending:   orders.filter(o => o.status === "pending").length,
  };

  const recent = orders.slice(0, 8);

  const KPI = [
    { label: "Jami zakazlar",    value: loading ? "—" : stats.total.toString(),     color: "#C8F135" },
    { label: "Bugungi zakazlar", value: loading ? "—" : stats.today.toString(),     color: "#4F8EF7" },
    { label: "Yetkazilgan",      value: loading ? "—" : stats.delivered.toString(), color: "#22C55E" },
    { label: "Kutilmoqda",       value: loading ? "—" : stats.pending.toString(),   color: "#F59E0B" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className={`text-2xl font-bold ${main} mb-0.5`}>Dashboard</h1>
        <p className={`${muted} text-sm`}>
          Bugun, {new Date().toLocaleDateString("uz-UZ", { day: "numeric", month: "long" })}
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map((k) => (
          <div key={k.label} className={`${card} p-5 hover:dark:border-white/20 hover:border-gray-300 transition-colors shadow-sm`}>
            <p className={`${muted} text-xs mb-3`}>{k.label}</p>
            <p className="font-bold text-3xl" style={{ color: k.color }}>
              {loading ? (
                <span className="inline-block w-8 h-7 dark:bg-white/5 bg-gray-100 rounded animate-pulse" />
              ) : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* So'nggi zakazlar */}
      <div className={`${card} overflow-hidden shadow-sm`}>
        <div className="flex items-center justify-between px-5 py-4 dark:border-b dark:border-white/8 border-b border-gray-100">
          <h2 className={`${main} font-semibold text-sm`}>So&apos;nggi zakazlar</h2>
          <Link href="/admin/orders" className="text-[#C8F135] text-xs font-bold hover:underline">
            Barchasi →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#C8F135]/30 border-t-[#C8F135] rounded-full animate-spin" />
          </div>
        ) : recent.length === 0 ? (
          <p className={`${muted} text-sm text-center py-10`}>Hozircha zakazlar yo&apos;q</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="dark:border-b dark:border-white/8 border-b border-gray-100">
                {["Marshrut", "Mashina", "Narx", "Holat", "Sana"].map(h => (
                  <th key={h} className={`px-5 py-3 text-left dark:text-white/25 text-gray-400 text-xs font-bold uppercase tracking-wider`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((o, i) => {
                const s = STATUS[o.status] ?? { label: o.status, color: "#888" };
                return (
                  <tr key={o.id} className={`hover:dark:bg-white/[0.02] hover:bg-gray-50 transition-colors ${i < recent.length - 1 ? "dark:border-b dark:border-white/5 border-b border-gray-100" : ""}`}>
                    <td className="px-5 py-3.5">
                      <p className={`${main} text-xs font-semibold truncate max-w-[160px]`}>{o.from_address}</p>
                      <p className={`${muted} text-xs truncate max-w-[160px]`}>→ {o.to_address}</p>
                    </td>
                    <td className={`px-5 py-3.5 ${muted} text-xs`}>{o.vehicle_type}</td>
                    <td className="px-5 py-3.5 text-[#C8F135] font-bold text-sm">{o.price.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: s.color, backgroundColor: s.color + "18" }}>
                        {s.label}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 ${muted} text-xs whitespace-nowrap`}>
                      {new Date(o.created_at).toLocaleString("uz-UZ", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
