import type { GoalDecomposition } from '@/store/agentTypes'

// ─── Data Domain Classifications (Technical Mode Only) ────────────────────

export type DataDomain = 'pure-text' | 'table-in-doc' | 'db-single' | 'db-multi' | 'api-live'

export const DATA_DOMAIN_LABELS: Record<DataDomain, string> = {
  'pure-text': 'Pure Text',
  'table-in-doc': 'Table in Document',
  'db-single': 'Single DB Table',
  'db-multi': 'Multiple DB / Joins',
  'api-live': 'Live API',
}

export const DATA_DOMAIN_COLORS: Record<DataDomain, string> = {
  'pure-text': '#047857',
  'table-in-doc': '#0369a1',
  'db-single': '#6d28d9',
  'db-multi': '#be123c',
  'api-live': '#d97706',
}

export interface DataSourceDetail {
  name: string
  domain: DataDomain
  description: string
  technicalNote: string
  updateFrequency?: 'static' | 'daily' | 'realtime'
}

// ─── Complexity Metadata ──────────────────────────────────────────────────

export interface ComplexityProfile {
  interactionPaths: number
  trustBoundaries: number
  integrations: number
  stateModel: 'stateless' | 'session' | 'multi-turn'
  failureModes: number
  latencyRequirement: 'relaxed' | 'moderate' | 'strict'
}

export interface GoalDataPayload {
  goalStatement: string
  decomposition: GoalDecomposition
  dataSources: DataSourceDetail[]
  businessSummary: string
  technicalSummary: string
  keyRisk: string
  complexityProfile: ComplexityProfile
  complianceRequired?: string[]
  costPreference?: 'minimal' | 'balanced' | 'unrestricted'
}

// ─── FAQ & Knowledge Agent ────────────────────────────────────────────────

const faqGoal: GoalDataPayload = {
  goalStatement:
    'Build an agent that resolves order issues — tracking delivery problems, processing refunds, coordinating with carriers, and answering order status questions. Clear boundaries on what the agent can resolve autonomously vs. when to escalate to human review.',
  decomposition: {
    primaryActions: ['Track', 'Resolve'],
    secondaryActions: ['Refund', 'Coordinate', 'Escalate'],
    primaryData: ['Order Database', 'Carrier Tracking API'],
    supportingData: ['Return Policy Docs', 'Product Catalog', 'Customer History'],
    reasoning:
      'Two-intent workflow. Track handles real-time order lookup and carrier status polling — 60% of inquiries resolve here. Resolve branches into refund, reship, or return-initiation flows based on issue diagnosis. Refund processes autonomous refunds below $250 and flags high-value requests for approval. Coordinate routes to carrier investigation when tracking shows anomalies. Escalate routes to human tier-2 when issue involves fraud signals, multiple failed carrier pings, or customer disputes. Alternative considered: single unified "resolve" action, but separation enables independent error handling and SLA tracking per workflow.',
    trustBoundaryHints: {
      autonomous: ['Order status lookups', 'Simple tracking updates', 'Return label generation', 'Refunds under $250'],
      supervised: ['Refunds $250-$1000', 'Replacement routing', 'Damaged goods claims'],
      escalation: ['Fraud signals', 'Lost package investigations', 'Carrier SLA breaches', 'Customer disputes'],
    },
  },
  dataSources: [
    {
      name: 'Order Database API',
      domain: 'database-api',
      description: 'Live order records with order-id, sku, quantity, payment-method, shipping-address, order-date, and refund-status',
      technicalNote: 'PostgreSQL backend. ~45M orders. Indexed on order-id, customer-id, order-date. Schema includes nested shipment_items and return_requests. Latency: p99 < 200ms. Rate limit: 1000 req/sec.',
      updateFrequency: 'real-time',
    },
    {
      name: 'Carrier Tracking API',
      domain: 'external-api',
      description: 'Multi-carrier tracking integration (UPS, FedEx, DHL, regional carriers). Returns tracking-number, carrier-name, delivery-eta, shipment-status, last-scan-location.',
      technicalNote: '4 carrier APIs aggregated. Data freshness: 30min-2hr depending on carrier. Fallback chain: UPS → FedEx → DHL. Field mappings standardized to our schema. Uptime: 99.2% SLA.',
      updateFrequency: 'every-30-minutes',
    },
    {
      name: 'Return & Refund Policy',
      domain: 'pure-text',
      description: 'Return windows, refund eligibility, restocking fees, exchange policies, and RMA process',
      technicalNote: 'PDF + HTML. 24 pages. Key sections: 30-day return window, 50% restocking fee for opened electronics, free returns for defects. Embedded RMA-number generation rules. Version: 3.2 (updated 2026-03-01).',
      updateFrequency: 'monthly',
    },
    {
      name: 'Product Catalog',
      domain: 'structured-data',
      description: 'Product SKU registry with warehouse-location, stock-status, hazmat-flag, and brand-fulfillment-tier',
      technicalNote: 'JSON feed updated hourly. 180K SKUs. Warehouse locations (4 regional DCs). Hazmat restrictions affect return routing. Brand-tier determines replacement priority.',
      updateFrequency: 'hourly',
    },
    {
      name: 'Customer Purchase History',
      domain: 'database-api',
      description: 'Customer profile including lifetime-value, purchase-frequency, return-rate, previous-disputes, and contact-preferences',
      technicalNote: 'Denormalized view for fast lookup. Flags high-risk patterns: serial returners, chargeback history, pattern abuse. Used for fraud detection and escalation routing.',
      updateFrequency: 'real-time',
    },
  ],
  businessSummary:
    'An order resolution agent that handles the full lifecycle of shipping issues, from real-time tracking updates to refund processing and return coordination. Resolves ~70% of common issues autonomously (tracking queries, simple refunds, return label generation) while escalating complex disputes, carrier investigations, and high-value refunds to human agents. Integrates live order data with four carrier networks and enforces refund policy guardrails.',
  technicalSummary:
    'Two-phase classification pipeline: (1) intent routing (status lookup vs. issue resolution), (2) resolution-path branching (refund vs. reship vs. return). Activates ~18 of 26 components: ingestion (order validation), routing (issue classifier), context (carrier API calls, policy lookup), execution (refund processor, label generator), output (confirmation emails, escalation tickets), and ops (fraud detection, SLA monitoring). Cross-system joins on order-id and customer-id. Real-time state model with session TTL.',
  keyRisk: 'Misrouted packages or fraudulent return claims could result in revenue loss. Agent enforces strict guardrails: refund size limits, fraud pattern detection (serial returners flagged from customer history), carrier SLA enforcement, and mandatory escalation for anomalies. High-value refunds always route through supervised review.',
  complexityProfile: {
    interactionPaths: 42,
    trustBoundaries: 3,
    integrations: 5,
    stateModel: 'stateful',
    failureModes: 4,
    latencyRequirement: 'moderate',
  },
}

