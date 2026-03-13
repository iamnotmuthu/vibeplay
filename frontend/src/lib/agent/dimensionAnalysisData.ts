import type {
  FlowDimension,
  DataDimension,
  ResponseDimension,
  DimensionAnalysisPayload,
} from '@/store/agentTypes'

// ============================================================================
// FAQ & Knowledge Agent (faq-knowledge)
// ============================================================================

const faqFlowDimensions: FlowDimension[] = [
  {
    id: 'faq-flow-retrieval',
    label: 'Knowledge Retrieval',
    description: 'Single-fact lookup from KB',
    intentCategories: ['product-question', 'policy-inquiry', 'pricing-lookup'],
    confidence: 'high',
  },
  {
    id: 'faq-flow-clarification',
    label: 'Clarification Loop',
    description: 'Disambiguate vague questions',
    intentCategories: ['ambiguous-entity', 'underspecified-query'],
    confidence: 'medium',
  },
  {
    id: 'faq-flow-escalation',
    label: 'Human Escalation',
    description: 'Route out-of-scope to human',
    intentCategories: ['complaint', 'billing-dispute', 'legal-question'],
    confidence: 'high',
  },
]

const faqDataDimensions: DataDimension[] = [
  {
    id: 'faq-data-product',
    label: 'Product Knowledge',
    depthScore: 4,
    subTopics: [
      { name: 'Features', depth: 4 },
      { name: 'Setup Guides', depth: 5 },
      { name: 'Troubleshooting', depth: 3 },
      { name: 'Integrations', depth: 2 },
    ],
    keyEntities: ['Product Plans', 'Feature Flags', 'API Endpoints'],
    connectedDomains: ['Pricing', 'Support Policy'],
    sourceAttribution: [
      { sourceId: 'knowledge-base-json', sourceName: 'knowledge_base.json', count: '1,247 entries' },
      { sourceId: 'product-docs-pdf', sourceName: 'product_docs.pdf', count: '186 pages' },
    ],
  },
  {
    id: 'faq-data-pricing',
    label: 'Pricing & Plans',
    depthScore: 3,
    subTopics: [
      { name: 'Plan Tiers', depth: 4 },
      { name: 'Add-ons', depth: 3 },
      { name: 'Enterprise Custom', depth: 2 },
    ],
    keyEntities: ['Free Tier', 'Pro Plan', 'Enterprise'],
    connectedDomains: ['Product Knowledge', 'Billing Policy'],
    sourceAttribution: [
      { sourceId: 'knowledge-base-json', sourceName: 'knowledge_base.json', count: '89 pricing entries' },
      { sourceId: 'faq-entries-csv', sourceName: 'faq_entries.csv', count: '142 pricing FAQs' },
    ],
  },
  {
    id: 'faq-data-policy',
    label: 'Policies & Compliance',
    depthScore: 3,
    subTopics: [
      { name: 'Returns', depth: 4 },
      { name: 'Privacy', depth: 3 },
      { name: 'SLA Terms', depth: 2 },
    ],
    keyEntities: ['Return Policy', 'GDPR', 'SLA'],
    connectedDomains: ['Product Knowledge'],
    sourceAttribution: [
      { sourceId: 'product-docs-pdf', sourceName: 'product_docs.pdf', count: '28 policy pages' },
    ],
    gapNote: 'Enterprise SLA terms not fully documented',
  },
  {
    id: 'faq-data-support',
    label: 'Support Procedures',
    depthScore: 2,
    subTopics: [
      { name: 'Ticket Routing', depth: 3 },
      { name: 'Escalation Rules', depth: 2 },
      { name: 'Response Templates', depth: 1 },
    ],
    keyEntities: ['Support Tiers', 'SLA Response Times'],
    connectedDomains: ['Policies & Compliance', 'Product Knowledge'],
    sourceAttribution: [
      { sourceId: 'faq-entries-csv', sourceName: 'faq_entries.csv', count: '403 support entries' },
    ],
    gapNote: 'Escalation decision tree incomplete for edge cases',
  },
]

