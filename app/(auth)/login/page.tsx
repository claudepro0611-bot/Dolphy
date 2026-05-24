"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "@/components/Providers";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { tr } = useLang();

  const digits = phone.replace(/\D/g, "");
  const isValid = digits.length === 9;

  function formatPhone(val: string) {
    const d = val.replace(/\D/g, "").slice(0, 9);
    let f = "";
    if (d.length > 0) f = d.slice(0, 2);
    if (d.length > 2) f += " " + d.slice(2, 5);
    if (d.length > 5) f += " " + d.slice(5, 7);
    if (d.length > 7) f += " " + d.slice(7, 9);
    setPhone(f);
    setError("");
  }

  async function send() {
    if (!isValid) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+998" + digits }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Xatolik yuz berdi"); return; }
      sessionStorage.setItem("otp_phone", "+998" + digits);
      router.push("/otp");
    } catch {
      setError("Server bilan bog'lanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="text-3xl font-bold text-white mb-2">{tr("phoneTitle")}</h1>
      <p className="text-white/40 text-sm mb-8 leading-relaxed">{tr("phoneSub")}</p>

      {/* Input */}
      <div className={`flex items-center border rounded-2xl h-14 mb-4 transition-colors ${
        error ? "border-red-500/60 bg-red-500/5" : "border-white/15 bg-white/5 focus-within:border-[#FFD100]/60"
      }`}>
        <div className="flex items-center gap-2 pl-4 pr-3 border-r border-white/10">
          <span className="text-white font-bold text-sm tracking-wide">+998</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="90 123 45 67"
          value={phone}
          onChange={(e) => formatPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          autoFocus
          className="flex-1 bg-transparent px-3 text-white font-semibold text-base placeholder:text-white/20 outline-none"
        />
        {isValid && (
          <div className="w-7 h-7 rounded-full bg-[#FFD100] flex items-center justify-center mr-3 flex-shrink-0">
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5l3.5 3.5L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* Send button */}
      <button
        onClick={send}
        disabled={!isValid || loading}
        className={`w-full h-14 rounded-2xl font-bold text-base transition-all mb-6 ${
          isValid && !loading
            ? "bg-[#FFD100] text-black hover:bg-[#E6BC00] hover:scale-[1.01] shadow-[0_0_30px_rgba(255,209,0,0.2)]"
            : "bg-white/8 text-white/25 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
            {tr("sending")}
          </span>
        ) : (
          `${tr("sendCode")} →`
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/25 text-xs">yoki</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Telegram */}
      <a
        href="https://t.me/yotoq_bot"
        className="flex items-center justify-center gap-3 w-full h-13 border border-[#229ED9]/30 bg-[#229ED9]/8 rounded-2xl text-[#229ED9] font-semibold text-sm hover:border-[#229ED9]/50 hover:bg-[#229ED9]/12 transition-all py-4"
      >
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
          <path d="M17.25 1L1 7l5.5 2M17.25 1L11 15l-4.5-6M17.25 1L6.5 9m0 0v4.5L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Telegram orqali kirish
      </a>

      <p className="text-white/20 text-xs text-center mt-8 leading-relaxed">
        Kirish orqali{" "}
        <Link href="#" className="text-white/40 underline underline-offset-2">Foydalanish shartlari</Link>
        {" "}va{" "}
        <Link href="#" className="text-white/40 underline underline-offset-2">Maxfiylik siyosati</Link>
        ga rozilik bildirasiz
      </p>
    </motion.div>
  );
}
