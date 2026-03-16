import type {
  CombinationCell,
  DimensionAnalysisPayload,
  DimensionPattern,
  OutputDimension,
  PatternTier,
  PatternType,
  PatternsPayload,
  ToolDimension,
  ToolState,
} from '@/store/agentTypes'

// ─── Power-Set Helpers ──────────────────────────────────────────────────────

/**
 * Generate all non-empty subsets of an array (2^N - 1 combinations).
 * Returns subsets ordered by size (singles first, then pairs, triples, etc.).
 */
function powerSet<T>(items: T[]): T[][] {
  const result: T[][] = []
  const n = items.length
  // Iterate from 1 to 2^n - 1 (skip empty set)
  for (let mask = 1; mask < (1 << n); mask++) {
    const subset: T[] = []
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(items[i])
    }
    result.push(subset)
  }
  // Sort by subset size (ascending), then by lexicographic order within same size
  result.sort((a, b) => a.length - b.length || a.join(',').localeCompare(b.join(',')))
  return result
}

/**
 * Create a stable combo ID for a set of data dimension IDs.
 * Single: 'faq-data-product' → 'faq-data-product'
 * Multi:  ['faq-data-product', 'faq-data-pricing'] → 'faq-data-product+pricing'
 */
function comboId(dataIds: string[]): string {
  if (dataIds.length === 1) return dataIds[0]
  // Use first ID as prefix, append short suffixes from the rest
  const prefix = dataIds[0]
  const parts = dataIds.map((id) => {
    const segments = id.split('-')
    return segments[segments.length - 1]
  })
  const base = prefix.split('-').slice(0, -1).join('-')
  return `${base}-${parts.join('+')}`
}

// ─── Pattern Auto-Generation ────────────────────────────────────────────────

/**
 * Map tile IDs to 3-letter prefixes for pattern ID generation.
 */
function tileIdToPrefix(tileId: string): string {
  const prefixMap: Record<string, string> = {
    'faq-knowledge': 'FAQ',
    'saas-copilot': 'SAS',
    'research-comparison': 'RES',
    'dental-patient': 'DEN',
    'doc-intelligence': 'DOC',
    'decision-workflow': 'DEC',
    'coding-agent': 'COD',
    'ops-agent': 'OPS',
    'onprem-assistant': 'ONP',
    'multimodal-agent': 'MUL',
    'consumer-chat': 'CON',
    'security-compliance': 'SEC',
  }
  // Extract base tile ID (before hyphen if compound)
  const baseTileId = tileId.split('-').slice(0, -1).join('-') || tileId
  return prefixMap[baseTileId] || tileId.substring(0, 3).toUpperCase()
}

/**
 * Get tier letter for pattern ID format.
 */
function tierLetter(tier: PatternTier): string {
  const tierMap: Record<PatternTier, string> = {
    simple: 'S',
    complex: 'C',
    fuzzy: 'F',
  }
  return tierMap[tier]
}

/**
 * Classify a combination into a tier based on data combo size, task confidence,
 * and average data depth scores.
 */
function classifyTier(
  dataComboSize: number,
  taskConfidence: 'high' | 'medium' | 'low',
  avgDataDepth: number
): PatternTier {
  // Single data source with high confidence = simple
  if (dataComboSize === 1 && taskConfidence === 'high' && avgDataDepth >= 3) return 'simple'
  if (dataComboSize === 1 && taskConfidence === 'high') return 'simple'
  if (dataComboSize === 1 && taskConfidence === 'medium') return 'simple'
  if (dataComboSize === 1 && taskConfidence === 'low') return 'complex'

  // 2 data sources = complex usually
  if (dataComboSize === 2 && taskConfidence === 'high' && avgDataDepth >= 3) return 'complex'
  if (dataComboSize === 2 && taskConfidence === 'high') return 'complex'
  if (dataComboSize === 2 && taskConfidence === 'medium') return 'complex'
  if (dataComboSize === 2 && taskConfidence === 'low') return 'fuzzy'

  // 3+ data sources = fuzzy, unless high depth and high confidence
  if (dataComboSize >= 3 && taskConfidence === 'high' && avgDataDepth >= 4) return 'complex'
  return 'fuzzy'
}

/**
 * Determine pattern type from combo characteristics.
 */
function classifyPatternType(
  dataComboSize: number,
  taskConfidence: 'high' | 'medium' | 'low',
  hasGaps: boolean
): PatternType {
  if (dataComboSize === 1 && taskConfidence === 'high') return 'simple'
  if (dataComboSize === 1 && taskConfidence === 'medium') return 'hopping'
  if (dataComboSize === 2 && !hasGaps) return 'aggregator'
  if (dataComboSize === 2 && hasGaps) return 'branch'
  if (dataComboSize >= 3) return 'reasoning'
  return 'hopping'
}

