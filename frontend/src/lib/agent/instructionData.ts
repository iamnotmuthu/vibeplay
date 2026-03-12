import type { InstructionStep } from '@/store/agentTypes'

// ─── Per-Tile Instruction Data ──────────────────────────────────────────
// Covers all 10 tiles: 4 original (FAQ, Doc Intelligence, Research, Dental)
// plus 6 new (SaaS Copilot, Ops Agent, Coding Agent, On-Prem Assistant,
// Multimodal Agent, Consumer Chat). Each tile has a variable number of
// instruction steps based on genuine workflow complexity.
// Business mode sees label + description.
// Technical mode also sees dataSource, retrievalType, toolInvocation,
// routingRule, errorHandling, escalationCondition.
// Note: Step counts vary by use case (simple ≈ 6-8, complex ≈ 8-10)
// to reflect genuine workflow differences, not template padding.

export interface InstructionSetPayload {
  steps: InstructionStep[]
  businessSummary: string
  technicalSummary: string
}

// ─── FAQ & Knowledge Agent ──────────────────────────────────────────────

const FAQ_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering intake, retrieval, answer generation, and closure. Designed to resolve ~85% of queries autonomously — the agent only escalates when confidence drops below 80% or the topic is flagged as sensitive. Target: median response time under 2 seconds.',
  technicalSummary:
    'Instruction graph with single-hop retrieval, cosine similarity ranking, and a confidence threshold gate at step 4. Step 7 loops back to step 1 for follow-ups (not a DAG — intentional cycle with session TTL guard). Estimated p95 latency: 1.8s for single-turn, 3.2s with follow-up loop.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Query',
      description:
        'Capture the customer question and normalize it — strip greetings, fix typos, extract intent.',
      technicalDetail:
        'Input normalization via regex + lightweight intent classifier (zero-shot, ~50ms). Outputs: cleaned_query, detected_intent, language_code.',
      dataSource: 'Inbound message queue',
      retrievalType: 'none',
      toolInvocation: 'input-validator → intent-classifier',
      errorHandling: 'If intent classification confidence < 0.4, ask a single clarifying question before proceeding.',
    },
    {
      stepNumber: 2,
      label: 'Search Knowledge Base',
      description:
        'Find the most relevant articles or FAQ entries that match the customer question.',
      technicalDetail:
        'Embedding search against vector index (1,200 documents, ~800 avg tokens). Top-5 retrieval with cosine similarity threshold ≥ 0.72. Fallback to BM25 keyword search if vector results < 3.',
      dataSource: 'Knowledge base vector index',
      retrievalType: 'single-hop-rag',
      toolInvocation: 'embedding-search → bm25-fallback',
      errorHandling: 'If vector index unavailable, fall back to BM25-only. If both fail, respond with "I\'m having trouble searching right now" and offer to connect to a human.',
    },
    {
      stepNumber: 3,
      label: 'Extract Answer',
      description:
        'Pull the specific answer from the retrieved documents and assemble it into a coherent response.',
      technicalDetail:
        'Extractive QA with span highlighting. Source attribution required — every claim maps to a document section. Max response length: 300 tokens.',
      dataSource: 'Retrieved documents (top-5)',
      retrievalType: 'extractive',
      toolInvocation: 'extractive-qa → source-attributor',
      errorHandling: 'If extraction returns zero spans, attempt generative QA with explicit "based on available information" framing. If source attribution fails, mark response as "unverified" and route to supervised.',
    },
    {
      stepNumber: 4,
      label: 'Confidence Check',
      description:
        'Evaluate whether the answer is reliable enough to send autonomously, or if a human should review it first.',
      technicalDetail:
        'Confidence scoring: semantic similarity between query and answer (threshold ≥ 0.80 for autonomous, 0.60-0.79 for supervised review, < 0.60 for escalation). Also checks for sensitive topic flags.',
      routingRule: 'confidence ≥ 0.80 → autonomous | 0.60-0.79 → supervised | < 0.60 → escalate',
      escalationCondition: 'Low confidence OR topic flagged as sensitive (legal, billing disputes, complaints)',
    },
    {
      stepNumber: 5,
      label: 'Generate Response',
      description:
        'Format the answer in the right tone and structure for the customer channel — email, chat, or phone script.',
      technicalDetail:
        'Template selection based on channel + tone preset. Response includes: answer body, source links, suggested follow-ups. Token budget: 200 for chat, 400 for email.',
      toolInvocation: 'response-formatter → tone-adjuster',
      errorHandling: 'If template rendering fails, send plain-text response with source links. Log template failure for ops review.',
    },
    {
      stepNumber: 6,
      label: 'Suggest Related Topics',
      description:
        'Proactively surface 2-3 related questions the customer might have, based on what others commonly ask next.',
      technicalDetail:
        'Co-occurrence lookup from query-pair frequency table. Filters out topics already answered in this session. Max 3 suggestions, each with a relevance score.',
      dataSource: 'Query co-occurrence index',
      retrievalType: 'lookup',
      toolInvocation: 'suggestion-engine',
    },
    {
      stepNumber: 7,
      label: 'Check for Follow-Up',
      description:
        'Ask if the customer needs anything else. If yes, loop back to step 1 with conversation context preserved.',
      technicalDetail:
        'Binary classification on customer reply: resolved vs. follow-up. If follow-up, append conversation context (last 3 turns) and re-enter at step 1. Session TTL: 15 minutes.',
      routingRule: 'resolved → step 8 | follow-up → step 1 (with context)',
    },
    {
      stepNumber: 8,
      label: 'Close & Log',
      description:
        'End the conversation, log the interaction for analytics, and trigger a satisfaction survey if configured.',
      technicalDetail:
        'Writes interaction record: query, intent, retrieved_docs, response, confidence_score, resolution_status, duration_ms. Triggers CSAT webhook if enabled.',
      toolInvocation: 'interaction-logger → csat-trigger',
    },
  ],
}

// ─── Document Intelligence Agent ────────────────────────────────────────

