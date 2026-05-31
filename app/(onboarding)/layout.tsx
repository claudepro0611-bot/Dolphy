'use client'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ProgressBar } from '@/components/onboarding/ProgressBar'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors duration-300">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C8F135] flex items-center justify-center text-black font-black text-xs">
              Y
            </div>
            <span className="font-bold text-sm tracking-tight dark:text-white text-gray-900">
              Yotoq
            </span>
          </Link>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-gray-100 dark:border-white/10">
        <ProgressBar />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </main>

    </div>
  )
}
