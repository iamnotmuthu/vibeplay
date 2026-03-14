import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react'
import type { PatternClassification, DiscoveredPattern, ScenarioTest, DimensionPattern } from '@/store/agentTypes'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { getEvaluationData } from '@/lib/agent/evaluationData'
import { getEvalMetrics, getMetricWhy } from '@/lib/agent/componentTechData'
import { getCombinatorialPatternsData } from '@/lib/agent/combinatorialPatternsData'
import { PATTERN_CLASSIFICATION_META } from '@/store/agentTypes'

// ─── Map combinatorial tier → classification ────────────────────────────

const TIER_TO_CLASSIFICATION: Record<string, PatternClassification> = {
  simple: 'dominant',
  complex: 'non-dominant',
  fuzzy: 'fuzzy',
}

function mapDimensionToDiscovered(dp: DimensionPattern, idx: number): DiscoveredPattern {
  return {
    id: dp.id,
    patternType: dp.patternType,
    classification: TIER_TO_CLASSIFICATION[dp.tier] || 'fuzzy',
    label: dp.name,
    description: dp.description,
    exampleQuestions: dp.exampleQuestions,
    coveragePct: dp.confidence,
    inferenceNote: dp.inferenceNotes,
    ambiguityNote: dp.ambiguityNotes,
    activatedComponents: dp.activatedComponents ?? [],
    importanceRank: idx + 1,
  }
}

interface PatternGroup {
  classification: PatternClassification
  patterns: DiscoveredPattern[]
}

// ─── Metrics Bar (tab selector) ─────────────────────────────────────────


function MetricsBar({
  dominantCount,
  nonDominantCount,
  fuzzyCount,
  activeTab,
  onTabChange,
}: {
  dominantCount: number
  nonDominantCount: number
  fuzzyCount: number
  activeTab: PatternClassification
  onTabChange: (tab: PatternClassification) => void
}) {
  const tabs: { classification: PatternClassification; count: number }[] = [
    { classification: 'dominant', count: dominantCount },
    { classification: 'non-dominant', count: nonDominantCount },
    { classification: 'fuzzy', count: fuzzyCount },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="mb-6"
      role="tablist"
      aria-label="Pattern Classifications"
    >

      {/* Colored tab tiles */}
      <div className="grid grid-cols-3 gap-3">
        {tabs.map(({ classification, count }) => {
          const meta = PATTERN_CLASSIFICATION_META[classification]
          const isActive = activeTab === classification
          return (
            <motion.button
              key={classification}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(classification)}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl p-4 text-center transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              style={{
                background: isActive ? meta.activeBg : meta.bgColor,
                border: `1px solid ${meta.borderColor}`,
                borderBottom: isActive ? `4px solid ${meta.color}` : `1px solid ${meta.borderColor}`,
              }}
            >
              <div className="text-2xl font-bold" style={{ color: meta.color }}>
                {count}
              </div>
              <div className="text-sm font-semibold text-gray-700 mt-1">{meta.label}</div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Expanded Pattern Detail (questions) ────────────────────────────────

function PatternDetail({ pattern }: { pattern: DiscoveredPattern }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 pt-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
          Example User Questions
        </p>
        <div className="space-y-1.5">
          {pattern.exampleQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-xs text-gray-700 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Pattern Row ────────────────────────────────────────────────────────

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
          <p className="text-sm font-bold text-gray-900 mb-0.5">{pattern.label}</p>
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
        {expanded && <PatternDetail pattern={pattern} />}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Metric color system (maximally distinct — same as SolutionArchitecture) ──

const EVAL_METRIC_COLORS: { color: string; bg: string }[] = [
  { color: '#059669', bg: '#ecfdf5' }, // emerald — primary
  { color: '#2563eb', bg: '#eff6ff' }, // blue — secondary
  { color: '#d97706', bg: '#fffbeb' }, // amber — tertiary
  { color: '#9333ea', bg: '#faf5ff' }, // purple — quaternary
]

// ─── Measurement Plan (target only — tests haven't run yet) ──────────────

function AgentMeasurementPlan({ tileId }: { tileId: string }) {
  const metrics = getEvalMetrics(tileId)
  const why = getMetricWhy(tileId)
  if (!metrics || !why) return null

  const items = [
    { label: 'Primary Metric', metric: metrics.metric1, why: why.why1 },
    { label: 'Secondary Metric', metric: metrics.metric2, why: why.why2 },
    { label: 'Tertiary Metric', metric: metrics.metric3, why: why.why3 },
    { label: 'Quaternary Metric', metric: metrics.metric4, why: why.why4 },
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
        <span className="text-[10px] text-gray-400 italic">how we will evaluate the agent</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(({ label, metric, why: whyText }, idx) => {
          const mc = EVAL_METRIC_COLORS[idx] || EVAL_METRIC_COLORS[0]

          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.1, duration: 0.35, ease: 'easeOut' }}
              className="rounded-xl p-4"
              style={{
                background: '#ffffff',
                border: `1px solid ${mc.color}25`,
                borderLeft: `3px solid ${mc.color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: `${mc.color}14`, color: mc.color, border: `1px solid ${mc.color}30` }}
                >
                  {label}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1 leading-snug">{metric.name}</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{metric.description}</p>

              {/* Target value — the only measurable shown pre-test */}
              <div className="flex items-baseline gap-1.5 mb-2 px-2.5 py-1.5 rounded-lg" style={{ background: mc.bg }}>
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: mc.color }}>Target</span>
                <span className="text-sm font-bold text-gray-900 tabular-nums">
                  {metric.target} {metric.unit}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed italic">{whyText}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export function AgentEvaluation() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const [activeTab, setActiveTab] = useState<PatternClassification>('dominant')

  // Get evaluation & discovery data
  const evalData = useMemo(
    () => getEvaluationData(activeTileId || ''),
    [activeTileId]
  )
  const scenarios = evalData?.scenarios ?? []

  // Use the SAME combinatorial patterns as the Patterns stage
  const groups: PatternGroup[] = useMemo(() => {
    const payload = getCombinatorialPatternsData(activeTileId || '')
    if (!payload) return []
    const byClassification = new Map<PatternClassification, DiscoveredPattern[]>()
    payload.patterns.forEach((dp, idx) => {
      const mapped = mapDimensionToDiscovered(dp, idx)
      const existing = byClassification.get(mapped.classification) ?? []
      existing.push(mapped)
      byClassification.set(mapped.classification, existing)
    })
    const result: PatternGroup[] = []
    for (const cls of ['dominant', 'non-dominant', 'fuzzy'] as PatternClassification[]) {
      const patterns = byClassification.get(cls) ?? []
      if (patterns.length > 0) result.push({ classification: cls, patterns })
    }
    return result
  }, [activeTileId])

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
          pattern to see the resolution flow and example questions.
        </p>
      </motion.div>

      {/* Measurement Plan (4 metrics) */}
      {activeTileId && (
        <AgentMeasurementPlan tileId={activeTileId} />
      )}

      {/* Metrics Bar (doubles as tab selector) */}
      <MetricsBar
        dominantCount={dominantCount}
        nonDominantCount={nonDominantCount}
        fuzzyCount={fuzzyCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-8">
        <div role="tabpanel" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            {activeGroup && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 mt-4"
              >
                {/* Classification description */}
                <div className="px-1 py-2">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {PATTERN_CLASSIFICATION_META[activeTab].description}
                  </p>
                </div>

                {/* Patterns flat list */}
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
