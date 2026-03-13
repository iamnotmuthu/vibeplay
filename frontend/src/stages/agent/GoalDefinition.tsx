import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Zap,
  Database,
  ChevronDown,
  ChevronUp,
  Bot,
  AlertTriangle,
  ArrowDown,
  Sparkles,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getGoalData } from '@/lib/agent/goalData'

// ─── Typing Animation Hook ──────────────────────────────────────────────────

function useTypingAnimation(
  text: string,
  enabled: boolean,
  speed: number = 30,
  burstSize: number = 3,
) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset when text changes
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    setShowCursor(true)
    indexRef.current = 0
  }, [text])

  // Typing effect
  useEffect(() => {
    if (!enabled || !text) return

    const tick = () => {
      const next = Math.min(indexRef.current + burstSize, text.length)
      setDisplayed(text.slice(0, next))
      indexRef.current = next

      if (next >= text.length) {
        setDone(true)
        return
      }
      timerRef.current = setTimeout(tick, speed)
    }

    timerRef.current = setTimeout(tick, 200) // initial delay

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, enabled, speed, burstSize])

  // Blinking cursor
  useEffect(() => {
    if (done) {
      // Keep cursor visible for 1s after done, then hide
      const t = setTimeout(() => setShowCursor(false), 1000)
      return () => clearTimeout(t)
    }
    const interval = setInterval(() => setShowCursor((v) => !v), 530)
    return () => clearInterval(interval)
  }, [done])

  return { displayed, done, showCursor }
}

// ─── Blinking Cursor ─────────────────────────────────────────────────────────

function TypingCursor({
  visible,
  color,
}: {
  visible: boolean
  color: string
}) {
  return (
    <span
      className="inline-block w-[2px] h-[1.15em] align-text-bottom ml-0.5 rounded-full"
      style={{
        background: color,
        opacity: visible ? 0.9 : 0,
        transition: 'opacity 0.08s',
      }}
      aria-hidden="true"
    />
  )
}

// ─── Sonar Pulse Animation ──────────────────────────────────────────────────

function SonarPulse({ color }: { color: string }) {
  return (
    <div className="relative flex items-center justify-center w-full py-6">
      {/* Concentric rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            border: `1.5px solid ${color}`,
            width: 24 + i * 28,
            height: 24 + i * 28,
          }}
          initial={{ opacity: 0.7, scale: 0.6 }}
          animate={{ opacity: 0, scale: 1.2 }}
          transition={{
            duration: 1.2,
            delay: i * 0.25,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* Center dot */}
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{ background: color }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

// ─── Decompose Goal Button ──────────────────────────────────────────────────

function DecomposeButton({
  onClick,
  color,
}: {
  onClick: () => void
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex justify-center"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white cursor-pointer overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          boxShadow: `0 2px 16px ${color}30, 0 2px 8px rgba(0,0,0,0.08)`,
          border: `1px solid ${color}40`,
        }}
      >
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          aria-hidden="true"
        />
        <Sparkles className="w-4 h-4 relative z-10" aria-hidden="true" />
        <span className="relative z-10">Decompose Goal</span>
      </motion.button>
    </motion.div>
  )
}

// ─── Decomposition Card ───────────────────────────────────────────────────

