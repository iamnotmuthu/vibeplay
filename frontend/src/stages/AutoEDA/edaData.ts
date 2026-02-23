import type { EDAResults } from '@/store/types'

// ── telco-churn ───────────────────────────────────────────────────────────────
const telcoChurnEDA: EDAResults = {
  summary: {
    rows: 7043,
    columns: 21,
    numericFeatures: 3,
    categoricalFeatures: 18,
    memoryUsage: '5.4 MB',
    duplicateRows: 0,
  },
  missingValues: {
    columns: ['TotalCharges', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV'],
    values: [11, 0, 0, 0, 0, 0],
  },
  distributions: [
    {
      feature: 'tenure',
      type: 'numeric',
      bins: [
        { label: '0-10', count: 1835 },
        { label: '10-20', count: 742 },
        { label: '20-30', count: 639 },
        { label: '30-40', count: 597 },
        { label: '40-50', count: 688 },
        { label: '50-60', count: 826 },
        { label: '60-72', count: 1716 },
      ],
      stats: { mean: 32.4, median: 29, std: 24.6, min: 0, max: 72 },
    },
    {
      feature: 'MonthlyCharges',
      type: 'numeric',
      bins: [
        { label: '18-30', count: 1342 },
        { label: '30-45', count: 732 },
        { label: '45-60', count: 824 },
        { label: '60-75', count: 1081 },
        { label: '75-90', count: 1289 },
        { label: '90-105', count: 1126 },
        { label: '105-120', count: 649 },
      ],
      stats: { mean: 64.8, median: 70.4, std: 30.1, min: 18.25, max: 118.75 },
    },
    {
      feature: 'TotalCharges',
      type: 'numeric',
      bins: [
        { label: '0-1000', count: 2218 },
        { label: '1000-2000', count: 1231 },
        { label: '2000-3000', count: 985 },
        { label: '3000-4000', count: 846 },
        { label: '4000-5000', count: 657 },
        { label: '5000-6000', count: 523 },
        { label: '6000-8600', count: 583 },
      ],
      stats: { mean: 2283.3, median: 1397.5, std: 2266.8, min: 18.8, max: 8684.8 },
    },
    {
      feature: 'Contract',
      type: 'categorical',
      bins: [
        { label: 'Month-to-month', count: 3875 },
        { label: 'One year', count: 1473 },
        { label: 'Two year', count: 1695 },
      ],
    },
    {
      feature: 'PaymentMethod',
      type: 'categorical',
      bins: [
        { label: 'Electronic check', count: 2365 },
        { label: 'Mailed check', count: 1612 },
        { label: 'Bank transfer', count: 1544 },
        { label: 'Credit card', count: 1522 },
      ],
    },
    {
      feature: 'InternetService',
      type: 'categorical',
      bins: [
        { label: 'Fiber optic', count: 3096 },
        { label: 'DSL', count: 2421 },
        { label: 'No', count: 1526 },
      ],
    },
  ],
  correlations: {
    features: ['tenure', 'Monthly', 'Total', 'Churn'],
    matrix: [
      [1.0, 0.25, 0.83, -0.35],
      [0.25, 1.0, 0.65, 0.19],
      [0.83, 0.65, 1.0, -0.20],
      [-0.35, 0.19, -0.20, 1.0],
    ],
  },
  outliers: {
    features: ['tenure', 'MonthlyCharges'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 12 })),
    outlierCount: 187,
    totalCount: 7043,
  },
  qualityScore: 87,
  insights: [
    { id: 'ins-1', text: 'Found 11 missing values in TotalCharges (0.16%). These appear to be new customers with zero tenure — will impute with 0 during feature engineering.', type: 'info' },
    { id: 'ins-2', text: 'Data is clean with no duplicate records. 18 categorical features detected — will apply encoding strategies optimized for tree-based models.', type: 'success' },
    { id: 'ins-3', text: 'High correlation (0.83) between tenure and TotalCharges. Will monitor for multicollinearity during model training and consider feature interaction.', type: 'warning' },
    { id: 'ins-4', text: 'tenure shows a bimodal distribution — many short-tenure and long-tenure customers, fewer in the middle. This is a strong churn signal.', type: 'info' },
    { id: 'ins-5', text: '187 statistical outliers detected (2.7%). Most are high-value, long-tenure customers — retaining rather than removing, as they represent key business segments.', type: 'warning' },
    { id: 'ins-6', text: 'Data quality score: 87/100. High-quality dataset ready for autonomous AI pipeline. Minor issues with missing TotalCharges values will be handled automatically.', type: 'success' },
  ],
}

// ── credit-fraud ──────────────────────────────────────────────────────────────
const creditFraudEDA: EDAResults = {
  summary: { rows: 50000, columns: 30, numericFeatures: 28, categoricalFeatures: 2, memoryUsage: '22.1 MB', duplicateRows: 5 },
  missingValues: { columns: ['Amount', 'V27', 'V28'], values: [0, 3, 3] },
  distributions: [
    {
      feature: 'Amount',
      type: 'numeric',
      bins: [
        { label: '$0-25', count: 18420 },
        { label: '$25-75', count: 12340 },
        { label: '$75-150', count: 8920 },
        { label: '$150-300', count: 5180 },
        { label: '$300-600', count: 3210 },
        { label: '$600-1500', count: 1490 },
        { label: '$1500+', count: 440 },
      ],
      stats: { mean: 88.3, median: 22.0, std: 250.1, min: 0.01, max: 25691.16 },
    },
    {
      feature: 'Time',
      type: 'numeric',
      bins: [
        { label: '0-6h', count: 7820 },
        { label: '6-12h', count: 13150 },
        { label: '12-18h', count: 14340 },
        { label: '18-24h', count: 11420 },
        { label: '24-36h', count: 3270 },
      ],
      stats: { mean: 52831, median: 51030, std: 30637, min: 0, max: 172792 },
    },
    {
      feature: 'V4',
      type: 'numeric',
      bins: [
        { label: '-5 to -2', count: 4120 },
        { label: '-2 to 0', count: 12880 },
        { label: '0 to 2', count: 19420 },
        { label: '2 to 4', count: 10340 },
        { label: '4 to 8', count: 3240 },
      ],
      stats: { mean: 1.27, median: 1.30, std: 1.59, min: -5.68, max: 16.88 },
    },
    {
      feature: 'V14',
      type: 'numeric',
      bins: [
        { label: '-20 to -10', count: 2140 },
        { label: '-10 to -5', count: 6820 },
        { label: '-5 to 0', count: 19340 },
        { label: '0 to 5', count: 16780 },
        { label: '5 to 10', count: 4920 },
      ],
      stats: { mean: -0.91, median: -0.73, std: 3.43, min: -19.21, max: 10.53 },
    },
    {
      feature: 'Class',
      type: 'categorical',
      bins: [
        { label: 'Normal (0)', count: 49148 },
        { label: 'Fraud (1)', count: 852 },
      ],
    },
  ],
  correlations: {
    features: ['Amount', 'V4', 'V14', 'Class'],
    matrix: [
      [1.0, 0.12, -0.09, 0.06],
      [0.12, 1.0, -0.31, 0.18],
      [-0.09, -0.31, 1.0, -0.30],
      [0.06, 0.18, -0.30, 1.0],
    ],
  },
  outliers: {
    features: ['Amount', 'V4'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 8 })),
    outlierCount: 142,
    totalCount: 50000,
  },
  qualityScore: 92,
  insights: [
    { id: 'ins-1', text: 'Highly imbalanced dataset detected: only 1.7% of transactions are fraudulent. Will apply SMOTE oversampling and optimize for Precision-Recall AUC.', type: 'warning' },
    { id: 'ins-2', text: 'All 28 numeric features are PCA-transformed (V1-V28). No missing values detected — data is clean and ready for modeling.', type: 'success' },
    { id: 'ins-3', text: 'Transaction Amount has heavy right-skew (skewness: 16.2). Will apply log transformation to normalize the distribution.', type: 'info' },
    { id: 'ins-4', text: 'Time feature shows clear cyclic patterns — higher fraud rates during early morning hours. Engineering time-based features.', type: 'info' },
    { id: 'ins-5', text: '142 outlier transactions detected with amounts >$2,500. These correlate with higher fraud probability — keeping as informative signals.', type: 'warning' },
    { id: 'ins-6', text: 'Data quality score: 92/100. Excellent quality. PCA preprocessing already handles feature scaling.', type: 'success' },
  ],
}

