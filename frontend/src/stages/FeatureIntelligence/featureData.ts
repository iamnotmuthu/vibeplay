import type { FeatureResults } from '@/store/types'

const telcoChurnFeatures: FeatureResults = {
  importance: [
    { feature: 'tenure', score: 0.92, rank: 1 },
    { feature: 'Contract_Month-to-month', score: 0.87, rank: 2 },
    { feature: 'MonthlyCharges', score: 0.81, rank: 3 },
    { feature: 'TotalCharges', score: 0.74, rank: 4 },
    { feature: 'InternetService_Fiber', score: 0.68, rank: 5 },
    { feature: 'PaymentMethod_Electronic', score: 0.61, rank: 6 },
    { feature: 'OnlineSecurity_No', score: 0.55, rank: 7 },
    { feature: 'TechSupport_No', score: 0.49, rank: 8 },
    { feature: 'tenure_x_MonthlyCharges', score: 0.46, rank: 9 },
    { feature: 'StreamingTV', score: 0.38, rank: 10 },
    { feature: 'DeviceProtection', score: 0.31, rank: 11 },
    { feature: 'PaperlessBilling', score: 0.27, rank: 12 },
  ],
  engineeringLog: [
    { action: 'Impute', detail: 'Filled 11 missing TotalCharges values with median (1397.5)', impact: '+0.2% accuracy' },
    { action: 'Encode', detail: 'One-hot encoded 18 categorical features → 42 binary columns', impact: 'Required for models' },
    { action: 'Scale', detail: 'StandardScaler applied to tenure, MonthlyCharges, TotalCharges', impact: '+1.1% accuracy' },
    { action: 'Engineer', detail: 'Created tenure_x_MonthlyCharges interaction feature', impact: '+0.8% accuracy' },
    { action: 'Engineer', detail: 'Created avg_monthly_spend = TotalCharges / (tenure + 1)', impact: '+0.5% accuracy' },
    { action: 'Engineer', detail: 'Created service_count = sum of all add-on services', impact: '+0.3% accuracy' },
    { action: 'Engineer', detail: 'Created is_new_customer flag for tenure < 6 months', impact: '+0.4% accuracy' },
    { action: 'Select', detail: 'Removed 3 low-variance features (gender, PhoneService, MultipleLines)', impact: 'Reduced noise' },
    { action: 'Engineer', detail: 'Created contract_value_ratio = MonthlyCharges / avg_plan_cost', impact: '+0.2% accuracy' },
    { action: 'Validate', detail: 'No data leakage detected. Train/test split verified.', impact: 'Model integrity' },
  ],
  newFeatureCount: 5,
  insights: [
    { id: 'feat-1', text: 'tenure is the strongest churn predictor (importance: 0.92). Customers with < 12 months tenure are 4.2x more likely to churn.', type: 'warning' },
    { id: 'feat-2', text: 'The engineered feature tenure_x_MonthlyCharges captures a key interaction — high charges on short tenure is the strongest churn signal.', type: 'success' },
    { id: 'feat-3', text: 'Removed 3 features with near-zero variance. Final feature set: 44 features optimized for maximum predictive power.', type: 'info' },
  ],
}

const creditFraudFeatures: FeatureResults = {
  importance: [
    { feature: 'V14', score: 0.95, rank: 1 },
    { feature: 'V17', score: 0.89, rank: 2 },
    { feature: 'V12', score: 0.84, rank: 3 },
    { feature: 'V10', score: 0.78, rank: 4 },
    { feature: 'Amount_log', score: 0.73, rank: 5 },
    { feature: 'V16', score: 0.67, rank: 6 },
    { feature: 'V3', score: 0.62, rank: 7 },
    { feature: 'V7', score: 0.56, rank: 8 },
    { feature: 'hour_of_day', score: 0.51, rank: 9 },
    { feature: 'V11', score: 0.44, rank: 10 },
    { feature: 'V4', score: 0.39, rank: 11 },
    { feature: 'Amount_zscore', score: 0.34, rank: 12 },
  ],
  engineeringLog: [
    { action: 'Transform', detail: 'Log-transformed Amount feature (skewness 16.2 → 0.8)', impact: '+2.1% precision' },
    { action: 'Engineer', detail: 'Extracted hour_of_day from Time feature (cyclic encoding)', impact: '+1.8% recall' },
    { action: 'Engineer', detail: 'Created Amount_zscore for outlier-aware scaling', impact: '+0.6% precision' },
    { action: 'Balance', detail: 'Applied SMOTE oversampling: 492 → 3,000 fraud samples', impact: '+8.3% recall' },
    { action: 'Engineer', detail: 'Created time_since_last_txn rolling window feature', impact: '+1.2% precision' },
    { action: 'Engineer', detail: 'Created amount_deviation from user average', impact: '+0.9% recall' },
    { action: 'Select', detail: 'Removed V22, V23, V25 (importance < 0.01)', impact: 'Reduced overfitting' },
    { action: 'Validate', detail: 'Stratified split maintains 1.7% fraud ratio in both sets', impact: 'Model integrity' },
  ],
  newFeatureCount: 4,
  insights: [
    { id: 'feat-1', text: 'V14 (PCA component) is the strongest fraud signal with 0.95 importance. This likely captures transaction velocity patterns.', type: 'warning' },
    { id: 'feat-2', text: 'SMOTE oversampling boosted recall by 8.3% — critical for fraud detection where missing a fraud is costly.', type: 'success' },
    { id: 'feat-3', text: 'Time-based features (hour_of_day, time_since_last_txn) together contribute 3.0% improvement. Fraud patterns are strongly time-dependent.', type: 'info' },
  ],
}

