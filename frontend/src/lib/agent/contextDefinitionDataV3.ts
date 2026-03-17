import type {
  AgentTask,
  AgentTool,
} from '@/store/agentTypes'

// ─── V3 Context Definition Payload ─────────────────────────────────────
// Enhanced data structure with V3 features:
// - Tasks from Section 2.1 with trigger conditions
// - Data Sources with detected formats and data preview
// - Response Types with outcome states and probability distributions
// - Tools with all 4 states (success/degraded/failure/error)

export interface DataSourceV3 {
  id: string
  name: string
  label: string
  format?: string
  size?: string
  detectedFormats: string // Human-readable data preview string
  contentTypes?: string[]
  updateFrequency?: string
  completeness?: string
  temporal?: string
}

export interface AgentTaskV3 extends AgentTask {
  name: string
  triggerCondition: string
}

export interface ResponseTypeV3 {
  id: string
  name: string
  label: string
  description: string
  format: string
  outcomeStates: {
    state: string
    probability: number
    description?: string
  }[]
}

export interface ToolStateV3 {
  state: 'success' | 'degraded' | 'failure' | 'error'
  description: string
  details?: string
}

export interface AgentToolV3 extends AgentTool {
  label?: string
  successState: ToolStateV3
  degradedState: ToolStateV3
  failureState: ToolStateV3
  errorState?: ToolStateV3
}

export interface ContextDefinitionPayloadV3 {
  tileId: string
  useCaseName: string
  complexity: string
  tasks: AgentTaskV3[]
  dataSources: DataSourceV3[]
  responseTypes: ResponseTypeV3[]
  tools: AgentToolV3[]
}

// ─── Invoice Processing Agent Data (V3) ────────────────────────────────

