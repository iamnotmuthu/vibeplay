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
  'logistics-delivery-delay': ['Predict Delivery Delays', 'Identify Delay Drivers', 'Score Shipment Risk', 'Optimise Route Planning'],
  'logistics-freight-cost': ['Estimate Freight Cost', 'Detect Cost Anomalies', 'Optimise Shipping Routes', 'Improve Quote Accuracy'],
  'logistics-delivery-outcome': ['Classify Delivery Outcomes', 'Predict Cancellation Risk', 'Segment by Outcome', 'Automate Outcome Workflows'],
  'logistics-demand-forecast': ['Forecast Daily Demand', 'Optimise Fleet Capacity', 'Plan Inventory Replenishment', 'Detect Demand Anomalies'],
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
  'Predict Delivery Delays': { mode: 'realtime', reason: 'Delay predictions must be available at booking time to enable proactive rerouting and customer alerts.' },
  'Identify Delay Drivers': { mode: 'batch', reason: 'Root cause analysis runs in scheduled batches to inform logistics planning and partner reviews.' },
  'Score Shipment Risk': { mode: 'realtime', reason: 'Risk scores at dispatch time enable real-time SLA management and priority routing.' },
  'Optimise Route Planning': { mode: 'batch', reason: 'Route optimisation models run in batch to generate next-day delivery plans.' },
  'Estimate Freight Cost': { mode: 'realtime', reason: 'Instant cost estimates are needed at quote time for customer-facing pricing.' },
  'Detect Cost Anomalies': { mode: 'batch', reason: 'Cost anomaly detection runs in scheduled audits to flag billing discrepancies.' },
  'Optimise Shipping Routes': { mode: 'batch', reason: 'Route optimisation runs in scheduled batches to inform procurement and vendor negotiations.' },
  'Improve Quote Accuracy': { mode: 'realtime', reason: 'Quote accuracy improvements must be reflected in real-time pricing engines.' },
  'Classify Delivery Outcomes': { mode: 'batch', reason: 'Outcome classification runs in batch to trigger outcome-specific automation workflows.' },
  'Predict Cancellation Risk': { mode: 'realtime', reason: 'Cancellation risk must be scored at order time to trigger proactive retention outreach.' },
  'Segment by Outcome': { mode: 'batch', reason: 'Segmentation analysis runs in batch to inform customer experience strategy.' },
  'Automate Outcome Workflows': { mode: 'batch', reason: 'Workflow automation triggers are generated in scheduled runs aligned with fulfilment cycles.' },
  'Optimise Fleet Capacity': { mode: 'batch', reason: 'Fleet capacity plans are generated in advance to align with shift scheduling and vehicle allocation.' },
  'Plan Inventory Replenishment': { mode: 'batch', reason: 'Replenishment orders are planned in batch cycles aligned with supplier lead times.' },
  'Detect Demand Anomalies': { mode: 'realtime', reason: 'Demand spikes from weather events or disruptions need immediate detection for rapid response.' },
  // credit-fraud
  'Minimise False Positives': { mode: 'realtime', reason: 'False-positive tuning must be applied in real time so legitimate customers are not blocked at point of sale.' },
  'Identify Fraud Patterns': { mode: 'batch', reason: 'Pattern discovery runs in scheduled analysis windows to update fraud rules and detection models.' },
  // store-demand
  'Measure Promotion Impact': { mode: 'batch', reason: 'Promotion lift analysis is computed post-campaign in batch to inform future marketing spend.' },
  'Identify Seasonal Trends': { mode: 'batch', reason: 'Seasonal decomposition runs in scheduled batches across historical data.' },
  // patient-readmission
  'Identify High-Risk Patients': { mode: 'batch', reason: 'Risk stratification runs nightly so care teams have updated lists each morning.' },
  'Optimise Care Plans': { mode: 'batch', reason: 'Care plan recommendations are generated in batch and reviewed by clinical staff.' },
  'Reduce 30-Day Readmissions': { mode: 'batch', reason: 'Readmission reduction programs are driven by batch-scored cohort lists refreshed at discharge.' },
  // employee-attrition
  'Discover Attrition Drivers': { mode: 'batch', reason: 'Driver analysis runs in scheduled batches to produce SHAP-based reports for HR leadership.' },
  'Identify High-Risk Employees': { mode: 'batch', reason: 'Weekly batch scoring gives managers a prioritised flight-risk list.' },
  'Improve Retention Rate': { mode: 'batch', reason: 'Retention improvement programs run on batch-scored segments refreshed monthly.' },
  // energy-consumption
  'Optimise Grid Balancing': { mode: 'batch', reason: 'Grid balancing schedules are pre-computed in batch to align with dispatch planning windows.' },
  // insurance-claims
  'Discover Fraud Networks': { mode: 'batch', reason: 'Network analysis runs in scheduled batches to map provider and claimant relationships.' },
  'Prioritise Investigations': { mode: 'batch', reason: 'Investigation queues are populated in nightly batch runs ranked by fraud probability.' },
  // telco-churn
  'Segment by Churn Propensity': { mode: 'batch', reason: 'Propensity segmentation is refreshed nightly to feed CRM campaign targeting systems.' },
}

