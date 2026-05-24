'use client'
import { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ClipboardList, Clock, CheckCircle2, Loader2, Circle, ArrowRight, Truck } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'

// Stagger variants
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 1.2 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// phase: 0 = reviewing | 1 = checking | 2 = activating | 3 = approved
type Phase = 0 | 1 | 2 | 3

function getTimeline(phase: Phase) {
  return [
    {
      label: 'Ariza yuborildi',
      state: 'done' as const,
    },
    {
      label: "Ko'rib chiqilmoqda",
      state: (phase >= 1 ? 'done' : 'active') as 'done' | 'active' | 'pending',
    },
    {
      label: 'Tasdiqlash',
      state: (phase >= 2 ? 'done' : phase === 1 ? 'active' : 'pending') as 'done' | 'active' | 'pending',
    },
    {
      label: 'Faollashtirish',
      state: (phase >= 3 ? 'done' : phase === 2 ? 'active' : 'pending') as 'done' | 'active' | 'pending',
    },
  ]
}

function TimelineIcon({ state }: { state: 'done' | 'active' | 'pending' }) {
  if (state === 'done')   return <CheckCircle2 size={14} className="text-green-500" />
  if (state === 'active') return <Loader2 size={14} className="text-[#F5C518] animate-spin" />
  return <Circle size={14} className="text-gray-300 dark:text-gray-600" />
}

function AnimatedCheck({ approved }: { approved: boolean }) {
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="45" stroke={approved ? '#22c55e' : '#F5C518'} strokeWidth="3" opacity="0.15" />
        <motion.circle
          cx="50" cy="50" r="45"
          stroke={approved ? '#22c55e' : '#F5C518'} strokeWidth="3.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: '50% 50%' }}
        />
        <motion.path
          d="M27 51 L42 66 L73 35"
          stroke={approved ? '#22c55e' : '#F5C518'} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.8, ease: 'easeOut' }}
        />
      </svg>
    </div>
  )
}

export default function PendingApprovalPage() {
  const router       = useRouter()
  const phone        = useOnboardingStore(s => s.phone)
  const personalInfo = useOnboardingStore(s => s.personalInfo)

  // MUZLATILGAN — kerak bo'lganda yoqiladi
  // const bankCard = useOnboardingStore(s => s.bankCard)
  // useEffect(() => {
  //   if (!bankCard) router.push('/bank-card')
  // }, [bankCard, router])

  const [phase, setPhase] = useState<Phase>(0)

  // Mock tasdiqlash simulatsiyasi (dev rejimi)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2500)   // ko'rib chiqildi
    const t2 = setTimeout(() => setPhase(2), 4500)   // tasdiqlash
    const t3 = setTimeout(() => setPhase(3), 6500)   // faollashtirish → tasdiqlandi!
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const approved = phase === 3

  const appNumber = useMemo(
    () => `#DR-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`,
    []
  )

  const submittedAt = useMemo(() => {
    const now = new Date()
    return now.toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }, [])

  const firstName = personalInfo?.firstName ?? ''
  const formatPhone = (p: string) => {
    const d = p.replace(/\D/g, '')
    if (d.length === 12)
      return `+${d.slice(0,3)} ${d.slice(3,5)} ${d.slice(5,8)}-${d.slice(8,10)}-${d.slice(10)}`
    return p
  }

  const timeline = getTimeline(phase)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white dark:bg-black">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Animatsion check */}
        <motion.div
          key={approved ? 'approved' : 'pending'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <AnimatedCheck approved={approved} />
        </motion.div>

        {/* Stagger kontent */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-5 w-full"
        >

          {/* Sarlavha */}
          <motion.div variants={item} className="text-center">
            <AnimatePresence mode="wait">
              {approved ? (
                <motion.div
                  key="approved-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Tabriklaymiz{firstName ? `, ${firstName}` : ''}!
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                    Arizangiz{' '}
                    <span className="font-bold text-green-500">tasdiqlandi</span>.
                    Siz endi Yotoq haydovchisi sifatida ishlashni boshlashingiz mumkin.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="pending-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Arizangiz yuborildi!
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                    {firstName ? `Hurmatli ${firstName}, m` : 'M'}a&apos;lumotlaringiz{' '}
                    <span className="font-semibold text-[#F5C518]">ko&apos;rib chiqilmoqda</span>...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Info karta */}
          <motion.div
            variants={item}
            className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] overflow-hidden"
          >
            {[
              { Icon: Phone,         label: 'Telefon',   value: formatPhone(phone) },
              { Icon: ClipboardList, label: 'Ariza',     value: appNumber           },
              { Icon: Clock,         label: 'Yuborildi', value: submittedAt         },
            ].map(({ Icon, label, value }, i, arr) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-100 dark:border-white/8' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F5C518]/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-[#F5C518]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Timeline */}
          <motion.div variants={item} className="w-full flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
              Holat
            </p>
            {timeline.map(({ label, state }) => (
              <motion.div
                key={label}
                className="flex items-center gap-3"
                animate={{ opacity: 1 }}
                layout
              >
                <motion.div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    state === 'done'    ? 'bg-green-500/15'  :
                    state === 'active'  ? 'bg-[#F5C518]/15'  :
                                          'bg-gray-100 dark:bg-white/5'
                  }`}
                  animate={state === 'done' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <TimelineIcon state={state} />
                </motion.div>
                <span className={`text-sm font-medium ${
                  state === 'done'    ? 'text-green-600 dark:text-green-400' :
                  state === 'active'  ? 'text-[#F5C518]' :
                                        'text-gray-400 dark:text-gray-500'
                }`}>
                  {label}
                </span>
                {state === 'active' && (
                  <span className="ml-auto flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="w-1 h-1 rounded-full bg-[#F5C518]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </span>
                )}
                {state === 'done' && label !== 'Ariza yuborildi' && (
                  <span className="ml-auto text-xs text-green-500 font-semibold">✓</span>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Tugmalar */}
          <motion.div variants={item} className="w-full flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {approved ? (
                <motion.div
                  key="approved-btns"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex flex-col gap-3"
                >
                  {/* Asosiy tugma — haydovchi paneli */}
                  <button
                    onClick={() => router.push('/driver/earnings')}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #F5C518 0%, #E6B800 100%)', color: '#000' }}
                  >
                    <Truck size={18} />
                    Haydovchi paneliga kirish
                    <ArrowRight size={16} />
                  </button>
                  <Link
                    href="https://t.me/yotoq_support"
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 9.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7 6l-3-3.5L2 4c.5 4 4.5 8 8.5 8.5l1.5-2-1.5-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    Qo&apos;llab-quvvatlash
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="pending-btns"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <button
                    className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                    style={{ background: '#F5C518', color: '#000' }}
                    disabled
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="3" y="1.5" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    Ilovani yuklab oling
                  </button>
                  <Link
                    href="https://t.me/yotoq_support"
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 9.5l-1.5 1.5c-1.5-.5-3-2-3.5-3.5L7 6l-3-3.5L2 4c.5 4 4.5 8 8.5 8.5l1.5-2-1.5-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    Qo&apos;llab-quvvatlash
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.p variants={item} className="text-xs text-gray-400 text-center">
            <Link href="/" className="hover:text-[#F5C518] transition-colors">
              ← Bosh sahifaga qaytish
            </Link>
          </motion.p>

        </motion.div>
      </div>
    </div>
  )
}