const INVOICE_PROCESSING_V3: ContextDefinitionPayloadV3 = {
  tileId: 'invoice-processing',
  useCaseName: 'Invoice Processing Agent',
  complexity: 'Very Complex',
  tasks: [
    {
      id: 'task-001',
      name: 'invoice-ingestion',
      label: 'invoice-ingestion',
      description:
        'Collect and normalize invoices from all vendor sources (AWS, GCP, Staples) into unified system',
      triggerCondition: 'User query involves cost data OR scheduled daily batch',
      systemSuggested: true,
    },
    {
      id: 'task-002',
      name: 'line-item-extraction',
      label: 'line-item-extraction',
      description:
        'Extract individual line items with amounts, descriptions, categories, and metadata from each invoice document',
      triggerCondition: 'invoice-ingestion completes successfully',
      systemSuggested: true,
    },
    {
      id: 'task-003',
      name: 'format-normalization',
      label: 'format-normalization',
      description:
        'Convert different invoice formats (CSV, JSON, PDF, images) into unified relational schema with 15 standard fields',
      triggerCondition: 'line-item-extraction produces raw data',
      systemSuggested: true,
    },
    {
      id: 'task-004',
      name: 'po-matching',
      label: 'po-matching',
      description:
        'Match invoice line items against purchase orders using PO number, vendor, and amount matching logic with fuzzy matching for edge cases',
      triggerCondition: 'format-normalization completes AND query requests validation/charges',
      systemSuggested: true,
    },
    {
      id: 'task-005',
      name: 'charge-validation',
      label: 'charge-validation',
      description:
        'Verify invoice charges match contracted rates in vendor agreements and approved PO amounts within 2% tolerance',
      triggerCondition: 'po-matching produces matches',
      systemSuggested: false,
    },
    {
      id: 'task-006',
      name: 'cost-aggregation',
      label: 'cost-aggregation',
      description:
        'Aggregate costs by category, vendor, time period, with temporal alignment handling for different billing cycles',
      triggerCondition: 'format-normalization OR line-item-extraction completes',
      systemSuggested: true,
    },
    {
      id: 'task-007',
      name: 'trend-analysis',
      label: 'trend-analysis',
      description:
        'Identify trends, anomalies, growth patterns, and seasonal variations across 6+ month historical periods per vendor',
      triggerCondition: 'cost-aggregation produces aggregated data',
      systemSuggested: false,
    },
    {
      id: 'task-008',
      name: 'report-generation',
      label: 'report-generation',
      description:
        'Generate consolidated reports with citations, tables, narrative analysis, and source attribution to specific invoices',
      triggerCondition: 'cost-aggregation OR trend-analysis OR po-matching completes',
      systemSuggested: true,
    },
  ],
  dataSources: [
    {
      id: 'source-aws',
      name: 'AWS Cost & Usage Reports',
      label: 'AWS Cost & Usage Reports',
      format: 'CSV/Parquet',
      size: '~450 MB monthly',
      detectedFormats:
        'I see: 14 CSV files, 50+ columns (service, usageType, region, amount, currency, lineItemDescription, productCode, lineItemType), 384,000+ line items, 12-month continuous history, daily incremental updates',
      contentTypes: ['tables', 'structured-data'],
      updateFrequency: 'daily',
      completeness: '99.8% (3 days missing in May 2025)',
      temporal: 'March 2025 - February 2026, daily precision',
    },
    {
      id: 'source-gcp',
      name: 'GCP Billing Export',
      label: 'GCP Billing Export',
      format: 'BigQuery (nested JSON)',
      size: 'Dynamic, hourly exports',
      detectedFormats:
        'I see: BigQuery table "gcp_billing_export", nested JSON structure (service.description, sku.description, sku.id, project.id, region.region, amount, currency), 892,000+ records, hourly granularity, 12-month history, schema-on-read format, aggregatable by any dimension',
      contentTypes: ['structured-data'],
      updateFrequency: 'hourly',
      completeness: '100% (hourly backfill ensures no gaps)',
      temporal: 'March 2025 - February 2026, hourly precision',
    },
    {
      id: 'source-staples',
      name: 'Staples Business Advantage Portal',
      label: 'Staples Business Advantage Portal',
      format: 'PDF + CSV metadata',
      size: '36 invoices',
      detectedFormats:
        'I see: 36 PDF files (24 table-based, 8 mixed table+image, 4 text-only), variable resolution (96-300 DPI), 18 distinct table structures, embedded images in 8 files, text OCR quality 92-98%, metadata includes order date, invoice date, ship date, delivery date',
      contentTypes: ['text', 'tables', 'images'],
      updateFrequency: 'monthly',
      completeness: '100% for 12-month period',
      temporal: 'March 2025 - February 2026, monthly invoices',
    },
    {
      id: 'source-po-db',
      name: 'Purchase Order Database',
      label: 'Purchase Order Database',
      format: 'SQL (Relational)',
      size: '2,847 POs, 8,934 line items',
      detectedFormats:
        'I see: 3 PostgreSQL tables (purchase_orders, line_items, vendors), 2,847 PO records, 8,934 line items, 47 distinct vendors, relationships via PO-number and vendor-id, categorical fields: (status: approved/pending/closed/disputed, category: compute/storage/supplies/services/other), temporal fields: (po_date, approval_date, expected_delivery_date), amount fields with currency',
      contentTypes: ['structured-data'],
      updateFrequency: 'real-time',
      completeness: '89% active/recent (last 24 months)',
      temporal: 'Full history 2018-present',
    },
    {
      id: 'source-archive',
      name: 'Historical Invoice Archive',
      label: 'Historical Invoice Archive',
      format: 'Mixed (CSV + PDF images)',
      size: '120 files',
      detectedFormats:
        'I see: 120 files (89 structured CSV with identical schema to current Staples, 31 image PDFs with variable quality), CSV format identical to current template, image PDFs require OCR, age range 2019-2024, intermittent data gaps (Q2 2021 missing 2 months), handwritten annotations on 12 image files, some files have water damage/fading with OCR confidence <80%',
      contentTypes: ['tables', 'images', 'structured-data'],
      updateFrequency: 'archived',
      completeness: '~94% of expected invoices (6% missing for gap periods)',
      temporal: '2019-2024, 6-year history with Q2 2021 gaps',
    },
  ],
  responseTypes: [
    {
      id: 'resp-001',
      name: 'cost-breakdown',
      label: 'cost-breakdown',
      description: 'Detailed cost breakdown by category, vendor, and period with itemized amounts and percentages',
      format: 'Structured table (JSON/markdown) + brief narrative',
      outcomeStates: [
        { state: 'complete', probability: 0.87, description: 'All data available' },
        { state: 'partial', probability: 0.11, description: 'One vendor missing' },
        { state: 'unavailable', probability: 0.02, description: 'Critical data gap' },
      ],
    },
    {
      id: 'resp-002',
      name: 'trend-report',
      label: 'trend-report',
      description: 'Time-series trend analysis with growth rates, month-over-month/year-over-year comparisons, and baseline patterns',
      format: 'Multi-part: CSV table + line chart (ASCII or embed) + 2-4 paragraph analysis',
      outcomeStates: [
        { state: 'complete', probability: 0.76, description: '6+ months data' },
        { state: 'partial', probability: 0.18, description: '3-5 months data' },
        { state: 'insufficient', probability: 0.06, description: '<3 months data' },
      ],
    },
    {
      id: 'resp-003',
      name: 'validation-result',
      label: 'validation-result',
      description: 'PO matching and charge validation results showing matched, unmatched, and discrepancy line items',
      format: 'Structured table with match confidence scores and discrepancy explanations',
      outcomeStates: [
        { state: 'all-matched', probability: 0.82, description: '≥95% line items matched' },
        { state: 'discrepancies-found', probability: 0.15, description: '70-94% matched' },
        { state: 'po-not-found', probability: 0.03, description: '<70% matched' },
      ],
    },
    {
      id: 'resp-004',
      name: 'anomaly-alert',
      label: 'anomaly-alert',
      description: 'Specific anomaly notification with statistical justification, root cause attribution, and business impact',
      format: 'Narrative + statistical detail (percentages, baseline, threshold)',
      outcomeStates: [
        { state: 'confirmed', probability: 0.34, description: '>2SD from baseline' },
        { state: 'suspected', probability: 0.22, description: '1.5-2SD from baseline' },
        { state: 'false-positive', probability: 0.41, description: '<1.5SD from baseline' },
        { state: 'insufficient-data', probability: 0.03, description: 'Not enough history' },
      ],
    },
    {
      id: 'resp-005',
      name: 'consolidated-report',
      label: 'consolidated-report',
      description: 'Full monthly or quarterly cost report synthesizing all vendors, categories, and time periods',
      format: 'Multi-format: tables + embedded charts + 5-8 paragraph narrative + appendix with citations',
      outcomeStates: [
        { state: 'complete', probability: 0.71, description: 'All sources included, all periods' },
        { state: 'partial', probability: 0.24, description: 'Missing <15% data' },
        { state: 'draft-requires-review', probability: 0.05, description: 'Human escalation needed' },
      ],
    },
    {
      id: 'resp-006',
      name: 'simple-answer',
      label: 'simple-answer',
      description: 'Direct factual answer to a specific cost question (What was X? How much was Y?)',
      format: 'Concise text (1-3 sentences) with single number + unit + date + source citation',
      outcomeStates: [
        { state: 'answered', probability: 0.91, description: 'Sufficient data' },
        { state: 'clarification-needed', probability: 0.06, description: 'Ambiguous query' },
        { state: 'data-unavailable', probability: 0.03, description: 'Missing source' },
      ],
    },
  ],
  tools: [
    {
      id: 'tool-aws',
      name: 'aws-cost-explorer',
      label: 'aws-cost-explorer',
      description: 'AWS Cost Explorer API for programmatic cost data access with filters for service, region, time range',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns complete cost data for requested period within 5 seconds, 100% completeness',
      },
      degradedState: {
        state: 'degraded',
        description:
          'Returns partial data (service delay, incomplete day), latency 5-15 sec, completeness 85-99%',
      },
      failureState: {
        state: 'failure',
        description:
          'No data returned for period, service temporarily unavailable, latency >30 sec, API returns 5xx errors',
      },
      errorState: {
        state: 'error',
        description:
          'Connection timeout (>45 sec), authentication failure (invalid credentials), rate limit exceeded (>1000 req/min), malformed request',
      },
    },
    {
      id: 'tool-gcp',
      name: 'gcp-billing-api',
      label: 'gcp-billing-api',
      description: 'GCP Cloud Billing API for programmatic billing data access with project/SKU/region filtering',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns nested JSON billing data, 100% schema compliance, latency <3 sec',
      },
      degradedState: {
        state: 'degraded',
        description:
          'Returns data with incomplete hierarchy levels, schema variation <5%, latency 3-10 sec, or missing hourly updates',
      },
      failureState: {
        state: 'failure',
        description: 'No data returned, hourly export delay >4 hours, project-level data unavailable',
      },
      errorState: {
        state: 'error',
        description:
          'Connection timeout >45 sec, OAuth token invalid/expired, API key quota exhausted, malformed query',
      },
    },
    {
      id: 'tool-pdf',
      name: 'pdf-parser',
      label: 'pdf-parser',
      description:
        'Document parsing tool for PDF invoice extraction (text + tables) using computer vision and text extraction',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description:
          'All tables extracted with >95% character accuracy, cell boundaries detected, text orientation normalized',
      },
      degradedState: {
        state: 'degraded',
        description:
          'Tables extracted, 1-3 cells unreadable, confidence 85-94%, minor OCR errors (<5% chars)',
      },
      failureState: {
        state: 'failure',
        description:
          'PDF is image-only (bitmap PDF, no text layer), table detection fails, confidence <50%, requires OCR fallback',
      },
      errorState: {
        state: 'error',
        description:
          'File corrupted/unreadable, unsupported PDF version, password-protected, file size >500 MB, permission denied',
      },
    },
    {
      id: 'tool-ocr',
      name: 'ocr-engine',
      label: 'ocr-engine',
      description:
        'Optical Character Recognition for scanned/image invoices using modern ML models (Tesseract + CRNN)',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Scanned invoice text extracted, confidence >90%, reading order correct, special characters recognized',
      },
      degradedState: {
        state: 'degraded',
        description:
          'Text extracted with confidence 80-89%, 1-3 characters misread, reading order issues, handwriting partially legible',
      },
      failureState: {
        state: 'failure',
        description:
          'Text not extracted, confidence <50%, illegible document (water damage/fading), non-English characters unrecognized',
      },
      errorState: {
        state: 'error',
        description:
          'Image file corrupted, resolution <100 DPI unusable, format unsupported (TIFF v6+ not supported), encryption present',
      },
    },
    {
      id: 'tool-sql',
      name: 'sql-connector',
      label: 'sql-connector',
      description: 'Database connector for PO database queries with support for joins, aggregation, filtering on 3-table schema',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns query result in <100 ms, all rows retrieved, schema compliance 100%',
      },
      degradedState: {
        state: 'degraded',
        description: 'Query result delayed (100-500 ms), partial rows returned (timeout), schema mismatch <5%',
      },
      failureState: {
        state: 'failure',
        description: 'Query returns empty (no matching records), database connection failed, transaction rolled back',
      },
      errorState: {
        state: 'error',
        description:
          'Connection refused (DB unavailable), SQL syntax error, table locked (concurrent write), permission denied, statement timeout (>30 sec)',
      },
    },
    {
      id: 'tool-calc',
      name: 'calculation-engine',
      label: 'calculation-engine',
      description:
        'Arithmetic and statistical computation tool for aggregation, growth rate calculation, anomaly detection (z-score, IQR), trend fitting',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Calculation completes successfully, result mathematically correct, precision 12+ decimals',
      },
      degradedState: {
        state: 'degraded',
        description: 'Calculation completes with precision loss (8-11 decimals), rounding artifacts, NaN values in subset',
      },
      failureState: {
        state: 'failure',
        description:
          'Calculation fails (division by zero, empty dataset, overflow), invalid statistical operation (insufficient samples for z-score)',
      },
      errorState: {
        state: 'error',
        description:
          'Process terminated (memory exhaustion), timeout (>60 sec computation), invalid input type, undefined operation',
      },
    },
  ],
}

