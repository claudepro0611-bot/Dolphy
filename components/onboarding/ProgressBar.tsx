'use client'
import { User, FileText, Truck, Camera, CreditCard, CheckCircle } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'

const STEPS = [
  { n: 3, label: 'Shaxsiy',   Icon: User         },
  { n: 4, label: 'Hujjatlar', Icon: FileText      },
  { n: 5, label: 'Mashina',   Icon: Truck         },
  { n: 6, label: 'Rasmlar',   Icon: Camera        },
  { n: 7, label: 'Karta',     Icon: CreditCard    },
  { n: 8, label: 'Yuborildi', Icon: CheckCircle   },
]

export function ProgressBar() {
  const currentStep = useOnboardingStore(s => s.currentStep)

  // Faqat 3-8 qadamlarda ko'rinadi
  if (currentStep < 3 || currentStep >= 8) return null

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const done    = currentStep > step.n
          const current = currentStep === step.n
          const future  = currentStep < step.n
          const isLast  = idx === STEPS.length - 1

          return (
            <div key={step.n} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
                    done    ? 'bg-[#F5C518]'                                                   : '',
                    current ? 'border-2 border-[#F5C518] bg-transparent animate-pulse'         : '',
                    future  ? 'border-2 border-gray-300 dark:border-gray-600 bg-transparent'   : '',
                  ].join(' ')}
                >
                  <step.Icon
                    size={17}
                    className={[
                      done    ? 'text-black'                              : '',
                      current ? 'text-[#F5C518]'                          : '',
                      future  ? 'text-gray-400 dark:text-gray-500'        : '',
                    ].join(' ')}
                  />
                </div>

                {/* Label — faqat desktop */}
                <span
                  className={[
                    'hidden md:block text-[10px] font-semibold tracking-wide text-center',
                    done    ? 'text-[#F5C518]'                            : '',
                    current ? 'text-[#F5C518]'                            : '',
                    future  ? 'text-gray-400 dark:text-gray-500'          : '',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (oxirgisidan keyin yo'q) */}
              {!isLast && (
                <div className="flex-1 h-[2px] mx-1 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-[#F5C518] transition-all duration-500"
                    style={{ width: done ? '100%' : current ? '50%' : '0%' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
