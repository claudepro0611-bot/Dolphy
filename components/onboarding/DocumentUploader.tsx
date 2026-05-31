'use client'
import { useState, useRef } from 'react'
import { Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import Image from 'next/image'

type UploadState = 'idle' | 'loading' | 'success' | 'error'

interface DocumentUploaderProps {
  title: string
  description?: string
  onUpload: (file: File) => Promise<void>
  value?: string
  accept?: string
  maxSizeMB?: number
}

export function DocumentUploader({
  title,
  description,
  onUpload,
  value,
  accept = 'image/*',
  maxSizeMB = 10,
}: DocumentUploaderProps) {
  const [state,    setState]    = useState<UploadState>(value ? 'success' : 'idle')
  const [progress, setProgress] = useState(0)
  const [preview,  setPreview]  = useState<string | null>(value ?? null)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    // Hajm tekshiruvi
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`Fayl hajmi ${maxSizeMB} MB dan oshmasligi kerak`)
      setState('error')
      return
    }

    // Preview (rasm bo'lsa)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }

    // Fake progress (2 soniya)
    setState('loading')
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(interval); return 95 }
        return p + 5
      })
    }, 100)

    try {
      await onUpload(file)
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => setState('success'), 200)
    } catch (err) {
      clearInterval(interval)
      setErrorMsg(err instanceof Error ? err.message : 'Yuklashda xatolik')
      setState('error')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function reset() {
    setState('idle')
    setPreview(null)
    setProgress(0)
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  // ---- Idle ----
  if (state === 'idle') return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      className="
        border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
        border-gray-200 dark:border-gray-700
        hover:border-[#C8F135] hover:bg-[#C8F135]/5
        transition-all duration-200 group
      "
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#C8F135]/15 transition-colors">
        <Upload size={22} className="text-gray-400 group-hover:text-[#C8F135] transition-colors" />
      </div>
      <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">{title}</p>
      {description && <p className="text-xs text-gray-400 mb-2">{description}</p>}
      <p className="text-xs text-gray-400">
        JPG, PNG · Max {maxSizeMB} MB · Bosing yoki tashlang
      </p>
    </div>
  )

  // ---- Loading ----
  if (state === 'loading') return (
    <div className="border-2 border-[#C8F135]/40 rounded-2xl p-6 bg-[#C8F135]/5">
      {preview && (
        <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4">
          <Image src={preview} alt="preview" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">{title}</p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-[#C8F135] rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">{progress}%</p>
    </div>
  )

  // ---- Success ----
  if (state === 'success') return (
    <div className="border-2 border-green-400/50 rounded-2xl p-4 bg-green-50 dark:bg-green-500/10">
      {preview && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
          <Image src={preview} alt="preview" fill className="object-cover" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Muvaffaqiyatli yuklandi</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5"
        >
          <RefreshCw size={12} />
          O'zgartirish
        </button>
      </div>
    </div>
  )

  // ---- Error ----
  return (
    <div className="border-2 border-red-400/50 rounded-2xl p-4 bg-red-50 dark:bg-red-500/10">
      <div className="flex items-start gap-3 mb-3">
        <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
          <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
        </div>
      </div>
      <button
        onClick={() => { setState('idle'); setErrorMsg('') }}
        className="w-full py-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600/50 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
      >
        Qayta urinish
      </button>
    </div>
  )
}
