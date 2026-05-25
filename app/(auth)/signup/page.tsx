"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const isValid = name.trim().length >= 2 && email.includes("@") && password.length >= 6;

  async function register() {
    if (!isValid) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) {
      setError(error.message === "User already registered"
        ? "Bu email allaqachon ro'yxatdan o'tgan"
        : error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  const fields = [
    { id: "name",  type: "text",     placeholder: "Ism",                       value: name,     set: setName     },
    { id: "email", type: "email",    placeholder: "Email",                      value: email,    set: setEmail    },
    { id: "pass",  type: "password", placeholder: "Parol (kamida 6 ta belgi)",  value: password, set: setPassword },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="text-3xl font-bold text-white mb-2">Hisob yaratish</h1>
      <p className="text-white/40 text-sm mb-8">Ro&apos;yxatdan o&apos;ting</p>

      <div className="space-y-3 mb-4">
        {fields.map(f => (
          <div key={f.id} className={`flex items-center border rounded-2xl h-14 transition-colors ${
            error ? "border-red-500/60 bg-red-500/5" : "border-white/15 bg-white/5 focus-within:border-[#FFD100]/60"
          }`}>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={f.value}
              onChange={e => { f.set(e.target.value as never); setError(""); }}
              onKeyDown={e => e.key === "Enter" && register()}
              className="flex-1 bg-transparent px-4 text-white text-sm placeholder:text-white/25 outline-none"
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        onClick={register}
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
            Yuklanmoqda...
          </span>
        ) : (
          "Ro'yxatdan o'tish →"
        )}
      </button>

      <p className="text-center text-white/35 text-sm">
        Hisob bormi?{" "}
        <Link href="/login" className="text-[#FFD100] font-semibold hover:underline">
          Kirish
        </Link>
      </p>
    </motion.div>
  );
}
