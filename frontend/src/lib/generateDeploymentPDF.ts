import { jsPDF } from 'jspdf'
import type { ModelSelectionResults, ValidationSummaryResults } from '@/store/types'

interface PDFPayload {
  datasetName: string
  businessGoal: string | null
  deploymentMode: string | null
  model: ModelSelectionResults
  validation: ValidationSummaryResults | null
}

export function generateDeploymentPDF(payload: PDFPayload) {
  const { datasetName, businessGoal, deploymentMode, model, validation } = payload
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
    doc.text(value, 160, y)
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

  // ── Title ───────────────────────────────────────────────────────────────────
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(59, 130, 246)
  doc.text('VibeModel — Deployment Report', 40, y)
  y += 14
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(140, 140, 140)
  doc.text(`Generated ${new Date().toLocaleDateString()} · Demo Mode`, 40, y)
  y += 30

  // ── 1. Executive Summary ────────────────────────────────────────────────────
  addHeading('1. Executive Summary')
  addLabel('Dataset', datasetName)
  addLabel('Business Goal', businessGoal ?? 'Not specified')
  addLabel('Deployment Mode', deploymentMode ?? 'Not specified')
  addLabel('Champion Model', model.champion)
  addLabel('Model Type', model.modelType)
  addLabel(`${model.primaryMetric}`, `${model.overallRecall}%`)
  addLabel(`${model.secondaryMetric}`, `${model.overallPrecision}%`)
  y += 6
  addParagraph(model.metricStatement)
  y += 10

  // ── 2. Model Composition ────────────────────────────────────────────────────
  checkPage(120)
  addHeading('2. Model Composition')
  addParagraph(model.modelFunction)
  y += 4

  for (const comp of model.components) {
    checkPage(80)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50, 50, 50)
    doc.text(`${comp.subtypeLabel}: ${comp.name}`, 40, y)
    y += 14

    if (comp.params.length > 0) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      for (const param of comp.params) {
        doc.text(`  ${param.name}: ${param.value}`, 50, y)
        y += 12
      }
    }
    y += 4
  }

  // ── 3. Performance Metrics ──────────────────────────────────────────────────
  checkPage(100)
  addHeading('3. Performance Metrics')

  for (const perf of model.performance) {
    checkPage(30)
    addLabel(perf.label, `Recall: ${perf.recall}% · Precision: ${perf.precision}%`)
  }
  y += 10

  // ── 4. Validation Summary ───────────────────────────────────────────────────
  if (validation) {
    checkPage(100)
    addHeading('4. Validation Summary')
    addLabel('Total Validation Samples', validation.totalCount.toLocaleString())
    addLabel('Total Cohorts', validation.totalCohorts.toString())
    addLabel('Dominant Patterns', `${validation.sufficient.count} (${validation.sufficient.percentage}%)`)
    addLabel('Non-Dominant Patterns', `${validation.insufficient.count} (${validation.insufficient.percentage}%)`)
    addLabel('Fuzzy Patterns', `${validation.helpMe.count} (${validation.helpMe.percentage}%)`)
    addLabel('Augmented', `${validation.augmented.count} (${validation.augmented.percentage}%)`)
    y += 10
  }

  // ── 5. Why This Composition ─────────────────────────────────────────────────
  checkPage(80)
  addHeading('5. Why This Composition')
  addParagraph(model.whyThisModel)
  y += 10

  // ── 6. API Specification (Mock) ─────────────────────────────────────────────
  checkPage(120)
  addHeading('6. API Specification')
  doc.setFontSize(9)
  doc.setFont('courier', 'normal')
  doc.setTextColor(60, 60, 60)
  const apiLines = [
    'POST /api/v1/predict',
    'Content-Type: application/json',
    '',
    '{',
    '  "features": { ... },',
    `  "model": "${model.champion}"`,
    '}',
    '',
    'Response: { "prediction": 0|1, "confidence": 0.0-1.0 }',
  ]
  for (const line of apiLines) {
    doc.text(line, 50, y)
    y += 13
  }
  y += 10

  // ── 7. Deployment & Retraining ──────────────────────────────────────────────
  checkPage(80)
  doc.setFont('helvetica', 'normal')
  addHeading('7. Deployment & Retraining')
  addParagraph('This model is configured for ' + (deploymentMode ?? 'batch') + ' deployment. Continuous monitoring will track data drift and concept drift. A retraining trigger will fire when PSI thresholds are exceeded.')
  addParagraph('Recommended retraining cadence: Weekly (or on PSI breach). Monitoring dashboard available post-deployment.')

  // ── Footer ──────────────────────────────────────────────────────────────────
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(170, 170, 170)
    doc.text(`VibeModel.ai · Demo Report · Page ${i} of ${pages}`, W / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' })
  }

  doc.save(`VibeModel_Deployment_${datasetName.replace(/\s+/g, '_')}.pdf`)
}
