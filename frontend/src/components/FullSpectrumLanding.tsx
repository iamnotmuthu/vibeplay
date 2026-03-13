import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Sparkles } from 'lucide-react'
import { DomainSelector } from '@/components/DomainSelector'
import { SolutionTypeTabs } from '@/components/SolutionTypeTabs'
import { SolutionTypePreview } from '@/components/SolutionTypePreview'
import { GuidedEntryWizard } from '@/components/GuidedEntryWizard'
import { InterestVoteBar } from '@/components/InterestVoteBar'
import { AgentPlaygroundShell } from '@/components/agent/AgentPlaygroundShell'
import { SOLUTION_TYPES } from '@/lib/solutionTypes'

interface FullSpectrumLandingProps {
  onSelect: (domainId: string | null) => void
}

const AMBIENT_COLORS: Record<string, string> = {
  predictive: 'rgba(59,130,246',
  agentic: 'rgba(245,158,11',
  prescriptive: 'rgba(16,185,129',
  generative: 'rgba(139,92,246',
}

export function FullSpectrumLanding({ onSelect }: FullSpectrumLandingProps) {
  const [activeSolutionType, setActiveSolutionType] = useState('predictive')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [activeAgentDemo, setActiveAgentDemo] = useState(false)

  const ambientColor = AMBIENT_COLORS[activeSolutionType] ?? AMBIENT_COLORS.predictive

  const activeSolutionData = SOLUTION_TYPES.find((t) => t.id === activeSolutionType)

  // Show Agent Playground shell
  if (activeAgentDemo) {
    return <AgentPlaygroundShell onBack={() => setActiveAgentDemo(false)} />
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#fafafa', color: '#1e293b' }}
    >
      {/* Ambient glow — shifts color with active tab */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 40% at 50% -10%, ${ambientColor},0.8) 0%, ${ambientColor},0.4) 40%, transparent 70%)`,
          opacity: 0.07,
          transition: 'background 0.6s ease',
        }}
      />

      {/* Header */}
      <header
        className="h-20 border-b px-6 flex items-center justify-between shrink-0 z-50 sticky top-0"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderColor: '#e5e7eb',
        }}
      >
        <div className="flex items-center gap-3">
          <a
            href="/playground"
            className="flex items-center hover:opacity-80 transition-opacity"
            aria-label="VibeModel playground home"
          >
            <img
              src={`${import.meta.env.BASE_URL}VM_Logo_Full Color.png`}
              alt="VibeModel"
              style={{ height: 48, width: 'auto' }}
            />
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://vibemodel.ai/#beta-signup"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ border: '1px solid #e5e7eb', color: '#374151' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.color = '#111827'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.color = '#374151'
            }}
          >
            Beta Waitlist
          </a>
          <motion.a
            href="https://vibemodel.ai/book-demo.html"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 1px 4px rgba(59,130,246,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(59,130,246,0.3)'
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            />
            <span className="relative z-10">Book a Demo</span>
            <ExternalLink className="w-3.5 h-3.5 relative z-10" />
          </motion.a>
        </div>
      </header>

      {/* Hero */}
      <motion.div
        className="text-center pt-20 pb-8 px-6 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)',
            color: '#475569',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span
            style={{
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            From Pattern Discovery to Prescriptive Intelligence
          </span>
        </div>

        <h1
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight"
          style={{ color: '#0f172a' }}
        >
          Describe a business problem.
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Watch AI solve it.
          </span>
        </h1>
        <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
          VibeModel turns your raw data into production-ready AI — cutting months of development down to
          minutes so your team ships results, not prototypes. Pick a scenario below to see it in action.
        </p>

        <motion.div
          className="flex items-center justify-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: '#3b82f6' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#2563eb' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#3b82f6' }}
          >
            Not sure which scenario fits you?
            <span className="font-semibold">Help me choose →</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Guided Entry Wizard */}
      <GuidedEntryWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSelectScenario={onSelect}
      />

      {/* Solution Type Tabs */}
      <div className="px-6 pb-8 relative z-10">
        <SolutionTypeTabs
          activeType={activeSolutionType}
          onTypeChange={(typeId) => {
            if (typeId === 'agentic') {
              setActiveAgentDemo(true)
            } else {
              setActiveSolutionType(typeId)
            }
          }}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {activeSolutionType === 'predictive' ? (
            <motion.div
              key="predictive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Section header */}
              <div className="text-center mb-6 px-6">
                <h2 className="text-xl font-bold text-gray-900">Choose an Industry Scenario</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Each scenario demonstrates autonomous pattern discovery, model composition, and validation on
                  real-world data.
                </p>
              </div>
              {/* Embedded DomainSelector — no header / hero / footer */}
              <DomainSelector onSelect={onSelect} embedded />
            </motion.div>
          ) : (
            <motion.div
              key={activeSolutionType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeSolutionData && activeSolutionData.status === 'coming-soon' && (
                <SolutionTypePreview
                  solutionType={activeSolutionData}
                  onBackToPredictive={() => setActiveSolutionType('predictive')}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interest Vote Bar */}
      <InterestVoteBar />

      {/* Footer */}
      <footer
        className="border-t px-6 py-6"
        style={{ background: '#ffffff', borderColor: '#e5e7eb' }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© 2026 VibeModel.ai</p>
          <div className="flex items-center gap-6">
            <a
              href="https://vibemodel.ai/#beta-signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-blue-500 font-medium transition-colors"
            >
              Sign up for Beta Waitlist →
            </a>
            <a
              href="mailto:hello@vibemodel.ai"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              hello@vibemodel.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
