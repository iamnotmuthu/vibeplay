import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Grid3X3,
  LineChart,
  Layers,
  Award,
  CheckCircle2,
} from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedEvaluation } from './evaluationData'
import type { StageId, EvaluationResults } from '@/store/types'

type TabId = 'overview' | 'confusion' | 'roc' | 'shap'

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'confusion', label: 'Confusion Matrix', icon: Grid3X3 },
  { id: 'roc', label: 'ROC Curve', icon: LineChart },
  { id: 'shap', label: 'SHAP Analysis', icon: Layers },
]

const modelColors: Record<string, string> = {
  'Logistic Regression': '#3b82f6',
  'Random Forest': '#10b981',
  'XGBoost': '#f59e0b',
  'LightGBM': '#8b5cf6',
  'Neural Network': '#ec4899',
  'SVM': '#06b6d4',
}

export function EvaluationHub() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setEvaluationResults = usePlaygroundStore((s) => s.setEvaluationResults)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [data, setData] = useState<EvaluationResults | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!selectedDataset) return
    const results = getPrecomputedEvaluation(selectedDataset.id)
    setData(results)
    setEvaluationResults(results)
    setLoaded(true)
    addLog('Evaluation results loaded for all 6 models', 'success')
  }, [selectedDataset, setEvaluationResults, addLog])

  const handleNext = () => {
    completeStep(6)
    setStep(7 as StageId)
  }

  if (!data) return null

  const championModel = data.models.find((m) => m.name === data.champion)!
  const metricKeys = ['accuracy', 'precision', 'recall', 'f1', 'auc'] as const

  // Find best value for each metric
  const bestMetrics: Record<string, number> = {}
  for (const key of metricKeys) {
    bestMetrics[key] = Math.max(...data.models.map((m) => m.metrics[key]))
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Evaluation Hub</h2>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1"
          >
            <Award className="w-3 h-3" />
            Champion: {data.champion}
          </motion.span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Comprehensive model evaluation with confusion matrices, ROC curves, and explainability
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-200 bg-white">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3">Model</th>
                        {metricKeys.map((key) => (
                          <th key={key} className="text-right px-4 py-3">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.models
                        .slice()
                        .sort((a, b) => b.metrics.auc - a.metrics.auc)
                        .map((model) => {
                          const isChamp = model.name === data.champion
                          return (
                            <motion.tr
                              key={model.name}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`border-t border-gray-100 ${isChamp ? 'bg-amber-50/50' : ''
                                }`}
                            >
                              <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: modelColors[model.name] }}
                                />
                                {model.name}
                                {isChamp && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-bold uppercase">
                                    Best
                                  </span>
                                )}
                              </td>
                              {metricKeys.map((key) => {
                                const val = model.metrics[key]
                                const isBest = val === bestMetrics[key]
                                return (
                                  <td
                                    key={key}
                                    className={`px-4 py-3 text-right font-mono text-xs ${isBest
                                        ? 'text-green-600 font-bold bg-green-50'
                                        : 'text-gray-600'
                                      }`}
                                  >
                                    {(val * 100).toFixed(1)}%
                                  </td>
                                )
                              })}
                            </motion.tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Confusion Matrix Tab */}
          {activeTab === 'confusion' && (
            <motion.div
              key="confusion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-sm text-gray-600">
                Confusion matrix for <span className="font-semibold">{data.champion}</span> (champion model)
              </div>
              <div className="flex justify-center">
                <div className="inline-block">
                  {/* Axis labels */}
                  <div className="text-center text-xs text-gray-500 font-semibold mb-2">
                    Predicted
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center mr-2">
                      <span
                        className="text-xs text-gray-500 font-semibold"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        Actual
                      </span>
                    </div>
                    <div>
                      {/* Column headers */}
                      <div className="grid grid-cols-2 gap-2 mb-2 ml-20">
                        <div className="text-center text-xs text-gray-400">Negative</div>
                        <div className="text-center text-xs text-gray-400">Positive</div>
                      </div>
                      {/* Matrix */}
                      <div className="grid grid-cols-[80px_1fr_1fr] gap-2">
                        {/* Row 0: Actual Negative */}
                        <div className="flex items-center text-xs text-gray-400 justify-end pr-2">
                          Negative
                        </div>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="w-32 h-32 bg-green-100 border-2 border-green-300 rounded-xl flex flex-col items-center justify-center"
                        >
                          <div className="text-2xl font-bold text-green-700">
                            <CountUpNumber end={championModel.confusionMatrix[0][0]} />
                          </div>
                          <div className="text-[10px] text-green-600 font-medium mt-1">
                            True Negative
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="w-32 h-32 bg-red-50 border-2 border-red-200 rounded-xl flex flex-col items-center justify-center"
                        >
                          <div className="text-2xl font-bold text-red-600">
                            <CountUpNumber end={championModel.confusionMatrix[0][1]} />
                          </div>
                          <div className="text-[10px] text-red-500 font-medium mt-1">
                            False Positive
                          </div>
                        </motion.div>

                        {/* Row 1: Actual Positive */}
                        <div className="flex items-center text-xs text-gray-400 justify-end pr-2">
                          Positive
                        </div>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="w-32 h-32 bg-red-50 border-2 border-red-200 rounded-xl flex flex-col items-center justify-center"
                        >
                          <div className="text-2xl font-bold text-red-600">
                            <CountUpNumber end={championModel.confusionMatrix[1][0]} />
                          </div>
                          <div className="text-[10px] text-red-500 font-medium mt-1">
                            False Negative
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="w-32 h-32 bg-green-100 border-2 border-green-300 rounded-xl flex flex-col items-center justify-center"
                        >
                          <div className="text-2xl font-bold text-green-700">
                            <CountUpNumber end={championModel.confusionMatrix[1][1]} />
                          </div>
                          <div className="text-[10px] text-green-600 font-medium mt-1">
                            True Positive
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ROC Curve Tab */}
          {activeTab === 'roc' && (
            <motion.div
              key="roc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-sm text-gray-600">
                ROC curves for all models — the closer to the top-left corner, the better
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <svg viewBox="0 0 400 400" className="w-full max-w-lg mx-auto">
                  {/* Grid lines */}
                  {[0.2, 0.4, 0.6, 0.8].map((v) => (
                    <g key={v}>
                      <line
                        x1={v * 350 + 40}
                        y1={10}
                        x2={v * 350 + 40}
                        y2={360}
                        stroke="#e5e7eb"
                        strokeWidth={0.5}
                      />
                      <line
                        x1={40}
                        y1={360 - v * 350}
                        x2={390}
                        y2={360 - v * 350}
                        stroke="#e5e7eb"
                        strokeWidth={0.5}
                      />
                    </g>
                  ))}

                  {/* Axes */}
                  <line x1={40} y1={360} x2={390} y2={360} stroke="#9ca3af" strokeWidth={1} />
                  <line x1={40} y1={10} x2={40} y2={360} stroke="#9ca3af" strokeWidth={1} />

                  {/* Axis labels */}
                  <text x={215} y={395} textAnchor="middle" className="text-[11px]" fill="#6b7280">
                    False Positive Rate
                  </text>
                  <text
                    x={12}
                    y={185}
                    textAnchor="middle"
                    className="text-[11px]"
                    fill="#6b7280"
                    transform="rotate(-90, 12, 185)"
                  >
                    True Positive Rate
                  </text>

                  {/* Tick labels */}
                  {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v) => (
                    <g key={v}>
                      <text
                        x={v * 350 + 40}
                        y={378}
                        textAnchor="middle"
                        className="text-[9px]"
                        fill="#9ca3af"
                      >
                        {v.toFixed(1)}
                      </text>
                      <text
                        x={35}
                        y={364 - v * 350}
                        textAnchor="end"
                        className="text-[9px]"
                        fill="#9ca3af"
                      >
                        {v.toFixed(1)}
                      </text>
                    </g>
                  ))}

                  {/* Diagonal reference line */}
                  <line
                    x1={40}
                    y1={360}
                    x2={390}
                    y2={10}
                    stroke="#d1d5db"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />

                  {/* ROC curves for each model */}
                  {data.models.map((model, mi) => {
                    const color = modelColors[model.name] || '#666'
                    const pathData = model.rocCurve
                      .map(
                        (pt, i) =>
                          `${i === 0 ? 'M' : 'L'}${pt.fpr * 350 + 40},${360 - pt.tpr * 350}`
                      )
                      .join(' ')

                    return (
                      <motion.path
                        key={model.name}
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth={model.name === data.champion ? 3 : 1.5}
                        opacity={model.name === data.champion ? 1 : 0.6}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: mi * 0.2 }}
                      />
                    )
                  })}
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {data.models.map((model) => (
                    <div key={model.name} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-1 rounded"
                        style={{ backgroundColor: modelColors[model.name] }}
                      />
                      <span className="text-[10px] text-gray-500">
                        {model.name} (AUC: {model.metrics.auc.toFixed(3)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SHAP Tab */}
          {activeTab === 'shap' && (
            <motion.div
              key="shap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-sm text-gray-600">
                SHAP values for <span className="font-semibold">{data.champion}</span> — features pushing predictions higher (right) or lower (left)
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-3">
                  {championModel.shapValues?.map((sv, i) => {
                    const maxAbs = Math.max(
                      ...championModel.shapValues!.map((s) => Math.abs(s.value))
                    )
                    const widthPct = (Math.abs(sv.value) / maxAbs) * 100
                    const isPositive = sv.value > 0

                    return (
                      <motion.div
                        key={sv.feature}
                        initial={{ opacity: 0, x: isPositive ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-xs text-gray-600 w-48 truncate text-right font-mono">
                          {sv.feature}
                        </span>
                        <div className="flex-1 flex items-center">
                          {/* Negative side */}
                          <div className="flex-1 flex justify-end">
                            {!isPositive && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${widthPct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="h-6 bg-blue-500 rounded-l flex items-center justify-start pl-1"
                              >
                                <span className="text-[9px] font-bold text-white whitespace-nowrap">
                                  {sv.value.toFixed(2)}
                                </span>
                              </motion.div>
                            )}
                          </div>
                          {/* Center line */}
                          <div className="w-px h-8 bg-gray-300 shrink-0" />
                          {/* Positive side */}
                          <div className="flex-1">
                            {isPositive && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${widthPct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="h-6 bg-red-500 rounded-r flex items-center justify-end pr-1"
                              >
                                <span className="text-[9px] font-bold text-white whitespace-nowrap">
                                  +{sv.value.toFixed(2)}
                                </span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-gray-400 px-48">
                  <span>Pushes prediction lower</span>
                  <span>Pushes prediction higher</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Recommendation */}
        {loaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">AI Recommendation</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{data.recommendation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <BottomActionBar
        onNext={loaded ? handleNext : undefined}
        nextDisabled={!loaded}
        nextLabel="Continue to Drift & Retrain"
      />
    </div>
  )
}
