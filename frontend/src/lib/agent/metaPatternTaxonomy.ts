// ─── Meta-Pattern Taxonomy Engine ──────────────────────────────────────────
// Combines 39 meta-patterns × 13 component categories to derive architecture.
// Source: vibemodel_meta-pattern-taxonomy_v1.md + AI Agent Components Excel
//
// Flow: DimensionPattern[] → triggered meta-patterns → component selections
//       → layer assignment → trust boundaries → ArchitectureDataV3
// ─────────────────────────────────────────────────────────────────────────────

import type { DimensionPattern } from '@/store/agentTypes'

// ─── Types ──────────────────────────────────────────────────────────────

export interface DerivedMetaPattern {
  id: string
  name: string
  family: string
  description: string
  executionPathCount: number
  triggeredComponents: string[]
}

export interface ComposedComponent {
  id: string
  categoryId: string
  categoryName: string
  selectedTechnology: string
  justification: string
  triggeredByPatterns: string[]
  layer: 'ingestion' | 'routing' | 'context' | 'execution' | 'output' | 'ops'
}

export interface CompositionResult {
  metaPatterns: DerivedMetaPattern[]
  architecture: {
    components: ComposedComponent[]
  }
}

// ─── 8 Families ─────────────────────────────────────────────────────────

const FAMILIES = [
  'Data Access', 'Data Shape', 'Query Understanding', 'Task Structure',
  'Response Shape', 'State & Memory', 'Reliability & Recovery', 'Security & Compliance',
] as const

// ─── 39 Meta-Patterns ──────────────────────────────────────────────────

interface MetaPatternDef {
  id: string
  name: string
  family: typeof FAMILIES[number]
  description: string
  triggeredComponents: string[]
  // Trigger conditions: what patterns of DimensionPattern[] trigger this
  triggerFn: (patterns: DimensionPattern[]) => boolean
}

