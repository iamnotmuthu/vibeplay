// ─── Component Technology Data ─────────────────────────────────────────────
// Maps each agent tile to the actual technology components selected per category.
// Sourced from the "AI Agent components Categories and mapping" spreadsheet.

export interface TechComponent {
  name: string
  role?: string // brief qualifier like "routing", "fallback", "on-prem"
}

export interface CategoryTechMapping {
  categoryId: string
  categoryLabel: string
  technologies: TechComponent[]
  note?: string // short explanation like "Light — SOP/KB only"
}

export interface TileTechStack {
  categories: CategoryTechMapping[]
  pipelineLabel: string
  architectureNote: string // 1-line summary of how this stack fits together
}

// ─── Category IDs aligned with COMPONENT_CATEGORIES in agentTypes.ts ───────

const CATEGORY_IDS = {
  input: 'input-api',
  session: 'session-context',
  orchestrator: 'orchestrator',
  planning: 'planning-llm',
  taskDecomp: 'task-decomposition',
  toolAccess: 'tool-data-access',
  retrieval: 'retrieval-rag',
  toolExec: 'tool-execution',
  responseGen: 'response-gen',
  personalization: 'personalization-policy',
  output: 'output-delivery',
} as const

// ─── Helper ────────────────────────────────────────────────────────────────

function cat(
  categoryId: string,
  categoryLabel: string,
  technologies: (string | TechComponent)[],
  note?: string
): CategoryTechMapping {
  return {
    categoryId,
    categoryLabel,
    technologies: technologies.map((t) =>
      typeof t === 'string' ? { name: t } : t
    ),
    note,
  }
}

function tech(name: string, role?: string): TechComponent {
  return { name, role }
}

// ═══════════════════════════════════════════════════════════════════════════
// A. FAQ / Knowledge Agent (faq-knowledge)
// ═══════════════════════════════════════════════════════════════════════════

const FAQ_TECH: TileTechStack = {
  pipelineLabel: 'Single-Lane RAG Pipeline',
  architectureNote: 'Minimal stack — hosted LLM + vector search + streaming chat. No orchestration overhead.',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      'FastAPI', 'Next.js', tech('AWS API Gateway', 'optional'),
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      tech('Redis', 'short-lived chat state'),
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      tech('OpenAI Agents SDK', 'or custom loop'),
    ], 'Minimal — no multi-agent routing needed'),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      'OpenAI API', 'Claude API', 'Gemini API',
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      tech('Prompt-based', 'no workflow engine'),
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      tech('App/DB Connectors', 'basic'),
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      'pgvector', 'Redis', 'MongoDB Atlas Vector', tech('Azure AI Search', 'if docs involved'),
    ]),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      'Synchronous Function Calls',
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Same Model as Planner', 'single model'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      'OpenAI Guardrails',
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'Next.js', 'Vercel AI SDK', tech('Streaming Chat', 'SSE/WebSocket'),
    ]),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// B. Document Intelligence / Enterprise RAG (doc-intelligence)
// ═══════════════════════════════════════════════════════════════════════════

const DOC_INTEL_TECH: TileTechStack = {
  pipelineLabel: 'Dual-Lane: Retrieval + Reasoning',
  architectureNote: 'Enterprise ingress with multi-model routing, hybrid search, and separate writer model for citations.',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      'Azure APIM', 'Kong', 'Apigee',
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      'Redis', tech('Postgres', 'user context'), tech('MongoDB', 'conversation context'),
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      'LangGraph', 'Foundry Agent Service',
    ]),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      'OpenAI', 'Claude', 'Gemini', tech('Portkey', 'routing'), tech('LiteLLM', 'cost control'),
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      'Graph/State Machine',
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      'MCP', 'SharePoint', 'Fabric', 'Logic Apps',
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      'Azure AI Search', 'Pinecone', 'Weaviate', 'OpenSearch', 'Elasticsearch', tech('Cohere Rerank', 'reranker'),
    ]),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      tech('Tool Runner', 'search/retrieval/citations'),
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Dedicated Writer Model', 'separate from planner'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      'OpenAI Guardrails', 'NeMo Guardrails', tech('LaunchDarkly', 'role targeting'),
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'Web Chat', 'Teams Portal', 'API Stream',
    ]),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// C. SaaS Copilot (saas-copilot)
