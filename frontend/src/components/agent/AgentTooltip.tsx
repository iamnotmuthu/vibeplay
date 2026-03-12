import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const TOOLTIP_WIDTH = 280
const TOOLTIP_GAP = 8
const VIEWPORT_MARGIN = 8
// Rough estimate used only for the flip decision — actual height varies by content
const ESTIMATED_TOOLTIP_HEIGHT = 110

function resolvePosition(
  rect: DOMRect,
  preferredPosition: 'top' | 'bottom',
  align: 'center' | 'start',
  tooltipWidth: number,
) {
  // Flip vertically if preferred side lacks space
  let resolvedPosition = preferredPosition
  if (preferredPosition === 'top' && rect.top - TOOLTIP_GAP < ESTIMATED_TOOLTIP_HEIGHT) {
    resolvedPosition = 'bottom'
  } else if (
    preferredPosition === 'bottom' &&
    rect.bottom + TOOLTIP_GAP + ESTIMATED_TOOLTIP_HEIGHT > window.innerHeight
  ) {
    resolvedPosition = 'top'
  }

  const top =
    resolvedPosition === 'top'
      ? rect.top - TOOLTIP_GAP // card will also get translateY(-100%)
      : rect.bottom + TOOLTIP_GAP

  // Raw horizontal anchor before clamping
  const rawLeft =
    align === 'start'
      ? rect.left
      : rect.left + rect.width / 2 - tooltipWidth / 2

  // Clamp so the card never bleeds off either viewport edge
  const clampedLeft = Math.max(
    VIEWPORT_MARGIN,
    Math.min(rawLeft, window.innerWidth - tooltipWidth - VIEWPORT_MARGIN),
  )

  // Arrow points at trigger centre regardless of clamping
  const triggerCenterX = rect.left + rect.width / 2
  const arrowLeftPx = Math.max(8, Math.min(triggerCenterX - clampedLeft, tooltipWidth - 8))

  return { resolvedPosition, top, left: clampedLeft, arrowLeftPx }
}

interface AgentTooltipProps {
  title: string
  content: string
  trigger?: 'hover' | 'click'
  position?: 'top' | 'bottom'
  align?: 'center' | 'start'
  children: React.ReactNode
}

export function AgentTooltip({
  title,
  content,
  trigger = 'hover',
  position = 'top',
  align = 'center',
  children,
}: AgentTooltipProps) {
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (effectiveTrigger.current !== 'hover') return
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (containerRef.current) setRect(containerRef.current.getBoundingClientRect())
    setVisible(true)
  }

  const handleMouseLeave = () => {
    if (effectiveTrigger.current !== 'hover') return
    hideTimerRef.current = setTimeout(() => setVisible(false), 150)
  }

  const handleClick = () => {
    if (effectiveTrigger.current !== 'click') return
    if (containerRef.current) setRect(containerRef.current.getBoundingClientRect())
    setVisible(!visible)
  }

  const cancelHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }

  const closeTooltip = () => {
    setVisible(false)
  }

  // Handle outside clicks and Escape key for click trigger mode
  useEffect(() => {
    if (effectiveTrigger.current !== 'click' || !visible) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [trigger, visible])

  // Detect touch device — switch hover tooltips to click-based on touch
  const effectiveTrigger = useRef(trigger)
  useEffect(() => {
    if (trigger === 'hover' && 'ontouchstart' in window) {
      effectiveTrigger.current = 'click'
    } else {
      effectiveTrigger.current = trigger
    }
  }, [trigger])

  // On touch devices, hover tooltips become click-based, so we need both handlers
  const wrapperProps = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
  }

  return (
    <div ref={containerRef} className="relative inline-flex shrink-0" {...wrapperProps}>
      {children}
      {createPortal(
        <AnimatePresence>
          {visible && rect && (() => {
            const { resolvedPosition, top, left, arrowLeftPx } = resolvePosition(
              rect,
              position,
              align,
              TOOLTIP_WIDTH,
            )
            return (
              <motion.div
                key="agent-tooltip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'fixed',
                  top,
                  left,
                  transform: resolvedPosition === 'top' ? 'translateY(-100%)' : undefined,
                  width: TOOLTIP_WIDTH,
                  zIndex: 9999,
                  background: '#ffffff',
                  border: '1px solid #d1d5db',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
                  borderRadius: 8,
                  padding: 12,
                }}
                onMouseEnter={cancelHide}
                onMouseLeave={effectiveTrigger.current === 'hover' ? () => setVisible(false) : undefined}
              >
                {/* Header with title and close button */}
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[12px] font-semibold text-gray-900">{title}</p>
                  {effectiveTrigger.current === 'click' && (
                    <button
                      onClick={closeTooltip}
                      className="ml-2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                      aria-label="Close tooltip"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-[12px] leading-relaxed text-gray-700">{content}</p>

                {/* Arrow — always points at the trigger centre */}
                <div
                  style={{
                    position: 'absolute',
                    ...(resolvedPosition === 'top' ? { top: '100%' } : { bottom: '100%' }),
                    left: arrowLeftPx,
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    ...(resolvedPosition === 'top'
                      ? { borderTop: '4px solid #d1d5db' }
                      : { borderBottom: '4px solid #d1d5db' }),
                  }}
                />
              </motion.div>
            )
          })()}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}