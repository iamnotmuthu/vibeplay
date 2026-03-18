'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  GitBranch,
  Database,
  Users,
  Layers,
  ArrowRight,
  BookOpen,
  Target,
  ChevronDown,
} from 'lucide-react'
import { AgentTooltip } from '@/components/agent/AgentTooltip'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { AGENT_TILE_MAP } from '@/lib/agent/agentDomainData'
import { getDimensionAnalysisData } from '@/lib/agent/dimensionAnalysisData'
import { getDimensionAnalysisDataV3 } from '@/lib/agent/dimensionAnalysisDataV3'
import { isV3SupportedTile, resolveV3TileId } from '@/lib/agent/v3TileResolver'
import { getContextDefinitionDataV3 } from '@/lib/agent/contextDefinitionDataV3'
import { getStructuralDiscoveries, getRiskTierSummary } from '@/lib/agent/structuralDiscoveryDataV3'
import type {
  TaskDimension,
  DataDimension,
  OutputDimension,
  ToolDimension,
} from '@/store/agentTypes'
import { DIMENSION_COLORS } from '@/store/agentTypes'
import type { StructuralDiscovery, RiskTierSummary } from '@/lib/agent/structuralDiscoveryDataV3'

// ─── Tab Definitions ──────────────────────────────────────────────────────────

type DimensionTab = 'task' | 'data' | 'output' | 'tool'

interface TabDef {
  id: DimensionTab
  label: string
  icon: React.ElementType
  goalLink: string
  dimensionColor: string
}

const TABS: TabDef[] = [
  { id: 'task', label: 'Task Dimensions', icon: Target, goalLink: 'What the agent does', dimensionColor: DIMENSION_COLORS.task.primary },
  { id: 'data', label: 'Data Dimensions', icon: Database, goalLink: 'What the agent knows', dimensionColor: DIMENSION_COLORS.data.primary },
  { id: 'output', label: 'Response Dimensions', icon: Users, goalLink: 'What the agent produces', dimensionColor: DIMENSION_COLORS.output.primary },
  { id: 'tool', label: 'Tool Dimensions', icon: Layers, goalLink: 'How the agent operates', dimensionColor: DIMENSION_COLORS.tool.primary },
]

const CONFIDENCE_META: Record<
  'high' | 'medium' | 'low',
  { label: string; color: string; bg: string; border: string; tooltipTitle: string; tooltipContent: string }
> = {
  high: {
    label: 'High',
    color: '#166534',
    bg: '#dcfce7',
    border: '#86efac',
    tooltipTitle: 'High Intent Confidence',
    tooltipContent: 'The engine can reliably detect and classify this task dimension from user input.',
  },
  medium: {
    label: 'Medium',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fde047',
    tooltipTitle: 'Medium Intent Confidence',
    tooltipContent: 'The engine can usually detect this task dimension, but some inputs may be ambiguous.',
  },
  low: {
    label: 'Low',
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fca5a5',
    tooltipTitle: 'Low Intent Confidence',
    tooltipContent: 'This dimension is difficult to detect from user input alone.',
  },
}



const panelVariants: Variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

// ─── Depth Meter ──────────────────────────────────────────────────────────────

function DepthMeter({ depth, maxDepth = 5, color }: { depth: number; maxDepth?: number; color?: string }) {
  const fillColor = color ?? DIMENSION_COLORS.data.primary
  return (
    <div className="flex items-center gap-1" role="meter" aria-label={`Depth: ${depth} out of ${maxDepth}`}>
      {Array.from({ length: maxDepth }, (_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-sm transition-colors"
          style={{ background: i < depth ? fillColor : '#e5e7eb' }}
        />
      ))}
      <span className="text-[10px] text-gray-400 ml-1">{depth}/{maxDepth}</span>
    </div>
  )
}

function GoalRibbon({ text, accentColor }: { text: string; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium"
      style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}15`, color: accentColor }}
    >
      <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </motion.div>
  )
}

// ─── Tab Bar ───────────────────────────────────────────────────────────────────

function TabBar({
  tabs,
  activeTab,
  onTabChange,
  accentColor,
  counts,
}: {
  tabs: TabDef[]
  activeTab: DimensionTab
  onTabChange: (tab: DimensionTab) => void
  accentColor: string
  counts: Record<DimensionTab, number>
}) {
  return (
    <div className="flex gap-4 border-b border-gray-200 pb-0">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            id={`dim-tab-${tab.id}`}
            aria-selected={isActive}
            className="pb-3 px-1 text-sm font-medium transition-colors relative"
            style={{ color: isActive ? tab.dimensionColor : '#6b7280' }}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${tab.dimensionColor}10`,
                  color: tab.dimensionColor,
                }}
              >
                {counts[tab.id]}
              </span>
            </div>
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: tab.dimensionColor }}
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Dimension Cards (from existing ContextDimensions.tsx) ────────────────────

