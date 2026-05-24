"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLang } from "@/components/Providers";
import type { LatLng } from "@/components/TrackingMapClient";

const TrackingMapClient = dynamic(() => import("@/components/TrackingMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center dark:bg-[#0a0a0a] bg-gray-100 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#FFD100]/30 border-t-[#FFD100] rounded-full animate-spin" />
        <p className="dark:text-white/30 text-gray-400 text-xs">Xarita yuklanmoqda...</p>
      </div>
    </div>
  ),
});

const STATUSES_KEYS = ["pending", "accepted", "picked", "delivered"];

// Toshkent haqiqiy koordinatalari
const FROM_POS: LatLng = [41.2890, 69.2032]; // Chilonzor
const TO_POS:   LatLng = [41.3550, 69.2951]; // Yunusobod

const MOCK = {
  id: "ORD-4821",
  from: "Chilonzor, 9-mavze, 47-uy",
  to:   "Yunusobod, 19-mavze, 12-uy",
  truck: "Gazelle", cargo: "Mebel — 120 kg", price: 37000,
  driver: { name: "Jasur Toshmatov", phone: "+998 90 123 45 67", rating: 4.9, trips: 342, car: "Nexia 3 · 01A123BC" },
};

const card  = "dark:bg-white/[0.03] bg-gray-50 dark:border-white/10 border border-gray-200 rounded-2xl";
const muted = "dark:text-white/40 text-gray-500";
const main  = "dark:text-white text-gray-900";

// progress 0→1 bo'yicha haydovchi koordinatasi
function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
}

