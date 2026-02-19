import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, Circle, Layers } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { InsightCard } from '@/components/shared/InsightCard'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { useDomainSubtitle } from '@/lib/useDomainSubtitle'
import type { StageId, AIInsight, EDAResults, DimensionResults } from '@/store/types'
import { getPrecomputedEDA } from './edaData'
import { getPrecomputedDimensions } from '../DimensionDiscovery/dimensionData'

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
  const setEdaResults = usePlaygroundStore((s) => s.setEdaResults)
  const setDimensionResults = usePlaygroundStore((s) => s.setDimensionResults)
  const addLog = usePlaygroundStore((s) => s.addLog)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const subtitle = useDomainSubtitle(
    'eda',
    `The AI is autonomously analyzing ${selectedDataset?.rows.toLocaleString()} records across ${selectedDataset?.features} features`
  )

  const [modules, setModules] = useState<EDAModuleState[]>(moduleList)
  const [_activeModule, setActiveModule] = useState<string | null>(null)
  const [edaData, setEdaData] = useState<EDAResults | null>(null)
  const [visibleInsights, setVisibleInsights] = useState<AIInsight[]>([])
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Dimension discovery state
  const [dimData, setDimData] = useState<DimensionResults | null>(null)
  const [revealedDimCount, setRevealedDimCount] = useState(0)
  const [dimComplete, setDimComplete] = useState(false)

  const runAnalysis = useCallback(async () => {
    if (!selectedDataset) return

    const data = getPrecomputedEDA(selectedDataset.id)
    setEdaData(data)

    // Stream through EDA modules
    for (let i = 0; i < moduleList.length; i++) {
      const mod = moduleList[i]
      setModules((prev) => prev.map((m, idx) => idx === i ? { ...m, status: 'running' } : m))
      setActiveModule(mod.id)
      addLog(`Analyzing: ${mod.label}...`, 'info')
      await new Promise((r) => setTimeout(r, 1800 + Math.random() * 1200))
      setModules((prev) => prev.map((m, idx) => idx === i ? { ...m, status: 'complete' } : m))
      addLog(`Completed: ${mod.label}`, 'success')
      if (data.insights[i]) {
        setVisibleInsights((prev) => [...prev, data.insights[i]])
      }
    }

    setEdaResults(data)
    setAnalysisComplete(true)
    addLog(`EDA complete — Data quality score: ${data.qualityScore}/100`, 'success')

    // --- Dimension Discovery phase ---
    await new Promise((r) => setTimeout(r, 600))
    const dimResults = getPrecomputedDimensions(selectedDataset.id)
    setDimData(dimResults)
    addLog('Mapping attributes into meaningful dimensions...', 'info')
    await new Promise((r) => setTimeout(r, 800))

    for (let i = 0; i < dimResults.dimensions.length; i++) {
      setRevealedDimCount(i + 1)
      addLog(`Dimension mapped: "${dimResults.dimensions[i].name}" (${dimResults.dimensions[i].attributes.length} attributes)`, 'success')
      await new Promise((r) => setTimeout(r, 700))
    }

    setDimensionResults(dimResults)
    setDimComplete(true)
    addLog(`Dimension mapping complete — ${dimResults.dimensions.length} dimensions discovered`, 'success')
  }, [selectedDataset, addLog, setEdaResults, setDimensionResults])

  useEffect(() => {
    runAnalysis()
  }, [runAnalysis])

  const handleNext = () => {
    completeStep(3)
    setStep(4 as StageId)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Autonomous EDA</h2>
          {dimComplete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium"
            >
              Analysis Complete
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Checklist */}
        <div className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 overflow-y-auto shrink-0">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
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
                      : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                {mod.status === 'complete' ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
                    <Check className="w-4 h-4 text-success" />
                  </motion.div>
                ) : mod.status === 'running' ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
                <span className={`text-sm font-medium ${
                  mod.status === 'running' ? 'text-primary' : mod.status === 'complete' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {mod.label}
                </span>
              </div>
            ))}
          </div>

          {/* Dimension discovery progress in sidebar */}
          {analysisComplete && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Dimension Mapping
              </h3>
              <div className="space-y-1.5">
                {dimData?.dimensions.slice(0, revealedDimCount).map((dim) => (
                  <motion.div
                    key={dim.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/5"
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dim.color }} />
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{dim.name}</span>
                    <Check className="w-3 h-3 text-success ml-auto shrink-0" />
                  </motion.div>
                ))}
                {dimData && revealedDimCount < dimData.dimensions.length && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-xs text-primary">Mapping dimensions...</span>
                  </div>
                )}
              </div>
            </div>
          )}
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
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {'isText' in stat ? stat.value : <CountUpNumber end={stat.value as number} />}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Missing Values */}
          {edaData && modules.find((m) => m.id === 'missing')?.status === 'complete' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-dark rounded-xl p-5">
              <h4 className="text-sm font-semibold text-white mb-4">Missing Values by Feature</h4>
              <div className="space-y-2">
                {edaData.missingValues.columns.map((col, i) => {
                  const pct = (edaData.missingValues.values[i] / edaData.summary.rows) * 100
                  return (
                    <motion.div key={col} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-32 truncate font-mono">{col}</span>
                      <div className="flex-1 h-5 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className={`h-full rounded-full ${pct > 20 ? 'bg-danger' : pct > 5 ? 'bg-warning' : 'bg-success'}`}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-400 w-14 text-right">{pct.toFixed(1)}%</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Distributions */}
          {edaData && modules.find((m) => m.id === 'distributions')?.status === 'complete' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-dark rounded-xl p-5">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-dark rounded-xl p-5">
              <h4 className="text-sm font-semibold text-white mb-4">Correlation Matrix</h4>
              <div className="overflow-x-auto">
                <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `80px repeat(${edaData.correlations.features.length}, 40px)` }}>
                  <div />
                  {edaData.correlations.features.map((f) => (
                    <div key={f} className="text-[9px] text-gray-500 text-center truncate font-mono -rotate-45 origin-bottom-left h-10 flex items-end justify-center">{f}</div>
                  ))}
                  {edaData.correlations.matrix.map((row, ri) => (
                    <>
                      <div key={`label-${ri}`} className="text-[9px] text-gray-500 font-mono truncate flex items-center pr-1">{edaData.correlations.features[ri]}</div>
                      {row.map((val, ci) => {
                        const absVal = Math.abs(val)
                        const color = val >= 0 ? `rgba(6,182,212,${absVal})` : `rgba(239,68,68,${absVal})`
                        return (
                          <motion.div
                            key={`${ri}-${ci}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: (ri + ci) * 0.01 }}
                            className="w-10 h-10 rounded flex items-center justify-center text-[8px] font-mono text-white"
                            style={{ backgroundColor: color }}
                            title={`${edaData.correlations.features[ri]} × ${edaData.correlations.features[ci]}: ${val.toFixed(2)}`}
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Outlier Detection</h4>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">
                  {edaData.outliers.outlierCount} outliers detected ({((edaData.outliers.outlierCount / edaData.outliers.totalCount) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="relative h-48 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
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
                      {pt.isOutlier && <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />}
                    </motion.circle>
                  ))}
                </svg>
              </div>
            </motion.div>
          )}

          {/* Quality Score */}
          {edaData && modules.find((m) => m.id === 'quality')?.status === 'complete' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Quality Score</h4>
              <div className="relative w-40 h-40 mx-auto">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <motion.circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={edaData.qualityScore >= 80 ? '#10b981' : edaData.qualityScore >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - edaData.qualityScore / 100) }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      <CountUpNumber end={edaData.qualityScore} />
                    </div>
                    <div className="text-xs text-gray-500">out of 100</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* EDA AI Insights */}
          {visibleInsights.length > 0 && (
            <div className="space-y-3">
              {visibleInsights.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} delay={i === visibleInsights.length - 1 ? 300 : 0} />
              ))}
            </div>
          )}

          {/* Dimension Discovery section */}
          <AnimatePresence>
            {dimData && revealedDimCount > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Discovered Dimensions</h4>
                  {!dimComplete && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                  {dimComplete && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium"
                    >
                      {dimData.dimensions.length} dimensions mapped
                    </motion.span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {dimData.dimensions.slice(0, revealedDimCount).map((dim, i) => (
                    <motion.div
                      key={dim.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-xl border bg-white dark:bg-gray-800 p-4 overflow-hidden"
                      style={{ borderColor: `${dim.color}40` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dim.color }} />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dim.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{dim.attributes.length} attrs</span>
                      </div>
                      {/* Confidence bar */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${dim.confidence}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: dim.color }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{dim.confidence}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dim.attributes.map((attr) => (
                          <span
                            key={attr}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
