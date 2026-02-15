import { motion } from 'framer-motion'
import { Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AIInsight } from '@/store/types'

const typeConfig = {
  info: { icon: Lightbulb, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-500' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-500' },
  success: { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
}

export function InsightCard({ insight, delay = 0 }: { insight: AIInsight; delay?: number }) {
  const config = typeConfig[insight.type]
  const Icon = config.icon
  const [displayText, setDisplayText] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayText(insight.text.slice(0, i))
      if (i >= insight.text.length) clearInterval(interval)
    }, 30)
    return () => clearInterval(interval)
  }, [started, insight.text])

  if (!started) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bg} ${config.border} border rounded-lg px-4 py-3 flex items-start gap-3`}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} />
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          AI Insight
        </span>
        <p className={`text-sm ${config.text} leading-relaxed mt-0.5`}>
          {displayText}
          {displayText.length < insight.text.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="inline-block w-0.5 h-3.5 bg-current ml-0.5 align-middle"
            />
          )}
        </p>
      </div>
    </motion.div>
  )
}
