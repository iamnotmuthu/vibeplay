import type { DimensionAnalysisPayload } from '@/store/agentTypes'

export const OPS_AGENT_DIMENSIONS: DimensionAnalysisPayload = {
  tileId: 'ops-agent',
  agentName: 'Operations Agent',
  taskDimensions: [
    {
      id: 'ops-task-job-scheduling',
      label: 'Job Scheduling',
      description: 'Coordinate batch job execution across distributed systems with priority queuing and dependency resolution',
      parentTaskId: 'schedule-migration',
      intentCategories: ['automation', 'orchestration', 'resource-planning'],
      confidence: 'high'
    },
    {
      id: 'ops-task-migration-planning',
      label: 'Migration Planning',
      description: 'Design and sequence data migration workflows with phase gating and validation checkpoints',
      parentTaskId: 'schedule-migration',
      intentCategories: ['planning', 'risk-assessment', 'change-management'],
      confidence: 'high'
    },
    {
      id: 'ops-task-progress-monitoring',
      label: 'Progress Monitoring',
      description: 'Track real-time execution metrics and alert on SLA violations or performance degradation',
      parentTaskId: 'monitor-execution',
      intentCategories: ['observability', 'alerting', 'metrics-tracking'],
      confidence: 'high'
    },
    {
      id: 'ops-task-error-triage',
      label: 'Error Triage',
      description: 'Classify failures, extract root causes, and recommend remediation strategies from execution logs',
      parentTaskId: 'monitor-execution',
      intentCategories: ['incident-response', 'diagnostics', 'knowledge-enrichment'],
      confidence: 'high'
    },
    {
      id: 'ops-task-checkpoint-validation',
      label: 'Checkpoint Validation',
      description: 'Verify data consistency and integrity at migration milestones before proceeding to next phase',
      parentTaskId: 'validate-quality',
      intentCategories: ['quality-assurance', 'data-governance', 'compliance'],
      confidence: 'medium'
    },
    {
      id: 'ops-task-resource-allocation',
      label: 'Resource Allocation',
      description: 'Optimize compute, memory, and I/O allocation based on workload patterns and historical throughput',
      parentTaskId: 'schedule-migration',
      intentCategories: ['optimization', 'capacity-planning', 'cost-management'],
      confidence: 'medium'
    },
    {
      id: 'ops-task-schema-mapping',
      label: 'Schema Mapping',
      description: 'Transform source database schemas to target structures with column-level transformation rules',
      parentTaskId: 'validate-quality',
      intentCategories: ['data-transformation', 'metadata-management', 'compatibility-verification'],
      confidence: 'medium'
    },
    {
      id: 'ops-task-data-quality-checks',
      label: 'Data Quality Checks',
      description: 'Execute automated validation rules checking row counts, null distributions, and value patterns',
      parentTaskId: 'validate-quality',
      intentCategories: ['quality-assurance', 'testing', 'validation'],
      confidence: 'high'
    },
    {
      id: 'ops-task-rollback-management',
      label: 'Rollback Management',
      description: 'Plan and execute safe rollback procedures preserving point-in-time recovery and audit trails',
      parentTaskId: 'monitor-execution',
      intentCategories: ['disaster-recovery', 'risk-mitigation', 'business-continuity'],
      confidence: 'medium'
    },
    {
      id: 'ops-task-sla-tracking',
      label: 'SLA Tracking',
      description: 'Monitor compliance against service level agreements and generate performance reports for stakeholders',
      parentTaskId: 'monitor-execution',
      intentCategories: ['reporting', 'compliance', 'performance-management'],
      confidence: 'low'
    }
  ],
  dataDimensions: [
    {
      id: 'ops-data-job-queue',
      label: 'Job Queue Database',
      depthScore: 5,
      subTopics: [
        { name: 'Scheduled jobs with timestamps', depth: 4 },
        { name: 'Dependency graphs and parent-child relationships', depth: 5 },
        { name: 'Execution history and retry logic', depth: 4 },
        { name: 'Resource requirements per job', depth: 4 }
      ],
      keyEntities: ['job_id', 'job_type', 'status', 'priority', 'scheduled_time', 'execution_duration', 'resource_footprint'],
      connectedDomains: ['batch-processing', 'task-orchestration', 'performance-optimization'],
      sourceAttribution: [
        { sourceId: 'job_queue.db', sourceName: 'Production Queue Database', count: '847K records' }
      ]
    },
    {
      id: 'ops-data-migration-schemas',
      label: 'Migration Schemas',
      depthScore: 4,
      subTopics: [
        { name: 'Source and target schema definitions', depth: 5 },
        { name: 'Column mapping and transformation rules', depth: 4 },
        { name: 'Data type conversions and precision specs', depth: 4 },
        { name: 'Constraint preservation rules', depth: 3 }
      ],
      keyEntities: ['table_name', 'column_mapping', 'transformation_logic', 'data_type', 'nullable', 'indexes', 'constraints'],
      connectedDomains: ['database-design', 'etl-pipelines', 'data-migration'],
      sourceAttribution: [
        { sourceId: 'migration_schemas.yaml', sourceName: 'Schema Definition Repository', count: '156 tables' }
      ]
    },
    {
      id: 'ops-data-historical-logs',
      label: 'Historical Execution Logs',
      depthScore: 4,
      subTopics: [
        { name: 'Detailed execution traces per job', depth: 5 },
        { name: 'Error messages and stack traces', depth: 4 },
        { name: 'Performance metrics and timings', depth: 4 },
        { name: 'Resource utilization snapshots', depth: 3 }
      ],
      keyEntities: ['timestamp', 'job_id', 'log_level', 'message', 'duration_ms', 'cpu_percent', 'memory_mb', 'error_code'],
      connectedDomains: ['observability', 'incident-analysis', 'performance-tuning'],
      sourceAttribution: [
        { sourceId: 'job_execution_logs.tar.gz', sourceName: 'Compressed Log Archive', count: '2.3GB historical data' }
      ],
      gapNote: 'Log retention window limited to 90 days; older patterns require archive analysis'
    },
    {
      id: 'ops-data-config-templates',
      label: 'Job Configuration Templates',
      depthScore: 3,
      subTopics: [
        { name: 'Standard job templates by type', depth: 4 },
        { name: 'Environment-specific overrides', depth: 3 },
        { name: 'Validation schemas for config fields', depth: 3 },
        { name: 'Parameter hints and constraints', depth: 2 }
      ],
      keyEntities: ['template_name', 'template_version', 'job_parameters', 'default_values', 'required_fields', 'environment'],
      connectedDomains: ['configuration-management', 'infrastructure-as-code', 'automation'],
      sourceAttribution: [
        { sourceId: 'job_templates.json', sourceName: 'Configuration Template Library', count: '42 templates' }
      ]
    }
  ],
  userProfileDimensions: [
    {
      id: 'ops-up-devops-engineer',
      label: 'DevOps Engineer',
      description: 'Manages infrastructure automation and deployment pipelines',
      contextAxis: 'Systems thinking with operational rigor',
      postureAxis: 'Proactive reliability focus; tolerates technical complexity',
      channelAxis: 'Dashboards, CLI, infrastructure-as-code commits',
      behaviorImpact: 'Drives adoption of automated monitoring; requires visibility into resource utilization'
    },
    {
      id: 'ops-up-data-engineer',
      label: 'Data Engineer',
      description: 'Designs and maintains data pipeline infrastructure',
      contextAxis: 'Data flow optimization with quality guarantees',
      postureAxis: 'Schema-aware; detail-oriented on correctness; risk-sensitive',
      channelAxis: 'SQL queries, data lineage tools, schema drift alerts',
      behaviorImpact: 'Focuses on schema validation and data quality metrics; influences validation checkpoint design'
    },
    {
      id: 'ops-up-ops-manager',
      label: 'Operations Manager',
      description: 'Oversees operational runbooks and escalation procedures',
      contextAxis: 'Business impact alignment with service stability',
      postureAxis: 'SLA-driven; needs clear incident escalation paths',
      channelAxis: 'Incident reports, SLA dashboards, stakeholder communications',
      behaviorImpact: 'Shapes definition of critical thresholds; influences alerting sensitivity and runbook design'
    },
    {
      id: 'ops-up-database-admin',
      label: 'Database Administrator',
      description: 'Manages database performance, backup, and security',
      contextAxis: 'Data integrity with availability assurance',
      postureAxis: 'Conservative on schema changes; meticulous on recovery procedures',
      channelAxis: 'Database logs, backup verification reports, checksum validations',
      behaviorImpact: 'Enforces checkpoint validation rigor; influences rollback strategy and recovery testing'
    },
    {
      id: 'ops-up-product-manager',
      label: 'Product Manager',
      description: 'Defines feature roadmap and operational requirements',
      contextAxis: 'Business outcomes with customer impact visibility',
      postureAxis: 'Timeline-conscious; seeks automation for scaling',
      channelAxis: 'Status updates, risk assessments, executive summaries',
      behaviorImpact: 'Prioritizes migration schedule feasibility; drives demand for predictive capacity planning'
    },
    {
      id: 'ops-up-infrastructure-tech',
      label: 'Infrastructure Technician',
      description: 'Executes operational procedures and troubleshoots live systems',
      contextAxis: 'Procedural clarity with hands-on execution',
      postureAxis: 'Action-oriented; values clear step-by-step guidance',
      channelAxis: 'Runbooks, chat alerts, real-time dashboards',
      behaviorImpact: 'Requires clear error triage documentation; drives demand for one-click remediation tools'
    }
  ],
  summaryText: 'The Operations Agent coordinates complex data migration workflows by orchestrating job scheduling, monitoring execution progress, and validating quality checkpoints across distributed systems. It synthesizes job queue metadata, migration schemas, historical logs, and configuration templates to support DevOps engineers, data engineers, and operations managers in managing large-scale data transformation initiatives.'
}

