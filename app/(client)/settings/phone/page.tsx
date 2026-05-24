"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Step = "phone" | "otp" | "success";

const MOCK_OTP = "123456";
const CODE_LEN = 6;

const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold ${
        type === "success"
          ? "bg-green-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? (
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
          <path d="M1 7l4.5 4.5L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
      {msg}
    </motion.div>
  );
}

function formatPhone(val: string) {
  const d = val.replace(/\D/g, "").slice(0, 9);
  let f = "";
  if (d.length > 0) f = "(" + d.slice(0, 2);
  if (d.length >= 2) f += ") " + d.slice(2, 5);
  if (d.length >= 5) f += "-" + d.slice(5, 7);
  if (d.length >= 7) f += "-" + d.slice(7, 9);
  return f;
}

export default function PhoneChangePage() {
  const router = useRouter();

  const [step,    setStep]    = useState<Step>("phone");
  const [raw,     setRaw]     = useState("");
  const [display, setDisplay] = useState("");
  const [digits,  setDigits]  = useState(Array(CODE_LEN).fill(""));
  const [loading, setLoading] = useState(false);
  const [shake,   setShake]   = useState(false);
  const [toast,   setToast]   = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handlePhone(val: string) {
    const d = val.replace(/\D/g, "").slice(0, 9);
    setRaw(d);
    setDisplay(formatPhone(d));
  }

  async function submitPhone() {
    if (raw.length !== 9) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep("otp");
  }

  function handleOtpChange(idx: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < CODE_LEN - 1) {
      (document.getElementById(`otp-${idx + 1}`) as HTMLInputElement)?.focus();
    }
    if (next.every(d => d !== "") && char) {
      verifyOtp(next.join(""));
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      (document.getElementById(`otp-${idx - 1}`) as HTMLInputElement)?.focus();
      const next = [...digits]; next[idx - 1] = ""; setDigits(next);
    }
  }

  async function verifyOtp(code: string) {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    if (code !== MOCK_OTP) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setDigits(Array(CODE_LEN).fill(""));
      (document.getElementById("otp-0") as HTMLInputElement)?.focus();
      showToast("Kod noto'g'ri. Qayta kiriting.", "error");
      return;
    }
    setStep("success");
    showToast("Telefon raqam muvaffaqiyatli o'zgartirildi!", "success");
    setTimeout(() => router.push("/settings"), 2000);
  }

  return (
    <div className="max-w-sm mx-auto">
      {/* Toast */}
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>

      {/* Orqaga */}
      <button onClick={() => step === "otp" ? setStep("phone") : router.push("/settings")}
        className={`flex items-center gap-2 ${muted} text-sm font-semibold mb-8 hover:dark:text-white hover:text-gray-900 transition-colors`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Orqaga
      </button>

      <AnimatePresence mode="wait">

        {/* ── Bosqich 1: Yangi raqam ── */}
        {step === "phone" && (
          <motion.div key="phone"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }} className="space-y-6">

            <div>
              <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-1">1 / 2</p>
              <h1 className={`text-2xl font-bold ${main} mb-1`}>Yangi raqam</h1>
              <p className={`text-sm ${muted}`}>Yangi telefon raqamingizni kiriting</p>
            </div>

            <div className={`flex items-center border-2 rounded-2xl h-14 transition-all duration-200 ${
              raw.length > 0 ? "border-[#FFD100]" : "dark:border-white/15 border-gray-200"
            } dark:bg-white/5 bg-gray-50`}>
              <div className="flex items-center gap-2 pl-4 pr-3 border-r dark:border-white/10 border-gray-200 h-full flex-shrink-0">
                <span className={`font-bold text-sm ${main} tracking-wide`}>+998</span>
              </div>
              <input
                type="tel" inputMode="numeric"
                value={display}
                onChange={e => handlePhone(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitPhone()}
                placeholder="(90) 123-45-67"
                autoFocus
                className={`flex-1 bg-transparent px-3 font-semibold text-base ${main} placeholder:dark:text-white/20 placeholder:text-gray-300 outline-none`}
              />
              {raw.length === 9 && (
                <div className="w-6 h-6 rounded-full bg-[#FFD100] flex items-center justify-center mr-3 flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>

            <button
              onClick={submitPhone}
              disabled={raw.length !== 9 || loading}
              className={`w-full h-14 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                raw.length === 9 && !loading
                  ? "bg-[#FFD100] text-black hover:bg-[#E6BC00] shadow-[0_0_30px_rgba(255,209,0,0.2)]"
                  : "dark:bg-white/8 bg-gray-100 dark:text-white/25 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Yuborilmoqda...</>
              ) : "Davom etish →"}
            </button>
          </motion.div>
        )}

        {/* ── Bosqich 2: SMS kod ── */}
        {step === "otp" && (
          <motion.div key="otp"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }} className="space-y-6">

            <div>
              <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-1">2 / 2</p>
              <h1 className={`text-2xl font-bold ${main} mb-1`}>SMS kod</h1>
              <p className={`text-sm ${muted}`}>
                <span className={`font-semibold ${main}`}>+998 {raw.slice(0,2)} {raw.slice(2,5)}-{raw.slice(5,7)}-{raw.slice(7)}</span> ga yuborildi
              </p>
            </div>

            <motion.div
              animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex gap-2.5 justify-center"
            >
              {digits.map((d, i) => (
                <input key={i} id={`otp-${i}`}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  autoFocus={i === 0}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  disabled={loading}
                  className={`w-11 h-14 rounded-xl text-center text-xl font-bold border-2 outline-none transition-all ${
                    d
                      ? "border-[#FFD100] bg-[#FFD100]/10 dark:text-white text-gray-900"
                      : "dark:border-white/15 border-gray-200 dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900"
                  } focus:border-[#FFD100] disabled:opacity-50`}
                />
              ))}
            </motion.div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#FFD100] rounded-full animate-spin" />
                Tekshirilmoqda...
              </div>
            )}

            <p className={`text-xs text-center ${muted}`}>
              Test uchun kod: <span className="font-bold text-[#FFD100]">{MOCK_OTP}</span>
            </p>
          </motion.div>
        )}

        {/* ── Muvaffaqiyat ── */}
        {step === "success" && (
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }} className="text-center space-y-4 pt-8">

            <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center mx-auto">
              <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
                <path d="M2 14l9 9L30 2" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={`text-xl font-bold ${main}`}>Muvaffaqiyatli!</h2>
            <p className={`text-sm ${muted}`}>Telefon raqam o&apos;zgartirildi. Sozlamalar sahifasiga qaytilmoqda...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