// ─── Loan Underwriting Automation Agent ───────────────────────────────────

const docIntelGoal: GoalDataPayload = {
  goalStatement:
    'Build an agent that processes loan applications — collecting documents, extracting key financial data, validating eligibility, and coordinating the approval workflow.',
  decomposition: {
    primaryActions: ['Collect', 'Extract'],
    secondaryActions: ['Validate', 'Score', 'Route'],
    primaryData: ['Loan Applications', 'Credit Reports'],
    supportingData: ['Income Verification Docs', 'Property Appraisals', 'Compliance Rules'],
    reasoning:
      'Loan underwriting goal with multi-stage document collection and validation. Primary path handles application intake and document collection (completeness check). Extract pulls financial metrics (income, DTI, LTV, credit score). Validate cross-checks data consistency and regulatory compliance (Regulation B, ECOA, HMDA). Score generates risk assessment and decision recommendation. Route sends to underwriter with conditions or adverse action notice if denied. This decomposition separates collection → extraction → validation → scoring because loan decisions carry legal and fairness obligations—explicit validation before scoring prevents discriminatory outcomes.',
    trustBoundaryHints: {
      autonomous: ['Application intake', 'Document completeness check', 'Standard data extraction'],
      supervised: ['Credit analysis', 'Income verification', 'Property valuation review', 'Risk scoring'],
      escalation: ['Regulatory compliance flags', 'Fair lending concerns', 'Manual underwriting required', 'Adverse action notices'],
    },
  },
  dataSources: [
    {
      name: 'Loan Applications',
      domain: 'table-in-doc',
      description: 'Loan application forms with applicant info, loan terms, and property details',
      technicalNote: 'PDF/DOCX forms. Average 2,400 tokens per application. 8 application variants (purchase, refinance, HELOC, FHA, VA, USDA). Layout-aware parsing for form fields.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Credit Reports',
      domain: 'pure-text',
      description: 'Credit bureau reports with credit score, payment history, outstanding debt',
      technicalNote: 'Equifax/Experian/TransUnion PDF reports. 1,200 avg tokens. Includes score (300-850), accounts, derogatory marks, inquiries. Auto-pull from Credit Bureau API.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Income Verification Documents',
      domain: 'table-in-doc',
      description: 'W-2 forms, paystubs, tax returns, and bank statements for income validation',
      technicalNote: 'W-2 (PDF), paystubs (PDF), tax returns (PDF), bank statements (PDF/CSV). Average 1,800 tokens. Cross-reference for income consistency across documents.',
      updateFrequency: 'per-application',
    },
    {
      name: 'Property Appraisals',
      domain: 'pure-text',
      description: 'Appraisal reports with property value, condition, and comparable sales',
      technicalNote: 'Appraisal PDF reports. Average 3,400 tokens. Includes appraised value, property type, condition rating, flood zone, comparable sales. Used for LTV calculation.',
      updateFrequency: 'per-application',
    },
    {
      name: 'Compliance Rulebook',
      domain: 'pure-text',
      description: 'Lending regulations, fair lending guidelines, and approval/denial criteria',
      technicalNote: 'Internal policy document. Covers Regulation B (ECOA), HMDA reporting, TILA, RESPA, fair lending rules. 24,000 tokens. Hardcoded: no autonomous decision deviation.',
      updateFrequency: 'static',
    },
  ],
  businessSummary:
    'The agent collects a loan application package, extracts financial data from documents, validates income and property value, calculates key ratios (DTI, LTV), and routes to underwriter with a risk assessment. Standard approvals run automatically. Complex cases or fair lending concerns escalate for human review. Every decision is documented for HMDA/audit compliance.',
  technicalSummary:
    'Multi-stage loan processing pipeline: application intake → document collection → financial extraction → compliance validation → risk scoring → approval routing. Five data domains: table-in-doc (applications, income docs), pure text (credit reports, appraisals, compliance rules), realtime API (credit bureau feed). Validation layer enforces Regulation B and fair lending checks before scoring. Activates ~20 of 26 components including PII security (SSN, financial data), compliance checks (ECOA fairness), regulatory validation (HMDA reporting), and audit logging.',
  keyRisk: 'Loan underwriting carries regulatory and fairness obligations. Your agent validates every decision against fair lending rules before issuing approvals, flags potential discrimination (adverse action notices required), and logs all decision rationale for HMDA audit compliance.',
  complexityProfile: {
    interactionPaths: 68,
    trustBoundaries: 4,
    integrations: 5,
    stateModel: 'session',
    failureModes: 4,
    latencyRequirement: 'moderate',
  },
  complianceRequired: ['Regulation B', 'ECOA', 'HMDA', 'TILA', 'RESPA'],
}

// ─── Research & Comparison Agent ──────────────────────────────────────────

