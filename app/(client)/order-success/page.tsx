"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6"
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M6 18l8 8 16-16" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 mb-8"
      >
        <h1 className="text-2xl font-bold">Buyurtma qabul qilindi!</h1>
        <p className="text-gray-500 dark:text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
          Haydovchi qidirilmoqda. Tez orada bog&apos;lanishadi.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Link href="/order/new"
          className="w-full py-3.5 rounded-2xl bg-[#C8F135] text-black font-bold text-sm text-center hover:bg-[#b3d92f] transition-colors">
          Yangi buyurtma
        </Link>
        <Link href="/orders"
          className="w-full py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-center dark:text-white/60 text-gray-600 hover:dark:bg-white/5 hover:bg-gray-50 transition-colors">
          Buyurtmalarim
        </Link>
      </motion.div>
    </div>
  );
}
