import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  TrendingUp,
  Shield,
  AlertTriangle,
  LayoutGrid,
  Database,
  FileText,
  Image,
  HelpCircle,
  ArrowLeft,
  X,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import {
  CHALLENGE_OPTIONS,
  DATA_TYPE_OPTIONS,
  getRecommendedScenarios,
  isComingSoonDataType,
  type BusinessChallenge,
  type DataType,
} from '@/lib/wizardMappings'
import { DOMAIN_SCENARIOS } from '@/lib/domainData'
import { PREBUILT_DATASETS } from '@/lib/constants'

// ── Icon map ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'log-out': LogOut,
  'trending-up': TrendingUp,
  shield: Shield,
  'alert-triangle': AlertTriangle,
  'layout-grid': LayoutGrid,
  database: Database,
  'file-text': FileText,
  image: Image,
  'help-circle': HelpCircle,
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GuidedEntryWizardProps {
  isOpen: boolean
  onClose: () => void
  onSelectScenario: (scenarioId: string) => void
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-xs font-semibold text-gray-400">
        Step {step} of {total}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-1 w-8 rounded-full transition-colors duration-300"
            style={{ background: i < step ? '#3b82f6' : '#e5e7eb' }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Step 1: Business Challenge ────────────────────────────────────────────────

function Step1({
  onSelect,
}: {
  onSelect: (challenge: BusinessChallenge) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div>
      <h2 id="wizard-title" className="text-xl font-bold text-gray-900 mb-1">
        What's your biggest business challenge?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Pick the one that resonates most — we'll show you the right scenarios.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHALLENGE_OPTIONS.map((option, i) => {
          const Icon = iconMap[option.icon] ?? HelpCircle
          const isHovered = hovered === option.id

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              onClick={() => onSelect(option.id)}
              onMouseEnter={() => setHovered(option.id)}
              onMouseLeave={() => setHovered(null)}
              className="text-left rounded-xl p-4 transition-all duration-150 w-full"
              style={{
                background: isHovered ? '#f8fafc' : '#ffffff',
                border: isHovered ? `1px solid ${option.color}40` : '1px solid #e5e7eb',
                boxShadow: isHovered
                  ? `0 4px 12px ${option.color}12`
                  : '0 1px 3px rgba(0,0,0,0.04)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${option.color}12`, border: `1px solid ${option.color}25` }}
                >
                  <Icon className="w-4 h-4" style={{ color: option.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{option.subtitle}</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 2: Data Type ─────────────────────────────────────────────────────────

function Step2({
  onSelect,
  onBack,
}: {
  onSelect: (dataType: DataType) => void
  onBack: () => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div>
      <h2 id="wizard-title" className="text-xl font-bold text-gray-900 mb-1">
        What kind of data do you work with?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        This helps us match you to the right type of AI solution.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {DATA_TYPE_OPTIONS.map((option, i) => {
          const Icon = iconMap[option.icon] ?? HelpCircle
          const isHovered = hovered === option.id
          const accentColor = option.solutionType === 'predictive'
            ? '#3b82f6'
            : option.solutionType === 'agentic'
            ? '#f59e0b'
            : option.solutionType === 'generative'
            ? '#8b5cf6'
            : '#6b7280'

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              onClick={() => onSelect(option.id)}
              onMouseEnter={() => setHovered(option.id)}
              onMouseLeave={() => setHovered(null)}
              className="text-left rounded-xl p-4 transition-all duration-150 w-full"
              style={{
                background: isHovered ? '#f8fafc' : '#ffffff',
                border: isHovered ? `1px solid ${accentColor}40` : '1px solid #e5e7eb',
                boxShadow: isHovered
                  ? `0 4px 12px ${accentColor}12`
                  : '0 1px 3px rgba(0,0,0,0.04)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25` }}
                >
                  <Icon className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{option.subtitle}</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <button
        onClick={onBack}
        aria-label="Go back to previous step"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>
    </div>
  )
}

// ── Step 3: Results ───────────────────────────────────────────────────────────

function WizardResults({
  scenarioIds,
  isComingSoon,
  onSelectScenario,
  onSeeAll,
  onBack,
}: {
  scenarioIds: string[]
  isComingSoon: boolean
  onSelectScenario: (id: string) => void
  onSeeAll: () => void
  onBack: () => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  const scenarios = useMemo(
    () => DOMAIN_SCENARIOS.filter((s) => scenarioIds.includes(s.id)),
    [scenarioIds],
  )

  // Coming soon state (text/images selected)
  if (isComingSoon) {
    return (
      <div>
        <h2 id="wizard-title" className="text-xl font-bold text-gray-900 mb-2">
          That's on our roadmap
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          VibeModel's Agentic and Generative AI solutions are launching soon. In the meantime, you may still
          have structured data use cases worth exploring in our Predictive AI scenarios.
        </p>
        <div className="flex flex-col gap-3 mb-6">
          <motion.a
            href="https://vibemodel.ai/#beta-signup"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}
          >
            Join the Beta Waitlist for Early Access
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
          <button
            onClick={onSeeAll}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors text-left"
          >
            Explore Predictive AI scenarios instead →
          </button>
        </div>
        <button
          onClick={onBack}
          aria-label="Go back to previous step"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>
    )
  }

  // No match fallback
  if (scenarios.length === 0) {
    return (
      <div>
        <h2 id="wizard-title" className="text-xl font-bold text-gray-900 mb-2">
          No exact match — yet
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          We don't have a demo for that combination yet. Explore the full scenario library to find
          the closest match.
        </p>
        <button
          onClick={onSeeAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold mb-4"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          See All Scenarios
        </button>
        <div>
          <button
            onClick={onBack}
            aria-label="Go back to previous step"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 id="wizard-title" className="text-xl font-bold text-gray-900 mb-1">
        Here's what VibeModel can do for you
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        {scenarios.length > 3
          ? 'Based on your challenge, here are some scenarios to explore:'
          : 'Based on your challenge, we recommend these scenarios:'}
      </p>

      <div className="flex flex-col gap-3 mb-5 max-h-[340px] overflow-y-auto pr-1">
        {scenarios.slice(0, 6).map((scenario, i) => {
          const ds = PREBUILT_DATASETS.find((d) => d.id === scenario.datasetId)
          const isHovered = hovered === scenario.id

          return (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
              onClick={() => onSelectScenario(scenario.id)}
              onMouseEnter={() => setHovered(scenario.id)}
              onMouseLeave={() => setHovered(null)}
              className="text-left rounded-xl p-4 transition-all duration-150 w-full"
              style={{
                background: isHovered ? '#f8fafc' : '#ffffff',
                border: isHovered ? `1px solid ${scenario.color}50` : '1px solid #e5e7eb',
                boxShadow: isHovered
                  ? `0 4px 16px ${scenario.color}15`
                  : '0 1px 3px rgba(0,0,0,0.04)',
                transform: isHovered ? 'translateY(-1px)' : 'none',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: scenario.color }}
                  >
                    {scenario.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">
                    {scenario.problemHeadline}
                  </p>
                  <p className="text-xs font-medium" style={{ color: scenario.color }}>
                    {scenario.outcomeMetric}
                  </p>
                  {ds && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      {ds.rows.toLocaleString()} rows · {ds.features} features
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-1 pt-1">
                  <span className="text-xs font-bold" style={{ color: scenario.color }}>
                    Explore
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: scenario.color }} />
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Go back to previous step"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Change my answer
        </button>
        <button
          onClick={onSeeAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          See all scenarios →
        </button>
      </div>
    </div>
  )
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export function GuidedEntryWizard({ isOpen, onClose, onSelectScenario }: GuidedEntryWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedChallenge, setSelectedChallenge] = useState<BusinessChallenge | null>(null)
  const [selectedDataType, setSelectedDataType] = useState<DataType | null>(null)

  const handleChallengeSelect = (challenge: BusinessChallenge) => {
    setSelectedChallenge(challenge)
    if (challenge === 'unsure') {
      // Skip step 2 — show all scenarios
      setSelectedDataType('unsure')
      setStep(3)
    } else {
      setStep(2)
    }
  }

  const handleDataTypeSelect = (dataType: DataType) => {
    setSelectedDataType(dataType)
    setStep(3)
  }

  const handleBack = () => {
    if (step === 3) {
      if (selectedChallenge === 'unsure') {
        // Step 2 was skipped; go back to step 1
        setStep(1)
        setSelectedChallenge(null)
        setSelectedDataType(null)
      } else {
        setStep(2)
      }
    } else if (step === 2) {
      setStep(1)
      setSelectedChallenge(null)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset state after animation
    setTimeout(() => {
      setStep(1)
      setSelectedChallenge(null)
      setSelectedDataType(null)
    }, 300)
  }

  const scenarioIds = selectedChallenge && selectedDataType
    ? getRecommendedScenarios(selectedChallenge, selectedDataType)
    : []

  const comingSoon = selectedDataType ? isComingSoonDataType(selectedDataType) : false

  // Total steps shown in progress bar: skip step 2 if challenge is 'unsure'
  const totalSteps = selectedChallenge === 'unsure' ? 2 : 3
  // Map internal step 3 to display step 2 when step 2 was skipped
  const displayStep = selectedChallenge === 'unsure' && step === 3 ? 2 : step

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="wizard-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={handleClose}
        >
          <motion.div
            key="wizard-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wizard-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-xl rounded-2xl p-7 overflow-hidden"
            style={{
              background: '#ffffff',
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              border: '1px solid #e5e7eb',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close wizard"
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <ProgressBar step={displayStep} total={totalSteps} />

            {/* Steps */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  <Step1 onSelect={handleChallengeSelect} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  <Step2 onSelect={handleDataTypeSelect} onBack={handleBack} />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  <WizardResults
                    scenarioIds={scenarioIds}
                    isComingSoon={comingSoon}
                    onSelectScenario={(id) => {
                      onSelectScenario(id)
                      handleClose()
                    }}
                    onSeeAll={handleClose}
                    onBack={handleBack}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
