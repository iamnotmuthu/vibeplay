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
  // ── Technology / SaaS (2 tiles) ────────────────────────────────────────
  {
    id: 'saas-copilot',
    label: 'Customer Success Monitoring',
    shortLabel: 'Success Monitor',
    domainId: 'technology-saas',
    complexity: 'moderate',
    complexityLabel: 'Moderate',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    bgTint: 'rgba(59,130,246,0.06)',
    borderColor: 'rgba(59,130,246,0.2)',
    iconName: 'Monitor',
    description:
      'Monitors product usage signals, detects churn risk, and triggers retention actions inside your SaaS platform. Tool-calling with guardrails.',
    industry: 'Technology / SaaS',
    badge: 'Moderate · 74 interaction paths',
    goalStatement:
      'Build an agent that monitors customer usage patterns, detects churn signals, and triggers proactive retention actions through your product.',
    stageSubtitles: {
      goal: 'In-product tool-calling assistant',
      'context-definition': '8 steps — tool invocation with confirmation gates',
      'context-dimensions': '16 of 26 components activated',
      'interaction-discovery': '74 interaction paths discovered',
      'agent-evaluation': '198 test scenarios across 3 trust levels',
      'solution-architecture': 'Tool-first pipeline with confirmation layer',
    },
  },
  {
    id: 'coding-agent',
    label: 'Incident Response Automation',
    shortLabel: 'Incident Agent',
    domainId: 'technology-saas',
    complexity: 'complex',
    complexityLabel: 'Complex',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    bgTint: 'rgba(59,130,246,0.06)',
    borderColor: 'rgba(59,130,246,0.2)',
    iconName: 'Monitor',
    description:
      'Detects production outages, diagnoses root causes across logs and metrics, and triggers automated remediation. Context-aware across entire system stacks with sandboxed execution.',
    industry: 'Technology / SaaS',
    badge: 'Complex · 112 interaction paths',
    goalStatement:
      'Build an agent that detects outages, correlates logs and metrics to diagnose root cause, and triggers automated remediation — with safe rollback.',
    stageSubtitles: {
      goal: 'Full-stack incident response agent',
      'context-definition': '8 steps — log context + sandboxed execution',
      'context-dimensions': '24 of 26 components activated',
      'interaction-discovery': '112 interaction paths discovered',
      'agent-evaluation': '318 test scenarios across 4 trust levels',
      'solution-architecture': 'Code-aware pipeline with sandbox layer',
    },
  },

  // ── Financial Services ─────────────────────────────────────────────────
  {
    id: 'doc-intelligence',
    label: 'Loan Underwriting Automation',
    shortLabel: 'Underwriting Agent',
    domainId: 'financial-services',
    complexity: 'moderate',
    complexityLabel: 'Moderate',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    bgTint: 'rgba(16,185,129,0.06)',
    borderColor: 'rgba(16,185,129,0.2)',
    iconName: 'Landmark',
    description:
      'Collects loan documents, validates applicant data, extracts key terms, and coordinates the multi-step approval workflow. Multi-format parsing with cross-reference capability.',
    industry: 'Financial Services',
    badge: 'Moderate · 68 interaction paths',
    goalStatement:
      'Build an agent that processes loan applications — collecting documents, extracting key financial data, validating eligibility, and coordinating the approval workflow.',
    stageSubtitles: {
      goal: 'Multi-format extraction and analysis',
      'context-definition': '8 steps — extraction + reasoning chains',
      'context-dimensions': '18 of 26 components activated',
      'interaction-discovery': '68 interaction paths discovered',
      'agent-evaluation': '215 test scenarios across 3 trust levels',
      'solution-architecture': 'Dual-lane: retrieval + reasoning',
    },
  },

  // ── Healthcare ─────────────────────────────────────────────────────────
  {
    id: 'decision-workflow',
    label: 'Care Coordination Agent',
    shortLabel: 'Care Agent',
    domainId: 'healthcare',
    complexity: 'complex',
    complexityLabel: 'Complex',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    bgTint: 'rgba(239,68,68,0.06)',
    borderColor: 'rgba(239,68,68,0.2)',
    iconName: 'HeartPulse',
    description:
      'Manages patient appointments, follow-ups, referrals between providers, insurance verification, and emergency triage. The full stack — decisions, workflows, and human escalation.',
    industry: 'Healthcare',
    badge: 'Complex · 127 interaction paths',
    goalStatement:
      'Build a care coordination agent that manages appointments, referrals, insurance verification, emergency triage, and post-procedure follow-ups across providers.',
    stageSubtitles: {
      goal: 'Multi-domain clinical + administrative goal',
      'context-definition': '8 steps — clinical decision paths with escalation',
      'context-dimensions': '26 of 26 components activated',
      'interaction-discovery': '127 interaction paths discovered',
      'agent-evaluation': '342 test scenarios across 4 trust levels',
      'solution-architecture': 'Multi-agent coordinator with human routing',
    },
  },

  // ── Logistics & Supply Chain ───────────────────────────────────────────
  {
    id: 'ops-agent',
    label: 'Shipment Disruption Manager',
    shortLabel: 'Shipment Agent',
    domainId: 'logistics-supply-chain',
    complexity: 'moderate-complex',
    complexityLabel: 'Moderate-Complex',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    bgTint: 'rgba(249,115,22,0.06)',
    borderColor: 'rgba(249,115,22,0.2)',
    iconName: 'Truck',
    description:
      'Detects shipment delays across carriers, reroutes packages, updates customer ETAs, and coordinates with warehouse operations. Async orchestration with progress tracking.',
    industry: 'Logistics & Supply Chain',
    badge: 'Moderate-Complex · 83 interaction paths',
    goalStatement:
      'Build an agent that detects shipment disruptions, automatically reroutes across carriers, updates customer ETAs, and coordinates warehouse re-allocation.',
    stageSubtitles: {
      goal: 'Async task orchestration with monitoring',
      'context-definition': '8 steps — async workflow with checkpoints',
      'context-dimensions': '20 of 26 components activated',
      'interaction-discovery': '83 interaction paths discovered',
      'agent-evaluation': '256 test scenarios across 3 trust levels',
      'solution-architecture': 'Async orchestrator with progress bus',
    },
  },

  // ── Insurance ──────────────────────────────────────────────────────────
  {
    id: 'research-comparison',
    label: 'Underwriting Risk Analysis',
    shortLabel: 'Risk Analyst',
    domainId: 'insurance',
    complexity: 'moderate-complex',
    complexityLabel: 'Moderate-Complex',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    bgTint: 'rgba(139,92,246,0.06)',
    borderColor: 'rgba(139,92,246,0.2)',
    iconName: 'Shield',
    description:
      'Gathers risk data from multiple sources, compares coverage options, and produces structured underwriting recommendations. Multi-hop reasoning with evidence synthesis.',
    industry: 'Insurance',
    badge: 'Moderate-Complex · 91 interaction paths',
    goalStatement:
      'Build an agent that gathers risk data across property, liability, and claims history — then generates a ranked coverage recommendation for underwriters.',
    stageSubtitles: {
      goal: 'Multi-source research with structured output',
      'context-definition': '8 steps — search + compare + synthesize',
      'context-dimensions': '22 of 26 components activated',
      'interaction-discovery': '91 interaction paths discovered',
      'agent-evaluation': '287 test scenarios across 3 trust levels',
      'solution-architecture': 'Multi-agent research pipeline',
    },
  },

  // ── Retail & E-commerce ────────────────────────────────────────────────
  {
    id: 'faq-knowledge',
    label: 'Order Issue Resolution',
    shortLabel: 'Order Agent',
    domainId: 'retail-ecommerce',
    complexity: 'simple',
    complexityLabel: 'Simple',
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    bgTint: 'rgba(244,63,94,0.06)',
    borderColor: 'rgba(244,63,94,0.2)',
    iconName: 'ShoppingCart',
    description:
      'Handles delivery problems, processes refunds, coordinates with logistics carriers, and answers customer order inquiries. Simple retrieval with clear trust boundaries.',
    industry: 'Retail & E-commerce',
    badge: 'Simple · 42 interaction paths',
    goalStatement:
      'Build an agent that resolves order issues — tracking delivery problems, processing refunds, coordinating with carriers, and answering order status questions.',
    stageSubtitles: {
      goal: 'A straightforward knowledge retrieval goal',
      'context-definition': '8 steps — mostly direct lookups',
      'context-dimensions': '12 of 26 components activated',
      'interaction-discovery': '42 interaction paths discovered',
      'agent-evaluation': '128 test scenarios across 3 trust levels',
      'solution-architecture': 'Single-lane RAG pipeline',
    },
  },

  // ── Manufacturing ──────────────────────────────────────────────────────
  {
    id: 'onprem-assistant',
    label: 'Predictive Maintenance Agent',
    shortLabel: 'Maintenance Agent',
    domainId: 'manufacturing',
    complexity: 'moderate-complex',
    complexityLabel: 'Moderate-Complex',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    bgTint: 'rgba(99,102,241,0.06)',
    borderColor: 'rgba(99,102,241,0.2)',
    iconName: 'Factory',
    description:
      'Detects equipment failures early from sensor data, schedules maintenance automatically, and operates on-premises with air-gapped data access and local inference. No cloud calls.',
    industry: 'Manufacturing',
    badge: 'Moderate-Complex · 58 interaction paths',
    goalStatement:
      'Build a predictive maintenance agent for factory equipment — local inference on sensor data, automated maintenance scheduling, no external API calls.',
    stageSubtitles: {
      goal: 'Air-gapped predictive maintenance',
      'context-definition': '8 steps — local inference with strict access control',
      'context-dimensions': '15 of 26 components activated',
      'interaction-discovery': '58 interaction paths discovered',
      'agent-evaluation': '187 test scenarios across 3 trust levels',
      'solution-architecture': 'On-prem single-node with local RAG',
    },
  },

  // ── Media & Entertainment ──────────────────────────────────────────────
  {
    id: 'multimodal-agent',
    label: 'Content Moderation Agent',
    shortLabel: 'Moderation Agent',
    domainId: 'media-entertainment',
    complexity: 'complex',
    complexityLabel: 'Complex',
    color: '#d946ef',
    gradient: 'linear-gradient(135deg, #d946ef, #c026d3)',
    bgTint: 'rgba(217,70,239,0.06)',
    borderColor: 'rgba(217,70,239,0.2)',
    iconName: 'Film',
    description:
      'Reviews flagged content across text, images, audio, and video — enforcing platform policies with cross-modal reasoning and human escalation for edge cases.',
    industry: 'Media & Entertainment',
    badge: 'Complex · 105 interaction paths',
    goalStatement:
      'Build a content moderation agent that reviews flagged text, images, audio, and video — enforcing platform policies with cross-modal reasoning and escalation.',
    stageSubtitles: {
      goal: 'Cross-modal understanding and policy enforcement',
      'context-definition': '8 steps — multi-format processing pipeline',
      'context-dimensions': '23 of 26 components activated',
      'interaction-discovery': '105 interaction paths discovered',
      'agent-evaluation': '296 test scenarios across 3 trust levels',
      'solution-architecture': 'Multi-modal orchestrator with format adapters',
    },
  },

  // ── HR & Talent ────────────────────────────────────────────────────────
  {
    id: 'consumer-chat',
    label: 'Employee Support Agent',
    shortLabel: 'HR Agent',
    domainId: 'hr-talent',
    complexity: 'moderate',
    complexityLabel: 'Moderate',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    bgTint: 'rgba(14,165,233,0.06)',
    borderColor: 'rgba(14,165,233,0.2)',
    iconName: 'Users',
    description:
      'Resolves employee queries about policies, benefits, PTO, and payroll at scale — handling thousands of daily interactions with personalized responses and graceful escalation.',
    industry: 'HR & Talent',
    badge: 'Moderate · 64 interaction paths',
    goalStatement:
      'Build an employee support agent that answers HR policy questions, processes benefits inquiries, and handles PTO requests at scale with personalized responses.',
    stageSubtitles: {
      goal: 'High-throughput personalized support',
      'context-definition': '8 steps — fast retrieval with personalization',
      'context-dimensions': '14 of 26 components activated',
      'interaction-discovery': '64 interaction paths discovered',
      'agent-evaluation': '175 test scenarios across 2 trust levels',
      'solution-architecture': 'Cached-first pipeline with edge deployment',
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
