import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { STAGE_LABELS, type StageId } from '@/store/types'

interface BottomActionBarProps {
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  loading?: boolean
  nextDisabled?: boolean
}

export function BottomActionBar({
  onNext,
  onBack,
  nextLabel,
  loading = false,
  nextDisabled = false,
}: BottomActionBarProps) {
  const currentStep = usePlaygroundStore((s) => s.currentStep)

  const canGoBack = currentStep > 1
  const canGoForward = currentStep < 7

  return (
    <div className="h-16 border-t border-gray-200 bg-white px-6 flex items-center justify-between shrink-0">
      <div>
        {canGoBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>

      <span className="text-sm text-gray-400 hidden sm:block">
        Step {currentStep} of 7 — {STAGE_LABELS[currentStep]}
      </span>

      <div>
        {canGoForward && onNext && (
          <motion.button
            onClick={onNext}
            disabled={loading || nextDisabled}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {nextLabel || `Continue to ${STAGE_LABELS[(currentStep + 1) as StageId]}`}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
            {!loading && !nextDisabled && (
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              />
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
