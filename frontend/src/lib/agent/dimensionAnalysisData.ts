import type {
  TaskDimension,
  DataDimension,
  UserProfileDimension,
  OutputDimension,
  ToolDimension,
  ToolState,
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
  // ── From: Order Status Lookup ──
  {
    id: 'faq-task-order-tracking',
    label: 'Order Status & Tracking',
    description: 'Retrieve live order status and carrier tracking information',
    parentTaskId: 'order-status-lookup',
    intentCategories: ['track-order', 'tracking-number', 'delivery-status'],
    confidence: 'high',
  },
  {
    id: 'faq-task-delivery-eta',
    label: 'Delivery ETA Update',
    description: 'Query carrier APIs for estimated delivery time and last-scan location',
    parentTaskId: 'delivery-tracking',
    intentCategories: ['when-arrive', 'eta-question', 'location-check'],
    confidence: 'high',
  },
  {
    id: 'faq-task-delivery-problem-diagnosis',
    label: 'Delivery Problem Diagnosis',
    description: 'Identify if order is delayed, lost, or missing tracking',
    parentTaskId: 'delivery-tracking',
    intentCategories: ['late-delivery', 'lost-package', 'no-tracking'],
    confidence: 'medium',
  },
  {
    id: 'faq-task-refund-processing',
    label: 'Refund Processing',
    description: 'Process refunds under $250 autonomously or route for approval',
    parentTaskId: 'refund-processing',
    intentCategories: ['refund-request', 'defective-item', 'wrong-item'],
    confidence: 'medium',
  },
  {
    id: 'faq-task-return-initiation',
    label: 'Return Label Generation',
    description: 'Generate return shipping label and RMA number with return window validation',
    parentTaskId: 'return-initiation',
    intentCategories: ['return-request', 'exchange-item', 'return-label'],
    confidence: 'high',
  },
  // ── From: Carrier Coordination ──
  {
    id: 'faq-task-carrier-investigation',
    label: 'Carrier Investigation',
    description: 'Open investigation with carrier for missing tracking, delays, or anomalies',
    parentTaskId: 'carrier-coordination',
    intentCategories: ['lost-tracking', 'carrier-delay', 'package-anomaly'],
    confidence: 'medium',
  },
  {
    id: 'faq-task-sla-enforcement',
    label: 'SLA Breach Detection',
    description: 'Detect and escalate deliveries exceeding carrier SLA (>3 days overdue)',
    parentTaskId: 'carrier-coordination',
    intentCategories: ['late-delivery', 'sla-breach', 'carrier-failure'],
    confidence: 'high',
  },
  {
    id: 'faq-task-replacement-routing',
    label: 'Replacement Item Routing',
    description: 'Process replacement shipments for damaged or defective orders',
    parentTaskId: 'refund-processing',
    intentCategories: ['damaged-goods', 'defective-product', 'reship-request'],
    confidence: 'medium',
  },
  {
    id: 'faq-task-escalation-handoff',
    label: 'Escalation Handoff',
    description: 'Route to tier-2 support when issue confidence is low or fraud signals detected',
    parentTaskId: 'order-status-lookup',
    intentCategories: ['dispute-claim', 'fraud-signal', 'complex-issue'],
    confidence: 'high',
  },
  {
    id: 'faq-task-resolution-logging',
    label: 'Resolution Confirmation',
    description: 'Record resolution outcome and trigger satisfaction follow-up',
    parentTaskId: 'order-status-lookup',
    intentCategories: ['resolution-confirm', 'satisfaction-check', 'follow-up'],
    confidence: 'high',
  },
]

const faqDataDimensions: DataDimension[] = [
  {
    id: 'faq-data-order-database',
    label: 'Order Database',
    depthScore: 5,
    subTopics: [
      { name: 'Order Details', depth: 5 },
      { name: 'Shipment Items', depth: 4 },
      { name: 'Refund Status', depth: 4 },
      { name: 'Customer Profile', depth: 3 },
    ],
    keyEntities: ['order-id', 'order-date', 'sku', 'quantity', 'payment-method', 'shipping-address', 'refund-status'],
    connectedDomains: ['Carrier Tracking Data', 'Customer Purchase History'],
    sourceAttribution: [
      { sourceId: 'orders-database-api', sourceName: 'Orders_Database.api', count: '45M active orders' },
    ],
  },
  {
    id: 'faq-data-carrier-tracking',
    label: 'Carrier Tracking Data',
    depthScore: 4,
    subTopics: [
      { name: 'Tracking Status', depth: 5 },
      { name: 'Delivery ETA', depth: 4 },
      { name: 'Scan Events', depth: 3 },
      { name: 'Carrier Exceptions', depth: 3 },
    ],
    keyEntities: ['tracking-number', 'carrier-name', 'delivery-eta', 'shipment-status', 'last-scan-location', 'exception-reason'],
    connectedDomains: ['Order Database', 'Customer Support'],
    sourceAttribution: [
      { sourceId: 'carrier-tracking-api', sourceName: 'Carrier_Tracking.api', count: '4 major carriers (UPS, FedEx, DHL, regional)' },
    ],
  },
  {
    id: 'faq-data-return-policy',
    label: 'Return & Refund Policy',
    depthScore: 3,
    subTopics: [
      { name: 'Return Windows', depth: 4 },
      { name: 'Refund Eligibility', depth: 4 },
      { name: 'Restocking Fees', depth: 3 },
      { name: 'RMA Process', depth: 3 },
    ],
    keyEntities: ['return-window', 'refund-policy', 'restocking-fee', 'exchange-eligibility', 'rma-number'],
    connectedDomains: ['Order Database', 'Customer History'],
    sourceAttribution: [
      { sourceId: 'return-policy-pdf', sourceName: 'Return_Policy_v3.pdf', count: '24 pages, 120 KB' },
    ],
  },
  {
    id: 'faq-data-customer-history',
    label: 'Customer Purchase History',
    depthScore: 3,
    subTopics: [
      { name: 'Purchase Frequency', depth: 4 },
      { name: 'Return Rate', depth: 3 },
      { name: 'Lifetime Value', depth: 3 },
      { name: 'Fraud Signals', depth: 2 },
    ],
    keyEntities: ['customer-id', 'lifetime-value', 'purchase-frequency', 'return-rate', 'dispute-history', 'vip-status'],
    connectedDomains: ['Order Database', 'Return & Refund Policy'],
    sourceAttribution: [
      { sourceId: 'customer-history-db', sourceName: 'Customer_History.db', count: 'Profile + purchase-order join' },
    ],
  },
]

