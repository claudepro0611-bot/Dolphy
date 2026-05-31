'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTelegram } from '@/hooks/useTelegram'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

type Filter = 'Bugun' | 'Hafta' | 'Oy'

interface Order {
  id: string
  price: number
  from_address: string
  to_address: string
  created_at: string
  status: string
}

const FILTERS: Filter[] = ['Bugun', 'Hafta', 'Oy']

function getDateFrom(filter: Filter): string {
  const d = new Date()
  if (filter === 'Bugun') d.setHours(0, 0, 0, 0)
  else if (filter === 'Hafta') d.setDate(d.getDate() - 7)
  else d.setDate(d.getDate() - 30)
  return d.toISOString()
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 10, padding: '8px 12px', fontSize: 11 }}>
      <p style={{ color: '#555', marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#C8F135', fontWeight: 700 }}>{(payload[0].value / 1000).toFixed(0)}K so'm</p>
    </div>
  )
}

export default function TgDriverEarningsPage() {
  const { tg } = useTelegram()
  const [filter,  setFilter]  = useState<Filter>('Hafta')
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tg) { tg.BackButton.show() }
  }, [tg])

  useEffect(() => {
    setLoading(true)
    supabase.from('orders')
      .select('id, price, from_address, to_address, created_at, status')
      .eq('status', 'delivered')
      .gte('created_at', getDateFrom(filter))
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? [])
        setLoading(false)
      })
  }, [filter])

  const total   = orders.reduce((s, o) => s + (o.price || 0), 0)
  const count   = orders.length
  const average = count ? Math.round(total / count) : 0

  // Grafik uchun kun/soat bo'yicha guruhlash
  const DAYS_UZ = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
  const chartData = (() => {
    if (filter === 'Bugun') {
      const hours = Array.from({ length: 6 }, (_, i) => {
        const h = i * 4
        const label = `${String(h).padStart(2, '0')}:00`
        const sum = orders.filter(o => {
          const oh = new Date(o.created_at).getHours()
          return oh >= h && oh < h + 4
        }).reduce((s, o) => s + o.price, 0)
        return { label, sum }
      })
      return hours
    }
    if (filter === 'Hafta') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toISOString().split('T')[0]
        const sum = orders.filter(o => o.created_at.startsWith(dateStr)).reduce((s, o) => s + o.price, 0)
        return { label: DAYS_UZ[d.getDay()], sum }
      })
    }
    return Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (3 - i) * 7 - 7)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - (3 - i) * 7)
      const sum = orders.filter(o => {
        const d = new Date(o.created_at)
        return d >= weekStart && d < weekEnd
      }).reduce((s, o) => s + o.price, 0)
      return { label: `${i + 1}-hafta`, sum }
    })
  })()

  function timeStr(iso: string) {
    return new Date(iso).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', maxWidth: 430, margin: '0 auto', paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ color: '#555', fontSize: 12 }}>Haydovchi</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>Daromad</h1>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 16px 0' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filter === f ? '#C8F135' : '#1A1A1A',
            color: filter === f ? '#000' : '#666',
          }}>{f}</button>
        ))}
      </div>

      {/* Jami */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ background: '#111', borderRadius: 20, padding: '20px' }}>
          {loading ? (
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 24, border: '2px solid #C8F135', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <>
              <p style={{ color: '#555', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Jami daromad</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#C8F135', lineHeight: 1 }}>
                {(total / 1000).toFixed(0)}K
                <span style={{ fontSize: 14, color: '#555', fontWeight: 400, marginLeft: 4 }}>so'm</span>
              </p>
              <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                <div>
                  <p style={{ color: '#555', fontSize: 10 }}>Zakazlar</p>
                  <p style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>{count}</p>
                </div>
                <div>
                  <p style={{ color: '#555', fontSize: 10 }}>O'rtacha</p>
                  <p style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>{(average / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grafik */}
      {!loading && chartData.some(d => d.sum > 0) && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ background: '#111', borderRadius: 20, padding: '16px 8px 8px' }}>
            <p style={{ color: '#555', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8 }}>Grafik</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barSize={24}>
                <XAxis dataKey="label" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#444', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="sum" fill="#C8F135" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Oxirgi zakazlar */}
      <div style={{ padding: '16px 16px 0' }}>
        <p style={{ color: '#555', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          So&apos;nggi zakazlar
        </p>
        {loading ? null : orders.length === 0 ? (
          <p style={{ color: '#333', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Bu davrda zakaz yo&apos;q</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {orders.slice(0, 10).map(o => (
              <div key={o.id} style={{ background: '#111', borderRadius: 16, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.from_address}</p>
                    <p style={{ color: '#555', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>→ {o.to_address}</p>
                    <p style={{ color: '#333', fontSize: 11, marginTop: 4 }}>{timeStr(o.created_at)}</p>
                  </div>
                  <p style={{ color: '#C8F135', fontWeight: 700, fontSize: 15, marginLeft: 12, flexShrink: 0 }}>
                    {(o.price / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
