import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { glossaryEntries, getGlossaryEntriesForStage, type GlossaryEntry } from '@/lib/glossaryData'
import { STAGE_LABELS, type StageId } from '@/store/types'

const CATEGORY_LABELS: Record<GlossaryEntry['category'], string> = {
  algorithm: 'Algorithm',
  metric: 'Metric',
  'data-concept': 'Data Concept',
  'model-component': 'Model Component',
  deployment: 'Deployment',
  pattern: 'Pattern',
}

const CATEGORY_ORDER: GlossaryEntry['category'][] = [
  'data-concept',
  'pattern',
  'metric',
  'algorithm',
  'model-component',
  'deployment',
]

function getCategoryColor(category: GlossaryEntry['category']): { bg: string; text: string } {
  switch (category) {
    case 'algorithm':
      return { bg: '#fef3c7', text: '#92400e' }
    case 'metric':
      return { bg: '#dcfce7', text: '#166534' }
    case 'data-concept':
      return { bg: '#ede9fe', text: '#5b21b6' }
    case 'model-component':
      return { bg: '#fee2e2', text: '#991b1b' }
    case 'deployment':
      return { bg: '#e0f2fe', text: '#075985' }
    case 'pattern':
      return { bg: '#fce7f3', text: '#9d174d' }
  }
}

export function GlossaryPanel() {
  const glossaryOpen = usePlaygroundStore((s) => s.glossaryOpen)
  const setGlossaryOpen = usePlaygroundStore((s) => s.setGlossaryOpen)
  const glossaryHighlightTerm = usePlaygroundStore((s) => s.glossaryHighlightTerm)
  const setGlossaryHighlightTerm = usePlaygroundStore((s) => s.setGlossaryHighlightTerm)
  const currentStep = usePlaygroundStore((s) => s.currentStep)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<GlossaryEntry['category'] | null>(null)
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())
  const [stageFilter, setStageFilter] = useState(false)
  const [highlightedTerm, setHighlightedTerm] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(timer)
  }, [search])

  // Focus search when opened
  useEffect(() => {
    if (glossaryOpen) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [glossaryOpen])

  // Handle highlight term from MLTooltip "Learn more →"
  useEffect(() => {
    if (glossaryOpen && glossaryHighlightTerm) {
      const term = glossaryHighlightTerm
      setGlossaryHighlightTerm(null)
      setExpandedTerms((prev) => new Set([...prev, term]))
      setHighlightedTerm(term)
      setTimeout(() => {
        termRefs.current[term]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
      highlightTimerRef.current = setTimeout(() => setHighlightedTerm(null), 2000)
    }
  }, [glossaryOpen, glossaryHighlightTerm, setGlossaryHighlightTerm])

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && glossaryOpen) setGlossaryOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [glossaryOpen, setGlossaryOpen])

  // Reset category filter when stage filter is toggled
  const handleStageFilterToggle = () => {
    setStageFilter((prev) => !prev)
    setActiveCategory(null)
  }

  // Build entry list
  const baseEntries =
    stageFilter && currentStep >= 3 ? getGlossaryEntriesForStage(currentStep) : glossaryEntries

  const filtered = baseEntries.filter((e) => {
    if (activeCategory && e.category !== activeCategory) return false
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      return (
        e.displayName.toLowerCase().includes(q) ||
        e.shortDefinition.toLowerCase().includes(q) ||
        e.term.includes(q)
      )
    }
    return true
  })

  const availableCategories = CATEGORY_ORDER.filter((cat) => baseEntries.some((e) => e.category === cat))

  const toggleTerm = (term: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev)
      if (next.has(term)) next.delete(term)
      else next.add(term)
      return next
    })
  }

  const navigateToRelated = (term: string) => {
    setExpandedTerms((prev) => new Set([...prev, term]))
    setHighlightedTerm(term)
    setTimeout(() => {
      termRefs.current[term]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    highlightTimerRef.current = setTimeout(() => setHighlightedTerm(null), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {glossaryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setGlossaryOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-in panel */}
      <AnimatePresence>
        {glossaryOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{
              width: 400,
              background: '#ffffff',
              borderLeft: '1px solid #e5e7eb',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid #e5e7eb' }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                <h2 className="text-base font-semibold text-gray-900">ML Glossary</h2>
                <span className="text-xs text-gray-400 font-medium">{filtered.length} terms</span>
              </div>
              <button
                onClick={() => setGlossaryOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 shrink-0" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search terms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
              </div>
            </div>

            {/* Category + stage filters */}
            <div
              className="px-5 py-2.5 shrink-0 flex flex-wrap gap-1.5"
              style={{ borderBottom: '1px solid #e5e7eb' }}
            >
              {currentStep >= 3 && (
                <button
                  onClick={handleStageFilterToggle}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: stageFilter ? '#dbeafe' : '#f3f4f6',
                    color: stageFilter ? '#1d4ed8' : '#6b7280',
                    border: stageFilter ? '1.5px solid #1d4ed830' : '1.5px solid transparent',
                  }}
                >
                  {STAGE_LABELS[currentStep as StageId]}
                </button>
              )}
              {availableCategories.map((cat) => {
                const isActive = activeCategory === cat
                const color = getCategoryColor(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{
                      background: isActive ? color.bg : '#f3f4f6',
                      color: isActive ? color.text : '#6b7280',
                      border: isActive ? `1.5px solid ${color.text}30` : '1.5px solid transparent',
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                )
              })}
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400">No terms match your search</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
                  {filtered.map((entry) => {
                    const isExpanded = expandedTerms.has(entry.term)
                    const isHighlighted = highlightedTerm === entry.term
                    const catColor = getCategoryColor(entry.category)
                    return (
                      <div
                        key={entry.term}
                        ref={(el) => {
                          termRefs.current[entry.term] = el
                        }}
                        style={{
                          transition: 'background 0.3s',
                          background: isHighlighted ? 'rgba(59,130,246,0.06)' : 'transparent',
                        }}
                      >
                        <button
                          onClick={() => toggleTerm(entry.term)}
                          className="w-full px-5 py-3.5 text-left flex items-start gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-sm font-semibold text-gray-900">{entry.displayName}</span>
                              <span
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ background: catColor.bg, color: catColor.text }}
                              >
                                {CATEGORY_LABELS[entry.category]}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{entry.shortDefinition}</p>
                          </div>
                          <div className="shrink-0 mt-0.5">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                                <p className="text-xs leading-relaxed text-gray-600 mt-3">
                                  {entry.fullDefinition}
                                </p>
                                {entry.whyItMatters && (
                                  <div
                                    className="mt-3 p-3 rounded-lg"
                                    style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}
                                  >
                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                                      Why it matters
                                    </div>
                                    <p className="text-xs text-blue-800 leading-relaxed">{entry.whyItMatters}</p>
                                  </div>
                                )}
                                {entry.relatedTerms && entry.relatedTerms.length > 0 && (
                                  <div className="mt-3">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                      Related
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {entry.relatedTerms
                                        .filter(
                                          (t) => t !== entry.term && glossaryEntries.some((e) => e.term === t),
                                        )
                                        .map((t) => {
                                          const related = glossaryEntries.find((e) => e.term === t)
                                          if (!related) return null
                                          return (
                                            <button
                                              key={t}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigateToRelated(t)
                                              }}
                                              className="text-xs px-2 py-0.5 rounded-full transition-colors hover:bg-indigo-100"
                                              style={{ background: '#eef2ff', color: '#4f46e5' }}
                                            >
                                              {related.displayName}
                                            </button>
                                          )
                                        })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
