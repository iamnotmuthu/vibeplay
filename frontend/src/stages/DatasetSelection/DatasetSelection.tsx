import { motion } from 'framer-motion'
import {
  Database,
  CheckCircle2,
  ArrowRight,
  Hash,
  Rows3,
  Tag,
  Info,
} from 'lucide-react'

import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import type { StageId } from '@/store/types'

const domainColorMap: Record<string, string> = {
  'telco-churn': '#3b82f6',
  'credit-fraud': '#ef4444',
  'store-demand': '#10b981',
  'patient-readmission': '#f59e0b',
  'employee-attrition': '#8b5cf6',
  'energy-consumption': '#06b6d4',
  'insurance-claims': '#ec4899',
}

const taskTypeLabel: Record<string, string> = {
  classification: 'Classification',
  regression: 'Regression',
  'time-series': 'Time Series',
}

export function DatasetSelection() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  if (!selectedDataset) return null

  const color = domainColorMap[selectedDataset.id] || '#3b82f6'

  const handleNext = () => {
    addLog(`Dataset confirmed: ${selectedDataset.name}`, 'success')
    completeStep(2)
    setStep(3 as StageId)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Dataset Confirmed</h2>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            Auto-selected
          </motion.span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Your dataset has been pre-loaded based on your selected industry. Review the details below.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col" style={{ background: '#fafafa' }}>
        <div className="w-full space-y-5">

          {/* Dataset card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${color}40`, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
          >
            {/* Coloured top bar */}
            <div className="h-1.5" style={{ background: `linear-gradient(to right, ${color}, ${color}80)` }} />

            <div className="bg-white p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedDataset.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-lg">{selectedDataset.description}</p>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full ml-4 shrink-0"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
                >
                  {taskTypeLabel[selectedDataset.taskType] || selectedDataset.taskType}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mt-5">
                {[
                  { icon: Rows3, label: 'Rows', value: selectedDataset.rows.toLocaleString() },
                  { icon: Hash, label: 'Features', value: selectedDataset.features.toString() },
                  { icon: Tag, label: 'Domain', value: selectedDataset.domain },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4 text-center"
                    style={{ background: `${color}08`, border: `1px solid ${color}20` }}
                  >
                    <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Demo disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl px-4 py-3 flex items-start gap-3"
            style={{
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed" style={{ color: '#78716c' }}>
              <span className="font-semibold" style={{ color: '#92400e' }}>Demo dataset.</span>{' '}
              This is a predefined sample dataset for demonstration purposes only. In production, VibeModel connects to your own data sources.
            </p>
          </motion.div>

          {/* Next step teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: `${color}08`, border: `1px solid ${color}20` }}
          >
            <ArrowRight className="w-4 h-4 shrink-0" style={{ color }} />
            <p className="text-sm text-gray-600">
              Next: <span className="font-semibold text-gray-900">Data Profiling</span> — VibeModel will analyse distributions, correlations, and outliers to assess data readiness.
            </p>
          </motion.div>
        </div>
      </div>

      <BottomActionBar
        onNext={handleNext}
        nextLabel="Continue to Data Profiling"
      />
    </div>
  )
}
