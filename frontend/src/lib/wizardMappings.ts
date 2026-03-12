export type BusinessChallenge = 'churn' | 'forecast' | 'fraud' | 'maintenance' | 'unsure'
export type DataType = 'structured' | 'text' | 'images' | 'unsure'

export interface ChallengeOption {
  id: BusinessChallenge
  label: string
  subtitle: string
  icon: string
  color: string
}

export interface DataTypeOption {
  id: DataType
  label: string
  subtitle: string
  icon: string
  solutionType: 'predictive' | 'agentic' | 'generative' | 'unsure'
}

export interface WizardMapping {
  challenge: BusinessChallenge
  dataType: DataType
  scenarioIds: string[]
}

export const CHALLENGE_OPTIONS: ChallengeOption[] = [
  {
    id: 'churn',
    label: "I'm losing customers and don't know why",
    subtitle: 'Predict which customers or employees will leave',
    icon: 'log-out',
    color: '#ef4444',
  },
  {
    id: 'forecast',
    label: 'I need more accurate forecasts',
    subtitle: 'Predict demand, costs, or revenue',
    icon: 'trending-up',
    color: '#3b82f6',
  },
  {
    id: 'fraud',
    label: 'I want to catch fraud before it costs me',
    subtitle: 'Detect fraudulent transactions or claims',
    icon: 'shield',
    color: '#8b5cf6',
  },
  {
    id: 'maintenance',
    label: 'I need to prevent breakdowns or delays',
    subtitle: 'Predict failures, readmissions, or delivery disruptions',
    icon: 'alert-triangle',
    color: '#f59e0b',
  },
  {
    id: 'unsure',
    label: "I'm not sure — show me everything",
    subtitle: 'Browse all scenarios and find what fits',
    icon: 'layout-grid',
    color: '#6b7280',
  },
]

export const DATA_TYPE_OPTIONS: DataTypeOption[] = [
  {
    id: 'structured',
    label: 'Spreadsheets and databases',
    subtitle: 'Numbers, categories, historical records, customer data',
    icon: 'database',
    solutionType: 'predictive',
  },
  {
    id: 'text',
    label: 'Documents and text',
    subtitle: 'Policies, emails, contracts, PDFs, support tickets',
    icon: 'file-text',
    solutionType: 'agentic',
  },
  {
    id: 'images',
    label: 'Images or video',
    subtitle: 'Photos, diagrams, visual inspection data',
    icon: 'image',
    solutionType: 'generative',
  },
  {
    id: 'unsure',
    label: "I'm not sure",
    subtitle: 'Show me what fits my challenge type',
    icon: 'help-circle',
    solutionType: 'unsure',
  },
]

export const WIZARD_MAPPINGS: WizardMapping[] = [
  // Churn
  { challenge: 'churn', dataType: 'structured', scenarioIds: ['telco-churn', 'employee-attrition'] },
  { challenge: 'churn', dataType: 'unsure', scenarioIds: ['telco-churn', 'employee-attrition'] },
  { challenge: 'churn', dataType: 'text', scenarioIds: [] },
  { challenge: 'churn', dataType: 'images', scenarioIds: [] },

  // Forecast
  {
    challenge: 'forecast',
    dataType: 'structured',
    scenarioIds: ['retail-demand', 'energy-consumption', 'logistics-freight-cost', 'logistics-demand-forecast'],
  },
  {
    challenge: 'forecast',
    dataType: 'unsure',
    scenarioIds: ['retail-demand', 'energy-consumption', 'logistics-freight-cost'],
  },
  { challenge: 'forecast', dataType: 'text', scenarioIds: [] },
  { challenge: 'forecast', dataType: 'images', scenarioIds: [] },

  // Fraud
  { challenge: 'fraud', dataType: 'structured', scenarioIds: ['credit-fraud', 'insurance-claims'] },
  { challenge: 'fraud', dataType: 'unsure', scenarioIds: ['credit-fraud', 'insurance-claims'] },
  { challenge: 'fraud', dataType: 'text', scenarioIds: [] },
  { challenge: 'fraud', dataType: 'images', scenarioIds: [] },

  // Maintenance / reliability
  {
    challenge: 'maintenance',
    dataType: 'structured',
    scenarioIds: [
      'patient-readmission',
      'predictive-maintenance',
      'logistics-delivery-outcome',
      'logistics-delivery-delay',
    ],
  },
  {
    challenge: 'maintenance',
    dataType: 'unsure',
    scenarioIds: ['patient-readmission', 'predictive-maintenance', 'logistics-delivery-delay'],
  },
  { challenge: 'maintenance', dataType: 'text', scenarioIds: [] },
  { challenge: 'maintenance', dataType: 'images', scenarioIds: [] },

  // Unsure — show a broad cross-section
  {
    challenge: 'unsure',
    dataType: 'structured',
    scenarioIds: [
      'telco-churn',
      'credit-fraud',
      'retail-demand',
      'predictive-maintenance',
      'patient-readmission',
      'logistics-freight-cost',
    ],
  },
  {
    challenge: 'unsure',
    dataType: 'unsure',
    scenarioIds: [
      'telco-churn',
      'credit-fraud',
      'retail-demand',
      'employee-attrition',
      'predictive-maintenance',
      'patient-readmission',
      'logistics-delivery-delay',
      'logistics-freight-cost',
      'insurance-claims',
      'energy-consumption',
      'logistics-delivery-outcome',
      'logistics-demand-forecast',
    ],
  },
  { challenge: 'unsure', dataType: 'text', scenarioIds: [] },
  { challenge: 'unsure', dataType: 'images', scenarioIds: [] },
]

export function getRecommendedScenarios(
  challenge: BusinessChallenge,
  dataType: DataType,
): string[] {
  const mapping = WIZARD_MAPPINGS.find(
    (m) => m.challenge === challenge && m.dataType === dataType,
  )
  return mapping?.scenarioIds ?? []
}

/** True when the chosen data type has no predictive scenarios (text / images). */
export function isComingSoonDataType(dataType: DataType): boolean {
  return dataType === 'text' || dataType === 'images'
}
