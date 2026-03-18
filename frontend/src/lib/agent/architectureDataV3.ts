/**
 * Architecture Data for VibeModel Agent Playground V3 Stage 6
 * Extracted from use case Section 6.2 specifications
 * Keyed by tileId for stage execution
 *
 * DYNAMIC COMPOSITION:
 * When a tile has pattern data (via generatePatterns), this module
 * dynamically composes the architecture using the MetaPattern Taxonomy engine.
 * Hardcoded data is used as fallback for tiles without pattern data.
 */

import { generatePatterns } from './patternCombinationEngine'
import { analyzeAndCompose, type ComposedComponent } from './metaPatternTaxonomy'

export interface ComponentSelectionV3 {
  id: string
  categoryId: string
  categoryName: string
  selectedTechnology: string
  justification: string
  triggeredBy: string[]
  layer: 'ingestion' | 'routing' | 'context' | 'execution' | 'output' | 'ops'
}

export interface TrustBoundaryV3 {
  id: string
  name: string
  zone: 'autonomous' | 'supervised' | 'escalation'
  components: string[]
  description: string
}

export interface ArchitectureDataV3 {
  components: ComponentSelectionV3[]
  trustBoundaries: TrustBoundaryV3[]
  deploymentNotes: string[]
}

/**
 * Invoice Processing Agent - Components (13 categories)
 */
const INVOICE_PROCESSING_COMPONENTS: ComponentSelectionV3[] = [
  {
    id: 'inv-comp-001',
    categoryId: 'orchestration',
    categoryName: 'Orchestration',
    selectedTechnology: 'LangGraph State Machine',
    justification: 'Multi-step orchestration with branching (parallel fetches, conditional fallbacks). State machine tracks: fetch state, parse state, validation state, output state.',
    triggeredBy: ['inv-mp-001', 'inv-mp-006', 'inv-mp-011'],
    layer: 'routing',
  },
  {
    id: 'inv-comp-002',
    categoryId: 'retrieval',
    categoryName: 'Retrieval',
    selectedTechnology: 'Hybrid (Vector + Keyword)',
    justification: 'Vector embeddings for semantic matching (category normalization: "S3" → storage), keyword search for exact invoice/PO lookups.',
    triggeredBy: ['inv-mp-002', 'inv-mp-007'],
    layer: 'context',
  },
  {
    id: 'inv-comp-003',
    categoryId: 'data-fetching',
    categoryName: 'Data Fetching',
    selectedTechnology: 'Parallel AsyncIO',
    justification: 'Fetch AWS, GCP, Staples simultaneously with timeout and error handling. Reduces latency from 15s serial to 5s parallel.',
    triggeredBy: ['inv-mp-001'],
    layer: 'ingestion',
  },
  {
    id: 'inv-comp-004',
    categoryId: 'document-parsing',
    categoryName: 'Document Parsing',
    selectedTechnology: 'PDFPlumber (tables) + EasyOCR (images)',
    justification: 'PDFPlumber extracts tables with cell confidence, EasyOCR handles scanned images with confidence scoring. Detects image-only PDFs and routes appropriately.',
    triggeredBy: ['inv-mp-004', 'inv-mp-006', 'inv-mp-010'],
    layer: 'ingestion',
  },
  {
    id: 'inv-comp-005',
    categoryId: 'data-normalization',
    categoryName: 'Data Normalization',
    selectedTechnology: 'Pydantic Models + Custom Mappers',
    justification: '15-field schema enforced via Pydantic. Vendor-specific field mappings (AWS service → category) via ConfigDict.',
    triggeredBy: ['inv-mp-006', 'inv-mp-005'],
    layer: 'context',
  },
  {
    id: 'inv-comp-006',
    categoryId: 'aggregation',
    categoryName: 'Aggregation',
    selectedTechnology: 'Pandas + DuckDB',
    justification: 'Pandas for in-memory aggregation (<1GB data size). DuckDB for complex joins and window functions. Time-series alignment via date normalization.',
    triggeredBy: ['inv-mp-005', 'inv-mp-003', 'inv-mp-002'],
    layer: 'execution',
  },
  {
    id: 'inv-comp-007',
    categoryId: 'anomaly-detection',
    categoryName: 'Anomaly Detection',
    selectedTechnology: 'Scikit-learn (z-score, IQR)',
    justification: 'Z-score for univariate outlier detection (cost spikes). IQR for robust detection when baseline distribution unknown. Confidence scoring via statistical tests.',
    triggeredBy: ['inv-mp-007', 'inv-mp-011'],
    layer: 'execution',
  },
  {
    id: 'inv-comp-008',
    categoryId: 'output-synthesis',
    categoryName: 'Output Synthesis',
    selectedTechnology: 'Jinja2 Templates + JSON Schema',
    justification: 'Jinja2 renders narrative summaries with variable insertion. JSON Schema validates structured outputs (tables, citations).',
    triggeredBy: ['inv-mp-008', 'inv-mp-009'],
    layer: 'output',
  },
  {
    id: 'inv-comp-009',
    categoryId: 'caching',
    categoryName: 'Caching',
    selectedTechnology: 'Redis (1-hour TTL)',
    justification: 'Cache AWS CUR exports (large, infrequently updated). Cache PO database queries (static data). Cache category mappings (lookup table).',
    triggeredBy: ['inv-mp-001'],
    layer: 'ops',
  },
  {
    id: 'inv-comp-010',
    categoryId: 'error-handling',
    categoryName: 'Error Handling',
    selectedTechnology: 'Custom Exception Classes + Retry Logic',
    justification: 'Tool failures (pdf-parser, ocr-engine) trigger fallbacks with 3 retries. Timeout handling for slow sources.',
    triggeredBy: ['inv-mp-010'],
    layer: 'routing',
  },
  {
    id: 'inv-comp-011',
    categoryId: 'confidence-scoring',
    categoryName: 'Confidence Scoring',
    selectedTechnology: 'Bayesian Scoring (priors + evidence)',
    justification: 'Each extraction/match step produces confidence score. PO match combines PO-number-confidence (98%), vendor-confidence (95%), amount-confidence (92%) → joint confidence via Bayes. Low scores (<85%) route to human.',
    triggeredBy: ['inv-mp-011'],
    layer: 'routing',
  },
  {
    id: 'inv-comp-012',
    categoryId: 'observation-logging',
    categoryName: 'Observation & Logging',
    selectedTechnology: 'Structured Logging (JSON + LLM-Observability)',
    justification: 'Log every tool call, state transition, data fetch, and calculation step. Track metrics (latency, accuracy, completeness) per query.',
    triggeredBy: ['inv-mp-007'],
    layer: 'ops',
  },
  {
    id: 'inv-comp-013',
    categoryId: 'human-loop',
    categoryName: 'Human-in-Loop',
    selectedTechnology: 'Manual Escalation Queue',
    justification: 'Charges >$10K, confidence <85%, PO unmatched, and anomaly-suspected route to supervisor for review before payment. Queue tracks status (pending, approved, rejected).',
    triggeredBy: ['inv-mp-011'],
    layer: 'routing',
  },
]

