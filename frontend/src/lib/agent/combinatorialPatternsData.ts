import type {
  CombinationCell,
  DimensionPattern,
  PatternsPayload,
} from '@/store/agentTypes'

// ============================================================================
// FAQ & KNOWLEDGE AGENT — SIMPLE TILE
// ============================================================================

const FAQ_FLOW_DIMENSIONS = [
  'faq-flow-retrieval',
  'faq-flow-clarification',
  'faq-flow-escalation',
] // 3

const FAQ_DATA_DIMENSIONS = [
  'faq-data-product',
  'faq-data-pricing',
  'faq-data-policy',
  'faq-data-support',
] // 4

const FAQ_RESPONSE_DIMENSIONS = [
  'faq-resp-short',
  'faq-resp-step',
  'faq-resp-detailed',
  'faq-resp-summary',
] // 4

const FAQ_MATRIX: CombinationCell[][] = [
  // Row 0: retrieval
  [
    {
      flowDimensionId: 'faq-flow-retrieval',
      dataDimensionId: 'faq-data-product',
      isValid: true,
      patternCount: 4,
      dominantTier: 'simple',
      responseDimensionIds: [
        'faq-resp-short',
        'faq-resp-step',
        'faq-resp-detailed',
        'faq-resp-summary',
      ],
    },
    {
      flowDimensionId: 'faq-flow-retrieval',
      dataDimensionId: 'faq-data-pricing',
      isValid: true,
      patternCount: 3,
      dominantTier: 'simple',
      responseDimensionIds: [
        'faq-resp-short',
        'faq-resp-detailed',
        'faq-resp-summary',
      ],
    },
    {
      flowDimensionId: 'faq-flow-retrieval',
      dataDimensionId: 'faq-data-policy',
      isValid: true,
      patternCount: 3,
      dominantTier: 'simple',
      responseDimensionIds: [
        'faq-resp-short',
        'faq-resp-detailed',
        'faq-resp-summary',
      ],
    },
    {
      flowDimensionId: 'faq-flow-retrieval',
      dataDimensionId: 'faq-data-support',
      isValid: true,
      patternCount: 2,
      dominantTier: 'simple',
      responseDimensionIds: ['faq-resp-short', 'faq-resp-step'],
    },
  ],
  // Row 1: clarification
  [
    {
      flowDimensionId: 'faq-flow-clarification',
      dataDimensionId: 'faq-data-product',
      isValid: true,
      patternCount: 2,
      dominantTier: 'complex',
      responseDimensionIds: ['faq-resp-short', 'faq-resp-step'],
    },
    {
      flowDimensionId: 'faq-flow-clarification',
      dataDimensionId: 'faq-data-pricing',
      isValid: true,
      patternCount: 2,
      dominantTier: 'complex',
      responseDimensionIds: ['faq-resp-short', 'faq-resp-detailed'],
    },
    {
      flowDimensionId: 'faq-flow-clarification',
      dataDimensionId: 'faq-data-policy',
      isValid: true,
      patternCount: 1,
      dominantTier: 'fuzzy',
      responseDimensionIds: ['faq-resp-detailed'],
    },
    {
      flowDimensionId: 'faq-flow-clarification',
      dataDimensionId: 'faq-data-support',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
  ],
  // Row 2: escalation
  [
    {
      flowDimensionId: 'faq-flow-escalation',
      dataDimensionId: 'faq-data-product',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
    {
      flowDimensionId: 'faq-flow-escalation',
      dataDimensionId: 'faq-data-pricing',
      isValid: true,
      patternCount: 1,
      dominantTier: 'fuzzy',
      responseDimensionIds: ['faq-resp-summary'],
    },
    {
      flowDimensionId: 'faq-flow-escalation',
      dataDimensionId: 'faq-data-policy',
      isValid: true,
      patternCount: 2,
      dominantTier: 'fuzzy',
      responseDimensionIds: ['faq-resp-detailed', 'faq-resp-summary'],
    },
    {
      flowDimensionId: 'faq-flow-escalation',
      dataDimensionId: 'faq-data-support',
      isValid: true,
      patternCount: 2,
      dominantTier: 'complex',
      responseDimensionIds: ['faq-resp-short', 'faq-resp-step'],
    },
  ],
]

const FAQ_PATTERNS: DimensionPattern[] = [
  // SIMPLE TIER PATTERNS
  {
    id: 'faq-pattern-direct-product',
    name: 'Direct Product FAQ',
    description: 'Straightforward product feature retrieval',
    tier: 'simple',
    patternType: 'simple',
    confidence: 97,
    flowDimensionId: 'faq-flow-retrieval',
    dataDimensionIds: ['faq-data-product'],
    responseDimensionId: 'faq-resp-short',
    exampleQuestions: ['What features does the Pro plan include?'],
    activatedComponents: [
      'api-gateway',
      'auth',
      'input-validation',
      'rag',
      'response-generation',
      'output-guardrails',
      'logging-analytics',
    ],
  },
  {
    id: 'faq-pattern-pricing-lookup',
    name: 'Pricing Lookup',
    description: 'Quick pricing tier and cost questions',
    tier: 'simple',
    patternType: 'simple',
    confidence: 95,
    flowDimensionId: 'faq-flow-retrieval',
    dataDimensionIds: ['faq-data-pricing'],
    responseDimensionId: 'faq-resp-short',
    exampleQuestions: ['How much does the Team plan cost?'],
    activatedComponents: [
      'api-gateway',
      'auth',
      'input-validation',
      'rag',
      'response-generation',
    ],
  },
  {
    id: 'faq-pattern-policy-quick',
    name: 'Policy Quick Answer',
    description: 'Fast policy references and simple rules',
    tier: 'simple',
    patternType: 'simple',
    confidence: 92,
    flowDimensionId: 'faq-flow-retrieval',
    dataDimensionIds: ['faq-data-policy'],
    responseDimensionId: 'faq-resp-short',
    exampleQuestions: ['What is your refund policy?'],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
    ],
  },
  {
    id: 'faq-pattern-support-quick',
    name: 'Support Contact Quick',
    description: 'Quick support channel and status info',
    tier: 'simple',
    patternType: 'simple',
    confidence: 90,
    flowDimensionId: 'faq-flow-retrieval',
    dataDimensionIds: ['faq-data-support'],
    responseDimensionId: 'faq-resp-short',
    exampleQuestions: ['How do I contact support?'],
    activatedComponents: ['api-gateway', 'auth', 'response-generation'],
  },
  {
    id: 'faq-pattern-step-product-guide',
    name: 'Step-by-Step Product Guide',
    description: 'Procedural product feature walkthrough',
    tier: 'simple',
    patternType: 'hopping',
    confidence: 88,
    flowDimensionId: 'faq-flow-retrieval',
    dataDimensionIds: ['faq-data-product'],
    responseDimensionId: 'faq-resp-step',
    exampleQuestions: [
      'How do I set up integrations?',
      'How do I configure my workspace?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
      'logging-analytics',
    ],
  },
  {
    id: 'faq-pattern-pricing-detailed',
    name: 'Detailed Pricing Breakdown',
    description: 'In-depth pricing tier comparisons',
    tier: 'simple',
    patternType: 'hopping',
    confidence: 85,
    flowDimensionId: 'faq-flow-retrieval',
    dataDimensionIds: ['faq-data-pricing'],
    responseDimensionId: 'faq-resp-detailed',
    exampleQuestions: [
      'What are the differences between all pricing tiers?',
      'What is included in each plan?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
    ],
  },

  // COMPLEX TIER PATTERNS
  {
    id: 'faq-pattern-ambiguous-product',
    name: 'Ambiguous Product Question',
    description: 'Questions requiring context clarification before answering',
    tier: 'complex',
    patternType: 'branch',
    confidence: 72,
    flowDimensionId: 'faq-flow-clarification',
    dataDimensionIds: ['faq-data-product'],
    responseDimensionId: 'faq-resp-short',
    inferenceNotes:
      'Agent must identify which product or feature the user refers to before providing accurate answer',
    exampleQuestions: [
      'Can I do X?',
      'Does it support Y?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'input-validation',
      'rag',
      'response-generation',
      'branching-logic',
    ],
  },
  {
    id: 'faq-pattern-pricing-clarification',
    name: 'Pricing Clarification Branch',
    description: 'Pricing questions requiring context about usage patterns',
    tier: 'complex',
    patternType: 'branch',
    confidence: 68,
    flowDimensionId: 'faq-flow-clarification',
    dataDimensionIds: ['faq-data-pricing'],
    responseDimensionId: 'faq-resp-detailed',
    inferenceNotes:
      'Agent needs to understand customer volume or feature usage to recommend appropriate tier',
    exampleQuestions: [
      'Which plan is right for me?',
      'How much would I pay if...?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
      'branching-logic',
    ],
  },
  {
    id: 'faq-pattern-support-routing',
    name: 'Support Routing with Escalation',
    description: 'Questions that may need escalation to support team',
    tier: 'complex',
    patternType: 'branch',
    confidence: 65,
    flowDimensionId: 'faq-flow-escalation',
    dataDimensionIds: ['faq-data-support'],
    responseDimensionId: 'faq-resp-step',
    inferenceNotes:
      'Agent determines if human support is needed and provides routing instructions',
    exampleQuestions: [
      'I have a technical issue',
      'I need urgent help',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'input-validation',
      'rag',
      'response-generation',
      'escalation-handler',
    ],
  },

  // FUZZY TIER PATTERNS
  {
    id: 'faq-pattern-policy-edge-case',
    name: 'Policy Edge Case Interpretation',
    description: 'Unusual policy scenarios requiring judgment',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 45,
    flowDimensionId: 'faq-flow-clarification',
    dataDimensionIds: ['faq-data-policy'],
    responseDimensionId: 'faq-resp-detailed',
    ambiguityNotes:
      'Policy does not explicitly cover this scenario; requires reasoning and human judgment',
    exampleQuestions: [
      'What if I cancel after...?',
      'Am I eligible for...?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
      'reasoning-engine',
      'output-guardrails',
    ],
  },
  {
    id: 'faq-pattern-pricing-edge-case',
    name: 'Billing Dispute Triage',
    description: 'Unusual billing situations or discrepancies',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 42,
    flowDimensionId: 'faq-flow-escalation',
    dataDimensionIds: ['faq-data-pricing'],
    responseDimensionId: 'faq-resp-summary',
    ambiguityNotes:
      'Billing issues often have context-dependent solutions; recommend human review',
    exampleQuestions: [
      'Why was I charged twice?',
      'I think there is an error in my invoice',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
      'reasoning-engine',
      'escalation-handler',
    ],
  },
  {
    id: 'faq-pattern-policy-escalation',
    name: 'Policy Escalation Cases',
    description: 'Complex policy violations or exception requests',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 48,
    flowDimensionId: 'faq-flow-escalation',
    dataDimensionIds: ['faq-data-policy'],
    responseDimensionId: 'faq-resp-summary',
    ambiguityNotes:
      'Policy exceptions and special cases require management decision',
    exampleQuestions: [
      'Can you make an exception?',
      'I have a special request',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'response-generation',
      'reasoning-engine',
      'escalation-handler',
    ],
  },
]

const FAQ_PAYLOAD: PatternsPayload = {
  tileId: 'faq-knowledge',
  agentName: 'FAQ & Knowledge Agent',
  tileDescription: 'Retrieval-based FAQ answering with clarification and escalation',
  flowDimensions: FAQ_FLOW_DIMENSIONS,
  dataDimensions: FAQ_DATA_DIMENSIONS,
  responseDimensions: FAQ_RESPONSE_DIMENSIONS,
  totalCombinations: FAQ_FLOW_DIMENSIONS.length * FAQ_DATA_DIMENSIONS.length * FAQ_RESPONSE_DIMENSIONS.length, // 3 × 4 × 4 = 48
  validPatterns: 22,
  matrix: FAQ_MATRIX,
  patterns: FAQ_PATTERNS,
  tierBreakdown: {
    simple: 12,
    complex: 6,
    fuzzy: 4,
  },
}

// ============================================================================
// SAAS COPILOT AGENT — MEDIUM COMPLEXITY TILE
// ============================================================================

const SAAS_FLOW_DIMENSIONS = [
  'saas-flow-action',
  'saas-flow-query',
  'saas-flow-automation',
  'saas-flow-permission',
  'saas-flow-integration',
] // 5

const SAAS_DATA_DIMENSIONS = [
  'saas-data-api',
  'saas-data-workflows',
  'saas-data-permissions',
  'saas-data-history',
  'saas-data-tools',
] // 5

const SAAS_RESPONSE_DIMENSIONS = [
  'saas-resp-action',
  'saas-resp-explanation',
  'saas-resp-config',
  'saas-resp-status',
  'saas-resp-recommendations',
] // 5

const SAAS_MATRIX: CombinationCell[][] = [
  // Row 0: action
  [
    {
      flowDimensionId: 'saas-flow-action',
      dataDimensionId: 'saas-data-api',
      isValid: true,
      patternCount: 5,
      dominantTier: 'simple',
      responseDimensionIds: [
        'saas-resp-action',
        'saas-resp-explanation',
        'saas-resp-config',
        'saas-resp-status',
        'saas-resp-recommendations',
      ],
    },
    {
      flowDimensionId: 'saas-flow-action',
      dataDimensionId: 'saas-data-workflows',
      isValid: true,
      patternCount: 4,
      dominantTier: 'simple',
      responseDimensionIds: [
        'saas-resp-action',
        'saas-resp-explanation',
        'saas-resp-config',
        'saas-resp-status',
      ],
    },
    {
      flowDimensionId: 'saas-flow-action',
      dataDimensionId: 'saas-data-permissions',
      isValid: true,
      patternCount: 3,
      dominantTier: 'complex',
      responseDimensionIds: [
        'saas-resp-action',
        'saas-resp-explanation',
        'saas-resp-config',
      ],
    },
    {
      flowDimensionId: 'saas-flow-action',
      dataDimensionId: 'saas-data-history',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
    {
      flowDimensionId: 'saas-flow-action',
      dataDimensionId: 'saas-data-tools',
      isValid: true,
      patternCount: 3,
      dominantTier: 'simple',
      responseDimensionIds: [
        'saas-resp-action',
        'saas-resp-explanation',
        'saas-resp-config',
      ],
    },
  ],
  // Row 1: query
  [
    {
      flowDimensionId: 'saas-flow-query',
      dataDimensionId: 'saas-data-api',
      isValid: true,
      patternCount: 4,
      dominantTier: 'simple',
      responseDimensionIds: [
        'saas-resp-explanation',
        'saas-resp-config',
        'saas-resp-status',
        'saas-resp-recommendations',
      ],
    },
    {
      flowDimensionId: 'saas-flow-query',
      dataDimensionId: 'saas-data-workflows',
      isValid: true,
      patternCount: 3,
      dominantTier: 'complex',
      responseDimensionIds: [
        'saas-resp-explanation',
        'saas-resp-config',
        'saas-resp-recommendations',
      ],
    },
    {
      flowDimensionId: 'saas-flow-query',
      dataDimensionId: 'saas-data-permissions',
      isValid: true,
      patternCount: 2,
      dominantTier: 'simple',
      responseDimensionIds: [
        'saas-resp-explanation',
        'saas-resp-recommendations',
      ],
    },
    {
      flowDimensionId: 'saas-flow-query',
      dataDimensionId: 'saas-data-history',
      isValid: true,
      patternCount: 4,
      dominantTier: 'simple',
      responseDimensionIds: [
        'saas-resp-explanation',
        'saas-resp-status',
        'saas-resp-config',
        'saas-resp-recommendations',
      ],
    },
    {
      flowDimensionId: 'saas-flow-query',
      dataDimensionId: 'saas-data-tools',
      isValid: true,
      patternCount: 2,
      dominantTier: 'simple',
      responseDimensionIds: ['saas-resp-explanation', 'saas-resp-recommendations'],
    },
  ],
  // Row 2: automation
  [
    {
      flowDimensionId: 'saas-flow-automation',
      dataDimensionId: 'saas-data-api',
      isValid: true,
      patternCount: 3,
      dominantTier: 'complex',
      responseDimensionIds: [
        'saas-resp-action',
        'saas-resp-config',
        'saas-resp-recommendations',
      ],
    },
    {
      flowDimensionId: 'saas-flow-automation',
      dataDimensionId: 'saas-data-workflows',
      isValid: true,
      patternCount: 4,
      dominantTier: 'complex',
      responseDimensionIds: [
        'saas-resp-action',
        'saas-resp-explanation',
        'saas-resp-config',
        'saas-resp-recommendations',
      ],
    },
    {
      flowDimensionId: 'saas-flow-automation',
      dataDimensionId: 'saas-data-permissions',
      isValid: true,
      patternCount: 2,
      dominantTier: 'fuzzy',
      responseDimensionIds: ['saas-resp-config', 'saas-resp-recommendations'],
    },
    {
      flowDimensionId: 'saas-flow-automation',
      dataDimensionId: 'saas-data-history',
      isValid: true,
      patternCount: 1,
      dominantTier: 'complex',
      responseDimensionIds: ['saas-resp-explanation'],
    },
    {
      flowDimensionId: 'saas-flow-automation',
      dataDimensionId: 'saas-data-tools',
      isValid: true,
      patternCount: 3,
      dominantTier: 'complex',
      responseDimensionIds: [
        'saas-resp-action',
        'saas-resp-explanation',
        'saas-resp-config',
      ],
    },
  ],
  // Row 3: permission
  [
    {
      flowDimensionId: 'saas-flow-permission',
      dataDimensionId: 'saas-data-api',
      isValid: true,
      patternCount: 2,
      dominantTier: 'simple',
      responseDimensionIds: ['saas-resp-explanation', 'saas-resp-recommendations'],
    },
    {
      flowDimensionId: 'saas-flow-permission',
      dataDimensionId: 'saas-data-workflows',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
    {
      flowDimensionId: 'saas-flow-permission',
      dataDimensionId: 'saas-data-permissions',
      isValid: true,
      patternCount: 3,
      dominantTier: 'simple',
      responseDimensionIds: [
        'saas-resp-action',
        'saas-resp-explanation',
        'saas-resp-status',
      ],
    },
    {
      flowDimensionId: 'saas-flow-permission',
      dataDimensionId: 'saas-data-history',
      isValid: true,
      patternCount: 2,
      dominantTier: 'complex',
      responseDimensionIds: ['saas-resp-explanation', 'saas-resp-status'],
    },
    {
      flowDimensionId: 'saas-flow-permission',
      dataDimensionId: 'saas-data-tools',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
  ],
  // Row 4: integration
  [
    {
      flowDimensionId: 'saas-flow-integration',
      dataDimensionId: 'saas-data-api',
      isValid: true,
      patternCount: 3,
      dominantTier: 'complex',
      responseDimensionIds: [
        'saas-resp-action',
        'saas-resp-config',
        'saas-resp-recommendations',
      ],
    },
    {
      flowDimensionId: 'saas-flow-integration',
      dataDimensionId: 'saas-data-workflows',
      isValid: true,
      patternCount: 2,
      dominantTier: 'fuzzy',
      responseDimensionIds: ['saas-resp-config', 'saas-resp-recommendations'],
    },
    {
      flowDimensionId: 'saas-flow-integration',
      dataDimensionId: 'saas-data-permissions',
      isValid: true,
      patternCount: 1,
      dominantTier: 'fuzzy',
      responseDimensionIds: ['saas-resp-recommendations'],
    },
    {
      flowDimensionId: 'saas-flow-integration',
      dataDimensionId: 'saas-data-history',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
    {
      flowDimensionId: 'saas-flow-integration',
      dataDimensionId: 'saas-data-tools',
      isValid: true,
      patternCount: 2,
      dominantTier: 'complex',
      responseDimensionIds: ['saas-resp-config', 'saas-resp-recommendations'],
    },
  ],
]

const SAAS_PATTERNS: DimensionPattern[] = [
  // SIMPLE TIER PATTERNS
  {
    id: 'saas-pattern-api-call',
    name: 'Direct API Call',
    description: 'Execute straightforward API operations',
    tier: 'simple',
    patternType: 'simple',
    confidence: 94,
    flowDimensionId: 'saas-flow-action',
    dataDimensionIds: ['saas-data-api'],
    responseDimensionId: 'saas-resp-action',
    exampleQuestions: ['Create a new user', 'Update this object'],
    activatedComponents: [
      'api-gateway',
      'auth',
      'input-validation',
      'api-execution',
      'response-generation',
    ],
  },
  {
    id: 'saas-pattern-workflow-trigger',
    name: 'Workflow Trigger',
    description: 'Start predefined workflows',
    tier: 'simple',
    patternType: 'simple',
    confidence: 91,
    flowDimensionId: 'saas-flow-action',
    dataDimensionIds: ['saas-data-workflows'],
    responseDimensionId: 'saas-resp-action',
    exampleQuestions: ['Run the daily sync', 'Start the onboarding workflow'],
    activatedComponents: [
      'api-gateway',
      'auth',
      'workflow-engine',
      'response-generation',
    ],
  },
  {
    id: 'saas-pattern-api-explain',
    name: 'API Documentation Lookup',
    description: 'Explain API endpoints and parameters',
    tier: 'simple',
    patternType: 'hopping',
    confidence: 89,
    flowDimensionId: 'saas-flow-query',
    dataDimensionIds: ['saas-data-api'],
    responseDimensionId: 'saas-resp-explanation',
    exampleQuestions: [
      'What does the users endpoint do?',
      'What parameters does this endpoint accept?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
    ],
  },
  {
    id: 'saas-pattern-history-status',
    name: 'Audit & Status Check',
    description: 'Query recent actions and current status',
    tier: 'simple',
    patternType: 'hopping',
    confidence: 87,
    flowDimensionId: 'saas-flow-query',
    dataDimensionIds: ['saas-data-history'],
    responseDimensionId: 'saas-resp-status',
    exampleQuestions: [
      'What happened today?',
      'What is the current status?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
      'logging-analytics',
    ],
  },
  {
    id: 'saas-pattern-tool-query',
    name: 'Tool Integration Query',
    description: 'Ask about available integrations and tools',
    tier: 'simple',
    patternType: 'simple',
    confidence: 85,
    flowDimensionId: 'saas-flow-query',
    dataDimensionIds: ['saas-data-tools'],
    responseDimensionId: 'saas-resp-recommendations',
    exampleQuestions: [
      'What tools can I integrate?',
      'Which tool is best for X?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
    ],
  },
  {
    id: 'saas-pattern-permission-check',
    name: 'Permission Verification',
    description: 'Check what current user can access',
    tier: 'simple',
    patternType: 'simple',
    confidence: 83,
    flowDimensionId: 'saas-flow-permission',
    dataDimensionIds: ['saas-data-permissions'],
    responseDimensionId: 'saas-resp-explanation',
    exampleQuestions: [
      'What can I do?',
      'Do I have access to X?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'permission-checker',
      'response-generation',
    ],
  },

  // COMPLEX TIER PATTERNS
  {
    id: 'saas-pattern-conditional-action',
    name: 'Conditional Action Execution',
    description: 'Execute actions based on workflow conditions',
    tier: 'complex',
    patternType: 'branch',
    confidence: 71,
    flowDimensionId: 'saas-flow-automation',
    dataDimensionIds: ['saas-data-api'],
    responseDimensionId: 'saas-resp-config',
    inferenceNotes:
      'Agent must evaluate conditions before executing API calls',
    exampleQuestions: [
      'Update only if status is pending',
      'Create if it does not exist',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'conditional-logic',
      'api-execution',
      'response-generation',
    ],
  },
  {
    id: 'saas-pattern-workflow-composition',
    name: 'Workflow Composition',
    description: 'Build complex multi-step workflows',
    tier: 'complex',
    patternType: 'branch',
    confidence: 69,
    flowDimensionId: 'saas-flow-automation',
    dataDimensionIds: ['saas-data-workflows'],
    responseDimensionId: 'saas-resp-config',
    inferenceNotes:
      'Agent must sequence multiple workflow steps and manage transitions',
    exampleQuestions: [
      'Run workflow A then workflow B',
      'Chain these operations together',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'workflow-engine',
      'conditional-logic',
      'response-generation',
    ],
  },
  {
    id: 'saas-pattern-workflow-query',
    name: 'Workflow Status & Analysis',
    description: 'Query and explain workflow configurations',
    tier: 'complex',
    patternType: 'branch',
    confidence: 67,
    flowDimensionId: 'saas-flow-query',
    dataDimensionIds: ['saas-data-workflows'],
    responseDimensionId: 'saas-resp-explanation',
    inferenceNotes:
      'Agent must understand workflow structure and explain relationships',
    exampleQuestions: [
      'How does this workflow work?',
      'What are all the steps?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
      'logging-analytics',
    ],
  },
  {
    id: 'saas-pattern-permission-management',
    name: 'Permission Management',
    description: 'Configure and update user permissions',
    tier: 'complex',
    patternType: 'branch',
    confidence: 64,
    flowDimensionId: 'saas-flow-permission',
    dataDimensionIds: ['saas-data-permissions'],
    responseDimensionId: 'saas-resp-action',
    inferenceNotes:
      'Agent must validate permission changes against current role hierarchy',
    exampleQuestions: [
      'Grant admin access to user X',
      'Revoke edit permissions',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'permission-checker',
      'api-execution',
      'response-generation',
      'output-guardrails',
    ],
  },
  {
    id: 'saas-pattern-integration-setup',
    name: 'Integration Configuration',
    description: 'Configure and test integrations',
    tier: 'complex',
    patternType: 'branch',
    confidence: 62,
    flowDimensionId: 'saas-flow-integration',
    dataDimensionIds: ['saas-data-api'],
    responseDimensionId: 'saas-resp-config',
    inferenceNotes:
      'Agent must manage API credentials and validate integration setup',
    exampleQuestions: [
      'Connect to Slack',
      'Set up Zapier integration',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'credential-manager',
      'api-execution',
      'response-generation',
      'output-guardrails',
    ],
  },

  // FUZZY TIER PATTERNS
  {
    id: 'saas-pattern-workflow-permission-conflict',
    name: 'Workflow-Permission Conflict Resolution',
    description: 'Handle conflicting workflow and permission requirements',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 51,
    flowDimensionId: 'saas-flow-automation',
    dataDimensionIds: ['saas-data-permissions'],
    responseDimensionId: 'saas-resp-recommendations',
    ambiguityNotes:
      'Conflicts between workflow requirements and user permissions require contextual judgment',
    exampleQuestions: [
      'Can I automate X if I don\'t have Y permission?',
      'How do I run this workflow with restricted access?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'permission-checker',
      'reasoning-engine',
      'response-generation',
    ],
  },
  {
    id: 'saas-pattern-integration-compatibility',
    name: 'Integration Compatibility Assessment',
    description: 'Assess feasibility of integrations',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 48,
    flowDimensionId: 'saas-flow-integration',
    dataDimensionIds: ['saas-data-workflows'],
    responseDimensionId: 'saas-resp-recommendations',
    ambiguityNotes:
      'Integration compatibility depends on external tool limitations and configuration',
    exampleQuestions: [
      'Can I connect X to Y?',
      'Would this integration work with our setup?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'response-generation',
    ],
  },
  {
    id: 'saas-pattern-permission-edge-case',
    name: 'Permission Edge Case Resolution',
    description: 'Handle unusual permission scenarios',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 46,
    flowDimensionId: 'saas-flow-permission',
    dataDimensionIds: ['saas-data-history'],
    responseDimensionId: 'saas-resp-recommendations',
    ambiguityNotes:
      'Historical context may reveal permission requirements not in current schema',
    exampleQuestions: [
      'What permissions did this user have before?',
      'Why can\'t I access this anymore?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'response-generation',
    ],
  },
]

const SAAS_PAYLOAD: PatternsPayload = {
  tileId: 'saas-copilot',
  agentName: 'SaaS Copilot Agent',
  tileDescription: 'Multi-flow SaaS workspace automation and orchestration',
  flowDimensions: SAAS_FLOW_DIMENSIONS,
  dataDimensions: SAAS_DATA_DIMENSIONS,
  responseDimensions: SAAS_RESPONSE_DIMENSIONS,
  totalCombinations: SAAS_FLOW_DIMENSIONS.length * SAAS_DATA_DIMENSIONS.length * SAAS_RESPONSE_DIMENSIONS.length, // 5 × 5 × 5 = 125
  validPatterns: 57,
  matrix: SAAS_MATRIX,
  patterns: SAAS_PATTERNS,
  tierBreakdown: {
    simple: 25,
    complex: 23,
    fuzzy: 9,
  },
}

// ============================================================================
// RESEARCH & COMPARISON AGENT — COMPLEX TILE
// ============================================================================

const RESEARCH_FLOW_DIMENSIONS = [
  'research-flow-comparative',
  'research-flow-analytical',
  'research-flow-synthesis',
  'research-flow-validation',
  'research-flow-recommendation',
  'research-flow-deep-dive',
] // 6

const RESEARCH_DATA_DIMENSIONS = [
  'research-data-competitors',
  'research-data-market',
  'research-data-technical',
  'research-data-customer',
  'research-data-trends',
] // 5

const RESEARCH_RESPONSE_DIMENSIONS = [
  'research-resp-summary',
  'research-resp-comparison',
  'research-resp-analysis',
  'research-resp-recommendation',
  'research-resp-detailed-report',
  'research-resp-visual-breakdown',
] // 6

const RESEARCH_MATRIX: CombinationCell[][] = [
  // Row 0: comparative
  [
    {
      flowDimensionId: 'research-flow-comparative',
      dataDimensionId: 'research-data-competitors',
      isValid: true,
      patternCount: 5,
      dominantTier: 'simple',
      responseDimensionIds: [
        'research-resp-summary',
        'research-resp-comparison',
        'research-resp-analysis',
        'research-resp-detailed-report',
        'research-resp-visual-breakdown',
      ],
    },
    {
      flowDimensionId: 'research-flow-comparative',
      dataDimensionId: 'research-data-market',
      isValid: true,
      patternCount: 4,
      dominantTier: 'simple',
      responseDimensionIds: [
        'research-resp-summary',
        'research-resp-comparison',
        'research-resp-analysis',
        'research-resp-detailed-report',
      ],
    },
    {
      flowDimensionId: 'research-flow-comparative',
      dataDimensionId: 'research-data-technical',
      isValid: true,
      patternCount: 3,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-comparison',
        'research-resp-analysis',
        'research-resp-detailed-report',
      ],
    },
    {
      flowDimensionId: 'research-flow-comparative',
      dataDimensionId: 'research-data-customer',
      isValid: true,
      patternCount: 4,
      dominantTier: 'simple',
      responseDimensionIds: [
        'research-resp-summary',
        'research-resp-comparison',
        'research-resp-analysis',
        'research-resp-detailed-report',
      ],
    },
    {
      flowDimensionId: 'research-flow-comparative',
      dataDimensionId: 'research-data-trends',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
  ],
  // Row 1: analytical
  [
    {
      flowDimensionId: 'research-flow-analytical',
      dataDimensionId: 'research-data-competitors',
      isValid: true,
      patternCount: 4,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-detailed-report',
        'research-resp-visual-breakdown',
        'research-resp-recommendation',
      ],
    },
    {
      flowDimensionId: 'research-flow-analytical',
      dataDimensionId: 'research-data-market',
      isValid: true,
      patternCount: 5,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-detailed-report',
        'research-resp-visual-breakdown',
        'research-resp-recommendation',
        'research-resp-summary',
      ],
    },
    {
      flowDimensionId: 'research-flow-analytical',
      dataDimensionId: 'research-data-technical',
      isValid: true,
      patternCount: 4,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-detailed-report',
        'research-resp-visual-breakdown',
        'research-resp-recommendation',
      ],
    },
    {
      flowDimensionId: 'research-flow-analytical',
      dataDimensionId: 'research-data-customer',
      isValid: true,
      patternCount: 3,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-recommendation',
        'research-resp-detailed-report',
      ],
    },
    {
      flowDimensionId: 'research-flow-analytical',
      dataDimensionId: 'research-data-trends',
      isValid: true,
      patternCount: 3,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-detailed-report',
        'research-resp-recommendation',
      ],
    },
  ],
  // Row 2: synthesis
  [
    {
      flowDimensionId: 'research-flow-synthesis',
      dataDimensionId: 'research-data-competitors',
      isValid: true,
      patternCount: 3,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-detailed-report',
        'research-resp-recommendation',
      ],
    },
    {
      flowDimensionId: 'research-flow-synthesis',
      dataDimensionId: 'research-data-market',
      isValid: true,
      patternCount: 4,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-detailed-report',
        'research-resp-recommendation',
        'research-resp-visual-breakdown',
      ],
    },
    {
      flowDimensionId: 'research-flow-synthesis',
      dataDimensionId: 'research-data-technical',
      isValid: true,
      patternCount: 2,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-detailed-report',
        'research-resp-recommendation',
      ],
    },
    {
      flowDimensionId: 'research-flow-synthesis',
      dataDimensionId: 'research-data-customer',
      isValid: true,
      patternCount: 3,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-recommendation',
        'research-resp-detailed-report',
      ],
    },
    {
      flowDimensionId: 'research-flow-synthesis',
      dataDimensionId: 'research-data-trends',
      isValid: true,
      patternCount: 2,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-recommendation',
      ],
    },
  ],
  // Row 3: validation
  [
    {
      flowDimensionId: 'research-flow-validation',
      dataDimensionId: 'research-data-competitors',
      isValid: true,
      patternCount: 3,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-summary',
        'research-resp-analysis',
        'research-resp-visual-breakdown',
      ],
    },
    {
      flowDimensionId: 'research-flow-validation',
      dataDimensionId: 'research-data-market',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
    {
      flowDimensionId: 'research-flow-validation',
      dataDimensionId: 'research-data-technical',
      isValid: true,
      patternCount: 3,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-detailed-report',
        'research-resp-recommendation',
      ],
    },
    {
      flowDimensionId: 'research-flow-validation',
      dataDimensionId: 'research-data-customer',
      isValid: true,
      patternCount: 2,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-recommendation',
      ],
    },
    {
      flowDimensionId: 'research-flow-validation',
      dataDimensionId: 'research-data-trends',
      isValid: true,
      patternCount: 2,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-detailed-report',
      ],
    },
  ],
  // Row 4: recommendation
  [
    {
      flowDimensionId: 'research-flow-recommendation',
      dataDimensionId: 'research-data-competitors',
      isValid: true,
      patternCount: 2,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-recommendation',
        'research-resp-visual-breakdown',
      ],
    },
    {
      flowDimensionId: 'research-flow-recommendation',
      dataDimensionId: 'research-data-market',
      isValid: true,
      patternCount: 3,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-recommendation',
        'research-resp-analysis',
        'research-resp-detailed-report',
      ],
    },
    {
      flowDimensionId: 'research-flow-recommendation',
      dataDimensionId: 'research-data-technical',
      isValid: true,
      patternCount: 2,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-recommendation',
        'research-resp-detailed-report',
      ],
    },
    {
      flowDimensionId: 'research-flow-recommendation',
      dataDimensionId: 'research-data-customer',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
    {
      flowDimensionId: 'research-flow-recommendation',
      dataDimensionId: 'research-data-trends',
      isValid: true,
      patternCount: 3,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-recommendation',
        'research-resp-analysis',
        'research-resp-detailed-report',
      ],
    },
  ],
  // Row 5: deep-dive
  [
    {
      flowDimensionId: 'research-flow-deep-dive',
      dataDimensionId: 'research-data-competitors',
      isValid: true,
      patternCount: 4,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-analysis',
        'research-resp-detailed-report',
        'research-resp-visual-breakdown',
        'research-resp-recommendation',
      ],
    },
    {
      flowDimensionId: 'research-flow-deep-dive',
      dataDimensionId: 'research-data-market',
      isValid: true,
      patternCount: 3,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-detailed-report',
        'research-resp-visual-breakdown',
        'research-resp-analysis',
      ],
    },
    {
      flowDimensionId: 'research-flow-deep-dive',
      dataDimensionId: 'research-data-technical',
      isValid: false,
      patternCount: 0,
      dominantTier: 'simple',
      responseDimensionIds: [],
    },
    {
      flowDimensionId: 'research-flow-deep-dive',
      dataDimensionId: 'research-data-customer',
      isValid: true,
      patternCount: 3,
      dominantTier: 'complex',
      responseDimensionIds: [
        'research-resp-detailed-report',
        'research-resp-analysis',
        'research-resp-visual-breakdown',
      ],
    },
    {
      flowDimensionId: 'research-flow-deep-dive',
      dataDimensionId: 'research-data-trends',
      isValid: true,
      patternCount: 2,
      dominantTier: 'fuzzy',
      responseDimensionIds: [
        'research-resp-detailed-report',
        'research-resp-analysis',
      ],
    },
  ],
]

