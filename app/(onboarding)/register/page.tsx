'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RotateCcw, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'

const STEP_LABELS: Record<number, string> = {
  2: "SMS kodi tasdiqlash",
  3: "Shaxsiy ma'lumotlar",
  4: "Hujjatlar",
  5: "Mashina ma'lumotlari",
  6: "Mashina rasmlari",
  7: "To'lov kartasi",
  8: "Ariza yuborildi",
}
const STEP_PATHS: Record<number, string> = {
  2: '/verify-otp',
  3: '/personal-info',
  4: '/documents',
  5: '/vehicle-info',
  6: '/vehicle-photos',
  7: '/bank-card',
  8: '/pending-approval',
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 9)
  let f = ''
  if (d.length > 0)  f = '(' + d.slice(0, 2)
  if (d.length >= 2) f += ') ' + d.slice(2, 5)
  if (d.length >= 5) f += '-' + d.slice(5, 7)
  if (d.length >= 7) f += '-' + d.slice(7, 9)
  return f
}

export default function RegisterPage() {
  const router   = useRouter()
  const setPhone = useOnboardingStore(s => s.setPhone)
  const setStep  = useOnboardingStore(s => s.setCurrentStep)
  const reset    = useOnboardingStore(s => s.reset)

  const [raw,     setRaw]     = useState('')
  const [display, setDisplay] = useState('')
  const [agreed,  setAgreed]  = useState(false)
  const [loading, setLoading] = useState(false)

  // Resume modal holati
  const [showResume,  setShowResume]  = useState(false)
  const [savedStep,   setSavedStep]   = useState(0)
  const [savedPhone,  setSavedPhone]  = useState('')

  // Oldingi session tekshiruvi
  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboarding-storage')
      if (!raw) return
      const { state } = JSON.parse(raw) as { state: { currentStep: number; phone: string } }
      if (state?.currentStep >= 8 && state?.phone) {
        // Ariza yuborilgan — avtomatik pending-approval ga o'tish, modal ko'rsatmasdan
        router.replace('/pending-approval')
        return
      }
      if (state?.currentStep > 1 && state?.phone) {
        setSavedStep(state.currentStep)
        setSavedPhone(state.phone)
        setShowResume(true)
      }
    } catch { /* ignore */ }
  }, [router])

  const isValid = raw.length === 9 && agreed

  function handleInput(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 9)
    setRaw(digits)
    setDisplay(formatPhone(digits))
  }

  async function handleSubmit() {
    if (!isValid) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    const phone = '+998' + raw
    setPhone(phone)
    setStep(2)
    document.cookie = `ob_step=2; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
    router.push('/verify-otp')
  }

  function handleResume() {
    setShowResume(false)
    const path = STEP_PATHS[savedStep] ?? '/verify-otp'
    router.push(path)
  }

  function handleFreshStart() {
    reset()
    // Cookieni ham tozalash
    document.cookie = 'ob_step=0; path=/; max-age=0'
    setShowResume(false)
  }

  return (
    <>
      {/* ===== Resume modal ===== */}
      <AnimatePresence>
        {showResume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={{   scale: 0.9, opacity: 0, y: 16  }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-sm bg-white dark:bg-[#111] rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/10"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#F5C518]/15 flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-[#F5C518]">
                  <rect x="3" y="2" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 8h8M7 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>

              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Saqlangan ariza topildi
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{savedPhone}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Siz{' '}
                <span className="font-semibold text-[#F5C518]">
                  {STEP_LABELS[savedStep] ?? `${savedStep}-qadam`}
                </span>
                gacha to&apos;ldirgan edingiz.
              </p>

              {/* Tugmalar */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleResume}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: '#F5C518', color: '#000' }}
                >
                  <ArrowRight size={16} />
                  Davom etish
                </button>
                <button
                  onClick={handleFreshStart}
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <RotateCcw size={14} />
                  Yangidan boshlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Asosiy sahifa ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4"
      >
        <div className="w-full max-w-sm flex flex-col gap-6">

          {/* Logo + Sarlavha */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F5C518] flex items-center justify-center text-black font-black text-2xl mx-auto mb-5">
              Y
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
              Haydovchi sifatida<br />ro&apos;yxatdan o&apos;ting
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Telefon raqamingizni kiriting
            </p>
          </div>

          {/* Telefon input */}
          <div className={`
            flex items-center border-2 rounded-2xl h-14 transition-all duration-200
            ${raw.length > 0 ? 'border-[#F5C518]' : 'border-gray-200 dark:border-gray-700'}
            bg-gray-50 dark:bg-white/5
          `}>
            <div className="flex items-center gap-2 pl-4 pr-3 border-r border-gray-200 dark:border-gray-700 h-full">
              <span className="font-bold text-sm text-gray-900 dark:text-white tracking-wide">+998</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={display}
              onChange={e => handleInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="(90) 123-45-67"
              autoFocus
              className="flex-1 bg-transparent px-3 text-gray-900 dark:text-white font-semibold text-base placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none"
            />
            {raw.length === 9 && (
              <div className="w-6 h-6 rounded-full bg-[#F5C518] flex items-center justify-center mr-3 flex-shrink-0">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only" />
              <div className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                ${agreed ? 'bg-[#F5C518] border-[#F5C518]' : 'border-gray-300 dark:border-gray-600 group-hover:border-[#F5C518]/60'}
              `}>
                {agreed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <Link href="#" className="text-[#F5C518] font-semibold hover:underline">Foydalanuvchi shartnomasiga</Link>
              {' '}va{' '}
              <Link href="#" className="text-[#F5C518] font-semibold hover:underline">maxfiylik siyosatiga</Link>
              {' '}roziman
            </span>
          </label>

          {/* Davom etish */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full h-14 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: !isValid || loading ? 'rgb(229 231 235)' : '#F5C518',
              color:      !isValid || loading ? undefined : '#000000',
              cursor:     !isValid || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> SMS yuborilmoqda...</>
            ) : (
              'Davom etish →'
            )}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            Allaqachon ro&apos;yxatdan o&apos;tganmisiz?{' '}
            <Link href="/login" className="text-[#F5C518] font-semibold hover:underline">Kirish</Link>
          </p>
        </div>
      </motion.div>
    </>
  )
}
