"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useLang } from "@/components/Providers";

const NAV_KEYS = [
  { href: "/order/new", key: "newOrder" },
  { href: "/profile",   key: "profile"  },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { theme, setTheme } = useTheme();
  const { tr } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-background transition-colors">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#C8F135] flex items-center justify-center text-black font-black text-sm">D</div>
              <span className="font-bold text-foreground">Dolphy</span>
            </div>
            <div className="flex items-center gap-0.5">
              {NAV_KEYS.map(item => {
                const active = path === item.href || (item.href !== "/order/new" && item.href !== "/dashboard" && path.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}>
                    {tr(item.key)}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                title={isDark ? "Kunduzgi rejim" : "Qorong'u rejim"}
              >
                {isDark ? (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M7.5 1v1M7.5 13v1M1 7.5h1M13 7.5h1M2.9 2.9l.7.7M11.4 11.4l.7.7M2.9 12.1l.7-.7M11.4 3.6l.7-.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M12 8.5A6 6 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            )}
            <Link href="/order/new"
              className="bg-[#C8F135] text-black font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#b3d92f] transition-colors">
              + {tr("newOrder")}
            </Link>
          </div>
        </div>
      </nav>
      {path === "/order/new" ? children : (
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      )}
    </div>
  );
}
