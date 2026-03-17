'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  GitBranch,
  Database,
  Users,
  Layers,
  ArrowRight,
  BookOpen,
  Target,
  ChevronDown,
} from 'lucide-react'
import { AgentTooltip } from '@/components/agent/AgentTooltip'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getDimensionAnalysisData } from '@/lib/agent/dimensionAnalysisData'
import { getDimensionAnalysisDataV3 } from '@/lib/agent/dimensionAnalysisDataV3'
import { isV3SupportedTile, resolveV3TileId } from '@/lib/agent/v3TileResolver'
import { getContextDefinitionDataV3 } from '@/lib/agent/contextDefinitionDataV3'
import { getStructuralDiscoveries, getRiskTierSummary } from '@/lib/agent/structuralDiscoveryDataV3'
import type {
  TaskDimension,
  DataDimension,
  OutputDimension,
  ToolDimension,
} from '@/store/agentTypes'
import { DIMENSION_COLORS } from '@/store/agentTypes'
import type { StructuralDiscovery, RiskTierSummary } from '@/lib/agent/structuralDiscoveryDataV3'

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
  { id: 'output', label: 'Output Dimensions', icon: Users, goalLink: 'What the agent produces', dimensionColor: DIMENSION_COLORS.output.primary },
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

// ─── Depth Meter ──────────────────────────────────────────────────────────────

