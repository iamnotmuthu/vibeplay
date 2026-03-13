import { motion } from 'framer-motion'
import { SOLUTION_TYPES } from '@/lib/solutionTypes'

interface SolutionTypeTabsProps {
  activeType: string
  onTypeChange: (typeId: string) => void
}

export function SolutionTypeTabs({ activeType, onTypeChange }: SolutionTypeTabsProps) {
  return (
    <div
      className="overflow-x-auto py-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      <div
        role="tablist"
        aria-label="AI Solution Types"
        className="flex gap-2 justify-center w-full"
      >
        {SOLUTION_TYPES.map((type, i) => {
          const Icon = type.icon
          const isActive = activeType === type.id
          const isComingSoon = type.status === 'coming-soon'

          return (
            <motion.button
              key={type.id}
              role="tab"
              aria-selected={isActive}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={!isActive ? { y: -1 } : undefined}
              onClick={() => onTypeChange(type.id)}
              className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all duration-150"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#ffffff',
                      boxShadow: '0 2px 12px rgba(59,130,246,0.3)',
                      border: '1px solid transparent',
                    }
                  : {
                      background: '#f3f4f6',
                      color: '#9ca3af',
                      border: '1px solid #e5e7eb',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.color = '#6b7280'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f3f4f6'
                  e.currentTarget.style.color = '#9ca3af'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                }
              }}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{type.label}</span>
              </div>
              {isComingSoon && type.id !== 'agentic' && (
                <span
                  className="text-[9px] uppercase tracking-widest leading-none"
                  style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}
                >
                  Coming Soon
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
