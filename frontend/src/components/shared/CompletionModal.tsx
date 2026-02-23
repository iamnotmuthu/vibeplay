import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CalendarCheck, Zap } from 'lucide-react'

interface CompletionModalProps {
  isOpen: boolean
  onStartOver: () => void
}

export function CompletionModal({ isOpen, onStartOver }: CompletionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Gradient top bar */}
            <div
              className="h-1.5 w-full"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)' }}
            />

            <div className="p-8 text-center">
              {/* Branded icon */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Your Model is Ready
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm leading-relaxed mb-8"
                style={{ color: '#9ca3af' }}
              >
                You've completed the full VibeModel AI pipeline — from raw data
                to a production-ready model. Ready to build your own?
              </motion.p>

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
                    boxShadow: '0 0 28px rgba(59,130,246,0.45), 0 2px 8px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(139,92,246,0.4)',
                  }}
                >
                  {/* Shimmer */}
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
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.82)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                  }}
                >
                  <Zap className="w-4 h-4" />
                  Join Beta Waitlist
                </motion.a>
              </motion.div>

              {/* Start over — subtle link */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                onClick={onStartOver}
                className="text-xs transition-colors"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#9ca3af' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#4b5563' }}
              >
                ← Start over with a new dataset
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
