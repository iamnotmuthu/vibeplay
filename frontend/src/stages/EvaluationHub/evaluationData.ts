import type { EvaluationResults } from '@/store/types'

function generateROCCurve(auc: number): { fpr: number; tpr: number }[] {
  const points: { fpr: number; tpr: number }[] = [{ fpr: 0, tpr: 0 }]
  const steps = 20
  for (let i = 1; i < steps; i++) {
    const fpr = i / steps
    // Simple curve generation based on AUC
    const tpr = Math.min(1, Math.pow(fpr, 1 / (auc * 2.5)))
    points.push({ fpr, tpr })
  }
  points.push({ fpr: 1, tpr: 1 })
  return points
}

function generatePRCurve(precision: number, recall: number): { recall: number; precision: number }[] {
  const points: { recall: number; precision: number }[] = [{ recall: 0, precision: 1 }]
  const steps = 20
  for (let i = 1; i <= steps; i++) {
    const r = (i / steps) * recall * 1.2
    const p = precision + (1 - precision) * Math.exp(-3 * r)
    points.push({ recall: Math.min(r, 1), precision: Math.max(p, 0.1) })
  }
  return points
}

// ---- Telco Churn ----
const telcoEvaluation: EvaluationResults = {
  models: [
    {
      name: 'Logistic Regression',
      metrics: { accuracy: 0.812, precision: 0.674, recall: 0.582, f1: 0.625, auc: 0.843 },
      confusionMatrix: [[1542, 312], [384, 531]],
      rocCurve: generateROCCurve(0.843),
      prCurve: generatePRCurve(0.674, 0.582),
      shapValues: [
        { feature: 'tenure', value: -0.32 },
        { feature: 'Contract_Month-to-month', value: 0.28 },
        { feature: 'MonthlyCharges', value: 0.19 },
        { feature: 'InternetService_Fiber', value: 0.15 },
        { feature: 'TotalCharges', value: -0.12 },
        { feature: 'PaymentMethod_Electronic', value: 0.10 },
        { feature: 'OnlineSecurity_No', value: 0.08 },
        { feature: 'TechSupport_No', value: 0.06 },
      ],
    },
    {
      name: 'Random Forest',
      metrics: { accuracy: 0.856, precision: 0.748, recall: 0.651, f1: 0.696, auc: 0.891 },
      confusionMatrix: [[1612, 242], [320, 595]],
      rocCurve: generateROCCurve(0.891),
      prCurve: generatePRCurve(0.748, 0.651),
      shapValues: [
        { feature: 'tenure', value: -0.38 },
        { feature: 'Contract_Month-to-month', value: 0.31 },
        { feature: 'MonthlyCharges', value: 0.22 },
        { feature: 'TotalCharges', value: -0.16 },
        { feature: 'InternetService_Fiber', value: 0.14 },
        { feature: 'tenure_x_MonthlyCharges', value: 0.11 },
        { feature: 'PaymentMethod_Electronic', value: 0.09 },
        { feature: 'OnlineSecurity_No', value: 0.07 },
      ],
    },
    {
      name: 'XGBoost',
      metrics: { accuracy: 0.873, precision: 0.781, recall: 0.694, f1: 0.735, auc: 0.912 },
      confusionMatrix: [[1638, 216], [280, 635]],
      rocCurve: generateROCCurve(0.912),
      prCurve: generatePRCurve(0.781, 0.694),
      shapValues: [
        { feature: 'tenure', value: -0.41 },
        { feature: 'Contract_Month-to-month', value: 0.34 },
        { feature: 'MonthlyCharges', value: 0.24 },
        { feature: 'tenure_x_MonthlyCharges', value: 0.18 },
        { feature: 'TotalCharges', value: -0.15 },
        { feature: 'InternetService_Fiber', value: 0.12 },
        { feature: 'PaymentMethod_Electronic', value: 0.09 },
        { feature: 'OnlineSecurity_No', value: 0.07 },
      ],
    },
    {
      name: 'LightGBM',
      metrics: { accuracy: 0.869, precision: 0.773, recall: 0.687, f1: 0.728, auc: 0.908 },
      confusionMatrix: [[1630, 224], [288, 627]],
      rocCurve: generateROCCurve(0.908),
      prCurve: generatePRCurve(0.773, 0.687),
      shapValues: [
        { feature: 'tenure', value: -0.39 },
        { feature: 'Contract_Month-to-month', value: 0.33 },
        { feature: 'MonthlyCharges', value: 0.23 },
        { feature: 'TotalCharges', value: -0.17 },
        { feature: 'InternetService_Fiber', value: 0.13 },
        { feature: 'tenure_x_MonthlyCharges', value: 0.11 },
        { feature: 'PaymentMethod_Electronic', value: 0.08 },
        { feature: 'OnlineSecurity_No', value: 0.06 },
      ],
    },
    {
      name: 'Neural Network',
      metrics: { accuracy: 0.847, precision: 0.732, recall: 0.638, f1: 0.682, auc: 0.879 },
      confusionMatrix: [[1598, 256], [332, 583]],
      rocCurve: generateROCCurve(0.879),
      prCurve: generatePRCurve(0.732, 0.638),
      shapValues: [
        { feature: 'tenure', value: -0.35 },
        { feature: 'Contract_Month-to-month', value: 0.29 },
        { feature: 'MonthlyCharges', value: 0.21 },
        { feature: 'TotalCharges', value: -0.14 },
        { feature: 'InternetService_Fiber', value: 0.12 },
        { feature: 'PaymentMethod_Electronic', value: 0.09 },
        { feature: 'OnlineSecurity_No', value: 0.07 },
        { feature: 'TechSupport_No', value: 0.05 },
      ],
    },
    {
      name: 'SVM',
      metrics: { accuracy: 0.828, precision: 0.708, recall: 0.604, f1: 0.652, auc: 0.859 },
      confusionMatrix: [[1571, 283], [363, 552]],
      rocCurve: generateROCCurve(0.859),
      prCurve: generatePRCurve(0.708, 0.604),
      shapValues: [
        { feature: 'tenure', value: -0.30 },
        { feature: 'Contract_Month-to-month', value: 0.26 },
        { feature: 'MonthlyCharges', value: 0.18 },
        { feature: 'TotalCharges', value: -0.13 },
        { feature: 'InternetService_Fiber', value: 0.11 },
        { feature: 'PaymentMethod_Electronic', value: 0.08 },
        { feature: 'OnlineSecurity_No', value: 0.06 },
        { feature: 'TechSupport_No', value: 0.04 },
      ],
    },
  ],
  champion: 'XGBoost',
  recommendation:
    'XGBoost achieves the best overall performance with AUC 0.912 and F1 0.735. It captures complex feature interactions (especially tenure x MonthlyCharges) that linear models miss. The 87.3% accuracy with 78.1% precision makes it production-ready for the churn prediction use case. Recommended deployment strategy: batch scoring nightly with real-time API for high-value customer segments.',
}