const faqResponseDimensions: ResponseDimension[] = [
  {
    id: 'faq-resp-short',
    outputMode: 'short-answer',
    userProfilesRequiring: ['end-user'],
    complexity: 'simple',
    exampleOutput: 'Our business hours are Monday-Friday, 9am-6pm EST.',
  },
  {
    id: 'faq-resp-step',
    outputMode: 'step-by-step',
    userProfilesRequiring: ['end-user', 'support-agent'],
    complexity: 'simple',
    exampleOutput: '1. Go to Settings → Account\n2. Click "Reset Password"\n3. Check your email for the link',
  },
  {
    id: 'faq-resp-detailed',
    outputMode: 'detailed-explanation',
    userProfilesRequiring: ['support-agent'],
    complexity: 'moderate',
    exampleOutput:
      'The return policy allows returns within 30 days of purchase. Items must be unused and in original packaging. Refunds are processed within 5-7 business days...',
  },
  {
    id: 'faq-resp-summary',
    outputMode: 'summary-report',
    userProfilesRequiring: ['business-user'],
    complexity: 'moderate',
    exampleOutput:
      'FAQ Coverage Report: 1,247 topics covered. Top 3 gaps: Enterprise SLA, Custom Integrations, Data Migration.',
  },
]

const faqAnalysis: DimensionAnalysisPayload = {
  tileId: 'faq-knowledge',
  agentName: 'FAQ & Knowledge Agent',
  flowDimensions: faqFlowDimensions,
  dataDimensions: faqDataDimensions,
  responseDimensions: faqResponseDimensions,
  summaryText:
    '3 capability lanes identified across 4 knowledge domains. 9 sub-topics mapped with depths from 1-5. 4 output modes serving 4 user profiles. 3 coverage gaps flagged.',
}

// ============================================================================
// SaaS Copilot Agent (saas-copilot)
// ============================================================================

const saasFlowDimensions: FlowDimension[] = [
  {
    id: 'saas-flow-action',
    label: 'Action Execution',
    description: 'Execute user-initiated actions in SaaS tools',
    intentCategories: ['create-record', 'update-field', 'delete-item', 'trigger-workflow'],
    confidence: 'high',
  },
  {
    id: 'saas-flow-query',
    label: 'Data Query',
    description: 'Retrieve and filter SaaS data',
    intentCategories: ['search-records', 'filter-list', 'aggregate-stats', 'export-data'],
    confidence: 'high',
  },
  {
    id: 'saas-flow-automation',
    label: 'Workflow Automation',
    description: 'Multi-step automated sequences',
    intentCategories: ['scheduled-task', 'conditional-flow', 'batch-operation'],
    confidence: 'medium',
  },
  {
    id: 'saas-flow-permission',
    label: 'Permission Check',
    description: 'Validate user authorization',
    intentCategories: ['access-check', 'role-verification', 'scope-validation'],
    confidence: 'high',
  },
  {
    id: 'saas-flow-integration',
    label: 'Cross-App Integration',
    description: 'Bridge actions across multiple SaaS tools',
    intentCategories: ['sync-data', 'cross-reference', 'webhook-trigger'],
    confidence: 'low',
  },
]

