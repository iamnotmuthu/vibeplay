<!-- PROMPT DOCUMENTATION
Name: VibeModel Playground — Phase 3: Persona-Based Experience Toggle (Business ↔ Technical View)
Version: 1.0
Created: 2026-03-04
Target Model: Claude (via Cline / Claude Code in VS Code)
Purpose: Add a Business View / Technical View toggle that controls the depth of ML information displayed across stages 3-6
Expected Input: Existing codebase WITH Phase 1 AND Phase 2 changes already applied
Expected Output: View toggle component, store integration, and conditional rendering across 4 stage components
Known Limitations: Business View simplifies display but does not remove functionality — users can always switch to Technical View
Dependencies: Phase 1 (glossaryData.ts, MLTooltip, StageExplainer) and Phase 2 (GlossaryPanel, store changes) must be completed first
-->

# Phase 3: Persona-Based Experience Toggle (Business ↔ Technical View)

<role>
You are a senior frontend engineer completing the final phase of UI improvements to the VibeModel AI playground. Phase 1 (tooltips, explainer cards, terminology fixes) and Phase 2 (glossary panel sidebar) are already implemented.

Your task is to add a view mode toggle that lets users switch between a simplified "Business View" and the full "Technical View" across stages 3-6. This is the most impactful change — it directly addresses feedback from both a senior software engineer (who found the ML content confusing) and a senior MLE (who liked the detail but wanted better explanations).

Your implementation priorities:
1. Business View must be genuinely simpler — not just "same content with tooltips", but actually different content presentation
2. Technical View must preserve everything that exists today — zero regressions
3. The toggle must feel seamless, not jarring — smooth transitions between views
4. Default to Business View (since the feedback showed non-ML users are the ones struggling)
</role>

<context>
## Phase 1 & 2 Artifacts (Already Exist)

**Phase 1:**
- `frontend/src/lib/glossaryData.ts` — Centralized glossary with entries for all ML terms
- `frontend/src/components/shared/MLTooltip.tsx` — Inline tooltip component
- `frontend/src/components/shared/StageExplainer.tsx` — Stage explainer cards

**Phase 2:**
- `frontend/src/components/shared/GlossaryPanel.tsx` — Searchable glossary sidebar
- Store now has: `glossaryOpen`, `setGlossaryOpen`, `toggleGlossary`
- BrandHeader has glossary trigger button

## Zustand Store (Current State After Phase 2)

`frontend/src/store/playgroundStore.ts` contains:
```typescript
interface PlaygroundState {
  currentStep: StageId
  completedSteps: Set<StageId>
  sidebarOpen: boolean
  glossaryOpen: boolean          // Added in Phase 2
  // ... session, dataset, business setup, stage results
  // ... all setters and actions
}
```

## Stage Component Architecture

Each stage component follows this pattern:
```tsx
export function StageName() {
  const someState = usePlaygroundStore((s) => s.someState)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        ...
      </div>

      {/* Content (scrollable) */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: '#fafafa' }}>
        <StageExplainer stageId={N} />  {/* Added in Phase 1 */}
        {/* Stage-specific content */}
      </div>

      {/* Bottom action bar */}
      <BottomActionBar ... />
    </div>
  )
}
```

## Key Data Structures That Control Content Display

### ModelSelection stage data (`modelSelectionData.ts`):
```typescript
interface ModelComponent {
  subtype: string        // 'preprocessor' | 'model_function' | 'loss_function' | etc.
  subtypeLabel: string   // Human-readable label
  name: string           // Technical term
  factors: ModelComponentFactor[]   // <-- HIDE in Business View
  params: ModelComponentParam[]     // <-- SIMPLIFY in Business View
}

interface ModelComponentFactor {
  name: string    // e.g. "Non-linear relationship complexity"
  level: string   // "Low" | "Median" | "High"
}
```

### Pattern data (`patternData.ts`):
```typescript
interface SufficiencyPatternItem {
  id: number
  label: string           // e.g. "Month-to-Month Churners"
  description: string     // Technical description
  count: number
  keySignals: string[]    // e.g. ["Contract=Month-to-month", "tenure < 12mo"]
  confidence?: 'high' | 'low'
  pct?: number
  targetValue?: string
  attributes?: { name: string; value: string }[]
}
```

### Validation data:
```typescript
interface CohortPerformance {
  category: 'sufficient' | 'insufficient' | 'helpMe'
  label: string
  recall: number
  precision: number
}
```
</context>

<task>
Implement the following changes in this exact order. Read each target file fully before making changes.

## Step 1: Extend Zustand Store