export const ONPREM_ASSISTANT_DIMENSIONS: DimensionAnalysisPayload = {
  tileId: 'onprem-assistant',
  agentName: 'On-Premises Assistant',
  taskDimensions: [
    {
      id: 'onprem-task-document-classification',
      label: 'Document Classification',
      description: 'Assess incoming documents and assign sensitivity labels based on content analysis and policy rules',
      parentTaskId: 'classify-document',
      intentCategories: ['classification', 'risk-assessment', 'policy-enforcement'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-sensitivity-labeling',
      label: 'Sensitivity Labeling',
      description: 'Apply standardized sensitivity markings (U, C, S, TS) with justification and update triggers',
      parentTaskId: 'classify-document',
      intentCategories: ['data-governance', 'classification', 'compliance-marking'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-compliance-validation',
      label: 'Compliance Validation',
      description: 'Verify document content and metadata against regulatory requirements and security policies',
      parentTaskId: 'verify-compliance',
      intentCategories: ['compliance-checking', 'audit', 'policy-enforcement'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-audit-trail-review',
      label: 'Audit Trail Review',
      description: 'Examine access logs and modification history to detect unauthorized activity patterns',
      parentTaskId: 'verify-compliance',
      intentCategories: ['forensics', 'anomaly-detection', 'accountability'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-access-control-verification',
      label: 'Access Control Verification',
      description: 'Validate that document access aligns with user clearance levels and role-based permissions',
      parentTaskId: 'verify-compliance',
      intentCategories: ['access-control', 'identity-verification', 'least-privilege'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-report-generation',
      label: 'Report Generation',
      description: 'Synthesize classification, compliance, and audit findings into executive and technical reports',
      parentTaskId: 'generate-report',
      intentCategories: ['reporting', 'summarization', 'stakeholder-communication'],
      confidence: 'medium'
    },
    {
      id: 'onprem-task-cross-reference-analysis',
      label: 'Cross-Reference Analysis',
      description: 'Link related documents across the collection and identify inconsistencies or information silos',
      parentTaskId: 'generate-report',
      intentCategories: ['knowledge-synthesis', 'gap-analysis', 'information-discovery'],
      confidence: 'medium'
    },
    {
      id: 'onprem-task-encryption-verification',
      label: 'Encryption Verification',
      description: 'Confirm that sensitive documents meet cryptographic standards and key management requirements',
      parentTaskId: 'verify-compliance',
      intentCategories: ['cryptography', 'data-protection', 'security-validation'],
      confidence: 'medium'
    },
    {
      id: 'onprem-task-anomaly-detection',
      label: 'Anomaly Detection',
      description: 'Identify suspicious access patterns, unauthorized modifications, or policy deviations in audit logs',
      parentTaskId: 'verify-compliance',
      intentCategories: ['threat-detection', 'behavioral-analysis', 'incident-response'],
      confidence: 'medium'
    },
    {
      id: 'onprem-task-policy-lookup',
      label: 'Policy Lookup',
      description: 'Retrieve and interpret relevant security and classification policies for assessment context',
      parentTaskId: 'classify-document',
      intentCategories: ['knowledge-retrieval', 'policy-interpretation', 'decision-support'],
      confidence: 'low'
    }
  ],
  dataDimensions: [
    {
      id: 'onprem-data-classified-docs',
      label: 'Classified Documents Database',
      depthScore: 5,
      subTopics: [
        { name: 'Document metadata and content abstracts', depth: 5 },
        { name: 'Current and historical sensitivity labels', depth: 5 },
        { name: 'Document source and chain of custody', depth: 4 },
        { name: 'Related document cross-references', depth: 4 }
      ],
      keyEntities: ['doc_id', 'title', 'sensitivity_label', 'classification_date', 'content_hash', 'source_org', 'custodian'],
      connectedDomains: ['information-security', 'records-management', 'compliance-tracking'],
      sourceAttribution: [
        { sourceId: 'classified_documents.db', sourceName: 'On-Premises Document Repository', count: '1.2M documents' }
      ]
    },
    {
      id: 'onprem-data-policy-manual',
      label: 'Security Policy Manual',
      depthScore: 4,
      subTopics: [
        { name: 'Classification and sensitivity definitions', depth: 5 },
        { name: 'Access control and clearance requirements', depth: 4 },
        { name: 'Document handling and dissemination rules', depth: 4 },
        { name: 'Breach notification and escalation procedures', depth: 3 }
      ],
      keyEntities: ['policy_section', 'sensitivity_level', 'access_requirement', 'handling_rule', 'retention_period', 'escalation_trigger'],
      connectedDomains: ['policy-governance', 'compliance-management', 'risk-mitigation'],
      sourceAttribution: [
        { sourceId: 'security_policy_manual.pdf', sourceName: 'Official Policy Document', count: '287 pages' }
      ]
    },
    {
      id: 'onprem-data-compliance-rules',
      label: 'Compliance Rules Engine',
      depthScore: 4,
      subTopics: [
        { name: 'Automated compliance check definitions', depth: 4 },
        { name: 'Regulatory requirement mappings', depth: 4 },
        { name: 'Exception handling and waiver criteria', depth: 3 },
        { name: 'Audit trigger conditions and thresholds', depth: 3 }
      ],
      keyEntities: ['rule_id', 'rule_name', 'check_type', 'severity_level', 'remediation_action', 'responsible_party'],
      connectedDomains: ['compliance-automation', 'audit-management', 'policy-enforcement'],
      sourceAttribution: [
        { sourceId: 'compliance_rules.yaml', sourceName: 'Compliance Rule Repository', count: '94 rules' }
      ]
    },
    {
      id: 'onprem-data-audit-ledger',
      label: 'Audit Event Ledger',
      depthScore: 5,
      subTopics: [
        { name: 'Document access and download events', depth: 5 },
        { name: 'Modification and annotation history', depth: 5 },
        { name: 'User identity and authentication records', depth: 4 },
        { name: 'System-level security events and alerts', depth: 4 }
      ],
      keyEntities: ['event_timestamp', 'user_id', 'document_id', 'action_type', 'ip_address', 'authentication_method', 'event_status'],
      connectedDomains: ['audit-logging', 'forensics', 'accountability-tracking'],
      sourceAttribution: [
        { sourceId: 'audit_ledger.log', sourceName: 'Immutable Audit Log', count: '18.7M events' }
      ],
      gapNote: 'Log tamper detection relies on cryptographic verification; gaps in hash chain indicate potential tampering'
    }
  ],
  userProfileDimensions: [
    {
      id: 'onprem-up-security-officer',
      label: 'Security Officer',
      description: 'Sets security policy and oversees compliance posture organization-wide',
      contextAxis: 'Enterprise risk management with policy enforcement focus',
      postureAxis: 'Conservative; demands comprehensive audit trails and zero-tolerance for violations',
      channelAxis: 'Compliance dashboards, executive briefings, policy update notifications',
      behaviorImpact: 'Drives strictness of classification thresholds; influences exception approval workflow'
    },
    {
      id: 'onprem-up-analyst-cleared',
      label: 'Cleared Analyst',
      description: 'Conducts substantive analysis of classified materials with security clearance',
      contextAxis: 'Information access justified by clearance status',
      postureAxis: 'Seeks efficient access to needed documents; respects classification integrity',
      channelAxis: 'Document search, sensitivity labels, access request submissions',
      behaviorImpact: 'Shapes usability of document discovery; influences access request automation criteria'
    },
    {
      id: 'onprem-up-system-admin-onprem',
      label: 'On-Premises System Administrator',
      description: 'Manages infrastructure, access controls, and system-level security configurations',
      contextAxis: 'Operational security with infrastructure ownership',
      postureAxis: 'Detail-oriented on configuration consistency; responsible for enforcement mechanisms',
      channelAxis: 'System logs, access control lists, deployment configurations',
      behaviorImpact: 'Implements access control enforcement; drives authentication protocol requirements'
    },
    {
      id: 'onprem-up-compliance-auditor',
      label: 'Compliance Auditor',
      description: 'Validates adherence to regulatory requirements and internal policies',
      contextAxis: 'Regulatory alignment with evidence collection',
      postureAxis: 'Meticulous; requires comprehensive documented evidence of compliance',
      channelAxis: 'Audit reports, evidence collection tools, sampling methodologies',
      behaviorImpact: 'Shapes audit evidence requirements; influences report generation and data retention policies'
    },
    {
      id: 'onprem-up-intelligence-officer',
      label: 'Intelligence Officer',
      description: 'Analyzes classified intelligence and produces intelligence assessments',
      contextAxis: 'Intelligence tradecraft with source protection priority',
      postureAxis: 'Risk-aware on source disclosure; focused on actionable intelligence',
      channelAxis: 'Redacted summaries, source-protected analysis, compartmented briefings',
      behaviorImpact: 'Requires fine-grained redaction capabilities; influences cross-reference analysis safeguards'
    },
    {
      id: 'onprem-up-legal-counsel',
      label: 'Legal Counsel',
      description: 'Advises on legal compliance, discovery obligations, and regulatory requirements',
      contextAxis: 'Legal and regulatory obligations with liability minimization',
      postureAxis: 'Conservative on documentation; demands clear liability reduction evidence',
      channelAxis: 'Legal hold notifications, discovery requests, compliance certification memos',
      behaviorImpact: 'Influences legal hold policies and retention periods; shapes exception approval authority'
    }
  ],
  summaryText: 'The On-Premises Assistant protects classified information by automating document classification, compliance validation, and audit trail analysis within air-gapped environments. It leverages classified document repositories, security policies, compliance rule engines, and immutable audit ledgers to support security officers, cleared analysts, and compliance auditors in maintaining information security and regulatory compliance.'
}

export const MULTIMODAL_AGENT_DIMENSIONS: DimensionAnalysisPayload = {
  tileId: 'multimodal-agent',
  agentName: 'Multimodal Agent',
  taskDimensions: [
    {
      id: 'multimodal-task-video-transcription',
      label: 'Video Transcription',
      description: 'Extract speech-to-text with speaker identification, timestamps, and confidence scoring',
      parentTaskId: 'transcribe-media',
      intentCategories: ['transcription', 'speech-recognition', 'speaker-tracking'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-image-captioning',
      label: 'Image Captioning',
      description: 'Generate human-readable descriptions of visual content with object recognition and context',
      parentTaskId: 'transcribe-media',
      intentCategories: ['visual-understanding', 'accessibility', 'content-description'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-audio-extraction',
      label: 'Audio Extraction',
      description: 'Isolate and enhance audio tracks from multimedia with noise reduction and quality normalization',
      parentTaskId: 'transcribe-media',
      intentCategories: ['audio-processing', 'signal-enhancement', 'quality-assurance'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-cross-modal-synthesis',
      label: 'Cross-Modal Synthesis',
      description: 'Integrate insights from video, audio, and text to create cohesive understanding of content',
      parentTaskId: 'cross-modal-analysis',
      intentCategories: ['content-synthesis', 'semantic-integration', 'knowledge-extraction'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-visual-highlight-extraction',
      label: 'Visual Highlight Extraction',
      description: 'Identify and extract visually significant frames, diagrams, and graphics from video sequences',
      parentTaskId: 'cross-modal-analysis',
      intentCategories: ['keyframe-detection', 'visual-summarization', 'content-extraction'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-lesson-plan-generation',
      label: 'Lesson Plan Generation',
      description: 'Structure educational content into learning objectives, activities, and assessment components',
      parentTaskId: 'summarize-content',
      intentCategories: ['educational-design', 'content-organization', 'pedagogical-structuring'],
      confidence: 'medium'
    },
    {
      id: 'multimodal-task-accessibility-output',
      label: 'Accessibility Output',
      description: 'Generate alt-text, captions, transcripts, and accessible media formats for inclusive consumption',
      parentTaskId: 'transcribe-media',
      intentCategories: ['accessibility', 'inclusive-design', 'content-adaptation'],
      confidence: 'medium'
    },
    {
      id: 'multimodal-task-metadata-tagging',
      label: 'Metadata Tagging',
      description: 'Extract and assign structured metadata including keywords, topics, entities, and relationships',
      parentTaskId: 'summarize-content',
      intentCategories: ['metadata-enrichment', 'content-indexing', 'knowledge-organization'],
      confidence: 'medium'
    },
    {
      id: 'multimodal-task-temporal-analysis',
      label: 'Temporal Analysis',
      description: 'Track narrative progression, scene transitions, and topic shifts across media timeline',
      parentTaskId: 'cross-modal-analysis',
      intentCategories: ['timeline-tracking', 'narrative-structure', 'pacing-analysis'],
      confidence: 'medium'
    },
    {
      id: 'multimodal-task-format-conversion',
      label: 'Format Conversion',
      description: 'Transform media between formats while preserving fidelity and meeting platform requirements',
      parentTaskId: 'transcribe-media',
      intentCategories: ['format-adaptation', 'quality-preservation', 'platform-optimization'],
      confidence: 'low'
    }
  ],
  dataDimensions: [
    {
      id: 'multimodal-data-video-library',
      label: 'Video Library Archive',
      depthScore: 5,
      subTopics: [
        { name: 'Raw video files with codec and resolution metadata', depth: 5 },
        { name: 'Frame-by-frame visual analysis data', depth: 5 },
        { name: 'Scene detection and transition points', depth: 4 },
        { name: 'Compressed proxy files for efficient searching', depth: 3 }
      ],
      keyEntities: ['video_id', 'duration_seconds', 'resolution', 'codec', 'fps', 'bitrate', 'file_size_mb'],
      connectedDomains: ['video-processing', 'media-storage', 'content-management'],
      sourceAttribution: [
        { sourceId: 'video_library.tar.gz', sourceName: 'Archived Video Collection', count: '847 videos / 2.1TB' }
      ]
    },
    {
      id: 'multimodal-data-image-dataset',
      label: 'Image and Diagram Dataset',
      depthScore: 4,
      subTopics: [
        { name: 'High-resolution images with EXIF metadata', depth: 4 },
        { name: 'Extracted diagrams, charts, and infographics', depth: 4 },
        { name: 'Optical character recognition outputs', depth: 4 },
        { name: 'Visual feature vectors for similarity search', depth: 3 }
      ],
      keyEntities: ['image_id', 'image_type', 'resolution', 'color_space', 'ocr_text', 'dominant_colors', 'object_tags'],
      connectedDomains: ['computer-vision', 'image-analysis', 'visual-search'],
      sourceAttribution: [
        { sourceId: 'images_and_diagrams/', sourceName: 'Image and Diagram Repository', count: '12,400 images' }
      ]
    },
    {
      id: 'multimodal-data-audio-transcripts',
      label: 'Audio Transcripts Database',
      depthScore: 4,
      subTopics: [
        { name: 'Machine and human-verified transcripts', depth: 5 },
        { name: 'Speaker identification and diarization', depth: 4 },
        { name: 'Phonetic confidence scores and alternative hypotheses', depth: 3 },
        { name: 'Audio segment timing and alignment data', depth: 4 }
      ],
      keyEntities: ['transcript_id', 'speaker_name', 'start_time_ms', 'end_time_ms', 'text', 'confidence_score', 'language'],
      connectedDomains: ['speech-recognition', 'transcript-management', 'audio-processing'],
      sourceAttribution: [
        { sourceId: 'audio_transcripts.db', sourceName: 'Transcript Storage System', count: '8,924 transcripts' }
      ]
    },
    {
      id: 'multimodal-data-metadata-index',
      label: 'Media Metadata Index',
      depthScore: 3,
      subTopics: [
        { name: 'Aggregated media descriptors and summaries', depth: 4 },
        { name: 'Content keywords, tags, and topic assignments', depth: 3 },
        { name: 'Creator attribution and licensing information', depth: 3 },
        { name: 'Relationships and cross-references between media', depth: 3 }
      ],
      keyEntities: ['media_id', 'title', 'description', 'keywords', 'topics', 'creator', 'license_type', 'publication_date'],
      connectedDomains: ['metadata-management', 'content-discovery', 'knowledge-graphs'],
      sourceAttribution: [
        { sourceId: 'media_metadata.json', sourceName: 'Metadata Index File', count: '21,171 entries' }
      ]
    }
  ],
  userProfileDimensions: [
    {
      id: 'multimodal-up-content-creator',
      label: 'Content Creator',
      description: 'Produces multimedia content for educational, entertainment, or professional purposes',
      contextAxis: 'Creative expression with audience engagement maximization',
      postureAxis: 'Seeks efficiency in production pipeline; values quality feedback on visual presentation',
      channelAxis: 'Preview panels, format optimization suggestions, metadata templates',
      behaviorImpact: 'Drives demand for rapid transcription and accessibility features; influences output quality standards'
    },
    {
      id: 'multimodal-up-educator',
      label: 'Educator',
      description: 'Develops and delivers educational content and curricula to learners',
      contextAxis: 'Learning outcomes and student comprehension with accessibility priority',
      postureAxis: 'Pedagogically-focused; values structured lesson components and learner differentiation',
      channelAxis: 'Lesson structure templates, learning objective guidance, assessment question generation',
      behaviorImpact: 'Shapes lesson plan generation formats; drives demand for accessibility features and student engagement metrics'
    },
    {
      id: 'multimodal-up-multimedia-analyst',
      label: 'Multimedia Analyst',
      description: 'Conducts detailed analysis of visual and audio content for research or insights',
      contextAxis: 'Analytical rigor with comprehensive content coverage',
      postureAxis: 'Detail-oriented; requires granular data extraction and cross-modal correlation',
      channelAxis: 'Data export formats, temporal markers, entity relationship visualizations',
      behaviorImpact: 'Influences temporal analysis precision; drives demand for fine-grained extraction and cross-modal linking'
    },
    {
      id: 'multimodal-up-accessibility-specialist',
      label: 'Accessibility Specialist',
      description: 'Ensures media content is accessible to users with disabilities',
      contextAxis: 'Inclusive access with WCAG compliance assurance',
      postureAxis: 'Standards-driven; demands comprehensive alternative content and validation testing',
      channelAxis: 'Alt-text templates, caption quality reports, assistive technology compatibility checks',
      behaviorImpact: 'Shapes accessibility output specifications; ensures compliance with accessibility standards'
    },
    {
      id: 'multimodal-up-journalist',
      label: 'Journalist',
      description: 'Investigates and reports on topics using multimedia evidence and primary sources',
      contextAxis: 'Factual accuracy with source documentation and narrative impact',
      postureAxis: 'Verification-focused; prioritizes evidence extraction and timeline reconstruction',
      channelAxis: 'Transcript search, visual asset galleries, fact-check summaries',
      behaviorImpact: 'Drives need for precise transcription and source attribution; influences metadata enrichment requirements'
    },
    {
      id: 'multimodal-up-design-professional',
      label: 'Design Professional',
      description: 'Creates visual assets, interfaces, and design systems for digital products',
      contextAxis: 'Visual design excellence with usability assurance',
      postureAxis: 'Aesthetically-informed; seeks visual inspiration and design pattern extraction from media',
      channelAxis: 'Visual highlight galleries, color palette extraction, design system mappings',
      behaviorImpact: 'Shapes visual highlight extraction criteria; drives demand for design-focused metadata tagging'
    }
  ],
  summaryText: 'The Multimodal Agent unlocks insights from video, audio, images, and text by transcribing speech, captioning visuals, and synthesizing cross-modal understanding. It integrates video libraries, image datasets, audio transcripts, and metadata indexes to empower content creators, educators, accessibility specialists, and multimedia analysts in transforming raw media into structured, accessible, and discoverable knowledge.'
}

export const CONSUMER_CHAT_DIMENSIONS: DimensionAnalysisPayload = {
  tileId: 'consumer-chat',
  agentName: 'Consumer Chat Agent',
  taskDimensions: [
    {
      id: 'consumer-task-order-tracking',
      label: 'Order Tracking',
      description: 'Retrieve current order status, shipment location, delivery estimates, and proactive delay notifications',
      parentTaskId: 'track-orders',
      intentCategories: ['order-status', 'delivery-visibility', 'logistics-inquiry'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-product-recommendation',
      label: 'Product Recommendation',
      description: 'Suggest relevant products based on browsing history, purchase patterns, and preference vectors',
      parentTaskId: 'product-recommendation',
      intentCategories: ['personalization', 'upsell', 'discovery'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-return-processing',
      label: 'Return Processing',
      description: 'Execute return authorization, generate shipping labels, and process refunds with status tracking',
      parentTaskId: 'handle-returns',
      intentCategories: ['refund-management', 'reverse-logistics', 'customer-service'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-faq-answering',
      label: 'FAQ Answering',
      description: 'Retrieve and present relevant FAQs addressing common questions about policies, shipping, and products',
      parentTaskId: 'track-orders',
      intentCategories: ['self-service', 'knowledge-retrieval', 'support-automation'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-sentiment-detection',
      label: 'Sentiment Detection',
      description: 'Analyze customer tone and emotion in messages to identify escalation triggers and empathy requirements',
      parentTaskId: 'handle-returns',
      intentCategories: ['emotion-recognition', 'escalation-detection', 'service-quality'],
      confidence: 'medium'
    },
    {
      id: 'consumer-task-loyalty-program',
      label: 'Loyalty Program Management',
      description: 'Track reward points, redemption eligibility, tier status, and exclusive member benefits',
      parentTaskId: 'product-recommendation',
      intentCategories: ['loyalty-tracking', 'reward-optimization', 'member-benefits'],
      confidence: 'medium'
    },
    {
      id: 'consumer-task-upsell-opportunity',
      label: 'Upsell Opportunity Detection',
      description: 'Identify contextually relevant high-margin or complementary products to suggest based on conversation',
      parentTaskId: 'product-recommendation',
      intentCategories: ['revenue-optimization', 'cross-sell', 'offer-timing'],
      confidence: 'medium'
    },
    {
      id: 'consumer-task-complaint-handling',
      label: 'Complaint Handling',
      description: 'Document issues, escalate to specialist teams, and communicate resolution timelines to customers',
      parentTaskId: 'handle-returns',
      intentCategories: ['issue-resolution', 'escalation-management', 'customer-recovery'],
      confidence: 'medium'
    },
    {
      id: 'consumer-task-personalization',
      label: 'Personalization Engine',
      description: 'Customize recommendations, content, and offers based on individual user profile and preferences',
      parentTaskId: 'product-recommendation',
      intentCategories: ['personalization', 'preference-learning', 'behavioral-targeting'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-feedback-collection',
      label: 'Feedback Collection',
      description: 'Solicit, structure, and route product reviews and service feedback to appropriate teams',
      parentTaskId: 'track-orders',
      intentCategories: ['voice-of-customer', 'survey-collection', 'continuous-improvement'],
      confidence: 'low'
    }
  ],
  dataDimensions: [
    {
      id: 'consumer-data-user-profiles',
      label: 'User Profiles Database',
      depthScore: 5,
      subTopics: [
        { name: 'Account information and contact details', depth: 4 },
        { name: 'Purchase history and transaction records', depth: 5 },
        { name: 'Communication preferences and notification settings', depth: 3 },
        { name: 'Loyalty program membership and tier status', depth: 4 }
      ],
      keyEntities: ['user_id', 'account_email', 'phone', 'address', 'total_spend', 'lifetime_orders', 'member_tier', 'vip_status'],
      connectedDomains: ['customer-relationship-management', 'user-segmentation', 'retention-analytics'],
      sourceAttribution: [
        { sourceId: 'user_profiles.db', sourceName: 'Customer Database', count: '2.8M active users' }
      ]
    },
    {
      id: 'consumer-data-preference-vectors',
      label: 'Preference Vectors and Embeddings',
      depthScore: 4,
      subTopics: [
        { name: 'Learned user preference embeddings from browsing and purchase signals', depth: 5 },
        { name: 'Product affinity scores and category preferences', depth: 4 },
        { name: 'Price sensitivity and quality preference indicators', depth: 3 },
        { name: 'Seasonal and temporal preference patterns', depth: 3 }
      ],
      keyEntities: ['user_id', 'product_embedding', 'category_score', 'price_sensitivity', 'quality_preference', 'seasonality_factor'],
      connectedDomains: ['recommender-systems', 'machine-learning', 'behavioral-analytics'],
      sourceAttribution: [
        { sourceId: 'preference_vectors.bin', sourceName: 'ML Model Artifacts', count: '2.8M user vectors' }
      ]
    },
    {
      id: 'consumer-data-faq-catalog',
      label: 'FAQ Catalog',
      depthScore: 3,
      subTopics: [
        { name: 'Common questions organized by topic and product category', depth: 4 },
        { name: 'Curated answer content with links to policies', depth: 3 },
        { name: 'Related articles and escalation paths', depth: 3 },
        { name: 'Search keywords and topic tags', depth: 2 }
      ],
      keyEntities: ['faq_id', 'question', 'answer', 'category', 'keywords', 'related_faq_ids', 'escalation_path', 'view_count'],
      connectedDomains: ['knowledge-management', 'self-service-support', 'content-curation'],
      sourceAttribution: [
        { sourceId: 'faq_catalog.json', sourceName: 'FAQ Knowledge Base', count: '847 FAQs' }
      ]
    },
    {
      id: 'consumer-data-conversation-history',
      label: 'Conversation History Database',
      depthScore: 4,
      subTopics: [
        { name: 'Complete chat transcripts with timestamps and agent assignments', depth: 5 },
        { name: 'Sentiment and intent classification per message', depth: 4 },
        { name: 'Resolution outcomes and customer satisfaction scores', depth: 4 },
        { name: 'Extracted entities and issue categories', depth: 3 }
      ],
      keyEntities: ['conversation_id', 'user_id', 'timestamp', 'message_text', 'sentiment', 'intent', 'agent_id', 'resolution_status', 'csat_score'],
      connectedDomains: ['customer-service', 'experience-analytics', 'quality-monitoring'],
      sourceAttribution: [
        { sourceId: 'conversation_history.db', sourceName: 'Chat Database', count: '12.4M conversations / 3 years' }
      ],
      gapNote: 'Sentiment data currently available only for last 6 months; older conversations require batch reprocessing'
    }
  ],
  userProfileDimensions: [
    {
      id: 'consumer-up-consumer-user',
      label: 'Consumer User',
      description: 'Individual customer shopping for personal or household needs',
      contextAxis: 'Convenience and value maximization with minimal effort',
      postureAxis: 'Solution-seeking; prefers fast, straightforward answers; price-sensitive',
      channelAxis: 'Chat messages, product pages, order confirmation emails',
      behaviorImpact: 'Drives demand for quick issue resolution and self-service; influences response time expectations'
    },
    {
      id: 'consumer-up-repeat-customer',
      label: 'Repeat Customer',
      description: 'Loyal customer with established purchase patterns and brand affinity',
      contextAxis: 'Relationship continuity with preference recognition',
      postureAxis: 'Expects personalized recognition; values faster service; more forgiving of minor issues',
      channelAxis: 'Account dashboard, personalized recommendations, loyalty email campaigns',
      behaviorImpact: 'Shapes personalization requirements; influences loyalty program feature prioritization'
    },
    {
      id: 'consumer-up-customer-service-team',
      label: 'Customer Service Team',
      description: 'Support staff handling escalated issues and complex customer inquiries',
      contextAxis: 'Issue resolution with customer satisfaction and efficiency',
      postureAxis: 'Detail-oriented on facts; seeks clear evidence and customer context for decision-making',
      channelAxis: 'Support dashboard, customer history summaries, escalation queues',
      behaviorImpact: 'Shapes information display and escalation criteria; drives need for contextual customer data'
    },
    {
      id: 'consumer-up-vip-customer',
      label: 'VIP Customer',
      description: 'High-value customer with premium service expectations and relationship priority',
      contextAxis: 'White-glove service with proactive outreach and special treatment',
      postureAxis: 'Expects immediate attention and preferential handling; intolerant of standard service',
      channelAxis: 'Dedicated support phone line, priority chat queue, personalized offers',
      behaviorImpact: 'Drives demand for queue prioritization and personalized recommendations; influences service SLAs'
    },
    {
      id: 'consumer-up-product-specialist',
      label: 'Product Specialist',
      description: 'Subject matter expert on product lines responsible for knowledge dissemination',
      contextAxis: 'Product expertise with customer education and satisfaction',
      postureAxis: 'Detail-focused on product features and quality assurance; patient with customer education',
      channelAxis: 'FAQ updates, product recommendation training, quality feedback loops',
      behaviorImpact: 'Shapes product information quality; drives FAQ updates and recommendation accuracy'
    },
    {
      id: 'consumer-up-retention-specialist',
      label: 'Retention Specialist',
      description: 'Team member focused on reducing churn and increasing customer lifetime value',
      contextAxis: 'Customer value maximization with engagement and retention focus',
      postureAxis: 'Data-driven on retention triggers; proactive in outreach; focused on lifetime value',
      channelAxis: 'Customer segment analytics, churn risk alerts, personalized retention offers',
      behaviorImpact: 'Drives personalization and upsell opportunity detection; shapes loyalty program strategy'
    }
  ],
  summaryText: 'The Consumer Chat Agent delivers personalized shopping experiences by tracking orders, recommending products, processing returns, and answering questions in real-time conversations. It synthesizes user profiles, preference vectors, FAQ catalogs, and conversation history to help consumer users, repeat customers, VIP customers, and service teams transact efficiently and build lasting relationships.'
}
