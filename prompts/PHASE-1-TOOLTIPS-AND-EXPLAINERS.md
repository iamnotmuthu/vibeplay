<!-- PROMPT DOCUMENTATION
Name: VibeModel Playground — Phase 1: Contextual Tooltips, Explainer Cards & Quick Fixes
Version: 1.0
Created: 2026-03-04
Target Model: Claude (via Cline / Claude Code in VS Code)
Purpose: Add inline ML term tooltips, stage-level explainer cards, and apply terminology fixes to make the playground accessible to non-ML users
Expected Input: Existing React/TypeScript codebase at the current working directory
Expected Output: New components, data files, and integrations across 4 stage components
Known Limitations: This phase does NOT include the glossary sidebar panel (Phase 2) or persona toggle (Phase 3). The glossaryData.ts file created here will be extended in subsequent phases.
Dependencies: None — this is the first phase
-->

# Phase 1: Contextual Tooltips, Explainer Cards & Quick Fixes

<role>
You are a senior frontend engineer implementing UI improvements to the VibeModel AI playground. You have deep expertise in React, TypeScript, Tailwind CSS, and Framer Motion. You write clean, production-quality code that precisely matches existing codebase conventions.

Your implementation priorities:
1. Match existing code patterns exactly — study the codebase before writing
2. Preserve all existing animations, spacing, and visual polish
3. Create reusable, well-typed components
4. Keep changes minimal and focused — do not refactor unrelated code
</role>

<context>
## Project Architecture

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + inline styles (the codebase uses both — match the surrounding pattern)
- **Animation:** Framer Motion (`motion`, `AnimatePresence`)
- **State:** Zustand (store at `frontend/src/store/playgroundStore.ts`)
- **Icons:** Lucide React
- **Frontend root:** `frontend/src/`

## Playground Flow (6 Stages)

The playground is a linear 6-stage wizard. Each stage is a separate component:

| Stage | Component File | Key Content |
|-------|---------------|-------------|
| 1. Business Setup | `frontend/src/stages/BusinessSetup/BusinessSetup.tsx` | Goal selection, deployment mode. **Has existing tooltip pattern to reference.** |
| 2. Dataset | `frontend/src/stages/DatasetSelection/DatasetSelection.tsx` | Dataset confirmation, auto-selected |
| 3. Data Profiling | `frontend/src/stages/AutoEDA/AutoEDA.tsx` | Data shape, dimensions, features, missing values. **Has "Bucketize" to rename.** |
| 4. Pattern Recognition | `frontend/src/stages/PatternDiscovery/PatternDiscovery.tsx` | Dominant/Non-Dominant/Fuzzy patterns, cohorts |
| 5. Validation Summary | `frontend/src/stages/ValidationSummary/ValidationSummary.tsx` | Validation metrics by cohort category. **Has "Augmented" to hide.** |
| 6. Model Selection | `frontend/src/stages/ModelSelection/ModelSelection.tsx` | Champion model, components, performance. **Has `whyThisModel` field to surface.** |

## Existing Tooltip Pattern (MUST follow this exact style)

In `frontend/src/stages/BusinessSetup/BusinessSetup.tsx` lines 89-118, there is a `DeploymentTooltip` component:

```tsx
function DeploymentTooltip() {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
      {visible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg p-3 z-50"
          style={{
            background: '#ffffff',
            border: '1px solid #d1d5db',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: '#475569' }}>
            Tooltip content here
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#d1d5db]" />
        </div>
      )}
    </div>
  )
}
```

## Existing Insight Card Pattern

`frontend/src/components/shared/InsightCard.tsx` uses typed variants:
```tsx
const typeConfig = {
  info: { icon: Lightbulb, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  success: { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
}
```

## Key Type Definitions (from `frontend/src/store/types.ts`)

```typescript
export type StageId = 1 | 2 | 3 | 4 | 5 | 6

export interface ModelSelectionResults {
  champion: string
  modelFunction: string
  modelType: string
  components: ModelComponent[]
  whyThisModel: string        // <-- THIS EXISTS but is not prominently displayed
  performance: CohortPerformance[]
  // ... other fields
}

export interface ModelComponent {
  subtype: string        // 'preprocessor' | 'model_function' | 'loss_function' | etc.
  subtypeLabel: string   // Human-readable label
  name: string           // Technical term
  factors: ModelComponentFactor[]
  params: ModelComponentParam[]
}
```

## Model Selection Data Structure (from `frontend/src/stages/ModelSelection/modelSelectionData.ts`)

Each scenario has precomputed model data including a `whyThisModel` explanation string. Example:

