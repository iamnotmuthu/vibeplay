import type { AgentTile, NarrativeBridge } from '@/store/agentTypes'

// ─── Ten Agent Tiles (Use Cases A-J) ─────────────────────────────────────

export const AGENT_TILES: AgentTile[] = [
  {
    id: 'faq-knowledge',
    label: 'Customer Q&A Bot',
    shortLabel: 'Q&A Bot',
    complexity: 'simple',
    complexityLabel: 'Simple',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    bgTint: 'rgba(16,185,129,0.06)',
    borderColor: 'rgba(16,185,129,0.2)',
    iconName: 'MessageCircleQuestion',
    description:
      'A knowledge base agent that handles customer FAQs, product questions, and policy lookups. Simple retrieval with clear trust boundaries.',
    industry: 'Customer Support',
    badge: 'Simple \u00b7 42 interaction paths',
    goalStatement:
      'Build an agent that answers customer questions about our product, policies, and pricing using our existing knowledge base.',
    stageSubtitles: {
      goal: 'A straightforward knowledge retrieval goal',
      'context-definition': '8 steps \u2014 mostly direct lookups',
      'context-dimensions': '12 of 26 components activated',
      'interaction-discovery': '42 interaction paths discovered',
      'agent-evaluation': '128 test scenarios across 3 trust levels',
      'solution-architecture': 'Single-lane RAG pipeline',
    },
  },
  {
    id: 'doc-intelligence',
    label: 'Document Reader & Analyzer',
    shortLabel: 'Doc Analyzer',
    complexity: 'moderate',
    complexityLabel: 'Moderate',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    bgTint: 'rgba(59,130,246,0.06)',
    borderColor: 'rgba(59,130,246,0.2)',
    iconName: 'FileSearch',
    description:
      'An agent that extracts, classifies, and summarizes information from contracts, invoices, and reports. Multi-format parsing with cross-reference capability.',
    industry: 'Legal / Finance',
    badge: 'Moderate \u00b7 68 interaction paths',
    goalStatement:
      'Build an agent that processes incoming contracts and invoices \u2014 extracting key terms, flagging risks, and generating summary reports.',
    stageSubtitles: {
      goal: 'Multi-format extraction and analysis',
      'context-definition': '8 steps \u2014 extraction + reasoning chains',
      'context-dimensions': '18 of 26 components activated',
      'interaction-discovery': '68 interaction paths discovered',
      'agent-evaluation': '215 test scenarios across 3 trust levels',
      'solution-architecture': 'Dual-lane: retrieval + reasoning',
    },
  },
  {
    id: 'research-comparison',
    label: 'Research & Compare Assistant',
    shortLabel: 'Research Bot',
    complexity: 'moderate-complex',
    complexityLabel: 'Moderate-Complex',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    bgTint: 'rgba(139,92,246,0.06)',
    borderColor: 'rgba(139,92,246,0.2)',
    iconName: 'GitCompare',
    description:
      'An agent that researches multiple sources, compares options, and produces structured recommendation reports. Multi-hop reasoning with evidence synthesis.',
    industry: 'Procurement / Strategy',
    badge: 'Moderate-Complex \u00b7 91 interaction paths',
    goalStatement:
      'Build an agent that researches vendor options, compares pricing and capabilities, and generates a ranked recommendation report for procurement decisions.',
    stageSubtitles: {
      goal: 'Multi-source research with structured output',
      'context-definition': '8 steps \u2014 search + compare + synthesize',
      'context-dimensions': '22 of 26 components activated',
      'interaction-discovery': '91 interaction paths discovered',
      'agent-evaluation': '287 test scenarios across 3 trust levels',
      'solution-architecture': 'Multi-agent research pipeline',
    },
  },
  {
    id: 'decision-workflow',
    label: 'Patient Support & Scheduling',
    shortLabel: 'Patient Bot',
    complexity: 'complex',
    complexityLabel: 'Complex',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    bgTint: 'rgba(239,68,68,0.06)',
    borderColor: 'rgba(239,68,68,0.2)',
    iconName: 'Workflow',
    description:
      'A dental patient support agent that handles appointment scheduling, insurance verification, treatment plan inquiries, and emergency triage. The full stack \u2014 decisions, workflows, and human escalation.',
    industry: 'Healthcare / Dental',
    badge: 'Complex \u00b7 127 interaction paths',
    goalStatement:
      'Build a patient support agent for a dental practice that handles appointments, insurance, treatment plans, emergency triage, and post-procedure follow-ups.',
    stageSubtitles: {
      goal: 'Multi-domain clinical + administrative goal',
      'context-definition': '8 steps \u2014 clinical decision paths with escalation',
      'context-dimensions': '26 of 26 components activated',
      'interaction-discovery': '127 interaction paths discovered',
      'agent-evaluation': '342 test scenarios across 4 trust levels',
      'solution-architecture': 'Multi-agent coordinator with human routing',
    },
  },
  {
    id: 'saas-copilot',
    label: 'In-App Product Assistant',
    shortLabel: 'Product Assistant',
    complexity: 'moderate',
    complexityLabel: 'Moderate',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    bgTint: 'rgba(14,165,233,0.06)',
    borderColor: 'rgba(14,165,233,0.2)',
    iconName: 'Wrench',
    description:
      'An in-app assistant that takes actions inside your SaaS product — creating records, running reports, updating settings. Tool-calling with guardrails.',
    industry: 'SaaS / Product',
    badge: 'Moderate · 74 interaction paths',
    goalStatement:
      'Build a copilot that helps users navigate our SaaS platform — creating records, generating reports, and updating configurations through natural language.',
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
    id: 'ops-agent',
    label: 'Background Task Manager',
    shortLabel: 'Task Manager',
    complexity: 'moderate-complex',
    complexityLabel: 'Moderate-Complex',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    bgTint: 'rgba(249,115,22,0.06)',
    borderColor: 'rgba(249,115,22,0.2)',
    iconName: 'Timer',
    description:
      'An agent that manages long-running background tasks — batch processing, data migrations, scheduled reports. Async orchestration with progress tracking.',
    industry: 'DevOps / Data Engineering',
    badge: 'Moderate-Complex · 83 interaction paths',
    goalStatement:
      'Build an agent that manages overnight batch jobs, data pipeline orchestration, and scheduled report generation with real-time status updates.',
    stageSubtitles: {
      goal: 'Async task orchestration with monitoring',
      'context-definition': '8 steps — async workflow with checkpoints',
      'context-dimensions': '20 of 26 components activated',
      'interaction-discovery': '83 interaction paths discovered',
      'agent-evaluation': '256 test scenarios across 3 trust levels',
      'solution-architecture': 'Async orchestrator with progress bus',
    },
  },
  {
    id: 'coding-agent',
    label: 'AI Coding Assistant',
    shortLabel: 'Code Assistant',
    complexity: 'complex',
    complexityLabel: 'Complex',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    bgTint: 'rgba(20,184,166,0.06)',
    borderColor: 'rgba(20,184,166,0.2)',
    iconName: 'Code2',
    description:
      'A developer assistant that writes, reviews, debugs, and refactors code. Context-aware across entire codebases with sandboxed execution.',
    industry: 'Software Engineering',
    badge: 'Complex · 112 interaction paths',
    goalStatement:
      'Build a coding agent that assists developers with code generation, review, debugging, and refactoring — with full codebase context and safe execution.',
    stageSubtitles: {
      goal: 'Full-stack development assistant',
      'context-definition': '8 steps — code context + sandboxed execution',
      'context-dimensions': '24 of 26 components activated',
      'interaction-discovery': '112 interaction paths discovered',
      'agent-evaluation': '318 test scenarios across 4 trust levels',
      'solution-architecture': 'Code-aware pipeline with sandbox layer',
    },
  },
  {
    id: 'onprem-assistant',
    label: 'Private & Secure Assistant',
    shortLabel: 'Secure Assistant',
    complexity: 'moderate-complex',
    complexityLabel: 'Moderate-Complex',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    bgTint: 'rgba(99,102,241,0.06)',
    borderColor: 'rgba(99,102,241,0.2)',
    iconName: 'Shield',
    description:
      'An agent deployed on-premises with air-gapped data access, local model inference, and strict data residency compliance. No cloud calls.',
    industry: 'Government / Defense',
    badge: 'Moderate-Complex · 58 interaction paths',
    goalStatement:
      'Build a secure assistant for classified environments — local inference, no external API calls, data never leaves the perimeter.',
    stageSubtitles: {
      goal: 'Air-gapped knowledge assistant',
      'context-definition': '8 steps — local inference with strict access control',
      'context-dimensions': '15 of 26 components activated',
      'interaction-discovery': '58 interaction paths discovered',
      'agent-evaluation': '187 test scenarios across 3 trust levels',
      'solution-architecture': 'On-prem single-node with local RAG',
    },
  },
  {
    id: 'multimodal-agent',
    label: 'Image, Audio & Video Assistant',
    shortLabel: 'Media Assistant',
    complexity: 'complex',
    complexityLabel: 'Complex',
    color: '#d946ef',
    gradient: 'linear-gradient(135deg, #d946ef, #c026d3)',
    bgTint: 'rgba(217,70,239,0.06)',
    borderColor: 'rgba(217,70,239,0.2)',
    iconName: 'Image',
    description:
      'An agent that processes text, images, audio, and video inputs — visual Q&A, document scanning, audio transcription, and cross-modal reasoning.',
    industry: 'Media / Education',
    badge: 'Complex · 105 interaction paths',
    goalStatement:
      'Build an assistant that understands and responds across text, images, audio, and video — with cross-modal reasoning and format-aware output.',
    stageSubtitles: {
      goal: 'Cross-modal understanding and generation',
      'context-definition': '8 steps — multi-format processing pipeline',
      'context-dimensions': '23 of 26 components activated',
      'interaction-discovery': '105 interaction paths discovered',
      'agent-evaluation': '296 test scenarios across 3 trust levels',
      'solution-architecture': 'Multi-modal orchestrator with format adapters',
    },
  },
  {
    id: 'consumer-chat',
    label: 'High-Volume Customer Chat',
    shortLabel: 'Customer Chat',
    complexity: 'moderate',
    complexityLabel: 'Moderate',
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    bgTint: 'rgba(244,63,94,0.06)',
    borderColor: 'rgba(244,63,94,0.2)',
    iconName: 'MessageSquare',
    description:
      'A high-throughput conversational agent for consumer apps — handling millions of daily interactions with sub-second latency and personalized responses.',
    industry: 'Consumer Tech / E-commerce',
    badge: 'Moderate · 64 interaction paths',
    goalStatement:
      'Build a consumer-facing chatbot that scales to millions of daily conversations with personalized responses, low latency, and graceful degradation.',
    stageSubtitles: {
      goal: 'High-throughput personalized chat',
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
