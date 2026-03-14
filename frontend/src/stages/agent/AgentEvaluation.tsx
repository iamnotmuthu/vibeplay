import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { PatternClassification, DiscoveredPattern, ScenarioTest, IntentType } from '@/store/agentTypes'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getEvaluationData } from '@/lib/agent/evaluationData'
import { getEvalMetrics, getMetricWhy } from '@/lib/agent/componentTechData'
import { getPatternDiscoveryData } from '@/lib/agent/patternDiscoveryData'
import { PATTERN_CLASSIFICATION_META } from '@/store/agentTypes'

// ─── Intent Type Visual Config ──────────────────────────────────────────

const INTENT_META: Record<IntentType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  explicit: {
    label: 'Explicit',
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
    icon: <Eye className="w-3 h-3" aria-hidden="true" />,
  },
  implicit: {
    label: 'Implicit',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    icon: <EyeOff className="w-3 h-3" aria-hidden="true" />,
  },
}

// ─── Metrics Bar (tab selector) ─────────────────────────────────────────

const SUBTITLES: Record<PatternClassification, string> = {
  dominant: 'High-confidence patterns',
  'non-dominant': 'Multi-step complexity',
  fuzzy: 'Ambiguous confidence',
}

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
      {/* Summary line */}
      <p className="text-[11px] text-gray-400 mb-3">
        <span className="font-semibold" style={{ color: accentColor }}>{totalPatterns}</span> total patterns evaluated
      </p>

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
              <div className="text-[10px] mt-0.5" style={{ color: `${meta.color}99` }}>
                {SUBTITLES[classification]}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Resolution Flow (horizontal: Query → Pattern → Components → Output) ─

function ResolutionFlow({ pattern }: { pattern: DiscoveredPattern }) {
  const steps = [
    {
      label: 'Query',
      content: pattern.exampleQuestions[0] ?? 'User query',
      color: '#3b82f6',
    },
    {
      label: 'Pattern',
      content: pattern.label,
      color: '#8b5cf6',
    },
    {
      label: 'Components',
      content: pattern.activatedComponents.slice(0, 4).join(' → '),
      color: '#059669',
    },
    {
      label: 'Output',
      content: 'Resolved response',
      color: '#ea580c',
    },
  ]

  return (
    <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1 min-w-0">
          <div
            className="rounded-lg px-3 py-2 min-w-[120px] max-w-[180px]"
            style={{
              background: `${step.color}08`,
              border: `1px solid ${step.color}25`,
            }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: step.color }}
            >
              {step.label}
            </p>
            <p className="text-[11px] text-gray-700 leading-snug truncate">
              {step.content}
            </p>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Expanded Pattern Detail (flow + questions) ─────────────────────────

function PatternDetail({ pattern }: { pattern: DiscoveredPattern }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 pt-1 space-y-3">
        {/* Resolution Flow */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Resolution Flow
          </p>
          <ResolutionFlow pattern={pattern} />
        </div>

        {/* Example Questions */}
        <div>
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
  const intentType = pattern.intentType ?? 'explicit'
  const intentVis = INTENT_META[intentType]

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
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold text-gray-900">{pattern.label}</p>
            {/* Intent type badge */}
            <span
              className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
              style={{
                background: intentVis.bg,
                color: intentVis.color,
                border: `1px solid ${intentVis.border}`,
              }}
            >
              {intentVis.icon}
              {intentVis.label}
            </span>
          </div>
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

// ─── Intent Sub-Section (collapsible group within a tab) ────────────────

function IntentSubSection({
  intentType,
  patterns,
  validationCounts,
  baseDelay,
}: {
  intentType: IntentType
  patterns: DiscoveredPattern[]
  validationCounts: Map<string, number>
  baseDelay: number
}) {
  const [collapsed, setCollapsed] = useState(false)
  const vis = INTENT_META[intentType]

  if (patterns.length === 0) return null

  return (
    <div className="space-y-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full text-left cursor-pointer hover:opacity-80 transition-opacity py-1"
        aria-expanded={!collapsed}
      >
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: vis.bg, border: `1px solid ${vis.border}` }}
        >
          {vis.icon}
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: vis.color }}
          >
            {vis.label} Patterns
          </span>
          <span
            className="text-[10px] font-bold ml-1"
            style={{ color: vis.color }}
          >
            ({patterns.length})
          </span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        {collapsed ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            {patterns.map((pattern, i) => (
              <PatternRow
                key={pattern.id}
                pattern={pattern}
                validationCount={validationCounts.get(pattern.id) ?? 0}
                delay={baseDelay + i * 0.04}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Measurement Plan (4 metrics) ───────────────────────────────────────

function AgentMeasurementPlan({ tileId, accentColor }: { tileId: string; accentColor: string }) {
  const metrics = getEvalMetrics(tileId)
  const why = getMetricWhy(tileId)
  if (!metrics || !why) return null

  const items = [
    { label: 'Primary Metric', name: metrics.metric1.name, shortName: metrics.metric1.shortName, description: metrics.metric1.description, why: why.why1, color: accentColor },
    { label: 'Secondary Metric', name: metrics.metric2.name, shortName: metrics.metric2.shortName, description: metrics.metric2.description, why: why.why2, color: '#6b7280' },
    { label: 'Tertiary Metric', name: metrics.metric3.name, shortName: metrics.metric3.shortName, description: metrics.metric3.description, why: why.why3, color: '#0369a1' },
    { label: 'Quaternary Metric', name: metrics.metric4.name, shortName: metrics.metric4.shortName, description: metrics.metric4.description, why: why.why4, color: '#7c3aed' },
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

// ─── Main Component ─────────────────────────────────────────────────────

export function AgentEvaluation() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
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

  // Split active group patterns by intent type
  const { explicitPatterns, implicitPatterns } = useMemo(() => {
    if (!activeGroup) return { explicitPatterns: [], implicitPatterns: [] }
    const explicit: DiscoveredPattern[] = []
    const implicit: DiscoveredPattern[] = []
    for (const p of activeGroup.patterns) {
      if (p.intentType === 'implicit') {
        implicit.push(p)
      } else {
        explicit.push(p)
      }
    }
    return { explicitPatterns: explicit, implicitPatterns: implicit }
  }, [activeGroup])

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

                {/* Explicit patterns sub-section */}
                <IntentSubSection
                  intentType="explicit"
                  patterns={explicitPatterns}
                  validationCounts={patternValidationCounts}
                  baseDelay={0.05}
                />

                {/* Implicit patterns sub-section */}
                <IntentSubSection
                  intentType="implicit"
                  patterns={implicitPatterns}
                  validationCounts={patternValidationCounts}
                  baseDelay={0.05 + explicitPatterns.length * 0.04}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
