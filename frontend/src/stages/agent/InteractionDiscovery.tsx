import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Grid3x3,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getCombinatorialPatternsData } from '@/lib/agent/combinatorialPatternsData'
import { getDimensionAnalysisData } from '@/lib/agent/dimensionAnalysisData'
import type {
  PatternTier,
  CombinationCell,
  DimensionPattern,
} from '@/store/agentTypes'
import { PATTERN_TYPE_LABELS } from '@/store/agentTypes'

// ─── Tier Tab Definitions ─────────────────────────────────────────────────────

type TierTab = 'simple' | 'complex' | 'fuzzy'

interface TierTabDef {
  id: TierTab
  label: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
  description: string
}

const TIER_TABS: TierTabDef[] = [
  {
    id: 'simple',
    label: 'Simple',
    icon: CheckCircle2,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    description: 'High-confidence, single-path patterns the agent handles reliably.',
  },
  {
    id: 'complex',
    label: 'Complex',
    icon: AlertTriangle,
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    description: 'Multi-step patterns requiring cross-referencing or decision logic.',
  },
  {
    id: 'fuzzy',
    label: 'Fuzzy',
    icon: HelpCircle,
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    description: 'Ambiguous patterns where confidence is low and fallback may be needed.',
  },
]

const TIER_COLOR_MAP: Record<PatternTier, { color: string; bg: string; border: string }> = {
  simple: { color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  complex: { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  fuzzy: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const panelVariants: Variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

// ─── Dimension Label Resolver ─────────────────────────────────────────────────

function useDimensionLabels(tileId: string | null) {
  return useMemo(() => {
    if (!tileId) return {} as Record<string, string>
    const data = getDimensionAnalysisData(tileId)
    if (!data) return {} as Record<string, string>
    const map: Record<string, string> = {}
    for (const d of data.flowDimensions) map[d.id] = d.label
    for (const d of data.dataDimensions) map[d.id] = d.label
    for (const d of data.responseDimensions) map[d.id] = d.outputMode
    return map
  }, [tileId])
}

// ─── Explainer ────────────────────────────────────────────────────────────────

function PatternsExplainer({ viewMode }: { viewMode: 'business' | 'technical' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
    >
      <div className="flex items-start gap-3">
        <Grid3x3 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-gray-700 leading-relaxed">
          {viewMode === 'business'
            ? 'Every combination of how the agent thinks (flow) and what it knows (data) creates a pattern. The heatmap below shows all combinations, color-coded by complexity. Each valid cell maps to specific interaction patterns your agent handles.'
            : 'Combinatorial matrix of Flow x Data dimensions with Response dimension cardinality per cell. Cells are classified by dominant tier (simple/complex/fuzzy) based on pattern confidence distributions. Invalid cells indicate dimension pairs with no viable interaction path. Pattern cards show dimension DNA with activated component mappings.'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Tier Breakdown Bar ───────────────────────────────────────────────────────

function TierBreakdownBar({
  breakdown,
  total,
  accentColor,
}: {
  breakdown: { simple: number; complex: number; fuzzy: number }
  total: number
  accentColor: string
}) {
  const segments = TIER_TABS.map((tier) => ({
    count: breakdown[tier.id],
    pct: total > 0 ? Math.round((breakdown[tier.id] / total) * 100) : 0,
    color: tier.color,
    label: tier.label,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="rounded-xl border bg-white p-5"
      style={{ borderColor: `${accentColor}15` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accentColor}12` }}
        >
          <span className="text-lg font-bold" style={{ color: accentColor }}>
            {total}
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Valid Patterns</p>
          <p className="text-[11px] text-gray-500">
            from {segments.reduce((s, seg) => s + seg.count, 0)} dimension combinations
          </p>
        </div>
      </div>

      {/* Bar */}
      <div className="h-3 rounded-full overflow-hidden flex mb-3" style={{ background: '#f1f5f9' }}>
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            initial={{ width: 0 }}
            animate={{ width: `${seg.pct}%` }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
            style={{ background: seg.color }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: seg.color }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-gray-600">
              {seg.label}: <strong>{seg.count}</strong> ({seg.pct}%)
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Combination Matrix Heatmap ───────────────────────────────────────────────

function CombinationMatrix({
  matrix,
  flowIds,
  dataIds,
  labels,
  accentColor,
}: {
  matrix: CombinationCell[][]
  flowIds: string[]
  dataIds: string[]
  labels: Record<string, string>
  accentColor: string
}) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="rounded-xl border bg-white p-5 overflow-x-auto"
      style={{ borderColor: `${accentColor}15` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />
        <h3 className="text-sm font-bold text-gray-900">Combination Matrix</h3>
        <span className="text-[10px] text-gray-400">Flow x Data</span>
      </div>

      <div className="inline-block min-w-full">
        <table className="border-collapse" role="table" aria-label="Flow by Data dimension combination matrix">
          <thead>
            <tr>
              <th className="w-28 p-0" />
              {dataIds.map((dId) => (
                <th
                  key={dId}
                  className="px-1 pb-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center"
                  style={{ minWidth: 72 }}
                >
                  <span className="block truncate max-w-[72px]">{labels[dId] ?? dId}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flowIds.map((fId, rowIdx) => (
              <tr key={fId}>
                <td className="pr-2 py-1 text-[10px] font-semibold text-gray-600 text-right whitespace-nowrap">
                  {labels[fId] ?? fId}
                </td>
                {dataIds.map((dId, colIdx) => {
                  const cell = matrix[rowIdx]?.[colIdx]
                  if (!cell) return <td key={dId} className="p-1"><div className="w-full h-10 rounded bg-gray-50" /></td>

                  const tier = TIER_COLOR_MAP[cell.dominantTier]
                  const isHovered = hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx

                  return (
                    <td key={dId} className="p-1">
                      <div
                        className="relative w-full h-10 rounded flex items-center justify-center cursor-default transition-shadow"
                        style={{
                          background: cell.isValid ? tier.bg : '#f9fafb',
                          border: `1px solid ${cell.isValid ? tier.border : '#e5e7eb'}`,
                          boxShadow: isHovered && cell.isValid ? `0 0 0 2px ${tier.color}40` : 'none',
                        }}
                        onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                        onMouseLeave={() => setHoveredCell(null)}
                        role="cell"
                        aria-label={
                          cell.isValid
                            ? `${labels[fId]} + ${labels[dId]}: ${cell.patternCount} patterns, ${cell.dominantTier} tier`
                            : `${labels[fId]} + ${labels[dId]}: no valid patterns`
                        }
                      >
                        {cell.isValid ? (
                          <span
                            className="text-xs font-bold"
                            style={{ color: tier.color }}
                          >
                            {cell.patternCount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-300">&mdash;</span>
                        )}

                        {/* Hover tooltip */}
                        {isHovered && cell.isValid && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 top-full left-1/2 -translate-x-1/2 mt-1 p-2 rounded-lg border bg-white shadow-lg text-[10px] whitespace-nowrap"
                            style={{ borderColor: tier.border }}
                          >
                            <p className="font-bold text-gray-900 mb-0.5">
                              {cell.patternCount} pattern{cell.patternCount > 1 ? 's' : ''}
                            </p>
                            <p className="text-gray-500">
                              Tier: <span style={{ color: tier.color }} className="font-semibold">{cell.dominantTier}</span>
                            </p>
                            <p className="text-gray-500">
                              Responses: {cell.responseDimensionIds.length}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matrix legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        {TIER_TABS.map((tier) => (
          <div key={tier.id} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded"
              style={{ background: tier.bg, border: `1px solid ${tier.border}` }}
              aria-hidden="true"
            />
            <span className="text-[10px] text-gray-500">{tier.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200" aria-hidden="true" />
          <span className="text-[10px] text-gray-400">Invalid</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Dimension DNA Chip ───────────────────────────────────────────────────────

function DimensionDNA({
  flowId,
  dataIds,
  responseId,
  labels,
}: {
  flowId: string
  dataIds: string[]
  responseId: string
  labels: Record<string, string>
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
        {labels[flowId] ?? flowId}
      </span>
      <ArrowRight className="w-2.5 h-2.5 text-gray-300" aria-hidden="true" />
      {dataIds.map((dId, i) => (
        <span key={dId}>
          {i > 0 && <span className="text-gray-300 text-[8px] mx-0.5">+</span>}
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
            {labels[dId] ?? dId}
          </span>
        </span>
      ))}
      <ArrowRight className="w-2.5 h-2.5 text-gray-300" aria-hidden="true" />
      <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded">
        {labels[responseId] ?? responseId}
      </span>
    </div>
  )
}

// ─── Pattern Card ─────────────────────────────────────────────────────────────

function PatternCard({
  pattern,
  labels,
  viewMode,
  delay,
}: {
  pattern: DimensionPattern
  labels: Record<string, string>
  viewMode: 'business' | 'technical'
  delay: number
}) {
  const [expanded, setExpanded] = useState(false)
  const tier = TIER_COLOR_MAP[pattern.tier]
  const typeLabel = PATTERN_TYPE_LABELS[pattern.patternType]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: `${tier.border}80` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50/50 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: tier.color } as React.CSSProperties}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{pattern.name}</span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: `${tier.color}12`, color: tier.color }}
            >
              {typeLabel}
            </span>
            <span className="text-[9px] text-gray-400 font-mono">
              {pattern.confidence}%
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-2">{pattern.description}</p>

          {/* Dimension DNA */}
          <DimensionDNA
            flowId={pattern.flowDimensionId}
            dataIds={pattern.dataDimensionIds}
            responseId={pattern.responseDimensionId}
            labels={labels}
          />
        </div>
        <span className="shrink-0 text-gray-400 mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              {/* Inference note */}
              {pattern.inferenceNotes && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong className="font-semibold">
                      {viewMode === 'technical' ? 'Inference:' : 'What the agent figures out:'}
                    </strong>{' '}
                    {pattern.inferenceNotes}
                  </p>
                </div>
              )}

              {/* Ambiguity note */}
              {pattern.ambiguityNotes && (
                <div className="p-3 rounded-lg" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <p className="text-xs text-red-800 leading-relaxed">
                    <strong className="font-semibold">
                      {viewMode === 'technical' ? 'Ambiguity:' : 'Where it gets tricky:'}
                    </strong>{' '}
                    {pattern.ambiguityNotes}
                  </p>
                </div>
              )}

              {/* Example questions */}
              {pattern.exampleQuestions.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Example Interactions
                  </h5>
                  <div className="space-y-1.5">
                    {pattern.exampleQuestions.map((q, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-lg"
                        style={{ background: '#f8fafc' }}
                      >
                        <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
                        <p className="text-xs text-gray-700 leading-snug">&ldquo;{q}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activated components (technical mode) */}
              {viewMode === 'technical' && pattern.activatedComponents && pattern.activatedComponents.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Activated Components ({pattern.activatedComponents.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {pattern.activatedComponents.map((compId) => (
                      <span
                        key={compId}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                      >
                        {compId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Tier Tab Bar ─────────────────────────────────────────────────────────────

function TierTabBar({
  activeTab,
  onTabChange,
  counts,
}: {
  activeTab: TierTab
  onTabChange: (tab: TierTab) => void
  counts: Record<TierTab, number>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  const measureIndicator = useCallback(
    (node: HTMLButtonElement | null) => {
      if (!node || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const btnRect = node.getBoundingClientRect()
      setIndicatorStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      })
    },
    [],
  )

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabIds = TIER_TABS.map((t) => t.id)
    const currentIndex = tabIds.indexOf(activeTab)
    let nextIndex = -1

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabIds.length
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = tabIds.length - 1
    }

    if (nextIndex >= 0) {
      e.preventDefault()
      onTabChange(tabIds[nextIndex])
      const nextBtn = containerRef.current?.querySelector(
        `[data-tab="${tabIds[nextIndex]}"]`,
      ) as HTMLElement
      nextBtn?.focus()
    }
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Pattern tier categories"
      onKeyDown={handleTabKeyDown}
      className="relative flex border-b border-gray-200"
    >
      {/* Sliding indicator uses the active tier's color */}
      <motion.div
        className="absolute bottom-0 h-[2px] rounded-full"
        style={{ background: TIER_COLOR_MAP[activeTab].color }}
        animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      {TIER_TABS.map((tier) => {
        const isActive = tier.id === activeTab
        const Icon = tier.icon
        return (
          <button
            key={tier.id}
            id={`tier-tab-${tier.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tier-panel-${tier.id}`}
            tabIndex={isActive ? 0 : -1}
            data-tab={tier.id}
            ref={isActive ? measureIndicator : undefined}
            onClick={() => onTabChange(tier.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-colors relative ${
              isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon
              className="w-3.5 h-3.5"
              style={{ color: isActive ? tier.color : undefined }}
              aria-hidden="true"
            />
            <span>{tier.label}</span>
            <span
              className="min-w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: isActive ? `${tier.color}12` : '#f3f4f6',
                color: isActive ? tier.color : '#9ca3af',
              }}
            >
              {counts[tier.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InteractionDiscovery() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const [activeTab, setActiveTab] = useState<TierTab>('simple')

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const data = activeTileId ? getCombinatorialPatternsData(activeTileId) : null
  const labels = useDimensionLabels(activeTileId)
  const accentColor = tile?.color ?? '#3b82f6'

  // Scroll to top on tile change
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
  }, [activeTileId])

  const patternsByTier = useMemo(() => {
    if (!data) return { simple: [], complex: [], fuzzy: [] }
    return {
      simple: data.patterns.filter((p) => p.tier === 'simple'),
      complex: data.patterns.filter((p) => p.tier === 'complex'),
      fuzzy: data.patterns.filter((p) => p.tier === 'fuzzy'),
    }
  }, [data])

  const counts = useMemo<Record<TierTab, number>>(() => ({
    simple: patternsByTier.simple.length,
    complex: patternsByTier.complex.length,
    fuzzy: patternsByTier.fuzzy.length,
  }), [patternsByTier])

  if (!tile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">No tile selected.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div ref={containerRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Patterns</h2>
          <p className="text-sm text-gray-500">Combinatorial dimension patterns</p>
        </motion.div>
        <PatternsExplainer viewMode={viewMode} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center"
        >
          <Grid3x3 className="w-8 h-8 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-400">Pattern data is being generated.</p>
        </motion.div>
      </div>
    )
  }

  const activeTierDef = TIER_TABS.find((t) => t.id === activeTab)!

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Stage header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Patterns</h2>
        <p className="text-sm text-gray-500">
          {data.totalCombinations} combinations evaluated, {data.validPatterns} valid patterns
        </p>
      </motion.div>

      {/* Explainer */}
      <PatternsExplainer viewMode={viewMode} />

      {/* Tier breakdown */}
      <TierBreakdownBar
        breakdown={data.tierBreakdown}
        total={data.validPatterns}
        accentColor={accentColor}
      />

      {/* Combination matrix heatmap */}
      <CombinationMatrix
        matrix={data.matrix}
        flowIds={data.flowDimensions}
        dataIds={data.dataDimensions}
        labels={labels}
        accentColor={accentColor}
      />

      {/* Tier tabs for pattern cards */}
      <TierTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {/* Tier description ribbon */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium"
        style={{
          background: `${activeTierDef.color}08`,
          border: `1px solid ${activeTierDef.color}15`,
          color: activeTierDef.color,
        }}
      >
        <activeTierDef.icon className="w-3 h-3 shrink-0" aria-hidden="true" />
        <span>{activeTierDef.description}</span>
      </motion.div>

      {/* Pattern cards panel */}
      <div
        role="tabpanel"
        id={`tier-panel-${activeTab}`}
        aria-labelledby={`tier-tab-${activeTab}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {patternsByTier[activeTab].length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-400">No {activeTab} patterns for this agent.</p>
              </div>
            ) : (
              patternsByTier[activeTab].map((pattern, i) => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  labels={labels}
                  viewMode={viewMode}
                  delay={0.03 + i * 0.04}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