function getHint(goal: string): { mode: DeploymentMode; reason: string } | null {
  return goalDeploymentHint[goal] ?? null
}

function DeploymentTooltip() {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
      {visible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg p-3 z-50"
          style={{
            background: '#ffffff',
            border: '1px solid #d1d5db',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <p className="text-[11px] leading-relaxed mb-2" style={{ color: '#475569' }}>
            <span className="font-semibold" style={{ color: '#1e293b' }}>Realtime</span> — single-record predictions via API with sub-second latency. Optimises for low-latency model architectures and lightweight preprocessing.
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: '#475569' }}>
            <span className="font-semibold" style={{ color: '#1e293b' }}>Batch</span> — scheduled bulk scoring (hourly/daily). Allows heavier ensembles and more complex feature pipelines since latency is not a constraint.
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#d1d5db]" />
        </div>
      )}
    </div>
  )
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
    completeStep(1)
    setStep(2 as StageId)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold" style={{ color: '#1e293b' }}>Business Setup</h2>
          {domain && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${domain.color}18`, color: domain.color, border: `1px solid ${domain.color}35` }}
            >
              {domain.label}
            </span>
          )}
        </div>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
          Define your business goal and how predictions will be delivered — this shapes the model selection downstream.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6" style={{ background: '#fafafa' }}>
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Section 1: Business Goal */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: '#1e293b' }}>
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">1</span>
              Business Goal
            </h3>
            <p className="text-xs mb-4 ml-7" style={{ color: '#6b7280' }}>What outcome do you want this model to drive?</p>
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
                            background: '#eff6ff',
                            border: '2px solid #60a5fa',
                            color: '#3b82f6',
                            boxShadow: '0 8px 20px -6px rgba(59,130,246,0.18)',
                          }
                        : {
                            background: '#ffffff',
                            border: '1.5px solid #e5e7eb',
                            color: '#475569',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
                        e.currentTarget.style.color = '#1e293b'
                        e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(59,130,246,0.12)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.color = '#475569'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
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
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: '#1e293b' }}>
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">2</span>
              Deployment Mode
              <DeploymentTooltip />
            </h3>
            <p className="text-xs mb-3 ml-7" style={{ color: '#6b7280' }}>How will predictions be served? This directly informs model architecture.</p>

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
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-xs" style={{ color: '#6b7280' }}>
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
                        background: '#ecfeff',
                        boxShadow: '0 12px 30px -8px rgba(6,182,212,0.2)',
                      }
                    : {
                        border: '1.5px solid #e5e7eb',
                        background: '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                      }
                }
                onMouseEnter={(e) => {
                  if (localMode !== 'realtime') {
                    e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'
                    e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(6,182,212,0.12)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (localMode !== 'realtime') {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
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
                <Zap className="w-7 h-7 text-cyan-500 mb-3" />
                <div className="text-sm font-bold mb-1" style={{ color: '#1e293b' }}>Real-Time</div>
                <div className="text-xs" style={{ color: '#6b7280' }}>Latency-optimised. Sub-100ms inference. Best for fraud detection, live scoring.</div>
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
                        background: '#f5f3ff',
                        boxShadow: '0 12px 30px -8px rgba(139,92,246,0.2)',
                      }
                    : {
                        border: '1.5px solid #e5e7eb',
                        background: '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                      }
                }
                onMouseEnter={(e) => {
                  if (localMode !== 'batch') {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'
                    e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(139,92,246,0.12)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (localMode !== 'batch') {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
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
                <Layers className="w-7 h-7 text-violet-500 mb-3" />
                <div className="text-sm font-bold mb-1" style={{ color: '#1e293b' }}>Batch Processing</div>
                <div className="text-xs" style={{ color: '#6b7280' }}>High-accuracy, scheduled runs. Best for churn scoring, demand forecasting.</div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <BottomActionBar
        onNext={canContinue ? handleNext : undefined}
        nextDisabled={!canContinue}
        nextLabel="Continue to Dataset"
      />
    </div>
  )
}
