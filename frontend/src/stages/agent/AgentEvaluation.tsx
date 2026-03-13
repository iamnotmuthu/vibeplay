import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react'
import type { PatternClassification } from '@/store/agentTypes'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getEvaluationData } from '@/lib/agent/evaluationData'
import { getEvalMetrics, getMetricWhy } from '@/lib/agent/componentTechData'
import { getPatternDiscoveryData } from '@/lib/agent/patternDiscoveryData'
import {
  PATTERN_CLASSIFICATION_META,
} from '@/store/agentTypes'
import type {
  DiscoveredPattern,
  ScenarioTest,
} from '@/store/agentTypes'

// ─── Metrics Bar ────────────────────────────────────────────────────────

function MetricsBar({
  totalPatterns,
  dominantCount,
  nonDominantCount,
  fuzzyCount,
  accentColor,
  activeTab,
  onTabChange,
}: {
  totalPatterns: number
  dominantCount: number
  nonDominantCount: number
  fuzzyCount: number
  accentColor: string
  activeTab: PatternClassification
  onTabChange: (tab: PatternClassification) => void
}) {
  const items: {
    label: string
    value: string
    color?: string
    classification?: PatternClassification
  }[] = [
    { label: 'Total Patterns', value: String(totalPatterns) },
    { label: PATTERN_CLASSIFICATION_META.dominant.label, value: String(dominantCount), color: PATTERN_CLASSIFICATION_META.dominant.color, classification: 'dominant' as PatternClassification },
    { label: PATTERN_CLASSIFICATION_META['non-dominant'].label, value: String(nonDominantCount), color: PATTERN_CLASSIFICATION_META['non-dominant'].color, classification: 'non-dominant' as PatternClassification },
    { label: PATTERN_CLASSIFICATION_META.fuzzy.label, value: String(fuzzyCount), color: PATTERN_CLASSIFICATION_META.fuzzy.color, classification: 'fuzzy' as PatternClassification },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      role="tablist"
      aria-label="Pattern Classifications"
    >
      {items.map((m) => {
        const isClickable = !!m.classification
        const isActive = isClickable && activeTab === m.classification

        return isClickable ? (
          <button
            key={m.label}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(m.classification!)}
            className="rounded-xl p-3 text-center transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            style={
              isActive
                ? {
                    background: m.color,
                    border: `2px solid ${m.color}`,
                    boxShadow: `0 2px 12px ${m.color}4D`,
                  }
                : {
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                  }
            }
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: isActive ? 'rgba(255,255,255,0.8)' : '#6b7280' }}
            >
              {m.label}
            </p>
            <p
              className="text-xl font-black"
              style={{ color: isActive ? '#ffffff' : m.color }}
            >
              {m.value}
            </p>
          </button>
        ) : (
          <div
            key={m.label}
            className="bg-white rounded-xl p-3 border border-gray-200 text-center"
          >
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
              {m.label}
            </p>
            <p
              className="text-xl font-black"
              style={{ color: m.color ?? accentColor }}
            >
              {m.value}
            </p>
          </div>
        )
      })}
    </motion.div>
  )
}

// ─── Validation List (expanded under a pattern) ─────────────────────────