export default function OrderTrackingPage() {
  const { tr } = useLang();
  const [idx,       setIdx]       = useState(0);
  const [eta,       setEta]       = useState(18);
  const [progress,  setProgress]  = useState(0.08); // 0–1
  const [cancelled, setCancelled] = useState(false);
  const [confirm,   setConfirm]   = useState(false);

  // Status va haydovchi pozitsiyasini avtomatik oldinga siljitish
  useEffect(() => {
    if (idx >= 3) return;
    const t = setInterval(() => {
      setIdx(i => {
        const next = Math.min(i + 1, 3);
        return next;
      });
      setEta(e => Math.max(0, e - 5));
      setProgress(p => Math.min(p + 0.28, 0.97));
    }, 4000);
    return () => clearInterval(t);
  }, [idx]);

  // Smooth driver movement (har 800ms biroz siljiydi)
  useEffect(() => {
    if (idx >= 3) return;
    const t = setInterval(() => {
      setProgress(p => Math.min(p + 0.018, 0.97));
    }, 800);
    return () => clearInterval(t);
  }, [idx]);

  const driverPos = useMemo(() => lerp(FROM_POS, TO_POS, progress), [progress]);
  const STATUSES  = STATUSES_KEYS.map(k => ({ key: k, label: tr(k) }));
  const cur       = STATUSES[idx];

  if (cancelled) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className={`text-2xl font-bold ${main} mb-2`}>{tr("cancelled")}</h2>
      <p className={`${muted} text-sm mb-8`}>Haydovchiga xabar yuborildi.</p>
      <Link href="/order/new" className="bg-[#FFD100] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#E6BC00] transition-all">
        {tr("newOrder")} →
      </Link>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-1">Zakaz kuzatish</p>
          <h1 className={`text-3xl font-bold ${main}`}>{MOCK.id}</h1>
        </div>
        <div className="flex items-center gap-3">
          {idx < 3 && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-500 text-sm font-bold">Jonli kuzatuv</span>
            </div>
          )}
          <Link href="/orders" className={`border dark:border-white/15 border-gray-300 ${muted} text-sm font-semibold px-4 py-2 rounded-xl hover:dark:border-white/30 hover:border-gray-400 transition-all`}>
            ← {tr("history")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* CHAP — Real xarita + status */}
        <div className="col-span-2 space-y-4">

          {/* Real Leaflet xarita */}
          <div className="relative rounded-2xl overflow-hidden dark:border-white/10 border border-gray-200 shadow-sm" style={{ height: 380 }}>
            <TrackingMapClient
              from={FROM_POS}
              to={TO_POS}
              driverPos={driverPos}
              progress={progress}
            />

            {/* ETA overlay */}
            {idx < 3 && (
              <div className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 bg-black/75 backdrop-blur-sm border border-[#FFD100]/35 px-4 py-2 rounded-full pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="#FFD100" strokeWidth="1.2"/>
                  <path d="M6 3v3L8 7.5" stroke="#FFD100" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="text-[#FFD100] text-sm font-bold">~{eta} {tr("min")}</span>
              </div>
            )}

            {/* Manzil yorliqlari */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-black/70 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-white text-xs font-medium">{MOCK.from.split(",")[0]}</span>
              </div>
            </div>
            <div className="absolute top-4 right-4 z-[1000] bg-black/70 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <span className="text-white text-xs font-medium">{MOCK.to.split(",")[0]}</span>
              </div>
            </div>

            {idx === 3 && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-green-500/20 border border-green-500/40 rounded-2xl px-8 py-6 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-green-400 font-bold text-lg">Yetkazildi!</p>
                  <p className="text-white/50 text-sm mt-1">{MOCK.to.split(",")[0]}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status stepper */}
          <div className={`${card} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`${main} font-bold`}>Holat</h2>
              <span className="text-[#FFD100] text-sm font-semibold">{cur.label}</span>
            </div>
            <div className="flex items-center">
              {STATUSES.map((s, i) => (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-500 ${
                    i < idx  ? "bg-[#FFD100] text-black" :
                    i === idx ? "bg-[#FFD100] text-black ring-4 ring-[#FFD100]/20" :
                    "dark:bg-white/8 bg-gray-200 dark:text-white/25 text-gray-400"
                  }`}>
                    {i < idx ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7l3.5 3.5 6-6" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : i + 1}
                  </div>
                  {i < 3 && (
                    <div className="flex-1 h-1 mx-1.5 rounded-full overflow-hidden dark:bg-white/8 bg-gray-200">
                      <div className={`h-full rounded-full transition-all duration-700 ${i < idx ? "w-full bg-[#FFD100]" : "w-0"}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3">
              {STATUSES.map((s, i) => (
                <span key={s.key} className={`text-xs ${i <= idx ? "text-[#FFD100] font-semibold" : `${muted}`}`}>{s.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* O'NG — Driver + marshrut + narx */}
        <div className="col-span-1 space-y-4">

          {idx >= 1 && (
            <div className={`${card} p-5`}>
              <p className={`${muted} text-xs font-bold uppercase tracking-widest mb-4`}>Haydovchi</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFD100]/10 border border-[#FFD100]/20 flex items-center justify-center text-2xl flex-shrink-0">🧑</div>
                <div>
                  <p className={`${main} font-bold text-sm`}>{MOCK.driver.name}</p>
                  <p className={`${muted} text-xs`}>{MOCK.driver.car}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[#FFD100] text-xs">★ {MOCK.driver.rating}</span>
                    <span className={`${muted} text-xs`}>· {MOCK.driver.trips} zakaz</span>
                  </div>
                </div>
              </div>
              <a href={`tel:${MOCK.driver.phone}`}
                className="flex items-center justify-center gap-2 w-full h-10 bg-[#FFD100] text-black font-bold text-sm rounded-xl hover:bg-[#E6BC00] transition-all">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M14 11.5c0 .3-.1.6-.2.9-.1.3-.3.5-.6.7-.5.4-1 .6-1.6.6-.4 0-.9-.1-1.4-.3-.5-.2-1-.5-1.5-.9-.5-.4-1-.8-1.4-1.3-.4-.5-.8-1-.9-1.5-.2-.5-.3-1-.3-1.4 0-.5.1-1 .5-1.5.3-.5.7-.8 1.2-.9h.3c.2 0 .3.1.4.2l1.4 2c.1.1.1.2.1.3 0 .1-.1.3-.2.4l-.5.5c-.1.1-.1.1-.1.2s.1.3.2.4c.3.5.7 1 1.1 1.4.4.4.9.8 1.4 1.1.1.1.3.2.4.2.1 0 .2-.1.3-.2l.5-.5c.1-.1.3-.2.5-.2h.1l2 1.4c.1.1.2.3.2.4Z" stroke="black" strokeWidth="1.2" fill="none"/>
                </svg>
                Qo&apos;ng&apos;iroq qilish
              </a>
            </div>
          )}

          <div className={`${card} p-5`}>
            <p className={`${muted} text-xs font-bold uppercase tracking-widest mb-4`}>Marshrut</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 mt-1 flex-shrink-0 shadow-[0_0_6px_#4ade80]" />
                <div>
                  <p className={`${muted} text-[10px] uppercase tracking-widest mb-0.5`}>{tr("from")}</p>
                  <p className={`${main} text-sm font-semibold`}>{MOCK.from}</p>
                </div>
              </div>
              <div className="w-px h-4 dark:bg-white/8 bg-gray-200 ml-1" />
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1 flex-shrink-0 shadow-[0_0_6px_#f87171]" />
                <div>
                  <p className={`${muted} text-[10px] uppercase tracking-widest mb-0.5`}>{tr("to")}</p>
                  <p className={`${main} text-sm font-semibold`}>{MOCK.to}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${card} p-5`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`${muted} text-xs font-bold uppercase tracking-widest`}>Narx</span>
              <span className={`${muted} text-xs`}>{MOCK.truck}</span>
            </div>
            <p className="text-[#FFD100] font-bold text-3xl">{MOCK.price.toLocaleString()}</p>
            <p className={`${muted} text-xs mt-0.5`}>{tr("som")} · yetkazib bergandan keyin</p>
          </div>

          {idx <= 1 && !cancelled && (
            confirm ? (
              <div className="border border-red-500/25 bg-red-500/5 rounded-2xl p-4">
                <p className={`${main} font-semibold text-sm mb-3`}>Haqiqatan bekor qilasizmi?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirm(false)}
                    className={`flex-1 h-9 dark:border-white/15 border-gray-200 border ${muted} text-xs font-bold rounded-xl transition-all`}>
                    {tr("cancel")}
                  </button>
                  <button onClick={() => setCancelled(true)}
                    className="flex-1 h-9 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all">
                    Ha, bekor qil
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirm(true)}
                className={`w-full h-10 dark:border-white/8 border border-gray-200 ${muted} text-sm font-semibold rounded-xl hover:border-red-400 hover:text-red-500 transition-all`}>
                {tr("cancel")} qilish
              </button>
            )
          )}

          {idx === 3 && (
            <Link href="/order/new"
              className="flex items-center justify-center w-full h-12 bg-[#FFD100] text-black font-bold rounded-xl hover:bg-[#E6BC00] transition-all">
              {tr("newOrder")} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
