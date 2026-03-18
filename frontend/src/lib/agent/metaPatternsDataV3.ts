/**
 * Meta-Patterns Data for VibeModel Agent Playground V3 Stage 6
 * Extracted from use case Section 6.1 specifications
 * Keyed by tileId for stage execution
 *
 * DYNAMIC DERIVATION:
 * When a tile has pattern data (via generatePatterns), this module
 * dynamically derives meta-patterns using the MetaPattern Taxonomy engine.
 * Hardcoded data is used as fallback for tiles without pattern data.
 */

import { generatePatterns } from './patternCombinationEngine'
import { analyzeAndCompose, type DerivedMetaPattern } from './metaPatternTaxonomy'

export interface MetaPatternV3 {
  id: string
  name: string
  family: string
  description: string
  executionPathCount: number
  triggeredComponents: string[]
}

export interface MetaPatternsCollection {
  patterns: MetaPatternV3[]
  totalPatterns: number
  totalFamilies: number
  families: string[]
}

/**
 * Invoice Processing Agent (Very Complex)
 * 11 meta-patterns across 8 families
 */
const INVOICE_PROCESSING_PATTERNS: MetaPatternV3[] = [
  {
    id: 'inv-mp-001',
    name: 'multi-source-fetch',
    family: 'Data Access',
    description: '3 independent vendor sources (AWS, GCP, Staples) require parallel data retrieval with race condition handling and timeout logic',
    executionPathCount: 38922,
    triggeredComponents: ['parallel-async-io', 'timeout-handler', 'error-recovery'],
  },
  {
    id: 'inv-mp-002',
    name: 'cross-source-join',
    family: 'Data Access',
    description: 'PO matching requires joining invoice line items with PO database on PO number + vendor + amount; produces Cartesian product requiring join optimization',
    executionPathCount: 20633,
    triggeredComponents: ['join-optimizer', 'fuzzy-matcher', 'confidence-scorer'],
  },
  {
    id: 'inv-mp-003',
    name: 'temporal-aggregation',
    family: 'Data Transformation',
    description: 'Invoices span multiple billing cycles (AWS 1st, GCP 15th, Staples variable). Monthly→quarterly rollup requires offset handling and date normalization',
    executionPathCount: 25219,
    triggeredComponents: ['date-normalizer', 'period-aggregator', 'offset-handler'],
  },
  {
    id: 'inv-mp-004',
    name: 'document-data',
    family: 'Data Format',
    description: 'Staples PDFs and archived scanned invoices require document parsing (text extraction, table detection, image OCR) not needed for AWS/GCP structured data',
    executionPathCount: 13756,
    triggeredComponents: ['pdf-parser', 'ocr-engine', 'table-detector'],
  },
  {
    id: 'inv-mp-005',
    name: 'table-data',
    family: 'Data Format',
    description: 'AWS CSV and PO database are structured tabular formats; these patterns require row-column parsing, NULL handling, aggregation',
    executionPathCount: 32136,
    triggeredComponents: ['csv-parser', 'schema-enforcer', 'null-handler'],
  },
  {
    id: 'inv-mp-006',
    name: 'mixed-format-composition',
    family: 'Task Structure',
    description: 'Staples single vendor uses 3 different PDF formats (table-only, mixed, text-only) requiring conditional routing to different parsers in sequence',
    executionPathCount: 9170,
    triggeredComponents: ['format-detector', 'parser-router', 'fallback-chain'],
  },
  {
    id: 'inv-mp-007',
    name: 'reasoning-chain',
    family: 'Task Structure',
    description: 'Trend analysis + anomaly detection + root cause attribution requires 7-step multi-hop reasoning; error in any step propagates',
    executionPathCount: 17195,
    triggeredComponents: ['llm-reasoner', 'confidence-aggregator', 'error-propagator'],
  },
  {
    id: 'inv-mp-008',
    name: 'structured-data-output',
    family: 'Output Synthesis',
    description: 'Cost reports must produce JSON tables, markdown summaries, and citation links; requires output schema enforcement',
    executionPathCount: 12609,
    triggeredComponents: ['json-schema-validator', 'markdown-renderer', 'citation-linker'],
  },
  {
    id: 'inv-mp-009',
    name: 'citation-required',
    family: 'Output Synthesis',
    description: 'Every cost figure must trace to specific invoice # and line item; requires maintaining citation chain through all transformations',
    executionPathCount: 28658,
    triggeredComponents: ['citation-tracker', 'lineage-builder', 'source-validator'],
  },
  {
    id: 'inv-mp-010',
    name: 'tool-fallback-chain',
    family: 'Error Handling',
    description: 'PDF parser fails on scanned images (31 archive PDFs); must detect failure and auto-route to OCR engine, with confidence threshold routing to human',
    executionPathCount: 8024,
    triggeredComponents: ['failure-detector', 'fallback-router', 'ocr-engine'],
  },
  {
    id: 'inv-mp-011',
    name: 'confidence-threshold-routing',
    family: 'Error Handling',
    description: 'Low-confidence OCR extractions (<85%), low-confidence PO matches (70-84%), and low-confidence anomalies (1.5-2SD) routed to human escalation with explanation',
    executionPathCount: 10317,
    triggeredComponents: ['confidence-calculator', 'threshold-evaluator', 'escalation-router'],
  },
]

