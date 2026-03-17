import type { GoalDecomposition } from '@/store/agentTypes'

// ─── Data Domain Classifications ──────────────────────────────────────────

export type DataDomain = 'financial' | 'operational' | 'compliance' | 'customer' | 'product' | 'hr'

export const DATA_DOMAIN_LABELS: Record<DataDomain, string> = {
  financial: 'Financial',
  operational: 'Operational',
  compliance: 'Compliance',
  customer: 'Customer',
  product: 'Product',
  hr: 'HR',
}

export interface DataSourceDetail {
  name: string
  domain: DataDomain
  description: string
}

// ─── Complexity Metadata ──────────────────────────────────────────────────

export interface ComplexityProfile {
  interactionPaths: number
  trustBoundaries: number
  integrations: number
  stateModel: 'stateless' | 'session' | 'multi-turn'
  failureModes: number
  latencyRequirement: 'relaxed' | 'moderate' | 'strict'
}

export interface GoalDataPayload {
  goalStatement: string
  decomposition: GoalDecomposition
  dataSources: DataSourceDetail[]
  businessSummary: string
  technicalSummary: string
  keyRisk: string
  complexityProfile: ComplexityProfile
  complianceRequired?: string[]
  costPreference?: 'minimal' | 'balanced' | 'unrestricted'
}

// ─── DOC INTELLIGENCE: Invoice Processing Agent ──────────────────────────

const docIntelligenceGoal: GoalDataPayload = {
  goalStatement:
    'Process invoices from multiple vendors (AWS, GCP, Staples), extract costs, validate against purchase orders, and generate consolidated reports with trend analysis.',
  decomposition: {
    primaryActions: ['Ingest', 'Extract', 'Validate'],
    secondaryActions: ['Normalize', 'Match', 'Aggregate', 'Analyze'],
    primaryData: ['AWS Cost & Usage Reports', 'GCP Billing Export', 'Staples PDF invoices'],
    supportingData: ['Purchase Order Database', 'Historical Archive', 'Vendor contracts'],
    reasoning:
      'Multi-vendor invoice processing requires handling diverse formats (CSV, JSON, PDF), matching line items against POs, detecting cost anomalies, and maintaining audit trails. High precision required for financial compliance.',
    trustBoundaryHints: {
      autonomous: [
        'Extract line items from clean CSV/JSON formats',
        'Normalize amounts to base currency',
        'Flag charges exceeding PO amounts',
      ],
      supervised: ['Handle scanned/OCR PDF invoices', 'Apply volume discounts', 'Resolve format ambiguities'],
      escalation: [
        'Charges >$10K require supervisor approval',
        'Disputed items flagged for manual review',
        'Missing PO references require investigation',
      ],
    },
  },
  dataSources: [
    {
      name: 'AWS Cost & Usage Reports',
      domain: 'financial',
      description: 'Daily CSV exports with 52 columns covering compute, storage, networking costs. 384K+ line items monthly.',
    },
    {
      name: 'GCP Cloud Billing Export',
      domain: 'financial',
      description: 'BigQuery dataset with hourly granularity. 892K+ records providing sub-daily cost aggregation.',
    },
    {
      name: 'Staples Business Advantage Portal',
      domain: 'operational',
      description:
        '36 monthly PDF invoices with mixed tabular and text-only formats. 1,247 total line items across office supplies.',
    },
    {
      name: 'Purchase Order Database',
      domain: 'financial',
      description: 'PostgreSQL with 2,847 POs, 8,934 line items. Enables charge validation against approved amounts.',
    },
  ],
  businessSummary:
    'Automates invoice processing across 3 major vendors, reducing manual review time by 85%. Enables real-time cost visibility, detects billing anomalies, and ensures compliance with approved purchase orders.',
  technicalSummary:
    'System ingests heterogeneous formats (CSV, JSON, PDF), normalizes to canonical schema, performs multi-step matching against PO database, applies validation rules, and generates consolidated cost reports with temporal analysis.',
  keyRisk: 'PDF parsing accuracy degrades on scanned documents with handwritten notes; OCR confidence <88% requires manual review.',
  complexityProfile: {
    interactionPaths: 8640,
    trustBoundaries: 5,
    integrations: 4,
    stateModel: 'session',
    failureModes: 12,
    latencyRequirement: 'moderate',
  },
  complianceRequired: ['SOX', 'GDPR billing data'],
  costPreference: 'balanced',
}

// ─── SAAS COPILOT: Enterprise RAG Copilot ────────────────────────────────

