import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { getStageExplainer } from '@/lib/glossaryData'
import { usePlaygroundStore } from '@/store/playgroundStore'

export function StageExplainer({ stageId }: { stageId: number }) {
  const viewMode = usePlaygroundStore((s) => s.viewMode)
  const setViewMode = usePlaygroundStore((s) => s.setViewMode)
  // Business View: always expanded; Technical View: starts collapsed
  const [expanded, setExpanded] = useState(viewMode === 'business')
  const explainer = getStageExplainer(stageId)

  if (!explainer) return null

  const isBusiness = viewMode === 'business'

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
      <button
        onClick={() => { if (!isBusiness) setExpanded((v) => !v) }}
        className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${isBusiness ? 'cursor-default' : 'hover:bg-blue-100'}`}
      >
        <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-sm font-semibold text-blue-700 flex-1">{explainer.headline}</span>
        {!isBusiness && (
          expanded
            ? <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-blue-400 shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {(isBusiness || expanded) && (
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
              {isBusiness && (
                <button
                  onClick={() => setViewMode('technical')}
                  className="text-[11px] font-semibold text-blue-500 hover:text-blue-700 transition-colors underline underline-offset-2"
                >
                  Switch to Technical View →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