// ── store-demand ──────────────────────────────────────────────────────────────
const storeDemandEDA: EDAResults = {
  summary: { rows: 45000, columns: 15, numericFeatures: 8, categoricalFeatures: 7, memoryUsage: '12.8 MB', duplicateRows: 0 },
  missingValues: { columns: ['sales', 'dcoilwtico', 'transactions'], values: [0, 340, 60] },
  distributions: [
    {
      feature: 'sales',
      type: 'numeric',
      bins: [
        { label: '0-50', count: 9840 },
        { label: '50-150', count: 13420 },
        { label: '150-300', count: 10180 },
        { label: '300-500', count: 6720 },
        { label: '500-800', count: 3240 },
        { label: '800+', count: 1600 },
      ],
      stats: { mean: 214.3, median: 162.0, std: 198.7, min: 0, max: 1872 },
    },
    {
      feature: 'dcoilwtico',
      type: 'numeric',
      bins: [
        { label: '$30-50', count: 6240 },
        { label: '$50-65', count: 11820 },
        { label: '$65-80', count: 14340 },
        { label: '$80-95', count: 8420 },
        { label: '$95-110', count: 3840 },
      ],
      stats: { mean: 68.4, median: 67.2, std: 20.1, min: 26.19, max: 110.62 },
    },
    {
      feature: 'transactions',
      type: 'numeric',
      bins: [
        { label: '0-500', count: 8240 },
        { label: '500-1000', count: 12480 },
        { label: '1000-1500', count: 11320 },
        { label: '1500-2000', count: 7840 },
        { label: '2000+', count: 5120 },
      ],
      stats: { mean: 1052, median: 965, std: 581, min: 8, max: 5765 },
    },
    {
      feature: 'store',
      type: 'categorical',
      bins: [
        { label: 'Store 1', count: 4620 },
        { label: 'Store 2', count: 4580 },
        { label: 'Store 3', count: 4540 },
        { label: 'Store 4', count: 4500 },
        { label: 'Store 5', count: 4460 },
      ],
    },
    {
      feature: 'onpromotion',
      type: 'categorical',
      bins: [
        { label: 'Not on Promo', count: 38740 },
        { label: 'On Promotion', count: 6260 },
      ],
    },
    {
      feature: 'holiday_type',
      type: 'categorical',
      bins: [
        { label: 'Work Day', count: 37800 },
        { label: 'Holiday', count: 4320 },
        { label: 'Event', count: 1980 },
        { label: 'Bridge', count: 900 },
      ],
    },
  ],
  correlations: {
    features: ['sales', 'promo', 'oil', 'txns'],
    matrix: [
      [1.0, 0.34, -0.12, 0.61],
      [0.34, 1.0, -0.08, 0.28],
      [-0.12, -0.08, 1.0, -0.15],
      [0.61, 0.28, -0.15, 1.0],
    ],
  },
  outliers: {
    features: ['sales', 'transactions'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 9 })),
    outlierCount: 89,
    totalCount: 45000,
  },
  qualityScore: 79,
  insights: [
    { id: 'ins-1', text: 'Time series data spanning 3 years across 10 stores. Detected strong weekly seasonality and annual trend patterns.', type: 'info' },
    { id: 'ins-2', text: '340 missing oil price values (0.8%) — likely weekend/holiday gaps. Will forward-fill within each store.', type: 'warning' },
    { id: 'ins-3', text: 'Promotions increase sales by an average of 34%. This feature will be critical for demand forecasting accuracy.', type: 'success' },
    { id: 'ins-4', text: 'High variance in sales across stores (CV: 0.68). Will train per-store models or include store embeddings.', type: 'info' },
    { id: 'ins-5', text: '89 extreme demand spikes detected — mostly holiday periods. Engineering holiday features for better prediction.', type: 'warning' },
    { id: 'ins-6', text: 'Data quality score: 79/100. Good quality with some gaps to address. Time-based features will be engineered automatically.', type: 'success' },
  ],
}