const saasCopilotGoal: GoalDataPayload = {
  goalStatement:
    'Answer employee questions by searching across internal knowledge sources (Confluence, Slack, Google Drive, Jira, directory), correlating information, handling access control, and detecting data freshness issues.',
  decomposition: {
    primaryActions: ['Search', 'Correlate', 'Filter'],
    secondaryActions: ['Synthesize', 'Cite', 'Escalate'],
    primaryData: ['Confluence pages', 'Slack threads', 'Jira issues'],
    supportingData: ['Google Drive documents', 'Employee directory', 'Decision trails'],
    reasoning:
      'Enterprise knowledge is distributed across 5 systems with different query interfaces, access models, and update cadences. Answering questions requires multi-source retrieval, cross-reference resolution, permission filtering, and freshness validation.',
    trustBoundaryHints: {
      autonomous: [
        'Simple factual lookups from public Confluence pages',
        'Direct employee directory queries',
        'Document version comparisons',
      ],
      supervised: [
        'Cross-source synthesis requiring >2 sources',
        'Decisions requiring timeline reconstruction',
        'Queries touching restricted Slack channels',
      ],
      escalation: [
        'Ambiguous queries with confidence <70%',
        'Access control denial (result filtering)',
        'Stale data detected (Confluence >90 days old)',
      ],
    },
  },
  dataSources: [
    {
      name: 'Confluence Wiki',
      domain: 'product',
      description: '8,400+ pages across 45 spaces with rich text, images, macros. 18-month history with versioning.',
    },
    {
      name: 'Slack Workspace',
      domain: 'operational',
      description: '156 channels, 2.1M messages over 18 months. Decision discussions, incident responses, team coordination.',
    },
    {
      name: 'Google Drive',
      domain: 'product',
      description: '23K files including proposals, financial models, design specs. Permission-based access control.',
    },
    {
      name: 'Jira Projects',
      domain: 'product',
      description: '12,400 issues across Engineering, Product, Design. Linked issues, comments, workflow states.',
    },
    {
      name: 'Employee Directory',
      domain: 'hr',
      description: '340 employees with expertise tags, reporting chains, office locations. Real-time SQL access.',
    },
  ],
  businessSummary:
    'Enables employees to find answers from internal knowledge without manual search across 5 systems. Reduces time-to-answer for policy questions, architecture decisions, and project status by 75%. Maintains access control and highlights stale information.',
  technicalSummary:
    'Executes parallel searches with source-specific adapters (CQL, JQL, text search), performs entity resolution across systems, filters results by user permissions, assesses document freshness, and synthesizes multi-source answers with citations.',
  keyRisk: 'Access control violations if permission filters fail; stale data returned if freshness checks disabled; rate limits on Slack/Confluence APIs during high query volume.',
  complexityProfile: {
    interactionPaths: 2847000,
    trustBoundaries: 7,
    integrations: 5,
    stateModel: 'multi-turn',
    failureModes: 18,
    latencyRequirement: 'moderate',
  },
  complianceRequired: ['SOX', 'GDPR'],
  costPreference: 'balanced',
}

// ─── CONSUMER CHAT: SaaS Customer Support Agent ──────────────────────────

const consumerChatGoal: GoalDataPayload = {
  goalStatement:
    'Triage customer support tickets from multiple channels, search knowledge base for self-service solutions, execute simple actions (password resets, plan upgrades), and route complex issues to specialists with context.',
  decomposition: {
    primaryActions: ['Triage', 'Search', 'Respond'],
    secondaryActions: ['Execute', 'Route', 'Escalate'],
    primaryData: ['Knowledge base (450 articles)', 'Customer database', 'Ticket history'],
    supportingData: ['Subscription details', 'User profiles', 'Action API logs'],
    reasoning:
      'Support efficiency requires rapid ticket triage, knowledge base semantic search, safe action execution (with precondition validation), and appropriate routing. 68% of tickets resolve via KB or simple actions; 32% require escalation with rich context.',
    trustBoundaryHints: {
      autonomous: [
        'Password resets for verified accounts',
        'KB article recommendations (confidence >85%)',
        'Feature toggle actions within plan tier',
      ],
      supervised: [
        'Plan upgrades requiring payment method',
        'Account suspension/reactivation',
        'Actions with escalation flags',
      ],
      escalation: [
        'P1 urgent tickets (outages, data loss)',
        'Complex technical issues (confidence <70%)',
        'Pricing discussions, contract modifications',
      ],
    },
  },
  dataSources: [
    {
      name: 'Knowledge Base',
      domain: 'product',
      description: '450 help articles in 12 categories. Markdown with code snippets, screenshots. Updated weekly.',
    },
    {
      name: 'Customer Database',
      domain: 'customer',
      description: '8,500 active accounts with subscriptions, users, ticket history. PostgreSQL real-time access.',
    },
    {
      name: 'Action API',
      domain: 'operational',
      description: 'REST endpoints for password reset, plan change, feature toggle, data export. 1000 req/min rate limit.',
    },
  ],
  businessSummary:
    'Resolves 68% of support tickets without human intervention via KB + simple actions. Reduces first-response time to <2 minutes, improves satisfaction by 22%, and frees specialists for complex issues requiring expertise.',
  technicalSummary:
    'Ingests tickets from email/chat/webhook, classifies by category/urgency/sentiment using NLP, performs semantic KB search, validates action preconditions, executes safe actions, and routes escalations with full context (attempted solutions, customer history).',
  keyRisk: 'Action execution failures if precondition validation missed (suspended account, overdue payment). KB staleness if refresh cycle skipped. Escalation routing errors if team assignment rules misconfigured.',
  complexityProfile: {
    interactionPaths: 8640,
    trustBoundaries: 4,
    integrations: 3,
    stateModel: 'session',
    failureModes: 10,
    latencyRequirement: 'strict',
  },
  complianceRequired: ['GDPR', 'CCPA'],
  costPreference: 'balanced',
}

