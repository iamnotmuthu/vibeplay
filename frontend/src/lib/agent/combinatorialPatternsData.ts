import type { PatternsPayload } from '@/store/agentTypes'
import { buildPatternsPayload } from './patternsPayloadBuilder'
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
  'faq-knowledge': {
    agentName: 'FAQ & Knowledge Agent',
    description: 'Handles product inquiries, pricing questions, policy explanations, troubleshooting, and knowledge gap detection across customer self-service and agent-assisted channels',
  },
  'saas-copilot': {
    agentName: 'SaaS Copilot',
    description: 'Assists with dashboard navigation, feature guidance, data export, workflow automation, API integration, and admin configuration for B2B SaaS platforms',
  },
  'research-comparison': {
    agentName: 'Research & Comparison Agent',
    description: 'Handles literature search, evidence collection, synthesis, vendor evaluation, and research gap identification across academic and industry sources',
  },
  'doc-intelligence': {
    agentName: 'Document Intelligence Agent',
    description: 'Handles invoice classification, field extraction, cost aggregation, anomaly detection, and compliance checking across multi-cloud billing documents',
  },
  'decision-workflow': {
    agentName: 'Decision Workflow Agent',
    description: 'Manages dental clinic operations including appointment scheduling, insurance verification, clinical triage, patient intake, and treatment cost estimation',
  },
  'coding-agent': {
    agentName: 'Coding Agent',
    description: 'Handles feature implementation, bug diagnosis, test generation, code refactoring, API design, and architecture assessment across codebases',
  },
  'ops-agent': {
    agentName: 'Ops & Data Pipeline Agent',
    description: 'Manages job scheduling, data migration, progress monitoring, error triage, resource allocation, and SLA tracking for data operations',
  },
  'onprem-assistant': {
    agentName: 'On-Prem Secure Assistant',
    description: 'Handles document classification, sensitivity labeling, compliance validation, audit trail review, and encryption verification in air-gapped environments',
  },
  'multimodal-agent': {
    agentName: 'Multimodal Agent',
    description: 'Processes video transcription, image captioning, audio extraction, cross-modal synthesis, and accessibility output across multimedia content',
  },
  'consumer-chat': {
    agentName: 'Consumer Chat Agent',
    description: 'Handles order tracking, product recommendations, returns processing, FAQ answering, sentiment detection, and loyalty programs for consumer interactions',
  },
}

// ============================================================================
// LAZY PAYLOAD CACHE — built on first access per tile
// ============================================================================

const payloadCache = new Map<string, PatternsPayload>()

export function getCombinatorialPatternsData(
  tileId: string
): PatternsPayload | null {
  // Return cached if available
  if (payloadCache.has(tileId)) return payloadCache.get(tileId)!

  const analysis = getDimensionAnalysisData(tileId)
  const meta = TILE_META[tileId]
  if (!analysis || !meta) return null

  // Build payload with empty patterns array → triggers full power-set generation
  const payload = buildPatternsPayload(analysis, [], meta.agentName, meta.description)
  payloadCache.set(tileId, payload)
  return payload
}