const DOC_INTEL_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering document intake, classification, extraction, cross-referencing, and risk flagging. Handles 14 document types across 6 risk categories. Standard contracts (< $50K, no flags) auto-file in ~4 seconds. Non-standard clauses and high-value documents route for human review.',
  technicalSummary:
    'Instruction graph with two parallel branches: extraction pipeline and classification pipeline, merging at step 5 for cross-reference validation. Uses layout-aware parsing for tables and OCR for scanned inputs. 47 risk rules evaluated per document. Estimated p95 latency: 4.2s per document, 8.1s with cross-reference.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Document',
      description:
        'Accept the incoming document, detect its format (PDF, Word, scan), and route it to the right parser.',
      technicalDetail:
        'MIME type detection + magic byte analysis. Supported formats: PDF (native + scanned), DOCX, XLSX, images (JPG/PNG for OCR). Max file size: 25MB. Outputs: raw_text, layout_metadata, page_count.',
      dataSource: 'Document upload endpoint',
      retrievalType: 'none',
      toolInvocation: 'format-detector → parser-router',
      errorHandling: 'Unsupported format → reject with specific error. Corrupt file → retry with alternative parser. OCR confidence < 0.7 → flag for manual review.',
    },
    {
      stepNumber: 2,
      label: 'Classify Document',
      description:
        'Determine what type of document this is — contract, invoice, report, amendment — and which department it belongs to.',
      technicalDetail:
        'Multi-label classifier trained on 14 document types. Uses first-page features + structural patterns (table density, header format, signature blocks). Classification confidence threshold: 0.85.',
      toolInvocation: 'document-classifier',
      routingRule: 'classification confidence ≥ 0.85 → proceed | < 0.85 → flag for manual classification',
      errorHandling: 'If classifier returns multiple types with similar confidence (within 0.05), present top-2 options to reviewer for disambiguation.',
    },
    {
      stepNumber: 3,
      label: 'Extract Key Terms',
      description:
        'Pull out the critical data points — dates, amounts, party names, obligations, payment terms, termination clauses.',
      technicalDetail:
        'Named entity extraction + clause detection. For contracts: 23 standard fields (parties, effective_date, term, auto_renew, liability_cap, indemnification, governing_law, etc.). For invoices: line_items, tax, total, due_date, payment_terms. Extraction uses layout-aware spans for table data.',
      dataSource: 'Parsed document text + layout metadata',
      retrievalType: 'extractive',
      toolInvocation: 'entity-extractor → clause-detector → table-parser',
      errorHandling: 'If extraction yields < 5 of 23 standard fields, flag as "incomplete extraction" — likely non-standard document format requiring manual review.',
    },
    {
      stepNumber: 4,
      label: 'Flag Risks',
      description:
        'Compare extracted terms against standard benchmarks and company policy. Flag anything unusual — missing clauses, unfavorable terms, amounts above thresholds.',
      technicalDetail:
        'Rule engine with 47 risk rules across 6 categories: financial exposure (liability cap vs. contract value), missing protections (no indemnification, no IP assignment), non-standard terms (auto-renew > 1yr, unusual jurisdiction), regulatory triggers (GDPR, export control). Each flag scored: low / medium / high / critical.',
      dataSource: 'Company policy templates + risk rule engine',
      routingRule: 'critical risk → escalate to legal | high risk → supervised review | medium/low → autonomous',
      escalationCondition: 'Any critical risk flag, or contract value > $500K, or counterparty on watch list',
    },
    {
      stepNumber: 5,
      label: 'Cross-Reference',
      description:
        'Check this document against existing agreements with the same counterparty — are there conflicts, superseded terms, or duplicate obligations?',
      technicalDetail:
        'Counterparty lookup in contract repository (average 3.2 related docs per counterparty). Clause-level diff between current and existing terms. Conflict detection for: payment terms, liability, exclusivity, non-compete radius.',
      dataSource: 'Contract repository (PostgreSQL + vector index)',
      retrievalType: 'multi-hop',
      toolInvocation: 'counterparty-matcher → clause-differ',
      errorHandling: 'If counterparty not found in repository, skip cross-reference and note "no prior agreements on file" in summary. If clause-differ timeout (> 10s), partial results with warning.',
    },
    {
      stepNumber: 6,
      label: 'Generate Summary',
      description:
        'Create a structured summary report — key terms, risk flags, cross-reference findings, and a recommended action (approve, review, reject).',
      technicalDetail:
        'Template-based report generation. Sections: Executive Summary (3 sentences), Key Terms Table, Risk Flags (with severity badges), Cross-Reference Findings, Recommendation. Output formats: PDF, Markdown, JSON.',
      toolInvocation: 'report-generator → pdf-renderer',
    },
    {
      stepNumber: 7,
      label: 'Route for Action',
      description:
        'Send the summary to the right person — standard documents auto-file, flagged documents go to the assigned reviewer with context.',
      technicalDetail:
        'Routing matrix: document_type × risk_level × contract_value → assignee. Auto-file criteria: standard template, no risk flags, value < $50K. Notification via email + Slack with deep link to review dashboard.',
      routingRule: 'auto-file | assigned-reviewer | legal-escalation',
      toolInvocation: 'router → notification-sender',
    },
    {
      stepNumber: 8,
      label: 'Archive & Learn',
      description:
        'File the processed document with all metadata, update the risk rule engine if the reviewer made corrections, and log processing metrics.',
      technicalDetail:
        'Writes to document archive: original_file, extracted_data, risk_flags, cross_ref_results, reviewer_actions, processing_time_ms. Feedback loop: if reviewer overrides a risk flag, logs the override for quarterly rule tuning.',
      toolInvocation: 'archiver → feedback-collector → metrics-logger',
    },
  ],
}

// ─── Research & Comparison Agent ────────────────────────────────────────

const RESEARCH_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering research scoping, multi-source search, evidence collection, comparison matrix generation, and recommendation synthesis. Searches ~2,400 vendor records + web sources in parallel. All final recommendations require human approval — no autonomous distribution of research outputs.',
  technicalSummary:
    'Instruction graph with parallel search branches, evidence aggregation, and a synthesis step producing a scored comparison matrix. Iterative refinement loop at step 4 (max 3 rounds, guarded). Sensitivity analysis on final ranking. Estimated p95 latency: 12s single-pass, 28s with full refinement.',
  steps: [
    {
      stepNumber: 1,
      label: 'Scope Research',
      description:
        'Understand what needs to be researched — the question, the criteria that matter, the constraints (budget, timeline, geography), and who the output is for.',
      technicalDetail:
        'Structured intake: research_question, evaluation_criteria[] (weighted), constraints{}, audience, output_format. If criteria weights are missing, defaults to equal weighting. Validates that at least 3 criteria are specified.',
      errorHandling: 'If fewer than 3 evaluation criteria provided, prompt user for additional criteria before proceeding.',
    },
    {
      stepNumber: 2,
      label: 'Search Sources',
      description:
        'Search across multiple data sources simultaneously — internal databases, public APIs, web content, and uploaded reference documents.',
      technicalDetail:
        'Parallel search across: internal vendor DB (PostgreSQL, ~2,400 records), web search API (top-20 results per query), uploaded reference docs (vector search). Query expansion: original query + 2 reformulations. Deduplication by entity matching.',
      dataSource: 'Vendor DB + web API + document uploads',
      retrievalType: 'multi-source-parallel',
      toolInvocation: 'search-orchestrator → query-expander → deduplicator',
      errorHandling: 'If any source times out (> 5s), proceed with available results and note "partial coverage" in report. If all sources fail, abort with clear error.',
    },
    {
      stepNumber: 3,
      label: 'Collect Evidence',
      description:
        'For each candidate found, extract the specific data points that map to the evaluation criteria — pricing, features, reviews, compliance status.',
      technicalDetail:
        'Per-candidate extraction against criteria schema. Handles missing data: marks as "not found" with source coverage percentage. Normalizes units (pricing to annual, dates to ISO). Evidence provenance tracked per data point.',
      dataSource: 'Search results from step 2',
      retrievalType: 'extractive',
      toolInvocation: 'evidence-extractor → unit-normalizer → provenance-tracker',
      errorHandling: 'If > 40% of criteria cells are "not found" for a candidate, flag candidate as "insufficient data" rather than scoring with zeros.',
    },
    {
      stepNumber: 4,
      label: 'Validate Data',
      description:
        'Check the collected evidence for consistency — do the numbers add up? Are there contradictions between sources? Flag any data that looks unreliable.',
      technicalDetail:
        'Cross-source validation: if two sources disagree on a data point, flag as "conflicting" and present both values. Outlier detection for numerical data (> 2σ from peer group). Source reliability scoring based on recency + authority.',
      routingRule: 'All data validated → step 5 | > 30% conflicting data → request additional sources (loop to step 2, max 3 rounds)',
    },
    {
      stepNumber: 5,
      label: 'Build Comparison Matrix',
      description:
        'Organize all candidates into a side-by-side comparison matrix, scored against the weighted criteria from step 1.',
      technicalDetail:
        'Matrix construction: candidates × criteria. Each cell contains: raw_value, normalized_score (0-100), confidence_level, source_count. Weighted aggregate score calculated. Missing data cells scored as 0 with penalty flag.',
      toolInvocation: 'matrix-builder → score-calculator',
      errorHandling: 'If fewer than 2 candidates survive validation, notify user that research scope may be too narrow and offer to broaden criteria.',
    },
    {
      stepNumber: 6,
      label: 'Synthesize Recommendation',
      description:
        'Generate a ranked recommendation with a clear rationale — why the top choice wins, where the runner-up is better, and what trade-offs exist.',
      technicalDetail:
        'Recommendation engine: top-3 ranking with per-criterion breakdown. Sensitivity analysis: "if you value X more, then Y becomes the winner." Trade-off narrative generated for each pairwise comparison. Confidence interval on final ranking.',
      toolInvocation: 'recommendation-engine → sensitivity-analyzer → narrative-generator',
      escalationCondition: 'If top-2 candidates are within 5 points of each other, flag as "too close to call" and require human judgment.',
    },
    {
      stepNumber: 7,
      label: 'Generate Report',
      description:
        'Package everything into a polished report — executive summary, comparison matrix, detailed analysis per candidate, and appendices with raw data.',
      technicalDetail:
        'Report template: Executive Summary (250 words), Methodology, Comparison Matrix (interactive table), Candidate Deep Dives (per candidate), Sensitivity Analysis, Appendix (raw data, source list). Output: PDF + interactive HTML.',
      toolInvocation: 'report-generator → chart-renderer → pdf-builder',
    },
    {
      stepNumber: 8,
      label: 'Submit for Review',
      description:
        'All research recommendations require human approval before distribution. Send the report to the designated decision-maker with a review deadline.',
      technicalDetail:
        'Mandatory human-in-the-loop gate. Report sent to assignee with: review dashboard link, approval/reject/revise actions, SLA timer (default: 48h). No autonomous distribution of recommendations.',
      routingRule: 'Always supervised — no autonomous distribution',
      escalationCondition: 'If review SLA expires without action, escalate to manager.',
      toolInvocation: 'review-router → sla-tracker → notification-sender',
    },
  ],
}