// ── patient-readmission ───────────────────────────────────────────────────────
const patientReadmissionEDA: EDAResults = {
  summary: { rows: 25000, columns: 35, numericFeatures: 12, categoricalFeatures: 23, memoryUsage: '15.2 MB', duplicateRows: 120 },
  missingValues: { columns: ['race', 'weight', 'payer_code', 'medical_specialty', 'diag_2', 'diag_3'], values: [1120, 22450, 8290, 7440, 520, 1850] },
  distributions: [
    {
      feature: 'time_in_hospital',
      type: 'numeric',
      bins: [
        { label: '1 day', count: 3840 },
        { label: '2-3 days', count: 7420 },
        { label: '4-5 days', count: 6180 },
        { label: '6-7 days', count: 3920 },
        { label: '8-10 days', count: 2360 },
        { label: '11-14 days', count: 1280 },
      ],
      stats: { mean: 4.4, median: 4.0, std: 2.99, min: 1, max: 14 },
    },
    {
      feature: 'num_medications',
      type: 'numeric',
      bins: [
        { label: '1-5', count: 3240 },
        { label: '6-10', count: 6820 },
        { label: '11-15', count: 7140 },
        { label: '16-20', count: 4980 },
        { label: '21-25', count: 2020 },
        { label: '26+', count: 800 },
      ],
      stats: { mean: 15.3, median: 15.0, std: 8.13, min: 1, max: 81 },
    },
    {
      feature: 'num_lab_procedures',
      type: 'numeric',
      bins: [
        { label: '0-20', count: 4820 },
        { label: '20-35', count: 7340 },
        { label: '35-50', count: 7820 },
        { label: '50-65', count: 3840 },
        { label: '65-80', count: 1180 },
      ],
      stats: { mean: 43.1, median: 44.0, std: 19.67, min: 1, max: 132 },
    },
    {
      feature: 'age',
      type: 'categorical',
      bins: [
        { label: '[30-40)', count: 1240 },
        { label: '[40-50)', count: 2840 },
        { label: '[50-60)', count: 4820 },
        { label: '[60-70)', count: 6340 },
        { label: '[70-80)', count: 5820 },
        { label: '[80-90)', count: 3940 },
      ],
    },
    {
      feature: 'admission_type_id',
      type: 'categorical',
      bins: [
        { label: 'Emergency', count: 13840 },
        { label: 'Urgent', count: 6120 },
        { label: 'Elective', count: 4240 },
        { label: 'Other', count: 800 },
      ],
    },
    {
      feature: 'readmitted',
      type: 'categorical',
      bins: [
        { label: 'NO', count: 10120 },
        { label: '>30 days', count: 9420 },
        { label: '<30 days', count: 5460 },
      ],
    },
  ],
  correlations: {
    features: ['time_hosp', 'meds', 'lab', 'readmit'],
    matrix: [
      [1.0, 0.48, 0.62, 0.24],
      [0.48, 1.0, 0.41, 0.21],
      [0.62, 0.41, 1.0, 0.18],
      [0.24, 0.21, 0.18, 1.0],
    ],
  },
  outliers: {
    features: ['time_in_hospital', 'num_medications'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 13 })),
    outlierCount: 312,
    totalCount: 25000,
  },
  qualityScore: 74,
  insights: [
    { id: 'ins-1', text: 'Moderate class imbalance: 22% readmission rate. Will use stratified sampling and optimize for AUC-ROC to handle imbalance.', type: 'warning' },
    { id: 'ins-2', text: '1,250 missing values across 8 features (mainly lab results). Will apply KNN imputation for numeric and mode imputation for categorical.', type: 'warning' },
    { id: 'ins-3', text: 'Diagnosis codes have 847 unique values — high cardinality. Will group into ICD categories to reduce dimensionality.', type: 'info' },
    { id: 'ins-4', text: 'Number of procedures and days in hospital show strong positive correlation (0.72) with readmission risk.', type: 'success' },
    { id: 'ins-5', text: '312 outlier patients with extreme hospital stays (>30 days). These represent complex cases — retaining for model training.', type: 'info' },
    { id: 'ins-6', text: 'Data quality score: 74/100. Requires preprocessing attention. The AI will handle imputation and encoding autonomously.', type: 'success' },
  ],
}

// ── employee-attrition ────────────────────────────────────────────────────────
const employeeAttritionEDA: EDAResults = {
  summary: { rows: 14999, columns: 35, numericFeatures: 18, categoricalFeatures: 17, memoryUsage: '8.7 MB', duplicateRows: 0 },
  missingValues: { columns: ['PerformanceRating', 'YearsSinceLastPromotion'], values: [0, 0] },
  distributions: [
    {
      feature: 'Age',
      type: 'numeric',
      bins: [
        { label: '18-25', count: 1240 },
        { label: '26-32', count: 3420 },
        { label: '33-39', count: 3840 },
        { label: '40-46', count: 3120 },
        { label: '47-53', count: 2140 },
        { label: '54-60', count: 1239 },
      ],
      stats: { mean: 36.9, median: 36.0, std: 9.13, min: 18, max: 60 },
    },
    {
      feature: 'MonthlyIncome',
      type: 'numeric',
      bins: [
        { label: '$1k-3k', count: 4420 },
        { label: '$3k-5k', count: 3840 },
        { label: '$5k-8k', count: 2980 },
        { label: '$8k-12k', count: 2140 },
        { label: '$12k-17k', count: 1220 },
        { label: '$17k+', count: 399 },
      ],
      stats: { mean: 6503, median: 4919, std: 4708, min: 1009, max: 19999 },
    },
    {
      feature: 'YearsAtCompany',
      type: 'numeric',
      bins: [
        { label: '0-2', count: 3920 },
        { label: '3-5', count: 4180 },
        { label: '6-10', count: 3240 },
        { label: '11-15', count: 1840 },
        { label: '16-25', count: 1419 },
        { label: '26+', count: 400 },
      ],
      stats: { mean: 7.0, median: 5.0, std: 6.13, min: 0, max: 40 },
    },
    {
      feature: 'JobRole',
      type: 'categorical',
      bins: [
        { label: 'Sales Executive', count: 2380 },
        { label: 'Research Scientist', count: 2220 },
        { label: 'Lab Technician', count: 1880 },
        { label: 'Mfg Director', count: 1320 },
        { label: 'Healthcare Rep', count: 1310 },
        { label: 'Other', count: 5889 },
      ],
    },
    {
      feature: 'Department',
      type: 'categorical',
      bins: [
        { label: 'Sales', count: 5660 },
        { label: 'R&D', count: 8100 },
        { label: 'HR', count: 1239 },
      ],
    },
    {
      feature: 'Attrition',
      type: 'categorical',
      bins: [
        { label: 'No', count: 12567 },
        { label: 'Yes', count: 2432 },
      ],
    },
  ],
  correlations: {
    features: ['Income', 'YearsComp', 'Satisf', 'Attrition'],
    matrix: [
      [1.0, 0.50, 0.12, -0.24],
      [0.50, 1.0, 0.09, -0.17],
      [0.12, 0.09, 1.0, -0.31],
      [-0.24, -0.17, -0.31, 1.0],
    ],
  },
  outliers: {
    features: ['MonthlyIncome', 'YearsAtCompany'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 10 })),
    outlierCount: 98,
    totalCount: 14999,
  },
  qualityScore: 91,
  insights: [
    { id: 'ins-1', text: 'Class imbalance detected: 16.2% attrition rate. Will apply class weighting and optimize for F1 Score to balance precision and recall.', type: 'warning' },
    { id: 'ins-2', text: 'No missing values detected across all 35 features — excellent data quality for HR analytics.', type: 'success' },
    { id: 'ins-3', text: 'MonthlyIncome shows high variance across departments (CV: 0.52). Will engineer income-to-role-average ratio as a relative compensation signal.', type: 'info' },
    { id: 'ins-4', text: 'JobSatisfaction and WorkLifeBalance are ordinal features (1-4 scale). Will preserve ordinality during encoding.', type: 'info' },
    { id: 'ins-5', text: 'YearsAtCompany and YearsWithCurrentManager show strong correlation (0.77). Will monitor for multicollinearity.', type: 'warning' },
    { id: 'ins-6', text: 'Data quality score: 91/100. High-quality HR dataset. The AI will engineer tenure ratios and satisfaction trajectory features automatically.', type: 'success' },
  ],
}

