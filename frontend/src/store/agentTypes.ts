// ─── Agent Playground Types ────────────────────────────────────────────────
// 6-step flow: Goal → Context Definition → Dimension Analysis → Patterns → Agent Evaluation → Solution Architecture
// Monitoring is a modal launched from Step 6, NOT a stepper step.

export type AgentStageId =
  | 'tiles'
  | 'goal'
  | 'context-definition'
  | 'context-dimensions'
  | 'interaction-discovery'
  | 'agent-evaluation'
  | 'solution-architecture'

export const AGENT_STAGE_ORDER: AgentStageId[] = [
  'goal',
  'context-definition',
  'context-dimensions',
  'interaction-discovery',
  'agent-evaluation',
  'solution-architecture',
]

export const AGENT_STAGE_LABELS: Record<AgentStageId, string> = {
  tiles: 'Select Use Case',
  goal: 'Goal Definition',
  'context-definition': 'Context Definition',
  'context-dimensions': 'Dimension Analysis',
  'interaction-discovery': 'Patterns',
  'agent-evaluation': 'Agent Evaluation',
  'solution-architecture': 'Agent Composition',
}

export const AGENT_STAGE_NUMBERS: Record<AgentStageId, number> = {
  tiles: 0,
  goal: 1,
  'context-definition': 2,
  'context-dimensions': 3,
  'interaction-discovery': 4,
  'agent-evaluation': 5,
  'solution-architecture': 6,
}

// ─── Tile / Use Case ──────────────────────────────────────────────────────

export interface AgentDomain {
  id: string
  label: string
  color: string
  icon: string
  tagline: string
}

export interface AgentTile {
  id: string
  label: string
  shortLabel: string
  domainId: string
  complexity: 'simple' | 'moderate' | 'moderate-complex' | 'complex'
  complexityLabel: string
  color: string
  gradient: string
  bgTint: string
  borderColor: string
  iconName: string
  description: string
  industry: string
  badge: string
  goalStatement: string
  stageSubtitles: Partial<Record<AgentStageId, string>>
}

// ─── Narrative Bridges ────────────────────────────────────────────────────

export interface NarrativeBridge {
  from: AgentStageId
  to: AgentStageId
  text: string
  complexText?: string
  technicalText?: string
  technicalComplexText?: string
}

// ─── Goal Definition ──────────────────────────────────────────────────────

export interface GoalDecomposition {
  primaryActions: string[]
  secondaryActions: string[]
  primaryData: string[]
  supportingData: string[]
  reasoning: string
  trustBoundaryHints?: {
    autonomous: string[]
    supervised: string[]
    escalation: string[]
  }
}

// ─── Instruction Generation (legacy, still used within Context Definition) ─

export interface InstructionStep {
  stepNumber: number
  label: string
  description: string
  technicalDetail?: string
  dataSource?: string
  retrievalType?: string
  toolInvocation?: string
  routingRule?: string
  errorHandling?: string
  escalationCondition?: string
}

// ─── Context Definition (Step 2) ─────────────────────────────────────────
// Stacked sections: Instructions, Data Sources, Agent Outputs, Tools, Tasks

export interface DataSource {
  id: string
  name: string
  format: string
  size: string
  contentTypes?: ('text' | 'tables' | 'images' | 'structured-data' | 'code')[]
}

export type UserProficiency = 'high' | 'medium' | 'low'

export interface UserProfile {
  id: string
  category: string
  proficiency: UserProficiency
  exampleQuestions: string[]
  isCore: boolean  // true for System/Business/End User; false for domain-specific
}

export type ToolStatus = 'active' | 'pending' | 'inactive'

export interface AgentTool {
  id: string
  name: string
  description: string
  status: ToolStatus
  autoDetected: boolean
  icon?: string
  accesses?: string[]
}

// ─── Agent Outputs (replaces User Profiles) ──────────────────────────────
// Defines WHAT the agent produces — domain-specific output types per tile.
// Each output is decomposed into Response Dimensions in the Dimension Analysis.

