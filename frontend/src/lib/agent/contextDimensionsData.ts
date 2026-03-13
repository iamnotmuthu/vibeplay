import type { UserProfile, OutputPreference, SourceContribution } from '@/store/agentTypes'

// ─── Data Type Chips ──────────────────────────────────────────────────────
// Auto-detected data type categories for each source

export type DataTypeChip = 'text-documents' | 'tables' | 'images' | 'structured-data' | 'audio' | 'code'

export const DATA_TYPE_LABELS: Record<DataTypeChip, string> = {
  'text-documents': 'Text Documents',
  tables: 'Tables',
  images: 'Images',
  'structured-data': 'Structured Data',
  audio: 'Audio',
  code: 'Code',
}

export const DATA_TYPE_COLORS: Record<DataTypeChip, { bg: string; text: string; border: string }> = {
  'text-documents': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  tables: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  images: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  'structured-data': { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  audio: { bg: '#fce7f3', text: '#be185d', border: '#fbcfe8' },
  code: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
}

// ─── Output Preference Tags ──────────────────────────────────────────────
// OutputPreference type is now canonical in agentTypes.ts — re-exported below

export { type OutputPreference } from '@/store/agentTypes'

export const OUTPUT_PREFERENCE_LABELS: Record<OutputPreference, string> = {
  'short-answer': 'Short Answer',
  'detailed-explanation': 'Detailed Explanation',
  'summary-report': 'Summary Report',
  'action-list': 'Action List',
  'data-table': 'Data Table',
  'visual-chart': 'Visual Chart',
  'step-by-step': 'Step-by-Step',
  comparison: 'Comparison',
  'code-snippet': 'Code Snippet',
}

// ─── Source Contribution (traces back to Context Definition) ─────────────
// SourceContribution interface is now canonical in agentTypes.ts — re-exported below

export { type SourceContribution } from '@/store/agentTypes'

// ─── Dimension Aggregate (type-based, with source attribution) ──────────

export interface DimensionAggregate {
  type: DataTypeChip
  totalCount: string          // "4,386 items"
  sources: SourceContribution[]
  processingNote?: string     // "Requires OCR for scanned pages"
}

// ─── Enhanced User Profile with output preferences ──────────────────────

export interface DimensionUserProfile extends UserProfile {
  outputPreferences: OutputPreference[]
  interactionContext: string // short description of how this profile uses the agent
}

// ─── Payload ──────────────────────────────────────────────────────────────

export interface ContextDimensionsPayload {
  dimensions: DimensionAggregate[]
  userProfiles: DimensionUserProfile[]
  summaryText: string
}

// ─── FAQ / Knowledge Agent ────────────────────────────────────────────────
// Context Definition sources:
//   knowledge_base.json (JSON, 2.4 MB, structured-data)
//   faq_entries.csv (CSV, 890 KB, tables)
//   product_docs.pdf (PDF, 12 MB, text + tables)

const FAQ_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'text-documents',
      totalCount: '1,433 text sections',
      sources: [
        { sourceId: 'knowledge-base-json', sourceName: 'knowledge_base.json', count: '1,247 Q&A entries' },
        { sourceId: 'product-docs-pdf', sourceName: 'product_docs.pdf', count: '186 pages' },
      ],
    },
    {
      type: 'tables',
      totalCount: '76 tables',
      sources: [
        { sourceId: 'faq-entries-csv', sourceName: 'faq_entries.csv', count: '634 rows across 1 table' },
        { sourceId: 'product-docs-pdf', sourceName: 'product_docs.pdf', count: '42 embedded tables' },
      ],
    },
    {
      type: 'images',
      totalCount: '94 images',
      sources: [
        { sourceId: 'product-docs-pdf', sourceName: 'product_docs.pdf', count: '94 diagrams and screenshots' },
      ],
      processingNote: 'Diagrams indexed for visual search; screenshots OCR-processed for text extraction',
    },
    {
      type: 'structured-data',
      totalCount: '1,247 structured entries',
      sources: [
        { sourceId: 'knowledge-base-json', sourceName: 'knowledge_base.json', count: '1,247 JSON entries with topic metadata' },
      ],
    },
  ],
  userProfiles: [
    {
      id: 'system-user',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: ['Batch process 500 FAQ queries', 'Reset embedding index'],
      isCore: true,
      outputPreferences: ['data-table', 'action-list', 'summary-report'],
      interactionContext: 'Manages the agent infrastructure and monitors system health',
    },
    {
      id: 'business-user',
      category: 'Business User',
      proficiency: 'medium',
      exampleQuestions: ['Which topics get most escalations?', 'How do we improve coverage?'],
      isCore: true,
      outputPreferences: ['summary-report', 'visual-chart', 'comparison'],
      interactionContext: 'Reviews agent performance and identifies knowledge gaps',
    },
    {
      id: 'end-user',
      category: 'End User',
      proficiency: 'low',
      exampleQuestions: ['How do I reset my password?', 'What are the pricing plans?'],
      isCore: true,
      outputPreferences: ['short-answer', 'step-by-step'],
      interactionContext: 'Asks product questions and expects quick, clear answers',
    },
    {
      id: 'support-agent',
      category: 'Support Agent',
      proficiency: 'medium',
      exampleQuestions: ['Pull up troubleshooting guide for error 403', 'What does the SLA say about uptime?'],
      isCore: false,
      outputPreferences: ['detailed-explanation', 'step-by-step', 'short-answer'],
      interactionContext: 'Uses the agent to assist customers during live support sessions',
    },
  ],
  summaryText: '3 sources decomposed into 4 content types: 1,433 text sections, 76 tables, 94 images, and 1,247 structured entries. 4 user profiles requiring 7 distinct output formats.',
}