// ── energy-consumption ────────────────────────────────────────────────────────
const energyConsumptionEDA: EDAResults = {
  summary: { rows: 35040, columns: 18, numericFeatures: 15, categoricalFeatures: 3, memoryUsage: '18.4 MB', duplicateRows: 0 },
  missingValues: { columns: ['solar_irradiance', 'wind_speed', 'cloud_cover'], values: [420, 180, 95] },
  distributions: [
    {
      feature: 'consumption_kwh',
      type: 'numeric',
      bins: [
        { label: '0-200', count: 6840 },
        { label: '200-400', count: 9320 },
        { label: '400-600', count: 8480 },
        { label: '600-900', count: 6120 },
        { label: '900-1200', count: 3180 },
        { label: '1200+', count: 1100 },
      ],
      stats: { mean: 452.8, median: 398.4, std: 298.7, min: 12.4, max: 2840.6 },
    },
    {
      feature: 'temperature',
      type: 'numeric',
      bins: [
        { label: '-5–5°C', count: 3420 },
        { label: '5–15°C', count: 7840 },
        { label: '15–22°C', count: 9120 },
        { label: '22–28°C', count: 8340 },
        { label: '28–35°C', count: 5240 },
        { label: '35°C+', count: 1080 },
      ],
      stats: { mean: 18.6, median: 19.2, std: 9.84, min: -8.2, max: 42.1 },
    },
    {
      feature: 'humidity',
      type: 'numeric',
      bins: [
        { label: '20-40%', count: 5820 },
        { label: '40-55%', count: 9140 },
        { label: '55-70%', count: 11240 },
        { label: '70-85%', count: 6840 },
        { label: '85-100%', count: 2000 },
      ],
      stats: { mean: 61.4, median: 63.0, std: 18.3, min: 14.2, max: 99.8 },
    },
    {
      feature: 'hour',
      type: 'categorical',
      bins: [
        { label: '00-06 (Night)', count: 8760 },
        { label: '06-09 (Morning)', count: 4380 },
        { label: '09-17 (Daytime)', count: 17520 },
        { label: '17-21 (Evening)', count: 2920 },
        { label: '21-24 (Late)', count: 1460 },
      ],
    },
    {
      feature: 'day_of_week',
      type: 'categorical',
      bins: [
        { label: 'Monday', count: 5006 },
        { label: 'Tuesday', count: 5006 },
        { label: 'Wednesday', count: 5006 },
        { label: 'Thursday', count: 5006 },
        { label: 'Friday', count: 5006 },
        { label: 'Weekend', count: 10010 },
      ],
    },
    {
      feature: 'grid_zone',
      type: 'categorical',
      bins: [
        { label: 'Zone A', count: 8760 },
        { label: 'Zone B', count: 8760 },
        { label: 'Zone C', count: 8760 },
        { label: 'Zone D', count: 8760 },
      ],
    },
  ],
  correlations: {
    features: ['kWh', 'Temp', 'Humid', 'Hour'],
    matrix: [
      [1.0, 0.71, 0.24, 0.38],
      [0.71, 1.0, -0.12, 0.08],
      [0.24, -0.12, 1.0, 0.05],
      [0.38, 0.08, 0.05, 1.0],
    ],
  },
  outliers: {
    features: ['consumption_kwh', 'temperature'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 7 })),
    outlierCount: 67,
    totalCount: 35040,
  },
  qualityScore: 83,
  insights: [
    { id: 'ins-1', text: 'Hourly time series spanning 4 years. Strong daily and weekly seasonality detected — will engineer Fourier features for cyclic patterns.', type: 'info' },
    { id: 'ins-2', text: '420 missing readings (1.2%) — likely sensor outages. Will apply linear interpolation within each zone.', type: 'warning' },
    { id: 'ins-3', text: 'Temperature shows the strongest correlation with consumption (r=0.71). Will engineer temperature-humidity interaction terms.', type: 'success' },
    { id: 'ins-4', text: 'Peak demand hours (8-10am, 6-8pm) show 2.3x average consumption. Engineering time-of-day categorical features.', type: 'info' },
    { id: 'ins-5', text: '67 anomalous consumption spikes detected — likely industrial events. Flagging for anomaly detection model training.', type: 'warning' },
    { id: 'ins-6', text: 'Data quality score: 83/100. Good quality with minor gaps. Lag features and rolling windows will be engineered automatically.', type: 'success' },
  ],
}