export interface AgentOutput {
  id: string
  label: string
  description: string
  exampleOutput: string
  triggeringTaskIds: string[]  // which tasks can produce this output
  isCore: boolean
}

export interface AgentTask {
  id: string
  label: string
  description: string
  systemSuggested: boolean
  triggeredBy?: string
}

// ─── Dimension Analysis (Step 3) ─────────────────────────────────────────
// Three-dimensional context model: Task × Data × User Profile
// Task Dimensions = sliced sub-tasks derived from Context Definition tasks
// Data Dimensions = knowledge map showing content topology, depth, entities, gaps
// User Profile Dimensions = behavioral axes (Context × Posture × Channel)

export type OutputPreference =
  | 'short-answer'
  | 'detailed-explanation'
  | 'summary-report'
  | 'action-list'
  | 'data-table'
  | 'visual-chart'
  | 'step-by-step'
  | 'comparison'
  | 'code-snippet'

// Legacy alias for backward compatibility during migration
export type FlowDimension = TaskDimension

export interface TaskDimension {
  id: string
  label: string
  description: string
  parentTaskId: string // traces back to AgentTask.id in Context Definition
  intentCategories: string[]
  confidence: 'high' | 'medium' | 'low'
}

export interface KnowledgeSubTopic {
  name: string
  depth: number // 1-5
}

export interface DataDimension {
  id: string
  label: string
  subTopics: KnowledgeSubTopic[]
  sourceAttribution: SourceContribution[]
  depthScore: 1 | 2 | 3 | 4 | 5
  keyEntities: string[]
  connectedDomains: string[]
  gapNote?: string
}

// Legacy alias for backward compatibility during migration
export type ResponseDimension = UserProfileDimension

export interface UserProfileDimension {
  id: string
  label: string
  description: string
  contextAxis: string
  postureAxis: string
  channelAxis: string
  behaviorImpact: string // how this combination changes agent behavior
}

// ─── Tool Dimensions (Step 3) ──────────────────────────────────────────
// Each tool's operational states as dimensions.
// CRUD states + success/failure + connection states.

export interface ToolState {
  id: string
  label: string          // e.g., "Create Success", "Read Failure"
  operation: string      // e.g., "create", "read", "update", "delete", "connect"
  outcome: 'success' | 'failure' | 'timeout' | 'rate-limited'
  description: string
}

export interface ToolDimension {
  id: string
  toolId: string
  toolName: string
  states: ToolState[]
}

// ─── Response Dimensions (Step 3) ──────────────────────────────────────────
// Decomposition of Agent Outputs along 3 axes: Outcome × Complexity × Interaction
// Replaces UserProfileDimension in the combinatorial formula.

export type OutputOutcome = 'success' | 'partial' | 'failure' | 'escalation'
export type OutputComplexity = 'direct' | 'cross-referenced' | 'inferred'
export type OutputInteraction = 'one-shot' | 'conversational' | 'proactive'

export interface OutputDimension {
  id: string
  label: string           // e.g., "FAQ Answer — Success + Direct + One-shot"
  description: string
  agentOutputId: string   // traces back to AgentOutput
  agentOutputLabel: string
  outcome: OutputOutcome
  complexity: OutputComplexity
  interaction: OutputInteraction
}

export interface FormatDimension {
  id: string
  label: string                   // e.g., "Tabular (CSV/Parquet)"
  description: string             // What parsing challenge this format presents
  formatType: 'tabular' | 'hierarchical' | 'document' | 'image' | 'relational' | 'mixed'
  parsingChallenge: string        // The core difficulty
  failureModes: string[]          // What can go wrong
  toolsRequired: string[]         // What tools/libraries are needed
  sourcesUsing: string[]          // Which data sources use this format
  confidenceRange: string         // e.g., "95-99%" or "78-96%"
}