// ─── FAQ KNOWLEDGE: FAQ Knowledge Agent ───────────────────────────────────

const faqKnowledgeGoal: GoalDataPayload = {
  goalStatement:
    'Answer employee questions from a curated knowledge base of company policies, procedures, and reference documents. Provide confident answers with source citations and escalate edge cases.',
  decomposition: {
    primaryActions: ['Understand', 'Search', 'Answer'],
    secondaryActions: ['Cite', 'Escalate'],
    primaryData: ['Company knowledge base (280 docs)', 'HR policies', 'IT guides', 'Benefits info'],
    supportingData: ['Document metadata', 'Update timestamps', 'Related documents'],
    reasoning:
      'Internal knowledge distribution relies on a single curated knowledge base. High precision required for policy questions (compliance risk). Confidence scoring determines escalation. Most questions resolve with document citations; ambiguous cases require HR/IT specialist input.',
    trustBoundaryHints: {
      autonomous: [
        'Direct policy lookups (vacation days, benefits)',
        'IT setup guides for standard equipment',
        'Onboarding checklists for new roles',
      ],
      supervised: ['Policies with role/location variations', 'Multi-document synthesis required'],
      escalation: [
        'Ambiguous questions spanning multiple policies',
        'Custom exceptions or contract negotiations',
        'Edge cases (international relocation, family medical leave)',
      ],
    },
  },
  dataSources: [
    {
      name: 'HR Policies',
      domain: 'hr',
      description: '45 documents covering vacation, benefits, onboarding, performance review. Updated monthly.',
    },
    {
      name: 'IT Guides',
      domain: 'operational',
      description: '38 guides for equipment requests, VPN, password reset, access provisioning. Updated weekly.',
    },
    {
      name: 'Company Knowledge Base',
      domain: 'compliance',
      description: '280 total documents across 12 categories. Markdown + PDF format. 2,847 indexed keywords.',
    },
  ],
  businessSummary:
    'Provides instant answers to 85%+ of employee questions about policies, procedures, benefits, and IT setup. Reduces HR/IT support ticket volume by 60%. Ensures consistent policy interpretation across organization.',
  technicalSummary:
    'Parses natural language questions, executes semantic + keyword search over 280 documents, extracts relevant sections, generates concise answers with document citations, and escalates ambiguous queries with suggested expertise paths.',
  keyRisk: 'Answer accuracy depends on knowledge base freshness; outdated documents cause policy misinterpretation. Low-confidence matches (<60%) may provide insufficient guidance requiring escalation.',
  complexityProfile: {
    interactionPaths: 2840,
    trustBoundaries: 2,
    integrations: 1,
    stateModel: 'stateless',
    failureModes: 5,
    latencyRequirement: 'relaxed',
  },
  complianceRequired: ['GDPR', 'HIPAA'],
  costPreference: 'minimal',
}

// ─── Goal Data V3 Lookup ──────────────────────────────────────────────────

const goalDataV3Map: Record<string, GoalDataPayload> = {
  'doc-intelligence': docIntelligenceGoal,
  'saas-copilot': saasCopilotGoal,
  'consumer-chat': consumerChatGoal,
  'faq-knowledge': faqKnowledgeGoal,
}

export function getGoalDataV3(tileId: string | null): GoalDataPayload | null {
  if (!tileId || !(tileId in goalDataV3Map)) {
    return null
  }
  return goalDataV3Map[tileId]
}
