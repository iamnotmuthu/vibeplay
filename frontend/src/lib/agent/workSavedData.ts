import type { AgentStageId, WorkSavedEntry, StageReceipt } from '@/store/agentTypes'
import { AGENT_STAGE_LABELS } from '@/store/agentTypes'

// ─── Per-Stage Work Saved Metrics ───────────────────────────────────────
// Each stage contributes specific "work saved" entries when completed.
// These simulate what the engine would compute in production.

const WORK_SAVED_BY_STAGE: Record<string, Record<AgentStageId, WorkSavedEntry[]>> = {
  'faq-bot': {
    tiles: [],
    goal: [
      { stageId: 'goal', stageLabel: AGENT_STAGE_LABELS.goal, metric: 'Goal decomposition', value: '3 sub-goals extracted', icon: '🎯' },
      { stageId: 'goal', stageLabel: AGENT_STAGE_LABELS.goal, metric: 'Scope definition time', value: '~2 hours saved', icon: '⏱️' },
    ],
    'context-definition': [
      { stageId: 'context-definition', stageLabel: AGENT_STAGE_LABELS['context-definition'], metric: 'Context items mapped', value: '18 items across 5 categories', icon: '📋' },
      { stageId: 'context-definition', stageLabel: AGENT_STAGE_LABELS['context-definition'], metric: 'Data sources identified', value: '4 sources with traceability', icon: '🔗' },
    ],
    'context-dimensions': [
      { stageId: 'context-dimensions', stageLabel: AGENT_STAGE_LABELS['context-dimensions'], metric: 'Dimensions analyzed', value: '3 flow + 3 data + 3 response', icon: '📐' },
      { stageId: 'context-dimensions', stageLabel: AGENT_STAGE_LABELS['context-dimensions'], metric: 'Architecture decisions', value: '9 dimension mappings', icon: '🧭' },
    ],
    'interaction-discovery': [
      { stageId: 'interaction-discovery', stageLabel: AGENT_STAGE_LABELS['interaction-discovery'], metric: 'Patterns discovered', value: '8 patterns from 9 combinations', icon: '🔍' },
      { stageId: 'interaction-discovery', stageLabel: AGENT_STAGE_LABELS['interaction-discovery'], metric: 'Edge cases identified', value: '2 fuzzy patterns flagged', icon: '⚠️' },
    ],
    'agent-evaluation': [
      { stageId: 'agent-evaluation', stageLabel: AGENT_STAGE_LABELS['agent-evaluation'], metric: 'Test scenarios generated', value: '12 evaluation cases', icon: '🧪' },
    ],
    'solution-architecture': [
      { stageId: 'solution-architecture', stageLabel: AGENT_STAGE_LABELS['solution-architecture'], metric: 'Components selected', value: '8 of 26 activated', icon: '🏗️' },
      { stageId: 'solution-architecture', stageLabel: AGENT_STAGE_LABELS['solution-architecture'], metric: 'Architecture blueprint', value: '1 production-ready spec', icon: '📄' },
    ],
  },

  'saas-copilot': {
    tiles: [],
    goal: [
      { stageId: 'goal', stageLabel: AGENT_STAGE_LABELS.goal, metric: 'Goal decomposition', value: '5 sub-goals extracted', icon: '🎯' },
      { stageId: 'goal', stageLabel: AGENT_STAGE_LABELS.goal, metric: 'Scope definition time', value: '~4 hours saved', icon: '⏱️' },
    ],
    'context-definition': [
      { stageId: 'context-definition', stageLabel: AGENT_STAGE_LABELS['context-definition'], metric: 'Context items mapped', value: '32 items across 5 categories', icon: '📋' },
      { stageId: 'context-definition', stageLabel: AGENT_STAGE_LABELS['context-definition'], metric: 'Data sources identified', value: '7 sources with traceability', icon: '🔗' },
    ],
    'context-dimensions': [
      { stageId: 'context-dimensions', stageLabel: AGENT_STAGE_LABELS['context-dimensions'], metric: 'Dimensions analyzed', value: '4 flow + 4 data + 4 response', icon: '📐' },
      { stageId: 'context-dimensions', stageLabel: AGENT_STAGE_LABELS['context-dimensions'], metric: 'Architecture decisions', value: '16 dimension mappings', icon: '🧭' },
    ],
    'interaction-discovery': [
      { stageId: 'interaction-discovery', stageLabel: AGENT_STAGE_LABELS['interaction-discovery'], metric: 'Patterns discovered', value: '14 patterns from 16 combinations', icon: '🔍' },
      { stageId: 'interaction-discovery', stageLabel: AGENT_STAGE_LABELS['interaction-discovery'], metric: 'Edge cases identified', value: '4 fuzzy patterns flagged', icon: '⚠️' },
    ],
    'agent-evaluation': [
      { stageId: 'agent-evaluation', stageLabel: AGENT_STAGE_LABELS['agent-evaluation'], metric: 'Test scenarios generated', value: '24 evaluation cases', icon: '🧪' },
    ],
    'solution-architecture': [
      { stageId: 'solution-architecture', stageLabel: AGENT_STAGE_LABELS['solution-architecture'], metric: 'Components selected', value: '14 of 26 activated', icon: '🏗️' },
      { stageId: 'solution-architecture', stageLabel: AGENT_STAGE_LABELS['solution-architecture'], metric: 'Architecture blueprint', value: '1 production-ready spec', icon: '📄' },
    ],
  },

  'research-agent': {
    tiles: [],
    goal: [
      { stageId: 'goal', stageLabel: AGENT_STAGE_LABELS.goal, metric: 'Goal decomposition', value: '7 sub-goals extracted', icon: '🎯' },
      { stageId: 'goal', stageLabel: AGENT_STAGE_LABELS.goal, metric: 'Scope definition time', value: '~6 hours saved', icon: '⏱️' },
    ],
    'context-definition': [
      { stageId: 'context-definition', stageLabel: AGENT_STAGE_LABELS['context-definition'], metric: 'Context items mapped', value: '48 items across 5 categories', icon: '📋' },
      { stageId: 'context-definition', stageLabel: AGENT_STAGE_LABELS['context-definition'], metric: 'Data sources identified', value: '11 sources with traceability', icon: '🔗' },
    ],
    'context-dimensions': [
      { stageId: 'context-dimensions', stageLabel: AGENT_STAGE_LABELS['context-dimensions'], metric: 'Dimensions analyzed', value: '5 flow + 5 data + 5 response', icon: '📐' },
      { stageId: 'context-dimensions', stageLabel: AGENT_STAGE_LABELS['context-dimensions'], metric: 'Architecture decisions', value: '25 dimension mappings', icon: '🧭' },
    ],
    'interaction-discovery': [
      { stageId: 'interaction-discovery', stageLabel: AGENT_STAGE_LABELS['interaction-discovery'], metric: 'Patterns discovered', value: '21 patterns from 25 combinations', icon: '🔍' },
      { stageId: 'interaction-discovery', stageLabel: AGENT_STAGE_LABELS['interaction-discovery'], metric: 'Edge cases identified', value: '7 fuzzy patterns flagged', icon: '⚠️' },
    ],
    'agent-evaluation': [
      { stageId: 'agent-evaluation', stageLabel: AGENT_STAGE_LABELS['agent-evaluation'], metric: 'Test scenarios generated', value: '36 evaluation cases', icon: '🧪' },
    ],
    'solution-architecture': [
      { stageId: 'solution-architecture', stageLabel: AGENT_STAGE_LABELS['solution-architecture'], metric: 'Components selected', value: '21 of 26 activated', icon: '🏗️' },
      { stageId: 'solution-architecture', stageLabel: AGENT_STAGE_LABELS['solution-architecture'], metric: 'Architecture blueprint', value: '1 production-ready spec', icon: '📄' },
    ],
  },
}

