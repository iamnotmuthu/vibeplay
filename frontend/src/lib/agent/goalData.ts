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
    'Build an agent that answers customer questions about our product, policies, and pricing using our existing knowledge base — with clear boundaries on what it will and won\'t answer autonomously.',
  decomposition: {
    primaryActions: ['Retrieve', 'Answer'],
    secondaryActions: ['Clarify', 'Escalate'],
    primaryData: ['Customer Questions'],
    supportingData: ['Product Knowledge Base', 'Pricing Tables', 'Policy Documents'],
    reasoning:
      'Single-intent retrieval loop. Retrieve handles 80% of queries via direct knowledge base lookup. Answer composes a response grounded in retrieved context. Clarify triggers only when entity is ambiguous (e.g., user asks about "the plan" without specifying which one). Escalate routes to human when confidence is below threshold or query is out of scope. Alternative considered: combining Retrieve + Answer into one step, but separation allows different tool invocations and independent failure handling.',
    trustBoundaryHints: {
      autonomous: ['Product FAQs', 'Pricing lookups', 'Office hours', 'Feature explanations'],
      supervised: ['Policy interpretation', 'Account-specific pricing', 'Refund eligibility'],
      escalation: ['Billing disputes', 'Legal questions', 'Complaints', 'Out-of-scope queries'],
    },
  },
  dataSources: [
    {
      name: 'Product Knowledge Base',
      domain: 'pure-text',
      description: 'FAQ articles, product documentation, and how-to guides',
      technicalNote: 'Markdown/HTML corpus. Average 1,200 tokens per document. 342 documents (~410k tokens total). Hybrid retrieval: BM25 pre-filter + embedding search.',
      updateFrequency: 'daily',
    },
    {
      name: 'Pricing Tables',
      domain: 'table-in-doc',
      description: 'Plan comparison tables and feature matrices',
      technicalNote: 'Structured tables embedded in PDF/HTML. 12 pricing pages with 3-5 tables each. Layout-aware extraction required for column alignment.',
      updateFrequency: 'daily',
    },
    {
      name: 'Policy Documents',
      domain: 'pure-text',
      description: 'Return policies, SLA terms, and compliance statements',
      technicalNote: '8 policy documents, average 2,400 tokens each (~19k tokens total). Long-form text with nested sections. Keyword filters for high-precision clause matching.',
      updateFrequency: 'static',
    },
  ],
  businessSummary:
    'A knowledge retrieval agent that finds the right answer from your existing documentation and delivers it clearly. Key design decision: the agent answers product questions autonomously, but routes policy interpretations through supervised review and escalates billing disputes to your team.',
  technicalSummary:
    'Single-intent classification feeding a hybrid retrieval pipeline (BM25 + embedding). Two data domains: pure text (knowledge base, policies) and table-in-document (pricing). No cross-system joins. Activates ~12 of 26 components across ingestion (input validation), routing (request classification), context (RAG pipeline, re-ranking), execution (knowledge base queries), output (hallucination check, citation linking), and ops (logging).',
  keyRisk: 'If your knowledge base goes stale, answers become unreliable. Your agent tracks document freshness automatically and flags outdated content. Questions it can\'t answer get routed to your team instead of guessing.',
  complexityProfile: {
    interactionPaths: 42,
    trustBoundaries: 2,
    integrations: 1,
    stateModel: 'stateless',
    failureModes: 2,
    latencyRequirement: 'relaxed',
  },
}

// ─── Document Intelligence Agent ──────────────────────────────────────────

