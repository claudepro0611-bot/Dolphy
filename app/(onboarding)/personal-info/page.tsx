'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOnboardingStore } from '@/store/onboarding'
import { personalInfoSchema } from '@/lib/validations/onboarding'
import { StepLayout } from '@/components/onboarding/StepLayout'
import type { PersonalInfo } from '@/types/onboarding'

type FormValues = z.infer<typeof personalInfoSchema>

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  )
}

function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={[
        'w-full h-12 px-4 rounded-xl text-sm font-medium transition-all duration-200 outline-none',
        'border-2 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white',
        'placeholder:text-gray-300 dark:placeholder:text-gray-600',
        error
          ? 'border-red-400 focus:border-red-400'
          : 'border-gray-200 dark:border-gray-700 focus:border-[#C8F135]',
        props.disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    />
  )
}

export default function PersonalInfoPage() {
  const router          = useRouter()
  const setPersonalInfo = useOnboardingStore(s => s.setPersonalInfo)
  const setStep         = useOnboardingStore(s => s.setCurrentStep)
  const saved           = useOnboardingStore(s => s.personalInfo)
  const phone           = useOnboardingStore(s => s.phone)

  // MUZLATILGAN — kerak bo'lganda yoqiladi
  // useEffect(() => {
  //   if (!phone) router.push('/register')
  // }, [phone, router])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: saved
      ? {
          ...saved,
          passportSeries: saved.passportSeries,
          birthDate: saved.birthDate,
        }
      : undefined,
  })

  // Pasport seriyasini katta harfga aylantirish
  const passportSeriesVal = watch('passportSeries') ?? ''

  async function onSubmit(data: FormValues) {
    await new Promise(r => setTimeout(r, 500))
    setPersonalInfo(data as PersonalInfo)
    setStep(4)
    router.push('/documents')
  }

  return (
    <StepLayout
      title="Shaxsiy ma'lumotlar"
      description="Qadam 1/6 — Pasportingizdagi ma'lumotlarni kiriting"
      onBack={() => router.push('/verify-otp')}
      onNext={handleSubmit(onSubmit)}
      nextDisabled={isSubmitting}
      isLoading={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Familiya */}
        <Field label="Familiya" required error={errors.lastName?.message}>
          <Input
            {...register('lastName')}
            placeholder="Karimov"
            error={!!errors.lastName}
          />
        </Field>

        {/* Ism */}
        <Field label="Ism" required error={errors.firstName?.message}>
          <Input
            {...register('firstName')}
            placeholder="Jasur"
            error={!!errors.firstName}
          />
        </Field>

        {/* Otasining ismi */}
        <Field label="Otasining ismi" error={errors.middleName?.message}>
          <Input
            {...register('middleName')}
            placeholder="Aliyevich (ixtiyoriy)"
            error={!!errors.middleName}
          />
        </Field>

        {/* Tug'ilgan sana */}
        <Field label="Tug'ilgan sana" required error={errors.birthDate?.message}>
          <Input
            type="date"
            {...register('birthDate', {
              setValueAs: v => v ? new Date(v) : undefined,
            })}
            max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]}
            min={new Date(Date.now() - 70 * 365.25 * 86400000).toISOString().split('T')[0]}
            error={!!errors.birthDate}
          />
        </Field>

        {/* Pasport seriya + raqam */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Seriya" required error={errors.passportSeries?.message}>
            <Input
              {...register('passportSeries')}
              placeholder="AA"
              maxLength={2}
              value={passportSeriesVal.toUpperCase()}
              onChange={e => setValue('passportSeries', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              error={!!errors.passportSeries}
            />
          </Field>
          <Field label="Raqam" required error={errors.passportNumber?.message}>
            <Input
              {...register('passportNumber')}
              placeholder="1234567"
              maxLength={7}
              inputMode="numeric"
              onChange={e => setValue('passportNumber', e.target.value.replace(/\D/g, '').slice(0, 7))}
              error={!!errors.passportNumber}
            />
          </Field>
        </div>

        {/* JSHSHIR */}
        <Field label="JSHSHIR" required error={errors.jshshir?.message}>
          <Input
            {...register('jshshir')}
            placeholder="12345678901234"
            maxLength={14}
            inputMode="numeric"
            onChange={e => setValue('jshshir', e.target.value.replace(/\D/g, '').slice(0, 14))}
            error={!!errors.jshshir}
          />
          <p className="text-xs text-gray-400">14 xonali shaxsiy identifikatsiya raqami</p>
        </Field>

      </form>
    </StepLayout>
  )
}
