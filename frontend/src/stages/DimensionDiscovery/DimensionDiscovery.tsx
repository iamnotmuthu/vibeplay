import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Loader2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { InsightCard } from '@/components/shared/InsightCard'
import { getPrecomputedDimensions } from './dimensionData'
import type { StageId, DimensionResults } from '@/store/types'

export function DimensionDiscovery() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const setDimensionResults = usePlaygroundStore((s) => s.setDimensionResults)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [data, setData] = useState<DimensionResults | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const [complete, setComplete] = useState(false)
  const [expandedDim, setExpandedDim] = useState<string | null>(null)
  const [categoricalToggles, setCategoricalToggles] = useState<Record<string, Record<string, boolean>>>({})

  const runDiscovery = useCallback(async () => {
    if (!selectedDataset) return
    const results = getPrecomputedDimensions(selectedDataset.id)
    setData(results)

    // Initialise categorical toggle state
    const toggleState: Record<string, Record<string, boolean>> = {}
    for (const dim of results.dimensions) {
      toggleState[dim.name] = {}
      for (const attr of dim.categoricalToggles) {
        toggleState[dim.name][attr] = false
      }
    }
    setCategoricalToggles(toggleState)

    addLog('Scanning attributes for meaningful dimensions...', 'info')
    await new Promise((r) => setTimeout(r, 1200))

    for (let i = 0; i < results.dimensions.length; i++) {
      setRevealedCount(i + 1)
      addLog(`Discovered dimension: "${results.dimensions[i].name}" (${results.dimensions[i].attributes.length} attributes)`, 'success')
      await new Promise((r) => setTimeout(r, 700))
    }

    setDimensionResults(results)
    setComplete(true)
    addLog(`Dimension discovery complete — ${results.dimensions.length} dimensions mapped`, 'success')
    setExpandedDim(results.dimensions[0]?.name ?? null)
  }, [selectedDataset, addLog, setDimensionResults])

  useEffect(() => {
    runDiscovery()
  }, [runDiscovery])

  const handleToggle = (dimName: string, attr: string) => {
    setCategoricalToggles((prev) => ({
      ...prev,
      [dimName]: {
        ...prev[dimName],
        [attr]: !prev[dimName]?.[attr],
      },
    }))
  }

  const handleNext = () => {
    completeStep(4)
    setStep(5 as StageId)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Dimension Discovery</h2>
          {!complete && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {complete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium"
            >
              {data?.dimensions.length} dimensions mapped
            </motion.span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          AI is grouping raw attributes into meaningful dimensions that reflect real-world concepts.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Dimension accordion cards */}
        <AnimatePresence>
          {data?.dimensions.slice(0, revealedCount).map((dim, i) => {
            const isExpanded = expandedDim === dim.name
            return (
              <motion.div
                key={dim.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: `${dim.color}40` }}
              >
                {/* Dimension header */}
                <button
                  onClick={() => setExpandedDim(isExpanded ? null : dim.name)}
                  className="w-full bg-white px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  {/* Color dot */}
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: dim.color }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{dim.name}</span>
                      <span className="text-xs text-gray-400">{dim.attributes.length} attributes</span>
                    </div>
                    {/* Confidence bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dim.confidence}%` }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: dim.color }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 font-mono">{dim.confidence}% confidence</span>
                      <span className="text-[11px] text-gray-400">·</span>
                      <span className="text-[11px] text-gray-500 font-mono">{dim.coverage}% coverage</span>
                    </div>
                  </div>

                  <div className="text-gray-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 px-5 py-4 border-t" style={{ borderColor: `${dim.color}20` }}>
                        <div className="flex flex-wrap gap-2">
                          {dim.attributes.map((attr) => {
                            const canToggle = dim.categoricalToggles.includes(attr)
                            const isCategorical = canToggle && categoricalToggles[dim.name]?.[attr]
                            return (
                              <div
                                key={attr}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono"
                                style={{
                                  background: isCategorical ? `${dim.color}20` : 'transparent',
                                  border: `1px solid ${isCategorical ? dim.color : '#d1d5db'}`,
                                  color: isCategorical ? dim.color : undefined,
                                }}
                              >
                                <span className={isCategorical ? '' : 'text-gray-700'}>{attr}</span>
                                {canToggle && (
                                  <button
                                    onClick={() => handleToggle(dim.name, attr)}
                                    className="ml-1 transition-colors"
                                    style={{ color: dim.color }}
                                    title={isCategorical ? 'Switch to numerical' : 'Treat as categorical'}
                                  >
                                    {isCategorical
                                      ? <ToggleRight className="w-3.5 h-3.5" />
                                      : <ToggleLeft className="w-3.5 h-3.5 text-gray-400" />}
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {dim.categoricalToggles.length > 0 && (
                          <p className="text-[11px] text-gray-400 mt-3">
                            Toggle icon on numerical attributes to treat them as categorical.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Scanning placeholder */}
        {!complete && data && revealedCount < data.dimensions.length && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center gap-3 px-5 py-4 rounded-xl border border-dashed border-gray-300 text-sm text-gray-400"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning remaining attributes...
          </motion.div>
        )}

        {/* AI Insights */}
        {complete && data?.insights.map((insight, i) => (
          <InsightCard key={insight.id} insight={insight} delay={i * 400} />
        ))}
      </div>

      <BottomActionBar
        onNext={complete ? handleNext : undefined}
        nextDisabled={!complete}
        nextLabel="Continue to Pattern Recognition"
      />
    </div>
  )
}
