import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, ChevronRight } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { STAGE_LABELS, type StageId } from '@/store/types'

interface BottomActionBarProps {
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  loading?: boolean
  nextDisabled?: boolean
  alwaysShowNext?: boolean
}

export function BottomActionBar({
  onNext,
  onBack,
  nextLabel,
  loading = false,
  nextDisabled = false,
  alwaysShowNext = false,
}: BottomActionBarProps) {
  const currentStep = usePlaygroundStore((s) => s.currentStep)
  const theme = usePlaygroundStore((s) => s.theme)

  const canGoBack = currentStep > 1
  const canGoForward = currentStep < 6 || alwaysShowNext
  const label = nextLabel || `Continue to ${STAGE_LABELS[(currentStep + 1) as StageId]}`
  const isActive = canGoForward && !!onNext && !nextDisabled && !loading

  return (
    <div
      className="shrink-0 border-t px-6 py-3 flex items-center justify-between transition-colors duration-300"
      style={{
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.07)' : '#e5e7eb',
        background: theme === 'dark' ? 'rgba(9,9,11,0.95)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Back button */}
      <div>
        {canGoBack && (
          <motion.button
            onClick={onBack}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme === 'dark' ? '#e5e7eb' : '#374151'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme === 'dark' ? '#6b7280' : '#9ca3af'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        )}
      </div>

      {/* Step counter */}
      <span
        className="text-[11px] hidden sm:block tracking-wide font-mono"
        style={{ color: theme === 'dark' ? '#4b5563' : '#d1d5db' }}
      >
        {currentStep} / {Object.keys(STAGE_LABELS).length}
      </span>

      {/* Next CTA */}
      <div className="relative">
        {canGoForward && onNext && (
          <>
            {/* Outer glow ring (only when active) */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  filter: 'blur(10px)',
                  opacity: 0.5,
                }}
                animate={{ opacity: [0.35, 0.65, 0.35] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              />
            )}

            <motion.button
              onClick={onNext}
              disabled={loading || nextDisabled}
              whileHover={isActive ? { scale: 1.04, y: -1 } : {}}
              whileTap={isActive ? { scale: 0.97 } : {}}
              className="relative flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-bold text-white overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-shadow"
              style={
                nextDisabled
                  ? {
                      background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                      color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : '#9ca3af',
                    }
                  : {
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      boxShadow: '0 0 24px rgba(59,130,246,0.4), 0 2px 8px rgba(0,0,0,0.4)',
                      border: '1px solid rgba(139,92,246,0.4)',
                    }
              }
            >
              {/* Shimmer sweep */}
              {isActive && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                />
              )}

              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{label}</span>
                  <motion.div
                    animate={isActive ? { x: [0, 3, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                    className="flex items-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </>
              )}
            </motion.button>
          </>
        )}
      </div>
    </div>
  )
}
