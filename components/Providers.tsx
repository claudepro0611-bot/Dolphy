"use client";

import { ThemeProvider } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";
import { type Lang, t, LANGS } from "@/lib/i18n";

// ── Lang context ────────────────────────────────────────────────────────────
interface LangCtx { lang: Lang; setLang: (l: Lang) => void; tr: (key: string) => string; }
const LangContext = createContext<LangCtx>({ lang: "uz", setLang: () => {}, tr: (k) => k });

export function useLang() { return useContext(LangContext); }

function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && ["uz", "ru", "en"].includes(saved)) setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  function tr(key: string): string {
    return t[lang][key] ?? t["uz"][key] ?? key;
  }

  return (
    <LangContext.Provider value={{ lang, setLang, tr }}>
      {children}
    </LangContext.Provider>
  );
}

// ── Main providers ───────────────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["dark", "light"]}>
      <LangProvider>
        {children}
      </LangProvider>
    </ThemeProvider>
  );
}
