import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_STAGE_ORDER, AGENT_STAGE_LABELS } from '@/store/agentTypes'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'

/**
 * Persistent bottom navigation bar for the Agent Playground.
 * Mirrors the VibeModel BottomActionBar pattern with the brand
 * blue→purple gradient CTA, frosted glass background, and
 * Framer Motion micro-interactions.
 */
export function AgentBottomBar() {
  const currentStage = useAgentPlaygroundStore((s) => s.currentStage)
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const nextStage = useAgentPlaygroundStore((s) => s.nextStage)
  const prevStage = useAgentPlaygroundStore((s) => s.prevStage)
  const openCompletionModal = useAgentPlaygroundStore((s) => s.openCompletionModal)

  // Don't show on tile selection screen
  if (currentStage === 'tiles') return null

  const idx = AGENT_STAGE_ORDER.indexOf(currentStage)
  const canGoBack = idx > 0
  const isLastStage = idx === AGENT_STAGE_ORDER.length - 1
  const nextStageId = !isLastStage ? AGENT_STAGE_ORDER[idx + 1] : null
  const nextLabel = nextStageId
    ? `Continue to ${AGENT_STAGE_LABELS[nextStageId]}`
    : null

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const prevStageId = canGoBack ? AGENT_STAGE_ORDER[idx - 1] : null
  const backLabel = prevStageId ? AGENT_STAGE_LABELS[prevStageId] : ''

  return (
    <div
      className="shrink-0 border-t px-6 py-3 flex items-center justify-between"
      style={{
        borderColor: '#e5e7eb',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Back button */}
      <div>
        {canGoBack && (
          <motion.button
            onClick={prevStage}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{ color: '#9ca3af' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#374151'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
            }}
            aria-label={`Back to ${backLabel}`}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </motion.button>
        )}
      </div>

      {/* Next CTA */}
      <div className="relative">
        {!isLastStage && nextLabel && (
          <>
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                filter: 'blur(10px)',
                opacity: 0.4,
              }}
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              aria-hidden="true"
            />

            <motion.button
              onClick={nextStage}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-bold text-white overflow-hidden transition-shadow cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                boxShadow: '0 2px 12px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid rgba(139,92,246,0.4)',
              }}
              aria-label={nextLabel}
            >
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                aria-hidden="true"
              />

              <span>{nextLabel}</span>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                className="flex items-center"
                aria-hidden="true"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </>
        )}

        {isLastStage && (
          <>
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                filter: 'blur(10px)',
                opacity: 0.4,
              }}
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              aria-hidden="true"
            />

            <motion.button
              onClick={openCompletionModal}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-bold text-white overflow-hidden transition-shadow cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                boxShadow: '0 2px 12px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid rgba(139,92,246,0.4)',
              }}
              aria-label="Finish"
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                aria-hidden="true"
              />

              <CheckCircle2 className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Finish</span>
            </motion.button>
          </>
        )}
      </div>
    </div>
  )
}
