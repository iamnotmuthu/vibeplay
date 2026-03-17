// ─── V3 Structural Discovery Data ──────────────────────────────────────
// Structural discoveries are critical integration challenges identified
// during dimensional analysis (Section 3 of use case specs).
// Each discovery maps to affected tasks, data sources, and risk tiers.

export type RelationType = 'simple' | 'hopping' | 'aggregative' | 'branching' | 'reasoning'
export type RiskLevel = 'green' | 'amber' | 'red'

export interface StructuralDiscovery {
  id: string
  title: string
  description: string
  technicalDetail: string
  relationType: RelationType
  riskLevel: RiskLevel
  affectedTasks: string[]
  affectedDataSources: string[]
  metaPatternTriggered: string[]
  annotationText: string
}

export interface RiskTierSummary {
  green: { count: number; label: string; items: StructuralDiscovery[] }
  amber: { count: number; label: string; items: StructuralDiscovery[] }
  red: { count: number; label: string; items: StructuralDiscovery[] }
}

// ─── Invoice Processing Agent Discoveries ─────────────────────────────────

const INVOICE_PROCESSING_DISCOVERIES: StructuralDiscovery[] = [
  {
    id: 'disc-001',
    title: 'Cross-Vendor Format Divergence',
    description:
      'AWS uses flat CSV tables, GCP uses nested JSON, Staples uses PDF tables. Same semantic data (costs), three completely different extraction pipelines required.',
    technicalDetail:
      'AWS: 52 flat columns. GCP: 3-level hierarchy (service→SKU→project). Staples: variable table structures (8+ distinct formats). Normalization must handle semantic equivalence across syntactic differences.',
    relationType: 'simple',
    riskLevel: 'amber',
    affectedTasks: ['task-001', 'task-002', 'task-003'],
    affectedDataSources: ['source-aws', 'source-gcp', 'source-staples'],
    metaPatternTriggered: ['mixed-format-composition'],
    annotationText:
      'Agent must detect format type and route to appropriate parser. Failure in format detection cascades to all downstream tasks.',
  },
  {
    id: 'disc-002',
    title: 'Temporal Billing Misalignment',
    description:
      'AWS bills monthly on the 1st, GCP bills monthly on the 15th, Staples bills on delivery date (variable). Quarterly aggregation must account for billing cycle offsets.',
    technicalDetail:
      'AWS March = March 1-31. GCP March = Feb 15 - Mar 14. Staples March = actual delivery dates scattered across Feb-Apr. For Q1 aggregation, must normalize to calendar quarter vs billing cycle. ~2-3% of transactions fall on period boundaries.',
    relationType: 'aggregative',
    riskLevel: 'amber',
    affectedTasks: ['task-006', 'task-007'],
    affectedDataSources: ['source-aws', 'source-gcp', 'source-staples', 'source-po-db'],
    metaPatternTriggered: ['temporal-aggregation'],
    annotationText:
      'Silent data misalignment can cause 2-3% over/under-reporting in quarterly totals. Implement explicit period-boundary detection.',
  },
  {
    id: 'disc-003',
    title: 'Category Normalization Challenge',
    description:
      'AWS calls it "S3 Standard Storage", GCP calls it "Cloud Storage Standard", Staples calls it "Data Backup Services". Semantically same but syntactically different. Cross-vendor aggregation requires semantic matching.',
    technicalDetail:
      'Build mapping: {AWS service → normalized category, GCP SKU → normalized category, Staples description pattern → normalized category}. Storage category alone has 12 AWS variations, 8 GCP variations, 3 Staples variations. False positive rate if simple string matching: 18%. With NLP semantic similarity >85%: false positive drops to 3%.',
    relationType: 'simple',
    riskLevel: 'red',
    affectedTasks: ['task-003', 'task-006'],
    affectedDataSources: ['source-aws', 'source-gcp', 'source-staples'],
    metaPatternTriggered: ['structured-data-output', 'reasoning-chain'],
    annotationText:
      'Category mismatches lead to incorrect cost allocation. Recommend NLP-based semantic matching (>85% confidence) over string matching.',
  },
  {
    id: 'disc-004',
    title: 'OCR Fallback Path Complexity',
    description:
      '31 archived invoices are scanned images (150-200 DPI). PDF parser detects failure state (image-only, confidence <50%). Agent must automatically route to OCR engine.',
    technicalDetail:
      'PDF parser on image → failure state → OCR engine triggered. OCR success rate 78% (confidence >90%), degraded 14% (80-89%), failure 8% (<80%). Failure cases: water-damaged pages (3), handwritten notes overlaid (2), faded scans (3). Historical data: of 31 images, 7 require human review.',
    relationType: 'simple',
    riskLevel: 'red',
    affectedTasks: ['task-001', 'task-002'],
    affectedDataSources: ['source-archive'],
    metaPatternTriggered: ['tool-fallback-chain', 'confidence-threshold-routing'],
    annotationText:
      'Archive data has 22% failure/manual-review rate for OCR. Implement confidence scoring and escalation threshold.',
  },
  {
    id: 'disc-005',
    title: 'PO Matching Ambiguity & Low Confidence',
    description:
      'Some Staples invoices (12 of 36) reference PO numbers in plain text within headers, not structured fields. Entity extraction has lower confidence than field-based matching.',
    technicalDetail:
      'Confidence scoring: PO number in structured field = 98% confidence. PO number extracted from text via regex/NLP = 78% average confidence (range 65-92%). For unmatched invoices, require secondary validation or manual lookup. 12 of 36 Staples invoices affected.',
    relationType: 'hopping',
    riskLevel: 'amber',
    affectedTasks: ['task-004', 'task-005'],
    affectedDataSources: ['source-staples', 'source-po-db'],
    metaPatternTriggered: ['entity-extraction', 'confidence-threshold-routing'],
    annotationText: 'PO extraction success rate 67% for text-based references. Flag low-confidence matches for manual review.',
  },
  {
    id: 'disc-006',
    title: 'Reasoning Depth for Trend Analysis',
    description:
      'Anomaly detection requires: [fetch 6+ months], [normalize formats], [aggregate by category], [calculate growth rates], [compare vs baseline], [identify outliers], [attribute root causes]. 7 dependent reasoning steps.',
    technicalDetail:
      'Execution path: AWS 6mo × GCP 6mo × Staples 6mo (3 parallel fetches) → normalize all 3 (3 parallel) → aggregate by month+category (1 step, 18 categories) → calculate YoY growth (78 calculations) → z-score detection per category (18 tests) → root cause lookup (pattern matching). Total: 78 intermediate values before final output. Error propagation risk is high.',
    relationType: 'reasoning',
    riskLevel: 'red',
    affectedTasks: ['task-007'],
    affectedDataSources: ['source-aws', 'source-gcp', 'source-staples'],
    metaPatternTriggered: ['reasoning-chain'],
    annotationText:
      'Trending analysis has 22% error propagation rate when precision loss compounds across 7 reasoning steps.',
  },
  {
    id: 'disc-007',
    title: 'Silent Data Gap Detection',
    description:
      'If AWS CUR file for one month is missing, agent might calculate quarterly totals that silently omit one month without warning.',
    technicalDetail:
      'Mitigation: data completeness check before aggregation. For each vendor + period, verify 100% of expected records. AWS: daily files = 30 expected per month. If <28 files present, flag as incomplete. GCP: hourly records expected (720 per month). If <650 records, flag incomplete. Staples: invoices expected (usually 2-4 per month). If <2, flag as incomplete.',
    relationType: 'aggregative',
    riskLevel: 'red',
    affectedTasks: ['task-006'],
    affectedDataSources: ['source-aws', 'source-gcp', 'source-staples'],
    metaPatternTriggered: ['partial-data-handling'],
    annotationText: 'Implement pre-aggregation validation: flag and alert if any vendor data <90% completeness.',
  },
  {
    id: 'disc-008',
    title: 'Multi-Vendor Cost Normalization Currency Handling',
    description:
      'AWS may invoice in USD, GCP in multiple currencies (USD, EUR, JPY), Staples in USD. If costs need converting, exchange rate selection matters.',
    technicalDetail:
      'Implement currency conversion: for non-USD costs, use daily exchange rates (or monthly average). Exchange rate variance ±2% monthly. If used daily rates, report with confidence bands. If <5 transactions in minority currency, may not warrant conversion overhead.',
    relationType: 'simple',
    riskLevel: 'amber',
    affectedTasks: ['task-003', 'task-006'],
    affectedDataSources: ['source-aws', 'source-gcp'],
    metaPatternTriggered: ['data-normalization'],
    annotationText: 'Currency conversion adds 1-2% variance. Use monthly average rates for stability.',
  },
  {
    id: 'disc-009',
    title: 'Reserved Instance Amortization Complexity',
    description:
      'AWS Reserved Instances have upfront costs amortized over reservation period. Cost allocation per month requires understanding amortization logic.',
    technicalDetail:
      'AWS CUR shows both upfront (one-time) and amortized (monthly) charges. If agent sums "Amount" field without distinguishing upfront from amortized, monthly costs will spike in month 0 of reservation. Correct approach: sum only amortized amounts for monthly trending. Upfront is one-time and should be separate line item.',
    relationType: 'simple',
    riskLevel: 'amber',
    affectedTasks: ['task-002', 'task-006'],
    affectedDataSources: ['source-aws'],
    metaPatternTriggered: ['field-mapping-logic'],
    annotationText:
      'RI amortization mishandling causes 5-15% spike in Month 0 costs. Implement field-level logic to separate upfront vs amortized.',
  },
  {
    id: 'disc-010',
    title: 'Purchase Order Matching Fuzzy Logic Boundary Cases',
    description:
      'PO matching uses fuzzy amount matching (±2% tolerance). Edge case: invoice $10,000 matches PO $9,995 (0.05% diff, within tolerance) BUT also matches PO $10,250 (2.5% diff, outside tolerance).',
    technicalDetail:
      'Implement tie-breaking: if multiple matches within tolerance, select highest confidence (closest amount). If tie on amount, use date proximity (PO date closest to invoice date). Fuzzy matching success rate: 94% for exact/near-match, 6% require manual review (low confidence or multiple matches).',
    relationType: 'hopping',
    riskLevel: 'amber',
    affectedTasks: ['task-004'],
    affectedDataSources: ['source-staples', 'source-po-db'],
    metaPatternTriggered: ['fuzzy-matching-tie-breaking'],
    annotationText: 'Implement confidence-based tie-breaking for fuzzy PO matches. Flag 6% requiring manual review.',
  },
  {
    id: 'disc-011',
    title: 'Billing Cycle Overlap & Pro-Rating',
    description:
      'Customer might upgrade plan mid-cycle. Invoice shows charges for both old plan (partial month) and new plan (partial month) on same invoice. Trend analysis must account for partial-month pro-rating.',
    technicalDetail:
      'Detection: line item amount < (expected_monthly_rate / 30) × days_in_month indicates pro-rating. When aggregating monthly costs, pro-rated amounts skew totals. Workaround: identify pro-rated line items, normalize to full-month equivalent, or document pro-rating in result.',
    relationType: 'aggregative',
    riskLevel: 'amber',
    affectedTasks: ['task-006', 'task-007'],
    affectedDataSources: ['source-aws', 'source-gcp'],
    metaPatternTriggered: ['temporal-boundary-handling'],
    annotationText:
      'Pro-rating adds 1-3% variance per affected month. Flag in reports when pro-rated amounts detected.',
  },
  {
    id: 'disc-012',
    title: 'Data Completeness Across Vendor Billing Cycles',
    description:
      'If querying "September costs", but AWS invoice covers Sept 1-30, GCP covers Aug 15-Sept 14, Staples covers Aug 25-Sept 24, aggregation must clarify which definition of "September" is used.',
    technicalDetail:
      'Define aggregation period: use calendar month (Sept 1-30)? Or billing cycle? If billing cycle, results vary by vendor. Implement calendar-month aggregation as default; offer billing-cycle view as alternative. Document period mismatch in output.',
    relationType: 'aggregative',
    riskLevel: 'amber',
    affectedTasks: ['task-006'],
    affectedDataSources: ['source-aws', 'source-gcp', 'source-staples'],
    metaPatternTriggered: ['temporal-aggregation', 'partial-data-handling'],
    annotationText:
      'Always clarify aggregation period (calendar vs billing cycle). Default to calendar month with note: "AWS/GCP/Staples billing cycles offset by X days."',
  },
]