const docIntelGoal: GoalDataPayload = {
  goalStatement:
    'Build an agent that processes incoming contracts and invoices — extracting key terms, flagging risk conditions against a known taxonomy, and generating structured summary reports for legal review.',
  decomposition: {
    primaryActions: ['Extract', 'Classify'],
    secondaryActions: ['Flag', 'Summarize', 'Escalate'],
    primaryData: ['Contracts', 'Invoices'],
    supportingData: ['Risk Taxonomy', 'Clause Library', 'Vendor Registry'],
    reasoning:
      'Multi-format extraction goal with a secondary classification loop. Primary path handles document parsing across PDF/DOCX formats. Classification scores extracted clauses against the risk taxonomy. Flag path marks deviations where extracted terms fall outside standard ranges. Escalation triggers when risk severity exceeds "medium" or when non-standard clauses have no match in the clause library. Summarize produces structured output only after classification completes. Alternative considered: parallel extraction + classification, but sequential ordering catches format errors before classification, preventing garbage-in propagation.',
    trustBoundaryHints: {
      autonomous: ['Standard clause extraction', 'Invoice line-item parsing', 'Known vendor lookups'],
      supervised: ['Non-standard clause flagging', 'Risk severity scoring', 'Summary generation'],
      escalation: ['High-severity risk conditions', 'Unrecognized contract formats', 'Missing vendor records'],
    },
  },
  dataSources: [
    {
      name: 'Contracts',
      domain: 'table-in-doc',
      description: 'Legal agreements with embedded tables for payment terms and SLAs',
      technicalNote: 'PDF/DOCX with mixed text + tables. Average 8,200 tokens per contract body (excludes exhibits/schedules). 150+ contract variants. Vision + layout-aware parsing for scanned documents.',
      updateFrequency: 'daily',
    },
    {
      name: 'Invoices',
      domain: 'table-in-doc',
      description: 'Line-item invoices with amounts, dates, and approval status',
      technicalNote: 'Structured table extraction. 6 format variations across vendors. Average 1,400 tokens per invoice. Column alignment critical for amount parsing.',
      updateFrequency: 'daily',
    },
    {
      name: 'Risk Taxonomy',
      domain: 'db-single',
      description: 'Categorized risk conditions with severity thresholds',
      technicalNote: 'Single lookup table based on ALM contract taxonomy. 87 risk conditions across 12 categories. Weighted severity scoring (1-5 scale).',
      updateFrequency: 'static',
    },
    {
      name: 'Clause Library',
      domain: 'pure-text',
      description: 'Standard and non-standard clause templates for comparison',
      technicalNote: '156 clause variants. Used for deviation scoring via hybrid BM25 + embedding similarity. Average 450 tokens per clause.',
      updateFrequency: 'static',
    },
    {
      name: 'Vendor Registry',
      domain: 'db-single',
      description: 'Known vendors with contract history and compliance status',
      technicalNote: 'Single DB table. 2,340 active vendor records across 8 procurement categories. Includes contract count, last review date, compliance flags.',
      updateFrequency: 'daily',
    },
  ],
  businessSummary:
    'The agent reads contracts and invoices, pulls out the important parts, flags anything that deviates from your standards, and creates a clean summary your legal team can act on. Standard extractions run autonomously. Non-standard clauses and high-risk conditions are flagged for human review.',
  technicalSummary:
    'Multi-format extraction pipeline: vision + layout-aware parsing for contracts/invoices, single-table lookups for risk taxonomy and vendor registry, hybrid search for clause deviation scoring. Classification layer scores extracted clauses against reference library. Activates ~18 of 26 components including prompt injection detection (document-borne attacks), tool planning (multi-step extraction), and policy enforcement (risk thresholds).',
  keyRisk: 'Poorly scanned or blurry documents can lead to extraction mistakes. Your agent scores its own confidence on every extraction and sends low-confidence results to your team for review instead of guessing.',
  complexityProfile: {
    interactionPaths: 68,
    trustBoundaries: 3,
    integrations: 5,
    stateModel: 'session',
    failureModes: 3,
    latencyRequirement: 'relaxed',
  },
}

// ─── Research & Comparison Agent ──────────────────────────────────────────

const researchGoal: GoalDataPayload = {
  goalStatement:
    'Build an agent that researches vendor options across multiple sources, compares pricing and capabilities against weighted requirements, and generates a ranked recommendation report with evidence chains for procurement decisions.',
  decomposition: {
    primaryActions: ['Research', 'Compare'],
    secondaryActions: ['Rank', 'Report', 'Validate'],
    primaryData: ['Vendor Profiles'],
    supportingData: [
      'Market Pricing Data',
      'Internal Requirements Matrix',
      'Historical Vendor Performance',
      'Compliance Checklists',
    ],
    reasoning:
      'Multi-source research goal with cross-source synthesis. Primary path gathers vendor data from heterogeneous sources (text profiles, pricing databases, performance tables). Compare runs weighted scoring across the requirements matrix. Rank produces ordered output with confidence intervals. Report generates a structured document with evidence chains linking each claim to its source. Validate cross-checks claims against source material to catch hallucinated comparisons. This five-phase decomposition was chosen over a simpler "research + report" split because cross-source synthesis requires explicit comparison and validation phases to prevent hallucinated vendor claims.',
    trustBoundaryHints: {
      autonomous: ['Vendor profile retrieval', 'Pricing data lookups', 'Compliance checklist matching'],
      supervised: ['Weighted scoring results', 'Recommendation ranking', 'Final report generation'],
      escalation: ['Conflicting data across sources', 'Missing vendor data', 'Compliance failures'],
    },
  },
  dataSources: [
    {
      name: 'Vendor Profiles',
      domain: 'pure-text',
      description: 'Product descriptions, capability statements, and case studies',
      technicalNote: 'Web-scraped and uploaded text. 3,500 avg tokens per profile (range: 1,800-6,200). Variable quality due to scraping. 67 vendor profiles across 4 categories.',
      updateFrequency: 'daily',
    },
    {
      name: 'Market Pricing Data',
      domain: 'db-multi',
      description: 'Pricing benchmarks across vendors and contract types',
      technicalNote: 'Multi-table join: vendor_pricing + contract_terms + volume_discounts. 4,200 price points (vendor x product x contract type). Sparse join: ~20% of theoretical cardinality.',
      updateFrequency: 'daily',
    },
    {
      name: 'Internal Requirements Matrix',
      domain: 'table-in-doc',
      description: 'Weighted feature requirements defined by the procurement team',
      technicalNote: 'Spreadsheet with 42 weighted criteria across 6 categories. Scores range 1-5 per criterion. Total weight = 100%. Layout-aware extraction for column alignment.',
      updateFrequency: 'static',
    },
    {
      name: 'Historical Vendor Performance',
      domain: 'db-single',
      description: 'Past vendor scores, delivery metrics, and incident history',
      technicalNote: 'Single table. 890 performance records across 67 vendors. Includes delivery time, quality score, incident count, contract renewal rate.',
      updateFrequency: 'daily',
    },
    {
      name: 'Compliance Checklists',
      domain: 'pure-text',
      description: 'Regulatory and security compliance requirements',
      technicalNote: '23 checklist categories with pass/fail criteria. Average 800 tokens per checklist. Keyword matching + structured extraction for binary compliance flags.',
      updateFrequency: 'static',
    },
  ],
  businessSummary:
    'The agent gathers information on multiple vendors, compares them against your weighted requirements, and produces a ranked recommendation with clear evidence trails. Scoring results go through supervised review. Conflicting data across sources triggers escalation for human judgment.',
  technicalSummary:
    'Multi-hop research pipeline with cross-source synthesis. Five data domains: pure text (profiles, compliance), table-in-doc (requirements), single DB (performance), multi-DB join (pricing). Weighted scoring across heterogeneous sources with explicit hallucination check on vendor claims. Activates ~22 of 26 components including context graph (entity linking across vendors), hallucination check (claim verification against source), and citation linking (evidence chains).',
  keyRisk: 'When vendor data is incomplete, comparisons can become unreliable. Your agent validates every claim against its sources, shows confidence levels on rankings, and requires your team to sign off on final recommendations.',
  complexityProfile: {
    interactionPaths: 91,
    trustBoundaries: 3,
    integrations: 4,
    stateModel: 'session',
    failureModes: 4,
    latencyRequirement: 'moderate',
  },
}