export interface DimensionAnalysisPayload {
  tileId: string
  agentName: string
  taskDimensions: TaskDimension[]
  dataDimensions: DataDimension[]
  formatDimensions?: FormatDimension[]           // V3: format-level data dimensions
  userProfileDimensions: UserProfileDimension[]  // KEEP for backward compat
  responseDimensions?: OutputDimension[]         // NEW: alias for outputDimensions
  outputDimensions?: OutputDimension[]           // NEW (kept for flexibility)
  toolDimensions: ToolDimension[]                // NEW
  summaryText: string
}

// ─── Patterns / Combination Matrix (Step 4) ──────────────────────────────
// Combinatorial output of Dimension Analysis: Task × Data (power set) × Response × Tool
// Matrix heatmap with explosion animation, pattern cards with dimension DNA

export type PatternTier = 'simple' | 'complex' | 'fuzzy'

export interface CombinationCell {
  taskDimensionId: string
  dataDimensionIds: string[] // supports multi-data combos (was singular)
  isValid: boolean
  patternCount: number
  primaryTier: PatternTier
  responseDimensionIds: string[]
}

export interface DimensionPattern {
  id: string
  name: string
  description: string
  tier: PatternTier
  taskDimensionId: string
  dataDimensionIds: string[] // multi-data: power set combinations
  responseDimensionId: string
  toolDimensionIds: string[]
  patternType: PatternType
  exampleQuestions: string[]
  activatedComponents?: string[]
  inferenceNotes?: string
  ambiguityNotes?: string
}

export interface PatternsPayload {
  tileId: string
  agentName: string
  tileDescription: string
  taskDimensions: string[]
  dataDimensions: string[] // includes combo IDs like 'faq-data-product+pricing'
  responseDimensions: string[]
  toolDimensions: string[]
  totalCombinations: number
  validPatterns: number
  matrix: CombinationCell[][]
  patterns: DimensionPattern[]
  tierBreakdown: { simple: number; complex: number; fuzzy: number }
}

// ─── Source Contribution (shared across dimensions) ──────────────────────

export interface SourceContribution {
  sourceId: string
  sourceName: string
  count: string
}

// ─── Guardrails (pattern modifiers, not dimensions) ─────────────────────
// Guardrails don't create patterns — they constrain them.
// Four categories: Safety, Quality, Escalation, Compliance.

export type GuardrailCategory = 'safety' | 'quality' | 'escalation' | 'compliance'

export interface Guardrail {
  id: string
  category: GuardrailCategory
  label: string
  description: string
  enforcement: 'hard' | 'soft' // hard = always enforced, soft = configurable threshold
  threshold?: string // e.g., "confidence < 80%", "PII detected"
}

export const GUARDRAIL_CATEGORY_META: Record<GuardrailCategory, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  description: string
}> = {
  safety: {
    label: 'Safety Boundaries',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    icon: 'Shield',
    description: 'Hard limits the agent will never cross',
  },
  quality: {
    label: 'Quality Thresholds',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    icon: 'Gauge',
    description: 'Minimum standards for agent output',
  },
  escalation: {
    label: 'Escalation Policies',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    icon: 'ArrowUpRight',
    description: 'When the agent hands off to a human',
  },
  compliance: {
    label: 'Compliance Rules',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    icon: 'Scale',
    description: 'Regulatory and policy requirements',
  },
}

// ─── WOW Factor Types ────────────────────────────────────────────────────
// Live iteration counter, "What Just Happened" receipt, floating sidebar

export interface WorkSavedEntry {
  stageId: AgentStageId
  stageLabel: string
  metric: string
  value: string
  icon: string
}

export interface StageReceipt {
  stageId: AgentStageId
  stageLabel: string
  duration: string
  itemsProcessed: number
  highlights: string[]
}

// ─── Pattern Types & Classification (Steps 3-4) ─────────────────────────
// 5 question complexity pattern types (Simple, Hopping, Aggregator, Branch, Reasoning).
// "Combination" was removed — handled by merged activation profiles.
// "Comparison" was rejected as standalone — it's Aggregator + Branch merged.
// Classified into 3 tiers: Simple, Complex, Fuzzy.

