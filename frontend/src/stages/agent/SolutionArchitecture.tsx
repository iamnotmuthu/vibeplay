import { useState, useEffect, useRef, useCallback } from 'react'
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
  Target,
  Lightbulb,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getArchitectureData } from '@/lib/agent/architectureData'
import { getTechStack, getEvalMetrics } from '@/lib/agent/componentTechData'
import { generateAgentDeploymentPDF } from '@/lib/agent/generateAgentDeploymentPDF'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
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
}: {
  category: CategoryTechMapping
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const [expanded, setExpanded] = useState(false)
  const vis = CATEGORY_VISUALS[category.categoryId] ?? CATEGORY_VISUALS['output-delivery']

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

      {/* Expanded: show note and role details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3.5 pt-0 space-y-2">
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

type BuildPhase = 'idle' | 'assembling' | 'evaluating' | 'complete'

const PHASE_LABELS: Record<BuildPhase, string> = {
  idle: '',
  assembling: 'Assembling agent components\u2026',
  evaluating: 'Running validation data against architecture\u2026',
  complete: 'Evaluation complete',
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
  { key: 'dominant', label: 'Dominant Patterns', color: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-600' },
  { key: 'nonDominant', label: 'Non-Dominant Patterns', color: '#ef4444', bgClass: 'bg-red-500', textClass: 'text-red-600' },
  { key: 'fuzzy', label: 'Fuzzy Patterns', color: '#f59e0b', bgClass: 'bg-amber-500', textClass: 'text-amber-600' },
]

// ─── Evaluation Metric Card (MAPE/RMSE horizontal bar style) ────────────

function EvalMetricCard({
  metric,
  metricLabel,
  delay,
}: {
  metric: EvalMetric
  metricLabel: string // "Primary Metric" | "Secondary Metric"
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="rounded-xl border border-gray-200 bg-white p-5"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      {/* Metric name + label */}
      <div className="mb-4">
        <h4 className="text-sm font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
          {metric.shortName}
          <div className="group relative">
            <Info className="w-3 h-3 text-gray-300 cursor-help" aria-hidden="true" />
            <div className="absolute left-0 top-5 w-56 p-2.5 rounded-lg bg-gray-900 text-white text-xs leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none shadow-lg font-normal">
              {metric.description}
            </div>
          </div>
        </h4>
        <p className="text-xs text-blue-600 font-medium">{metricLabel}</p>
      </div>

      {/* Horizontal bars per pattern */}
      <div className="space-y-3">
        {PATTERN_BARS.map((bar, i) => {
          const value = metric.breakdown[bar.key]
          return (
            <div key={bar.key} className="flex items-center gap-3">
              <span className="text-[11px] text-gray-600 w-[130px] shrink-0 truncate">
                {bar.label}
              </span>
              <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeOut',
                    delay: delay + 0.15 + i * 0.08,
                  }}
                  className={`h-full rounded-full ${bar.bgClass}`}
                />
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.4 + i * 0.08 }}
                className={`text-xs font-bold tabular-nums w-8 text-right ${bar.textClass}`}
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
  scanProgress,
}: {
  phase: BuildPhase
  visibleCount: number
  scanProgress: number // 0-1
}) {
  return (
    <div className="relative py-4">
      {/* Pipeline strip */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 relative">
        {ASSEMBLY_ORDER.map((catId, i) => {
          const vis = CATEGORY_VISUALS[catId]
          const isVisible = i < visibleCount

          return (
            <motion.div
              key={catId}
              initial={{ opacity: 0, scale: 0, y: -8 }}
              animate={
                isVisible
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 0, y: -8 }
              }
              transition={{
                duration: 0.2,
                delay: isVisible ? i * 0.1 : 0,
                ease: 'backOut',
              }}
              className="relative"
            >
              {/* Icon circle */}
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border transition-all duration-300"
                style={{
                  background: vis.bg,
                  borderColor: vis.border,
                  color: vis.color,
                  boxShadow:
                    phase === 'evaluating' && isVisible
                      ? `0 0 12px ${vis.color}30`
                      : 'none',
                }}
              >
                {vis.icon}
              </div>

              {/* Connector line to next */}
              {i < ASSEMBLY_ORDER.length - 1 && isVisible && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.1 + 0.1 }}
                  className="absolute top-1/2 -right-1 sm:-right-2 w-1 sm:w-2 h-0.5 bg-gray-200 origin-left"
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Scan line effect during evaluation phase */}
      {phase === 'evaluating' && (
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-60"
          style={{
            left: `${scanProgress * 100}%`,
          }}
          animate={{
            left: ['0%', '100%'],
          }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      )}
    </div>
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

// ─── Agent Composition Info Card (matches Predictive "Model Composition") ────

const PIPELINE_CATEGORY_LABELS = [
  'Input/API',
  'Session',
  'Orchestrator',
  'Planning',
  'Decomposition',
  'Tool Access',
  'RAG',
  'Execution',
  'Response',
  'Policy',
  'Output',
] as const

function AgentCompositionCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        border: '1px solid rgba(139,92,246,0.3)',
        background: 'rgba(245,243,255,0.8)',
        borderLeft: '4px solid #8b5cf6',
      }}
    >
      {/* Animated shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(139,92,246,0.06) 45%, rgba(139,92,246,0.12) 50%, rgba(139,92,246,0.06) 55%, transparent 60%)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{
          duration: 2.5,
          ease: 'easeInOut',
          delay: 0.8,
          repeat: 2,
          repeatDelay: 1,
        }}
      />
      <div className="flex items-start gap-3 relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            delay: 0.5,
            repeat: 2,
            repeatDelay: 1.5,
          }}
        >
          <Info className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" aria-hidden="true" />
        </motion.div>
        <div>
          <div className="text-sm font-semibold text-violet-700 mb-1">
            Agent Composition — Not Assembly
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            VibeModel doesn't pick from a menu — it composes an agent from
            scratch. Every component below was chosen based on your goal,
            interaction patterns, and trust boundaries.
          </p>
        </div>
      </div>

      {/* Horizontal pipeline strip — 11 categories */}
      <div className="mt-4 flex items-center gap-1 overflow-x-auto">
        {PIPELINE_CATEGORY_LABELS.map((step, i) => (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <div
              className="px-2.5 py-1 rounded-md text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 whitespace-nowrap"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              {step}
            </div>
            {i < PIPELINE_CATEGORY_LABELS.length - 1 && (
              <span className="text-gray-400 text-xs" aria-hidden="true">
                &rarr;
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Chosen Agent Type Panel ─────────────────────────────────────────────

function ChosenAgentPanel({
  tileName,
  tileColor,
  totalCategories,
  totalTechs,
  totalLanes,
  pipelineLabel,
}: {
  tileName: string
  tileColor: string
  totalCategories: number
  totalTechs: number
  totalLanes: number
  pipelineLabel: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-xl overflow-hidden"
      style={{
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        borderTop: '3px solid transparent',
        borderImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6) 1',
        borderImageSlice: '1 1 0 1',
      }}
    >
      {/* Agent type header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{
          borderBottom: '1px solid #e5e7eb',
          background:
            'linear-gradient(90deg, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.03) 100%)',
        }}
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Agent Type
        </span>
        <span
          className="px-3 py-1 rounded-full text-sm font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 0 12px rgba(59,130,246,0.4)',
          }}
        >
          {tileName}
        </span>
        <span className="text-xs text-gray-500 ml-auto">{pipelineLabel}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        {[
          { label: 'Categories', value: totalCategories },
          { label: 'Technologies', value: totalTechs },
          { label: 'Trust Lanes', value: totalLanes },
        ].map((stat) => (
          <div key={stat.label} className="px-5 py-3 text-center">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
              {stat.label}
            </p>
            <p className="text-xl font-black" style={{ color: tileColor }}>
              {stat.value}
            </p>
          </div>
        ))}
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
    setBuildPhase('assembling')
    setAssemblyCount(0)

    // Phase 1: Assembly — icons appear one by one over ~1.5s
    const assemblyInterval = setInterval(() => {
      setAssemblyCount((prev) => {
        if (prev >= ASSEMBLY_ORDER.length) {
          clearInterval(assemblyInterval)
          return prev
        }
        return prev + 1
      })
    }, 130)

    // Phase 2: Evaluating — starts after assembly completes (~1.5s)
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

      // Phase 3: Complete — after evaluation scan
      setTimeout(() => {
        clearInterval(scanInterval)
        setScanProgress(1)
        setBuildPhase('complete')
      }, 1800)
    }, 1700)
  }, [buildPhase])

  if (!tile || !archData || !techStack) return null

  const tileColor = tile.color

  const totalTechs = techStack.categories.reduce(
    (sum, c) => sum + c.technologies.length,
    0
  )

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
          Solution Architecture
        </h2>
        <p className="text-sm text-gray-500">
          {techStack.architectureNote}
        </p>
      </motion.div>

      {/* Why This Agent Architecture — expandable explainer */}
      <WhyThisArchitectureCard viewMode={viewMode} />

      {/* Agent Composition info card with pipeline strip */}
      <AgentCompositionCard />

      {/* Chosen Agent panel with stats */}
      <ChosenAgentPanel
        tileName={tile.label}
        tileColor={tileColor}
        totalCategories={techStack.categories.length}
        totalTechs={totalTechs}
        totalLanes={archData.totalLanes}
        pipelineLabel={techStack.pipelineLabel}
      />

      {/* Component category cards — the primary content */}
      <div>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3"
        >
          Technology Stack ({totalTechs} components across {techStack.categories.length} categories)
        </motion.h3>

        <div className="space-y-3">
          {techStack.categories.map((cat, i) => (
            <CategoryCard
              key={cat.categoryId}
              category={cat}
              delay={0.25 + i * 0.04}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>

      {/* Trust lane summary — secondary, collapsible */}
      <TrustLaneSummary lanes={laneSummaries} delay={0.7} />

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
                    buildPhase === 'assembling'
                      ? `${(assemblyCount / ASSEMBLY_ORDER.length) * 50}%`
                      : buildPhase === 'evaluating'
                        ? `${50 + scanProgress * 45}%`
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

            {/* Metric cards — MAPE/RMSE style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EvalMetricCard
                metric={evalMetrics.metric1}
                metricLabel="Primary Metric"
                delay={0.7}
              />
              <EvalMetricCard
                metric={evalMetrics.metric2}
                metricLabel="Secondary Metric"
                delay={0.9}
              />
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
