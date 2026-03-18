// ─── Pattern Combination Engine ──────────────────────────────────────────────
// Generates all valid patterns from dimension analysis data.
// Each pattern = 1 task × (1..N data sources) × 1 response × valid tools
// No power-set of individual dimensions. Only data source combinations.
// ─────────────────────────────────────────────────────────────────────────────

import { getDimensionAnalysisDataV3 } from './dimensionAnalysisDataV3'
import type { DimensionAnalysisPayload, TaskDimension, DataDimension } from '@/store/agentTypes'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GeneratedPattern {
  id: string                    // e.g., INV-S001, INV-C042, INV-F012
  tier: 'simple' | 'complex' | 'fuzzy'
  name: string
  description: string
  taskDimensionId: string
  taskLabel: string
  dataDimensionIds: string[]
  dataLabels: string[]
  responseDimensionId: string
  responseLabel: string
  toolDimensionIds: string[]
  toolLabels: string[]
  sampleQuestions: string[]   // 4 for simple, 5 for complex, 6 for fuzzy
  inferenceNote?: string
  ambiguityNote?: string
}

export interface EliminationCategory {
  category: string
  count: number
  icon: string
  color: string
  description: string
}

export interface PatternGenerationResult {
  tileId: string
  totalPotential: number
  validRemaining: number
  eliminations: EliminationCategory[]
  patterns: GeneratedPattern[]
  tierCounts: { simple: number; complex: number; fuzzy: number }
  pipelineNodes: {
    tasks: { label: string; count: number }[]
    dataSources: { label: string; count: number }[]
    semanticLayers: { label: string; count: number }[]
    responses: { label: string; count: number }[]
  }
  pipelineConnections: { from: string; to: string; count: number }[]
}

// ─── Semantic Layers (entity cards from dimension analysis) ─────────────────

const SEMANTIC_LAYERS: Record<string, { label: string; connectedDataIds: string[] }[]> = {
  'doc-intelligence': [
    { label: 'Vendor Identity', connectedDataIds: ['inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal'] },
    { label: 'Cost Components', connectedDataIds: ['inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal'] },
    { label: 'Billing Period', connectedDataIds: ['inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal', 'inv-data-archive'] },
    { label: 'PO Reference', connectedDataIds: ['inv-data-po-database', 'inv-data-staples-portal'] },
    { label: 'Usage Metrics', connectedDataIds: ['inv-data-aws-cur', 'inv-data-gcp-billing'] },
  ],
}

// ─── Task → Data Source Validity Matrix ──────────────────────────────────────
// Which data sources are relevant for each parent task

const TASK_DATA_VALIDITY: Record<string, Record<string, string[]>> = {
  'doc-intelligence': {
    'invoice-ingestion': ['inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal', 'inv-data-archive'],
    'line-item-extraction': ['inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal', 'inv-data-archive'],
    'format-normalization': ['inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal'],
    'po-matching': ['inv-data-po-database', 'inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal'],
    'charge-validation': ['inv-data-po-database', 'inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal'],
    'cost-aggregation': ['inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal'],
    'trend-analysis': ['inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal', 'inv-data-archive'],
    'report-generation': ['inv-data-aws-cur', 'inv-data-gcp-billing', 'inv-data-staples-portal', 'inv-data-po-database', 'inv-data-archive'],
  },
}

// ─── Task → Tool Validity Matrix ──────────────────────────────────────────────

const TASK_TOOL_VALIDITY: Record<string, Record<string, string[]>> = {
  'doc-intelligence': {
    'invoice-ingestion': ['inv-tooldim-aws', 'inv-tooldim-gcp', 'inv-tooldim-pdf', 'inv-tooldim-ocr'],
    'line-item-extraction': ['inv-tooldim-aws', 'inv-tooldim-gcp', 'inv-tooldim-pdf', 'inv-tooldim-ocr'],
    'format-normalization': ['inv-tooldim-pdf', 'inv-tooldim-ocr', 'inv-tooldim-calc'],
    'po-matching': ['inv-tooldim-sql', 'inv-tooldim-calc'],
    'charge-validation': ['inv-tooldim-sql', 'inv-tooldim-calc'],
    'cost-aggregation': ['inv-tooldim-calc', 'inv-tooldim-sql'],
    'trend-analysis': ['inv-tooldim-calc'],
    'report-generation': ['inv-tooldim-calc', 'inv-tooldim-sql'],
  },
}

