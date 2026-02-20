import type { ValidationSummaryResults } from '@/store/types'

const SUFF_PCT = 9.9

const validationDataMap: Record<string, ValidationSummaryResults> = {
  'telco-churn': {
    totalCount: 7043,
    totalCohorts: 15,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 88,
      secondaryMetric: 'Precision',
      secondaryValue: 85,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 4950,
      percentage: 70.3,
      cohorts: [
        { name: 'Contract=Month-to-month', totalCount: 3875, validationSamples: 384, samplingPct: SUFF_PCT },
        { name: 'tenure in [0, 12]', totalCount: 2175, validationSamples: 215, samplingPct: SUFF_PCT },
        { name: 'InternetService=Fiber optic', totalCount: 3096, validationSamples: 307, samplingPct: SUFF_PCT },
        { name: 'MonthlyCharges in [65, 95]', totalCount: 2448, validationSamples: 242, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 598,
      percentage: 8.5,
      cohorts: [
        { name: 'SeniorCitizen=1 AND no Dependents', totalCount: 389, validationSamples: 97, samplingPct: 24.9 },
        { name: 'MultipleLines=No phone service', totalCount: 209, validationSamples: 75, samplingPct: 35.9 },
      ],
    },
    helpMe: {
      count: 312,
      percentage: 4.4,
      cohorts: [
        { name: 'Mid-Tenure Mixed Signals (12–24 mo)', totalCount: 312, validationSamples: 60, samplingPct: 19.2 },
      ],
    },
    augmented: {
      count: 42,
      percentage: 0.6,
      cohorts: [
        { name: 'SeniorCitizen=1 AND no Dependents [augmented]', totalCount: 24, validationSamples: 0, samplingPct: 0 },
        { name: 'MultipleLines=No phone service [augmented]', totalCount: 18, validationSamples: 2, samplingPct: 11.1 },
      ],
    },
  },

  'credit-fraud': {
    totalCount: 50000,
    totalCohorts: 18,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 91,
      secondaryMetric: 'Precision',
      secondaryValue: 88,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 36000,
      percentage: 72.0,
      cohorts: [
        { name: 'Amount in [0, 50]', totalCount: 18420, validationSamples: 1824, samplingPct: SUFF_PCT },
        { name: 'V14 < -8 (fraud cluster)', totalCount: 850, validationSamples: 84, samplingPct: SUFF_PCT },
        { name: 'V17 < -5 (anomalous)', totalCount: 1104, validationSamples: 109, samplingPct: SUFF_PCT },
        { name: 'Amount in [50, 500]', totalCount: 22410, validationSamples: 2219, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 3300,
      percentage: 6.6,
      cohorts: [
        { name: 'Amount > 5000 (high value)', totalCount: 186, validationSamples: 84, samplingPct: 45.2 },
        { name: 'V12 < -15 AND V14 < -15', totalCount: 94, validationSamples: 59, samplingPct: 62.8 },
        { name: 'Rare transaction pattern', totalCount: 212, validationSamples: 80, samplingPct: 37.7 },
      ],
    },
    helpMe: {
      count: 4500,
      percentage: 9.0,
      cohorts: [
        { name: 'V10 mixed signal range ($200-$500)', totalCount: 447, validationSamples: 86, samplingPct: 19.2 },
      ],
    },
    augmented: {
      count: 88,
      percentage: 0.2,
      cohorts: [
        { name: 'Amount > 5000 [augmented]', totalCount: 48, validationSamples: 0, samplingPct: 0 },
        { name: 'V12 < -15 AND V14 < -15 [augmented]', totalCount: 40, validationSamples: 5, samplingPct: 12.5 },
      ],
    },
  },

  'store-demand': {
    totalCount: 45000,
    totalCohorts: 16,
    overallMetrics: {
      primaryMetric: 'MAPE',
      primaryValue: 11,
      secondaryMetric: 'RMSE',
      secondaryValue: 142,
      statement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    },
    sufficient: {
      count: 31500,
      percentage: 70.0,
      cohorts: [
        { name: 'dayofweek in [0, 4] (weekday)', totalCount: 32175, validationSamples: 3185, samplingPct: SUFF_PCT },
        { name: 'month in [11, 12] (holiday season)', totalCount: 7560, validationSamples: 749, samplingPct: SUFF_PCT },
        { name: 'onpromotion=True', totalCount: 11200, validationSamples: 1109, samplingPct: SUFF_PCT },
        { name: 'store cluster=A', totalCount: 9840, validationSamples: 975, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 3330,
      percentage: 7.4,
      cohorts: [
        { name: 'transferred=True (holiday)', totalCount: 310, validationSamples: 108, samplingPct: 34.8 },
        { name: 'city=remote region', totalCount: 445, validationSamples: 156, samplingPct: 35.1 },
        { name: 'dcoilwtico > 90 (high oil)', totalCount: 280, validationSamples: 116, samplingPct: 41.4 },
      ],
    },
    helpMe: {
      count: 1710,
      percentage: 3.8,
      cohorts: [
        { name: 'Holiday transfer day ambiguous', totalCount: 380, validationSamples: 76, samplingPct: 20.0 },
      ],
    },
    augmented: {
      count: 56,
      percentage: 0.1,
      cohorts: [
        { name: 'transferred=True (holiday) [augmented]', totalCount: 32, validationSamples: 0, samplingPct: 0 },
        { name: 'dcoilwtico > 90 [augmented]', totalCount: 24, validationSamples: 3, samplingPct: 12.5 },
      ],
    },
  },

  'patient-readmission': {
    totalCount: 25000,
    totalCohorts: 17,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 85,
      secondaryMetric: 'Precision',
      secondaryValue: 81,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 17500,
      percentage: 70.0,
      cohorts: [
        { name: 'time_in_hospital in [3, 7]', totalCount: 10840, validationSamples: 1073, samplingPct: SUFF_PCT },
        { name: 'num_medications in [10, 20]', totalCount: 9210, validationSamples: 912, samplingPct: SUFF_PCT },
        { name: 'insulin=Steady', totalCount: 5970, validationSamples: 591, samplingPct: SUFF_PCT },
        { name: 'diabetesMed=Yes', totalCount: 17460, validationSamples: 1729, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 1675,
      percentage: 6.7,
      cohorts: [
        { name: 'age=[90-100]', totalCount: 312, validationSamples: 109, samplingPct: 34.9 },
        { name: 'num_medications > 25', totalCount: 284, validationSamples: 116, samplingPct: 40.8 },
      ],
    },
    helpMe: {
      count: 2350,
      percentage: 9.4,
      cohorts: [
        { name: 'diag_1 mixed (rare codes)', totalCount: 520, validationSamples: 104, samplingPct: 20.0 },
      ],
    },
    augmented: {
      count: 64,
      percentage: 0.3,
      cohorts: [
        { name: 'age=[90-100] [augmented]', totalCount: 36, validationSamples: 0, samplingPct: 0 },
        { name: 'num_medications > 25 [augmented]', totalCount: 28, validationSamples: 4, samplingPct: 14.3 },
      ],
    },
  },

  'employee-attrition': {
    totalCount: 14999,
    totalCohorts: 14,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 82,
      secondaryMetric: 'Precision',
      secondaryValue: 79,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 10500,
      percentage: 70.0,
      cohorts: [
        { name: 'OverTime=Yes', totalCount: 5269, validationSamples: 522, samplingPct: SUFF_PCT },
        { name: 'YearsAtCompany in [0, 3]', totalCount: 4210, validationSamples: 417, samplingPct: SUFF_PCT },
        { name: 'JobSatisfaction=1 (low)', totalCount: 3580, validationSamples: 354, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 1215,
      percentage: 8.1,
      cohorts: [
        { name: 'JobRole=Human Resources', totalCount: 325, validationSamples: 117, samplingPct: 36.0 },
        { name: 'StockOptionLevel=3 AND low pay', totalCount: 218, validationSamples: 94, samplingPct: 43.1 },
      ],
    },
    helpMe: {
      count: 1850,
      percentage: 12.3,
      cohorts: [
        { name: 'Promoted-but-dissatisfied segment', totalCount: 412, validationSamples: 78, samplingPct: 18.9 },
      ],
    },
    augmented: {
      count: 52,
      percentage: 0.3,
      cohorts: [
        { name: 'JobRole=Human Resources [augmented]', totalCount: 30, validationSamples: 0, samplingPct: 0 },
        { name: 'StockOptionLevel=3 AND low pay [augmented]', totalCount: 22, validationSamples: 3, samplingPct: 13.6 },
      ],
    },
  },

  'energy-consumption': {
    totalCount: 35040,
    totalCohorts: 19,
    overallMetrics: {
      primaryMetric: 'MAPE',
      primaryValue: 8,
      secondaryMetric: 'RMSE',
      secondaryValue: 94,
      statement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    },
    sufficient: {
      count: 24380,
      percentage: 69.6,
      cohorts: [
        { name: 'hour in [7, 20] (peak hours)', totalCount: 18480, validationSamples: 1830, samplingPct: SUFF_PCT },
        { name: 'is_weekend=False', totalCount: 24640, validationSamples: 2439, samplingPct: SUFF_PCT },
        { name: 'temperature in [15, 30]', totalCount: 14200, validationSamples: 1406, samplingPct: SUFF_PCT },
        { name: 'month in [6, 8] (summer)', totalCount: 7560, validationSamples: 749, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 2700,
      percentage: 7.7,
      cohorts: [
        { name: 'demand_response_active=True', totalCount: 420, validationSamples: 151, samplingPct: 35.9 },
        { name: 'temperature < -5 (extreme cold)', totalCount: 380, validationSamples: 144, samplingPct: 37.9 },
        { name: 'solar_irradiance > 900', totalCount: 190, validationSamples: 116, samplingPct: 61.1 },
      ],
    },
    helpMe: {
      count: 6450,
      percentage: 18.4,
      cohorts: [
        { name: 'Spring/Autumn transitional hours', totalCount: 1840, validationSamples: 349, samplingPct: 19.0 },
      ],
    },
    augmented: {
      count: 72,
      percentage: 0.2,
      cohorts: [
        { name: 'solar_irradiance > 900 [augmented]', totalCount: 40, validationSamples: 0, samplingPct: 0 },
        { name: 'temperature < -5 [augmented]', totalCount: 32, validationSamples: 4, samplingPct: 12.5 },
      ],
    },
  },

  'insurance-claims': {
    totalCount: 40000,
    totalCohorts: 16,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 87,
      secondaryMetric: 'Precision',
      secondaryValue: 84,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 28000,
      percentage: 70.0,
      cohorts: [
        { name: 'incident_severity=Major Damage', totalCount: 10240, validationSamples: 1014, samplingPct: SUFF_PCT },
        { name: 'collision_type=Rear Collision', totalCount: 8760, validationSamples: 867, samplingPct: SUFF_PCT },
        { name: 'authorities_contacted=Police', totalCount: 14320, validationSamples: 1418, samplingPct: SUFF_PCT },
        { name: 'total_claim_amount in [10k, 60k]', totalCount: 18400, validationSamples: 1822, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 2720,
      percentage: 6.8,
      cohorts: [
        { name: 'incident_type=Parked Car', totalCount: 390, validationSamples: 140, samplingPct: 35.9 },
        { name: 'bodily_injuries=2 AND witnesses=0', totalCount: 276, validationSamples: 118, samplingPct: 42.8 },
      ],
    },
    helpMe: {
      count: 4160,
      percentage: 10.4,
      cohorts: [
        { name: 'insured_hobbies mixed signal', totalCount: 480, validationSamples: 91, samplingPct: 18.9 },
      ],
    },
    augmented: {
      count: 68,
      percentage: 0.2,
      cohorts: [
        { name: 'incident_type=Parked Car [augmented]', totalCount: 40, validationSamples: 0, samplingPct: 0 },
        { name: 'bodily_injuries=2 AND witnesses=0 [augmented]', totalCount: 28, validationSamples: 4, samplingPct: 14.3 },
      ],
    },
  },

  'predictive-maintenance': {
    totalCount: 50000,
    totalCohorts: 18,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 88,
      secondaryMetric: 'Precision',
      secondaryValue: 85,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 35000,
      percentage: 70.0,
      cohorts: [
        { name: 'Normal operating state', totalCount: 34500, validationSamples: 3415, samplingPct: SUFF_PCT },
        { name: 'Pre-failure degradation (48h window)', totalCount: 8200, validationSamples: 812, samplingPct: SUFF_PCT },
        { name: 'Post-maintenance warm-up', totalCount: 5100, validationSamples: 505, samplingPct: SUFF_PCT },
        { name: 'vibration in [4.5, 7.0] mm/s', totalCount: 12400, validationSamples: 1228, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 3350,
      percentage: 6.7,
      cohorts: [
        { name: 'Catastrophic sudden failures', totalCount: 380, validationSamples: 144, samplingPct: 37.9 },
        { name: 'Extreme environmental events', totalCount: 290, validationSamples: 124, samplingPct: 42.8 },
      ],
    },
    helpMe: {
      count: 7100,
      percentage: 14.2,
      cohorts: [
        { name: 'Intermittent fault oscillators', totalCount: 1420, validationSamples: 284, samplingPct: 20.0 },
      ],
    },
    augmented: {
      count: 78,
      percentage: 0.2,
      cohorts: [
        { name: 'Catastrophic sudden failures [augmented]', totalCount: 44, validationSamples: 0, samplingPct: 0 },
        { name: 'Extreme environmental events [augmented]', totalCount: 34, validationSamples: 5, samplingPct: 14.7 },
      ],
    },
  },
}

export function getPrecomputedValidation(datasetId: string): ValidationSummaryResults {
  return validationDataMap[datasetId] ?? validationDataMap['telco-churn']
}