const RESEARCH_PATTERNS: DimensionPattern[] = [
  // SIMPLE TIER PATTERNS
  {
    id: 'research-pattern-direct-competitor',
    name: 'Direct Competitor Comparison',
    description: 'Side-by-side comparison of competing products',
    tier: 'simple',
    patternType: 'simple',
    confidence: 93,
    flowDimensionId: 'research-flow-comparative',
    dataDimensionIds: ['research-data-competitors'],
    responseDimensionId: 'research-resp-comparison',
    exampleQuestions: [
      'How does our product compare to competitor X?',
      'What are the key differences?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
      'data-visualization',
    ],
  },
  {
    id: 'research-pattern-market-overview',
    name: 'Market Overview Summary',
    description: 'High-level market landscape and positioning',
    tier: 'simple',
    patternType: 'hopping',
    confidence: 90,
    flowDimensionId: 'research-flow-comparative',
    dataDimensionIds: ['research-data-market'],
    responseDimensionId: 'research-resp-summary',
    exampleQuestions: [
      'What is the market landscape?',
      'Who are the major players?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
    ],
  },
  {
    id: 'research-pattern-customer-sentiment',
    name: 'Customer Sentiment Analysis',
    description: 'Aggregate customer feedback and satisfaction',
    tier: 'simple',
    patternType: 'hopping',
    confidence: 88,
    flowDimensionId: 'research-flow-comparative',
    dataDimensionIds: ['research-data-customer'],
    responseDimensionId: 'research-resp-summary',
    exampleQuestions: [
      'What do customers think?',
      'What are common complaints?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'sentiment-analysis',
      'response-generation',
    ],
  },
  {
    id: 'research-pattern-feature-matrix',
    name: 'Feature Matrix & Comparison',
    description: 'Detailed feature-by-feature comparison',
    tier: 'simple',
    patternType: 'aggregator',
    confidence: 86,
    flowDimensionId: 'research-flow-comparative',
    dataDimensionIds: ['research-data-competitors'],
    responseDimensionId: 'research-resp-comparison',
    exampleQuestions: [
      'Feature comparison across all competitors',
      'What features are we missing?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'response-generation',
      'data-visualization',
      'spreadsheet-generation',
    ],
  },

  // COMPLEX TIER PATTERNS
  {
    id: 'research-pattern-market-analysis',
    name: 'Market Analysis Deep Dive',
    description: 'In-depth market size, growth, and segment analysis',
    tier: 'complex',
    patternType: 'reasoning',
    confidence: 74,
    flowDimensionId: 'research-flow-analytical',
    dataDimensionIds: ['research-data-market'],
    responseDimensionId: 'research-resp-analysis',
    inferenceNotes:
      'Requires synthesis of multiple data sources and trend analysis',
    exampleQuestions: [
      'What is the market size and growth potential?',
      'Which segments are most valuable?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'response-generation',
      'data-visualization',
    ],
  },
  {
    id: 'research-pattern-competitive-positioning',
    name: 'Competitive Positioning Strategy',
    description: 'Strategic positioning relative to competition',
    tier: 'complex',
    patternType: 'branch',
    confidence: 72,
    flowDimensionId: 'research-flow-analytical',
    dataDimensionIds: ['research-data-competitors'],
    responseDimensionId: 'research-resp-detailed-report',
    inferenceNotes:
      'Analyzes multiple competitive dimensions and strategic implications',
    exampleQuestions: [
      'How should we position against competitors?',
      'What are our competitive advantages?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'response-generation',
      'data-visualization',
    ],
  },
  {
    id: 'research-pattern-tech-feasibility',
    name: 'Technical Feasibility Analysis',
    description: 'Assess technical requirements and implementation feasibility',
    tier: 'complex',
    patternType: 'reasoning',
    confidence: 68,
    flowDimensionId: 'research-flow-analytical',
    dataDimensionIds: ['research-data-technical'],
    responseDimensionId: 'research-resp-analysis',
    inferenceNotes:
      'Requires understanding of technical constraints and architecture',
    exampleQuestions: [
      'What technical challenges exist?',
      'Is this feasible to build?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'response-generation',
    ],
  },
  {
    id: 'research-pattern-market-synthesis',
    name: 'Holistic Market Synthesis',
    description: 'Synthesize competitive, market, and trend insights',
    tier: 'complex',
    patternType: 'aggregator',
    confidence: 65,
    flowDimensionId: 'research-flow-synthesis',
    dataDimensionIds: ['research-data-market'],
    responseDimensionId: 'research-resp-detailed-report',
    inferenceNotes:
      'Combines multiple data sources into coherent strategic narrative',
    exampleQuestions: [
      'What is the full market picture?',
      'How do all these factors fit together?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'response-generation',
      'data-visualization',
    ],
  },

  // FUZZY TIER PATTERNS
  {
    id: 'research-pattern-customer-insight',
    name: 'Customer Insight Extraction',
    description: 'Deep customer motivation and pain point analysis',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 52,
    flowDimensionId: 'research-flow-analytical',
    dataDimensionIds: ['research-data-customer'],
    responseDimensionId: 'research-resp-recommendation',
    ambiguityNotes:
      'Customer motivations are complex and context-dependent; interpretation required',
    exampleQuestions: [
      'Why do customers choose us?',
      'What are their unmet needs?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'sentiment-analysis',
      'response-generation',
    ],
  },
  {
    id: 'research-pattern-trend-interpretation',
    name: 'Market Trend Interpretation',
    description: 'Interpret emerging trends and predict future implications',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 48,
    flowDimensionId: 'research-flow-analytical',
    dataDimensionIds: ['research-data-trends'],
    responseDimensionId: 'research-resp-recommendation',
    ambiguityNotes:
      'Trend interpretation is subjective and prediction accuracy is inherently uncertain',
    exampleQuestions: [
      'What trends will shape the market?',
      'How should we prepare for the future?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'response-generation',
    ],
  },
  {
    id: 'research-pattern-validation-synthesis',
    name: 'Cross-Source Data Validation',
    description: 'Validate insights across multiple data sources',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 50,
    flowDimensionId: 'research-flow-validation',
    dataDimensionIds: ['research-data-competitors'],
    responseDimensionId: 'research-resp-analysis',
    ambiguityNotes:
      'Conflicting data sources require judgment to determine credibility and weight',
    exampleQuestions: [
      'Do these sources agree?',
      'Which data should I trust?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'response-generation',
    ],
  },
  {
    id: 'research-pattern-strategic-recommendation',
    name: 'Strategic Recommendation Synthesis',
    description: 'Synthesize all research into strategic recommendations',
    tier: 'fuzzy',
    patternType: 'reasoning',
    confidence: 45,
    flowDimensionId: 'research-flow-recommendation',
    dataDimensionIds: ['research-data-market'],
    responseDimensionId: 'research-resp-recommendation',
    ambiguityNotes:
      'Strategic recommendations depend on organizational values and risk tolerance',
    exampleQuestions: [
      'What should we do next?',
      'What is the best strategy?',
    ],
    activatedComponents: [
      'api-gateway',
      'auth',
      'rag',
      'reasoning-engine',
      'response-generation',
      'output-guardrails',
    ],
  },
]