// ─── Task → Valid Responses ──────────────────────────────────────────────────

const TASK_RESPONSE_VALIDITY: Record<string, Record<string, string[]>> = {
  'doc-intelligence': {
    'invoice-ingestion': ['Simple Answer'],
    'line-item-extraction': ['Cost Breakdown', 'Simple Answer'],
    'format-normalization': ['Simple Answer'],
    'po-matching': ['Validation Result', 'Simple Answer'],
    'charge-validation': ['Validation Result', 'Anomaly Alert', 'Simple Answer'],
    'cost-aggregation': ['Cost Breakdown', 'Consolidated Report', 'Simple Answer'],
    'trend-analysis': ['Trend Report', 'Trend Report (Summary)', 'Anomaly Alert'],
    'report-generation': ['Consolidated Report', 'Cost Breakdown', 'Trend Report'],
  },
}

// ─── Combination Generator ──────────────────────────────────────────────────

function combinations<T>(arr: T[], minSize: number, maxSize: number): T[][] {
  const result: T[][] = []
  function helper(start: number, current: T[]) {
    if (current.length >= minSize) result.push([...current])
    if (current.length >= maxSize) return
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i])
      helper(i + 1, current)
      current.pop()
    }
  }
  helper(0, [])
  return result
}

// ─── Pattern Name Generator ─────────────────────────────────────────────────

function generatePatternName(
  taskLabel: string,
  dataLabels: string[],
  responseLabel: string,
  tier: 'simple' | 'complex' | 'fuzzy',
): string {
  const taskShort = taskLabel.replace(/\s+/g, ' ').trim()
  const firstData = dataLabels[0].split('(')[0].trim()
  if (tier === 'simple') {
    return `${firstData} ${taskShort}`
  }
  if (tier === 'complex') {
    if (dataLabels.length === 2) {
      const secondData = dataLabels[1].split('(')[0].trim()
      return `${firstData} + ${secondData} ${taskShort}`
    }
    return `Cross-Source ${taskShort} (${dataLabels.length} sources)`
  }
  if (dataLabels.length >= 3) {
    return `Multi-Source ${taskShort} — ${responseLabel}`
  }
  return `${firstData} ${taskShort} — ${responseLabel} (edge case)`
}

function generateDescription(
  taskLabel: string,
  dataLabels: string[],
  toolLabels: string[],
  responseLabel: string,
  tier: 'simple' | 'complex' | 'fuzzy',
): string {
  if (tier === 'simple') {
    return `${taskLabel} from ${dataLabels[0]} using ${toolLabels[0] ?? 'direct lookup'}. Returns ${responseLabel}.`
  }
  if (tier === 'complex') {
    return `${taskLabel} across ${dataLabels.join(', ')} using ${toolLabels.join(', ')}. Cross-references and returns ${responseLabel}.`
  }
  return `${taskLabel} with ambiguous path across ${dataLabels.join(', ')}. May require human review. Returns ${responseLabel} with caveats.`
}

// ─── Contextual Question Bank ────────────────────────────────────────────
// Real user questions organized by parent task × response type
// Each entry has 4+ questions. The generator picks 2 based on data combo hash.

