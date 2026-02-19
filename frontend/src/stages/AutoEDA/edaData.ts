import type { EDAResults } from '@/store/types'

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
    points: Array.from({ length: 150 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      isOutlier: i < 12,
    })),
    outlierCount: 187,
    totalCount: 7043,
  },
  qualityScore: 87,
  insights: [
    {
      id: 'ins-1',
      text: 'Found 11 missing values in TotalCharges (0.16%). These appear to be new customers with zero tenure — will impute with 0 during feature engineering.',
      type: 'info',
    },
    {
      id: 'ins-2',
      text: 'Data is clean with no duplicate records. 18 categorical features detected — will apply encoding strategies optimized for tree-based models.',
      type: 'success',
    },
    {
      id: 'ins-3',
      text: 'High correlation (0.83) between tenure and TotalCharges. Will monitor for multicollinearity during model training and consider feature interaction.',
      type: 'warning',
    },
    {
      id: 'ins-4',
      text: 'tenure shows a bimodal distribution — many short-tenure and long-tenure customers, fewer in the middle. This is a strong churn signal.',
      type: 'info',
    },
    {
      id: 'ins-5',
      text: '187 statistical outliers detected (2.7%). Most are high-value, long-tenure customers — retaining rather than removing, as they represent key business segments.',
      type: 'warning',
    },
    {
      id: 'ins-6',
      text: 'Data quality score: 87/100. High-quality dataset ready for autonomous ML pipeline. Minor issues with missing TotalCharges values will be handled automatically.',
      type: 'success',
    },
  ],
}

