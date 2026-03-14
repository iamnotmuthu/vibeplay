import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Info,
  Download,
  Check,
  Cpu,
  Database,
  GitBranch,
  Box,
  Zap,
  Search,
  Cog,
  MessageSquare,
  Shield,
  Send,
  Brain,
  Play,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Tag,
  Workflow,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getArchitectureData } from '@/lib/agent/architectureData'
import { getTechStack, getEvalMetrics } from '@/lib/agent/componentTechData'
import { generateAgentDeploymentPDF } from '@/lib/agent/generateAgentDeploymentPDF'
import {
  getMetaPatterns,
  getMemoryConfig,
  getOrchestrationPatterns,
  getArchFlowData,
} from '@/lib/agent/compositionData'
import type { MetaPattern } from '@/lib/agent/compositionData'
import type { TechComponent, CategoryTechMapping, EvalMetric, PatternBreakdown } from '@/lib/agent/componentTechData'

// ─── Category visual config ─────────────────────────────────────────────

interface CategoryVisual {
  icon: React.ReactNode
  color: string
  bg: string
  border: string
}

const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  'input-api':              { icon: <Send className="w-4 h-4" aria-hidden="true" />,           color: '#78350f', bg: '#fef3c7', border: '#fde68a' },
  'session-context':        { icon: <Database className="w-4 h-4" aria-hidden="true" />,       color: '#4338ca', bg: '#e0e7ff', border: '#a5b4fc' },
  'orchestrator':           { icon: <GitBranch className="w-4 h-4" aria-hidden="true" />,      color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' },
  'planning-llm':           { icon: <Brain className="w-4 h-4" aria-hidden="true" />,          color: '#7e22ce', bg: '#f3e8ff', border: '#d8b4fe' },
  'task-decomposition':     { icon: <Cpu className="w-4 h-4" aria-hidden="true" />,            color: '#9d174d', bg: '#fce7f3', border: '#f9a8d4' },
  'tool-data-access':       { icon: <Box className="w-4 h-4" aria-hidden="true" />,            color: '#9a3412', bg: '#ffedd5', border: '#fed7aa' },
  'retrieval-rag':          { icon: <Search className="w-4 h-4" aria-hidden="true" />,         color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' },
  'tool-execution':         { icon: <Zap className="w-4 h-4" aria-hidden="true" />,            color: '#991b1b', bg: '#fee2e2', border: '#fecaca' },
  'response-gen':           { icon: <MessageSquare className="w-4 h-4" aria-hidden="true" />,  color: '#3f6212', bg: '#ecfccb', border: '#bef264' },
  'response-generation':    { icon: <MessageSquare className="w-4 h-4" aria-hidden="true" />,  color: '#3f6212', bg: '#ecfccb', border: '#bef264' },
  'personalization-policy': { icon: <Shield className="w-4 h-4" aria-hidden="true" />,         color: '#854d0e', bg: '#fef9c3', border: '#fde047' },
  'output-delivery':        { icon: <Cog className="w-4 h-4" aria-hidden="true" />,            color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
}

// ─── Trust boundary colors ──────────────────────────────────────────────

const TRUST_COLORS: Record<string, { bg: string; border: string; accent: string; text: string }> = {
  autonomous: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#10b981', text: '#166534' },
  supervised: { bg: '#fffbeb', border: '#fde68a', accent: '#f59e0b', text: '#78350f' },
  escalation: { bg: '#fef2f2', border: '#fecaca', accent: '#ef4444', text: '#991b1b' },
  blocked: { bg: '#eff6ff', border: '#bfdbfe', accent: '#3b82f6', text: '#1d4ed8' },
}

// ─── Tech Chip ──────────────────────────────────────────────────────────

function TechChip({ tech, catColor }: { tech: TechComponent; catColor: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: `${catColor}12`, color: catColor }}
    >
      {tech.name}
      {tech.role && (
        <span
          className="text-[9px] font-normal opacity-70"
        >
          ({tech.role})
        </span>
      )}
    </span>
  )
}

// ─── Category Card ──────────────────────────────────────────────────────

