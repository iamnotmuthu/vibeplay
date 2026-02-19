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
      className="px-6 py-3 shrink-0 overflow-x-auto"
      style={{
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-between w-full min-w-[720px]">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step)
          const isCurrent = currentStep === step
          const isClickable = isCompleted || isCurrent

          return (
            <div key={step} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && setStep(step)}
                className="flex items-center gap-2.5 group"
                style={{ cursor: isClickable ? 'pointer' : 'default', opacity: isClickable ? 1 : 0.4 }}
              >
                {/* Step circle */}
                <motion.div
                  className="relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
                  style={
                    isCompleted
                      ? {
                        background: 'rgba(20,184,166,0.12)',
                        border: '1.5px solid rgba(20,184,166,0.55)',
                        color: '#14b8a6',
                        boxShadow: '0 0 10px rgba(20,184,166,0.18)',
                      }
                      : isCurrent
                        ? {
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          border: '1.5px solid transparent',
                          color: '#fff',
                          boxShadow: '0 0 18px rgba(59,130,246,0.5)',
                        }
                        : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1.5px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.25)',
                        }
                  }
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : step}
                  {/* Active glow ring */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1.5px solid rgba(99,102,241,0.5)' }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <div className="hidden sm:flex flex-col items-start">
                  <span
                    className="text-xs font-semibold whitespace-nowrap leading-tight"
                    style={
                      isCurrent
                        ? { color: '#ffffff' }
                        : isCompleted
                          ? { color: '#14b8a6' }
                          : { color: 'rgba(255,255,255,0.28)' }
                    }
                  >
                    {STAGE_LABELS[step]}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-medium mt-0.5" style={{ color: 'rgba(99,102,241,0.8)' }}>
                      In progress
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[9px] font-medium mt-0.5" style={{ color: 'rgba(20,184,166,0.6)' }}>
                      Complete
                    </span>
                  )}
                </div>
              </button>

              {/* Connector — stretches between steps */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3 relative h-0.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
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
