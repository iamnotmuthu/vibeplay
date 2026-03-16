import { motion } from 'framer-motion'
import { SOLUTION_TYPES } from '@/lib/solutionTypes'

interface SolutionTypeTabsProps {
  activeType: string
  onTypeChange: (typeId: string) => void
  compact?: boolean
}

const TYPE_THEMES: Record<
  string,
  {
    gradient: string
    activeBg: string
    activeText: string
    activeShadow: string
    activeIconBg: string
    hoverBg: string
    hoverBorder: string
    hoverIconColor: string
    hoverText: string
    accentColor: string
    pillBg: string
    pillText: string
  }
> = {
  predictive: {
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 60%, #60a5fa 100%)',
    activeBg: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 60%, #60a5fa 100%)',
    activeText: '#ffffff',
    activeShadow: '0 8px 32px rgba(59,130,246,0.45), 0 0 0 1.5px rgba(96,165,250,0.4)',
    activeIconBg: 'rgba(255,255,255,0.2)',
    hoverBg: 'linear-gradient(135deg, rgba(219,234,254,0.7) 0%, rgba(239,246,255,0.9) 100%)',
    hoverBorder: 'rgba(59,130,246,0.4)',
    hoverIconColor: '#2563eb',
    hoverText: '#1d4ed8',
    accentColor: '#3b82f6',
    pillBg: 'rgba(59,130,246,0.1)',
    pillText: '#1d4ed8',
  },
  agentic: {
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 60%, #a78bfa 100%)',
    activeBg: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 60%, #a78bfa 100%)',
    activeText: '#ffffff',
    activeShadow: '0 8px 32px rgba(124,58,237,0.45), 0 0 0 1.5px rgba(167,139,250,0.4)',
    activeIconBg: 'rgba(255,255,255,0.2)',
    hoverBg: 'linear-gradient(135deg, rgba(237,233,254,0.7) 0%, rgba(245,243,255,0.9) 100%)',
    hoverBorder: 'rgba(124,58,237,0.4)',
    hoverIconColor: '#7c3aed',
    hoverText: '#5b21b6',
    accentColor: '#7c3aed',
    pillBg: 'rgba(124,58,237,0.1)',
    pillText: '#5b21b6',
  },
  prescriptive: {
    gradient: 'linear-gradient(135deg, #065f46 0%, #059669 60%, #34d399 100%)',
    activeBg: 'linear-gradient(135deg, #065f46 0%, #059669 60%, #34d399 100%)',
    activeText: '#ffffff',
    activeShadow: '0 8px 32px rgba(5,150,105,0.4), 0 0 0 1.5px rgba(52,211,153,0.4)',
    activeIconBg: 'rgba(255,255,255,0.2)',
    hoverBg: 'linear-gradient(135deg, rgba(209,250,229,0.7) 0%, rgba(240,253,244,0.9) 100%)',
    hoverBorder: 'rgba(5,150,105,0.4)',
    hoverIconColor: '#059669',
    hoverText: '#065f46',
    accentColor: '#059669',
    pillBg: 'rgba(5,150,105,0.1)',
    pillText: '#065f46',
  },
  generative: {
    gradient: 'linear-gradient(135deg, #92400e 0%, #d97706 60%, #fbbf24 100%)',
    activeBg: 'linear-gradient(135deg, #92400e 0%, #d97706 60%, #fbbf24 100%)',
    activeText: '#ffffff',
    activeShadow: '0 8px 32px rgba(217,119,6,0.4), 0 0 0 1.5px rgba(251,191,36,0.4)',
    activeIconBg: 'rgba(255,255,255,0.2)',
    hoverBg: 'linear-gradient(135deg, rgba(254,243,199,0.7) 0%, rgba(255,251,235,0.9) 100%)',
    hoverBorder: 'rgba(217,119,6,0.4)',
    hoverIconColor: '#d97706',
    hoverText: '#92400e',
    accentColor: '#d97706',
    pillBg: 'rgba(217,119,6,0.1)',
    pillText: '#92400e',
  },
}

