import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Eye, Database } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedValidation, getBacktestConfig } from './validationSummaryData'
import type { BacktestConfig } from './validationSummaryData'
import { BacktestSummary } from './BacktestChart'
import type { StageId, ValidationSummaryResults, ValidationCategory, ValidationOverallMetrics } from '@/store/types'

type CategoryKey = 'sufficient' | 'insufficient' | 'helpMe' | 'augmented'

const CATEGORIES: {
  key: CategoryKey
  label: string
  color: string
  borderColor: string
  textColor: string
  bgColor: string
}[] = [
  {
    key: 'sufficient',
    label: 'Dominant Patterns',
    color: '#10b981',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
  },
  {
    key: 'insufficient',
    label: 'Non-Dominant Patterns',
    color: '#ef4444',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500',
  },
  {
    key: 'helpMe',
    label: 'Fuzzy Patterns',
    color: '#f59e0b',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500',
  },
  {
    key: 'augmented',
    label: 'Augmented Data',
    color: '#3b82f6',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500',
  },
]

// ─── Metric explanation helper ────────────────────────────────────────────────

function getMetricExplanation(businessGoal: string | null, primaryMetric: string): string {
  const g = (businessGoal ?? '').toLowerCase()
  if (primaryMetric === 'Recall') {
    if (g.includes('churn'))
      return 'Recall is prioritised because missing a customer about to churn is more costly than a false alarm. Every true churner not caught is a lost revenue opportunity.'
    if (g.includes('fraud'))
      return 'Recall is prioritised because a missed fraud transaction causes direct financial loss, whereas a false positive is a minor inconvenience.'
    if (g.includes('readmission') || g.includes('patient'))
      return 'Recall is prioritised because failing to flag a patient at risk of readmission leads to preventable health complications.'
    if (g.includes('attrition') || g.includes('employee'))
      return 'Recall is prioritised because missing an employee likely to leave means losing talent and incurring replacement costs.'
    if (g.includes('insurance') || g.includes('claim'))
      return 'Recall is prioritised because failing to identify a valid claim results in underpayment and regulatory risk.'
    if (g.includes('maintenance') || g.includes('failure'))
      return 'Recall is prioritised because missing an impending equipment failure leads to costly unplanned downtime.'
    return 'Recall is prioritised because missing true positives has a higher business cost than false alarms in this scenario.'
  }
  if (primaryMetric === 'MAPE') {
    if (g.includes('demand') || g.includes('store'))
      return 'MAPE is prioritised because relative forecast accuracy directly determines inventory levels and stockout risk. A 5% error on a high-volume SKU matters as much as on a low-volume one.'
    if (g.includes('energy') || g.includes('consumption'))
      return 'MAPE is prioritised because relative energy forecast error drives procurement decisions and grid balancing costs proportionally across all consumption levels.'
    return 'MAPE is prioritised because relative error is the most meaningful measure for this forecasting objective.'
  }
  return `${primaryMetric} is the primary optimisation target for this model based on the stated business objective.`
}

function MetricEyeTooltip({ explanation }: { explanation: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <Eye className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-200 transition-colors" />
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-gray-900 border border-gray-700 p-3 shadow-xl z-50">
          <p className="text-[11px] text-gray-300 leading-relaxed">{explanation}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
        </div>
      )}
    </div>
  )
}

// ─── Overall Performance Banner ───────────────────────────────────────────────

