import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Layers,
  AlertCircle,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getArchitectureData } from '@/lib/agent/architectureData'
import { getTechStack } from '@/lib/agent/componentTechData'
import {
  getMetaPatternsV3,
  type MetaPatternV3,
} from '@/lib/agent/metaPatternsDataV3'
import {
  getArchitectureDataV3,
  type ComponentSelectionV3,
  type TrustBoundaryV3,
} from '@/lib/agent/architectureDataV3'
import { resolveV3TileId, isV3SupportedTile } from '@/lib/agent/v3TileResolver'

// ─── Memory Color System ────────────────────────────────────────────────

// ─── Layer Configuration ────────────────────────────────────────────────

const ARCHITECTURE_LAYERS = [
  { id: 'ingestion', label: 'Ingestion Layer', accent: '#f59e0b', order: 0 },
  { id: 'routing', label: 'Routing Layer', accent: '#3b82f6', order: 1 },
  { id: 'context', label: 'Context Layer', accent: '#8b5cf6', order: 2 },
  { id: 'execution', label: 'Execution Layer', accent: '#ef4444', order: 3 },
  { id: 'output', label: 'Output Layer', accent: '#10b981', order: 4 },
  { id: 'ops', label: 'Ops Layer', accent: '#6b7280', order: 5 },
] as const

const LAYER_DESCRIPTIONS: Record<string, Record<'business' | 'technical', string>> = {
  ingestion: {
    business: "Reads data from all your sources and normalizes it into a standard format.",
    technical: "Data connectors, format parsers, and protocol handlers.",
  },
  routing: {
    business: "Determines how the agent processes each request and routes it appropriately.",
    technical: "Message routers, orchestrators, and state dispatchers.",
  },
  context: {
    business: "Manages the agent's memory and understanding of the current conversation.",
    technical: "Memory systems, context window managers, and retrieval indices.",
  },
  execution: {
    business: "The reasoning engine that makes decisions and executes tools.",
    technical: "LLM engines, tool executors, and decision logic.",
  },
  output: {
    business: "Formats and delivers responses to your users.",
    technical: "Response formatters, source attributors, and output validators.",
  },
  ops: {
    business: "Monitors health, handles errors, and logs activity.",
    technical: "Monitoring systems, error handlers, and analytics collectors.",
  },
}

const TRUST_COLORS: Record<string, { bg: string; border: string; accent: string; text: string }> = {
  autonomous: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#10b981', text: '#166534' },
  supervised: { bg: '#fffbeb', border: '#fde68a', accent: '#f59e0b', text: '#78350f' },
  escalation: { bg: '#fef2f2', border: '#fecaca', accent: '#ef4444', text: '#991b1b' },
}

// ─── Meta-Pattern Badge ─────────────────────────────────────────────────

function MetaPatternBadge({
  pattern,
  delay,
  family,
}: {
  pattern: MetaPatternV3
  delay: number
  family: string
}) {
  const familyColor = getFamilyColor(family)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-1 rounded-lg px-3 py-2 border"
      style={{
        background: `${familyColor}08`,
        borderColor: `${familyColor}30`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: familyColor }}
        />
        <span className="text-[10px] font-bold text-gray-900">
          {pattern.name}
        </span>
      </div>
      <p className="text-[9px] text-gray-600 leading-tight line-clamp-2">
        {pattern.description}
      </p>
      <span className="text-[8px] font-semibold uppercase tracking-widest" style={{ color: familyColor }}>
        {pattern.executionPathCount.toLocaleString()} paths
      </span>
    </motion.div>
  )
}

// ─── Helper to get family colors ────────────────────────────────────────

function getFamilyColor(family: string): string {
  const colors: Record<string, string> = {
    'Data Access': '#2563eb',
    'Data Transformation': '#7c3aed',
    'Data Format': '#db2777',
    'Task Structure': '#ea580c',
    'Output Synthesis': '#16a34a',
    'Execution Flow': '#0891b2',
    'Memory Management': '#6366f1',
    'State Management': '#f59e0b',
  }
  return colors[family] || '#6b7280'
}

// ─── Section A: Meta-Pattern Summary ────────────────────────────────────