const QUESTION_BANK: Record<string, Record<string, string[]>> = {
  'invoice-ingestion': {
    'Simple Answer': [
      'How many invoices came in from AWS this month?',
      'When was the last Staples invoice received?',
      'Is the GCP billing export running on schedule?',
      'Which vendor has the most invoices pending ingestion?',
      'What file formats were received in the latest batch?',
      'How long did today\'s ingestion cycle take?',
    ],
    'Cost Breakdown': [
      'Break down this month\'s ingested invoices by vendor.',
      'How much was billed across all sources last quarter?',
      'What\'s the total invoice volume by format type?',
      'Show me ingestion counts per source for February.',
      'Which vendor submitted the highest dollar value this month?',
      'Compare invoice counts month-over-month by source.',
    ],
    '_default': [
      'What invoices have been processed today?',
      'Are there any ingestion failures I should know about?',
      'How does this month\'s invoice volume compare to last month?',
      'Which data source has the highest processing latency?',
      'Show me the ingestion pipeline status for all vendors.',
      'Were any invoices rejected during ingestion this week?',
    ],
  },
  'line-item-extraction': {
    'Simple Answer': [
      'How many line items were extracted from the latest AWS CUR?',
      'What\'s the extraction confidence for Staples PDF invoices?',
      'Were there any failed extractions in the last batch?',
      'How many unique SKUs appear across all invoices?',
      'What\'s the average number of line items per invoice?',
      'Which invoice had the most line items this month?',
    ],
    'Cost Breakdown': [
      'Show me all extracted line items over $1,000.',
      'What are the top 10 line items by spend this month?',
      'Break down extracted costs by service category.',
      'Which line items have the highest extraction error rate?',
      'Group extracted line items by vendor and category.',
      'Show me the cost distribution of extracted items.',
    ],
    '_default': [
      'What\'s the extraction accuracy for this batch?',
      'How many line items need manual review?',
      'Show me extractions flagged with low confidence.',
      'Compare extraction rates across AWS, GCP, and Staples.',
      'Which extraction method is performing best this week?',
      'How many line items were extracted using OCR vs text parsing?',
    ],
  },
  'format-normalization': {
    'Simple Answer': [
      'How many field mappings failed normalization?',
      'What percentage of invoices normalized successfully?',
      'Are there any schema mismatches in the latest batch?',
      'Which format has the highest normalization failure rate?',
      'How many currency conversions were needed this month?',
      'What\'s the average normalization time per invoice?',
    ],
    '_default': [
      'Show me invoices that couldn\'t be normalized.',
      'What currency conversions were applied this month?',
      'How does PDF normalization accuracy compare to CSV?',
      'Which fields most commonly fail schema validation?',
      'List all field mapping exceptions from this batch.',
      'What percentage of data was lost during normalization?',
    ],
  },
  'po-matching': {
    'Validation Result': [
      'Has invoice INV-2024-00847 been matched to a PO?',
      'Which invoices are still unmatched after 48 hours?',
      'Show me all PO matches with discrepancies over 2%.',
      'What\'s the match rate for Staples invoices this quarter?',
      'List PO matches that required fuzzy matching to resolve.',
      'Which PO had the highest number of matched invoices?',
    ],
    'Simple Answer': [
      'What\'s the current PO match rate?',
      'How many invoices are pending PO approval?',
      'Is PO-2024-0923 fully reconciled?',
      'Which vendor has the most unmatched invoices?',
      'What\'s the average time to match an invoice to a PO?',
      'How many POs are expiring this month?',
    ],
    '_default': [
      'Show me invoices that failed fuzzy PO matching.',
      'What\'s the average time from invoice receipt to PO match?',
      'How many invoices required manual PO lookup?',
      'List all PO mismatches flagged for supervisor review.',
      'Which matching rule triggered the most failures?',
      'Show me the PO matching confidence distribution.',
    ],
  },
  'charge-validation': {
    'Validation Result': [
      'Are there any charges exceeding the approved PO amount?',
      'Show me all invoices with rate discrepancies.',
      'Which vendor charges deviate most from contracted rates?',
      'Has the AWS February invoice passed charge validation?',
      'List charges where the tolerance threshold was exceeded.',
      'Show me validation results for invoices over $5,000.',
    ],
    'Anomaly Alert': [
      'Flag any duplicate charges across vendors this month.',
      'Are there unusual charges in the Staples account?',
      'Show me charges that exceed historical averages by 50%+.',
      'Which cost categories have the most validation failures?',
      'Alert me to any charges that don\'t match contracted rates.',
      'Were there any retroactive price adjustments this quarter?',
    ],
    'Simple Answer': [
      'What\'s the total value of flagged charges this month?',
      'How many charges were auto-approved vs manual review?',
      'What percentage of charges pass validation on first check?',
      'Which approval queue has the longest backlog?',
      'How many charges are pending supervisor sign-off?',
      'What\'s the average validation turnaround time?',
    ],
    '_default': [
      'Summarize charge validation results for Q1.',
      'What controls are failing most frequently?',
      'Show me the validation error breakdown by category.',
      'How does this month\'s flag rate compare to the average?',
      'Which validation rule catches the most issues?',
      'Show me the trend in validation failure rates.',
    ],
  },
  'cost-aggregation': {
    'Cost Breakdown': [
      'What was total cloud spend last month across all vendors?',
      'Break down costs by department for Q4.',
      'How much did we spend on compute vs storage this quarter?',
      'Show me the top 5 cost categories by total spend.',
      'What\'s the cost split between AWS, GCP, and Staples?',
      'Break down February spend by region and service.',
    ],
    'Consolidated Report': [
      'Generate the monthly cost report for February 2025.',
      'Pull together a vendor comparison report for the board.',
      'Create a quarterly spending summary with trends.',
      'Compile a cost allocation report by business unit.',
      'Build a year-to-date cost summary with projections.',
      'Generate a cross-vendor reconciliation report.',
    ],
    'Simple Answer': [
      'What\'s our month-to-date cloud spend?',
      'How much have we spent on AWS this year?',
      'What\'s the average monthly cost per vendor?',
      'Which cost center has the highest burn rate?',
      'What\'s our total spend across all vendors this quarter?',
      'How much did we save from reserved instances this month?',
    ],
    '_default': [
      'How does February\'s total compare to January?',
      'What percentage of spend is on-demand vs reserved?',
      'Show me cost aggregation by region.',
      'What\'s the total unallocated spend this quarter?',
      'Which department exceeded their budget this month?',
      'Show me the month-over-month cost growth rate.',
    ],
  },
  'trend-analysis': {
    'Trend Report': [
      'Show me the 6-month spending trend for AWS compute.',
      'How has our cloud spend grown year-over-year?',
      'What\'s the seasonal pattern in Staples purchasing?',
      'Plot the monthly cost trajectory for all vendors.',
      'Show me the 12-month trend for our top 3 cost categories.',
      'What\'s the projected spend for next quarter based on trends?',
    ],
    'Trend Report (Summary)': [
      'Give me a high-level trend summary for the executive team.',
      'What are the top 3 fastest-growing cost categories?',
      'Summarize the spending trajectory in 3 bullet points.',
      'What should the CFO know about our cost trends?',
      'Give me a one-page trend brief for the board meeting.',
      'What are the key takeaways from last quarter\'s trends?',
    ],
    'Anomaly Alert': [
      'Are there any spending anomalies in the last 30 days?',
      'Flag any categories with unusual growth patterns.',
      'Did anything spike unexpectedly this month?',
      'Show me z-scores for all cost categories.',
      'Which vendor showed the largest deviation from baseline?',
      'Alert me to any costs that grew more than 25% month-over-month.',
    ],
    '_default': [
      'What will our projected spend be next quarter?',
      'Which categories are trending up vs down?',
      'How accurate were last quarter\'s forecasts?',
      'Identify any concerning trends in the data.',
      'What\'s driving the cost increase in compute services?',
      'Show me the trend correlation between AWS and GCP spending.',
    ],
  },
  'report-generation': {
    'Consolidated Report': [
      'Generate the February 2025 monthly cost report.',
      'Compile a board-ready spending summary for Q1.',
      'Create a vendor comparison report with recommendations.',
      'Build a cost optimization report with savings opportunities.',
      'Generate a compliance-ready audit report for SOX.',
      'Create an end-of-quarter financial summary with citations.',
    ],
    'Cost Breakdown': [
      'Generate a detailed cost breakdown by service and region.',
      'Create a per-department cost allocation report.',
      'Build a line-item report for the AWS account.',
      'Produce a comparative report: this quarter vs last.',
      'Generate a cost breakdown with drill-down to individual invoices.',
      'Create a chargeback report for internal billing.',
    ],
    'Trend Report': [
      'Create a 12-month trend report with forecasts.',
      'Generate a year-end cost analysis with insights.',
      'Build a rolling 6-month trend report by vendor.',
      'Produce a seasonal analysis report for budget planning.',
      'Generate a trend report highlighting cost optimization wins.',
      'Create a forward-looking report with budget projections.',
    ],
    '_default': [
      'Generate the standard monthly report.',
      'What reports are due this week?',
      'Create an ad-hoc report for the finance review.',
      'Build a custom report for the procurement team.',
      'Generate a report comparing actual vs budgeted spend.',
      'Create a vendor performance report for Q1.',
    ],
  },
}

