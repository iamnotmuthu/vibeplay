import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Loader2, CheckCircle2, AlertCircle, HelpCircle,
  X, Plus, Database, TriangleAlert, ChevronDown, ChevronRight, Users,
} from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedPatterns } from './patternData'
import type { StageId, PatternResults, SufficiencyPatternItem, DistributionData } from '@/store/types'

// ── helpers ──────────────────────────────────────────────────────────────────

function deriveCondition(p: SufficiencyPatternItem): string {
  if (p.condition) return p.condition
  return p.keySignals.slice(0, 2).join(' AND ')
}

function deriveConfidence(p: SufficiencyPatternItem, status: string): 'high' | 'low' {
  return p.confidence ?? (status === 'sufficient' ? 'high' : 'low')
}

function derivePct(p: SufficiencyPatternItem, status: string): number {
  if (p.pct !== undefined) return p.pct
  const base = status === 'sufficient' ? 74 : status === 'helpMe' ? 51 : 58
  return Math.round((base + (p.id * 7.3) % 22) * 10) / 10
}

function deriveTargetInd(p: SufficiencyPatternItem): 0 | 1 {
  return p.targetInd ?? (p.id % 2 === 0 ? 1 : 0)
}

function deriveAttributes(p: SufficiencyPatternItem): { name: string; value: string }[] {
  if (p.attributes) return p.attributes
  return p.keySignals.slice(0, 3).map((sig) => {
    const eq = sig.match(/^(.+?)=(.+)$/)
    if (eq) return { name: eq[1].trim(), value: eq[2].trim() }
    const cmp = sig.match(/^(.+?)\s+(in|<|>|!=|<=|>=)\s+(.+)$/)
    if (cmp) return { name: cmp[1].trim(), value: `${cmp[2]} ${cmp[3]}` }
    return { name: sig, value: '—' }
  })
}

// Generate related sub-cohorts dynamically from a primary pattern
function generateIncludedCohorts(
  attrs: { name: string; value: string }[],
  count: number,
  pct: number,
): { features: { name: string; value: string }[]; count: number; pct: number }[] {
  const extraPairs: { name: string; value: string }[] = [
    { name: 'SeniorCitizen', value: 'Yes' },
    { name: 'TechSupport', value: 'No' },
    { name: 'OnlineSecurity', value: 'No' },
    { name: 'StreamingTV', value: 'Yes' },
    { name: 'PaperlessBilling', value: 'Yes' },
    { name: 'Dependents', value: 'No' },
  ]

  const cohorts: { features: { name: string; value: string }[]; count: number; pct: number }[] = []

  // Cohort 1: all primary attrs + extra feature
  if (attrs.length >= 1) {
    const extra = extraPairs.find((e) => !attrs.find((a) => a.name === e.name)) ?? extraPairs[0]
    cohorts.push({
      features: [...attrs, extra],
      count: Math.round(count * (0.38 + (pct % 7) * 0.03)),
      pct: Math.min(99, pct + 4 + (pct % 5)),
    })
  }

  // Cohort 2: first 2 attrs only (subset)
  if (attrs.length >= 2) {
    cohorts.push({
      features: attrs.slice(0, 2),
      count: Math.round(count * (0.55 + (pct % 9) * 0.02)),
      pct: Math.max(50, pct - 6 + (pct % 4)),
    })
  }

  // Cohort 3: last attr + another extra
  if (attrs.length >= 2) {
    const extra2 = extraPairs.find((e) => !attrs.find((a) => a.name === e.name) && e.name !== (cohorts[0]?.features.at(-1)?.name)) ?? extraPairs[1]
    cohorts.push({
      features: [attrs[attrs.length - 1], attrs[0], extra2],
      count: Math.round(count * (0.28 + (pct % 6) * 0.02)),
      pct: Math.min(99, pct + 7 + (pct % 3)),
    })
  }

  return cohorts
}

