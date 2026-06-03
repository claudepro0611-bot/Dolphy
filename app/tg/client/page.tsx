'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AddressInput } from '@/components/AddressInput'

type VehicleId = 'damas' | 'labo' | 'isuzu' | 'fura'

const VEHICLES: { id: VehicleId; name: string; cap: string }[] = [
  { id: 'damas', name: 'Damas', cap: '1.5 t' },
  { id: 'labo',  name: 'Labo',  cap: '2 t'   },
  { id: 'isuzu', name: 'Isuzu', cap: '5 t'   },
  { id: 'fura',  name: 'Fura',  cap: '20 t'  },
]

export default function TgClientPage() {
  const router = useRouter()

  const [from,    setFrom]    = useState('')
  const [fromLat, setFromLat] = useState<number | null>(null)
  const [fromLng, setFromLng] = useState<number | null>(null)
  const [to,      setTo]      = useState('')
  const [toLat,   setToLat]   = useState<number | null>(null)
  const [toLng,   setToLng]   = useState<number | null>(null)
  const [vehicle, setVehicle] = useState<VehicleId>('damas')
  const [loading, setLoading] = useState(false)

  const isValid = from.trim().length > 2 && to.trim().length > 2

  const handleSubmit = async () => {
    if (!isValid || loading) return
    setLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .insert({
        client_id:    null,
        from_address: from,
        from_lat:     fromLat,
        from_lng:     fromLng,
        to_address:   to,
        to_lat:       toLat,
        to_lng:       toLng,
        vehicle_type: vehicle,
        cargo_type:   'Belgilanmagan',
        cargo_weight: 0,
        status:       'pending',
        driver_id:    null,
      })
      .select()

    setLoading(false)

    if (error || !data?.[0]) {
      alert(error?.message ?? 'Xatolik yuz berdi')
      return
    }

    router.push(`/tg/order/searching?id=${data[0].id}`)
  }

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#C8F135' }}
          >
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5h12M7 1l6 4-6 4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white font-bold text-base tracking-tight">Dolphy</span>
        </div>

        <button
          onClick={() => router.push('/tg/profile')}
          className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3" stroke="white" strokeWidth="1.5"/>
            <path d="M2 17c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Sarlavha */}
      <div className="px-4 pt-4 pb-6">
        <h1 className="text-white text-2xl font-bold">Yuk tashish</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Manzilni kiriting, haydovchi topamiz
        </p>
      </div>

      {/* Manzil inputlar */}
      <div className="px-4 mb-4">
        <div
          className="rounded-2xl overflow-visible"
          style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-4 pt-4 pb-2" style={{ position: 'relative', zIndex: 60 }}>
            <AddressInput
              placeholder="Qayerdan?"
              value={from}
              pinColor="green"
              wrapperZIndex={60}
              onChange={(v) => { setFrom(v); if (!v) { setFromLat(null); setFromLng(null) } }}
              onSelect={(addr, lat, lng) => { setFrom(addr); setFromLat(lat); setFromLng(lng) }}
            />
          </div>

          <div className="flex items-center gap-3 px-5 py-0.5">
            <div className="w-2.5 flex-shrink-0 flex justify-center">
              <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div className="px-4 pb-4 pt-2" style={{ position: 'relative', zIndex: 50 }}>
            <AddressInput
              placeholder="Qayerga?"
              value={to}
              pinColor="red"
              wrapperZIndex={50}
              onChange={(v) => { setTo(v); if (!v) { setToLat(null); setToLng(null) } }}
              onSelect={(addr, lat, lng) => { setTo(addr); setToLat(lat); setToLng(lng) }}
            />
          </div>
        </div>
      </div>

      {/* Mashina tanlash */}
      <div className="px-4 mb-6">
        <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
          MASHINA TURI
        </p>
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {VEHICLES.map(v => (
            <button
              key={v.id}
              onClick={() => setVehicle(v.id)}
              className="flex-shrink-0 transition-all active:scale-95"
              style={{
                padding: '9px 16px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                border: vehicle === v.id ? '1px solid #C8F135' : '1px solid rgba(255,255,255,0.10)',
                background: vehicle === v.id ? '#C8F135' : 'rgba(255,255,255,0.04)',
                color: vehicle === v.id ? '#000' : '#fff',
              }}
            >
              {v.name}
              <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>{v.cap}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zakaz berish tugmasi */}
      <div className="px-4 pb-8">
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full font-bold text-base transition-all active:scale-[0.98]"
          style={{
            padding: '17px 24px',
            borderRadius: 18,
            background: isValid ? '#C8F135' : 'rgba(200,241,53,0.15)',
            color: isValid ? '#000' : 'rgba(255,255,255,0.2)',
            boxShadow: isValid ? '0 4px 24px rgba(200,241,53,0.25)' : 'none',
            cursor: isValid ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Qidirilmoqda...' : 'Zakaz berish'}
        </button>
      </div>
    </div>
  )
}