// ─── Decision & Workflow Agent (Dental Practice) ───────────────────────────

const DENTAL_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering patient inquiry intake, clinical triage, appointment and insurance workflows, treatment plan queries, and emergency routing. Handles scheduling and insurance lookups autonomously (~62% of inquiries). Clinical questions always route to staff — zero autonomous clinical decisions. Emergency classification in < 5 seconds.',
  technicalSummary:
    'Multi-branch instruction graph with clinical decision paths, HIPAA-compliant data handling (AES-256 at rest, TLS 1.3 in transit), and mandatory escalation for clinical judgment calls. Three parallel execution lanes: administrative (autonomous), clinical-adjacent (supervised), clinical (escalation-only). All PHI access logged to immutable audit trail. Estimated p95 latency: 2.1s admin, 8.5s clinical-adjacent.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Patient Inquiry',
      description:
        'Capture the patient message, identify them if possible, and determine whether this is an administrative question, a clinical question, or an emergency.',
      technicalDetail:
        'Intent classification across 3 lanes: administrative (scheduling, billing, insurance), clinical-adjacent (treatment plan questions, post-procedure concerns), clinical-emergency (pain, swelling, bleeding, trauma). Patient identification via phone number or appointment ID lookup. HIPAA: no PHI in logs until identity confirmed.',
      dataSource: 'Inbound message + patient directory',
      retrievalType: 'lookup',
      toolInvocation: 'intent-classifier → patient-identifier',
      errorHandling: 'Unidentified patient → proceed with limited scope (general info only, no PHI access, patient_id=null in audit log). Emergency keywords detected → skip to step 4 immediately regardless of identification status.',
    },
    {
      stepNumber: 2,
      label: 'Route by Domain',
      description:
        'Send the inquiry down the right path — scheduling goes to the calendar system, insurance goes to the benefits engine, clinical questions get triaged separately.',
      technicalDetail:
        'Routing matrix: intent_category × patient_status × urgency → execution_lane. Administrative lane: autonomous execution with audit log. Clinical-adjacent lane: supervised with provider notification. Clinical lane: immediate escalation with context package.',
      routingRule: 'administrative → autonomous | clinical-adjacent → supervised | clinical → escalate | emergency → step 4 (bypass)',
      errorHandling: 'If routing matrix returns ambiguous lane (two lanes with equal weight), default to the more restrictive lane (supervised > autonomous, escalation > supervised).',
    },
    {
      stepNumber: 3,
      label: 'Execute Workflow',
      description:
        'For administrative tasks: check availability, verify insurance, look up policies. For clinical-adjacent: retrieve treatment plan details, check follow-up schedules, pull post-procedure instructions from approved templates.',
      technicalDetail:
        'Administrative tools: calendar-api (read/write), insurance-verifier (real-time eligibility check, ~1.2s), policy-lookup. Clinical-adjacent tools: treatment-plan-reader (read-only), follow-up-template-matcher, post-procedure-instructions (approved template library, 34 templates). All data access logged to HIPAA audit trail.',
      dataSource: 'Practice management system + insurance API + approved template library',
      retrievalType: 'multi-source',
      toolInvocation: 'calendar-api | insurance-verifier | treatment-plan-reader | template-matcher',
    },
    {
      stepNumber: 4,
      label: 'Emergency Triage',
      description:
        'If emergency indicators are detected at any step, immediately classify severity and route to the appropriate clinical resource. The agent provides comfort instructions from approved templates but never diagnoses.',
      technicalDetail:
        'Emergency classifier: 4 severity levels (immediate/urgent/semi-urgent/non-urgent) based on symptom keyword matching + patient history flags. Immediate/urgent: page on-call provider within 30 seconds (SLA < 5s for classification). Semi-urgent: schedule same-day callback. All emergency interactions logged with full transcript for clinical review.',
      routingRule: 'immediate/urgent → page on-call provider | semi-urgent → same-day callback | non-urgent → scheduled follow-up',
      escalationCondition: 'ALL emergency classifications escalate. Agent provides only pre-approved comfort instructions (e.g., "Apply cold compress and avoid chewing on that side") — never clinical advice.',
      toolInvocation: 'emergency-classifier → provider-pager → comfort-template-sender',
    },
    {
      stepNumber: 5,
      label: 'Confidence Gate',
      description:
        'Before sending any response, verify that the answer is within the agent\'s authorized scope. Administrative answers send directly. Anything touching clinical judgment requires provider sign-off.',
      technicalDetail:
        'Scope validator checks response against authorized-response-registry. Three gates: (1) Is the topic in the autonomous list? (2) Does the response contain clinical language not from an approved template? (3) Is the patient flagged for provider-only communication? Any gate failure → supervised or escalation.',
      routingRule: 'all gates pass → autonomous send | gate 2 or 3 fail → supervised | clinical content detected → escalate',
      errorHandling: 'If scope validator cannot determine category (unknown topic), default to supervised mode and log for rule expansion review.',
    },
    {
      stepNumber: 6,
      label: 'Send Response',
      description:
        'Deliver the answer to the patient through their preferred channel — SMS, patient portal, or phone callback. Include relevant links or next steps.',
      technicalDetail:
        'Channel selection from patient preferences (SMS 62%, portal 28%, phone 10% in typical practice). Response includes: answer body, action items, relevant links (portal booking, forms). Character limit: SMS 160 × 3 segments max. Portal: rich text with attachments.',
      toolInvocation: 'channel-selector → message-sender → link-generator',
      errorHandling: 'If preferred channel delivery fails (SMS gateway down, portal timeout), retry on next-preferred channel. If all channels fail, queue for manual outreach by front desk.',
    },
    {
      stepNumber: 7,
      label: 'Proactive Follow-Up',
      description:
        'Check if this interaction triggers any follow-up actions — appointment reminders, insurance pre-auth submissions, or post-procedure check-in scheduling.',
      technicalDetail:
        'Follow-up rule engine: 12 trigger rules (e.g., "if appointment scheduled → send reminder at T-24h and T-2h", "if insurance verified → submit pre-auth within 4h", "if post-extraction → schedule 48h check-in"). Follow-ups queued with specified delays.',
      dataSource: 'Follow-up rule engine + patient timeline',
      toolInvocation: 'follow-up-scheduler → reminder-queue',
    },
    {
      stepNumber: 8,
      label: 'Close & Audit Log',
      description:
        'End the interaction, log everything for HIPAA compliance, and update the patient record with any new information or scheduled actions.',
      technicalDetail:
        'HIPAA audit record (immutable, AES-256 encrypted): interaction_id, patient_id (or null if unidentified — interaction still logged with session_id for correlation), timestamp, intent_classification, data_accessed[], response_sent, escalation_flag, provider_notified, follow-ups_scheduled. Retention: 7 years per HIPAA §164.530(j). Unidentified patient interactions logged with masked session data — no PHI association until identity confirmed. Patient record update: append interaction summary to patient timeline. Satisfaction survey: triggered for administrative interactions only (not clinical).',
      toolInvocation: 'audit-logger → patient-record-updater → csat-trigger (admin only)',
    },
  ],
}