// ─── Enterprise RAG Copilot Data (V3) ──────────────────────────────────

const ENTERPRISE_RAG_V3: ContextDefinitionPayloadV3 = {
  tileId: 'enterprise-rag',
  useCaseName: 'Enterprise RAG Copilot',
  complexity: 'Very Complex',
  tasks: [
    {
      id: 'task-001',
      name: 'query-understanding',
      label: 'query-understanding',
      description:
        'Parse natural language question, classify intent (factual, procedural, decision-history, person-lookup, project-status), extract entities (keywords, names, projects)',
      triggerCondition: 'User query received',
      systemSuggested: true,
    },
    {
      id: 'task-002',
      name: 'source-routing',
      label: 'source-routing',
      description:
        'Determine which sources most likely contain answer based on query intent and entity recognition',
      triggerCondition: 'query-understanding completes',
      systemSuggested: true,
    },
    {
      id: 'task-003',
      name: 'multi-source-retrieval',
      label: 'multi-source-retrieval',
      description:
        'Execute parallel searches across identified sources with source-specific query adaptation (CQL for Confluence, JQL for Jira, text search for Slack, Drive file search, SQL for directory)',
      triggerCondition: 'source-routing identifies targets',
      systemSuggested: true,
    },
    {
      id: 'task-004',
      name: 'cross-source-correlation',
      label: 'cross-source-correlation',
      description: 'Match and stitch related content across sources (e.g., same decision referenced in Confluence page + Slack discussion thread + Jira epic)',
      triggerCondition: 'multi-source-retrieval returns results',
      systemSuggested: false,
    },
    {
      id: 'task-005',
      name: 'context-synthesis',
      label: 'context-synthesis',
      description: 'Synthesize retrieved content into coherent answer with proper attribution, citations, and cross-references',
      triggerCondition: 'multi-source-retrieval OR cross-source-correlation completes',
      systemSuggested: true,
    },
    {
      id: 'task-006',
      name: 'access-control-filtering',
      label: 'access-control-filtering',
      description:
        'Filter results based on querying user\'s permissions (user may not have access to all Confluence spaces, private Slack channels, restricted Drive folders, or employee records for some people)',
      triggerCondition: 'multi-source-retrieval OR cross-source-correlation completes',
      systemSuggested: true,
    },
    {
      id: 'task-007',
      name: 'freshness-assessment',
      label: 'freshness-assessment',
      description:
        'Evaluate whether retrieved information is current (Confluence page last updated <30 days), aging (31-90 days), or stale (>90 days). Compare document versions if available.',
      triggerCondition: 'context-synthesis or citation generation',
      systemSuggested: false,
    },
  ],
  dataSources: [
    {
      id: 'source-conf',
      name: 'Confluence Wiki',
      label: 'Confluence Wiki',
      format: 'Rich Text + Macros',
      size: '8,400+ pages',
      detectedFormats:
        'I see: 8,400 pages, 45 spaces (Engineering 1,200, Product 980, Design 840, Ops 720, Sales 650, others 3,010), rich HTML/XHTML format with embedded images (avg 3 per page), tables (avg 2 per page), code blocks (avg 1.5 per page), 847 page-linking references, version history (avg 4 versions per page), metadata: author, created-date, modified-date, last-accessed',
      contentTypes: ['text', 'tables', 'images', 'code'],
      updateFrequency: 'continuous',
      completeness: '7,842 pages indexed (358 excluded: templates, archived, restricted)',
      temporal: '18 months (oldest July 2024), 94% of pages modified in past 6 months',
    },
    {
      id: 'source-slack',
      name: 'Slack Workspace',
      label: 'Slack Workspace',
      format: 'Structured Messages + Threads',
      size: '2.1M messages',
      detectedFormats:
        'I see: 156 channels (124 public, 32 private), 2.1M messages, 18-month history, message-id indexing, thread-id linking (main message + avg 8 replies per thread), timestamps with timezone info, 12,400+ file attachments (PDF, JPEG, XLSX, DOCX, code snippets, images), emoji reaction counts (avg 2.3 reactions per message), user-mention markers (@username), channel-mention markers (#channel)',
      contentTypes: ['text', 'images'],
      updateFrequency: 'real-time',
      completeness: '2.1M messages fully indexed',
      temporal: 'Jan 2025 - Jun 2026, 18-month complete history',
    },
    {
      id: 'source-gdrive',
      name: 'Google Drive',
      label: 'Google Drive',
      format: 'Multiple (Docs, Sheets, Slides, PDF, Images)',
      size: '23,000+ files',
      detectedFormats:
        'I see: 23,000 files, 12 shared drive folders, permission matrix (viewer/editor/owner per user), file-type distribution (Docs 25%, Sheets 10%, Slides 5%, PDF 36%, Images 17%, Office 7%), search-indexable: ~18,000 (excludes binary/image-only), full-text content available for ~16,000 files, metadata: owner, created-date, modified-date, last-accessed, folder-hierarchy',
      contentTypes: ['text', 'tables', 'images', 'code'],
      updateFrequency: 'continuous',
      completeness: '78% of files modified in past 6 months',
      temporal: 'Files dating back 3+ years',
    },
    {
      id: 'source-jira',
      name: 'Jira Project Management',
      label: 'Jira Project Management',
      format: 'Structured Data + Comments',
      size: '12,400+ issues',
      detectedFormats:
        'I see: 12,400 issues across 3 projects (ENG: 6,200, PROD: 4,100, DESIGN: 2,100), issue-type hierarchy (Epic > Story > Task/Bug, Subtask child-links), workflow states per project (15-20 states), 99,200+ comments (8 avg per issue), 34,650+ linked-issue relationships (blocks, relates, duplicates, depends), labels: 340+ distinct tags (avg 2.3 per issue), 1,247 components grouped by team',
      contentTypes: ['text', 'structured-data'],
      updateFrequency: 'continuous',
      completeness: '100% of issues accessible',
      temporal: 'Full project history',
    },
    {
      id: 'source-dir',
      name: 'Employee Directory',
      label: 'Employee Directory',
      format: 'SQL (Relational)',
      size: '340 employees',
      detectedFormats:
        'I see: 340 employee records, 8 departments, 6-level reporting hierarchy, expertise: 127 distinct skills (avg 4.2 per employee), endorsement counts (avg 8.3 per skill), office locations: 5 global offices (SF, NYC, London, Singapore, Tokyo), start-dates covering 2015-2026 (tenure range 1-11 years), photo URLs for 336 employees (4 missing), email format: firstname.lastname@company.com',
      contentTypes: ['structured-data'],
      updateFrequency: 'real-time',
      completeness: '100% active employee records',
      temporal: 'Ongoing, 11-year tenure range',
    },
  ],
  responseTypes: [
    {
      id: 'resp-001',
      name: 'direct-answer',
      label: 'direct-answer',
      description: 'Concise factual answer with source citation',
      format: 'Text (1-3 sentences) + source link',
      outcomeStates: [
        { state: 'answered', probability: 0.84, description: 'Data found' },
        { state: 'ambiguous', probability: 0.11, description: 'Multiple interpretations' },
        { state: 'not-found', probability: 0.05, description: 'No matching data' },
      ],
    },
    {
      id: 'resp-002',
      name: 'synthesis-report',
      label: 'synthesis-report',
      description: 'Multi-source synthesis with timeline and attribution',
      format: 'Multi-part: summary + timeline + quotes from sources + bibliography',
      outcomeStates: [
        { state: 'complete', probability: 0.61, description: 'All sources included' },
        { state: 'partial', probability: 0.32, description: 'Some sources missing' },
        { state: 'insufficient', probability: 0.07, description: 'Fragmentary information' },
      ],
    },
    {
      id: 'resp-003',
      name: 'person-profile',
      label: 'person-profile',
      description: 'Employee information with expertise, recent activity, team context',
      format: 'Structured (name, role, team, expertise, recent mentions) + narrative',
      outcomeStates: [
        { state: 'complete', probability: 0.68, description: 'Full profile available' },
        { state: 'partial', probability: 0.26, description: 'Limited to public data' },
        { state: 'access-denied', probability: 0.06, description: 'Restricted record' },
      ],
    },
    {
      id: 'resp-004',
      name: 'project-status',
      label: 'project-status',
      description: 'Current project state synthesized from Jira + Confluence + Slack',
      format: 'Multi-part: status summary + timeline + blockers + team members + citations',
      outcomeStates: [
        { state: 'current', probability: 0.72, description: 'Data updated <7 days' },
        { state: 'aging', probability: 0.21, description: 'Data 7-30 days old' },
        { state: 'stale', probability: 0.07, description: 'Data >30 days old' },
      ],
    },
    {
      id: 'resp-005',
      name: 'decision-trail',
      label: 'decision-trail',
      description: 'Chronological reconstruction of how a decision was made across sources',
      format: 'Timeline format: proposal date + discussion dates + decision date + rationale + participants',
      outcomeStates: [
        { state: 'complete', probability: 0.53, description: 'Full trail from proposal to decision' },
        { state: 'partial', probability: 0.38, description: 'Missing discussion phase' },
        { state: 'incomplete', probability: 0.09, description: 'Decision endpoint not located' },
      ],
    },
  ],
  tools: [
    {
      id: 'tool-conf',
      name: 'confluence-api',
      label: 'confluence-api',
      description: 'Confluence REST API for page search (CQL), content retrieval, space listing',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns 100+ results matching query, page content full text available, metadata complete, latency <2 sec',
      },
      degradedState: {
        state: 'degraded',
        description:
          'Returns partial results (10-50), content truncated, metadata incomplete, latency 2-8 sec',
      },
      failureState: {
        state: 'failure',
        description: 'No results returned, service timeout, API rate limit approached',
      },
      errorState: {
        state: 'error',
        description: 'Connection timeout >15 sec, authentication failed, API deprecated endpoint, malformed CQL',
      },
    },
    {
      id: 'tool-slack',
      name: 'slack-api',
      label: 'slack-api',
      description: 'Slack Web API for message search, channel history, user info, thread retrieval',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns message threads with context, user profiles, channel metadata, 10-100 messages per channel, latency <1 sec',
      },
      degradedState: {
        state: 'degraded',
        description: 'Returns messages without threads, user info incomplete, rate limit approaching, latency 1-5 sec',
      },
      failureState: {
        state: 'failure',
        description: 'No messages found, channel history unavailable, user lookup fails',
      },
      errorState: {
        state: 'error',
        description: 'API token expired, channel inaccessible, rate limit exceeded (>100 req/min), network error',
      },
    },
    {
      id: 'tool-gdrive',
      name: 'gdrive-api',
      label: 'gdrive-api',
      description: 'Google Drive API for file search, content retrieval, permission checking',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns 50+ matching files, full text content available, permission status clear, latency <2 sec',
      },
      degradedState: {
        state: 'degraded',
        description: 'Returns partial results (5-50 files), content preview only, permission status ambiguous, latency 2-8 sec',
      },
      failureState: {
        state: 'failure',
        description: 'No files found, permission denied for user, content unavailable',
      },
      errorState: {
        state: 'error',
        description: 'OAuth token expired, quota exceeded, file ID invalid, request timeout >15 sec',
      },
    },
    {
      id: 'tool-jira',
      name: 'jira-api',
      label: 'jira-api',
      description: 'Jira REST API for issue search (JQL), issue details, comments, linked issues',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns 50+ matching issues, full issue details, comments with timestamps, related links resolved, latency <2 sec',
      },
      degradedState: {
        state: 'degraded',
        description: 'Returns partial issues (5-50), details truncated, comments unavailable, latency 2-8 sec',
      },
      failureState: {
        state: 'failure',
        description: 'No issues found, project inaccessible, search service slow',
      },
      errorState: {
        state: 'error',
        description: 'API authentication failed, JQL syntax error, instance unavailable, rate limit exceeded',
      },
    },
    {
      id: 'tool-sql',
      name: 'sql-connector',
      label: 'sql-connector',
      description: 'PostgreSQL connector for employee directory queries with joins and aggregation',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns query result <100 ms, full row set, schema correct, joins resolve',
      },
      degradedState: {
        state: 'degraded',
        description: 'Query delayed 100-500 ms, partial rows (timeout), schema mismatch <5%',
      },
      failureState: {
        state: 'failure',
        description: 'Query empty (no matches), connection timeout, transaction failed',
      },
      errorState: {
        state: 'error',
        description: 'Connection refused (DB offline), SQL error, permission denied, statement timeout >30 sec',
      },
    },
    {
      id: 'tool-embed',
      name: 'embedding-engine',
      label: 'embedding-engine',
      description: 'Vector embedding model (text-embedding-3-large or Cohere) for semantic search across all sources',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Generates embeddings <200 ms per query, semantic similarity matches >85%, retrieves relevant results',
      },
      degradedState: {
        state: 'degraded',
        description: 'Embedding latency 200-800 ms, similarity matches 75-84%, some irrelevant results',
      },
      failureState: {
        state: 'failure',
        description: 'Embedding fails, model unavailable, vector store inaccessible',
      },
      errorState: {
        state: 'error',
        description: 'Model out of memory, timeout >5 sec, invalid input encoding, quota exceeded',
      },
    },
  ],
}

