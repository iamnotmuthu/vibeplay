import { motion } from 'framer-motion'
import { Calendar, Database, Layers, TrendingUp } from 'lucide-react'

export interface BacktestConfig {
  /** Human-readable label, e.g. "60-day rolling window" */
  windowLabel: string
  /** Total data points used in backtesting */
  totalDataPoints: number
  /** Number of validation slices / folds */
  validationSlices: number
  /** Granularity of the data */
  granularity: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly'
  /** Date range covered */
  dateRange: string
  /** Backtesting strategy used */
  strategy: string
  /** Gap between train and validation sets to prevent leakage */
  purgeGap?: string
}

interface BacktestSummaryProps {
  config: BacktestConfig
  accentColor?: string
}

export function BacktestSummary({ config, accentColor = '#3b82f6' }: BacktestSummaryProps) {
  const stats = [
    { icon: Database, label: 'Data Points', value: config.totalDataPoints.toLocaleString() },
    { icon: Layers, label: 'Validation Slices', value: String(config.validationSlices) },
    { icon: Calendar, label: 'Granularity', value: config.granularity },
    { icon: TrendingUp, label: 'Strategy', value: config.strategy },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-200">
            Backtesting Validation — {config.windowLabel}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Walk-forward validation criteria and data coverage
          </div>
        </div>
        <div
          className="px-2.5 py-1 rounded-md text-[10px] font-semibold"
          style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
        >
          {config.dateRange}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="rounded-lg border border-gray-700/40 bg-gray-800/40 p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <stat.icon className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-lg font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Purge gap note */}
      {config.purgeGap && (
        <div className="mt-3 text-[10px] text-gray-500 leading-relaxed">
          <span className="text-gray-400 font-medium">Purge gap:</span> {config.purgeGap} between training and validation sets to prevent data leakage.
        </div>
      )}
    </motion.div>
  )
}