function DepthMeter({ depth, maxDepth = 5, color }: { depth: number; maxDepth?: number; color?: string }) {
  const fillColor = color ?? DIMENSION_COLORS.data.primary
  return (
    <div className="flex items-center gap-1" role="meter" aria-label={`Depth: ${depth} out of ${maxDepth}`}>
      {Array.from({ length: maxDepth }, (_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-sm transition-colors"
          style={{ background: i < depth ? fillColor : '#e5e7eb' }}
        />
      ))}
      <span className="text-[10px] text-gray-400 ml-1">{depth}/{maxDepth}</span>
    </div>
  )
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
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: dc.light }}>
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

      <div className="ml-[42px] space-y-3">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sub-Topics</p>
          <div className="space-y-1">
            {dim.subTopics.map((st) => (
              <div key={st.name} className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">{st.name}</span>
                <DepthMeter depth={st.depth} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Key Entities</p>
          <div className="flex flex-wrap gap-1">
            {dim.keyEntities.map((entity) => (
              <span key={entity} className="text-[10px] font-medium text-gray-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                {entity}
              </span>
            ))}
          </div>
        </div>
      </div>
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

// ─── Structural Discovery Canvas (V3 WOW MOMENT) ──────────────────────────────

function StructuralDiscoveryCanvas({
  discoveries,
  dataSources,
  tasks,
  riskTiers,
  viewMode,
}: {
  discoveries: StructuralDiscovery[]
  dataSources: any[]
  tasks: any[]
  riskTiers: RiskTierSummary
  viewMode: 'business' | 'technical'
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeConnectionIndex, setActiveConnectionIndex] = useState(-1)

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

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Orchestrate connection animations sequentially
  useEffect(() => {
    if (!isVisible) return

    if (activeConnectionIndex === -1) {
      // Start first animation immediately
      setActiveConnectionIndex(0)
      return
    }

    if (activeConnectionIndex >= discoveries.length) return

    const timer = setTimeout(() => {
      setActiveConnectionIndex((prev) => prev + 1)
    }, 1200) // 800ms draw + 400ms wait

    return () => clearTimeout(timer)
  }, [isVisible, activeConnectionIndex, discoveries.length])

  // Risk color mapping
  const riskColorMap = {
    green: '#22c55e',
    amber: '#f59e0b',
    red: '#ef4444',
  }

  return (
    <div ref={containerRef} className="space-y-8 mt-12 pt-8 border-t border-gray-200">
      {/* Section title */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">Structural Discovery Canvas</h3>
        <p className="text-sm text-gray-500">
          Connections between data sources and tasks that reveal where your agent will face integration challenges.
        </p>
      </motion.div>

      {/* Main canvas layout: Left | SVG | Right */}
      <div className="grid grid-cols-3 gap-6 min-h-[400px] items-start">
        {/* Left panel: Data Sources */}
        <motion.div
          initial={isVisible ? { opacity: 0, x: -20 } : {}}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Data Sources</p>
          {dataSources.map((source) => (
            <div key={source.id} className="p-3 rounded-lg border border-gray-200 bg-blue-50 text-xs">
              <p className="font-semibold text-gray-900">{source.name}</p>
              <p className="text-gray-600 mt-1">{source.format}</p>
            </div>
          ))}
        </motion.div>

        {/* Center: SVG Canvas with animated connections */}
        <motion.div
          initial={isVisible ? { opacity: 0 } : {}}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="col-span-1"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 400"
            preserveAspectRatio="none"
            className="w-full h-full min-h-[400px] bg-white rounded-lg border border-gray-200"
          >
            <defs>
              <marker
                id="arrowGreen"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
              </marker>
              <marker
                id="arrowAmber"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
              </marker>
              <marker
                id="arrowRed"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* Animated connection lines */}
            {isVisible &&
              discoveries.map((discovery, idx) => {
                const shouldDraw = idx <= activeConnectionIndex
                const startY = 50 + (idx % 4) * 80
                const endY = 50 + (idx % 3) * 120

                return (
                  <g key={discovery.id}>
                    {/* Animated path */}
                    <motion.line
                      x1="20"
                      y1={startY}
                      x2="180"
                      y2={endY}
                      stroke={riskColorMap[discovery.riskLevel]}
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={shouldDraw ? { pathLength: 1 } : { pathLength: 0 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                      markerEnd={`url(#arrow${discovery.riskLevel.charAt(0).toUpperCase() + discovery.riskLevel.slice(1)})`}
                      vectorEffect="non-scaling-stroke"
                    />

                    {/* Marching ants after line completes */}
                    {shouldDraw && (
                      <motion.line
                        x1="20"
                        y1={startY}
                        x2="180"
                        y2={endY}
                        stroke={riskColorMap[discovery.riskLevel]}
                        strokeWidth="2"
                        strokeDasharray="6 5"
                        opacity="0.6"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: -11 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}

                    {/* Annotation label */}
                    {shouldDraw && (
                      <motion.foreignObject
                        x="40"
                        y={startY + (endY - startY) / 2 - 15}
                        width="140"
                        height="50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.8,
                        }}
                      >
                        <div className="text-[8px] font-semibold text-gray-700 whitespace-normal break-words leading-tight">{discovery.title}</div>
                      </motion.foreignObject>
                    )}
                  </g>
                )
              })}
          </svg>
        </motion.div>

        {/* Right panel: Tasks */}
        <motion.div
          initial={isVisible ? { opacity: 0, x: 20 } : {}}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tasks</p>
          {tasks.slice(0, 4).map((task) => (
            <div key={task.id} className="p-3 rounded-lg border border-gray-200 bg-amber-50 text-xs">
              <p className="font-semibold text-gray-900">{task.name}</p>
              <p className="text-gray-600 mt-1">{task.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Risk Tier Summary */}
      <motion.div
        initial={isVisible ? { opacity: 0, y: 12 } : {}}
        animate={isVisible && activeConnectionIndex >= discoveries.length - 1 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="space-y-3 mt-8 pt-6 border-t border-gray-200"
      >
        <p className="text-sm font-bold text-gray-700">Risk Tier Summary</p>

        {/* Green Tier */}
        <RiskTierCard
          riskLevel="green"
          label={riskTiers.green.label}
          count={riskTiers.green.count}
          items={riskTiers.green.items}
          startDelay={activeConnectionIndex >= discoveries.length - 1 ? 0 : 999}
          viewMode={viewMode}
        />

        {/* Amber Tier */}
        <RiskTierCard
          riskLevel="amber"
          label={riskTiers.amber.label}
          count={riskTiers.amber.count}
          items={riskTiers.amber.items}
          startDelay={activeConnectionIndex >= discoveries.length - 1 ? 0.3 : 999}
          viewMode={viewMode}
        />

        {/* Red Tier */}
        <RiskTierCard
          riskLevel="red"
          label={riskTiers.red.label}
          count={riskTiers.red.count}
          items={riskTiers.red.items}
          startDelay={activeConnectionIndex >= discoveries.length - 1 ? 0.6 : 999}
          viewMode={viewMode}
          withPulse
        />
      </motion.div>
    </div>
  )
}

// ─── Count Badge with Animated Counter ─────────────────────────────────────────

function CountBadge({
  count,
  bgColor,
  textColor,
  startDelay,
}: {
  count: number
  bgColor: string
  textColor: string
  startDelay: number
}) {
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    if (startDelay >= 999) return

    const startTime = Date.now() + startDelay * 1000
    const duration = 600 // 600ms animation

    const animate = () => {
      const elapsed = Date.now() - startTime
      if (elapsed >= duration) {
        setDisplayCount(count)
      } else {
        const progress = elapsed / duration
        setDisplayCount(Math.floor(count * progress))
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [count, startDelay])

  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
      style={{ background: bgColor, color: textColor }}
    >
      {displayCount}
    </div>
  )
}

// ─── Risk Tier Card ───────────────────────────────────────────────────────────

function RiskTierCard({
  riskLevel,
  label,
  count,
  items,
  startDelay,
  viewMode,
  withPulse,
}: {
  riskLevel: 'green' | 'amber' | 'red'
  label: string
  count: number
  items: StructuralDiscovery[]
  startDelay: number
  viewMode: 'business' | 'technical'
  withPulse?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const riskColorMap = {
    green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', light: '#dcfce7' },
    amber: { bg: '#fffbeb', border: '#fde047', text: '#92400e', light: '#fef3c7' },
    red: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', light: '#fee2e2' },
  }
  const colors = riskColorMap[riskLevel]

  return (
    <motion.div
      initial={startDelay < 999 ? { opacity: 0, y: 8 } : {}}
      animate={startDelay < 999 ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: startDelay }}
      className={`rounded-lg border p-4 ${withPulse ? 'relative overflow-hidden' : ''}`}
      style={{ borderColor: colors.border, background: colors.bg }}
    >
      {/* Subtle pulse glow for red tier */}
      {withPulse && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }}
        />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-3">
          <CountBadge
            count={count}
            bgColor={colors.light}
            textColor={colors.text}
            startDelay={startDelay}
          />
          <p className="font-semibold text-gray-900">{label}</p>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: colors.text }} aria-hidden="true" />
        </motion.div>
      </button>

      {/* Expandable detail */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t relative z-10"
            style={{ borderColor: colors.border }}
          >
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="text-xs">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-gray-600 mt-0.5">{viewMode === 'technical' ? item.technicalDetail : item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const v3RiskTiers = isV3Tile && activeTileId ? getRiskTierSummary(resolveV3TileId(activeTileId, 'structuralDiscovery')) : null

  const counts = useMemo<Record<DimensionTab, number>>(() => {
    if (!dimensionsData) return { task: 0, data: 0, output: 0, tool: 0 }
    return {
      task: dimensionsData.taskDimensions.length,
      data: dimensionsData.dataDimensions.length,
      output: dimensionsData.outputDimensions.length,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
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
              <p className="text-xs text-gray-500 leading-relaxed">
                Knowledge map showing what the agent knows, how deep its understanding goes for each topic, and which sources contribute.
              </p>
              {dimensionsData.dataDimensions.map((dim, i) => (
                <DataDimensionCard key={dim.id} dim={dim} delay={0.05 + i * 0.06} viewMode={viewMode} />
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
                Output dimensions decompose agent outputs along three axes: outcome, complexity, and interaction style.
              </p>
              {dimensionsData.outputDimensions.map((dim, i) => (
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

      {/* V3 Structural Discovery Canvas (WOW MOMENT) */}
      {isV3Tile && v3ContextData && v3Discoveries && v3RiskTiers && (
        <StructuralDiscoveryCanvas
          discoveries={v3Discoveries}
          dataSources={v3ContextData.dataSources}
          tasks={v3ContextData.tasks}
          riskTiers={v3RiskTiers}
          viewMode={viewMode}
        />
      )}
    </div>
  )
}