/**
 * Invoice Processing Agent - Trust Boundaries
 */
const INVOICE_PROCESSING_BOUNDARIES: TrustBoundaryV3[] = [
  {
    id: 'inv-tb-001',
    name: 'Autonomous Data Retrieval',
    zone: 'autonomous',
    components: ['inv-comp-003'],
    description: 'Data retrieval from AWS, GCP, Staples (read-only). No financial decisions made; retrieval is deterministic.',
  },
  {
    id: 'inv-tb-002',
    name: 'Autonomous Normalization',
    zone: 'autonomous',
    components: ['inv-comp-004', 'inv-comp-005'],
    description: 'Format normalization and schema enforcement. Deterministic transformation; reversible.',
  },
  {
    id: 'inv-tb-003',
    name: 'Autonomous Aggregation',
    zone: 'autonomous',
    components: ['inv-comp-006'],
    description: 'Simple aggregation (sum, count, average) by single dimension. Single-hop calculation; low error probability.',
  },
  {
    id: 'inv-tb-004',
    name: 'Autonomous PO Matching (High Confidence)',
    zone: 'autonomous',
    components: ['inv-comp-011'],
    description: 'PO matching with confidence >95%. High-confidence match; low risk of false positive.',
  },
  {
    id: 'inv-tb-005',
    name: 'Autonomous Simple Lookups',
    zone: 'autonomous',
    components: ['inv-comp-002'],
    description: 'Simple lookup responses (direct answer to simple question; no reasoning involved).',
  },
  {
    id: 'inv-tb-006',
    name: 'Supervised PO Matching (Medium Confidence)',
    zone: 'supervised',
    components: ['inv-comp-011'],
    description: 'PO matching with confidence 70-94%. Confidence-threshold-routing gate; requires human review.',
  },
  {
    id: 'inv-tb-007',
    name: 'Supervised Anomaly Detection',
    zone: 'supervised',
    components: ['inv-comp-007'],
    description: 'Anomaly detection: suspected (1.5-2 SD). Statistical borderline; human judgment needed.',
  },
  {
    id: 'inv-tb-008',
    name: 'Supervised Charge Validation',
    zone: 'supervised',
    components: ['inv-comp-006', 'inv-comp-011'],
    description: 'Charge validation with discrepancy >2%. May indicate billing error; escalate for review.',
  },
  {
    id: 'inv-tb-009',
    name: 'Supervised Cross-Source Aggregation',
    zone: 'supervised',
    components: ['inv-comp-002', 'inv-comp-006'],
    description: 'Cross-source aggregation (multi-hop join). Data quality risk from join misalignment; spot-check sample.',
  },
  {
    id: 'inv-tb-010',
    name: 'Supervised Reasoning Chains',
    zone: 'supervised',
    components: ['inv-comp-007'],
    description: 'Reasoning chains (trend analysis, anomaly attribution). Multi-step inference; final recommendation needs approval.',
  },
  {
    id: 'inv-tb-011',
    name: 'Escalation: High-Value Charges',
    zone: 'escalation',
    components: ['inv-comp-013'],
    description: 'Charges >$10,000 requiring approval before payment. Financial authorization gate; supervisor sign-off required.',
  },
  {
    id: 'inv-tb-012',
    name: 'Escalation: Low-Confidence OCR',
    zone: 'escalation',
    components: ['inv-comp-004', 'inv-comp-010'],
    description: 'OCR confidence <85% on archived invoices. Illegible source; human verification of extracted data needed.',
  },
  {
    id: 'inv-tb-013',
    name: 'Escalation: Unknown Anomalies',
    zone: 'escalation',
    components: ['inv-comp-007'],
    description: 'Anomalies with confidence 100% (>3 SD) but unknown root cause. Statistically certain anomaly but no attribution; investigation needed.',
  },
  {
    id: 'inv-tb-014',
    name: 'Escalation: Data Gaps',
    zone: 'escalation',
    components: ['inv-comp-003', 'inv-comp-012'],
    description: 'Data completeness <95% (silent gaps detected). Risk of incomplete analysis; flag before presenting results.',
  },
  {
    id: 'inv-tb-015',
    name: 'Escalation: Source Conflicts',
    zone: 'escalation',
    components: ['inv-comp-006'],
    description: 'Conflicting data between sources (e.g., AWS charges don\'t match PO). Data integrity concern; reconciliation required.',
  },
]