/**
 * Enterprise RAG Copilot (Very Complex)
 * 12 meta-patterns across 10 families
 */
const ENTERPRISE_RAG_PATTERNS: MetaPatternV3[] = [
  {
    id: 'rag-mp-001',
    name: 'multi-source-fetch',
    family: 'Data Access',
    description: '5 independent sources (Confluence, Slack, Drive, Jira, Directory) require parallel retrieval with timeout and retry logic',
    executionPathCount: 22634,
    triggeredComponents: ['parallel-async-io', 'timeout-handler', 'retry-manager'],
  },
  {
    id: 'rag-mp-002',
    name: 'cross-source-join',
    family: 'Data Access',
    description: 'Entity-based correlation across sources (same project referenced in Jira + Confluence + Slack + Drive) requires fuzzy matching on project names',
    executionPathCount: 11946,
    triggeredComponents: ['entity-matcher', 'fuzzy-matcher', 'correlation-builder'],
  },
  {
    id: 'rag-mp-003',
    name: 'entity-extraction',
    family: 'Data Transformation',
    description: 'Extract entities (person names, project names, decision topics) from unstructured text (Slack, Confluence) for correlation',
    executionPathCount: 13832,
    triggeredComponents: ['ner-engine', 'entity-resolver', 'canonical-mapper'],
  },
  {
    id: 'rag-mp-004',
    name: 'access-control-aware',
    family: 'Data Access',
    description: 'Filter results based on user\'s permissions across 5 different permission systems (Confluence spaces, Slack channels, Drive ACLs, Jira projects, Directory roles)',
    executionPathCount: 15090,
    triggeredComponents: ['permission-cache', 'acl-checker', 'filter-applier'],
  },
  {
    id: 'rag-mp-005',
    name: 'document-data',
    family: 'Data Format',
    description: 'Confluence and Drive contain document formats requiring text extraction and semantic parsing (not structured data like Jira)',
    executionPathCount: 8802,
    triggeredComponents: ['doc-parser', 'text-extractor', 'semantic-analyzer'],
  },
  {
    id: 'rag-mp-006',
    name: 'reasoning-chain',
    family: 'Task Structure',
    description: 'Causality analysis (root cause of delays) requires 6-8 dependent reasoning steps with error propagation risk',
    executionPathCount: 7545,
    triggeredComponents: ['llm-reasoner', 'causal-analyzer', 'hypothesis-builder'],
  },
  {
    id: 'rag-mp-007',
    name: 'temporal-aggregation',
    family: 'Data Transformation',
    description: 'Build timelines across sources with different timestamp granularities (Slack millisecond precision, Confluence page-level date, Jira workflow state dates)',
    executionPathCount: 11317,
    triggeredComponents: ['timestamp-normalizer', 'timeline-builder', 'granularity-handler'],
  },
  {
    id: 'rag-mp-008',
    name: 'confidence-threshold-routing',
    family: 'Error Handling',
    description: 'Low-confidence entity matches (70-84% similarity), low-confidence correlations route to human verification',
    executionPathCount: 6916,
    triggeredComponents: ['confidence-scorer', 'threshold-evaluator', 'escalation-router'],
  },
  {
    id: 'rag-mp-009',
    name: 'citation-required',
    family: 'Output Synthesis',
    description: 'Every synthesis claim must trace to original source (Confluence page ID, Slack message ID, Jira issue ID, etc.)',
    executionPathCount: 16347,
    triggeredComponents: ['citation-tracker', 'source-linker', 'metadata-preserver'],
  },
  {
    id: 'rag-mp-010',
    name: 'partial-data-handling',
    family: 'Error Handling',
    description: 'Incomplete results (Confluence API timeout, Slack pagination limit, Drive search cutoff) must be flagged, not silently presented as complete',
    executionPathCount: 12575,
    triggeredComponents: ['completeness-checker', 'gap-detector', 'warning-generator'],
  },
  {
    id: 'rag-mp-011',
    name: 'mixed-format-composition',
    family: 'Data Format',
    description: 'Synthesize answers from rich text (Confluence), threaded text (Slack), structured data (Jira), semi-structured files (Drive)',
    executionPathCount: 10689,
    triggeredComponents: ['multi-format-parser', 'content-normalizer', 'synthesizer'],
  },
  {
    id: 'rag-mp-012',
    name: 'context-window-overflow',
    family: 'Task Structure',
    description: 'Slack threads with 8+ replies, multi-document synthesis with 5+ sources can exceed LLM context; require summarization or hierarchical synthesis',
    executionPathCount: 5659,
    triggeredComponents: ['context-meter', 'summarizer', 'hierarchical-composer'],
  },
]