const researchGoal: GoalDataPayload = {
  goalStatement:
    'Build an agent that gathers risk data across property, liability, and claims history — then generates a ranked coverage recommendation for underwriters.',
  decomposition: {
    primaryActions: ['Assess', 'Score'],
    secondaryActions: ['Compare', 'Recommend', 'Escalate'],
    primaryData: ['Property Inspection Reports', 'Claims History Database'],
    supportingData: [
      'Risk Scoring Models',
      'Coverage Option Matrix',
      'Regulatory Requirements',
    ],
    reasoning:
      'Multi-source risk assessment for insurance underwriting. Primary path gathers property and claims data from heterogeneous sources (inspection reports, claims database, actuarial models). Assess evaluates property characteristics and loss history to compute base risk-score. Score applies actuarial models and rating factors. Compare evaluates coverage options against risk profile and regulatory requirements. Recommend generates ranked coverage alternatives with premium estimates. Escalate routes complex multi-line policies and catastrophe exposure to human underwriters. This five-phase decomposition ensures risk assessment accuracy with appropriate human oversight.',
    trustBoundaryHints: {
      autonomous: ['Property data assessment', 'Claims history retrieval', 'Standard risk-score calculation'],
      supervised: ['Complex multi-line underwriting', 'Coverage recommendation with premium estimates', 'Regulatory compliance decisions'],
      escalation: ['Catastrophe exposure or reinsurance threshold breaches', 'Incomplete inspection data', 'Regulatory edge cases'],
    },
  },
  dataSources: [
    {
      name: 'Property Inspection Reports',
      domain: 'table-in-doc',
      description: 'Property characteristics, construction class, occupancy, protection features',
      technicalNote: 'Structured forms with property attributes (year-built, square-footage, construction-type, protection-class). 2,400 avg tokens per report. Layout-aware extraction for consistent field capture across 45 carriers.',
      updateFrequency: 'on-submission',
    },
    {
      name: 'Claims History Database',
      domain: 'db-single',
      description: 'Historical loss records, claim amounts, claim types, dates, and statuses',
      technicalNote: 'Single table with 12,800 claim records across 890 properties. Includes claim-amount, loss-date, claim-type, claim-status, subrogation-recovery. Sparse historical data for new properties.',
      updateFrequency: 'daily',
    },
    {
      name: 'Actuarial Tables & Risk Models',
      domain: 'db-multi',
      description: 'Base rates, loss ratios, trend factors, and credibility-weighted models',
      technicalNote: 'Multi-table: base_rates (by construction-class, occupancy-code) × loss_ratio (by region) × trend_factor (by coverage-type). 340 base rate combinations. Credibility-weight adjustments for small datasets.',
      updateFrequency: 'quarterly',
    },
    {
      name: 'Coverage Option Matrix',
      domain: 'table-in-doc',
      description: 'Available coverage limits, deductible options, and premium modifiers',
      technicalNote: 'Spreadsheet with 28 coverage-limit options, 8 deductible tiers, 15 surcharge/discount factors. State-specific variations for 50 states. Layout-aware extraction required.',
      updateFrequency: 'static',
    },
    {
      name: 'State Regulatory & Compliance Data',
      domain: 'pure-text',
      description: 'State-specific coverage minimums, surplus-lines thresholds, and admitted-status rules',
      technicalNote: '50 state regulatory profiles with minimum coverage requirements, annual filing rules, and anti-discrimination guidelines. 3,200 avg tokens per state. Keyword extraction for compliance flags.',
      updateFrequency: 'annual',
    },
  ],
  businessSummary:
    'The agent gathers property and claims data, applies actuarial models to compute risk-scores, and generates ranked coverage recommendations with premium estimates. Risk scoring runs autonomously for standard profiles. Complex multi-line policies and catastrophe exposure route to supervised underwriter review. Regulatory compliance is checked for each state and all recommendations are evidence-backed.',
  technicalSummary:
    'Multi-source risk assessment pipeline with actuarial model synthesis. Five data domains: table-in-doc (property inspection, coverage matrix), db-single (claims history), db-multi (actuarial rates), pure-text (regulatory). Risk-score calculation applies base-rate × loss-ratio × trend-factor with credibility-weighting. Activates ~21 of 26 components including context graph (entity linking across properties and claims), claim pattern detection (loss-ratio anomalies), and regulatory compliance validation.',
  keyRisk: 'Incomplete inspection data or outdated claims history can skew risk-scores. Your agent validates all data sources, flags missing fields, cross-checks claims against loss-history patterns, and escalates non-standard risks for human judgment. Premium estimates are estimates only pending final underwriter binding decision.',
  complexityProfile: {
    interactionPaths: 91,
    trustBoundaries: 3,
    integrations: 5,
    stateModel: 'session',
    failureModes: 4,
    latencyRequirement: 'moderate',
  },
}

// ─── Decision & Workflow Agent (Healthcare Care Coordination) ─────────────────────────────

const decisionGoal: GoalDataPayload = {
  goalStatement:
    'Build a care coordination agent for a healthcare system that manages appointments across providers, referrals, insurance verification, prior authorization, emergency triage, and post-procedure follow-ups — with hard-coded clinical safety boundaries and three distinct autonomy tiers.',
  decomposition: {
    primaryActions: ['Coordinate', 'Triage'],
    secondaryActions: ['Verify', 'Refer', 'Follow-up'],
    primaryData: ['Patient Records (EHR)', 'Provider Network Directory'],
    supportingData: [
      'Insurance Verification API',
      'Clinical Guidelines',
      'Emergency Protocols',
      'Appointment System',
    ],
    reasoning:
      'Multi-domain goal spanning clinical, administrative, and emergency boundaries across healthcare providers. Primary Coordinate loop handles appointment scheduling and status queries with autonomous resolution. Triage determines severity and appropriate care level based on clinical assessment and symptoms. Verify handles insurance eligibility and prior authorization requirements. Refer routes patients to specialists while ensuring clinical appropriateness. Follow-up manages post-visit and post-procedure coordination across provider boundaries. The three-tier trust boundary (autonomous, supervised, escalation) is the core architectural decision: no clinical diagnosis or prescribing is ever autonomous.',
    trustBoundaryHints: {
      autonomous: ['Appointment availability', 'Appointment status', 'General provider information', 'Insurance eligibility checks', 'Referral status queries'],
      supervised: ['Prior authorization requests', 'Referral coordination', 'Care plan updates', 'Insurance coverage questions', 'Follow-up scheduling'],
      escalation: ['Emergency symptoms', 'Clinical decision-making', 'Medication questions', 'Discharge planning disputes', 'Complex care coordination'],
    },
  },
  dataSources: [
    {
      name: 'Patient EHR (HL7-FHIR)',
      domain: 'db-multi',
      description: 'Patient demographics, medical history, medications, allergies, care plans, and clinical notes across care settings',
      technicalNote: 'HL7 FHIR format. Multi-table join: patient + encounters + conditions + medications + allergies + care_plans. HIPAA-scoped access: provider-patient role mapping, full immutable audit trail. Agent has read-only access, never generates diagnoses or prescriptions.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Provider Network Directory',
      domain: 'api-live',
      description: 'Provider credentials (NPI), specialties, availability, network status, and accepting-new-patients indicators',
      technicalNote: 'REST API with 1-hour TTL caching for availability. Includes specialty matching, network participation status, and office hours. Write operations for referral initiation require supervision. Rate limit: 100 req/min.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Insurance Verification API',
      domain: 'api-live',
      description: 'Real-time insurance eligibility, coverage types, copays, deductibles, and prior authorization requirements',
      technicalNote: 'Real-time API integration with multiple carriers. Returns: coverage_type, copay_amount, deductible_remaining, prior_auth_required, in_network_status. Timeout handling: escalate on carrier timeout (>5s). Rate limit varies by carrier.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Clinical Guidelines',
      domain: 'pure-text',
      description: 'Evidence-based clinical pathways, contraindication rules, and best-practice recommendations',
      technicalNote: 'Structured text corpus: 247 clinical pathways. BM25 + semantic search for guideline matching by diagnosis-code and condition. Updates from medical societies quarterly.',
      updateFrequency: 'quarterly',
    },
    {
      name: 'Emergency Protocols',
      domain: 'pure-text',
      description: 'Emergency triage decision trees with severity levels and escalation procedures',
      technicalNote: '19 protocol paths with structured escalation triggers (symptom keywords + clinical indicators + severity levels). Immediate/urgent emergencies escalate via EHR alert to on-call physician. Hard-coded: no autonomous clinical decisions.',
      updateFrequency: 'static',
    },
    {
      name: 'Appointment System',
      domain: 'api-live',
      description: 'Cross-provider appointment scheduling, availability, and confirmation workflows',
      technicalNote: 'REST API with real-time slot availability. Supports scheduling across multiple EHR systems. Confirmation via SMS/email/patient portal. Rate limit: 150 req/min.',
      updateFrequency: 'realtime',
    },
  ],
  businessSummary:
    'A care coordination agent that manages the complex logistics of patient care across multiple providers and insurance plans while ensuring clinical safety at every step. The critical design decision: the agent coordinates and verifies but never makes clinical decisions autonomously. Appointment and eligibility queries run autonomously. Referrals and prior authorization get supervised handling. Clinical judgments and emergencies always route to physicians.',
  technicalSummary:
    'Multi-domain goal spanning 6 data environments: HL7-FHIR EHR with HIPAA audit, live provider directory API, real-time insurance verification, clinical guideline repository, emergency protocols, and cross-provider scheduling. Three distinct trust tiers: autonomous pipeline (appointments, eligibility), supervised pipeline (referrals, prior auth, care plans), escalation coordinator (clinical, emergency). All 26 components activated including PII security scanner, context access control, policy enforcement, and compliance monitoring.',
  keyRisk: 'Patient safety and coordinated care quality are paramount. The agent never makes clinical decisions independently. It detects clinical emergencies within seconds and routes them to physicians immediately. Every interaction with PHI is fully audited for HIPAA compliance and proper consent verification.',
  complexityProfile: {
    interactionPaths: 127,
    trustBoundaries: 4,
    integrations: 6,
    stateModel: 'multi-turn',
    failureModes: 6,
    latencyRequirement: 'strict',
  },
  complianceRequired: ['HIPAA', 'State Medical Board', 'Provider Network Agreements'],
}

