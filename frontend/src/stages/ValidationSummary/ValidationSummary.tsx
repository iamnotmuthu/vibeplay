import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedValidation } from './validationSummaryData'
import type { StageId, ValidationSummaryResults, ValidationCategory } from '@/store/types'

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
    label: 'Sufficient Data',
    color: '#10b981',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
  },
  {
    key: 'insufficient',
    label: 'Insufficient Data',
    color: '#ef4444',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500',
  },
  {
    key: 'helpMe',
    label: 'Help Me',
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

function CategoryCard({
  label,
  data,
  color,
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
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barFill}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${bgColor}`}
        />
      </div>
    </motion.button>
  )
}

function BreakdownTable({
  categoryLabel,
  textColor,
  borderColor,
  data,
}: {
  categoryLabel: string
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
        {/* Table header */}
        <div className="grid grid-cols-4 bg-gray-800/50 px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700">
          <div className="col-span-2">Cohort Name</div>
          <div className="text-right">Total Count</div>
          <div className="text-right">Validation Samples</div>
        </div>

        {/* Rows */}
        {visible.map((cohort, i) => (
          <motion.div
            key={cohort.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-4 px-4 py-3 border-b border-gray-700/50 last:border-0 bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
          >
            <div className="col-span-2 text-sm text-gray-200 font-mono truncate pr-4">{cohort.name}</div>
            <div className="text-right text-sm text-gray-300 font-mono">{cohort.totalCount.toLocaleString()}</div>
            <div className="text-right">
              <span className="text-sm font-mono text-gray-300">{cohort.validationSamples}</span>
              <span className={`ml-2 text-xs font-semibold ${textColor}`}>{cohort.samplingPct}%</span>
            </div>
          </motion.div>
        ))}

        {/* Load more */}
        {!showAll && remaining > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className={`w-full py-3 text-sm font-semibold transition-colors ${textColor} hover:bg-gray-700/30`}
          >
            Load More ({remaining} remaining)
          </button>
        )}
      </div>
    </div>
  )
}

export function ValidationSummary() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setValidationSummaryResults = usePlaygroundStore((s) => s.setValidationSummaryResults)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [data, setData] = useState<ValidationSummaryResults | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('sufficient')

  useEffect(() => {
    if (!selectedDataset) return
    const results = getPrecomputedValidation(selectedDataset.id)
    setData(results)
    setValidationSummaryResults(results)
    addLog(`Validation summary loaded — ${results.totalCount} samples across ${results.totalCohorts} cohorts`, 'success')
    addLog(`Sufficient: ${results.sufficient.count} (${results.sufficient.percentage}%) · Insufficient: ${results.insufficient.count}`, 'info')
  }, [selectedDataset, setValidationSummaryResults, addLog])

  const handleNext = () => {
    completeStep(5)
    setStep(6 as StageId)
  }

  if (!data) return null

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
