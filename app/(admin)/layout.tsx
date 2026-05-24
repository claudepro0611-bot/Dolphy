"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useLang } from "@/components/Providers";
import { LANGS, type Lang } from "@/lib/i18n";

const NAV_ITEMS = [
  { href: "/admin",         label: "Dashboard",        icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg> },
  { href: "/admin/orders",  label: "Zakazlar",         icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { href: "/admin/users",   label: "Foydalanuvchilar", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 14c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 7l1.5 1.5L15 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: "/admin/stats",   label: "Statistika",       icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12L5 8l3 2 3-5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: "/admin/pricing", label: "Narxlar",          icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M5 5h4.5a1.5 1.5 0 0 1 0 3H6a1.5 1.5 0 0 0 0 3H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path   = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  }
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen dark:bg-black bg-gray-50 flex transition-colors">

      {/* ── Sidebar ── */}
      <aside className="w-56 flex flex-col fixed h-full z-20
        dark:bg-black bg-white
        dark:border-r dark:border-white/8 border-r border-gray-200
        transition-colors">

        {/* Logo */}
        <div className="px-5 h-16 flex items-center gap-2.5
          dark:border-b dark:border-white/8 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-[#FFD100] flex items-center justify-center text-black font-black text-sm">Y</div>
          <div>
            <p className="font-bold text-sm dark:text-white text-gray-900 leading-none">Yotoq</p>
            <p className="text-[10px] dark:text-white/30 text-gray-400 mt-0.5">Admin panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = path === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#FFD100]/15 text-[#FFD100] dark:text-[#FFD100]"
                    : "dark:text-white/40 text-gray-500 hover:dark:text-white hover:text-gray-900 hover:dark:bg-white/5 hover:bg-gray-50"
                }`}>
                <span className={active ? "text-[#FFD100]" : "dark:text-white/25 text-gray-400"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 pt-3 dark:border-t dark:border-white/8 border-t border-gray-100 space-y-3">

          {/* Til */}
          <div className="flex gap-1 px-1">
            {LANGS.map(l => (
              <button key={l.code} onClick={() => setLang(l.code as Lang)}
                title={l.label}
                className={`flex-1 text-xs py-1.5 rounded-lg font-bold transition-all ${
                  lang === l.code
                    ? "bg-[#FFD100] text-black"
                    : "dark:text-white/30 text-gray-400 hover:dark:text-white hover:text-gray-700 dark:hover:bg-white/5 hover:bg-gray-100"
                }`}>
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme */}
          {mounted && (
            <button onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold
                dark:text-white/40 text-gray-500
                hover:dark:text-white hover:text-gray-900
                hover:dark:bg-white/5 hover:bg-gray-50
                transition-all">
              <span className="dark:text-white/25 text-gray-400">
                {isDark
                  ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1v1M7.5 13v1M1 7.5h1M13 7.5h1M2.9 2.9l.7.7M11.4 11.4l.7.7M2.9 12.1l.7-.7M11.4 3.6l.7-.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M12 8.5A6 6 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                }
              </span>
              {isDark ? "Kunduzgi" : "Qorong'u"}
            </button>
          )}

          {/* Chiqish */}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold
              dark:text-white/40 text-gray-500
              hover:dark:text-white hover:text-gray-900
              hover:dark:bg-white/5 hover:bg-gray-50
              transition-all">
            <span className="dark:text-white/25 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Chiqish
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-56 flex-1 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between px-8 sticky top-0 z-10
          dark:bg-black/95 bg-white/95 backdrop-blur-md
          dark:border-b dark:border-white/8 border-b border-gray-200
          transition-colors">
          <p className="dark:text-white/40 text-gray-500 text-sm font-medium">
            {NAV_ITEMS.find(n => n.href === path)?.label ?? "Admin panel"}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2
              dark:border dark:border-white/10 border border-gray-200
              dark:bg-white/[0.03] bg-gray-50
              px-3 py-1.5 rounded-full">
              <div className="w-5 h-5 rounded-full bg-[#FFD100] flex items-center justify-center text-black font-black text-[10px]">A</div>
              <span className="dark:text-white/60 text-gray-600 text-xs font-semibold">Admin</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