// ─── Enterprise RAG Copilot Discoveries ────────────────────────────────────

const ENTERPRISE_RAG_DISCOVERIES: StructuralDiscovery[] = [
  {
    id: 'disc-001',
    title: 'Entity Resolution Across Systems',
    description:
      'Same person referenced as @john.doe (Slack), John Doe (Confluence), john.doe@company.com (Jira), john_doe (Drive), employee_id=142 (Directory). No standard identifier.',
    technicalDetail:
      'Implement fuzzy matching on name (>85% similarity) + email prefix (must match). Cross-reference via email: john.doe@company.com → uniquely identifies employee. Email is canonical identifier. Fallback: manual confirmation if multiple matches within 90% similarity.',
      relationType: 'hopping',
    riskLevel: 'red',
    affectedTasks: ['task-001', 'task-004', 'task-006'],
    affectedDataSources: ['source-slack', 'source-conf', 'source-jira', 'source-gdrive', 'source-dir'],
    metaPatternTriggered: ['entity-extraction'],
    annotationText:
      '3% false positive rate on naive name matching (common names: John Smith, Sarah Chen). Use email as canonical ID.',
  },
  {
    id: 'disc-002',
    title: 'Access Control Complexity at Scale',
    description:
      'User sees results from public Slack channels but not private. Confluence page in public space but with space restrictions. Drive file in shared drive but editor-only access. Array of binary permission decisions across 5 systems.',
    technicalDetail:
      'Maintain permission matrix: user_id × (source_id × item_id) → access_level. For Confluence: space-level + page-level. For Slack: channel membership (public auto-included, private membership-based). For Drive: file ACL lookup via API. For Jira: project-level and issue-level. For Directory: some employee records restricted (executives, HR-only).',
    relationType: 'hopping',
    riskLevel: 'red',
    affectedTasks: ['task-003', 'task-006'],
    affectedDataSources: ['source-conf', 'source-slack', 'source-gdrive', 'source-jira', 'source-dir'],
    metaPatternTriggered: ['access-control-aware'],
    annotationText:
      'Implement pre-search permission filter. Log filtered items; alert user if N>2 results hidden due to access.',
  },
  {
    id: 'disc-003',
    title: 'Temporal Misalignment & Versioning',
    description:
      'Confluence page "Data Retention Policy v2.3" (Nov 2 modification) vs Slack discussion referencing v2.1 (Oct 18-25) vs Jira mentioning "per Oct 18 requirements" (outdated). Mixed-version information.',
    technicalDetail:
      'Detect version information: Confluence pages have explicit versions (v2.3). Slack discussions capture date (Oct 18-25). Jira comments extract linked Confluence version. When synthesizing: identify discrepancies if versions differ. Implement temporal ordering: identify latest version across sources.',
    relationType: 'reasoning',
    riskLevel: 'amber',
    affectedTasks: ['task-004', 'task-005', 'task-007'],
    affectedDataSources: ['source-conf', 'source-slack', 'source-jira'],
    metaPatternTriggered: ['temporal-aggregation'],
    annotationText:
      'Always report: "Policy currently v2.3 (Nov 2). Prior discussion referenced v2.1 (Oct 18)." Flag version discrepancies.',
  },
  {
    id: 'disc-004',
    title: 'Slack Thread Discoverability Problem',
    description:
      'Slack main messages indexed. But key details in thread replies (avg 8 replies/thread). Naive search returns main message, loses thread context.',
    technicalDetail:
      'Implement thread-aware search: when returning Slack message, auto-fetch full thread (main + replies, sorted by timestamp). Slack API: message ID → use conversation threads API. Cost: 1 API call per message. Benefit: ensures synthesis captures full discussion.',
    relationType: 'hopping',
    riskLevel: 'amber',
    affectedTasks: ['task-003', 'task-004'],
    affectedDataSources: ['source-slack'],
    metaPatternTriggered: ['context-window-overflow'],
    annotationText:
      'Thread replies contain 60% of discussion context. Always retrieve full threads; mark thread replies vs main message in output.',
  },
  {
    id: 'disc-005',
    title: 'Confluence Page Staleness Detection',
    description:
      'Page "API Rate Limiting Strategy" last modified Oct 20 (149 days old as of Feb 2026). Age affects relevance. Slack discussion (Nov 1-15) may have newer info not reflected in Confluence.',
    technicalDetail:
      'Implement freshness scoring: page modified_date → age in days. <30 days: "current", 31-90: "aging", >90: "stale". When returning Confluence result >90 days old, flag: "Warning: this page is 149 days old. Check #eng-infrastructure for recent updates." For each result, search Slack for recent related discussion.',
    relationType: 'hopping',
    riskLevel: 'amber',
    affectedTasks: ['task-005', 'task-007'],
    affectedDataSources: ['source-conf', 'source-slack'],
    metaPatternTriggered: ['document-data', 'partial-data-handling'],
    annotationText:
      'Pages >90 days old are stale in 40% of cases (newer discussions in Slack). Implement dual-search: Confluence + Slack for recency.',
  },
  {
    id: 'disc-006',
    title: 'Reasoning Chain Error Propagation',
    description:
      'Multi-hop query: "What caused delays?" → [Fetch Jira] → [Identify blockers] → [Fetch Slack] → [Attribute] → [Synthesize]. Error in step 1 propagates through all downstream steps.',
    technicalDetail:
      'Implement validation at each step: after Jira fetch, verify completeness (expected N issues, got M). If M<<N, flag as partial with warning. Similarly for Slack: verify search covered expected date range without pagination limits. Confidence score = product of individual-step confidences.',
    relationType: 'reasoning',
    riskLevel: 'red',
    affectedTasks: ['task-004', 'task-005'],
    affectedDataSources: ['source-jira', 'source-slack', 'source-gdrive', 'source-conf'],
    metaPatternTriggered: ['reasoning-chain'],
    annotationText:
      'Error at Step 1 (90% confidence) × Step 2 (85%) = 76.5% final confidence. Report overall confidence; trace which step failed.',
  },
  {
    id: 'disc-007',
    title: 'Unlinked Cross-Source Information',
    description:
      'Confluence ADR-2025-047, Slack #eng-infrastructure discussion (Sept 14), and Jira epic ENG-1847 all refer to same decision, but no explicit link. Naive matching has false positive risk.',
    technicalDetail:
      'Implement semantic correlation: extract entities from Confluence page (project name, decision date, topic) → search Slack/Jira for mentions. Build correlation graph. Use embedding-based semantic search: embed Confluence summary → search Slack for semantically similar messages. Risk: false positive correlations (unrelated projects with similar names). Mitigation: manual confirmation for low-confidence matches.',
    relationType: 'reasoning',
    riskLevel: 'red',
    affectedTasks: ['task-004'],
    affectedDataSources: ['source-conf', 'source-slack', 'source-jira', 'source-gdrive'],
    metaPatternTriggered: ['cross-source-join'],
    annotationText:
      'Semantic correlation enables 78% recall (vs 45% keyword-only). Manual confirmation needed for <75% confidence matches.',
  },
  {
    id: 'disc-008',
    title: 'Silent Data Filtering Due to Access Control',
    description:
      'Search finds 4 results: (1) public Confluence (user has access), (2) private Slack thread (user has NO access), (3) Jira task (user has access), (4) Drive file (user has NO access). Filtering returns only 1,3 without flagging hidden results.',
    technicalDetail:
      'Implement transparency: log filtered items (why filtered, what was filtered). If N>1 results filtered, notify: "I found X accessible results and Y inaccessible results. Would you like me to request access?" For sensitive info, pro-actively flag if user might benefit from escalation.',
    relationType: 'hopping',
    riskLevel: 'amber',
    affectedTasks: ['task-006'],
    affectedDataSources: ['source-conf', 'source-slack', 'source-jira', 'source-gdrive'],
    metaPatternTriggered: ['access-control-aware', 'partial-data-handling'],
    annotationText:
      'Filtered results may contain 30% of relevant answer. Always surface when filtering occurs; offer access escalation.',
  },
]

