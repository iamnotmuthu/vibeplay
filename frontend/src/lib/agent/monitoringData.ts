// ─── Monitoring Stage Data ────────────────────────────────────────────────
// Simulates 12 weeks of production monitoring for each agent tile.
// Surfaces post-launch landmines, drift alerts, and health trends.

import type {
  MonitoringStats,
  WeeklyHealthDot,
  LandmineCard,
  MonitoringAlert,
  DriftCard,
  NewDimensionCard,
  TrendDataPoint,
} from '@/store/agentTypes'

// ─── Data Shape ──────────────────────────────────────────────────────────

export interface MonitoringStageData {
  stats: MonitoringStats
  weeklyHealth: WeeklyHealthDot[]
  landmines: LandmineCard[]
  alerts: MonitoringAlert[]
  driftCard: DriftCard
  newDimensionCard: NewDimensionCard
  trendData: TrendDataPoint[]
}

// ─── FAQ & Knowledge Agent ───────────────────────────────────────────────

const FAQ_MONITORING: MonitoringStageData = {
  stats: {
    totalInteractions: 12_480,
    avgResolutionTime: '1.2s',
    escalationRate: 4.3,
    agentVersion: '1.0.2',
  },
  weeklyHealth: [
    { week: 1, status: 'healthy', label: 'Launch — stable' },
    { week: 2, status: 'healthy', label: 'Normal operation' },
    { week: 3, status: 'healthy', label: 'Resolution rate 96%' },
    { week: 4, status: 'healthy', label: 'Steady state' },
    { week: 5, status: 'warning', label: 'Terminology drift detected' },
    { week: 6, status: 'healthy', label: 'Resolved after KB update' },
    { week: 7, status: 'healthy', label: 'Normal operation' },
    { week: 8, status: 'healthy', label: 'Stable' },
    { week: 9, status: 'healthy', label: 'Normal operation' },
    { week: 10, status: 'warning', label: 'New query pattern cluster' },
    { week: 11, status: 'healthy', label: 'Pattern added to KB' },
    { week: 12, status: 'healthy', label: 'Stable at 97% resolution' },
  ],
  landmines: [
    {
      title: 'Domain Terminology Overlap',
      description: 'Product names overlap with common words, causing wrong retrieval. "Mercury" returns planet articles instead of the CRM tool.',
      week: 5,
      severity: 'medium',
      icon: 'search',
      resolution: 'Added context-aware disambiguation to the routing layer. Queries now include product context signals.',
    },
    {
      title: 'New Query Patterns',
      description: 'Users started asking comparison questions the agent was not designed for. "How does X compare to Y?" queries had no retrieval path.',
      week: 10,
      severity: 'low',
      icon: 'trending-up',
      resolution: 'Drift detection flagged the new pattern cluster. Added comparison templates to the knowledge base.',
    },
  ],
  alerts: [
    {
      type: 'drift',
      title: 'Terminology Drift',
      description: 'Retrieval accuracy dropped 8% on product-name queries due to domain terminology overlap.',
      week: 5,
      color: '#f59e0b',
      affectedComponents: ['rag', 'request-classification'],
    },
    {
      type: 'edge-case-cluster',
      title: 'Comparison Query Cluster',
      description: '142 comparison queries detected with no matching retrieval path. New pattern emerging.',
      week: 10,
      color: '#f59e0b',
      affectedComponents: ['request-classification', 'rag'],
    },
  ],
  driftCard: {
    title: 'Pattern Drift Detected — Product Name Queries',
    affectedPath: 'Product lookup queries referencing "Mercury" and "Atlas"',
    detail: 'The product-name query path\'s classification has shifted from its original training. Common-word overlap is causing retrieval to pull general-knowledge articles instead of product-specific entries.',
    impactMetric: 'Resolution Rate',
    impactFrom: '96%',
    impactTo: '88%',
    week: 5,
  },
  newDimensionCard: {
    title: 'New Path Discovered — Comparison Queries',
    affectedCoverage: '8% of recent interactions',
    detail: 'Users are asking "How does X compare to Y?" questions the agent was not designed to handle. This interaction pattern was not in the original pattern set and has no retrieval path.',
    impactEstimate: 'Estimated 142 queries/week unhandled',
    week: 10,
  },
  trendData: [
    { week: 1, resolutionRate: 94, escalationRate: 5.1, interactionVolume: 820, avgResolutionTime: 1.4 },
    { week: 2, resolutionRate: 95, escalationRate: 4.8, interactionVolume: 940, avgResolutionTime: 1.3 },
    { week: 3, resolutionRate: 96, escalationRate: 4.5, interactionVolume: 1020, avgResolutionTime: 1.2 },
    { week: 4, resolutionRate: 96, escalationRate: 4.3, interactionVolume: 1060, avgResolutionTime: 1.2 },
    { week: 5, resolutionRate: 88, escalationRate: 7.2, interactionVolume: 1080, avgResolutionTime: 1.5 },
    { week: 6, resolutionRate: 93, escalationRate: 5.0, interactionVolume: 1100, avgResolutionTime: 1.3 },
    { week: 7, resolutionRate: 95, escalationRate: 4.4, interactionVolume: 1050, avgResolutionTime: 1.2 },
    { week: 8, resolutionRate: 96, escalationRate: 4.2, interactionVolume: 1070, avgResolutionTime: 1.1 },
    { week: 9, resolutionRate: 96, escalationRate: 4.1, interactionVolume: 1090, avgResolutionTime: 1.2 },
    { week: 10, resolutionRate: 92, escalationRate: 5.8, interactionVolume: 1120, avgResolutionTime: 1.3 },
    { week: 11, resolutionRate: 96, escalationRate: 4.3, interactionVolume: 1060, avgResolutionTime: 1.2 },
    { week: 12, resolutionRate: 97, escalationRate: 4.0, interactionVolume: 1100, avgResolutionTime: 1.1 },
  ],
}

