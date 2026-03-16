import type { PatternsPayload, DimensionPattern } from '@/store/agentTypes'
import { buildPatternsPayload } from './patternsPayloadBuilder'
import { getDimensionAnalysisData } from './dimensionAnalysisData'

// ============================================================================
// COMBINATORIAL PATTERNS — Full Power-Set Generation
// ============================================================================
// All patterns are auto-generated from dimension analysis data using
// Task × DataPowerSet × UserProfile combinatorics.
//
// For N data dimensions, the power set produces 2^N - 1 non-empty subsets.
// Each subset × task × user profile = one candidate pattern.
// Invalid combos (disconnected data domains) are filtered out.
//
// Tile dimension counts:
//   faq-knowledge:       10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   saas-copilot:        10T × 5D × 6UP → 31 data subsets → up to 1,860 combos
//   research-comparison: 10T × 5D × 6UP → 31 data subsets → up to 1,860 combos
//   doc-intelligence:    10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   decision-workflow:   10T × 5D × 6UP → 31 data subsets → up to 1,860 combos
//   coding-agent:        10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   ops-agent:           10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   onprem-assistant:    10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   multimodal-agent:    10T × 5D × 6UP → 31 data subsets → up to 1,860 combos
//   consumer-chat:       10T × 4D × 6UP → 15 data subsets → up to 900 combos
//
// After validity filtering, actual pattern counts will be lower.
// ============================================================================

interface TileMeta {
  agentName: string
  description: string
}

const TILE_META: Record<string, TileMeta> = {
  'faq-knowledge': {
    agentName: 'Order Issue Resolution Agent',
    description: 'Handles order tracking, delivery problem resolution, refund processing, return coordination, and carrier investigations across retail and e-commerce',
  },
  'saas-copilot': {
    agentName: 'Customer Success Monitoring Agent',
    description: 'Monitors usage patterns, detects churn signals, calculates health scores, triggers retention actions, and escalates at-risk accounts to customer success teams',
  },
  'research-comparison': {
    agentName: 'Underwriting Risk Analysis Agent',
    description: 'Handles property risk assessment, claims history analysis, premium calculation, coverage recommendation, and regulatory compliance for insurance underwriting',
  },
  'doc-intelligence': {
    agentName: 'Loan Underwriting Agent',
    description: 'Processes loan applications to extract financial data, validate eligibility, calculate risk metrics, and route decisions with regulatory compliance and fair lending validation',
  },
  'decision-workflow': {
    agentName: 'Care Coordination Agent',
    description: 'Manages healthcare system operations including appointment scheduling, referral routing, insurance verification, emergency triage, prior authorization, and post-procedure follow-up coordination across providers',
  },
  'coding-agent': {
    agentName: 'Incident Response Agent',
    description: 'Detects outages, correlates logs and metrics for root cause diagnosis, executes remediation runbooks, and performs safe rollbacks with blast radius assessment',
  },
  'ops-agent': {
    agentName: 'Shipment Disruption Manager',
    description: 'Detects shipment disruptions, reroutes across carriers, updates customer ETAs, coordinates warehouse reallocation, and manages customs exceptions',
  },
  'onprem-assistant': {
    agentName: 'Predictive Maintenance Agent',
    description: 'Ingests real-time equipment sensor data (vibration, temperature, pressure, motor current), detects anomalies via LSTM, predicts bearing wear and motor failures within 7-day window, auto-generates work orders, and schedules preventive maintenance with spare-parts optimization',
  },
  'multimodal-agent': {
    agentName: 'Content Moderation Agent',
    description: 'Reviews flagged text, images, audio, and video against platform policies, classifies policy violations with severity scoring, auto-removes clear violations (high confidence), routes medium-confidence cases to human moderators, and handles appeals with <24h SLA',
  },
  'consumer-chat': {
    agentName: 'Employee Support Agent',
    description: 'Answers HR policy questions with handbook citations, processes PTO requests with accrual calculations, manages benefits inquiries and enrollment, handles payroll questions, validates state employment law compliance (CA/NY/TX FMLA/ADA), and escalates policy exceptions to HR business partners',
  },
}