/**
 * Enterprise RAG Copilot - Components (14 categories)
 */
const ENTERPRISE_RAG_COMPONENTS: ComponentSelectionV3[] = [
  {
    id: 'rag-comp-001',
    categoryId: 'orchestration',
    categoryName: 'Orchestration',
    selectedTechnology: 'LangGraph State Machine',
    justification: 'Multi-step orchestration with 7 tasks, branching on entity extraction results, conditional access control gates, parallel source fetches, and timeout handling.',
    triggeredBy: ['rag-mp-001', 'rag-mp-004', 'rag-mp-008'],
    layer: 'routing',
  },
  {
    id: 'rag-comp-002',
    categoryId: 'intent-classification',
    categoryName: 'Query Intent Classification',
    selectedTechnology: 'Semantic Classification (OpenAI GPT-4 or fine-tuned smaller model)',
    justification: 'Classify natural language query into 5 intent types (factual, procedural, decision-history, person-lookup, project-status) with 95%+ accuracy.',
    triggeredBy: ['rag-mp-006'],
    layer: 'routing',
  },
  {
    id: 'rag-comp-003',
    categoryId: 'source-routing',
    categoryName: 'Source Routing',
    selectedTechnology: 'Rule-Based + Learning (Bayesian)',
    justification: 'Route to sources based on intent + entity types. Example: person-lookup → Directory + Slack (recent mentions); decision-history → Confluence + Slack.',
    triggeredBy: ['rag-mp-004'],
    layer: 'routing',
  },
  {
    id: 'rag-comp-004',
    categoryId: 'parallel-retrieval',
    categoryName: 'Parallel Retrieval',
    selectedTechnology: 'AsyncIO + Timeout Handling',
    justification: 'Fetch from 5 sources in parallel with per-source timeouts (2s for Confluence/Jira/Drive, 1s for Slack, 0.5s for Directory SQL). Reduce latency from 10s serial to 3s parallel.',
    triggeredBy: ['rag-mp-001'],
    layer: 'ingestion',
  },
  {
    id: 'rag-comp-005',
    categoryId: 'entity-matching',
    categoryName: 'Semantic Entity Matching',
    selectedTechnology: 'Embeddings + Fuzzy String Matching',
    justification: 'Use embeddings to match "john.doe" vs. "john_doe" vs. "John Doe" (>85% similarity = same entity). Implement email-based canonical resolution.',
    triggeredBy: ['rag-mp-003', 'rag-mp-002'],
    layer: 'context',
  },
  {
    id: 'rag-comp-006',
    categoryId: 'access-control',
    categoryName: 'Access Control Layer',
    selectedTechnology: 'Permission Matrix Cache + Just-in-Time Checks',
    justification: 'Cache user permissions for 5 minutes; check before returning each result. Filter Confluence by space+page, Slack by channel membership, Drive by file ACL, Jira by project+issue, Directory by role.',
    triggeredBy: ['rag-mp-004'],
    layer: 'context',
  },
  {
    id: 'rag-comp-007',
    categoryId: 'rich-text-parsing',
    categoryName: 'Rich Text Parsing',
    selectedTechnology: 'LangChain Document Loaders',
    justification: 'Parse Confluence pages (HTML+macros), Drive documents (Docs/Sheets/Slides text extraction), PDFs. Extract text + metadata (author, date, version).',
    triggeredBy: ['rag-mp-005', 'rag-mp-011'],
    layer: 'ingestion',
  },
  {
    id: 'rag-comp-008',
    categoryId: 'slack-threads',
    categoryName: 'Slack Thread Context',
    selectedTechnology: 'Thread-Aware API Wrapper',
    justification: 'When Slack API returns message, auto-fetch full thread (main + replies, sorted by timestamp). Cache results for 5 minutes.',
    triggeredBy: ['rag-mp-005', 'rag-mp-012'],
    layer: 'ingestion',
  },
  {
    id: 'rag-comp-009',
    categoryId: 'correlation',
    categoryName: 'Cross-Source Correlation',
    selectedTechnology: 'Graph-Based Entity Linking',
    justification: 'Build knowledge graph: nodes = entities (projects, people, decisions), edges = relationships (decision-in-jira-epic, discussed-in-slack-channel, documented-in-confluence). Query graph to find all paths connecting entities.',
    triggeredBy: ['rag-mp-002', 'rag-mp-006'],
    layer: 'context',
  },
  {
    id: 'rag-comp-010',
    categoryId: 'temporal-alignment',
    categoryName: 'Temporal Alignment',
    selectedTechnology: 'Date Normalization + Timeline Building',
    justification: 'Normalize all timestamps to UTC, then build timeline with source attribution. Example: (Sept 1 Jira issue created) → (Sept 12 Slack thread discussion) → (Nov 2 Confluence ADR published).',
    triggeredBy: ['rag-mp-007'],
    layer: 'context',
  },
  {
    id: 'rag-comp-011',
    categoryId: 'freshness',
    categoryName: 'Freshness Assessment',
    selectedTechnology: 'Document Age Calculator',
    justification: 'For Confluence pages, calculate age = today - modified_date. Age <30d: current; 31-90d: aging; >90d: stale. Flag stale results with warning. For Slack, only flag if data >6 months old.',
    triggeredBy: ['rag-mp-010'],
    layer: 'context',
  },
  {
    id: 'rag-comp-012',
    categoryId: 'confidence-scoring',
    categoryName: 'Confidence Scoring',
    selectedTechnology: 'Bayesian Posterior Calculation',
    justification: 'For entity matches: P(same entity | name similarity + email match + department match). For correlations: P(related | semantic similarity + temporal proximity + co-mention frequency). Output confidence 0-100%.',
    triggeredBy: ['rag-mp-008'],
    layer: 'routing',
  },
  {
    id: 'rag-comp-013',
    categoryId: 'output-synthesis',
    categoryName: 'Output Synthesis',
    selectedTechnology: 'Jinja2 Templates + LLM Narrative Generation',
    justification: 'Use templates for structured responses (person-profile, project-status); use LLM for narrative synthesis (decision-trail, reasoning chains). Add citations automatically via source attribution.',
    triggeredBy: ['rag-mp-009', 'rag-mp-011'],
    layer: 'output',
  },
  {
    id: 'rag-comp-014',
    categoryId: 'monitoring',
    categoryName: 'Monitoring & Logging',
    selectedTechnology: 'Structured Logging + Metrics Collection',
    justification: 'Log every tool call (source, parameters, result, latency, success/failure). Track metrics per query: recall, precision, latency, confidence, data gaps detected. Alert if m-005 (latency p95) >5000ms or m-007 (freshness detection) <88%.',
    triggeredBy: ['rag-mp-006', 'rag-mp-010'],
    layer: 'ops',
  },
]

