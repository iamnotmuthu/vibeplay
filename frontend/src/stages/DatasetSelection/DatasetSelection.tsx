import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { PREBUILT_DATASETS } from '@/lib/constants'
import { DatasetCard } from './DatasetCard'
import { DatasetPreview } from './DatasetPreview'
import { ObjectiveSelector } from './ObjectiveSelector'
import type { DatasetConfig, BusinessObjective, StageId } from '@/store/types'

type SubStep = 'browse' | 'objective'

export function DatasetSelection() {
  const [subStep, setSubStep] = useState<SubStep>('browse')
  const [previewDataset, setPreviewDataset] = useState<DatasetConfig | null>(null)
  const [chosenDataset, setChosenDataset] = useState<DatasetConfig | null>(null)
  const [loading, setLoading] = useState(false)

  const selectDataset = usePlaygroundStore((s) => s.selectDataset)
  const selectObjective = usePlaygroundStore((s) => s.selectObjective)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const addLog = usePlaygroundStore((s) => s.addLog)
  const setSessionId = usePlaygroundStore((s) => s.setSessionId)

  const handleDatasetConfirm = () => {
    if (!previewDataset) return
    setChosenDataset(previewDataset)
    setPreviewDataset(null)
    setSubStep('objective')
  }

  const handleObjectiveSelect = async (objective: BusinessObjective) => {
    if (!chosenDataset) return
    setLoading(true)

    // Simulate session creation
    await new Promise((r) => setTimeout(r, 1000))
    const sessionId = `session-${Date.now()}`

    setSessionId(sessionId)
    selectDataset(chosenDataset)
    selectObjective(objective)
    addLog(`Selected dataset: ${chosenDataset.name}`, 'action')
    addLog(`Business objective: ${objective.label}`, 'action')
    addLog(`Target: ${objective.targetColumn} | Metric: ${objective.metric}`, 'info')
    addLog(`Session initialized (${chosenDataset.rows.toLocaleString()} rows, ${chosenDataset.features} features)`, 'info')
    completeStep(1)
    setStep(2 as StageId)
    setLoading(false)
  }

  return (
    <AnimatePresence mode="wait">
      {subStep === 'browse' ? (
        <motion.div
          key="browse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -40 }}
          className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        >
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mb-10"
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Watch AI Analyze Your Data End-to-End
            </h1>
            <p className="text-gray-500 text-lg">
              Select a dataset below and experience the full autonomous ML lifecycle — from
              raw data to deployed model — in under 3 minutes.
            </p>
          </motion.div>

          {/* Dataset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl w-full">
            {PREBUILT_DATASETS.map((dataset, i) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                index={i}
                onSelect={setPreviewDataset}
              />
            ))}
          </div>

          {/* Preview Modal */}
          <DatasetPreview
            dataset={previewDataset}
            onClose={() => setPreviewDataset(null)}
            onStart={handleDatasetConfirm}
          />
        </motion.div>
      ) : chosenDataset ? (
        <ObjectiveSelector
          key="objective"
          dataset={chosenDataset}
          onSelect={handleObjectiveSelect}
          onBack={() => {
            setChosenDataset(null)
            setSubStep('browse')
          }}
          loading={loading}
        />
      ) : null}
    </AnimatePresence>
  )
}