function TaskDimensionCard({
  dim,
  delay,
  viewMode,
}: {
  dim: TaskDimension
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const conf = CONFIDENCE_META[dim.confidence]
  const dc = DIMENSION_COLORS.task

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: dc.medium }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: dc.light }}>
            <Target className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.label}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.id}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">{dim.description}</p>
          </div>
        </div>
        <AgentTooltip title={conf.tooltipTitle} content={conf.tooltipContent}>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 cursor-help"
            style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}
          >
            {conf.label}
          </span>
        </AgentTooltip>
      </div>

      <div className="ml-[42px] mt-2 space-y-2.5">
        {viewMode === 'technical' && dim.parentTaskId && (
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3 h-3 text-gray-400 shrink-0" aria-hidden="true" />
            <span className="text-[10px] text-gray-400">Parent:</span>
            <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{dim.parentTaskId}</span>
          </div>
        )}

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Intent Categories</p>
          <div className="flex flex-wrap gap-1">
            {dim.intentCategories.map((cat) => (
              <span key={cat} className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Phase 1: Production Data Dimensions — 3-Section Layout ──────────────────
// Section 1: Sample Documents (tabbed data previews per format)
// Section 2: What The Data Means (entity cards with extraction method tags)
// Section 3: How The Data Arrives (format type cards)

interface SampleDocTab {
  id: string
  label: string
  formatType: string
  formatBadge: string
  formatColor: string
  columns: { header: string; subheader?: string; highlighted?: boolean }[]
  rows: string[][]
  totalRows?: string
  footer?: { label: string; text: string; color: string }
  toolsNeeded: string[]
}

interface EntityCard {
  name: string
  description: string
  extractedVia: ('TEXT' | 'TABLE')[]
  examples: string[]
  type: 'ENTITY' | 'TEMPORAL' | 'RELATIONSHIP'
}

interface FormatTypeCard {
  badge: string
  badgeColor: string
  badgeBg: string
  label: string
  description: string
}

// ─── Invoice Processing Data (Phase 1) ─────────────────────────────────

const SAMPLE_DOCS: Record<string, SampleDocTab[]> = {
  'doc-intelligence': [
    {
      id: 'aws-csv', label: 'AWS Invoice', formatType: 'CSV', formatBadge: 'CSV', formatColor: '#059669',
      columns: [
        { header: 'bill/PayerAccountId', subheader: 'VENDOR IDENTITY', highlighted: true },
        { header: 'bill/InvoiceId', subheader: 'INVOICE METADATA', highlighted: true },
        { header: 'lineItem/UsageStartDate', subheader: 'SERVICE PERIOD', highlighted: true },
        { header: 'product/ProductName' },
        { header: 'lineItem/UsageType' },
        { header: 'lineItem/UnblendedCost', subheader: 'AMOUNTS & TOTALS', highlighted: true },
      ],
      rows: [
        ['123456789012', 'INV-2024-00847', '2025-02-01', 'Amazon EC2', 'USW2-BoxUsage:m5.xlarge', '$86.40'],
        ['123456789012', 'INV-2024-00847', '2025-02-03', 'Amazon S3', 'USW2-TimedStorage-ByteHrs', '$11.50'],
        ['471829305614', 'INV-2024-00847', '2025-02-07', 'CloudFront', 'USW2-DataTransfer-Out', '$102.00'],
        ['471829305614', 'INV-2024-00851', '2025-02-14', 'Amazon RDS', 'USW2-InstanceUsage:db.r5.lg', '$68.40'],
        ['839201746582', 'INV-2024-00851', '2025-02-19', 'AWS Lambda', 'USW2-Lambda-GB-Second', '$1,040.00'],
      ],
      totalRows: '212,847',
      footer: { label: 'CREDITS & ADJUSTMENTS', text: 'RI Savings Plan discount applied: -$1,240.00  |  Net total: $12,847.23', color: '#059669' },
      toolsNeeded: ['CSV Parser', 'Schema Mapper'],
    },
    {
      id: 'staples-pdf', label: 'Staples Invoice', formatType: 'PDF', formatBadge: 'PDF', formatColor: '#dc2626',
      columns: [
        { header: 'Item' }, { header: 'Description' }, { header: 'Qty' }, { header: 'Unit Price' }, { header: 'Total' },
      ],
      rows: [
        ['Copy Paper A4', 'Staples Multipurpose', '50 reams', '$4.99', '$249.50'],
        ['Ink Cartridge', 'HP 61XL Black', '12', '$24.99', '$299.88'],
        ['Sticky Notes', '3x3 Yellow 100-pack', '24', '$3.49', '$83.76'],
      ],
      footer: { label: 'TOTALS', text: 'Subtotal: $633.14  |  Tax (8%): $50.65  |  Total: $683.79', color: '#dc2626' },
      toolsNeeded: ['PDF Parser', 'OCR Engine'],
    },
    {
      id: 'gcp-json', label: 'GCP Billing Export', formatType: 'JSON', formatBadge: 'JSON', formatColor: '#7c3aed',
      columns: [
        { header: 'service.description' }, { header: 'sku.description' }, { header: 'project.id' }, { header: 'usage.amount' }, { header: 'cost' },
      ],
      rows: [
        ['Compute Engine', 'N1 Standard Instance', 'vibemodel-prod', '720 hrs', '$52.56'],
        ['Cloud Storage', 'Regional Standard', 'vibemodel-data', '2.4 TB', '$48.00'],
        ['BigQuery', 'Analysis Bytes', 'vibemodel-analytics', '15.2 TB scanned', '$76.00'],
      ],
      toolsNeeded: ['JSON Parser', 'Schema Flattener'],
    },
    {
      id: 'po-sql', label: 'Purchase Order Record', formatType: 'SQL', formatBadge: 'SQL', formatColor: '#0369a1',
      columns: [
        { header: 'po_number' }, { header: 'vendor_name' }, { header: 'approved_amount' }, { header: 'status' }, { header: 'category' },
      ],
      rows: [
        ['PO-2024-0847', 'Amazon Web Services', '$15,000.00', 'approved', 'compute'],
        ['PO-2024-0851', 'Google Cloud Platform', '$12,000.00', 'approved', 'data'],
        ['PO-2024-0923', 'Staples Inc.', '$8,500.00', 'pending', 'supplies'],
      ],
      toolsNeeded: ['SQL Connector'],
    },
    {
      id: 'scan-legacy', label: 'Scanned Legacy Invoice', formatType: 'Scan', formatBadge: 'Scan', formatColor: '#d97706',
      columns: [
        { header: 'Extracted Field' }, { header: 'Value' }, { header: 'Confidence' },
      ],
      rows: [
        ['Invoice Number', 'INV-2021-0034', '94%'],
        ['Vendor', 'Staples Inc.', '91%'],
        ['Total Amount', '$2,847.00', '88%'],
        ['Date', 'Mar 15, 2021', '96%'],
      ],
      toolsNeeded: ['OCR Engine', 'Confidence Scorer'],
    },
  ],
}

const ENTITY_CARDS_DATA: Record<string, EntityCard[]> = {
  'doc-intelligence': [
    { name: 'Vendor Identity', description: 'Who sent the invoice — company name, address, tax ID, account number', extractedVia: ['TEXT'], examples: ['Amazon Web Services, Inc.', 'Google Cloud Platform'], type: 'ENTITY' },
    { name: 'Invoice Metadata', description: 'Invoice number, date issued, due date, account reference, billing period', extractedVia: ['TEXT'], examples: ['INV-2024-00847', '2025-02-28'], type: 'ENTITY' },
    { name: 'Line Items', description: 'Each service or product billed — with description, quantity, unit price, and subtotal', extractedVia: ['TABLE', 'TEXT'], examples: ['EC2 On-Demand — 720 hrs — $0.12/hr — $86.40', 'Copy Paper A4 — 50 reams — $4.99 — $249.50'], type: 'ENTITY' },
    { name: 'Amounts & Totals', description: 'Subtotals, tax, discounts, credits, and grand total for the invoice', extractedVia: ['TEXT', 'TABLE'], examples: ['Subtotal: $4,192.00', 'Tax (8%): $335.36'], type: 'ENTITY' },
    { name: 'Service Period', description: 'Time range the charges cover — billing cycle start/end, usage dates', extractedVia: ['TEXT'], examples: ['Feb 1 — Feb 28, 2025', 'Usage: 2025-02-01 to 2025-02-28'], type: 'TEMPORAL' },
    { name: 'Purchase Order Reference', description: 'PO numbers, approval chains, and budget codes that link invoices to approved purchases', extractedVia: ['TEXT'], examples: ['PO-2024-0847', 'Budget Code: INFRA-CLOUD-Q1'], type: 'RELATIONSHIP' },
    { name: 'Credits & Adjustments', description: 'Discounts, credit memos, reserved instance savings, refunds — negative amounts that offset charges', extractedVia: ['TEXT', 'TABLE'], examples: ['RI Savings: -$1,240.00', 'Credit Memo CM-2024-012'], type: 'ENTITY' },
    { name: 'Payment Terms', description: 'How and when to pay — payment method, due date, late fees, wire instructions', extractedVia: ['TEXT'], examples: ['Net 30', 'ACH Wire Transfer'], type: 'ENTITY' },
  ],
}

const FORMAT_CARDS_DATA: Record<string, FormatTypeCard[]> = {
  'doc-intelligence': [
    { badge: 'TABLE', badgeColor: '#0369a1', badgeBg: '#e0f2fe', label: 'CSV / Tabular', description: 'Structured rows and columns — AWS Cost & Usage Reports exported as CSV with 50+ columns per row' },
    { badge: 'JSON', badgeColor: '#7c3aed', badgeBg: '#ede9fe', label: 'JSON / Hierarchical', description: 'Nested JSON from GCP BigQuery billing exports — deep hierarchy with service/SKU/project nesting' },
    { badge: 'DOC', badgeColor: '#d97706', badgeBg: '#fef3c7', label: 'PDF with Tables', description: 'Staples invoices with well-structured tables — consistent headers, line item grids, printable format' },
    { badge: 'DOC', badgeColor: '#d97706', badgeBg: '#fef3c7', label: 'PDF Text / Narrative', description: 'Invoices with freeform text and paragraph-style billing — amounts embedded in prose, no clear table structure' },
    { badge: 'IMG', badgeColor: '#dc2626', badgeBg: '#fee2e2', label: 'Scanned Image (OCR)', description: 'Image-only PDFs from legacy archives and handwritten annotations — requires OCR before any extraction' },
    { badge: 'SQL', badgeColor: '#059669', badgeBg: '#d1fae5', label: 'SQL / Relational', description: 'Purchase order database with normalized tables — joins across PO headers, line items, and vendor master' },
  ],
}

const EXTRACT_TAG_COLORS: Record<string, { bg: string; color: string }> = {
  TEXT: { bg: '#dbeafe', color: '#1d4ed8' },
  TABLE: { bg: '#ede9fe', color: '#6d28d9' },
}

const TYPE_TAG_COLORS: Record<string, { bg: string; color: string }> = {
  ENTITY: { bg: '#f3f4f6', color: '#374151' },
  TEMPORAL: { bg: '#d1fae5', color: '#065f46' },
  RELATIONSHIP: { bg: '#fee2e2', color: '#991b1b' },
}

function ProductionDataDimensions({ tileId, delay }: { tileId: string; delay: number }) {
  const docs = SAMPLE_DOCS[tileId]
  const entities = ENTITY_CARDS_DATA[tileId]
  const formats = FORMAT_CARDS_DATA[tileId]
  const [activeDocIdx, setActiveDocIdx] = useState(0)
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null)

  if (!docs || !entities || !formats) return null
  const activeDoc = docs[activeDocIdx]

  return (
    <div className="space-y-8">
      {/* Section 1: Sample Documents */}
      <div className="space-y-4">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sample Documents</p>
          <p className="text-xs text-gray-500 mt-0.5">What your agent actually reads. Switch between sources to see how the same information looks in different formats.</p>
        </div>

        {/* Format tabs */}
        <div className="flex gap-2 flex-wrap">
          {docs.map((doc, idx) => (
            <button
              key={doc.id}
              onClick={() => setActiveDocIdx(idx)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{
                borderColor: idx === activeDocIdx ? doc.formatColor : '#e5e7eb',
                background: idx === activeDocIdx ? `${doc.formatColor}08` : 'white',
                color: idx === activeDocIdx ? doc.formatColor : '#6b7280',
              }}
            >
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: idx === activeDocIdx ? `${doc.formatColor}15` : '#f3f4f6', color: idx === activeDocIdx ? doc.formatColor : '#9ca3af' }}>
                {doc.formatBadge}
              </span>
              {doc.label}
            </button>
          ))}
        </div>

        {/* Format-specific document preview (Phase 2) */}
        <motion.div key={activeDocIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-mono ml-1">
              {activeDoc.id.replace(/-/g, '_')} — {activeDoc.totalRows ?? activeDoc.rows.length} rows
            </span>
          </div>

          {/* CSV: Spreadsheet-style with colored headers and cell grid */}
          {activeDoc.formatType === 'CSV' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{ background: `${activeDoc.formatColor}08` }}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-mono text-gray-400 border-r border-b border-gray-200 w-8">#</th>
                    {activeDoc.columns.map((col, i) => {
                      const isHighlighted = hoveredEntity && col.subheader && col.subheader.toUpperCase().includes(hoveredEntity.toUpperCase().split(' ')[0])
                      return (
                        <th key={i} className="px-3 py-2.5 text-left border-r border-b border-gray-200 last:border-r-0 transition-colors duration-200" style={{ background: isHighlighted ? `${DIMENSION_COLORS.data.primary}12` : undefined }}>
                          {col.highlighted && col.subheader && (
                            <span className="text-[8px] font-bold uppercase tracking-wider block" style={{ color: isHighlighted ? DIMENSION_COLORS.data.primary : activeDoc.formatColor }}>{col.subheader}</span>
                          )}
                          <span className="block text-[10px] font-mono text-gray-600 font-semibold">{col.header}</span>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {activeDoc.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-2 text-[10px] text-gray-300 font-mono border-r border-b border-gray-100 bg-gray-50/50">{rIdx + 1}</td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-[11px] text-gray-700 font-mono whitespace-nowrap border-r border-b border-gray-100 last:border-r-0">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {activeDoc.totalRows && (
                <div className="px-4 py-1.5 text-center text-[10px] text-gray-400 border-t border-gray-100">... {activeDoc.totalRows} more rows</div>
              )}
            </div>
          )}

          {/* PDF: Invoice document style with header + table + totals */}
          {activeDoc.formatType === 'PDF' && (
            <div className="p-5 space-y-4" style={{ background: '#fafafa' }}>
              {/* Invoice header */}
              <div className="flex items-start justify-between pb-3 border-b-2 border-gray-300">
                <div>
                  <p className="text-lg font-black text-gray-900">INVOICE</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Staples Business Advantage</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500">Invoice #: <span className="font-mono font-semibold text-gray-700">INV-2025-0847</span></p>
                  <p className="text-[10px] text-gray-500">Date: <span className="font-mono text-gray-700">Feb 15, 2025</span></p>
                </div>
              </div>
              {/* Line items */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    {activeDoc.columns.map((col, i) => (
                      <th key={i} className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDoc.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-gray-200">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-2 py-2 text-[11px] text-gray-700">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Totals box */}
              {activeDoc.footer && (
                <div className="flex justify-end">
                  <div className="border-2 border-gray-300 rounded px-4 py-2 text-right min-w-[200px]">
                    <p className="text-[10px] text-gray-600">{activeDoc.footer.text}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* JSON: Syntax-highlighted tree view */}
          {activeDoc.formatType === 'JSON' && (
            <div className="p-4 font-mono text-[11px] leading-relaxed" style={{ background: '#1e1e2e', color: '#cdd6f4' }}>
              <p><span style={{ color: '#89b4fa' }}>{'{'}</span></p>
              {activeDoc.rows.map((row, rIdx) => (
                <div key={rIdx} className="pl-4">
                  <p>
                    <span style={{ color: '#f38ba8' }}>"billing_record_{rIdx + 1}"</span>
                    <span style={{ color: '#a6adc8' }}>: {'{'}</span>
                  </p>
                  {activeDoc.columns.map((col, cIdx) => (
                    <p key={cIdx} className="pl-4">
                      <span style={{ color: '#89dceb' }}>"{col.header}"</span>
                      <span style={{ color: '#a6adc8' }}>: </span>
                      <span style={{ color: row[cIdx]?.startsWith('$') ? '#a6e3a1' : '#fab387' }}>
                        {row[cIdx]?.startsWith('$') || !isNaN(Number(row[cIdx])) ? row[cIdx] : `"${row[cIdx]}"`}
                      </span>
                      {cIdx < activeDoc.columns.length - 1 && <span style={{ color: '#a6adc8' }}>,</span>}
                    </p>
                  ))}
                  <p><span style={{ color: '#a6adc8' }}>{'}'}{rIdx < activeDoc.rows.length - 1 ? ',' : ''}</span></p>
                </div>
              ))}
              <p><span style={{ color: '#89b4fa' }}>{'}'}</span></p>
            </div>
          )}

          {/* SQL: Database table with types */}
          {activeDoc.formatType === 'SQL' && (
            <div>
              <div className="px-4 py-2 bg-gray-800 text-gray-300 font-mono text-[10px]">
                <span style={{ color: '#569cd6' }}>SELECT</span> * <span style={{ color: '#569cd6' }}>FROM</span> purchase_orders <span style={{ color: '#569cd6' }}>WHERE</span> status = <span style={{ color: '#ce9178' }}>'approved'</span> <span style={{ color: '#569cd6' }}>LIMIT</span> 5;
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      {activeDoc.columns.map((col, i) => (
                        <th key={i} className="px-3 py-2 text-left border-b-2 border-gray-300">
                          <span className="text-[10px] font-mono font-bold text-gray-700">{col.header}</span>
                          <span className="block text-[8px] font-mono text-gray-400 mt-0.5">
                            {col.header.includes('amount') ? 'DECIMAL(12,2)' : col.header.includes('number') ? 'VARCHAR(20)' : col.header.includes('name') ? 'VARCHAR(255)' : 'VARCHAR(50)'}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeDoc.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-gray-100 hover:bg-blue-50/20">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 text-[11px] font-mono text-gray-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-500 font-mono">
                {activeDoc.rows.length} rows returned
              </div>
            </div>
          )}

          {/* Scan: OCR extracted with confidence indicators */}
          {activeDoc.formatType === 'Scan' && (
            <div className="p-5 space-y-3" style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #ede8df 100%)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-amber-700">OCR Processing — Extracted Fields</span>
              </div>
              <div className="space-y-2">
                {activeDoc.rows.map((row, rIdx) => {
                  const confidence = parseInt(row[2] ?? '0')
                  const confColor = confidence >= 95 ? '#16a34a' : confidence >= 90 ? '#d97706' : '#dc2626'
                  return (
                    <div key={rIdx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/80 border border-gray-200/60">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 font-medium w-24">{row[0]}</span>
                        <span className="text-[11px] font-mono text-gray-800 font-semibold">{row[1]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${confidence}%`, background: confColor }} />
                        </div>
                        <span className="text-[10px] font-bold" style={{ color: confColor }}>{row[2]}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Phase 3: Tool badges */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2">
            <span className="text-[10px] text-gray-400">Tools needed:</span>
            {activeDoc.toolsNeeded.map((t) => (
              <span key={t} className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>

          {/* Footer (CSV/general) */}
          {activeDoc.footer && activeDoc.formatType === 'CSV' && (
            <div className="px-4 py-2 border-t border-gray-200" style={{ background: `${activeDoc.footer.color}08` }}>
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: activeDoc.footer.color }}>{activeDoc.footer.label}</span>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: activeDoc.footer.color }}>{activeDoc.footer.text}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Section 2: What The Data Means */}
      <div className="space-y-4">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">What The Data Means</p>
          <p className="text-xs text-gray-500 mt-0.5">The information your agent extracts, regardless of which document or format it comes from. Same meaning, different sources.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entities.map((entity, idx) => {
            const typeTag = TYPE_TAG_COLORS[entity.type]
            return (
              <motion.div
                key={entity.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: delay + idx * 0.03 }}
                className="rounded-xl border bg-white p-4 space-y-2.5 transition-all duration-200"
                style={{
                  borderColor: hoveredEntity === entity.name ? DIMENSION_COLORS.data.primary : '#e5e7eb',
                  boxShadow: hoveredEntity === entity.name ? `0 0 0 2px ${DIMENSION_COLORS.data.primary}20` : 'none',
                }}
                onMouseEnter={() => setHoveredEntity(entity.name)}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: DIMENSION_COLORS.data.primary }} />
                    <p className="text-sm font-bold text-gray-900">{entity.name}</p>
                  </div>
                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: typeTag.bg, color: typeTag.color }}>{entity.type}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{entity.description}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400">Extracted via:</span>
                  {entity.extractedVia.map((method) => {
                    const tag = EXTRACT_TAG_COLORS[method]
                    return <span key={method} className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: tag.bg, color: tag.color }}>{method}</span>
                  })}
                </div>
                <div className="space-y-1 pt-1 border-t border-gray-100">
                  {entity.examples.map((ex) => (
                    <p key={ex} className="text-[10px] font-mono text-gray-600">{ex}</p>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Section 3: How The Data Arrives */}
      <div className="space-y-4">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">How The Data Arrives</p>
          <p className="text-xs text-gray-500 mt-0.5">The file types and formats your agent parses. Each format requires different tools and has different failure risks.</p>
        </div>
        <div className="space-y-2">
          {formats.map((fmt, idx) => (
            <motion.div key={fmt.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: delay + idx * 0.04 }} className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: fmt.badgeBg }}>
                <span className="text-[10px] font-bold" style={{ color: fmt.badgeColor }}>{fmt.badge}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{fmt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{fmt.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Persona-Grouped Response Dimensions ─────────────────────────────────────

interface PersonaResponseMapping {
  personaId: string
  personaLabel: string
  personaDescription: string
  responseTypes: { label: string; description: string }[]
}

const PERSONA_RESPONSE_MAP: Record<string, PersonaResponseMapping[]> = {
  'doc-intelligence': [
    {
      personaId: 'inv-up-finance-analyst', personaLabel: 'Finance Analyst',
      personaDescription: 'Finance team member analyzing costs for budgeting and optimization. Needs drill-down from summary to line-item detail.',
      responseTypes: [
        { label: 'Cost Breakdown', description: 'Detailed cost breakdown by category, vendor, and period with itemized amounts, percentages, and drill-down to line items' },
        { label: 'Trend Report', description: 'Full time-series trend analysis with MoM/YoY growth rates, seasonal patterns, and statistical baseline comparison' },
        { label: 'Anomaly Alert', description: 'Statistical anomaly notification with z-score justification, root cause attribution, and recommended action' },
        { label: 'Consolidated Report', description: 'Complete monthly/quarterly report with all vendors, categories, trends, charts, and source citations' },
      ],
    },
    {
      personaId: 'inv-up-exec-brief', personaLabel: 'Executive',
      personaDescription: 'Executive reviewing high-level spend for forecasting and board reporting. Wants key metrics and summaries, not line-item detail.',
      responseTypes: [
        { label: 'Consolidated Report', description: 'Executive summary with top-line metrics, key cost drivers, budget variance, and forward projections' },
        { label: 'Trend Report (Summary)', description: 'High-level trend overview showing total spend trajectory, largest growth categories, and forecast' },
        { label: 'Simple Answer', description: 'Direct factual response to quick questions like "What was total cloud spend last quarter?"' },
      ],
    },
    {
      personaId: 'inv-up-procurement', personaLabel: 'Procurement Manager',
      personaDescription: 'Procurement team validating invoices against POs for payment approval. Focuses on discrepancies, mismatches, and escalation.',
      responseTypes: [
        { label: 'Validation Result', description: 'PO matching results showing matched/unmatched line items, discrepancy amounts, and confidence scores' },
        { label: 'Anomaly Alert', description: 'Flagged invoices with unusual amounts, duplicate charges, or charges exceeding PO limits' },
        { label: 'Simple Answer', description: 'Quick lookup answers like "Has PO-4521 been matched?" or "What invoices are pending approval?"' },
      ],
    },
  ],
}

function PersonaGroupedResponses({ tileId, delay }: { tileId: string; delay: number }) {
  const dc = DIMENSION_COLORS.output
  const personas = PERSONA_RESPONSE_MAP[tileId]
  if (!personas) return null

  return (
    <div className="space-y-6">
      <div className="rounded-lg border px-3.5 py-2.5 flex items-start gap-2.5" style={{ borderColor: `${dc.primary}20`, background: `${dc.primary}04` }}>
        <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: dc.primary }} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: dc.primary }}>Responses Tailored to Each User Persona</p>
          <p className="text-[11px] text-gray-500 mt-0.5">What each user persona gets back from your agent. Response types are tailored to who is asking.</p>
        </div>
      </div>
      {personas.map((persona, pIdx) => (
        <motion.div key={persona.personaId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: delay + pIdx * 0.1 }} className="space-y-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: dc.primary }}>{persona.personaLabel}</p>
            <p className="text-xs text-gray-500 mt-0.5">{persona.personaDescription}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {persona.responseTypes.map((rt, rIdx) => (
              <motion.div key={`${persona.personaId}-${rIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: delay + pIdx * 0.1 + rIdx * 0.04 }} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-bold text-gray-900 mb-1.5">{rt.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{rt.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Legacy DataDimensionCard (fallback for tiles without production data) ────

function DataDimensionCard({
  dim,
  delay,
  viewMode,
}: {
  dim: DataDimension
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const dc = DIMENSION_COLORS.data

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: dc.medium }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: dc.light }}>
            <BookOpen className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.label}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.id}
                </span>
              )}
            </div>
            <DepthMeter depth={dim.depthScore} />
          </div>
        </div>
      </div>

      <div className="ml-[42px] space-y-3">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sub-Topics</p>
          <div className="space-y-1">
            {dim.subTopics.map((st) => (
              <div key={st.name} className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">{st.name}</span>
                <DepthMeter depth={st.depth} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Key Entities</p>
          <div className="flex flex-wrap gap-1">
            {dim.keyEntities.map((entity) => (
              <span key={entity} className="text-[10px] font-medium text-gray-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                {entity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function OutputDimensionCard({
  dim,
  delay,
  viewMode,
}: {
  dim: OutputDimension
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const dc = DIMENSION_COLORS.output

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: dc.medium }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: dc.light }}>
            <Users className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.label}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.id}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">{dim.description}</p>
          </div>
        </div>
      </div>

      <div className="ml-[42px] mt-2 space-y-3">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Outcome</p>
          <span className="text-[10px] font-medium text-gray-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
            {dim.outcome}
          </span>
        </div>

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Complexity</p>
          <span className="text-[10px] font-medium text-gray-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
            {dim.complexity}
          </span>
        </div>

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Interaction</p>
          <span className="text-[10px] font-medium text-gray-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            {dim.interaction}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function ToolDimensionCard({
  dim,
  delay,
  viewMode,
}: {
  dim: ToolDimension
  delay: number
  viewMode: 'business' | 'technical'
}) {
  const dc = DIMENSION_COLORS.tool

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border bg-white p-4 overflow-hidden"
      style={{ borderColor: dc.medium }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: dc.light }}>
            <Layers className="w-4 h-4" style={{ color: dc.primary }} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{dim.toolName}</p>
              {viewMode === 'technical' && (
                <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  {dim.id}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ml-[42px] mt-2 space-y-3">
        {dim.states.map((state) => {
          const outcomeColor = state.outcome === 'success' ? 'green' : state.outcome === 'failure' ? 'red' : state.outcome === 'timeout' ? 'amber' : 'orange'
          const outcomeBg = `${outcomeColor}-50`
          const outcomeBorder = `${outcomeColor}-100`
          
          return (
            <div key={state.id} className="border-t pt-3 first:border-t-0 first:pt-0">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[10px] font-bold text-gray-900">{state.label}</p>
                <span className={`text-[9px] font-medium text-gray-700 bg-${outcomeBg} border border-${outcomeBorder} px-2 py-0.5 rounded-full`}>
                  {state.outcome}
                </span>
              </div>
              <div className="text-[9px] text-gray-600 space-y-1">
                <div><span className="font-medium">Operation:</span> {state.operation}</div>
                <div><span className="font-medium">Description:</span> {state.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function SummaryStats({ summaryText, accentColor }: { summaryText: string; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl border px-4 py-3 flex items-center gap-3"
      style={{ borderColor: `${accentColor}20`, background: `${accentColor}04` }}
    >
      <Layers className="w-4 h-4 shrink-0" style={{ color: accentColor }} aria-hidden="true" />
      <p className="text-xs text-gray-600 leading-relaxed">{summaryText}</p>
    </motion.div>
  )
}

// ─── Structural Discovery Canvas (V3 WOW MOMENT) ──────────────────────────────

function StructuralDiscoveryCanvas({
  discoveries,
  dataSources,
  tasks,
  riskTiers,
  viewMode,
}: {
  discoveries: StructuralDiscovery[]
  dataSources: any[]
  tasks: any[]
  riskTiers: RiskTierSummary
  viewMode: 'business' | 'technical'
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeConnectionIndex, setActiveConnectionIndex] = useState(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Orchestrate connection animations sequentially
  useEffect(() => {
    if (!isVisible) return

    if (activeConnectionIndex === -1) {
      // Start first animation immediately
      setActiveConnectionIndex(0)
      return
    }

    if (activeConnectionIndex >= discoveries.length) return

    const timer = setTimeout(() => {
      setActiveConnectionIndex((prev) => prev + 1)
    }, 1200) // 800ms draw + 400ms wait

    return () => clearTimeout(timer)
  }, [isVisible, activeConnectionIndex, discoveries.length])

  // Risk color mapping
  const riskColorMap = {
    green: '#22c55e',
    amber: '#f59e0b',
    red: '#ef4444',
  }

  return (
    <div ref={containerRef} className="space-y-8 mt-12 pt-8 border-t border-gray-200">
      {/* Section title */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">Structural Discovery Canvas</h3>
        <p className="text-sm text-gray-500">
          Connections between data sources and tasks that reveal where your agent will face integration challenges.
        </p>
      </motion.div>

      {/* Main canvas layout: Left | SVG | Right */}
      <div className="grid grid-cols-3 gap-6 min-h-[400px] items-start">
        {/* Left panel: Data Sources */}
        <motion.div
          initial={isVisible ? { opacity: 0, x: -20 } : {}}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Data Sources</p>
          {dataSources.map((source) => (
            <div key={source.id} className="p-3 rounded-lg border border-gray-200 bg-blue-50 text-xs">
              <p className="font-semibold text-gray-900">{source.name}</p>
              <p className="text-gray-600 mt-1">{source.format}</p>
            </div>
          ))}
        </motion.div>

        {/* Center: SVG Canvas with animated connections */}
        <motion.div
          initial={isVisible ? { opacity: 0 } : {}}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="col-span-1"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 400"
            preserveAspectRatio="none"
            className="w-full h-full min-h-[400px] bg-white rounded-lg border border-gray-200"
          >
            <defs>
              <marker
                id="arrowGreen"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
              </marker>
              <marker
                id="arrowAmber"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
              </marker>
              <marker
                id="arrowRed"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* Animated connection lines */}
            {isVisible &&
              discoveries.map((discovery, idx) => {
                const shouldDraw = idx <= activeConnectionIndex
                const startY = 50 + (idx % 4) * 80
                const endY = 50 + (idx % 3) * 120

                return (
                  <g key={discovery.id}>
                    {/* Animated path */}
                    <motion.line
                      x1="20"
                      y1={startY}
                      x2="180"
                      y2={endY}
                      stroke={riskColorMap[discovery.riskLevel]}
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={shouldDraw ? { pathLength: 1 } : { pathLength: 0 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                      markerEnd={`url(#arrow${discovery.riskLevel.charAt(0).toUpperCase() + discovery.riskLevel.slice(1)})`}
                      vectorEffect="non-scaling-stroke"
                    />

                    {/* Marching ants after line completes */}
                    {shouldDraw && (
                      <motion.line
                        x1="20"
                        y1={startY}
                        x2="180"
                        y2={endY}
                        stroke={riskColorMap[discovery.riskLevel]}
                        strokeWidth="2"
                        strokeDasharray="6 5"
                        opacity="0.6"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: -11 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}

                    {/* Annotation label */}
                    {shouldDraw && (
                      <motion.foreignObject
                        x="40"
                        y={startY + (endY - startY) / 2 - 15}
                        width="140"
                        height="50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.8,
                        }}
                      >
                        <div className="text-[8px] font-semibold text-gray-700 whitespace-normal break-words leading-tight">{discovery.title}</div>
                      </motion.foreignObject>
                    )}
                  </g>
                )
              })}
          </svg>
        </motion.div>

        {/* Right panel: Tasks */}
        <motion.div
          initial={isVisible ? { opacity: 0, x: 20 } : {}}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tasks</p>
          {tasks.slice(0, 4).map((task) => (
            <div key={task.id} className="p-3 rounded-lg border border-gray-200 bg-amber-50 text-xs">
              <p className="font-semibold text-gray-900">{task.name}</p>
              <p className="text-gray-600 mt-1">{task.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Risk Tier Summary */}
      <motion.div
        initial={isVisible ? { opacity: 0, y: 12 } : {}}
        animate={isVisible && activeConnectionIndex >= discoveries.length - 1 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="space-y-3 mt-8 pt-6 border-t border-gray-200"
      >
        <p className="text-sm font-bold text-gray-700">Risk Tier Summary</p>

        {/* Green Tier */}
        <RiskTierCard
          riskLevel="green"
          label={riskTiers.green.label}
          count={riskTiers.green.count}
          items={riskTiers.green.items}
          startDelay={activeConnectionIndex >= discoveries.length - 1 ? 0 : 999}
          viewMode={viewMode}
        />

        {/* Amber Tier */}
        <RiskTierCard
          riskLevel="amber"
          label={riskTiers.amber.label}
          count={riskTiers.amber.count}
          items={riskTiers.amber.items}
          startDelay={activeConnectionIndex >= discoveries.length - 1 ? 0.3 : 999}
          viewMode={viewMode}
        />

        {/* Red Tier */}
        <RiskTierCard
          riskLevel="red"
          label={riskTiers.red.label}
          count={riskTiers.red.count}
          items={riskTiers.red.items}
          startDelay={activeConnectionIndex >= discoveries.length - 1 ? 0.6 : 999}
          viewMode={viewMode}
          withPulse
        />
      </motion.div>
    </div>
  )
}

// ─── Count Badge with Animated Counter ─────────────────────────────────────────

function CountBadge({
  count,
  bgColor,
  textColor,
  startDelay,
}: {
  count: number
  bgColor: string
  textColor: string
  startDelay: number
}) {
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    if (startDelay >= 999) return

    const startTime = Date.now() + startDelay * 1000
    const duration = 600 // 600ms animation

    const animate = () => {
      const elapsed = Date.now() - startTime
      if (elapsed >= duration) {
        setDisplayCount(count)
      } else {
        const progress = elapsed / duration
        setDisplayCount(Math.floor(count * progress))
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [count, startDelay])

  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
      style={{ background: bgColor, color: textColor }}
    >
      {displayCount}
    </div>
  )
}

// ─── Risk Tier Card ───────────────────────────────────────────────────────────

function RiskTierCard({
  riskLevel,
  label,
  count,
  items,
  startDelay,
  viewMode,
  withPulse,
}: {
  riskLevel: 'green' | 'amber' | 'red'
  label: string
  count: number
  items: StructuralDiscovery[]
  startDelay: number
  viewMode: 'business' | 'technical'
  withPulse?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const riskColorMap = {
    green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', light: '#dcfce7' },
    amber: { bg: '#fffbeb', border: '#fde047', text: '#92400e', light: '#fef3c7' },
    red: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', light: '#fee2e2' },
  }
  const colors = riskColorMap[riskLevel]

  return (
    <motion.div
      initial={startDelay < 999 ? { opacity: 0, y: 8 } : {}}
      animate={startDelay < 999 ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: startDelay }}
      className={`rounded-lg border p-4 ${withPulse ? 'relative overflow-hidden' : ''}`}
      style={{ borderColor: colors.border, background: colors.bg }}
    >
      {/* Subtle pulse glow for red tier */}
      {withPulse && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }}
        />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-3">
          <CountBadge
            count={count}
            bgColor={colors.light}
            textColor={colors.text}
            startDelay={startDelay}
          />
          <p className="font-semibold text-gray-900">{label}</p>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: colors.text }} aria-hidden="true" />
        </motion.div>
      </button>

      {/* Expandable detail */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t relative z-10"
            style={{ borderColor: colors.border }}
          >
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="text-xs">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-gray-600 mt-0.5">{viewMode === 'technical' ? item.technicalDetail : item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContextDimensionsV3() {
  const activeTileId = useAgentPlaygroundStore((s) => s.activeTileId)
  const viewMode = useAgentPlaygroundStore((s) => s.viewMode)
  const [activeTab, setActiveTab] = useState<DimensionTab>('task')

  const tile = activeTileId ? AGENT_TILE_MAP[activeTileId] : null
  const dimensionsDataV3 = activeTileId ? getDimensionAnalysisDataV3(activeTileId) : null
  const dimensionsData = dimensionsDataV3 ?? (activeTileId ? getDimensionAnalysisData(activeTileId) : null)

  // Check if this is a V3-supported tile
  const isV3Tile = activeTileId ? isV3SupportedTile(activeTileId) : false

  // Load V3 data if supported
  const v3ContextData = isV3Tile && activeTileId ? getContextDefinitionDataV3(resolveV3TileId(activeTileId, 'contextDefinition')) : null
  const v3Discoveries = isV3Tile && activeTileId ? getStructuralDiscoveries(resolveV3TileId(activeTileId, 'structuralDiscovery')) : null
  const v3RiskTiers = isV3Tile && activeTileId ? getRiskTierSummary(resolveV3TileId(activeTileId, 'structuralDiscovery')) : null

  const counts = useMemo<Record<DimensionTab, number>>(() => {
    if (!dimensionsData) return { task: 0, data: 0, output: 0, tool: 0 }
    return {
      task: dimensionsData.taskDimensions.length,
      data: activeTileId && ENTITY_CARDS_DATA[activeTileId] && FORMAT_CARDS_DATA[activeTileId]
        ? ENTITY_CARDS_DATA[activeTileId].length + FORMAT_CARDS_DATA[activeTileId].length
        : dimensionsData.dataDimensions.length,
      output: activeTileId && PERSONA_RESPONSE_MAP[activeTileId]
        ? PERSONA_RESPONSE_MAP[activeTileId].reduce((sum, p) => sum + p.responseTypes.length, 0)
        : (dimensionsData.responseDimensions ?? dimensionsData.outputDimensions).length,
      tool: dimensionsData.toolDimensions.reduce((sum, t) => sum + (t.states?.length ?? 0), 0),
    }
  }, [dimensionsData, activeTileId])

  const accentColor = tile?.color ?? '#3b82f6'

  if (!tile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">No tile selected.</p>
      </div>
    )
  }

  if (!dimensionsData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dimension Analysis</h2>
          <p className="text-sm text-gray-500">Decomposing your agent into capability dimensions</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center"
        >
          <Layers className="w-8 h-8 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-400">Dimensional data for this use case is being generated.</p>
        </motion.div>
      </div>
    )
  }

  const activeTabDef = TABS.find((t) => t.id === activeTab)!

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Stage header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dimension Analysis</h2>
        <p className="text-sm text-gray-500">Decomposing your agent into capability dimensions</p>
      </motion.div>

      {/* Tab bar */}
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor={accentColor} counts={counts} />

      {/* Goal traceability ribbon */}
      <GoalRibbon text={activeTabDef.goalLink} accentColor={activeTabDef.dimensionColor} />

      {/* Tab panels */}
      <div role="tabpanel" id={`dim-panel-${activeTab}`} aria-labelledby={`dim-tab-${activeTab}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'task' && (
            <motion.div
              key="task"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Each task dimension represents a specific sub-capability sliced from parent tasks. Intent categories show which types of queries activate each task.
              </p>
              {dimensionsData.taskDimensions.map((dim, i) => (
                <TaskDimensionCard key={dim.id} dim={dim} delay={0.05 + i * 0.06} viewMode={viewMode} />
              ))}
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              key="data"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {activeTileId && SAMPLE_DOCS[activeTileId] ? (
                <ProductionDataDimensions tileId={activeTileId} delay={0.05} />
              ) : (
                <>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Knowledge map showing what the agent knows, how deep its understanding goes for each topic, and which sources contribute.
                  </p>
                  {dimensionsData.dataDimensions.map((dim, i) => (
                    <DataDimensionCard key={dim.id} dim={dim} delay={0.05 + i * 0.06} viewMode={viewMode} />
                  ))}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'output' && (
            <motion.div
              key="output"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {activeTileId && PERSONA_RESPONSE_MAP[activeTileId] ? (
                <PersonaGroupedResponses tileId={activeTileId} delay={0.05} />
              ) : (
                <>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Output dimensions decompose agent outputs along three axes: outcome, complexity, and interaction style.
                  </p>
                  {(dimensionsData.responseDimensions ?? dimensionsData.outputDimensions).map((dim, i) => (
                    <OutputDimensionCard key={dim.id} dim={dim} delay={0.05 + i * 0.06} viewMode={viewMode} />
                  ))}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'tool' && (
            <motion.div
              key="tool"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Tool dimensions describe the operations and state transitions for each tool the agent uses.
              </p>
              {dimensionsData.toolDimensions.map((dim, i) => (
                <ToolDimensionCard key={dim.id} dim={dim} delay={0.05 + i * 0.06} viewMode={viewMode} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <SummaryStats summaryText={dimensionsData.summaryText} accentColor={accentColor} />

      {/* V3 Structural Discovery Canvas (WOW MOMENT) */}
      {isV3Tile && v3ContextData && v3Discoveries && v3RiskTiers && (
        <StructuralDiscoveryCanvas
          discoveries={v3Discoveries}
          dataSources={v3ContextData.dataSources}
          tasks={v3ContextData.tasks}
          riskTiers={v3RiskTiers}
          viewMode={viewMode}
        />
      )}
    </div>
  )
}