// ─── SaaS Customer Support Discoveries ─────────────────────────────────────

const SAAS_SUPPORT_DISCOVERIES: StructuralDiscovery[] = [
  {
    id: 'disc-001',
    title: 'KB Staleness & False Authority',
    description:
      'Articles can be >30 days old, referencing deprecated UI or old pricing. Agent confidently cites outdated info, causing customer confusion.',
    technicalDetail:
      'Freshness check: 95% articles updated within 30 days, 5% older. Filter articles >30 days old before citing. For old articles, add disclaimer: "Note: This article may be outdated." Implement weekly KB audit.',
    relationType: 'simple',
    riskLevel: 'amber',
    affectedTasks: ['task-002', 'task-004'],
    affectedDataSources: ['source-kb'],
    metaPatternTriggered: ['document-staleness-detection'],
    annotationText:
      'Stale KB articles cause 8% of customer frustration escalations. Add freshness flags to all KB results >30 days old.',
  },
  {
    id: 'disc-002',
    title: 'Sentiment-Tone Mismatch',
    description:
      'Angry customers get frustrated if response is generic/cheerful. Need to detect sentiment and calibrate response tone (empathetic vs casual).',
    technicalDetail:
      'Sentiment classification: NLP detects emotion from ticket text. If angry: response tone should be empathetic, acknowledge frustration, expedite resolution. If positive: can be casual. 68% of angry tickets are escalated; 32% resolved if tone matches.',
    relationType: 'simple',
    riskLevel: 'amber',
    affectedTasks: ['task-004', 'task-001'],
    affectedDataSources: [],
    metaPatternTriggered: ['sentiment-aware-response'],
    annotationText:
      'Tone mismatch increases 15% escalation rate for angry customers. Implement sentiment detection + response tone calibration.',
  },
  {
    id: 'disc-003',
    title: 'Precondition Complexity for Actions',
    description:
      'Cannot upgrade if suspended. Cannot reset password if email invalid. Cannot toggle feature if plan tier doesn\'t support. Each action has 3-5 preconditions.',
    technicalDetail:
      'Precondition validation matrix: (action type) × (account status, payment status, plan tier, feature availability). 94% success; 6% blocked. When blocked, explain reason clearly. Offer alternative (e.g., "Pay overdue invoice first, then try upgrade").',
    relationType: 'simple',
    riskLevel: 'amber',
    affectedTasks: ['task-003', 'task-004'],
    affectedDataSources: ['source-db', 'source-api'],
    metaPatternTriggered: ['action-precondition-validation'],
    annotationText:
      'Blocked actions without explanations cause 12% escalations. Always explain precondition failure + offer workaround.',
  },
  {
    id: 'disc-004',
    title: 'Escalation Queue Bottleneck',
    description:
      'If KB search finds no match (26% of tickets) and actions don\'t apply, ticket escalates. Escalation queue backs up during peak hours (3pm-5pm EST). 12-person team; avg 3-hour resolution.',
    technicalDetail:
      'Escalation distribution: Engineering 28%, Billing 12%, Sales 8%, General 48%, Supervisor 4%. Peak hours: 50+ tickets queued. Target: <30 min assignment. Implement priority routing (P1 before P4), skill-based assignment, load balancing. Monitor queue depth; alert if >50 pending.',
    relationType: 'branching',
    riskLevel: 'red',
    affectedTasks: ['task-005'],
    affectedDataSources: [],
    metaPatternTriggered: ['escalation-queue-management'],
    annotationText:
      'Peak-hour queue depth 50+; SLA miss 18% during 3-5pm. Implement priority routing + load balancing to reduce queue wait.',
  },
]

