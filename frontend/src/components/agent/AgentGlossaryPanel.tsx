import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_STAGE_LABELS } from '@/store/agentTypes'
import type { AgentStageId } from '@/store/agentTypes'

// ─── Agent Glossary Entry Type ──────────────────────────────────────────────

interface AgentGlossaryEntry {
  term: string
  displayName: string
  shortDefinition: string
  fullDefinition: string
  whyItMatters?: string
  category: 'architecture' | 'capability' | 'safety' | 'interaction' | 'monitoring' | 'orchestration'
  relatedTerms?: string[]
  stages: string[]
}

// ─── Category Config ────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<AgentGlossaryEntry['category'], string> = {
  architecture: 'Architecture',
  capability: 'Capability',
  safety: 'Safety',
  interaction: 'Interaction',
  monitoring: 'Monitoring',
  orchestration: 'Orchestration',
}

const CATEGORY_ORDER: AgentGlossaryEntry['category'][] = [
  'capability',
  'interaction',
  'orchestration',
  'architecture',
  'safety',
  'monitoring',
]

function getCategoryColor(category: AgentGlossaryEntry['category']): { bg: string; text: string } {
  switch (category) {
    case 'architecture':
      return { bg: '#ede9fe', text: '#5b21b6' }
    case 'capability':
      return { bg: '#dbeafe', text: '#1d4ed8' }
    case 'safety':
      return { bg: '#fee2e2', text: '#991b1b' }
    case 'interaction':
      return { bg: '#fef3c7', text: '#92400e' }
    case 'monitoring':
      return { bg: '#dcfce7', text: '#166534' }
    case 'orchestration':
      return { bg: '#fce7f3', text: '#9d174d' }
  }
}

// ─── Agent Glossary Entries ─────────────────────────────────────────────────