// ─── Decision & Workflow Agent (Dental Practice) ─────────────────────────────

const decisionGoal: GoalDataPayload = {
  goalStatement:
    'Build a patient support agent for a dental practice that handles appointments, insurance verification, treatment plan inquiries, emergency triage, and post-procedure follow-ups — with hard-coded clinical safety boundaries and three distinct autonomy tiers.',
  decomposition: {
    primaryActions: ['Resolve', 'Route'],
    secondaryActions: ['Execute', 'Escalate', 'Follow-up'],
    primaryData: ['Patient Issues'],
    supportingData: [
      'Practice Knowledge Base',
      'Scheduling System',
      'Insurance Database',
      'Clinical Records',
      'Emergency Protocols',
      'Follow-up Templates',
    ],
    reasoning:
      'Multi-domain goal spanning clinical, administrative, and emergency boundaries. Primary Resolve loop handles routine queries (office hours, appointment status) with autonomous resolution. Route determines which tier each query belongs to based on intent classification and clinical keyword detection. Execute handles API writes (booking appointments, running insurance lookups) under read-only or write-with-confirmation access patterns. Escalate is reserved for clinical decisions (treatment advice, medication questions, emergency symptoms) requiring clinician supervision or immediate human handoff. Follow-up handles proactive outreach (post-procedure check-ins) via templated messages with provider review. The three-tier trust boundary (autonomous, supervised, escalation) is the core architectural decision: no clinical content is ever generated autonomously.',
    trustBoundaryHints: {
      autonomous: ['Office hours', 'Appointment status', 'Directions', 'General dental FAQs', 'Appointment booking'],
      supervised: ['Insurance coverage lookups', 'Treatment plan inquiries', 'Post-procedure follow-ups', 'Billing questions'],
      escalation: ['Emergency symptoms', 'Medication questions', 'Clinical advice', 'Acute pain reports', 'Post-surgical complications'],
    },
  },
  dataSources: [
    {
      name: 'Practice Knowledge Base',
      domain: 'pure-text',
      description: 'Office hours, procedures offered, staff bios, general FAQs',
      technicalNote: 'Markdown corpus. 189 articles. Average 600 tokens. Hybrid retrieval: BM25 for exact-match queries + embedding search for semantic questions.',
      updateFrequency: 'daily',
    },
    {
      name: 'Scheduling System',
      domain: 'api-live',
      description: 'Real-time appointment availability, booking, and rescheduling',
      technicalNote: 'REST API with 15-minute TTL caching layer for slot availability. Write operations require confirmation step. Rate limit: 60 req/min. Fallback: escalation to front desk on API timeout (>3s).',
      updateFrequency: 'realtime',
    },
    {
      name: 'Insurance Database',
      domain: 'db-multi',
      description: 'Patient coverage details, remaining maximums, co-pays, and plan specifics',
      technicalNote: 'Multi-table join: patient_insurance + coverage_matrix + procedure_codes + annual_limits. 12,400 patient-plan coverage records. Join cardinality: sparse (~30% of theoretical combinations). Row-level security: patient can only access own records.',
      updateFrequency: 'daily',
    },
    {
      name: 'Clinical Records',
      domain: 'db-multi',
      description: 'Treatment history, provider notes, imaging reports, and medication lists',
      technicalNote: 'Multi-table join: patient_records + treatment_plans + provider_notes + imaging. HIPAA-scoped access: provider-patient role mapping, full audit trail (user ID, timestamp, accessed record IDs). Agent has read-only access, never generates clinical content.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Emergency Protocols',
      domain: 'pure-text',
      description: 'Triage decision trees and emergency escalation procedures',
      technicalNote: '14 protocol paths with structured escalation triggers (procedure type + symptom keywords + severity indicators). Emergencies escalate to on-call provider via EHR alert. Hard-coded: no autonomous clinical decisions.',
      updateFrequency: 'static',
    },
    {
      name: 'Follow-up Templates',
      domain: 'pure-text',
      description: 'Post-procedure check-in templates with provider review workflow',
      technicalNote: '23 procedure-specific templates. Agent fills template from treatment record, provider reviews before send. Average 400 tokens per template.',
      updateFrequency: 'static',
    },
  ],
  businessSummary:
    'A patient support agent that handles everything from simple appointment questions to complex insurance lookups, and knows exactly when to bring in your clinical team. The critical design decision: the agent never generates clinical advice autonomously. Appointment and FAQ queries run on their own. Insurance and treatment plan questions get supervised responses. Emergencies and clinical questions always route to your providers.',
  technicalSummary:
    'Multi-domain goal spanning 6 data environments: pure text (knowledge base, protocols, templates), live API (scheduling with caching + fallback), multi-DB joins (insurance with row-level security, clinical records with HIPAA audit trail). Three distinct trust tiers: autonomous pipeline (FAQs, scheduling), supervised pipeline (insurance, treatment plans, follow-ups), escalation coordinator (clinical, emergency). All 26 components activated including PII security scanner, context access control, policy enforcement, and drift detection.',
  keyRisk: 'Patient safety comes first. Your agent never makes clinical decisions on its own. It detects emergency symptoms within seconds and routes them to your clinical team immediately. Every interaction with patient records is fully audited for HIPAA compliance.',
  complexityProfile: {
    interactionPaths: 127,
    trustBoundaries: 4,
    integrations: 5,
    stateModel: 'multi-turn',
    failureModes: 6,
    latencyRequirement: 'strict',
  },
  complianceRequired: ['HIPAA', 'State Dental Board'],
}

