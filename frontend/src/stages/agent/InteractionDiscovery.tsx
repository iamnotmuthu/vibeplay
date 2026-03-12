import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Info,
  MessageSquare,
  Compass,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getPatternDiscoveryData } from '@/lib/agent/patternDiscoveryData'
import type { PatternGroup, DiscoveredPattern, PatternType } from '@/store/agentTypes'
import { PATTERN_CLASSIFICATION_META } from '@/store/agentTypes'
import { AgentTooltip } from '@/components/agent/AgentTooltip'

// ─── Classification Icon ────────────────────────────────────────────────

function ClassificationIcon({
  classification,
  size = 'md',
}: {
  classification: 'dominant' | 'non-dominant' | 'fuzzy'
  size?: 'sm' | 'md'
}) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  const meta = PATTERN_CLASSIFICATION_META[classification]
  switch (classification) {
    case 'dominant':
      return <CheckCircle2 className={cls} style={{ color: meta.color }} aria-hidden="true" />
    case 'non-dominant':
      return <AlertTriangle className={cls} style={{ color: meta.color }} aria-hidden="true" />
    case 'fuzzy':
      return <XCircle className={cls} style={{ color: meta.color }} aria-hidden="true" />
  }
}

// ─── Coverage Bar ───────────────────────────────────────────────────────

function CoverageBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-[10px] font-semibold text-gray-500 tabular-nums w-8 text-right">
        {pct}%
      </span>
    </div>
  )
}

// ─── Pattern Card ───────────────────────────────────────────────────────

