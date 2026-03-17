import type { AgentTile, AgentDomain, NarrativeBridge } from '@/store/agentTypes'

// ─── Agent Domains (industry verticals) ─────────────────────────────────

export const AGENT_DOMAINS: AgentDomain[] = [
  {
    id: 'technology-saas',
    label: 'Technology / SaaS',
    color: '#3b82f6',
    icon: 'Monitor',
    tagline: 'Incident response, customer success, DevOps triage',
  },
  {
    id: 'financial-services',
    label: 'Financial Services',
    color: '#10b981',
    icon: 'Landmark',
    tagline: 'Loan underwriting, fraud investigation, compliance',
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    color: '#ef4444',
    icon: 'HeartPulse',
    tagline: 'Care coordination, clinical documentation, patient monitoring',
  },
  {
    id: 'logistics-supply-chain',
    label: 'Logistics & Supply Chain',
    color: '#f97316',
    icon: 'Truck',
    tagline: 'Shipment disruption, warehouse coordination, procurement',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    color: '#8b5cf6',
    icon: 'Shield',
    tagline: 'Claims processing, underwriting risk, fraud detection',
  },
  {
    id: 'retail-ecommerce',
    label: 'Retail & E-commerce',
    color: '#f43f5e',
    icon: 'ShoppingCart',
    tagline: 'Order resolution, inventory rebalancing, merchandising',
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    color: '#6366f1',
    icon: 'Factory',
    tagline: 'Predictive maintenance, production scheduling, quality analysis',
  },
  {
    id: 'media-entertainment',
    label: 'Media & Entertainment',
    color: '#d946ef',
    icon: 'Film',
    tagline: 'Content moderation, distribution optimization, ad yield',
  },
  {
    id: 'hr-talent',
    label: 'HR & Talent',
    color: '#0ea5e9',
    icon: 'Users',
    tagline: 'Candidate screening, onboarding, employee support',
  },
  {
    id: 'marketing-advertising',
    label: 'Marketing & Advertising',
    color: '#14b8a6',
    icon: 'Megaphone',
    tagline: 'Campaign optimization, lead nurturing, market intelligence',
  },
]

export const AGENT_DOMAIN_MAP = Object.fromEntries(
  AGENT_DOMAINS.map((d) => [d.id, d])
) as Record<string, AgentDomain>

// ─── Ten Agent Tiles (Use Cases) ─────────────────────────────────────────
// Each tile maps to a domain from the Excel sheet "Common agent problems by domain"