function CategoryCard({
  category,
  delay,
  viewMode,
  tileId,
}: {
  category: CategoryTechMapping
  delay: number
  viewMode: 'business' | 'technical'
  tileId?: string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const vis = CATEGORY_VISUALS[category.categoryId] ?? CATEGORY_VISUALS['output-delivery']

  // Get arch data for this category if tileId provided
  const archFlowData = tileId ? getArchFlowData(tileId) : null
  const metaPatterns = tileId ? getMetaPatterns(tileId) : []
  const mpLookup = new Map<string, MetaPattern>()
  if (metaPatterns.length > 0) {
    for (const mp of metaPatterns) {
      mpLookup.set(mp.id, mp)
    }
  }

  const archNode = archFlowData?.nodes.find(n => n.categoryId === category.categoryId)
  const driverPatterns = archNode
    ? archNode.metaPatternIds.map(pid => mpLookup.get(pid)).filter(Boolean) as MetaPattern[]
    : []

  // Get memory config for this category
  const memConfigs = tileId ? getMemoryConfig(tileId) : []
  const memoryTypes = memConfigs.filter(m => m.usedBy.some(c => c === category.categoryLabel || c === category.categoryId))

  // Get orchestration patterns for this category
  const orchPatterns = tileId ? getOrchestrationPatterns(tileId) : []
  const relatedOrchPatterns = orchPatterns.filter(p => p.components.some(c => c === category.categoryId || c === category.categoryLabel))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: vis.border }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left cursor-pointer hover:bg-gray-50/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-expanded={expanded}
        aria-label={`${category.categoryLabel}: ${category.technologies.map(t => t.name).join(', ')}`}
      >
        {/* Category icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: vis.bg, color: vis.color }}
        >
          {vis.icon}
        </div>

        {/* Label + tech chips */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {category.categoryLabel}
            </span>
            {category.note && viewMode === 'technical' && (
              <span className="text-[9px] text-gray-400 font-normal">
                — {category.note}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {category.technologies.map((t) => (
              <TechChip key={t.name} tech={t} catColor={vis.color} />
            ))}
          </div>
        </div>

        {/* Expand chevron */}
        <div className="shrink-0 text-gray-300">
          {expanded ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Expanded: show note, role details, meta patterns, memory, and orchestration */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3.5 pt-0 space-y-3">
              {category.note && (
                <div
                  className="rounded-lg px-3 py-2 text-xs text-gray-600 leading-relaxed"
                  style={{ background: `${vis.color}06`, borderLeft: `2px solid ${vis.color}40` }}
                >
                  {category.note}
                </div>
              )}
              <div className="space-y-1">
                {category.technologies.filter(t => t.role).map((t) => (
                  <div key={t.name} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">{t.name}</span>
                    <span className="text-gray-400">—</span>
                    <span>{t.role}</span>
                  </div>
                ))}
              </div>

              {/* Meta Pattern Drivers */}
              {driverPatterns.length > 0 && (
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Selected because of
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {driverPatterns.map((dp) => (
                      <span
                        key={dp.id}
                        className="text-[9px] font-medium px-2 py-0.5 rounded-md"
                        style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' }}
                      >
                        {dp.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory Types */}
              {memoryTypes.length > 0 && (
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Memory types used
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {memoryTypes.map((mem) => {
                      const mc = MEMORY_COLORS[mem.type] ?? MEMORY_COLORS['short-term']
                      return (
                        <span
                          key={mem.type}
                          className="text-[9px] font-medium px-2 py-0.5 rounded-md"
                          style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}
                        >
                          {mem.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Orchestration Patterns */}
              {relatedOrchPatterns.length > 0 && (
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Orchestration patterns
                  </p>
                  <div className="space-y-1.5">
                    {relatedOrchPatterns.map((pat) => (
                      <div key={pat.id} className="text-xs text-gray-600">
                        <div className="font-semibold text-gray-700">{pat.problem}</div>
                        <div className="text-[10px] text-gray-500">→ {pat.solution}</div>
                      </div>
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

// ─── Trust Lane Summary ─────────────────────────────────────────────────

function TrustLaneSummary({
  lanes,
  delay,
}: {
  lanes: { label: string; trustBoundary: string; interactionFlowCount: number; componentCount: number }[]
  delay: number
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left cursor-pointer hover:bg-gray-50/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-expanded={expanded}
      >
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Trust Boundary Lanes
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {lanes.map((ln) => {
              const tc = TRUST_COLORS[ln.trustBoundary] ?? TRUST_COLORS.autonomous
              return (
                <span
                  key={ln.label}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}
                >
                  {ln.label}
                  <span className="ml-1 opacity-70 font-normal">
                    ({ln.interactionFlowCount} flows)
                  </span>
                </span>
              )
            })}
          </div>
        </div>
        <div className="shrink-0 text-gray-300">
          {expanded ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
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
            <div className="px-4 pb-4 space-y-3">
              {lanes.map((ln) => {
                const tc = TRUST_COLORS[ln.trustBoundary] ?? TRUST_COLORS.autonomous
                return (
                  <div
                    key={ln.label}
                    className="rounded-lg px-3 py-2.5"
                    style={{ background: tc.bg, border: `1px solid ${tc.border}` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: tc.text }}>
                        {ln.label}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                        style={{ background: `${tc.accent}20`, color: tc.text }}
                      >
                        {ln.trustBoundary}
                      </span>
                    </div>
                    <div className="flex gap-4 text-[10px]" style={{ color: tc.text }}>
                      <span>{ln.interactionFlowCount} interaction flows</span>
                      <span>{ln.componentCount} components</span>
                    </div>
                  </div>
                )
              })}
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Trust lanes determine how much human oversight each interaction path requires.
                Autonomous lanes run without human review. Supervised lanes flag for human approval.
                Escalation lanes route directly to a human.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Build Phase Constants ───────────────────────────────────────────────

type BuildPhase = 'idle' | 'analyzing' | 'assembling' | 'evaluating' | 'complete'

const PHASE_LABELS: Record<BuildPhase, string> = {
  idle: '',
  analyzing: 'Analyzing meta patterns\u2026',
  assembling: 'Composing architecture from patterns\u2026',
  evaluating: 'Running validation data against architecture\u2026',
  complete: 'Architecture composed and validated',
}

// Ordered category IDs for the assembly animation strip
const ASSEMBLY_ORDER = [
  'input-api',
  'session-context',
  'orchestrator',
  'planning-llm',
  'task-decomposition',
  'tool-data-access',
  'retrieval-rag',
  'tool-execution',
  'response-gen',
  'personalization-policy',
  'output-delivery',
] as const

// ─── Pattern breakdown bar colors (matches Predictive Playground) ────────

const PATTERN_BARS: {
  key: keyof PatternBreakdown
  label: string
  color: string
  bgClass: string
  textClass: string
}[] = [
  { key: 'overall', label: 'Overall Performance', color: '#3b82f6', bgClass: 'bg-blue-500', textClass: 'text-blue-600' },
  { key: 'dominant', label: 'Simple Patterns', color: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-600' },
  { key: 'nonDominant', label: 'Complex Patterns', color: '#ef4444', bgClass: 'bg-red-500', textClass: 'text-red-600' },
  { key: 'fuzzy', label: 'Fuzzy Patterns', color: '#f59e0b', bgClass: 'bg-amber-500', textClass: 'text-amber-600' },
]

// ─── Metric color system (maximally distinct) ───────────────────────────

const METRIC_COLORS: Record<string, { color: string; bg: string; light: string }> = {
  primary:    { color: '#059669', bg: '#ecfdf5', light: '#d1fae5' }, // emerald
  secondary:  { color: '#2563eb', bg: '#eff6ff', light: '#dbeafe' }, // blue
  tertiary:   { color: '#d97706', bg: '#fffbeb', light: '#fef3c7' }, // amber
  quaternary: { color: '#9333ea', bg: '#faf5ff', light: '#f3e8ff' }, // purple
}

// ─── Evaluation Metric Card (with baseline → actual → target bar) ────────

function EvalMetricCard({
  metric,
  metricLabel,
  metricColorKey,
  delay,
}: {
  metric: EvalMetric
  metricLabel: string
  metricColorKey: string
  delay: number
}) {
  const mColor = METRIC_COLORS[metricColorKey] || METRIC_COLORS.primary

  // Calculate bar positions relative to target
  const parseNum = (v: string) => parseFloat(v.replace(/[^0-9.\-]/g, '')) || 0
  const actualNum = parseNum(metric.actual)
  const targetNum = parseNum(metric.target)
  const rangeMax = Math.max(actualNum, targetNum) * 1.15 || 1
  const actualPct = Math.min(100, (actualNum / rangeMax) * 100)
  const targetPct = Math.min(100, (targetNum / rangeMax) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="rounded-xl border bg-white p-4"
      style={{
        borderColor: `${mColor.color}25`,
        borderLeftWidth: '3px',
        borderLeftColor: mColor.color,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
            {metric.shortName}
            <div className="group relative">
              <Info className="w-3 h-3 text-gray-300 cursor-help" aria-hidden="true" />
              <div className="absolute left-0 top-5 w-56 p-2.5 rounded-lg bg-gray-900 text-white text-xs leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none shadow-lg font-normal">
                {metric.description}
              </div>
            </div>
          </h4>
          {metric.passed ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" aria-hidden="true" /> PASS
            </span>
          ) : (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">FAIL</span>
          )}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: mColor.color }}>
          {metricLabel}
        </p>
      </div>

      {/* Target value */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Target</span>
        <span className="text-sm font-bold text-gray-900 tabular-nums">
          {metric.target} {metric.unit}
        </span>
      </div>

      {/* Progress bar: actual vs target */}
      <div className="relative h-6 mb-1">
        {/* Track */}
        <div className="absolute top-2.5 left-0 right-0 h-2 rounded-full bg-gray-100" />

        {/* Actual bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${actualPct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.15, ease: 'easeOut' }}
          className="absolute top-2.5 left-0 h-2 rounded-full"
          style={{ background: mColor.color }}
        />

        {/* Target marker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="absolute top-1 w-0.5 h-4 rounded-full"
          style={{ left: `${targetPct}%`, background: '#1f2937' }}
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
          className="absolute text-[8px] font-bold text-gray-500 uppercase"
          style={{ left: `${targetPct}%`, top: '-2px', transform: 'translateX(-50%)' }}
        >
          Target
        </motion.span>
      </div>

      {/* Actual value */}
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: mColor.color }} />
        <span className="text-[9px] text-gray-600 font-medium">Actual: {metric.actual}{metric.unit ? ` ${metric.unit}` : ''}</span>
      </div>

      {/* Pattern breakdown bars */}
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
        {PATTERN_BARS.map((bar, i) => {
          const value = metric.breakdown[bar.key]
          return (
            <div key={bar.key} className="flex items-center gap-2.5">
              <span className="text-[10px] text-gray-500 w-[110px] shrink-0 truncate">
                {bar.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: delay + 0.3 + i * 0.06 }}
                  className={`h-full rounded-full ${bar.bgClass}`}
                />
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.5 + i * 0.06 }}
                className={`text-[10px] font-bold tabular-nums w-6 text-right ${bar.textClass}`}
              >
                {value}
              </motion.span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Build Animation Strip ──────────────────────────────────────────────

function AssemblyStrip({
  phase,
  visibleCount,
}: {
  phase: BuildPhase
  visibleCount: number
  scanProgress: number // 0-1 (kept for API compat)
}) {
  return (
    <div className="relative py-6">
      {/* Pipeline strip */}
      <div className="flex items-center justify-center gap-0 relative">
        {ASSEMBLY_ORDER.map((catId, i) => {
          const vis = CATEGORY_VISUALS[catId]
          const isVisible = i < visibleCount
          const isEval = phase === 'evaluating'

          return (
            <div key={catId} className="flex items-center">
              {/* Icon tile */}
              <motion.div
                initial={{ opacity: 0, y: -22, scale: 0.5, rotate: -8 }}
                animate={
                  isVisible
                    ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
                    : { opacity: 0, y: -22, scale: 0.5, rotate: -8 }
                }
                transition={
                  isVisible
                    ? { type: 'spring', stiffness: 420, damping: 20 }
                    : { duration: 0.1 }
                }
                className="relative"
              >
                {/* Icon box */}
                <motion.div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2"
                  style={{
                    background: vis.bg,
                    borderColor: isEval && isVisible ? vis.color : vis.border,
                    color: vis.color,
                  }}
                  animate={
                    isEval && isVisible
                      ? {
                          boxShadow: [
                            `0 0 0px ${vis.color}00`,
                            `0 0 18px ${vis.color}70`,
                            `0 0 0px ${vis.color}00`,
                          ],
                        }
                      : { boxShadow: `0 2px 8px ${vis.color}20` }
                  }
                  transition={
                    isEval && isVisible
                      ? {
                          delay: i * 0.13,
                          duration: 0.75,
                          repeat: Infinity,
                          repeatDelay: 0.9,
                          ease: 'easeInOut',
                        }
                      : { duration: 0.2 }
                  }
                >
                  {vis.icon}
                </motion.div>

                {/* Snap-in ring */}
                <AnimatePresence>
                  {isVisible && i === visibleCount - 1 && phase === 'assembling' && (
                    <motion.div
                      key="snap"
                      initial={{ opacity: 0.8, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.9 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ border: `2px solid ${vis.color}` }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Connector to next icon */}
              {i < ASSEMBLY_ORDER.length - 1 && (
                <div className="relative flex items-center w-3 sm:w-4 shrink-0">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                      originX: 0,
                      height: '2px',
                      width: '100%',
                      background: isEval && isVisible
                        ? `linear-gradient(90deg, ${vis.color}80, ${CATEGORY_VISUALS[ASSEMBLY_ORDER[i + 1]].color}80)`
                        : '#e5e7eb',
                      borderRadius: '9999px',
                    }}
                  />
                  {/* Flowing data dot on connector during eval */}
                  {isEval && isVisible && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
                      style={{ background: vis.color, boxShadow: `0 0 4px ${vis.color}` }}
                      animate={{ left: ['-4px', 'calc(100% + 4px)'], opacity: [0, 1, 0] }}
                      transition={{
                        delay: i * 0.13 + 0.3,
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 1.4,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Memory Colors ──────────────────────────────────────────────────

const MEMORY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'short-term': { color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  'long-term': { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  episodic: { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
}

// ─── Architecture Layer Config ──────────────────────────────────────

interface ArchitectureLayer {
  id: string
  label: string
  color: string
  accent: string
  bg: string
  border: string
  categories: string[]
}

const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  { id: 'input', label: 'INPUT LAYER', color: '#0ea5e9', accent: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', categories: ['input-api', 'session-context'] },
  { id: 'brain', label: 'BRAIN LAYER', color: '#4338ca', accent: '#312e81', bg: '#eef2ff', border: '#c7d2fe', categories: ['orchestrator', 'planning-llm', 'task-decomposition'] },
  { id: 'execution', label: 'EXECUTION LAYER', color: '#059669', accent: '#065f46', bg: '#ecfdf5', border: '#a7f3d0', categories: ['tool-data-access', 'retrieval-rag', 'tool-execution'] },
  { id: 'output', label: 'OUTPUT LAYER', color: '#ea580c', accent: '#92400e', bg: '#fff7ed', border: '#fed7aa', categories: ['response-generation', 'personalization-policy', 'output-delivery'] },
]

// Category ID mapping: compositionData categoryId → componentTechData categoryId
const CATEGORY_ID_MAPPING: Record<string, string> = {
  'input-api': 'input-api',
  'session-context': 'session',
  'orchestrator': 'orchestrator',
  'planning-llm': 'planning',
  'task-decomposition': 'taskDecomp',
  'tool-data-access': 'toolAccess',
  'retrieval-rag': 'retrieval',
  'tool-execution': 'toolExec',
  'response-generation': 'responseGen',
  'personalization-policy': 'personalization',
  'output-delivery': 'output',
}

// ─── Composition DNA Section (Split-Panel Interactive) ──────────────

interface ConnectionInfo {
  patternId: string
  patternLabel: string
  categoryId: string
  reason: string
}

// Cross-fade cubic-bezier from vibemodel.ai
const SLIDE_TRANSITION = { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
const AUTOPLAY_INTERVAL = 5000 // 5 seconds

function ReverseComponentView({
  categoryId,
  flowData,
  componentToPatterns,
  getLayerForCategory,
  getTechRole,
  onClose,
}: {
  categoryId: string
  flowData: ReturnType<typeof getArchFlowData>
  componentToPatterns: Map<string, ConnectionInfo[]>
  getLayerForCategory: (catId: string) => typeof ARCHITECTURE_LAYERS[number] | undefined
  getTechRole: (catId: string) => string | null
  onClose: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Focus on mount so keyboard users can interact
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  if (!flowData) return null
  const node = flowData.nodes.find(n => n.categoryId === categoryId)
  const vis = CATEGORY_VISUALS[categoryId] ?? CATEGORY_VISUALS['output-delivery']
  const allReasons = componentToPatterns.get(categoryId) || []
  const layer = getLayerForCategory(categoryId)
  const techRole = getTechRole(categoryId)

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={SLIDE_TRANSITION}
      className="absolute inset-0 p-5 bg-white z-20 overflow-y-auto outline-none"
      style={{ willChange: 'opacity, transform' }}
      tabIndex={-1}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: vis.bg, color: vis.color }}>
            {vis.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: vis.color }}>
                {node?.categoryLabel}
              </span>
              {layer && (
                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: `${layer.accent}10`, color: layer.accent }}>
                  {layer.label.replace(' LAYER', '')}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {node?.selectedComponent}
            </h3>
            {techRole && (
              <p className="text-xs text-gray-500">({techRole})</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
          Why this component was selected ({allReasons.length} patterns)
        </p>
        {allReasons.map((cr, ri) => (
          <motion.div
            key={cr.patternId}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: ri * 0.06, duration: 0.2 }}
            className="rounded-lg border border-indigo-100 p-3"
            style={{ background: 'linear-gradient(90deg, rgba(67,56,202,0.03) 0%, transparent 100%)' }}
          >
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#eef2ff' }}>
                <Tag className="w-3 h-3 text-indigo-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-indigo-800">
                  {cr.patternLabel}
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                  {cr.reason}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function CompositionDNASection({ tileId }: { tileId: string }) {
  const flowData = getArchFlowData(tileId)
  const techStack = getTechStack(tileId)
  const patterns = getMetaPatterns(tileId)

  const [activePatternIdx, setActivePatternIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(true)
  const [hoveredComponentCatId, setHoveredComponentCatId] = useState<string | null>(null)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const patternCountRef = useRef(0)
  const patternItemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const leftColumnRef = useRef<HTMLDivElement>(null)

  if (!flowData || !techStack || patterns.length === 0) return null

  // ── Data: Only patterns that have component connections for this tile ──
  const { connectedPatterns, patternToComponents, componentToPatterns } = useMemo(() => {
    const p2c = new Map<string, ConnectionInfo[]>()
    const c2p = new Map<string, ConnectionInfo[]>()
    const nodeCatIds = new Set(flowData.nodes.map(n => n.categoryId))

    for (const pattern of patterns) {
      const connections: ConnectionInfo[] = []
      for (const [catId, reason] of Object.entries(pattern.componentStrengths)) {
        if (nodeCatIds.has(catId) && reason) {
          const conn: ConnectionInfo = {
            patternId: pattern.id,
            patternLabel: pattern.label,
            categoryId: catId,
            reason,
          }
          connections.push(conn)
          const existing = c2p.get(catId) || []
          if (!existing.some(e => e.patternId === conn.patternId)) {
            existing.push(conn)
            c2p.set(catId, existing)
          }
        }
      }
      if (connections.length > 0) {
        p2c.set(pattern.id, connections)
      }
    }

    const connected = patterns.filter(p => p2c.has(p.id))
    return { connectedPatterns: connected, patternToComponents: p2c, componentToPatterns: c2p }
  }, [patterns, flowData])

  // ── Tech role lookup ──
  const techByCategory = useMemo(() => {
    const lookup = new Map<string, CategoryTechMapping>()
    for (const cat of techStack.categories) lookup.set(cat.categoryId, cat)
    return lookup
  }, [techStack])

  const getTechRole = useCallback((categoryId: string): string | null => {
    const mappedId = CATEGORY_ID_MAPPING[categoryId] || categoryId
    const techCat = techByCategory.get(mappedId)
    return techCat?.technologies[0]?.role || null
  }, [techByCategory])

  // ── Active pattern (clamped) ──
  const safeIdx = Math.min(activePatternIdx, connectedPatterns.length - 1)
  const activePattern = connectedPatterns[safeIdx] || connectedPatterns[0]
  const activeConnections = activePattern ? (patternToComponents.get(activePattern.id) || []) : []

  // ── Which pattern IDs are highlighted when hovering a component ──
  const reverseHighlightPatternIds = useMemo(() => {
    if (!hoveredComponentCatId) return null
    const conns = componentToPatterns.get(hoveredComponentCatId) || []
    return new Set(conns.map(c => c.patternId))
  }, [hoveredComponentCatId, componentToPatterns])

  // Keep ref in sync so interval callback never stales
  patternCountRef.current = connectedPatterns.length

  // ── Autoplay timer ──
  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    autoplayRef.current = setInterval(() => {
      setActivePatternIdx(prev => (prev + 1) % (patternCountRef.current || 1))
    }, AUTOPLAY_INTERVAL)
  }, [])

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
      autoplayRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isPaused && connectedPatterns.length > 1) {
      startAutoplay()
    } else {
      stopAutoplay()
    }
    return () => stopAutoplay()
  }, [isPaused, connectedPatterns.length, startAutoplay, stopAutoplay])

  // Reset on tile change
  useEffect(() => {
    setActivePatternIdx(0)
    setIsPaused(false)
    setHoveredComponentCatId(null)
  }, [tileId])

  // Scroll active pattern into view WITHIN the left column only (never page-level scroll)
  useEffect(() => {
    const el = patternItemRefs.current.get(safeIdx)
    const container = leftColumnRef.current
    if (!el || !container) return
    const elTop = el.offsetTop
    const elBottom = elTop + el.offsetHeight
    const containerTop = container.scrollTop
    const containerBottom = containerTop + container.clientHeight
    if (elTop < containerTop) {
      container.scrollTo({ top: elTop - 8, behavior: 'smooth' })
    } else if (elBottom > containerBottom) {
      container.scrollTo({ top: elBottom - container.clientHeight + 8, behavior: 'smooth' })
    }
  }, [safeIdx])

  // ── Handlers ──
  const handlePatternEnter = useCallback((idx: number) => {
    setIsPaused(true)
    stopAutoplay()
    setActivePatternIdx(idx)
    setHoveredComponentCatId(null)
  }, [stopAutoplay])

  const handlePatternLeave = useCallback(() => {
    // intentionally no-op: autoplay stays off
  }, [])

  const handleComponentEnter = useCallback((catId: string) => {
    setIsPaused(true)
    stopAutoplay()
    setHoveredComponentCatId(catId)
  }, [stopAutoplay])

  const handleComponentLeave = useCallback(() => {
    setHoveredComponentCatId(null)
    // intentionally no-op: autoplay stays off
  }, [])

  // ── Find which layer a category belongs to ──
  const getLayerForCategory = useCallback((catId: string) => {
    return ARCHITECTURE_LAYERS.find(l => l.categories.includes(catId))
  }, [])

  if (connectedPatterns.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="space-y-3"
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Workflow className="w-4 h-4 text-indigo-500" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Composition DNA
        </span>
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] text-gray-400 italic">
          hover patterns to explore
        </span>
      </div>

      {/* Screen reader */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {activePattern ? `Active pattern: ${activePattern.label}. Influences ${activeConnections.length} components.` : ''}
      </div>

      {/* ═══ Split Panel ═══ */}
      <div
        className="rounded-xl border border-gray-200 bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] min-h-[480px]">

          {/* ─── LEFT COLUMN: Pattern Nav ─── */}
          <div className="flex flex-col border-r border-gray-100">
            {/* Sticky header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-white shrink-0">
              <Tag className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                Detected Patterns ({connectedPatterns.length})
              </span>
            </div>

            {/* Pattern list — scrollable within column only */}
            <div ref={leftColumnRef} className="flex flex-col gap-1 p-4 overflow-y-auto max-h-[480px]">
            {connectedPatterns.map((mp, idx) => {
              const isActive = safeIdx === idx && !hoveredComponentCatId
              const isReverseHighlighted = reverseHighlightPatternIds?.has(mp.id) ?? false
              const isDimmed = hoveredComponentCatId !== null && !isReverseHighlighted

              return (
                <motion.div
                  key={mp.id}
                  ref={(el: HTMLDivElement | null) => { if (el) patternItemRefs.current.set(idx, el); else patternItemRefs.current.delete(idx) }}
                  onMouseEnter={() => handlePatternEnter(idx)}
                  onMouseLeave={handlePatternLeave}
                  onFocus={() => handlePatternEnter(idx)}
                  onBlur={handlePatternLeave}
                  animate={{
                    opacity: isDimmed ? 0.3 : isActive || isReverseHighlighted ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-lg cursor-pointer transition-colors"
                  style={{
                    borderLeft: `3px solid ${isActive || isReverseHighlighted ? '#4338ca' : 'transparent'}`,
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(67,56,202,0.06) 0%, transparent 100%)'
                      : isReverseHighlighted
                        ? 'linear-gradient(90deg, rgba(67,56,202,0.03) 0%, transparent 100%)'
                        : 'transparent',
                    boxShadow: isActive ? '0 4px 16px -4px rgba(0,0,0,0.1)' : 'none',
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Pattern: ${mp.label}`}
                  aria-pressed={isActive}
                >
                  <div className="px-4 py-3">
                    <h4 className="text-[13px] font-bold text-gray-900 leading-snug">
                      {mp.label}
                    </h4>
                    {/* Show description only when active */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-[11px] text-gray-500 leading-relaxed mt-1 overflow-hidden"
                        >
                          {mp.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Component Slides (cross-fade stack) ─── */}
          <div className="relative p-5 overflow-hidden" style={{ perspective: '1000px' }}>
            {/* All slides stacked absolutely — only active one visible */}
            {connectedPatterns.map((mp, idx) => {
              const isSlideActive = safeIdx === idx && !hoveredComponentCatId
              const slideConnections = patternToComponents.get(mp.id) || []

              return (
                <motion.div
                  key={mp.id}
                  animate={{
                    opacity: isSlideActive ? 1 : 0,
                    y: isSlideActive ? 0 : 40,
                    scale: isSlideActive ? 1 : 0.95,
                  }}
                  transition={SLIDE_TRANSITION}
                  className="w-full"
                  style={{
                    position: idx === safeIdx ? 'relative' : 'absolute',
                    top: idx === safeIdx ? undefined : 0,
                    left: idx === safeIdx ? undefined : 0,
                    right: idx === safeIdx ? undefined : 0,
                    pointerEvents: isSlideActive ? 'auto' : 'none',
                    zIndex: isSlideActive ? 10 : 1,
                    willChange: 'opacity, transform',
                  }}
                >
                  {/* Slide header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
                        Pattern Impact
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {mp.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {mp.description}
                    </p>
                  </div>

                  {/* Affected components */}
                  <div className="space-y-2">
                    {slideConnections.map((conn) => {
                      const node = flowData.nodes.find(n => n.categoryId === conn.categoryId)
                      const vis = CATEGORY_VISUALS[conn.categoryId] ?? CATEGORY_VISUALS['output-delivery']
                      const layer = getLayerForCategory(conn.categoryId)
                      const techRole = getTechRole(conn.categoryId)
                      const isComponentHovered = hoveredComponentCatId === conn.categoryId

                      return (
                        <motion.div
                          key={conn.categoryId}
                          onMouseEnter={() => handleComponentEnter(conn.categoryId)}
                          onMouseLeave={handleComponentLeave}
                          animate={{
                            boxShadow: isComponentHovered
                              ? `0 0 24px ${vis.color}30`
                              : '0 1px 3px rgba(0,0,0,0.05)',
                          }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl border overflow-hidden cursor-pointer"
                          style={{
                            borderColor: isComponentHovered ? vis.color : '#e5e7eb',
                            borderWidth: isComponentHovered ? '2px' : '1px',
                            background: '#ffffff',
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`${node?.categoryLabel}: ${node?.selectedComponent}`}
                        >
                          <div className="flex items-start gap-3 p-3">
                            {/* Icon */}
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: vis.bg, color: vis.color }}
                            >
                              {vis.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: vis.color }}>
                                  {node?.categoryLabel || conn.categoryId}
                                </span>
                                {layer && (
                                  <span
                                    className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                                    style={{ background: `${layer.accent}10`, color: layer.accent }}
                                  >
                                    {layer.label.replace(' LAYER', '')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-bold text-gray-900">
                                {node?.selectedComponent || '—'}
                              </p>
                              {techRole && (
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  ({techRole})
                                </p>
                              )}
                              {/* The WHY — always visible, this is the star */}
                              <div className="mt-2 flex items-start gap-1.5 rounded-md px-2.5 py-1.5" style={{ background: '#f8f7ff' }}>
                                <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
                                <p className="text-[11px] text-gray-700 leading-snug">
                                  {conn.reason}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Reverse direction: when THIS component is hovered, show all driving patterns */}
                          <AnimatePresence>
                            {isComponentHovered && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                                  <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                    All driving patterns for this component
                                  </p>
                                  <div className="space-y-1">
                                    {(componentToPatterns.get(conn.categoryId) || []).map((cp) => (
                                      <div key={cp.patternId} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-indigo-400" />
                                        <div>
                                          <span className="text-[10px] font-semibold text-indigo-700">
                                            {cp.patternLabel}
                                          </span>
                                          <span className="text-[10px] text-gray-400 mx-1">—</span>
                                          <span className="text-[10px] text-gray-600 italic">
                                            {cp.reason}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Component count footer */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {slideConnections.length} component{slideConnections.length !== 1 ? 's' : ''} influenced by this pattern
                    </span>
                  </div>
                </motion.div>
              )
            })}

            {/* ── Reverse view: when hovering a component, show its full context ── */}
            <AnimatePresence>
              {hoveredComponentCatId != null && (
                <ReverseComponentView
                  key={`reverse-${hoveredComponentCatId}`}
                  categoryId={hoveredComponentCatId}
                  flowData={flowData}
                  componentToPatterns={componentToPatterns}
                  getLayerForCategory={getLayerForCategory}
                  getTechRole={getTechRole}
                  onClose={handleComponentLeave}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress dots (like slide indicators) */}
        <div className="flex items-center justify-center gap-1.5 py-3 border-t border-gray-100">
          {connectedPatterns.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setActivePatternIdx(idx); setIsPaused(true); setHoveredComponentCatId(null) }}
              className="p-2 -m-1.5 rounded-full cursor-pointer group"
              aria-label={`Go to pattern ${idx + 1}`}
            >
              <span
                className="block h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: idx === safeIdx && !hoveredComponentCatId ? '#4338ca' : '#d1d5db',
                  width: idx === safeIdx && !hoveredComponentCatId ? '16px' : '6px',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}



// ─── Architecture Diagram ────────────────────────────────────────────────

const DIAGRAM_LAYERS: { id: string; label: string; color: string; accent: string; bg: string; border: string; groups: string[] }[] = [
  { id: 'input',     label: 'Input Layer',     color: '#0ea5e9', accent: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', groups: ['input-layer'] },
  { id: 'brain',     label: 'Brain Layer',     color: '#4338ca', accent: '#312e81', bg: '#eef2ff', border: '#c7d2fe', groups: ['context-orchestration'] },
  { id: 'execution', label: 'Execution Layer', color: '#059669', accent: '#065f46', bg: '#ecfdf5', border: '#a7f3d0', groups: ['execution'] },
  { id: 'output',    label: 'Output Layer',    color: '#ea580c', accent: '#92400e', bg: '#fff7ed', border: '#fed7aa', groups: ['output'] },
]

function ArchitectureDiagramSection({ tileId }: { tileId: string }) {
  const flowData = getArchFlowData(tileId)
  if (!flowData || flowData.nodes.length === 0) return null

  // Group nodes by layer
  const layersWithNodes = DIAGRAM_LAYERS.map((layer) => ({
    ...layer,
    nodes: flowData.nodes.filter((n) => layer.groups.includes(n.group)),
  })).filter((l) => l.nodes.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="space-y-3"
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-gray-400" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Architecture Blueprint
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div
        className="rounded-xl border border-gray-200 bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div className="p-5 space-y-2">
          {layersWithNodes.map((layer, li) => (
            <div key={layer.id}>
              {/* Arrow connector between layers */}
              {li > 0 && (
                <div className="flex justify-center py-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-px h-4 bg-gray-200" />
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M5 6L0 0h10L5 6z" fill="#d1d5db" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Layer block */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${layer.border}`, background: layer.bg }}
              >
                {/* Layer label */}
                <div
                  className="px-4 py-2 flex items-center gap-2"
                  style={{ borderBottom: `1px solid ${layer.border}` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: layer.color }}
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: layer.accent }}
                  >
                    {layer.label}
                  </span>
                </div>

                {/* Nodes row */}
                <div className={`grid gap-2 p-3 ${layer.nodes.length === 1 ? 'grid-cols-1' : layer.nodes.length === 2 ? 'grid-cols-2' : layer.nodes.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                  {layer.nodes.map((node) => {
                    const vis = CATEGORY_VISUALS[node.categoryId] ?? CATEGORY_VISUALS['output-delivery']
                    return (
                      <div
                        key={node.id}
                        className="flex flex-col gap-1.5 rounded-lg p-3 bg-white"
                        style={{ border: `1px solid ${layer.border}` }}
                      >
                        {/* Icon + category */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                            style={{ background: vis.bg, color: vis.color }}
                          >
                            <span className="scale-75 origin-center">{vis.icon}</span>
                          </div>
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider leading-tight"
                            style={{ color: vis.color }}
                          >
                            {node.categoryLabel}
                          </span>
                        </div>
                        {/* Selected tech */}
                        <p className="text-xs font-bold text-gray-800 leading-snug pl-0.5">
                          {node.selectedComponent}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Why This Agent Architecture (explainer card) ───────────────────────

function WhyThisArchitectureCard({
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
        <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-gray-700 leading-relaxed">
          {viewMode === 'business'
            ? 'The technology stack your agent needs. Each card shows a component category and the specific technologies selected for your use case. The platform composed this based on your goal, data sources, and interaction patterns.'
            : 'Architecture composition maps each of the 11 component categories to concrete technology choices via a constraint-satisfaction algorithm over pattern complexity scores, data residency requirements, latency budgets, and trust boundary configuration. Technologies are selected from the platform\'s validated component registry with version pinning and compatibility verification.'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export function SolutionArchitecture() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const openMonitoringModal = useAgentPlaygroundStore((s) => s.openMonitoringModal)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const archData = activeTileId ? getArchitectureData(activeTileId) : null
  const techStack = activeTileId ? getTechStack(activeTileId) : null
  const evalMetrics = activeTileId ? getEvalMetrics(activeTileId) : null

  const [showDownloaded, setShowDownloaded] = useState(false)
  const [buildPhase, setBuildPhase] = useState<BuildPhase>('idle')
  const [assemblyCount, setAssemblyCount] = useState(0)
  const [scanProgress, setScanProgress] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const evalSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
    // Reset build state when tile changes
    setBuildPhase('idle')
    setAssemblyCount(0)
    setScanProgress(0)
  }, [activeTileId])

  // Auto-scroll to evaluation section when build completes
  useEffect(() => {
    if (buildPhase === 'complete' && evalSectionRef.current) {
      setTimeout(() => {
        evalSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 300)
    }
  }, [buildPhase])

  const startBuild = useCallback(() => {
    if (buildPhase !== 'idle') return
    setBuildPhase('analyzing')
    setAssemblyCount(0)
    setScanProgress(0)

    // Phase 1: Analyzing meta patterns (~1s)
    setTimeout(() => {
      setBuildPhase('assembling')

      // Phase 2: Assembly — icons appear one by one over ~1.5s
      const assemblyInterval = setInterval(() => {
        setAssemblyCount((prev) => {
          if (prev >= ASSEMBLY_ORDER.length) {
            clearInterval(assemblyInterval)
            return prev
          }
          return prev + 1
        })
      }, 130)

      // Phase 3: Evaluating — starts after assembly completes (~1.5s)
      setTimeout(() => {
        clearInterval(assemblyInterval)
        setAssemblyCount(ASSEMBLY_ORDER.length)
        setBuildPhase('evaluating')
        setScanProgress(0)

        // Scan animation runs for ~1.5s
        const scanInterval = setInterval(() => {
          setScanProgress((prev) => {
            if (prev >= 1) {
              clearInterval(scanInterval)
              return 1
            }
            return prev + 0.03
          })
        }, 50)

        // Phase 4: Complete — after evaluation scan
        setTimeout(() => {
          clearInterval(scanInterval)
          setScanProgress(1)
          setBuildPhase('complete')
        }, 1800)
      }, 1700)
    }, 1000)
  }, [buildPhase])

  if (!tile || !archData || !techStack) return null

  const tileColor = tile.color

  const laneSummaries = archData.lanes.map((ln) => ({
    label: ln.label,
    trustBoundary: ln.trustBoundary,
    interactionFlowCount: ln.interactionFlowCount,
    componentCount: ln.technicalComponents.length,
  }))

  const handleDownload = () => {
    generateAgentDeploymentPDF({ tile, architecture: archData })
    setShowDownloaded(true)
    setTimeout(() => setShowDownloaded(false), 3000)
  }

  const isBuilding = buildPhase !== 'idle'
  const isComplete = buildPhase === 'complete'

  return (
    <div ref={containerRef} className="px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-5">
      {/* Stage header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Agent Composition
        </h2>
        <p className="text-sm text-gray-500">
          {techStack.architectureNote}
        </p>
      </motion.div>

      {/* Why This Agent Architecture — expandable explainer */}
      <WhyThisArchitectureCard viewMode={viewMode} />

      {/* ═══ Composition DNA — unified interactive patterns + architecture ═══ */}
      {activeTileId && <CompositionDNASection tileId={activeTileId} />}

      {/* ═══ Architecture Blueprint Diagram ═══ */}
      {activeTileId && <ArchitectureDiagramSection tileId={activeTileId} />}

      {/* ═══ Existing Content Below ═══ */}

      {/* Technology Stack — hidden while iterating on blueprint */}
      {false && (
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3"
          >
            Technology Stack
          </motion.h3>

          <div className="space-y-3">
            {techStack?.categories.map((cat, i) => (
              <CategoryCard
                key={cat.categoryId}
                category={cat}
                delay={0.25 + i * 0.04}
                viewMode={viewMode}
                tileId={activeTileId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trust lane summary — hidden while iterating on blueprint */}
      {false && <TrustLaneSummary lanes={laneSummaries} delay={0.7} />}

      {/* ═══ Build & Evaluate Section ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="space-y-4"
      >
        {/* Build & Evaluate CTA — gradient style */}
        {!isBuilding && (
          <button
            onClick={startBuild}
            className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: '0 2px 12px rgba(59,130,246,0.25)',
              border: '1px solid rgba(139,92,246,0.3)',
              outlineColor: '#3b82f6',
            }}
            aria-label="Build and evaluate agent"
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4" aria-hidden="true" />
              <span>Build & Evaluate Agent</span>
            </div>
          </button>
        )}

        {/* Build animation container */}
        {isBuilding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 overflow-hidden"
          >
            {/* Phase label */}
            <motion.div
              key={buildPhase}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-2"
            >
              <p
                className="text-sm font-semibold"
                style={{ color: isComplete ? '#10b981' : tileColor }}
              >
                {PHASE_LABELS[buildPhase]}
              </p>
            </motion.div>

            {/* Assembly strip visualization */}
            <AssemblyStrip
              phase={buildPhase}
              visibleCount={assemblyCount}
              scanProgress={scanProgress}
            />

            {/* Progress bar */}
            <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: isComplete
                    ? '#10b981'
                    : `linear-gradient(90deg, ${tileColor}, ${tileColor}99)`,
                }}
                animate={{
                  width:
                    buildPhase === 'analyzing'
                      ? '10%'
                      : buildPhase === 'assembling'
                        ? `${10 + (assemblyCount / ASSEMBLY_ORDER.length) * 45}%`
                        : buildPhase === 'evaluating'
                          ? `${55 + scanProgress * 40}%`
                          : '100%',
                }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </div>

            {/* Completion indicator */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: 'backOut' }}
                  className="mt-4 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  <span className="text-sm font-semibold text-emerald-700">
                    Agent validated against test set
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* ═══ Evaluation Metrics — revealed after build completes ═══ */}
      <AnimatePresence>
        {isComplete && evalMetrics && (
          <motion.div
            ref={evalSectionRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-4"
          >
            {/* Section divider */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Evaluation Results
                </span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

            {/* Metric cards — all 4 metrics with baseline bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { metric: evalMetrics.metric1, label: 'Primary Metric', key: 'primary' },
                { metric: evalMetrics.metric2, label: 'Secondary Metric', key: 'secondary' },
                { metric: evalMetrics.metric3, label: 'Tertiary Metric', key: 'tertiary' },
                { metric: evalMetrics.metric4, label: 'Quaternary Metric', key: 'quaternary' },
              ] as const).map((item, i) => (
                <EvalMetricCard
                  key={item.key}
                  metric={item.metric}
                  metricLabel={item.label}
                  metricColorKey={item.key}
                  delay={0.7 + i * 0.15}
                />
              ))}
            </div>

            {/* Pattern legend */}
            <div className="flex flex-wrap items-center gap-4 px-1">
              {PATTERN_BARS.map((bar) => (
                <div key={bar.key} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${bar.bgClass}`} />
                  <span className="text-[10px] text-gray-500">{bar.label}</span>
                </div>
              ))}
            </div>

            {/* Action buttons — moved below metrics */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <button
                onClick={openMonitoringModal}
                className="flex-1 py-3 px-5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  boxShadow: '0 2px 12px rgba(59,130,246,0.25)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  outlineColor: '#3b82f6',
                }}
                aria-label="View Monitoring Dashboard"
              >
                <div className="flex items-center justify-center gap-2">
                  <Cpu className="w-4 h-4" aria-hidden="true" />
                  <span>View Monitoring Dashboard</span>
                </div>
              </button>
              <button
                className="flex-1 py-3 px-5 rounded-xl text-sm font-semibold transition-all hover:shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  outlineColor: '#3b82f6',
                }}
                aria-label="Download Deployment Guide"
                onClick={handleDownload}
              >
                <div className="flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>{showDownloaded ? 'Downloaded!' : 'Download Deployment Guide'}</span>
                </div>
              </button>
            </motion.div>

            {/* Download toast */}
            <AnimatePresence>
              {showDownloaded && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Your agent deployment guide has been downloaded.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Competitive differentiator */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-400 italic">
                Other platforms require manual architecture design. VibeModel composes and validates the optimal solution automatically.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
