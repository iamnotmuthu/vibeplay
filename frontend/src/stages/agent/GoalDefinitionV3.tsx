import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Zap,
  Database,
  ChevronDown,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getGoalData } from '@/lib/agent/goalData'
import { getGoalDataV3 } from '@/lib/agent/goalDataV3'
import { getDestinationPreview } from '@/lib/agent/destinationPreviewDataV3'
import { getSharpeningQuestions } from '@/lib/agent/sharpeningQuestionsDataV3'
import { resolveV3TileId, isV3SupportedTile } from '@/lib/agent/v3TileResolver'

const COMPLEXITY_DOTS: Record<string, number> = {
  simple: 1,
  moderate: 2,
  'moderate-complex': 3,
  complex: 4,
  'very-complex': 4,
}

// ─── V3 Use Case Definitions ──────────────────────────────────────────────────
// Override AGENT_TILE_MAP labels with V3-specific names/descriptions

const V3_USE_CASES = [
  {
    id: 'doc-intelligence' as const,
    label: 'Invoice Processing Agent',
    shortLabel: 'Invoice Agent',
    description: 'Extracts, validates, and routes invoice data across formats with OCR fallback and multi-currency support.',
    badge: 'Very Complex',
    complexity: 'very-complex' as const,
    color: '#0369a1',
    domain: 'Financial Services',
  },
  {
    id: 'saas-copilot' as const,
    label: 'Enterprise RAG Copilot',
    shortLabel: 'RAG Copilot',
    description: 'Retrieves and synthesizes answers from enterprise knowledge bases with citation tracking and access control.',
    badge: 'Very Complex',
    complexity: 'very-complex' as const,
    color: '#7c3aed',
    domain: 'Technology / SaaS',
  },
  {
    id: 'consumer-chat' as const,
    label: 'SaaS Customer Support Agent',
    shortLabel: 'Support Agent',
    description: 'Handles customer inquiries with ticket creation, escalation routing, and sentiment-aware responses.',
    badge: 'Medium',
    complexity: 'moderate' as const,
    color: '#059669',
    domain: 'Customer Support',
  },
  {
    id: 'faq-knowledge' as const,
    label: 'FAQ Knowledge Agent',
    shortLabel: 'FAQ Agent',
    description: 'Answers frequently asked questions from a curated knowledge base with confidence scoring.',
    badge: 'Simple',
    complexity: 'simple' as const,
    color: '#d97706',
    domain: 'Knowledge Management',
  },
] as const

// ─── Typing Animation Hook ──────────────────────────────────────────────────

function useTypingAnimation(
  text: string,
  enabled: boolean,
  speed: number = 30,
  burstSize: number = 3,
) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    setShowCursor(true)
    indexRef.current = 0
  }, [text])

  useEffect(() => {
    if (!enabled || !text) return
    const tick = () => {
      const next = Math.min(indexRef.current + burstSize, text.length)
      setDisplayed(text.slice(0, next))
      indexRef.current = next
      if (next >= text.length) { setDone(true); return }
      timerRef.current = setTimeout(tick, speed)
    }
    timerRef.current = setTimeout(tick, 200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [text, enabled, speed, burstSize])

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setShowCursor(false), 1000)
      return () => clearTimeout(t)
    }
    const interval = setInterval(() => setShowCursor((v) => !v), 530)
    return () => clearInterval(interval)
  }, [done])

  return { displayed, done, showCursor }
}

// ─── Blinking Cursor ─────────────────────────────────────────────────────────

function TypingCursor({ visible, color }: { visible: boolean; color: string }) {
  return (
    <motion.span
      animate={{ opacity: visible ? 1 : 0.2 }}
      transition={{ duration: 0.15 }}
      className="inline-block w-0.5 h-5 ml-0.5 rounded-sm"
      style={{ background: color }}
    />
  )
}

// ─── Analyzing Loader ────────────────────────────────────────────────────────────

const SONAR_DURATION_MS = 1400

const ANALYZING_STEPS = [
  'Mapping execution paths…',
  'Identifying data sources…',
  'Calculating complexity…',
  'Building pattern library…',
]

