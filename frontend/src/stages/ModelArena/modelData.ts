import type { ModelTrainingState, ModelMetrics } from '@/store/types'

interface TrainingTimelineEntry {
  time: number // ms offset
  modelName: string
  progress: number
  metrics?: ModelMetrics
}

interface PrecomputedTraining {
  initialModels: ModelTrainingState[]
  finalMetrics: Record<string, ModelMetrics>
  trainingTimeline: TrainingTimelineEntry[]
  champion: string
}

const modelTemplates: Omit<ModelTrainingState, 'metrics'>[] = [
  { name: 'Logistic Regression', icon: 'TrendingUp', status: 'waiting', progress: 0, color: '#3b82f6' },
  { name: 'Random Forest', icon: 'TreePine', status: 'waiting', progress: 0, color: '#10b981' },
  { name: 'XGBoost', icon: 'Zap', status: 'waiting', progress: 0, color: '#f59e0b' },
  { name: 'LightGBM', icon: 'Bolt', status: 'waiting', progress: 0, color: '#8b5cf6' },
  { name: 'Neural Network', icon: 'Brain', status: 'waiting', progress: 0, color: '#ec4899' },
  { name: 'SVM', icon: 'Crosshair', status: 'waiting', progress: 0, color: '#06b6d4' },
]

function buildTimeline(
  speeds: Record<string, number>, // total ms per model
  finalMetrics: Record<string, ModelMetrics>
): TrainingTimelineEntry[] {
  const entries: TrainingTimelineEntry[] = []
  const stepMs = 200
  const modelNames = Object.keys(speeds)

  // Generate progress updates for each model
  for (const name of modelNames) {
    const totalTime = speeds[name]
    const steps = Math.floor(totalTime / stepMs)
    for (let i = 1; i <= steps; i++) {
      const progress = Math.min((i / steps) * 100, 100)
      const time = i * stepMs
      const entry: TrainingTimelineEntry = { time, modelName: name, progress }
      if (i === steps) {
        entry.metrics = finalMetrics[name]
      }
      entries.push(entry)
    }
  }

  // Sort by time
  entries.sort((a, b) => a.time - b.time)
  return entries
}

// --- Telco Churn ---
const telcoMetrics: Record<string, ModelMetrics> = {
  'Logistic Regression': { accuracy: 0.812, precision: 0.674, recall: 0.582, f1: 0.625, auc: 0.843 },
  'Random Forest': { accuracy: 0.856, precision: 0.748, recall: 0.651, f1: 0.696, auc: 0.891 },
  'XGBoost': { accuracy: 0.873, precision: 0.781, recall: 0.694, f1: 0.735, auc: 0.912 },
  'LightGBM': { accuracy: 0.869, precision: 0.773, recall: 0.687, f1: 0.728, auc: 0.908 },
  'Neural Network': { accuracy: 0.847, precision: 0.732, recall: 0.638, f1: 0.682, auc: 0.879 },
  'SVM': { accuracy: 0.828, precision: 0.708, recall: 0.604, f1: 0.652, auc: 0.859 },
}

const telcoSpeeds: Record<string, number> = {
  'Logistic Regression': 2400,
  'Random Forest': 4200,
  'XGBoost': 5000,
  'LightGBM': 3800,
  'Neural Network': 6200,
  'SVM': 4800,
}

// --- Credit Fraud ---
const creditMetrics: Record<string, ModelMetrics> = {
  'Logistic Regression': { accuracy: 0.974, precision: 0.821, recall: 0.612, f1: 0.701, auc: 0.951 },
  'Random Forest': { accuracy: 0.992, precision: 0.943, recall: 0.812, f1: 0.873, auc: 0.978 },
  'XGBoost': { accuracy: 0.995, precision: 0.961, recall: 0.856, f1: 0.906, auc: 0.991 },
  'LightGBM': { accuracy: 0.994, precision: 0.958, recall: 0.843, f1: 0.897, auc: 0.989 },
  'Neural Network': { accuracy: 0.991, precision: 0.934, recall: 0.831, f1: 0.880, auc: 0.984 },
  'SVM': { accuracy: 0.983, precision: 0.891, recall: 0.724, f1: 0.799, auc: 0.968 },
}