// Derive numeric value ranges for AddPatternForm dropdowns
function getFeatureValues(dist: DistributionData): string[] {
  if (dist.type === 'categorical' && dist.bins) {
    return dist.bins.map((b) => b.label)
  }
  if (dist.type === 'numeric' && dist.stats) {
    const { min, mean, max } = dist.stats
    return [
      `< ${min + (mean - min) * 0.25}`.replace(/(\.\d{2})\d+/, '$1'),
      `${min}–${mean.toFixed(1)}`,
      `${mean.toFixed(1)}–${max}`,
      `> ${max - (max - mean) * 0.25}`.replace(/(\.\d{2})\d+/, '$1'),
    ]
  }
  return ['Low', 'Medium', 'High']
}

// ── PatternCard ───────────────────────────────────────────────────────────────

function PatternCard({
  pattern, status, delay,
}: {
  pattern: SufficiencyPatternItem
  status: 'sufficient' | 'insufficient' | 'helpMe'
  delay: number
}) {
  const [ignored, setIgnored] = useState(false)
  const [action, setAction] = useState<'none' | 'augment' | 'low-confidence'>('none')
  const [showIncluded, setShowIncluded] = useState(false)

  const condition = deriveCondition(pattern)
  const confidence = deriveConfidence(pattern, status)
  const pct = derivePct(pattern, status)
  const targetInd = deriveTargetInd(pattern)
  const attrs = deriveAttributes(pattern)
  const includedCohorts = generateIncludedCohorts(attrs, pattern.count, pct)

  const isInsufficient = status === 'insufficient'
  const isHelpMe = status === 'helpMe'

  if (ignored) return null

  const borderColor = isInsufficient
    ? 'rgba(239,68,68,0.25)'
    : isHelpMe
      ? 'rgba(234,179,8,0.25)'
      : '#e5e7eb'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay }}
      className="rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
      style={{ background: '#ffffff', border: `1px solid ${borderColor}`, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      {/* Insufficient banner */}
      {isInsufficient && (
        <div
          className="px-4 py-2.5 flex items-start gap-2.5"
          style={{ background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}
        >
          <TriangleAlert className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-red-600">High Impact with Insufficient Data:</div>
            <div className="text-xs mt-0.5 text-red-400">
              This cohort has insufficient data for reliable modeling.
            </div>
          </div>
        </div>
      )}

      {/* Help Me banner */}
      {isHelpMe && (
        <div
          className="px-4 py-2.5 flex items-start gap-2.5"
          style={{ background: 'rgba(234,179,8,0.05)', borderBottom: '1px solid rgba(234,179,8,0.15)' }}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-600">Cohorts with mixed patterns requiring human review</div>
        </div>
      )}

      {/* Main body */}
      <div className="p-4">
        {/* Title + confidence */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-sm font-semibold text-gray-900">{condition}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto shrink-0" />
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={
              confidence === 'high'
                ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a' }
                : { background: 'rgba(239,68,68,0.10)', color: '#dc2626' }
            }
          >
            {confidence === 'high' ? 'High Confidence' : 'Low Confidence'}
          </span>
        </div>

        {/* Stats */}
        <p className="text-sm mb-0.5">
          <span className="font-bold text-gray-900">{pct}%</span>
          <span className="text-gray-500"> of this pattern has </span>
          <span className="font-bold text-gray-900">Recommended IND</span>
          <span className="text-gray-500"> = </span>
          <span className="font-bold text-gray-900">{targetInd}</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Records in cohort: <span className="text-gray-700 font-semibold">{pattern.count.toLocaleString()}</span>
        </p>

        {/* Defining Attributes table */}
        <div className="text-xs font-medium text-gray-500 mb-1.5">Defining Attributes:</div>
        <div className="rounded-lg overflow-hidden mb-3" style={{ border: '1px solid #e5e7eb' }}>
          {attrs.map((attr, i) => (
            <div
              key={i}
              className="flex items-center px-3 py-2.5"
              style={{
                borderBottom: i < attrs.length - 1 ? '1px solid #e5e7eb' : 'none',
                background: i % 2 === 0 ? '#f9fafb' : '#ffffff',
              }}
            >
              <span className="text-xs text-gray-500 flex-1">{attr.name}</span>
              <span className="text-xs text-gray-700 font-mono">{attr.value}</span>
            </div>
          ))}
        </div>

        {/* Included Cohorts toggle */}
        {includedCohorts.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowIncluded((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-50"
              style={{ color: '#7c3aed', border: '1px solid rgba(124,58,237,0.25)' }}
            >
              <Users className="w-3.5 h-3.5" />
              Included Cohorts
              {showIncluded
                ? <ChevronDown className="w-3 h-3 ml-0.5" />
                : <ChevronRight className="w-3 h-3 ml-0.5" />}
            </button>

            <AnimatePresence>
              {showIncluded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="mt-2 space-y-2">
                    {includedCohorts.map((cohort, ci) => (
                      <div
                        key={ci}
                        className="rounded-lg px-3 py-2.5"
                        style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.15)' }}
                      >
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {cohort.features.map((f, fi) => (
                            <span key={fi} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}>
                              {f.name}={f.value}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                          <span>{cohort.count.toLocaleString()} records</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action buttons — insufficient */}
        {isInsufficient && action === 'none' && (
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setAction('augment')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ background: '#0d9488', color: '#fff' }}
            >
              <Database className="w-3 h-3" /> Augment Data
            </button>
            <button
              onClick={() => setIgnored(true)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
              style={{ border: '1px solid #e5e7eb' }}
            >
              Ignore
            </button>
          </div>
        )}
        {isInsufficient && action === 'augment' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 px-3 py-2.5 rounded-lg text-xs text-teal-700"
            style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)' }}
          >
            ✓ Augmentation queued — synthetic samples will be generated during validation.
          </motion.div>
        )}

        {/* Action buttons — helpMe */}
        {isHelpMe && action === 'none' && (
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setAction('low-confidence')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ background: '#d97706', color: '#fff' }}
            >
              <TriangleAlert className="w-3 h-3" /> Low Confidence Prediction
            </button>
            <button
              onClick={() => setIgnored(true)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
              style={{ border: '1px solid #e5e7eb' }}
            >
              Ignore
            </button>
          </div>
        )}
        {isHelpMe && action === 'low-confidence' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 px-3 py-2.5 rounded-lg text-xs text-amber-700"
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}
          >
            ⚠ Low confidence prediction scheduled — model will flag these cohorts for human review.
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ── Add Pattern form (dropdown-based) ────────────────────────────────────────

function AddPatternForm({
  onAdd, onCancel,
}: {
  onAdd: (p: SufficiencyPatternItem, status: 'sufficient' | 'insufficient' | 'helpMe') => void
  onCancel: () => void
}) {
  const distributions = usePlaygroundStore((s) => s.edaResults?.distributions ?? [])
  const featureNames = distributions.map((d) => d.feature)

  const [rows, setRows] = useState<{ feature: string; value: string }[]>([{ feature: featureNames[0] ?? '', value: '' }])
  const [phase, setPhase] = useState<'input' | 'searching' | 'found'>('input')
  const [discovered, setDiscovered] = useState<SufficiencyPatternItem | null>(null)
  const [assignedStatus, setAssignedStatus] = useState<'sufficient' | 'insufficient' | 'helpMe'>('sufficient')

  const getValues = (featureName: string): string[] => {
    const dist = distributions.find((d) => d.feature === featureName)
    if (!dist) return []
    return getFeatureValues(dist)
  }

  const updateRow = (i: number, field: 'feature' | 'value', val: string) => {
    setRows((prev) => prev.map((r, idx) => {
      if (idx !== i) return r
      if (field === 'feature') return { feature: val, value: '' } // reset value when feature changes
      return { ...r, value: val }
    }))
  }

  const handleFind = async () => {
    const filled = rows.filter((r) => r.feature && r.value)
    if (!filled.length) return
    setPhase('searching')
    await new Promise((r) => setTimeout(r, 2200))
    const condition = filled.map((r) => `${r.feature}=${r.value}`).join(' AND ')
    const rand = Math.random()
    const status: 'sufficient' | 'insufficient' | 'helpMe' = rand < 0.55 ? 'sufficient' : rand < 0.85 ? 'insufficient' : 'helpMe'
    setAssignedStatus(status)
    const found: SufficiencyPatternItem = {
      id: Date.now(),
      label: condition,
      description: 'User-defined pattern',
      count: Math.floor(Math.random() * 2800) + 600,
      keySignals: filled.map((r) => `${r.feature}=${r.value}`),
      condition,
      confidence: 'high',
      pct: Math.round(68 + Math.random() * 22),
      targetInd: 1,
      attributes: filled.map((r) => ({ name: r.feature, value: r.value })),
    }
    setDiscovered(found)
    setPhase('found')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4"
      style={{ background: '#ffffff', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div className="text-sm font-semibold text-gray-900 mb-1">Add New Pattern</div>
      <p className="text-xs text-gray-500 mb-3">
        Select features and values to define a cohort — the system will find matching records.
      </p>

      {phase === 'input' && (
        <>
          <div className="space-y-2 mb-3">
            {rows.map((row, i) => {
              const values = getValues(row.feature)
              return (
                <div key={i} className="flex items-center flex-wrap gap-2">
                  {/* Feature dropdown */}
                  <select
                    value={row.feature}
                    onChange={(e) => updateRow(i, 'feature', e.target.value)}
                    className="w-44 px-2.5 py-1.5 rounded-lg text-xs text-gray-900 bg-white border border-gray-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select feature…</option>
                    {featureNames.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>

                  {/* Value dropdown */}
                  <select
                    value={row.value}
                    onChange={(e) => updateRow(i, 'value', e.target.value)}
                    disabled={!row.feature}
                    className="w-36 px-2.5 py-1.5 rounded-lg text-xs text-gray-900 bg-white border border-gray-200 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                  >
                    <option value="">Select value…</option>
                    {values.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>

                  {rows.length > 1 && (
                    <button
                      onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={() => setRows((prev) => [...prev, { feature: featureNames[0] ?? '', value: '' }])}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500 mb-4"
          >
            <Plus className="w-3 h-3" /> Add Feature
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleFind}
              disabled={!rows.some((r) => r.feature && r.value)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Search className="w-3.5 h-3.5" /> Find Matching Cohorts
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              style={{ border: '1px solid #e5e7eb' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {phase === 'searching' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-6"
        >
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <div className="text-xs text-gray-500 text-center">
            Scanning dataset for cohorts matching your pattern…
          </div>
        </motion.div>
      )}

      {phase === 'found' && discovered && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className="rounded-lg p-3 mb-3"
            style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">Cohort Discovered</span>
            </div>
            <div className="text-xs text-gray-700 mb-2">{discovered.condition}</div>
            <div className="flex items-center gap-4 text-[10px] text-gray-500">
              <span>Records: <span className="text-gray-700 font-semibold">{discovered.count.toLocaleString()}</span></span>
              <span>Target IND: <span className="text-gray-700 font-semibold">{discovered.pct}%</span></span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAdd(discovered, assignedStatus)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
            >
              {assignedStatus === 'sufficient' ? 'Add to Dominant Patterns' : assignedStatus === 'insufficient' ? 'Add to Non-Dominant Patterns' : 'Add to Fuzzy Patterns'}
            </button>
            <button
              onClick={() => { setPhase('input'); setDiscovered(null); setRows([{ feature: featureNames[0] ?? '', value: '' }]) }}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              style={{ border: '1px solid #e5e7eb' }}
            >
              Search Again
            </button>
            <button onClick={onCancel} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon, label, count, color, collapsed, onToggle,
}: {
  icon: React.ReactNode
  label: string
  count: number
  color: string
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-3 hover:bg-gray-50 transition-colors"
      style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold" style={{ color }}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${color}18`, color }}
        >
          {count} cohort{count !== 1 ? 's' : ''}
        </span>
        {collapsed
          ? <ChevronRight className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function PatternDiscovery() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setPatternResults = usePlaygroundStore((s) => s.setPatternResults)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [data, setData] = useState<PatternResults | null>(null)
  const [phase, setPhase] = useState<'loading' | 'sufficient' | 'insufficient' | 'helpMe' | 'complete'>('loading')
  const [userPatterns, setUserPatterns] = useState<{ pattern: SufficiencyPatternItem; status: 'sufficient' | 'insufficient' | 'helpMe' }[]>([])
  const [addingNew, setAddingNew] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggleCollapse = (key: string) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))

  const runDiscovery = useCallback(async () => {
    if (!selectedDataset) return
    const results = getPrecomputedPatterns(selectedDataset.id)
    setData(results)

    addLog(`Analysing ${results.totalRecords.toLocaleString()} records for cohort data sufficiency...`, 'info')
    await new Promise((r) => setTimeout(r, 1800))

    setPhase('sufficient')
    addLog(`Found ${results.sufficient.length} patterns with sufficient training data`, 'success')
    await new Promise((r) => setTimeout(r, 1500))

    setPhase('insufficient')
    addLog(`Identified ${results.insufficient.length} patterns with insufficient data — flagged for augmentation`, 'warning')
    await new Promise((r) => setTimeout(r, 1400))

    if (results.helpMe.length > 0) {
      setPhase('helpMe')
      addLog(`Detected ${results.helpMe.length} ambiguous pattern${results.helpMe.length !== 1 ? 's' : ''} — fuzzy cohorts`, 'info')
      await new Promise((r) => setTimeout(r, 1300))
    }

    setPhase('complete')
    setPatternResults(results)
    addLog('Pattern recognition complete — sufficiency analysis ready', 'success')
  }, [selectedDataset, addLog, setPatternResults])

  useEffect(() => {
    const { patternResults: stored } = usePlaygroundStore.getState()
    if (stored) {
      setData(stored)
      setPhase('complete')
      return
    }
    runDiscovery()
  }, [runDiscovery])

  const handleNext = () => { completeStep(4); setStep(5 as StageId) }

  const totalSufficient = data?.sufficient.reduce((s, p) => s + p.count, 0) ?? 0
  const totalInsufficient = data?.insufficient.reduce((s, p) => s + p.count, 0) ?? 0
  const totalHelpMe = data?.helpMe.reduce((s, p) => s + p.count, 0) ?? 0
  const hasHelpMe = (data?.helpMe.length ?? 0) > 0
  const showInsufficient = phase === 'insufficient' || phase === 'helpMe' || phase === 'complete'
  const showHelpMe = phase === 'helpMe' || phase === 'complete'

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: '#e5e7eb', background: '#ffffff' }}>
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-gray-900">Pattern Recognition</h2>
          {phase !== 'complete' && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
          {phase === 'complete' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: 'rgba(20,184,166,0.10)', color: '#0d9488' }}
            >
              Analysis Complete
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Assessing whether each discovered pattern has sufficient data to build a reliable model — or needs augmentation.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: '#fafafa' }}>

        {/* Stats row */}
        <AnimatePresence>
          {data && phase !== 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`grid gap-3 ${hasHelpMe ? 'grid-cols-4' : 'grid-cols-3'}`}
            >
              {[
                { label: 'Total Records', value: data.totalRecords, color: '#1e293b', accent: '#f3f4f6' },
                { label: 'Sufficient Patterns', value: data.sufficient.length, sub: `${totalSufficient.toLocaleString()} records`, color: '#16a34a', accent: 'rgba(74,222,128,0.10)' },
                { label: 'Need Augmentation', value: data.insufficient.length, sub: `${totalInsufficient.toLocaleString()} records`, color: '#dc2626', accent: 'rgba(248,113,113,0.10)' },
                ...(hasHelpMe ? [{ label: 'Fuzzy Patterns', value: data.helpMe.length, sub: `${totalHelpMe.toLocaleString()} records`, color: '#d97706', accent: 'rgba(251,191,36,0.10)' }] : []),
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-4 text-center"
                  style={{ background: s.accent, border: `1px solid ${s.color}22`, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
                >
                  <div className="text-2xl font-bold" style={{ color: s.color }}>
                    <CountUpNumber end={s.value} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  {s.sub && <div className="text-[10px] font-mono mt-0.5" style={{ color: `${s.color}99` }}>{s.sub}</div>}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading placeholder */}
        {phase === 'loading' && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center gap-3 px-5 py-6 rounded-xl border border-dashed text-sm text-gray-500"
            style={{ borderColor: '#d1d5db' }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning {selectedDataset?.rows.toLocaleString()} records for cohort patterns...
          </motion.div>
        )}

        {/* Dominant Patterns: Sufficient */}
        <AnimatePresence>
          {data && phase !== 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionHeader
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                label="Dominant Patterns: Pattern with Sufficient Data"
                count={data.sufficient.length + userPatterns.filter(u => u.status === 'sufficient').length}
                color="#16a34a"
                collapsed={!!collapsed['sufficient']}
                onToggle={() => toggleCollapse('sufficient')}
              />
              <AnimatePresence>
                {!collapsed['sufficient'] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      <p className="text-xs text-indigo-600 font-medium">Click any pattern card to explore details</p>
                    </div>
                    <div className="space-y-3">
                      {data.sufficient.map((p, i) => (
                        <PatternCard key={p.id} pattern={p} status="sufficient" delay={i * 0.08} />
                      ))}
                      {userPatterns.filter(u => u.status === 'sufficient').map((u, i) => (
                        <PatternCard key={u.pattern.id} pattern={u.pattern} status="sufficient" delay={i * 0.08} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Non-Dominant Patterns: Insufficient */}
        <AnimatePresence>
          {data && showInsufficient && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionHeader
                icon={<AlertCircle className="w-4 h-4 text-red-500" />}
                label="Non-Dominant Patterns: Impactful Patterns with Insufficient Data"
                count={data.insufficient.length + userPatterns.filter(u => u.status === 'insufficient').length}
                color="#dc2626"
                collapsed={!!collapsed['insufficient']}
                onToggle={() => toggleCollapse('insufficient')}
              />
              <AnimatePresence>
                {!collapsed['insufficient'] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="space-y-3">
                      {data.insufficient.map((p, i) => (
                        <PatternCard key={p.id} pattern={p} status="insufficient" delay={i * 0.08} />
                      ))}
                      {userPatterns.filter(u => u.status === 'insufficient').map((u, i) => (
                        <PatternCard key={u.pattern.id} pattern={u.pattern} status="insufficient" delay={i * 0.08} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fuzzy Patterns */}
        <AnimatePresence>
          {data && hasHelpMe && showHelpMe && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionHeader
                icon={<HelpCircle className="w-4 h-4 text-amber-500" />}
                label="Fuzzy Patterns"
                count={data.helpMe.length + userPatterns.filter(u => u.status === 'helpMe').length}
                color="#d97706"
                collapsed={!!collapsed['helpMe']}
                onToggle={() => toggleCollapse('helpMe')}
              />
              <AnimatePresence>
                {!collapsed['helpMe'] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="space-y-3">
                      {data.helpMe.map((p, i) => (
                        <PatternCard key={p.id} pattern={p} status="helpMe" delay={i * 0.08} />
                      ))}
                      {userPatterns.filter(u => u.status === 'helpMe').map((u, i) => (
                        <PatternCard key={u.pattern.id} pattern={u.pattern} status="helpMe" delay={i * 0.08} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add pattern */}
        {phase === 'complete' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {addingNew ? (
              <AddPatternForm
                onAdd={(p, s) => { setUserPatterns((prev) => [...prev, { pattern: p, status: s }]); setAddingNew(false) }}
                onCancel={() => setAddingNew(false)}
              />
            ) : (
              <button
                onClick={() => setAddingNew(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-50"
                style={{ border: '1px dashed rgba(99,102,241,0.4)', color: '#6366f1', background: '#ffffff' }}
              >
                <Plus className="w-4 h-4" /> Add New Pattern
              </button>
            )}
          </motion.div>
        )}
      </div>

      {phase === 'complete' && (
        <div className="px-6 py-2.5 text-center" style={{ background: 'rgba(99,102,241,0.04)', borderTop: '1px solid rgba(99,102,241,0.12)' }}>
          <p className="text-xs text-indigo-600 font-medium">
            Review and adjust patterns above, then continue to validation.
          </p>
        </div>
      )}
      <BottomActionBar
        onNext={phase === 'complete' ? handleNext : undefined}
        nextDisabled={phase !== 'complete'}
        nextLabel="Continue to Validation Summary"
      />
    </div>
  )
}
