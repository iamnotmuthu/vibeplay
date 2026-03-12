import { motion } from 'framer-motion'
import {
  Database,
  Users,
  Layers,
  FileText,
  Table2,
  Image,
  Braces,
  AudioLines,
  Code2,
  Info,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AgentTooltip } from '@/components/agent/AgentTooltip'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import {
  getContextDimensionsData,
  DATA_TYPE_LABELS,
  DATA_TYPE_COLORS,
  OUTPUT_PREFERENCE_LABELS,
  type DataTypeChip,
  type OutputPreference,
  type DimensionAggregate,
  type SourceContribution,
  type DimensionUserProfile,
} from '@/lib/agent/contextDimensionsData'

// ─── Data Type Chip Icons ──────────────────────────────────────────────────

const DATA_TYPE_ICONS: Record<DataTypeChip, React.ElementType> = {
  'text-documents': FileText,
  tables: Table2,
  images: Image,
  'structured-data': Braces,
  audio: AudioLines,
  code: Code2,
}

// ─── Output Preference Colors ──────────────────────────────────────────────

const OUTPUT_PREF_COLORS: Record<OutputPreference, { bg: string; text: string; border: string }> = {
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

// ─── Stage Explainer ────────────────────────────────────────────────────────

function ContextExplainer({
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
        <Layers className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-gray-700 leading-relaxed">
          {viewMode === 'business'
            ? 'Maps two things: the data landscape your agent draws from (formats, volume, types) and the response requirements for each user profile (what outputs they need). This bridges context definition and interaction discovery.'
            : 'Two-axis dimensional analysis: (1) data source profiling with auto-detected type classification across text, tabular, structured, image, audio, and code formats with cardinality estimation and freshness scoring, and (2) response requirement tensor per user profile mapping output modalities (text, table, chart, file, action) to complexity tiers. The resulting matrix drives interaction path enumeration and component selection.'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  count,
  accentColor,
  delay,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  title: string
  subtitle: string
  count?: number
  accentColor: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <Icon className="w-5 h-5" style={{ color: accentColor }} aria-hidden="true" />
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {count !== undefined && (
          <div
            className="inline-flex items-center justify-center min-w-6 h-6 rounded-full text-[11px] font-bold"
            style={{ background: `${accentColor}15`, color: accentColor }}
          >
            {count}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 ml-[30px]">{subtitle}</p>
    </motion.div>
  )
}

// ─── Source Attribution Row ──────────────────────────────────────────────────

function SourceAttributionRow({ source }: { source: SourceContribution }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-gray-300 mt-0.5 shrink-0">&rarr;</span>
      <span className="text-gray-500">
        <span className="font-medium text-gray-600">{source.sourceName}</span>
        {' \u2014 '}
        {source.count}
      </span>
    </div>
  )
}

// ─── Dimension Aggregate Card ───────────────────────────────────────────────

function DimensionAggregateCard({
  aggregate,
  accentColor,
  delay,
}: {
  aggregate: DimensionAggregate
  accentColor: string
  delay: number
}) {
  const colors = DATA_TYPE_COLORS[aggregate.type]
  const label = DATA_TYPE_LABELS[aggregate.type]
  const Icon = DATA_TYPE_ICONS[aggregate.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: `${accentColor}15` }}
    >
      {/* Header: type icon + label + total count */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <Icon className="w-4 h-4" style={{ color: colors.text }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{label}</p>
            <p className="text-[11px] font-semibold" style={{ color: colors.text }}>
              {aggregate.totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* Source attributions */}
      <div className="ml-[42px] space-y-1.5">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          From Context Definition
        </p>
        {aggregate.sources.map((src) => (
          <SourceAttributionRow key={src.sourceId} source={src} />
        ))}
      </div>

      {/* Processing note */}
      {aggregate.processingNote && (
        <div className="ml-[42px] mt-3 flex items-start gap-1.5">
          <Info className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[10px] text-amber-600 leading-relaxed">{aggregate.processingNote}</p>
        </div>
      )}
    </motion.div>
  )
}

// ─── Output Preference Tag ──────────────────────────────────────────────────

function OutputPreferenceTag({ pref }: { pref: OutputPreference }) {
  const colors = OUTPUT_PREF_COLORS[pref]
  const label = OUTPUT_PREFERENCE_LABELS[pref]

  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {label}
    </span>
  )
}

// ─── User Profile Card (enhanced with output prefs) ─────────────────────────

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

function DimensionUserProfileCard({
  profile,
  accentColor,
  delay,
}: {
  profile: DimensionUserProfile
  accentColor: string
  delay: number
}) {
  const meta = PROFICIENCY_META[profile.proficiency]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: `${accentColor}15` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-bold text-gray-900">{profile.category}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
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
              <Info className="w-3 h-3" aria-hidden="true" />
            </div>
          </AgentTooltip>
        </div>
      </div>

      {/* Interaction context */}
      <p className="text-xs text-gray-500 leading-relaxed mb-3">
        {profile.interactionContext}
      </p>

      {/* Example questions */}
      <div className="space-y-1 mb-3">
        {profile.exampleQuestions.map((q, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xs text-gray-400 mt-0.5 shrink-0">&bull;</span>
            <p className="text-xs text-gray-600 leading-relaxed">{q}</p>
          </div>
        ))}
      </div>

      {/* Output preferences */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Output Preferences
        </p>
        <div className="flex flex-wrap gap-1">
          {profile.outputPreferences.map((pref) => (
            <OutputPreferenceTag key={pref} pref={pref} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Summary Stats Bar ──────────────────────────────────────────────────────

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
      transition={{ duration: 0.4, delay: 0.8 }}
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

// ─── Main Component ─────────────────────────────────────────────────────────

export function ContextDimensions() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const dimensionsData = activeTileId ? getContextDimensionsData(activeTileId) : null
  const accentColor = tile?.color ?? '#3b82f6'

  if (!tile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">No tile selected.</p>
      </div>
    )
  }

  // Show placeholder for tiles without data yet
  if (!dimensionsData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Context Dimensions</h2>
          <p className="text-sm text-gray-500">
            Mapping your data landscape and response requirements
          </p>
        </motion.div>
        <ContextExplainer viewMode={viewMode} />
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

  const { dimensions, userProfiles, summaryText } = dimensionsData
  const coreProfiles = userProfiles.filter((p) => p.isCore)
  const domainProfiles = userProfiles.filter((p) => !p.isCore)

  // Count unique output formats
  const uniqueOutputFormats = new Set(userProfiles.flatMap((p) => p.outputPreferences)).size

  // Count unique data types across dimension aggregates
  const uniqueDataTypes = dimensions.length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Stage header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Context Dimensions</h2>
        <p className="text-sm text-gray-500">
          Mapping your data landscape and response requirements
        </p>
      </motion.div>

      {/* Explainer */}
      <ContextExplainer viewMode={viewMode} />

      {/* ───────────────────────────────────────────────────────────────────
          SECTION A: DATA LANDSCAPE
          ─────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          icon={Database}
          title="What VibeModel found in your data"
          subtitle={`${uniqueDataTypes} data types detected across your connected sources`}
          count={uniqueDataTypes}
          accentColor={accentColor}
          delay={0.2}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.3 }}
          className="text-xs text-gray-500 leading-relaxed"
        >
          VibeModel scanned your connected sources and classified what it found by data type.
          Each dimension below shows the aggregate volume and traces back to which Context
          Definition sources contributed.
        </motion.p>

        <div className="space-y-3">
          {dimensions.map((aggregate, i) => (
            <DimensionAggregateCard
              key={aggregate.type}
              aggregate={aggregate}
              accentColor={accentColor}
              delay={0.25 + i * 0.08}
            />
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          SECTION B: RESPONSE REQUIREMENTS
          ─────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          icon={Users}
          title="How users expect responses"
          subtitle={`${userProfiles.length} user profiles requiring ${uniqueOutputFormats} distinct output formats`}
          count={userProfiles.length}
          accentColor={accentColor}
          delay={0.4}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.3 }}
          className="text-xs text-gray-500 leading-relaxed"
        >
          Different users need different things from your agent. This section maps each user type to
          the output formats, tone, and detail level they expect.
        </motion.p>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coreProfiles.map((profile, i) => (
                <DimensionUserProfileCard
                  key={profile.id}
                  profile={profile}
                  accentColor={accentColor}
                  delay={0.45 + i * 0.08}
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
                delay: 0.42 + coreProfiles.length * 0.08,
                duration: 0.3,
              }}
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pt-2"
            >
              Specialized Users
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {domainProfiles.map((profile, i) => (
                <DimensionUserProfileCard
                  key={profile.id}
                  profile={profile}
                  accentColor={accentColor}
                  delay={0.45 + coreProfiles.length * 0.08 + 0.1 + i * 0.08}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          SUMMARY
          ─────────────────────────────────────────────────────────────────── */}
      <SummaryStats summaryText={summaryText} accentColor={accentColor} />
    </div>
  )
}