// ============================================================================
// HAND-CRAFTED FUZZY PATTERNS — Human Intervention Required
// ============================================================================
// Each tile gets 2 fuzzy patterns using its actual dimension IDs.
// These represent edge-case scenarios where the agent cannot proceed
// autonomously and must escalate to a human operator.
// ============================================================================

const FUZZY_COMPONENTS = [
  'api-gateway', 'auth', 'input-validation', 'rag', 'cross-encoder-reranking',
  'workflow-orchestrator', 'failure-handling', 'output-guardrails',
  'policy-enforcement', 'logging-analytics',
]

const FUZZY_OVERRIDE_PATTERNS: Record<string, DimensionPattern[]> = {
  'faq-knowledge': [
    {
      id: 'faq-F-01',
      name: 'Multi-Carrier Shipment Split with Missing Tracking',
      description: 'Single order split across multiple carriers during fulfillment. One or more tracking-numbers missing from order database. Carrier APIs show partial shipments. Customer frustrated and uncertain if order is complete.',
      tier: 'fuzzy',
      taskDimensionId: 'faq-task-delivery-problem-diagnosis',
      dataDimensionIds: ['faq-data-order-database', 'faq-data-carrier-tracking'],
      userProfileDimensionId: 'faq-up-known-issue-agent',
      patternType: 'reasoning',
      exampleQuestions: [
        'I see one tracking number but the receipt shows 2 SKUs. Where is the other one?',
        'My order shipped from two different warehouses. Will they both arrive on the same day?',
        'I have tracking for the first box but not the second. Is my order lost?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Shipment split detected but not all carriers report. Confidence < 55%. Cross-check carrier APIs and warehouse fulfillment logs. If still missing after 24h, escalate for manual carrier investigation.',
      confidence: 32,
    },
    {
      id: 'faq-F-02',
      name: 'Fraudulent Return Claim with Conflicting Evidence',
      description: 'Customer initiates return but order shows "delivered and signed" by tracking. Photo evidence from delivery contradicts return claim. Customer has high return-rate flag. Conflicting signals between tracking proof and claim legitimacy.',
      tier: 'fuzzy',
      taskDimensionId: 'faq-task-replacement-routing',
      dataDimensionIds: ['faq-data-order-database', 'faq-data-customer-history'],
      userProfileDimensionId: 'faq-up-repeat-returner',
      patternType: 'reasoning',
      exampleQuestions: [
        'I never received my order but your tracking says it was delivered and signed.',
        'The item arrived damaged but I cannot find the signature photo you sent me.',
        'I want to return this but the carrier shows it was delivered yesterday and someone signed for it.',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Fraud signal: return-rate > 30% OR >5 returns in 60 days. Conflicting delivery proof. Confidence < 50%. Route to fraud team immediately. Manual investigation required before any refund or return label issued.',
      confidence: 24,
    },
  ],

  'saas-copilot': [
    {
      id: 'saas-F-01',
      name: 'Integration Setup with Permission Conflict',
      description: 'Third-party integration requires API scopes that conflict with existing permission rules. Workflow engine cannot proceed without an admin manually reconciling the permission boundary — automated resolution risks a security incident.',
      tier: 'fuzzy',
      taskDimensionId: 'saas-task-integration-setup',
      dataDimensionIds: ['saas-data-api', 'saas-data-permissions'],
      userProfileDimensionId: 'saas-up-vip-dispute-agent',
      patternType: 'reasoning',
      exampleQuestions: [
        'I\'m trying to connect Salesforce but the OAuth scopes are being rejected.',
        'The Slack integration needs write access to channels I haven\'t whitelisted.',
        'Why does the Zapier setup keep failing even though I granted admin consent?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'API scopes and permission rules produce contradictory access decisions. Human admin must reconcile before integration proceeds.',
      confidence: 31,
    },
    {
      id: 'saas-F-02',
      name: 'Bulk Import Schema Drift — Manual Validation Required',
      description: 'Incoming bulk import file contains fields that do not match the current API schema, and historical workflow logs show previous imports accepted a now-deprecated format. Agent cannot safely auto-map — data integrity risk requires human review.',
      tier: 'fuzzy',
      taskDimensionId: 'saas-task-bulk-import',
      dataDimensionIds: ['saas-data-api', 'saas-data-history'],
      userProfileDimensionId: 'saas-up-known-problem-agent',
      patternType: 'aggregator',
      exampleQuestions: [
        'My CSV import keeps failing with a schema validation error on a field that used to work.',
        'Previous bulk loads used a different column format — why is the mapping broken?',
        'The API says the field is required but our historical exports don\'t include it.',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Schema mismatch between current API spec and historical workflow logs. Auto-mapping would risk data corruption. Escalate to data admin.',
      confidence: 35,
    },
  ],

  'research-comparison': [
    {
      id: 'research-F-01',
      name: 'Contradictory Risk Signals Across Data Sources',
      description: 'Property inspection shows low risk but claims history shows high claim-frequency; actuarial models disagree on severity assessment. Agent cannot reconcile conflicting signals — underwriter must adjudicate which data source is authoritative.',
      tier: 'fuzzy',
      taskDimensionId: 'research-task-loss-pattern-detection',
      dataDimensionIds: ['research-data-property-inspection', 'research-data-claims-history', 'research-data-actuarial-models'],
      userProfileDimensionId: 'research-up-underwriter',
      patternType: 'reasoning',
      exampleQuestions: [
        'Property looks well-maintained but has 3 claims in 5 years — which signal is more reliable?',
        'Actuarial models predict premium $1,200 but inspection data suggests $800 — what\'s the discrepancy?',
        'Recent construction quality is excellent but loss-history shows recurring water damage — should we insure?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Conflicting risk signals across inspection, claims, and actuarial data. Risk-score confidence < 35%. Requires underwriter judgment to determine authoritative data source and final decision.',
      confidence: 29,
    },
    {
      id: 'research-F-02',
      name: 'Catastrophe Exposure with Incomplete Modeling Data',
      description: 'Property located in high-catastrophe zone (hurricane/wildfire) but historical loss data is sparse or incomplete. Reinsurance treaty thresholds are unclear. Premium and coverage cannot be reliably estimated — expert actuarial and reinsurance review required.',
      tier: 'fuzzy',
      taskDimensionId: 'research-task-property-risk-baseline',
      dataDimensionIds: ['research-data-property-inspection', 'research-data-claims-history', 'research-data-actuarial-models'],
      userProfileDimensionId: 'research-up-actuary',
      patternType: 'reasoning',
      exampleQuestions: [
        'Hurricane zone property — but only 1 historical claim on file. How confident is our risk estimate?',
        'Wildfire-exposed property with no prior losses. Does catastrophe model override zero-loss history?',
        'Does this loss trigger our reinsurance treaty? Claims database shows incomplete treaty documentation.',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Catastrophe exposure with sparse loss history. Reinsurance thresholds and treaty terms unclear. Confidence < 40%. Requires qualified actuary and reinsurance specialist review before binding.',
      confidence: 26,
    },
  ],

  'doc-intelligence': [
    {
      id: 'doci-F-01',
      name: 'Conflicting Income Documentation — Manual Verification Required',
      description: 'Income verification task finds conflicting figures across W-2 (shows $85K), paystubs (shows $92K YTD), and bank statements (showing lower deposits). Agent cannot determine which is accurate without manual employment verification or accountant review. DTI cannot be calculated until resolved.',
      tier: 'fuzzy',
      taskDimensionId: 'doci-task-income-verification',
      dataDimensionIds: ['doci-data-income-docs', 'doci-data-loan-apps'],
      userProfileDimensionId: 'doci-up-auditor',
      patternType: 'reasoning',
      exampleQuestions: [
        'W-2 shows different income than paystubs and bank statements — which should I use for DTI?',
        'Applicant\'s stated income on application doesn\'t match any of the verification documents.',
        'Bank deposits don\'t align with stated employment income — possible second job or irregular compensation?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Income conflict across three documents. W-2 vs. paystubs vs. bank deposits diverge by >10%. Agent cannot proceed with DTI calculation—escalate to underwriter for manual verification.',
      confidence: 24,
    },
    {
      id: 'doci-F-02',
      name: 'Regulatory Compliance Gap — Fair Lending Review Required',
      description: 'Compliance validation detects a potential fair lending violation: application denial is being recommended based on credit score + DTI combination, but the same applicant profile in protected class (race/gender signals from application) shows higher denial rate than non-protected cohort. Agent cannot proceed without compliance officer fair lending review per Regulation B.',
      tier: 'fuzzy',
      taskDimensionId: 'doci-task-compliance-validation',
      dataDimensionIds: ['doci-data-credit-bureau', 'doci-data-loan-apps'],
      userProfileDimensionId: 'doci-up-procurement',
      patternType: 'reasoning',
      exampleQuestions: [
        'Application meets credit/DTI minimums but denial is recommended — does this pass fair lending rules?',
        'My portfolio shows 15% denial rate overall but 22% for certain demographic groups — is this a fair lending issue?',
        'The agent flagged a potential Regulation B concern — what should I do before issuing the adverse action?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Fair lending flag triggered: decision variance detected by protected class. Agent cannot issue denial without compliance officer adjudication per ECOA/Regulation B.',
      confidence: 30,
    },
  ],

  'decision-workflow': [
    {
      id: 'dw-F-01',
      name: 'Emergency Triage with Incomplete Patient Records',
      description: 'Emergency triage task is triggered but patient EHR is missing critical allergy and medication history. Insurance eligibility lookup also returns inactive coverage. Agent cannot safely triage or escalate — physician must intervene immediately to assess clinical risk.',
      tier: 'fuzzy',
      taskDimensionId: 'dw-task-clinical-triage',
      dataDimensionIds: ['dw-data-patient-records', 'dw-data-insurance-benefits'],
      userProfileDimensionId: 'dw-up-nurse',
      patternType: 'reasoning',
      exampleQuestions: [
        'Patient presenting with acute symptoms but their EHR shows incomplete allergy history.',
        'Need to triage this emergency patient but their insurance shows as inactive.',
        'Critical patient flag triggered — EHR is missing medication list for last 6 months.',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Critical EHR gaps detected during emergency triage. Insurance status unverified. Insurance coverage lapsed. Autonomous decision creates clinical liability — escalate to on-call physician immediately with all available context.',
      confidence: 18,
    },
    {
      id: 'dw-F-02',
      name: 'Cross-Provider Referral with Insurance Network Conflict',
      description: 'Specialist referral is clinically appropriate but the recommended provider is not in the patient\'s insurance network. Insurance coverage would be out-of-network with significantly higher out-of-pocket costs. Care coordinator cannot decide whether to refer to in-network alternative or recommend out-of-network — requires physician and care coordinator joint decision.',
      tier: 'fuzzy',
      taskDimensionId: 'dw-task-appointment-scheduling',
      dataDimensionIds: ['dw-data-provider-network', 'dw-data-insurance-benefits'],
      userProfileDimensionId: 'dw-up-care-coordinator',
      patternType: 'reasoning',
      exampleQuestions: [
        'The best cardiologist for this patient is out-of-network — what should I recommend?',
        'Insurance shows out-of-network coverage is only 60% — should I refer in-network instead?',
        'Patient condition may benefit from a specific specialist who isn\'t in-network. How do I proceed?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Clinical appropriateness conflicts with insurance network status and cost implications. Out-of-network provider is best match for patient condition but carries 40% higher out-of-pocket expense. Requires joint physician-coordinator decision with patient informed consent.',
      confidence: 22,
    },
  ],

  'coding-agent': [
    {
      id: 'ca-F-01',
      name: 'Security Review with Unresolved CVE Impact',
      description: 'Security review identifies a critical CVE in a third-party dependency that is also referenced in the API documentation as a required integration. Patching the dependency would break the documented API contract. A security engineer and the API owner must jointly decide on remediation strategy.',
      tier: 'fuzzy',
      taskDimensionId: 'ca-task-security-review',
      dataDimensionIds: ['ca-data-codebase-repo', 'ca-data-api-docs'],
      userProfileDimensionId: 'ca-up-architect',
      patternType: 'reasoning',
      exampleQuestions: [
        'There\'s a critical CVE in lodash but our API docs say we must use this exact version.',
        'Upgrading the auth library would fix the vulnerability but break three documented endpoints.',
        'Security scan flagged a dependency that we can\'t replace without a major API redesign.',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'CVE patch and API contract are mutually exclusive. Automated remediation would either leave a vulnerability or break production. Security engineer + API owner must jointly triage.',
      confidence: 27,
    },
    {
      id: 'ca-F-02',
      name: 'Conflicting Remediation Procedures Across Runbooks',
      description: 'Incident response surfaces two runbooks that prescribe contradictory remediation fixes for the same incident type. One runbook mandates immediate service termination while another requires gradual traffic shifting. The conflict exists at the mitigation layer — no automated decision can resolve it without incident commander adjudicating the remediation strategy.',
      tier: 'fuzzy',
      taskDimensionId: 'ca-task-root-cause-analysis',
      dataDimensionIds: ['ca-data-incident-runbooks', 'ca-data-remediation-procedures', 'ca-data-service-topology'],
      userProfileDimensionId: 'ca-up-incident-commander',
      patternType: 'reasoning',
      exampleQuestions: [
        'Our runbook says kill the service but the DR playbook says drain and shift traffic gradually.',
        'Two different teams published conflicting remediation procedures for the same error class.',
        'I\'m getting conflicting guidance from our runbooks — which one takes priority?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Runbook remediation procedures are in direct conflict on a critical mitigation decision. Any automated resolution risks incomplete recovery. Incident commander decision required.',
      confidence: 33,
    },
  ],

  'ops-agent': [
    {
      id: 'ops-F-01',
      name: 'Rollback Required — Data Integrity Risk',
      description: 'Rollback management detects a mid-migration schema change that was partially applied. Historical logs show the rollback checkpoint is corrupted. Proceeding forward risks data loss; rolling back risks orphaned records. A DBA must manually inspect and decide the recovery path.',
      tier: 'fuzzy',
      taskDimensionId: 'ops-task-rollback-management',
      dataDimensionIds: ['ops-data-migration-schemas', 'ops-data-historical-logs'],
      userProfileDimensionId: 'ops-up-database-admin',
      patternType: 'reasoning',
      exampleQuestions: [
        'The migration was 60% complete when it failed — can we safely roll back?',
        'The rollback checkpoint file appears corrupted. How do we recover?',
        'Schema migration left the database in a partially applied state — what\'s the safest next step?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Rollback checkpoint is corrupted. Forward and backward paths both carry data integrity risk. Agent cannot choose without information loss. DBA must manually inspect before any action.',
      confidence: 19,
    },
    {
      id: 'ops-F-02',
      name: 'SLA Breach with Cascading Root Cause Ambiguity',
      description: 'SLA tracking detects a breach, but job queue analysis and historical logs each point to a different root cause. The cascading failure has multiple plausible origins that cannot be disambiguated algorithmically. Ops manager must review both logs in context to determine the true origin and correct remediation.',
      tier: 'fuzzy',
      taskDimensionId: 'ops-task-sla-tracking',
      dataDimensionIds: ['ops-data-job-queue', 'ops-data-historical-logs'],
      userProfileDimensionId: 'ops-up-ops-manager',
      patternType: 'reasoning',
      exampleQuestions: [
        'We\'ve breached our 99.9% SLA but I can\'t tell if it\'s the scheduler or the upstream feed.',
        'The queue shows a backlog but logs say jobs completed normally — what broke first?',
        'SLA alert fired three hours after the actual failure — how do I trace back the cascade?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Root cause ambiguous between job queue and historical logs. Cascading failure with multiple plausible origins. Ops manager must adjudicate before remediation to avoid treating a symptom.',
      confidence: 32,
    },
  ],

  'onprem-assistant': [
    {
      id: 'onprem-F-01',
      name: 'Classified Document Access Anomaly — Security Escalation',
      description: 'Anomaly detection identifies an unusual access pattern against classified documents that the audit ledger cannot fully explain. The access signature matches both a legitimate automated process and a known exfiltration pattern. Agent cannot clear or flag definitively — Security Officer must investigate.',
      tier: 'fuzzy',
      taskDimensionId: 'onprem-task-anomaly-detection',
      dataDimensionIds: ['onprem-data-classified-docs', 'onprem-data-audit-ledger'],
      userProfileDimensionId: 'onprem-up-security-officer',
      patternType: 'reasoning',
      exampleQuestions: [
        'The audit log shows an access pattern on TOP SECRET files that matches our backup process but at an unusual hour.',
        'An anomaly flag fired on document ALPHA-7 — should I treat this as a security incident?',
        'Access to classified files spiked last night and I can\'t tell if it was an automated scan or a breach.',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Access pattern is consistent with both legitimate automation and exfiltration. Audit ledger is incomplete for the time window. Security Officer must review raw access logs before classification.',
      confidence: 17,
    },
    {
      id: 'onprem-F-02',
      name: 'Contradictory Compliance Rules — Legal Counsel Required',
      description: 'Policy lookup surfaces a direct contradiction between two active compliance rules — one mandates data retention for 7 years while the other requires deletion within 90 days for the same document class. Agent cannot select which rule applies without creating a compliance violation. Legal counsel must adjudicate.',
      tier: 'fuzzy',
      taskDimensionId: 'onprem-task-policy-lookup',
      dataDimensionIds: ['onprem-data-policy-manual', 'onprem-data-compliance-rules'],
      userProfileDimensionId: 'onprem-up-legal-counsel',
      patternType: 'reasoning',
      exampleQuestions: [
        'Our data retention policy says 7 years but GDPR says delete after 90 days for this document type.',
        'Two active compliance directives conflict on how long to keep these audit records.',
        'Which regulation takes precedence — the internal policy or the regulatory requirement?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Active policy manual and compliance ruleset are in direct contradiction. Either action creates a regulatory violation. Agent must pause — legal counsel sign-off required before any data handling.',
      confidence: 23,
    },
  ],

  'multimodal-agent': [
    {
      id: 'multimodal-F-01',
      name: 'Multi-Format Content with Conflicting Policy Signals',
      description: 'Content moderation detects a persistent conflict across multiple modalities: video content is flagged but audio track passes policy checks, or visual frames violate guidelines while audio description is acceptable. The conflict spans multiple content pieces and may indicate encoding issues or policy boundary ambiguity. Human review is required before approval.',
      tier: 'fuzzy',
      taskDimensionId: 'multimodal-task-content-moderation',
      dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-audio-transcripts'],
      userProfileDimensionId: 'multimodal-up-content-moderator',
      patternType: 'reasoning',
      exampleQuestions: [
        'Video frames are flagged for policy violation but the audio transcript passes all checks.',
        'Visual content violates guidelines across multiple clips but audio is acceptable.',
        'Moderation signals contradict across video and audio — which policy takes precedence?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Policy violation signal mismatch across video and audio modalities. Cannot determine if encoding artifact, policy boundary case, or genuine conflict. Content moderator must review originals before final approval.',
      confidence: 34,
    },
    {
      id: 'multimodal-F-02',
      name: 'Culturally Sensitive Content Requiring Regional Policy Adjudication',
      description: 'Content moderation detects that flagged content is restricted in one region\'s policy but allowed in another geographic market. The content may be culturally appropriate in some contexts but prohibited elsewhere. No automated rule can resolve the conflict without determining which regional policy applies to this distribution channel. A regional policy expert must adjudicate before content is published.',
      tier: 'fuzzy',
      taskDimensionId: 'multimodal-task-regional-moderation',
      dataDimensionIds: ['multimodal-data-content-library', 'multimodal-data-policy-database'],
      userProfileDimensionId: 'multimodal-up-policy-specialist',
      patternType: 'reasoning',
      exampleQuestions: [
        'This content is flagged for Europe but approved for US market — which policy applies?',
        'Regional guidelines conflict on cultural sensitivity — which jurisdiction takes precedence?',
        'Content violates one region\'s policy but is standard in another — how do we handle distribution?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Regional policy conflict on content approval. Cannot determine applicable jurisdiction without distribution context. Policy specialist must determine which region\'s rules apply before publication.',
      confidence: 29,
    },
  ],

  'consumer-chat': [
    {
      id: 'consumer-F-01',
      name: 'High-Value Complaint with Churn Signal — Retention Escalation',
      description: 'Complaint handling task detects strong negative sentiment combined with explicit churn intent. Conversation history shows this is a repeat complaint with two previous unresolved tickets. User profiles indicate a high-value customer. Standard resolution scripts are insufficient — retention specialist must intervene with a bespoke offer before the agent responds.',
      tier: 'fuzzy',
      taskDimensionId: 'consumer-task-complaint-handling',
      dataDimensionIds: ['consumer-data-user-profiles', 'consumer-data-conversation-history'],
      userProfileDimensionId: 'consumer-up-retention-specialist',
      patternType: 'reasoning',
      exampleQuestions: [
        'I\'ve raised this issue three times and nothing has been fixed — I\'m cancelling.',
        'This is my last attempt before switching to a competitor. I need a real answer.',
        'As a premium member for 5 years, this experience is unacceptable.',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'High churn signal from VIP customer with unresolved repeat complaint. Standard scripts risk accelerating defection. Retention specialist must approve response and authorise a retention offer.',
      confidence: 26,
    },
    {
      id: 'consumer-F-02',
      name: 'Personalization Conflict Across Loyalty Tiers',
      description: 'Personalization engine detects a conflict between the user\'s stored preference vectors, their loyalty tier assignment, and their recent conversation history. Each source recommends a mutually exclusive action. Agent cannot choose without invalidating one source — customer service team must manually reconcile the profile before any personalised response is issued.',
      tier: 'fuzzy',
      taskDimensionId: 'consumer-task-personalization',
      dataDimensionIds: ['consumer-data-preference-vectors', 'consumer-data-user-profiles', 'consumer-data-conversation-history'],
      userProfileDimensionId: 'consumer-up-customer-service-team',
      patternType: 'reasoning',
      exampleQuestions: [
        'My recommendations don\'t match my loyalty tier or my past purchases.',
        'I\'m getting Gold tier offers but my account shows me as Silver.',
        'The chat gave me a discount I\'m not sure I\'m eligible for — can you confirm?',
      ],
      activatedComponents: FUZZY_COMPONENTS,
      ambiguityNotes: 'Three customer data sources produce mutually exclusive personalization decisions. Acting on any single source invalidates the others. Customer service team must reconcile profile state before response.',
      confidence: 31,
    },
  ],
}

// ============================================================================
// LAZY PAYLOAD CACHE — built on first access per tile
// ============================================================================

const payloadCache = new Map<string, PatternsPayload>()

export function getCombinatorialPatternsData(
  tileId: string
): PatternsPayload | null {
  // Return cached if available
  if (payloadCache.has(tileId)) return payloadCache.get(tileId)!

  const analysis = getDimensionAnalysisData(tileId)
  const meta = TILE_META[tileId]
  if (!analysis || !meta) return null

  // Build payload with empty patterns array → triggers full power-set generation
  const payload = buildPatternsPayload(analysis, [], meta.agentName, meta.description)

  // Inject hand-crafted fuzzy patterns if the tile has none from auto-generation
  const fuzzyOverrides = FUZZY_OVERRIDE_PATTERNS[tileId]
  if (fuzzyOverrides && fuzzyOverrides.length > 0 && payload.tierBreakdown.fuzzy === 0) {
    payload.patterns.push(...fuzzyOverrides)
    payload.validPatterns += fuzzyOverrides.length
    payload.tierBreakdown.fuzzy += fuzzyOverrides.length
    // Register the new data combo IDs so the matrix picks them up
    for (const fp of fuzzyOverrides) {
      if (!payload.dataDimensions.includes(fp.dataDimensionIds.join('+'))) {
        payload.dataDimensions.push(fp.dataDimensionIds.join('+'))
      }
      if (fp.toolStateDimensionId && !payload.toolStateDimensions.includes(fp.toolStateDimensionId)) {
        payload.toolStateDimensions.push(fp.toolStateDimensionId)
      }
    }
  }

  payloadCache.set(tileId, payload)
  return payload
}
