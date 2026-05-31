'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTelegram } from '@/hooks/useTelegram'

export default function TgDriverProfilePage() {
  const router = useRouter()
  const { tg, firstName, user } = useTelegram()
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)

  useEffect(() => {
    if (tg) tg.BackButton.show()

    supabase.from('orders')
      .select('price', { count: 'exact' })
      .eq('status', 'delivered')
      .then(({ data, count }) => {
        setTotalOrders(count ?? 0)
        setTotalEarned((data ?? []).reduce((s: number, o: any) => s + (o.price || 0), 0))
      })
  }, [tg])

  function logout() {
    localStorage.removeItem('tg_role')
    localStorage.removeItem('tg_driver_online')
    router.replace('/tg')
  }

  const username = user?.username ? `@${user.username}` : `ID: ${user?.id ?? '—'}`

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', maxWidth: 430, margin: '0 auto', padding: '20px 16px', paddingBottom: 90 }}>

      {/* Avatar + ism */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: '#1A1A1A', border: '1px solid #2A2A2A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 700, color: '#C8F135', flexShrink: 0,
        }}>
          {firstName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>{firstName}</p>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>{username}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '4px 10px', background: '#0D2010', border: '1px solid #1a4020', borderRadius: 100 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ color: '#22C55E', fontSize: 11, fontWeight: 600 }}>Faol haydovchi</span>
          </div>
        </div>
      </div>

      {/* Statistika */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Bajarilgan', value: totalOrders.toString(), unit: 'zakaz' },
          { label: 'Daromad',    value: `${(totalEarned / 1000).toFixed(0)}K`, unit: "so'm" },
        ].map(s => (
          <div key={s.label} style={{ background: '#111', borderRadius: 16, padding: '16px' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: '#C8F135', lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: '#555', fontSize: 11, marginTop: 4 }}>{s.unit}</p>
            <p style={{ color: '#777', fontSize: 12, marginTop: 2, fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div style={{ background: '#111', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
        {[
          { label: 'Zakazlar',  href: '/tg/driver/orders'   },
          { label: 'Daromad',   href: '/tg/driver/earnings'  },
          { label: 'Dashboard', href: '/tg/driver'            },
        ].map((item, i, arr) => (
          <button key={item.label} onClick={() => router.push(item.href)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', background: 'none', border: 'none', borderBottom: i < arr.length - 1 ? '1px solid #1A1A1A' : 'none',
            color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
          }}>
            <span>{item.label}</span>
            <span style={{ color: '#333', fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>

      {/* Chiqish */}
      <button onClick={logout} style={{
        width: '100%', padding: '14px', background: '#1E1E1E', color: '#ff4444',
        fontWeight: 600, borderRadius: 12, border: '0.5px solid #ff4444', cursor: 'pointer', fontSize: 15,
      }}>
        Chiqish
      </button>
    </div>
  )
}
