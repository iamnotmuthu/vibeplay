import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

export interface BacktestPoint {
  date: string
  actual: number
  predicted: number
}

interface BacktestChartProps {
  data: BacktestPoint[]
  accentColor?: string
}

export function BacktestChart({ data, accentColor = '#3b82f6' }: BacktestChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-200">Backtesting — Actual vs Predicted</div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Walk-forward validation on held-out time slices
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded-full bg-gray-400 inline-block" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded-full inline-block" style={{ background: accentColor }} />
            Predicted
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
            width={45}
          />
          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 11,
              color: '#e5e7eb',
            }}
          />
          <Legend wrapperStyle={{ display: 'none' }} />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#9ca3af"
            strokeWidth={1.5}
            fill="url(#gradActual)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke={accentColor}
            strokeWidth={2}
            fill="url(#gradPredicted)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
