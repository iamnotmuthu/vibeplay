import { Brain, Menu, ExternalLink } from 'lucide-react'
import { usePlaygroundStore } from '@/store/playgroundStore'

export function BrandHeader() {
  const toggleSidebar = usePlaygroundStore((s) => s.toggleSidebar)

  return (
    <header className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-gray-900">AI Data Scientist</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
            Playground
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="#book-demo"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Book a Demo
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  )
}