// ─── SaaS In-App Product Assistant ──────────────────────────────────────

const SAAS_COPILOT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Seven steps covering natural language command interpretation, permission validation, API execution planning, and result formatting. Handles autonomous reads (dashboards, reports) and supervised writes (create, update, delete). Users say "create a Q4 revenue report" and the agent builds the right API call. Target: median latency 800ms for reads, supervised confirmation < 2s for writes.',
  technicalSummary:
    'Instruction graph with command parsing, scope validation, and dual execution paths: autonomous (read-only API calls) vs. supervised (state-changing mutations). Uses semantic routing to map natural language to API endpoint, with parameter extraction and confidence gating. Estimated p95 latency: 1.2s reads, 3.5s writes (includes confirmation round-trip).',
  steps: [
    {
      stepNumber: 1,
      label: 'Parse Natural Language Command',
      description:
        'Extract the user intent, identify the target resource, and infer the required action — read, create, update, delete, or export.',
      technicalDetail:
        'Command parser using intent classification (zero-shot) + semantic routing. Outputs: intent (read|create|update|delete|export), resource_type, operation_scope, parameters{}, confidence_score. Parser confidence threshold: ≥ 0.78.',
      dataSource: 'Inbound user message',
      retrievalType: 'none',
      toolInvocation: 'intent-classifier → semantic-router',
      errorHandling: 'If confidence < 0.78, ask clarifying question: "Do you want to [summarize this OR create a new version]?" before proceeding.',
    },
    {
      stepNumber: 2,
      label: 'Validate User Permissions',
      description:
        'Check whether the current user has permission to perform this action on the requested resource — reading, creating, modifying, deleting.',
      technicalDetail:
        'RBAC + attribute-based access control (ABAC). Checks: user_role, resource_org_id, action_type, resource_data_classification. Denials logged for audit trail. If denied, return specific reason: "You can read Team dashboards but not modify Company-level settings."',
      dataSource: 'Identity provider + permission matrix',
      retrievalType: 'lookup',
      toolInvocation: 'rbac-validator → audit-logger',
      errorHandling: 'If permission check times out (> 2s), fail-safe to deny. If permission service unavailable, respond: "I can\'t verify your permissions right now. Try again in a moment."',
    },
    {
      stepNumber: 3,
      label: 'Extract and Validate Parameters',
      description:
        'Pull out the specific values from the natural language command — which report, which date range, which filters — and validate them against the schema.',
      technicalDetail:
        'Parameter extraction via NER + type coercion. Validates: required fields present, type correctness (date format, numeric range), enum values valid. Handles ambiguity: "last week" → infer as "past 7 days from today". Missing required params: prompt user instead of guessing.',
      errorHandling: 'Type coercion failure (invalid date format, out-of-range number) → ask user for clarification with example: "I didn\'t understand the date. Can you say it as YYYY-MM-DD?"',
    },
    {
      stepNumber: 4,
      label: 'Route to Execution Path',
      description:
        'Decide: is this a read-only operation (autonomous) or a write operation (needs confirmation)? Route accordingly.',
      technicalDetail:
        'Router logic: intent == read OR export → autonomous_path | intent == create|update|delete → supervised_path | intent == unknown → ask',
      routingRule: 'read|export → step 5 (autonomous) | create|update|delete → step 5.alt (supervised)',
      errorHandling: 'If operation is technically read but accesses sensitive data (PII, classified), upgrade to supervised path.',
    },
    {
      stepNumber: 5,
      label: 'Execute API Call (Autonomous Reads)',
      description:
        'For read-only operations: construct the API call, execute it, and return results without requiring confirmation.',
      technicalDetail:
        'API call builder generates request body, headers, query params. Executes via REST/GraphQL client. Applies result filtering: max 500 rows, max 50KB response. Timeout: 8s. Result transformation to user-friendly format (markdown table, JSON, CSV).',
      dataSource: 'SaaS product API',
      retrievalType: 'api-call',
      toolInvocation: 'api-builder → api-caller → result-transformer',
      errorHandling: 'API errors (4xx/5xx) → map to user-friendly message. 500 errors → "Something went wrong on our end. Your team\'s admin can check system logs." Rate limit (429) → "I\'m getting a lot of requests. Try again in 60 seconds."',
    },
    {
      stepNumber: 6,
      label: 'Request Confirmation (Writes)',
      description:
        'For create/update/delete operations: show the user exactly what will happen and ask them to approve before executing.',
      technicalDetail:
        'Confirmation summary: action (create|update|delete), resource details (affected rows, changed fields, business impact). User must explicitly respond "yes" or "confirm". Confirmation timeout: 15 minutes. Failed confirmations logged for security.',
      routingRule: 'If user confirms → step 6.alt | If user declines or times out → abort and log',
      errorHandling: 'Expired confirmation → respond: "Your approval request timed out. Please restate your command and I\'ll ask again."',
    },
    {
      stepNumber: 6.1,
      label: 'Execute API Call (Supervised Writes)',
      description:
        'After confirmation, construct and execute the write API call. Log the action with user identity and outcome.',
      technicalDetail:
        'Write API execution with transaction rollback on error. Logs: user_id, action, resource_id[], timestamp, result (success|error|partial). For large batch writes (> 1000 rows), uses async job with status tracking.',
      toolInvocation: 'write-api-builder → api-caller → transaction-logger → async-job-tracker',
      errorHandling: 'Validation error (e.g., duplicate name) → fail before execution. Conflict error (concurrency) → "Someone else just modified this. Reload and try again."',
    },
    {
      stepNumber: 7,
      label: 'Format and Deliver Result',
      description:
        'Present the result to the user in the format that makes sense — a summary sentence, a table, a chart, or a file download link.',
      technicalDetail:
        'Smart format selection: if 1-3 rows → inline table | 4-20 rows → markdown table | 20+ rows → CSV download link. For creation: "Created 5 new reports. View them here [link]." For updates: "Updated 12 records. See changes [link]."',
      toolInvocation: 'result-formatter → link-generator',
    },
  ],
}

// ─── Background Task Manager / Ops Orchestrator ──────────────────────────