const creditSpeeds: Record<string, number> = {
  'Logistic Regression': 2000,
  'Random Forest': 4600,
  'XGBoost': 5400,
  'LightGBM': 4000,
  'Neural Network': 7000,
  'SVM': 5600,
}

// --- Store Demand ---
const storeMetrics: Record<string, ModelMetrics> = {
  'Logistic Regression': { accuracy: 0.782, precision: 0.761, recall: 0.748, f1: 0.754, auc: 0.821 },
  'Random Forest': { accuracy: 0.891, precision: 0.878, recall: 0.862, f1: 0.870, auc: 0.934 },
  'XGBoost': { accuracy: 0.912, precision: 0.901, recall: 0.889, f1: 0.895, auc: 0.952 },
  'LightGBM': { accuracy: 0.908, precision: 0.896, recall: 0.882, f1: 0.889, auc: 0.948 },
  'Neural Network': { accuracy: 0.876, precision: 0.862, recall: 0.849, f1: 0.855, auc: 0.918 },
  'SVM': { accuracy: 0.801, precision: 0.789, recall: 0.772, f1: 0.780, auc: 0.847 },
}

const storeSpeeds: Record<string, number> = {
  'Logistic Regression': 2200,
  'Random Forest': 4400,
  'XGBoost': 5200,
  'LightGBM': 3600,
  'Neural Network': 6800,
  'SVM': 5200,
}

// --- Patient Readmission ---
const patientMetrics: Record<string, ModelMetrics> = {
  'Logistic Regression': { accuracy: 0.724, precision: 0.612, recall: 0.534, f1: 0.570, auc: 0.758 },
  'Random Forest': { accuracy: 0.781, precision: 0.689, recall: 0.621, f1: 0.653, auc: 0.824 },
  'XGBoost': { accuracy: 0.798, precision: 0.712, recall: 0.648, f1: 0.679, auc: 0.847 },
  'LightGBM': { accuracy: 0.793, precision: 0.706, recall: 0.641, f1: 0.672, auc: 0.841 },
  'Neural Network': { accuracy: 0.769, precision: 0.678, recall: 0.609, f1: 0.642, auc: 0.812 },
  'SVM': { accuracy: 0.741, precision: 0.638, recall: 0.561, f1: 0.597, auc: 0.781 },
}

const patientSpeeds: Record<string, number> = {
  'Logistic Regression': 2600,
  'Random Forest': 4000,
  'XGBoost': 5600,
  'LightGBM': 4200,
  'Neural Network': 6400,
  'SVM': 5000,
}

function buildTrainingData(
  metrics: Record<string, ModelMetrics>,
  speeds: Record<string, number>,
  champion: string
): PrecomputedTraining {
  return {
    initialModels: modelTemplates.map((m) => ({ ...m })),
    finalMetrics: metrics,
    trainingTimeline: buildTimeline(speeds, metrics),
    champion,
  }
}

const trainingDataMap: Record<string, PrecomputedTraining> = {
  'telco-churn': buildTrainingData(telcoMetrics, telcoSpeeds, 'XGBoost'),
  'credit-fraud': buildTrainingData(creditMetrics, creditSpeeds, 'XGBoost'),
  'store-demand': buildTrainingData(storeMetrics, storeSpeeds, 'XGBoost'),
  'patient-readmission': buildTrainingData(patientMetrics, patientSpeeds, 'XGBoost'),
}

export function getPrecomputedTraining(datasetId: string): PrecomputedTraining {
  return trainingDataMap[datasetId] || trainingDataMap['telco-churn']
}