// ─── SaaS Customer Support Data (V3) ────────────────────────────────────

const SAAS_SUPPORT_V3: ContextDefinitionPayloadV3 = {
  tileId: 'saas-customer-support',
  useCaseName: 'SaaS Customer Support Agent',
  complexity: 'Complex',
  tasks: [
    {
      id: 'task-001',
      name: 'ticket-triage',
      label: 'ticket-triage',
      description:
        'Classify incoming ticket by category (12 categories), urgency (P1-P4), sentiment (positive/neutral/negative/angry), and determine if self-service-eligible',
      triggerCondition: 'New ticket from any channel (email/chat/webhook) arrives',
      systemSuggested: true,
    },
    {
      id: 'task-002',
      name: 'kb-search',
      label: 'kb-search',
      description:
        'Perform semantic search over knowledge base (450 articles in 12 categories) to find matching solutions using hybrid vector+keyword approach',
      triggerCondition: 'ticket-triage completes, issue is knowledge-seeking, confidence >65%',
      systemSuggested: true,
    },
    {
      id: 'task-003',
      name: 'action-execution',
      label: 'action-execution',
      description:
        'Execute approved customer actions (password reset, plan upgrade, feature toggle, data export, account reactivation) with precondition validation and post-action logging',
      triggerCondition: 'Customer requests action OR system recommends action during triage and receives approval',
      systemSuggested: true,
    },
    {
      id: 'task-004',
      name: 'response-drafting',
      label: 'response-drafting',
      description:
        'Synthesize personalized support response combining KB content, customer context (subscription, history, sentiment), and system recommendations with tone matching',
      triggerCondition: 'Any ticket path produces response (self-service answer, action confirmation, or escalation handoff)',
      systemSuggested: true,
    },
    {
      id: 'task-005',
      name: 'escalation-routing',
      label: 'escalation-routing',
      description:
        'Route tickets requiring human intervention (complex issues, P1 urgent, confidence <70%, unresolvable actions) to appropriate team (Engineering, Billing, Sales, General Support) with context summary',
      triggerCondition:
        'ticket-triage marks as escalation, OR kb-search finds no match, OR action-execution blocked by preconditions',
      systemSuggested: true,
    },
  ],
  dataSources: [
    {
      id: 'source-kb',
      name: 'Knowledge Base',
      label: 'Knowledge Base',
      format: 'Markdown + Images',
      size: '450 articles',
      detectedFormats:
        'I see: 450 markdown files, 12 category folders (Getting Started 45, Account 38, Billing 52, Integrations 41, API 48, Permissions 35, Workflows 42, Reports 39, Mobile 28, Admin 36, Security 32, Troubleshooting 57), 2,340 embedded screenshots, 156 code snippets, 1,247 FAQ items, vector embeddings (1,536 dims), keyword index (95K unique terms), update frequency 2-5 articles/day',
      contentTypes: ['text', 'images', 'code'],
      updateFrequency: 'weekly',
      completeness: '100% (all articles accessible)',
      temporal: 'Updated monthly, 95% within 30 days, 5% >30 days old',
    },
    {
      id: 'source-db',
      name: 'Customer Database',
      label: 'Customer Database',
      format: 'PostgreSQL',
      size: '8,500 accounts',
      detectedFormats:
        'I see: 5 core tables (accounts, users, subscriptions, tickets, ticket_comments), 8,500 accounts (active: 6,200, suspended: 900, churned: 1,400), 34,000 users (avg 4 per account), 8,500 subscriptions (Free: 4,200, Pro: 2,800, Enterprise: 1,500), 45,000 historical tickets (avg 5.3 per account, resolution: 68% KB, 15% action, 17% escalation), categorical fields: (plan: Free/Pro/Enterprise, status: active/suspended/churned, resolution_method), temporal fields: (created_at, updated_at, resolved_at, last_login), monetary fields: (monthly_spend, contract_value)',
      contentTypes: ['structured-data'],
      updateFrequency: 'real-time',
      completeness: '100% current data',
      temporal: 'Full history Jan 2024 - March 2026',
    },
    {
      id: 'source-api',
      name: 'Action API',
      label: 'Action API',
      format: 'REST API',
      size: 'Dynamic',
      detectedFormats:
        'I see: REST API, endpoints: /action/password-reset, /action/plan-change, /action/toggle-feature, /action/export-data, /action/suspend-account, request schema: {action_type, account_id, parameters}, response: {status: success/failed/requires-confirmation, confirmation_required: true/false, details}. Preconditions: (account_status must be active/suspended, no_payment_overdue, feature_tier_check). Authentication: Bearer token. Rate: 1000 req/min. Latency: 200-800ms',
      contentTypes: ['structured-data'],
      updateFrequency: 'real-time',
      completeness: '100% availability (94% success rate, 6% blocked by preconditions)',
      temporal: 'Real-time operations',
    },
  ],
  responseTypes: [
    {
      id: 'resp-001',
      name: 'self-service-answer',
      label: 'self-service-answer',
      description: 'KB article link + summarized steps + estimated resolution time. Resolves ticket without human involvement.',
      format: 'Structured: title + summary (2-4 sentences) + link + step bullets + estimated time',
      outcomeStates: [
        { state: 'complete', probability: 0.62, description: 'Article found, confidence >85%' },
        { state: 'partial', probability: 0.12, description: 'Article found, confidence 70-84%' },
        { state: 'not-found', probability: 0.26, description: 'No match, confidence <70%' },
      ],
    },
    {
      id: 'resp-002',
      name: 'action-confirmation',
      label: 'action-confirmation',
      description: 'Confirmation that action was executed successfully. Shows before/after state and any follow-up steps required.',
      format: 'Structured: action name + confirmation message + before state + after state + follow-ups',
      outcomeStates: [
        { state: 'executed', probability: 0.71, description: 'Action succeeded' },
        { state: 'requires-confirmation', probability: 0.18, description: 'Email/supervisor approval pending' },
        { state: 'blocked', probability: 0.11, description: 'Preconditions failed' },
      ],
    },
    {
      id: 'resp-003',
      name: 'escalation-handoff',
      label: 'escalation-handoff',
      description: 'Ticket routed to human agent with context summary, KB search results already tried, and any preliminary findings.',
      format: 'Structured: ticket number + assigned team + priority + context summary + attempted solutions + next steps',
      outcomeStates: [
        { state: 'assigned-to-engineer', probability: 0.28, description: 'Complex technical' },
        { state: 'assigned-to-billing', probability: 0.12, description: 'Pricing/contract' },
        { state: 'assigned-to-sales', probability: 0.08, description: 'Upsell/retention' },
        { state: 'assigned-general', probability: 0.48, description: 'Other' },
        { state: 'requires-supervisor-approval', probability: 0.04, description: 'High-value action' },
      ],
    },
    {
      id: 'resp-004',
      name: 'clarification-request',
      label: 'clarification-request',
      description: 'Ask customer for more details before proceeding (ambiguous query, missing context, multiple possible solutions).',
      format: 'Natural language question + numbered options if applicable',
      outcomeStates: [
        { state: 'clarified', probability: 0.68, description: 'Customer provided info' },
        { state: 'awaiting-response', probability: 0.24, description: "Customer hasn't replied within 4 hours" },
        { state: 'timeout', probability: 0.08, description: 'Closed due to inactivity' },
      ],
    },
  ],
  tools: [
    {
      id: 'tool-kb',
      name: 'kb-search-engine',
      label: 'kb-search-engine',
      description:
        'Semantic + keyword hybrid search over knowledge base. Uses vector embeddings (OpenAI text-embed-3-small) + BM25 keyword matching. Returns top-K matching articles with relevance scores.',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns 3-5 highly relevant articles (cosine similarity >0.82), <500ms latency, article freshness check passes',
      },
      degradedState: {
        state: 'degraded',
        description: 'Returns articles with similarity 0.70-0.81, latency 500-1500ms, some articles >3 weeks old, or only 1-2 matches',
      },
      failureState: {
        state: 'failure',
        description: 'No articles found (similarity <0.70), latency >1500ms, query too short/ambiguous, search index out of sync',
      },
      errorState: {
        state: 'error',
        description: 'Connection timeout (>2000ms), embedding API unavailable, search index corrupted, malformed query',
      },
    },
    {
      id: 'tool-db',
      name: 'sql-connector',
      label: 'sql-connector',
      description:
        'Customer database lookup. Queries accounts, subscriptions, user history, ticket history. Joins on account_id, returns structured results. Handles NULL values gracefully.',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Query completes <50ms, all requested rows retrieved, schema 100% match, NULL handling correct',
      },
      degradedState: {
        state: 'degraded',
        description: 'Query latency 50-200ms, partial row retrieval (timeout), schema drift <5%, NULL inconsistency',
      },
      failureState: {
        state: 'failure',
        description: 'Empty result (no matching account), query constraint too broad (returns >1000 rows), transaction rolled back',
      },
      errorState: {
        state: 'error',
        description: 'Connection refused, SQL syntax error, permission denied, table locked, connection timeout >45sec',
      },
    },
    {
      id: 'tool-api',
      name: 'action-api',
      label: 'action-api',
      description:
        'REST API for customer actions. Calls endpoints for password reset, plan change, feature toggle, etc. Validates preconditions before executing. Returns status + confirmation requirement.',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Action executed successfully (status=success), preconditions all pass, <500ms latency, confirmation not required',
      },
      degradedState: {
        state: 'degraded',
        description:
          'Action executed but confirmation pending (requires email/supervisor approval), latency 500-1200ms, partial precondition failure',
      },
      failureState: {
        state: 'failure',
        description: 'Action failed precondition (account suspended, payment overdue, feature not available for plan), latency >1200ms, retries exhausted',
      },
      errorState: {
        state: 'error',
        description: 'Connection timeout >45sec, invalid API token, rate limit exceeded (>1000 req/min), malformed request',
      },
    },
    {
      id: 'tool-email',
      name: 'email-sender',
      label: 'email-sender',
      description:
        'Send formatted email responses to customers. Supports templates, variable substitution, attachments (KB article PDFs), HTML formatting. Respects contact preferences and quiet hours (no weekend emails unless P1 urgent).',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Email sent successfully, all variables substituted, no bounces, <100ms render time, respects customer preferences',
      },
      degradedState: {
        state: 'degraded',
        description: 'Email sent with minor rendering issues (variable missing, 1-2 images not loaded), latency 100-300ms, preference partially respected',
      },
      failureState: {
        state: 'failure',
        description: 'Email not sent (hard bounce, invalid email), template error, attachment generation failed',
      },
      errorState: {
        state: 'error',
        description: 'SMTP timeout (>45sec), attachment too large (>25MB), rate limit exceeded (>500 emails/min), malformed HTML',
      },
    },
  ],
}