const agentGlossaryEntries: AgentGlossaryEntry[] = [
  // Capability terms
  {
    term: 'tool-calling',
    displayName: 'Tool Calling',
    shortDefinition: 'The ability for an agent to invoke external functions, APIs, or system tools to accomplish tasks beyond text generation.',
    fullDefinition: 'Tool calling enables agents to interact with external systems — databases, APIs, file systems — by converting natural language intent into structured function calls. VibeModel auto-discovers which tools an agent needs from your use-case description.',
    whyItMatters: 'Without tool calling, agents are limited to generating text. With it, they can take real actions — querying databases, updating records, sending notifications.',
    category: 'capability',
    relatedTerms: ['function-schema', 'capability-mapping'],
    stages: ['capabilities'],
  },
  {
    term: 'capability-mapping',
    displayName: 'Capability Mapping',
    shortDefinition: 'The process of identifying which skills, tools, and knowledge sources an agent needs to fulfill its goal.',
    fullDefinition: 'Capability mapping analyzes the agent\'s defined goal and interactions to determine required technical capabilities — from simple retrieval to complex multi-step reasoning chains. VibeModel derives this automatically from your validation results.',
    category: 'capability',
    relatedTerms: ['tool-calling', 'function-schema'],
    stages: ['capabilities'],
  },
  {
    term: 'function-schema',
    displayName: 'Function Schema',
    shortDefinition: 'A structured definition of a tool\'s inputs, outputs, and expected behavior that the agent uses to decide when and how to call it.',
    fullDefinition: 'Function schemas describe tools in a format the agent can reason about — parameter types, required vs optional fields, return formats, and error conditions. Well-defined schemas reduce hallucination and improve tool selection accuracy.',
    category: 'capability',
    relatedTerms: ['tool-calling'],
    stages: ['capabilities', 'architecture'],
  },
  // Interaction terms
  {
    term: 'interaction-pattern',
    displayName: 'Interaction Pattern',
    shortDefinition: 'A categorized type of user-agent exchange — such as Q&A, multi-turn dialogue, or task delegation.',
    fullDefinition: 'Interaction patterns classify how users engage with the agent. Simple patterns (single question → answer) require different architectures than complex ones (multi-turn negotiation with context retention). VibeModel discovers these from your scenario analysis.',
    whyItMatters: 'Different interaction patterns require different memory strategies, context windows, and escalation paths. Matching the pattern to the architecture prevents over-engineering or under-building.',
    category: 'interaction',
    relatedTerms: ['trust-boundary', 'escalation-path'],
    stages: ['interactions', 'validation'],
  },
  {
    term: 'trust-boundary',
    displayName: 'Trust Boundary',
    shortDefinition: 'The line between what an agent can do autonomously versus what requires human approval or supervision.',
    fullDefinition: 'Trust boundaries define zones of autonomy — fully autonomous (agent acts freely), supervised (agent suggests, human approves), escalation (agent defers to human), and blocked (action not permitted). VibeModel maps every interaction to a trust boundary during validation.',
    whyItMatters: 'Without clear trust boundaries, agents either do too much (risk) or too little (useless). The boundary defines where value creation meets safety constraints.',
    category: 'safety',
    relatedTerms: ['escalation-path', 'guardrails'],
    stages: ['validation', 'architecture'],
  },
  {
    term: 'escalation-path',
    displayName: 'Escalation Path',
    shortDefinition: 'The defined route an agent follows when it encounters a situation beyond its autonomous authority.',
    fullDefinition: 'Escalation paths specify who gets notified, how context is preserved, and what happens while waiting for human decision. Good escalation paths maintain conversation continuity while ensuring appropriate human oversight for high-stakes decisions.',
    category: 'safety',
    relatedTerms: ['trust-boundary', 'guardrails'],
    stages: ['interactions', 'validation', 'architecture'],
  },
  {
    term: 'guardrails',
    displayName: 'Guardrails',
    shortDefinition: 'Safety constraints that prevent an agent from taking harmful, unauthorized, or out-of-scope actions.',
    fullDefinition: 'Guardrails operate at multiple levels: input validation (rejecting malicious prompts), output filtering (preventing sensitive data leaks), action constraints (blocking unauthorized tool calls), and behavioral limits (staying within defined persona and scope).',
    whyItMatters: 'Guardrails are the difference between a useful agent and a liability. They make agents trustworthy enough for production deployment.',
    category: 'safety',
    relatedTerms: ['trust-boundary', 'escalation-path'],
    stages: ['instructions', 'validation', 'architecture'],
  },
  // Architecture terms
  {
    term: 'execution-lane',
    displayName: 'Execution Lane',
    shortDefinition: 'A distinct processing pipeline within the agent architecture, grouped by trust boundary and complexity level.',
    fullDefinition: 'Execution lanes separate agent workflows by risk and complexity. Lane 1 handles simple, autonomous tasks. Higher-numbered lanes add reasoning, human oversight, and monitoring. Each lane activates different components from the production stack.',
    whyItMatters: 'Lanes prevent simple queries from being over-processed and ensure complex ones get appropriate scrutiny. This is how VibeModel balances speed with safety.',
    category: 'architecture',
    relatedTerms: ['trust-boundary', 'component-pipeline'],
    stages: ['architecture'],
  },
  {
    term: 'component-pipeline',
    displayName: 'Component Pipeline',
    shortDefinition: 'The ordered sequence of processing components that a request flows through within an execution lane.',
    fullDefinition: 'Each lane contains a pipeline of components — ingestion, routing, context retrieval, execution, output formatting, and observability. The pipeline order and component selection are determined by the interaction patterns and their confidence levels from validation.',
    category: 'architecture',
    relatedTerms: ['execution-lane'],
    stages: ['architecture'],
  },
  // Orchestration terms
  {
    term: 'rag-pipeline',
    displayName: 'RAG Pipeline',
    shortDefinition: 'Retrieval-Augmented Generation — a pattern where the agent retrieves relevant documents before generating a response.',
    fullDefinition: 'RAG combines a retrieval system (searching knowledge bases, documents, or databases) with a generation model. The retrieved context grounds the agent\'s responses in factual data, reducing hallucination. VibeModel selects RAG, ReAct, or multi-agent patterns based on your use case.',
    whyItMatters: 'RAG is the most common production pattern for knowledge-heavy agents. It ensures answers are grounded in your actual data rather than the model\'s training data.',
    category: 'orchestration',
    relatedTerms: ['react-pattern', 'multi-agent'],
    stages: ['capabilities', 'architecture'],
  },
  {
    term: 'react-pattern',
    displayName: 'ReAct Pattern',
    shortDefinition: 'Reasoning + Acting — a loop where the agent thinks, takes an action, observes the result, and repeats until the task is complete.',
    fullDefinition: 'ReAct agents alternate between reasoning (planning the next step) and acting (calling tools, querying data). This iterative approach handles multi-step tasks where the next action depends on the result of the previous one.',
    category: 'orchestration',
    relatedTerms: ['rag-pipeline', 'multi-agent'],
    stages: ['capabilities', 'architecture'],
  },
  {
    term: 'multi-agent',
    displayName: 'Multi-Agent System',
    shortDefinition: 'An architecture where multiple specialized agents collaborate to handle complex tasks that exceed any single agent\'s capability.',
    fullDefinition: 'Multi-agent systems decompose complex workflows into sub-tasks handled by specialized agents — a router agent, a research agent, a writing agent, etc. Coordination protocols manage handoffs, conflict resolution, and result aggregation.',
    category: 'orchestration',
    relatedTerms: ['rag-pipeline', 'react-pattern'],
    stages: ['architecture'],
  },
  // Monitoring terms
  {
    term: 'drift-detection',
    displayName: 'Drift Detection',
    shortDefinition: 'Monitoring for changes in input patterns, user behavior, or agent performance that deviate from the validated baseline.',
    fullDefinition: 'Drift detection watches for statistical shifts in how users interact with the agent, what questions they ask, and how well the agent performs. Early drift detection prevents gradual degradation from going unnoticed until it causes visible failures.',
    whyItMatters: 'Production data evolves. What worked at launch may fail three months later. Drift detection is the early warning system that triggers re-validation or architecture updates.',
    category: 'monitoring',
    relatedTerms: ['landmine-detection', 'health-score'],
    stages: ['monitoring'],
  },
  {
    term: 'landmine-detection',
    displayName: 'Landmine Detection',
    shortDefinition: 'Identifying hidden failure modes that pass standard testing but cause problems in production edge cases.',
    fullDefinition: 'Landmines are failure patterns that only appear under specific conditions — rare input combinations, seasonal changes, or adversarial queries. VibeModel\'s monitoring proactively scans for these patterns before they detonate.',
    category: 'monitoring',
    relatedTerms: ['drift-detection', 'health-score'],
    stages: ['monitoring'],
  },
  {
    term: 'health-score',
    displayName: 'Health Score',
    shortDefinition: 'A composite metric reflecting the agent\'s overall production readiness across accuracy, latency, and reliability dimensions.',
    fullDefinition: 'The health score aggregates multiple signals — response accuracy, latency percentiles, error rates, escalation frequency, and user satisfaction proxies — into a single actionable number. Scores are tracked weekly to identify trends before they become problems.',
    category: 'monitoring',
    relatedTerms: ['drift-detection', 'landmine-detection'],
    stages: ['monitoring'],
  },
  // Goal & Instructions terms
  {
    term: 'system-prompt',
    displayName: 'System Prompt',
    shortDefinition: 'The foundational instruction set that defines the agent\'s persona, capabilities, constraints, and behavioral boundaries.',
    fullDefinition: 'The system prompt is the agent\'s operating manual — it defines who the agent is, what it can do, how it should respond, and what it should refuse. VibeModel generates system prompts from your goal definition and business context, not from generic templates.',
    whyItMatters: 'A well-crafted system prompt is the single biggest factor in agent quality. It\'s the difference between a generic chatbot and a purpose-built assistant.',
    category: 'capability',
    relatedTerms: ['guardrails'],
    stages: ['goal', 'instructions'],
  },
  {
    term: 'goal-decomposition',
    displayName: 'Goal Decomposition',
    shortDefinition: 'Breaking a high-level business objective into specific, measurable sub-goals the agent can execute against.',
    fullDefinition: 'Goal decomposition translates "help customers find answers" into concrete tasks: classify the question, retrieve relevant documents, generate a response, validate accuracy, and route edge cases. Each sub-goal maps to specific capabilities and architecture decisions downstream.',
    category: 'orchestration',
    relatedTerms: ['capability-mapping', 'system-prompt'],
    stages: ['goal', 'instructions'],
  },
]

