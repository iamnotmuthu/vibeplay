// ─── AgentPlaygroundV3Shell ─────────────────────────────────────────────────
// Prescriptive AI Playground — V3 enhanced version.
// Uses the SAME store but swaps in V3-enhanced stage components.
// V3 stages add: destination preview, structural discovery canvas,
// high-risk scenario details, test data preparation, meta-pattern architecture.
// ────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, LayoutGrid, Loader2, BookOpen, Target } from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { AGENT_STAGE_LABELS, AGENT_STAGE_NUMBERS } from '@/store/agentTypes'
import type { AgentStageId } from '@/store/agentTypes'
import { AGENT_TILE_MAP, getBridge } from '@/lib/agent/agentDomainData'
import { ViewModeToggle } from '@/components/shared/ViewModeToggle'
import { AgentGlossaryPanel } from './AgentGlossaryPanel'
import { AgentTileSelector } from './AgentTileSelector'
import { AgentStepperNav } from './AgentStepperNav'
import { AgentBottomBar } from './AgentBottomBar'
import { getGoalDataV3 } from '@/lib/agent/goalDataV3'
// V3-enhanced stage components
import { GoalDefinitionV3 } from '@/stages/agent/GoalDefinitionV3'
import { ContextDefinitionV3 } from '@/stages/agent/ContextDefinitionV3'
import { ContextDimensionsV3 } from '@/stages/agent/ContextDimensionsV3'
import { InteractionDiscoveryV3 } from '@/stages/agent/InteractionDiscoveryV3'
import { AgentEvaluation } from '@/stages/agent/AgentEvaluation'
import { SolutionArchitectureV3 } from '@/stages/agent/SolutionArchitectureV3'
import { MonitoringModal } from '@/stages/agent/MonitoringModal'
import { AgentCompletionModal } from './AgentCompletionModal'

interface AgentPlaygroundV3ShellProps {
  onBack: () => void
}

// ─── Transition Overlay ───────────────────────────────────────────────────

function TransitionOverlay({
  message,
  accentColor,
}: {
  message: string
  accentColor: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4"
      style={{ background: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(4px)' }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      >
        <Loader2 className="w-8 h-8" style={{ color: accentColor }} />
      </motion.div>
      <motion.p
        className="text-sm font-semibold text-gray-700 text-center max-w-md px-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        {message}
      </motion.p>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accentColor }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Stage Placeholder ────────────────────────────────────────────────────

function StagePlaceholder({ stageId }: { stageId: AgentStageId }) {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const stageNum = AGENT_STAGE_NUMBERS[stageId]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: tile?.bgTint ?? 'rgba(245,158,11,0.06)' }}
      >
        <span className="text-2xl font-bold" style={{ color: tile?.color ?? '#f59e0b' }}>
          {stageNum}
        </span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">{AGENT_STAGE_LABELS[stageId]}</h2>
      <p className="text-sm text-gray-500 max-w-md">
        {tile?.stageSubtitles?.[stageId] ?? 'Stage content coming soon.'}
      </p>
    </div>
  )
}

// ─── Main Shell ───────────────────────────────────────────────────────────