/**
 * Enterprise RAG Copilot - Trust Boundaries
 */
const ENTERPRISE_RAG_BOUNDARIES: TrustBoundaryV3[] = [
  {
    id: 'rag-tb-001',
    name: 'Autonomous Data Retrieval',
    zone: 'autonomous',
    components: ['rag-comp-004'],
    description: 'Data retrieval from all 5 sources (read-only operations). No decisions made; retrieval is deterministic.',
  },
  {
    id: 'rag-tb-002',
    name: 'Autonomous Entity Resolution',
    zone: 'autonomous',
    components: ['rag-comp-005'],
    description: 'Entity resolution with confidence >95%. High-confidence match; low risk of confusion.',
  },
  {
    id: 'rag-tb-003',
    name: 'Autonomous Access Control Filtering',
    zone: 'autonomous',
    components: ['rag-comp-006'],
    description: 'Access control filtering (hiding inaccessible items). Permission checks are binary; correct-or-incorrect, not probabilistic.',
  },
  {
    id: 'rag-tb-004',
    name: 'Autonomous Simple Lookups',
    zone: 'autonomous',
    components: ['rag-comp-002'],
    description: 'Simple lookup responses (direct answer to simple question; no inference involved).',
  },
  {
    id: 'rag-tb-005',
    name: 'Autonomous Freshness Detection',
    zone: 'autonomous',
    components: ['rag-comp-011'],
    description: 'Freshness detection and flagging (marking documents as aging/stale). Deterministic age calculation; flagging is safety-neutral.',
  },
  {
    id: 'rag-tb-006',
    name: 'Supervised Entity Resolution (Medium Confidence)',
    zone: 'supervised',
    components: ['rag-comp-005'],
    description: 'Entity resolution with confidence 70-94%. Probabilistic match; human should verify.',
  },
  {
    id: 'rag-tb-007',
    name: 'Supervised Cross-Source Correlation',
    zone: 'supervised',
    components: ['rag-comp-009'],
    description: 'Cross-source correlation with <85% confidence. Fuzzy matching; verify correlated items are truly related.',
  },
  {
    id: 'rag-tb-008',
    name: 'Supervised Slack Thread Completeness',
    zone: 'supervised',
    components: ['rag-comp-008'],
    description: 'Slack thread context inclusion (ensure full context retrieved). Completeness check; verify thread fetches succeeded.',
  },
  {
    id: 'rag-tb-009',
    name: 'Supervised Complex Synthesis',
    zone: 'supervised',
    components: ['rag-comp-013'],
    description: 'Complex synthesis (multi-source, narrative answers). Human review recommended for decision support.',
  },
  {
    id: 'rag-tb-010',
    name: 'Supervised Reasoning Chains',
    zone: 'supervised',
    components: ['rag-comp-009'],
    description: 'Reasoning chains (multi-hop inference; any step error propagates). Final answer should be reviewed.',
  },
  {
    id: 'rag-tb-011',
    name: 'Escalation: Unknown Root Causes',
    zone: 'escalation',
    components: ['rag-comp-009'],
    description: 'Root cause analysis with unknown causes (anomalies not explained). Investigation needed; agent confidence may be false confidence.',
  },
  {
    id: 'rag-tb-012',
    name: 'Escalation: Domain Expertise Required',
    zone: 'escalation',
    components: ['rag-comp-002'],
    description: 'Decisions requiring domain expertise (e.g., "should we adopt X?"). Agent can provide information; human should decide.',
  },
  {
    id: 'rag-tb-013',
    name: 'Escalation: Data Gaps',
    zone: 'escalation',
    components: ['rag-comp-011'],
    description: 'Data gaps (>15% of sources unavailable or filtered). Analysis may be incomplete; flag before presenting conclusions.',
  },
  {
    id: 'rag-tb-014',
    name: 'Escalation: Source Conflicts',
    zone: 'escalation',
    components: ['rag-comp-009'],
    description: 'Contradictory information across sources (e.g., "policy says X but Slack shows Y"). Data integrity concern; human reconciliation needed.',
  },
  {
    id: 'rag-tb-015',
    name: 'Escalation: Limited Access',
    zone: 'escalation',
    components: ['rag-comp-006'],
    description: 'Low access control coverage (<90% of results are accessible to user). Significant filtering; user may benefit from access elevation.',
  },
]