// ─── SaaS Copilot Agent ───────────────────────────────────────────────────

const saasGoal: GoalDataPayload = {
  goalStatement:
    'Build a copilot that helps users navigate a SaaS platform through natural language — creating records, generating reports, and updating configurations with confirmation gates.',
  decomposition: {
    primaryActions: ['Execute', 'Report'],
    secondaryActions: ['Confirm', 'Rollback', 'Escalate'],
    primaryData: ['User Commands'],
    supportingData: ['Platform API', 'User Permissions', 'Audit Log'],
    reasoning:
      'Command execution goal with mandatory confirmation gates. Primary Execute path translates natural language commands into platform API calls (create records, update configs). Report generates summaries of completed actions with audit trails. Confirm provides human review before write operations (create/update). Rollback handles action reversal on user request or permission failure. Escalate routes to admins when permission checks fail or the command falls outside user scope. This decomposition was chosen over a simpler "execute + report" because SaaS operations require explicit confirmation before state changes and trackable rollback capability for operational safety.',
    trustBoundaryHints: {
      autonomous: ['Read operations', 'Report generation', 'Query execution'],
      supervised: ['Record creation', 'Configuration updates', 'Bulk operations'],
      escalation: ['Permission denied', 'Cross-tenant operations', 'Destructive changes'],
    },
  },
  dataSources: [
    {
      name: 'Platform API',
      domain: 'api-live',
      description: 'SaaS platform endpoints for CRUD operations and reporting',
      technicalNote: 'REST API with 28 endpoints (12 read, 9 write, 7 config). OAuth 2.0 scoped access by user role. Write operations require idempotency keys. Rate limit: 1000 req/min. Average latency: 340ms for writes.',
      updateFrequency: 'realtime',
    },
    {
      name: 'User Permissions',
      domain: 'db-single',
      description: 'Role-based access control matrix and feature entitlements',
      technicalNote: 'Single lookup table with 156 active users across 7 roles. Role definitions: Admin, Manager, User, Viewer. Includes feature flags per role and object-level permissions. Updated hourly.',
      updateFrequency: 'daily',
    },
    {
      name: 'Audit Log',
      domain: 'db-single',
      description: 'Complete action history with timestamps, user IDs, and command parameters',
      technicalNote: '2.1M records in audit table. Indexed by user_id + timestamp. Retention: 90 days. Used for rollback tracking and compliance reporting.',
      updateFrequency: 'realtime',
    },
  ],
  businessSummary:
    'A conversational copilot that translates natural language commands into platform actions. Users say "create a report for Q4 revenue" and the agent handles the API calls, with human confirmation for writes. All actions are logged and reversible.',
  technicalSummary:
    'Natural language command interpreter with permission-gated API execution. Three data domains: live API (platform endpoints with rate limiting), single DB (role-based access control), audit log (reversibility tracking). Command classification routes to read vs. write pipelines. Write path requires confirmation before API invocation. Activates ~20 of 26 components including intent classification, permission checking, command planning, audit logging, and rollback execution.',
  keyRisk: 'Accidental changes are the biggest concern. Your agent always asks for confirmation before making any changes, checks user permissions before every action, and keeps a full log so anything can be reversed.',
  complexityProfile: {
    interactionPaths: 74,
    trustBoundaries: 3,
    integrations: 3,
    stateModel: 'session',
    failureModes: 3,
    latencyRequirement: 'moderate',
  },
}

