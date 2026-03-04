import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'
import { getGlossaryEntry } from '@/lib/glossaryData'
import { usePlaygroundStore } from '@/store/playgroundStore'

export function MLTooltip({
  term,
  position = 'top',
  align = 'center',
}: {
  term: string
  position?: 'top' | 'bottom'
  align?: 'center' | 'start'
}) {
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const entry = getGlossaryEntry(term)
  const setGlossaryOpen = usePlaygroundStore((s) => s.setGlossaryOpen)
  const setGlossaryHighlightTerm = usePlaygroundStore((s) => s.setGlossaryHighlightTerm)

  if (!entry) return null

  const handleMouseEnter = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (containerRef.current) {
      setRect(containerRef.current.getBoundingClientRect())
    }
    setVisible(true)
  }

  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => setVisible(false), 150)
  }

  const cancelHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }

  const handleLearnMore = () => {
    setVisible(false)
    setGlossaryHighlightTerm(term)
    setGlossaryOpen(true)
  }

  const getStyle = (): React.CSSProperties => {
    if (!rect) return {}
    const left = align === 'start' ? rect.left : rect.left + rect.width / 2
    const transforms: string[] = []
    if (align === 'center') transforms.push('translateX(-50%)')
    if (position === 'top') transforms.push('translateY(-100%)')
    return {
      position: 'fixed',
      top: position === 'top' ? rect.top - 8 : rect.bottom + 8,
      left,
      transform: transforms.length ? transforms.join(' ') : undefined,
      width: 256,
      zIndex: 9999,
      background: '#ffffff',
      border: '1px solid #d1d5db',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
      borderRadius: 8,
      padding: 12,
    }
  }

  const arrowLeft = align === 'start' ? 8 : '50%'
  const arrowTransform = align === 'start' ? undefined : 'translateX(-50%)'

  return (
    <div
      ref={containerRef}
      className="relative inline-flex shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
      {createPortal(
        <AnimatePresence>
          {visible && rect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={getStyle()}
              onMouseEnter={cancelHide}
              onMouseLeave={() => setVisible(false)}
            >
              <p className="text-[11px] font-semibold text-gray-700 mb-1">{entry.displayName}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#475569' }}>
                {entry.shortDefinition}
              </p>
              <button
                onClick={handleLearnMore}
                className="mt-2 text-[10px] font-semibold transition-colors block"
                style={{ color: '#3b82f6' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2563eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#3b82f6'
                }}
              >
                Learn more →
              </button>
              <div
                style={{
                  position: 'absolute',
                  ...(position === 'top' ? { top: '100%' } : { bottom: '100%' }),
                  left: arrowLeft,
                  transform: arrowTransform,
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  ...(position === 'top'
                    ? { borderTop: '4px solid #d1d5db' }
                    : { borderBottom: '4px solid #d1d5db' }),
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
