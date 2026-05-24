"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useLang } from "@/components/Providers";
import type { LatLng } from "@/components/MapOrderClient";

const MapOrderClient = dynamic(() => import("@/components/MapOrderClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#FFD100]/30 border-t-[#FFD100] rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Xarita yuklanmoqda...</p>
      </div>
    </div>
  ),
});

const TRUCK_ICONS: Record<string, React.ReactNode> = {
  gazelle: (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <rect x="1" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M14 7h3.5l1.5 3v2H14V7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="4.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="15.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  medium: (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <rect x="1" y="3" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M12 6h4l2 3.5V13h-6V6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="4" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="15" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  kamaz: (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <rect x="1" y="2" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M14 4h5l2 4v4h-7V4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="4.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="11" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="17.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
};

const TRUCKS = [
  { id: "gazelle", name: "Gazelle", cap: "1.5 t", base: 25000, perKm: 1500 },
  { id: "medium",  name: "O'rta",   cap: "5 t",   base: 45000, perKm: 2500 },
  { id: "kamaz",   name: "Kamaz",   cap: "10 t",  base: 75000, perKm: 4000 },
];

type Truck = "gazelle" | "medium" | "kamaz";
type ActivePin = "from" | "to" | null;

interface NResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
}

function shortName(r: NResult) {
  const a = r.address ?? {};
  const parts = [a.road, a.suburb, a.city_district, a.city].filter(Boolean);
  return parts.slice(0, 2).join(", ") || r.display_name.split(",")[0];
}

function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const sin2 = Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(sin2));
}

// Nominatim search (debounced via ref)
async function nominatimSearch(q: string): Promise<NResult[]> {
  if (q.trim().length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=uz&limit=6&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "uz,ru" } });
  return res.json();
}

