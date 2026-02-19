import type { ValidationSummaryResults } from '@/store/types'

const SAMPLING_PCT = 9.9

const validationDataMap: Record<string, ValidationSummaryResults> = {
  'telco-churn': {
    totalCount: 7043,
    totalCohorts: 15,
    sufficient: {
      count: 4950,
      percentage: 70.3,
      cohorts: [
        { name: 'Contract=Month-to-month', totalCount: 3875, validationSamples: 384, samplingPct: SAMPLING_PCT },
        { name: 'tenure in [0, 12]', totalCount: 2175, validationSamples: 215, samplingPct: SAMPLING_PCT },
        { name: 'InternetService=Fiber optic', totalCount: 3096, validationSamples: 307, samplingPct: SAMPLING_PCT },
        { name: 'MonthlyCharges in [65, 95]', totalCount: 2448, validationSamples: 242, samplingPct: SAMPLING_PCT },
      ],
    },
    insufficient: {
      count: 598,
      percentage: 8.5,
      cohorts: [
        { name: 'SeniorCitizen=1 & no Dependents', totalCount: 389, validationSamples: 39, samplingPct: SAMPLING_PCT },
        { name: 'MultipleLines=No phone service', totalCount: 209, validationSamples: 21, samplingPct: SAMPLING_PCT },
      ],
    },
    helpMe: {
      count: 312,
      percentage: 4.4,
      cohorts: [
        { name: 'Mid-Tenure Mixed Signals (12-24mo)', totalCount: 312, validationSamples: 31, samplingPct: SAMPLING_PCT },
      ],
    },
    augmented: {
      count: 0,
      percentage: 0,
      cohorts: [],
    },
  },

  'credit-fraud': {
    totalCount: 50000,
    totalCohorts: 18,
    sufficient: {
      count: 36000,
      percentage: 72.0,
      cohorts: [
        { name: 'Amount in [0, 50]', totalCount: 18420, validationSamples: 1824, samplingPct: SAMPLING_PCT },
        { name: 'V14 < -8 (fraud cluster)', totalCount: 850, validationSamples: 84, samplingPct: SAMPLING_PCT },
        { name: 'V17 < -5 (anomalous)', totalCount: 1104, validationSamples: 109, samplingPct: SAMPLING_PCT },
        { name: 'Amount in [50, 500]', totalCount: 22410, validationSamples: 2219, samplingPct: SAMPLING_PCT },
      ],
    },
    insufficient: {
      count: 3300,
      percentage: 6.6,
      cohorts: [
        { name: 'Amount > 5000 (high value)', totalCount: 186, validationSamples: 18, samplingPct: SAMPLING_PCT },
        { name: 'V12 < -15 & V14 < -15', totalCount: 94, validationSamples: 9, samplingPct: SAMPLING_PCT },
        { name: 'Rare transaction pattern', totalCount: 212, validationSamples: 21, samplingPct: SAMPLING_PCT },
      ],
    },
    helpMe: {
      count: 4500,
      percentage: 9.0,
      cohorts: [
        { name: 'V10 mixed signal range ($200-$500)', totalCount: 447, validationSamples: 44, samplingPct: SAMPLING_PCT },
      ],
    },
    augmented: {
      count: 0,
      percentage: 0,
      cohorts: [],
    },
  },

  'store-demand': {
    totalCount: 45000,
    totalCohorts: 16,
    sufficient: {
      count: 31500,
      percentage: 70.0,
      cohorts: [
        { name: 'dayofweek in [0, 4] (weekday)', totalCount: 32175, validationSamples: 3185, samplingPct: SAMPLING_PCT },
        { name: 'month in [11, 12] (holiday season)', totalCount: 7560, validationSamples: 749, samplingPct: SAMPLING_PCT },
        { name: 'onpromotion=True', totalCount: 11200, validationSamples: 1109, samplingPct: SAMPLING_PCT },
        { name: 'store cluster=A', totalCount: 9840, validationSamples: 975, samplingPct: SAMPLING_PCT },
      ],
    },
    insufficient: {
      count: 3330,
      percentage: 7.4,
      cohorts: [
        { name: 'transferred=True (holiday)', totalCount: 310, validationSamples: 31, samplingPct: SAMPLING_PCT },
        { name: 'city=remote region', totalCount: 445, validationSamples: 44, samplingPct: SAMPLING_PCT },
        { name: 'dcoilwtico > 90 (high oil)', totalCount: 280, validationSamples: 28, samplingPct: SAMPLING_PCT },
      ],
    },
    helpMe: {
      count: 1710,
      percentage: 3.8,
      cohorts: [
        { name: 'Holiday transfer day ambiguous', totalCount: 380, validationSamples: 38, samplingPct: SAMPLING_PCT },
      ],
    },
    augmented: {
      count: 0,
      percentage: 0,
      cohorts: [],
    },
  },

  'patient-readmission': {
    totalCount: 25000,
    totalCohorts: 17,
    sufficient: {
      count: 17500,
      percentage: 70.0,
      cohorts: [
        { name: 'time_in_hospital in [3, 7]', totalCount: 10840, validationSamples: 1073, samplingPct: SAMPLING_PCT },
        { name: 'num_medications in [10, 20]', totalCount: 9210, validationSamples: 912, samplingPct: SAMPLING_PCT },
        { name: 'insulin=Steady', totalCount: 5970, validationSamples: 591, samplingPct: SAMPLING_PCT },
        { name: 'diabetesMed=Yes', totalCount: 17460, validationSamples: 1729, samplingPct: SAMPLING_PCT },
      ],
    },
    insufficient: {
      count: 1675,
      percentage: 6.7,
      cohorts: [
        { name: 'age=[90-100]', totalCount: 312, validationSamples: 31, samplingPct: SAMPLING_PCT },
        { name: 'num_medications > 25', totalCount: 284, validationSamples: 28, samplingPct: SAMPLING_PCT },
      ],
    },
    helpMe: {
      count: 2350,
      percentage: 9.4,
      cohorts: [
        { name: 'diag_1 mixed (rare codes)', totalCount: 520, validationSamples: 51, samplingPct: SAMPLING_PCT },
      ],
    },
    augmented: {
      count: 0,
      percentage: 0,
      cohorts: [],
    },
  },

  'employee-attrition': {
    totalCount: 14999,
    totalCohorts: 14,
    sufficient: {
      count: 10500,
      percentage: 70.0,
      cohorts: [
        { name: 'OverTime=Yes', totalCount: 5269, validationSamples: 522, samplingPct: SAMPLING_PCT },
        { name: 'YearsAtCompany in [0, 3]', totalCount: 4210, validationSamples: 417, samplingPct: SAMPLING_PCT },
        { name: 'JobSatisfaction=1 (low)', totalCount: 3580, validationSamples: 354, samplingPct: SAMPLING_PCT },
      ],
    },
    insufficient: {
      count: 1215,
      percentage: 8.1,
      cohorts: [
        { name: 'JobRole=Human Resources', totalCount: 325, validationSamples: 32, samplingPct: SAMPLING_PCT },
        { name: 'StockOptionLevel=3 & low pay', totalCount: 218, validationSamples: 22, samplingPct: SAMPLING_PCT },
      ],
    },
    helpMe: {
      count: 1850,
      percentage: 12.3,
      cohorts: [
        { name: 'Promoted-but-dissatisfied segment', totalCount: 412, validationSamples: 41, samplingPct: SAMPLING_PCT },
      ],
    },
    augmented: {
      count: 0,
      percentage: 0,
      cohorts: [],
    },
  },

  'energy-consumption': {
    totalCount: 35040,
    totalCohorts: 19,
    sufficient: {
      count: 24380,
      percentage: 69.6,
      cohorts: [
        { name: 'hour in [7, 20] (peak hours)', totalCount: 18480, validationSamples: 1830, samplingPct: SAMPLING_PCT },
        { name: 'is_weekend=False', totalCount: 24640, validationSamples: 2439, samplingPct: SAMPLING_PCT },
        { name: 'temperature in [15, 30]', totalCount: 14200, validationSamples: 1406, samplingPct: SAMPLING_PCT },
        { name: 'month in [6, 8] (summer)', totalCount: 7560, validationSamples: 749, samplingPct: SAMPLING_PCT },
      ],
    },
    insufficient: {
      count: 2700,
      percentage: 7.7,
      cohorts: [
        { name: 'demand_response_active=True', totalCount: 420, validationSamples: 42, samplingPct: SAMPLING_PCT },
        { name: 'temperature < -5 (extreme cold)', totalCount: 380, validationSamples: 38, samplingPct: SAMPLING_PCT },
        { name: 'solar_irradiance > 900', totalCount: 190, validationSamples: 19, samplingPct: SAMPLING_PCT },
      ],
    },
    helpMe: {
      count: 6450,
      percentage: 18.4,
      cohorts: [
        { name: 'Spring/Autumn transitional hours', totalCount: 1840, validationSamples: 182, samplingPct: SAMPLING_PCT },
      ],
    },
    augmented: {
      count: 0,
      percentage: 0,
      cohorts: [],
    },
  },

  'insurance-claims': {
    totalCount: 40000,
    totalCohorts: 16,
    sufficient: {
      count: 28000,
      percentage: 70.0,
      cohorts: [
        { name: 'incident_severity=Major Damage', totalCount: 10240, validationSamples: 1014, samplingPct: SAMPLING_PCT },
        { name: 'collision_type=Rear Collision', totalCount: 8760, validationSamples: 867, samplingPct: SAMPLING_PCT },
        { name: 'authorities_contacted=Police', totalCount: 14320, validationSamples: 1418, samplingPct: SAMPLING_PCT },
        { name: 'total_claim_amount in [10k, 60k]', totalCount: 18400, validationSamples: 1822, samplingPct: SAMPLING_PCT },
      ],
    },
    insufficient: {
      count: 2720,
      percentage: 6.8,
      cohorts: [
        { name: 'incident_type=Parked Car', totalCount: 390, validationSamples: 39, samplingPct: SAMPLING_PCT },
        { name: 'bodily_injuries=2 & witnesses=0', totalCount: 276, validationSamples: 27, samplingPct: SAMPLING_PCT },
      ],
    },
    helpMe: {
      count: 4160,
      percentage: 10.4,
      cohorts: [
        { name: 'insured_hobbies mixed signal', totalCount: 480, validationSamples: 48, samplingPct: SAMPLING_PCT },
      ],
    },
    augmented: {
      count: 0,
      percentage: 0,
      cohorts: [],
    },
  },

  'predictive-maintenance': {
    totalCount: 50000,
    totalCohorts: 18,
    sufficient: {
      count: 35000,
      percentage: 70.0,
      cohorts: [
        { name: 'Normal operating state', totalCount: 34500, validationSamples: 3415, samplingPct: SAMPLING_PCT },
        { name: 'Pre-failure degradation (48h window)', totalCount: 8200, validationSamples: 812, samplingPct: SAMPLING_PCT },
        { name: 'Post-maintenance warm-up', totalCount: 5100, validationSamples: 505, samplingPct: SAMPLING_PCT },
        { name: 'vibration in [4.5, 7.0]mm/s', totalCount: 12400, validationSamples: 1228, samplingPct: SAMPLING_PCT },
      ],
    },
    insufficient: {
      count: 3350,
      percentage: 6.7,
      cohorts: [
        { name: 'Catastrophic sudden failures', totalCount: 380, validationSamples: 38, samplingPct: SAMPLING_PCT },
        { name: 'Extreme environmental events', totalCount: 290, validationSamples: 29, samplingPct: SAMPLING_PCT },
      ],
    },
    helpMe: {
      count: 7100,
      percentage: 14.2,
      cohorts: [
        { name: 'Intermittent fault oscillators', totalCount: 1420, validationSamples: 141, samplingPct: SAMPLING_PCT },
      ],
    },
    augmented: {
      count: 0,
      percentage: 0,
      cohorts: [],
    },
  },
}

export function getPrecomputedValidation(datasetId: string): ValidationSummaryResults {
  return validationDataMap[datasetId] ?? validationDataMap['telco-churn']
}