// ═══════════════════════════════════════════════════════════════════════════

const SAAS_COPILOT_TECH: TileTechStack = {
  pipelineLabel: 'Tool-First Pipeline with Confirmation Layer',
  architectureNote: 'Product API connectors with sandboxed execution, customer-tier segmentation, and embedded widget delivery.',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      'Kong', 'Cloudflare', 'AWS API Gateway',
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      'Redis', tech('App DB', 'profile store'),
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      'OpenAI Agents SDK', 'LangGraph',
    ]),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      tech('Frontier Model', 'hosted'), tech('LiteLLM', 'routing'), tech('Portkey', 'fallbacks'),
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      tech('Handoffs', 'graph nodes per capability'),
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      'MCP', tech('REST/GraphQL', 'product APIs'),
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      'pgvector', 'Redis',
    ], 'Light — help center / product docs only'),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      'Sandboxed Actions', 'Audited Service Calls',
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Separate Synthesis Model', 'customer-facing'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      tech('LaunchDarkly', 'tier/plan segmentation'), 'OpenAI Guardrails',
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'Embedded Widget', 'Product Chat Panel',
    ]),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// D. Research & Compare (research-comparison)
// ═══════════════════════════════════════════════════════════════════════════

const RESEARCH_TECH: TileTechStack = {
  pipelineLabel: 'Multi-Agent Research Pipeline',
  architectureNote: 'Iterative search-retrieve-synthesize loops with strong reasoning model, dedicated citation pass, and report export.',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      'FastAPI', 'Next.js', tech('APIM', 'enterprise'),
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      'Redis', tech('Durable Store', 'long research threads'),
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      'LangGraph', 'OpenAI Agents SDK', tech('Temporal', 'long-running'),
    ]),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      tech('Strong Reasoning Model', 'primary'), tech('Portkey', 'multi-model routing'),
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      tech('Planner → Search → Retrieve → Synthesize', 'explicit graph'),
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      'MCP', 'Web/Search Connectors', 'Databases', 'File Stores',
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      'Weaviate', 'Pinecone', 'OpenSearch', 'Azure AI Search', tech('Reranker', 'Cohere'),
    ]),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      'Search', 'Fetch', 'Code Exec', 'Summarization',
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Dedicated Writer', 'citation pass'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      'NeMo Guardrails', tech('Citation Guardrails', 'RAG grounding'),
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'Streaming Report UI', tech('Export', 'docs/slides/app'),
    ]),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// E. Ops Agent (ops-agent)
// ═══════════════════════════════════════════════════════════════════════════

const OPS_TECH: TileTechStack = {
  pipelineLabel: 'Async Orchestrator with Progress Bus',
  architectureNote: 'Durable workflow execution with Temporal, approval gates, and multi-channel delivery for ops dashboards.',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      'Enterprise API Gateway', 'APIM',
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      tech('Redis', 'hot state'), tech('Postgres', 'durable business state'),
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      tech('Temporal', 'first choice'), tech('Dagster', 'data/ML'), tech('Foundry', 'Azure enterprise'),
    ]),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      tech('Frontier Model', 'planning'), tech('Smaller Model', 'status updates'),
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      'Durable Workflow', 'State Machine',
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      'MCP', 'CRM/ERP Connectors', 'Ticketing', 'Logic Apps',
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      tech('Light RAG', 'SOP/KB only'),
    ], 'Minimal — unless SOP docs or KB are needed'),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      'Temporal Activities', 'Workers', 'Serverless Jobs',
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Low-Cost Synthesis Model', 'status/summaries'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      'Approval Gates', 'Policy Engine', 'PII Guardrails',
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'Ops Dashboard', 'Notifications', 'Ticket Comments', 'Email/Chat',
    ]),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// F. Coding Agent (coding-agent)
// ═══════════════════════════════════════════════════════════════════════════

