"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { TgThemeCtx } from "./tg-theme-ctx";

const CLIENT_NAV = [
  {
    href: "/tg/client",
    label: "Bosh",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
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

const DRIVER_NAV = [
  {
    href: "/tg/driver",
    label: "Bosh",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/tg/driver/orders",
    label: "Zakazlar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 8h8M6 11h8M6 14h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/tg/driver/earnings",
    label: "Daromad",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3v14M7 7h4.5a2 2 0 0 1 0 4H8a2 2 0 0 0 0 4H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/tg/driver/profile",
    label: "Profil",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 18c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const ROOT_PATHS = ["/tg", "/tg/client", "/tg/driver"];

export default function TgLayout({ children }: { children: React.ReactNode }) {
  const { tg, colorScheme } = useTelegram();
  const path = usePathname();

  const [isDark, setIsDark] = useState(true);
  const [role,   setRole]   = useState<"client" | "driver" | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("tg_role") as "client" | "driver" | null;
    setRole(r);
  }, [path]);

  useEffect(() => {
    if (!tg) return;
    setIsDark(colorScheme !== "light");
  }, [tg, colorScheme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    if (!tg) return;
    if (ROOT_PATHS.includes(path)) {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }
  }, [tg, path]);

  const isRolePage   = path === "/tg";
  const isFullScreen = path === "/tg/client";
  const nav = role === "driver" ? DRIVER_NAV : CLIENT_NAV;

  return (
    <TgThemeCtx.Provider value={{ isDark, setIsDark }}>
      <div className={`flex flex-col min-h-screen w-full bg-background text-foreground ${isDark ? "tg-dark dark" : ""}`}>

        {/* Header */}
        {!isFullScreen && (
          <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-card/95 backdrop-blur-md border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#C8F135] flex items-center justify-center text-black font-black text-xs">D</div>
              <span className="font-bold text-sm tracking-tight text-foreground">Dolphy</span>
              <span className="text-muted-foreground text-xs font-medium">Mini App</span>
            </div>
            {role && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: role === "driver" ? "#C8F135" : "#4F8EF720", color: role === "driver" ? "#000" : "#4F8EF7" }}>
                {role === "driver" ? "Haydovchi" : "Mijoz"}
              </span>
            )}
          </header>
        )}

        {/* Content */}
        <main className={`flex-1 overflow-y-auto ${isRolePage || isFullScreen ? "" : "pb-20"}`}>
          {children}
        </main>

        {/* Bottom nav */}
        {!isRolePage && !isFullScreen && (
          <nav className="fixed bottom-0 left-0 w-full z-50 bg-card/95 backdrop-blur-md border-t border-border">
            <div className="flex items-center justify-around h-16 px-2">
              {nav.map(item => {
                const rootPaths = ["/tg/client", "/tg/driver"];
                const active = path === item.href || (!rootPaths.includes(item.href) && path.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                      active ? "text-[#C8F135]" : "text-muted-foreground"
                    }`}>
                    {item.icon}
                    <span className={`text-[9px] font-bold leading-none ${active ? "text-[#C8F135]" : ""}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </TgThemeCtx.Provider>
  );
}
