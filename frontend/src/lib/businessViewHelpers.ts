import type { ModelComponent } from '@/store/types'

/** Maps technical subtypeLabels to business-friendly names */
export const businessSubtypeLabels: Record<string, string> = {
  'Preprocessor': 'Data Preparation',
  'Model Function': 'Core Prediction Engine',
  'Model Component': 'Core Prediction Engine',
  'Loss Function': 'Error Optimization',
  'Regularization': 'Complexity Control',
  'Optimization Algorithm': 'Learning Strategy',
  'Capacity Controls': 'Model Size',
  'Complexity Controls': 'Model Complexity',
  'Inference Tuning': 'Prediction Tuning',
}

/** Returns a one-sentence business explanation for the given model component */
export function componentToBusinessSummary(comp: ModelComponent): string {
  const label = comp.subtypeLabel.toLowerCase()
  if (label.includes('preprocessor')) {
    return 'Cleans and standardizes your data before the model generates predictions.'
  }
  if (label.includes('loss function')) {
    return 'Guides the model to minimize the most costly type of errors for this use case.'
  }
  if (label.includes('regularization')) {
    return 'Prevents the model from over-fitting to historical data, keeping it reliable on new records.'
  }
  if (label.includes('optimization algorithm')) {
    return 'Controls how the model learns from patterns — balancing speed and accuracy.'
  }
  if (label.includes('capacity controls')) {
    return 'Sets the depth and breadth of what the model can learn from your data.'
  }
  if (label.includes('complexity controls')) {
    return 'Keeps the model from becoming overly complex, improving generalization.'
  }
  if (label.includes('inference tuning')) {
    return 'Optimizes how quickly predictions are delivered at runtime.'
  }
  return 'Handles the core prediction logic of the model.'
}

/** Returns a business-friendly statement for a metric and its value */
export function metricToBusinessStatement(metric: string, value: number): string {
  if (metric === 'Recall') {
    return `The model correctly identifies ${value}% of true cases — minimizing missed detections.`
  }
  if (metric === 'Precision') {
    return `${value}% of flagged predictions are accurate — minimizing false alarms.`
  }
  if (metric === 'MAPE') {
    return `Forecasts are off by ${value}% on average — lower is better.`
  }
  if (metric === 'RMSE') {
    return `Average prediction error is ${value} units (penalizes large errors more heavily).`
  }
  if (metric === 'MAE') {
    return `Predictions are off by ${value} units on average.`
  }
  return `${metric}: ${value}`
}

/**
 * Converts raw keySignals strings like "Feature=Value" or "Feature < N"
 * into plain English phrases for business-friendly display.
 */
export function keySignalsToBusinessLanguage(signals: string[]): string[] {
  return signals.map((signal) => {
    const lte = signal.match(/^(.+?)\s*<=\s*(.+)$/)
    if (lte) return `${lte[1].trim()} is at most ${lte[2].trim()}`

    const gte = signal.match(/^(.+?)\s*>=\s*(.+)$/)
    if (gte) return `${gte[1].trim()} is at least ${gte[2].trim()}`

    const lt = signal.match(/^(.+?)\s*<\s*(.+)$/)
    if (lt) return `${lt[1].trim()} is below ${lt[2].trim()}`

    const gt = signal.match(/^(.+?)\s*>\s*(.+)$/)
    if (gt) return `${gt[1].trim()} is above ${gt[2].trim()}`

    const inOp = signal.match(/^(.+?)\s+in\s+(.+)$/i)
    if (inOp) return `${inOp[1].trim()} is ${inOp[2].trim()}`

    const neq = signal.match(/^(.+?)\s*!=\s*(.+)$/)
    if (neq) return `${neq[1].trim()} is not ${neq[2].trim()}`

    const eq = signal.match(/^(.+?)=(.+)$/)
    if (eq) return `${eq[1].trim()} is ${eq[2].trim()}`

    return signal
  })
}
