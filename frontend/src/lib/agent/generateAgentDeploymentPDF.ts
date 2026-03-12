import { jsPDF } from 'jspdf'
import type { ArchitectureStageData } from './architectureData'
import type { AgentTile } from '@/store/agentTypes'

interface AgentPDFPayload {
  tile: AgentTile
  architecture: ArchitectureStageData
}

export function generateAgentDeploymentPDF(payload: AgentPDFPayload) {
  const { tile, architecture } = payload
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = 50

  const addHeading = (text: string) => {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(text, 40, y)
    y += 8
    doc.setDrawColor(59, 130, 246)
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

  const addParagraph = (text: string) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    const lines = doc.splitTextToSize(text, W - 80)
    doc.text(lines, 40, y)
    y += lines.length * 13 + 6
  }

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage()
      y = 50
    }
  }

  // ── Title ─────────────────────────────────────────────────────────────────
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 130, 246)
  doc.text('VibeModel — Agent Deployment Guide', 40, y)
  y += 14
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(140, 140, 140)
  doc.text(`Generated ${new Date().toLocaleDateString()} · Demo Mode`, 40, y)
  y += 30

  // ── 1. Agent Overview ─────────────────────────────────────────────────────
  addHeading('1. Agent Overview')
  addLabel('Agent', tile.label)
  addLabel('Industry', tile.industry)
  addLabel('Complexity', tile.complexityLabel)
  addLabel('Architecture', architecture.pipelineTypeLabel)
  addLabel('Total Components', architecture.totalComponents.toString())
  addLabel('Interaction Paths', (architecture.totalInteractionPaths ?? 0).toString())
  addLabel('Trust Lanes', architecture.totalLanes.toString())
  y += 6
  addParagraph(tile.description)
  y += 4
  addParagraph(`Goal: ${tile.goalStatement}`)
  y += 10

  // ── 2. Architecture Lanes ─────────────────────────────────────────────────
  checkPage(120)
  addHeading('2. Trust Boundary Lanes')

  for (const lane of architecture.lanes) {
    checkPage(100)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50, 50, 50)
    doc.text(`Lane ${lane.laneNumber}: ${lane.label}`, 40, y)
    y += 14

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Trust: ${lane.trustBoundary} · ${lane.interactionFlowCount} interaction flows · ${lane.technicalComponents.length} components`, 50, y)
    y += 14

    addParagraph(lane.businessDescription)
    y += 2

    // Component list
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text('Component Pipeline:', 50, y)
    y += 12

    for (const comp of lane.technicalComponents) {
      checkPage(30)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(`  #${comp.order} ${comp.name} — ${comp.description}`, 55, y)
      y += 12
      if (comp.rationale) {
        doc.setFontSize(7)
        doc.setTextColor(120, 120, 120)
        doc.text(`     Why: ${comp.rationale}`, 60, y)
        y += 11
      }
    }
    y += 8
  }

  // ── 3. Component Summary ──────────────────────────────────────────────────
  checkPage(80)
  addHeading('3. Component Summary')

  const uniqueComponents = new Map<string, { name: string; description: string; lanes: number[] }>()
  for (const lane of architecture.lanes) {
    for (const comp of lane.technicalComponents) {
      if (!uniqueComponents.has(comp.componentId)) {
        uniqueComponents.set(comp.componentId, { name: comp.name, description: comp.description, lanes: [] })
      }
      const entry = uniqueComponents.get(comp.componentId)!
      if (!entry.lanes.includes(lane.laneNumber)) {
        entry.lanes.push(lane.laneNumber)
      }
    }
  }

  for (const [_id, comp] of uniqueComponents) {
    checkPage(30)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50, 50, 50)
    doc.text(`${comp.name}`, 50, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`  (Lanes: ${comp.lanes.join(', ')})`, 50 + doc.getTextWidth(comp.name) + 4, y)
    y += 12
  }
  y += 10

  // ── 4. Deployment Configuration ──────────────────────────────────────────
  checkPage(120)
  addHeading('4. Deployment Configuration')

  const apiLines = [
    'POST /api/v1/agent/query',
    'Content-Type: application/json',
    'Authorization: Bearer <token>',
    '',
    '{',
    `  "agent": "${tile.id}",`,
    '  "query": "...",',
    '  "session_id": "uuid",',
    '  "context": { ... }',
    '}',
    '',
    'Response: {',
    '  "answer": "...",',
    '  "confidence": 0.0-1.0,',
    '  "lane": 1,',
    '  "components_invoked": [...]',
    '}',
  ]

  doc.setFontSize(9)
  doc.setFont('courier', 'normal')
  doc.setTextColor(60, 60, 60)
  for (const line of apiLines) {
    checkPage(15)
    doc.text(line, 50, y)
    y += 13
  }
  y += 10

  // ── 5. Rollout Strategy ──────────────────────────────────────────────────
  checkPage(120)
  doc.setFont('helvetica', 'normal')
  addHeading('5. Rollout Strategy')
  addParagraph(`This agent is designed for ${tile.industry} use cases with ${tile.complexityLabel.toLowerCase()} complexity. The recommended rollout follows a phased approach:`)
  y += 4
  addParagraph('Phase 1 (Week 1-2): Deploy Lane 1 (autonomous) with shadow mode. Monitor resolution rate and escalation triggers without live traffic.')
  addParagraph(`Phase 2 (Week 3-4): Enable live traffic for Lane 1. Route ${architecture.lanes[0]?.interactionFlowCount ?? 0} interaction paths through the autonomous pipeline.`)
  if (architecture.totalLanes >= 2) {
    addParagraph(`Phase 3 (Week 5-6): Activate Lane 2 with supervised monitoring. Gradually reduce human-in-the-loop requirements as confidence builds.`)
  }
  if (architecture.totalLanes >= 3) {
    addParagraph(`Phase 4 (Week 7+): Enable remaining lanes. Full production deployment with drift detection and alerting configured.`)
  }
  y += 6
  addParagraph('Continuous monitoring will track interaction volume, resolution rate, escalation rate, and average resolution time. Drift detection alerts trigger when any metric deviates more than 10% from baseline.')

  // ── Footer ────────────────────────────────────────────────────────────────
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(170, 170, 170)
    doc.text(`VibeModel.ai · Agent Deployment Guide · Page ${i} of ${pages}`, W / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' })
  }

  doc.save(`VibeModel_Agent_${tile.id.replace(/-/g, '_')}.pdf`)
}
