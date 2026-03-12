import type {
  InstructionStep,
  DataSource,
  UserProfile,
  AgentTool,
  AgentTask,
} from '@/store/agentTypes'
import { getInstructionData } from './instructionData'

// ─── Context Definition Payload ────────────────────────────────────────
// Combines instructions (from instructionData.ts), business/technical summaries,
// data sources, user profiles, tools, and tasks for Step 2 of the agent playground.

export interface ContextDefinitionPayload {
  instructions: InstructionStep[]
  businessSummary: string
  technicalSummary: string
  dataSources: DataSource[]
  userProfiles: UserProfile[]
  tools: AgentTool[]
  tasks: AgentTask[]
}

// ─── FAQ / Knowledge Agent ─────────────────────────────────────────────

const FAQ_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('faq-knowledge')?.steps || [],
  businessSummary:
    'Eight steps covering intake, retrieval, answer generation, and closure. Designed to resolve ~85% of queries autonomously — the agent only escalates when confidence drops below 80% or the topic is flagged as sensitive. Target: median response time under 2 seconds.',
  technicalSummary:
    'Instruction graph with single-hop retrieval, cosine similarity ranking, and a confidence threshold gate at step 4. Step 7 loops back to step 1 for follow-ups (not a DAG — intentional cycle with session TTL guard). Estimated p95 latency: 1.8s for single-turn, 3.2s with follow-up loop.',
  dataSources: [
    {
      id: 'knowledge-base-json',
      name: 'knowledge_base.json',
      format: 'JSON',
      size: '2.4 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'faq-entries-csv',
      name: 'faq_entries.csv',
      format: 'CSV',
      size: '890 KB',
      contentTypes: ['tables'],
    },
    {
      id: 'product-docs-pdf',
      name: 'product_docs.pdf',
      format: 'PDF',
      size: '12 MB',
      contentTypes: ['text', 'tables'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'system-user',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: [
        'Batch process 500 FAQ queries',
        'Reset embedding index',
        'Monitor response latency SLA',
      ],
      isCore: true,
    },
    {
      id: 'business-user',
      category: 'Business User',
      proficiency: 'medium',
      exampleQuestions: [
        'What percentage of queries resolved autonomously?',
        'Which product topics get most escalations?',
        'How do we improve answer coverage?',
      ],
      isCore: true,
    },
    {
      id: 'end-user',
      category: 'End User',
      proficiency: 'low',
      exampleQuestions: [
        'How do I reset my password?',
        'What are your refund policies?',
        'Do you offer enterprise support?',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'moderator',
      category: 'Moderator',
      proficiency: 'medium',
      exampleQuestions: [
        'Flag inappropriate content for removal',
        'Review escalated edge-case queries',
        'Approve new FAQ entries',
      ],
      isCore: false,
    },
    {
      id: 'content-author',
      category: 'Content Author',
      proficiency: 'medium',
      exampleQuestions: [
        'Create new FAQ entries for trending topics',
        'Update outdated product documentation',
        'Identify coverage gaps from escalation logs',
      ],
      isCore: false,
    },
    {
      id: 'support-agent',
      category: 'Support Agent',
      proficiency: 'high',
      exampleQuestions: [
        'Review and improve low-confidence responses',
        'Manually handle complex escalations',
        'Train the intent classifier on edge cases',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool',
      name: 'LLM',
      description: 'Large language model for response generation and ranking',
      status: 'active',
      autoDetected: true,
      accesses: ['knowledge_base.json', 'faq_entries.csv'],
    },
    {
      id: 'kb-search',
      name: 'Knowledge Base Search',
      description: 'Semantic and BM25 search across FAQ entries and product docs',
      status: 'active',
      autoDetected: true,
      accesses: ['knowledge_base.json', 'faq_entries.csv', 'product_docs.pdf'],
    },
    {
      id: 'intent-classifier',
      name: 'Intent Classifier',
      description: 'Classifies customer intent to route to correct knowledge domain',
      status: 'active',
      autoDetected: true,
      accesses: ['faq_entries.csv'],
    },
    {
      id: 'ticket-router',
      name: 'Ticket Router',
      description: 'Routes unanswerable queries to support agents',
      status: 'active',
      autoDetected: true,
      accesses: ['faq_entries.csv'],
    },
  ],
  tasks: [
    {
      id: 'answer-questions',
      label: 'Answer Customer Questions',
      description: 'Retrieve and provide accurate answers from knowledge base',
      systemSuggested: true,
      triggeredBy: 'User submits a question',
    },
    {
      id: 'route-unanswerable',
      label: 'Route Unanswerable Queries',
      description: 'Escalate low-confidence or out-of-scope questions to human agents',
      systemSuggested: true,
      triggeredBy: 'Confidence score drops below 80%',
    },
    {
      id: 'track-resolution',
      label: 'Track Resolution Rate',
      description:
        'Monitor autonomous resolution rate and identify topics for coverage improvement',
      systemSuggested: true,
      triggeredBy: 'Each completed interaction',
    },
  ],
}

// ─── Document Intelligence Agent ──────────────────────────────────────

const DOC_INTELLIGENCE_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('doc-intelligence')?.steps || [],
  businessSummary:
    'Eight steps covering document intake, classification, extraction, cross-referencing, and risk flagging. Handles 14 document types across 6 risk categories. Standard contracts (< $50K, no flags) auto-file in ~4 seconds. Non-standard clauses and high-value documents route for human review.',
  technicalSummary:
    'Instruction graph with two parallel branches: extraction pipeline and classification pipeline, merging at step 5 for cross-reference validation. Uses layout-aware parsing for tables and OCR for scanned inputs. 47 risk rules evaluated per document. Estimated p95 latency: 4.2s per document, 8.1s with cross-reference.',
  dataSources: [
    {
      id: 'aws-invoice',
      name: 'AWS_Invoice_Jan.pdf',
      format: 'PDF',
      size: '3.2 MB',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'gcp-invoice',
      name: 'GCP_Invoice_Jan.pdf',
      format: 'PDF',
      size: '2.8 MB',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'azure-invoice',
      name: 'Azure_Invoice_Jan.pdf',
      format: 'PDF',
      size: '4.1 MB',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'invoice-template',
      name: 'Invoice_Template.xlsx',
      format: 'XLSX',
      size: '450 KB',
      contentTypes: ['tables'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'system-user-doc',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: [
        'Process batch of 100 invoices',
        'Validate OCR extraction accuracy',
        'Update risk rule thresholds',
      ],
      isCore: true,
    },
    {
      id: 'business-user-doc',
      category: 'Business User',
      proficiency: 'medium',
      exampleQuestions: [
        'What is our total vendor spend this month?',
        'Which contracts have missing clauses?',
        'Compare pricing across 3 cloud providers',
      ],
      isCore: true,
    },
    {
      id: 'end-user-doc',
      category: 'End User',
      proficiency: 'low',
      exampleQuestions: [
        'Upload and process a new contract',
        'View extraction summary',
        'Request manual review',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'auditor',
      category: 'Auditor',
      proficiency: 'high',
      exampleQuestions: [
        'Validate all extracted terms against policies',
        'Review high-risk flags for accuracy',
        'Generate audit trail for compliance',
      ],
      isCore: false,
    },
    {
      id: 'analyst',
      category: 'Analyst',
      proficiency: 'medium',
      exampleQuestions: [
        'Build cost comparison matrix across vendors',
        'Identify missing data in extractions',
        'Track invoice payment status',
      ],
      isCore: false,
    },
    {
      id: 'procurement',
      category: 'Procurement/Vendor Manager',
      proficiency: 'medium',
      exampleQuestions: [
        'Check if contract renewal is upcoming',
        'Find all agreements with a specific vendor',
        'Compare terms across similar contracts',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool-doc',
      name: 'LLM',
      description: 'Summarization, classification, and risk assessment',
      status: 'active',
      autoDetected: true,
      accesses: ['AWS_Invoice_Jan.pdf', 'GCP_Invoice_Jan.pdf', 'Azure_Invoice_Jan.pdf'],
    },
    {
      id: 'pdf-opener',
      name: 'PDF Opener',
      description: 'Parse and extract text from PDF documents',
      status: 'active',
      autoDetected: true,
      accesses: ['AWS_Invoice_Jan.pdf', 'GCP_Invoice_Jan.pdf', 'Azure_Invoice_Jan.pdf'],
    },
    {
      id: 'ocr-tool',
      name: 'OCR',
      description: 'Optical character recognition for scanned documents',
      status: 'active',
      autoDetected: true,
      accesses: ['AWS_Invoice_Jan.pdf', 'GCP_Invoice_Jan.pdf', 'Azure_Invoice_Jan.pdf'],
    },
    {
      id: 'table-extraction',
      name: 'Table Extraction',
      description: 'Extract structured data from tables and grids',
      status: 'active',
      autoDetected: true,
      accesses: ['AWS_Invoice_Jan.pdf', 'Invoice_Template.xlsx'],
    },
    {
      id: 'data-connectors',
      name: 'Data Connectors',
      description: 'Integration with vendor APIs and contract repositories',
      status: 'active',
      autoDetected: true,
      accesses: ['Invoice_Template.xlsx'],
    },
  ],
  tasks: [
    {
      id: 'report-generation',
      label: 'Report Generation',
      description: 'Generate executive summaries and audit reports from extracted data',
      systemSuggested: true,
      triggeredBy: 'Document processing completes',
    },
    {
      id: 'invoice-comparison',
      label: 'Invoice Comparison',
      description: 'Compare pricing, terms, and charges across multiple invoices',
      systemSuggested: true,
      triggeredBy: 'Multiple invoices from same vendor detected',
    },
    {
      id: 'cost-analysis',
      label: 'Cost Analysis',
      description: 'Analyze spending trends and identify cost optimization opportunities',
      systemSuggested: true,
      triggeredBy: 'User requests cost breakdown',
    },
  ],
}

// ─── Research & Comparison Agent ───────────────────────────────────────

const RESEARCH_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('research-comparison')?.steps || [],
  businessSummary:
    'Eight steps covering research scoping, multi-source search, evidence collection, comparison matrix generation, and recommendation synthesis. Searches ~2,400 vendor records + web sources in parallel. All final recommendations require human approval — no autonomous distribution of research outputs.',
  technicalSummary:
    'Instruction graph with parallel search branches, evidence aggregation, and a synthesis step producing a scored comparison matrix. Iterative refinement loop at step 4 (max 3 rounds, guarded). Sensitivity analysis on final ranking. Estimated p95 latency: 12s single-pass, 28s with full refinement.',
  dataSources: [
    {
      id: 'research-papers-db',
      name: 'research_papers.db',
      format: 'Database',
      size: '180 MB',
      contentTypes: ['text'],
    },
    {
      id: 'citations-index',
      name: 'citations_index.json',
      format: 'JSON',
      size: '45 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'abstracts-csv',
      name: 'abstracts.csv',
      format: 'CSV',
      size: '22 MB',
      contentTypes: ['tables'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'system-user-research',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: [
        'Batch process 50 research queries',
        'Update citation index',
        'Validate search result quality metrics',
      ],
      isCore: true,
    },
    {
      id: 'business-user-research',
      category: 'Business User',
      proficiency: 'medium',
      exampleQuestions: [
        'What are the top 5 solutions in this category?',
        'How do prices compare across vendors?',
        'What features matter most to our customers?',
      ],
      isCore: true,
    },
    {
      id: 'end-user-research',
      category: 'End User',
      proficiency: 'low',
      exampleQuestions: [
        'Find the best option for my use case',
        'Compare these three vendors',
        'What are common customer complaints?',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'academic',
      category: 'Academic',
      proficiency: 'high',
      exampleQuestions: [
        'Find papers citing a specific work',
        'Identify research gaps in this field',
        'Generate literature review',
      ],
      isCore: false,
    },
    {
      id: 'policy-maker',
      category: 'Policy Maker',
      proficiency: 'medium',
      exampleQuestions: [
        'What does recent research show about this topic?',
        'Summarize evidence for a policy decision',
        'Find conflicting viewpoints with sources',
      ],
      isCore: false,
    },
    {
      id: 'journalist',
      category: 'Journalist',
      proficiency: 'low',
      exampleQuestions: [
        'Find credible sources on this story',
        'Identify expert viewpoints',
        'Get links to original research',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool-research',
      name: 'LLM',
      description: 'Synthesis of research findings and narrative generation',
      status: 'active',
      autoDetected: true,
      accesses: ['research_papers.db', 'abstracts.csv'],
    },
    {
      id: 'semantic-search',
      name: 'Semantic Search',
      description: 'Find papers and citations by semantic similarity',
      status: 'active',
      autoDetected: true,
      accesses: ['research_papers.db', 'citations_index.json'],
    },
    {
      id: 'citation-resolver',
      name: 'Citation Resolver',
      description: 'Trace citations and identify related works',
      status: 'active',
      autoDetected: true,
      accesses: ['citations_index.json'],
    },
    {
      id: 'data-aggregator',
      name: 'Data Aggregator',
      description: 'Collect and normalize data from multiple research sources',
      status: 'active',
      autoDetected: true,
      accesses: ['abstracts.csv', 'research_papers.db'],
    },
  ],
  tasks: [
    {
      id: 'literature-review',
      label: 'Literature Review',
      description: 'Compile comprehensive overview of published research on a topic',
      systemSuggested: true,
      triggeredBy: 'User submits research query',
    },
    {
      id: 'trend-analysis',
      label: 'Trend Analysis',
      description: 'Identify emerging patterns and shifts in research focus',
      systemSuggested: true,
      triggeredBy: 'Literature review completes',
    },
    {
      id: 'citation-mapping',
      label: 'Citation Mapping',
      description: 'Create visual maps showing relationships between works',
      systemSuggested: true,
      triggeredBy: 'Sources gathered and verified',
    },
  ],
}

// ─── Dental Practice Agent ────────────────────────────────────────────

const DENTAL_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('decision-workflow')?.steps || [],
  businessSummary:
    'Eight steps covering patient inquiry intake, clinical triage, appointment and insurance workflows, treatment plan queries, and emergency routing. Handles scheduling and insurance lookups autonomously (~62% of inquiries). Clinical questions always route to staff — zero autonomous clinical decisions. Emergency classification in < 5 seconds.',
  technicalSummary:
    'Multi-branch instruction graph with clinical decision paths, HIPAA-compliant data handling (AES-256 at rest, TLS 1.3 in transit), and mandatory escalation for clinical judgment calls. Three parallel execution lanes: administrative (autonomous), clinical-adjacent (supervised), clinical (escalation-only). All PHI access logged to immutable audit trail. Estimated p95 latency: 2.1s admin, 8.5s clinical-adjacent.',
  dataSources: [
    {
      id: 'patient-records',
      name: 'patient_records.db',
      format: 'Database',
      size: '95 MB',
      contentTypes: ['text'],
    },
    {
      id: 'insurance-plans',
      name: 'insurance_plans.pdf',
      format: 'PDF',
      size: '8.5 MB',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'treatment-codes',
      name: 'treatment_codes.csv',
      format: 'CSV',
      size: '1.2 MB',
      contentTypes: ['tables'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'patient-user',
      category: 'Patient',
      proficiency: 'low',
      exampleQuestions: [
        'What time are your open appointments?',
        'Does my insurance cover this procedure?',
        'What do I need to bring to my visit?',
      ],
      isCore: true,
    },
    {
      id: 'office-staff',
      category: 'Office Staff',
      proficiency: 'medium',
      exampleQuestions: [
        'Review and approve patient responses before sending',
        'Handle complex insurance pre-auth requests',
        'Manage appointment calendar and confirmations',
      ],
      isCore: true,
    },
    {
      id: 'system-user-dental',
      category: 'System User',
      proficiency: 'high',
      exampleQuestions: [
        'Update emergency escalation rules',
        'Monitor HIPAA audit logs',
        'Recalibrate intent classification thresholds',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'insurance-coordinator',
      category: 'Insurance Coordinator',
      proficiency: 'high',
      exampleQuestions: [
        'Verify patient coverage before appointment',
        'Submit pre-authorization requests',
        'Dispute denied claims',
      ],
      isCore: false,
    },
    {
      id: 'dentist',
      category: 'Dentist/Provider',
      proficiency: 'high',
      exampleQuestions: [
        'Review clinical escalations from the agent',
        'Approve treatment plans from the agent',
        'Access patient medical history',
      ],
      isCore: false,
    },
    {
      id: 'clinical-staff',
      category: 'Clinical Staff',
      proficiency: 'medium',
      exampleQuestions: [
        'Handle post-operative follow-up calls',
        'Answer questions about recovery instructions',
        'Triage emergency symptoms',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool-dental',
      name: 'LLM',
      description: 'Intent classification, response generation, triage',
      status: 'active',
      autoDetected: true,
      accesses: ['patient_records.db', 'treatment_codes.csv'],
    },
    {
      id: 'ehr-connector',
      name: 'EHR Connector',
      description: 'Access patient records, treatment history, and clinical notes',
      status: 'active',
      autoDetected: true,
      accesses: ['patient_records.db'],
    },
    {
      id: 'insurance-lookup',
      name: 'Insurance Lookup',
      description: 'Real-time eligibility checks and coverage verification',
      status: 'active',
      autoDetected: true,
      accesses: ['insurance_plans.pdf'],
    },
    {
      id: 'appointment-scheduler',
      name: 'Appointment Scheduler',
      description: 'Check availability, book, reschedule, and send reminders',
      status: 'active',
      autoDetected: true,
      accesses: ['patient_records.db'],
    },
  ],
  tasks: [
    {
      id: 'answer-patient-questions',
      label: 'Answer Patient Questions',
      description: 'Respond to routine administrative and appointment inquiries',
      systemSuggested: true,
      triggeredBy: 'Patient submits inquiry',
    },
    {
      id: 'check-insurance',
      label: 'Check Insurance Coverage',
      description: 'Verify patient benefits and provide cost estimates',
      systemSuggested: true,
      triggeredBy: 'Treatment recommendation generated',
    },
    {
      id: 'schedule-appointments',
      label: 'Schedule Appointments',
      description: 'Book, confirm, and manage appointment reservations',
      systemSuggested: true,
      triggeredBy: 'Patient requests scheduling',
    },
  ],
}

// ─── SaaS Copilot Agent ───────────────────────────────────────────────

const SAAS_COPILOT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('saas-copilot')?.steps || [],
  businessSummary:
    'Eight steps covering intent parsing, tool selection, action execution, confirmation gating, and logging. In-app assistant that creates records, runs reports, and updates settings. ~78% of actions execute autonomously with confirmation; high-impact changes (bulk updates, deletions) require explicit user approval. Target: action completion in ~2 seconds.',
  technicalSummary:
    'Instruction graph with tool-calling pipeline and two-tier confirmation gates: auto-confirm for safe actions (< impact threshold), explicit confirmation for sensitive operations. Action logging to immutable audit trail. Estimated p95 latency: 1.9s for simple create, 4.2s for complex report generation.',
  dataSources: [
    {
      id: 'app-schema',
      name: 'saas_schema.json',
      format: 'JSON',
      size: '3.1 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'user-workflows',
      name: 'workflow_definitions.yaml',
      format: 'YAML',
      size: '1.8 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'tool-definitions',
      name: 'tool_catalog.db',
      format: 'Database',
      size: '2.4 MB',
      contentTypes: ['text'],
    },
    {
      id: 'action-history',
      name: 'action_history.csv',
      format: 'CSV',
      size: '5.2 MB',
      contentTypes: ['tables'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'saas-end-user',
      category: 'End User',
      proficiency: 'low',
      exampleQuestions: [
        'Create a new customer record',
        'Generate a monthly sales report',
        'Update my profile settings',
      ],
      isCore: true,
    },
    {
      id: 'saas-power-user',
      category: 'Power User',
      proficiency: 'high',
      exampleQuestions: [
        'Bulk create 500 leads from CSV',
        'Configure custom report templates',
        'Set up automated workflows',
      ],
      isCore: true,
    },
    {
      id: 'saas-system-admin',
      category: 'System Administrator',
      proficiency: 'high',
      exampleQuestions: [
        'Monitor tool execution logs',
        'Update tool confirmation thresholds',
        'Audit user actions by date range',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'sales-rep',
      category: 'Sales Representative',
      proficiency: 'medium',
      exampleQuestions: [
        'Log a deal and create opportunity',
        'Generate pipeline forecast report',
        'Update deal stage and probability',
      ],
      isCore: false,
    },
    {
      id: 'analytics-user',
      category: 'Analytics User',
      proficiency: 'medium',
      exampleQuestions: [
        'Build custom dashboard',
        'Export data for analysis',
        'Create recurring report schedule',
      ],
      isCore: false,
    },
    {
      id: 'integration-specialist',
      category: 'Integration Specialist',
      proficiency: 'high',
      exampleQuestions: [
        'Test webhook configurations',
        'Map fields across systems',
        'Validate data transformation logic',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool-saas',
      name: 'LLM',
      description: 'Intent parsing and natural language to tool mapping',
      status: 'active',
      autoDetected: true,
      accesses: ['saas_schema.json', 'workflow_definitions.yaml'],
    },
    {
      id: 'record-manager',
      name: 'Record Manager',
      description: 'Create, read, update records in the database',
      status: 'active',
      autoDetected: true,
      accesses: ['saas_schema.json', 'action_history.csv'],
    },
    {
      id: 'report-generator',
      name: 'Report Generator',
      description: 'Execute queries and generate custom reports',
      status: 'active',
      autoDetected: true,
      accesses: ['action_history.csv', 'tool_catalog.db'],
    },
    {
      id: 'settings-manager',
      name: 'Settings Manager',
      description: 'Modify user and system configurations',
      status: 'active',
      autoDetected: true,
      accesses: ['saas_schema.json', 'workflow_definitions.yaml'],
    },
  ],
  tasks: [
    {
      id: 'create-record',
      label: 'Create Records',
      description: 'Create new customer, lead, opportunity, or other entity records',
      systemSuggested: true,
      triggeredBy: 'User initiates new record',
    },
    {
      id: 'generate-report',
      label: 'Generate Reports',
      description: 'Run queries and produce formatted reports on demand',
      systemSuggested: true,
      triggeredBy: 'User requests final output',
    },
    {
      id: 'update-settings',
      label: 'Update Settings',
      description: 'Modify user preferences, workflow configurations, and system parameters',
      systemSuggested: true,
      triggeredBy: 'User modifies configuration',
    },
  ],
}

// ─── Ops Agent ────────────────────────────────────────────────────────

const OPS_AGENT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('ops-agent')?.steps || [],
  businessSummary:
    'Eight steps covering job intake, scheduling, execution orchestration, progress tracking, error handling, and completion reporting. Manages batch processing, data migrations, and scheduled reports as long-running async tasks. Jobs monitored continuously; failures trigger automated retry or escalation. SLA: 95th percentile completion within 4 hours for standard migrations.',
  technicalSummary:
    'Instruction graph with async job orchestration, state machine tracking (pending, running, failed, retry, completed), and dead-letter queue for unrecoverable errors. Checkpoint/resume capability for long migrations. Health checks every 30s, exponential backoff on retries. Estimated p95 latency: 18 seconds for job initiation, 2-4 hours for typical data migration.',
  dataSources: [
    {
      id: 'job-queue',
      name: 'job_queue.db',
      format: 'Database',
      size: '12 MB',
      contentTypes: ['text'],
    },
    {
      id: 'migration-schemas',
      name: 'migration_schemas.yaml',
      format: 'YAML',
      size: '3.4 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'historical-logs',
      name: 'job_execution_logs.tar.gz',
      format: 'Archive',
      size: '340 MB',
      contentTypes: ['text'],
    },
    {
      id: 'config-templates',
      name: 'job_templates.json',
      format: 'JSON',
      size: '2.1 MB',
      contentTypes: ['structured-data'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'devops-engineer',
      category: 'DevOps Engineer',
      proficiency: 'high',
      exampleQuestions: [
        'Schedule data migration from Oracle to Postgres',
        'Monitor job execution and retry failed batches',
        'Update migration schema mappings',
      ],
      isCore: true,
    },
    {
      id: 'data-engineer',
      category: 'Data Engineer',
      proficiency: 'high',
      exampleQuestions: [
        'Define ETL pipeline and validation rules',
        'Analyze data quality metrics',
        'Optimize chunk size for large tables',
      ],
      isCore: true,
    },
    {
      id: 'ops-manager',
      category: 'Operations Manager',
      proficiency: 'medium',
      exampleQuestions: [
        'View job status dashboard',
        'Get alerts on failed migrations',
        'Review execution time trends',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'database-admin',
      category: 'Database Administrator',
      proficiency: 'high',
      exampleQuestions: [
        'Validate migration checkpoints',
        'Rollback incomplete migrations',
        'Monitor database resource usage during job',
      ],
      isCore: false,
    },
    {
      id: 'product-manager',
      category: 'Product Manager',
      proficiency: 'low',
      exampleQuestions: [
        'When will this migration complete?',
        'What is the data quality score?',
        'Are there any blocking errors?',
      ],
      isCore: false,
    },
    {
      id: 'infrastructure-tech',
      category: 'Infrastructure Technician',
      proficiency: 'medium',
      exampleQuestions: [
        'Allocate additional compute for this job',
        'Check resource utilization metrics',
        'Review infrastructure health during migration',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool-ops',
      name: 'LLM',
      description: 'Job specification parsing and error diagnosis',
      status: 'active',
      autoDetected: true,
      accesses: ['job_queue.db', 'migration_schemas.yaml'],
    },
    {
      id: 'job-scheduler',
      name: 'Job Scheduler',
      description: 'Schedule, pause, resume, and cancel async jobs',
      status: 'active',
      autoDetected: true,
      accesses: ['job_queue.db', 'job_templates.json'],
    },
    {
      id: 'data-pipeline',
      name: 'Data Pipeline',
      description: 'Execute ETL transformations and validation checks',
      status: 'active',
      autoDetected: true,
      accesses: ['migration_schemas.yaml', 'job_queue.db'],
    },
    {
      id: 'monitoring-alerts',
      name: 'Monitoring & Alerts',
      description: 'Track job progress, health checks, and error notifications',
      status: 'active',
      autoDetected: true,
      accesses: ['job_execution_logs.tar.gz'],
    },
    {
      id: 'checkpoint-manager',
      name: 'Checkpoint Manager',
      description: 'Create and restore savepoints for long-running jobs',
      status: 'active',
      autoDetected: true,
      accesses: ['job_queue.db', 'job_execution_logs.tar.gz'],
    },
  ],
  tasks: [
    {
      id: 'schedule-migration',
      label: 'Schedule Migrations',
      description: 'Define and schedule data migration or batch processing jobs',
      systemSuggested: true,
      triggeredBy: 'Migration request submitted',
    },
    {
      id: 'monitor-execution',
      label: 'Monitor Job Execution',
      description: 'Track progress, handle failures, and manage retries',
      systemSuggested: true,
      triggeredBy: 'Job execution begins',
    },
    {
      id: 'validate-quality',
      label: 'Validate Data Quality',
      description: 'Run validation checks and report data quality metrics',
      systemSuggested: true,
      triggeredBy: 'Job execution completes',
    },
  ],
}

// ─── Coding Agent ────────────────────────────────────────────────────

const CODING_AGENT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('coding-agent')?.steps || [],
  businessSummary:
    'Eight steps covering code goal specification, context retrieval, implementation, sandbox testing, debugging, documentation, and review-cycle management. Writes, debugs, and refactors code with full codebase context. All code requires human review before merge; agent suggests tests and identifies edge cases. Target: 1st attempt success rate ~72% for well-scoped tasks.',
  technicalSummary:
    'Instruction graph with parallel execution lanes: code generation + test synthesis + documentation. Sandbox environment with 10-second execution timeout per test. Context window uses token budgeting to fit 50k LOC + tests. Estimated p95 latency: 8.3s for small function, 35s for module-level refactoring with full test suite.',
  dataSources: [
    {
      id: 'codebase-repo',
      name: 'repository_snapshot.tar.gz',
      format: 'Archive',
      size: '280 MB',
      contentTypes: ['text'],
    },
    {
      id: 'api-docs',
      name: 'api_documentation.md',
      format: 'Markdown',
      size: '8.2 MB',
      contentTypes: ['text'],
    },
    {
      id: 'test-patterns',
      name: 'test_suite.db',
      format: 'Database',
      size: '45 MB',
      contentTypes: ['text'],
    },
    {
      id: 'style-guide',
      name: 'code_style_guide.md',
      format: 'Markdown',
      size: '1.2 MB',
      contentTypes: ['text'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'software-engineer',
      category: 'Software Engineer',
      proficiency: 'high',
      exampleQuestions: [
        'Implement a new API endpoint',
        'Refactor this module for better performance',
        'Write unit tests for this function',
      ],
      isCore: true,
    },
    {
      id: 'junior-developer',
      category: 'Junior Developer',
      proficiency: 'low',
      exampleQuestions: [
        'Help me debug this error',
        'Explain this part of the code',
        'Generate boilerplate for a new component',
      ],
      isCore: true,
    },
    {
      id: 'code-reviewer',
      category: 'Code Reviewer / Tech Lead',
      proficiency: 'high',
      exampleQuestions: [
        'Review generated code for security issues',
        'Check test coverage completeness',
        'Assess architectural alignment',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'devops-engineer-code',
      category: 'DevOps Engineer',
      proficiency: 'high',
      exampleQuestions: [
        'Generate deployment scripts',
        'Write infrastructure-as-code modules',
        'Create monitoring and alerting logic',
      ],
      isCore: false,
    },
    {
      id: 'qa-engineer',
      category: 'QA Engineer',
      proficiency: 'high',
      exampleQuestions: [
        'Generate end-to-end test scenarios',
        'Identify edge cases in implementation',
        'Create integration test suite',
      ],
      isCore: false,
    },
    {
      id: 'architect',
      category: 'Solutions Architect',
      proficiency: 'high',
      exampleQuestions: [
        'Design API schema',
        'Validate architectural patterns',
        'Review system design implications',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool-code',
      name: 'LLM',
      description: 'Code generation, debugging, and architectural reasoning',
      status: 'active',
      autoDetected: true,
      accesses: ['repository_snapshot.tar.gz', 'api_documentation.md'],
    },
    {
      id: 'code-executor',
      name: 'Code Executor',
      description: 'Run code in sandboxed environment with timeout protection',
      status: 'active',
      autoDetected: true,
      accesses: ['repository_snapshot.tar.gz'],
    },
    {
      id: 'test-runner',
      name: 'Test Runner',
      description: 'Execute unit tests and generate coverage reports',
      status: 'active',
      autoDetected: true,
      accesses: ['codebase_index.json', 'test_suite.json'],
    },
    {
      id: 'context-retriever',
      name: 'Context Retriever',
      description: 'Fetch relevant code snippets and API definitions from codebase',
      status: 'active',
      autoDetected: true,
      accesses: ['api_documentation.md', 'code_style_guide.md'],
    },
    {
      id: 'documentation-gen',
      name: 'Documentation Generator',
      description: 'Auto-generate docstrings, API docs, and architecture diagrams',
      status: 'active',
      autoDetected: true,
      accesses: ['api_documentation.md'],
    },
  ],
  tasks: [
    {
      id: 'implement-feature',
      label: 'Implement Feature',
      description: 'Write code to implement a new feature or fix a bug',
      systemSuggested: true,
      triggeredBy: 'Feature request assigned',
    },
    {
      id: 'write-tests',
      label: 'Write Tests',
      description: 'Generate unit, integration, or end-to-end tests',
      systemSuggested: true,
      triggeredBy: 'Code implementation completes',
    },
    {
      id: 'debug-issue',
      label: 'Debug & Refactor',
      description: 'Analyze errors, refactor code, and optimize performance',
      systemSuggested: true,
      triggeredBy: 'Test failure or bug report filed',
    },
  ],
}

// ─── On-Prem Assistant Agent ──────────────────────────────────────────

const ONPREM_ASSISTANT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('onprem-assistant')?.steps || [],
  businessSummary:
    'Eight steps covering secure request intake, local processing, compliance validation, response generation, audit logging, and output sanitization. Air-gapped deployment with zero external API calls. All data remains within classified network perimeter. FedRAMP/ITAR compliant with mandatory encryption (AES-256 at rest, TLS 1.3 in transit) and immutable audit trails for all operations.',
  technicalSummary:
    'Instruction graph with local-only inference, data residency verification at every step, and cryptographic signing for all outputs. Network isolation enforced at kernel level. Audit logger writes to append-only ledger (cannot be modified or deleted). Estimated p95 latency: 6.8s for classification task, 22s for document summarization on local hardware.',
  dataSources: [
    {
      id: 'classified-docs',
      name: 'classified_documents.db',
      format: 'Database',
      size: '780 MB',
      contentTypes: ['text'],
    },
    {
      id: 'policy-manual',
      name: 'security_policy_manual.pdf',
      format: 'PDF',
      size: '24 MB',
      contentTypes: ['text', 'tables'],
    },
    {
      id: 'compliance-rules',
      name: 'compliance_rules.yaml',
      format: 'YAML',
      size: '4.1 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'audit-ledger',
      name: 'audit_ledger.log',
      format: 'Log',
      size: '2.2 GB',
      contentTypes: ['text'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'security-officer',
      category: 'Security Officer',
      proficiency: 'high',
      exampleQuestions: [
        'Review audit logs for today',
        'Verify data residency compliance',
        'Generate security compliance report',
      ],
      isCore: true,
    },
    {
      id: 'analyst-cleared',
      category: 'Cleared Analyst',
      proficiency: 'high',
      exampleQuestions: [
        'Classify this document by sensitivity level',
        'Summarize classified intelligence briefing',
        'Extract metadata while preserving classification',
      ],
      isCore: true,
    },
    {
      id: 'system-admin-onprem',
      category: 'System Administrator',
      proficiency: 'high',
      exampleQuestions: [
        'Monitor system resource usage',
        'Verify encryption keys are rotated',
        'Check network isolation status',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'compliance-auditor',
      category: 'Compliance Auditor',
      proficiency: 'medium',
      exampleQuestions: [
        'Generate FedRAMP compliance attestation',
        'Verify all operations are logged',
        'Audit user access by date range',
      ],
      isCore: false,
    },
    {
      id: 'intelligence-officer',
      category: 'Intelligence Officer',
      proficiency: 'high',
      exampleQuestions: [
        'Compare two classified documents',
        'Extract intelligence summary',
        'Cross-reference with previous reports',
      ],
      isCore: false,
    },
    {
      id: 'legal-counsel',
      category: 'Legal Counsel',
      proficiency: 'medium',
      exampleQuestions: [
        'Validate classification markings',
        'Review disclosure of information',
        'Generate retention schedule report',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool-onprem',
      name: 'Local LLM',
      description: 'On-premises language model with no external dependencies',
      status: 'active',
      autoDetected: true,
      accesses: ['classified_documents.db', 'security_policy_manual.pdf'],
    },
    {
      id: 'compliance-checker',
      name: 'Compliance Checker',
      description: 'Validate operations against FedRAMP/ITAR/policy rules',
      status: 'active',
      autoDetected: true,
      accesses: ['clinical_guidelines.pdf', 'procedure_codes.csv'],
    },
    {
      id: 'encryption-manager',
      name: 'Encryption Manager',
      description: 'Manage encryption keys and cryptographic signing',
      status: 'active',
      autoDetected: true,
      accesses: ['compliance_rules.yaml'],
    },
    {
      id: 'audit-logger',
      name: 'Audit Logger',
      description: 'Write immutable audit trail of all operations',
      status: 'active',
      autoDetected: true,
      accesses: ['patient_history.json'],
    },
  ],
  tasks: [
    {
      id: 'classify-document',
      label: 'Classify Documents',
      description: 'Assign classification markings and sensitivity levels',
      systemSuggested: true,
      triggeredBy: 'New document ingested',
    },
    {
      id: 'generate-report',
      label: 'Generate Reports',
      description: 'Create compliance, audit, or intelligence summary reports',
      systemSuggested: true,
      triggeredBy: 'User requests report output',
    },
    {
      id: 'verify-compliance',
      label: 'Verify Compliance',
      description: 'Check that operations meet FedRAMP, ITAR, and policy requirements',
      systemSuggested: true,
      triggeredBy: 'Document classification completes',
    },
  ],
}

// ─── Multimodal Agent ─────────────────────────────────────────────────

const MULTIMODAL_AGENT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('multimodal-agent')?.steps || [],
  businessSummary:
    'Eight steps covering multi-format intake (text, images, audio, video), modality-specific processing, cross-modal reasoning, context fusion, and multi-format output generation. Processes video lectures into transcripts + summary + visual highlights. Analyzes multi-page documents with images embedded. Generates cohesive narratives across modalities. Target: p95 transcription + summarization time 180 seconds for 30-minute video.',
  technicalSummary:
    'Instruction graph with parallel modality pipelines (text, vision, audio) merging at step 5 for cross-modal reasoning. Vision model for image understanding, speech-to-text with 95% accuracy baseline, temporal reasoning for video. Token budget: up to 80k for rich multimodal context. Estimated p95 latency: 3.2s for image captioning, 45s for video summarization, 12s for cross-modal comparison.',
  dataSources: [
    {
      id: 'video-library',
      name: 'video_library.tar.gz',
      format: 'Archive',
      size: '4.8 GB',
      contentTypes: ['text'],
    },
    {
      id: 'image-dataset',
      name: 'images_and_diagrams/',
      format: 'Directory',
      size: '890 MB',
      contentTypes: ['text'],
    },
    {
      id: 'audio-transcripts',
      name: 'audio_transcripts.db',
      format: 'Database',
      size: '12 MB',
      contentTypes: ['text'],
    },
    {
      id: 'metadata-index',
      name: 'media_metadata.json',
      format: 'JSON',
      size: '5.4 MB',
      contentTypes: ['structured-data'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'content-creator',
      category: 'Content Creator',
      proficiency: 'medium',
      exampleQuestions: [
        'Transcribe this video lecture',
        'Generate summary and key takeaways',
        'Create visual highlights from video',
      ],
      isCore: true,
    },
    {
      id: 'educator',
      category: 'Educator',
      proficiency: 'medium',
      exampleQuestions: [
        'Convert lecture into lesson plan',
        'Extract comprehension questions from video',
        'Identify key concepts across multimedia',
      ],
      isCore: true,
    },
    {
      id: 'multimedia-analyst',
      category: 'Multimedia Analyst',
      proficiency: 'high',
      exampleQuestions: [
        'Tag and categorize media by content',
        'Generate metadata for search indexing',
        'Analyze visual patterns across images',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'accessibility-specialist',
      category: 'Accessibility Specialist',
      proficiency: 'medium',
      exampleQuestions: [
        'Generate closed captions from audio',
        'Create audio descriptions for images',
        'Validate accessibility compliance',
      ],
      isCore: false,
    },
    {
      id: 'journalist',
      category: 'Journalist / Researcher',
      proficiency: 'medium',
      exampleQuestions: [
        'Extract key quotes from video',
        'Verify facts mentioned in media',
        'Create multimedia article outline',
      ],
      isCore: false,
    },
    {
      id: 'design-professional',
      category: 'Design Professional',
      proficiency: 'high',
      exampleQuestions: [
        'Extract color palettes from images',
        'Identify design patterns',
        'Generate design inspiration report',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool-multimodal',
      name: 'Multimodal LLM',
      description: 'Process and reason across text, images, audio, and video',
      status: 'active',
      autoDetected: true,
      accesses: ['video_library.tar.gz', 'images_and_diagrams/'],
    },
    {
      id: 'vision-model',
      name: 'Vision Model',
      description: 'Analyze images, diagrams, and video frames',
      status: 'active',
      autoDetected: true,
      accesses: ['product_images/', 'inspection_photos/'],
    },
    {
      id: 'speech-to-text',
      name: 'Speech-to-Text',
      description: 'Transcribe audio and video with high accuracy',
      status: 'active',
      autoDetected: true,
      accesses: ['call_recordings/'],
    },
    {
      id: 'media-processor',
      name: 'Media Processor',
      description: 'Handle video parsing, frame extraction, and temporal analysis',
      status: 'active',
      autoDetected: true,
      accesses: ['video_library.tar.gz', 'audio_transcripts.db'],
    },
    {
      id: 'output-formatter',
      name: 'Output Formatter',
      description: 'Generate summaries, transcripts, captions, and descriptions',
      status: 'active',
      autoDetected: true,
      accesses: ['media_metadata.json'],
    },
  ],
  tasks: [
    {
      id: 'transcribe-media',
      label: 'Transcribe Media',
      description: 'Convert audio and video to text transcripts',
      systemSuggested: true,
      triggeredBy: 'Audio or video file uploaded',
    },
    {
      id: 'summarize-content',
      label: 'Summarize Content',
      description: 'Generate summaries from multimodal sources with key takeaways',
      systemSuggested: true,
      triggeredBy: 'Transcription completes',
    },
    {
      id: 'cross-modal-analysis',
      label: 'Cross-Modal Analysis',
      description: 'Compare and synthesize information across text, image, and audio',
      systemSuggested: true,
      triggeredBy: 'Multiple modalities processed',
    },
  ],
}

// ─── Consumer Chat Agent ──────────────────────────────────────────────

const CONSUMER_CHAT_CONTEXT: ContextDefinitionPayload = {
  instructions: getInstructionData('consumer-chat')?.steps || [],
  businessSummary:
    'Eight steps covering intent understanding, personalization retrieval, response generation, sentiment preservation, user engagement optimization, and feedback collection. Handles millions of daily interactions at scale. Sub-second latency target with high personalization — each response tailored to user preference history. Resolution rate ~68% on first turn; follow-up loops drive it to 92% within 3 turns.',
  technicalSummary:
    'Instruction graph with caching layer for personalization vectors, response ranking by user preference, and real-time sentiment tracking. Request batching for 10k concurrent users. Custom token budget: 512 tokens max per response to ensure sub-500ms latency at p95. Response templates for high-volume queries. Estimated p95 latency: 380ms for simple query, 650ms with full personalization.',
  dataSources: [
    {
      id: 'user-profiles',
      name: 'user_profiles.db',
      format: 'Database',
      size: '3.2 GB',
      contentTypes: ['text'],
    },
    {
      id: 'preference-vectors',
      name: 'preference_vectors.bin',
      format: 'Binary',
      size: '1.8 GB',
      contentTypes: ['text'],
    },
    {
      id: 'faq-catalog',
      name: 'faq_catalog.json',
      format: 'JSON',
      size: '78 MB',
      contentTypes: ['structured-data'],
    },
    {
      id: 'conversation-history',
      name: 'conversation_history.db',
      format: 'Database',
      size: '12 GB',
      contentTypes: ['text'],
    },
  ],
  userProfiles: [
    // Core profiles
    {
      id: 'consumer-user',
      category: 'Consumer User',
      proficiency: 'low',
      exampleQuestions: [
        'Where is my order?',
        'How do I return an item?',
        'Do you have this in my size?',
      ],
      isCore: true,
    },
    {
      id: 'repeat-customer',
      category: 'Repeat Customer',
      proficiency: 'medium',
      exampleQuestions: [
        'Recommend a product like my last purchase',
        'Show me new items in my favorite category',
        'Apply my loyalty discount code',
      ],
      isCore: true,
    },
    {
      id: 'customer-service-team',
      category: 'Customer Service Team',
      proficiency: 'medium',
      exampleQuestions: [
        'Review chat session for escalation',
        'Monitor sentiment trends',
        'Override recommendation for special case',
      ],
      isCore: true,
    },
    // Domain-specific profiles
    {
      id: 'vip-customer',
      category: 'VIP / High-Value Customer',
      proficiency: 'high',
      exampleQuestions: [
        'Early access to new products',
        'Personalized product recommendations',
        'Dedicated support for orders',
      ],
      isCore: false,
    },
    {
      id: 'product-specialist',
      category: 'Product Specialist',
      proficiency: 'high',
      exampleQuestions: [
        'Detailed product comparison',
        'Technical specifications',
        'Compatibility with related products',
      ],
      isCore: false,
    },
    {
      id: 'retention-specialist',
      category: 'Retention Specialist',
      proficiency: 'medium',
      exampleQuestions: [
        'Offer retention incentive to at-risk customer',
        'Identify churn signals',
        'Generate win-back campaign message',
      ],
      isCore: false,
    },
  ],
  tools: [
    {
      id: 'llm-tool-consumer',
      name: 'LLM',
      description: 'Intent classification and natural response generation',
      status: 'active',
      autoDetected: true,
      accesses: ['user_profiles.db', 'faq_catalog.json'],
    },
    {
      id: 'personalization-engine',
      name: 'Personalization Engine',
      description: 'Retrieve user preferences and purchase history for customization',
      status: 'active',
      autoDetected: true,
      accesses: ['preference_vectors.bin', 'user_profiles.db'],
    },
    {
      id: 'order-lookup',
      name: 'Order Lookup',
      description: 'Query order status, tracking, and shipment information',
      status: 'active',
      autoDetected: true,
      accesses: ['user_profiles.db'],
    },
    {
      id: 'inventory-checker',
      name: 'Inventory Checker',
      description: 'Check product availability across regions and sizes',
      status: 'active',
      autoDetected: true,
      accesses: ['faq_catalog.json'],
    },
  ],
  tasks: [
    {
      id: 'answer-consumer-query',
      label: 'Answer Customer Question',
      description: 'Respond to common questions with personalized, friendly tone',
      systemSuggested: true,
      triggeredBy: 'User sends message',
    },
    {
      id: 'resolve-issue',
      label: 'Resolve Order Issue',
      description: 'Handle returns, refunds, shipping issues, and complaints',
      systemSuggested: true,
      triggeredBy: 'Complaint or issue detected',
    },
    {
      id: 'recommend-products',
      label: 'Recommend Products',
      description: 'Suggest products based on user history and preferences',
      systemSuggested: true,
      triggeredBy: 'User expresses purchase intent',
    },
  ],
}

// ─── Lookup Map ──────────────────────────────────────────────────────

const CONTEXT_DEFINITION_MAP: Record<string, ContextDefinitionPayload> = {
  'faq-knowledge': FAQ_CONTEXT,
  'doc-intelligence': DOC_INTELLIGENCE_CONTEXT,
  'research-comparison': RESEARCH_CONTEXT,
  'decision-workflow': DENTAL_CONTEXT,
  'saas-copilot': SAAS_COPILOT_CONTEXT,
  'ops-agent': OPS_AGENT_CONTEXT,
  'coding-agent': CODING_AGENT_CONTEXT,
  'onprem-assistant': ONPREM_ASSISTANT_CONTEXT,
  'multimodal-agent': MULTIMODAL_AGENT_CONTEXT,
  'consumer-chat': CONSUMER_CHAT_CONTEXT,
}

export function getContextDefinitionData(
  tileId: string | null
): ContextDefinitionPayload | null {
  if (!tileId) return null
  return CONTEXT_DEFINITION_MAP[tileId] ?? null
}