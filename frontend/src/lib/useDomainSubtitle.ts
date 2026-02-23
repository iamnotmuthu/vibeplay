import { usePlaygroundStore } from '@/store/playgroundStore'
import { getDomainById } from '@/lib/domainData'

type StageKey = 'profiling' | 'patterns' | 'features' | 'arena' | 'evaluation' | 'drift'

export function useDomainSubtitle(stage: StageKey, fallback: string): string {
    const activeDomainId = usePlaygroundStore((s) => s.activeDomainId)
    if (!activeDomainId) return fallback
    const domain = getDomainById(activeDomainId)
    return domain?.stageSubtitles[stage] ?? fallback
}
