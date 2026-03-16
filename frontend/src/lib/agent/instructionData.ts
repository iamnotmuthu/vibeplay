import type { InstructionStep } from '@/store/agentTypes'

// ─── Per-Tile Instruction Data ──────────────────────────────────────────
// Covers all 10 tiles: 4 original (FAQ, Doc Intelligence, Research, Dental)
// plus 6 new (SaaS Copilot, Ops Agent, Coding Agent, On-Prem Assistant,
// Multimodal Agent, Consumer Chat). Each tile has a variable number of
// instruction steps based on genuine workflow complexity.
// Business mode sees label + description.
// Technical mode also sees dataSource, retrievalType, toolInvocation,
// routingRule, errorHandling, escalationCondition.
// Note: Step counts vary by use case (simple ≈ 6-8, complex ≈ 8-10)
// to reflect genuine workflow differences, not template padding.

export interface InstructionSetPayload {
  steps: InstructionStep[]
  businessSummary: string
  technicalSummary: string
}

// ─── FAQ & Knowledge Agent ──────────────────────────────────────────────

const FAQ_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering order intake, tracking lookup, issue diagnosis, resolution routing, and confirmation. Designed to resolve ~70% of order issues autonomously (tracking updates, simple refunds under $250, return labels within 30-day window) — escalates carrier investigations, high-value refunds, and fraud cases to tier-2. Target: median resolution time under 5 minutes.',
  technicalSummary:
    'Instruction graph with real-time order lookup (Order DB API), multi-carrier tracking aggregation, and issue-type classifier branching to refund/reship/return workflows. Confidence threshold gate at step 4: autonomous ≥0.85, supervised 0.70-0.84, escalate <0.70. Fraud detection triggers hard escalation. Stateful with session TTL 30 minutes. Estimated p95 latency: 2.5s for tracking-only, 4.8s with carrier investigation.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Order Inquiry',
      description:
        'Capture the customer message and identify the order reference (order-id, tracking-number, or customer email). Normalize and classify the issue type.',
      technicalDetail:
        'Input normalization via regex. Intent classifier detects issue category: tracking, refund, return, damage, lost-package. Zero-shot ~50ms. Outputs: cleaned_query, detected_issue_type, order_reference, language_code.',
      dataSource: 'Inbound message queue',
      retrievalType: 'none',
      toolInvocation: 'input-validator → issue-classifier',
      errorHandling: 'If order-id not found, ask for alternative identifier (tracking-number or email). If issue type unclear, ask clarifying question.',
    },
    {
      stepNumber: 2,
      label: 'Identify Order',
      description:
        'Look up the order in the database using order-id, customer-id, or recent purchases. Retrieve order metadata: SKU, quantity, payment-method, order-date, shipping-address, return-window-status.',
      technicalDetail:
        'Query Orders_Database.api by order-id (primary) or customer-id + date-range (fallback). Return full order object including shipment_items array. Latency p99 < 200ms. If not found, suggest email/support alternative.',
      dataSource: 'Orders_Database.api',
      retrievalType: 'database-lookup',
      toolInvocation: 'order-lookup-api',
      errorHandling: 'If order not found after 2 attempts, escalate to human with customer context. If API timeout, retry once then escalate.',
    },
    {
      stepNumber: 3,
      label: 'Check Current Status',
      description:
        'Query carrier tracking API for live shipment status. Return tracking-number, carrier-name, delivery-eta, shipment-status, last-scan-location, and any exception messages.',
      technicalDetail:
        'Call Carrier_Tracking.api (multi-carrier aggregation: UPS, FedEx, DHL, regional). Top-5 carriers checked. Data freshness 30min-2hr depending on carrier. If stale >24h or missing, flag for investigation.',
      dataSource: 'Carrier_Tracking.api',
      retrievalType: 'external-api',
      toolInvocation: 'carrier-tracking-api',
      errorHandling: 'If tracking missing: check order DB for partial shipments (split orders). If found, return partial tracking status. If not, escalate to carrier investigation at step 6.',
    },
    {
      stepNumber: 4,
      label: 'Diagnose Issue Type',
      description:
        'Determine the root cause: on-time delivery, delayed, lost-package, damaged, wrong-item, missing-item, or delivery-failure. Match to resolution path.',
      technicalDetail:
        'Confidence scoring: compare tracking-status vs. expected-eta, check for exception-flags, validate against order-date (within return-window?). Scoring logic: on-time (0.95+), delayed 1-3 days (0.70), delayed >3 days (flag SLA breach, confidence 0.45), lost (0.30), damage-claim (0.40), fraud-signal (0.20).',
      routingRule: 'confidence ≥ 0.85 → autonomous resolution | 0.70-0.84 → supervised | < 0.70 → escalate OR fraud-detected → escalate immediately',
      escalationCondition: 'Fraud signal detected (serial returner, conflicting evidence) OR confidence < 0.70 OR SLA breach',
    },
    {
      stepNumber: 5,
      label: 'Determine Resolution Path',
      description:
        'Route to appropriate resolution: (A) Tracking update only, (B) Process refund, (C) Generate return label, (D) Initiate replacement, or (E) Escalate for investigation.',
      technicalDetail:
        'Decision tree: (A) if tracking found and on-time → send update + offer return label if in window. (B) if damage/wrong-item + in return-window → offer refund (autonomous <$250, supervised ≥$250). (C) if customer-initiated return in window → generate return label + RMA. (D) if damage confirmed → process replacement with return coordination. (E) if lost/missing-tracking/fraud-signal → escalate to tier-2.',
      toolInvocation: 'issue-router (branches to steps 6A-6E)',
      errorHandling: 'If multiple paths possible, ask customer for preference (refund vs. replacement vs. return).',
    },
    {
      stepNumber: 6,
      label: 'Execute Resolution',
      description:
        'Process the chosen action: send tracking update, process refund, generate return label, coordinate replacement, or open carrier investigation.',
      technicalDetail:
        'Branch (6A): Send formatted tracking response. Branch (6B): Call refund-processor. If amount <$250 and no fraud flags → autonomous refund. If ≥$250 → pending supervisor approval + create escalation ticket. Branch (6C): Call return-label-generator with return-window validation. If outside 30 days → block + offer alternative. Branch (6D): Initiate replacement shipment + create return coordination ticket. Branch (6E): Open carrier investigation + escalation ticket. Create ticket with full context bundle (order, customer history, tracking anomalies).',
      toolInvocation: 'refund-processor | return-label-generator | replacement-coordinator | escalation-router',
      errorHandling: 'If refund processor timeout, queue for async processing. If label generation fails, offer manual return process. If all fail, escalate.',
    },
    {
      stepNumber: 7,
      label: 'Confirm with Customer',
      description:
        'Send confirmation message with resolution details, next steps, and set expectations for timeline.',
      technicalDetail:
        'Response templates by resolution type: (A) "Your order is on track. ETA: [delivery-eta]. Click here to return." (B) "Refund approved: [amount]. Credit timeline: 3-5 business days. Confirmation #[refund-id]." (C) "Return label generated. RMA #[rma-id]. Label attached. Free return shipping included." (D) "Replacement shipped today via [carrier]. New tracking: [tracking-number]." (E) "Your case has been escalated to our specialist team. They will follow up within 24 hours. Ticket #[ticket-id]."',
      toolInvocation: 'response-formatter',
      errorHandling: 'If template not found, send plain-text confirmation with key details (refund amount, tracking, RMA, or ticket number).',
    },
    {
      stepNumber: 8,
      label: 'Follow-Up & Log',
      description:
        'Record resolution outcome, log interaction for analytics, and trigger follow-up check (satisfaction or status update).',
      technicalDetail:
        'Write interaction record: order-id, customer-id, issue-type, resolved-at (timestamp), resolution-path, resolution-status (success/partial/escalated), confidence-score, duration-ms. Trigger satisfaction survey via webhook if autonomous resolution. For refunds ≥$250 or escalations, schedule tier-2 follow-up within 24h. Session TTL: 30 minutes. Archive conversation for audit trail.',
      toolInvocation: 'interaction-logger → satisfaction-survey-trigger OR escalation-tracker',
      errorHandling: 'If logging fails, retry async. Do not block customer response.',
    },
  ],
}

// ─── Document Intelligence Agent ────────────────────────────────────────

