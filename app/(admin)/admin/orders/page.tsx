"use client";

import { useState } from "react";

const ALL_ORDERS = [
  { id:"ORD-4821", from:"Chilonzor, 9-mavze",   to:"Yunusobod, 19-mavze",  status:"active",    price:37000, truck:"Gazelle", driver:"Jasur T.",  date:"Bugun 14:32" },
  { id:"ORD-4820", from:"Sergeli, 17-mavze",    to:"Mirzo Ulugbek, 4-m",   status:"delivered", price:58000, truck:"O'rta",   driver:"Bobur A.",  date:"Bugun 12:10" },
  { id:"ORD-4819", from:"Olmazor, 8-mavze",     to:"Shayxontohur",         status:"pending",   price:32000, truck:"Gazelle", driver:"—",         date:"Bugun 11:45" },
  { id:"ORD-4818", from:"Bektemir",             to:"Uchtepa, 5-mavze",     status:"delivered", price:72000, truck:"Kamaz",   driver:"Sanjar M.", date:"Kecha 18:20" },
  { id:"ORD-4817", from:"Yunusobod, 7-mavze",   to:"Sergeli, 14-mavze",    status:"delivered", price:41000, truck:"Gazelle", driver:"Jasur T.",  date:"Kecha 15:00" },
  { id:"ORD-4816", from:"Mirzo Ulugbek",        to:"Chilonzor, 4-mavze",   status:"cancelled", price:28000, truck:"Gazelle", driver:"—",         date:"Kecha 10:30" },
  { id:"ORD-4815", from:"Uchtepa, 3-mavze",     to:"Bektemir",             status:"delivered", price:55000, truck:"O'rta",   driver:"Bobur A.",  date:"2 kun oldin" },
];

const STATUS: Record<string, { label: string; color: string }> = {
  active:    { label: "Faol",       color: "#C8F135" },
  delivered: { label: "Yetkazildi", color: "#22C55E" },
  pending:   { label: "Kutilmoqda", color: "#F59E0B" },
  cancelled: { label: "Bekor",      color: "#EF4444" },
};

const FILTERS = ["Barchasi", "Faol", "Kutilmoqda", "Yetkazildi", "Bekor"];

const card  = "dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl";
const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState("Barchasi");
  const [search, setSearch] = useState("");

  const filtered = ALL_ORDERS.filter(o => {
    const matchFilter =
      filter === "Barchasi" ||
      (filter === "Faol"       && o.status === "active")    ||
      (filter === "Kutilmoqda" && o.status === "pending")   ||
      (filter === "Yetkazildi" && o.status === "delivered") ||
      (filter === "Bekor"      && o.status === "cancelled");
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.from.toLowerCase().includes(search.toLowerCase()) ||
      o.to.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${main}`}>Zakazlar</h1>
          <p className={`${muted} text-sm`}>{ALL_ORDERS.length} ta zakaz</p>
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
            className={`bg-transparent ${main} text-xs outline-none placeholder:${muted} w-36`} />
        </div>
      </div>

      {/* Jadval */}
      <div className={`${card} overflow-hidden shadow-sm`}>
        <table className="w-full">
          <thead>
            <tr className="dark:border-b dark:border-white/8 border-b border-gray-100">
              {["ID", "Marshrut", "Mashina", "Haydovchi", "Narx", "Holat", "Sana"].map(h => (
                <th key={h} className={`px-4 py-3 text-left dark:text-white/25 text-gray-400 text-xs font-bold uppercase tracking-wider first:pl-5 last:pr-5`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className={`px-5 py-10 text-center ${muted} text-sm`}>Hech narsa topilmadi</td></tr>
            ) : filtered.map((o, i) => {
              const s = STATUS[o.status];
              return (
                <tr key={o.id} className={`hover:dark:bg-white/[0.025] hover:bg-gray-50 transition-colors ${i < filtered.length - 1 ? "dark:border-b dark:border-white/5 border-b border-gray-100" : ""}`}>
                  <td className={`pl-5 pr-4 py-3.5 ${muted} text-xs font-bold`}>{o.id}</td>
                  <td className="px-4 py-3.5">
                    <p className={`${main} text-xs font-semibold truncate max-w-[140px]`}>{o.from}</p>
                    <p className={`${muted} text-xs truncate max-w-[140px]`}>→ {o.to}</p>
                  </td>
                  <td className={`px-4 py-3.5 ${muted} text-xs`}>{o.truck}</td>
                  <td className={`px-4 py-3.5 ${muted} text-xs`}>{o.driver}</td>
                  <td className="px-4 py-3.5 text-[#C8F135] font-bold text-sm">{o.price.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: s.color, backgroundColor: s.color + "18" }}>
                      {s.label}
                    </span>
                  </td>
                  <td className={`px-4 pr-5 py-3.5 ${muted} text-xs whitespace-nowrap`}>{o.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