// ─── Document Intelligence Agent ──────────────────────────────────────────
// Context Definition sources:
//   AWS_Invoice_Jan.pdf (PDF, 3.2 MB, text + tables)
//   GCP_Invoice_Jan.pdf (PDF, 2.8 MB, text + tables)
//   Azure_Invoice_Jan.pdf (PDF, 4.1 MB, text + tables)
//   Invoice_Template.xlsx (XLSX, 450 KB, tables)

const DOC_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'text-documents',
      totalCount: '342 text sections',
      sources: [
        { sourceId: 'aws-invoice', sourceName: 'AWS_Invoice_Jan.pdf', count: '124 text sections' },
        { sourceId: 'gcp-invoice', sourceName: 'GCP_Invoice_Jan.pdf', count: '98 text sections' },
        { sourceId: 'azure-invoice', sourceName: 'Azure_Invoice_Jan.pdf', count: '120 text sections' },
      ],
    },
    {
      type: 'tables',
      totalCount: '89 tables',
      sources: [
        { sourceId: 'aws-invoice', sourceName: 'AWS_Invoice_Jan.pdf', count: '28 line-item tables' },
        { sourceId: 'gcp-invoice', sourceName: 'GCP_Invoice_Jan.pdf', count: '22 line-item tables' },
        { sourceId: 'azure-invoice', sourceName: 'Azure_Invoice_Jan.pdf', count: '31 line-item tables' },
        { sourceId: 'invoice-template', sourceName: 'Invoice_Template.xlsx', count: '8 template sheets' },
      ],
    },
    {
      type: 'images',
      totalCount: '18 images',
      sources: [
        { sourceId: 'aws-invoice', sourceName: 'AWS_Invoice_Jan.pdf', count: '6 logos and charts' },
        { sourceId: 'gcp-invoice', sourceName: 'GCP_Invoice_Jan.pdf', count: '4 logos and charts' },
        { sourceId: 'azure-invoice', sourceName: 'Azure_Invoice_Jan.pdf', count: '8 logos and charts' },
      ],
      processingNote: 'Logos used for vendor identification; charts indexed for trend extraction',
    },
    {
      type: 'structured-data',
      totalCount: '15,200 line items',
      sources: [
        { sourceId: 'aws-invoice', sourceName: 'AWS_Invoice_Jan.pdf', count: '6,400 extracted line items' },
        { sourceId: 'gcp-invoice', sourceName: 'GCP_Invoice_Jan.pdf', count: '3,800 extracted line items' },
        { sourceId: 'azure-invoice', sourceName: 'Azure_Invoice_Jan.pdf', count: '5,000 extracted line items' },
      ],
      processingNote: 'Line items normalized to common schema for cross-vendor comparison',
    },
  ],
  userProfiles: [
    {
      id: 'system-user',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: ['Reindex contract embeddings', 'Run extraction pipeline on new batch'],
      isCore: true,
      outputPreferences: ['data-table', 'action-list'],
      interactionContext: 'Manages document processing pipelines and extraction models',
    },
    {
      id: 'business-user',
      category: 'Business User',
      proficiency: 'medium',
      exampleQuestions: ['Show contracts expiring this quarter', 'Compare AWS vs GCP spend'],
      isCore: true,
      outputPreferences: ['summary-report', 'comparison', 'visual-chart', 'data-table'],
      interactionContext: 'Analyzes document data for business decisions and reporting',
    },
    {
      id: 'end-user',
      category: 'End User',
      proficiency: 'low',
      exampleQuestions: ['What is my March invoice total?', 'Find the NDA with Acme Corp'],
      isCore: true,
      outputPreferences: ['short-answer', 'data-table'],
      interactionContext: 'Looks up specific documents and asks about billing details',
    },
    {
      id: 'legal-reviewer',
      category: 'Legal Reviewer',
      proficiency: 'high',
      exampleQuestions: ['Flag contracts with non-standard indemnity clauses', 'Which contracts lack arbitration?'],
      isCore: false,
      outputPreferences: ['detailed-explanation', 'data-table', 'comparison'],
      interactionContext: 'Reviews contracts for legal risks and compliance gaps',
    },
    {
      id: 'finance-analyst',
      category: 'Finance Analyst',
      proficiency: 'medium',
      exampleQuestions: ['Monthly cost trend by service', 'Which vendor invoices are overdue?'],
      isCore: false,
      outputPreferences: ['visual-chart', 'data-table', 'summary-report'],
      interactionContext: 'Tracks spending patterns and flags billing anomalies',
    },
  ],
  summaryText: '4 sources decomposed into 4 content types: 342 text sections, 89 tables, 18 images, and 15,200 structured line items. 5 user profiles requiring 8 distinct output formats.',
}

