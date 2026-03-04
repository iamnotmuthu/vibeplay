import { motion } from 'framer-motion'
import { BarChart3, Code2 } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'

export function ViewModeToggle() {
  const viewMode = usePlaygroundStore((s) => s.viewMode)
  const setViewMode = usePlaygroundStore((s) => s.setViewMode)

  return (
    <div
      className="relative flex items-center rounded-full p-0.5 shrink-0"
      style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}
    >
      {(['business', 'technical'] as const).map((mode) => {
        const isActive = viewMode === mode
        return (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors z-10"
            style={{ color: isActive ? '#374151' : '#9ca3af' }}
          >
            {isActive && (
              <motion.div
                layoutId="view-mode-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {mode === 'business'
                ? <BarChart3 className="w-3 h-3" />
                : <Code2 className="w-3 h-3" />}
              <span className="hidden sm:inline">
                {mode === 'business' ? 'Business' : 'Technical'}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
