"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Step = "current" | "new" | "confirm" | "success";

const MOCK_PIN   = "1234";
const PIN_LEN    = 4;

const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

const STEP_INFO: Record<Step, { title: string; sub: string; step: string }> = {
  current: { title: "Hozirgi PIN",   sub: "Joriy 4 xonali kodni kiriting",     step: "1 / 3" },
  new:     { title: "Yangi PIN",     sub: "Yangi 4 xonali kod o'rnating",      step: "2 / 3" },
  confirm: { title: "Tasdiqlash",    sub: "Yangi kodni qayta kiriting",         step: "3 / 3" },
  success: { title: "Tayyor!",       sub: "PIN muvaffaqiyatli o'zgartirildi",   step: "✓"    },
};

function PinDots({ value, shake }: { value: string; shake: boolean }) {
  return (
    <motion.div
      animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      className="flex gap-4 justify-center my-8"
    >
      {Array.from({ length: PIN_LEN }).map((_, i) => (
        <motion.div key={i}
          animate={{ scale: value.length === i + 1 ? [1, 1.25, 1] : 1 }}
          transition={{ duration: 0.15 }}
          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
            i < value.length
              ? "bg-[#FFD100] border-[#FFD100]"
              : "dark:border-white/25 border-gray-300 dark:bg-transparent bg-transparent"
          }`}
        />
      ))}
    </motion.div>
  );
}

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

function NumPad({ onKey }: { onKey: (k: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {KEYS.map((k, i) => (
        k === "" ? <div key={i} /> :
        <button key={i} onClick={() => onKey(k)}
          className={`h-16 rounded-2xl font-bold text-xl transition-all active:scale-95 ${
            k === "⌫"
              ? `dark:bg-white/5 bg-gray-100 dark:border-white/10 border border-gray-200 ${muted} hover:dark:bg-white/10 hover:bg-gray-200`
              : `dark:bg-white/[0.06] bg-gray-100 dark:border-white/10 border border-gray-200 ${main} hover:dark:bg-white/12 hover:bg-gray-200 hover:border-[#FFD100]/40`
          }`}>
          {k}
        </button>
      ))}
    </div>
  );
}

export default function PinChangePage() {
  const router = useRouter();

  const [step,       setStep]       = useState<Step>("current");
  const [current,    setCurrent]    = useState("");
  const [newPin,     setNewPin]     = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [shake,      setShake]      = useState(false);
  const [errMsg,     setErrMsg]     = useState("");

  const active = step === "current" ? current
               : step === "new"     ? newPin
               : step === "confirm" ? confirm
               : "";

  function triggerShake(msg: string) {
    setShake(true);
    setErrMsg(msg);
    setTimeout(() => { setShake(false); setErrMsg(""); }, 1400);
  }

  function handleKey(k: string) {
    if (step === "success") return;

    const setter =
      step === "current" ? setCurrent :
      step === "new"     ? setNewPin  :
                           setConfirm;

    const val =
      step === "current" ? current :
      step === "new"     ? newPin  :
                           confirm;

    if (k === "⌫") {
      setter(val.slice(0, -1));
      return;
    }
    if (val.length >= PIN_LEN) return;
    const next = val + k;
    setter(next);

    if (next.length === PIN_LEN) {
      setTimeout(() => advance(next), 180);
    }
  }

  function advance(val: string) {
    if (step === "current") {
      if (val !== MOCK_PIN) {
        triggerShake("Noto'g'ri PIN");
        setCurrent("");
        return;
      }
      setStep("new");
    } else if (step === "new") {
      setStep("confirm");
    } else if (step === "confirm") {
      if (val !== newPin) {
        triggerShake("PIN mos kelmadi");
        setConfirm("");
        return;
      }
      setStep("success");
      setTimeout(() => router.push("/settings"), 2000);
    }
  }

  function goBack() {
    if (step === "current") { router.push("/settings"); return; }
    if (step === "new")     { setStep("current"); setCurrent(""); return; }
    if (step === "confirm") { setStep("new"); setNewPin(""); setConfirm(""); return; }
    router.push("/settings");
  }

  const info = STEP_INFO[step];

  return (
    <div className="max-w-sm mx-auto">

      {/* Orqaga */}
      {step !== "success" && (
        <button onClick={goBack}
          className={`flex items-center gap-2 ${muted} text-sm font-semibold mb-8 hover:dark:text-white hover:text-gray-900 transition-colors`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Orqaga
        </button>
      )}

      <AnimatePresence mode="wait">
        {step !== "success" ? (
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}>

            {/* Header */}
            <div className="text-center mb-2">
              <p className="text-[#FFD100] text-xs font-bold tracking-[3px] uppercase mb-1">{info.step}</p>
              <h1 className={`text-2xl font-bold ${main} mb-1`}>{info.title}</h1>
              <p className={`text-sm ${muted}`}>{info.sub}</p>
            </div>

            {/* Dots */}
            <PinDots value={active} shake={shake} />

            {/* Xato */}
            <AnimatePresence>
              {errMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center text-sm text-red-400 font-semibold -mt-4 mb-4"
                >
                  {errMsg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Keyboard */}
            <NumPad onKey={handleKey} />

            {/* Test hint */}
            {step === "current" && (
              <p className={`text-xs text-center mt-5 ${muted}`}>
                Test PIN: <span className="font-bold text-[#FFD100]">{MOCK_PIN}</span>
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }} className="text-center space-y-4 pt-8">
            <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center mx-auto">
              <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
                <path d="M2 14l9 9L30 2" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={`text-xl font-bold ${main}`}>Muvaffaqiyatli!</h2>
            <p className={`text-sm ${muted}`}>PIN o&apos;zgartirildi. Sozlamalar sahifasiga qaytilmoqda...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