/**
 * Compute a confidence score (0-100) from combo characteristics.
 */
function computeConfidence(
  dataComboSize: number,
  taskConfidence: 'high' | 'medium' | 'low',
  avgDataDepth: number
): number {
  let base = taskConfidence === 'high' ? 85 : taskConfidence === 'medium' ? 65 : 45
  // Deeper data = higher confidence
  base += Math.min((avgDataDepth - 2) * 3, 10)
  // More data sources = lower confidence (cross-referencing uncertainty)
  base -= (dataComboSize - 1) * 12
  // Clamp to 15-98 range
  return Math.max(15, Math.min(98, base))
}

// ─── Seeded PRNG for deterministic example questions ────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

// ─── Full Power-Set Pattern Generator ───────────────────────────────────────

/**
 * Generate ALL combinatorial patterns from dimension analysis.
 * 4D mode (primary): Task × DataPowerSet × OutputDimension × ToolState
 * 3D fallback: Task × DataPowerSet × UserProfile (only when no output/tool dims exist)
 * Filters out invalid combos and auto-classifies each into tier/type.
 */
export function generatePowerSetPatterns(
  analysis: DimensionAnalysisPayload
): DimensionPattern[] {
  const patterns: DimensionPattern[] = []
  const dataSubsets = powerSet(analysis.dataDimensions.map((d) => d.id))
  const tilePrefix = tileIdToPrefix(analysis.tileId)

  // Build quick lookup maps
  const dataMap = new Map(analysis.dataDimensions.map((d) => [d.id, d]))
  const upMap = new Map(analysis.userProfileDimensions.map((u) => [u.id, u]))
  const outputMap = new Map((analysis.outputDimensions || []).map((o) => [o.id, o]))
  const toolMap = new Map((analysis.toolDimensions || []).map((t) => [t.id, t]))

  // Build domain connectivity graph for validity checking
  const domainConnections = new Map<string, Set<string>>()
  for (const dd of analysis.dataDimensions) {
    const domains = new Set<string>()
    domains.add(dd.label)
    dd.connectedDomains.forEach((d) => domains.add(d))
    domainConnections.set(dd.id, domains)
  }

  // Track per-tier pattern counters for new ID format
  const tierCounters = { S: 0, C: 0, F: 0 }

  // ─────── 4D Pattern Generation: Task × DataPowerSet × OutputDimension × ToolState ───────
  // When output and tool dimensions exist, generate ONLY 4D patterns (no 3D fallback).
  // For each tool dimension, use success + failure states (filter by outcome, not id).
  const has4D = (analysis.outputDimensions?.length ?? 0) > 0 && (analysis.toolDimensions?.length ?? 0) > 0

  if (has4D) {
    // Collect all tool states filtered by outcome (success + failure only for combinatorial)
    const allRelevantToolStates: { toolDim: ToolDimension; state: ToolState }[] = []
    for (const toolDim of analysis.toolDimensions ?? []) {
      for (const state of toolDim.states ?? []) {
        if (state.outcome === 'success' || state.outcome === 'failure') {
          allRelevantToolStates.push({ toolDim, state })
        }
      }
    }

    for (const task of analysis.taskDimensions) {
      for (const dataIds of dataSubsets) {
        // Validity check: for multi-data combos, ensure domain connectivity
        if (dataIds.length > 1) {
          const allDomains = dataIds.map((id) => domainConnections.get(id) || new Set<string>())
          let hasConnection = false
          for (let i = 0; i < allDomains.length && !hasConnection; i++) {
            for (let j = i + 1; j < allDomains.length && !hasConnection; j++) {
              for (const domain of allDomains[i]) {
                if (allDomains[j].has(domain)) {
                  hasConnection = true
                  break
                }
              }
            }
          }
          if (!hasConnection) continue
        }

        const dataDims = dataIds.map((id) => dataMap.get(id)!).filter(Boolean)
        if (dataDims.length !== dataIds.length) continue

        const avgDepth = dataDims.reduce((s, d) => s + d.depthScore, 0) / dataDims.length
        const hasGaps = dataDims.some((d) => d.gapNote != null)

        for (const outputDim of analysis.outputDimensions ?? []) {
          for (const { toolDim, state: toolState } of allRelevantToolStates) {
            const tier = classifyTier(dataIds.length, task.confidence, avgDepth)
            const letter = tierLetter(tier)
            tierCounters[letter as keyof typeof tierCounters]++
            const seqNum = String(tierCounters[letter as keyof typeof tierCounters]).padStart(2, '0')
            const patId = `${tilePrefix}-${letter}${seqNum}`

            const patternType = classifyPatternType(dataIds.length, task.confidence, hasGaps)
            const confidence = computeConfidence(dataIds.length, task.confidence, avgDepth)

            const dataLabel = dataDims.length === 1
              ? dataDims[0].label
              : dataDims.length === 2
                ? `${dataDims[0].label} + ${dataDims[1].label}`
                : `${dataDims[0].label} + ${dataDims.length - 1} more`

            const name = `${task.label} via ${dataLabel} → ${outputDim.agentOutputLabel} [${toolDim.toolName}: ${toolState.label}]`

            const desc = `${task.label} using ${dataLabel.toLowerCase()} produces ${outputDim.agentOutputLabel.toLowerCase()} (${outputDim.outcome}) when ${toolDim.toolName.toLowerCase()} ${toolState.outcome === 'success' ? 'succeeds' : 'fails'}.`

            const rng = seededRandom(hashString(patId))
            const exampleQuestions = generateExampleQuestions(task, dataDims, { label: outputDim.agentOutputLabel, description: outputDim.description }, rng)

            const inferenceNotes = tier === 'complex'
              ? `Cross-references ${dataDims.length} source${dataDims.length > 1 ? 's' : ''}: ${dataDims.map((d) => d.label).join(', ')}. Tool: ${toolDim.toolName} (${toolState.outcome}).`
              : undefined

            const ambiguityNotes = tier === 'fuzzy'
              ? `${dataDims.length} sources, avg depth ${avgDepth.toFixed(1)}/5. Output: ${outputDim.agentOutputLabel}. ${hasGaps ? 'Coverage gaps exist. ' : ''}May need review.`
              : undefined

            const activatedComponents = deriveActivatedComponents(tier, dataIds.length, hasGaps)

            patterns.push({
              id: patId,
              name,
              description: desc,
              tier,
              taskDimensionId: task.id,
              dataDimensionIds: dataIds,
              userProfileDimensionId: analysis.userProfileDimensions[0]?.id || '',
              outputDimensionId: outputDim.id,
              toolStateDimensionId: toolState.id,
              patternType,
              exampleQuestions,
              activatedComponents,
              inferenceNotes,
              ambiguityNotes,
              confidence,
            })
          }
        }
      }
    }
  } else {
    // ─────── Fallback 3D: Task × DataPowerSet × UserProfile (no output/tool dims) ───────
    for (const task of analysis.taskDimensions) {
      for (const dataIds of dataSubsets) {
        if (dataIds.length > 1) {
          const allDomains = dataIds.map((id) => domainConnections.get(id) || new Set<string>())
          let hasConnection = false
          for (let i = 0; i < allDomains.length && !hasConnection; i++) {
            for (let j = i + 1; j < allDomains.length && !hasConnection; j++) {
              for (const domain of allDomains[i]) {
                if (allDomains[j].has(domain)) {
                  hasConnection = true
                  break
                }
              }
            }
          }
          if (!hasConnection) continue
        }

        const dataDims = dataIds.map((id) => dataMap.get(id)!).filter(Boolean)
        if (dataDims.length !== dataIds.length) continue

        const avgDepth = dataDims.reduce((s, d) => s + d.depthScore, 0) / dataDims.length
        const hasGaps = dataDims.some((d) => d.gapNote != null)

        for (const up of analysis.userProfileDimensions) {
          const tier = classifyTier(dataIds.length, task.confidence, avgDepth)
          const letter = tierLetter(tier)
          tierCounters[letter as keyof typeof tierCounters]++
          const seqNum = String(tierCounters[letter as keyof typeof tierCounters]).padStart(2, '0')
          const patId = `${tilePrefix}-${letter}${seqNum}`

          const patternType = classifyPatternType(dataIds.length, task.confidence, hasGaps)
          const confidence = computeConfidence(dataIds.length, task.confidence, avgDepth)

          const dataLabel = dataDims.length === 1
            ? dataDims[0].label
            : dataDims.length === 2
              ? `${dataDims[0].label} + ${dataDims[1].label}`
              : `${dataDims[0].label} + ${dataDims.length - 1} more`

          const upDim = upMap.get(up.id)!
          const name = `${task.label} via ${dataLabel} — ${upDim.label}`
          const desc = dataDims.length === 1
            ? `${upDim.label} performs ${task.label.toLowerCase()} using ${dataDims[0].label.toLowerCase()} data.`
            : `${upDim.label} performs ${task.label.toLowerCase()} cross-referencing ${dataDims.map((d) => d.label.toLowerCase()).join(', ')}.`

          const rng = seededRandom(hashString(patId))
          const exampleQuestions = generateExampleQuestions(task, dataDims, upDim, rng)

          const inferenceNotes = tier === 'complex'
            ? `Cross-references ${dataDims.length} source${dataDims.length > 1 ? 's' : ''}: ${dataDims.map((d) => d.label).join(', ')}.`
            : undefined
          const ambiguityNotes = tier === 'fuzzy'
            ? `${dataDims.length} sources, avg depth ${avgDepth.toFixed(1)}/5. ${hasGaps ? 'Coverage gaps exist. ' : ''}May need review.`
            : undefined

          const activatedComponents = deriveActivatedComponents(tier, dataIds.length, hasGaps)

          patterns.push({
            id: patId,
            name,
            description: desc,
            tier,
            taskDimensionId: task.id,
            dataDimensionIds: dataIds,
            userProfileDimensionId: up.id,
            patternType,
            exampleQuestions,
            activatedComponents,
            inferenceNotes,
            ambiguityNotes,
            confidence,
          })
        }
      }
    }
  }

  return patterns
}