// ─── Document Intelligence Agent ─────────────────────────────────────────

const DOC_INTEL_MONITORING: MonitoringStageData = {
  stats: {
    totalInteractions: 8_340,
    avgResolutionTime: '3.8s',
    escalationRate: 11.2,
    agentVersion: '1.1.0',
  },
  weeklyHealth: [
    { week: 1, status: 'healthy', label: 'Launch — stable' },
    { week: 2, status: 'healthy', label: 'Normal extraction' },
    { week: 3, status: 'warning', label: 'Embedded tables breaking RAG' },
    { week: 4, status: 'critical', label: 'OCR failures on scanned forms' },
    { week: 5, status: 'warning', label: 'Hotfix deployed for OCR' },
    { week: 6, status: 'healthy', label: 'Stabilizing' },
    { week: 7, status: 'healthy', label: 'Normal operation' },
    { week: 8, status: 'warning', label: 'Context window truncation' },
    { week: 9, status: 'healthy', label: 'Chunking strategy updated' },
    { week: 10, status: 'healthy', label: 'Stable' },
    { week: 11, status: 'healthy', label: 'Normal operation' },
    { week: 12, status: 'healthy', label: 'Resolution rate 89%' },
  ],
  landmines: [
    {
      title: 'Embedded Tables in PDFs',
      description: 'PDFs with embedded tables and images break the standard RAG pipeline. Table structures are lost during chunking, producing incomplete extraction.',
      week: 3,
      severity: 'high',
      icon: 'table',
      resolution: 'Added table-aware chunking to the ingestion layer. Tables are now extracted as structured objects before embedding.',
    },
    {
      title: 'OCR Failures on Scanned Forms',
      description: 'Handwritten and low-quality scanned forms produce garbled OCR output. Extraction confidence drops below 30%.',
      week: 4,
      severity: 'high',
      icon: 'scan',
      resolution: 'Integrated a secondary OCR engine for low-confidence inputs. Forms below 50% confidence now auto-escalate.',
    },
    {
      title: 'Dense Documents Exceed Context',
      description: 'Legal contracts and multi-section reports exceed context windows with silent truncation. The agent processes only the first portion.',
      week: 8,
      severity: 'medium',
      icon: 'file-text',
      resolution: 'Implemented recursive summarization for long documents. Sections are processed independently and merged.',
    },
  ],
  alerts: [
    {
      type: 'component-failure',
      title: 'Table Extraction Failure',
      description: 'Embedded table extraction failing on 23% of PDF uploads. Structured data lost during chunking.',
      week: 3,
      color: '#f59e0b',
      affectedComponents: ['tool-execution', 'rag'],
    },
    {
      type: 'confidence-drop',
      title: 'OCR Confidence Collapse',
      description: 'Average OCR confidence dropped to 31% on scanned form batch. 67 documents queued for manual review.',
      week: 4,
      color: '#ef4444',
      affectedComponents: ['tool-execution', 'hallucination-check'],
    },
    {
      type: 'drift',
      title: 'Context Window Truncation',
      description: 'Dense documents silently truncated during processing. Last 40% of content not reaching the extraction pipeline.',
      week: 8,
      color: '#f59e0b',
      affectedComponents: ['tool-planning', 'tool-execution'],
    },
  ],
  driftCard: {
    title: 'Pattern Drift Detected — Table Extraction Pipeline',
    affectedPath: 'PDF documents with embedded tables and mixed-format content',
    detail: 'The table extraction path\'s accuracy has degraded as new PDF formats enter the pipeline. Documents with nested tables and inline images are breaking the standard chunking strategy.',
    impactMetric: 'Extraction Accuracy',
    impactFrom: '92%',
    impactTo: '69%',
    week: 3,
  },
  newDimensionCard: {
    title: 'New Path Discovered — Scanned Handwritten Forms',
    affectedCoverage: '15% of recent uploads',
    detail: 'A growing volume of handwritten and low-quality scanned forms are entering the pipeline. These documents produce garbled OCR output and were not part of the original document type matrix.',
    impactEstimate: 'Estimated 67 documents/week requiring manual review',
    week: 4,
  },
  trendData: [
    { week: 1, resolutionRate: 90, escalationRate: 10.5, interactionVolume: 620, avgResolutionTime: 3.5 },
    { week: 2, resolutionRate: 91, escalationRate: 10.2, interactionVolume: 680, avgResolutionTime: 3.6 },
    { week: 3, resolutionRate: 78, escalationRate: 16.4, interactionVolume: 710, avgResolutionTime: 4.8 },
    { week: 4, resolutionRate: 64, escalationRate: 24.1, interactionVolume: 690, avgResolutionTime: 6.2 },
    { week: 5, resolutionRate: 74, escalationRate: 18.0, interactionVolume: 700, avgResolutionTime: 5.1 },
    { week: 6, resolutionRate: 84, escalationRate: 13.2, interactionVolume: 720, avgResolutionTime: 4.2 },
    { week: 7, resolutionRate: 87, escalationRate: 11.8, interactionVolume: 690, avgResolutionTime: 3.9 },
    { week: 8, resolutionRate: 82, escalationRate: 14.5, interactionVolume: 740, avgResolutionTime: 4.4 },
    { week: 9, resolutionRate: 88, escalationRate: 11.0, interactionVolume: 710, avgResolutionTime: 3.8 },
    { week: 10, resolutionRate: 89, escalationRate: 10.8, interactionVolume: 700, avgResolutionTime: 3.7 },
    { week: 11, resolutionRate: 89, escalationRate: 10.5, interactionVolume: 720, avgResolutionTime: 3.7 },
    { week: 12, resolutionRate: 89, escalationRate: 11.2, interactionVolume: 760, avgResolutionTime: 3.8 },
  ],
}