// ─── FAQ Knowledge Agent Discoveries ────────────────────────────────────────

const FAQ_AGENT_DISCOVERIES: StructuralDiscovery[] = [
  {
    id: 'disc-001',
    title: 'Document Overlap & Redundancy',
    description:
      'Remote work eligibility documented in 3 places: Remote Work Policy (2,400 words, Jan 2025), Office Procedures (800 words, Sep 2024), Onboarding Guide (300 words, Dec 2024).',
    technicalDetail:
      'Agent must identify authoritative source (most recent by modified date) and reconcile discrepancies. Tag most recent as authoritative; include reconciliation note if other versions consulted. Recommend linking documents to eliminate duplication.',
    relationType: 'simple',
    riskLevel: 'amber',
    affectedTasks: ['task-002', 'task-003'],
    affectedDataSources: ['source-kb'],
    metaPatternTriggered: ['document-deduplication'],
    annotationText:
      'Overlapping docs with different effective dates cause 22% of customer clarification requests. Consolidate into single authoritative source.',
  },
  {
    id: 'disc-002',
    title: 'Category Boundary Ambiguity',
    description:
      '"Equipment reimbursement for remote setup" spans IT Guides (equipment request, $600 budget), Benefits & Perks (approval), Travel & Expenses (reimbursement), Onboarding (first-day allocation).',
    technicalDetail:
      'Agent must search across categories, consolidate answers, clarify which policy applies (first-day vs later request). Implement multi-category search with ranked consolidation; suggest all related docs. Add cross-reference links in each doc.',
    relationType: 'branching',
    riskLevel: 'amber',
    affectedTasks: ['task-001', 'task-002', 'task-003'],
    affectedDataSources: ['source-kb'],
    metaPatternTriggered: ['cross-category-linking'],
    annotationText:
      'Multi-category questions require 3-5 doc searches. Implement relationship mapping: equipment-request → approval → reimbursement workflow.',
  },
]

