'use strict'

// ─── Agent Composition Data ─────────────────────────────────────────────────
// Meta patterns, memory architecture, and orchestration patterns per agent type.
// Used by the Agent Composition page (Step 6).

// ─── Meta Patterns ──────────────────────────────────────────────────────────

import { ALL_META_PATTERNS } from './metaPatterns'
import type { MetaPattern } from './metaPatterns'
export type { MetaPattern }




// Meta pattern assignments per tile
const TILE_META_PATTERNS: Record<string, string[]> = {
  'faq-knowledge': [
    'conversational-multi-turn',
    'human-interactive-loop',
    'streaming-incremental',
    'stateless-immutable',
    'single-tool-call',
    'bounded-memory-footprint',
    'extreme-latency-sensitive',
    'cold-start-critical',
    'unstructured-heterogeneous',
    'api-gateway-facade',
    'markdown-narrative-output',
    'degradation-graceful',
  ],
  'doc-intelligence': [
    'unstructured-heterogeneous',
    'strongly-typed-structured',
    'chain-of-references',
    'sparse-structured-metadata',
    'vector-at-scale',
    'pii-sensitive-regulated',
    'audit-trail-required',
    'data-residency-locked',
    'tool-chain-linear',
    'citation-provenance',
    'structured-json-output',
    'session-persistent-memory',
    'sql-database-backend',
    'context-window-latency',
  ],
  'saas-copilot': [
    'embedded-product-ui',
    'conversational-multi-turn',
    'ambiguous-intent-clarification',
    'tool-fan-out-parallel',
    'third-party-saas-heavy',
    'api-gateway-facade',
    'personalized-layout',
    'session-persistent-memory',
    'token-counting-critical',
    'webhook-callback-model',
    'streaming-incremental',
    'vendor-lock-in-avoidance',
  ],
  'research-comparison': [
    'exploratory-search',
    'recursive-nested-decomposition',
    'multi-objective-tradeoff',
    'chain-of-references',
    'sparse-distributed-queries',
    'batch-processing-heavy',
    'citation-provenance',
    'markdown-narrative-output',
    'long-term-learning',
    'context-window-latency',
    'domain-expert-reasoning',
    'progressive-refinement',
    'visual-diagram-generation',
  ],
  'ops-agent': [
    'crash-recovery-required',
    'idempotent-operations',
    'circuit-breaker-pattern',
    'batch-processing-heavy',
    'temporal-event-stream',
    'event-streaming-integration',
    'observability-telemetry',
    'slo-driven-operations',
    'audit-trail-required',
    'deterministic-reproducible',
    'asynchronous-notification',
    'horizontal-scaling',
    'constraint-satisfaction',
  ],
  'coding-agent': [
    'code-executable-data',
    'recursive-nested-decomposition',
    'tool-chain-linear',
    'tool-fan-out-parallel',
    'context-window-latency',
    'session-persistent-memory',
    'streaming-incremental',
    'adversarial-robustness',
    'syntax-validation-required',
    'sandbox-execution-model',
  ],
  'decision-workflow': [
    'structured-json-output',
    'constraint-satisfaction',
    'regulatory-compliance-required',
    'audit-trail-required',
    'deterministic-reproducible',
    'multi-objective-tradeoff',
    'long-term-learning',
    'chain-of-references',
    'citation-provenance',
  ],
  'onprem-assistant': [
    'air-gapped-deployment',
    'no-external-api-calls',
    'encrypted-state-required',
    'cold-start-critical',
    'bounded-memory-footprint',
    'latency-constrained-inference',
    'deterministic-reproducible',
    'conversational-multi-turn',
  ],
  'multimodal-agent': [
    'multimodal-fusion',
    'session-persistent-memory',
    'tool-fan-out-parallel',
    'domain-expert-reasoning',
    'recursive-nested-decomposition',
    'batch-processing-heavy',
    'progressive-refinement',
    'multi-modality-output',
    'visual-diagram-generation',
  ],
  'consumer-chat': [
    'multi-million-user-scale',
    'high-throughput-streaming',
    'extreme-latency-sensitive',
    'bounded-memory-footprint',
    'cold-start-critical',
    'request-scoped-state',
    'personalized-layout',
    'jitter-intolerant',
    'streaming-incremental',
    'canary-deployment',
    'horizontal-scaling',
    'circuit-breaker-pattern',
    'observability-telemetry',
    'throughput-over-latency',
  ],
}

export function getMetaPatterns(tileId: string): MetaPattern[] {
  const ids = TILE_META_PATTERNS[tileId] ?? []
  if (import.meta.env.DEV) {
    const missing = ids.filter((id) => !ALL_META_PATTERNS[id])
    if (missing.length > 0) {
      console.warn(`[compositionData] Missing meta patterns for tile "${tileId}": ${missing.join(', ')}`)
    }
  }
  return ids.map((id) => ALL_META_PATTERNS[id]).filter(Boolean)
}

// ─── Component Categories ───────────────────────────────────────────────────

