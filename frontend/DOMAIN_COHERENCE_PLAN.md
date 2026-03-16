# Domain Coherence Fix — Implementation Plan

## Root Cause

`agentDomainData.ts` was updated with 10 industry-specific tile themes (Loan Underwriting, Care Coordination, Order Resolution, etc.), but ALL underlying data files across ALL 6 stages still contain the OLD generic domain data. This causes the visible mismatch: the goal banner says "Build an agent that processes loan applications" while the Patterns stage shows AWS Invoice Data, po-reference, and Azure Invoice Data.

## The Mismatch (All 10 Tiles)

| Tile ID | New Theme (Banner) | Old Data (Stages) |
|---------|-------------------|-------------------|
| `faq-knowledge` | Order Issue Resolution (Retail) | Generic product FAQ / knowledge base |
| `doc-intelligence` | Loan Underwriting (Financial Services) | Cloud invoice processing (AWS/GCP/Azure) |
| `research-comparison` | Underwriting Risk Analysis (Insurance) | Generic vendor comparison / procurement |
| `decision-workflow` | Care Coordination (Healthcare) | Dental patient support (appointments/triage) |
| `saas-copilot` | Customer Success Monitoring (SaaS) | Generic SaaS copilot |
| `coding-agent` | Incident Response Automation (SaaS) | Generic coding agent |
| `ops-agent` | Shipment Disruption Manager (Logistics) | Generic batch/ops agent |
| `onprem-assistant` | Predictive Maintenance (Manufacturing) | Generic on-prem assistant |
| `multimodal-agent` | Content Moderation (Media) | Generic multimodal agent |
| `consumer-chat` | Employee Support (HR) | Generic consumer chat |

## Scope: Files × Tiles

Each tile's data flows through these files (one section/payload per tile in each):

| # | File | Lines | Content | Stage |
|---|------|-------|---------|-------|
| 1 | `goalData.ts` | 701 | goalStatement, decomposition, dataSources, complexity, summaries | Stage 1: Goal |
| 2 | `contextDefinitionData.ts` | 2337 | dataSources, constraints, safetyRules, outputs, tasks | Stage 2: Context |
| 3 | `instructionData.ts` | 964 | step-by-step execution workflows (8-9 steps per tile) | Stage 2: Context |
| 4 | `contextDimensionsData.ts` | 914 | dataType labels, user profiles, output preferences | Stage 3: Dimensions |
| 5 | `dimensionAnalysisData.ts` | 1005 | task/user/output dimension analysis (faq, saas, research) | Stage 3: Dimensions |
| 6 | `dimensionAnalysisData_batch1.ts` | 717 | data dimensions (doc-intel, decision, coding) | Stage 3: Dimensions |
| 7 | `dimensionAnalysisData_batch2.ts` | 957 | data dimensions (ops, onprem, multimodal, consumer) | Stage 3: Dimensions |
| 8 | `combinatorialPatternsData.ts` | 522 | tile metadata + fuzzy patterns (core 4) | Stage 4: Patterns |
| 9 | `combinatorialPatternsData_batch1.ts` | 1154 | extended patterns (dental/decision, more) | Stage 4: Patterns |
| 10 | `combinatorialPatternsData_batch2.ts` | 1561 | extended patterns (batch 2) | Stage 4: Patterns |
| 11 | `patternDiscoveryData.ts` | 3999 | auto-generated pattern groups + discovery logs (ALL tiles) | Stage 4: Patterns |
| 12 | `evaluationData.ts` | 1746 | test scenarios, coverage gaps, decision paths (core 4) | Stage 5: Evaluation |
| 13 | `componentTechData.ts` | 1094 | tech stack specs + eval metrics per tile | Stage 5: Solution Arch |
| 14 | `architectureData.ts` | 679 | component activation by trust boundary (core 4) | Stage 5: Solution Arch |
| 15 | `compositionData.ts` | 712 | meta patterns, memory config, orchestration | Stage 5: Solution Arch |
| 16 | `monitoringData.ts` | 649 | health dots, drift alerts, landmines, trends | Stage 6: Monitoring |
| 17 | `metaPatterns.ts` | 1134 | cross-domain abstract patterns | Cross-stage |

