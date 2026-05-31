"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  role?: string;
  is_blocked?: boolean;
  created_at: string;
}

const ROLE_STYLE: Record<string, { label: string; color: string }> = {
  driver: { label: "Haydovchi", color: "#4F8EF7" },
  client: { label: "Mijoz",     color: "#A78BFA" },
};

const card  = "dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl";
const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"all" | "driver" | "client">("all");
  const [blocking, setBlocking] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
    const ch = supabase
      .channel("admin-users")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, fetchUsers)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data);
    if (error) console.error("users fetch:", error.message);
    setLoading(false);
  }

  async function toggleBlock(user: User) {
    setBlocking(prev => ({ ...prev, [user.id]: true }));
    const { error } = await supabase
      .from("users")
      .update({ is_blocked: !user.is_blocked })
      .eq("id", user.id);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_blocked: !u.is_blocked } : u));
    }
    setBlocking(prev => ({ ...prev, [user.id]: false }));
  }

  const filtered = users.filter(u => tab === "all" || u.role === tab);
  const driverCount = users.filter(u => u.role === "driver").length;
  const clientCount = users.filter(u => u.role === "client").length;

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className={`text-2xl font-bold ${main}`}>Foydalanuvchilar</h1>
        <p className={`${muted} text-sm`}>{loading ? "Yuklanmoqda..." : `${users.length} ta foydalanuvchi`}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {[
          { key: "all",    label: `Barchasi (${users.length})` },
          { key: "driver", label: `Haydovchilar (${driverCount})` },
          { key: "client", label: `Mijozlar (${clientCount})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === t.key
                ? "bg-[#C8F135] text-black"
                : `dark:bg-white/5 bg-gray-100 dark:border-white/10 border border-gray-200 ${muted} hover:dark:text-white hover:text-gray-900`
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Jadval */}
      <div className={`${card} overflow-hidden shadow-sm`}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#C8F135]/30 border-t-[#C8F135] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className={`${muted} text-sm text-center py-10`}>Foydalanuvchi topilmadi</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="dark:border-b dark:border-white/8 border-b border-gray-100">
                {["Foydalanuvchi", "Email/Telefon", "Rol", "Holat", "Qo'shilgan", "Amal"].map(h => (
                  <th key={h} className={`px-4 py-3 text-left dark:text-white/25 text-gray-400 text-xs font-bold uppercase tracking-wider first:pl-5 last:pr-5`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rl = ROLE_STYLE[u.role ?? "client"] ?? { label: u.role ?? "—", color: "#888" };
                const isBlocked = u.is_blocked ?? false;
                const displayName = u.full_name || u.email?.split("@")[0] || u.id.slice(0, 8);
                return (
                  <tr key={u.id} className={`hover:dark:bg-white/[0.025] hover:bg-gray-50 transition-colors ${i < filtered.length - 1 ? "dark:border-b dark:border-white/5 border-b border-gray-100" : ""}`}>
                    <td className="pl-5 pr-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: rl.color + "20", color: rl.color }}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className={`${main} text-sm font-semibold`}>{displayName}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3.5 ${muted} text-xs`}>
                      {u.email || u.phone || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: rl.color, backgroundColor: rl.color + "18" }}>
                        {rl.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                        color: isBlocked ? "#EF4444" : "#22C55E",
                        backgroundColor: isBlocked ? "#EF444418" : "#22C55E18",
                      }}>
                        {isBlocked ? "Bloklangan" : "Faol"}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 ${muted} text-xs`}>
                      {new Date(u.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 pr-5 py-3.5">
                      <button
                        onClick={() => toggleBlock(u)}
                        disabled={blocking[u.id]}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 ${
                          isBlocked
                            ? "border-green-500/30 text-green-500 hover:bg-green-500/10"
                            : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                        }`}>
                        {blocking[u.id] ? "..." : isBlocked ? "Aktivlash" : "Bloklash"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