const DOC_INTEL_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering application intake, document collection, financial data extraction, compliance validation, risk scoring, and decision routing. Handles purchase mortgages, refinances, HELOCs, and home equity loans. Standard applications auto-route with condition lists. Complex cases escalate to underwriter. All decisions logged for HMDA audit compliance.',
  technicalSummary:
    'Instruction graph with sequential path: application intake → document collection → financial extraction → compliance validation → risk scoring → decision routing → adverse action generation. Uses form-field parsing for applications, credit bureau API for credit reports, income-doc cross-reference for consistency validation. Compliance layer enforces Regulation B fair lending checks at step 4. Estimated p95 latency: 6.4s for standard approval, 12.8s with compliance validation.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Application',
      description:
        'Accept incoming loan application package with applicant info, loan terms, and property details.',
      technicalDetail:
        'Form parsing for application PDF. Detect application type (purchase, refinance, HELOC, FHA, VA, USDA). Extract applicant name, SSN, loan amount, property address. Max file size: 20MB. Outputs: applicant_data, loan_details, property_info.',
      dataSource: 'Application upload endpoint',
      retrievalType: 'extractive',
      toolInvocation: 'form-parser → field-extractor',
      errorHandling: 'Missing critical fields → reject with specific error. Corrupt application → request resubmission. Invalid loan type → escalate to loan officer.',
    },
    {
      stepNumber: 2,
      label: 'Verify Documents',
      description:
        'Check completeness of required documentation package: credit report request, income verification docs, property appraisal.',
      technicalDetail:
        'Checklist validation: credit report (required, realtime), W-2 (2 years), paystubs (recent 30 days), appraisal (required for purchase), ID verification. Flag missing or outdated documents. Generate document checklist for borrower.',
      toolInvocation: 'document-validator → checklist-generator',
      routingRule: 'all required docs present → proceed | missing docs → request with deadline | docs > 120 days old → request update',
      errorHandling: 'If critical docs missing, place application on hold and notify borrower of requirements.',
    },
    {
      stepNumber: 3,
      label: 'Pull Credit Report',
      description:
        'Query credit bureau API to retrieve applicant credit report, score, and payment history.',
      technicalDetail:
        'Credit Bureau API call (Equifax/Experian/TransUnion). Extract: credit score (300-850 range), payment history (past 24 months), accounts, derogatory marks, inquiries, public records. Realtime pull. Timeout handling.',
      dataSource: 'Credit Bureau API (Experian primary, fallback to Equifax)',
      retrievalType: 'api-live',
      toolInvocation: 'credit-api-client',
      errorHandling: 'API timeout → retry 2x with exponential backoff. SSN not found → escalate to underwriter. Fraud flag → immediate escalation.',
    },
    {
      stepNumber: 4,
      label: 'Validate Income',
      description:
        'Cross-reference W-2, paystubs, tax returns, and bank statements to verify stated income and calculate gross monthly income.',
      technicalDetail:
        'Multi-document income validation: W-2 (last 2 years) vs. paystubs (YTD calculation) vs. tax returns vs. bank statement deposits. Variance tolerance: ±10%. Flag inconsistencies. For self-employed: require 2-year tax returns + YTD profit/loss statement. Commission income requires 2-year history.',
      dataSource: 'Income verification documents',
      retrievalType: 'multi-document-cross-reference',
      toolInvocation: 'income-validator → consistency-checker',
      errorHandling: 'Income conflict > 10% variance → escalate for manual review. Insufficient documentation → request additional docs. Self-employed without 2-year history → manual underwriting required.',
    },
    {
      stepNumber: 5,
      label: 'Assess Property',
      description:
        'Extract property value, condition, and comparable sales from appraisal. Calculate LTV (loan-to-value) ratio.',
      technicalDetail:
        'Appraisal parsing: extract appraised value, property type (single-family, condo, multi-family), condition rating (excellent to poor), comparable sales (min 3 comps), flood zone, zoning. Calculate LTV = loan_amount / appraised_value. LTV thresholds: ≤80% (standard), 80-95% (caution), >95% (PMI required).',
      dataSource: 'Property appraisal report',
      retrievalType: 'extractive',
      toolInvocation: 'appraisal-parser → ltv-calculator',
      errorHandling: 'Appraisal > 120 days old → request updated appraisal. Value conflicts (lower than purchase price) → escalate for review. Flood zone flagged → insurance verification required.',
    },
    {
      stepNumber: 6,
      label: 'Calculate Ratios',
      description:
        'Compute debt-to-income (DTI) ratio, housing expense ratio, and other key underwriting metrics.',
      technicalDetail:
        'DTI = total monthly debt payments / gross monthly income. Components: housing payment (PITI + insurance + HOA), all other debts (auto, credit card, student loans, personal loans). Housing ratio = housing payment / gross income. Target DTI ≤ 43%, housing ratio ≤ 28%. Flag applications exceeding guidelines.',
      dataSource: 'Verified income (step 4) + extracted debts + proposed loan payment',
      retrievalType: 'calculated',
      toolInvocation: 'ratio-calculator',
      errorHandling: 'DTI > 50% → manual underwriting required. Ratio calculation errors → recalculate with auditor review.',
    },
    {
      stepNumber: 7,
      label: 'Generate Decision',
      description:
        'Synthesize credit score, DTI, LTV, and income verification into approval/conditional/denial recommendation with rationale.',
      technicalDetail:
        'Decision logic: credit score ≥ 680 AND DTI ≤ 43% AND LTV ≤ 80% AND income verified → Eligible for Approval. Conditions applied for: marginal scores (660-679), DTI 43-50%, LTV 80-95%, missing minor docs. Denial criteria: score < 620 OR DTI > 50% OR fraud indicators OR regulatory violations.',
      dataSource: 'All prior steps (credit, income, property, compliance)',
      retrievalType: 'synthesized',
      toolInvocation: 'decision-engine → conditions-generator',
      errorHandling: 'Complex profile (self-employed, non-traditional credit) → flag for manual underwriting. Fair lending concern detected → escalate to compliance.',
    },
    {
      stepNumber: 8,
      label: 'Route for Action',
      description:
        'Send application to underwriter with recommendation, conditions list, and adverse action notice if applicable. Log all decisions for HMDA reporting.',
      technicalDetail:
        'Routing: Approved → file in system. Conditional → send conditions checklist to borrower; set 15-day deadline. Denied → generate adverse action notice per FCRA (specific reasons for denial). Manual UW flag → queue for underwriter review. Escalate: fair lending flag → compliance officer, fraud → fraud department.',
      toolInvocation: 'application-router → adverse-action-generator → notification-sender',
      routingRule: 'approved | conditional-with-checklist | denied-with-adverse-action | manual-underwriting-required | compliance-escalation',
    },
  ],
}

// ─── Research & Comparison Agent ────────────────────────────────────────

