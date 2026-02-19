import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, CheckCircle2, AlertCircle, HelpCircle, Sparkles } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { InsightCard } from '@/components/shared/InsightCard'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedPatterns } from './patternData'
import type { StageId, PatternResults, SufficiencyPatternItem } from '@/store/types'

function PatternCard({
  pattern,
  status,
  delay,
}: {
  pattern: SufficiencyPatternItem
  status: 'sufficient' | 'insufficient' | 'helpMe'
  delay: number
}) {
  const isSufficient = status === 'sufficient'
  const isHelpMe = status === 'helpMe'

  const borderClass = isSufficient
    ? 'border-emerald-500/30 bg-emerald-500/5'
    : isHelpMe
      ? 'border-amber-500/30 bg-amber-500/5'
      : 'border-red-500/30 bg-red-500/5'

  const labelColor = isSufficient ? 'text-emerald-300' : isHelpMe ? 'text-amber-300' : 'text-red-300'
  const badgeColor = isSufficient
    ? 'text-emerald-400 bg-emerald-400/10'
    : isHelpMe
      ? 'text-amber-400 bg-amber-400/10'
      : 'text-red-400 bg-red-400/10'
  const countColor = isSufficient ? 'text-emerald-400' : isHelpMe ? 'text-amber-400' : 'text-red-400'
  const badgeLabel = isSufficient ? 'Sufficient' : isHelpMe ? 'Help Me' : 'Insufficient'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-xl border p-4 ${borderClass}`}
    >
      <div className="flex items-start gap-3">
        {isSufficient ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : isHelpMe ? (
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-sm font-semibold ${labelColor}`}>
              {pattern.label}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}>
              {badgeLabel}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-2 leading-relaxed">{pattern.description}</p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-gray-500">
              <CountUpNumber
                end={pattern.count}
                className={`${countColor} font-semibold`}
              />{' '}
              records
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pattern.keySignals.map((sig) => (
              <span
                key={sig}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
              >
                {sig}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function PatternDiscovery() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setPatternResults = usePlaygroundStore((s) => s.setPatternResults)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [data, setData] = useState<PatternResults | null>(null)
  const [phase, setPhase] = useState<'loading' | 'sufficient' | 'insufficient' | 'helpMe' | 'complete'>('loading')
  const [showInsights, setShowInsights] = useState(false)

  const runDiscovery = useCallback(async () => {
    if (!selectedDataset) return
    const results = getPrecomputedPatterns(selectedDataset.id)
    setData(results)

    addLog(`Analysing ${results.totalRecords.toLocaleString()} records for cohort data sufficiency...`, 'info')
    await new Promise((r) => setTimeout(r, 2000))

    setPhase('sufficient')
    addLog(`Found ${results.sufficient.length} patterns with sufficient training data`, 'success')
    await new Promise((r) => setTimeout(r, 1800))

    setPhase('insufficient')
    addLog(`Identified ${results.insufficient.length} patterns with insufficient data — flagged for augmentation`, 'warning')
    await new Promise((r) => setTimeout(r, 1500))

    if (results.helpMe.length > 0) {
      setPhase('helpMe')
      addLog(`Detected ${results.helpMe.length} ambiguous pattern${results.helpMe.length !== 1 ? 's' : ''} — help me cohorts need additional labelling`, 'info')
      await new Promise((r) => setTimeout(r, 1500))
    }

    setPhase('complete')
    setShowInsights(true)
    setPatternResults(results)
    addLog('Pattern recognition complete — sufficiency analysis ready', 'success')
  }, [selectedDataset, addLog, setPatternResults])

  useEffect(() => {
    runDiscovery()
  }, [runDiscovery])

  const handleNext = () => {
    completeStep(4)
    setStep(5 as StageId)
  }

  const totalSufficient = data?.sufficient.reduce((s, p) => s + p.count, 0) ?? 0
  const totalInsufficient = data?.insufficient.reduce((s, p) => s + p.count, 0) ?? 0
  const totalHelpMe = data?.helpMe.reduce((s, p) => s + p.count, 0) ?? 0
  const hasHelpMe = (data?.helpMe.length ?? 0) > 0
  const showHelpMe = phase === 'helpMe' || phase === 'complete'

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-100">Pattern Recognition</h2>
          {phase !== 'complete' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {phase === 'complete' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium"
            >
              Analysis Complete
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Assessing whether each discovered pattern has sufficient data to build a reliable model — or needs augmentation.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900">

        {/* Summary banner */}
        <AnimatePresence>
          {data && phase !== 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`grid gap-3 ${hasHelpMe ? 'grid-cols-4' : 'grid-cols-3'}`}
            >
              <div className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  <CountUpNumber end={data.totalRecords} />
                </div>
                <div className="text-xs text-gray-500 mt-1">Total Records</div>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  <CountUpNumber end={data.sufficient.length} />
                </div>
                <div className="text-xs text-gray-500 mt-1">Sufficient Patterns</div>
                <div className="text-xs text-emerald-400/70 font-mono mt-0.5">{totalSufficient.toLocaleString()} records</div>
              </div>
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  <CountUpNumber end={data.insufficient.length} />
                </div>
                <div className="text-xs text-gray-500 mt-1">Need Augmentation</div>
                <div className="text-xs text-red-400/70 font-mono mt-0.5">{totalInsufficient.toLocaleString()} records</div>
              </div>
              {hasHelpMe && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    <CountUpNumber end={data.helpMe.length} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Help Me Cohorts</div>
                  <div className="text-xs text-amber-400/70 font-mono mt-0.5">{totalHelpMe.toLocaleString()} records</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sufficient patterns */}
        <AnimatePresence>
          {data && phase !== 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-emerald-400">Identified Patterns — Sufficient Data</h3>
                <span className="text-xs text-gray-500">{data.sufficient.length} patterns</span>
              </div>
              <div className="space-y-3">
                {data.sufficient.map((pattern, i) => (
                  <PatternCard key={pattern.id} pattern={pattern} status="sufficient" delay={i * 0.1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insufficient patterns */}
        <AnimatePresence>
          {data && (phase === 'insufficient' || phase === 'helpMe' || phase === 'complete') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-red-400">Identified Patterns — Insufficient Data</h3>
                <span className="text-xs text-gray-500">{data.insufficient.length} patterns</span>
              </div>
              <div className="space-y-3">
                {data.insufficient.map((pattern, i) => (
                  <PatternCard key={pattern.id} pattern={pattern} status="insufficient" delay={i * 0.1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Me / Ambiguous patterns */}
        <AnimatePresence>
          {data && hasHelpMe && showHelpMe && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-400">Help Me Cohorts — Ambiguous / Confused</h3>
                <span className="text-xs text-gray-500">{data.helpMe.length} pattern{data.helpMe.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {data.helpMe.map((pattern, i) => (
                  <PatternCard key={pattern.id} pattern={pattern} status="helpMe" delay={i * 0.1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Augmentation callout */}
        <AnimatePresence>
          {data && phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-amber-300 mb-1">Data Augmentation Recommended</div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">
                    The following {data.insufficient.length} pattern{data.insufficient.length !== 1 ? 's' : ''} have insufficient training data
                    {hasHelpMe ? ` and ${data.helpMe.length} cohort${data.helpMe.length !== 1 ? 's' : ''} require additional labelling` : ''}.
                    Without augmentation, model confidence will be reduced for these cohorts:
                  </p>
                  <ul className="space-y-1.5">
                    {data.insufficient.map((p) => (
                      <li key={p.id} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                        <span>
                          <span className="font-semibold text-red-300">{p.label}</span>
                          {' — '}
                          {p.count.toLocaleString()} records. Augmentation will be applied in the Validation step.
                        </span>
                      </li>
                    ))}
                    {data.helpMe.map((p) => (
                      <li key={p.id} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <span>
                          <span className="font-semibold text-amber-300">{p.label}</span>
                          {' — '}
                          {p.count.toLocaleString()} records. Additional labelling or expert review recommended.
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading placeholder */}
        {phase === 'loading' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center gap-3 px-5 py-4 rounded-xl border border-dashed border-gray-700 text-sm text-gray-500"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning {selectedDataset?.rows.toLocaleString()} records for cohort patterns...
          </motion.div>
        )}

        {/* AI Insights */}
        {showInsights && data?.insights.map((insight, i) => (
          <InsightCard key={insight.id} insight={insight} delay={i * 400} />
        ))}
      </div>

      <BottomActionBar
        onNext={phase === 'complete' ? handleNext : undefined}
        nextDisabled={phase !== 'complete'}
        nextLabel="Continue to Validation Summary"
      />
    </div>
  )
}