// ─── Long-Running Ops Agent ───────────────────────────────────────────────

const opsGoal: GoalDataPayload = {
  goalStatement:
    'Build an agent that manages overnight batch jobs, data pipeline orchestration, and scheduled report generation with real-time status updates and failure recovery.',
  decomposition: {
    primaryActions: ['Orchestrate', 'Monitor'],
    secondaryActions: ['Retry', 'Alert', 'Escalate'],
    primaryData: ['Job Definitions'],
    supportingData: ['Pipeline Registry', 'Execution History', 'Alert Rules'],
    reasoning:
      'Long-running asynchronous goal with monitoring feedback loops. Primary Orchestrate path reads job definitions and submits them to the job queue in dependency order (DAG evaluation). Monitor tracks execution status via polling and webhook callbacks, updating dashboards in real-time. Retry handles transient failures (network timeouts, temporary service unavailability) with exponential backoff (3 attempts, 5min initial delay). Alert triggers notifications when failure thresholds are exceeded or SLAs are at risk. Escalate routes to on-call ops for unrecoverable failures or manual intervention. This decomposition separates orchestration (build and submit) from monitoring (track and respond) to enable independent scaling and recovery strategies.',
    trustBoundaryHints: {
      autonomous: ['Job submission', 'Status polling', 'Transient error retry'],
      supervised: ['Alert escalation', 'Alert rule thresholds', 'Dashboard updates'],
      escalation: ['Unrecoverable failures', 'SLA breaches', 'Pipeline deadlocks'],
    },
  },
  dataSources: [
    {
      name: 'Pipeline Registry',
      domain: 'db-single',
      description: 'Job definitions with dependencies, schedules, and resource requirements',
      technicalNote: 'Single table with 87 job definitions. Includes DAG structure (parent_job_id field), cron schedules, timeout values (range: 5min to 24hrs), resource class (small/medium/large). Updated quarterly.',
      updateFrequency: 'daily',
    },
    {
      name: 'Job Queue',
      domain: 'api-live',
      description: 'Task queue for submitting and tracking long-running jobs',
      technicalNote: 'REST API with async job submission. Supports bulk job creation (up to 100 jobs). Webhook callbacks for completion/failure. Average queue depth: 8-12 jobs. Median execution time: 2.4 hours.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Execution History',
      domain: 'db-multi',
      description: 'Historical records of past job runs with timing, status, and failure reasons',
      technicalNote: 'Multi-table join: job_runs + run_logs + error_traces. 340k execution records (last 180 days). Indexed by job_id + run_date. Used for SLA prediction and failure pattern analysis.',
      updateFrequency: 'realtime',
    },
  ],
  businessSummary:
    'An orchestration agent that manages your nightly batch processes end-to-end. It submits jobs in the right order, watches them run, and alerts your ops team if anything goes wrong. Routine failures are retried automatically. Critical issues escalate immediately.',
  technicalSummary:
    'Async job orchestration with DAG evaluation and real-time monitoring. Three data domains: single DB (job registry with dependency metadata), live API (queue submission and webhook callbacks), multi-DB (execution history for SLA tracking). Monitoring loop uses polling + webhooks for low-latency failure detection. Retry logic implements exponential backoff with configurable attempt counts. Activates ~19 of 26 components including tool planning (DAG execution), state management (multi-turn job tracking), error recovery (retry logic), and alerting (threshold-based escalation).',
  keyRisk: 'If one job fails, downstream tasks can stall. Your agent tracks dependencies between jobs, detects failures within seconds, retries automatically with the right strategy per job type, and alerts your ops team when something needs human attention.',
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
    'Build a coding agent that assists developers with code generation, review, debugging, and refactoring — with full codebase context and sandboxed execution environments.',
  decomposition: {
    primaryActions: ['Generate', 'Review'],
    secondaryActions: ['Debug', 'Refactor', 'Test'],
    primaryData: ['Code Context'],
    supportingData: ['Codebase Index', 'Test Suite', 'Style Guide', 'Dependency Graph'],
    reasoning:
      'Multi-phase developer-assistance goal with safety boundaries. Primary Generate path takes requirements and produces code snippets with full codebase context (imports, existing patterns, style conventions). Review analyzes code for bugs, performance issues, and style violations against the style guide. Debug uses test failures and error traces to identify root causes and suggest fixes. Refactor applies transformation rules (rename, extract functions, consolidate logic) with test validation. Test runs the generated code in sandboxed environment before user integration. This five-phase decomposition was chosen over a simpler "generate + review" because code generation errors compound through integration—explicit test and refactor phases catch issues before developer merge.',
    trustBoundaryHints: {
      autonomous: ['Code generation from requirements', 'Style guide linting', 'Test execution (sandboxed)'],
      supervised: ['Code review results', 'Refactoring recommendations', 'Integration decisions'],
      escalation: ['Security issues', 'Dependency conflicts', 'Architecture violations'],
    },
  },
  dataSources: [
    {
      name: 'Codebase Index',
      domain: 'pure-text',
      description: 'Full source code with structure for context retrieval and pattern matching',
      technicalNote: 'Code corpus: 47,000 lines of TypeScript/Python. Indexed by file + function. AST parsing for symbol resolution. 2,340 functions indexed. Retrieval: hybrid BM25 + embedding search for semantic similarity.',
      updateFrequency: 'daily',
    },
    {
      name: 'Test Suite',
      domain: 'db-single',
      description: 'Unit and integration tests with execution history and coverage data',
      technicalNote: '890 test cases. Coverage: 84% lines, 76% branches. Average execution: 340s (full suite). Jest + Pytest config. Failure history available for debugging correlation.',
      updateFrequency: 'realtime',
    },
    {
      name: 'Style Guide',
      domain: 'pure-text',
      description: 'Coding standards, naming conventions, and architectural patterns',
      technicalNote: '12 style guideline documents. 240 rules across naming, structure, comments, error handling. ESLint + Prettier config included. Average 600 tokens per guideline.',
      updateFrequency: 'static',
    },
    {
      name: 'Dependency Graph',
      domain: 'db-multi',
      description: 'Module dependencies with version constraints and security advisories',
      technicalNote: 'Multi-table join: dependencies + versions + vulnerabilities. 187 direct dependencies. Transitive closure: 1,240 total. Updated daily from npm security feed.',
      updateFrequency: 'daily',
    },
  ],
  businessSummary:
    'A coding copilot that generates code snippets, reviews them against your style guide, catches bugs with test runs, and suggests refactorings—all in the context of your actual codebase. Generated code runs in a sandbox before you integrate it.',
  technicalSummary:
    'Multi-phase code generation pipeline with codebase grounding. Four data domains: pure text (source code corpus + style guide), single DB (test suite + results), multi-DB join (dependency graph with vulnerability tracking). Generation phase uses hybrid retrieval for similar code patterns. Review phase applies linting rules and dependency checks. Test phase executes in containerized sandbox with network isolation. Activates ~22 of 26 components including context retrieval (codebase search), prompt injection detection (code-borne attacks), policy enforcement (security checks), and tool planning (multi-step refactoring).',
  keyRisk: 'Code that compiles isn\'t always code that works. Your agent runs every generated snippet through tests in a sandbox before suggesting it, checks for dependency conflicts, and enforces your team\'s style guide automatically.',
  complexityProfile: {
    interactionPaths: 112,
    trustBoundaries: 4,
    integrations: 4,
    stateModel: 'multi-turn',
    failureModes: 4,
    latencyRequirement: 'moderate',
  },
}

