import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CalendarCheck, Zap, X, Bot, Layers, GitBranch } from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getArchitectureData } from '@/lib/agent/architectureData'

export function AgentCompletionModal() {
  const isOpen = useAgentPlaygroundStore((s) => s.completionModalOpen)
  const close = useAgentPlaygroundStore((s) => s.closeCompletionModal)
  const resetToTiles = useAgentPlaygroundStore((s) => s.resetToTiles)
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const archData = activeTileId ? getArchitectureData(activeTileId) : null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full max-w-md rounded-2xl overflow-hidden relative"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          >
            {/* Gradient top bar */}
            <div
              className="h-1.5 w-full"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)' }}
            />

            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{ background: '#f3f4f6', color: '#9ca3af' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb'
                e.currentTarget.style.color = '#6b7280'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6'
                e.currentTarget.style.color = '#9ca3af'
              }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 text-center">
              {/* Branded icon */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                <Bot className="w-8 h-8 text-white" />
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Your Agent is Ready
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm leading-relaxed mb-8"
                style={{ color: '#6b7280' }}
              >
                You've completed the full VibeModel Agent pipeline — from goal
                definition to production architecture. Ready to build your own?
              </motion.p>

              {/* Agent summary */}
              {tile && archData && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="rounded-xl p-4 mb-6 text-left"
                  style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}
                >
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    What was built
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Agent</span>
                      <span className="text-xs font-semibold text-gray-800">{tile.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Complexity</span>
                      <span className="text-xs font-semibold text-gray-800">{tile.complexityLabel}</span>
                    </div>
                    <div className="pt-2 mt-2 flex gap-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                      <div className="flex-1 rounded-lg p-2.5 text-center" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <Layers className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="text-base font-bold text-blue-700">{archData.totalComponents}</div>
                        <div className="text-[10px] text-blue-600 font-medium">Components</div>
                      </div>
                      <div className="flex-1 rounded-lg p-2.5 text-center" style={{ background: '#f5f3ff', border: '1px solid #ede9fe' }}>
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <GitBranch className="w-3 h-3 text-purple-600" />
                        </div>
                        <div className="text-base font-bold text-purple-700">{archData.totalInteractionPaths}</div>
                        <div className="text-[10px] text-purple-600 font-medium">Interaction Flows</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col gap-3 mb-7"
              >
                {/* Primary: Book a Demo */}
                <motion.a
                  href="https://vibemodel.ai/book-demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white text-sm relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    boxShadow: '0 2px 12px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(139,92,246,0.4)',
                  }}
                >
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  />
                  <CalendarCheck className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Book a Demo</span>
                </motion.a>

                {/* Secondary: Join Beta */}
                <motion.a
                  href="https://vibemodel.ai/#beta-signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors"
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    color: '#374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  <Zap className="w-4 h-4" />
                  Join Beta Waitlist
                </motion.a>
              </motion.div>

              {/* Start over */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                onClick={() => {
                  close()
                  resetToTiles()
                }}
                className="text-xs transition-colors cursor-pointer"
                style={{ color: '#9ca3af' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#6b7280' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af' }}
              >
                ← Start over with a new scenario
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
