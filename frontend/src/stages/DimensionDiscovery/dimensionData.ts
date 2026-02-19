import type { DimensionResults } from '@/store/types'

const dimensionDataMap: Record<string, DimensionResults> = {
  'telco-churn': {
    dimensions: [
      {
        name: 'Service Usage',
        color: '#3b82f6',
        attributes: ['MonthlyCharges', 'TotalCharges', 'tenure', 'MultipleLines', 'InternetService'],
        coverage: 94,
        confidence: 91,
        categoricalToggles: ['MonthlyCharges', 'TotalCharges', 'tenure'],
      },
      {
        name: 'Contract & Billing',
        color: '#8b5cf6',
        attributes: ['Contract', 'PaperlessBilling', 'PaymentMethod'],
        coverage: 100,
        confidence: 96,
        categoricalToggles: [],
      },
      {
        name: 'Add-on Services',
        color: '#06b6d4',
        attributes: ['OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies'],
        coverage: 88,
        confidence: 84,
        categoricalToggles: [],
      },
      {
        name: 'Customer Profile',
        color: '#10b981',
        attributes: ['gender', 'SeniorCitizen', 'Partner', 'Dependents', 'PhoneService'],
        coverage: 100,
        confidence: 89,
        categoricalToggles: ['SeniorCitizen'],
      },
    ],
    insights: [
      { id: 'd1', text: '4 meaningful dimensions identified from 21 raw attributes. Service Usage dimension shows highest correlation with churn target.', type: 'success' },
      { id: 'd2', text: 'Contract & Billing dimension has 96% confidence — month-to-month contracts are strong churn predictors.', type: 'info' },
    ],
  },
  'credit-fraud': {
    dimensions: [
      {
        name: 'Transaction Behaviour',
        color: '#ef4444',
        attributes: ['V1', 'V2', 'V3', 'V4', 'V5', 'Amount'],
        coverage: 97,
        confidence: 94,
        categoricalToggles: ['Amount'],
      },
      {
        name: 'Temporal Signals',
        color: '#f59e0b',
        attributes: ['V6', 'V7', 'V8', 'V9', 'Time'],
        coverage: 92,
        confidence: 88,
        categoricalToggles: ['Time'],
      },
      {
        name: 'Anonymised PCA Features',
        color: '#8b5cf6',
        attributes: ['V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'],
        coverage: 100,
        confidence: 82,
        categoricalToggles: [],
      },
      {
        name: 'Secondary PCA Features',
        color: '#06b6d4',
        attributes: ['V18', 'V19', 'V20', 'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28'],
        coverage: 85,
        confidence: 76,
        categoricalToggles: [],
      },
    ],
    insights: [
      { id: 'd1', text: 'Transaction Behaviour dimension (V1-V5 + Amount) is the strongest fraud signal with 94% confidence.', type: 'success' },
      { id: 'd2', text: 'Dataset is highly imbalanced — 0.17% fraud rate. Dimension discovery adjusted for class imbalance.', type: 'warning' },
    ],
  },
  'store-demand': {
    dimensions: [
      {
        name: 'Sales History',
        color: '#10b981',
        attributes: ['sales', 'store', 'item'],
        coverage: 100,
        confidence: 97,
        categoricalToggles: ['store', 'item'],
      },
      {
        name: 'Temporal Patterns',
        color: '#3b82f6',
        attributes: ['date', 'year', 'month', 'day', 'dayofweek', 'weekofyear'],
        coverage: 100,
        confidence: 95,
        categoricalToggles: ['month', 'day', 'dayofweek', 'weekofyear'],
      },
      {
        name: 'Promotional Signals',
        color: '#f59e0b',
        attributes: ['onpromotion', 'holiday_type', 'transferred'],
        coverage: 78,
        confidence: 87,
        categoricalToggles: [],
      },
      {
        name: 'External Factors',
        color: '#8b5cf6',
        attributes: ['dcoilwtico', 'transactions', 'city', 'state', 'type', 'cluster'],
        coverage: 72,
        confidence: 79,
        categoricalToggles: ['transactions', 'dcoilwtico'],
      },
    ],
    insights: [
      { id: 'd1', text: 'Temporal Patterns dimension has 95% confidence — day-of-week and seasonality are dominant demand drivers.', type: 'success' },
      { id: 'd2', text: 'Oil price (dcoilwtico) has moderate coverage (72%) — some periods have missing values that will be imputed.', type: 'warning' },
    ],
  },
  'patient-readmission': {
    dimensions: [
      {
        name: 'Clinical Profile',
        color: '#f59e0b',
        attributes: ['num_medications', 'num_procedures', 'num_lab_procedures', 'number_diagnoses', 'time_in_hospital'],
        coverage: 98,
        confidence: 93,
        categoricalToggles: ['time_in_hospital'],
      },
      {
        name: 'Demographic Profile',
        color: '#3b82f6',
        attributes: ['age', 'gender', 'race', 'admission_type_id', 'discharge_disposition_id'],
        coverage: 95,
        confidence: 88,
        categoricalToggles: ['age'],
      },
      {
        name: 'Medication Regimen',
        color: '#10b981',
        attributes: ['insulin', 'metformin', 'diabetesMed', 'change', 'glipizide', 'rosiglitazone'],
        coverage: 91,
        confidence: 85,
        categoricalToggles: [],
      },
      {
        name: 'Diagnosis Codes',
        color: '#8b5cf6',
        attributes: ['diag_1', 'diag_2', 'diag_3', 'max_glu_serum', 'A1Cresult'],
        coverage: 86,
        confidence: 82,
        categoricalToggles: [],
      },
    ],
    insights: [
      { id: 'd1', text: 'Clinical Profile dimension shows strong correlation — time in hospital and number of medications are top predictors.', type: 'success' },
      { id: 'd2', text: 'Diagnosis codes have 14% missing values — flagged for imputation in EDA phase.', type: 'warning' },
    ],
  },
  'employee-attrition': {
    dimensions: [
      {
        name: 'Compensation & Level',
        color: '#8b5cf6',
        attributes: ['MonthlyIncome', 'HourlyRate', 'DailyRate', 'MonthlyRate', 'JobLevel', 'StockOptionLevel'],
        coverage: 100,
        confidence: 92,
        categoricalToggles: ['MonthlyIncome', 'HourlyRate', 'DailyRate', 'MonthlyRate'],
      },
      {
        name: 'Satisfaction & Engagement',
        color: '#ec4899',
        attributes: ['JobSatisfaction', 'EnvironmentSatisfaction', 'RelationshipSatisfaction', 'WorkLifeBalance'],
        coverage: 100,
        confidence: 90,
        categoricalToggles: [],
      },
      {
        name: 'Career Trajectory',
        color: '#f59e0b',
        attributes: ['YearsAtCompany', 'YearsInCurrentRole', 'YearsSinceLastPromotion', 'YearsWithCurrManager', 'TotalWorkingYears'],
        coverage: 100,
        confidence: 88,
        categoricalToggles: ['YearsAtCompany', 'YearsInCurrentRole', 'TotalWorkingYears'],
      },
      {
        name: 'Role & Demographics',
        color: '#06b6d4',
        attributes: ['JobRole', 'Department', 'BusinessTravel', 'OverTime', 'Gender', 'MaritalStatus', 'Age'],
        coverage: 100,
        confidence: 86,
        categoricalToggles: ['Age'],
      },
    ],
    insights: [
      { id: 'd1', text: '4 dimensions discovered. Career Trajectory and Satisfaction dimensions are the top attrition predictors.', type: 'success' },
      { id: 'd2', text: 'OverTime attribute in Role & Demographics is a binary flag — high correlation with attrition risk.', type: 'info' },
    ],
  },
  'energy-consumption': {
    dimensions: [
      {
        name: 'Consumption History',
        color: '#06b6d4',
        attributes: ['consumption_kwh', 'zone_id', 'meter_id'],
        coverage: 100,
        confidence: 97,
        categoricalToggles: ['consumption_kwh'],
      },
      {
        name: 'Temporal Signals',
        color: '#3b82f6',
        attributes: ['hour', 'day_of_week', 'month', 'is_weekend', 'is_holiday'],
        coverage: 100,
        confidence: 96,
        categoricalToggles: ['hour'],
      },
      {
        name: 'Weather Conditions',
        color: '#10b981',
        attributes: ['temperature', 'humidity', 'wind_speed', 'cloud_cover', 'solar_irradiance'],
        coverage: 89,
        confidence: 91,
        categoricalToggles: ['temperature', 'humidity'],
      },
      {
        name: 'Grid & Load Factors',
        color: '#f59e0b',
        attributes: ['grid_zone', 'base_load', 'peak_indicator', 'demand_response_active'],
        coverage: 82,
        confidence: 84,
        categoricalToggles: ['base_load'],
      },
    ],
    insights: [
      { id: 'd1', text: 'Temporal Signals and Weather Conditions are the top demand drivers with combined 93% predictive power.', type: 'success' },
      { id: 'd2', text: 'Solar irradiance has 11% missing values during night hours — zero-imputation is appropriate for this feature.', type: 'info' },
    ],
  },
  'insurance-claims': {
    dimensions: [
      {
        name: 'Policy Details',
        color: '#ec4899',
        attributes: ['policy_annual_premium', 'policy_deductable', 'umbrella_limit', 'insured_education_level', 'policy_csl'],
        coverage: 100,
        confidence: 88,
        categoricalToggles: ['policy_annual_premium'],
      },
      {
        name: 'Incident Characteristics',
        color: '#ef4444',
        attributes: ['incident_type', 'collision_type', 'incident_severity', 'authorities_contacted', 'incident_hour_of_the_day'],
        coverage: 97,
        confidence: 93,
        categoricalToggles: ['incident_hour_of_the_day'],
      },
      {
        name: 'Claimant Profile',
        color: '#f59e0b',
        attributes: ['insured_occupation', 'insured_relationship', 'insured_sex', 'insured_hobbies', 'auto_year'],
        coverage: 95,
        confidence: 86,
        categoricalToggles: ['auto_year'],
      },
      {
        name: 'Claim History',
        color: '#8b5cf6',
        attributes: ['total_claim_amount', 'injury_claim', 'property_claim', 'vehicle_claim', 'bodily_injuries', 'witnesses'],
        coverage: 92,
        confidence: 91,
        categoricalToggles: ['total_claim_amount', 'injury_claim', 'property_claim', 'vehicle_claim'],
      },
    ],
    insights: [
      { id: 'd1', text: 'Incident Characteristics dimension (93% confidence) is the primary fraud signal — severity and type are key indicators.', type: 'success' },
      { id: 'd2', text: 'Claim History dimension shows high collinearity — total_claim_amount derived from sub-components.', type: 'warning' },
    ],
  },
}

export function getPrecomputedDimensions(datasetId: string): DimensionResults {
  return dimensionDataMap[datasetId] ?? dimensionDataMap['telco-churn']
}