export type PatternType = 'simple' | 'hopping' | 'aggregator' | 'branch' | 'reasoning'

export const PATTERN_TYPE_LABELS: Record<PatternType, string> = {
  simple: 'Simple',
  hopping: 'Hopping',
  aggregator: 'Aggregator',
  branch: 'Branch',
  reasoning: 'Reasoning',
}

export const PATTERN_TYPE_COMPLEXITY: Record<PatternType, string> = {
  simple: 'Low',
  hopping: 'Medium',
  aggregator: 'High',
  branch: 'High',
  reasoning: 'Very High',
}

export type PatternClassification = 'simple' | 'complex' | 'fuzzy'

export const PATTERN_CLASSIFICATION_LABELS: Record<PatternClassification, string> = {
  simple: 'Simple Patterns',
  complex: 'Complex Patterns',
  fuzzy: 'Fuzzy Patterns',
}

export const PATTERN_CLASSIFICATION_META: Record<PatternClassification, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  activeBg: string
  description: string
}> = {
  simple: {
    label: 'Simple Patterns',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#16a34a33',
    activeBg: '#dcfce7',
    description: 'High-confidence, single-path patterns the agent handles reliably.',
  },
  complex: {
    label: 'Complex Patterns',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#dc262633',
    activeBg: '#fee2e2',
    description: 'Multi-step patterns requiring cross-referencing or decision logic.',
  },
  fuzzy: {
    label: 'Fuzzy Patterns',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#d9770633',
    activeBg: '#fef3c7',
    description: 'Ambiguous patterns where confidence is low and fallback may be needed.',
  },
}

// ─── Dimension Family Colors ─────────────────────────────────────────────
// Unified color system for the three dimension types across ALL stages:
// Context Definition → Context Dimensions → Patterns.
// Task = Indigo, Data = Emerald, User Profile = Rose.

export const DIMENSION_COLORS = {
  task: {
    primary: '#4f46e5',   // indigo-600
    light: '#eef2ff',     // indigo-50
    medium: '#c7d2fe',    // indigo-200
    dark: '#3730a3',      // indigo-800
    label: 'Task',
  },
  data: {
    primary: '#059669',   // emerald-600
    light: '#ecfdf5',     // emerald-50
    medium: '#a7f3d0',    // emerald-200
    dark: '#065f46',      // emerald-800
    label: 'Data Source',
  },
  userProfile: {
    primary: '#e11d48',   // rose-600
    light: '#fff1f2',     // rose-50
    medium: '#fecdd3',    // rose-200
    dark: '#9f1239',      // rose-800
    label: 'User Profile',
  },
  output: {
    primary: '#e11d48',   // rose-600 (same as userProfile for continuity)
    light: '#fff1f2',     // rose-50
    medium: '#fecdd3',    // rose-200
    dark: '#9f1239',      // rose-800
    label: 'Output',
  },
  tool: {
    primary: '#8b5cf6',   // violet-500
    light: '#f5f3ff',     // violet-50
    medium: '#ddd6fe',    // violet-200
    dark: '#6d28d9',      // violet-700
    label: 'Tool',
  },
} as const

// ─── Cluster (Dimension Analysis — legacy) ───────────────────────────────

export interface Cluster {
  id: string
  name: string
  memberAspects: string[]
  patternCount: number
  description: string
}

// ─── Discovered Pattern (Patterns — legacy) ──────────────────────────────

export type IntentType = 'explicit' | 'implicit'

export interface DiscoveredPattern {
  id: string
  patternType: PatternType
  classification: PatternClassification
  label: string
  description: string
  exampleQuestions: string[]
  coveragePct: number
  inferenceNote?: string       // complex: what inference was made
  ambiguityNote?: string       // fuzzy: what is ambiguous
  activatedComponents: string[]
  importanceRank: number
  intentType?: IntentType      // explicit = user directly states intent, implicit = intent must be inferred
}

export interface DiscoveryLogEntry {
  timestamp: string
  action: string
  detail: string
}