function AnalyzingLoader({ color }: { color: string }) {
  const [visibleCount, setVisibleCount] = useState(1)

  useEffect(() => {
    setVisibleCount(1)
    const timers = ANALYZING_STEPS.slice(1).map((_, i) =>
      setTimeout(() => setVisibleCount((v) => Math.min(v + 1, ANALYZING_STEPS.length)), (i + 1) * 320)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border bg-white p-4 space-y-3 shadow-sm"
      style={{ borderColor: `${color}30` }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: color }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, delay: i * 0.22, repeat: Infinity }}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-gray-500">Analyzing your goal</span>
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {ANALYZING_STEPS.map((step, i) => (
          <AnimatePresence key={step}>
            {i < visibleCount && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}40` }}
                  animate={{ scale: i === visibleCount - 1 ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: i === visibleCount - 1 ? Infinity : 0 }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                </motion.div>
                <span className="text-xs text-gray-600">{step}</span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Scanning bar */}
      <div className="h-1 rounded-full overflow-hidden bg-gray-100">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}

// ─── Demo Toast ──────────────────────────────────────────────────────────────────

function DemoToast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50"
        >
          Try selecting a domain below
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Goal Hero ───────────────────────────────────────────────────────────────────

function GoalHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
        What do you want your agent to do?
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed">
        Every agent builder shows you the happy path. <span className="font-semibold text-gray-700">VibeModel maps every one of them.</span>
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Choose a use case below to see the full picture.
      </p>
    </motion.div>
  )
}

// ─── Prompt Input Box ────────────────────────────────────────────────────────

function PromptInputBox({
  text,
  phase,
  typingCursorVisible,
  idleCursorVisible,
  onSend,
  onInputClick,
  accentColor,
}: {
  text: string
  phase: string
  typingCursorVisible: boolean
  idleCursorVisible: boolean
  onSend: () => void
  onInputClick: () => void
  accentColor: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative"
    >
      <div
        className="rounded-xl border-2 bg-white p-4 transition-all duration-150"
        style={{
          borderColor: phase === 'pulsing' ? accentColor : phase === 'typing' ? accentColor : '#e5e7eb',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-h-[40px] flex items-center" onClick={onInputClick} role="textbox" tabIndex={0}>
            <span className="text-base text-gray-900">
              {text}
              {(phase === 'idle' || phase === 'typing') && (
                <TypingCursor visible={phase === 'idle' ? idleCursorVisible : typingCursorVisible} color={accentColor} />
              )}
            </span>
          </div>
          {phase === 'awaiting-send' && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={onSend}
              className="flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors text-white"
              style={{ background: accentColor }}
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}


// ─── V3 Use Case Grid (replaces domain-based browser) ─────────────────────────

function V3UseCaseGrid({ onSelect }: { onSelect: (tileId: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Choose a use case</h3>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">4 scenarios</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {V3_USE_CASES.map((tile, i) => {
          const dotCount = COMPLEXITY_DOTS[tile.complexity] ?? 2
          return (
            <motion.button
              key={tile.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              onClick={() => onSelect(tile.id)}
              className="group rounded-xl border border-gray-200 bg-white p-4 text-left transition-all duration-150 hover:border-gray-300 hover:shadow-md flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${tile.color}15`,
                    border: `1px solid ${tile.color}30`,
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: tile.color }} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">{tile.domain}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: j < dotCount ? tile.color : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">
                  {tile.label}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {tile.description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span
                  className="text-[10px] font-semibold leading-snug"
                  style={{ color: tile.color }}
                >
                  {tile.badge}
                </span>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <span className="text-xs font-bold" style={{ color: tile.color }}>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: tile.color }} />
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Decomposition Card ───────────────────────────────────────────────────────────

function DecompCard({
  icon,
  label,
  items,
  color,
  delay,
  reasoning,
}: {
  icon: React.ReactNode
  label: string
  items: string[]
  color: string
  delay: number
  reasoning?: string
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: `${color}30` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          {icon}
          <span className="text-sm font-semibold text-gray-900">{label}</span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t"
            style={{ borderColor: `${color}15` }}
          >
            <div className="px-4 py-3 space-y-2">
              {items.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: color }}
                  />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
              {reasoning && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: `${color}15` }}>
                  <p className="text-xs text-gray-500 italic">{reasoning}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Key Risk Callout ────────────────────────────────────────────────────────────

function KeyRiskCallout({ risk, delay }: { risk: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3"
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-900">{risk}</p>
    </motion.div>
  )
}

// ─── Scroll Affordance ──────────────────────────────────────────────────────────

function ScrollAffordance() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center mt-8"
        >
          <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ArrowDown className="w-4 h-4 text-gray-300 mx-auto" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Destination Preview Section (V3) ────────────────────────────────────────────

function DestinationPreviewSection({
  tileId,
  delay,
}: {
  tileId: string
  delay: number
}) {
  const resolvedTileId = resolveV3TileId(tileId, 'destinationPreview')
  const preview = getDestinationPreview(resolvedTileId)

  if (!preview) return null

  const [typingIndices, setTypingIndices] = useState<number[]>([0])

  useEffect(() => {
    const timings = [0, 2800, 5600]
    const timers = timings.map((timing, idx) =>
      setTimeout(() => {
        setTypingIndices((prev) => [...new Set([...prev, idx + 1])])
      }, timing)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Destination Preview</h3>
        <p className="text-sm text-gray-600">Here's what your agent will look like in action</p>
      </div>

      <div className="space-y-4">
        {preview.conversations.map((convo, idx) => (
          <ConversationBubble
            key={idx}
            userQuery={convo.userQuery}
            agentResponse={convo.agentResponse}
            isEdgeCase={convo.isEdgeCase}
            edgeCaseExplanation={convo.edgeCaseExplanation}
            shouldType={typingIndices.includes(idx + 1)}
          />
        ))}
      </div>

    </motion.div>
  )
}

// ─── Conversation Bubble ─────────────────────────────────────────────────────────

function ConversationBubble({
  userQuery,
  agentResponse,
  isEdgeCase,
  edgeCaseExplanation,
  shouldType,
}: {
  userQuery: string
  agentResponse: string
  isEdgeCase: boolean
  edgeCaseExplanation?: string
  shouldType: boolean
}) {
  const { displayed: responseText, done: typingDone } = useTypingAnimation(
    agentResponse,
    shouldType,
    35,
    3
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-2 p-4 rounded-lg ${isEdgeCase ? 'border-2 border-amber-200 bg-amber-50/40' : 'border border-gray-200 bg-white'}`}
    >
      {isEdgeCase && edgeCaseExplanation && (
        <div className="flex items-start gap-2 mb-3 pb-3 border-b border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">{edgeCaseExplanation}</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-end">
          <div className="max-w-xs bg-gray-100 text-gray-900 px-3 py-2 rounded-lg text-sm">
            {userQuery}
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-xs bg-white text-gray-900 px-3 py-2 rounded-lg text-sm border border-gray-200 leading-relaxed whitespace-pre-wrap">
            {shouldType ? (
              <>
                {responseText}
                {!typingDone && <TypingCursor visible={true} color="#6b7280" />}
              </>
            ) : (
              responseText || agentResponse
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Sharpening Questions Section (V3) ───────────────────────────────────────────

function SharpeningQuestionsSection({
  tileId,
  delay,
}: {
  tileId: string
  delay: number
}) {
  const resolvedTileId = resolveV3TileId(tileId, 'sharpeningQuestions')
  const questions = getSharpeningQuestions(resolvedTileId)
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | null>>({})

  if (!questions || questions.length === 0) return null

  const handleAnswer = (questionId: string, answer: 'yes' | 'no') => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === answer ? null : answer,
    }))
  }

  const answeredCount = Object.values(answers).filter((v) => v !== null).length
  const yesCount = Object.values(answers).filter((v) => v === 'yes').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-4"
    >
      {/* Agent-voice header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900">Before I map the full complexity, I need to understand a few things.</h3>
          <p className="text-xs text-gray-500">
            Your answers shape which execution paths, tool states, and meta-patterns get included in the analysis.
          </p>
        </div>
      </div>

      {/* Question cards */}
      <div className="space-y-3 pl-10">
        {questions.slice(0, 3).map((q, idx) => (
          <SharpeningQuestionCard
            key={q.id}
            question={q}
            index={idx}
            delay={delay + 0.1 + idx * 0.1}
            answer={answers[q.id] ?? null}
            onAnswer={(a) => handleAnswer(q.id, a)}
          />
        ))}
      </div>

      {/* Progress + next-step nudge */}
      <div className="pl-10 space-y-2">
        {answeredCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex gap-1">
              {questions.slice(0, 3).map((q) => (
                <div
                  key={q.id}
                  className="w-2 h-2 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor:
                      answers[q.id] === 'yes'
                        ? '#8b5cf6'
                        : answers[q.id] === 'no'
                          ? '#d1d5db'
                          : '#e5e7eb',
                  }}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500">
              {answeredCount}/{Math.min(questions.length, 3)} answered
              {yesCount > 0 && (
                <span className="text-violet-600 font-medium"> — {yesCount} will expand the analysis</span>
              )}
            </span>
          </motion.div>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <p className="text-[11px] text-gray-400">
            Want to add something specific? You can refine tasks and data sources in the next step.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Sharpening Question Card ────────────────────────────────────────────────────

function SharpeningQuestionCard({
  question,
  delay,
  answer,
  onAnswer,
}: {
  question: { id: string; question: string; impact: string; answerDependency: string }
  index: number
  delay: number
  answer: 'yes' | 'no' | null
  onAnswer: (answer: 'yes' | 'no') => void
}) {
  const isYes = answer === 'yes'
  const isNo = answer === 'no'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-lg border bg-white overflow-hidden transition-all duration-300"
      style={{
        borderColor: isYes ? '#8b5cf6' : isNo ? '#e5e7eb' : '#e5e7eb',
        borderLeftWidth: '4px',
        borderLeftColor: isYes ? '#8b5cf6' : isNo ? '#d1d5db' : '#c4b5fd',
        opacity: isNo ? 0.6 : 1,
      }}
    >
      <div className="p-4 space-y-3">
        {/* Question + Yes/No toggles */}
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-semibold text-gray-900 flex-1">{question.question}</p>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => onAnswer('yes')}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: isYes ? '#8b5cf6' : '#f9fafb',
                color: isYes ? '#ffffff' : '#6b7280',
                border: isYes ? '1px solid #8b5cf6' : '1px solid #e5e7eb',
              }}
            >
              Yes
            </button>
            <button
              onClick={() => onAnswer('no')}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: isNo ? '#6b7280' : '#f9fafb',
                color: isNo ? '#ffffff' : '#6b7280',
                border: isNo ? '1px solid #6b7280' : '1px solid #e5e7eb',
              }}
            >
              No
            </button>
          </div>
        </div>

        {/* Impact — always visible but styled differently based on answer */}
        <p
          className="text-xs transition-colors duration-300"
          style={{ color: isYes ? '#6d28d9' : '#6b7280' }}
        >
          {isYes ? '✓ ' : ''}{question.impact}
        </p>

        {/* Unlock details — expand when Yes */}
        <AnimatePresence>
          {isYes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                className="pt-2 border-t flex items-center gap-2"
                style={{ borderColor: '#ede9fe' }}
              >
                <Zap className="w-3 h-3 text-violet-500 shrink-0" />
                <p className="text-[11px] font-medium text-violet-600">
                  {question.answerDependency}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────────

export function GoalDefinitionV3() {
  const { activeTileId, selectTile, viewMode } = useAgentPlaygroundStore()
  const [phase, setPhase] = useState<'idle' | 'typing' | 'awaiting-send' | 'pulsing' | 'revealed' | 'v3-preview' | 'v3-complete'>('idle')
  const [goalText, setGoalText] = useState('')
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null)
  const [showDemoToast, setShowDemoToast] = useState(false)
  const [showIdleCursor, setShowIdleCursor] = useState(true)
  const decompRef = useRef<HTMLDivElement>(null)
  const sonarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goalData = useMemo(() => {
    if (!selectedTileId) return null
    // Prefer V3 goal data, fall back to original
    return getGoalDataV3(selectedTileId) ?? getGoalData(selectedTileId)
  }, [selectedTileId])

  const tileInfo = useMemo(() => {
    if (!selectedTileId) return null
    // Use V3 use case definitions first, fall back to AGENT_TILE_MAP
    const v3Tile = V3_USE_CASES.find((t) => t.id === selectedTileId)
    if (v3Tile) return v3Tile
    return AGENT_TILE_MAP[selectedTileId] || null
  }, [selectedTileId])

  const accentColor = tileInfo?.color ?? '#3b82f6'
  const isV3Tile = selectedTileId ? isV3SupportedTile(selectedTileId) : false

  const { displayed, done, showCursor } = useTypingAnimation(
    selectedTileId ? goalData?.goalStatement || '' : '',
    phase === 'typing',
  )

  useEffect(() => {
    setGoalText(displayed)
  }, [displayed])

  useEffect(() => {
    let cursorInterval: ReturnType<typeof setInterval> | null = null
    if (phase === 'idle') {
      cursorInterval = setInterval(() => setShowIdleCursor((v) => !v), 530)
    }
    return () => { if (cursorInterval) clearInterval(cursorInterval) }
  }, [phase])

  useEffect(() => {
    if (done && phase === 'typing') setPhase('awaiting-send')
  }, [done, phase])

  useEffect(() => () => { if (sonarTimerRef.current) clearTimeout(sonarTimerRef.current) }, [])

  useEffect(() => {
    if (!activeTileId) {
      setPhase('idle')
      setSelectedTileId(null)
    }
  }, [activeTileId])

  const handleSelectPrompt = useCallback((tileId: string) => {
    selectTile(tileId)
    setSelectedTileId(tileId)
    setPhase('typing')
    setShowDemoToast(false)
  }, [selectTile])

  const handleSend = useCallback(() => {
    if (phase !== 'awaiting-send') return
    setPhase('pulsing')
    sonarTimerRef.current = setTimeout(() => {
      sonarTimerRef.current = null
      setPhase('revealed')
      setTimeout(() => {
        decompRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (isV3Tile) {
          setTimeout(() => setPhase('v3-preview'), 300)
        }
      }, 150)
    }, SONAR_DURATION_MS)
  }, [phase, isV3Tile])

  const handleInputClick = useCallback(() => {
    if (phase === 'idle' || phase === 'typing') {
      setShowDemoToast(true)
      setTimeout(() => setShowDemoToast(false), 3000)
    }
  }, [phase])

  const inputText = phase === 'typing' ? displayed : (phase !== 'idle' ? goalText : '')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Hero */}
      <GoalHero />

      {/* Demo toast */}
      <DemoToast visible={showDemoToast} />

      {/* Input box */}
      <PromptInputBox
        text={inputText}
        phase={phase}
        typingCursorVisible={showCursor}
        idleCursorVisible={showIdleCursor}
        onSend={handleSend}
        onInputClick={handleInputClick}
        accentColor={accentColor}
      />

      {/* V3 Use Case Selection */}
      {phase === 'idle' && (
        <V3UseCaseGrid onSelect={handleSelectPrompt} />
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        {phase === 'pulsing' ? 'Analyzing your goal...' : phase === 'revealed' ? 'Analysis complete' : ''}
      </div>

      {/* Analyzing loader */}
      <AnimatePresence>
        {phase === 'pulsing' && (
          <AnalyzingLoader key="analyzing" color={accentColor} />
        )}
      </AnimatePresence>

      {/* Decomposition + V3 Enhancements */}
      <AnimatePresence>
        {(phase === 'revealed' || phase === 'v3-preview' || phase === 'v3-complete') && goalData && (
          <motion.div
            ref={decompRef}
            key="revealed-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Summary */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-xs text-gray-500 leading-relaxed"
            >
              {viewMode === 'business' ? goalData.businessSummary : goalData.technicalSummary}
            </motion.p>

            {/* Risk callout */}
            <KeyRiskCallout risk={goalData.keyRisk} delay={0.2} />

            {/* Decomposition cards */}
            <div className="space-y-3">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Goal Decomposition
              </motion.h3>

              <DecompCard
                icon={<Target className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />}
                label="What the agent does"
                items={goalData.decomposition.primaryActions}
                color={accentColor}
                delay={0.35}
                reasoning={goalData.decomposition.reasoning}
              />
              <DecompCard
                icon={<Zap className="w-4 h-4" style={{ color: '#8b5cf6' }} aria-hidden="true" />}
                label="When it needs help"
                items={goalData.decomposition.secondaryActions}
                color="#8b5cf6"
                delay={0.4}
              />
              <DecompCard
                icon={<Database className="w-4 h-4" style={{ color: '#0369a1' }} aria-hidden="true" />}
                label="Main data it uses"
                items={goalData.decomposition.primaryData}
                color="#0369a1"
                delay={0.45}
              />
              <DecompCard
                icon={<Database className="w-4 h-4" style={{ color: '#6b7280' }} aria-hidden="true" />}
                label="Additional context"
                items={goalData.decomposition.supportingData}
                color="#6b7280"
                delay={0.5}
              />
            </div>

            {/* Trust boundaries — technical mode */}
            {viewMode === 'technical' && goalData.decomposition.trustBoundaryHints && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.3 }}
                className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3"
              >
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Trust Boundaries
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Autonomous', color: '#16a34a', dot: 'bg-green-400', items: goalData.decomposition.trustBoundaryHints.autonomous },
                    { label: 'Supervised', color: '#d97706', dot: 'bg-amber-400', items: goalData.decomposition.trustBoundaryHints.supervised },
                    { label: 'Escalation', color: '#dc2626', dot: 'bg-red-400', items: goalData.decomposition.trustBoundaryHints.escalation },
                  ].map(({ label, color, dot, items }) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
                      </div>
                      {items.map((item) => (
                        <p key={item} className="text-[10px] text-gray-500 pl-3.5">{item}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* V3 Destination Preview */}
            {(phase === 'v3-preview' || phase === 'v3-complete') && isV3Tile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 pt-4 border-t border-gray-200"
              >
                <DestinationPreviewSection tileId={selectedTileId!} delay={0} />
              </motion.div>
            )}

            {/* V3 Sharpening Questions */}
            {(phase === 'v3-preview' || phase === 'v3-complete') && isV3Tile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="pt-4 border-t border-gray-200"
              >
                <SharpeningQuestionsSection tileId={selectedTileId!} delay={0} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollAffordance />
    </div>
  )
}

export default GoalDefinitionV3
