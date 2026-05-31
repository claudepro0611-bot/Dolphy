'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTelegram } from '@/hooks/useTelegram'

type Status = 'accepted' | 'on_way' | 'delivered' | 'cancelled'

interface Order {
  id: string
  from_address: string
  to_address: string
  vehicle_type: string
  price: number
  cargo_type?: string
  status: Status
}

const VEHICLE: Record<string, string> = {
  damas: 'Damas', labo: 'Labo', isuzu: 'Isuzu', fura: 'Fura',
  gazelle: 'Gazelle', medium: "O'rta", kamaz: 'Kamaz',
}

const NEXT_STATUS: Partial<Record<Status, { next: Status; label: string }>> = {
  accepted: { next: 'on_way',    label: "Yo'lga chiqdim" },
  on_way:   { next: 'delivered', label: 'Yetkazib berdim' },
}

const STATUS_LABELS: Record<Status, string> = {
  accepted:  'Qabul qilindi',
  on_way:    "Yo'lda",
  delivered: 'Yetkazildi ✅',
  cancelled: 'Bekor qilindi',
}

export default function TgDriverActivePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { tg } = useTelegram()

  const [order,    setOrder]    = useState<Order | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (tg) {
      tg.BackButton.show()
      tg.BackButton.onClick(() => router.back())
    }
  }, [tg, router])

  useEffect(() => {
    if (!id) return
    supabase.from('orders').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setOrder(data as Order); setLoading(false) })

    const ch = supabase.channel(`tg-active-${id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        ({ new: n }) => setOrder(prev => ({ ...prev, ...n } as Order))
      ).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [id])

  async function advance() {
    if (!order || !NEXT_STATUS[order.status]) return
    const { next } = NEXT_STATUS[order.status]!
    setUpdating(true)
    await supabase.from('orders').update({ status: next }).eq('id', id)
    setOrder(prev => prev ? { ...prev, status: next } : prev)
    setUpdating(false)
    if (next === 'delivered' && tg) tg.showAlert('✅ Zakaz muvaffaqiyatli yetkazildi!')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #C8F135', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!order) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontWeight: 700 }}>Zakaz topilmadi</p>
      <button onClick={() => router.back()} style={{ color: '#C8F135', fontSize: 14 }}>← Orqaga</button>
    </div>
  )

  const nextStep = NEXT_STATUS[order.status]
  const isDone = order.status === 'delivered'
  const isCancelled = order.status === 'cancelled'

  const steps: Status[] = ['accepted', 'on_way', 'delivered']
  const currentIdx = steps.indexOf(order.status)

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: '20px 16px', maxWidth: 430, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: '#C8F135', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Faol zakaz</p>
        <p style={{ color: '#555', fontSize: 12, marginTop: 4 }}>#{id.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              background: i <= currentIdx ? '#C8F135' : '#1A1A1A',
              color: i <= currentIdx ? '#000' : '#444',
              border: i === currentIdx ? '3px solid #C8F135' : 'none',
              boxShadow: i === currentIdx ? '0 0 0 4px rgba(200,241,53,0.15)' : 'none',
            }}>
              {i < currentIdx ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < currentIdx ? '#C8F135' : '#1A1A1A', margin: '0 4px' }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, marginTop: -20 }}>
        {['Qabul', "Yo'lda", 'Yetkazildi'].map((l, i) => (
          <span key={l} style={{ fontSize: 10, color: i <= currentIdx ? '#C8F135' : '#444', fontWeight: i <= currentIdx ? 600 : 400 }}>{l}</span>
        ))}
      </div>

      {/* Marshrut */}
      <div style={{ background: '#111', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
        <p style={{ color: '#555', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Marshrut</p>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', marginTop: 3, flexShrink: 0, boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
          <div>
            <p style={{ color: '#666', fontSize: 10, marginBottom: 2 }}>Olinadi</p>
            <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{order.from_address}</p>
          </div>
        </div>
        <div style={{ width: 1, height: 16, background: '#222', marginLeft: 4, marginBottom: 12 }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', marginTop: 3, flexShrink: 0, boxShadow: '0 0 6px rgba(239,68,68,0.5)' }} />
          <div>
            <p style={{ color: '#666', fontSize: 10, marginBottom: 2 }}>Yetkaziladi</p>
            <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{order.to_address}</p>
          </div>
        </div>
      </div>

      {/* Ma'lumotlar */}
      <div style={{ background: '#111', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        {[
          { label: 'Mashina',  value: VEHICLE[order.vehicle_type] ?? order.vehicle_type },
          ...(order.cargo_type && order.cargo_type !== 'Belgilanmagan' ? [{ label: 'Yuk', value: order.cargo_type }] : []),
          { label: 'Narx', value: `${order.price.toLocaleString()} so'm`, accent: true },
          { label: 'Holat', value: STATUS_LABELS[order.status] },
        ].map((row, i, arr) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px',
            borderBottom: i < arr.length - 1 ? '1px solid #1A1A1A' : 'none',
          }}>
            <span style={{ color: '#555', fontSize: 13 }}>{row.label}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: ('accent' in row && row.accent) ? '#C8F135' : '#fff' }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Tugma */}
      {!isDone && !isCancelled && nextStep && (
        <button onClick={advance} disabled={updating} style={{
          width: '100%', padding: '18px', background: '#C8F135', color: '#000',
          borderRadius: 16, border: 'none', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', opacity: updating ? 0.6 : 1,
          boxShadow: '0 4px 20px rgba(200,241,53,0.25)',
        }}>
          {updating ? 'Yangilanmoqda...' : nextStep.label}
        </button>
      )}

      {isDone && (
        <div>
          <div style={{ background: '#0D2010', border: '1px solid #1a4020', borderRadius: 16, padding: 16, textAlign: 'center', marginBottom: 12 }}>
            <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 15 }}>✅ Muvaffaqiyatli yetkazildi!</p>
          </div>
          <button onClick={() => router.replace('/tg/driver/orders')} style={{
            width: '100%', padding: '16px', background: '#C8F135', color: '#000',
            borderRadius: 16, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
            + Yangi zakaz qidirish
          </button>
        </div>
      )}

      {isCancelled && (
        <div style={{ background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 16, padding: 16, textAlign: 'center' }}>
          <p style={{ color: '#EF4444', fontWeight: 700 }}>Zakaz bekor qilindi</p>
          <button onClick={() => router.replace('/tg/driver/orders')} style={{
            marginTop: 12, color: '#C8F135', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer',
          }}>← Zakazlarga qaytish</button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