// ─── Agent Evaluation (Step 5) ───────────────────────────────────────────

export type EvaluationTab = 'overview' | 'scenario-matrix' | 'coverage-analysis' | 'decision-paths'

export interface EvaluationOverview {
  totalPatterns: number
  patternsHandled: number
  handlingByType: Record<PatternType, number>
  overallConfidence: number
  simpleRate: number
  complexRate: number
  fuzzyRate: number
}

export interface ScenarioTest {
  id: string
  query: string
  patternType: PatternType
  expectedAnswer: string
  agentAnswer: string
  result: 'pass' | 'partial' | 'fail' | 'flag'
  testedComponents: string[]
}

export interface CoverageGap {
  cluster: string
  dimension: string
  gapDescription: string
  severity: 'high' | 'medium' | 'low'
}

export interface DecisionStep {
  stepNumber: number
  action: string
  detail: string
  componentUsed?: string
  dataAccessed?: string
}

export interface DecisionPath {
  id: string
  query: string
  patternType: PatternType
  steps: DecisionStep[]
  finalAnswer: string
  confidence: number
}

// ─── Capability Mapping (renamed from Dimension Discovery) ───────────────
// Maps to VibeModel's 26-component agent production stack.
// Each "capability" represents a functional area the agent needs,
// organized by the six layers of the production stack.

export type CapabilityLayer =
  | 'ingestion'
  | 'routing'
  | 'context'
  | 'execution'
  | 'output'
  | 'ops'

export const CAPABILITY_LAYER_LABELS: Record<CapabilityLayer, string> = {
  ingestion: 'Ingestion',
  routing: 'Routing',
  context: 'Context',
  execution: 'Execution',
  output: 'Output',
  ops: 'Ops',
}

// ─── 26-Component Agent Production Stack ─────────────────────────────────
// The canonical registry of all components in VibeModel's agent architecture.
// Each component belongs to one of the 6 layers.

export interface StackComponent {
  id: string
  name: string
  layer: CapabilityLayer
  description: string
  technicalDetail: string
}