export const AGENT_TILES: AgentTile[] = [
  // ── Invoice Processing Agent (Very Complex) ───────────────────────────
  {
    id: 'doc-intelligence',
    label: 'Invoice Processing Agent',
    shortLabel: 'Invoice Agent',
    domainId: 'financial-services',
    complexity: 'complex',
    complexityLabel: 'Very Complex',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    bgTint: 'rgba(16,185,129,0.06)',
    borderColor: 'rgba(16,185,129,0.2)',
    iconName: 'Landmark',
    description:
      'Processes invoices from multiple vendors (AWS, GCP, Staples), extracts costs, validates against purchase orders, and generates consolidated reports with trend analysis.',
    industry: 'Financial Services',
    badge: 'Very Complex · 8,640 interaction paths',
    goalStatement:
      'Process invoices from multiple vendors (AWS, GCP, Staples), extract costs, validate against purchase orders, and generate consolidated reports with trend analysis.',
    stageSubtitles: {
      goal: 'Multi-vendor invoice processing with PO validation',
      'context-definition': '8 tasks — extraction, validation, reconciliation',
      'context-dimensions': '5 data sources · 12 structural discoveries',
      'interaction-discovery': '8,640 interaction paths discovered',
      'agent-evaluation': '215 test scenarios across 3 trust levels',
      'solution-architecture': 'Dual-lane: retrieval + reasoning',
    },
  },

  // ── Enterprise RAG Copilot (Very Complex) ─────────────────────────────
  {
    id: 'saas-copilot',
    label: 'Enterprise RAG Copilot',
    shortLabel: 'RAG Copilot',
    domainId: 'technology-saas',
    complexity: 'complex',
    complexityLabel: 'Very Complex',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    bgTint: 'rgba(59,130,246,0.06)',
    borderColor: 'rgba(59,130,246,0.2)',
    iconName: 'Monitor',
    description:
      'Answers employee questions by searching across internal knowledge sources (Confluence, Slack, Google Drive, Jira, directory), correlating information, and handling access control.',
    industry: 'Technology / SaaS',
    badge: 'Very Complex · 2.8M interaction paths',
    goalStatement:
      'Answer employee questions by searching across internal knowledge sources (Confluence, Slack, Google Drive, Jira, directory), correlating information, handling access control, and detecting data freshness issues.',
    stageSubtitles: {
      goal: 'Multi-source enterprise knowledge search with access control',
      'context-definition': '6 tasks — search, correlate, filter, synthesize',
      'context-dimensions': '5 data sources · 8 structural discoveries',
      'interaction-discovery': '2.8M interaction paths discovered',
      'agent-evaluation': '198 test scenarios across 3 trust levels',
      'solution-architecture': 'Multi-source RAG with permission filtering',
    },
  },

  // ── SaaS Customer Support Agent (Medium) ──────────────────────────────
  {
    id: 'consumer-chat',
    label: 'SaaS Customer Support Agent',
    shortLabel: 'Support Agent',
    domainId: 'technology-saas',
    complexity: 'moderate',
    complexityLabel: 'Medium',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    bgTint: 'rgba(14,165,233,0.06)',
    borderColor: 'rgba(14,165,233,0.2)',
    iconName: 'Users',
    description:
      'Triages customer support tickets, searches knowledge base for self-service solutions, executes simple actions (password resets, plan upgrades), and routes complex issues to specialists.',
    industry: 'Technology / SaaS',
    badge: 'Medium · 8,640 interaction paths',
    goalStatement:
      'Triage customer support tickets from multiple channels, search knowledge base for self-service solutions, execute simple actions (password resets, plan upgrades), and route complex issues to specialists with context.',
    stageSubtitles: {
      goal: 'Multi-channel support triage with action execution',
      'context-definition': '6 tasks — triage, search, respond, execute',
      'context-dimensions': '3 data sources · 4 structural discoveries',
      'interaction-discovery': '8,640 interaction paths discovered',
      'agent-evaluation': '175 test scenarios across 2 trust levels',
      'solution-architecture': 'Cached-first pipeline with edge deployment',
    },
  },

  // ── FAQ Knowledge Agent (Simple) ──────────────────────────────────────
  {
    id: 'faq-knowledge',
    label: 'FAQ Knowledge Agent',
    shortLabel: 'FAQ Agent',
    domainId: 'hr-talent',
    complexity: 'simple',
    complexityLabel: 'Simple',
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    bgTint: 'rgba(244,63,94,0.06)',
    borderColor: 'rgba(244,63,94,0.2)',
    iconName: 'ShoppingCart',
    description:
      'Answers employee questions from a curated knowledge base of company policies, procedures, and reference documents. Provides confident answers with source citations and escalates edge cases.',
    industry: 'HR & Talent',
    badge: 'Simple · 2,840 interaction paths',
    goalStatement:
      'Answer employee questions from a curated knowledge base of company policies, procedures, and reference documents. Provide confident answers with source citations and escalate edge cases.',
    stageSubtitles: {
      goal: 'Curated knowledge base with confidence scoring',
      'context-definition': '3 tasks — understand, search, answer',
      'context-dimensions': '3 data sources · 2 structural discoveries',
      'interaction-discovery': '2,840 interaction paths discovered',
      'agent-evaluation': '128 test scenarios across 3 trust levels',
      'solution-architecture': 'Single-lane RAG pipeline',
    },
  },
]

// ─── Tile lookup map ──────────────────────────────────────────────────────

