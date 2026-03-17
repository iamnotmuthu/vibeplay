import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Database,
  MessageSquareText,
  Wrench,
  Plus,
  Info,
  Pencil,
  Target,
  Zap,
} from 'lucide-react'
import { AgentTooltip } from '@/components/agent/AgentTooltip'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { getContextDefinitionDataV3 } from '@/lib/agent/contextDefinitionDataV3'
import { getGoalData } from '@/lib/agent/goalData'
import { resolveV3TileId } from '@/lib/agent/v3TileResolver'
import type { AgentTaskV3, DataSourceV3, ResponseTypeV3, AgentToolV3 } from '@/lib/agent/contextDefinitionDataV3'
import { DIMENSION_COLORS } from '@/store/agentTypes'

// ─── V3 Use Case Color Mapping ──────────────────────────────────────────────

const V3_TILE_COLORS: Record<string, string> = {
  'doc-intelligence': '#0369a1',
  'saas-copilot': '#7c3aed',
  'consumer-chat': '#059669',
  'faq-knowledge': '#d97706',
}

// ─── Tab Configuration ──────────────────────────────────────────────────────

type ContextTab = 'tasks' | 'data-sources' | 'response-types' | 'tools'

interface TabDef {
  id: ContextTab
  label: string
  icon: React.ElementType
  goalLink: string
  dimensionColor?: string
}

const TABS: TabDef[] = [
  { id: 'tasks', label: 'Tasks', icon: Target, goalLink: 'What the agent does', dimensionColor: DIMENSION_COLORS.task.primary },
  { id: 'data-sources', label: 'Data Sources', icon: Database, goalLink: 'Knowledge it uses', dimensionColor: DIMENSION_COLORS.data.primary },
  { id: 'response-types', label: 'Response Types', icon: MessageSquareText, goalLink: 'What it produces', dimensionColor: DIMENSION_COLORS.userProfile.primary },
  { id: 'tools', label: 'Tools', icon: Wrench, goalLink: 'Capabilities available' },
]

// ─── Goal Traceability Ribbon ───────────────────────────────────────────────

interface RibbonConfig {
  title: string
  description: string
}

function GoalRibbon({
  goalStatement,
  activeTab,
  accentColor,
}: {
  goalStatement: string
  activeTab: ContextTab
  accentColor: string
}) {
  const ribbonConfigs: Record<ContextTab, RibbonConfig> = {
    'tasks': {
      title: 'WHAT THE AGENT DOES',
      description: goalStatement.length > 90 ? goalStatement.slice(0, 90) + '...' : goalStatement,
    },
    'data-sources': {
      title: 'KNOWLEDGE IT USES',
      description: 'Data sources the agent reads from to complete its tasks',
    },
    'response-types': {
      title: 'WHAT IT PRODUCES',
      description: 'Output formats and outcome states for each response type',
    },
    'tools': {
      title: 'CAPABILITIES AVAILABLE',
      description: 'External services and APIs the agent can invoke',
    },
  }

  const config = ribbonConfigs[activeTab]

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border px-3.5 py-2.5 flex items-start gap-2.5"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}04` }}
    >
      <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
          {config.title}
        </p>
        <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5" title={config.description}>
          {config.description}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Tab Bar ────────────────────────────────────────────────────────────────

function TabBar({
  tabs,
  activeTab,
  onTabChange,
  counts,
  accentColor,
}: {
  tabs: TabDef[]
  activeTab: ContextTab
  onTabChange: (tab: ContextTab) => void
  counts: Record<ContextTab, number>
  accentColor: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const activeBtn = containerRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      })
    }
  }, [activeTab])

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
      const nextBtn = containerRef.current?.querySelector(`[data-tab="${tabIds[nextIndex]}"]`) as HTMLElement
      nextBtn?.focus()
    }
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-gray-200"
        role="tablist"
        aria-label="Context definition sections"
        onKeyDown={handleTabKeyDown}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const tabColor = tab.dimensionColor ?? accentColor
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              data-tab={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative shrink-0 cursor-pointer"
              style={{
                color: isActive ? tabColor : '#9ca3af',
              }}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5"
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
      <motion.div
        className="absolute bottom-0 h-[2px] rounded-full"
        style={{ background: (tabs.find((t) => t.id === activeTab)?.dimensionColor) ?? accentColor }}
        animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </div>
  )
}

