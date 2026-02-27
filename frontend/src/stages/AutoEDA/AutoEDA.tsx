import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, Loader2, Circle, Sparkles,
  ChevronDown, ChevronRight, Trash2, Plus, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { useDomainSubtitle } from '@/lib/useDomainSubtitle'
import type { StageId, EDAResults, DimensionResults, DistributionData } from '@/store/types'
import { getPrecomputedEDA } from './edaData'
import { getPrecomputedDimensions } from '../DimensionDiscovery/dimensionData'

interface EDAModuleState {
  id: string
  label: string
  status: 'pending' | 'running' | 'complete'
}

const moduleList: EDAModuleState[] = [
  { id: 'summary', label: 'Data Shape & Types', status: 'pending' },
  { id: 'features', label: 'Dataset Features & Dimensions', status: 'pending' },
  { id: 'missing', label: 'Missing Values by Feature', status: 'pending' },
]

// ── helpers ───────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function autoBuckets(stats: { min: number; max: number; median: number }): { label: string; min: number; max: number }[] {
  const mid = stats.median
  return [
    { label: `${stats.min} – ${mid}`, min: stats.min, max: mid },
    { label: `${mid} – ${stats.max}`, min: mid, max: stats.max },
  ]
}

// Per-dataset dimension multipliers (2×–4× column count) so each scenario
// shows a distinct, realistic dimension count instead of a flat constant.
const DIMENSION_MULTIPLIERS: Record<string, number> = {
  'telco-churn':              2.3,
  'credit-fraud':             3.2,
  'store-demand':             2.8,
  'patient-readmission':      2.5,
  'employee-attrition':       3.6,
  'energy-consumption':       2.1,
  'insurance-claims':         3.4,
  'predictive-maintenance':   2.7,
  'logistics-delivery-delay': 3.8,
  'logistics-freight-cost':   2.4,
  'logistics-delivery-outcome': 3.1,
  'logistics-demand-forecast':  2.6,
}

// Compute initial (un-bucketized) total dimensions for the stats row
// Dimensions should be 2–4× the column count to reflect the richer signal space
function computeInitialDimensions(distributions: DistributionData[], columns: number, datasetId: string): number {
  const raw = distributions.reduce((sum, d) => {
    if (d.type === 'categorical') return sum + (d.bins?.length ?? 1)
    return sum + 1
  }, 0)
  const multiplier = DIMENSION_MULTIPLIERS[datasetId] ?? 3
  return Math.max(raw, Math.round(columns * multiplier))
}

// ── AttributeRow ─────────────────────────────────────────────────────────────

