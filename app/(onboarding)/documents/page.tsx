'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { DocumentUploader } from '@/components/onboarding/DocumentUploader'
import { StepLayout } from '@/components/onboarding/StepLayout'
import type { DocumentUrls } from '@/types/onboarding'

type DocKey = keyof DocumentUrls

const DOCS: { key: DocKey; title: string; description: string }[] = [
  {
    key: 'passportFront',
    title: 'Pasport — old tomon',
    description: "Suratli sahifa to'liq ko'rinsin",
  },
  {
    key: 'passportBack',
    title: 'Pasport — orqa tomon',
    description: "Ro'yxatdan o'tish sahifasi",
  },
  {
    key: 'licenseFront',
    title: 'Haydovchilik guvohnomasi — old',
    description: "Toifalar va muddati ko'rinsin",
  },
  {
    key: 'licenseBack',
    title: 'Haydovchilik guvohnomasi — orqa',
    description: "Barcha yozuvlar aniq bo'lsin",
  },
  {
    key: 'techPassport',
    title: 'Texpassport',
    description: 'Mashina hujjatining birinchi sahifasi',
  },
  {
    key: 'selfieWithPassport',
    title: 'Selfie — pasport bilan',
    description: "Yuz va pasportning suratli sahifasi ko'rinsin",
  },
]

const EMPTY: DocumentUrls = {
  passportFront: '',
  passportBack: '',
  licenseFront: '',
  licenseBack: '',
  techPassport: '',
  selfieWithPassport: '',
}

export default function DocumentsPage() {
  const router        = useRouter()
  const setDocs       = useOnboardingStore(s => s.setDocuments)
  const setStep       = useOnboardingStore(s => s.setCurrentStep)
  const savedDocs     = useOnboardingStore(s => s.documents)
  const personalInfo  = useOnboardingStore(s => s.personalInfo)

  // MUZLATILGAN — kerak bo'lganda yoqiladi
  // useEffect(() => {
  //   if (!personalInfo) router.push('/personal-info')
  // }, [personalInfo, router])

  const [urls, setUrls] = useState<DocumentUrls>(savedDocs ?? EMPTY)

  const uploaded = Object.values(urls).filter(Boolean).length
  const allDone  = uploaded === 6

  async function handleUpload(key: DocKey, file: File): Promise<void> {
    // 2 soniyalik fake upload (DocumentUploader progress bilan mos)
    await new Promise(r => setTimeout(r, 2000))
    const fakeUrl = `/mock/docs/${Date.now()}-${file.name}`
    setUrls(prev => ({ ...prev, [key]: fakeUrl }))
  }

  function handleNext() {
    setDocs(urls)
    setStep(5)
    router.push('/vehicle-info')
  }

  return (
    <StepLayout
      title="Hujjatlarni yuklang"
      description="Qadam 2/6 — Barcha hujjat rasmlari aniq va yaxlit ko'rinsin"
      onBack={() => router.push('/personal-info')}
      onNext={handleNext}
      nextDisabled={!allDone}
    >
      {/* Progress chip */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-[#F5C518] rounded-full transition-all duration-500"
            style={{ width: `${(uploaded / 6) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
          {uploaded}/6
        </span>
      </div>

      {/* 2 ustunli grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DOCS.map(doc => (
          <DocumentUploader
            key={doc.key}
            title={doc.title}
            description={doc.description}
            value={urls[doc.key] || undefined}
            onUpload={file => handleUpload(doc.key, file)}
            accept="image/*"
            maxSizeMB={10}
          />
        ))}
      </div>

      {!allDone && (
        <p className="text-xs text-center text-gray-400 -mt-1">
          Davom etish uchun barcha 6 ta hujjatni yuklang
        </p>
      )}
    </StepLayout>
  )
}