const storeDemandFeatures: FeatureResults = {
  importance: [
    { feature: 'day_of_week', score: 0.91, rank: 1 },
    { feature: 'is_promotion', score: 0.86, rank: 2 },
    { feature: 'store_id_encoded', score: 0.80, rank: 3 },
    { feature: 'lag_7_sales', score: 0.76, rank: 4 },
    { feature: 'rolling_mean_30', score: 0.71, rank: 5 },
    { feature: 'month', score: 0.65, rank: 6 },
    { feature: 'is_holiday', score: 0.60, rank: 7 },
    { feature: 'year_trend', score: 0.53, rank: 8 },
    { feature: 'promo_lag_2d', score: 0.48, rank: 9 },
    { feature: 'temperature', score: 0.41, rank: 10 },
    { feature: 'week_of_year', score: 0.35, rank: 11 },
    { feature: 'competition_distance', score: 0.28, rank: 12 },
  ],
  engineeringLog: [
    { action: 'Impute', detail: 'Forward-filled 340 missing sales values within each store', impact: 'Data completeness' },
    { action: 'Engineer', detail: 'Created lag_7_sales (last week same day)', impact: '+4.2% R²' },
    { action: 'Engineer', detail: 'Created rolling_mean_30 (30-day rolling average)', impact: '+3.1% R²' },
    { action: 'Engineer', detail: 'Created promo_lag_2d (promotion effect 2-day lag)', impact: '+1.8% R²' },
    { action: 'Engineer', detail: 'Extracted cyclic features: day_of_week, month, week_of_year', impact: '+2.4% R²' },
    { action: 'Engineer', detail: 'Created is_holiday from calendar data (public + school)', impact: '+1.5% R²' },
    { action: 'Encode', detail: 'Target-encoded store_id (10 stores → 1 numeric feature)', impact: '+0.8% R²' },
    { action: 'Engineer', detail: 'Created year_trend as linear time feature for trend capture', impact: '+0.6% R²' },
    { action: 'Validate', detail: 'Time-based train/test split — no future data leakage', impact: 'Model integrity' },
  ],
  newFeatureCount: 7,
  insights: [
    { id: 'feat-1', text: 'day_of_week is the top predictor — weekend sales average 42% higher. Cyclic encoding preserves the circular nature of weekdays.', type: 'info' },
    { id: 'feat-2', text: 'Lag and rolling features (lag_7, rolling_mean_30) together add +7.3% R². Past sales are the best predictor of future demand.', type: 'success' },
    { id: 'feat-3', text: 'Promotional 2-day lag effect confirmed by feature importance. Demand stays elevated 48 hours after promotions end.', type: 'warning' },
  ],
}

const patientReadmissionFeatures: FeatureResults = {
  importance: [
    { feature: 'num_procedures', score: 0.88, rank: 1 },
    { feature: 'days_in_hospital', score: 0.84, rank: 2 },
    { feature: 'num_medications', score: 0.79, rank: 3 },
    { feature: 'num_diagnoses', score: 0.74, rank: 4 },
    { feature: 'age_group', score: 0.69, rank: 5 },
    { feature: 'discharge_disposition', score: 0.63, rank: 6 },
    { feature: 'admission_source', score: 0.57, rank: 7 },
    { feature: 'comorbidity_score', score: 0.52, rank: 8 },
    { feature: 'num_lab_procedures', score: 0.46, rank: 9 },
    { feature: 'diabetes_med_change', score: 0.41, rank: 10 },
    { feature: 'A1C_result', score: 0.35, rank: 11 },
    { feature: 'payer_code_grouped', score: 0.29, rank: 12 },
  ],
  engineeringLog: [
    { action: 'Impute', detail: 'KNN imputed 1,250 missing lab values (k=5, weighted)', impact: '+1.3% AUC' },
    { action: 'Encode', detail: 'Grouped 847 diagnosis codes into 18 ICD categories', impact: '+2.1% AUC' },
    { action: 'Engineer', detail: 'Created comorbidity_score from diagnosis combinations', impact: '+1.7% AUC' },
    { action: 'Engineer', detail: 'Created medication_intensity = num_medications / days_in_hospital', impact: '+0.9% AUC' },
    { action: 'Engineer', detail: 'Created procedure_complexity = num_procedures × avg_procedure_duration', impact: '+0.6% AUC' },
    { action: 'Encode', detail: 'Ordinal encoded age_group (10 buckets, preserving order)', impact: '+0.4% AUC' },
    { action: 'Engineer', detail: 'Created prior_visits_6mo from admission history', impact: '+1.1% AUC' },
    { action: 'Balance', detail: 'Applied stratified sampling: maintained 22% readmission ratio', impact: 'Model integrity' },
    { action: 'Validate', detail: 'Patient-level split — same patient never in both train and test', impact: 'No leakage' },
  ],
  newFeatureCount: 4,
  insights: [
    { id: 'feat-1', text: 'num_procedures is the strongest readmission predictor (0.88). Patients with 5+ procedures have 3.1x higher readmission risk.', type: 'warning' },
    { id: 'feat-2', text: 'The engineered comorbidity_score combines multiple diagnoses into a single risk metric — a key clinical insight for discharge planning.', type: 'success' },
    { id: 'feat-3', text: 'Diagnosis code grouping reduced cardinality from 847 to 18 categories while preserving 97% of predictive information.', type: 'info' },
  ],
}

const featureDataMap: Record<string, FeatureResults> = {
  'telco-churn': telcoChurnFeatures,
  'credit-fraud': creditFraudFeatures,
  'store-demand': storeDemandFeatures,
  'patient-readmission': patientReadmissionFeatures,
}

export function getPrecomputedFeatures(datasetId: string): FeatureResults {
  return featureDataMap[datasetId] || telcoChurnFeatures
}
