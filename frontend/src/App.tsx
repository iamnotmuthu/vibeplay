import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
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
  return (
    <header
      className="h-14 px-6 flex items-center justify-between shrink-0 z-50"
      style={{
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
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

      <div className="flex items-center gap-3">
        <a
          href="https://vibemodel.ai/#beta-signup"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
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
            boxShadow: '0 0 14px rgba(59,130,246,0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 22px rgba(59,130,246,0.5)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 14px rgba(59,130,246,0.3)' }}
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

  // Always dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

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
        className="h-screen flex flex-col overflow-hidden bg-surface dark"
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
