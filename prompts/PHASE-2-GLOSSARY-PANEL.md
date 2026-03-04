<!-- PROMPT DOCUMENTATION
Name: VibeModel Playground — Phase 2: Searchable Glossary Panel Sidebar
Version: 1.0
Created: 2026-03-04
Target Model: Claude (via Cline / Claude Code in VS Code)
Purpose: Add a slide-out glossary panel accessible from every stage, powered by the glossaryData.ts created in Phase 1
Expected Input: Existing codebase WITH Phase 1 changes already applied
Expected Output: New GlossaryPanel component, header integration, and enhanced glossary data
Known Limitations: Does not include the Business/Technical view toggle (Phase 3)
Dependencies: Phase 1 must be completed first — glossaryData.ts, MLTooltip.tsx, and StageExplainer.tsx must exist
-->

# Phase 2: Searchable Glossary Panel Sidebar

<role>
You are a senior frontend engineer continuing improvements to the VibeModel AI playground. Phase 1 has already been completed — the codebase now contains `frontend/src/lib/glossaryData.ts` (centralized glossary data), `frontend/src/components/shared/MLTooltip.tsx` (inline tooltips), and `frontend/src/components/shared/StageExplainer.tsx` (stage explainer cards).

Your task is to build a searchable glossary panel that leverages the existing glossary data. You write production-quality React/TypeScript that precisely matches existing codebase conventions.

Your implementation priorities:
1. Build on Phase 1 infrastructure — reuse glossaryData.ts as the single source of truth
2. Follow the existing sidebar pattern established by SessionSidebar.tsx
3. Create a polished, animated panel that feels native to the existing UI
4. Ensure the glossary is contextually aware of the current stage
</role>

<context>
## Phase 1 Artifacts (Already Exist)

These files were created in Phase 1 and are available:

**`frontend/src/lib/glossaryData.ts`** — Contains:
- `GlossaryEntry` interface with fields: `term`, `displayName`, `shortDefinition`, `fullDefinition`, `whyItMatters`, `category`, `relatedTerms`, `stages`
- `StageExplainer` interface and data
- Helper functions: `getGlossaryEntry(term)`, `getStageExplainer(stageId)`, `getGlossaryEntriesForStage(stageId)`
- All glossary entries for stages 3-6 (data concepts, patterns, validation, model components)

**`frontend/src/components/shared/MLTooltip.tsx`** — Inline tooltip component using glossary data

## Existing Sidebar Pattern to Follow

`frontend/src/components/shared/SessionSidebar.tsx` is an existing slide-out sidebar. Study its implementation for:
- How it slides in from the right
- How it handles open/close state
- Its animation patterns
- Its z-index and overlay behavior

## Existing Header Component

`frontend/src/components/layout/BrandHeader.tsx` — The top header bar containing the VibeModel logo, "Scenarios" button, "DEMO MODE" badge, "Beta Waitlist" and "Book a Demo" buttons. The glossary trigger button will be added here.

## Current Zustand Store

`frontend/src/store/playgroundStore.ts` manages:
- `currentStep: StageId` — the active stage (1-6)
- `sidebarOpen: boolean` — controls SessionSidebar visibility
- Other stage-specific state

## Styling Conventions

The codebase uses a mix of Tailwind CSS classes and inline `style={{}}` objects. The header uses:
- Background: white with `border-b border-gray-200`
- Buttons: `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg` with hover states
- Text: `text-sm font-medium` with color `#475569`
- The existing "Scenarios" button is the pattern reference for the glossary trigger button
</context>

<task>
Implement the following changes in this exact order. Read each target file fully before making changes.

## Step 1: Extend Zustand Store

In `frontend/src/store/playgroundStore.ts`, add:

```typescript
glossaryOpen: boolean
setGlossaryOpen: (open: boolean) => void
toggleGlossary: () => void
```