// ── insurance-claims ──────────────────────────────────────────────────────────
const insuranceClaimsEDA: EDAResults = {
  summary: { rows: 40000, columns: 28, numericFeatures: 14, categoricalFeatures: 14, memoryUsage: '19.6 MB', duplicateRows: 42 },
  missingValues: { columns: ['collision_type', 'property_damage', 'police_report_available', '_c39'], values: [580, 1480, 1640, 360] },
  distributions: [
    {
      feature: 'total_claim_amount',
      type: 'numeric',
      bins: [
        { label: '$0-10k', count: 7840 },
        { label: '$10k-25k', count: 11320 },
        { label: '$25k-50k', count: 12480 },
        { label: '$50k-75k', count: 5640 },
        { label: '$75k-100k', count: 2120 },
        { label: '$100k+', count: 600 },
      ],
      stats: { mean: 33842, median: 31200, std: 24918, min: 100, max: 139700 },
    },
    {
      feature: 'policy_annual_premium',
      type: 'numeric',
      bins: [
        { label: '$500-800', count: 6420 },
        { label: '$800-1000', count: 9840 },
        { label: '$1000-1200', count: 11240 },
        { label: '$1200-1400', count: 7820 },
        { label: '$1400-1800', count: 4680 },
      ],
      stats: { mean: 1092, median: 1076, std: 243, min: 433, max: 2047 },
    },
    {
      feature: 'auto_year',
      type: 'numeric',
      bins: [
        { label: '1995-2000', count: 3840 },
        { label: '2001-2005', count: 7120 },
        { label: '2006-2010', count: 10240 },
        { label: '2011-2015', count: 11480 },
        { label: '2016+', count: 7320 },
      ],
      stats: { mean: 2008, median: 2009, std: 5.7, min: 1995, max: 2015 },
    },
    {
      feature: 'incident_type',
      type: 'categorical',
      bins: [
        { label: 'Multi-vehicle Collision', count: 14820 },
        { label: 'Single Vehicle Collision', count: 12440 },
        { label: 'Vehicle Theft', count: 6840 },
        { label: 'Parked Car', count: 5900 },
      ],
    },
    {
      feature: 'incident_severity',
      type: 'categorical',
      bins: [
        { label: 'Minor Damage', count: 16840 },
        { label: 'Major Damage', count: 13420 },
        { label: 'Total Loss', count: 5840 },
        { label: 'Trivial Damage', count: 3900 },
      ],
    },
    {
      feature: 'fraud_reported',
      type: 'categorical',
      bins: [
        { label: 'Not Fraud (N)', count: 37280 },
        { label: 'Fraud (Y)', count: 2720 },
      ],
    },
  ],
  correlations: {
    features: ['ClaimAmt', 'Premium', 'Severity', 'Fraud'],
    matrix: [
      [1.0, 0.23, 0.52, 0.18],
      [0.23, 1.0, 0.08, -0.04],
      [0.52, 0.08, 1.0, 0.22],
      [0.18, -0.04, 0.22, 1.0],
    ],
  },
  outliers: {
    features: ['total_claim_amount', 'policy_annual_premium'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 11 })),
    outlierCount: 234,
    totalCount: 40000,
  },
  qualityScore: 85,
  insights: [
    { id: 'ins-1', text: 'Severe class imbalance: only 6.8% of claims are fraudulent. Will apply SMOTE and optimize for Precision-Recall AUC to minimize false positives.', type: 'warning' },
    { id: 'ins-2', text: '890 missing values across 4 features (mainly witness and police report fields). Will impute with "Unknown" category.', type: 'warning' },
    { id: 'ins-3', text: 'Claim amount distribution is heavily right-skewed (skewness: 8.4). Log transformation will normalize for linear models.', type: 'info' },
    { id: 'ins-4', text: 'Policy tenure shows inverse correlation with fraud probability — newer policies are 3.2x more likely to be fraudulent.', type: 'success' },
    { id: 'ins-5', text: '234 high-value claims (>$100K) detected. These warrant special attention — will engineer a high-value claim flag feature.', type: 'info' },
    { id: 'ins-6', text: 'Data quality score: 85/100. Good quality. The AI will engineer claim velocity, provider network, and behavioral anomaly features automatically.', type: 'success' },
  ],
}

// ── predictive-maintenance ────────────────────────────────────────────────────
const predictiveMaintenanceEDA: EDAResults = {
  summary: { rows: 50000, columns: 25, numericFeatures: 22, categoricalFeatures: 3, memoryUsage: '28.4 MB', duplicateRows: 0 },
  missingValues: { columns: ['pressure', 'vibration_rms', 'oil_temperature'], values: [1050, 380, 140] },
  distributions: [
    {
      feature: 'temperature',
      type: 'numeric',
      bins: [
        { label: '40-55°C', count: 8420 },
        { label: '55-65°C', count: 14280 },
        { label: '65-75°C', count: 16840 },
        { label: '75-85°C', count: 7920 },
        { label: '85-100°C', count: 2540 },
      ],
      stats: { mean: 68.2, median: 67.5, std: 12.4, min: 36.8, max: 119.7 },
    },
    {
      feature: 'vibration',
      type: 'numeric',
      bins: [
        { label: '0.0-0.2 g', count: 12840 },
        { label: '0.2-0.5 g', count: 18420 },
        { label: '0.5-1.0 g', count: 11240 },
        { label: '1.0-2.0 g', count: 5620 },
        { label: '2.0+ g', count: 1880 },
      ],
      stats: { mean: 0.64, median: 0.48, std: 0.72, min: 0.01, max: 8.94 },
    },
    {
      feature: 'pressure',
      type: 'numeric',
      bins: [
        { label: '80-100 bar', count: 9840 },
        { label: '100-120 bar', count: 16420 },
        { label: '120-140 bar', count: 14280 },
        { label: '140-160 bar', count: 7320 },
        { label: '160+ bar', count: 2140 },
      ],
      stats: { mean: 122.4, median: 120.8, std: 21.7, min: 72.3, max: 198.6 },
    },
    {
      feature: 'machine_id',
      type: 'categorical',
      bins: [
        { label: 'Machine A', count: 12500 },
        { label: 'Machine B', count: 12500 },
        { label: 'Machine C', count: 12500 },
        { label: 'Machine D', count: 12500 },
      ],
    },
    {
      feature: 'failure_type',
      type: 'categorical',
      bins: [
        { label: 'No Failure', count: 41100 },
        { label: 'Heat Failure', count: 3340 },
        { label: 'Vibration Failure', count: 2840 },
        { label: 'Pressure Failure', count: 1920 },
        { label: 'Power Failure', count: 800 },
      ],
    },
    {
      feature: 'maintenance_flag',
      type: 'categorical',
      bins: [
        { label: 'Normal Operation', count: 43200 },
        { label: 'Post-Maintenance', count: 6800 },
      ],
    },
  ],
  correlations: {
    features: ['Temp', 'Vibration', 'Pressure', 'Failure'],
    matrix: [
      [1.0, 0.63, 0.28, 0.52],
      [0.63, 1.0, 0.21, 0.48],
      [0.28, 0.21, 1.0, 0.34],
      [0.52, 0.48, 0.34, 1.0],
    ],
  },
  outliers: {
    features: ['temperature', 'vibration'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 14 })),
    outlierCount: 1240,
    totalCount: 50000,
  },
  qualityScore: 88,
  insights: [
    { id: 'ins-1', text: 'Sensor time series spans 6 months at 5-minute intervals. Strong temporal autocorrelation detected — will engineer rolling-window and lag features automatically.', type: 'info' },
    { id: 'ins-2', text: 'Class imbalance: only 17.8% of readings precede a failure event. Will apply SMOTE and class-weighted training to prevent healthy-state bias.', type: 'warning' },
    { id: 'ins-3', text: 'Vibration and temperature show 0.84 correlation with failure events — strongest predictive signals. Rate-of-change features will be engineered for both.', type: 'success' },
    { id: 'ins-4', text: '1,240 anomalous sensor spikes detected (likely post-maintenance warm-up). Flagging with maintenance-log events to prevent false-positive training.', type: 'warning' },
    { id: 'ins-5', text: 'Pressure sensor shows 2.1% missing values — likely sensor outages during maintenance windows. Will impute using forward-fill within each machine.', type: 'info' },
    { id: 'ins-6', text: 'Data quality score: 88/100. High-quality sensor dataset. Rolling degradation trends and inter-sensor ratio features will be engineered automatically.', type: 'success' },
  ],
}

