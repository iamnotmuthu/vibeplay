import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, ArrowRight, ArrowLeft, CheckCircle2, Gauge } from 'lucide-react'
import type { BusinessObjective, DatasetConfig } from '@/store/types'

interface ObjectiveSelectorProps {
  dataset: DatasetConfig
  onSelect: (objective: BusinessObjective) => void
  onBack: () => void
  loading?: boolean
}

export function ObjectiveSelector({ dataset, onSelect, onBack, loading }: ObjectiveSelectorProps) {
  const [selected, setSelected] = useState<BusinessObjective | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="text-center max-w-3xl mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5"
        >
          <Target className="w-7 h-7 text-secondary" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What's your business objective?
        </h2>
        <p className="text-gray-500">
          Using <span className="font-semibold text-gray-700">{dataset.name}</span> —
          tell the AI what outcome you're optimizing for. This drives the entire analysis pipeline.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-3 mb-8">
        <AnimatePresence>
          {dataset.objectives.map((obj, i) => (
            <motion.button
              key={obj.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(obj)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                selected?.id === obj.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selected?.id === obj.id ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}
                >
                  {selected?.id === obj.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{obj.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{obj.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                      <Target className="w-3 h-3" />
                      Target: {obj.targetColumn}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                      <Gauge className="w-3 h-3" />
                      Metric: {obj.metric}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Dataset
        </button>
        <motion.button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          whileHover={selected ? { scale: 1.02 } : {}}
          whileTap={selected ? { scale: 0.98 } : {}}
        >
          {loading ? 'Initializing AI Engine...' : 'Start Autonomous Analysis'}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}