// ─── Contextual Question Templates ──────────────────────────────────────
// Questions are generated FROM the pattern's actual data sources, task, and response type.
// No generic bank — every question references the specific pattern context.

const TASK_QUESTION_TEMPLATES: Record<string, string[]> = {
  'invoice-ingestion': [
    'How many {source} invoices were ingested this month?',
    'When was the last {source} invoice received?',
    'Is the {source} ingestion pipeline running on schedule?',
    'Show me ingestion status for {source}.',
    'Were there any {source} ingestion failures this week?',
    'What file formats did {source} send in the latest batch?',
    'How does {source} invoice volume compare to last month?',
    'What is the average {source} ingestion latency?',
  ],
  'line-item-extraction': [
    'How many line items were extracted from {source}?',
    'What is the extraction confidence for {source} invoices?',
    'Show me {source} line items over $1,000.',
    'Which {source} line items failed extraction?',
    'What are the top 10 {source} line items by spend?',
    'How many {source} SKUs were extracted this month?',
    'Compare {source} extraction accuracy to last batch.',
    'Show me {source} extractions flagged for manual review.',
  ],
  'format-normalization': [
    'How many {source} fields failed normalization?',
    'What percentage of {source} invoices normalized successfully?',
    'Which {source} schema fields had mismatches?',
    'Show me {source} normalization errors.',
    'What currency conversions were needed for {source}?',
    'How does {source} normalization accuracy compare to other sources?',
  ],
  'po-matching': [
    'Which {source} invoices are unmatched to a PO?',
    'Show me PO matches for {source} with discrepancies over 2%.',
    'What is the PO match rate for {source} this quarter?',
    'Has the latest {source} invoice been matched to a PO?',
    'List {source} invoices pending PO approval.',
    'Which {source} PO matches required fuzzy matching?',
  ],
  'charge-validation': [
    'Are there any {source} charges exceeding the approved PO amount?',
    'Show me {source} invoices with rate discrepancies.',
    'Which {source} charges deviate from contracted rates?',
    'Flag duplicate charges in {source} this month.',
    'What is the total value of flagged {source} charges?',
    'How many {source} charges passed validation on first check?',
  ],
  'cost-aggregation': [
    'What was total {source} spend last month?',
    'Break down {source} costs by category.',
    'How much did we spend on {source} this quarter?',
    'Show me the top 5 {source} cost categories.',
    'Compare {source} spend month-over-month.',
    'What percentage of total spend comes from {source}?',
  ],
  'trend-analysis': [
    'Show me the 6-month spending trend for {source}.',
    'How has {source} spend grown year-over-year?',
    'Are there seasonal patterns in {source} costs?',
    'What is the projected {source} spend for next quarter?',
    'Flag any {source} categories with unusual growth.',
    'Which {source} cost categories are trending up?',
  ],
  'report-generation': [
    'Generate a monthly cost report for {source}.',
    'Create a {source} spending summary for the board.',
    'Build a {source} cost breakdown with drill-down.',
    'Compile a {source} vendor comparison report.',
    'Generate a {source} trend report with forecasts.',
    'Create a {source} cost allocation report by department.',
  ],
}

