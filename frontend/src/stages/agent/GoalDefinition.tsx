import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Zap,
  Database,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  MessageSquare,
  Monitor,
  Landmark,
  HeartPulse,
  Truck,
  Shield,
  ShoppingCart,
  Factory,
  Film,
  Users,
  Megaphone,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP, AGENT_DOMAINS, getTilesByDomain } from '@/lib/agent/agentDomainData'
import { getGoalData } from '@/lib/agent/goalData'

// ─── Icon registry ──────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Monitor,
  Landmark,
  HeartPulse,
  Truck,
  Shield,
  ShoppingCart,
  Factory,
  Film,
  Users,
  Megaphone,
}

const COMPLEXITY_DOTS: Record<string, number> = {
  simple: 1,
  moderate: 2,
  'moderate-complex': 3,
  complex: 4,
}

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
    <span
      className="inline-block w-[2px] h-[1.15em] align-text-bottom ml-0.5 rounded-full"
      style={{ background: color, opacity: visible ? 0.9 : 0, transition: 'opacity 0.08s' }}
      aria-hidden="true"
    />
  )
}

// ─── Persistent Blinking Cursor ──────────────────────────────────────────────

function useBlinkingCursor() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 530)
    return () => clearInterval(interval)
  }, [])
  return visible
}

// ─── Sonar Pulse ─────────────────────────────────────────────────────────────

function SonarPulse({ color }: { color: string }) {
  return (
    <div className="relative flex items-center justify-center w-full py-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ border: `1.5px solid ${color}`, width: 24 + i * 28, height: 24 + i * 28 }}
          initial={{ opacity: 0.7, scale: 0.6 }}
          animate={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 1.2, delay: i * 0.25, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{ background: color }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function GoalHero() {
  return (
    <div
      className="rounded-2xl px-6 py-7 text-center"
      style={{
        background: 'linear-gradient(160deg, #7c3aed 0%, #a78bfa 50%, #c4b5fd 100%)',
      }}
    >
      <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
        What should your agent do?
      </h1>
      <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
        Pick an example below or describe your goal — VibeModel will compose the
        right agent architecture from scratch.
      </p>
    </div>
  )
}

// ─── Prompt Input Box ─────────────────────────────────────────────────────────

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
  phase: GoalPhase
  typingCursorVisible: boolean
  idleCursorVisible: boolean
  onSend: () => void
  onInputClick: () => void
  accentColor: string
}) {
  const isEmpty = !text
  const sendActive = phase === 'awaiting-send'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="rounded-xl border bg-white shadow-sm overflow-hidden"
      style={{ borderColor: sendActive ? `${accentColor}50` : '#e5e7eb' }}
    >
      {/* Text area */}
      <div
        className="px-4 pt-4 pb-2 min-h-[80px] cursor-default select-none"
        onClick={onInputClick}
        aria-readonly="true"
        aria-label="Agent goal input"
        aria-multiline="true"
      >
        {isEmpty ? (
          <p className="text-sm text-gray-400 leading-relaxed">
            Describe what you want to automate…
            <TypingCursor visible={idleCursorVisible} color="#9ca3af" />
          </p>
        ) : (
          <p className="text-sm text-gray-800 leading-relaxed">
            {text}
            {(phase === 'typing' || phase === 'awaiting-send') && (
              <TypingCursor
                visible={phase === 'typing' ? typingCursorVisible : idleCursorVisible}
                color={accentColor}
              />
            )}
          </p>
        )}
      </div>

      {/* Bottom bar with send button */}
      <div className="px-3 pb-3 flex items-center justify-between">
        <span className="text-[10px] text-gray-300 select-none">
          {isEmpty ? 'Pick a prompt below to get started' : `${text.length} chars`}
        </span>
        <motion.button
          disabled={!sendActive}
          onClick={sendActive ? onSend : undefined}
          whileTap={sendActive ? { scale: 0.92 } : {}}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{
            background: sendActive ? accentColor : '#e5e7eb',
            cursor: sendActive ? 'pointer' : 'default',
            boxShadow: sendActive ? `0 2px 8px ${accentColor}40` : 'none',
          }}
          aria-label="Send goal"
        >
          <ArrowUp className="w-4 h-4 text-white" aria-hidden="true" />
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Demo Toast ───────────────────────────────────────────────────────────────

function DemoToast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-amber-700 bg-amber-50"
          style={{ borderColor: '#fcd34d' }}
          role="status"
          aria-live="polite"
        >
          <MessageSquare className="w-3 h-3 shrink-0" aria-hidden="true" />
          Demo mode — pick an example prompt below to get started
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Domain Card (Step 1) ───────────────────────────────────────────────────

function DomainCardStep1({
  domain,
  tileCount,
  index,
  onClick,
}: {
  domain: typeof AGENT_DOMAINS[0]
  tileCount: number
  index: number
  onClick: () => void
}) {
  const Icon = ICON_MAP[domain.icon] ?? Sparkles

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group cursor-pointer text-left rounded-2xl p-5 flex flex-col bg-white w-full"
      style={{
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = `${domain.color}50`
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px -12px ${domain.color}20, 0 4px 12px rgba(0,0,0,0.06)`
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
      }}
    >
      {/* Icon + Count badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${domain.color}15, ${domain.color}05)`,
            border: `1px solid ${domain.color}25`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color: domain.color }} />
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            background: `${domain.color}10`,
            color: domain.color,
            border: `1px solid ${domain.color}25`,
          }}
        >
          {tileCount} {tileCount === 1 ? 'agent' : 'agents'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-base font-bold text-gray-900 mb-1">{domain.label}</h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
          {domain.tagline}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <span className="text-xs font-bold" style={{ color: domain.color }}>Explore</span>
        <ArrowRight className="w-3.5 h-3.5" style={{ color: domain.color }} />
      </div>
    </motion.button>
  )
}