export const AGENT_TILE_MAP = Object.fromEntries(
  AGENT_TILES.map((t) => [t.id, t])
) as Record<string, AgentTile>

// ─── Tiles grouped by domain ──────────────────────────────────────────────

export function getTilesByDomain(domainId: string): AgentTile[] {
  return AGENT_TILES.filter((t) => t.domainId === domainId)
}

// ─── Narrative Bridges ────────────────────────────────────────────────────
// Each bridge has business and technical variants, plus complexity variants.

export const NARRATIVE_BRIDGES: NarrativeBridge[] = [
  {
    from: 'goal',
    to: 'context-definition',
    text: 'Your goal has been decomposed. Now generating the step-by-step instructions.',
    complexText:
      'A complex goal with multiple domains. The system generated a detailed instruction set with escalation paths.',
    technicalText:
      'Goal decomposed into action graph. Generating instruction graph with tool invocations and routing rules.',
    technicalComplexText:
      'Multi-domain goal decomposed. Generating instruction graph with clinical decision paths, routing rules, and escalation conditions.',
  },
  {
    from: 'context-definition',
    to: 'context-dimensions',
    text: 'Context defined. Now mapping your data landscape and the response requirements for each user profile.',
    complexText:
      'Eight context steps defined. Now mapping data sources, formats, and output needs across all user profiles.',
    technicalText:
      'Context graph finalized. Mapping data type distribution and response format requirements per profile.',
    technicalComplexText:
      'Eight-step context graph locked. Mapping full data landscape with multi-profile response requirements.',
  },
  {
    from: 'context-dimensions',
    to: 'interaction-discovery',
    text: 'Dimensions mapped. Now discovering every interaction path \u2014 the queries and workflows your agent will handle.',
    complexText:
      'Full dimensional landscape mapped. Interaction discovery will reveal over a hundred distinct query paths and workflow branches.',
    technicalText:
      'Dimensional analysis complete. Running interaction path enumeration across all data and response intersections.',
    technicalComplexText:
      'Full dimensional landscape mapped. Enumerating interaction paths across data-response intersections \u2014 expect 100+ distinct paths.',
  },
  {
    from: 'interaction-discovery',
    to: 'agent-evaluation',
    text: 'Every interaction path classified by confidence. Now testing them all \u2014 before the agent exists.',
    complexText:
      'Over a hundred interaction paths classified across three confidence zones. Validation begins.',
    technicalText:
      'Interaction paths enumerated and confidence-scored. Running validation suite with synthetic test data.',
    technicalComplexText:
      '127 interaction paths across green/amber/red confidence zones. Running 342-scenario validation suite.',
  },
  {
    from: 'agent-evaluation',
    to: 'solution-architecture',
    text: 'Validation complete. Now composing the right architecture \u2014 which components activate for each trust level.',
    complexText:
      'Hundreds of test scenarios run. The architecture must handle autonomous, supervised, and escalation paths differently.',
    technicalText:
      'Validation suite passed. Composing architecture lanes per trust boundary with component activation ordering.',
    technicalComplexText:
      '342 scenarios validated. Composing multi-lane architecture: autonomous pipeline, supervised pipeline, and escalation coordinator.',
  },
]

// ─── Bridge lookup ────────────────────────────────────────────────────────

export function getBridge(
  from: string,
  to: string,
  tileComplexity: string,
  viewMode: 'business' | 'technical' = 'business'
): string {
  const bridge = NARRATIVE_BRIDGES.find(
    (b) => b.from === from && b.to === to
  )
  if (!bridge) return 'Processing...'

  const isComplex = tileComplexity === 'complex' || tileComplexity === 'moderate-complex'

  if (viewMode === 'technical') {
    if (isComplex && bridge.technicalComplexText) return bridge.technicalComplexText
    if (bridge.technicalText) return bridge.technicalText
  }

  if (isComplex && bridge.complexText) return bridge.complexText
  return bridge.text
}