export function SolutionTypeTabs({ activeType, onTypeChange, compact = false }: SolutionTypeTabsProps) {
  return (
    <div
      className={compact ? 'py-1' : 'overflow-x-auto py-3'}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      <div
        role="tablist"
        aria-label="AI Solution Types"
        className={`flex ${compact ? 'gap-2' : 'gap-3'} justify-center`}
      >
        {SOLUTION_TYPES.map((type, i) => {
          const Icon = type.icon
          const isActive = activeType === type.id
          const isComingSoon = type.status === 'coming-soon'
          const theme = TYPE_THEMES[type.id] ?? TYPE_THEMES.predictive

          return (
            <motion.button
              key={type.id}
              role="tab"
              aria-selected={isActive}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={!isComingSoon ? { y: -4, scale: 1.025 } : undefined}
              whileTap={!isComingSoon ? { scale: 0.97 } : undefined}
              onClick={() => !isComingSoon && onTypeChange(type.id)}
              className="relative overflow-hidden shrink-0"
              style={{
                borderRadius: compact ? 12 : 18,
                width: compact ? 'auto' : 148,
                padding: compact ? '6px 12px' : '18px 16px 16px',
                cursor: isComingSoon ? 'default' : 'pointer',
                outline: 'none',
                border: 'none',
                transition: 'box-shadow 0.3s ease, opacity 0.3s ease',
                opacity: isComingSoon && compact ? 0.5 : 1,
                ...(isActive
                  ? {
                      background: theme.activeBg,
                      boxShadow: theme.activeShadow,
                    }
                  : {
                      background: '#ffffff',
                      boxShadow: `0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.07)`,
                    }),
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isComingSoon) {
                  e.currentTarget.style.background = theme.hoverBg
                  e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.1), 0 0 0 1.5px ${theme.hoverBorder}`
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isComingSoon) {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.07)'
                }
              }}
            >
              {/* Active shimmer sweep */}
              {isActive && !compact && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.22) 50%, transparent 80%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['200% 0', '-100% 0'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                />
              )}

              <div className={`relative flex items-center ${compact ? 'flex-row gap-2' : 'flex-col gap-3'}`}>
                {/* Icon badge */}
                <div
                  className={`flex items-center justify-center ${compact ? 'rounded-lg' : 'rounded-2xl'}`}
                  style={{
                    width: compact ? 28 : 48,
                    height: compact ? 28 : 48,
                    background: isActive
                      ? theme.activeIconBg
                      : `linear-gradient(135deg, ${theme.pillBg} 0%, rgba(255,255,255,0) 100%)`,
                    border: isActive
                      ? '1.5px solid rgba(255,255,255,0.3)'
                      : `1.5px solid ${theme.hoverBorder}`,
                    transition: 'all 0.25s ease',
                    boxShadow: isActive
                      ? 'none'
                      : `0 2px 8px ${theme.pillBg}`,
                  }}
                >
                  <Icon
                    className={compact ? 'w-3.5 h-3.5' : 'w-5 h-5'}
                    style={{
                      color: isActive ? '#ffffff' : theme.accentColor,
                      transition: 'color 0.25s ease',
                    }}
                  />
                </div>

                {/* Text block */}
                <div className={`flex flex-col ${compact ? 'items-start' : 'items-center'} gap-1`}>
                  <span
                    className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-bold tracking-wide ${compact ? 'text-left' : 'text-center'} leading-tight`}
                    style={{
                      color: isActive ? '#ffffff' : '#374151',
                      transition: 'color 0.25s ease',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {type.label}
                  </span>

                  {isComingSoon && compact ? (
                    <span
                      className="text-[8px] uppercase tracking-widest font-bold px-1.5 py-px rounded-full leading-tight"
                      style={{
                        background: theme.pillBg,
                        color: theme.pillText,
                        letterSpacing: '0.08em',
                      }}
                    >
                      Soon
                    </span>
                  ) : isComingSoon && !compact ? (
                    <span
                      className="inline-block text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.2)' : theme.pillBg,
                        color: isActive ? 'rgba(255,255,255,0.85)' : theme.pillText,
                        letterSpacing: '0.1em',
                      }}
                    >
                      Coming Soon
                    </span>
                  ) : !compact ? (
                    /* Active indicator bar */
                    <motion.div
                      animate={{ width: isActive ? 32 : 0, opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{
                        height: 2.5,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.7)',
                        overflow: 'hidden',
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
