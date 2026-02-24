import { motion } from 'framer-motion'
import { ExternalLink, Menu, LayoutGrid } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import { getDomainById } from '@/lib/domainData'

interface BrandHeaderProps {
  onChangeDomain?: () => void
  onGoHome?: () => void
}

export function BrandHeader({ onChangeDomain, onGoHome }: BrandHeaderProps) {
  const toggleSidebar = usePlaygroundStore((s) => s.toggleSidebar)
  const activeDomainId = usePlaygroundStore((s) => s.activeDomainId)
  const domain = activeDomainId ? getDomainById(activeDomainId) : null

  return (
    <header
      className="h-20 px-4 sm:px-6 flex items-center justify-between shrink-0 z-50"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Left: Logo + domain badge */}
      <div className="flex items-center gap-3 min-w-0">
        <motion.button
          onClick={onGoHome}
          whileHover={{ opacity: 0.8 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
          title="Back to home"
        >
          <img
            src={`${import.meta.env.BASE_URL}VM_Logo_Full Color.png`}
            alt="VibeModel"
            style={{ height: 48, width: 'auto', objectFit: 'contain' }}
          />
        </motion.button>

        {/* Active domain badge */}
        {domain && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden sm:block" style={{ color: '#d1d5db' }}>·</span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full truncate max-w-[140px] sm:max-w-none"
              style={{
                background: `${domain.color}12`,
                color: domain.color,
                border: `1px solid ${domain.color}30`,
              }}
            >
              {domain.label}
            </span>
            {onChangeDomain && (
              <motion.button
                onClick={onChangeDomain}
                whileHover={{ y: -1, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                style={{
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#111827'
                  e.currentTarget.style.borderColor = '#9ca3af'
                  e.currentTarget.style.background = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.background = '#f9fafb'
                }}
                title="Change domain"
              >
                <LayoutGrid className="w-3 h-3" />
                Switch
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Right: CTAs */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Beta Waitlist */}
        <motion.a
          href="https://vibemodel.ai/#beta-signup"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            border: '1px solid #e5e7eb',
            color: '#374151',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#9ca3af'
            e.currentTarget.style.color = '#111827'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.color = '#374151'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Beta Waitlist
        </motion.a>

        {/* Book a Demo */}
        <motion.a
          href="https://vibemodel.ai/book-demo.html"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -2, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 1px 4px rgba(59,130,246,0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(59,130,246,0.25)'
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
          <ExternalLink className="w-3 h-3 relative z-10" />
        </motion.a>

        <motion.button
          onClick={toggleSidebar}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg transition-colors lg:hidden text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
      </div>
    </header>
  )
}