// ─── On-Prem Secure Assistant ──────────────────────────────────────────────

const onpremGoal: GoalDataPayload = {
  goalStatement:
    'Build a secure assistant for classified environments — local inference, no external API calls, data never leaves the perimeter, with strict access control and full audit trails.',
  decomposition: {
    primaryActions: ['Retrieve', 'Answer'],
    secondaryActions: ['Classify', 'Audit', 'Escalate'],
    primaryData: ['Classified Queries'],
    supportingData: ['Local Knowledge Store', 'Access Control Matrix', 'Classification Registry'],
    reasoning:
      'Security-first retrieval goal with perimeter containment. Primary Retrieve path searches the local knowledge store (no external APIs or cloud calls). Answer generates responses using only local context, never calling external LLMs. Classify tags every query with its sensitivity level (public, internal, restricted, top-secret). Audit logs every access with user ID, timestamp, query, and result (mandatory for compliance). Escalate routes to security officer when queries involve compartmented information or access violations. This decomposition prioritizes data containment over latency: no information crosses the security perimeter.',
    trustBoundaryHints: {
      autonomous: ['Public knowledge queries', 'Unclassified data retrieval'],
      supervised: ['Restricted/classified document access', 'Cross-compartment queries'],
      escalation: ['Access denials', 'Classification violations', 'Audit anomalies'],
    },
  },
  dataSources: [
    {
      name: 'Local Knowledge Store',
      domain: 'pure-text',
      description: 'On-premise text corpus with classified documents and internal procedures',
      technicalNote: '8,340 classified documents. Total: 22M tokens. Stored on encrypted local storage. No cloud sync. Indexed for local BM25 retrieval (embedding inference also local). Classification metadata embedded in document headers.',
      updateFrequency: 'static',
    },
    {
      name: 'Access Control Matrix',
      domain: 'db-single',
      description: 'User clearance levels and compartment assignments',
      technicalNote: 'Single access control table. 340 authorized users across 5 clearance levels (unclassified to TS/SCI). Compartment assignments restrict document access per user. Hardcoded compartment logic: no LLM evaluation of permissions.',
      updateFrequency: 'daily',
    },
    {
      name: 'Classification Registry',
      domain: 'db-single',
      description: 'Security levels, handling procedures, and compartment definitions',
      technicalNote: '6 classification levels (U through TS/SCI). 23 compartments. Procedure rules (handling, retention, derivative marking). Non-negotiable: no autonomous classification decisions.',
      updateFrequency: 'static',
    },
  ],
  businessSummary:
    'A secure assistant for classified operations that answers questions using only local data. Zero external API calls, zero cloud contact. Every access is logged and audited. Access control is hardcoded, not LLM-evaluated. No information crosses the perimeter.',
  technicalSummary:
    'Perimeter-locked retrieval system with mandatory local inference. Three data domains: pure text (classified document corpus, local indexing), single DB (access control matrix with hardcoded compartment logic), classification registry (handling procedures). All inference local; no API calls. Retrieval uses local BM25 only (no embeddings requiring external models). Every query+result pair logged with user ID, timestamp, and sensitivity level. Activates ~16 of 26 components including context access control (hardcoded permission checks), audit logging (non-repudiation), and policy enforcement (classification rules).',
  keyRisk: 'The biggest risk is data leaving your perimeter. Your agent is architected with zero external calls by design. All processing stays local, access controls are hardcoded (not AI-decided), and every query is logged for audit.',
  complexityProfile: {
    interactionPaths: 58,
    trustBoundaries: 3,
    integrations: 2,
    stateModel: 'session',
    failureModes: 3,
    latencyRequirement: 'moderate',
  },
  complianceRequired: ['FedRAMP', 'ITAR'],
}

