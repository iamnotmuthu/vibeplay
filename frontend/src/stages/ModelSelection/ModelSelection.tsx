import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Eye, Info, Download, X, Activity, AlertTriangle, Sparkles,
  TrendingUp, BarChart3, Monitor,
} from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { BottomActionBar } from '@/components/layout/BottomActionBar'
import { CompletionModal } from '@/components/shared/CompletionModal'
import { CountUpNumber } from '@/components/shared/CountUpNumber'
import { getPrecomputedModelSelection } from './modelSelectionData'
import type { ModelSelectionResults, CohortPerformance, ModelComponent } from '@/store/types'

const CATEGORY_COLORS: Record<string, { pill: string; track: string }> = {
  sufficient:   { pill: 'bg-emerald-500', track: 'bg-emerald-500/20' },
  insufficient: { pill: 'bg-red-500',     track: 'bg-red-500/20'     },
  helpMe:       { pill: 'bg-amber-500',   track: 'bg-amber-500/20'   },
}

function levelColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'high':     return 'text-amber-400'
    case 'low':      return 'text-teal-400'
    case 'median':   return 'text-gray-300'
    case 'yes':      return 'text-emerald-400'
    case 'no':       return 'text-red-400'
    default:         return 'text-gray-400'
  }
}

// ── Per-scenario monitoring data ─────────────────────────────────────────────

interface MonitoringConfig {
  stats: { label: string; value: string; sub: string; color: string }[]
  driftAlert: {
    cohortName: string
    classification: string
    detail: string
    metricLabel: string
    metricValue: string
    decrease: string
  }
  dimensionAlert: {
    name: string
    affectedPct: number
    detail: string
    impact: string
  }
  precisionData: number[]
  recallData: number[]
  volumeData: number[]
  latencyData: number[]
}