```typescript
'telco-churn': {
  champion: 'Logistic Regression',
  whyThisModel: 'Logistic Regression delivers strong baseline performance on tabular churn data, produces interpretable coefficients for each feature...',
  components: [
    {
      subtype: 'preprocessor',
      subtypeLabel: 'Preprocessor',
      name: 'one_hot_encoding',
      factors: [{ name: 'Unordered category count', level: 'Median' }, ...],
      params: [{ name: 'Encoding', value: 'OneHotEncoder (sparse=False)' }, ...],
    },
    // ... more components
  ]
}
```

## Validation Summary Data (from `frontend/src/stages/ValidationSummary/validationSummaryData.ts`)

Each scenario has validation data with 4 categories: `sufficient`, `insufficient`, `helpMe`, `augmented`. The `augmented` category needs to be set to zero.
</context>

<task>
Implement the following changes in this exact order. Read each target file fully before making changes. Do not modify files that are not listed.

## Step 1: Create Glossary Data File

Create `frontend/src/lib/glossaryData.ts` with:

### 1A. GlossaryEntry interface and data

```typescript
export interface GlossaryEntry {
  term: string                   // URL-safe key, e.g. 'dominant-patterns'
  displayName: string            // Human label, e.g. 'Dominant Patterns'
  shortDefinition: string        // 1 sentence max — used in tooltips
  fullDefinition: string         // 2-3 sentences — used in glossary panel (Phase 2)
  whyItMatters?: string          // "Why this matters for your model"
  category: 'algorithm' | 'metric' | 'data-concept' | 'model-component' | 'deployment' | 'pattern'
  relatedTerms?: string[]        // keys of related GlossaryEntry items
  stages: number[]               // which stages (1-6) this term appears in
}
```

Populate with ALL of the following entries (use these exact definitions — they have been reviewed for accuracy with the product owner):

**Data Concepts (Stage 3):**

| term | displayName | shortDefinition |
|------|-------------|-----------------|
| `dimensions` | Dimensions | Meaningful categories discovered within each data feature — for example, splitting raw tenure numbers into groups like 'New Customer' and 'Loyal Customer'. |
| `numerical` | Numerical Feature | A data column containing numbers that can be measured and compared, like age, price, or monthly charges. |
| `categorical` | Categorical Feature | A data column containing labels or categories, like contract type or payment method. |
| `define-bands` | Define Bands | Splitting a continuous number range into defined bands — for example, product prices into $0-100, $101-300, $301-500 — so the model treats similar values as one group. |
| `missing-values` | Missing Values | Data points where a value was not recorded. Too many missing values can reduce model accuracy. |
| `outliers` | Outliers | Data points far from the normal range — for example, a customer tenure of 500 months when most are under 72. |

**Pattern Concepts (Stage 4):**

| term | displayName | shortDefinition |
|------|-------------|-----------------|
| `dominant-patterns` | Dominant Patterns | Segments with a strong, consistent signal AND enough data to learn from confidently — large, reliable patterns the model can predict with high accuracy. |
| `non-dominant-patterns` | Non-Dominant Patterns | Segments where the signal is crystal clear but the sample size is too small to trust for production — for example, 20 out of 20 customers always churn, but 20 records is not enough. |
| `fuzzy-patterns` | Fuzzy Patterns | Segments where the model finds a real signal but cannot confidently decide which outcome to predict — the data genuinely falls between two outcomes. |
| `cohort` | Cohort | A group of records sharing the same combination of characteristics — for example, 'Month-to-month contract + Electronic check + tenure under 12 months'. |
| `confidence` | Confidence | How certain the model is about its prediction for a segment — high confidence means the pattern is clear and consistent across the data. |
| `sufficient-data` | Sufficient Data | Enough records in a pattern for the model to learn reliably — patterns with more data produce more trustworthy predictions. |

**Validation Concepts (Stage 5):**

| term | displayName | shortDefinition |
|------|-------------|-----------------|
| `validation` | Validation | Testing the model on data it has never seen before — if it performs well on unseen data, it will likely perform well in production. |
| `recall` | Recall | Of all actual positive cases (e.g., customers who churned), the percentage the model correctly identified — high recall means fewer missed cases. |
| `precision` | Precision | Of all cases the model flagged as positive, the percentage that were actually positive — high precision means fewer false alarms. |

**Model Components (Stage 6):**