// ─── Research & Comparison Agent ──────────────────────────────────────────
// Context Definition sources:
//   research_papers.db (Database, 180 MB, text)
//   citations_index.json (JSON, 45 MB, structured-data)
//   abstracts.csv (CSV, 22 MB, tables)

const RESEARCH_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'text-documents',
      totalCount: '4,580 text documents',
      sources: [
        { sourceId: 'research-papers-db', sourceName: 'research_papers.db', count: '4,200 full-text papers' },
        { sourceId: 'abstracts-csv', sourceName: 'abstracts.csv', count: '380 abstract summaries' },
      ],
    },
    {
      type: 'tables',
      totalCount: '2,180 tables',
      sources: [
        { sourceId: 'research-papers-db', sourceName: 'research_papers.db', count: '1,800 embedded data tables' },
        { sourceId: 'abstracts-csv', sourceName: 'abstracts.csv', count: '380 rows (metadata table)' },
      ],
    },
    {
      type: 'images',
      totalCount: '6,300 figures',
      sources: [
        { sourceId: 'research-papers-db', sourceName: 'research_papers.db', count: '6,300 charts, diagrams, and figures' },
      ],
      processingNote: 'Figures indexed by caption text; charts extracted for data comparison',
    },
    {
      type: 'structured-data',
      totalCount: '89,400 citation links',
      sources: [
        { sourceId: 'citations-index', sourceName: 'citations_index.json', count: '89,400 citation relationships' },
      ],
    },
  ],
  userProfiles: [
    {
      id: 'system-user',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: ['Refresh vendor index from new data dump', 'Validate evaluation schema'],
      isCore: true,
      outputPreferences: ['action-list', 'data-table'],
      interactionContext: 'Maintains the research data pipeline and index freshness',
    },
    {
      id: 'business-user',
      category: 'Business User',
      proficiency: 'medium',
      exampleQuestions: ['Compare top 3 CRM vendors for mid-market', 'What did we evaluate last quarter?'],
      isCore: true,
      outputPreferences: ['comparison', 'summary-report', 'visual-chart'],
      interactionContext: 'Drives procurement decisions using vendor research',
    },
    {
      id: 'end-user',
      category: 'End User',
      proficiency: 'low',
      exampleQuestions: ['Which vendor handles HIPAA compliance?', 'Cheapest option for cloud storage?'],
      isCore: true,
      outputPreferences: ['short-answer', 'comparison'],
      interactionContext: 'Asks quick vendor comparison questions for specific needs',
    },
  ],
  summaryText: '3 sources decomposed into 4 content types: 4,580 text documents, 2,180 tables, 6,300 figures, and 89,400 citation links. 3 user profiles requiring 6 distinct output formats.',
}

// ─── Decision & Workflow Agent (Dental) ───────────────────────────────────
// Context Definition sources:
//   patient_records.db (Database, 95 MB, text)
//   insurance_plans.pdf (PDF, 8.5 MB, text + tables)
//   treatment_codes.csv (CSV, 1.2 MB, tables)

