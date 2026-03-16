// ─── Architecture Composition Stage Data ──────────────────────────────────
// Shows how the 26-component stack composes into trust-boundary lanes.
// Each tile produces lanes that reflect its validation results:
// FAQ → 2 lanes, Doc Intel → 3 lanes, Research → 3 lanes, Dental → 4 lanes.

import type {
  ArchitectureLane,
  ArchitectureComponentConfig,
  TrustBoundary,
  CapabilityLayer,
} from '@/store/agentTypes'

// ─── Helpers ──────────────────────────────────────────────────────────────

function comp(
  id: string,
  name: string,
  layer: CapabilityLayer,
  desc: string,
  order: number,
  rationale?: string,
  predecessors?: string[],
  parameters?: Record<string, string>
): ArchitectureComponentConfig {
  return { componentId: id, name, layer, description: desc, order, rationale, predecessors, parameters }
}

function lane(
  num: number,
  label: string,
  color: string,
  boundary: TrustBoundary,
  businessDesc: string,
  flowCount: number,
  components: ArchitectureComponentConfig[]
): ArchitectureLane {
  return {
    laneNumber: num,
    label,
    color,
    trustBoundary: boundary,
    businessDescription: businessDesc,
    interactionFlowCount: flowCount,
    technicalComponents: components,
  }
}

// ─── Architecture Data ───────────────────────────────────────────────────

export interface ArchitectureStageData {
  totalComponents: number
  totalInteractionPaths?: number
  totalLanes: number
  pipelineType: string
  pipelineTypeLabel: string
  lanes: ArchitectureLane[]
}

// ═══════════════════════════════════════════════════════════════════════════
// FAQ & Knowledge Agent — 2 lanes, 12 components
// ═══════════════════════════════════════════════════════════════════════════

