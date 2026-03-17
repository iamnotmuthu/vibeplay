import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Zap, TrendingUp, Shield } from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { getSyntheticTestDataV3 } from '@/lib/agent/syntheticTestDataV3'
import { getEvaluationMetricsV3 } from '@/lib/agent/evaluationMetricsDataV3'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { resolveV3TileId, isV3SupportedTile } from '@/lib/agent/v3TileResolver'
import type { SyntheticTestV3 } from '@/lib/agent/syntheticTestDataV3'
import type { EvaluationMetricV3 } from '@/lib/agent/evaluationMetricsDataV3'

type DifficultyBadge = 'simple' | 'complex' | 'reasoning'
type TierColor = 'green' | 'amber' | 'red'

const DIFFICULTY_COLORS: Record<DifficultyBadge, { bg: string; text: string; border: string }> = {
  simple: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
  complex: { bg: '#fef2f2', text: '#7c2d12', border: '#fca5a5' },
  reasoning: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
}

const TIER_COLORS: Record<TierColor, { color: string; bg: string }> = {
  green: { color: '#16a34a', bg: '#f0fdf4' },
  amber: { color: '#d97706', bg: '#fffbeb' },
  red: { color: '#dc2626', bg: '#fef2f2' },
}

// ─── Test Query Card ────────────────────────────────────────────────────

function TestQueryCard({ test, index }: { test: SyntheticTestV3; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {test.query}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                background: DIFFICULTY_COLORS[test.difficulty].bg,
                color: DIFFICULTY_COLORS[test.difficulty].text,
                border: `1px solid ${DIFFICULTY_COLORS[test.difficulty].border}`,
              }}
            >
              {test.difficulty === 'simple' && 'Simple'}
              {test.difficulty === 'complex' && 'Complex'}
              {test.difficulty === 'reasoning' && 'Reasoning'}
            </span>
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                background: TIER_COLORS[test.tier].bg,
                color: TIER_COLORS[test.tier].color,
                border: `1px solid ${TIER_COLORS[test.tier].color}33`,
              }}
            >
              {test.tier === 'green' && '✓ Straightforward'}
              {test.tier === 'amber' && '◆ Complex'}
              {test.tier === 'red' && '! Risk'}
            </span>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 ml-3 mt-1 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 ml-3 mt-1 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50 space-y-2 text-xs">
              <div>
                <p className="text-gray-600 font-semibold mb-1">Pattern Tested:</p>
                <p className="text-gray-900 font-mono">{test.patternTested}</p>
              </div>

              <div>
                <p className="text-gray-600 font-semibold mb-1">Dimensions Crossed:</p>
                <div className="flex flex-wrap gap-1">
                  {test.dimensionsCrossed.map((dim) => (
                    <span
                      key={dim}
                      className="px-2 py-1 rounded bg-white border border-gray-300 text-gray-700"
                    >
                      {dim}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-gray-600 font-semibold mb-1">Expected Behavior:</p>
                <p className="text-gray-900">{test.expectedBehavior}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Test Data Section A ────────────────────────────────────────────────

function TestDataSection({
  totalTests,
  tests,
}: {
  totalTests: number
  tests: SyntheticTestV3[]
}) {
  const [expandAll, setExpandAll] = useState(false)

  // Show top 15 by default, favor reasoning & red tier
  const displayedTests = useMemo(() => {
    const sorted = [...tests].sort((a, b) => {
      const tierOrder = { red: 0, amber: 1, green: 2 }
      const tierCompare = tierOrder[a.tier] - tierOrder[b.tier]
      if (tierCompare !== 0) return tierCompare

      const diffOrder = { reasoning: 0, complex: 1, simple: 2 }
      return diffOrder[a.difficulty] - diffOrder[b.difficulty]
    })

    return expandAll ? sorted : sorted.slice(0, 15)
  }, [tests, expandAll])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Synthetic Test Data</h2>
        <p className="text-sm text-gray-600">
          We've created{' '}
          <span className="font-bold text-gray-900">
            <CountUpNumber end={totalTests} duration={1.5} />
          </span>{' '}
          total test scenarios
        </p>
      </div>

      <div className="space-y-4">
        {displayedTests.map((test) => (
          <TestQueryCard key={test.id} test={test} index={tests.indexOf(test)} />
        ))}
      </div>

      {tests.length > 15 && !expandAll && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setExpandAll(true)}
          className="w-full py-3 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-900"
        >
          Show all {tests.length} test scenarios
        </motion.button>
      )}

      {expandAll && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setExpandAll(false)}
          className="w-full py-3 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-900"
        >
          Show fewer
        </motion.button>
      )}
    </motion.div>
  )
}

