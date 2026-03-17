/**
 * Pattern Data V3 - VibeModel Agent Playground V3
 * Provides pattern discovery metrics and high-risk scenarios for each agent tile
 * Data extracted from Sections 4 of use case markdown files
 */

export interface PatternSummaryV3 {
  totalPatterns: number
  reasoningChainCount: number
  crossSourceMismatchCount: number
  highRiskScenarioCount: number
  highRiskScenarios: {
    description: string
    patternsCount: number
    dimensionsCrossed: string[]
  }[]
  tierBreakdown: {
    simple: number
    complex: number
    reasoning: number
  }
}

/**
 * Get pattern data for a given tile ID
 * Returns comprehensive pattern discovery metrics
 */
export function getPatternDataV3(tileId: string): PatternSummaryV3 | null {
  const patternDatabase: Record<string, PatternSummaryV3> = {
    'doc-intelligence': {
      totalPatterns: 114630,
      reasoningChainCount: 25,
      crossSourceMismatchCount: 7,
      highRiskScenarioCount: 12,
      highRiskScenarios: [
        {
          description: 'Silent data gaps in invoice records causing unmatched line items',
          patternsCount: 2840,
          dimensionsCrossed: ['dim-002', 'dim-019', 'fmt-004'],
        },
        {
          description: 'Semantic normalization failures across vendor-specific cost categories',
          patternsCount: 1890,
          dimensionsCrossed: ['dim-031', 'dim-032', 'tool-aws', 'tool-gcp'],
        },
        {
          description: 'OCR fallback complexity with degraded PDF invoice quality',
          patternsCount: 1456,
          dimensionsCrossed: ['fmt-004', 'tool-pdf', 'dim-003'],
        },
        {
          description: 'PO matching confidence threshold failures below 85% similarity',
          patternsCount: 2134,
          dimensionsCrossed: ['dim-019', 'fmt-002', 'tool-sql'],
        },
        {
          description: 'Multi-step reasoning chain error propagation in cost reconciliation',
          patternsCount: 3456,
          dimensionsCrossed: ['dim-034', 'dim-031', 'dim-035'],
        },
        {
          description: 'Temporal billing cycle misalignment across AWS, GCP, Staples',
          patternsCount: 2789,
          dimensionsCrossed: ['dim-033', 'dim-034', 'fmt-001', 'fmt-003'],
        },
        {
          description: 'Anomaly detection baseline insufficiency with <3 months historical data',
          patternsCount: 1678,
          dimensionsCrossed: ['dim-036', 'dim-033', 'tool-aws'],
        },
        {
          description: 'Rate calculation variance in cross-vendor price per unit comparisons',
          patternsCount: 945,
          dimensionsCrossed: ['dim-032', 'tool-aws', 'tool-gcp', 'tool-pdf'],
        },
        {
          description: 'Contract renegotiation recommendation confidence <75% due to incomplete usage projection',
          patternsCount: 1234,
          dimensionsCrossed: ['dim-035', 'dim-031', 'dim-019'],
        },
        {
          description: 'Discrepancy escalation threshold ambiguity (when >3% or >$10K triggers review)',
          patternsCount: 1567,
          dimensionsCrossed: ['dim-002', 'dim-027', 'dim-034'],
        },
        {
          description: 'Archive invoice quality degradation (OCR confidence <80% on scanned PDFs)',
          patternsCount: 892,
          dimensionsCrossed: ['fmt-004', 'tool-pdf', 'dim-001'],
        },
        {
          description: 'Budget variance prediction failure due to business growth assumptions not visible in cost data',
          patternsCount: 1423,
          dimensionsCrossed: ['dim-037', 'dim-035', 'dim-034'],
        },
      ],
      tierBreakdown: {
        simple: 3648,
        complex: 41107,
        reasoning: 69875,
      },
    },
    'saas-copilot': {
      totalPatterns: 117424,
      reasoningChainCount: 23,
      crossSourceMismatchCount: 4,
      highRiskScenarioCount: 9,
      highRiskScenarios: [
        {
          description: 'Knowledge Base staleness causing false authority in answers',
          patternsCount: 3245,
          dimensionsCrossed: ['dim-007', 'kb-dim-002', 'tool-kb'],
        },
        {
          description: 'Sentiment-tone mismatch frustrating angry customers',
          patternsCount: 2567,
          dimensionsCrossed: ['dim-017', 'dim-020', 'tkt-dim-003'],
        },
        {
          description: 'Action precondition complexity blocking valid self-service resolution',
          patternsCount: 2891,
          dimensionsCrossed: ['dim-011', 'dim-015', 'cust-dim-005'],
        },
        {
          description: 'Escalation queue bottleneck during peak support hours',
          patternsCount: 4123,
          dimensionsCrossed: ['dim-020', 'dim-002', 'dim-003'],
        },
        {
          description: 'KB match confidence <70% triggering inappropriate escalations',
          patternsCount: 1834,
          dimensionsCrossed: ['dim-001', 'kb-dim-008', 'tool-kb'],
        },
        {
          description: 'Billing inquiry escalation routing failures to wrong department',
          patternsCount: 2456,
          dimensionsCrossed: ['dim-002', 'dim-020', 'cust-dim-003'],
        },
        {
          description: 'Performance issue context enrichment failure due to incomplete usage history',
          patternsCount: 1678,
          dimensionsCrossed: ['dim-001', 'dim-008', 'cust-dim-009'],
        },
        {
          description: 'Churn signal detection missing soft signals (engagement drop, feature underuse)',
          patternsCount: 2234,
          dimensionsCrossed: ['dim-001', 'dim-003', 'cust-dim-008'],
        },
        {
          description: 'Multi-issue ticket coordination failures (action + KB + escalation overlap)',
          patternsCount: 3456,
          dimensionsCrossed: ['dim-010', 'dim-011', 'dim-001'],
        },
      ],
      tierBreakdown: {
        simple: 35227,
        complex: 42253,
        reasoning: 39944,
      },
    },
    'research-comparison': {
      totalPatterns: 62874,
      reasoningChainCount: 25,
      crossSourceMismatchCount: 8,
      highRiskScenarioCount: 10,
      highRiskScenarios: [
        {
          description: 'Entity resolution failure across systems (john.doe vs John Doe across 5 sources)',
          patternsCount: 2890,
          dimensionsCrossed: ['dim-010', 'dim-005', 'fmt-005'],
        },
        {
          description: 'Access control filtering causing silent data suppression without user knowledge',
          patternsCount: 3456,
          dimensionsCrossed: ['dim-001', 'dim-011', 'dim-026'],
        },
        {
          description: 'Temporal misalignment in cross-source timeline construction',
          patternsCount: 2145,
          dimensionsCrossed: ['dim-004', 'dim-011', 'dim-027'],
        },
        {
          description: 'Slack thread discoverability failure due to message pagination limits',
          patternsCount: 1834,
          dimensionsCrossed: ['fmt-002', 'dim-011', 'dim-020'],
        },
        {
          description: 'Confluence document staleness undetected (>90 days without freshness warning)',
          patternsCount: 1567,
          dimensionsCrossed: ['fmt-001', 'dim-001', 'dim-037'],
        },
        {
          description: 'Reasoning chain error propagation in multi-hop causality analysis',
          patternsCount: 2678,
          dimensionsCrossed: ['dim-019', 'dim-023', 'dim-025'],
        },
        {
          description: 'Cross-source correlation false positives (same project name in Jira + Drive with different meaning)',
          patternsCount: 1456,
          dimensionsCrossed: ['dim-011', 'fmt-003', 'fmt-004'],
        },
        {
          description: 'Unlinked knowledge fragmentation across Confluence + Slack + Jira',
          patternsCount: 2234,
          dimensionsCrossed: ['dim-001', 'dim-011', 'fmt-001', 'fmt-002'],
        },
        {
          description: 'Context window overflow in multi-document synthesis (5+ sources × 8+ Slack replies)',
          patternsCount: 1923,
          dimensionsCrossed: ['dim-011', 'dim-020', 'dim-025'],
        },
        {
          description: 'Permission matrix cache staleness causing visibility errors',
          patternsCount: 987,
          dimensionsCrossed: ['dim-026', 'dim-001', 'dim-004'],
        },
      ],
      tierBreakdown: {
        simple: 20120,
        complex: 22634,
        reasoning: 20120,
      },
    },
    'faq-knowledge': {
      totalPatterns: 2840,
      reasoningChainCount: 12,
      crossSourceMismatchCount: 3,
      highRiskScenarioCount: 8,
      highRiskScenarios: [
        {
          description: 'Document version conflict (policy updated but old version still accessible)',
          patternsCount: 85,
          dimensionsCrossed: ['dim-001', 'dim-006', 'fmt-001'],
        },
        {
          description: 'Query ambiguity across categories (benefits = health vs 401k vs perks)',
          patternsCount: 284,
          dimensionsCrossed: ['dim-001', 'dim-018', 'dim-012'],
        },
        {
          description: 'Semantic search failure requiring keyword fallback (similarity score <60%)',
          patternsCount: 227,
          dimensionsCrossed: ['dim-001', 'tool-search', 'dim-012'],
        },
        {
          description: 'Missing document section (parental leave policy lacks stipend amount)',
          patternsCount: 142,
          dimensionsCrossed: ['dim-001', 'dim-006', 'dim-019'],
        },
        {
          description: 'OCR degradation in PDF policies (confidence <85% on scanned documents)',
          patternsCount: 96,
          dimensionsCrossed: ['fmt-004', 'tool-pdf', 'dim-001'],
        },
        {
          description: 'Cross-boundary question requiring multi-category synthesis (IT + HR + Travel)',
          patternsCount: 113,
          dimensionsCrossed: ['dim-001', 'dim-012', 'dim-018'],
        },
        {
          description: 'Escalation appropriateness uncertainty (should HR or domain expert handle)',
          patternsCount: 179,
          dimensionsCrossed: ['dim-001', 'dim-019', 'dim-020'],
        },
        {
          description: 'Confidence scoring below threshold but answer still necessary',
          patternsCount: 85,
          dimensionsCrossed: ['dim-001', 'dim-006', 'tool-search'],
        },
      ],
      tierBreakdown: {
        simple: 1193,
        complex: 1079,
        reasoning: 568,
      },
    },
  }

  return patternDatabase[tileId] || null
}

/**
 * Get all pattern data for all tiles
 */
export function getAllPatternDataV3(): Record<string, PatternSummaryV3> {
  const allTileIds = [
    'doc-intelligence',
    'saas-copilot',
    'research-comparison',
    'faq-knowledge',
  ]

  const result: Record<string, PatternSummaryV3> = {}

  for (const tileId of allTileIds) {
    const data = getPatternDataV3(tileId)
    if (data) {
      result[tileId] = data
    }
  }

  return result
}

/**
 * Utility: get total patterns across all tiles
 */
export function getTotalPatternsAcrossAllTiles(): number {
  const allData = getAllPatternDataV3()
  return Object.values(allData).reduce((sum, data) => sum + data.totalPatterns, 0)
}
