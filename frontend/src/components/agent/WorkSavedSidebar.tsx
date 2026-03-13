import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { AGENT_STAGE_ORDER } from '@/store/agentTypes'
import { getWorkSavedEntries, getStageReceipt } from '@/lib/agent/workSavedData'

// ─── Iteration Counter ──────────────────────────────────────────────────

function IterationCounter({ count, accentColor }: { count: number; accentColor: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: `${accentColor}08` }}>
      <motion.div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: `${accentColor}15` }}
        animate={count > 0 ? { scale: [1, 1.15, 1] } : undefined}
        transition={{ duration: 0.3 }}
        key={count}
      >
        <span className="text-xs font-bold" style={{ color: accentColor }}>{count}</span>
      </motion.div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Iterations</p>
        <p className="text-[9px] text-gray-400">Engine processing cycles</p>
      </div>
    </div>
  )
}

// ─── Stage Receipt Card ─────────────────────────────────────────────────

function ReceiptCard({
  stageLabel,
  duration,
  itemsProcessed,
  highlights,
  index,
}: {
  stageLabel: string
  duration: string
  itemsProcessed: number
  highlights: string[]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="rounded-lg border border-gray-100 bg-white p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-green-500" aria-hidden="true" />
          <span className="text-[11px] font-bold text-gray-900">{stageLabel}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-gray-400">
          <Clock className="w-2.5 h-2.5" aria-hidden="true" />
          <span>{duration}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500">
          <strong className="text-gray-700">{itemsProcessed}</strong> items processed
        </span>
      </div>

      {highlights.length > 0 && (
        <div className="space-y-1">
          {highlights.map((h, i) => (
            <p key={i} className="text-[10px] text-gray-500 leading-snug pl-2" style={{ borderLeft: '2px solid #e5e7eb' }}>
              {h}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── Work Saved Entry Row ───────────────────────────────────────────────

function WorkSavedRow({
  icon,
  metric,
  value,
  index,
}: {
  icon: string
  metric: string
  value: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex items-start gap-2 py-1.5"
    >
      <span className="text-sm shrink-0" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-700">{metric}</p>
        <p className="text-[10px] text-gray-400">{value}</p>
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export function WorkSavedSidebar() {
  const {
    workSavedOpen,
    toggleWorkSaved,
    activeTileId,
    completedStages,
    iterationCount,
    currentStage,
    addWorkSavedEntries,
    addStageReceipt,
    incrementIteration,
    workSavedEntries,
    stageReceipts,
  } = useAgentPlaygroundStore()

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const accentColor = tile?.color ?? '#3b82f6'
  const prevStageRef = useRef(currentStage)

  // On stage transition: add receipt + work entries + increment counter
  useEffect(() => {
    if (currentStage === prevStageRef.current) return
    if (currentStage === 'tiles') {
      prevStageRef.current = currentStage
      return
    }

    const prevStage = prevStageRef.current
    prevStageRef.current = currentStage

    if (!activeTileId || prevStage === 'tiles') return

    // Add receipt for the stage we just LEFT
    const receipt = getStageReceipt(activeTileId, prevStage)
    if (receipt && receipt.itemsProcessed > 0) {
      addStageReceipt(receipt)
    }

    // Add work-saved entries for the stage we just LEFT
    const entries = getWorkSavedEntries(activeTileId, prevStage)
    if (entries.length > 0) {
      addWorkSavedEntries(entries)
    }

    // Increment iteration counter
    incrementIteration()
  }, [currentStage, activeTileId, addStageReceipt, addWorkSavedEntries, incrementIteration])

  // Don't render during tile selection
  if (!activeTileId || currentStage === 'tiles') return null

  // Calculate progress
  const completedCount = [...completedStages].filter((s) => s !== 'tiles').length
  const totalStages = AGENT_STAGE_ORDER.length
  const progressPct = Math.round((completedCount / totalStages) * 100)

  return (
    <>
      {/* Toggle tab on the right edge */}
      {!workSavedOpen && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          onClick={toggleWorkSaved}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1 pl-2 pr-1 py-3 rounded-l-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-shadow hover:shadow-md"
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRight: 'none',
            color: accentColor,
            writingMode: 'vertical-lr',
            textOrientation: 'mixed',
          }}
          aria-label="Open work saved sidebar"
        >
          <ChevronLeft className="w-3 h-3 rotate-90" aria-hidden="true" />
          <Sparkles className="w-3 h-3 mb-1" aria-hidden="true" />
          <span style={{ writingMode: 'vertical-lr' }}>Work Saved</span>
          {workSavedEntries.length > 0 && (
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white mt-1"
              style={{ background: accentColor }}
            >
              {workSavedEntries.length}
            </span>
          )}
        </motion.button>
      )}

      {/* Sidebar panel */}
      <AnimatePresence>
        {workSavedOpen && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-14 bottom-0 w-72 z-30 flex flex-col"
            style={{
              background: '#fafafa',
              borderLeft: '1px solid #e5e7eb',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.06)',
            }}
            role="complementary"
            aria-label="Work saved sidebar"
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between shrink-0"
              style={{ borderBottom: '1px solid #e5e7eb' }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-900">Work Saved</h3>
              </div>
              <button
                onClick={toggleWorkSaved}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4 text-gray-400" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* Iteration counter */}
              <IterationCounter count={iterationCount} accentColor={accentColor} />

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Progress</span>
                  <span className="text-[10px] text-gray-400">{completedCount}/{totalStages} stages</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden bg-gray-200"
                  role="progressbar"
                  aria-valuenow={completedCount}
                  aria-valuemin={0}
                  aria-valuemax={totalStages}
                  aria-label={`${completedCount} of ${totalStages} stages completed`}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Stage receipts — "What Just Happened" */}
              {stageReceipts.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    What Just Happened
                  </h4>
                  <div className="space-y-2">
                    {stageReceipts.map((r, i) => (
                      <ReceiptCard
                        key={`${r.stageId}-${i}`}
                        stageLabel={r.stageLabel}
                        duration={r.duration}
                        itemsProcessed={r.itemsProcessed}
                        highlights={r.highlights}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Work saved entries */}
              {workSavedEntries.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Cumulative Value
                  </h4>
                  <div className="divide-y divide-gray-100">
                    {workSavedEntries.map((entry, i) => (
                      <WorkSavedRow
                        key={`${entry.stageId}-${entry.metric}-${i}`}
                        icon={entry.icon}
                        metric={entry.metric}
                        value={entry.value}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {stageReceipts.length === 0 && workSavedEntries.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="w-6 h-6 text-gray-300 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-[11px] text-gray-400">
                    Complete stages to see work saved metrics.
                  </p>
                </div>
              )}
            </div>

            {/* Footer summary */}
            {workSavedEntries.length > 0 && (
              <div
                className="px-4 py-3 shrink-0"
                style={{ borderTop: '1px solid #e5e7eb', background: '#ffffff' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${accentColor}10` }}
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-900">
                      {workSavedEntries.length} metrics tracked
                    </p>
                    <p className="text-[9px] text-gray-400">
                      Across {stageReceipts.length} completed stage{stageReceipts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
