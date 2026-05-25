"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useTelegram } from "@/hooks/useTelegram";

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

  // MainButton — tasdiqlash
  useEffect(() => {
    if (!tg) return;
    tg.MainButton.setText(`Tasdiqlash — ${price.toLocaleString()} so'm`);
    tg.MainButton.setParams({ color: "#F5C518", text_color: "#000000" });
    tg.MainButton.show();
    tg.MainButton.enable();
    const handler = () => router.push("/tg/order/searching");
    tg.MainButton.onClick(handler);
    return () => {
      tg.MainButton.offClick(handler);
      tg.MainButton.hide();
    };
  }, [tg, price, router]);

  // BackButton
  useEffect(() => {
    if (!tg) return;
    const handler = () => router.back();
    tg.BackButton.onClick(handler);
    return () => {
      tg.BackButton.offClick(handler);
    };
  }, [tg, router]);

  const rows = [
    { label: "Qayerdan",  value: from },
    { label: "Qayerga",   value: to },
    { label: "Mashina",   value: vehicleName },
    { label: "Narx",      value: `${price.toLocaleString()} so'm`, accent: true },
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
    <Suspense fallback={<div>Yuklanmoqda...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