const RESEARCH_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering insurance underwriting: submission intake, property inspection, claims history review, risk-score calculation, regulatory compliance, premium calculation, coverage recommendation, and underwriter binding decision. Processes property applications end-to-end. All coverage recommendations and binding decisions require human underwriter approval — no autonomous policy issuance.',
  technicalSummary:
    'Instruction graph with property data extraction, claims aggregation, actuarial model application, and coverage recommendation synthesis. Risk-score calculation applies base-rate × loss-ratio × trend-factor with credibility-weighting. Regulatory compliance check validates state-specific coverage minimums. Escalation path for catastrophe exposure and multi-line policies. Estimated p95 latency: 3s standard assessment, 12s complex underwriting.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Submission',
      description:
        'Accept insurance application with property details, applicant information, and submission method (broker, direct, renewal).',
      technicalDetail:
        'Intake validation: application_id, property-type, construction-class, occupancy-code, insurable-value, applicant_name, submission_channel. Validates required fields. Checks for duplicate submissions. Ingests property inspection attachment (PDF).',
      dataSource: 'Application portal + attachments',
      retrievalType: 'form-input',
      toolInvocation: 'form-validator → duplicate-checker → document-classifier',
      errorHandling: 'If required fields missing, request clarification. If property-type unrecognized, escalate to underwriter for manual classification.',
    },
    {
      stepNumber: 2,
      label: 'Inspect Property Data',
      description:
        'Extract property attributes from inspection reports: construction-class, protection-class, year-built, square-footage, occupancy details.',
      technicalDetail:
        'Property data extraction: key_entities = [property-type, construction-class, occupancy-code, protection-class, year-built]. Reads inspection PDF and normalizes values to standard lookup tables. Flags missing critical attributes.',
      dataSource: 'Property_Inspection_Report.pdf',
      retrievalType: 'document-extraction',
      toolInvocation: 'property-data-api → attribute-normalizer',
      errorHandling: 'If > 25% of attributes missing, flag as "incomplete inspection" and request re-inspection before proceeding.',
    },
    {
      stepNumber: 3,
      label: 'Pull Claims History',
      description:
        'Query claims database for loss history: claim-amounts, claim-types, loss-dates, claim-status, subrogation-recovery.',
      technicalDetail:
        'Claims database query: SELECT * WHERE property-id = ? OR address-match(?) OR occupancy-code = ?. Calculates claims-frequency (# claims / years on file) and average-claim-amount. Flags high-frequency or severity outliers.',
      dataSource: 'Claims_History_Export.csv',
      retrievalType: 'database-query',
      toolInvocation: 'claims-database-query → frequency-calculator → pattern-detector',
      errorHandling: 'If no claims found for new property, default frequency = 0. If claims-frequency > 0.4/year, flag for underwriter review.',
    },
    {
      stepNumber: 4,
      label: 'Run Risk Models',
      description:
        'Apply actuarial models to compute base risk-score: base-rate × loss-ratio × trend-factor × credibility-weight.',
      technicalDetail:
        'Risk model: base-rate (from Actuarial_Tables_2025.xlsx, keyed by construction-class + occupancy-code) × loss-ratio (region-specific) × trend-factor (3-year prior trend) × credibility-weight (0.0-1.0 based on data completeness). Output: risk-score (0-100), confidence-interval.',
      dataSource: 'Actuarial_Tables_2025.xlsx + property-data + claims-history',
      retrievalType: 'actuarial-calculation',
      toolInvocation: 'risk-model-engine → confidence-calculator',
      escalationCondition: 'If confidence-interval > 25 points, flag as "high uncertainty" and escalate to actuary.',
    },
    {
      stepNumber: 5,
      label: 'Check Regulatory Requirements',
      description:
        'Verify state-specific coverage minimums and admission status requirements.',
      technicalDetail:
        'State validation: lookup state_code → check coverage-limit minimums, deductible constraints, surplus-lines thresholds, admitted-status rules. Validates proposed coverage against state-specific Regulatory Requirements.',
      dataSource: 'State_Coverage_Requirements.pdf',
      retrievalType: 'regulatory-lookup',
      toolInvocation: 'regulatory-compliance-check',
      errorHandling: 'If proposed coverage violates state minimums, flag as "non-compliant" and escalate to compliance officer.',
    },
    {
      stepNumber: 6,
      label: 'Calculate Premium',
      description:
        'Apply rating factors, discounts, and surcharges to compute annual premium estimate.',
      technicalDetail:
        'Premium calc: base-premium (insurable-value × rate-per-$100) × rating-factors (occupancy-modifier, protection-class-discount, bundling-discount) + surcharges (high-hazard, catastrophe-zone). Output: annual-premium, breakdown by factor.',
      dataSource: 'Risk-score + coverage-limits + rating-factor-tables',
      retrievalType: 'actuarial-calculation',
      toolInvocation: 'risk-model-engine → premium-calculator',
      errorHandling: 'If premium exceeds carrier appetite, flag for underwriter decision on acceptance.',
    },
    {
      stepNumber: 7,
      label: 'Generate Recommendation',
      description:
        'Produce coverage recommendation with alternatives: primary recommendation, lower-cost alternative, higher-coverage alternative.',
      technicalDetail:
        'Recommendation engine: generates 3 coverage options (Conservative/Standard/Comprehensive) with premiums and trade-offs. Includes narrative: "Recommended coverage optimizes premium vs. protection for this risk profile." Flags any non-standard features (e.g., high deductible, limited coverage).',
      dataSource: 'Risk-score + coverage-matrix + premiums',
      retrievalType: 'recommendation-synthesis',
      toolInvocation: 'coverage-calculator → recommendation-engine',
      escalationCondition: 'If applicant is high-net-worth or unusual risk profile, escalate to senior underwriter for custom recommendation.',
    },
    {
      stepNumber: 8,
      label: 'Route for Decision',
      description:
        'Send complete underwriting assessment to human underwriter for binding decision. No autonomous policy issuance.',
      technicalDetail:
        'Underwriting summary package: Risk Assessment Score, Premium Estimate, Coverage Recommendation, Loss Projection, Compliance Checklist, all supporting data. Routes to: standard-risk → underwriter dashboard | complex-risk → senior-underwriter | catastrophe-exposure → loss-control review.',
      routingRule: 'Standard profile (risk-score 25-75, no red-flags) → standard underwriter | Complex (multi-line, incomplete data, trend violation) → senior underwriter | Catastrophe/compliance issue → escalation committee',
      escalationCondition: 'Catastrophe exposure, missing data, regulatory edge-case, or underwriter dispute → escalate to claims/compliance/risk-management.',
      toolInvocation: 'risk-router → underwriter-notification → sla-tracker',
    },
  ],
}

// ─── Decision & Workflow Agent (Care Coordination) ───────────────────────────

