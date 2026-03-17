import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  GitBranch,
  Database,
  Users,
  Layers,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Target,
} from 'lucide-react'
import { AgentTooltip } from '@/components/agent/AgentTooltip'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getDimensionAnalysisData } from '@/lib/agent/dimensionAnalysisData'
import type {
  TaskDimension,
  DataDimension,
  UserProfileDimension,
  OutputDimension,
  ToolDimension,
  ToolState,
} from '@/store/agentTypes'
import { DIMENSION_COLORS } from '@/store/agentTypes'

// ─── Tab Definitions ──────────────────────────────────────────────────────────

type DimensionTab = 'task' | 'data' | 'output' | 'tool'

interface TabDef {
  id: DimensionTab
  label: string
  icon: React.ElementType
  goalLink: string
  dimensionColor: string // unified dimension color
}

const TABS: TabDef[] = [
  { id: 'task', label: 'Task Dimensions', icon: Target, goalLink: 'What the agent does', dimensionColor: DIMENSION_COLORS.task.primary },
  { id: 'data', label: 'Data Dimensions', icon: Database, goalLink: 'What the agent knows', dimensionColor: DIMENSION_COLORS.data.primary },
  { id: 'output', label: 'Response Dimensions', icon: Users, goalLink: 'What the agent produces', dimensionColor: DIMENSION_COLORS.output.primary },
  { id: 'tool', label: 'Tool Dimensions', icon: Layers, goalLink: 'How the agent operates', dimensionColor: DIMENSION_COLORS.tool.primary },
]

// ─── Confidence Colors ────────────────────────────────────────────────────────

const CONFIDENCE_META: Record<
  'high' | 'medium' | 'low',
  { label: string; color: string; bg: string; border: string; tooltipTitle: string; tooltipContent: string }
> = {
  high: {
    label: 'High',
    color: '#166534',
    bg: '#dcfce7',
    border: '#86efac',
    tooltipTitle: 'High Intent Confidence',
    tooltipContent: 'The engine can reliably detect and classify this task dimension from user input. Clear intent signals with minimal ambiguity — the agent handles this without guessing.',
  },
  medium: {
    label: 'Medium',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fde047',
    tooltipTitle: 'Medium Intent Confidence',
    tooltipContent: 'The engine can usually detect this task dimension, but some user inputs may be ambiguous. May require follow-up clarification or contextual inference to classify correctly.',
  },
  low: {
    label: 'Low',
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fca5a5',
    tooltipTitle: 'Low Intent Confidence',
    tooltipContent: 'This task dimension is difficult to detect from user input alone. Overlaps with other intents or lacks clear signals. Often requires multi-turn dialogue or human-in-the-loop to resolve.',
  },
}

// ─── User Profile Axis Colors ─────────────────────────────────────────────────

