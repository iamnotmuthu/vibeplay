import type { ValidationSummaryResults } from '@/store/types'

const SUFF_PCT = 9.9

const validationDataMap: Record<string, ValidationSummaryResults> = {
  'telco-churn': {
    totalCount: 7085, // 6133 + 598 + 312 + 42 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 88,
      secondaryMetric: 'Precision',
      secondaryValue: 85,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 6133,
      percentage: 86.6, // 6133/7085
      actionStatement: 'These churn-risk cohorts are production-ready — no further action needed.',
      cohorts: [
        { name: 'Month-to-Month Churners', totalCount: 2987, validationSamples: 296, samplingPct: SUFF_PCT },
        { name: 'Loyal Long-Term Customers', totalCount: 2105, validationSamples: 208, samplingPct: SUFF_PCT },
        { name: 'Budget DSL Users', totalCount: 1041, validationSamples: 103, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 598,
      percentage: 8.4, // 598/7085
      actionStatement: 'Consider collecting more data for these subscriber segments to improve churn prediction coverage.',
      cohorts: [
        { name: 'Senior No-Dependents Niche', totalCount: 389, validationSamples: 97, samplingPct: 24.9 },
        { name: 'No-Phone Internet Only', totalCount: 209, validationSamples: 75, samplingPct: 35.9 },
      ],
    },
    helpMe: {
      count: 312,
      percentage: 4.4, // 312/7085
      actionStatement: 'Flag these mid-tenure subscribers for human review — the model cannot confidently predict their churn behavior.',
      cohorts: [
        { name: 'Mid-Tenure Switchers', totalCount: 312, validationSamples: 60, samplingPct: 19.2 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'credit-fraud': {
    totalCount: 50088, // 49273 + 280 + 447 + 88 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 91,
      secondaryMetric: 'Precision',
      secondaryValue: 88,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 49273,
      percentage: 98.4, // 49273/50088
      actionStatement: 'Strong coverage confirms these transaction patterns drive reliable fraud detection.',
      cohorts: [
        { name: 'Standard Low-Value Transactions', totalCount: 37773, validationSamples: 3740, samplingPct: SUFF_PCT },
        { name: 'High-Value Verified Purchases', totalCount: 10650, validationSamples: 1054, samplingPct: SUFF_PCT },
        { name: 'Fraud Ring Signatures', totalCount: 850, validationSamples: 84, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 280,
      percentage: 0.6, // 280/50088
      actionStatement: 'Low sample counts in high-value and rare transaction cohorts may affect fraud detection — augmentation recommended.',
      cohorts: [
        { name: 'Ultra-High Value Anomalies', totalCount: 186, validationSamples: 84, samplingPct: 45.2 },
        { name: 'Cross-Feature Extreme Cases', totalCount: 94, validationSamples: 28, samplingPct: 29.8 },
      ],
    },
    helpMe: {
      count: 447,
      percentage: 0.9, // 447/50088
      actionStatement: 'Mixed signals detected in mid-range transactions — configure a manual review workflow for these edge cases.',
      cohorts: [
        { name: 'Mixed-Signal Mid-Value Transactions', totalCount: 447, validationSamples: 86, samplingPct: 19.2 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'store-demand': {
    totalCount: 45056, // 43865 + 755 + 380 + 56 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'MAPE',
      primaryValue: 11,
      secondaryMetric: 'RMSE',
      secondaryValue: 142,
      statement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    },
    sufficient: {
      count: 43865,
      percentage: 97.4, // 43865/45056
      actionStatement: 'These demand cohorts are production-ready — weekday, seasonal, and promotional patterns are well-represented.',
      cohorts: [
        { name: 'Weekday Standard Demand', totalCount: 25105, validationSamples: 2485, samplingPct: SUFF_PCT },
        { name: 'Promotional Sales Spikes', totalCount: 11200, validationSamples: 1109, samplingPct: SUFF_PCT },
        { name: 'Holiday Season Surge', totalCount: 7560, validationSamples: 749, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 755,
      percentage: 1.7, // 755/45056
      actionStatement: 'Consider augmenting these cohorts or collecting additional sales data from remote regions and volatile oil-price periods.',
      cohorts: [
        { name: 'Remote Region Stores', totalCount: 445, validationSamples: 156, samplingPct: 35.1 },
        { name: 'High Oil-Price Demand Sensitivity', totalCount: 310, validationSamples: 108, samplingPct: 34.8 },
      ],
    },
    helpMe: {
      count: 380,
      percentage: 0.8, // 380/45056
      actionStatement: 'Flag holiday transfer days for human review — ambiguous demand signals prevent reliable forecasting.',
      cohorts: [
        { name: 'Holiday Transfer Days', totalCount: 380, validationSamples: 76, samplingPct: 20.0 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'patient-readmission': {
    totalCount: 25064, // 23884 + 596 + 520 + 64 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 85,
      secondaryMetric: 'Precision',
      secondaryValue: 81,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 23884,
      percentage: 95.3, // 23884/25064
      actionStatement: 'These patient cohorts are production-ready — readmission predictions are reliable for standard hospital stays and medication profiles.',
      cohorts: [
        { name: 'Standard Recovery Path', totalCount: 11584, validationSamples: 1147, samplingPct: SUFF_PCT },
        { name: 'Chronic Condition Patients', totalCount: 7200, validationSamples: 713, samplingPct: SUFF_PCT },
        { name: 'Post-Surgical Rehabilitation', totalCount: 5100, validationSamples: 505, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 596,
      percentage: 2.4, // 596/25064
      actionStatement: 'Low sample counts for elderly patients and high-medication cases may affect readmission prediction — augmentation recommended.',
      cohorts: [
        { name: 'Centenarian Patients', totalCount: 312, validationSamples: 109, samplingPct: 34.9 },
        { name: 'Complex Polypharmacy Cases', totalCount: 284, validationSamples: 116, samplingPct: 40.8 },
      ],
    },
    helpMe: {
      count: 520,
      percentage: 2.1, // 520/25064
      actionStatement: 'Flag patients with rare diagnosis codes for clinical review — the model\'s confidence is too low for autonomous discharge decisions.',
      cohorts: [
        { name: 'Mixed Rare Diagnosis Cluster', totalCount: 520, validationSamples: 104, samplingPct: 20.0 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'employee-attrition': {
    totalCount: 15051, // 14044 + 543 + 412 + 52 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 82,
      secondaryMetric: 'Precision',
      secondaryValue: 79,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 14044,
      percentage: 93.4, // 14044/15051
      actionStatement: 'Strong coverage confirms overtime, tenure, and satisfaction patterns drive reliable attrition predictions.',
      cohorts: [
        { name: 'Overtime Burnout Segment', totalCount: 4444, validationSamples: 440, samplingPct: SUFF_PCT },
        { name: 'Stable High-Satisfaction Employees', totalCount: 5800, validationSamples: 574, samplingPct: SUFF_PCT },
        { name: 'Early-Career Flight Risk', totalCount: 3800, validationSamples: 376, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 543,
      percentage: 3.6, // 543/15051
      actionStatement: 'Consider collecting more HR role and compensation data to improve attrition prediction for these niche segments.',
      cohorts: [
        { name: 'Senior HR Role Niche', totalCount: 325, validationSamples: 117, samplingPct: 36.0 },
        { name: 'Max-Stock Low-Pay Paradox', totalCount: 218, validationSamples: 94, samplingPct: 43.1 },
      ],
    },
    helpMe: {
      count: 412,
      percentage: 2.7, // 412/15051
      actionStatement: 'Mixed signals detected in recently promoted but dissatisfied employees — configure a manual review workflow for these retention cases.',
      cohorts: [
        { name: 'Promoted-but-Dissatisfied Segment', totalCount: 412, validationSamples: 78, samplingPct: 18.9 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'energy-consumption': {
    totalCount: 35112, // 32400 + 800 + 1840 + 72 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'MAPE',
      primaryValue: 8,
      secondaryMetric: 'RMSE',
      secondaryValue: 94,
      statement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    },
    sufficient: {
      count: 32400,
      percentage: 92.3, // 32400/35112
      actionStatement: 'These energy consumption cohorts are production-ready — peak-hour and seasonal patterns are well-represented.',
      cohorts: [
        { name: 'Weekday Morning Peak', totalCount: 8760, validationSamples: 867, samplingPct: SUFF_PCT },
        { name: 'Evening Residential Surge', totalCount: 8760, validationSamples: 867, samplingPct: SUFF_PCT },
        { name: 'Off-Peak Baseline State', totalCount: 14880, validationSamples: 1473, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 800,
      percentage: 2.3, // 800/35112
      actionStatement: 'Consider augmenting these cohorts or collecting additional readings from extreme weather and demand-response events.',
      cohorts: [
        { name: 'Extreme Cold Snap Events', totalCount: 380, validationSamples: 144, samplingPct: 37.9 },
        { name: 'Demand Response Activations', totalCount: 420, validationSamples: 151, samplingPct: 35.9 },
      ],
    },
    helpMe: {
      count: 1840,
      percentage: 5.2, // 1840/35112
      actionStatement: 'Flag transitional season hours for human review — shifting load patterns make autonomous forecasting unreliable.',
      cohorts: [
        { name: 'Spring/Autumn Transitional Hours', totalCount: 1840, validationSamples: 349, samplingPct: 19.0 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'insurance-claims': {
    totalCount: 40068, // 38854 + 666 + 480 + 68 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 87,
      secondaryMetric: 'Precision',
      secondaryValue: 84,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 38854,
      percentage: 96.9, // 38854/40068
      actionStatement: 'These claim cohorts are production-ready — common incident types and severity levels are well-covered.',
      cohorts: [
        { name: 'Standard Verified Claims', totalCount: 28154, validationSamples: 2787, samplingPct: SUFF_PCT },
        { name: 'High-Value Legitimate Claims', totalCount: 8500, validationSamples: 842, samplingPct: SUFF_PCT },
        { name: 'Suspicious New Policy Claims', totalCount: 2200, validationSamples: 218, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 666,
      percentage: 1.7, // 666/40068
      actionStatement: 'Low sample counts for parked-car incidents and unwitnessed injury claims may affect fraud detection — augmentation recommended.',
      cohorts: [
        { name: 'Parked Vehicle Incidents', totalCount: 390, validationSamples: 140, samplingPct: 35.9 },
        { name: 'Multi-Injury No-Witness Cases', totalCount: 276, validationSamples: 118, samplingPct: 42.8 },
      ],
    },
    helpMe: {
      count: 480,
      percentage: 1.2, // 480/40068
      actionStatement: 'Mixed signals detected in policyholder hobby-correlated claims — configure a manual review workflow for these suspicious patterns.',
      cohorts: [
        { name: 'Hobby-Related Anomalies', totalCount: 480, validationSamples: 91, samplingPct: 18.9 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'predictive-maintenance': {
    totalCount: 50078, // 47910 + 670 + 1420 + 78 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 88,
      secondaryMetric: 'Precision',
      secondaryValue: 85,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 47910,
      percentage: 95.7, // 47910/50078
      actionStatement: 'These equipment cohorts are production-ready — normal operation, degradation, and vibration patterns drive reliable failure predictions.',
      cohorts: [
        { name: 'Normal Operating State', totalCount: 34610, validationSamples: 3426, samplingPct: SUFF_PCT },
        { name: 'Pre-Failure Degradation Cluster', totalCount: 8200, validationSamples: 812, samplingPct: SUFF_PCT },
        { name: 'Post-Maintenance Warm-Up', totalCount: 5100, validationSamples: 505, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 670,
      percentage: 1.3, // 670/50078
      actionStatement: 'Low sample counts for catastrophic and extreme-environment failures may affect early warning reliability — augmentation recommended.',
      cohorts: [
        { name: 'Catastrophic Sudden Failures', totalCount: 380, validationSamples: 144, samplingPct: 37.9 },
        { name: 'Extreme Environmental Events', totalCount: 290, validationSamples: 124, samplingPct: 42.8 },
      ],
    },
    helpMe: {
      count: 1420,
      percentage: 2.8, // 1420/50078
      actionStatement: 'Flag intermittent fault patterns for engineering review — oscillating sensor readings prevent confident failure prediction.',
      cohorts: [
        { name: 'Intermittent Fault Oscillators', totalCount: 1420, validationSamples: 284, samplingPct: 20.0 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'logistics-delivery-delay': {
    totalCount: 25048, // 21640 + 520 + 2840 + 48 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 86,
      secondaryMetric: 'Precision',
      secondaryValue: 83,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 21640,
      percentage: 86.4, // 21640/25048
      actionStatement: 'These delivery cohorts are production-ready — weather, distance, and partner performance patterns drive reliable delay predictions.',
      cohorts: [
        { name: 'Weather-Impacted Long Routes', totalCount: 6980, validationSamples: 691, samplingPct: SUFF_PCT },
        { name: 'Express Urban Deliveries', totalCount: 6240, validationSamples: 618, samplingPct: SUFF_PCT },
        { name: 'Partner Reliability Clusters', totalCount: 8420, validationSamples: 834, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 520,
      percentage: 2.1, // 520/25048
      actionStatement: 'Consider collecting more delivery data for EV cold-weather routes and heavy fragile shipments to improve delay prediction.',
      cohorts: [
        { name: 'EV Fleet Cold-Weather Segment', totalCount: 340, validationSamples: 122, samplingPct: 35.9 },
        { name: 'Heavy Fragile Cargo Long-Haul', totalCount: 180, validationSamples: 78, samplingPct: 43.3 },
      ],
    },
    helpMe: {
      count: 2840,
      percentage: 11.3, // 2840/25048
      actionStatement: 'Flag mid-distance rainy deliveries for dispatcher review — variable conditions prevent confident delay estimates.',
      cohorts: [
        { name: 'Mid-Distance Rainy Deliveries', totalCount: 2840, validationSamples: 540, samplingPct: 19.0 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'logistics-freight-cost': {
    totalCount: 6002, // 5218 + 366 + 380 + 38 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'MAPE',
      primaryValue: 14,
      secondaryMetric: 'RMSE',
      secondaryValue: 4820,
      statement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    },
    sufficient: {
      count: 5218,
      percentage: 87.0, // 5218/6002
      actionStatement: 'Strong coverage confirms standard air, truck, and high-value product shipments drive reliable freight cost estimates.',
      cohorts: [
        { name: 'Standard Air Shipments', totalCount: 2518, validationSamples: 249, samplingPct: SUFF_PCT },
        { name: 'Heavy Truck Freight', totalCount: 1420, validationSamples: 141, samplingPct: SUFF_PCT },
        { name: 'High-Value ARV Shipments', totalCount: 1280, validationSamples: 127, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 366,
      percentage: 6.1, // 366/6002
      actionStatement: 'Low sample counts for air charter and small-island ocean routes may affect cost estimation — augmentation recommended.',
      cohorts: [
        { name: 'Air Charter Bulk Shipments', totalCount: 224, validationSamples: 96, samplingPct: 42.9 },
        { name: 'Ocean Multi-Country Routes', totalCount: 142, validationSamples: 68, samplingPct: 47.9 },
      ],
    },
    helpMe: {
      count: 380,
      percentage: 6.3, // 380/6002
      actionStatement: 'Mixed signals detected in multi-modal regional shipments — configure a manual review workflow for these cost estimates.',
      cohorts: [
        { name: 'Mixed-Mode Regional Shipments', totalCount: 380, validationSamples: 72, samplingPct: 18.9 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'logistics-delivery-outcome': {
    totalCount: 180603, // 166059 + 6040 + 8420 + 84 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 84,
      secondaryMetric: 'Precision',
      secondaryValue: 81,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 166059,
      percentage: 91.9, // 166059/180603
      actionStatement: 'These delivery outcome cohorts are production-ready — standard shipping modes and key market segments are well-covered.',
      cohorts: [
        { name: 'Standard Class Late Deliveries', totalCount: 98999, validationSamples: 9801, samplingPct: SUFF_PCT },
        { name: 'Same Day Advance Shipping', totalCount: 38420, validationSamples: 3804, samplingPct: SUFF_PCT },
        { name: 'On-Time Corporate Orders', totalCount: 28640, validationSamples: 2836, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 6040,
      percentage: 3.3, // 6040/180603
      actionStatement: 'Consider collecting more data for African market cancellations and deep-discount segments to improve outcome prediction.',
      cohorts: [
        { name: 'African Market Cancellations', totalCount: 3200, validationSamples: 1152, samplingPct: 36.0 },
        { name: 'High-Discount Home Office Orders', totalCount: 2840, validationSamples: 1136, samplingPct: 40.0 },
      ],
    },
    helpMe: {
      count: 8420,
      percentage: 4.7, // 8420/180603
      actionStatement: 'Flag LATAM Second Class borderline shipments for operations review — delivery timing is too close to call autonomously.',
      cohorts: [
        { name: 'LATAM Second Class Borderline', totalCount: 8420, validationSamples: 1600, samplingPct: 19.0 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },

  'logistics-demand-forecast': {
    totalCount: 1355, // 1087 + 70 + 180 + 18 (includes augmented)
    totalCohorts: 8,
    overallMetrics: {
      primaryMetric: 'MAPE',
      primaryValue: 9,
      secondaryMetric: 'RMSE',
      secondaryValue: 68,
      statement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    },
    sufficient: {
      count: 1087,
      percentage: 80.2, // 1087/1355
      actionStatement: 'These demand forecast cohorts are production-ready — weekday baselines and seasonal peaks drive reliable volume predictions.',
      cohorts: [
        { name: 'Weekday Baseline Demand', totalCount: 639, validationSamples: 63, samplingPct: SUFF_PCT },
        { name: 'Seasonal Peak Demand', totalCount: 280, validationSamples: 28, samplingPct: SUFF_PCT },
        { name: 'Weather-Suppressed Low Demand', totalCount: 168, validationSamples: 17, samplingPct: 10.1 }, // 17/168*100=10.12%
      ],
    },
    insufficient: {
      count: 70,
      percentage: 5.2, // 70/1355
      actionStatement: 'Consider collecting more data for port congestion and dual-shock disruption events to improve demand forecasting accuracy.',
      cohorts: [
        { name: 'Port Congestion Crisis Days', totalCount: 42, validationSamples: 18, samplingPct: 42.9 },
        { name: 'Dual-Shock Events', totalCount: 28, validationSamples: 14, samplingPct: 50.0 },
      ],
    },
    helpMe: {
      count: 180,
      percentage: 13.3, // 180/1355
      actionStatement: 'Flag weekend demand transitions for planner review — shifting consumption patterns prevent confident volume forecasts.',
      cohorts: [
        { name: 'Weekend Demand Transitions', totalCount: 180, validationSamples: 34, samplingPct: 18.9 },
      ],
    },
    augmented: { count: 0, percentage: 0, cohorts: [], actionStatement: '' },
  },
}

export function getPrecomputedValidation(datasetId: string): ValidationSummaryResults {
  return validationDataMap[datasetId] ?? validationDataMap['telco-churn']
}

// ── Backtest validation criteria for time-series datasets ────────────────────

import type { BacktestConfig } from './BacktestChart'
export type { BacktestConfig }

const backtestConfigMap: Record<string, BacktestConfig> = {
  'store-demand': {
    windowLabel: '60-day rolling window',
    totalDataPoints: 45000,
    validationSlices: 12,
    granularity: 'Daily',
    dateRange: 'Jan 2023 — Mar 2024',
    strategy: 'Walk-Forward',
    purgeGap: '1 day',
  },
  'energy-consumption': {
    windowLabel: '60-day rolling window',
    totalDataPoints: 35040,
    validationSlices: 24,
    granularity: 'Hourly',
    dateRange: 'Jan 2023 — Dec 2023',
    strategy: 'Walk-Forward',
    purgeGap: '1 hour',
  },
  'logistics-freight-cost': {
    windowLabel: '90-day rolling window',
    totalDataPoints: 5964,
    validationSlices: 6,
    granularity: 'Daily',
    dateRange: 'Jun 2022 — Dec 2023',
    strategy: 'Expanding Window',
    purgeGap: '3 days',
  },
  'logistics-demand-forecast': {
    windowLabel: '30-day rolling window',
    totalDataPoints: 1337,
    validationSlices: 8,
    granularity: 'Daily',
    dateRange: 'Mar 2022 — Dec 2025',
    strategy: 'Walk-Forward',
    purgeGap: '1 day',
  },
}

export function getBacktestConfig(datasetId: string): BacktestConfig | null {
  return backtestConfigMap[datasetId] ?? null
}