const CODING_TECH: TileTechStack = {
  pipelineLabel: 'Code-Aware Pipeline with Sandbox Layer',
  architectureNote: 'Repo-aware planning with codebase indexing, sandboxed execution, and multi-surface delivery (IDE, PR, CLI).',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      'IDE Plugin', 'Web App', 'CLI Gateway',
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      tech('Local Session Store', 'per-project'), tech('Cloud Memory', 'team/shared'),
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      'LangGraph', 'OpenAI Agents SDK',
    ]),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      'Claude', 'OpenAI', 'Gemini', tech('vLLM', 'self-hosted'), tech('SGLang', 'self-hosted'), tech('Ollama', 'local'),
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      'Repo-Aware Planner', 'File-Level Task Graph',
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      'MCP', 'Git Connectors', 'Terminal', 'Code-Exec',
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      tech('Weaviate', 'codebase index'), tech('Pinecone', 'codebase index'), 'pgvector', 'OpenSearch',
    ]),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      'Sandboxed Code Exec', 'Test Runner', 'Bash/Editor Tools',
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Code-Patch Pass', 'final answer + diff'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      'Tool Permissioning', tech('Command Safety', 'MCP spec warns tools are arbitrary code exec'),
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'IDE Inline', 'PR Comments', 'Web Chat', 'CLI',
    ]),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// G. Decision Workflow / Regulated (decision-workflow)
// ═══════════════════════════════════════════════════════════════════════════

const DECISION_TECH: TileTechStack = {
  pipelineLabel: 'Multi-Agent Coordinator with Human Routing',
  architectureNote: 'Enterprise-grade with RBAC, deterministic approval flows, auditable execution, and multi-layer guardrails.',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      tech('Azure APIM', 'policy enforcement'), 'Kong',
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      tech('Redis', 'with retention controls'), 'Postgres', 'MongoDB',
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      'Foundry', 'LangGraph', 'Temporal',
    ]),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      tech('Enterprise Model', 'hosted with controls'), tech('vLLM', 'data residency'), tech('TGI', 'self-hosted'), 'SGLang',
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      tech('Deterministic Approval Flow', 'approval-oriented'),
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      'MCP', tech('RBAC Connectors', 'behind access control'),
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      'Azure AI Search', 'OpenSearch', 'Elasticsearch', tech('Row/Metadata Filtering', 'access scoping'),
    ]),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      tech('Restricted Execution', 'auditable only'),
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Policy-Constrained Model', 'separate and controlled'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      'OpenAI Guardrails', 'NeMo Guardrails', 'Org Policy Engine', tech('LaunchDarkly', 'role/geo segmentation'),
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'Enterprise Portal', tech('Logging & Review', 'audit trail'),
    ]),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// H. On-Prem / Air-Gapped (onprem-assistant)
// ═══════════════════════════════════════════════════════════════════════════

const ONPREM_TECH: TileTechStack = {
  pipelineLabel: 'On-Prem Single-Node with Local RAG',
  architectureNote: 'Fully air-gapped — local model inference, on-prem vector search, no external API calls.',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      'FastAPI', 'Internal Gateway',
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      tech('Redis', 'on-prem'), tech('Postgres', 'on-prem'), tech('MongoDB', 'on-prem'),
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      'LangGraph', tech('Temporal', 'reliability'),
    ]),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      tech('vLLM', 'local serving'), tech('SGLang', 'local serving'), 'TGI', 'Ollama', tech('LiteLLM', 'local gateway'),
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      'Deterministic Graph', tech('Semi-Dynamic', 'optional'),
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      'On-Prem MCP Servers', 'Internal APIs', 'Filesystem',
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      'Weaviate', 'pgvector', 'OpenSearch', 'Elasticsearch', 'Redis',
    ]),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      'Local Workers', 'Sandboxed Runtimes',
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Local Writer Model', 'on-prem served'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      tech('NeMo Guardrails', 'preferred when no external APIs'), 'Custom Policy Engine',
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'Internal Web UI', 'Desktop Client',
    ]),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// I. Multimodal Agent (multimodal-agent)
// ═══════════════════════════════════════════════════════════════════════════

