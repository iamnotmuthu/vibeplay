import type {
  InstructionStep,
  DataSource,
  UserProfile,
  AgentTool,
  AgentTask,
  Guardrail,
  AgentOutput,
} from '@/store/agentTypes'
import { getInstructionData } from './instructionData'

// ─── Context Definition Payload ────────────────────────────────────────
// Combines instructions (from instructionData.ts), business/technical summaries,
// data sources, user profiles, tools, and tasks for Step 2 of the agent playground.

export interface ContextDefinitionPayload {
  instructions: InstructionStep[]
  businessSummary: string
  technicalSummary: string
  dataSources: DataSource[]
  userProfiles: UserProfile[]
  tools: AgentTool[]
  tasks: AgentTask[]
  guardrails: Guardrail[]
  agentOutputs: AgentOutput[]
}

// ─── FAQ / Knowledge Agent ─────────────────────────────────────────────

const FAQ_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('faq-knowledge')?.steps || [],
  businessSummary:
    'Eight steps covering order intake, status lookup, issue diagnosis, resolution routing, and confirmation. Designed to resolve ~70% of order issues autonomously (tracking, simple refunds, return labels) — escalates carrier investigations, high-value refunds, and fraud cases to tier-2. Target: median resolution time under 5 minutes.',
  technicalSummary:
    'Instruction graph with real-time order lookup (API call), carrier tracking aggregation (multi-carrier API), and issue-type classifier that branches into refund/reship/return workflows. Confidence threshold gate at step 4: autonomous ≥0.85, supervised 0.70-0.84, escalate <0.70. Stateful: session TTL 30 minutes. Estimated p95 latency: 2.5s for simple tracking, 4.8s with carrier investigation.',
  dataSources: [
    {
      id: 'orders-database-api',
      name: 'Orders_Database.api',
      format: 'REST API',
      size: '45M records',
      contentTypes: ['live-order-data', 'shipment-history', 'refund-status'],
      updateFrequency: 'real-time',
    },
    {
      id: 'carrier-tracking-api',
      name: 'Carrier_Tracking.api',
      format: 'REST API (4 carriers: UPS, FedEx, DHL, regional)',
      size: 'Dynamic feed',
      contentTypes: ['tracking-events', 'delivery-eta', 'shipment-status'],
      updateFrequency: 'every-30-minutes',
    },
    {
      id: 'return-policy-pdf',
      name: 'Return_Policy_v3.pdf',
      format: 'PDF',
      size: '120 KB',
      contentTypes: ['policy-text', 'tables'],
      updateFrequency: 'monthly',
    },
    {
      id: 'customer-history-db',
      name: 'Customer_History.db',
      format: 'Database API',
      size: 'Customer profiles + purchase history',
      contentTypes: ['customer-profile', 'return-rate', 'purchase-frequency'],
      updateFrequency: 'real-time',
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'system-user-faq',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: [
        'Monitor order resolution SLA metrics',
        'Flag fraudulent return patterns',
        'Sync carrier API status',
      ],
      isCore: true,
    },
    {
      id: 'business-user-faq',
      category: 'Business User (Customer Service Manager)',
      proficiency: 'medium',
      exampleQuestions: [
        'What percentage of orders resolve autonomously?',
        'Which carriers have the most delays?',
        'How many escalations per day?',
      ],
      isCore: true,
    },
    {
      id: 'end-user-faq',
      category: 'End User (Customer)',
      proficiency: 'low',
      exampleQuestions: [
        'Where is my order? (tracking)',
        'Can I get a refund?',
        'How do I return this item?',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'vip-customer',
      category: 'VIP/High-Value Customer',
      proficiency: 'low',
      exampleQuestions: [
        'Expedite my replacement',
        'Priority carrier coordination',
        'Account-specific return exception',
      ],
      isCore: false,
    },
    {
      id: 'repeat-returner',
      category: 'Repeat Returner (Flagged)',
      proficiency: 'low',
      exampleQuestions: [
        'Process another return',
        'Request refund',
        'Exchange item',
      ],
      isCore: false,
    },
    {
      id: 'first-time-buyer',
      category: 'First-Time Buyer',
      proficiency: 'very-low',
      exampleQuestions: [
        'Track my first order',
        'How do returns work?',
        'When will it arrive?',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'order-lookup-api',
      name: 'Order Lookup API',
      description: 'Query order database by order-id, tracking-number, or customer-id. Returns order-date, sku, quantity, payment-method, refund-status.',
      status: 'active',
      autoDetected: true,
      accesses: ['Orders_Database.api'],
    },
    {
      id: 'carrier-tracking-api',
      name: 'Carrier Tracking API',
      description: 'Multi-carrier aggregation. Returns tracking-number, carrier-name, delivery-eta, shipment-status, last-scan-location.',
      status: 'active',
      autoDetected: true,
      accesses: ['Carrier_Tracking.api'],
    },
    {
      id: 'refund-processor',
      name: 'Refund Processor',
      description: 'Process refunds up to $250 autonomously. Higher amounts require supervision. Returns refund-status, confirmation-number.',
      status: 'active',
      autoDetected: true,
      accesses: ['Orders_Database.api'],
    },
    {
      id: 'return-label-generator',
      name: 'Return Label Generator',
      description: 'Generate return shipping labels. Returns RMA-number, label-PDF, prepaid-carrier-link, return-address.',
      status: 'active',
      autoDetected: true,
      accesses: ['Return_Policy_v3.pdf'],
    },
  ],
  tasks: [
    {
      id: 'order-status-lookup',
      label: 'Order Status Lookup',
      description: 'Retrieve current order status and tracking information',
      systemSuggested: true,
      triggeredBy: 'Customer asks where their order is',
    },
    {
      id: 'delivery-tracking',
      label: 'Delivery Tracking',
      description: 'Query carrier APIs for real-time delivery ETA and last-known location',
      systemSuggested: true,
      triggeredBy: 'Order in transit, customer wants updates',
    },
    {
      id: 'refund-processing',
      label: 'Refund Processing',
      description: 'Process refunds autonomously (under $250) or route for approval (over $250)',
      systemSuggested: true,
      triggeredBy: 'Customer requests refund due to defect or wrong item',
    },
    {
      id: 'return-initiation',
      label: 'Return Initiation',
      description: 'Generate return label and RMA number. Validate against 30-day return window.',
      systemSuggested: true,
      triggeredBy: 'Customer initiates return within policy window',
    },
    {
      id: 'carrier-coordination',
      label: 'Carrier Coordination',
      description: 'Investigate missing tracking, request carrier investigation, escalate SLA breaches',
      systemSuggested: true,
      triggeredBy: 'Order tracking shows anomalies or is missing',
    },
  ],
  guardrails: [
    // Safety & Fraud
    {
      id: 'faq-safety-no-unauthorized-refunds',
      category: 'safety',
      label: 'No Unauthorized Refunds Above Threshold',
      description: 'Refunds over $250 must route to supervised review. Prevent autonomous payouts for high-value items.',
      enforcement: 'hard',
      threshold: '> $250',
    },
    {
      id: 'faq-safety-fraud-detection',
      category: 'safety',
      label: 'Fraud Detection for Serial Returners',
      description: 'Flag customers with >5 returns in 60 days or return-rate >30%. Route to fraud team.',
      enforcement: 'hard',
    },
    {
      id: 'faq-safety-pii-protection',
      category: 'safety',
      label: 'PII Protection',
      description: 'Never expose customer credit cards, addresses, or phone numbers in agent responses. Mask to last 4 digits.',
      enforcement: 'hard',
    },
    // Quality & SLA
    {
      id: 'faq-quality-carrier-sla',
      category: 'quality',
      label: 'Carrier SLA Enforcement',
      description: 'If delivery is >3 days overdue, escalate to carrier investigation automatically.',
      enforcement: 'hard',
      threshold: '3 days past ETA',
    },
    {
      id: 'faq-quality-confidence-gate',
      category: 'quality',
      label: 'Confidence Threshold',
      description: 'Autonomous action ≥0.85 confidence. Supervised review 0.70-0.84. Escalate <0.70.',
      enforcement: 'hard',
      threshold: '≥ 0.85 autonomous, < 0.70 escalate',
    },
    // Escalation
    {
      id: 'faq-escalation-high-value-refund',
      category: 'escalation',
      label: 'High-Value Refund Approval',
      description: 'All refunds $250+ require supervisor signature before processing.',
      enforcement: 'hard',
    },
    {
      id: 'faq-escalation-dispute',
      category: 'escalation',
      label: 'Customer Dispute Escalation',
      description: 'When customer contests tracking, carrier status, or refund decision, route to tier-2 support immediately.',
      enforcement: 'hard',
    },
    // Compliance
    {
      id: 'faq-compliance-return-window',
      category: 'compliance',
      label: '30-Day Return Window Enforcement',
      description: 'Block return requests after 30 days from order-date. Offer alternative resolutions.',
      enforcement: 'hard',
      threshold: '30 days from order-date',
    },
    {
      id: 'faq-compliance-audit-logging',
      category: 'compliance',
      label: 'Audit Logging for Financial Actions',
      description: 'Log all refund and return decisions with customer ID, amount, reason, and agent decision.',
      enforcement: 'hard',
    },
  ],
  agentOutputs: [
    { id: 'faq-out-order-status', label: 'Order Status Update', description: 'Current order status with tracking number, carrier, and delivery ETA', exampleOutput: 'Order #ORD-2026-089456 is in transit via FedEx. Tracking: 794019840293. Delivery ETA: March 18, 2026 by 6 PM. Last scan: Dallas, TX sorting facility.', triggeringTaskIds: ['order-status-lookup', 'delivery-tracking'], isCore: true },
    { id: 'faq-out-refund-confirmation', label: 'Refund Confirmation', description: 'Refund processed with confirmation number and expected credit timeline', exampleOutput: 'Refund approved for $89.99. Confirmation #REF-2026-445782. Credit will appear in your account in 3-5 business days.', triggeringTaskIds: ['refund-processing'], isCore: true },
    { id: 'faq-out-return-label', label: 'Return Label + Instructions', description: 'Return shipping label PDF, RMA number, and return address', exampleOutput: 'Return initiated. RMA #RMA-2026-334901. Label attached. Ship to: Returns Center, 2847 Logistics Dr, Memphis, TN 38114. Free prepaid label included.', triggeringTaskIds: ['return-initiation'], isCore: true },
    { id: 'faq-out-delivery-update', label: 'Delivery ETA Update', description: 'Real-time tracking update with last-known location and revised ETA', exampleOutput: 'Update: Package arrived in LA Distribution Center. New ETA: March 17 by 3 PM (moved up 1 day due to expedited routing).', triggeringTaskIds: ['delivery-tracking'], isCore: true },
    { id: 'faq-out-escalation-ticket', label: 'Escalation Ticket', description: 'Handoff to tier-2 support with full context', exampleOutput: 'Escalating to specialist team. Ticket #ESC-2026-117450. Issue: Missing tracking for 8 days. Order #ORD-2026-089456. Customer flagged for priority review.', triggeringTaskIds: ['carrier-coordination'], isCore: true },
    { id: 'faq-out-carrier-investigation', label: 'Carrier Investigation Request', description: 'Formal request to carrier for anomaly investigation', exampleOutput: 'Requesting carrier investigation. Tracking stopped for 5 days. FedEx ticket opened. Reference #CARR-2026-556234. ETA on investigation response: 24 hours.', triggeringTaskIds: ['carrier-coordination'], isCore: false },
    { id: 'faq-out-replacement-offer', label: 'Replacement Offer', description: 'Offer to ship replacement item', exampleOutput: 'Damaged goods confirmed. Shipping replacement item immediately via express. New tracking will be sent within 2 hours. Original return label provided.', triggeringTaskIds: ['refund-processing'], isCore: false },
    { id: 'faq-out-satisfaction-followup', label: 'Satisfaction Follow-up', description: 'Post-resolution satisfaction check', exampleOutput: 'Your issue has been resolved. How satisfied are you with the outcome? [Very Satisfied] [Satisfied] [Unsatisfied]', triggeringTaskIds: ['order-status-lookup', 'refund-processing'], isCore: false },
  ],
}

// ─── Loan Underwriting Automation Agent ───────────────────────────────────

const DOC_INTELLIGENCE_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('doc-intelligence')?.steps || [],
  businessSummary:
    'Eight steps covering application intake, document collection, financial data extraction, compliance validation, and underwriting decision. Handles purchase mortgages, refinances, HELOCs, and portfolio assessments. Standard applications route autonomously. Complex cases with regulatory flags or manual underwriting needs escalate to underwriter.',
  technicalSummary:
    'Instruction graph with application intake → document completeness check → financial extraction (income, DTI, LTV, credit score) → compliance validation (Regulation B, fair lending) → risk scoring → decision routing. Uses form-field parsing for applications, income-doc cross-reference for consistency, property-appraisal comparison for LTV. All decisions logged for HMDA audit trail. Estimated p95 latency: 6.4s per application, 12.8s with compliance validation.',
  dataSources: [
    {
      id: 'loan-application-pdf',
      name: 'Loan_Application_Form.pdf',
      format: 'PDF',
      size: '3.8 MB',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'credit-report-pdf',
      name: 'Credit_Report_Experian.pdf',
      format: 'PDF',
      size: '1.2 MB',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'income-verification-pdf',
      name: 'W2_Income_Verification.pdf',
      format: 'PDF',
      size: '850 KB',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'property-appraisal-pdf',
      name: 'Property_Appraisal_Report.pdf',
      format: 'PDF',
      size: '5.1 MB',
      contentTypes: ['text', 'tables'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'system-user-doc',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: [
        'Process batch of 50 loan applications',
        'Validate credit-score extraction accuracy',
        'Update underwriting decision thresholds',
      ],
      isCore: true,
    },
    {
      id: 'business-user-doc',
      category: 'Loan Officer',
      proficiency: 'medium',
      exampleQuestions: [
        'What is the approval rate for this portfolio?',
        'Which applications have missing income documentation?',
        'Show applications flagged for fair lending review',
      ],
      isCore: true,
    },
    {
      id: 'end-user-doc',
      category: 'Borrower',
      proficiency: 'low',
      exampleQuestions: [
        'Upload my loan application documents',
        'Check my application status',
        'Request underwriter review',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'auditor',
      category: 'Compliance Auditor',
      proficiency: 'high',
      exampleQuestions: [
        'Verify all applications for fair lending compliance',
        'Review adverse-action notices for accuracy',
        'Generate HMDA reporting audit trail',
      ],
      isCore: false,
    },
    {
      id: 'analyst',
      category: 'Risk Analyst',
      proficiency: 'medium',
      exampleQuestions: [
        'Build loss-severity analysis by loan-type',
        'Identify missing appraisal or employment data',
        'Track default-prediction scores by cohort',
      ],
      isCore: false,
    },
    {
      id: 'procurement',
      category: 'Underwriter',
      proficiency: 'high',
      exampleQuestions: [
        'Review application with manual underwriting flag',
        'Issue conditional approval with required docs',
        'Generate adverse-action notice with specific reasons',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'pdf-parser',
      name: 'PDF Parser',
      description: 'Extract text and form fields from loan application PDFs',
      status: 'active',
      autoDetected: true,
      accesses: ['Loan_Application_Form.pdf'],
    },
    {
      id: 'credit-api',
      name: 'Credit Bureau API',
      description: 'Pull credit reports from Equifax/Experian/TransUnion',
      status: 'active',
      autoDetected: true,
      accesses: ['Credit_Report_Experian.pdf'],
    },
    {
      id: 'income-validator',
      name: 'Income Validator',
      description: 'Cross-reference W-2, paystubs, tax returns, and bank statements',
      status: 'active',
      autoDetected: true,
      accesses: ['W2_Income_Verification.pdf'],
    },
    {
      id: 'appraisal-analyzer',
      name: 'Appraisal Analyzer',
      description: 'Extract property value, condition, comparables, and calculate LTV',
      status: 'active',
      autoDetected: true,
      accesses: ['Property_Appraisal_Report.pdf'],
    },
  ],
  tasks: [
    {
      id: 'eligibility-screening',
      label: 'Eligibility Screening',
      description: 'Verify applicant meets basic loan criteria (credit, income, collateral)',
      systemSuggested: true,
      triggeredBy: 'Application documents received',
    },
    {
      id: 'document-verification',
      label: 'Document Verification',
      description: 'Validate all required documents are present and legible',
      systemSuggested: true,
      triggeredBy: 'Application intake completes',
    },
    {
      id: 'risk-scoring',
      label: 'Risk Scoring',
      description: 'Calculate credit risk, fraud risk, and default probability',
      systemSuggested: true,
      triggeredBy: 'Financial data extraction completes',
    },
  ],
  guardrails: [
    {
      id: 'doci-safety-no-autonomous-approval',
      category: 'safety',
      label: 'No Autonomous Final Approval',
      description: 'Never issue final approval without underwriter sign-off. Agent can only recommend conditional approval or denial.',
      enforcement: 'hard',
    },
    {
      id: 'doci-safety-pii-protection',
      category: 'safety',
      label: 'PII and Financial Data Protection',
      description: 'SSN, financial accounts, and sensitive income data must be encrypted in transit and masked in reports.',
      enforcement: 'hard',
    },
    {
      id: 'doci-quality-income-consistency',
      category: 'quality',
      label: 'Income Cross-Reference Validation',
      description: 'Income declared in application must be verified against W-2, paystubs, and tax returns within 10% variance.',
      enforcement: 'hard',
      threshold: '≥ 90% consistency across documents',
    },
    {
      id: 'doci-quality-dti-calculation',
      category: 'quality',
      label: 'DTI Calculation Accuracy',
      description: 'Debt-to-income ratio must be calculated from verified income and all documented liabilities.',
      enforcement: 'hard',
    },
    {
      id: 'doci-escalation-fair-lending',
      category: 'escalation',
      label: 'Fair Lending Compliance Check',
      description: 'Flag applications for Regulation B (ECOA) review if decision differs from underwriting guidelines or if protected class is detected.',
      enforcement: 'hard',
      threshold: 'Any deviation from policy or protected-class indicator',
    },
    {
      id: 'doci-escalation-manual-underwriting',
      category: 'escalation',
      label: 'Manual Underwriting Flag',
      description: 'Complex income (self-employed, commission), non-traditional credit, or unusual property types escalate to underwriter.',
      enforcement: 'hard',
      threshold: 'Non-standard loan profile detected',
    },
    {
      id: 'doci-compliance-hmda-audit-trail',
      category: 'compliance',
      label: 'HMDA Audit Trail',
      description: 'All applications, decisions, and adverse actions logged for annual HMDA reporting. Include applicant demographics, loan amount, decision, rationale.',
      enforcement: 'hard',
    },
    {
      id: 'doci-compliance-adverse-action-notice',
      category: 'compliance',
      label: 'Adverse Action Notice Generation',
      description: 'If denial or conditional approval issued, generate adverse-action notice with specific reasons per FCRA requirements.',
      enforcement: 'hard',
    },
  ],
  agentOutputs: [
    { id: 'doci-out-eligibility', label: 'Eligibility Decision', description: 'Approved, Conditional, or Denied based on underwriting guidelines', exampleOutput: 'Eligible for Approval — Credit score 720, DTI 38%, LTV 80%, income verified. Conditional: Appraisal within range, employment verified.', triggeringTaskIds: ['eligibility-screening'], isCore: true },
    { id: 'doci-out-risk-score', label: 'Risk Assessment', description: 'Credit risk score, fraud indicator, and default probability', exampleOutput: 'Credit Risk: 65/100 (Acceptable) | Fraud Risk: Low | Default Probability: 2.3% | Recommendation: Standard Approval', triggeringTaskIds: ['risk-scoring'], isCore: true },
    { id: 'doci-out-conditions', label: 'Conditions List', description: 'Required conditions for approval (verification, appraisal, income, employment)', exampleOutput: '1. Verify current employment with employer | 2. Obtain updated appraisal | 3. Provide 2 months bank statements | 4. Verify no new debt', triggeringTaskIds: ['eligibility-screening'], isCore: true },
    { id: 'doci-out-adverse-action', label: 'Adverse Action Notice', description: 'Specific reasons for denial or conditional approval per FCRA', exampleOutput: 'Application Conditional Pending: DTI exceeds guideline (42% vs. 40% max). Credit derogatory mark within 24 months. Resolve and resubmit.', triggeringTaskIds: ['eligibility-screening'], isCore: true },
    { id: 'doci-out-underwriting-summary', label: 'Underwriting Summary', description: 'Complete loan profile with all extracted data and decision rationale', exampleOutput: 'Loan: Purchase | Amount: $350K | Property: Single-Family | Applicant Income: $95K | DTI: 38% | Credit: 720 | LTV: 79% | Decision: Conditional', triggeringTaskIds: ['risk-scoring'], isCore: false },
    { id: 'doci-out-document-checklist', label: 'Document Checklist', description: 'Status of all required documents with missing items flagged', exampleOutput: '✓ Application | ✓ Credit Report | ✓ W-2 (2023, 2024) | ✓ Pay stubs | ✓ Appraisal | ✗ Bank Statements | ✗ Employment Verification', triggeringTaskIds: ['document-verification'], isCore: false },
  ],
}

// ─── Research & Comparison Agent ───────────────────────────────────────

const RESEARCH_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('research-comparison')?.steps || [],
  businessSummary:
    'Eight steps covering insurance risk assessment, property inspection analysis, claims history review, risk-score calculation, premium estimation, coverage recommendation, regulatory compliance check, and underwriter routing. Processes property submissions with risk data from inspection reports, claims database, and actuarial tables. All coverage recommendations and binding decisions require human underwriter approval — no autonomous policy binding.',
  technicalSummary:
    'Instruction graph with property data validation, claims history aggregation, actuarial model application, and coverage recommendation synthesis. Risk-score calculation applies base-rate × loss-ratio × trend-factor with credibility-weighting. Regulatory compliance check validates state-specific coverage minimums. Escalation path for catastrophe exposure or multi-line policies. Estimated p95 latency: 4s standard assessment, 15s with complex underwriting.',
  dataSources: [
    {
      id: 'research-property-inspection',
      name: 'Property_Inspection_Report.pdf',
      format: 'PDF',
      size: '6.2 MB',
      contentTypes: ['tables', 'text'],
    },
    {
      id: 'research-claims-history',
      name: 'Claims_History_Export.csv',
      format: 'CSV',
      size: '2.1 MB',
      contentTypes: ['tables'],
    },
    {
      id: 'research-actuarial-tables',
      name: 'Actuarial_Tables_2025.xlsx',
      format: 'Excel',
      size: '1.8 MB',
      contentTypes: ['tables', 'structured-data'],
    },
    {
      id: 'research-regulatory-coverage',
      name: 'State_Coverage_Requirements.pdf',
      format: 'PDF',
      size: '890 KB',
      contentTypes: ['text'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'system-user-research',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: [
        'Batch process 200 underwriting submissions',
        'Update actuarial tables quarterly',
        'Validate risk-score model calibration',
      ],
      isCore: true,
    },
    {
      id: 'business-user-research',
      category: 'Underwriter',
      proficiency: 'medium',
      exampleQuestions: [
        'What is the recommended coverage for this property?',
        'How does this application compare to similar properties?',
        'What premium should we estimate for this risk?',
      ],
      isCore: true,
    },
    {
      id: 'end-user-research',
      category: 'Broker/Agent',
      proficiency: 'low',
      exampleQuestions: [
        'Submit application for property underwriting',
        'What coverage options are available?',
        'Why was this application escalated?',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'actuary',
      category: 'Actuary',
      proficiency: 'high',
      exampleQuestions: [
        'Validate risk model outputs against historical data',
        'Review loss-ratio trends by class',
        'Adjust credibility-weights for sparse data',
      ],
      isCore: false,
    },
    {
      id: 'claims-adjuster',
      category: 'Claims Adjuster',
      proficiency: 'medium',
      exampleQuestions: [
        'What is the loss history for this property?',
        'How do recent claims affect renewal recommendations?',
        'Review claims frequency and severity trends',
      ],
      isCore: false,
    },
    {
      id: 'compliance-officer',
      category: 'Compliance Officer',
      proficiency: 'medium',
      exampleQuestions: [
        'Verify regulatory compliance for this state',
        'Check for anti-discrimination violations',
        'Audit underwriting decisions for fair lending',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'property-data-api',
      name: 'Property Data API',
      description: 'Extract property attributes from inspection reports',
      status: 'active',
      autoDetected: true,
      accesses: ['Property_Inspection_Report.pdf'],
    },
    {
      id: 'claims-database-query',
      name: 'Claims Database Query',
      description: 'Query claims history and calculate loss-ratio',
      status: 'active',
      autoDetected: true,
      accesses: ['Claims_History_Export.csv'],
    },
    {
      id: 'risk-model-engine',
      name: 'Risk Model Engine',
      description: 'Apply actuarial models to compute risk-score and premium',
      status: 'active',
      autoDetected: true,
      accesses: ['Actuarial_Tables_2025.xlsx'],
    },
    {
      id: 'coverage-calculator',
      name: 'Coverage Calculator',
      description: 'Generate coverage recommendations and compare options',
      status: 'active',
      autoDetected: true,
      accesses: ['State_Coverage_Requirements.pdf'],
    },
  ],
  tasks: [
    {
      id: 'property-risk-assessment',
      label: 'Property Risk Assessment',
      description: 'Evaluate property characteristics and compute base risk-score',
      systemSuggested: true,
      triggeredBy: 'Inspection report received',
    },
    {
      id: 'claims-analysis',
      label: 'Claims History Analysis',
      description: 'Aggregate loss history and calculate claims-frequency',
      systemSuggested: true,
      triggeredBy: 'Property assessment completes',
    },
    {
      id: 'premium-calculation',
      label: 'Premium Calculation',
      description: 'Apply actuarial models to estimate premium',
      systemSuggested: true,
      triggeredBy: 'Risk-score and claims analysis complete',
    },
    {
      id: 'coverage-recommendation',
      label: 'Coverage Recommendation',
      description: 'Generate ranked coverage options with alternatives',
      systemSuggested: true,
      triggeredBy: 'Premium calculation completes',
    },
    {
      id: 'regulatory-compliance-check',
      label: 'Regulatory Compliance Check',
      description: 'Verify state-specific coverage minimums and requirements',
      systemSuggested: true,
      triggeredBy: 'Coverage options generated',
    },
  ],
  guardrails: [
    {
      id: 'research-safety-no-autonomous-binding',
      category: 'safety',
      label: 'No Autonomous Policy Binding',
      description: 'Agent cannot autonomously bind coverage. All coverage recommendations and policy issuance require explicit underwriter approval.',
      enforcement: 'hard',
    },
    {
      id: 'research-safety-model-validation',
      category: 'safety',
      label: 'Actuarial Model Validation',
      description: 'Risk-score calculations must be validated by qualified actuary before use. Model drift detection and retraining required annually.',
      enforcement: 'hard',
    },
    {
      id: 'research-quality-state-compliance',
      category: 'quality',
      label: 'State Regulatory Compliance',
      description: 'All coverage recommendations must satisfy state-specific minimum coverage requirements. Flag non-compliant options for underwriter review.',
      enforcement: 'hard',
      threshold: 'All state minimums met',
    },
    {
      id: 'research-safety-anti-discrimination',
      category: 'safety',
      label: 'Anti-Discrimination in Underwriting',
      description: 'Risk-score calculation excludes protected characteristics (age, race, gender, ethnicity). Monitor for disparate impact through model fairness audits.',
      enforcement: 'hard',
    },
    {
      id: 'research-escalation-catastrophe-exposure',
      category: 'escalation',
      label: 'Catastrophe Exposure Alert',
      description: 'Properties in high-risk zones (hurricane, wildfire, earthquake) or with reinsurance-threshold breaches escalate to underwriter and claims team.',
      enforcement: 'hard',
    },
    {
      id: 'research-escalation-complex-multiline',
      category: 'escalation',
      label: 'Complex Multi-Line Escalation',
      description: 'Multi-line or bundled policies with interdependent coverage escalate to senior underwriter for holistic risk evaluation.',
      enforcement: 'hard',
    },
    {
      id: 'research-compliance-audit-trail',
      category: 'compliance',
      label: 'Audit Trail & Documentation',
      description: 'All risk-score inputs, model versions, assumptions, and underwriting decisions logged for regulatory examination and complaint handling.',
      enforcement: 'hard',
    },
  ],
  agentOutputs: [
    { id: 'research-out-risk-score', label: 'Risk Assessment Score', description: 'Actuarial risk-score (0-100) based on property and claims data', exampleOutput: 'Risk-Score: 62/100 (Acceptable) | Base-Rate: $0.85 per $100 | Loss-Ratio: 1.08 | Trend-Factor: 1.05 | Construction-Class: 2 | Year-Built: 2015', triggeringTaskIds: ['property-risk-assessment'], isCore: true },
    { id: 'research-out-premium-estimate', label: 'Premium Estimate', description: 'Annual premium projection with rating factors applied', exampleOutput: 'Annual Premium: $1,245 | Coverage Limit: $500K | Deductible: $1K | Base Premium: $1,100 | Surcharges: +$145 (high-value area) | Discounts: -$0 (no eligible discounts)', triggeringTaskIds: ['premium-calculation'], isCore: true },
    { id: 'research-out-coverage-recommendation', label: 'Coverage Recommendation', description: 'Ranked coverage options with alternatives and rationale', exampleOutput: 'RECOMMENDED: $500K Dwelling / $100K Personal Liability / $2.5K Medical | ALTERNATIVE 1: $750K Dwelling (premium +$185) for high-value properties | ALTERNATIVE 2: $400K Dwelling (premium -$120) for cost-conscious buyers', triggeringTaskIds: ['coverage-recommendation'], isCore: true },
    { id: 'research-out-loss-projection', label: 'Loss Projection', description: 'Expected annual loss analysis and frequency estimation', exampleOutput: 'Expected Annual Loss: $1,485 | Claims-Frequency: 0.18/year | Average Claim: $8,250 | Loss-Ratio: 1.19 | Trend: Increasing (from 1.08 in prior year)', triggeringTaskIds: ['claims-analysis'], isCore: true },
    { id: 'research-out-compliance-checklist', label: 'Compliance Checklist', description: 'State regulatory requirements verification and status', exampleOutput: 'CA State Requirements: ✓ Min Dwelling $250K (Applied: $500K) | ✓ Min Liability $100K (Applied: $100K) | ✓ Surplus-Lines Notification Required | ✗ Catastrophe Bond Covenant (Manual Review Needed)', triggeringTaskIds: ['regulatory-compliance-check'], isCore: true },
    { id: 'research-out-underwriting-summary', label: 'Underwriting Summary', description: 'Complete risk profile and decision rationale for underwriter', exampleOutput: 'Property: 2,400 sqft wood-frame residence, built 2015, coastal flood zone. Risk-Score: 62/100 Acceptable. Loss-History: 1 water claim ($3,500) in 2020, no recent claims. Recommendation: APPROVE with standard underwriting, recommend flood rider for compliance.', triggeringTaskIds: ['property-risk-assessment'], isCore: false },
  ],
}

// ─── Care Coordination Agent ────────────────────────────────────────────

const DENTAL_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('decision-workflow')?.steps || [],
  businessSummary:
    'Nine steps covering patient inquiry intake, emergency triage, insurance verification, referral management, appointment scheduling, care coordination, and follow-up management. Handles appointment and eligibility queries autonomously (~65% of interactions). Clinical decisions and referrals always route to providers — zero autonomous diagnosis or prescribing. Emergency classification in < 5 seconds.',
  technicalSummary:
    'Multi-branch instruction graph with clinical decision paths, HIPAA-compliant data handling (AES-256 at rest, TLS 1.3 in transit), and mandatory escalation for clinical judgment calls. Three parallel execution lanes: administrative (autonomous), clinical-adjacent (supervised), clinical (escalation-only). All PHI access logged to immutable audit trail. HL7-FHIR interoperability across providers. Estimated p95 latency: 2.2s admin, 8.8s clinical-adjacent.',
  dataSources: [
    {
      id: 'patient-ehr',
      name: 'Patient_EHR_Export.hl7',
      format: 'HL7-FHIR',
      size: '156 MB',
      contentTypes: ['text', 'structured'],
    },
    {
      id: 'provider-network',
      name: 'Provider_Network.api',
      format: 'REST API',
      size: 'Live',
      contentTypes: ['structured'],
    },
    {
      id: 'insurance-api',
      name: 'Insurance_Eligibility.api',
      format: 'REST API',
      size: 'Live',
      contentTypes: ['structured'],
    },
    {
      id: 'clinical-guidelines',
      name: 'Clinical_Guidelines_v12.pdf',
      format: 'PDF',
      size: '3.4 MB',
      contentTypes: ['text'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'patient-user',
      category: 'Patient',
      proficiency: 'low',
      exampleQuestions: [
        'What times are appointments available with specialists?',
        'Does my insurance cover this referral?',
        'What is my deductible and copay?',
      ],
      isCore: true,
    },
    {
      id: 'care-coordinator',
      category: 'Care Coordinator',
      proficiency: 'high',
      exampleQuestions: [
        'Verify insurance eligibility for this patient',
        'Initiate referral to cardiology',
        'Coordinate discharge follow-up across providers',
      ],
      isCore: true,
    },
    {
      id: 'system-user-ehr',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: [
        'Update emergency escalation rules in EHR',
        'Monitor HIPAA audit logs and compliance',
        'Recalibrate clinical triage thresholds',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'insurance-coordinator',
      category: 'Insurance Coordinator',
      proficiency: 'high',
      exampleQuestions: [
        'Verify patient coverage before referral',
        'Submit prior authorization requests',
        'Dispute denied insurance claims',
      ],
      isCore: false,
    },
    {
      id: 'physician',
      category: 'Physician',
      proficiency: 'high',
      exampleQuestions: [
        'Review clinical escalations and triage decisions',
        'Approve referral recommendations',
        'Access complete patient medical history',
      ],
      isCore: false,
    },
    {
      id: 'nurse',
      category: 'Nurse',
      proficiency: 'medium',
      exampleQuestions: [
        'Handle post-visit follow-up coordination',
        'Triage emergency symptoms and vital signs',
        'Confirm medication reconciliation',
      ],
      isCore: false,
    },
    {
      id: 'admin-staff',
      category: 'Administrative Staff',
      proficiency: 'medium',
      exampleQuestions: [
        'Schedule appointments across provider network',
        'Collect patient insurance information',
        'Send appointment confirmations and reminders',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'ehr-connector',
      name: 'EHR Connector (HL7-FHIR)',
      description: 'Access patient EHR data including medications, allergies, conditions, care plans, and clinical notes',
      status: 'active',
      autoDetected: true,
      accesses: ['patient-ehr'],
    },
    {
      id: 'insurance-api',
      name: 'Insurance Verification API',
      description: 'Real-time eligibility checks, coverage verification, and prior authorization lookup',
      status: 'active',
      autoDetected: true,
      accesses: ['insurance-api'],
    },
    {
      id: 'scheduling-engine',
      name: 'Scheduling Engine',
      description: 'Cross-provider appointment booking, availability lookup, and confirmation workflows',
      status: 'active',
      autoDetected: true,
      accesses: ['provider-network'],
    },
    {
      id: 'referral-router',
      name: 'Referral Router',
      description: 'Specialty matching, provider network routing, and referral initiation',
      status: 'active',
      autoDetected: true,
      accesses: ['provider-network', 'clinical-guidelines'],
    },
  ],
  tasks: [
    {
      id: 'appointment-scheduling',
      label: 'Appointment Scheduling',
      description: 'Schedule, reschedule, and manage patient appointments across provider network',
      systemSuggested: true,
      triggeredBy: 'Patient requests appointment or referral scheduling',
    },
    {
      id: 'insurance-verification',
      label: 'Insurance Verification',
      description: 'Verify patient coverage, eligibility, and prior authorization requirements',
      systemSuggested: true,
      triggeredBy: 'New visit or referral initiated',
    },
    {
      id: 'referral-management',
      label: 'Referral Management',
      description: 'Route patients to appropriate specialists and manage referral workflows',
      systemSuggested: true,
      triggeredBy: 'Provider initiates specialist referral',
    },
    {
      id: 'emergency-triage',
      label: 'Emergency Triage',
      description: 'Classify patient acuity and route to appropriate emergency level',
      systemSuggested: true,
      triggeredBy: 'Patient reports emergency symptoms',
    },
    {
      id: 'follow-up-coordination',
      label: 'Follow-up Coordination',
      description: 'Manage post-visit and post-procedure follow-ups across providers',
      systemSuggested: true,
      triggeredBy: 'Patient discharged or visit completed',
    },
  ],
  guardrails: [
    {
      id: 'cc-safety-no-diagnosis',
      category: 'safety',
      label: 'Zero Autonomous Clinical Diagnosis or Prescribing',
      description: 'Never diagnose conditions, recommend treatment plans, or prescribe medications. All clinical decisions route to licensed physicians.',
      enforcement: 'hard',
    },
    {
      id: 'cc-safety-emergency-classification',
      category: 'safety',
      label: 'Emergency Fast-Track',
      description: 'Classify and escalate potential medical emergencies within 5 seconds. Route to emergency department or on-call physician immediately.',
      enforcement: 'hard',
      threshold: '< 5 seconds classification time',
    },
    {
      id: 'cc-quality-insurance-verification',
      category: 'quality',
      label: 'Insurance Verification Accuracy',
      description: 'Coverage information must include disclaimer that benefits are subject to final verification at time of service.',
      enforcement: 'soft',
    },
    {
      id: 'cc-quality-appointment-confirmation',
      category: 'quality',
      label: 'Appointment Confirmation Required',
      description: 'All scheduled appointments must send confirmation to patient and providers within 60 seconds.',
      enforcement: 'hard',
      threshold: '< 60 seconds confirmation delivery',
    },
    {
      id: 'cc-escalation-clinical-decisions',
      category: 'escalation',
      label: 'Clinical Decision Routing',
      description: 'Any question involving symptoms, diagnosis, medication, or treatment recommendations routes immediately to appropriate physician.',
      enforcement: 'hard',
    },
    {
      id: 'cc-escalation-urgent-symptoms',
      category: 'escalation',
      label: 'Urgent Symptom Detection',
      description: 'Detect acute symptoms or clinical deterioration and escalate to on-call provider with priority flag.',
      enforcement: 'hard',
    },
    {
      id: 'cc-compliance-hipaa',
      category: 'compliance',
      label: 'HIPAA Compliance',
      description: 'All PHI access logged to immutable audit trail. AES-256 encryption at rest, TLS 1.3 in transit. Full HL7-FHIR interoperability.',
      enforcement: 'hard',
    },
    {
      id: 'cc-compliance-consent-verification',
      category: 'compliance',
      label: 'Patient Consent Verification',
      description: 'Verify patient identity and informed consent before disclosing any health information or scheduling referrals.',
      enforcement: 'hard',
    },
    {
      id: 'cc-compliance-phi-minimization',
      category: 'compliance',
      label: 'PHI Minimization',
      description: 'Share only the minimum necessary PHI between providers. Verify patient authorization for each information exchange.',
      enforcement: 'hard',
    },
  ],
  agentOutputs: [
    { id: 'cc-out-appointment-confirmation', label: 'Appointment Confirmation', description: 'Confirmation of scheduled appointment with provider details and instructions', exampleOutput: 'Confirmed: Tuesday, April 2 at 10:00 AM with Dr. James Patel (Cardiology). Location: Heart Health Center, 789 Main St, Suite 500. Bring insurance card and ID. Fasting required: no food/drink after midnight.', triggeringTaskIds: ['appointment-scheduling'], isCore: true },
    { id: 'cc-out-insurance-eligibility', label: 'Insurance Eligibility Result', description: 'Verification of coverage, copay, deductible, and authorization status', exampleOutput: 'Coverage verified: Blue Cross Blue Shield Premium. Copay: $40. Deductible: $250 remaining. Prior auth required: Yes. Your cardiologist is in-network.', triggeringTaskIds: ['insurance-verification'], isCore: true },
    { id: 'cc-out-referral-request', label: 'Referral Request', description: 'Structured referral with clinical context and authorization status', exampleOutput: 'Referral to Cardiology initiated for Dr. Jessica Chen. Diagnosis: Hypertension (I10). Prior auth approved. Referral sent to provider. Expected first appointment within 10 business days.', triggeringTaskIds: ['referral-management'], isCore: true },
    { id: 'cc-out-triage-assessment', label: 'Triage Assessment', description: 'Emergency severity classification and recommended action', exampleOutput: 'Triage Level 2 (Urgent): Patient reports chest discomfort and shortness of breath. Recommend immediate ED evaluation. Contacting on-call cardiologist. EMS standby recommended if symptoms worsen.', triggeringTaskIds: ['emergency-triage'], isCore: true },
    { id: 'cc-out-care-plan-summary', label: 'Care Plan Summary', description: 'Post-visit care instructions and follow-up schedule', exampleOutput: 'Post-procedure care: Take blood pressure medication as prescribed. Light activity only for 5 days. Follow-up visit scheduled: April 15, 2025. Call if chest pain, swelling, or fever develop. Medication reconciliation confirmed.', triggeringTaskIds: ['follow-up-coordination'], isCore: true },
    { id: 'cc-out-followup-reminder', label: 'Follow-up Reminder', description: 'Automated reminder for scheduled follow-up appointments and care coordination tasks', exampleOutput: 'Reminder: Your post-cardiac visit follow-up is scheduled for April 15 at 2:00 PM with Dr. Chen. Bring lab results from your primary care visit. Insurance pre-verified. Reply CONFIRM to acknowledge.', triggeringTaskIds: ['follow-up-coordination'], isCore: false },
  ],
}

// ─── SaaS Copilot Agent ───────────────────────────────────────────────

const SAAS_COPILOT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('saas-copilot')?.steps || [],
  businessSummary:
    'Real-time customer health monitoring across 8+ engagement signals. Calculates health-score hourly, detects churn signals (usage drop, adoption plateau, support issues), and triggers retention actions (outreach campaigns, upsell suggestions, proactive support). Routes at-risk customers to account executives. Target: alert within 2 hours of churn-signal detection.',
  technicalSummary:
    'Health-score calculation pipeline with real-time signal detection. Ingests usage logs (real-time stream), support tickets (hourly), billing data (daily), computes weighted health formula (engagement 40%, adoption 30%, support 20%, billing 10%). Detect phase identifies anomalies using sliding-window baselines. Action routing uses score thresholds: >80 healthy, 50-80 at-risk (trigger nurture), <50 critical (escalate). Estimated p95 latency: health-score update within 1 hour, alert delivery within 30 minutes.',
  dataSources: [
    {
      id: 'usage-events',
      name: 'usage_events_stream.kafka',
      format: 'Kafka Stream',
      size: '2.3B events/day',
      contentTypes: ['event-stream'],
    },
    {
      id: 'health-scores',
      name: 'health_scores.db',
      format: 'Database',
      size: '4.1 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'support-tickets',
      name: 'support_tickets.db',
      format: 'Database',
      size: '1.8 MB',
      contentTypes: ['tables'],
    },
    {
      id: 'billing-data',
      name: 'subscriptions.db',
      format: 'Database',
      size: '2.2 MB',
      contentTypes: ['structured-data'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'customer-success-manager',
      category: 'Customer Success Manager',
      proficiency: 'high',
      exampleQuestions: [
        'Which customers are at churn risk?',
        'Show me health score trends for my accounts',
        'What retention actions are in progress?',
      ],
      isCore: true,
    },
    {
      id: 'account-executive',
      category: 'Account Executive',
      proficiency: 'medium',
      exampleQuestions: [
        'Identify expansion opportunities',
        'Which accounts have low engagement?',
        'Show me customers ready for upsell',
      ],
      isCore: true,
    },
    {
      id: 'product-manager',
      category: 'Product Manager',
      proficiency: 'high',
      exampleQuestions: [
        'Feature adoption metrics by segment',
        'Which features correlate with churn?',
        'Track onboarding completion rates',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'support-analyst',
      category: 'Support Analyst',
      proficiency: 'medium',
      exampleQuestions: [
        'Which customers have high support ticket volume?',
        'Identify customers with negative sentiment',
        'Prioritize support escalations by churn risk',
      ],
      isCore: false,
    },
    {
      id: 'system-admin',
      category: 'System Administrator',
      proficiency: 'high',
      exampleQuestions: [
        'Monitor health-score calculation pipeline',
        'Update churn-detection thresholds',
        'Audit retention action history',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'health-calculator',
      name: 'Health Score Calculator',
      description: 'Compute customer health scores using engagement, adoption, support, and billing metrics',
      status: 'active',
      autoDetected: true,
      accesses: ['usage_events_stream.kafka', 'health_scores.db', 'support_tickets.db', 'subscriptions.db'],
    },
    {
      id: 'anomaly-detector',
      name: 'Churn Signal Detector',
      description: 'Identify usage drop, adoption plateau, support spikes, and billing concerns',
      status: 'active',
      autoDetected: true,
      accesses: ['health_scores.db', 'usage_events_stream.kafka'],
    },
    {
      id: 'action-orchestrator',
      name: 'Retention Action Executor',
      description: 'Trigger outreach campaigns, upsell recommendations, and support escalations',
      status: 'active',
      autoDetected: true,
      accesses: ['health_scores.db'],
    },
  ],
  tasks: [
    {
      id: 'usage-pattern-analysis',
      label: 'Usage Pattern Analysis',
      description: 'Aggregate daily/weekly usage metrics and identify engagement trends',
      systemSuggested: true,
      triggeredBy: 'Hourly scheduled job',
    },
    {
      id: 'churn-signal-detection',
      label: 'Churn Signal Detection',
      description: 'Detect usage drop, adoption plateau, support spike, billing decline',
      systemSuggested: true,
      triggeredBy: 'Continuous monitoring',
    },
    {
      id: 'health-score-calculation',
      label: 'Health Score Calculation',
      description: 'Compute weighted health score from engagement, adoption, support, billing dimensions',
      systemSuggested: true,
      triggeredBy: 'Hourly scheduled job',
    },
    {
      id: 'retention-action-triggering',
      label: 'Retention Action Triggering',
      description: 'Execute outreach campaigns and upsell recommendations for at-risk accounts',
      systemSuggested: true,
      triggeredBy: 'Score threshold breach',
    },
    {
      id: 'segment-analysis',
      label: 'Segment Analysis',
      description: 'Group customers by risk level, industry, ARR, and engagement tier',
      systemSuggested: true,
      triggeredBy: 'Daily scheduled job',
    },
  ],
  guardrails: [
    {
      id: 'csm-safety-churn-score-accuracy',
      category: 'safety',
      label: 'Churn Score Accuracy Threshold',
      description: 'Do not trigger escalation for churn scores 40-60 (low confidence zone). Require human review for accuracy.',
      enforcement: 'hard',
      threshold: 'Score < 40 or > 60 for autonomous action',
    },
    {
      id: 'csm-safety-no-autonomous-outreach',
      category: 'safety',
      label: 'Outreach Requires Approval',
      description: 'Retention outreach campaigns to enterprise customers (>$50K ARR) require CSM review and approval.',
      enforcement: 'hard',
      threshold: 'ARR > $50K requires approval',
    },
    {
      id: 'csm-quality-health-score-completeness',
      category: 'quality',
      label: 'Health Score Data Completeness',
      description: 'Do not calculate health score if usage data is >24 hours stale. Flag and skip calculation.',
      enforcement: 'hard',
      threshold: 'Usage data freshness < 24 hours',
    },
    {
      id: 'csm-quality-signal-cross-validation',
      category: 'quality',
      label: 'Multi-Signal Validation',
      description: 'Confirm churn signal with >1 independent data source before escalating. Avoid single-metric false positives.',
      enforcement: 'hard',
    },
    {
      id: 'csm-escalation-high-arr-accounts',
      category: 'escalation',
      label: 'Enterprise Account Escalation',
      description: 'Escalate churn signals for customers with ARR >$100K directly to VP of CS.',
      enforcement: 'hard',
      threshold: 'ARR > $100K',
    },
    {
      id: 'csm-escalation-multi-signal-anomaly',
      category: 'escalation',
      label: 'Multi-Signal Anomaly Escalation',
      description: 'If >3 independent signals indicate churn (usage drop AND support spikes AND billing trend negative), escalate immediately.',
      enforcement: 'hard',
      threshold: '>3 concurrent signals',
    },
    {
      id: 'csm-compliance-retention-audit-log',
      category: 'compliance',
      label: 'Retention Action Audit Trail',
      description: 'Log all retention actions with timestamp, customer, CSM, action type, and outcome. Immutable record.',
      enforcement: 'hard',
    },
    {
      id: 'csm-compliance-data-privacy',
      category: 'compliance',
      label: 'Customer Data Privacy',
      description: 'Health scores are visible only to assigned CSM, AE, and CS leadership. No public export.',
      enforcement: 'hard',
    },
  ],
  agentOutputs: [
    { id: 'csm-out-health-score-report', label: 'Health Score Report', description: 'Customer health scores with dimension breakdowns and trend indicators', exampleOutput: 'Acme Corp (ARR: $85K): Health Score 52 (At-Risk). Engagement: 60%, Adoption: 48%, Support: 45%, Billing: Stable. Usage down 35% WoW. 3 support tickets (2 negative sentiment). Recommend outreach.', triggeringTaskIds: ['health-score-calculation'], isCore: true },
    { id: 'csm-out-churn-alert', label: 'Churn Risk Alert', description: 'High-confidence churn signal notification with recommended actions', exampleOutput: 'CHURN ALERT: TechCorp (ARR: $125K). Score: 35 (Critical). Signals: Usage drop 42% (vs baseline), Feature adoption 0% (new module launched), Support: 8 tickets in 7 days (negative sentiment). Action: Escalated to VP CS. Recommend immediate outreach.', triggeringTaskIds: ['churn-signal-detection'], isCore: true },
    { id: 'csm-out-retention-action-log', label: 'Retention Action Log', description: 'Record of retention campaigns and outreach executed', exampleOutput: 'Retention campaign initiated for 47 at-risk customers. Actions: Email outreach (47), Schedule CSM calls (23), Offer product training (12). Engagement tracking: 68% email open rate. Follow-up scheduled in 5 days.', triggeringTaskIds: ['retention-action-triggering'], isCore: true },
    { id: 'csm-out-segment-dashboard', label: 'Segment Analysis Dashboard', description: 'Customer segmentation by health, risk, and expansion potential', exampleOutput: 'Health Distribution: Healthy (68%), At-Risk (24%), Critical (8%). By ARR: Enterprise (avg score: 62), Mid-market (avg: 58), SMB (avg: 71). Expansion pool: 12 customers with positive growth signal and high health. Churn risk pool: 34 customers requiring intervention.', triggeringTaskIds: ['segment-analysis'], isCore: true },
    { id: 'csm-out-usage-trend', label: 'Usage Trend Analysis', description: 'Weekly usage metrics and engagement changes', exampleOutput: 'Week-over-week usage: +8% overall, -15% in finance segment. Daily active users: 2,340 (vs 2,510 last week). Feature adoption: File sharing +23%, Reporting -12%. Most at-risk feature: Custom exports (adoption 18%, down from 35%).', triggeringTaskIds: ['usage-pattern-analysis'], isCore: false },
    { id: 'csm-out-executive-summary', label: 'Executive Summary', description: 'High-level portfolio health and action items for leadership', exampleOutput: 'Portfolio health: 92% healthy, 6% at-risk, 2% critical. YTD churn rate: 1.8% (target: <2%). Net retention: 104%. At-risk mitigation in progress: 8 enterprise accounts. Next review: 2026-03-22.', triggeringTaskIds: ['health-score-calculation'], isCore: false },
  ],
}

// ─── Ops Agent ────────────────────────────────────────────────────────

const OPS_AGENT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('ops-agent')?.steps || [],
  businessSummary:
    'Real-time shipment disruption detection and automated response. Monitors tracking from 4 major carriers, detects delays >24hrs, automatically reroutes across carriers, updates customer ETAs, and rebalances warehouse allocation. Handles customs exceptions and escalates SLA-critical shipments. Target: reroute decision within 30 minutes of disruption detection.',
  technicalSummary:
    'Real-time disruption monitoring with carrier orchestration. Ingests tracking data from FedEx/UPS/DHL/regional carriers (30min-2hr freshness). Detect phase identifies exceptions: delivery delay >24hr, carrier congestion, customs-hold, last-mile failure. Reroute phase calculates cost-optimal alternative carrier and calls carrier API. Notify updates customer via SMS/email/in-app. Rebalance evaluates warehouse capacity and triggers inventory transfer. State machine: detecting → routing → notifying → rebalancing → complete. Checkpoint recovery for long operations. Health checks every 5 minutes. Estimated latency: detection <10min, reroute decision <30min, customer notification <1hr.',
  dataSources: [
    {
      id: 'carrier-tracking',
      name: 'carrier_tracking_api',
      format: 'REST API',
      size: '1.2B events/day',
      contentTypes: ['event-stream'],
    },
    {
      id: 'warehouse-inventory',
      name: 'warehouse_inventory.db',
      format: 'Database',
      size: '8.7 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'order-management',
      name: 'orders_and_shipments.db',
      format: 'Database',
      size: '15 MB',
      contentTypes: ['tables'],
    },
    {
      id: 'customer-notifications',
      name: 'notification_platform_api',
      format: 'REST API',
      size: '5.2 MB',
      contentTypes: ['structured-data'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'logistics-coordinator',
      category: 'Logistics Coordinator',
      proficiency: 'high',
      exampleQuestions: [
        'Which shipments have delays >24 hours?',
        'Reroute Acme Corp shipment to alternative carrier',
        'Check warehouse inventory in US-West DC',
      ],
      isCore: true,
    },
    {
      id: 'warehouse-manager',
      category: 'Warehouse Manager',
      proficiency: 'high',
      exampleQuestions: [
        'What is the current stock level for SKU-8834?',
        'Can we reallocate 50 units to East Coast?',
        'Show me DC capacity utilization',
      ],
      isCore: true,
    },
    {
      id: 'customer-ops',
      category: 'Customer Operations',
      proficiency: 'medium',
      exampleQuestions: [
        'Get updated ETA for customer shipment',
        'Send proactive notification about delay',
        'Which customers are affected by disruption?',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'supply-chain-analyst',
      category: 'Supply Chain Analyst',
      proficiency: 'high',
      exampleQuestions: [
        'Analyze carrier performance and cost trends',
        'Which carriers have highest SLA compliance?',
        'What is the cost impact of current reroutes?',
      ],
      isCore: false,
    },
    {
      id: 'customs-specialist',
      category: 'Customs Specialist',
      proficiency: 'high',
      exampleQuestions: [
        'Flag shipments with customs clearance issues',
        'What documentation is needed for this shipment?',
        'Coordinate with customs broker for exception',
      ],
      isCore: false,
    },
    {
      id: 'operations-director',
      category: 'Operations Director',
      proficiency: 'medium',
      exampleQuestions: [
        'What is current SLA compliance across carriers?',
        'Review cost trends for last month\'s reroutes',
        'Dashboard view of disruptions by region',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'disruption-detector',
      name: 'Disruption Detector',
      description: 'Monitor carrier tracking and identify delays, exceptions, and anomalies',
      status: 'active',
      autoDetected: true,
      accesses: ['carrier_tracking_api', 'orders_and_shipments.db'],
    },
    {
      id: 'carrier-router',
      name: 'Carrier Router',
      description: 'Calculate optimal carrier reroute and execute carrier API calls',
      status: 'active',
      autoDetected: true,
      accesses: ['carrier_tracking_api'],
    },
    {
      id: 'notification-manager',
      name: 'Notification Manager',
      description: 'Send SMS, email, and in-app notifications with delivery confirmation',
      status: 'active',
      autoDetected: true,
      accesses: ['customer_notifications_api'],
    },
    {
      id: 'warehouse-allocator',
      name: 'Warehouse Allocator',
      description: 'Rebalance inventory and coordinate warehouse transfers',
      status: 'active',
      autoDetected: true,
      accesses: ['job_queue.db', 'job_execution_logs.tar.gz'],
    },
  ],
  tasks: [
    {
      id: 'disruption-detection',
      label: 'Disruption Detection',
      description: 'Monitor carrier tracking and identify delays, exceptions, and customs holds',
      systemSuggested: true,
      triggeredBy: 'Real-time tracking data ingestion',
    },
    {
      id: 'carrier-rerouting',
      label: 'Carrier Rerouting',
      description: 'Evaluate alternative carriers and execute reroute via carrier API',
      systemSuggested: true,
      triggeredBy: 'Disruption detected',
    },
    {
      id: 'eta-recalculation',
      label: 'ETA Recalculation',
      description: 'Update delivery ETAs based on new carrier and routing',
      systemSuggested: true,
      triggeredBy: 'Carrier reroute executed',
    },
    {
      id: 'customer-notification',
      label: 'Customer Notification',
      description: 'Send proactive SMS, email, and in-app updates with new ETA',
      systemSuggested: true,
      triggeredBy: 'ETA recalculated',
    },
    {
      id: 'warehouse-coordination',
      label: 'Warehouse Coordination',
      description: 'Rebalance inventory across DCs and coordinate transfers',
      systemSuggested: true,
      triggeredBy: 'Capacity constraint detected',
    },
    {
      id: 'customs-exception-handling',
      label: 'Customs Exception Handling',
      description: 'Flag customs holds and route to specialist for coordination',
      systemSuggested: true,
      triggeredBy: 'Customs-hold detected',
    },
  ],
  guardrails: [
    {
      id: 'logistics-safety-low-confidence-hold',
      category: 'safety',
      label: 'Low Confidence Reroute Hold',
      description: 'Do not auto-reroute if cost impact exceeds $500 without logistics coordinator approval.',
      enforcement: 'hard',
      threshold: 'Cost delta > $500',
    },
    {
      id: 'logistics-safety-no-customs-auto-clear',
      category: 'safety',
      label: 'Customs Holds Cannot Auto-Clear',
      description: 'Customs-related delays must be escalated to customs specialist. Agent cannot resolve independently.',
      enforcement: 'hard',
    },
    {
      id: 'logistics-quality-eta-accuracy',
      category: 'quality',
      label: 'ETA Accuracy Threshold',
      description: 'New ETA must be validated against carrier schedule before sending to customer. Tolerate ±2 hour variance.',
      enforcement: 'hard',
      threshold: 'ETA variance < ±2 hours',
    },
    {
      id: 'logistics-quality-warehouse-capacity',
      category: 'quality',
      label: 'Warehouse Capacity Validation',
      description: 'Do not reallocate inventory if receiving warehouse is at >90% capacity.',
      enforcement: 'hard',
      threshold: 'Target capacity < 90%',
    },
    {
      id: 'logistics-escalation-sla-critical',
      category: 'escalation',
      label: 'SLA-Critical Shipment Escalation',
      description: 'Escalate to supply-chain analyst when shipment is within 12 hours of SLA deadline.',
      enforcement: 'hard',
      threshold: 'Hours to deadline < 12',
    },
    {
      id: 'logistics-escalation-multi-carrier-fail',
      category: 'escalation',
      label: 'Multi-Carrier Reroute Failure',
      description: 'If reroute fails with >2 carriers, escalate to logistics coordinator for manual intervention.',
      enforcement: 'hard',
      threshold: '>2 carrier failures',
    },
    {
      id: 'ops-compliance-change-management',
      category: 'compliance',
      label: 'Change Management Compliance',
      description: 'All migrations must have an approved change request ticket before execution. Ticket ID logged in audit trail.',
      enforcement: 'hard',
    },
    {
      id: 'ops-compliance-data-residency',
      category: 'compliance',
      label: 'Data Residency Enforcement',
      description: 'Data must not cross geographic boundaries during migration unless explicitly approved for cross-region transfer.',
      enforcement: 'hard',
    },
  ],
  agentOutputs: [
    { id: 'logistics-out-disruption-alert', label: 'Disruption Alert', description: 'Real-time notification of shipment disruption with recommended action', exampleOutput: 'DISRUPTION ALERT: Shipment SHP-284923 (Acme Corp, $5.2K ARR). Delay: +48hrs vs ETA. Reason: Carrier (FedEx) network congestion at Memphis hub. Recommended action: Reroute via UPS (cost delta: +$28). New ETA: 03/17 EOD. Escalation: High-value account, escalate to AE.', triggeringTaskIds: ['disruption-detection'], isCore: true },
    { id: 'logistics-out-reroute-confirmation', label: 'Reroute Confirmation', description: 'Confirmation of carrier reroute execution with cost and ETA impact', exampleOutput: 'Reroute successful: SHP-284923 transferred from FedEx to UPS. Cost delta: +$28. New carrier: UPS. New tracking: 1Z999AA10123456784. Updated ETA: 03/17/2026 5:00 PM EST (confirmed with carrier). Customer notification: Sent SMS + email with new tracking. Audit ID: AUD-382947.', triggeringTaskIds: ['carrier-rerouting'], isCore: true },
    { id: 'logistics-out-eta-update', label: 'ETA Update', description: 'Updated delivery ETA with reason for change', exampleOutput: 'ETA Updated: SHP-284923. Old: 03/16 2:30 PM → New: 03/17 5:00 PM EST. Reason: Carrier reroute (network congestion mitigation). Confidence: High (carrier confirmation). Customer notification: Sent 03/15 02:15 UTC.', triggeringTaskIds: ['eta-recalculation'], isCore: true },
    { id: 'logistics-out-warehouse-rebalance', label: 'Warehouse Rebalance', description: 'Inventory reallocation across distribution centers', exampleOutput: 'Rebalance executed: 150 units SKU-8834 transferred from US-West (95% capacity) to US-East (72% capacity). Transfer initiated: 03/15 10:00 UTC. ETA arrival: 03/17 02:00 UTC. Cost: $340. Fulfillment impact: 3 orders rerouted to US-East.', triggeringTaskIds: ['warehouse-coordination'], isCore: false },
    { id: 'logistics-out-customs-escalation', label: 'Customs Escalation', description: 'Flag for customs specialist with issue details', exampleOutput: 'Customs escalation: SHP-291847 (destination: Canada). Hold reason: Missing commercial invoice. Action: Escalated to customs-specialist@company.com. Documentation needed: Commercial invoice, BOL, packing list. Estimated hold duration: 2-4 hours once docs submitted.', triggeringTaskIds: ['customs-exception-handling'], isCore: false },
  ],
}

// ─── Coding Agent ────────────────────────────────────────────────────

const CODING_AGENT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('coding-agent')?.steps || [],
  businessSummary:
    'Incident response automation with real-time alert correlation and root-cause diagnosis. Detects outages, correlates logs and metrics to find root cause, executes remediation runbooks, and safely rolls back bad deployments. Handles routine incidents autonomously; escalates complex scenarios to on-call engineer. Target: alert-to-diagnosis <5 minutes, remediation execution <30 minutes.',
  technicalSummary:
    'Real-time incident response pipeline with alert ingestion, log correlation, service-dependency analysis, and automated runbook execution. Detects incidents via PagerDuty/OpsGenie webhooks. Correlates: alert patterns + log error spikes + metric anomalies + service topology. Calculates blast radius via dependency graph. Executes runbook steps: low-risk actions auto-execute (restart, scale), high-risk actions (rollback, traffic drain) require confidence + approval. State machine: detecting → diagnosing → remediating → recovering. Estimated latency: <10s alert ingestion, <5min root-cause diagnosis, <30min remediation.',
  dataSources: [
    {
      id: 'alerts',
      name: 'pagerduty_opsgenie_webhook',
      format: 'REST API',
      size: '2-5 alerts/incident',
      contentTypes: ['event-stream'],
    },
    {
      id: 'logs',
      name: 'log_aggregator_api',
      format: 'REST API',
      size: '5B logs/day',
      contentTypes: ['text'],
    },
    {
      id: 'metrics',
      name: 'datadog_splunk_api',
      format: 'REST API',
      size: '1M metrics/min',
      contentTypes: ['time-series'],
    },
    {
      id: 'service-topology',
      name: 'service_dependency_map.db',
      format: 'Database',
      size: '4.2 MB',
      contentTypes: ['structured-data'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'on-call-engineer',
      category: 'On-Call Engineer',
      proficiency: 'high',
      exampleQuestions: [
        'What is the root cause of the outage?',
        'Execute remediation runbook step 3',
        'Approve rollback of deployment',
      ],
      isCore: true,
    },
    {
      id: 'incident-commander',
      category: 'Incident Commander',
      proficiency: 'high',
      exampleQuestions: [
        'What is the incident status and ETA to resolution?',
        'Notify stakeholders of outage',
        'Coordinate cross-team escalation',
      ],
      isCore: true,
    },
    {
      id: 'sre-lead',
      category: 'SRE Lead',
      proficiency: 'high',
      exampleQuestions: [
        'What is the service dependency impact?',
        'Recommend rollback strategy',
        'Assess blast radius and customer impact',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'service-owner',
      category: 'Service Owner',
      proficiency: 'medium',
      exampleQuestions: [
        'Is my service affected by the incident?',
        'What caused the failure in my service?',
        'Do I need to take action?',
      ],
      isCore: false,
    },
    {
      id: 'devops-engineer-ir',
      category: 'DevOps Engineer',
      proficiency: 'high',
      exampleQuestions: [
        'Restart the impacted service',
        'Scale up instances to mitigate load',
        'Drain traffic from failed hosts',
      ],
      isCore: false,
    },
    {
      id: 'postmortem-lead',
      category: 'Postmortem Lead',
      proficiency: 'high',
      exampleQuestions: [
        'Generate detailed incident timeline',
        'What preventions should we implement?',
        'Review logs for patterns',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'alert-correlator',
      name: 'Alert Correlator',
      description: 'Ingest and correlate alerts from PagerDuty/OpsGenie',
      status: 'active',
      autoDetected: true,
      accesses: ['pagerduty_opsgenie_webhook'],
    },
    {
      id: 'log-analyzer',
      name: 'Log Analyzer',
      description: 'Query logs and identify error patterns and root causes',
      status: 'active',
      autoDetected: true,
      accesses: ['log_aggregator_api'],
    },
    {
      id: 'metric-correlator',
      name: 'Metric Correlator',
      description: 'Correlate metric anomalies with alerts to diagnose root cause',
      status: 'active',
      autoDetected: true,
      accesses: ['datadog_splunk_api'],
    },
    {
      id: 'runbook-executor',
      name: 'Runbook Executor',
      description: 'Execute remediation runbook steps and coordinate service recovery',
      status: 'active',
      autoDetected: true,
      accesses: ['service_dependency_map.db'],
    },
  ],
  tasks: [
    {
      id: 'alert-triage',
      label: 'Alert Triage',
      description: 'Classify incident severity and correlate related alerts',
      systemSuggested: true,
      triggeredBy: 'Alert received from PagerDuty/OpsGenie',
    },
    {
      id: 'log-correlation',
      label: 'Log Correlation',
      description: 'Correlate alert patterns with error logs to find root cause',
      systemSuggested: true,
      triggeredBy: 'Alert triage completes',
    },
    {
      id: 'root-cause-diagnosis',
      label: 'Root Cause Diagnosis',
      description: 'Analyze logs, metrics, and service topology to diagnose root cause',
      systemSuggested: true,
      triggeredBy: 'Log correlation completes',
    },
    {
      id: 'remediation-execution',
      label: 'Remediation Execution',
      description: 'Execute runbook steps to recover service',
      systemSuggested: true,
      triggeredBy: 'Root cause identified',
    },
    {
      id: 'rollback-decision',
      label: 'Rollback Decision',
      description: 'Evaluate rollback safety and execute if confidence is high',
      systemSuggested: true,
      triggeredBy: 'Remediation indicates deployment issue',
    },
    {
      id: 'blast-radius-assessment',
      label: 'Blast Radius Assessment',
      description: 'Calculate customer impact using service dependency graph',
      systemSuggested: true,
      triggeredBy: 'Root cause identified',
    },
  ],
  guardrails: [
    {
      id: 'ir-safety-no-destructive-without-approval',
      category: 'safety',
      label: 'High-Risk Actions Require Approval',
      description: 'Rollbacks, traffic drains, and service restarts require explicit on-call engineer approval.',
      enforcement: 'hard',
    },
    {
      id: 'ir-safety-blast-radius-check',
      category: 'safety',
      label: 'Blast Radius Validation',
      description: 'Calculate and validate blast radius before executing remediation. Alert if customer-facing impact exceeds threshold.',
      enforcement: 'hard',
      threshold: 'Customer impact < 1000 users (without approval)',
    },
    {
      id: 'ir-quality-diagnosis-confidence',
      category: 'quality',
      label: 'Diagnosis Confidence Threshold',
      description: 'Do not escalate or execute remediation unless root cause confidence is >70%. Flag low-confidence diagnosis.',
      enforcement: 'hard',
      threshold: 'Confidence > 70%',
    },
    {
      id: 'ir-quality-log-retention',
      category: 'quality',
      label: 'Incident Log Retention',
      description: 'Retain all logs and metrics for incident for minimum 30 days for postmortem analysis.',
      enforcement: 'hard',
      threshold: 'Retain 30 days',
    },
    {
      id: 'ir-escalation-inconclusive-diagnosis',
      category: 'escalation',
      label: 'Inconclusive Diagnosis Escalation',
      description: 'If root cause cannot be determined after analyzing all data sources, escalate to SRE lead immediately.',
      enforcement: 'hard',
    },
    {
      id: 'ir-escalation-multi-service-impact',
      category: 'escalation',
      label: 'Multi-Service Impact Escalation',
      description: 'If incident affects >3 services, escalate to incident commander for coordination.',
      enforcement: 'hard',
      threshold: '>3 services affected',
    },
    {
      id: 'ir-compliance-incident-logging',
      category: 'compliance',
      label: 'Incident Audit Trail',
      description: 'Log all incident actions: detection time, diagnosis steps, remediation actions, decisions, and approvals.',
      enforcement: 'hard',
    },
    {
      id: 'ir-compliance-postmortem-required',
      category: 'compliance',
      label: 'Postmortem Generation',
      description: 'Generate detailed incident timeline and root cause summary for severity P1/P2 incidents.',
      enforcement: 'hard',
      threshold: 'Severity >= P2',
    },
  ],
  agentOutputs: [
    { id: 'ir-out-incident-alert', label: 'Incident Alert', description: 'Initial incident detection with severity and correlation summary', exampleOutput: 'INCIDENT ALERT P1: API service degradation. Severity: High. Affected: 2,340 users. Services: api-gateway, auth-service. Alerts: latency +450ms, error-rate +12%, CPU 89%. Correlated errors: "connection timeout" (340 errors). Investigation initiated.', triggeringTaskIds: ['alert-triage'], isCore: true },
    { id: 'ir-out-root-cause-analysis', label: 'Root Cause Analysis', description: 'Detailed RCA with evidence and diagnosis confidence', exampleOutput: 'Root Cause: Primary database connection pool exhausted. Evidence: (1) Log spike "pool exhausted" at 14:23 UTC, (2) Metric spike: DB connections 1000/1000 at incident time, (3) Code analysis: query leak in session handler, (4) Deployment: new session code deployed 2 hours before. Confidence: 94%. Blast radius: All API services affected.', triggeringTaskIds: ['root-cause-diagnosis'], isCore: true },
    { id: 'ir-out-remediation-plan', label: 'Remediation Plan', description: 'Step-by-step remediation with risk assessment and rollback plan', exampleOutput: 'Remediation plan: (1) Increase DB connection pool 1000→2000 (low risk, <5sec downtime), (2) Drain traffic from affected service, (3) Deploy connection leak fix (medium risk, tested in staging), (4) Monitor for 5 minutes. Rollback: Revert to v1.2.3 (v1.2.4 has leak). Cost: 15 min MTTR. Estimated time: 30 seconds step 1, 120 seconds step 3.', triggeringTaskIds: ['remediation-execution'], isCore: true },
    { id: 'ir-out-incident-timeline', label: 'Incident Timeline', description: 'Chronological timeline of detection, diagnosis, and recovery', exampleOutput: '14:23:15 - Alert fired: API latency P95 >2000ms\n14:23:42 - Incident created, on-call notified\n14:24:10 - RCA: DB connection pool exhausted, suspected code leak\n14:25:20 - Remediation approved: increase pool + drain traffic\n14:25:50 - Connection pool increased to 2000\n14:26:15 - Traffic draining completes\n14:27:00 - Fix deployed (v1.2.4 reverted to v1.2.3)\n14:27:30 - Metrics normalized, incident resolved\nTotal MTTR: 4 minutes 15 seconds', triggeringTaskIds: ['root-cause-diagnosis'], isCore: true },
    { id: 'ir-out-service-impact', label: 'Service Impact Summary', description: 'Blast radius and customer impact assessment', exampleOutput: 'Service Impact: API Gateway, Auth Service, User Service affected. Customers impacted: 2,340 users (0.8% of base). SLA impact: 1 minute downtime (P1 SLA: 99.99% = 0 min, breach). Business impact: ~$180 estimated loss (15 min × avg customer value). Affected features: Login (critical), API access (degraded 4 min).', triggeringTaskIds: ['blast-radius-assessment'], isCore: false },
    { id: 'ir-out-postmortem', label: 'Incident Postmortem', description: 'Detailed postmortem with root cause and preventive actions', exampleOutput: 'Postmortem: Session handler code had resource leak (improper connection cleanup). Shipped in v1.2.4 released 12:30 UTC. Not caught by code review or load testing. Action items: (1) Add connection pool metrics to dashboard, (2) Implement auto-drain on pool >80%, (3) Load test all session changes, (4) Code review focus on resource cleanup.', triggeringTaskIds: ['root-cause-diagnosis'], isCore: false },
  ],
}

// ─── On-Prem Assistant Agent ──────────────────────────────────────────

const ONPREM_ASSISTANT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('onprem-assistant')?.steps || [],
  businessSummary:
    'Six steps covering real-time sensor data ingestion, anomaly detection, failure prediction, maintenance scheduling, and spare parts optimization. All inference runs on edge gateway (no cloud uploads). Processes 287 equipment units across 4 production lines. Delivers 48-hour advance warnings before equipment failures with 89% accuracy.',
  technicalSummary:
    'Predictive maintenance system with edge ML models, local MQTT streaming, and automated work-order generation. Real-time sensor processing (1000 Hz vibration, 100 Hz motor current), LSTM-based anomaly detection with 30-day rolling window buffer, failure prediction via random forest trained on 42k maintenance records, and rule-based scheduling with spare-parts availability checking. Latency: <500ms end-to-end sensor ingestion to dashboard alert. Estimated p95: 2.1s from anomaly detection to work-order generation.',
  dataSources: [
    {
      id: 'sensor-streams',
      name: 'mqtt_sensor_streams',
      format: 'MQTT Queue',
      size: '48 TB (rolling 30d)',
      contentTypes: ['timeseries'],
    },
    {
      id: 'maint-history',
      name: 'maintenance_history.db',
      format: 'Database',
      size: '4.2 GB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'spare-parts',
      name: 'spare_parts_inventory.db',
      format: 'Database',
      size: '180 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'equipment-specs',
      name: 'equipment_specs_and_manuals.pdf',
      format: 'PDF Archive',
      size: '890 MB',
      contentTypes: ['text', 'tables'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'maintenance-technician',
      category: 'Maintenance Technician',
      proficiency: 'medium',
      exampleQuestions: [
        'Alert: Motor M-47 showing wear. What parts do I need?',
        'Is bearing replacement due on Line 2 equipment?',
        'How do I schedule preventive maintenance?',
      ],
      isCore: true,
    },
    {
      id: 'plant-engineer',
      category: 'Plant Engineer',
      proficiency: 'high',
      exampleQuestions: [
        'Show equipment health dashboard for Line 3',
        'What is the predicted MTBF for Production Cell A?',
        'Analyze vibration trends across all equipment',
      ],
      isCore: true,
    },
    {
      id: 'reliability-manager',
      category: 'Reliability Manager',
      proficiency: 'high',
      exampleQuestions: [
        'Generate monthly OEE report by production line',
        'Which equipment has highest downtime cost?',
        'Forecast spare parts inventory for next quarter',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'operations-director',
      category: 'Operations Director',
      proficiency: 'medium',
      exampleQuestions: [
        'Show production impact of equipment failures this month',
        'What is the total downtime cost across all lines?',
        'Budget forecast for preventive maintenance next quarter',
      ],
      isCore: false,
    },
    {
      id: 'supply-chain-manager',
      category: 'Supply Chain Manager',
      proficiency: 'medium',
      exampleQuestions: [
        'Which spare parts are critical short?',
        'Optimize inventory levels based on failure predictions',
        'Which suppliers have best lead times for bearings?',
      ],
      isCore: false,
    },
    {
      id: 'safety-officer',
      category: 'Safety Officer',
      proficiency: 'medium',
      exampleQuestions: [
        'Flag equipment with safety-critical failure risks',
        'Generate maintenance safety checklist',
        'Alert on equipment operating outside safe parameters',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'sensor-anomaly-detector',
      name: 'Sensor Anomaly Detector',
      description: 'Real-time anomaly detection using LSTM models on streaming sensor data',
      status: 'active',
      autoDetected: true,
      accesses: ['mqtt_sensor_streams'],
    },
    {
      id: 'failure-predictor',
      name: 'Failure Predictor',
      description: 'Random forest model predicting bearing wear, motor failure, and component degradation',
      status: 'active',
      autoDetected: true,
      accesses: ['maintenance_history.db'],
    },
    {
      id: 'maintenance-scheduler',
      name: 'Maintenance Scheduler',
      description: 'Generate work orders and schedule preventive maintenance with spare parts checking',
      status: 'active',
      autoDetected: true,
      accesses: ['spare_parts_inventory.db', 'equipment_specs_and_manuals.pdf'],
    },
  ],
  tasks: [
    {
      id: 'sensor-anomaly-detection',
      label: 'Detect Sensor Anomalies',
      description: 'Real-time detection of abnormal vibration, temperature, or motor current patterns',
      systemSuggested: true,
      triggeredBy: 'New sensor data arrives (1000 Hz vibration)',
    },
    {
      id: 'failure-prediction',
      label: 'Predict Equipment Failure',
      description: 'Forecast bearing wear, motor degradation, and component failures within 7-day window',
      systemSuggested: true,
      triggeredBy: 'Anomaly detected or scheduled daily analysis',
    },
    {
      id: 'maintenance-scheduling',
      label: 'Schedule Maintenance',
      description: 'Generate work orders and spare parts requisitions with 48-hour advance notice',
      systemSuggested: true,
      triggeredBy: 'Failure prediction exceeds threshold',
    },
  ],
  guardrails: [
    {
      id: 'onprem-safety-sensor-validation',
      category: 'safety',
      label: 'Sensor Data Validation',
      description: 'All sensor inputs validated for plausible range (vibration < 100mm/s, temp < 150C). Reject outliers with anomaly flag.',
      enforcement: 'hard',
    },
    {
      id: 'onprem-safety-no-false-positive',
      category: 'safety',
      label: 'False Positive Detection',
      description: 'Critical alerts require confidence > 85% AND corroborating signals before escalation. Prevent unnecessary maintenance.',
      enforcement: 'hard',
    },
    {
      id: 'onprem-quality-prediction-accuracy',
      category: 'quality',
      label: 'Prediction Accuracy Gate',
      description: 'Failure predictions must achieve ≥ 85% accuracy on validation set. Retrain model quarterly or if accuracy drops.',
      enforcement: 'soft',
      threshold: '≥ 85% accuracy',
    },
    {
      id: 'onprem-quality-work-order-audit',
      category: 'quality',
      label: 'Work Order Audit Trail',
      description: 'Every work order generated by agent includes reasoning: which sensor anomaly, failure prediction confidence, spare parts availability.',
      enforcement: 'hard',
    },
    {
      id: 'onprem-escalation-critical-failure',
      category: 'escalation',
      label: 'Critical Equipment Failure',
      description: 'Catastrophic predictions (imminent motor failure, bearing collapse) escalate to plant engineer immediately with SMS + dashboard alert.',
      enforcement: 'hard',
    },
    {
      id: 'onprem-escalation-inventory-shortage',
      category: 'escalation',
      label: 'Spare Parts Inventory Shortage',
      description: 'If critical spare part is unavailable, escalate to supply chain manager with lead-time buffer (lead_time + 7 days).',
      enforcement: 'hard',
    },
    {
      id: 'onprem-compliance-iso13373',
      category: 'compliance',
      label: 'ISO 13373-1 Compliance',
      description: 'Condition monitoring methods must comply with ISO 13373-1 (Condition monitoring and diagnostics). Documentation required.',
      enforcement: 'hard',
    },
    {
      id: 'onprem-compliance-iso18436',
      category: 'compliance',
      label: 'ISO 18436 Competency',
      description: 'Vibration analysis performed per ISO 18436 (Vibration analyst competency). Model retraining documented annually.',
      enforcement: 'soft',
    },
  ],
  agentOutputs: [
    { id: 'onprem-out-anomaly-alert', label: 'Sensor Anomaly Alert', description: 'Real-time notification of abnormal sensor readings with severity and recommended action', exampleOutput: 'ALERT [HIGH]: Motor M-47 vibration spike detected. Vibration: 8.2mm/s (normal: 4.1mm/s). Trend: Accelerating over 3 days. Confidence: 94%. Recommendation: Schedule bearing inspection within 48h. Work order: WO-2026-8473 created. Parts needed: Bearing SKU-4821 (in stock).', triggeringTaskIds: ['sensor-anomaly-detection'], isCore: true },
    { id: 'onprem-out-failure-prediction', label: 'Failure Prediction', description: 'Forecast of equipment failure with confidence score and lead time to failure', exampleOutput: 'Equipment: Pump P-12 (Production Line 2). Failure Risk: CRITICAL (bearing wear predicted). Confidence: 89%. Estimated Time to Failure: 4-6 days. Component at risk: Bearing assy (part: SKU-2847). Cost if unplanned failure: $42,000 downtime. Preventive action: Schedule replacement in next maintenance window (Tue 03/18, 4h duration).', triggeringTaskIds: ['failure-prediction'], isCore: true },
    { id: 'onprem-out-work-order', label: 'Work Order', description: 'Auto-generated maintenance work order with parts list and estimated duration', exampleOutput: 'Work Order #WO-2026-8472\nEquipment: Motor M-47\nTask: Replace bearing assy (SKU-4821) + inspect motor shaft\nParts Required: Bearing assy (qty 1, in stock), Lubricant (qty 0.5L, in stock)\nEstimated Duration: 2.5 hours\nSchedule: 2026-03-17 10:00-12:30\nSkill Level: Technician (certified)\nSafety Precautions: De-energize motor, lockout/tagout procedure required', triggeringTaskIds: ['maintenance-scheduling'], isCore: true },
    { id: 'onprem-out-inventory-forecast', label: 'Spare Parts Forecast', description: 'Predicted spare parts consumption and recommended reorder quantities', exampleOutput: 'Spare Parts Forecast (90-day horizon):\n- Bearing assy (SKU-4821): 8 units predicted usage, current stock 3, reorder 6 units (lead time: 12 days)\n- Motor coupling (SKU-5634): 3 units, current 5, in stock\n- Lubricant (SKU-1200): 12L, current 8L, reorder 20L\nCritical: Bearing lead time requires ordering by 03/16 for scheduled maintenance 03/17.', triggeringTaskIds: ['failure-prediction'], isCore: false },
    { id: 'onprem-out-health-dashboard', label: 'Equipment Health Dashboard', description: 'Visual summary of all equipment health metrics and OEE trends', exampleOutput: 'Line 1 Health: 94% (8 equipment nominal). Line 2 Health: 78% (Pump P-12 degrading, Motor M-47 at risk). Line 3 Health: 89%. OEE Last Month: 82% (Target: 85%). Predicted downtime avoidance: 14 hours this month via predictive maintenance.', triggeringTaskIds: ['failure-prediction'], isCore: false },
  ],
}

// ─── Multimodal Agent ─────────────────────────────────────────────────

const MULTIMODAL_AGENT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('multimodal-agent')?.steps || [],
  businessSummary:
    'Seven steps covering content classification across modalities (text, image, audio, video), policy matching with severity scoring, automated action decisions, and escalation to human reviewers. Reviews 8,000-50,000 flagged items daily across 4 modalities. Target: >99% accuracy on clear violations, <3% false positive rate, <24h SLA for human review.',
  technicalSummary:
    'Content moderation pipeline with per-modality classifiers and policy-based routing. Text: transformer-based hate-speech + toxicity + misinformation detection. Image: NSFW scoring + violence detection + optical hash matching against known CSAM. Audio: ASR (Whisper) + hate-speech model on transcripts. Video: frame sampling (8 fps) + audio analysis + temporal coherence checks. Severity scoring: rules engine (policy match strength) + ML confidence calibration (from 2.1M historical decisions). Routing: auto-remove if severity=critical AND confidence>95%, human queue if severity=medium OR confidence 70-95%, whitelist if confidence<threshold.',
  dataSources: [
    {
      id: 'content-queue',
      name: 'content_flag_queue',
      format: 'Message Queue',
      size: 'Real-time (8k-50k/day)',
      contentTypes: ['mixed-media'],
    },
    {
      id: 'policy-rulebook',
      name: 'community_guidelines.pdf',
      format: 'PDF',
      size: '47 pages (2.1 MB)',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'moderation-history',
      name: 'moderation_decisions.db',
      format: 'Database',
      size: '8.4 GB (2.1M decisions)',
      contentTypes: ['structured-data'],
    },
    {
      id: 'reporter-trust',
      name: 'reporter_trust_scores.db',
      format: 'Database',
      size: '340 MB',
      contentTypes: ['structured-data'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'content-moderator',
      category: 'Content Moderator',
      proficiency: 'medium',
      exampleQuestions: [
        'Review flagged text post for hate speech',
        'Analyze image reported for NSFW content',
        'Assess video for policy violation',
      ],
      isCore: true,
    },
    {
      id: 'trust-safety-manager',
      category: 'Trust & Safety Manager',
      proficiency: 'high',
      exampleQuestions: [
        'Show trending violation types this week',
        'Review escalated edge-case decisions',
        'Analyze false positive rate by category',
      ],
      isCore: true,
    },
    {
      id: 'appeals-reviewer',
      category: 'Appeals Reviewer',
      proficiency: 'high',
      exampleQuestions: [
        'Review content removal appeal',
        'Verify moderation decision was correct',
        'Reverse decision if policy misapplication',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'policy-analyst',
      category: 'Policy Analyst',
      proficiency: 'high',
      exampleQuestions: [
        'Identify policy gaps based on escalations',
        'Update policy rulebook for new violation type',
        'Generate policy impact analysis',
      ],
      isCore: false,
    },
    {
      id: 'legal-counsel',
      category: 'Legal Counsel',
      proficiency: 'high',
      exampleQuestions: [
        'Review moderation decision for legal liability',
        'Ensure GDPR/DSA compliance in appeals process',
        'Document decision rationale for litigation',
      ],
      isCore: false,
    },
    {
      id: 'data-analyst',
      category: 'Data Analyst',
      proficiency: 'medium',
      exampleQuestions: [
        'Generate false positive trend report',
        'Analyze moderation SLA compliance',
        'Compare violation rates by geography',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'text-classifier',
      name: 'Text Classifier',
      description: 'Detect hate speech, toxicity, misinformation in flagged text',
      status: 'active',
      autoDetected: true,
      accesses: ['content_flag_queue'],
    },
    {
      id: 'image-analyzer',
      name: 'Image Analyzer',
      description: 'NSFW detection, violence scoring, optical hash matching for CSAM',
      status: 'active',
      autoDetected: true,
      accesses: ['content_flag_queue'],
    },
    {
      id: 'audio-processor',
      name: 'Audio Processor',
      description: 'ASR transcription + hate-speech detection on audio/video',
      status: 'active',
      autoDetected: true,
      accesses: ['content_flag_queue'],
    },
    {
      id: 'policy-matcher',
      name: 'Policy Matcher',
      description: 'Match flagged content against community guidelines and return severity',
      status: 'active',
      autoDetected: true,
      accesses: ['community_guidelines.pdf', 'moderation_decisions.db'],
    },
  ],
  tasks: [
    {
      id: 'content-classification',
      label: 'Classify Flagged Content',
      description: 'Apply policy rulebook and assign severity level (no-violation to critical)',
      systemSuggested: true,
      triggeredBy: 'Content flagged by user or automated pre-screening',
    },
    {
      id: 'policy-matching',
      label: 'Match Against Policy',
      description: 'Find which policy violation(s) apply, cite specific policy section',
      systemSuggested: true,
      triggeredBy: 'Content classification completes',
    },
    {
      id: 'action-decision',
      label: 'Auto-Decision Routing',
      description: 'Route to auto-remove, human review queue, or whitelist based on severity + confidence',
      systemSuggested: true,
      triggeredBy: 'Policy matching completes',
    },
  ],
  guardrails: [
    {
      id: 'multi-safety-csam-detection',
      category: 'safety',
      label: 'CSAM Detection (Mandatory)',
      description: 'Any content matching known CSAM hash database is immediately auto-removed and reported to NCMEC. No human review needed.',
      enforcement: 'hard',
    },
    {
      id: 'multi-safety-false-positive-minimization',
      category: 'safety',
      label: 'False Positive Minimization',
      description: 'Flag auto-removals with confidence < 95% for spot-check by humans. Target: <3% false positive rate.',
      enforcement: 'soft',
      threshold: '< 3% false positives',
    },
    {
      id: 'multi-quality-confidence-scoring',
      category: 'quality',
      label: 'Confidence Scoring Calibration',
      description: 'ML confidence scores calibrated against historical decision database quarterly. Track precision/recall trade-offs.',
      enforcement: 'soft',
    },
    {
      id: 'multi-quality-policy-citation',
      category: 'quality',
      label: 'Policy Citation Required',
      description: 'Every moderation decision cites specific policy section from community guidelines (e.g., "Section 3.1.2: Hate Speech"). No generic citations.',
      enforcement: 'hard',
    },
    {
      id: 'multi-escalation-edge-case-routing',
      category: 'escalation',
      label: 'Edge Case Escalation',
      description: 'Satire, parody, news/journalism exceptions, or policy conflicts routed to trust-safety manager within 4-hour SLA.',
      enforcement: 'hard',
      threshold: '< 4 hour SLA',
    },
    {
      id: 'multi-escalation-appeal-review',
      category: 'escalation',
      label: 'Appeal Review Process',
      description: 'Content creator can appeal removal. Appeals reviewed by different moderator within 24 hours. Reversal decision documented.',
      enforcement: 'hard',
      threshold: '< 24 hour appeal SLA',
    },
    {
      id: 'multi-compliance-gdpr-netzdag',
      category: 'compliance',
      label: 'GDPR & NetzDG Compliance',
      description: 'Germany: NetzDG compliance (hate speech removed within 24h). EU: GDPR Art. 17 (Right to be Forgotten) honored in appeals.',
      enforcement: 'hard',
    },
    {
      id: 'multi-compliance-dsa-transparency',
      category: 'compliance',
      label: 'DSA Transparency Reporting',
      description: 'Digital Services Act: annual transparency reports on moderation decisions, false positive rates, appeal outcomes published.',
      enforcement: 'hard',
    },
  ],
  agentOutputs: [
    { id: 'multi-out-moderation-decision', label: 'Moderation Decision', description: 'Policy violation classification with severity, confidence score, and citation', exampleOutput: 'Content ID: post_8473920. Decision: REMOVE. Violation: Hate Speech (Section 3.1.2, Community Guidelines v2.4). Severity: CRITICAL. Confidence: 96%. Policy match: "calls for violence against protected group". Reasoning: Text contains explicit hate speech with dehumanizing language. Confidence calibrated from 1,847 similar precedents. Appeal: enabled.', triggeringTaskIds: ['action-decision'], isCore: true },
    { id: 'multi-out-escalation-summary', label: 'Escalation Summary', description: 'Edge case routed to human reviewer with context and recommendation', exampleOutput: 'Content ID: video_1294875. Type: Edge Case. Reason: Satire vs. Hate Speech ambiguity. Text: "Sarcastic post with statement that could be interpreted as hate speech." Visual: Meme format (visual cues suggest satire). Recommendation: Likely satire (80% confidence), but policy exception applies only if creator intent is clear. Routed to: Trust-Safety Manager. SLA: 4 hours.', triggeringTaskIds: ['content-classification'], isCore: true },
    { id: 'multi-out-appeal-outcome', label: 'Appeal Outcome', description: 'Decision on content removal appeal with reversal or upheld rationale', exampleOutput: 'Appeal ID: APL-2026-84392. Original removal: 03/12/2026 (Hate Speech). Appeal filed: 03/13/2026. Appeal decision: UPHELD. Rationale: Content matches Section 3.1.2 (hate speech) precisely. Policy allows no exceptions. Prior precedents: 47 identical cases, all removals upheld. Community safety impact of reinstatement: high. Appeals reviewer: Jane Smith (Trust & Safety, 2yr tenure).', triggeringTaskIds: ['action-decision'], isCore: false },
    { id: 'multi-out-trend-report', label: 'Trend Report', description: 'Weekly or monthly trend analysis on violation types and moderation patterns', exampleOutput: 'Weekly Moderation Report (03/08-03/14/2026):\n- Total flags: 12,847\n- Auto-removed: 8,203 (64%)\n- Human reviewed: 4,644 (36%)\n- False positive rate: 2.1% (target: <3%)\n- Top violations: hate speech (4,200), NSFW (3,100), misinformation (2,800)\n- Appeal rate: 0.8% (103 appeals filed)\n- Appeal overturn rate: 12% (12 reversals)\n- Compliance: GDPR 100%, NetzDG 100%, DSA 99.8%', triggeringTaskIds: ['action-decision'], isCore: false },
    { id: 'multi-out-quality-audit', label: 'Quality Audit', description: 'Spot-check auditing of moderation decisions for consistency and accuracy', exampleOutput: 'Audit ID: AUD-2026-391. Sample: 50 random hate-speech removals from 03/12. Results: 48/50 correctly classified (96% accuracy). 1 false positive (sarcasm not detected). 1 correct removal (borderline policy match). Confidence in model: HIGH. Recommendation: Continue current thresholds. Flag sarcasm edge cases for future training data.', triggeringTaskIds: ['action-decision'], isCore: false },
  ],
}

// ─── Consumer Chat Agent ──────────────────────────────────────────────

const CONSUMER_CHAT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('consumer-chat')?.steps || [],
  businessSummary:
    'Seven steps covering HR policy lookups, employee self-service, PTO request processing, benefits inquiries, and escalation to HR business partners. Handles 24,000 employees at scale. Sub-500ms latency for policy lookups, 3-second SLA for PTO calculations. First-contact resolution rate ~71% on HR FAQs; escalation rate ~8% on complex policy questions.',
  technicalSummary:
    'Instruction graph with HRIS integration (Workday API), benefits portal data, payroll system access, and handbook full-text search. Request batching for 2,000 concurrent employee queries. Policy compliance validation on every answer. Token budget: 1,024 tokens max for policy citations + calculation output. Estimated p95 latency: 280ms for FAQ, 1.2s for PTO calculation with HRIS lookup.',
  dataSources: [
    {
      id: 'employee-handbook',
      name: 'employee_handbook_and_policies.pdf',
      format: 'PDF',
      size: '180 pages (4.2 MB)',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'hris-database',
      name: 'hris_employee_records.api',
      format: 'API (Workday)',
      size: '24,000 employee records',
      contentTypes: ['structured-data'],
    },
    {
      id: 'benefits-portal',
      name: 'benefits_enrollment.db',
      format: 'Database',
      size: '1.2 GB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'payroll-system',
      name: 'payroll_data.api',
      format: 'API (ADP)',
      size: 'Real-time',
      contentTypes: ['structured-data'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'new-hire',
      category: 'New Hire',
      proficiency: 'low',
      exampleQuestions: [
        'How do I enroll in health insurance?',
        'What is my PTO balance?',
        'When is the onboarding checklist due?',
      ],
      isCore: true,
    },
    {
      id: 'mid-level-employee',
      category: 'Mid-Level Employee',
      proficiency: 'medium',
      exampleQuestions: [
        'Can I take FMLA leave for maternity?',
        'How do I submit an expense report?',
        'What is my current compensation band?',
      ],
      isCore: true,
    },
    {
      id: 'people-manager',
      category: 'People Manager',
      proficiency: 'high',
      exampleQuestions: [
        'Approve PTO request for direct report',
        'View team org chart and manager assignments',
        'Generate performance review form',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'hr-business-partner',
      category: 'HR Business Partner',
      proficiency: 'high',
      exampleQuestions: [
        'Handle complex leave policy exception',
        'Review compensation dispute',
        'Investigate potential discrimination concern',
      ],
      isCore: false,
    },
    {
      id: 'executive',
      category: 'Executive / Leadership',
      proficiency: 'medium',
      exampleQuestions: [
        'Generate headcount report by department',
        'Review succession planning data',
        'Compensation budget allocation',
      ],
      isCore: false,
    },
    {
      id: 'compliance-officer',
      category: 'Compliance Officer',
      proficiency: 'high',
      exampleQuestions: [
        'Audit FMLA leave compliance',
        'Generate ADA accommodation audit',
        'Review policy adherence metrics',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'handbook-searcher',
      name: 'Handbook Full-Text Search',
      description: 'Search employee handbook and policy documents for policy answers',
      status: 'active',
      autoDetected: true,
      accesses: ['employee_handbook_and_policies.pdf'],
    },
    {
      id: 'hris-lookup',
      name: 'HRIS Employee Lookup',
      description: 'Retrieve employee record, manager, org structure, tenure, compensation band from Workday',
      status: 'active',
      autoDetected: true,
      accesses: ['hris_employee_records.api'],
    },
    {
      id: 'benefits-calculator',
      name: 'Benefits Calculator',
      description: 'Calculate benefits costs, premiums, and enrollment eligibility',
      status: 'active',
      autoDetected: true,
      accesses: ['benefits_enrollment.db'],
    },
    {
      id: 'pto-calculator',
      name: 'PTO/Leave Calculator',
      description: 'Calculate PTO accrual, validate balance, calculate leave with state-law compliance',
      status: 'active',
      autoDetected: true,
      accesses: ['hris_employee_records.api', 'payroll_system.api'],
    },
  ],
  tasks: [
    {
      id: 'answer-policy-question',
      label: 'Answer HR Policy Question',
      description: 'Respond to employee questions about PTO, leave, benefits, payroll with policy citations',
      systemSuggested: true,
      triggeredBy: 'Employee submits HR query',
    },
    {
      id: 'process-pto-request',
      label: 'Process PTO Request',
      description: 'Validate PTO balance, calculate leave period, submit for manager approval',
      systemSuggested: true,
      triggeredBy: 'Employee submits PTO request',
    },
    {
      id: 'benefits-enrollment-help',
      label: 'Benefits Enrollment Support',
      description: 'Guide employee through benefits election, calculate costs, submit election',
      systemSuggested: true,
      triggeredBy: 'Open enrollment period or employee benefit inquiry',
    },
  ],
  guardrails: [
    {
      id: 'consumer-safety-no-legal-advice',
      category: 'safety',
      label: 'No Legal Advice',
      description: 'Never provide legal advice on employment disputes, discrimination, or contract interpretation. Escalate to HR business partner.',
      enforcement: 'hard',
    },
    {
      id: 'consumer-safety-data-privacy',
      category: 'safety',
      label: 'Employee Data Privacy',
      description: 'Never share peer employee data (salary, performance, health info) with requesting employee. HRIS access is role-gated.',
      enforcement: 'hard',
    },
    {
      id: 'consumer-quality-policy-citation',
      category: 'quality',
      label: 'Policy Citation Required',
      description: 'Every HR answer cites specific handbook section or policy document. No generic advice without policy reference.',
      enforcement: 'hard',
    },
    {
      id: 'consumer-quality-calculation-accuracy',
      category: 'quality',
      label: 'Calculation Accuracy',
      description: 'PTO calculations validated against HRIS tenure and state law. All calculations include confidence score and review recommendation.',
      enforcement: 'hard',
      threshold: '100% accuracy for PTO calculations',
    },
    {
      id: 'consumer-escalation-policy-exception',
      category: 'escalation',
      label: 'Policy Exception Escalation',
      description: 'Requests for policy exceptions, accommodations, or hardship considerations escalate to HR business partner within 4-hour SLA.',
      enforcement: 'hard',
      threshold: '< 4 hour SLA',
    },
    {
      id: 'consumer-escalation-legal-concern',
      category: 'escalation',
      label: 'Legal Concern Routing',
      description: 'Discrimination concerns, wrongful termination risks, or FMLA/ADA violations route to legal counsel + HR business partner immediately.',
      enforcement: 'hard',
    },
    {
      id: 'consumer-compliance-fmla-ada',
      category: 'compliance',
      label: 'FMLA & ADA Compliance',
      description: 'All leave approvals validate FMLA eligibility (12-month tenure, covered employer, 50-employee worksite). ADA accommodation flagged for review.',
      enforcement: 'hard',
    },
    {
      id: 'consumer-compliance-state-law',
      category: 'compliance',
      label: 'State Employment Law Compliance',
      description: 'PTO calculations, leave policies, and benefits eligibility must comply with state law (CA: paid parental leave, NY: sick leave, TX: at-will). Flagged by state.',
      enforcement: 'hard',
    },
  ],
  agentOutputs: [
    { id: 'consumer-out-policy-answer', label: 'Policy Answer', description: 'HR policy question answered with handbook citation and personalization', exampleOutput: 'Based on your tenure (18 months), you qualify for maternity leave under our policy (Employee Handbook, Section 4.2.1). Standard maternity leave: 12 weeks paid, plus 4 weeks unpaid if needed. You can also run paid leave concurrently. Your manager is Jane Smith. Next step: File a leave request in the portal; it will route to Jane for approval. Need help with the request?', triggeringTaskIds: ['answer-policy-question'], isCore: true },
    { id: 'consumer-out-pto-approval', label: 'PTO Request Approval', description: 'PTO request validated, calculated, and routed for manager approval', exampleOutput: 'PTO Request Submitted!\nDates: 04/15-04/19/2026 (5 business days)\nYour current PTO balance: 12.5 days\nAfter this request: 7.5 days remaining\nStatus: Pending approval from your manager (Jane Smith)\nExpected response: 2 business days\nYou will receive email confirmation once approved.', triggeringTaskIds: ['process-pto-request'], isCore: true },
    { id: 'consumer-out-benefits-election', label: 'Benefits Election Confirmation', description: 'Confirmation of benefits enrollment with cost breakdown', exampleOutput: 'Benefits Election Confirmed!\nEffective: 2026-04-01\nMedical: PPO Plan (Blue Cross) | Monthly: $245 (you), $567 (company total)\nDental: Standard (Delta) | Monthly: $28\nVision: Plus (VSP) | Monthly: $15\nHSA: $2,500 (employee) + $1,000 (company match)\nTotal monthly cost: $288 | Total annual: $3,456\nReview full details in Benefits Portal. Questions? Contact HR at hr@company.com', triggeringTaskIds: ['benefits-enrollment-help'], isCore: true },
    { id: 'consumer-out-escalation-notice', label: 'Escalation Notice', description: 'Notice of escalation to HR business partner with reason and timeframe', exampleOutput: 'Your request has been escalated to an HR Business Partner.\nReason: Your situation involves a policy exception request (sabbatical leave beyond standard leave policy).\nYour HR partner: Marcus Chen (marcus.chen@company.com)\nExpected response: Within 4 business hours\nYou will receive an email directly from Marcus with next steps.\nThank you for your patience!', triggeringTaskIds: ['answer-policy-question'], isCore: false },
    { id: 'consumer-out-payroll-report', label: 'Payroll Information', description: 'YTD earnings, deductions, and next paycheck summary', exampleOutput: 'Payroll Summary (2026 YTD)\nYTD Gross: $24,500 | YTD Taxes: $5,240 | YTD Net: $19,260\nNext Paycheck: 03/15/2026\nGross: $2,450 (bi-weekly)\nDeductions: Federal tax $420, FICA $187, Health insurance $245, 401(k) $150\nNet Pay: $1,448\nQuestions about taxes or deductions? Contact Payroll: payroll@company.com', triggeringTaskIds: ['answer-policy-question'], isCore: false },
  ],
}

// ─── Lookup Map ──────────────────────────────────────────────────────

const CONTEXT_DEFINITION_MAP: Record<string, ContextDefinitionPayload> = {
  'faq-knowledge': FAQ_CONTEXT,
  'doc-intelligence': DOC_INTELLIGENCE_CONTEXT,
  'research-comparison': RESEARCH_CONTEXT,
  'decision-workflow': DENTAL_CONTEXT,
  'saas-copilot': SAAS_COPILOT_CONTEXT,
  'ops-agent': OPS_AGENT_CONTEXT,
  'coding-agent': CODING_AGENT_CONTEXT,
  'onprem-assistant': ONPREM_ASSISTANT_CONTEXT,
  'multimodal-agent': MULTIMODAL_AGENT_CONTEXT,
  'consumer-chat': CONSUMER_CHAT_CONTEXT,
}

export function getContextDefinitionData(
  tileId: string | null
): ContextDefinitionPayload | null {
  if (!tileId) return null
  return CONTEXT_DEFINITION_MAP[tileId] ?? null
}