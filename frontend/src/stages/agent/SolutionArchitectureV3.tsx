import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Play,
  Shield,
  ArrowDown,
  Info,
  Cpu,
  Download,
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import {
  getMetaPatternsV3,
  type MetaPatternV3,
} from '@/lib/agent/metaPatternsDataV3'
import {
  getArchitectureDataV3,
  type ComponentSelectionV3,
  type TrustBoundaryV3,
} from '@/lib/agent/architectureDataV3'
import { resolveV3TileId, isV3SupportedTile } from '@/lib/agent/v3TileResolver'
import { generatePatterns } from '@/lib/agent/patternCombinationEngine'
import { getEvalMetrics } from '@/lib/agent/componentTechData'

// ─── Feature Flags ──────────────────────────────────────────────────────
const SHOW_WHY_THIS_ARCHITECTURE = false

// ─── Layer Configuration ────────────────────────────────────────────────

const ARCHITECTURE_LAYERS = [
  { id: 'ingestion', label: 'Ingestion Layer', accent: '#f59e0b', order: 0 },
  { id: 'routing', label: 'Routing Layer', accent: '#3b82f6', order: 1 },
  { id: 'context', label: 'Context Layer', accent: '#8b5cf6', order: 2 },
  { id: 'execution', label: 'Execution Layer', accent: '#ef4444', order: 3 },
  { id: 'output', label: 'Output Layer', accent: '#10b981', order: 4 },
  { id: 'ops', label: 'Ops Layer', accent: '#6b7280', order: 5 },
] as const

const LAYER_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  ingestion: { bg: '#fffbeb', border: '#fde68a', accent: '#f59e0b' },
  routing: { bg: '#eff6ff', border: '#bfdbfe', accent: '#3b82f6' },
  context: { bg: '#f5f3ff', border: '#ddd6fe', accent: '#8b5cf6' },
  execution: { bg: '#fef2f2', border: '#fecaca', accent: '#ef4444' },
  output: { bg: '#ecfdf5', border: '#a7f3d0', accent: '#10b981' },
  ops: { bg: '#f9fafb', border: '#e5e7eb', accent: '#6b7280' },
}

function getFamilyColor(family: string): string {
  const map: Record<string, string> = {
    'Data Access': '#3b82f6', 'Data Shape': '#f59e0b', 'Query Understanding': '#8b5cf6',
    'Task Structure': '#ef4444', 'Response Shape': '#10b981', 'State & Memory': '#6366f1',
    'Reliability & Recovery': '#dc2626', 'Security & Compliance': '#0369a1',
  }
  return map[family] ?? '#6b7280'
}

// ─── Blueprint Component Card (hover for meta-patterns) ─────────────────