export const AGENT_STACK_COMPONENTS: StackComponent[] = [
  // Ingestion Layer (5)
  { id: 'api-gateway', name: 'API Gateway', layer: 'ingestion', description: 'Entry point for all agent requests', technicalDetail: 'Rate limiting, request normalization, protocol translation' },
  { id: 'auth', name: 'Authentication', layer: 'ingestion', description: 'Verifies caller identity and permissions', technicalDetail: 'JWT/OAuth validation, API key management, role-based access' },
  { id: 'input-validation', name: 'Input Validation', layer: 'ingestion', description: 'Validates and sanitizes incoming data', technicalDetail: 'Schema validation, type coercion, boundary checks' },
  { id: 'prompt-injection', name: 'Prompt Injection Detection', layer: 'ingestion', description: 'Detects and blocks prompt injection attacks', technicalDetail: 'Pattern matching, semantic analysis, adversarial input filtering' },
  { id: 'pii-security', name: 'PII / Security Scanner', layer: 'ingestion', description: 'Identifies and masks sensitive data', technicalDetail: 'Named entity recognition, regex patterns, data classification' },

  // Routing Layer (4)
  { id: 'request-classification', name: 'Request Classification', layer: 'routing', description: 'Categorizes the intent and complexity of each request', technicalDetail: 'Multi-label classification, confidence scoring, intent hierarchy' },
  { id: 'agent-router', name: 'Agent Router', layer: 'routing', description: 'Directs requests to the right agent or sub-agent', technicalDetail: 'Rule-based + learned routing, load balancing, fallback chains' },
  { id: 'workflow-orchestrator', name: 'Workflow Orchestrator', layer: 'routing', description: 'Manages multi-step agent workflows', technicalDetail: 'Instruction graph execution with conditional loops, state management, parallel branch coordination' },
  { id: 'failure-handling', name: 'Failure Handling', layer: 'routing', description: 'Catches errors and routes to recovery paths', technicalDetail: 'Circuit breakers, retry logic, graceful degradation' },

  // Context Layer (5)
  { id: 'rag', name: 'RAG Pipeline', layer: 'context', description: 'Retrieves relevant knowledge from document stores', technicalDetail: 'Embedding search, chunking strategies, re-ranking' },
  { id: 'context-graph', name: 'Context Graph', layer: 'context', description: 'Maintains relationships between entities and facts', technicalDetail: 'Knowledge graph queries, entity linking, relationship traversal' },
  { id: 'memory', name: 'Conversation Memory', layer: 'context', description: 'Tracks conversation state and user history', technicalDetail: 'Short-term buffer, long-term storage, memory summarization' },
  { id: 'access-control', name: 'Context Access Control', layer: 'context', description: 'Ensures the agent only accesses permitted data', technicalDetail: 'Row-level security, tenant isolation, permission inheritance' },
  { id: 'reranking', name: 'Re-ranking', layer: 'context', description: 'Re-scores and filters retrieved context for relevance', technicalDetail: 'Cross-encoder scoring, diversity filtering, recency weighting' },

  // Execution Layer (4)
  { id: 'tool-planning', name: 'Tool Planning', layer: 'execution', description: 'Decides which tools to invoke and in what order', technicalDetail: 'Action planning, dependency resolution, cost estimation' },
  { id: 'tool-execution', name: 'Tool Execution', layer: 'execution', description: 'Runs tool calls with timeout and error handling', technicalDetail: 'Sandboxed execution, timeout management, result parsing' },
  { id: 'api-integration', name: 'CRM / EHR APIs', layer: 'execution', description: 'Connects to external business systems', technicalDetail: 'REST/GraphQL clients, data mapping, retry with backoff' },
  { id: 'db-queries', name: 'Database Queries', layer: 'execution', description: 'Runs structured queries against data stores', technicalDetail: 'SQL generation, query optimization, result caching' },

  // Output Layer (5)
  { id: 'output-guardrails', name: 'Output Guardrails', layer: 'output', description: 'Enforces safety and quality constraints on responses', technicalDetail: 'Content filtering, toxicity detection, format validation' },
  { id: 'hallucination-check', name: 'Hallucination Check', layer: 'output', description: 'Verifies factual claims against source material', technicalDetail: 'Claim extraction, source attribution, confidence thresholding' },
  { id: 'policy-enforcement', name: 'Policy Enforcement', layer: 'output', description: 'Applies business rules and compliance requirements', technicalDetail: 'Rule engine evaluation, regulatory checks, approval workflows' },
  { id: 'response-generation', name: 'Response Generation', layer: 'output', description: 'Composes the final user-facing response', technicalDetail: 'Template selection, tone matching, multi-format output' },
  { id: 'citation-linking', name: 'Citation Linking', layer: 'output', description: 'Attaches source references to claims in the response', technicalDetail: 'Source tracking, inline citations, confidence indicators' },

  // Ops Layer (3)
  { id: 'logging-analytics', name: 'Logging & Analytics', layer: 'ops', description: 'Records all agent interactions and decisions', technicalDetail: 'Structured logging, trace IDs, decision audit trail' },
  { id: 'drift-detection', name: 'Drift Detection', layer: 'ops', description: 'Detects shifts in input patterns or agent performance', technicalDetail: 'Distribution monitoring, accuracy tracking, anomaly detection' },
  { id: 'alerting-feedback', name: 'Alerting & Feedback', layer: 'ops', description: 'Triggers alerts and collects user feedback loops', technicalDetail: 'Threshold-based alerts, feedback ingestion, retraining triggers' },
]

// Precomputed layer groupings
export const STACK_BY_LAYER = AGENT_STACK_COMPONENTS.reduce(
  (acc, comp) => {
    if (!acc[comp.layer]) acc[comp.layer] = []
    acc[comp.layer].push(comp)
    return acc
  },
  {} as Record<CapabilityLayer, StackComponent[]>
)

