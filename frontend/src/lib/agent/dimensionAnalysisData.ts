import type {
  TaskDimension,
  DataDimension,
  UserProfileDimension,
  DimensionAnalysisPayload,
} from '@/store/agentTypes'

// ============================================================================
// FAQ & Knowledge Agent (faq-knowledge)
// ============================================================================

// Task Dimensions — sliced from 3 parent tasks in Context Definition
// Parent: "Answer Customer Questions" (answer-questions) → 5 sub-tasks
// Parent: "Route Unanswerable Queries" (route-unanswerable) → 3 sub-tasks
// Parent: "Track Resolution Rate" (track-resolution) → 2 sub-tasks

const faqTaskDimensions: TaskDimension[] = [
  // ── From: Answer Customer Questions ──
  {
    id: 'faq-task-product-lookup',
    label: 'Product Feature Lookup',
    description: 'Retrieve specific product feature details, capabilities, and limitations',
    parentTaskId: 'answer-questions',
    intentCategories: ['feature-question', 'capability-check', 'integration-support'],
    confidence: 'high',
  },
  {
    id: 'faq-task-pricing-inquiry',
    label: 'Pricing & Plan Inquiry',
    description: 'Answer questions about plan tiers, pricing, add-ons, and billing',
    parentTaskId: 'answer-questions',
    intentCategories: ['pricing-lookup', 'plan-comparison', 'billing-question'],
    confidence: 'high',
  },
  {
    id: 'faq-task-policy-question',
    label: 'Policy & Compliance Question',
    description: 'Explain return policies, privacy terms, SLA guarantees, and compliance',
    parentTaskId: 'answer-questions',
    intentCategories: ['policy-inquiry', 'compliance-check', 'terms-question'],
    confidence: 'high',
  },
  {
    id: 'faq-task-troubleshooting',
    label: 'Troubleshooting Guide',
    description: 'Walk through diagnostic steps for known issues and error resolution',
    parentTaskId: 'answer-questions',
    intentCategories: ['error-resolution', 'bug-workaround', 'configuration-fix'],
    confidence: 'medium',
  },
  {
    id: 'faq-task-how-to',
    label: 'How-To Walkthrough',
    description: 'Provide step-by-step instructions for setup, configuration, and usage',
    parentTaskId: 'answer-questions',
    intentCategories: ['setup-guide', 'onboarding-help', 'workflow-instruction'],
    confidence: 'high',
  },
  // ── From: Route Unanswerable Queries ──
  {
    id: 'faq-task-low-confidence-handoff',
    label: 'Low-Confidence Handoff',
    description: 'Transfer to human agent when retrieval confidence drops below threshold',
    parentTaskId: 'route-unanswerable',
    intentCategories: ['ambiguous-entity', 'underspecified-query', 'no-match-found'],
    confidence: 'medium',
  },
  {
    id: 'faq-task-sensitive-route',
    label: 'Sensitive Topic Routing',
    description: 'Immediately route billing disputes, cancellations, and complaints to tier-2',
    parentTaskId: 'route-unanswerable',
    intentCategories: ['billing-dispute', 'cancellation-request', 'complaint-escalation'],
    confidence: 'high',
  },
  {
    id: 'faq-task-out-of-scope',
    label: 'Out-of-Scope Redirect',
    description: 'Redirect questions outside agent domain to appropriate channels',
    parentTaskId: 'route-unanswerable',
    intentCategories: ['legal-question', 'medical-query', 'unrelated-topic'],
    confidence: 'high',
  },
  // ── From: Track Resolution Rate ──
  {
    id: 'faq-task-resolution-logging',
    label: 'Resolution Logging',
    description: 'Record outcome of each interaction for resolution rate tracking',
    parentTaskId: 'track-resolution',
    intentCategories: ['resolution-confirm', 'satisfaction-check', 'follow-up-flag'],
    confidence: 'high',
  },
  {
    id: 'faq-task-coverage-gap',
    label: 'Coverage Gap Detection',
    description: 'Identify topics with low resolution rates for knowledge base improvement',
    parentTaskId: 'track-resolution',
    intentCategories: ['gap-analysis', 'trending-topic', 'missing-content'],
    confidence: 'medium',
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

// User Profile Dimensions — behavioral axes replacing role-based profiles
// Context × Posture × Channel = behavioral intersection

const faqUserProfileDimensions: UserProfileDimension[] = [
  {
    id: 'faq-up-anon-info-self',
    label: 'Anonymous Browser',
    description: 'Unknown visitor seeking general info via self-service',
    contextAxis: 'anonymous',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Serve public FAQ only. No account-specific data. Prompt login for personalized answers.',
  },
  {
    id: 'faq-up-known-info-self',
    label: 'Known Self-Server',
    description: 'Logged-in customer browsing for product info independently',
    contextAxis: 'known-customer',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Personalize answers with account context. Show plan-specific features. Track for coverage analytics.',
  },
  {
    id: 'faq-up-known-problem-self',
    label: 'Self-Service Troubleshooter',
    description: 'Known customer trying to resolve an issue on their own',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'self-service',
    behaviorImpact: 'Pull account history for context. Offer guided troubleshooting. Auto-create ticket if unresolved after 2 attempts.',
  },
  {
    id: 'faq-up-known-problem-agent',
    label: 'Agent-Assisted Reporter',
    description: 'Known customer reporting a problem via live agent channel',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Pre-populate agent screen with account context and interaction history. Suggest resolution paths to human agent.',
  },
  {
    id: 'faq-up-vip-info-agent',
    label: 'VIP Concierge',
    description: 'High-value customer with priority routing for information requests',
    contextAxis: 'vip',
    postureAxis: 'info-seeking',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Priority queue. Detailed, white-glove responses. Proactive account health check. Dedicated success manager loop-in.',
  },
  {
    id: 'faq-up-vip-dispute-agent',
    label: 'VIP Dispute Handler',
    description: 'High-value customer with billing dispute or escalation',
    contextAxis: 'vip',
    postureAxis: 'dispute',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Immediate escalation to senior support. Full account and billing history pre-loaded. Retention offer authority.',
  },
]

const faqAnalysis: DimensionAnalysisPayload = {
  tileId: 'faq-knowledge',
  agentName: 'FAQ & Knowledge Agent',
  taskDimensions: faqTaskDimensions,
  dataDimensions: faqDataDimensions,
  userProfileDimensions: faqUserProfileDimensions,
  summaryText:
    '10 task dimensions sliced from 3 parent tasks across 4 knowledge domains. 6 behavioral user profiles defined on Context × Posture × Channel axes. 2 coverage gaps flagged in policy and support documentation.',
}

// ============================================================================
// SaaS Copilot Agent (saas-copilot)
// ============================================================================

// Task Dimensions — sliced from 3 parent tasks in Context Definition
// Parent: "Create Records" (create-record) → 4 sub-tasks
// Parent: "Generate Reports" (generate-report) → 3 sub-tasks
// Parent: "Update Settings" (update-settings) → 3 sub-tasks

const saasTaskDimensions: TaskDimension[] = [
  // ── From: Create Records ──
  {
    id: 'saas-task-single-create',
    label: 'Single Record Creation',
    description: 'Create one entity (lead, contact, opportunity) via natural language',
    parentTaskId: 'create-record',
    intentCategories: ['create-lead', 'create-contact', 'create-opportunity'],
    confidence: 'high',
  },
  {
    id: 'saas-task-bulk-import',
    label: 'Bulk Record Import',
    description: 'Import multiple records from CSV, spreadsheet, or API payload',
    parentTaskId: 'create-record',
    intentCategories: ['csv-upload', 'batch-create', 'api-import'],
    confidence: 'medium',
  },
  {
    id: 'saas-task-duplicate-check',
    label: 'Duplicate Detection',
    description: 'Identify and resolve potential duplicate records before creation',
    parentTaskId: 'create-record',
    intentCategories: ['duplicate-check', 'merge-suggestion', 'conflict-resolution'],
    confidence: 'high',
  },
  {
    id: 'saas-task-related-create',
    label: 'Related Entity Creation',
    description: 'Create linked records (e.g., contact + opportunity + task in one action)',
    parentTaskId: 'create-record',
    intentCategories: ['linked-creation', 'workflow-trigger', 'cascade-create'],
    confidence: 'medium',
  },
  // ── From: Generate Reports ──
  {
    id: 'saas-task-standard-report',
    label: 'Standard Report Generation',
    description: 'Run pre-defined report templates with date range and filters',
    parentTaskId: 'generate-report',
    intentCategories: ['pipeline-report', 'activity-report', 'forecast-report'],
    confidence: 'high',
  },
  {
    id: 'saas-task-custom-query',
    label: 'Custom Query Builder',
    description: 'Construct ad-hoc queries from natural language descriptions',
    parentTaskId: 'generate-report',
    intentCategories: ['custom-filter', 'aggregation-query', 'cross-object-report'],
    confidence: 'medium',
  },
  {
    id: 'saas-task-export-data',
    label: 'Data Export',
    description: 'Export query results to CSV, PDF, or dashboard format',
    parentTaskId: 'generate-report',
    intentCategories: ['csv-export', 'pdf-export', 'dashboard-embed'],
    confidence: 'high',
  },
  // ── From: Update Settings ──
  {
    id: 'saas-task-user-prefs',
    label: 'User Preference Update',
    description: 'Modify individual user settings (notifications, timezone, display)',
    parentTaskId: 'update-settings',
    intentCategories: ['notification-change', 'timezone-update', 'display-preference'],
    confidence: 'high',
  },
  {
    id: 'saas-task-workflow-config',
    label: 'Workflow Configuration',
    description: 'Create or modify automation rules, triggers, and action sequences',
    parentTaskId: 'update-settings',
    intentCategories: ['automation-rule', 'trigger-condition', 'action-sequence'],
    confidence: 'medium',
  },
  {
    id: 'saas-task-integration-setup',
    label: 'Integration Setup',
    description: 'Configure webhooks, API connections, and cross-app sync rules',
    parentTaskId: 'update-settings',
    intentCategories: ['webhook-config', 'api-key-management', 'sync-mapping'],
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

const saasUserProfileDimensions: UserProfileDimension[] = [
  {
    id: 'saas-up-known-info-self',
    label: 'Self-Service Explorer',
    description: 'Logged-in user browsing data and running reports independently',
    contextAxis: 'known-customer',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Show data within user permission scope. Auto-suggest relevant reports. Track usage patterns for recommendations.',
  },
  {
    id: 'saas-up-known-info-agent',
    label: 'Guided Power User',
    description: 'Known user requesting help with complex queries or configurations',
    contextAxis: 'known-customer',
    postureAxis: 'info-seeking',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Provide step-by-step guidance with previews. Confirm before executing. Show related documentation links.',
  },
  {
    id: 'saas-up-known-problem-self',
    label: 'Self-Service Fixer',
    description: 'User encountering errors or unexpected behavior during self-service',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'self-service',
    behaviorImpact: 'Surface error context from action history. Suggest rollback or retry. Auto-create support ticket if unresolved.',
  },
  {
    id: 'saas-up-known-problem-agent',
    label: 'Agent-Assisted Debugger',
    description: 'User working with support to resolve a workflow or integration issue',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Pre-load error logs, recent actions, and system state. Provide diagnostic tools to support agent. Track resolution path.',
  },
  {
    id: 'saas-up-vip-info-agent',
    label: 'Enterprise Admin Concierge',
    description: 'Enterprise admin with priority access for configuration and reporting',
    contextAxis: 'vip',
    postureAxis: 'info-seeking',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Full admin scope access. Priority queue. Proactive health checks on workflows and integrations. CSM loop-in.',
  },
  {
    id: 'saas-up-vip-dispute-agent',
    label: 'Enterprise Escalation',
    description: 'Enterprise customer with data integrity concerns or SLA disputes',
    contextAxis: 'vip',
    postureAxis: 'dispute',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Immediate engineering escalation path. Full audit trail export. SLA compliance documentation auto-generated.',
  },
]

const saasAnalysis: DimensionAnalysisPayload = {
  tileId: 'saas-copilot',
  agentName: 'SaaS Copilot Agent',
  taskDimensions: saasTaskDimensions,
  dataDimensions: saasDataDimensions,
  userProfileDimensions: saasUserProfileDimensions,
  summaryText:
    '10 task dimensions sliced from 3 parent tasks across 5 knowledge domains. 6 behavioral user profiles defined on Context × Posture × Channel axes. 1 coverage gap flagged in permission documentation.',
}

// ============================================================================
// Research & Comparison Agent (research-comparison)
// ============================================================================

// Task Dimensions — sliced from 3 parent tasks in Context Definition
// Parent: "Literature Review" (literature-review) → 4 sub-tasks
// Parent: "Trend Analysis" (trend-analysis) → 3 sub-tasks
// Parent: "Citation Mapping" (citation-mapping) → 3 sub-tasks

const researchTaskDimensions: TaskDimension[] = [
  // ── From: Literature Review ──
  {
    id: 'research-task-keyword-search',
    label: 'Keyword & Semantic Search',
    description: 'Find papers matching keywords, semantic queries, or author names',
    parentTaskId: 'literature-review',
    intentCategories: ['keyword-search', 'semantic-search', 'author-lookup'],
    confidence: 'high',
  },
  {
    id: 'research-task-evidence-collection',
    label: 'Evidence Collection',
    description: 'Gather and organize findings, data points, and quotes from sources',
    parentTaskId: 'literature-review',
    intentCategories: ['data-extraction', 'finding-collection', 'methodology-catalog'],
    confidence: 'high',
  },
  {
    id: 'research-task-synthesis',
    label: 'Research Synthesis',
    description: 'Aggregate findings across multiple sources into coherent narrative',
    parentTaskId: 'literature-review',
    intentCategories: ['meta-review', 'cross-study-comparison', 'narrative-synthesis'],
    confidence: 'medium',
  },
  {
    id: 'research-task-gap-identification',
    label: 'Gap Identification',
    description: 'Identify research gaps, underexplored areas, and conflicting findings',
    parentTaskId: 'literature-review',
    intentCategories: ['gap-analysis', 'conflict-detection', 'opportunity-mapping'],
    confidence: 'low',
  },
  // ── From: Trend Analysis ──
  {
    id: 'research-task-temporal-trends',
    label: 'Temporal Trend Detection',
    description: 'Track how research focus and methodology evolve over time periods',
    parentTaskId: 'trend-analysis',
    intentCategories: ['publication-trend', 'methodology-shift', 'funding-pattern'],
    confidence: 'medium',
  },
  {
    id: 'research-task-vendor-evaluation',
    label: 'Vendor & Tool Evaluation',
    description: 'Compare vendors, tools, or solutions across standardized criteria',
    parentTaskId: 'trend-analysis',
    intentCategories: ['vendor-comparison', 'feature-matrix', 'pricing-analysis'],
    confidence: 'medium',
  },
  {
    id: 'research-task-recommendation',
    label: 'Scored Recommendation',
    description: 'Produce ranked recommendations with scoring rationale and sensitivity analysis',
    parentTaskId: 'trend-analysis',
    intentCategories: ['vendor-recommendation', 'tool-selection', 'methodology-recommendation'],
    confidence: 'low',
  },
  // ── From: Citation Mapping ──
  {
    id: 'research-task-citation-trace',
    label: 'Citation Chain Tracing',
    description: 'Follow citation chains forward and backward to map influence networks',
    parentTaskId: 'citation-mapping',
    intentCategories: ['forward-citation', 'backward-citation', 'co-citation-cluster'],
    confidence: 'high',
  },
  {
    id: 'research-task-impact-scoring',
    label: 'Impact & Credibility Scoring',
    description: 'Calculate influence metrics: h-index, citation count, journal ranking',
    parentTaskId: 'citation-mapping',
    intentCategories: ['impact-metric', 'journal-ranking', 'author-influence'],
    confidence: 'high',
  },
  {
    id: 'research-task-bibliography-export',
    label: 'Bibliography Management',
    description: 'Format, deduplicate, and export references in standard citation formats',
    parentTaskId: 'citation-mapping',
    intentCategories: ['citation-format', 'bibliography-export', 'reference-dedup'],
    confidence: 'high',
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

const researchUserProfileDimensions: UserProfileDimension[] = [
  {
    id: 'research-up-anon-info-self',
    label: 'Casual Researcher',
    description: 'Anonymous user doing exploratory research via self-service search',
    contextAxis: 'anonymous',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Public-access papers only. Basic search and comparison tools. Prompt registration for saved searches.',
  },
  {
    id: 'research-up-known-info-self',
    label: 'Independent Analyst',
    description: 'Authenticated user running structured research queries independently',
    contextAxis: 'known-customer',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Full corpus access. Saved search history. Citation export. Personalized recommendations based on past queries.',
  },
  {
    id: 'research-up-known-info-agent',
    label: 'Guided Researcher',
    description: 'Known user requesting help to refine complex multi-source analysis',
    contextAxis: 'known-customer',
    postureAxis: 'info-seeking',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Interactive refinement loop. Agent suggests search strategy and source diversification. Methodology guidance.',
  },
  {
    id: 'research-up-known-problem-self',
    label: 'Self-Service Validator',
    description: 'Known user checking claims or validating findings independently',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'self-service',
    behaviorImpact: 'Fact-check mode with source credibility scoring. Highlight conflicting evidence. Flag verification gaps.',
  },
  {
    id: 'research-up-vip-info-agent',
    label: 'Executive Briefing',
    description: 'Senior stakeholder needing curated, high-level research summaries',
    contextAxis: 'vip',
    postureAxis: 'info-seeking',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Executive summary format. Key findings only. Decision-ready recommendations. Priority analyst support.',
  },
  {
    id: 'research-up-vip-dispute-agent',
    label: 'Methodology Challenger',
    description: 'Expert disputing findings or methodology used in previous analysis',
    contextAxis: 'vip',
    postureAxis: 'dispute',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Full methodology transparency. Raw data access. Sensitivity analysis on disputed claims. Peer review loop-in.',
  },
]

const researchAnalysis: DimensionAnalysisPayload = {
  tileId: 'research-comparison',
  agentName: 'Research & Comparison Agent',
  taskDimensions: researchTaskDimensions,
  dataDimensions: researchDataDimensions,
  userProfileDimensions: researchUserProfileDimensions,
  summaryText:
    '10 task dimensions sliced from 3 parent tasks across 5 knowledge domains. 6 behavioral user profiles defined on Context × Posture × Channel axes. 3 coverage gaps flagged in methodology, statistical data, and vendor intelligence.',
}

// ============================================================================
// Lookup Map
// ============================================================================

// ============================================================================
// Batch Imports (7 remaining tiles)
// ============================================================================

import {
  DOC_INTELLIGENCE_DIMENSIONS,
  DECISION_WORKFLOW_DIMENSIONS,
  CODING_AGENT_DIMENSIONS,
} from './dimensionAnalysisData_batch1'

import {
  OPS_AGENT_DIMENSIONS,
  ONPREM_ASSISTANT_DIMENSIONS,
  MULTIMODAL_AGENT_DIMENSIONS,
  CONSUMER_CHAT_DIMENSIONS,
} from './dimensionAnalysisData_batch2'

const DIMENSION_ANALYSIS_DATA: Record<string, DimensionAnalysisPayload> = {
  'faq-knowledge': faqAnalysis,
  'saas-copilot': saasAnalysis,
  'research-comparison': researchAnalysis,
  'doc-intelligence': DOC_INTELLIGENCE_DIMENSIONS,
  'decision-workflow': DECISION_WORKFLOW_DIMENSIONS,
  'coding-agent': CODING_AGENT_DIMENSIONS,
  'ops-agent': OPS_AGENT_DIMENSIONS,
  'onprem-assistant': ONPREM_ASSISTANT_DIMENSIONS,
  'multimodal-agent': MULTIMODAL_AGENT_DIMENSIONS,
  'consumer-chat': CONSUMER_CHAT_DIMENSIONS,
}

export function getDimensionAnalysisData(tileId: string): DimensionAnalysisPayload | null {
  return DIMENSION_ANALYSIS_DATA[tileId] ?? null
}