// ─── SaaS Copilot Agent ───────────────────────────────────────────────────

const saasGoal: GoalDataPayload = {
  goalStatement:
    'Build an agent that monitors customer usage patterns, detects churn signals, and triggers proactive retention actions through your product.',
  decomposition: {
    primaryActions: ['Monitor', 'Detect'],
    secondaryActions: ['Score', 'Trigger', 'Escalate'],
    primaryData: ['Usage Analytics'],
    supportingData: ['Customer Health Scores', 'Support Tickets', 'Billing Data'],
    reasoning:
      'Customer success monitoring goal with real-time signal detection. Primary Monitor path ingests usage logs and computes engagement metrics (DAU, feature adoption rate, session frequency). Detect identifies churn signals: usage drop >40% vs. baseline, feature-adoption plateauing, license-utilization below threshold. Score calculates health-score (0-100) using weighted formula: engagement 40%, feature-adoption 30%, support-sentiment 20%, billing-trend 10%. Trigger activates retention actions (outreach campaigns, upsell recommendations, proactive support) based on score thresholds. Escalate routes high-churn customers to account executives when confidence is high. This decomposition separates monitoring (continuous metric collection) from detection (anomaly identification) from action (retention response) to enable independent tuning of each phase.',
    trustBoundaryHints: {
      autonomous: ['Usage metric calculation', 'Health-score computation', 'Churn-signal detection'],
      supervised: ['Retention-action triggering', 'Escalation routing', 'Customer segment analysis'],
      escalation: ['High-confidence churn predictions', 'Enterprise account at-risk', 'Multi-signal anomalies'],
    },
  },
  dataSources: [
    {
      name: 'Product Usage Logs',
      domain: 'api-live',
      description: 'Real-time event stream with user-id, feature, timestamp, and session metadata',
      technicalNote: '2.3B events/day aggregated. Event types: login, feature-use, export, collaboration, config-change. Kafka stream with 7-day retention. Latency: <1s to analytics warehouse. Indexed by user_id + timestamp.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Customer Health Scores',
      domain: 'db-single',
      description: 'Calculated health metrics with decomposition by engagement, adoption, support sentiment, and billing trend',
      technicalNote: 'Single table with 3,240 active customers. Scores updated hourly. Dimensions: engagement-score (0-100), feature-adoption % (0-100), support-health (0-100), billing-trend (positive/neutral/negative). Historical scores retained for trend analysis.',
      updateFrequency: 'hourly',
    },
    {
      name: 'Support Ticket History',
      domain: 'db-multi',
      description: 'Ticket records with sentiment, resolution time, and issue category',
      technicalNote: 'Multi-table join: tickets + sentiment_analysis + resolution_times. 34K tickets (last 180 days). Sentiment labels: positive, neutral, negative. Resolution SLA: <48hr for P1, <7d for P2. Escalation patterns identified.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Billing & Subscription Data',
      domain: 'db-single',
      description: 'Subscription tier, MRR, renewal dates, and payment history',
      technicalNote: 'Subscription table: customer_id, tier (starter/pro/enterprise), MRR, renewal_date, churn_date, expansion_flags. 3,240 active subscribers. Expansion flagged by MRR increase YoY >15%.',
      updateFrequency: 'daily',
    },
  ],
  businessSummary:
    'A customer success agent that watches usage, calculates health scores, spots churn signals early, and triggers retention actions automatically. Detects usage drop, feature-adoption plateauing, and billing concerns. Routes at-risk customers to your team before they churn.',
  technicalSummary:
    'Real-time customer health monitoring with signal detection and action triggering. Four data domains: live API (product usage event stream, <1s latency), single DB (health-score calculations, hourly refresh), multi-DB (support ticket history with sentiment), subscription data (billing trends). Monitor loop aggregates daily/weekly usage metrics. Detect phase applies churn-score formula (multi-signal weighted composite). Action routing uses score thresholds: >80 = healthy, 50-80 = at-risk (trigger outreach), <50 = critical (escalate to AE). Activates ~19 of 26 components including real-time ingestion, anomaly detection, segmentation, and action orchestration.',
  keyRisk: 'Missing churn early is costly. Your agent continuously monitors 8+ engagement signals, detects usage drops and adoption plateaus within hours, and escalates at-risk accounts to your team before they decide to leave.',
  complexityProfile: {
    interactionPaths: 68,
    trustBoundaries: 3,
    integrations: 4,
    stateModel: 'multi-turn',
    failureModes: 3,
    latencyRequirement: 'strict',
  },
}

