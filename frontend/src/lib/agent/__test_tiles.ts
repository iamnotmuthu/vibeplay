import { getDimensionAnalysisData } from './dimensionAnalysisData'
import { getCombinatorialPatternsData } from './combinatorialPatternsData'
import { getContextDefinitionData } from './contextDefinitionData'

const TILE_IDS = [
  'faq-knowledge',
  'doc-intelligence',
  'research-comparison',
  'decision-workflow',
  'saas-copilot',
  'ops-agent',
  'coding-agent',
  'onprem-assistant',
  'multimodal-agent',
  'consumer-chat',
]

console.log('=== TILE DATA VERIFICATION ===\n')

for (const tileId of TILE_IDS) {
  const ctx = getContextDefinitionData(tileId)
  const dim = getDimensionAnalysisData(tileId)
  const pat = getCombinatorialPatternsData(tileId)

  const ctxOk = ctx !== null
  const dimOk = dim !== null
  const patOk = pat !== null

  const taskCount = dim?.taskDimensions?.length ?? 0
  const dataCount = dim?.dataDimensions?.length ?? 0
  const userCount = dim?.userProfileDimensions?.length ?? 0
  const patternCount = pat?.patterns?.length ?? 0
  const matrixRows = pat?.matrix?.length ?? 0
  const matrixCols = pat?.matrix?.[0]?.length ?? 0

  const status = ctxOk && dimOk && patOk ? '✅' : '❌'

  console.log(`${status} ${tileId}`)
  console.log(`   Context: ${ctxOk ? 'YES' : 'MISSING'}`)
  console.log(`   Dimensions: ${dimOk ? `YES (${taskCount} tasks, ${dataCount} data, ${userCount} users)` : 'MISSING'}`)
  console.log(`   Patterns: ${patOk ? `YES (${patternCount} patterns, ${matrixRows}×${matrixCols} matrix)` : 'MISSING'}`)

  if (dim && pat) {
    const taskIds = new Set(dim.taskDimensions.map((t: any) => t.id))
    const dataIds = new Set(dim.dataDimensions.map((d: any) => d.id))
    const userIds = new Set(dim.userProfileDimensions.map((u: any) => u.id))

    let badRefs = 0
    for (const p of pat.patterns) {
      if (!taskIds.has(p.taskDimensionId)) {
        console.log(`   ⚠️  Bad taskDimensionId: ${p.taskDimensionId}`)
        badRefs++
      }
      for (const did of p.dataDimensionIds) {
        if (!dataIds.has(did)) {
          console.log(`   ⚠️  Bad dataDimensionId: ${did}`)
          badRefs++
        }
      }
      if (!userIds.has(p.userProfileDimensionId)) {
        console.log(`   ⚠️  Bad userProfileDimensionId: ${p.userProfileDimensionId}`)
        badRefs++
      }
    }
    if (badRefs === 0) {
      console.log(`   ID refs: ALL VALID`)
    } else {
      console.log(`   ID refs: ${badRefs} BAD REFERENCES`)
    }
  }
  console.log('')
}