const OPS_AGENT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Seven steps covering nightly batch pipeline orchestration, job DAG execution, retry logic, failure handling, and monitoring. Orchestrates 40+ scheduled jobs (ETL, reporting, cleanup, integrations). Auto-retry transient failures up to 3 times. Critical job failures page ops team within 30 seconds. Median pipeline runtime: 45 minutes with 94% success on first attempt.',
  technicalSummary:
    'Instruction graph with DAG executor, exponential backoff retry logic, health check gates, and incident escalation. Manages job dependencies (fan-out/fan-in patterns), parallel execution batches, and resource allocation. Monitors 12 failure patterns (timeout, OOM, external API error, etc.). Estimated p50 orchestration latency: 2.1s per job dispatch, end-to-end pipeline: 45m.',
  steps: [
    {
      stepNumber: 1,
      label: 'Load Job Schedule',
      description:
        'At scheduled trigger time (or manual trigger), fetch the job DAG configuration, resolve dependencies, and prepare the execution plan.',
      technicalDetail:
        'Loads DAG from schedule store (YAML/JSON). Validates: all dependencies exist, no cycles, all secrets available. Generates execution_plan with topological sort. Estimated prep time: 200ms.',
      dataSource: 'Job schedule store + secret vault',
      retrievalType: 'lookup',
      toolInvocation: 'schedule-loader → dag-validator → execution-planner',
      errorHandling: 'If secrets unavailable, abort pipeline with alert to ops. If DAG has cycles, log and fail immediately (manual intervention needed).',
    },
    {
      stepNumber: 2,
      label: 'Resource Allocation',
      description:
        'Check available compute resources (CPU, memory, disk) and allocate to the job batch based on resource requirements and priority.',
      technicalDetail:
        'Queries cluster health: available_cpu%, available_memory_gb, disk_io_saturation. Allocates resources by job priority tier (critical/high/normal/low) and estimated resource footprint. Queues low-priority jobs if resources constrained. Max queue wait: 10 minutes before auto-cancel.',
      dataSource: 'Cluster metrics + job priority registry',
      retrievalType: 'lookup',
      toolInvocation: 'cluster-health-checker → resource-allocator → queue-manager',
      errorHandling: 'If cluster < 20% available memory, defer non-critical jobs. If < 5%, abort entire pipeline and page ops.',
    },
    {
      stepNumber: 3,
      label: 'Execute Job Batch',
      description:
        'Launch the first batch of jobs that have no upstream dependencies. Monitor each job for completion, errors, and resource usage.',
      technicalDetail:
        'Launches jobs in parallel (fan-out). Per-job monitoring: CPU%, memory%, execution_time_sec, log streaming to central store (Datadog/ELK). Job timeout: per-job configured value, default 3600s. Kills runaway jobs at timeout.',
      dataSource: 'Job executor cluster',
      retrievalType: 'none',
      toolInvocation: 'job-launcher → process-monitor → log-streamer → timeout-enforcer',
      errorHandling: 'Job failure → immediate capture of stderr. Memory OOM → log for resource tuning. Timeout → escalate if critical job.',
    },
    {
      stepNumber: 4,
      label: 'Retry Logic',
      description:
        'If a job fails, determine if it\'s retryable (transient error) or fatal. For retryable: retry up to 3 times with exponential backoff.',
      technicalDetail:
        'Classifies errors: transient (timeout, 503, connection reset → retryable) vs. fatal (validation error, data type mismatch → non-retryable). Retry strategy: 1s, 4s, 16s backoff. Logs all retry attempts. Success on retry counts as pipeline success.',
      errorHandling: 'After 3 retries, mark job as failed and proceed to step 5 (escalation logic).',
    },
    {
      stepNumber: 5,
      label: 'Escalation & Incident Management',
      description:
        'If a critical or high-priority job fails after all retries, page the ops team and create an incident. For low-priority jobs: log and continue.',
      technicalDetail:
        'Escalation matrix: critical job failure → page on-call immediately (SLA < 30s) | high → alert ops Slack channel + create incident | normal/low → log only. Incident created with: job_id, error_log, last_successful_run, recommended_action.',
      dataSource: 'Job priority registry + escalation rules',
      retrievalType: 'lookup',
      routingRule: 'critical failure → page | high failure → slack alert | low failure → log',
      toolInvocation: 'priority-checker → pager-service → incident-creator → slack-notifier',
      errorHandling: 'If pager service unavailable, fall back to SMS. If all notification channels fail, retry notifications every 2 minutes for 30 minutes.',
    },
    {
      stepNumber: 6,
      label: 'Dependency Resolution',
      description:
        'Once a job completes (success or acceptable failure), mark it done and trigger all jobs waiting on that job\'s output.',
      technicalDetail:
        'Marks job in DAG as completed. Scans for next-stage jobs with all dependencies met. Launches them (back to step 3). Handles partial failures: if a job fails but downstream jobs can proceed with missing data, infers this from dependency metadata and proceeds.',
      toolInvocation: 'dag-state-updater → downstream-trigger',
    },
    {
      stepNumber: 7,
      label: 'Pipeline Completion & Reporting',
      description:
        'After all jobs complete, generate a summary report and log pipeline metrics. Trigger cleanup tasks if configured.',
      technicalDetail:
        'Summary: total_jobs, succeeded, failed, duration_minutes, retries_used, resources_consumed. Generates report in JSON + Markdown. Sends to ops dashboard and emails to stakeholders. Cleanup: removes temporary tables/files. Logs all metrics to monitoring backend (Prometheus/Grafana).',
      toolInvocation: 'pipeline-summarizer → report-generator → email-sender → cleanup-executor → metrics-logger',
      errorHandling: 'Report generation failure → still log metrics to backend; notify ops of reporting failure separately.',
    },
  ],
}

// ─── AI Coding Assistant ─────────────────────────────────────────────────

