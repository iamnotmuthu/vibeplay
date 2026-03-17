import type {
  TaskDimension,
  DataDimension,
  UserProfileDimension,
  OutputDimension,
  ToolDimension,
  DimensionAnalysisPayload,
} from '@/store/agentTypes'

// ============================================================================
// Invoice Processing Agent V3 (invoice-processing)
// ============================================================================

// Task Dimensions — sliced from 8 parent tasks in Context Definition
// Parent tasks: invoice-ingestion, line-item-extraction, format-normalization, po-matching,
//               charge-validation, cost-aggregation, trend-analysis, report-generation

const invoiceTaskDimensions: TaskDimension[] = [
  // ── From: invoice-ingestion ──
  {
    id: 'inv-task-ingest-aws',
    label: 'AWS Cost & Usage Ingestion',
    description: 'Collect AWS cost data from S3 CUR exports with daily incremental updates',
    parentTaskId: 'invoice-ingestion',
    intentCategories: ['aws-costs', 'infrastructure-billing', 'cloud-spend'],
    confidence: 'high',
  },
  {
    id: 'inv-task-ingest-gcp',
    label: 'GCP Billing Ingestion',
    description: 'Fetch GCP billing data from BigQuery with hourly granularity and nested JSON parsing',
    parentTaskId: 'invoice-ingestion',
    intentCategories: ['gcp-costs', 'google-cloud-billing', 'data-warehouse-spend'],
    confidence: 'high',
  },
  {
    id: 'inv-task-ingest-staples',
    label: 'Staples Invoice Ingestion',
    description: 'Download Staples invoices from portal and handle variable PDF formats',
    parentTaskId: 'invoice-ingestion',
    intentCategories: ['office-supplies', 'vendor-billing', 'non-cloud-expenses'],
    confidence: 'medium',
  },
  // ── From: line-item-extraction ──
  {
    id: 'inv-task-extract-csv',
    label: 'CSV Line Item Extraction',
    description: 'Parse AWS CSV line items with 50+ columns and handle incremental updates',
    parentTaskId: 'line-item-extraction',
    intentCategories: ['tabular-parsing', 'csv-extraction', 'structured-data'],
    confidence: 'high',
  },
  {
    id: 'inv-task-extract-json',
    label: 'JSON/BigQuery Extraction',
    description: 'Extract line items from nested JSON BigQuery schema with hierarchical service/SKU structure',
    parentTaskId: 'line-item-extraction',
    intentCategories: ['nested-data', 'schema-parsing', 'hierarchy-flattening'],
    confidence: 'high',
  },
  {
    id: 'inv-task-extract-pdf-table',
    label: 'PDF Table Extraction',
    description: 'Extract structured tables from Staples PDFs using computer vision and text extraction',
    parentTaskId: 'line-item-extraction',
    intentCategories: ['pdf-parsing', 'table-extraction', 'document-analysis'],
    confidence: 'medium',
  },
  {
    id: 'inv-task-extract-pdf-image',
    label: 'Scanned Invoice OCR',
    description: 'Extract text from scanned archive PDFs using OCR with confidence scoring',
    parentTaskId: 'line-item-extraction',
    intentCategories: ['ocr-processing', 'image-text-extraction', 'legacy-data'],
    confidence: 'medium',
  },
  // ── From: format-normalization ──
  {
    id: 'inv-task-normalize-schema',
    label: 'Schema Normalization',
    description: 'Convert AWS CSV, GCP JSON, Staples PDF to unified 15-field relational schema',
    parentTaskId: 'format-normalization',
    intentCategories: ['data-mapping', 'field-standardization', 'schema-unification'],
    confidence: 'high',
  },
  {
    id: 'inv-task-normalize-currency',
    label: 'Currency & Amount Handling',
    description: 'Standardize multi-currency amounts to base currency with conversion rates and rounding',
    parentTaskId: 'format-normalization',
    intentCategories: ['currency-conversion', 'amount-normalization', 'precision-handling'],
    confidence: 'medium',
  },
  // ── From: po-matching ──
  {
    id: 'inv-task-match-exact-po',
    label: 'Exact PO Number Matching',
    description: 'Match invoice line items to POs using exact PO number field with high precision',
    parentTaskId: 'po-matching',
    intentCategories: ['po-lookup', 'exact-matching', 'reference-linking'],
    confidence: 'high',
  },
  {
    id: 'inv-task-match-fuzzy',
    label: 'Fuzzy Multi-field Matching',
    description: 'Match vendor + amount combination with 2% tolerance using fuzzy string matching for descriptions',
    parentTaskId: 'po-matching',
    intentCategories: ['fuzzy-matching', 'multi-criteria-matching', 'tolerance-handling'],
    confidence: 'medium',
  },
  // ── From: charge-validation ──
  {
    id: 'inv-task-validate-amount',
    label: 'Charge Amount Validation',
    description: 'Verify invoice amounts match approved PO amounts and contracted rates within tolerance',
    parentTaskId: 'charge-validation',
    intentCategories: ['amount-verification', 'contract-compliance', 'discrepancy-detection'],
    confidence: 'high',
  },
  // ── From: cost-aggregation ──
  {
    id: 'inv-task-aggregate-vendor',
    label: 'Vendor Cost Aggregation',
    description: 'Sum costs per vendor (AWS, GCP, Staples) with temporal alignment for billing cycles',
    parentTaskId: 'cost-aggregation',
    intentCategories: ['vendor-rollup', 'cost-summation', 'budget-tracking'],
    confidence: 'high',
  },
  {
    id: 'inv-task-aggregate-category',
    label: 'Category Cost Aggregation',
    description: 'Aggregate costs by 18+ categories (compute, storage, networking, supplies, etc.)',
    parentTaskId: 'cost-aggregation',
    intentCategories: ['category-breakdown', 'expense-classification', 'budget-analysis'],
    confidence: 'high',
  },
  // ── From: trend-analysis ──
  {
    id: 'inv-task-trend-growth',
    label: 'Growth Rate Analysis',
    description: 'Calculate MoM and YoY growth rates per category with seasonal adjustment',
    parentTaskId: 'trend-analysis',
    intentCategories: ['trend-calculation', 'growth-analysis', 'forecasting'],
    confidence: 'medium',
  },
  {
    id: 'inv-task-trend-anomaly',
    label: 'Anomaly Detection',
    description: 'Identify cost outliers using z-score (>2SD) and IQR methods across vendors',
    parentTaskId: 'trend-analysis',
    intentCategories: ['outlier-detection', 'statistical-analysis', 'alert-generation'],
    confidence: 'medium',
  },
  // ── From: report-generation ──
  {
    id: 'inv-task-report-consolidated',
    label: 'Consolidated Report Generation',
    description: 'Generate monthly/quarterly reports with tables, charts, narrative analysis, and source citations',
    parentTaskId: 'report-generation',
    intentCategories: ['report-synthesis', 'multi-format-output', 'executive-summary'],
    confidence: 'high',
  },
]