/**
 * Generate exactly 4 example questions based on dimension characteristics.
 */
function generateExampleQuestions(
  task: { label: string; description: string; intentCategories: string[] },
  dataDims: { label: string; keyEntities: string[] }[],
  _userProfile: { label: string; description: string },
  rng: () => number
): string[] {
  const questions: string[] = []
  const entities = dataDims.flatMap((d) => d.keyEntities)
  const pickEntity = () => entities[Math.floor(rng() * entities.length)] || 'this topic'

  const entity1 = pickEntity()
  const entity2 = pickEntity()
  const entity3 = entities.length > 2 ? entities[Math.floor(rng() * entities.length)] : entity1

  if (dataDims.length === 1) {
    questions.push(`How does ${entity1} relate to ${task.label.toLowerCase()}?`)
    questions.push(`Can you explain ${entity2} from the ${dataDims[0].label.toLowerCase()} perspective?`)
    questions.push(`What are the key aspects of ${entity1} in the context of ${task.label.toLowerCase()}?`)
    questions.push(`How would you compare ${entity1} and ${entity2} using ${dataDims[0].label.toLowerCase()}?`)
  } else {
    questions.push(`How does ${entity1} compare across ${dataDims.map((d) => d.label.toLowerCase()).join(' and ')}?`)
    questions.push(`What is the relationship between ${dataDims[0].label.toLowerCase()} and ${dataDims[dataDims.length - 1].label.toLowerCase()} for ${task.label.toLowerCase()}?`)
    if (dataDims.length >= 3) {
      questions.push(`Synthesize information from all ${dataDims.length} sources about ${entity1}.`)
    } else {
      questions.push(`How do ${dataDims[0].label.toLowerCase()} and ${dataDims[1].label.toLowerCase()} relate for ${entity1}?`)
    }
    questions.push(`What insights about ${entity3} can only be derived by combining ${dataDims.map((d) => d.label.toLowerCase()).join(' and ')}?`)
  }

  return questions.slice(0, 4)
}

