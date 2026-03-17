/**
 * Evaluation Metrics Data V3 - VibeModel Agent Playground V3
 * Provides evaluation metrics and target values for each agent tile
 * Data extracted from Sections 5.2-5.3 of use case markdown files
 */

export interface EvaluationMetricV3 {
  id: string
  name: string
  description: string
  targetValue: number
  unit: string
  measurementMethod: string
  category: 'accuracy' | 'performance' | 'reliability' | 'business'
}

/**
 * Get evaluation metrics for a given tile ID
 */
export function getEvaluationMetricsV3(tileId: string): EvaluationMetricV3[] | null {
  const metricsDatabase: Record<string, EvaluationMetricV3[]> = {
    'doc-intelligence': [
      {
        id: 'm-001',
        name: 'extraction-accuracy',
        description: 'Percentage of line items correctly extracted from source documents',
        targetValue: 97,
        unit: 'percent',
        measurementMethod:
          'Compare extracted line items to ground truth (manually verified invoices). Count matches / total expected items.',
        category: 'accuracy',
      },
      {
        id: 'm-002',
        name: 'cross-source-precision',
        description: 'Percentage of cross-vendor aggregations that are mathematically correct when spot-checked',
        targetValue: 95,
        unit: 'percent',
        measurementMethod:
          'Select 20 random cost aggregations per test run; manually verify sum accuracy against source documents.',
        category: 'accuracy',
      },
      {
        id: 'm-003',
        name: 'po-match-rate',
        description: 'Percentage of invoices successfully matched to purchase orders with confidence >90%',
        targetValue: 92,
        unit: 'percent',
        measurementMethod: 'Count invoices with successful PO match (confidence ≥90%) / total invoices. Track by vendor.',
        category: 'accuracy',
      },
      {
        id: 'm-004',
        name: 'anomaly-detection-recall',
        description: 'Percentage of known anomalies (injected or historical) that agent detects as flagged',
        targetValue: 88,
        unit: 'percent',
        measurementMethod:
          'Inject 25 synthetic anomalies into test data; measure how many agent identifies. Calculate recall = detected / injected.',
        category: 'reliability',
      },
      {
        id: 'm-005',
        name: 'response-latency-p95',
        description: '95th percentile response time for all agent queries across all patterns',
        targetValue: 3000,
        unit: 'milliseconds',
        measurementMethod:
          'Run full test suite; collect response times; sort ascending; extract 95th percentile value.',
        category: 'performance',
      },
      {
        id: 'm-006',
        name: 'citation-accuracy',
        description: 'Percentage of cost claims that include correct source attribution (invoice #, document link)',
        targetValue: 99,
        unit: 'percent',
        measurementMethod:
          'For every cost figure in agent response, verify source citation exists and points to correct invoice. Count correct / total claims.',
        category: 'accuracy',
      },
      {
        id: 'm-007',
        name: 'ocr-fallback-success',
        description: 'Percentage of scanned PDF invoices (archive images) successfully processed via OCR fallback',
        targetValue: 85,
        unit: 'percent',
        measurementMethod:
          'Run OCR on 31 scanned archive invoices; count successful extractions (confidence >85%) / 31.',
        category: 'reliability',
      },
      {
        id: 'm-008',
        name: 'temporal-alignment-accuracy',
        description:
          'Percentage of multi-period aggregations (e.g., quarterly rollups) that correctly handle billing cycle offsets',
        targetValue: 94,
        unit: 'percent',
        measurementMethod:
          'For each period alignment, manually verify offset handling. Count correct period boundaries / total period boundaries tested.',
        category: 'accuracy',
      },
      {
        id: 'm-009',
        name: 'data-completeness-detection',
        description: 'Percentage of missing or incomplete data that agent detects and flags before presenting aggregates',
        targetValue: 91,
        unit: 'percent',
        measurementMethod:
          'Inject 22 data gaps (missing AWS months, incomplete Staples invoices, etc.); measure how many agent detects and flags with warning.',
        category: 'reliability',
      },
      {
        id: 'm-010',
        name: 'discrepancy-flagging-rate',
        description: 'Percentage of charge discrepancies (vs POs or contracts) that agent identifies and escalates',
        targetValue: 96,
        unit: 'percent',
        measurementMethod:
          'Inject 50 subtle discrepancies; measure how many agent catches (e.g., amount overcharge, qty mismatch, wrong rate).',
        category: 'accuracy',
      },
    ],
    'saas-copilot': [
      {
        id: 'm-001',
        name: 'kb-search-accuracy',
        description: 'Correct article returned for query (top-3 relevance match)',
        targetValue: 92,
        unit: 'percent',
        measurementMethod: 'Run search for each query; verify most relevant article in top 3. Count successes / total queries.',
        category: 'accuracy',
      },
      {
        id: 'm-002',
        name: 'action-execution-success',
        description: 'Actions executed successfully given valid preconditions',
        targetValue: 94,
        unit: 'percent',
        measurementMethod: 'Count successful action executions / total attempted actions (preconditions passed).',
        category: 'reliability',
      },
      {
        id: 'm-003',
        name: 'sentiment-detection-accuracy',
        description: 'Correctly identifies positive/neutral/negative/angry tone',
        targetValue: 88,
        unit: 'percent',
        measurementMethod:
          'Run sentiment classifier on test ticket sample (50+ tickets); compare to manually labeled ground truth.',
        category: 'accuracy',
      },
      {
        id: 'm-004',
        name: 'escalation-routing-accuracy',
        description: 'Ticket routed to correct team (Engineering/Billing/Sales)',
        targetValue: 91,
        unit: 'percent',
        measurementMethod:
          'For each escalation, verify routed to correct team based on issue type. Count correct routings / total escalations.',
        category: 'accuracy',
      },
      {
        id: 'm-005',
        name: 'response-latency-p95',
        description: '95th percentile response time all patterns',
        targetValue: 2000,
        unit: 'milliseconds',
        measurementMethod: 'Measure response time per query. Sort ascending. Extract 95th percentile.',
        category: 'performance',
      },
      {
        id: 'm-006',
        name: 'first-response-time',
        description: 'Time from ticket ingestion to first response',
        targetValue: 120,
        unit: 'seconds',
        measurementMethod: 'Measure time delta from ticket creation timestamp to first agent response timestamp.',
        category: 'performance',
      },
      {
        id: 'm-007',
        name: 'self-service-resolution-rate',
        description: '% of tickets resolved via KB + action without escalation',
        targetValue: 68,
        unit: 'percent',
        measurementMethod:
          'Count tickets closed via self-service (KB answer or action executed) / total tickets. Exclude escalations.',
        category: 'business',
      },
      {
        id: 'm-008',
        name: 'customer-satisfaction-score',
        description: 'CSAT after ticket resolution (5-point scale)',
        targetValue: 4.2,
        unit: 'rating',
        measurementMethod:
          'Post-resolution survey: "How satisfied are you with this resolution?" (1-5 scale). Calculate average CSAT across sample.',
        category: 'business',
      },
    ],
    'research-comparison': [
      {
        id: 'm-001',
        name: 'search-recall',
        description:
          'Percentage of relevant documents retrieved when searching across all sources for a query',
        targetValue: 92,
        unit: 'percent',
        measurementMethod:
          'Execute 20 test queries; for each, manually identify all relevant documents; measure: retrieved relevant / total relevant documents.',
        category: 'accuracy',
      },
      {
        id: 'm-002',
        name: 'entity-resolution-accuracy',
        description:
          'Percentage of entity matches (john.doe vs. John Doe vs. john_doe) correctly resolved to same person',
        targetValue: 96,
        unit: 'percent',
        measurementMethod:
          'Extract all entity references across sources (100+ distinct); verify unique entity count; calculate correct resolution / expected.',
        category: 'accuracy',
      },
      {
        id: 'm-003',
        name: 'access-control-filtering-correctness',
        description:
          'Percentage of access control decisions correct (correctly filtered inaccessible items, didn\'t over-filter accessible items)',
        targetValue: 97,
        unit: 'percent',
        measurementMethod:
          'For each query, verify inaccessible items were actually inaccessible and accessible items returned. Count correct / total decisions.',
        category: 'reliability',
      },
      {
        id: 'm-004',
        name: 'cross-source-correlation-precision',
        description:
          'Percentage of cross-source links (e.g., same decision across Confluence + Slack + Jira) that are actually related',
        targetValue: 89,
        unit: 'percent',
        measurementMethod:
          'Run 10 cross-source correlation queries; manually verify if linked items are truly related. Count correct / total attempted.',
        category: 'accuracy',
      },
      {
        id: 'm-005',
        name: 'response-latency-p95',
        description: '95th percentile response time for all agent queries across all patterns',
        targetValue: 4500,
        unit: 'milliseconds',
        measurementMethod:
          'Run full test suite; collect response times per query; sort ascending; extract 95th percentile.',
        category: 'performance',
      },
      {
        id: 'm-006',
        name: 'citation-completeness',
        description: 'Percentage of claims in synthesis-report that include proper citation (source document ID + link)',
        targetValue: 98,
        unit: 'percent',
        measurementMethod:
          'For each synthesis-report response, verify each fact/claim has citation. Count cited claims / total claims.',
        category: 'accuracy',
      },
      {
        id: 'm-007',
        name: 'freshness-detection-accuracy',
        description: 'Percentage of stale documents (>90 days old) correctly flagged with freshness warning',
        targetValue: 91,
        unit: 'percent',
        measurementMethod:
          'Inject 15 Confluence pages with varying ages; measure how many agent flags as stale/aging. Count correct / total.',
        category: 'reliability',
      },
      {
        id: 'm-008',
        name: 'slack-thread-completeness',
        description: 'Percentage of Slack thread-based answers that include context from thread replies (not just main message)',
        targetValue: 94,
        unit: 'percent',
        measurementMethod:
          'For 10 Slack-based queries, verify response includes thread reply information (avg 8 replies/thread). Count with context / 10.',
        category: 'accuracy',
      },
      {
        id: 'm-009',
        name: 'multi-source-data-gap-detection',
        description:
          'Percentage of data gaps (missing sources, inaccessible items, incomplete results) that agent detects and flags',
        targetValue: 88,
        unit: 'percent',
        measurementMethod:
          'Inject 25 data gaps (API timeouts, inaccessible channels, quota exceeded); measure how many agent detects/flags.',
        category: 'reliability',
      },
      {
        id: 'm-010',
        name: 'reasoning-confidence-calibration',
        description:
          'Does agent confidence score match actual accuracy? (Confidence 90% queries should be ~90% accurate in ground truth)',
        targetValue: 90,
        unit: 'percent',
        measurementMethod:
          'For 20 reasoning-tier queries, calculate: min(confidence, actual_accuracy) / max(confidence, actual_accuracy). Target: >85%.',
        category: 'reliability',
      },
    ],
    'faq-knowledge': [
      {
        id: 'm-001',
        name: 'answer-accuracy',
        description: 'Percentage of agent answers matching ground truth verified answers',
        targetValue: 88,
        unit: 'percent',
        measurementMethod:
          'Compare agent response to SME-verified answer. Match if: facts correct, all key points covered, no contradictions.',
        category: 'accuracy',
      },
      {
        id: 'm-002',
        name: 'citation-completeness',
        description: 'Percentage of facts cited with document ID/link',
        targetValue: 96,
        unit: 'percent',
        measurementMethod:
          'For each claim in response, verify citation present and points to correct document. Count cited / total claims.',
        category: 'accuracy',
      },
      {
        id: 'm-003',
        name: 'search-success-rate',
        description: 'Percentage of queries finding relevant document in top 3 results',
        targetValue: 87,
        unit: 'percent',
        measurementMethod:
          'Run search for each query; check if most relevant doc appears in top 3. Count successes / 12 queries.',
        category: 'accuracy',
      },
      {
        id: 'm-004',
        name: 'response-latency-p95',
        description: '95th percentile response time across all queries',
        targetValue: 3000,
        unit: 'milliseconds',
        measurementMethod: 'Measure response time for each query. Sort ascending. Extract 95th percentile value.',
        category: 'performance',
      },
      {
        id: 'm-005',
        name: 'escalation-precision',
        description: 'Percentage of escalations that are actually necessary/appropriate',
        targetValue: 92,
        unit: 'percent',
        measurementMethod:
          'For each escalation, verify it\'s genuinely ambiguous or out-of-scope. Count appropriate / total escalations.',
        category: 'reliability',
      },
      {
        id: 'm-006',
        name: 'user-satisfaction',
        description: 'User rating (1-5 scale) on answer helpfulness and clarity',
        targetValue: 4.2,
        unit: 'rating',
        measurementMethod:
          'Post-query survey: "Was this answer helpful? How clear was it?" Average across queries (5-point scale).',
        category: 'business',
      },
    ],
  }

  return metricsDatabase[tileId] || null
}