/**
 * SaaS Customer Support Agent - Components (12 categories)
 */
const SAAS_SUPPORT_COMPONENTS: ComponentSelectionV3[] = [
  {
    id: 'sup-comp-001',
    categoryId: 'orchestration',
    categoryName: 'Orchestration',
    selectedTechnology: 'LangGraph State Machine',
    justification: 'Multi-step routing: triage → kb-search → action-execution → response. Branching: escalate vs self-service.',
    triggeredBy: ['sup-mp-001', 'sup-mp-004', 'sup-mp-007'],
    layer: 'routing',
  },
  {
    id: 'sup-comp-002',
    categoryId: 'retrieval',
    categoryName: 'Retrieval',
    selectedTechnology: 'Hybrid (Vector + BM25)',
    justification: 'Vector embeddings (OpenAI text-embed-3-small) for semantic article match; BM25 for exact keyword match.',
    triggeredBy: ['sup-mp-003', 'sup-mp-006'],
    layer: 'context',
  },
  {
    id: 'sup-comp-003',
    categoryId: 'data-fetching',
    categoryName: 'Data Fetching',
    selectedTechnology: 'Sync SQL + Async API',
    justification: 'SQL queries <50ms latency, safe to block; API calls async with timeout.',
    triggeredBy: ['sup-mp-004', 'sup-mp-007'],
    layer: 'ingestion',
  },
  {
    id: 'sup-comp-004',
    categoryId: 'channel-parsing',
    categoryName: 'Channel Parsing',
    selectedTechnology: 'Multi-Parser (Email + Chat)',
    justification: 'Email: extract subject + body. Chat: preserve thread, extract latest + context. Webhook: parse JSON payload.',
    triggeredBy: ['sup-mp-001'],
    layer: 'ingestion',
  },
  {
    id: 'sup-comp-005',
    categoryId: 'sentiment',
    categoryName: 'Sentiment Classification',
    selectedTechnology: 'Transformer Model (DistilBERT)',
    justification: 'Lightweight, <200ms inference, detects emotion (positive/neutral/negative/angry).',
    triggeredBy: ['sup-mp-002'],
    layer: 'context',
  },
  {
    id: 'sup-comp-006',
    categoryId: 'data-normalization',
    categoryName: 'Data Normalization',
    selectedTechnology: 'Pydantic Models',
    justification: 'Enforce schema for ticket, customer, action-request. Validate required fields.',
    triggeredBy: ['sup-mp-004'],
    layer: 'context',
  },
  {
    id: 'sup-comp-007',
    categoryId: 'precondition-validation',
    categoryName: 'Precondition Validation',
    selectedTechnology: 'Rule Engine (Python)',
    justification: 'If-then rules: account_status==suspended → cannot_reset_password. Matrix of (action × preconditions).',
    triggeredBy: ['sup-mp-005'],
    layer: 'routing',
  },
  {
    id: 'sup-comp-008',
    categoryId: 'response-synthesis',
    categoryName: 'Response Synthesis',
    selectedTechnology: 'Jinja2 + Tone Template',
    justification: 'Jinja templates for structure + tone-specific greeting + variable substitution.',
    triggeredBy: ['sup-mp-002', 'sup-mp-009'],
    layer: 'output',
  },
  {
    id: 'sup-comp-009',
    categoryId: 'escalation-routing',
    categoryName: 'Escalation Routing',
    selectedTechnology: 'Skill-Based Router',
    justification: 'Rules: P1 urgent → Engineering first; billing query → Billing; feature request → Sales. Load balancing.',
    triggeredBy: ['sup-mp-007', 'sup-mp-006'],
    layer: 'routing',
  },
  {
    id: 'sup-comp-010',
    categoryId: 'confidence-scoring',
    categoryName: 'Confidence Scoring',
    selectedTechnology: 'Bayesian Combo',
    justification: 'KB match: vector_similarity (0-1) + keyword_match (0-1) → joint confidence. Threshold 0.70 → escalate.',
    triggeredBy: ['sup-mp-006'],
    layer: 'routing',
  },
  {
    id: 'sup-comp-011',
    categoryId: 'observation-logging',
    categoryName: 'Observation & Logging',
    selectedTechnology: 'Structured Logging (JSON)',
    justification: 'Log all tool calls, state transitions, decisions, metrics. Track latency + accuracy per query.',
    triggeredBy: ['sup-mp-007'],
    layer: 'ops',
  },
  {
    id: 'sup-comp-012',
    categoryId: 'human-loop',
    categoryName: 'Human-in-Loop',
    selectedTechnology: 'Escalation Queue UI',
    justification: 'Visual queue for support team. Auto-assign based on skill + load. Show context summary. Track SLA (assign <30min).',
    triggeredBy: ['sup-mp-007', 'sup-mp-008'],
    layer: 'routing',
  },
]

/**
 * SaaS Customer Support Agent - Trust Boundaries
 */