export const COMPONENT_CATEGORIES = [
  { id: 'input-api', label: 'Input / API Layer', color: '#0ea5e9' },
  { id: 'session-context', label: 'Session / Context Mgr', color: '#8b5cf6' },
  { id: 'orchestrator', label: 'Orchestrator', color: '#4338ca' },
  { id: 'planning-llm', label: 'Planning LLM', color: '#2563eb' },
  { id: 'task-decomposition', label: 'Task Decomposition', color: '#7c3aed' },
  { id: 'tool-data-access', label: 'Tool / Data Access', color: '#059669' },
  { id: 'retrieval-rag', label: 'Retrieval / RAG', color: '#065f46' },
  { id: 'tool-execution', label: 'Tool Execution', color: '#d97706' },
  { id: 'response-generation', label: 'Response Generation', color: '#dc2626' },
  { id: 'personalization-policy', label: 'Personalization', color: '#be185d' },
  { id: 'output-delivery', label: 'Output Delivery', color: '#ea580c' },
] as const

// ─── Memory Architecture ────────────────────────────────────────────────────

export interface MemoryConfig {
  type: 'short-term' | 'long-term' | 'episodic'
  label: string
  description: string
  retention: string
  usedBy: string[]
}

const MEMORY_CONFIGS: Record<string, MemoryConfig[]> = {
  'faq-knowledge': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Holds current session context: user query, retrieved chunks, and conversation history for the active session.',
      retention: 'Session duration',
      usedBy: ['Session Manager', 'RAG Pipeline', 'Response Generator'],
    },
  ],
  'doc-intelligence': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Active document chunks, current extraction state, and intermediate parsing results.',
      retention: 'Session duration',
      usedBy: ['Document Parser', 'RAG Pipeline', 'Extraction Engine'],
    },
    {
      type: 'long-term',
      label: 'Long-Term Memory',
      description: 'Document embeddings, extracted schemas, and learned entity mappings across processing runs.',
      retention: 'Persistent',
      usedBy: ['Vector Store', 'Entity Normalizer', 'Schema Registry'],
    },
  ],
  'saas-copilot': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Current tool call chain, API responses, and in-progress task state.',
      retention: 'Session duration',
      usedBy: ['Tool Orchestrator', 'API Gateway', 'State Machine'],
    },
    {
      type: 'long-term',
      label: 'Long-Term Memory',
      description: 'User preferences, frequently used tool chains, and learned shortcuts.',
      retention: 'Persistent',
      usedBy: ['Personalization Engine', 'Tool Recommender'],
    },
    {
      type: 'episodic',
      label: 'Episodic Memory',
      description: 'History of past tool invocations and outcomes for learning optimal tool sequences.',
      retention: '90 days rolling',
      usedBy: ['Trajectory Optimizer', 'Error Recovery'],
    },
  ],
  'research-comparison': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Active search results, source documents, and intermediate analysis state.',
      retention: 'Session duration',
      usedBy: ['Search Aggregator', 'Synthesis Engine'],
    },
    {
      type: 'long-term',
      label: 'Long-Term Memory',
      description: 'Source authority rankings, domain knowledge graphs, and cached research artifacts.',
      retention: 'Persistent',
      usedBy: ['Source Ranker', 'Knowledge Graph', 'Cache Layer'],
    },
  ],
  'ops-agent': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Current workflow state, pending operations, and rollback checkpoints.',
      retention: 'Workflow duration',
      usedBy: ['Workflow Engine', 'State Machine', 'Rollback Manager'],
    },
    {
      type: 'long-term',
      label: 'Long-Term Memory',
      description: 'Infrastructure topology, deployment history, and learned operational patterns.',
      retention: 'Persistent',
      usedBy: ['Topology Map', 'Pattern Library', 'Incident History'],
    },
    {
      type: 'episodic',
      label: 'Episodic Memory',
      description: 'Past workflow executions, failure modes, and recovery strategies for self-improvement.',
      retention: '180 days rolling',
      usedBy: ['Error Recovery', 'Trajectory Optimizer', 'Anomaly Detector'],
    },
  ],
  'coding-agent': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Current code context, file contents, test results, and debug state.',
      retention: 'Session duration',
      usedBy: ['Code Analyzer', 'Test Runner', 'Debug Loop'],
    },
    {
      type: 'long-term',
      label: 'Long-Term Memory',
      description: 'Repository structure, code patterns, API signatures, and coding style preferences.',
      retention: 'Persistent',
      usedBy: ['Repo Indexer', 'Style Enforcer', 'API Reference'],
    },
    {
      type: 'episodic',
      label: 'Episodic Memory',
      description: 'Past code generation attempts, successful fixes, and learned debugging strategies.',
      retention: '90 days rolling',
      usedBy: ['Fix Recommender', 'Pattern Learner'],
    },
  ],
  'decision-workflow': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Current request context, compliance check state, and active policy rules.',
      retention: 'Session duration',
      usedBy: ['Policy Engine', 'PII Scanner', 'Compliance Checker'],
    },
    {
      type: 'long-term',
      label: 'Long-Term Memory',
      description: 'Regulatory rule sets, audit logs, and approved decision templates.',
      retention: 'Persistent (immutable)',
      usedBy: ['Audit Logger', 'Rule Engine', 'Template Store'],
    },
  ],
  'onprem-assistant': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Current query context and retrieved documents. Optimized for minimal VRAM footprint.',
      retention: 'Session duration',
      usedBy: ['Session Manager', 'RAG Pipeline'],
    },
  ],
  'multimodal-agent': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Active modality buffers (text, image, audio), cross-modal alignment state.',
      retention: 'Session duration',
      usedBy: ['Modality Router', 'Alignment Engine', 'Buffer Manager'],
    },
    {
      type: 'long-term',
      label: 'Long-Term Memory',
      description: 'Multimodal embeddings, learned modality preferences, and cached transformations.',
      retention: 'Persistent',
      usedBy: ['Embedding Store', 'Preference Engine'],
    },
  ],
  'consumer-chat': [
    {
      type: 'short-term',
      label: 'Short-Term Memory',
      description: 'Active conversation thread, user context, and pending response state.',
      retention: 'Session duration',
      usedBy: ['Conversation Manager', 'Context Window'],
    },
    {
      type: 'long-term',
      label: 'Long-Term Memory',
      description: 'User profiles, conversation history summaries, and learned engagement patterns.',
      retention: 'Persistent',
      usedBy: ['User Profile Store', 'Engagement Optimizer'],
    },
    {
      type: 'episodic',
      label: 'Episodic Memory',
      description: 'Past conversation outcomes, satisfaction signals, and personalization data.',
      retention: '365 days rolling',
      usedBy: ['Satisfaction Tracker', 'Personalization Engine'],
    },
  ],
}

