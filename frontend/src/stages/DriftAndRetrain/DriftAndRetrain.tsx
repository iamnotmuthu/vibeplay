import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Rocket,
  TrendingUp,
  TrendingDown,
  Shield,
} from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedDrift } from './driftData'
import type { DriftSimulation, DriftWeek, ModelMetrics } from '@/store/types'

function MetricCard({
  label,
  value,
  prevValue,
  format = 'percent',
}: {
  label: string
  value: number
  prevValue?: number
  format?: 'percent' | 'decimal'
}) {
  const displayVal = format === 'percent' ? value * 100 : value
  const delta = prevValue !== undefined ? value - prevValue : undefined
  const deltaPositive = delta !== undefined && delta > 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold text-gray-900 mt-1">
        <CountUpNumber end={displayVal} decimals={1} suffix={format === 'percent' ? '%' : ''} />
      </div>
      {delta !== undefined && (
        <div
          className={`text-[10px] font-medium mt-0.5 flex items-center justify-center gap-0.5 ${
            deltaPositive ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {deltaPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {deltaPositive ? '+' : ''}
          {(delta * 100).toFixed(1)}%
        </div>
      )}
    </div>
  )
}

export function DriftAndRetrain() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const champion = usePlaygroundStore((s) => s.champion)
  const setDriftSimulation = usePlaygroundStore((s) => s.setDriftSimulation)
  const setDriftWeek = usePlaygroundStore((s) => s.setDriftWeek)
  const setRetrainingInProgress = usePlaygroundStore((s) => s.setRetrainingInProgress)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [data, setData] = useState<DriftSimulation | null>(null)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [retraining, setRetraining] = useState(false)
  const [retrainProgress, setRetrainProgress] = useState(0)
  const [showRetrained, setShowRetrained] = useState(false)
  const [showFinalCTA, setShowFinalCTA] = useState(false)

  useEffect(() => {
    if (!selectedDataset) return
    const drift = getPrecomputedDrift(selectedDataset.id)
    setData(drift)
    setDriftSimulation(drift)
    addLog('Drift monitoring dashboard loaded — scrub timeline to simulate weeks', 'info')
  }, [selectedDataset, setDriftSimulation, addLog])

  const currentWeekData: DriftWeek | null = data
    ? data.weeks.find((w) => w.week === currentWeek) || null
    : null

  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const week = parseInt(e.target.value, 10)
    setCurrentWeek(week)
    setDriftWeek(week)
  }

  const handleRetrain = useCallback(async () => {
    if (!data?.retrainingResult) return

    setRetraining(true)
    setRetrainingInProgress(true)
    addLog('Triggering autonomous retraining on fresh data...', 'action')

    // Simulate retraining progress
    for (let i = 0; i <= 100; i += 2) {
      setRetrainProgress(i)
      await new Promise((r) => setTimeout(r, 80))
    }

    setRetraining(false)
    setRetrainingInProgress(false)
    setShowRetrained(true)
    completeStep(7)
    addLog('Retraining complete! Model performance restored.', 'success')

    // Show final CTA after delay
    await new Promise((r) => setTimeout(r, 2000))
    setShowFinalCTA(true)
  }, [data, addLog, setRetrainingInProgress, completeStep])

  if (!data || !currentWeekData) return null

  const healthConfig = {
    healthy: {
      color: 'bg-green-500',
      ring: 'ring-green-200',
      text: 'text-green-700',
      bg: 'bg-green-50',
      label: 'Healthy',
      icon: CheckCircle2,
    },
    warning: {
      color: 'bg-amber-500',
      ring: 'ring-amber-200',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      label: 'Warning',
      icon: AlertTriangle,
    },
    critical: {
      color: 'bg-red-500',
      ring: 'ring-red-200',
      text: 'text-red-700',
      bg: 'bg-red-50',
      label: 'Critical',
      icon: XCircle,
    },
  }

  const hc = healthConfig[currentWeekData.health]
  const HealthIcon = hc.icon
  const isCritical = currentWeekData.health === 'critical'
  const initialMetrics = data.weeks[0]?.metrics

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Final CTA Overlay */}
      <AnimatePresence>
        {showFinalCTA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
              >
                <Rocket className="w-8 h-8 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                You just experienced autonomous AI
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                From raw data to deployed model with drift monitoring and automatic retraining
                — all without writing a single line of code. Imagine this running on{' '}
                <span className="font-semibold text-primary">your</span> data, every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="#book-demo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Book Your Pilot
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setShowFinalCTA(false)}
                  className="inline-flex items-center justify-center px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Explore More
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Drift & Retrain</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            Monitoring: {champion || 'Champion Model'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Simulate 12 weeks of production deployment — watch for data drift and trigger retraining
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Health Status */}
        <motion.div
          key={currentWeekData.health}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className={`${hc.bg} border border-${currentWeekData.health === 'healthy' ? 'green' : currentWeekData.health === 'warning' ? 'amber' : 'red'}-200 rounded-xl p-4 flex items-center gap-4`}
        >
          <div className={`w-12 h-12 rounded-full ${hc.color} ring-4 ${hc.ring} flex items-center justify-center`}>
            <HealthIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className={`text-sm font-semibold ${hc.text}`}>
              Model Health: {hc.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Week {currentWeek} of 12 — Drift Score: {currentWeekData.driftScore.toFixed(3)}
            </div>
          </div>
          {isCritical && !showRetrained && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-auto"
            >
              <span className="text-xs text-red-600 font-medium animate-pulse">
                Retraining recommended
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Timeline Slider */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Production Timeline</h4>
            <span className="text-xs font-mono text-gray-500">Week {currentWeek}</span>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            value={currentWeek}
            onChange={handleWeekChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between mt-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => {
              const week = data.weeks.find((wk) => wk.week === w)
              const dotColor =
                week?.health === 'healthy'
                  ? 'bg-green-400'
                  : week?.health === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-red-400'
              return (
                <div key={w} className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${dotColor} ${w === currentWeek ? 'ring-2 ring-primary ring-offset-1' : ''}`} />
                  <span className="text-[9px] text-gray-400 mt-1">{w}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-5 gap-3">
          <MetricCard
            label="Accuracy"
            value={currentWeekData.metrics.accuracy}
            prevValue={initialMetrics?.accuracy}
          />
          <MetricCard
            label="Precision"
            value={currentWeekData.metrics.precision}
            prevValue={initialMetrics?.precision}
          />
          <MetricCard
            label="Recall"
            value={currentWeekData.metrics.recall}
            prevValue={initialMetrics?.recall}
          />
          <MetricCard
            label="F1 Score"
            value={currentWeekData.metrics.f1}
            prevValue={initialMetrics?.f1}
          />
          <MetricCard
            label="AUC"
            value={currentWeekData.metrics.auc}
            prevValue={initialMetrics?.auc}
          />
        </div>

        {/* Distribution Comparison */}
        {currentWeekData.distributions && currentWeekData.distributions.length > 0 && (
          <div className="bg-surface-dark rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-4">Distribution Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentWeekData.distributions.map((dist) => {
                const allVals = [...dist.original, ...dist.current]
                const maxVal = Math.max(...allVals, 1)
                const binCount = Math.min(dist.original.length, dist.current.length)

                return (
                  <div key={dist.feature} className="bg-gray-800/50 rounded-lg p-3">
                    <span className="text-xs font-mono text-gray-400">{dist.feature}</span>
                    <div className="flex items-end gap-0.5 h-24 mt-2">
                      {Array.from({ length: binCount }, (_, i) => {
                        const origHeight = (dist.original[i] / maxVal) * 100
                        const currHeight = (dist.current[i] / maxVal) * 100
                        return (
                          <div
                            key={i}
                            className="flex-1 flex gap-px items-end"
                          >
                            <div
                              className="flex-1 bg-blue-400/60 rounded-t transition-all duration-300"
                              style={{ height: `${origHeight}%` }}
                            />
                            <div
                              className="flex-1 bg-red-400/60 rounded-t transition-all duration-300"
                              style={{ height: `${currHeight}%` }}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex gap-4 mt-2 text-[9px]">
                      <span className="flex items-center gap-1 text-blue-400">
                        <div className="w-2 h-2 rounded bg-blue-400/60" />
                        Original
                      </span>
                      <span className="flex items-center gap-1 text-red-400">
                        <div className="w-2 h-2 rounded bg-red-400/60" />
                        Current
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PSI Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900">
              Feature-Level Drift (PSI)
            </h4>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2">Feature</th>
                <th className="text-right px-4 py-2">PSI Score</th>
                <th className="text-center px-4 py-2">Status</th>
                <th className="px-4 py-2 text-left">Drift Level</th>
              </tr>
            </thead>
            <tbody>
              {currentWeekData.psiValues.map((psi) => (
                <tr key={psi.feature} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">{psi.feature}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-gray-600">
                    {psi.psi.toFixed(3)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        psi.status === 'pass'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {psi.status === 'pass' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {psi.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          psi.psi > 0.25
                            ? 'bg-red-500'
                            : psi.psi > 0.1
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(psi.psi / 0.5, 1) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Retrain Button */}
        {isCritical && !showRetrained && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {retraining ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <RefreshCw className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  Retraining in Progress...
                </div>
                <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden mx-auto">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${retrainProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">{retrainProgress}% complete</div>
              </div>
            ) : (
              <motion.button
                onClick={handleRetrain}
                className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{ boxShadow: ['0 10px 25px rgba(239,68,68,0.2)', '0 10px 25px rgba(239,68,68,0.4)', '0 10px 25px rgba(239,68,68,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <RefreshCw className="w-5 h-5" />
                Trigger Autonomous Retraining
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Retrain Results */}
        {showRetrained && data.retrainingResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Retraining Successful</h4>
                <p className="text-xs text-gray-500">
                  Model performance restored with{' '}
                  <span className="font-bold text-green-600">
                    +{data.retrainingResult.improvement.toFixed(1)}%
                  </span>{' '}
                  improvement
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Before */}
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3">
                  Before Retraining
                </div>
                <div className="space-y-2">
                  {(Object.keys(data.retrainingResult.oldMetrics) as (keyof ModelMetrics)[]).map(
                    (key) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-xs text-gray-500 capitalize">{key}</span>
                        <span className="text-xs font-mono text-red-600">
                          {(data.retrainingResult!.oldMetrics[key] * 100).toFixed(1)}%
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* After */}
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
                  After Retraining
                </div>
                <div className="space-y-2">
                  {(Object.keys(data.retrainingResult.newMetrics) as (keyof ModelMetrics)[]).map(
                    (key) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-xs text-gray-500 capitalize">{key}</span>
                        <span className="text-xs font-mono text-green-600 font-bold">
                          {(data.retrainingResult!.newMetrics[key] * 100).toFixed(1)}%
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <BottomActionBar
        nextDisabled={true}
      />
    </div>
  )
}
