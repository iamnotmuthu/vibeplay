import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAgentPlaygroundStore } from '@/store/agentPlaygroundStore'
import { Monitoring } from './Monitoring'

export function MonitoringModal() {
  const monitoringModalOpen = useAgentPlaygroundStore((s) => s.monitoringModalOpen)
  const closeMonitoringModal = useAgentPlaygroundStore((s) => s.closeMonitoringModal)

  // Handle Escape key
  useEffect(() => {
    if (!monitoringModalOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMonitoringModal()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [monitoringModalOpen, closeMonitoringModal])

  return (
    <AnimatePresence>
      {monitoringModalOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={closeMonitoringModal}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="monitoring-modal-title"
          >
            <div
              className="w-full max-w-6xl max-h-[90vh] rounded-2xl bg-white border flex flex-col shadow-xl"
              style={{
                borderColor: '#e5e7eb',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                <h1 id="monitoring-modal-title" className="text-2xl font-bold text-gray-900">
                  Production Monitoring Dashboard
                </h1>
                <button
                  onClick={closeMonitoringModal}
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  aria-label="Close monitoring modal"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto">
                <Monitoring />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