/**
 * Derive activated components based on pattern complexity.
 */
function deriveActivatedComponents(
  tier: PatternTier,
  dataComboSize: number,
  hasGaps: boolean
): string[] {
  const base = ['api-gateway', 'auth', 'input-validation', 'request-classification']
  const context = ['rag', 'memory']
  const execution = ['response-generation', 'citation-linking']

  if (tier === 'simple') {
    return [...base, ...context, ...execution]
  }

  const complex = [...base, ...context, 'reranking', 'context-graph']
  if (dataComboSize >= 2) complex.push('tool-planning')
  complex.push(...execution, 'hallucination-check')

  if (tier === 'complex') {
    return complex
  }

  // Fuzzy
  const fuzzy = [...complex, 'workflow-orchestrator', 'failure-handling']
  if (hasGaps) fuzzy.push('drift-detection', 'alerting-feedback')
  fuzzy.push('output-guardrails', 'policy-enforcement')
  return fuzzy
}

// ─── Payload Builder (upgraded) ─────────────────────────────────────────────

/**
 * Builds a complete PatternsPayload from dimension analysis data + pattern array.
 * Generates the matrix, tier breakdown, and ID arrays automatically.
 *
 * If patterns array is empty, auto-generates full power-set combinatorial patterns.
 * Supports both 3D (Task × Data × UserProfile) and 4D (Task × Data × Output × ToolState) generation.
 */