const FAQ_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 12,
  totalLanes: 2,
  pipelineType: 'simple-rag',
  pipelineTypeLabel: 'Single-Lane RAG Pipeline',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Direct order and shipping questions flow through a simple RAG pipeline. Questions come in, order data gets retrieved, responses go out. No reasoning chains needed.',
      112,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point — rate limits and normalizes requests', 1, 'All requests enter here regardless of complexity'),
        comp('auth', 'Authentication', 'ingestion', 'Validates caller identity', 2, 'JWT validation ensures only authorized users access the order system'),
        comp('input-validation', 'Input Validation', 'ingestion', 'Sanitizes the query', 3, 'Prevents malformed queries from reaching order lookups'),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies query type', 4, 'Is this a tracking lookup, refund question, or shipping query?'),
        comp('rag', 'RAG Pipeline', 'context', 'Retrieves matching orders and policies', 5, 'Embedding-based search against order database and FAQs', ['request-classification'], { chunkSize: '512 tokens', topK: '3' }),
        comp('reranking', 'Re-ranking', 'context', 'Scores retrieved chunks by relevance', 6, 'Cross-encoder re-scoring ensures best answer surfaces first', ['rag']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Verifies retrieved context is grounded', 7, 'Retrieved chunks must be non-contradictory and traceable before generation', ['reranking']),
        comp('response-generation', 'Response Generation', 'output', 'Composes the final answer', 8, 'Template-based response with source citations', ['hallucination-check']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Records the interaction', 9, 'Structured logging with trace IDs for every request'),
      ]
    ),
    lane(2, 'Routed to Your Team', '#ef4444', 'escalation',
      'Multi-turn clarification queries and partial matches route to human support. The agent packages context — the question, attempted retrieval, and why it could not resolve — so your team picks up without starting over.',
      16,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Identity check', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Query sanitization', 3),
        comp('request-classification', 'Request Classification', 'routing', 'Detects ambiguity or multi-turn need', 4, 'Classification confidence below 0.7 triggers escalation path'),
        comp('memory', 'Conversation Memory', 'context', 'Captures conversation history', 5, 'Multi-turn context preserved for handoff', ['request-classification']),
        comp('rag', 'RAG Pipeline', 'context', 'Attempts retrieval with augmented context', 6, 'Tries lookup with conversation context added', ['memory']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Packages context for escalation', 7, 'Bundles question + retrieval attempt + failure reason', ['rag']),
        comp('response-generation', 'Response Generation', 'output', 'Generates escalation message', 8, 'Tells the user their question is being routed to support', ['failure-handling']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Records escalation event', 9, 'Logs escalation reason for pattern analysis'),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Document Intelligence Agent — 3 lanes, 18 components
// ═══════════════════════════════════════════════════════════════════════════

const DOC_INTEL_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 18,
  totalLanes: 3,
  pipelineType: 'dual-lane',
  pipelineTypeLabel: 'Dual-Lane: Retrieval + Reasoning',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Loan document extraction flows through a tool-augmented pipeline. Credit reports, appraisals, and income verification are parsed without human input.',
      156,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point with file upload handling', 1, 'Supports multipart uploads up to 50MB'),
        comp('auth', 'Authentication', 'ingestion', 'Validates access permissions', 2, 'Document-level access control for loan apps'),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validates file format and loan packet', 3, 'Rejects unsupported formats early'),
        comp('pii-security', 'PII / Security Scanner', 'ingestion', 'Scans documents for sensitive data', 4, 'Masks SSN, loan numbers, bank accounts before processing'),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies document type', 5, 'Credit vs. appraisal vs. income vs. employment verification'),
        comp('tool-planning', 'Tool Planning', 'execution', 'Selects extraction strategy', 6, 'Routes to format parser: Equifax/Experian/TU, Appraisal Standard, W2/1040', ['request-classification'], { strategy: 'document-type-adaptive' }),
        comp('tool-execution', 'Tool Execution', 'execution', 'Runs extraction pipeline', 7, 'Bureau-specific parsing + OCR + field validation', ['tool-planning']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Verifies extracted data against source', 8, 'Every extracted field must trace to a page/section', ['tool-execution']),
        comp('response-generation', 'Response Generation', 'output', 'Formats extraction results', 9, 'JSON, table, or natural language output', ['hallucination-check']),
        comp('citation-linking', 'Citation Linking', 'output', 'Links results to source pages', 10, 'Page number and bounding box references', ['response-generation']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Records extraction metrics', 11, 'Tracks per-document extraction confidence'),
      ]
    ),
    lane(2, 'Handled with Reasoning', '#f59e0b', 'supervised',
      'Ambiguous extractions — nested tables, conflicting fields, non-standard layouts — require a reasoning chain. The agent works through the document but flags uncertainty for human review.',
      14,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Access check', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Format validation', 3),
        comp('pii-security', 'PII / Security Scanner', 'ingestion', 'Sensitive data scan', 4),
        comp('request-classification', 'Request Classification', 'routing', 'Detects extraction ambiguity', 5, 'Low-confidence format detection triggers reasoning path'),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Manages multi-step extraction', 6, 'Coordinates sequential extraction attempts', ['request-classification']),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans extraction with fallback chain', 7, 'Primary + fallback parser selection', ['workflow-orchestrator']),
        comp('tool-execution', 'Tool Execution', 'execution', 'Runs extraction with confidence scoring', 8, 'Each field gets a confidence score', ['tool-planning']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Cross-validates extracted fields', 9, 'Flags fields below 0.7 confidence', ['tool-execution']),
        comp('policy-enforcement', 'Policy Enforcement', 'output', 'Applies domain-specific extraction rules', 10, 'Legal document rules differ from invoice rules', ['hallucination-check']),
        comp('response-generation', 'Response Generation', 'output', 'Generates results with uncertainty flags', 11, 'Clearly marks uncertain fields', ['policy-enforcement']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Records reasoning chain', 12, 'Full extraction decision audit trail'),
      ]
    ),
    lane(3, 'Routed to Your Team', '#ef4444', 'escalation',
      'OCR failures, handwritten forms, and cross-document comparison failures escalate with full context. Your team receives the partial extraction plus a clear description of what failed and why.',
      45,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Access check', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Format validation', 3),
        comp('pii-security', 'PII / Security Scanner', 'ingestion', 'Sensitive data scan', 4),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies extraction failure risk', 5),
        comp('tool-execution', 'Tool Execution', 'execution', 'Attempts extraction', 6, 'Runs with timeout and confidence monitoring', ['request-classification']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Catches extraction failures', 7, 'Packages partial results + failure reason', ['tool-execution']),
        comp('context-graph', 'Context Graph', 'context', 'Links document to related documents', 8, 'Cross-reference context for the human reviewer', ['failure-handling']),
        comp('response-generation', 'Response Generation', 'output', 'Generates escalation package', 9, 'Partial results + what failed + suggested manual steps', ['context-graph']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Records failure pattern', 10, 'Tracks extraction failure types for retraining'),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Research & Comparison Agent — 3 lanes, 22 components
// ═══════════════════════════════════════════════════════════════════════════

const RESEARCH_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 22,
  totalLanes: 3,
  pipelineType: 'multi-agent',
  pipelineTypeLabel: 'Multi-Agent Research Pipeline',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Single-applicant lookups and risk profiles flow through an API-augmented retrieval pipeline. Premium lookups and coverage verification resolve without reasoning chains.',
      178,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point for underwriting queries', 1),
        comp('auth', 'Authentication', 'ingestion', 'Validates user credentials', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validates applicant data', 3),
        comp('prompt-injection', 'Prompt Injection Detection', 'ingestion', 'Screens underwriting queries', 4, 'Prevents injection via crafted applicant names'),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies query type', 5, 'Risk lookup vs. premium vs. coverage verification'),
        comp('rag', 'RAG Pipeline', 'context', 'Retrieves risk data from knowledge base', 6, 'Risk profiles, premium tables, coverage rules', ['request-classification']),
        comp('api-integration', 'CRM / EHR APIs', 'execution', 'Pulls live vendor data', 7, 'Real-time pricing and availability checks', ['request-classification'], { dataSources: '3 vendor APIs' }),
        comp('reranking', 'Re-ranking', 'context', 'Ranks results by relevance', 8, 'Cross-encoder scoring for multi-source results', ['rag', 'api-integration']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Verifies claims against sources', 9, 'Every data point traced to API response or document', ['reranking']),
        comp('response-generation', 'Response Generation', 'output', 'Formats comparison output', 10, 'Structured matrices, ranked lists, or narratives', ['hallucination-check']),
        comp('citation-linking', 'Citation Linking', 'output', 'Attaches source references', 11, 'Per-datapoint citations with timestamps', ['response-generation']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Records research interaction', 12),
      ]
    ),
    lane(2, 'Handled with Reasoning', '#f59e0b', 'supervised',
      'Cross-source synthesis, contradictory data, and subjective recommendation requests trigger a reasoning chain. The agent presents evidence from multiple sides but does not resolve contradictions.',
      45,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Credential check', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Query validation', 3),
        comp('prompt-injection', 'Prompt Injection Detection', 'ingestion', 'Injection screening', 4),
        comp('request-classification', 'Request Classification', 'routing', 'Detects multi-source synthesis need', 5, 'Confidence < 0.75 triggers reasoning path'),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Coordinates multi-source research', 6, 'Parallel source queries with merge step', ['request-classification']),
        comp('rag', 'RAG Pipeline', 'context', 'Knowledge base retrieval', 7, 'Insurance risk profiles and historical data', ['workflow-orchestrator']),
        comp('api-integration', 'CRM / EHR APIs', 'execution', 'Live vendor API calls', 8, 'Current pricing, uptime, features', ['workflow-orchestrator']),
        comp('context-graph', 'Context Graph', 'context', 'Links related vendors and comparisons', 9, 'Entity relationships across vendor ecosystem', ['rag', 'api-integration']),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans analysis sequence', 10, 'Comparison dimensions, scoring methodology', ['context-graph']),
        comp('tool-execution', 'Tool Execution', 'execution', 'Runs comparative analysis', 11, 'Scoring, ranking, gap identification', ['tool-planning']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Cross-validates across sources', 12, 'Flags contradictions rather than resolving them', ['tool-execution']),
        comp('drift-detection', 'Drift Detection', 'ops', 'Monitors data freshness', 13, 'Alerts when source data exceeds staleness threshold', ['tool-execution']),
        comp('policy-enforcement', 'Policy Enforcement', 'output', 'Applies recommendation guardrails', 14, 'Agent must not recommend — only present evidence', ['hallucination-check']),
        comp('response-generation', 'Response Generation', 'output', 'Formats multi-source analysis', 15, 'Comparison with explicit source attribution', ['policy-enforcement']),
        comp('citation-linking', 'Citation Linking', 'output', 'Per-datapoint citations', 16, 'Timestamped source references', ['response-generation']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Full reasoning audit trail', 17),
      ]
    ),
    lane(3, 'Routed to Your Team', '#ef4444', 'escalation',
      'Strategic decisions, subjective recommendations, and unresolvable contradictions route to your analysts. The agent provides the full evidence package — both sides of every contradiction — so analysts start with data, not from scratch.',
      64,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Credential check', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Query validation', 3),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies strategic/subjective query', 4, 'Recommendation requests always escalate'),
        comp('rag', 'RAG Pipeline', 'context', 'Gathers available evidence', 5, 'Best-effort data collection before escalation', ['request-classification']),
        comp('api-integration', 'CRM / EHR APIs', 'execution', 'Pulls live data for context', 6, 'Current state snapshot for the analyst', ['request-classification']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Packages escalation context', 7, 'Evidence + question + why agent cannot resolve', ['rag', 'api-integration']),
        comp('response-generation', 'Response Generation', 'output', 'Generates analyst briefing', 8, 'Structured handoff with data summary', ['failure-handling']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Records escalation', 9),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Decision & Workflow Agent (Dental) — 4 lanes, 26 components
// ═══════════════════════════════════════════════════════════════════════════

const DENTAL_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 26,
  totalLanes: 4,
  pipelineType: 'multi-agent-coordinator',
  pipelineTypeLabel: 'Multi-Agent Coordinator with Human Routing',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Scheduling, referrals, insurance verification, and triage routing resolve through direct retrieval and API calls. No clinical intervention required.',
      198,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Patient-facing entry point', 1, 'HIPAA-compliant request handling'),
        comp('auth', 'Authentication', 'ingestion', 'Patient identity verification', 2, 'Patient portal authentication + session management'),
        comp('input-validation', 'Input Validation', 'ingestion', 'Query and data validation', 3),
        comp('prompt-injection', 'Prompt Injection Detection', 'ingestion', 'Screens patient queries', 4, 'Healthcare-specific injection patterns'),
        comp('pii-security', 'PII / Security Scanner', 'ingestion', 'PHI detection and masking', 5, 'HIPAA-required PHI handling in all interactions'),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies request type', 6, 'Appointment vs. referral vs. triage vs. clinical'),
        comp('rag', 'RAG Pipeline', 'context', 'Care coordination data retrieval', 7, 'Protocols, insurance coverage, specialist networks', ['request-classification']),
        comp('api-integration', 'CRM / EHR APIs', 'execution', 'Calendar and insurance API calls', 8, 'Appointment scheduling, insurance panel lookup', ['request-classification'], { systems: 'PMS, Insurance DB' }),
        comp('db-queries', 'Database Queries', 'execution', 'Patient record lookups', 9, 'Appointment history, treatment plans', ['request-classification']),
        comp('response-generation', 'Response Generation', 'output', 'Composes patient-facing response', 10, 'Warm, clear language with action confirmations', ['rag', 'api-integration', 'db-queries']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'HIPAA-compliant audit logging', 11, 'Every patient interaction logged with full trace'),
      ]
    ),
    lane(2, 'Handled with Reasoning', '#f59e0b', 'supervised',
      'Insurance verification, benefits optimization, treatment cost estimation, and post-procedure follow-ups require multi-hop reasoning across patient records, insurance matrices, and clinical protocols.',
      82,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Patient verification', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Data validation', 3),
        comp('prompt-injection', 'Prompt Injection Detection', 'ingestion', 'Injection screening', 4),
        comp('pii-security', 'PII / Security Scanner', 'ingestion', 'PHI handling', 5),
        comp('request-classification', 'Request Classification', 'routing', 'Multi-hop query detection', 6, 'Insurance + treatment + scheduling chains detected'),
        comp('agent-router', 'Agent Router', 'routing', 'Routes to specialized sub-agent', 7, 'Insurance agent vs. clinical agent vs. scheduling agent', ['request-classification']),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Manages multi-step workflow', 8, 'Patient → insurance → treatment → co-pay chain', ['agent-router']),
        comp('memory', 'Conversation Memory', 'context', 'Tracks multi-turn context', 9, 'Patient conversation state across turns', ['workflow-orchestrator']),
        comp('rag', 'RAG Pipeline', 'context', 'Clinical protocol retrieval', 10, 'Post-procedure care, treatment guidelines', ['workflow-orchestrator']),
        comp('access-control', 'Context Access Control', 'context', 'Patient data isolation', 11, 'Ensures queries only access authorized patient records'),
        comp('api-integration', 'CRM / EHR APIs', 'execution', 'EHR and insurance API calls', 12, 'Treatment history, coverage matrices, fee schedules', ['workflow-orchestrator']),
        comp('db-queries', 'Database Queries', 'execution', 'Complex patient queries', 13, 'Multi-table joins: patient + insurance + treatment', ['workflow-orchestrator']),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans verification sequence', 14, 'Coverage check → deductible calc → co-pay estimate', ['api-integration', 'db-queries']),
        comp('tool-execution', 'Tool Execution', 'execution', 'Runs verification chain', 15, 'Sequential API calls with error handling', ['tool-planning']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Verifies coverage claims', 16, 'Every dollar amount traced to insurance response', ['tool-execution']),
        comp('policy-enforcement', 'Policy Enforcement', 'output', 'Applies clinical guardrails', 17, 'No clinical advice — only factual data presentation', ['hallucination-check']),
        comp('output-guardrails', 'Output Guardrails', 'output', 'Content safety checks', 18, 'Healthcare-specific content filtering', ['policy-enforcement']),
        comp('response-generation', 'Response Generation', 'output', 'Generates patient response', 19, 'Clear explanation with cost breakdown', ['output-guardrails']),
        comp('citation-linking', 'Citation Linking', 'output', 'Links to insurance documents', 20, 'Plan references and coverage details', ['response-generation']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Full audit trail', 21),
      ]
    ),
    lane(3, 'Routed to Your Team', '#ef4444', 'escalation',
      'Emergency symptoms, contradictory provider opinions, material safety concerns, and pediatric clinical boundaries trigger immediate escalation. The agent never renders a clinical opinion — it packages context and connects the patient to your clinical team.',
      42,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Patient verification', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Data validation', 3),
        comp('pii-security', 'PII / Security Scanner', 'ingestion', 'PHI handling', 4),
        comp('request-classification', 'Request Classification', 'routing', 'Emergency and clinical boundary detection', 5, 'Keyword + semantic analysis for clinical urgency'),
        comp('agent-router', 'Agent Router', 'routing', 'Routes to escalation coordinator', 6, 'Bypasses reasoning — direct clinical escalation', ['request-classification']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Packages clinical context', 7, 'Patient history + current concern + urgency level', ['agent-router']),
        comp('api-integration', 'CRM / EHR APIs', 'execution', 'Pulls patient history for handoff', 8, 'Recent procedures, medications, allergies', ['failure-handling']),
        comp('policy-enforcement', 'Policy Enforcement', 'output', 'Enforces clinical boundaries', 9, 'Zero tolerance for clinical assessment or advice', ['api-integration']),
        comp('response-generation', 'Response Generation', 'output', 'Generates escalation message', 10, 'Empathetic, immediate, with clear next steps', ['policy-enforcement']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Critical event logging', 11, 'Priority-flagged logs for clinical review'),
        comp('alerting-feedback', 'Alerting & Feedback', 'ops', 'Staff notification', 12, 'Real-time alert to on-call clinical team', ['response-generation']),
      ]
    ),
    lane(4, 'Blocked — Synthetic Coverage', '#3b82f6', 'blocked',
      'Patterns with no real interaction data are covered by synthetic test scenarios. Post-procedure nerve concerns and dual insurance coverage require monitoring — the architecture adds drift detection and alerting to catch these patterns as they emerge in production.',
      20,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Patient verification', 2),
        comp('request-classification', 'Request Classification', 'routing', 'Pattern not yet classified', 3, 'No real interaction data — synthetic coverage only'),
        comp('failure-handling', 'Failure Handling', 'routing', 'Default to safe escalation', 4, 'Unknown patterns always escalate', ['request-classification']),
        comp('response-generation', 'Response Generation', 'output', 'Generic safe response', 5, 'Conservative response with provider routing', ['failure-handling']),
        comp('drift-detection', 'Drift Detection', 'ops', 'Monitors for pattern emergence', 6, 'Tracks synthetic pattern activation frequency'),
        comp('alerting-feedback', 'Alerting & Feedback', 'ops', 'Triggers re-evaluation alerts', 7, 'Alerts when synthetic patterns accumulate real interactions'),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Tracks synthetic coverage gaps', 8),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// SaaS Copilot — 2-3 lanes, 16 components
// ═══════════════════════════════════════════════════════════════════════════

const SAAS_COPILOT_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 16,
  totalLanes: 2,
  pipelineType: 'tool-first',
  pipelineTypeLabel: 'Tool-First Pipeline with Confirmation Layer',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Standard SaaS operations — account queries, data lookups, routine modifications — resolve through direct tool invocation with built-in guardrails. Low-risk operations bypass confirmation.',
      142,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'SaaS API entry point', 1, 'Rate limiting and request routing'),
        comp('auth', 'Authentication', 'ingestion', 'OAuth / API key validation', 2, 'User identity and permission check'),
        comp('input-validation', 'Input Validation', 'ingestion', 'Request parameter validation', 3, 'Ensures safe argument structure'),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies operation risk level', 4, 'Read vs. write vs. destructive operation'),
        comp('tool-planning', 'Tool Planning', 'execution', 'Selects appropriate tool', 5, 'Maps intent to SaaS API endpoint', ['request-classification'], { toolSet: 'SaaS-native' }),
        comp('access-control', 'Context Access Control', 'context', 'Permission gate for resources', 6, 'Row-level and field-level access control'),
        comp('tool-execution', 'Tool Execution', 'execution', 'Invokes SaaS tool', 7, 'Executes API call with retries', ['tool-planning', 'access-control']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Verifies execution result', 8, 'Confirms operation outcome matches intent', ['tool-execution']),
        comp('response-generation', 'Response Generation', 'output', 'Formats operation result', 9, 'Human-readable confirmation message', ['hallucination-check']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Audit log entry', 10, 'User action audit trail with timestamp'),
      ]
    ),
    lane(2, 'Routed to Your Team', '#ef4444', 'escalation',
      'High-impact operations — account modifications, bulk changes, destructive actions — require human confirmation before execution. The copilot packages the intent and requested change for your approval.',
      28,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Authentication check', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validation', 3),
        comp('request-classification', 'Request Classification', 'routing', 'Detects high-risk operation', 4, 'Destructive operations flagged'),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans operation', 5, 'Composes operation details', ['request-classification']),
        comp('policy-enforcement', 'Policy Enforcement', 'output', 'Enforces approval requirement', 6, 'Blocks execution until human confirmation', ['tool-planning']),
        comp('response-generation', 'Response Generation', 'output', 'Generates confirmation request', 7, 'Clear summary of intended action', ['policy-enforcement']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Handles approval timeout', 8, 'Escalates if no response within SLA'),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Records approval event', 9, 'Tracks who approved and when'),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Operations Agent — 3 lanes, 20 components
// ═══════════════════════════════════════════════════════════════════════════

const OPS_AGENT_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 20,
  totalLanes: 3,
  pipelineType: 'async-orchestrator',
  pipelineTypeLabel: 'Async Orchestrator with Progress Bus',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Routine infrastructure operations — monitoring, alerting, auto-scaling, log aggregation — complete asynchronously without intervention. Progress is published to the progress bus for transparency.',
      168,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Infrastructure event ingestion', 1, 'CloudWatch, Datadog webhook entry point'),
        comp('input-validation', 'Input Validation', 'ingestion', 'Event schema validation', 2, 'Validates monitoring event structure'),
        comp('request-classification', 'Request Classification', 'routing', 'Categorizes ops event type', 3, 'Alert vs. metric vs. log vs. trace'),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Coordinates async ops chain', 4, 'Spawn child tasks, track completion', ['request-classification'], { busType: 'progress-bus' }),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans remediation sequence', 5, 'Escalation policy + runbook selection', ['workflow-orchestrator']),
        comp('tool-execution', 'Tool Execution', 'execution', 'Executes ops actions', 6, 'Terraform, Kubernetes, runbook scripts', ['tool-planning']),
        comp('memory', 'Conversation Memory', 'context', 'Tracks task state across async boundaries', 7, 'Preserves context during long-running tasks', ['workflow-orchestrator']),
        comp('api-integration', 'Infrastructure APIs', 'execution', 'Cloud provider API calls', 8, 'AWS, GCP, Kubernetes API clients', ['tool-execution']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Catches ops failures', 9, 'Rollback or escalation logic', ['tool-execution']),
        comp('response-generation', 'Response Generation', 'output', 'Generates ops result summary', 10, 'Status, metrics impact, next steps', ['failure-handling']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Ops audit trail', 11, 'Infrastructure change log'),
      ]
    ),
    lane(2, 'Handled with Reasoning', '#f59e0b', 'supervised',
      'Conditional ops tasks — performance optimization, cost-driven scaling, multi-region failover — require decision logic. The agent evaluates metrics, cost/benefit tradeoffs, and suggests action with human review.',
      52,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validation', 2),
        comp('request-classification', 'Request Classification', 'routing', 'Detects conditional ops task', 3, 'Metric-driven decision needed'),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Manages conditional flow', 4, 'Decision gate with reasoning step', ['request-classification']),
        comp('memory', 'Conversation Memory', 'context', 'Tracks task context', 5, 'Historical metrics and baseline state', ['workflow-orchestrator']),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans multi-option remediation', 6, 'Option A vs. Option B comparison', ['memory']),
        comp('api-integration', 'Infrastructure APIs', 'execution', 'Fetches current metrics', 7, 'CPU, memory, cost, latency queries', ['tool-planning']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Validates decision logic', 8, 'Cost calculation and metric consistency', ['api-integration']),
        comp('policy-enforcement', 'Policy Enforcement', 'output', 'Enforces ops constraints', 9, 'Budget limits, regional restrictions', ['hallucination-check']),
        comp('response-generation', 'Response Generation', 'output', 'Generates recommendation with rationale', 10, 'Option + reasoning + estimated impact', ['policy-enforcement']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Logs decision point', 11, 'Records reasoning chain for audit'),
      ]
    ),
    lane(3, 'Routed to Your Team', '#ef4444', 'escalation',
      'Major outages, capacity crisis, and unknown failure modes escalate immediately. The agent packages real-time metrics, logs, and action recommendations for your on-call team to evaluate.',
      48,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Critical alert entry', 1),
        comp('input-validation', 'Input Validation', 'ingestion', 'Alert validation', 2),
        comp('request-classification', 'Request Classification', 'routing', 'Detects critical severity', 3, 'Severity threshold detection'),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Escalation coordinator', 4, 'Emergency signal dispatch', ['request-classification']),
        comp('api-integration', 'Infrastructure APIs', 'execution', 'Pulls emergency context', 5, 'Last logs, error traces, metrics snapshot', ['workflow-orchestrator']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Packages emergency context', 6, 'Alert + metrics + suggested actions + runbook', ['api-integration']),
        comp('response-generation', 'Response Generation', 'output', 'Generates incident brief', 7, 'Executive summary with critical details', ['failure-handling']),
        comp('alerting-feedback', 'Alerting & Feedback', 'ops', 'Triggers page to on-call', 8, 'SMS/PagerDuty notification with context', ['response-generation']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Incident log', 9, 'Timestamp and escalation reason'),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Coding Agent — 3-4 lanes, 24 components
// ═══════════════════════════════════════════════════════════════════════════

const CODING_AGENT_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 24,
  totalLanes: 3,
  pipelineType: 'code-aware-sandbox',
  pipelineTypeLabel: 'Code-Aware Pipeline with Sandbox Layer',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Simple code tasks — formatting, documentation generation, test scaffolding, refactoring in isolated modules — execute in sandbox without code review. Results are verified before merge suggestion.',
      186,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Repository event hook', 1, 'Webhook for PR/commit triggers'),
        comp('auth', 'Authentication', 'ingestion', 'GitHub/GitLab token validation', 2, 'User permission to repository'),
        comp('input-validation', 'Input Validation', 'ingestion', 'Diff validation', 3, 'File type and size checks'),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies code task risk', 4, 'Refactoring vs. feature vs. fix vs. test'),
        comp('context-graph', 'Context Graph', 'context', 'Builds codebase dependency graph', 5, 'Maps imports, exports, call chains', ['request-classification'], { graphDepth: '3-levels' }),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans code transformation', 6, 'AST-based code change strategy', ['context-graph']),
        comp('tool-execution', 'Tool Execution', 'execution', 'Executes code in sandbox', 7, 'Isolated environment with linter and type checker', ['tool-planning']),
        comp('memory', 'Conversation Memory', 'context', 'Tracks code context', 8, 'Previous changes and code patterns', ['context-graph']),
        comp('api-integration', 'Repository APIs', 'execution', 'Git / npm API calls', 9, 'Dependency resolution, package checks', ['tool-execution']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Verifies generated code', 10, 'Lint, type check, syntax validation', ['tool-execution']),
        comp('drift-detection', 'Drift Detection', 'ops', 'Detects code style drift', 11, 'Ensures consistency with project conventions'),
        comp('response-generation', 'Response Generation', 'output', 'Generates diff with explanation', 12, 'Clear before/after with rationale', ['hallucination-check']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Code change audit log', 13, 'Transformation history with metrics'),
      ]
    ),
    lane(2, 'Handled with Reasoning', '#f59e0b', 'supervised',
      'Critical incidents require incident remediation workflows with blast radius assessment and automated rollback planning. The agent analyzes impact scope and flags remediation decisions needing incident commander review.',
      68,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Authentication', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validation', 3),
        comp('request-classification', 'Request Classification', 'routing', 'Detects complex code change', 4, 'Cross-module or architectural impact'),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Manages multi-step code planning', 5, 'Phase 1: analysis, Phase 2: generation, Phase 3: review flags', ['request-classification']),
        comp('context-graph', 'Context Graph', 'context', 'Builds full codebase graph', 6, 'Deep dependency analysis across modules', ['workflow-orchestrator']),
        comp('memory', 'Conversation Memory', 'context', 'Tracks architecture context', 7, 'Design patterns and previous decisions', ['context-graph']),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans architectural change', 8, 'Multiple implementation options with trade-offs', ['context-graph', 'memory']),
        comp('tool-execution', 'Tool Execution', 'execution', 'Generates code in sandbox', 9, 'Creates artifact for review', ['tool-planning']),
        comp('api-integration', 'Repository APIs', 'execution', 'Dependency analysis API', 10, 'Package and import relationship checks', ['tool-execution']),
        comp('policy-enforcement', 'Policy Enforcement', 'output', 'Applies architecture guardrails', 11, 'Security, performance, and design standards', ['tool-execution']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Cross-validates generated code', 12, 'Type safety, test coverage, lint', ['policy-enforcement']),
        comp('response-generation', 'Response Generation', 'output', 'Generates proposal with review flags', 13, 'Highlights areas requiring human judgment', ['hallucination-check']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Logs design decision point', 14, 'Reasoning and options considered'),
      ]
    ),
    lane(3, 'Routed to Your Team', '#ef4444', 'escalation',
      'Database migrations, security changes, and breaking API modifications require explicit human review. The agent prepares a detailed migration guide with impact analysis and rollback steps.',
      56,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Authentication', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validation', 3),
        comp('request-classification', 'Request Classification', 'routing', 'Detects breaking change', 4, 'DB schema, security, or API contract change'),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Escalation preparation', 5, 'Full impact analysis required', ['request-classification']),
        comp('context-graph', 'Context Graph', 'context', 'Maps all affected modules', 6, 'Cross-references all dependent code', ['workflow-orchestrator']),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans migration strategy', 7, 'Backward-compatible approach if possible', ['context-graph']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Prepares escalation package', 8, 'Migration guide + rollback plan + impact', ['tool-planning']),
        comp('response-generation', 'Response Generation', 'output', 'Generates detailed review document', 9, 'Clear migration path with contingencies', ['failure-handling']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Records escalation', 10, 'Change risk assessment log'),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// On-Prem Assistant — 2-3 lanes, 15 components
// ═══════════════════════════════════════════════════════════════════════════

const ONPREM_ASSISTANT_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 15,
  totalLanes: 2,
  pipelineType: 'local-rag-node',
  pipelineTypeLabel: 'On-Prem Single-Node with Local RAG',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Enterprise document queries and policy lookups resolve entirely within the on-prem boundary. No external API calls. Knowledge is embedded in local vector store. Responses are sourced from company data only.',
      128,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'On-prem entry point', 1, 'Localhost or internal network only'),
        comp('auth', 'Authentication', 'ingestion', 'Enterprise directory auth', 2, 'LDAP or on-prem identity provider'),
        comp('input-validation', 'Input Validation', 'ingestion', 'Query validation', 3, 'Data loss prevention scanning'),
        comp('pii-security', 'PII / Security Scanner', 'ingestion', 'Sensitive data detection', 4, 'Prevents leakage of confidential info'),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies query type', 5, 'Policy vs. procedure vs. knowledge lookup'),
        comp('rag', 'Local RAG Pipeline', 'context', 'Local vector store retrieval', 6, 'Embedded knowledge base, no external calls', ['request-classification'], { storage: 'local-vector-db' }),
        comp('access-control', 'Context Access Control', 'context', 'Department-level data isolation', 7, 'Ensures users only see authorized docs', ['rag']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Verifies grounding in local docs', 8, 'All answers must cite internal sources only', ['rag']),
        comp('response-generation', 'Response Generation', 'output', 'Composes answer from local context', 9, 'No internet queries, internal sources only', ['hallucination-check']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Local audit log', 10, 'On-prem-only logging, no export'),
      ]
    ),
    lane(2, 'Routed to Your Team', '#ef4444', 'escalation',
      'Queries about external policies, partner integrations, or confidential decisions require human approval. The assistant escalates with context but never allows external data leakage.',
      18,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Authentication', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validation', 3),
        comp('pii-security', 'PII / Security Scanner', 'ingestion', 'Data loss prevention', 4),
        comp('request-classification', 'Request Classification', 'routing', 'Detects external or confidential query', 5, 'Cannot be answered from local docs'),
        comp('policy-enforcement', 'Policy Enforcement', 'output', 'Enforces approval gate', 6, 'No external queries without clearance', ['request-classification']),
        comp('response-generation', 'Response Generation', 'output', 'Routes to human for decision', 7, 'Request packaged for approval', ['policy-enforcement']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Audit log', 8),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Multimodal Agent — 3-4 lanes, 23 components
// ═══════════════════════════════════════════════════════════════════════════

const MULTIMODAL_AGENT_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 23,
  totalLanes: 3,
  pipelineType: 'multi-modal-orchestrator',
  pipelineTypeLabel: 'Multi-Modal Orchestrator with Format Adapters',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Single-format queries — text search, image tagging, audio transcription, video captioning — complete through dedicated format pipelines. Responses stay in requested format.',
      172,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Multi-modal entry point', 1, 'Handles text, image, audio, video uploads'),
        comp('auth', 'Authentication', 'ingestion', 'User authentication', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Format validation', 3, 'File type, size, codec checks'),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies input modality', 4, 'Text vs. image vs. audio vs. video', ['api-gateway']),
        comp('rag', 'RAG Pipeline', 'context', 'Text-based retrieval', 5, 'For text inputs or text embeddings', ['request-classification']),
        comp('api-integration', 'Vision / Audio APIs', 'execution', 'Format-specific processors', 6, 'OCR, audio transcription, video frame extraction', ['request-classification']),
        comp('tool-execution', 'Tool Execution', 'execution', 'Format-native processing', 7, 'Modality-specific inference', ['api-integration', 'rag']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Format consistency check', 8, 'Ensures output format validity', ['tool-execution']),
        comp('response-generation', 'Response Generation', 'output', 'Generates response in requested format', 9, 'Text answer, tagged image, transcript, or captions', ['hallucination-check']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Multi-modal processing log', 10, 'Tracks per-modality metrics'),
      ]
    ),
    lane(2, 'Handled with Reasoning', '#f59e0b', 'supervised',
      'Cross-modal queries — finding images by text description, analyzing video against document requirements, transcribing audio then mapping to policy — require reasoning across format boundaries. Agent synthesizes results but flags confidence issues.',
      64,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Authentication', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validation', 3),
        comp('request-classification', 'Request Classification', 'routing', 'Detects cross-modal query', 4, 'Multiple input or output modalities needed'),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Coordinates format transformations', 5, 'Sequences: text→image search, audio→text→policy, etc.', ['request-classification']),
        comp('rag', 'RAG Pipeline', 'context', 'Text knowledge base', 6, 'Policy and document content', ['workflow-orchestrator']),
        comp('api-integration', 'Vision / Audio APIs', 'execution', 'Format conversion APIs', 7, 'Transcription, OCR, image retrieval', ['workflow-orchestrator']),
        comp('tool-planning', 'Tool Planning', 'execution', 'Plans content moderation workflow', 8, 'Routes flagged content through policy checks', ['rag', 'api-integration']),
        comp('tool-execution', 'Tool Execution', 'execution', 'Executes multi-step transformation', 9, 'Chains format conversions', ['tool-planning']),
        comp('context-graph', 'Context Graph', 'context', 'Tracks modality relationships', 10, 'Links images to text descriptions, etc.', ['tool-execution']),
        comp('hallucination-check', 'Hallucination Check', 'output', 'Cross-modal consistency check', 11, 'Semantic alignment across formats', ['tool-execution']),
        comp('policy-enforcement', 'Policy Enforcement', 'output', 'Applies multi-modal guardrails', 12, 'Content safety across all modalities', ['hallucination-check']),
        comp('response-generation', 'Response Generation', 'output', 'Generates unified response', 13, 'Synthesized result across formats', ['policy-enforcement']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Cross-modal interaction log', 14, 'Tracks transformation pipeline'),
      ]
    ),
    lane(3, 'Routed to Your Team', '#ef4444', 'escalation',
      'Conflicting modalities — video contradicts text policy, audio has ambiguous technical terms — route to human with full multi-modal evidence. Agent packages all formats for side-by-side comparison.',
      52,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Authentication', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validation', 3),
        comp('request-classification', 'Request Classification', 'routing', 'Detects modality conflict', 4, 'Cross-modal contradiction detected'),
        comp('workflow-orchestrator', 'Workflow Orchestrator', 'routing', 'Escalation coordination', 5, 'Gathers all modality evidence', ['request-classification']),
        comp('rag', 'RAG Pipeline', 'context', 'Reference retrieval', 6, 'Policy or standard for comparison', ['workflow-orchestrator']),
        comp('api-integration', 'Vision / Audio APIs', 'execution', 'Format extraction', 7, 'Pull all modality content', ['workflow-orchestrator']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Packages multi-modal context', 8, 'All formats in one escalation bundle', ['rag', 'api-integration']),
        comp('response-generation', 'Response Generation', 'output', 'Generates evidence package', 9, 'All modalities presented for human judgment', ['failure-handling']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Escalation audit trail', 10, 'Records all modalities involved'),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Consumer Chat — 2 lanes, 14 components
// ═══════════════════════════════════════════════════════════════════════════

const CONSUMER_CHAT_ARCHITECTURE: ArchitectureStageData = {
  totalComponents: 14,
  totalLanes: 2,
  pipelineType: 'cached-first',
  pipelineTypeLabel: 'Cached-First Pipeline with Edge Deployment',
  lanes: [
    lane(1, 'Handled Automatically', '#10b981', 'autonomous',
      'Fast-path consumer queries — product questions, account status, repeat questions — leverage cached embeddings and edge deployment for sub-100ms responses. Personalization via memory without backend round trips.',
      134,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Edge-deployed entry point', 1, 'CDN-hosted for low latency'),
        comp('auth', 'Authentication', 'ingestion', 'Session token validation', 2, 'Lightweight auth for consumer context'),
        comp('input-validation', 'Input Validation', 'ingestion', 'Query validation', 3, 'Fast schema check'),
        comp('request-classification', 'Request Classification', 'routing', 'Identifies query intent', 4, 'FAQ vs. account vs. support lookup', ['api-gateway']),
        comp('memory', 'Conversation Memory', 'context', 'Edge-cached conversation history', 5, 'Client-side or local cache', ['request-classification'], { cacheLocation: 'edge' }),
        comp('rag', 'Cached RAG', 'context', 'Pre-computed embeddings cache', 6, 'Fast retrieval from local cache', ['request-classification']),
        comp('reranking', 'Re-ranking', 'context', 'Lightweight relevance scoring', 7, 'Fast local scoring', ['rag']),
        comp('response-generation', 'Response Generation', 'output', 'Generates consumer-friendly response', 8, 'Conversational, warm tone', ['reranking', 'memory']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Telemetry collection', 9, 'Lightweight event logging'),
      ]
    ),
    lane(2, 'Routed to Your Team', '#ef4444', 'escalation',
      'Account issues, billing disputes, and technical problems that need backend access escalate to support with full conversation context. The chat agent preserves memory through the handoff.',
      24,
      [
        comp('api-gateway', 'API Gateway', 'ingestion', 'Entry point', 1),
        comp('auth', 'Authentication', 'ingestion', 'Authentication', 2),
        comp('input-validation', 'Input Validation', 'ingestion', 'Validation', 3),
        comp('request-classification', 'Request Classification', 'routing', 'Detects escalation-required issue', 4, 'Backend access or human judgment needed'),
        comp('memory', 'Conversation Memory', 'context', 'Full conversation context', 5, 'Preserved for handoff', ['request-classification']),
        comp('failure-handling', 'Failure Handling', 'routing', 'Packages escalation handoff', 6, 'Conversation + issue summary', ['memory']),
        comp('response-generation', 'Response Generation', 'output', 'Generates escalation message', 7, 'Consumer-friendly, empathetic', ['failure-handling']),
        comp('alerting-feedback', 'Alerting & Feedback', 'ops', 'Routes to support queue', 8, 'Support agent notification', ['response-generation']),
        comp('logging-analytics', 'Logging & Analytics', 'ops', 'Escalation log', 9, 'Preserves full context for support'),
      ]
    ),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════

const ARCHITECTURE_DATA: Record<string, ArchitectureStageData> = {
  'faq-knowledge': FAQ_ARCHITECTURE,
  'doc-intelligence': DOC_INTEL_ARCHITECTURE,
  'research-comparison': RESEARCH_ARCHITECTURE,
  'decision-workflow': DENTAL_ARCHITECTURE,
  'saas-copilot': SAAS_COPILOT_ARCHITECTURE,
  'ops-agent': OPS_AGENT_ARCHITECTURE,
  'coding-agent': CODING_AGENT_ARCHITECTURE,
  'onprem-assistant': ONPREM_ASSISTANT_ARCHITECTURE,
  'multimodal-agent': MULTIMODAL_AGENT_ARCHITECTURE,
  'consumer-chat': CONSUMER_CHAT_ARCHITECTURE,
}

export function getArchitectureData(tileId: string): ArchitectureStageData | null {
  const raw = ARCHITECTURE_DATA[tileId]
  if (!raw) return null
  // Compute totalComponents from unique component IDs across all lanes
  const uniqueIds = new Set<string>()
  let totalInteractionPaths = 0
  for (const ln of raw.lanes) {
    totalInteractionPaths += ln.interactionFlowCount
    for (const c of ln.technicalComponents) {
      uniqueIds.add(c.componentId)
    }
  }
  return { ...raw, totalComponents: uniqueIds.size, totalInteractionPaths }
}