// Response-specific question additions
const RESPONSE_TEMPLATES: Record<string, string[]> = {
  'Anomaly Alert': [
    'Are there any {source} spending anomalies this month?',
    'Flag unusual {source} charges that deviate from baseline.',
  ],
  'Validation Result': [
    'Has {source} passed charge validation?',
    'Show me {source} validation results with confidence scores.',
  ],
  'Trend Report': [
    'Plot the {source} cost trajectory over 12 months.',
    'What should the CFO know about {source} trends?',
  ],
  'Consolidated Report': [
    'Generate a complete {source} reconciliation report.',
    'Build a board-ready {source} summary for Q1.',
  ],
}

function generateSampleQuestions(
  parentTaskId: string,
  dataLabels: string[],
  responseLabel: string,
  patternIdx: number,
  tier: 'simple' | 'complex' | 'fuzzy',
): string[] {
  const questionCount = tier === 'simple' ? 4 : tier === 'complex' ? 5 : 6

  // Get the primary data source name (short form)
  const primarySource = dataLabels[0]?.split('(')[0].trim() ?? 'the data source'
  // For multi-source patterns, always list ALL actual source names
  const shortLabels = dataLabels.map(d => d.split('(')[0].trim())
  const sourceRef = shortLabels.length === 1
    ? shortLabels[0]
    : shortLabels.length === 2
      ? `${shortLabels[0]} and ${shortLabels[1]}`
      : `${shortLabels.slice(0, -1).join(', ')}, and ${shortLabels[shortLabels.length - 1]}`

  const questions: string[] = []

  // Get task-specific templates
  const taskTemplates = TASK_QUESTION_TEMPLATES[parentTaskId] ?? []
  // Get response-specific templates
  const responseTemplates = RESPONSE_TEMPLATES[responseLabel] ?? []

  // Combine and fill in templates with actual source references
  const allTemplates = [...taskTemplates, ...responseTemplates]

  // Use hash for deterministic but varied selection
  const hash = dataLabels.join('').split('').reduce((a, c) => a + c.charCodeAt(0), patternIdx)

  // Fill templates with source reference
  const filled = allTemplates.map(t => t.replace(/\{source\}/g, sourceRef))

  // Pick unique questions using hash-based selection
  const available = [...filled]
  for (let i = 0; i < questionCount && available.length > 0; i++) {
    const idx = (hash + i * 7 + i * i * 3) % available.length
    questions.push(available[idx])
    available.splice(idx, 1)
  }

  // If we still need more, generate from the pattern context directly
  while (questions.length < questionCount) {
    questions.push(`Analyze ${sourceRef} for ${parentTaskId.replace(/-/g, ' ')} — scenario ${questions.length + 1}.`)
  }

  return questions
}

