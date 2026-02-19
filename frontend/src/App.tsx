import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrandHeader } from '@/components/layout/BrandHeader'
import { StepperNav } from '@/components/layout/StepperNav'
import { SessionSidebar } from '@/components/layout/SessionSidebar'
import { DomainSelector } from '@/components/DomainSelector'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { useTheme } from '@/hooks/useTheme'
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

export default function App() {
  const [domainChosen, setDomainChosen] = useState(false)
  const currentStep = usePlaygroundStore((s) => s.currentStep)
  const reset = usePlaygroundStore((s) => s.reset)
  const shouldGoHome = usePlaygroundStore((s) => s.shouldGoHome)
  const { theme } = useTheme()
  const StageComponent = stageComponents[currentStep]

  const handleDomainSelect = (_domainId: string | null) => {
    setDomainChosen(true)
  }

  const handleChangeDomain = () => {
    reset()
    setDomainChosen(false)
  }

  const handleGoHome = () => {
    setDomainChosen(false)
  }

  // Navigate home when ModelSelection "Complete & Finish" is clicked
  useEffect(() => {
    if (shouldGoHome) {
      usePlaygroundStore.getState().setShouldGoHome(false)
      reset()
      setDomainChosen(false)
    }
  }, [shouldGoHome])

  // Sync theme on mount
  useEffect(() => {
    const savedTheme = usePlaygroundStore.getState().theme
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
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
        className={`h-screen flex flex-col overflow-hidden bg-surface ${theme}`}
      >
        <BrandHeader onChangeDomain={handleChangeDomain} onGoHome={handleGoHome} />
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

        <SessionSidebar />
      </motion.div>
    </AnimatePresence>
  )
}