// ---- Credit Fraud ----
const creditEvaluation: EvaluationResults = {
  models: [
    {
      name: 'Logistic Regression',
      metrics: { accuracy: 0.974, precision: 0.821, recall: 0.612, f1: 0.701, auc: 0.951 },
      confusionMatrix: [[48920, 196], [330, 554]],
      rocCurve: generateROCCurve(0.951),
      prCurve: generatePRCurve(0.821, 0.612),
      shapValues: [
        { feature: 'V14', value: -0.45 },
        { feature: 'V17', value: -0.32 },
        { feature: 'V12', value: -0.24 },
        { feature: 'Amount_log', value: 0.18 },
        { feature: 'V10', value: -0.15 },
        { feature: 'hour_of_day', value: 0.12 },
        { feature: 'V16', value: -0.09 },
        { feature: 'V3', value: 0.07 },
      ],
    },
    {
      name: 'Random Forest',
      metrics: { accuracy: 0.992, precision: 0.943, recall: 0.812, f1: 0.873, auc: 0.978 },
      confusionMatrix: [[49074, 42], [160, 724]],
      rocCurve: generateROCCurve(0.978),
      prCurve: generatePRCurve(0.943, 0.812),
      shapValues: [
        { feature: 'V14', value: -0.52 },
        { feature: 'V17', value: -0.38 },
        { feature: 'V12', value: -0.28 },
        { feature: 'V10', value: -0.21 },
        { feature: 'Amount_log', value: 0.16 },
        { feature: 'V16', value: -0.13 },
        { feature: 'hour_of_day', value: 0.10 },
        { feature: 'V3', value: 0.08 },
      ],
    },
    {
      name: 'XGBoost',
      metrics: { accuracy: 0.995, precision: 0.961, recall: 0.856, f1: 0.906, auc: 0.991 },
      confusionMatrix: [[49082, 34], [122, 762]],
      rocCurve: generateROCCurve(0.991),
      prCurve: generatePRCurve(0.961, 0.856),
      shapValues: [
        { feature: 'V14', value: -0.58 },
        { feature: 'V17', value: -0.42 },
        { feature: 'V12', value: -0.31 },
        { feature: 'V10', value: -0.24 },
        { feature: 'Amount_log', value: 0.19 },
        { feature: 'V16', value: -0.15 },
        { feature: 'hour_of_day', value: 0.12 },
        { feature: 'V3', value: 0.09 },
      ],
    },
    {
      name: 'LightGBM',
      metrics: { accuracy: 0.994, precision: 0.958, recall: 0.843, f1: 0.897, auc: 0.989 },
      confusionMatrix: [[49079, 37], [133, 751]],
      rocCurve: generateROCCurve(0.989),
      prCurve: generatePRCurve(0.958, 0.843),
      shapValues: [
        { feature: 'V14', value: -0.55 },
        { feature: 'V17', value: -0.40 },
        { feature: 'V12', value: -0.29 },
        { feature: 'V10', value: -0.22 },
        { feature: 'Amount_log', value: 0.17 },
        { feature: 'V16', value: -0.14 },
        { feature: 'hour_of_day', value: 0.11 },
        { feature: 'V3', value: 0.08 },
      ],
    },
    {
      name: 'Neural Network',
      metrics: { accuracy: 0.991, precision: 0.934, recall: 0.831, f1: 0.880, auc: 0.984 },
      confusionMatrix: [[49068, 48], [143, 741]],
      rocCurve: generateROCCurve(0.984),
      prCurve: generatePRCurve(0.934, 0.831),
      shapValues: [
        { feature: 'V14', value: -0.48 },
        { feature: 'V17', value: -0.36 },
        { feature: 'V12', value: -0.27 },
        { feature: 'V10', value: -0.20 },
        { feature: 'Amount_log', value: 0.15 },
        { feature: 'V16', value: -0.12 },
        { feature: 'hour_of_day', value: 0.09 },
        { feature: 'V3', value: 0.07 },
      ],
    },
    {
      name: 'SVM',
      metrics: { accuracy: 0.983, precision: 0.891, recall: 0.724, f1: 0.799, auc: 0.968 },
      confusionMatrix: [[49038, 78], [234, 650]],
      rocCurve: generateROCCurve(0.968),
      prCurve: generatePRCurve(0.891, 0.724),
      shapValues: [
        { feature: 'V14', value: -0.42 },
        { feature: 'V17', value: -0.31 },
        { feature: 'V12', value: -0.22 },
        { feature: 'V10', value: -0.16 },
        { feature: 'Amount_log', value: 0.13 },
        { feature: 'V16', value: -0.10 },
        { feature: 'hour_of_day', value: 0.08 },
        { feature: 'V3', value: 0.06 },
      ],
    },
  ],
  champion: 'XGBoost',
  recommendation:
    'XGBoost delivers exceptional fraud detection with AUC 0.991, catching 85.6% of fraud while maintaining 96.1% precision. This means only 3.9% of flagged transactions are false positives — minimizing customer friction. Recommended for real-time scoring with a confidence threshold of 0.85 for automatic blocking and 0.5-0.85 for manual review queue.',
}

