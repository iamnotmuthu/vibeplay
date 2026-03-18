import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { generatePatterns, type GeneratedPattern, type PatternGenerationResult } from '@/lib/agent/patternCombinationEngine'
import { isV3SupportedTile } from '@/lib/agent/v3TileResolver'

type PatternTab = 'simple' | 'complex' | 'fuzzy'

// Always play cascade animation
const animatedTileIds = new Set<string>()
if (typeof window !== 'undefined') { animatedTileIds.clear() }

// ─── Count-Up Hook ──────────────────────────────────────────────────────
function useCountUp(target: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) { setValue(0); return }
    let raf: number
    const t0 = performance.now()
    const tick = (now: number) => {
      const elapsed = (now - t0) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  return value
}

// ─── Status Messages ────────────────────────────────────────────────────
const STATUS_MESSAGES = [
  'Mapping all task-data combinations...',
  'Checking semantic validity...',
  'Filtering disconnected paths...',
  'Removing conflicting data sources...',
  'Deduplicating equivalent patterns...',
  'Applying guardrail constraints...',
  'Computing valid execution paths...',
]

// ─── Section 1: Animated Counter + Inline Elimination ───────────────────

function EliminationHero({
  totalPatterns,
  eliminations,
  validRemaining,
  onComplete,
}: {
  totalPatterns: number
  eliminations: { category: string; count: number; icon: string; color: string; description: string }[]
  validRemaining: number
  onComplete: () => void
}) {
  const [phase, setPhase] = useState<'countup' | 'pause' | 'countdown' | 'resolve'>('countup')
  const [elimIdx, setElimIdx] = useState(-1)
  const [statusIdx, setStatusIdx] = useState(0)
  const countUpValue = useCountUp(totalPatterns, 2.5, phase === 'countup')
  const [displayNumber, setDisplayNumber] = useState(0)

  // Cycle status messages during count-up
  useEffect(() => {
    if (phase !== 'countup') return
    const iv = setInterval(() => setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length), 500)
    return () => clearInterval(iv)
  }, [phase])

  // Keep display number in sync with count-up
  useEffect(() => {
    if (phase === 'countup') setDisplayNumber(countUpValue)
  }, [countUpValue, phase])

  // Phase transitions
  useEffect(() => {
    if (phase === 'countup') {
      const t = setTimeout(() => setPhase('pause'), 2800)
      return () => clearTimeout(t)
    }
    if (phase === 'pause') {
      setDisplayNumber(totalPatterns)
      const t = setTimeout(() => { setPhase('countdown'); setElimIdx(0) }, 800)
      return () => clearTimeout(t)
    }
    if (phase === 'countdown') {
      if (elimIdx >= eliminations.length) {
        const t = setTimeout(() => setPhase('resolve'), 400)
        return () => clearTimeout(t)
      }
      // Subtract this elimination from display number
      const currentElim = eliminations[elimIdx]
      if (currentElim) {
        const targetAfter = totalPatterns - eliminations.slice(0, elimIdx + 1).reduce((s, e) => s + e.count, 0)
        // Animate the number down
        const start = displayNumber
        const diff = start - targetAfter
        let frame = 0
        const frames = 15
        const interval = setInterval(() => {
          frame++
          const progress = Math.min(frame / frames, 1)
          setDisplayNumber(Math.round(start - diff * progress))
          if (frame >= frames) clearInterval(interval)
        }, 30)
        const t = setTimeout(() => setElimIdx((i) => i + 1), 600)
        return () => { clearTimeout(t); clearInterval(interval) }
      }
    }
    if (phase === 'resolve') {
      setDisplayNumber(validRemaining)
      const t = setTimeout(onComplete, 1800)
      return () => clearTimeout(t)
    }
  }, [phase, elimIdx])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
    >
      <div className="py-10 px-6 text-center">
        {/* Large animated number */}
        <motion.p
          className="text-6xl font-black text-white tabular-nums tracking-tight"
          animate={{
            scale: phase === 'resolve' ? [1, 1.15, 1] : 1,
            color: phase === 'resolve' ? '#34d399' : '#ffffff',
          }}
          transition={{ duration: 0.5 }}
        >
          {displayNumber.toLocaleString()}
        </motion.p>

        {/* Status line — single line that updates */}
        <div className="h-8 mt-3 flex items-center justify-center">
          {phase === 'countup' && (
            <motion.p
              key={statusIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm text-gray-400"
            >
              {STATUS_MESSAGES[statusIdx]}
            </motion.p>
          )}
          {phase === 'pause' && (
            <p className="text-sm text-gray-400">
              {totalPatterns.toLocaleString()} possible paths mapped. Filtering...
            </p>
          )}
          {phase === 'countdown' && elimIdx < eliminations.length && (
            <motion.p
              key={elimIdx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm"
              style={{ color: eliminations[elimIdx]?.color ?? '#9ca3af' }}
            >
              {eliminations[elimIdx]?.category}: -{eliminations[elimIdx]?.count.toLocaleString()}
            </motion.p>
          )}
          {phase === 'resolve' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-sm text-emerald-400 font-semibold">
                {validRemaining} valid patterns identified
              </p>
            </motion.div>
          )}
        </div>

        {/* Compact elimination chips — appear after countdown starts */}
        {(phase === 'countdown' || phase === 'resolve') && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mt-4"
          >
            {eliminations.map((e, i) => (
              <motion.span
                key={e.category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: i <= elimIdx || phase === 'resolve' ? 1 : 0.3, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: `${e.color}15`,
                  color: i <= elimIdx || phase === 'resolve' ? e.color : '#4b5563',
                  border: `1px solid ${e.color}25`,
                }}
              >
                {e.category} -{e.count.toLocaleString()}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Section 2: Interactive Pipeline Flow with SVG Connections ──────────

function PipelineFlow({ data }: { data: PatternGenerationResult }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map())
  const [connections, setConnections] = useState<{ x1: number; y1: number; x2: number; y2: number; from: string; to: string; count: number }[]>([])

  const { tasks, dataSources, semanticLayers, responses } = data.pipelineNodes

  // Compute total potential paths per node (proportional to totalPotential)
  const totalPotential = data.totalPotential
  const validTotal = data.validRemaining

  const columns = [
    { title: 'AGENT TASKS', color: '#6366f1', items: tasks },
    { title: 'DATA SOURCES', color: '#f97316', items: dataSources },
    { title: 'SEMANTIC LAYERS', color: '#10b981', items: semanticLayers },
    { title: 'RESPONSES', color: '#ef4444', items: responses },
  ]

  const handleClick = (label: string) => {
    setSelectedNode(selectedNode === label ? null : label)
  }

  // Build connection graph across all 4 columns
  const connectionGraph = useMemo(() => {
    const graph = new Map<string, Set<string>>()
    const addEdge = (a: string, b: string) => {
      if (!graph.has(a)) graph.set(a, new Set())
      if (!graph.has(b)) graph.set(b, new Set())
      graph.get(a)!.add(b)
      graph.get(b)!.add(a)
    }
    // task → data connections from pattern data
    for (const conn of data.pipelineConnections) {
      addEdge(conn.from, conn.to)
    }
    // data → semantic connections
    for (const ds of dataSources) {
      for (const sl of semanticLayers) {
        // Connect if they share patterns
        addEdge(ds.label.split('(')[0].trim(), sl.label)
      }
    }
    // semantic → response connections
    for (const sl of semanticLayers) {
      for (const r of responses) {
        addEdge(sl.label, r.label)
      }
    }
    return graph
  }, [data, dataSources, semanticLayers, responses])

  const isConnected = (label: string) => {
    if (!selectedNode) return true
    const shortLabel = label.split('(')[0].trim()
    const shortSelected = selectedNode.split('(')[0].trim()
    if (shortLabel === shortSelected) return true
    // BFS to find if connected within 3 hops
    const visited = new Set<string>()
    const queue = [shortSelected]
    let depth = 0
    while (queue.length > 0 && depth < 3) {
      const nextQueue: string[] = []
      for (const node of queue) {
        if (visited.has(node)) continue
        visited.add(node)
        if (node === shortLabel) return true
        const neighbors = connectionGraph.get(node)
        if (neighbors) {
          for (const n of neighbors) nextQueue.push(n)
        }
      }
      queue.length = 0
      queue.push(...nextQueue)
      depth++
    }
    return visited.has(shortLabel)
  }

  // Compute SVG connections between columns
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newConns: typeof connections = []

    // Connect adjacent columns
    for (let colIdx = 0; colIdx < columns.length - 1; colIdx++) {
      const leftCol = columns[colIdx]
      const rightCol = columns[colIdx + 1]
      for (const leftItem of leftCol.items) {
        for (const rightItem of rightCol.items) {
          const leftKey = `${colIdx}-${leftItem.label}`
          const rightKey = `${colIdx + 1}-${rightItem.label}`
          const leftEl = nodeRefs.current.get(leftKey)
          const rightEl = nodeRefs.current.get(rightKey)
          if (leftEl && rightEl) {
            const lr = leftEl.getBoundingClientRect()
            const rr = rightEl.getBoundingClientRect()
            newConns.push({
              x1: lr.right - rect.left,
              y1: lr.top + lr.height / 2 - rect.top,
              x2: rr.left - rect.left,
              y2: rr.top + rr.height / 2 - rect.top,
              from: leftItem.label,
              to: rightItem.label,
              count: Math.min(leftItem.count, rightItem.count),
            })
          }
        }
      }
    }
    setConnections(newConns)
  }, [data, selectedNode])

  const setNodeRef = (key: string, el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(key, el)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-gray-200 bg-white p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Pipeline Flow</h3>
          <p className="text-[10px] text-gray-500">Click any node to trace its connections through the pipeline.</p>
        </div>
        {selectedNode && (
          <button
            onClick={() => setSelectedNode(null)}
            className="text-[10px] text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200"
          >
            Clear
          </button>
        )}
      </div>

      <div ref={containerRef} className="relative" style={{ minHeight: '200px' }}>
        {/* SVG connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {connections.map((conn, i) => {
            const fromShort = conn.from.split('(')[0].trim()
            const toShort = conn.to.split('(')[0].trim()
            const isHighlighted = !selectedNode || isConnected(fromShort) && isConnected(toShort)
            const midX = (conn.x1 + conn.x2) / 2
            return (
              <path
                key={i}
                d={`M ${conn.x1} ${conn.y1} C ${midX} ${conn.y1}, ${midX} ${conn.y2}, ${conn.x2} ${conn.y2}`}
                fill="none"
                stroke={isHighlighted ? (selectedNode ? '#6366f1' : '#e5e7eb') : '#f3f4f6'}
                strokeWidth={isHighlighted && selectedNode ? 1.5 : 0.5}
                opacity={isHighlighted ? (selectedNode ? 0.6 : 0.3) : 0.1}
              />
            )
          })}
        </svg>

        {/* 4-column grid */}
        <div className="grid grid-cols-4 gap-8 relative" style={{ zIndex: 1 }}>
          {columns.map((col, colIdx) => (
            <div key={col.title}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: col.color }}>
                {col.title}
              </p>
              <div className="space-y-1">
                {col.items.map((item) => {
                  const connected = isConnected(item.label)
                  const isActive = selectedNode === item.label
                  const shortLabel = item.label.split('(')[0].trim()
                  return (
                    <button
                      key={item.label}
                      ref={(el) => setNodeRef(`${colIdx}-${item.label}`, el)}
                      onClick={() => handleClick(item.label)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-all duration-200"
                      style={{
                        background: isActive ? `${col.color}10` : 'transparent',
                        opacity: connected ? 1 : 0.25,
                        border: isActive ? `1.5px solid ${col.color}` : '1.5px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: connected ? col.color : '#d1d5db' }} />
                        <span className="text-[10px] text-gray-700 truncate">{shortLabel}</span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400 shrink-0 ml-1">
                        {item.count.toLocaleString()}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section 3: Pattern Complexity Breakdown + Tier Tabs ────────────────

function TierTabCards({
  tierCounts,
  activeTab,
  onTabChange,
}: {
  tierCounts: { simple: number; complex: number; fuzzy: number }
  activeTab: PatternTab
  onTabChange: (tab: PatternTab) => void
}) {
  const total = tierCounts.simple + tierCounts.complex + tierCounts.fuzzy
  const tiers: { key: PatternTab; label: string; count: number; color: string; borderColor: string; bgFrom: string; tagline: string }[] = [
    { key: 'simple', label: 'Simple Patterns', count: tierCounts.simple, color: '#16a34a', borderColor: 'border-emerald-200', bgFrom: 'from-emerald-50', tagline: 'Single source, high confidence' },
    { key: 'complex', label: 'Complex Patterns', count: tierCounts.complex, color: '#dc2626', borderColor: 'border-red-200', bgFrom: 'from-red-50', tagline: 'Multi-source cross-referencing' },
    { key: 'fuzzy', label: 'Fuzzy Patterns', count: tierCounts.fuzzy, color: '#d97706', borderColor: 'border-amber-200', bgFrom: 'from-amber-50', tagline: 'Ambiguous, may need human review' },
  ]

  return (
    <div className="space-y-4">
      {/* Pattern Complexity Breakdown bar — ABOVE tier cards */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <p className="text-sm font-bold text-gray-900">Pattern Complexity Breakdown</p>
        <div className="flex h-4 rounded-full overflow-hidden">
          {tiers.map((tier) => (
            <motion.div
              key={tier.key}
              initial={{ width: 0 }}
              animate={{ width: `${(tier.count / total) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ background: tier.color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          {tiers.map((tier) => (
            <div key={tier.key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: tier.color }} />
              <span className="text-xs text-gray-600">
                {tier.label.split(' ')[0]}: <strong>{tier.count}</strong> ({Math.round((tier.count / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3 large tier tab cards — BELOW breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {tiers.map((tier) => {
          const isActive = activeTab === tier.key
          return (
            <button
              key={tier.key}
              onClick={() => onTabChange(tier.key)}
              className={`rounded-xl border-2 ${tier.borderColor} bg-gradient-to-br ${tier.bgFrom} to-white px-4 py-4 text-left transition-all duration-200 cursor-pointer`}
              style={{
                boxShadow: isActive ? `0 0 0 3px ${tier.color}25` : 'none',
                opacity: isActive ? 1 : 0.65,
                transform: isActive ? 'scale(1)' : 'scale(0.98)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                <span className="text-sm font-semibold" style={{ color: tier.color }}>{tier.label}</span>
              </div>
              <p className="text-3xl font-bold font-mono tabular-nums" style={{ color: tier.color }}>
                {tier.count.toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">{tier.tagline}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section 4: Pattern Card List ───────────────────────────────────────

const TIER_META: Record<PatternTab, { color: string; border: string }> = {
  simple: { color: '#16a34a', border: '#bbf7d0' },
  complex: { color: '#dc2626', border: '#fecaca' },
  fuzzy: { color: '#d97706', border: '#fde68a' },
}

function PatternCard({ pattern, delay }: { pattern: GeneratedPattern; delay: number }) {
  const [expanded, setExpanded] = useState(false)
  const meta = TIER_META[pattern.tier]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="rounded-lg border bg-white overflow-hidden"
      style={{ borderColor: expanded ? meta.border : '#e5e7eb' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span
          className="font-mono font-bold px-2.5 py-1 rounded-md text-xs shrink-0 mt-0.5"
          style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}30` }}
        >
          {pattern.id}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-1">{pattern.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{pattern.description}</p>
        </div>
        <div className="flex items-center shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
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
            <div className="px-4 pb-4 pt-1 border-t border-gray-100">
              {/* Dimension chain */}
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Dimension Chain</span>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                    {pattern.taskLabel.length > 30 ? pattern.taskLabel.substring(0, 30) + '...' : pattern.taskLabel}
                  </span>
                  <span className="text-gray-300">&rarr;</span>
                  {pattern.dataLabels.map((d, i) => (
                    <span key={i}>
                      <span className="inline-flex items-center px-2 py-1 rounded bg-orange-50 text-orange-700 border border-orange-100">
                        {d.split('(')[0].trim()}
                      </span>
                      {i < pattern.dataLabels.length - 1 && <span className="text-gray-300 mx-0.5">+</span>}
                    </span>
                  ))}
                  <span className="text-gray-300">&rarr;</span>
                  <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 border border-red-100 font-medium">
                    {pattern.responseLabel}
                  </span>
                </div>
              </div>

              {pattern.inferenceNote && (
                <p className="text-[11px] text-gray-500 mb-3 px-3 py-2 rounded bg-gray-50 border border-gray-100">
                  {pattern.inferenceNote}
                </p>
              )}
              {pattern.ambiguityNote && (
                <p className="text-[11px] text-amber-700 mb-3 px-3 py-2 rounded bg-amber-50 border border-amber-100">
                  {pattern.ambiguityNote}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sample Questions</span>
                </div>
                {pattern.sampleQuestions.slice(0, 2).map((q, i) => (
                  <p key={i} className="text-[11px] text-gray-600 pl-5 leading-relaxed">{q}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export function InteractionDiscoveryV3() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const [animDone, setAnimDone] = useState(false)
  const [activeTab, setActiveTab] = useState<PatternTab>('simple')

  const patternData = useMemo(() => {
    if (!activeTileId || !isV3SupportedTile(activeTileId)) return null
    return generatePatterns(activeTileId)
  }, [activeTileId])

  useEffect(() => {
    if (activeTileId && animatedTileIds.has(activeTileId)) setAnimDone(true)
  }, [activeTileId])

  const handleAnimationComplete = useCallback(() => {
    setAnimDone(true)
    if (activeTileId) animatedTileIds.add(activeTileId)
  }, [activeTileId])

  if (!patternData) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600 text-sm">Pattern discovery data not available for this tile.</p>
      </div>
    )
  }

  const filteredPatterns = patternData.patterns.filter((p) => p.tier === activeTab)

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!animDone && (
          <EliminationHero
            key="elimination-hero"
            totalPatterns={patternData.totalPotential}
            eliminations={patternData.eliminations}
            validRemaining={patternData.validRemaining}
            onComplete={handleAnimationComplete}
          />
        )}
      </AnimatePresence>

      {animDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <PipelineFlow data={patternData} />

          <TierTabCards
            tierCounts={patternData.tierCounts}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
            <p className="text-xs text-gray-500 mb-2">
              {activeTab === 'simple' && 'Single data source, high confidence. Direct lookup patterns.'}
              {activeTab === 'complex' && 'Multi-source cross-referencing. Requires data correlation and alignment.'}
              {activeTab === 'fuzzy' && 'Ambiguous input paths. May need human review or clarification.'}
            </p>
            <div className="space-y-2">
              {filteredPatterns.map((pattern, idx) => (
                <PatternCard key={pattern.id} pattern={pattern} delay={0.03 * Math.min(idx, 10)} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default InteractionDiscoveryV3
