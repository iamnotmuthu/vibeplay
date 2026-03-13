import type { DimensionPattern } from '@/store/agentTypes'

export const OPS_AGENT_PATTERNS: DimensionPattern[] = [
  // SIMPLE PATTERNS (8)
  {
    id: 'ops-agent-pat-01',
    name: 'Job Queue Lookup',
    description: 'Direct lookup of pending jobs in the queue.',
    tier: 'simple',
    taskDimensionId: 'ops-task-job-scheduling',
    dataDimensionIds: ['ops-data-job-queue'],
    userProfileDimensionId: 'ops-up-devops-engineer',
    patternType: 'simple',
    exampleQuestions: ['What jobs are queued right now?', 'Show me pending tasks'],
    activatedComponents: ['JobQueueViewer'],
    confidence: 90
  },
  {
    id: 'ops-agent-pat-02',
    name: 'Migration Schema Retrieval',
    description: 'Fetch migration schema templates for planned migrations.',
    tier: 'simple',
    taskDimensionId: 'ops-task-migration-planning',
    dataDimensionIds: ['ops-data-migration-schemas'],
    userProfileDimensionId: 'ops-up-data-engineer',
    patternType: 'simple',
    exampleQuestions: ['What migration schemas do we have?', 'Get the PostgreSQL to Oracle schema'],
    activatedComponents: ['SchemaTemplateLibrary'],
    confidence: 90
  },
  {
    id: 'ops-agent-pat-03',
    name: 'Log Tail Stream',
    description: 'Real-time streaming of application logs for a specific service.',
    tier: 'simple',
    taskDimensionId: 'ops-task-error-triage',
    dataDimensionIds: ['ops-data-historical-logs'],
    userProfileDimensionId: 'ops-up-devops-engineer',
    patternType: 'simple',
    exampleQuestions: ['Show me the API service logs', 'What errors happened in the last hour?'],
    activatedComponents: ['LogStreamViewer', 'ErrorHighlighter'],
    confidence: 90
  },
  {
    id: 'ops-agent-pat-04',
    name: 'Template Instantiation',
    description: 'Create resource configuration from standard templates.',
    tier: 'simple',
    taskDimensionId: 'ops-task-resource-allocation',
    dataDimensionIds: ['ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-infrastructure-tech',
    patternType: 'simple',
    exampleQuestions: ['Create a new Kubernetes cluster from template', 'Spin up a standard database instance'],
    activatedComponents: ['TemplateRenderer', 'ResourceProvisioner'],
    confidence: 90
  },
  {
    id: 'ops-agent-pat-05',
    name: 'Quality Metrics Single Source',
    description: 'Pull quality metrics from a single authoritative source.',
    tier: 'simple',
    taskDimensionId: 'ops-task-data-quality-checks',
    dataDimensionIds: ['ops-data-historical-logs'],
    userProfileDimensionId: 'ops-up-product-manager',
    patternType: 'simple',
    exampleQuestions: ['What is the current test pass rate?', 'Show me code coverage metrics'],
    activatedComponents: ['MetricsBoard'],
    confidence: 90
  },
  {
    id: 'ops-agent-pat-06',
    name: 'SLA Status Direct Query',
    description: 'Check current SLA status against service level agreements.',
    tier: 'simple',
    taskDimensionId: 'ops-task-sla-tracking',
    dataDimensionIds: ['ops-data-historical-logs'],
    userProfileDimensionId: 'ops-up-ops-manager',
    patternType: 'simple',
    exampleQuestions: ['Are we meeting SLA targets?', 'What is uptime percentage this month?'],
    activatedComponents: ['SLADashboard'],
    confidence: 90
  },
  {
    id: 'ops-agent-pat-07',
    name: 'Progress Status Snapshot',
    description: 'Capture current deployment or operation progress state.',
    tier: 'simple',
    taskDimensionId: 'ops-task-progress-monitoring',
    dataDimensionIds: ['ops-data-job-queue'],
    userProfileDimensionId: 'ops-up-ops-manager',
    patternType: 'simple',
    exampleQuestions: ['What is the current deployment progress?', 'How far along is the migration?'],
    activatedComponents: ['ProgressIndicator', 'StateMonitor'],
    confidence: 90
  },
  {
    id: 'ops-agent-pat-08',
    name: 'Checkpoint Verification Single',
    description: 'Verify completion of a single operational checkpoint.',
    tier: 'simple',
    taskDimensionId: 'ops-task-checkpoint-validation',
    dataDimensionIds: ['ops-data-historical-logs'],
    userProfileDimensionId: 'ops-up-database-admin',
    patternType: 'simple',
    exampleQuestions: ['Is the backup checkpoint complete?', 'Was the schema validation passed?'],
    activatedComponents: ['CheckpointValidator'],
    confidence: 90
  },
  // COMPLEX PATTERNS (8)
  {
    id: 'ops-agent-pat-09',
    name: 'Job Dependency Graph Resolution',
    description: 'Map job dependencies across queue and migration schemas to determine execution order.',
    tier: 'complex',
    taskDimensionId: 'ops-task-job-scheduling',
    dataDimensionIds: ['ops-data-job-queue', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-devops-engineer',
    patternType: 'aggregator',
    exampleQuestions: [
      'Which jobs can run in parallel and which depend on each other?',
      'Show me the critical path for this deployment sequence'
    ],
    activatedComponents: ['DependencyGrapher', 'CriticalPathAnalyzer'],
    inferenceNotes: 'Correlates job metadata with template dependency rules',
    confidence: 72
  },
  {
    id: 'ops-agent-pat-10',
    name: 'Migration Impact Assessment',
    description: 'Cross-reference migration schemas against logs to assess potential impacts.',
    tier: 'complex',
    taskDimensionId: 'ops-task-migration-planning',
    dataDimensionIds: ['ops-data-migration-schemas', 'ops-data-historical-logs'],
    userProfileDimensionId: 'ops-up-data-engineer',
    patternType: 'hopping',
    exampleQuestions: [
      'What systems will be affected by this migration?',
      'Are there any services currently failing that would block this migration?'
    ],
    activatedComponents: ['ImpactAnalyzer', 'ServiceHealthCheck'],
    inferenceNotes: 'Links schema transformations to observed system behavior in logs',
    confidence: 72
  },
  {
    id: 'ops-agent-pat-11',
    name: 'Error Triage with Resource Context',
    description: 'Combine error logs with resource allocation data to diagnose failures.',
    tier: 'complex',
    taskDimensionId: 'ops-task-error-triage',
    dataDimensionIds: ['ops-data-historical-logs', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-devops-engineer',
    patternType: 'hopping',
    exampleQuestions: [
      'Why did the job fail? Do we have enough resources?',
      'Are these errors related to undersized containers?'
    ],
    activatedComponents: ['ErrorAnalyzer', 'ResourceAnalyzer'],
    inferenceNotes: 'Correlates error patterns with resource configuration',
    confidence: 72
  },
  {
    id: 'ops-agent-pat-12',
    name: 'Schema Validation Against Live State',
    description: 'Verify migration schemas against current database logs and state.',
    tier: 'complex',
    taskDimensionId: 'ops-task-schema-mapping',
    dataDimensionIds: ['ops-data-migration-schemas', 'ops-data-historical-logs'],
    userProfileDimensionId: 'ops-up-database-admin',
    patternType: 'aggregator',
    exampleQuestions: [
      'Are the migration schemas compatible with the current database state?',
      'What data inconsistencies exist between the schema and live data?'
    ],
    activatedComponents: ['SchemaValidator', 'DataConsistencyChecker'],
    inferenceNotes: 'Maps theoretical schema against observed data state',
    confidence: 72
  },
  {
    id: 'ops-agent-pat-13',
    name: 'Rollback Readiness Check',
    description: 'Assess rollback capability by correlating job history, templates, and current state.',
    tier: 'complex',
    taskDimensionId: 'ops-task-rollback-management',
    dataDimensionIds: ['ops-data-job-queue', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-ops-manager',
    patternType: 'aggregator',
    exampleQuestions: [
      'Can we safely rollback this deployment?',
      'What is the rollback plan for the current migration?'
    ],
    activatedComponents: ['RollbackPlanner', 'StateRecoveryAnalyzer'],
    inferenceNotes: 'Determines rollback feasibility from template definitions and job states',
    confidence: 72
  },
  {
    id: 'ops-agent-pat-14',
    name: 'Quality Trend Analysis',
    description: 'Track quality metrics over time by correlating historical logs with templates.',
    tier: 'complex',
    taskDimensionId: 'ops-task-data-quality-checks',
    dataDimensionIds: ['ops-data-historical-logs', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-product-manager',
    patternType: 'hopping',
    exampleQuestions: [
      'Is our test pass rate improving?',
      'How does coverage compare to our quality baseline?'
    ],
    activatedComponents: ['TrendAnalyzer', 'BaselineComparator'],
    inferenceNotes: 'Measures metrics against historical patterns and defined thresholds',
    confidence: 72
  },
  {
    id: 'ops-agent-pat-15',
    name: 'Resource Bottleneck Detection',
    description: 'Identify resource constraints by correlating job queue demand with template resource specs.',
    tier: 'complex',
    taskDimensionId: 'ops-task-resource-allocation',
    dataDimensionIds: ['ops-data-job-queue', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-infrastructure-tech',
    patternType: 'aggregator',
    exampleQuestions: [
      'Do we have enough CPU for the pending jobs?',
      'Which resources are the bottleneck for this deployment queue?'
    ],
    activatedComponents: ['CapacityPlanner', 'BottleneckDetector'],
    inferenceNotes: 'Calculates aggregate resource demand vs. available supply',
    confidence: 72
  },
  {
    id: 'ops-agent-pat-16',
    name: 'SLA Risk Scoring',
    description: 'Calculate SLA breach risk by combining current logs, queue state, and migration impact.',
    tier: 'complex',
    taskDimensionId: 'ops-task-sla-tracking',
    dataDimensionIds: ['ops-data-historical-logs', 'ops-data-job-queue'],
    userProfileDimensionId: 'ops-up-ops-manager',
    patternType: 'hopping',
    exampleQuestions: [
      'Are we at risk of missing SLAs?',
      'What is the probability of uptime breach if we deploy now?'
    ],
    activatedComponents: ['RiskScorer', 'SLAProjector'],
    inferenceNotes: 'Probabilistic SLA compliance based on ongoing operations',
    confidence: 72
  },
  // FUZZY PATTERNS (8)
  {
    id: 'ops-agent-pat-17',
    name: 'Anomalous Job Behavior Detection',
    description: 'Identify unusual job patterns that may require intervention or investigation.',
    tier: 'fuzzy',
    taskDimensionId: 'ops-task-progress-monitoring',
    dataDimensionIds: ['ops-data-job-queue', 'ops-data-historical-logs', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-devops-engineer',
    patternType: 'reasoning',
    exampleQuestions: [
      'Are there any jobs behaving unexpectedly?',
      'Is this job taking longer than it should?'
    ],
    activatedComponents: ['AnomalyDetector', 'BehaviorAnalyzer'],
    ambiguityNotes: 'Normal vs. anomalous depends on workload, time of day, and job class',
    inferenceNotes: 'Multi-dimensional comparison of runtime, resource usage, and error rates',
    confidence: 50
  },
  {
    id: 'ops-agent-pat-18',
    name: 'Implicit Dependency Inference',
    description: 'Infer hidden or undocumented dependencies between systems based on log patterns.',
    tier: 'fuzzy',
    taskDimensionId: 'ops-task-checkpoint-validation',
    dataDimensionIds: ['ops-data-historical-logs', 'ops-data-migration-schemas', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-database-admin',
    patternType: 'branch',
    exampleQuestions: [
      'What systems depend on this checkpoint completing?',
      'Are there hidden coupling issues we should know about?'
    ],
    activatedComponents: ['DependencyInferer', 'CouplingAnalyzer'],
    ambiguityNotes: 'Undocumented dependencies may exist; inferences subject to false positives',
    inferenceNotes: 'Statistical analysis of temporal correlations in system events',
    confidence: 50
  },
  {
    id: 'ops-agent-pat-19',
    name: 'Graceful Degradation Pathway',
    description: 'Determine safest operational path when multiple constraints are violated.',
    tier: 'fuzzy',
    taskDimensionId: 'ops-task-error-triage',
    dataDimensionIds: ['ops-data-historical-logs', 'ops-data-config-templates', 'ops-data-job-queue'],
    userProfileDimensionId: 'ops-up-ops-manager',
    patternType: 'reasoning',
    exampleQuestions: [
      'How should we degrade gracefully given current failures?',
      'What is the least disruptive way to handle this error cascade?'
    ],
    activatedComponents: ['DegradationPlanner', 'RiskMitigator'],
    ambiguityNotes: 'Optimal degradation strategy depends on business priorities and system state',
    inferenceNotes: 'Decision tree based on failure severity, service criticality, and capacity',
    confidence: 50
  },
  {
    id: 'ops-agent-pat-20',
    name: 'Cross-Tenant Blast Radius Estimation',
    description: 'Estimate potential impact across tenant systems from a single failure point.',
    tier: 'fuzzy',
    taskDimensionId: 'ops-task-migration-planning',
    dataDimensionIds: ['ops-data-migration-schemas', 'ops-data-historical-logs', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-infrastructure-tech',
    patternType: 'branch',
    exampleQuestions: [
      'If this service fails, how many tenants are affected?',
      'What is the blast radius of this infrastructure change?'
    ],
    activatedComponents: ['BlastRadiusCalculator', 'ImpactMapper'],
    ambiguityNotes: 'Impact depends on blast isolation design, which may be undocumented',
    inferenceNotes: 'Graph analysis of service relationships and shared infrastructure',
    confidence: 50
  },
  {
    id: 'ops-agent-pat-21',
    name: 'Seasonal Performance Modeling',
    description: 'Predict performance behavior based on seasonal patterns and workload cycles.',
    tier: 'fuzzy',
    taskDimensionId: 'ops-task-resource-allocation',
    dataDimensionIds: ['ops-data-historical-logs', 'ops-data-job-queue', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-product-manager',
    patternType: 'reasoning',
    exampleQuestions: [
      'Will our capacity hold up during peak season?',
      'What resources do we need to provision for Q4?'
    ],
    activatedComponents: ['SeasonalForecaster', 'CapacityPlanner'],
    ambiguityNotes: 'Seasonal patterns may shift due to business changes or external factors',
    inferenceNotes: 'Time series analysis of historical workload data with growth adjustment',
    confidence: 50
  },
  {
    id: 'ops-agent-pat-22',
    name: 'Compliance Risk Assessment',
    description: 'Evaluate compliance posture by reasoning about migration changes and logging adequacy.',
    tier: 'fuzzy',
    taskDimensionId: 'ops-task-data-quality-checks',
    dataDimensionIds: ['ops-data-migration-schemas', 'ops-data-historical-logs', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-database-admin',
    patternType: 'branch',
    exampleQuestions: [
      'Does this migration maintain compliance requirements?',
      'Are we logging enough for audit requirements?'
    ],
    activatedComponents: ['ComplianceChecker', 'AuditAnalyzer'],
    ambiguityNotes: 'Compliance interpretation requires regulatory domain knowledge',
    inferenceNotes: 'Rule-based evaluation against standard frameworks (SOC2, HIPAA, GDPR)',
    confidence: 50
  },
  {
    id: 'ops-agent-pat-23',
    name: 'System Health Inference from Indirect Signals',
    description: 'Infer overall system health from indirect operational signals and patterns.',
    tier: 'fuzzy',
    taskDimensionId: 'ops-task-progress-monitoring',
    dataDimensionIds: ['ops-data-historical-logs', 'ops-data-job-queue', 'ops-data-config-templates'],
    userProfileDimensionId: 'ops-up-ops-manager',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is the system fundamentally healthy, or are we just in a calm period?',
      'What are early warning signs of a broader failure?'
    ],
    activatedComponents: ['HealthInferencer', 'EarlyWarningSystem'],
    ambiguityNotes: 'Health signals can be misleading; context and history crucial for interpretation',
    inferenceNotes: 'Holistic scoring from job latency, error rates, resource utilization patterns',
    confidence: 50
  },
  {
    id: 'ops-agent-pat-24',
    name: 'Post-Incident Root Cause Reasoning',
    description: 'Reconstruct root cause through multi-source reasoning after incident resolution.',
    tier: 'fuzzy',
    taskDimensionId: 'ops-task-error-triage',
    dataDimensionIds: ['ops-data-historical-logs', 'ops-data-migration-schemas', 'ops-data-job-queue'],
    userProfileDimensionId: 'ops-up-devops-engineer',
    patternType: 'reasoning',
    exampleQuestions: [
      'What was the root cause of the outage?',
      'Did the recent migration trigger this failure, or was it unrelated?'
    ],
    activatedComponents: ['RootCauseAnalyzer', 'TimelineReconstructor'],
    ambiguityNotes: 'Multiple plausible root causes may exist; requires evidence correlation',
    inferenceNotes: 'Temporal and causal graph analysis of events leading to incident',
    confidence: 50
  }
]

export const ONPREM_ASSISTANT_PATTERNS: DimensionPattern[] = [
  // SIMPLE PATTERNS (8)
  {
    id: 'onprem-assistant-pat-01',
    name: 'Document Classification Lookup',
    description: 'Direct classification of document type based on content patterns.',
    tier: 'simple',
    taskDimensionId: 'onprem-task-document-classification',
    dataDimensionIds: ['onprem-data-classified-docs'],
    userProfileDimensionId: 'onprem-up-analyst-cleared',
    patternType: 'simple',
    exampleQuestions: ['Is this document a contract or a memo?', 'Classify this file by document type'],
    activatedComponents: ['ClassificationEngine'],
    confidence: 90
  },
  {
    id: 'onprem-assistant-pat-02',
    name: 'Sensitivity Level Determination',
    description: 'Assign sensitivity classification based on content markers.',
    tier: 'simple',
    taskDimensionId: 'onprem-task-sensitivity-labeling',
    dataDimensionIds: ['onprem-data-classified-docs'],
    userProfileDimensionId: 'onprem-up-security-officer',
    patternType: 'simple',
    exampleQuestions: ['What is the sensitivity level of this document?', 'Is this classified information?'],
    activatedComponents: ['SensitivityClassifier'],
    confidence: 90
  },
  {
    id: 'onprem-assistant-pat-03',
    name: 'Policy Requirement Extraction',
    description: 'Identify applicable policies from policy database for a given document.',
    tier: 'simple',
    taskDimensionId: 'onprem-task-policy-lookup',
    dataDimensionIds: ['onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-legal-counsel',
    patternType: 'simple',
    exampleQuestions: ['What policies apply to this contract?', 'Show me relevant policy requirements'],
    activatedComponents: ['PolicyLookup'],
    confidence: 90
  },
  {
    id: 'onprem-assistant-pat-04',
    name: 'Compliance Status Single Check',
    description: 'Verify compliance status against a single standard or requirement.',
    tier: 'simple',
    taskDimensionId: 'onprem-task-compliance-validation',
    dataDimensionIds: ['onprem-data-compliance-rules'],
    userProfileDimensionId: 'onprem-up-compliance-auditor',
    patternType: 'simple',
    exampleQuestions: ['Is this document GDPR compliant?', 'Does it meet SOC2 requirements?'],
    activatedComponents: ['ComplianceValidator'],
    confidence: 90
  },
  {
    id: 'onprem-assistant-pat-05',
    name: 'Audit Log Retrieval',
    description: 'Fetch audit logs for a specific document or access event.',
    tier: 'simple',
    taskDimensionId: 'onprem-task-audit-trail-review',
    dataDimensionIds: ['onprem-data-audit-ledger'],
    userProfileDimensionId: 'onprem-up-security-officer',
    patternType: 'simple',
    exampleQuestions: ['Show me the audit trail for this file', 'Who accessed this document?'],
    activatedComponents: ['AuditLogViewer'],
    confidence: 90
  },
  {
    id: 'onprem-assistant-pat-06',
    name: 'Access Permission Query',
    description: 'Check current access permissions for a user or document.',
    tier: 'simple',
    taskDimensionId: 'onprem-task-access-control-verification',
    dataDimensionIds: ['onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-system-admin-onprem',
    patternType: 'simple',
    exampleQuestions: ['Does this user have access to this folder?', 'What are my permissions?'],
    activatedComponents: ['PermissionChecker'],
    confidence: 90
  },
  {
    id: 'onprem-assistant-pat-07',
    name: 'Report Data Aggregation Single Source',
    description: 'Generate report data from a single classified data source.',
    tier: 'simple',
    taskDimensionId: 'onprem-task-report-generation',
    dataDimensionIds: ['onprem-data-classified-docs'],
    userProfileDimensionId: 'onprem-up-analyst-cleared',
    patternType: 'simple',
    exampleQuestions: ['Generate a report of all classified documents', 'Show document counts by type'],
    activatedComponents: ['ReportBuilder'],
    confidence: 90
  },
  {
    id: 'onprem-assistant-pat-08',
    name: 'Encryption Status Verification',
    description: 'Confirm encryption status of a file or data store.',
    tier: 'simple',
    taskDimensionId: 'onprem-task-encryption-verification',
    dataDimensionIds: ['onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-security-officer',
    patternType: 'simple',
    exampleQuestions: ['Is this file encrypted?', 'What encryption standard is in use?'],
    activatedComponents: ['EncryptionVerifier'],
    confidence: 90
  },
  // COMPLEX PATTERNS (8)
  {
    id: 'onprem-assistant-pat-09',
    name: 'Multi-Aspect Compliance Validation',
    description: 'Cross-check document against multiple compliance frameworks simultaneously.',
    tier: 'complex',
    taskDimensionId: 'onprem-task-compliance-validation',
    dataDimensionIds: ['onprem-data-compliance-rules', 'onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-compliance-auditor',
    patternType: 'aggregator',
    exampleQuestions: [
      'Is this document compliant with GDPR and SOC2 and HIPAA?',
      'What compliance gaps exist?'
    ],
    activatedComponents: ['MultiFrameworkValidator', 'ComplianceGapAnalyzer'],
    inferenceNotes: 'Evaluates against all applicable frameworks in policy database',
    confidence: 72
  },
  {
    id: 'onprem-assistant-pat-10',
    name: 'Access Lineage Tracing',
    description: 'Trace document access chain through policy controls and audit records.',
    tier: 'complex',
    taskDimensionId: 'onprem-task-audit-trail-review',
    dataDimensionIds: ['onprem-data-audit-ledger', 'onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-security-officer',
    patternType: 'hopping',
    exampleQuestions: [
      'Who had access to this sensitive document and when?',
      'Show me the complete access chain for this file'
    ],
    activatedComponents: ['AccessLineageTracer', 'AuditChainBuilder'],
    inferenceNotes: 'Reconstructs access path from audit logs validated against permissions',
    confidence: 72
  },
  {
    id: 'onprem-assistant-pat-11',
    name: 'Risk-Based Access Decision',
    description: 'Determine access appropriateness by combining classification, policy, and audit context.',
    tier: 'complex',
    taskDimensionId: 'onprem-task-access-control-verification',
    dataDimensionIds: ['onprem-data-classified-docs', 'onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-system-admin-onprem',
    patternType: 'aggregator',
    exampleQuestions: [
      'Should we grant access to this sensitive document?',
      'What is the risk profile of this access request?'
    ],
    activatedComponents: ['RiskAssessor', 'AccessApprover'],
    inferenceNotes: 'Combines sensitivity level, user role, and historical access patterns',
    confidence: 72
  },
  {
    id: 'onprem-assistant-pat-12',
    name: 'Classification-Policy Alignment Check',
    description: 'Verify that document classification aligns with applicable policy requirements.',
    tier: 'complex',
    taskDimensionId: 'onprem-task-document-classification',
    dataDimensionIds: ['onprem-data-classified-docs', 'onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-analyst-cleared',
    patternType: 'hopping',
    exampleQuestions: [
      'Is this document classified correctly according to policy?',
      'Does the classification match the policy requirements?'
    ],
    activatedComponents: ['ClassificationValidator', 'PolicyAlignmentChecker'],
    inferenceNotes: 'Validates classification against policy-defined requirements',
    confidence: 72
  },
  {
    id: 'onprem-assistant-pat-13',
    name: 'Comprehensive Audit Report',
    description: 'Generate multi-source audit report combining logs, policies, and classifications.',
    tier: 'complex',
    taskDimensionId: 'onprem-task-report-generation',
    dataDimensionIds: ['onprem-data-audit-ledger', 'onprem-data-classified-docs'],
    userProfileDimensionId: 'onprem-up-compliance-auditor',
    patternType: 'aggregator',
    exampleQuestions: [
      'Generate an audit report for the past quarter',
      'Show me all access violations and anomalies'
    ],
    activatedComponents: ['AuditReportBuilder', 'ViolationDetector'],
    inferenceNotes: 'Correlates access attempts, classifications, and policy violations',
    confidence: 72
  },
  {
    id: 'onprem-assistant-pat-14',
    name: 'Sensitivity-Based Access Control',
    description: 'Enforce access controls based on sensitivity level and compliance requirements.',
    tier: 'complex',
    taskDimensionId: 'onprem-task-sensitivity-labeling',
    dataDimensionIds: ['onprem-data-policy-manual', 'onprem-data-classified-docs'],
    userProfileDimensionId: 'onprem-up-security-officer',
    patternType: 'hopping',
    exampleQuestions: [
      'What access controls are required for this sensitivity level?',
      'Who can access highly sensitive documents?'
    ],
    activatedComponents: ['SensitivityBasedACL', 'AccessEnforcer'],
    inferenceNotes: 'Maps sensitivity levels to policy-defined access requirements',
    confidence: 72
  },
  {
    id: 'onprem-assistant-pat-15',
    name: 'Data Residency Compliance Check',
    description: 'Verify data location compliance by correlating classification with policy requirements.',
    tier: 'complex',
    taskDimensionId: 'onprem-task-compliance-validation',
    dataDimensionIds: ['onprem-data-classified-docs', 'onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-compliance-auditor',
    patternType: 'aggregator',
    exampleQuestions: [
      'Is this data stored in the correct geographic region?',
      'Does our data residency comply with regulations?'
    ],
    activatedComponents: ['ResidencyValidator', 'ComplianceChecker'],
    inferenceNotes: 'Evaluates data location against policy constraints',
    confidence: 72
  },
  {
    id: 'onprem-assistant-pat-16',
    name: 'Encryption Level Requirement Mapping',
    description: 'Determine required encryption level based on classification and policy.',
    tier: 'complex',
    taskDimensionId: 'onprem-task-encryption-verification',
    dataDimensionIds: ['onprem-data-policy-manual', 'onprem-data-classified-docs'],
    userProfileDimensionId: 'onprem-up-security-officer',
    patternType: 'hopping',
    exampleQuestions: [
      'What encryption standard is required for this data?',
      'Are we meeting encryption requirements?'
    ],
    activatedComponents: ['EncryptionMapper', 'StandardChecker'],
    inferenceNotes: 'Maps data classification to required encryption standards',
    confidence: 72
  },
  // FUZZY PATTERNS (8)
  {
    id: 'onprem-assistant-pat-17',
    name: 'Anomalous Access Pattern Detection',
    description: 'Identify unusual access behavior that may indicate compromise or policy violation.',
    tier: 'fuzzy',
    taskDimensionId: 'onprem-task-anomaly-detection',
    dataDimensionIds: ['onprem-data-audit-ledger', 'onprem-data-policy-manual', 'onprem-data-classified-docs'],
    userProfileDimensionId: 'onprem-up-security-officer',
    patternType: 'reasoning',
    exampleQuestions: [
      'Are there any unusual access patterns?',
      'Is this access behavior normal for this user?'
    ],
    activatedComponents: ['AnomalyDetector', 'BehaviorAnalyzer'],
    ambiguityNotes: 'Baseline normal behavior varies by user role, time, and context',
    inferenceNotes: 'Statistical analysis of access frequency, timing, and data sensitivity',
    confidence: 50
  },
  {
    id: 'onprem-assistant-pat-18',
    name: 'Implicit Policy Violation Detection',
    description: 'Infer policy violations from indirect signals and undocumented constraints.',
    tier: 'fuzzy',
    taskDimensionId: 'onprem-task-cross-reference-analysis',
    dataDimensionIds: ['onprem-data-policy-manual', 'onprem-data-audit-ledger', 'onprem-data-classified-docs'],
    userProfileDimensionId: 'onprem-up-legal-counsel',
    patternType: 'branch',
    exampleQuestions: [
      'Are there any hidden policy violations?',
      'Does this access pattern conflict with intent of policy?'
    ],
    activatedComponents: ['PolicyInferencer', 'ViolationDetector'],
    ambiguityNotes: 'Policy intent may be ambiguous; violation determination requires interpretation',
    inferenceNotes: 'Rule-based inference combined with semantic understanding of policy',
    confidence: 50
  },
  {
    id: 'onprem-assistant-pat-19',
    name: 'Data Lineage and Provenance Reasoning',
    description: 'Reason about data provenance and lineage across multiple classifications.',
    tier: 'fuzzy',
    taskDimensionId: 'onprem-task-cross-reference-analysis',
    dataDimensionIds: ['onprem-data-classified-docs', 'onprem-data-audit-ledger', 'onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-analyst-cleared',
    patternType: 'reasoning',
    exampleQuestions: [
      'Where did this data come from and how has it been processed?',
      'What is the complete data lineage for this dataset?'
    ],
    activatedComponents: ['LineageTracer', 'ProvenanceAnalyzer'],
    ambiguityNotes: 'Complete lineage may be incomplete or partially observable',
    inferenceNotes: 'Graph analysis of data transformations and movement through systems',
    confidence: 50
  },
  {
    id: 'onprem-assistant-pat-20',
    name: 'Insider Threat Risk Scoring',
    description: 'Evaluate insider threat risk from behavioral and access patterns.',
    tier: 'fuzzy',
    taskDimensionId: 'onprem-task-audit-trail-review',
    dataDimensionIds: ['onprem-data-audit-ledger', 'onprem-data-classified-docs', 'onprem-data-policy-manual'],
    userProfileDimensionId: 'onprem-up-security-officer',
    patternType: 'branch',
    exampleQuestions: [
      'What is the insider threat risk for this user?',
      'Are there warning signs of data exfiltration?'
    ],
    activatedComponents: ['ThreatScorer', 'RiskAnalyzer'],
    ambiguityNotes: 'Risk assessment requires behavioral context and historical baselines',
    inferenceNotes: 'Multi-factor scoring including access patterns, data sensitivity, and role',
    confidence: 50
  },
  {
    id: 'onprem-assistant-pat-21',
    name: 'Regulatory Landscape Evolution',
    description: 'Assess compliance posture against evolving regulatory requirements.',
    tier: 'fuzzy',
    taskDimensionId: 'onprem-task-compliance-validation',
    dataDimensionIds: ['onprem-data-policy-manual', 'onprem-data-classified-docs', 'onprem-data-compliance-rules'],
    userProfileDimensionId: 'onprem-up-compliance-auditor',
    patternType: 'reasoning',
    exampleQuestions: [
      'Are we prepared for upcoming regulation changes?',
      'What compliance gaps exist for future requirements?'
    ],
    activatedComponents: ['RegulatoryTracker', 'GapAnalyzer'],
    ambiguityNotes: 'Future regulatory changes unpredictable; assessment based on current trends',
    inferenceNotes: 'Trend analysis of regulatory environment combined with readiness assessment',
    confidence: 50
  },
  {
    id: 'onprem-assistant-pat-22',
    name: 'Data Classification Confidence Assessment',
    description: 'Estimate confidence level of document classification when boundaries are unclear.',
    tier: 'fuzzy',
    taskDimensionId: 'onprem-task-document-classification',
    dataDimensionIds: ['onprem-data-classified-docs', 'onprem-data-policy-manual', 'onprem-data-audit-ledger'],
    userProfileDimensionId: 'onprem-up-analyst-cleared',
    patternType: 'branch',
    exampleQuestions: [
      'How confident are we in this classification?',
      'Could this document be classified differently?'
    ],
    activatedComponents: ['ConfidenceScorer', 'ClassificationReviewer'],
    ambiguityNotes: 'Classification boundaries can be subjective; confidence varies by reviewer',
    inferenceNotes: 'Scoring based on pattern matching, policy alignment, and historical accuracy',
    confidence: 50
  },
  {
    id: 'onprem-assistant-pat-23',
    name: 'Third-Party Risk Assessment',
    description: 'Evaluate risk from third-party access to classified data.',
    tier: 'fuzzy',
    taskDimensionId: 'onprem-task-access-control-verification',
    dataDimensionIds: ['onprem-data-policy-manual', 'onprem-data-audit-ledger', 'onprem-data-classified-docs'],
    userProfileDimensionId: 'onprem-up-security-officer',
    patternType: 'reasoning',
    exampleQuestions: [
      'What is the risk of granting this third party access?',
      'How do we assess third-party security posture?'
    ],
    activatedComponents: ['ThirdPartyAssessor', 'RiskEvaluator'],
    ambiguityNotes: 'Third-party risk depends on factors outside our control',
    inferenceNotes: 'Multi-criteria assessment combining contractual terms and access history',
    confidence: 50
  },
  {
    id: 'onprem-assistant-pat-24',
    name: 'Contextual Permission Escalation Risk',
    description: 'Assess risk of permission escalation in context of current access and data sensitivity.',
    tier: 'fuzzy',
    taskDimensionId: 'onprem-task-access-control-verification',
    dataDimensionIds: ['onprem-data-classified-docs', 'onprem-data-policy-manual', 'onprem-data-audit-ledger'],
    userProfileDimensionId: 'onprem-up-system-admin-onprem',
    patternType: 'branch',
    exampleQuestions: [
      'Is this permission escalation request risky?',
      'What data could be compromised if this request is granted?'
    ],
    activatedComponents: ['EscalationAnalyzer', 'ImpactAssessor'],
    ambiguityNotes: 'Risk assessment depends on assumed threat model and attacker capabilities',
    inferenceNotes: 'Combines access control theory with data sensitivity and user behavior',
    confidence: 50
  }
]

export const MULTIMODAL_AGENT_PATTERNS: DimensionPattern[] = [
  // SIMPLE PATTERNS (8)
  {
    id: 'multimodal-agent-pat-01',
    name: 'Video Transcription Service',
    description: 'Convert video content to text transcript.',
    tier: 'simple',
    taskDimensionId: 'multimodal-task-video-transcription',
    dataDimensionIds: ['multimodal-data-video-library'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'simple',
    exampleQuestions: ['Transcribe this video', 'Convert speech to text'],
    activatedComponents: ['TranscriptionEngine'],
    confidence: 90
  },
  {
    id: 'multimodal-agent-pat-02',
    name: 'Image Caption Generation',
    description: 'Generate descriptive captions for images.',
    tier: 'simple',
    taskDimensionId: 'multimodal-task-image-captioning',
    dataDimensionIds: ['multimodal-data-image-dataset'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'simple',
    exampleQuestions: ['Describe this image', 'Generate a caption for this photo'],
    activatedComponents: ['CaptionGenerator'],
    confidence: 90
  },
  {
    id: 'multimodal-agent-pat-03',
    name: 'Audio Feature Extraction',
    description: 'Extract audio features such as tone, pace, and emotion.',
    tier: 'simple',
    taskDimensionId: 'multimodal-task-audio-extraction',
    dataDimensionIds: ['multimodal-data-audio-transcripts'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'simple',
    exampleQuestions: ['What is the tone of this audio?', 'Extract audio features'],
    activatedComponents: ['AudioAnalyzer'],
    confidence: 90
  },
  {
    id: 'multimodal-agent-pat-04',
    name: 'Metadata Tag Assignment',
    description: 'Apply standard metadata tags to media content.',
    tier: 'simple',
    taskDimensionId: 'multimodal-task-metadata-tagging',
    dataDimensionIds: ['multimodal-data-metadata-index'],
    userProfileDimensionId: 'multimodal-up-multimedia-analyst',
    patternType: 'simple',
    exampleQuestions: ['Tag this content', 'What metadata applies here?'],
    activatedComponents: ['MetadataTagger'],
    confidence: 90
  },
  {
    id: 'multimodal-agent-pat-05',
    name: 'Accessibility Alt-Text Generation',
    description: 'Create alt-text for accessibility compliance.',
    tier: 'simple',
    taskDimensionId: 'multimodal-task-accessibility-output',
    dataDimensionIds: ['multimodal-data-image-dataset'],
    userProfileDimensionId: 'multimodal-up-accessibility-specialist',
    patternType: 'simple',
    exampleQuestions: ['Generate alt-text for this image', 'Make this accessible'],
    activatedComponents: ['AltTextGenerator'],
    confidence: 90
  },
  {
    id: 'multimodal-agent-pat-06',
    name: 'Visual Element Highlighting',
    description: 'Identify and highlight key visual elements in images.',
    tier: 'simple',
    taskDimensionId: 'multimodal-task-visual-highlight-extraction',
    dataDimensionIds: ['multimodal-data-image-dataset'],
    userProfileDimensionId: 'multimodal-up-design-professional',
    patternType: 'simple',
    exampleQuestions: ['Highlight the main subject', 'What are the key visual elements?'],
    activatedComponents: ['VisualHighlighter'],
    confidence: 90
  },
  {
    id: 'multimodal-agent-pat-07',
    name: 'Media Format Conversion',
    description: 'Convert media between different formats and codecs.',
    tier: 'simple',
    taskDimensionId: 'multimodal-task-format-conversion',
    dataDimensionIds: ['multimodal-data-video-library'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'simple',
    exampleQuestions: ['Convert this video to MP4', 'Change the file format'],
    activatedComponents: ['FormatConverter'],
    confidence: 90
  },
  {
    id: 'multimodal-agent-pat-08',
    name: 'Temporal Marker Insertion',
    description: 'Add temporal markers to video at key points.',
    tier: 'simple',
    taskDimensionId: 'multimodal-task-temporal-analysis',
    dataDimensionIds: ['multimodal-data-video-library'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'simple',
    exampleQuestions: ['Add chapter markers to this video', 'Create timestamps'],
    activatedComponents: ['TemporalMarker'],
    confidence: 90
  },
  // COMPLEX PATTERNS (8)
  {
    id: 'multimodal-agent-pat-09',
    name: 'Cross-Modal Content Synthesis',
    description: 'Generate complementary content by correlating video, audio, and metadata.',
    tier: 'complex',
    taskDimensionId: 'multimodal-task-cross-modal-synthesis',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-audio-transcripts'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'aggregator',
    exampleQuestions: [
      'Create a highlight reel matching the most engaging moments',
      'Sync captions to speech patterns'
    ],
    activatedComponents: ['SynthesisEngine', 'ModalCorrelator'],
    inferenceNotes: 'Aligns temporal boundaries and content semantics across modalities',
    confidence: 72
  },
  {
    id: 'multimodal-agent-pat-10',
    name: 'Video Lesson Plan Generation',
    description: 'Create structured lesson plans from video content analysis.',
    tier: 'complex',
    taskDimensionId: 'multimodal-task-lesson-plan-generation',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-metadata-index'],
    userProfileDimensionId: 'multimodal-up-educator',
    patternType: 'hopping',
    exampleQuestions: [
      'Generate a lesson plan from this educational video',
      'Create learning objectives from video content'
    ],
    activatedComponents: ['LessonPlanner', 'ContentStructurer'],
    inferenceNotes: 'Extracts educational concepts and organizes by learning progression',
    confidence: 72
  },
  {
    id: 'multimodal-agent-pat-11',
    name: 'Comprehensive Accessibility Package',
    description: 'Create full accessibility suite combining captions, alt-text, and transcripts.',
    tier: 'complex',
    taskDimensionId: 'multimodal-task-accessibility-output',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-image-dataset'],
    userProfileDimensionId: 'multimodal-up-accessibility-specialist',
    patternType: 'aggregator',
    exampleQuestions: [
      'Make this entire presentation fully accessible',
      'Create complete accessibility documentation'
    ],
    activatedComponents: ['AccessibilityGenerator', 'MultimodalCaptioner'],
    inferenceNotes: 'Coordinates captioning, transcription, and alt-text generation',
    confidence: 72
  },
  {
    id: 'multimodal-agent-pat-12',
    name: 'Narrative Extraction from Media',
    description: 'Extract narrative structure from video and audio content.',
    tier: 'complex',
    taskDimensionId: 'multimodal-task-temporal-analysis',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-audio-transcripts'],
    userProfileDimensionId: 'multimodal-up-journalist',
    patternType: 'hopping',
    exampleQuestions: [
      'What is the narrative arc of this video?',
      'Extract the story structure from this content'
    ],
    activatedComponents: ['NarrativeAnalyzer', 'StructureExtractor'],
    inferenceNotes: 'Maps emotional and thematic progression through temporal analysis',
    confidence: 72
  },
  {
    id: 'multimodal-agent-pat-13',
    name: 'Content Tagging Multi-Modal',
    description: 'Apply comprehensive tags by analyzing visual, audio, and metadata content.',
    tier: 'complex',
    taskDimensionId: 'multimodal-task-metadata-tagging',
    dataDimensionIds: ['multimodal-data-image-dataset', 'multimodal-data-audio-transcripts'],
    userProfileDimensionId: 'multimodal-up-multimedia-analyst',
    patternType: 'aggregator',
    exampleQuestions: [
      'Tag this content across all dimensions',
      'Create a complete tag hierarchy'
    ],
    activatedComponents: ['MultimodalTagger', 'SemanticAnalyzer'],
    inferenceNotes: 'Synthesizes visual recognition, audio analysis, and semantic understanding',
    confidence: 72
  },
  {
    id: 'multimodal-agent-pat-14',
    name: 'Visual Story to Production Plan',
    description: 'Convert visual storyboards and audio notes to production specifications.',
    tier: 'complex',
    taskDimensionId: 'multimodal-task-visual-highlight-extraction',
    dataDimensionIds: ['multimodal-data-image-dataset', 'multimodal-data-metadata-index'],
    userProfileDimensionId: 'multimodal-up-design-professional',
    patternType: 'hopping',
    exampleQuestions: [
      'Convert this storyboard to production specs',
      'Create a visual design specification document'
    ],
    activatedComponents: ['SpecGenerator', 'DesignSystemMapper'],
    inferenceNotes: 'Translates visual mockups and notes to detailed production requirements',
    confidence: 72
  },
  {
    id: 'multimodal-agent-pat-15',
    name: 'Format and Distribution Optimization',
    description: 'Convert and optimize media for multiple distribution channels.',
    tier: 'complex',
    taskDimensionId: 'multimodal-task-format-conversion',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-metadata-index'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'aggregator',
    exampleQuestions: [
      'Optimize this video for YouTube, TikTok, and Instagram',
      'Create multi-format distribution package'
    ],
    activatedComponents: ['OptimizationEngine', 'DistributionPlanner'],
    inferenceNotes: 'Adapts format, duration, and metadata to platform requirements',
    confidence: 72
  },
  {
    id: 'multimodal-agent-pat-16',
    name: 'Multimedia Research Package',
    description: 'Compile research findings with supporting media and documentation.',
    tier: 'complex',
    taskDimensionId: 'multimodal-task-image-captioning',
    dataDimensionIds: ['multimodal-data-image-dataset', 'multimodal-data-metadata-index'],
    userProfileDimensionId: 'multimodal-up-journalist',
    patternType: 'hopping',
    exampleQuestions: [
      'Create a multimedia research package',
      'Compile evidence with visual documentation'
    ],
    activatedComponents: ['ResearchCompiler', 'EvidenceOrganizer'],
    inferenceNotes: 'Organizes visual evidence with contextual documentation',
    confidence: 72
  },
  // FUZZY PATTERNS (8)
  {
    id: 'multimodal-agent-pat-17',
    name: 'Content Authenticity Assessment',
    description: 'Evaluate authenticity of media content through multi-modal analysis.',
    tier: 'fuzzy',
    taskDimensionId: 'multimodal-task-cross-modal-synthesis',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-audio-transcripts', 'multimodal-data-image-dataset'],
    userProfileDimensionId: 'multimodal-up-journalist',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is this video authentic or manipulated?',
      'What are the authenticity indicators?'
    ],
    activatedComponents: ['AuthenticityAnalyzer', 'ForensicsDetector'],
    ambiguityNotes: 'Deepfake detection highly uncertain; requires expert review',
    inferenceNotes: 'Analysis of audio-visual sync, temporal consistency, and artifact patterns',
    confidence: 50
  },
  {
    id: 'multimodal-agent-pat-18',
    name: 'Emotional Resonance Scoring',
    description: 'Measure emotional impact across visual, audio, and narrative dimensions.',
    tier: 'fuzzy',
    taskDimensionId: 'multimodal-task-audio-extraction',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-audio-transcripts', 'multimodal-data-image-dataset'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'branch',
    exampleQuestions: [
      'What is the emotional impact of this content?',
      'How will audiences respond to this video?'
    ],
    activatedComponents: ['EmotionScorer', 'AudienceResonanceAnalyzer'],
    ambiguityNotes: 'Emotional response varies by audience, culture, and individual',
    inferenceNotes: 'Multi-factor scoring from color psychology, audio tone, pacing, and narrative',
    confidence: 50
  },
  {
    id: 'multimodal-agent-pat-19',
    name: 'Implicit Message Detection',
    description: 'Identify implicit messaging and subtext across media modalities.',
    tier: 'fuzzy',
    taskDimensionId: 'multimodal-task-visual-highlight-extraction',
    dataDimensionIds: ['multimodal-data-image-dataset', 'multimodal-data-audio-transcripts', 'multimodal-data-metadata-index'],
    userProfileDimensionId: 'multimodal-up-multimedia-analyst',
    patternType: 'reasoning',
    exampleQuestions: [
      'What is the implicit message in this advertisement?',
      'What subtext is communicated through visual composition?'
    ],
    activatedComponents: ['SubtextAnalyzer', 'ImplicitMessageDetector'],
    ambiguityNotes: 'Interpretation of implicit messaging is subjective and context-dependent',
    inferenceNotes: 'Semantic analysis of visual metaphor, audio undertones, and narrative framing',
    confidence: 50
  },
  {
    id: 'multimodal-agent-pat-20',
    name: 'Cross-Cultural Adaptation Guidance',
    description: 'Recommend content adaptations for different cultural contexts.',
    tier: 'fuzzy',
    taskDimensionId: 'multimodal-task-format-conversion',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-image-dataset', 'multimodal-data-metadata-index'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'branch',
    exampleQuestions: [
      'How should we adapt this for different markets?',
      'What cultural sensitivities should we consider?'
    ],
    activatedComponents: ['CulturalAdapterr', 'LocalizationGuide'],
    ambiguityNotes: 'Cultural appropriateness depends on specific regional and demographic context',
    inferenceNotes: 'Knowledge-based mapping of cultural symbols, color meanings, and sensitivities',
    confidence: 50
  },
  {
    id: 'multimodal-agent-pat-21',
    name: 'Audience Suitability Classification',
    description: 'Determine appropriate audience demographics for content.',
    tier: 'fuzzy',
    taskDimensionId: 'multimodal-task-accessibility-output',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-audio-transcripts', 'multimodal-data-image-dataset'],
    userProfileDimensionId: 'multimodal-up-educator',
    patternType: 'reasoning',
    exampleQuestions: [
      'What age group is this content suitable for?',
      'Should we add content warnings?'
    ],
    activatedComponents: ['AudienceClassifier', 'ContentRater'],
    ambiguityNotes: 'Suitability judgments involve subjective values and standards',
    inferenceNotes: 'Content analysis against age-appropriate guidelines and rating standards',
    confidence: 50
  },
  {
    id: 'multimodal-agent-pat-22',
    name: 'Engagement Prediction from Media Signals',
    description: 'Predict viewer engagement based on content characteristics.',
    tier: 'fuzzy',
    taskDimensionId: 'multimodal-task-temporal-analysis',
    dataDimensionIds: ['multimodal-data-video-library', 'multimodal-data-audio-transcripts', 'multimodal-data-metadata-index'],
    userProfileDimensionId: 'multimodal-up-content-creator',
    patternType: 'branch',
    exampleQuestions: [
      'How engaging will this content be?',
      'Where might viewers drop off?'
    ],
    activatedComponents: ['EngagementPredictor', 'RetentionAnalyzer'],
    ambiguityNotes: 'Engagement prediction uncertain; affected by distribution and promotion',
    inferenceNotes: 'Pattern matching from pacing, visual variety, audio energy, and editing',
    confidence: 50
  },
  {
    id: 'multimodal-agent-pat-23',
    name: 'Semantic Consistency Across Modalities',
    description: 'Verify consistency of message across visual, audio, and text elements.',
    tier: 'fuzzy',
    taskDimensionId: 'multimodal-task-image-captioning',
    dataDimensionIds: ['multimodal-data-image-dataset', 'multimodal-data-audio-transcripts', 'multimodal-data-video-library'],
    userProfileDimensionId: 'multimodal-up-design-professional',
    patternType: 'reasoning',
    exampleQuestions: [
      'Are the visual and audio messages consistent?',
      'Is there conflicting messaging across channels?'
    ],
    activatedComponents: ['SemanticValidator', 'ConsistencyChecker'],
    ambiguityNotes: 'Semantic consistency interpretation can vary based on viewer perspective',
    inferenceNotes: 'Natural language processing combined with visual semantic analysis',
    confidence: 50
  },
  {
    id: 'multimodal-agent-pat-24',
    name: 'Multimodal Bias Detection',
    description: 'Identify potential biases in representation across media content.',
    tier: 'fuzzy',
    taskDimensionId: 'multimodal-task-metadata-tagging',
    dataDimensionIds: ['multimodal-data-image-dataset', 'multimodal-data-audio-transcripts', 'multimodal-data-video-library'],
    userProfileDimensionId: 'multimodal-up-journalist',
    patternType: 'branch',
    exampleQuestions: [
      'Are there biases in representation?',
      'How might this content reinforce stereotypes?'
    ],
    activatedComponents: ['BiasDetector', 'RepresentationAnalyzer'],
    ambiguityNotes: 'Bias identification requires cultural and social context; interpretive',
    inferenceNotes: 'Analysis of demographic representation, framing, and narrative agency',
    confidence: 50
  }
]

export const CONSUMER_CHAT_PATTERNS: DimensionPattern[] = [
  // SIMPLE PATTERNS (8)
  {
    id: 'consumer-chat-pat-01',
    name: 'Order Status Lookup',
    description: 'Retrieve current status of a customer order.',
    tier: 'simple',
    taskDimensionId: 'consumer-task-order-tracking',
    dataDimensionIds: ['consumer-data-conversation-history'],
    userProfileDimensionId: 'consumer-up-consumer-user',
    patternType: 'simple',
    exampleQuestions: ['Where is my order?', 'What is the status of order #12345?'],
    activatedComponents: ['OrderLookup'],
    confidence: 90
  },
  {
    id: 'consumer-chat-pat-02',
    name: 'FAQ Query Resolution',
    description: 'Answer common questions directly from FAQ database.',
    tier: 'simple',
    taskDimensionId: 'consumer-task-faq-answering',
    dataDimensionIds: ['consumer-data-faq-catalog'],
    userProfileDimensionId: 'consumer-up-consumer-user',
    patternType: 'simple',
    exampleQuestions: ['How do I return an item?', 'What is your return policy?'],
    activatedComponents: ['FAQMatcher'],
    confidence: 90
  },
  {
    id: 'consumer-chat-pat-03',
    name: 'Basic Product Recommendation',
    description: 'Suggest products based on category or simple criteria.',
    tier: 'simple',
    taskDimensionId: 'consumer-task-product-recommendation',
    dataDimensionIds: ['consumer-data-faq-catalog'],
    userProfileDimensionId: 'consumer-up-consumer-user',
    patternType: 'simple',
    exampleQuestions: ['What products do you have in electronics?', 'Show me your bestsellers'],
    activatedComponents: ['SimpleRecommender'],
    confidence: 90
  },
  {
    id: 'consumer-chat-pat-04',
    name: 'Return Authorization Processing',
    description: 'Initiate simple return process for eligible items.',
    tier: 'simple',
    taskDimensionId: 'consumer-task-return-processing',
    dataDimensionIds: ['consumer-data-conversation-history'],
    userProfileDimensionId: 'consumer-up-consumer-user',
    patternType: 'simple',
    exampleQuestions: ['I want to return this item', 'How do I start a return?'],
    activatedComponents: ['ReturnInitiator'],
    confidence: 90
  },
  {
    id: 'consumer-chat-pat-05',
    name: 'Sentiment Acknowledgment',
    description: 'Recognize and acknowledge customer emotional state.',
    tier: 'simple',
    taskDimensionId: 'consumer-task-sentiment-detection',
    dataDimensionIds: ['consumer-data-conversation-history'],
    userProfileDimensionId: 'consumer-up-consumer-user',
    patternType: 'simple',
    exampleQuestions: ['I am frustrated with this product', 'I love what you did with my order'],
    activatedComponents: ['SentimentRecognizer'],
    confidence: 90
  },
  {
    id: 'consumer-chat-pat-06',
    name: 'Loyalty Points Balance Check',
    description: 'Retrieve current loyalty program points.',
    tier: 'simple',
    taskDimensionId: 'consumer-task-loyalty-program',
    dataDimensionIds: ['consumer-data-user-profiles'],
    userProfileDimensionId: 'consumer-up-repeat-customer',
    patternType: 'simple',
    exampleQuestions: ['How many loyalty points do I have?', 'What is my points balance?'],
    activatedComponents: ['LoyaltyChecker'],
    confidence: 90
  },
  {
    id: 'consumer-chat-pat-07',
    name: 'Basic Complaint Logging',
    description: 'Record customer complaint for service follow-up.',
    tier: 'simple',
    taskDimensionId: 'consumer-task-complaint-handling',
    dataDimensionIds: ['consumer-data-conversation-history'],
    userProfileDimensionId: 'consumer-up-consumer-user',
    patternType: 'simple',
    exampleQuestions: ['I want to complain about this product', 'How do I file a complaint?'],
    activatedComponents: ['ComplaintLogger'],
    confidence: 90
  },
  {
    id: 'consumer-chat-pat-08',
    name: 'Feedback Submission',
    description: 'Collect customer feedback on product or service.',
    tier: 'simple',
    taskDimensionId: 'consumer-task-feedback-collection',
    dataDimensionIds: ['consumer-data-conversation-history'],
    userProfileDimensionId: 'consumer-up-consumer-user',
    patternType: 'simple',
    exampleQuestions: ['I want to leave feedback', 'Can you take my rating?'],
    activatedComponents: ['FeedbackCollector'],
    confidence: 90
  },
  // COMPLEX PATTERNS (8)
  {
    id: 'consumer-chat-pat-09',
    name: 'Personalized Recommendation Engine',
    description: 'Generate recommendations from purchase history and preferences.',
    tier: 'complex',
    taskDimensionId: 'consumer-task-product-recommendation',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-preference-vectors'],
    userProfileDimensionId: 'consumer-up-repeat-customer',
    patternType: 'aggregator',
    exampleQuestions: [
      'What products would I like?',
      'Can you recommend something based on my history?'
    ],
    activatedComponents: ['PersonalizedRecommender', 'PreferenceAnalyzer'],
    inferenceNotes: 'Correlates purchase patterns with stated preferences',
    confidence: 72
  },
  {
    id: 'consumer-chat-pat-10',
    name: 'Upsell and Cross-Sell Detection',
    description: 'Identify upsell opportunities from order context and preferences.',
    tier: 'complex',
    taskDimensionId: 'consumer-task-upsell-opportunity',
    dataDimensionIds: ['consumer-data-user-profiles', 'consumer-data-conversation-history'],
    userProfileDimensionId: 'consumer-up-vip-customer',
    patternType: 'hopping',
    exampleQuestions: [
      'What other products might go well with this?',
      'Should I upgrade to the premium version?'
    ],
    activatedComponents: ['UpsellDetector', 'OpportunityScorer'],
    inferenceNotes: 'Evaluates compatibility and customer propensity to upgrade',
    confidence: 72
  },
  {
    id: 'consumer-chat-pat-11',
    name: 'Churn Risk Assessment',
    description: 'Identify risk of customer leaving based on behavior and sentiment.',
    tier: 'complex',
    taskDimensionId: 'consumer-task-sentiment-detection',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-user-profiles'],
    userProfileDimensionId: 'consumer-up-customer-service-team',
    patternType: 'aggregator',
    exampleQuestions: [
      'Am I likely to switch to a competitor?',
      'Should the company take action to retain me?'
    ],
    activatedComponents: ['ChurnPredictor', 'RetentionAnalyzer'],
    inferenceNotes: 'Combines engagement metrics with sentiment trajectory',
    confidence: 72
  },
  {
    id: 'consumer-chat-pat-12',
    name: 'Dynamic Pricing Recommendation',
    description: 'Suggest pricing or discounts based on customer profile and context.',
    tier: 'complex',
    taskDimensionId: 'consumer-task-upsell-opportunity',
    dataDimensionIds: ['consumer-data-user-profiles', 'consumer-data-preference-vectors'],
    userProfileDimensionId: 'consumer-up-vip-customer',
    patternType: 'hopping',
    exampleQuestions: [
      'What discount should be offered to keep me as a customer?',
      'What price would make me likely to buy?'
    ],
    activatedComponents: ['PricingOptimizer', 'DiscountCalculator'],
    inferenceNotes: 'Evaluates willingness-to-pay and lifetime value',
    confidence: 72
  },
  {
    id: 'consumer-chat-pat-13',
    name: 'Return Eligibility and Reason Inference',
    description: 'Determine return eligibility and underlying customer dissatisfaction drivers.',
    tier: 'complex',
    taskDimensionId: 'consumer-task-return-processing',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-preference-vectors'],
    userProfileDimensionId: 'consumer-up-customer-service-team',
    patternType: 'hopping',
    exampleQuestions: [
      'Can I return this, and why might I want to?',
      'Is there an underlying issue we can fix?'
    ],
    activatedComponents: ['EligibilityChecker', 'RootCauseAnalyzer'],
    inferenceNotes: 'Infers dissatisfaction drivers from product fit and expectations',
    confidence: 72
  },
  {
    id: 'consumer-chat-pat-14',
    name: 'Complaint Triage and Resolution Routing',
    description: 'Route complaints to appropriate resolution path based on type and severity.',
    tier: 'complex',
    taskDimensionId: 'consumer-task-complaint-handling',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-user-profiles'],
    userProfileDimensionId: 'consumer-up-product-specialist',
    patternType: 'aggregator',
    exampleQuestions: [
      'How should my complaint be handled?',
      'What is the resolution path for this issue?'
    ],
    activatedComponents: ['ComplaintTriage', 'ResolutionRouter'],
    inferenceNotes: 'Evaluates complaint severity and customer value for routing priority',
    confidence: 72
  },
  {
    id: 'consumer-chat-pat-15',
    name: 'Loyalty Tier Optimization',
    description: 'Recommend loyalty tier changes based on spend and engagement.',
    tier: 'complex',
    taskDimensionId: 'consumer-task-loyalty-program',
    dataDimensionIds: ['consumer-data-user-profiles', 'consumer-data-conversation-history'],
    userProfileDimensionId: 'consumer-up-repeat-customer',
    patternType: 'hopping',
    exampleQuestions: [
      'Should I upgrade my loyalty tier?',
      'What benefits would I get at the next tier?'
    ],
    activatedComponents: ['TierOptimizer', 'BenefitsCalculator'],
    inferenceNotes: 'Calculates value of tier progression and engagement ROI',
    confidence: 72
  },
  {
    id: 'consumer-chat-pat-16',
    name: 'Proactive Support Intervention',
    description: 'Identify issues and offer support before customer complains.',
    tier: 'complex',
    taskDimensionId: 'consumer-task-feedback-collection',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-user-profiles'],
    userProfileDimensionId: 'consumer-up-customer-service-team',
    patternType: 'aggregator',
    exampleQuestions: [
      'Are there any issues with my recent orders?',
      'Should customer service reach out to me?'
    ],
    activatedComponents: ['IssuePredictor', 'ProactiveEngager'],
    inferenceNotes: 'Detects anomalies in order patterns or delivery',
    confidence: 72
  },
  // FUZZY PATTERNS (8)
  {
    id: 'consumer-chat-pat-17',
    name: 'Contextual Need Understanding',
    description: 'Infer unspoken customer needs from conversational context.',
    tier: 'fuzzy',
    taskDimensionId: 'consumer-task-personalization',
    dataDimensionIds: ['consumer-data-preference-vectors', 'consumer-data-conversation-history', 'consumer-data-user-profiles'],
    userProfileDimensionId: 'consumer-up-product-specialist',
    patternType: 'reasoning',
    exampleQuestions: [
      'What do I really need help with?',
      'What problem am I trying to solve?'
    ],
    activatedComponents: ['NeedInferencer', 'ContextAnalyzer'],
    ambiguityNotes: 'Unspoken needs may differ from stated requests; interpretation subject to error',
    inferenceNotes: 'Conversational analysis combined with behavioral history',
    confidence: 50
  },
  {
    id: 'consumer-chat-pat-18',
    name: 'Lifetime Value Trajectory Prediction',
    description: 'Predict long-term customer value considering multiple factors.',
    tier: 'fuzzy',
    taskDimensionId: 'consumer-task-product-recommendation',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-user-profiles', 'consumer-data-preference-vectors'],
    userProfileDimensionId: 'consumer-up-vip-customer',
    patternType: 'branch',
    exampleQuestions: [
      'What is my lifetime value to the company?',
      'How important am I as a customer?'
    ],
    activatedComponents: ['LTVPredictor', 'ValueTrajectory'],
    ambiguityNotes: 'Predictions uncertain; future behavior unpredictable',
    inferenceNotes: 'Time series modeling of spending with cohort comparison',
    confidence: 50
  },
  {
    id: 'consumer-chat-pat-19',
    name: 'Brand Perception Inference',
    description: 'Infer brand perception and loyalty drivers from indirect signals.',
    tier: 'fuzzy',
    taskDimensionId: 'consumer-task-sentiment-detection',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-preference-vectors', 'consumer-data-user-profiles'],
    userProfileDimensionId: 'consumer-up-consumer-user',
    patternType: 'reasoning',
    exampleQuestions: [
      'How do I really feel about your brand?',
      'What would make me more loyal?'
    ],
    activatedComponents: ['BrandPerceptionAnalyzer', 'LoyaltyDriver'],
    ambiguityNotes: 'Perception inference requires psychological understanding; uncertain',
    inferenceNotes: 'Multi-factor sentiment analysis including unspoken brand associations',
    confidence: 50
  },
  {
    id: 'consumer-chat-pat-20',
    name: 'Competitive Vulnerability Assessment',
    description: 'Assess risk of customer switching based on unmet needs.',
    tier: 'fuzzy',
    taskDimensionId: 'consumer-task-loyalty-program',
    dataDimensionIds: ['consumer-data-preference-vectors', 'consumer-data-conversation-history', 'consumer-data-user-profiles'],
    userProfileDimensionId: 'consumer-up-retention-specialist',
    patternType: 'branch',
    exampleQuestions: [
      'What could a competitor offer to win me over?',
      'What is my switching threshold?'
    ],
    activatedComponents: ['VulnerabilityAssessor', 'CompetitorGapAnalyzer'],
    ambiguityNotes: 'Switching decision depends on competitor offerings and market conditions',
    inferenceNotes: 'Gap analysis between current offerings and stated preferences',
    confidence: 50
  },
  {
    id: 'consumer-chat-pat-21',
    name: 'Complaint Severity Judgment',
    description: 'Assess true severity of complaint considering customer history and tone.',
    tier: 'fuzzy',
    taskDimensionId: 'consumer-task-complaint-handling',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-user-profiles', 'consumer-data-preference-vectors'],
    userProfileDimensionId: 'consumer-up-product-specialist',
    patternType: 'reasoning',
    exampleQuestions: [
      'How serious is this complaint really?',
      'Is this customer at risk of leaving?'
    ],
    activatedComponents: ['SeverityJudge', 'RiskEvaluator'],
    ambiguityNotes: 'Complaint severity perception varies; some customers vocal, others silent',
    inferenceNotes: 'Tone analysis combined with customer history and complaint patterns',
    confidence: 50
  },
  {
    id: 'consumer-chat-pat-22',
    name: 'Offer Timing Optimization',
    description: 'Determine optimal moment to present offers or promotions.',
    tier: 'fuzzy',
    taskDimensionId: 'consumer-task-upsell-opportunity',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-preference-vectors', 'consumer-data-user-profiles'],
    userProfileDimensionId: 'consumer-up-vip-customer',
    patternType: 'branch',
    exampleQuestions: [
      'When should you make me an offer?',
      'What is the right time to recommend upgrades?'
    ],
    activatedComponents: ['TimingOptimizer', 'OfferScheduler'],
    ambiguityNotes: 'Optimal timing depends on customer psychology and external factors',
    inferenceNotes: 'Analysis of purchase cycles and receptiveness signals',
    confidence: 50
  },
  {
    id: 'consumer-chat-pat-23',
    name: 'Hidden Dissatisfaction Detection',
    description: 'Identify underlying dissatisfaction masked by polite behavior.',
    tier: 'fuzzy',
    taskDimensionId: 'consumer-task-feedback-collection',
    dataDimensionIds: ['consumer-data-conversation-history', 'consumer-data-user-profiles', 'consumer-data-preference-vectors'],
    userProfileDimensionId: 'consumer-up-customer-service-team',
    patternType: 'reasoning',
    exampleQuestions: [
      'Is there dissatisfaction you are not expressing?',
      'What unspoken issues should we address?'
    ],
    activatedComponents: ['DissatisfactionDetector', 'HiddenSignalAnalyzer'],
    ambiguityNotes: 'Hidden feelings may not be accurately inferred; requires follow-up',
    inferenceNotes: 'Behavioral signals like reduced engagement and subtle language cues',
    confidence: 50
  },
  {
    id: 'consumer-chat-pat-24',
    name: 'Cultural and Demographic Personalization',
    description: 'Tailor interactions to cultural and demographic context.',
    tier: 'fuzzy',
    taskDimensionId: 'consumer-task-personalization',
    dataDimensionIds: ['consumer-data-user-profiles', 'consumer-data-preference-vectors', 'consumer-data-conversation-history'],
    userProfileDimensionId: 'consumer-up-repeat-customer',
    patternType: 'branch',
    exampleQuestions: [
      'How should interactions be adapted to my background?',
      'What cultural preferences should you consider?'
    ],
    activatedComponents: ['CulturalAdapter', 'DemographicPersonalizer'],
    ambiguityNotes: 'Cultural assumptions may not apply to individuals; requires sensitivity',
    inferenceNotes: 'Demographic and preference-based rules with individual override capability',
    confidence: 50
  }
]
