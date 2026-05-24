"use client";

import { useState } from "react";

const USERS = [
  { id:"USR-001", name:"Jasur Toshmatov",   phone:"+998 90 123 45 67", role:"driver", orders:342, status:"active",   joined:"Jan 2025" },
  { id:"USR-002", name:"Malika Yusupova",   phone:"+998 91 234 56 78", role:"client", orders:12,  status:"active",   joined:"Feb 2025" },
  { id:"USR-003", name:"Bobur Aliyev",      phone:"+998 93 345 67 89", role:"driver", orders:198, status:"active",   joined:"Dec 2024" },
  { id:"USR-004", name:"Nilufar Karimova",  phone:"+998 94 456 78 90", role:"client", orders:5,   status:"blocked",  joined:"Mar 2025" },
  { id:"USR-005", name:"Sanjar Mirzayev",   phone:"+998 95 567 89 01", role:"driver", orders:276, status:"active",   joined:"Nov 2024" },
  { id:"USR-006", name:"Dilorom Ergasheva", phone:"+998 97 678 90 12", role:"client", orders:8,   status:"active",   joined:"Apr 2025" },
  { id:"USR-007", name:"Akbar Nazarov",     phone:"+998 99 789 01 23", role:"driver", orders:45,  status:"inactive", joined:"May 2025" },
];

type UStatus = "active" | "blocked" | "inactive";

const ROLE_STYLE:   Record<string, { label: string; color: string }> = {
  driver: { label: "Haydovchi", color: "#4F8EF7" },
  client: { label: "Mijoz",     color: "#A78BFA" },
};
const STATUS_STYLE: Record<UStatus, { label: string; color: string }> = {
  active:   { label: "Faol",       color: "#22C55E" },
  blocked:  { label: "Bloklangan", color: "#EF4444" },
  inactive: { label: "Nofaol",     color: "#9CA3AF" },
};

const card  = "dark:bg-white/[0.03] bg-white dark:border-white/10 border border-gray-200 rounded-2xl";
const main  = "dark:text-white text-gray-900";
const muted = "dark:text-white/40 text-gray-500";

export default function AdminUsersPage() {
  const [tab, setTab]           = useState<"all"|"driver"|"client">("all");
  const [statuses, setStatuses] = useState<Record<string, UStatus>>(
    Object.fromEntries(USERS.map(u => [u.id, u.status as UStatus]))
  );

  const filtered = USERS.filter(u => tab === "all" || u.role === tab);

  function toggle(id: string) {
    setStatuses(prev => ({ ...prev, [id]: prev[id] === "active" ? "blocked" : "active" }));
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className={`text-2xl font-bold ${main}`}>Foydalanuvchilar</h1>
        <p className={`${muted} text-sm`}>{USERS.length} ta foydalanuvchi</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {[
          { key:"all",    label:`Barchasi (${USERS.length})` },
          { key:"driver", label:`Haydovchilar (${USERS.filter(u=>u.role==="driver").length})` },
          { key:"client", label:`Mijozlar (${USERS.filter(u=>u.role==="client").length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === t.key
                ? "bg-[#FFD100] text-black"
                : `dark:bg-white/5 bg-gray-100 dark:border-white/10 border border-gray-200 ${muted} hover:dark:text-white hover:text-gray-900`
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Jadval */}
      <div className={`${card} overflow-hidden shadow-sm`}>
        <table className="w-full">
          <thead>
            <tr className="dark:border-b dark:border-white/8 border-b border-gray-100">
              {["Foydalanuvchi","Telefon","Rol","Zakazlar","Holat","Qo'shilgan","Amal"].map(h => (
                <th key={h} className={`px-4 py-3 text-left dark:text-white/25 text-gray-400 text-xs font-bold uppercase tracking-wider first:pl-5 last:pr-5`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const st = STATUS_STYLE[statuses[u.id]];
              const rl = ROLE_STYLE[u.role];
              return (
                <tr key={u.id} className={`hover:dark:bg-white/[0.025] hover:bg-gray-50 transition-colors ${i < filtered.length-1 ? "dark:border-b dark:border-white/5 border-b border-gray-100":""}`}>
                  <td className="pl-5 pr-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: rl.color+"20", color: rl.color }}>
                        {u.name.charAt(0)}
                      </div>
                      <span className={`${main} text-sm font-semibold`}>{u.name}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3.5 ${muted} text-xs`}>{u.phone}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: rl.color, backgroundColor: rl.color+"18" }}>{rl.label}</span>
                  </td>
                  <td className={`px-4 py-3.5 ${main} text-sm font-bold`}>{u.orders}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.color+"18" }}>{st.label}</span>
                  </td>
                  <td className={`px-4 py-3.5 ${muted} text-xs`}>{u.joined}</td>
                  <td className="px-4 pr-5 py-3.5">
                    <button onClick={() => toggle(u.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                        statuses[u.id] === "active"
                          ? "border-red-300 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                          : "border-green-300 text-green-600 hover:bg-green-50 dark:border-green-500/30 dark:hover:bg-green-500/10"
                      }`}>
                      {statuses[u.id] === "active" ? "Bloklash" : "Aktivlash"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