const CODING_AGENT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering code generation from natural language, style guide compliance review, automated test execution in sandbox, dependency validation, and refactoring suggestions. Generates code snippets or full functions, validates against project conventions, runs tests, checks for security issues. All generated code requires human review before merge. Median latency: 3.2s generation, 2.8s validation.',
  technicalSummary:
    'Instruction graph with code generation (LLM-based), linting/formatting (ESLint, Prettier), automated test execution (Jest/pytest in isolated sandbox), dependency scanning (npm audit, pip-audit), and SAST analysis (Semgrep). All code changes staged in draft state; human review gate required before commit. Estimated p95 latency: 8.5s end-to-end (generation + validation).',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Code Request',
      description:
        'Capture the user requirement: "add a function to validate email", "refactor this loop", "generate a React component for file upload".',
      technicalDetail:
        'Request parser extracts: task_description, context (current_file, language, framework), constraints (performance, security, style). Validates: language supported (JS/TS, Python, Go, Rust, others), project structure accessible.',
      dataSource: 'Inbound user request + project repository',
      retrievalType: 'lookup',
      toolInvocation: 'request-parser → project-context-loader',
      errorHandling: 'Unsupported language → respond with supported list. Missing context → ask for clarification before generating.',
    },
    {
      stepNumber: 2,
      label: 'Retrieve Project Context',
      description:
        'Pull the project\'s style guide, existing code patterns, dependencies, and test infrastructure to inform code generation.',
      technicalDetail:
        'Fetches: package.json (or equivalent), eslint/prettier config, existing similar functions (via vector search on codebase), test examples, documented patterns. Builds context window (max 8K tokens) of relevant examples.',
      dataSource: 'Project repository',
      retrievalType: 'multi-source',
      toolInvocation: 'style-guide-loader → dependency-reader → pattern-finder → example-retriever',
    },
    {
      stepNumber: 3,
      label: 'Generate Code',
      description:
        'Use code generation model (Claude/Copilot) to produce the function, class, or component matching the project style and requirements.',
      technicalDetail:
        'Generation prompt includes: task description, style guide excerpts, code examples, security guidelines. Model: Claude Opus (preferred). Max tokens: 2000. Outputs: code_snippet, explanation, dependencies_used[].',
      toolInvocation: 'code-generator (LLM)',
      errorHandling: 'If generation fails (timeout, overlong output), retry with shorter request. If generation uses unsupported dependencies, reject and ask user to clarify constraints.',
    },
    {
      stepNumber: 4,
      label: 'Lint and Format',
      description:
        'Run the project\'s linter (ESLint, Pylint, etc.) and formatter (Prettier, Black) against the generated code to catch style violations and syntax errors.',
      technicalDetail:
        'Applies project config: eslintrc, prettierrc, black config, etc. Fixes auto-fixable violations (spacing, import order). Reports non-auto-fixable violations. Must pass with 0 non-auto-fixable errors before proceeding.',
      toolInvocation: 'linter → auto-fixer → formatter',
      errorHandling: 'If linting fails with non-auto-fixable errors, regenerate code with linter feedback. If > 3 regenerations needed, escalate to human reviewer.',
    },
    {
      stepNumber: 5,
      label: 'Check Dependencies',
      description:
        'Validate that all dependencies used in the generated code are already in the project, or are approved for installation.',
      technicalDetail:
        'Scans generated code for imports. Checks: each import in package.json or lockfile, version compatibility (no major version conflicts). If new dependency needed, checks: npm audit result (no critical vulns), download popularity (> 1M/week preferred), maintenance status (last update < 2yr ago).',
      dataSource: 'package.json/requirements.txt + npm registry metadata',
      retrievalType: 'lookup',
      toolInvocation: 'import-scanner → dependency-validator → registry-checker',
      errorHandling: 'Unknown dependency or version conflict → flag for human approval. High-risk vulns → reject dependency and ask user to choose alternative.',
    },
    {
      stepNumber: 6,
      label: 'Execute Tests in Sandbox',
      description:
        'Run the generated code against the project\'s test suite in an isolated sandbox environment to ensure it doesn\'t break existing functionality.',
      technicalDetail:
        'Sandbox setup: Docker container or VM with project environment. Runs: unit tests for the function (if tests exist), full test suite if changes are in core areas. Timeout: 30s per test. Captures: test results, coverage%, execution_time.',
      dataSource: 'Project test suite + isolated sandbox',
      retrievalType: 'none',
      toolInvocation: 'sandbox-launcher → test-runner → coverage-analyzer',
      errorHandling: 'Test failure → capture error output and failures_count. If > 20% tests fail, reject generated code and flag for regeneration. Coverage < 70% → warn but proceed.',
    },
    {
      stepNumber: 7,
      label: 'Security & SAST Analysis',
      description:
        'Scan the generated code for common security vulnerabilities (SQL injection, XSS, unsafe deserialization, hard-coded secrets).',
      technicalDetail:
        'Uses Semgrep (configured with OWASP Top 10 rules). Severity levels: high/medium/low/info. Must pass with 0 high-severity issues. Medium issues require human review. Low/info issues logged for reference.',
      toolInvocation: 'semgrep-scanner → vuln-classifier',
      errorHandling: 'High-severity vulns → reject code and explain vulnerability. Medium vulns → proceed to human review (step 8) with warnings.',
    },
    {
      stepNumber: 8,
      label: 'Human Review & Approval',
      description:
        'Present the generated, validated code to the developer for final review. No code is committed without explicit approval.',
      technicalDetail:
        'Generates review package: side-by-side diff (if replacing existing code), validation summary (linting passed, tests passed, security checks), suggested next steps. Requires explicit "approve" response before staging/commit.',
      routingRule: 'All generated code requires human review → mandatory approval gate',
      toolInvocation: 'code-diff-generator → review-presenter → approval-gate',
      errorHandling: 'If developer requests changes → capture feedback and regenerate (back to step 3 with user feedback incorporated).',
    },
  ],
}

// ─── Private & Secure On-Premises Assistant ────────────────────────────

const ONPREM_ASSISTANT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Six steps covering zero-network-traffic design, hardcoded access controls, classified document retrieval, and SCIF-level security compliance. Operates entirely on-premises with no external API calls. Users query classified documents (CONFIDENTIAL, SECRET, TOP SECRET). All queries logged to immutable audit trail with user identity.',
  technicalSummary:
    'Instruction graph with air-gapped architecture (no internet connectivity, hardcoded deny-by-default RBAC). Uses local embedding models (on-premises, no cloud LLM calls). All document retrieval from encrypted vault with mandatory access logging. Security model: AES-256 encryption at rest, TLS 1.3 + mutual auth in transit, hardware-based key storage (HSM). Compliance: NIST SP 800-53 controls, no external data exfiltration possible.',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive Query in Air-Gapped Environment',
      description:
        'Accept user query from hardwired terminal (no internet). Authenticate user against local identity provider (Active Directory/LDAP equivalent).',
      technicalDetail:
        'Input via hardwired keyboard/terminal only (no network input). User auth via local AD (no external RADIUS/SAML). Outputs: user_id, user_clearance_level (CONFIDENTIAL|SECRET|TOP SECRET). All input logged before processing.',
      dataSource: 'Hardwired terminal + local AD',
      retrievalType: 'none',
      toolInvocation: 'terminal-receiver → local-ad-authenticator → input-logger',
      errorHandling: 'Auth failure → terminate session, log failed attempt, sound audible alarm. Unrecognized user → log and reject.',
    },
    {
      stepNumber: 2,
      label: 'Validate Clearance Level',
      description:
        'Cross-check user clearance against the classification level of documents they\'re trying to access. Deny if clearance insufficient.',
      technicalDetail:
        'Clearance matrix: user_clearance_level vs. query_target_classification. CONFIDENTIAL docs → all users | SECRET docs → SECRET+ users | TOP SECRET → TOP SECRET only. Hardcoded rules, no runtime config. Violation logged + session terminated.',
      dataSource: 'Local clearance database + document metadata',
      retrievalType: 'lookup',
      toolInvocation: 'clearance-validator',
      routingRule: 'user_clearance >= doc_classification → proceed | else → deny & terminate',
      errorHandling: 'Clearance check failure → immediate session termination, classified rejection log (no details sent to user).',
    },
    {
      stepNumber: 3,
      label: 'Query Local Document Vault',
      description:
        'Search the encrypted on-premises document repository. Only documents matching the user\'s clearance level are returned.',
      technicalDetail:
        'Document vault: encrypted (AES-256-GCM) PostgreSQL on local network, no internet connection. Search via local embedding model (BERT-base, on-premises GPU). Query filtering: WHERE doc_classification <= user_clearance_level. Top-3 results, cosine similarity > 0.65.',
      dataSource: 'Encrypted on-premises document vault',
      retrievalType: 'local-rag',
      toolInvocation: 'local-embedding-model → vault-searcher → clearance-filter',
      errorHandling: 'Vault unavailable → respond "System unavailable" with no other details. No fallback to external sources.',
    },
    {
      stepNumber: 4,
      label: 'Extract Answer (Local Only)',
      description:
        'Generate response using local LLM (no cloud LLM calls). Response generation only uses data the user is cleared to see.',
      technicalDetail:
        'Local LLM inference: Llama 2 7B or equivalent, running on on-premises GPU. Max response length: 500 tokens. Response must only reference documents user can access. Zero external API calls, zero exfiltration channels.',
      toolInvocation: 'local-llm-inference',
      errorHandling: 'LLM timeout or OOM → fail gracefully with "Unable to process at this time." No retry, no fallback.',
    },
    {
      stepNumber: 5,
      label: 'Output to Hardwired Display',
      description:
        'Display response on hardwired terminal (no network). No screen capture, no export, no USB transfer — read-only view.',
      technicalDetail:
        'Output to hardwired display only. No screen-sharing capability. No export/copy functions enabled. All output logged for audit trail with: user_id, query, response_length, timestamp, terminal_session_id.',
      toolInvocation: 'hardwired-display-renderer → output-logger',
      errorHandling: 'Display error → fail over to audible message "Response unavailable" (no text shown).',
    },
    {
      stepNumber: 6,
      label: 'Immutable Audit Log & Session Cleanup',
      description:
        'Write complete interaction record to tamper-proof audit log. Clear session memory. Require re-authentication for next query.',
      technicalDetail:
        'Audit record (immutable append-only log, write-once storage): user_id, session_id, timestamp, query, query_intent, doc_ids_accessed[], response_summary, duration_sec, clearance_validation_status. Log retention: permanent (per DoD 5220.22-M). Session memory: full wipe (RAM overwrite). Each query requires fresh authentication.',
      toolInvocation: 'audit-logger → session-wiper → authentication-required-setter',
    },
  ],
}