// ── logistics-delivery-delay ─────────────────────────────────────────────────
const logisticsDeliveryDelayEDA: EDAResults = {
  summary: { rows: 25000, columns: 12, numericFeatures: 6, categoricalFeatures: 6, memoryUsage: '3.8 MB', duplicateRows: 0 },
  missingValues: { columns: ['delivery_rating', 'weather_condition', 'delivery_cost'], values: [0, 0, 0] },
  distributions: [
    {
      feature: 'distance_km',
      type: 'numeric',
      bins: [
        { label: '0-50', count: 4120 },
        { label: '50-150', count: 6840 },
        { label: '150-300', count: 7280 },
        { label: '300-500', count: 4120 },
        { label: '500-800', count: 1940 },
        { label: '800+', count: 700 },
      ],
      stats: { mean: 198.4, median: 162.0, std: 178.3, min: 2.1, max: 1247.6 },
    },
    {
      feature: 'package_weight_kg',
      type: 'numeric',
      bins: [
        { label: '0-2', count: 5420 },
        { label: '2-5', count: 8340 },
        { label: '5-10', count: 6120 },
        { label: '10-20', count: 3480 },
        { label: '20-50', count: 1340 },
        { label: '50+', count: 300 },
      ],
      stats: { mean: 7.2, median: 4.8, std: 8.94, min: 0.1, max: 98.5 },
    },
    {
      feature: 'actual_delivery_hours',
      type: 'numeric',
      bins: [
        { label: '0-12', count: 4840 },
        { label: '12-24', count: 7620 },
        { label: '24-48', count: 6840 },
        { label: '48-72', count: 3420 },
        { label: '72-120', count: 1680 },
        { label: '120+', count: 600 },
      ],
      stats: { mean: 32.8, median: 24.0, std: 28.6, min: 0.5, max: 312.0 },
    },
    {
      feature: 'delivery_partner',
      type: 'categorical',
      bins: [
        { label: 'Delhivery', count: 4120 },
        { label: 'Blue Dart', count: 3580 },
        { label: 'FedEx', count: 3240 },
        { label: 'DHL', count: 2980 },
        { label: 'Amazon Logistics', count: 2860 },
        { label: 'Others', count: 8220 },
      ],
    },
    {
      feature: 'vehicle_type',
      type: 'categorical',
      bins: [
        { label: 'Truck', count: 7420 },
        { label: 'Van', count: 5840 },
        { label: 'Bike', count: 4980 },
        { label: 'EV Van', count: 3120 },
        { label: 'Scooter', count: 2340 },
        { label: 'EV Bike', count: 1300 },
      ],
    },
    {
      feature: 'is_delayed',
      type: 'categorical',
      bins: [
        { label: 'On Time (0)', count: 15240 },
        { label: 'Delayed (1)', count: 9760 },
      ],
    },
  ],
  correlations: {
    features: ['distance', 'weight', 'actual_hrs', 'delayed'],
    matrix: [
      [1.0, 0.15, 0.72, 0.41],
      [0.15, 1.0, 0.28, 0.19],
      [0.72, 0.28, 1.0, 0.58],
      [0.41, 0.19, 0.58, 1.0],
    ],
  },
  outliers: {
    features: ['distance_km', 'actual_delivery_hours'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 11 })),
    outlierCount: 245,
    totalCount: 25000,
  },
  qualityScore: 89,
  insights: [
    { id: 'ins-1', text: 'Moderate class balance: 39% of deliveries are delayed. Will use stratified sampling and optimize for F1 Score.', type: 'info' },
    { id: 'ins-2', text: 'No missing values detected across all 12 features — clean dataset ready for modelling.', type: 'success' },
    { id: 'ins-3', text: 'Strong correlation (0.72) between distance and actual delivery hours — will monitor for multicollinearity and engineer speed-based features.', type: 'warning' },
    { id: 'ins-4', text: 'Weather condition is a key categorical predictor — stormy and foggy conditions show 2.4x higher delay rates.', type: 'info' },
    { id: 'ins-5', text: '245 outlier deliveries detected with extreme distances (>800km) or delivery times (>120h). Retaining as informative edge cases.', type: 'warning' },
    { id: 'ins-6', text: 'Data quality score: 89/100. High-quality logistics dataset. The AI will engineer distance-time ratios and weather severity features automatically.', type: 'success' },
  ],
}

