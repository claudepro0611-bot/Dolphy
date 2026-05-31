'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOnboardingStore } from '@/store/onboarding'
import { vehicleSchema } from '@/lib/validations/onboarding'
import { StepLayout } from '@/components/onboarding/StepLayout'
import type { VehicleType } from '@/types/onboarding'

type FormValues = z.infer<typeof vehicleSchema>

const TruckSvg = () => (
  <svg width="16" height="13" viewBox="0 0 20 14" fill="none">
    <rect x="1" y="1.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M12 4h4l2 3v3h-6V4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <circle cx="4" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="15" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
)

const TRUCK_TYPES: { id: VehicleType; label: string; hint: string }[] = [
  { id: 'damas',  label: 'Damas',  hint: '500–1 500 kg · 2–4 m³'   },
  { id: 'labo',   label: 'Labo',   hint: '800–1 500 kg · 2–5 m³'   },
  { id: 'isuzu',  label: 'Isuzu',  hint: '3 000–7 000 kg · 20–40 m³' },
  { id: 'fura',   label: 'Fura',   hint: '15 000–40 000 kg · 80–120 m³' },
  { id: 'gazel',  label: 'Gazel',  hint: '1 500–3 000 kg · 8–20 m³' },
]

const BRANDS = ['Toyota', 'Isuzu', 'Hyundai', 'MAN', 'Volvo', 'Boshqa']

const CURRENT_YEAR = new Date().getFullYear()

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-500 font-medium mt-1">{msg}</p>
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function inputCls(hasError?: boolean) {
  return [
    'w-full h-11 px-4 rounded-xl text-sm font-medium outline-none transition-all duration-200',
    'border-2 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white',
    'placeholder:text-gray-300 dark:placeholder:text-gray-600',
    hasError
      ? 'border-red-400 focus:border-red-400'
      : 'border-gray-200 dark:border-gray-700 focus:border-[#C8F135]',
  ].join(' ')
}

export default function VehicleInfoPage() {
  const router         = useRouter()
  const setVehicleInfo = useOnboardingStore(s => s.setVehicleInfo)
  const setStep        = useOnboardingStore(s => s.setCurrentStep)
  const saved          = useOnboardingStore(s => s.vehicleInfo)
  const documents      = useOnboardingStore(s => s.documents)

  // MUZLATILGAN — kerak bo'lganda yoqiladi
  // useEffect(() => {
  //   if (!documents) router.push('/documents')
  // }, [documents, router])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: saved ?? { vehicleType: 'gazel', year: 2020 },
  })

  const selectedType = watch('vehicleType')
  const typeHint     = TRUCK_TYPES.find(t => t.id === selectedType)?.hint ?? ''

  async function onSubmit(data: FormValues) {
    await new Promise(r => setTimeout(r, 500))
    setVehicleInfo(data)
    setStep(6)
    router.push('/vehicle-photos')
  }

  return (
    <StepLayout
      title="Mashina ma'lumotlari"
      description="Qadam 3/6 — Texpassportdagi ma'lumotlarni kiriting"
      onBack={() => router.push('/documents')}
      onNext={handleSubmit(onSubmit)}
      nextDisabled={isSubmitting}
      isLoading={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Mashina turi */}
        <div>
          <Label required>Mashina turi</Label>
          <div className="flex flex-wrap gap-2">
            {TRUCK_TYPES.map(t => {
              const active = selectedType === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setValue('vehicleType', t.id, { shouldValidate: true })}
                  className={[
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200',
                    active
                      ? 'border-[#C8F135] bg-[#C8F135]/10 text-gray-900 dark:text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                  ].join(' ')}
                >
                  <TruckSvg />
                  {t.label}
                </button>
              )
            })}
          </div>
          {typeHint && (
            <p className="text-xs text-gray-400 mt-1.5">
              Taxminiy: <span className="font-semibold">{typeHint}</span>
            </p>
          )}
          <FieldError msg={errors.vehicleType?.message} />
        </div>

        {/* Marka */}
        <div>
          <Label required>Mashina markasi</Label>
          <select
            {...register('brand')}
            className={inputCls(!!errors.brand)}
          >
            <option value="">Tanlang...</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <FieldError msg={errors.brand?.message} />
        </div>

        {/* Model + Yil */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Model</Label>
            <input
              {...register('model')}
              placeholder="Hiace, NQR, ..."
              className={inputCls(!!errors.model)}
            />
            <FieldError msg={errors.model?.message} />
          </div>
          <div>
            <Label required>Yil</Label>
            <input
              type="number"
              {...register('year', { valueAsNumber: true })}
              min={1990}
              max={CURRENT_YEAR}
              placeholder="2020"
              className={inputCls(!!errors.year)}
            />
            <FieldError msg={errors.year?.message} />
          </div>
        </div>

        {/* Davlat raqami */}
        <div>
          <Label required>Davlat raqami</Label>
          <input
            {...register('plateNumber')}
            placeholder="01A123BC"
            maxLength={8}
            className={inputCls(!!errors.plateNumber) + ' uppercase'}
            onChange={e => setValue('plateNumber', e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 8))}
          />
          <p className="text-xs text-gray-400 mt-1">Format: 01A123BC</p>
          <FieldError msg={errors.plateNumber?.message} />
        </div>

        {/* Tonnaj + Hajm */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Yuk ko'tarish (kg)</Label>
            <input
              type="number"
              {...register('capacityKg', { valueAsNumber: true })}
              placeholder="1500"
              min={100}
              max={40000}
              className={inputCls(!!errors.capacityKg)}
            />
            <FieldError msg={errors.capacityKg?.message} />
          </div>
          <div>
            <Label required>Kuzov hajmi (m³)</Label>
            <input
              type="number"
              step="0.1"
              {...register('volumeM3', { valueAsNumber: true })}
              placeholder="10"
              min={0.5}
              max={120}
              className={inputCls(!!errors.volumeM3)}
            />
            <FieldError msg={errors.volumeM3?.message} />
          </div>
        </div>

      </form>
    </StepLayout>
  )
}
