import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Terminal, Loader2 } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { InsightCard } from '@/components/shared/InsightCard'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedFeatures } from './featureData'
import type { StageId, FeatureResults } from '@/store/types'

export function FeatureIntelligence() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setFeatureResults = usePlaygroundStore((s) => s.setFeatureResults)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [data, setData] = useState<FeatureResults | null>(null)
  const [visibleBars, setVisibleBars] = useState(0)
  const [visibleLogEntries, setVisibleLogEntries] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [phase, setPhase] = useState<'importance' | 'engineering' | 'complete'>('importance')
  const logContainerRef = useRef<HTMLDivElement>(null)

  const runAnalysis = useCallback(async () => {
    if (!selectedDataset) return

    const results = getPrecomputedFeatures(selectedDataset.id)
    setData(results)

    addLog('Computing feature importance scores...', 'info')

    // Phase 1: Show importance bars one by one
    await new Promise((r) => setTimeout(r, 1200))
    for (let i = 0; i < results.importance.length; i++) {
      setVisibleBars(i + 1)
      await new Promise((r) => setTimeout(r, 150))
    }
    addLog(`Ranked ${results.importance.length} features by importance`, 'success')

    // Phase 2: Engineering log entries one by one
    setPhase('engineering')
    addLog('Running autonomous feature engineering...', 'info')
    await new Promise((r) => setTimeout(r, 800))

    for (let i = 0; i < results.engineeringLog.length; i++) {
      setVisibleLogEntries(i + 1)
      await new Promise((r) => setTimeout(r, 600))
    }

    addLog(`Engineered ${results.newFeatureCount} new features`, 'success')

    // Complete
    setPhase('complete')
    setFeatureResults(results)
    setAnalysisComplete(true)
    addLog('Feature intelligence complete', 'success')
  }, [selectedDataset, addLog, setFeatureResults])

  useEffect(() => {
    runAnalysis()
  }, [runAnalysis])

  // Auto-scroll log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [visibleLogEntries])

  const handleNext = () => {
    completeStep(4)
    setStep(5 as StageId)
  }

  const maxScore = data ? Math.max(...data.importance.map((f) => f.score)) : 1

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Feature Intelligence</h2>
          {phase !== 'complete' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {analysisComplete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium"
            >
              Complete
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Autonomously discovering, engineering, and ranking the most predictive features
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Feature Importance Bars */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Feature Importance</h3>
          {data && (
            <div className="space-y-2">
              {data.importance.slice(0, visibleBars).map((feat, i) => (
                <motion.div
                  key={feat.feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs text-gray-400 w-5 text-right font-mono">
                    {feat.rank}
                  </span>
                  <span className="text-xs text-gray-700 w-44 truncate font-mono" title={feat.feature}>
                    {feat.feature}
                  </span>
                  <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(feat.score / maxScore) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full flex items-center justify-end pr-2 ${
                        i === 0
                          ? 'bg-gradient-to-r from-primary to-primary-dark'
                          : i < 3
                            ? 'bg-primary/80'
                            : i < 5
                              ? 'bg-primary/60'
                              : 'bg-primary/40'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white">
                        {feat.score.toFixed(2)}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Engineering Log */}
        <div className="w-[420px] shrink-0 flex flex-col bg-gray-900">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
              Engineering Log
            </span>
            {phase === 'engineering' && (
              <span className="ml-auto text-[10px] text-gray-500 animate-pulse">processing...</span>
            )}
          </div>
          <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5">
            <div className="text-gray-500">$ ai-engineer --mode autonomous</div>
            <div className="text-green-400 mb-3">&gt; Starting feature engineering pipeline...</div>
            <AnimatePresence>
              {data && data.engineeringLog.slice(0, visibleLogEntries).map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-1.5 border-b border-gray-800 last:border-0"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        entry.action === 'Engineer'
                          ? 'bg-blue-500/20 text-blue-400'
                          : entry.action === 'Encode'
                            ? 'bg-purple-500/20 text-purple-400'
                            : entry.action === 'Scale' || entry.action === 'Transform'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : entry.action === 'Impute'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : entry.action === 'Balance'
                                  ? 'bg-orange-500/20 text-orange-400'
                                  : entry.action === 'Select'
                                    ? 'bg-pink-500/20 text-pink-400'
                                    : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {entry.action}
                    </span>
                    <span className="text-gray-300 leading-relaxed">{entry.detail}</span>
                  </div>
                  <div className="mt-1 text-gray-500 ml-14">
                    Impact: <span className="text-green-400">{entry.impact}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {phase === 'engineering' && visibleLogEntries < (data?.engineeringLog.length ?? 0) && (
              <motion.div
                animate={{ opacity: [1, 0.3] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-green-400"
              >
                █
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Summary + Insights */}
      {analysisComplete && data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-3"
        >
          {/* Summary card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Engineered <CountUpNumber end={data.newFeatureCount} className="text-primary" /> new features
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Top 5 predictors:{' '}
                {data.importance.slice(0, 5).map((f) => f.feature).join(', ')}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-2">
            {data.insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} delay={i * 400} />
            ))}
          </div>
        </motion.div>
      )}

      <BottomActionBar
        onNext={analysisComplete ? handleNext : undefined}
        nextDisabled={!analysisComplete}
        nextLabel="Continue to Model Arena"
      />
    </div>
  )
}