// ── logistics-freight-cost ──────────────────────────────────────────────────
const logisticsFreightCostEDA: EDAResults = {
  summary: { rows: 5964, columns: 12, numericFeatures: 6, categoricalFeatures: 6, memoryUsage: '1.2 MB', duplicateRows: 12 },
  missingValues: { columns: ['weight_kg', 'line_item_value', 'freight_cost_usd'], values: [48, 0, 0] },
  distributions: [
    {
      feature: 'freight_cost_usd',
      type: 'numeric',
      bins: [
        { label: '$0-500', count: 1840 },
        { label: '$500-2k', count: 1420 },
        { label: '$2k-10k', count: 1280 },
        { label: '$10k-50k', count: 920 },
        { label: '$50k-150k', count: 380 },
        { label: '$150k+', count: 124 },
      ],
      stats: { mean: 12842, median: 2680, std: 28940, min: 0.75, max: 289653 },
    },
    {
      feature: 'weight_kg',
      type: 'numeric',
      bins: [
        { label: '0-100', count: 1640 },
        { label: '100-500', count: 1420 },
        { label: '500-2k', count: 1280 },
        { label: '2k-10k', count: 1040 },
        { label: '10k-50k', count: 460 },
        { label: '50k+', count: 124 },
      ],
      stats: { mean: 4218, median: 842, std: 9840, min: 0.2, max: 98420 },
    },
    {
      feature: 'line_item_value',
      type: 'numeric',
      bins: [
        { label: '$0-1k', count: 1240 },
        { label: '$1k-10k', count: 1680 },
        { label: '$10k-50k', count: 1420 },
        { label: '$50k-200k', count: 1040 },
        { label: '$200k-1M', count: 460 },
        { label: '$1M+', count: 124 },
      ],
      stats: { mean: 84320, median: 18420, std: 182640, min: 12.5, max: 4280000 },
    },
    {
      feature: 'shipment_mode',
      type: 'categorical',
      bins: [
        { label: 'Air', count: 2840 },
        { label: 'Truck', count: 1420 },
        { label: 'Ocean', count: 1240 },
        { label: 'Air Charter', count: 464 },
      ],
    },
    {
      feature: 'product_group',
      type: 'categorical',
      bins: [
        { label: 'ARV', count: 2140 },
        { label: 'HRDT', count: 1680 },
        { label: 'ANTM', count: 1020 },
        { label: 'ACT', count: 740 },
        { label: 'MRDT', count: 384 },
      ],
    },
    {
      feature: 'country',
      type: 'categorical',
      bins: [
        { label: 'South Africa', count: 620 },
        { label: 'Nigeria', count: 540 },
        { label: 'Kenya', count: 480 },
        { label: 'Tanzania', count: 420 },
        { label: 'Uganda', count: 380 },
        { label: '38 others', count: 3524 },
      ],
    },
  ],
  correlations: {
    features: ['freight', 'weight', 'value', 'quantity'],
    matrix: [
      [1.0, 0.68, 0.54, 0.42],
      [0.68, 1.0, 0.38, 0.31],
      [0.54, 0.38, 1.0, 0.62],
      [0.42, 0.31, 0.62, 1.0],
    ],
  },
  outliers: {
    features: ['freight_cost_usd', 'weight_kg'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 9 })),
    outlierCount: 178,
    totalCount: 5964,
  },
  qualityScore: 82,
  insights: [
    { id: 'ins-1', text: 'Target variable (freight_cost_usd) is heavily right-skewed (skewness: 12.4). Will apply log transformation for regression modelling.', type: 'warning' },
    { id: 'ins-2', text: '48 missing weight values (0.8%) — likely data entry gaps. Will impute using median weight per product group.', type: 'info' },
    { id: 'ins-3', text: 'Strong correlation (0.68) between weight and freight cost — weight is the dominant cost driver across all shipment modes.', type: 'success' },
    { id: 'ins-4', text: 'Air Charter shipments average 8.4x the cost of standard Air — will engineer shipment mode interaction features.', type: 'info' },
    { id: 'ins-5', text: '178 outlier shipments with costs >$150K. These are bulk Air Charter shipments — retaining as valid high-value data points.', type: 'warning' },
    { id: 'ins-6', text: 'Data quality score: 82/100. Good quality. The AI will engineer weight-per-unit ratios and vendor term cost multipliers automatically.', type: 'success' },
  ],
}

// ── logistics-delivery-outcome ──────────────────────────────────────────────
const logisticsDeliveryOutcomeEDA: EDAResults = {
  summary: { rows: 180519, columns: 31, numericFeatures: 15, categoricalFeatures: 16, memoryUsage: '56.5 MB', duplicateRows: 0 },
  missingValues: { columns: ['order_status', 'product_price', 'customer_state'], values: [0, 0, 0] },
  distributions: [
    {
      feature: 'days_for_shipping_real',
      type: 'numeric',
      bins: [
        { label: '0-1', count: 24680 },
        { label: '2-3', count: 62840 },
        { label: '4-5', count: 54120 },
        { label: '6-7', count: 28460 },
        { label: '8+', count: 10419 },
      ],
      stats: { mean: 3.5, median: 3.0, std: 1.84, min: 0, max: 12 },
    },
    {
      feature: 'benefit_per_order',
      type: 'numeric',
      bins: [
        { label: '-500 to -100', count: 18240 },
        { label: '-100 to 0', count: 32480 },
        { label: '0 to 50', count: 54120 },
        { label: '50 to 150', count: 48640 },
        { label: '150 to 300', count: 19240 },
        { label: '300+', count: 7799 },
      ],
      stats: { mean: 48.2, median: 32.8, std: 128.4, min: -892, max: 1240 },
    },
    {
      feature: 'order_item_discount_rate',
      type: 'numeric',
      bins: [
        { label: '0-5%', count: 42120 },
        { label: '5-10%', count: 38640 },
        { label: '10-20%', count: 52480 },
        { label: '20-30%', count: 31240 },
        { label: '30%+', count: 16039 },
      ],
      stats: { mean: 14.2, median: 12.0, std: 9.84, min: 0, max: 50 },
    },
    {
      feature: 'delivery_status',
      type: 'categorical',
      bins: [
        { label: 'Late delivery', count: 99302 },
        { label: 'Advance shipping', count: 41519 },
        { label: 'Shipping on time', count: 32493 },
        { label: 'Shipping canceled', count: 7205 },
      ],
    },
    {
      feature: 'shipping_mode',
      type: 'categorical',
      bins: [
        { label: 'Standard Class', count: 107880 },
        { label: 'Second Class', count: 34840 },
        { label: 'First Class', count: 28420 },
        { label: 'Same Day', count: 9379 },
      ],
    },
    {
      feature: 'market',
      type: 'categorical',
      bins: [
        { label: 'LATAM', count: 45840 },
        { label: 'Europe', count: 40120 },
        { label: 'Pacific Asia', count: 38640 },
        { label: 'USCA', count: 34280 },
        { label: 'Africa', count: 21639 },
      ],
    },
  ],
  correlations: {
    features: ['real_days', 'sched_days', 'discount', 'benefit'],
    matrix: [
      [1.0, 0.12, -0.08, -0.15],
      [0.12, 1.0, -0.04, -0.06],
      [-0.08, -0.04, 1.0, -0.42],
      [-0.15, -0.06, -0.42, 1.0],
    ],
  },
  outliers: {
    features: ['benefit_per_order', 'order_item_discount_rate'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 6 })),
    outlierCount: 1842,
    totalCount: 180519,
  },
  qualityScore: 85,
  insights: [
    { id: 'ins-1', text: 'Imbalanced multi-class target: Late delivery dominates at 55%, Canceled is only 4%. Will use stratified sampling and class-weighted training.', type: 'warning' },
    { id: 'ins-2', text: 'No missing values across 31 features — high-quality e-commerce dataset. 180,519 records provide robust statistical power.', type: 'success' },
    { id: 'ins-3', text: 'Shipping gap (actual - scheduled days) is the strongest delivery outcome predictor. Engineering this derived feature automatically.', type: 'info' },
    { id: 'ins-4', text: 'Discount rate and profit ratio are inversely correlated (-0.42) — high discounts compress margins and correlate with cancellation risk.', type: 'info' },
    { id: 'ins-5', text: '1,842 outlier orders detected with extreme benefit values. These are high-value B2B orders — retaining for model training.', type: 'warning' },
    { id: 'ins-6', text: 'Data quality score: 85/100. Large, clean dataset spanning 5 global markets. The AI will handle multi-class balancing and feature engineering automatically.', type: 'success' },
  ],
}