const RESEARCH_PAYLOAD: PatternsPayload = {
  tileId: 'research-comparison',
  agentName: 'Research & Comparison Agent',
  tileDescription:
    'Complex research synthesis combining competitive, market, technical, and customer insights',
  flowDimensions: RESEARCH_FLOW_DIMENSIONS,
  dataDimensions: RESEARCH_DATA_DIMENSIONS,
  responseDimensions: RESEARCH_RESPONSE_DIMENSIONS,
  totalCombinations: RESEARCH_FLOW_DIMENSIONS.length * RESEARCH_DATA_DIMENSIONS.length * RESEARCH_RESPONSE_DIMENSIONS.length, // 6 × 5 × 6 = 180
  validPatterns: 67,
  matrix: RESEARCH_MATRIX,
  patterns: RESEARCH_PATTERNS,
  tierBreakdown: {
    simple: 18,
    complex: 28,
    fuzzy: 21,
  },
}

// ============================================================================
// EXPORT
// ============================================================================

const PATTERNS_DATA: Record<string, PatternsPayload> = {
  'faq-knowledge': FAQ_PAYLOAD,
  'saas-copilot': SAAS_PAYLOAD,
  'research-comparison': RESEARCH_PAYLOAD,
}

export function getCombinatorialPatternsData(
  tileId: string
): PatternsPayload | null {
  return PATTERNS_DATA[tileId] ?? null
}
