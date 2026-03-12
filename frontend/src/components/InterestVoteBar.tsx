import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { SOLUTION_TYPES } from '@/lib/solutionTypes'

const COMING_SOON_TYPES = SOLUTION_TYPES.filter((t) => t.status === 'coming-soon')

function getLocalCount(typeId: string): number {
  try {
    return parseInt(localStorage.getItem(`waitlist_${typeId}_count`) || '0', 10)
  } catch {
    return 0
  }
}

function incrementLocalCount(typeId: string): number {
  try {
    const next = getLocalCount(typeId) + 1
    localStorage.setItem(`waitlist_${typeId}_count`, next.toString())
    return next
  } catch {
    return 0
  }
}

export function InterestVoteBar() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [voted, setVoted] = useState<Record<string, boolean>>({})
  const [votedRecently, setVotedRecently] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const initial: Record<string, number> = {}
    const votedStored: Record<string, boolean> = {}
    for (const t of COMING_SOON_TYPES) {
      initial[t.id] = getLocalCount(t.id)
      votedStored[t.id] = localStorage.getItem(`waitlist_${t.id}_voted`) === '1'
    }
    setCounts(initial)
    setVoted(votedStored)
  }, [])

  const handleVote = (typeId: string) => {
    if (voted[typeId]) return

    const next = incrementLocalCount(typeId)
    try {
      localStorage.setItem(`waitlist_${typeId}_voted`, '1')
    } catch {}

    setCounts((prev) => ({ ...prev, [typeId]: next }))
    setVoted((prev) => ({ ...prev, [typeId]: true }))
    setVotedRecently((prev) => ({ ...prev, [typeId]: true }))

    // Revert "Voted!" label after 1.5s
    setTimeout(() => {
      setVotedRecently((prev) => ({ ...prev, [typeId]: false }))
    }, 1500)

    // Optionally send to endpoint if configured
    const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined
    if (endpoint) {
      const type = COMING_SOON_TYPES.find((t) => t.id === typeId)
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          solutionTypeId: typeId,
          solutionTypeLabel: type?.label ?? typeId,
          action: 'vote',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Fire-and-forget — ignore errors for vote pings
      })
    }
  }

  return (
    <div
      className="border-t px-6 py-8"
      style={{ background: '#f8fafc', borderColor: '#e5e7eb' }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-600">What should we build next?</p>
        </div>

        {/* Vote cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COMING_SOON_TYPES.map((type, i) => {
            const Icon = type.icon
            const hasVoted = voted[type.id]
            const recentlyVoted = votedRecently[type.id]
            const count = counts[type.id] ?? 0

            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => handleVote(type.id)}
                className="rounded-xl p-4 text-center transition-all duration-150"
                style={{
                  background: '#ffffff',
                  border: hasVoted ? `1px solid ${type.color}40` : '1px solid #e5e7eb',
                  cursor: hasVoted ? 'default' : 'pointer',
                  boxShadow: hasVoted ? `0 2px 8px ${type.color}12` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!hasVoted) {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = `${type.color}50`
                    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!hasVoted) {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#e5e7eb'
                    el.style.boxShadow = 'none'
                  }
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{
                    background: `${type.color}12`,
                    border: `1px solid ${type.color}25`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: type.color }} />
                </div>

                <p className="text-xs font-bold text-gray-900 mb-1">{type.label}</p>

                {count > 0 && (
                  <p className="text-base font-bold mb-1" style={{ color: type.color }}>
                    {count}
                  </p>
                )}

                <p
                  className="text-xs font-medium transition-colors duration-200"
                  style={{ color: recentlyVoted ? type.color : '#9ca3af' }}
                >
                  {recentlyVoted ? 'Voted!' : hasVoted ? 'You voted' : "I'd use this"}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
