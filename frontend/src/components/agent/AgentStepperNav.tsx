import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_STAGE_ORDER, AGENT_STAGE_LABELS, AGENT_STAGE_NUMBERS } from '@/store/agentTypes'

/**
 * Horizontal stepper navigation for the Agent Playground.
 * Mirrors the main VibeModel StepperNav pattern — numbered circles,
 * stage labels, connector lines, and animated active/completed states
 * using the brand blue→purple gradient.
 */
export function AgentStepperNav() {
  const currentStage = useAgentPlaygroundStore((s) => s.currentStage)
  const completedStages = useAgentPlaygroundStore((s) => s.completedStages)
  const setStage = useAgentPlaygroundStore((s) => s.setStage)

  // Don't show on tile selection screen
  if (currentStage === 'tiles') return null

  const currentIdx = AGENT_STAGE_ORDER.indexOf(currentStage)

  return (
    <nav
      className="px-8 py-5 shrink-0 overflow-x-auto"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      }}
      aria-label="Agent stage progress"
    >
      <div className="flex items-center justify-between w-full min-w-[860px]">
        {AGENT_STAGE_ORDER.map((stage, index) => {
          const isCompleted = completedStages.has(stage)
          const isCurrent = stage === currentStage
          const isClickable = isCompleted || isCurrent || index <= currentIdx
          const stageNum = AGENT_STAGE_NUMBERS[stage]

          return (
            <div key={stage} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && setStage(stage)}
                className="flex items-center gap-3.5 group"
                style={{
                  cursor: isClickable ? 'pointer' : 'default',
                  opacity: isClickable ? 1 : 0.45,
                }}
                aria-label={`${AGENT_STAGE_LABELS[stage]}${isCurrent ? ' (current)' : isCompleted ? ' (completed)' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Step circle */}
                <motion.div
                  className="relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  animate={isCurrent ? { scale: [1, 1.07, 1] } : {}}
                  transition={
                    isCurrent
                      ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
                      : {}
                  }
                  style={
                    isCompleted
                      ? {
                          background: 'rgba(139,92,246,0.08)',
                          border: '2px solid rgba(139,92,246,0.5)',
                          color: '#7c3aed',
                          boxShadow: '0 0 10px rgba(139,92,246,0.15)',
                        }
                      : isCurrent
                        ? {
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            border: '2px solid transparent',
                            color: '#fff',
                            boxShadow: '0 0 18px rgba(59,130,246,0.4)',
                          }
                        : {
                            background: '#f3f4f6',
                            border: '2px solid #e5e7eb',
                            color: '#d1d5db',
                          }
                  }
                >
                  {isCompleted ? (
                    <Check className="w-4.5 h-4.5" strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    stageNum
                  )}

                  {/* Active glow ring */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid rgba(99,102,241,0.4)' }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        ease: 'easeInOut',
                      }}
                      aria-hidden="true"
                    />
                  )}
                </motion.div>

                {/* Label */}
                <div className="hidden sm:flex flex-col items-start">
                  <span
                    className="text-sm font-bold whitespace-nowrap leading-tight tracking-tight"
                    style={
                      isCurrent
                        ? { color: '#1e293b' }
                        : isCompleted
                          ? { color: '#7c3aed' }
                          : { color: '#9ca3af' }
                    }
                  >
                    {AGENT_STAGE_LABELS[stage]}
                  </span>
                  {isCurrent && (
                    <span
                      className="text-[11px] font-semibold mt-0.5"
                      style={{ color: '#6366f1' }}
                    >
                      In progress
                    </span>
                  )}
                  {isCompleted && (
                    <span
                      className="text-[11px] font-semibold mt-0.5"
                      style={{ color: '#8b5cf6' }}
                    >
                      Complete
                    </span>
                  )}
                </div>
              </button>

              {/* Connector line */}
              {index < AGENT_STAGE_ORDER.length - 1 && (
                <div
                  className="flex-1 mx-4 relative h-[3px] rounded-full overflow-hidden"
                  style={{ background: '#e5e7eb' }}
                  aria-hidden="true"
                >
                  {isCompleted && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      }}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