const DECISION_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'text-documents',
      totalCount: '45,180 text records',
      sources: [
        { sourceId: 'patient-records', sourceName: 'patient_records.db', count: '45,000 patient records' },
        { sourceId: 'insurance-plans', sourceName: 'insurance_plans.pdf', count: '180 plan descriptions' },
      ],
    },
    {
      type: 'tables',
      totalCount: '12,634 tabular records',
      sources: [
        { sourceId: 'insurance-plans', sourceName: 'insurance_plans.pdf', count: '234 coverage matrices' },
        { sourceId: 'treatment-codes', sourceName: 'treatment_codes.csv', count: '12,400 procedure codes' },
      ],
    },
    {
      type: 'images',
      totalCount: '42 diagrams',
      sources: [
        { sourceId: 'insurance-plans', sourceName: 'insurance_plans.pdf', count: '42 decision trees and flowcharts' },
      ],
      processingNote: 'Decision tree diagrams parsed into executable logic for treatment routing',
    },
    {
      type: 'structured-data',
      totalCount: '45,000 patient profiles',
      sources: [
        { sourceId: 'patient-records', sourceName: 'patient_records.db', count: '45,000 structured patient profiles' },
      ],
      processingNote: 'Demographics, medical history, insurance, and appointment data indexed per patient',
    },
  ],
  userProfiles: [
    {
      id: 'system-user',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: ['Run nightly insurance sync', 'Check API health for scheduling'],
      isCore: true,
      outputPreferences: ['action-list', 'data-table'],
      interactionContext: 'Manages integrations between clinical and administrative systems',
    },
    {
      id: 'business-user',
      category: 'Practice Manager',
      proficiency: 'medium',
      exampleQuestions: ['Show no-show rate by provider', 'Revenue by insurance plan this month'],
      isCore: true,
      outputPreferences: ['visual-chart', 'summary-report', 'data-table'],
      interactionContext: 'Monitors practice operations and financial performance',
    },
    {
      id: 'end-user',
      category: 'Patient',
      proficiency: 'low',
      exampleQuestions: ['Book a cleaning next week', 'Does my insurance cover a crown?'],
      isCore: true,
      outputPreferences: ['short-answer', 'step-by-step'],
      interactionContext: 'Schedules appointments and checks insurance coverage',
    },
    {
      id: 'dentist',
      category: 'Dentist',
      proficiency: 'high',
      exampleQuestions: ['Pull treatment history for patient #4521', 'Check contraindications for penicillin'],
      isCore: false,
      outputPreferences: ['detailed-explanation', 'data-table', 'step-by-step'],
      interactionContext: 'Accesses clinical data during patient consultations',
    },
    {
      id: 'insurance-coordinator',
      category: 'Insurance Coordinator',
      proficiency: 'medium',
      exampleQuestions: ['Verify coverage for procedure D2740', 'Which patients have maxed annual benefits?'],
      isCore: false,
      outputPreferences: ['data-table', 'short-answer', 'summary-report'],
      interactionContext: 'Verifies insurance coverage and handles claims processing',
    },
  ],
  summaryText: '3 sources decomposed into 4 content types: 45,180 text records, 12,634 tabular records, 42 diagrams, and 45,000 structured profiles. 5 user profiles requiring 8 distinct output formats.',
}

// ─── SaaS Copilot Agent ───────────────────────────────────────────────────
// Context Definition sources:
//   saas_schema.json (JSON, 3.1 MB, structured-data)
//   workflow_definitions.yaml (YAML, 1.8 MB, structured-data)
//   tool_catalog.db (Database, 2.4 MB, text)
//   action_history.csv (CSV, 5.2 MB, tables)

const SAAS_COPILOT_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'text-documents',
      totalCount: '1,240 text entries',
      sources: [
        { sourceId: 'tool-definitions', sourceName: 'tool_catalog.db', count: '890 tool descriptions' },
        { sourceId: 'user-workflows', sourceName: 'workflow_definitions.yaml', count: '350 workflow descriptions' },
      ],
    },
    {
      type: 'tables',
      totalCount: '340,000 action records',
      sources: [
        { sourceId: 'action-history', sourceName: 'action_history.csv', count: '340,000 historical action rows' },
      ],
    },
    {
      type: 'structured-data',
      totalCount: '3,340 structured definitions',
      sources: [
        { sourceId: 'app-schema', sourceName: 'saas_schema.json', count: '890 API endpoint schemas' },
        { sourceId: 'user-workflows', sourceName: 'workflow_definitions.yaml', count: '350 workflow DAGs' },
        { sourceId: 'action-history', sourceName: 'action_history.csv', count: '2,100 permission rule mappings' },
      ],
      processingNote: 'Schemas cross-referenced with workflow definitions to validate action permissions',
    },
    {
      type: 'code',
      totalCount: '350 executable definitions',
      sources: [
        { sourceId: 'user-workflows', sourceName: 'workflow_definitions.yaml', count: '350 automation scripts' },
      ],
    },
  ],
  userProfiles: [
    {
      id: 'system-user',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: ['Generate API client library', 'Validate permission schema'],
      isCore: true,
      outputPreferences: ['data-table', 'action-list'],
      interactionContext: 'Manages API integrations and system configuration',
    },
    {
      id: 'product-manager',
      category: 'Business User/Product Manager',
      proficiency: 'medium',
      exampleQuestions: ['Which endpoints are most heavily used?', 'Show permission access patterns'],
      isCore: true,
      outputPreferences: ['summary-report', 'visual-chart', 'data-table'],
      interactionContext: 'Analyzes API usage and permission patterns for product decisions',
    },
    {
      id: 'end-user',
      category: 'End User',
      proficiency: 'low',
      exampleQuestions: ['How do I call the user API?', 'What permissions do I have?'],
      isCore: true,
      outputPreferences: ['short-answer', 'step-by-step'],
      interactionContext: 'Learns how to use the API and checks personal permissions',
    },
    {
      id: 'power-user',
      category: 'Power User',
      proficiency: 'high',
      exampleQuestions: ['Generate advanced API queries', 'Show audit trail for user actions'],
      isCore: false,
      outputPreferences: ['code-snippet', 'data-table', 'action-list'],
      interactionContext: 'Builds custom integrations and analyzes system behavior',
    },
  ],
  summaryText: '4 sources decomposed into 4 content types: 1,240 text entries, 340K action records, 3,340 structured definitions, and 350 executable workflows. 4 user profiles requiring 7 distinct output formats.',
}

