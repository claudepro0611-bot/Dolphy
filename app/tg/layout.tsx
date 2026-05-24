"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { TgThemeCtx } from "./tg-theme-ctx";

const NAV = [
  {
    href: "/tg",
    label: "Bosh",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/tg/order/new",
    label: "Buyurtma",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 8v6M7 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/tg/history",
    label: "Tarix",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 8h8M6 11h8M6 14h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/tg/profile",
    label: "Profil",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 18c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/tg/settings",
    label: "Sozlama",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.1 4.1l1.4 1.4M14.5 14.5l1.4 1.4M4.1 15.9l1.4-1.4M14.5 5.5l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function TgLayout({ children }: { children: React.ReactNode }) {
  const { tg, colorScheme } = useTelegram();
  const path = usePathname();

  // TG-local dark mode state (independent of next-themes)
  const [isDark, setIsDark] = useState(true);

  // Sync Telegram colorScheme → isDark
  useEffect(() => {
    if (!tg) return;
    setIsDark(colorScheme !== "light");
  }, [tg, colorScheme]);

  // Sync isDark → <html class="dark"> (Telegram yoki settings toggle orqali)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // BackButton boshqarish
  useEffect(() => {
    if (!tg) return;
    if (path === "/tg") {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }
  }, [tg, path]);

  return (
    <TgThemeCtx.Provider value={{ isDark, setIsDark }}>
      {/*
        tg-dark class conditionally applied here.
        When present, all children's tg-dark: variant classes activate.
        This is completely independent of next-themes / <html class="dark">.
      */}
      <div className={`flex flex-col min-h-screen w-full ${
        isDark
          ? "tg-dark dark bg-[#0f0f0f] text-white"
          : "bg-[#f5f5f5] text-gray-900"
      }`}>

        {/* Header */}
        <header className="sticky top-0 z-40 h-14 flex items-center px-4
          bg-white/95 tg-dark:bg-[#0f0f0f]/95
          backdrop-blur-md
          border-b border-gray-200 tg-dark:border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F5C518] flex items-center justify-center text-black font-black text-xs">
              Y
            </div>
            <span className="font-bold text-sm tracking-tight">Yotoq</span>
            <span className="text-gray-400 tg-dark:text-white/25 text-xs font-medium">Mini App</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 w-full z-50
          bg-white/95 tg-dark:bg-[#0f0f0f]/95
          backdrop-blur-md
          border-t border-gray-200 tg-dark:border-white/8">
          <div className="flex items-center justify-around h-16 px-2">
            {NAV.map(item => {
              const active = path === item.href || (item.href !== "/tg" && path.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                    active
                      ? "text-[#F5C518]"
                      : "text-gray-400 tg-dark:text-white/30"
                  }`}
                >
                  {item.icon}
                  <span className={`text-[9px] font-bold leading-none ${active ? "text-[#F5C518]" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </TgThemeCtx.Provider>
  );
}
