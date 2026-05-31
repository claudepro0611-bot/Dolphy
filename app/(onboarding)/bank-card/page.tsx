'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOnboardingStore } from '@/store/onboarding'
import { bankCardSchema } from '@/lib/validations/onboarding'
import { StepLayout } from '@/components/onboarding/StepLayout'
import { useTheme } from '@/components/ThemeProvider'
import type { BankCard } from '@/types/onboarding'

type FormValues = z.infer<typeof bankCardSchema>

type Network = 'UZCARD' | 'HUMO' | 'VISA' | 'MC' | ''

function detectNetwork(digits: string): Network {
  if (digits.startsWith('8600')) return 'UZCARD'
  if (digits.startsWith('9860')) return 'HUMO'
  if (digits.startsWith('4169')) return 'VISA'
  if (digits.startsWith('5614')) return 'MC'
  return ''
}

function CardPreview({ number, expiry, holder, isDark }: {
  number: string; expiry: string; holder: string; isDark: boolean
}) {
  const network    = detectNetwork(number)
  const displayNum = number.padEnd(16, '·').match(/.{1,4}/g)?.join('  ') ?? ''

  const networkLabel: Record<Network, string> = {
    UZCARD: 'UZCARD', HUMO: 'HUMO', VISA: 'VISA', MC: 'MASTERCARD', '': '',
  }

  const bg = isDark
    ? 'linear-gradient(135deg, #111 0%, #2a2a2a 50%, #1a1a1a 100%)'
    : 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 50%, #2a2a2a 100%)'

  return (
    <div
      className="relative w-full rounded-2xl p-5 overflow-hidden"
      style={{ background: bg, aspectRatio: '1.586/1' }}
    >
      {/* Sariq aksent doiralar */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-15"
           style={{ background: 'radial-gradient(circle, #C8F135 0%, transparent 70%)' }} />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10"
           style={{ background: 'radial-gradient(circle, #C8F135 0%, transparent 70%)' }} />

      {/* Chip + Network */}
      <div className="flex justify-between items-start mb-5">
        <div className="w-10 h-7 rounded-md border border-[#C8F135]/40 bg-[#C8F135]/20 flex items-center justify-center">
          <div className="w-6 h-4 rounded-sm" style={{ background: 'linear-gradient(90deg, #C8F135 50%, #b3d92f 50%)' }} />
        </div>
        {network && (
          <span className="text-xs font-black tracking-[3px] text-white/70">{networkLabel[network]}</span>
        )}
      </div>

      {/* Raqam */}
      <p className="font-mono text-xl font-bold tracking-[3px] text-white mb-4 select-none">
        {displayNum}
      </p>

      {/* Holder + Expiry */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-white/30 text-[9px] uppercase tracking-[2px] mb-0.5">Karta egasi</p>
          <p className="text-white font-semibold text-sm tracking-wide">
            {holder || 'ISM FAMILIYA'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/30 text-[9px] uppercase tracking-[2px] mb-0.5">Muddati</p>
          <p className="text-white font-bold text-sm">{expiry || 'OO/YY'}</p>
        </div>
      </div>
    </div>
  )
}

export default function BankCardPage() {
  const router        = useRouter()
  const setBankCard   = useOnboardingStore(s => s.setBankCard)
  const setStep       = useOnboardingStore(s => s.setCurrentStep)
  const saved         = useOnboardingStore(s => s.bankCard)
  const vehiclePhotos = useOnboardingStore(s => s.vehiclePhotos)
  const { isDark }    = useTheme()

  // MUZLATILGAN — kerak bo'lganda yoqiladi
  // useEffect(() => {
  //   if (!vehiclePhotos) router.push('/vehicle-photos')
  // }, [vehiclePhotos, router])

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(bankCardSchema),
    defaultValues: saved ?? {},
  })

  const rawNumber = watch('cardNumber') ?? ''
  const expiry    = watch('expiryDate') ?? ''
  const holder    = watch('holderName') ?? ''

  const [displayNum, setDisplayNum] = useState(
    saved?.cardNumber ? (saved.cardNumber.match(/.{1,4}/g)?.join(' ') ?? '') : ''
  )

  function handleCardNumber(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    setDisplayNum(digits.match(/.{1,4}/g)?.join(' ') ?? digits)
    setValue('cardNumber', digits, { shouldValidate: digits.length === 16 })
  }

  function handleExpiry(val: string) {
    const raw = val.replace(/\D/g, '').slice(0, 4)
    const fmt = raw.length >= 3 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw
    setValue('expiryDate', fmt, { shouldValidate: fmt.length === 5 })
  }

  function handleHolder(val: string) {
    const upper = val.toUpperCase().replace(/[^A-Z\s]/g, '')
    setValue('holderName', upper, { shouldValidate: upper.length >= 3 })
  }

  async function onSubmit(data: FormValues) {
    await new Promise(r => setTimeout(r, 600))
    setBankCard(data as BankCard)
    document.cookie = `ob_step=8; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
    setStep(8)
    router.push('/pending-approval')
  }

  const cls = (err?: boolean) => [
    'w-full h-12 px-4 rounded-xl text-sm font-medium outline-none transition-all duration-200',
    'border-2 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white',
    'placeholder:text-gray-300 dark:placeholder:text-gray-600',
    err
      ? 'border-red-400 focus:border-red-400'
      : 'border-gray-200 dark:border-gray-700 focus:border-[#C8F135]',
  ].join(' ')

  return (
    <StepLayout
      title="To'lov kartasi"
      description="Qadam 5/6 — Daromadingiz shu kartaga o'tkaziladi"
      onBack={() => router.push('/vehicle-photos')}
      onNext={handleSubmit(onSubmit)}
      nextLabel="Yuborish →"
      nextDisabled={isSubmitting}
      isLoading={isSubmitting}
    >
      {/* Real-time karta vizualizatsiyasi */}
      <CardPreview
        number={rawNumber}
        expiry={expiry}
        holder={holder}
        isDark={isDark}
      />

      <div className="flex flex-col gap-4">

        {/* Karta raqami */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
            Karta raqami <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={displayNum}
            onChange={e => handleCardNumber(e.target.value)}
            placeholder="8600 •••• •••• ••••"
            maxLength={19}
            className={cls(!!errors.cardNumber)}
          />
          {errors.cardNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.cardNumber.message}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">UZCARD (8600), HUMO (9860), VISA (4169)</p>
        </div>

        {/* Muddati + Egasi */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Amal muddati <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={expiry}
              onChange={e => handleExpiry(e.target.value)}
              placeholder="OO/YY"
              maxLength={5}
              className={cls(!!errors.expiryDate)}
            />
            {errors.expiryDate && (
              <p className="text-xs text-red-500 mt-1">{errors.expiryDate.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              CVV
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={3}
              placeholder="•••"
              className={cls()}
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">Talab etilmaydi</p>
          </div>
        </div>

        {/* Karta egasi */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
            Karta egasi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={holder}
            onChange={e => handleHolder(e.target.value)}
            placeholder="JASUR TOSHMATOV"
            className={cls(!!errors.holderName) + ' uppercase tracking-wide'}
          />
          {errors.holderName && (
            <p className="text-xs text-red-500 mt-1">{errors.holderName.message}</p>
          )}
        </div>

      </div>

      <div className="flex items-center gap-2 justify-center text-xs text-gray-400">
        <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
          <rect x="1" y="5.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M3.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span>256-bit SSL shifrlash bilan himoyalangan</span>
      </div>
    </StepLayout>
  )
}