function AttributeRow({
  dist,
  bucketized,
  buckets,
  onToggleBucketize,
  onBucketChange,
  onBucketDelete,
  onBucketAdd,
  accentColor,
}: {
  dist: DistributionData
  bucketized: boolean
  buckets: { label: string }[]
  onToggleBucketize: () => void
  onBucketChange: (i: number, label: string) => void
  onBucketDelete: (i: number) => void
  onBucketAdd: () => void
  accentColor: string
}) {
  const [expanded, setExpanded] = useState(false)
  const isNumeric = dist.type === 'numeric'
  const dimCount = dist.type === 'categorical'
    ? (dist.bins?.length ?? 1)
    : bucketized ? buckets.length : 1

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid #e5e7eb', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      {/* Row header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />}
        <span className="text-sm font-semibold text-gray-900 flex-1 text-left">{dist.feature}</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={
            isNumeric
              ? { background: 'rgba(99,102,241,0.08)', color: '#4f46e5' }
              : { background: hexToRgba(accentColor, 0.08), color: accentColor }
          }
        >
          {isNumeric ? 'numerical' : 'categorical'}
        </span>
        <span className="text-xs text-gray-500 ml-2">
          {dimCount} dimension{dimCount !== 1 ? 's' : ''}
          {bucketized ? ` • ${buckets.length} categories` : ''}
        </span>
        {isNumeric && (
          <div
            className="flex items-center gap-1.5 ml-3"
            onClick={(e) => { e.stopPropagation(); onToggleBucketize() }}
          >
            <span className="text-[10px] text-gray-500">Bucketize</span>
            {bucketized
              ? <ToggleRight className="w-5 h-5" style={{ color: accentColor }} />
              : <ToggleLeft className="w-5 h-5 text-gray-400" />}
          </div>
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', borderTop: '1px solid #e5e7eb' }}
          >
            <div className="p-4">
              {isNumeric && !bucketized && dist.stats && (
                <>
                  <div className="text-xs font-semibold text-gray-500 mb-3">
                    Identified Dimensions <span className="text-gray-900 ml-1">1</span>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="px-4 py-2 text-xs font-semibold text-white" style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }}>
                      Statistical Summary
                    </div>
                    {[
                      { label: 'Total Values', sub: 'Number of data points', value: dist.bins?.reduce((s, b) => s + b.count, 0) ?? 0, format: 'int' },
                      { label: 'Average', sub: 'Central tendency of the data', value: dist.stats.mean, format: 'dec' },
                      { label: 'Spread', sub: 'How dispersed values are from average', value: dist.stats.std, format: 'dec' },
                      { label: 'Minimum', sub: 'Lowest value observed', value: dist.stats.min, format: 'dec' },
                      { label: 'Maximum', sub: 'Highest value observed', value: dist.stats.max, format: 'dec' },
                    ].map((row, i, arr) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{
                          borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                          background: i % 2 === 0 ? '#f9fafb' : '#ffffff',
                        }}
                      >
                        <div>
                          <div className="text-xs font-medium text-gray-900">{row.label}</div>
                          <div className="text-[10px] text-gray-500">{row.sub}</div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(59,130,246,0.08)', color: '#2563eb' }}>
                          {row.format === 'int'
                            ? (row.value as number).toLocaleString()
                            : (row.value as number).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {isNumeric && bucketized && (
                <>
                  <div className="text-xs font-semibold text-gray-500 mb-3">
                    Categories <span className="text-gray-900 ml-1">{buckets.length}</span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {buckets.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center px-3 py-2.5 rounded-lg"
                        style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
                      >
                        <input
                          value={b.label}
                          onChange={(e) => onBucketChange(i, e.target.value)}
                          className="flex-1 bg-transparent text-sm text-gray-900 outline-none"
                        />
                        <button onClick={() => onBucketDelete(i)} className="text-red-500 hover:text-red-700 ml-2">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={onBucketAdd}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-gray-50"
                    style={{ border: '1px dashed #d1d5db', color: '#6b7280' }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </>
              )}

              {!isNumeric && dist.bins && (
                <>
                  <div className="text-xs font-semibold text-gray-500 mb-3">
                    Identified Dimensions <span className="text-gray-900 ml-1">{dist.bins.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {dist.bins.map((bin) => (
                      <div
                        key={bin.label}
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: hexToRgba(accentColor, 0.04), border: `1px solid ${hexToRgba(accentColor, 0.1)}` }}
                      >
                        <span className="text-xs text-gray-600">{bin.label}</span>
                        <span className="text-xs font-mono" style={{ color: accentColor }}>{bin.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Time-Series Configuration Panel ──────────────────────────────────────────

function TimeSeriesConfigPanel({ accentColor }: { accentColor: string }) {
  const [granularity, setGranularity] = useState('daily')
  const [horizon, setHorizon] = useState('7')
  const [lookback, setLookback] = useState('30')
  const [exogVars, setExogVars] = useState<Record<string, boolean>>({
    weather: true,
    traffic: true,
    holidays: false,
    promotions: false,
  })

  const toggleVar = (key: string) => setExogVars((prev) => ({ ...prev, [key]: !prev[key] }))

  const selectStyle = {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    color: '#1e293b',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5 space-y-5"
      style={{ border: '1px solid #e5e7eb', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
        <span className="text-sm font-semibold text-gray-800">Time-Series Configuration</span>
      </div>

      {/* Granularity */}
      <div>
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Granularity</label>
        <div className="flex gap-2">
          {['hourly', 'daily', 'weekly', 'monthly'].map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={granularity === g
                ? { background: `${accentColor}15`, border: `1px solid ${accentColor}`, color: accentColor }
                : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280' }
              }
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Horizon + Lookback */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Forecast Horizon</label>
          <select
            value={horizon}
            onChange={(e) => setHorizon(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={selectStyle}
          >
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Lookback Window</label>
          <select
            value={lookback}
            onChange={(e) => setLookback(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={selectStyle}
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </select>
        </div>
      </div>

      {/* Exogenous Variables */}
      <div>
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Exogenous Variables</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(exogVars).map(([key, enabled]) => (
            <button
              key={key}
              onClick={() => toggleVar(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={enabled
                ? { background: `${accentColor}12`, border: `1px solid ${accentColor}44`, color: accentColor }
                : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280' }
              }
            >
              <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-current' : 'bg-gray-300'}`} />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-500 italic">
        These settings inform the model composition — granularity and horizon affect lag feature depth, while exogenous toggles control which external signals enter the pipeline.
      </p>
    </motion.div>
  )
}

// ── AutoADS panel ─────────────────────────────────────────────────────────────

function AutoADSPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-5"
    >
      {/* Banner */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}
      >
        <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-sm font-bold text-violet-700">Automated Dimension Discovery: </span>
          <span className="text-sm text-gray-600">
            We discovered new dimensions from your existing data columns — transforming raw fields into richer signals
            that capture patterns not visible in the original feature set, improving AI model accuracy.
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function DatasetFeaturesPanel({
  edaData,
  accentColor,
}: {
  edaData: EDAResults
  accentColor: string
}) {
  const distributions = edaData.distributions

  const [bucketizedCols, setBucketizedCols] = useState<Set<string>>(new Set())
  const [bucketsMap, setBucketsMap] = useState<Record<string, { label: string }[]>>({})

  const toggleBucketize = (feature: string, dist: DistributionData) => {
    setBucketizedCols((prev) => {
      const next = new Set(prev)
      if (next.has(feature)) {
        next.delete(feature)
      } else {
        next.add(feature)
        if (!bucketsMap[feature] && dist.stats) {
          const bs = autoBuckets(dist.stats)
          setBucketsMap((bm) => ({ ...bm, [feature]: bs }))
        }
      }
      return next
    })
  }

  const updateBucket = (feature: string, i: number, label: string) => {
    setBucketsMap((prev) => ({
      ...prev,
      [feature]: prev[feature].map((b, idx) => idx === i ? { ...b, label } : b),
    }))
  }

  const deleteBucket = (feature: string, i: number) => {
    setBucketsMap((prev) => ({
      ...prev,
      [feature]: prev[feature].filter((_, idx) => idx !== i),
    }))
  }

  const addBucket = (feature: string) => {
    setBucketsMap((prev) => ({
      ...prev,
      [feature]: [...(prev[feature] ?? []), { label: 'New range' }],
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dataset Features and Dimensions</div>
      <div className="text-xs text-gray-400 mb-3">View and manage dimensions for each feature in your dataset</div>
      <div className="space-y-2">
        {distributions.map((dist) => (
          <AttributeRow
            key={dist.feature}
            dist={dist}
            bucketized={bucketizedCols.has(dist.feature)}
            buckets={bucketsMap[dist.feature] ?? []}
            onToggleBucketize={() => toggleBucketize(dist.feature, dist)}
            onBucketChange={(i, label) => updateBucket(dist.feature, i, label)}
            onBucketDelete={(i) => deleteBucket(dist.feature, i)}
            onBucketAdd={() => addBucket(dist.feature)}
            accentColor={accentColor}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Main AutoEDA ──────────────────────────────────────────────────────────────

export function AutoEDA() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setEdaResults = usePlaygroundStore((s) => s.setEdaResults)
  const setDimensionResults = usePlaygroundStore((s) => s.setDimensionResults)
  const addLog = usePlaygroundStore((s) => s.addLog)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const subtitle = useDomainSubtitle(
    'profiling',
    `The AI is autonomously analyzing ${selectedDataset?.rows.toLocaleString()} records across ${selectedDataset?.features} features`,
  )

  const accentColor = selectedDataset?.color ?? '#8b5cf6'

  const [modules, setModules] = useState<EDAModuleState[]>(moduleList)
  const [_activeModule, setActiveModule] = useState<string | null>(null)
  const [edaData, setEdaData] = useState<EDAResults | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const [dimData, setDimData] = useState<DimensionResults | null>(null)
  const [dimComplete, setDimComplete] = useState(false)

  const analysisStartedRef = useRef(false)

  // Section refs for scrolling
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const runAnalysis = useCallback(async () => {
    if (!selectedDataset) return
    if (analysisStartedRef.current) return
    analysisStartedRef.current = true

    const data = getPrecomputedEDA(selectedDataset.id)
    setEdaData(data)

    for (let i = 0; i < moduleList.length; i++) {
      const mod = moduleList[i]
      setModules((prev) => prev.map((m, idx) => idx === i ? { ...m, status: 'running' } : m))
      setActiveModule(mod.id)
      addLog(`Analyzing: ${mod.label}...`, 'info')
      await new Promise((r) => setTimeout(r, 1400 + Math.random() * 900))
      setModules((prev) => prev.map((m, idx) => idx === i ? { ...m, status: 'complete' } : m))
      addLog(`Completed: ${mod.label}`, 'success')
    }

    setEdaResults(data)
    setAnalysisComplete(true)
    addLog('EDA complete — data profiling finished', 'success')

    await new Promise((r) => setTimeout(r, 500))
    const dimResults = getPrecomputedDimensions(selectedDataset.id)
    setDimData(dimResults)
    addLog('Mapping features into meaningful dimensions...', 'info')
    await new Promise((r) => setTimeout(r, 600))

    for (let i = 0; i < dimResults.dimensions.length; i++) {
      addLog(`Dimension mapped: "${dimResults.dimensions[i].name}" (${dimResults.dimensions[i].attributes.length} features)`, 'success')
      await new Promise((r) => setTimeout(r, 500))
    }

    setDimensionResults(dimResults)
    setDimComplete(true)
    addLog(`Dimension mapping complete — ${dimResults.dimensions.length} semantic clusters discovered`, 'success')
  }, [selectedDataset, addLog, setEdaResults, setDimensionResults])

  useEffect(() => {
    const { edaResults: stored, dimensionResults: storedDim } = usePlaygroundStore.getState()
    if (stored && storedDim) {
      setEdaData(stored)
      setModules(moduleList.map((m) => ({ ...m, status: 'complete' })))
      setAnalysisComplete(true)
      setDimData(storedDim)
      setDimComplete(true)
      return
    }
    runAnalysis()
  }, [runAnalysis])

  const handleNext = () => { completeStep(3); setStep(4 as StageId) }

  // Compute initial total dimensions for the stats row
  const initialDimensions = edaData ? computeInitialDimensions(edaData.distributions, edaData.summary.columns, selectedDataset?.id ?? '') : 0

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: '#e5e7eb', background: '#ffffff' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">Automated Data Profiling</h2>
          {analysisComplete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: hexToRgba(accentColor, 0.1), color: accentColor }}
            >
              Analysis Complete
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: analysis checklist (3 modules only) */}
        <div
          className="w-64 border-r p-4 overflow-y-auto shrink-0"
          style={{ borderColor: '#e5e7eb', background: '#fafafa' }}
        >
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Analysis Modules</h3>
          <div className="space-y-1.5">
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => mod.status === 'complete' && scrollToSection(mod.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                style={{
                  cursor: mod.status === 'complete' ? 'pointer' : 'default',
                  ...(mod.status === 'running'
                    ? { background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }
                    : mod.status === 'complete'
                      ? { background: hexToRgba(accentColor, 0.04) }
                      : { background: '#f9fafb' }),
                }}
              >
                {mod.status === 'complete' ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
                    <Check className="w-4 h-4" style={{ color: accentColor }} />
                  </motion.div>
                ) : mod.status === 'running' ? (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
                <span
                  className="text-xs font-medium"
                  style={
                    mod.status === 'running'
                      ? { color: '#3b82f6' }
                      : mod.status === 'complete'
                        ? { color: '#374151' }
                        : { color: '#9ca3af' }
                  }
                >
                  {mod.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: analysis results + AutoADS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: '#fafafa' }}>

          {/* 1. Data Summary stats (7 cards) */}
          <AnimatePresence>
            {edaData && modules.find((m) => m.id === 'summary')?.status === 'complete' && (
              <motion.div ref={(el) => { sectionRefs.current.summary = el }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: 'Rows', value: edaData.summary.rows },
                  { label: 'Columns', value: edaData.summary.columns },
                  { label: 'Numeric', value: edaData.summary.numericFeatures },
                  { label: 'Categorical', value: edaData.summary.categoricalFeatures },
                  { label: 'Multiline Text', value: 0 },
                  { label: 'Duplicates', value: edaData.summary.duplicateRows },
                  { label: 'Total Dimensions', value: initialDimensions },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-xl p-4 text-center"
                    style={
                      stat.label === 'Total Dimensions'
                        ? { background: hexToRgba(accentColor, 0.06), border: `1px solid ${hexToRgba(accentColor, 0.2)}` }
                        : { background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }
                    }
                  >
                    <div
                      className="text-2xl font-bold"
                      style={{ color: stat.label === 'Total Dimensions' ? accentColor : '#1e293b' }}
                    >
                      <CountUpNumber end={stat.value as number} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Automated Dimension Discovery banner */}
          <AnimatePresence>
            {dimComplete && edaData && dimData && (
              <AutoADSPanel />
            )}
          </AnimatePresence>

          {/* 3. Dataset Features and Dimensions */}
          <AnimatePresence>
            {dimComplete && edaData && dimData && (
              <div ref={(el) => { sectionRefs.current.features = el }}>
                <DatasetFeaturesPanel
                  edaData={edaData}
                  accentColor={accentColor}
                />
              </div>
            )}
          </AnimatePresence>

          {/* 3. Missing Values by Feature */}
          {edaData && modules.find((m) => m.id === 'missing')?.status === 'complete' && (() => {
            const nonZero = edaData.missingValues.columns
              .map((col, i) => ({ col, val: edaData.missingValues.values[i] }))
              .filter((x) => x.val > 0)
            return (
              <motion.div ref={(el) => { sectionRefs.current.missing = el }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-5" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Missing Values by Feature</h4>
                {nonZero.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <Check className="w-4 h-4" />
                    <span>No missing values detected — dataset is complete.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {nonZero.map(({ col, val }, i) => {
                      const pct = (val / edaData.summary.rows) * 100
                      return (
                        <motion.div key={col} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-36 truncate font-mono">{col}</span>
                          <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(pct, 1)}%` }}
                              transition={{ duration: 0.8, delay: i * 0.05 }}
                              className="h-full rounded-full"
                              style={{ background: pct > 20 ? '#ef4444' : pct > 5 ? '#f59e0b' : '#10b981' }}
                            />
                          </div>
                          <span className="text-xs font-mono text-gray-500 w-20 text-right">{val.toLocaleString()} ({pct.toFixed(1)}%)</span>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )
          })()}

          {/* Time-Series Config (only for time-series datasets) */}
          {dimComplete && selectedDataset?.taskType === 'time-series' && (
            <TimeSeriesConfigPanel accentColor={accentColor} />
          )}

        </div>
      </div>

      <BottomActionBar
        onNext={dimComplete ? handleNext : undefined}
        nextDisabled={!dimComplete}
        nextLabel="Continue to Pattern Recognition"
      />
    </div>
  )
}
