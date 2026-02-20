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

export interface SufficiencyPatternItem {
  id: number
  label: string
  description: string
  count: number
  keySignals: string[]
  // Product-matching display fields (optional — derived from keySignals when absent)
  condition?: string
  confidence?: 'high' | 'low'
  pct?: number
  targetInd?: 0 | 1
  attributes?: { name: string; value: string }[]
}

export interface PatternResults {
  totalRecords: number
  sufficient: SufficiencyPatternItem[]
  insufficient: SufficiencyPatternItem[]
  helpMe: SufficiencyPatternItem[]
  insights: AIInsight[]
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

export type DeploymentMode = 'realtime' | 'batch'

export interface DimensionResults {
  dimensions: {
    name: string
    color: string
    attributes: string[]
    coverage: number
    confidence: number
    categoricalToggles: string[]
  }[]
  insights: AIInsight[]
}

export interface ValidationCohort {
  name: string
  totalCount: number
  validationSamples: number
  samplingPct: number
}

export interface ValidationCategory {
  count: number
  percentage: number
  cohorts: ValidationCohort[]
}

export interface ValidationOverallMetrics {
  primaryMetric: string    // e.g. "Recall" | "MAPE"
  primaryValue: number
  secondaryMetric: string  // e.g. "Precision" | "RMSE"
  secondaryValue: number
  statement: string
}

export interface ValidationSummaryResults {
  totalCount: number
  totalCohorts: number
  overallMetrics: ValidationOverallMetrics
  sufficient: ValidationCategory
  insufficient: ValidationCategory
  helpMe: ValidationCategory
  augmented: ValidationCategory
}

export interface ModelComponentFactor {
  name: string    // data characteristic, e.g. "Non-linear relationship complexity"
  level: string   // "Low" | "Median" | "High" | "Yes" | "No"
}
export interface ModelComponentParam {
  name: string    // technical param name
  value: string   // e.g. "L2 (Ridge), C=0.8"
}
export interface ModelComponent {
  subtype: string        // 'preprocessor' | 'model_function' | 'loss_function' | 'explicit_regularization' | 'optimization_algo' | 'capacity_controls' | 'complexity_controls' | 'inference_tuning'
  subtypeLabel: string   // 'Preprocessor' | 'Model Component' | 'Loss Function' | ...
  name: string           // ML technical term, e.g. 'one_hot_encoding'
  factors: ModelComponentFactor[]
  params: ModelComponentParam[]
}

export interface CohortPerformance {
  category: 'sufficient' | 'insufficient' | 'helpMe'
  label: string
  recall: number
  precision: number
}

export interface ModelSelectionResults {
  champion: string
  modelFunction: string
  modelType: string
  overallRecall: number
  overallPrecision: number
  primaryMetric: string
  secondaryMetric: string
  metricStatement: string
  components: ModelComponent[]
  whyThisModel: string
  performance: CohortPerformance[]
}

export type StageId = 1 | 2 | 3 | 4 | 5 | 6

export const STAGE_LABELS: Record<StageId, string> = {
  1: 'Dataset',
  2: 'Business Setup',
  3: 'Auto EDA',
  4: 'Pattern Recognition',
  5: 'Validation Summary',
  6: 'Model Selection',
}

// Active domain scenario id (from domainData.ts)
export type ActiveDomainId = string | null