**Total estimated lines to review/rewrite: ~18,000+**

---

## Implementation Order

### Phase 1: Core 4 Tiles (Highest Priority)
These have FULL data across all 6 stages and are most visible.

#### Tile A: `doc-intelligence` → Loan Underwriting (Financial Services)

**New Domain Vocabulary:**
- Data sources: Loan Applications (PDF), Credit Reports (API), Income Verification (W-2/paystubs), Property Appraisals, Compliance Rules (TILA/RESPA), Borrower Profile
- Key entities: loan-amount, credit-score, debt-to-income, ltv-ratio, employment-history, property-value, interest-rate, closing-costs
- Tasks: document-collection, data-extraction, eligibility-validation, risk-scoring, approval-routing, compliance-check
- User profiles: loan-officer, underwriter, compliance-analyst, borrower (self-service)
- Outputs: underwriting-decision, risk-assessment-report, compliance-checklist, approval-letter, conditions-list
- Safety rules: fair-lending-compliance, PII-protection, adverse-action-notice-required, equal-credit-opportunity

**Files to update (in order):**
1. `goalData.ts` — Lines 112-180: Rewrite docIntelGoal (goalStatement, decomposition, dataSources, summaries)
2. `contextDefinitionData.ts` — Lines 257-492: Rewrite DOC_INTELLIGENCE_CONTEXT (dataSources, constraints, safetyRules, outputs, tasks)
3. `dimensionAnalysisData_batch1.ts` — Lines 8-250: Rewrite DOC_INTELLIGENCE_DIMENSIONS (replace AWS/GCP/Azure invoice data with loan documents)
4. `instructionData.ts` — Find doc-intel section: Rewrite 8 execution steps for loan underwriting
5. `combinatorialPatternsData.ts` — Lines 48-52 (metadata), 210-248 (fuzzy patterns): Rewrite for loan domain
6. `patternDiscoveryData.ts` — Find DOC_INTEL_PATTERNS + DOC_INTEL_DISCOVERY_LOG: Rewrite all generated patterns
7. `evaluationData.ts` — Find doc sections: Rewrite test scenarios, coverage gaps, decision paths
8. `componentTechData.ts` — Find doc-intel eval metrics: Update tech descriptions
9. `architectureData.ts` — Find DOC_INTEL_ARCHITECTURE: Update component descriptions for loan context
10. `monitoringData.ts` — Find doc-intel monitoring: Update drift/alert scenarios

#### Tile B: `faq-knowledge` → Order Issue Resolution (Retail/E-commerce)

**New Domain Vocabulary:**
- Data sources: Order Database (API), Carrier Tracking API, Return Policy Docs, Product Catalog, Customer Purchase History
- Key entities: order-id, tracking-number, sku, refund-status, delivery-eta, return-window, carrier-name, payment-method
- Tasks: order-lookup, delivery-tracking, refund-processing, return-initiation, carrier-coordination, escalation-routing
- User profiles: frustrated-customer, repeat-buyer, first-time-buyer, high-value-customer
- Outputs: order-status-response, refund-confirmation, return-label, escalation-ticket, delivery-update

**Files to update:** Same 10 files, FAQ sections

#### Tile C: `research-comparison` → Underwriting Risk Analysis (Insurance)

**New Domain Vocabulary:**
- Data sources: Property Inspection Reports, Claims History Database, Risk Scoring Models, Coverage Option Matrix, Regulatory Requirements, Actuarial Tables
- Key entities: risk-score, premium-estimate, coverage-limit, deductible, loss-history, property-type, liability-class, claims-frequency
- Tasks: risk-data-collection, claims-analysis, coverage-comparison, premium-calculation, recommendation-generation, compliance-verification
- User profiles: underwriter, broker, claims-adjuster, actuary

**Files to update:** Same 10 files, research sections

#### Tile D: `decision-workflow` → Care Coordination (Healthcare)

**New Domain Vocabulary:**
- Data sources: Patient Records (EHR), Provider Network Directory, Insurance Verification API, Clinical Guidelines, Emergency Protocols, Appointment System
- Key entities: patient-id, provider-npi, insurance-id, diagnosis-code, appointment-slot, referral-status, triage-level, medication-list
- Tasks: appointment-scheduling, insurance-verification, referral-routing, emergency-triage, follow-up-coordination, clinical-safety-check
- User profiles: patient, care-coordinator, nurse, physician, admin-staff
- Safety: HIPAA compliance, clinical safety boundaries, mandatory escalation triggers

