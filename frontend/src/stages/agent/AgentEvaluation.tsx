import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  FlaskConical,
} from 'lucide-react'
import type { PatternClassification, DiscoveredPattern } from '@/store/agentTypes'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { getEvalMetrics, getMetricWhy } from '@/lib/agent/componentTechData'
import { PATTERN_CLASSIFICATION_META } from '@/store/agentTypes'

// ─── Tier color system for pattern ID badges ───────────────────────────────

const TIER_COLOR_MAP: Record<string, { color: string; bg: string }> = {
  simple: { color: '#059669', bg: 'rgba(5,150,105,0.08)' },      // green
  complex: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },     // red
  fuzzy: { color: '#d97706', bg: 'rgba(217,119,6,0.10)' },       // amber
}

function getTierFromPatternId(id: string): 'simple' | 'complex' | 'fuzzy' {
  if (id.includes('-S')) return 'simple'
  if (id.includes('-C')) return 'complex'
  if (id.includes('-F')) return 'fuzzy'
  return 'fuzzy' // default
}

interface PatternGroup {
  classification: PatternClassification
  patterns: DiscoveredPattern[]
}

// ─── Metrics Bar (tab selector) ─────────────────────────────────────────


function MetricsBar({
  simpleCount,
  complexCount,
  fuzzyCount,
  activeTab,
  onTabChange,
}: {
  simpleCount: number
  complexCount: number
  fuzzyCount: number
  activeTab: PatternClassification
  onTabChange: (tab: PatternClassification) => void
}) {
  const tabs: { classification: PatternClassification; count: number }[] = [
    { classification: 'simple', count: simpleCount },
    { classification: 'complex', count: complexCount },
    { classification: 'fuzzy', count: fuzzyCount },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="mb-6"
      role="tablist"
      aria-label="Pattern Classifications"
    >

      {/* Colored tab tiles */}
      <div className="grid grid-cols-3 gap-3">
        {tabs.map(({ classification, count }) => {
          const meta = PATTERN_CLASSIFICATION_META[classification]
          const isActive = activeTab === classification
          return (
            <motion.button
              key={classification}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(classification)}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl p-4 text-center transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              style={{
                background: isActive ? meta.activeBg : meta.bgColor,
                border: `1px solid ${meta.borderColor}`,
                borderBottom: isActive ? `4px solid ${meta.color}` : `1px solid ${meta.borderColor}`,
              }}
            >
              <div className="text-2xl font-bold" style={{ color: meta.color }}>
                {count}
              </div>
              <div className="text-sm font-semibold text-gray-700 mt-1">{meta.label}</div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Expanded Pattern Detail (questions) ────────────────────────────────

function PatternDetail({ pattern }: { pattern: DiscoveredPattern }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 pt-1">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Validation Queries (Synthetic)
          </p>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">(auto-generated)</span>
        </div>
        <div className="space-y-1.5">
          {pattern.exampleQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <FlaskConical className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-xs text-gray-700 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Pattern Row ────────────────────────────────────────────────────────

function PatternRow({
  pattern,
  validationCount,
  delay,
}: {
  pattern: DiscoveredPattern
  validationCount: number
  delay: number
}) {
  const [expanded, setExpanded] = useState(false)
  const tier = getTierFromPatternId(pattern.id)
  const tierStyle = TIER_COLOR_MAP[tier]

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="rounded-lg border border-gray-100 bg-gray-50/50 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono font-bold px-2.5 py-1 rounded text-xs" style={{ background: tierStyle.bg, color: tierStyle.color }}>
              {pattern.id}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-0.5">{pattern.label}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {pattern.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
          <span className="text-xs font-bold text-gray-700">
            {validationCount}
          </span>
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-gray-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3 h-3 text-gray-400" aria-hidden="true" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && <PatternDetail pattern={pattern} />}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Metric color system (maximally distinct — same as SolutionArchitecture) ──

const EVAL_METRIC_COLORS: { color: string; bg: string }[] = [
  { color: '#059669', bg: '#ecfdf5' }, // emerald — primary
  { color: '#2563eb', bg: '#eff6ff' }, // blue — secondary
  { color: '#d97706', bg: '#fffbeb' }, // amber — tertiary
  { color: '#9333ea', bg: '#faf5ff' }, // purple — quaternary
]

// ─── Measurement Plan (target only — tests haven't run yet) ──────────────

function AgentMeasurementPlan({ tileId }: { tileId: string }) {
  const [collapsed, setCollapsed] = useState(true)
  const metrics = getEvalMetrics(tileId)
  const why = getMetricWhy(tileId)
  if (!metrics || !why) return null

  const items = [
    { label: 'Primary Metric', metric: metrics.metric1, why: why.why1 },
    { label: 'Secondary Metric', metric: metrics.metric2, why: why.why2 },
    { label: 'Tertiary Metric', metric: metrics.metric3, why: why.why3 },
    { label: 'Quaternary Metric', metric: metrics.metric4, why: why.why4 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="mb-6"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg cursor-pointer transition-all"
        style={{
          background: collapsed ? '#fafafa' : 'transparent',
          border: collapsed ? '1px solid #e5e7eb' : 'none',
          boxShadow: collapsed ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
        }}
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500 transition-transform" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" aria-hidden="true" />
          )}
        </div>
        
        <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Measurement Plan</span>
        
        {collapsed && (
          <div className="flex items-center gap-1.5 flex-1">
            {items.map(({ metric }, idx) => {
              const mc = EVAL_METRIC_COLORS[idx] || EVAL_METRIC_COLORS[0]
              return (
                <span
                  key={idx}
                  className="text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap truncate"
                  style={{ background: `${mc.color}14`, color: mc.color, border: `1px solid ${mc.color}30` }}
                >
                  {metric.name}
                </span>
              )
            })}
          </div>
        )}
        
        {!collapsed && (
          <>
            <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
            <span className="text-[10px] text-gray-400 italic">how we will evaluate the agent</span>
          </>
        )}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(({ label, metric, why: whyText }, idx) => {
          const mc = EVAL_METRIC_COLORS[idx] || EVAL_METRIC_COLORS[0]

          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.1, duration: 0.35, ease: 'easeOut' }}
              className="rounded-xl p-4"
              style={{
                background: '#ffffff',
                border: `1px solid ${mc.color}25`,
                borderLeft: `3px solid ${mc.color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: `${mc.color}14`, color: mc.color, border: `1px solid ${mc.color}30` }}
                >
                  {label}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1 leading-snug">{metric.name}</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{metric.description}</p>

              {/* Target value — the only measurable shown pre-test */}
              <div className="flex items-baseline gap-1.5 mb-2 px-2.5 py-1.5 rounded-lg" style={{ background: mc.bg }}>
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: mc.color }}>Target</span>
                <span className="text-sm font-bold text-gray-900 tabular-nums">
                  {metric.target} {metric.unit}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed italic">{whyText}</p>
            </motion.div>
          )
        })}
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Dummy Pattern Groups ────────────────────────────────────────────────

const DUMMY_GROUPS: PatternGroup[] = [
  {
    classification: 'simple',
    patterns: [
      {
        id: 'P-001-S', patternType: 'direct-retrieval', classification: 'simple',
        label: 'Standard Document Processing',
        description: 'Single-source, well-structured input with all required fields present. Agent extracts and validates data with high confidence.',
        exampleQuestions: ['Process this invoice from a known vendor', 'Extract line items from a structured PDF', 'Validate totals against the purchase order'],
        coveragePct: 94, inferenceNote: 'All required fields present, format recognized', ambiguityNote: undefined,
        activatedComponents: ['input-validation', 'rag', 'output-guardrails'], importanceRank: 1,
      },
      {
        id: 'P-002-S', patternType: 'direct-retrieval', classification: 'simple',
        label: 'Known Vendor, Single Currency',
        description: 'Invoice from a pre-approved vendor with a single currency and standard line-item format. No reconciliation needed.',
        exampleQuestions: ['Process AWS invoice in USD', 'Match Staples invoice to open PO', 'Auto-approve invoice under threshold'],
        coveragePct: 91, inferenceNote: 'Vendor whitelisted, currency resolved, PO matched', ambiguityNote: undefined,
        activatedComponents: ['auth', 'rag', 'policy-enforcement'], importanceRank: 2,
      },
      {
        id: 'P-003-S', patternType: 'direct-retrieval', classification: 'simple',
        label: 'Full Match — No Discrepancy',
        description: 'Invoice total, line items, and PO reference all match exactly. Routed for auto-payment without human review.',
        exampleQuestions: ['Invoice #4821 matches PO #3310 exactly', 'Auto-pay approved vendor with zero variance', 'Route to payment queue after full match'],
        coveragePct: 88, inferenceNote: 'Zero variance detected across all fields', ambiguityNote: undefined,
        activatedComponents: ['workflow-orchestrator', 'output-guardrails', 'logging-analytics'], importanceRank: 3,
      },
      {
        id: 'P-004-S', patternType: 'lookup', classification: 'simple',
        label: 'Duplicate Detection — Exact',
        description: 'Invoice number and vendor ID match a previously processed record. Agent flags as duplicate and halts processing.',
        exampleQuestions: ['Is invoice #INV-2200 already in the system?', 'Detect re-submission of paid invoice', 'Block duplicate from entering approval queue'],
        coveragePct: 97, inferenceNote: 'Exact match on invoice ID + vendor hash', ambiguityNote: undefined,
        activatedComponents: ['input-validation', 'rag', 'failure-handling'], importanceRank: 4,
      },
      {
        id: 'P-005-S', patternType: 'classification', classification: 'simple',
        label: 'Cost Center Auto-Coding',
        description: 'Line item categories map unambiguously to a single cost center. Agent assigns codes without prompting the user.',
        exampleQuestions: ['Code AWS EC2 charges to Engineering budget', 'Assign office supplies to Facilities', 'Map SaaS subscription to Software budget'],
        coveragePct: 86, inferenceNote: 'Category → cost center mapping resolved via policy table', ambiguityNote: undefined,
        activatedComponents: ['rag', 'policy-enforcement', 'output-guardrails'], importanceRank: 5,
      },
    ],
  },
  {
    classification: 'complex',
    patterns: [
      {
        id: 'P-006-C', patternType: 'multi-step', classification: 'complex',
        label: 'Multi-Vendor Consolidated Invoice',
        description: 'Invoice bundles charges from multiple sub-vendors. Agent must split, attribute, and validate each vendor segment independently.',
        exampleQuestions: ['Split AWS consolidated bill across accounts', 'Attribute GCP charges to project codes', 'Reconcile multi-vendor bundle with 3 POs'],
        coveragePct: 72, inferenceNote: 'Requires vendor-segment extraction before PO matching', ambiguityNote: 'Sub-vendor boundaries may overlap in non-standard formats',
        activatedComponents: ['input-validation', 'rag', 'cross-encoder-reranking', 'workflow-orchestrator'], importanceRank: 6,
      },
      {
        id: 'P-007-C', patternType: 'multi-step', classification: 'complex',
        label: 'Currency Conversion with Variance',
        description: 'Invoice issued in a foreign currency with a spot rate that differs from the contracted rate. Agent calculates variance and escalates if above threshold.',
        exampleQuestions: ['Process EUR invoice with 2.1% FX variance', 'Reconcile GBP invoice against USD PO', 'Flag EUR/USD spread exceeding policy limit'],
        coveragePct: 68, inferenceNote: 'FX rate lookup required; variance formula applied', ambiguityNote: 'Rate date ambiguity if invoice spans month-end',
        activatedComponents: ['api-gateway', 'rag', 'failure-handling', 'policy-enforcement'], importanceRank: 7,
      },
      {
        id: 'P-008-C', patternType: 'conditional-routing', classification: 'complex',
        label: 'Partial Goods Receipt — Pro-Rata',
        description: 'Only a subset of ordered goods have been received. Agent calculates the pro-rata payable amount and holds the remainder pending receipt confirmation.',
        exampleQuestions: ['Pay 60% of invoice pending delivery confirmation', 'Hold remainder until 3PL receipt is uploaded', 'Escalate if goods receipt exceeds invoice by >5%'],
        coveragePct: 63, inferenceNote: 'Goods receipt % sourced from warehouse system', ambiguityNote: 'Delivery confirmation lag may cause false holds',
        activatedComponents: ['workflow-orchestrator', 'rag', 'cross-encoder-reranking', 'failure-handling', 'output-guardrails'], importanceRank: 8,
      },
      {
        id: 'P-009-C', patternType: 'multi-step', classification: 'complex',
        label: 'Retroactive Price Adjustment',
        description: 'Vendor applies a retroactive discount or surcharge referencing a prior period invoice. Agent traces back the original transaction and recalculates.',
        exampleQuestions: ['Apply Q3 volume discount to current invoice', 'Reconcile retroactive fuel surcharge from Sept', 'Trace credit note to original PO and rebalance'],
        coveragePct: 58, inferenceNote: 'Requires historical PO lookup + delta calculation', ambiguityNote: 'Prior period closure may prevent adjustment',
        activatedComponents: ['rag', 'api-gateway', 'workflow-orchestrator', 'logging-analytics'], importanceRank: 9,
      },
    ],
  },
  {
    classification: 'fuzzy',
    patterns: [
      {
        id: 'P-010-F', patternType: 'ambiguous', classification: 'fuzzy',
        label: 'Unrecognized Vendor Format',
        description: 'Invoice arrives from an unregistered vendor in a non-standard layout. OCR confidence is below threshold and field extraction is incomplete.',
        exampleQuestions: ['Process invoice from new vendor with handwritten totals', 'Handle scanned PDF with unclear line items', 'Route unrecognized format for manual review'],
        coveragePct: 41, inferenceNote: 'OCR score below 0.72 threshold; fields partially extracted', ambiguityNote: 'Vendor onboarding may be pending; manual field verification required',
        activatedComponents: ['input-validation', 'failure-handling', 'logging-analytics'], importanceRank: 10,
      },
      {
        id: 'P-011-F', patternType: 'ambiguous', classification: 'fuzzy',
        label: 'Disputed Line Item — No Prior Context',
        description: 'A line item charge has no matching PO, no historical precedent, and the vendor contact is unresponsive. Agent cannot auto-resolve.',
        exampleQuestions: ['Investigate $4,200 "miscellaneous services" charge', 'Hold invoice pending vendor clarification on item 7', 'Escalate disputed charge with no PO reference'],
        coveragePct: 35, inferenceNote: 'No PO match found; vendor dispute log empty', ambiguityNote: 'Requires domain expert to determine if charge is valid or fraudulent',
        activatedComponents: ['rag', 'failure-handling', 'workflow-orchestrator'], importanceRank: 11,
      },
      {
        id: 'P-012-F', patternType: 'ambiguous', classification: 'fuzzy',
        label: 'Split Cost Center — Policy Gap',
        description: 'A charge spans two departments but the allocation policy does not specify a split ratio. Agent flags for finance team decision.',
        exampleQuestions: ['Allocate shared IT infrastructure cost across 3 teams', 'Flag invoice that spans Engineering and Marketing budgets', 'Request split ratio approval from finance manager'],
        coveragePct: 29, inferenceNote: 'Cost center policy table has no rule for this category combination', ambiguityNote: 'Finance team must define allocation ratio before processing can continue',
        activatedComponents: ['policy-enforcement', 'workflow-orchestrator', 'logging-analytics'], importanceRank: 12,
      },
    ],
  },
]

// ─── Main Component ─────────────────────────────────────────────────────

export function AgentEvaluation() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const [activeTab, setActiveTab] = useState<PatternClassification>('simple')

  const groups: PatternGroup[] = DUMMY_GROUPS

  const simpleCount = DUMMY_GROUPS.find((g) => g.classification === 'simple')?.patterns.length ?? 0
  const complexCount = DUMMY_GROUPS.find((g) => g.classification === 'complex')?.patterns.length ?? 0
  const fuzzyCount = DUMMY_GROUPS.find((g) => g.classification === 'fuzzy')?.patterns.length ?? 0

  const activeGroup = groups.find((g) => g.classification === activeTab)
  const patternValidationCounts = new Map(
    (activeGroup?.patterns ?? []).map((p) => [p.id, p.exampleQuestions.length])
  )


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full px-4 sm:px-6 py-8 space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-black text-gray-900 mb-1">
          Agent Evaluation
        </h1>
        <p className="text-sm text-gray-600">
          How well your agent handles each type of request. Click any
          pattern to see the resolution flow and example questions.
        </p>
      </motion.div>

      {/* Measurement Plan (4 metrics) */}
      {activeTileId && (
        <AgentMeasurementPlan tileId={activeTileId} />
      )}

      {/* Metrics Bar (doubles as tab selector) */}
      <MetricsBar
        simpleCount={simpleCount}
        complexCount={complexCount}
        fuzzyCount={fuzzyCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab content */}
      <div>
        <div role="tabpanel" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            {activeGroup && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 mt-4"
              >
                {/* Classification description */}
                <div className="px-1 py-2">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {PATTERN_CLASSIFICATION_META[activeTab].description}
                  </p>
                </div>

                {/* Patterns flat list */}
                <div className="space-y-2">
                  {activeGroup.patterns.map((pattern, i) => (
                    <PatternRow
                      key={pattern.id}
                      pattern={pattern}
                      validationCount={patternValidationCounts.get(pattern.id) ?? 0}
                      delay={0.05 + i * 0.04}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
