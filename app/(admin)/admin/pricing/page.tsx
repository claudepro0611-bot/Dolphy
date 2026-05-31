"use client";

import { useState, useEffect } from "react";

interface TruckPrice {
  id: string;
  name: string;
  cap: string;
  base: number;
  perKm: number;
}

const DEFAULTS: TruckPrice[] = [
  { id: "gazelle", name: "Gazelle", cap: "1.5 t", base: 25000, perKm: 1500 },
  { id: "medium",  name: "O'rta",   cap: "5 t",   base: 45000, perKm: 2500 },
  { id: "kamaz",   name: "Kamaz",   cap: "10 t",  base: 75000, perKm: 4000 },
];

const card  = "dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl";
const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";
const inp   = "w-full h-11 dark:bg-white/5 bg-gray-50 dark:border-white/10 border border-gray-200 focus:dark:border-[#C8F135]/50 focus:border-[#C8F135] rounded-xl px-4 dark:text-white text-gray-900 font-bold text-sm outline-none transition-colors";

export default function AdminPricingPage() {
  const [prices,  setPrices]  = useState<TruckPrice[]>(DEFAULTS);
  const [demoKm,  setDemoKm]  = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState<"idle" | "ok" | "err">("idle");

  useEffect(() => {
    fetch("/api/v1/pricing")
      .then(r => r.json())
      .then(d => { if (d.pricing) setPrices(d.pricing); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function update(id: string, field: "base" | "perKm", val: number) {
    setPrices(p => p.map(t => t.id === id ? { ...t, [field]: val } : t));
    setStatus("idle");
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing: prices }),
      });
      setStatus(res.ok ? "ok" : "err");
    } catch {
      setStatus("err");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${main}`}>Narxlar</h1>
          <p className={`${muted} text-sm`}>Har bir mashina uchun bazaviy narx va km narxi</p>
        </div>
        <button onClick={save} disabled={saving || loading}
          className={`font-bold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 ${
            status === "ok"  ? "bg-green-500 text-white" :
            status === "err" ? "bg-red-500 text-white"   :
            "bg-[#C8F135] text-black hover:bg-[#b3d92f]"
          }`}>
          {saving ? "Saqlanmoqda..." : status === "ok" ? "✓ Saqlandi" : status === "err" ? "Xato!" : "Saqlash"}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className={`${card} h-40 animate-pulse`} />)}
        </div>
      ) : (
        prices.map(t => (
          <div key={t.id} className={`${card} p-5 space-y-4 shadow-sm`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#C8F135]/10 border border-[#C8F135]/20 flex items-center justify-center">
                <span className="text-[#C8F135] font-bold text-xs">{t.cap}</span>
              </div>
              <div className="flex-1">
                <p className={`${main} font-bold`}>{t.name}</p>
                <p className={`${muted} text-xs`}>{t.cap}</p>
              </div>
              <div className="text-right">
                <p className={`${muted} text-xs`}>Demo ({demoKm} km)</p>
                <p className="text-[#C8F135] font-bold text-lg">{(t.base + demoKm * t.perKm).toLocaleString()} so&apos;m</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`${muted} text-xs font-bold uppercase tracking-wider mb-2 block`}>Bazaviy narx (so&apos;m)</label>
                <input type="number" value={t.base} onChange={e => update(t.id, "base", +e.target.value)} className={inp} />
                <input type="range" min={10000} max={200000} step={5000} value={t.base}
                  onChange={e => update(t.id, "base", +e.target.value)} className="w-full mt-2 accent-[#C8F135]" />
              </div>
              <div>
                <label className={`${muted} text-xs font-bold uppercase tracking-wider mb-2 block`}>Km narxi (so&apos;m)</label>
                <input type="number" value={t.perKm} onChange={e => update(t.id, "perKm", +e.target.value)} className={inp} />
                <input type="range" min={500} max={10000} step={500} value={t.perKm}
                  onChange={e => update(t.id, "perKm", +e.target.value)} className="w-full mt-2 accent-[#C8F135]" />
              </div>
            </div>
          </div>
        ))
      )}

      {/* Demo */}
      <div className={`${card} p-5 shadow-sm`}>
        <label className={`${muted} text-xs font-bold uppercase tracking-wider mb-3 block`}>
          Demo masofa: {demoKm} km
        </label>
        <input type="range" min={1} max={50} step={1} value={demoKm}
          onChange={e => setDemoKm(+e.target.value)} className="w-full accent-[#C8F135]" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {prices.map(t => (
            <div key={t.id} className="text-center dark:border-white/8 border border-gray-100 rounded-xl py-3">
              <p className={`${muted} text-xs mb-1`}>{t.name}</p>
              <p className="text-[#C8F135] font-bold">{(t.base + demoKm * t.perKm).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
