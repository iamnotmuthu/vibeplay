import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, LayoutGrid } from 'lucide-react'
import { StepperNav } from '@/components/layout/StepperNav'
import { DomainSelector } from '@/components/DomainSelector'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { DatasetSelection } from '@/stages/DatasetSelection/DatasetSelection'
import { BusinessSetup } from '@/stages/BusinessSetup/BusinessSetup'
import { AutoEDA } from '@/stages/AutoEDA/AutoEDA'
import { PatternDiscovery } from '@/stages/PatternDiscovery/PatternDiscovery'
import { ValidationSummary } from '@/stages/ValidationSummary/ValidationSummary'
import { ModelSelection } from '@/stages/ModelSelection/ModelSelection'

const stageComponents = {
  1: DatasetSelection,
  2: BusinessSetup,
  3: AutoEDA,
  4: PatternDiscovery,
  5: ValidationSummary,
  6: ModelSelection,
}

function BrandHeader() {
  const currentStep = usePlaygroundStore((s) => s.currentStep)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleBackToHome = () => {
    if (currentStep > 1) {
      setConfirmOpen(true)
    } else {
      usePlaygroundStore.getState().setShouldGoHome(true)
    }
  }

  return (
    <>
    <header
      className="h-14 px-6 flex items-center justify-between shrink-0 z-50"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center gap-3">
        <a
          href="https://vibemodel.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <img
            src={`${import.meta.env.BASE_URL}VM_Logo_Full Color.png`}
            alt="VibeModel"
            style={{ height: 36, width: 'auto' }}
          />
        </a>
        <button
          onClick={handleBackToHome}
          title="Back to scenario selection"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ color: '#6b7280', border: '1px solid #e5e7eb' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#111827'
            e.currentTarget.style.borderColor = '#9ca3af'
            e.currentTarget.style.background = '#f3f4f6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b7280'
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scenarios</span>
        </button>
      </div>

      {/* Demo mode pill */}
      <div
        className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#d97706' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Demo Mode · Simulated Data
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://vibemodel.ai/#beta-signup"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
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
          whileHover={{ y: -1, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-sm font-semibold relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 1px 4px rgba(59,130,246,0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(59,130,246,0.3)' }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
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

    {/* Confirmation dialog */}
    <AnimatePresence>
      {confirmOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={() => setConfirmOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-xl p-6"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900 mb-2">Switch Scenario?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Your current progress will be lost. Are you sure you want to go back to scenario selection?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false)
                  usePlaygroundStore.getState().setShouldGoHome(true)
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                Switch Scenario
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}

export default function App() {
  const [domainChosen, setDomainChosen] = useState(false)
  const currentStep = usePlaygroundStore((s) => s.currentStep)
  const reset = usePlaygroundStore((s) => s.reset)
  const shouldGoHome = usePlaygroundStore((s) => s.shouldGoHome)
  const StageComponent = stageComponents[currentStep]

  const handleDomainSelect = (_domainId: string | null) => {
    setDomainChosen(true)
  }

  // Navigate home when ModelSelection "Complete & Finish" is clicked
  useEffect(() => {
    if (shouldGoHome) {
      usePlaygroundStore.getState().setShouldGoHome(false)
      reset()
      setDomainChosen(false)
    }
  }, [shouldGoHome])

  if (!domainChosen) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="domain-selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DomainSelector onSelect={handleDomainSelect} />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="playground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="h-screen flex flex-col overflow-hidden bg-surface"
      >
        <BrandHeader />
        <StepperNav />

        <main className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 flex flex-col min-h-0"
            >
              <StageComponent />
            </motion.div>
          </AnimatePresence>
        </main>

      </motion.div>
    </AnimatePresence>
  )
}
