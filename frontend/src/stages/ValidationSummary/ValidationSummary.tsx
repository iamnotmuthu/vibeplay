import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Database, Lightbulb } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { MLTooltip } from '@/components/shared/MLTooltip'
import { StageExplainer } from '@/components/shared/StageExplainer'
import { getPrecomputedValidation, getBacktestConfig } from './validationSummaryData'
import type { BacktestConfig } from './validationSummaryData'
import { BacktestSummary } from './BacktestChart'
import type { StageId, ValidationSummaryResults, ValidationCategory } from '@/store/types'

type CategoryKey = 'sufficient' | 'insufficient' | 'helpMe' | 'augmented'

const CATEGORIES: {
  key: CategoryKey
  label: string
  color: string
  borderColor: string
  textColor: string
  bgColor: string
  tooltipTerm?: string
}[] = [
  {
    key: 'sufficient',
    label: 'Dominant Patterns',
    color: '#10b981',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    tooltipTerm: 'dominant-patterns',
  },
  {
    key: 'insufficient',
    label: 'Non-Dominant Patterns',
    color: '#ef4444',
    borderColor: 'border-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-500',
    tooltipTerm: 'non-dominant-patterns',
  },
  {
    key: 'helpMe',
    label: 'Fuzzy Patterns',
    color: '#f59e0b',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-500',
    tooltipTerm: 'fuzzy-patterns',
  },
  {
    key: 'augmented',
    label: 'Augmented Data',
    color: '#3b82f6',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-500',
  },
]

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
  label,
  data,
  borderColor,
  textColor,
  bgColor,
  isActive,
  onClick,
  totalValidationSamples,
  tooltip,
}: {
  label: string
  data: ValidationCategory
  color: string
  borderColor: string
  textColor: string
  bgColor: string
  isActive: boolean
  onClick: () => void
  totalValidationSamples: number
  tooltip?: React.ReactNode
}) {
  const validationCount = data.cohorts.reduce((sum, c) => sum + c.validationSamples, 0)
  const validationPct = totalValidationSamples > 0 ? (validationCount / totalValidationSamples * 100) : 0
  const barFill = Math.min(validationPct, 100)
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`text-left p-5 rounded-xl transition-all w-full ${isActive ? `border-l-4 ${borderColor}` : 'border border-gray-200'}`}
      style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div className={`text-xs font-semibold mb-2 flex items-center gap-1 ${textColor}`}>{label}{tooltip}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        <CountUpNumber end={validationCount} />
      </div>
      <div className={`text-sm font-medium mb-3 ${textColor}`}>{validationPct.toFixed(1)}%</div>
      <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: '#e5e7eb' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barFill}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${bgColor}`}
        />
      </div>
      {data.actionStatement && (
        <p className="text-[10px] text-gray-500 leading-relaxed">{data.actionStatement}</p>
      )}
    </motion.button>
  )
}

// ─── Breakdown Table ───────────────────────────────────────────────────────────

function BreakdownTable({
  categoryLabel,
  categoryKey,
  textColor,
  borderColor,
  data,
}: {
  categoryLabel: string
  categoryKey: CategoryKey
  textColor: string
  borderColor: string
  data: ValidationCategory
}) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? data.cohorts : data.cohorts.slice(0, 3)
  const remaining = data.cohorts.length - 3

  if (data.cohorts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No cohorts in this category for the current dataset.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-semibold ${textColor}`}>
          {categoryLabel} — Detailed Breakdown
        </h4>
        <span className="text-xs text-gray-500">
          {data.cohorts.length} cohorts · {data.cohorts.reduce((sum, c) => sum + c.validationSamples, 0).toLocaleString()} validation samples
        </span>
      </div>

      <div
        className={`rounded-xl border-2 ${borderColor} overflow-hidden`}
        style={{ background: '#ffffff' }}
      >
        {/* Table header — 4 proper columns */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div>Pattern</div>
          <div className="text-right">Total Count</div>
          <div className="text-right">Validation Samples</div>
          <div className="text-right">Sampling %</div>
        </div>

        {/* Rows */}
        {visible.map((cohort, i) => {
          const displayName = categoryKey === 'sufficient'
            ? `Dominant Pattern ${i + 1}`
            : categoryKey === 'insufficient'
              ? `Non-Dominant Pattern ${i + 1}`
              : categoryKey === 'helpMe'
                ? `Fuzzy Pattern ${i + 1}`
                : cohort.name
          return (
            <motion.div
              key={cohort.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 last:border-0 transition-colors hover:bg-gray-100"
              style={{ borderBottom: '1px solid #f3f4f6' }}
            >
              <div className="flex flex-col gap-0.5 pr-4">
                <span className={`text-xs font-bold font-mono ${textColor}`}>{displayName}</span>
                {categoryKey !== 'augmented' && (
                  <span className="text-[11px] text-gray-400 truncate">{cohort.name}</span>
                )}
              </div>
              <div className="text-right text-sm text-gray-600 font-mono">{cohort.totalCount.toLocaleString()}</div>
              <div className="text-right text-sm font-mono text-gray-600">{cohort.validationSamples}</div>
              <div className={`text-right text-xs font-semibold font-mono ${textColor}`}>
                {cohort.samplingPct === 0 ? '—' : `${cohort.samplingPct}%`}
              </div>
            </motion.div>
          )
        })}

        {/* Load more / show less */}
        {!showAll && remaining > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className={`w-full py-3 text-sm font-semibold transition-colors ${textColor} hover:bg-gray-50`}
          >
            Load More ({remaining} remaining)
          </button>
        )}
        {showAll && data.cohorts.length > 3 && (
          <button
            onClick={() => setShowAll(false)}
            className={`w-full py-3 text-sm font-semibold transition-colors ${textColor} hover:bg-gray-50`}
          >
            Show Less
          </button>
        )}
      </div>

      {/* Category-specific action panel */}
      {categoryKey === 'insufficient' && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            This pattern appears strong but lacks sufficient data. <span className="text-gray-800 font-medium">Recommended:</span> Collect ~{Math.max(50, Math.round(data.count * 0.3))} more records matching this cohort, OR enable synthetic augmentation.
          </p>
          <div className="relative group inline-flex">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <Database className="w-3.5 h-3.5" />
              Augment with Synthetic Data
            </button>
            <div
              className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border p-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
              style={{ background: '#ffffff', borderColor: '#e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' }}
            >
              <p className="text-[10px] text-gray-600 leading-relaxed">Generates realistic synthetic records that match the statistical distribution of this cohort to improve model coverage.</p>
              <div className="absolute top-full left-6 border-4 border-transparent" style={{ borderTopColor: '#e5e7eb' }} />
            </div>
          </div>
        </div>
      )}

      {categoryKey === 'helpMe' && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-amber-700 mb-1">Domain Expert Opportunity</div>
            <p className="text-xs text-amber-600 leading-relaxed">
              Consider whether an additional parameter — a behavioral signal, external data source, or derived feature — could separate these records into clearer outcome buckets. A single well-chosen parameter can often convert Fuzzy Patterns into Dominant or Non-Dominant ones.
            </p>
          </div>
        </div>
      )}

      {categoryKey === 'augmented' && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Synthetic data was generated to strengthen validation. These patterns are now production-ready with caveats — monitor for distribution drift between synthetic and real-world data.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Metric definitions for Measurement Plan ──────────────────────────────────

const PREDICTIVE_METRIC_DEFS: Record<string, { description: string; why: string }> = {
  Recall: {
    description: 'Proportion of actual positives the model correctly identifies — measures how few real cases are missed.',
    why: 'Chosen as primary when missing a true positive is more costly than a false alarm — critical for fraud detection, churn risk, and anomaly classification.',
  },
  Precision: {
    description: 'Proportion of predicted positives that are actually correct — measures how trustworthy each positive prediction is.',
    why: 'Chosen as secondary to ensure positive predictions are reliable enough to act on and to control the false alarm rate.',
  },
  MAPE: {
    description: 'Mean Absolute Percentage Error — average forecast deviation expressed as a percentage of actual values.',
    why: 'Chosen as primary for forecasting because it is scale-independent and directly interpretable by stakeholders as a % deviation from reality.',
  },
  RMSE: {
    description: 'Root Mean Squared Error — penalizes large forecast errors more than small ones.',
    why: 'Chosen as secondary to surface and constrain outlier predictions that MAPE alone may underweight due to its percentage-based averaging.',
  },
}

function MeasurementPlan({ primaryMetric, secondaryMetric }: { primaryMetric: string; secondaryMetric: string }) {
  const primary = PREDICTIVE_METRIC_DEFS[primaryMetric]
  const secondary = PREDICTIVE_METRIC_DEFS[secondaryMetric]
  if (!primary || !secondary) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Measurement Plan</span>
        <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
        <span className="text-[10px] text-gray-400 italic">metrics to be used for evaluation</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Primary Metric', metric: primaryMetric, def: primary, color: '#3b82f6', borderColor: '#3b82f6' },
          { label: 'Secondary Metric', metric: secondaryMetric, def: secondary, color: '#6b7280', borderColor: '#d1d5db' },
        ].map(({ label, metric, def, color, borderColor }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              background: '#ffffff',
              border: `1px solid ${borderColor}`,
              borderLeft: `3px solid ${color}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: `${color}12`, color, border: `1px solid ${color}30` }}
              >
                {label}
              </span>
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">{metric}</p>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">{def.description}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed italic">{def.why}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

const CATEGORY_BUSINESS_STATEMENTS: Record<string, (count: number) => string> = {
  sufficient: (count) => `These ${count.toLocaleString()} records represent your most reliable training patterns — the model will perform best on these.`,
  insufficient: (count) => `These ${count.toLocaleString()} records come from patterns with limited historical data — predictions here carry more uncertainty.`,
  helpMe: (count) => `These ${count.toLocaleString()} records come from segments where the model cannot reliably predict the outcome. Their features produce similar signals across different outcomes — a real-world differentiating parameter may not yet be in your dataset.`,
  augmented: (count) => `These ${count.toLocaleString()} records are synthetic samples generated to strengthen model coverage.`,
}

export function ValidationSummary() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setValidationSummaryResults = usePlaygroundStore((s) => s.setValidationSummaryResults)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)
  const viewMode = usePlaygroundStore((s) => s.viewMode)

  const [data, setData] = useState<ValidationSummaryResults | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('sufficient')
  const [backtestConfig, setBacktestConfig] = useState<BacktestConfig | null>(null)

  useEffect(() => {
    if (!selectedDataset) return
    const results = getPrecomputedValidation(selectedDataset.id)
    setData(results)
    setValidationSummaryResults(results)
    setBacktestConfig(getBacktestConfig(selectedDataset.id))
    addLog(`Validation summary loaded — ${results.totalCount} samples across ${results.totalCohorts} cohorts`, 'success')
    addLog(`Dominant: ${results.sufficient.count} (${results.sufficient.percentage}%) · Non-Dominant: ${results.insufficient.count}`, 'info')
  }, [selectedDataset, setValidationSummaryResults, addLog])

  const handleNext = () => {
    completeStep(5)
    setStep(6 as StageId)
  }

  if (!data || !selectedDataset) return null

  const activeConfig = CATEGORIES.find((c) => c.key === activeCategory)!
  const activeCategoryData = data[activeCategory]
  const totalValidationSamples = CATEGORIES.reduce(
    (sum, cat) => sum + data[cat.key].cohorts.reduce((s, c) => s + c.validationSamples, 0),
    0,
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb', background: '#ffffff' }}>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Validation Data Set Summary</h2>
          <MLTooltip term="validation" />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Comprehensive validation dataset combining valid cohorts, confusing edge cases, and augmented variations to provide complete coverage of real-world data distributions.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: '#fafafa' }}>
        <StageExplainer stageId={5} />

        {/* ── Measurement Plan ─────────────────────────────────────────── */}
        <MeasurementPlan primaryMetric={data.overallMetrics.primaryMetric} secondaryMetric={data.overallMetrics.secondaryMetric} />

        {/* Total validation banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5 flex items-center justify-between"
          style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderLeft: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Validation Data</div>
            <div className="text-4xl font-bold text-gray-900">
              <CountUpNumber end={data.totalCount} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Cohort Composition</div>
            <div className="text-sm font-semibold text-gray-600">{data.totalCohorts} cohorts total</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {data.sufficient.cohorts.length + data.insufficient.cohorts.length + data.helpMe.cohorts.length} discovered
              {data.augmented.cohorts.length > 0 && ` + ${data.augmented.cohorts.length} augmented`}
            </div>
          </div>
        </motion.div>

        {/* Backtesting criteria for time-series datasets */}
        {backtestConfig && (
          <BacktestSummary
            config={backtestConfig}
            accentColor={selectedDataset?.color}
          />
        )}

        {/* 4 Category cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            cat.key === 'augmented' && data.augmented.count === 0 ? null : (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <CategoryCard
                  label={cat.label}
                  data={data[cat.key]}
                  color={cat.color}
                  borderColor={cat.borderColor}
                  textColor={cat.textColor}
                  bgColor={cat.bgColor}
                  isActive={activeCategory === cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  totalValidationSamples={totalValidationSamples}
                  tooltip={cat.tooltipTerm ? <MLTooltip term={cat.tooltipTerm} /> : undefined}
                />
              </motion.div>
            )
          ))}
        </div>

        {/* Business View: per-category statement cards */}
        <AnimatePresence mode="wait">
          {viewMode === 'business' && (
            <motion.div
              key="business-statements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {CATEGORIES.filter((cat) => !(cat.key === 'augmented' && data.augmented.count === 0)).map((cat) => {
                const validationCount = data[cat.key].cohorts.reduce((sum, c) => sum + c.validationSamples, 0)
                if (validationCount === 0) return null
                return (
                  <div
                    key={cat.key}
                    className={`rounded-xl p-4 border-l-4 ${cat.borderColor}`}
                    style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
                  >
                    <div className={`text-xs font-semibold mb-1 ${cat.textColor}`}>{cat.label}</div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {CATEGORY_BUSINESS_STATEMENTS[cat.key]?.(validationCount) ?? ''}
                    </p>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detailed breakdown for selected category — technical view only */}
        <AnimatePresence mode="wait">
          {viewMode === 'technical' && (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <BreakdownTable
                categoryLabel={activeConfig.label}
                categoryKey={activeCategory}
                textColor={activeConfig.textColor}
                borderColor={activeConfig.borderColor}
                data={activeCategoryData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomActionBar
        onNext={handleNext}
        nextLabel="Continue to Model Selection"
      />
    </div>
  )
}
