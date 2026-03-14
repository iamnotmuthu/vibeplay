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
  DimensionPattern,
} from '@/store/agentTypes'
import { PATTERN_TYPE_LABELS, DIMENSION_COLORS } from '@/store/agentTypes'

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
  if (tier === 'simple') return `Simple Pattern ${index + 1}`
  if (tier === 'complex') return `Complex Pattern ${index + 1}`
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

// ─── Dimensional Sunburst ────────────────────────────────────────────────────

interface SunburstArc {
  ring: 0 | 1 | 2 // 0=task (inner), 1=data combo (middle), 2=user profile (outer)
  id: string
  label: string
  startAngle: number
  endAngle: number
  tier: PatternTier | null // null for parent arcs that aggregate
  count: number // how many patterns
  parentId?: string // for middle/outer ring linking
}

function DimensionalSunburst({
  patterns,
  taskIds,
  labels,
  accentColor,
}: {
  patterns: DimensionPattern[]
  taskIds: string[]
  labels: Record<string, string>
  accentColor: string
}) {
  const [hoveredArc, setHoveredArc] = useState<string | null>(null)
  const hoveredArcRef = useRef<string | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced hover to prevent flicker from rapid mouse movements
  const handleArcHover = useCallback((id: string | null) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoveredArcRef.current = id
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredArc(id)
    }, id ? 30 : 80) // faster in, slower out
  }, [])

  // Trigger animation on scroll
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

  // Build sunburst arcs: Task → DataCombo → UserProfile
  const arcs = useMemo(() => {
    const result: SunburstArc[] = []
    const TAU = Math.PI * 2
    const total = patterns.length || 1

    // Group by task
    const taskGroups = new Map<string, DimensionPattern[]>()
    for (const tid of taskIds) taskGroups.set(tid, [])
    for (const p of patterns) {
      const arr = taskGroups.get(p.taskDimensionId)
      if (arr) arr.push(p)
    }

    let taskAngle = 0
    for (const [taskId, taskPatterns] of taskGroups) {
      if (taskPatterns.length === 0) continue
      const taskSpan = (taskPatterns.length / total) * TAU
      const taskStart = taskAngle
      const taskEnd = taskAngle + taskSpan

      // Dominant tier for task level = majority tier
      const tierCounts = { simple: 0, complex: 0, fuzzy: 0 }
      for (const p of taskPatterns) tierCounts[p.tier]++
      const dominantTier = (Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0][0]) as PatternTier

      result.push({
        ring: 0,
        id: `task-${taskId}`,
        label: labels[taskId] ?? taskId,
        startAngle: taskStart,
        endAngle: taskEnd,
        tier: dominantTier,
        count: taskPatterns.length,
      })

      // Group by data combo within this task
      const dataGroups = new Map<string, DimensionPattern[]>()
      for (const p of taskPatterns) {
        const key = p.dataDimensionIds.slice().sort().join('+')
        if (!dataGroups.has(key)) dataGroups.set(key, [])
        dataGroups.get(key)!.push(p)
      }

      let dataAngle = taskStart
      for (const [dataKey, dataPatterns] of dataGroups) {
        const dataSpan = (dataPatterns.length / total) * TAU
        const dataStart = dataAngle
        const dataEnd = dataAngle + dataSpan

        const dTierCounts = { simple: 0, complex: 0, fuzzy: 0 }
        for (const p of dataPatterns) dTierCounts[p.tier]++
        const dDominantTier = (Object.entries(dTierCounts).sort((a, b) => b[1] - a[1])[0][0]) as PatternTier

        const dataDims = dataPatterns[0].dataDimensionIds
        const dataLabel =
          dataDims.length === 1
            ? labels[dataDims[0]] ?? dataDims[0]
            : dataDims.length === 2
              ? `${labels[dataDims[0]] ?? dataDims[0]} + ${labels[dataDims[1]] ?? dataDims[1]}`
              : `${labels[dataDims[0]] ?? dataDims[0]} +${dataDims.length - 1}`

        result.push({
          ring: 1,
          id: `data-${taskId}-${dataKey}`,
          label: dataLabel,
          startAngle: dataStart,
          endAngle: dataEnd,
          tier: dDominantTier,
          count: dataPatterns.length,
          parentId: `task-${taskId}`,
        })

        // User profiles within this data combo
        let upAngle = dataStart
        for (const p of dataPatterns) {
          const upSpan = (1 / total) * TAU
          result.push({
            ring: 2,
            id: `up-${p.id}`,
            label: labels[p.userProfileDimensionId] ?? p.userProfileDimensionId,
            startAngle: upAngle,
            endAngle: upAngle + upSpan,
            tier: p.tier,
            count: 1,
            parentId: `data-${taskId}-${dataKey}`,
          })
          upAngle += upSpan
        }

        dataAngle += dataSpan
      }

      taskAngle += taskSpan
    }

    return result
  }, [patterns, taskIds, labels])

  // SVG layout — large sunburst
  const SIZE = 900
  const CX = SIZE / 2
  const CY = SIZE / 2
  const RINGS = [
    { inner: 90, outer: 185 },   // Task (innermost)
    { inner: 195, outer: 310 },  // Data combo (middle)
    { inner: 320, outer: 420 },  // User Profile (outer)
  ]

  // Per-ring color palette using DIMENSION_COLORS:
  // Ring 0 = Task (Indigo), Ring 1 = Data (Emerald), Ring 2 = User Profile (Rose)
  const RING_PALETTE = [
    {
      base: DIMENSION_COLORS.task.primary,
      simple:  { fill: DIMENSION_COLORS.task.light, stroke: DIMENSION_COLORS.task.primary },
      complex: { fill: `${DIMENSION_COLORS.task.primary}12`, stroke: DIMENSION_COLORS.task.medium },
      fuzzy:   { fill: `${DIMENSION_COLORS.task.primary}08`, stroke: `${DIMENSION_COLORS.task.primary}60` },
      hovered: { fill: DIMENSION_COLORS.task.medium, stroke: DIMENSION_COLORS.task.dark },
    },
    {
      base: DIMENSION_COLORS.data.primary,
      simple:  { fill: DIMENSION_COLORS.data.light, stroke: DIMENSION_COLORS.data.primary },
      complex: { fill: `${DIMENSION_COLORS.data.primary}12`, stroke: DIMENSION_COLORS.data.medium },
      fuzzy:   { fill: `${DIMENSION_COLORS.data.primary}08`, stroke: `${DIMENSION_COLORS.data.primary}60` },
      hovered: { fill: DIMENSION_COLORS.data.medium, stroke: DIMENSION_COLORS.data.dark },
    },
    {
      base: DIMENSION_COLORS.userProfile.primary,
      simple:  { fill: DIMENSION_COLORS.userProfile.medium, stroke: DIMENSION_COLORS.userProfile.primary },
      complex: { fill: `${DIMENSION_COLORS.userProfile.primary}30`, stroke: DIMENSION_COLORS.userProfile.medium },
      fuzzy:   { fill: `${DIMENSION_COLORS.userProfile.primary}18`, stroke: `${DIMENSION_COLORS.userProfile.primary}80` },
      hovered: { fill: DIMENSION_COLORS.userProfile.primary, stroke: DIMENSION_COLORS.userProfile.dark },
    },
  ]

  function getArcColors(ring: 0 | 1 | 2, tier: PatternTier | null, isHovered: boolean) {
    const p = RING_PALETTE[ring]
    if (isHovered) return p.hovered
    if (!tier) return { fill: `${p.base}18`, stroke: `${p.base}50` }
    return p[tier]
  }

  function arcPath(
    innerR: number,
    outerR: number,
    startAngle: number,
    endAngle: number,
  ): string {
    // Offset by -PI/2 so 0 is top
    const s = startAngle - Math.PI / 2
    const e = endAngle - Math.PI / 2
    const span = e - s
    // Gap proportional to arc span — ensures even tiny outer arcs render
    const gap = Math.min(0.008, span * 0.06)

    const sA = s + gap
    const eA = e - gap
    if (eA <= sA) return ''

    const x1 = CX + innerR * Math.cos(sA)
    const y1 = CY + innerR * Math.sin(sA)
    const x2 = CX + outerR * Math.cos(sA)
    const y2 = CY + outerR * Math.sin(sA)
    const x3 = CX + outerR * Math.cos(eA)
    const y3 = CY + outerR * Math.sin(eA)
    const x4 = CX + innerR * Math.cos(eA)
    const y4 = CY + innerR * Math.sin(eA)

    const largeArc = eA - sA > Math.PI ? 1 : 0

    return [
      `M ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1}`,
      'Z',
    ].join(' ')
  }

  const hoveredData = arcs.find((a) => a.id === hoveredArc)

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="rounded-xl border bg-white p-5"
      style={{ borderColor: `${accentColor}15` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ArrowRight className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />
        <h3 className="text-sm font-bold text-gray-900">Dimensional Sunburst</h3>
        <span className="text-[10px] text-gray-400">Task → Data → User Profile</span>
        <span
          className="ml-auto text-[10px] font-mono tabular-nums"
          style={{ color: accentColor }}
        >
          {patterns.length} patterns
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* SVG sunburst — stable plain paths avoid hover jitter */}
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full max-w-[900px] mx-auto"
          role="img"
          aria-label={`Sunburst chart showing ${patterns.length} patterns across ${taskIds.length} tasks`}
        >
          {/* Entrance animation wrapper */}
          <motion.g
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: hasAnimated ? 1 : 0, scale: hasAnimated ? 1 : 0.85 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          >
            {/* Arcs by ring — ring 2 arcs have no individual hover (too dense, causes flicker) */}
            {arcs.map((arc) => {
              const ring = RINGS[arc.ring]
              const d = arcPath(ring.inner, ring.outer, arc.startAngle, arc.endAngle)
              if (!d) return null

              const isHovered = hoveredArc === arc.id
              const isParentOfHovered = hoveredData?.parentId === arc.id
              // Ring 2 children highlight when their parent (ring 1) is hovered
              const isChildOfHovered = arc.ring === 2 && hoveredArc === arc.parentId
              const highlighted = isHovered || isChildOfHovered
              const dimmed = !!hoveredArc && !highlighted && !isParentOfHovered
              const colors = getArcColors(arc.ring as 0 | 1 | 2, arc.tier, highlighted)

              // Ring 2 arcs: no individual hover events (900+ arcs cause flicker)
              const hasHover = arc.ring !== 2

              return (
                <path
                  key={arc.id}
                  d={d}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={highlighted ? 2 : arc.ring === 2 ? 0.8 : 0.5}
                  opacity={dimmed ? 0.3 : 1}
                  style={{
                    transition: 'fill 0.15s ease, stroke 0.15s ease, opacity 0.2s ease, stroke-width 0.1s ease',
                    cursor: hasHover ? 'pointer' : 'default',
                  }}
                  onMouseEnter={hasHover ? () => handleArcHover(arc.id) : undefined}
                  onMouseLeave={hasHover ? () => handleArcHover(null) : undefined}
                />
              )
            })}

            {/* Task ring labels (ring=0, arc big enough) */}
            {arcs
              .filter((a) => a.ring === 0 && a.endAngle - a.startAngle > 0.35)
              .map((arc) => {
                const mid = (arc.startAngle + arc.endAngle) / 2 - Math.PI / 2
                const r = (RINGS[0].inner + RINGS[0].outer) / 2
                const x = CX + r * Math.cos(mid)
                const y = CY + r * Math.sin(mid)
                const angle = (mid * 180) / Math.PI
                const flip = angle > 90 || angle < -90
                return (
                  <text
                    key={`lbl-${arc.id}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={13}
                    fontWeight="700"
                    fill={RING_PALETTE[0].base}
                    style={{ pointerEvents: 'none' }}
                    transform={`rotate(${flip ? angle + 180 : angle}, ${x}, ${y})`}
                  >
                    {arc.label.length > 18 ? arc.label.slice(0, 16) + '…' : arc.label}
                  </text>
                )
              })}

            {/* Data ring labels (ring=1, arc big enough) */}
            {arcs
              .filter((a) => a.ring === 1 && a.endAngle - a.startAngle > 0.45)
              .map((arc) => {
                const mid = (arc.startAngle + arc.endAngle) / 2 - Math.PI / 2
                const r = (RINGS[1].inner + RINGS[1].outer) / 2
                const x = CX + r * Math.cos(mid)
                const y = CY + r * Math.sin(mid)
                const angle = (mid * 180) / Math.PI
                const flip = angle > 90 || angle < -90
                return (
                  <text
                    key={`lbl-${arc.id}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fontWeight="600"
                    fill={RING_PALETTE[1].base}
                    style={{ pointerEvents: 'none' }}
                    transform={`rotate(${flip ? angle + 180 : angle}, ${x}, ${y})`}
                  >
                    {arc.label.length > 20 ? arc.label.slice(0, 18) + '…' : arc.label}
                  </text>
                )
              })}
          </motion.g>

          {/* Center label — outside animation group so it's always visible */}
          <text x={CX} y={CY - 14} textAnchor="middle" fontSize={32} fontWeight="700" fill="#1e293b">
            {patterns.length}
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" fontSize={16} fill="#9ca3af">
            patterns
          </text>
        </svg>

        {/* Hover tooltip panel */}
        <div className="min-w-[170px] pt-2 hidden sm:block shrink-0">
          {hoveredData ? (
            <motion.div
              key={hoveredData.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="p-3 rounded-lg border bg-white shadow-sm text-[11px]"
              style={{ borderColor: RING_PALETTE[hoveredData.ring as 0|1|2].base + '40' }}
            >
              <div
                className="text-[9px] font-bold uppercase tracking-widest mb-1"
                style={{ color: RING_PALETTE[hoveredData.ring as 0|1|2].base }}
              >
                {hoveredData.ring === 0 ? 'Task' : hoveredData.ring === 1 ? 'Data Source' : 'User Profile'}
              </div>
              <p className="font-bold text-gray-900 mb-1">{hoveredData.label}</p>
              {hoveredData.tier && (
                <p className="text-gray-500">
                  Pattern type:{' '}
                  <span className="font-semibold capitalize" style={{ color: hoveredData.tier === 'simple' ? '#16a34a' : hoveredData.tier === 'complex' ? '#dc2626' : '#d97706' }}>
                    {hoveredData.tier === 'simple' ? 'Simple' : hoveredData.tier === 'complex' ? 'Complex' : 'Fuzzy'}
                  </span>
                </p>
              )}
              <p className="text-gray-500 mt-0.5">
                {hoveredData.count} pattern{hoveredData.count !== 1 ? 's' : ''}
              </p>
            </motion.div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed border-gray-200 text-[10px] text-gray-400 text-center">
              Hover over arcs to explore dimensions
            </div>
          )}

          {/* Ring legend */}
          <div className="mt-3 space-y-2">
            {[
              { label: 'Task', sublabel: 'Inner ring', color: RING_PALETTE[0].base },
              { label: 'Data Source', sublabel: 'Middle ring', color: RING_PALETTE[1].base },
              { label: 'User Profile', sublabel: 'Outer ring', color: RING_PALETTE[2].base },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ background: item.color + '30', border: `1.5px solid ${item.color}` }}
                />
                <div>
                  <span className="text-[10px] font-semibold text-gray-700">{item.label}</span>
                  <span className="text-[9px] text-gray-400 ml-1">{item.sublabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tier legend */}
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5">Pattern Type</p>
            {[
              { id: 'simple', label: 'Simple', color: '#16a34a', fill: '#dcfce7' },
              { id: 'complex', label: 'Complex', color: '#dc2626', fill: '#fee2e2' },
              { id: 'fuzzy', label: 'Fuzzy', color: '#d97706', fill: '#fef3c7' },
            ].map((t) => {
              const count = arcs.filter((a) => a.ring === 2 && a.tier === t.id).length
              return (
                <div key={t.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-2 rounded-sm" style={{ background: t.fill, border: `1px solid ${t.color}50` }} />
                  <span className="text-[10px] text-gray-500">{t.label}: <span className="font-mono font-semibold">{count}</span></span>
                </div>
              )
            })}
          </div>
        </div>
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
      <span
        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
        style={{ color: DIMENSION_COLORS.task.primary, background: DIMENSION_COLORS.task.light, border: `1px solid ${DIMENSION_COLORS.task.medium}` }}
      >
        {labels[taskId] ?? taskId}
      </span>
      <ArrowRight className="w-2.5 h-2.5 text-gray-300" aria-hidden="true" />
      {dataIds.map((dId, i) => (
        <span key={dId}>
          {i > 0 && <span className="text-gray-300 text-[8px] mx-0.5">+</span>}
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ color: DIMENSION_COLORS.data.primary, background: DIMENSION_COLORS.data.light, border: `1px solid ${DIMENSION_COLORS.data.medium}` }}
          >
            {labels[dId] ?? dId}
          </span>
        </span>
      ))}
      <ArrowRight className="w-2.5 h-2.5 text-gray-300" aria-hidden="true" />
      <span
        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
        style={{ color: DIMENSION_COLORS.userProfile.primary, background: DIMENSION_COLORS.userProfile.light, border: `1px solid ${DIMENSION_COLORS.userProfile.medium}` }}
      >
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

      {/* Dimensional sunburst — Task → Data → User Profile rings */}
      {phase === 'complete' && (
        <DimensionalSunburst
          patterns={data.patterns}
          taskIds={data.taskDimensions}
          labels={labels}
          accentColor={accentColor}
        />
      )}

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

      {/* Tier breakdown bar — shown after animation completes */}
      {phase === 'complete' && (
        <TierBreakdownBar
          breakdown={data.tierBreakdown}
          total={data.validPatterns}
          accentColor={accentColor}
        />
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

    </div>
  )
}