// ---- Store Demand ----
const storeEvaluation: EvaluationResults = {
  models: [
    {
      name: 'Logistic Regression',
      metrics: { accuracy: 0.782, precision: 0.761, recall: 0.748, f1: 0.754, auc: 0.821 },
      confusionMatrix: [[7020, 1980], [2268, 6732]],
      rocCurve: generateROCCurve(0.821),
      prCurve: generatePRCurve(0.761, 0.748),
      shapValues: [
        { feature: 'day_of_week', value: 0.35 },
        { feature: 'is_promotion', value: 0.28 },
        { feature: 'lag_7_sales', value: 0.22 },
        { feature: 'store_id_encoded', value: 0.16 },
        { feature: 'rolling_mean_30', value: 0.13 },
        { feature: 'month', value: 0.09 },
        { feature: 'is_holiday', value: 0.07 },
        { feature: 'temperature', value: -0.04 },
      ],
    },
    {
      name: 'Random Forest',
      metrics: { accuracy: 0.891, precision: 0.878, recall: 0.862, f1: 0.870, auc: 0.934 },
      confusionMatrix: [[8019, 981], [1242, 7758]],
      rocCurve: generateROCCurve(0.934),
      prCurve: generatePRCurve(0.878, 0.862),
      shapValues: [
        { feature: 'day_of_week', value: 0.41 },
        { feature: 'is_promotion', value: 0.34 },
        { feature: 'lag_7_sales', value: 0.29 },
        { feature: 'rolling_mean_30', value: 0.22 },
        { feature: 'store_id_encoded', value: 0.18 },
        { feature: 'month', value: 0.12 },
        { feature: 'is_holiday', value: 0.09 },
        { feature: 'promo_lag_2d', value: 0.06 },
      ],
    },
    {
      name: 'XGBoost',
      metrics: { accuracy: 0.912, precision: 0.901, recall: 0.889, f1: 0.895, auc: 0.952 },
      confusionMatrix: [[8208, 792], [999, 8001]],
      rocCurve: generateROCCurve(0.952),
      prCurve: generatePRCurve(0.901, 0.889),
      shapValues: [
        { feature: 'day_of_week', value: 0.44 },
        { feature: 'is_promotion', value: 0.37 },
        { feature: 'lag_7_sales', value: 0.32 },
        { feature: 'rolling_mean_30', value: 0.25 },
        { feature: 'store_id_encoded', value: 0.20 },
        { feature: 'month', value: 0.14 },
        { feature: 'is_holiday', value: 0.11 },
        { feature: 'promo_lag_2d', value: 0.08 },
      ],
    },
    {
      name: 'LightGBM',
      metrics: { accuracy: 0.908, precision: 0.896, recall: 0.882, f1: 0.889, auc: 0.948 },
      confusionMatrix: [[8172, 828], [1062, 7938]],
      rocCurve: generateROCCurve(0.948),
      prCurve: generatePRCurve(0.896, 0.882),
      shapValues: [
        { feature: 'day_of_week', value: 0.42 },
        { feature: 'is_promotion', value: 0.36 },
        { feature: 'lag_7_sales', value: 0.30 },
        { feature: 'rolling_mean_30', value: 0.24 },
        { feature: 'store_id_encoded', value: 0.19 },
        { feature: 'month', value: 0.13 },
        { feature: 'is_holiday', value: 0.10 },
        { feature: 'promo_lag_2d', value: 0.07 },
      ],
    },
    {
      name: 'Neural Network',
      metrics: { accuracy: 0.876, precision: 0.862, recall: 0.849, f1: 0.855, auc: 0.918 },
      confusionMatrix: [[7884, 1116], [1359, 7641]],
      rocCurve: generateROCCurve(0.918),
      prCurve: generatePRCurve(0.862, 0.849),
      shapValues: [
        { feature: 'day_of_week', value: 0.38 },
        { feature: 'is_promotion', value: 0.31 },
        { feature: 'lag_7_sales', value: 0.26 },
        { feature: 'rolling_mean_30', value: 0.20 },
        { feature: 'store_id_encoded', value: 0.15 },
        { feature: 'month', value: 0.11 },
        { feature: 'is_holiday', value: 0.08 },
        { feature: 'temperature', value: -0.05 },
      ],
    },
    {
      name: 'SVM',
      metrics: { accuracy: 0.801, precision: 0.789, recall: 0.772, f1: 0.780, auc: 0.847 },
      confusionMatrix: [[7191, 1809], [2052, 6948]],
      rocCurve: generateROCCurve(0.847),
      prCurve: generatePRCurve(0.789, 0.772),
      shapValues: [
        { feature: 'day_of_week', value: 0.32 },
        { feature: 'is_promotion', value: 0.25 },
        { feature: 'lag_7_sales', value: 0.19 },
        { feature: 'store_id_encoded', value: 0.14 },
        { feature: 'rolling_mean_30', value: 0.11 },
        { feature: 'month', value: 0.08 },
        { feature: 'is_holiday', value: 0.06 },
        { feature: 'temperature', value: -0.03 },
      ],
    },
  ],
  champion: 'XGBoost',
  recommendation:
    'XGBoost leads with AUC 0.952 and 91.2% accuracy for demand forecasting. The model excels at capturing day-of-week patterns, promotional effects, and the 2-day promotional lag. Recommended for daily batch scoring with weekly model refresh as new sales data arrives. Expected inventory optimization savings: 12-18% reduction in overstock.',
}

