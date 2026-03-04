import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { getStageExplainer } from '@/lib/glossaryData'

export function StageExplainer({ stageId }: { stageId: number }) {
  const [expanded, setExpanded] = useState(true)
  const explainer = getStageExplainer(stageId)

  if (!explainer) return null

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-blue-100 transition-colors"
      >
        <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-sm font-semibold text-blue-700 flex-1">{explainer.headline}</span>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-blue-400 shrink-0" />
        }
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid #bfdbfe' }}>
              <p className="text-sm text-blue-800 leading-relaxed pt-3">{explainer.businessExplanation}</p>
              <p className="text-xs text-blue-600 italic leading-relaxed">{explainer.analogy}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