/**
 * SaaS Customer Support Agent (Medium Complexity)
 * 9 meta-patterns across 6 families
 */
const SAAS_SUPPORT_PATTERNS: MetaPatternV3[] = [
  {
    id: 'sup-mp-001',
    name: 'multi-channel-ingestion',
    family: 'Data Access',
    description: 'Tickets arrive from email, in-app chat, webhook; need unified parsing',
    executionPathCount: 18900,
    triggeredComponents: ['email-parser', 'chat-parser', 'webhook-parser', 'schema-normalizer'],
  },
  {
    id: 'sup-mp-002',
    name: 'sentiment-aware-response',
    family: 'Task Structure',
    description: 'Angry customers need empathetic tone; positive need casual tone',
    executionPathCount: 9720,
    triggeredComponents: ['sentiment-classifier', 'tone-selector', 'response-templater'],
  },
  {
    id: 'sup-mp-003',
    name: 'kb-semantic-search',
    family: 'Data Access',
    description: 'Vector embeddings + keyword search for article matching',
    executionPathCount: 11880,
    triggeredComponents: ['embedding-engine', 'vector-search', 'keyword-matcher'],
  },
  {
    id: 'sup-mp-004',
    name: 'customer-context-enrichment',
    family: 'Data Transformation',
    description: 'Every ticket needs account lookup, subscription state, history',
    executionPathCount: 24300,
    triggeredComponents: ['account-lookup', 'history-fetcher', 'context-enricher'],
  },
  {
    id: 'sup-mp-005',
    name: 'action-precondition-validation',
    family: 'Error Handling',
    description: 'Each action has 3-5 constraints; must validate before execution',
    executionPathCount: 6480,
    triggeredComponents: ['rule-engine', 'precondition-checker', 'validator'],
  },
  {
    id: 'sup-mp-006',
    name: 'confidence-threshold-routing',
    family: 'Error Handling',
    description: 'KB match <70% or PO confidence <85% triggers escalation',
    executionPathCount: 14040,
    triggeredComponents: ['confidence-scorer', 'threshold-gate', 'escalation-router'],
  },
  {
    id: 'sup-mp-007',
    name: 'escalation-queue-management',
    family: 'Output Synthesis',
    description: 'Peak hours create bottleneck; need priority routing, load balancing',
    executionPathCount: 17280,
    triggeredComponents: ['priority-sorter', 'load-balancer', 'queue-manager'],
  },
  {
    id: 'sup-mp-008',
    name: 'de-escalation-recovery',
    family: 'Task Structure',
    description: 'Tone + context can resolve issues before escalation',
    executionPathCount: 4320,
    triggeredComponents: ['context-analyzer', 'recovery-suggester', 'tone-adjuster'],
  },
  {
    id: 'sup-mp-009',
    name: 'multi-purpose-response-synthesis',
    family: 'Output Synthesis',
    description: 'Single ticket may need KB link + action confirmation + escalation info',
    executionPathCount: 8100,
    triggeredComponents: ['response-composer', 'link-builder', 'confirmation-handler'],
  },
]

/**
 * FAQ Knowledge Agent (Simple Complexity)
 * 4 meta-patterns across 4 families
 */
