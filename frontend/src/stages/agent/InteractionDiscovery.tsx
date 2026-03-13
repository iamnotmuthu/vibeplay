import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid3x3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getCombinatorialPatternsData } from '@/lib/agent/combinatorialPatternsData'
import { getDimensionAnalysisData } from '@/lib/agent/dimensionAnalysisData'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import type {
  PatternTier,
  CombinationCell,
  DimensionPattern,
} from '@/store/agentTypes'
import { PATTERN_TYPE_LABELS } from '@/store/agentTypes'

// ─── Tier Definitions ────────────────────────────────────────────────────────

type TierTab = 'simple' | 'complex' | 'fuzzy'

interface TierTabDef {
  id: TierTab
  label: string
  icon: React.ElementType
  color: string
  activeBg: string
  inactiveBg: string
  border: string
  description: string
}

const TIER_TABS: TierTabDef[] = [
  {
    id: 'simple',
    label: 'Simple Patterns',
    icon: CheckCircle2,
    color: '#16a34a',
    activeBg: '#dcfce7',
    inactiveBg: '#f0fdf4',
    border: '#16a34a33',
    description: 'High-confidence, single-path patterns the agent handles reliably.',
  },
  {
    id: 'complex',
    label: 'Complex Patterns',
    icon: AlertCircle,
    color: '#dc2626',
    activeBg: '#fee2e2',
    inactiveBg: '#fef2f2',
    border: '#dc262633',
    description: 'Multi-step patterns requiring cross-referencing or decision logic.',
  },
  {
    id: 'fuzzy',
    label: 'Fuzzy Patterns',
    icon: HelpCircle,
    color: '#d97706',
    activeBg: '#fef3c7',
    inactiveBg: '#fffbeb',
    border: '#d9770633',
    description: 'Ambiguous patterns where confidence is low and fallback may be needed.',
  },
]

const TIER_COLOR_MAP: Record<PatternTier, { color: string; bg: string; border: string; activeBg: string }> = {
  simple: { color: '#16a34a', bg: '#f0fdf4', border: '#16a34a33', activeBg: '#dcfce7' },
  complex: { color: '#dc2626', bg: '#fef2f2', border: '#dc262633', activeBg: '#fee2e2' },
  fuzzy: { color: '#d97706', bg: '#fffbeb', border: '#d9770633', activeBg: '#fef3c7' },
}

// ─── Standardized Labels ─────────────────────────────────────────────────────

function getStandardizedPatternLabel(tier: PatternTier, index: number): string {
  if (tier === 'simple') return `Dominant Pattern ${index + 1}`
  if (tier === 'complex') return `Non-Dominant Pattern ${index + 1}`
  return `Fuzzy Pattern ${index + 1}`
}

// ─── Dimension Label Resolver ─────────────────────────────────────────────────

