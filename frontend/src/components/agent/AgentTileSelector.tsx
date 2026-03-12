import { motion } from 'framer-motion'
import {
  MessageCircleQuestion,
  FileSearch,
  GitCompare,
  Workflow,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AGENT_TILES } from '@/lib/agent/agentDomainData'
import type { AgentTile } from '@/store/agentTypes'

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircleQuestion,
  FileSearch,
  GitCompare,
  Workflow,
}

const COMPLEXITY_DOTS: Record<string, number> = {
  simple: 1,
  moderate: 2,
  'moderate-complex': 3,
  complex: 4,
}

interface AgentTileSelectorProps {
  onSelect: (tileId: string) => void
}

function TileCard({ tile, index, onSelect }: { tile: AgentTile; index: number; onSelect: () => void }) {
  const Icon = ICON_MAP[tile.iconName] ?? Workflow
  const dotCount = COMPLEXITY_DOTS[tile.complexity] ?? 1

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, boxShadow: `0 12px 32px ${tile.borderColor}` }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="group flex flex-col text-left rounded-2xl p-6 transition-all duration-200 cursor-pointer w-full"
      style={{
        background: '#ffffff',
        border: `1px solid ${tile.borderColor}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Icon + Complexity */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: tile.bgTint }}
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

      {/* Title */}
      <h3 className="text-base font-bold text-gray-900 mb-1.5">{tile.label}</h3>

      {/* Industry badge */}
      <span
        className="inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-semibold mb-3"
        style={{ background: tile.bgTint, color: tile.color }}
      >
        {tile.industry}
      </span>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
        {tile.description}
      </p>

      {/* Interaction path count badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">{tile.badge}</span>
        <div
          className="flex items-center gap-1 text-xs font-semibold sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: tile.color }}
        >
          Explore
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.button>
  )
}

export function AgentTileSelector({ onSelect }: AgentTileSelectorProps) {
  return (
    <div className="px-6 pb-16">
      {/* Section header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-bold text-gray-900">Choose an Agent Scenario</h2>
        <p className="text-sm text-gray-500 mt-1.5 max-w-xl mx-auto">
          Each scenario demonstrates how VibeModel discovers patterns, validates edge cases, and
          composes the right architecture — before your agent touches production.
        </p>
      </motion.div>

      {/* Tile grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {AGENT_TILES.map((tile, i) => (
          <TileCard
            key={tile.id}
            tile={tile}
            index={i}
            onSelect={() => onSelect(tile.id)}
          />
        ))}
      </div>

      {/* Hint text */}
      <motion.p
        className="text-center text-xs text-gray-400 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Start with FAQ for a quick walkthrough, or jump to Decision & Workflow for the full experience.
      </motion.p>
    </div>
  )
}
