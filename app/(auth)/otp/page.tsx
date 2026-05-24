"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/Providers";

const LEN = 4;

export default function OtpPage() {
  const router = useRouter();
  const [code, setCode] = useState(Array(LEN).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [resendSec, setResendSec] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const p = sessionStorage.getItem("otp_phone");
    if (!p) { router.replace("/login"); return; }
    setPhone(p);
    inputs.current[0]?.focus();
  }, [router]);

  useEffect(() => {
    if (resendSec <= 0) return;
    const t = setTimeout(() => setResendSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSec]);

  function handleKey(i: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    setError("");
    if (val && i < LEN - 1) inputs.current[i + 1]?.focus();
    if (next.every((c) => c !== "") && val) verify(next.join(""));
  }

  function handleBackspace(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (pasted.length === LEN) {
      const arr = pasted.split("");
      setCode(arr);
      inputs.current[LEN - 1]?.focus();
      verify(pasted);
    }
    e.preventDefault();
  }

  async function verify(otp: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kod noto'g'ri");
        setCode(Array(LEN).fill(""));
        inputs.current[0]?.focus();
        return;
      }
      sessionStorage.removeItem("otp_phone");
      router.replace(data.redirect ?? "/dashboard");
    } catch {
      setError("Server bilan bog'lanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (resendSec > 0) return;
    setResendSec(60);
    setCode(Array(LEN).fill(""));
    setError("");
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    inputs.current[0]?.focus();
  }

  const filled = code.filter((c) => c !== "").length;
  const { tr } = useLang();

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-2 text-white/40 text-sm mb-8 hover:text-white/70 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Orqaga
      </Link>

      <div className="inline-flex items-center gap-2 border border-[#FFD100]/25 bg-[#FFD100]/5 text-[#FFD100] text-xs font-bold px-3 py-1.5 rounded-full mb-6">
        {tr("codeSent")}
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">{tr("enterCode")}</h1>
      <p className="text-white/40 text-sm mb-6 leading-relaxed">
        <span className="text-white/60 font-semibold">{phone}</span> raqamiga 4 xonali kod yuborildi
      </p>

      {/* 4 ta kvadrat */}
      <div className="flex gap-3 mb-2" onPaste={handlePaste}>
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={c}
            onChange={(e) => handleKey(i, e.target.value)}
            onKeyDown={(e) => handleBackspace(i, e)}
            className={`w-16 h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all outline-none ${
              error
                ? "border-red-500/60 bg-red-500/5 text-red-400"
                : c
                ? "border-[#FFD100] bg-[#FFD100]/8 text-[#FFD100]"
                : "border-white/15 bg-white/5 text-white focus:border-[#FFD100]/60"
            }`}
          />
        ))}
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {/* Progress */}
      <div className="h-0.5 bg-white/8 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[#FFD100] rounded-full transition-all duration-300"
          style={{ width: `${(filled / LEN) * 100}%` }}
        />
      </div>

      {/* Tasdiqlash */}
      <button
        onClick={() => verify(code.join(""))}
        disabled={filled < LEN || loading}
        className={`w-full h-12 rounded-2xl font-bold text-sm transition-all mb-4 ${
          filled === LEN && !loading
            ? "bg-[#FFD100] text-black hover:bg-[#E6BC00] shadow-[0_0_30px_rgba(255,209,0,0.2)]"
            : "bg-white/8 text-white/25 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
            </svg>
            Tekshirilmoqda...
          </span>
        ) : (
          `${tr("confirm")} →`
        )}
      </button>

      <p className="text-center text-sm text-white/30">
        Kodni olmadingizmi?{" "}
        {resendSec > 0 ? (
          <span className="text-white/40">{resendSec}s kutib turing</span>
        ) : (
          <button onClick={resend} className="text-[#FFD100] font-semibold hover:underline">
            {tr("resend")}
          </button>
        )}
      </p>
    </div>
  );
}
