"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";
import { supabase } from "@/lib/supabase/client";
import { AddressInput } from "@/components/AddressInput";

type VehicleId = "damas" | "labo" | "isuzu" | "fura";

const VEHICLES: { id: VehicleId; name: string; cap: string; base: number; perKm: number }[] = [
  { id: "damas", name: "Damas",  cap: "1.5 t",  base: 15_000, perKm: 800  },
  { id: "labo",  name: "Labo",   cap: "2 t",    base: 20_000, perKm: 1000 },
  { id: "isuzu", name: "Isuzu",  cap: "5 t",    base: 40_000, perKm: 2200 },
  { id: "fura",  name: "Fura",   cap: "20 t",   base: 80_000, perKm: 4500 },
];

const TruckIcon = () => (
  <svg width="18" height="14" viewBox="0 0 22 16" fill="none">
    <rect x="1" y="2" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M14 4.5h5l2 4v3.5h-7V4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <circle cx="4.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="17.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);

const MOCK_KM = 8.4;

export default function TgOrderNewPage() {
  const router  = useRouter();
  const { tg }  = useTelegram();

  const [from,    setFrom]    = useState("");
  const [fromLat, setFromLat] = useState<number | null>(null);
  const [fromLng, setFromLng] = useState<number | null>(null);
  const [to,      setTo]      = useState("");
  const [toLat,   setToLat]   = useState<number | null>(null);
  const [toLng,   setToLng]   = useState<number | null>(null);
  const [vehicle,  setVehicle]  = useState<VehicleId>("damas");
  const [step,     setStep]     = useState<"form" | "confirm">("form");
  const [loading,  setLoading]  = useState(false);

  const selected = VEHICLES.find(v => v.id === vehicle)!;
  const price    = Math.round(selected.base + MOCK_KM * selected.perKm);
  const isValid  = from.trim().length > 2 && to.trim().length > 2;

  // Ref — har doim eng yangi qiymatlarni saqlaydi (stale closure yo'q)
  const latestRef = useRef({ from, fromLat, fromLng, to, toLat, toLng, vehicle, price });
  useEffect(() => {
    latestRef.current = { from, fromLat, fromLng, to, toLat, toLng, vehicle, price };
  });

  // ── 1-tugma: form step ──────────────────────────────────────────────────
  useEffect(() => {
    if (!tg || step !== "form") return;

    if (!isValid) {
      tg.MainButton.hide();
      return;
    }

    tg.MainButton.setText("Narxni ko'rish");
    tg.MainButton.setParams({ color: "#C8F135", text_color: "#000000" });
    tg.MainButton.show();
    tg.MainButton.enable();

    const handler = () => {
      console.log("1-tasdiqlash bosildi");
      setStep("confirm");
    };
    tg.MainButton.onClick(handler);
    return () => { tg.MainButton.offClick(handler); };
  }, [tg, step, isValid]);

  // ── 2-tugma: confirm step ───────────────────────────────────────────────
  useEffect(() => {
    if (!tg || step !== "confirm") return;

    tg.MainButton.setText(`Tasdiqlash — ${price.toLocaleString()} so'm`);
    tg.MainButton.setParams({ color: "#C8F135", text_color: "#000000" });
    tg.MainButton.show();
    tg.MainButton.enable();

    // Stable wrapper — latestRef orqali hamma vaqt so'ngi qiymatlar
    const handler = async () => {
      console.log("2-tasdiqlash bosildi");
      const { from, fromLat, fromLng, to, toLat, toLng, vehicle, price } = latestRef.current;
      console.log("Ma'lumotlar:", { from, to, vehicle, price });

      tg.MainButton.disable();
      tg.MainButton.setText("Yuborilmoqda...");

      const { data, error } = await supabase
        .from("orders")
        .insert({
          client_id:    null,
          from_address: from,
          from_lat:     fromLat,
          from_lng:     fromLng,
          to_address:   to,
          to_lat:       toLat,
          to_lng:       toLng,
          vehicle_type: vehicle,
          price,
          cargo_type:   "Belgilanmagan",
          cargo_weight: 0,
          status:       "pending",
          driver_id:    null,
        })
        .select();

      console.log("insert data:", data);
      console.log("insert error:", error);

      if (error || !data?.[0]) {
        alert(error?.message ?? "Insert xatoligi");
        tg.MainButton.enable();
        tg.MainButton.setText(`Tasdiqlash — ${price.toLocaleString()} so'm`);
        return;
      }

      router.push(`/tg/order/${data[0].id}/tracking`);
    };

    tg.MainButton.onClick(handler);
    return () => {
      tg.MainButton.offClick(handler);
      tg.MainButton.hide();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tg, step]); // price faqat matn uchun — latestRef ichida yangilanadi

  // BackButton
  useEffect(() => {
    if (!tg) return;
    if (step === "confirm") {
      const handler = () => setStep("form");
      tg.BackButton.show();
      tg.BackButton.onClick(handler);
      return () => { tg.BackButton.offClick(handler); tg.BackButton.hide(); };
    }
  }, [tg, step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { tg?.MainButton.hide(); };
  }, [tg]);

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4 space-y-5">

      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div key="form"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <p className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Yangi buyurtma</p>
              <h1 className="text-xl font-bold">Manzilni kiriting</h1>
            </div>

            {/* Manzillar */}
            <div className="space-y-2">
              <AddressInput
                placeholder="Qayerdan?"
                value={from}
                pinColor="green"
                onChange={(v) => { setFrom(v); if (!v) { setFromLat(null); setFromLng(null); } }}
                onSelect={(addr, lat, lng) => {
                  setFrom(addr);
                  setFromLat(lat);
                  setFromLng(lng);
                }}
              />
              <AddressInput
                placeholder="Qayerga?"
                value={to}
                pinColor="red"
                onChange={(v) => { setTo(v); if (!v) { setToLat(null); setToLng(null); } }}
                onSelect={(addr, lat, lng) => {
                  setTo(addr);
                  setToLat(lat);
                  setToLng(lng);
                }}
              />
            </div>

            {from && to && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/30">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M6 4v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Taxminiy masofa: ~{MOCK_KM} km
              </motion.div>
            )}

            {/* Mashina turi */}
            <div>
              <p className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Mashina turi</p>
              <div className="grid grid-cols-2 gap-2.5">
                {VEHICLES.map(v => (
                  <button key={v.id} onClick={() => setVehicle(v.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                      vehicle === v.id
                        ? "border-[#C8F135]/50 bg-[#C8F135]/8"
                        : "border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/[0.03]"
                    }`}>
                    <span className={vehicle === v.id ? "text-[#C8F135]" : "text-gray-400 dark:text-white/30"}>
                      <TruckIcon />
                    </span>
                    <div>
                      <p className={`text-sm font-bold ${vehicle === v.id ? "text-[#C8F135]" : ""}`}>{v.name}</p>
                      <p className="text-gray-400 dark:text-white/30 text-[10px]">{v.cap}</p>
                    </div>
                    {vehicle === v.id && (
                      <div className="ml-auto w-4 h-4 rounded-full bg-[#C8F135] flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                          <path d="M1 3.5l2 2 4-4" stroke="#000" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

        ) : (
          <motion.div key="confirm"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-5"
          >
            <div>
              <p className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Tasdiqlash</p>
              <h1 className="text-xl font-bold">Buyurtma ma&apos;lumotlari</h1>
            </div>

            {/* Marshrut */}
            <div className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-white/8">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <p className="text-sm font-medium">{from}</p>
              </div>
              <div className="flex items-center gap-3 px-4 py-0.5">
                <div className="w-2 flex-shrink-0 flex justify-center">
                  <div className="w-px h-4 bg-gray-200 dark:bg-white/10" />
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <p className="text-sm font-medium">{to}</p>
              </div>
            </div>

            {/* Tafsilot */}
            <div className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
              {[
                { label: "Mashina", value: selected.name },
                { label: "Sig'im",  value: selected.cap  },
                { label: "Masofa",  value: `~${MOCK_KM} km` },
                { label: "Narx",    value: `${price.toLocaleString()} so'm`, accent: true },
              ].map((row, i, arr) => (
                <div key={row.label}
                  className={`flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-gray-200 dark:border-white/8" : ""}`}>
                  <p className="text-gray-500 dark:text-white/40 text-sm">{row.label}</p>
                  <p className={`text-sm font-bold ${row.accent ? "text-[#C8F135]" : ""}`}>{row.value}</p>
                </div>
              ))}
            </div>

            {/* Fallback button — Telegram MainButton ishlamasa */}
            <button
              onClick={async () => {
                console.log("2-tasdiqlash bosildi (fallback button)");
                const { from, fromLat, fromLng, to, toLat, toLng, vehicle, price } = latestRef.current;
                console.log("Ma'lumotlar:", { from, to, vehicle, price });
                setLoading(true);

                const { data, error } = await supabase
                  .from("orders")
                  .insert({
                    client_id:    null,
                    from_address: from,
                    from_lat:     fromLat,
                    from_lng:     fromLng,
                    to_address:   to,
                    to_lat:       toLat,
                    to_lng:       toLng,
                    vehicle_type: vehicle,
                    price,
                    cargo_type:   "Belgilanmagan",
                    cargo_weight: 0,
                    status:       "pending",
                    driver_id:    null,
                  })
                  .select();

                console.log("insert data:", data);
                console.log("insert error:", error);
                setLoading(false);

                if (error || !data?.[0]) {
                  alert(error?.message ?? "Insert xatoligi");
                  return;
                }
                router.push(`/tg/order/${data[0].id}/tracking`);
              }}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#C8F135] text-black font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? "Yuborilmoqda..." : `Tasdiqlash — ${price.toLocaleString()} so'm`}
            </button>

            <p className="text-gray-400 dark:text-white/25 text-xs text-center">
              Tasdiqlash tugmasini bosing — haydovchi topiladi
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