| term | displayName | shortDefinition |
|------|-------------|-----------------|
| `logistic-regression` | Logistic Regression | A foundational algorithm that predicts the probability of a yes/no outcome by learning which features matter most, producing a score between 0 and 1. |
| `xgboost` | XGBoost | Extreme Gradient Boosting — builds hundreds of small decision trees sequentially, where each new tree corrects the previous ones' mistakes. Excels on structured data. |
| `random-forest` | Random Forest | Builds many independent decision trees on random data subsets, then combines their votes for a more stable prediction than any single tree. |
| `preprocessor` | Preprocessor | Steps that prepare raw data before the model sees it — converting categories to numbers, scaling values, and filling in missing data. |
| `loss-function` | Loss Function | The formula measuring how wrong the model's predictions are — the model tries to minimise this number during training. |
| `regularization` | Regularization | A technique preventing the model from memorising training data too closely, forcing it to keep learned patterns simple and generalisable. |
| `optimization-algorithm` | Optimization Algorithm | The method used to adjust model weights during training — the strategy for finding the best answer efficiently. |
| `lbfgs` | LBFGS | Limited-memory BFGS — an efficient optimization method that finds the best weights without storing a huge matrix in memory. |
| `platt-scaling` | Platt Scaling | A calibration technique adjusting model outputs so predicted probabilities match real-world rates accurately. |
| `binary-crossentropy` | Binary Cross-Entropy | The standard loss function for yes/no predictions — penalises the model more heavily when it is confidently wrong. |
| `decision-threshold` | Decision Threshold | The probability cutoff above which the model predicts 'yes' — a lower threshold catches more true positives but may increase false alarms. |
| `one-hot-encoding` | One-Hot Encoding | Converting categories (like 'Monthly', 'Yearly') into separate yes/no columns so the model can process them numerically. |
| `elastic-net` | Elastic Net | A regularization combining L1 and L2 penalties to keep the model simple and prevent overfitting. |
| `inference` | Inference | Using a trained model to make predictions on new, unseen data. |

Also add `fullDefinition` (2-3 sentences expanding the short definition) and `whyItMatters` (why this matters in the VibeModel context) for every entry. Use your best judgment for these — they should be accurate, non-condescending, and written for someone who is a software engineer but not an ML specialist.

### 1B. Stage Explainer data

```typescript
export interface StageExplainer {
  stageId: number
  headline: string
  businessExplanation: string
  analogy: string
}

export const stageExplainers: StageExplainer[] = [
  {
    stageId: 3,
    headline: "Understanding Your Data",
    businessExplanation: "We're scanning your dataset to understand what kind of information each column contains — numbers, categories, or text. This determines which algorithms can work with your data and what preparation is needed.",
    analogy: "Think of it like sorting ingredients before cooking — you need to know what you have before choosing a recipe."
  },
  {
    stageId: 4,
    headline: "Finding Customer Segments",
    businessExplanation: "We've grouped your data into segments that behave similarly. Some have strong, reliable signals (Dominant), some have clear signals but too few examples to trust yet (Non-Dominant), and some are genuinely ambiguous (Fuzzy).",
    analogy: "Like sorting mail: some clearly go to one address, some are clear but the writing is tiny (need more samples), and some could go either way."
  },
  {
    stageId: 5,
    headline: "Testing on Unseen Data",
    businessExplanation: "Before trusting the patterns we discovered, we test them on data the model has never seen. This confirms the patterns are real and not just quirks of the training data.",
    analogy: "Like a practice exam — if a student scores well on questions they have never seen, they have truly learned the material."
  },
  {
    stageId: 6,
    headline: "Why This Model Architecture",
    businessExplanation: "VibeModel doesn't pick a model off the shelf — it assembles one from components, each chosen based on your data's characteristics and business goal.",
    analogy: "Like a custom-built engine — each part is selected for the specific vehicle and terrain, not from a one-size-fits-all kit."
  }
]
```

Add a lookup helper:
```typescript
export function getGlossaryEntry(term: string): GlossaryEntry | undefined
export function getStageExplainer(stageId: number): StageExplainer | undefined
export function getGlossaryEntriesForStage(stageId: number): GlossaryEntry[]
```

---

## Step 2: Create Reusable MLTooltip Component

Create `frontend/src/components/shared/MLTooltip.tsx`

Requirements:
- Props: `term: string` (glossary key), `position?: 'top' | 'bottom'` (default 'top')
- Renders the Lucide `Info` icon at `w-3.5 h-3.5` (matching existing tooltip)
- On hover: shows tooltip with `shortDefinition` from glossaryData
- Styling MUST match the existing `DeploymentTooltip` exactly (white bg, gray border, shadow, text-[11px])
- Use `AnimatePresence` + `motion.div` for smooth enter/exit (opacity only, 150ms)
- `z-50` for layering
- Include the arrow pointer (the `border-4 border-transparent` triangle at bottom)
- If the term is not found in glossaryData, render nothing (fail silently)
- Export as named export

