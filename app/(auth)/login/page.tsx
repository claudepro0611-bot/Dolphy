"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const isValid = email.includes("@") && password.length >= 6;

  async function login() {
    if (!isValid) return;
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log("login data:", data);
    console.log("login error:", error);
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "Email yoki parol noto'g'ri"
        : error.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="text-3xl font-bold text-white mb-2">Xush kelibsiz</h1>
      <p className="text-white/40 text-sm mb-8">Hisobingizga kiring</p>

      <div className="space-y-3 mb-4">
        {/* Email */}
        <div className={`flex items-center border rounded-2xl h-14 transition-colors ${
          error ? "border-red-500/60 bg-red-500/5" : "border-white/15 bg-white/5 focus-within:border-[#FFD100]/60"
        }`}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && login()}
            autoFocus
            className="flex-1 bg-transparent px-4 text-white text-sm placeholder:text-white/25 outline-none"
          />
        </div>

        {/* Parol */}
        <div className={`flex items-center border rounded-2xl h-14 transition-colors ${
          error ? "border-red-500/60 bg-red-500/5" : "border-white/15 bg-white/5 focus-within:border-[#FFD100]/60"
        }`}>
          <input
            type="password"
            placeholder="Parol"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && login()}
            className="flex-1 bg-transparent px-4 text-white text-sm placeholder:text-white/25 outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Kirish tugma */}
      <button
        onClick={login}
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
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
            </svg>
            Kirilmoqda...
          </span>
        ) : (
          "Kirish →"
        )}
      </button>

      {/* Register link */}
      <p className="text-center text-white/35 text-sm">
        Hisob yo&apos;qmi?{" "}
        <Link href="/signup" className="text-[#FFD100] font-semibold hover:underline">
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </motion.div>
  );
}
