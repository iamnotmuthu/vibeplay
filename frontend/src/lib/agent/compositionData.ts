'use strict'

// ─── Agent Composition Data ─────────────────────────────────────────────────
// Meta patterns, memory architecture, and orchestration patterns per agent type.
// Used by the Agent Composition page (Step 6).

// ─── Meta Patterns ──────────────────────────────────────────────────────────

export interface MetaPattern {
  id: string
  label: string
  description: string
}

const ALL_META_PATTERNS: Record<string, MetaPattern> = {
  'multi-task-in-single-query': {
    id: 'multi-task-in-single-query',
    label: 'Multi-Task in Single Query',
    description: 'User submits multiple intents in one message that must be decomposed and resolved independently.',
  },
  'multi-data-fetch': {
    id: 'multi-data-fetch',
    label: 'Multi-Data Fetch',
    description: 'Resolution requires pulling data from two or more distinct sources and merging results.',
  },
  'multi-data-composition': {
    id: 'multi-data-composition',
    label: 'Multi-Data Composition',
    description: 'Retrieved data from multiple sources must be synthesized into a single coherent output.',
  },
  'user_intent_report': {
    id: 'user_intent_report',
    label: 'User Intent Report',
    description: 'System generates a structured report based on inferred user intent and available data.',
  },
  'data_much_greater_than_max_context': {
    id: 'data_much_greater_than_max_context',
    label: 'Data >> Max Context',
    description: 'Source data far exceeds model context window. Requires chunking, summarization, or map-reduce.',
  },
  'document_data': {
    id: 'document_data',
    label: 'Document Data',
    description: 'Resolution relies on extracting structured information from unstructured document content.',
  },
  'table_data': {
    id: 'table_data',
    label: 'Table Data',
    description: 'Resolution requires reading, filtering, or computing over tabular/structured data sources.',
  },
  'high_topic_to_token_sparsity': {
    id: 'high_topic_to_token_sparsity',
    label: 'High Topic-to-Token Sparsity',
    description: 'Relevant information is spread thinly across large documents. Retrieval precision is critical.',
  },
  'large_section_data_chunk': {
    id: 'large_section_data_chunk',
    label: 'Large Section Data Chunk',
    description: 'Relevant answers are embedded in large contiguous sections that must be chunked carefully.',
  },
  'entities_normalized': {
    id: 'entities_normalized',
    label: 'Entities Normalized',
    description: 'Entity references must be normalized across sources (e.g., company names, product IDs).',
  },
  'simple_english_context': {
    id: 'simple_english_context',
    label: 'Simple English Context',
    description: 'Source material is plain English with minimal jargon. Standard retrieval and generation suffice.',
  },
  'sustained_conversation_session': {
    id: 'sustained_conversation_session',
    label: 'Sustained Conversation Session',
    description: 'Multi-turn conversation where context must be maintained and updated across many exchanges.',
  },
  'clarification-loop': {
    id: 'clarification-loop',
    label: 'Clarification Loop',
    description: 'Agent must detect ambiguity and ask follow-up questions before resolving the user request.',
  },
}

// Meta pattern assignments per tile
const TILE_META_PATTERNS: Record<string, string[]> = {
  'faq-knowledge': [
    'simple_english_context',
    'document_data',
    'clarification-loop',
    'multi-data-fetch',
  ],
  'doc-intelligence': [
    'document_data',
    'data_much_greater_than_max_context',
    'large_section_data_chunk',
    'high_topic_to_token_sparsity',
    'multi-data-composition',
    'table_data',
    'entities_normalized',
  ],
  'saas-copilot': [
    'multi-task-in-single-query',
    'multi-data-fetch',
    'clarification-loop',
    'sustained_conversation_session',
    'user_intent_report',
  ],
  'research-comparison': [
    'multi-data-fetch',
    'multi-data-composition',
    'data_much_greater_than_max_context',
    'high_topic_to_token_sparsity',
    'user_intent_report',
    'entities_normalized',
  ],
  'ops-agent': [
    'multi-task-in-single-query',
    'sustained_conversation_session',
    'multi-data-fetch',
    'multi-data-composition',
    'clarification-loop',
    'user_intent_report',
  ],
  'coding-agent': [
    'document_data',
    'data_much_greater_than_max_context',
    'large_section_data_chunk',
    'multi-task-in-single-query',
    'sustained_conversation_session',
  ],
  'decision-workflow': [
    'document_data',
    'table_data',
    'entities_normalized',
    'multi-data-composition',
    'user_intent_report',
    'clarification-loop',
  ],
  'onprem-assistant': [
    'simple_english_context',
    'document_data',
    'clarification-loop',
    'data_much_greater_than_max_context',
  ],
  'multimodal-agent': [
    'multi-data-fetch',
    'multi-data-composition',
    'document_data',
    'large_section_data_chunk',
    'sustained_conversation_session',
  ],
  'consumer-chat': [
    'simple_english_context',
    'sustained_conversation_session',
    'clarification-loop',
    'multi-task-in-single-query',
    'user_intent_report',
  ],
}