// ─── Helper Functions ───────────────────────────────────────────────────────

function getEntriesForStage(stageId: AgentStageId): AgentGlossaryEntry[] {
  return agentGlossaryEntries.filter((e) => e.stages.includes(stageId))
}

// ─── Agent Glossary Panel Component ─────────────────────────────────────────

export function AgentGlossaryPanel() {
  const glossaryOpen = useAgentPlaygroundStore((s) => s.glossaryOpen)
  const toggleGlossary = useAgentPlaygroundStore((s) => s.toggleGlossary)
  const currentStage = useAgentPlaygroundStore((s) => s.currentStage)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<AgentGlossaryEntry['category'] | null>(null)
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())
  const [stageFilter, setStageFilter] = useState(false)
  const [highlightedTerm, setHighlightedTerm] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(timer)
  }, [search])

  // Focus search when opened
  useEffect(() => {
    if (glossaryOpen) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [glossaryOpen])

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && glossaryOpen) toggleGlossary()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [glossaryOpen, toggleGlossary])

  const handleStageFilterToggle = () => {
    setStageFilter((prev) => !prev)
    setActiveCategory(null)
  }

  // Build entry list
  const baseEntries =
    stageFilter && currentStage !== 'tiles'
      ? getEntriesForStage(currentStage)
      : agentGlossaryEntries

  const filtered = baseEntries.filter((e) => {
    if (activeCategory && e.category !== activeCategory) return false
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      return (
        e.displayName.toLowerCase().includes(q) ||
        e.shortDefinition.toLowerCase().includes(q) ||
        e.term.includes(q)
      )
    }
    return true
  })

  const availableCategories = CATEGORY_ORDER.filter((cat) => baseEntries.some((e) => e.category === cat))

  const toggleTerm = (term: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev)
      if (next.has(term)) next.delete(term)
      else next.add(term)
      return next
    })
  }

  const navigateToRelated = (term: string) => {
    setExpandedTerms((prev) => new Set([...prev, term]))
    setHighlightedTerm(term)
    setTimeout(() => {
      termRefs.current[term]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    highlightTimerRef.current = setTimeout(() => setHighlightedTerm(null), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {glossaryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={toggleGlossary}
          />
        )}
      </AnimatePresence>

      {/* Slide-in panel */}
      <AnimatePresence>
        {glossaryOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{
              width: 400,
              background: '#ffffff',
              borderLeft: '1px solid #e5e7eb',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid #e5e7eb' }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: '#8b5cf6' }} aria-hidden="true" />
                <h2 className="text-base font-semibold text-gray-900">Agent Glossary</h2>
                <span className="text-xs text-gray-400 font-medium">{filtered.length} terms</span>
              </div>
              <button
                onClick={toggleGlossary}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close glossary"
              >
                <X className="w-4 h-4 text-gray-500" aria-hidden="true" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 shrink-0" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search agent terms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
              </div>
            </div>

            {/* Category + stage filters */}
            <div
              className="px-5 py-2.5 shrink-0 flex flex-wrap gap-1.5"
              style={{ borderBottom: '1px solid #e5e7eb' }}
            >
              {currentStage !== 'tiles' && (
                <button
                  onClick={handleStageFilterToggle}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
                  style={{
                    background: stageFilter ? '#dbeafe' : '#f3f4f6',
                    color: stageFilter ? '#1d4ed8' : '#6b7280',
                    border: stageFilter ? '1.5px solid #1d4ed830' : '1.5px solid transparent',
                  }}
                >
                  {AGENT_STAGE_LABELS[currentStage]}
                </button>
              )}
              {availableCategories.map((cat) => {
                const isActive = activeCategory === cat
                const color = getCategoryColor(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
                    style={{
                      background: isActive ? color.bg : '#f3f4f6',
                      color: isActive ? color.text : '#6b7280',
                      border: isActive ? `1.5px solid ${color.text}30` : '1.5px solid transparent',
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                )
              })}
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400">No terms match your search</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
                  {filtered.map((entry) => {
                    const isExpanded = expandedTerms.has(entry.term)
                    const isHighlighted = highlightedTerm === entry.term
                    const catColor = getCategoryColor(entry.category)
                    return (
                      <div
                        key={entry.term}
                        ref={(el) => {
                          termRefs.current[entry.term] = el
                        }}
                        style={{
                          transition: 'background 0.3s',
                          background: isHighlighted ? 'rgba(59,130,246,0.06)' : 'transparent',
                        }}
                      >
                        <button
                          onClick={() => toggleTerm(entry.term)}
                          className="w-full px-5 py-3.5 text-left flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-sm font-semibold text-gray-900">{entry.displayName}</span>
                              <span
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ background: catColor.bg, color: catColor.text }}
                              >
                                {CATEGORY_LABELS[entry.category]}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{entry.shortDefinition}</p>
                          </div>
                          <div className="shrink-0 mt-0.5" aria-hidden="true">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                                <p className="text-xs leading-relaxed text-gray-600 mt-3">
                                  {entry.fullDefinition}
                                </p>
                                {entry.whyItMatters && (
                                  <div
                                    className="mt-3 p-3 rounded-lg"
                                    style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}
                                  >
                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                                      Why it matters
                                    </div>
                                    <p className="text-xs text-blue-800 leading-relaxed">{entry.whyItMatters}</p>
                                  </div>
                                )}
                                {entry.relatedTerms && entry.relatedTerms.length > 0 && (
                                  <div className="mt-3">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                      Related
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {entry.relatedTerms
                                        .filter(
                                          (t) => t !== entry.term && agentGlossaryEntries.some((e) => e.term === t),
                                        )
                                        .map((t) => {
                                          const related = agentGlossaryEntries.find((e) => e.term === t)
                                          if (!related) return null
                                          return (
                                            <button
                                              key={t}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigateToRelated(t)
                                              }}
                                              className="text-xs px-2 py-0.5 rounded-full transition-colors hover:bg-indigo-100 cursor-pointer"
                                              style={{ background: '#eef2ff', color: '#4f46e5' }}
                                            >
                                              {related.displayName}
                                            </button>
                                          )
                                        })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
