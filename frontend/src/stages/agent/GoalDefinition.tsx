import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Zap,
  Database,
  ChevronDown,
  ChevronUp,
  Bot,
  Info,
  AlertTriangle,
  ArrowDown,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getGoalData } from '@/lib/agent/goalData'

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

// ─── Main Component ───────────────────────────────────────────────────────

export function GoalDefinition() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const goalData = activeTileId ? getGoalData(activeTileId) : null
  const accentColor = tile?.color ?? '#f59e0b'

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

      {/* Goal statement — instant text with accent underline */}
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
          {goalData.goalStatement}
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="h-0.5 rounded-full mt-3"
          style={{ background: `${accentColor}30` }}
        />
      </motion.div>

      {/* Summary line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-xs text-gray-500 leading-relaxed"
      >
        {viewMode === 'business' ? businessSummary : technicalSummary}
      </motion.p>

      {/* Key risk callout */}
      <KeyRiskCallout risk={keyRisk} delay={0.5} />

      {/* Decomposition cards */}
      <div className="space-y-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs font-bold uppercase tracking-widest text-gray-400"
        >
          Goal Decomposition
        </motion.h3>

        <DecompCard
          icon={<Target className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />}
          label="What the agent does"
          items={decomposition.primaryActions}
          color={accentColor}
          delay={0.65}
          reasoning={decomposition.reasoning}
        />
        <DecompCard
          icon={<Zap className="w-4 h-4" style={{ color: '#8b5cf6' }} aria-hidden="true" />}
          label="When it needs help"
          items={decomposition.secondaryActions}
          color="#8b5cf6"
          delay={0.7}
        />
        <DecompCard
          icon={<Database className="w-4 h-4" style={{ color: '#0369a1' }} aria-hidden="true" />}
          label="Main data it uses"
          items={decomposition.primaryData}
          color="#0369a1"
          delay={0.75}
        />
        <DecompCard
          icon={<Database className="w-4 h-4" style={{ color: '#6b7280' }} aria-hidden="true" />}
          label="Additional context"
          items={decomposition.supportingData}
          color="#6b7280"
          delay={0.8}
        />
      </div>

      {/* Mobile scroll affordance */}
      <ScrollAffordance />
    </div>
  )
}