function OverallPerformanceBanner({
  metrics,
  businessGoal,
}: {
  metrics: ValidationOverallMetrics
  businessGoal: string | null
}) {
  const isRegressionMetric = metrics.primaryMetric === 'MAPE' || metrics.primaryMetric === 'RMSE'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className="rounded-xl border border-gray-700/60 bg-gray-800/60 p-5"
    >
      {/* Metrics row */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-8">
          <div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{metrics.primaryMetric}</div>
            <div className="text-3xl font-bold text-white">
              {isRegressionMetric
                ? metrics.primaryValue
                : <><CountUpNumber end={metrics.primaryValue} />%</>}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Primary</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{metrics.secondaryMetric}</div>
            <div className="text-3xl font-bold text-gray-300">
              {isRegressionMetric
                ? metrics.secondaryValue
                : <><CountUpNumber end={metrics.secondaryValue} />%</>}
            </div>
            <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Secondary</div>
          </div>
        </div>
        <div className="flex items-start gap-2 max-w-sm">
          <MetricEyeTooltip explanation={getMetricExplanation(businessGoal, metrics.primaryMetric)} />
          <p className="text-xs text-gray-400 leading-relaxed italic">{metrics.statement}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
  label,
  data,
  borderColor,
  textColor,
  bgColor,
  isActive,
  onClick,
}: {
  label: string
  data: ValidationCategory
  color: string
  borderColor: string
  textColor: string
  bgColor: string
  isActive: boolean
  onClick: () => void
}) {
  const barFill = Math.min(data.percentage, 100)
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`text-left p-5 rounded-xl border-2 transition-all w-full ${isActive ? borderColor : 'border-gray-700/60'} bg-gray-800/60`}
    >
      <div className={`text-xs font-semibold mb-2 ${textColor}`}>{label}</div>
      <div className="text-3xl font-bold text-white mb-1">
        <CountUpNumber end={data.count} />
      </div>
      <div className={`text-sm font-medium mb-3 ${textColor}`}>{data.percentage.toFixed(1)}%</div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
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
        <span className="text-xs text-gray-400">
          {data.cohorts.length} cohorts · {data.count} validation samples
        </span>
      </div>

      <div className={`rounded-xl border-2 ${borderColor} overflow-hidden`}>
        {/* Table header — 4 proper columns */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-gray-800/50 px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700">
          <div>Cohort Name</div>
          <div className="text-right">Total Count</div>
          <div className="text-right">Validation Samples</div>
          <div className="text-right">Sampling %</div>
        </div>

        {/* Rows */}
        {visible.map((cohort, i) => (
          <motion.div
            key={cohort.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 border-b border-gray-700/50 last:border-0 bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
          >
            <div className="text-sm text-gray-200 font-mono truncate pr-4">{cohort.name}</div>
            <div className="text-right text-sm text-gray-300 font-mono">{cohort.totalCount.toLocaleString()}</div>
            <div className="text-right text-sm font-mono text-gray-300">{cohort.validationSamples}</div>
            <div className={`text-right text-xs font-semibold font-mono ${textColor}`}>
              {cohort.samplingPct === 0 ? '—' : `${cohort.samplingPct}%`}
            </div>
          </motion.div>
        ))}

        {/* Load more / show less */}
        {!showAll && remaining > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className={`w-full py-3 text-sm font-semibold transition-colors ${textColor} hover:bg-gray-700/30`}
          >
            Load More ({remaining} remaining)
          </button>
        )}
        {showAll && data.cohorts.length > 3 && (
          <button
            onClick={() => setShowAll(false)}
            className={`w-full py-3 text-sm font-semibold transition-colors ${textColor} hover:bg-gray-700/30`}
          >
            Show Less
          </button>
        )}
      </div>

      {/* Category-specific action panel */}
      {categoryKey === 'insufficient' && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            This pattern appears strong but lacks sufficient data. <span className="text-gray-300 font-medium">Recommended:</span> Collect ~{Math.max(50, Math.round(data.count * 0.3))} more records matching this cohort, OR enable synthetic augmentation.
          </p>
          <div className="relative group inline-flex">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/10"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <Database className="w-3.5 h-3.5" />
              Augment with Synthetic Data
            </button>
            <div className="absolute bottom-full left-0 mb-2 w-56 rounded-lg bg-gray-900 border border-gray-700 p-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <p className="text-[10px] text-gray-300 leading-relaxed">Generates realistic synthetic records that match the statistical distribution of this cohort to improve model coverage.</p>
              <div className="absolute top-full left-6 border-4 border-transparent border-t-gray-700" />
            </div>
          </div>
        </div>
      )}

      {categoryKey === 'helpMe' && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            This pattern has ambiguous boundaries. Predictions in this zone are tagged for manual review.
          </p>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/10"
            style={{ border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Configure Review Workflow
          </button>
        </div>
      )}

      {categoryKey === 'augmented' && (
        <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            Synthetic data was generated to strengthen validation. These patterns are now production-ready with caveats — monitor for distribution drift between synthetic and real-world data.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ValidationSummary() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const businessGoal = usePlaygroundStore((s) => s.businessGoal)
  const setValidationSummaryResults = usePlaygroundStore((s) => s.setValidationSummaryResults)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-100">Validation Data Set Summary</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Comprehensive validation dataset combining valid cohorts, confusing edge cases, and augmented variations to provide complete coverage of real-world data distributions.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900">
        {/* Total validation banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/30 bg-gray-800/60 p-5 flex items-center justify-between"
          style={{ borderLeft: '4px solid #10b981' }}
        >
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Validation Data</div>
            <div className="text-4xl font-bold text-white">
              <CountUpNumber end={data.totalCount} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Distribution Overview</div>
            <div className="text-sm font-semibold text-gray-300">{data.totalCohorts} cohorts total</div>
          </div>
        </motion.div>

        {/* Overall Performance Banner */}
        <OverallPerformanceBanner
          metrics={data.overallMetrics}
          businessGoal={businessGoal}
        />

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
              />
            </motion.div>
          ))}
        </div>

        {/* Detailed breakdown for selected category */}
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </div>

      <BottomActionBar
        onNext={handleNext}
        nextLabel="Continue to Model Selection"
      />
    </div>
  )
}