const saasDataDimensions: DataDimension[] = [
  {
    id: 'saas-data-api',
    label: 'API Endpoints',
    depthScore: 5,
    subTopics: [
      { name: 'REST Endpoints', depth: 5 },
      { name: 'GraphQL Schemas', depth: 4 },
      { name: 'Webhooks', depth: 3 },
      { name: 'Rate Limits', depth: 4 },
    ],
    keyEntities: ['User API', 'Project API', 'Billing API', 'Admin API'],
    connectedDomains: ['Workflow Definitions', 'Permission Rules'],
    sourceAttribution: [
      { sourceId: 'app-schema', sourceName: 'saas_schema.json', count: '890 endpoint schemas' },
    ],
  },
  {
    id: 'saas-data-workflows',
    label: 'Workflow Definitions',
    depthScore: 4,
    subTopics: [
      { name: 'Automation Rules', depth: 4 },
      { name: 'Trigger Conditions', depth: 4 },
      { name: 'Action Sequences', depth: 3 },
      { name: 'Error Handling', depth: 2 },
    ],
    keyEntities: ['Approval Flows', 'Notification Chains', 'Data Sync Jobs'],
    connectedDomains: ['API Endpoints', 'Action History'],
    sourceAttribution: [
      { sourceId: 'user-workflows', sourceName: 'workflow_definitions.yaml', count: '350 workflow DAGs' },
    ],
  },
  {
    id: 'saas-data-permissions',
    label: 'Permission Rules',
    depthScore: 3,
    subTopics: [
      { name: 'Role Definitions', depth: 4 },
      { name: 'Scope Mappings', depth: 3 },
      { name: 'Custom Policies', depth: 2 },
    ],
    keyEntities: ['Admin Role', 'Editor Role', 'Viewer Role', 'Custom Roles'],
    connectedDomains: ['API Endpoints'],
    sourceAttribution: [
      { sourceId: 'action-history', sourceName: 'action_history.csv', count: '2,100 permission mappings' },
    ],
    gapNote: 'Custom role inheritance rules not fully documented',
  },
  {
    id: 'saas-data-history',
    label: 'Action History',
    depthScore: 4,
    subTopics: [
      { name: 'User Actions', depth: 5 },
      { name: 'System Events', depth: 4 },
      { name: 'Error Logs', depth: 3 },
    ],
    keyEntities: ['Audit Trail', 'Usage Analytics', 'Error Patterns'],
    connectedDomains: ['API Endpoints', 'Permission Rules'],
    sourceAttribution: [
      { sourceId: 'action-history', sourceName: 'action_history.csv', count: '340,000 action rows' },
    ],
  },
  {
    id: 'saas-data-tools',
    label: 'Tool Catalog',
    depthScore: 3,
    subTopics: [
      { name: 'Tool Descriptions', depth: 4 },
      { name: 'Input/Output Schemas', depth: 3 },
      { name: 'Dependencies', depth: 2 },
    ],
    keyEntities: ['890 Registered Tools', 'Tool Categories', 'Deprecation List'],
    connectedDomains: ['API Endpoints', 'Workflow Definitions'],
    sourceAttribution: [
      { sourceId: 'tool-definitions', sourceName: 'tool_catalog.db', count: '890 tool entries' },
    ],
  },
]

const saasResponseDimensions: ResponseDimension[] = [
  {
    id: 'saas-resp-short',
    outputMode: 'short-answer',
    userProfilesRequiring: ['end-user'],
    complexity: 'simple',
    exampleOutput: 'You have Editor access to the Marketing workspace.',
  },
  {
    id: 'saas-resp-step',
    outputMode: 'step-by-step',
    userProfilesRequiring: ['end-user'],
    complexity: 'simple',
    exampleOutput: '1. Navigate to Settings\n2. Select "API Keys"\n3. Click "Generate New Key"',
  },
  {
    id: 'saas-resp-code',
    outputMode: 'code-snippet',
    userProfilesRequiring: ['power-user', 'system-user'],
    complexity: 'complex',
    exampleOutput:
      'curl -X POST /api/v2/projects \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d \'{"name": "New Project"}\'',
  },
  {
    id: 'saas-resp-table',
    outputMode: 'data-table',
    userProfilesRequiring: ['product-manager', 'system-user', 'power-user'],
    complexity: 'moderate',
    exampleOutput: '| Endpoint | Calls/day | Avg Latency | Error Rate |\n|---|---|---|---|',
  },
  {
    id: 'saas-resp-action',
    outputMode: 'action-list',
    userProfilesRequiring: ['system-user', 'power-user'],
    complexity: 'moderate',
    exampleOutput: '✓ Create project "Q4 Campaign"\n✓ Add team members\n⏳ Configure webhook...',
  },
]

const saasAnalysis: DimensionAnalysisPayload = {
  tileId: 'saas-copilot',
  agentName: 'SaaS Copilot Agent',
  flowDimensions: saasFlowDimensions,
  dataDimensions: saasDataDimensions,
  responseDimensions: saasResponseDimensions,
  summaryText:
    '5 capability lanes identified across 5 knowledge domains. 19 sub-topics mapped with depths from 2-5. 5 output modes serving 4 user profiles. 1 coverage gap flagged.',
}