const DENTAL_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Nine steps covering patient inquiry intake, emergency triage, insurance verification, referral management, appointment scheduling, care coordination, and follow-up management. Handles appointment and eligibility queries autonomously (~65% of interactions). Clinical decisions always route to physicians — zero autonomous diagnosis or prescribing. Emergency classification in < 5 seconds.',
  technicalSummary:
    'Multi-branch instruction graph with clinical decision paths, HIPAA-compliant data handling (AES-256 at rest, TLS 1.3 in transit), and mandatory escalation for clinical judgment calls. Three parallel execution lanes: administrative (autonomous), clinical-adjacent (supervised), clinical (escalation-only). All PHI access logged to immutable audit trail with HL7-FHIR interoperability. Estimated p95 latency: 2.2s admin, 8.8s clinical-adjacent.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Patient Request',
      description:
        'Capture the patient message, identify them, and determine whether this is an appointment/insurance request, a clinical question, or an emergency.',
      technicalDetail:
        'Intent classification across 3 lanes: administrative (appointment scheduling, insurance verification, eligibility), clinical-adjacent (referral questions, follow-up coordination, care plan inquiries), clinical-emergency (symptoms, acute conditions, emergencies). Patient identification via patient-id or phone number lookup against EHR. HIPAA: no PHI in logs until identity confirmed.',
      dataSource: 'Inbound message + patient EHR directory',
      retrievalType: 'lookup',
      toolInvocation: 'intent-classifier → patient-identifier → ehr-lookup',
      errorHandling: 'Unidentified patient → proceed with limited scope (general info only, no PHI access, patient_id=null in audit log). Emergency keywords detected → skip to step 2 immediately regardless of identification status.',
    },
    {
      stepNumber: 2,
      label: 'Emergency Triage (if indicated)',
      description:
        'If emergency indicators are detected, immediately classify severity level and route to appropriate care. Agent provides only comfort guidance, never diagnoses or prescribes.',
      technicalDetail:
        'Emergency classifier: 4 severity levels (immediate/urgent/semi-urgent/non-urgent) based on symptom keywords + clinical flags + vital signs if available. Immediate/urgent: page on-call physician within 30 seconds (SLA < 5s classification). Semi-urgent: schedule same-day nurse callback. All emergencies logged with full transcript for clinical review.',
      routingRule: 'immediate/urgent → on-call physician notification | semi-urgent → same-day callback | non-urgent → continue normal routing',
      escalationCondition: 'ALL emergencies escalate. Agent provides only pre-approved comfort guidance (e.g., "Keep the area clean, avoid strenuous activity") — never clinical advice.',
      toolInvocation: 'emergency-classifier → physician-pager → care-team-notification',
    },
    {
      stepNumber: 3,
      label: 'Route by Domain',
      description:
        'Send the request down the right path — appointments go to scheduling, insurance goes to verification engine, referrals go to referral router, clinical matters go to physicians.',
      technicalDetail:
        'Routing matrix: intent_category × patient_status × urgency → execution_lane. Administrative lane: autonomous execution with audit log. Clinical-adjacent lane: supervised with care coordinator or physician notification. Clinical lane: immediate escalation with full context.',
      routingRule: 'appointment/eligibility → autonomous | referral/care-coordination → supervised | clinical decision/diagnosis → escalate | emergency → step 2',
      errorHandling: 'If routing matrix returns ambiguous lane, default to most restrictive (supervised > autonomous, escalation > supervised).',
    },
    {
      stepNumber: 4,
      label: 'Verify Patient Identity & Consent',
      description:
        'Confirm patient identity and verify consent before accessing or sharing any health information or initiating referrals.',
      technicalDetail:
        'Identity verification: patient-id + date-of-birth OR phone + last-four-SSN. Consent check: verify patient has authorized information exchange for this request. PHI minimization: share only minimum necessary data. All consent checks logged for HIPAA audit trail.',
      dataSource: 'Patient EHR + consent records',
      retrievalType: 'lookup',
      toolInvocation: 'identity-verifier → consent-checker → phi-minimizer',
      errorHandling: 'Identity verification failed → escalate to care coordinator for manual verification. Consent not found → cannot proceed with information sharing.',
    },
    {
      stepNumber: 5,
      label: 'Execute Administrative Workflow',
      description:
        'For appointment requests: check cross-provider availability and schedule. For insurance: verify real-time eligibility and prior authorization. For referrals: match appropriate specialist and initiate coordination.',
      technicalDetail:
        'Administrative tools: scheduling-api (real-time availability, ~1.5s), insurance-verifier (eligibility + prior-auth check, ~2s), referral-router (specialty matching + prior-auth screening). All data access logged. Write operations (scheduling, referral submission) require confirmation step.',
      dataSource: 'EHR + Provider Network API + Insurance Verification API + Scheduling System',
      retrievalType: 'multi-source',
      toolInvocation: 'scheduling-engine | insurance-api | referral-router | clinical-guidelines-matcher',
    },
    {
      stepNumber: 6,
      label: 'Supervised Clinical-Adjacent Workflows',
      description:
        'For care coordination, post-visit follow-up, and referral management: prepare response with care coordinator or physician notification required before sending.',
      technicalDetail:
        'Clinical-adjacent tools: care-plan-reader (read-only), follow-up-scheduler, discharge-planner. All responses reviewed by care coordinator or physician (SLA 30 min for supervised). Templates prevent autonomous clinical content generation.',
      dataSource: 'EHR + clinical guidelines + follow-up templates',
      retrievalType: 'multi-source',
      toolInvocation: 'care-plan-reader → template-generator → care-coordinator-notification',
    },
    {
      stepNumber: 7,
      label: 'Confidence & Scope Gate',
      description:
        'Before sending any response, verify that the answer is within authorized scope. Administrative responses send directly. Clinical or uncertain responses require care coordinator or physician review.',
      technicalDetail:
        'Scope validator checks response against authorized-response-registry. Three gates: (1) Is topic in autonomous list? (2) Does response contain clinical content not from approved template? (3) Is patient flagged for physician-only communication? Gate failures trigger supervised or escalation mode.',
      routingRule: 'all gates pass → autonomous send | gate failure → supervised review | clinical content → escalate to physician',
      errorHandling: 'Unknown category → default to supervised mode and log for policy expansion.',
    },
    {
      stepNumber: 8,
      label: 'Send Response & Confirmation',
      description:
        'Deliver response through patient\'s preferred channel with all relevant details and next steps. Obtain confirmation for critical actions.',
      technicalDetail:
        'Channel selection from patient preferences (portal 45%, SMS 35%, email 15%, phone 5%). Response includes: answer body, action items, confirmation request (if critical), relevant links. For scheduling/referral: send confirmation to patient AND all involved providers. Confirmation SLA: < 60 seconds.',
      toolInvocation: 'channel-selector → message-sender → confirmation-tracker',
      errorHandling: 'Preferred channel fails → retry alternate channels. If all fail → queue for manual care coordinator outreach.',
    },
    {
      stepNumber: 9,
      label: 'Care Coordination & Follow-Up',
      description:
        'Schedule and track follow-ups: appointment reminders, post-visit check-ins, medication reconciliation, care plan updates, and cross-provider coordination.',
      technicalDetail:
        'Follow-up rule engine: 18 trigger rules (e.g., "appointment scheduled → reminders at T-7d and T-24h", "referral submitted → follow-up in 5 days", "discharge → nurse call-in within 48h", "medication changes → pharmacist verification"). Follow-ups queued with SLA tracking. Cross-provider coordination via secure messaging.',
      dataSource: 'EHR + follow-up rule engine + care plan timeline',
      retrievalType: 'multi-source',
      toolInvocation: 'follow-up-scheduler → reminder-queue → cross-provider-coordinator',
    },
    {
      stepNumber: 10,
      label: 'Close & Immutable Audit Log',
      description:
        'End the interaction, log everything for HIPAA compliance, consent audit, and regulatory reporting. Update patient EHR with interaction summary.',
      technicalDetail:
        'HIPAA audit record (immutable, AES-256 encrypted, blockchain-style hash): interaction_id, patient_id, timestamp, intent_classification, data_accessed[], response_sent, escalation_flag, physician_notified, consent_verified, follow-ups_scheduled. Retention: 10 years per healthcare regulations. Patient EHR update: append interaction summary with timestamp and user ID. All PHI access mapped to source systems for compliance audits.',
      toolInvocation: 'audit-logger → ehr-updater → compliance-reporter',
    },
  ],
}

// ─── SaaS In-App Product Assistant ──────────────────────────────────────

const SAAS_COPILOT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Real-time customer health monitoring with continuous signal detection and proactive retention. Ingests usage, support, and billing data hourly. Calculates health-scores continuously, flags churn signals within hours, triggers retention actions (outreach, upsell, support escalation) automatically. Routes high-confidence churn to account executives for immediate intervention. Target: detect churn signals within 2 hours of anomaly, trigger action within 30 minutes.',
  technicalSummary:
    'Instruction graph with health-score calculation, multi-signal anomaly detection, and threshold-based routing. Ingests real-time event stream (usage logs), scheduled pipelines (health-scores hourly, support tickets), and streaming alerts (billing changes). Detect phase identifies usage drop >40% WoW, adoption plateau, support spike >5 tickets/week, or billing decline. Score calculation uses weighted formula: engagement 40%, adoption 30%, support-sentiment 20%, billing-trend 10%. Routing thresholds: >80 healthy, 50-80 at-risk (trigger nurture), <50 critical (escalate to AE). Estimated latency: health-score update <1hr, churn-signal detection <2hr, alert delivery <30min.',
  steps: [
    {
      stepNumber: 1,
      label: 'Parse Natural Language Command',
      description:
        'Extract the user intent, identify the target resource, and infer the required action — read, create, update, delete, or export.',
      technicalDetail:
        'Command parser using intent classification (zero-shot) + semantic routing. Outputs: intent (read|create|update|delete|export), resource_type, operation_scope, parameters{}, confidence_score. Parser confidence threshold: ≥ 0.78.',
      dataSource: 'Inbound user message',
      retrievalType: 'none',
      toolInvocation: 'intent-classifier → semantic-router',
      errorHandling: 'If confidence < 0.78, ask clarifying question: "Do you want to [summarize this OR create a new version]?" before proceeding.',
    },
    {
      stepNumber: 2,
      label: 'Validate User Permissions',
      description:
        'Check whether the current user has permission to perform this action on the requested resource — reading, creating, modifying, deleting.',
      technicalDetail:
        'RBAC + attribute-based access control (ABAC). Checks: user_role, resource_org_id, action_type, resource_data_classification. Denials logged for audit trail. If denied, return specific reason: "You can read Team dashboards but not modify Company-level settings."',
      dataSource: 'Identity provider + permission matrix',
      retrievalType: 'lookup',
      toolInvocation: 'rbac-validator → audit-logger',
      errorHandling: 'If permission check times out (> 2s), fail-safe to deny. If permission service unavailable, respond: "I can\'t verify your permissions right now. Try again in a moment."',
    },
    {
      stepNumber: 3,
      label: 'Extract and Validate Parameters',
      description:
        'Pull out the specific values from the natural language command — which report, which date range, which filters — and validate them against the schema.',
      technicalDetail:
        'Parameter extraction via NER + type coercion. Validates: required fields present, type correctness (date format, numeric range), enum values valid. Handles ambiguity: "last week" → infer as "past 7 days from today". Missing required params: prompt user instead of guessing.',
      errorHandling: 'Type coercion failure (invalid date format, out-of-range number) → ask user for clarification with example: "I didn\'t understand the date. Can you say it as YYYY-MM-DD?"',
    },
    {
      stepNumber: 4,
      label: 'Route to Execution Path',
      description:
        'Decide: is this a read-only operation (autonomous) or a write operation (needs confirmation)? Route accordingly.',
      technicalDetail:
        'Router logic: intent == read OR export → autonomous_path | intent == create|update|delete → supervised_path | intent == unknown → ask',
      routingRule: 'read|export → step 5 (autonomous) | create|update|delete → step 5.alt (supervised)',
      errorHandling: 'If operation is technically read but accesses sensitive data (PII, classified), upgrade to supervised path.',
    },
    {
      stepNumber: 5,
      label: 'Execute API Call (Autonomous Reads)',
      description:
        'For read-only operations: construct the API call, execute it, and return results without requiring confirmation.',
      technicalDetail:
        'API call builder generates request body, headers, query params. Executes via REST/GraphQL client. Applies result filtering: max 500 rows, max 50KB response. Timeout: 8s. Result transformation to user-friendly format (markdown table, JSON, CSV).',
      dataSource: 'SaaS product API',
      retrievalType: 'api-call',
      toolInvocation: 'api-builder → api-caller → result-transformer',
      errorHandling: 'API errors (4xx/5xx) → map to user-friendly message. 500 errors → "Something went wrong on our end. Your team\'s admin can check system logs." Rate limit (429) → "I\'m getting a lot of requests. Try again in 60 seconds."',
    },
    {
      stepNumber: 6,
      label: 'Request Confirmation (Writes)',
      description:
        'For create/update/delete operations: show the user exactly what will happen and ask them to approve before executing.',
      technicalDetail:
        'Confirmation summary: action (create|update|delete), resource details (affected rows, changed fields, business impact). User must explicitly respond "yes" or "confirm". Confirmation timeout: 15 minutes. Failed confirmations logged for security.',
      routingRule: 'If user confirms → step 6.alt | If user declines or times out → abort and log',
      errorHandling: 'Expired confirmation → respond: "Your approval request timed out. Please restate your command and I\'ll ask again."',
    },
    {
      stepNumber: 6.1,
      label: 'Execute API Call (Supervised Writes)',
      description:
        'After confirmation, construct and execute the write API call. Log the action with user identity and outcome.',
      technicalDetail:
        'Write API execution with transaction rollback on error. Logs: user_id, action, resource_id[], timestamp, result (success|error|partial). For large batch writes (> 1000 rows), uses async job with status tracking.',
      toolInvocation: 'write-api-builder → api-caller → transaction-logger → async-job-tracker',
      errorHandling: 'Validation error (e.g., duplicate name) → fail before execution. Conflict error (concurrency) → "Someone else just modified this. Reload and try again."',
    },
    {
      stepNumber: 7,
      label: 'Format and Deliver Result',
      description:
        'Present the result to the user in the format that makes sense — a summary sentence, a table, a chart, or a file download link.',
      technicalDetail:
        'Smart format selection: if 1-3 rows → inline table | 4-20 rows → markdown table | 20+ rows → CSV download link. For creation: "Created 5 new reports. View them here [link]." For updates: "Updated 12 records. See changes [link]."',
      toolInvocation: 'result-formatter → link-generator',
    },
  ],
}

