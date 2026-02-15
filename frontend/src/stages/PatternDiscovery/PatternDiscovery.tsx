import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { InsightCard } from '@/components/shared/InsightCard'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedPatterns } from './patternData'
import type { StageId, PatternResults } from '@/store/types'

export function PatternDiscovery() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setPatternResults = usePlaygroundStore((s) => s.setPatternResults)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [data, setData] = useState<PatternResults | null>(null)
  const [phase, setPhase] = useState<'clustering' | 'anomaly' | 'complete'>('clustering')
  const [showClusters, setShowClusters] = useState(false)
  const [showAnomalies, setShowAnomalies] = useState(false)

  const runDiscovery = useCallback(async () => {
    if (!selectedDataset) return
    const results = getPrecomputedPatterns(selectedDataset.id)
    setData(results)

    addLog('Running cluster analysis...', 'info')
    await new Promise((r) => setTimeout(r, 2500))
    setShowClusters(true)
    addLog(`Discovered ${results.clusters.clusterLabels.length} customer segments`, 'success')

    setPhase('anomaly')
    addLog('Detecting anomalies...', 'info')
    await new Promise((r) => setTimeout(r, 2000))
    setShowAnomalies(true)
    addLog(`Found ${results.anomalies.anomalyCount} anomalous records (${results.anomalies.anomalyPercent.toFixed(1)}%)`, 'success')

    setPhase('complete')
    setPatternResults(results)
    addLog('Pattern discovery complete', 'success')
  }, [selectedDataset, addLog, setPatternResults])

  useEffect(() => {
    runDiscovery()
  }, [runDiscovery])

  const handleNext = () => {
    completeStep(3)
    setStep(4 as StageId)
  }

  const clusterColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Pattern Discovery</h2>
          {phase !== 'complete' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Autonomously discovering hidden segments, clusters, and anomalies in the data
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Cluster Scatter */}
        {data && showClusters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-dark rounded-xl p-5"
          >
            <h4 className="text-sm font-semibold text-white mb-2">Cluster Analysis</h4>
            <p className="text-xs text-gray-400 mb-4">
              {data.clusters.clusterLabels.length} natural segments discovered via unsupervised learning
            </p>

            {/* Scatter plot */}
            <div className="relative h-64 bg-gray-800/50 rounded-lg overflow-hidden mb-4">
              <svg width="100%" height="100%" viewBox="0 0 500 280">
                {data.clusters.points.map((pt, i) => (
                  <motion.circle
                    key={i}
                    cx={pt.x * 460 + 20}
                    cy={260 - (pt.y * 240 + 10)}
                    r={3}
                    fill={clusterColors[pt.cluster % clusterColors.length]}
                    opacity={0.7}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.003, duration: 0.3 }}
                  />
                ))}
              </svg>
            </div>

            {/* Cluster labels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.clusters.clusterLabels.map((cl, i) => (
                <motion.div
                  key={cl.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: clusterColors[cl.id % clusterColors.length] }}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{cl.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{cl.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <CountUpNumber end={cl.count} className="text-gray-300" /> records
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Anomaly Detection */}
        {data && showAnomalies && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">Anomaly Detection</h4>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-danger/10 text-danger">
                <CountUpNumber end={data.anomalies.anomalyCount} /> anomalies ({data.anomalies.anomalyPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="relative h-48 bg-gray-50 rounded-lg overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 500 200">
                {data.anomalies.points.slice(0, 200).map((pt, i) => (
                  <motion.circle
                    key={i}
                    cx={pt.x * 460 + 20}
                    cy={180 - (pt.y * 160 + 10)}
                    r={pt.isAnomaly ? 5 : 2.5}
                    fill={pt.isAnomaly ? '#ef4444' : '#94a3b8'}
                    opacity={pt.isAnomaly ? 0.9 : 0.3}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.005 }}
                  >
                    {pt.isAnomaly && (
                      <animate
                        attributeName="r"
                        values="4;6;4"
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

        {/* AI Insights */}
        {data && phase === 'complete' && (
          <div className="space-y-3">
            {data.insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} delay={i * 500} />
            ))}
          </div>
        )}
      </div>

      <BottomActionBar
        onNext={phase === 'complete' ? handleNext : undefined}
        nextDisabled={phase !== 'complete'}
        nextLabel="Continue to Feature Intelligence"
      />
    </div>
  )
}
