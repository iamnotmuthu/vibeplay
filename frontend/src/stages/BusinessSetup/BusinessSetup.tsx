import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Zap, Layers, CheckCircle2, Info } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { getDomainById } from '@/lib/domainData'
import type { StageId, DeploymentMode } from '@/store/types'

// Domain-specific business goals
const domainGoals: Record<string, string[]> = {
  'telco-churn': ['Reduce Customer Churn', 'Identify At-Risk Customers', 'Personalise Retention Offers', 'Segment by Churn Propensity'],
  'credit-fraud': ['Detect Fraudulent Transactions', 'Minimise False Positives', 'Score Transaction Risk', 'Identify Fraud Patterns'],
  'store-demand': ['Forecast Daily Demand', 'Optimise Inventory Levels', 'Measure Promotion Impact', 'Identify Seasonal Trends'],
  'patient-readmission': ['Predict Readmission Risk', 'Identify High-Risk Patients', 'Optimise Care Plans', 'Reduce 30-Day Readmissions'],
  'employee-attrition': ['Predict Attrition Risk', 'Discover Attrition Drivers', 'Identify High-Risk Employees', 'Improve Retention Rate'],
  'energy-consumption': ['Forecast Hourly Demand', 'Detect Consumption Anomalies', 'Predict Peak Demand Windows', 'Optimise Grid Balancing'],
  'insurance-claims': ['Detect Fraudulent Claims', 'Score Claim Risk', 'Discover Fraud Networks', 'Prioritise Investigations'],
  'predictive-maintenance': ['Predict Equipment Failure', 'Detect Sensor Anomalies', 'Estimate Remaining Useful Life', 'Optimise Maintenance Schedule'],
}

const fallbackGoals = ['Improve Prediction Accuracy', 'Identify Key Drivers', 'Segment Key Groups', 'Optimise Business Outcomes']

// Contextual hints per goal → deployment recommendation
const goalDeploymentHint: Record<string, { mode: DeploymentMode; reason: string }> = {
  'Detect Fraudulent Transactions': { mode: 'realtime', reason: 'Fraud must be caught at the moment of transaction — real-time scoring is essential.' },
  'Score Transaction Risk': { mode: 'realtime', reason: 'Risk scores need to be available instantly at point of decision.' },
  'Predict Peak Demand Windows': { mode: 'realtime', reason: 'Real-time demand signals allow immediate grid adjustments.' },
  'Detect Consumption Anomalies': { mode: 'realtime', reason: 'Anomalies must be flagged as they occur to trigger rapid response.' },
  'Detect Fraudulent Claims': { mode: 'realtime', reason: 'Early flagging at submission time reduces downstream payout risk.' },
  'Score Claim Risk': { mode: 'realtime', reason: 'Risk scoring at intake enables automatic routing to investigators.' },
  'Predict Equipment Failure': { mode: 'realtime', reason: 'Failure alerts must fire within seconds of sensor threshold breach to prevent downtime.' },
  'Detect Sensor Anomalies': { mode: 'realtime', reason: 'Anomalous sensor readings need immediate flagging for rapid maintenance dispatch.' },
  'Reduce Customer Churn': { mode: 'batch', reason: 'Churn scoring runs nightly across the full customer base for next-day outreach.' },
  'Identify At-Risk Customers': { mode: 'batch', reason: 'Batch overnight scoring gives retention teams a daily prioritised list.' },
  'Personalise Retention Offers': { mode: 'batch', reason: 'Offer personalisation is most effective when refreshed nightly per segment.' },
  'Forecast Daily Demand': { mode: 'batch', reason: 'Demand forecasts are generated in scheduled runs to feed replenishment systems.' },
  'Optimise Inventory Levels': { mode: 'batch', reason: 'Inventory recommendations are planned in advance — batch is ideal.' },
  'Predict Readmission Risk': { mode: 'batch', reason: 'Risk scores are generated at discharge and reviewed by care coordinators.' },
  'Predict Attrition Risk': { mode: 'batch', reason: 'HR attrition reports run weekly for manager review and action planning.' },
  'Forecast Hourly Demand': { mode: 'batch', reason: 'Hourly forecasts are pre-computed and fed into grid scheduling systems.' },
  'Estimate Remaining Useful Life': { mode: 'batch', reason: 'RUL estimates are computed on a scheduled basis to drive maintenance planning cycles.' },
  'Optimise Maintenance Schedule': { mode: 'batch', reason: 'Scheduled batch runs align with shift planning and maintenance window calendars.' },
}

function getHint(goal: string): { mode: DeploymentMode; reason: string } | null {
  return goalDeploymentHint[goal] ?? null
}

