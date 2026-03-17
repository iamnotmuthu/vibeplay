import type { PatternsPayload, DimensionPattern } from '@/store/agentTypes'
import { buildPatternsPayload } from './patternsPayloadBuilder'
import { getDimensionAnalysisDataV3 } from './dimensionAnalysisDataV3'
import { getDimensionAnalysisData } from './dimensionAnalysisData'

// ============================================================================
// COMBINATORIAL PATTERNS — Full Power-Set Generation
// ============================================================================
// All patterns are auto-generated from dimension analysis data using
// Task × DataPowerSet × UserProfile combinatorics.
//
// For N data dimensions, the power set produces 2^N - 1 non-empty subsets.
// Each subset × task × user profile = one candidate pattern.
// Invalid combos (disconnected data domains) are filtered out.
//
// Tile dimension counts:
//   faq-knowledge:       10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   saas-copilot:        10T × 5D × 6UP → 31 data subsets → up to 1,860 combos
//   research-comparison: 10T × 5D × 6UP → 31 data subsets → up to 1,860 combos
//   doc-intelligence:    10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   decision-workflow:   10T × 5D × 6UP → 31 data subsets → up to 1,860 combos
//   coding-agent:        10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   ops-agent:           10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   onprem-assistant:    10T × 4D × 6UP → 15 data subsets → up to 900 combos
//   multimodal-agent:    10T × 5D × 6UP → 31 data subsets → up to 1,860 combos
//   consumer-chat:       10T × 4D × 6UP → 15 data subsets → up to 900 combos
//
// After validity filtering, actual pattern counts will be lower.
// ============================================================================

interface TileMeta {
  agentName: string
  description: string
}

const TILE_META: Record<string, TileMeta> = {
  // V3-enhanced tiles (use V3 analysis data)
  'doc-intelligence': {
    agentName: 'Invoice Processing Agent',
    description: 'Processes invoices from multiple vendors (AWS, GCP, Staples) to extract line items, validate against POs, reconcile discrepancies, code to cost centers, and route for approval or payment',
  },
  'saas-copilot': {
    agentName: 'Enterprise RAG Copilot',
    description: 'Answers employee questions by searching across internal knowledge sources (policies, documentation, FAQs) to provide accurate, cited answers with access control and audit logging',
  },
  'consumer-chat': {
    agentName: 'SaaS Customer Support Agent',
    description: 'Triages customer support tickets by categorizing issues, extracting symptoms, routing to relevant team, suggesting self-service resolution paths, and escalating critical cases',
  },
  'faq-knowledge': {
    agentName: 'Order Issue Resolution Agent',
    description: 'Handles order tracking, delivery problem resolution, refund processing, return coordination, and carrier investigations across retail and e-commerce',
  },
  // Original tiles (fall back to original analysis data)
  'research-comparison': {
    agentName: 'Underwriting Risk Analysis Agent',
    description: 'Handles property risk assessment, claims history analysis, premium calculation, coverage recommendation, and regulatory compliance for insurance underwriting',
  },
  'decision-workflow': {
    agentName: 'Care Coordination Agent',
    description: 'Manages healthcare system operations including appointment scheduling, referral routing, insurance verification, emergency triage, prior authorization, and post-procedure follow-up coordination across providers',
  },
  'coding-agent': {
    agentName: 'Incident Response Agent',
    description: 'Detects outages, correlates logs and metrics for root cause diagnosis, executes remediation runbooks, and performs safe rollbacks with blast radius assessment',
  },
  'ops-agent': {
    agentName: 'Shipment Disruption Manager',
    description: 'Detects shipment disruptions, reroutes across carriers, updates customer ETAs, coordinates warehouse reallocation, and manages customs exceptions',
  },
  'onprem-assistant': {
    agentName: 'Predictive Maintenance Agent',
    description: 'Ingests real-time equipment sensor data, detects anomalies, predicts failures within a 7-day window, auto-generates work orders, and schedules preventive maintenance with spare-parts optimization',
  },
  'multimodal-agent': {
    agentName: 'Content Moderation Agent',
    description: 'Reviews flagged text, images, audio, and video against platform policies, classifies policy violations, auto-removes clear violations, routes medium-confidence cases to human moderators, and handles appeals',
  },
}

// ============================================================================
// HAND-CRAFTED FUZZY PATTERNS — Human Intervention Required
// ============================================================================
// Each tile gets 2 fuzzy patterns using its actual dimension IDs.
// These represent edge-case scenarios where the agent cannot proceed
// autonomously and must escalate to a human operator.
// ============================================================================

const FUZZY_COMPONENTS = [
  'api-gateway', 'auth', 'input-validation', 'rag', 'cross-encoder-reranking',
  'workflow-orchestrator', 'failure-handling', 'output-guardrails',
  'policy-enforcement', 'logging-analytics',
]

const FUZZY_OVERRIDE_PATTERNS: Record<string, DimensionPattern[]> = {}

// ============================================================================
// LAZY PAYLOAD CACHE — built on first access per tile
// ============================================================================

const payloadCache = new Map<string, PatternsPayload>()

export function getCombinatorialPatternsData(
  tileId: string
): PatternsPayload | null {
  // Return cached if available
  if (payloadCache.has(tileId)) return payloadCache.get(tileId)!

  const analysis = getDimensionAnalysisDataV3(tileId) ?? getDimensionAnalysisData(tileId)
  const meta = TILE_META[tileId]
  if (!analysis || !meta) return null

  // Build payload with empty patterns array → triggers full power-set generation
  const payload = buildPatternsPayload(analysis, [], meta.agentName, meta.description)

  // Inject hand-crafted fuzzy patterns if the tile has none from auto-generation
  const fuzzyOverrides = FUZZY_OVERRIDE_PATTERNS[tileId]
  if (fuzzyOverrides && fuzzyOverrides.length > 0 && payload.tierBreakdown.fuzzy === 0) {
    payload.patterns.push(...fuzzyOverrides)
    payload.validPatterns += fuzzyOverrides.length
    payload.tierBreakdown.fuzzy += fuzzyOverrides.length
    // Register the new data combo IDs so the matrix picks them up
    for (const fp of fuzzyOverrides) {
      if (!payload.dataDimensions.includes(fp.dataDimensionIds.join('+'))) {
        payload.dataDimensions.push(fp.dataDimensionIds.join('+'))
      }
      if (fp.toolStateDimensionId && !payload.toolStateDimensions.includes(fp.toolStateDimensionId)) {
        payload.toolStateDimensions.push(fp.toolStateDimensionId)
      }
    }
  }

  payloadCache.set(tileId, payload)
  return payload
}