const MULTIMODAL_TECH: TileTechStack = {
  pipelineLabel: 'Multi-Modal Orchestrator with Format Adapters',
  architectureNote: 'Modality-branching planner with OCR/ASR pipelines, multimodal retrieval, and rich streaming UI.',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      'Next.js', 'Mobile App', 'Managed Gateway',
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      'Redis', tech('Media/Job Store', 'metadata'),
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      'LangGraph', 'OpenAI Agents', 'Foundry',
    ]),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      tech('Gemini', 'multimodal'), 'OpenAI', 'Claude', tech('Routed Gateway', 'per-modality'),
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      tech('Modality Branching', 'doc / image / audio / video'),
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      'MCP', 'Media Pipelines', 'OCR/ASR Tools',
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      'Azure AI Search', tech('Multimodal Retrieval', 'text + vector + image'),
    ]),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      'Media Conversion', 'OCR/ASR', 'Code-Exec', 'Search',
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Multimodal Context Model', 'cross-modal output'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      'NeMo Guardrails', tech('Multimodal Safety', 'content checks'),
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'Rich Streaming UI', 'Image/File Previews',
    ]),
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// J. Consumer Chat (consumer-chat)
// ═══════════════════════════════════════════════════════════════════════════

const CONSUMER_TECH: TileTechStack = {
  pipelineLabel: 'Cached-First Pipeline with Edge Deployment',
  architectureNote: 'Latency-optimized with CDN edge, fast/cheap writer model, and LaunchDarkly for A/B and rollout segmentation.',
  categories: [
    cat(CATEGORY_IDS.input, 'Input / API Layer', [
      'Cloud API Gateway', 'CDN Edge', 'Next.js', 'Mobile',
    ]),
    cat(CATEGORY_IDS.session, 'Session / Context Manager', [
      tech('Redis', 'low-latency sessions'), tech('Postgres', 'user/profile data'),
    ]),
    cat(CATEGORY_IDS.orchestrator, 'Orchestrator', [
      'Custom Controller', tech('LangGraph', 'simple branching'),
    ]),
    cat(CATEGORY_IDS.planning, 'Planning LLM', [
      tech('Hosted Model', 'cost-optimized'), tech('LiteLLM', 'routing'), tech('Portkey', 'A/B testing'),
    ]),
    cat(CATEGORY_IDS.taskDecomp, 'Task Decomposition', [
      tech('Lightweight', 'prompt-based'),
    ]),
    cat(CATEGORY_IDS.toolAccess, 'Tool / Data Access', [
      tech('Limited Tools', 'initial'), tech('MCP', 'future expansion'),
    ]),
    cat(CATEGORY_IDS.retrieval, 'Retrieval / RAG', [
      'Redis', 'pgvector', 'Managed Vector DB',
    ]),
    cat(CATEGORY_IDS.toolExec, 'Tool Execution', [
      tech('Synchronous', 'default'), tech('Queue', 'expensive tasks'),
    ]),
    cat(CATEGORY_IDS.responseGen, 'Response Generation', [
      tech('Fast/Cheap Writer', 'with fallback'),
    ]),
    cat(CATEGORY_IDS.personalization, 'Personalization / Policy', [
      tech('LaunchDarkly', 'segmentation/rollouts'), 'Moderation Guardrails',
    ]),
    cat(CATEGORY_IDS.output, 'Output Delivery', [
      'Token Streaming', 'Mobile/Web Notifications', 'Realtime Updates',
    ]),
  ],
}

// ─── Lookup ────────────────────────────────────────────────────────────────

const TILE_TECH_STACKS: Record<string, TileTechStack> = {
  'faq-knowledge': FAQ_TECH,
  'doc-intelligence': DOC_INTEL_TECH,
  'saas-copilot': SAAS_COPILOT_TECH,
  'research-comparison': RESEARCH_TECH,
  'ops-agent': OPS_TECH,
  'coding-agent': CODING_TECH,
  'decision-workflow': DECISION_TECH,
  'onprem-assistant': ONPREM_TECH,
  'multimodal-agent': MULTIMODAL_TECH,
  'consumer-chat': CONSUMER_TECH,
}

