"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface Order {
  id: string;
  from_address: string;
  to_address: string;
  status: string;
  price: number;
  vehicle_type: string;
  cargo_type: string;
  driver_id: string | null;
  client_id: string | null;
  created_at: string;
}

const STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Kutilmoqda", color: "#F59E0B" },
  accepted:  { label: "Qabul",      color: "#4F8EF7" },
  active:    { label: "Faol",       color: "#C8F135" },
  delivered: { label: "Yetkazildi", color: "#22C55E" },
  cancelled: { label: "Bekor",      color: "#EF4444" },
};

const FILTERS = ["Barchasi", "Kutilmoqda", "Faol", "Yetkazildi", "Bekor"];
const STATUS_KEYS: Record<string, string> = {
  "Kutilmoqda": "pending",
  "Faol":       "active",
  "Yetkazildi": "delivered",
  "Bekor":      "cancelled",
};

const card  = "dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl";
const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("Barchasi");
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  const filtered = orders.filter(o => {
    const matchFilter = filter === "Barchasi" || o.status === STATUS_KEYS[filter];
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      o.from_address.toLowerCase().includes(q) ||
      o.to_address.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${main}`}>Zakazlar</h1>
          <p className={`${muted} text-sm`}>{loading ? "Yuklanmoqda..." : `${orders.length} ta zakaz`}</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-500 text-xs font-bold">Jonli yangilanish</span>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? "bg-[#C8F135] text-black"
                  : `dark:bg-white/5 bg-gray-100 dark:border-white/10 border border-gray-200 ${muted} hover:dark:text-white hover:text-gray-900`
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className={`flex items-center gap-2 dark:bg-white/5 bg-gray-50 dark:border-white/10 border border-gray-200 rounded-xl px-3 py-2 ml-auto`}>
          <svg className={`${muted} flex-shrink-0`} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="ID yoki manzil..." value={search} onChange={e => setSearch(e.target.value)}
            className={`bg-transparent ${main} text-xs outline-none w-36`} />
        </div>
      </div>

      {/* Jadval */}
      <div className={`${card} overflow-hidden shadow-sm`}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#C8F135]/30 border-t-[#C8F135] rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="dark:border-b dark:border-white/8 border-b border-gray-100">
                {["Marshrut", "Mashina", "Yuk", "Narx", "Holat", "Sana"].map(h => (
                  <th key={h} className={`px-4 py-3 text-left dark:text-white/25 text-gray-400 text-xs font-bold uppercase tracking-wider first:pl-5 last:pr-5`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className={`px-5 py-10 text-center ${muted} text-sm`}>Hech narsa topilmadi</td></tr>
              ) : filtered.map((o, i) => {
                const s = STATUS[o.status] ?? { label: o.status, color: "#888" };
                return (
                  <tr key={o.id} className={`hover:dark:bg-white/[0.025] hover:bg-gray-50 transition-colors ${i < filtered.length - 1 ? "dark:border-b dark:border-white/5 border-b border-gray-100" : ""}`}>
                    <td className="pl-5 pr-4 py-3.5">
                      <p className={`${main} text-xs font-semibold truncate max-w-[150px]`}>{o.from_address}</p>
                      <p className={`${muted} text-xs truncate max-w-[150px]`}>→ {o.to_address}</p>
                    </td>
                    <td className={`px-4 py-3.5 ${muted} text-xs`}>{o.vehicle_type}</td>
                    <td className={`px-4 py-3.5 ${muted} text-xs`}>{o.cargo_type}</td>
                    <td className="px-4 py-3.5 text-[#C8F135] font-bold text-sm">{o.price.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: s.color, backgroundColor: s.color + "18" }}>
                        {s.label}
                      </span>
                    </td>
                    <td className={`px-4 pr-5 py-3.5 ${muted} text-xs whitespace-nowrap`}>
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