const META_PATTERN_DEFS: MetaPatternDef[] = [
  // ─── Data Access (5) ───
  { id: 'single-source-lookup', name: 'Single Source Lookup', family: 'Data Access',
    description: 'Direct retrieval from a single data source with no joining',
    triggeredComponents: ['data-fetching'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.length === 1) },
  { id: 'multi-source-fetch', name: 'Multi-Source Fetch', family: 'Data Access',
    description: 'Query 2+ independent sources without cross-source key matching',
    triggeredComponents: ['data-fetching', 'orchestration', 'error-handling'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.length >= 2) },
  { id: 'cross-source-join', name: 'Cross-Source Join', family: 'Data Access',
    description: 'Match and merge data on common keys across sources',
    triggeredComponents: ['data-fetching', 'data-normalization', 'aggregation'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.length >= 2 && p.tier === 'complex') },
  { id: 'hierarchical-drill-down', name: 'Hierarchical Drill-Down', family: 'Data Access',
    description: 'Navigate tree/nested structures like JSON hierarchies or folder trees',
    triggeredComponents: ['data-fetching', 'data-normalization'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.some(d => d.includes('gcp') || d.includes('json'))) },
  { id: 'reasoning-chain', name: 'Reasoning Chain', family: 'Data Access',
    description: 'Multi-hop retrieval with intermediate aggregation',
    triggeredComponents: ['orchestration', 'aggregation', 'caching'],
    triggerFn: (ps) => ps.filter(p => p.tier === 'fuzzy').length >= 3 },

  // ─── Data Shape (6) ───
  { id: 'document-data', name: 'Document Data', family: 'Data Shape',
    description: 'Unstructured document parsing (PDFs, DOCX, HTML)',
    triggeredComponents: ['document-parsing', 'data-normalization'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.some(d => d.includes('pdf') || d.includes('staples') || d.includes('archive'))) },
  { id: 'table-data', name: 'Table Data', family: 'Data Shape',
    description: 'Structured tabular formats (CSV, databases, spreadsheets)',
    triggeredComponents: ['data-fetching', 'aggregation'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.some(d => d.includes('csv') || d.includes('aws') || d.includes('sql') || d.includes('po'))) },
  { id: 'image-data', name: 'Image Data', family: 'Data Shape',
    description: 'Image processing including OCR and visual understanding',
    triggeredComponents: ['document-parsing'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.some(d => d.includes('scan') || d.includes('ocr') || d.includes('image'))) },
  { id: 'mixed-format-composition', name: 'Mixed Format Composition', family: 'Data Shape',
    description: 'Multiple formats parsed and composed together',
    triggeredComponents: ['document-parsing', 'data-normalization', 'orchestration'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.length >= 2) },
  { id: 'context-window-overflow', name: 'Context Window Overflow', family: 'Data Shape',
    description: 'Input exceeds LLM context limits requiring chunking',
    triggeredComponents: ['retrieval', 'caching'],
    triggerFn: (ps) => ps.length > 100 },
  { id: 'high-topic-sparsity', name: 'High Topic Sparsity', family: 'Data Shape',
    description: 'Data spread across disconnected topics',
    triggeredComponents: ['retrieval', 'data-normalization'],
    triggerFn: (ps) => { const uniqueData = new Set(ps.flatMap(p => p.dataDimensionIds)); return uniqueData.size >= 4 } },

  // ─── Query Understanding (5) ───
  { id: 'intent-classification', name: 'Intent Classification', family: 'Query Understanding',
    description: 'Classify user query into predefined intents',
    triggeredComponents: ['orchestration', 'confidence-scoring'],
    triggerFn: () => true },
  { id: 'entity-extraction', name: 'Entity Extraction', family: 'Query Understanding',
    description: 'Extract named entities from user queries',
    triggeredComponents: ['data-normalization'],
    triggerFn: () => true },
  { id: 'ambiguity-resolution', name: 'Ambiguity Resolution', family: 'Query Understanding',
    description: 'Resolve multiple query interpretations',
    triggeredComponents: ['confidence-scoring', 'human-loop'],
    triggerFn: (ps) => ps.some(p => p.tier === 'fuzzy') },
  { id: 'context-dependent-interpretation', name: 'Context-Dependent Interpretation', family: 'Query Understanding',
    description: 'Query interpretation depends on prior conversation context',
    triggeredComponents: ['caching', 'retrieval'],
    triggerFn: (ps) => ps.some(p => p.responseDimensionId.includes('conversational') || p.responseDimensionId.includes('Consolidated')) },
  { id: 'multi-modal-input', name: 'Multi-Modal Input', family: 'Query Understanding',
    description: 'User input includes text combined with images/audio/video',
    triggeredComponents: ['document-parsing', 'orchestration'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.some(d => d.includes('image') || d.includes('scan'))) },

  // ─── Task Structure (5) ───
  { id: 'multi-task-single-query', name: 'Multi-Task Single Query', family: 'Task Structure',
    description: 'Single query triggers multiple parallel tasks',
    triggeredComponents: ['orchestration', 'aggregation'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.length >= 3) },
  { id: 'sequential-task-chain', name: 'Sequential Task Chain', family: 'Task Structure',
    description: 'Tasks execute in order — output of N is input to N+1',
    triggeredComponents: ['orchestration', 'caching'],
    triggerFn: (ps) => ps.some(p => p.tier === 'complex') },
  { id: 'parallel-task-fan-out', name: 'Parallel Task Fan-Out', family: 'Task Structure',
    description: 'Single step branches into N parallel subtasks',
    triggeredComponents: ['orchestration', 'error-handling'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.length >= 2 && p.tier !== 'simple') },
  { id: 'conditional-task-branching', name: 'Conditional Task Branching', family: 'Task Structure',
    description: 'Task flow depends on runtime conditions',
    triggeredComponents: ['orchestration', 'confidence-scoring'],
    triggerFn: (ps) => ps.some(p => p.tier === 'fuzzy') },
  { id: 'iterative-refinement-loop', name: 'Iterative Refinement Loop', family: 'Task Structure',
    description: 'Task repeats with refinement until convergence',
    triggeredComponents: ['orchestration', 'caching', 'anomaly-detection'],
    triggerFn: (ps) => ps.filter(p => p.tier === 'fuzzy').length >= 5 },

  // ─── Response Shape (6) ───
  { id: 'structured-data-output', name: 'Structured Data Output', family: 'Response Shape',
    description: 'Response is valid JSON/XML/structured format',
    triggeredComponents: ['output-synthesis'],
    triggerFn: (ps) => ps.some(p => p.responseDimensionId.includes('Breakdown') || p.responseDimensionId.includes('Validation')) },
  { id: 'natural-language-synthesis', name: 'Natural Language Synthesis', family: 'Response Shape',
    description: 'Response is freeform narrative text',
    triggeredComponents: ['output-synthesis'],
    triggerFn: (ps) => ps.some(p => p.responseDimensionId.includes('Report') || p.responseDimensionId.includes('Answer')) },
  { id: 'action-execution', name: 'Action Execution', family: 'Response Shape',
    description: 'Response triggers external actions like API calls or DB writes',
    triggeredComponents: ['orchestration', 'error-handling', 'observation-logging'],
    triggerFn: (ps) => ps.some(p => p.toolDimensionIds.some(t => t.includes('sql'))) },
  { id: 'multi-format-response', name: 'Multi-Format Response', family: 'Response Shape',
    description: 'Response includes multiple formats (text + JSON + charts)',
    triggeredComponents: ['output-synthesis', 'data-normalization'],
    triggerFn: (ps) => ps.some(p => p.responseDimensionId.includes('Consolidated')) },
  { id: 'citation-required', name: 'Citation Required', family: 'Response Shape',
    description: 'Every fact must be traced to its original source',
    triggeredComponents: ['retrieval', 'output-synthesis'],
    triggerFn: (ps) => ps.some(p => p.responseDimensionId.includes('Report') || p.responseDimensionId.includes('Consolidated')) },
  { id: 'code-generation', name: 'Code Generation', family: 'Response Shape',
    description: 'Response is executable code (Python, SQL, etc.)',
    triggeredComponents: ['output-synthesis', 'error-handling'],
    triggerFn: () => false },

  // ─── State & Memory (4) ───
  { id: 'stateless-one-shot', name: 'Stateless One-Shot', family: 'State & Memory',
    description: 'No session state; each query is independent',
    triggeredComponents: [],
    triggerFn: (ps) => ps.some(p => p.tier === 'simple') },
  { id: 'sustained-conversation', name: 'Sustained Conversation', family: 'State & Memory',
    description: 'Multi-turn conversation with turn history',
    triggeredComponents: ['caching'],
    triggerFn: (ps) => ps.some(p => p.responseDimensionId.includes('Consolidated') || p.tier === 'complex') },
  { id: 'long-running-workflow', name: 'Long-Running Workflow', family: 'State & Memory',
    description: 'Task runs for hours/days requiring checkpointing',
    triggeredComponents: ['caching', 'orchestration', 'observation-logging'],
    triggerFn: (ps) => ps.length > 200 },
  { id: 'cross-session-memory', name: 'Cross-Session Memory', family: 'State & Memory',
    description: 'Memory persists across sessions for personalization',
    triggeredComponents: ['caching', 'retrieval'],
    triggerFn: () => false },

  // ─── Reliability & Recovery (4) ───
  { id: 'tool-fallback-chain', name: 'Tool Fallback Chain', family: 'Reliability & Recovery',
    description: 'Tool fails; auto-retry with a different tool',
    triggeredComponents: ['error-handling', 'orchestration'],
    triggerFn: (ps) => ps.some(p => p.toolDimensionIds.length >= 2) },
  { id: 'human-escalation-gate', name: 'Human Escalation Gate', family: 'Reliability & Recovery',
    description: 'Conditions trigger escalation to a human operator',
    triggeredComponents: ['human-loop', 'confidence-scoring'],
    triggerFn: (ps) => ps.some(p => p.tier === 'fuzzy') },
  { id: 'confidence-threshold-routing', name: 'Confidence Threshold Routing', family: 'Reliability & Recovery',
    description: 'Decisions routed based on confidence scores',
    triggeredComponents: ['confidence-scoring', 'orchestration'],
    triggerFn: (ps) => ps.some(p => p.tier === 'fuzzy' || p.tier === 'complex') },
  { id: 'partial-data-handling', name: 'Partial Data Handling', family: 'Reliability & Recovery',
    description: 'Partial failure shows available results with warnings',
    triggeredComponents: ['error-handling', 'output-synthesis'],
    triggerFn: (ps) => ps.some(p => p.dataDimensionIds.some(d => d.includes('archive'))) },

  // ─── Security & Compliance (4) ───
  { id: 'pii-detection-masking', name: 'PII Detection & Masking', family: 'Security & Compliance',
    description: 'Detect and mask personally identifiable information',
    triggeredComponents: ['data-normalization', 'observation-logging'],
    triggerFn: () => false },
  { id: 'role-based-access-control', name: 'Role-Based Access Control', family: 'Security & Compliance',
    description: 'Filter data and actions by user role and permissions',
    triggeredComponents: ['orchestration', 'observation-logging'],
    triggerFn: () => false },
  { id: 'audit-trail-required', name: 'Audit Trail Required', family: 'Security & Compliance',
    description: 'All actions must be logged and auditable',
    triggeredComponents: ['observation-logging'],
    triggerFn: (ps) => ps.length > 50 },
  { id: 'regulatory-boundary', name: 'Regulatory Boundary', family: 'Security & Compliance',
    description: 'Comply with regulations like GDPR, HIPAA, SOC2',
    triggeredComponents: ['observation-logging', 'data-normalization'],
    triggerFn: () => false },
]