const invoiceDataDimensions: DataDimension[] = [
  // AWS Data
  {
    id: 'inv-data-aws-cur',
    label: 'AWS Cost & Usage Report (CSV)',
    subTopics: [
      { name: 'Service Costs', depth: 5 },
      { name: 'Regional Distribution', depth: 4 },
      { name: 'Line Item Details', depth: 5 },
      { name: 'Tax & Credits', depth: 3 },
    ],
    depthScore: 5,
    keyEntities: ['service-name', 'usage-type', 'region', 'unit-price', 'quantity', 'amount', 'currency', 'line-item-id'],
    connectedDomains: ['GCP Billing', 'Purchase Order Database', 'Cost Categories'],
    sourceAttribution: [
      { sourceId: 'aws-cur-s3', sourceName: 'AWS_CUR_S3_Bucket', count: '14 CSV files, 384K+ line items, 450 MB/month' },
    ],
  },
  // GCP Data
  {
    id: 'inv-data-gcp-billing',
    label: 'GCP Cloud Billing Export (BigQuery)',
    subTopics: [
      { name: 'Service Hierarchy', depth: 4 },
      { name: 'SKU Details', depth: 4 },
      { name: 'Project Attribution', depth: 3 },
      { name: 'Regional Breakdown', depth: 4 },
    ],
    depthScore: 5,
    keyEntities: ['service-id', 'service-description', 'sku-id', 'sku-description', 'project-id', 'region', 'amount', 'currency'],
    connectedDomains: ['AWS Cost', 'Purchase Order Database', 'Cost Categories'],
    sourceAttribution: [
      { sourceId: 'gcp-bq-export', sourceName: 'GCP_BigQuery_Billing', count: '892K+ records, hourly updates' },
    ],
  },
  // Staples Data
  {
    id: 'inv-data-staples-portal',
    label: 'Staples Business Portal (PDF)',
    subTopics: [
      { name: 'Invoice Tables', depth: 4 },
      { name: 'Order Metadata', depth: 3 },
      { name: 'Line Items', depth: 4 },
      { name: 'Embedded Images', depth: 2 },
    ],
    depthScore: 4,
    keyEntities: ['invoice-number', 'order-date', 'invoice-date', 'item-description', 'quantity', 'unit-price', 'total-amount'],
    connectedDomains: ['AWS Cost', 'GCP Billing', 'Purchase Order Database'],
    sourceAttribution: [
      { sourceId: 'staples-portal', sourceName: 'Staples_Invoices', count: '36 PDFs (24 table, 8 mixed, 4 text-only)' },
    ],
  },
  // PO Database
  {
    id: 'inv-data-po-database',
    label: 'Purchase Order Database (SQL)',
    subTopics: [
      { name: 'PO Headers', depth: 4 },
      { name: 'Line Items', depth: 4 },
      { name: 'Vendor Master', depth: 3 },
      { name: 'Contract Terms', depth: 3 },
    ],
    depthScore: 4,
    keyEntities: ['po-number', 'vendor-id', 'approved-amount', 'po-date', 'status', 'category', 'contract-rate', 'tolerance'],
    connectedDomains: ['AWS CUR', 'GCP Billing', 'Staples Invoices'],
    sourceAttribution: [
      { sourceId: 'po-db', sourceName: 'PostgreSQL_PO_DB', count: '2,847 POs, 8,934 line items, 47 vendors' },
    ],
  },
  // Historical Archive
  {
    id: 'inv-data-archive',
    label: 'Historical Invoice Archive (Mixed)',
    subTopics: [
      { name: 'Legacy CSV Invoices', depth: 3 },
      { name: 'Scanned PDF Images', depth: 3 },
      { name: 'OCR Quality Variation', depth: 2 },
      { name: 'Data Gaps', depth: 2 },
    ],
    depthScore: 3,
    keyEntities: ['invoice-id', 'vendor-id', 'line-item', 'amount', 'ocr-confidence', 'date-range'],
    connectedDomains: ['AWS CUR', 'GCP Billing', 'Staples Invoices', 'PO Database'],
    sourceAttribution: [
      { sourceId: 'archive-storage', sourceName: 'Invoice_Archive', count: '120 files (89 CSV, 31 PDF images)' },
    ],
    gapNote: 'Q2 2021 missing 2 months; OCR quality 88-96% for image PDFs; 6% of expected invoices missing for gap periods',
  },
]

const invoiceUserProfileDimensions: UserProfileDimension[] = [
  {
    id: 'inv-up-finance-analyst',
    label: 'Finance Analyst (Cost Owner)',
    description: 'Finance team member analyzing costs for budgeting and optimization decisions',
    contextAxis: 'known-user',
    postureAxis: 'analytical',
    channelAxis: 'self-service',
    behaviorImpact: 'Show detailed cost breakdowns, trend analysis, anomaly alerts. Enable drill-down from aggregate to line-item level.',
  },
  {
    id: 'inv-up-exec-brief',
    label: 'Executive (Budget Planning)',
    description: 'Executive reviewing high-level spend summary for forecasting and board reporting',
    contextAxis: 'leadership',
    postureAxis: 'decision-making',
    channelAxis: 'self-service',
    behaviorImpact: 'Provide summary reports with key metrics (total spend, MoM growth, top categories). No line-item detail unless requested.',
  },
  {
    id: 'inv-up-procurement',
    label: 'Procurement Manager (PO Validator)',
    description: 'Procurement team validating invoices against POs for payment approval',
    contextAxis: 'compliance',
    postureAxis: 'validation',
    channelAxis: 'workflow-integrated',
    behaviorImpact: 'Highlight PO mismatches, discrepancies, flagged amounts. Enable quick escalation for supervisor approval.',
  },
]