// ─── Long-Running Ops Agent ───────────────────────────────────────────────
// Context Definition sources:
//   job_queue.db (Database, 12 MB, text)
//   migration_schemas.yaml (YAML, 3.4 MB, structured-data)
//   job_execution_logs.tar.gz (Archive, 340 MB, text)
//   job_templates.json (JSON, 2.1 MB, structured-data)

const OPS_AGENT_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'text-documents',
      totalCount: '890,340 text records',
      sources: [
        { sourceId: 'job-queue', sourceName: 'job_queue.db', count: '340 active job descriptions' },
        { sourceId: 'historical-logs', sourceName: 'job_execution_logs.tar.gz', count: '890,000 log entries' },
      ],
    },
    {
      type: 'tables',
      totalCount: '890,000 execution records',
      sources: [
        { sourceId: 'historical-logs', sourceName: 'job_execution_logs.tar.gz', count: '890,000 rows (15 structured columns per entry)' },
      ],
      processingNote: 'Log entries parsed into structured columns: timestamp, job_id, status, duration, exit_code, etc.',
    },
    {
      type: 'structured-data',
      totalCount: '825 configuration objects',
      sources: [
        { sourceId: 'migration-schemas', sourceName: 'migration_schemas.yaml', count: '340 pipeline definitions' },
        { sourceId: 'config-templates', sourceName: 'job_templates.json', count: '245 template configurations' },
        { sourceId: 'job-queue', sourceName: 'job_queue.db', count: '240 alert rule definitions' },
      ],
    },
    {
      type: 'code',
      totalCount: '340 pipeline specs',
      sources: [
        { sourceId: 'migration-schemas', sourceName: 'migration_schemas.yaml', count: '340 deployment specifications' },
      ],
    },
  ],
  userProfiles: [
    {
      id: 'system-user',
      category: 'System User/SRE',
      proficiency: 'high',
      exampleQuestions: ['Deploy pipeline to production', 'Analyze job failure patterns'],
      isCore: true,
      outputPreferences: ['data-table', 'action-list', 'code-snippet'],
      interactionContext: 'Manages pipeline operations and troubleshoots execution issues',
    },
    {
      id: 'engineering-manager',
      category: 'Business User/Engineering Manager',
      proficiency: 'medium',
      exampleQuestions: ['Show pipeline success rate', 'Which jobs are slowest?'],
      isCore: true,
      outputPreferences: ['summary-report', 'visual-chart'],
      interactionContext: 'Monitors team efficiency and pipeline health metrics',
    },
    {
      id: 'developer',
      category: 'End User/Developer',
      proficiency: 'medium',
      exampleQuestions: ['What failed in my last job run?', 'How do I debug this pipeline?'],
      isCore: true,
      outputPreferences: ['short-answer', 'step-by-step', 'data-table'],
      interactionContext: 'Develops and debugs pipeline configurations',
    },
  ],
  summaryText: '4 sources decomposed into 4 content types: 890K text records, 890K execution rows, 825 config objects, and 340 pipeline specs. 3 user profiles requiring 7 distinct output formats.',
}

// ─── Coding & Development Agent ───────────────────────────────────────────
// Context Definition sources:
//   repository_snapshot.tar.gz (Archive, 280 MB, text)
//   api_documentation.md (Markdown, 8.2 MB, text)
//   test_suite.db (Database, 45 MB, text)
//   code_style_guide.md (Markdown, 1.2 MB, text)