const WEEK_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const monitoringConfigs: Record<string, MonitoringConfig> = {
  'telco-churn': {
    stats: [
      { label: 'Total Predictions', value: '8,423', sub: '+12% from last week', color: '#38bdf8' },
      { label: 'Avg Response Time', value: '42ms', sub: '−5ms from target', color: '#a78bfa' },
      { label: 'Error Rate', value: '0.09%', sub: 'Within threshold', color: '#34d399' },
      { label: 'Model Version', value: 'v2.1.3', sub: 'Updated Feb 18, 2026', color: '#60a5fa' },
    ],
    driftAlert: {
      cohortName: 'data_cohort_2 (Month-to-Month · High Charges)',
      classification: 'High Churn Risk',
      detail: 'This cohort was originally classified as High Churn Risk. 78% of data from this cohort have monthly charges > $80 on month-to-month contracts. Recent data shows significant deviation from the trained pattern.',
      metricLabel: 'Precision',
      metricValue: '83%',
      decrease: '−6% decrease',
    },
    dimensionAlert: {
      name: 'call_support_frequency',
      affectedPct: 38,
      detail: 'Captures the number of customer support calls in the last 30 days. Customers with 3+ support calls show a churn rate 2.4× higher than those with 0 calls.',
      impact: 'Adding this dimension could improve precision by 3–5% and recall by 2–4%, while reducing false positives by ~12%.',
    },
    precisionData: [91,90,90,89,89,88,88, 89,88,88,87,86,86,85, 87,86,86,85,85,84,82],
    recallData:    [90,89,88,88,87,87,86, 88,87,86,86,85,84,83, 86,85,84,83,83,82,80],
    volumeData:    [340,380,460,510,480,200,170, 360,410,490,540,510,215,180, 380,430,510,560,530,230,190],
    latencyData:   [36,35,37,40,39,34,32, 37,36,38,41,40,35,33, 38,37,40,43,42,36,35],
  },
  'credit-fraud': {
    stats: [
      { label: 'Total Predictions', value: '45,102', sub: '+18% from last week', color: '#38bdf8' },
      { label: 'Avg Response Time', value: '28ms', sub: '−3ms from target', color: '#a78bfa' },
      { label: 'Error Rate', value: '0.04%', sub: 'Excellent', color: '#34d399' },
      { label: 'Model Version', value: 'v3.0.1', sub: 'Updated Feb 14, 2026', color: '#60a5fa' },
    ],
    driftAlert: {
      cohortName: 'data_cohort_1 (High-Amount Transactions · Night Hours)',
      classification: 'High Fraud Risk',
      detail: 'This cohort was originally classified as High Fraud Risk. 81% of transactions in this cohort have amounts > $500 during off-peak hours. Recent transaction patterns show a new fraud vector not captured in training.',
      metricLabel: 'Recall',
      metricValue: '79%',
      decrease: '−9% decrease',
    },
    dimensionAlert: {
      name: 'merchant_category_risk',
      affectedPct: 61,
      detail: 'A new risk dimension based on merchant category codes (MCCs). High-risk MCCs (online gambling, wire transfers, digital goods) show 4.7× higher fraud rates than standard retail merchants.',
      impact: 'Adding this dimension could improve precision by 4–6% and recall by 5–7%, while reducing false positives by ~18%.',
    },
    precisionData: [96,95,95,94,94,93,93, 94,93,93,92,91,91,90, 92,91,91,90,90,89,89],
    recallData:    [91,90,90,89,88,88,87, 89,88,87,86,85,84,83, 87,86,85,84,83,82,80],
    volumeData:    [800,890,1050,1200,1150,500,420, 840,940,1100,1280,1220,530,450, 880,990,1150,1340,1280,560,480],
    latencyData:   [23,22,24,28,26,21,20, 24,23,25,29,27,22,21, 25,24,26,30,28,23,22],
  },
  'store-demand': {
    stats: [
      { label: 'Total Predictions', value: '12,840', sub: '+9% from last week', color: '#38bdf8' },
      { label: 'Avg Response Time', value: '65ms', sub: 'On target', color: '#a78bfa' },
      { label: 'Error Rate', value: '0.18%', sub: 'Within threshold', color: '#34d399' },
      { label: 'Model Version', value: 'v1.4.2', sub: 'Updated Feb 10, 2026', color: '#60a5fa' },
    ],
    driftAlert: {
      cohortName: 'data_cohort_4 (Holiday Promotion · High-Volume Stores)',
      classification: 'Peak Demand',
      detail: 'This cohort was originally classified as Peak Demand. 74% of records represent promotional periods for top 3 stores. Recent holiday patterns deviate from historical baselines, likely due to new product launches.',
      metricLabel: 'Precision',
      metricValue: '76%',
      decrease: '−11% decrease',
    },
    dimensionAlert: {
      name: 'weather_severity_index',
      affectedPct: 45,
      detail: 'A new composite dimension capturing local weather severity during sales periods. Stores in regions with severe weather show 1.8× higher demand variability, particularly for essential goods categories.',
      impact: 'Adding this dimension could improve precision by 3–5% and reduce demand forecast error (MAPE) by ~8%.',
    },
    precisionData: [91,90,89,89,88,87,87, 89,88,87,86,85,85,84, 87,86,85,84,83,82,79],
    recallData:    [88,87,87,86,85,84,83, 86,85,84,83,82,81,80, 84,83,82,81,80,79,77],
    volumeData:    [180,200,310,380,350,120,100, 190,220,340,410,380,130,110, 200,240,370,440,410,140,120],
    latencyData:   [55,54,57,63,61,52,50, 57,56,59,65,63,54,52, 59,58,62,68,66,56,54],
  },
  'patient-readmission': {
    stats: [
      { label: 'Total Predictions', value: '5,218', sub: '+6% from last week', color: '#38bdf8' },
      { label: 'Avg Response Time', value: '72ms', sub: 'On target', color: '#a78bfa' },
      { label: 'Error Rate', value: '0.21%', sub: 'Within threshold', color: '#34d399' },
      { label: 'Model Version', value: 'v2.0.5', sub: 'Updated Feb 16, 2026', color: '#60a5fa' },
    ],
    driftAlert: {
      cohortName: 'data_cohort_3 (Age 70-80 · Emergency Admission)',
      classification: 'High Readmission Risk',
      detail: 'This cohort was originally classified as High Readmission Risk. 76% of patients in this cohort are aged 70-80 admitted via emergency. Recent data shows an increase in patients with comorbidities not well-represented in training.',
      metricLabel: 'Recall',
      metricValue: '71%',
      decrease: '−8% decrease',
    },
    dimensionAlert: {
      name: 'social_support_level',
      affectedPct: 33,
      detail: 'A new dimension derived from discharge notes capturing patient social support status. Patients with low social support (living alone, no caregiver) show a 2.1× higher 30-day readmission rate.',
      impact: 'Adding this dimension could improve recall by 4–6% and precision by 2–4%, substantially reducing missed high-risk patients.',
    },
    precisionData: [85,84,84,83,82,81,81, 83,82,81,80,79,79,78, 81,80,79,78,77,76,74],
    recallData:    [82,81,80,80,79,78,77, 80,79,78,77,76,75,74, 78,77,76,75,74,73,72],
    volumeData:    [160,180,240,310,280,100,85, 170,190,255,330,300,110,90, 180,205,270,355,320,115,95],
    latencyData:   [62,61,64,70,68,59,57, 64,63,66,72,70,61,59, 66,65,68,74,72,63,61],
  },
  'employee-attrition': {
    stats: [
      { label: 'Total Predictions', value: '3,891', sub: '+5% from last week', color: '#38bdf8' },
      { label: 'Avg Response Time', value: '54ms', sub: '−4ms from target', color: '#a78bfa' },
      { label: 'Error Rate', value: '0.11%', sub: 'Within threshold', color: '#34d399' },
      { label: 'Model Version', value: 'v1.3.1', sub: 'Updated Feb 12, 2026', color: '#60a5fa' },
    ],
    driftAlert: {
      cohortName: 'data_cohort_2 (Mid-Level · Sales Department)',
      classification: 'High Attrition Risk',
      detail: 'This cohort was originally classified as High Attrition Risk. 72% of employees in this cohort are mid-level Sales staff with 2-4 years tenure. Recent performance data shows a new attrition pattern tied to compensation changes.',
      metricLabel: 'Precision',
      metricValue: '80%',
      decrease: '−7% decrease',
    },
    dimensionAlert: {
      name: 'remote_work_frequency',
      affectedPct: 52,
      detail: 'A new dimension capturing weekly remote work days since post-pandemic policy changes. Employees with < 2 remote days/week in roles that can be done remotely show a 1.9× higher attrition rate.',
      impact: 'Adding this dimension could improve precision by 3–5% and recall by 2–3%, enabling earlier intervention for at-risk employees.',
    },
    precisionData: [90,89,88,88,87,86,86, 88,87,86,85,84,84,83, 86,85,84,83,82,81,80],
    recallData:    [86,85,84,83,83,82,81, 84,83,82,81,80,79,78, 82,81,80,79,78,77,76],
    volumeData:    [120,140,200,250,230,80,65, 130,150,215,268,248,85,70, 140,160,230,285,265,90,75],
    latencyData:   [46,45,47,52,51,43,42, 47,46,49,54,52,44,43, 49,48,51,56,54,46,44],
  },
  'energy-consumption': {
    stats: [
      { label: 'Total Predictions', value: '18,640', sub: '+14% from last week', color: '#38bdf8' },
      { label: 'Avg Response Time', value: '38ms', sub: '−6ms from target', color: '#a78bfa' },
      { label: 'Error Rate', value: '0.08%', sub: 'Excellent', color: '#34d399' },
      { label: 'Model Version', value: 'v2.2.0', sub: 'Updated Feb 19, 2026', color: '#60a5fa' },
    ],
    driftAlert: {
      cohortName: 'data_cohort_1 (Peak Hour · Industrial Zone)',
      classification: 'High Consumption',
      detail: 'This cohort was originally classified as High Consumption. 83% of records are from industrial grid zones during peak hours (08:00-20:00). Recent demand patterns show unusual spikes attributed to new industrial operations.',
      metricLabel: 'Precision',
      metricValue: '81%',
      decrease: '−10% decrease',
    },
    dimensionAlert: {
      name: 'hvac_efficiency_score',
      affectedPct: 47,
      detail: 'A new dimension derived from smart meter data capturing HVAC system efficiency ratios. Buildings with efficiency score < 0.6 show 2.3× higher peak consumption variability, making demand harder to predict.',
      impact: 'Adding this dimension could reduce MAPE by 6–9% and improve precision for peak-hour predictions by 4–6%.',
    },
    precisionData: [93,92,92,91,91,90,90, 91,90,90,89,88,88,87, 90,89,89,88,87,86,84],
    recallData:    [92,91,90,90,89,89,88, 90,89,89,88,87,86,85, 88,87,87,86,85,84,82],
    volumeData:    [580,640,780,900,860,420,380, 610,680,820,960,920,450,410, 640,720,860,1020,980,480,440],
    latencyData:   [32,31,33,36,35,29,28, 33,32,34,37,36,30,29, 34,33,36,39,37,31,30],
  },
  'insurance-claims': {
    stats: [
      { label: 'Total Predictions', value: '6,724', sub: '+8% from last week', color: '#38bdf8' },
      { label: 'Avg Response Time', value: '58ms', sub: 'On target', color: '#a78bfa' },
      { label: 'Error Rate', value: '0.14%', sub: 'Within threshold', color: '#34d399' },
      { label: 'Model Version', value: 'v1.8.4', sub: 'Updated Feb 8, 2026', color: '#60a5fa' },
    ],
    driftAlert: {
      cohortName: 'data_cohort_2 (Multi-Vehicle Collision · High Severity)',
      classification: 'High Fraud Risk',
      detail: 'This cohort was originally classified as High Fraud Risk. 79% of claims in this cohort involve multi-vehicle collisions with major damage. A new staging scheme is being detected where claimants coordinate to inflate repair estimates.',
      metricLabel: 'Recall',
      metricValue: '70%',
      decrease: '−12% decrease',
    },
    dimensionAlert: {
      name: 'repair_shop_network_tier',
      affectedPct: 41,
      detail: 'A new dimension capturing the tier classification of repair shops (in-network, out-of-network, flagged). Claims processed through flagged shops show a 3.2× higher fraud rate and average 40% higher repair costs.',
      impact: 'Adding this dimension could improve recall by 5–7% and precision by 3–5%, significantly reducing fraudulent payout risk.',
    },
    precisionData: [88,87,87,86,85,84,83, 86,85,84,83,82,81,80, 84,83,82,81,80,79,77],
    recallData:    [85,84,83,82,82,81,80, 83,82,81,80,79,78,77, 81,80,79,78,77,76,73],
    volumeData:    [175,200,265,330,305,105,90, 185,215,280,350,325,110,95, 195,230,300,375,350,120,100],
    latencyData:   [50,48,51,57,55,46,44, 51,50,53,59,57,48,46, 53,51,55,61,59,50,48],
  },
  'predictive-maintenance': {
    stats: [
      { label: 'Total Predictions', value: '9,312', sub: '+11% from last week', color: '#38bdf8' },
      { label: 'Avg Response Time', value: '32ms', sub: '−4ms from target', color: '#a78bfa' },
      { label: 'Error Rate', value: '0.06%', sub: 'Excellent', color: '#34d399' },
      { label: 'Model Version', value: 'v3.1.2', sub: 'Updated Feb 17, 2026', color: '#60a5fa' },
    ],
    driftAlert: {
      cohortName: 'data_cohort_1 (High Vibration · Critical Equipment)',
      classification: 'Imminent Failure',
      detail: 'This cohort was originally classified as Imminent Failure Risk. 86% of machines in this cohort show vibration > 8.5 mm/s on critical production lines. Recent sensor data indicates a new failure mode not captured in training data.',
      metricLabel: 'Precision',
      metricValue: '85%',
      decrease: '−8% decrease',
    },
    dimensionAlert: {
      name: 'ambient_temperature_variance',
      affectedPct: 36,
      detail: 'A new dimension capturing daily temperature variance in the operating environment. Machines in environments with >15°C daily variance show a 2.6× higher bearing failure rate, independent of vibration levels.',
      impact: 'Adding this dimension could improve precision by 4–6% and recall by 3–5%, enabling earlier preventive maintenance scheduling.',
    },
    precisionData: [95,94,94,93,93,92,92, 93,92,92,91,90,90,89, 92,91,91,90,89,88,86],
    recallData:    [93,92,92,91,91,90,90, 92,91,91,90,89,88,87, 91,90,89,88,87,86,84],
    volumeData:    [320,360,450,540,510,190,160, 340,385,480,580,550,205,175, 360,410,510,620,590,220,190],
    latencyData:   [27,26,27,30,29,24,23, 28,27,28,31,30,25,24, 29,28,30,33,31,26,25],
  },
}

