import { motion, AnimatePresence } from 'framer-motion'
import { X, Activity, CheckCircle2, AlertTriangle, Zap } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'
import type { LogEntry } from '@/store/types'

const typeIcons = {
  info: Activity,
  success: CheckCircle2,
  warning: AlertTriangle,
  action: Zap,
}

const typeColors = {
  info: 'text-gray-500',
  success: 'text-success',
  warning: 'text-warning',
  action: 'text-primary',
}

function LogItem({ entry }: { entry: LogEntry }) {
  const Icon = typeIcons[entry.type]
  const color = typeColors[entry.type]

  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{entry.message}</p>
        <span className="text-[10px] text-gray-400 font-mono">{time}</span>
      </div>
    </motion.div>
  )
}

export function SessionSidebar() {
  const sidebarOpen = usePlaygroundStore((s) => s.sidebarOpen)
  const toggleSidebar = usePlaygroundStore((s) => s.toggleSidebar)
  const sessionLog = usePlaygroundStore((s) => s.sessionLog)

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={toggleSidebar}
          />
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col shadow-xl"
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Session Log</h3>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {sessionLog.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">
                    Session activity will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {sessionLog.map((entry, i) => (
                    <LogItem key={i} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