// ─── Background Task Manager / Ops Orchestrator ──────────────────────────

const OPS_AGENT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Real-time shipment disruption detection and automated recovery. Monitors 4 carrier APIs continuously, detects delays >24hrs, reroutes to cheapest compliant carrier within 30 minutes, updates customer ETAs proactively, and reallocates warehouse inventory as needed. Handles customs exceptions by escalating to specialists. Target: reroute decision <30min, customer notification <1hr, SLA compliance >98%.',
  technicalSummary:
    'Instruction graph with real-time carrier monitoring, cost-optimization routing, inventory coordination, and customer notification orchestration. Ingests carrier API feeds (30min-2hr freshness), correlates with order database and warehouse inventory. Detect phase flags delays >24hr, carrier congestion, customs-hold, last-mile failure. Route phase calculates lowest-cost alternative carrier, simulates inventory impact, validates warehouse capacity. Execute phase: trigger carrier reroute API call, update OMS, invoke customer notification platform. State machine: detecting → routing → notifying → rebalancing → complete. Estimated latency: <10min detection, <30min reroute, <60min customer notification.',
  steps: [
    {
      stepNumber: 1,
      label: 'Load Job Schedule',
      description:
        'At scheduled trigger time (or manual trigger), fetch the job DAG configuration, resolve dependencies, and prepare the execution plan.',
      technicalDetail:
        'Loads DAG from schedule store (YAML/JSON). Validates: all dependencies exist, no cycles, all secrets available. Generates execution_plan with topological sort. Estimated prep time: 200ms.',
      dataSource: 'Job schedule store + secret vault',
      retrievalType: 'lookup',
      toolInvocation: 'schedule-loader → dag-validator → execution-planner',
      errorHandling: 'If secrets unavailable, abort pipeline with alert to ops. If DAG has cycles, log and fail immediately (manual intervention needed).',
    },
    {
      stepNumber: 2,
      label: 'Resource Allocation',
      description:
        'Check available compute resources (CPU, memory, disk) and allocate to the job batch based on resource requirements and priority.',
      technicalDetail:
        'Queries cluster health: available_cpu%, available_memory_gb, disk_io_saturation. Allocates resources by job priority tier (critical/high/normal/low) and estimated resource footprint. Queues low-priority jobs if resources constrained. Max queue wait: 10 minutes before auto-cancel.',
      dataSource: 'Cluster metrics + job priority registry',
      retrievalType: 'lookup',
      toolInvocation: 'cluster-health-checker → resource-allocator → queue-manager',
      errorHandling: 'If cluster < 20% available memory, defer non-critical jobs. If < 5%, abort entire pipeline and page ops.',
    },
    {
      stepNumber: 3,
      label: 'Execute Job Batch',
      description:
        'Launch the first batch of jobs that have no upstream dependencies. Monitor each job for completion, errors, and resource usage.',
      technicalDetail:
        'Launches jobs in parallel (fan-out). Per-job monitoring: CPU%, memory%, execution_time_sec, log streaming to central store (Datadog/ELK). Job timeout: per-job configured value, default 3600s. Kills runaway jobs at timeout.',
      dataSource: 'Job executor cluster',
      retrievalType: 'none',
      toolInvocation: 'job-launcher → process-monitor → log-streamer → timeout-enforcer',
      errorHandling: 'Job failure → immediate capture of stderr. Memory OOM → log for resource tuning. Timeout → escalate if critical job.',
    },
    {
      stepNumber: 4,
      label: 'Retry Logic',
      description:
        'If a job fails, determine if it\'s retryable (transient error) or fatal. For retryable: retry up to 3 times with exponential backoff.',
      technicalDetail:
        'Classifies errors: transient (timeout, 503, connection reset → retryable) vs. fatal (validation error, data type mismatch → non-retryable). Retry strategy: 1s, 4s, 16s backoff. Logs all retry attempts. Success on retry counts as pipeline success.',
      errorHandling: 'After 3 retries, mark job as failed and proceed to step 5 (escalation logic).',
    },
    {
      stepNumber: 5,
      label: 'Escalation & Incident Management',
      description:
        'If a critical or high-priority job fails after all retries, page the ops team and create an incident. For low-priority jobs: log and continue.',
      technicalDetail:
        'Escalation matrix: critical job failure → page on-call immediately (SLA < 30s) | high → alert ops Slack channel + create incident | normal/low → log only. Incident created with: job_id, error_log, last_successful_run, recommended_action.',
      dataSource: 'Job priority registry + escalation rules',
      retrievalType: 'lookup',
      routingRule: 'critical failure → page | high failure → slack alert | low failure → log',
      toolInvocation: 'priority-checker → pager-service → incident-creator → slack-notifier',
      errorHandling: 'If pager service unavailable, fall back to SMS. If all notification channels fail, retry notifications every 2 minutes for 30 minutes.',
    },
    {
      stepNumber: 6,
      label: 'Dependency Resolution',
      description:
        'Once a job completes (success or acceptable failure), mark it done and trigger all jobs waiting on that job\'s output.',
      technicalDetail:
        'Marks job in DAG as completed. Scans for next-stage jobs with all dependencies met. Launches them (back to step 3). Handles partial failures: if a job fails but downstream jobs can proceed with missing data, infers this from dependency metadata and proceeds.',
      toolInvocation: 'dag-state-updater → downstream-trigger',
    },
    {
      stepNumber: 7,
      label: 'Pipeline Completion & Reporting',
      description:
        'After all jobs complete, generate a summary report and log pipeline metrics. Trigger cleanup tasks if configured.',
      technicalDetail:
        'Summary: total_jobs, succeeded, failed, duration_minutes, retries_used, resources_consumed. Generates report in JSON + Markdown. Sends to ops dashboard and emails to stakeholders. Cleanup: removes temporary tables/files. Logs all metrics to monitoring backend (Prometheus/Grafana).',
      toolInvocation: 'pipeline-summarizer → report-generator → email-sender → cleanup-executor → metrics-logger',
      errorHandling: 'Report generation failure → still log metrics to backend; notify ops of reporting failure separately.',
    },
  ],
}

// ─── AI Coding Assistant ─────────────────────────────────────────────────

