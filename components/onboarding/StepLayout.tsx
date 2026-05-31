'use client'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface StepLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  isLoading?: boolean
}

export function StepLayout({
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = 'Davom etish',
  nextDisabled = false,
  isLoading = false,
}: StepLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col gap-6"
    >
      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Kontent */}
      <div className="flex flex-col gap-4">
        {children}
      </div>

      {/* Tugmalar */}
      <div className="flex items-center gap-3 pt-2">
        {/* Orqaga */}
        {onBack && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="
              flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm
              border border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-400
              hover:border-gray-300 dark:hover:border-gray-600
              hover:bg-gray-50 dark:hover:bg-white/5
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            <ArrowLeft size={16} />
            Orqaga
          </button>
        )}

        {/* Davom etish */}
        <button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className="
            flex-1 flex items-center justify-center gap-2
            py-3 px-6 rounded-xl font-semibold text-sm
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
          "
          style={{
            backgroundColor: nextDisabled || isLoading ? undefined : '#C8F135',
            color: nextDisabled || isLoading ? undefined : '#000000',
            background: nextDisabled || isLoading ? 'rgb(229 231 235)' : '#C8F135',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Yuklanmoqda...
            </>
          ) : (
            <>
              {nextLabel}
              <span className="text-base leading-none">→</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}
