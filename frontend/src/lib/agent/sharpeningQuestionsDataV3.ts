// ─── Sharpening Questions Data V3 ──────────────────────────────────────
// Stage 1 enhancement for VibeModel Agent Playground V3
// Provides sharpening questions per agent tile to refine goal definition

export interface SharpeningQuestion {
  id: string
  question: string
  impact: string
  answerDependency: string
}

/**
 * Get sharpening questions for a given tile ID.
 * Returns 3 clarifying questions per agent that refine the goal definition
 * and unlock specific execution path patterns and task dimensions.
 */
export function getSharpeningQuestions(tileId: string): SharpeningQuestion[] {
  const questionsMap: Record<string, SharpeningQuestion[]> = {
    // ── Invoice Processing Agent ────────────────────────────────────────
    'saas-copilot': [
      {
        id: 'invoice-q1',
        question:
          'Do your invoices require matching against purchase orders for validation?',
        impact:
          'Adds PO matching task dimension + cross-source-join complexity + validation gate + discrepancy handling',
        answerDependency:
          'Unlocks tasks 5-6, adds 340 new execution paths',
      },
      {
        id: 'invoice-q2',
        question:
          'Do any of your vendors send invoices in non-standard formats (scanned images, handwritten notes)?',
        impact:
          'Adds image-data meta-pattern + OCR tool dimension + confidence-threshold-routing + human escalation',
        answerDependency:
          'Unlocks tool-fallback-chain pattern, adds 8 new tool states, 12 failure recovery paths',
      },
      {
        id: 'invoice-q3',
        question:
          'Does your approval workflow require human sign-off above a certain dollar threshold?',
        impact:
          'Adds human-escalation-gate meta-pattern + conditional-task-branching + supervisor routing',
        answerDependency:
          'Unlocks supervision layer, adds 5 response outcome states',
      },
    ],

    // ── Enterprise RAG Copilot ──────────────────────────────────────────
    'coding-agent': [
      {
        id: 'rag-q1',
        question:
          'Should the agent require permission to access restricted Slack channels/Drive folders, or should it hide those results transparently?',
        impact:
          'Adds access-control-aware filtering + decision-tree branching for visibility',
        answerDependency:
          'Unlocks privacy-mode vs transparency-mode pattern, adds 2 execution paths per query',
      },
      {
        id: 'rag-q2',
        question:
          'How fresh should data be? Should old Confluence pages (>90 days) trigger a freshness warning?',
        impact:
          'Adds document-freshness-assessment task + warning generation + optional refresh triggers',
        answerDependency:
          'Unlocks stale-data-detection pattern, adds 4 data states (current, aging, stale, archived)',
      },
      {
        id: 'rag-q3',
        question:
          'Should the agent attempt to find answers to ambiguous questions through multi-source correlation, or escalate immediately?',
        impact:
          'Adds reasoning-chain complexity + confidence-threshold-routing + human escalation gates',
        answerDependency:
          'Unlocks fuzzy-match pattern, adds 3 confidence-based execution paths per query',
      },
    ],

    // ── SaaS Customer Support Agent ─────────────────────────────────────
    'saas-copilot-support': [
      {
        id: 'support-q1',
        question:
          'How often do customers need actions that require human approval beyond price threshold?',
        impact:
          'Determines escalation gate frequency, affects 14% of execution paths, adds supervisor approval workflow',
        answerDependency:
          'Unlocks task-005, adds human-approval-chain meta-pattern, 120 new execution paths',
      },
      {
        id: 'support-q2',
        question:
          'Do you track customer sentiment across ticket threads to adapt tone?',
        impact:
          'Adds sentiment-aware-response-calibration pattern, affects 18% of response generation, 89 new paths',
        answerDependency:
          'Unlocks response-tone-adaptation, adds classifier tool, sentiment-history correlation',
      },
      {
        id: 'support-q3',
        question:
          'How many knowledge base articles become stale monthly, and how quickly?',
        impact:
          'Determines KB refresh strategy, affects citation confidence, adds staleness detection pattern',
        answerDependency:
          'Unlocks article-freshness-validation, 42 new paths, adds quality-gate task',
      },
    ],

    // ── FAQ Knowledge Agent ────────────────────────────────────────────
    'faq-knowledge': [
      {
        id: 'faq-q1',
        question:
          'Do you want the agent to handle multi-step follow-up questions (e.g., "How do I request vacation" → "How do I notify my manager")?',
        impact:
          'Adds multi-turn conversation state tracking, follow-up context chaining',
        answerDependency:
          'Unlocks conversation-memory meta-pattern, adds 340 execution paths',
      },
      {
        id: 'faq-q2',
        question:
          'Should the agent proactively suggest related policies (e.g., "You asked about vacation; related docs: Parental Leave, Sabbatical")?',
        impact:
          'Adds semantic similarity suggestions, doc-recommendation pattern',
        answerDependency:
          'Unlocks document-recommendation meta-pattern, adds 180 paths',
      },
    ],
  }

  return questionsMap[tileId] || []
}