const CODING_AGENT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering alert ingestion, alert correlation, log analysis, metric anomaly detection, root cause diagnosis, remediation execution, and incident escalation. Detects outages, correlates multiple data sources within 5 minutes, executes low-risk remediations autonomously (restart, scale), and escalates high-risk remediations (rollback, traffic drain) to on-call engineer. All incidents logged with audit trail. Target: MTTD <5min, MTTR <30min.',
  technicalSummary:
    'Instruction graph with real-time alert ingestion (PagerDuty/OpsGenie webhooks), alert correlation, log analysis (Splunk/Datadog), metric anomaly detection (statistical baselines), service dependency graph analysis, and runbook execution. Detect phase classifies severity. Diagnose phase correlates: alert patterns + error logs + metric spikes + service topology. Confidence scoring (>70% triggers auto-remediation). Remediate: low-risk actions auto-execute (restart service, increase capacity), high-risk actions require approval (rollback, traffic drain). State machine: detecting → diagnosing → routing → executing → recovering. Estimated latency: <10s alert ingestion, <5min root-cause diagnosis, <30min remediation execution.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Code Request',
      description:
        'Capture the user requirement: "add a function to validate email", "refactor this loop", "generate a React component for file upload".',
      technicalDetail:
        'Request parser extracts: task_description, context (current_file, language, framework), constraints (performance, security, style). Validates: language supported (JS/TS, Python, Go, Rust, others), project structure accessible.',
      dataSource: 'Inbound user request + project repository',
      retrievalType: 'lookup',
      toolInvocation: 'request-parser → project-context-loader',
      errorHandling: 'Unsupported language → respond with supported list. Missing context → ask for clarification before generating.',
    },
    {
      stepNumber: 2,
      label: 'Retrieve Project Context',
      description:
        'Pull the project\'s style guide, existing code patterns, dependencies, and test infrastructure to inform code generation.',
      technicalDetail:
        'Fetches: package.json (or equivalent), eslint/prettier config, existing similar functions (via vector search on codebase), test examples, documented patterns. Builds context window (max 8K tokens) of relevant examples.',
      dataSource: 'Project repository',
      retrievalType: 'multi-source',
      toolInvocation: 'style-guide-loader → dependency-reader → pattern-finder → example-retriever',
    },
    {
      stepNumber: 3,
      label: 'Generate Code',
      description:
        'Use code generation model (Claude/Copilot) to produce the function, class, or component matching the project style and requirements.',
      technicalDetail:
        'Generation prompt includes: task description, style guide excerpts, code examples, security guidelines. Model: Claude Opus (preferred). Max tokens: 2000. Outputs: code_snippet, explanation, dependencies_used[].',
      toolInvocation: 'code-generator (LLM)',
      errorHandling: 'If generation fails (timeout, overlong output), retry with shorter request. If generation uses unsupported dependencies, reject and ask user to clarify constraints.',
    },
    {
      stepNumber: 4,
      label: 'Lint and Format',
      description:
        'Run the project\'s linter (ESLint, Pylint, etc.) and formatter (Prettier, Black) against the generated code to catch style violations and syntax errors.',
      technicalDetail:
        'Applies project config: eslintrc, prettierrc, black config, etc. Fixes auto-fixable violations (spacing, import order). Reports non-auto-fixable violations. Must pass with 0 non-auto-fixable errors before proceeding.',
      toolInvocation: 'linter → auto-fixer → formatter',
      errorHandling: 'If linting fails with non-auto-fixable errors, regenerate code with linter feedback. If > 3 regenerations needed, escalate to human reviewer.',
    },
    {
      stepNumber: 5,
      label: 'Check Dependencies',
      description:
        'Validate that all dependencies used in the generated code are already in the project, or are approved for installation.',
      technicalDetail:
        'Scans generated code for imports. Checks: each import in package.json or lockfile, version compatibility (no major version conflicts). If new dependency needed, checks: npm audit result (no critical vulns), download popularity (> 1M/week preferred), maintenance status (last update < 2yr ago).',
      dataSource: 'package.json/requirements.txt + npm registry metadata',
      retrievalType: 'lookup',
      toolInvocation: 'import-scanner → dependency-validator → registry-checker',
      errorHandling: 'Unknown dependency or version conflict → flag for human approval. High-risk vulns → reject dependency and ask user to choose alternative.',
    },
    {
      stepNumber: 6,
      label: 'Execute Tests in Sandbox',
      description:
        'Run the generated code against the project\'s test suite in an isolated sandbox environment to ensure it doesn\'t break existing functionality.',
      technicalDetail:
        'Sandbox setup: Docker container or VM with project environment. Runs: unit tests for the function (if tests exist), full test suite if changes are in core areas. Timeout: 30s per test. Captures: test results, coverage%, execution_time.',
      dataSource: 'Project test suite + isolated sandbox',
      retrievalType: 'none',
      toolInvocation: 'sandbox-launcher → test-runner → coverage-analyzer',
      errorHandling: 'Test failure → capture error output and failures_count. If > 20% tests fail, reject generated code and flag for regeneration. Coverage < 70% → warn but proceed.',
    },
    {
      stepNumber: 7,
      label: 'Security & SAST Analysis',
      description:
        'Scan the generated code for common security vulnerabilities (SQL injection, XSS, unsafe deserialization, hard-coded secrets).',
      technicalDetail:
        'Uses Semgrep (configured with OWASP Top 10 rules). Severity levels: high/medium/low/info. Must pass with 0 high-severity issues. Medium issues require human review. Low/info issues logged for reference.',
      toolInvocation: 'semgrep-scanner → vuln-classifier',
      errorHandling: 'High-severity vulns → reject code and explain vulnerability. Medium vulns → proceed to human review (step 8) with warnings.',
    },
    {
      stepNumber: 8,
      label: 'Human Review & Approval',
      description:
        'Present the generated, validated code to the developer for final review. No code is committed without explicit approval.',
      technicalDetail:
        'Generates review package: side-by-side diff (if replacing existing code), validation summary (linting passed, tests passed, security checks), suggested next steps. Requires explicit "approve" response before staging/commit.',
      routingRule: 'All generated code requires human review → mandatory approval gate',
      toolInvocation: 'code-diff-generator → review-presenter → approval-gate',
      errorHandling: 'If developer requests changes → capture feedback and regenerate (back to step 3 with user feedback incorporated).',
    },
  ],
}

// ─── Private & Secure On-Premises Assistant ────────────────────────────