const CODING_AGENT_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'code',
      totalCount: '45,000 source files',
      sources: [
        { sourceId: 'codebase-repo', sourceName: 'repository_snapshot.tar.gz', count: '45,000 source files across 12 languages' },
      ],
    },
    {
      type: 'text-documents',
      totalCount: '2,400 documentation pages',
      sources: [
        { sourceId: 'api-docs', sourceName: 'api_documentation.md', count: '1,200 API reference pages' },
        { sourceId: 'style-guide', sourceName: 'code_style_guide.md', count: '180 style rule pages' },
        { sourceId: 'codebase-repo', sourceName: 'repository_snapshot.tar.gz', count: '1,020 inline doc comments' },
      ],
    },
    {
      type: 'structured-data',
      totalCount: '12,890 indexed entries',
      sources: [
        { sourceId: 'test-patterns', sourceName: 'test_suite.db', count: '12,000 test case records' },
        { sourceId: 'codebase-repo', sourceName: 'repository_snapshot.tar.gz', count: '890 dependency packages' },
      ],
    },
    {
      type: 'tables',
      totalCount: '12,000 test results',
      sources: [
        { sourceId: 'test-patterns', sourceName: 'test_suite.db', count: '12,000 pass/fail results with coverage metrics' },
      ],
    },
  ],
  userProfiles: [
    {
      id: 'system-user',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: ['Run full test suite', 'Update all dependencies'],
      isCore: true,
      outputPreferences: ['data-table', 'action-list', 'code-snippet'],
      interactionContext: 'Manages build infrastructure and deployment automation',
    },
    {
      id: 'tech-lead',
      category: 'Business User/Tech Lead',
      proficiency: 'high',
      exampleQuestions: ['Show code quality trends', 'What modules have high test coverage?'],
      isCore: true,
      outputPreferences: ['summary-report', 'comparison', 'code-snippet'],
      interactionContext: 'Reviews code quality and makes architectural decisions',
    },
    {
      id: 'junior-dev',
      category: 'End User/Junior Dev',
      proficiency: 'low',
      exampleQuestions: ['How do I run tests?', 'What does this function do?'],
      isCore: true,
      outputPreferences: ['step-by-step', 'detailed-explanation', 'code-snippet'],
      interactionContext: 'Learns codebase structure and development workflows',
    },
    {
      id: 'senior-developer',
      category: 'Senior Developer',
      proficiency: 'high',
      exampleQuestions: ['Suggest refactoring opportunities', 'Performance optimization ideas?'],
      isCore: false,
      outputPreferences: ['code-snippet', 'comparison', 'short-answer'],
      interactionContext: 'Conducts code reviews and identifies optimization opportunities',
    },
  ],
  summaryText: '4 sources decomposed into 4 content types: 45K source files, 2,400 doc pages, 12,890 structured entries, and 12K test results. 4 user profiles requiring 7 distinct output formats.',
}

// ─── On-Prem Secure Assistant ──────────────────────────────────────────────
// Context Definition sources:
//   classified_documents.db (Database, 780 MB, text)
//   security_policy_manual.pdf (PDF, 24 MB, text + tables)
//   compliance_rules.yaml (YAML, 4.1 MB, structured-data)
//   audit_ledger.log (Log, 2.2 GB, text)

