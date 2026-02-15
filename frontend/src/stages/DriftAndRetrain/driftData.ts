import type { DriftSimulation, DriftWeek, ModelMetrics } from '@/store/types'

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function generateDistribution(mean: number, spread: number, n: number): number[] {
  return Array.from({ length: n }, () => {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + z * spread
  })
}

function buildWeeks(
  healthyMetrics: ModelMetrics,
  criticalMetrics: ModelMetrics,
  features: string[],
): DriftWeek[] {
  const weeks: DriftWeek[] = []

  for (let w = 1; w <= 12; w++) {
    let health: 'healthy' | 'warning' | 'critical'
    let t: number

    if (w <= 4) {
      health = 'healthy'
      t = (w - 1) / 12
    } else if (w <= 8) {
      health = 'warning'
      t = (w - 1) / 12
    } else {
      health = 'critical'
      t = (w - 1) / 12
    }

    const metrics: ModelMetrics = {
      accuracy: lerp(healthyMetrics.accuracy, criticalMetrics.accuracy, t),
      precision: lerp(healthyMetrics.precision, criticalMetrics.precision, t),
      recall: lerp(healthyMetrics.recall, criticalMetrics.recall, t),
      f1: lerp(healthyMetrics.f1, criticalMetrics.f1, t),
      auc: lerp(healthyMetrics.auc, criticalMetrics.auc, t),
    }

    const driftScore = t * 0.8 + (Math.random() * 0.05)

    const psiValues = features.map((feature) => {
      const basePsi = t * 0.5 + (Math.random() * 0.1)
      const psi = Math.max(0, basePsi)
      return {
        feature,
        psi: parseFloat(psi.toFixed(3)),
        status: (psi > 0.25 ? 'fail' : 'pass') as 'pass' | 'fail',
      }
    })

    // Distribution shift for top 3 features
    const distributions = features.slice(0, 3).map((feature) => {
      const original = generateDistribution(50, 10, 20).map((v) => Math.round(Math.max(0, v)))
      const shift = t * 20
      const current = generateDistribution(50 + shift, 10 + t * 5, 20).map((v) =>
        Math.round(Math.max(0, v))
      )
      return { feature, original, current }
    })

    weeks.push({
      week: w,
      health,
      metrics,
      driftScore: parseFloat(driftScore.toFixed(3)),
      psiValues,
      distributions,
    })
  }

  return weeks
}

// ---- Telco Churn ----
const telcoDrift: DriftSimulation = {
  weeks: buildWeeks(
    { accuracy: 0.873, precision: 0.781, recall: 0.694, f1: 0.735, auc: 0.912 },
    { accuracy: 0.741, precision: 0.628, recall: 0.542, f1: 0.582, auc: 0.779 },
    ['tenure', 'Contract_Month-to-month', 'MonthlyCharges', 'TotalCharges', 'InternetService_Fiber', 'PaymentMethod_Electronic']
  ),
  retrainingResult: {
    oldMetrics: { accuracy: 0.741, precision: 0.628, recall: 0.542, f1: 0.582, auc: 0.779 },
    newMetrics: { accuracy: 0.881, precision: 0.792, recall: 0.706, f1: 0.747, auc: 0.921 },
    improvement: 18.2,
  },
}

// ---- Credit Fraud ----
const creditDrift: DriftSimulation = {
  weeks: buildWeeks(
    { accuracy: 0.995, precision: 0.961, recall: 0.856, f1: 0.906, auc: 0.991 },
    { accuracy: 0.962, precision: 0.843, recall: 0.691, f1: 0.760, auc: 0.932 },
    ['V14', 'V17', 'V12', 'Amount_log', 'V10', 'hour_of_day']
  ),
  retrainingResult: {
    oldMetrics: { accuracy: 0.962, precision: 0.843, recall: 0.691, f1: 0.760, auc: 0.932 },
    newMetrics: { accuracy: 0.996, precision: 0.968, recall: 0.871, f1: 0.917, auc: 0.993 },
    improvement: 6.5,
  },
}

// ---- Store Demand ----
const storeDrift: DriftSimulation = {
  weeks: buildWeeks(
    { accuracy: 0.912, precision: 0.901, recall: 0.889, f1: 0.895, auc: 0.952 },
    { accuracy: 0.798, precision: 0.774, recall: 0.756, f1: 0.765, auc: 0.842 },
    ['day_of_week', 'is_promotion', 'lag_7_sales', 'rolling_mean_30', 'store_id_encoded', 'month']
  ),
  retrainingResult: {
    oldMetrics: { accuracy: 0.798, precision: 0.774, recall: 0.756, f1: 0.765, auc: 0.842 },
    newMetrics: { accuracy: 0.918, precision: 0.907, recall: 0.894, f1: 0.900, auc: 0.957 },
    improvement: 13.7,
  },
}

// ---- Patient Readmission ----
const patientDrift: DriftSimulation = {
  weeks: buildWeeks(
    { accuracy: 0.798, precision: 0.712, recall: 0.648, f1: 0.679, auc: 0.847 },
    { accuracy: 0.681, precision: 0.584, recall: 0.512, f1: 0.546, auc: 0.721 },
    ['num_procedures', 'days_in_hospital', 'num_medications', 'num_diagnoses', 'age_group', 'comorbidity_score']
  ),
  retrainingResult: {
    oldMetrics: { accuracy: 0.681, precision: 0.584, recall: 0.512, f1: 0.546, auc: 0.721 },
    newMetrics: { accuracy: 0.808, precision: 0.724, recall: 0.661, f1: 0.691, auc: 0.858 },
    improvement: 19.0,
  },
}

const driftDataMap: Record<string, DriftSimulation> = {
  'telco-churn': telcoDrift,
  'credit-fraud': creditDrift,
  'store-demand': storeDrift,
  'patient-readmission': patientDrift,
}

export function getPrecomputedDrift(datasetId: string): DriftSimulation {
  return driftDataMap[datasetId] || telcoDrift
}