// ─── Long-Running Ops Agent ───────────────────────────────────────────────

const opsGoal: GoalDataPayload = {
  goalStatement:
    'Build an agent that detects shipment disruptions, automatically reroutes across carriers, updates customer ETAs, and coordinates warehouse re-allocation.',
  decomposition: {
    primaryActions: ['Detect', 'Reroute'],
    secondaryActions: ['Notify', 'Rebalance', 'Escalate'],
    primaryData: ['Shipment Tracking'],
    supportingData: ['Carrier APIs', 'Warehouse Inventory', 'Customer Notifications'],
    reasoning:
      'Supply chain disruption response goal with real-time carrier coordination. Primary Detect path ingests shipment status from carrier APIs and identifies disruptions: delivery delay >24hrs, carrier network congestion, customs-clearance hold, last-mile failure. Reroute evaluates alternative carriers (cost, ETA, capacity) and automatically reroutes via cheapest compliant carrier. Notify updates customer ETAs, sends proactive SMS/email with revised delivery window. Rebalance coordinates warehouse allocation: if regional DC is constrained, shifts pending orders to nearby warehouse with stock. Escalate routes complex customs issues, damaged-goods claims, or SLA-critical shipments to logistics coordinator. This decomposition prioritizes rapid rerouting (minutes) over manual intervention.',
    trustBoundaryHints: {
      autonomous: ['Shipment status monitoring', 'ETA recalculation', 'Carrier rerouting (cost-optimal)', 'Customer notification'],
      supervised: ['Warranty/damage claims', 'Customs exception handling', 'High-value shipment rerouting'],
      escalation: ['SLA-critical delays', 'Multi-day disruptions', 'Carrier capacity exhaustion'],
    },
  },
  dataSources: [
    {
      name: 'Carrier Tracking APIs',
      domain: 'api-live',
      description: 'Real-time tracking from FedEx, UPS, DHL, regional carriers with status and geolocation',
      technicalNote: '4 carrier API integrations. Data freshness: 30min-2hr per carrier. Standardized schema: tracking-number, carrier-name, delivery-eta, shipment-status, last-scan-location, exception-flag. Fallback chain: FedEx → UPS → DHL. Uptime SLA: 99.2%.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Warehouse Management System',
      domain: 'db-single',
      description: 'Inventory levels, DC locations, stock status, and re-allocation rules',
      technicalNote: '4 regional distribution centers (US-East, US-West, EU, APAC). Real-time inventory indexed by SKU + location. Allocation rules by geography. Total capacity: 2.1M units. Cycle count hourly.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Order Management System',
      domain: 'db-multi',
      description: 'Active orders with shipment status, customer address, SLA window, and revision history',
      technicalNote: 'Multi-table join: orders + shipments + customer_addresses + sla_windows. 45K active orders. SLA windows: standard 5 days, expedited 2 days, overnight 24hrs. Revision history tracks reroutes.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Customer Notification Platform',
      domain: 'api-live',
      description: 'API for sending SMS, email, and in-app notifications with delivery confirmation',
      technicalNote: 'REST API with 3 channels: SMS (Twilio), Email (SendGrid), In-app (Firebase). Rate limit: 10K notifs/min. Delivery confirmation logged. Unsubscribe/Do-Not-Call honored.',
      updateFrequency: 'realtime',
    },
  ],
  businessSummary:
    'A supply chain agent that catches delivery disruptions, automatically picks the best alternative carrier, reroutes shipments in minutes, updates customers proactively, and rebalances warehouse allocation if needed. No manual intervention for routine disruptions.',
  technicalSummary:
    'Real-time disruption detection with carrier orchestration and inventory coordination. Four data domains: live APIs (carrier tracking + notification platform, <30min latency), single DB (warehouse inventory, hourly refresh), multi-DB (order management with shipment history and SLA windows). Detect loop polls carrier APIs and flags exceptions (delay >24hr, customs-hold, last-mile failure). Reroute phase calculates cost-optimal alternative carrier and calls carrier API to initiate reroute. Notify invokes customer notification platform with new ETA. Rebalance evaluates warehouse availability and triggers inventory transfer if needed. Activates ~20 of 26 components including real-time monitoring, optimization (route selection), multi-system coordination, and notification orchestration.',
  keyRisk: 'Disruptions cascade: one delayed shipment frustrates a customer, but multiple delays trigger refund escalation. Your agent detects delays within hours, reroutes automatically across carriers, updates customers before they complain, and escalates only when rerouting fails.',
  complexityProfile: {
    interactionPaths: 83,
    trustBoundaries: 3,
    integrations: 4,
    stateModel: 'multi-turn',
    failureModes: 5,
    latencyRequirement: 'relaxed',
  },
}

// ─── Coding & Development Agent ───────────────────────────────────────────