// User Profile Dimensions — behavioral axes replacing role-based profiles
// Context × Posture × Channel = behavioral intersection

const faqUserProfileDimensions: UserProfileDimension[] = [
  {
    id: 'faq-up-anon-track-self',
    label: 'Anonymous Order Tracker',
    description: 'Guest checking order without account login. Uses tracking number or email.',
    contextAxis: 'anonymous',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Serve tracking info only. No account-specific refund eligibility. Prompt login for return options.',
  },
  {
    id: 'faq-up-known-track-self',
    label: 'Self-Service Tracker',
    description: 'Logged-in customer checking order status independently',
    contextAxis: 'known-customer',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Show full order history, return eligibility, previous returns. Offer label generator for eligible items.',
  },
  {
    id: 'faq-up-known-issue-self',
    label: 'Self-Service Resolver',
    description: 'Known customer trying to resolve delivery/return issue independently',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'self-service',
    behaviorImpact: 'Pull order history and return-rate. Check fraud flags. For first-time returners, auto-generate label. For flagged customers, escalate.',
  },
  {
    id: 'faq-up-known-issue-agent',
    label: 'Agent-Assisted Resolver',
    description: 'Known customer reporting order/delivery problem via live chat or phone',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Pre-populate agent dashboard with order, tracking, return-rate, and purchase history. Suggest resolution path.',
  },
  {
    id: 'faq-up-vip-issue-priority',
    label: 'VIP Priority Handler',
    description: 'High-value customer (top 5% lifetime value) with order issue',
    contextAxis: 'vip',
    postureAxis: 'problem-reporting',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Priority queue bypass. Dedicated agent routing. Expedited refund authority up to $2000. Proactive replacement offer.',
  },
  {
    id: 'faq-up-repeat-returner',
    label: 'Repeat Returner (Flagged)',
    description: 'Customer with >5 returns in 60 days or return-rate >30%. Fraud review needed.',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'All returns route to fraud team. Manual verification required. Refund limit reduced. Return window shortened to 15 days.',
  },
]

// Response Dimensions — decomposed across Outcome × Complexity × Interaction axes
// Core outputs: Order Status Update, Refund Confirmation, Return Label, Escalation Ticket

