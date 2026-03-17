import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid3x3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
  Lightbulb,
  Loader2,
  Layers,
  Circle,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getCombinatorialPatternsData } from '@/lib/agent/combinatorialPatternsData'
import { getDimensionAnalysisDataV3 as getDimensionAnalysisData } from '@/lib/agent/dimensionAnalysisDataV3'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import type {
  PatternTier,
  DimensionPattern,
  DimensionAnalysisPayload,
} from '@/store/agentTypes'
import { PATTERN_TYPE_LABELS, DIMENSION_COLORS } from '@/store/agentTypes'

// ─── Tier Definitions ────────────────────────────────────────────────────────

type TierTab = 'simple' | 'complex' | 'fuzzy'

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
    for (const d of (data.responseDimensions ?? data.outputDimensions)) map[d.id] = d.label
    if (data.toolDimensions) {
      for (const d of data.toolDimensions) {
        map[d.id] = d.label
      }
    }
    return map
  }, [tileId])
}

// ─── Animation Phases ────────────────────────────────────────────────────────

type AnimPhase = 'counter' | 'explosion' | 'flow' | 'complete'

// Module-level: persists across component remounts so navigation back skips the animation
const animatedTileIds = new Set<string>()

// ─── Phase 1: Counter Hero ──────────────────────────────────────────────────

function CounterHero({
  taskCount,
  dataSubsetCount,
  outputCount,
  toolStateCount,
  totalCombinations,
  validPatterns,
  onComplete,
}: {
  taskCount: number
  dataSubsetCount: number
  outputCount: number
  toolStateCount: number
  totalCombinations: number
  validPatterns: number
  onComplete: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0f172a' }}
    >
      <div className="px-8 py-12 text-center">
        {/* Math breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8 flex-wrap"
        >
          <span className="text-lg font-bold" style={{ color: DIMENSION_COLORS.task.primary }}>
            {taskCount} tasks
          </span>
          <span className="text-gray-500 text-lg">&times;</span>
          <span className="text-lg font-bold" style={{ color: DIMENSION_COLORS.data.primary }}>
            {dataSubsetCount} data subsets
          </span>
          <span className="text-gray-500 text-lg">&times;</span>
          <span className="text-lg font-bold" style={{ color: DIMENSION_COLORS.output.primary }}>
            {outputCount} responses
          </span>
          <span className="text-gray-500 text-lg">&times;</span>
          <span className="text-lg font-bold" style={{ color: DIMENSION_COLORS.tool.primary }}>
            {toolStateCount} tool states
          </span>
        </motion.div>

        {/* Big counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="text-6xl font-black text-white mb-2 font-mono tabular-nums">
            <CountUpNumber end={totalCombinations} duration={2} />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.4 }}
            className="text-gray-400 text-sm"
          >
            combinations explored
          </motion.p>
        </motion.div>

        {/* Valid patterns badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.4 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)' }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-semibold">
            {validPatterns} valid patterns identified
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Phase 2: Explosion Animation ───────────────────────────────────────────

function ExplosionAnimation({
  analysis,
  onComplete,
}: {
  analysis: DimensionAnalysisPayload
  onComplete: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800)
    return () => clearTimeout(timer)
  }, [onComplete])

  const tasks = analysis.taskDimensions.slice(0, 10)
  const dataDims = analysis.dataDimensions.slice(0, 5)
  const outputs = (analysis.responseDimensions ?? analysis.outputDimensions).slice(0, 4)
  const toolStates = analysis.toolDimensions.slice(0, 5)

  const W = 950
  const H = 400
  const COL_X = [80, 320, 560, 800]

  // Task positions (column 1, evenly spaced)
  const taskNodes = tasks.map((t, i) => ({
    id: t.id,
    label: t.label,
    x: COL_X[0],
    y: 30 + (i * (H - 60)) / Math.max(tasks.length - 1, 1),
  }))

  // Data positions (column 2)
  const dataNodes = dataDims.map((d, i) => ({
    id: d.id,
    label: d.label,
    x: COL_X[1],
    y: 50 + (i * (H - 100)) / Math.max(dataDims.length - 1, 1),
  }))

  // Output positions (column 3)
  const outputNodes = outputs.map((o, i) => ({
    id: o.id,
    label: o.label,
    x: COL_X[2],
    y: 40 + (i * (H - 80)) / Math.max(outputs.length - 1, 1),
  }))

  // Tool state positions (column 4)
  const toolNodes = toolStates.map((t, i) => ({
    id: t.id,
    label: t.label,
    x: COL_X[3],
    y: 35 + (i * (H - 70)) / Math.max(toolStates.length - 1, 1),
  }))

  // Generate paths: task → data (every task connects to every data)
  const taskDataPaths: { d: string; delay: number }[] = []
  taskNodes.forEach((tn, ti) => {
    dataNodes.forEach((dn, di) => {
      const cp1x = tn.x + 80
      const cp2x = dn.x - 80
      taskDataPaths.push({
        d: `M ${tn.x} ${tn.y} C ${cp1x} ${tn.y}, ${cp2x} ${dn.y}, ${dn.x} ${dn.y}`,
        delay: 0.3 + ti * 0.04 + di * 0.02,
      })
    })
  })

  // data → output
  const dataOutputPaths: { d: string; delay: number }[] = []
  dataNodes.forEach((dn, di) => {
    outputNodes.forEach((on, oi) => {
      const cp1x = dn.x + 80
      const cp2x = on.x - 80
      dataOutputPaths.push({
        d: `M ${dn.x} ${dn.y} C ${cp1x} ${dn.y}, ${cp2x} ${on.y}, ${on.x} ${on.y}`,
        delay: 0.8 + di * 0.05 + oi * 0.03,
      })
    })
  })

  // output → tool
  const outputToolPaths: { d: string; delay: number }[] = []
  outputNodes.forEach((on, oi) => {
    toolNodes.forEach((tn, ti) => {
      const cp1x = on.x + 80
      const cp2x = tn.x - 80
      outputToolPaths.push({
        d: `M ${on.x} ${on.y} C ${cp1x} ${on.y}, ${cp2x} ${tn.y}, ${tn.x} ${tn.y}`,
        delay: 1.3 + oi * 0.04 + ti * 0.025,
      })
    })
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0f172a' }}
    >
      <div className="px-4 py-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center text-xs text-gray-500 mb-4 uppercase tracking-widest"
        >
          Mapping dimensional relationships
        </motion.p>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <filter id="glow-explosion">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Task → Data paths */}
          {taskDataPaths.map((p, i) => (
            <motion.path
              key={`td-${i}`}
              d={p.d}
              fill="none"
              stroke={DIMENSION_COLORS.task.primary}
              strokeWidth={0.8}
              strokeOpacity={0.35}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: p.delay, duration: 0.5, ease: 'easeOut' }}
            />
          ))}

          {/* Data → Output paths */}
          {dataOutputPaths.map((p, i) => (
            <motion.path
              key={`do-${i}`}
              d={p.d}
              fill="none"
              stroke={DIMENSION_COLORS.data.primary}
              strokeWidth={0.8}
              strokeOpacity={0.35}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: p.delay, duration: 0.5, ease: 'easeOut' }}
            />
          ))}

          {/* Output → Tool paths */}
          {outputToolPaths.map((p, i) => (
            <motion.path
              key={`ot-${i}`}
              d={p.d}
              fill="none"
              stroke={DIMENSION_COLORS.output.primary}
              strokeWidth={0.8}
              strokeOpacity={0.35}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: p.delay, duration: 0.5, ease: 'easeOut' }}
            />
          ))}

          {/* Task nodes */}
          {taskNodes.map((n, i) => (
            <motion.g key={n.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.03, duration: 0.3 }}>
              <circle cx={n.x} cy={n.y} r={5} fill={DIMENSION_COLORS.task.primary} filter="url(#glow-explosion)" />
              <text x={n.x - 12} y={n.y + 1} textAnchor="end" fontSize={9} fill={DIMENSION_COLORS.task.medium} fontWeight="600">
                {n.label.length > 16 ? n.label.slice(0, 14) + '...' : n.label}
              </text>
            </motion.g>
          ))}

          {/* Data nodes */}
          {dataNodes.map((n, i) => (
            <motion.g key={n.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}>
              <circle cx={n.x} cy={n.y} r={6} fill={DIMENSION_COLORS.data.primary} filter="url(#glow-explosion)" />
              <text x={n.x} y={n.y - 12} textAnchor="middle" fontSize={9} fill={DIMENSION_COLORS.data.medium} fontWeight="600">
                {n.label.length > 20 ? n.label.slice(0, 18) + '...' : n.label}
              </text>
            </motion.g>
          ))}

          {/* Output nodes */}
          {outputNodes.map((n, i) => (
            <motion.g key={n.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3 + i * 0.04, duration: 0.3 }}>
              <circle cx={n.x} cy={n.y} r={5} fill={DIMENSION_COLORS.output.primary} filter="url(#glow-explosion)" />
              <text x={n.x - 12} y={n.y + 1} textAnchor="end" fontSize={9} fill={DIMENSION_COLORS.output.medium} fontWeight="600">
                {n.label.length > 16 ? n.label.slice(0, 14) + '...' : n.label}
              </text>
            </motion.g>
          ))}

          {/* Tool state nodes */}
          {toolNodes.map((n, i) => (
            <motion.g key={n.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6 + i * 0.04, duration: 0.3 }}>
              <circle cx={n.x} cy={n.y} r={5} fill={DIMENSION_COLORS.tool.primary} filter="url(#glow-explosion)" />
              <text x={n.x + 12} y={n.y + 1} textAnchor="start" fontSize={9} fill={DIMENSION_COLORS.tool.medium} fontWeight="600">
                {n.label.length > 14 ? n.label.slice(0, 12) + '...' : n.label}
              </text>
            </motion.g>
          ))}

          {/* Column headers */}
          <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} x={COL_X[0]} y={16} textAnchor="middle" fontSize={10} fontWeight="700" fill={DIMENSION_COLORS.task.primary} textDecoration="uppercase" letterSpacing="0.1em">
            TASKS
          </motion.text>
          <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} x={COL_X[1]} y={16} textAnchor="middle" fontSize={10} fontWeight="700" fill={DIMENSION_COLORS.data.primary} letterSpacing="0.1em">
            DATA SOURCES
          </motion.text>
          <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} x={COL_X[2]} y={16} textAnchor="middle" fontSize={10} fontWeight="700" fill={DIMENSION_COLORS.output.primary} letterSpacing="0.1em">
            RESPONSES
          </motion.text>
          <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} x={COL_X[3]} y={16} textAnchor="middle" fontSize={10} fontWeight="700" fill={DIMENSION_COLORS.tool.primary} letterSpacing="0.1em">
            TOOLS
          </motion.text>
        </svg>
      </div>
    </motion.div>
  )
}