const SAAS_SUPPORT_BOUNDARIES: TrustBoundaryV3[] = [
  {
    id: 'sup-tb-001',
    name: 'Autonomous Ticket Parsing',
    zone: 'autonomous',
    components: ['sup-comp-004'],
    description: 'Ticket ingestion & parsing (all channels). Deterministic; no actions taken.',
  },
  {
    id: 'sup-tb-002',
    name: 'Autonomous Context Lookup',
    zone: 'autonomous',
    components: ['sup-comp-002', 'sup-comp-003'],
    description: 'Customer context lookup & KB search. Read-only; no side effects.',
  },
  {
    id: 'sup-tb-003',
    name: 'Autonomous Self-Service Responses',
    zone: 'autonomous',
    components: ['sup-comp-008'],
    description: 'Self-service responses + KB citations. No decision made; direct answer to query.',
  },
  {
    id: 'sup-tb-004',
    name: 'Autonomous Low-Value Actions',
    zone: 'autonomous',
    components: ['sup-comp-007'],
    description: 'Password reset execution (low-value action). Customer explicitly requested; <$0 financial impact.',
  },
  {
    id: 'sup-tb-005',
    name: 'Supervised High-Value Actions',
    zone: 'supervised',
    components: ['sup-comp-007'],
    description: 'Plan upgrades (financial impact). Action has billing consequences; confirm before executing.',
  },
  {
    id: 'sup-tb-006',
    name: 'Supervised Feature Toggles',
    zone: 'supervised',
    components: ['sup-comp-007'],
    description: 'Feature toggles (product implications). May affect workflow; supervisors review before enabling beta features.',
  },
  {
    id: 'sup-tb-007',
    name: 'Supervised Peak Load Routing',
    zone: 'supervised',
    components: ['sup-comp-009'],
    description: 'Escalation routing (high volume). During peak hours, load balancing may fail; human triage may be needed.',
  },
  {
    id: 'sup-tb-008',
    name: 'Escalation: Suspended Accounts',
    zone: 'escalation',
    components: ['sup-comp-007'],
    description: 'Actions on suspended accounts. Account status is restrictive; human judgment if exception needed.',
  },
  {
    id: 'sup-tb-009',
    name: 'Escalation: High-Value Charges',
    zone: 'escalation',
    components: ['sup-comp-009'],
    description: 'Charges >$10,000 or unusual actions. Financial authorization gate; supervisor approval required.',
  },
  {
    id: 'sup-tb-010',
    name: 'Escalation: Uncertain KB Matches',
    zone: 'escalation',
    components: ['sup-comp-002', 'sup-comp-010'],
    description: 'High-confidence KB match <70% but urgent (P1). Safety gate: if unsure, escalate for human verification.',
  },
]

/**
 * FAQ Knowledge Agent - Components (8 categories)
 */
const FAQ_COMPONENTS: ComponentSelectionV3[] = [
  {
    id: 'faq-comp-001',
    categoryId: 'orchestration',
    categoryName: 'Orchestration',
    selectedTechnology: 'Simple Sequential (No Branching)',
    justification: 'Linear flow: query parse → search → retrieve doc → generate answer. No loops or complex branching needed.',
    triggeredBy: ['faq-mp-001', 'faq-mp-002', 'faq-mp-003', 'faq-mp-004'],
    layer: 'routing',
  },
  {
    id: 'faq-comp-002',
    categoryId: 'search-index',
    categoryName: 'Search Index',
    selectedTechnology: 'Hybrid Semantic + Keyword',
    justification: 'Combine vector embeddings (semantic similarity for paraphrases) with keyword matching (exact topic lookup). Detects query intent automatically.',
    triggeredBy: ['faq-mp-001', 'faq-mp-003'],
    layer: 'context',
  },
  {
    id: 'faq-comp-003',
    categoryId: 'retrieval',
    categoryName: 'Retrieval',
    selectedTechnology: 'Vector Database (FAISS/ChromaDB)',
    justification: 'Store 280 document embeddings (1,536 dim). Enable <2 sec nearest-neighbor search. Index updated monthly.',
    triggeredBy: ['faq-mp-001', 'faq-mp-002'],
    layer: 'context',
  },
  {
    id: 'faq-comp-004',
    categoryId: 'document-parsing',
    categoryName: 'Document Parsing',
    selectedTechnology: 'Markdown Parser + PDF Text Extractor',
    justification: 'Parse YAML frontmatter (metadata), markdown content structure. Extract text from PDF with OCR confidence scoring.',
    triggeredBy: ['faq-mp-002', 'faq-mp-004'],
    layer: 'ingestion',
  },
  {
    id: 'faq-comp-005',
    categoryId: 'answer-synthesis',
    categoryName: 'Answer Synthesis',
    selectedTechnology: 'Template-based (Jinja2)',
    justification: 'Use templates for common response types (direct-answer, excerpt, not-found). Inject retrieved content, citation links, metadata.',
    triggeredBy: ['faq-mp-004'],
    layer: 'output',
  },
  {
    id: 'faq-comp-006',
    categoryId: 'confidence-scoring',
    categoryName: 'Confidence Scoring',
    selectedTechnology: 'Simple Relevance Scoring',
    justification: 'Calculate: vector_similarity_score (0-100) + keyword_match_score (0-100), average as confidence. Route <70% to escalation.',
    triggeredBy: ['faq-mp-003', 'faq-mp-001'],
    layer: 'routing',
  },
  {
    id: 'faq-comp-007',
    categoryId: 'escalation-router',
    categoryName: 'Escalation Router',
    selectedTechnology: 'Rule-based Decision Tree',
    justification: 'If confidence <70% OR query unmatched OR ambiguous intent → determine escalation path (HR vs IT vs domain expert).',
    triggeredBy: ['faq-mp-003'],
    layer: 'routing',
  },
  {
    id: 'faq-comp-008',
    categoryId: 'output-format',
    categoryName: 'Output Format',
    selectedTechnology: 'Markdown + JSON',
    justification: 'Generate markdown response for human readability. Include structured metadata (confidence, sources, escalation info) as JSON.',
    triggeredBy: ['faq-mp-004'],
    layer: 'output',
  },
]