const invoiceOutputDimensions: OutputDimension[] = [
  { id: 'inv-od-1', label: 'Cost Breakdown — Success + Direct + One-shot', description: 'Simple query returns cost totals with vendor/category breakdown', agentOutputId: 'inv-out-cost-breakdown', agentOutputLabel: 'Cost Breakdown', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'inv-od-2', label: 'Cost Breakdown — Success + Cross-referenced + Conversational', description: 'Multi-vendor query requires temporal alignment and period reconciliation', agentOutputId: 'inv-out-cost-breakdown', agentOutputLabel: 'Cost Breakdown', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'inv-od-3', label: 'Trend Report — Success + Cross-referenced + Conversational', description: '6+ month trend analysis with growth rates and seasonal patterns', agentOutputId: 'inv-out-trend-report', agentOutputLabel: 'Trend Report', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'inv-od-4', label: 'Trend Report — Partial + Inferred + Conversational', description: '3-5 months data available; uses statistical inference for patterns', agentOutputId: 'inv-out-trend-report', agentOutputLabel: 'Trend Report', outcome: 'partial', complexity: 'inferred', interaction: 'conversational' },
  { id: 'inv-od-5', label: 'Validation Result — Success + Direct + One-shot', description: 'PO match found; invoice validated against approved amount', agentOutputId: 'inv-out-validation-result', agentOutputLabel: 'Validation Result', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'inv-od-6', label: 'Validation Result — Escalation + Cross-referenced + Conversational', description: 'Discrepancy found; requires manual review and approval before payment', agentOutputId: 'inv-out-validation-result', agentOutputLabel: 'Validation Result', outcome: 'escalation', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'inv-od-7', label: 'Anomaly Alert — Success + Inferred + Proactive', description: 'Statistical anomaly detected (>2SD from baseline); proactive notification', agentOutputId: 'inv-out-anomaly-alert', agentOutputLabel: 'Anomaly Alert', outcome: 'success', complexity: 'inferred', interaction: 'proactive' },
  { id: 'inv-od-8', label: 'Anomaly Alert — Partial + Inferred + Conversational', description: 'Suspected anomaly (1.5-2SD); requires user context to confirm', agentOutputId: 'inv-out-anomaly-alert', agentOutputLabel: 'Anomaly Alert', outcome: 'partial', complexity: 'inferred', interaction: 'conversational' },
  { id: 'inv-od-9', label: 'Consolidated Report — Success + Cross-referenced + Conversational', description: 'Full monthly report with all vendors, categories, trends, and citations', agentOutputId: 'inv-out-consolidated-report', agentOutputLabel: 'Consolidated Report', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'inv-od-10', label: 'Consolidated Report — Partial + Cross-referenced + Conversational', description: 'Report with <15% data missing; uses archive fallback or estimation', agentOutputId: 'inv-out-consolidated-report', agentOutputLabel: 'Consolidated Report', outcome: 'partial', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'inv-od-11', label: 'Simple Answer — Success + Direct + One-shot', description: 'Direct factual answer to cost question (What was X? How much was Y?)', agentOutputId: 'inv-out-simple-answer', agentOutputLabel: 'Simple Answer', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
]

const invoiceToolDimensions: ToolDimension[] = [
  {
    id: 'inv-tooldim-aws',
    toolId: 'aws-cost-explorer',
    toolName: 'AWS Cost Explorer API',
    states: [
      { id: 'inv-ts-aws-success', label: 'AWS Data Success', operation: 'read', outcome: 'success', description: 'Complete cost data returned within 5 seconds, 100% data completeness' },
      { id: 'inv-ts-aws-degraded', label: 'AWS Data Partial', operation: 'read', outcome: 'failure', description: 'Incomplete day returned (service delay), latency 5-15 sec, 85-99% completeness' },
      { id: 'inv-ts-aws-timeout', label: 'AWS API Timeout', operation: 'read', outcome: 'timeout', description: 'Service temporarily unavailable, latency >30 sec, API returns 5xx errors' },
      { id: 'inv-ts-aws-error', label: 'AWS Connection Error', operation: 'read', outcome: 'failure', description: 'Connection timeout >45 sec, auth failure, rate limit exceeded >1000 req/min' },
    ],
  },
  {
    id: 'inv-tooldim-gcp',
    toolId: 'gcp-billing-api',
    toolName: 'GCP Cloud Billing API',
    states: [
      { id: 'inv-ts-gcp-success', label: 'GCP Data Success', operation: 'read', outcome: 'success', description: 'Nested JSON returned, 100% schema compliance, latency <3 sec' },
      { id: 'inv-ts-gcp-degraded', label: 'GCP Data Incomplete', operation: 'read', outcome: 'failure', description: 'Incomplete hierarchy, schema variation <5%, latency 3-10 sec, missing hourly update' },
      { id: 'inv-ts-gcp-timeout', label: 'GCP Export Delay', operation: 'read', outcome: 'timeout', description: 'Hourly export delay >4 hours, project-level data unavailable' },
      { id: 'inv-ts-gcp-error', label: 'GCP Auth/Quota Error', operation: 'read', outcome: 'failure', description: 'OAuth token invalid/expired, API key quota exhausted, malformed query' },
    ],
  },
  {
    id: 'inv-tooldim-pdf',
    toolId: 'pdf-parser',
    toolName: 'PDF Parser (Tables & Text)',
    states: [
      { id: 'inv-ts-pdf-success', label: 'PDF Extraction Success', operation: 'read', outcome: 'success', description: 'All tables extracted >95% character accuracy, cell boundaries detected' },
      { id: 'inv-ts-pdf-degraded', label: 'PDF Partial Extraction', operation: 'read', outcome: 'failure', description: '1-3 cells unreadable, confidence 85-94%, minor OCR errors <5%' },
      { id: 'inv-ts-pdf-image-only', label: 'PDF Image-Only', operation: 'read', outcome: 'failure', description: 'PDF has no text layer, requires OCR fallback, confidence <50%' },
      { id: 'inv-ts-pdf-error', label: 'PDF Parse Error', operation: 'read', outcome: 'failure', description: 'File corrupted, unsupported version, password-protected, file size >500 MB' },
    ],
  },
  {
    id: 'inv-tooldim-ocr',
    toolId: 'ocr-engine',
    toolName: 'OCR Engine (Scanned Invoices)',
    states: [
      { id: 'inv-ts-ocr-success', label: 'OCR Success', operation: 'read', outcome: 'success', description: 'Text extracted, confidence >90%, reading order correct, special chars recognized' },
      { id: 'inv-ts-ocr-degraded', label: 'OCR Partial', operation: 'read', outcome: 'failure', description: 'Text extracted, confidence 80-89%, 1-3 chars misread, handwriting partially legible' },
      { id: 'inv-ts-ocr-failure', label: 'OCR Illegible', operation: 'read', outcome: 'failure', description: 'Text not extracted, confidence <50%, water damage/fading, non-English unrecognized' },
      { id: 'inv-ts-ocr-error', label: 'OCR File Error', operation: 'read', outcome: 'failure', description: 'File corrupted, resolution <100 DPI, unsupported format, encryption present' },
    ],
  },
  {
    id: 'inv-tooldim-sql',
    toolId: 'sql-connector',
    toolName: 'PO Database SQL Connector',
    states: [
      { id: 'inv-ts-sql-success', label: 'Query Success', operation: 'read', outcome: 'success', description: 'Query result <100ms, all rows retrieved, 100% schema compliance' },
      { id: 'inv-ts-sql-partial', label: 'Query Partial', operation: 'read', outcome: 'failure', description: 'Result delayed 100-500ms, partial rows (timeout), schema mismatch <5%' },
      { id: 'inv-ts-sql-empty', label: 'No Matches', operation: 'read', outcome: 'failure', description: 'Query returns empty result set (no matching PO records found)' },
      { id: 'inv-ts-sql-error', label: 'Database Error', operation: 'read', outcome: 'failure', description: 'Connection refused, SQL syntax error, table locked, permission denied, timeout >30s' },
    ],
  },
  {
    id: 'inv-tooldim-calc',
    toolId: 'calculation-engine',
    toolName: 'Calculation & Analytics Engine',
    states: [
      { id: 'inv-ts-calc-success', label: 'Calculation Success', operation: 'create', outcome: 'success', description: 'Calculation completes, result mathematically correct, precision 12+ decimals' },
      { id: 'inv-ts-calc-degraded', label: 'Calculation Precision Loss', operation: 'create', outcome: 'failure', description: 'Calculation completes, precision 8-11 decimals, rounding artifacts, NaN in subset' },
      { id: 'inv-ts-calc-failed', label: 'Calculation Failed', operation: 'create', outcome: 'failure', description: 'Division by zero, empty dataset, overflow, invalid statistical operation' },
      { id: 'inv-ts-calc-error', label: 'Computation Error', operation: 'create', outcome: 'failure', description: 'Process timeout >60s, memory exhaustion, invalid input type, undefined operation' },
    ],
  },
]

const invoiceAnalysis: DimensionAnalysisPayload = {
  tileId: 'invoice-processing',
  agentName: 'Invoice Processing Agent',
  taskDimensions: invoiceTaskDimensions,
  dataDimensions: invoiceDataDimensions,
  userProfileDimensions: invoiceUserProfileDimensions,
  outputDimensions: invoiceOutputDimensions,
  toolDimensions: invoiceToolDimensions,
  summaryText:
    '16 task dimensions spanning 8 parent tasks (ingestion, extraction, normalization, matching, validation, aggregation, analysis, reporting). 5 data dimensions covering AWS CSV (450MB/month, 384K items), GCP BigQuery (892K records, hourly), Staples PDF (36 invoices, mixed formats), PO database (2.8K POs, 8.9K items), and archive (120 files, 6-year history). 3 behavioral user profiles (analyst, executive, procurement). 11 output dimensions across 5 core agent outputs. 6 tools with 24 state transitions handling cloud APIs, PDF extraction, OCR, SQL queries, and calculations. Supports complex multi-vendor cost comparison, PO validation, anomaly detection, and historical trend analysis.',
}

// ============================================================================
// Enterprise RAG Copilot V3 (enterprise-rag)
// ============================================================================

const ragTaskDimensions: TaskDimension[] = [
  // ── From: query-understanding ──
  {
    id: 'rag-task-intent-classification',
    label: 'Intent Classification',
    description: 'Parse user query and classify intent: factual, procedural, decision-history, person-lookup, project-status',
    parentTaskId: 'query-understanding',
    intentCategories: ['factual-lookup', 'how-to-question', 'decision-context', 'people-finder', 'status-check'],
    confidence: 'high',
  },
  {
    id: 'rag-task-entity-extraction',
    label: 'Entity & Keyword Extraction',
    description: 'Extract keywords, named entities (people, projects, decisions), and context clues from question',
    parentTaskId: 'query-understanding',
    intentCategories: ['named-entity-recognition', 'keyword-extraction', 'context-understanding'],
    confidence: 'high',
  },
  // ── From: source-routing ──
  {
    id: 'rag-task-route-confluence',
    label: 'Confluence Routing',
    description: 'Determine if query targets policies, decisions, documentation (route to Confluence)',
    parentTaskId: 'source-routing',
    intentCategories: ['policy-lookup', 'documentation-search', 'decision-document'],
    confidence: 'high',
  },
  {
    id: 'rag-task-route-slack',
    label: 'Slack Routing',
    description: 'Route queries seeking recent discussions, team context, or informal information to Slack',
    parentTaskId: 'source-routing',
    intentCategories: ['discussion-search', 'team-context', 'conversation-history'],
    confidence: 'high',
  },
  {
    id: 'rag-task-route-jira',
    label: 'Jira Routing',
    description: 'Route project/task/issue queries to Jira issue tracking system',
    parentTaskId: 'source-routing',
    intentCategories: ['project-status', 'issue-lookup', 'task-tracking'],
    confidence: 'high',
  },
  {
    id: 'rag-task-route-directory',
    label: 'Directory Routing',
    description: 'Route person-lookup queries to employee directory for expertise, team, contact info',
    parentTaskId: 'source-routing',
    intentCategories: ['people-search', 'expertise-finder', 'team-structure'],
    confidence: 'high',
  },
  // ── From: multi-source-retrieval ──
  {
    id: 'rag-task-retrieve-parallel',
    label: 'Parallel Multi-Source Retrieval',
    description: 'Execute searches in parallel across routed sources with source-specific query syntax (CQL, JQL, SQL, API)',
    parentTaskId: 'multi-source-retrieval',
    intentCategories: ['parallel-search', 'multi-query-execution', 'api-orchestration'],
    confidence: 'high',
  },
  // ── From: cross-source-correlation ──
  {
    id: 'rag-task-entity-linking',
    label: 'Cross-Source Entity Linking',
    description: 'Match same entity across sources (e.g., decision referenced in Confluence page + Slack thread + Jira epic)',
    parentTaskId: 'cross-source-correlation',
    intentCategories: ['entity-resolution', 'cross-reference-matching', 'relationship-detection'],
    confidence: 'medium',
  },
  // ── From: context-synthesis ──
  {
    id: 'rag-task-synthesize',
    label: 'Context Synthesis & Answer Generation',
    description: 'Combine retrieved content into coherent answer with chronological/logical ordering and coherent narrative',
    parentTaskId: 'context-synthesis',
    intentCategories: ['content-synthesis', 'narrative-generation', 'answer-formation'],
    confidence: 'high',
  },
  // ── From: access-control-filtering ──
  {
    id: 'rag-task-access-check',
    label: 'Access Control Filtering',
    description: 'Filter results based on user permissions (Confluence spaces, Slack channels, Drive folders, restricted records)',
    parentTaskId: 'access-control-filtering',
    intentCategories: ['permission-checking', 'visibility-filtering', 'security-enforcement'],
    confidence: 'high',
  },
  // ── From: freshness-assessment ──
  {
    id: 'rag-task-freshness-eval',
    label: 'Document Freshness Assessment',
    description: 'Evaluate data currency: current (<30 days), aging (31-90), stale (>90 days). Compare versions.',
    parentTaskId: 'freshness-assessment',
    intentCategories: ['recency-evaluation', 'version-comparison', 'staleness-detection'],
    confidence: 'medium',
  },
]

const ragDataDimensions: DataDimension[] = [
  {
    id: 'rag-data-confluence',
    label: 'Confluence Wiki (Documents)',
    subTopics: [
      { name: 'Decision Records', depth: 5 },
      { name: 'Policy Documentation', depth: 4 },
      { name: 'Linked References', depth: 4 },
      { name: 'Version History', depth: 3 },
    ],
    depthScore: 5,
    keyEntities: ['page-id', 'space-name', 'title', 'author', 'created-date', 'modified-date', 'version', 'linked-pages'],
    connectedDomains: ['Slack Discussions', 'Jira Issues', 'Employee Directory'],
    sourceAttribution: [
      { sourceId: 'confluence-api', sourceName: 'Confluence_Wiki', count: '8,400 pages, 45 spaces, 18-month history' },
    ],
  },
  {
    id: 'rag-data-slack',
    label: 'Slack Workspace (Messages)',
    subTopics: [
      { name: 'Channel Discussions', depth: 5 },
      { name: 'Threaded Conversations', depth: 4 },
      { name: 'User Mentions', depth: 3 },
      { name: 'File Attachments', depth: 2 },
    ],
    depthScore: 5,
    keyEntities: ['message-id', 'channel-name', 'user-id', 'timestamp', 'thread-id', 'reaction-count', 'attachment-id'],
    connectedDomains: ['Confluence Documents', 'Jira Issues', 'Employee Directory'],
    sourceAttribution: [
      { sourceId: 'slack-api', sourceName: 'Slack_Workspace', count: '2.1M messages, 156 channels, 18-month history' },
    ],
  },
  {
    id: 'rag-data-gdrive',
    label: 'Google Drive (Files & Docs)',
    subTopics: [
      { name: 'Shared Docs', depth: 4 },
      { name: 'Spreadsheets', depth: 3 },
      { name: 'PDF Documents', depth: 3 },
      { name: 'Folder Structure', depth: 3 },
    ],
    depthScore: 4,
    keyEntities: ['file-id', 'file-name', 'owner', 'created-date', 'modified-date', 'permission-level', 'folder-path'],
    connectedDomains: ['Confluence Wiki', 'Slack Attachments', 'Jira Links'],
    sourceAttribution: [
      { sourceId: 'gdrive-api', sourceName: 'Google_Drive', count: '23,000 files, 12 shared drives, variable access' },
    ],
  },
  {
    id: 'rag-data-jira',
    label: 'Jira Project Management (Issues)',
    subTopics: [
      { name: 'Epics & Stories', depth: 5 },
      { name: 'Issue Comments', depth: 4 },
      { name: 'Linked Issues', depth: 4 },
      { name: 'Workflow Status', depth: 3 },
    ],
    depthScore: 5,
    keyEntities: ['issue-key', 'issue-id', 'project-key', 'issue-type', 'status', 'assignee', 'component', 'label', 'link-type'],
    connectedDomains: ['Confluence Decisions', 'Slack Discussion', 'Employee Directory'],
    sourceAttribution: [
      { sourceId: 'jira-api', sourceName: 'Jira_Projects', count: '12,400 issues, 3 projects, full history' },
    ],
  },
  {
    id: 'rag-data-directory',
    label: 'Employee Directory (People & Expertise)',
    subTopics: [
      { name: 'Employee Profiles', depth: 4 },
      { name: 'Expertise & Skills', depth: 4 },
      { name: 'Team Structure', depth: 3 },
      { name: 'Office Locations', depth: 2 },
    ],
    depthScore: 4,
    keyEntities: ['employee-id', 'name', 'email', 'title', 'department', 'manager-id', 'expertise-tags', 'office-location'],
    connectedDomains: ['Confluence Authors', 'Slack Users', 'Jira Assignees'],
    sourceAttribution: [
      { sourceId: 'dir-sql', sourceName: 'Employee_Directory_SQL', count: '340 employees, 8 departments, 127 skills' },
    ],
  },
]

const ragUserProfileDimensions: UserProfileDimension[] = [
  {
    id: 'rag-up-general-query',
    label: 'General Employee (Information Seeking)',
    description: 'Employee asking general company questions about policies, decisions, people',
    contextAxis: 'known-employee',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Show all accessible information. Hide restricted documents/channels. Recommend escalation if permission denied.',
  },
  {
    id: 'rag-up-project-lead',
    label: 'Project Lead (Status Tracking)',
    description: 'Team lead checking project status across Jira, Confluence, Slack discussions',
    contextAxis: 'known-employee',
    postureAxis: 'project-tracking',
    channelAxis: 'workflow-integrated',
    behaviorImpact: 'Synthesize Jira status + Slack discussion + Confluence docs. Highlight blockers and action items.',
  },
  {
    id: 'rag-up-exec-research',
    label: 'Executive (Research & Context)',
    description: 'Executive researching company decisions and context for leadership meetings',
    contextAxis: 'leadership',
    postureAxis: 'strategic-research',
    channelAxis: 'self-service',
    behaviorImpact: 'Deep synthesis across all sources. Reconstruct decision trails. Provide historical context. High access.',
  },
]

const ragOutputDimensions: OutputDimension[] = [
  { id: 'rag-od-1', label: 'Direct Answer — Success + Direct + One-shot', description: 'Simple lookup found in one source, returned immediately', agentOutputId: 'rag-out-direct-answer', agentOutputLabel: 'Direct Answer', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'rag-od-2', label: 'Synthesis Report — Success + Cross-referenced + Conversational', description: 'Multi-source synthesis with timeline and cross-references', agentOutputId: 'rag-out-synthesis-report', agentOutputLabel: 'Synthesis Report', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'rag-od-3', label: 'Synthesis Report — Partial + Cross-referenced + Conversational', description: 'Synthesis missing some sources due to access restrictions or availability', agentOutputId: 'rag-out-synthesis-report', agentOutputLabel: 'Synthesis Report', outcome: 'partial', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'rag-od-4', label: 'Person Profile — Success + Direct + One-shot', description: 'Employee profile with contact, team, expertise from directory', agentOutputId: 'rag-out-person-profile', agentOutputLabel: 'Person Profile', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'rag-od-5', label: 'Project Status — Success + Cross-referenced + Conversational', description: 'Multi-source project status from Jira + Confluence + Slack', agentOutputId: 'rag-out-project-status', agentOutputLabel: 'Project Status', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'rag-od-6', label: 'Project Status — Partial + Inferred + Conversational', description: 'Status partially stale; inferred current state from recent activity', agentOutputId: 'rag-out-project-status', agentOutputLabel: 'Project Status', outcome: 'partial', complexity: 'inferred', interaction: 'conversational' },
  { id: 'rag-od-7', label: 'Decision Trail — Success + Cross-referenced + Conversational', description: 'Complete decision chronology from proposal to implementation', agentOutputId: 'rag-out-decision-trail', agentOutputLabel: 'Decision Trail', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'rag-od-8', label: 'Decision Trail — Partial + Inferred + Conversational', description: 'Missing discussion phase or decision date not confirmed', agentOutputId: 'rag-out-decision-trail', agentOutputLabel: 'Decision Trail', outcome: 'partial', complexity: 'inferred', interaction: 'conversational' },
]

const ragToolDimensions: ToolDimension[] = [
  {
    id: 'rag-tooldim-confluence',
    toolId: 'confluence-api',
    toolName: 'Confluence Search API',
    states: [
      { id: 'rag-ts-conf-success', label: 'Confluence Success', operation: 'read', outcome: 'success', description: 'Returns 100+ results, full text available, metadata complete, latency <2s' },
      { id: 'rag-ts-conf-partial', label: 'Confluence Partial Results', operation: 'read', outcome: 'failure', description: 'Returns 10-50 results, content truncated, metadata incomplete, latency 2-8s' },
      { id: 'rag-ts-conf-no-results', label: 'No Confluence Matches', operation: 'read', outcome: 'failure', description: 'Zero results returned; search too broad or page not indexed' },
      { id: 'rag-ts-conf-error', label: 'Confluence API Error', operation: 'read', outcome: 'failure', description: 'Timeout >15s, auth failed, API deprecated, malformed CQL' },
    ],
  },
  {
    id: 'rag-tooldim-slack',
    toolId: 'slack-api',
    toolName: 'Slack Message Search API',
    states: [
      { id: 'rag-ts-slack-success', label: 'Slack Success', operation: 'read', outcome: 'success', description: 'Returns threads with context, user profiles, metadata, 10-100 messages, latency <1s' },
      { id: 'rag-ts-slack-partial', label: 'Slack Partial Results', operation: 'read', outcome: 'failure', description: 'Messages without threads, user info incomplete, rate limit approaching, latency 1-5s' },
      { id: 'rag-ts-slack-no-access', label: 'Slack Channel Restricted', operation: 'read', outcome: 'failure', description: 'Channel private (user lacks permission) or no message history available' },
      { id: 'rag-ts-slack-error', label: 'Slack API Error', operation: 'read', outcome: 'failure', description: 'Token expired, rate limit exceeded >100 req/min, network error, channel inaccessible' },
    ],
  },
  {
    id: 'rag-tooldim-gdrive',
    toolId: 'gdrive-api',
    toolName: 'Google Drive Search API',
    states: [
      { id: 'rag-ts-drive-success', label: 'Drive Success', operation: 'read', outcome: 'success', description: 'Returns 50+ files, full-text available, permissions clear, latency <2s' },
      { id: 'rag-ts-drive-partial', label: 'Drive Partial Results', operation: 'read', outcome: 'failure', description: 'Returns 5-50 files, content preview only, permissions ambiguous, latency 2-8s' },
      { id: 'rag-ts-drive-access-denied', label: 'Drive Permission Denied', operation: 'read', outcome: 'failure', description: 'Folder restricted; user lacks viewer/editor permission' },
      { id: 'rag-ts-drive-error', label: 'Drive API Error', operation: 'read', outcome: 'failure', description: 'OAuth token expired, quota exceeded, invalid file ID, timeout >15s' },
    ],
  },
  {
    id: 'rag-tooldim-jira',
    toolId: 'jira-api',
    toolName: 'Jira Search API (JQL)',
    states: [
      { id: 'rag-ts-jira-success', label: 'Jira Success', operation: 'read', outcome: 'success', description: 'Returns 50+ issues, full details, comments, links resolved, latency <2s' },
      { id: 'rag-ts-jira-partial', label: 'Jira Partial Results', operation: 'read', outcome: 'failure', description: 'Returns 5-50 issues, details truncated, comments unavailable, latency 2-8s' },
      { id: 'rag-ts-jira-no-issues', label: 'No Jira Issues Found', operation: 'read', outcome: 'failure', description: 'JQL query returned zero results; no matching issues' },
      { id: 'rag-ts-jira-error', label: 'Jira API Error', operation: 'read', outcome: 'failure', description: 'Auth failed, JQL syntax error, instance unavailable, rate limit exceeded' },
    ],
  },
  {
    id: 'rag-tooldim-directory',
    toolId: 'directory-sql',
    toolName: 'Employee Directory SQL',
    states: [
      { id: 'rag-ts-dir-success', label: 'Directory Query Success', operation: 'read', outcome: 'success', description: 'Query returns <100ms, full rows, joins correct, no access restrictions' },
      { id: 'rag-ts-dir-partial', label: 'Directory Partial Data', operation: 'read', outcome: 'failure', description: 'Query delayed 100-500ms, partial rows (timeout), schema mismatch <5%' },
      { id: 'rag-ts-dir-not-found', label: 'Employee Not Found', operation: 'read', outcome: 'failure', description: 'No employee record matches query criteria' },
      { id: 'rag-ts-dir-error', label: 'Directory Error', operation: 'read', outcome: 'failure', description: 'Connection refused, SQL error, permission denied, statement timeout >30s' },
    ],
  },
  {
    id: 'rag-tooldim-embedding',
    toolId: 'embedding-engine',
    toolName: 'Vector Embedding Engine (Semantic Search)',
    states: [
      { id: 'rag-ts-embed-success', label: 'Embedding Success', operation: 'create', outcome: 'success', description: 'Embeddings generated <200ms, similarity matches >85%, relevant results returned' },
      { id: 'rag-ts-embed-degraded', label: 'Embedding Degraded', operation: 'create', outcome: 'failure', description: 'Latency 200-800ms, similarity 75-84%, some irrelevant results mixed in' },
      { id: 'rag-ts-embed-no-matches', label: 'No Semantic Matches', operation: 'create', outcome: 'failure', description: 'Embedding succeeded but no similar documents found (all <70% similarity)' },
      { id: 'rag-ts-embed-error', label: 'Embedding Error', operation: 'create', outcome: 'failure', description: 'Model out of memory, timeout >5s, invalid input encoding, quota exceeded' },
    ],
  },
]

const ragAnalysis: DimensionAnalysisPayload = {
  tileId: 'enterprise-rag',
  agentName: 'Enterprise RAG Copilot',
  taskDimensions: ragTaskDimensions,
  dataDimensions: ragDataDimensions,
  userProfileDimensions: ragUserProfileDimensions,
  outputDimensions: ragOutputDimensions,
  toolDimensions: ragToolDimensions,
  summaryText:
    '11 task dimensions spanning 7 parent tasks (query understanding, source routing, multi-source retrieval, correlation, synthesis, access control, freshness assessment). 5 data dimensions covering Confluence (8.4K pages, 45 spaces), Slack (2.1M messages, 156 channels), Google Drive (23K files, 12 shared drives), Jira (12.4K issues, 3 projects), and employee directory (340 employees, 127 skills). 3 user profiles (general employee, project lead, executive). 8 output dimensions across 5 core response types. 6 tools with 22 state transitions handling API searches, semantic embeddings, and SQL queries. Supports parallel multi-source retrieval, cross-source correlation, access-aware filtering, and freshness assessment.',
}

// ============================================================================
// SaaS Customer Support Agent V3 (saas-customer-support)
// ============================================================================

const supportTaskDimensions: TaskDimension[] = [
  // ── From: ticket-triage ──
  {
    id: 'scs-task-classify-category',
    label: 'Ticket Category Classification',
    description: 'Classify ticket into 12 categories (Getting Started, Billing, Integrations, API, Permissions, etc.)',
    parentTaskId: 'ticket-triage',
    intentCategories: ['category-assignment', 'issue-classification', 'routing-decision'],
    confidence: 'high',
  },
  {
    id: 'scs-task-assess-urgency',
    label: 'Urgency & Priority Assessment',
    description: 'Assess ticket urgency (P1-P4), sentiment (positive/neutral/negative/angry), self-service eligibility',
    parentTaskId: 'ticket-triage',
    intentCategories: ['urgency-assessment', 'sentiment-analysis', 'priority-assignment'],
    confidence: 'high',
  },
  // ── From: kb-search ──
  {
    id: 'scs-task-kb-hybrid-search',
    label: 'Knowledge Base Hybrid Search',
    description: 'Perform semantic + keyword search across 450 KB articles using vector embeddings + BM25',
    parentTaskId: 'kb-search',
    intentCategories: ['semantic-search', 'keyword-matching', 'article-retrieval'],
    confidence: 'high',
  },
  {
    id: 'scs-task-kb-rank-relevance',
    label: 'KB Result Ranking',
    description: 'Rank returned KB articles by relevance score, filter by confidence threshold (>65-85%)',
    parentTaskId: 'kb-search',
    intentCategories: ['relevance-scoring', 'confidence-filtering', 'result-ranking'],
    confidence: 'high',
  },
  // ── From: action-execution ──
  {
    id: 'scs-task-validate-preconditions',
    label: 'Action Precondition Validation',
    description: 'Verify customer account status, subscription tier, billing status before executing actions',
    parentTaskId: 'action-execution',
    intentCategories: ['precondition-check', 'eligibility-verification', 'validation-gate'],
    confidence: 'high',
  },
  {
    id: 'scs-task-execute-action',
    label: 'Execute Customer Action',
    description: 'Execute approved actions (password reset, plan upgrade, feature toggle, data export, account reactivation)',
    parentTaskId: 'action-execution',
    intentCategories: ['password-reset', 'plan-change', 'feature-toggle', 'data-export', 'account-reactivation'],
    confidence: 'high',
  },
  // ── From: response-drafting ──
  {
    id: 'scs-task-draft-response',
    label: 'Response Drafting',
    description: 'Synthesize personalized KB-based response with customer context (plan, history, sentiment) and tone matching',
    parentTaskId: 'response-drafting',
    intentCategories: ['response-generation', 'personalization', 'tone-adaptation'],
    confidence: 'high',
  },
  // ── From: escalation-routing ──
  {
    id: 'scs-task-route-escalation',
    label: 'Escalation Team Routing',
    description: 'Route complex tickets to appropriate team (Engineering, Billing, Sales, General Support) with context summary',
    parentTaskId: 'escalation-routing',
    intentCategories: ['team-routing', 'escalation-assignment', 'context-summary'],
    confidence: 'high',
  },
]

const supportDataDimensions: DataDimension[] = [
  {
    id: 'scs-data-kb',
    label: 'Knowledge Base (Articles)',
    subTopics: [
      { name: 'Getting Started Guides', depth: 4 },
      { name: 'Account & Billing', depth: 4 },
      { name: 'API Documentation', depth: 5 },
      { name: 'Troubleshooting', depth: 4 },
    ],
    depthScore: 5,
    keyEntities: ['article-id', 'category', 'title', 'keywords', 'embedding', 'update-date', 'relevance-score'],
    connectedDomains: ['Customer Database', 'Action API'],
    sourceAttribution: [
      { sourceId: 'kb-articles', sourceName: 'Knowledge_Base_Markdown', count: '450 articles, 12 categories, vector embeddings' },
    ],
  },
  {
    id: 'scs-data-customer-db',
    label: 'Customer Database',
    subTopics: [
      { name: 'Account Records', depth: 5 },
      { name: 'Subscription Info', depth: 4 },
      { name: 'Ticket History', depth: 4 },
      { name: 'Usage Analytics', depth: 3 },
    ],
    depthScore: 5,
    keyEntities: ['account-id', 'user-id', 'subscription-plan', 'billing-status', 'monthly-spend', 'created-date', 'last-login'],
    connectedDomains: ['Knowledge Base', 'Action API', 'Support Tickets'],
    sourceAttribution: [
      { sourceId: 'customer-db', sourceName: 'PostgreSQL_Customers', count: '8.5K accounts, 6.2K active, 45K tickets, 34K users' },
    ],
  },
  {
    id: 'scs-data-action-api',
    label: 'Action API',
    subTopics: [
      { name: 'Password Reset', depth: 4 },
      { name: 'Plan Changes', depth: 4 },
      { name: 'Feature Toggles', depth: 3 },
      { name: 'Data Export', depth: 3 },
    ],
    depthScore: 4,
    keyEntities: ['action-type', 'account-id', 'parameters', 'status', 'requires-confirmation', 'preconditions', 'latency'],
    connectedDomains: ['Customer Database', 'Billing System'],
    sourceAttribution: [
      { sourceId: 'action-api', sourceName: 'Action_API_REST', count: '6 action endpoints, 1000 req/min, 200-800ms latency' },
    ],
  },
]

const supportUserProfileDimensions: UserProfileDimension[] = [
  {
    id: 'scs-up-self-service',
    label: 'Self-Service User',
    description: 'Customer seeking help independently via chat or knowledge base',
    contextAxis: 'known-customer',
    postureAxis: 'self-help-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Provide KB articles, step-by-step guides, action links for eligible customers. No escalation unless necessary.',
  },
  {
    id: 'scs-up-frustrated',
    label: 'Frustrated Customer',
    description: 'Customer with negative sentiment (angry, repeated attempts, urgency markers)',
    contextAxis: 'known-customer',
    postureAxis: 'problem-reporting',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Prioritize empathy, quick resolution. Show you understand issue. Offer additional assistance. Lower escalation threshold.',
  },
  {
    id: 'scs-up-vip',
    label: 'VIP Customer',
    description: 'High-value customer (top 5% spending, enterprise plan, strategic account)',
    contextAxis: 'vip',
    postureAxis: 'priority-support',
    channelAxis: 'agent-assisted',
    behaviorImpact: 'Priority queue. Dedicated support path. Proactive troubleshooting. Higher authority for exceptions/upgrades.',
  },
]

const supportOutputDimensions: OutputDimension[] = [
  { id: 'scs-od-1', label: 'Self-Service Answer — Success + Direct + One-shot', description: 'KB article found, high confidence match, customer can self-resolve', agentOutputId: 'scs-out-self-service-answer', agentOutputLabel: 'Self-Service Answer', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'scs-od-2', label: 'Self-Service Answer — Partial + Direct + Conversational', description: 'KB article found but customer needs clarification or follow-up steps', agentOutputId: 'scs-out-self-service-answer', agentOutputLabel: 'Self-Service Answer', outcome: 'partial', complexity: 'direct', interaction: 'conversational' },
  { id: 'scs-od-3', label: 'Action Confirmation — Success + Direct + One-shot', description: 'Action executed successfully, confirmation returned with before/after state', agentOutputId: 'scs-out-action-confirmation', agentOutputLabel: 'Action Confirmation', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'scs-od-4', label: 'Action Confirmation — Partial + Inferred + Conversational', description: 'Action requires email/supervisor confirmation before completion', agentOutputId: 'scs-out-action-confirmation', agentOutputLabel: 'Action Confirmation', outcome: 'partial', complexity: 'inferred', interaction: 'conversational' },
  { id: 'scs-od-5', label: 'Escalation Handoff — Escalation + Direct + One-shot', description: 'Ticket routed to appropriate team with context summary and attempted solutions', agentOutputId: 'scs-out-escalation-handoff', agentOutputLabel: 'Escalation Handoff', outcome: 'escalation', complexity: 'direct', interaction: 'one-shot' },
  { id: 'scs-od-6', label: 'Clarification Request — Success + Direct + Conversational', description: 'Ask customer for more details before proceeding (ambiguous query, missing context)', agentOutputId: 'scs-out-clarification-request', agentOutputLabel: 'Clarification Request', outcome: 'success', complexity: 'direct', interaction: 'conversational' },
]

const supportToolDimensions: ToolDimension[] = [
  {
    id: 'scs-tooldim-kb-search',
    toolId: 'kb-search-engine',
    toolName: 'KB Hybrid Search Engine',
    states: [
      { id: 'scs-ts-kb-success', label: 'KB Search Success', operation: 'read', outcome: 'success', description: 'Returns 3-5 relevant articles (similarity >82%), <500ms latency, freshness check passes' },
      { id: 'scs-ts-kb-partial', label: 'KB Partial Match', operation: 'read', outcome: 'failure', description: 'Returns articles with similarity 70-81%, latency 500-1500ms, some articles >3 weeks old' },
      { id: 'scs-ts-kb-no-match', label: 'KB No Match', operation: 'read', outcome: 'failure', description: 'No relevant articles found (all <60% similarity), or only 1-2 marginal matches' },
      { id: 'scs-ts-kb-error', label: 'KB Search Error', operation: 'read', outcome: 'failure', description: 'Index unavailable, search engine not initialized, malformed query, index corruption' },
    ],
  },
  {
    id: 'scs-tooldim-customer-lookup',
    toolId: 'customer-database',
    toolName: 'Customer Database Query',
    states: [
      { id: 'scs-ts-cdb-success', label: 'Customer Found', operation: 'read', outcome: 'success', description: 'Customer record retrieved with full account, subscription, history data' },
      { id: 'scs-ts-cdb-partial', label: 'Partial Customer Data', operation: 'read', outcome: 'failure', description: 'Customer found but some fields missing (history incomplete, subscription data partial)' },
      { id: 'scs-ts-cdb-not-found', label: 'Customer Not Found', operation: 'read', outcome: 'failure', description: 'No customer record matches query (wrong email, account ID not in system)' },
      { id: 'scs-ts-cdb-error', label: 'Database Query Error', operation: 'read', outcome: 'failure', description: 'Query timeout, connection refused, permission denied, SQL error' },
    ],
  },
  {
    id: 'scs-tooldim-action-api',
    toolId: 'action-api',
    toolName: 'Customer Action API',
    states: [
      { id: 'scs-ts-act-success', label: 'Action Executed', operation: 'create', outcome: 'success', description: 'Action completed (password reset sent, plan changed, feature toggled)' },
      { id: 'scs-ts-act-requires-confirm', label: 'Action Requires Confirmation', operation: 'create', outcome: 'failure', description: 'Supervisor approval or email confirmation required before executing action' },
      { id: 'scs-ts-act-blocked', label: 'Action Blocked', operation: 'create', outcome: 'failure', description: 'Preconditions failed (account suspended, payment overdue, feature tier not eligible)' },
      { id: 'scs-ts-act-error', label: 'Action API Error', operation: 'create', outcome: 'failure', description: 'API timeout, rate limit exceeded, malformed request, invalid account ID' },
    ],
  },
]

const supportAnalysis: DimensionAnalysisPayload = {
  tileId: 'saas-customer-support',
  agentName: 'SaaS Customer Support Agent',
  taskDimensions: supportTaskDimensions,
  dataDimensions: supportDataDimensions,
  userProfileDimensions: supportUserProfileDimensions,
  outputDimensions: supportOutputDimensions,
  toolDimensions: supportToolDimensions,
  summaryText:
    '8 task dimensions spanning 5 parent tasks (ticket triage, KB search, action execution, response drafting, escalation routing). 3 data dimensions covering knowledge base (450 articles, 12 categories, vector embeddings), customer database (8.5K accounts, 45K tickets, 34K users), and action API (6 action endpoints). 3 user profiles (self-service, frustrated, VIP). 6 output dimensions across 4 core response types. 3 tools with 12 state transitions handling KB search, customer lookup, and action execution. Supports rapid ticket triage, KB-based self-service, customer action execution (password reset, plan upgrade, feature toggle), precondition validation, and intelligent escalation routing.',
}

// ============================================================================
// FAQ Knowledge Agent V3 (faq-knowledge)
// ============================================================================

const faqTaskDimensions: TaskDimension[] = [
  // ── From: query-understanding ──
  {
    id: 'faq-task-parse-question',
    label: 'Question Parsing & Intent Detection',
    description: 'Parse user question, identify intent (policy lookup, procedure, definition), extract entities and role context',
    parentTaskId: 'query-understanding',
    intentCategories: ['policy-lookup', 'procedure-question', 'definition-request', 'role-context'],
    confidence: 'high',
  },
  // ── From: document-retrieval ──
  {
    id: 'faq-task-semantic-retrieval',
    label: 'Semantic Document Retrieval',
    description: 'Search knowledge base using embeddings + keyword fallback, return top 3 ranked results with relevance scores',
    parentTaskId: 'document-retrieval',
    intentCategories: ['semantic-search', 'keyword-matching', 'document-ranking'],
    confidence: 'high',
  },
  {
    id: 'faq-task-retrieve-metadata',
    label: 'Document Metadata Retrieval',
    description: 'Fetch full document content by ID, extract metadata (title, category, last-updated, keywords)',
    parentTaskId: 'document-retrieval',
    intentCategories: ['document-fetch', 'metadata-extraction', 'content-parsing'],
    confidence: 'high',
  },
  // ── From: answer-generation ──
  {
    id: 'faq-task-synthesize-answer',
    label: 'Answer Synthesis & Formatting',
    description: 'Generate concise answer from document(s), synthesize multi-doc content if needed, add citation with link/ID',
    parentTaskId: 'answer-generation',
    intentCategories: ['answer-synthesis', 'multi-document-merge', 'citation-formatting'],
    confidence: 'high',
  },
  {
    id: 'faq-task-fallback-notfound',
    label: 'Not-Found Fallback',
    description: 'Generate "information not available" response with escalation path when no documents match query',
    parentTaskId: 'answer-generation',
    intentCategories: ['no-match-handling', 'escalation-suggestion', 'expert-routing'],
    confidence: 'high',
  },
]

const faqDataDimensions: DataDimension[] = [
  {
    id: 'faq-data-kb-docs',
    label: 'Company Knowledge Base (Markdown + PDF)',
    subTopics: [
      { name: 'HR Policies', depth: 4 },
      { name: 'IT Guides', depth: 4 },
      { name: 'Office Procedures', depth: 3 },
      { name: 'Benefits & Security', depth: 4 },
    ],
    depthScore: 5,
    keyEntities: ['doc-id', 'category', 'title', 'keywords', 'embedding-vector', 'last-updated', 'relevance-score', 'section-id'],
    connectedDomains: ['Department Experts', 'HR Systems', 'IT Systems'],
    sourceAttribution: [
      { sourceId: 'kb-docs', sourceName: 'Knowledge_Base', count: '280 documents (220 MD, 45 PDF, 15 Google Docs), 12 categories' },
    ],
  },
]

const faqUserProfileDimensions: UserProfileDimension[] = [
  {
    id: 'faq-up-general-employee',
    label: 'General Employee (Policy Lookup)',
    description: 'Employee asking general company policy or procedure questions',
    contextAxis: 'known-employee',
    postureAxis: 'info-seeking',
    channelAxis: 'self-service',
    behaviorImpact: 'Return most relevant document sections with clear citations. No restricted content.',
  },
  {
    id: 'faq-up-new-hire',
    label: 'New Hire (Onboarding)',
    description: 'New employee in first 30 days, seeking onboarding and orientation information',
    contextAxis: 'new-employee',
    postureAxis: 'learning',
    channelAxis: 'self-service',
    behaviorImpact: 'Prioritize onboarding documents. Provide step-by-step guides. Offer escalation to HR for personalized help.',
  },
]

const faqOutputDimensions: OutputDimension[] = [
  { id: 'faq-od-1', label: 'Direct Answer — Success + Direct + One-shot', description: 'Document found with clear answer; returned concisely with citation', agentOutputId: 'faq-out-direct-answer', agentOutputLabel: 'Direct Answer', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
  { id: 'faq-od-2', label: 'Document Excerpt — Success + Cross-referenced + Conversational', description: 'Relevant section extracted (2-3 paragraphs) with surrounding context and full citation', agentOutputId: 'faq-out-document-excerpt', agentOutputLabel: 'Document Excerpt', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
  { id: 'faq-od-3', label: 'Document Excerpt — Partial + Direct + Conversational', description: 'Partial match found; excerpt provided with caveat that full document may have more details', agentOutputId: 'faq-out-document-excerpt', agentOutputLabel: 'Document Excerpt', outcome: 'partial', complexity: 'direct', interaction: 'conversational' },
  { id: 'faq-od-4', label: 'Not Found — Failure + Direct + One-shot', description: 'No matching document found; suggest contacting HR/IT/expert', agentOutputId: 'faq-out-not-found', agentOutputLabel: 'Not Found + Escalation', outcome: 'failure', complexity: 'direct', interaction: 'one-shot' },
  { id: 'faq-od-5', label: 'Not Found — Failure + Inferred + Conversational', description: 'Low-confidence match found; escalate to domain expert for clarification', agentOutputId: 'faq-out-not-found', agentOutputLabel: 'Not Found + Escalation', outcome: 'failure', complexity: 'inferred', interaction: 'conversational' },
]

const faqToolDimensions: ToolDimension[] = [
  {
    id: 'faq-tooldim-kb-search',
    toolId: 'kb-search',
    toolName: 'KB Semantic Search Engine',
    states: [
      { id: 'faq-ts-kb-success', label: 'Search Success', operation: 'read', outcome: 'success', description: 'Returns 1-3 high-relevance docs (score >80%), zero duplicates, correct ranking' },
      { id: 'faq-ts-kb-partial', label: 'Search Partial', operation: 'read', outcome: 'failure', description: 'Returns docs with relevance 60-79%, 1-2 duplicates in results, ranking slightly off, latency 2-5s' },
      { id: 'faq-ts-kb-no-results', label: 'No Results Found', operation: 'read', outcome: 'failure', description: 'No results found (relevance <50 for all docs), or query too vague (10+ docs all <60%)' },
      { id: 'faq-ts-kb-error', label: 'Search Engine Error', operation: 'read', outcome: 'failure', description: 'Index unavailable, search not initialized, malformed query, index corruption' },
    ],
  },
  {
    id: 'faq-tooldim-doc-reader',
    toolId: 'document-reader',
    toolName: 'Document Content Reader',
    states: [
      { id: 'faq-ts-doc-success', label: 'Document Retrieved', operation: 'read', outcome: 'success', description: 'Document retrieved fully (100% completeness), metadata parsed correctly, structure valid' },
      { id: 'faq-ts-doc-partial', label: 'Document Partial', operation: 'read', outcome: 'failure', description: 'Document retrieved with minor parsing issues (1-2 formatting quirks), metadata partial' },
      { id: 'faq-ts-doc-parse-fail', label: 'Document Parse Failed', operation: 'read', outcome: 'failure', description: 'PDF text layer missing (requires OCR), structure invalid, document not found in index' },
      { id: 'faq-ts-doc-error', label: 'Document Reader Error', operation: 'read', outcome: 'failure', description: 'File system error, permission denied, timeout, format unsupported' },
    ],
  },
]

const faqAnalysis: DimensionAnalysisPayload = {
  tileId: 'faq-knowledge',
  agentName: 'FAQ Knowledge Agent',
  taskDimensions: faqTaskDimensions,
  dataDimensions: faqDataDimensions,
  userProfileDimensions: faqUserProfileDimensions,
  outputDimensions: faqOutputDimensions,
  toolDimensions: faqToolDimensions,
  summaryText:
    '5 task dimensions spanning 3 parent tasks (query understanding, document retrieval, answer generation). 1 data dimension covering knowledge base (280 documents, 12 categories, markdown + PDF, 2,847 unique keywords). 2 user profiles (general employee, new hire). 5 output dimensions across 3 core response types (direct answer, document excerpt, not found). 2 tools with 8 state transitions handling KB search and document retrieval. Supports rapid FAQ lookups, multi-document synthesis, and graceful fallback when information unavailable.',
}

// ============================================================================
// Mapping and Export
// ============================================================================

const DIMENSION_ANALYSIS_MAP_V3: Record<string, DimensionAnalysisPayload> = {
  'invoice-processing': invoiceAnalysis,
  'enterprise-rag': ragAnalysis,
  'saas-customer-support': supportAnalysis,
  'faq-knowledge': faqAnalysis,
}

export function getDimensionAnalysisDataV3(tileId: string | null): DimensionAnalysisPayload | null {
  if (!tileId) return null
  return DIMENSION_ANALYSIS_MAP_V3[tileId] || null
}