export function getMemoryConfig(tileId: string): MemoryConfig[] {
  return MEMORY_CONFIGS[tileId] ?? []
}

// ─── Orchestration Patterns ─────────────────────────────────────────────────

export interface OrchestrationPattern {
  id: string
  problem: string
  solution: string
  components: string[]
}

const TILE_ORCHESTRATION: Record<string, OrchestrationPattern[]> = {
  'faq-knowledge': [
    {
      id: 'faq-orch-1',
      problem: 'User asks a simple factual question that has one correct answer in the knowledge base.',
      solution: 'Single-shot RAG: classify intent, retrieve top-k chunks, generate grounded response.',
      components: ['Intent Classifier', 'RAG Pipeline', 'Response Generator'],
    },
    {
      id: 'faq-orch-2',
      problem: 'User asks an ambiguous question that could map to multiple FAQ entries.',
      solution: 'Clarification loop: detect ambiguity, ask follow-up, re-retrieve with refined query.',
      components: ['Ambiguity Detector', 'Clarification Engine', 'RAG Pipeline'],
    },
  ],
  'doc-intelligence': [
    {
      id: 'doc-orch-1',
      problem: 'Document is too large to fit in context window for extraction.',
      solution: 'Map-reduce: chunk document, extract per chunk, merge and deduplicate results.',
      components: ['Document Chunker', 'Parallel Extractor', 'Merge Engine'],
    },
    {
      id: 'doc-orch-2',
      problem: 'Extracted data needs to be cross-referenced across multiple documents.',
      solution: 'Graph-based composition: build entity graph from extractions, resolve references, output unified view.',
      components: ['Entity Normalizer', 'Knowledge Graph', 'Composition Engine'],
    },
  ],
  'saas-copilot': [
    {
      id: 'saas-orch-1',
      problem: 'User request requires calling multiple APIs in a specific sequence.',
      solution: 'Graph state workflow: plan tool chain, execute sequentially with state passing, handle partial failures.',
      components: ['Planner', 'Tool Orchestrator', 'State Machine', 'Error Handler'],
    },
    {
      id: 'saas-orch-2',
      problem: 'Tool call fails and the agent needs to recover without losing progress.',
      solution: 'Checkpoint and retry: save state before each tool call, on failure retry with backoff or use alternative tool.',
      components: ['Checkpoint Manager', 'Retry Engine', 'Alternative Router'],
    },
  ],
  'research-comparison': [
    {
      id: 'research-orch-1',
      problem: 'Research topic requires information from many different sources.',
      solution: 'Parallel search and merge: fan out to multiple search engines, collect results, deduplicate, rank by authority.',
      components: ['Search Fanout', 'Result Merger', 'Authority Ranker'],
    },
    {
      id: 'research-orch-2',
      problem: 'Raw search results need to be synthesized into a coherent analysis.',
      solution: 'Hierarchical synthesis: cluster results by theme, summarize per cluster, compose final report.',
      components: ['Theme Clusterer', 'Summarizer', 'Report Composer'],
    },
  ],
  'ops-agent': [
    {
      id: 'ops-orch-1',
      problem: 'Multi-step infrastructure operation where each step depends on the previous result.',
      solution: 'Sequential workflow with rollback: execute steps in order, checkpoint at each stage, rollback on failure.',
      components: ['Workflow Engine', 'Checkpoint Manager', 'Rollback Controller'],
    },
    {
      id: 'ops-orch-2',
      problem: 'Operations that must run on a schedule or trigger on events.',
      solution: 'Event-driven orchestration: subscribe to triggers, plan execution, manage concurrency and deduplication.',
      components: ['Event Listener', 'Scheduler', 'Concurrency Manager'],
    },
  ],
  'coding-agent': [
    {
      id: 'code-orch-1',
      problem: 'Generated code fails tests and needs iterative debugging.',
      solution: 'Generate-test-fix loop: generate code, run tests, analyze failures, fix and re-test until pass.',
      components: ['Code Generator', 'Test Runner', 'Error Analyzer', 'Fix Applier'],
    },
    {
      id: 'code-orch-2',
      problem: 'Code change needs to respect existing codebase patterns and conventions.',
      solution: 'Context-aware generation: index repo structure, extract patterns, constrain generation to match.',
      components: ['Repo Indexer', 'Pattern Extractor', 'Constrained Generator'],
    },
  ],
  'decision-workflow': [
    {
      id: 'decision-orch-1',
      problem: 'Every response must pass compliance checks before delivery.',
      solution: 'Pipeline with gates: generate response, pass through PII scanner, compliance checker, and audit logger before output.',
      components: ['Response Generator', 'PII Scanner', 'Compliance Gate', 'Audit Logger'],
    },
    {
      id: 'decision-orch-2',
      problem: 'Adversarial inputs attempt to bypass safety guardrails.',
      solution: 'Multi-layer defense: input sanitizer, prompt injection detector, output validator, with fallback to human review.',
      components: ['Input Sanitizer', 'Injection Detector', 'Output Validator', 'Escalation Router'],
    },
  ],
  'onprem-assistant': [
    {
      id: 'onprem-orch-1',
      problem: 'Limited compute means model must be loaded and unloaded efficiently.',
      solution: 'Lazy loading with warm cache: load model on first request, keep warm for TTL, unload on idle.',
      components: ['Model Loader', 'VRAM Manager', 'Cache Controller'],
    },
    {
      id: 'onprem-orch-2',
      problem: 'No cloud fallback means all processing must complete locally.',
      solution: 'Local-first pipeline: all retrieval, generation, and post-processing runs on local hardware with graceful degradation.',
      components: ['Local RAG', 'Local LLM', 'Degradation Manager'],
    },
  ],
  'multimodal-agent': [
    {
      id: 'mm-orch-1',
      problem: 'Input contains multiple modalities that must be processed and aligned.',
      solution: 'Modality routing: detect input types, route to specialized processors, align outputs in shared embedding space.',
      components: ['Modality Detector', 'Image Processor', 'Audio Processor', 'Alignment Engine'],
    },
    {
      id: 'mm-orch-2',
      problem: 'Switching between modalities incurs latency overhead.',
      solution: 'Parallel processing with fusion: process modalities concurrently, fuse results at decision layer.',
      components: ['Parallel Executor', 'Modality Buffers', 'Fusion Layer'],
    },
  ],
  'consumer-chat': [
    {
      id: 'chat-orch-1',
      problem: 'Millions of concurrent users require consistent low-latency responses.',
      solution: 'Horizontally scaled pipeline: load balance across instances, shared cache layer, async processing for non-blocking responses.',
      components: ['Load Balancer', 'Shared Cache', 'Async Processor'],
    },
    {
      id: 'chat-orch-2',
      problem: 'Maintaining conversation quality across long sessions.',
      solution: 'Sliding window with summarization: maintain recent context in window, summarize older turns, inject summaries on demand.',
      components: ['Context Window', 'Turn Summarizer', 'Summary Injector'],
    },
  ],
}