const ONPREM_ASSISTANT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Six steps covering real-time sensor ingestion, anomaly detection, failure prediction, work-order generation, and maintenance scheduling. All inference runs on local edge gateway (no cloud uploads). Processes equipment data 24/7 with 48-hour advance warnings for predicted failures. Automatically schedules preventive maintenance and orders spare parts.',
  technicalSummary:
    'Instruction graph with MQTT sensor streaming, LSTM-based anomaly detection, random forest failure prediction (trained on 42k maintenance records), and rule-based maintenance scheduling. Real-time processing (1000 Hz vibration, 100 Hz motor current), 30-day rolling sensor data buffer on local SSD. Failure prediction achieves 89% accuracy with <7% false positive rate. All computations on edge gateway; no external cloud dependencies.',
  steps: [
    {
      stepNumber: 1,
      label: 'Ingest Real-Time Sensor Data (MQTT)',
      description:
        'Stream sensor data from 287 equipment units via MQTT directly to edge gateway. Validate sensor readings for plausible range.',
      technicalDetail:
        'MQTT subscriber listening on equipment/* topics. Sensors: vibration (1000 Hz), temperature (10 Hz), pressure (10 Hz), motor current (100 Hz). Validation: reject readings outside plausible range (vibration >100mm/s flagged as outlier, temp >150C, current >200A). Append validated readings to 30-day rolling buffer (48 TB SSD). Timestamp all readings UTC.',
      dataSource: 'MQTT sensor streams (real-time)',
      retrievalType: 'streaming',
      toolInvocation: 'mqtt-subscriber → range-validator → buffer-appender',
      errorHandling: 'Sensor dropout >5 min → alert technician, escalate to plant engineer. Out-of-range reading → flag as anomaly, continue buffering.',
    },
    {
      stepNumber: 2,
      label: 'Run Anomaly Detection (LSTM)',
      description:
        'Apply LSTM model to detect abnormal patterns in sensor time-series (vibration acceleration, temperature trends, motor current spikes).',
      technicalDetail:
        'LSTM trained on 5 years of normal equipment operation. Input: 7-day rolling window (10,080 samples for 1000 Hz vibration). Output: anomaly score (0-1). Threshold: >0.75 = anomaly alert. Confidence: output also includes model confidence (95%+ required for critical alert). Latency: <500ms per equipment.',
      toolInvocation: 'lstm-anomaly-detector',
      errorHandling: 'LSTM timeout → use fallback rule-based detection (manual threshold). Model drift detected → retrain quarterly.',
    },
    {
      stepNumber: 3,
      label: 'Predict Equipment Failure (Random Forest)',
      description:
        'Correlate anomalies with maintenance history to forecast bearing wear, motor degradation, or component failure within 7-day window.',
      technicalDetail:
        'Random forest trained on 42,000 maintenance records. Features: anomaly score, equipment_id, component_type, days_since_last_maintenance, temperature_trend, vibration_acceleration. Output: failure_probability (0-1). Threshold: >0.70 = high-risk prediction. Outputs also: failure_type (bearing, motor, coupling, seal), severity (low/medium/critical), estimated_days_to_failure (7±2).',
      dataSource: 'Maintenance history database + real-time sensor data',
      retrievalType: 'join',
      toolInvocation: 'random-forest-predictor → failure-type-classifier → severity-scorer',
      errorHandling: 'Prediction confidence <0.70 → log as medium-risk, escalate to plant engineer for inspection recommendation.',
    },
    {
      stepNumber: 4,
      label: 'Check Spare Parts Inventory',
      description:
        'For predicted failure, look up required spare parts and verify availability. If critical part unavailable, trigger urgent reorder.',
      technicalDetail:
        'Query spare parts database for component_type. Check: current_stock, reorder_point, lead_time_days. If stock < (lead_time_days + 7 days), escalate to supply chain manager. If stock = 0 and lead_time = 12 days, escalate immediately + order manually.',
      dataSource: 'Spare parts inventory database',
      retrievalType: 'lookup',
      toolInvocation: 'inventory-checker → reorder-decision-engine',
    },
    {
      stepNumber: 5,
      label: 'Generate Work Order & Schedule Maintenance',
      description:
        'Auto-create maintenance work order with task description, spare parts list, estimated duration, and schedule for maintenance window.',
      technicalDetail:
        'Work order includes: equipment_id, predicted_failure_type, task_description, spare_parts_required[], estimated_duration_hours, skill_level_required, safety_precautions. Schedule: identify next available maintenance window (typically 48+ hours out). Route to maintenance technician based on skill level + availability.',
      toolInvocation: 'work-order-generator → maintenance-scheduler → technician-router',
      errorHandling: 'No maintenance window available within 7 days → escalate to plant engineer for emergency planning.',
    },
    {
      stepNumber: 6,
      label: 'Alert & Dashboard Update',
      description:
        'Send real-time alerts to maintenance technician and plant engineer. Update equipment health dashboard with failure prediction, OEE impact, and downtime-cost avoidance.',
      technicalDetail:
        'Alert channels: SMS (critical), email (high/medium), dashboard notification. Dashboard shows: equipment health score (1-100), predicted MTBF (mean time between failures), failure probability %, work order status, parts inventory status. Metrics: OEE trends, downtime cost avoidance YTD, maintenance scheduling efficiency.',
      toolInvocation: 'alert-dispatcher → dashboard-updater → metrics-aggregator',
      errorHandling: 'Alert delivery failure → retry with exponential backoff. Dashboard unavailable → log locally, resync when service recovers.',
    },
  ],
}

// ─── Image, Audio & Video Assistant ─────────────────────────────────────

const MULTIMODAL_AGENT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Seven steps covering content classification across text, image, audio, and video, policy-based severity scoring, auto-decision routing, and escalation to human reviewers. Processes 8,000-50,000 flagged items daily. Auto-removes clear violations (confidence >95%), routes medium-confidence cases to humans (SLA <24h), and whitelists false positives.',
  technicalSummary:
    'Content moderation pipeline with per-modality classifiers: text (hate-speech + toxicity + misinformation), image (NSFW + violence + optical hash matching), audio (ASR + hate-speech), video (frame sampling 8fps + audio analysis). Severity scoring: rule-based (policy match) + ML confidence (calibrated from 2.1M historical decisions). Auto-remove if severity=critical AND confidence>95%, human review if severity=medium OR confidence 70-95%, whitelist if confidence<threshold. False positive rate: <3%, appeal SLA: <24h.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive & Validate Flagged Content',
      description:
        'Accept flagged content from user reports or automated pre-screening. Validate content type, extract content data, and queue for classification.',
      technicalDetail:
        'Inbound: content_id, content_type (text/image/audio/video), report_reason, reporter_id, timestamp, content_url. Validation: content_id exists, content_type recognized, reporter_id valid. Extract full content: text string, image file, audio/video file. All content logged in moderation database with inbound timestamp.',
      dataSource: 'Content flag queue (real-time)',
      retrievalType: 'none',
      toolInvocation: 'content-receiver → format-validator → content-extractor → queue-logger',
      errorHandling: 'Content not found → log error, notify reporter. Invalid content_type → reject with explanation. Duplicate report → deduplicate, increment report count.',
    },
    {
      stepNumber: 2,
      label: 'Classify Text Content',
      description:
        'If input is text: apply hate-speech, toxicity, and misinformation classifiers. Return severity and policy match.',
      technicalDetail:
        'Text classifiers: (1) hate-speech (transformer-based, trained on 100k hate-speech examples), (2) toxicity (offensive language detector, trained on Reddit/Twitter data), (3) misinformation (political/health/financial false claims detector). Each outputs: prediction (0-1), top-3 policy matches. Confidence thresholds: >0.95 high-confidence, 0.70-0.95 medium-confidence, <0.70 low-confidence.',
      dataSource: 'Flagged text content',
      retrievalType: 'none',
      toolInvocation: 'text-parser → hate-speech-classifier → toxicity-classifier → misinformation-detector',
      errorHandling: 'Classifier timeout → use fallback rule-based detection (keyword matching). Low confidence (<0.50) → flag for human review.',
    },
    {
      stepNumber: 3,
      label: 'Analyze Image Content',
      description:
        'If input is image: detect NSFW, violence, and run optical hash matching against known CSAM database.',
      technicalDetail:
        'Image classifiers: (1) NSFW (nudity/sexual content detector, confidence 0-1), (2) violence (weapons, injuries, blood detection), (3) optical hash matching against NCMEC CSAM hash database (immediate auto-remove if match). Outputs: violation_type, confidence_score, bounding_boxes (if applicable).',
      dataSource: 'Flagged image content',
      retrievalType: 'none',
      toolInvocation: 'image-parser → nsfw-detector → violence-detector → hash-matcher-csam',
      errorHandling: 'CSAM match → IMMEDIATE auto-remove and report to NCMEC. Image decode error → fail gracefully, escalate.',
    },
    {
      stepNumber: 4,
      label: 'Process Audio & Video',
      description:
        'If input is audio/video: transcribe using ASR, then run text classifiers on transcript. For video, sample frames and run image classifiers.',
      technicalDetail:
        'ASR: Whisper (99 languages, 95%+ accuracy). Outputs: transcript_text, confidence_per_segment. Text classifiers applied to transcript (step 2). For video: sample 8 fps, run image classifiers on frames (step 3). Audio analysis: detect speech vs. non-speech, language detection.',
      dataSource: 'Audio/video files',
      retrievalType: 'streaming',
      toolInvocation: 'asr-engine → text-classifiers (from step 2) → video-frame-sampler → image-classifiers (from step 3)',
      errorHandling: 'ASR failure → escalate to human. Video too long (>4hr) → process in chunks. Codec not supported → transcode.',
    },
    {
      stepNumber: 5,
      label: 'Match Against Policy Rulebook',
      description:
        'Correlate all violations (text, image, audio, video) with specific policy section from community guidelines. Assign violation category and cite policy.',
      technicalDetail:
        'Policy matcher: takes all classifier outputs and finds matching policy section (e.g., "Section 3.1.2: Hate Speech"). Outputs: violation_category, policy_section_cited, policy_quote, violation_severity (no-violation/low/medium/critical). Rationale: includes which classifier(s) triggered.',
      dataSource: 'Community guidelines rulebook',
      retrievalType: 'lookup',
      toolInvocation: 'policy-matcher → severity-assigner → citation-generator',
    },
    {
      stepNumber: 6,
      label: 'Score & Route Decision',
      description:
        'Combine all classifier confidences and policy match strength to compute final severity + confidence. Route to action: auto-remove, human queue, or whitelist.',
      technicalDetail:
        'Routing logic: IF (severity=critical AND confidence>95%) THEN auto-remove | ELIF (severity=medium OR confidence 70-95%) THEN human-queue | ELIF confidence<threshold THEN whitelist. Human queue priority: critical (SLA 2h), high (4h), medium (24h).',
      toolInvocation: 'confidence-aggregator → routing-decision-engine → queue-dispatcher',
      errorHandling: 'Conflicting classifiers → trust policy-matcher decision. Routing error → default to human queue.',
    },
    {
      stepNumber: 7,
      label: 'Execute Action & Log',
      description:
        'Execute routed action: auto-remove content, notify creator with policy citation, queue for human review, or whitelist. Log complete decision.',
      technicalDetail:
        'Auto-remove: delete content immediately, notify creator with policy section + appeal info. Human queue: create moderation task with all analysis results. Whitelist: mark as reviewed, log in analytics. Log all: moderation_id, content_id, decision, reasoning, classifier outputs, confidence scores, reviewer (if human), timestamp.',
      toolInvocation: 'action-executor → creator-notifier → moderation-logger',
      errorHandling: 'Notification delivery fail → queue for retry. Log storage full → archive old records. Human queue full → notify admin.',
    },
  ],
}

