import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Table,
  ScanLine,
  FileText,
  GitBranch,
  Database,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Shield,
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  RotateCcw,
  Radar,
  Link2,
  ShieldAlert,
  CircleSlash,
  Gauge,
} from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getMonitoringData } from '@/lib/agent/monitoringData'
import type {
  WeeklyHealthDot,
  LandmineCard,
  MonitoringAlert,
  DriftCard,
  NewDimensionCard,
  TrendDataPoint,
} from '@/store/agentTypes'

// ─── Icon Resolver ────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  search: Search,
  'trending-up': TrendingUp,
  table: Table,
  scan: ScanLine,
  'file-text': FileText,
  'git-branch': GitBranch,
  'alert-triangle': AlertTriangle,
  clock: Clock,
  database: Database,
  'eye-off': EyeOff,
}

function resolveIcon(name: string) {
  return ICON_MAP[name] ?? Activity
}

// ─── Stats Banner ─────────────────────────────────────────────────────────

function StatsBanner({
  stats,
  tileColor,
  viewMode,
}: {
  stats: { totalInteractions: number; avgResolutionTime: string; escalationRate: number; agentVersion: string }
  tileColor: string
  viewMode: string
}) {
  const items = viewMode === 'technical'
    ? [
        { label: 'Total Interactions', value: stats.totalInteractions.toLocaleString() },
        { label: 'Avg Resolution', value: stats.avgResolutionTime },
        { label: 'Escalation Rate', value: `${stats.escalationRate}%` },
        { label: 'Agent Version', value: stats.agentVersion },
      ]
    : [
        { label: 'Requests Handled', value: stats.totalInteractions.toLocaleString() },
        { label: 'Avg Response Time', value: stats.avgResolutionTime },
        { label: 'Escalation Rate', value: `${stats.escalationRate}%` },
        { label: 'Current Version', value: stats.agentVersion },
      ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-xl border p-5"
      style={{
        background: `${tileColor}06`,
        borderColor: `${tileColor}20`,
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Weekly Health Timeline ───────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  healthy: { bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', label: 'Healthy' },
  warning: { bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b', label: 'Warning' },
  critical: { bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', label: 'Critical' },
}

function WeeklyTimeline({
  health,
  tileColor,
}: {
  health: WeeklyHealthDot[]
  tileColor: string
}) {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl border bg-white p-5"
      style={{ borderColor: '#e5e7eb' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4" style={{ color: tileColor }} />
        <h3 className="text-sm font-bold text-gray-900">12-Week Health Timeline</h3>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        {['healthy', 'warning', 'critical'].map((status) => {
          const c = STATUS_COLORS[status]
          return (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }} />
              <span className="text-[11px] text-gray-500">{c.label}</span>
            </div>
          )
        })}
      </div>

      {/* Timeline dots */}
      <div className="flex items-end gap-1.5 relative" role="list" aria-label="Weekly health status">
        {health.map((dot, i) => {
          const c = STATUS_COLORS[dot.status] ?? STATUS_COLORS.healthy
          const isHovered = hoveredWeek === i
          return (
            <div
              key={`week-${dot.week}`}
              className="flex-1 flex flex-col items-center relative"
              role="listitem"
              onMouseEnter={() => setHoveredWeek(i)}
              onMouseLeave={() => setHoveredWeek(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full mb-2 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-gray-700 bg-white border shadow-md whitespace-nowrap z-10"
                    style={{ borderColor: c.border }}
                  >
                    <span className="font-bold">Week {dot.week}:</span> {dot.label}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04, duration: 0.3, type: 'spring' }}
                className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                style={{
                  background: c.bg,
                  border: `2px solid ${c.border}`,
                }}
                tabIndex={0}
                role="button"
                aria-label={`Week ${dot.week}: ${c.label} — ${dot.label}`}
                onFocus={() => setHoveredWeek(i)}
                onBlur={() => setHoveredWeek(null)}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: c.dot }} aria-hidden="true" />
              </motion.div>

              {/* Week label */}
              <span className="text-[9px] text-gray-400 mt-1" aria-hidden="true">W{dot.week}</span>
            </div>
          )
        })}
      </div>

      {/* Connector line */}
      <div className="relative mx-3 -mt-[22px] mb-4" aria-hidden="true">
        <div className="h-[2px] bg-gray-100 rounded-full" />
      </div>
    </motion.div>
  )
}

// ─── Landmine Card ────────────────────────────────────────────────────────

function LandmineCardUI({
  landmine,
  tileColor,
  viewMode,
  index,
}: {
  landmine: LandmineCard
  tileColor: string
  viewMode: string
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const IconComp = resolveIcon(landmine.icon)

  const severityColors: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    medium: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    low: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  }
  const sev = severityColors[landmine.severity] ?? severityColors.medium

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: '#e5e7eb' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-start gap-4 text-left cursor-pointer hover:bg-gray-50/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-expanded={expanded}
        aria-label={`${landmine.title} — ${landmine.severity} severity, week ${landmine.week}`}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: `${tileColor}10` }}
        >
          <IconComp className="w-5 h-5" style={{ color: tileColor }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-gray-900">{landmine.title}</h4>
            <span
              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
              style={{ background: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}
            >
              {landmine.severity}
            </span>
            <span className="text-[10px] text-gray-400 ml-auto shrink-0">Week {landmine.week}</span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{landmine.description}</p>
        </div>

        {/* Expand toggle */}
        <div className="shrink-0 mt-1">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t" style={{ borderColor: '#f3f4f6' }}>
              <div className="pt-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-bold text-green-700">
                    {viewMode === 'technical' ? 'Resolution' : 'How It Was Fixed'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{landmine.resolution}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Alert Row ────────────────────────────────────────────────────────────

function AlertRow({
  alert,
  tileColor: _tileColor,
  viewMode,
  index,
}: {
  alert: MonitoringAlert
  tileColor: string
  viewMode: string
  index: number
}) {
  const typeLabels: Record<string, string> = {
    drift: 'Drift',
    'escalation-spike': 'Escalation',
    'confidence-drop': 'Confidence',
    'component-failure': 'Failure',
    'edge-case-cluster': 'Edge Case',
  }

  const typeIcons: Record<string, React.ElementType> = {
    drift: TrendingUp,
    'escalation-spike': AlertTriangle,
    'confidence-drop': XCircle,
    'component-failure': Zap,
    'edge-case-cluster': Search,
  }

  const TypeIcon = typeIcons[alert.type] ?? AlertTriangle

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.06, duration: 0.3 }}
      className="flex items-start gap-3 px-4 py-3 rounded-lg border bg-white"
      style={{ borderColor: `${alert.color}30` }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${alert.color}12` }}
      >
        <TypeIcon className="w-4 h-4" style={{ color: alert.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
            style={{ background: `${alert.color}12`, color: alert.color }}
          >
            {typeLabels[alert.type] ?? alert.type}
          </span>
          <span className="text-[10px] text-gray-400">Week {alert.week}</span>
        </div>
        <h4 className="text-sm font-bold text-gray-900 mb-0.5">{alert.title}</h4>
        <p className="text-xs text-gray-500">{alert.description}</p>
        {viewMode === 'technical' && alert.affectedComponents && (
          <div className="flex flex-wrap gap-1 mt-2">
            {alert.affectedComponents.map((comp) => (
              <span
                key={comp}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
              >
                {comp}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Explainer ────────────────────────────────────────────────────────────

function MonitoringExplainer({
  viewMode,
  tileColor,
}: {
  viewMode: string
  tileColor: string
}) {
  const [open, setOpen] = useState(false)

  const businessContent = {
    title: 'What happens after launch?',
    text: 'Every agent encounters unexpected situations in production. This stage shows 12 weeks of real-world operation — the issues that surfaced, how the system detected them, and what was done to resolve them. These are the "landmines" that only appear with real traffic.',
  }
  const technicalContent = {
    title: 'Production Monitoring & Drift Detection',
    text: 'Post-deployment monitoring surfaces edge cases, data drift, and component failures that cannot be predicted during development. This stage simulates 12 weeks of health telemetry, escalation tracking, and automated drift detection across the 26-component production stack.',
  }
  const content = viewMode === 'technical' ? technicalContent : businessContent

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.05, duration: 0.3 }}
      className="rounded-xl border overflow-hidden mb-6"
      style={{ borderColor: `${tileColor}25`, background: `${tileColor}04` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        style={{ color: tileColor }}
        aria-expanded={open}
      >
        <Info className="w-4 h-4 shrink-0" />
        <span className="text-sm font-semibold flex-1">{content.title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-600 leading-relaxed">{content.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Pattern Drift Detected Card ─────────────────────────────────────────

function DriftDetectedCard({
  drift,
  tileColor: _tileColor,
  viewMode,
}: {
  drift: DriftCard
  tileColor: string
  viewMode: string
}) {
  const [showDemoMsg, setShowDemoMsg] = useState(false)

  const handleDemoAction = () => {
    setShowDemoMsg(true)
    setTimeout(() => setShowDemoMsg(false), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="rounded-xl border-2 overflow-hidden"
      style={{
        borderColor: '#fca5a5',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)',
      }}
    >
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
              >
                Drift Alert
              </span>
              <span className="text-[10px] text-gray-400">Week {drift.week}</span>
            </div>
            <h4 className="text-sm font-bold text-gray-900">{drift.title}</h4>
          </div>
        </div>

        {/* Affected Path */}
        <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)' }}>
          <p className="text-[11px] font-semibold text-red-700 mb-0.5">
            {viewMode === 'technical' ? 'Affected Path' : 'What Changed'}
          </p>
          <p className="text-xs text-gray-600">{drift.affectedPath}</p>
        </div>

        {/* Detail */}
        <p className="text-xs text-gray-600 leading-relaxed mb-3">{drift.detail}</p>

        {/* Impact Metric */}
        <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-lg bg-white border" style={{ borderColor: '#fecaca' }}>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-gray-500">{drift.impactMetric}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold text-gray-400 line-through">{drift.impactFrom}</span>
              <ArrowDownRight className="w-4 h-4 text-red-500" />
              <span className="text-lg font-bold text-red-600">{drift.impactTo}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#dc2626',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            onClick={handleDemoAction}
          >
            <Search className="w-3.5 h-3.5" />
            Review Analysis
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
            style={{
              background: '#dc2626',
              boxShadow: '0 2px 6px rgba(220,38,38,0.25)',
            }}
            onClick={handleDemoAction}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Trigger Re-evaluation
          </button>
        </div>

        <AnimatePresence>
          {showDemoMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700"
            >
              This action is available in the full platform. This demo walks you through the complete agent building flow with pre-configured data.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── New Dimension Discovered Card ───────────────────────────────────────

const DIMENSION_CATEGORY_CONFIG: Record<string, { icon: React.ElementType; label: string; badgeColor: string; badgeBg: string }> = {
  'new-dimension': { icon: Radar, label: 'New Dimension', badgeColor: '#d97706', badgeBg: 'rgba(245,158,11,0.1)' },
  'multi-doc-hop': { icon: Link2, label: 'Multi-Doc Hop', badgeColor: '#7c3aed', badgeBg: 'rgba(124,58,237,0.1)' },
  'prompt-injection': { icon: ShieldAlert, label: 'Prompt Injection', badgeColor: '#dc2626', badgeBg: 'rgba(220,38,38,0.1)' },
  'absence-detection': { icon: CircleSlash, label: 'Absence Detection', badgeColor: '#0891b2', badgeBg: 'rgba(8,145,178,0.1)' },
  'confidence-decay': { icon: Gauge, label: 'Confidence Decay', badgeColor: '#c2410c', badgeBg: 'rgba(194,65,12,0.1)' },
}

function NewDimensionDetectedCard({
  dimension,
  tileColor: _tileColor,
  viewMode,
  delay = 0.3,
}: {
  dimension: NewDimensionCard
  tileColor: string
  viewMode: string
  delay?: number
}) {
  const [showDemoMsg, setShowDemoMsg] = useState(false)

  const handleDemoAction = () => {
    setShowDemoMsg(true)
    setTimeout(() => setShowDemoMsg(false), 3000)
  }

  const cat = dimension.category ?? 'new-dimension'
  const config = DIMENSION_CATEGORY_CONFIG[cat] ?? DIMENSION_CATEGORY_CONFIG['new-dimension']
  const IconComp = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border-2 overflow-hidden"
      style={{
        borderColor: '#fcd34d',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fefce8 100%)',
      }}
    >
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: config.badgeBg }}
          >
            <IconComp className="w-5 h-5" style={{ color: config.badgeColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                style={{ background: config.badgeBg, color: config.badgeColor }}
              >
                {config.label}
              </span>
              <span className="text-[10px] text-gray-400">Week {dimension.week}</span>
            </div>
            <h4 className="text-sm font-bold text-gray-900">{dimension.title}</h4>
          </div>
        </div>

        {/* Affected Coverage */}
        <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.05)' }}>
          <p className="text-[11px] font-semibold text-amber-700 mb-0.5">
            {viewMode === 'technical' ? 'Affected Coverage' : 'How Many Affected'}
          </p>
          <p className="text-sm font-bold text-amber-600">{dimension.affectedCoverage}</p>
        </div>

        {/* Detail */}
        <p className="text-xs text-gray-600 leading-relaxed mb-3">{dimension.detail}</p>

        {/* Impact Estimate */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-white border" style={{ borderColor: '#fde68a' }}>
          <ArrowUpRight className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs font-semibold text-amber-700">{dimension.impactEstimate}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            style={{
              background: 'rgba(245,158,11,0.08)',
              color: '#d97706',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
            onClick={handleDemoAction}
          >
            <Search className="w-3.5 h-3.5" />
            Review Analysis
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
            style={{
              background: '#d97706',
              boxShadow: '0 2px 6px rgba(217,119,6,0.25)',
            }}
            onClick={handleDemoAction}
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Path & Re-evaluate
          </button>
        </div>

        <AnimatePresence>
          {showDemoMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700"
            >
              This action is available in the full platform. This demo walks you through the complete agent building flow with pre-configured data.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Performance Trend Charts (SVG) ─────────────────────────────────────

function PerformanceTrendCharts({
  trendData,
  tileColor,
  viewMode,
}: {
  trendData: TrendDataPoint[]
  tileColor: string
  viewMode: string
}) {
  if (!trendData || trendData.length === 0) return null

  const chartW = 320
  const chartH = 120
  const padL = 36
  const padR = 8
  const padT = 8
  const padB = 20
  const innerW = chartW - padL - padR
  const innerH = chartH - padT - padB

  // Helpers
  const mapX = (i: number) => padL + (i / (trendData.length - 1)) * innerW
  const buildPath = (values: number[], min: number, max: number) => {
    const range = max - min || 1
    return values
      .map((v, i) => {
        const x = mapX(i)
        const y = padT + innerH - ((v - min) / range) * innerH
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  // Data arrays
  const resRates = trendData.map((d) => d.resolutionRate)
  const escRates = trendData.map((d) => d.escalationRate)
  const volumes = trendData.map((d) => d.interactionVolume)
  const resTimes = trendData.map((d) => d.avgResolutionTime)

  // Chart 1: Resolution Rate + Escalation Rate (fixed 0–100% axis)
  const rateMin = 0
  const rateMax = 100
  const resPath = buildPath(resRates, rateMin, rateMax)
  const escPath = buildPath(escRates, rateMin, rateMax)

  // Chart 2: Interaction Volume (bars)
  const volMin = 0
  const volMax = Math.max(...volumes) * 1.15

  // Chart 3: Avg Resolution Time
  const timeMin = Math.min(...resTimes) - 0.5
  const timeMax = Math.max(...resTimes) + 0.5
  const timePath = buildPath(resTimes, timeMin, timeMax)

  const yLabels = (min: number, max: number, suffix: string, count = 3) => {
    const range = max - min
    return Array.from({ length: count }, (_, i) => {
      const val = min + (range * i) / (count - 1)
      const y = padT + innerH - (i / (count - 1)) * innerH
      return { val: `${Math.round(val)}${suffix}`, y }
    })
  }

  const weekLabels = trendData.filter((_, i) => i % 3 === 0 || i === trendData.length - 1)

  const ChartContainer = ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <div className="rounded-xl border bg-white p-4" style={{ borderColor: '#e5e7eb' }}>
      <h4 className="text-xs font-bold text-gray-700 mb-2">{title}</h4>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" aria-label={title}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padL}
            y1={padT + innerH * (1 - frac)}
            x2={chartW - padR}
            y2={padT + innerH * (1 - frac)}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        ))}
        {children}
        {/* X-axis week labels */}
        {weekLabels.map((d) => {
          const i = trendData.indexOf(d)
          return (
            <text
              key={d.week}
              x={mapX(i)}
              y={chartH - 2}
              textAnchor="middle"
              className="fill-gray-400"
              style={{ fontSize: '8px' }}
            >
              W{d.week}
            </text>
          )
        })}
      </svg>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4" style={{ color: tileColor }} />
        <h3 className="text-lg font-bold text-gray-900">
          {viewMode === 'technical' ? 'Performance Telemetry' : 'Performance Trends'}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Resolution Rate + Escalation Rate */}
        <ChartContainer title="Resolution Rate & Escalation Rate">
          {/* Y-axis labels */}
          {yLabels(rateMin, rateMax, '%').map((l) => (
            <text
              key={l.val}
              x={padL - 4}
              y={l.y + 3}
              textAnchor="end"
              className="fill-gray-400"
              style={{ fontSize: '8px' }}
            >
              {l.val}
            </text>
          ))}
          {/* Resolution Rate line */}
          <path d={resPath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />
          {/* Escalation Rate line */}
          <path d={escPath} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" strokeDasharray="4 2" />
          {/* Dots */}
          {resRates.map((v, i) => {
            const y = padT + innerH - ((v - rateMin) / (rateMax - rateMin || 1)) * innerH
            return <circle key={`r-${i}`} cx={mapX(i)} cy={y} r={2.5} fill="#3b82f6" />
          })}
          {escRates.map((v, i) => {
            const y = padT + innerH - ((v - rateMin) / (rateMax - rateMin || 1)) * innerH
            return <circle key={`e-${i}`} cx={mapX(i)} cy={y} r={2} fill="#f59e0b" />
          })}
          {/* Legend */}
          <circle cx={padL + 4} cy={padT + 2} r={3} fill="#3b82f6" />
          <text x={padL + 10} y={padT + 5} className="fill-gray-500" style={{ fontSize: '7px' }}>Resolution %</text>
          <circle cx={padL + 72} cy={padT + 2} r={3} fill="#f59e0b" />
          <text x={padL + 78} y={padT + 5} className="fill-gray-500" style={{ fontSize: '7px' }}>Escalation %</text>
        </ChartContainer>

        {/* Interaction Volume */}
        <ChartContainer title="Interaction Volume (Weekly)">
          {yLabels(volMin, volMax, '').map((l) => (
            <text
              key={l.val}
              x={padL - 4}
              y={l.y + 3}
              textAnchor="end"
              className="fill-gray-400"
              style={{ fontSize: '8px' }}
            >
              {l.val}
            </text>
          ))}
          {volumes.map((v, i) => {
            const barW = (innerW / trendData.length) * 0.6
            const barH = (v / (volMax || 1)) * innerH
            const x = mapX(i) - barW / 2
            const y = padT + innerH - barH
            return (
              <rect
                key={`vol-${i}`}
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={2}
                fill={tileColor}
                opacity={0.6}
              />
            )
          })}
        </ChartContainer>

        {/* Average Resolution Time */}
        <ChartContainer title="Average Resolution Time">
          {yLabels(timeMin, timeMax, 's').map((l) => (
            <text
              key={l.val}
              x={padL - 4}
              y={l.y + 3}
              textAnchor="end"
              className="fill-gray-400"
              style={{ fontSize: '8px' }}
            >
              {l.val}
            </text>
          ))}
          <path d={timePath} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeLinejoin="round" />
          {resTimes.map((v, i) => {
            const y = padT + innerH - ((v - timeMin) / (timeMax - timeMin || 1)) * innerH
            return <circle key={`t-${i}`} cx={mapX(i)} cy={y} r={2.5} fill="#8b5cf6" />
          })}
        </ChartContainer>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function Monitoring() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const data = activeTileId ? getMonitoringData(activeTileId) : null

  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 })
  }, [activeTileId])

  if (!tile || !data) return null

  const tileColor = tile.color

  // Count issues by severity (defensive: fallback to empty array)
  const weeklyHealth = data.weeklyHealth ?? []
  const criticalCount = weeklyHealth.filter((d) => d.status === 'critical').length
  const warningCount = weeklyHealth.filter((d) => d.status === 'warning').length
  const healthyCount = weeklyHealth.filter((d) => d.status === 'healthy').length

  return (
    <div ref={containerRef} className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
      {/* Stage header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Production Monitoring
        </h2>
        <p className="text-sm text-gray-500">
          {`12-week production simulation — ${(data.landmines ?? []).length} landmines detected, ${(data.alerts ?? []).length} alerts triggered`}
        </p>
      </motion.div>

      {/* Explainer */}
      <MonitoringExplainer viewMode={viewMode} tileColor={tileColor} />

      {/* Stats banner */}
      <div className="mb-6">
        <StatsBanner stats={data.stats} tileColor={tileColor} viewMode={viewMode} />
      </div>

      {/* Health summary badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
          <span className="text-xs font-semibold text-green-700">{healthyCount} Healthy Weeks</span>
        </div>
        {warningCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-amber-700">{warningCount} Warnings</span>
          </div>
        )}
        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-red-700">{criticalCount} Critical</span>
          </div>
        )}
      </motion.div>

      {/* Drift & Dimension Alert Cards — 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <DriftDetectedCard drift={data.driftCard} tileColor={tileColor} viewMode={viewMode} />
        {(data.dimensionAlerts ?? [data.newDimensionCard]).map((dim, i) => (
          <NewDimensionDetectedCard key={dim.category ?? `dim-${i}`} dimension={dim} tileColor={tileColor} viewMode={viewMode} delay={0.3 + i * 0.1} />
        ))}
      </div>

      {/* Performance Trend Charts */}
      <div className="mb-8">
        <PerformanceTrendCharts trendData={data.trendData} tileColor={tileColor} viewMode={viewMode} />
      </div>

      {/* Weekly health timeline */}
      <div className="mb-8">
        <WeeklyTimeline health={weeklyHealth} tileColor={tileColor} />
      </div>

      {/* Landmines section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="mb-2"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
          <h3 className="text-lg font-bold text-gray-900">
            {viewMode === 'technical' ? 'Post-Launch Landmines' : 'Issues Discovered in Production'}
          </h3>
          <span className="text-xs font-semibold text-gray-400 ml-1">{(data.landmines ?? []).length} detected</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          {viewMode === 'technical'
            ? 'Edge cases and failure modes that only surface with real production traffic. Each landmine includes the detection week, severity, and applied resolution.'
            : 'These are problems that nobody predicted before launch. Real traffic reveals issues that testing cannot. Each one was detected, analyzed, and fixed.'}
        </p>
      </motion.div>

      <div className="space-y-3 mb-8">
        {(data.landmines ?? []).map((lm, i) => (
          <LandmineCardUI
            key={`${lm.title}-w${lm.week}`}
            landmine={lm}
            tileColor={tileColor}
            viewMode={viewMode}
            index={i}
          />
        ))}
      </div>

      {/* Alerts section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="mb-2"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-blue-500" aria-hidden="true" />
          <h3 className="text-lg font-bold text-gray-900">
            {viewMode === 'technical' ? 'System Alerts' : 'Monitoring Alerts'}
          </h3>
          <span className="text-xs font-semibold text-gray-400 ml-1">{(data.alerts ?? []).length} triggered</span>
        </div>
      </motion.div>

      <div className="space-y-2 mb-8">
        {(data.alerts ?? []).map((alert, i) => (
          <AlertRow
            key={`${alert.title}-w${alert.week}`}
            alert={alert}
            tileColor={tileColor}
            viewMode={viewMode}
            index={i}
          />
        ))}
      </div>

      {/* Competitive differentiator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="mb-8 text-center"
      >
        <p className="text-xs text-gray-400 italic">
          Most agent platforms stop at deployment. VibeModel monitors for drift, detects landmines, and responds with targeted component fixes in production.
        </p>
      </motion.div>
    </div>
  )
}