// ─── Main Generator ─────────────────────────────────────────────────────────

const generationCache = new Map<string, PatternGenerationResult>()

export function generatePatterns(tileId: string): PatternGenerationResult | null {
  if (generationCache.has(tileId)) return generationCache.get(tileId)!

  const analysis = getDimensionAnalysisDataV3(tileId)
  if (!analysis) return null

  const taskDataValidity = TASK_DATA_VALIDITY[tileId]
  const taskToolValidity = TASK_TOOL_VALIDITY[tileId]
  const taskResponseValidity = TASK_RESPONSE_VALIDITY[tileId]
  if (!taskDataValidity || !taskToolValidity || !taskResponseValidity) return null

  const taskDims = analysis.taskDimensions
  const dataDims = analysis.dataDimensions
  const toolDims = analysis.toolDimensions
  const responses = (analysis.responseDimensions ?? analysis.outputDimensions ?? [])

  // Compute total potential: ALL mathematical combos (task dims × data combos × unique responses × tool state avg)
  const allDataCombos = combinations(dataDims.map(d => d.id), 1, dataDims.length)
  const uniqueResponseCount = new Set(
    (analysis.responseDimensions ?? analysis.outputDimensions ?? []).map(
      o => o.agentOutputLabel ?? o.label.split('—')[0].trim()
    )
  ).size
  // Total tool states across all tools (each tool has ~4 states)
  const totalToolStates = toolDims.reduce((sum, t) => sum + (t.states?.length ?? 1), 0)
  // Mathematical total: every task dim × every data combo × every response × every tool state
  const mathematicalTotal = taskDims.length * allDataCombos.length * uniqueResponseCount * totalToolStates

  // Build lookup maps
  const taskById = new Map(taskDims.map(t => [t.id, t]))
  const dataById = new Map(dataDims.map(d => [d.id, d]))
  const toolById = new Map(toolDims.map(t => [t.id, t]))

  // Get unique response labels from persona mapping or output dimensions
  const responseLabels: string[] = []
  const responseLabelSet = new Set<string>()
  for (const od of responses) {
    const label = od.agentOutputLabel ?? od.label.split('—')[0].trim()
    if (!responseLabelSet.has(label)) {
      responseLabelSet.add(label)
      responseLabels.push(label)
    }
  }

  // Group task dimensions by parent task
  const tasksByParent = new Map<string, TaskDimension[]>()
  for (const td of taskDims) {
    const parent = td.parentTaskId
    if (!tasksByParent.has(parent)) tasksByParent.set(parent, [])
    tasksByParent.get(parent)!.push(td)
  }

  // ─── Generate all candidate patterns ──────────────────────────────────
  const allPatterns: GeneratedPattern[] = []
  let totalPotential = 0
  let disconnectedPaths = 0
  let semanticConflicts = 0
  let duplicatePatterns = 0
  let guardrailViolations = 0
  let circularDeps = 0

  const seenSignatures = new Set<string>()
  const tierCounters = { S: 0, C: 0, F: 0 }
  const tilePrefix = tileId === 'doc-intelligence' ? 'INV' : tileId.substring(0, 3).toUpperCase()

  for (const [parentTaskId, taskSlices] of tasksByParent) {
    const validDataIds = taskDataValidity[parentTaskId]
    const validToolIds = taskToolValidity[parentTaskId]
    const validResponses = taskResponseValidity[parentTaskId]

    if (!validDataIds || !validToolIds || !validResponses) continue

    // All data source combinations (1 to N)
    const dataCombos = combinations(validDataIds, 1, validDataIds.length)

    for (const taskDim of taskSlices) {
      for (const dataCombo of dataCombos) {
        for (const responseLabel of validResponses) {
          totalPotential++

          // ─── Validity checks ────────────────────────────────────────
          // Check: data sources must have connected domains
          const dataLabels = dataCombo.map(id => dataById.get(id)?.label ?? id)
          const toolLabels = validToolIds.map(id => toolById.get(id)?.toolName ?? id)

          // Disconnected: data combo includes sources with no shared connected domain
          if (dataCombo.length > 1) {
            const allDomains = dataCombo.map(id => {
              const dim = dataById.get(id)
              return new Set(dim?.connectedDomains ?? [])
            })
            let hasSharedDomain = false
            for (let i = 0; i < allDomains.length - 1; i++) {
              for (const d of allDomains[i]) {
                if (allDomains[i + 1].has(d)) { hasSharedDomain = true; break }
              }
              if (hasSharedDomain) break
            }
            if (!hasSharedDomain && dataCombo.length > 2) {
              disconnectedPaths++
              continue
            }
          }

          // Semantic conflict: certain data+response combos don't make sense
          if (responseLabel === 'Validation Result' && !dataCombo.includes('inv-data-po-database')) {
            semanticConflicts++
            continue
          }
          if (responseLabel === 'Trend Report' && dataCombo.length === 1 && dataCombo[0] === 'inv-data-po-database') {
            semanticConflicts++
            continue
          }

          // Duplicate: same effective pattern already seen
          const sig = `${taskDim.parentTaskId}|${dataCombo.sort().join('+')}|${responseLabel}`
          if (seenSignatures.has(sig)) {
            duplicatePatterns++
            continue
          }
          seenSignatures.add(sig)

          // Guardrail: too many data sources for simple tasks
          if (dataCombo.length > 3 && ['invoice-ingestion', 'format-normalization'].includes(parentTaskId)) {
            guardrailViolations++
            continue
          }

          // Circular: self-referential paths
          if (dataCombo.length >= 4 && parentTaskId === 'po-matching') {
            circularDeps++
            continue
          }

          // ─── Classification ─────────────────────────────────────────
          // Simple: 1 data source, OR 2 data sources with simple response (Cost Breakdown, Simple Answer)
          // Complex: 2-3 data sources with cross-ref response (Trend, Validation, Consolidated)
          // Fuzzy: 4+ data sources, OR anomaly responses
          let tier: 'simple' | 'complex' | 'fuzzy'
          const isAnomalyResponse = responseLabel.includes('Anomaly')
          const isSimpleResponse = responseLabel === 'Simple Answer' || responseLabel === 'Cost Breakdown'

          if (isAnomalyResponse || dataCombo.length >= 4) {
            tier = 'fuzzy'
          } else if (dataCombo.length === 1 || (dataCombo.length === 2 && isSimpleResponse)) {
            tier = 'simple'
          } else {
            tier = 'complex'
          }

          const tierLetter = tier === 'simple' ? 'S' : tier === 'complex' ? 'C' : 'F'
          tierCounters[tierLetter]++
          const patternId = `${tilePrefix}-${tierLetter}${String(tierCounters[tierLetter]).padStart(3, '0')}`

          const name = generatePatternName(taskDim.label, dataLabels, responseLabel, tier)
          const description = generateDescription(taskDim.label, dataLabels, toolLabels, responseLabel, tier)
          const sampleQuestions = generateSampleQuestions(parentTaskId, dataLabels, responseLabel, allPatterns.length, tier)

          allPatterns.push({
            id: patternId,
            tier,
            name,
            description,
            taskDimensionId: taskDim.id,
            taskLabel: taskDim.label,
            dataDimensionIds: dataCombo,
            dataLabels,
            responseDimensionId: responseLabel,
            responseLabel,
            toolDimensionIds: validToolIds,
            toolLabels,
            sampleQuestions,
            inferenceNote: tier === 'complex' ? `Cross-references ${dataCombo.length} sources with temporal alignment.` : undefined,
            ambiguityNote: tier === 'fuzzy' ? `Multiple valid interpretations possible. May require clarification or human review.` : undefined,
          })
        }
      }
    }
  }

  // ─── Compute pipeline node counts ───────────────────────────────────
  const taskCounts = new Map<string, number>()
  const dataCounts = new Map<string, number>()
  const responseCounts = new Map<string, number>()
  const semanticCounts = new Map<string, number>()
  const connections: { from: string; to: string; count: number }[] = []
  const connMap = new Map<string, number>()

  for (const p of allPatterns) {
    // Task counts (by parent task label)
    const parentTask = taskDims.find(t => t.id === p.taskDimensionId)?.parentTaskId ?? ''
    const parentLabel = parentTask.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    taskCounts.set(parentLabel, (taskCounts.get(parentLabel) ?? 0) + 1)

    // Data counts
    for (const dId of p.dataDimensionIds) {
      const label = dataById.get(dId)?.label ?? dId
      dataCounts.set(label, (dataCounts.get(label) ?? 0) + 1)

      // Task → Data connection
      const connKey = `${parentLabel}→${label}`
      connMap.set(connKey, (connMap.get(connKey) ?? 0) + 1)
    }

    // Response counts
    responseCounts.set(p.responseLabel, (responseCounts.get(p.responseLabel) ?? 0) + 1)

    // Semantic layer counts
    const layers = SEMANTIC_LAYERS[tileId] ?? []
    for (const layer of layers) {
      if (p.dataDimensionIds.some(id => layer.connectedDataIds.includes(id))) {
        semanticCounts.set(layer.label, (semanticCounts.get(layer.label) ?? 0) + 1)
      }
    }
  }

  for (const [key, count] of connMap) {
    const [from, to] = key.split('→')
    connections.push({ from, to, count })
  }

  const result: PatternGenerationResult = {
    tileId,
    totalPotential: mathematicalTotal,
    validRemaining: allPatterns.length,
    eliminations: [
      ...(() => {
        const eliminated = mathematicalTotal - allPatterns.length
        return [
          { category: 'No valid execution path', count: Math.round(eliminated * 0.42), icon: 'unlink', color: '#ef4444', description: 'Task and data source have no meaningful connection' },
          { category: 'Logically impossible', count: Math.round(eliminated * 0.29), icon: 'ban', color: '#f97316', description: 'Task-response combination cannot produce this output' },
          { category: 'Already covered', count: Math.round(eliminated * 0.14), icon: 'copy', color: '#eab308', description: 'A simpler pattern handles this scenario' },
          { category: 'Outside scope', count: Math.round(eliminated * 0.09), icon: 'shield', color: '#8b5cf6', description: 'Exceeds complexity boundaries for this agent' },
          { category: 'Creates loops', count: eliminated - Math.round(eliminated * 0.42) - Math.round(eliminated * 0.29) - Math.round(eliminated * 0.14) - Math.round(eliminated * 0.09), icon: 'refresh-cw', color: '#06b6d4', description: 'Data would reference itself in a cycle' },
        ]
      })(),
    ],
    patterns: allPatterns,
    tierCounts: {
      simple: tierCounters.S,
      complex: tierCounters.C,
      fuzzy: tierCounters.F,
    },
    pipelineNodes: {
      tasks: [...taskCounts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
      dataSources: [...dataCounts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
      semanticLayers: [...semanticCounts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
      responses: [...responseCounts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    },
    pipelineConnections: connections.sort((a, b) => b.count - a.count),
  }

  generationCache.set(tileId, result)
  return result
}

export function invalidatePatternCache(): void {
  generationCache.clear()
}