// ─── Agent Tile Card (Step 2) ───────────────────────────────────────────────

function AgentTileCardStep2({
  tile,
  index,
  onClick,
}: {
  tile: typeof AGENT_TILE_MAP[keyof typeof AGENT_TILE_MAP]
  index: number
  onClick: () => void
}) {
  const Icon = ICON_MAP[tile.iconName] ?? Sparkles
  const dotCount = COMPLEXITY_DOTS[tile.complexity] ?? 1

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group cursor-pointer text-left rounded-2xl p-5 flex flex-col bg-white w-full"
      style={{
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = `${tile.color}50`
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px -12px ${tile.color}20, 0 4px 12px rgba(0,0,0,0.06)`
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
      }}
    >
      {/* Icon + Complexity dots */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${tile.color}15, ${tile.color}05)`,
            border: `1px solid ${tile.color}25`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color: tile.color }} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: i < dotCount ? tile.color : '#e5e7eb',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">
          {tile.label}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
          {tile.description}
        </p>
      </div>

      {/* Domain badge + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full"
          style={{
            background: `${tile.color}10`,
            color: tile.color,
          }}
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
}

// ─── Example Prompts Section ──────────────────────────────────────────────────

function ExamplePromptsSection({ onSelect, onBrowseAll }: { onSelect: (tileId: string) => void; onBrowseAll: () => void }) {
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null)

  // Only show domains that have tiles
  const activeDomains = useMemo(
    () => AGENT_DOMAINS.filter((d) => getTilesByDomain(d.id).length > 0),
    []
  )

  const filteredTiles = useMemo(
    () => (selectedDomainId ? getTilesByDomain(selectedDomainId) : []),
    [selectedDomainId]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: 0.15, duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {selectedDomainId === null ? (
          /* ── Step 1: Domain Cards ── */
          <motion.div
            key="domains"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeDomains.map((domain, i) => {
                const tiles = getTilesByDomain(domain.id)
                return (
                  <DomainCardStep1
                    key={domain.id}
                    domain={domain}
                    tileCount={tiles.length}
                    index={i}
                    onClick={() => setSelectedDomainId(domain.id)}
                  />
                )
              })}
            </div>
          </motion.div>
        ) : (
          /* ── Step 2: Agent Tiles ── */
          <motion.div
            key="tiles"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedDomainId(null)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#6b7280' }}
            >
              <ArrowLeft className="w-4 h-4" />
              All domains
            </motion.button>

            {/* Domain header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                const domain = AGENT_DOMAINS.find((d) => d.id === selectedDomainId)
                const Icon = domain ? ICON_MAP[domain.icon] ?? Sparkles : Sparkles
                return domain ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${domain.color}15, ${domain.color}05)`,
                        border: `1px solid ${domain.color}25`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: domain.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{domain.label}</h3>
                      <p className="text-sm text-gray-500">{filteredTiles.length} agent scenarios</p>
                    </div>
                  </div>
                ) : null
              })()}
            </motion.div>

            {/* Agent tiles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTiles.map((tile, i) => (
                <AgentTileCardStep2
                  key={tile.id}
                  tile={tile}
                  index={i}
                  onClick={() => onSelect(tile.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browse all agents fallback */}
      {selectedDomainId === null && (
        <div className="mt-4 text-center">
          <button
            onClick={onBrowseAll}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Browse all agents by industry
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ─── Decomposition Card ───────────────────────────────────────────────────────

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
  const panelId = `decomp-panel-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: `${color}30` }}
    >
      <button
        onClick={() => reasoning && setExpanded(!expanded)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
        aria-expanded={reasoning ? expanded : undefined}
        aria-controls={reasoning ? panelId : undefined}
        aria-label={`${label}: ${items.join(', ')}`}
        style={{ cursor: reasoning ? 'pointer' : 'default' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}12` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {label}
          </span>
          <div className="space-y-1 mt-1.5">
            {items.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {reasoning ? (
          <div className="shrink-0 text-gray-300">
            {expanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </div>
        ) : (
          <div className="shrink-0 w-4" />
        )}
      </button>

      <AnimatePresence>
        {expanded && reasoning && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`${label} reasoning`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3.5 pt-0">
              <div
                className="rounded-lg px-3 py-2.5 text-xs text-gray-600 leading-relaxed"
                style={{ background: `${color}06`, borderLeft: `2px solid ${color}40` }}
              >
                <span className="font-semibold text-gray-700">Why this matters: </span>
                {reasoning}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Key Risk Callout ─────────────────────────────────────────────────────────

function KeyRiskCallout({ risk, delay }: { risk: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 flex items-start gap-3"
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">What to Watch For</span>
        <p className="text-xs text-amber-900 leading-relaxed mt-0.5">{risk}</p>
      </div>
    </motion.div>
  )
}

// ─── Scroll Affordance ────────────────────────────────────────────────────────

function ScrollAffordance() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const handleScroll = () => { if (window.scrollY > 100) setVisible(false) }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  if (!visible) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 1.5 }}
      className="sm:hidden fixed bottom-16 left-1/2 -translate-x-1/2 z-10"
    >
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 shadow-md border border-gray-200 text-xs text-gray-500"
      >
        <ArrowDown className="w-3 h-3" aria-hidden="true" />
        Scroll for more
      </motion.div>
    </motion.div>
  )
}

// ─── Phase Type ───────────────────────────────────────────────────────────────

type GoalPhase = 'idle' | 'typing' | 'awaiting-send' | 'pulsing' | 'revealed'

const SONAR_DURATION_MS = 1400

// ─── Main Component ───────────────────────────────────────────────────────────

export function GoalDefinition() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const selectTile = useAgentPlaygroundStore((s) => s.selectTile)
  const resetToTiles = useAgentPlaygroundStore((s) => s.resetToTiles)

  const [phase, setPhase] = useState<GoalPhase>('idle')
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null)
  const [showDemoToast, setShowDemoToast] = useState(false)
  const sonarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const decompRef = useRef<HTMLDivElement>(null)

  // Resolve the active tile from either local state or store
  const tileId = selectedTileId ?? activeTileId
  const tile = tileId ? AGENT_TILE_MAP[tileId] : null
  const goalData = tileId ? getGoalData(tileId) : null
  const accentColor = tile?.color ?? '#7c3aed'
  const goalText = goalData?.goalStatement ?? ''

  const idleCursorVisible = useBlinkingCursor()

  const { displayed, done, showCursor } = useTypingAnimation(
    goalText,
    phase === 'typing',
  )

  // Typing complete → awaiting-send
  useEffect(() => {
    if (done && phase === 'typing') setPhase('awaiting-send')
  }, [done, phase])

  // Cleanup sonar timer on unmount
  useEffect(() => () => { if (sonarTimerRef.current) clearTimeout(sonarTimerRef.current) }, [])

  // Reset when tile changes from store (navigating back)
  useEffect(() => {
    setPhase('idle')
    setSelectedTileId(null)
  }, [activeTileId])

  // Handle prompt card click
  const handleSelectPrompt = useCallback((tileId: string) => {
    selectTile(tileId)
    setSelectedTileId(tileId)
    setPhase('typing')
    setShowDemoToast(false)
  }, [selectTile])

  // Handle send
  const handleSend = useCallback(() => {
    if (phase !== 'awaiting-send') return
    setPhase('pulsing')
    sonarTimerRef.current = setTimeout(() => {
      sonarTimerRef.current = null
      setPhase('revealed')
      // Scroll decomposition into view after a short delay
      setTimeout(() => {
        decompRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }, SONAR_DURATION_MS)
  }, [phase])

  // Demo toast when user clicks input in idle
  const handleInputClick = useCallback(() => {
    if (phase === 'idle' || phase === 'typing') {
      setShowDemoToast(true)
      setTimeout(() => setShowDemoToast(false), 3000)
    }
  }, [phase])

  // Displayed text for the input box
  const inputText = phase === 'typing' ? displayed : (phase !== 'idle' ? goalText : '')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Hero */}
      <GoalHero />

      {/* Demo toast */}
      <DemoToast visible={showDemoToast} />

      {/* Input box */}
      <PromptInputBox
        text={inputText}
        phase={phase}
        typingCursorVisible={showCursor}
        idleCursorVisible={idleCursorVisible}
        onSend={handleSend}
        onInputClick={handleInputClick}
        accentColor={accentColor}
      />

      {/* Example prompts — only in idle phase */}
      <AnimatePresence>
        {phase === 'idle' && (
          <ExamplePromptsSection onSelect={handleSelectPrompt} onBrowseAll={() => resetToTiles()} />
        )}
      </AnimatePresence>

      {/* Screen reader announcement for phase */}
      <div className="sr-only" aria-live="polite">
        {phase === 'pulsing' ? 'Analyzing your goal...' : phase === 'revealed' ? 'Analysis complete' : ''}
      </div>

      {/* Sonar pulse */}
      <AnimatePresence>
        {phase === 'pulsing' && (
          <motion.div
            key="sonar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <SonarPulse color={accentColor} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decomposition — revealed after send */}
      <AnimatePresence>
        {phase === 'revealed' && goalData && (
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
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollAffordance />
    </div>
  )
}
