'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, CheckCircle2, RefreshCw } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { StepLayout } from '@/components/onboarding/StepLayout'
import type { VehiclePhotos } from '@/types/onboarding'

type PhotoKey = keyof VehiclePhotos

interface PhotoSlot {
  key: PhotoKey
  label: string
  hint: string
}

const SLOTS: PhotoSlot[] = [
  { key: 'front',    label: 'OLDI',  hint: 'Old tomondan' },
  { key: 'left',     label: 'CHAP',  hint: 'Chap tomoni'  },
  { key: 'interior', label: 'ICHI',  hint: 'Kuzov ichidan'},
  { key: 'right',    label: "O'NG",  hint: "O'ng tomoni"  },
  { key: 'back',     label: 'ORQA',  hint: 'Orqa tomondan'},
]

const EMPTY: VehiclePhotos = { front: '', back: '', left: '', right: '', interior: '' }

// Har bir fotoning grid pozitsiyasi (row, col) — 3x3 cross
const POSITIONS: Record<PhotoKey, { row: number; col: number }> = {
  front:    { row: 1, col: 2 },
  left:     { row: 2, col: 1 },
  interior: { row: 2, col: 2 },
  right:    { row: 2, col: 3 },
  back:     { row: 3, col: 2 },
}

type CardState = 'idle' | 'loading' | 'done'

function PhotoCard({
  slot,
  url,
  onSelect,
}: {
  slot: PhotoSlot
  url: string
  onSelect: (file: File) => void
}) {
  const inputRef              = useRef<HTMLInputElement>(null)
  const [state, setState]     = useState<CardState>(url ? 'done' : 'idle')
  const [preview, setPreview] = useState<string | null>(url || null)
  const [progress, setProgress] = useState(0)

  async function handleFile(file: File) {
    // Preview
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Fake progress
    setState('loading')
    setProgress(0)
    const iv = setInterval(() => {
      setProgress(p => { if (p >= 95) { clearInterval(iv); return 95 } return p + 5 })
    }, 100)
    await new Promise(r => setTimeout(r, 2000))
    clearInterval(iv)
    setProgress(100)
    setState('done')
    onSelect(file)
  }

  function reset() {
    setState('idle')
    setPreview(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const pos = POSITIONS[slot.key]

  // ---- Done ----
  if (state === 'done') return (
    <div
      style={{ gridRow: pos.row, gridColumn: pos.col }}
      className="relative rounded-2xl overflow-hidden border-2 border-green-400/60 bg-green-50 dark:bg-green-500/10 aspect-square flex flex-col"
    >
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={slot.label} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end p-2 gap-1">
        <CheckCircle2 size={18} className="text-green-400" />
        <span className="text-white text-xs font-bold">{slot.label}</span>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-[10px] text-white/70 hover:text-white transition-colors"
        >
          <RefreshCw size={10} />
          O'zgartir
        </button>
      </div>
    </div>
  )

  // ---- Loading ----
  if (state === 'loading') return (
    <div
      style={{ gridRow: pos.row, gridColumn: pos.col }}
      className="relative rounded-2xl border-2 border-[#C8F135]/40 bg-[#C8F135]/5 aspect-square flex flex-col items-center justify-center gap-2 p-3"
    >
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-30" />
      )}
      <span className="relative text-xs font-bold text-gray-700 dark:text-gray-300 z-10">{slot.label}</span>
      <div className="relative z-10 w-full px-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-[#C8F135] rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 text-right mt-0.5">{progress}%</p>
      </div>
    </div>
  )

  // ---- Idle ----
  return (
    <div
      style={{ gridRow: pos.row, gridColumn: pos.col }}
      onClick={() => inputRef.current?.click()}
      className="
        rounded-2xl border-2 border-dashed aspect-square flex flex-col items-center justify-center gap-1.5
        cursor-pointer transition-all duration-200 p-2
        border-gray-200 dark:border-gray-700
        hover:border-[#C8F135] hover:bg-[#C8F135]/5
        group
      "
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-[#C8F135]/15 transition-colors">
        <Camera size={16} className="text-gray-400 group-hover:text-[#C8F135] transition-colors" />
      </div>
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-[#C8F135] transition-colors">
        {slot.label}
      </span>
      <span className="text-[10px] text-gray-400 text-center leading-tight">{slot.hint}</span>
    </div>
  )
}

export default function VehiclePhotosPage() {
  const router       = useRouter()
  const setPhotos    = useOnboardingStore(s => s.setVehiclePhotos)
  const setStep      = useOnboardingStore(s => s.setCurrentStep)
  const saved        = useOnboardingStore(s => s.vehiclePhotos)
  const vehicleInfo  = useOnboardingStore(s => s.vehicleInfo)

  // MUZLATILGAN — kerak bo'lganda yoqiladi
  // useEffect(() => {
  //   if (!vehicleInfo) router.push('/vehicle-info')
  // }, [vehicleInfo, router])

  const [urls, setUrls] = useState<VehiclePhotos>(saved ?? EMPTY)

  const uploaded = Object.values(urls).filter(Boolean).length
  const allDone  = uploaded === 5

  function handleSelect(key: PhotoKey, file: File) {
    const fakeUrl = `/mock/photos/${Date.now()}-${file.name}`
    setUrls(prev => ({ ...prev, [key]: fakeUrl }))
  }

  function handleNext() {
    setPhotos(urls)
    setStep(7)
    router.push('/bank-card')
  }

  return (
    <StepLayout
      title="Mashina rasmlari"
      description="Qadam 4/6 — Barcha 5 ta rasmni yuklang"
      onBack={() => router.push('/vehicle-info')}
      onNext={handleNext}
      nextDisabled={!allDone}
    >

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-[#C8F135] rounded-full transition-all duration-500"
            style={{ width: `${(uploaded / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
          {uploaded}/5
        </span>
      </div>

      {/*
        Cross layout (3×3 grid):
            [  OLDI  ]
        [CHAP][  ICHI  ][O'NG]
            [  ORQA  ]
      */}
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}
      >
        {SLOTS.map(slot => (
          <PhotoCard
            key={slot.key}
            slot={slot}
            url={urls[slot.key]}
            onSelect={file => handleSelect(slot.key, file)}
          />
        ))}

        {/* Bo'sh kataklar (cross uchun) */}
        <div style={{ gridRow: 1, gridColumn: 1 }} />
        <div style={{ gridRow: 1, gridColumn: 3 }} />
        <div style={{ gridRow: 3, gridColumn: 1 }} />
        <div style={{ gridRow: 3, gridColumn: 3 }} />
      </div>

      {!allDone && (
        <p className="text-xs text-center text-gray-400">
          Barcha 5 ta rasmni yuklang
        </p>
      )}
    </StepLayout>
  )
}
