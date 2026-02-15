import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, Circle } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { InsightCard } from '@/components/shared/InsightCard'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import type { StageId, AIInsight, EDAResults } from '@/store/types'
import { getPrecomputedEDA } from './edaData'

interface EDAModuleState {
  id: string
  label: string
  status: 'pending' | 'running' | 'complete'
}

const moduleList: EDAModuleState[] = [
  { id: 'summary', label: 'Data Shape & Types', status: 'pending' },
  { id: 'missing', label: 'Missing Values Analysis', status: 'pending' },
  { id: 'distributions', label: 'Feature Distributions', status: 'pending' },
  { id: 'correlations', label: 'Correlation Matrix', status: 'pending' },
  { id: 'outliers', label: 'Outlier Detection', status: 'pending' },
  { id: 'quality', label: 'Data Quality Score', status: 'pending' },
]

export function AutoEDA() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const selectedObjective = usePlaygroundStore((s) => s.selectedObjective)
  const setEdaResults = usePlaygroundStore((s) => s.setEdaResults)
  const addLog = usePlaygroundStore((s) => s.addLog)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)

  const [modules, setModules] = useState<EDAModuleState[]>(moduleList)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [edaData, setEdaData] = useState<EDAResults | null>(null)
  const [visibleInsights, setVisibleInsights] = useState<AIInsight[]>([])
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const runAnalysis = useCallback(async () => {
    if (!selectedDataset) return

    const data = getPrecomputedEDA(selectedDataset.id)
    setEdaData(data)

    // Stream through modules with delays
    for (let i = 0; i < moduleList.length; i++) {
      const mod = moduleList[i]

      // Set current module to running
      setModules((prev) =>
        prev.map((m, idx) =>
          idx === i ? { ...m, status: 'running' } : m
        )
      )
      setActiveModule(mod.id)

      addLog(`Analyzing: ${mod.label}...`, 'info')

      // Simulate analysis time
      await new Promise((r) => setTimeout(r, 1800 + Math.random() * 1200))

      // Complete module
      setModules((prev) =>
        prev.map((m, idx) =>
          idx === i ? { ...m, status: 'complete' } : m
        )
      )

      addLog(`Completed: ${mod.label}`, 'success')

      // Show insight after certain modules
      if (data.insights[i]) {
        setVisibleInsights((prev) => [...prev, data.insights[i]])
      }
    }

    setEdaResults(data)
    setAnalysisComplete(true)
    addLog(`EDA complete — Data quality score: ${data.qualityScore}/100`, 'success')
  }, [selectedDataset, addLog, setEdaResults])

  useEffect(() => {
    runAnalysis()
  }, [runAnalysis])

  const handleNext = () => {
    completeStep(2)
    setStep(3 as StageId)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Autonomous EDA</h2>
          {selectedObjective && (
            <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
              Objective: {selectedObjective.label}
            </span>
          )}
          {analysisComplete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium"
            >
              Analysis Complete
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          The AI is autonomously analyzing {selectedDataset?.rows.toLocaleString()} records across {selectedDataset?.features} features
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Checklist */}
        <div className="w-72 border-r border-gray-200 bg-white p-4 overflow-y-auto shrink-0">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Analysis Modules
          </h3>
          <div className="space-y-1.5">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  mod.status === 'running'
                    ? 'bg-primary/5 border border-primary/20'
                    : mod.status === 'complete'
                      ? 'bg-success/5'
                      : 'bg-gray-50'
                }`}
              >
                {mod.status === 'complete' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <Check className="w-4 h-4 text-success" />
                  </motion.div>
                ) : mod.status === 'running' ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
                <span
                  className={`text-sm font-medium ${
                    mod.status === 'running'
                      ? 'text-primary'
                      : mod.status === 'complete'
                        ? 'text-gray-700'
                        : 'text-gray-400'
                  }`}
                >
                  {mod.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visualization Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Data Summary */}
          <AnimatePresence>
            {edaData && modules.find((m) => m.id === 'summary')?.status === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
              >
                {[
                  { label: 'Rows', value: edaData.summary.rows },
                  { label: 'Columns', value: edaData.summary.columns },
                  { label: 'Numeric', value: edaData.summary.numericFeatures },
                  { label: 'Categorical', value: edaData.summary.categoricalFeatures },
                  { label: 'Duplicates', value: edaData.summary.duplicateRows },
                  { label: 'Memory', value: edaData.summary.memoryUsage, isText: true },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-gray-900">
                      {'isText' in stat ? (
                        stat.value
                      ) : (
                        <CountUpNumber end={stat.value as number} />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Missing Values */}
          {edaData && modules.find((m) => m.id === 'missing')?.status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-dark rounded-xl p-5"
            >
              <h4 className="text-sm font-semibold text-white mb-4">Missing Values by Feature</h4>
              <div className="space-y-2">
                {edaData.missingValues.columns.map((col, i) => {
                  const pct = (edaData.missingValues.values[i] / edaData.summary.rows) * 100
                  return (
                    <motion.div
                      key={col}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs text-gray-400 w-32 truncate font-mono">{col}</span>
                      <div className="flex-1 h-5 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className={`h-full rounded-full ${
                            pct > 20 ? 'bg-danger' : pct > 5 ? 'bg-warning' : 'bg-success'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-400 w-14 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Distributions */}
          {edaData && modules.find((m) => m.id === 'distributions')?.status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-dark rounded-xl p-5"
            >
              <h4 className="text-sm font-semibold text-white mb-4">Feature Distributions (Top 6)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {edaData.distributions.slice(0, 6).map((dist, di) => (
                  <div key={dist.feature} className="bg-gray-800/50 rounded-lg p-3">
                    <span className="text-xs font-mono text-gray-400">{dist.feature}</span>
                    {dist.bins && (
                      <div className="flex items-end gap-0.5 h-20 mt-2">
                        {dist.bins.map((bin, bi) => {
                          const maxCount = Math.max(...dist.bins!.map((b) => b.count))
                          const height = (bin.count / maxCount) * 100
                          return (
                            <motion.div
                              key={bi}
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 0.5, delay: di * 0.1 + bi * 0.03 }}
                              className="flex-1 bg-secondary rounded-t"
                              title={`${bin.label}: ${bin.count}`}
                            />
                          )
                        })}
                      </div>
                    )}
                    {dist.stats && (
                      <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                        <span>min: {dist.stats.min}</span>
                        <span>mean: {dist.stats.mean.toFixed(1)}</span>
                        <span>max: {dist.stats.max}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Correlation Matrix */}
          {edaData && modules.find((m) => m.id === 'correlations')?.status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-dark rounded-xl p-5"
            >
              <h4 className="text-sm font-semibold text-white mb-4">Correlation Matrix</h4>
              <div className="overflow-x-auto">
                <div className="inline-grid gap-0.5" style={{
                  gridTemplateColumns: `80px repeat(${edaData.correlations.features.length}, 40px)`,
                }}>
                  <div /> {/* empty corner */}
                  {edaData.correlations.features.map((f) => (
                    <div key={f} className="text-[9px] text-gray-500 text-center truncate font-mono -rotate-45 origin-bottom-left h-10 flex items-end justify-center">
                      {f}
                    </div>
                  ))}
                  {edaData.correlations.matrix.map((row, ri) => (
                    <>
                      <div key={`label-${ri}`} className="text-[9px] text-gray-500 font-mono truncate flex items-center pr-1">
                        {edaData.correlations.features[ri]}
                      </div>
                      {row.map((val, ci) => {
                        const absVal = Math.abs(val)
                        const color = val >= 0
                          ? `rgba(6, 182, 212, ${absVal})`
                          : `rgba(239, 68, 68, ${absVal})`
                        return (
                          <motion.div
                            key={`${ri}-${ci}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: (ri + ci) * 0.01 }}
                            className="w-10 h-10 rounded flex items-center justify-center text-[8px] font-mono text-white"
                            style={{ backgroundColor: color }}
                            title={`${edaData.correlations.features[ri]} x ${edaData.correlations.features[ci]}: ${val.toFixed(2)}`}
                          >
                            {val.toFixed(1)}
                          </motion.div>
                        )
                      })}
                    </>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Outliers */}
          {edaData && modules.find((m) => m.id === 'outliers')?.status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Outlier Detection</h4>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">
                  {edaData.outliers.outlierCount} outliers detected ({((edaData.outliers.outlierCount / edaData.outliers.totalCount) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="relative h-48 bg-gray-50 rounded-lg overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 400 200">
                  {edaData.outliers.points.slice(0, 200).map((pt, i) => (
                    <motion.circle
                      key={i}
                      cx={pt.x * 380 + 10}
                      cy={200 - (pt.y * 180 + 10)}
                      r={pt.isOutlier ? 4 : 2.5}
                      fill={pt.isOutlier ? '#ef4444' : '#06b6d4'}
                      opacity={pt.isOutlier ? 0.9 : 0.4}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.005 }}
                    >
                      {pt.isOutlier && (
                        <animate
                          attributeName="opacity"
                          values="0.9;0.4;0.9"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </motion.circle>
                  ))}
                </svg>
              </div>
            </motion.div>
          )}

          {/* Quality Score */}
          {edaData && modules.find((m) => m.id === 'quality')?.status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-6 text-center"
            >
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Data Quality Score</h4>
              <div className="relative w-40 h-40 mx-auto">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={edaData.qualityScore >= 80 ? '#10b981' : edaData.qualityScore >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 50 * (1 - edaData.qualityScore / 100),
                    }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      <CountUpNumber end={edaData.qualityScore} />
                    </div>
                    <div className="text-xs text-gray-500">out of 100</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Insights */}
          {visibleInsights.length > 0 && (
            <div className="space-y-3">
              {visibleInsights.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} delay={i === visibleInsights.length - 1 ? 300 : 0} />
              ))}
            </div>
          )}

          {/* Inline CTA after analysis */}
          {analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center"
            >
              <p className="text-sm text-gray-600">
                Imagine this running on <span className="font-semibold text-primary">your</span> data.{' '}
                <a href="#book-demo" className="text-primary font-semibold hover:underline">
                  Talk to us →
                </a>
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <BottomActionBar
        onNext={analysisComplete ? handleNext : undefined}
        nextDisabled={!analysisComplete}
        nextLabel="Continue to Pattern Discovery"
      />
    </div>
  )
}
