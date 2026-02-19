import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Info, ExternalLink, CalendarCheck } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { getPrecomputedModelSelection } from './modelSelectionData'
import type { ModelSelectionResults, CohortPerformance } from '@/store/types'

const CATEGORY_COLORS: Record<string, { pill: string; track: string }> = {
  sufficient:   { pill: 'bg-emerald-500', track: 'bg-emerald-500/20' },
  insufficient: { pill: 'bg-red-500',     track: 'bg-red-500/20'     },
  helpMe:       { pill: 'bg-amber-500',   track: 'bg-amber-500/20'   },
}

function MetricBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-16 shrink-0 text-right">{label}</span>
      <div className={`flex-1 h-2.5 rounded-full ${colorClass} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass.replace('/20', '')}`}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-gray-200 w-10 text-right">{value}%</span>
    </div>
  )
}

function PerformanceRow({ row }: { row: CohortPerformance }) {
  const colors = CATEGORY_COLORS[row.category]
  return (
    <div className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-4 space-y-2">
      <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
        row.category === 'sufficient' ? 'text-emerald-400' :
        row.category === 'insufficient' ? 'text-red-400' : 'text-amber-400'
      }`}>
        {row.label}
      </div>
      <MetricBar label="Recall" value={row.recall} colorClass={colors.track} />
      <MetricBar label="Precision" value={row.precision} colorClass={colors.track} />
    </div>
  )
}

function ComponentCard({ name, role, factors, delay }: {
  name: string; role: string; factors: { name: string; value: string }[]; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl bg-gray-900 border border-gray-700/60 p-4"
    >
      <div className="text-sm font-semibold text-primary mb-1">{name}</div>
      <p className="text-xs text-gray-400 mb-3 leading-relaxed">{role}</p>
      <div className="space-y-1.5">
        {factors.map((f) => (
          <div key={f.name} className="flex items-start gap-2 text-xs">
            <span className="text-gray-500 shrink-0 min-w-[110px]">{f.name}</span>
            <span className="text-gray-200 font-mono">{f.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function ModelSelection() {
  const selectedDataset    = usePlaygroundStore((s) => s.selectedDataset)
  const setModelSelectionResults = usePlaygroundStore((s) => s.setModelSelectionResults)
  const completeStep       = usePlaygroundStore((s) => s.completeStep)
  const setStep            = usePlaygroundStore((s) => s.setStep)
  const addLog             = usePlaygroundStore((s) => s.addLog)
  const setShouldGoHome    = usePlaygroundStore((s) => s.setShouldGoHome)

  const [data, setData] = useState<ModelSelectionResults | null>(null)

  useEffect(() => {
    if (!selectedDataset) return
    const results = getPrecomputedModelSelection(selectedDataset.id)
    setData(results)
    setModelSelectionResults(results)
    addLog(`Model selected: ${results.champion} (${results.modelType})`, 'success')
    addLog(`Performance — Sufficient recall: ${results.performance[0]?.recall}% · Precision: ${results.performance[0]?.precision}%`, 'info')
  }, [selectedDataset, setModelSelectionResults, addLog])

  const handleNext = () => {
    completeStep(6)
    addLog('Model Selection complete. Ready to deploy to production.', 'success')
    setShouldGoHome(true)
  }

  if (!data) return null

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-100">Model Selection &amp; Launch</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Your data profile has been matched to the optimal model architecture. Review the selected model and its components before launching.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900">

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-teal-500/30 bg-gray-800/60 p-5"
          style={{ borderLeft: '4px solid #14b8a6' }}
        >
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-teal-300 mb-1">A Model Built for Your Data</div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Based on your dataset characteristics, validation distribution, and business objective, our system has
                selected the best-fit model. The architecture below is pre-configured and ready to train on your
                validated cohorts.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Chosen model panel — always expanded, highlighted */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid rgba(59,130,246,0.35)',
            background: 'rgba(59,130,246,0.04)',
            boxShadow: '0 0 30px rgba(59,130,246,0.1)',
          }}
        >
          {/* Model name header — gradient accent bar */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{
              borderBottom: '1px solid rgba(59,130,246,0.2)',
              background: 'linear-gradient(90deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 100%)',
            }}
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chosen Model</span>
            <span className="px-3 py-1 rounded-full text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 12px rgba(59,130,246,0.4)',
              }}
            >
              {data.champion}
            </span>
            <span className="text-xs text-gray-500 ml-auto">{data.modelType}</span>
          </div>

          {/* Always-visible details */}
          <div className="px-5 py-5 space-y-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Model function */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Model Function</div>
              <p className="text-sm text-gray-300 leading-relaxed">{data.modelFunction}</p>
            </div>

            {/* Model components */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Model Components</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.components.map((comp, i) => (
                  <ComponentCard
                    key={comp.name}
                    name={comp.name}
                    role={comp.role}
                    factors={comp.factors}
                    delay={i * 0.07}
                  />
                ))}
              </div>
            </div>

            {/* Why this model */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Why this model?</div>
              <p className="text-sm text-gray-400 leading-relaxed">{data.whyThisModel}</p>
            </div>
          </div>

          {/* Performance metrics */}
          <div className="px-5 py-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Performance Metrics
            </div>
            <div className="space-y-3">
              {data.performance.map((row, i) => (
                <motion.div
                  key={row.category}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                >
                  <PerformanceRow row={row} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA section — Join Beta Waitlist + Book a Demo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-700/60 bg-gray-800/60 p-5"
        >
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Ready to deploy your model?
          </div>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            Your model architecture is selected and validated. Take the next step — join the VibeModel beta to deploy this model to production, or book a personalised demo with our team.
          </p>
          <div className="flex flex-wrap gap-3">
            {/* Primary CTA: Book a Demo — blue→purple gradient + shimmer */}
            <motion.a
              href="https://vibemodel.ai/book-demo.html"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 20px rgba(59,130,246,0.35)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.55), 0 4px 12px rgba(0,0,0,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(59,130,246,0.35)' }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              />
              <ExternalLink className="w-4 h-4 shrink-0 relative z-10" />
              <span className="relative z-10">Book a Demo</span>
            </motion.a>

            {/* Secondary CTA: Beta Waitlist — outlined */}
            <motion.a
              href="https://vibemodel.ai/#beta-signup"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              Join Beta Waitlist
            </motion.a>
          </div>
        </motion.div>
      </div>

      <BottomActionBar
        onNext={handleNext}
        nextLabel="Complete &amp; Finish"
        alwaysShowNext
      />
    </div>
  )
}
