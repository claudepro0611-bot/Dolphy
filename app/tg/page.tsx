'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTelegram } from '@/hooks/useTelegram'

const stats = [
  { value: '500+', label: 'Haydovchi' },
  { value: '10K+', label: 'Zakaz' },
  { value: '24/7', label: 'Xizmat' },
]

export default function TgHome() {
  const router = useRouter()
  const { tg } = useTelegram()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    localStorage.removeItem('tg_role')
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const select = (role: 'client' | 'driver') => {
    localStorage.setItem('tg_role', role)
    router.push(`/tg/${role}`)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-5 py-10 overflow-hidden">

      {/* Logo */}
      <div
        className="transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(-16px)',
          transitionDelay: '0ms',
        }}
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
          style={{
            background: '#C8F135',
            boxShadow: '0 0 40px rgba(200,241,53,0.45), 0 0 80px rgba(200,241,53,0.15)',
          }}
        >
          <span className="text-3xl font-bold text-black">D</span>
        </div>
      </div>

      {/* Title */}
      <div
        className="text-center mb-8 transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transitionDelay: '80ms',
        }}
      >
        <h1 className="text-white text-[32px] font-bold tracking-tight leading-none mb-2">Dolphy</h1>
        <p className="text-white/40 text-sm">O'zbekistondagi eng tez yuk tashish</p>
      </div>

      {/* Stats */}
      <div
        className="w-full max-w-[360px] grid grid-cols-3 gap-2 mb-8 transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transitionDelay: '160ms',
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center py-3 rounded-2xl border border-white/10 bg-white/[0.03]"
          >
            <span className="text-[#C8F135] text-lg font-bold leading-none mb-1">{s.value}</span>
            <span className="text-white/40 text-[11px]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="w-full max-w-[360px] flex flex-col gap-3">
        {/* Mijoz */}
        <button
          onClick={() => select('client')}
          className="w-full flex items-center justify-between px-5 py-5 rounded-2xl text-left transition-all duration-700 ease-out active:scale-[0.98]"
          style={{
            background: '#C8F135',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: '240ms',
          }}
        >
          <div>
            <div className="text-black text-base font-bold leading-none mb-1">Mijoz</div>
            <div className="text-black/50 text-xs">Zakaz bering</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-black/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>

        {/* Haydovchi */}
        <button
          onClick={() => select('driver')}
          className="w-full flex items-center justify-between px-5 py-5 rounded-2xl text-left border border-white/10 transition-all duration-700 ease-out active:scale-[0.98]"
          style={{
            background: '#141414',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: '320ms',
          }}
        >
          <div>
            <div className="text-white text-base font-bold leading-none mb-1">Haydovchi</div>
            <div className="text-white/40 text-xs">Pul ishlang</div>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(200,241,53,0.12)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#C8F135" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}