- `glossaryOpen` defaults to `false`
- `setGlossaryOpen` sets it directly
- `toggleGlossary` flips the current value
- When `glossaryOpen` is set to `true`, automatically set `sidebarOpen` to `false` (so the two panels don't overlap)
- When `sidebarOpen` is set to `true`, automatically set `glossaryOpen` to `false`

## Step 2: Extend Glossary Data (if needed)

Review the existing `frontend/src/lib/glossaryData.ts`. Ensure it has a `fullDefinition` (2-3 sentences) for every entry. If Phase 1 only populated `shortDefinition` for some entries, fill in the `fullDefinition` and `whyItMatters` fields now.

Add a `getCategoriesForStage(stageId: number)` helper that returns the unique categories present in that stage's glossary entries, for use in the panel's category filter.

## Step 3: Create GlossaryPanel Component

Create `frontend/src/components/shared/GlossaryPanel.tsx`

### Visual Design

The panel should:
- Slide in from the right side of the screen (same direction as SessionSidebar)
- Be approximately 380-420px wide
- Have a white background with subtle left border shadow
- Overlay content with a semi-transparent backdrop (click backdrop to close)
- Use `z-40` (below tooltips at z-50 but above content)
- Animate with Framer Motion: slide in from `x: 420` to `x: 0`, with backdrop fade

### Panel Layout (top to bottom)

**Header Section:**
- Title: "Glossary" with a BookOpen icon (from lucide-react)
- Close button (X icon) on the right
- Current stage indicator: "Showing terms for: [Stage Name]" — uses `currentStep` from store and `STAGE_LABELS` from types
- "Show All" toggle to display terms from all stages (default: show only current stage)

**Search Bar:**
- Input field with Search icon (from lucide-react)
- Placeholder: "Search terms..."
- Filters glossary entries by matching `displayName`, `shortDefinition`, or `fullDefinition` against the search query (case-insensitive)
- Debounce the search with a 200ms delay for performance
- Clear button (X) appears when search has text

**Category Filter Chips:**
- Horizontal row of small filter chips below search
- Categories: "All", "Data Concepts", "Patterns", "Metrics", "Algorithms", "Model Components"
- Map these display names to the `category` field values: `data-concept`, `pattern`, `metric`, `algorithm`, `model-component`
- Only show categories that have entries for the current stage (or all categories if "Show All" is enabled)
- Active chip: primary brand color background, white text
- Inactive chip: gray-100 background, gray-600 text

**Glossary Entries List:**
- Scrollable list of entries matching current filters (stage + search + category)
- Each entry rendered as an expandable card:
  - **Collapsed state:** `displayName` in semi-bold + `shortDefinition` in gray text, truncated to 1 line
  - **Expanded state:** Full card showing:
    - `displayName` as header
    - `category` as a colored badge (use category-specific colors matching the existing color scheme)
    - `fullDefinition` paragraph
    - `whyItMatters` section (if present) with a subtle "Why this matters" label
    - "Related terms" section (if `relatedTerms` is populated) — clickable links that scroll to and expand the related term in the list
  - Click to expand/collapse with smooth height animation
  - Only one entry expanded at a time (accordion behavior)

**Empty State:**
- If no entries match the current filters/search: show a friendly "No matching terms found" message with a suggestion to clear filters

### Behavior

- Panel reads `currentStep` from the Zustand store to determine which stage's terms to show
- When the user navigates to a different stage (currentStep changes), the panel automatically updates to show that stage's terms
- Search persists across stage changes but category filter resets
- Clicking a term in the "Related terms" section should scroll to that term, expand it, and briefly highlight it (flash animation)
- Keyboard: Escape key closes the panel

## Step 4: Create Glossary Trigger Button

In `frontend/src/components/layout/BrandHeader.tsx`:

1. Read the file fully to understand the existing button patterns
2. Add a glossary trigger button in the header bar — position it between the existing navigation elements and the "Beta Waitlist" button
3. The button should:
   - Use the `BookOpen` icon from lucide-react
   - Show text "Glossary" next to the icon
   - Match the styling of the existing "Scenarios" button (study its classes)
   - On click: call `toggleGlossary()` from the store
   - When glossary is open: show the button in active/highlighted state (primary color background)
   - **Only visible when the user is inside the playground flow (stages 1-6)** — not on the landing/scenario selection page. Use `currentStep` from the store to determine this.

## Step 5: Integrate Panel Into App Layout

In `frontend/src/App.tsx` (or wherever the main layout is rendered):

1. Read the file to understand how SessionSidebar is rendered
2. Add `<GlossaryPanel />` at the same level as SessionSidebar
3. The panel should render conditionally based on `glossaryOpen` from the store
4. Ensure the panel and SessionSidebar cannot be open simultaneously (handled by store logic in Step 1)

## Step 6: Connect MLTooltip to Glossary (Enhancement)

In `frontend/src/components/shared/MLTooltip.tsx`:

Add an optional "Learn more" link at the bottom of each tooltip. When clicked, it should:
1. Open the glossary panel (`setGlossaryOpen(true)`)
2. Scroll to and expand the relevant term in the glossary

This creates a seamless flow: hover tooltip for quick info → click "Learn more" for the full definition.

To implement this:
- Add a small "Learn more →" link at the bottom of the tooltip popup
- On click: dispatch `setGlossaryOpen(true)` and set a `highlightTerm` state (you may need to add this to the store or use a simple event/callback pattern)
- In GlossaryPanel: watch for `highlightTerm` changes and auto-scroll + expand + highlight that term
</task>

<constraints>
- The GlossaryPanel must not interfere with existing SessionSidebar functionality
- Do NOT modify the SessionSidebar component itself
- The glossary trigger button must match existing header button styling exactly
- The panel must work on all viewport sizes above 768px (mobile is not required for the playground)
- Search must be performant — no lag even with 50+ glossary entries
- All animations must use Framer Motion (not CSS transitions) to match the codebase
- Do not add any new npm dependencies — only use libraries already in the project
- The panel state should persist within a session but reset on page reload (no localStorage)
</constraints>

<edge_cases>
- If a user clicks "Learn more" in a tooltip while the glossary is already open to a different term, the panel should scroll to the new term smoothly
- If the related terms reference a term not in the current stage filter, temporarily switch to "Show All" to display it
- If the currentStep is on a stage with zero glossary entries (e.g., Stage 1 or 2), the panel should automatically show "Show All" terms and display a note: "No specific terms for this stage — showing all terms"
- Search should handle partial matches and be accent-insensitive
- If the user types in search and then changes stages, the search query should persist but results should update for the new stage
- The Escape key should only close the glossary panel if it's the topmost overlay (not if a modal is open above it)
</edge_cases>

<internal_review_process>
After completing all changes, perform two internal reviews:

**Review 1 — UX/Accessibility Advocate:**
- Open the glossary panel on each stage (3, 4, 5, 6). Do the correct terms appear?
- Search for a few terms. Is the search responsive and accurate?
- Click "Related terms" links. Do they navigate correctly?
- Click the "Learn more" link in a tooltip. Does it open the glossary to the right term?
- Is the panel easy to dismiss? (X button, backdrop click, Escape key)
- Is the visual hierarchy clear? (Search > Filters > Entries)
- Would a non-ML user find this helpful, or is it just more information overload?

**Review 2 — Senior Frontend Engineer:**
- Does the panel animation match the smoothness of SessionSidebar?
- Is the store update logic correct? (glossary and sidebar mutual exclusion)
- Are there any z-index conflicts?
- Is the search debounced correctly?
- Does the accordion behavior work (only one expanded at a time)?
- Are all TypeScript types correct?
- Does `npm run build` pass?
</internal_review_process>

<self_validation>
Before delivering, verify ALL of the following:

- [ ] Store has `glossaryOpen`, `setGlossaryOpen`, `toggleGlossary` — mutual exclusion with `sidebarOpen`
- [ ] `GlossaryPanel.tsx` exists with full search, filter, accordion, and stage-awareness functionality
- [ ] Glossary trigger button appears in BrandHeader (only during playground stages)
- [ ] Panel slides in from right with Framer Motion animation
- [ ] Search filters entries by displayName, shortDefinition, and fullDefinition
- [ ] Category filter chips work and are stage-aware
- [ ] Accordion behavior: only one entry expanded at a time
- [ ] "Show All" toggle works to display terms from all stages
- [ ] Related terms are clickable and scroll to the target term
- [ ] MLTooltip "Learn more" link opens glossary and highlights the correct term
- [ ] Panel and SessionSidebar cannot be open simultaneously
- [ ] Escape key closes the panel
- [ ] `cd frontend && npm run build` passes with zero errors
- [ ] No visual regressions to existing components
</self_validation>