// ─── 13 Component Categories ────────────────────────────────────────────

interface ComponentCategoryDef {
  id: string
  name: string
  layer: 'ingestion' | 'routing' | 'context' | 'execution' | 'output' | 'ops'
  technologies: { name: string; capability: number }[] // capability: higher = more capable
}

const COMPONENT_CATEGORIES: ComponentCategoryDef[] = [
  // Ingestion
  { id: 'data-fetching', name: 'Data Fetching', layer: 'ingestion',
    technologies: [
      { name: 'Parallel AsyncIO Connectors', capability: 5 },
      { name: 'REST/GraphQL API Client', capability: 3 },
      { name: 'MCP Native Connector', capability: 4 },
      { name: 'Simple HTTP Client', capability: 1 },
    ] },
  { id: 'document-parsing', name: 'Document Parsing', layer: 'ingestion',
    technologies: [
      { name: 'PDFPlumber + EasyOCR', capability: 5 },
      { name: 'LangChain Document Loaders', capability: 3 },
      { name: 'PyPDF2 + pdfminer', capability: 2 },
      { name: 'Simple Text Extractor', capability: 1 },
    ] },

  // Routing
  { id: 'orchestration', name: 'Orchestration', layer: 'routing',
    technologies: [
      { name: 'LangGraph State Machine', capability: 5 },
      { name: 'OpenAI Agents SDK', capability: 4 },
      { name: 'Parallel Fanout Orchestrator', capability: 3 },
      { name: 'Sequential Pipeline', capability: 2 },
      { name: 'Simple Dispatch', capability: 1 },
    ] },
  { id: 'error-handling', name: 'Error Handling', layer: 'routing',
    technologies: [
      { name: 'Custom Exceptions + Retry + Circuit Breaker', capability: 5 },
      { name: 'Tenacity Retry + Fallback', capability: 3 },
      { name: 'Basic Try-Catch', capability: 1 },
    ] },
  { id: 'confidence-scoring', name: 'Confidence Scoring', layer: 'routing',
    technologies: [
      { name: 'Bayesian Scoring + Threshold Routing', capability: 5 },
      { name: 'Simple Probability Calculator', capability: 2 },
    ] },
  { id: 'human-loop', name: 'Human-in-the-Loop', layer: 'routing',
    technologies: [
      { name: 'Manual Escalation Queue + Approval Workflow', capability: 5 },
      { name: 'Simple Alert + Review UI', capability: 2 },
    ] },

  // Context
  { id: 'retrieval', name: 'Retrieval (RAG)', layer: 'context',
    technologies: [
      { name: 'Hybrid (Vector + Keyword) Search', capability: 5 },
      { name: 'Pinecone Vector DB', capability: 4 },
      { name: 'pgvector + PostgreSQL', capability: 3 },
      { name: 'Simple Keyword Search', capability: 1 },
    ] },
  { id: 'data-normalization', name: 'Data Normalization', layer: 'context',
    technologies: [
      { name: 'Pydantic Models + Custom Mappers', capability: 5 },
      { name: 'JSON Schema Validation', capability: 3 },
      { name: 'Simple Type Coercion', capability: 1 },
    ] },
  { id: 'caching', name: 'Caching & State', layer: 'ops',
    technologies: [
      { name: 'Redis (TTL-aware)', capability: 5 },
      { name: 'PostgreSQL Session Store', capability: 3 },
      { name: 'In-Memory Dict', capability: 1 },
    ] },

  // Execution
  { id: 'aggregation', name: 'Aggregation & Analytics', layer: 'execution',
    technologies: [
      { name: 'Pandas + DuckDB', capability: 5 },
      { name: 'Polars DataFrame', capability: 4 },
      { name: 'Simple Python Aggregation', capability: 1 },
    ] },
  { id: 'anomaly-detection', name: 'Anomaly Detection', layer: 'execution',
    technologies: [
      { name: 'Scikit-learn (z-score + IQR)', capability: 5 },
      { name: 'Simple Threshold Rules', capability: 2 },
    ] },

  // Output
  { id: 'output-synthesis', name: 'Output Synthesis', layer: 'output',
    technologies: [
      { name: 'Jinja2 + JSON Schema Renderer', capability: 5 },
      { name: 'Markdown Template Engine', capability: 3 },
      { name: 'Simple String Formatting', capability: 1 },
    ] },

  // Ops
  { id: 'observation-logging', name: 'Observation & Logging', layer: 'ops',
    technologies: [
      { name: 'Structured JSON Logging + LangSmith', capability: 5 },
      { name: 'Python Structured Logging', capability: 3 },
      { name: 'Console Logger', capability: 1 },
    ] },
]

