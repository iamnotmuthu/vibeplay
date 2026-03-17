import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { getPatternDataV3 } from '@/lib/agent/patternDataV3'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { resolveV3TileId, isV3SupportedTile } from '@/lib/agent/v3TileResolver'
import { PATTERN_TYPE_LABELS, DIMENSION_COLORS } from '@/store/agentTypes'

type AnimPhase = 'counter' | 'explosion' | 'summary' | 'heatmap' | 'complete'

const animatedTileIds = new Set<string>()

// ─── Counter Hero ────────────────────────────────────────────────────────

function CounterHeroV3({
  totalPatterns,
  onComplete,
}: {
  totalPatterns: number
  onComplete: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0f172a' }}
    >
      <div className="px-8 py-12 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs text-gray-500 mb-6 uppercase tracking-widest"
        >
          All Possible Execution Paths
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="text-7xl font-black text-white mb-3 font-mono tabular-nums">
            <CountUpNumber end={totalPatterns} duration={2} />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.4 }}
            className="text-gray-400 text-sm"
          >
            unique execution paths
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.4 }}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)' }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-semibold">
            All patterns identified
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Contextualized Summary ──────────────────────────────────────────────

function SummaryBreakdown({
  data,
}: {
  data: {
    totalPatterns: number
    reasoningChainCount: number
    crossSourceMismatchCount: number
    highRiskScenarioCount: number
  }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="rounded-xl border border-gray-200 bg-white p-6 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{data.reasoningChainCount} involve reasoning chains</span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Amber
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{data.crossSourceMismatchCount} involve cross-source data mismatches</span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Amber
        </span>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-sm font-semibold text-red-900">
          {data.highRiskScenarioCount} are high-risk scenarios that would fail in 90% of production agents
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          Critical
        </span>
      </div>
    </motion.div>
  )
}

// ─── High-Risk Scenarios Expandable ──────────────────────────────────────

function HighRiskScenariosSection({
  scenarios,
}: {
  scenarios: {
    description: string
    patternsCount: number
    dimensionsCrossed: string[]
  }[]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="font-semibold text-gray-900">
            See the {scenarios.length} high-risk scenarios
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {scenarios.map((scenario, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    {scenario.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{scenario.patternsCount} patterns</span>
                    <span>{scenario.dimensionsCrossed.length} dimensions crossed</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Matrix Heatmap ─────────────────────────────────────────────────────

function PatternMatrixHeatmap({
  tierBreakdown,
}: {
  tierBreakdown: {
    simple: number
    complex: number
    reasoning: number
  }
}) {
  const tiers: Array<{ name: string; count: number; color: string; bg: string }> = [
    { name: 'Simple', count: tierBreakdown.simple, color: '#16a34a', bg: '#f0fdf4' },
    { name: 'Complex', count: tierBreakdown.complex, color: '#dc2626', bg: '#fef2f2' },
    { name: 'Reasoning', count: tierBreakdown.reasoning, color: '#d97706', bg: '#fffbeb' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-6">Pattern Complexity Breakdown</h3>

      <div className="space-y-2">
        {tiers.map((tier, i) => {
          const percentage = Math.round((tier.count / (tierBreakdown.simple + tierBreakdown.complex + tierBreakdown.reasoning)) * 100)

          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{tier.name}</span>
                <span className="text-sm font-semibold text-gray-900">{tier.count} patterns ({percentage}%)</span>
              </div>

              <motion.div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: '#e5e7eb' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className="h-full"
                  style={{ background: tier.color }}
                />
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export function InteractionDiscoveryV3() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const [phase, setPhase] = useState<AnimPhase>('counter')

  // Get V3 data if tile is supported
  const v3Data = useMemo(() => {
    if (!activeTileId || !isV3SupportedTile(activeTileId)) return null

    const resolvedId = resolveV3TileId(activeTileId, 'patternData')
    return getPatternDataV3(resolvedId)
  }, [activeTileId])

  // Skip animation if already seen
  useEffect(() => {
    if (activeTileId && animatedTileIds.has(activeTileId)) {
      setPhase('complete')
    }
  }, [activeTileId])

  const handleCounterComplete = useCallback(() => {
    setPhase('explosion')
    setTimeout(() => {
      setPhase('summary')
      if (activeTileId) {
        animatedTileIds.add(activeTileId)
      }
    }, 500)
  }, [activeTileId])

  // Fallback to non-V3 behavior
  if (!v3Data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600 text-sm">
          Pattern discovery data not available for this tile in V3
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {phase === 'counter' && (
          <CounterHeroV3
            key="counter"
            totalPatterns={v3Data.totalPatterns}
            onComplete={handleCounterComplete}
          />
        )}

        {(phase === 'summary' || phase === 'complete') && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <SummaryBreakdown
              data={{
                totalPatterns: v3Data.totalPatterns,
                reasoningChainCount: v3Data.reasoningChainCount,
                crossSourceMismatchCount: v3Data.crossSourceMismatchCount,
                highRiskScenarioCount: v3Data.highRiskScenarioCount,
              }}
            />

            {v3Data.highRiskScenarios.length > 0 && (
              <HighRiskScenariosSection scenarios={v3Data.highRiskScenarios} />
            )}

            <PatternMatrixHeatmap tierBreakdown={v3Data.tierBreakdown} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InteractionDiscoveryV3