export function buildPatternsPayload(
  analysis: DimensionAnalysisPayload,
  patterns: DimensionPattern[],
  agentName: string,
  tileDescription: string
): PatternsPayload {
  // If no patterns provided, generate the full power-set
  const finalPatterns = patterns.length > 0 ? patterns : generatePowerSetPatterns(analysis)

  const taskIds = analysis.taskDimensions.map((t) => t.id)
  const dataIds = analysis.dataDimensions.map((d) => d.id)
  const userProfileIds = analysis.userProfileDimensions.map((u) => u.id)
  const outputIds = (analysis.outputDimensions ?? []).map((o) => o.id)
  const toolIds = (analysis.toolDimensions ?? []).map((t) => t.id)

  // Collect all unique data combo IDs from patterns (includes multi-data combos)
  const allDataComboIds = new Set<string>()
  for (const p of finalPatterns) {
    if (p.dataDimensionIds.length === 1) {
      allDataComboIds.add(p.dataDimensionIds[0])
    } else {
      allDataComboIds.add(comboId(p.dataDimensionIds))
    }
  }

  // Collect all unique output dimension IDs and tool state IDs from patterns
  const allOutputIds = new Set<string>()
  const allToolStateIds = new Set<string>()
  for (const p of finalPatterns) {
    if (p.outputDimensionId) allOutputIds.add(p.outputDimensionId)
    if (p.toolStateDimensionId) allToolStateIds.add(p.toolStateDimensionId)
  }

  // Build matrix: rows = tasks, cols = single data dimensions
  // The matrix is a summary view — each cell aggregates all patterns touching that task × data pair
  const matrix: CombinationCell[][] = taskIds.map((taskId) => {
    return dataIds.map((dataId) => {
      // Find patterns matching this task × data combo (single or includes this data source)
      const matching = finalPatterns.filter(
        (p) =>
          p.taskDimensionId === taskId &&
          p.dataDimensionIds.includes(dataId)
      )

      const count = matching.length

      // Determine primary tier
      let primaryTier: PatternTier = 'simple'
      if (count > 0) {
        const tierCounts = { simple: 0, complex: 0, fuzzy: 0 }
        matching.forEach((p) => {
          tierCounts[p.tier]++
        })
        if (tierCounts.fuzzy >= tierCounts.complex && tierCounts.fuzzy >= tierCounts.simple) {
          primaryTier = 'fuzzy'
        } else if (tierCounts.complex >= tierCounts.simple) {
          primaryTier = 'complex'
        }
      }

      // Collect user profile IDs from matching patterns
      const upIds = [...new Set(matching.map((p) => p.userProfileDimensionId))]

      return {
        taskDimensionId: taskId,
        dataDimensionIds: [dataId],
        isValid: count > 0,
        patternCount: count,
        primaryTier,
        userProfileDimensionIds: upIds,
      } satisfies CombinationCell
    })
  })

  // Tier breakdown
  const tierBreakdown = { simple: 0, complex: 0, fuzzy: 0 }
  finalPatterns.forEach((p) => {
    tierBreakdown[p.tier]++
  })

  // Total combinations formula
  // 4D: tasks × power-set data × output dims × tool states (success + failure only)
  // 3D fallback: tasks × power-set data × user profiles
  let totalCombinations: number
  const dataSubsetCount = (1 << dataIds.length) - 1 // 2^N - 1
  if (outputIds.length > 0 && toolIds.length > 0) {
    // Count success + failure tool states by filtering on outcome field
    let totalToolStates = 0
    for (const toolDim of analysis.toolDimensions ?? []) {
      const successFailureStates = (toolDim.states ?? []).filter(
        (s: ToolState) => s.outcome === 'success' || s.outcome === 'failure'
      ).length
      totalToolStates += successFailureStates
    }
    totalCombinations = taskIds.length * dataSubsetCount * outputIds.length * totalToolStates
  } else {
    totalCombinations = taskIds.length * dataSubsetCount * userProfileIds.length
  }

  // Valid patterns = actual generated patterns
  const validPatterns = finalPatterns.length

  return {
    tileId: analysis.tileId,
    agentName,
    tileDescription,
    taskDimensions: taskIds,
    dataDimensions: [...allDataComboIds],
    userProfileDimensions: userProfileIds,
    outputDimensions: [...allOutputIds],
    toolStateDimensions: [...allToolStateIds],
    totalCombinations,
    validPatterns,
    matrix,
    patterns: finalPatterns,
    tierBreakdown,
  }
}
