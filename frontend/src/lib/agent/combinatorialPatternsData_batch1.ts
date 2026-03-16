import type { DimensionPattern } from '@/store/agentTypes'

export const DOC_INTELLIGENCE_PATTERNS: DimensionPattern[] = [
  // SIMPLE PATTERNS (8)
  {
    id: 'doc-pat-01',
    name: 'Loan Application Document Parsing',
    description: 'Extract key fields from loan application forms including borrower info, loan amount, and property details.',
    tier: 'simple',
    taskDimensionId: 'doci-task-application-intake',
    dataDimensionIds: ['doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-business-user',
    patternType: 'simple',
    exampleQuestions: [
      'What is the requested loan amount and property address?',
      'Extract borrower name, SSN, and employment information'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-02',
    name: 'Credit Score Extraction',
    description: 'Extract credit score and major credit factors from credit bureau reports.',
    tier: 'simple',
    taskDimensionId: 'doci-task-credit-analysis',
    dataDimensionIds: ['doci-data-credit-bureau'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'simple',
    exampleQuestions: [
      'What is the applicant\'s credit score?',
      'Extract payment history and outstanding debts'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-03',
    name: 'Income Documentation Parsing',
    description: 'Parse W-2 forms, paystubs, and tax returns to extract income information.',
    tier: 'simple',
    taskDimensionId: 'doci-task-income-verification',
    dataDimensionIds: ['doci-data-income-docs'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'simple',
    exampleQuestions: [
      'What is the applicant\'s verified annual income?',
      'Extract gross income from the past 2 years'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-04',
    name: 'Property Appraisal Data Extraction',
    description: 'Extract property value, condition, and key metrics from appraisal documents.',
    tier: 'simple',
    taskDimensionId: 'doci-task-property-valuation',
    dataDimensionIds: ['doci-data-property-appraisals'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'simple',
    exampleQuestions: [
      'What is the appraised property value?',
      'Extract property condition assessment and comparable sales'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-05',
    name: 'Loan Requirement Template Validation',
    description: 'Validate loan application against standard requirements checklist.',
    tier: 'simple',
    taskDimensionId: 'doci-task-eligibility-check',
    dataDimensionIds: ['doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-system-user',
    patternType: 'simple',
    exampleQuestions: [
      'Are all required loan documents submitted?',
      'What is the application completeness status?'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-06',
    name: 'Employment Verification Letter Parsing',
    description: 'Extract employment status, job title, salary, and tenure from verification letters.',
    tier: 'simple',
    taskDimensionId: 'doci-task-income-verification',
    dataDimensionIds: ['doci-data-income-docs'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'simple',
    exampleQuestions: [
      'What is the applicant\'s current employer and job title?',
      'Extract employment start date and salary confirmation'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-07',
    name: 'Debt-to-Income Ratio Calculation',
    description: 'Calculate DTI ratio from income and debt documents.',
    tier: 'simple',
    taskDimensionId: 'doci-task-dti-calculation',
    dataDimensionIds: ['doci-data-income-docs', 'doci-data-credit-bureau'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'simple',
    exampleQuestions: [
      'What is the applicant\'s debt-to-income ratio?',
      'Calculate DTI including proposed loan payment'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-08',
    name: 'Loan-to-Value Ratio Determination',
    description: 'Calculate LTV ratio from loan amount and property appraisal value.',
    tier: 'simple',
    taskDimensionId: 'doci-task-property-valuation',
    dataDimensionIds: ['doci-data-property-appraisals', 'doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'simple',
    exampleQuestions: [
      'What is the loan-to-value ratio for this property?',
      'Calculate LTV based on appraised value'
    ],
    confidence: 90
  },

  // COMPLEX PATTERNS (8)
  {
    id: 'doc-pat-09',
    name: 'Comprehensive Loan Eligibility Assessment',
    description: 'Cross-reference applicant credit, income, DTI, and property value against lending standards to determine eligibility.',
    tier: 'complex',
    taskDimensionId: 'doci-task-eligibility-check',
    dataDimensionIds: ['doci-data-credit-bureau', 'doci-data-income-docs', 'doci-data-property-appraisals'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'aggregator',
    exampleQuestions: [
      'Is this applicant eligible for the requested loan amount?',
      'Assess overall loan qualification across all metrics'
    ],
    activatedComponents: ['eligibility-scorer', 'risk-calculator'],
    confidence: 72
  },
  {
    id: 'doc-pat-10',
    name: 'Credit Profile Risk Analysis',
    description: 'Analyze credit report for negative patterns, delinquencies, and credit history trends.',
    tier: 'complex',
    taskDimensionId: 'doci-task-credit-analysis',
    dataDimensionIds: ['doci-data-credit-bureau', 'doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'hopping',
    exampleQuestions: [
      'What credit risks are present in this profile?',
      'Identify payment defaults and delinquency patterns'
    ],
    inferenceNotes: 'Requires analysis of credit history timeline and patterns',
    confidence: 72
  },
  {
    id: 'doc-pat-11',
    name: 'Income Stability and Verification Cross-Check',
    description: 'Cross-verify income from multiple documents (W-2, paystubs, employment letter) for consistency.',
    tier: 'complex',
    taskDimensionId: 'doci-task-income-verification',
    dataDimensionIds: ['doci-data-income-docs', 'doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'hopping',
    exampleQuestions: [
      'Is reported income consistent across all documents?',
      'Verify income history and employment stability'
    ],
    inferenceNotes: 'Involves matching across multiple document types and time periods',
    confidence: 72
  },
  {
    id: 'doc-pat-12',
    name: 'Property Valuation and Underwriting Assessment',
    description: 'Analyze property appraisal against comparable sales and market conditions to validate underwriting.',
    tier: 'complex',
    taskDimensionId: 'doci-task-property-valuation',
    dataDimensionIds: ['doci-data-property-appraisals', 'doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'hopping',
    exampleQuestions: [
      'Is the property appraisal reasonable compared to comps?',
      'Validate property value and condition assessment'
    ],
    inferenceNotes: 'Requires market analysis and comparable property evaluation',
    confidence: 72
  },
  {
    id: 'doc-pat-13',
    name: 'Loan Compliance and Regulatory Validation',
    description: 'Validate loan terms and underwriting decisions against regulatory requirements and lending guidelines.',
    tier: 'complex',
    taskDimensionId: 'doci-task-compliance-validation',
    dataDimensionIds: ['doci-data-loan-apps', 'doci-data-credit-bureau'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'hopping',
    exampleQuestions: [
      'Does this loan comply with all regulatory requirements?',
      'Verify compliance with lending standards and guidelines'
    ],
    inferenceNotes: 'Requires rule engine integration for regulatory checks',
    confidence: 72
  },
  {
    id: 'doc-pat-14',
    name: 'Loan Conditions Generation',
    description: 'Generate conditional requirements for loan approval based on identified gaps or concerns.',
    tier: 'complex',
    taskDimensionId: 'doci-task-conditions-generation',
    dataDimensionIds: ['doci-data-loan-apps', 'doci-data-credit-bureau', 'doci-data-income-docs'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'aggregator',
    exampleQuestions: [
      'What conditions should be placed on this loan approval?',
      'Generate requirements for document submission or clarification'
    ],
    activatedComponents: ['conditions-engine', 'documentation-tracker'],
    confidence: 72
  },
  {
    id: 'doc-pat-15',
    name: 'Underwriter Decision Routing',
    description: 'Route loans to appropriate underwriter (standard vs. senior) based on complexity and risk profile.',
    tier: 'complex',
    taskDimensionId: 'doci-task-decision-routing',
    dataDimensionIds: ['doci-data-loan-apps', 'doci-data-credit-bureau', 'doci-data-property-appraisals'],
    userProfileDimensionId: 'doci-up-system-user',
    patternType: 'aggregator',
    exampleQuestions: [
      'Which underwriter should review this application?',
      'Route based on risk profile and application complexity'
    ],
    activatedComponents: ['routing-engine', 'workload-balancer'],
    confidence: 72
  },
  {
    id: 'doc-pat-16',
    name: 'Portfolio Risk Assessment',
    description: 'Assess cumulative portfolio risk across multiple loans to identify concentration and trend risks.',
    tier: 'complex',
    taskDimensionId: 'doci-task-portfolio-assessment',
    dataDimensionIds: ['doci-data-loan-apps', 'doci-data-credit-bureau', 'doci-data-property-appraisals'],
    userProfileDimensionId: 'doci-up-business-user',
    patternType: 'aggregator',
    exampleQuestions: [
      'What is the overall portfolio risk level?',
      'Identify concentration risks and adverse trends'
    ],
    activatedComponents: ['portfolio-analyzer', 'risk-aggregator'],
    confidence: 72
  },

  // FUZZY PATTERNS (8)
  {
    id: 'doc-pat-17',
    name: 'Ambiguous Credit History Interpretation',
    description: 'Interpret credit events where cause is unclear or credit profile has competing signals.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-credit-analysis',
    dataDimensionIds: ['doci-data-credit-bureau', 'doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'branch',
    exampleQuestions: [
      'Was the late payment due to hardship or negligence?',
      'How concerning is this credit event in context?'
    ],
    ambiguityNotes: 'Credit event interpretation depends on timing, severity, and recovery; requires underwriter judgment',
    confidence: 50
  },
  {
    id: 'doc-pat-18',
    name: 'Fraud Detection in Loan Application',
    description: 'Identify potentially fraudulent applications using document verification and pattern analysis.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-compliance-validation',
    dataDimensionIds: ['doci-data-loan-apps', 'doci-data-income-docs'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'reasoning',
    exampleQuestions: [
      'Are the application documents genuine or fraudulent?',
      'What red flags suggest potential document forgery or misrepresentation?'
    ],
    ambiguityNotes: 'Fraud detection is probabilistic; document authentication may require manual verification',
    confidence: 50
  },
  {
    id: 'doc-pat-19',
    name: 'Compensating Factor Assessment',
    description: 'Assess whether compensating factors justify approval despite marginal credit or income metrics.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-eligibility-check',
    dataDimensionIds: ['doci-data-credit-bureau', 'doci-data-income-docs', 'doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'reasoning',
    exampleQuestions: [
      'Do compensating factors justify an otherwise marginal loan?',
      'Should we approve despite below-guideline metrics?'
    ],
    ambiguityNotes: 'Compensating factor weight depends on guideline interpretation and underwriter discretion',
    confidence: 50
  },
  {
    id: 'doc-pat-20',
    name: 'Market Condition Impact on Property Valuation',
    description: 'Assess impact of current market conditions on property value trends and appraisal reasonableness.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-property-valuation',
    dataDimensionIds: ['doci-data-property-appraisals', 'doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is the appraisal reasonable given current market conditions?',
      'How do recent market trends affect property valuation?'
    ],
    ambiguityNotes: 'Market impact assessment depends on regional conditions and economic forecasts',
    confidence: 50
  },
  {
    id: 'doc-pat-21',
    name: 'Income Calculation Ambiguity Resolution',
    description: 'Resolve ambiguous income calculation when documents show variable or non-standard income.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-income-verification',
    dataDimensionIds: ['doci-data-income-docs', 'doci-data-loan-apps'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'branch',
    exampleQuestions: [
      'How should we calculate income from self-employment or bonus?',
      'What is the most conservative income figure to use?'
    ],
    ambiguityNotes: 'Income calculation for non-standard sources requires guideline interpretation and underwriter judgment',
    confidence: 50
  },
  {
    id: 'doc-pat-22',
    name: 'Loan Denial vs. Conditional Approval Decision',
    description: 'Determine whether application should be denied or approved with conditions based on risk profile.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-decision-routing',
    dataDimensionIds: ['doci-data-loan-apps', 'doci-data-credit-bureau', 'doci-data-income-docs'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'reasoning',
    exampleQuestions: [
      'Should this application be denied or conditionally approved?',
      'What remediation would make this loan acceptable?'
    ],
    ambiguityNotes: 'Denial vs. approval decision depends on risk tolerance and guideline flexibility',
    confidence: 50
  },
  {
    id: 'doc-pat-23',
    name: 'Documentation Sufficiency Assessment',
    description: 'Assess whether provided documentation is sufficient or if additional documentation is needed.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-application-intake',
    dataDimensionIds: ['doci-data-loan-apps', 'doci-data-income-docs'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is the provided documentation adequate for underwriting?',
      'What additional documents are needed to proceed?'
    ],
    ambiguityNotes: 'Documentation sufficiency depends on loan complexity and guideline requirements',
    confidence: 50
  },
  {
    id: 'doc-pat-24',
    name: 'Regulatory Guideline Interpretation Ambiguity',
    description: 'Resolve ambiguous regulatory guideline interpretation when multiple valid interpretations exist.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-compliance-validation',
    dataDimensionIds: ['doci-data-loan-apps', 'doci-data-credit-bureau'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'reasoning',
    exampleQuestions: [
      'How should we interpret this guideline in edge cases?',
      'Which interpretation approach is most conservative?'
    ],
    ambiguityNotes: 'Guideline interpretation varies by institution and regulator; legal guidance may be required',
    confidence: 50
  }
]

export const DECISION_WORKFLOW_PATTERNS: DimensionPattern[] = [
  // SIMPLE PATTERNS (8)
  {
    id: 'dental-pat-01',
    name: 'Patient Demographics Lookup',
    description: 'Retrieve patient demographics, contact info, and insurance identifiers from EHR.',
    tier: 'simple',
    taskDimensionId: 'dw-task-patient-intake',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-admin-staff',
    patternType: 'simple',
    exampleQuestions: [
      'What is the patient name, DOB, and contact information?',
      'Pull up patient insurance ID and primary care provider'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-02',
    name: 'Insurance Eligibility Check',
    description: 'Query insurance plan eligibility and coverage type for patient.',
    tier: 'simple',
    taskDimensionId: 'dw-task-insurance-verification',
    dataDimensionIds: ['dw-data-insurance-benefits'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'simple',
    exampleQuestions: [
      'Is this patient\'s insurance active and eligible?',
      'What is the patient\'s coverage type and carrier?'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-03',
    name: 'Procedure Code & CPT Lookup',
    description: 'Look up diagnosis codes (ICD-10) and procedure codes (CPT) for conditions and treatments.',
    tier: 'simple',
    taskDimensionId: 'dw-task-treatment-cost-estimation',
    dataDimensionIds: ['dw-data-clinical-guidelines'],
    userProfileDimensionId: 'dw-up-physician',
    patternType: 'simple',
    exampleQuestions: [
      'What is the CPT code for an EKG?',
      'Look up the ICD-10 code for hypertension'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-04',
    name: 'Emergency Symptom Triage',
    description: 'Classify patient symptoms into emergency, urgent, or routine triage levels.',
    tier: 'simple',
    taskDimensionId: 'dw-task-clinical-triage',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-nurse',
    patternType: 'simple',
    exampleQuestions: [
      'Is this patient presenting with emergency symptoms?',
      'What triage level should this patient be assigned?'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-05',
    name: 'Informed Consent Verification',
    description: 'Verify patient has signed informed consent for procedures.',
    tier: 'simple',
    taskDimensionId: 'dw-task-consent-collection',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-admin-staff',
    patternType: 'simple',
    exampleQuestions: [
      'Has the patient provided informed consent for this procedure?',
      'Check the consent documentation status'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-06',
    name: 'Provider Availability & Scheduling',
    description: 'Check available appointment slots across provider network for given specialty and date.',
    tier: 'simple',
    taskDimensionId: 'dw-task-appointment-scheduling',
    dataDimensionIds: ['dw-data-provider-network'],
    userProfileDimensionId: 'dw-up-admin-staff',
    patternType: 'simple',
    exampleQuestions: [
      'What appointment times are available with cardiology next week?',
      'Find the next available slot with in-network providers'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-07',
    name: 'Insurance Deductible & Maximum Check',
    description: 'Check remaining deductible, out-of-pocket maximum, and annual coverage limits.',
    tier: 'simple',
    taskDimensionId: 'dw-task-coverage-lookup',
    dataDimensionIds: ['dw-data-insurance-benefits'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'simple',
    exampleQuestions: [
      'What is the patient\'s remaining deductible?',
      'How much of the annual maximum has been used?'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-08',
    name: 'Patient Clinical History Retrieval',
    description: 'Retrieve patient medical history, conditions, medications, and allergies from EHR.',
    tier: 'simple',
    taskDimensionId: 'dw-task-patient-intake',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-physician',
    patternType: 'simple',
    exampleQuestions: [
      'What is the patient\'s complete medical history?',
      'What medications is the patient taking and what are documented allergies?'
    ],
    confidence: 90
  },

  // COMPLEX PATTERNS (8)
  {
    id: 'dental-pat-09',
    name: 'Insurance Coverage & Prior Authorization Verification',
    description: 'Verify patient insurance eligibility and determine prior authorization requirements by cross-referencing insurance and clinical guidelines.',
    tier: 'complex',
    taskDimensionId: 'dw-task-insurance-verification',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-insurance-benefits', 'dw-data-clinical-guidelines'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'hopping',
    exampleQuestions: [
      'Is this procedure covered and does it require prior authorization?',
      'Verify insurance eligibility and check prior auth requirements'
    ],
    inferenceNotes: 'Requires matching patient to plan, checking coverage, and determining pre-auth rules based on procedure code',
    confidence: 72
  },
  {
    id: 'dental-pat-10',
    name: 'Emergency Triage & Care Routing',
    description: 'Assess clinical acuity using symptoms and patient history, then route to appropriate care level (ED, urgent, scheduled).',
    tier: 'complex',
    taskDimensionId: 'dw-task-clinical-triage',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-clinical-guidelines'],
    userProfileDimensionId: 'dw-up-nurse',
    patternType: 'branch',
    exampleQuestions: [
      'Should this patient go to ED or can they be seen in clinic?',
      'What care pathway should be initiated for this clinical presentation?'
    ],
    inferenceNotes: 'Requires symptom assessment, vital signs evaluation, and clinical pathway matching against guidelines',
    confidence: 72
  },
  {
    id: 'dental-pat-11',
    name: 'Procedure Cost Estimation with Insurance',
    description: 'Calculate estimated patient responsibility using procedure codes, insurance plan coverage, and deductible status.',
    tier: 'complex',
    taskDimensionId: 'dw-task-treatment-cost-estimation',
    dataDimensionIds: ['dw-data-clinical-guidelines', 'dw-data-insurance-benefits'],
    userProfileDimensionId: 'dw-up-care-coordinator',
    patternType: 'aggregator',
    exampleQuestions: [
      'What will this procedure cost after insurance coverage?',
      'Estimate the patient out-of-pocket expense given their coverage'
    ],
    activatedComponents: ['cost-calculator', 'insurance-processor', 'deductible-tracker'],
    confidence: 72
  },
  {
    id: 'dental-pat-12',
    name: 'Emergency Patient Escalation & Notification',
    description: 'Detect emergency conditions and immediately notify appropriate on-call provider with clinical context.',
    tier: 'complex',
    taskDimensionId: 'dw-task-emergency-routing',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-provider-network'],
    userProfileDimensionId: 'dw-up-nurse',
    patternType: 'hopping',
    exampleQuestions: [
      'Which physician should handle this emergency and how do I escalate immediately?',
      'Route this emergency case with full clinical context to on-call provider'
    ],
    inferenceNotes: 'Requires symptom matching to emergency protocols, on-call availability, and context packaging',
    confidence: 72
  },
  {
    id: 'dental-pat-13',
    name: 'Comprehensive Patient Registration & Intake',
    description: 'Collect and validate all required patient intake information including demographics, insurance, consent, and medical history.',
    tier: 'complex',
    taskDimensionId: 'dw-task-patient-intake',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-insurance-benefits'],
    userProfileDimensionId: 'dw-up-admin-staff',
    patternType: 'aggregator',
    exampleQuestions: [
      'Is patient registration complete and verified?',
      'Collect all required intake information and validate for completeness'
    ],
    activatedComponents: ['intake-validator', 'insurance-collector', 'consent-manager'],
    confidence: 72
  },
  {
    id: 'dental-pat-14',
    name: 'Prior Authorization Submission & Tracking',
    description: 'Determine if prior authorization is required, prepare submission package, and track approval status.',
    tier: 'complex',
    taskDimensionId: 'dw-task-coverage-lookup',
    dataDimensionIds: ['dw-data-insurance-benefits', 'dw-data-clinical-guidelines'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'hopping',
    exampleQuestions: [
      'Does this procedure require prior authorization and what documents are needed?',
      'Prepare and submit prior auth request and track status'
    ],
    inferenceNotes: 'Rules vary by insurance plan, procedure code, and clinical indication. Tracking integrates with carrier APIs.',
    confidence: 72
  },
  {
    id: 'dental-pat-15',
    name: 'Post-Visit Follow-Up Scheduling',
    description: 'Recommend and schedule follow-up appointments based on clinical pathway and patient history.',
    tier: 'complex',
    taskDimensionId: 'dw-task-followup-management',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-clinical-guidelines'],
    userProfileDimensionId: 'dw-up-care-coordinator',
    patternType: 'aggregator',
    exampleQuestions: [
      'When should the patient return for follow-up?',
      'Schedule appropriate post-discharge or post-procedure follow-up'
    ],
    activatedComponents: ['followup-planner', 'scheduling-engine', 'reminder-scheduler'],
    confidence: 72
  },
  {
    id: 'dental-pat-16',
    name: 'Care Information & Patient Education',
    description: 'Answer patient questions about appointments, procedures, insurance, recovery, and care coordination.',
    tier: 'complex',
    taskDimensionId: 'dw-task-patient-faq',
    dataDimensionIds: ['dw-data-clinical-guidelines', 'dw-data-insurance-benefits'],
    userProfileDimensionId: 'dw-up-patient',
    patternType: 'hopping',
    exampleQuestions: [
      'What can I expect from this procedure and how does my insurance cover it?',
      'What is the recovery process and when should I follow up?'
    ],
    inferenceNotes: 'Requires combining clinical pathway info, insurance coverage, and plain-language patient education materials',
    confidence: 72
  },

  // FUZZY PATTERNS (8)
  {
    id: 'dental-pat-17',
    name: 'Ambiguous Clinical Presentation',
    description: 'Patient presentation could indicate multiple conditions with different urgency levels and care pathways.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-clinical-triage',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-clinical-guidelines'],
    userProfileDimensionId: 'dw-up-nurse',
    patternType: 'branch',
    exampleQuestions: [
      'Is this chest discomfort cardiac or musculoskeletal?',
      'Could this be an emergency or a routine visit?'
    ],
    ambiguityNotes: 'Symptoms may overlap across conditions; requires physician assessment and patient history context',
    confidence: 50
  },
  {
    id: 'dental-pat-18',
    name: 'Clinical Treatment Pathway Decision',
    description: 'Multiple clinically-appropriate treatment pathways exist with different risk-benefit profiles.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-patient-intake',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-clinical-guidelines'],
    userProfileDimensionId: 'dw-up-physician',
    patternType: 'reasoning',
    exampleQuestions: [
      'What is the best treatment option for this patient\'s condition?',
      'Should we pursue conservative management or procedural intervention?'
    ],
    ambiguityNotes: 'Treatment choice depends on clinical judgment, patient preferences, prognosis, and comorbidities',
    confidence: 50
  },
  {
    id: 'dental-pat-19',
    name: 'Insurance Prior Auth Denial Risk',
    description: 'Assess likelihood of prior authorization denial based on medical necessity and coverage rules.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-coverage-lookup',
    dataDimensionIds: ['dw-data-insurance-benefits', 'dw-data-clinical-guidelines', 'dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'reasoning',
    exampleQuestions: [
      'Will this prior auth likely be denied or approved?',
      'What is the risk of denial for this procedure request?'
    ],
    ambiguityNotes: 'Denial prediction depends on partial claim history, carrier decision patterns, and clinical documentation completeness',
    confidence: 50
  },
  {
    id: 'dental-pat-20',
    name: 'Patient Adherence Risk Assessment',
    description: 'Assess likelihood patient will adhere to prescribed care plan and follow-up requirements.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-followup-management',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-physician',
    patternType: 'reasoning',
    exampleQuestions: [
      'Will this patient comply with the treatment plan?',
      'What is the patient adherence risk level?'
    ],
    ambiguityNotes: 'Adherence depends on complex behavioral, socioeconomic, and health literacy factors',
    confidence: 50
  },
  {
    id: 'dental-pat-21',
    name: 'Optimal Appointment Slot Selection',
    description: 'Find best appointment time balancing provider availability, patient preferences, and clinical appropriateness.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-appointment-scheduling',
    dataDimensionIds: ['dw-data-provider-network', 'dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-care-coordinator',
    patternType: 'branch',
    exampleQuestions: [
      'What is the optimal time to schedule this complex procedure?',
      'Which provider and time slot best fits this patient\'s clinical and personal needs?'
    ],
    ambiguityNotes: 'Optimal scheduling balances provider expertise, patient convenience, clinical urgency, and system capacity',
    confidence: 50
  },
  {
    id: 'dental-pat-22',
    name: 'Informed Consent Validity & Comprehension',
    description: 'Assess whether patient truly understands procedure risks and benefits given clinical complexity.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-consent-collection',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-clinical-guidelines'],
    userProfileDimensionId: 'dw-up-physician',
    patternType: 'reasoning',
    exampleQuestions: [
      'Does the patient fully understand the procedure risks and alternatives?',
      'Is the consent truly informed given the clinical complexity?'
    ],
    ambiguityNotes: 'Validity assessment requires subjective evaluation of patient understanding, cognitive capacity, and disclosure adequacy',
    confidence: 50
  },
  {
    id: 'dental-pat-23',
    name: 'Insurance Coverage Appeal Strategy',
    description: 'Develop appeal strategy for denied claims considering contractual terms and precedent.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-insurance-verification',
    dataDimensionIds: ['dw-data-insurance-benefits', 'dw-data-clinical-guidelines', 'dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'reasoning',
    exampleQuestions: [
      'How should we approach this coverage denial with the insurance company?',
      'What is our best appeal strategy based on contract and precedent?'
    ],
    ambiguityNotes: 'Appeal success depends on insurance company policies, contractual interpretation, precedent, and clinical documentation',
    confidence: 50
  },
  {
    id: 'dental-pat-24',
    name: 'Patient No-Show & Cancellation Risk',
    description: 'Predict likelihood of appointment no-show or cancellation based on patient history and factors.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-appointment-scheduling',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-care-coordinator',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is this patient likely to no-show or cancel their appointment?',
      'What is the no-show risk for this appointment booking?'
    ],
    ambiguityNotes: 'No-show prediction depends on behavioral history, socioeconomic factors, appointment timing, and incomplete data',
    confidence: 50
  }
]

export const CODING_AGENT_PATTERNS: DimensionPattern[] = [
  // SIMPLE PATTERNS (8)
  {
    id: 'code-pat-01',
    name: 'Function Signature Lookup',
    description: 'Look up function signature and documentation from API documentation.',
    tier: 'simple',
    taskDimensionId: 'ca-task-feature-implementation',
    dataDimensionIds: ['ca-data-api-docs'],
    userProfileDimensionId: 'ca-up-software-engineer',
    patternType: 'simple',
    exampleQuestions: [
      'What is the signature for the fetch API?',
      'How do I call the database query method?'
    ],
    confidence: 90
  },
  {
    id: 'code-pat-02',
    name: 'Error Stack Trace Analysis',
    description: 'Parse and identify error source from stack trace.',
    tier: 'simple',
    taskDimensionId: 'ca-task-bug-diagnosis',
    dataDimensionIds: ['ca-data-codebase-repo'],
    userProfileDimensionId: 'ca-up-software-engineer',
    patternType: 'simple',
    exampleQuestions: [
      'What line is causing this error?',
      'Where in the stack trace does the problem originate?'
    ],
    confidence: 90
  },
  {
    id: 'code-pat-03',
    name: 'Test Case Extraction',
    description: 'Extract test cases and expected outputs from test files.',
    tier: 'simple',
    taskDimensionId: 'ca-task-test-generation',
    dataDimensionIds: ['ca-data-test-patterns'],
    userProfileDimensionId: 'ca-up-qa-engineer',
    patternType: 'simple',
    exampleQuestions: [
      'What test cases exist for this function?',
      'Extract all test cases from the test file'
    ],
    confidence: 90
  },
  {
    id: 'code-pat-04',
    name: 'Code Style Compliance Check',
    description: 'Check if code follows project style guide.',
    tier: 'simple',
    taskDimensionId: 'ca-task-code-refactoring',
    dataDimensionIds: ['ca-data-style-guide'],
    userProfileDimensionId: 'ca-up-code-reviewer',
    patternType: 'simple',
    exampleQuestions: [
      'Does this code follow our style guide?',
      'What style violations are in this code?'
    ],
    confidence: 90
  },
  {
    id: 'code-pat-05',
    name: 'Dependency Version Lookup',
    description: 'Look up compatible versions for a dependency.',
    tier: 'simple',
    taskDimensionId: 'ca-task-dependency-analysis',
    dataDimensionIds: ['ca-data-codebase-repo'],
    userProfileDimensionId: 'ca-up-devops-engineer',
    patternType: 'simple',
    exampleQuestions: [
      'What version of React are we using?',
      'Which versions are compatible with this package?'
    ],
    confidence: 90
  },
  {
    id: 'code-pat-06',
    name: 'API Endpoint Documentation',
    description: 'Extract API endpoint details from documentation.',
    tier: 'simple',
    taskDimensionId: 'ca-task-api-design',
    dataDimensionIds: ['ca-data-api-docs'],
    userProfileDimensionId: 'ca-up-software-engineer',
    patternType: 'simple',
    exampleQuestions: [
      'What are the parameters for this API endpoint?',
      'What does this endpoint return?'
    ],
    confidence: 90
  },
  {
    id: 'code-pat-07',
    name: 'Performance Bottleneck Identification',
    description: 'Identify obviously slow code patterns or inefficient implementations.',
    tier: 'simple',
    taskDimensionId: 'ca-task-performance-optimization',
    dataDimensionIds: ['ca-data-codebase-repo'],
    userProfileDimensionId: 'ca-up-software-engineer',
    patternType: 'simple',
    exampleQuestions: [
      'What is the performance bottleneck in this code?',
      'Where is the inefficiency in this implementation?'
    ],
    confidence: 90
  },
  {
    id: 'code-pat-08',
    name: 'Security Vulnerability Scanning',
    description: 'Scan code for obvious security vulnerabilities.',
    tier: 'simple',
    taskDimensionId: 'ca-task-security-review',
    dataDimensionIds: ['ca-data-codebase-repo'],
    userProfileDimensionId: 'ca-up-code-reviewer',
    patternType: 'simple',
    exampleQuestions: [
      'Are there SQL injection risks in this code?',
      'What security issues are present?'
    ],
    confidence: 90
  },

  // COMPLEX PATTERNS (8)
  {
    id: 'code-pat-09',
    name: 'Comprehensive Bug Fix Implementation',
    description: 'Analyze error, find root cause across codebase, and implement fix.',
    tier: 'complex',
    taskDimensionId: 'ca-task-bug-diagnosis',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-api-docs'],
    userProfileDimensionId: 'ca-up-software-engineer',
    patternType: 'hopping',
    exampleQuestions: [
      'Fix this bug across the entire codebase',
      'What is causing this error and how do we fix it?'
    ],
    inferenceNotes: 'Requires correlating error symptoms with code locations',
    confidence: 72
  },
  {
    id: 'code-pat-10',
    name: 'API Contract Validation',
    description: 'Validate that implementation matches API contract and documentation.',
    tier: 'complex',
    taskDimensionId: 'ca-task-api-design',
    dataDimensionIds: ['ca-data-api-docs', 'ca-data-codebase-repo'],
    userProfileDimensionId: 'ca-up-architect',
    patternType: 'hopping',
    exampleQuestions: [
      'Does this implementation match the API contract?',
      'Verify the implementation against the specification'
    ],
    inferenceNotes: 'Requires comparing implementation with documented contract',
    confidence: 72
  },
  {
    id: 'code-pat-11',
    name: 'Test Coverage Analysis',
    description: 'Analyze test coverage and identify untested code paths.',
    tier: 'complex',
    taskDimensionId: 'ca-task-test-generation',
    dataDimensionIds: ['ca-data-test-patterns', 'ca-data-codebase-repo'],
    userProfileDimensionId: 'ca-up-qa-engineer',
    patternType: 'aggregator',
    exampleQuestions: [
      'What code paths are not covered by tests?',
      'Generate tests for uncovered functionality'
    ],
    activatedComponents: ['coverage-analyzer', 'test-generator'],
    confidence: 72
  },
  {
    id: 'code-pat-12',
    name: 'Refactoring Impact Assessment',
    description: 'Assess impact of refactoring across dependent code.',
    tier: 'complex',
    taskDimensionId: 'ca-task-code-refactoring',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-test-patterns'],
    userProfileDimensionId: 'ca-up-code-reviewer',
    patternType: 'hopping',
    exampleQuestions: [
      'What code depends on this function?',
      'What breaks if we refactor this component?'
    ],
    inferenceNotes: 'Requires tracing dependencies across codebase',
    confidence: 72
  },
  {
    id: 'code-pat-13',
    name: 'Documentation Generation',
    description: 'Generate documentation from code and API specifications.',
    tier: 'complex',
    taskDimensionId: 'ca-task-documentation-generation',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-api-docs'],
    userProfileDimensionId: 'ca-up-software-engineer',
    patternType: 'aggregator',
    exampleQuestions: [
      'Generate documentation for this module',
      'Create API docs from the implementation'
    ],
    activatedComponents: ['doc-generator'],
    confidence: 72
  },
  {
    id: 'code-pat-14',
    name: 'Dependency Conflict Resolution',
    description: 'Identify and resolve conflicting dependency versions.',
    tier: 'complex',
    taskDimensionId: 'ca-task-dependency-analysis',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-api-docs'],
    userProfileDimensionId: 'ca-up-devops-engineer',
    patternType: 'hopping',
    exampleQuestions: [
      'How do we resolve this dependency conflict?',
      'Which versions are compatible?'
    ],
    inferenceNotes: 'Requires understanding version compatibility rules',
    confidence: 72
  },
  {
    id: 'code-pat-15',
    name: 'Performance Optimization Strategy',
    description: 'Develop comprehensive performance optimization plan with benchmarks.',
    tier: 'complex',
    taskDimensionId: 'ca-task-performance-optimization',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-test-patterns'],
    userProfileDimensionId: 'ca-up-architect',
    patternType: 'aggregator',
    exampleQuestions: [
      'How can we optimize performance for this system?',
      'What is the optimal refactoring approach?'
    ],
    activatedComponents: ['performance-analyzer', 'benchmark-runner'],
    confidence: 72
  },
  {
    id: 'code-pat-16',
    name: 'Security Audit and Remediation',
    description: 'Conduct comprehensive security review and recommend fixes.',
    tier: 'complex',
    taskDimensionId: 'ca-task-security-review',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-api-docs'],
    userProfileDimensionId: 'ca-up-code-reviewer',
    patternType: 'hopping',
    exampleQuestions: [
      'What are all the security issues in this codebase?',
      'Create a security remediation plan'
    ],
    inferenceNotes: 'Requires systematic security analysis across components',
    confidence: 72
  },

  // FUZZY PATTERNS (8)
  {
    id: 'code-pat-17',
    name: 'Architecture Recommendations',
    description: 'Recommend optimal architecture when design choices are ambiguous.',
    tier: 'fuzzy',
    taskDimensionId: 'ca-task-architecture-assessment',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-api-docs'],
    userProfileDimensionId: 'ca-up-architect',
    patternType: 'reasoning',
    exampleQuestions: [
      'What architecture would be best for this system?',
      'Should we use microservices or monolith?'
    ],
    ambiguityNotes: 'Architecture choice depends on scalability, team size, and organizational constraints',
    confidence: 50
  },
  {
    id: 'code-pat-18',
    name: 'Technical Debt Assessment',
    description: 'Assess technical debt and prioritize remediation.',
    tier: 'fuzzy',
    taskDimensionId: 'ca-task-architecture-assessment',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-test-patterns'],
    userProfileDimensionId: 'ca-up-architect',
    patternType: 'reasoning',
    exampleQuestions: [
      'What is our technical debt?',
      'What should we prioritize for refactoring?'
    ],
    ambiguityNotes: 'Technical debt assessment is subjective and depends on business priorities',
    confidence: 50
  },
  {
    id: 'code-pat-19',
    name: 'Learning Path Recommendation',
    description: 'Recommend optimal learning path for junior engineer.',
    tier: 'fuzzy',
    taskDimensionId: 'ca-task-feature-implementation',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-api-docs'],
    userProfileDimensionId: 'ca-up-junior-developer',
    patternType: 'reasoning',
    exampleQuestions: [
      'What should I learn first to contribute to this project?',
      'What is my development learning path?'
    ],
    ambiguityNotes: 'Learning paths depend on background, learning style, and project needs',
    confidence: 50
  },
  {
    id: 'code-pat-20',
    name: 'Code Review Decision Making',
    description: 'Make nuanced code review decision when requirements are ambiguous.',
    tier: 'fuzzy',
    taskDimensionId: 'ca-task-code-refactoring',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-style-guide'],
    userProfileDimensionId: 'ca-up-code-reviewer',
    patternType: 'branch',
    exampleQuestions: [
      'Should we approve this code change?',
      'Is this implementation acceptable?'
    ],
    ambiguityNotes: 'Code approval involves tradeoffs between perfectionism and pragmatism',
    confidence: 50
  },
  {
    id: 'code-pat-21',
    name: 'Framework Selection',
    description: 'Recommend optimal framework or library for requirements.',
    tier: 'fuzzy',
    taskDimensionId: 'ca-task-api-design',
    dataDimensionIds: ['ca-data-api-docs', 'ca-data-codebase-repo'],
    userProfileDimensionId: 'ca-up-architect',
    patternType: 'reasoning',
    exampleQuestions: [
      'Should we use React or Vue for this project?',
      'Which testing framework is best for our needs?'
    ],
    ambiguityNotes: 'Framework choice depends on team expertise, ecosystem, and project characteristics',
    confidence: 50
  },
  {
    id: 'code-pat-22',
    name: 'Debugging Strategy Development',
    description: 'Develop debugging strategy for complex, non-obvious issues.',
    tier: 'fuzzy',
    taskDimensionId: 'ca-task-bug-diagnosis',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-test-patterns'],
    userProfileDimensionId: 'ca-up-software-engineer',
    patternType: 'branch',
    exampleQuestions: [
      'How do we debug this intermittent issue?',
      'What debugging approach should we take?'
    ],
    ambiguityNotes: 'Debugging strategy depends on system complexity and error reproducibility',
    confidence: 50
  },
  {
    id: 'code-pat-23',
    name: 'Migration Path Planning',
    description: 'Plan migration from legacy code to modern architecture.',
    tier: 'fuzzy',
    taskDimensionId: 'ca-task-architecture-assessment',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-api-docs', 'ca-data-test-patterns'],
    userProfileDimensionId: 'ca-up-architect',
    patternType: 'reasoning',
    exampleQuestions: [
      'How should we migrate to the new architecture?',
      'What is our refactoring roadmap?'
    ],
    ambiguityNotes: 'Migration planning requires balancing risk, effort, and business needs',
    confidence: 50
  },
  {
    id: 'code-pat-24',
    name: 'Deploy Strategy Evaluation',
    description: 'Evaluate deployment strategy and recommend approach.',
    tier: 'fuzzy',
    taskDimensionId: 'ca-task-dependency-analysis',
    dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-test-patterns'],
    userProfileDimensionId: 'ca-up-devops-engineer',
    patternType: 'reasoning',
    exampleQuestions: [
      'Should we use blue-green or canary deployment?',
      'What is the best deployment strategy for this change?'
    ],
    ambiguityNotes: 'Deploy strategy depends on risk tolerance, infrastructure, and team capabilities',
    confidence: 50
  }
]