// ─── Image, Audio & Video Assistant ─────────────────────────────────────

const MULTIMODAL_AGENT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Eight steps covering image analysis (vision), audio transcription and understanding, video processing with multi-frame fusion, and cross-modal reasoning. Users upload images, audio files, or video. Agent generates text summaries, detected objects/people/scenes, transcripts, sentiment analysis, or synthesized audio/image outputs. Handles batch processing for videos (8fps sampling).',
  technicalSummary:
    'Instruction graph with parallel multi-modal encoders: vision transformer (image + video frames), ASR model (Whisper, supports 99 languages), text generation for cross-modal summaries. Video processing uses temporal sampling (8 frames/sec) + keyframe detection. Outputs: text, generated images (DALL-E), or TTS-synthesized audio. Estimated p95 latency: 2.1s single image, 8.5s audio transcript, 35s video (2 min clip).',
  steps: [
    {
      stepNumber: 1,
      label: 'Receive & Validate Media Input',
      description:
        'Accept image, audio, or video file. Validate format, duration, file size, and route to appropriate processor.',
      technicalDetail:
        'Accepts: images (PNG, JPG, WebP, GIF), audio (MP3, WAV, M4A, OGG, Opus), video (MP4, WebM, MOV). Max file sizes: image 50MB, audio 500MB, video 2GB. Duration limits: audio 1hr, video 4hr. Detects media type via MIME + magic bytes.',
      dataSource: 'Inbound media file',
      retrievalType: 'none',
      toolInvocation: 'format-validator → size-checker → media-router',
      errorHandling: 'Unsupported format → reject with list of supported types. File too large → offer to compress or sample. Corrupt file → retry with alternative codec/parser.',
    },
    {
      stepNumber: 2,
      label: 'Process Image (Vision)',
      description:
        'If input is image: analyze content using vision transformer. Detect objects, scenes, text (OCR), faces (with privacy filtering).',
      technicalDetail:
        'Vision model: ViT (Vision Transformer) or CLIP-based. Outputs: scene_description, detected_objects[] (with confidence scores), detected_text (OCR), dominant_colors[], metadata{width, height, format}. Faces: detected but not identified (no facial recognition enabled). If contains OCR text, includes transcription.',
      toolInvocation: 'vision-encoder → object-detector → ocr-engine → face-detector (privacy-mode) → color-analyzer',
      errorHandling: 'Vision model timeout (> 10s) → return partial results with warning. Unclear image → note "image too blurry or low contrast for reliable analysis."',
    },
    {
      stepNumber: 3,
      label: 'Process Audio (ASR & Understanding)',
      description:
        'If input is audio: transcribe to text and extract intent/sentiment/speakers.',
      technicalDetail:
        'ASR model: Whisper (OpenAI, supports 99 languages). Auto-detects language. Outputs: transcript (timestamped, segmented by speaker if multi-speaker). Speaker diarization (up to 8 concurrent speakers). Sentiment analysis per segment (positive/negative/neutral). Intent classification (question, statement, command). Confidence per word.',
      toolInvocation: 'asr-engine → language-detector → speaker-diarizer → sentiment-analyzer → intent-classifier',
      errorHandling: 'Very low audio quality → note "Audio quality is poor. Transcript may contain errors." Background noise detected → offer noise filtering. Non-speech sounds detected → note in transcript.',
    },
    {
      stepNumber: 4,
      label: 'Process Video (Multi-Frame Fusion)',
      description:
        'If input is video: sample frames (8 fps), analyze each frame, and fuse results into a coherent summary.',
      technicalDetail:
        'Video sampling: every 125ms (8 fps). Keyframe detection: identifies scene changes and extracts high-information frames. Per-frame processing: vision analysis (step 2). If video contains audio: transcribe in parallel (step 3). Temporal reasoning: "object moves from left to right", "person enters then exits", "scene transitions from outdoor to indoor".',
      dataSource: 'Video file',
      retrievalType: 'multi-hop',
      toolInvocation: 'frame-sampler → keyframe-detector → parallel-vision-processor → audio-processor → temporal-reasoner',
      errorHandling: 'Video codec not supported → transcode to H.264. Processing timeout (> 60s) → abort and return processed frames up to timeout point.',
    },
    {
      stepNumber: 5,
      label: 'Cross-Modal Reasoning & Fusion',
      description:
        'If input contains multiple modalities (video = visual + audio), reason across them. Correlate visual events with audio events.',
      technicalDetail:
        'Fusion model: receives visual_summary + audio_transcript + audio_sentiment. Correlates: speaker words with video actions, emotion (audio sentiment) with facial expressions (video), discussed topics with visible objects. Generates unified narrative.',
      toolInvocation: 'multimodal-fusion-encoder → correlation-engine → narrative-generator',
    },
    {
      stepNumber: 6,
      label: 'Generate Output',
      description:
        'Based on input modality and user request, generate output in requested format: text summary, image, audio, or transcript.',
      technicalDetail:
        'Output options: (1) Text summary (markdown, 100-500 words depending on input length), (2) Generated image (DALL-E based on description), (3) Synthesized audio (TTS from text summary, 7+ languages), (4) Transcript with timestamps. User specifies desired output type.',
      toolInvocation: 'output-generator | image-generator (DALL-E) | tts-synthesizer | transcript-formatter',
      errorHandling: 'Generation timeout → return best-effort partial output. DALL-E rate limit → note "Image generation temporarily unavailable." TTS error → default to text output.',
    },
    {
      stepNumber: 7,
      label: 'Quality Assurance',
      description:
        'Validate generated output for accuracy, bias, and completeness. Flag any quality issues.',
      technicalDetail:
        'Checks: transcript accuracy (if ASR), description coherence with input, object detection false positives (via secondary model), text summary fidelity (doesn\'t invent unsupported claims). Bias detection: ensures descriptions don\'t include identifying information about people.',
      toolInvocation: 'qa-validator → bias-detector → accuracy-checker',
    },
    {
      stepNumber: 8,
      label: 'Deliver & Archive',
      description:
        'Deliver the output to user and archive the interaction for compliance/analytics.',
      technicalDetail:
        'Delivery: text output inline, image/audio as downloads. Archival: stores input hash (not full file), output summary, processing metadata, user_id, timestamp. Retention: 30 days for personal use, 1yr for business context.',
      toolInvocation: 'output-deliverer → interaction-archiver',
      errorHandling: 'Delivery failure (network) → queue for retry. Archive full → oldest records auto-deleted per retention policy.',
    },
  ],
}

