import { AnimatePresence, motion } from 'framer-motion'
import { BrandHeader } from '@/components/layout/BrandHeader'
import { StepperNav } from '@/components/layout/StepperNav'
import { SessionSidebar } from '@/components/layout/SessionSidebar'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { DatasetSelection } from '@/stages/DatasetSelection/DatasetSelection'
import { AutoEDA } from '@/stages/AutoEDA/AutoEDA'
import { PatternDiscovery } from '@/stages/PatternDiscovery/PatternDiscovery'
import { FeatureIntelligence } from '@/stages/FeatureIntelligence/FeatureIntelligence'
import { ModelArena } from '@/stages/ModelArena/ModelArena'
import { EvaluationHub } from '@/stages/EvaluationHub/EvaluationHub'
import { DriftAndRetrain } from '@/stages/DriftAndRetrain/DriftAndRetrain'

const stageComponents = {
  1: DatasetSelection,
  2: AutoEDA,
  3: PatternDiscovery,
  4: FeatureIntelligence,
  5: ModelArena,
  6: EvaluationHub,
  7: DriftAndRetrain,
}

export default function App() {
  const currentStep = usePlaygroundStore((s) => s.currentStep)
  const StageComponent = stageComponents[currentStep]

  return (
    <div className="min-h-screen flex flex-col bg-surface">
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
            className="flex-1 flex flex-col"
          >
            <StageComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      <SessionSidebar />
    </div>
  )
}