function useDimensionLabels(tileId: string | null) {
  return useMemo(() => {
    if (!tileId) return {} as Record<string, string>
    const data = getDimensionAnalysisData(tileId)
    if (!data) return {} as Record<string, string>
    const map: Record<string, string> = {}
    for (const d of data.taskDimensions) map[d.id] = d.label
    for (const d of data.dataDimensions) map[d.id] = d.label
    for (const d of data.userProfileDimensions) map[d.id] = d.label
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
            ? 'Every combination of what the agent does (task) and what data it uses creates a pattern. The tiles below show all patterns grouped by confidence level. Each valid combination maps to specific interaction patterns your agent handles.'
            : 'Full power-set combinatorial analysis: Task × DataPowerSet × UserProfile dimensions. Patterns classified into three tiers (Dominant/Non-Dominant/Fuzzy) based on confidence distributions. Only valid combinations retained from the full combinatorial space.'}
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
    label: tier.label.replace(' Patterns', ''),
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
  taskIds,
  dataIds,
  labels,
  accentColor,
}: {
  matrix: CombinationCell[][]
  taskIds: string[]
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
        <span className="text-[10px] text-gray-400">Task x Data</span>
      </div>

      <div className="inline-block min-w-full">
        <table className="border-collapse" role="table" aria-label="Task by Data dimension combination matrix">
          <thead>
            <tr>
              <th className="w-28 p-0" />
              {dataIds.map((dId) => (
                <th
                  key={dId}
                  className="px-1 pb-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center"
                  style={{ minWidth: 72 }}
                >
                  <span className="block">{labels[dId] ?? dId}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {taskIds.map((fId, rowIdx) => (
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
                              Tier: <span style={{ color: tier.color }} className="font-semibold">
                                {cell.dominantTier === 'simple' ? 'Dominant' : cell.dominantTier === 'complex' ? 'Non-Dominant' : 'Fuzzy'}
                              </span>
                            </p>
                            <p className="text-gray-500">
                              Profiles: {cell.userProfileDimensionIds.length}
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
              style={{ background: tier.inactiveBg, border: `1px solid ${tier.border}` }}
              aria-hidden="true"
            />
            <span className="text-[10px] text-gray-500">{tier.label.replace(' Patterns', '')}</span>
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

// ─── Dimension Explosion Animation ───────────────────────────────────────────

interface ExplosionNode {
  id: string
  label: string
  column: 0 | 1 | 2
  y: number // 0-1 normalised position within column
}

interface ExplosionPath {
  from: string // taskDimensionId
  through: string // dataDimensionId
  to: string // userProfileDimensionId
  tier: PatternTier
}

function DimensionExplosion({
  patterns,
  taskIds,
  dataIds,
  userProfileIds,
  labels,
  accentColor,
}: {
  patterns: DimensionPattern[]
  taskIds: string[]
  dataIds: string[]
  userProfileIds: string[]
  labels: Record<string, string>
  accentColor: string
}) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const [visibleCount, setVisibleCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build unique user profile IDs from patterns if userProfileIds is sparse
  const allUserProfileIds = useMemo(() => {
    if (userProfileIds.length > 0) return userProfileIds
    const set = new Set<string>()
    for (const p of patterns) set.add(p.userProfileDimensionId)
    return Array.from(set)
  }, [userProfileIds, patterns])

  // Build node positions
  const nodes = useMemo(() => {
    const result: ExplosionNode[] = []
    taskIds.forEach((id, i) => {
      result.push({ id, label: labels[id] ?? id, column: 0, y: taskIds.length > 1 ? i / (taskIds.length - 1) : 0.5 })
    })
    dataIds.forEach((id, i) => {
      result.push({ id, label: labels[id] ?? id, column: 1, y: dataIds.length > 1 ? i / (dataIds.length - 1) : 0.5 })
    })
    allUserProfileIds.forEach((id, i) => {
      result.push({ id, label: labels[id] ?? id, column: 2, y: allUserProfileIds.length > 1 ? i / (allUserProfileIds.length - 1) : 0.5 })
    })
    return result
  }, [taskIds, dataIds, allUserProfileIds, labels])

  // Build unique paths from patterns (each pattern = Task → Data(s) → UserProfile)
  const paths = useMemo(() => {
    const result: ExplosionPath[] = []
    const seen = new Set<string>()
    for (const p of patterns) {
      for (const dId of p.dataDimensionIds) {
        const key = `${p.taskDimensionId}→${dId}→${p.userProfileDimensionId}`
        if (!seen.has(key)) {
          seen.add(key)
          result.push({
            from: p.taskDimensionId,
            through: dId,
            to: p.userProfileDimensionId,
            tier: p.tier,
          })
        }
      }
    }
    return result
  }, [patterns])

  // Trigger animation on scroll into view
  useEffect(() => {
    if (hasAnimated || !containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  // Staggered path reveal
  useEffect(() => {
    if (!hasAnimated) return
    if (visibleCount >= paths.length) return
    const timer = setTimeout(() => {
      setVisibleCount((c) => Math.min(c + 1, paths.length))
    }, 60)
    return () => clearTimeout(timer)
  }, [hasAnimated, visibleCount, paths.length])

  // Layout constants
  const SVG_W = 680
  const SVG_H = Math.max(200, Math.max(taskIds.length, dataIds.length, allUserProfileIds.length) * 56 + 40)
  const COL_X = [60, SVG_W / 2, SVG_W - 60]
  const PADDING_Y = 28

  const getNodePos = useCallback(
    (id: string): { x: number; y: number } => {
      const node = nodes.find((n) => n.id === id)
      if (!node) return { x: 0, y: 0 }
      const x = COL_X[node.column]
      const usableH = SVG_H - PADDING_Y * 2
      const y = PADDING_Y + node.y * usableH
      return { x, y }
    },
    [nodes, SVG_H],
  )

  const tierColor = (tier: PatternTier) => TIER_COLOR_MAP[tier].color

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="rounded-xl border bg-white p-5 overflow-x-auto"
      style={{ borderColor: `${accentColor}15` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ArrowRight className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />
        <h3 className="text-sm font-bold text-gray-900">Dimension Connections</h3>
        <span className="text-[10px] text-gray-400">Task → Data → User Profile</span>
        {hasAnimated && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-auto text-[10px] font-mono tabular-nums"
            style={{ color: accentColor }}
          >
            {visibleCount}/{paths.length} paths
          </motion.span>
        )}
      </div>

      {/* Column headers */}
      <div className="flex justify-between px-2 mb-1">
        {['Task', 'Data', 'User Profile'].map((label) => (
          <span key={label} className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        style={{ maxHeight: SVG_H }}
        role="img"
        aria-label={`Dimension connection diagram showing ${paths.length} pattern paths between ${taskIds.length} task, ${dataIds.length} data, and ${allUserProfileIds.length} user profile dimensions`}
      >
        {/* Column lines (subtle guides) */}
        {COL_X.map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={PADDING_Y - 8}
            x2={x}
            y2={SVG_H - PADDING_Y + 8}
            stroke="#e5e7eb"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Paths — animated in one by one */}
        {paths.slice(0, visibleCount).map((path, i) => {
          const from = getNodePos(path.from)
          const through = getNodePos(path.through)
          const to = getNodePos(path.to)
          const color = tierColor(path.tier)

          // Bezier curves between columns
          const midX1 = (from.x + through.x) / 2
          const midX2 = (through.x + to.x) / 2
          const d1 = `M ${from.x} ${from.y} C ${midX1} ${from.y}, ${midX1} ${through.y}, ${through.x} ${through.y}`
          const d2 = `M ${through.x} ${through.y} C ${midX2} ${through.y}, ${midX2} ${to.y}, ${to.x} ${to.y}`

          return (
            <g key={`${path.from}-${path.through}-${path.to}`}>
              <motion.path
                d={d1}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.35}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
              />
              <motion.path
                d={d2}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.35}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.02 + 0.15 }}
              />
            </g>
          )
        })}

        {/* Nodes — dimension labels on the columns */}
        {nodes.map((node) => {
          const pos = getNodePos(node.id)
          // Count how many visible paths touch this node
          const touchCount = paths
            .slice(0, visibleCount)
            .filter(
              (p) => p.from === node.id || p.through === node.id || p.to === node.id,
            ).length
          const isActive = touchCount > 0
          const nodeColor = isActive ? accentColor : '#9ca3af'

          return (
            <g key={node.id}>
              {/* Pulse ring when active */}
              {isActive && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={18}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={1}
                  strokeOpacity={0.2}
                  initial={{ r: 8, opacity: 0.5 }}
                  animate={{ r: 18, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={6}
                fill={isActive ? nodeColor : '#e5e7eb'}
                stroke={isActive ? nodeColor : '#d1d5db'}
                strokeWidth={1.5}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, type: 'spring' }}
              />
              {/* Label */}
              <text
                x={node.column === 0 ? pos.x - 12 : node.column === 2 ? pos.x + 12 : pos.x}
                y={pos.y + 4}
                textAnchor={node.column === 0 ? 'end' : node.column === 2 ? 'start' : 'middle'}
                dy={node.column === 1 ? -12 : 0}
                className="text-[9px] font-medium"
                fill={isActive ? '#374151' : '#9ca3af'}
              >
                {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Path tier legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        {TIER_TABS.map((tier) => {
          const count = paths.filter((p) => p.tier === tier.id).length
          return (
            <div key={tier.id} className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 rounded" style={{ background: tier.color }} aria-hidden="true" />
              <span className="text-[10px] text-gray-500">
                {tier.label.replace(' Patterns', '')}: {count}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Dimension DNA Chip ───────────────────────────────────────────────────────

function DimensionDNA({
  taskId,
  dataIds,
  userProfileId,
  labels,
}: {
  taskId: string
  dataIds: string[]
  userProfileId: string
  labels: Record<string, string>
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
        {labels[taskId] ?? taskId}
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
        {labels[userProfileId] ?? userProfileId}
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
  patternIndex,
}: {
  pattern: DimensionPattern
  labels: Record<string, string>
  viewMode: 'business' | 'technical'
  delay: number
  patternIndex: number
}) {
  const [expanded, setExpanded] = useState(false)
  const tier = TIER_COLOR_MAP[pattern.tier]
  const typeLabel = PATTERN_TYPE_LABELS[pattern.patternType]

  // Status badge color mapping (matches PatternDiscovery exactly)
  const statusBadgeStyle = pattern.tier === 'simple'
    ? { background: 'rgba(16,185,129,0.10)', color: '#059669' }
    : pattern.tier === 'complex'
      ? { background: 'rgba(239,68,68,0.08)', color: '#dc2626' }
      : { background: 'rgba(245,158,11,0.10)', color: '#d97706' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="rounded-xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: `1px solid ${tier.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50/50 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: tier.color } as React.CSSProperties}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          {/* Standardized label + confidence badge row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={statusBadgeStyle}
            >
              {getStandardizedPatternLabel(pattern.tier, patternIndex)}
            </span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: `${tier.color}12`, color: tier.color }}
            >
              {typeLabel}
            </span>
          </div>

          {/* Pattern name */}
          <div className="text-sm font-semibold text-gray-900 mb-2">{pattern.name}</div>

          <p className="text-xs text-gray-500 leading-relaxed mb-2">{pattern.description}</p>

          {/* Dimension DNA */}
          <DimensionDNA
            taskId={pattern.taskDimensionId}
            dataIds={pattern.dataDimensionIds}
            userProfileId={pattern.userProfileDimensionId}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function InteractionDiscovery() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const [activeSection, setActiveSection] = useState<TierTab | null>(null)
  const [phase, setPhase] = useState<'loading' | 'simple' | 'complex' | 'fuzzy' | 'complete'>('loading')

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const data = activeTileId ? getCombinatorialPatternsData(activeTileId) : null
  const labels = useDimensionLabels(activeTileId)
  const accentColor = tile?.color ?? '#3b82f6'

  // Scroll to top on tile change
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
  }, [activeTileId])

  const toggleSection = (key: TierTab) =>
    setActiveSection((prev) => (prev === key ? null : key))

  const patternsByTier = useMemo(() => {
    if (!data) return { simple: [], complex: [], fuzzy: [] }
    return {
      simple: data.patterns.filter((p) => p.tier === 'simple'),
      complex: data.patterns.filter((p) => p.tier === 'complex'),
      fuzzy: data.patterns.filter((p) => p.tier === 'fuzzy'),
    }
  }, [data])

  // Staggered animation sequence (mirrors PatternDiscovery)
  const runAnimation = useCallback(async () => {
    if (!data) return

    setPhase('loading')
    await new Promise((r) => setTimeout(r, 1800))

    setPhase('simple')
    setActiveSection('simple')
    await new Promise((r) => setTimeout(r, 1500))

    setPhase('complex')
    setActiveSection('complex')
    await new Promise((r) => setTimeout(r, 1400))

    if (patternsByTier.fuzzy.length > 0) {
      setPhase('fuzzy')
      setActiveSection('fuzzy')
      await new Promise((r) => setTimeout(r, 1300))
    }

    setPhase('complete')
    setActiveSection('simple')
  }, [data, patternsByTier.fuzzy.length])

  // Run animation on mount or tile change
  const [hasAnimated, setHasAnimated] = useState<string | null>(null)
  useEffect(() => {
    if (!data || !activeTileId) return
    if (hasAnimated === activeTileId) {
      // Already animated for this tile, just show complete state
      setPhase('complete')
      if (!activeSection) setActiveSection('simple')
      return
    }
    setHasAnimated(activeTileId)
    runAnimation()
  }, [activeTileId, data]) // eslint-disable-line react-hooks/exhaustive-deps

  const showComplex = phase === 'complex' || phase === 'fuzzy' || phase === 'complete'
  const showFuzzy = phase === 'fuzzy' || phase === 'complete'
  const hasFuzzy = patternsByTier.fuzzy.length > 0

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pattern Recognition</h2>
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

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Stage header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Pattern Recognition</h2>
          {phase !== 'complete' && phase !== 'loading' && (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
          )}
          {phase === 'complete' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: `${accentColor}15`, color: accentColor }}
            >
              Analysis Complete
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {data.totalCombinations} combinations evaluated, {data.validPatterns} valid patterns
        </p>
      </motion.div>

      {/* Explainer */}
      <PatternsExplainer viewMode={viewMode} />

      {/* Loading placeholder */}
      {phase === 'loading' && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex items-center gap-3 px-5 py-6 rounded-xl border border-dashed text-sm text-gray-500"
          style={{ borderColor: '#d1d5db' }}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Scanning Task x Data x User Profile combinatorial space for patterns...
        </motion.div>
      )}

      {/* ── Pattern Tab Tiles (matches PatternDiscovery exactly) ── */}
      {phase !== 'loading' && (
        <div className="flex gap-3">
          {/* Simple Patterns tile */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => toggleSection('simple')}
            className="flex-1 rounded-xl p-4 text-center transition-all"
            style={{
              background: activeSection === 'simple' ? '#dcfce7' : '#f0fdf4',
              border: '1px solid #16a34a33',
              borderBottom: activeSection === 'simple' ? '4px solid #16a34a' : '1px solid #16a34a33',
              cursor: 'pointer',
            }}
          >
            <div className="text-2xl font-bold" style={{ color: '#16a34a' }}>
              <CountUpNumber end={patternsByTier.simple.length} />
            </div>
            <div className="text-sm font-semibold text-gray-700 mt-1">Simple Patterns</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#16a34a99' }}>
              High-confidence patterns
            </div>
          </motion.button>

          {/* Complex Patterns tile */}
          {showComplex && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => toggleSection('complex')}
              className="flex-1 rounded-xl p-4 text-center transition-all"
              style={{
                background: activeSection === 'complex' ? '#fee2e2' : '#fef2f2',
                border: '1px solid #dc262633',
                borderBottom: activeSection === 'complex' ? '4px solid #dc2626' : '1px solid #dc262633',
                cursor: 'pointer',
              }}
            >
              <div className="text-2xl font-bold" style={{ color: '#dc2626' }}>
                <CountUpNumber end={patternsByTier.complex.length} />
              </div>
              <div className="text-sm font-semibold text-gray-700 mt-1">Complex Patterns</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#dc262699' }}>
                Multi-step complexity
              </div>
            </motion.button>
          )}

          {/* Fuzzy Patterns tile */}
          {hasFuzzy && showFuzzy && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => toggleSection('fuzzy')}
              className="flex-1 rounded-xl p-4 text-center transition-all"
              style={{
                background: activeSection === 'fuzzy' ? '#fef3c7' : '#fffbeb',
                border: '1px solid #d9770633',
                borderBottom: activeSection === 'fuzzy' ? '4px solid #d97706' : '1px solid #d9770633',
                cursor: 'pointer',
              }}
            >
              <div className="text-2xl font-bold" style={{ color: '#d97706' }}>
                <CountUpNumber end={patternsByTier.fuzzy.length} />
              </div>
              <div className="text-sm font-semibold text-gray-700 mt-1">Fuzzy Patterns</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#d9770699' }}>
                Ambiguous confidence
              </div>
            </motion.button>
          )}
        </div>
      )}

      {/* ── Content panel for active section ── */}
      <AnimatePresence mode="wait">
        {activeSection && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Domain Expert Opportunity callout — fuzzy section only */}
            {activeSection === 'fuzzy' && (
              <div
                className="rounded-xl flex items-start gap-3 px-4 py-3"
                style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}
              >
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-amber-700 mb-0.5">Domain Expert Opportunity</div>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    Review these interaction patterns and consider whether an additional parameter — a behavioral signal, external data source, or derived feature — could separate them into clearer outcome buckets. A single well-chosen parameter can often convert these into Dominant or Non-Dominant patterns.
                  </p>
                </div>
              </div>
            )}

            {patternsByTier[activeSection].length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-400">
                  No {activeSection === 'simple' ? 'dominant' : activeSection === 'complex' ? 'non-dominant' : 'fuzzy'} patterns for this agent.
                </p>
              </div>
            ) : (
              patternsByTier[activeSection].map((pattern, i) => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  labels={labels}
                  viewMode={viewMode}
                  delay={0.03 + i * 0.04}
                  patternIndex={i}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier breakdown bar — shown after animation completes */}
      {phase === 'complete' && (
        <TierBreakdownBar
          breakdown={data.tierBreakdown}
          total={data.validPatterns}
          accentColor={accentColor}
        />
      )}

      {/* Combination matrix heatmap — shown after animation completes */}
      {phase === 'complete' && (
        <CombinationMatrix
          matrix={data.matrix}
          taskIds={data.taskDimensions}
          dataIds={data.dataDimensions}
          labels={labels}
          accentColor={accentColor}
        />
      )}

      {/* Dimension explosion — animated connection web — shown after animation completes */}
      {phase === 'complete' && (
        <DimensionExplosion
          patterns={data.patterns}
          taskIds={data.taskDimensions}
          dataIds={data.dataDimensions}
          userProfileIds={data.userProfileDimensions}
          labels={labels}
          accentColor={accentColor}
        />
      )}
    </div>
  )
}
