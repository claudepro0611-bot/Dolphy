"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";
import { supabase } from "@/lib/supabase/client";

const fade    = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function ConfirmContent() {
  const router = useRouter();
  const { tg } = useTelegram();
  const params = useSearchParams();

  const from    = params.get("from")    ?? "—";
  const to      = params.get("to")      ?? "—";
  const vehicle = params.get("vehicle") ?? "damas";
  const price   = parseInt(params.get("price") ?? "0");

  const vehicleName = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);

  const [isLoading, setIsLoading] = useState(false);

  // Tasdiqlash funksiyasi
  const handleConfirm = useCallback(async () => {
    setIsLoading(true);

    // Debug: Supabase session tekshirish
    const { data: { user } } = await supabase.auth.getUser();
    console.log("user:", user);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        client_id:    null, // Telegram'da Supabase auth yo'q — vaqtincha null
        from_address: from,
        to_address:   to,
        vehicle_type: vehicle,
        price,
        cargo_type:   "Belgilanmagan",
        cargo_weight: 0,
        status:       "pending",
        driver_id:    null,
      })
      .select();

    console.log("data:", data);
    console.log("error:", error);

    setIsLoading(false);

    if (error || !data?.[0]) {
      alert(error?.message ?? "Xatolik yuz berdi");
      return;
    }

    router.push(`/tg/order/searching?id=${data[0].id}`);
  }, [from, to, vehicle, price, router]);

  // MainButton ulash
  useEffect(() => {
    if (!tg) return;
    tg.MainButton.setText("Tasdiqlash");
    tg.MainButton.setParams({ color: "#F5C518", text_color: "#000000" });
    tg.MainButton.show();
    tg.MainButton.enable();
    tg.MainButton.onClick(handleConfirm);
    return () => {
      tg.MainButton.offClick(handleConfirm);
      tg.MainButton.hide();
    };
  }, [tg, handleConfirm]);

  // isLoading o'zgarganda MainButton holati
  useEffect(() => {
    if (!tg) return;
    if (isLoading) {
      tg.MainButton.disable();
      tg.MainButton.setText("Yuborilmoqda...");
    } else {
      tg.MainButton.enable();
      tg.MainButton.setText("Tasdiqlash");
    }
  }, [tg, isLoading]);

  // BackButton
  useEffect(() => {
    if (!tg) return;
    const handler = () => router.back();
    tg.BackButton.onClick(handler);
    return () => { tg.BackButton.offClick(handler); };
  }, [tg, router]);

  const rows = [
    { label: "Qayerdan", value: from },
    { label: "Qayerga",  value: to },
    { label: "Mashina",  value: vehicleName },
    { label: "Narx",     value: `${price.toLocaleString()} so'm`, accent: true },
  ];

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="min-h-screen w-full max-w-[430px] mx-auto px-4 py-4 space-y-5"
    >
      <motion.div variants={fade}>
        <p className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest mb-1">
          Tasdiqlash
        </p>
        <h1 className="text-xl font-bold">Buyurtma ma&apos;lumotlari</h1>
      </motion.div>

      {/* Marshrut */}
      <motion.div variants={fade}
        className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
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
      </motion.div>

      {/* Tafsilotlar */}
      <motion.div variants={fade}
        className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden">
        {rows.map((row, i) => (
          <div key={row.label}
            className={`flex items-center justify-between px-4 py-3.5 ${
              i < rows.length - 1 ? "border-b border-gray-200 dark:border-white/8" : ""
            }`}>
            <p className="text-gray-500 dark:text-white/40 text-sm">{row.label}</p>
            <p className={`text-sm font-bold ${row.accent ? "text-[#F5C518]" : ""}`}>{row.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fade}
        className="text-gray-400 dark:text-white/25 text-xs text-center">
        Tasdiqlash tugmasini bosing — haydovchi qidiruvi boshlanadi
      </motion.div>
    </motion.div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F5C518]/20 border-t-[#F5C518] animate-spin" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