// ─── High-Volume Customer Chat ──────────────────────────────────────────

const CONSUMER_CHAT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Seven steps covering HR policy lookups, employee self-service requests, PTO processing, benefits inquiries, and escalation to HR business partners. Handles 24,000 employees at scale. Resolves 71% of HR FAQs on first turn, escalates 8% to humans for policy exceptions. Sub-500ms latency for policy lookups, 3-second SLA for PTO calculations.',
  technicalSummary:
    'Instruction graph with HRIS API integration (Workday), handbook full-text search, benefits database queries, payroll system lookups, and policy compliance validation on every answer. Request caching for repeated FAQs. PTO calculations validated against employee tenure, state employment law, and FMLA/ADA requirements. All answers cite policy section. Escalation: policy exceptions to HR business partner (SLA <4h), legal concerns to legal + HR (immediate).',
  steps: [
    {
      stepNumber: 1,
      label: 'Authenticate & Load Employee Profile',
      description:
        'Validate employee identity (SSO or email). Fetch employee record from HRIS (Workday): name, tenure, department, manager, compensation band.',
      technicalDetail:
        'SSO verification via company identity provider (AD/Okta). HRIS API call: retrieves employee_id, first_name, last_name, hire_date, department, manager_id, comp_band, office_location, state_of_employment. All data cached in Redis (TTL: 5 min) for <100ms subsequent lookups. Flag: state_of_employment determines which state employment laws apply (CA, NY, TX variations).',
      dataSource: 'SSO provider + HRIS API (Workday)',
      retrievalType: 'lookup',
      toolInvocation: 'sso-authenticator → hris-loader → state-law-detector',
      errorHandling: 'Auth failure → deny access, log attempt. HRIS unavailable → continue with generic response (no personalization). State unknown → default to federal FMLA rules.',
    },
    {
      stepNumber: 2,
      label: 'Classify Query Intent',
      description:
        'Parse employee question and classify intent: policy-lookup, PTO-request, benefits-inquiry, payroll-question, onboarding-help, or escalation-needed.',
      technicalDetail:
        'Intent classifier: "How much PTO do I have?" → pto-balance-lookup. "Can I take maternity leave?" → policy-lookup. "Enroll in 401k?" → benefits-inquiry. "Why is my paycheck $X?" → payroll-question. "Discrimination concern" → escalation. Confidence: ≥0.80 = proceed, <0.80 = ask clarifying question.',
      toolInvocation: 'intent-classifier → intent-router',
      errorHandling: 'Low confidence → respond: "Are you asking about [option A] or [option B]?"',
    },
    {
      stepNumber: 3,
      label: 'Policy Lookup & Citation',
      description:
        'For policy-lookup intent: search employee handbook using full-text search. Return policy section + cite handbook section number.',
      technicalDetail:
        'Full-text search on handbook PDFs: "maternity leave" → Section 4.2.1 (Employee Handbook v3.0). Return: policy_text (up to 200 words), section_id, policy_version, effective_date. All answers must cite policy. Template: "Per Employee Handbook Section X.Y.Z: [policy_quote]. You qualify because [reason based on tenure/state/role]."',
      dataSource: 'Employee handbook PDF (full-text indexed)',
      retrievalType: 'search',
      toolInvocation: 'handbook-searcher → citation-formatter',
      errorHandling: 'Policy not found → escalate: "This policy is not clearly covered in the handbook. Let me route you to our HR team."',
    },
    {
      stepNumber: 4,
      label: 'Calculate & Validate (PTO/Benefits)',
      description:
        'For PTO or benefits intent: perform calculations with validation. PTO: check tenure, state law, FMLA eligibility. Benefits: calculate costs, check open enrollment eligibility.',
      technicalDetail:
        'PTO calculation: accrual_per_year (depends on tenure via HRIS), state_law_minimum (CA: unlimited after 90 days, NY: 1 day/year, TX: at-will), FMLA_eligible (tenure ≥ 12 months), result = max(accrual, state_min). Benefits: query benefits database → plan_options, monthly_premium, calculate employee_cost (pre-tax vs post-tax). Validation: salary_band determines eligibility (some benefits HSA-eligible, some not).',
      dataSource: 'HRIS + Benefits database + Payroll system',
      retrievalType: 'lookup + join',
      toolInvocation: 'pto-calculator → state-law-validator → fmla-checker | benefits-calculator → cost-breakdown',
      errorHandling: 'Calculation error → return with confidence score + recommendation: "Confirm with HR if [edge case]."',
    },
    {
      stepNumber: 5,
      label: 'Route Decision: Answer vs. Escalate',
      description:
        'Determine if agent can answer autonomously or must escalate to HR business partner. Escalate if: policy exception, legal concern, or calculation confidence <80%.',
      technicalDetail:
        'Escalation criteria: (1) policy_exception_request (e.g., "Can I take 6 months sabbatical?"), (2) legal_concern (discrimination, wrongful termination risk, FMLA violation), (3) calculation_confidence <80%, (4) unusual_leave_type, (5) compensation_dispute. If escalation: route to HR_BUSINESS_PARTNER with SLA <4 hours.',
      routingRule: 'policy_exception OR legal_concern OR confidence<80% → escalate | else → answer directly',
      toolInvocation: 'escalation-detector → hrbp-router',
    },
    {
      stepNumber: 6,
      label: 'Generate Answer with Policy Citation',
      description:
        'Compose answer in employee-friendly tone. Always cite policy section. Include calculation details if applicable. Close with next-steps CTA.',
      technicalDetail:
        'Response format: [Friendly greeting] + [Policy section citation] + [Employee-specific answer] + [Calculation/rationale if applicable] + [Next steps CTA]. Example: "Hi Sarah! Based on your hire date (01/15/2024), you have accrued 8.75 PTO days (Employee Handbook 4.1.2). Your balance: 12.5 days. To request time off, please submit via the portal; your manager Jane will approve. Any other questions?"',
      toolInvocation: 'response-generator → policy-citation-inserter → tone-optimizer → cta-appender',
    },
    {
      stepNumber: 7,
      label: 'Log Decision & Monitor Compliance',
      description:
        'Log answer with policy cited, tenure validated, state law applied. Flag for compliance audit (FMLA, ADA, EEOC).',
      technicalDetail:
        'Logs: employee_id, query_intent, policy_section_cited, calculation_method, state_law_applied (if any), escalation_flag, timestamp. Compliance flags: FMLA_eligibility, ADA_accommodation_status, EEO_concern_flag. Analytics: resolution_rate (first turn), escalation_rate, SLA_adherence (4h for HRBP escalations).',
      toolInvocation: 'interaction-logger → compliance-flag-generator → dashboard-updater',
      errorHandling: 'Log failure → retry asynchronously. Compliance flag generation error → alert admin, escalate to legal.',
    },
  ],
}

// ─── Lookup Map ─────────────────────────────────────────────────────────

const INSTRUCTION_DATA_MAP: Record<string, InstructionSetPayload> = {
  'faq-knowledge': FAQ_INSTRUCTIONS,
  'doc-intelligence': DOC_INTEL_INSTRUCTIONS,
  'research-comparison': RESEARCH_INSTRUCTIONS,
  'decision-workflow': DENTAL_INSTRUCTIONS,
  'saas-copilot': SAAS_COPILOT_INSTRUCTIONS,
  'ops-agent': OPS_AGENT_INSTRUCTIONS,
  'coding-agent': CODING_AGENT_INSTRUCTIONS,
  'onprem-assistant': ONPREM_ASSISTANT_INSTRUCTIONS,
  'multimodal-agent': MULTIMODAL_AGENT_INSTRUCTIONS,
  'consumer-chat': CONSUMER_CHAT_INSTRUCTIONS,
}

export function getInstructionData(tileId: string): InstructionSetPayload | null {
  return INSTRUCTION_DATA_MAP[tileId] ?? null
}
