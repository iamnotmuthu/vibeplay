'use strict'

// Meta Patterns — ~100 abstract data-characteristic patterns
// Cross-referenced from AI Agent Components spreadsheet strengths/limitations
// and 10 use case architectures (A-J)

export interface MetaPattern {
  id: string
  label: string
  description: string
  componentStrengths: Record<string, string>
}

export const ALL_META_PATTERNS: Record<string, MetaPattern> = {
  // ===== GROUP 1: Data Volume & Scale patterns (~10) =====

  'high-throughput-streaming': {
    id: 'high-throughput-streaming',
    label: 'High Throughput Streaming',
    description: 'System must handle continuous data ingestion at high volume with minimal buffering.',
    componentStrengths: {
      'input-api': 'Lightweight routing with streaming support',
      'session-context': 'Sub-millisecond reads for real-time state',
      'output-delivery': 'Full-duplex bidirectional communication',
    },
  },

  'multi-million-user-scale': {
    id: 'multi-million-user-scale',
    label: 'Multi-Million User Scale',
    description: 'System must serve millions of concurrent users with predictable cost structure.',
    componentStrengths: {
      'input-api': 'Pay-per-request auto-scaling architecture',
      'session-context': 'Horizontally scalable state storage',
      'personalization-policy': 'Lightweight short-term memory to avoid explosion',
    },
  },

  'sparse-distributed-queries': {
    id: 'sparse-distributed-queries',
    label: 'Sparse Distributed Queries',
    description: 'Data access patterns are unpredictable and spread across many sources without hot spots.',
    componentStrengths: {
      'tool-data-access': 'Dynamic discovery of available tools',
      'retrieval-rag': 'Metadata filtering to scope retrieval',
      'session-context': 'Flexible schema to handle variety',
    },
  },

  'bounded-memory-footprint': {
    id: 'bounded-memory-footprint',
    label: 'Bounded Memory Footprint',
    description: 'System must operate within strict memory constraints without losing critical state.',
    componentStrengths: {
      'session-context': 'TTL-based automatic cleanup and memory pooling',
      'personalization-policy': 'Selective memory retention with pruning',
      'task-decomposition': 'Stateless node design where possible',
    },
  },

  'batch-processing-heavy': {
    id: 'batch-processing-heavy',
    label: 'Batch Processing Heavy',
    description: 'System processes large volumes of data in discrete batches rather than real-time streams.',
    componentStrengths: {
      'tool-execution': 'Durable retry and crash recovery semantics',
      'orchestrator': 'Explicit workflow tracking and resumption',
      'response-generation': 'Deferred computation and bulk result assembly',
    },
  },

  'extreme-latency-sensitive': {
    id: 'extreme-latency-sensitive',
    label: 'Extreme Latency Sensitive',
    description: 'System must respond in sub-100ms windows, prioritizing speed over depth.',
    componentStrengths: {
      'input-api': 'Edge caching and request routing optimization',
      'planning-llm': 'Fast lightweight models over heavy reasoning',
      'output-delivery': 'Minimal transport overhead and early streaming',
    },
  },

  'vector-at-scale': {
    id: 'vector-at-scale',
    label: 'Vector Operations at Scale',
    description: 'System performs semantic search and similarity operations over millions of embeddings.',
    componentStrengths: {
      'session-context': 'Native vector search with ACID guarantees',
      'retrieval-rag': 'Multi-vector representation strategies',
      'tool-data-access': 'Efficient vector similarity indexing',
    },
  },

  'dynamic-data-volatility': {
    id: 'dynamic-data-volatility',
    label: 'Dynamic Data Volatility',
    description: 'Data changes rapidly and unpredictably, requiring fresh cache invalidation.',
    componentStrengths: {
      'session-context': 'Pub/sub notifications for invalidation',
      'retrieval-rag': 'Re-ranking on fresh data to catch changes',
      'personalization-policy': 'Adaptive preference recalculation',
    },
  },

  'cold-data-access': {
    id: 'cold-data-access',
    label: 'Cold Data Access',
    description: 'Most queried data is infrequently accessed, requiring lazy evaluation and slow IO tolerance.',
    componentStrengths: {
      'tool-data-access': 'Asynchronous data fetching without blocking',
      'orchestrator': 'Non-linear task scheduling to interleave fetches',
      'response-generation': 'Adaptive response assembly as data arrives',
    },
  },

  'exponential-complexity-growth': {
    id: 'exponential-complexity-growth',
    label: 'Exponential Complexity Growth',
    description: 'Token usage or compute needs grow exponentially with query size, requiring early termination.',
    componentStrengths: {
      'planning-llm': 'Intermediate confidence scoring to prune branches',
      'task-decomposition': 'Early exit criteria in decomposition',
      'response-generation': 'Approximation-acceptable output streaming',
    },
  },

  // ===== GROUP 2: Data Type & Structure patterns (~10) =====

  'unstructured-heterogeneous': {
    id: 'unstructured-heterogeneous',
    label: 'Unstructured Heterogeneous Data',
    description: 'Data lacks consistent schema, mixing text, images, code, and metadata in arbitrary formats.',
    componentStrengths: {
      'session-context': 'Schema-flexible storage without validation',
      'retrieval-rag': 'Contextual compression to normalize noise',
      'response-generation': 'Format-adaptive output based on input type',
    },
  },

  'strongly-typed-structured': {
    id: 'strongly-typed-structured',
    label: 'Strongly Typed Structured Data',
    description: 'Data follows strict schemas with validation, enabling deterministic transformation.',
    componentStrengths: {
      'tool-data-access': 'JSON Schema validation and discovery',
      'task-decomposition': 'Type-safe orchestration between nodes',
      'response-generation': 'Guaranteed structured output formats',
    },
  },

  'temporal-event-stream': {
    id: 'temporal-event-stream',
    label: 'Temporal Event Stream',
    description: 'Data is primarily time-ordered events requiring causality reasoning and temporal queries.',
    componentStrengths: {
      'session-context': 'Temporal indexing and range queries',
      'planning-llm': 'Causal reasoning about sequences',
      'personalization-policy': 'Behavioral habit extraction from events',
    },
  },

  'graph-relational': {
    id: 'graph-relational',
    label: 'Graph Relational Structure',
    description: 'Data relationships are best represented as graphs, requiring multi-hop traversal.',
    componentStrengths: {
      'retrieval-rag': 'Knowledge graph navigation for context',
      'task-decomposition': 'Explicit edge-following in decomposition',
      'planning-llm': 'Relationship-aware planning chains',
    },
  },

  'multimodal-fusion': {
    id: 'multimodal-fusion',
    label: 'Multimodal Fusion',
    description: 'System must integrate text, images, audio, and video into coherent understanding.',
    componentStrengths: {
      'input-api': 'Multi-format input routing and validation',
      'response-generation': 'Modality-aware output synthesis',
      'tool-execution': 'Parallel modality-specific processors',
    },
  },

  'code-executable-data': {
    id: 'code-executable-data',
    label: 'Code as Executable Data',
    description: 'Data includes runnable code or code-like artifacts requiring interpretation and execution.',
    componentStrengths: {
      'tool-execution': 'Sandboxed code execution with output capture',
      'retrieval-rag': 'Syntax-aware code retrieval and similarity',
      'task-decomposition': 'Type-safe code generation and validation',
    },
  },

  'pii-sensitive-regulated': {
    id: 'pii-sensitive-regulated',
    label: 'PII Sensitive & Regulated Data',
    description: 'Data contains personally identifiable information or must comply with regulatory requirements.',
    componentStrengths: {
      'session-context': 'Encryption at rest and in flight',
      'tool-data-access': 'Audit logging and access control',
      'personalization-policy': 'Deterministic anonymization policies',
    },
  },

  'sparse-structured-metadata': {
    id: 'sparse-structured-metadata',
    label: 'Sparse Structured Metadata',
    description: 'Rich metadata attached to sparse data points, enabling intelligent filtering.',
    componentStrengths: {
      'retrieval-rag': 'Metadata filtering for scoped retrieval',
      'session-context': 'Efficient tagging and categorization',
      'planning-llm': 'Metadata-guided decomposition',
    },
  },

  'chain-of-references': {
    id: 'chain-of-references',
    label: 'Chain of References',
    description: 'Data primarily consists of references/links to other data, requiring transitive resolution.',
    componentStrengths: {
      'tool-execution': 'Efficient batch link resolution',
      'orchestrator': 'Controlled transitive depth traversal',
      'retrieval-rag': 'Parent document context preservation',
    },
  },

  'time-series-windowed': {
    id: 'time-series-windowed',
    label: 'Time Series Windowed',
    description: 'Data is time-series metrics aggregated into windows, requiring temporal rollups.',
    componentStrengths: {
      'session-context': 'Time-windowed aggregation and TTL policies',
      'planning-llm': 'Trend analysis and anomaly detection',
      'response-generation': 'Temporal annotation in output',
    },
  },

  // ===== GROUP 3: Latency & Performance patterns (~10) =====

  'human-interactive-loop': {
    id: 'human-interactive-loop',
    label: 'Human Interactive Loop',
    description: 'System must maintain <3 second response latency for interactive user feedback.',
    componentStrengths: {
      'input-api': 'Sub-100ms request routing',
      'planning-llm': 'Fast model selection for speed',
      'output-delivery': 'Progressive streaming to perceived responsiveness',
    },
  },

  'acceptable-batch-latency': {
    id: 'acceptable-batch-latency',
    label: 'Acceptable Batch Latency',
    description: 'System can tolerate 30+ second response times for background processing.',
    componentStrengths: {
      'planning-llm': 'Heavy reasoning models for depth',
      'task-decomposition': 'Complex multi-step decomposition',
      'tool-execution': 'Long-running async tool chains',
    },
  },

  'cold-start-critical': {
    id: 'cold-start-critical',
    label: 'Cold Start Critical',
    description: 'Minimizing first-request latency is essential, favoring pre-warmed resources.',
    componentStrengths: {
      'input-api': 'Edge computing and request routing',
      'tool-execution': 'Function pre-warming and orchestration',
      'session-context': 'In-memory cache warming strategies',
    },
  },

  'predictable-latency-bounds': {
    id: 'predictable-latency-bounds',
    label: 'Predictable Latency Bounds',
    description: 'System must guarantee p99 latency SLAs with minimal variance.',
    componentStrengths: {
      'orchestrator': 'Explicit control flow without randomness',
      'planning-llm': 'Deterministic model selection',
      'response-generation': 'Bounded serialization paths',
    },
  },

  'throughput-over-latency': {
    id: 'throughput-over-latency',
    label: 'Throughput Over Latency',
    description: 'System optimizes for total requests/second even if individual latency is higher.',
    componentStrengths: {
      'input-api': 'Async batching and request queuing',
      'orchestrator': 'Concurrent task execution',
      'tool-execution': 'Parallel tool invocation',
    },
  },

  'jitter-intolerant': {
    id: 'jitter-intolerant',
    label: 'Jitter Intolerant',
    description: 'Variance in response time is worse than absolute latency, requiring steady-state performance.',
    componentStrengths: {
      'session-context': 'Pre-allocated memory and connection pools',
      'tool-execution': 'Consistent resource allocation',
      'input-api': 'Rate-based request scheduling',
    },
  },

  'token-counting-critical': {
    id: 'token-counting-critical',
    label: 'Token Counting Critical',
    description: 'LLM token cost is proportional to latency, requiring aggressive token minimization.',
    componentStrengths: {
      'planning-llm': 'Token-aware model selection',
      'task-decomposition': 'Minimal decomposition depth',
      'response-generation': 'Lossless compression of output',
    },
  },

  'cascade-latency': {
    id: 'cascade-latency',
    label: 'Cascade Latency',
    description: 'Sequential tool calls compound latency, requiring parallel and pipelined execution.',
    componentStrengths: {
      'orchestrator': 'Explicit parallelization of independent tasks',
      'task-decomposition': 'Dependency graph for scheduling',
      'tool-execution': 'Concurrent tool invocation support',
    },
  },

  'context-window-latency': {
    id: 'context-window-latency',
    label: 'Context Window Latency',
    description: 'LLM processing time scales with context size, requiring selective context inclusion.',
    componentStrengths: {
      'retrieval-rag': 'Contextual compression and re-ranking',
      'session-context': 'Selective history inclusion',
      'planning-llm': 'Sparse context awareness',
    },
  },

  'network-latency-dominant': {
    id: 'network-latency-dominant',
    label: 'Network Latency Dominant',
    description: 'Network IO dominates total latency, requiring batching and request coalescing.',
    componentStrengths: {
      'input-api': 'Request batching and compression',
      'tool-execution': 'Bulk data transfer optimization',
      'output-delivery': 'Multiplexed response streams',
    },
  },

  // ===== GROUP 4: Security & Compliance patterns (~10) =====

  'audit-trail-required': {
    id: 'audit-trail-required',
    label: 'Audit Trail Required',
    description: 'Every action must be logged with user attribution and timestamp for regulatory compliance.',
    componentStrengths: {
      'tool-execution': 'Immutable execution logs',
      'orchestrator': 'State machine event recording',
      'session-context': 'Append-only transaction log',
    },
  },

  'deterministic-reproducible': {
    id: 'deterministic-reproducible',
    label: 'Deterministic Reproducible',
    description: 'System must produce identical results given identical inputs for compliance verification.',
    componentStrengths: {
      'planning-llm': 'Temperature=0 deterministic inference',
      'orchestrator': 'Seed-based randomness control',
      'task-decomposition': 'Deterministic ordering guarantees',
    },
  },

  'zero-trust-architecture': {
    id: 'zero-trust-architecture',
    label: 'Zero Trust Architecture',
    description: 'Every component interaction requires authentication and authorization checks.',
    componentStrengths: {
      'input-api': 'Token-based request authentication',
      'tool-data-access': 'Granular access control lists',
      'output-delivery': 'Encrypted response transmission',
    },
  },

  'data-residency-locked': {
    id: 'data-residency-locked',
    label: 'Data Residency Locked',
    description: 'Data must remain within specific geographic boundaries due to regulatory constraints.',
    componentStrengths: {
      'session-context': 'Geo-locked storage with replication',
      'tool-data-access': 'Regional endpoint routing',
      'input-api': 'Location-aware request routing',
    },
  },

  'pii-avoidance': {
    id: 'pii-avoidance',
    label: 'PII Avoidance',
    description: 'System must minimize collection and transmission of personally identifiable information.',
    componentStrengths: {
      'personalization-policy': 'Synthetic identifier-based profiles',
      'response-generation': 'Anonymized output generation',
      'session-context': 'Hashed user representation',
    },
  },

  'model-transparency': {
    id: 'model-transparency',
    label: 'Model Transparency',
    description: 'System must explain model decisions and avoid black-box inference.',
    componentStrengths: {
      'planning-llm': 'Explicit chain-of-thought reasoning',
      'response-generation': 'Reasoning trace inclusion',
      'task-decomposition': 'Explainable subtask breakdown',
    },
  },

  'vendor-lock-in-avoidance': {
    id: 'vendor-lock-in-avoidance',
    label: 'Vendor Lock-in Avoidance',
    description: 'System must use open standards and avoid single-vendor dependency.',
    componentStrengths: {
      'planning-llm': 'Multi-model provider abstraction',
      'tool-data-access': 'Standard API protocols',
      'input-api': 'Portable request formats',
    },
  },

  'inference-safety-gates': {
    id: 'inference-safety-gates',
    label: 'Inference Safety Gates',
    description: 'System must validate outputs against safety policies before delivery.',
    componentStrengths: {
      'response-generation': 'Output safety classification',
      'personalization-policy': 'Policy-based response filtering',
      'orchestrator': 'Human-in-loop approval workflows',
    },
  },

  'federated-learning': {
    id: 'federated-learning',
    label: 'Federated Learning',
    description: 'System learns from user data without centralizing it.',
    componentStrengths: {
      'personalization-policy': 'Edge-side preference learning',
      'session-context': 'Local-only storage without cloud sync',
      'tool-data-access': 'Privacy-preserving aggregation',
    },
  },

  'inference-attestation': {
    id: 'inference-attestation',
    label: 'Inference Attestation',
    description: 'System must provide cryptographic proof of which model produced each output.',
    componentStrengths: {
      'planning-llm': 'Model signature and version tracking',
      'tool-execution': 'Cryptographic attestation on execution',
      'response-generation': 'Signature-validated response output',
    },
  },

  // ===== GROUP 5: User Interaction patterns (~10) =====

  'conversational-multi-turn': {
    id: 'conversational-multi-turn',
    label: 'Conversational Multi-Turn',
    description: 'System maintains conversational state across multiple user turns with context preservation.',
    componentStrengths: {
      'session-context': 'Long-term conversation history with compression',
      'personalization-policy': 'Turn-level preference adaptation',
      'orchestrator': 'Stateful conversation flow management',
    },
  },

  'single-shot-inference': {
    id: 'single-shot-inference',
    label: 'Single Shot Inference',
    description: 'User provides complete request and system returns complete response without interaction.',
    componentStrengths: {
      'input-api': 'Single request parsing',
      'planning-llm': 'Self-contained reasoning without context',
      'response-generation': 'Complete output generation',
    },
  },

  'progressive-refinement': {
    id: 'progressive-refinement',
    label: 'Progressive Refinement',
    description: 'User iteratively refines requests, with system building upon previous outputs.',
    componentStrengths: {
      'session-context': 'Incremental state updates',
      'personalization-policy': 'Refinement intent tracking',
      'response-generation': 'Delta-based output updates',
    },
  },

  'guided-decision-tree': {
    id: 'guided-decision-tree',
    label: 'Guided Decision Tree',
    description: 'System actively guides user through structured decision path with fallback suggestions.',
    componentStrengths: {
      'orchestrator': 'Explicit branching on user choice',
      'response-generation': 'Next-step suggestion generation',
      'personalization-policy': 'User state tracking through tree',
    },
  },

  'voice-primary-interaction': {
    id: 'voice-primary-interaction',
    label: 'Voice Primary Interaction',
    description: 'System receives primarily voice input and produces voice output.',
    componentStrengths: {
      'input-api': 'Audio streaming and transcription',
      'output-delivery': 'Text-to-speech synthesis with low latency',
      'response-generation': 'Natural language adaptation for speech',
    },
  },

  'asynchronous-notification': {
    id: 'asynchronous-notification',
    label: 'Asynchronous Notification',
    description: 'System completes work asynchronously and notifies user of completion.',
    componentStrengths: {
      'orchestrator': 'Background task scheduling and monitoring',
      'output-delivery': 'Push notification delivery',
      'tool-execution': 'Async job tracking and retry',
    },
  },

  'collaborative-multi-user': {
    id: 'collaborative-multi-user',
    label: 'Collaborative Multi-User',
    description: 'Multiple users interact with shared state, requiring coordination and conflict resolution.',
    componentStrengths: {
      'session-context': 'Concurrent edit coordination',
      'orchestrator': 'Distributed state consensus',
      'output-delivery': 'Broadcast of state changes',
    },
  },

  'embedded-product-ui': {
    id: 'embedded-product-ui',
    label: 'Embedded Product UI',
    description: 'System integrates as component within larger product interface.',
    componentStrengths: {
      'input-api': 'Lightweight embedding-friendly API',
      'output-delivery': 'Rendering-agnostic structured output',
      'personalization-policy': 'Product context awareness',
    },
  },

  'hands-free-voice-only': {
    id: 'hands-free-voice-only',
    label: 'Hands-free Voice Only',
    description: 'User operates system through voice commands only without visual interface.',
    componentStrengths: {
      'input-api': 'Continuous audio processing',
      'planning-llm': 'Sparse context from audio signals',
      'response-generation': 'Concise spoken output',
    },
  },

  'accessibility-first': {
    id: 'accessibility-first',
    label: 'Accessibility First',
    description: 'System prioritizes accessible interface for users with disabilities.',
    componentStrengths: {
      'output-delivery': 'Screen reader compatible output',
      'response-generation': 'Semantic markup in responses',
      'input-api': 'Multiple input modality support',
    },
  },

  // ===== GROUP 6: Task Complexity patterns (~10) =====

  'single-tool-call': {
    id: 'single-tool-call',
    label: 'Single Tool Call',
    description: 'Task requires invocation of exactly one external tool without chaining.',
    componentStrengths: {
      'tool-data-access': 'Simple tool discovery and invocation',
      'task-decomposition': 'No decomposition needed',
      'response-generation': 'Direct output from tool result',
    },
  },

  'tool-chain-linear': {
    id: 'tool-chain-linear',
    label: 'Tool Chain Linear',
    description: 'Task requires sequential tool invocation where output of one feeds next input.',
    componentStrengths: {
      'task-decomposition': 'Linear ordered decomposition',
      'tool-execution': 'Stateful tool result passing',
      'orchestrator': 'Sequential execution coordination',
    },
  },

  'tool-fan-out-parallel': {
    id: 'tool-fan-out-parallel',
    label: 'Tool Fan-out Parallel',
    description: 'Task requires parallel invocation of many tools with aggregation.',
    componentStrengths: {
      'tool-execution': 'Concurrent tool invocation',
      'orchestrator': 'Scatter-gather execution pattern',
      'response-generation': 'Result aggregation and synthesis',
    },
  },

  'recursive-nested-decomposition': {
    id: 'recursive-nested-decomposition',
    label: 'Recursive Nested Decomposition',
    description: 'Task decomposes into subtasks that themselves require decomposition.',
    componentStrengths: {
      'task-decomposition': 'Recursive breakdown with depth limits',
      'planning-llm': 'Hierarchical planning',
      'orchestrator': 'Tree-structured execution',
    },
  },

  'ambiguous-intent-clarification': {
    id: 'ambiguous-intent-clarification',
    label: 'Ambiguous Intent Clarification',
    description: 'Task intent is unclear, requiring disambiguation through interaction.',
    componentStrengths: {
      'planning-llm': 'Intent confidence scoring',
      'orchestrator': 'Interactive clarification branching',
      'response-generation': 'Question generation for disambiguation',
    },
  },

  'domain-expert-reasoning': {
    id: 'domain-expert-reasoning',
    label: 'Domain Expert Reasoning',
    description: 'Task requires deep domain knowledge and specialized reasoning beyond generic LLM capability.',
    componentStrengths: {
      'planning-llm': 'Domain-tuned reasoning models',
      'retrieval-rag': 'Domain knowledge base integration',
      'tool-data-access': 'Domain-specific tool ecosystem',
    },
  },

  'multi-objective-tradeoff': {
    id: 'multi-objective-tradeoff',
    label: 'Multi-Objective Tradeoff',
    description: 'Task involves conflicting objectives requiring explicit tradeoff reasoning.',
    componentStrengths: {
      'planning-llm': 'Multi-objective optimization reasoning',
      'response-generation': 'Tradeoff explanation and scoring',
      'personalization-policy': 'User preference weighting',
    },
  },

  'constraint-satisfaction': {
    id: 'constraint-satisfaction',
    label: 'Constraint Satisfaction',
    description: 'Task requires finding solutions that satisfy hard and soft constraints.',
    componentStrengths: {
      'planning-llm': 'Constraint-aware reasoning',
      'task-decomposition': 'Constraint propagation in decomposition',
      'response-generation': 'Constraint violation reporting',
    },
  },

  'exploratory-search': {
    id: 'exploratory-search',
    label: 'Exploratory Search',
    description: 'User explores problem space without clear endpoint, requiring discovery and suggestion.',
    componentStrengths: {
      'retrieval-rag': 'Serendipitous discovery of related items',
      'response-generation': 'Open-ended suggestion generation',
      'personalization-policy': 'Exploration path tracking',
    },
  },

  'adversarial-robustness': {
    id: 'adversarial-robustness',
    label: 'Adversarial Robustness',
    description: 'Task involves responding to adversarial or jailbreak attempts without failure.',
    componentStrengths: {
      'response-generation': 'Adversarial output filtering',
      'personalization-policy': 'User intent verification',
      'planning-llm': 'Prompt injection detection',
    },
  },

  // ===== GROUP 7: Integration & Connectivity patterns (~10) =====

  'api-gateway-facade': {
    id: 'api-gateway-facade',
    label: 'API Gateway Facade',
    description: 'System sits behind an API gateway that handles authentication, rate limiting, and routing.',
    componentStrengths: {
      'input-api': 'Gateway integration and request transformation',
      'tool-data-access': 'Backend service discovery',
      'session-context': 'Rate limit tracking and enforcement',
    },
  },

  'event-streaming-integration': {
    id: 'event-streaming-integration',
    label: 'Event Streaming Integration',
    description: 'System consumes and produces events in streaming platform for asynchronous integration.',
    componentStrengths: {
      'input-api': 'Event stream consumption',
      'orchestrator': 'Event-driven task triggering',
      'output-delivery': 'Event publication of results',
    },
  },

  'webhook-callback-model': {
    id: 'webhook-callback-model',
    label: 'Webhook Callback Model',
    description: 'System accepts requests and callbacks results via webhook to client URL.',
    componentStrengths: {
      'input-api': 'Webhook URL capture',
      'tool-execution': 'Async result callback invocation',
      'orchestrator': 'Deferred delivery coordination',
    },
  },

  'graphql-api-primary': {
    id: 'graphql-api-primary',
    label: 'GraphQL API Primary',
    description: 'System primary interface is GraphQL for flexible data querying.',
    componentStrengths: {
      'input-api': 'GraphQL query parsing and execution',
      'tool-data-access': 'GraphQL resolver to tool mapping',
      'response-generation': 'Query-projected output generation',
    },
  },

  'sql-database-backend': {
    id: 'sql-database-backend',
    label: 'SQL Database Backend',
    description: 'System uses SQL database as primary persistent storage.',
    componentStrengths: {
      'session-context': 'SQL transaction management',
      'tool-data-access': 'SQL query generation and execution',
      'retrieval-rag': 'SQL-based full-text search',
    },
  },

  'document-store-nosql': {
    id: 'document-store-nosql',
    label: 'Document Store NoSQL',
    description: 'System uses document-oriented NoSQL database for flexible schema storage.',
    componentStrengths: {
      'session-context': 'Schema-flexible document storage',
      'tool-data-access': 'Document query and aggregation',
      'personalization-policy': 'User profile document storage',
    },
  },

  'cache-invalidation-async': {
    id: 'cache-invalidation-async',
    label: 'Cache Invalidation Async',
    description: 'System uses asynchronous cache invalidation rather than synchronous updates.',
    componentStrengths: {
      'session-context': 'TTL-based eventual consistency',
      'orchestrator': 'Eventual consistency coordination',
      'retrieval-rag': 'Stale-acceptable retrieval',
    },
  },

  'protocol-agnostic': {
    id: 'protocol-agnostic',
    label: 'Protocol Agnostic',
    description: 'System supports multiple transport protocols transparently.',
    componentStrengths: {
      'input-api': 'Multi-protocol request handling',
      'output-delivery': 'Protocol-adapted response delivery',
      'tool-data-access': 'Protocol conversion for tool calls',
    },
  },

  'third-party-saas-heavy': {
    id: 'third-party-saas-heavy',
    label: 'Third Party SaaS Heavy',
    description: 'System heavily depends on third-party SaaS APIs for core functionality.',
    componentStrengths: {
      'tool-data-access': 'Third-party API credential management',
      'tool-execution': 'Distributed SaaS tool invocation',
      'session-context': 'Rate limit coordination across APIs',
    },
  },

  'backwards-compatibility-required': {
    id: 'backwards-compatibility-required',
    label: 'Backwards Compatibility Required',
    description: 'System must maintain compatibility with older API versions during evolution.',
    componentStrengths: {
      'input-api': 'Version-agnostic request parsing',
      'response-generation': 'Version-specific response formatting',
      'tool-data-access': 'Legacy tool endpoint support',
    },
  },

  // ===== GROUP 8: Memory & State patterns (~10) =====

  'stateless-immutable': {
    id: 'stateless-immutable',
    label: 'Stateless Immutable',
    description: 'System maintains no state between requests, each request fully self-contained.',
    componentStrengths: {
      'session-context': 'No persistent storage needed',
      'orchestrator': 'Lightweight invocation overhead',
      'response-generation': 'Deterministic response from input alone',
    },
  },

  'request-scoped-state': {
    id: 'request-scoped-state',
    label: 'Request-scoped State',
    description: 'System maintains state only within single request lifetime.',
    componentStrengths: {
      'session-context': 'Temporary in-memory storage',
      'orchestrator': 'Single-request execution tree',
      'task-decomposition': 'Request-local variable passing',
    },
  },

  'session-persistent-memory': {
    id: 'session-persistent-memory',
    label: 'Session Persistent Memory',
    description: 'System maintains state for duration of user session.',
    componentStrengths: {
      'session-context': 'Session-key indexed storage with TTL',
      'personalization-policy': 'Session preference retention',
      'orchestrator': 'Session-scoped execution context',
    },
  },

  'long-term-learning': {
    id: 'long-term-learning',
    label: 'Long Term Learning',
    description: 'System learns and adapts from user behavior over weeks and months.',
    componentStrengths: {
      'personalization-policy': 'Long-term preference evolution',
      'session-context': 'Historical user behavior analysis',
      'planning-llm': 'Historical pattern recognition',
    },
  },

  'memory-conflict-resolution': {
    id: 'memory-conflict-resolution',
    label: 'Memory Conflict Resolution',
    description: 'System must resolve conflicting information in long-term memory.',
    componentStrengths: {
      'personalization-policy': 'Conflict detection and resolution',
      'session-context': 'Versioned memory with recency weighting',
      'planning-llm': 'Reconciliation reasoning',
    },
  },

  'sparse-fact-extraction': {
    id: 'sparse-fact-extraction',
    label: 'Sparse Fact Extraction',
    description: 'System extracts key facts from unstructured input for storage.',
    componentStrengths: {
      'task-decomposition': 'Explicit fact extraction subtask',
      'response-generation': 'Fact summarization and structuring',
      'session-context': 'Structured fact storage schema',
    },
  },

  'memory-privacy-isolation': {
    id: 'memory-privacy-isolation',
    label: 'Memory Privacy Isolation',
    description: 'System maintains separate memory spaces for each user without leakage.',
    componentStrengths: {
      'session-context': 'User-isolated storage partitions',
      'personalization-policy': 'Strict user memory boundary enforcement',
      'tool-data-access': 'Scoped credential isolation',
    },
  },

  'working-memory-limited': {
    id: 'working-memory-limited',
    label: 'Working Memory Limited',
    description: 'System works with bounded working memory, dropping least-recent information.',
    componentStrengths: {
      'session-context': 'LRU eviction and sliding windows',
      'personalization-policy': 'Selective memory retention',
      'orchestrator': 'Limited execution stack depth',
    },
  },

  'memory-external-reference': {
    id: 'memory-external-reference',
    label: 'Memory External Reference',
    description: 'System maintains references to external memory rather than internal copies.',
    componentStrengths: {
      'session-context': 'Pointer-based memory architecture',
      'retrieval-rag': 'External knowledge base referencing',
      'response-generation': 'Reference-based output assembly',
    },
  },

  'memory-cache-federation': {
    id: 'memory-cache-federation',
    label: 'Memory Cache Federation',
    description: 'System federates memory across multiple cache layers with different properties.',
    componentStrengths: {
      'session-context': 'Multi-layer cache hierarchy',
      'input-api': 'Cache miss handling and fallback',
      'orchestrator': 'Cache coherency coordination',
    },
  },

  // ===== GROUP 9: Output & Delivery patterns (~10) =====

  'streaming-incremental': {
    id: 'streaming-incremental',
    label: 'Streaming Incremental',
    description: 'System streams output incrementally as it becomes available.',
    componentStrengths: {
      'response-generation': 'Token-by-token streaming',
      'output-delivery': 'SSE or WebSocket streaming',
      'orchestrator': 'Async result forwarding',
    },
  },

  'batch-complete-response': {
    id: 'batch-complete-response',
    label: 'Batch Complete Response',
    description: 'System accumulates results and returns complete response in single batch.',
    componentStrengths: {
      'response-generation': 'Complete result accumulation',
      'output-delivery': 'Single payload delivery',
      'orchestrator': 'Barrier-based completion',
    },
  },

  'structured-json-output': {
    id: 'structured-json-output',
    label: 'Structured JSON Output',
    description: 'System produces output as structured JSON with schema validation.',
    componentStrengths: {
      'response-generation': 'JSON schema-aware generation',
      'tool-data-access': 'Schema validation',
      'orchestrator': 'Type-safe result passing',
    },
  },

  'markdown-narrative-output': {
    id: 'markdown-narrative-output',
    label: 'Markdown Narrative Output',
    description: 'System produces output as formatted markdown text suitable for reading.',
    componentStrengths: {
      'response-generation': 'Markdown formatting and structure',
      'output-delivery': 'Renderer-agnostic markdown',
      'personalization-policy': 'Narrative style adaptation',
    },
  },

  'contextual-hyperlinks': {
    id: 'contextual-hyperlinks',
    label: 'Contextual Hyperlinks',
    description: 'System embeds relevant hyperlinks in output pointing to related resources.',
    componentStrengths: {
      'response-generation': 'Link generation and ranking',
      'retrieval-rag': 'Related resource discovery',
      'tool-data-access': 'URL resolution and validation',
    },
  },

  'citation-provenance': {
    id: 'citation-provenance',
    label: 'Citation Provenance',
    description: 'System tracks and cites source documents for every claim in output.',
    componentStrengths: {
      'retrieval-rag': 'Source document tracking',
      'response-generation': 'Citation annotation in output',
      'session-context': 'Source attribution logging',
    },
  },

  'visual-diagram-generation': {
    id: 'visual-diagram-generation',
    label: 'Visual Diagram Generation',
    description: 'System generates visual diagrams, charts, or SVG as part of output.',
    componentStrengths: {
      'response-generation': 'Diagram code generation',
      'tool-execution': 'Diagram rendering and image generation',
      'output-delivery': 'Image payload handling',
    },
  },

  'personalized-layout': {
    id: 'personalized-layout',
    label: 'Personalized Layout',
    description: 'System adapts output layout and presentation based on user preferences.',
    componentStrengths: {
      'personalization-policy': 'Layout preference storage',
      'response-generation': 'User-customized formatting',
      'output-delivery': 'Layout-specific rendering',
    },
  },

  'multi-modality-output': {
    id: 'multi-modality-output',
    label: 'Multi-modality Output',
    description: 'System produces output across multiple modalities: text, audio, visual, video.',
    componentStrengths: {
      'response-generation': 'Multi-format synthesis',
      'tool-execution': 'Modality-specific processors',
      'output-delivery': 'Multi-format payload delivery',
    },
  },

  'accessibility-compliant-output': {
    id: 'accessibility-compliant-output',
    label: 'Accessibility Compliant Output',
    description: 'System ensures output meets WCAG accessibility standards.',
    componentStrengths: {
      'response-generation': 'Alt text and semantic markup',
      'output-delivery': 'Screen reader compatible formatting',
      'personalization-policy': 'User accessibility preference application',
    },
  },

  // ===== GROUP 10: Reliability & Operations patterns (~10) =====

  'crash-recovery-required': {
    id: 'crash-recovery-required',
    label: 'Crash Recovery Required',
    description: 'System must recover automatically from failures and resume work without user intervention.',
    componentStrengths: {
      'tool-execution': 'Durable retry and recovery semantics',
      'session-context': 'Persistent checkpoint storage',
      'orchestrator': 'Resumable execution from checkpoints',
    },
  },

  'idempotent-operations': {
    id: 'idempotent-operations',
    label: 'Idempotent Operations',
    description: 'System operations are idempotent, allowing safe replay without side effects.',
    componentStrengths: {
      'tool-execution': 'Idempotency key tracking',
      'orchestrator': 'Replay-safe operation ordering',
      'session-context': 'Deduplication of execution results',
    },
  },

  'canary-deployment': {
    id: 'canary-deployment',
    label: 'Canary Deployment',
    description: 'System deploys changes to small percentage of traffic before full rollout.',
    componentStrengths: {
      'input-api': 'Request routing by version',
      'planning-llm': 'Model version A/B testing',
      'orchestrator': 'Feature flag-based execution branching',
    },
  },

  'observability-telemetry': {
    id: 'observability-telemetry',
    label: 'Observability Telemetry',
    description: 'System emits comprehensive metrics, logs, and traces for monitoring.',
    componentStrengths: {
      'orchestrator': 'Execution trace emission',
      'tool-execution': 'Tool invocation telemetry',
      'response-generation': 'Output quality metrics',
    },
  },

  'degradation-graceful': {
    id: 'degradation-graceful',
    label: 'Degradation Graceful',
    description: 'System degrades functionality gracefully when dependencies fail.',
    componentStrengths: {
      'tool-data-access': 'Fallback tool routing',
      'orchestrator': 'Optional task execution',
      'response-generation': 'Partial result assembly',
    },
  },

  'circuit-breaker-pattern': {
    id: 'circuit-breaker-pattern',
    label: 'Circuit Breaker Pattern',
    description: 'System implements circuit breakers to prevent cascading failures.',
    componentStrengths: {
      'tool-execution': 'Circuit breaker state management',
      'tool-data-access': 'Failure-triggered fallback',
      'input-api': 'Request rejection on open circuit',
    },
  },

  'horizontal-scaling': {
    id: 'horizontal-scaling',
    label: 'Horizontal Scaling',
    description: 'System scales by adding more identical instances without vertical scaling.',
    componentStrengths: {
      'orchestrator': 'Load balancing across instances',
      'session-context': 'Distributed session state',
      'input-api': 'Stateless request routing',
    },
  },

  'version-migration-path': {
    id: 'version-migration-path',
    label: 'Version Migration Path',
    description: 'System provides defined path for migrating from old to new versions.',
    componentStrengths: {
      'input-api': 'Version compatibility bridge',
      'session-context': 'Data migration on access',
      'tool-data-access': 'Legacy and new API coexistence',
    },
  },

  'slo-driven-operations': {
    id: 'slo-driven-operations',
    label: 'SLO Driven Operations',
    description: 'System operations are driven by defined Service Level Objectives.',
    componentStrengths: {
      'orchestrator': 'SLO-aware scheduling',
      'input-api': 'SLO-based load shedding',
      'response-generation': 'SLO-respecting output quality',
    },
  },

  'chaos-engineering': {
    id: 'chaos-engineering',
    label: 'Chaos Engineering',
    description: 'System is validated through intentional failure injection and recovery testing.',
    componentStrengths: {
      'orchestrator': 'Fault injection and recovery',
      'tool-execution': 'Failure mode simulation',
      'session-context': 'State consistency under failures',
    },
  },
}
