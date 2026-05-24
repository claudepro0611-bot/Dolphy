'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore } from '@/store/onboarding'

const CODE_LENGTH  = 6
const MOCK_CODE    = '123456'
const TIMER_START  = 120   // 2:00

export default function VerifyOtpPage() {
  const router    = useRouter()
  const phone     = useOnboardingStore(s => s.phone)
  const setStep   = useOnboardingStore(s => s.setCurrentStep)

  const [digits,   setDigits]   = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading,  setLoading]  = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [shake,    setShake]    = useState(false)
  const [timer,    setTimer]    = useState(TIMER_START)
  const [canResend,setCanResend]= useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // MUZLATILGAN — kerak bo'lganda yoqiladi
  // useEffect(() => {
  //   if (!phone) router.push('/register')
  // }, [phone, router])

  // Countdown
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return }
    const id = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timer])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const fullCode = digits.join('')

  // Auto-submit when complete
  useEffect(() => {
    if (fullCode.length === CODE_LENGTH) verify(fullCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullCode])

  const triggerShake = useCallback(() => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }, [])

  async function verify(code: string) {
    if (loading) return
    setLoading(true)
    setErrorMsg('')

    await new Promise(r => setTimeout(r, 800))

    if (attempts >= 2) {
      setErrorMsg("Qayta SMS yuboring")
      setLoading(false)
      return
    }

    if (code !== MOCK_CODE) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setErrorMsg(newAttempts >= 3 ? "Qayta SMS yuboring" : "Kod noto'g'ri")
      triggerShake()
      setDigits(Array(CODE_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
      setLoading(false)
      return
    }

    // To'g'ri
    setStep(3)
    router.push('/personal-info')
  }

  function handleChange(idx: number, val: string) {
    const char = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = char
    setDigits(next)
    setErrorMsg('')
    if (char && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits]; next[idx] = ''; setDigits(next)
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus()
        const next = [...digits]; next[idx - 1] = ''; setDigits(next)
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0)             inputRefs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < CODE_LENGTH - 1) inputRefs.current[idx + 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    const next   = Array(CODE_LENGTH).fill('')
    pasted.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  function resend() {
    setTimer(TIMER_START)
    setCanResend(false)
    setAttempts(0)
    setErrorMsg('')
    setDigits(Array(CODE_LENGTH).fill(''))
    inputRefs.current[0]?.focus()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4"
    >
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Icon */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F5C518]/15 border-2 border-[#F5C518]/30 flex items-center justify-center mx-auto mb-4">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="text-[#F5C518]">
              <rect x="6" y="2" width="14" height="22" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M10 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            SMS kod yuborildi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{phone}</span>
            {' '}raqamiga 6 xonali kod yuborildi
          </p>
        </div>

        {/* OTP Boxes */}
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex gap-2.5 justify-center"
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={e => e.target.select()}
              disabled={loading}
              className={[
                'w-11 h-14 rounded-xl text-center text-xl font-bold transition-all duration-200 outline-none',
                'border-2',
                d
                  ? 'border-[#F5C518] bg-[#F5C518]/10 text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white',
                'focus:border-[#F5C518] focus:bg-[#F5C518]/10',
                'disabled:opacity-50',
              ].join(' ')}
            />
          ))}
        </motion.div>

        {/* Xato xabar */}
        <AnimatePresence>
          {errorMsg && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-red-500 font-medium -mt-2"
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 -mt-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#F5C518] rounded-full animate-spin" />
            Tekshirilmoqda...
          </div>
        )}

        {/* Timer + Qayta yuborish */}
        <div className="text-center">
          {!canResend ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Qayta yuborish:{' '}
              <span className="font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                {formatTime(timer)}
              </span>
            </p>
          ) : (
            <button
              onClick={resend}
              className="text-sm font-semibold text-[#F5C518] hover:text-[#E6B800] transition-colors underline underline-offset-2"
            >
              Qayta SMS yuborish
            </button>
          )}
        </div>

        {/* Back */}
        <button
          onClick={() => router.push('/register')}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors text-center"
        >
          ← Raqamni o&apos;zgartirish
        </button>
      </div>
    </motion.div>
  )
}