export function AgentPlaygroundV3Shell({ onBack }: AgentPlaygroundV3ShellProps) {
  const {
    currentStage,
    activeTileId,
    viewMode,
    selectTile,
    setViewMode,
    glossaryOpen,
    toggleGlossary,
    reset,
    resetToTiles,
  } = useAgentPlaygroundStore()

  const [transitioning, setTransitioning] = useState(false)
  const [transitionMessage, setTransitionMessage] = useState('')
  const [prevStage, setPrevStage] = useState<AgentStageId>(currentStage)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const v3GoalData = activeTileId ? getGoalDataV3(activeTileId) : null
  const goalBarText = v3GoalData?.goalStatement ?? tile?.goalStatement ?? ''
  const accentColor = tile?.color ?? '#f59e0b'

  // Sync viewMode with main playground store
  const mainViewMode = usePlaygroundStore((s) => s.viewMode)
  useEffect(() => {
    setViewMode(mainViewMode)
  }, [mainViewMode, setViewMode])

  // Reset on unmount
  useEffect(() => {
    return () => reset()
  }, [reset])

  // Narrative bridge transition between stages
  useEffect(() => {
    if (
      currentStage !== prevStage &&
      currentStage !== 'tiles' &&
      prevStage !== 'tiles'
    ) {
      const bridgeText = getBridge(
        prevStage,
        currentStage,
        tile?.complexity ?? 'simple',
        viewMode
      )
      setTransitionMessage(bridgeText)
      setTransitioning(true)
      const timer = setTimeout(() => setTransitioning(false), 1500)
      setPrevStage(currentStage)
      return () => clearTimeout(timer)
    }
    setPrevStage(currentStage)
  }, [currentStage]) // eslint-disable-line react-hooks/exhaustive-deps -- intentional: fires only on stage change, reads stale prevStage/tile/viewMode for transition context

  const handleTileSelect = useCallback(
    (tileId: string) => {
      selectTile(tileId)
    },
    [selectTile]
  )

  const handleScenariosClick = () => {
    if (activeTileId) {
      setConfirmOpen(true)
    } else {
      onBack()
    }
  }

  const isTileSelection = false // Tile selection removed — Goal page handles scenario choice

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: '#fafafa' }}
    >
      {/* ── Brand Header — matches VibeModel playground top bar ───────── */}
      <header
        className="h-14 px-6 flex items-center justify-between shrink-0 z-20"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Left: Logo + Scenarios */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center hover:opacity-80 transition-opacity"
            aria-label="Back to playground home"
          >
            <img
              src={`${import.meta.env.BASE_URL}VM_Logo_Full Color.png`}
              alt="VibeModel"
              style={{ height: 36, width: 'auto' }}
            />
          </button>
          <button
            onClick={handleScenariosClick}
            title="Back to scenario selection"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{ color: '#6b7280', border: '1px solid #e5e7eb' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#111827'
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.background = '#f3f4f6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280'
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Scenarios</span>
          </button>
        </div>

        {/* Center: Demo mode pill */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#d97706' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
          Demo Mode · Simulated Data
        </div>

        {/* Right: ViewMode toggle, Glossary, Beta Waitlist, Book a Demo */}
        <div className="flex items-center gap-3">
          {!isTileSelection && <ViewModeToggle />}
          {!isTileSelection && (
            <button
              onClick={toggleGlossary}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{
                color: glossaryOpen ? '#8b5cf6' : '#6b7280',
                border: glossaryOpen ? '1px solid #c4b5fd' : '1px solid #e5e7eb',
                background: glossaryOpen ? 'rgba(139,92,246,0.06)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!glossaryOpen) {
                  e.currentTarget.style.color = '#111827'
                  e.currentTarget.style.borderColor = '#9ca3af'
                  e.currentTarget.style.background = '#f3f4f6'
                }
              }}
              onMouseLeave={(e) => {
                if (!glossaryOpen) {
                  e.currentTarget.style.color = '#6b7280'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
              aria-label={glossaryOpen ? 'Close glossary' : 'Open glossary'}
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Glossary</span>
            </button>
          )}
          <a
            href="https://vibemodel.ai/#beta-signup"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ border: '1px solid #e5e7eb', color: '#374151' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.color = '#111827'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.color = '#374151'
            }}
          >
            Beta Waitlist
          </a>
          <motion.a
            href="https://vibemodel.ai/book-demo.html"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -1, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-sm font-semibold relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 1px 4px rgba(59,130,246,0.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.4)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(59,130,246,0.3)' }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              aria-hidden="true"
            />
            <span className="relative z-10">Book a Demo</span>
            <ExternalLink className="w-3.5 h-3.5 relative z-10" aria-hidden="true" />
          </motion.a>
        </div>
      </header>

      {/* Goal bar (when tile is selected) — gradient background matching VibeModel */}
      {tile && !isTileSelection && (
        <div
          className="px-6 py-2 flex items-center gap-2 shrink-0"
          style={{
            background: 'linear-gradient(90deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))',
            borderBottom: '1px solid rgba(59,130,246,0.12)',
          }}
        >
          <Target className="w-3.5 h-3.5 shrink-0" style={{ color: tile.color }} aria-hidden="true" />
          <span className="text-xs font-semibold text-gray-500">Goal:</span>
          <span className="text-xs font-bold text-gray-800 truncate" title={goalBarText}>
            {goalBarText}
          </span>
        </div>
      )}

      {/* Stepper Navigation — numbered circles with stage labels */}
      <AgentStepperNav />

      {/* Glossary Panel — slide-in from right */}
      <AgentGlossaryPanel />

      {/* Stage content — scrollable area between fixed header/stepper and bottom bar */}
      <main className="flex-1 min-h-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isTileSelection && (
            <motion.div
              key="tiles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto pt-8"
            >
              <AgentTileSelector onSelect={handleTileSelect} />
            </motion.div>
          )}

          {!isTileSelection && (
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full overflow-y-auto"
            >
              {currentStage === 'goal' ? (
                <GoalDefinitionV3 />
              ) : currentStage === 'context-definition' ? (
                <ContextDefinitionV3 />
              ) : currentStage === 'context-dimensions' ? (
                <ContextDimensionsV3 />
              ) : currentStage === 'interaction-discovery' ? (
                <InteractionDiscoveryV3 />
              ) : currentStage === 'agent-evaluation' ? (
                <AgentEvaluation />
              ) : currentStage === 'solution-architecture' ? (
                <SolutionArchitectureV3 />
              ) : (
                <StagePlaceholder stageId={currentStage} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transition overlay with narrative bridge */}
        <AnimatePresence>
          {transitioning && (
            <TransitionOverlay
              message={transitionMessage}
              accentColor={accentColor}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Action Bar — persistent Continue / Back navigation */}
      <AgentBottomBar />

      {/* ── Monitoring Modal (launched from Step 6) ─────────────────── */}
      <MonitoringModal />

      {/* ── Completion Modal (shown after all stages) ─────────────── */}
      <AgentCompletionModal />

      {/* ── Scenario Switch Confirmation Dialog ───────────────────────── */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-xl p-6"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-gray-900 mb-2">Switch Scenario?</h3>
              <p className="text-sm text-gray-500 mb-5">
                Your current progress will be lost. Are you sure you want to go back to scenario selection?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmOpen(false)
                    resetToTiles()
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  Switch Scenario
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