// ─── Phase 3: Dimensional Flow (main interactive viz) ───────────────────────

interface FlowNode {
  id: string
  label: string
  column: 0 | 1 | 2 | 3
  x: number
  y: number
  patternCount: number
  color: string
  glowColor: string
}

interface FlowLink {
  sourceId: string
  targetId: string
  patternCount: number
  tierBreakdown: { simple: number; complex: number; fuzzy: number }
}

function DimensionalFlow({
  patterns,
  analysis,
  labels,
  onFilterChange,
  activeFilter,
}: {
  patterns: DimensionPattern[]
  analysis: DimensionAnalysisPayload
  labels: Record<string, string>
  onFilterChange: (filter: { type: 'task' | 'data' | 'output' | 'tool'; id: string } | null) => void
  activeFilter: { type: 'task' | 'data' | 'output' | 'tool'; id: string } | null
}) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleNodeHover = useCallback((id: string | null) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => setHoveredNode(id), id ? 20 : 60)
  }, [])

  // Build nodes
  const W = 1200
  const H = 500
  const PADDING_TOP = 45
  const PADDING_BOTTOM = 20
  const COL_X = [200, 460, 720, 980]

  const { nodes, taskDataLinks, dataOutputLinks, outputToolLinks, deadTaskDataLinks, deadDataOutputLinks, deadOutputToolLinks } = useMemo(() => {
    const tasks = analysis.taskDimensions
    const dataDims = analysis.dataDimensions
    const outputs = (analysis.responseDimensions ?? analysis.outputDimensions)
    const allToolStates = analysis.toolDimensions

    const usableH = H - PADDING_TOP - PADDING_BOTTOM

    // Task nodes
    const taskNodes: FlowNode[] = tasks.map((t, i) => {
      const count = patterns.filter(p => p.taskDimensionId === t.id).length
      return {
        id: t.id,
        label: t.label,
        column: 0 as const,
        x: COL_X[0],
        y: PADDING_TOP + (i * usableH) / Math.max(tasks.length - 1, 1),
        patternCount: count,
        color: DIMENSION_COLORS.task.primary,
        glowColor: DIMENSION_COLORS.task.medium,
      }
    })

    // Data nodes
    const dataNodesArr: FlowNode[] = dataDims.map((d, i) => {
      const count = patterns.filter(p => p.dataDimensionIds.includes(d.id)).length
      return {
        id: d.id,
        label: d.label,
        column: 1 as const,
        x: COL_X[1],
        y: PADDING_TOP + 20 + (i * (usableH - 40)) / Math.max(dataDims.length - 1, 1),
        patternCount: count,
        color: DIMENSION_COLORS.data.primary,
        glowColor: DIMENSION_COLORS.data.medium,
      }
    })

    // Output nodes
    const outputNodesArr: FlowNode[] = outputs.map((o, i) => {
      const count = patterns.filter(p => p.responseDimensionId === o.id).length
      return {
        id: o.id,
        label: o.label,
        column: 2 as const,
        x: COL_X[2],
        y: PADDING_TOP + 15 + (i * (usableH - 30)) / Math.max(outputs.length - 1, 1),
        patternCount: count,
        color: DIMENSION_COLORS.output.primary,
        glowColor: DIMENSION_COLORS.output.medium,
      }
    })

    // Tool state nodes
    const toolNodesArr: FlowNode[] = allToolStates.map((ts, i) => {
      const count = patterns.filter(p => p.toolDimensionIds.includes(ts.id)).length
      return {
        id: ts.id,
        label: ts.label,
        column: 3 as const,
        x: COL_X[3],
        y: PADDING_TOP + 10 + (i * (usableH - 20)) / Math.max(allToolStates.length - 1, 1),
        patternCount: count,
        color: DIMENSION_COLORS.tool.primary,
        glowColor: DIMENSION_COLORS.tool.medium,
      }
    })

    const allNodes = [...taskNodes, ...dataNodesArr, ...outputNodesArr, ...toolNodesArr]

    // Build Task→Data links (valid + dead)
    const tdLinks: FlowLink[] = []
    const deadTdLinks: { sourceId: string; targetId: string }[] = []
    for (const task of tasks) {
      for (const data of dataDims) {
        const matching = patterns.filter(p =>
          p.taskDimensionId === task.id && p.dataDimensionIds.includes(data.id)
        )
        if (matching.length > 0) {
          tdLinks.push({
            sourceId: task.id,
            targetId: data.id,
            patternCount: matching.length,
            tierBreakdown: {
              simple: matching.filter(p => p.tier === 'simple').length,
              complex: matching.filter(p => p.tier === 'complex').length,
              fuzzy: matching.filter(p => p.tier === 'fuzzy').length,
            },
          })
        } else {
          deadTdLinks.push({ sourceId: task.id, targetId: data.id })
        }
      }
    }

    // Build Data→Output links (valid + dead)
    const doLinks: FlowLink[] = []
    const deadDoLinks: { sourceId: string; targetId: string }[] = []
    for (const data of dataDims) {
      for (const output of outputs) {
        const matching = patterns.filter(p =>
          p.dataDimensionIds.includes(data.id) && p.responseDimensionId === output.id
        )
        if (matching.length > 0) {
          doLinks.push({
            sourceId: data.id,
            targetId: output.id,
            patternCount: matching.length,
            tierBreakdown: {
              simple: matching.filter(p => p.tier === 'simple').length,
              complex: matching.filter(p => p.tier === 'complex').length,
              fuzzy: matching.filter(p => p.tier === 'fuzzy').length,
            },
          })
        } else {
          deadDoLinks.push({ sourceId: data.id, targetId: output.id })
        }
      }
    }

    // Build Output→Tool links (valid + dead)
    const otLinks: FlowLink[] = []
    const deadOtLinks: { sourceId: string; targetId: string }[] = []
    for (const output of outputs) {
      for (const toolState of allToolStates) {
        const matching = patterns.filter(p =>
          p.responseDimensionId === output.id && p.toolDimensionIds.includes(toolState.id)
        )
        if (matching.length > 0) {
          otLinks.push({
            sourceId: output.id,
            targetId: toolState.id,
            patternCount: matching.length,
            tierBreakdown: {
              simple: matching.filter(p => p.tier === 'simple').length,
              complex: matching.filter(p => p.tier === 'complex').length,
              fuzzy: matching.filter(p => p.tier === 'fuzzy').length,
            },
          })
        } else {
          deadOtLinks.push({ sourceId: output.id, targetId: toolState.id })
        }
      }
    }

    return {
      nodes: allNodes,
      taskDataLinks: tdLinks,
      dataOutputLinks: doLinks,
      outputToolLinks: otLinks,
      deadTaskDataLinks: deadTdLinks,
      deadDataOutputLinks: deadDoLinks,
      deadOutputToolLinks: deadOtLinks,
    }
  }, [patterns, analysis])

  // Compute max pattern count for link thickness scaling
  const maxLinkCount = useMemo(() => {
    const allLinks = [...taskDataLinks, ...dataOutputLinks, ...outputToolLinks]
    return Math.max(1, ...allLinks.map(l => l.patternCount))
  }, [taskDataLinks, dataOutputLinks, outputToolLinks])

  // Determine which nodes/links are connected to hovered node
  const { connectedNodeIds, connectedLinkIds } = useMemo(() => {
    if (!hoveredNode) return { connectedNodeIds: new Set<string>(), connectedLinkIds: new Set<string>() }

    const nodeIds = new Set<string>([hoveredNode])
    const linkIds = new Set<string>()

    for (const link of taskDataLinks) {
      if (link.sourceId === hoveredNode || link.targetId === hoveredNode) {
        nodeIds.add(link.sourceId)
        nodeIds.add(link.targetId)
        linkIds.add(`${link.sourceId}-${link.targetId}`)
      }
    }
    for (const link of dataOutputLinks) {
      if (link.sourceId === hoveredNode || link.targetId === hoveredNode) {
        nodeIds.add(link.sourceId)
        nodeIds.add(link.targetId)
        linkIds.add(`${link.sourceId}-${link.targetId}`)
      }
    }
    for (const link of outputToolLinks) {
      if (link.sourceId === hoveredNode || link.targetId === hoveredNode) {
        nodeIds.add(link.sourceId)
        nodeIds.add(link.targetId)
        linkIds.add(`${link.sourceId}-${link.targetId}`)
      }
    }

    // For task nodes, also connect through data→output→tool
    const hoveredNodeObj = nodes.find(n => n.id === hoveredNode)
    if (hoveredNodeObj?.column === 0) {
      const connectedDataIds = taskDataLinks
        .filter(l => l.sourceId === hoveredNode)
        .map(l => l.targetId)
      for (const dataId of connectedDataIds) {
        for (const link of dataOutputLinks) {
          if (link.sourceId === dataId) {
            nodeIds.add(link.targetId)
            linkIds.add(`${link.sourceId}-${link.targetId}`)
            // Also connect to tool states
            const outputId = link.targetId
            for (const otLink of outputToolLinks) {
              if (otLink.sourceId === outputId) {
                nodeIds.add(otLink.targetId)
                linkIds.add(`${otLink.sourceId}-${otLink.targetId}`)
              }
            }
          }
        }
      }
    }

    // For output nodes, connect back through data to tasks and forward to tools
    if (hoveredNodeObj?.column === 2) {
      const connectedDataIds = dataOutputLinks
        .filter(l => l.targetId === hoveredNode)
        .map(l => l.sourceId)
      for (const dataId of connectedDataIds) {
        for (const link of taskDataLinks) {
          if (link.targetId === dataId) {
            nodeIds.add(link.sourceId)
            linkIds.add(`${link.sourceId}-${link.targetId}`)
          }
        }
      }
      // Also connect to tool states
      for (const link of outputToolLinks) {
        if (link.sourceId === hoveredNode) {
          nodeIds.add(link.targetId)
          linkIds.add(`${link.sourceId}-${link.targetId}`)
        }
      }
    }

    // For tool state nodes, connect back through output to data
    if (hoveredNodeObj?.column === 3) {
      const connectedOutputIds = outputToolLinks
        .filter(l => l.targetId === hoveredNode)
        .map(l => l.sourceId)
      for (const outputId of connectedOutputIds) {
        for (const link of dataOutputLinks) {
          if (link.targetId === outputId) {
            nodeIds.add(link.sourceId)
            linkIds.add(`${link.sourceId}-${link.targetId}`)
            // Also connect to tasks
            const dataId = link.sourceId
            for (const tdLink of taskDataLinks) {
              if (tdLink.targetId === dataId) {
                nodeIds.add(tdLink.sourceId)
                linkIds.add(`${tdLink.sourceId}-${tdLink.targetId}`)
              }
            }
          }
        }
      }
    }

    return { connectedNodeIds: nodeIds, connectedLinkIds: linkIds }
  }, [hoveredNode, taskDataLinks, dataOutputLinks, outputToolLinks, nodes])

  // Link thickness: log scale mapped to 2-10px
  function linkThickness(count: number): number {
    return 2 + (Math.log(count + 1) / Math.log(maxLinkCount + 1)) * 8
  }

  // Bezier path for a link
  function linkPath(source: FlowNode, target: FlowNode): string {
    const cpOffset = Math.abs(target.x - source.x) * 0.4
    return `M ${source.x} ${source.y} C ${source.x + cpOffset} ${source.y}, ${target.x - cpOffset} ${target.y}, ${target.x} ${target.y}`
  }

  // Node lookup
  const nodeMap = useMemo(() => {
    const m = new Map<string, FlowNode>()
    for (const n of nodes) m.set(n.id, n)
    return m
  }, [nodes])

  const isAnythingHovered = hoveredNode !== null

  // Hovered link tooltip data
  const hoveredLinkData = useMemo(() => {
    if (!hoveredLink) return null
    const allLinks = [...taskDataLinks, ...dataOutputLinks, ...outputToolLinks]
    return allLinks.find(l => `${l.sourceId}-${l.targetId}` === hoveredLink) ?? null
  }, [hoveredLink, taskDataLinks, dataOutputLinks, outputToolLinks])

  // Compute tooltip pixel position from SVG coordinates
  const tooltipPos = useMemo(() => {
    if (!hoveredNode) return null
    const node = nodeMap.get(hoveredNode)
    if (!node || !svgRef.current || !containerRef.current) return null
    const svgRect = svgRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    // Map SVG viewBox coords to pixel coords
    const scaleX = svgRect.width / W
    const scaleY = svgRect.height / H
    const px = svgRect.left - containerRect.left + node.x * scaleX
    const py = svgRect.top - containerRect.top + node.y * scaleY
    return { x: px, y: py, column: node.column }
  }, [hoveredNode, nodeMap, W, H])

  // Get tier breakdown for hovered node
  const hoveredNodeTiers = useMemo(() => {
    if (!hoveredNode) return null
    const node = nodeMap.get(hoveredNode)
    if (!node) return null
    const relevant = node.column === 0
      ? patterns.filter(p => p.taskDimensionId === hoveredNode)
      : node.column === 1
        ? patterns.filter(p => p.dataDimensionIds.includes(hoveredNode))
        : node.column === 2
          ? patterns.filter(p => p.responseDimensionId === hoveredNode)
          : patterns.filter(p => p.toolDimensionIds.includes(hoveredNode))
    return {
      total: relevant.length,
      simple: relevant.filter(p => p.tier === 'simple').length,
      complex: relevant.filter(p => p.tier === 'complex').length,
      fuzzy: relevant.filter(p => p.tier === 'fuzzy').length,
    }
  }, [hoveredNode, patterns, nodeMap])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl relative"
      style={{ background: '#0f172a', overflow: 'visible' }}
      ref={containerRef}
    >
      <div className="px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dimensional Flow</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: DIMENSION_COLORS.task.primary }} />
              <span className="text-gray-500">Tasks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: DIMENSION_COLORS.data.primary }} />
              <span className="text-gray-500">Data Sources</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: DIMENSION_COLORS.output.primary }} />
              <span className="text-gray-500">Responses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: DIMENSION_COLORS.tool.primary }} />
              <span className="text-gray-500">Tools</span>
            </div>
          </div>
        </div>

        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" overflow="visible" role="img" aria-label="Dimensional flow showing pattern relationships">
          <defs>
            <filter id="glow-flow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-node">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-link-hover">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Gradient defs for links */}
            <linearGradient id="grad-task-data" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={DIMENSION_COLORS.task.primary} />
              <stop offset="100%" stopColor={DIMENSION_COLORS.data.primary} />
            </linearGradient>
            <linearGradient id="grad-data-output" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={DIMENSION_COLORS.data.primary} />
              <stop offset="100%" stopColor={DIMENSION_COLORS.output.primary} />
            </linearGradient>
            <linearGradient id="grad-output-tool" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={DIMENSION_COLORS.output.primary} />
              <stop offset="100%" stopColor={DIMENSION_COLORS.tool.primary} />
            </linearGradient>
          </defs>

          {/* Column labels */}
          <text x={COL_X[0]} y={22} textAnchor="middle" fontSize={11} fontWeight="700" fill={DIMENSION_COLORS.task.primary} letterSpacing="0.08em">
            TASKS
          </text>
          <text x={COL_X[1]} y={22} textAnchor="middle" fontSize={11} fontWeight="700" fill={DIMENSION_COLORS.data.primary} letterSpacing="0.08em">
            DATA SOURCES
          </text>
          <text x={COL_X[2]} y={22} textAnchor="middle" fontSize={11} fontWeight="700" fill={DIMENSION_COLORS.output.primary} letterSpacing="0.08em">
            RESPONSES
          </text>
          <text x={COL_X[3]} y={22} textAnchor="middle" fontSize={11} fontWeight="700" fill={DIMENSION_COLORS.tool.primary} letterSpacing="0.08em">
            TOOLS
          </text>

          {/* Dead Task → Data paths (invalid combinations, greyed out) */}
          {deadTaskDataLinks.map((link) => {
            const source = nodeMap.get(link.sourceId)
            const target = nodeMap.get(link.targetId)
            if (!source || !target) return null
            return (
              <path
                key={`dead-td-${link.sourceId}-${link.targetId}`}
                d={linkPath(source, target)}
                fill="none"
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray="4 6"
                opacity={isAnythingHovered ? 0.03 : 0.08}
                strokeLinecap="round"
                style={{ transition: 'opacity 0.2s ease' }}
              />
            )
          })}

          {/* Dead Data → Output paths (invalid combinations, greyed out) */}
          {deadDataOutputLinks.map((link) => {
            const source = nodeMap.get(link.sourceId)
            const target = nodeMap.get(link.targetId)
            if (!source || !target) return null
            return (
              <path
                key={`dead-do-${link.sourceId}-${link.targetId}`}
                d={linkPath(source, target)}
                fill="none"
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray="4 6"
                opacity={isAnythingHovered ? 0.03 : 0.08}
                strokeLinecap="round"
                style={{ transition: 'opacity 0.2s ease' }}
              />
            )
          })}

          {/* Dead Output → Tool paths (invalid combinations, greyed out) */}
          {deadOutputToolLinks.map((link) => {
            const source = nodeMap.get(link.sourceId)
            const target = nodeMap.get(link.targetId)
            if (!source || !target) return null
            return (
              <path
                key={`dead-ot-${link.sourceId}-${link.targetId}`}
                d={linkPath(source, target)}
                fill="none"
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray="4 6"
                opacity={isAnythingHovered ? 0.03 : 0.08}
                strokeLinecap="round"
                style={{ transition: 'opacity 0.2s ease' }}
              />
            )
          })}

          {/* Valid Task → Data links */}
          {taskDataLinks.map((link) => {
            const source = nodeMap.get(link.sourceId)
            const target = nodeMap.get(link.targetId)
            if (!source || !target) return null
            const linkId = `${link.sourceId}-${link.targetId}`
            const isConnected = connectedLinkIds.has(linkId)
            const isDimmed = isAnythingHovered && !isConnected
            const isThisHovered = hoveredLink === linkId

            return (
              <motion.path
                key={`link-td-${linkId}`}
                d={linkPath(source, target)}
                fill="none"
                stroke="url(#grad-task-data)"
                strokeWidth={isThisHovered ? linkThickness(link.patternCount) + 2 : linkThickness(link.patternCount)}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: isDimmed ? 0.03 : isThisHovered ? 0.95 : isConnected && isAnythingHovered ? 0.65 : 0.18,
                }}
                transition={{ pathLength: { duration: 0.8, delay: 0.1 }, opacity: { duration: 0.15 } }}
                strokeLinecap="round"
                style={{
                  cursor: 'pointer',
                  filter: isThisHovered ? 'url(#glow-link-hover)' : isConnected && isAnythingHovered ? 'url(#glow-flow)' : 'none',
                }}
                onMouseEnter={() => setHoveredLink(linkId)}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={() => {
                  const nodeObj = nodeMap.get(link.sourceId)
                  if (nodeObj) {
                    onFilterChange(activeFilter?.id === link.sourceId ? null : { type: 'task', id: link.sourceId })
                  }
                }}
              />
            )
          })}

          {/* Valid Data → Output links */}
          {dataOutputLinks.map((link) => {
            const source = nodeMap.get(link.sourceId)
            const target = nodeMap.get(link.targetId)
            if (!source || !target) return null
            const linkId = `${link.sourceId}-${link.targetId}`
            const isConnected = connectedLinkIds.has(linkId)
            const isDimmed = isAnythingHovered && !isConnected
            const isThisHovered = hoveredLink === linkId

            return (
              <motion.path
                key={`link-do-${linkId}`}
                d={linkPath(source, target)}
                fill="none"
                stroke="url(#grad-data-output)"
                strokeWidth={isThisHovered ? linkThickness(link.patternCount) + 2 : linkThickness(link.patternCount)}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: isDimmed ? 0.03 : isThisHovered ? 0.95 : isConnected && isAnythingHovered ? 0.65 : 0.18,
                }}
                transition={{ pathLength: { duration: 0.8, delay: 0.3 }, opacity: { duration: 0.15 } }}
                strokeLinecap="round"
                style={{
                  cursor: 'pointer',
                  filter: isThisHovered ? 'url(#glow-link-hover)' : isConnected && isAnythingHovered ? 'url(#glow-flow)' : 'none',
                }}
                onMouseEnter={() => setHoveredLink(linkId)}
                onMouseLeave={() => setHoveredLink(null)}
              />
            )
          })}

          {/* Valid Output → Tool links */}
          {outputToolLinks.map((link) => {
            const source = nodeMap.get(link.sourceId)
            const target = nodeMap.get(link.targetId)
            if (!source || !target) return null
            const linkId = `${link.sourceId}-${link.targetId}`
            const isConnected = connectedLinkIds.has(linkId)
            const isDimmed = isAnythingHovered && !isConnected
            const isThisHovered = hoveredLink === linkId

            return (
              <motion.path
                key={`link-ot-${linkId}`}
                d={linkPath(source, target)}
                fill="none"
                stroke="url(#grad-output-tool)"
                strokeWidth={isThisHovered ? linkThickness(link.patternCount) + 2 : linkThickness(link.patternCount)}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: isDimmed ? 0.03 : isThisHovered ? 0.95 : isConnected && isAnythingHovered ? 0.65 : 0.18,
                }}
                transition={{ pathLength: { duration: 0.8, delay: 0.5 }, opacity: { duration: 0.15 } }}
                strokeLinecap="round"
                style={{
                  cursor: 'pointer',
                  filter: isThisHovered ? 'url(#glow-link-hover)' : isConnected && isAnythingHovered ? 'url(#glow-flow)' : 'none',
                }}
                onMouseEnter={() => setHoveredLink(linkId)}
                onMouseLeave={() => setHoveredLink(null)}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isConnected = connectedNodeIds.has(node.id)
            const isDimmed = isAnythingHovered && !isConnected
            const isHovered = hoveredNode === node.id
            const isActive = activeFilter?.id === node.id
            const nodeRadius = 6 + Math.min(Math.log(node.patternCount + 1) * 1.5, 6)

            // Label positioning
            const labelX = node.column === 0 ? node.x - nodeRadius - 6 : node.column === 3 ? node.x + nodeRadius + 6 : node.x
            const labelAnchor = node.column === 0 ? 'end' : node.column === 3 ? 'start' : 'middle'
            const labelY = (node.column === 1 || node.column === 2) ? node.y - nodeRadius - 5 : node.y + 1

            return (
              <g
                key={node.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => handleNodeHover(node.id)}
                onMouseLeave={() => handleNodeHover(null)}
                onClick={() => {
                  const type = node.column === 0 ? 'task' as const : node.column === 1 ? 'data' as const : node.column === 2 ? 'output' as const : 'tool' as const
                  onFilterChange(activeFilter?.id === node.id ? null : { type, id: node.id })
                }}
              >
                {/* Outer glow ring for hovered/active */}
                {(isHovered || isActive) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius + 4}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={1.5}
                    strokeOpacity={0.4}
                    filter="url(#glow-node)"
                  />
                )}

                {/* Main node circle */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={node.color}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: isDimmed ? 0.2 : 1,
                  }}
                  transition={{ scale: { duration: 0.3, delay: node.column * 0.15 }, opacity: { duration: 0.15 } }}
                  filter={isHovered || isConnected ? 'url(#glow-node)' : 'none'}
                />


                {/* Label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={labelAnchor}
                  dominantBaseline="middle"
                  fontSize={10}
                  fontWeight="600"
                  fill={isHovered || isConnected ? node.glowColor : isDimmed ? '#475569' : '#94a3b8'}
                  style={{
                    pointerEvents: 'none',
                    transition: 'fill 0.15s ease, opacity 0.15s ease',
                    opacity: isDimmed ? 0.3 : 1,
                  }}
                >
                  {node.label.length > 20 ? node.label.slice(0, 18) + '\u2026' : node.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Bottom stats bar */}
        <div className="flex items-center gap-4 mt-2 px-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]"
            style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.15)' }}
          >
            <span className="text-white font-semibold">{patterns.length} patterns</span>
            <span className="text-gray-500">
              {taskDataLinks.reduce((s, l) => s + l.patternCount, 0) > 0 && (
                <>
                  <span className="text-green-400 mr-1">{patterns.filter(p => p.tier === 'simple').length}S</span>
                  <span className="text-red-400 mr-1">{patterns.filter(p => p.tier === 'complex').length}C</span>
                  <span className="text-amber-400">{patterns.filter(p => p.tier === 'fuzzy').length}F</span>
                </>
              )}
            </span>
          </div>
          {(deadTaskDataLinks.length > 0 || deadDataOutputLinks.length > 0 || deadOutputToolLinks.length > 0) && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px]"
              style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(71,85,105,0.3)' }}
            >
              <div className="w-3 border-t border-dashed" style={{ borderColor: '#475569' }} />
              <span className="text-gray-600">{deadTaskDataLinks.length + deadDataOutputLinks.length + deadOutputToolLinks.length} eliminated paths</span>
            </div>
          )}
        </div>

        {/* Node info card — positioned near the hovered node */}
        <AnimatePresence>
          {hoveredNode && tooltipPos && hoveredNodeTiers && (
            <motion.div
              key={`tip-${hoveredNode}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute px-3 py-2.5 rounded-lg pointer-events-none z-20"
              style={{
                left: tooltipPos.column === 0
                  ? tooltipPos.x + 16
                  : tooltipPos.column === 2
                    ? tooltipPos.x - 16
                    : tooltipPos.x,
                top: tooltipPos.y - 50,
                transform: tooltipPos.column === 2 ? 'translateX(-100%)' : tooltipPos.column === 1 ? 'translateX(-50%)' : 'none',
                background: 'rgba(15,23,42,0.97)',
                border: `1px solid ${nodeMap.get(hoveredNode)?.color ?? '#475569'}44`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 15px ${nodeMap.get(hoveredNode)?.color ?? '#475569'}22`,
                maxWidth: 260,
              }}
            >
              <div className="text-[11px] font-semibold text-white mb-1" style={{ color: nodeMap.get(hoveredNode)?.glowColor }}>
                {labels[hoveredNode] ?? hoveredNode}
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-gray-300 font-medium">{hoveredNodeTiers.total} patterns</span>
                <span className="text-gray-600">|</span>
                {hoveredNodeTiers.simple > 0 && <span className="text-green-400">{hoveredNodeTiers.simple}S</span>}
                {hoveredNodeTiers.complex > 0 && <span className="text-red-400">{hoveredNodeTiers.complex}C</span>}
                {hoveredNodeTiers.fuzzy > 0 && <span className="text-amber-400">{hoveredNodeTiers.fuzzy}F</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link hover tooltip — fixed bottom-left */}
        <AnimatePresence>
          {hoveredLinkData && !hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-14 left-4 px-3 py-2 rounded-lg text-xs pointer-events-none z-20"
              style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(148,163,184,0.25)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
            >
              <span className="text-white font-semibold">{hoveredLinkData.patternCount} patterns</span>
              <span className="text-gray-500 ml-2">
                {hoveredLinkData.tierBreakdown.simple > 0 && <span className="text-green-400 mr-1.5">{hoveredLinkData.tierBreakdown.simple}S</span>}
                {hoveredLinkData.tierBreakdown.complex > 0 && <span className="text-red-400 mr-1.5">{hoveredLinkData.tierBreakdown.complex}C</span>}
                {hoveredLinkData.tierBreakdown.fuzzy > 0 && <span className="text-amber-400">{hoveredLinkData.tierBreakdown.fuzzy}F</span>}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Dimensional Sunburst (kept as toggle view) ─────────────────────────────

interface SunburstArc {
  ring: 0 | 1 | 2
  id: string
  label: string
  startAngle: number
  endAngle: number
  tier: PatternTier | null
  count: number
  parentId?: string
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

  const handleArcHover = useCallback((id: string | null) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoveredArcRef.current = id
    hoverTimeoutRef.current = setTimeout(() => setHoveredArc(id), id ? 30 : 80)
  }, [])

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

  const arcs = useMemo(() => {
    const result: SunburstArc[] = []
    const TAU = Math.PI * 2
    const total = patterns.length || 1

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

      const tierCounts = { simple: 0, complex: 0, fuzzy: 0 }
      for (const p of taskPatterns) tierCounts[p.tier]++
      const dominantTier = (Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0][0]) as PatternTier

      result.push({ ring: 0, id: `task-${taskId}`, label: labels[taskId] ?? taskId, startAngle: taskStart, endAngle: taskEnd, tier: dominantTier, count: taskPatterns.length })

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
        const dataLabel = dataDims.length === 1
          ? labels[dataDims[0]] ?? dataDims[0]
          : dataDims.length === 2
            ? `${labels[dataDims[0]] ?? dataDims[0]} + ${labels[dataDims[1]] ?? dataDims[1]}`
            : `${labels[dataDims[0]] ?? dataDims[0]} +${dataDims.length - 1}`

        result.push({ ring: 1, id: `data-${taskId}-${dataKey}`, label: dataLabel, startAngle: dataStart, endAngle: dataEnd, tier: dDominantTier, count: dataPatterns.length, parentId: `task-${taskId}` })

        let upAngle = dataStart
        for (const p of dataPatterns) {
          const upSpan = (1 / total) * TAU
          result.push({ ring: 2, id: `up-${p.id}`, label: labels[p.responseDimensionId] ?? p.responseDimensionId, startAngle: upAngle, endAngle: upAngle + upSpan, tier: p.tier, count: 1, parentId: `data-${taskId}-${dataKey}` })
          upAngle += upSpan
        }
        dataAngle += dataSpan
      }
      taskAngle += taskSpan
    }
    return result
  }, [patterns, taskIds, labels])

  const SIZE = 900
  const CX = SIZE / 2
  const CY = SIZE / 2
  const RINGS = [
    { inner: 90, outer: 185 },
    { inner: 195, outer: 310 },
    { inner: 320, outer: 420 },
  ]

  const RING_PALETTE = [
    {
      base: DIMENSION_COLORS.task.primary,
      simple: { fill: DIMENSION_COLORS.task.light, stroke: DIMENSION_COLORS.task.primary },
      complex: { fill: `${DIMENSION_COLORS.task.primary}12`, stroke: DIMENSION_COLORS.task.medium },
      fuzzy: { fill: `${DIMENSION_COLORS.task.primary}08`, stroke: `${DIMENSION_COLORS.task.primary}60` },
      hovered: { fill: DIMENSION_COLORS.task.medium, stroke: DIMENSION_COLORS.task.dark },
    },
    {
      base: DIMENSION_COLORS.data.primary,
      simple: { fill: DIMENSION_COLORS.data.light, stroke: DIMENSION_COLORS.data.primary },
      complex: { fill: `${DIMENSION_COLORS.data.primary}12`, stroke: DIMENSION_COLORS.data.medium },
      fuzzy: { fill: `${DIMENSION_COLORS.data.primary}08`, stroke: `${DIMENSION_COLORS.data.primary}60` },
      hovered: { fill: DIMENSION_COLORS.data.medium, stroke: DIMENSION_COLORS.data.dark },
    },
    {
      base: DIMENSION_COLORS.userProfile.primary,
      simple: { fill: DIMENSION_COLORS.userProfile.medium, stroke: DIMENSION_COLORS.userProfile.primary },
      complex: { fill: `${DIMENSION_COLORS.userProfile.primary}30`, stroke: DIMENSION_COLORS.userProfile.medium },
      fuzzy: { fill: `${DIMENSION_COLORS.userProfile.primary}18`, stroke: `${DIMENSION_COLORS.userProfile.primary}80` },
      hovered: { fill: DIMENSION_COLORS.userProfile.primary, stroke: DIMENSION_COLORS.userProfile.dark },
    },
  ]

  function getArcColors(ring: 0 | 1 | 2, tier: PatternTier | null, isHovered: boolean) {
    const p = RING_PALETTE[ring]
    if (isHovered) return p.hovered
    if (!tier) return { fill: `${p.base}18`, stroke: `${p.base}50` }
    return p[tier]
  }

  function arcPath(innerR: number, outerR: number, startAngle: number, endAngle: number): string {
    const s = startAngle - Math.PI / 2
    const e = endAngle - Math.PI / 2
    const span = e - s
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
      `M ${x1} ${y1}`, `L ${x2} ${y2}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1}`, 'Z',
    ].join(' ')
  }

  const hoveredData = arcs.find((a) => a.id === hoveredArc)

  return (
    <motion.div ref={containerRef} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="rounded-xl border bg-white p-5" style={{ borderColor: `${accentColor}15` }}>
      <div className="flex items-center gap-2 mb-3">
        <ArrowRight className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />
        <h3 className="text-sm font-bold text-gray-900">Dimensional Sunburst</h3>
        <span className="text-[10px] text-gray-400">Task &rarr; Data &rarr; Response</span>
        <span className="ml-auto text-[10px] font-mono tabular-nums" style={{ color: accentColor }}>{patterns.length} patterns</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[900px] mx-auto" role="img" aria-label={`Sunburst chart showing ${patterns.length} patterns`}>
          <motion.g initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: hasAnimated ? 1 : 0, scale: hasAnimated ? 1 : 0.85 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ transformOrigin: `${CX}px ${CY}px` }}>
            {arcs.map((arc) => {
              const ring = RINGS[arc.ring]
              const d = arcPath(ring.inner, ring.outer, arc.startAngle, arc.endAngle)
              if (!d) return null

              const isHovered = hoveredArc === arc.id
              const isParentOfHovered = hoveredData?.parentId === arc.id
              const isChildOfHovered = arc.ring === 2 && hoveredArc === arc.parentId
              const highlighted = isHovered || isChildOfHovered
              const dimmed = !!hoveredArc && !highlighted && !isParentOfHovered
              const colors = getArcColors(arc.ring as 0 | 1 | 2, arc.tier, highlighted)
              const hasHover = arc.ring !== 2

              return (
                <path key={arc.id} d={d} fill={colors.fill} stroke={colors.stroke} strokeWidth={highlighted ? 2 : arc.ring === 2 ? 0.8 : 0.5} opacity={dimmed ? 0.3 : 1}
                  style={{ transition: 'fill 0.15s ease, stroke 0.15s ease, opacity 0.2s ease', cursor: hasHover ? 'pointer' : 'default' }}
                  onMouseEnter={hasHover ? () => handleArcHover(arc.id) : undefined}
                  onMouseLeave={hasHover ? () => handleArcHover(null) : undefined}
                />
              )
            })}

            {arcs.filter((a) => a.ring === 0 && a.endAngle - a.startAngle > 0.35).map((arc) => {
              const mid = (arc.startAngle + arc.endAngle) / 2 - Math.PI / 2
              const r = (RINGS[0].inner + RINGS[0].outer) / 2
              const x = CX + r * Math.cos(mid), y = CY + r * Math.sin(mid)
              const angle = (mid * 180) / Math.PI
              const flip = angle > 90 || angle < -90
              return (
                <text key={`lbl-${arc.id}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="700" fill={RING_PALETTE[0].base} style={{ pointerEvents: 'none' }} transform={`rotate(${flip ? angle + 180 : angle}, ${x}, ${y})`}>
                  {arc.label.length > 18 ? arc.label.slice(0, 16) + '\u2026' : arc.label}
                </text>
              )
            })}

            {arcs.filter((a) => a.ring === 1 && a.endAngle - a.startAngle > 0.45).map((arc) => {
              const mid = (arc.startAngle + arc.endAngle) / 2 - Math.PI / 2
              const r = (RINGS[1].inner + RINGS[1].outer) / 2
              const x = CX + r * Math.cos(mid), y = CY + r * Math.sin(mid)
              const angle = (mid * 180) / Math.PI
              const flip = angle > 90 || angle < -90
              return (
                <text key={`lbl-${arc.id}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="600" fill={RING_PALETTE[1].base} style={{ pointerEvents: 'none' }} transform={`rotate(${flip ? angle + 180 : angle}, ${x}, ${y})`}>
                  {arc.label.length > 20 ? arc.label.slice(0, 18) + '\u2026' : arc.label}
                </text>
              )
            })}
          </motion.g>

          <text x={CX} y={CY - 14} textAnchor="middle" fontSize={32} fontWeight="700" fill="#1e293b">{patterns.length}</text>
          <text x={CX} y={CY + 16} textAnchor="middle" fontSize={16} fill="#9ca3af">patterns</text>
        </svg>

        {/* Hover tooltip panel */}
        <div className="min-w-[170px] pt-2 hidden sm:block shrink-0">
          {hoveredData ? (
            <motion.div key={hoveredData.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="p-3 rounded-lg border bg-white shadow-sm text-[11px]" style={{ borderColor: RING_PALETTE[hoveredData.ring as 0|1|2].base + '40' }}>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: RING_PALETTE[hoveredData.ring as 0|1|2].base }}>
                {hoveredData.ring === 0 ? 'Task' : hoveredData.ring === 1 ? 'Data Source' : 'Response'}
              </div>
              <p className="font-bold text-gray-900 mb-1">{hoveredData.label}</p>
              {hoveredData.tier && (
                <p className="text-gray-500">
                  Pattern type: <span className="font-semibold capitalize" style={{ color: hoveredData.tier === 'simple' ? '#16a34a' : hoveredData.tier === 'complex' ? '#dc2626' : '#d97706' }}>{hoveredData.tier === 'simple' ? 'Simple' : hoveredData.tier === 'complex' ? 'Complex' : 'Fuzzy'}</span>
                </p>
              )}
              <p className="text-gray-500 mt-0.5">{hoveredData.count} pattern{hoveredData.count !== 1 ? 's' : ''}</p>
            </motion.div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed border-gray-200 text-[10px] text-gray-400 text-center">Hover over arcs to explore dimensions</div>
          )}
          <div className="mt-3 space-y-2">
            {[
              { label: 'Task', sublabel: 'Inner ring', color: RING_PALETTE[0].base },
              { label: 'Data Source', sublabel: 'Middle ring', color: RING_PALETTE[1].base },
              { label: 'Response', sublabel: 'Outer ring', color: RING_PALETTE[2].base },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color + '30', border: `1.5px solid ${item.color}` }} />
                <div>
                  <span className="text-[10px] font-semibold text-gray-700">{item.label}</span>
                  <span className="text-[9px] text-gray-400 ml-1">{item.sublabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Tier Breakdown Bar ──────────────────────────────────────────────────────

const TIER_TABS_DEF: { id: TierTab; label: string; color: string }[] = [
  { id: 'simple', label: 'Simple', color: '#16a34a' },
  { id: 'complex', label: 'Complex', color: '#dc2626' },
  { id: 'fuzzy', label: 'Fuzzy', color: '#d97706' },
]

function TierBreakdownBar({ breakdown, total, accentColor }: { breakdown: { simple: number; complex: number; fuzzy: number }; total: number; accentColor: string }) {
  const segments = TIER_TABS_DEF.map((tier) => ({
    count: breakdown[tier.id],
    pct: total > 0 ? Math.round((breakdown[tier.id] / total) * 100) : 0,
    color: tier.color,
    label: tier.label,
  }))

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="rounded-xl border bg-white p-5" style={{ borderColor: `${accentColor}15` }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}12` }}>
          <span className="text-lg font-bold" style={{ color: accentColor }}>{total}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Valid Patterns</p>
          <p className="text-[11px] text-gray-500">from {segments.reduce((s, seg) => s + seg.count, 0)} dimension combinations</p>
        </div>
      </div>
      <div className="h-3 rounded-full overflow-hidden flex mb-3" style={{ background: '#f1f5f9' }}>
        {segments.map((seg, i) => (
          <motion.div key={seg.label} initial={{ width: 0 }} animate={{ width: `${seg.pct}%` }} transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }} style={{ background: seg.color }} />
        ))}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} aria-hidden="true" />
            <span className="text-[11px] text-gray-600">{seg.label}: <strong>{seg.count}</strong> ({seg.pct}%)</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Dimension DNA Chip ──────────────────────────────────────────────────────

function DimensionDNA({ taskId, dataIds, outputId, toolStateIds, labels }: { taskId: string; dataIds: string[]; outputId: string; toolStateIds: string[]; labels: Record<string, string> }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded items-center" style={{ color: DIMENSION_COLORS.task.primary, background: DIMENSION_COLORS.task.light, border: `1px solid ${DIMENSION_COLORS.task.medium}`, display: 'inline-flex' }}>
        {labels[taskId] ?? taskId}
      </span>
      <ArrowRight className="w-2.5 h-2.5 text-gray-300" aria-hidden="true" />
      {dataIds.map((dId, i) => (
        <span key={dId}>
          {i > 0 && <span className="text-gray-300 text-[8px] mx-0.5">+</span>}
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded items-center" style={{ color: DIMENSION_COLORS.data.primary, background: DIMENSION_COLORS.data.light, border: `1px solid ${DIMENSION_COLORS.data.medium}`, display: 'inline-flex' }}>
            {labels[dId] ?? dId}
          </span>
        </span>
      ))}
      <ArrowRight className="w-2.5 h-2.5 text-gray-300" aria-hidden="true" />
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded items-center" style={{ color: DIMENSION_COLORS.output.primary, background: DIMENSION_COLORS.output.light, border: `1px solid ${DIMENSION_COLORS.output.medium}`, display: 'inline-flex' }}>
        {labels[outputId] ?? outputId}
      </span>
      <ArrowRight className="w-2.5 h-2.5 text-gray-300" aria-hidden="true" />
      {toolStateIds.map((tsId, i) => (
        <span key={tsId}>
          {i > 0 && <span className="text-gray-300 text-[8px] mx-0.5">+</span>}
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded items-center" style={{ color: DIMENSION_COLORS.tool.primary, background: DIMENSION_COLORS.tool.light, border: `1px solid ${DIMENSION_COLORS.tool.medium}`, display: 'inline-flex' }}>
            {labels[tsId] ?? tsId}
          </span>
        </span>
      ))}
    </div>
  )
}

// ─── Pattern Card ────────────────────────────────────────────────────────────

function PatternCard({ pattern, labels, viewMode, delay, patternIndex }: { pattern: DimensionPattern; labels: Record<string, string>; viewMode: 'business' | 'technical'; delay: number; patternIndex: number }) {
  const [expanded, setExpanded] = useState(false)
  const tier = TIER_COLOR_MAP[pattern.tier]
  const typeLabel = PATTERN_TYPE_LABELS[pattern.patternType]

  const statusBadgeStyle = pattern.tier === 'simple'
    ? { background: 'rgba(16,185,129,0.10)', color: '#059669' }
    : pattern.tier === 'complex'
      ? { background: 'rgba(239,68,68,0.08)', color: '#dc2626' }
      : { background: 'rgba(245,158,11,0.10)', color: '#d97706' }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay }}
      className="rounded-xl overflow-hidden" style={{ background: '#ffffff', border: `1px solid ${tier.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50/50 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: tier.color } as React.CSSProperties} aria-expanded={expanded}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono font-bold px-3 py-1 rounded-full text-sm" style={statusBadgeStyle}>{pattern.id}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${tier.color}12`, color: tier.color }}>{typeLabel}</span>
          </div>
          <div className="text-xs font-medium text-gray-600 mb-2">{pattern.name}</div>
          <p className="text-xs text-gray-500 leading-relaxed mb-2">{pattern.description}</p>
          <DimensionDNA taskId={pattern.taskDimensionId} dataIds={pattern.dataDimensionIds} outputId={pattern.responseDimensionId} toolStateIds={pattern.toolDimensionIds} labels={labels} />
        </div>
        <span className="shrink-0 text-gray-400 mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              {pattern.inferenceNotes && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <p className="text-xs text-amber-800 leading-relaxed"><strong className="font-semibold">{viewMode === 'technical' ? 'Inference:' : 'What the agent figures out:'}</strong> {pattern.inferenceNotes}</p>
                </div>
              )}
              {pattern.ambiguityNotes && (
                <div className="p-3 rounded-lg" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <p className="text-xs text-red-800 leading-relaxed"><strong className="font-semibold">{viewMode === 'technical' ? 'Ambiguity:' : 'Where it gets tricky:'}</strong> {pattern.ambiguityNotes}</p>
                </div>
              )}
              {pattern.exampleQuestions.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Example Interactions</h5>
                  <div className="space-y-1.5">
                    {pattern.exampleQuestions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: '#f8fafc' }}>
                        <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
                        <p className="text-xs text-gray-700 leading-snug">&ldquo;{q}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewMode === 'technical' && pattern.activatedComponents && pattern.activatedComponents.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Activated Components ({pattern.activatedComponents.length})</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {pattern.activatedComponents.map((compId) => (
                      <span key={compId} className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>{compId}</span>
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

// ─── Main Component ─────────────────────────────────────────────────────────

export function InteractionDiscovery() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const [activeSection, setActiveSection] = useState<TierTab | null>(() =>
    activeTileId != null && animatedTileIds.has(activeTileId) ? 'simple' : null
  )
  const [phase, setPhase] = useState<AnimPhase>(() =>
    activeTileId != null && animatedTileIds.has(activeTileId) ? 'complete' : 'counter'
  )
  const [vizMode, setVizMode] = useState<'flow' | 'sunburst'>('flow')
  const [activeFilter, setActiveFilter] = useState<{ type: 'task' | 'data' | 'output' | 'tool'; id: string } | null>(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const data = activeTileId ? getCombinatorialPatternsData(activeTileId) : null
  const analysis = activeTileId ? getDimensionAnalysisData(activeTileId) : null
  const labels = useDimensionLabels(activeTileId)
  const accentColor = tile?.color ?? '#3b82f6'

  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
  }, [activeTileId])

  useEffect(() => {
    setPage(0)
  }, [activeSection, activeFilter])

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

  // Filter patterns based on active flow filter
  const filteredPatterns = useMemo(() => {
    if (!activeFilter || !data) return null
    return data.patterns.filter((p) => {
      if (activeFilter.type === 'task') return p.taskDimensionId === activeFilter.id
      if (activeFilter.type === 'data') return p.dataDimensionIds.includes(activeFilter.id)
      if (activeFilter.type === 'output') return p.responseDimensionId === activeFilter.id
      if (activeFilter.type === 'tool') return p.toolDimensionIds.includes(activeFilter.id)
      return true
    })
  }, [activeFilter, data])

  // Animation sequence on mount/tile change
  const goToExplosion = useCallback(() => {
    // Mark tile as animated here (not in the effect) to avoid StrictMode double-fire skipping the animation
    if (activeTileId) animatedTileIds.add(activeTileId)
    setPhase('explosion')
  }, [activeTileId])
  const goToFlow = useCallback(() => {
    setPhase('flow')
    // Short delay then show complete with tier tabs
    setTimeout(() => {
      setPhase('complete')
      setActiveSection('simple')
    }, 300)
  }, [])

  useEffect(() => {
    if (!data || !activeTileId) return
    if (animatedTileIds.has(activeTileId)) {
      setPhase('complete')
      if (!activeSection) setActiveSection('simple')
      return
    }
    setPhase('counter')
    setActiveFilter(null)
  }, [activeTileId, data]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasFuzzy = true // always show — every scenario has hand-crafted human-intervention fuzzy patterns

  if (!tile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">No tile selected.</p>
      </div>
    )
  }

  if (!data || !analysis) {
    return (
      <div ref={containerRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pattern Recognition</h2>
          <p className="text-sm text-gray-500">Combinatorial dimension patterns</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <Grid3x3 className="w-8 h-8 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-400">Pattern data is being generated.</p>
        </motion.div>
      </div>
    )
  }

  // Compute data subset count for counter hero
  const dataSubsetCount = data.dataDimensions.length

  return (
    <div ref={containerRef} className="w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Stage header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Pattern Recognition</h2>
          {phase !== 'complete' && (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
          )}
          {phase === 'complete' && (
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${accentColor}15`, color: accentColor }}>
              Analysis Complete
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {data.totalCombinations} combinations evaluated, {data.validPatterns} valid patterns
        </p>
      </motion.div>

      {/* Phase 1 → 2 → 3: all in one AnimatePresence so each fully exits before next enters */}
      <AnimatePresence mode="wait">
        {phase === 'counter' && (
          <CounterHero
            key="counter"
            taskCount={analysis.taskDimensions.length}
            dataSubsetCount={dataSubsetCount}
            outputCount={(analysis.responseDimensions ?? analysis.outputDimensions).length}
            toolStateCount={analysis.toolDimensions.length}
            totalCombinations={data.totalCombinations}
            validPatterns={data.validPatterns}
            onComplete={goToExplosion}
          />
        )}

        {phase === 'explosion' && (
          <ExplosionAnimation
            key="explosion"
            analysis={analysis}
            onComplete={goToFlow}
          />
        )}

        {(phase === 'flow' || phase === 'complete') && (
          <motion.div
            key="viz-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* View toggle */}
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setVizMode('flow')}
                className="text-xs font-semibold px-3 py-1.5 rounded-l-lg transition-colors"
                style={{
                  background: vizMode === 'flow' ? '#1e293b' : '#f1f5f9',
                  color: vizMode === 'flow' ? '#fff' : '#64748b',
                  border: '1px solid #e2e8f0',
                }}
              >
                Flow
              </button>
              <button
                onClick={() => setVizMode('sunburst')}
                className="text-xs font-semibold px-3 py-1.5 rounded-r-lg transition-colors"
                style={{
                  background: vizMode === 'sunburst' ? '#1e293b' : '#f1f5f9',
                  color: vizMode === 'sunburst' ? '#fff' : '#64748b',
                  border: '1px solid #e2e8f0',
                }}
              >
                Sunburst
              </button>
            </div>

            {/* Visualization */}
            <AnimatePresence mode="wait">
              {vizMode === 'flow' ? (
                <motion.div key="flow-viz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <DimensionalFlow
                    patterns={data.patterns}
                    analysis={analysis}
                    labels={labels}
                    onFilterChange={setActiveFilter}
                    activeFilter={activeFilter}
                  />
                </motion.div>
              ) : (
                <motion.div key="sunburst-viz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <DimensionalSunburst
                    patterns={data.patterns}
                    taskIds={data.taskDimensions}
                    labels={labels}
                    accentColor={accentColor}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active filter indicator */}
            {activeFilter && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Circle className="w-3 h-3" style={{ color: activeFilter.type === 'task' ? DIMENSION_COLORS.task.primary : activeFilter.type === 'data' ? DIMENSION_COLORS.data.primary : DIMENSION_COLORS.output.primary }} />
                <span className="text-xs text-gray-600">
                  Filtering by <strong className="text-gray-900">{labels[activeFilter.id] ?? activeFilter.id}</strong>
                  {filteredPatterns && <span className="text-gray-400 ml-1">({filteredPatterns.length} patterns)</span>}
                </span>
                <button onClick={() => setActiveFilter(null)} className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors">Clear</button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier breakdown bar */}
      {phase === 'complete' && (
        <TierBreakdownBar breakdown={data.tierBreakdown} total={data.validPatterns} accentColor={accentColor} />
      )}

      {/* Tier tab tiles */}
      {phase === 'complete' && (
        <div className="flex gap-3">
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} onClick={() => toggleSection('simple')}
            className="flex-1 rounded-xl p-4 text-center transition-all" style={{ background: activeSection === 'simple' ? '#dcfce7' : '#f0fdf4', border: '1px solid #16a34a33', borderBottom: activeSection === 'simple' ? '4px solid #16a34a' : '1px solid #16a34a33', cursor: 'pointer' }}>
            <div className="text-2xl font-bold" style={{ color: '#16a34a' }}><CountUpNumber end={patternsByTier.simple.length} /></div>
            <div className="text-sm font-semibold text-gray-700 mt-1">Simple Patterns</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#16a34a99' }}>High-confidence patterns</div>
          </motion.button>

          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} onClick={() => toggleSection('complex')}
            className="flex-1 rounded-xl p-4 text-center transition-all" style={{ background: activeSection === 'complex' ? '#fee2e2' : '#fef2f2', border: '1px solid #dc262633', borderBottom: activeSection === 'complex' ? '4px solid #dc2626' : '1px solid #dc262633', cursor: 'pointer' }}>
            <div className="text-2xl font-bold" style={{ color: '#dc2626' }}><CountUpNumber end={patternsByTier.complex.length} /></div>
            <div className="text-sm font-semibold text-gray-700 mt-1">Complex Patterns</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#dc262699' }}>Multi-step complexity</div>
          </motion.button>

          {hasFuzzy && (
            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} onClick={() => toggleSection('fuzzy')}
              className="flex-1 rounded-xl p-4 text-center transition-all" style={{ background: activeSection === 'fuzzy' ? '#fef3c7' : '#fffbeb', border: '1px solid #d9770633', borderBottom: activeSection === 'fuzzy' ? '4px solid #d97706' : '1px solid #d9770633', cursor: 'pointer' }}>
              <div className="text-2xl font-bold" style={{ color: '#d97706' }}><CountUpNumber end={patternsByTier.fuzzy.length} /></div>
              <div className="text-sm font-semibold text-gray-700 mt-1">Fuzzy Patterns</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#d9770699' }}>Ambiguous confidence</div>
            </motion.button>
          )}
        </div>
      )}

      {/* Pattern cards content */}
      {phase === 'complete' && (
        <AnimatePresence mode="wait">
          {activeSection && (
            <motion.div key={activeSection + (activeFilter?.id ?? '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="space-y-3">
              {activeSection === 'fuzzy' && (
                <div className="rounded-xl flex items-start gap-3 px-4 py-3" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-amber-700 mb-0.5">Domain Expert Opportunity</div>
                    <p className="text-xs text-amber-600 leading-relaxed">
                      Review these interaction patterns and consider whether an additional parameter could separate them into clearer outcome buckets. A single well-chosen parameter can often convert these into Simple or Complex patterns.
                    </p>
                  </div>
                </div>
              )}

              {(() => {
                // Use filtered patterns if a flow filter is active, otherwise use tier-based patterns
                const patternsToShow = filteredPatterns
                  ? filteredPatterns.filter(p => p.tier === activeSection)
                  : patternsByTier[activeSection]

                if (patternsToShow.length === 0) {
                  return (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                      <p className="text-sm text-gray-400">
                        No {activeSection === 'simple' ? 'simple' : activeSection === 'complex' ? 'complex' : 'fuzzy'} patterns{activeFilter ? ' matching this filter' : ' for this agent'}.
                      </p>
                    </div>
                  )
                }

                const startIdx = page * PAGE_SIZE
                const endIdx = startIdx + PAGE_SIZE
                const paginatedPatterns = patternsToShow.slice(startIdx, endIdx)
                const totalPages = Math.ceil(patternsToShow.length / PAGE_SIZE)

                return (
                  <div className="space-y-4">
                    {paginatedPatterns.map((pattern, i) => (
                      <PatternCard key={pattern.id} pattern={pattern} labels={labels} viewMode={viewMode} delay={0.03 + i * 0.04} patternIndex={startIdx + i} />
                    ))}

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-4 rounded-lg border border-gray-200 bg-gray-50">
                        <span className="text-xs text-gray-500">
                          Showing {startIdx + 1}–{Math.min(endIdx, patternsToShow.length)} of {patternsToShow.length} patterns
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1.5 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          <span className="text-xs text-gray-600 font-medium">
                            Page {page + 1} of {totalPages}
                          </span>
                          <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="px-3 py-1.5 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