// ─── 11-Component Category Model ─────────────────────────────────────────
// Customer-facing categories that organize the 26 actual components.
// Architecture composition outputs actual components, not categories.
// Categories are the presentation layer; components are the building blocks.

export interface ComponentCategory {
  id: string
  name: string
  description: string
  componentIds: string[] // IDs from AGENT_STACK_COMPONENTS that belong to this category
}

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  { id: 'input-api', name: 'Input/API Layer', description: 'Entry point for all agent requests. Handles protocol translation, rate limiting, and request normalization.', componentIds: ['api-gateway', 'auth', 'input-validation', 'prompt-injection', 'pii-security'] },
  { id: 'session-context', name: 'Session/Context Manager', description: 'Tracks conversation state, user history, and session continuity across interactions.', componentIds: ['memory', 'access-control'] },
  { id: 'orchestrator', name: 'Orchestrator/Agent Controller', description: 'Directs requests to the right agent or sub-agent. Manages multi-step workflows and parallel coordination.', componentIds: ['agent-router', 'workflow-orchestrator', 'failure-handling'] },
  { id: 'planning-llm', name: 'Planning LLM/Inference', description: 'The reasoning engine. Decides what to do, plans tool usage, and generates responses.', componentIds: ['request-classification', 'tool-planning'] },
  { id: 'task-decomposition', name: 'Task Decomposition', description: 'Breaks complex requests into executable sub-tasks with dependency ordering.', componentIds: ['workflow-orchestrator'] },
  { id: 'tool-data-access', name: 'Tool/Data Access', description: 'Connects to external systems, APIs, databases, and knowledge bases for data retrieval.', componentIds: ['api-integration', 'db-queries'] },
  { id: 'retrieval-rag', name: 'Retrieval/RAG', description: 'Searches and retrieves relevant context from document stores using embedding search and re-ranking.', componentIds: ['rag', 'context-graph', 'reranking'] },
  { id: 'tool-execution', name: 'Tool Execution', description: 'Runs tool calls with sandboxed execution, timeout management, and result parsing.', componentIds: ['tool-execution'] },
  { id: 'response-gen', name: 'Response Generation', description: 'Composes the final user-facing response with appropriate format, tone, and citations.', componentIds: ['response-generation', 'citation-linking'] },
  { id: 'personalization-policy', name: 'Personalization/Policy', description: 'Applies user preferences, business rules, compliance requirements, and safety guardrails.', componentIds: ['output-guardrails', 'hallucination-check', 'policy-enforcement'] },
  { id: 'output-delivery', name: 'Output Delivery', description: 'Delivers responses through the appropriate channel with format adaptation.', componentIds: ['logging-analytics', 'drift-detection', 'alerting-feedback'] },
]

// Precomputed category lookup by component ID
export const COMPONENT_TO_CATEGORY = COMPONENT_CATEGORIES.reduce(
  (acc, cat) => {
    cat.componentIds.forEach((compId) => {
      acc[compId] = cat.id
    })
    return acc
  },
  {} as Record<string, string>
)

export interface CapabilityRequirement {
  componentId: string
  layer: CapabilityLayer
  required: boolean
  activationReason: string
  technicalNote?: string
}

export interface CapabilityGroup {
  layer: CapabilityLayer
  label: string
  icon: string
  color: string
  activeCount: number
  totalCount: number
  requirements: CapabilityRequirement[]
}

// ─── Patterns (Step 4) ───────────────────────────────────────────────────
// Patterns grouped by tier (Simple / Complex / Fuzzy),
// each containing discovered patterns with auto-generated example questions.

export type InteractionConfidence = 'green' | 'amber' | 'red'

export interface ExampleQuery {
  question: string
  handlingNote: string
  simulationSteps?: SimulationStep[]
}

export interface SimulationStep {
  label: string
  detail: string
  toolUsed?: string
  duration?: string
}

// Legacy interface kept for backward compatibility during migration
export interface InteractionGroup {
  confidence: InteractionConfidence
  label: string
  description: string
  count: number
  handlingStrategy: string
  technicalStrategy?: string
  autonomyLevel: 'autonomous' | 'supervised' | 'escalation'
  activatedComponents: string[]
  examples: ExampleQuery[]
}