const faqOutputDimensions: OutputDimension[] = [
  // ── Order Status (success outcomes) ──
  { id: 'faq-od-1', label: 'Order Status — Success + Direct + One-shot', description: 'Tracking lookup returns live status and ETA', agentOutputId: 'faq-out-order-status', agentOutputLabel: 'Order Status Update', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'faq-od-2', label: 'Order Status — Success + Cross-referenced + Conversational', description: 'Multi-step diagnosis: order check + carrier lookup + problem assessment', agentOutputId: 'faq-out-order-status', agentOutputLabel: 'Order Status Update', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'faq-od-3', label: 'Order Status — Success + Inferred + Proactive', description: 'Proactively detect delays and offer solutions before customer asks', agentOutputId: 'faq-out-delivery-update', agentOutputLabel: 'Delivery ETA Update', outcome: 'success', complexity: 'inferred', interaction: 'proactive' },
  
  // ── Refund Processing (success outcomes) ──
  { id: 'faq-od-4', label: 'Refund — Success + Direct + One-shot', description: 'Autonomous refund under $250 processed immediately', agentOutputId: 'faq-out-refund-confirmation', agentOutputLabel: 'Refund Confirmation', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'faq-od-5', label: 'Refund — Partial + Direct + Conversational', description: 'Refund approved but requires return shipping first', agentOutputId: 'faq-out-refund-confirmation', agentOutputLabel: 'Refund Confirmation', outcome: 'partial', complexity: 'direct', interaction: 'conversational' },
  { id: 'faq-od-6', label: 'Refund — Escalation + Inferred + Conversational', description: 'High-value refund ($250+) routed to supervisor for approval', agentOutputId: 'faq-out-escalation-ticket', agentOutputLabel: 'Escalation Ticket', outcome: 'escalation', complexity: 'inferred', interaction: 'conversational' },
  
  // ── Return Label (success outcomes) ──
  { id: 'faq-od-7', label: 'Return Label — Success + Direct + One-shot', description: 'Return within 30-day window. Label generated immediately.', agentOutputId: 'faq-out-return-label', agentOutputLabel: 'Return Label + Instructions', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'faq-od-8', label: 'Return Label — Partial + Direct + Conversational', description: 'Return outside policy. Escalate for exception approval.', agentOutputId: 'faq-out-return-label', agentOutputLabel: 'Return Label + Instructions', outcome: 'partial', complexity: 'direct', interaction: 'conversational' },
  { id: 'faq-od-9', label: 'Return Label — Success + Cross-referenced + Conversational', description: 'Return with restocking fee explanation or exchange option', agentOutputId: 'faq-out-return-label', agentOutputLabel: 'Return Label + Instructions', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  
  // ── Carrier Investigation (escalation outcomes) ──
  { id: 'faq-od-10', label: 'Carrier Investigation — Escalation + Cross-referenced + Conversational', description: 'Missing tracking or SLA breach. Formal carrier investigation opened.', agentOutputId: 'faq-out-carrier-investigation', agentOutputLabel: 'Carrier Investigation Request', outcome: 'escalation', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'faq-od-11', label: 'Replacement Offer — Success + Inferred + Conversational', description: 'Damaged goods detected. Replacement shipped with return coordination.', agentOutputId: 'faq-out-replacement-offer', agentOutputLabel: 'Replacement Offer', outcome: 'success', complexity: 'inferred', interaction: 'conversational' },
  
  // ── Escalation Handoff (escalation outcomes) ──
  { id: 'faq-od-12', label: 'Escalation Ticket — Escalation + Direct + One-shot', description: 'Low confidence or fraud signal. Routed to tier-2 immediately.', agentOutputId: 'faq-out-escalation-ticket', agentOutputLabel: 'Escalation Ticket', outcome: 'escalation', complexity: 'direct', interaction: 'one-shot' },
  { id: 'faq-od-13', label: 'Escalation Ticket — Escalation + Cross-referenced + Conversational', description: 'Complex multi-step issue or dispute. Full context bundle with history.', agentOutputId: 'faq-out-escalation-ticket', agentOutputLabel: 'Escalation Ticket', outcome: 'escalation', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'faq-od-14', label: 'Escalation Ticket — Escalation + Inferred + Conversational', description: 'VIP customer or fraud flag. Route to senior team with priority.', agentOutputId: 'faq-out-escalation-ticket', agentOutputLabel: 'Escalation Ticket', outcome: 'escalation', complexity: 'inferred', interaction: 'conversational' },
  
  // ── Satisfaction Follow-up ──
  { id: 'faq-od-15', label: 'Follow-up — Success + Proactive + One-shot', description: 'Post-resolution satisfaction check via automated survey', agentOutputId: 'faq-out-satisfaction-followup', agentOutputLabel: 'Satisfaction Follow-up', outcome: 'success', complexity: 'direct', interaction: 'proactive' },
]

// Tool Dimensions — mapping tool states to CRUD-like operations and outcomes
const faqToolDimensions: ToolDimension[] = [
  {
    id: 'faq-tooldim-order-lookup',
    toolId: 'order-lookup-api',
    toolName: 'Order Lookup API',
    states: [
      { id: 'faq-ts-ol-read-success', label: 'Order Lookup Success', operation: 'read', outcome: 'success', description: 'Order found with complete details (order-id, sku, refund-status, shipping)' },
      { id: 'faq-ts-ol-read-failure', label: 'Order Not Found', operation: 'read', outcome: 'failure', description: 'Order not found by order-id or tracking-number' },
      { id: 'faq-ts-ol-read-timeout', label: 'Lookup Timeout', operation: 'read', outcome: 'timeout', description: 'Database query exceeded response time threshold (>2s)' },
      { id: 'faq-ts-ol-read-ratelimit', label: 'Rate Limited', operation: 'read', outcome: 'rate-limited', description: 'Order lookup API quota exceeded' },
    ],
  },
  {
    id: 'faq-tooldim-carrier-tracking',
    toolId: 'carrier-tracking-api',
    toolName: 'Carrier Tracking API',
    states: [
      { id: 'faq-ts-ct-read-success', label: 'Tracking Success', operation: 'read', outcome: 'success', description: 'Retrieved live tracking with delivery-eta and last-scan-location' },
      { id: 'faq-ts-ct-read-partial', label: 'Partial Tracking', operation: 'read', outcome: 'partial', description: 'Tracking exists but is stale (>6 hours old) or has exceptions' },
      { id: 'faq-ts-ct-read-missing', label: 'No Tracking', operation: 'read', outcome: 'failure', description: 'Tracking-number not recognized by carrier' },
      { id: 'faq-ts-ct-read-timeout', label: 'Carrier Timeout', operation: 'read', outcome: 'timeout', description: 'Carrier API slow or unresponsive' },
    ],
  },
  {
    id: 'faq-tooldim-refund-processor',
    toolId: 'refund-processor',
    toolName: 'Refund Processor',
    states: [
      { id: 'faq-ts-rp-create-success', label: 'Refund Approved', operation: 'create', outcome: 'success', description: 'Autonomous refund processed (amount < $250, no fraud flags)' },
      { id: 'faq-ts-rp-create-pending', label: 'Pending Approval', operation: 'create', outcome: 'partial', description: 'Refund exceeds autonomous limit. Routed to supervisor.' },
      { id: 'faq-ts-rp-create-rejected', label: 'Refund Rejected', operation: 'create', outcome: 'failure', description: 'Refund outside return window or fraud signal detected' },
      { id: 'faq-ts-rp-update-success', label: 'Refund Status Updated', operation: 'update', outcome: 'success', description: 'Refund status changed to processed/credited' },
    ],
  },
  {
    id: 'faq-tooldim-label-generator',
    toolId: 'return-label-generator',
    toolName: 'Return Label Generator',
    states: [
      { id: 'faq-ts-lg-create-success', label: 'Label Generated', operation: 'create', outcome: 'success', description: 'Return label PDF created with RMA-number and prepaid carrier link' },
      { id: 'faq-ts-lg-create-blocked', label: 'Label Blocked', operation: 'create', outcome: 'failure', description: 'Return outside 30-day window or return limit exceeded' },
      { id: 'faq-ts-lg-read-success', label: 'Label Retrieved', operation: 'read', outcome: 'success', description: 'Previously generated label retrieved from archive' },
    ],
  },
]

const faqAnalysis: DimensionAnalysisPayload = {
  tileId: 'faq-knowledge',
  agentName: 'Order Issue Resolution Agent',
  taskDimensions: faqTaskDimensions,
  dataDimensions: faqDataDimensions,
  userProfileDimensions: faqUserProfileDimensions,
  outputDimensions: faqOutputDimensions,
  toolDimensions: faqToolDimensions,
  summaryText:
    '10 task dimensions spanning order tracking, refund processing, return coordination, carrier investigation, and escalation. 6 behavioral user profiles defined on Context × Posture × Channel axes (customer types, fraud flags, VIP status). 15 response dimensions decomposing 8 core agent outputs across Outcome × Complexity × Interaction. 4 tools with 19 distinct state transitions. 2 fuzzy patterns for multi-carrier splits and fraudulent return claims.',
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

// Response Dimensions — decomposed across Outcome × Complexity × Interaction axes
// Core outputs: Query Result, Report Generation, Workflow Setup, Escalation Handoff

const saasOutputDimensions: OutputDimension[] = [
  // ── Query Result (success outcomes) ──
  { id: 'saas-od-1', label: 'Query Result — Success + Direct + One-shot', description: 'Single table query returning complete result set', agentOutputId: 'saas-out-query', agentOutputLabel: 'Query Result', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'saas-od-2', label: 'Query Result — Success + Cross-referenced + One-shot', description: 'Multi-table JOIN synthesizing data from multiple sources', agentOutputId: 'saas-out-query', agentOutputLabel: 'Query Result', outcome: 'success', complexity: 'cross-referenced', interaction: 'one-shot' },
  { id: 'saas-od-3', label: 'Query Result — Success + Inferred + One-shot', description: 'Query with inferred filters and aggregations', agentOutputId: 'saas-out-query', agentOutputLabel: 'Query Result', outcome: 'success', complexity: 'inferred', interaction: 'one-shot' },
  { id: 'saas-od-4', label: 'Query Result — Success + Cross-referenced + Conversational', description: 'Multi-turn refinement with progressive result filtering', agentOutputId: 'saas-out-query', agentOutputLabel: 'Query Result', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  
  // ── Query Result (partial/failure outcomes) ──
  { id: 'saas-od-5', label: 'Query Result — Partial + Direct + Conversational', description: 'Partial result requiring permission elevation or clarification', agentOutputId: 'saas-out-query', agentOutputLabel: 'Query Result', outcome: 'partial', complexity: 'direct', interaction: 'conversational' },
  { id: 'saas-od-6', label: 'Query Result — Failure + Direct + One-shot', description: 'Query rejected — invalid syntax or insufficient permissions', agentOutputId: 'saas-out-query', agentOutputLabel: 'Query Result', outcome: 'failure', complexity: 'direct', interaction: 'one-shot' },
  
  // ── Report Generation (success outcomes) ──
  { id: 'saas-od-7', label: 'Report — Success + Direct + One-shot', description: 'Standard report generated from template with static data', agentOutputId: 'saas-out-report', agentOutputLabel: 'Report Generation', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'saas-od-8', label: 'Report — Success + Cross-referenced + One-shot', description: 'Custom report synthesizing multiple data domains', agentOutputId: 'saas-out-report', agentOutputLabel: 'Report Generation', outcome: 'success', complexity: 'cross-referenced', interaction: 'one-shot' },
  { id: 'saas-od-9', label: 'Report — Success + Inferred + Conversational', description: 'AI-generated report with recommendations based on trends', agentOutputId: 'saas-out-report', agentOutputLabel: 'Report Generation', outcome: 'success', complexity: 'inferred', interaction: 'conversational' },
  
  // ── Report Generation (partial outcomes) ──
  { id: 'saas-od-10', label: 'Report — Partial + Cross-referenced + Conversational', description: 'Report with redacted fields due to permission constraints', agentOutputId: 'saas-out-report', agentOutputLabel: 'Report Generation', outcome: 'partial', complexity: 'cross-referenced', interaction: 'conversational' },
  
  // ── Workflow Setup (success outcomes) ──
  { id: 'saas-od-11', label: 'Workflow Setup — Success + Direct + Conversational', description: 'Linear workflow configuration with step-by-step guidance', agentOutputId: 'saas-out-workflow', agentOutputLabel: 'Workflow Setup', outcome: 'success', complexity: 'direct', interaction: 'conversational' },
  { id: 'saas-od-12', label: 'Workflow Setup — Success + Cross-referenced + Conversational', description: 'Complex workflow with conditional branches and integrations', agentOutputId: 'saas-out-workflow', agentOutputLabel: 'Workflow Setup', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'saas-od-13', label: 'Workflow Setup — Success + Inferred + Proactive', description: 'Proactive workflow template based on user intent and account type', agentOutputId: 'saas-out-workflow', agentOutputLabel: 'Workflow Setup', outcome: 'success', complexity: 'inferred', interaction: 'proactive' },
  
  // ── Workflow Setup (partial outcomes) ──
  { id: 'saas-od-14', label: 'Workflow Setup — Partial + Cross-referenced + Conversational', description: 'Workflow setup requiring validation or additional permissions', agentOutputId: 'saas-out-workflow', agentOutputLabel: 'Workflow Setup', outcome: 'partial', complexity: 'cross-referenced', interaction: 'conversational' },
  
  // ── Escalation Handoff (escalation outcomes) ──
  { id: 'saas-od-15', label: 'Escalation Handoff — Escalation + Direct + One-shot', description: 'Immediate escalation due to permission or data integrity concern', agentOutputId: 'saas-out-escalation', agentOutputLabel: 'Escalation Handoff', outcome: 'escalation', complexity: 'direct', interaction: 'one-shot' },
  { id: 'saas-od-16', label: 'Escalation Handoff — Escalation + Cross-referenced + Conversational', description: 'Escalation for complex multi-domain workflow requiring specialist', agentOutputId: 'saas-out-escalation', agentOutputLabel: 'Escalation Handoff', outcome: 'escalation', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'saas-od-17', label: 'Escalation Handoff — Escalation + Inferred + Conversational', description: 'Escalation to CSM based on inferred enterprise need', agentOutputId: 'saas-out-escalation', agentOutputLabel: 'Escalation Handoff', outcome: 'escalation', complexity: 'inferred', interaction: 'conversational' },
]

// Tool Dimensions — mapping tool states to CRUD-like operations and outcomes
const saasToolDimensions: ToolDimension[] = [
  {
    id: 'saas-tooldim-crm-api',
    toolId: 'crm-api',
    toolName: 'CRM API Client',
    states: [
      { id: 'saas-ts-crm-read-success', label: 'CRM Read Success', operation: 'read', outcome: 'success', description: 'Successfully retrieved record data from CRM' },
      { id: 'saas-ts-crm-read-failure', label: 'CRM Read Failure', operation: 'read', outcome: 'failure', description: 'Record not found or CRM database unavailable' },
      { id: 'saas-ts-crm-create-success', label: 'CRM Create Success', operation: 'create', outcome: 'success', description: 'Successfully created new record in CRM' },
      { id: 'saas-ts-crm-create-failure', label: 'CRM Create Failure', operation: 'create', outcome: 'failure', description: 'Record creation failed due to validation or duplicate' },
      { id: 'saas-ts-crm-update-success', label: 'CRM Update Success', operation: 'update', outcome: 'success', description: 'Successfully updated existing record' },
      { id: 'saas-ts-crm-update-failure', label: 'CRM Update Failure', operation: 'update', outcome: 'failure', description: 'Update failed due to permissions or lock conflict' },
    ],
  },
  {
    id: 'saas-tooldim-query-builder',
    toolId: 'query-builder',
    toolName: 'Query Builder',
    states: [
      { id: 'saas-ts-qb-read-success', label: 'Query Build Success', operation: 'read', outcome: 'success', description: 'Query successfully compiled and validated' },
      { id: 'saas-ts-qb-read-failure', label: 'Query Build Failure', operation: 'read', outcome: 'failure', description: 'Query syntax invalid or schema mismatch' },
      { id: 'saas-ts-qb-read-timeout', label: 'Query Timeout', operation: 'read', outcome: 'timeout', description: 'Query execution exceeded time threshold' },
      { id: 'saas-ts-qb-read-ratelimit', label: 'Query Rate Limited', operation: 'read', outcome: 'rate-limited', description: 'Query API throttled due to quota' },
    ],
  },
  {
    id: 'saas-tooldim-workflow-engine',
    toolId: 'workflow-engine',
    toolName: 'Workflow Execution Engine',
    states: [
      { id: 'saas-ts-we-create-success', label: 'Workflow Created', operation: 'create', outcome: 'success', description: 'Workflow definition successfully created and deployed' },
      { id: 'saas-ts-we-create-failure', label: 'Workflow Creation Failed', operation: 'create', outcome: 'failure', description: 'Workflow validation failed or deployment error' },
      { id: 'saas-ts-we-read-success', label: 'Workflow Fetch Success', operation: 'read', outcome: 'success', description: 'Existing workflow successfully retrieved' },
      { id: 'saas-ts-we-update-success', label: 'Workflow Update Success', operation: 'update', outcome: 'success', description: 'Workflow definition successfully updated' },
      { id: 'saas-ts-we-update-failure', label: 'Workflow Update Failed', operation: 'update', outcome: 'failure', description: 'Update failed due to active instances or validation' },
    ],
  },
  {
    id: 'saas-tooldim-permission-checker',
    toolId: 'permission-checker',
    toolName: 'Permission Checker',
    states: [
      { id: 'saas-ts-pc-read-success', label: 'Permission Granted', operation: 'read', outcome: 'success', description: 'User has required permission for requested action' },
      { id: 'saas-ts-pc-read-failure', label: 'Permission Denied', operation: 'read', outcome: 'failure', description: 'User lacks required permission scope' },
      { id: 'saas-ts-pc-read-timeout', label: 'Permission Check Timeout', operation: 'read', outcome: 'timeout', description: 'Permission service unavailable or slow' },
    ],
  },
]

const saasAnalysis: DimensionAnalysisPayload = {
  tileId: 'saas-copilot',
  agentName: 'Customer Success Monitoring Agent',
  taskDimensions: saasTaskDimensions,
  dataDimensions: saasDataDimensions,
  userProfileDimensions: saasUserProfileDimensions,
  outputDimensions: saasOutputDimensions,
  toolDimensions: saasToolDimensions,
  summaryText:
    '5 task dimensions sliced from 5 parent tasks across usage-analytics, churn-detection, health-scoring, and retention domains. 5 user profiles defined on Role × Seniority axes (CSM, AE, PM, support, admin). 6 response dimensions covering health-scores, churn-alerts, retention-actions, segment-analysis, and executive summaries. 3 tools with real-time event ingestion and anomaly detection. 1 validation gap flagged in multi-signal confirmation logic.',
}

// ============================================================================
// Underwriting Risk Analysis Agent (research-comparison)
// ============================================================================

// Task Dimensions — sliced from 5 parent tasks in Context Definition
// Parent: "Property Risk Assessment" (property-risk-assessment) → 3 sub-tasks
// Parent: "Claims Analysis" (claims-analysis) → 2 sub-tasks
// Parent: "Coverage Recommendation" (coverage-recommendation) → 3 sub-tasks
// Parent: "Regulatory Compliance Check" (regulatory-compliance-check) → 2 sub-tasks
// Parent: "Premium Calculation" (premium-calculation) → 2 sub-tasks

const researchTaskDimensions: TaskDimension[] = [
  // ── From: Property Risk Assessment ──
  {
    id: 'research-task-property-data-extraction',
    label: 'Property Data Extraction',
    description: 'Extract property attributes from inspection reports (construction-class, occupancy, year-built)',
    parentTaskId: 'property-risk-assessment',
    intentCategories: ['attribute-extraction', 'construction-analysis', 'occupancy-classification'],
    confidence: 'high',
  },
  {
    id: 'research-task-property-risk-baseline',
    label: 'Property Risk Baseline',
    description: 'Calculate base risk-score from property characteristics using actuarial tables',
    parentTaskId: 'property-risk-assessment',
    intentCategories: ['base-rate-calculation', 'risk-stratification', 'class-assignment'],
    confidence: 'high',
  },
  {
    id: 'research-task-protection-analysis',
    label: 'Protection Feature Analysis',
    description: 'Evaluate fire suppression, security, and loss-prevention features affecting premiums',
    parentTaskId: 'property-risk-assessment',
    intentCategories: ['protection-class', 'loss-control', 'feature-discount'],
    confidence: 'medium',
  },
  // ── From: Claims Analysis ──
  {
    id: 'research-task-claims-aggregation',
    label: 'Claims History Aggregation',
    description: 'Gather and normalize historical loss records, claim-amounts, and claim-dates',
    parentTaskId: 'claims-analysis',
    intentCategories: ['claims-retrieval', 'loss-normalization', 'frequency-calculation'],
    confidence: 'high',
  },
  {
    id: 'research-task-loss-pattern-detection',
    label: 'Loss Pattern Detection',
    description: 'Identify claim-type clusters, trends, and anomalies in loss-history',
    parentTaskId: 'claims-analysis',
    intentCategories: ['loss-ratio-analysis', 'trend-detection', 'severity-assessment'],
    confidence: 'medium',
  },
  // ── From: Coverage Recommendation ──
  {
    id: 'research-task-coverage-option-comparison',
    label: 'Coverage Option Comparison',
    description: 'Compare available coverage-limits, deductible options, and premium modifiers',
    parentTaskId: 'coverage-recommendation',
    intentCategories: ['coverage-matrix', 'deductible-analysis', 'option-ranking'],
    confidence: 'high',
  },
  {
    id: 'research-task-risk-coverage-matching',
    label: 'Risk-to-Coverage Matching',
    description: 'Recommend optimal coverage limits based on risk-score and property value',
    parentTaskId: 'coverage-recommendation',
    intentCategories: ['coverage-recommendation', 'limit-suggestion', 'insurable-value'],
    confidence: 'medium',
  },
  {
    id: 'research-task-alternative-generation',
    label: 'Alternative Coverage Generation',
    description: 'Produce ranked coverage alternatives with premium and risk trade-offs',
    parentTaskId: 'coverage-recommendation',
    intentCategories: ['option-ranking', 'sensitivity-analysis', 'trade-off-visualization'],
    confidence: 'medium',
  },
  // ── From: Regulatory Compliance Check ──
  {
    id: 'research-task-state-requirement-validation',
    label: 'State Requirement Validation',
    description: 'Verify coverage-limits meet state-specific minimums and surplus-lines rules',
    parentTaskId: 'regulatory-compliance-check',
    intentCategories: ['compliance-check', 'minimum-validation', 'state-rule-enforcement'],
    confidence: 'high',
  },
  {
    id: 'research-task-anti-discrimination-audit',
    label: 'Anti-Discrimination Audit',
    description: 'Monitor risk-score for disparate impact and fair-lending violations',
    parentTaskId: 'regulatory-compliance-check',
    intentCategories: ['fairness-audit', 'protected-class-check', 'policy-validation'],
    confidence: 'medium',
  },
  // ── From: Premium Calculation ──
  {
    id: 'research-task-rate-factor-application',
    label: 'Rating Factor Application',
    description: 'Apply base-rate × loss-ratio × trend-factor to compute premium',
    parentTaskId: 'premium-calculation',
    intentCategories: ['premium-calculation', 'factor-application', 'surcharge-computation'],
    confidence: 'high',
  },
  {
    id: 'research-task-discount-assessment',
    label: 'Discount & Surcharge Assessment',
    description: 'Calculate bundling discounts, loyalty credits, and risk surcharges',
    parentTaskId: 'premium-calculation',
    intentCategories: ['discount-eligibility', 'surcharge-triggers', 'rate-modification'],
    confidence: 'medium',
  },
]

const researchDataDimensions: DataDimension[] = [
  {
    id: 'research-data-property-inspection',
    label: 'Property Inspection Data',
    depthScore: 5,
    subTopics: [
      { name: 'Property Attributes', depth: 5 },
      { name: 'Construction Details', depth: 5 },
      { name: 'Occupancy Classification', depth: 4 },
      { name: 'Protection Features', depth: 4 },
      { name: 'Loss Prevention Systems', depth: 3 },
    ],
    keyEntities: ['property-type', 'construction-class', 'occupancy-code', 'protection-class', 'year-built'],
    connectedDomains: ['Claims History Data', 'Actuarial & Risk Model Data'],
    sourceAttribution: [
      { sourceId: 'research-property-inspection', sourceName: 'Property_Inspection_Report.pdf', count: '6.2 MB full reports' },
    ],
  },
  {
    id: 'research-data-claims-history',
    label: 'Claims History Data',
    depthScore: 4,
    subTopics: [
      { name: 'Claim Records', depth: 5 },
      { name: 'Loss Amounts & Severity', depth: 4 },
      { name: 'Claim Frequency Patterns', depth: 4 },
      { name: 'Subrogation & Recovery', depth: 3 },
    ],
    keyEntities: ['claim-amount', 'claim-type', 'loss-date', 'claim-status', 'subrogation-recovery'],
    connectedDomains: ['Property Inspection Data', 'Actuarial & Risk Model Data'],
    sourceAttribution: [
      { sourceId: 'research-claims-history', sourceName: 'Claims_History_Export.csv', count: '2.1 MB historical records' },
    ],
  },
  {
    id: 'research-data-actuarial-models',
    label: 'Actuarial & Risk Model Data',
    depthScore: 4,
    subTopics: [
      { name: 'Base Rates by Class', depth: 5 },
      { name: 'Loss Ratio Tables', depth: 4 },
      { name: 'Trend Factors', depth: 3 },
      { name: 'Credibility Weights', depth: 3 },
    ],
    keyEntities: ['base-rate', 'loss-ratio', 'expense-ratio', 'trend-factor', 'credibility-weight'],
    connectedDomains: ['Property Inspection Data', 'Claims History Data'],
    sourceAttribution: [
      { sourceId: 'research-actuarial-tables', sourceName: 'Actuarial_Tables_2025.xlsx', count: '1.8 MB models' },
    ],
  },
  {
    id: 'research-data-coverage-options',
    label: 'Regulatory & Coverage Data',
    depthScore: 3,
    subTopics: [
      { name: 'Coverage Limits', depth: 4 },
      { name: 'Deductible Options', depth: 4 },
      { name: 'State Minimums', depth: 3 },
      { name: 'Surplus-Lines Rules', depth: 3 },
    ],
    keyEntities: ['coverage-limit', 'deductible-option', 'state-minimum', 'surplus-lines', 'admitted-status'],
    connectedDomains: ['Property Inspection Data', 'Actuarial & Risk Model Data'],
    sourceAttribution: [
      { sourceId: 'research-regulatory-coverage', sourceName: 'State_Coverage_Requirements.pdf', count: '890 KB compliance rules' },
    ],
    gapNote: 'Coverage options updated quarterly; state minimums vary by jurisdiction',
  },
]

const researchUserProfileDimensions: UserProfileDimension[] = [
  {
    id: 'research-up-system-user',
    label: 'System User',
    description: 'Batch risk scoring and model validation user processing submissions in bulk',
    contextAxis: 'known-customer',
    postureAxis: 'problem-solving',
    channelAxis: 'automated',
    behaviorImpact: 'Batch API access. Model version control. Direct integration with policy management system.',
  },
  {
    id: 'research-up-underwriter',
    label: 'Underwriter',
    description: 'Insurance underwriter reviewing and approving applications and risk recommendations',
    contextAxis: 'known-customer',
    postureAxis: 'decision-making',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Full risk assessment details. Override controls. Audit trail for all decisions. Supervisory reporting.',
  },
  {
    id: 'research-up-broker',
    label: 'Broker/Agent',
    description: 'Insurance broker or agent submitting applications and checking status',
    contextAxis: 'known-customer',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Application portal access. Coverage recommendations summary only. Status tracking and status updates.',
  },
  {
    id: 'research-up-actuary',
    label: 'Actuary',
    description: 'Qualified actuary validating risk models and adjusting rating factors',
    contextAxis: 'expert',
    postureAxis: 'model-validation',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Full model access. Parameter tuning capability. Backtesting and sensitivity analysis tools.',
  },
  {
    id: 'research-up-claims-adjuster',
    label: 'Claims Adjuster',
    description: 'Claims professional reviewing loss history and impact on renewals',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'self-service',
    behaviorImpact: 'Loss history deep-dive. Claim severity and frequency trends. Renewal impact assessment.',
  },
  {
    id: 'research-up-compliance-officer',
    label: 'Compliance Officer',
    description: 'Regulatory compliance professional auditing underwriting decisions',
    contextAxis: 'expert',
    postureAxis: 'oversight',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Full audit trail access. Disparate impact analysis. State regulation compliance checks.',
  },
]

// Response Dimensions — decomposed across Outcome × Complexity × Interaction axes
// Core outputs: Comparative Analysis, Citation Summary, Methodology Review, Escalation Handoff

const researchOutputDimensions: OutputDimension[] = [
  // ── Comparative Analysis (success outcomes) ──
  { id: 'research-od-1', label: 'Comparative Analysis — Success + Direct + One-shot', description: 'Side-by-side feature comparison from structured tables', agentOutputId: 'research-out-comparison', agentOutputLabel: 'Comparative Analysis', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'research-od-2', label: 'Comparative Analysis — Success + Cross-referenced + One-shot', description: 'Synthesis comparing papers from multiple methodologies', agentOutputId: 'research-out-comparison', agentOutputLabel: 'Comparative Analysis', outcome: 'success', complexity: 'cross-referenced', interaction: 'one-shot' },
  { id: 'research-od-3', label: 'Comparative Analysis — Success + Inferred + One-shot', description: 'Comparative analysis with inferred quality rankings', agentOutputId: 'research-out-comparison', agentOutputLabel: 'Comparative Analysis', outcome: 'success', complexity: 'inferred', interaction: 'one-shot' },
  { id: 'research-od-4', label: 'Comparative Analysis — Success + Cross-referenced + Conversational', description: 'Multi-turn analysis with progressive refinement of criteria', agentOutputId: 'research-out-comparison', agentOutputLabel: 'Comparative Analysis', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  
  // ── Comparative Analysis (partial outcomes) ──
  { id: 'research-od-5', label: 'Comparative Analysis — Partial + Cross-referenced + Conversational', description: 'Incomplete comparison due to missing methodological data', agentOutputId: 'research-out-comparison', agentOutputLabel: 'Comparative Analysis', outcome: 'partial', complexity: 'cross-referenced', interaction: 'conversational' },
  
  // ── Citation Summary (success outcomes) ──
  { id: 'research-od-6', label: 'Citation Summary — Success + Direct + One-shot', description: 'Direct citation count and h-index metrics', agentOutputId: 'research-out-citation', agentOutputLabel: 'Citation Summary', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'research-od-7', label: 'Citation Summary — Success + Cross-referenced + One-shot', description: 'Citation chain analysis with influence network mapping', agentOutputId: 'research-out-citation', agentOutputLabel: 'Citation Summary', outcome: 'success', complexity: 'cross-referenced', interaction: 'one-shot' },
  { id: 'research-od-8', label: 'Citation Summary — Success + Inferred + Conversational', description: 'Inferred trends and emerging topics in citation patterns', agentOutputId: 'research-out-citation', agentOutputLabel: 'Citation Summary', outcome: 'success', complexity: 'inferred', interaction: 'conversational' },
  
  // ── Methodology Review (success outcomes) ──
  { id: 'research-od-9', label: 'Methodology Review — Success + Direct + One-shot', description: 'Direct methodology classification and validity assessment', agentOutputId: 'research-out-methodology', agentOutputLabel: 'Methodology Review', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'research-od-10', label: 'Methodology Review — Success + Cross-referenced + Conversational', description: 'Comparative methodology analysis across papers with field norms', agentOutputId: 'research-out-methodology', agentOutputLabel: 'Methodology Review', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'research-od-11', label: 'Methodology Review — Success + Inferred + Conversational', description: 'Expert assessment with inferred methodological gaps and recommendations', agentOutputId: 'research-out-methodology', agentOutputLabel: 'Methodology Review', outcome: 'success', complexity: 'inferred', interaction: 'conversational' },
  
  // ── Methodology Review (partial outcomes) ──
  { id: 'research-od-12', label: 'Methodology Review — Partial + Cross-referenced + Conversational', description: 'Incomplete review due to limited methodology data extraction', agentOutputId: 'research-out-methodology', agentOutputLabel: 'Methodology Review', outcome: 'partial', complexity: 'cross-referenced', interaction: 'conversational' },
  
  // ── Escalation Handoff (escalation outcomes) ──
  { id: 'research-od-13', label: 'Escalation Handoff — Escalation + Direct + One-shot', description: 'Query scope beyond system capability — routing to human researcher', agentOutputId: 'research-out-escalation', agentOutputLabel: 'Escalation Handoff', outcome: 'escalation', complexity: 'direct', interaction: 'one-shot' },
  { id: 'research-od-14', label: 'Escalation Handoff — Escalation + Cross-referenced + Conversational', description: 'Escalation for novel research question requiring domain expert synthesis', agentOutputId: 'research-out-escalation', agentOutputLabel: 'Escalation Handoff', outcome: 'escalation', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'research-od-15', label: 'Escalation Handoff — Escalation + Inferred + Conversational', description: 'Escalation due to inferred high-stakes decision requiring human validation', agentOutputId: 'research-out-escalation', agentOutputLabel: 'Escalation Handoff', outcome: 'escalation', complexity: 'inferred', interaction: 'conversational' },
]

// Tool Dimensions — mapping tool states to CRUD-like operations and outcomes
const researchToolDimensions: ToolDimension[] = [
  {
    id: 'research-tooldim-paper-search',
    toolId: 'paper-search',
    toolName: 'Research Paper Search Engine',
    states: [
      { id: 'research-ts-ps-read-success', label: 'Paper Search Success', operation: 'read', outcome: 'success', description: 'Successfully retrieved relevant papers from corpus' },
      { id: 'research-ts-ps-read-failure', label: 'Paper Search Failure', operation: 'read', outcome: 'failure', description: 'No papers found matching query criteria' },
      { id: 'research-ts-ps-read-timeout', label: 'Search Timeout', operation: 'read', outcome: 'timeout', description: 'Full-text search exceeded query time limit' },
      { id: 'research-ts-ps-read-ratelimit', label: 'Search Rate Limited', operation: 'read', outcome: 'rate-limited', description: 'Search API throttled due to quota limits' },
    ],
  },
  {
    id: 'research-tooldim-citation-engine',
    toolId: 'citation-engine',
    toolName: 'Citation Graph Engine',
    states: [
      { id: 'research-ts-ce-read-success', label: 'Citation Fetch Success', operation: 'read', outcome: 'success', description: 'Successfully retrieved citation links and metrics' },
      { id: 'research-ts-ce-read-failure', label: 'Citation Fetch Failure', operation: 'read', outcome: 'failure', description: 'Citation data unavailable for queried papers' },
      { id: 'research-ts-ce-read-timeout', label: 'Citation Graph Timeout', operation: 'read', outcome: 'timeout', description: 'Citation chain traversal exceeded time threshold' },
    ],
  },
  {
    id: 'research-tooldim-comparison-matrix',
    toolId: 'comparison-matrix',
    toolName: 'Comparison Matrix Builder',
    states: [
      { id: 'research-ts-cm-create-success', label: 'Matrix Build Success', operation: 'create', outcome: 'success', description: 'Comparison matrix successfully built from paper set' },
      { id: 'research-ts-cm-create-failure', label: 'Matrix Build Failure', operation: 'create', outcome: 'failure', description: 'Matrix construction failed — insufficient extractable data' },
      { id: 'research-ts-cm-read-success', label: 'Matrix Fetch Success', operation: 'read', outcome: 'success', description: 'Saved comparison matrix successfully retrieved' },
      { id: 'research-ts-cm-update-success', label: 'Matrix Update Success', operation: 'update', outcome: 'success', description: 'Comparison criteria successfully updated' },
    ],
  },
]

const researchAnalysis: DimensionAnalysisPayload = {
  tileId: 'research-comparison',
  agentName: 'Research & Comparison Agent',
  taskDimensions: researchTaskDimensions,
  dataDimensions: researchDataDimensions,
  userProfileDimensions: researchUserProfileDimensions,
  outputDimensions: researchOutputDimensions,
  toolDimensions: researchToolDimensions,
  summaryText:
    '10 task dimensions sliced from 3 parent tasks across 5 knowledge domains. 6 behavioral user profiles defined on Context × Posture × Channel axes. 15 response dimensions decomposing 4 core agent outputs across Outcome × Complexity × Interaction. 3 tools with 12 distinct state transitions. 3 coverage gaps flagged in methodology, statistical data, and vendor intelligence.',
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