/**
 * Get all evaluation metrics for all tiles
 */
export function getAllEvaluationMetricsV3(): Record<string, EvaluationMetricV3[]> {
  const allTileIds = [
    'doc-intelligence',
    'saas-copilot',
    'research-comparison',
    'faq-knowledge',
  ]

  const result: Record<string, EvaluationMetricV3[]> = {}

  for (const tileId of allTileIds) {
    const data = getEvaluationMetricsV3(tileId)
    if (data) {
      result[tileId] = data
    }
  }

  return result
}

/**
 * Utility: get metric by ID across all tiles
 */
export function getMetricById(tileId: string, metricId: string): EvaluationMetricV3 | null {
  const metrics = getEvaluationMetricsV3(tileId)
  if (!metrics) return null
  return metrics.find((m) => m.id === metricId) || null
}

/**
 * Utility: filter metrics by category
 */
export function getMetricsByCategory(
  tileId: string,
  category: EvaluationMetricV3['category']
): EvaluationMetricV3[] {
  const metrics = getEvaluationMetricsV3(tileId)
  if (!metrics) return []
  return metrics.filter((m) => m.category === category)
}

/**
 * Utility: get all target values for a tile (for comparison)
 */
export function getTargetValuesForTile(tileId: string): Record<string, number> {
  const metrics = getEvaluationMetricsV3(tileId)
  if (!metrics) return {}

  const targets: Record<string, number> = {}
  metrics.forEach((m) => {
    targets[m.id] = m.targetValue
  })
  return targets
}

/**
 * Utility: get average target value across all metrics for a tile
 */
export function getAverageTargetForTile(tileId: string): number {
  const metrics = getEvaluationMetricsV3(tileId)
  if (!metrics || metrics.length === 0) return 0

  // Only average numeric targets (exclude those in milliseconds or ratings where averaging doesn't make sense)
  const numericMetrics = metrics.filter((m) => m.unit === 'percent')
  if (numericMetrics.length === 0) return 0

  const sum = numericMetrics.reduce((acc, m) => acc + m.targetValue, 0)
  return Math.round((sum / numericMetrics.length) * 10) / 10
}