// ── logistics-demand-forecast ───────────────────────────────────────────────
const logisticsDemandForecastEDA: EDAResults = {
  summary: { rows: 1337, columns: 11, numericFeatures: 11, categoricalFeatures: 0, memoryUsage: '0.3 MB', duplicateRows: 0 },
  missingValues: { columns: ['avg_weather_severity', 'avg_port_congestion'], values: [12, 8] },
  distributions: [
    {
      feature: 'avg_daily_demand',
      type: 'numeric',
      bins: [
        { label: '0-200', count: 180 },
        { label: '200-400', count: 320 },
        { label: '400-600', count: 380 },
        { label: '600-800', count: 260 },
        { label: '800-1000', count: 132 },
        { label: '1000+', count: 65 },
      ],
      stats: { mean: 482.6, median: 448.0, std: 234.8, min: 42.0, max: 1480.0 },
    },
    {
      feature: 'avg_shipping_cost',
      type: 'numeric',
      bins: [
        { label: '$0-50', count: 240 },
        { label: '$50-100', count: 420 },
        { label: '$100-150', count: 340 },
        { label: '$150-200', count: 220 },
        { label: '$200+', count: 117 },
      ],
      stats: { mean: 108.4, median: 98.0, std: 62.8, min: 12.0, max: 342.0 },
    },
    {
      feature: 'avg_traffic_congestion',
      type: 'numeric',
      bins: [
        { label: '0.0-0.2', count: 280 },
        { label: '0.2-0.4', count: 380 },
        { label: '0.4-0.6', count: 340 },
        { label: '0.6-0.8', count: 220 },
        { label: '0.8-1.0', count: 117 },
      ],
      stats: { mean: 0.42, median: 0.38, std: 0.22, min: 0.01, max: 0.98 },
    },
    {
      feature: 'avg_weather_severity',
      type: 'numeric',
      bins: [
        { label: '0-1', count: 420 },
        { label: '1-2', count: 380 },
        { label: '2-3', count: 280 },
        { label: '3-4', count: 168 },
        { label: '4-5', count: 89 },
      ],
      stats: { mean: 1.84, median: 1.60, std: 1.12, min: 0.0, max: 4.92 },
    },
    {
      feature: 'avg_port_congestion',
      type: 'numeric',
      bins: [
        { label: '0.0-0.2', count: 320 },
        { label: '0.2-0.4', count: 380 },
        { label: '0.4-0.6', count: 320 },
        { label: '0.6-0.8', count: 210 },
        { label: '0.8-1.0', count: 107 },
      ],
      stats: { mean: 0.38, median: 0.34, std: 0.24, min: 0.0, max: 0.97 },
    },
    {
      feature: 'avg_supplier_reliability',
      type: 'numeric',
      bins: [
        { label: '0.5-0.6', count: 120 },
        { label: '0.6-0.7', count: 280 },
        { label: '0.7-0.8', count: 420 },
        { label: '0.8-0.9', count: 340 },
        { label: '0.9-1.0', count: 177 },
      ],
      stats: { mean: 0.76, median: 0.78, std: 0.11, min: 0.48, max: 0.99 },
    },
  ],
  correlations: {
    features: ['demand', 'shipping', 'traffic', 'weather'],
    matrix: [
      [1.0, 0.62, 0.38, -0.29],
      [0.62, 1.0, 0.24, -0.14],
      [0.38, 0.24, 1.0, 0.31],
      [-0.29, -0.14, 0.31, 1.0],
    ],
  },
  outliers: {
    features: ['avg_daily_demand', 'avg_shipping_cost'],
    points: Array.from({ length: 150 }, (_, i) => ({ x: Math.random(), y: Math.random(), isOutlier: i < 5 })),
    outlierCount: 34,
    totalCount: 1337,
  },
  qualityScore: 86,
  insights: [
    { id: 'ins-1', text: 'Daily time series spanning 3.7 years (Jan 2021 – Aug 2024). Strong weekly seasonality and annual trend detected — will engineer Fourier features.', type: 'info' },
    { id: 'ins-2', text: '20 missing values across 2 features (1.5%) — weather and port congestion gaps. Will apply linear interpolation for continuity.', type: 'warning' },
    { id: 'ins-3', text: 'Shipping cost shows strong positive correlation (0.62) with demand — higher demand drives logistics costs. Will engineer cost-per-unit demand feature.', type: 'success' },
    { id: 'ins-4', text: 'Weather severity inversely correlates with demand (-0.29) — severe weather reduces logistics activity. Engineering weather-demand interaction terms.', type: 'info' },
    { id: 'ins-5', text: '34 demand spike outliers detected — likely holiday or disruption-driven. Flagging for special event feature engineering.', type: 'warning' },
    { id: 'ins-6', text: 'Data quality score: 86/100. Good quality time-series data. Lag features, rolling windows, and exogenous variable interactions will be engineered automatically.', type: 'success' },
  ],
}

// ── registry ──────────────────────────────────────────────────────────────────
const edaDataMap: Record<string, EDAResults> = {
  'telco-churn':            telcoChurnEDA,
  'credit-fraud':           creditFraudEDA,
  'store-demand':           storeDemandEDA,
  'patient-readmission':    patientReadmissionEDA,
  'employee-attrition':     employeeAttritionEDA,
  'energy-consumption':     energyConsumptionEDA,
  'insurance-claims':       insuranceClaimsEDA,
  'predictive-maintenance': predictiveMaintenanceEDA,
  'logistics-delivery-delay':   logisticsDeliveryDelayEDA,
  'logistics-freight-cost':     logisticsFreightCostEDA,
  'logistics-delivery-outcome': logisticsDeliveryOutcomeEDA,
  'logistics-demand-forecast':  logisticsDemandForecastEDA,
}

export function getPrecomputedEDA(datasetId: string): EDAResults {
  return edaDataMap[datasetId] || telcoChurnEDA
}