Usage pattern: `<MLTooltip term="dominant-patterns" />`

---

## Step 3: Create StageExplainer Component

Create `frontend/src/components/shared/StageExplainer.tsx`

Requirements:
- Props: `stageId: number`
- Looks up explanation from `getStageExplainer(stageId)` in glossaryData
- Renders as a collapsible card with:
  - Header: BookOpen icon (from lucide-react) + headline text
  - Body: `businessExplanation` paragraph + `analogy` in slightly muted italic text
  - A subtle collapse/expand chevron
- Starts **expanded** by default
- Background: light blue-50 with blue-200 border (consistent with InsightCard info variant)
- Uses `AnimatePresence` + `motion.div` for smooth collapse (height animation)
- If no explainer found for stageId, render nothing
- Export as named export

---

## Step 4: Integrate Into Stage Components

### 4A. Stage 3 — AutoEDA.tsx

Read `frontend/src/stages/AutoEDA/AutoEDA.tsx` fully first.

1. Import `MLTooltip` and `StageExplainer`
2. Add `<StageExplainer stageId={3} />` at the top of the scrollable content area (below the header, above the analysis modules)
3. Find the "Total Dimensions" stat card — add `<MLTooltip term="dimensions" />` next to the label
4. **Rename all instances of "Bucketize" to "Define Bands"** — search for "Bucketize", "bucketize", "BUCKETIZE" and replace with "Define Bands" / "define bands" / "DEFINE BANDS" respectively
5. Add `<MLTooltip term="define-bands" />` next to the "Define Bands" toggle/button
6. Find the "numerical" and "categorical" badges in the feature list header area — add `<MLTooltip term="numerical" />` and `<MLTooltip term="categorical" />` ONCE in the header/legend, not on every feature row

### 4B. Stage 4 — PatternDiscovery.tsx

Read `frontend/src/stages/PatternDiscovery/PatternDiscovery.tsx` fully first.

1. Import `MLTooltip` and `StageExplainer`
2. Add `<StageExplainer stageId={4} />` at the top of the scrollable content area
3. Find the "Dominant Patterns" section header — add `<MLTooltip term="dominant-patterns" />`
4. Find the "Non-Dominant Patterns" section header — add `<MLTooltip term="non-dominant-patterns" />`
5. Find the "Fuzzy Patterns" section header — add `<MLTooltip term="fuzzy-patterns" />`
6. Find confidence badge displays — add `<MLTooltip term="confidence" />` next to the first confidence badge in each section (not on every card)

### 4C. Stage 5 — ValidationSummary.tsx

Read `frontend/src/stages/ValidationSummary/ValidationSummary.tsx` fully first.

1. Import `MLTooltip` and `StageExplainer`
2. Add `<StageExplainer stageId={5} />` at the top of the scrollable content area
3. Add `<MLTooltip term="validation" />` next to the stage title "Validation Data Set Summary"
4. Add `<MLTooltip term="dominant-patterns" />`, `<MLTooltip term="non-dominant-patterns" />`, `<MLTooltip term="fuzzy-patterns" />` next to respective category card titles

**IMPORTANT — Hide Augmented Data:**
5. In `frontend/src/stages/ValidationSummary/validationSummaryData.ts`, set the `augmented` field to `{ count: 0, percentage: 0, cohorts: [], actionStatement: '' }` for ALL scenarios in the data map
6. In `ValidationSummary.tsx`, wrap the "Augmented Data" card in a conditional: only render if `augmented.count > 0`

### 4D. Stage 6 — ModelSelection.tsx

Read `frontend/src/stages/ModelSelection/ModelSelection.tsx` fully first.

1. Import `MLTooltip`, `StageExplainer`, and `getGlossaryEntry` from glossaryData
2. Add `<StageExplainer stageId={6} />` at the top of the scrollable content area
3. **Surface the `whyThisModel` text prominently** — find the `whyThisModel` field in the model data (it already exists in `modelSelectionData.ts`). Display it as a highlighted card below the "Model Composition — Not Selection" banner, ABOVE the component pipeline. Style it like an InsightCard with `info` type: light blue background, Lightbulb icon, the `whyThisModel` text.
4. Add tooltip for the champion model name — dynamically map: if champion is "Logistic Regression" → `<MLTooltip term="logistic-regression" />`, if "XGBoost" → `<MLTooltip term="xgboost" />`, etc. Create a helper function `getModelTermKey(championName: string): string` that normalises the name to a glossary key.
5. Add tooltips to the component pipeline labels: next to "Preprocessor" → `<MLTooltip term="preprocessor" />`, "Loss Function" → `<MLTooltip term="loss-function" />`, "Regularization" → `<MLTooltip term="regularization" />`, "Optimization" → `<MLTooltip term="optimization-algorithm" />`
6. Add `<MLTooltip term="recall" />` next to the "RECALL" metric label and `<MLTooltip term="precision" />` next to "PRECISION"