// New pattern-based grouping for the restructured Interaction Discovery
export interface PatternGroup {
  classification: PatternClassification
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  patterns: DiscoveredPattern[]
}

// ─── Validation / Agent Evaluation ───────────────────────────────────────
// Legacy validation types kept for backward compat during migration.
// New evaluation types (EvaluationOverview, ScenarioTest, CoverageGap,
// DecisionPath) are defined above in the Context Definition section.

export type TrustBoundary = 'autonomous' | 'supervised' | 'escalation' | 'blocked'

export interface ValidationScenario {
  input: string
  expectedBehavior: string
  expectedResponse: string
  verdict: 'PASS' | 'PARTIAL' | 'FAIL'
  testedComponents?: string[]
}

export interface ValidationInteractionEntry {
  interactionName: string
  confidenceLevel: InteractionConfidence
  trustBoundary: TrustBoundary
  totalInteractions: number
  validationSamples: number
  samplingPct: number
  capabilitiesTested: number
  coverageStatus: string
  scenarios: ValidationScenario[]
}

export interface TrustBoundaryData {
  boundary: TrustBoundary
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  count: number
  percentage: number
  description: string
  actionLabel?: string
  actionDescription?: string
  interactions: ValidationInteractionEntry[]
}

export interface ValidationStageData {
  totalScenarios: number
  autonomousPct: number
  categories: TrustBoundaryData[]
}

// ─── Solution Architecture (Step 6) ──────────────────────────────────────
// Shows which components activate per trust boundary / pattern distribution,
// in what order, and with what configuration. Component count is DYNAMIC —
// only active components are shown, not all 26.

export interface ArchitectureLane {
  laneNumber: number
  label: string
  color: string
  trustBoundary: TrustBoundary
  businessDescription: string
  technicalComponents: ArchitectureComponentConfig[]
  interactionFlowCount: number
}

export interface ArchitectureComponentConfig {
  componentId: string
  name: string
  layer: CapabilityLayer
  description: string
  rationale?: string
  order: number
  predecessors?: string[]
  parameters?: Record<string, string>
}

// ─── Pattern-to-Architecture Mapping ─────────────────────────────────────

export interface PatternArchitectureMapping {
  patternType: PatternType
  label: string
  heavyComponents: string[]
  activeComponents: string[]
  lightComponents: string[]
  dormantComponents: string[]
  description: string
}

// ─── Monitoring Dashboard (Modal, NOT a stepper step) ────────────────────

export interface MonitoringStats {
  totalInteractions: number
  avgResolutionTime: string
  escalationRate: number
  agentVersion: string
}

export interface WeeklyHealthDot {
  week: number
  status: 'healthy' | 'warning' | 'critical'
  label: string
}

export interface LandmineCard {
  title: string
  description: string
  week: number
  severity: 'high' | 'medium' | 'low'
  icon: string
  resolution: string
}

export interface MonitoringAlert {
  type: 'escalation-spike' | 'confidence-drop' | 'component-failure' | 'edge-case-cluster' | 'drift'
  title: string
  description: string
  week: number
  color: string
  affectedComponents?: string[]
}

// ─── Drift & New Dimension Cards ──────────────────────────────────────────

export interface DriftCard {
  title: string
  affectedPath: string
  detail: string
  impactMetric: string
  impactFrom: string
  impactTo: string
  week: number
}

export interface NewDimensionCard {
  title: string
  affectedCoverage: string
  detail: string
  impactEstimate: string
  week: number
  category?: 'new-dimension' | 'multi-doc-hop' | 'prompt-injection' | 'absence-detection' | 'confidence-decay'
}

// ─── Performance Trend Data ──────────────────────────────────────────────

export interface TrendDataPoint {
  week: number
  resolutionRate: number
  escalationRate: number
  interactionVolume: number
  avgResolutionTime: number
}
