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
      actionStatement: 'These churn-risk cohorts are production-ready — no further action needed.',
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
      actionStatement: 'Consider collecting more data for these subscriber segments to improve churn prediction coverage.',
      cohorts: [
        { name: 'SeniorCitizen=1 AND no Dependents', totalCount: 389, validationSamples: 97, samplingPct: 24.9 },
        { name: 'MultipleLines=No phone service', totalCount: 209, validationSamples: 75, samplingPct: 35.9 },
      ],
    },
    helpMe: {
      count: 312,
      percentage: 4.4,
      actionStatement: 'Flag these mid-tenure subscribers for human review — the model cannot confidently predict their churn behavior.',
      cohorts: [
        { name: 'Mid-Tenure Mixed Signals (12–24 mo)', totalCount: 312, validationSamples: 60, samplingPct: 19.2 },
      ],
    },
    augmented: {
      count: 42,
      percentage: 0.6,
      actionStatement: 'Synthetic data supplements thin subscriber cohorts — monitor for distribution drift in production.',
      cohorts: [
        { name: 'SeniorCitizen=1 AND no Dependents [augmented]', totalCount: 24, validationSamples: 2, samplingPct: 8.3 },
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
      actionStatement: 'Strong coverage confirms these transaction patterns drive reliable fraud detection.',
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
      actionStatement: 'Low sample counts in high-value and rare transaction cohorts may affect fraud detection — augmentation recommended.',
      cohorts: [
        { name: 'Amount > 5000 (high value)', totalCount: 186, validationSamples: 84, samplingPct: 45.2 },
        { name: 'V12 < -15 AND V14 < -15', totalCount: 94, validationSamples: 59, samplingPct: 62.8 },
        { name: 'Rare transaction pattern', totalCount: 212, validationSamples: 80, samplingPct: 37.7 },
      ],
    },
    helpMe: {
      count: 4500,
      percentage: 9.0,
      actionStatement: 'Mixed signals detected in mid-range transactions — configure a manual review workflow for these edge cases.',
      cohorts: [
        { name: 'V10 mixed signal range ($200-$500)', totalCount: 447, validationSamples: 86, samplingPct: 19.2 },
      ],
    },
    augmented: {
      count: 88,
      percentage: 0.2,
      actionStatement: 'Augmented samples improve coverage for rare fraud patterns but should be validated against real-world transactions.',
      cohorts: [
        { name: 'Amount > 5000 [augmented]', totalCount: 48, validationSamples: 4, samplingPct: 8.3 },
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
      actionStatement: 'These demand cohorts are production-ready — weekday, seasonal, and promotional patterns are well-represented.',
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
      actionStatement: 'Consider augmenting these cohorts or collecting additional sales data from remote regions and volatile oil-price periods.',
      cohorts: [
        { name: 'transferred=True (holiday)', totalCount: 310, validationSamples: 108, samplingPct: 34.8 },
        { name: 'city=remote region', totalCount: 445, validationSamples: 156, samplingPct: 35.1 },
        { name: 'dcoilwtico > 90 (high oil)', totalCount: 280, validationSamples: 116, samplingPct: 41.4 },
      ],
    },
    helpMe: {
      count: 1710,
      percentage: 3.8,
      actionStatement: 'Flag holiday transfer days for human review — ambiguous demand signals prevent reliable forecasting.',
      cohorts: [
        { name: 'Holiday transfer day ambiguous', totalCount: 380, validationSamples: 76, samplingPct: 20.0 },
      ],
    },
    augmented: {
      count: 56,
      percentage: 0.1,
      actionStatement: 'Synthetic data fills gaps in holiday and high-oil-price scenarios — validate against actual store sales before relying on these forecasts.',
      cohorts: [
        { name: 'transferred=True (holiday) [augmented]', totalCount: 32, validationSamples: 3, samplingPct: 9.4 },
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
      actionStatement: 'These patient cohorts are production-ready — readmission predictions are reliable for standard hospital stays and medication profiles.',
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
      actionStatement: 'Low sample counts for elderly patients and high-medication cases may affect readmission prediction — augmentation recommended.',
      cohorts: [
        { name: 'age=[90-100]', totalCount: 312, validationSamples: 109, samplingPct: 34.9 },
        { name: 'num_medications > 25', totalCount: 284, validationSamples: 116, samplingPct: 40.8 },
      ],
    },
    helpMe: {
      count: 2350,
      percentage: 9.4,
      actionStatement: 'Flag patients with rare diagnosis codes for clinical review — the model\'s confidence is too low for autonomous discharge decisions.',
      cohorts: [
        { name: 'diag_1 mixed (rare codes)', totalCount: 520, validationSamples: 104, samplingPct: 20.0 },
      ],
    },
    augmented: {
      count: 64,
      percentage: 0.3,
      actionStatement: 'Synthetic data supplements thin elderly and high-medication cohorts — validate augmented predictions against clinical outcomes.',
      cohorts: [
        { name: 'age=[90-100] [augmented]', totalCount: 36, validationSamples: 3, samplingPct: 8.3 },
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
      actionStatement: 'Strong coverage confirms overtime, tenure, and satisfaction patterns drive reliable attrition predictions.',
      cohorts: [
        { name: 'OverTime=Yes', totalCount: 5269, validationSamples: 522, samplingPct: SUFF_PCT },
        { name: 'YearsAtCompany in [0, 3]', totalCount: 4210, validationSamples: 417, samplingPct: SUFF_PCT },
        { name: 'JobSatisfaction=1 (low)', totalCount: 3580, validationSamples: 354, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 1215,
      percentage: 8.1,
      actionStatement: 'Consider collecting more HR role and compensation data to improve attrition prediction for these niche segments.',
      cohorts: [
        { name: 'JobRole=Human Resources', totalCount: 325, validationSamples: 117, samplingPct: 36.0 },
        { name: 'StockOptionLevel=3 AND low pay', totalCount: 218, validationSamples: 94, samplingPct: 43.1 },
      ],
    },
    helpMe: {
      count: 1850,
      percentage: 12.3,
      actionStatement: 'Mixed signals detected in recently promoted but dissatisfied employees — configure a manual review workflow for these retention cases.',
      cohorts: [
        { name: 'Promoted-but-dissatisfied segment', totalCount: 412, validationSamples: 78, samplingPct: 18.9 },
      ],
    },
    augmented: {
      count: 52,
      percentage: 0.3,
      actionStatement: 'Augmented samples improve coverage for rare HR roles but should be validated against real workforce turnover data.',
      cohorts: [
        { name: 'JobRole=Human Resources [augmented]', totalCount: 30, validationSamples: 3, samplingPct: 10.0 },
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
      actionStatement: 'These energy consumption cohorts are production-ready — peak-hour and seasonal patterns are well-represented.',
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
      actionStatement: 'Consider augmenting these cohorts or collecting additional readings from extreme weather and demand-response events.',
      cohorts: [
        { name: 'demand_response_active=True', totalCount: 420, validationSamples: 151, samplingPct: 35.9 },
        { name: 'temperature < -5 (extreme cold)', totalCount: 380, validationSamples: 144, samplingPct: 37.9 },
        { name: 'solar_irradiance > 900', totalCount: 190, validationSamples: 116, samplingPct: 61.1 },
      ],
    },
    helpMe: {
      count: 6450,
      percentage: 18.4,
      actionStatement: 'Flag transitional season hours for human review — shifting load patterns make autonomous forecasting unreliable.',
      cohorts: [
        { name: 'Spring/Autumn transitional hours', totalCount: 1840, validationSamples: 349, samplingPct: 19.0 },
      ],
    },
    augmented: {
      count: 72,
      percentage: 0.2,
      actionStatement: 'Synthetic data supplements extreme-weather cohorts — monitor for distribution drift as climate patterns shift.',
      cohorts: [
        { name: 'solar_irradiance > 900 [augmented]', totalCount: 40, validationSamples: 3, samplingPct: 7.5 },
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
      actionStatement: 'These claim cohorts are production-ready — common incident types and severity levels are well-covered.',
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
      actionStatement: 'Low sample counts for parked-car incidents and unwitnessed injury claims may affect fraud detection — augmentation recommended.',
      cohorts: [
        { name: 'incident_type=Parked Car', totalCount: 390, validationSamples: 140, samplingPct: 35.9 },
        { name: 'bodily_injuries=2 AND witnesses=0', totalCount: 276, validationSamples: 118, samplingPct: 42.8 },
      ],
    },
    helpMe: {
      count: 4160,
      percentage: 10.4,
      actionStatement: 'Mixed signals detected in policyholder hobby-correlated claims — configure a manual review workflow for these suspicious patterns.',
      cohorts: [
        { name: 'insured_hobbies mixed signal', totalCount: 480, validationSamples: 91, samplingPct: 18.9 },
      ],
    },
    augmented: {
      count: 68,
      percentage: 0.2,
      actionStatement: 'Augmented samples improve coverage for rare claim scenarios but should be validated against actual claims adjudication outcomes.',
      cohorts: [
        { name: 'incident_type=Parked Car [augmented]', totalCount: 40, validationSamples: 4, samplingPct: 10.0 },
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
      actionStatement: 'These equipment cohorts are production-ready — normal operation, degradation, and vibration patterns drive reliable failure predictions.',
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
      actionStatement: 'Low sample counts for catastrophic and extreme-environment failures may affect early warning reliability — augmentation recommended.',
      cohorts: [
        { name: 'Catastrophic sudden failures', totalCount: 380, validationSamples: 144, samplingPct: 37.9 },
        { name: 'Extreme environmental events', totalCount: 290, validationSamples: 124, samplingPct: 42.8 },
      ],
    },
    helpMe: {
      count: 7100,
      percentage: 14.2,
      actionStatement: 'Flag intermittent fault patterns for engineering review — oscillating sensor readings prevent confident failure prediction.',
      cohorts: [
        { name: 'Intermittent fault oscillators', totalCount: 1420, validationSamples: 284, samplingPct: 20.0 },
      ],
    },
    augmented: {
      count: 78,
      percentage: 0.2,
      actionStatement: 'Synthetic data supplements rare failure modes — monitor for distribution drift as equipment ages in production.',
      cohorts: [
        { name: 'Catastrophic sudden failures [augmented]', totalCount: 44, validationSamples: 4, samplingPct: 9.1 },
        { name: 'Extreme environmental events [augmented]', totalCount: 34, validationSamples: 5, samplingPct: 14.7 },
      ],
    },
  },

  'logistics-delivery-delay': {
    totalCount: 25000,
    totalCohorts: 16,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 86,
      secondaryMetric: 'Precision',
      secondaryValue: 83,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 17500,
      percentage: 70.0,
      actionStatement: 'These delivery cohorts are production-ready — weather, distance, and partner performance patterns drive reliable delay predictions.',
      cohorts: [
        { name: 'weather_condition=stormy AND distance > 300km', totalCount: 4820, validationSamples: 477, samplingPct: SUFF_PCT },
        { name: 'delivery_mode=express AND distance < 50km', totalCount: 6240, validationSamples: 618, samplingPct: SUFF_PCT },
        { name: 'delivery_partner=FedEx AND rating > 4.0', totalCount: 3420, validationSamples: 339, samplingPct: SUFF_PCT },
        { name: 'vehicle_type=truck AND region=north', totalCount: 4280, validationSamples: 424, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 520,
      percentage: 2.1,
      actionStatement: 'Consider collecting more delivery data for EV cold-weather routes and heavy fragile shipments to improve delay prediction.',
      cohorts: [
        { name: 'vehicle_type=EV AND weather=cold', totalCount: 340, validationSamples: 122, samplingPct: 35.9 },
        { name: 'package_type=fragile AND weight > 20kg', totalCount: 180, validationSamples: 78, samplingPct: 43.3 },
      ],
    },
    helpMe: {
      count: 2840,
      percentage: 11.4,
      actionStatement: 'Flag mid-distance rainy deliveries for dispatcher review — variable conditions prevent confident delay estimates.',
      cohorts: [
        { name: 'distance in [100,300] AND weather=rainy', totalCount: 2840, validationSamples: 540, samplingPct: 19.0 },
      ],
    },
    augmented: {
      count: 48,
      percentage: 0.2,
      actionStatement: 'Synthetic data supplements thin EV and fragile-shipment cohorts — validate against actual delivery performance before setting SLAs.',
      cohorts: [
        { name: 'vehicle_type=EV AND weather=cold [augmented]', totalCount: 28, validationSamples: 3, samplingPct: 10.7 },
        { name: 'package_type=fragile AND weight > 20kg [augmented]', totalCount: 20, validationSamples: 3, samplingPct: 15.0 },
      ],
    },
  },

  'logistics-freight-cost': {
    totalCount: 5964,
    totalCohorts: 14,
    overallMetrics: {
      primaryMetric: 'MAPE',
      primaryValue: 14,
      secondaryMetric: 'RMSE',
      secondaryValue: 4820,
      statement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    },
    sufficient: {
      count: 4175,
      percentage: 70.0,
      actionStatement: 'Strong coverage confirms standard air, truck, and high-value product shipments drive reliable freight cost estimates.',
      cohorts: [
        { name: 'shipment_mode=Air AND weight < 1000kg', totalCount: 2840, validationSamples: 281, samplingPct: SUFF_PCT },
        { name: 'shipment_mode=Truck AND weight > 5000kg', totalCount: 1420, validationSamples: 141, samplingPct: SUFF_PCT },
        { name: 'product_group=ARV AND value > $50k', totalCount: 1280, validationSamples: 127, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 366,
      percentage: 6.1,
      actionStatement: 'Low sample counts for air charter and small-island ocean routes may affect cost estimation — augmentation recommended.',
      cohorts: [
        { name: 'shipment_mode=Air Charter', totalCount: 224, validationSamples: 96, samplingPct: 42.9 },
        { name: 'shipment_mode=Ocean AND small island', totalCount: 142, validationSamples: 68, samplingPct: 47.9 },
      ],
    },
    helpMe: {
      count: 380,
      percentage: 6.4,
      actionStatement: 'Mixed signals detected in multi-modal regional shipments — configure a manual review workflow for these cost estimates.',
      cohorts: [
        { name: 'Mixed-mode regional shipments', totalCount: 380, validationSamples: 72, samplingPct: 18.9 },
      ],
    },
    augmented: {
      count: 38,
      percentage: 0.6,
      actionStatement: 'Augmented samples improve coverage for charter and island routes but should be validated against actual freight invoices.',
      cohorts: [
        { name: 'shipment_mode=Air Charter [augmented]', totalCount: 22, validationSamples: 2, samplingPct: 9.1 },
        { name: 'Ocean small island [augmented]', totalCount: 16, validationSamples: 2, samplingPct: 12.5 },
      ],
    },
  },

  'logistics-delivery-outcome': {
    totalCount: 180519,
    totalCohorts: 20,
    overallMetrics: {
      primaryMetric: 'Recall',
      primaryValue: 84,
      secondaryMetric: 'Precision',
      secondaryValue: 81,
      statement: 'Recall is the primary metric and precision is the secondary metric for this model.',
    },
    sufficient: {
      count: 126363,
      percentage: 70.0,
      actionStatement: 'These delivery outcome cohorts are production-ready — standard shipping modes and key market segments are well-covered.',
      cohorts: [
        { name: 'shipping_mode=Standard Class AND late_risk=1', totalCount: 82400, validationSamples: 8158, samplingPct: SUFF_PCT },
        { name: 'shipping_mode=Same Day AND advance', totalCount: 38420, validationSamples: 3804, samplingPct: SUFF_PCT },
        { name: 'customer_segment=Corporate AND on_time', totalCount: 28640, validationSamples: 2836, samplingPct: SUFF_PCT },
        { name: 'market=Europe AND First Class', totalCount: 18240, validationSamples: 1806, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 6040,
      percentage: 3.3,
      actionStatement: 'Consider collecting more data for African market cancellations and deep-discount segments to improve outcome prediction.',
      cohorts: [
        { name: 'market=Africa AND canceled', totalCount: 3200, validationSamples: 1152, samplingPct: 36.0 },
        { name: 'Home Office AND discount > 30%', totalCount: 2840, validationSamples: 1136, samplingPct: 40.0 },
      ],
    },
    helpMe: {
      count: 8420,
      percentage: 4.7,
      actionStatement: 'Flag LATAM Second Class borderline shipments for operations review — delivery timing is too close to call autonomously.',
      cohorts: [
        { name: 'LATAM Second Class borderline days', totalCount: 8420, validationSamples: 1600, samplingPct: 19.0 },
      ],
    },
    augmented: {
      count: 84,
      percentage: 0.05,
      actionStatement: 'Synthetic data supplements thin market and discount cohorts — monitor for distribution drift across regional shipping lanes.',
      cohorts: [
        { name: 'market=Africa AND canceled [augmented]', totalCount: 48, validationSamples: 4, samplingPct: 8.3 },
        { name: 'Home Office high discount [augmented]', totalCount: 36, validationSamples: 4, samplingPct: 11.1 },
      ],
    },
  },

  'logistics-demand-forecast': {
    totalCount: 1337,
    totalCohorts: 12,
    overallMetrics: {
      primaryMetric: 'MAPE',
      primaryValue: 9,
      secondaryMetric: 'RMSE',
      secondaryValue: 68,
      statement: 'MAPE is the primary metric and RMSE is the secondary metric for this model.',
    },
    sufficient: {
      count: 936,
      percentage: 70.0,
      actionStatement: 'These demand forecast cohorts are production-ready — weekday baselines and seasonal peaks drive reliable volume predictions.',
      cohorts: [
        { name: 'Weekday baseline (Mon-Fri)', totalCount: 720, validationSamples: 71, samplingPct: SUFF_PCT },
        { name: 'Q4 seasonal peak (Oct-Dec)', totalCount: 280, validationSamples: 28, samplingPct: SUFF_PCT },
        { name: 'Weather-suppressed days', totalCount: 168, validationSamples: 17, samplingPct: SUFF_PCT },
      ],
    },
    insufficient: {
      count: 70,
      percentage: 5.2,
      actionStatement: 'Consider collecting more data for port congestion and dual-shock disruption events to improve demand forecasting accuracy.',
      cohorts: [
        { name: 'Port congestion > 0.9', totalCount: 42, validationSamples: 18, samplingPct: 42.9 },
        { name: 'Dual-shock weather+traffic', totalCount: 28, validationSamples: 14, samplingPct: 50.0 },
      ],
    },
    helpMe: {
      count: 180,
      percentage: 13.5,
      actionStatement: 'Flag weekend demand transitions for planner review — shifting consumption patterns prevent confident volume forecasts.',
      cohorts: [
        { name: 'Weekend demand transitions', totalCount: 180, validationSamples: 34, samplingPct: 18.9 },
      ],
    },
    augmented: {
      count: 18,
      percentage: 1.3,
      actionStatement: 'Synthetic data supplements rare disruption scenarios — validate augmented forecasts against actual port and weather event outcomes.',
      cohorts: [
        { name: 'Port congestion > 0.9 [augmented]', totalCount: 10, validationSamples: 1, samplingPct: 10.0 },
        { name: 'Dual-shock events [augmented]', totalCount: 8, validationSamples: 1, samplingPct: 12.5 },
      ],
    },
  },
}

export function getPrecomputedValidation(datasetId: string): ValidationSummaryResults {
  return validationDataMap[datasetId] ?? validationDataMap['telco-churn']
}

// ── Backtest data for time-series datasets ───────────────────────────────────

export interface BacktestPoint {
  date: string
  actual: number
  predicted: number
}

function generateBacktestData(base: number, noise: number, days: number): BacktestPoint[] {
  const points: BacktestPoint[] = []
  const startDate = new Date('2024-01-01')
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const dayOfWeek = d.getDay()
    const seasonalFactor = 1 + 0.15 * Math.sin((i / 365) * 2 * Math.PI)
    const weekendDip = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.82 : 1
    const actual = Math.round(base * seasonalFactor * weekendDip + (Math.random() - 0.5) * noise)
    const predicted = Math.round(actual + (Math.random() - 0.5) * noise * 0.6)
    points.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      actual,
      predicted,
    })
  }
  return points
}

const backtestDataMap: Record<string, BacktestPoint[]> = {
  'store-demand': generateBacktestData(420, 80, 60),
  'energy-consumption': generateBacktestData(3200, 600, 60),
  'logistics-freight-cost': generateBacktestData(1850, 400, 60),
  'logistics-demand-forecast': generateBacktestData(580, 120, 60),
}

export function getBacktestData(datasetId: string): BacktestPoint[] | null {
  return backtestDataMap[datasetId] ?? null
}