**Files to update:** Same 10 files, decision/dental sections (rename dental → care coordination)

### Phase 2: Extended 6 Tiles
Same pattern for: saas-copilot, coding-agent, ops-agent, onprem-assistant, multimodal-agent, consumer-chat

### Phase 3: Cross-cutting Files
- `metaPatterns.ts` — Update cross-domain pattern names/descriptions
- `compositionData.ts` — Update composition descriptions
- `contextDimensionsData.ts` — Update shared dimension labels if needed

---

## Dual Verification Plan

### PLAN A: Automated Domain Coherence Scanner (grep-based)

A shell script that, for each tile, searches ALL data files for terms that should NOT appear given the tile's domain, and terms that MUST appear.

**Approach:** For each tile, define:
- **BLOCKLIST**: Terms from the OLD domain that should no longer exist
- **ALLOWLIST**: Terms from the NEW domain that must be present

**Tile: doc-intelligence (Loan Underwriting)**
- BLOCKLIST: `aws invoice`, `gcp invoice`, `azure invoice`, `invoice template`, `po-reference`, `tax-allocation`, `cloud cost`, `vm-sizing`, `bigquery`, `compute engine`, `sustained-use`, `hybrid-benefit`, `ea-discount`, `commitment-level`, `currency-code`, `contracts and invoices`, `legal review`, `clause library`, `vendor registry`
- ALLOWLIST: `loan`, `credit`, `underwriting`, `borrower`, `mortgage`, `debt-to-income`, `ltv`, `appraisal`, `income verification`, `TILA`, `RESPA`, `adverse action`, `eligibility`

**Tile: faq-knowledge (Order Resolution)**
- BLOCKLIST: `knowledge base`, `product.*policies.*pricing`, `policy documents`, `pricing tables`
- ALLOWLIST: `order`, `tracking`, `refund`, `delivery`, `carrier`, `return`, `sku`, `shipment`

**Tile: research-comparison (Insurance Risk)**
- BLOCKLIST: `vendor options`, `vendor profiles`, `market pricing`, `procurement`, `weighted requirements`
- ALLOWLIST: `risk`, `claims`, `coverage`, `premium`, `underwriting`, `property`, `liability`, `actuarial`, `deductible`

**Tile: decision-workflow (Care Coordination)**
- BLOCKLIST: `dental practice`, `dental patient`, `dental.*appointment`, `post-procedure`, `clinical.*dental`
- ALLOWLIST: `care coordination`, `referral`, `provider`, `patient`, `EHR`, `triage`, `insurance verification`, `HIPAA`

**Execution:**
```bash
# For each tile, scan ALL data files for blocklist terms
# Output: PASS (0 blocklist hits) or FAIL (list violations with file:line)
# Then scan for allowlist terms
# Output: PASS (all present) or WARN (missing expected terms)
```

**What Plan A catches:**
- Any leftover old-domain terminology in data files
- Missing new-domain terminology that should be present
- Cross-contamination between tiles (e.g., loan terms appearing in insurance tile data)

**What Plan A does NOT check:**
- Whether the data makes logical sense within its domain
- Whether sample questions are realistic for the domain
- Whether key entities form valid combinations

---

### PLAN B: Stage-by-Stage Semantic Walkthrough (manual/LLM-assisted)

For each tile, walk through every stage in order, reading the ACTUAL rendered content as a user would see it, and verify domain coherence.

**Approach:** For each of the 4 core tiles, read the data that feeds each stage and verify:

**Stage 1 — Goal Definition**
- [ ] `goalData.ts` goalStatement matches tile theme
- [ ] Decomposition sub-goals are domain-specific
- [ ] Data sources listed are realistic for this domain
- [ ] Business + technical summaries reference correct domain
- [ ] Complexity metrics are plausible