// ─── Multimodal Assistant ──────────────────────────────────────────────────

const multimodalGoal: GoalDataPayload = {
  goalStatement:
    'Build an assistant that understands and responds across text, images, audio, and video — with cross-modal reasoning and format-aware output generation.',
  decomposition: {
    primaryActions: ['Parse', 'Reason'],
    secondaryActions: ['Transcribe', 'Describe', 'Synthesize'],
    primaryData: ['Multimodal Inputs'],
    supportingData: ['Media Library', 'Transcription Index', 'Visual Ontology'],
    reasoning:
      'Cross-modal understanding goal with format-aware output. Primary Parse decodes each input modality (text tokenization, image vision encoding, audio transcription, video frame extraction). Reason integrates signals across modalities (e.g., video dialogue + visuals, image captions + text context) for semantic understanding. Transcribe converts audio/video speech to text. Describe generates textual summaries of images/video. Synthesize produces multimodal responses (text + generated images or audio). This decomposition was chosen over single-pass processing because modality fusion requires explicit parse → align → reason ordering to prevent modality-mismatch hallucinations.',
    trustBoundaryHints: {
      autonomous: ['Audio transcription', 'Image description', 'Text classification'],
      supervised: ['Cross-modal reasoning results', 'Generated content (images/audio)', 'Multimodal summaries'],
      escalation: ['Inappropriate content detection', 'Synthesis quality issues', 'Modality mismatch conflicts'],
    },
  },
  dataSources: [
    {
      name: 'Media Library',
      domain: 'pure-text',
      description: 'Indexed text descriptions, transcripts, and metadata for media assets',
      technicalNote: '12,400 media assets (8,200 images, 2,100 videos, 2,100 audio clips). Average metadata: 450 tokens per asset. Text index covers transcripts + captions + descriptions. BM25 retrieval for media search.',
      updateFrequency: 'daily',
    },
    {
      name: 'Transcription Index',
      domain: 'db-single',
      description: 'Pre-computed transcripts and speaker identification for audio/video',
      technicalNote: '4,200 transcripts (avg 2,100 tokens each). Speaker diarization for multi-speaker content. Timestamp alignment to video frames. Accuracy: 94% WER (word error rate) for clear audio.',
      updateFrequency: 'daily',
    },
    {
      name: 'Visual Feature Store',
      domain: 'db-multi',
      description: 'Pre-computed image embeddings and detected objects/scenes',
      technicalNote: 'Multi-table join: image_embeddings + detected_objects + scene_labels. 8,200 images indexed. 47 object classes detected. Scene detection: 126 scene labels. Used for visual similarity and cross-modal alignment.',
      updateFrequency: 'daily',
    },
  ],
  businessSummary:
    'An assistant that reads images, listens to audio, watches videos, and reasons across all of them. Tell it to summarize a meeting video—it extracts audio, reads the visual slides, understands the discussion, and gives you a synthesis. Outputs can be text, generated images, or audio.',
  technicalSummary:
    'Multimodal fusion pipeline with format-aware I/O. Three data domains: pure text (media metadata + transcripts, BM25 indexed), single DB (pre-computed transcripts with timestamps), multi-DB (visual embeddings + object detection). Parse phase invokes modality-specific decoders (vision for images, ASR for audio, optical flow for video). Reason phase fuses embeddings across modalities via cross-attention. Output generation invokes modality-specific synthesis (text generation, image synthesis, audio TTS). Activates ~23 of 26 components including multimodal context alignment, hallucination check (cross-modal consistency), and output synthesis planning.',
  keyRisk: 'When combining image, audio, and video, one source can overpower the others and produce misleading results. Your agent cross-checks consistency across all inputs, scores confidence per source, and flags synthetic outputs for your team to review.',
  complexityProfile: {
    interactionPaths: 105,
    trustBoundaries: 3,
    integrations: 5,
    stateModel: 'session',
    failureModes: 4,
    latencyRequirement: 'strict',
  },
}

