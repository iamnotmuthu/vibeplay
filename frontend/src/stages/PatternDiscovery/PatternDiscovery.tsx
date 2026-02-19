import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Loader2, CheckCircle2, AlertCircle, HelpCircle,
  Pencil, X, Plus, Database, TriangleAlert, ChevronDown, ChevronRight,
} from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedPatterns } from './patternData'
import type { StageId, PatternResults, SufficiencyPatternItem } from '@/store/types'

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

// ── PatternCard ───────────────────────────────────────────────────────────────

function PatternCard({
  pattern, status, delay,
}: {
  pattern: SufficiencyPatternItem
  status: 'sufficient' | 'insufficient' | 'helpMe'
  delay: number
}) {
  const [disputed, setDisputed] = useState(false)
  const [ignored, setIgnored] = useState(false)
  const [action, setAction] = useState<'none' | 'augment' | 'low-confidence'>('none')
  const [editAttrs, setEditAttrs] = useState<{ name: string; value: string }[]>([])

  const condition = deriveCondition(pattern)
  const confidence = deriveConfidence(pattern, status)
  const pct = derivePct(pattern, status)
  const targetInd = deriveTargetInd(pattern)
  const attrs = deriveAttributes(pattern)

  const isSufficient = status === 'sufficient'
  const isInsufficient = status === 'insufficient'
  const isHelpMe = status === 'helpMe'

  if (ignored) return null

  const borderColor = isInsufficient
    ? 'rgba(239,68,68,0.2)'
    : isHelpMe
      ? 'rgba(234,179,8,0.2)'
      : 'rgba(255,255,255,0.07)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay }}
      className="rounded-xl overflow-hidden"
      style={{ background: '#0d1117', border: `1px solid ${borderColor}` }}
    >
      {/* Insufficient banner */}
      {isInsufficient && (
        <div
          className="px-4 py-2.5 flex items-start gap-2.5"
          style={{ background: 'rgba(239,68,68,0.07)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}
        >
          <TriangleAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-red-400">High Impact with Insufficient Data:</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(248,113,113,0.7)' }}>
              This cohort has insufficient data for reliable modeling.
            </div>
          </div>
        </div>
      )}

      {/* Help Me banner */}
      {isHelpMe && (
        <div
          className="px-4 py-2.5 flex items-start gap-2.5"
          style={{ background: 'rgba(234,179,8,0.06)', borderBottom: '1px solid rgba(234,179,8,0.12)' }}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-400">Cohorts with mixed patterns requiring human review</div>
        </div>
      )}

      {/* Main body */}
      <div className="p-4">
        {/* Title + confidence */}
        {!disputed && (
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-sm font-semibold text-white">{condition}</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={
                confidence === 'high'
                  ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                  : { background: 'rgba(239,68,68,0.12)', color: '#f87171' }
              }
            >
              {confidence === 'high' ? 'High Confidence' : 'Low Confidence'}
            </span>
          </div>
        )}

        {!disputed ? (
          <>
            {/* Stats */}
            <p className="text-sm mb-0.5">
              <span className="font-bold text-white">{pct}%</span>
              <span className="text-gray-400"> of this pattern has </span>
              <span className="font-bold text-white">Recommended IND</span>
              <span className="text-gray-400"> = </span>
              <span className="font-bold text-white">{targetInd}</span>
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Records in cohort: <span className="text-gray-300 font-semibold">{pattern.count.toLocaleString()}</span>
            </p>

            {/* Dispute button (sufficient + insufficient) */}
            {(isSufficient || isInsufficient) && (
              <button
                onClick={() => { setEditAttrs(attrs.map((a) => ({ ...a }))); setDisputed(true) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold mb-3 hover:opacity-80 transition-opacity"
                style={{ background: '#d97706', color: '#fff' }}
              >
                <Pencil className="w-3 h-3" /> Dispute
              </button>
            )}

            {/* Defining Attributes table */}
            <div className="text-xs font-medium text-gray-400 mb-1.5">Defining Attributes:</div>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {attrs.map((attr, i) => (
                <div
                  key={i}
                  className="flex items-center px-3 py-2.5"
                  style={{
                    borderBottom: i < attrs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <span className="text-xs text-gray-400 flex-1">{attr.name}</span>
                  <span className="text-xs text-gray-300 font-mono">{attr.value}</span>
                </div>
              ))}
            </div>

            {/* Action buttons — insufficient */}
            {isInsufficient && action === 'none' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setAction('augment')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                  style={{ background: '#0d9488', color: '#fff' }}
                >
                  <Database className="w-3.5 h-3.5" /> Augment Data
                </button>
                <button
                  onClick={() => setIgnored(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <X className="w-3 h-3" /> Ignore
                </button>
              </div>
            )}
            {isInsufficient && action === 'augment' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 px-3 py-2.5 rounded-lg text-xs text-teal-300"
                style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)' }}
              >
                ✓ Augmentation queued — synthetic samples will be generated during validation.
              </motion.div>
            )}

            {/* Action buttons — helpMe */}
            {isHelpMe && action === 'none' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setAction('low-confidence')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                  style={{ background: '#d97706', color: '#fff' }}
                >
                  <TriangleAlert className="w-3.5 h-3.5" /> Give Low Confidence Prediction
                </button>
                <button
                  onClick={() => setIgnored(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <X className="w-3 h-3" /> Ignore
                </button>
              </div>
            )}
            {isHelpMe && action === 'low-confidence' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 px-3 py-2.5 rounded-lg text-xs text-amber-300"
                style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}
              >
                ⚠ Low confidence prediction scheduled — model will flag these cohorts for human review.
              </motion.div>
            )}
          </>
        ) : (
          /* ── Dispute / edit mode ── */
          <div>
            <div className="text-sm font-semibold text-white mb-3">Edit Pattern Conditions</div>
            <div className="space-y-2 mb-3">
              {editAttrs.map((attr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={attr.name}
                    onChange={(e) => setEditAttrs((prev) => prev.map((a, idx) => idx === i ? { ...a, name: e.target.value } : a))}
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-xs text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-indigo-500"
                    placeholder="Attribute"
                  />
                  <input
                    value={attr.value}
                    onChange={(e) => setEditAttrs((prev) => prev.map((a, idx) => idx === i ? { ...a, value: e.target.value } : a))}
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-xs text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-indigo-500"
                    placeholder="Value / range"
                  />
                  <button
                    onClick={() => setEditAttrs((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setEditAttrs((prev) => [...prev, { name: '', value: '' }])}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mb-4"
            >
              <Plus className="w-3 h-3" /> Add Condition
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setDisputed(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Save
              </button>
              <button
                onClick={() => setDisputed(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Add Pattern form ──────────────────────────────────────────────────────────

function extractAttrsFromDescription(text: string): { name: string; value: string }[] {
  const attrs: { name: string; value: string }[] = []
  const patterns: [RegExp, (m: RegExpMatchArray) => { name: string; value: string }][] = [
    [/(\w[\w\s]*?)\s+(?:is|are|=|equals?)\s+["']?([^,."']+?)["']?(?:[,.]|$)/gi, (m) => ({ name: m[1].trim(), value: m[2].trim() })],
    [/(\w[\w\s]*?)\s+(?:greater than|above|over|>)\s+([\d.]+)/gi, (m) => ({ name: m[1].trim(), value: `> ${m[2]}` })],
    [/(\w[\w\s]*?)\s+(?:less than|below|under|<)\s+([\d.]+)/gi, (m) => ({ name: m[1].trim(), value: `< ${m[2]}` })],
    [/(?:high|low|frequent|rare)\s+(\w[\w\s]*)/gi, (m) => ({ name: m[1].trim(), value: m[0].split(' ')[0] })],
  ]
  for (const [pat, extract] of patterns) {
    let match: RegExpMatchArray | null
    while ((match = pat.exec(text)) !== null && attrs.length < 3) {
      attrs.push(extract(match))
    }
  }
  if (attrs.length === 0) {
    const words = text.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3)
    if (words.length >= 2) attrs.push({ name: words[0], value: words[1] })
    else if (words.length === 1) attrs.push({ name: words[0], value: 'high' })
  }
  return attrs.slice(0, 3)
}

function AddPatternForm({
  onAdd, onCancel,
}: {
  onAdd: (p: SufficiencyPatternItem) => void
  onCancel: () => void
}) {
  const [description, setDescription] = useState('')
  const [phase, setPhase] = useState<'input' | 'searching' | 'found'>('input')
  const [discovered, setDiscovered] = useState<SufficiencyPatternItem | null>(null)

  const handleFind = async () => {
    if (!description.trim()) return
    setPhase('searching')
    await new Promise((r) => setTimeout(r, 2200))
    const attrs = extractAttrsFromDescription(description)
    const condition = description.length > 80 ? description.slice(0, 80) + '…' : description
    const found: SufficiencyPatternItem = {
      id: Date.now(),
      label: condition,
      description: 'User-defined pattern',
      count: Math.floor(Math.random() * 2800) + 600,
      keySignals: attrs.map((a) => `${a.name}=${a.value}`),
      condition,
      confidence: 'high',
      pct: Math.round(68 + Math.random() * 22),
      targetInd: 1,
      attributes: attrs,
    }
    setDiscovered(found)
    setPhase('found')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4"
      style={{ background: '#0d1117', border: '1px solid rgba(99,102,241,0.35)' }}
    >
      <div className="text-sm font-semibold text-white mb-1">Add New Pattern</div>
      <p className="text-xs text-gray-500 mb-3">
        Describe the pattern in plain English — the system will automatically identify matching cohorts in your data.
      </p>

      {phase === 'input' && (
        <>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg text-xs text-white bg-gray-800 border border-gray-700 focus:outline-none focus:border-indigo-500 resize-none mb-3"
            placeholder="e.g. Customers who joined recently and have high monthly charges but are on a month-to-month contract"
          />
          <div className="flex gap-2">
            <button
              onClick={handleFind}
              disabled={!description.trim()}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Search className="w-3.5 h-3.5" /> Find Matching Cohorts
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
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
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <div className="text-xs text-gray-400 text-center">
            Scanning dataset for cohorts matching your description…
          </div>
        </motion.div>
      )}

      {phase === 'found' && discovered && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className="rounded-lg p-3 mb-3"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">Cohort Discovered</span>
            </div>
            <div className="text-xs text-gray-300 mb-2">{discovered.condition}</div>
            <div className="flex items-center gap-4 text-[10px] text-gray-500">
              <span>Records: <span className="text-gray-300 font-semibold">{discovered.count.toLocaleString()}</span></span>
              <span>Target IND: <span className="text-gray-300 font-semibold">{discovered.pct}%</span></span>
            </div>
            {discovered.attributes.length > 0 && (
              <div className="mt-2 space-y-1">
                {discovered.attributes.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className="text-gray-500 w-24 truncate">{a.name}</span>
                    <span className="text-gray-300 font-mono">{a.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAdd(discovered)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Add to Sufficient Patterns
            </button>
            <button
              onClick={() => { setPhase('input'); setDescription(''); setDiscovered(null) }}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Search Again
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
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
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-3 hover:bg-white/[0.03] transition-colors"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
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
          ? <ChevronRight className="w-4 h-4 text-gray-500" />
          : <ChevronDown className="w-4 h-4 text-gray-500" />}
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
  const [userPatterns, setUserPatterns] = useState<SufficiencyPatternItem[]>([])
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
      addLog(`Detected ${results.helpMe.length} ambiguous pattern${results.helpMe.length !== 1 ? 's' : ''} — help me cohorts`, 'info')
      await new Promise((r) => setTimeout(r, 1300))
    }

    setPhase('complete')
    setPatternResults(results)
    addLog('Pattern recognition complete — sufficiency analysis ready', 'success')
  }, [selectedDataset, addLog, setPatternResults])

  useEffect(() => { runDiscovery() }, [runDiscovery])

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
      <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0a0a0a' }}>
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Pattern Recognition</h2>
          {phase !== 'complete' && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
          {phase === 'complete' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: 'rgba(20,184,166,0.12)', color: '#2dd4bf' }}
            >
              Analysis Complete
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Assessing whether each discovered pattern has sufficient data to build a reliable model — or needs augmentation.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: '#060809' }}>

        {/* Stats row */}
        <AnimatePresence>
          {data && phase !== 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`grid gap-3 ${hasHelpMe ? 'grid-cols-4' : 'grid-cols-3'}`}
            >
              {[
                { label: 'Total Records', value: data.totalRecords, color: '#fff', accent: 'rgba(255,255,255,0.06)' },
                { label: 'Sufficient Patterns', value: data.sufficient.length, sub: `${totalSufficient.toLocaleString()} records`, color: '#4ade80', accent: 'rgba(74,222,128,0.08)' },
                { label: 'Need Augmentation', value: data.insufficient.length, sub: `${totalInsufficient.toLocaleString()} records`, color: '#f87171', accent: 'rgba(248,113,113,0.08)' },
                ...(hasHelpMe ? [{ label: 'Help Me Cohorts', value: data.helpMe.length, sub: `${totalHelpMe.toLocaleString()} records`, color: '#fbbf24', accent: 'rgba(251,191,36,0.08)' }] : []),
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-4 text-center"
                  style={{ background: s.accent, border: `1px solid ${s.color}22` }}
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
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning {selectedDataset?.rows.toLocaleString()} records for cohort patterns...
          </motion.div>
        )}

        {/* Sufficient section */}
        <AnimatePresence>
          {data && phase !== 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionHeader
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                label="Identified Pattern with Sufficient Data"
                count={data.sufficient.length + userPatterns.length}
                color="#4ade80"
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
                    <div className="space-y-3">
                      {data.sufficient.map((p, i) => (
                        <PatternCard key={p.id} pattern={p} status="sufficient" delay={i * 0.08} />
                      ))}
                      {userPatterns.map((p, i) => (
                        <PatternCard key={p.id} pattern={p} status="sufficient" delay={i * 0.08} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insufficient section */}
        <AnimatePresence>
          {data && showInsufficient && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionHeader
                icon={<AlertCircle className="w-4 h-4 text-red-400" />}
                label="Identified Patterns — Insufficient Data"
                count={data.insufficient.length}
                color="#f87171"
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Me section */}
        <AnimatePresence>
          {data && hasHelpMe && showHelpMe && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SectionHeader
                icon={<HelpCircle className="w-4 h-4 text-amber-400" />}
                label="Help Me — Mixed Patterns"
                count={data.helpMe.length}
                color="#fbbf24"
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
                onAdd={(p) => { setUserPatterns((prev) => [...prev, p]); setAddingNew(false) }}
                onCancel={() => setAddingNew(false)}
              />
            ) : (
              <button
                onClick={() => setAddingNew(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5"
                style={{ border: '1px dashed rgba(99,102,241,0.4)', color: '#818cf8' }}
              >
                <Plus className="w-4 h-4" /> Add New Pattern
              </button>
            )}
          </motion.div>
        )}
      </div>

      <BottomActionBar
        onNext={phase === 'complete' ? handleNext : undefined}
        nextDisabled={phase !== 'complete'}
        nextLabel="Continue to Validation Summary"
      />
    </div>
  )
}
