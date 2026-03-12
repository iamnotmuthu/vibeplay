import { motion } from 'framer-motion'
import {
  TrendingUp,
  Sparkles,
  MessageSquare,
  Bot,
  Compass,
  FileText,
  Database,
  FileSearch,
  Headphones,
  BookOpen,
  ShoppingCart,
  Shield,
  Users,
  Truck,
} from 'lucide-react'
import type { SolutionType } from '@/lib/solutionTypes'
import { WaitlistForm } from '@/components/WaitlistForm'

const useCaseIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'file-text': FileText,
  database: Database,
  'file-search': FileSearch,
  headphones: Headphones,
  'book-open': BookOpen,
  'shopping-cart': ShoppingCart,
  shield: Shield,
  users: Users,
  truck: Truck,
  'trending-up': TrendingUp,
  sparkles: Sparkles,
  'message-square': MessageSquare,
  bot: Bot,
  compass: Compass,
}

interface SolutionTypePreviewProps {
  solutionType: SolutionType
  onBackToPredictive: () => void
  onLaunchDemo?: () => void
}

export function SolutionTypePreview({ solutionType, onBackToPredictive, onLaunchDemo }: SolutionTypePreviewProps) {
  const Icon = solutionType.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto py-16 px-6 text-center"
    >
      {/* Large icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{
          background: `linear-gradient(135deg, ${solutionType.color}, ${solutionType.color}80)`,
          boxShadow: `0 8px 24px ${solutionType.color}30`,
        }}
      >
        <Icon className="w-8 h-8" style={{ color: '#ffffff' }} />
      </div>

      {/* Label */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
        style={{
          background: `${solutionType.color}10`,
          border: `1px solid ${solutionType.color}25`,
          color: solutionType.color,
        }}
      >
        Coming Soon
      </div>

      {/* Value statement */}
      <p className="text-xl font-medium text-gray-700 max-w-xl mx-auto mt-2 mb-10 leading-relaxed">
        {solutionType.valueStatement}
      </p>

      {/* Use case cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {solutionType.useCases.map((useCase, i) => {
          const UCIcon = useCaseIconMap[useCase.icon] || Sparkles
          return (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
              className="text-left rounded-xl p-5"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center mb-3"
                style={{
                  background: `${solutionType.color}12`,
                  border: `1px solid ${solutionType.color}25`,
                }}
              >
                <UCIcon className="w-3.5 h-3.5" style={{ color: solutionType.color }} />
              </div>
              <h4 className="text-sm font-bold text-gray-900">{useCase.title}</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{useCase.description}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Interactive demo CTA — shown when a demo is available */}
      {solutionType.demoAvailable && onLaunchDemo && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLaunchDemo}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{
              background: `linear-gradient(135deg, ${solutionType.color}, ${solutionType.color}cc)`,
              boxShadow: `0 4px 16px ${solutionType.color}35`,
            }}
          >
            Try Interactive Demo →
          </motion.button>
          <p className="text-xs text-gray-400 mt-2">
            See how VibeModel composes production-ready agents — no sign-up needed.
          </p>
        </motion.div>
      )}

      {/* Waitlist form */}
      <WaitlistForm solutionType={solutionType} />

      {/* Back link */}
      <div className="mt-5">
        <button
          onClick={onBackToPredictive}
          className="text-sm text-gray-500 transition-colors hover:text-blue-500"
        >
          ← Explore Predictive AI scenarios
        </button>
      </div>
    </motion.div>
  )
}
