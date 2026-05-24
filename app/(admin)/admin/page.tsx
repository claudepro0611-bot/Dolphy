const KPI = [
  { label: "Bugungi zakazlar", value: "34",    sub: "+8 kechadan", color: "#FFD100" },
  { label: "Bugungi daromad",  value: "1.24M", sub: "so'm",        color: "#22C55E" },
  { label: "Faol haydovchi",   value: "18",    sub: "12 ta online", color: "#4F8EF7" },
  { label: "Kutilayotgan",     value: "5",     sub: "zakaz",        color: "#F59E0B" },
];

const RECENT = [
  { id: "ORD-4821", from: "Chilonzor", to: "Yunusobod",   status: "active",    price: 37000, driver: "Jasur T." },
  { id: "ORD-4820", from: "Sergeli",   to: "Mirzo Ulug.", status: "delivered", price: 58000, driver: "Bobur A." },
  { id: "ORD-4819", from: "Olmazor",   to: "Shayxontoh.", status: "pending",   price: 32000, driver: "—" },
  { id: "ORD-4818", from: "Bektemir",  to: "Uchtepa",     status: "delivered", price: 72000, driver: "Sanjar M." },
  { id: "ORD-4817", from: "Yunusobod", to: "Sergeli",     status: "delivered", price: 41000, driver: "Jasur T." },
];

const STATUS: Record<string, { label: string; color: string }> = {
  active:    { label: "Faol",       color: "#FFD100" },
  delivered: { label: "Yetkazildi", color: "#22C55E" },
  pending:   { label: "Kutilmoqda", color: "#F59E0B" },
  cancelled: { label: "Bekor",      color: "#EF4444" },
};

const card  = "dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl";
const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

export default function AdminDashboard() {
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
            <p className="font-bold text-3xl" style={{ color: k.color }}>{k.value}</p>
            <p className={`${muted} text-xs mt-1`}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Jadval */}
      <div className={`${card} overflow-hidden shadow-sm`}>
        <div className={`flex items-center justify-between px-5 py-4 dark:border-b dark:border-white/8 border-b border-gray-100`}>
          <h2 className={`${main} font-semibold text-sm`}>So&apos;nggi zakazlar</h2>
          <a href="/admin/orders" className="text-[#FFD100] text-xs font-bold hover:underline">Barchasi →</a>
        </div>
        <table className="w-full">
          <thead>
            <tr className="dark:border-b dark:border-white/8 border-b border-gray-100">
              {["ID", "Marshrut", "Haydovchi", "Narx", "Holat"].map(h => (
                <th key={h} className={`px-5 py-3 text-left dark:text-white/25 text-gray-400 text-xs font-bold uppercase tracking-wider`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT.map((o, i) => {
              const s = STATUS[o.status];
              return (
                <tr key={o.id} className={`hover:dark:bg-white/[0.02] hover:bg-gray-50 transition-colors ${i < RECENT.length - 1 ? "dark:border-b dark:border-white/5 border-b border-gray-100" : ""}`}>
                  <td className={`px-5 py-3.5 ${muted} text-xs font-bold`}>{o.id}</td>
                  <td className="px-5 py-3.5">
                    <p className={`${main} text-sm font-semibold`}>{o.from}</p>
                    <p className={`${muted} text-xs`}>→ {o.to}</p>
                  </td>
                  <td className={`px-5 py-3.5 ${muted} text-sm`}>{o.driver}</td>
                  <td className="px-5 py-3.5 text-[#FFD100] font-bold text-sm">{o.price.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.color + "18" }}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