export function getMetaPatterns(tileId: string): MetaPattern[] {
  const ids = TILE_META_PATTERNS[tileId] ?? []
  return ids.map((id) => ALL_META_PATTERNS[id]).filter(Boolean)
}

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
  group: 'agent-core' | 'retrieval' | 'model' | 'memory' | 'output'
  color: string
}

interface TileArchFlow {
  nodes: ArchFlowNode[]
  modelChoices: { embedding: string; primary: string; secondary?: string }
}

const TILE_ARCH_FLOWS: Record<string, TileArchFlow> = {
  'faq-knowledge': {
    nodes: [
      { id: 'intent', label: 'Intent Classification', group: 'agent-core', color: '#4338ca' },
      { id: 'request', label: 'Request Understanding', group: 'agent-core', color: '#4338ca' },
      { id: 'error', label: 'Error Handling', group: 'agent-core', color: '#4338ca' },
      { id: 'structured', label: 'Structured Data Output', group: 'agent-core', color: '#4338ca' },
      { id: 'chunk', label: 'Doc → Chunk → VectorDB', group: 'retrieval', color: '#065f46' },
      { id: 'retrieval', label: 'Semantic Retrieval', group: 'retrieval', color: '#065f46' },
      { id: 'rerank', label: 'Reranking', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'guardrails', label: 'Output Guardrails', group: 'output', color: '#ea580c' },
      { id: 'response', label: 'Response Generation', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'text-embedding-3-small', primary: 'GPT-4o Mini' },
  },
  'doc-intelligence': {
    nodes: [
      { id: 'parser', label: 'Document Parser', group: 'agent-core', color: '#4338ca' },
      { id: 'intent', label: 'Intent Classification', group: 'agent-core', color: '#4338ca' },
      { id: 'decomp', label: 'Task Decomposition', group: 'agent-core', color: '#4338ca' },
      { id: 'entity', label: 'Entity Normalizer', group: 'agent-core', color: '#4338ca' },
      { id: 'chunk', label: 'Doc → Chunk → VectorDB', group: 'retrieval', color: '#065f46' },
      { id: 'hybrid', label: 'Hybrid Retrieval', group: 'retrieval', color: '#065f46' },
      { id: 'meta', label: 'Metadata Filtering', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'ltm', label: 'Long-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'extraction', label: 'Structured Extraction', group: 'output', color: '#ea580c' },
      { id: 'summary', label: 'Summary Generation', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'Qwen3-Embedding', primary: 'Claude Sonnet 4', secondary: 'Gemini 2.5 Pro' },
  },
  'saas-copilot': {
    nodes: [
      { id: 'graph', label: 'Graph State Workflow', group: 'agent-core', color: '#4338ca' },
      { id: 'intent', label: 'Intent Classification', group: 'agent-core', color: '#4338ca' },
      { id: 'planner', label: 'Multi-step Planner', group: 'agent-core', color: '#4338ca' },
      { id: 'tool-select', label: 'Tool Selection', group: 'agent-core', color: '#4338ca' },
      { id: 'error', label: 'Error Handling & Retry', group: 'agent-core', color: '#4338ca' },
      { id: 'api', label: 'API Execution Layer', group: 'retrieval', color: '#065f46' },
      { id: 'state', label: 'State Persistence', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'ltm', label: 'Long-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'episodic', label: 'Episodic Memory', group: 'memory', color: '#9333ea' },
      { id: 'response', label: 'Response Generation', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'text-embedding-3-large', primary: 'Claude Sonnet 4', secondary: 'GPT-4o' },
  },
  'research-comparison': {
    nodes: [
      { id: 'intent', label: 'Research Intent Parser', group: 'agent-core', color: '#4338ca' },
      { id: 'planner', label: 'Research Planner', group: 'agent-core', color: '#4338ca' },
      { id: 'fanout', label: 'Search Fanout', group: 'agent-core', color: '#4338ca' },
      { id: 'multi-source', label: 'Multi-Source Retrieval', group: 'retrieval', color: '#065f46' },
      { id: 'dedup', label: 'Deduplication & Ranking', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'ltm', label: 'Long-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'synthesis', label: 'Hierarchical Synthesis', group: 'output', color: '#ea580c' },
      { id: 'report', label: 'Report Composer', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'text-embedding-3-large', primary: 'Claude Opus 4', secondary: 'Gemini 2.5 Pro' },
  },
  'ops-agent': {
    nodes: [
      { id: 'workflow', label: 'Graph State Workflow', group: 'agent-core', color: '#4338ca' },
      { id: 'intent', label: 'Intent Classification', group: 'agent-core', color: '#4338ca' },
      { id: 'planner', label: 'Multi-step Planner', group: 'agent-core', color: '#4338ca' },
      { id: 'decomp', label: 'Task Decomposition', group: 'agent-core', color: '#4338ca' },
      { id: 'rollback', label: 'Checkpoint & Rollback', group: 'agent-core', color: '#4338ca' },
      { id: 'tool-exec', label: 'Tool Execution Layer', group: 'retrieval', color: '#065f46' },
      { id: 'state', label: 'State Persistence', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'ltm', label: 'Long-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'episodic', label: 'Episodic Memory', group: 'memory', color: '#9333ea' },
      { id: 'response', label: 'Structured Output', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'text-embedding-3-large', primary: 'Claude Sonnet 4', secondary: 'GPT-4o' },
  },
  'coding-agent': {
    nodes: [
      { id: 'intent', label: 'Code Intent Parser', group: 'agent-core', color: '#4338ca' },
      { id: 'planner', label: 'Implementation Planner', group: 'agent-core', color: '#4338ca' },
      { id: 'gen-loop', label: 'Generate-Test-Fix Loop', group: 'agent-core', color: '#4338ca' },
      { id: 'repo-index', label: 'Repo Indexer', group: 'retrieval', color: '#065f46' },
      { id: 'code-search', label: 'Code Search (AST)', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'ltm', label: 'Long-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'episodic', label: 'Episodic Memory', group: 'memory', color: '#9333ea' },
      { id: 'codegen', label: 'Code Generation', group: 'output', color: '#ea580c' },
      { id: 'test-runner', label: 'Test Runner', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'code-embedding-002', primary: 'Claude Sonnet 4', secondary: 'DeepSeek Coder V3' },
  },
  'decision-workflow': {
    nodes: [
      { id: 'intent', label: 'Intent Classification', group: 'agent-core', color: '#4338ca' },
      { id: 'sanitizer', label: 'Input Sanitizer', group: 'agent-core', color: '#4338ca' },
      { id: 'injection', label: 'Injection Detector', group: 'agent-core', color: '#4338ca' },
      { id: 'policy', label: 'Policy Engine', group: 'agent-core', color: '#4338ca' },
      { id: 'rag', label: 'Regulatory RAG', group: 'retrieval', color: '#065f46' },
      { id: 'pii', label: 'PII Scanner', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'ltm', label: 'Long-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'audit', label: 'Audit Logger', group: 'output', color: '#ea580c' },
      { id: 'response', label: 'Compliant Response', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'text-embedding-3-large', primary: 'Claude Sonnet 4', secondary: 'GPT-4o' },
  },
  'onprem-assistant': {
    nodes: [
      { id: 'intent', label: 'Intent Classification', group: 'agent-core', color: '#4338ca' },
      { id: 'request', label: 'Request Understanding', group: 'agent-core', color: '#4338ca' },
      { id: 'loader', label: 'Model Loader (VRAM)', group: 'agent-core', color: '#4338ca' },
      { id: 'chunk', label: 'Local Doc → Chunk', group: 'retrieval', color: '#065f46' },
      { id: 'local-rag', label: 'Local Vector Search', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'response', label: 'Response Generation', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'nomic-embed-text', primary: 'Llama 3.1 8B', secondary: 'Mistral 7B' },
  },
  'multimodal-agent': {
    nodes: [
      { id: 'modality', label: 'Modality Router', group: 'agent-core', color: '#4338ca' },
      { id: 'image', label: 'Image Processor', group: 'agent-core', color: '#4338ca' },
      { id: 'audio', label: 'Audio Processor', group: 'agent-core', color: '#4338ca' },
      { id: 'fusion', label: 'Cross-Modal Fusion', group: 'agent-core', color: '#4338ca' },
      { id: 'mm-retrieval', label: 'Multimodal Retrieval', group: 'retrieval', color: '#065f46' },
      { id: 'alignment', label: 'Alignment Engine', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'ltm', label: 'Long-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'response', label: 'Multimodal Output', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'CLIP ViT-L/14', primary: 'GPT-4o', secondary: 'Gemini 2.5 Pro' },
  },
  'consumer-chat': {
    nodes: [
      { id: 'intent', label: 'Intent Classification', group: 'agent-core', color: '#4338ca' },
      { id: 'request', label: 'Request Understanding', group: 'agent-core', color: '#4338ca' },
      { id: 'routing', label: 'Load Balancer', group: 'agent-core', color: '#4338ca' },
      { id: 'cache', label: 'Shared Response Cache', group: 'retrieval', color: '#065f46' },
      { id: 'rag', label: 'RAG Pipeline', group: 'retrieval', color: '#065f46' },
      { id: 'stm', label: 'Short-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'ltm', label: 'Long-Term Memory', group: 'memory', color: '#9333ea' },
      { id: 'episodic', label: 'Episodic Memory', group: 'memory', color: '#9333ea' },
      { id: 'response', label: 'Streaming Response', group: 'output', color: '#ea580c' },
      { id: 'personalization', label: 'RAG Personalization', group: 'output', color: '#ea580c' },
    ],
    modelChoices: { embedding: 'text-embedding-3-small', primary: 'Claude Haiku 4', secondary: 'GPT-4o Mini' },
  },
}

export function getArchFlowData(tileId: string): TileArchFlow | null {
  return TILE_ARCH_FLOWS[tileId] ?? null
}
