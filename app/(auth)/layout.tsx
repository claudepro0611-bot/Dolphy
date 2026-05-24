"use client";

import { useLang } from "@/components/Providers";
import { LANGS, type Lang } from "@/lib/i18n";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLang();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFD100] flex items-center justify-center text-black font-black text-sm">Y</div>
            <span className="font-bold text-lg text-white">Yotoq</span>
            <span className="text-white/30 text-sm">Logistics</span>
          </div>
          <div className="flex gap-1">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as Lang)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  lang === l.code
                    ? "bg-[#FFD100] text-black"
                    : "text-white/30 hover:text-white"
                }`}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