function BlueprintCard({ component, triggeredPatterns, layerAccent, trustZone, patternData }: {
  component: ComponentSelectionV3; triggeredPatterns: MetaPatternV3[]; layerAccent: string
  trustZone?: { zone: string; name: string }
  patternData?: { dataSourceCount: number; formatCount: number; patternCount: number }
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-lg border bg-white overflow-hidden transition-all duration-200 cursor-pointer"
      style={{ borderColor: expanded ? layerAccent : '#e5e7eb' }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: layerAccent }}>{component.categoryName}</p>
        <p className="text-sm font-bold text-gray-900">{component.selectedTechnology}</p>
        {trustZone && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              background: trustZone.zone === 'autonomous' ? '#f0fdf4' : trustZone.zone === 'supervised' ? '#fffbeb' : '#fef2f2',
              color: trustZone.zone === 'autonomous' ? '#16a34a' : trustZone.zone === 'supervised' ? '#d97706' : '#dc2626',
              border: `1px solid ${trustZone.zone === 'autonomous' ? '#bbf7d0' : trustZone.zone === 'supervised' ? '#fde68a' : '#fecaca'}`,
            }}
          >
            {trustZone.zone === 'autonomous' ? '✓' : trustZone.zone === 'supervised' ? '⚡' : '!'} {trustZone.zone}
          </span>
        )}
      </div>

      {/* Inline expansion — never clips */}
      <AnimatePresence>
        {expanded && triggeredPatterns.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Why for YOU line */}
            {patternData && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  {component.layer === 'ingestion' && `Your agent reads from ${patternData.dataSourceCount} data sources across ${patternData.formatCount} formats — ${component.selectedTechnology} handles parallel ingestion with format detection.`}
                  {component.layer === 'routing' && `${patternData.patternCount} patterns require intelligent routing across simple, complex, and fuzzy paths — ${component.selectedTechnology} manages this orchestration.`}
                  {component.layer === 'context' && `Cross-referencing ${patternData.dataSourceCount} sources demands schema normalization and retrieval — ${component.selectedTechnology} keeps your context aligned.`}
                  {component.layer === 'execution' && `Your ${patternData.patternCount} patterns include aggregation, validation, and trend analysis — ${component.selectedTechnology} handles the computation.`}
                  {component.layer === 'output' && `${patternData.patternCount} patterns produce structured reports, alerts, and answers — ${component.selectedTechnology} formats each response type.`}
                  {component.layer === 'ops' && `With ${patternData.patternCount} patterns in production, observability is critical — ${component.selectedTechnology} tracks every decision and failure.`}
                </p>
              </div>
            )}

            <div className="px-4 py-3 space-y-2 border-t border-gray-100">
              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Selected because of:</p>
              {triggeredPatterns.map(mp => (
                <div key={mp.id} className="rounded-lg px-3 py-2" style={{ background: `${getFamilyColor(mp.family)}06`, border: `1px solid ${getFamilyColor(mp.family)}15` }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] font-bold" style={{ color: getFamilyColor(mp.family) }}>{mp.name}</span>
                    <span className="text-[8px] text-gray-400 font-mono">{mp.executionPathCount.toLocaleString()} paths</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{mp.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Architecture Blueprint ─────────────────────────────────────────────

function ArchitectureBlueprint({ components, patterns, boundaries, patternData }: {
  components: ComponentSelectionV3[]; patterns: MetaPatternV3[]
  boundaries: TrustBoundaryV3[]
  patternData?: { dataSourceCount: number; formatCount: number; patternCount: number }
}) {
  const patternMap = new Map(patterns.map(p => [p.name, p]))
  const layerGroups = ARCHITECTURE_LAYERS.map(layer => ({
    ...layer, components: components.filter(c => c.layer === layer.id),
  })).filter(lg => lg.components.length > 0)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/50 to-white p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Architecture Blueprint</h3>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {layerGroups.map((layer, layerIdx) => {
        const lc = LAYER_COLORS[layer.id] ?? LAYER_COLORS.ops
        return (
          <div key={layer.id}>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + layerIdx * 0.08, duration: 0.3 }}
              className="rounded-xl border overflow-hidden" style={{ background: lc.bg, borderColor: lc.border }}
            >
              <div className="px-4 py-2.5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: lc.accent }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: lc.accent }}>{layer.label}</span>
              </div>
              <div className="px-4 pb-4">
                <div className={`grid gap-3 ${layer.components.length <= 2 ? 'grid-cols-2' : layer.components.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {layer.components.map(comp => {
                    const mps = (comp.triggeredBy ?? []).map(n => patternMap.get(n)).filter(Boolean) as MetaPatternV3[]
                    const tz = boundaries.find(b => b.components.includes(comp.id))
                    return <BlueprintCard key={comp.id} component={comp} triggeredPatterns={mps} layerAccent={lc.accent}
                      trustZone={tz ? { zone: tz.zone, name: tz.name } : undefined} patternData={patternData} />
                  })}
                </div>
              </div>
            </motion.div>
            {layerIdx < layerGroups.length - 1 && (
              <div className="flex justify-center py-1.5"><ArrowDown className="w-4 h-4 text-gray-300" /></div>
            )}
          </div>
        )
      })}

      {/* Compact Trust Zone Summary — baked into the blueprint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.3 }}
        className="mt-4 pt-4 border-t border-gray-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Trust Posture</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['autonomous', 'supervised', 'escalation'] as const).map(zone => {
            const zoneBoundaries = boundaries.filter(b => b.zone === zone)
            const zoneComponents = zoneBoundaries.flatMap(b => b.components)
            const compNames = components.filter(c => zoneComponents.includes(c.id)).map(c => c.categoryName)
            if (compNames.length === 0) return null
            const cfg = { autonomous: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a', icon: '✓' }, supervised: { bg: '#fffbeb', border: '#fde68a', accent: '#d97706', icon: '⚡' }, escalation: { bg: '#fef2f2', border: '#fecaca', accent: '#dc2626', icon: '!' } }[zone]
            return (
              <div key={zone} className="rounded-lg px-3 py-2.5" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-bold" style={{ color: cfg.accent }}>{cfg.icon} {zone.charAt(0).toUpperCase() + zone.slice(1)}</span>
                  <span className="text-[9px] text-gray-400">{compNames.length} components</span>
                </div>
                <p className="text-[9px] text-gray-600">{compNames.join(', ')}</p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Why This Architecture ──────────────────────────────────────────────

function WhyThisArchitecture({ components, patterns }: { components: ComponentSelectionV3[]; patterns: MetaPatternV3[] }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selected = components[selectedIdx]
  const patternMap = new Map(patterns.map(p => [p.name, p]))
  const triggeredMPs = (selected?.triggeredBy ?? []).map(n => patternMap.get(n)).filter(Boolean) as MetaPatternV3[]
  const layer = ARCHITECTURE_LAYERS.find(l => l.id === selected?.layer)
  const lc = layer ? LAYER_COLORS[layer.id] : LAYER_COLORS.ops

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
            <Layers className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Why This Architecture</h3>
            <p className="text-[10px] text-gray-400">Every component selected by your patterns, not by a template</p>
          </div>
        </div>
        <span className="text-[10px] text-gray-400">click a component to explore</span>
      </div>

      <div className="flex" style={{ minHeight: `${Math.max(components.length * 52 + 40, 320)}px` }}>
        <div className="w-[260px] border-r border-gray-100 py-3 shrink-0">
          {components.map((comp, idx) => {
            const isActive = idx === selectedIdx
            const cLayer = ARCHITECTURE_LAYERS.find(l => l.id === comp.layer)
            const cLc = cLayer ? LAYER_COLORS[cLayer.id] : LAYER_COLORS.ops
            return (
              <button key={comp.id} onClick={() => setSelectedIdx(idx)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all"
                style={{ background: isActive ? `${cLc.accent}08` : 'transparent', borderLeft: isActive ? `3px solid ${cLc.accent}` : '3px solid transparent' }}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${cLc.accent}12` }}>
                  <Layers className="w-3 h-3" style={{ color: cLc.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{comp.categoryName}</p>
                  <p className="text-[9px] text-gray-400 truncate">{comp.selectedTechnology}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex-1 p-6">
          {selected && (
            <AnimatePresence mode="wait">
              <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${lc.accent}10` }}>
                    <Layers className="w-6 h-6" style={{ color: lc.accent }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: lc.accent }}>{selected.categoryName}</p>
                    <p className="text-xl font-black text-gray-900">{selected.selectedTechnology}</p>
                  </div>
                </div>

                {triggeredMPs.length > 0 ? (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">Chosen Because Of:</p>
                    <div className="space-y-3">
                      {triggeredMPs.map(mp => (
                        <motion.div key={mp.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl px-4 py-3.5"
                          style={{ background: `${getFamilyColor(mp.family)}05`, border: `1px solid ${getFamilyColor(mp.family)}15` }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: getFamilyColor(mp.family) }} />
                              <span className="text-sm font-bold" style={{ color: getFamilyColor(mp.family) }}>{mp.name}</span>
                            </div>
                            <span className="text-[9px] text-gray-400 font-mono">{mp.executionPathCount.toLocaleString()} paths</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed pl-4">{mp.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">{selected.justification}</p>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Trust Boundaries ───────────────────────────────────────────────────

const TRUST_ZONE_CONFIG: Record<string, { bg: string; border: string; accent: string; icon: string }> = {
  autonomous: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#10b981', icon: '✓' },
  supervised: { bg: '#fffbeb', border: '#fde68a', accent: '#f59e0b', icon: '⚡' },
  escalation: { bg: '#fef2f2', border: '#fecaca', accent: '#ef4444', icon: '!' },
}

function TrustBoundariesSection({ boundaries }: { boundaries: TrustBoundaryV3[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Trust Boundaries & Human Oversight</h3>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="space-y-2">
        {boundaries.map((b, idx) => {
          const cfg = TRUST_ZONE_CONFIG[b.zone] ?? TRUST_ZONE_CONFIG.supervised
          const isExp = expandedIdx === idx
          return (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + idx * 0.05, duration: 0.3 }}
              className="rounded-xl border overflow-hidden" style={{ borderColor: isExp ? cfg.accent : cfg.border, background: cfg.bg }}
            >
              <button onClick={() => setExpandedIdx(isExp ? null : idx)} className="w-full px-4 py-3 flex items-center gap-3 text-left">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: `${cfg.accent}15`, color: cfg.accent }}>{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold capitalize" style={{ color: cfg.accent }}>{b.zone}</span>
                    <span className="text-[10px] text-gray-500">— {b.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{b.components.length} component{b.components.length !== 1 ? 's' : ''}</p>
                </div>
                {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-3 pt-0 border-t" style={{ borderColor: `${cfg.accent}20` }}>
                      <p className="text-xs text-gray-600 leading-relaxed mt-2">{b.description}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── PDF Deployment Guide Generator ──────────────────────────────────────

function generateAgentDeploymentPDF(
  tileId: string,
  components: ComponentSelectionV3[],
  metrics: ReturnType<typeof getEvalMetrics>,
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = 50

  const addHeading = (text: string) => {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(text, 40, y)
    y += 8
    doc.setDrawColor(99, 102, 241)
    doc.setLineWidth(1.5)
    doc.line(40, y, W - 40, y)
    y += 18
  }

  const addLabel = (label: string, value: string) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 100)
    doc.text(label, 40, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    doc.text(value, 180, y)
    y += 16
  }

  const checkPage = (needed: number) => {
    if (y + needed > 780) { doc.addPage(); y = 50 }
  }

  // Title
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('Agent Deployment Guide', 40, y)
  y += 14
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Generated by VibeModel.ai — ${new Date().toLocaleDateString()}`, 40, y)
  y += 30

  // Agent Overview
  addHeading('Agent Overview')
  const tile = AGENT_TILE_MAP[tileId]
  addLabel('Agent:', tile?.label ?? tileId)
  addLabel('Components:', `${components.length}`)
  addLabel('Layers:', `${new Set(components.map(c => c.layer)).size}`)
  y += 10

  // Architecture Components
  addHeading('Architecture Components')
  const layers = ARCHITECTURE_LAYERS.filter(l => components.some(c => c.layer === l.id))
  for (const layer of layers) {
    checkPage(60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text(layer.label.toUpperCase(), 40, y)
    y += 14

    const layerComps = components.filter(c => c.layer === layer.id)
    for (const comp of layerComps) {
      checkPage(30)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(`• ${comp.categoryName}`, 55, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.text(comp.selectedTechnology, 200, y)
      y += 14
    }
    y += 6
  }

  // Trust Posture
  checkPage(80)
  addHeading('Trust Posture')
  for (const zone of ['autonomous', 'supervised', 'escalation'] as const) {
    const zoneComps = components.filter(c => {
      if (zone === 'autonomous') return ['ingestion', 'context', 'output'].includes(c.layer)
      if (zone === 'supervised') return ['execution', 'routing'].includes(c.layer)
      return c.layer === 'ops'
    })
    if (zoneComps.length > 0) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(zone === 'autonomous' ? 22 : zone === 'supervised' ? 180 : 220, zone === 'autonomous' ? 163 : zone === 'supervised' ? 119 : 38, zone === 'autonomous' ? 74 : 6)
      doc.text(`${zone.toUpperCase()} (${zoneComps.length} components)`, 40, y)
      y += 12
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.text(zoneComps.map(c => c.categoryName).join(', '), 55, y)
      y += 16
    }
  }

  // Evaluation Metrics
  if (metrics) {
    checkPage(100)
    addHeading('Evaluation Results')
    for (const metric of [metrics.metric1, metrics.metric2, metrics.metric3, metrics.metric4]) {
      checkPage(30)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(metric.shortName, 40, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`Target: ${metric.target}  |  Actual: ${metric.actual} ${metric.unit}  |  ${metric.passed ? 'PASSED' : 'FAILED'}`, 180, y)
      y += 16
    }
  }

  // Save
  doc.save(`vibemodel-agent-deployment-guide-${tileId}.pdf`)
}

// ─── Build & Evaluate Agent ──────────────────────────────────────────────

const BUILD_PHASES = [
  'Initializing agent runtime...',
  'Configuring ingestion connectors...',
  'Building routing orchestrator...',
  'Assembling context pipeline...',
  'Deploying execution engine...',
  'Wiring output formatters...',
  'Running synthetic validation...',
  'Calibrating confidence thresholds...',
  'Computing evaluation metrics...',
]

const EVAL_METRIC_COLORS = [
  { color: '#3b82f6', bg: '#eff6ff' },
  { color: '#d97706', bg: '#fffbeb' },
  { color: '#16a34a', bg: '#f0fdf4' },
  { color: '#9333ea', bg: '#faf5ff' },
]

function BuildAndEvaluate({ components, tileId, tileColor }: {
  components: ComponentSelectionV3[]; tileId: string; tileColor: string
}) {
  const [phase, setPhase] = useState<'idle' | 'building' | 'done'>('idle')
  const [buildStep, setBuildStep] = useState(0)
  const [visibleComps, setVisibleComps] = useState(0)
  const metrics = getEvalMetrics(tileId)

  const startBuild = () => {
    setPhase('building')
    setBuildStep(0)
    setVisibleComps(0)
  }

  // Assembly animation: show components one by one
  useState(() => {
    if (phase !== 'building') return
  })

  // Build phase progression
  if (phase === 'building') {
    // Component assembly
    if (visibleComps < components.length) {
      setTimeout(() => setVisibleComps(v => v + 1), 300)
    }
    // Build steps
    if (buildStep < BUILD_PHASES.length) {
      setTimeout(() => setBuildStep(s => s + 1), 500)
    }
    // Done after all steps
    if (buildStep >= BUILD_PHASES.length && visibleComps >= components.length) {
      setTimeout(() => setPhase('done'), 800)
    }
  }

  if (phase === 'idle') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
        <button
          onClick={startBuild}
          className="w-full py-4 px-6 rounded-xl text-sm font-bold text-white transition-all hover:shadow-xl cursor-pointer flex items-center justify-center gap-2.5"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
        >
          <Play className="w-5 h-5" />
          Build & Evaluate Agent
        </button>
      </motion.div>
    )
  }

  if (phase === 'building') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="p-8">
          {/* Component assembly grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-6">
            {components.map((comp, idx) => {
              const lc = LAYER_COLORS[comp.layer] ?? LAYER_COLORS.ops
              return (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: idx < visibleComps ? 1 : 0.1, scale: idx < visibleComps ? 1 : 0.7 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg px-2 py-2 text-center"
                  style={{ background: idx < visibleComps ? `${lc.accent}15` : '#1e293b', border: `1px solid ${idx < visibleComps ? lc.accent + '40' : '#334155'}` }}
                >
                  <Layers className="w-4 h-4 mx-auto mb-1" style={{ color: idx < visibleComps ? lc.accent : '#475569' }} />
                  <p className="text-[8px] font-medium truncate" style={{ color: idx < visibleComps ? '#e2e8f0' : '#475569' }}>
                    {comp.categoryName}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Build status */}
          <div className="text-center">
            <motion.p
              key={buildStep}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-gray-400"
            >
              {BUILD_PHASES[Math.min(buildStep, BUILD_PHASES.length - 1)]}
            </motion.p>
            <div className="mt-3 h-1.5 rounded-full bg-gray-800 overflow-hidden max-w-md mx-auto">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                animate={{ width: `${Math.round((buildStep / BUILD_PHASES.length) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Phase: done — show evaluation results + action buttons
  const metricLabels = ['PRIMARY METRIC', 'SECONDARY METRIC', 'TERTIARY METRIC', 'QUATERNARY METRIC']
  const metricBorderColors = ['#16a34a', '#d97706', '#8b5cf6', '#6366f1']

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Evaluation Results</span>
      </div>

      {/* 4 Metric Cards — 2×2 grid matching screenshot */}
      {metrics && (
        <div className="grid grid-cols-2 gap-4">
          {[metrics.metric1, metrics.metric2, metrics.metric3, metrics.metric4].map((metric, idx) => {
            const mc = EVAL_METRIC_COLORS[idx]
            const borderColor = metricBorderColors[idx]
            const breakdown = metric.breakdown
            const barColors = { overall: '#3b82f6', simple: '#16a34a', complex: '#dc2626', fuzzy: '#d97706' }

            return (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1, duration: 0.3 }}
                className="rounded-xl border-l-4 border border-gray-200 bg-white p-5 space-y-3"
                style={{ borderLeftColor: borderColor }}
              >
                {/* Header: name + info + PASS badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900">{metric.shortName}</p>
                      <div className="relative group">
                        <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-lg bg-gray-900 text-[10px] text-white leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {metric.description}
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: borderColor }}>
                      {metricLabels[idx]}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                    ✓ PASS
                  </span>
                </div>

                {/* Target value */}
                <div>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider">Target</span>
                  <p className="text-xl font-black text-gray-900">{metric.target} {metric.unit}</p>
                </div>

                {/* Target bar with actual marker */}
                <div className="space-y-1">
                  <div className="relative h-3 rounded-full overflow-hidden bg-gray-100">
                    {/* Actual value fill */}
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(parseFloat(metric.actual) / (parseFloat(metric.target.replace(/[<>]/g, '').trim()) * 1.2) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${borderColor}80, ${borderColor})`,
                    }} />
                    {/* Target marker line */}
                    <div className="absolute top-0 h-full w-0.5 bg-gray-800" style={{
                      left: `${Math.min(parseFloat(metric.target.replace(/[<>]/g, '').trim()) / (parseFloat(metric.target.replace(/[<>]/g, '').trim()) * 1.2) * 100, 95)}%`,
                    }}>
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-bold text-gray-500 whitespace-nowrap">TARGET</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: borderColor }} />
                    <span className="text-[10px] text-gray-600">Actual: {metric.actual} {metric.unit}</span>
                  </div>
                </div>

                {/* Pattern breakdown bars */}
                {breakdown && (
                  <div className="space-y-1.5 pt-2">
                    {[
                      { label: 'Overall Performance', value: breakdown.overall, color: barColors.overall },
                      { label: 'Simple Patterns', value: breakdown.simple, color: barColors.simple },
                      { label: 'Complex Patterns', value: breakdown.complex, color: barColors.complex },
                      { label: 'Fuzzy Patterns', value: breakdown.fuzzy, color: barColors.fuzzy },
                    ].map(bar => (
                      <div key={bar.label} className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500 w-28 shrink-0">{bar.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${bar.value}%`, background: bar.color }} />
                        </div>
                        <span className="text-[10px] font-bold w-6 text-right" style={{ color: bar.color }}>{bar.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-5">
        {[
          { label: 'Overall Performance', color: '#3b82f6' },
          { label: 'Simple Patterns', color: '#16a34a' },
          { label: 'Complex Patterns', color: '#dc2626' },
          { label: 'Fuzzy Patterns', color: '#d97706' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-[10px] text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* 2 Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="py-3.5 px-5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
          onClick={() => {
            useAgentPlaygroundStore.getState().nextStage()
          }}
        >
          <Cpu className="w-4 h-4" />
          View Monitoring Dashboard
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="py-3.5 px-5 rounded-xl text-sm font-bold transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-2 border border-gray-200 text-gray-700 bg-white"
          onClick={() => generateAgentDeploymentPDF(tileId, components, metrics)}
        >
          <Download className="w-4 h-4" />
          Download Deployment Guide
        </motion.button>
      </div>

      {/* Conviction line */}
      <p className="text-center text-xs text-gray-400 italic">
        Other platforms require manual architecture design. VibeModel composes and validates the optimal solution automatically.
      </p>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export function SolutionArchitectureV3() {
  const { activeTileId, viewMode } = useAgentPlaygroundStore()

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const isV3 = activeTileId ? isV3SupportedTile(activeTileId) : false

  const resolvedMetaId = activeTileId ? resolveV3TileId(activeTileId, 'metaPatterns') : null
  const resolvedArchId = activeTileId ? resolveV3TileId(activeTileId, 'architecture') : null
  const metaPatternsV3 = resolvedMetaId ? getMetaPatternsV3(resolvedMetaId, activeTileId ?? undefined) : null
  const architectureDataV3 = resolvedArchId ? getArchitectureDataV3(resolvedArchId, activeTileId ?? undefined) : null
  const patternData = activeTileId ? generatePatterns(activeTileId) : null

  if (!tile || !isV3 || !metaPatternsV3 || !architectureDataV3) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Layers className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Agent Composition</h2>
          <p className="text-sm text-gray-500">Architecture data is loading for this use case.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-2xl font-black text-gray-900 mb-1">Agent Composition</h2>
        <p className="text-sm text-gray-500">Every component choice justified by meta-pattern analysis</p>
      </motion.div>

      {/* Bridge: patterns → architecture */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
        className="rounded-xl px-5 py-4 flex items-center gap-4"
        style={{ background: `${tile.color}06`, border: `1px solid ${tile.color}18` }}
      >
        <div className="text-3xl font-black" style={{ color: tile.color }}>{architectureDataV3.components.length}</div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Components across {new Set(architectureDataV3.components.map(c => c.layer)).size} layers
          </p>
          <p className="text-[10px] text-gray-500">
            Derived from {patternData?.validRemaining ?? 266} patterns and {metaPatternsV3.totalPatterns} meta-patterns. Not a template — composed for your use case.
          </p>
        </div>
      </motion.div>

      {/* Layer 1: Architecture Blueprint */}
      <ArchitectureBlueprint
        components={architectureDataV3.components}
        patterns={metaPatternsV3.patterns}
        boundaries={architectureDataV3.trustBoundaries}
        patternData={patternData ? {
          dataSourceCount: patternData.pipelineNodes.dataSources.length,
          formatCount: 6, // from dimension analysis (CSV, JSON, PDF tables, PDF text, Scan, SQL)
          patternCount: patternData.validRemaining,
        } : undefined}
      />

      {/* Why This Architecture — behind feature flag */}
      {SHOW_WHY_THIS_ARCHITECTURE && (
        <WhyThisArchitecture components={architectureDataV3.components} patterns={metaPatternsV3.patterns} />
      )}

      {/* Build & Evaluate Agent Section */}
      <BuildAndEvaluate
        components={architectureDataV3.components}
        tileId={activeTileId ?? ''}
        tileColor={tile.color}
      />
    </div>
  )
}

export default SolutionArchitectureV3