// ============================================================================
// Research & Comparison Agent (research-comparison)
// ============================================================================

const researchFlowDimensions: FlowDimension[] = [
  {
    id: 'research-flow-search',
    label: 'Literature Search',
    description: 'Semantic search across research corpus',
    intentCategories: ['keyword-search', 'semantic-search', 'citation-chain', 'author-lookup'],
    confidence: 'high',
  },
  {
    id: 'research-flow-compare',
    label: 'Comparative Analysis',
    description: 'Side-by-side comparison of entities',
    intentCategories: ['feature-comparison', 'methodology-comparison', 'vendor-evaluation'],
    confidence: 'medium',
  },
  {
    id: 'research-flow-synthesize',
    label: 'Research Synthesis',
    description: 'Aggregate findings across sources',
    intentCategories: ['trend-analysis', 'meta-review', 'gap-identification'],
    confidence: 'medium',
  },
  {
    id: 'research-flow-cite',
    label: 'Citation Management',
    description: 'Track and format references',
    intentCategories: ['citation-format', 'reference-check', 'bibliography-export'],
    confidence: 'high',
  },
  {
    id: 'research-flow-recommend',
    label: 'Recommendation Engine',
    description: 'Suggest based on criteria',
    intentCategories: ['vendor-recommendation', 'paper-suggestion', 'tool-selection'],
    confidence: 'low',
  },
  {
    id: 'research-flow-validate',
    label: 'Fact Validation',
    description: 'Cross-reference claims with sources',
    intentCategories: ['claim-verification', 'data-validation', 'source-credibility'],
    confidence: 'low',
  },
]

const researchDataDimensions: DataDimension[] = [
  {
    id: 'research-data-papers',
    label: 'Research Papers',
    depthScore: 5,
    subTopics: [
      { name: 'Full-text Content', depth: 5 },
      { name: 'Abstracts', depth: 5 },
      { name: 'Methodology Sections', depth: 4 },
      { name: 'Results & Findings', depth: 4 },
      { name: 'Discussion', depth: 3 },
    ],
    keyEntities: ['4,200 Papers', '380 Abstracts', '12 Research Domains'],
    connectedDomains: ['Citation Network', 'Statistical Data'],
    sourceAttribution: [
      { sourceId: 'research-papers-db', sourceName: 'research_papers.db', count: '4,200 full papers' },
      { sourceId: 'abstracts-csv', sourceName: 'abstracts.csv', count: '380 abstracts' },
    ],
  },
  {
    id: 'research-data-citations',
    label: 'Citation Network',
    depthScore: 4,
    subTopics: [
      { name: 'Direct Citations', depth: 5 },
      { name: 'Co-citation Clusters', depth: 4 },
      { name: 'Citation Chains', depth: 3 },
      { name: 'Impact Metrics', depth: 3 },
    ],
    keyEntities: ['89,400 Citation Links', 'H-index Data', 'Journal Rankings'],
    connectedDomains: ['Research Papers'],
    sourceAttribution: [
      { sourceId: 'citations-index', sourceName: 'citations_index.json', count: '89,400 citation links' },
    ],
  },
  {
    id: 'research-data-methodology',
    label: 'Methodologies',
    depthScore: 3,
    subTopics: [
      { name: 'Quantitative Methods', depth: 4 },
      { name: 'Qualitative Methods', depth: 3 },
      { name: 'Mixed Methods', depth: 2 },
      { name: 'Statistical Tests', depth: 3 },
    ],
    keyEntities: ['RCT', 'Survey Design', 'Meta-Analysis', 'Case Study'],
    connectedDomains: ['Research Papers', 'Statistical Data'],
    sourceAttribution: [
      { sourceId: 'research-papers-db', sourceName: 'research_papers.db', count: '2,800 methodology sections' },
    ],
    gapNote: 'Qualitative methodology tagging is incomplete',
  },
  {
    id: 'research-data-stats',
    label: 'Statistical Data',
    depthScore: 3,
    subTopics: [
      { name: 'Tables & Figures', depth: 4 },
      { name: 'Raw Datasets', depth: 2 },
      { name: 'Computed Metrics', depth: 3 },
    ],
    keyEntities: ['Benchmark Data', 'Effect Sizes', 'P-values'],
    connectedDomains: ['Research Papers', 'Methodologies'],
    sourceAttribution: [
      { sourceId: 'research-papers-db', sourceName: 'research_papers.db', count: '1,800 data tables' },
      { sourceId: 'research-papers-db', sourceName: 'research_papers.db', count: '6,300 figures' },
    ],
    gapNote: 'Only 40% of papers have extractable raw data',
  },
  {
    id: 'research-data-vendors',
    label: 'Vendor Intelligence',
    depthScore: 2,
    subTopics: [
      { name: 'Feature Matrices', depth: 3 },
      { name: 'Pricing Models', depth: 2 },
      { name: 'Case Studies', depth: 2 },
      { name: 'Integration Docs', depth: 1 },
    ],
    keyEntities: ['Top 50 Vendors', 'Feature Categories', 'Pricing Tiers'],
    connectedDomains: ['Research Papers'],
    sourceAttribution: [
      { sourceId: 'research-papers-db', sourceName: 'research_papers.db', count: '420 vendor evaluation papers' },
    ],
    gapNote: 'Vendor pricing data may be outdated (>6 months old)',
  },
]

