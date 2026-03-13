import type { DimensionPattern } from '@/store/agentTypes'

export const DOC_INTELLIGENCE_PATTERNS: DimensionPattern[] = [
  // SIMPLE PATTERNS (8)
  {
    id: 'doc-pat-01',
    name: 'Invoice Line Item Classification',
    description: 'Classify invoice line items into expense categories based on item description.',
    tier: 'simple',
    taskDimensionId: 'doci-task-document-classification',
    dataDimensionIds: ['doci-data-aws-invoice'],
    userProfileDimensionId: 'doci-up-business-user',
    patternType: 'simple',
    exampleQuestions: [
      'What category does this line item belong to?',
      'Is this compute, storage, or networking expense?'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-02',
    name: 'Invoice Amount Extraction',
    description: 'Extract total invoice amount and itemized charges from a single invoice document.',
    tier: 'simple',
    taskDimensionId: 'doci-task-field-extraction',
    dataDimensionIds: ['doci-data-gcp-invoice'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'simple',
    exampleQuestions: [
      'What is the total amount due on this invoice?',
      'Extract all charges from the invoice'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-03',
    name: 'Invoice Header Parsing',
    description: 'Parse invoice header information including vendor, invoice number, and date.',
    tier: 'simple',
    taskDimensionId: 'doci-task-invoice-parsing',
    dataDimensionIds: ['doci-data-azure-invoice'],
    userProfileDimensionId: 'doci-up-procurement',
    patternType: 'simple',
    exampleQuestions: [
      'Who is the vendor on this invoice?',
      'What is the invoice number and date?'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-04',
    name: 'Tax Rate Detection',
    description: 'Identify and extract tax rate and tax amount from invoice footer.',
    tier: 'simple',
    taskDimensionId: 'doci-task-field-extraction',
    dataDimensionIds: ['doci-data-aws-invoice'],
    userProfileDimensionId: 'doci-up-auditor',
    patternType: 'simple',
    exampleQuestions: [
      'What is the tax rate applied?',
      'How much tax is included in this invoice?'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-05',
    name: 'Template Schema Matching',
    description: 'Match invoice against known template schema to validate structure compliance.',
    tier: 'simple',
    taskDimensionId: 'doci-task-template-matching',
    dataDimensionIds: ['doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-system-user',
    patternType: 'simple',
    exampleQuestions: [
      'Does this invoice match the standard template?',
      'What template format is this invoice using?'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-06',
    name: 'Vendor Name Extraction',
    description: 'Extract vendor name and company identifier from invoice header.',
    tier: 'simple',
    taskDimensionId: 'doci-task-field-extraction',
    dataDimensionIds: ['doci-data-gcp-invoice'],
    userProfileDimensionId: 'doci-up-procurement',
    patternType: 'simple',
    exampleQuestions: [
      'What is the vendor name on this invoice?',
      'Extract the supplier identifier'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-07',
    name: 'Service Period Detection',
    description: 'Extract service period start and end dates from invoice.',
    tier: 'simple',
    taskDimensionId: 'doci-task-field-extraction',
    dataDimensionIds: ['doci-data-aws-invoice'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'simple',
    exampleQuestions: [
      'What period does this invoice cover?',
      'Extract the service start and end dates'
    ],
    confidence: 90
  },
  {
    id: 'doc-pat-08',
    name: 'Currency Identification',
    description: 'Identify invoice currency and normalize amounts to base currency.',
    tier: 'simple',
    taskDimensionId: 'doci-task-document-classification',
    dataDimensionIds: ['doci-data-azure-invoice'],
    userProfileDimensionId: 'doci-up-business-user',
    patternType: 'simple',
    exampleQuestions: [
      'What currency is this invoice in?',
      'Convert the amount to USD'
    ],
    confidence: 90
  },

  // COMPLEX PATTERNS (8)
  {
    id: 'doc-pat-09',
    name: 'Cost Aggregation Across Vendors',
    description: 'Aggregate and compare costs from multiple cloud vendor invoices to identify spending trends.',
    tier: 'complex',
    taskDimensionId: 'doci-task-cost-aggregation',
    dataDimensionIds: ['doci-data-aws-invoice', 'doci-data-gcp-invoice', 'doci-data-azure-invoice'],
    userProfileDimensionId: 'doci-up-business-user',
    patternType: 'aggregator',
    exampleQuestions: [
      'What is our total cloud spending across AWS, GCP, and Azure?',
      'Compare cost trends between our cloud providers'
    ],
    activatedComponents: ['cost-aggregator', 'trend-analyzer'],
    confidence: 72
  },
  {
    id: 'doc-pat-10',
    name: 'Invoice Anomaly Detection',
    description: 'Cross-reference current invoice against historical invoices to detect unusual charges or patterns.',
    tier: 'complex',
    taskDimensionId: 'doci-task-anomaly-detection',
    dataDimensionIds: ['doci-data-aws-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-auditor',
    patternType: 'hopping',
    exampleQuestions: [
      'Are there any unusual charges on this invoice compared to previous months?',
      'Detect any anomalies or unexpected line items'
    ],
    inferenceNotes: 'Requires comparison with historical baseline',
    confidence: 72
  },
  {
    id: 'doc-pat-11',
    name: 'Cross-Reference Invoice to PO',
    description: 'Match invoice line items against purchase order to validate charges and quantities.',
    tier: 'complex',
    taskDimensionId: 'doci-task-cross-reference-validation',
    dataDimensionIds: ['doci-data-gcp-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-procurement',
    patternType: 'hopping',
    exampleQuestions: [
      'Do all invoice items match the original purchase order?',
      'Verify invoice quantities against our PO'
    ],
    inferenceNotes: 'Involves matching across document types',
    confidence: 72
  },
  {
    id: 'doc-pat-12',
    name: 'Multi-Vendor Cost Optimization',
    description: 'Analyze spending patterns across multiple vendors to identify cost optimization opportunities.',
    tier: 'complex',
    taskDimensionId: 'doci-task-cost-aggregation',
    dataDimensionIds: ['doci-data-aws-invoice', 'doci-data-gcp-invoice'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'aggregator',
    exampleQuestions: [
      'Where can we save money across our cloud spending?',
      'What are our biggest cost drivers by vendor?'
    ],
    activatedComponents: ['cost-analyzer', 'optimization-engine'],
    confidence: 72
  },
  {
    id: 'doc-pat-13',
    name: 'Invoice Validation Against Rules',
    description: 'Validate invoice charges against business rules, spending limits, and compliance policies.',
    tier: 'complex',
    taskDimensionId: 'doci-task-compliance-checking',
    dataDimensionIds: ['doci-data-azure-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-auditor',
    patternType: 'hopping',
    exampleQuestions: [
      'Does this invoice comply with our spending policies?',
      'Are any charges above our approved limits?'
    ],
    inferenceNotes: 'Requires rule engine integration',
    confidence: 72
  },
  {
    id: 'doc-pat-14',
    name: 'Service Usage Attribution',
    description: 'Correlate invoice charges with actual service usage to validate billing accuracy.',
    tier: 'complex',
    taskDimensionId: 'doci-task-cross-reference-validation',
    dataDimensionIds: ['doci-data-aws-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-business-user',
    patternType: 'aggregator',
    exampleQuestions: [
      'Which services drove the highest costs this month?',
      'How much did we actually use compared to what we were charged?'
    ],
    activatedComponents: ['usage-correlator'],
    confidence: 72
  },
  {
    id: 'doc-pat-15',
    name: 'Budget Variance Analysis',
    description: 'Compare actual invoice amounts against budgeted amounts to identify variances.',
    tier: 'complex',
    taskDimensionId: 'doci-task-cost-aggregation',
    dataDimensionIds: ['doci-data-gcp-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'hopping',
    exampleQuestions: [
      'How much did we spend versus our budget?',
      'What percentage variance do we have this month?'
    ],
    inferenceNotes: 'Requires budget baseline data',
    confidence: 72
  },
  {
    id: 'doc-pat-16',
    name: 'Invoice Risk Flagging',
    description: 'Flag invoices for manual review based on risk indicators like unusual amounts or vendors.',
    tier: 'complex',
    taskDimensionId: 'doci-task-risk-flagging',
    dataDimensionIds: ['doci-data-azure-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-system-user',
    patternType: 'hopping',
    exampleQuestions: [
      'Which invoices need manual review?',
      'Flag any high-risk transactions'
    ],
    activatedComponents: ['risk-scorer'],
    confidence: 72
  },

  // FUZZY PATTERNS (8)
  {
    id: 'doc-pat-17',
    name: 'Ambiguous Line Item Classification',
    description: 'Classify line items where category is unclear or multi-purpose charges exist.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-document-classification',
    dataDimensionIds: ['doci-data-aws-invoice', 'doci-data-gcp-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-business-user',
    patternType: 'branch',
    exampleQuestions: [
      'Is this a compute or storage charge?',
      'What category should this miscellaneous service fee go to?'
    ],
    ambiguityNotes: 'Item descriptions may be vague or apply to multiple categories; may require business context',
    confidence: 50
  },
  {
    id: 'doc-pat-18',
    name: 'Fraudulent Invoice Detection',
    description: 'Identify potentially fraudulent invoices using pattern reasoning and vendor behavior analysis.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-risk-flagging',
    dataDimensionIds: ['doci-data-aws-invoice', 'doci-data-azure-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-auditor',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is this invoice legitimate or potentially fraudulent?',
      'What red flags suggest this might be a scam?'
    ],
    ambiguityNotes: 'Fraud indicators are probabilistic; context-dependent patterns may yield false positives',
    confidence: 50
  },
  {
    id: 'doc-pat-19',
    name: 'Vendor Relationship Risk Assessment',
    description: 'Assess vendor reliability and risk using invoice patterns and historical behavior.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-risk-flagging',
    dataDimensionIds: ['doci-data-gcp-invoice', 'doci-data-aws-invoice'],
    userProfileDimensionId: 'doci-up-procurement',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is this vendor reliable based on invoice patterns?',
      'What is the risk level for continuing with this vendor?'
    ],
    ambiguityNotes: 'Risk assessment depends on incomplete historical data and subjective factors',
    confidence: 50
  },
  {
    id: 'doc-pat-20',
    name: 'Optimal Discount Opportunity Detection',
    description: 'Identify when invoices could qualify for early payment discounts or volume rebates.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-cost-aggregation',
    dataDimensionIds: ['doci-data-aws-invoice', 'doci-data-gcp-invoice', 'doci-data-azure-invoice'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'reasoning',
    exampleQuestions: [
      'What discount opportunities are available for this vendor?',
      'Should we consolidate purchases to get volume pricing?'
    ],
    ambiguityNotes: 'Discount eligibility varies by vendor terms; requires negotiation history',
    confidence: 50
  },
  {
    id: 'doc-pat-21',
    name: 'Compliance Violation Detection',
    description: 'Detect potential compliance violations based on invoice characteristics and business rules.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-compliance-checking',
    dataDimensionIds: ['doci-data-azure-invoice', 'doci-data-aws-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-auditor',
    patternType: 'branch',
    exampleQuestions: [
      'Does this invoice violate any regulatory requirements?',
      'What compliance risks should we flag?'
    ],
    ambiguityNotes: 'Compliance rules are context-specific and may conflict; interpretation varies by jurisdiction',
    confidence: 50
  },
  {
    id: 'doc-pat-22',
    name: 'Predictive Budget Overrun Alert',
    description: 'Predict if current spending trajectory will exceed annual budget using invoice patterns.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-cost-aggregation',
    dataDimensionIds: ['doci-data-aws-invoice', 'doci-data-gcp-invoice'],
    userProfileDimensionId: 'doci-up-business-user',
    patternType: 'reasoning',
    exampleQuestions: [
      'Will we exceed our budget based on current spending?',
      'What is our projected year-end spending?'
    ],
    activatedComponents: ['predictive-model'],
    ambiguityNotes: 'Predictions depend on trend stability assumptions; seasonal variations may affect accuracy',
    confidence: 50
  },
  {
    id: 'doc-pat-23',
    name: 'Invoice Duplicate or Near-Duplicate Detection',
    description: 'Identify potentially duplicate or near-duplicate invoices from same vendor.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-anomaly-detection',
    dataDimensionIds: ['doci-data-gcp-invoice', 'doci-data-aws-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-system-user',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is this invoice a duplicate of a previous one?',
      'Are these two invoices suspiciously similar?'
    ],
    ambiguityNotes: 'Threshold for similarity detection is subjective; legitimate invoices may have high overlap',
    confidence: 50
  },
  {
    id: 'doc-pat-24',
    name: 'Vendor Pricing Consistency Check',
    description: 'Assess whether current invoice pricing aligns with historical vendor pricing patterns.',
    tier: 'fuzzy',
    taskDimensionId: 'doci-task-cross-reference-validation',
    dataDimensionIds: ['doci-data-aws-invoice', 'doci-data-gcp-invoice', 'doci-data-invoice-template'],
    userProfileDimensionId: 'doci-up-analyst',
    patternType: 'branch',
    exampleQuestions: [
      'Did the vendor change their pricing unexpectedly?',
      'Is this pricing consistent with past invoices?'
    ],
    ambiguityNotes: 'Price changes may be legitimate due to market conditions, contract terms, or scope changes',
    confidence: 50
  }
]

export const DECISION_WORKFLOW_PATTERNS: DimensionPattern[] = [
  // SIMPLE PATTERNS (8)
  {
    id: 'dental-pat-01',
    name: 'Patient Demographic Lookup',
    description: 'Retrieve basic patient demographics from patient records by ID.',
    tier: 'simple',
    taskDimensionId: 'dw-task-patient-intake',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-office-staff',
    patternType: 'simple',
    exampleQuestions: [
      'What is the patient name and age?',
      'Pull up the patient contact information'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-02',
    name: 'Insurance Plan Identification',
    description: 'Identify patient insurance plan from insurance data based on patient ID.',
    tier: 'simple',
    taskDimensionId: 'dw-task-insurance-verification',
    dataDimensionIds: ['dw-data-insurance-plans'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'simple',
    exampleQuestions: [
      'What insurance plan does this patient have?',
      'Which provider is the patient covered by?'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-03',
    name: 'Treatment Code Lookup',
    description: 'Look up treatment codes and descriptions for specific dental procedures.',
    tier: 'simple',
    taskDimensionId: 'dw-task-treatment-cost-estimation',
    dataDimensionIds: ['dw-data-treatment-codes'],
    userProfileDimensionId: 'dw-up-dentist',
    patternType: 'simple',
    exampleQuestions: [
      'What is the code for a root canal?',
      'Look up the treatment code for this procedure'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-04',
    name: 'Emergency Symptom Classification',
    description: 'Classify patient symptoms into emergency, urgent, or routine categories.',
    tier: 'simple',
    taskDimensionId: 'dw-task-emergency-routing',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-clinical-staff',
    patternType: 'simple',
    exampleQuestions: [
      'Is this patient an emergency case?',
      'How urgent is this patient issue?'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-05',
    name: 'Patient Consent Status Check',
    description: 'Verify if patient has signed required consent forms.',
    tier: 'simple',
    taskDimensionId: 'dw-task-consent-collection',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-office-staff',
    patternType: 'simple',
    exampleQuestions: [
      'Has the patient provided consent for treatment?',
      'Check the consent status'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-06',
    name: 'Schedule Availability Lookup',
    description: 'Check available appointment slots for a given date and provider.',
    tier: 'simple',
    taskDimensionId: 'dw-task-appointment-scheduling',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-office-staff',
    patternType: 'simple',
    exampleQuestions: [
      'What appointment times are available next week?',
      'Find an open slot for this patient'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-07',
    name: 'Coverage Limit Verification',
    description: 'Check remaining insurance coverage limits and deductibles.',
    tier: 'simple',
    taskDimensionId: 'dw-task-coverage-lookup',
    dataDimensionIds: ['dw-data-insurance-plans'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'simple',
    exampleQuestions: [
      'What is the patient annual maximum coverage?',
      'How much deductible has the patient met?'
    ],
    confidence: 90
  },
  {
    id: 'dental-pat-08',
    name: 'Patient Medical History Retrieval',
    description: 'Retrieve relevant medical history from patient records.',
    tier: 'simple',
    taskDimensionId: 'dw-task-patient-intake',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-dentist',
    patternType: 'simple',
    exampleQuestions: [
      'What is the patient medical history?',
      'Does the patient have any allergies or conditions?'
    ],
    confidence: 90
  },

  // COMPLEX PATTERNS (8)
  {
    id: 'dental-pat-09',
    name: 'Insurance Coverage Eligibility Verification',
    description: 'Verify patient insurance eligibility by cross-referencing patient records with insurance data.',
    tier: 'complex',
    taskDimensionId: 'dw-task-insurance-verification',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-insurance-plans'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'hopping',
    exampleQuestions: [
      'Is this treatment covered under the patient insurance plan?',
      'Verify insurance eligibility for this procedure'
    ],
    inferenceNotes: 'Requires matching patient to insurance plan and checking procedure coverage',
    confidence: 72
  },
  {
    id: 'dental-pat-10',
    name: 'Clinical Triage and Routing',
    description: 'Assess clinical urgency and route patient to appropriate care level.',
    tier: 'complex',
    taskDimensionId: 'dw-task-clinical-triage',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-treatment-codes'],
    userProfileDimensionId: 'dw-up-clinical-staff',
    patternType: 'branch',
    exampleQuestions: [
      'Should this patient go to emergency or regular appointment?',
      'What care pathway should this patient follow?'
    ],
    inferenceNotes: 'Requires symptom assessment and clinical judgment',
    confidence: 72
  },
  {
    id: 'dental-pat-11',
    name: 'Treatment Cost Estimation',
    description: 'Calculate estimated treatment cost using procedures, codes, and insurance coverage.',
    tier: 'complex',
    taskDimensionId: 'dw-task-treatment-cost-estimation',
    dataDimensionIds: ['dw-data-treatment-codes', 'dw-data-insurance-plans'],
    userProfileDimensionId: 'dw-up-office-staff',
    patternType: 'aggregator',
    exampleQuestions: [
      'What will the treatment cost after insurance?',
      'Estimate the patient out-of-pocket expense'
    ],
    activatedComponents: ['cost-calculator', 'insurance-processor'],
    confidence: 72
  },
  {
    id: 'dental-pat-12',
    name: 'Emergency Patient Routing',
    description: 'Route emergency patients to appropriate provider based on symptoms and availability.',
    tier: 'complex',
    taskDimensionId: 'dw-task-emergency-routing',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-treatment-codes'],
    userProfileDimensionId: 'dw-up-clinical-staff',
    patternType: 'hopping',
    exampleQuestions: [
      'Which dentist can see this emergency patient today?',
      'Route this emergency case to the appropriate provider'
    ],
    inferenceNotes: 'Requires availability data and clinical expertise matching',
    confidence: 72
  },
  {
    id: 'dental-pat-13',
    name: 'Comprehensive Patient Intake',
    description: 'Gather and validate all patient intake information including demographics and consent.',
    tier: 'complex',
    taskDimensionId: 'dw-task-patient-intake',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-insurance-plans'],
    userProfileDimensionId: 'dw-up-office-staff',
    patternType: 'aggregator',
    exampleQuestions: [
      'Is the patient intake complete and verified?',
      'Collect all required patient intake information'
    ],
    activatedComponents: ['intake-validator'],
    confidence: 72
  },
  {
    id: 'dental-pat-14',
    name: 'Insurance Pre-Authorization Check',
    description: 'Determine if treatment requires pre-authorization and gather required information.',
    tier: 'complex',
    taskDimensionId: 'dw-task-coverage-lookup',
    dataDimensionIds: ['dw-data-insurance-plans', 'dw-data-treatment-codes'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'hopping',
    exampleQuestions: [
      'Does this treatment need insurance pre-authorization?',
      'What documentation is required for approval?'
    ],
    inferenceNotes: 'Rules vary by insurance plan and treatment type',
    confidence: 72
  },
  {
    id: 'dental-pat-15',
    name: 'Follow-up Scheduling Recommendation',
    description: 'Recommend follow-up appointments based on treatment type and patient history.',
    tier: 'complex',
    taskDimensionId: 'dw-task-followup-management',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-treatment-codes'],
    userProfileDimensionId: 'dw-up-dentist',
    patternType: 'aggregator',
    exampleQuestions: [
      'When should the patient return for follow-up?',
      'What follow-up care is needed after this treatment?'
    ],
    activatedComponents: ['followup-planner'],
    confidence: 72
  },
  {
    id: 'dental-pat-16',
    name: 'Patient FAQ Resolution',
    description: 'Answer common patient questions using treatment codes, insurance data, and procedures.',
    tier: 'complex',
    taskDimensionId: 'dw-task-patient-faq',
    dataDimensionIds: ['dw-data-treatment-codes', 'dw-data-insurance-plans'],
    userProfileDimensionId: 'dw-up-patient',
    patternType: 'hopping',
    exampleQuestions: [
      'What is root canal and what does it cost?',
      'Is this treatment covered by my insurance?'
    ],
    inferenceNotes: 'Requires combining multiple data sources for comprehensive answers',
    confidence: 72
  },

  // FUZZY PATTERNS (8)
  {
    id: 'dental-pat-17',
    name: 'Ambiguous Symptom Classification',
    description: 'Classify symptoms that could indicate multiple conditions or urgency levels.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-clinical-triage',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-treatment-codes'],
    userProfileDimensionId: 'dw-up-clinical-staff',
    patternType: 'branch',
    exampleQuestions: [
      'Is this tooth pain from decay or sensitivity?',
      'Could this be an emergency or just a regular issue?'
    ],
    ambiguityNotes: 'Symptoms may overlap; requires clinical assessment and patient history context',
    confidence: 50
  },
  {
    id: 'dental-pat-18',
    name: 'Treatment Plan Recommendation',
    description: 'Recommend optimal treatment plan when multiple options exist.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-patient-faq',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-treatment-codes', 'dw-data-insurance-plans'],
    userProfileDimensionId: 'dw-up-dentist',
    patternType: 'reasoning',
    exampleQuestions: [
      'What is the best treatment option for this patient?',
      'Should we recommend root canal or extraction?'
    ],
    ambiguityNotes: 'Treatment choice depends on subjective factors, patient preferences, and long-term prognosis',
    confidence: 50
  },
  {
    id: 'dental-pat-19',
    name: 'Insurance Claim Denial Prediction',
    description: 'Predict likelihood of insurance claim denial based on historical patterns.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-coverage-lookup',
    dataDimensionIds: ['dw-data-insurance-plans', 'dw-data-treatment-codes', 'dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'reasoning',
    exampleQuestions: [
      'Will this claim likely be denied?',
      'What is the risk of denial for this treatment?'
    ],
    ambiguityNotes: 'Prediction depends on incomplete claim history and insurance company decision variability',
    confidence: 50
  },
  {
    id: 'dental-pat-20',
    name: 'Patient Compliance Risk Assessment',
    description: 'Assess patient likelihood to comply with treatment plans.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-patient-intake',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-dentist',
    patternType: 'reasoning',
    exampleQuestions: [
      'Will this patient comply with the recommended treatment?',
      'What is the patient compliance risk level?'
    ],
    ambiguityNotes: 'Compliance depends on complex behavioral and socioeconomic factors',
    confidence: 50
  },
  {
    id: 'dental-pat-21',
    name: 'Optimal Appointment Scheduling',
    description: 'Find optimal appointment time considering patient preferences and clinical needs.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-appointment-scheduling',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-treatment-codes'],
    userProfileDimensionId: 'dw-up-office-staff',
    patternType: 'branch',
    exampleQuestions: [
      'What is the best time to schedule this patient?',
      'When should we book this complex procedure?'
    ],
    ambiguityNotes: 'Optimal scheduling balances patient convenience, provider expertise, and clinical timing',
    confidence: 50
  },
  {
    id: 'dental-pat-22',
    name: 'Consent Validity Assessment',
    description: 'Assess whether patient consent is informed and valid given clinical complexity.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-consent-collection',
    dataDimensionIds: ['dw-data-patient-records', 'dw-data-treatment-codes'],
    userProfileDimensionId: 'dw-up-dentist',
    patternType: 'reasoning',
    exampleQuestions: [
      'Did the patient understand the treatment risks?',
      'Is the consent truly informed for this procedure?'
    ],
    ambiguityNotes: 'Validity depends on subjective assessment of patient understanding and capacity',
    confidence: 50
  },
  {
    id: 'dental-pat-23',
    name: 'Insurance Coverage Negotiation',
    description: 'Recommend negotiation strategy based on coverage, treatment, and patient circumstances.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-insurance-verification',
    dataDimensionIds: ['dw-data-insurance-plans', 'dw-data-patient-records', 'dw-data-treatment-codes'],
    userProfileDimensionId: 'dw-up-insurance-coordinator',
    patternType: 'reasoning',
    exampleQuestions: [
      'How should we approach this coverage issue with the insurance?',
      'What is our negotiation strategy for this denial?'
    ],
    ambiguityNotes: 'Negotiation depends on insurance company policies, contractual terms, and appeal outcomes',
    confidence: 50
  },
  {
    id: 'dental-pat-24',
    name: 'Patient Cancellation Risk Prediction',
    description: 'Predict likelihood of patient cancellation based on history and booking characteristics.',
    tier: 'fuzzy',
    taskDimensionId: 'dw-task-appointment-scheduling',
    dataDimensionIds: ['dw-data-patient-records'],
    userProfileDimensionId: 'dw-up-office-staff',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is this patient likely to cancel their appointment?',
      'What is the cancellation risk for this booking?'
    ],
    ambiguityNotes: 'Cancellation prediction depends on behavioral patterns with incomplete historical data',
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
