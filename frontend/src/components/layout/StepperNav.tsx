import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { STAGE_LABELS } from '@/store/types'

const steps = [1, 2, 3, 4, 5, 6] as const

export function StepperNav() {
  const currentStep = usePlaygroundStore((s) => s.currentStep)
  const completedSteps = usePlaygroundStore((s) => s.completedSteps)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const theme = usePlaygroundStore((s) => s.theme)

  return (
    <nav
      className="px-4 sm:px-6 py-3 shrink-0 overflow-x-auto transition-colors duration-300"
      style={{
        background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
        borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
      }}
    >
      <div className="flex items-center justify-between max-w-5xl mx-auto min-w-[700px]">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step)
          const isCurrent = currentStep === step
          const isClickable = isCompleted || isCurrent

          return (
            <div key={step} className="flex items-center">
              <button
                onClick={() => isClickable && setStep(step)}
                className="flex items-center gap-2 group"
                style={{ cursor: isClickable ? 'pointer' : 'default', opacity: isClickable ? 1 : 0.45 }}
              >
                {/* Step circle */}
                <motion.div
                  className="relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-300"
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
                  style={
                    isCompleted
                      ? {
                        background: theme === 'dark' ? 'rgba(20,184,166,0.15)' : '#d1fae5',
                        border: theme === 'dark' ? '1.5px solid rgba(20,184,166,0.6)' : '1.5px solid #10b981',
                        color: theme === 'dark' ? '#14b8a6' : '#047857',
                        boxShadow: theme === 'dark' ? '0 0 10px rgba(20,184,166,0.2)' : 'none',
                      }
                      : isCurrent
                        ? {
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          border: '1.5px solid transparent',
                          color: '#fff',
                          boxShadow: theme === 'dark' ? '0 0 16px rgba(59,130,246,0.45)' : '0 1px 3px rgba(59,130,246,0.3)',
                        }
                        : {
                          background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
                          border: theme === 'dark' ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e5e7eb',
                          color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#9ca3af',
                        }
                  }
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : step}
                  {/* Active glow ring */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1.5px solid rgba(59,130,246,0.4)' }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>
                {/* Label */}
                <span
                  className="text-[11px] font-medium hidden md:block whitespace-nowrap transition-colors duration-300"
                  style={
                    isCurrent
                      ? { color: theme === 'dark' ? '#fff' : '#111827' }
                      : isCompleted
                        ? { color: theme === 'dark' ? '#14b8a6' : '#059669' }
                        : { color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#9ca3af' }
                  }
                >
                  {STAGE_LABELS[step]}
                </span>
              </button>
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="w-6 lg:w-10 mx-1.5 relative">
                  <div
                    className="h-px transition-colors duration-300"
                    style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}
                  >
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-y-0 left-0 h-full"
                        style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