function PatternCard({
  pattern,
  classificationColor,
  viewMode,
}: {
  pattern: DiscoveredPattern
  classificationColor: string
  viewMode: 'business' | 'technical'
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-lg overflow-hidden transition-shadow"
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: expanded ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50/50 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: classificationColor } as React.CSSProperties}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{pattern.label}</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{pattern.description}</p>
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
            <div className="px-4 pb-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              {/* Inference / Ambiguity note */}
              {pattern.inferenceNote && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong className="font-semibold">{viewMode === 'technical' ? 'Inference:' : 'What the agent figures out:'}</strong> {pattern.inferenceNote}
                  </p>
                </div>
              )}
              {pattern.ambiguityNote && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <p className="text-xs text-red-800 leading-relaxed">
                    <strong className="font-semibold">{viewMode === 'technical' ? 'Ambiguity:' : 'Where it gets tricky:'}</strong> {pattern.ambiguityNote}
                  </p>
                </div>
              )}

              {/* Example questions */}
              {pattern.exampleQuestions.length > 0 && (
                <div className="mt-3">
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
              {viewMode === 'technical' && pattern.activatedComponents.length > 0 && (
                <div className="mt-3">
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
    </div>
  )
}

// ─── Classification Group Card ──────────────────────────────────────────

function ClassificationGroupCard({
  group,
  tileColor,
  viewMode,
}: {
  group: PatternGroup
  tileColor: string
  viewMode: 'business' | 'technical'
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = PATTERN_CLASSIFICATION_META[group.classification]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: `1px solid ${meta.borderColor}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: expanded ? meta.bgColor : '#ffffff',
          outlineColor: tileColor,
        } as React.CSSProperties}
        aria-expanded={expanded}
        aria-label={`${group.label}: ${group.patterns.length} patterns`}
      >
        <ClassificationIcon classification={group.classification} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-gray-900">{group.label}</span>
            <AgentTooltip
              title={`${group.label} Patterns`}
              content={meta.description}
              trigger="hover"
              position="bottom"
            >
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
            </AgentTooltip>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${meta.color}15`, color: meta.color }}
            >
              {group.patterns.length} patterns
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{group.description}</p>
        </div>

        <span className="shrink-0 text-gray-400">
          {expanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
        </span>
      </button>

      {/* Expanded content: pattern cards */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 space-y-3"
              style={{ borderTop: `1px solid ${meta.borderColor}`, background: meta.bgColor }}
            >
              {/* Classification description */}
              <div className="pt-4 pb-1">
                <p className="text-xs text-gray-600 leading-relaxed">{meta.description}</p>
              </div>

              {/* Individual patterns */}
              {group.patterns.map((pattern, i) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <PatternCard
                    pattern={pattern}
                    classificationColor={meta.color}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Interaction Explainer ──────────────────────────────────────────────

function InteractionExplainer({
  viewMode,
}: {
  viewMode: 'business' | 'technical'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
    >
      <div className="flex items-start gap-3">
        <Compass className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-gray-700 leading-relaxed">
          {viewMode === 'business'
            ? 'Every possible interaction has been sorted into three groups based on how confidently the agent can handle it. Some requests have clear answers, others require the agent to piece things together, and a few need a human to step in. Click any group to explore its patterns.'
            : 'Interaction paths are enumerated via combinatorial expansion of user intents, data source bindings, and tool capabilities. Paths are classified by confidence score into dominant (>0.8), non-dominant (0.5-0.8), and fuzzy (<0.5) tiers. Each pattern maps to activated stack components with coverage metrics and trust lane assignments.'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Distribution Bar ───────────────────────────────────────────────────

function DistributionBar({
  groups,
  total,
}: {
  groups: PatternGroup[]
  total: number
}) {
  const segments = groups.map((g) => ({
    count: g.patterns.length,
    pct: total > 0 ? Math.round((g.patterns.length / total) * 100) : 0,
    color: PATTERN_CLASSIFICATION_META[g.classification].color,
    label: g.label,
  }))

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="h-3 rounded-full overflow-hidden flex" style={{ background: '#f1f5f9' }}>
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${seg.pct}%` }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
            style={{ background: seg.color }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: seg.color }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-gray-600">
              {seg.label}: <strong>{seg.count}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Discovery Log ──────────────────────────────────────────────────────

function DiscoveryLog({
  log,
  tileColor,
}: {
  log: { timestamp: string; action: string; detail: string }[]
  tileColor: string
}) {
  const [showLog, setShowLog] = useState(false)

  if (log.length === 0) return null

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
    >
      <button
        onClick={() => setShowLog(!showLog)}
        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50/50 transition-colors"
        aria-expanded={showLog}
      >
        <Info className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <span className="text-xs font-semibold text-gray-600 flex-1">
          Discovery Log ({log.length} entries)
        </span>
        <span className="shrink-0 text-gray-400">
          {showLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      <AnimatePresence>
        {showLog && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2" style={{ borderTop: '1px solid #f1f5f9' }}>
              {log.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.15 }}
                  className="flex items-start gap-3 pt-2"
                >
                  <span
                    className="text-[10px] font-mono text-gray-400 whitespace-nowrap mt-0.5 shrink-0"
                    style={{ minWidth: '48px' }}
                  >
                    {entry.timestamp}
                  </span>
                  <div className="min-w-0">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider mr-2"
                      style={{ color: tileColor }}
                    >
                      {entry.action}
                    </span>
                    <span className="text-xs text-gray-600">{entry.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export function InteractionDiscovery() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const data = activeTileId ? getPatternDiscoveryData(activeTileId) : null

  // Scroll to top on tile change
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
  }, [activeTileId])

  if (!tile || !data) return null

  const tileColor = tile.color
  const totalPatterns = data.groups.reduce((sum, g) => sum + g.patterns.length, 0)

  return (
    <div ref={containerRef} className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
      {/* Stage header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Interaction Discovery
        </h2>
        <p className="text-sm text-gray-500">
          {tile.stageSubtitles['interaction-discovery'] ?? `${totalPatterns} interaction paths discovered`}
        </p>
      </motion.div>

      {/* Explainer */}
      <div className="mb-6">
        <InteractionExplainer viewMode={viewMode} />
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-6 p-5 rounded-xl"
        style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${tileColor}12` }}
          >
            <span className="text-lg font-bold" style={{ color: tileColor }}>
              {totalPatterns}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              Total Discovered Patterns
            </p>
            <p className="text-[11px] text-gray-500">
              Across {data.groups.length} groups
            </p>
          </div>
        </div>

        <DistributionBar groups={data.groups} total={totalPatterns} />
      </motion.div>

      {/* How Your Agent Handles Requests */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-6 rounded-xl p-5"
        style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
      >
        <h3 className="text-sm font-bold mb-4 text-gray-900">How Your Agent Handles Requests</h3>
        <div className="space-y-3">
          {([
            { type: 'simple' as PatternType, label: 'Answers instantly', desc: 'Single lookup, no extra steps', color: '#10b981', icon: '⚡' },
            { type: 'hopping' as PatternType, label: 'Checks multiple sources', desc: 'Cross-references before responding', color: '#f59e0b', icon: '🔗' },
            { type: 'aggregator' as PatternType, label: 'Combines information', desc: 'Pulls from several data points', color: '#8b5cf6', icon: '📊' },
            { type: 'branch' as PatternType, label: 'Makes a decision', desc: 'Chooses a path based on conditions', color: '#06b6d4', icon: '🔀' },
            { type: 'reasoning' as PatternType, label: 'Multi-step reasoning', desc: 'Works through logic before answering', color: '#6366f1', icon: '🧠' },
          ]).map(({ type, label, desc, color, icon }) => {
            const count = data.groups.reduce(
              (sum, g) => sum + g.patterns.filter((p) => p.patternType === type).length,
              0
            )
            if (count === 0) return null
            const pct = totalPatterns > 0 ? Math.round((count / totalPatterns) * 100) : 0
            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs" aria-hidden="true">{icon}</span>
                    <span className="text-xs text-gray-700 font-medium">{label}</span>
                    <span className="text-[10px] text-gray-400">{desc}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 tabular-nums whitespace-nowrap ml-3">
                    {count} ({pct}%)
                  </span>
                </div>
                <motion.div
                  className="h-2 rounded-full"
                  style={{ background: '#f0f4f8' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </motion.div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Classification groups */}
      <div className="space-y-4 mb-6">
        {data.groups.map((group, i) => (
          <motion.div
            key={group.classification}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
          >
            <ClassificationGroupCard
              group={group}
              tileColor={tileColor}
              viewMode={viewMode}
            />
          </motion.div>
        ))}
      </div>

      {/* Discovery log (technical mode) */}
      {viewMode === 'technical' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <DiscoveryLog log={data.discoveryLog} tileColor={tileColor} />
        </motion.div>
      )}
    </div>
  )
}
