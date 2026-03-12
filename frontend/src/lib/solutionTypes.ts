import { TrendingUp, Sparkles, Bot, Compass } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface SolutionTypeUseCase {
  title: string
  description: string
  icon: string
}

export interface SolutionType {
  id: string
  label: string
  icon: LucideIcon
  status: 'active' | 'coming-soon'
  demoAvailable?: boolean
  demoId?: string
  color: string
  valueStatement: string
  useCases: SolutionTypeUseCase[]
}

export const SOLUTION_TYPES: SolutionType[] = [
  {
    id: 'predictive',
    label: 'Predictive AI',
    icon: TrendingUp,
    status: 'active',
    color: '#3b82f6',
    valueStatement: '',
    useCases: [],
  },
  {
    id: 'agentic',
    label: 'Agentic AI',
    icon: Bot,
    status: 'coming-soon',
    demoAvailable: true,
    demoId: 'agent',
    color: '#f59e0b',
    valueStatement:
      'Autonomous AI workflows that observe, decide, and act — with reliability boundaries so you know exactly where the agent is trustworthy.',
    useCases: [
      {
        title: 'Procurement Automation',
        description:
          'Agents that evaluate vendors, compare quotes, and flag anomalies across your supply chain',
        icon: 'shopping-cart',
      },
      {
        title: 'Incident Response Orchestration',
        description: 'Autonomous triage, escalation, and initial response for IT and security incidents',
        icon: 'shield',
      },
      {
        title: 'Sales Pipeline Qualification',
        description: 'Agents that research prospects, score leads, and draft personalized outreach',
        icon: 'users',
      },
    ],
  },
  {
    id: 'prescriptive',
    label: 'Prescriptive AI',
    icon: Compass,
    status: 'coming-soon',
    color: '#10b981',
    valueStatement:
      'The ultimate endgame — AI that analyzes all your data and tells you exactly what actions to take to succeed.',
    useCases: [
      {
        title: 'Revenue Optimization Engine',
        description: 'Prescriptive recommendations on pricing, promotion timing, and channel allocation',
        icon: 'trending-up',
      },
      {
        title: 'Workforce Planning Advisor',
        description:
          'Concrete hiring, reskilling, and restructuring recommendations based on attrition and performance patterns',
        icon: 'users',
      },
      {
        title: 'Supply Chain Prescriptor',
        description: 'Actionable decisions on inventory levels, routing, and supplier diversification',
        icon: 'truck',
      },
    ],
  },
  {
    id: 'generative',
    label: 'Generative AI',
    icon: Sparkles,
    status: 'coming-soon',
    color: '#8b5cf6',
    valueStatement:
      'Compose generative AI solutions that create content, synthesize data, and augment human creativity — with the same pattern-first reliability.',
    useCases: [
      {
        title: 'Product Description Generator',
        description: 'Auto-generate product descriptions that match your brand voice and convert',
        icon: 'file-text',
      },
      {
        title: 'Synthetic Data Augmentation',
        description: 'Generate realistic training data for underrepresented patterns in your dataset',
        icon: 'database',
      },
      {
        title: 'Document Summarization',
        description: 'Compress lengthy reports into structured, actionable summaries',
        icon: 'file-search',
      },
    ],
  },
]
