import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  GitBranch,
  Database,
  MessageSquare,
  Layers,
  ArrowRight,
  BookOpen,
  AlertTriangle,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getDimensionAnalysisData } from '@/lib/agent/dimensionAnalysisData'
import type {
  FlowDimension,
  DataDimension,
  ResponseDimension,
  OutputPreference,
} from '@/store/agentTypes'

// ─── Tab Definitions ──────────────────────────────────────────────────────────

type DimensionTab = 'flow' | 'data' | 'response'

interface TabDef {
  id: DimensionTab
  label: string
  icon: React.ElementType
  goalLink: string
}

const TABS: TabDef[] = [
  { id: 'flow', label: 'Flow Dimensions', icon: GitBranch, goalLink: 'How the agent thinks' },
  { id: 'data', label: 'Data Dimensions', icon: Database, goalLink: 'What the agent knows' },
  { id: 'response', label: 'Response Dimensions', icon: MessageSquare, goalLink: 'How the agent responds' },
]

// ─── Confidence Colors ────────────────────────────────────────────────────────

const CONFIDENCE_META: Record<
  'high' | 'medium' | 'low',
  { label: string; color: string; bg: string; border: string }
> = {
  high: { label: 'High', color: '#166534', bg: '#dcfce7', border: '#86efac' },
  medium: { label: 'Medium', color: '#92400e', bg: '#fef3c7', border: '#fde047' },
  low: { label: 'Low', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
}

// ─── Complexity Colors ────────────────────────────────────────────────────────

const COMPLEXITY_META: Record<
  'simple' | 'moderate' | 'complex',
  { label: string; color: string; bg: string; border: string }
> = {
  simple: { label: 'Simple', color: '#166534', bg: '#dcfce7', border: '#86efac' },
  moderate: { label: 'Moderate', color: '#92400e', bg: '#fef3c7', border: '#fde047' },
  complex: { label: 'Complex', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
}

// ─── Output Mode Labels ───────────────────────────────────────────────────────

const OUTPUT_MODE_LABELS: Record<OutputPreference, string> = {
  'short-answer': 'Short Answer',
  'detailed-explanation': 'Detailed Explanation',
  'summary-report': 'Summary Report',
  'action-list': 'Action List',
  'data-table': 'Data Table',
  'visual-chart': 'Visual Chart',
  'step-by-step': 'Step-by-Step',
  comparison: 'Comparison',
  'code-snippet': 'Code Snippet',
}

const OUTPUT_MODE_COLORS: Record<OutputPreference, { bg: string; text: string; border: string }> = {
  'short-answer': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'detailed-explanation': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  'summary-report': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  'action-list': { bg: '#fce7f3', text: '#be185d', border: '#fbcfe8' },
  'data-table': { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  'visual-chart': { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  'step-by-step': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  comparison: { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' },
  'code-snippet': { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const panelVariants: Variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

// ─── Depth Meter ──────────────────────────────────────────────────────────────

function DepthMeter({ depth, maxDepth = 5 }: { depth: number; maxDepth?: number }) {
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
            background: i < depth ? '#3b82f6' : '#e5e7eb',
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

// ─── Flow Dimension Card ──────────────────────────────────────────────────────

function FlowDimensionCard({
  dim,
  accentColor,
  delay,
  viewMode,
}: {
  dim: FlowDimension
  accentColor: string
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const conf = CONFIDENCE_META[dim.confidence]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: `${accentColor}15` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${accentColor}10` }}
          >
            <GitBranch className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />
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
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}
        >
          {conf.label}
        </span>
      </div>

      {/* Intent categories */}
      <div className="ml-[42px] mt-2">
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
    </motion.div>
  )
}

// ─── Data Dimension Card (Knowledge Map) ──────────────────────────────────────

function DataDimensionCard({
  dim,
  accentColor,
  delay,
  viewMode,
}: {
  dim: DataDimension
  accentColor: string
  delay: number
  viewMode: 'business' | 'technical'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: `${accentColor}15` }}
    >
      {/* Header with depth meter */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${accentColor}10` }}
          >
            <BookOpen className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />
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
                className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full"
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

// ─── Response Dimension Card ──────────────────────────────────────────────────

function ResponseDimensionCard({
  dim,
  accentColor,
  delay,
  viewMode,
}: {
  dim: ResponseDimension
  accentColor: string
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const comp = COMPLEXITY_META[dim.complexity]
  const modeColors = OUTPUT_MODE_COLORS[dim.outputMode]
  const modeLabel = OUTPUT_MODE_LABELS[dim.outputMode]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: `${accentColor}15` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: modeColors.bg, border: `1px solid ${modeColors.border}` }}
          >
            <MessageSquare className="w-4 h-4" style={{ color: modeColors.text }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900">{modeLabel}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.outputMode}
                </span>
              )}
            </div>
          </div>
        </div>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: comp.bg, color: comp.color, border: `1px solid ${comp.border}` }}
        >
          {comp.label}
        </span>
      </div>

      <div className="ml-[42px] space-y-2.5 mt-2">
        {/* User profiles requiring this output */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Required By
          </p>
          <div className="flex flex-wrap gap-1">
            {dim.userProfilesRequiring.map((profile) => (
              <span
                key={profile}
                className="text-[10px] font-medium text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full"
              >
                {profile}
              </span>
            ))}
          </div>
        </div>

        {/* Example output */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Example Output
          </p>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
            <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap font-mono">
              {dim.exampleOutput}
            </p>
          </div>
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
      {/* Sliding indicator */}
      <motion.div
        className="absolute bottom-0 h-[2px] rounded-full"
        style={{ background: accentColor }}
        animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const Icon = tab.icon
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
              isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tab.label}</span>
            <span
              className="min-w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: isActive ? `${accentColor}12` : '#f3f4f6',
                color: isActive ? accentColor : '#9ca3af',
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
            ? 'Three-dimensional analysis: how the agent processes requests (flow), what knowledge it draws from (data), and how it formats responses. Each dimension drives the pattern combinations in the next stage.'
            : 'Three-axis dimensional decomposition: (1) Flow dimensions identify capability lanes with intent classification and confidence scoring, (2) Data dimensions build a knowledge topology with depth profiling across sub-topics, entity extraction, and domain linkage, (3) Response dimensions map output modalities to user profiles with complexity tiers. The resulting tensor drives combinatorial pattern enumeration.'}
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
  const [activeTab, setActiveTab] = useState<DimensionTab>('flow')

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const dimensionsData = activeTileId ? getDimensionAnalysisData(activeTileId) : null
  const accentColor = tile?.color ?? '#3b82f6'

  const counts = useMemo<Record<DimensionTab, number>>(() => {
    if (!dimensionsData) return { flow: 0, data: 0, response: 0 }
    return {
      flow: dimensionsData.flowDimensions.length,
      data: dimensionsData.dataDimensions.length,
      response: dimensionsData.responseDimensions.length,
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
      <GoalRibbon text={activeTabDef.goalLink} accentColor={accentColor} />

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`dim-panel-${activeTab}`}
        aria-labelledby={`dim-tab-${activeTab}`}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'flow' && (
            <motion.div
              key="flow"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Each flow dimension represents a distinct capability lane the agent follows when
                processing user requests. Intent categories show which types of queries activate
                each lane.
              </p>
              {dimensionsData.flowDimensions.map((dim, i) => (
                <FlowDimensionCard
                  key={dim.id}
                  dim={dim}
                  accentColor={accentColor}
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
                  accentColor={accentColor}
                  delay={0.05 + i * 0.06}
                  viewMode={viewMode}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'response' && (
            <motion.div
              key="response"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                How the agent formats its outputs. Each response dimension maps an output mode to
                the user profiles that require it, with complexity classification and example output.
              </p>
              {dimensionsData.responseDimensions.map((dim, i) => (
                <ResponseDimensionCard
                  key={dim.id}
                  dim={dim}
                  accentColor={accentColor}
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