**Stage 2 — Context Definition**
- [ ] `contextDefinitionData.ts` data source names/formats are domain-realistic
- [ ] Constraints reference correct regulations (TILA for loans, HIPAA for healthcare, etc.)
- [ ] Safety rules are domain-appropriate
- [ ] Output definitions match domain deliverables
- [ ] Task definitions describe realistic domain workflows
- [ ] `instructionData.ts` steps describe a realistic domain workflow

**Stage 3 — Dimension Analysis**
- [ ] `dimensionAnalysisData*.ts` data dimension labels are domain-specific
- [ ] Key entities within each dimension are realistic domain terms
- [ ] Source file names are plausible (e.g., "Loan_Application_Form.pdf" not "AWS_Invoice_Jan.pdf")
- [ ] Connected domains make sense for this tile
- [ ] User profile dimensions match domain personas
- [ ] Output dimensions match domain deliverables

**Stage 4 — Interaction Discovery (Patterns)**
- [ ] `combinatorialPatternsData.ts` tile metadata describes correct domain
- [ ] Fuzzy pattern scenarios are domain-realistic edge cases
- [ ] `patternDiscoveryData.ts` generated patterns use correct domain vocabulary
- [ ] Sample questions reference correct data sources and entities
- [ ] Pattern descriptions make domain sense
- [ ] Pattern IDs use correct prefix

**Stage 5 — Evaluation + Solution Architecture**
- [ ] `evaluationData.ts` test scenarios describe realistic domain situations
- [ ] Coverage gaps identify realistic domain blind spots
- [ ] Decision paths reference correct domain terminology
- [ ] `componentTechData.ts` tech descriptions are domain-contextualized
- [ ] `architectureData.ts` trust boundaries make sense for domain (e.g., PII boundaries for loans)
- [ ] `compositionData.ts` orchestration patterns fit domain workflow

**Stage 6 — Monitoring**
- [ ] `monitoringData.ts` drift scenarios are domain-realistic
- [ ] Dimension alerts reference correct domain entities
- [ ] Landmine scenarios are plausible domain edge cases
- [ ] Health trends describe realistic production behavior

**What Plan B catches:**
- Semantic coherence (does the data make sense as a whole story?)
- Realistic domain scenarios (would an actual loan officer encounter this?)
- Logical consistency between stages (does Stage 4 data flow from Stage 3 dimensions?)
- Missing domain context that automated grep wouldn't catch

**What Plan B does NOT check:**
- Exhaustive term-level scanning (that's Plan A's job)
- TypeScript compilation (separate check)

---

### Why Plans A and B Don't Cross Paths

| Concern | Plan A | Plan B |
|---------|--------|--------|
| Leftover old terms | ✅ Catches via blocklist grep | ❌ Not its job |
| Missing new terms | ✅ Catches via allowlist grep | ❌ Not its job |
| Cross-tile contamination | ✅ Catches via per-tile blocklist | ❌ Not its job |
| Domain-realistic scenarios | ❌ Can't judge semantics | ✅ Full semantic review |
| Stage-to-stage data flow | ❌ File-level only | ✅ Traces data across stages |
| Logical consistency | ❌ Term matching only | ✅ Reads as a user would |
| TypeScript compilation | Separate `tsc --noEmit` check | Separate `tsc --noEmit` check |

**Both plans run independently. Plan A is a fast automated gate. Plan B is a slow thorough walkthrough. A file can pass Plan A (no old terms, has new terms) but fail Plan B (the new terms don't make logical sense together).**

---

## Implementation Estimate

| Phase | Tiles | Files per Tile | Est. Lines to Rewrite | Priority |
|-------|-------|---------------|----------------------|----------|
| Phase 1 | 4 core tiles | ~10 files each | ~8,000-10,000 | HIGH |
| Phase 2 | 6 extended tiles | ~6 files each | ~5,000-6,000 | MEDIUM |
| Phase 3 | Cross-cutting | 3 files | ~500-1,000 | LOW |
| Verification | All | All | Scripts + walkthrough | REQUIRED |

**Recommended execution order within Phase 1:**
1. `doc-intelligence` (Loan Underwriting) — most visibly broken, user reported this one
2. `faq-knowledge` (Order Resolution) — simplest domain, fastest to fix
3. `research-comparison` (Insurance Risk) — moderate complexity
4. `decision-workflow` (Care Coordination) — most complex domain, dental→healthcare shift