const categoryMap = new Map(COMPONENT_CATEGORIES.map(c => [c.id, c]))

// ─── Main Engine: Analyze & Compose ─────────────────────────────────────

export function analyzeAndCompose(patterns: DimensionPattern[]): CompositionResult {
  // Step 1: Determine which meta-patterns are triggered
  const triggeredMPs: DerivedMetaPattern[] = []
  let mpIdx = 0

  for (const mpDef of META_PATTERN_DEFS) {
    if (mpDef.triggerFn(patterns)) {
      mpIdx++
      // Compute execution path count from pattern overlap
      const relevantPatterns = patterns.filter(p => {
        if (mpDef.family === 'Data Access') return p.dataDimensionIds.length >= (mpDef.id.includes('multi') ? 2 : 1)
        if (mpDef.family === 'Data Shape') return true
        if (mpDef.family === 'Task Structure') return p.tier !== 'simple' || mpDef.id === 'sequential-task-chain'
        return true
      })
      const pathCount = Math.max(relevantPatterns.length * 100 + mpIdx * 500, 1000)

      triggeredMPs.push({
        id: `mp-${String(mpIdx).padStart(3, '0')}`,
        name: mpDef.name,
        family: mpDef.family,
        description: mpDef.description,
        executionPathCount: pathCount,
        triggeredComponents: mpDef.triggeredComponents,
      })
    }
  }

  // Step 2: Collect all triggered component category IDs
  const triggeredCategoryIds = new Set<string>()
  const categoryTriggers = new Map<string, string[]>() // categoryId → meta-pattern names

  for (const mp of triggeredMPs) {
    for (const catId of mp.triggeredComponents) {
      triggeredCategoryIds.add(catId)
      const existing = categoryTriggers.get(catId) ?? []
      existing.push(mp.name)
      categoryTriggers.set(catId, existing)
    }
  }

  // Step 3: For each triggered category, select the best technology
  // Conflict resolution: more capable technology wins
  const components: ComposedComponent[] = []
  let compIdx = 0

  for (const catId of triggeredCategoryIds) {
    const catDef = categoryMap.get(catId)
    if (!catDef) continue

    // Count how many meta-patterns trigger this category (more = need more capable)
    const triggerCount = categoryTriggers.get(catId)?.length ?? 1
    // Select technology: more triggers = need higher capability
    const minCapability = triggerCount >= 3 ? 4 : triggerCount >= 2 ? 3 : 1
    const bestTech = catDef.technologies
      .filter(t => t.capability >= minCapability)
      .sort((a, b) => b.capability - a.capability)[0]
      ?? catDef.technologies[0]

    compIdx++
    components.push({
      id: `comp-${String(compIdx).padStart(3, '0')}`,
      categoryId: catDef.id,
      categoryName: catDef.name,
      selectedTechnology: bestTech.name,
      justification: `Triggered by ${(categoryTriggers.get(catId) ?? []).join(', ')}. Selected ${bestTech.name} (capability ${bestTech.capability}/5) for ${triggerCount} meta-pattern${triggerCount > 1 ? 's' : ''}.`,
      triggeredByPatterns: categoryTriggers.get(catId) ?? [],
      layer: catDef.layer,
    })
  }

  return {
    metaPatterns: triggeredMPs,
    architecture: { components },
  }
}