export function getTechStack(tileId: string): TileTechStack | null {
  return TILE_TECH_STACKS[tileId] ?? null
}

// ═══════════════════════════════════════════════════════════════════════════
// Evaluation Metrics Data
// ═══════════════════════════════════════════════════════════════════════════

export interface PatternBreakdown {
  overall: number   // 0-100 performance score
  dominant: number
  nonDominant: number
  fuzzy: number
}

export interface EvalMetric {
  name: string
  shortName: string // compact label for the card header
  description: string // what this metric measures
  actual: string // simulated "actual" result value
  target: string // benchmark target value
  unit: string // "%", "ms", "score", etc.
  passed: boolean // did the actual meet/exceed the target?
  breakdown: PatternBreakdown // per-pattern performance scores
}

export interface TileEvalMetrics {
  metric1: EvalMetric
  metric2: EvalMetric
}

// Helper to generate realistic pattern breakdowns from an overall score
function bk(overall: number, dominantDelta = 4, nonDomDelta = 15, fuzzyDelta = 25): PatternBreakdown {
  return {
    overall: Math.round(overall),
    dominant: Math.min(100, Math.round(overall + dominantDelta)),
    nonDominant: Math.max(0, Math.round(overall - nonDomDelta)),
    fuzzy: Math.max(0, Math.round(overall - fuzzyDelta)),
  }
}

