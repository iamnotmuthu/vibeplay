// ─── V3 Tile Resolver ───────────────────────────────────────────────────
// Maps real AGENT_TILE_MAP tileIds to V3 data file internal IDs.
// Each V3 data file was created independently and uses different internal keys.
// This resolver provides a consistent lookup layer for V3 stage components.
// ────────────────────────────────────────────────────────────────────────

// The 4 V3-supported tiles (from AGENT_TILE_MAP)
export const V3_SUPPORTED_TILES = [
  'doc-intelligence',    // → Invoice Processing Agent (Very Complex)
  'saas-copilot',        // → Enterprise RAG Copilot (Very Complex)
  'consumer-chat',       // → SaaS Customer Support Agent (Medium)
  'faq-knowledge',       // → FAQ Knowledge Agent (Simple)
] as const

export type V3SupportedTile = typeof V3_SUPPORTED_TILES[number]

export function isV3SupportedTile(tileId: string): tileId is V3SupportedTile {
  return (V3_SUPPORTED_TILES as readonly string[]).includes(tileId)
}

// Per-data-file mappings: real tileId → internal data file key
const MAPPINGS: Record<string, Record<string, string>> = {
  destinationPreview: {
    'doc-intelligence': 'saas-copilot',
    'saas-copilot': 'coding-agent',
    'consumer-chat': 'saas-copilot-support',
    'faq-knowledge': 'faq-knowledge',
  },
  sharpeningQuestions: {
    'doc-intelligence': 'saas-copilot',
    'saas-copilot': 'coding-agent',
    'consumer-chat': 'saas-copilot-support',
    'faq-knowledge': 'faq-knowledge',
  },
  contextDefinition: {
    'doc-intelligence': 'invoice-processing',
    'saas-copilot': 'enterprise-rag',
    'consumer-chat': 'saas-customer-support',
    'faq-knowledge': 'faq-knowledge',
  },
  structuralDiscovery: {
    'doc-intelligence': 'invoice-processing',
    'saas-copilot': 'enterprise-rag',
    'consumer-chat': 'saas-customer-support',
    'faq-knowledge': 'faq-knowledge',
  },
  patternData: {
    'doc-intelligence': 'doc-intelligence',
    'saas-copilot': 'saas-copilot',
    'consumer-chat': 'research-comparison',
    'faq-knowledge': 'faq-knowledge',
  },
  syntheticTest: {
    'doc-intelligence': 'doc-intelligence',
    'saas-copilot': 'saas-copilot',
    'consumer-chat': 'research-comparison',
    'faq-knowledge': 'faq-knowledge',
  },
  evaluationMetrics: {
    'doc-intelligence': 'doc-intelligence',
    'saas-copilot': 'saas-copilot',
    'consumer-chat': 'research-comparison',
    'faq-knowledge': 'faq-knowledge',
  },
  metaPatterns: {
    'doc-intelligence': 'invoice-processing',
    'saas-copilot': 'enterprise-rag',
    'consumer-chat': 'saas-support',
    'faq-knowledge': 'faq-knowledge',
  },
  architecture: {
    'doc-intelligence': 'invoice-processing',
    'saas-copilot': 'enterprise-rag',
    'consumer-chat': 'saas-support',
    'faq-knowledge': 'faq-knowledge',
  },
}

/**
 * Resolve a real AGENT_TILE_MAP tileId to the internal key used by a specific V3 data file.
 * @param tileId - The real tileId from the store (e.g., 'doc-intelligence')
 * @param dataSource - Which V3 data file to resolve for
 * @returns The mapped internal key, or the original tileId if no mapping exists
 */
export function resolveV3TileId(
  tileId: string,
  dataSource: keyof typeof MAPPINGS,
): string {
  return MAPPINGS[dataSource]?.[tileId] ?? tileId
}