const researchResponseDimensions: ResponseDimension[] = [
  {
    id: 'research-resp-short',
    outputMode: 'short-answer',
    userProfilesRequiring: ['end-user'],
    complexity: 'simple',
    exampleOutput: 'Yes, Vendor X supports HIPAA compliance as of their 2024 certification.',
  },
  {
    id: 'research-resp-comparison',
    outputMode: 'comparison',
    userProfilesRequiring: ['business-user', 'end-user'],
    complexity: 'complex',
    exampleOutput: '| Criterion | Vendor A | Vendor B | Vendor C |\n|---|---|---|---|',
  },
  {
    id: 'research-resp-summary',
    outputMode: 'summary-report',
    userProfilesRequiring: ['business-user'],
    complexity: 'complex',
    exampleOutput: 'Research synthesis across 42 papers: 3 dominant methodologies identified...',
  },
  {
    id: 'research-resp-chart',
    outputMode: 'visual-chart',
    userProfilesRequiring: ['business-user'],
    complexity: 'complex',
    exampleOutput: '[Radar chart comparing 5 vendors across 8 evaluation criteria]',
  },
  {
    id: 'research-resp-detailed',
    outputMode: 'detailed-explanation',
    userProfilesRequiring: ['business-user', 'end-user'],
    complexity: 'moderate',
    exampleOutput:
      'The meta-analysis of 12 studies shows a mean effect size of 0.42 (95% CI: 0.31-0.53)...',
  },
  {
    id: 'research-resp-table',
    outputMode: 'data-table',
    userProfilesRequiring: ['system-user'],
    complexity: 'moderate',
    exampleOutput: '| Paper ID | Year | Method | Sample Size | Key Finding |',
  },
]

const researchAnalysis: DimensionAnalysisPayload = {
  tileId: 'research-comparison',
  agentName: 'Research & Comparison Agent',
  flowDimensions: researchFlowDimensions,
  dataDimensions: researchDataDimensions,
  responseDimensions: researchResponseDimensions,
  summaryText:
    '6 capability lanes identified across 5 knowledge domains. 21 sub-topics mapped with depths from 1-5. 6 output modes serving 3 user profiles. 3 coverage gaps flagged.',
}

// ============================================================================
// Lookup Map
// ============================================================================

const DIMENSION_ANALYSIS_DATA: Record<string, DimensionAnalysisPayload> = {
  'faq-knowledge': faqAnalysis,
  'saas-copilot': saasAnalysis,
  'research-comparison': researchAnalysis,
}

export function getDimensionAnalysisData(tileId: string): DimensionAnalysisPayload | null {
  return DIMENSION_ANALYSIS_DATA[tileId] ?? null
}