const TILE_EVAL_METRICS: Record<string, TileEvalMetrics> = {
  'faq-knowledge': {
    metric1: {
      name: 'Task Completion Rate',
      shortName: 'Success Rate',
      description: 'Percentage of user queries resolved end-to-end without fallback or escalation.',
      actual: '96.4',
      target: '> 95',
      unit: '%',
      passed: true,
      breakdown: bk(96, 3, 7, 14),
    },
    metric2: {
      name: 'Latency (TTFT)',
      shortName: 'Time to First Token',
      description: 'Time from query submission to first streamed token. Measures perceived responsiveness.',
      actual: '142',
      target: '< 200',
      unit: 'ms',
      passed: true,
      breakdown: bk(86, 5, 14, 21),
    },
  },
  'doc-intelligence': {
    metric1: {
      name: 'Groundedness',
      shortName: 'Hallucination Rate',
      description: 'Percentage of claims in responses that are fully grounded in retrieved source documents.',
      actual: '2.1',
      target: '< 5',
      unit: '% hallucination',
      passed: true,
      breakdown: bk(92, 4, 14, 24),
    },
    metric2: {
      name: 'Retrieval Relevance (NDCG@k)',
      shortName: 'Retrieval Quality',
      description: 'Normalized Discounted Cumulative Gain at k. Measures how well retrieved chunks rank by relevance.',
      actual: '0.87',
      target: '> 0.80',
      unit: 'score',
      passed: true,
      breakdown: bk(87, 5, 13, 25),
    },
  },
  'saas-copilot': {
    metric1: {
      name: 'Tool Selection F1 & Param Accuracy',
      shortName: 'Tool Accuracy',
      description: 'F1 score for selecting the correct tool, combined with exact-match accuracy for parameter values.',
      actual: '91.3',
      target: '> 88',
      unit: '% F1',
      passed: true,
      breakdown: bk(91, 5, 12, 23),
    },
    metric2: {
      name: 'Task Completion Rate',
      shortName: 'Task Success',
      description: 'Percentage of multi-step tasks completed successfully across the full tool-calling chain.',
      actual: '89.7',
      target: '> 85',
      unit: '%',
      passed: true,
      breakdown: bk(90, 4, 14, 25),
    },
  },
  'research-comparison': {
    metric1: {
      name: 'Accuracy & Groundedness',
      shortName: 'Factual Accuracy',
      description: 'Proportion of synthesized claims that are factually correct and traceable to source material.',
      actual: '94.1',
      target: '> 90',
      unit: '%',
      passed: true,
      breakdown: bk(94, 4, 12, 23),
    },
    metric2: {
      name: 'Information Extraction Recall',
      shortName: 'Recall@K',
      description: 'Proportion of relevant facts from source documents successfully extracted and included in output.',
      actual: '0.83',
      target: '> 0.78',
      unit: 'score',
      passed: true,
      breakdown: bk(83, 6, 15, 28),
    },
  },
  'ops-agent': {
    metric1: {
      name: 'End-to-End Task Completion',
      shortName: 'E2E Completion',
      description: 'Percentage of multi-step operational workflows completed without human intervention or failure.',
      actual: '87.2',
      target: '> 82',
      unit: '%',
      passed: true,
      breakdown: bk(87, 6, 15, 26),
    },
    metric2: {
      name: 'Trajectory Efficiency Score',
      shortName: 'Path Efficiency',
      description: 'Ratio of optimal steps to actual steps taken. 1.0 means no wasted actions.',
      actual: '0.79',
      target: '> 0.70',
      unit: 'ratio',
      passed: true,
      breakdown: bk(79, 7, 15, 27),
    },
  },
  'coding-agent': {
    metric1: {
      name: 'Code Execution Pass Rate',
      shortName: 'pass@k',
      description: 'Percentage of generated code samples that pass all unit tests on first execution (pass@1).',
      actual: '78.5',
      target: '> 72',
      unit: '% pass@1',
      passed: true,
      breakdown: bk(79, 7, 17, 31),
    },
    metric2: {
      name: 'Step / Iteration Efficiency',
      shortName: 'Iteration Efficiency',
      description: 'Average number of debug-fix cycles needed to reach a passing solution. Lower is better.',
      actual: '1.8',
      target: '< 2.5',
      unit: 'avg cycles',
      passed: true,
      breakdown: bk(82, 7, 15, 28),
    },
  },
  'decision-workflow': {
    metric1: {
      name: 'Safety & Compliance Rate',
      shortName: 'Compliance Rate',
      description: 'Percentage of responses that pass PII leakage checks and regulatory adherence validation.',
      actual: '99.7',
      target: '> 99.5',
      unit: '%',
      passed: true,
      breakdown: bk(99, 1, 3, 8),
    },
    metric2: {
      name: 'False Refusal Rate (FRR)',
      shortName: 'False Refusal',
      description: 'Percentage of legitimate queries incorrectly blocked by safety guardrails. Lower is better.',
      actual: '1.2',
      target: '< 3',
      unit: '%',
      passed: true,
      breakdown: bk(94, 4, 11, 19),
    },
  },
  'onprem-assistant': {
    metric1: {
      name: 'Task Completion Rate',
      shortName: 'Constrained Success',
      description: 'Task completion in constrained on-prem environment with limited model size and no cloud fallback.',
      actual: '84.6',
      target: '> 80',
      unit: '%',
      passed: true,
      breakdown: bk(85, 6, 14, 27),
    },
    metric2: {
      name: 'Resource Efficiency',
      shortName: 'TPS/Watt & VRAM',
      description: 'Tokens per second per watt of power draw, and peak VRAM utilization during inference.',
      actual: '14.2 TPS/W, 78%',
      target: '> 12 TPS/W, < 85%',
      unit: '',
      passed: true,
      breakdown: bk(84, 6, 15, 28),
    },
  },
  'multimodal-agent': {
    metric1: {
      name: 'Multimodal Task Success Rate',
      shortName: 'Multimodal Success',
      description: 'Percentage of tasks involving mixed inputs (image + text, audio + text) completed correctly.',
      actual: '85.3',
      target: '> 80',
      unit: '%',
      passed: true,
      breakdown: bk(85, 7, 15, 27),
    },
    metric2: {
      name: 'Semantic Alignment (CLIP) & Fidelity',
      shortName: 'CLIP / FID Score',
      description: 'CLIP score measures text-image semantic alignment. FID/FVD measures visual output fidelity.',
      actual: '0.82 CLIP, 38.4 FID',
      target: '> 0.78, < 45',
      unit: '',
      passed: true,
      breakdown: bk(82, 6, 15, 28),
    },
  },
  'consumer-chat': {
    metric1: {
      name: 'Latency / Throughput at Scale',
      shortName: 'P95 Latency',
      description: 'P95 end-to-end latency under peak concurrent load. Measures production-grade performance.',
      actual: '186',
      target: '< 250',
      unit: 'ms (P95)',
      passed: true,
      breakdown: bk(84, 7, 16, 29),
    },
    metric2: {
      name: 'User Satisfaction (CSAT)',
      shortName: 'CSAT Score',
      description: 'Composite satisfaction score from thumbs up/down ratio, average session length, and repeat usage.',
      actual: '4.3',
      target: '> 4.0',
      unit: '/ 5.0',
      passed: true,
      breakdown: bk(86, 6, 13, 25),
    },
  },
}

