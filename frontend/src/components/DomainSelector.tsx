import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Phone,
    Shield,
    TrendingUp,
    HeartPulse,
    Users,
    Zap,
    FileSearch,
    Settings,
    Truck,
    Ship,
    PackageCheck,
    BarChart3,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    ExternalLink,
} from 'lucide-react'
import { DOMAIN_SCENARIOS, type DomainScenario } from '@/lib/domainData'
import { PREBUILT_DATASETS } from '@/lib/constants'
import { usePlaygroundStore } from '@/store/playgroundStore'
import type { StageId } from '@/store/types'

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    phone: Phone,
    shield: Shield,
    'trending-up': TrendingUp,
    'heart-pulse': HeartPulse,
    users: Users,
    zap: Zap,
    'file-search': FileSearch,
    settings: Settings,
    truck: Truck,
    ship: Ship,
    'package-check': PackageCheck,
    'bar-chart-3': BarChart3,
}

interface DomainGroup {
    industry: string
    scenarios: DomainScenario[]
    color: string
    icon: string
    badge: string
}

interface DomainSelectorProps {
    onSelect: (domainId: string | null) => void
}

export function DomainSelector({ onSelect }: DomainSelectorProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [launching, setLaunching] = useState(false)
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
    const [hoveredDomain, setHoveredDomain] = useState<string | null>(null)

    const setActiveDomain = usePlaygroundStore((s) => s.setActiveDomain)
    const selectDataset = usePlaygroundStore((s) => s.selectDataset)
    const selectObjective = usePlaygroundStore((s) => s.selectObjective)
    const setSessionId = usePlaygroundStore((s) => s.setSessionId)
    const addLog = usePlaygroundStore((s) => s.addLog)
    const setStep = usePlaygroundStore((s) => s.setStep)

    const domainGroups = useMemo<DomainGroup[]>(() => {
        const groupMap = new Map<string, DomainScenario[]>()
        for (const s of DOMAIN_SCENARIOS) {
            const list = groupMap.get(s.industry) ?? []
            list.push(s)
            groupMap.set(s.industry, list)
        }
        return Array.from(groupMap.entries()).map(([industry, scenarios]) => ({
            industry,
            scenarios,
            color: scenarios[0].color,
            icon: scenarios[0].icon,
            badge: scenarios[0].badge,
        }))
    }, [])

    const filteredScenarios = useMemo(
        () => selectedDomain ? DOMAIN_SCENARIOS.filter((s) => s.industry === selectedDomain) : [],
        [selectedDomain],
    )

    const handleLaunch = async (scenario: DomainScenario) => {
        setSelectedId(scenario.id)
        setLaunching(true)

        await new Promise((r) => setTimeout(r, 600))

        const dataset = PREBUILT_DATASETS.find((d) => d.id === scenario.datasetId)
        const objective = dataset?.objectives.find((o) => o.id === scenario.defaultObjectiveId)

        if (dataset && objective) {
            const sessionId = `session-${Date.now()}`
            setActiveDomain(scenario.id)
            setSessionId(sessionId)
            selectDataset(dataset)
            selectObjective(objective)
            addLog(`Domain: ${scenario.label}`, 'action')
            addLog(`Dataset: ${dataset.name} (${dataset.rows.toLocaleString()} rows, ${dataset.features} features)`, 'info')
            addLog(`Objective: ${objective.label}`, 'action')
            addLog(`Target: ${objective.targetColumn} | Metric: ${objective.metric}`, 'info')
            addLog('Session initialized — starting autonomous analysis', 'success')
            setStep(1 as StageId)
            onSelect(scenario.id)
        }
    }

    return (
        <div
            className="min-h-screen flex flex-col relative overflow-hidden"
            style={{
                background: '#fafafa',
                color: '#1e293b',
            }}
        >
            {/* Subtle ambient glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-[0.07] pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(59,130,246,0.8) 0%, rgba(139,92,246,0.4) 40%, transparent 70%)',
                }}
            />

            {/* Header */}
            <header
                className="h-20 border-b px-6 flex items-center justify-between shrink-0 z-50 sticky top-0"
                style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    borderColor: '#e5e7eb',
                }}
            >
                <div className="flex items-center gap-3">
                    <a
                        href="https://vibemodel.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:opacity-80 transition-opacity"
                        aria-label="VibeModel home"
                    >
                        <img
                            src={`${import.meta.env.BASE_URL}VM_Logo_Full Color.png`}
                            alt="VibeModel"
                            style={{ height: 48, width: 'auto' }}
                        />
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="https://vibemodel.ai/#beta-signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                            border: '1px solid #e5e7eb',
                            color: '#374151',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#9ca3af'
                            e.currentTarget.style.color = '#111827'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb'
                            e.currentTarget.style.color = '#374151'
                        }}
                    >
                        Beta Waitlist
                    </a>
                    <motion.a
                        href="https://vibemodel.ai/book-demo.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -2, scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            boxShadow: '0 1px 4px rgba(59,130,246,0.3)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.4)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 1px 4px rgba(59,130,246,0.3)'
                        }}
                    >
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                                backgroundSize: '200% 100%',
                            }}
                            animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                        />
                        <span className="relative z-10">Book a Demo</span>
                        <ExternalLink className="w-3.5 h-3.5 relative z-10" />
                    </motion.a>
                </div>
            </header>

            {/* Hero */}
            <div className="text-center pt-20 pb-12 px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
                        style={{
                            background: 'rgba(59,130,246,0.06)',
                            border: '1px solid rgba(59,130,246,0.15)',
                            color: '#475569',
                        }}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Autonomous AI Lifecycle
                        </span>
                        <span className="text-gray-300">·</span>
                        <span>End-to-End in Minutes</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight" style={{ color: '#0f172a' }}>
                        Choose your industry.<br />
                        <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Watch AI build your model.
                        </span>
                    </h1>
                    <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
                        Pick an industry, define your goal, and watch VibeModel build a production-ready model — end-to-end in under 3 minutes.
                    </p>
                </motion.div>
            </div>

            {/* Domain / Scenario Grid */}
            <div className="flex-1 px-6 pb-20 relative z-10">
                <AnimatePresence mode="wait">
                    {selectedDomain === null ? (
                        /* ── Domain cards ── */
                        <motion.div
                            key="domains"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                        >
                            {domainGroups.map((group, i) => {
                                const IconComp = iconMap[group.icon] || Sparkles
                                const isHovered = hoveredDomain === group.industry
                                const totalRows = group.scenarios.reduce((sum, s) => {
                                    const ds = PREBUILT_DATASETS.find((d) => d.id === s.datasetId)
                                    return sum + (ds?.rows ?? 0)
                                }, 0)

                                return (
                                    <motion.div
                                        key={group.industry}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.05 }}
                                        onHoverStart={() => setHoveredDomain(group.industry)}
                                        onHoverEnd={() => setHoveredDomain(null)}
                                        onClick={() => setSelectedDomain(group.industry)}
                                        className="relative group cursor-pointer"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: isHovered ? 1.02 : 1,
                                                y: isHovered ? -4 : 0,
                                            }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                            className="relative rounded-2xl p-6 h-full flex flex-col overflow-hidden"
                                            style={{
                                                background: '#ffffff',
                                                border: isHovered
                                                    ? `1px solid ${group.color}50`
                                                    : '1px solid #e5e7eb',
                                                boxShadow: isHovered
                                                    ? `0 12px 40px -12px ${group.color}20, 0 4px 12px rgba(0,0,0,0.06)`
                                                    : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            {/* Icon + Count badge */}
                                            <div className="flex items-start justify-between mb-5">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${group.color}15, ${group.color}05)`,
                                                        border: `1px solid ${group.color}25`,
                                                    }}
                                                >
                                                    <IconComp className="w-6 h-6" style={{ color: group.color }} />
                                                </div>
                                                <span
                                                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                                                    style={{
                                                        background: `${group.color}10`,
                                                        color: group.color,
                                                        border: `1px solid ${group.color}25`,
                                                    }}
                                                >
                                                    {group.scenarios.length} {group.scenarios.length === 1 ? 'scenario' : 'scenarios'}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{group.industry}</h3>
                                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                                    {group.scenarios.map((s) => s.tagline).join(' · ')}
                                                </p>
                                            </div>

                                            {/* Stats row */}
                                            <div
                                                className="flex items-center gap-3 mt-5 pt-4"
                                                style={{ borderTop: '1px solid #f3f4f6' }}
                                            >
                                                <span className="text-xs text-gray-400 font-mono">{totalRows.toLocaleString()} rows</span>
                                                <span className="text-gray-300">·</span>
                                                <span className="text-xs text-gray-400 font-mono">{group.scenarios.length} {group.scenarios.length === 1 ? 'dataset' : 'datasets'}</span>
                                            </div>

                                            {/* CTA */}
                                            <AnimatePresence>
                                                {isHovered && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 5 }}
                                                        className="absolute bottom-6 right-6"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold" style={{ color: group.color }}>
                                                                Explore
                                                            </span>
                                                            <ArrowRight className="w-4 h-4" style={{ color: group.color }} />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    ) : (
                        /* ── Scenario cards within selected domain ── */
                        <motion.div
                            key="scenarios"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Back button */}
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => { setSelectedDomain(null); setSelectedId(null); setLaunching(false) }}
                                className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white"
                                style={{ color: '#6b7280' }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                All Industries
                            </motion.button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredScenarios.map((scenario, i) => {
                                    const IconComp = iconMap[scenario.icon] || Sparkles
                                    const isHovered = hoveredId === scenario.id
                                    const isSelected = selectedId === scenario.id

                                    return (
                                        <motion.div
                                            key={scenario.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: i * 0.05 }}
                                            onHoverStart={() => setHoveredId(scenario.id)}
                                            onHoverEnd={() => setHoveredId(null)}
                                            onClick={() => !launching && handleLaunch(scenario)}
                                            className="relative group cursor-pointer"
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: isSelected ? 0.98 : isHovered ? 1.02 : 1,
                                                    y: isHovered ? -4 : 0,
                                                }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="relative rounded-2xl p-6 h-full flex flex-col overflow-hidden"
                                                style={{
                                                    background: '#ffffff',
                                                    border: isHovered
                                                        ? `1px solid ${scenario.color}50`
                                                        : '1px solid #e5e7eb',
                                                    boxShadow: isHovered
                                                        ? `0 12px 40px -12px ${scenario.color}20, 0 4px 12px rgba(0,0,0,0.06)`
                                                        : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                                                }}
                                            >
                                                {/* Icon + Badge */}
                                                <div className="flex items-start justify-between mb-5">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${scenario.color}15, ${scenario.color}05)`,
                                                            border: `1px solid ${scenario.color}25`,
                                                        }}
                                                    >
                                                        <IconComp className="w-6 h-6" style={{ color: scenario.color }} />
                                                    </div>
                                                    <span
                                                        className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                                        style={{
                                                            background: '#f3f4f6',
                                                            color: '#6b7280',
                                                            border: '1px solid #e5e7eb',
                                                        }}
                                                    >
                                                        {scenario.badge}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{scenario.label}</h3>
                                                    <p className="text-sm font-medium mb-3" style={{ color: scenario.color }}>
                                                        {scenario.tagline}
                                                    </p>
                                                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                                                        {scenario.heroSubtitle}
                                                    </p>
                                                </div>

                                                {/* Stats row */}
                                                <div
                                                    className="flex items-center gap-3 mt-5 pt-4"
                                                    style={{ borderTop: '1px solid #f3f4f6' }}
                                                >
                                                    {(() => {
                                                        const ds = PREBUILT_DATASETS.find((d) => d.id === scenario.datasetId)
                                                        return ds ? (
                                                            <>
                                                                <span className="text-xs text-gray-400 font-mono">{ds.rows.toLocaleString()} rows</span>
                                                                <span className="text-gray-300">·</span>
                                                                <span className="text-xs text-gray-400 font-mono">{ds.features} features</span>
                                                            </>
                                                        ) : null
                                                    })()}
                                                </div>

                                                {/* CTA */}
                                                <AnimatePresence>
                                                    {(isHovered || isSelected) && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 5 }}
                                                            className="absolute bottom-6 right-6"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold" style={{ color: scenario.color }}>
                                                                    {isSelected && launching ? 'Launching...' : 'Start'}
                                                                </span>
                                                                <motion.div
                                                                    animate={{ x: isSelected && launching ? 4 : 0 }}
                                                                    transition={{ repeat: isSelected && launching ? Infinity : 0, duration: 0.6, repeatType: 'reverse' }}
                                                                >
                                                                    <ArrowRight className="w-4 h-4" style={{ color: scenario.color }} />
                                                                </motion.div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <footer
                className="border-t px-6 py-6"
                style={{
                    background: '#ffffff',
                    borderColor: '#e5e7eb',
                }}
            >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">
                        © 2026 VibeModel.ai
                    </p>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://vibemodel.ai/#beta-signup"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-blue-500 font-medium transition-colors"
                        >
                            Sign up for Beta Waitlist →
                        </a>
                        <a
                            href="mailto:hello@vibemodel.ai"
                            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            hello@vibemodel.ai
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