---

## Step 5: Rename "Bucketize" Everywhere

Search the entire `frontend/src/` directory for any occurrence of "Bucketize", "bucketize", or "BUCKETIZE" and replace with "Define Bands", "define bands", or "DEFINE BANDS" respectively. This includes:
- Component text/labels
- Variable names (rename `bucketize` variables to `defineBands` where they appear in UI-facing code, but do NOT rename internal state keys if they would break data flow — use judgment)
- Comments
- CSS class names containing "bucketize"
</task>

<constraints>
- Do NOT refactor existing code that is unrelated to these changes
- Do NOT change the color scheme, spacing, or animation timing of existing elements
- Do NOT modify the Zustand store structure (no new store fields in this phase)
- Match the exact styling patterns already in the codebase — if surrounding code uses inline `style={{}}`, use inline styles. If it uses Tailwind classes, use Tailwind
- All new components must be TypeScript with proper type annotations
- All imports must use the `@/` path alias (already configured in the project)
- Preserve all existing Framer Motion animations
- The "Define Bands" rename should not break any data flow — if a variable called `bucketize` is used as a key in data structures, keep the internal key but change the display label
</constraints>

<edge_cases>
- If a glossary term is not found when `<MLTooltip>` is rendered, it should render nothing (not crash)
- If `whyThisModel` is undefined or empty for a scenario, do not render the "Why This Model" card on Stage 6
- The tooltip must not overflow the viewport — if it's near the top of the page, position it below the icon instead. Use the `position` prop for this
- If `augmented.count` is already 0 in some scenarios, the hide logic should still work
- The `StageExplainer` should remain expanded on first render but remember collapse state within the same session (use local component state, not store)
</edge_cases>

<internal_review_process>
After completing all changes, perform two internal reviews before delivering:

**Review 1 — UX/Accessibility Advocate:**
Read through every tooltip definition and explainer card text. For each one, ask:
- Would a senior software engineer with NO ML background understand this?
- Is the language condescending or patronising? It should explain without talking down.
- Are there any remaining ML terms in the tooltip text that are themselves unexplained?
- Is the analogy in each StageExplainer actually helpful, or is it confusing?

If any definition fails these checks, rewrite it before delivering.

**Review 2 — Senior Frontend Engineer:**
Review all code changes for:
- Does the MLTooltip component follow the exact same styling as DeploymentTooltip?
- Are imports correct and using the @/ path alias?
- Are there any TypeScript type errors?
- Will the tooltip z-index work correctly within the existing layout?
- Are the Framer Motion animations consistent with the rest of the app?
- Does the conditional rendering for augmented data work correctly?

Fix any issues found before delivering.
</internal_review_process>

<self_validation>
Before delivering, verify ALL of the following:

- [ ] `frontend/src/lib/glossaryData.ts` exists with all specified entries, interfaces, and helper functions
- [ ] `frontend/src/components/shared/MLTooltip.tsx` exists and renders correctly
- [ ] `frontend/src/components/shared/StageExplainer.tsx` exists and renders correctly
- [ ] Stage 3 (AutoEDA.tsx): StageExplainer added, "Bucketize" renamed to "Define Bands", tooltips for dimensions/define-bands/numerical/categorical
- [ ] Stage 4 (PatternDiscovery.tsx): StageExplainer added, tooltips for dominant/non-dominant/fuzzy/confidence
- [ ] Stage 5 (ValidationSummary.tsx): StageExplainer added, validation/pattern tooltips added, augmented data hidden (set to 0 in data file AND conditional render in component)
- [ ] Stage 6 (ModelSelection.tsx): StageExplainer added, whyThisModel displayed prominently, champion model tooltip, component pipeline tooltips, metric tooltips
- [ ] All "Bucketize" instances renamed to "Define Bands" across the codebase
- [ ] Run `cd frontend && npm run build` — build passes with zero errors
- [ ] No visual regressions — existing elements are unchanged
</self_validation>