const codingGoal: GoalDataPayload = {
  goalStatement:
    'Build an agent that detects outages, correlates logs and metrics to diagnose root cause, and triggers automated remediation — with safe rollback.',
  decomposition: {
    primaryActions: ['Detect', 'Diagnose'],
    secondaryActions: ['Remediate', 'Rollback', 'Escalate'],
    primaryData: ['Monitoring Alerts'],
    supportingData: ['Logs', 'Metrics', 'Runbooks', 'Service Topology'],
    reasoning:
      'Incident response goal with root-cause diagnosis and safe remediation. Primary Detect path receives alerts from monitoring (PagerDuty/OpsGenie) and classifies severity (critical/high/medium). Diagnose correlates alert patterns: which services fired together, log error spikes, metric anomalies (latency/error-rate/throughput). Uses service-dependency map to infer blast radius. Remediate executes runbook steps: restart service, increase instance count, drain traffic, rollback deployment. Rollback decision uses confidence scoring: if root-cause is deployment-related (code/config change) AND rollback is low-risk, auto-rollback. If confidence is low or blast radius is high, escalate to on-call engineer. This decomposition prioritizes rapid diagnosis (< 5min to pinpoint root cause) and safe automated recovery.',
    trustBoundaryHints: {
      autonomous: ['Alert triage and classification', 'Log correlation', 'Runbook execution (low-risk)', 'Instance scaling'],
      supervised: ['Root-cause confirmation', 'Rollback decisions (high-risk)', 'Traffic rerouting'],
      escalation: ['Diagnosis inconclusive', 'Multi-service cascade failures', 'Manual investigation needed'],
    },
  },
  dataSources: [
    {
      name: 'Monitoring Alerts (PagerDuty/OpsGenie)',
      domain: 'api-live',
      description: 'Real-time alerts with severity, service, timestamp, and description',
      technicalNote: 'Webhook ingestion: avg 2-5 alerts/incident. Alert types: service-down, high-error-rate, high-latency, deployment-failure, disk-full. Severity mapping: P1=critical, P2=high, P3=medium. Alert history: 12-month retention.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Log Aggregator (Datadog/Splunk)',
      domain: 'db-multi',
      description: 'Structured logs from all services with timestamp, service-name, error-type, and stack-trace',
      technicalNote: 'Multi-table join: logs + errors + traces. 5B logs/day. Indexed by service + timestamp + error-pattern. Error classification: exception-type, http-status-code, custom-app-errors. Average query latency: 2s for 1-hour window.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Service Dependency Map',
      domain: 'db-single',
      description: 'Service topology with dependencies, deployment info, and runbook references',
      technicalNote: '47 services mapped. Dependencies: REST calls, message queue, database. Runbook URL per service. Deployment: git commit, image hash, canary %. SLA: p99 latency per service.',
      updateFrequency: 'hourly',
    },
    {
      name: 'Runbook Library',
      domain: 'pure-text',
      description: 'Step-by-step procedures for common incidents and remediation actions',
      technicalNote: '23 runbooks covering: outage response, degradation, data corruption, deployment rollback. Each runbook: 3-8 steps, approval gates for destructive actions. Average 800 tokens/runbook.',
      updateFrequency: 'static',
    },
  ],
  businessSummary:
    'An incident response agent that catches outages, quickly pinpoints root cause by correlating logs and metrics, executes remediation runbooks automatically, and safely rolls back bad deployments. For tricky problems, it escalates to your on-call engineer with full context.',
  technicalSummary:
    'Real-time incident detection with root-cause analysis and automated remediation. Four data domains: live APIs (monitoring alerts + log queries, <1s), multi-DB (log aggregation with error classification, 2s query), single DB (service topology), pure text (runbook procedures). Detect phase receives PagerDuty webhooks, classifies severity. Diagnose correlates: which services alerted together, matching error patterns in logs, metric anomalies (latency/error-rate spikes). Blast-radius calculated via service-dependency graph. Remediate executes runbook steps: low-risk actions auto-execute (restart, scale), high-risk actions (traffic drain, rollback) require confidence + approval. Activates ~21 of 26 components including anomaly detection, incident correlation, remediation execution, and escalation routing.',
  keyRisk: 'Slow incident response costs revenue: every minute of outage impacts customers. Your agent detects incidents in seconds, diagnoses root cause within 5 minutes using log correlation, and executes remediation automatically for low-risk scenarios.',
  complexityProfile: {
    interactionPaths: 94,
    trustBoundaries: 4,
    integrations: 5,
    stateModel: 'multi-turn',
    failureModes: 4,
    latencyRequirement: 'strict',
  },
}

// ─── On-Prem Secure Assistant ──────────────────────────────────────────────

const onpremGoal: GoalDataPayload = {
  goalStatement:
    'Build a predictive maintenance agent for factory equipment — local inference on sensor data, automated maintenance scheduling, no external API calls, predicting failures before they happen.',
  decomposition: {
    primaryActions: ['Analyze', 'Predict'],
    secondaryActions: ['Schedule', 'Alert', 'Escalate'],
    primaryData: ['Equipment Sensor Streams'],
    supportingData: ['Maintenance History Database', 'Spare Parts Inventory', 'Equipment Specs & Manuals'],
    reasoning:
      'Predictive maintenance goal with local edge processing. Primary Analyze path ingests real-time sensor data (vibration, temperature, pressure, motor current) from equipment without uploading to cloud. Predict applies failure prediction models trained on maintenance history to forecast bearing wear, motor failure, or anomalies within 7-day window. Schedule generates work orders and spare parts requisitions 48 hours before predicted failure window. Alert notifies maintenance technician with severity level (critical, high, medium). Escalate routes critical equipment failures or inventory shortfalls to plant engineer. This decomposition prioritizes uptime and cost avoidance: preventing unplanned downtime saves $8,000+/hour in factory production loss.',
    trustBoundaryHints: {
      autonomous: ['Sensor data collection', 'Anomaly detection', 'Low-severity alerts', 'Routine maintenance scheduling'],
      supervised: ['Medium-severity predictions', 'Critical equipment failures', 'Spare parts ordering decisions'],
      escalation: ['Critical unplanned failures', 'Inventory shortfalls', 'Equipment health scoring edge cases'],
    },
  },
  dataSources: [
    {
      name: 'Equipment Sensor Streams',
      domain: 'api-live',
      description: 'Real-time vibration, temperature, pressure, and motor current from all floor equipment',
      technicalNote: '287 equipment units. Sampling frequency: 1000 Hz (vibration), 10 Hz (temperature/pressure), 100 Hz (motor current). Data streamed via MQTT to on-premise edge gateway. Local buffer: 30-day rolling window (48 TB SSD). No cloud transmission. Latency: <500ms end-to-end.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Maintenance History Database',
      domain: 'db-multi',
      description: 'Historical maintenance records, repairs, component replacements, and failure root causes',
      technicalNote: '42,000 maintenance records over 8 years. Tables: equipment_id, failure_type, component_failed, repair_duration_hours, spare_parts_used[], cost_total, root_cause_code. Join on equipment_id to sensor data for correlation analysis. Indexed on equipment_id, failure_date, component_type. Enables failure pattern recognition.',
      updateFrequency: 'daily',
    },
    {
      name: 'Spare Parts Inventory',
      domain: 'db-single',
      description: 'Current stock levels, reorder points, lead times, and supplier information',
      technicalNote: 'Single inventory table: part_id, part_name, current_stock, reorder_point, lead_time_days, supplier_id, supplier_lead_time_days. 1,200 part types tracked. Updates every shift when parts removed/replenished. Critical parts (bearings, motors): safety stock maintained.',
      updateFrequency: 'daily',
    },
    {
      name: 'Equipment Specs & Manuals',
      domain: 'pure-text',
      description: 'Equipment specifications, operational parameters, and manufacturer maintenance recommendations',
      technicalNote: '287 equipment manuals + spec sheets (PDF format). Contains normal operating ranges (vibration threshold 7.5mm/s, temperature limit 85C). Alarm thresholds and bearing wear progression curves. Searchable via local full-text index.',
      updateFrequency: 'static',
    },
  ],
  businessSummary:
    'An intelligent maintenance agent that watches equipment sensors 24/7 and predicts failures days before they happen. It schedules preventive maintenance automatically, orders spare parts just-in-time, and alerts technicians with actionable predictions. All processing happens on-premise — zero dependency on cloud or internet.',
  technicalSummary:
    'Predictive maintenance system with edge-based anomaly detection and failure forecasting. Four data domains: live API (sensor streams via MQTT, local buffering), multi-DB (maintenance history correlation), single DB (spare parts inventory), pure text (equipment specs and thresholds). Local ML models: LSTM for time-series anomaly detection (trained on historical sensor patterns), random forest for failure probability (trained on maintenance history), and rules engine for maintenance scheduling (equipment-specific thresholds from manuals). Outputs: work-order generation (severity-based), spare-parts requisitions (with lead-time buffer), technician alerts (SMS + dashboard), and equipment-health dashboard (OEE, MTBF trending).',
  keyRisk: 'Unplanned equipment downtime costs $8,000+/hour in lost production. Your agent runs anomaly detection continuously on local sensors, flags degradation trends 48 hours early, and auto-schedules maintenance before failures occur. Worst-case: a sensor fails or spare parts are unavailable — your agent escalates to plant engineer with 7-day inventory forecast.',
  complexityProfile: {
    interactionPaths: 72,
    trustBoundaries: 4,
    integrations: 3,
    stateModel: 'continuous',
    failureModes: 5,
    latencyRequirement: 'strict',
  },
  complianceRequired: ['ISO 13373-1 (Condition Monitoring)', 'ISO 18436 (Vibration Analysis)'],
}

