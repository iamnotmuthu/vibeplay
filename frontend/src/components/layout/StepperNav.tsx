import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { STAGE_LABELS, type StageId } from '@/store/types'

const steps: StageId[] = [1, 2, 3, 4, 5, 6, 7]

export function StepperNav() {
  const currentStep = usePlaygroundStore((s) => s.currentStep)
  const completedSteps = usePlaygroundStore((s) => s.completedSteps)
  const setStep = usePlaygroundStore((s) => s.setStep)

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 shrink-0 overflow-x-auto">
      <div className="flex items-center justify-between max-w-5xl mx-auto min-w-[640px]">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step)
          const isCurrent = step === currentStep
          const isClickable = isCompleted || step <= currentStep

          return (
            <div key={step} className="flex items-center">
              <button
                onClick={() => isClickable && setStep(step)}
                className={`flex items-center gap-2 group ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
                disabled={!isClickable}
              >
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-success text-white'
                      : isCurrent
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                  animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step}
                </motion.div>
                <span
                  className={`text-xs font-medium hidden md:block whitespace-nowrap ${
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-success'
                        : 'text-gray-400'
                  }`}
                >
                  {STAGE_LABELS[step]}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div className="w-8 lg:w-12 mx-1">
                  <div className="h-0.5 bg-gray-200 relative">
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-success"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
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