// ─── Stage Explainer ────────────────────────────────────────────────────

function ContextExplainer({ viewMode }: { viewMode: 'business' | 'technical' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
    >
      <div className="flex items-start gap-3">
        <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-gray-700 leading-relaxed">
          {viewMode === 'business'
            ? 'The operational foundation of your agent. Define step-by-step instructions, data sources it can access, response types it can produce, which tools are available, and what boundaries it must respect. This is where you set the capabilities and constraints.'
            : 'Six-vector operational specification: instruction graph (routing rules, escalation conditions), datasource bindings (format, access protocol, metadata), response type matrix (outcome states, probability distributions), tool capability matrix (4-state handlers), and constraint envelope (safety limits).'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Data Source Card ────────────────────────────────────────────────

function DataSourceCard({ source, delay }: { source: DataSourceV3; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: DIMENSION_COLORS.data.medium }}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <Database className="w-4 h-4 shrink-0" style={{ color: DIMENSION_COLORS.data.primary }} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{source.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{source.format}</p>
          {source.detectedFormats && (
            <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{source.detectedFormats}</p>
          )}
          {source.contentTypes && source.contentTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {source.contentTypes.map((ct) => (
                <span key={ct} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                  {ct.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">{source.size}</span>
          <AgentTooltip
            title="Demo Mode"
            content="This action is available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
            trigger="click"
            position="bottom"
          >
            <button
              className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
              aria-label={`Edit data source ${source.name}`}
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </AgentTooltip>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Response Type Card ──────────────────────────────────────────────

function ResponseTypeCard({ responseType, delay }: { responseType: ResponseTypeV3; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: DIMENSION_COLORS.userProfile.medium }}
    >
      <div className="h-[3px]" style={{ background: DIMENSION_COLORS.userProfile.primary }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{responseType.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{responseType.description}</p>
          </div>
          <AgentTooltip
            title="Demo Mode"
            content="This action is available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
            trigger="click"
            position="bottom"
          >
            <button
              className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
              aria-label={`Edit response type ${responseType.name}`}
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </AgentTooltip>
        </div>
        {responseType.format && (
          <div className="mb-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-mono text-gray-600">{responseType.format}</p>
          </div>
        )}
        {responseType.outcomeStates && responseType.outcomeStates.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-gray-600 mb-1.5">Outcome States:</p>
            {responseType.outcomeStates.map((os, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <span className="font-mono text-gray-500 shrink-0 min-w-[3rem]">{(os.probability * 100).toFixed(0)}%</span>
                <span className="text-gray-700">{os.state}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Tool Card ──────────────────────────────────────────────────────

function ToolCard({ tool, delay }: { tool: AgentToolV3; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: '#e5e7eb' }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-sm font-bold text-gray-900 flex-1 min-w-0">{tool.name}</p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: '#f3e8ff', color: '#6b21a8' }}>
              System Suggested
            </span>
            <AgentTooltip
              title="Demo Mode"
              content="This action is available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
              trigger="click"
              position="bottom"
            >
              <button
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                aria-label={`Edit tool ${tool.name}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </AgentTooltip>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{tool.description}</p>
      </div>
    </motion.div>
  )
}

// ─── Task Card ──────────────────────────────────────────────────────

function TaskCard({ task, delay }: { task: AgentTaskV3; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: DIMENSION_COLORS.task.medium }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <Target className="w-4 h-4 shrink-0 mt-0.5" style={{ color: DIMENSION_COLORS.task.primary }} aria-hidden="true" />
            <p className="text-sm font-bold text-gray-900 break-words whitespace-normal">{task.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {task.systemSuggested && (
              <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                System
              </span>
            )}
            <AgentTooltip
              title="Demo Mode"
              content="This action is available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
              trigger="click"
              position="bottom"
            >
              <button
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label={`Edit task ${task.name}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </AgentTooltip>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-2">{task.description}</p>
        {task.triggerCondition && (
          <p className="text-[10px] text-gray-500 italic">Triggers: {task.triggerCondition}</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Add Input Area ──────────────────────────────────────────────────

function AddInputArea({ placeholder }: { placeholder: string }) {
  const [value, setValue] = useState('')

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <AgentTooltip
        title="Demo Mode"
        content="Custom inputs are available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
        trigger="click"
        position="bottom"
      >
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          aria-label="Add item"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add
        </button>
      </AgentTooltip>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

export function ContextDefinitionV3() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)

  // Resolve real tileId to V3 data key
  const resolvedTileId = activeTileId ? resolveV3TileId(activeTileId, 'contextDefinition') : null
  const contextData = resolvedTileId ? getContextDefinitionDataV3(resolvedTileId) : null
  const goalData = activeTileId ? getGoalData(activeTileId) : null

  // Get accent color from V3_TILE_COLORS
  const accentColor = activeTileId ? V3_TILE_COLORS[activeTileId] || '#f59e0b' : '#f59e0b'

  const [activeTab, setActiveTab] = useState<ContextTab>('tasks')

  // Reset tab when tile changes
  const prevTileRef = useRef(activeTileId)
  useEffect(() => {
    if (activeTileId !== prevTileRef.current) {
      setActiveTab('tasks')
      prevTileRef.current = activeTileId
    }
  }, [activeTileId])

  if (!contextData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">No tile selected or V3 data not available.</p>
      </div>
    )
  }

  const { tasks, dataSources, responseTypes, tools, useCaseName, complexity } = contextData

  const counts: Record<ContextTab, number> = {
    tasks: tasks.length,
    'data-sources': dataSources.length,
    'response-types': responseTypes.length,
    tools: tools.length,
  }

  const activeTabDef = TABS.find((t) => t.id === activeTab)!
  const goalStatement = goalData?.goalStatement ?? ''

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      {/* Use case summary */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border px-4 py-3"
        style={{ borderColor: `${accentColor}20`, background: `${accentColor}04` }}
      >
        <div className="flex items-center gap-3">
          <div style={{ width: '3px', height: '24px', background: accentColor, borderRadius: '2px' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{useCaseName}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              <span style={{ color: accentColor, fontWeight: '600' }}>{complexity}</span> • {tasks.length} tasks, {dataSources.length} data sources
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stage explainer */}
      <ContextExplainer viewMode={viewMode} />

      {/* Tab bar */}
      <TabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        accentColor={accentColor}
      />

      {/* Goal traceability ribbon */}
      <GoalRibbon
        goalStatement={goalStatement}
        activeTab={activeTab}
        accentColor={activeTabDef.dimensionColor ?? accentColor}
      />

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* ─── Tasks Tab ─── */}
          {activeTab === 'tasks' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tasks.map((task, i) => (
                  <TaskCard key={task.id} task={task} delay={0.05 + i * 0.04} />
                ))}
              </div>
              <AddInputArea placeholder="Add new task..." />
            </>
          )}

          {/* ─── Data Sources Tab ─── */}
          {activeTab === 'data-sources' && (
            <>
              <div className="space-y-2">
                {dataSources.map((source, i) => (
                  <DataSourceCard key={source.id} source={source} delay={0.05 + i * 0.04} />
                ))}
              </div>
              <AddInputArea placeholder="Add new data source..." />
            </>
          )}

          {/* ─── Response Types Tab ─── */}
          {activeTab === 'response-types' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {responseTypes.map((rt, i) => (
                  <ResponseTypeCard key={rt.id} responseType={rt} delay={0.05 + i * 0.04} />
                ))}
              </div>
              <AddInputArea placeholder="Add new response type..." />
            </>
          )}

          {/* ─── Tools Tab ─── */}
          {activeTab === 'tools' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} delay={0.05 + i * 0.04} />
                ))}
              </div>
              <AddInputArea placeholder="Add new tool..." />
            </>
          )}


        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default ContextDefinitionV3
