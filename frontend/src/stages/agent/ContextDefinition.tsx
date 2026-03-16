import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Database,
  MessageSquareText,
  Wrench,
  Shield,
  Plus,
  Info,
  Pencil,
  Target,
  Zap,
  Users,
} from 'lucide-react'
import { AgentTooltip } from '@/components/agent/AgentTooltip'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { getContextDefinitionData } from '@/lib/agent/contextDefinitionData'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getGoalData, DATA_DOMAIN_LABELS, DATA_DOMAIN_COLORS } from '@/lib/agent/goalData'
import type { DataDomain } from '@/lib/agent/goalData'
import type {
  DataSource,
  UserProfile,
  AgentTool,
  AgentTask,
  Guardrail,
  GuardrailCategory,
  AgentOutput,
} from '@/store/agentTypes'
import { GUARDRAIL_CATEGORY_META, DIMENSION_COLORS } from '@/store/agentTypes'

// ─── Tab Configuration ──────────────────────────────────────────────────────

type ContextTab = 'tasks' | 'data-sources' | 'agent-outputs' | 'tools' | 'guardrails'

interface TabDef {
  id: ContextTab
  label: string
  icon: React.ElementType
  goalLink: string // short description of how this tab traces to the goal
  dimensionColor?: string // unified dimension color (Task=Indigo, Data=Emerald, UserProfile=Rose)
}

const TABS: TabDef[] = [
  { id: 'tasks', label: 'Tasks', icon: Target, goalLink: 'What the agent does', dimensionColor: DIMENSION_COLORS.task.primary },
  { id: 'data-sources', label: 'Data Sources', icon: Database, goalLink: 'Knowledge it uses', dimensionColor: DIMENSION_COLORS.data.primary },
  { id: 'agent-outputs', label: 'Agent Outputs', icon: MessageSquareText, goalLink: 'What it produces', dimensionColor: DIMENSION_COLORS.userProfile.primary },
  { id: 'tools', label: 'Tools', icon: Wrench, goalLink: 'Capabilities available' },
  { id: 'guardrails', label: 'Guardrails', icon: Shield, goalLink: 'Boundaries & rules' },
]

// ─── Goal Traceability Ribbon ───────────────────────────────────────────────

function GoalRibbon({
  goalStatement,
  tabGoalLink,
  accentColor,
}: {
  goalStatement: string
  tabGoalLink: string
  accentColor: string
}) {
  // Show truncated goal + how this tab connects
  const truncated = goalStatement.length > 90 ? goalStatement.slice(0, 90) + '...' : goalStatement

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
          {tabGoalLink}
        </p>
        <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5 truncate" title={goalStatement}>
          {truncated}
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

  // Update indicator position on tab change (useLayoutEffect for accurate post-paint measurements)
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

  // Arrow-key navigation between tabs (WCAG tablist pattern)
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
      // Focus the newly active tab button
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
      {/* Sliding indicator — uses active tab's dimension color when available */}
      <motion.div
        className="absolute bottom-0 h-[2px] rounded-full"
        style={{ background: (tabs.find((t) => t.id === activeTab)?.dimensionColor) ?? accentColor }}
        animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </div>
  )
}

// ─── Stage Explainer ────────────────────────────────────────────────

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
            ? 'The operational foundation of your agent. Define step-by-step instructions, data sources it can access, who uses it, which tools are available, and what tasks it can perform. This is where you set the boundaries and capabilities.'
            : 'Six-vector operational specification: instruction graph (routing rules, escalation conditions, error-handling paths), datasource bindings (format, access protocol, auth metadata), user profiles (proficiency tiers, permission scopes), tool capability matrix (input/output schemas, rate limits), task registry (trigger conditions, SLA targets), and constraint envelope (data residency, PII handling, cost ceilings).'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Coming Soon Card ────────────────────────────────────────────

function ComingSoonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6"
    >
      <div className="flex items-start gap-4">
        <Info className="w-5 h-5 shrink-0 text-slate-400 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">Coming Soon</p>
          <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
            What the agent should NOT do — safety limits, compliance requirements, quality thresholds.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Guardrail Card ──────────────────────────────────────────────────