export function getEvalMetrics(tileId: string): TileEvalMetrics | null {
  return TILE_EVAL_METRICS[tileId] ?? null
}

// ─── Measurement Plan: why each metric was chosen per tile ───────────────

const METRIC_WHY: Record<string, { why1: string; why2: string }> = {
  'faq-knowledge': {
    why1: 'End-to-end resolution directly measures user value — an agent that cannot finish requests is not deployable, regardless of response speed.',
    why2: 'FAQ users expect instant answers. Time to first token is a hard reliability boundary — above 200ms, perceived quality drops sharply.',
  },
  'doc-intelligence': {
    why1: 'Ungrounded claims in document extraction cause direct downstream harm. Hallucination rate is the non-negotiable safety gate before any output is trusted.',
    why2: 'Retrieving irrelevant chunks is the leading cause of incorrect answers. NDCG@k measures ranking quality to ensure the best evidence reaches generation.',
  },
  'saas-copilot': {
    why1: 'Calling the wrong tool or using incorrect parameters causes real system mutations. Tool selection accuracy is the primary reliability gate before deployment.',
    why2: 'Multi-step tasks can fail midway. End-to-end completion rate captures full chain reliability — not just individual step accuracy.',
  },
  'research-comparison': {
    why1: 'Research outputs are only valuable if claims are true and traceable. Factual accuracy is the primary gate before any report is considered trustworthy.',
    why2: 'Missing a key fact can distort the entire comparison. Recall@K ensures important evidence from source documents is never silently dropped.',
  },
  'ops-agent': {
    why1: 'Ops workflows that stall mid-task create more problems than they solve. Full completion without human intervention is the primary deployment criterion.',
    why2: 'Wasted steps in infrastructure automation waste real compute and time. Trajectory efficiency ensures the agent takes the minimum actions needed to reach the goal.',
  },
  'coding-agent': {
    why1: 'Code that does not run is not useful. pass@1 directly measures whether generated solutions work the first time — without requiring repeated human review.',
    why2: 'Excessive debug cycles negate the productivity gains of automation. This metric caps the fix loops needed before a solution passes all tests.',
  },
  'decision-workflow': {
    why1: 'Any PII leak or regulatory failure is a blocking defect. Compliance rate is set at 99.5% to enforce near-zero tolerance for safety violations.',
    why2: 'Over-cautious guardrails that block legitimate requests erode user trust. FRR balances safety with usability — the agent must be both safe and helpful.',
  },
  'onprem-assistant': {
    why1: 'On-prem constraints — limited model size, no cloud fallback — mean the success baseline must be validated under real deployment conditions, not lab settings.',
    why2: 'Hardware costs and power draw are fixed on-prem. TPS/Watt ensures the solution is economically viable and stays within thermal and VRAM limits.',
  },
  'multimodal-agent': {
    why1: 'Mixed-input tasks have more failure modes than text-only. Success rate across modality combinations is the primary proof that integration works end-to-end.',
    why2: 'CLIP alignment and FID fidelity together verify that generated or retrieved visual outputs match the intended meaning and quality bar.',
  },
  'consumer-chat': {
    why1: 'Consumer products fail fast on latency. P95 at scale is more demanding than averages — it captures the ceiling that ensures even the slowest 1-in-20 users gets a good experience.',
    why2: 'Latency and accuracy are necessary but not sufficient. CSAT captures holistic satisfaction — the signal that determines retention and word-of-mouth growth.',
  },
}

export function getMetricWhy(tileId: string): { why1: string; why2: string } | null {
  return METRIC_WHY[tileId] ?? null
}