// ─── High-Volume Customer Chat ──────────────────────────────────────────

const CONSUMER_CHAT_INSTRUCTIONS: InstructionSetPayload = {
  businessSummary:
    'Seven steps covering high-throughput customer interactions with millions of concurrent users. Personalization via cached user profiles, graceful degradation under load, template fallback, and sub-200ms p50 latency. Agent prioritizes responses: answers first, escalations routed efficiently. Handles seasonal 10x traffic spikes (Black Friday) with <1% error rate.',
  technicalSummary:
    'Instruction graph with request queuing, user profile caching (Redis, < 50ms lookup), response template library (3,500+ templates), and degradation logic. Under load (> 80% capacity): auto-enables template mode (no generative LLM calls, only templated responses). Monitoring: p50 2-10ms, p95 45-80ms, p99 150-250ms. Estimated throughput: 50K concurrent users, 100K msg/sec.',
  steps: [
    {
      stepNumber: 1,
      label: 'Queue & Rate Limit',
      description:
        'Inbound message queued with rate limiting per user. Prevents abuse (spam, self-replay attacks) while ensuring fair prioritization.',
      technicalDetail:
        'Token bucket rate limiter: 10 msg/min per user (configurable). If limit exceeded: queue message with 5-min delay OR drop with "I\'m processing a lot of messages right now" response. Queue depth monitored; if > 1M messages queued, degrade to template-only mode.',
      dataSource: 'Inbound message queue',
      retrievalType: 'none',
      toolInvocation: 'rate-limiter → queue-dispatcher',
      errorHandling: 'Rate limit hit → user queued with polite wait message, estimated delay provided (e.g., "Estimated wait: 3 min").',
    },
    {
      stepNumber: 2,
      label: 'Load User Profile from Cache',
      description:
        'Fetch user profile (preferences, history, account status, VIP tier) from cache for instant personalization.',
      technicalDetail:
        'User profile cached in Redis: user_id, account_status (active/suspended/vip), last_interaction_timestamp, preferred_language, purchase_history_summary, previous_issues[], loyalty_tier. Cache TTL: 5 minutes. Cache hit rate target: 94%. Lookup latency: < 50ms p99.',
      dataSource: 'Redis cache + database fallback',
      retrievalType: 'lookup',
      toolInvocation: 'cache-loader → database-fallback',
      errorHandling: 'Cache miss → load from DB (adds ~200ms). Cache service unavailable → continue without personalization (generic response).',
    },
    {
      stepNumber: 3,
      label: 'Classify Intent (Fast Path)',
      description:
        'Quickly classify the message intent using lightweight zero-shot classifier (< 100ms latency).',
      technicalDetail:
        'Intent classes: greeting, question, complaint, request (refund/replacement/tracking), technical_issue, feedback, smalltalk, escalation_request. Lightweight model (DistilBERT or similar) runs locally. Confidence threshold: ≥ 0.70. Fallback: ask clarifying question.',
      toolInvocation: 'intent-classifier (lightweight)',
      errorHandling: 'Classifier < 0.70 confidence → ask "Are you asking about [option A] or [option B]?" instead of guessing.',
    },
    {
      stepNumber: 4,
      label: 'Route by Intent & Load Level',
      description:
        'Decide execution path based on intent and current system load. Under normal load: provide personalized generative response. Under high load (> 80% capacity): use template-only responses.',
      technicalDetail:
        'Load check: CPU%, memory%, queue_depth. If load ≤ 80%: proceed to step 5 (generative). If load > 80%: switch to step 5.alt (template mode). VIP users: exempt from template mode (always get generative response if available).',
      routingRule: 'load ≤ 80% & VIP → generative | load ≤ 80% & normal → generative | load > 80% & VIP → generative | load > 80% & normal → template',
    },
    {
      stepNumber: 5,
      label: 'Generate Personalized Response (Generative Path)',
      description:
        'Use LLM (Claude) to generate a natural, personalized response. Incorporates user history, account status, and preferences.',
      technicalDetail:
        'Prompt: "User {user_name}, your account tier is {tier}. Last issue: {last_issue}. Respond to: {message}. Tone: friendly, concise. Max 150 tokens." LLM latency budget: 800ms. Response must be factual (no hallucination on account status). If LLM timeout: degrade to template (step 5.alt).',
      toolInvocation: 'personalization-prompter → llm-generator → factuality-checker',
      errorHandling: 'LLM timeout → fall back to best template match. LLM error → respond with generic template + offer to escalate.',
    },
    {
      stepNumber: 5.1,
      label: 'Template Fallback (High Load Path)',
      description:
        'Under high load: select the best matching template from library and insert user-specific data.',
      technicalDetail:
        'Template library: 3,500+ pre-written responses, indexed by intent + user_tier + scenario. Template selection: BM25 matching on user message. Variable substitution: {user_name}, {account_id}, {issue_number}, etc. Latency: < 10ms. Allows graceful degradation: full service at 50ms response latency, degraded template mode at 5ms latency.',
      toolInvocation: 'template-selector → variable-substitutor',
      errorHandling: 'No matching template → fall back to generic response: "Thanks for reaching out! Please describe your issue and someone will help soon."',
    },
    {
      stepNumber: 6,
      label: 'Determine Escalation & Send',
      description:
        'Check if response triggers escalation (complaint, refund request, VIP issue). If not: send directly. If yes: route to human queue.',
      technicalDetail:
        'Escalation signals: complaint keywords (angry, frustrated, broken, unacceptable), refund request, account suspension, VIP user with issue. If escalation needed: add to human queue with priority based on urgency + user tier. If not: send response directly to user.',
      routingRule: 'escalation_signal detected → human queue | else → send directly',
      toolInvocation: 'escalation-detector → human-queue-router | direct-message-sender',
      errorHandling: 'If human queue full (> 500 waiting): offer callback option instead of wait. VIP escalation: priority queue (SLA < 10 min response time).',
    },
    {
      stepNumber: 7,
      label: 'Log & Monitor',
      description:
        'Log interaction for compliance, analytics, and continuous improvement. Monitor for SLA violations.',
      technicalDetail:
        'Logs: user_id, intent, generated_response, escalation_flag, response_latency_ms, template_used (if any), user_satisfaction (if surveyed), load_level_at_time. Metrics: p50/p95/p99 latencies, template vs. generative split, escalation rate. Real-time monitoring dashboard.',
      toolInvocation: 'interaction-logger → metrics-aggregator → dashboard-updater',
      errorHandling: 'If logging fails: still send response, retry logging asynchronously. If metrics ingest fails: continue operation (non-blocking).',
    },
  ],
}

// ─── Lookup Map ─────────────────────────────────────────────────────────

const INSTRUCTION_DATA_MAP: Record<string, InstructionSetPayload> = {
  'faq-knowledge': FAQ_INSTRUCTIONS,
  'doc-intelligence': DOC_INTEL_INSTRUCTIONS,
  'research-comparison': RESEARCH_INSTRUCTIONS,
  'decision-workflow': DENTAL_INSTRUCTIONS,
  'saas-copilot': SAAS_COPILOT_INSTRUCTIONS,
  'ops-agent': OPS_AGENT_INSTRUCTIONS,
  'coding-agent': CODING_AGENT_INSTRUCTIONS,
  'onprem-assistant': ONPREM_ASSISTANT_INSTRUCTIONS,
  'multimodal-agent': MULTIMODAL_AGENT_INSTRUCTIONS,
  'consumer-chat': CONSUMER_CHAT_INSTRUCTIONS,
}

export function getInstructionData(tileId: string): InstructionSetPayload | null {
  return INSTRUCTION_DATA_MAP[tileId] ?? null
}