function GuardrailItemCard({
  guardrail,
  categoryMeta,
  delay,
}: {
  guardrail: Guardrail
  categoryMeta: { color: string; bgColor: string; borderColor: string }
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="flex items-start gap-3 px-3.5 py-3 rounded-lg border bg-white"
      style={{ borderColor: `${categoryMeta.borderColor}80` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">{guardrail.label}</span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: guardrail.enforcement === 'hard' ? '#fef2f2' : '#f0fdf4',
              color: guardrail.enforcement === 'hard' ? '#dc2626' : '#16a34a',
              border: `1px solid ${guardrail.enforcement === 'hard' ? '#fecaca' : '#86efac'}`,
            }}
          >
            {guardrail.enforcement === 'hard' ? 'Hard' : 'Soft'}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{guardrail.description}</p>
        {guardrail.threshold && (
          <p className="text-[10px] font-mono mt-1.5" style={{ color: categoryMeta.color }}>
            Threshold: {guardrail.threshold}
          </p>
        )}
      </div>
      <AgentTooltip
        title="Demo Mode"
        content="This action is available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
        trigger="click"
        position="bottom"
      >
        <button
          className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          aria-label={`Edit guardrail ${guardrail.label}`}
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </AgentTooltip>
    </motion.div>
  )
}

// ─── Guardrail Category Group ─────────────────────────────────────────

