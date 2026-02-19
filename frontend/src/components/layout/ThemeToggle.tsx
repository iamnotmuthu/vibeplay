import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePlaygroundStore } from '@/store/playgroundStore'

export function ThemeToggle() {
    const theme = usePlaygroundStore((s) => s.theme)
    const toggleTheme = usePlaygroundStore((s) => s.toggleTheme)

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center justify-center p-2 rounded-lg transition-colors ${theme === 'dark'
                    ? 'text-yellow-400 hover:bg-white/10'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                ) : (
                    <Moon className="w-5 h-5" />
                )}
            </motion.div>
        </button>
    )
}