In `frontend/src/store/playgroundStore.ts`, add:

```typescript
viewMode: 'business' | 'technical'
setViewMode: (mode: 'business' | 'technical') => void
toggleViewMode: () => void
```

- `viewMode` defaults to `'business'` (this is the key design decision — new users see the simpler view first)
- Export the `ViewMode` type: `export type ViewMode = 'business' | 'technical'`
- Add this to `frontend/src/store/types.ts` as well

## Step 2: Create ViewModeToggle Component

Create `frontend/src/components/shared/ViewModeToggle.tsx`

### Visual Design

A pill-shaped toggle with two segments:
- Left: "Business" with a BarChart3 icon (from lucide-react)
- Right: "Technical" with a Code2 icon (from lucide-react)

Styling:
- Container: `rounded-full` pill shape, gray-100 background, 1px gray-200 border
- Active segment: white background with subtle shadow, primary brand color text, smooth slide animation
- Inactive segment: transparent background, gray-500 text
- Height: matches existing header buttons (~32px)
- Use Framer Motion `layoutId` for the smooth sliding indicator between segments
- Compact enough to fit in the header without crowding

### Placement

Add this toggle to `frontend/src/components/layout/BrandHeader.tsx`:
- Position it between the "DEMO MODE" badge and the glossary button
- Only visible when user is inside the playground flow (stages 1-6)
- On the scenario selection / landing page, it should not appear

## Step 3: Create Business View Content Helpers

Create `frontend/src/lib/businessViewHelpers.ts`

This file provides simplified text and labels for Business View:

```typescript
/**
 * Converts a raw metric value into a business-friendly statement.
 * Example: recall=88 → "88% of churning customers correctly identified"
 */
export function metricToBusinessStatement(
  metricName: string,
  value: number,
  context: { targetLabel?: string; businessGoal?: string }
): string

/**
 * Converts technical model component info into a business-friendly summary.
 * Example: { subtype: 'preprocessor', name: 'one_hot_encoding', ... }
 *   → "Data Preparation: Converts categories into a format the model can learn from"
 */
export function componentToBusinessSummary(component: ModelComponent): {
  businessLabel: string   // Simplified subtype label
  businessDescription: string  // 1-sentence plain English
}

/**
 * Maps technical subtypeLabels to business-friendly labels.
 */
export const businessSubtypeLabels: Record<string, string> = {
  'Preprocessor': 'Data Preparation',
  'Explicit Regularization': 'Overfitting Prevention',
  'Model Component': 'Core Algorithm',
  'Loss Function': 'Error Measurement',
  'Optimization Algorithm': 'Learning Strategy',
  'Capacity Controls': 'Model Complexity Limits',
  'Complexity Controls': 'Simplification Rules',
  'Inference Tuning': 'Prediction Speed Tuning',
}

/**
 * Converts a pattern's keySignals into business-readable conditions.
 * Example: ["Contract=Month-to-month", "tenure < 12mo", "MonthlyCharges > $65"]
 *   → "Customers on month-to-month contracts who have been with us less than 12 months and pay over $65/month"
 */
export function keySignalsToBusinessLanguage(signals: string[]): string
```

Implement all of these functions with sensible, accurate transformations. The business language should be natural and readable — not just "simplified jargon" but actual plain English.

## Step 4: Implement Business View in Stage 3 (AutoEDA.tsx)

Read `frontend/src/stages/AutoEDA/AutoEDA.tsx` fully.