const ONPREM_ASSISTANT_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'text-documents',
      totalCount: '4,386 text records',
      sources: [
        { sourceId: 'classified-docs', sourceName: 'classified_documents.db', count: '4,200 classified documents' },
        { sourceId: 'policy-manual', sourceName: 'security_policy_manual.pdf', count: '186 policy pages' },
      ],
    },
    {
      type: 'tables',
      totalCount: '42 tables',
      sources: [
        { sourceId: 'policy-manual', sourceName: 'security_policy_manual.pdf', count: '28 compliance matrices' },
        { sourceId: 'classified-docs', sourceName: 'classified_documents.db', count: '14 embedded data tables' },
      ],
    },
    {
      type: 'images',
      totalCount: '12 diagrams',
      sources: [
        { sourceId: 'policy-manual', sourceName: 'security_policy_manual.pdf', count: '12 network topology and classification flowcharts' },
      ],
      processingNote: 'Diagrams processed locally; no external API calls per air-gap requirements',
    },
    {
      type: 'structured-data',
      totalCount: '892,585 structured entries',
      sources: [
        { sourceId: 'audit-ledger', sourceName: 'audit_ledger.log', count: '890,000 parsed log entries (15 fields each)' },
        { sourceId: 'compliance-rules', sourceName: 'compliance_rules.yaml', count: '245 rule definitions' },
        { sourceId: 'classified-docs', sourceName: 'classified_documents.db', count: '2,340 classification metadata records' },
      ],
      processingNote: 'Audit log entries parsed into structured fields: timestamp, user, action, clearance, resource, outcome',
    },
  ],
  userProfiles: [
    {
      id: 'security-admin',
      category: 'System User/Security Admin',
      proficiency: 'high',
      exampleQuestions: ['Audit access logs', 'Validate classification compliance'],
      isCore: true,
      outputPreferences: ['data-table', 'action-list'],
      interactionContext: 'Manages access controls and security compliance',
    },
    {
      id: 'analyst',
      category: 'Business User/Analyst',
      proficiency: 'medium',
      exampleQuestions: ['Show documents classified as secret', 'What policies apply here?'],
      isCore: true,
      outputPreferences: ['summary-report', 'detailed-explanation'],
      interactionContext: 'Reviews classified information within security clearance',
    },
    {
      id: 'cleared-personnel',
      category: 'End User/Cleared Personnel',
      proficiency: 'medium',
      exampleQuestions: ['Find documents on Project X', 'What are my access permissions?'],
      isCore: true,
      outputPreferences: ['short-answer', 'step-by-step'],
      interactionContext: 'Accesses documents matching their security clearance',
    },
  ],
  summaryText: '4 sources decomposed into 4 content types: 4,386 text records, 42 tables, 12 diagrams, and 892K structured entries. 3 user profiles requiring 6 distinct output formats.',
}

// ─── Multimodal Assistant ──────────────────────────────────────────────────
// Context Definition sources:
//   video_library.tar.gz (Archive, 4.8 GB, text)
//   images_and_diagrams/ (Directory, 890 MB, text)
//   audio_transcripts.db (Database, 12 MB, text)
//   media_metadata.json (JSON, 5.4 MB, structured-data)

const MULTIMODAL_AGENT_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'text-documents',
      totalCount: '4,090 text entries',
      sources: [
        { sourceId: 'audio-transcripts', sourceName: 'audio_transcripts.db', count: '3,200 transcription records' },
        { sourceId: 'video-library', sourceName: 'video_library.tar.gz', count: '890 video descriptions and captions' },
      ],
    },
    {
      type: 'images',
      totalCount: '8,400 visual assets',
      sources: [
        { sourceId: 'image-dataset', sourceName: 'images_and_diagrams/', count: '6,200 images and diagrams' },
        { sourceId: 'video-library', sourceName: 'video_library.tar.gz', count: '2,200 extracted keyframes' },
      ],
      processingNote: 'Images embedded as feature vectors for visual similarity search',
    },
    {
      type: 'audio',
      totalCount: '3,200 audio tracks',
      sources: [
        { sourceId: 'video-library', sourceName: 'video_library.tar.gz', count: '890 extracted audio tracks' },
        { sourceId: 'audio-transcripts', sourceName: 'audio_transcripts.db', count: '2,310 standalone audio recordings' },
      ],
    },
    {
      type: 'structured-data',
      totalCount: '890,000 indexed entries',
      sources: [
        { sourceId: 'metadata-index', sourceName: 'media_metadata.json', count: '8,400 asset metadata records' },
        { sourceId: 'video-library', sourceName: 'video_library.tar.gz', count: '890,000 feature vectors' },
      ],
      processingNote: 'Feature vectors enable cross-modal search: find images similar to a text query',
    },
    {
      type: 'tables',
      totalCount: '890 course records',
      sources: [
        { sourceId: 'metadata-index', sourceName: 'media_metadata.json', count: '890 course-to-media mapping tables' },
      ],
    },
  ],
  userProfiles: [
    {
      id: 'system-user',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: ['Regenerate feature embeddings', 'Index new media batch'],
      isCore: true,
      outputPreferences: ['data-table', 'action-list'],
      interactionContext: 'Manages media processing and embedding generation',
    },
    {
      id: 'content-manager',
      category: 'Business User/Content Manager',
      proficiency: 'medium',
      exampleQuestions: ['Show popular content by topic', 'Which courses need updates?'],
      isCore: true,
      outputPreferences: ['summary-report', 'visual-chart', 'comparison'],
      interactionContext: 'Organizes content and tracks engagement metrics',
    },
    {
      id: 'student',
      category: 'End User/Student',
      proficiency: 'low',
      exampleQuestions: ['Find videos about Python', 'What should I learn next?'],
      isCore: true,
      outputPreferences: ['short-answer', 'step-by-step', 'detailed-explanation'],
      interactionContext: 'Discovers and accesses learning materials',
    },
    {
      id: 'instructor',
      category: 'Instructor',
      proficiency: 'medium',
      exampleQuestions: ['Track student progress', 'Show engagement patterns'],
      isCore: false,
      outputPreferences: ['data-table', 'comparison', 'visual-chart'],
      interactionContext: 'Monitors student learning and creates course content',
    },
  ],
  summaryText: '4 sources decomposed into 5 content types: 4,090 text entries, 8,400 visual assets, 3,200 audio tracks, 890K indexed entries, and 890 course records. 4 user profiles requiring 8 distinct output formats.',
}