// --- Address search box component ---
function SearchBox({
  value, onChange, onSelect, onClear, placeholder, pinColor,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (pos: LatLng, addr: string) => void;
  onClear: () => void;
  placeholder: string;
  pinColor: "green" | "red";
}) {
  const [results, setResults] = useState<NResult[]>([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  function calcDropStyle() {
    if (!wrapperRef.current) return;
    const r = wrapperRef.current.getBoundingClientRect();
    setDropStyle({
      position: "fixed",
      top: r.bottom + 6,
      left: r.left,
      width: r.width,
      zIndex: 99999,
    });
  }

  function handleChange(v: string) {
    onChange(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (v.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const res = await nominatimSearch(v).catch(() => []);
      setResults(res);
      setLoading(false);
    }, 380);
  }

  function select(r: NResult) {
    const pos: LatLng = [parseFloat(r.lat), parseFloat(r.lon)];
    const name = shortName(r);
    onSelect(pos, name);
    onChange(name);
    setResults([]);
    setFocused(false);
  }

  const dot = pinColor === "green"
    ? "bg-green-400 shadow-[0_0_8px_#4ade80]"
    : "bg-red-400 shadow-[0_0_8px_#f87171]";

  const showDropdown = focused && (results.length > 0 || loading);

  return (
    <div ref={wrapperRef} className="relative">
      <div className={`flex items-center gap-3 rounded-xl px-3 py-3 border transition-all ${
        focused ? "border-white/25 bg-white/8" : "border-white/8 bg-white/5 hover:border-white/15"
      }`}>
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
        <input
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => { calcDropStyle(); setFocused(true); }}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none min-w-0"
        />
        {value ? (
          <button onClick={() => { onClear(); onChange(""); setResults([]); }}
            className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 text-lg leading-none">
            ✕
          </button>
        ) : loading ? (
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
        ) : null}
      </div>

      {/* Portal: document.body ga render — backdrop-blur containing block'dan chiqadi */}
      {showDropdown && createPortal(
        <div style={dropStyle} className="bg-[#111] border border-white/15 rounded-xl overflow-hidden shadow-2xl">
          {loading && results.length === 0 ? (
            <div className="px-4 py-3 flex items-center gap-2 text-white/30 text-xs">
              <div className="w-3 h-3 border border-white/20 border-t-white/50 rounded-full animate-spin" />
              Qidirilmoqda...
            </div>
          ) : results.map(r => (
            <button key={r.place_id} onMouseDown={() => select(r)}
              className="w-full text-left px-4 py-2.5 hover:bg-white/8 transition-colors border-b border-white/5 last:border-0 flex items-start gap-3 group">
              <svg className="w-3 h-3 mt-0.5 text-white/25 group-hover:text-[#FFD100] transition-colors flex-shrink-0" viewBox="0 0 12 16" fill="currentColor">
                <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11C11 2.24 8.76 0 6 0zm0 7.5A2.5 2.5 0 1 1 6 2.5a2.5 2.5 0 0 1 0 5z"/>
              </svg>
              <span className="text-white/70 text-xs leading-relaxed group-hover:text-white transition-colors line-clamp-1">
                {shortName(r)}
              </span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ---

export default function NewOrderPage() {
  const router = useRouter();
  const { tr } = useLang();

  const [userPos,   setUserPos]   = useState<LatLng | null>(null);
  const [fromPos,   setFromPos]   = useState<LatLng | null>(null);
  const [toPos,     setToPos]     = useState<LatLng | null>(null);
  const [fromAddr,  setFromAddr]  = useState("");
  const [toAddr,    setToAddr]    = useState("");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery,   setToQuery]   = useState("");
  const [truck,     setTruck]     = useState<Truck>("gazelle");
  const [activePin, setActivePin] = useState<ActivePin>(null);
  const [loading,   setLoading]   = useState(false);
  const [locating,  setLocating]  = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);

  // GPS auto-detect
  useEffect(() => {
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latlng: LatLng = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(latlng);
        setFromPos(latlng);
        setLocating(false);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng[0]}&lon=${latlng[1]}&addressdetails=1`,
            { headers: { "Accept-Language": "uz,ru" } }
          );
          const d = await res.json();
          const a = d.address ?? {};
          const parts = [a.road, a.suburb, a.city_district].filter(Boolean);
          const name = parts.slice(0, 2).join(", ") || "Joriy manzil";
          setFromAddr(name);
          setFromQuery(name);
        } catch {
          setFromAddr("Joriy manzil");
          setFromQuery("Joriy manzil");
        }
      },
      () => {
        setLocating(false);
        const tashkent: LatLng = [41.2995, 69.2401];
        setFromPos(tashkent);
        setFromAddr("Toshkent markazi");
        setFromQuery("Toshkent markazi");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleFromChange = useCallback((pos: LatLng, addr: string) => {
    setFromPos(pos);
    setFromAddr(addr);
    setFromQuery(addr);
    setActivePin(null);
  }, []);

  const handleToChange = useCallback((pos: LatLng, addr: string) => {
    setToPos(pos);
    setToAddr(addr);
    setToQuery(addr);
    setActivePin(null);
  }, []);

  const km = fromPos && toPos ? haversineKm(fromPos, toPos) : null;
  const truckData = TRUCKS.find(t => t.id === truck)!;
  const price = km ? Math.round(truckData.base + km * truckData.perKm) : null;
  const canSubmit = !!fromAddr && !!toAddr && !loading;

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    router.push(`/order/ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-900">

      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapOrderClient
          fromPos={fromPos}
          toPos={toPos}
          userPos={userPos}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
          activePin={activePin}
        />
      </div>

      {/* GPS indicator */}
      {locating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-white text-xs font-medium">GPS aniqlanmoqda...</span>
        </div>
      )}

      {/* Mobile toggle */}
      <button onClick={() => setPanelOpen(p => !p)}
        className="absolute bottom-4 right-4 z-[1100] w-12 h-12 bg-[#FFD100] rounded-2xl shadow-lg flex items-center justify-center md:hidden">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d={panelOpen ? "M4 12l6-6 6 6" : "M4 8l6 6 6-6"} stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Floating panel */}
      <div className={`absolute left-4 top-4 bottom-4 z-[1000] w-[340px] flex flex-col gap-3 overflow-y-auto overflow-x-visible transition-transform duration-300 scrollbar-none ${panelOpen ? "translate-x-0" : "-translate-x-[360px]"}`}>

        {/* --- Marshrut (search inputs) --- */}
        <div className="bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Marshrut</p>

          <SearchBox
            value={fromQuery}
            onChange={setFromQuery}
            onSelect={handleFromChange}
            onClear={() => { setFromPos(null); setFromAddr(""); }}
            placeholder="Ketish manzili..."
            pinColor="green"
          />

          {/* Swap button */}
          <div className="flex items-center gap-2 my-2 px-1">
            <div className="flex-1 border-t border-dashed border-white/8" />
            <button
              onClick={() => {
                const pp = fromPos; const aa = fromAddr; const qq = fromQuery;
                setFromPos(toPos); setFromAddr(toAddr); setFromQuery(toQuery);
                setToPos(pp); setToAddr(aa); setToQuery(qq);
              }}
              className="w-6 h-6 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-colors"
              title="Almashtirish"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4h8M8 2l2 2-2 2M10 8H2M4 6l-2 2 2 2" stroke="white" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex-1 border-t border-dashed border-white/8" />
          </div>

          <SearchBox
            value={toQuery}
            onChange={setToQuery}
            onSelect={handleToChange}
            onClear={() => { setToPos(null); setToAddr(""); }}
            placeholder="Borish manzili..."
            pinColor="red"
          />

          {/* Yoki xaritada bosing hint */}
          <p className="text-white/20 text-[10px] text-center mt-2.5">
            yoki xaritada markerni sudrang
          </p>

          {km && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-white/35 text-xs">{km.toFixed(1)} km</span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
            </div>
          )}
        </div>

        {/* --- Mashina --- */}
        <div className="bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Mashina</p>
          <div className="flex flex-col gap-2">
            {TRUCKS.map(t => (
              <button key={t.id} onClick={() => setTruck(t.id as Truck)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  truck === t.id
                    ? "border-[#FFD100]/50 bg-[#FFD100]/8"
                    : "border-white/8 bg-white/[0.03] hover:bg-white/6 hover:border-white/15"
                }`}>
                <span className={`flex-shrink-0 ${truck === t.id ? "text-[#FFD100]" : "text-white/30"}`}>
                  {TRUCK_ICONS[t.id]}
                </span>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-bold ${truck === t.id ? "text-[#FFD100]" : "text-white"}`}>{t.name}</p>
                  <p className="text-white/30 text-xs">{t.cap}</p>
                </div>
                {km && (
                  <span className={`text-sm font-bold ${truck === t.id ? "text-[#FFD100]" : "text-white/40"}`}>
                    {Math.round(t.base + km * t.perKm).toLocaleString()}
                  </span>
                )}
                {truck === t.id && (
                  <div className="w-4 h-4 rounded-full bg-[#FFD100] flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4l2 2 3-3" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* --- Narx + Zakaz --- */}
        <div className="bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Taxminiy narx</p>
              {price ? (
                <p className="text-[#FFD100] font-black text-3xl leading-none">
                  {price.toLocaleString()}
                  <span className="text-base font-semibold text-white/40 ml-1.5">so'm</span>
                </p>
              ) : (
                <p className="text-white/25 text-lg font-bold">Manzil tanlang</p>
              )}
            </div>
            {km && (
              <div className="text-right">
                <p className="text-white/25 text-xs">{km.toFixed(1)} km</p>
                <p className="text-white/25 text-xs">{truckData.perKm.toLocaleString()} so'm/km</p>
              </div>
            )}
          </div>

          <button onClick={submit} disabled={!canSubmit}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              canSubmit
                ? "bg-[#FFD100] text-black hover:bg-[#E6BC00] shadow-[0_4px_20px_rgba(255,209,0,0.3)] active:scale-[0.98]"
                : "bg-white/8 text-white/25 cursor-not-allowed"
            }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                </svg>
                Yuborilmoqda...
              </span>
            ) : canSubmit ? "Zakaz berish →" : "Manzillarni kiriting"}
          </button>

          <p className="text-white/20 text-xs text-center mt-2">To'lov yetkazib bergandan so'ng</p>
        </div>

      </div>
    </div>
  );
}
