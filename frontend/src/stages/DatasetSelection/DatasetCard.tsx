import { motion } from 'framer-motion'
import { Phone, Shield, TrendingUp, HeartPulse, Database } from 'lucide-react'
import type { DatasetConfig } from '@/store/types'

const iconMap: Record<string, React.ElementType> = {
  phone: Phone,
  shield: Shield,
  'trending-up': TrendingUp,
  'heart-pulse': HeartPulse,
}

interface DatasetCardProps {
  dataset: DatasetConfig
  onSelect: (dataset: DatasetConfig) => void
  index: number
}

export function DatasetCard({ dataset, onSelect, index }: DatasetCardProps) {
  const Icon = iconMap[dataset.icon] || Database

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(dataset)}
      className="bg-white rounded-xl border border-gray-200 p-6 text-left flex flex-col gap-4 hover:border-primary/40 transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${dataset.color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: dataset.color }} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-gray-100 text-gray-500">
          {dataset.domain}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-base mb-1.5 group-hover:text-primary transition-colors">
          {dataset.name}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {dataset.description}
        </p>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">
            {dataset.rows.toLocaleString()} rows
          </span>
        </div>
        <div className="text-xs text-gray-300">|</div>
        <span className="text-xs font-medium text-gray-500">
          {dataset.features} features
        </span>
        <div className="text-xs text-gray-300">|</div>
        <span className="text-xs font-medium capitalize px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
          {dataset.taskType}
        </span>
      </div>
    </motion.button>
  )
}