export function getOrchestrationPatterns(tileId: string): OrchestrationPattern[] {
  return TILE_ORCHESTRATION[tileId] ?? []
}

// ─── Architecture Flow Data ─────────────────────────────────────────────────
// Derives the composed architecture from meta patterns and the 11 component categories.

export interface ArchFlowNode {
  id: string
  label: string
  categoryId: string
  categoryLabel: string
  selectedComponent: string
  metaPatternIds: string[]
  color: string
  group: 'input-layer' | 'context-orchestration' | 'execution' | 'output'
}

interface TileArchFlow {
  nodes: ArchFlowNode[]
}

const TILE_ARCH_FLOWS: Record<string, TileArchFlow> = {
  'faq-knowledge': {
    nodes: [
      { id: 'input-api-faq', label: 'FastAPI', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'FastAPI', metaPatternIds: ['api-gateway-facade', 'conversational-multi-turn'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-faq', label: 'Redis', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Redis', metaPatternIds: ['streaming-incremental', 'stateless-immutable'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-faq', label: 'OpenAI Agents SDK loop', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'OpenAI Agents SDK loop', metaPatternIds: ['single-tool-call', 'human-interactive-loop', 'bounded-memory-footprint'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-faq', label: 'GPT-4o Mini', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'GPT-4o Mini', metaPatternIds: ['cold-start-critical', 'extreme-latency-sensitive', 'degradation-graceful'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-faq', label: 'Prompt-based (ReAct)', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Prompt-based (ReAct)', metaPatternIds: ['unstructured-heterogeneous', 'cold-start-critical'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-faq', label: 'Basic connectors', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'Basic connectors', metaPatternIds: ['single-tool-call', 'api-gateway-facade'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-faq', label: 'pgvector', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'pgvector', metaPatternIds: ['unstructured-heterogeneous', 'bounded-memory-footprint', 'extreme-latency-sensitive'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-faq', label: 'Synchronous function calls', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Synchronous function calls', metaPatternIds: ['single-tool-call', 'cold-start-critical'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-faq', label: 'GPT-4o Mini', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'GPT-4o Mini', metaPatternIds: ['streaming-incremental', 'markdown-narrative-output'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-faq', label: 'Light moderation rules', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'Light moderation rules', metaPatternIds: ['conversational-multi-turn'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-faq', label: 'Vercel AI SDK + SSE', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'Vercel AI SDK + SSE', metaPatternIds: ['streaming-incremental', 'markdown-narrative-output'], color: '#ea580c', group: 'output' },
    ],
  },
  'doc-intelligence': {
    nodes: [
      { id: 'input-api-doc', label: 'Azure APIM', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'Azure APIM', metaPatternIds: ['api-gateway-facade', 'pii-sensitive-regulated'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-doc', label: 'Redis + PostgreSQL', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Redis + PostgreSQL', metaPatternIds: ['session-persistent-memory', 'sql-database-backend'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-doc', label: 'LangGraph', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'LangGraph', metaPatternIds: ['chain-of-references', 'tool-chain-linear', 'sparse-structured-metadata'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-doc', label: 'Claude Sonnet 4', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'Claude Sonnet 4', metaPatternIds: ['strongly-typed-structured', 'context-window-latency', 'audit-trail-required'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-doc', label: 'Graph-based decomposition', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Graph-based decomposition', metaPatternIds: ['chain-of-references', 'sparse-structured-metadata'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-doc', label: 'MCP + enterprise connectors', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'MCP + enterprise connectors', metaPatternIds: ['pii-sensitive-regulated', 'audit-trail-required'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-doc', label: 'Azure AI Search', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'Azure AI Search', metaPatternIds: ['vector-at-scale', 'data-residency-locked', 'citation-provenance'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-doc', label: 'Tool runner', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Tool runner', metaPatternIds: ['tool-chain-linear', 'audit-trail-required'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-doc', label: 'Claude Sonnet 4', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'Claude Sonnet 4', metaPatternIds: ['structured-json-output', 'citation-provenance'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-doc', label: 'NeMo Guardrails', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'NeMo Guardrails', metaPatternIds: ['pii-sensitive-regulated'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-doc', label: 'Web chat + API streaming', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'Web chat + API streaming', metaPatternIds: ['structured-json-output', 'session-persistent-memory'], color: '#ea580c', group: 'output' },
    ],
  },
  'saas-copilot': {
    nodes: [
      { id: 'input-api-saas', label: 'Kong Gateway', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'Kong Gateway', metaPatternIds: ['api-gateway-facade', 'third-party-saas-heavy'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-saas', label: 'Redis + app DB', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Redis + app DB', metaPatternIds: ['session-persistent-memory', 'token-counting-critical'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-saas', label: 'OpenAI Agents SDK', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'OpenAI Agents SDK', metaPatternIds: ['tool-fan-out-parallel', 'conversational-multi-turn', 'webhook-callback-model'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-saas', label: 'GPT-4o', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'GPT-4o', metaPatternIds: ['ambiguous-intent-clarification', 'token-counting-critical', 'third-party-saas-heavy'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-saas', label: 'Handoffs per capability', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Handoffs per capability', metaPatternIds: ['tool-fan-out-parallel', 'embedded-product-ui'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-saas', label: 'MCP + REST connectors', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'MCP + REST connectors', metaPatternIds: ['third-party-saas-heavy', 'vendor-lock-in-avoidance'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-saas', label: 'pgvector (light)', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'pgvector (light)', metaPatternIds: ['embedded-product-ui', 'token-counting-critical', 'streaming-incremental'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-saas', label: 'Sandboxed actions', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Sandboxed actions', metaPatternIds: ['tool-fan-out-parallel', 'third-party-saas-heavy'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-saas', label: 'Synthesis model', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'Synthesis model', metaPatternIds: ['streaming-incremental', 'conversational-multi-turn'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-saas', label: 'LaunchDarkly + Guardrails', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'LaunchDarkly + Guardrails', metaPatternIds: ['personalized-layout'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-saas', label: 'Embedded widget + streaming', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'Embedded widget + streaming', metaPatternIds: ['embedded-product-ui', 'streaming-incremental'], color: '#ea580c', group: 'output' },
    ],
  },
  'research-comparison': {
    nodes: [
      { id: 'input-api-research', label: 'FastAPI', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'FastAPI', metaPatternIds: ['exploratory-search', 'multi-objective-tradeoff'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-research', label: 'Redis + durable store', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Redis + durable store', metaPatternIds: ['long-term-learning', 'batch-processing-heavy'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-research', label: 'LangGraph iterative', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'LangGraph iterative', metaPatternIds: ['recursive-nested-decomposition', 'progressive-refinement', 'exploratory-search'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-research', label: 'Claude Opus 4', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'Claude Opus 4', metaPatternIds: ['domain-expert-reasoning', 'context-window-latency', 'multi-objective-tradeoff'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-research', label: 'Explicit planner chain', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Explicit planner chain', metaPatternIds: ['recursive-nested-decomposition', 'chain-of-references'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-research', label: 'MCP + web/search', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'MCP + web/search', metaPatternIds: ['exploratory-search', 'sparse-distributed-queries'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-research', label: 'Weaviate + OpenSearch', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'Weaviate + OpenSearch', metaPatternIds: ['batch-processing-heavy', 'citation-provenance', 'long-term-learning'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-research', label: 'Search + code-exec', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Search + code-exec', metaPatternIds: ['exploratory-search', 'batch-processing-heavy'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-research', label: 'Citation writer model', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'Citation writer model', metaPatternIds: ['citation-provenance', 'markdown-narrative-output'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-research', label: 'Grounding guardrails', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'Grounding guardrails', metaPatternIds: ['citation-provenance'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-research', label: 'Streaming report UI', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'Streaming report UI', metaPatternIds: ['markdown-narrative-output', 'visual-diagram-generation'], color: '#ea580c', group: 'output' },
    ],
  },
  'ops-agent': {
    nodes: [
      { id: 'input-api-ops', label: 'Enterprise APIM', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'Enterprise APIM', metaPatternIds: ['event-streaming-integration', 'observability-telemetry'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-ops', label: 'Redis + Postgres durable', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Redis + Postgres durable', metaPatternIds: ['temporal-event-stream', 'idempotent-operations'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-ops', label: 'Temporal', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'Temporal', metaPatternIds: ['crash-recovery-required', 'deterministic-reproducible', 'audit-trail-required'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-ops', label: 'Frontier model + smaller', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'Frontier model + smaller', metaPatternIds: ['slo-driven-operations', 'asynchronous-notification', 'horizontal-scaling'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-ops', label: 'Durable workflow decomposition', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Durable workflow decomposition', metaPatternIds: ['idempotent-operations', 'circuit-breaker-pattern'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-ops', label: 'MCP + CRM/ERP', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'MCP + CRM/ERP', metaPatternIds: ['audit-trail-required', 'deterministic-reproducible'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-ops', label: 'Light RAG (SOP docs)', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'Light RAG (SOP docs)', metaPatternIds: ['batch-processing-heavy', 'observability-telemetry', 'constraint-satisfaction'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-ops', label: 'Temporal activities', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Temporal activities', metaPatternIds: ['idempotent-operations', 'crash-recovery-required'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-ops', label: 'Low-cost synthesis model', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'Low-cost synthesis model', metaPatternIds: ['asynchronous-notification', 'horizontal-scaling'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-ops', label: 'Approval gates + policy', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'Approval gates + policy', metaPatternIds: ['constraint-satisfaction', 'slo-driven-operations'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-ops', label: 'Ops dashboard + notifications', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'Ops dashboard + notifications', metaPatternIds: ['asynchronous-notification', 'observability-telemetry'], color: '#ea580c', group: 'output' },
    ],
  },
  'coding-agent': {
    nodes: [
      { id: 'input-api-coding', label: 'IDE plugin gateway', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'IDE plugin gateway', metaPatternIds: ['code-executable-data', 'working-memory-limited'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-coding', label: 'Local session + cloud', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Local session + cloud', metaPatternIds: ['session-persistent-memory', 'context-window-latency'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-coding', label: 'LangGraph / Agents SDK', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'LangGraph / Agents SDK', metaPatternIds: ['tool-chain-linear', 'tool-fan-out-parallel', 'recursive-nested-decomposition'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-coding', label: 'Claude Sonnet 4 / GPT-5', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'Claude Sonnet 4 / GPT-5', metaPatternIds: ['context-window-latency', 'domain-expert-reasoning', 'adversarial-robustness'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-coding', label: 'Repo-aware planner', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Repo-aware planner', metaPatternIds: ['recursive-nested-decomposition', 'code-executable-data'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-coding', label: 'MCP + terminal/git', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'MCP + terminal/git', metaPatternIds: ['tool-chain-linear', 'code-executable-data'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-coding', label: 'Codebase index (pgvector)', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'Codebase index (pgvector)', metaPatternIds: ['tool-chain-linear', 'context-window-latency', 'streaming-incremental'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-coding', label: 'Sandboxed code execution', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Sandboxed code execution', metaPatternIds: ['code-executable-data', 'adversarial-robustness'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-coding', label: 'Code-patch model', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'Code-patch model', metaPatternIds: ['streaming-incremental', 'code-executable-data'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-coding', label: 'Tool permissioning', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'Tool permissioning', metaPatternIds: ['adversarial-robustness', 'inference-safety-gates'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-coding', label: 'IDE inline + PR comments', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'IDE inline + PR comments', metaPatternIds: ['embedded-product-ui', 'streaming-incremental'], color: '#ea580c', group: 'output' },
    ],
  },
  'decision-workflow': {
    nodes: [
      { id: 'input-api-decision', label: 'Azure APIM + strict RBAC', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'Azure APIM + strict RBAC', metaPatternIds: ['pii-sensitive-regulated', 'zero-trust-architecture'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-decision', label: 'Redis + Postgres (retention)', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Redis + Postgres (retention)', metaPatternIds: ['audit-trail-required', 'deterministic-reproducible'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-decision', label: 'Foundry / LangGraph', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'Foundry / LangGraph', metaPatternIds: ['guided-decision-tree', 'deterministic-reproducible', 'audit-trail-required'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-decision', label: 'Enterprise-controlled model', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'Enterprise-controlled model', metaPatternIds: ['model-transparency', 'inference-attestation', 'pii-avoidance'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-decision', label: 'Deterministic approval flow', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Deterministic approval flow', metaPatternIds: ['constraint-satisfaction', 'guided-decision-tree'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-decision', label: 'MCP behind RBAC', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'MCP behind RBAC', metaPatternIds: ['zero-trust-architecture', 'audit-trail-required'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-decision', label: 'Azure AI Search (metadata)', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'Azure AI Search (metadata)', metaPatternIds: ['data-residency-locked', 'pii-sensitive-regulated', 'structured-json-output'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-decision', label: 'Restricted auditable execution', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Restricted auditable execution', metaPatternIds: ['audit-trail-required', 'deterministic-reproducible'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-decision', label: 'Policy-constrained generation', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'Policy-constrained generation', metaPatternIds: ['structured-json-output', 'inference-safety-gates'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-decision', label: 'OpenAI + NeMo Guardrails', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'OpenAI + NeMo Guardrails', metaPatternIds: ['memory-privacy-isolation', 'inference-safety-gates'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-decision', label: 'Enterprise portal + audit log', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'Enterprise portal + audit log', metaPatternIds: ['audit-trail-required', 'pii-avoidance'], color: '#ea580c', group: 'output' },
    ],
  },
  'onprem-assistant': {
    nodes: [
      { id: 'input-api-onprem', label: 'FastAPI internal gateway', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'FastAPI internal gateway', metaPatternIds: ['protocol-agnostic', 'stateless-immutable'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-onprem', label: 'Redis/Postgres on-prem', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Redis/Postgres on-prem', metaPatternIds: ['bounded-memory-footprint', 'vendor-lock-in-avoidance'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-onprem', label: 'LangGraph + Temporal', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'LangGraph + Temporal', metaPatternIds: ['deterministic-reproducible', 'horizontal-scaling', 'degradation-graceful'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-onprem', label: 'vLLM / Ollama (local)', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'vLLM / Ollama (local)', metaPatternIds: ['predictable-latency-bounds', 'vendor-lock-in-avoidance', 'backwards-compatibility-required'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-onprem', label: 'Deterministic graph', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Deterministic graph', metaPatternIds: ['deterministic-reproducible', 'bounded-memory-footprint'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-onprem', label: 'Internal APIs + filesystem', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'Internal APIs + filesystem', metaPatternIds: ['cold-data-access', 'protocol-agnostic'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-onprem', label: 'pgvector / OpenSearch local', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'pgvector / OpenSearch local', metaPatternIds: ['unstructured-heterogeneous', 'bounded-memory-footprint', 'predictable-latency-bounds'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-onprem', label: 'Local workers + sandbox', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Local workers + sandbox', metaPatternIds: ['horizontal-scaling', 'deterministic-reproducible'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-onprem', label: 'Local writer model', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'Local writer model', metaPatternIds: ['human-interactive-loop', 'degradation-graceful'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-onprem', label: 'NeMo Guardrails (local)', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'NeMo Guardrails (local)', metaPatternIds: ['observability-telemetry'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-onprem', label: 'Internal web UI', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'Internal web UI', metaPatternIds: ['stateless-immutable', 'observability-telemetry'], color: '#ea580c', group: 'output' },
    ],
  },
  'multimodal-agent': {
    nodes: [
      { id: 'input-api-mm', label: 'Next.js + managed gateway', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'Next.js + managed gateway', metaPatternIds: ['multimodal-fusion', 'cascade-latency'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-mm', label: 'Redis + media metadata', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Redis + media metadata', metaPatternIds: ['session-persistent-memory', 'token-counting-critical'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-mm', label: 'LangGraph / Agents SDK', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'LangGraph / Agents SDK', metaPatternIds: ['multi-modality-output', 'tool-fan-out-parallel', 'progressive-refinement'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-mm', label: 'Gemini Pro (multimodal)', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'Gemini Pro (multimodal)', metaPatternIds: ['multimodal-fusion', 'domain-expert-reasoning', 'cascade-latency'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-mm', label: 'Modality-branching planner', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Modality-branching planner', metaPatternIds: ['multi-modality-output', 'recursive-nested-decomposition'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-mm', label: 'MCP + media pipelines', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'MCP + media pipelines', metaPatternIds: ['multimodal-fusion', 'batch-processing-heavy'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-mm', label: 'Azure AI Search', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'Azure AI Search', metaPatternIds: ['vector-at-scale', 'progressive-refinement', 'token-counting-critical'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-mm', label: 'Media conversion + OCR', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Media conversion + OCR', metaPatternIds: ['batch-processing-heavy', 'accessibility-first'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-mm', label: 'Multimodal context model', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'Multimodal context model', metaPatternIds: ['streaming-incremental', 'multi-modality-output'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-mm', label: 'Multimodal safety layer', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'Multimodal safety layer', metaPatternIds: ['accessibility-first'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-mm', label: 'Rich streaming UI', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'Rich streaming UI', metaPatternIds: ['streaming-incremental', 'visual-diagram-generation'], color: '#ea580c', group: 'output' },
    ],
  },
  'consumer-chat': {
    nodes: [
      { id: 'input-api-consumer', label: 'Cloud API Gateway + CDN', categoryId: 'input-api', categoryLabel: 'Input / API Layer', selectedComponent: 'Cloud API Gateway + CDN', metaPatternIds: ['high-throughput-streaming', 'jitter-intolerant'], color: '#0ea5e9', group: 'input-layer' },
      { id: 'session-context-consumer', label: 'Redis (hot) + Postgres', categoryId: 'session-context', categoryLabel: 'Session / Context Mgr', selectedComponent: 'Redis (hot) + Postgres', metaPatternIds: ['request-scoped-state', 'high-throughput-streaming'], color: '#8b5cf6', group: 'context-orchestration' },
      { id: 'orchestrator-consumer', label: 'Custom controller / LangGraph', categoryId: 'orchestrator', categoryLabel: 'Orchestrator', selectedComponent: 'Custom controller / LangGraph', metaPatternIds: ['multi-million-user-scale', 'canary-deployment', 'horizontal-scaling'], color: '#4338ca', group: 'context-orchestration' },
      { id: 'planning-llm-consumer', label: 'LiteLLM routed model', categoryId: 'planning-llm', categoryLabel: 'Planning LLM', selectedComponent: 'LiteLLM routed model', metaPatternIds: ['extreme-latency-sensitive', 'throughput-over-latency', 'bounded-memory-footprint'], color: '#2563eb', group: 'context-orchestration' },
      { id: 'task-decomposition-consumer', label: 'Lightweight prompt-based', categoryId: 'task-decomposition', categoryLabel: 'Task Decomposition', selectedComponent: 'Lightweight prompt-based', metaPatternIds: ['cold-start-critical', 'throughput-over-latency'], color: '#7c3aed', group: 'context-orchestration' },
      { id: 'tool-data-access-consumer', label: 'Limited tools + MCP', categoryId: 'tool-data-access', categoryLabel: 'Tool / Data Access', selectedComponent: 'Limited tools + MCP', metaPatternIds: ['high-throughput-streaming', 'extreme-latency-sensitive'], color: '#059669', group: 'execution' },
      { id: 'retrieval-rag-consumer', label: 'Redis/pgvector managed', categoryId: 'retrieval-rag', categoryLabel: 'Retrieval / RAG', selectedComponent: 'Redis/pgvector managed', metaPatternIds: ['extreme-latency-sensitive', 'bounded-memory-footprint', 'streaming-incremental'], color: '#065f46', group: 'execution' },
      { id: 'tool-execution-consumer', label: 'Mostly synchronous', categoryId: 'tool-execution', categoryLabel: 'Tool Execution', selectedComponent: 'Mostly synchronous', metaPatternIds: ['jitter-intolerant', 'high-throughput-streaming'], color: '#d97706', group: 'execution' },
      { id: 'response-generation-consumer', label: 'Fast cheap writer model', categoryId: 'response-generation', categoryLabel: 'Response Generation', selectedComponent: 'Fast cheap writer model', metaPatternIds: ['throughput-over-latency', 'extreme-latency-sensitive'], color: '#dc2626', group: 'execution' },
      { id: 'personalization-policy-consumer', label: 'LaunchDarkly + guardrails', categoryId: 'personalization-policy', categoryLabel: 'Personalization', selectedComponent: 'LaunchDarkly + guardrails', metaPatternIds: ['personalized-layout', 'circuit-breaker-pattern'], color: '#be185d', group: 'output' },
      { id: 'output-delivery-consumer', label: 'Token streaming + mobile', categoryId: 'output-delivery', categoryLabel: 'Output Delivery', selectedComponent: 'Token streaming + mobile', metaPatternIds: ['streaming-incremental', 'observability-telemetry'], color: '#ea580c', group: 'output' },
    ],
  },
}

// Dev-only validation: ensure each tile has exactly 11 category nodes
if (import.meta.env.DEV) {
  const expectedIds = COMPONENT_CATEGORIES.map((c) => c.id)
  for (const [tileId, flow] of Object.entries(TILE_ARCH_FLOWS)) {
    const nodeIds = flow.nodes.map((n) => n.categoryId)
    if (nodeIds.length !== expectedIds.length) {
      console.error(`[compositionData] ${tileId} has ${nodeIds.length} nodes, expected ${expectedIds.length}`)
    }
  }
}

export function getArchFlowData(tileId: string): TileArchFlow | null {
  return TILE_ARCH_FLOWS[tileId] ?? null
}