function DecompCard({
  icon,
  label,
  items,
  color,
  delay,
  reasoning,
}: {
  icon: React.ReactNode
  label: string
  items: string[]
  color: string
  delay: number
  reasoning?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const panelId = `decomp-panel-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: `${color}30` }}
    >
      <button
        onClick={() => reasoning && setExpanded(!expanded)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
        aria-expanded={reasoning ? expanded : undefined}
        aria-controls={reasoning ? panelId : undefined}
        aria-label={`${label}: ${items.join(', ')}`}
        style={{ cursor: reasoning ? 'pointer' : 'default' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}12` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {label}
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {items.map((item) => (
              <span
                key={item}
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${color}10`, color }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        {reasoning ? (
          <div className="shrink-0 text-gray-300">
            {expanded ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </div>
        ) : (
          <div className="shrink-0 w-4" />
        )}
      </button>

      {/* L2: Reasoning panel */}
      <AnimatePresence>
        {expanded && reasoning && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`${label} reasoning`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3.5 pt-0">
              <div
                className="rounded-lg px-3 py-2.5 text-xs text-gray-600 leading-relaxed"
                style={{ background: `${color}06`, borderLeft: `2px solid ${color}40` }}
              >
                <span className="font-semibold text-gray-700">Why this matters: </span>
                {reasoning}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Key Risk Callout ─────────────────────────────────────────────────────

function KeyRiskCallout({ risk, delay }: { risk: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 flex items-start gap-3"
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">What to Watch For</span>
        <p className="text-xs text-amber-900 leading-relaxed mt-0.5">{risk}</p>
      </div>
    </motion.div>
  )
}

// ─── Stage Explainer ──────────────────────────────────────────────────────

function GoalExplainer({ viewMode }: { viewMode: 'business' | 'technical' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
    >
      <div className="flex items-start gap-3">
        <Target className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-gray-700 leading-relaxed">
          {viewMode === 'business'
            ? 'Write a job description for your agent. Define what the agent should accomplish, and the platform breaks that goal into the specific actions, data sources, and oversight rules it needs. Every downstream decision flows from this.'
            : 'The goal statement is decomposed into execution phases, data dependencies, and trust boundaries. Actions are classified by autonomy tier (autonomous, supervised, escalation). Data sources are typed (text, tabular, structured DB, API) to drive retrieval strategy. The resulting goal graph feeds instruction generation, capability mapping, and architecture composition.'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Scroll Affordance ────────────────────────────────────────────────────

function ScrollAffordance() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) setVisible(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 1.5 }}
      className="sm:hidden fixed bottom-16 left-1/2 -translate-x-1/2 z-10"
    >
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 shadow-md border border-gray-200 text-xs text-gray-500"
      >
        <ArrowDown className="w-3 h-3" aria-hidden="true" />
        Scroll for more
      </motion.div>
    </motion.div>
  )
}

// ─── Phase State Machine ─────────────────────────────────────────────────

type GoalPhase = 'typing' | 'awaiting-decompose' | 'pulsing' | 'revealed'

// Animation timing constants
const SONAR_DURATION_MS = 1400

// ─── Main Component ───────────────────────────────────────────────────────

export function GoalDefinition() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const goalData = activeTileId ? getGoalData(activeTileId) : null
  const accentColor = tile?.color ?? '#f59e0b'

  const [phase, setPhase] = useState<GoalPhase>('typing')
  const prevTileRef = useRef(activeTileId)
  const sonarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset phase when tile changes — clear any pending sonar timer
  useEffect(() => {
    if (activeTileId !== prevTileRef.current) {
      if (sonarTimerRef.current) {
        clearTimeout(sonarTimerRef.current)
        sonarTimerRef.current = null
      }
      setPhase('typing')
      prevTileRef.current = activeTileId
    }
  }, [activeTileId])

  // Cleanup sonar timer on unmount
  useEffect(() => {
    return () => {
      if (sonarTimerRef.current) clearTimeout(sonarTimerRef.current)
    }
  }, [])

  const goalText = goalData?.goalStatement ?? ''

  const { displayed, done, showCursor } = useTypingAnimation(
    goalText,
    phase === 'typing',
  )

  // When typing finishes, show the decompose button
  useEffect(() => {
    if (done && phase === 'typing') {
      setPhase('awaiting-decompose')
    }
  }, [done, phase])

  const handleDecompose = useCallback(() => {
    // Guard: only trigger from awaiting-decompose phase
    if (phase !== 'awaiting-decompose') return
    setPhase('pulsing')
    sonarTimerRef.current = setTimeout(() => {
      sonarTimerRef.current = null
      setPhase('revealed')
    }, SONAR_DURATION_MS)
  }, [phase])

  if (!tile || !goalData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">No tile selected.</p>
      </div>
    )
  }

  const { decomposition, businessSummary, technicalSummary, keyRisk } = goalData

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      {/* Stage explainer */}
      <GoalExplainer viewMode={viewMode} />

      {/* Goal statement — typing animation with blinking cursor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="rounded-xl border bg-white p-5"
        style={{ borderColor: `${accentColor}25` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Agent Goal
          </span>
        </div>
        <p className="text-lg sm:text-xl font-semibold text-gray-900 leading-relaxed">
          {phase === 'typing' ? (
            <>
              {displayed}
              <TypingCursor visible={showCursor} color={accentColor} />
            </>
          ) : (
            goalText
          )}
        </p>
        <motion.div
          role="progressbar"
          aria-valuenow={phase !== 'typing' ? 100 : Math.round((displayed.length / Math.max(goalText.length, 1)) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Goal typing progress"
          initial={{ width: 0 }}
          animate={{ width: phase !== 'typing' ? '100%' : `${(displayed.length / Math.max(goalText.length, 1)) * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-0.5 rounded-full mt-3"
          style={{ background: `${accentColor}30` }}
        />
      </motion.div>

      {/* Phase: awaiting-decompose — show the Decompose Goal button */}
      <AnimatePresence mode="wait">
        {phase === 'awaiting-decompose' && (
          <DecomposeButton onClick={handleDecompose} color={accentColor} />
        )}
      </AnimatePresence>

      {/* Phase: pulsing — sonar animation */}
      <AnimatePresence>
        {phase === 'pulsing' && (
          <motion.div
            key="sonar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <SonarPulse color={accentColor} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: revealed — summary + risk + decomposition cards */}
      <AnimatePresence>
        {phase === 'revealed' && (
          <motion.div
            key="revealed-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Summary line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-xs text-gray-500 leading-relaxed"
            >
              {viewMode === 'business' ? businessSummary : technicalSummary}
            </motion.p>

            {/* Key risk callout */}
            <KeyRiskCallout risk={keyRisk} delay={0.2} />

            {/* Decomposition cards */}
            <div className="space-y-3">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Goal Decomposition
              </motion.h3>

              <DecompCard
                icon={<Target className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />}
                label="What the agent does"
                items={decomposition.primaryActions}
                color={accentColor}
                delay={0.35}
                reasoning={decomposition.reasoning}
              />
              <DecompCard
                icon={<Zap className="w-4 h-4" style={{ color: '#8b5cf6' }} aria-hidden="true" />}
                label="When it needs help"
                items={decomposition.secondaryActions}
                color="#8b5cf6"
                delay={0.4}
              />
              <DecompCard
                icon={<Database className="w-4 h-4" style={{ color: '#0369a1' }} aria-hidden="true" />}
                label="Main data it uses"
                items={decomposition.primaryData}
                color="#0369a1"
                delay={0.45}
              />
              <DecompCard
                icon={<Database className="w-4 h-4" style={{ color: '#6b7280' }} aria-hidden="true" />}
                label="Additional context"
                items={decomposition.supportingData}
                color="#6b7280"
                delay={0.5}
              />
            </div>

            {/* Trust boundary hints — technical mode only */}
            {viewMode === 'technical' && decomposition.trustBoundaryHints && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.3 }}
                className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3"
              >
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Trust Boundaries
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-[10px] font-bold text-green-700">Autonomous</span>
                    </div>
                    {decomposition.trustBoundaryHints.autonomous.map((item) => (
                      <p key={item} className="text-[10px] text-gray-500 pl-3.5">{item}</p>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-[10px] font-bold text-amber-700">Supervised</span>
                    </div>
                    {decomposition.trustBoundaryHints.supervised.map((item) => (
                      <p key={item} className="text-[10px] text-gray-500 pl-3.5">{item}</p>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-[10px] font-bold text-red-700">Escalation</span>
                    </div>
                    {decomposition.trustBoundaryHints.escalation.map((item) => (
                      <p key={item} className="text-[10px] text-gray-500 pl-3.5">{item}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile scroll affordance */}
      <ScrollAffordance />
    </div>
  )
}
