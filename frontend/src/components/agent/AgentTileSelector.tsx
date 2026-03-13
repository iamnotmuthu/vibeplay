import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
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
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AGENT_DOMAINS, getTilesByDomain } from '@/lib/agent/agentDomainData'
import type { AgentTile } from '@/store/agentTypes'
import type { AgentDomain } from '@/store/agentTypes'

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

// ─── Domain Card ────────────────────────────────────────────────────────

function DomainCard({
  domain,
  tileCount,
  tagline,
  index,
  isHovered,
  onHoverStart,
  onHoverEnd,
  onClick,
}: {
  domain: AgentDomain
  tileCount: number
  tagline: string
  index: number
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick: () => void
}) {
  const Icon = ICON_MAP[domain.icon] ?? Sparkles

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.02 : 1,
          y: isHovered ? -4 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative rounded-2xl p-6 h-full flex flex-col overflow-hidden"
        style={{
          background: '#ffffff',
          border: isHovered
            ? `1px solid ${domain.color}50`
            : '1px solid #e5e7eb',
          boxShadow: isHovered
            ? `0 12px 40px -12px ${domain.color}20, 0 4px 12px rgba(0,0,0,0.06)`
            : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {/* Icon + Count badge */}
        <div className="flex items-start justify-between mb-5">
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
            {tileCount} {tileCount === 1 ? 'scenario' : 'scenarios'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{domain.label}</h3>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {tagline}
          </p>
        </div>

        {/* CTA */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 6 }}
          transition={{ duration: 0.18 }}
          className="mt-4 flex items-center gap-1.5"
        >
          <span className="text-xs font-bold" style={{ color: domain.color }}>
            Explore
          </span>
          <ArrowRight className="w-3.5 h-3.5" style={{ color: domain.color }} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─── Scenario Tile Card ─────────────────────────────────────────────────

function ScenarioCard({
  tile,
  index,
  isHovered,
  isSelected,
  launching,
  onHoverStart,
  onHoverEnd,
  onClick,
}: {
  tile: AgentTile
  index: number
  isHovered: boolean
  isSelected: boolean
  launching: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick: () => void
}) {
  const Icon = ICON_MAP[tile.iconName] ?? Sparkles
  const dotCount = COMPLEXITY_DOTS[tile.complexity] ?? 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <motion.div
        animate={{
          scale: isSelected ? 0.98 : isHovered ? 1.02 : 1,
          y: isHovered ? -4 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative rounded-2xl p-6 h-full flex flex-col overflow-hidden"
        style={{
          background: '#ffffff',
          border: isHovered
            ? `1px solid ${tile.color}50`
            : '1px solid #e5e7eb',
          boxShadow: isHovered
            ? `0 12px 40px -12px ${tile.color}20, 0 4px 12px rgba(0,0,0,0.06)`
            : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {/* Icon + Complexity */}
        <div className="flex items-start justify-between mb-5">
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
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {tile.complexityLabel}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug">
            {tile.label}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
            {tile.description}
          </p>
        </div>

        {/* Stats row */}
        <div
          className="flex items-center gap-3 mt-5 pt-4"
          style={{ borderTop: '1px solid #f3f4f6' }}
        >
          <span className="text-xs font-medium text-gray-400">{tile.badge}</span>
        </div>

        {/* CTA */}
        <AnimatePresence>
          {(isHovered || isSelected) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-6 right-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: tile.color }}>
                  {isSelected && launching ? 'Launching...' : 'Start'}
                </span>
                <motion.div
                  animate={{ x: isSelected && launching ? 4 : 0 }}
                  transition={{
                    repeat: isSelected && launching ? Infinity : 0,
                    duration: 0.6,
                    repeatType: 'reverse',
                  }}
                >
                  <ArrowRight className="w-4 h-4" style={{ color: tile.color }} />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

interface AgentTileSelectorProps {
  onSelect: (tileId: string) => void
}

export function AgentTileSelector({ onSelect }: AgentTileSelectorProps) {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [hoveredTileId, setHoveredTileId] = useState<string | null>(null)
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null)
  const [launching, setLaunching] = useState(false)

  // Only show domains that have at least one tile
  const activeDomains = useMemo(
    () => AGENT_DOMAINS.filter((d) => getTilesByDomain(d.id).length > 0),
    []
  )

  const filteredTiles = useMemo(
    () => (selectedDomain ? getTilesByDomain(selectedDomain) : []),
    [selectedDomain]
  )

  const handleTileSelect = async (tile: AgentTile) => {
    setSelectedTileId(tile.id)
    setLaunching(true)
    await new Promise((r) => setTimeout(r, 500))
    onSelect(tile.id)
  }

  return (
    <div className="px-6 pb-16">
      <AnimatePresence mode="wait">
        {selectedDomain === null ? (
          /* ── Domain Grid ── */
          <motion.div
            key="domains"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* Section header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-gray-900">Choose an Industry</h2>
              <p className="text-sm text-gray-500 mt-1.5 max-w-xl mx-auto">
                Pick an industry vertical to explore how VibeModel builds production-ready agents
                for real-world problems in that domain.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {activeDomains.map((domain, i) => {
                const tiles = getTilesByDomain(domain.id)
                return (
                  <DomainCard
                    key={domain.id}
                    domain={domain}
                    tileCount={tiles.length}
                    tagline={domain.tagline}
                    index={i}
                    isHovered={hoveredDomain === domain.id}
                    onHoverStart={() => setHoveredDomain(domain.id)}
                    onHoverEnd={() => setHoveredDomain(null)}
                    onClick={() => {
                      const tiles = getTilesByDomain(domain.id)
                      if (tiles.length === 1) {
                        // Skip drill-down for single-tile domains — launch directly
                        handleTileSelect(tiles[0])
                      } else {
                        setSelectedDomain(domain.id)
                      }
                    }}
                  />
                )
              })}
            </div>

            {/* Hint text */}
            <motion.p
              className="text-center text-xs text-gray-400 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Each industry contains one or more agent scenarios ranging from simple to complex.
            </motion.p>
          </motion.div>
        ) : (
          /* ── Scenario Cards within selected domain ── */
          <motion.div
            key="scenarios"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                setSelectedDomain(null)
                setSelectedTileId(null)
                setLaunching(false)
              }}
              className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white"
              style={{ color: '#6b7280' }}
            >
              <ArrowLeft className="w-4 h-4" />
              All Industries
            </motion.button>

            {/* Domain header */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                const domain = AGENT_DOMAINS.find((d) => d.id === selectedDomain)
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
                      <h2 className="text-lg font-bold text-gray-900">{domain.label}</h2>
                      <p className="text-sm text-gray-500">{filteredTiles.length} agent scenarios</p>
                    </div>
                  </div>
                ) : null
              })()}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {filteredTiles.map((tile, i) => (
                <ScenarioCard
                  key={tile.id}
                  tile={tile}
                  index={i}
                  isHovered={hoveredTileId === tile.id}
                  isSelected={selectedTileId === tile.id}
                  launching={launching}
                  onHoverStart={() => setHoveredTileId(tile.id)}
                  onHoverEnd={() => setHoveredTileId(null)}
                  onClick={() => !launching && handleTileSelect(tile)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