// ─── Multimodal Assistant ──────────────────────────────────────────────────

const multimodalGoal: GoalDataPayload = {
  goalStatement:
    'Build a content moderation agent that reviews flagged text, images, audio, and video — enforcing platform policies with cross-modal reasoning and smart escalation to human reviewers.',
  decomposition: {
    primaryActions: ['Classify', 'Score'],
    secondaryActions: ['Flag', 'Route', 'Escalate'],
    primaryData: ['Content Flag Queue'],
    supportingData: ['Platform Policy Rulebook', 'Historical Moderation Decisions', 'User Report Database'],
    reasoning:
      'Content moderation goal with policy-driven classification and escalation. Primary Classify analyzes flagged content across modalities (text hate-speech detection, image nudity/violence scoring, audio hate-speech transcription, video scene-by-scene analysis) against platform policies. Score assigns severity level (no-violation, low, medium, critical) and confidence (0-100%). Flag marks content for action if score exceeds threshold. Route directs content to appropriate action: auto-remove (critical + high confidence), queue for human review (medium confidence or policy ambiguity), or whitelist (false positive). Escalate routes edge cases and policy conflicts to trust-safety manager. This decomposition prioritizes safety and due process: false positives harm creators, but missed violations harm community.',
    trustBoundaryHints: {
      autonomous: ['Clear policy violations (high confidence)', 'CSAM detection', 'Low-confidence removals'],
      supervised: ['Medium-confidence violations', 'Contextual policy decisions (satire vs. hate)', 'Appeal reviews'],
      escalation: ['Policy conflicts', 'Unusual content (new formats)', 'Trending violation types', 'Appeal overturns'],
    },
  },
  dataSources: [
    {
      name: 'Content Flag Queue',
      domain: 'api-live',
      description: 'Real-time stream of user reports and automated pre-screening flags',
      technicalNote: 'Queue: 8,000-50,000 flags/day depending on platform size. Fields: content_id, content_type (text/image/audio/video), report_reason, reporter_user_id, timestamp, content_url. Pre-screening flags via automated classifiers (optical hash, text keyword matching, audio detection). FIFO queue, SLA: human review within 24 hours.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Platform Policy Rulebook',
      domain: 'pure-text',
      description: 'Community guidelines, prohibited content categories, and moderation escalation criteria',
      technicalNote: '47-page policy document. Categories: hate speech (9 definitions), sexual content (7 subcategories), violence (5 levels), misinformation (political/health/financial), harassment (1:1 and bullying). Edge cases: satire/parody exceptions, educational exceptions, news/journalism exceptions. Version-controlled; updated quarterly.',
      updateFrequency: 'static',
    },
    {
      name: 'Historical Moderation Decisions',
      domain: 'db-multi',
      description: 'Past moderation decisions (approve/remove/escalate) with reason codes and appeals outcomes',
      technicalNote: '2.1M moderation decisions over 3 years. Tables: moderation_id, content_id, decision (approved/removed/escalated), decision_reason_code, appeal_filed (Y/N), appeal_outcome, reviewer_id, review_duration_sec. Used to train confidence scoring and identify policy drift.',
      updateFrequency: 'daily',
    },
    {
      name: 'User Report Database',
      domain: 'db-single',
      description: 'User reporting patterns, false report rates, and reporter reliability scores',
      technicalNote: 'Single table: user_id, total_reports, false_report_count, reliability_score (0-1). Helps weight reports: trusted reporters (>0.9) get higher priority. Spammy reporters (<0.3) get lower trust. Used to optimize review queue prioritization.',
      updateFrequency: 'daily',
    },
  ],
  businessSummary:
    'A trust-and-safety agent that reviews flagged content 24/7 across all modalities — automatically removing clear policy violations while routing nuanced cases to human moderators. Learns from past decisions and improves confidence scoring. Handles appeals and trend detection.',
  technicalSummary:
    'Content moderation system with multimodal policy enforcement and escalation routing. Four data domains: live API (content flag queue, real-time ingestion), pure text (policy rulebook with edge cases), multi-DB (historical moderation decisions for pattern matching and confidence calibration), single DB (reporter reliability scoring). Classification pipeline: per-modality classifiers (text: hate-speech model + toxicity + misinformation, image: NSFW + violence + optical hash matching, audio: ASR + hate-speech model, video: frame sampling + audio analysis). Severity scoring: rule-based (policy match strength) + ML-based (confidence from historical decisions). Routing logic: auto-remove if (severity ≥ critical AND confidence > 95%) OR CSAM-detected, human queue if (severity = medium OR confidence 70-95%), whitelist if confidence < threshold. Appeal routing: trust-safety manager for reversals.',
  keyRisk: 'Every moderation decision carries risk: wrongly remove content and you harm creators; miss violations and you harm community. Your agent flags patterns with transparency (showing which policy matched), maintains >99% accuracy on clear violations, and routes edge cases to humans within 4-hour SLA. False positive rate targets <3%.',
  complexityProfile: {
    interactionPaths: 128,
    trustBoundaries: 5,
    integrations: 4,
    stateModel: 'session',
    failureModes: 6,
    latencyRequirement: 'moderate',
  },
  complianceRequired: ['GDPR Art. 17 (Right to be Forgotten)', 'DSA (Digital Services Act)', 'NetzDG (German Law)'],
}