// ─── High-Scale Consumer Chat ──────────────────────────────────────────────

const consumerGoal: GoalDataPayload = {
  goalStatement:
    'Build a consumer-facing chatbot that scales to millions of daily conversations with personalized responses, sub-second latency, and graceful degradation under load.',
  decomposition: {
    primaryActions: ['Respond', 'Personalize'],
    secondaryActions: ['Cache', 'Degrade', 'Route'],
    primaryData: ['User Messages'],
    supportingData: ['User Profiles', 'Product Catalog', 'Conversation History'],
    reasoning:
      'High-scale consumer goal with performance guardrails. Primary Respond path generates user-facing responses. Personalize inserts user context (purchase history, preferences, name) into responses without latency penalty via pre-computed profiles. Cache maintains sub-second retrieval via response caching for common intents (FAQ answers, product info). Degrade activates when load exceeds thresholds: fall back to templated responses for non-critical queries, reduce personalization depth, cache more aggressively. Route determines whether to serve from cache (cache hit), compute fresh response (computation), or return template (degradation). This decomposition prioritizes availability + latency over computation cost: graceful degradation is acceptable at scale.',
    trustBoundaryHints: {
      autonomous: ['FAQ answers', 'Product lookups', 'Cached responses', 'Templated degradation'],
      supervised: ['Refund authorization', 'Account changes', 'Complaint escalation'],
      escalation: ['Disputes', 'Fraud signals', 'Account security issues'],
    },
  },
  dataSources: [
    {
      name: 'User Profiles',
      domain: 'db-single',
      description: 'User preferences, purchase history, and engagement signals',
      technicalNote: '18.2M active user profiles. Average profile size: 2.8KB. Includes purchase history (avg 12 purchases), preferences (avg 8 tags), engagement score. Cached in Redis for <50ms lookups.',
      updateFrequency: 'daily',
    },
    {
      name: 'Product Catalog',
      domain: 'db-single',
      description: 'Product descriptions, pricing, inventory, and recommendations',
      technicalNote: '847,000 active SKUs. Average catalog size: 1.2KB per SKU. Inventory updated every 15 minutes. Recommendation rules: 34 rule sets (category, price, trending).',
      updateFrequency: 'daily',
    },
    {
      name: 'Conversation Cache',
      domain: 'api-live',
      description: 'In-memory cache for recent messages and response templates',
      technicalNote: 'Redis cluster with 2.1TB capacity. TTL: 24 hours per conversation. Cache hit rate target: 68% (measured: 64-71% during peak). Template response library: 2,340 pre-written responses for common intents.',
      updateFrequency: 'realtime',
    },
  ],
  businessSummary:
    'A chatbot built for millions of concurrent users. It personalizes every response with your customer data, but does it so fast you never notice the computation. When traffic spikes, it gracefully falls back to templates without losing quality. Conversations are cached for instant replay.',
  technicalSummary:
    'High-scale consumer pipeline with multi-tier response strategy. Three data domains: single DB (user profiles with Redis cache, product catalog), live API (response cache with TTL + template library). Personalization via pre-computed context injection (no LLM computation on user lookups). Cache-aside pattern: check cache → compute if miss → cache result → degrade if overload. Load-based degradation: compute fresh responses when load < 70%, switch to cached templates when load > 85%. Response latency SLA: p50 <200ms, p99 <800ms. Activates ~18 of 26 components including context caching, graceful degradation, load-aware routing, and personalization.',
  keyRisk: 'At high volume, outdated user profiles can cause mismatched responses. Your agent refreshes profiles hourly, pre-loads data for frequent users, and when traffic spikes beyond capacity, it gracefully switches to quality-tested templates rather than dropping requests.',
  complexityProfile: {
    interactionPaths: 64,
    trustBoundaries: 2,
    integrations: 3,
    stateModel: 'session',
    failureModes: 3,
    latencyRequirement: 'strict',
  },
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