const CONTEXT_AXIS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  anonymous: { label: 'Anonymous', color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
  known: { label: 'Known', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  vip: { label: 'VIP', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
}

const POSTURE_AXIS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'info-seeking': { label: 'Info-Seeking', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  'problem-reporting': { label: 'Problem-Reporting', color: '#b45309', bg: '#fff7ed', border: '#fed7aa' },
  dispute: { label: 'Dispute', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
}

const CHANNEL_AXIS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'self-service': { label: 'Self-Service', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  'agent-assisted': { label: 'Agent-Assisted', color: '#be185d', bg: '#fce7f3', border: '#fbcfe8' },
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const panelVariants: Variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

// ─── Depth Meter ──────────────────────────────────────────────────────────────

function DepthMeter({ depth, maxDepth = 5, color }: { depth: number; maxDepth?: number; color?: string }) {
  const fillColor = color ?? DIMENSION_COLORS.data.primary
  return (
    <div
      className="flex items-center gap-1"
      role="meter"
      aria-label={`Depth: ${depth} out of ${maxDepth}`}
      aria-valuemin={1}
      aria-valuemax={maxDepth}
      aria-valuenow={depth}
    >
      {Array.from({ length: maxDepth }, (_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-sm transition-colors"
          style={{
            background: i < depth ? fillColor : '#e5e7eb',
          }}
        />
      ))}
      <span className="text-[10px] text-gray-400 ml-1">{depth}/{maxDepth}</span>
    </div>
  )
}

// ─── Goal Traceability Ribbon ─────────────────────────────────────────────────

function GoalRibbon({ text, accentColor }: { text: string; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium"
      style={{
        background: `${accentColor}08`,
        border: `1px solid ${accentColor}15`,
        color: accentColor,
      }}
    >
      <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </motion.div>
  )
}

// ─── Task Dimension Card ──────────────────────────────────────────────────────

function TaskDimensionCard({
  dim,
  delay,
  viewMode,
}: {
  dim: TaskDimension
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const conf = CONFIDENCE_META[dim.confidence]
  const dc = DIMENSION_COLORS.task

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: dc.medium }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: dc.light }}
          >
            <Target className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.label}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.id}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">{dim.description}</p>
          </div>
        </div>
        <AgentTooltip title={conf.tooltipTitle} content={conf.tooltipContent}>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 cursor-help"
            style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}
          >
            {conf.label}
          </span>
        </AgentTooltip>
      </div>

      <div className="ml-[42px] mt-2 space-y-2.5">
        {/* Parent task traceability */}
        {viewMode === 'technical' && dim.parentTaskId && (
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3 h-3 text-gray-400 shrink-0" aria-hidden="true" />
            <span className="text-[10px] text-gray-400">Parent:</span>
            <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
              {dim.parentTaskId}
            </span>
          </div>
        )}

        {/* Intent categories */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Intent Categories
          </p>
          <div className="flex flex-wrap gap-1">
            {dim.intentCategories.map((cat) => (
              <span
                key={cat}
                className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Data Dimension Card (Knowledge Map) ──────────────────────────────────────

function DataDimensionCard({
  dim,
  delay,
  viewMode,
}: {
  dim: DataDimension
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const dc = DIMENSION_COLORS.data

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: dc.medium }}
    >
      {/* Header with depth meter */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: dc.light }}
          >
            <BookOpen className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.label}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.id}
                </span>
              )}
            </div>
            <DepthMeter depth={dim.depthScore} />
          </div>
        </div>
      </div>

      {/* Sub-topics with individual depths */}
      <div className="ml-[42px] space-y-3">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Sub-Topics
          </p>
          <div className="space-y-1">
            {dim.subTopics.map((st) => (
              <div key={st.name} className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">{st.name}</span>
                <DepthMeter depth={st.depth} />
              </div>
            ))}
          </div>
        </div>

        {/* Key entities */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Key Entities
          </p>
          <div className="flex flex-wrap gap-1">
            {dim.keyEntities.map((e) => (
              <span
                key={e}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ color: dc.dark, background: dc.light, border: `1px solid ${dc.medium}` }}
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Connected domains — technical only */}
        {viewMode === 'technical' && dim.connectedDomains.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Connected Domains
            </p>
            <div className="flex flex-wrap gap-1">
              {dim.connectedDomains.map((d) => (
                <span
                  key={d}
                  className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source attribution — technical only */}
        {viewMode === 'technical' && (
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Sources
            </p>
            {dim.sourceAttribution.map((src) => (
              <div key={src.sourceId} className="flex items-start gap-2 text-xs">
                <span className="text-gray-300 mt-0.5 shrink-0">&rarr;</span>
                <span className="text-gray-500">
                  <span className="font-medium text-gray-600">{src.sourceName}</span>
                  {' \u2014 '}
                  {src.count}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Gap note */}
        {dim.gapNote && (
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[10px] text-amber-600 leading-relaxed">{dim.gapNote}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── User Profile Dimension Card ──────────────────────────────────────────────

function AxisBadge({ meta }: { meta: { label: string; color: string; bg: string; border: string } }) {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
    >
      {meta.label}
    </span>
  )
}

function UserProfileDimensionCard({
  dim,
  delay,
  viewMode,
}: {
  dim: UserProfileDimension
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const dc = DIMENSION_COLORS.userProfile
  const contextMeta = CONTEXT_AXIS_META[dim.contextAxis] ?? CONTEXT_AXIS_META.anonymous
  const postureMeta = POSTURE_AXIS_META[dim.postureAxis] ?? POSTURE_AXIS_META['info-seeking']
  const channelMeta = CHANNEL_AXIS_META[dim.channelAxis] ?? CHANNEL_AXIS_META['self-service']

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: dc.medium }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: dc.light, border: `1px solid ${dc.medium}` }}
          >
            <Users className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.label}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.id}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">{dim.description}</p>
          </div>
        </div>
      </div>

      <div className="ml-[42px] space-y-2.5 mt-2">
        {/* Behavioral axes */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Behavioral Axes
          </p>
          <div className="flex flex-wrap gap-1.5">
            <AxisBadge meta={contextMeta} />
            <AxisBadge meta={postureMeta} />
            <AxisBadge meta={channelMeta} />
          </div>
        </div>

        {/* Behavior impact */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Behavior Impact
          </p>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {dim.behaviorImpact}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Output Dimension Card ────────────────────────────────────────────────────

const OUTPUT_OUTCOME_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  success: { label: 'Success', color: '#166534', bg: '#dcfce7', border: '#86efac' },
  partial: { label: 'Partial', color: '#92400e', bg: '#fef3c7', border: '#fde047' },
  failure: { label: 'Failure', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
  escalation: { label: 'Escalation', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
}

const OUTPUT_COMPLEXITY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  direct: { label: 'Direct', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  'cross-referenced': { label: 'Cross-Referenced', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  inferred: { label: 'Inferred', color: '#b45309', bg: '#fff7ed', border: '#fed7aa' },
}

const OUTPUT_INTERACTION_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'one-shot': { label: 'One-shot', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  conversational: { label: 'Conversational', color: '#be185d', bg: '#fce7f3', border: '#fbcfe8' },
  proactive: { label: 'Proactive', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
}

function OutputDimensionCard({
  dim,
  delay,
  viewMode,
}: {
  dim: OutputDimension
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const dc = DIMENSION_COLORS.output
  const outcomeMeta = OUTPUT_OUTCOME_META[dim.outcome] ?? OUTPUT_OUTCOME_META.success
  const complexityMeta = OUTPUT_COMPLEXITY_META[dim.complexity] ?? OUTPUT_COMPLEXITY_META.direct
  const interactionMeta = OUTPUT_INTERACTION_META[dim.interaction] ?? OUTPUT_INTERACTION_META['one-shot']

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: dc.medium }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: dc.light, border: `1px solid ${dc.medium}` }}
          >
            <BookOpen className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.label}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.id}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ml-[42px] space-y-2.5 mt-2">
        {/* Agent output reference */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Derives From
          </p>
          <span
            className="text-[10px] font-medium px-2.5 py-1 rounded-full inline-block"
            style={{ background: dc.light, color: dc.dark, border: `1px solid ${dc.medium}` }}
          >
            {dim.agentOutputLabel}
          </span>
        </div>

        {/* Three-axis decomposition */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Decomposition Axes
          </p>
          <div className="flex flex-wrap gap-1.5">
            <AxisBadge meta={outcomeMeta} />
            <AxisBadge meta={complexityMeta} />
            <AxisBadge meta={interactionMeta} />
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Description
          </p>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {dim.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Tool Dimension Card ──────────────────────────────────────────────────────

const TOOL_OUTCOME_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  success: { label: 'Success', color: '#166534', bg: '#dcfce7', border: '#86efac' },
  failure: { label: 'Failure', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
  timeout: { label: 'Timeout', color: '#b45309', bg: '#fff7ed', border: '#fed7aa' },
  'rate-limited': { label: 'Rate-Limited', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
}

function ToolStateItem({
  state,
}: {
  state: ToolState
}) {
  const outcomeMeta = TOOL_OUTCOME_META[state.outcome] ?? TOOL_OUTCOME_META.success

  return (
    <div className="border-l-2 border-gray-200 pl-3 py-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold text-gray-700">{state.label}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
          {state.operation}
        </span>
        <span
          className="text-[9px] font-medium px-2 py-0.5 rounded-full"
          style={{
            background: outcomeMeta.bg,
            color: outcomeMeta.color,
            border: `1px solid ${outcomeMeta.border}`,
          }}
        >
          {outcomeMeta.label}
        </span>
      </div>
      <p className="text-[10px] text-gray-500 leading-relaxed">{state.description}</p>
    </div>
  )
}

function ToolDimensionCard({
  dim,
  delay,
  viewMode,
}: {
  dim: ToolDimension
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const dc = DIMENSION_COLORS.tool

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: dc.medium }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: dc.light }}
          >
            <Layers className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.toolName}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.toolId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tool states */}
      <div className="ml-[42px] space-y-1">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          States
        </p>
        <div className="space-y-2">
          {dim.states.map((state) => (
            <ToolStateItem key={state.id} state={state} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({
  tabs,
  activeTab,
  onTabChange,
  accentColor,
  counts,
}: {
  tabs: TabDef[]
  activeTab: DimensionTab
  onTabChange: (tab: DimensionTab) => void
  accentColor: string
  counts: Record<DimensionTab, number>
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
    const tabIds = tabs.map((t) => t.id)
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
      aria-label="Dimension categories"
      onKeyDown={handleTabKeyDown}
      className="relative flex border-b border-gray-200"
    >
      {/* Sliding indicator — uses active tab's dimension color */}
      <motion.div
        className="absolute bottom-0 h-[2px] rounded-full"
        style={{ background: (tabs.find((t) => t.id === activeTab)?.dimensionColor) ?? accentColor }}
        animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const Icon = tab.icon
        const tabColor = tab.dimensionColor
        return (
          <button
            key={tab.id}
            id={`dim-tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`dim-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            data-tab={tab.id}
            ref={isActive ? measureIndicator : undefined}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-colors relative ${
              isActive ? '' : 'text-gray-400 hover:text-gray-600'
            }`}
            style={isActive ? { color: tabColor } : undefined}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tab.label}</span>
            <span
              className="min-w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: isActive ? `${tabColor}12` : '#f3f4f6',
                color: isActive ? tabColor : '#9ca3af',
              }}
            >
              {counts[tab.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Stage Explainer ──────────────────────────────────────────────────────────

function DimensionExplainer({ viewMode }: { viewMode: 'business' | 'technical' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
    >
      <div className="flex items-start gap-3">
        <Layers className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-gray-700 leading-relaxed">
          {viewMode === 'business'
            ? 'Three-dimensional analysis: what the agent does (tasks), what knowledge it draws from (data), and who it serves (user profiles). Each dimension drives the pattern combinations in the next stage.'
            : 'Three-axis dimensional decomposition: (1) Task dimensions slice parent tasks into sub-capabilities with intent classification and confidence scoring, traced back to Context Definition via parentTaskId, (2) Data dimensions build a knowledge topology with depth profiling across sub-topics, entity extraction, and domain linkage, (3) User Profile dimensions model behavioral axes — Context (anonymous/known/VIP) × Posture (info-seeking/problem-reporting/dispute) × Channel (self-service/agent-assisted). The resulting tensor drives combinatorial pattern enumeration.'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

function SummaryStats({
  summaryText,
  accentColor,
}: {
  summaryText: string
  accentColor: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl border px-4 py-3 flex items-center gap-3"
      style={{
        borderColor: `${accentColor}20`,
        background: `${accentColor}04`,
      }}
    >
      <Layers className="w-4 h-4 shrink-0" style={{ color: accentColor }} aria-hidden="true" />
      <p className="text-xs text-gray-600 leading-relaxed">{summaryText}</p>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContextDimensions() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const [activeTab, setActiveTab] = useState<DimensionTab>('task')

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const dimensionsData = activeTileId ? getDimensionAnalysisData(activeTileId) : null
  const accentColor = tile?.color ?? '#3b82f6'

  const counts = useMemo<Record<DimensionTab, number>>(() => {
    if (!dimensionsData) return { task: 0, data: 0, output: 0, tool: 0 }
    return {
      task: dimensionsData.taskDimensions.length,
      data: dimensionsData.dataDimensions.length,
      output: dimensionsData.outputDimensions.length,
      tool: dimensionsData.toolDimensions.reduce((sum, t) => sum + (t.states?.length ?? 0), 0),
    }
  }, [dimensionsData])

  if (!tile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">No tile selected.</p>
      </div>
    )
  }

  if (!dimensionsData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dimension Analysis</h2>
          <p className="text-sm text-gray-500">
            Decomposing your agent into three capability dimensions
          </p>
        </motion.div>
        <DimensionExplainer viewMode={viewMode} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center"
        >
          <Layers className="w-8 h-8 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-400">
            Dimensional data for this use case is being generated.
          </p>
        </motion.div>
      </div>
    )
  }

  const activeTabDef = TABS.find((t) => t.id === activeTab)!

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Stage header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dimension Analysis</h2>
        <p className="text-sm text-gray-500">
          Decomposing your agent into three capability dimensions
        </p>
      </motion.div>

      {/* Explainer */}
      <DimensionExplainer viewMode={viewMode} />

      {/* Tab bar */}
      <TabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={accentColor}
        counts={counts}
      />

      {/* Goal traceability ribbon */}
      <GoalRibbon text={activeTabDef.goalLink} accentColor={activeTabDef.dimensionColor} />

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`dim-panel-${activeTab}`}
        aria-labelledby={`dim-tab-${activeTab}`}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'task' && (
            <motion.div
              key="task"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Each task dimension represents a specific sub-capability sliced from the parent
                tasks defined in Context Definition. Intent categories show which types of queries
                activate each task, with parentTaskId tracing back to the original goal.
              </p>
              {dimensionsData.taskDimensions.map((dim, i) => (
                <TaskDimensionCard
                  key={dim.id}
                  dim={dim}
                  delay={0.05 + i * 0.06}
                  viewMode={viewMode}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              key="data"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Knowledge map showing what the agent knows, how deep its understanding goes for
                each topic, and which sources contribute. Depth scores from 1 (surface) to 5
                (expert).
              </p>
              {dimensionsData.dataDimensions.map((dim, i) => (
                <DataDimensionCard
                  key={dim.id}
                  dim={dim}
                  delay={0.05 + i * 0.06}
                  viewMode={viewMode}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'output' && (
            <motion.div
              key="output"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Response dimensions decompose agent outputs along three axes: Outcome (success/partial/failure/escalation),
                Complexity (direct/cross-referenced/inferred), and Interaction (one-shot/conversational/proactive).
                Each dimension traces back to the underlying agent output definition.
              </p>
              {dimensionsData.outputDimensions.map((dim, i) => (
                <OutputDimensionCard
                  key={dim.id}
                  dim={dim}
                  delay={0.05 + i * 0.06}
                  viewMode={viewMode}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'tool' && (
            <motion.div
              key="tool"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Tool dimensions describe the operations and state transitions for each tool the agent uses.
                Each state maps an operation (create/read/update/delete/connect) to an outcome (success/failure/timeout/rate-limited)
                with contextual descriptions.
              </p>
              {dimensionsData.toolDimensions.map((dim, i) => (
                <ToolDimensionCard
                  key={dim.id}
                  dim={dim}
                  delay={0.05 + i * 0.06}
                  viewMode={viewMode}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <SummaryStats summaryText={dimensionsData.summaryText} accentColor={accentColor} />
    </div>
  )
}