function MetaPatternSummarySection({
  patterns,
  delay,
}: {
  patterns: MetaPatternV3[]
  delay: number
}) {
  const families = Array.from(new Set(patterns.map(p => p.family)))
  const patternsByFamily = families.map(fam => ({
    family: fam,
    patterns: patterns.filter(p => p.family === fam),
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden p-6"
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          Your agent triggers {patterns.length} meta-patterns
        </h3>
        <p className="text-xs text-gray-500">
          These patterns drive architecture decisions and component selections.
        </p>
      </div>

      {/* Patterns grouped by family */}
      <div className="space-y-4">
        {patternsByFamily.map((group, groupIdx) => (
          <div key={group.family}>
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: getFamilyColor(group.family) }}
              />
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: getFamilyColor(group.family) }}
              >
                {group.family}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.patterns.map((p, i) => (
                <MetaPatternBadge
                  key={p.id}
                  pattern={p}
                  family={group.family}
                  delay={delay + 0.05 + (groupIdx * group.patterns.length + i) * 0.08}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Component Card for Architecture Section ────────────────────────────

function ComponentArchitectureCard({
  component,
  triggeredPatterns,
  delay,
  viewMode,
}: {
  component: ComponentSelectionV3
  triggeredPatterns: MetaPatternV3[]
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const [expanded, setExpanded] = useState(false)
  const layer = ARCHITECTURE_LAYERS.find(l => l.id === component.layer)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-50/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-expanded={expanded}
      >
        {/* Layer color indicator */}
        <div
          className="w-1 rounded-full shrink-0 mt-1"
          style={{ background: layer?.accent, height: '16px' }}
        />

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
            {component.categoryName}
          </h4>
          <p className="text-sm font-semibold text-gray-900 mb-1.5">
            {component.selectedTechnology}
          </p>
          <p className="text-xs text-gray-600 line-clamp-2">
            {component.justification}
          </p>

          {/* Triggered by badges */}
          {triggeredPatterns.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {triggeredPatterns.slice(0, 2).map(p => (
                <span
                  key={p.id}
                  className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `${getFamilyColor(p.family)}12`,
                    color: getFamilyColor(p.family),
                  }}
                >
                  {p.name}
                </span>
              ))}
              {triggeredPatterns.length > 2 && (
                <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  +{triggeredPatterns.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="shrink-0 text-gray-300 mt-1">
          {expanded ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-0 space-y-3 border-t border-gray-100">
              {/* Layer info */}
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">{layer?.label}</span>
                  {' — '}
                  {viewMode === 'business'
                    ? LAYER_DESCRIPTIONS[component.layer].business
                    : LAYER_DESCRIPTIONS[component.layer].technical}
                </span>
              </div>

              {/* Full justification */}
              <div className="rounded-lg bg-blue-50/50 px-3 py-2 text-xs text-blue-900 border border-blue-100">
                {component.justification}
              </div>

              {/* Triggered by patterns */}
              {triggeredPatterns.length > 0 && (
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Triggered by meta-patterns
                  </p>
                  <div className="space-y-1">
                    {triggeredPatterns.map(p => (
                      <div key={p.id} className="text-xs text-gray-600">
                        <div className="font-semibold text-gray-700">{p.name}</div>
                        <div className="text-[10px] text-gray-500">{p.description}</div>
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

// ─── Section B: Component Architecture by Layer ──────────────────────────

function ComponentArchitectureSection({
  components,
  patterns,
  delay,
  viewMode,
}: {
  components: ComponentSelectionV3[]
  patterns: MetaPatternV3[]
  delay: number
  viewMode: 'business' | 'technical'
}) {
  // Organize components by layer, bottom-to-top
  const layerGroups = ARCHITECTURE_LAYERS.map(layer => ({
    ...layer,
    components: components.filter(c => c.layer === layer.id),
  })).filter(lg => lg.components.length > 0)

  // Create pattern lookup
  const patternMap = new Map(patterns.map(p => [p.id, p]))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-4"
    >
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          Component Architecture
        </h3>
        <p className="text-xs text-gray-500">
          Six layers, bottom-to-top: Ingestion → Routing → Context → Execution → Output → Ops
        </p>
      </div>

      {/* Layers bottom-to-top */}
      {layerGroups.map((layer, layerIdx) => (
        <motion.div
          key={layer.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: delay + 0.1 + layerIdx * 0.15,
            duration: 0.3,
          }}
          className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50/50"
        >
          {/* Layer header */}
          <div
            className="px-4 py-3 border-b border-gray-200"
            style={{
              background: `${layer.accent}08`,
              borderBottomColor: `${layer.accent}20`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: layer.accent }}
              />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: layer.accent }}
              >
                {layer.label}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 ml-4.5">
              {viewMode === 'business'
                ? LAYER_DESCRIPTIONS[layer.id].business
                : LAYER_DESCRIPTIONS[layer.id].technical}
            </p>
          </div>

          {/* Components in layer */}
          <div className="p-3 space-y-2">
            {layer.components.map((comp, compIdx) => {
              const triggered = comp.triggeredBy
                .map(id => patternMap.get(id))
                .filter(Boolean) as MetaPatternV3[]
              return (
                <ComponentArchitectureCard
                  key={comp.id}
                  component={comp}
                  triggeredPatterns={triggered}
                  delay={delay + 0.15 + layerIdx * 0.15 + compIdx * 0.06}
                  viewMode={viewMode}
                />
              )
            })}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─── Section C: Trust Boundaries ────────────────────────────────────────

function TrustBoundariesSection({
  boundaries,
  delay,
}: {
  boundaries: TrustBoundaryV3[]
  delay: number
}) {
  const [expandedZone, setExpandedZone] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-3"
    >
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          Trust Boundaries & Human Oversight
        </h3>
        <p className="text-xs text-gray-500">
          How much human oversight is required for each operational zone.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {boundaries.map((boundary, idx) => {
          const tc = TRUST_COLORS[boundary.zone] || TRUST_COLORS.autonomous
          const isExpanded = expandedZone === boundary.id

          return (
            <motion.div
              key={boundary.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: delay + 0.1 + idx * 0.1,
                duration: 0.3,
              }}
              className="rounded-lg border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              style={{
                background: tc.bg,
                borderColor: tc.border,
              }}
              onClick={() => setExpandedZone(isExpanded ? null : boundary.id)}
            >
              <div className="p-3.5">
                {/* Zone badge + title */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold" style={{ color: tc.text }}>
                    {boundary.name}
                  </h4>
                  <span
                    className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                    style={{ background: `${tc.accent}20`, color: tc.text }}
                  >
                    {boundary.zone}
                  </span>
                </div>

                {/* Component count */}
                <div className="text-[10px] text-gray-700 font-medium mb-2">
                  {boundary.components.length} component{boundary.components.length !== 1 ? 's' : ''}
                </div>

                {/* Description */}
                <p className="text-[10px] leading-relaxed" style={{ color: tc.text }}>
                  {boundary.description}
                </p>

                {/* Expanded: component list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="pt-2 border-t" style={{ borderColor: `${tc.accent}30` }}>
                        <p className="text-[8px] font-bold uppercase tracking-widest mb-1.5" style={{ color: tc.text }}>
                          Components
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {boundary.components.map(comp => (
                            <span
                              key={comp}
                              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{
                                background: `${tc.accent}20`,
                                color: tc.text,
                              }}
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Fallback Section (if tile not V3-supported) ──────────────────────────

function V3FallbackNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3"
    >
      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800">
        V3 architecture data is not yet available for this use case. The existing composition flow will be shown instead.
      </p>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export function SolutionArchitectureV3() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const openMonitoringModal = useAgentPlaygroundStore((s) => s.openMonitoringModal)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const isV3Tile = activeTileId ? isV3SupportedTile(activeTileId) : false

  // V3 data
  const metaPatternsV3 = isV3Tile ? getMetaPatternsV3(resolveV3TileId(activeTileId!, 'metaPatterns')) : null
  const architectureDataV3 = isV3Tile ? getArchitectureDataV3(resolveV3TileId(activeTileId!, 'architecture')) : null

  // Fallback data (existing component)
  const archData = activeTileId ? getArchitectureData(activeTileId) : null
  const techStack = activeTileId ? getTechStack(activeTileId) : null

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
  }, [activeTileId])

  if (!tile) return null

  // If V3-supported tile, show V3 layout
  if (isV3Tile && metaPatternsV3 && architectureDataV3) {
    return (
      <div ref={containerRef} className="px-4 sm:px-8 py-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Architecture Composition
          </h2>
          <p className="text-sm text-gray-500">
            Every component choice justified by meta-pattern analysis
          </p>
        </motion.div>

        {/* Section A: Meta-Pattern Summary */}
        <MetaPatternSummarySection
          patterns={metaPatternsV3.patterns}
          delay={0.1}
        />

        {/* Section B: Component Architecture */}
        <ComponentArchitectureSection
          components={architectureDataV3.components}
          patterns={metaPatternsV3.patterns}
          delay={0.3}
          viewMode={viewMode}
        />

        {/* Section C: Trust Boundaries */}
        <TrustBoundariesSection
          boundaries={architectureDataV3.trustBoundaries}
          delay={0.5}
        />

        {/* Conviction callout */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              {viewMode === 'business'
                ? 'This custom architecture is built specifically for your use case. Every component was selected because your meta-patterns demand it. No templates, no guesses.'
                : 'Architecture composition uses constraint-satisfaction over meta-pattern complexity scores. Component selections are validated against your data residency, latency, and trust boundary requirements.'}
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <button
            onClick={openMonitoringModal}
            className="flex-1 py-3 px-5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: `linear-gradient(135deg, ${tile.color}, ${tile.color}cc)`,
              outlineColor: tile.color,
            }}
          >
            View Monitoring Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  // Fallback to existing component layout if not V3
  if (archData && techStack) {
    return (
      <div ref={containerRef} className="px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-5">
        {/* Header */}
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

        {/* V3 fallback notice */}
        <V3FallbackNotice />

        {/* Existing behavior would go here */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center py-8"
        >
          <p className="text-sm text-gray-600 mb-4">
            For this use case, please use the standard architecture composition flow.
          </p>
        </motion.div>
      </div>
    )
  }

  return null
}