// ---- Patient Readmission ----
const patientEvaluation: EvaluationResults = {
  models: [
    {
      name: 'Logistic Regression',
      metrics: { accuracy: 0.724, precision: 0.612, recall: 0.534, f1: 0.570, auc: 0.758 },
      confusionMatrix: [[3645, 855], [1281, 1219]],
      rocCurve: generateROCCurve(0.758),
      prCurve: generatePRCurve(0.612, 0.534),
      shapValues: [
        { feature: 'num_procedures', value: 0.28 },
        { feature: 'days_in_hospital', value: 0.24 },
        { feature: 'num_medications', value: 0.18 },
        { feature: 'num_diagnoses', value: 0.14 },
        { feature: 'age_group', value: 0.11 },
        { feature: 'discharge_disposition', value: -0.09 },
        { feature: 'comorbidity_score', value: 0.07 },
        { feature: 'admission_source', value: 0.05 },
      ],
    },
    {
      name: 'Random Forest',
      metrics: { accuracy: 0.781, precision: 0.689, recall: 0.621, f1: 0.653, auc: 0.824 },
      confusionMatrix: [[3861, 639], [1042, 1458]],
      rocCurve: generateROCCurve(0.824),
      prCurve: generatePRCurve(0.689, 0.621),
      shapValues: [
        { feature: 'num_procedures', value: 0.34 },
        { feature: 'days_in_hospital', value: 0.29 },
        { feature: 'num_medications', value: 0.22 },
        { feature: 'num_diagnoses', value: 0.17 },
        { feature: 'age_group', value: 0.14 },
        { feature: 'comorbidity_score', value: 0.11 },
        { feature: 'discharge_disposition', value: -0.08 },
        { feature: 'prior_visits_6mo', value: 0.06 },
      ],
    },
    {
      name: 'XGBoost',
      metrics: { accuracy: 0.798, precision: 0.712, recall: 0.648, f1: 0.679, auc: 0.847 },
      confusionMatrix: [[3924, 576], [968, 1532]],
      rocCurve: generateROCCurve(0.847),
      prCurve: generatePRCurve(0.712, 0.648),
      shapValues: [
        { feature: 'num_procedures', value: 0.38 },
        { feature: 'days_in_hospital', value: 0.32 },
        { feature: 'num_medications', value: 0.25 },
        { feature: 'comorbidity_score', value: 0.19 },
        { feature: 'num_diagnoses', value: 0.16 },
        { feature: 'age_group', value: 0.13 },
        { feature: 'discharge_disposition', value: -0.10 },
        { feature: 'prior_visits_6mo', value: 0.08 },
      ],
    },
    {
      name: 'LightGBM',
      metrics: { accuracy: 0.793, precision: 0.706, recall: 0.641, f1: 0.672, auc: 0.841 },
      confusionMatrix: [[3906, 594], [989, 1511]],
      rocCurve: generateROCCurve(0.841),
      prCurve: generatePRCurve(0.706, 0.641),
      shapValues: [
        { feature: 'num_procedures', value: 0.36 },
        { feature: 'days_in_hospital', value: 0.30 },
        { feature: 'num_medications', value: 0.24 },
        { feature: 'comorbidity_score', value: 0.18 },
        { feature: 'num_diagnoses', value: 0.15 },
        { feature: 'age_group', value: 0.12 },
        { feature: 'discharge_disposition', value: -0.09 },
        { feature: 'prior_visits_6mo', value: 0.07 },
      ],
    },
    {
      name: 'Neural Network',
      metrics: { accuracy: 0.769, precision: 0.678, recall: 0.609, f1: 0.642, auc: 0.812 },
      confusionMatrix: [[3816, 684], [1076, 1424]],
      rocCurve: generateROCCurve(0.812),
      prCurve: generatePRCurve(0.678, 0.609),
      shapValues: [
        { feature: 'num_procedures', value: 0.31 },
        { feature: 'days_in_hospital', value: 0.26 },
        { feature: 'num_medications', value: 0.20 },
        { feature: 'num_diagnoses', value: 0.15 },
        { feature: 'age_group', value: 0.12 },
        { feature: 'comorbidity_score', value: 0.09 },
        { feature: 'discharge_disposition', value: -0.07 },
        { feature: 'admission_source', value: 0.05 },
      ],
    },
    {
      name: 'SVM',
      metrics: { accuracy: 0.741, precision: 0.638, recall: 0.561, f1: 0.597, auc: 0.781 },
      confusionMatrix: [[3708, 792], [1208, 1292]],
      rocCurve: generateROCCurve(0.781),
      prCurve: generatePRCurve(0.638, 0.561),
      shapValues: [
        { feature: 'num_procedures', value: 0.26 },
        { feature: 'days_in_hospital', value: 0.22 },
        { feature: 'num_medications', value: 0.17 },
        { feature: 'num_diagnoses', value: 0.13 },
        { feature: 'age_group', value: 0.10 },
        { feature: 'comorbidity_score', value: 0.07 },
        { feature: 'discharge_disposition', value: -0.06 },
        { feature: 'admission_source', value: 0.04 },
      ],
    },
  ],
  champion: 'XGBoost',
  recommendation:
    'XGBoost achieves the best readmission prediction with AUC 0.847 and 79.8% accuracy. The model identifies high-risk patients using procedure count, hospital stay length, and the engineered comorbidity score. Recommended for integration into the discharge workflow — flag patients with readmission probability > 0.6 for enhanced post-discharge care plans. Expected to reduce 30-day readmissions by 15-20%.',
}

const evaluationDataMap: Record<string, EvaluationResults> = {
  'telco-churn': telcoEvaluation,
  'credit-fraud': creditEvaluation,
  'store-demand': storeEvaluation,
  'patient-readmission': patientEvaluation,
}

export function getPrecomputedEvaluation(datasetId: string): EvaluationResults {
  return evaluationDataMap[datasetId] || telcoEvaluation
}