// ─── Research & Comparison Agent ─────────────────────────────────────────

const RESEARCH_MONITORING: MonitoringStageData = {
  stats: {
    totalInteractions: 5_620,
    avgResolutionTime: '6.4s',
    escalationRate: 18.7,
    agentVersion: '1.2.1',
  },
  weeklyHealth: [
    { week: 1, status: 'healthy', label: 'Launch — stable' },
    { week: 2, status: 'healthy', label: 'Normal research queries' },
    { week: 3, status: 'warning', label: 'Multi-hop failures detected' },
    { week: 4, status: 'warning', label: 'Source contradiction spike' },
    { week: 5, status: 'critical', label: 'Data staleness across 3 APIs' },
    { week: 6, status: 'warning', label: 'API refresh cycle added' },
    { week: 7, status: 'healthy', label: 'Stabilizing' },
    { week: 8, status: 'healthy', label: 'Normal operation' },
    { week: 9, status: 'warning', label: 'Cross-system data mismatch' },
    { week: 10, status: 'healthy', label: 'Reconciliation logic added' },
    { week: 11, status: 'healthy', label: 'Stable' },
    { week: 12, status: 'healthy', label: 'Resolution rate 81%' },
  ],
  landmines: [
    {
      title: 'Multi-Hop Query Failures',
      description: 'Research queries requiring 3+ source chains fail when single-retrieval architecture cannot connect intermediate results. The agent returns partial answers.',
      week: 3,
      severity: 'high',
      icon: 'git-branch',
      resolution: 'Added multi-hop orchestration to the workflow layer. Intermediate results are now chained with context carry-forward.',
    },
    {
      title: 'Source Data Contradictions',
      description: 'Different vendor APIs return conflicting data for the same field. The agent presents contradictory facts without flagging the conflict.',
      week: 4,
      severity: 'medium',
      icon: 'alert-triangle',
      resolution: 'Policy enforcement now detects and flags contradictions explicitly. Users see both values with source attribution.',
    },
    {
      title: 'Data Staleness Across APIs',
      description: 'Vendor APIs refresh at different cadences. Pricing data can be 30 days stale while availability data refreshes hourly.',
      week: 5,
      severity: 'high',
      icon: 'clock',
      resolution: 'Drift detection now tracks per-source freshness. Stale data is labeled with last-updated timestamps.',
    },
    {
      title: 'Cross-System Data Spread',
      description: 'Vendor data spread across CRM, external APIs, and internal knowledge base requires custom orchestration that the standard pipeline does not provide.',
      week: 9,
      severity: 'medium',
      icon: 'database',
      resolution: 'Added cross-system reconciliation to the workflow orchestrator. Data is merged before analysis.',
    },
  ],
  alerts: [
    {
      type: 'component-failure',
      title: 'Multi-Hop Chain Break',
      description: 'Research queries requiring 3+ sources failing at 34% rate. Context lost between retrieval hops.',
      week: 3,
      color: '#f59e0b',
      affectedComponents: ['workflow-orchestrator', 'rag', 'api-integration'],
    },
    {
      type: 'escalation-spike',
      title: 'Contradiction Escalation Spike',
      description: 'Escalation rate jumped from 12% to 28% due to unhandled source contradictions.',
      week: 4,
      color: '#f59e0b',
      affectedComponents: ['hallucination-check', 'policy-enforcement'],
    },
    {
      type: 'drift',
      title: 'API Staleness Threshold Breach',
      description: '3 vendor APIs exceeded 7-day staleness threshold simultaneously. Pricing data unreliable.',
      week: 5,
      color: '#ef4444',
      affectedComponents: ['api-integration', 'drift-detection'],
    },
    {
      type: 'drift',
      title: 'Cross-System Data Mismatch',
      description: 'CRM and external API returning different vendor profiles. 15% of queries affected.',
      week: 9,
      color: '#f59e0b',
      affectedComponents: ['api-integration', 'context-graph'],
    },
  ],
  driftCard: {
    title: 'Pattern Drift Detected — Multi-Source Pricing Queries',
    affectedPath: 'Vendor pricing queries requiring 3+ data source chains',
    detail: 'The multi-source pricing path\'s classification has shifted as vendor APIs changed their response formats. Queries that previously resolved in a single hop now require intermediate reconciliation steps.',
    impactMetric: 'Resolution Rate',
    impactFrom: '87%',
    impactTo: '66%',
    week: 5,
  },
  newDimensionCard: {
    title: 'New Path Discovered — Cross-System Reconciliation Requests',
    affectedCoverage: '11% of recent interactions',
    detail: 'Users are asking the agent to reconcile conflicting data across CRM, external APIs, and internal knowledge bases. This orchestration pattern was not in the original design.',
    impactEstimate: 'Estimated 84 queries/week requiring manual reconciliation',
    week: 9,
  },
  trendData: [
    { week: 1, resolutionRate: 84, escalationRate: 16.2, interactionVolume: 410, avgResolutionTime: 5.8 },
    { week: 2, resolutionRate: 85, escalationRate: 15.8, interactionVolume: 440, avgResolutionTime: 6.0 },
    { week: 3, resolutionRate: 72, escalationRate: 22.4, interactionVolume: 470, avgResolutionTime: 7.8 },
    { week: 4, resolutionRate: 68, escalationRate: 28.1, interactionVolume: 460, avgResolutionTime: 8.4 },
    { week: 5, resolutionRate: 58, escalationRate: 34.2, interactionVolume: 480, avgResolutionTime: 9.6 },
    { week: 6, resolutionRate: 72, escalationRate: 24.0, interactionVolume: 470, avgResolutionTime: 7.5 },
    { week: 7, resolutionRate: 80, escalationRate: 19.4, interactionVolume: 460, avgResolutionTime: 6.8 },
    { week: 8, resolutionRate: 82, escalationRate: 18.0, interactionVolume: 480, avgResolutionTime: 6.5 },
    { week: 9, resolutionRate: 74, escalationRate: 22.6, interactionVolume: 490, avgResolutionTime: 7.2 },
    { week: 10, resolutionRate: 81, escalationRate: 18.7, interactionVolume: 470, avgResolutionTime: 6.4 },
    { week: 11, resolutionRate: 81, escalationRate: 18.4, interactionVolume: 480, avgResolutionTime: 6.3 },
    { week: 12, resolutionRate: 81, escalationRate: 18.7, interactionVolume: 500, avgResolutionTime: 6.4 },
  ],
}

