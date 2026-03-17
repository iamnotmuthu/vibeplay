'use client'

import { useState, useRef, useMemo, useEffect, useLayoutEffect, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  GitBranch,
  Database,
  Users,
  Layers,
  ArrowRight,
  Target,
} from 'lucide-react'
import { AgentTooltip } from '@/components/agent/AgentTooltip'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getDimensionAnalysisData } from '@/lib/agent/dimensionAnalysisData'
import { getDimensionAnalysisDataV3 } from '@/lib/agent/dimensionAnalysisDataV3'
import { isV3SupportedTile, resolveV3TileId } from '@/lib/agent/v3TileResolver'
import { getContextDefinitionDataV3 } from '@/lib/agent/contextDefinitionDataV3'
import { getStructuralDiscoveries } from '@/lib/agent/structuralDiscoveryDataV3'
import type {
  TaskDimension,
  DataDimension,
  FormatDimension,
  OutputDimension,
  ToolDimension,
} from '@/store/agentTypes'
import { DIMENSION_COLORS } from '@/store/agentTypes'
import type { StructuralDiscovery } from '@/lib/agent/structuralDiscoveryDataV3'

// ─── Feature Flags ───────────────────────────────────────────────────────────
// The structural discovery graph (data sources ↔ challenges ↔ tasks) is hidden
// while we redesign it as an interactive explorer. Set to true to re-enable.
const SHOW_STRUCTURAL_DISCOVERY_GRAPH = false

// ─── Tab Definitions ──────────────────────────────────────────────────────────

type DimensionTab = 'task' | 'data' | 'output' | 'tool'

interface TabDef {
  id: DimensionTab
  label: string
  icon: React.ElementType
  goalLink: string
  dimensionColor: string
}

const TABS: TabDef[] = [
  { id: 'task', label: 'Task Dimensions', icon: Target, goalLink: 'What the agent does', dimensionColor: DIMENSION_COLORS.task.primary },
  { id: 'data', label: 'Data Dimensions', icon: Database, goalLink: 'What the agent knows', dimensionColor: DIMENSION_COLORS.data.primary },
  { id: 'output', label: 'Response Dimensions', icon: Users, goalLink: 'What the agent produces', dimensionColor: DIMENSION_COLORS.output.primary },
  { id: 'tool', label: 'Tool Dimensions', icon: Layers, goalLink: 'How the agent operates', dimensionColor: DIMENSION_COLORS.tool.primary },
]

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
    tooltipContent: 'The engine can reliably detect and classify this task dimension from user input.',
  },
  medium: {
    label: 'Medium',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fde047',
    tooltipTitle: 'Medium Intent Confidence',
    tooltipContent: 'The engine can usually detect this task dimension, but some inputs may be ambiguous.',
  },
  low: {
    label: 'Low',
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fca5a5',
    tooltipTitle: 'Low Intent Confidence',
    tooltipContent: 'This dimension is difficult to detect from user input alone.',
  },
}



const panelVariants: Variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