// ─── High-Scale Consumer Chat ──────────────────────────────────────────────
// Context Definition sources:
//   user_profiles.db (Database, 3.2 GB, text)
//   preference_vectors.bin (Binary, 1.8 GB, text)
//   faq_catalog.json (JSON, 78 MB, structured-data)
//   conversation_history.db (Database, 12 GB, text)

const CONSUMER_CHAT_DIMENSIONS: ContextDimensionsPayload = {
  dimensions: [
    {
      type: 'text-documents',
      totalCount: '2.4M text records',
      sources: [
        { sourceId: 'user-profiles', sourceName: 'user_profiles.db', count: '2,400,000 user profile descriptions' },
        { sourceId: 'faq-catalog', sourceName: 'faq_catalog.json', count: '45,000 product descriptions' },
      ],
    },
    {
      type: 'structured-data',
      totalCount: '2.45M structured records',
      sources: [
        { sourceId: 'user-profiles', sourceName: 'user_profiles.db', count: '2,400,000 behavioral preference records' },
        { sourceId: 'faq-catalog', sourceName: 'faq_catalog.json', count: '45,000 product attribute schemas' },
        { sourceId: 'preference-vectors', sourceName: 'preference_vectors.bin', count: '2,400,000 recommendation vectors' },
      ],
      processingNote: 'Preference vectors enable real-time personalized recommendations at scale',
    },
    {
      type: 'tables',
      totalCount: '14.4M conversation records',
      sources: [
        { sourceId: 'conversation-history', sourceName: 'conversation_history.db', count: '14,400,000 historical conversation turns' },
      ],
    },
    {
      type: 'images',
      totalCount: '45,000 product images',
      sources: [
        { sourceId: 'faq-catalog', sourceName: 'faq_catalog.json', count: '45,000 linked product images' },
      ],
      processingNote: 'Product images indexed for visual search and recommendation cards',
    },
  ],
  userProfiles: [
    {
      id: 'system-user',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: ['Scale to 10M queries', 'Optimize cache hit rate'],
      isCore: true,
      outputPreferences: ['data-table', 'action-list', 'visual-chart'],
      interactionContext: 'Manages infrastructure and real-time performance',
    },
    {
      id: 'product-manager',
      category: 'Business User/Product Manager',
      proficiency: 'medium',
      exampleQuestions: ['Show conversion rate by product', 'Which items are trending?'],
      isCore: true,
      outputPreferences: ['summary-report', 'visual-chart'],
      interactionContext: 'Analyzes user behavior and product performance',
    },
    {
      id: 'shopper',
      category: 'End User/Shopper',
      proficiency: 'low',
      exampleQuestions: ['Find blue running shoes', 'What else goes with this item?'],
      isCore: true,
      outputPreferences: ['short-answer', 'comparison'],
      interactionContext: 'Browses products and gets shopping recommendations',
    },
  ],
  summaryText: '4 sources decomposed into 4 content types: 2.4M text records, 2.45M structured records, 14.4M conversation rows, and 45K product images. 3 user profiles requiring 6 distinct output formats.',
}

// ─── Tile-to-Data Lookup ──────────────────────────────────────────────────

const DIMENSIONS_DATA: Record<string, ContextDimensionsPayload> = {
  'faq-knowledge': FAQ_DIMENSIONS,
  'doc-intelligence': DOC_DIMENSIONS,
  'research-comparison': RESEARCH_DIMENSIONS,
  'decision-workflow': DECISION_DIMENSIONS,
  'saas-copilot': SAAS_COPILOT_DIMENSIONS,
  'ops-agent': OPS_AGENT_DIMENSIONS,
  'coding-agent': CODING_AGENT_DIMENSIONS,
  'onprem-assistant': ONPREM_ASSISTANT_DIMENSIONS,
  'multimodal-agent': MULTIMODAL_AGENT_DIMENSIONS,
  'consumer-chat': CONSUMER_CHAT_DIMENSIONS,
}

export function getContextDimensionsData(tileId: string): ContextDimensionsPayload | null {
  return DIMENSIONS_DATA[tileId] ?? null
}
