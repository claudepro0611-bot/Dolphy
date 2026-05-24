'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/store/onboarding'

const fade      = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

const MENU = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="2.5" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M4 6.5h7M4 9h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Zakaz tarixi',
    href:  '/driver/orders',
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 11L5 7.5l3 2 3-5 2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 13.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Daromad',
    href:  '/driver/earnings',
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M7.5 5v3.5M7.5 10v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Yordam',
    href:  'https://t.me/yotoq_support',
  },
]

const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M5 3l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function DriverProfilePage() {
  const router       = useRouter()
  const phone        = useOnboardingStore(s => s.phone)
  const personalInfo = useOnboardingStore(s => s.personalInfo)

  const name = personalInfo
    ? `${personalInfo.firstName} ${personalInfo.lastName}`
    : 'Haydovchi'

  const displayPhone = (() => {
    const d = phone.replace(/\D/g, '')
    if (d.length === 12)
      return `+${d.slice(0,3)} ${d.slice(3,5)} ${d.slice(5,8)}-${d.slice(8,10)}-${d.slice(10)}`
    return phone || '—'
  })()

  function logout() {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/login')
  }

  return (
    <motion.div
      variants={container} initial="hidden" animate="show"
      className="max-w-xl space-y-5"
    >
      {/* Profile card */}
      <motion.div variants={fade}
        className="dark:bg-white/[0.03] bg-white dark:border-white/8 border border-gray-200 rounded-2xl p-6 flex items-center gap-5"
      >
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl dark:bg-white/5 bg-gray-100 dark:border-white/10 border border-gray-200 flex items-center justify-center flex-shrink-0">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="10" r="5" stroke="currentColor" strokeWidth="1.8" className="dark:text-white/50 text-gray-400"/>
            <path d="M4 26c0-5.523 4.477-9 10-9s10 3.477 10 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="dark:text-white/50 text-gray-400"/>
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg dark:text-white text-gray-900 leading-none truncate">{name}</p>
          <p className="text-sm dark:text-white/40 text-gray-500 mt-1">{displayPhone}</p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/8 border border-green-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Faol haydovchi</span>
          </div>
        </div>
      </motion.div>

      {/* Statistika */}
      <motion.div variants={fade} className="grid grid-cols-3 gap-3">
        {[
          { label: 'Bajarilgan',  value: '48',   unit: 'zakaz' },
          { label: 'Reyting',     value: '4.8',  unit: '/ 5.0' },
          { label: "O'tilgan",    value: '1 240', unit: 'km'   },
        ].map(s => (
          <div key={s.label}
            className="dark:bg-white/[0.03] bg-white dark:border-white/8 border border-gray-200 rounded-2xl p-4"
          >
            <p className="text-xl font-bold text-[#FFD100] tabular-nums leading-none">{s.value}</p>
            <p className="text-xs dark:text-white/30 text-gray-400 mt-1">{s.unit}</p>
            <p className="text-xs dark:text-white/50 text-gray-600 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Menu */}
      <motion.div variants={fade}
        className="dark:bg-white/[0.03] bg-white dark:border-white/8 border border-gray-200 rounded-2xl overflow-hidden"
      >
        {MENU.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-5 py-3.5 dark:text-white/60 text-gray-600 hover:dark:bg-white/5 hover:bg-gray-50 transition-colors ${
              i < MENU.length - 1 ? 'border-b dark:border-white/5 border-gray-100' : ''
            }`}
          >
            <span className="dark:text-white/25 text-gray-400 flex-shrink-0">{item.icon}</span>
            <span className="text-sm font-medium flex-1">{item.label}</span>
            <span className="dark:text-white/15 text-gray-300 flex-shrink-0"><ChevronRight /></span>
          </Link>
        ))}
      </motion.div>

      {/* Chiqish */}
      <motion.div variants={fade}>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border dark:border-white/8 border-gray-200 text-sm font-semibold dark:text-white/40 text-gray-500 hover:dark:text-red-400 hover:text-red-500 hover:dark:border-red-500/20 hover:border-red-200 hover:dark:bg-red-500/5 hover:bg-red-50 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Chiqish
        </button>
      </motion.div>

    </motion.div>
  )
}