function ValidationList({
  questions,
}: {
  questions: string[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-3 pt-1 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
          Example User Questions
        </p>
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-2">
            <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-gray-700 leading-relaxed">{q}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Pattern Row (single pattern inside an accordion) ───────────────────

function PatternRow({
  pattern,
  validationCount,
  delay,
}: {
  pattern: DiscoveredPattern
  validationCount: number
  delay: number
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="rounded-lg border border-gray-100 bg-gray-50/50 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{pattern.label}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {pattern.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
          <span className="text-xs font-bold text-gray-700">
            {validationCount}
          </span>
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-gray-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3 h-3 text-gray-400" aria-hidden="true" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <ValidationList questions={pattern.exampleQuestions} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}


// ─── Stage Explainer ────────────────────────────────────────────────────

function EvalExplainer({ viewMode }: { viewMode: 'business' | 'technical' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
    >
      <div className="flex items-start gap-3">
        <ClipboardCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-gray-700 leading-relaxed">
          {viewMode === 'business'
            ? 'See how well your agent handles each type of request. Patterns are grouped by confidence level so you can quickly spot what works, what needs tuning, and what should be escalated to a human.'
            : 'Scenario-based validation across all discovered interaction paths. Each pattern is stress-tested against synthetic user queries with pass/fail scoring per trust lane. Results are bucketed by classification confidence (dominant, non-dominant, fuzzy) to surface coverage gaps and misrouted escalations.'}
        </p>
      </div>
    </motion.div>
  )
}


// ─── Measurement Plan ────────────────────────────────────────────────────

function AgentMeasurementPlan({ tileId, accentColor }: { tileId: string; accentColor: string }) {
  const metrics = getEvalMetrics(tileId)
  const why = getMetricWhy(tileId)
  if (!metrics || !why) return null

  const items = [
    { label: 'Primary Metric', name: metrics.metric1.name, shortName: metrics.metric1.shortName, description: metrics.metric1.description, why: why.why1, color: accentColor },
    { label: 'Secondary Metric', name: metrics.metric2.name, shortName: metrics.metric2.shortName, description: metrics.metric2.description, why: why.why2, color: '#6b7280' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Measurement Plan</span>
        <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
        <span className="text-[10px] text-gray-400 italic">metrics to be used for evaluation</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(({ label, name, description, why: whyText, color }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              background: '#ffffff',
              border: `1px solid ${color === accentColor ? `${color}40` : '#e5e7eb'}`,
              borderLeft: `3px solid ${color}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: `${color}14`, color, border: `1px solid ${color}30` }}
              >
                {label}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1 leading-snug">{name}</p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">{description}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed italic">{whyText}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────

export function AgentEvaluation() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const [activeTab, setActiveTab] = useState<PatternClassification>('dominant')

  const tileInfo = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const accentColor = tileInfo?.color || '#06b6d4'

  // Get evaluation & discovery data
  const evalData = useMemo(
    () => getEvaluationData(activeTileId || ''),
    [activeTileId]
  )
  const overview = evalData?.overview ?? {
    totalPatterns: 0,
    patternsHandled: 0,
    handlingByType: { simple: 0, hopping: 0, aggregator: 0, branch: 0, reasoning: 0 },
    overallConfidence: 0,
    dominantRate: 0,
    nonDominantRate: 0,
    fuzzyRate: 0,
  }
  const scenarios = evalData?.scenarios ?? []

  const discoveryData = useMemo(
    () => getPatternDiscoveryData(activeTileId || ''),
    [activeTileId]
  )

  const groups = discoveryData?.groups ?? []

  // Filter scenarios by classification group's pattern types
  const scenariosByClassification = useMemo(() => {
    const map = new Map<PatternClassification, ScenarioTest[]>()
    for (const group of groups) {
      const types = new Set(group.patterns.map((p) => p.patternType))
      const matching = scenarios.filter((s: ScenarioTest) => types.has(s.patternType))
      const existing = map.get(group.classification) ?? []
      map.set(group.classification, [...existing, ...matching])
    }
    return map
  }, [groups, scenarios])

  // Compute pattern counts for each classification
  const dominantCount = groups
    .find((g) => g.classification === 'dominant')
    ?.patterns.length ?? 0
  const nonDominantCount = groups
    .find((g) => g.classification === 'non-dominant')
    ?.patterns.length ?? 0
  const fuzzyCount = groups
    .find((g) => g.classification === 'fuzzy')
    ?.patterns.length ?? 0

  // Get active group and compute validation counts for it
  const activeGroup = groups.find((g) => g.classification === activeTab)
  const patternValidationCounts = useMemo(() => {
    if (!activeGroup) return new Map<string, number>()
    const counts = new Map<string, number>()
    const scenarios = scenariosByClassification.get(activeTab) ?? []
    for (const pattern of activeGroup.patterns) {
      const matching = scenarios.filter(
        (s) => s.patternType === pattern.patternType
      )
      const sameTypePatterns = activeGroup.patterns.filter(
        (p) => p.patternType === pattern.patternType
      )
      counts.set(
        pattern.id,
        Math.round(matching.length / sameTypePatterns.length)
      )
    }
    return counts
  }, [activeGroup, activeTab, scenariosByClassification])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col px-4 sm:px-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-black text-gray-900 mb-1">
          Agent Evaluation
        </h1>
        <p className="text-sm text-gray-600">
          How well your agent handles each type of request. Click any
          pattern to see example user questions.
        </p>
      </motion.div>

      {/* Explainer */}
      <div className="mb-6">
        <EvalExplainer viewMode={viewMode} />
      </div>

      {/* Measurement Plan */}
      {activeTileId && (
        <AgentMeasurementPlan tileId={activeTileId} accentColor={accentColor} />
      )}

      {/* Metrics Bar (doubles as tab selector) */}
      <MetricsBar
        totalPatterns={overview.totalPatterns}
        dominantCount={dominantCount}
        nonDominantCount={nonDominantCount}
        fuzzyCount={fuzzyCount}
        accentColor={accentColor}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-8">
        {/* Tab content */}
        <div role="tabpanel" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          {activeGroup && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 mt-4"
            >
              {/* Description */}
              <div className="px-1 py-2">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {PATTERN_CLASSIFICATION_META[activeTab].description}
                </p>
              </div>

              {/* Pattern rows */}
              <div className="space-y-2">
                {activeGroup.patterns.map((pattern, i) => (
                  <PatternRow
                    key={pattern.id}
                    pattern={pattern}
                    validationCount={patternValidationCounts.get(pattern.id) ?? 0}
                    delay={0.05 + i * 0.04}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