export function getWorkSavedEntries(tileId: string, stageId: AgentStageId): WorkSavedEntry[] {
  return WORK_SAVED_BY_STAGE[tileId]?.[stageId] ?? []
}

// ─── Stage Receipts ─────────────────────────────────────────────────────
// "What Just Happened" receipt shown after each stage transition.

const STAGE_RECEIPTS: Record<string, Record<AgentStageId, StageReceipt>> = {
  'faq-bot': {
    tiles: { stageId: 'tiles', stageLabel: 'Scenario', duration: '0s', itemsProcessed: 0, highlights: [] },
    goal: {
      stageId: 'goal',
      stageLabel: AGENT_STAGE_LABELS.goal,
      duration: '1.2s',
      itemsProcessed: 3,
      highlights: ['Decomposed goal into 3 sub-goals', 'Identified 2 watchpoints'],
    },
    'context-definition': {
      stageId: 'context-definition',
      stageLabel: AGENT_STAGE_LABELS['context-definition'],
      duration: '2.8s',
      itemsProcessed: 18,
      highlights: ['Mapped 18 context items', 'Linked 4 data sources', 'Set 3 guardrails'],
    },
    'context-dimensions': {
      stageId: 'context-dimensions',
      stageLabel: AGENT_STAGE_LABELS['context-dimensions'],
      duration: '3.1s',
      itemsProcessed: 9,
      highlights: ['Analyzed 3 flow dimensions', 'Scored 3 data knowledge areas', 'Defined 3 response modes'],
    },
    'interaction-discovery': {
      stageId: 'interaction-discovery',
      stageLabel: AGENT_STAGE_LABELS['interaction-discovery'],
      duration: '4.2s',
      itemsProcessed: 8,
      highlights: ['Evaluated 9 combinations', 'Discovered 8 valid patterns', 'Flagged 2 fuzzy edges'],
    },
    'agent-evaluation': {
      stageId: 'agent-evaluation',
      stageLabel: AGENT_STAGE_LABELS['agent-evaluation'],
      duration: '2.4s',
      itemsProcessed: 12,
      highlights: ['Generated 12 test cases', 'Ran quality checks'],
    },
    'solution-architecture': {
      stageId: 'solution-architecture',
      stageLabel: AGENT_STAGE_LABELS['solution-architecture'],
      duration: '1.8s',
      itemsProcessed: 8,
      highlights: ['Activated 8 components', 'Generated deployment blueprint'],
    },
  },

  'saas-copilot': {
    tiles: { stageId: 'tiles', stageLabel: 'Scenario', duration: '0s', itemsProcessed: 0, highlights: [] },
    goal: {
      stageId: 'goal',
      stageLabel: AGENT_STAGE_LABELS.goal,
      duration: '1.8s',
      itemsProcessed: 5,
      highlights: ['Decomposed goal into 5 sub-goals', 'Identified 3 watchpoints'],
    },
    'context-definition': {
      stageId: 'context-definition',
      stageLabel: AGENT_STAGE_LABELS['context-definition'],
      duration: '4.1s',
      itemsProcessed: 32,
      highlights: ['Mapped 32 context items', 'Linked 7 data sources', 'Set 5 guardrails'],
    },
    'context-dimensions': {
      stageId: 'context-dimensions',
      stageLabel: AGENT_STAGE_LABELS['context-dimensions'],
      duration: '4.6s',
      itemsProcessed: 12,
      highlights: ['Analyzed 4 flow dimensions', 'Scored 4 data knowledge areas', 'Defined 4 response modes'],
    },
    'interaction-discovery': {
      stageId: 'interaction-discovery',
      stageLabel: AGENT_STAGE_LABELS['interaction-discovery'],
      duration: '6.3s',
      itemsProcessed: 14,
      highlights: ['Evaluated 16 combinations', 'Discovered 14 valid patterns', 'Flagged 4 fuzzy edges'],
    },
    'agent-evaluation': {
      stageId: 'agent-evaluation',
      stageLabel: AGENT_STAGE_LABELS['agent-evaluation'],
      duration: '3.8s',
      itemsProcessed: 24,
      highlights: ['Generated 24 test cases', 'Ran quality checks'],
    },
    'solution-architecture': {
      stageId: 'solution-architecture',
      stageLabel: AGENT_STAGE_LABELS['solution-architecture'],
      duration: '2.5s',
      itemsProcessed: 14,
      highlights: ['Activated 14 components', 'Generated deployment blueprint'],
    },
  },

  'research-agent': {
    tiles: { stageId: 'tiles', stageLabel: 'Scenario', duration: '0s', itemsProcessed: 0, highlights: [] },
    goal: {
      stageId: 'goal',
      stageLabel: AGENT_STAGE_LABELS.goal,
      duration: '2.4s',
      itemsProcessed: 7,
      highlights: ['Decomposed goal into 7 sub-goals', 'Identified 4 watchpoints'],
    },
    'context-definition': {
      stageId: 'context-definition',
      stageLabel: AGENT_STAGE_LABELS['context-definition'],
      duration: '5.7s',
      itemsProcessed: 48,
      highlights: ['Mapped 48 context items', 'Linked 11 data sources', 'Set 7 guardrails'],
    },
    'context-dimensions': {
      stageId: 'context-dimensions',
      stageLabel: AGENT_STAGE_LABELS['context-dimensions'],
      duration: '6.2s',
      itemsProcessed: 15,
      highlights: ['Analyzed 5 flow dimensions', 'Scored 5 data knowledge areas', 'Defined 5 response modes'],
    },
    'interaction-discovery': {
      stageId: 'interaction-discovery',
      stageLabel: AGENT_STAGE_LABELS['interaction-discovery'],
      duration: '8.9s',
      itemsProcessed: 21,
      highlights: ['Evaluated 25 combinations', 'Discovered 21 valid patterns', 'Flagged 7 fuzzy edges'],
    },
    'agent-evaluation': {
      stageId: 'agent-evaluation',
      stageLabel: AGENT_STAGE_LABELS['agent-evaluation'],
      duration: '5.2s',
      itemsProcessed: 36,
      highlights: ['Generated 36 test cases', 'Ran quality checks'],
    },
    'solution-architecture': {
      stageId: 'solution-architecture',
      stageLabel: AGENT_STAGE_LABELS['solution-architecture'],
      duration: '3.4s',
      itemsProcessed: 21,
      highlights: ['Activated 21 components', 'Generated deployment blueprint'],
    },
  },
}

export function getStageReceipt(tileId: string, stageId: AgentStageId): StageReceipt | null {
  return STAGE_RECEIPTS[tileId]?.[stageId] ?? null
}