/**
 * FAQ Knowledge Agent - Trust Boundaries
 */
const FAQ_BOUNDARIES: TrustBoundaryV3[] = [
  {
    id: 'faq-tb-001',
    name: 'Autonomous High-Confidence Answers',
    zone: 'autonomous',
    components: ['faq-comp-002', 'faq-comp-003', 'faq-comp-005'],
    description: 'High-confidence answers (>80%) delivered directly. Single-source lookup with strong match.',
  },
  {
    id: 'faq-tb-002',
    name: 'Supervised Medium-Confidence Answers',
    zone: 'supervised',
    components: ['faq-comp-006'],
    description: 'Medium-confidence answers (70-80%). Human review recommended for decision support.',
  },
  {
    id: 'faq-tb-003',
    name: 'Escalation: Low Confidence or Not Found',
    zone: 'escalation',
    components: ['faq-comp-007'],
    description: 'Low-confidence matches (<70%) or no matching document. Route to human expert for investigation.',
  },
  {
    id: 'faq-tb-004',
    name: 'Escalation: Ambiguous Queries',
    zone: 'escalation',
    components: ['faq-comp-007'],
    description: 'Ambiguous or multi-domain questions requiring clarification. Human can ask follow-up questions.',
  },
]

// ─── Dynamic composition cache ───────────────────────────────────────────
const compositionCache = new Map<string, ArchitectureDataV3>()

function composedToV3(comp: ComposedComponent): ComponentSelectionV3 {
  return { id: comp.id, categoryId: comp.categoryId, categoryName: comp.categoryName, selectedTechnology: comp.selectedTechnology, justification: comp.justification, triggeredBy: comp.triggeredByPatterns, layer: comp.layer }
}

function generateDynamicBoundaries(components: ComponentSelectionV3[]): TrustBoundaryV3[] {
  const boundaries: TrustBoundaryV3[] = []
  let idx = 0
  const ingestion = components.filter(c => c.layer === 'ingestion')
  if (ingestion.length > 0) boundaries.push({ id: `dyn-tb-${String(idx++).padStart(3, '0')}`, name: 'Autonomous Data Retrieval', zone: 'autonomous', components: ingestion.map(c => c.id), description: 'Read-only data fetching and parsing. No decisions made.' })
  const context = components.filter(c => c.layer === 'context')
  if (context.length > 0) boundaries.push({ id: `dyn-tb-${String(idx++).padStart(3, '0')}`, name: 'Autonomous Context Enrichment', zone: 'autonomous', components: context.map(c => c.id), description: 'Context building and retrieval. Read-only enrichment.' })
  const output = components.filter(c => c.layer === 'output')
  if (output.length > 0) boundaries.push({ id: `dyn-tb-${String(idx++).padStart(3, '0')}`, name: 'Autonomous Response Generation', zone: 'autonomous', components: output.map(c => c.id), description: 'Deterministic response formatting and delivery.' })
  const execution = components.filter(c => c.layer === 'execution')
  if (execution.length > 0) boundaries.push({ id: `dyn-tb-${String(idx++).padStart(3, '0')}`, name: 'Supervised Execution & Reasoning', zone: 'supervised', components: execution.map(c => c.id), description: 'Tool execution and multi-step reasoning. Human spot-check recommended.' })
  const routing = components.filter(c => c.layer === 'routing')
  if (routing.length > 0) boundaries.push({ id: `dyn-tb-${String(idx++).padStart(3, '0')}`, name: 'Supervised Orchestration & Routing', zone: 'supervised', components: routing.map(c => c.id), description: 'Confidence-based routing and escalation logic.' })
  const ops = components.filter(c => c.layer === 'ops')
  if (ops.length > 0) boundaries.push({ id: `dyn-tb-${String(idx++).padStart(3, '0')}`, name: 'Escalation: Monitoring & Compliance', zone: 'escalation', components: ops.map(c => c.id), description: 'Policy enforcement and anomaly detection. Investigation required.' })
  return boundaries
}

function dynamicCompose(realTileId: string): ArchitectureDataV3 | null {
  if (compositionCache.has(realTileId)) return compositionCache.get(realTileId)!
  const genResult = generatePatterns(realTileId)
  if (!genResult || genResult.patterns.length === 0) return null
  const dimPatterns = genResult.patterns.map(gp => ({
    id: gp.id, tier: gp.tier as 'simple' | 'complex' | 'fuzzy', patternType: gp.tier,
    name: gp.name, description: gp.description,
    taskDimensionId: gp.taskDimensionId, dataDimensionIds: gp.dataDimensionIds,
    responseDimensionId: gp.responseDimensionId, toolDimensionIds: gp.toolDimensionIds,
    exampleQuestions: gp.sampleQuestions,
  }))
  const { architecture } = analyzeAndCompose(dimPatterns as any)
  if (architecture.components.length === 0) return null
  const v3Components = architecture.components.map(composedToV3)
  const dynamicBoundaries = generateDynamicBoundaries(v3Components)
  const notes: string[] = []
  const layers = new Set(v3Components.map(c => c.layer))
  if (layers.has('ingestion')) notes.push('Ensure all data source APIs are accessible with proper authentication')
  if (layers.has('context')) notes.push('Vector indices must be pre-built and updated on a regular schedule')
  if (layers.has('execution')) notes.push('Use streaming for multi-step reasoning to reduce perceived latency')
  if (layers.has('routing')) notes.push('Confidence thresholds should be tuned per use case after deployment')
  if (layers.has('output')) notes.push('Output validation schemas must sync with downstream consumers')
  if (layers.has('ops')) notes.push('Configure monitoring alerts for latency p95, error rates, and confidence drift')
  const result: ArchitectureDataV3 = { components: v3Components, trustBoundaries: dynamicBoundaries, deploymentNotes: notes }
  compositionCache.set(realTileId, result)
  return result
}

