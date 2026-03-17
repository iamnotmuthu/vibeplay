import type {
  DimensionAnalysisPayload,
  OutputDimension,
  ToolDimension,
  ToolState,
} from '@/store/agentTypes'

export const OPS_AGENT_DIMENSIONS: DimensionAnalysisPayload = {
  tileId: 'ops-agent',
  agentName: 'Shipment Disruption Manager',
  taskDimensions: [
    {
      id: 'ops-task-job-scheduling',
      label: 'Disruption Detection',
      description: 'Detect and classify shipment disruptions across carrier networks with severity scoring',
      parentTaskId: 'detect-disruption',
      intentCategories: ['detection', 'classification', 'severity-assessment'],
      confidence: 'high'
    },
    {
      id: 'ops-task-migration-planning',
      label: 'Route Optimization',
      description: 'Analyze disruption impact and sequence alternate routing workflows with validation checkpoints',
      parentTaskId: 'optimize-route',
      intentCategories: ['routing', 'impact-assessment', 'contingency-planning'],
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
  outputDimensions: [
    { id: 'ops-od-1', label: 'Job Schedule — Success + Direct + One-shot', description: 'Simple job schedule created with no dependencies', agentOutputId: 'ops-out-schedule', agentOutputLabel: 'Job Schedule', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
    { id: 'ops-od-2', label: 'Job Schedule — Success + Cross-referenced + One-shot', description: 'Complex job DAG with dependency resolution and priority queuing', agentOutputId: 'ops-out-schedule', agentOutputLabel: 'Job Schedule', outcome: 'success', complexity: 'cross-referenced', interaction: 'one-shot' },
    { id: 'ops-od-3', label: 'Job Schedule — Success + Inferred + Conversational', description: 'Optimized schedule based on historical performance data', agentOutputId: 'ops-out-schedule', agentOutputLabel: 'Job Schedule', outcome: 'success', complexity: 'inferred', interaction: 'conversational' },
    { id: 'ops-od-4', label: 'Migration Plan — Success + Cross-referenced + Conversational', description: 'Multi-stage migration plan with rollback procedures', agentOutputId: 'ops-out-migration', agentOutputLabel: 'Migration Plan', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
    { id: 'ops-od-5', label: 'Migration Plan — Partial + Cross-referenced + Conversational', description: 'Migration plan with outstanding compatibility issues', agentOutputId: 'ops-out-migration', agentOutputLabel: 'Migration Plan', outcome: 'partial', complexity: 'cross-referenced', interaction: 'conversational' },
    { id: 'ops-od-6', label: 'Execution Report — Success + Direct + One-shot', description: 'Execution metrics and status summary for completed job', agentOutputId: 'ops-out-report', agentOutputLabel: 'Execution Report', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
    { id: 'ops-od-7', label: 'Execution Report — Success + Cross-referenced + Conversational', description: 'Detailed post-mortem with performance analysis and recommendations', agentOutputId: 'ops-out-report', agentOutputLabel: 'Execution Report', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
    { id: 'ops-od-8', label: 'Escalation — Escalation + Direct + One-shot', description: 'Job failure requiring manual intervention', agentOutputId: 'ops-out-escalation', agentOutputLabel: 'Escalation Handoff', outcome: 'escalation', complexity: 'direct', interaction: 'one-shot' },
    { id: 'ops-od-9', label: 'Escalation — Escalation + Cross-referenced + Conversational', description: 'Data corruption or SLA breach requiring specialist investigation', agentOutputId: 'ops-out-escalation', agentOutputLabel: 'Escalation Handoff', outcome: 'escalation', complexity: 'cross-referenced', interaction: 'conversational' },
  ],
  toolDimensions: [
    { id: 'ops-tooldim-scheduler', toolId: 'job-scheduler', toolName: 'Job Scheduler', states: [
      { id: 'ops-ts-sched-create-success', label: 'Job Created', operation: 'create', outcome: 'success', description: 'Job successfully submitted to scheduler' },
      { id: 'ops-ts-sched-create-failure', label: 'Job Creation Failed', operation: 'create', outcome: 'failure', description: 'Job submission rejected — dependency or validation error' },
      { id: 'ops-ts-sched-read-success', label: 'Status Fetch Success', operation: 'read', outcome: 'success', description: 'Job status retrieved successfully' },
    ] },
    { id: 'ops-tooldim-validator', toolId: 'data-validator', toolName: 'Data Validator', states: [
      { id: 'ops-ts-val-read-success', label: 'Validation Success', operation: 'read', outcome: 'success', description: 'Data validation passed all quality checks' },
      { id: 'ops-ts-val-read-failure', label: 'Validation Failure', operation: 'read', outcome: 'failure', description: 'Data validation detected anomalies or missing fields' },
      { id: 'ops-ts-val-read-timeout', label: 'Validation Timeout', operation: 'read', outcome: 'timeout', description: 'Large dataset validation exceeded time threshold' },
    ] },
    { id: 'ops-tooldim-monitor', toolId: 'progress-monitor', toolName: 'Progress Monitor', states: [
      { id: 'ops-ts-mon-read-success', label: 'Monitoring Success', operation: 'read', outcome: 'success', description: 'Job progress monitored without issues' },
      { id: 'ops-ts-mon-read-failure', label: 'Monitoring Failure', operation: 'read', outcome: 'failure', description: 'Unable to retrieve progress metrics' },
    ] },
  ],
  summaryText: 'The Shipment Disruption Manager detects and responds to shipment disruptions by analyzing carrier data, detecting anomalies, and optimizing rerouting across supply networks. It synthesizes tracking events, carrier status, route metadata, and historical patterns to support logistics managers and operations teams in maintaining on-time delivery and minimizing customer impact. 9 response dimensions across 4 core outputs. 3 tools with 9 state transitions.'
}

export const ONPREM_ASSISTANT_DIMENSIONS: DimensionAnalysisPayload = {
  tileId: 'onprem-assistant',
  agentName: 'Predictive Maintenance Agent',
  taskDimensions: [
    {
      id: 'onprem-task-sensor-anomaly-detection',
      label: 'Sensor Anomaly Detection',
      description: 'Real-time LSTM-based detection of abnormal vibration, temperature, and motor current patterns',
      parentTaskId: 'sensor-anomaly-detection',
      intentCategories: ['anomaly-detection', 'signal-processing', 'time-series-analysis'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-failure-prediction',
      label: 'Equipment Failure Prediction',
      description: 'Random forest model predicting bearing wear, motor degradation, and component failures within 7-day window',
      parentTaskId: 'failure-prediction',
      intentCategories: ['predictive-analytics', 'risk-assessment', 'failure-forecasting'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-work-order-generation',
      label: 'Work Order Generation',
      description: 'Auto-create maintenance work orders with task descriptions, spare parts lists, estimated duration, and skill requirements',
      parentTaskId: 'maintenance-scheduling',
      intentCategories: ['task-generation', 'workflow-automation', 'resource-planning'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-spare-parts-inventory-check',
      label: 'Spare Parts Inventory Check',
      description: 'Verify spare part availability, trigger reorders for critical shortage, and flag items with long lead times',
      parentTaskId: 'maintenance-scheduling',
      intentCategories: ['inventory-management', 'supply-chain', 'procurement-planning'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-maintenance-scheduling',
      label: 'Maintenance Scheduling',
      description: 'Schedule preventive maintenance within available maintenance windows and route work orders to technicians',
      parentTaskId: 'maintenance-scheduling',
      intentCategories: ['scheduling', 'resource-allocation', 'workforce-optimization'],
      confidence: 'medium'
    },
    {
      id: 'onprem-task-alert-notification',
      label: 'Alert & Notification',
      description: 'Send real-time alerts via SMS/email/dashboard for critical equipment failures and escalate to plant engineer',
      parentTaskId: 'failure-prediction',
      intentCategories: ['alerting', 'escalation', 'incident-notification'],
      confidence: 'high'
    },
    {
      id: 'onprem-task-health-scoring',
      label: 'Equipment Health Scoring',
      description: 'Calculate equipment health index (1-100) based on recent anomalies, failure predictions, and maintenance history',
      parentTaskId: 'failure-prediction',
      intentCategories: ['scoring', 'health-assessment', 'risk-prioritization'],
      confidence: 'medium'
    },
    {
      id: 'onprem-task-oee-calculation',
      label: 'OEE & MTBF Calculation',
      description: 'Track Overall Equipment Effectiveness (OEE) and Mean Time Between Failures (MTBF) trends across equipment fleet',
      parentTaskId: 'failure-prediction',
      intentCategories: ['performance-metrics', 'trend-analysis', 'kpi-tracking'],
      confidence: 'medium'
    },
    {
      id: 'onprem-task-downtime-impact-analysis',
      label: 'Downtime Cost Analysis',
      description: 'Calculate cost impact of unplanned equipment downtime and quantify cost avoidance from preventive maintenance',
      parentTaskId: 'maintenance-scheduling',
      intentCategories: ['cost-analysis', 'roi-calculation', 'business-impact'],
      confidence: 'medium'
    },
    {
      id: 'onprem-task-dashboard-update',
      label: 'Dashboard & Analytics Update',
      description: 'Update equipment health dashboard, OEE trends, maintenance queue, and predictive metrics for technician visibility',
      parentTaskId: 'failure-prediction',
      intentCategories: ['visualization', 'real-time-analytics', 'operational-visibility'],
      confidence: 'low'
    }
  ],
  dataDimensions: [
    {
      id: 'onprem-data-sensor-streams',
      label: 'Real-Time Equipment Sensor Streams',
      depthScore: 5,
      subTopics: [
        { name: 'Vibration data (1000 Hz sampling)', depth: 5 },
        { name: 'Temperature and pressure readings', depth: 4 },
        { name: 'Motor current signature analysis', depth: 4 },
        { name: 'Time-series correlation and anomaly signals', depth: 5 }
      ],
      keyEntities: ['equipment_id', 'sensor_type', 'timestamp_utc', 'reading_value', 'unit', 'status_flag', 'anomaly_score'],
      connectedDomains: ['time-series-data', 'iot-telemetry', 'condition-monitoring'],
      sourceAttribution: [
        { sourceId: 'mqtt_sensor_streams', sourceName: 'Edge Gateway MQTT Broker', count: '48 TB rolling buffer' }
      ]
    },
    {
      id: 'onprem-data-maintenance-history',
      label: 'Maintenance History & Failure Database',
      depthScore: 5,
      subTopics: [
        { name: 'Equipment failure records with root causes', depth: 5 },
        { name: 'Component replacements and repair costs', depth: 4 },
        { name: 'MTBF and failure trend analysis', depth: 4 },
        { name: 'Correlation between sensor patterns and failures', depth: 5 }
      ],
      keyEntities: ['maintenance_id', 'equipment_id', 'failure_type', 'component_failed', 'repair_duration_hours', 'spare_parts_used', 'cost_total', 'root_cause_code'],
      connectedDomains: ['failure-analysis', 'predictive-maintenance', 'cost-optimization'],
      sourceAttribution: [
        { sourceId: 'maintenance_history.db', sourceName: 'Maintenance Records Database', count: '42,000 records (8 years)' }
      ]
    },
    {
      id: 'onprem-data-spare-parts',
      label: 'Spare Parts Inventory & Supply Chain',
      depthScore: 4,
      subTopics: [
        { name: 'Current stock levels and reorder points', depth: 4 },
        { name: 'Supplier lead times and availability', depth: 3 },
        { name: 'Part compatibility with equipment types', depth: 3 },
        { name: 'Cost and criticality rankings', depth: 3 }
      ],
      keyEntities: ['part_id', 'part_name', 'current_stock', 'reorder_point', 'lead_time_days', 'supplier_id', 'cost_per_unit', 'criticality_level'],
      connectedDomains: ['inventory-management', 'supply-chain', 'procurement-planning'],
      sourceAttribution: [
        { sourceId: 'spare_parts_inventory.db', sourceName: 'Inventory Management System', count: '1,200 part types' }
      ]
    },
    {
      id: 'onprem-data-equipment-specs',
      label: 'Equipment Specifications & Manuals',
      depthScore: 4,
      subTopics: [
        { name: 'Operating parameter ranges and thresholds', depth: 4 },
        { name: 'Bearing wear progression curves', depth: 4 },
        { name: 'Maintenance schedules and alarm settings', depth: 3 },
        { name: 'Component inter-dependencies and failure cascades', depth: 3 }
      ],
      keyEntities: ['equipment_id', 'equipment_type', 'vibration_threshold_mm_s', 'temp_limit_c', 'bearing_life_hours', 'maintenance_interval_hours', 'manufacturer', 'model_year'],
      connectedDomains: ['equipment-data', 'technical-specifications', 'reference-knowledge'],
      sourceAttribution: [
        { sourceId: 'equipment_specs_and_manuals.pdf', sourceName: 'Manufacturer Documentation', count: '287 equipment files' }
      ],
      gapNote: 'Thresholds are equipment-specific; generic default values may not apply to all equipment types'
    }
  ],
  userProfileDimensions: [
    {
      id: 'onprem-up-maintenance-technician',
      label: 'Maintenance Technician',
      description: 'Executes preventive and corrective maintenance tasks on factory equipment',
      contextAxis: 'Operational maintenance with skill-based task assignment',
      postureAxis: 'Action-oriented; needs clear work instructions and spare parts availability',
      channelAxis: 'Work orders, maintenance alerts, equipment manuals, parts lookup',
      behaviorImpact: 'Influences work order clarity and parts-on-hand requirements; drives task scheduling'
    },
    {
      id: 'onprem-up-plant-engineer',
      label: 'Plant Engineer',
      description: 'Oversees equipment health, approves preventive maintenance schedules, optimizes OEE',
      contextAxis: 'Equipment engineering with optimization focus',
      postureAxis: 'Data-driven; wants predictive insights and cost-benefit analysis',
      channelAxis: 'Health dashboards, trend analysis, OEE reports, failure predictions',
      behaviorImpact: 'Shapes prediction confidence thresholds; influences scheduling and escalation criteria'
    },
    {
      id: 'onprem-up-reliability-manager',
      label: 'Reliability Manager',
      description: 'Manages plant-wide maintenance strategy, budgets, and downtime reduction',
      contextAxis: 'Strategic reliability with business impact focus',
      postureAxis: 'ROI-focused; balances maintenance costs against downtime risk',
      channelAxis: 'Strategic dashboards, cost reports, MTBF trends, budget forecasts',
      behaviorImpact: 'Drives capital allocation and maintenance strategy; influences alert severity levels'
    },
    {
      id: 'onprem-up-operations-director',
      label: 'Operations Director',
      description: 'Responsible for plant production targets and overall uptime SLAs',
      contextAxis: 'Production scheduling with reliability requirements',
      postureAxis: 'Availability-critical; needs visibility into predictable maintenance windows',
      channelAxis: 'Executive dashboards, downtime impact reports, maintenance calendars',
      behaviorImpact: 'Shapes maintenance window constraints; influences scheduling and escalation SLAs'
    },
    {
      id: 'onprem-up-supply-chain-manager',
      label: 'Supply Chain Manager',
      description: 'Optimizes spare parts inventory and supplier relationships',
      contextAxis: 'Supply chain optimization with cost minimization',
      postureAxis: 'Inventory-aware; balances stock-outs against excess inventory costs',
      channelAxis: 'Inventory forecasts, demand signals, reorder recommendations, supplier performance',
      behaviorImpact: 'Influences reorder thresholds and lead-time buffers; shapes parts forecasting'
    }
  ],
  outputDimensions: [
    { id: 'onprem-od-1', label: 'Anomaly Alert — Success + Direct + One-shot', description: 'Anomaly detected in real-time equipment sensor data', agentOutputId: 'onprem-out-anomaly-alert', agentOutputLabel: 'Anomaly Alert', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
    { id: 'onprem-od-2', label: 'Failure Prediction — Success + Inferred + One-shot', description: 'Equipment failure predicted within 7-day window with component-level breakdown', agentOutputId: 'onprem-out-failure-prediction', agentOutputLabel: 'Failure Prediction', outcome: 'success', complexity: 'inferred', interaction: 'one-shot' },
    { id: 'onprem-od-3', label: 'Work Order — Success + Cross-referenced + One-shot', description: 'Automated work order generated with task routing and spare parts checklist', agentOutputId: 'onprem-out-work-order', agentOutputLabel: 'Work Order', outcome: 'success', complexity: 'cross-referenced', interaction: 'one-shot' },
    { id: 'onprem-od-4', label: 'Inventory Forecast — Success + Inferred + Conversational', description: 'Spare parts inventory forecast with reorder triggers and lead-time buffers', agentOutputId: 'onprem-out-inventory-forecast', agentOutputLabel: 'Inventory Forecast', outcome: 'success', complexity: 'inferred', interaction: 'conversational' },
    { id: 'onprem-od-5', label: 'Health Dashboard — Success + Cross-referenced + Conversational', description: 'Real-time equipment health dashboard with OEE and MTBF trend analysis', agentOutputId: 'onprem-out-health-dashboard', agentOutputLabel: 'Health Dashboard', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
    { id: 'onprem-od-6', label: 'Prediction Uncertain — Partial + Inferred + Conversational', description: 'Prediction confidence below threshold — requires manual engineer review', agentOutputId: 'onprem-out-failure-prediction', agentOutputLabel: 'Failure Prediction', outcome: 'partial', complexity: 'inferred', interaction: 'conversational' },
    { id: 'onprem-od-7', label: 'Maintenance Scheduling — Success + Cross-referenced + One-shot', description: 'Preventive maintenance scheduled within available production windows', agentOutputId: 'onprem-out-maintenance-schedule', agentOutputLabel: 'Maintenance Schedule', outcome: 'success', complexity: 'cross-referenced', interaction: 'one-shot' },
    { id: 'onprem-od-8', label: 'Downtime Impact — Success + Inferred + One-shot', description: 'Cost analysis of unplanned downtime and maintenance ROI calculation', agentOutputId: 'onprem-out-downtime-impact', agentOutputLabel: 'Downtime Impact', outcome: 'success', complexity: 'inferred', interaction: 'one-shot' },
    { id: 'onprem-od-9', label: 'Escalation Alert — Escalation + Direct + One-shot', description: 'Critical equipment health issue escalated to reliability manager', agentOutputId: 'onprem-out-escalation', agentOutputLabel: 'Escalation Alert', outcome: 'escalation', complexity: 'direct', interaction: 'one-shot' },
  ],
  toolDimensions: [
    { id: 'onprem-tooldim-anomaly-detector', toolId: 'sensor-anomaly-detector', toolName: 'Sensor Anomaly Detector', states: [
      { id: 'onprem-ts-sad-read-success', label: 'Anomaly Detected', operation: 'read', outcome: 'success', description: 'Real-time sensor data analyzed; anomaly confirmed with LSTM confidence score' },
      { id: 'onprem-ts-sad-read-failure', label: 'Anomaly Detection Failed', operation: 'read', outcome: 'failure', description: 'Sensor data unavailable or model inference error' },
    ] },
    { id: 'onprem-tooldim-predictor', toolId: 'failure-predictor', toolName: 'Failure Predictor', states: [
      { id: 'onprem-ts-fp-read-success', label: 'Prediction Success', operation: 'read', outcome: 'success', description: 'Failure predicted; component type, failure window, and confidence score returned' },
      { id: 'onprem-ts-fp-read-failure', label: 'Prediction Failed', operation: 'read', outcome: 'failure', description: 'Insufficient historical data or random forest model error' },
    ] },
    { id: 'onprem-tooldim-scheduler', toolId: 'maintenance-scheduler', toolName: 'Maintenance Scheduler', states: [
      { id: 'onprem-ts-ms-read-success', label: 'Schedule Lookup Success', operation: 'read', outcome: 'success', description: 'Available maintenance windows retrieved' },
      { id: 'onprem-ts-ms-create-success', label: 'Schedule Created', operation: 'create', outcome: 'success', description: 'Preventive maintenance task scheduled and assigned to technician' },
      { id: 'onprem-ts-ms-create-failure', label: 'Scheduling Failed', operation: 'create', outcome: 'failure', description: 'No available maintenance window or technician availability conflict' },
    ] },
  ],
  summaryText: 'The Predictive Maintenance Agent monitors 287 equipment units in real-time, detects sensor anomalies via LSTM analysis (89% accuracy), predicts bearing wear and motor failures within 7 days, auto-generates work orders with spare parts optimization, and schedules preventive maintenance within production constraints. Supports 6 user roles including maintenance technicians, plant engineers, and supply chain managers. 9 response dimensions across 5 core outputs. 3 tools with 8 state transitions.'
}

export const MULTIMODAL_AGENT_DIMENSIONS: DimensionAnalysisPayload = {
  tileId: 'multimodal-agent',
  agentName: 'Content Moderation Agent',
  taskDimensions: [
    {
      id: 'multimodal-task-text-classification',
      label: 'Text Classification',
      description: 'Classify flagged text content for hate speech, toxicity, misinformation, and policy violations',
      parentTaskId: 'content-classification',
      intentCategories: ['toxicity-detection', 'hate-speech-detection', 'misinformation-detection'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-image-analysis',
      label: 'Image Analysis',
      description: 'Analyze images for NSFW content, violence, CSAM hash matching, and policy compliance',
      parentTaskId: 'content-classification',
      intentCategories: ['image-classification', 'safety-detection', 'hash-matching'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-audio-processing',
      label: 'Audio Processing',
      description: 'Transcribe audio, classify transcribed text for policy violations and harmful content',
      parentTaskId: 'content-classification',
      intentCategories: ['speech-to-text', 'audio-classification', 'content-moderation'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-video-classification',
      label: 'Video Classification',
      description: 'Process video frames and audio tracks; aggregate classifications for policy decision',
      parentTaskId: 'content-classification',
      intentCategories: ['video-analysis', 'frame-sampling', 'multi-modal-aggregation'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-policy-matching',
      label: 'Policy Matching',
      description: 'Match content violations against platform policies with severity scoring and confidence levels',
      parentTaskId: 'policy-matching',
      intentCategories: ['policy-enforcement', 'rule-matching', 'severity-assessment'],
      confidence: 'high'
    },
    {
      id: 'multimodal-task-action-decision',
      label: 'Action Decision',
      description: 'Route content to auto-removal, human review, or appeals based on confidence and severity thresholds',
      parentTaskId: 'moderation-action',
      intentCategories: ['decision-routing', 'threshold-application', 'workflow-orchestration'],
      confidence: 'medium'
    },
    {
      id: 'multimodal-task-appeal-handling',
      label: 'Appeal Handling',
      description: 'Review user appeals of moderation decisions with <24h SLA and escalation paths',
      parentTaskId: 'appeals-processing',
      intentCategories: ['appeals-management', 'reconsideration', 'user-support'],
      confidence: 'medium'
    },
    {
      id: 'multimodal-task-reporter-feedback',
      label: 'Reporter Trust Feedback',
      description: 'Track reporter reliability scores and adjust content prioritization based on historical accuracy',
      parentTaskId: 'quality-monitoring',
      intentCategories: ['reporter-ranking', 'reliability-scoring', 'prioritization-adjustment'],
      confidence: 'medium'
    },
    {
      id: 'multimodal-task-quality-monitoring',
      label: 'Quality Monitoring',
      description: 'Audit moderation decisions, flag inconsistencies, and measure false positive rates',
      parentTaskId: 'quality-monitoring',
      intentCategories: ['quality-assurance', 'audit-trails', 'metric-tracking'],
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
      id: 'multimodal-data-flagged-content-queue',
      label: 'Flagged Content Queue',
      depthScore: 5,
      subTopics: [
        { name: 'User-reported content with report reasons and timestamps', depth: 5 },
        { name: 'Automated detection flags from client-side filters', depth: 5 },
        { name: 'Bulk uploads and batch files requiring moderation', depth: 4 },
        { name: 'Content priority queue with SLA tiers', depth: 4 }
      ],
      keyEntities: ['content_id', 'content_type', 'reporter_id', 'report_reason', 'timestamp', 'priority', 'sla_minutes'],
      connectedDomains: ['content-intake', 'queue-management', 'triage-systems'],
      sourceAttribution: [
        { sourceId: 'content_queue.kafka', sourceName: 'Real-time Content Queue', count: '8,000-50,000 flags/day' }
      ]
    },
    {
      id: 'multimodal-data-policy-rulebook',
      label: 'Platform Policy Rulebook',
      depthScore: 4,
      subTopics: [
        { name: 'Hate speech, violence, and harassment definitions', depth: 4 },
        { name: 'CSAM, adult content, and unsafe material policies', depth: 4 },
        { name: 'Misinformation and false information frameworks', depth: 4 },
        { name: 'Jurisdiction-specific rules (GDPR/DSA/NetzDG/etc)', depth: 4 }
      ],
      keyEntities: ['policy_id', 'policy_category', 'violation_severity', 'allowed_appeals', 'appeal_window_hours', 'jurisdiction'],
      connectedDomains: ['policy-management', 'legal-compliance', 'safety-frameworks'],
      sourceAttribution: [
        { sourceId: 'policies/global_rulebook.json', sourceName: 'Global Policy Rulebook', count: '47 policy categories' }
      ]
    },
    {
      id: 'multimodal-data-moderation-decisions',
      label: 'Historical Moderation Decisions',
      depthScore: 4,
      subTopics: [
        { name: 'Past decisions (removed/kept/appealed/escalated)', depth: 5 },
        { name: 'Moderator rationales and confidence levels', depth: 4 },
        { name: 'Appeal outcomes and reversal patterns', depth: 4 },
        { name: 'False positive rates by content type and policy', depth: 3 }
      ],
      keyEntities: ['decision_id', 'policy_violated', 'action_taken', 'moderator_confidence', 'appeal_status', 'resolution'],
      connectedDomains: ['decision-history', 'quality-metrics', 'appeals-tracking'],
      sourceAttribution: [
        { sourceId: 'decisions.db', sourceName: 'Decision History Database', count: '2.4M decisions' }
      ]
    },
    {
      id: 'multimodal-data-reporter-trust-index',
      label: 'Reporter Trust & Reliability Index',
      depthScore: 3,
      subTopics: [
        { name: 'Reporter accuracy rates and historical performance', depth: 4 },
        { name: 'Verified reporter credentials and badges', depth: 3 },
        { name: 'Reporter abuse patterns and malicious flagging', depth: 3 },
        { name: 'Calibrated trust scores for prioritization', depth: 3 }
      ],
      keyEntities: ['reporter_id', 'accuracy_rate', 'verified_status', 'trust_score', 'flag_count', 'appeal_reversal_rate'],
      connectedDomains: ['reporter-management', 'trust-systems', 'quality-assurance'],
      sourceAttribution: [
        { sourceId: 'media_metadata.json', sourceName: 'Metadata Index File', count: '21,171 entries' }
      ]
    }
  ],
  userProfileDimensions: [
    {
      id: 'multimodal-up-content-moderator',
      label: 'Content Moderator',
      description: 'Reviews and decides on flagged content violations at scale',
      contextAxis: 'Safety enforcement with consistency and speed',
      postureAxis: 'Efficiency-focused; needs clear policy guidance and confidence metrics',
      channelAxis: 'Moderation queue, policy summaries, decision templates, appeal workflows',
      behaviorImpact: 'Drives decision clarity thresholds; influences appeals SLAs and escalation routing'
    },
    {
      id: 'multimodal-up-trust-safety-manager',
      label: 'Trust & Safety Manager',
      description: 'Oversees platform safety operations and moderation strategy',
      contextAxis: 'Platform integrity with compliance and user protection',
      postureAxis: 'Data-driven; demands metrics, trends, and ROI on moderation investments',
      channelAxis: 'Safety dashboards, trend reports, false positive analysis, policy effectiveness metrics',
      behaviorImpact: 'Shapes policy adjustments and resource allocation; influences threshold tuning'
    },
    {
      id: 'multimodal-up-legal-specialist',
      label: 'Legal & Compliance Specialist',
      description: 'Ensures moderation decisions comply with jurisdiction laws and regulations',
      contextAxis: 'Legal compliance with liability minimization',
      postureAxis: 'Conservative; demands audit trails and evidence for all escalations',
      channelAxis: 'Compliance flags, legal hold notifications, jurisdiction routing, appeal documentation',
      behaviorImpact: 'Influences jurisdiction-specific rule enforcement; shapes escalation documentation requirements'
    },
    {
      id: 'multimodal-up-appeals-specialist',
      label: 'Appeals Specialist',
      description: 'Reviews user appeals and makes reconsideration decisions',
      contextAxis: 'Appeal fairness with user satisfaction',
      postureAxis: 'Detail-focused; values full context and precedent cases for decisions',
      channelAxis: 'Appeal queue, decision history, policy interpretations, precedent cases',
      behaviorImpact: 'Influences appeal criteria and reversal precedents; shapes reconsideration SLAs'
    },
    {
      id: 'multimodal-up-community-liaison',
      label: 'Community Liaison',
      description: 'Communicates moderation policies and decisions to user communities',
      contextAxis: 'Community trust with transparency on enforcement',
      postureAxis: 'Communication-focused; emphasizes clarity in policy explanations',
      channelAxis: 'Policy summaries, removal notifications, transparency reports, community FAQs',
      behaviorImpact: 'Shapes explanation clarity; influences appeals transparency and community confidence'
    },
    {
      id: 'multimodal-up-ai-ops-engineer',
      label: 'AI/Ops Engineer',
      description: 'Monitors and improves AI moderation models and automation workflows',
      contextAxis: 'AI quality with operational efficiency',
      postureAxis: 'Metrics-driven; focuses on false positive reduction and throughput optimization',
      channelAxis: 'Model performance dashboards, error analysis, automation coverage reports',
      behaviorImpact: 'Influences confidence thresholds and auto-removal criteria; shapes model retraining'
    }
  ],
  outputDimensions: [
    { id: 'multimodal-od-1', label: 'Moderation Decision — Success + Direct + One-shot', description: 'Content reviewed and decision rendered (remove/keep/escalate)', agentOutputId: 'multimodal-out-moderation-decision', agentOutputLabel: 'Moderation Decision', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
    { id: 'multimodal-od-2', label: 'Moderation Decision — Success + Inferred + One-shot', description: 'Multi-modal content analyzed; high-confidence removal or approval', agentOutputId: 'multimodal-out-moderation-decision', agentOutputLabel: 'Moderation Decision', outcome: 'success', complexity: 'inferred', interaction: 'one-shot' },
    { id: 'multimodal-od-3', label: 'Escalation Summary — Success + Cross-referenced + Conversational', description: 'Ambiguous case escalated to human moderator with evidence dossier', agentOutputId: 'multimodal-out-escalation-summary', agentOutputLabel: 'Escalation Summary', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
    { id: 'multimodal-od-4', label: 'Appeal Outcome — Success + Direct + Conversational', description: 'User appeal reviewed and decision rendered with explanation', agentOutputId: 'multimodal-out-appeal-outcome', agentOutputLabel: 'Appeal Outcome', outcome: 'success', complexity: 'direct', interaction: 'conversational' },
    { id: 'multimodal-od-5', label: 'Appeal Outcome — Partial + Inferred + Conversational', description: 'Appeal requires further investigation or policy consultation', agentOutputId: 'multimodal-out-appeal-outcome', agentOutputLabel: 'Appeal Outcome', outcome: 'partial', complexity: 'inferred', interaction: 'conversational' },
    { id: 'multimodal-od-6', label: 'Trend Report — Success + Cross-referenced + One-shot', description: 'Policy violation trends and emerging violation patterns identified', agentOutputId: 'multimodal-out-trend-report', agentOutputLabel: 'Trend Report', outcome: 'success', complexity: 'cross-referenced', interaction: 'one-shot' },
    { id: 'multimodal-od-7', label: 'Quality Audit — Success + Inferred + Conversational', description: 'False positive and enforcement consistency audit completed', agentOutputId: 'multimodal-out-quality-audit', agentOutputLabel: 'Quality Audit', outcome: 'success', complexity: 'inferred', interaction: 'conversational' },
    { id: 'multimodal-od-8', label: 'Escalation Alert — Escalation + Direct + One-shot', description: 'Critical harmful content or policy edge case requiring legal review', agentOutputId: 'multimodal-out-escalation', agentOutputLabel: 'Escalation Alert', outcome: 'escalation', complexity: 'direct', interaction: 'one-shot' },
  ],
  toolDimensions: [
    { id: 'multimodal-tooldim-text-classifier', toolId: 'text-classifier', toolName: 'Text Classifier', states: [
      { id: 'multimodal-ts-tc-read-success', label: 'Text Classification Success', operation: 'read', outcome: 'success', description: 'Text analyzed for toxicity, hate speech, misinformation with confidence scores' },
      { id: 'multimodal-ts-tc-read-failure', label: 'Text Classification Failed', operation: 'read', outcome: 'failure', description: 'Unsupported language or model inference error' },
    ] },
    { id: 'multimodal-tooldim-image-analyzer', toolId: 'image-analyzer', toolName: 'Image Analyzer', states: [
      { id: 'multimodal-ts-ia-read-success', label: 'Image Analysis Success', operation: 'read', outcome: 'success', description: 'Image analyzed for NSFW, violence, and CSAM hash matching' },
      { id: 'multimodal-ts-ia-read-failure', label: 'Image Analysis Failed', operation: 'read', outcome: 'failure', description: 'Image too degraded or unsupported format' },
    ] },
    { id: 'multimodal-tooldim-policy-matcher', toolId: 'policy-matcher', toolName: 'Policy Matcher', states: [
      { id: 'multimodal-ts-pm-read-success', label: 'Policy Matching Success', operation: 'read', outcome: 'success', description: 'Violations matched against policies with severity scoring' },
      { id: 'multimodal-ts-pm-read-failure', label: 'Policy Matching Failed', operation: 'read', outcome: 'failure', description: 'Policy database unavailable or configuration error' },
      { id: 'multimodal-ts-pm-create-success', label: 'Decision Logged', operation: 'create', outcome: 'success', description: 'Moderation decision recorded with audit trail' },
    ] },
  ],
  summaryText: 'The Content Moderation Agent reviews 8,000-50,000 flagged items daily, classifies policy violations across text/image/audio/video, matches violations against jurisdiction-specific policies, auto-removes high-confidence violations (<3% false positive rate), escalates ambiguous cases to human moderators (<24h SLA), and handles user appeals. Supports 6 roles including content moderators, legal specialists, and appeals specialists. 8 response dimensions across 5 core outputs. 3 tools with 8 state transitions.'
}

export const CONSUMER_CHAT_DIMENSIONS: DimensionAnalysisPayload = {
  tileId: 'consumer-chat',
  agentName: 'Employee Support Agent',
  taskDimensions: [
    {
      id: 'consumer-task-policy-lookup',
      label: 'Policy Question Answering',
      description: 'Search employee handbook and answer questions about company policies, benefits, and compliance with state laws',
      parentTaskId: 'answer-policy-question',
      intentCategories: ['policy-lookup', 'compliance-verification', 'handbook-search'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-pto-request',
      label: 'PTO Request Processing',
      description: 'Process paid time-off requests with accrual calculation, FMLA tracking, and manager approval workflow',
      parentTaskId: 'process-pto-request',
      intentCategories: ['pto-management', 'leave-accrual', 'fmla-tracking'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-benefits-inquiry',
      label: 'Benefits Enrollment & Inquiry',
      description: 'Answer benefits questions, process enrollment elections, calculate costs, and manage plan changes',
      parentTaskId: 'benefits-enrollment-help',
      intentCategories: ['benefits-management', 'enrollment-support', 'cost-calculator'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-payroll-question',
      label: 'Payroll & Compensation Question',
      description: 'Answer questions about paychecks, tax withholding, direct deposit, and compensation details',
      parentTaskId: 'answer-policy-question',
      intentCategories: ['payroll-inquiry', 'compensation-question', 'tax-withholding'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-compliance-validation',
      label: 'Compliance Validation',
      description: 'Validate policy answers against state employment law (CA/NY/TX FMLA/ADA) and flag legal concerns',
      parentTaskId: 'answer-policy-question',
      intentCategories: ['legal-compliance', 'state-law-check', 'eeoc-compliance'],
      confidence: 'medium'
    },
    {
      id: 'consumer-task-escalation-routing',
      label: 'Escalation Decision',
      description: 'Determine if policy exception or legal concern requires escalation to HR business partner',
      parentTaskId: 'answer-policy-question',
      intentCategories: ['escalation-criteria', 'exception-handling', 'hr-collaboration'],
      confidence: 'medium'
    },
    {
      id: 'consumer-task-intent-classification',
      label: 'Query Intent Classification',
      description: 'Classify employee query intent (policy, PTO, benefits, payroll) to route to correct workflow',
      parentTaskId: 'answer-policy-question',
      intentCategories: ['intent-detection', 'request-routing', 'conversation-understanding'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-state-law-check',
      label: 'State Law Compliance Check',
      description: 'Verify policy answers against employee state location (CA/NY/TX) for FMLA/ADA/wage law compliance',
      parentTaskId: 'answer-policy-question',
      intentCategories: ['state-compliance', 'jurisdiction-routing', 'legal-verification'],
      confidence: 'medium'
    },
    {
      id: 'consumer-task-pto-calculation',
      label: 'PTO Accrual & Calculation',
      description: 'Calculate PTO accrual balance, process requests, and validate against FMLA eligibility and state laws',
      parentTaskId: 'process-pto-request',
      intentCategories: ['accrual-calculation', 'fmla-validation', 'leave-tracking'],
      confidence: 'high'
    },
    {
      id: 'consumer-task-benefit-details',
      label: 'Benefit Plan Explanation',
      description: 'Provide detailed explanations of health, retirement, and insurance benefit options with cost-benefit analysis',
      parentTaskId: 'benefits-enrollment-help',
      intentCategories: ['benefits-education', 'plan-comparison', 'cost-analysis'],
      confidence: 'high'
    }
  ],
  dataDimensions: [
    {
      id: 'consumer-data-user-profiles',
      label: 'Employee Handbook & Policies',
      depthScore: 5,
      subTopics: [
        { name: 'Policy documents organized by category (benefits, time-off, compensation)', depth: 5 },
        { name: 'State-specific compliance rules (CA/NY/TX FMLA/ADA/wage)', depth: 5 },
        { name: 'Full-text searchable policy index with versioning', depth: 4 },
        { name: 'Policy citations and cross-references', depth: 4 }
      ],
      keyEntities: ['policy_id', 'policy_name', 'category', 'state_scope', 'effective_date', 'version', 'last_updated', 'full_text'],
      connectedDomains: ['policy-management', 'compliance-systems', 'legal-repositories'],
      sourceAttribution: [
        { sourceId: 'handbook.pdf', sourceName: 'Employee Handbook', count: '156 policies' }
      ]
    },
    {
      id: 'consumer-data-hris-api',
      label: 'HRIS API & Employee Data',
      depthScore: 5,
      subTopics: [
        { name: 'Employee profile data (name, ID, department, manager, location)', depth: 5 },
        { name: 'Compensation and payroll information', depth: 5 },
        { name: 'Benefits enrollment status and plan selections', depth: 4 },
        { name: 'PTO balances, accrual rates, and leave history', depth: 4 }
      ],
      keyEntities: ['employee_id', 'name', 'department', 'manager_id', 'location', 'salary', 'status', 'pto_balance', 'benefits_enrolled'],
      connectedDomains: ['hris-systems', 'payroll-management', 'hr-data'],
      sourceAttribution: [
        { sourceId: 'hris_api.workday.com', sourceName: 'Workday HRIS API', count: '24,000 employees' }
      ]
    },
    {
      id: 'consumer-data-benefits-portal',
      label: 'Benefits Plan & Enrollment Data',
      depthScore: 4,
      subTopics: [
        { name: 'Available health, dental, vision, retirement plans with rates', depth: 4 },
        { name: 'Employee benefit elections and plan selections', depth: 4 },
        { name: 'Coverage details, deductibles, and out-of-pocket costs', depth: 4 },
        { name: 'Life events and qualifying changes', depth: 3 }
      ],
      keyEntities: ['plan_id', 'plan_name', 'carrier', 'employee_rate', 'employer_rate', 'deductible', 'elected_plan', 'effective_date'],
      connectedDomains: ['benefits-management', 'enrollment-systems', 'carrier-data'],
      sourceAttribution: [
        { sourceId: 'benefits_portal.benefitfocus.com', sourceName: 'Benefits Portal', count: '12 plans available' }
      ]
    },
    {
      id: 'consumer-data-payroll-api',
      label: 'Payroll & Compensation Data',
      depthScore: 4,
      subTopics: [
        { name: 'Pay stubs, tax withholding, and direct deposit info', depth: 4 },
        { name: 'Year-to-date earnings, bonuses, and deductions', depth: 4 },
        { name: 'W-2 history and tax documents', depth: 3 },
        { name: 'Compensation philosophy and salary bands', depth: 3 }
      ],
      keyEntities: ['employee_id', 'gross_pay', 'net_pay', 'tax_withholding', 'deductions', 'ytd_earnings', 'bonus', 'ach_routing_number'],
      connectedDomains: ['payroll-systems', 'compensation-management', 'tax-compliance'],
      sourceAttribution: [
        { sourceId: 'payroll_api.adp.com', sourceName: 'ADP Payroll API', count: '24,000 employee records' }
      ]
    }
  ],
  userProfileDimensions: [
    {
      id: 'consumer-up-employee-standard',
      label: 'Standard Employee',
      description: 'Full-time or part-time employee seeking HR information and support',
      contextAxis: 'Self-service HR with compliance assurance',
      postureAxis: 'Solution-seeking; prefers fast, clear answers; wants policy citations',
      channelAxis: 'Chat messages, handbook links, policy citations, HRIS portal',
      behaviorImpact: 'Drives demand for quick resolution and self-service; influences response time SLAs'
    },
    {
      id: 'consumer-up-employee-manager',
      label: 'Manager / Team Lead',
      description: 'Manager responsible for team policies, performance, and compliance',
      contextAxis: 'Team management with HR policy compliance',
      postureAxis: 'Detail-oriented on facts; seeks legal compliance context and escalation paths',
      channelAxis: 'HR business partner contacts, policy interpretations, team reporting',
      behaviorImpact: 'Drives demand for escalation paths and compliance documentation; shapes HR partner involvement'
    },
    {
      id: 'consumer-up-hr-business-partner',
      label: 'HR Business Partner',
      description: 'Strategic HR leader advising on policy exceptions and employee relations issues',
      contextAxis: 'Strategic HR with exception handling and legal compliance',
      postureAxis: 'Legally-focused; demands clear compliance evidence and precedent cases',
      channelAxis: 'Escalation queue, compliance certifications, precedent case library',
      behaviorImpact: 'Shapes exception approval authority; influences escalation criteria and documentation'
    },
    {
      id: 'consumer-up-employee-new-hire',
      label: 'New Hire / Onboarding',
      description: 'Employee in first 90 days seeking benefits, PTO, and policy basics',
      contextAxis: 'Onboarding experience with learning support',
      postureAxis: 'Learning-focused; needs foundational information; sensitive to overwhelming detail',
      channelAxis: 'Onboarding checklists, benefits enrollment, handbook highlights, buddy guidance',
      behaviorImpact: 'Drives demand for simplified explanations and structured onboarding paths'
    },
    {
      id: 'consumer-up-employee-departing',
      label: 'Departing / Transitioning Employee',
      description: 'Employee in off-boarding process or internal transfer seeking compliance info',
      contextAxis: 'Transition management with benefit continuation and compliance',
      postureAxis: 'Risk-aware; wants final paycheck details and benefit COBRA information',
      channelAxis: 'Off-boarding checklist, COBRA enrollment, final benefits info, legal citations',
      behaviorImpact: 'Drives demand for transition documentation and compliance assurance'
    },
    {
      id: 'consumer-up-hr-admin',
      label: 'HR Administrator',
      description: 'HR operations staff managing enrollment, payroll, and policy administration',
      contextAxis: 'HR operations with data accuracy and compliance',
      postureAxis: 'Process-focused; needs audit trails and system integration verification',
      channelAxis: 'System dashboards, audit reports, policy documentation, escalation notes',
      behaviorImpact: 'Shapes system integration needs and audit trail requirements'
    }
  ],
  outputDimensions: [
    { id: 'consumer-od-1', label: 'Policy Answer — Success + Direct + One-shot', description: 'Policy question answered with handbook citation', agentOutputId: 'consumer-out-policy-answer', agentOutputLabel: 'Policy Answer', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
    { id: 'consumer-od-2', label: 'Policy Answer — Success + Cross-referenced + One-shot', description: 'Multi-policy question answered with state law compliance check', agentOutputId: 'consumer-out-policy-answer', agentOutputLabel: 'Policy Answer', outcome: 'success', complexity: 'cross-referenced', interaction: 'one-shot' },
    { id: 'consumer-od-3', label: 'Policy Answer — Partial + Inferred + Conversational', description: 'Policy answer requires escalation due to exception or legal concern', agentOutputId: 'consumer-out-policy-answer', agentOutputLabel: 'Policy Answer', outcome: 'partial', complexity: 'inferred', interaction: 'conversational' },
    { id: 'consumer-od-4', label: 'PTO Approval — Success + Direct + One-shot', description: 'PTO request approved with accrual calculation and compliance check', agentOutputId: 'consumer-out-pto-approval', agentOutputLabel: 'PTO Approval', outcome: 'success', complexity: 'direct', interaction: 'one-shot' },
    { id: 'consumer-od-5', label: 'PTO Approval — Success + Cross-referenced + Conversational', description: 'Complex PTO request with FMLA tracking and manager notification', agentOutputId: 'consumer-out-pto-approval', agentOutputLabel: 'PTO Approval', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
    { id: 'consumer-od-6', label: 'Benefits Election — Success + Direct + Conversational', description: 'Benefits enrollment processed with cost calculations and confirmations', agentOutputId: 'consumer-out-benefits-election', agentOutputLabel: 'Benefits Election', outcome: 'success', complexity: 'direct', interaction: 'conversational' },
    { id: 'consumer-od-7', label: 'Benefits Election — Success + Cross-referenced + Conversational', description: 'Multi-plan benefits election with plan comparisons and life event verification', agentOutputId: 'consumer-out-benefits-election', agentOutputLabel: 'Benefits Election', outcome: 'success', complexity: 'cross-referenced', interaction: 'conversational' },
    { id: 'consumer-od-8', label: 'Escalation Notice — Partial + Inferred + Conversational', description: 'Complex request escalated to HR business partner with evidence summary', agentOutputId: 'consumer-out-escalation-notice', agentOutputLabel: 'Escalation Notice', outcome: 'partial', complexity: 'inferred', interaction: 'conversational' },
    { id: 'consumer-od-9', label: 'Compliance Flagging — Escalation + Direct + One-shot', description: 'Potential legal compliance issue requiring HR/legal review', agentOutputId: 'consumer-out-compliance-flag', agentOutputLabel: 'Compliance Flag', outcome: 'escalation', complexity: 'direct', interaction: 'one-shot' },
  ],
  toolDimensions: [
    { id: 'consumer-tooldim-handbook', toolId: 'handbook-searcher', toolName: 'Handbook Searcher', states: [
      { id: 'consumer-ts-hbs-read-success', label: 'Policy Found', operation: 'read', outcome: 'success', description: 'Handbook policy located and cited with version' },
      { id: 'consumer-ts-hbs-read-failure', label: 'Policy Not Found', operation: 'read', outcome: 'failure', description: 'Policy topic not in handbook or search failed' },
    ] },
    { id: 'consumer-tooldim-hris', toolId: 'hris-lookup', toolName: 'HRIS Lookup', states: [
      { id: 'consumer-ts-hris-read-success', label: 'Employee Data Fetched', operation: 'read', outcome: 'success', description: 'Employee profile and PTO balance retrieved from HRIS' },
      { id: 'consumer-ts-hris-read-failure', label: 'HRIS Lookup Failed', operation: 'read', outcome: 'failure', description: 'Employee not found or HRIS API unavailable' },
      { id: 'consumer-ts-hris-create-success', label: 'PTO Request Submitted', operation: 'create', outcome: 'success', description: 'PTO request successfully submitted to HRIS' },
    ] },
    { id: 'consumer-tooldim-benefits', toolId: 'benefits-calculator', toolName: 'Benefits Calculator', states: [
      { id: 'consumer-ts-bc-read-success', label: 'Plan Data Retrieved', operation: 'read', outcome: 'success', description: 'Benefits plans and cost data retrieved' },
      { id: 'consumer-ts-bc-read-failure', label: 'Plan Data Unavailable', operation: 'read', outcome: 'failure', description: 'Benefits portal unavailable or plans not found' },
      { id: 'consumer-ts-bc-create-success', label: 'Election Recorded', operation: 'create', outcome: 'success', description: 'Benefit election submitted and confirmed' },
    ] },
    { id: 'consumer-tooldim-compliance', toolId: 'compliance-checker', toolName: 'Compliance Checker', states: [
      { id: 'consumer-ts-cc-read-success', label: 'Compliance Verified', operation: 'read', outcome: 'success', description: 'State law compliance check passed; policy valid' },
      { id: 'consumer-ts-cc-read-failure', label: 'Compliance Issue Flagged', operation: 'read', outcome: 'failure', description: 'State law concern identified; escalation needed' },
    ] },
  ],
  summaryText: 'The Employee Support Agent answers HR policy questions with handbook citations, processes PTO requests with accrual calculations, manages benefits enrollments, and validates state employment law compliance (CA/NY/TX FMLA/ADA). Answers 24,000 employees with 71% first-turn resolution. Escalates policy exceptions and legal concerns to HR business partners. Supports 6 roles including employees, managers, and HR admins. 9 response dimensions across 5 core outputs. 4 tools with 11 state transitions.'
}