// ─── Decision & Workflow Agent (Dental) ──────────────────────────────────

const DENTAL_MONITORING: MonitoringStageData = {
  stats: {
    totalInteractions: 3_890,
    avgResolutionTime: '8.2s',
    escalationRate: 24.1,
    agentVersion: '1.3.0',
  },
  weeklyHealth: [
    { week: 1, status: 'healthy', label: 'Launch — stable' },
    { week: 2, status: 'warning', label: 'Embedded imaging reports' },
    { week: 3, status: 'warning', label: 'Multi-hop insurance failures' },
    { week: 4, status: 'critical', label: 'PHI leakage near-miss' },
    { week: 5, status: 'warning', label: 'Security patch deployed' },
    { week: 6, status: 'warning', label: 'Dense formulary docs truncated' },
    { week: 7, status: 'healthy', label: 'Chunking fix applied' },
    { week: 8, status: 'warning', label: 'Model blind spot on imaging' },
    { week: 9, status: 'critical', label: 'Emergency escalation failure' },
    { week: 10, status: 'warning', label: 'Escalation path hardened' },
    { week: 11, status: 'healthy', label: 'Stabilizing' },
    { week: 12, status: 'healthy', label: 'Resolution rate 76%' },
  ],
  landmines: [
    {
      title: 'Embedded Tables and Images in PDFs',
      description: 'Insurance formulary PDFs contain embedded tables and scanned images. The RAG pipeline loses table structure and cannot OCR inline images.',
      week: 2,
      severity: 'high',
      icon: 'table',
      resolution: 'Deployed table-aware extraction with a fallback OCR path for inline images. Formulary PDFs now pre-processed separately.',
    },
    {
      title: 'Multi-Hop Insurance Verification',
      description: 'Insurance verification requires chaining patient record, coverage matrix, and fee schedule lookups. Single-retrieval cannot connect 3+ sources.',
      week: 3,
      severity: 'high',
      icon: 'git-branch',
      resolution: 'Multi-hop orchestration added to the workflow layer. Insurance verification now chains patient → coverage → fee lookups with context carry.',
    },
    {
      title: 'Domain Terminology Overlap',
      description: 'Clinical terms overlap with insurance terms. "Coverage" means different things in treatment context vs. insurance context, causing wrong retrieval.',
      week: 4,
      severity: 'high',
      icon: 'search',
      resolution: 'Added domain-scoped disambiguation. Queries are now tagged with conversation context (clinical vs. administrative) before routing.',
    },
    {
      title: 'Data Spread Across Systems',
      description: 'Patient data lives in PMS, insurance data in a separate system, and clinical protocols in a third. No single query can span all three without custom orchestration.',
      week: 6,
      severity: 'medium',
      icon: 'database',
      resolution: 'Cross-system query orchestrator deployed. Workflow layer now coordinates parallel lookups across PMS, insurance, and clinical systems.',
    },
    {
      title: 'Dense Documents Exceed Context',
      description: 'Insurance formularies and clinical guidelines exceed context windows. The agent silently drops the latter sections, missing critical exclusions.',
      week: 6,
      severity: 'high',
      icon: 'file-text',
      resolution: 'Recursive summarization with section-aware chunking. Critical sections (exclusions, limitations) are prioritized in the context window.',
    },
    {
      title: 'Model Blind Spots on Imaging',
      description: 'The model cannot interpret dental imaging reports. It generates plausible but incorrect descriptions of X-ray findings, which could mislead clinical decisions.',
      week: 8,
      severity: 'high',
      icon: 'eye-off',
      resolution: 'Imaging-related queries now auto-escalate to clinical staff. The agent explicitly states it cannot interpret imaging and routes to a human.',
    },
  ],
  alerts: [
    {
      type: 'component-failure',
      title: 'Formulary Table Extraction Failure',
      description: 'Insurance formulary tables lost during RAG chunking. 41% of coverage lookups returning incomplete data.',
      week: 2,
      color: '#f59e0b',
      affectedComponents: ['rag', 'tool-execution'],
    },
    {
      type: 'component-failure',
      title: 'Insurance Verification Chain Break',
      description: 'Multi-hop insurance queries failing at patient-to-coverage junction. 52% of verification requests incomplete.',
      week: 3,
      color: '#f59e0b',
      affectedComponents: ['workflow-orchestrator', 'api-integration', 'db-queries'],
    },
    {
      type: 'escalation-spike',
      title: 'PHI Context Leakage Risk',
      description: 'PII scanner missed PHI in free-text clinical notes. Near-miss detected by output guardrails before patient-facing response.',
      week: 4,
      color: '#ef4444',
      affectedComponents: ['pii-security', 'output-guardrails'],
    },
    {
      type: 'drift',
      title: 'Formulary Context Truncation',
      description: 'Dense insurance formularies silently truncated. Exclusion clauses in latter pages not reaching the extraction pipeline.',
      week: 6,
      color: '#f59e0b',
      affectedComponents: ['tool-planning', 'tool-execution'],
    },
    {
      type: 'confidence-drop',
      title: 'Imaging Report Hallucination',
      description: 'Model generating plausible but incorrect X-ray interpretations. Confidence scores appear high despite factual errors.',
      week: 8,
      color: '#ef4444',
      affectedComponents: ['hallucination-check', 'response-generation'],
    },
    {
      type: 'component-failure',
      title: 'Emergency Escalation Path Failure',
      description: 'Critical symptom queries not reaching clinical team due to routing misconfiguration. 3 emergency queries delayed.',
      week: 9,
      color: '#ef4444',
      affectedComponents: ['agent-router', 'failure-handling', 'alerting-feedback'],
    },
  ],
  driftCard: {
    title: 'Pattern Drift Detected — Insurance Coverage Queries',
    affectedPath: 'Pre-authorization queries for crowns and bridges',
    detail: 'The insurance coverage query path\'s classification has shifted from its original training. Clinical terms overlapping with insurance terms causes the agent to route queries to the wrong domain context, producing incomplete coverage lookups.',
    impactMetric: 'Resolution Rate',
    impactFrom: '94%',
    impactTo: '71%',
    week: 4,
  },
  newDimensionCard: {
    title: 'New Path Discovered — Post-Treatment Emergency Calls After Hours',
    affectedCoverage: '12% of recent interactions',
    detail: 'Patients are contacting the agent after hours with post-treatment emergency questions. This interaction pattern was not in the original design and the agent lacks clinical escalation paths for after-hours routing.',
    impactEstimate: 'Estimated 47 emergency queries/week unhandled',
    week: 9,
  },
  trendData: [
    { week: 1, resolutionRate: 82, escalationRate: 20.4, interactionVolume: 290, avgResolutionTime: 7.8 },
    { week: 2, resolutionRate: 78, escalationRate: 23.1, interactionVolume: 310, avgResolutionTime: 8.4 },
    { week: 3, resolutionRate: 72, escalationRate: 28.6, interactionVolume: 330, avgResolutionTime: 9.2 },
    { week: 4, resolutionRate: 62, escalationRate: 36.4, interactionVolume: 340, avgResolutionTime: 10.8 },
    { week: 5, resolutionRate: 70, escalationRate: 30.2, interactionVolume: 320, avgResolutionTime: 9.4 },
    { week: 6, resolutionRate: 74, escalationRate: 27.0, interactionVolume: 330, avgResolutionTime: 8.8 },
    { week: 7, resolutionRate: 78, escalationRate: 24.5, interactionVolume: 310, avgResolutionTime: 8.2 },
    { week: 8, resolutionRate: 73, escalationRate: 28.8, interactionVolume: 340, avgResolutionTime: 9.0 },
    { week: 9, resolutionRate: 58, escalationRate: 38.2, interactionVolume: 350, avgResolutionTime: 11.4 },
    { week: 10, resolutionRate: 72, escalationRate: 26.8, interactionVolume: 330, avgResolutionTime: 8.6 },
    { week: 11, resolutionRate: 76, escalationRate: 24.1, interactionVolume: 310, avgResolutionTime: 8.2 },
    { week: 12, resolutionRate: 76, escalationRate: 24.1, interactionVolume: 320, avgResolutionTime: 8.2 },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════

const MONITORING_DATA: Record<string, MonitoringStageData> = {
  'faq-knowledge': FAQ_MONITORING,
  'doc-intelligence': DOC_INTEL_MONITORING,
  'research-comparison': RESEARCH_MONITORING,
  'decision-workflow': DENTAL_MONITORING,
}

export function getMonitoringData(tileId: string): MonitoringStageData | null {
  return MONITORING_DATA[tileId] ?? null
}