function GoalRibbon({ text, accentColor }: { text: string; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium"
      style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}15`, color: accentColor }}
    >
      <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </motion.div>
  )
}

// ─── Tab Bar ───────────────────────────────────────────────────────────────────

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
  return (
    <div className="flex gap-4 border-b border-gray-200 pb-0">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            id={`dim-tab-${tab.id}`}
            aria-selected={isActive}
            className="pb-3 px-1 text-sm font-medium transition-colors relative"
            style={{ color: isActive ? tab.dimensionColor : '#6b7280' }}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${tab.dimensionColor}10`,
                  color: tab.dimensionColor,
                }}
              >
                {counts[tab.id]}
              </span>
            </div>
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: tab.dimensionColor }}
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Dimension Cards (from existing ContextDimensions.tsx) ────────────────────

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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: dc.light }}>
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
        {viewMode === 'technical' && dim.parentTaskId && (
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3 h-3 text-gray-400 shrink-0" aria-hidden="true" />
            <span className="text-[10px] text-gray-400">Parent:</span>
            <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{dim.parentTaskId}</span>
          </div>
        )}

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Intent Categories</p>
          <div className="flex flex-wrap gap-1">
            {dim.intentCategories.map((cat) => (
              <span key={cat} className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Flattened Source Dimensions ─────────────────────────────────────────────
// Each sub-topic within a data source is its own dimension card, grouped by source.

function SourceDimensionsGroup({
  dimensions,
  delay,
}: {
  dimensions: DataDimension[]
  delay: number
}) {
  const dc = DIMENSION_COLORS.data
  let cardIdx = 0

  return (
    <div className="space-y-4">
      {dimensions.map((dim, groupIdx) => {
        const sourceInfo = dim.sourceAttribution?.[0]
        return (
          <div key={dim.id} className="space-y-1.5">
            {/* Source group header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: delay + groupIdx * 0.05 }}
              className="flex items-center justify-between px-1"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: dc.primary }}
                />
                <p className="text-[11px] font-bold text-gray-700">{dim.label}</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div
                      key={d}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: d <= dim.depthScore ? dc.primary : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>
              {sourceInfo && (
                <span className="text-[9px] text-gray-400">{sourceInfo.count}</span>
              )}
            </motion.div>

            {/* Sub-topic dimension cards */}
            <div className="space-y-1 pl-4">
              {(dim.subTopics ?? []).map((st) => {
                const currentIdx = cardIdx++
                return (
                  <motion.div
                    key={`${dim.id}-${st.name}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: delay + currentIdx * 0.03 }}
                    className="rounded-lg border bg-white px-3 py-2 flex items-center gap-3"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    {/* Depth dots */}
                    <div className="flex gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <div
                          key={d}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: d <= st.depth ? dc.primary : '#e5e7eb' }}
                        />
                      ))}
                    </div>

                    {/* Dimension name */}
                    <p className="text-[12px] font-medium text-gray-800 flex-1">{st.name}</p>

                    {/* Depth score */}
                    <span className="text-[10px] text-gray-400 shrink-0">{st.depth}/5</span>
                  </motion.div>
                )
              })}

              {/* Key entities row */}
              {dim.keyEntities.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 pb-1">
                  {dim.keyEntities.map((entity) => (
                    <span key={entity} className="text-[9px] text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                      {entity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Format Dimension Card ────────────────────────────────────────────────────

const FORMAT_TYPE_ICONS: Record<string, { label: string; color: string; bg: string }> = {
  tabular: { label: 'TABLE', color: '#0369a1', bg: '#e0f2fe' },
  hierarchical: { label: 'JSON', color: '#7c3aed', bg: '#ede9fe' },
  document: { label: 'DOC', color: '#b45309', bg: '#fef3c7' },
  image: { label: 'IMG', color: '#be123c', bg: '#ffe4e6' },
  relational: { label: 'SQL', color: '#047857', bg: '#d1fae5' },
  mixed: { label: 'MIX', color: '#6b7280', bg: '#f3f4f6' },
}

function FormatDimensionCard({
  dim,
  delay,
}: {
  dim: FormatDimension
  delay: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const fmtStyle = FORMAT_TYPE_ICONS[dim.formatType] ?? FORMAT_TYPE_ICONS.mixed

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden cursor-pointer"
      style={{ borderColor: '#e5e7eb' }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        {/* Header row: format badge + label + confidence */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold tracking-wider"
              style={{ background: fmtStyle.bg, color: fmtStyle.color }}
            >
              {fmtStyle.label}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">{dim.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{dim.description}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Confidence</p>
            <p className="text-sm font-bold" style={{ color: fmtStyle.color }}>{dim.confidenceRange}</p>
          </div>
        </div>

        {/* Parsing challenge */}
        <div className="mt-3 p-2.5 rounded-lg" style={{ background: fmtStyle.bg, opacity: 0.5 }}>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Parsing Challenge</p>
          <p className="text-[11px] text-gray-700 leading-relaxed">{dim.parsingChallenge}</p>
        </div>

        {/* Sources using this format */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {dim.sourcesUsing.map((source) => (
            <span key={source} className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable: failure modes + tools */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Failure Modes</p>
                <div className="space-y-1">
                  {dim.failureModes.map((mode) => (
                    <div key={mode} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span className="text-[11px] text-gray-600">{mode}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tools Required</p>
                <div className="space-y-1">
                  {dim.toolsRequired.map((tool) => (
                    <div key={tool} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span className="text-[11px] text-gray-600">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: dc.light }}>
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

      <div className="ml-[42px] mt-2 space-y-3">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Outcome</p>
          <span className="text-[10px] font-medium text-gray-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
            {dim.outcome}
          </span>
        </div>

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Complexity</p>
          <span className="text-[10px] font-medium text-gray-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
            {dim.complexity}
          </span>
        </div>

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Interaction</p>
          <span className="text-[10px] font-medium text-gray-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            {dim.interaction}
          </span>
        </div>
      </div>
    </motion.div>
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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: dc.light }}>
            <Layers className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.toolName}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.id}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ml-[42px] mt-2 space-y-3">
        {dim.states.map((state) => {
          const outcomeColor = state.outcome === 'success' ? 'green' : state.outcome === 'failure' ? 'red' : state.outcome === 'timeout' ? 'amber' : 'orange'
          const outcomeBg = `${outcomeColor}-50`
          const outcomeBorder = `${outcomeColor}-100`
          
          return (
            <div key={state.id} className="border-t pt-3 first:border-t-0 first:pt-0">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[10px] font-bold text-gray-900">{state.label}</p>
                <span className={`text-[9px] font-medium text-gray-700 bg-${outcomeBg} border border-${outcomeBorder} px-2 py-0.5 rounded-full`}>
                  {state.outcome}
                </span>
              </div>
              <div className="text-[9px] text-gray-600 space-y-1">
                <div><span className="font-medium">Operation:</span> {state.operation}</div>
                <div><span className="font-medium">Description:</span> {state.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function SummaryStats({ summaryText, accentColor }: { summaryText: string; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl border px-4 py-3 flex items-center gap-3"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}04` }}
    >
      <Layers className="w-4 h-4 shrink-0" style={{ color: accentColor }} aria-hidden="true" />
      <p className="text-xs text-gray-600 leading-relaxed">{summaryText}</p>
    </motion.div>
  )
}

// ─── Structural Discovery Canvas (V3 — Option D: Two-column + curved Bezier) ──

function StructuralDiscoveryCanvas({
  discoveries,
  dataSources,
  tasks,
  viewMode,
}: {
  discoveries: StructuralDiscovery[]
  dataSources: any[]
  tasks: any[]
  viewMode: 'business' | 'technical'
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredDiscovery, setHoveredDiscovery] = useState<string | null>(null)
  const [animatedCount, setAnimatedCount] = useState(0)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  // Fixed SVG coordinate space — viewBox matches this, preserveAspectRatio handles scaling
  const svgCoordW = 300

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Risk colors
  const riskColor: Record<string, string> = {
    green: '#22c55e',
    amber: '#f59e0b',
    red: '#ef4444',
  }
  const riskBg: Record<string, string> = {
    green: 'rgba(34,197,94,0.1)',
    amber: 'rgba(245,158,11,0.1)',
    red: 'rgba(239,68,68,0.1)',
  }

  // Layout constants
  const sourceColW = 220
  const taskColW = 300
  const headerH = 36
  const sourceCardH = 60
  const sourceGap = 10
  const taskCardH = 72
  const taskGap = 10
  const totalSourceH = dataSources.length * sourceCardH + (dataSources.length - 1) * sourceGap
  const totalTaskH = tasks.length * taskCardH + (tasks.length - 1) * taskGap
  const canvasH = Math.max(totalSourceH, totalTaskH, 360) + headerH
  const sourceOffsetY = headerH + (canvasH - headerH - totalSourceH) / 2
  const taskOffsetY = headerH + (canvasH - headerH - totalTaskH) / 2

  const sourceYCenter = (idx: number) => sourceOffsetY + idx * (sourceCardH + sourceGap) + sourceCardH / 2
  const taskYCenter = (idx: number) => taskOffsetY + idx * (taskCardH + taskGap) + taskCardH / 2

  // Build unique connections from discoveries
  const connections = discoveries.flatMap((d) => {
    const sourceIndices = d.affectedDataSources
      .map((sid) => dataSources.findIndex((s: any) => s.id === sid))
      .filter((i) => i >= 0)
    const taskIndices = d.affectedTasks
      .map((tid) => tasks.findIndex((t: any) => t.id === tid))
      .filter((i) => i >= 0)

    return sourceIndices.flatMap((si) =>
      taskIndices.map((ti) => ({
        key: `${d.id}-${si}-${ti}`,
        discoveryId: d.id,
        discoveryTitle: d.title,
        discoveryDesc: viewMode === 'technical' ? d.technicalDetail : d.description,
        riskLevel: d.riskLevel,
        sourceIdx: si,
        taskIdx: ti,
      }))
    )
  })

  // Deduplicate: keep highest risk for same source-task pair
  const riskPriority = { red: 3, amber: 2, green: 1 }
  const connMap = new Map<string, typeof connections[0]>()
  for (const conn of connections) {
    const pairKey = `${conn.sourceIdx}-${conn.taskIdx}`
    const existing = connMap.get(pairKey)
    if (!existing || riskPriority[conn.riskLevel as keyof typeof riskPriority] > riskPriority[existing.riskLevel as keyof typeof riskPriority]) {
      connMap.set(pairKey, conn)
    }
  }
  const uniqueConnections = Array.from(connMap.values())

  // Count connections per source for low-connection indicator
  const connectionsPerSource = dataSources.map((_: any, idx: number) =>
    uniqueConnections.filter((c) => c.sourceIdx === idx).length
  )

  // Stagger path animations — must count up to uniqueConnections.length
  const totalConns = uniqueConnections.length
  useEffect(() => {
    if (!isVisible) return
    if (animatedCount >= totalConns) return
    const delay = Math.max(80, 300 - totalConns * 8)
    const timer = setTimeout(() => setAnimatedCount((c) => c + 1), delay)
    return () => clearTimeout(timer)
  }, [isVisible, animatedCount, totalConns])

  // Generate cubic Bezier path in SVG coordinate space
  const makePath = (si: number, ti: number) => {
    const w = svgCoordW
    const x1 = 0
    const y1 = sourceYCenter(si)
    const x2 = w
    const y2 = taskYCenter(ti)
    const cx1 = w * 0.35
    const cx2 = w * 0.65
    return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
  }

  // Bezier midpoint for tooltip positioning (percentage-based for CSS positioning)
  const bezierMidpoint = (si: number, ti: number) => {
    const y1 = sourceYCenter(si)
    const y2 = taskYCenter(ti)
    return { xPct: 50, y: (y1 + y2) / 2 }
  }

  // Determine which connections to highlight on hover
  const hoveredConns = hoveredDiscovery
    ? uniqueConnections.filter((c) => c.discoveryId === hoveredDiscovery)
    : []
  const hoveredSourceIds = new Set(hoveredConns.map((c) => c.sourceIdx))
  const hoveredTaskIds = new Set(hoveredConns.map((c) => c.taskIdx))

  // Active discovery for tooltip
  const activeDiscovery = hoveredDiscovery
    ? discoveries.find((d) => d.id === hoveredDiscovery)
    : null

  // Hover handler that also computes tooltip position
  const handleHover = (discoveryId: string, sourceIdx: number, taskIdx: number) => {
    setHoveredDiscovery(discoveryId)
    const mid = bezierMidpoint(sourceIdx, taskIdx)
    setTooltipPos({ x: mid.xPct, y: mid.y })
  }
  const handleHoverEnd = () => {
    setHoveredDiscovery(null)
    setTooltipPos(null)
  }

  return (
    <div ref={containerRef} className="mt-12 pt-8 border-t border-gray-200">
      {/* Section title */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-1">Structural Discovery Canvas</h3>
        <p className="text-sm text-gray-500">
          Each line is an integration challenge the agent must handle. Hover any connection to see the details.
        </p>
      </motion.div>

      {/* Canvas container */}
      <div className="relative" style={{ height: canvasH + 24 }}>

        {/* ── Left column: Data Sources ── */}
        <div className="absolute left-0 top-0" style={{ width: sourceColW }}>
          {/* Column header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 mb-3 px-1"
            style={{ height: headerH - 12 }}
          >
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Data Sources</span>
            <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">{dataSources.length}</span>
          </motion.div>

          <div style={{ paddingTop: sourceOffsetY - headerH }}>
            {dataSources.map((source: any, idx: number) => {
              const connCount = connectionsPerSource[idx]
              const isLowConn = connCount <= 1
              const isSourceHovered = hoveredSourceIds.has(idx)
              return (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className="rounded-lg border px-3 py-2 text-xs transition-all duration-200"
                  style={{
                    height: sourceCardH,
                    marginBottom: idx < dataSources.length - 1 ? sourceGap : 0,
                    borderColor: isSourceHovered ? '#3b82f6' : '#dbeafe',
                    background: isSourceHovered ? '#eff6ff' : '#f0f7ff',
                    boxShadow: isSourceHovered ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{source.name}</p>
                      <p className="text-gray-500 mt-0.5">{source.format}</p>
                    </div>
                    {isLowConn && connCount === 0 && (
                      <span className="text-[8px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                        LOW RISK
                      </span>
                    )}
                  </div>
                  {viewMode === 'technical' && (
                    <p className="text-[9px] font-mono text-gray-400 mt-0.5">{source.id}</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Right column: Agent Tasks ── */}
        <div className="absolute right-0 top-0" style={{ width: taskColW }}>
          {/* Column header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 mb-3 px-1"
            style={{ height: headerH - 12 }}
          >
            <Target className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">Agent Tasks</span>
            <span className="text-[10px] font-semibold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
          </motion.div>

          <div style={{ paddingTop: taskOffsetY - headerH }}>
            {tasks.map((task: any, idx: number) => {
              const isTaskHovered = hoveredTaskIds.has(idx)
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className="rounded-lg border px-3 py-2 text-xs transition-all duration-200"
                  style={{
                    height: taskCardH,
                    marginBottom: idx < tasks.length - 1 ? taskGap : 0,
                    borderColor: isTaskHovered ? '#8b5cf6' : '#ede9fe',
                    background: isTaskHovered ? '#f5f3ff' : '#faf8ff',
                    boxShadow: isTaskHovered ? '0 0 0 2px rgba(139,92,246,0.3)' : 'none',
                  }}
                >
                  <p className="font-semibold text-gray-900">{task.name}</p>
                  <p className="text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                  {viewMode === 'technical' && (
                    <p className="text-[9px] font-mono text-gray-400 mt-0.5">{task.id}</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Center: SVG Bezier connections ── */}
        <div
          className="absolute top-0"
          style={{ left: sourceColW, right: taskColW, height: canvasH + 24 }}
        >
          {/* Hover hint (shows when nothing is hovered) */}
          <AnimatePresence>
            {!hoveredDiscovery && isVisible && animatedCount >= uniqueConnections.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] text-gray-400 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-100 z-10 pointer-events-none whitespace-nowrap"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                hover a line to explore
              </motion.div>
            )}
          </AnimatePresence>

          <svg
            width="100%"
            height={canvasH + 24}
            viewBox={`0 0 ${svgCoordW} ${canvasH + 24}`}
            preserveAspectRatio="none"
            className="overflow-visible"
            style={{ display: 'block' }}
          >
            {uniqueConnections.map((conn, idx) => {
              const isHovered = hoveredDiscovery === conn.discoveryId
              const isOtherHovered = hoveredDiscovery !== null && !isHovered
              const isAnimated = idx < animatedCount
              const pathD = makePath(conn.sourceIdx, conn.taskIdx)
              const color = riskColor[conn.riskLevel]
              const midY = (sourceYCenter(conn.sourceIdx) + taskYCenter(conn.taskIdx)) / 2
              const midX = svgCoordW / 2

              return (
                <g
                  key={conn.key}
                  onMouseEnter={() => handleHover(conn.discoveryId, conn.sourceIdx, conn.taskIdx)}
                  onMouseLeave={handleHoverEnd}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Invisible wider hit area */}
                  <path d={pathD} fill="none" stroke="transparent" strokeWidth="24" vectorEffect="non-scaling-stroke" />
                  {/* Visible path */}
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? 3 : 1.5}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isAnimated ? {
                      pathLength: 1,
                      opacity: isOtherHovered ? 0.12 : isHovered ? 1 : 0.55,
                    } : {}}
                    transition={{
                      pathLength: { duration: 0.6, ease: 'easeInOut' },
                      opacity: { duration: 0.2 },
                    }}
                  />
                  {/* Risk dot at midpoint */}
                  {isAnimated && (
                    <motion.circle
                      cx={midX}
                      cy={midY}
                      r={isHovered ? 5 : 3}
                      fill={color}
                      vectorEffect="non-scaling-stroke"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: isOtherHovered ? 0.12 : isHovered ? 1 : 0.6,
                        scale: isHovered ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.25, delay: isAnimated ? 0 : 0.5 }}
                    />
                  )}
                </g>
              )
            })}
          </svg>

          {/* ── Floating tooltip near the hovered line ── */}
          <AnimatePresence>
            {activeDiscovery && tooltipPos && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute z-20 w-[260px] rounded-lg border shadow-lg p-3 pointer-events-none -translate-x-1/2"
                style={{
                  left: `${tooltipPos.x}%`,
                  top: tooltipPos.y + 16,
                  borderColor: riskColor[activeDiscovery.riskLevel],
                  background: '#ffffff',
                }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="w-2 h-2 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: riskColor[activeDiscovery.riskLevel] }}
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-900 leading-tight">{activeDiscovery.title}</p>
                    <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-3">
                      {viewMode === 'technical' ? activeDiscovery.technicalDetail : activeDiscovery.description}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span
                        className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{
                          color: riskColor[activeDiscovery.riskLevel],
                          background: riskBg[activeDiscovery.riskLevel],
                        }}
                      >
                        {activeDiscovery.riskLevel} risk
                      </span>
                      <span className="text-[9px] text-gray-400">
                        {activeDiscovery.relationType}
                      </span>
                      <span className="text-[9px] text-gray-400 ml-auto">
                        {activeDiscovery.affectedTasks.length}T / {activeDiscovery.affectedDataSources.length}S
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Risk legend ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isVisible && animatedCount >= uniqueConnections.length ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
        className="mt-5 flex items-center gap-5 text-[11px] text-gray-500"
      >
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Risk Level</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          High ({discoveries.filter((d) => d.riskLevel === 'red').length})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
          Medium ({discoveries.filter((d) => d.riskLevel === 'amber').length})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          Low ({discoveries.filter((d) => d.riskLevel === 'green').length})
        </span>
        <span className="text-gray-400 ml-auto">
          {discoveries.length} challenges across {uniqueConnections.length} connections
        </span>
      </motion.div>
    </div>
  )
}

// ─── Interactive Structural Discovery Explorer (V3 Redesign) ─────────────────
// Click a data source, challenge, or task to see ONLY its connections.
// No spaghetti — one relationship at a time.

function StructuralDiscoveryExplorer({
  discoveries,
  dataSources,
  tasks,
  viewMode,
}: {
  discoveries: StructuralDiscovery[]
  dataSources: any[]
  tasks: any[]
  viewMode: 'business' | 'technical'
}) {
  const [selected, setSelected] = useState<{ type: 'source' | 'challenge' | 'task'; id: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Ref maps for each card DOM element
  const sourceRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const challengeRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const taskRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Connection line state — computed from actual DOM positions
  const [connections, setConnections] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string; key: string }[]>([])

  const riskColor: Record<string, string> = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' }
  const riskBg: Record<string, string> = { green: 'rgba(34,197,94,0.08)', amber: 'rgba(245,158,11,0.08)', red: 'rgba(239,68,68,0.08)' }

  // Determine which nodes are "active" based on selection
  const activeSourceIds = useMemo(() => {
    if (!selected) return new Set<string>()
    if (selected.type === 'source') return new Set([selected.id])
    if (selected.type === 'challenge') {
      const d = discoveries.find(x => x.id === selected.id)
      return new Set(d?.affectedDataSources ?? [])
    }
    const relevantDiscs = discoveries.filter(d => d.affectedTasks.includes(selected.id))
    return new Set(relevantDiscs.flatMap(d => d.affectedDataSources))
  }, [selected, discoveries])

  const activeChallengeIds = useMemo(() => {
    if (!selected) return new Set<string>()
    if (selected.type === 'challenge') return new Set([selected.id])
    if (selected.type === 'source') {
      return new Set(discoveries.filter(d => d.affectedDataSources.includes(selected.id)).map(d => d.id))
    }
    return new Set(discoveries.filter(d => d.affectedTasks.includes(selected.id)).map(d => d.id))
  }, [selected, discoveries])

  const activeTaskIds = useMemo(() => {
    if (!selected) return new Set<string>()
    if (selected.type === 'task') return new Set([selected.id])
    if (selected.type === 'challenge') {
      const d = discoveries.find(x => x.id === selected.id)
      return new Set(d?.affectedTasks ?? [])
    }
    const relevantDiscs = discoveries.filter(d => d.affectedDataSources.includes(selected.id))
    return new Set(relevantDiscs.flatMap(d => d.affectedTasks))
  }, [selected, discoveries])

  const hasSelection = selected !== null

  // Click outside to deselect
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelected(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Compute SVG connections from actual DOM positions
  const computeConnections = useCallback(() => {
    if (!hasSelection || !gridRef.current) {
      setConnections([])
      return
    }
    const gridRect = gridRef.current.getBoundingClientRect()
    const lines: typeof connections = []

    const getCenter = (el: HTMLDivElement | undefined, side: 'right' | 'left') => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: side === 'right' ? r.right - gridRect.left : r.left - gridRect.left,
        y: r.top - gridRect.top + r.height / 2,
      }
    }

    discoveries.forEach(d => {
      if (!activeChallengeIds.has(d.id)) return
      const chalEl = challengeRefs.current.get(d.id)

      // Source → Challenge connections
      d.affectedDataSources.forEach(sid => {
        if (!activeSourceIds.has(sid)) return
        const srcEl = sourceRefs.current.get(sid)
        const from = getCenter(srcEl, 'right')
        const to = getCenter(chalEl, 'left')
        if (from && to) {
          lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, color: riskColor[d.riskLevel] || '#94a3b8', key: `s-${sid}-c-${d.id}` })
        }
      })

      // Challenge → Task connections
      d.affectedTasks.forEach(tid => {
        if (!activeTaskIds.has(tid)) return
        const taskEl = taskRefs.current.get(tid)
        const from = getCenter(chalEl, 'right')
        const to = getCenter(taskEl, 'left')
        if (from && to) {
          lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, color: riskColor[d.riskLevel] || '#94a3b8', key: `c-${d.id}-t-${tid}` })
        }
      })
    })

    setConnections(lines)
  }, [hasSelection, activeChallengeIds, activeSourceIds, activeTaskIds, discoveries])

  // Recalculate connections whenever selection changes
  useLayoutEffect(() => {
    computeConnections()
  }, [computeConnections])

  // Also recalculate on window resize
  useEffect(() => {
    const onResize = () => computeConnections()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [computeConnections])

  const handleClick = (type: 'source' | 'challenge' | 'task', id: string) => {
    if (selected?.type === type && selected?.id === id) {
      setSelected(null)
    } else {
      setSelected({ type, id })
    }
  }

  const nodeOpacity = (isActive: boolean) => hasSelection ? (isActive ? 1 : 0.25) : 1
  const nodeBorder = (isActive: boolean, accent?: string) => hasSelection && isActive ? (accent || '#3b82f6') : '#e5e7eb'

  // Ref callback helpers
  const setSourceRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) sourceRefs.current.set(id, el)
    else sourceRefs.current.delete(id)
  }, [])
  const setChallengeRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) challengeRefs.current.set(id, el)
    else challengeRefs.current.delete(id)
  }, [])
  const setTaskRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) taskRefs.current.set(id, el)
    else taskRefs.current.delete(id)
  }, [])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border bg-white p-6"
      style={{ borderColor: '#e5e7eb' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Structural Discovery Map</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Click any node to explore its connections. {discoveries.length} challenges across {dataSources.length} data sources and {tasks.length} tasks.
          </p>
        </div>
        {hasSelection && (
          <button
            onClick={() => setSelected(null)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-gray-300"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* 3-Column Explorer with SVG overlay */}
      <div ref={gridRef} className="relative">
        {/* SVG layer for bezier curves — sized to match grid */}
        <svg
          ref={svgRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <AnimatePresence>
            {connections.map(conn => {
              const dx = Math.abs(conn.x2 - conn.x1)
              return (
                <motion.path
                  key={conn.key}
                  d={`M ${conn.x1} ${conn.y1} C ${conn.x1 + dx * 0.4} ${conn.y1}, ${conn.x2 - dx * 0.4} ${conn.y2}, ${conn.x2} ${conn.y2}`}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth={2}
                  strokeOpacity={0.55}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              )
            })}
          </AnimatePresence>
        </svg>

        {/* Grid layout — 3 equal-flex columns */}
        <div className="grid grid-cols-3 gap-6">
          {/* Data Sources column */}
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Data Sources</div>
            <div className="space-y-2">
              {dataSources.map((src: any) => {
                const isActive = !hasSelection || activeSourceIds.has(src.id)
                return (
                  <div
                    key={src.id}
                    ref={(el) => setSourceRef(src.id, el)}
                    onClick={() => handleClick('source', src.id)}
                    className="rounded-lg border px-3 py-2.5 cursor-pointer transition-all duration-200 hover:shadow-sm"
                    style={{
                      borderColor: nodeBorder(isActive, '#3b82f6'),
                      opacity: nodeOpacity(isActive),
                      boxShadow: selected?.type === 'source' && selected?.id === src.id ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
                      background: selected?.type === 'source' && selected?.id === src.id ? 'rgba(59,130,246,0.04)' : '#fff',
                    }}
                  >
                    <div className="text-xs font-medium text-gray-900 truncate">{src.name || src.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate">{src.format || (Array.isArray(src.detectedFormats) ? src.detectedFormats.join(', ') : src.detectedFormats) || ''}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Challenges column */}
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Challenges</div>
            <div className="space-y-2">
              {discoveries.map((d) => {
                const isActive = !hasSelection || activeChallengeIds.has(d.id)
                const color = riskColor[d.riskLevel] || '#94a3b8'
                return (
                  <div
                    key={d.id}
                    ref={(el) => setChallengeRef(d.id, el)}
                    onClick={() => handleClick('challenge', d.id)}
                    className="rounded-lg border px-3 py-2.5 cursor-pointer transition-all duration-200 hover:shadow-sm"
                    style={{
                      borderColor: nodeBorder(isActive, color),
                      opacity: nodeOpacity(isActive),
                      boxShadow: selected?.type === 'challenge' && selected?.id === d.id ? `0 0 0 2px ${color}40` : 'none',
                      background: selected?.type === 'challenge' && selected?.id === d.id ? riskBg[d.riskLevel] : '#fff',
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs font-medium text-gray-900 truncate">{d.title}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 line-clamp-2">
                      {viewMode === 'technical' ? d.technicalDetail : d.description}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-medium uppercase" style={{ color }}>{d.riskLevel} risk</span>
                      <span className="text-[9px] text-gray-400">{d.relationType}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tasks column */}
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Tasks</div>
            <div className="space-y-2">
              {tasks.map((task: any) => {
                const isActive = !hasSelection || activeTaskIds.has(task.id)
                return (
                  <div
                    key={task.id}
                    ref={(el) => setTaskRef(task.id, el)}
                    onClick={() => handleClick('task', task.id)}
                    className="rounded-lg border px-3 py-2.5 cursor-pointer transition-all duration-200 hover:shadow-sm"
                    style={{
                      borderColor: nodeBorder(isActive, '#7c3aed'),
                      opacity: nodeOpacity(isActive),
                      boxShadow: selected?.type === 'task' && selected?.id === task.id ? '0 0 0 2px rgba(124,58,237,0.3)' : 'none',
                      background: selected?.type === 'task' && selected?.id === task.id ? 'rgba(124,58,237,0.04)' : '#fff',
                    }}
                  >
                    <div className="text-xs font-medium text-gray-900 truncate">{task.name || task.id}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate">{task.triggerCondition || task.description || ''}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Risk summary */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t text-[10px]" style={{ borderColor: '#f3f4f6' }}>
        <span className="font-medium text-gray-500 uppercase tracking-wider">Risk Level</span>
        {(['red', 'amber', 'green'] as const).map(level => {
          const count = discoveries.filter(d => d.riskLevel === level).length
          return (
            <span key={level} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: riskColor[level] }} />
              {level === 'red' ? 'High' : level === 'amber' ? 'Medium' : 'Low'} ({count})
            </span>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContextDimensionsV3() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const [activeTab, setActiveTab] = useState<DimensionTab>('task')

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const dimensionsDataV3 = activeTileId ? getDimensionAnalysisDataV3(activeTileId) : null
  const dimensionsData = dimensionsDataV3 ?? (activeTileId ? getDimensionAnalysisData(activeTileId) : null)

  // Check if this is a V3-supported tile
  const isV3Tile = activeTileId ? isV3SupportedTile(activeTileId) : false

  // Load V3 data if supported
  const v3ContextData = isV3Tile && activeTileId ? getContextDefinitionDataV3(resolveV3TileId(activeTileId, 'contextDefinition')) : null
  const v3Discoveries = isV3Tile && activeTileId ? getStructuralDiscoveries(resolveV3TileId(activeTileId, 'structuralDiscovery')) : null

  const counts = useMemo<Record<DimensionTab, number>>(() => {
    if (!dimensionsData) return { task: 0, data: 0, output: 0, tool: 0 }
    return {
      task: dimensionsData.taskDimensions.length,
      data: (dimensionsData.formatDimensions?.length ?? 0) + dimensionsData.dataDimensions.length,
      output: (dimensionsData.responseDimensions ?? dimensionsData.outputDimensions).length,
      tool: dimensionsData.toolDimensions.length,
    }
  }, [dimensionsData])

  const accentColor = tile?.color ?? '#3b82f6'

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
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dimension Analysis</h2>
          <p className="text-sm text-gray-500">Decomposing your agent into capability dimensions</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center"
        >
          <Layers className="w-8 h-8 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-400">Dimensional data for this use case is being generated.</p>
        </motion.div>
      </div>
    )
  }

  const activeTabDef = TABS.find((t) => t.id === activeTab)!

  return (
    <div className="py-8 space-y-6">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Stage header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dimension Analysis</h2>
        <p className="text-sm text-gray-500">Decomposing your agent into capability dimensions</p>
      </motion.div>

      {/* Tab bar */}
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor={accentColor} counts={counts} />

      {/* Goal traceability ribbon */}
      <GoalRibbon text={activeTabDef.goalLink} accentColor={activeTabDef.dimensionColor} />

      {/* Tab panels */}
      <div role="tabpanel" id={`dim-panel-${activeTab}`} aria-labelledby={`dim-tab-${activeTab}`}>
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
                Each task dimension represents a specific sub-capability sliced from parent tasks. Intent categories show which types of queries activate each task.
              </p>
              {dimensionsData.taskDimensions.map((dim, i) => (
                <TaskDimensionCard key={dim.id} dim={dim} delay={0.05 + i * 0.06} viewMode={viewMode} />
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
              {/* Format Dimensions (primary view) */}
              {dimensionsData.formatDimensions && dimensionsData.formatDimensions.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Format Dimensions</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      The structural data formats the agent must parse. Each format has distinct extraction challenges, failure modes, and confidence characteristics.
                    </p>
                  </div>
                  {dimensionsData.formatDimensions.map((dim, i) => (
                    <FormatDimensionCard key={dim.id} dim={dim} delay={0.05 + i * 0.06} />
                  ))}
                </div>
              )}

              {/* Divider between formats and sources */}
              {dimensionsData.formatDimensions && dimensionsData.formatDimensions.length > 0 && (
                <div className="pt-2 border-t border-gray-200" />
              )}

              {/* Source Dimensions — each sub-topic is its own dimension */}
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Source Dimensions</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Each data topic the agent understands, grouped by source. Depth shows how well the agent can reason about that topic.
                  </p>
                </div>
                <SourceDimensionsGroup dimensions={dimensionsData.dataDimensions} delay={0.05} />
              </div>
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
                Response dimensions decompose agent outputs along three axes: outcome, complexity, and interaction style.
              </p>
              {(dimensionsData.responseDimensions ?? dimensionsData.outputDimensions).map((dim, i) => (
                <OutputDimensionCard key={dim.id} dim={dim} delay={0.05 + i * 0.06} viewMode={viewMode} />
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
              </p>
              {dimensionsData.toolDimensions.map((dim, i) => (
                <ToolDimensionCard key={dim.id} dim={dim} delay={0.05 + i * 0.06} viewMode={viewMode} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <SummaryStats summaryText={dimensionsData.summaryText} accentColor={accentColor} />
    </div>

      {/* V3 Structural Discovery Canvas — hidden behind feature flag while redesigning */}
      {SHOW_STRUCTURAL_DISCOVERY_GRAPH && isV3Tile && v3ContextData && v3Discoveries && (
        <div className="px-4 sm:px-6">
          <StructuralDiscoveryCanvas
            discoveries={v3Discoveries}
            dataSources={v3ContextData.dataSources}
            tasks={v3ContextData.tasks}
            viewMode={viewMode}
          />
        </div>
      )}

      {/* V3 Interactive Structural Discovery Explorer — full-width */}
      {!SHOW_STRUCTURAL_DISCOVERY_GRAPH && isV3Tile && v3ContextData && v3Discoveries && (
        <div className="px-4 sm:px-6">
          <StructuralDiscoveryExplorer
            discoveries={v3Discoveries}
            dataSources={v3ContextData.dataSources}
            tasks={v3ContextData.tasks}
            viewMode={viewMode}
          />
        </div>
      )}
    </div>
  )
}
