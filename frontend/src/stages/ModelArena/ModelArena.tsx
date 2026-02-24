import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TreePine,
  Zap,
  Bolt,
  Brain,
  Crosshair,
  Trophy,
  Loader2,
  Crown,
} from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { getPrecomputedTraining } from './modelData'
import type { StageId, ModelTrainingState, ModelMetrics } from '@/store/types'

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  TrendingUp,
  TreePine,
  Zap,
  Bolt,
  Brain,
  Crosshair,
}

// Particle for confetti animation
interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  angle: number
  speed: number
}

function ProgressRing({
  progress,
  color,
  size = 80,
  strokeWidth = 6,
}: {
  progress: number
  color: string
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </svg>
  )
}

export function ModelArena() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setTrainingModels = usePlaygroundStore((s) => s.setTrainingModels)
  const updateTrainingModel = usePlaygroundStore((s) => s.updateTrainingModel)
  const setChampion = usePlaygroundStore((s) => s.setChampion)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [models, setModels] = useState<ModelTrainingState[]>([])
  const [_completedModels, setCompletedModels] = useState<Set<string>>(new Set())
  const [leaderboard, setLeaderboard] = useState<
    { name: string; metrics: ModelMetrics; color: string }[]
  >([])
  const [champion, setChampionLocal] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [allComplete, setAllComplete] = useState(false)
  const animFrameRef = useRef<number>(0)

  const runTraining = useCallback(async () => {
    if (!selectedDataset) return

    const trainingData = getPrecomputedTraining(selectedDataset.id)
    const initialModels = trainingData.initialModels.map((m) => ({
      ...m,
      status: 'training' as const,
    }))
    setModels(initialModels)
    setTrainingModels(initialModels)

    addLog('Model Arena: Starting simultaneous training of 6 models...', 'info')

    // Process timeline entries
    const timeline = trainingData.trainingTimeline
    let lastTime = 0
    const localCompleted = new Set<string>()

    for (const entry of timeline) {
      const delay = entry.time - lastTime
      if (delay > 0) {
        await new Promise((r) => setTimeout(r, Math.min(delay, 100)))
      }
      lastTime = entry.time

      setModels((prev) =>
        prev.map((m) => {
          if (m.name === entry.modelName) {
            const updated: ModelTrainingState = {
              ...m,
              progress: entry.progress,
            }
            if (entry.metrics) {
              updated.status = 'complete'
              updated.metrics = entry.metrics
            }
            return updated
          }
          return m
        })
      )

      if (entry.metrics) {
        updateTrainingModel(entry.modelName, {
          progress: 100,
          status: 'complete',
          metrics: entry.metrics,
        })
        localCompleted.add(entry.modelName)
        setCompletedModels(new Set(localCompleted))

        const color = initialModels.find((m) => m.name === entry.modelName)?.color || '#666'
        setLeaderboard((prev) => {
          const next = [
            ...prev.filter((l) => l.name !== entry.modelName),
            { name: entry.modelName, metrics: entry.metrics!, color },
          ]
          return next.sort((a, b) => b.metrics.auc - a.metrics.auc)
        })

        addLog(
          `${entry.modelName} complete — AUC: ${entry.metrics.auc.toFixed(3)}`,
          'success'
        )
      }
    }

    // Dramatic pause before champion reveal
    await new Promise((r) => setTimeout(r, 2000))

    const championName = trainingData.champion
    setChampionLocal(championName)
    setChampion(championName)
    setAllComplete(true)
    addLog(`Champion model: ${championName}!`, 'action')

    // Confetti
    setShowConfetti(true)
    const confettiColors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']
    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 30,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: 4 + Math.random() * 6,
      angle: Math.random() * Math.PI * 2,
      speed: 2 + Math.random() * 4,
    }))
    setParticles(newParticles)

    // Animate confetti
    let frame = 0
    const animateParticles = () => {
      frame++
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + Math.cos(p.angle) * p.speed * 0.3,
          y: p.y + Math.sin(p.angle) * p.speed * 0.5 + frame * 0.1,
          speed: p.speed * 0.98,
        }))
      )
      if (frame < 80) {
        animFrameRef.current = requestAnimationFrame(animateParticles)
      } else {
        setShowConfetti(false)
      }
    }
    animFrameRef.current = requestAnimationFrame(animateParticles)
  }, [selectedDataset, addLog, setTrainingModels, updateTrainingModel, setChampion])

  useEffect(() => {
    runTraining()
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [runTraining])

  const handleNext = () => {
    completeStep(5)
    setStep(6 as StageId)
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: Math.max(0, 1 - p.y / 120),
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Model Arena</h2>
          {!allComplete && models.length > 0 && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
          {allComplete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1"
            >
              <Crown className="w-3 h-3" />
              Champion: {champion}
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Six models competing simultaneously — may the best algorithm win
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Model Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {models.map((model) => {
            const IconComp = iconMap[model.icon] || Zap
            const isChampion = champion === model.name
            const isComplete = model.status === 'complete'

            return (
              <motion.div
                key={model.name}
                layout
                className={`relative bg-white rounded-xl border-2 p-4 transition-all ${isChampion
                    ? 'border-amber-400 shadow-lg shadow-amber-100'
                    : isComplete
                      ? 'border-green-200'
                      : 'border-gray-200'
                  }`}
              >
                {/* Champion badge */}
                {isChampion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 8, delay: 0.2 }}
                    className="absolute -top-3 -right-3 bg-amber-400 text-white rounded-full p-1.5 shadow-lg"
                  >
                    <Crown className="w-4 h-4" />
                  </motion.div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${model.color}15` }}
                  >
                    <IconComp
                      className="w-5 h-5"
                      style={{ color: model.color } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{model.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {model.status === 'complete'
                        ? 'Trained'
                        : model.status === 'training'
                          ? 'Training...'
                          : 'Waiting'}
                    </div>
                  </div>
                </div>

                {/* Progress ring */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <ProgressRing progress={model.progress} color={model.color} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">
                        {Math.round(model.progress)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics preview */}
                {model.metrics && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 gap-1 text-center"
                  >
                    <div className="bg-gray-50 rounded px-2 py-1">
                      <div className="text-[10px] text-gray-400">Accuracy</div>
                      <div className="text-xs font-bold text-gray-700">
                        {(model.metrics.accuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded px-2 py-1">
                      <div className="text-[10px] text-gray-400">AUC</div>
                      <div className="text-xs font-bold text-gray-700">
                        {model.metrics.auc.toFixed(3)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Live Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-dark rounded-xl p-5"
          >
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Live Leaderboard
              {!allComplete && (
                <span className="text-[10px] text-gray-500 animate-pulse ml-2">
                  updating as models finish...
                </span>
              )}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left pb-3 pl-2">Rank</th>
                    <th className="text-left pb-3">Model</th>
                    <th className="text-right pb-3">Accuracy</th>
                    <th className="text-right pb-3">Precision</th>
                    <th className="text-right pb-3">Recall</th>
                    <th className="text-right pb-3">F1</th>
                    <th className="text-right pb-3 pr-2">AUC</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {leaderboard.map((entry, i) => {
                      const isChamp = champion === entry.name
                      return (
                        <motion.tr
                          key={entry.name}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`border-t border-gray-700/50 ${isChamp ? 'bg-amber-500/10' : ''
                            }`}
                        >
                          <td className="py-2.5 pl-2">
                            <span
                              className={`text-xs font-bold ${i === 0
                                  ? 'text-amber-400'
                                  : i === 1
                                    ? 'text-gray-300'
                                    : i === 2
                                      ? 'text-orange-400'
                                      : 'text-gray-500'
                                }`}
                            >
                              #{i + 1}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-white font-medium text-xs">
                                {entry.name}
                              </span>
                              {isChamp && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="text-amber-400"
                                >
                                  <Crown className="w-3 h-3" />
                                </motion.span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 text-right text-gray-300 font-mono text-xs">
                            {(entry.metrics.accuracy * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 text-right text-gray-300 font-mono text-xs">
                            {(entry.metrics.precision * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 text-right text-gray-300 font-mono text-xs">
                            {(entry.metrics.recall * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 text-right text-gray-300 font-mono text-xs">
                            {entry.metrics.f1.toFixed(3)}
                          </td>
                          <td className="py-2.5 text-right pr-2 font-mono text-xs font-bold text-white">
                            {entry.metrics.auc.toFixed(3)}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Champion announcement */}
        {allComplete && champion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: 2, duration: 0.5 }}
            >
              <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            </motion.div>
            <h3 className="text-lg font-bold text-gray-900">
              {champion} is the Champion!
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Achieved the highest AUC score of{' '}
              <span className="font-bold text-amber-600">
                {leaderboard[0]?.metrics.auc.toFixed(3)}
              </span>{' '}
              across all evaluation metrics. Proceeding to detailed evaluation.
            </p>
          </motion.div>
        )}
      </div>

      <BottomActionBar
        onNext={allComplete ? handleNext : undefined}
        nextDisabled={!allComplete}
        nextLabel="Continue to Evaluation Hub"
      />
    </div>
  )
}
