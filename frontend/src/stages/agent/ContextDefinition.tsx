import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Database,
  Users,
  Wrench,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Plus,
  Info,
  Pencil,
} from 'lucide-react'
import { AgentTooltip } from '@/components/agent/AgentTooltip'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { getContextDefinitionData } from '@/lib/agent/contextDefinitionData'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getGoalData, DATA_DOMAIN_LABELS, DATA_DOMAIN_COLORS } from '@/lib/agent/goalData'
import type { DataDomain } from '@/lib/agent/goalData'
import type {
  InstructionStep,
  DataSource,
  UserProfile,
  AgentTool,
  AgentTask,
} from '@/store/agentTypes'

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

// ─── Instruction Card ────────────────────────────────────────────────

function InstructionCard({
  step,
  accentColor,
  delay,
  viewMode,
}: {
  step: InstructionStep
  accentColor: string
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const [expanded, setExpanded] = useState(false)

  const hasTechnicalContent =
    step.technicalDetail ||
    step.dataSource ||
    step.retrievalType ||
    step.toolInvocation ||
    step.routingRule ||
    step.errorHandling ||
    step.escalationCondition

  const canExpand = viewMode === 'technical' && hasTechnicalContent

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: `${accentColor}20` }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Step number */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: `${accentColor}10` }}
        >
          <span className="text-xs font-bold" style={{ color: accentColor }}>
            {step.stepNumber}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-gray-900">{step.label}</span>
          <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
            {step.description}
          </p>
        </div>

        {/* Edit button */}
        <AgentTooltip
          title="Demo Mode"
          content="This action is available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
          trigger="click"
          position="bottom"
        >
          <button
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
            aria-label={`Edit step ${step.stepNumber}`}
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </AgentTooltip>

        {/* Expand button for technical details */}
        {canExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} technical details for step ${step.stepNumber}`}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Technical expansion */}
      <AnimatePresence>
        {expanded && canExpand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {step.technicalDetail && (
                <div
                  className="rounded-lg px-3 py-2.5 text-[11px] font-mono text-gray-600 leading-relaxed"
                  style={{
                    background: `${accentColor}06`,
                    borderLeft: `2px solid ${accentColor}30`,
                  }}
                >
                  {step.technicalDetail}
                </div>
              )}

              {(step.dataSource ||
                step.retrievalType ||
                step.toolInvocation ||
                step.errorHandling) && (
                <div className="grid grid-cols-2 gap-2">
                  {step.dataSource && (
                    <MetaItem label="Data Source" value={step.dataSource} />
                  )}
                  {step.retrievalType && (
                    <MetaItem label="Retrieval" value={step.retrievalType} />
                  )}
                  {step.toolInvocation && (
                    <MetaItem label="Tools" value={step.toolInvocation} />
                  )}
                  {step.errorHandling && (
                    <MetaItem label="Error Handling" value={step.errorHandling} />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Metadata Item ───────────────────────────────────────────────────

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-2.5 py-2">
      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">
        {label}
      </span>
      <span className="text-[11px] text-gray-600 leading-tight mt-0.5 block">
        {value}
      </span>
    </div>
  )
}

// ─── Section Header ─────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  count,
  delay,
}: {
  icon: React.ElementType
  title: string
  count?: number
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-2.5"
    >
      <Icon className="w-5 h-5" style={{ color: '#3b82f6' }} aria-hidden="true" />
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {count !== undefined && (
        <div
          className="inline-flex items-center justify-center min-w-6 h-6 rounded-full text-[11px] font-bold"
          style={{ background: '#3b82f620', color: '#3b82f6' }}
        >
          {count}
        </div>
      )}
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
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <Database className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
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
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded-full"
            style={{ background: '#f3f4f620', color: '#6b7280' }}
          >
            {source.format}
          </span>
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
    tooltip:
      'The agent acts independently with minimal confirmation. Bulk operations, advanced options, and technical language are enabled.',
  },
  medium: {
    label: 'Flexible',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fde047',
    tooltip:
      'The agent uses domain terminology and offers shortcuts, but confirms before high-impact actions. A balance of speed and safety.',
  },
  low: {
    label: 'Guided',
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fca5a5',
    tooltip:
      'The agent uses plain language, confirms before every action, and provides step-by-step guidance. Maximum guardrails for safety.',
  },
}

function UserProfileCard({
  profile,
  delay,
}: {
  profile: UserProfile
  delay: number
}) {
  const meta = PROFICIENCY_META[profile.proficiency]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: meta.border, background: meta.bg }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{profile.category}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-[9px] font-bold px-2 py-1 rounded-full"
              style={{ background: meta.border, color: meta.color }}
            >
              {meta.label}
            </span>
            <AgentTooltip
              title={meta.label}
              content={meta.tooltip}
              trigger="hover"
              position="bottom"
            >
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
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
                aria-label={`Edit profile ${profile.category}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </AgentTooltip>
          </div>
        </div>

        <div className="space-y-1.5">
          {profile.exampleQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="text-xs font-semibold mt-0.5 shrink-0"
                style={{ color: meta.color }}
              >
                •
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

function ToolCard({
  tool,
  delay,
}: {
  tool: AgentTool
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{tool.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-[9px] font-bold px-2 py-1 rounded-full"
              style={{ background: '#dcfce7', color: '#166534' }}
            >
              Active
            </span>
            <AgentTooltip
              title="Demo Mode"
              content="This action is available in the full platform. This demo uses pre-configured data to walk you through the complete agent building flow."
              trigger="click"
              position="bottom"
            >
              <button
                className="p-1 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label={`Edit tool ${tool.name}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </AgentTooltip>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {tool.description}
        </p>

        {tool.accesses && tool.accesses.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-1">
            Accesses: {tool.accesses.join(', ')}
          </p>
        )}

        {tool.autoDetected && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span
              className="text-[9px] font-semibold px-2 py-1 rounded-full"
              style={{ background: '#f3f4f620', color: '#6b7280' }}
            >
              Auto-detected
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Task Card ──────────────────────────────────────────────────────

function TaskCard({
  task,
  delay,
}: {
  task: AgentTask
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-sm font-bold text-gray-900">{task.label}</p>
          <div className="flex items-center gap-2 shrink-0">
            {task.systemSuggested && (
              <span
                className="text-[9px] font-bold px-2 py-1 rounded-full"
                style={{ background: '#ede9fe', color: '#5b21b6' }}
              >
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
                className="p-1 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label={`Edit task ${task.label}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </AgentTooltip>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {task.description}
        </p>

        {task.triggeredBy && (
          <p className="text-[10px] text-gray-400 mt-1">
            Triggered by: {task.triggeredBy}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Add Input Component ────────────────────────────────────────────

function AddInputArea({
  placeholder,
  delay,
}: {
  placeholder: string
  delay: number
}) {
  const [value, setValue] = useState('')

  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className="flex items-center gap-2"
      >
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
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            }}
            aria-label="Add item"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add
          </button>
        </AgentTooltip>
      </motion.div>
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

  const {
    instructions,
    businessSummary,
    technicalSummary,
    dataSources,
    userProfiles,
    tools,
    tasks,
  } = contextData

  const coreProfiles = userProfiles.filter((p) => p.isCore)
  const domainProfiles = userProfiles.filter((p) => !p.isCore)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
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

      {/* ───────────────────────────────────────────────────────────────
          SECTION 1: INSTRUCTIONS
          ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          icon={FileText}
          title="Instructions"
          count={instructions.length}
          delay={0.2}
        />

        <div className="space-y-3">
          {instructions.map((step, i) => (
            <InstructionCard
              key={step.stepNumber}
              step={step}
              accentColor={accentColor}
              delay={0.25 + i * 0.06}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 2: DATA SOURCES
          ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          icon={Database}
          title="Data Sources"
          count={dataSources.length}
          delay={0.3}
        />

        <div className="space-y-2">
          {dataSources.map((source, i) => (
            <DataSourceCard
              key={source.id}
              source={source}
              delay={0.35 + i * 0.06}
              viewMode={viewMode}
              matchedDomain={domainLookup.get(source.name.toLowerCase()) ?? null}
            />
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 3: USER PROFILES
          ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          icon={Users}
          title="User Profiles"
          count={userProfiles.length}
          delay={0.4}
        />

        {/* Core profiles */}
        {coreProfiles.length > 0 && (
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.3 }}
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
            >
              Core Users
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {coreProfiles.map((profile, i) => (
                <UserProfileCard
                  key={profile.id}
                  profile={profile}
                  delay={0.45 + i * 0.06}
                />
              ))}
            </div>
          </div>
        )}

        {/* Domain-specific profiles */}
        {domainProfiles.length > 0 && (
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.42 + coreProfiles.length * 0.06,
                duration: 0.3,
              }}
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pt-2"
            >
              Specialized Users
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {domainProfiles.map((profile, i) => (
                <UserProfileCard
                  key={profile.id}
                  profile={profile}
                  delay={
                    0.45 + coreProfiles.length * 0.06 + 0.08 + i * 0.06
                  }
                />
              ))}
            </div>
          </div>
        )}

        <AddInputArea placeholder="Add new user profile..." delay={0.45 + userProfiles.length * 0.06 + 0.08} />
      </div>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 4: TOOLS
          ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          icon={Wrench}
          title="Tools"
          count={tools.length}
          delay={0.5}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} delay={0.55 + i * 0.06} />
          ))}
        </div>

        <AddInputArea placeholder="Add new tool..." delay={0.55 + tools.length * 0.06 + 0.08} />
      </div>

      {/* ───────────────────────────────────────────────────────────────
          SECTION 5: TASKS
          ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          icon={ListChecks}
          title="Tasks"
          count={tasks.length}
          delay={0.6}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks.map((task, i) => (
            <TaskCard key={task.id} task={task} delay={0.65 + i * 0.06} />
          ))}
        </div>

        <AddInputArea placeholder="Add new task..." delay={0.65 + tasks.length * 0.06 + 0.08} />
      </div>
    </div>
  )
}