// ─── High-Scale Consumer Chat ──────────────────────────────────────────────

const consumerGoal: GoalDataPayload = {
  goalStatement:
    'Build an employee support agent that answers HR policy questions, processes benefits inquiries, and handles PTO requests at scale with personalized, policy-compliant responses.',
  decomposition: {
    primaryActions: ['Answer', 'Process'],
    secondaryActions: ['Calculate', 'Lookup', 'Escalate'],
    primaryData: ['Employee Queries'],
    supportingData: ['Employee Handbook & Policy Documents', 'HRIS Database', 'Benefits Portal', 'Payroll System'],
    reasoning:
      'High-scale HR employee support goal with policy guardrails and calculation accuracy. Primary Answer path resolves employee questions (PTO balance, benefits enrollment, leave policies, payroll questions, org structure). Process handles discrete requests: PTO requests (validate balance, calculate accrual, submit for approval), benefits enrollment (select plans, calculate premiums, submit elections), expense reimbursement (validate receipt, submit claim). Calculate computes PTO accrual (state-by-state laws vary), benefits cost impact (pre-tax vs. post-tax), leave calculations (sick/personal/floating). Lookup retrieves from HRIS (org chart, manager assignments, compensation band), benefits portal (plan options, rates), and handbook (policies). Escalate routes to HR business partner for exceptions (unusual leave types, compensation disputes, discrimination concerns). This decomposition prioritizes accuracy and compliance over speed: a policy error costs more than a delayed response.',
    trustBoundaryHints: {
      autonomous: ['Policy lookups', 'FAQ answers', 'PTO balance checks', 'Handbook searches'],
      supervised: ['PTO requests', 'Benefit plan elections', 'Expense submissions', 'Leave calculations'],
      escalation: ['Policy exceptions', 'Payroll disputes', 'Compensation questions', 'Potential discrimination concerns'],
    },
  },
  dataSources: [
    {
      name: 'Employee Handbook & Policy Documents',
      domain: 'pure-text',
      description: 'HR policies, leave guidelines, benefits summary, onboarding checklist, and company handbook',
      technicalNote: '180-page handbook + 40 policy documents (PDF + HTML). Topics: PTO accrual (varies by tenure and state), sick leave, parental leave, sabbatical rules, benefits eligibility, open enrollment calendar, compensation philosophy, performance review process. State-specific sections (CA, NY, TX leave laws). Version-controlled; updated annually.',
      updateFrequency: 'static',
    },
    {
      name: 'HRIS Database (Workday/BambooHR)',
      domain: 'db-multi',
      description: 'Employee records, organizational structure, manager assignments, compensation bands, and tenure',
      technicalNote: '24,000 employee records. Tables: employee_id, first_name, last_name, hire_date, job_title, department, manager_id, employment_status, comp_band, office_location, state_of_employment. Used for org chart lookup and policy application (e.g., maternity leave depends on tenure). Daily sync from HRIS system.',
      updateFrequency: 'daily',
    },
    {
      name: 'Benefits Portal Data',
      domain: 'db-single',
      description: 'Benefit plan options, enrollment status, premiums, and coverage details',
      technicalNote: 'Single benefits table: employee_id, plan_election_year, medical_plan_id, dental_plan_id, vision_plan_id, fsa_elected, hsa_elected, life_insurance_amount, enrollment_status. 15 medical plan options, 6 dental, 4 vision. Premiums tier by salary band. Open enrollment: annually Jan 1-31.',
      updateFrequency: 'daily',
    },
    {
      name: 'Payroll System',
      domain: 'api-live',
      description: 'Real-time payroll data, tax withholding, YTD earnings, and deduction details',
      technicalNote: 'API access to payroll system (ADP/Guidepoint). Fields: employee_id, ytd_gross, ytd_taxes, current_deductions, next_paycheck_date, pay_frequency (bi-weekly/monthly). Tax withholding varies by state and W-4 elections. Latency: <500ms for employee lookup.',
      updateFrequency: 'realtime',
    },
  ],
  businessSummary:
    'An HR support agent that resolves employee questions instantly — from "How much PTO do I have?" to "When is open enrollment?" to "Can I take parental leave?". It handles PTO requests, benefits enrollment, and payroll questions while ensuring compliance with state employment laws and company policy.',
  technicalSummary:
    'Employee support system with policy compliance and calculation accuracy. Four data domains: pure text (handbook + policy documents, full-text searchable), multi-DB (HRIS for employee records and org structure), single DB (benefits enrollment and plan data), live API (payroll data for earnings/deductions). Answer pipeline: policy lookup (handbook search), personalization (employee details from HRIS), and response generation with policy citations. Process pipeline: request parsing (intent classification), validation (eligibility check against policy + HRIS), calculation (PTO accrual, benefits cost, leave math), submission (workflow routing to approver). Routing: simple FAQ answers → immediate response, PTO requests → manager approval workflow, benefits enrollment → portal submission, payroll questions → payroll system lookup or escalation. Compliance: auditable decisions (cite policy), state law enforcement (CA/NY/TX leave rules), disability accommodation tracking.',
  keyRisk: 'Incorrect HR advice creates legal liability (wrongful termination claims, FMLA violations, discrimination). Your agent cites policy for every response, validates against HRIS and handbook before processing requests, calculates leave correctly per state law, and escalates edge cases to HR business partner within SLA (4 hours for sensitive issues).',
  complexityProfile: {
    interactionPaths: 84,
    trustBoundaries: 4,
    integrations: 4,
    stateModel: 'session',
    failureModes: 5,
    latencyRequirement: 'moderate',
  },
  complianceRequired: ['FMLA', 'ADA', 'EEOC Title VII', 'State Employment Law (CA, NY, TX)'],
}

// ─── Lookup Map ───────────────────────────────────────────────────────────

const goalDataMap: Record<string, GoalDataPayload> = {
  'faq-knowledge': faqGoal,
  'doc-intelligence': docIntelGoal,
  'research-comparison': researchGoal,
  'decision-workflow': decisionGoal,
  'saas-copilot': saasGoal,
  'ops-agent': opsGoal,
  'coding-agent': codingGoal,
  'onprem-assistant': onpremGoal,
  'multimodal-agent': multimodalGoal,
  'consumer-chat': consumerGoal,
}

export function getGoalData(tileId: string): GoalDataPayload | null {
  return goalDataMap[tileId] ?? null
}