In **Business View**, simplify the Data Profiling stage:
- **Keep:** The high-level stats (rows, columns, numeric, categorical counts, total dimensions)
- **Keep:** The "Automated Dimension Discovery" insight card
- **Keep:** The missing values summary
- **Hide:** The per-feature detailed breakdown with "Define Bands" toggles (this is technical detail)
- **Replace with:** A summary card: "Your dataset has [N] features. [X] are numerical (numbers like price, age) and [Y] are categorical (labels like contract type). We discovered [Z] meaningful groupings across these features."
- **Keep:** The StageExplainer (it's already business-friendly from Phase 1)

In **Technical View**, show everything exactly as it is today (no changes).

Implementation pattern:
```tsx
const viewMode = usePlaygroundStore((s) => s.viewMode)

{viewMode === 'technical' ? (
  <TechnicalFeatureList ... />  // Existing content
) : (
  <BusinessDataSummary ... />   // New simplified view
)}
```

## Step 5: Implement Business View in Stage 4 (PatternDiscovery.tsx)

Read `frontend/src/stages/PatternDiscovery/PatternDiscovery.tsx` fully.

In **Business View**:
- **Keep:** The stats overview (total records, pattern counts by category)
- **Keep:** Pattern labels and descriptions (these are already somewhat readable)
- **Replace:** The `keySignals` array display with `keySignalsToBusinessLanguage()` output
- **Replace:** "74% of this cohort → Churn = Yes" with "74% of customers in this group are likely to churn"
- **Hide:** The "Click any pattern card to explore details" expandable cohort details (sub-cohorts with feature combinations)
- **Hide:** The "Add Pattern" form
- **Simplify:** Confidence badges — instead of "High Confidence" / "Low", show a simple green checkmark or amber warning icon
- **Keep:** The color-coded category cards (Dominant = green, Non-Dominant = red, Fuzzy = orange)

In **Technical View**, show everything exactly as it is today.

## Step 6: Implement Business View in Stage 5 (ValidationSummary.tsx)

Read `frontend/src/stages/ValidationSummary/ValidationSummary.tsx` fully.

In **Business View**:
- **Keep:** The total validation data count and cohort composition
- **Keep:** The four category cards (Dominant, Non-Dominant, Fuzzy — augmented is already hidden from Phase 1)
- **Replace:** The percentage and raw count displays with business statements:
  - "Dominant Patterns: 607 records (72%) — These patterns are production-ready, no further action needed."
  - "Non-Dominant Patterns: 172 records (20.4%) — Consider collecting more data to strengthen these patterns."
  - "Fuzzy Patterns: 60 records (7.1%) — These will be flagged for human review."
- **Hide:** Any detailed cohort breakdowns or sampling percentage tables
- **Keep:** The StageExplainer card and tooltips from Phase 1

In **Technical View**, show everything exactly as it is today.

## Step 7: Implement Business View in Stage 6 (ModelSelection.tsx)

Read `frontend/src/stages/ModelSelection/ModelSelection.tsx` fully. This is the most complex stage.

In **Business View**:
- **Keep:** The "Model Composition — Not Selection" banner and the `whyThisModel` card (from Phase 1)
- **Keep:** The champion model name and type badge
- **Replace:** The model component pipeline chips (Preprocessor → Feature Eng. → Model Function → ...) with `businessSubtypeLabels` mapping:
  - "Data Preparation → Core Algorithm → Error Measurement → Overfitting Prevention → Learning Strategy → Prediction Speed"
- **Hide:** The entire per-component factor lists (all the "Non-linear relationship complexity (Low)" rows)
- **Hide:** The per-component parameter tables (the "Weights: Learned via LBFGS optimisation" rows)
- **Replace with:** For each component, show ONE business-friendly sentence using `componentToBusinessSummary()`:
  - Preprocessor → "Data Preparation: Converts your categories and numbers into a format the model can learn from"
  - Regularization → "Overfitting Prevention: Keeps the model from memorising your training data, ensuring it works well on new data"
  - Model Function → "Core Algorithm: [champion name] — [1-sentence from glossary shortDefinition]"
  - Loss Function → "Error Measurement: Uses [business-friendly name] to track how wrong predictions are during training"
  - Optimization → "Learning Strategy: [business-friendly description]"
- **Replace:** The recall/precision bars with business statements using `metricToBusinessStatement()`:
  - "Overall: The model correctly identifies 88% of churning customers (Recall) with 85% accuracy on its predictions (Precision)"
  - "Strong Patterns: 91% detection rate — these are your most reliable predictions"
  - "Weak Patterns: 65% detection rate — predictions here are less certain"
- **Hide:** The monitoring/drift section (if present in the scrollable area below)
- **Keep:** The performance bars as visual indicators, but add the business text above them

In **Technical View**, show everything exactly as it is today.

## Step 8: Smooth View Transitions

When the user toggles between Business and Technical view, apply smooth transitions:
- Use `AnimatePresence` with `mode="wait"` for content swaps
- Fade out current view (opacity 0, 150ms) → Fade in new view (opacity 1, 150ms)
- Do NOT use layout animations for this — just opacity transitions to avoid jarring reflows
- The toggle itself should animate its indicator smoothly (handled by `layoutId` in Step 2)

## Step 9: Persist View Mode Preference

The view mode should persist within the session:
- Changing view mode on one stage applies to ALL stages immediately
- The preference resets on page reload (no localStorage — consistent with the rest of the store)
- If a user navigates between stages, their view mode choice is preserved

## Step 10: Update StageExplainer Behavior

In **Business View**, `StageExplainer` should:
- Start expanded AND cannot be collapsed (the explanation is essential for business users)
- Show a subtle "Switch to Technical View for full details" link at the bottom

In **Technical View**, `StageExplainer` should:
- Start collapsed (technical users don't need the hand-holding)
- Can be expanded/collapsed as before
</task>

<constraints>
- Business View must NEVER remove navigation or the ability to proceed through stages — it only simplifies the information display
- Technical View must be a PIXEL-PERFECT match to the current UI — zero visual regressions
- The toggle state is global — it affects all stages simultaneously, not per-stage
- Do NOT create separate component files for Business vs Technical views — use conditional rendering within existing stage components to keep code co-located
- However, DO extract complex Business View content into small helper components within the same file to keep readability
- All business-friendly text must be accurate — do not simplify in a way that becomes incorrect
- The `businessViewHelpers.ts` functions must handle all 12 scenarios in the dataset, not just telco-churn. Use generic language that works across domains (don't hardcode "customers" — could be "patients", "employees", "transactions", etc.)
- Do not add new npm dependencies
- Performance: the view toggle should feel instant — no perceptible lag when switching
</constraints>

<edge_cases>
- Some scenarios have different metrics (regression uses RMSE/MAE instead of recall/precision). The `metricToBusinessStatement()` function must handle all metric types.
- If `whyThisModel` is empty/undefined for a scenario, Business View should still work — just skip that card
- The `keySignalsToBusinessLanguage()` function must handle various signal formats: `Feature=Value`, `Feature < X`, `Feature > X`, `Feature in [A,B]`, ranges like `tenure < 12mo`
- When the user is on Stage 1 or 2 (which don't have Business/Technical differences), the toggle should still be visible but both views show the same content
- If a user opens the glossary panel from Business View, the glossary should still show full technical definitions (the glossary is always the "complete reference")
- The `componentToBusinessSummary()` function must handle component subtypes that may not be in the `businessSubtypeLabels` map — use a sensible fallback
</edge_cases>

<internal_review_process>
After completing all changes, perform two internal reviews:

**Review 1 — UX/Accessibility Advocate:**
Walk through the ENTIRE playground in Business View (all 6 stages, telco-churn scenario):
- Stage 3: Is the data summary clear? Would a product manager understand what happened?
- Stage 4: Are the pattern descriptions clear? Does "74% of customers in this group are likely to churn" make sense?
- Stage 5: Are the validation results clear? Would someone know what action to take?
- Stage 6: Can someone understand what model was chosen and why, without knowing what "LBFGS" or "Platt scaling" means?
- Cross-stage: Does the experience feel cohesive? Is the language consistent?
- Is there ANYTHING in Business View that would still confuse a software engineer learning AI?

Then walk through in Technical View:
- Is every single piece of information that was there before Phase 3 still present?
- Did any spacing, animations, or colors change?

**Review 2 — Senior Frontend Engineer:**
- Does the toggle animation feel smooth and instant?
- Are the `AnimatePresence` transitions working without layout jumps?
- Is the conditional rendering clean and maintainable?
- Are there any unnecessary re-renders when toggling view mode?
- Do all TypeScript types check correctly?
- Does `npm run build` pass?
- Test with 3 different scenarios (telco-churn, credit-fraud, store-demand) — does Business View work for all of them?
</internal_review_process>

<self_validation>
Before delivering, verify ALL of the following:

- [ ] Store has `viewMode`, `setViewMode`, `toggleViewMode` with 'business' default
- [ ] `ViewModeToggle.tsx` exists with smooth pill-shaped toggle and Framer Motion indicator
- [ ] Toggle appears in BrandHeader during playground stages (not on landing page)
- [ ] `businessViewHelpers.ts` exists with all specified functions implemented
- [ ] Stage 3 Business View: simplified summary, feature details hidden
- [ ] Stage 4 Business View: business language for signals, sub-cohort details hidden, simplified confidence display
- [ ] Stage 5 Business View: business statements for categories, detailed breakdowns hidden
- [ ] Stage 6 Business View: business component labels, factor/param tables hidden, business metric statements, whyThisModel prominent
- [ ] Technical View: ZERO changes from pre-Phase-3 appearance across all stages
- [ ] View mode transitions: smooth opacity fade, no layout jumps
- [ ] StageExplainer behavior differs by view mode (always expanded in Business, collapsible in Technical)
- [ ] Business View text is accurate and works across multiple scenarios (not just telco-churn)
- [ ] `businessViewHelpers.ts` handles regression/time-series metrics (not just classification)
- [ ] `cd frontend && npm run build` passes with zero errors
- [ ] Toggle state persists across stage navigation within a session
</self_validation>
