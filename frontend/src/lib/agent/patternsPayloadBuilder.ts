import type {
  CombinationCell,
  DimensionAnalysisPayload,
  DimensionPattern,
  PatternTier,
  PatternType,
  PatternsPayload,
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
 * Classify a combination into a tier based on data combo size, task confidence,
 * and average data depth scores.
 */
function classifyTier(
  dataComboSize: number,
  taskConfidence: 'high' | 'medium' | 'low',
  avgDataDepth: number
): PatternTier {
  // Single data source with high confidence = simple (dominant)
  if (dataComboSize === 1 && taskConfidence === 'high' && avgDataDepth >= 3) return 'simple'
  if (dataComboSize === 1 && taskConfidence === 'high') return 'simple'
  if (dataComboSize === 1 && taskConfidence === 'medium') return 'simple'
  if (dataComboSize === 1 && taskConfidence === 'low') return 'complex'

  // 2 data sources = complex (non-dominant) usually
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
 * Generate ALL Task × DataPowerSet × UserProfile patterns from dimension analysis.
 * Filters out invalid combos and auto-classifies each into tier/type.
 */
export function generatePowerSetPatterns(
  analysis: DimensionAnalysisPayload
): DimensionPattern[] {
  const patterns: DimensionPattern[] = []
  const dataSubsets = powerSet(analysis.dataDimensions.map((d) => d.id))
  const tilePrefix = analysis.tileId.split('-')[0]

  // Build quick lookup maps
  const dataMap = new Map(analysis.dataDimensions.map((d) => [d.id, d]))
  const upMap = new Map(analysis.userProfileDimensions.map((u) => [u.id, u]))

  // Build domain connectivity graph for validity checking
  const domainConnections = new Map<string, Set<string>>()
  for (const dd of analysis.dataDimensions) {
    const domains = new Set<string>()
    domains.add(dd.label)
    dd.connectedDomains.forEach((d) => domains.add(d))
    domainConnections.set(dd.id, domains)
  }

  let patternCounter = 0

  for (const task of analysis.taskDimensions) {
    for (const dataIds of dataSubsets) {
      // Validity check: for multi-data combos, ensure at least some domain connectivity
      if (dataIds.length > 1) {
        const allDomains = dataIds.map((id) => domainConnections.get(id) || new Set<string>())
        // Check pairwise: at least one pair must share a connected domain
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
        if (!hasConnection) continue // Skip disconnected combos
      }

      const dataDims = dataIds.map((id) => dataMap.get(id)!).filter(Boolean)
      if (dataDims.length !== dataIds.length) continue // Skip if data dim not found

      const avgDepth = dataDims.reduce((s, d) => s + d.depthScore, 0) / dataDims.length
      const hasGaps = dataDims.some((d) => d.gapNote != null)

      for (const up of analysis.userProfileDimensions) {
        patternCounter++
        const patId = `${tilePrefix}-pat-${patternCounter}`

        const tier = classifyTier(dataIds.length, task.confidence, avgDepth)
        const patternType = classifyPatternType(dataIds.length, task.confidence, hasGaps)
        const confidence = computeConfidence(dataIds.length, task.confidence, avgDepth)

        // Generate name from dimension labels
        const dataLabel = dataDims.length === 1
          ? dataDims[0].label
          : dataDims.length === 2
            ? `${dataDims[0].label} + ${dataDims[1].label}`
            : `${dataDims[0].label} + ${dataDims.length - 1} more`

        // Include user profile for unique naming across same task×data combos
        const upDim = upMap.get(up.id)!
        const name = `${task.label} via ${dataLabel} — ${upDim.label}`

        // Generate description
        const desc = dataDims.length === 1
          ? `${upDim.label} performs ${task.label.toLowerCase()} using ${dataDims[0].label.toLowerCase()} data.`
          : `${upDim.label} performs ${task.label.toLowerCase()} cross-referencing ${dataDims.map((d) => d.label.toLowerCase()).join(', ')}.`

        // Generate deterministic example questions using seeded PRNG
        const rng = seededRandom(hashString(patId))
        const exampleQuestions = generateExampleQuestions(task, dataDims, upDim, rng)

        // Inference/ambiguity notes based on tier
        const inferenceNotes = tier === 'complex'
          ? `Cross-references ${dataDims.length} data source${dataDims.length > 1 ? 's' : ''}: ${dataDims.map((d) => d.label).join(', ')}. Requires multi-hop retrieval.`
          : undefined

        const ambiguityNotes = tier === 'fuzzy'
          ? `${dataDims.length} data sources with avg depth ${avgDepth.toFixed(1)}/5. ${hasGaps ? 'Known coverage gaps in source data. ' : ''}May require human review.`
          : undefined

        // Activated components based on complexity
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

  return patterns
}

/**
 * Generate 2-3 example questions based on dimension characteristics.
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

  if (dataDims.length === 1) {
    questions.push(`How does ${entity1} relate to ${task.label.toLowerCase()}?`)
    if (entities.length > 1) {
      questions.push(`Can you explain ${entity2} from the ${dataDims[0].label.toLowerCase()} perspective?`)
    }
  } else {
    questions.push(`How does ${entity1} compare across ${dataDims.map((d) => d.label.toLowerCase()).join(' and ')}?`)
    questions.push(`What is the relationship between ${dataDims[0].label.toLowerCase()} and ${dataDims[dataDims.length - 1].label.toLowerCase()} for ${task.label.toLowerCase()}?`)
    if (dataDims.length >= 3) {
      questions.push(`Synthesize information from all ${dataDims.length} sources about ${entity1}.`)
    }
  }

  return questions.slice(0, dataDims.length === 1 ? 2 : 3)
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

  // Collect all unique data combo IDs from patterns (includes multi-data combos)
  const allDataComboIds = new Set<string>()
  for (const p of finalPatterns) {
    if (p.dataDimensionIds.length === 1) {
      allDataComboIds.add(p.dataDimensionIds[0])
    } else {
      allDataComboIds.add(comboId(p.dataDimensionIds))
    }
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

      // Determine dominant tier
      let dominantTier: PatternTier = 'simple'
      if (count > 0) {
        const tierCounts = { simple: 0, complex: 0, fuzzy: 0 }
        matching.forEach((p) => {
          tierCounts[p.tier]++
        })
        if (tierCounts.fuzzy >= tierCounts.complex && tierCounts.fuzzy >= tierCounts.simple) {
          dominantTier = 'fuzzy'
        } else if (tierCounts.complex >= tierCounts.simple) {
          dominantTier = 'complex'
        }
      }

      // Collect user profile IDs from matching patterns
      const upIds = [...new Set(matching.map((p) => p.userProfileDimensionId))]

      return {
        taskDimensionId: taskId,
        dataDimensionIds: [dataId],
        isValid: count > 0,
        patternCount: count,
        dominantTier,
        userProfileDimensionIds: upIds,
      } satisfies CombinationCell
    })
  })

  // Tier breakdown
  const tierBreakdown = { simple: 0, complex: 0, fuzzy: 0 }
  finalPatterns.forEach((p) => {
    tierBreakdown[p.tier]++
  })

  // Total combinations = tasks × power-set data × user profiles (theoretical max)
  const dataSubsetCount = (1 << dataIds.length) - 1 // 2^N - 1
  const totalCombinations = taskIds.length * dataSubsetCount * userProfileIds.length

  // Valid patterns = actual generated patterns
  const validPatterns = finalPatterns.length

  return {
    tileId: analysis.tileId,
    agentName,
    tileDescription,
    taskDimensions: taskIds,
    dataDimensions: [...allDataComboIds],
    userProfileDimensions: userProfileIds,
    totalCombinations,
    validPatterns,
    matrix,
    patterns: finalPatterns,
    tierBreakdown,
  }
}