// ─── Metric Card ────────────────────────────────────────────────────────

function MetricCard({ metric, index }: { metric: EvaluationMetricV3; index: number }) {
  const [expanded, setExpanded] = useState(false)

  const categoryIcons: Record<string, React.ReactNode> = {
    accuracy: <TrendingUp className="w-5 h-5" />,
    performance: <Zap className="w-5 h-5" />,
    reliability: <Shield className="w-5 h-5" />,
    business: <TrendingUp className="w-5 h-5" />,
  }

  const categoryColors: Record<string, string> = {
    accuracy: '#3b82f6',
    performance: '#f59e0b',
    reliability: '#10b981',
    business: '#8b5cf6',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${categoryColors[metric.category]}20`, color: categoryColors[metric.category] }}
          >
            {categoryIcons[metric.category]}
          </div>

          <div className="text-left">
            <p className="text-sm font-bold text-gray-900 mb-1">{metric.name}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900">
                {metric.targetValue}
              </span>
              <span className="text-sm text-gray-600">{metric.unit}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{metric.category}</p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-4 bg-gray-50 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-gray-900">{metric.description}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Measurement Method</p>
                <p className="text-sm text-gray-900">{metric.measurementMethod}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Evaluation Metrics Section B ────────────────────────────────────────

function EvaluationMetricsSection({ metrics }: { metrics: EvaluationMetricV3[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Evaluation Metrics</h2>
        <p className="text-sm text-gray-600">
          Define success with production-grade metrics and target values
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, i) => (
          <MetricCard key={metric.id} metric={metric} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── WOW Factor Text ────────────────────────────────────────────────────

function WowFactorText({ totalTests }: { totalTests: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6"
    >
      <p className="text-center text-sm font-semibold text-gray-900">
        If your agent passes these <span className="text-blue-600">{totalTests}</span> test scenarios, it handles every possible execution path.
        <br />
        <span className="text-blue-600 font-bold">That's production-ready.</span>
      </p>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export function TestDataPrepV3() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)

  // Get V3 data if tile is supported
  const testData = useMemo(() => {
    if (!activeTileId || !isV3SupportedTile(activeTileId)) return null

    const resolvedId = resolveV3TileId(activeTileId, 'syntheticTest')
    return getSyntheticTestDataV3(resolvedId)
  }, [activeTileId])

  const metricsData = useMemo(() => {
    if (!activeTileId || !isV3SupportedTile(activeTileId)) return null

    const resolvedId = resolveV3TileId(activeTileId, 'evaluationMetrics')
    return getEvaluationMetricsV3(resolvedId)
  }, [activeTileId])

  // Fallback for non-V3 tiles
  if (!testData || !metricsData) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600 text-sm">
          Test data and evaluation metrics not available for this tile in V3
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <TestDataSection totalTests={testData.totalTests} tests={testData.tests} />

      <div className="border-t border-gray-200 pt-8" />

      <EvaluationMetricsSection metrics={metricsData} />

      <WowFactorText totalTests={testData.totalTests} />
    </div>
  )
}

export default TestDataPrepV3