function getMonitoringConfig(datasetId: string): MonitoringConfig {
  return monitoringConfigs[datasetId] ?? monitoringConfigs['telco-churn']
}

// ── Chart components ──────────────────────────────────────────────────────────

function MetricBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-16 shrink-0 text-right">{label}</span>
      <div className={`flex-1 h-2.5 rounded-full ${colorClass} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass.replace('/20', '')}`}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-gray-200 w-10 text-right">{value}%</span>
    </div>
  )
}

function PerformanceRow({ row }: { row: CohortPerformance }) {
  const colors = CATEGORY_COLORS[row.category]
  return (
    <div className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-4 space-y-2">
      <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
        row.category === 'sufficient' ? 'text-emerald-400' :
        row.category === 'insufficient' ? 'text-red-400' : 'text-amber-400'
      }`}>
        {row.label}
      </div>
      <MetricBar label="Recall" value={row.recall} colorClass={colors.track} />
      <MetricBar label="Precision" value={row.precision} colorClass={colors.track} />
    </div>
  )
}

// ── Metric explanation helper + tooltip ───────────────────────────────────────

function getMetricExplanation(businessGoal: string | null, primaryMetric: string): string {
  const g = (businessGoal ?? '').toLowerCase()
  if (primaryMetric === 'Recall') {
    if (g.includes('churn'))
      return 'Recall is prioritised because missing a customer about to churn is more costly than a false alarm. Every true churner not caught is a lost revenue opportunity.'
    if (g.includes('fraud'))
      return 'Recall is prioritised because a missed fraud transaction causes direct financial loss, whereas a false positive is a minor inconvenience.'
    if (g.includes('readmission') || g.includes('patient'))
      return 'Recall is prioritised because failing to flag a patient at risk of readmission leads to preventable health complications.'
    if (g.includes('attrition') || g.includes('employee'))
      return 'Recall is prioritised because missing an employee likely to leave means losing talent and incurring replacement costs.'
    if (g.includes('insurance') || g.includes('claim'))
      return 'Recall is prioritised because failing to identify a valid claim results in underpayment and regulatory risk.'
    if (g.includes('maintenance') || g.includes('failure'))
      return 'Recall is prioritised because missing an impending equipment failure leads to costly unplanned downtime.'
    return 'Recall is prioritised because missing true positives has a higher business cost than false alarms in this scenario.'
  }
  if (primaryMetric === 'MAPE') {
    if (g.includes('demand') || g.includes('store'))
      return 'MAPE is prioritised because relative forecast accuracy directly determines inventory levels and stockout risk. A 5% error on a high-volume SKU matters as much as on a low-volume one.'
    if (g.includes('energy') || g.includes('consumption'))
      return 'MAPE is prioritised because relative energy forecast error drives procurement decisions and grid balancing costs proportionally across all consumption levels.'
    return 'MAPE is prioritised because relative error is the most meaningful measure for this forecasting objective.'
  }
  return `${primaryMetric} is the primary optimisation target for this model based on the stated business objective.`
}

function MetricEyeTooltip({ explanation }: { explanation: string }) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  return (
    <div
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      <Eye className="w-3 h-3 text-gray-500 cursor-help hover:text-gray-300 transition-colors" />
      {tooltipVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-gray-900 border border-gray-700 p-3 shadow-xl z-50">
          <p className="text-[11px] text-gray-300 leading-relaxed">{explanation}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
        </div>
      )}
    </div>
  )
}

// ── Overall performance + contribution bar ────────────────────────────────────

function OverallPerformanceSection({ data }: { data: ModelSelectionResults }) {
  const isRegression = data.primaryMetric === 'MAPE' || data.primaryMetric === 'RMSE'
  const perf = data.performance
  const businessGoal = usePlaygroundStore((s) => s.businessGoal)

  // Compute approximate cohort sizes for contribution bar (from performance order: suff > insuff > helpMe)
  // Rough weights: 70% sufficient, 8% insufficient, 10% helpMe (rest augmented/misc)
  const weights = { sufficient: 70, insufficient: 8, helpMe: 10 }
  const totalW = weights.sufficient + weights.insufficient + weights.helpMe

  return (
    <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Overall Model Performance
      </div>

      {/* Primary + secondary metric */}
      <div className="flex items-center gap-8 mb-4">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{data.primaryMetric}</div>
          <div className="text-3xl font-bold text-white">
            {isRegression ? data.overallRecall : <><CountUpNumber end={data.overallRecall} />%</>}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Primary</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{data.secondaryMetric}</div>
          <div className="text-3xl font-bold text-gray-300">
            {isRegression ? data.overallPrecision : <><CountUpNumber end={data.overallPrecision} />%</>}
          </div>
          <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Secondary</div>
        </div>
        <div className="ml-auto flex items-start gap-2 max-w-xs">
          <MetricEyeTooltip explanation={getMetricExplanation(businessGoal, data.primaryMetric)} />
          <p className="text-[10px] text-gray-500 leading-relaxed italic">{data.metricStatement}</p>
        </div>
      </div>

      {/* 3-colour cohort contribution bar */}
      <div>
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Cohort Contribution to Overall Performance
        </div>
        <div className="flex h-5 rounded-full overflow-hidden gap-px">
          {perf.map((row) => {
            const w = weights[row.category as keyof typeof weights] ?? 0
            const pct = (w / totalW) * 100
            const color =
              row.category === 'sufficient' ? 'bg-emerald-500' :
              row.category === 'insufficient' ? 'bg-red-500' : 'bg-amber-500'
            return (
              <div
                key={row.category}
                className={`flex items-center justify-center text-[9px] font-bold text-white ${color} overflow-hidden`}
                style={{ width: `${pct}%` }}
              >
                {row.recall}%
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 mt-2">
          {perf.map((row) => {
            const color =
              row.category === 'sufficient' ? 'bg-emerald-500' :
              row.category === 'insufficient' ? 'bg-red-500' : 'bg-amber-500'
            const textColor =
              row.category === 'sufficient' ? 'text-emerald-400' :
              row.category === 'insufficient' ? 'text-red-400' : 'text-amber-400'
            const w = weights[row.category as keyof typeof weights] ?? 0
            const pct = (w / totalW) * 100
            return (
              <div key={row.category} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${color}`} />
                <span className={`text-[10px] ${textColor}`}>{row.label} ({pct.toFixed(0)}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Component Card ────────────────────────────────────────────────────────────

function ComponentCard({ comp, delay }: { comp: ModelComponent; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl bg-gray-900 border border-gray-700/60 p-4"
    >
      {/* Name */}
      <div className="text-sm font-bold text-primary mb-0.5 font-mono">{comp.name}</div>
      {/* Subtype label */}
      <div className="text-xs text-gray-500 mb-3">{comp.subtypeLabel}</div>

      {/* Data characteristic factors */}
      <div className="space-y-1">
        {comp.factors.map((f) => (
          <div key={f.name} className="flex items-baseline gap-1.5 text-xs">
            <span className="text-gray-500 shrink-0">·</span>
            <span className="text-gray-400">{f.name}</span>
            <span className={`font-semibold ${levelColor(f.level)}`}>({f.level})</span>
          </div>
        ))}
      </div>

      {/* Technical params */}
      {comp.params.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1.5">
          {comp.params.map((p) => (
            <div key={p.name} className="flex items-start gap-2 text-xs">
              <span className="text-gray-500 shrink-0 min-w-[110px]">{p.name}</span>
              <span className="text-gray-300 font-mono">{p.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Monitoring Dashboard Modal ────────────────────────────────────────────────

function LineChart({
  data, data2, labels, color, color2, height = 80,
}: {
  data: number[]; data2?: number[]; labels: string[]
  color: string; color2?: string; height?: number
}) {
  const w = 400; const h = height
  const allVals = data2 ? [...data, ...data2] : data
  const min = Math.min(...allVals); const max = Math.max(...allVals)
  const pad = 4
  const toX = (i: number) => (i / (data.length - 1)) * (w - pad * 2) + pad
  const toY = (v: number) => h - ((v - min) / (max - min || 1)) * (h - pad * 2) - pad
  const path1 = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ')
  const path2 = data2?.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={pad} y1={h * t} x2={w - pad} y2={h * t}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      {labels.map((l, i) => (
        <text key={l} x={toX(i)} y={h - 1} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)">{l}</text>
      ))}
      <path d={path1} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill={color} />
      ))}
      {path2 && data2 && (
        <>
          <path d={path2} fill="none" stroke={color2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {data2.map((v, i) => (
            <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill={color2} />
          ))}
        </>
      )}
    </svg>
  )
}

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data)
  const w = 400; const h = 80; const pad = 4
  const barW = (w - pad * 2) / data.length - 4
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={pad} y1={h * t} x2={w - pad} y2={h * t}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      {data.map((v, i) => {
        const bh = ((v / max) * (h - pad * 3))
        const x = pad + i * ((w - pad * 2) / data.length) + 2
        const y = h - pad - bh
        return (
          <g key={i}>
            <motion.rect
              x={x} y={y} width={barW} height={bh}
              rx="2" fill={color}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
              style={{ transformOrigin: `${x + barW / 2}px ${h - pad}px` }}
            />
            <text x={x + barW / 2} y={h - 1} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.25)">{labels[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

function MonitoringDashboardModal({ datasetId, datasetName, champion, onClose }: {
  datasetId: string; datasetName: string; champion: string; onClose: () => void
}) {
  const config = getMonitoringConfig(datasetId)
  const [weeksRange, setWeeksRange] = useState<1 | 2 | 3>(2)
  const sliceCount = weeksRange * 7
  const slicedLabels = WEEK_LABELS.slice(21 - sliceCount)
  const slicedPrecision = config.precisionData.slice(21 - sliceCount)
  const slicedRecall = config.recallData.slice(21 - sliceCount)
  const slicedVolume = config.volumeData.slice(21 - sliceCount)
  const slicedLatency = config.latencyData.slice(21 - sliceCount)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 rounded-2xl"
        style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
          style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <Monitor className="w-5 h-5 text-teal-400" />
              <h2 className="text-base font-bold text-white">{datasetName}</h2>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                Healthy
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{champion} · Deployed 7 days ago</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={weeksRange}
              onChange={(e) => setWeeksRange(Number(e.target.value) as 1 | 2 | 3)}
              className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-teal-500"
            >
              <option value={1}>Last week</option>
              <option value={2}>Last 2 weeks</option>
              <option value={3}>Last 3 weeks</option>
            </select>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {config.stats.map((s) => (
              <div key={s.label} className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-[10px] text-gray-500 mb-1">{s.label}</div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-gray-600 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">Pattern Drift Detected</div>
                  <span className="text-[10px] text-red-400">Detected 3 hours ago</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1 inline-block" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                  Critical Alert
                </span>
              </div>
            </div>
            <div className="rounded-lg p-3 mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-semibold text-white mb-1">
                Affected Cohort: <span className="text-gray-300">{config.driftAlert.cohortName}</span>
              </div>
              <div className="text-[10px] text-red-300/70">{config.driftAlert.detail}</div>
            </div>
            <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-semibold text-white mb-1">Impact:</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">{config.driftAlert.metricLabel}: {config.driftAlert.metricValue}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>{config.driftAlert.decrease}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#dc2626' }}>
                <Download className="w-3.5 h-3.5" /> Review Analysis
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-gray-400" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <Sparkles className="w-3.5 h-3.5" /> Trigger Relearning
              </button>
            </div>
          </div>

          <div className="rounded-xl p-4"
            style={{ background: 'rgba(234,179,8,0.05)', border: '1.5px solid rgba(234,179,8,0.2)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(234,179,8,0.15)' }}>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">New Dimension Discovered</div>
                  <span className="text-[10px] text-amber-400">Detected 5 hours ago</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1 inline-block" style={{ background: 'rgba(234,179,8,0.12)', color: '#fbbf24' }}>
                  Medium Alert
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-300 mb-2">
              A new dimension <strong>{config.dimensionAlert.name}</strong> has been identified in production data that was not present during initial model training. This dimension appears in <strong>{config.dimensionAlert.affectedPct}%</strong> of recent records and shows a pattern where risk cases are increasing.
            </p>
            <div className="rounded-lg p-3 mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-semibold text-white mb-1">Dimension Details:</div>
              <div className="text-[10px] text-gray-400">{config.dimensionAlert.detail}</div>
            </div>
            <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-semibold text-white mb-0.5">Expected Impact:</div>
              <div className="text-[10px] text-gray-400">{config.dimensionAlert.impact}</div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#d97706' }}>
                <Download className="w-3.5 h-3.5" /> Review Analysis
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-gray-400" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <Sparkles className="w-3.5 h-3.5" /> Add New Dimension &amp; Relearn
              </button>
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <h4 className="text-sm font-semibold text-white">Performance Metrics</h4>
            </div>
            <p className="text-[10px] text-gray-500 mb-3">Precision and Recall trends — last {weeksRange === 1 ? 'week' : `${weeksRange} weeks`}</p>
            <LineChart data={slicedPrecision} data2={slicedRecall} labels={slicedLabels} color="#06b6d4" color2="#818cf8" height={90} />
            <div className="flex gap-4 mt-2 justify-center">
              {[{ label: 'Precision (%)', color: '#06b6d4' }, { label: 'Recall (%)', color: '#818cf8' }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ background: l.color }} />
                  <span className="text-[10px] text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <h4 className="text-sm font-semibold text-white">Request Volume</h4>
            </div>
            <p className="text-[10px] text-gray-500 mb-3">Prediction requests — last {weeksRange === 1 ? 'week' : `${weeksRange} weeks`}</p>
            <BarChart data={slicedVolume} labels={slicedLabels} color="rgba(20,184,166,0.7)" />
          </div>

          <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Response Latency</h4>
            </div>
            <p className="text-[10px] text-gray-500 mb-3">Average response time — last {weeksRange === 1 ? 'week' : `${weeksRange} weeks`}</p>
            <LineChart data={slicedLatency} labels={slicedLabels} color="#a78bfa" height={80} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ModelSelection() {
  const selectedDataset    = usePlaygroundStore((s) => s.selectedDataset)
  const setModelSelectionResults = usePlaygroundStore((s) => s.setModelSelectionResults)
  const completeStep       = usePlaygroundStore((s) => s.completeStep)
  const addLog             = usePlaygroundStore((s) => s.addLog)
  const setShouldGoHome    = usePlaygroundStore((s) => s.setShouldGoHome)

  const [data, setData] = useState<ModelSelectionResults | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDownloaded, setShowDownloaded] = useState(false)
  const [showMonitor, setShowMonitor] = useState(false)

  useEffect(() => {
    if (!selectedDataset) return
    const results = getPrecomputedModelSelection(selectedDataset.id)
    setData(results)
    setModelSelectionResults(results)
    addLog(`Model selected: ${results.champion} (${results.modelType})`, 'success')
    addLog(`Overall ${results.primaryMetric}: ${results.overallRecall}% · ${results.secondaryMetric}: ${results.overallPrecision}%`, 'info')
  }, [selectedDataset, setModelSelectionResults, addLog])

  const handleDownload = () => {
    setShowDownloaded(true)
    setTimeout(() => setShowDownloaded(false), 3000)
  }

  const handleNext = () => {
    completeStep(6)
    addLog('Model Selection complete. Ready to deploy to production.', 'success')
    setShowModal(true)
  }

  if (!data) return null

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-100">Model Selection &amp; Launch</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Your data profile has been matched to the optimal model architecture. Review the selected model and its components before launching.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900">

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-teal-500/30 bg-gray-800/60 p-5"
          style={{ borderLeft: '4px solid #14b8a6' }}
        >
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-teal-300 mb-1">A Model Built for Your Data</div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Based on your dataset characteristics, validation distribution, and business objective, our system has composed the best-fit model.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Chosen model panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid rgba(59,130,246,0.35)',
            background: 'rgba(59,130,246,0.04)',
            boxShadow: '0 0 30px rgba(59,130,246,0.1)',
          }}
        >
          {/* Model name header */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{
              borderBottom: '1px solid rgba(59,130,246,0.2)',
              background: 'linear-gradient(90deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 100%)',
            }}
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chosen Model</span>
            <span className="px-3 py-1 rounded-full text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 12px rgba(59,130,246,0.4)',
              }}
            >
              {data.champion}
            </span>
            <span className="text-xs text-gray-500 ml-auto">{data.modelType}</span>
          </div>

          {/* 1. Overall Performance + contribution bar */}
          <OverallPerformanceSection data={data} />

          {/* 2. Per-category performance bars */}
          <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Performance by Cohort Type</div>
            <div className="space-y-3">
              {data.performance.map((row, i) => (
                <motion.div
                  key={row.category}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                >
                  <PerformanceRow row={row} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* 3. Model Function description */}
          <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Model Function</div>
            <p className="text-sm text-gray-300 leading-relaxed">{data.modelFunction}</p>
          </div>

          {/* 4. Model Components */}
          <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Model Components</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.components.map((comp, i) => (
                <ComponentCard key={comp.name} comp={comp} delay={i * 0.07} />
              ))}
            </div>
          </div>

          {/* 5. Why this model? */}
          <div className="px-5 py-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Why this model?</div>
            <p className="text-sm text-gray-400 leading-relaxed">{data.whyThisModel}</p>
          </div>
        </motion.div>

        {/* Deployment actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <div
            className="rounded-xl p-5 flex flex-col"
            style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-white">Preview Deployment Guide</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">
              Download the comprehensive deployment guide with rollout strategy, A/B testing configuration, and monitoring setup.
            </p>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}
            >
              <Download className="w-4 h-4" />
              Download Model Deployment Guide
            </button>
          </div>

          <div
            className="rounded-xl p-5 flex flex-col"
            style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">Monitor Your Model in Production</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">
              Track performance metrics, detect pattern drift, and discover new dimensions in real-time.
            </p>
            <button
              onClick={() => setShowMonitor(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <TrendingUp className="w-4 h-4" />
              View Monitoring Dashboard
            </button>
          </div>
        </motion.div>
      </div>

      <BottomActionBar
        onNext={handleNext}
        nextLabel="Complete &amp; Finish"
        alwaysShowNext
      />

      {/* Download toast */}
      <AnimatePresence>
        {showDownloaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'rgba(13,148,136,0.95)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          >
            <Download className="w-4 h-4" />
            Your model deployment guide has been downloaded.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monitoring dashboard modal */}
      <AnimatePresence>
        {showMonitor && (
          <MonitoringDashboardModal
            datasetId={selectedDataset?.id ?? ''}
            datasetName={selectedDataset?.name ?? 'Model'}
            champion={data.champion}
            onClose={() => setShowMonitor(false)}
          />
        )}
      </AnimatePresence>

      <CompletionModal
        isOpen={showModal}
        onStartOver={() => {
          setShowModal(false)
          setShouldGoHome(true)
        }}
      />
    </div>
  )
}
