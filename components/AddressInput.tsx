'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Suggestion {
  title: string
  subtitle: string
  lat: number
  lng: number
}

interface AddressInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSelect: (address: string, lat: number, lng: number) => void
  pinColor?: 'green' | 'red'
}

// ── Nominatim (OpenStreetMap) — fallback, API key shart emas ──────────────────
async function nominatimSearch(q: string): Promise<Suggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ' Uzbekistan')}&countrycodes=uz&limit=5&addressdetails=1`
  const res  = await fetch(url, { headers: { 'Accept-Language': 'uz,ru' } })
  const data = await res.json()
  return data.map((item: any) => {
    const a     = item.address ?? {}
    const parts = [a.road, a.suburb, a.city_district, a.city].filter(Boolean)
    const title = parts.slice(0, 2).join(', ') || item.display_name.split(',')[0]
    const sub   = [a.city, a.state].filter(Boolean).join(', ')
    return {
      title,
      subtitle: sub,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }
  })
}

// ── Yandex Geocoder — agar key to'g'ri bo'lsa ishlatiladi ────────────────────
async function yandexSearch(q: string, apiKey: string): Promise<Suggestion[]> {
  const url  = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(q + ' Uzbekistan')}&format=json&results=5&lang=uz_UZ`
  const res  = await fetch(url)

  if (res.status === 403) {
    console.warn('[AddressInput] Yandex 403 — kalitni tekshiring. Nominatim ga o\'tilmoqda.')
    return []
  }
  if (!res.ok) {
    console.warn('[AddressInput] Yandex', res.status, '— Nominatim ga o\'tilmoqda.')
    return []
  }

  const data  = await res.json()
  const items = data?.response?.GeoObjectCollection?.featureMember ?? []

  if (items.length === 0) return []

  return items.map((item: any) => {
    const obj = item.GeoObject
    const pos = obj.Point.pos.split(' ')
    return {
      title:    obj.name,
      subtitle: obj.description || '',
      lat:      parseFloat(pos[1]),
      lng:      parseFloat(pos[0]),
    }
  })
}

// ── Asosiy komponent ──────────────────────────────────────────────────────────
export function AddressInput({ placeholder, value, onChange, onSelect, pinColor }: AddressInputProps) {
  const [suggestions, setSuggestions]   = useState<Suggestion[]>([])
  const [loading, setLoading]           = useState(false)
  const [open, setOpen]                 = useState(false)
  const [source, setSource]             = useState<'yandex' | 'nominatim' | null>(null)
  const [selected, setSelected]         = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const inputRef                        = useRef<HTMLDivElement>(null)
  const timer                           = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true)
      setSuggestions([])

      const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY

      try {
        // 1. Yandex urinib ko'rish (agar key bor bo'lsa)
        if (apiKey) {
          const results = await yandexSearch(value, apiKey)
          if (results.length > 0) {
            setSuggestions(results)
            setSource('yandex')
            setOpen(true)
            setLoading(false)
            return
          }
        }

        // 2. Nominatim fallback
        const results = await nominatimSearch(value)
        setSuggestions(results)
        setSource('nominatim')
        if (results.length > 0) setOpen(true)

      } catch (e) {
        console.error('[AddressInput] Qidiruv xatosi:', e)
      }

      setLoading(false)
    }, 400)

    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [value])

  useEffect(() => {
    if (inputRef.current && open) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      })
    }
  }, [open, value])

  const dot =
    pinColor === 'green'
      ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
      : pinColor === 'red'
      ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
      : 'bg-white/30'

  return (
    <div ref={inputRef} className="relative">
      {/* Tanlangan manzil chip */}
      {selected ? (
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 border border-white/15 bg-white/8">
          {pinColor && <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />}
          <p className="flex-1 text-white text-sm truncate min-w-0">{value}</p>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              setSelected(false)
              onChange('')
              setSuggestions([])
            }}
            className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0 text-base leading-none"
          >
            ✕
          </button>
        </div>
      ) : (
        /* Input */
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 border border-white/8 bg-white/5 hover:border-white/15 focus-within:border-white/25 focus-within:bg-white/8 transition-all">
          {pinColor && <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />}
          <input
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none min-w-0"
            placeholder={placeholder}
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true) }}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
          />
          {loading && (
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
          )}
          {value && !loading && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(''); setSuggestions([]); setOpen(false) }}
              className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0 text-base leading-none"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Dropdown — Portal orqali document.body ga render */}
      {open && suggestions.length > 0 && typeof window !== 'undefined' &&
        createPortal(
          <div style={{ ...dropdownStyle, background: '#1a1a1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => {
                  const fullAddress = s.title + (s.subtitle ? ', ' + s.subtitle : '')
                  onSelect(fullAddress, s.lat, s.lng)
                  onChange(fullAddress)
                  setSuggestions([])
                  setOpen(false)
                  setSelected(true)
                }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', color: '#fff' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <svg style={{ width: 12, height: 12, marginTop: 2, flexShrink: 0, color: 'rgba(255,255,255,0.25)' }} viewBox="0 0 12 16" fill="currentColor">
                  <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11C11 2.24 8.76 0 6 0zm0 7.5A2.5 2.5 0 1 1 6 2.5a2.5 2.5 0 0 1 0 5z"/>
                </svg>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                  {s.subtitle && (
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subtitle}</p>
                  )}
                </div>
              </button>
            ))}
            {process.env.NODE_ENV === 'development' && source && (
              <div style={{ padding: '6px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: 0 }}>via {source}</p>
              </div>
            )}
          </div>,
          document.body
        )
      }
    </div>
  )
}
