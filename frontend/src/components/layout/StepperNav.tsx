import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { STAGE_LABELS } from '@/store/types'

const steps = [1, 2, 3, 4, 5, 6] as const

export function StepperNav() {
  const currentStep = usePlaygroundStore((s) => s.currentStep)
  const completedSteps = usePlaygroundStore((s) => s.completedSteps)
  const setStep = usePlaygroundStore((s) => s.setStep)

  return (
    <nav
      className="px-8 py-5 shrink-0 overflow-x-auto"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div className="flex items-center justify-between w-full min-w-[760px]">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step)
          const isCurrent = currentStep === step
          const isClickable = isCompleted || isCurrent

          return (
            <div key={step} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && setStep(step)}
                className="flex items-center gap-3.5 group"
                style={{ cursor: isClickable ? 'pointer' : 'default', opacity: isClickable ? 1 : 0.45 }}
              >
                {/* Step circle */}
                <motion.div
                  className="relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  animate={isCurrent ? { scale: [1, 1.07, 1] } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
                  style={
                    isCompleted
                      ? {
                        background: 'rgba(20,184,166,0.08)',
                        border: '2px solid rgba(20,184,166,0.5)',
                        color: '#0d9488',
                        boxShadow: '0 0 10px rgba(20,184,166,0.15)',
                      }
                      : isCurrent
                        ? {
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          border: '2px solid transparent',
                          color: '#fff',
                          boxShadow: '0 0 18px rgba(59,130,246,0.4)',
                        }
                        : {
                          background: '#f3f4f6',
                          border: '2px solid #e5e7eb',
                          color: '#d1d5db',
                        }
                  }
                >
                  {isCompleted ? <Check className="w-4.5 h-4.5" strokeWidth={2.5} /> : step}
                  {/* Active glow ring */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid rgba(99,102,241,0.4)' }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <div className="hidden sm:flex flex-col items-start">
                  <span
                    className="text-sm font-bold whitespace-nowrap leading-tight tracking-tight"
                    style={
                      isCurrent
                        ? { color: '#1e293b' }
                        : isCompleted
                          ? { color: '#0d9488' }
                          : { color: '#9ca3af' }
                    }
                  >
                    {STAGE_LABELS[step]}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-semibold mt-0.5" style={{ color: '#6366f1' }}>
                      In progress
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[11px] font-semibold mt-0.5" style={{ color: '#14b8a6' }}>
                      Complete
                    </span>
                  )}
                </div>
              </button>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 relative h-[3px] rounded-full overflow-hidden"
                  style={{ background: '#e5e7eb' }}>
                  {isCompleted && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