// ─── Mapping and Lookup ────────────────────────────────────────────────────

function buildRiskTierSummary(discoveries: StructuralDiscovery[]): RiskTierSummary {
  const grouped = {
    green: discoveries.filter((d) => d.riskLevel === 'green'),
    amber: discoveries.filter((d) => d.riskLevel === 'amber'),
    red: discoveries.filter((d) => d.riskLevel === 'red'),
  }

  return {
    green: {
      count: grouped.green.length,
      label: 'Direct Lookups — Low Risk',
      items: grouped.green,
    },
    amber: {
      count: grouped.amber.length,
      label: 'Cross-Source Queries — Medium Risk',
      items: grouped.amber,
    },
    red: {
      count: grouped.red.length,
      label: 'Reasoning Chains — High Risk',
      items: grouped.red,
    },
  }
}

const STRUCTURAL_DISCOVERIES_MAP: Record<string, StructuralDiscovery[]> = {
  'invoice-processing': INVOICE_PROCESSING_DISCOVERIES,
  'enterprise-rag': ENTERPRISE_RAG_DISCOVERIES,
  'saas-customer-support': SAAS_SUPPORT_DISCOVERIES,
  'faq-knowledge': FAQ_AGENT_DISCOVERIES,
}

export function getStructuralDiscoveries(tileId: string | null): StructuralDiscovery[] | null {
  if (!tileId) return null
  return STRUCTURAL_DISCOVERIES_MAP[tileId] ?? null
}