const FAQ_PATTERNS: MetaPatternV3[] = [
  {
    id: 'faq-mp-001',
    name: 'single-source-lookup',
    family: 'Data Access',
    description: '85% of queries resolve to one high-confidence document',
    executionPathCount: 1193,
    triggeredComponents: ['search-engine', 'doc-retriever', 'ranking-engine'],
  },
  {
    id: 'faq-mp-002',
    name: 'document-data',
    family: 'Data Format',
    description: 'All responses require parsing markdown/PDF documents',
    executionPathCount: 1079,
    triggeredComponents: ['markdown-parser', 'pdf-extractor', 'metadata-parser'],
  },
  {
    id: 'faq-mp-003',
    name: 'entity-extraction',
    family: 'Data Transformation',
    description: 'Questions often contain key entities (role, date, topic)',
    executionPathCount: 795,
    triggeredComponents: ['ner-engine', 'entity-resolver', 'topic-classifier'],
  },
  {
    id: 'faq-mp-004',
    name: 'citation-required',
    family: 'Output Synthesis',
    description: 'Every fact must be cited to source document',
    executionPathCount: 2840,
    triggeredComponents: ['citation-tracker', 'source-linker', 'metadata-preserver'],
  },
]

// ─── Dynamic derivation cache ────────────────────────────────────────────
const derivationCache = new Map<string, MetaPatternsCollection>()

function derivedToV3(mp: DerivedMetaPattern): MetaPatternV3 {
  return { id: mp.id, name: mp.name, family: mp.family, description: mp.description, executionPathCount: mp.executionPathCount, triggeredComponents: mp.triggeredComponents }
}

function dynamicDerive(realTileId: string): MetaPatternsCollection | null {
  if (derivationCache.has(realTileId)) return derivationCache.get(realTileId)!
  const genResult = generatePatterns(realTileId)
  if (!genResult || genResult.patterns.length === 0) return null
  // Convert GeneratedPattern[] to DimensionPattern-like for the taxonomy engine
  const dimPatterns = genResult.patterns.map(gp => ({
    id: gp.id, tier: gp.tier as 'simple' | 'complex' | 'fuzzy', patternType: gp.tier,
    name: gp.name, description: gp.description,
    taskDimensionId: gp.taskDimensionId, dataDimensionIds: gp.dataDimensionIds,
    responseDimensionId: gp.responseDimensionId, toolDimensionIds: gp.toolDimensionIds,
    exampleQuestions: gp.sampleQuestions,
  }))
  const { metaPatterns } = analyzeAndCompose(dimPatterns as any)
  if (metaPatterns.length === 0) return null
  const v3Patterns = metaPatterns.map(derivedToV3)
  const families = [...new Set(v3Patterns.map(p => p.family))].sort()
  const collection: MetaPatternsCollection = { patterns: v3Patterns, totalPatterns: v3Patterns.length, totalFamilies: families.length, families }
  derivationCache.set(realTileId, collection)
  return collection
}

/**
 * Main export function - retrieves meta-patterns by tileId
 * Priority: 1. Dynamic derivation from pattern engine, 2. Hardcoded fallback
 */
export function getMetaPatternsV3(tileId: string, realTileId?: string): MetaPatternsCollection | null {
  // Try dynamic derivation first
  const dynamicResult = dynamicDerive(realTileId ?? tileId)
  if (dynamicResult) return dynamicResult

  // Fallback to hardcoded data
  let patterns: MetaPatternV3[] = []

  switch (tileId) {
    case 'invoice-processing':
      patterns = INVOICE_PROCESSING_PATTERNS
      break
    case 'enterprise-rag':
      patterns = ENTERPRISE_RAG_PATTERNS
      break
    case 'saas-support':
      patterns = SAAS_SUPPORT_PATTERNS
      break
    case 'faq-knowledge':
      patterns = FAQ_PATTERNS
      break
    default:
      return null
  }

  const families = [...new Set(patterns.map(p => p.family))].sort()

  return {
    patterns,
    totalPatterns: patterns.length,
    totalFamilies: families.length,
    families,
  }
}

/**
 * Utility: get patterns filtered by family
 */
export function getMetaPatternsByFamily(tileId: string, family: string): MetaPatternV3[] {
  const collection = getMetaPatternsV3(tileId)
  if (!collection) return []
  return collection.patterns.filter(p => p.family === family)
}

/**
 * Utility: get all families across all tiles
 */
export function getAllMetaPatternFamilies(): string[] {
  const allFamilies = new Set<string>()

  ;(['invoice-processing', 'enterprise-rag', 'saas-support', 'faq-knowledge'] as const).forEach(tileId => {
    const collection = getMetaPatternsV3(tileId)
    if (collection) {
      collection.families.forEach(f => allFamilies.add(f))
    }
  })

  return Array.from(allFamilies).sort()
}

/**
 * Utility: get total execution paths for a tile
 */
export function getTotalExecutionPaths(tileId: string): number {
  const collection = getMetaPatternsV3(tileId)
  if (!collection) return 0
  return collection.patterns.reduce((sum, p) => sum + p.executionPathCount, 0)
}