// ─── FAQ Knowledge Agent Data (V3) ─────────────────────────────────────

const FAQ_AGENT_V3: ContextDefinitionPayloadV3 = {
  tileId: 'faq-knowledge',
  useCaseName: 'FAQ Knowledge Agent',
  complexity: 'Moderate',
  tasks: [
    {
      id: 'task-001',
      name: 'query-understanding',
      label: 'query-understanding',
      description: 'Parse user question, identify intent (policy lookup, procedure question, definition request), extract key entities (topic, category, role context)',
      triggerCondition: 'User submits question',
      systemSuggested: true,
    },
    {
      id: 'task-002',
      name: 'document-retrieval',
      label: 'document-retrieval',
      description:
        'Search knowledge base using semantic and keyword search for relevant documents; return top 3 ranked results with relevance scores',
      triggerCondition: 'query-understanding completes',
      systemSuggested: true,
    },
    {
      id: 'task-003',
      name: 'answer-generation',
      label: 'answer-generation',
      description: 'Generate concise answer from retrieved document(s), synthesize multi-doc content if needed, add document citation with link/ID',
      triggerCondition: 'document-retrieval returns results',
      systemSuggested: true,
    },
  ],
  dataSources: [
    {
      id: 'source-kb',
      name: 'Company Knowledge Base',
      label: 'Company Knowledge Base',
      format: 'Markdown + PDF',
      size: '280 documents',
      detectedFormats:
        'I see: 220 Markdown files (yaml frontmatter + content), 45 PDF policy docs (text layer OCR\'d, 95%+ accuracy), 15 Google Doc exports, 12 category folders (HR Policies 45, IT Guides 38, Office Procedures 32, Benefits & Perks 28, Onboarding 25, Security Policies 22, Travel & Expenses 20, Company Culture 18, Legal & Compliance 16, Engineering Standards 15, Product Guidelines 12, Miscellaneous 9), document index with 2,847 unique keywords/topics, monthly refresh cycle',
      contentTypes: ['text', 'images'],
      updateFrequency: 'monthly',
      completeness: '100% (all documents accessible)',
      temporal: 'Updated monthly, comprehensive historical coverage',
    },
  ],
  responseTypes: [
    {
      id: 'resp-001',
      name: 'direct-answer',
      label: 'direct-answer',
      description: 'Concise answer with document link, 1-3 sentences + source citation',
      format: 'Text + inline citation link',
      outcomeStates: [
        { state: 'answered', probability: 0.85, description: 'Sufficient doc found' },
        { state: 'clarification-needed', probability: 0.10, description: 'Query ambiguous' },
        { state: 'data-unavailable', probability: 0.05, description: 'No doc match' },
      ],
    },
    {
      id: 'resp-002',
      name: 'document-excerpt',
      label: 'document-excerpt',
      description: 'Relevant section extracted from document with surrounding context (2-3 paragraphs) + full citation',
      format: 'Quoted text + source doc ID/title + last-updated',
      outcomeStates: [
        { state: 'complete-excerpt', probability: 0.72, description: 'Full relevant section' },
        { state: 'partial-excerpt', probability: 0.22, description: 'Partial match, 1-2 para' },
        { state: 'insufficient-context', probability: 0.06, description: 'Match found but lacks context' },
      ],
    },
    {
      id: 'resp-003',
      name: 'not-found',
      label: 'not-found',
      description: 'Honest "information not available" response with suggestion to contact HR/IT + related docs if any',
      format: 'Text message + escalation path',
      outcomeStates: [
        { state: 'no-match-found', probability: 0.45, description: 'Zero docs match' },
        { state: 'low-confidence-match', probability: 0.35, description: 'Relevance <60%' },
        { state: 'escalation-suggested', probability: 0.20, description: 'Recommendation to expert' },
      ],
    },
  ],
  tools: [
    {
      id: 'tool-search',
      name: 'kb-search',
      label: 'kb-search',
      description:
        'Semantic search over document embeddings + keyword search fallback. Returns top-N results ranked by relevance score (0-100). Hybrid search combines vector similarity and keyword overlap. Latency <2 sec.',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Returns 1-3 high-relevance docs (score >80), zero duplicates, correct ranking',
      },
      degradedState: {
        state: 'degraded',
        description: 'Returns docs with relevance 60-79, 1-2 duplicates in results, ranking slightly off, latency 2-5 sec',
      },
      failureState: {
        state: 'failure',
        description: 'No results found (relevance <50 for all docs), query too vague to disambiguate (10 docs returned, all <60% score), timeout (latency >5 sec)',
      },
      errorState: {
        state: 'error',
        description: 'Knowledge base index unavailable (connection refused), search engine not initialized, malformed query (special chars cause error), index corruption (stale embeddings)',
      },
    },
    {
      id: 'tool-doc-reader',
      name: 'document-reader',
      label: 'document-reader',
      description:
        'Retrieve and parse specific document by ID. Extract metadata (title, category, last-updated, keywords), parse markdown/PDF structure, return full content or specific section.',
      status: 'active',
      autoDetected: true,
      successState: {
        state: 'success',
        description: 'Document retrieved fully (100% completeness), metadata parsed correctly, structure valid',
      },
      degradedState: {
        state: 'degraded',
        description: 'Document retrieved with minor parsing issues (1-2 formatting quirks), metadata partial (missing 1 field), latency 200-500 ms',
      },
      failureState: {
        state: 'failure',
        description: 'Document parsing fails (PDF text layer missing, requires OCR), structure invalid (corrupted markdown), document not found in index',
      },
      errorState: {
        state: 'error',
        description: 'File system error (storage unavailable), permission denied (document access restricted), timeout (document >50 MB), format unsupported',
      },
    },
  ],
}

// ─── Mapping and Lookup ────────────────────────────────────────────────────

const CONTEXT_DEFINITION_MAP_V3: Record<string, ContextDefinitionPayloadV3> = {
  'invoice-processing': INVOICE_PROCESSING_V3,
  'enterprise-rag': ENTERPRISE_RAG_V3,
  'saas-customer-support': SAAS_SUPPORT_V3,
  'faq-knowledge': FAQ_AGENT_V3,
}

export function getContextDefinitionDataV3(
  tileId: string | null
): ContextDefinitionPayloadV3 | null {
  if (!tileId) return null
  return CONTEXT_DEFINITION_MAP_V3[tileId] ?? null
}

export function getAllContextDefinitionDataV3(): Record<string, ContextDefinitionPayloadV3> {
  return CONTEXT_DEFINITION_MAP_V3
}