const edaDataMap: Record<string, EDAResults> = {
  'telco-churn': telcoChurnEDA,
  'credit-fraud': {
    ...telcoChurnEDA,
    summary: { ...telcoChurnEDA.summary, rows: 50000, columns: 30, numericFeatures: 28, categoricalFeatures: 2, memoryUsage: '22.1 MB' },
    qualityScore: 92,
    insights: [
      { id: 'ins-1', text: 'Highly imbalanced dataset detected: only 1.7% of transactions are fraudulent. Will apply SMOTE oversampling and optimize for Precision-Recall AUC.', type: 'warning' },
      { id: 'ins-2', text: 'All 28 numeric features are PCA-transformed (V1-V28). No missing values detected — data is clean and ready for modeling.', type: 'success' },
      { id: 'ins-3', text: 'Transaction Amount has heavy right-skew (skewness: 16.2). Will apply log transformation to normalize the distribution.', type: 'info' },
      { id: 'ins-4', text: 'Time feature shows clear cyclic patterns — higher fraud rates during early morning hours. Engineering time-based features.', type: 'info' },
      { id: 'ins-5', text: '142 outlier transactions detected with amounts >$2,500. These correlate with higher fraud probability — keeping as informative signals.', type: 'warning' },
      { id: 'ins-6', text: 'Data quality score: 92/100. Excellent quality. PCA preprocessing already handles feature scaling.', type: 'success' },
    ],
  },
  'store-demand': {
    ...telcoChurnEDA,
    summary: { ...telcoChurnEDA.summary, rows: 45000, columns: 15, numericFeatures: 8, categoricalFeatures: 7, memoryUsage: '12.8 MB' },
    qualityScore: 79,
    insights: [
      { id: 'ins-1', text: 'Time series data spanning 3 years across 10 stores. Detected strong weekly seasonality and annual trend patterns.', type: 'info' },
      { id: 'ins-2', text: '340 missing sales values (0.8%) — likely store closure days. Will impute using forward-fill within each store.', type: 'warning' },
      { id: 'ins-3', text: 'Promotions increase sales by an average of 34%. This feature will be critical for demand forecasting accuracy.', type: 'success' },
      { id: 'ins-4', text: 'High variance in sales across stores (CV: 0.68). Will train per-store models or include store embeddings.', type: 'info' },
      { id: 'ins-5', text: '89 extreme demand spikes detected — mostly holiday periods. Engineering holiday features for better prediction.', type: 'warning' },
      { id: 'ins-6', text: 'Data quality score: 79/100. Good quality with some gaps to address. Time-based features will be engineered automatically.', type: 'success' },
    ],
  },
  'patient-readmission': {
    ...telcoChurnEDA,
    summary: { ...telcoChurnEDA.summary, rows: 25000, columns: 35, numericFeatures: 12, categoricalFeatures: 23, memoryUsage: '15.2 MB' },
    qualityScore: 74,
    insights: [
      { id: 'ins-1', text: 'Moderate class imbalance: 22% readmission rate. Will use stratified sampling and optimize for AUC-ROC to handle imbalance.', type: 'warning' },
      { id: 'ins-2', text: '1,250 missing values across 8 features (mainly lab results). Will apply KNN imputation for numeric and mode imputation for categorical.', type: 'warning' },
      { id: 'ins-3', text: 'Diagnosis codes have 847 unique values — high cardinality. Will group into ICD categories to reduce dimensionality.', type: 'info' },
      { id: 'ins-4', text: 'Number of procedures and days in hospital show strong positive correlation (0.72) with readmission risk.', type: 'success' },
      { id: 'ins-5', text: '312 outlier patients with extreme hospital stays (>30 days). These represent complex cases — retaining for model training.', type: 'info' },
      { id: 'ins-6', text: 'Data quality score: 74/100. Requires preprocessing attention. The AI will handle imputation and encoding autonomously.', type: 'success' },
    ],
  },
  'employee-attrition': {
    ...telcoChurnEDA,
    summary: { ...telcoChurnEDA.summary, rows: 14999, columns: 35, numericFeatures: 18, categoricalFeatures: 17, memoryUsage: '8.7 MB' },
    qualityScore: 91,
    insights: [
      { id: 'ins-1', text: 'Class imbalance detected: 16.2% attrition rate. Will apply class weighting and optimize for F1 Score to balance precision and recall.', type: 'warning' },
      { id: 'ins-2', text: 'No missing values detected across all 35 features — excellent data quality for HR analytics.', type: 'success' },
      { id: 'ins-3', text: 'MonthlyIncome shows high variance across departments (CV: 0.52). Will engineer income-to-role-average ratio as a relative compensation signal.', type: 'info' },
      { id: 'ins-4', text: 'JobSatisfaction and WorkLifeBalance are ordinal features (1-4 scale). Will preserve ordinality during encoding.', type: 'info' },
      { id: 'ins-5', text: 'YearsAtCompany and YearsWithCurrentManager show strong correlation (0.77). Will monitor for multicollinearity.', type: 'warning' },
      { id: 'ins-6', text: 'Data quality score: 91/100. High-quality HR dataset. The AI will engineer tenure ratios and satisfaction trajectory features automatically.', type: 'success' },
    ],
  },
  'energy-consumption': {
    ...telcoChurnEDA,
    summary: { ...telcoChurnEDA.summary, rows: 35040, columns: 18, numericFeatures: 15, categoricalFeatures: 3, memoryUsage: '18.4 MB' },
    qualityScore: 83,
    insights: [
      { id: 'ins-1', text: 'Hourly time series spanning 4 years. Strong daily and weekly seasonality detected — will engineer Fourier features for cyclic patterns.', type: 'info' },
      { id: 'ins-2', text: '420 missing readings (1.2%) — likely sensor outages. Will apply linear interpolation within each zone.', type: 'warning' },
      { id: 'ins-3', text: 'Temperature shows the strongest correlation with consumption (r=0.71). Will engineer temperature-humidity interaction terms.', type: 'success' },
      { id: 'ins-4', text: 'Peak demand hours (8-10am, 6-8pm) show 2.3x average consumption. Engineering time-of-day categorical features.', type: 'info' },
      { id: 'ins-5', text: '67 anomalous consumption spikes detected — likely industrial events. Flagging for anomaly detection model training.', type: 'warning' },
      { id: 'ins-6', text: 'Data quality score: 83/100. Good quality with minor gaps. Lag features and rolling windows will be engineered automatically.', type: 'success' },
    ],
  },
  'insurance-claims': {
    ...telcoChurnEDA,
    summary: { ...telcoChurnEDA.summary, rows: 40000, columns: 28, numericFeatures: 14, categoricalFeatures: 14, memoryUsage: '19.6 MB' },
    qualityScore: 85,
    insights: [
      { id: 'ins-1', text: 'Severe class imbalance: only 6.8% of claims are fraudulent. Will apply SMOTE and optimize for Precision-Recall AUC to minimize false positives.', type: 'warning' },
      { id: 'ins-2', text: '890 missing values across 4 features (mainly witness and police report fields). Will impute with "Unknown" category.', type: 'warning' },
      { id: 'ins-3', text: 'Claim amount distribution is heavily right-skewed (skewness: 8.4). Log transformation will normalize for linear models.', type: 'info' },
      { id: 'ins-4', text: 'Policy tenure shows inverse correlation with fraud probability — newer policies are 3.2x more likely to be fraudulent.', type: 'success' },
      { id: 'ins-5', text: '234 high-value claims (>$50K) detected. These warrant special attention — will engineer a high-value claim flag feature.', type: 'info' },
      { id: 'ins-6', text: 'Data quality score: 85/100. Good quality. The AI will engineer claim velocity, provider network, and behavioral anomaly features automatically.', type: 'success' },
    ],
  },
  'predictive-maintenance': {
    ...telcoChurnEDA,
    summary: { ...telcoChurnEDA.summary, rows: 50000, columns: 25, numericFeatures: 22, categoricalFeatures: 3, memoryUsage: '28.4 MB' },
    qualityScore: 88,
    insights: [
      { id: 'ins-1', text: 'Sensor time series spans 6 months at 5-minute intervals. Strong temporal autocorrelation detected — will engineer rolling-window and lag features automatically.', type: 'info' },
      { id: 'ins-2', text: 'Class imbalance: only 17.8% of readings precede a failure event. Will apply SMOTE and class-weighted training to prevent healthy-state bias.', type: 'warning' },
      { id: 'ins-3', text: 'Vibration and temperature show 0.84 correlation with failure events — strongest predictive signals. Rate-of-change features will be engineered for both.', type: 'success' },
      { id: 'ins-4', text: '1,240 anomalous sensor spikes detected (likely post-maintenance warm-up). Flagging with maintenance-log events to prevent false-positive training.', type: 'warning' },
      { id: 'ins-5', text: 'Pressure sensor shows 2.1% missing values — likely sensor outages during maintenance windows. Will impute using forward-fill within each machine.', type: 'info' },
      { id: 'ins-6', text: 'Data quality score: 88/100. High-quality sensor dataset. Rolling degradation trends and inter-sensor ratio features will be engineered automatically.', type: 'success' },
    ],
  },
}

export function getPrecomputedEDA(datasetId: string): EDAResults {
  return edaDataMap[datasetId] || telcoChurnEDA
}