function GuardrailCategoryGroup({
  category,
  guardrails,
  delay,
}: {
  category: GuardrailCategory
  guardrails: Guardrail[]
  delay: number
}) {
  const meta = GUARDRAIL_CATEGORY_META[category]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: meta.borderColor, background: `${meta.bgColor}60` }}
    >
      <div className="px-4 py-3 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${meta.borderColor}` }}>
        <Shield className="w-4 h-4" style={{ color: meta.color }} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</p>
          <p className="text-[10px] text-gray-500">{meta.description}</p>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${meta.color}12`, color: meta.color }}
        >
          {guardrails.length}
        </span>
      </div>
      <div className="p-3 space-y-2">
        {guardrails.map((g, i) => (
          <GuardrailItemCard
            key={g.id}
            guardrail={g}
            categoryMeta={meta}
            delay={delay + 0.03 + i * 0.03}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── Data Source Card ────────────────────────────────────────────────

function DataSourceCard({
  source,
  delay,
  viewMode,
  matchedDomain,
}: {
  source: DataSource
  delay: number
  viewMode?: 'business' | 'technical'
  matchedDomain?: DataDomain | null
}) {
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
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{source.name}</p>
            {viewMode === 'technical' && matchedDomain && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ color: DATA_DOMAIN_COLORS[matchedDomain], background: `${DATA_DOMAIN_COLORS[matchedDomain]}15` }}
              >
                {DATA_DOMAIN_LABELS[matchedDomain]}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{source.format}</p>
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
        </div>
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
    </motion.div>
  )
}

// ─── Agent Output Card ──────────────────────────────────────────────

function AgentOutputCard({ output, delay }: { output: AgentOutput; delay: number }) {
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
            <p className="text-sm font-bold text-gray-900 truncate">{output.label}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {output.isCore && (
              <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: '#fef2f2', color: '#dc2626' }}>
                Core
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
                aria-label={`Edit output ${output.label}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </AgentTooltip>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">{output.description}</p>
        {output.exampleOutput && (
          <div className="mb-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-mono text-gray-600 leading-relaxed text-wrap">{output.exampleOutput}</p>
          </div>
        )}
        {output.triggeringTaskIds && output.triggeringTaskIds.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {output.triggeringTaskIds.map((taskId) => (
              <span key={taskId} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {taskId}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── User Profile Card ──────────────────────────────────────────────

const PROFICIENCY_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; tooltip: string }
> = {
  high: {
    label: 'Autonomous',
    color: '#166534',
    bg: '#dcfce7',
    border: '#86efac',
    tooltip: 'The agent acts independently with minimal confirmation. Bulk operations, advanced options, and technical language are enabled.',
  },
  medium: {
    label: 'Flexible',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fde047',
    tooltip: 'The agent uses domain terminology and offers shortcuts, but confirms before high-impact actions. A balance of speed and safety.',
  },
  low: {
    label: 'Guided',
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fca5a5',
    tooltip: 'The agent uses plain language, confirms before every action, and provides step-by-step guidance. Maximum guardrails for safety.',
  },
}

function UserProfileCard({ profile, delay }: { profile: UserProfile; delay: number }) {
  const meta = PROFICIENCY_META[profile.proficiency]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: meta.border, background: meta.bg }}
    >
      {/* Rose dimension accent bar */}
      <div className="h-[3px]" style={{ background: DIMENSION_COLORS.userProfile.primary }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Users className="w-4 h-4 shrink-0" style={{ color: DIMENSION_COLORS.userProfile.primary }} aria-hidden="true" />
            <p className="text-sm font-bold text-gray-900 truncate">{profile.category}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-[9px] font-bold px-2 py-1 rounded-full"
              style={{ background: meta.border, color: meta.color }}
            >
              {meta.label}
            </span>
            <AgentTooltip title={meta.label} content={meta.tooltip} trigger="hover" position="bottom">
              <div className="p-0.5 rounded-md text-gray-400 hover:text-gray-600 transition-colors cursor-help">
                <Info className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            </AgentTooltip>
            <AgentTooltip
              title="Demo Mode"
              content="This action is available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
              trigger="click"
              position="bottom"
            >
              <button
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label={`Edit user profile ${profile.category}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </AgentTooltip>
          </div>
        </div>
        <div className="space-y-1.5">
          {profile.exampleQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs font-semibold mt-0.5 shrink-0" style={{ color: meta.color }}>
                &bull;
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Tool Card ──────────────────────────────────────────────────────

function ToolCard({ tool, delay }: { tool: AgentTool; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-sm font-bold text-gray-900 flex-1 min-w-0">{tool.name}</p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>
              Active
            </span>
            <AgentTooltip
              title="Demo Mode"
              content="This action is available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
              trigger="click"
              position="bottom"
            >
              <button
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label={`Edit tool ${tool.name}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </AgentTooltip>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{tool.description}</p>
        {tool.accesses && tool.accesses.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-1">Accesses: {tool.accesses.join(', ')}</p>
        )}
        {tool.autoDetected && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-[9px] font-semibold px-2 py-1 rounded-full" style={{ background: '#f3f4f620', color: '#6b7280' }}>
              Auto-detected
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Task Card ──────────────────────────────────────────────────────

function TaskCard({ task, delay }: { task: AgentTask; delay: number }) {
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
          <div className="flex items-center gap-2 min-w-0">
            <Target className="w-4 h-4 shrink-0" style={{ color: DIMENSION_COLORS.task.primary }} aria-hidden="true" />
            <p className="text-sm font-bold text-gray-900 truncate">{task.label}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {task.systemSuggested && (
              <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                System Suggested
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
                aria-label={`Edit task ${task.label}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </AgentTooltip>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
        {task.triggeredBy && (
          <p className="text-[10px] text-gray-400 mt-1">Triggered by: {task.triggeredBy}</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Add Input ──────────────────────────────────────────────────────

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

export function ContextDefinition() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const contextData = activeTileId ? getContextDefinitionData(activeTileId) : null
  const goalData = activeTileId ? getGoalData(activeTileId) : null
  const accentColor = tile?.color ?? '#f59e0b'

  const [activeTab, setActiveTab] = useState<ContextTab>('tasks')

  // Reset tab when tile changes
  const prevTileRef = useRef(activeTileId)
  useEffect(() => {
    if (activeTileId !== prevTileRef.current) {
      setActiveTab('tasks')
      prevTileRef.current = activeTileId
    }
  }, [activeTileId])

  // Build data-domain lookup: source name → DataDomain (for technical mode)
  const domainLookup = new Map<string, DataDomain>()
  if (goalData?.dataSources) {
    for (const ds of goalData.dataSources) {
      domainLookup.set(ds.name.toLowerCase(), ds.domain)
    }
  }

  if (!tile || !contextData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">No tile selected.</p>
      </div>
    )
  }

  const { guardrails, businessSummary, technicalSummary, dataSources, agentOutputs, tools, tasks } = contextData

  const counts: Record<ContextTab, number> = {
    tasks: tasks.length,
    'data-sources': dataSources.length,
    'agent-outputs': agentOutputs.length,
    tools: tools.length,
    guardrails: guardrails.length,
  }

  const activeTabDef = TABS.find((t) => t.id === activeTab)!
  const goalStatement = goalData?.goalStatement ?? ''

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      {/* Stage explainer */}
      <ContextExplainer viewMode={viewMode} />

      {/* Summary */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="text-xs text-gray-500 leading-relaxed"
      >
        {viewMode === 'business' ? businessSummary : technicalSummary}
      </motion.p>

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
        tabGoalLink={activeTabDef.goalLink}
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
                  <DataSourceCard
                    key={source.id}
                    source={source}
                    delay={0.05 + i * 0.04}
                    viewMode={viewMode}
                    matchedDomain={domainLookup.get(source.name.toLowerCase()) ?? null}
                  />
                ))}
              </div>
              <AddInputArea placeholder="Add new data source..." />
            </>
          )}

          {/* ─── Agent Outputs Tab ─── */}
          {activeTab === 'agent-outputs' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {agentOutputs.map((output, i) => (
                  <AgentOutputCard key={output.id} output={output} delay={0.05 + i * 0.04} />
                ))}
              </div>
              <AddInputArea placeholder="Add new agent output..." />
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

          {/* ─── Guardrails Tab ─── */}
          {activeTab === 'guardrails' && (
            <ComingSoonCard />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