export function getRiskTierSummary(tileId: string | null): RiskTierSummary | null {
  if (!tileId) return null
  const discoveries = STRUCTURAL_DISCOVERIES_MAP[tileId]
  if (!discoveries) return null
  return buildRiskTierSummary(discoveries)
}

export function getAllStructuralDiscoveries(): Record<string, StructuralDiscovery[]> {
  return STRUCTURAL_DISCOVERIES_MAP
}

export function getDiscoveryById(
  tileId: string | null,
  discoveryId: string
): StructuralDiscovery | null {
  if (!tileId) return null
  const discoveries = STRUCTURAL_DISCOVERIES_MAP[tileId]
  if (!discoveries) return null
  return discoveries.find((d) => d.id === discoveryId) ?? null
}

export function getDiscoveriesByRiskLevel(
  tileId: string | null,
  riskLevel: RiskLevel
): StructuralDiscovery[] | null {
  if (!tileId) return null
  const discoveries = STRUCTURAL_DISCOVERIES_MAP[tileId]
  if (!discoveries) return null
  return discoveries.filter((d) => d.riskLevel === riskLevel)
}

export function getDiscoveriesByAffectedTask(
  tileId: string | null,
  taskId: string
): StructuralDiscovery[] | null {
  if (!tileId) return null
  const discoveries = STRUCTURAL_DISCOVERIES_MAP[tileId]
  if (!discoveries) return null
  return discoveries.filter((d) => d.affectedTasks.includes(taskId))
}
