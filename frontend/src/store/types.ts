export interface BusinessObjective {
  id: string
  label: string
  description: string
  targetColumn: string
  metric: string
  objectiveType: 'classification' | 'regression' | 'anomaly-detection'
}

export interface DatasetConfig {
  id: string
  name: string
  description: string
  domain: string
  taskType: 'classification' | 'regression' | 'time-series'
  rows: number
  features: number
  icon: string
  color: string
  preview?: DataPreview
  objectives: BusinessObjective[]
}

export interface DataPreview {
  columns: ColumnInfo[]
  sampleRows: Record<string, string | number>[]
}

export interface ColumnInfo {
  name: string
  dtype: string
  nonNull: number
  unique: number
}

export interface EDAModule {
  id: string
  label: string
  status: 'pending' | 'running' | 'complete'
  data?: unknown
}

export interface EDAResults {
  summary: DataSummary
  missingValues: MissingValuesData
  distributions: DistributionData[]
  correlations: CorrelationData
  outliers: OutlierData
  qualityScore: number
  insights: AIInsight[]
}

export interface DataSummary {
  rows: number
  columns: number
  numericFeatures: number
  categoricalFeatures: number
  memoryUsage: string
  duplicateRows: number
}

export interface MissingValuesData {
  columns: string[]
  values: number[]
}

export interface DistributionData {
  feature: string
  type: 'numeric' | 'categorical'
  bins?: { label: string; count: number }[]
  stats?: { mean: number; median: number; std: number; min: number; max: number }
}

export interface CorrelationData {
  features: string[]
  matrix: number[][]
}

export interface OutlierData {
  features: string[]
  points: { x: number; y: number; isOutlier: boolean }[]
  outlierCount: number
  totalCount: number
}

export interface AIInsight {
  id: string
  text: string
  type: 'info' | 'warning' | 'success'
  icon?: string
}

export interface PatternResults {
  clusters: ClusterData
  anomalies: AnomalyData
  temporalPatterns?: TemporalData
  insights: AIInsight[]
}

export interface ClusterData {
  points: { x: number; y: number; cluster: number }[]
  clusterLabels: { id: number; label: string; description: string; count: number }[]
}

export interface AnomalyData {
  points: { x: number; y: number; isAnomaly: boolean; score: number }[]
  anomalyCount: number
  anomalyPercent: number
}

export interface TemporalData {
  dates: string[]
  values: number[]
  trend: number[]
  seasonal: number[]
}

export interface FeatureResults {
  importance: { feature: string; score: number; rank: number }[]
  engineeringLog: { action: string; detail: string; impact: string }[]
  newFeatureCount: number
  insights: AIInsight[]
}

export interface ModelTrainingState {
  name: string
  icon: string
  status: 'waiting' | 'training' | 'complete'
  progress: number
  metrics?: ModelMetrics
  color: string
}

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1: number
  auc: number
}

export interface EvaluationResults {
  models: {
    name: string
    metrics: ModelMetrics
    confusionMatrix: number[][]
    rocCurve: { fpr: number; tpr: number }[]
    prCurve: { recall: number; precision: number }[]
    shapValues?: { feature: string; value: number }[]
  }[]
  champion: string
  recommendation: string
}

export interface DriftSimulation {
  weeks: DriftWeek[]
  retrainingResult?: {
    oldMetrics: ModelMetrics
    newMetrics: ModelMetrics
    improvement: number
  }
}

export interface DriftWeek {
  week: number
  health: 'healthy' | 'warning' | 'critical'
  metrics: ModelMetrics
  driftScore: number
  psiValues: { feature: string; psi: number; status: 'pass' | 'fail' }[]
  distributions?: {
    feature: string
    original: number[]
    current: number[]
  }[]
}

export interface LogEntry {
  timestamp: number
  message: string
  type: 'info' | 'success' | 'warning' | 'action'
}

export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const STAGE_LABELS: Record<StageId, string> = {
  1: 'Choose Dataset',
  2: 'Auto-EDA',
  3: 'Pattern Discovery',
  4: 'Feature Intelligence',
  5: 'Model Arena',
  6: 'Evaluation Hub',
  7: 'Drift & Retrain',
}