/**
 * Main export function - retrieves architecture data by tileId
 * Priority: 1. Dynamic composition, 2. Hardcoded fallback
 */
export function getArchitectureDataV3(tileId: string, realTileId?: string): ArchitectureDataV3 | null {
  const dynamicResult = dynamicCompose(realTileId ?? tileId)
  if (dynamicResult) return dynamicResult

  // Fallback to hardcoded data
  let components: ComponentSelectionV3[] = []
  let boundaries: TrustBoundaryV3[] = []

  switch (tileId) {
    case 'invoice-processing':
      components = INVOICE_PROCESSING_COMPONENTS
      boundaries = INVOICE_PROCESSING_BOUNDARIES
      break
    case 'enterprise-rag':
      components = ENTERPRISE_RAG_COMPONENTS
      boundaries = ENTERPRISE_RAG_BOUNDARIES
      break
    case 'saas-support':
      components = SAAS_SUPPORT_COMPONENTS
      boundaries = SAAS_SUPPORT_BOUNDARIES
      break
    case 'faq-knowledge':
      components = FAQ_COMPONENTS
      boundaries = FAQ_BOUNDARIES
      break
    default:
      return null
  }

  return {
    components,
    trustBoundaries: boundaries,
    deploymentNotes: generateDeploymentNotes(tileId),
  }
}

/**
 * Generate deployment notes based on use case characteristics
 */
function generateDeploymentNotes(tileId: string): string[] {
  const notes: Record<string, string[]> = {
    'invoice-processing': [
      'Ensure AWS CUR exports are configured to S3 bucket with proper IAM access',
      'GCP Billing Export requires BigQuery dataset with hourly backfill enabled',
      'PDF parser requires PDFPlumber and EasyOCR with CUDA support for fast OCR',
      'PO database must have indexed queries on (po_number, vendor_id, amount) for sub-100ms latency',
      'Redis cache must be configured with 1-hour TTL and sufficient memory for 450MB CUR exports',
      'All escalation decisions >$10K must route to designated supervisor with approval workflow',
    ],
    'enterprise-rag': [
      'Confluence, Slack, Drive, Jira, Directory APIs must be accessible from agent runtime',
      'Entity resolution requires email-based canonical IDs across all 5 sources',
      'Permission matrix cache must refresh every 5 minutes or on manual trigger',
      'Slack thread fetches must handle rate limiting (100+ messages per thread is common)',
      'Graph database recommended for entity correlation (Neo4j or TigerGraph)',
      'LLM inference should use streaming for multi-hop reasoning to reduce latency >8s',
    ],
    'saas-support': [
      'Multi-channel ingestion requires email parser (IMAP), chat webhook, and webhook receiver',
      'KB vector embeddings must be regenerated weekly when new articles are published',
      'BM25 search index must be updated daily as articles are modified',
      'Sentiment classifier must be evaluated quarterly on real customer tickets for drift',
      'Escalation queue requires skill-based assignment logic with load balancing',
      'Response latency p95 target is <2s; add caching for frequent queries',
    ],
    'faq-knowledge': [
      'Knowledge base of 280 documents requires monthly embedding regeneration',
      'FAISS or ChromaDB index must be updated when documents are added/modified',
      'Simple sequential orchestration minimizes latency; target <1s for lookups',
      'Markdown parsing requires frontmatter metadata (category, keywords, updated date)',
      'Escalation to HR/IT/domain experts requires clear routing rules per category',
      'FAQ agent is stateless; no session management required',
    ],
  }

  return notes[tileId] || []
}

/**
 * Utility: get components by layer
 */
export function getComponentsByLayer(tileId: string, layer: ComponentSelectionV3['layer']): ComponentSelectionV3[] {
  const data = getArchitectureDataV3(tileId)
  if (!data) return []
  return data.components.filter(c => c.layer === layer)
}

/**
 * Utility: get trust boundaries by zone
 */
export function getTrustBoundariesByZone(tileId: string, zone: TrustBoundaryV3['zone']): TrustBoundaryV3[] {
  const data = getArchitectureDataV3(tileId)
  if (!data) return []
  return data.trustBoundaries.filter(b => b.zone === zone)
}

/**
 * Utility: get all layers
 */
export function getAllLayers(): ComponentSelectionV3['layer'][] {
  return ['ingestion', 'routing', 'context', 'execution', 'output', 'ops']
}

/**
 * Utility: get component count by layer for a tile
 */
export function getComponentCountByLayer(tileId: string): Record<ComponentSelectionV3['layer'], number> {
  const data = getArchitectureDataV3(tileId)
  const layers = getAllLayers()
  const counts = {} as Record<ComponentSelectionV3['layer'], number>

  layers.forEach(layer => {
    counts[layer] = data?.components.filter(c => c.layer === layer).length || 0
  })

  return counts
}