export function BusinessSetup() {
  const selectedDataset = usePlaygroundStore((s) => s.selectedDataset)
  const activeDomainId = usePlaygroundStore((s) => s.activeDomainId)
  const businessGoal = usePlaygroundStore((s) => s.businessGoal)
  const deploymentMode = usePlaygroundStore((s) => s.deploymentMode)
  const setBusinessGoal = usePlaygroundStore((s) => s.setBusinessGoal)
  const setDeploymentMode = usePlaygroundStore((s) => s.setDeploymentMode)
  const completeStep = usePlaygroundStore((s) => s.completeStep)
  const setStep = usePlaygroundStore((s) => s.setStep)
  const addLog = usePlaygroundStore((s) => s.addLog)

  const [localGoal, setLocalGoal] = useState<string>(businessGoal || '')
  const [localMode, setLocalMode] = useState<DeploymentMode | null>(deploymentMode)

  const domain = activeDomainId ? getDomainById(activeDomainId) : null
  const goals = selectedDataset ? (domainGoals[selectedDataset.id] || fallbackGoals) : fallbackGoals
  const canContinue = !!localGoal && !!localMode
  const hint = localGoal ? getHint(localGoal) : null

  const handleNext = () => {
    if (!canContinue) return
    setBusinessGoal(localGoal)
    setDeploymentMode(localMode!)
    addLog(`Business Goal: ${localGoal}`, 'action')
    addLog(`Deployment Mode: ${localMode === 'realtime' ? 'Real-Time' : 'Batch Processing'}`, 'action')
    completeStep(2)
    setStep(3 as StageId)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Business Setup</h2>
          {domain && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${domain.color}18`, color: domain.color, border: `1px solid ${domain.color}35` }}
            >
              {domain.label}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Define your business goal and how predictions will be delivered — this shapes the model selection downstream.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Section 1: Business Goal */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">1</span>
              Business Goal
            </h3>
            <p className="text-xs text-gray-500 mb-4 ml-7">What outcome do you want this model to drive?</p>
            <div className="grid grid-cols-2 gap-3 ml-7">
              {goals.map((goal) => {
                const isSelected = localGoal === goal
                return (
                  <motion.button
                    key={goal}
                    onClick={() => setLocalGoal(goal)}
                    whileHover={!isSelected ? { y: -3, scale: 1.02 } : {}}
                    whileTap={{ scale: 0.97 }}
                    animate={isSelected ? { y: -2 } : { y: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors relative"
                    style={
                      isSelected
                        ? {
                            background: 'rgba(59,130,246,0.08)',
                            border: '2px solid #3b82f6',
                            color: '#3b82f6',
                            boxShadow: '0 8px 20px -6px rgba(59,130,246,0.25)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            border: '1.5px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.7)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
                        e.currentTarget.style.color = '#fff'
                        e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(59,130,246,0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-2 text-blue-400" />}
                    {goal}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Section 2: Deployment Mode */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">2</span>
              Deployment Mode
            </h3>
            <p className="text-xs text-gray-500 mb-3 ml-7">How will predictions be served? This directly informs model architecture.</p>

            {/* Contextual hint based on selected goal */}
            <AnimatePresence>
              {hint && (
                <motion.div
                  key={localGoal}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-7 mb-4 overflow-hidden"
                >
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-gray-500">
                    <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      For <span className="font-semibold text-primary">"{localGoal}"</span>:{' '}
                      {hint.reason}
                      <span className="ml-1 font-semibold text-primary capitalize">
                        {hint.mode === 'realtime' ? 'Real-Time' : 'Batch'} recommended.
                      </span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4 ml-7">
              {/* Real-Time */}
              <motion.button
                onClick={() => setLocalMode('realtime')}
                whileHover={localMode !== 'realtime' ? { y: -4, scale: 1.02 } : {}}
                whileTap={{ scale: 0.97 }}
                animate={localMode === 'realtime' ? { y: -2 } : { y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="relative p-5 rounded-2xl text-left"
                style={
                  localMode === 'realtime'
                    ? {
                        border: '2px solid #06b6d4',
                        background: 'rgba(6,182,212,0.06)',
                        boxShadow: '0 12px 30px -8px rgba(6,182,212,0.3)',
                      }
                    : {
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                      }
                }
                onMouseEnter={(e) => {
                  if (localMode !== 'realtime') {
                    e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'
                    e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(6,182,212,0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (localMode !== 'realtime') {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {localMode === 'realtime' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
                <Zap className="w-7 h-7 text-cyan-400 mb-3" />
                <div className="text-sm font-bold text-gray-100 mb-1">Real-Time</div>
                <div className="text-xs text-gray-500">Latency-optimised. Sub-100ms inference. Best for fraud detection, live scoring.</div>
                <div className="mt-3 text-[10px] font-semibold text-cyan-500 uppercase tracking-wider">
                  Prefers: Logistic Regression · LightGBM
                </div>
              </motion.button>

              {/* Batch */}
              <motion.button
                onClick={() => setLocalMode('batch')}
                whileHover={localMode !== 'batch' ? { y: -4, scale: 1.02 } : {}}
                whileTap={{ scale: 0.97 }}
                animate={localMode === 'batch' ? { y: -2 } : { y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="relative p-5 rounded-2xl text-left"
                style={
                  localMode === 'batch'
                    ? {
                        border: '2px solid #8b5cf6',
                        background: 'rgba(139,92,246,0.06)',
                        boxShadow: '0 12px 30px -8px rgba(139,92,246,0.3)',
                      }
                    : {
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                      }
                }
                onMouseEnter={(e) => {
                  if (localMode !== 'batch') {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'
                    e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(139,92,246,0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (localMode !== 'batch') {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {localMode === 'batch' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
                <Layers className="w-7 h-7 text-violet-400 mb-3" />
                <div className="text-sm font-bold text-gray-100 mb-1">Batch Processing</div>
                <div className="text-xs text-gray-500">High-accuracy, scheduled runs. Best for churn scoring, demand forecasting.</div>
                <div className="mt-3 text-[10px] font-semibold text-violet-500 uppercase tracking-wider">
                  Prefers: XGBoost · Random Forest
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <BottomActionBar
        onNext={canContinue ? handleNext : undefined}
        nextDisabled={!canContinue}
        nextLabel="Continue to Auto EDA"
      />
    </div>
  )
}
