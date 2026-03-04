import { create } from 'zustand'
import type {
  DatasetConfig,
  BusinessObjective,
  EDAResults,
  PatternResults,
  DimensionResults,
  ValidationSummaryResults,
  ModelSelectionResults,
  DeploymentMode,
  LogEntry,
  StageId,
  ActiveDomainId,
} from './types'

interface PlaygroundState {
  // Navigation
  currentStep: StageId
  completedSteps: Set<StageId>
  sidebarOpen: boolean
  glossaryOpen: boolean
  glossaryHighlightTerm: string | null
  viewMode: 'business' | 'technical'

  // Session
  sessionId: string | null
  sessionLog: LogEntry[]

  // Data
  datasets: DatasetConfig[]
  selectedDataset: DatasetConfig | null
  selectedObjective: BusinessObjective | null

  // Business Setup (step 2)
  businessGoal: string | null
  deploymentMode: DeploymentMode | null
  llmApiKey: string | null

  // Stage results
  edaResults: EDAResults | null
  edaProgress: { moduleId: string; percent: number } | null
  patternResults: PatternResults | null
  dimensionResults: DimensionResults | null
  validationSummaryResults: ValidationSummaryResults | null
  modelSelectionResults: ModelSelectionResults | null
  activeDomainId: ActiveDomainId

  // Actions
  setStep: (step: StageId) => void
  completeStep: (step: StageId) => void
  toggleSidebar: () => void
  setGlossaryOpen: (open: boolean) => void
  toggleGlossary: () => void
  setGlossaryHighlightTerm: (term: string | null) => void
  setViewMode: (mode: 'business' | 'technical') => void
  toggleViewMode: () => void
  setSessionId: (id: string) => void
  addLog: (message: string, type: LogEntry['type']) => void
  setDatasets: (datasets: DatasetConfig[]) => void
  selectDataset: (dataset: DatasetConfig) => void
  selectObjective: (objective: BusinessObjective) => void
  setBusinessGoal: (goal: string) => void
  setDeploymentMode: (mode: DeploymentMode) => void
  setLlmApiKey: (key: string) => void
  setEdaResults: (results: EDAResults) => void
  setEdaProgress: (progress: { moduleId: string; percent: number } | null) => void
  setPatternResults: (results: PatternResults) => void
  setDimensionResults: (results: DimensionResults) => void
  setValidationSummaryResults: (results: ValidationSummaryResults) => void
  setModelSelectionResults: (results: ModelSelectionResults) => void
  setActiveDomain: (id: ActiveDomainId) => void

  // Home navigation
  shouldGoHome: boolean
  setShouldGoHome: (value: boolean) => void

  reset: () => void
}

const initialState = {
  currentStep: 1 as StageId,
  completedSteps: new Set<StageId>(),
  sidebarOpen: false,
  glossaryOpen: false,
  glossaryHighlightTerm: null as string | null,
  viewMode: 'business' as 'business' | 'technical',
  sessionId: null,
  sessionLog: [],
  datasets: [],
  selectedDataset: null,
  selectedObjective: null,
  businessGoal: null,
  deploymentMode: null as DeploymentMode | null,
  llmApiKey: null,
  edaResults: null,
  edaProgress: null,
  patternResults: null,
  dimensionResults: null,
  validationSummaryResults: null,
  modelSelectionResults: null,
  activeDomainId: null as ActiveDomainId,
  shouldGoHome: false,
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  completeStep: (step) =>
    set((state) => {
      const next = new Set(state.completedSteps)
      next.add(step)
      return { completedSteps: next }
    }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
      glossaryOpen: !state.sidebarOpen ? false : state.glossaryOpen,
    })),

  setGlossaryOpen: (open) =>
    set((state) => ({
      glossaryOpen: open,
      sidebarOpen: open ? false : state.sidebarOpen,
    })),

  toggleGlossary: () =>
    set((state) => ({
      glossaryOpen: !state.glossaryOpen,
      sidebarOpen: !state.glossaryOpen ? false : state.sidebarOpen,
    })),

  setGlossaryHighlightTerm: (term) => set({ glossaryHighlightTerm: term }),

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleViewMode: () =>
    set((state) => ({ viewMode: state.viewMode === 'business' ? 'technical' : 'business' })),

  setSessionId: (id) => set({ sessionId: id }),

  addLog: (message, type) =>
    set((state) => ({
      sessionLog: [...state.sessionLog, { timestamp: Date.now(), message, type }],
    })),

  setDatasets: (datasets) => set({ datasets }),
  selectDataset: (dataset) => set({ selectedDataset: dataset }),
  selectObjective: (objective) => set({ selectedObjective: objective }),
  setBusinessGoal: (goal) => set({ businessGoal: goal }),
  setDeploymentMode: (mode) => set({ deploymentMode: mode }),
  setLlmApiKey: (key) => set({ llmApiKey: key }),

  setEdaResults: (results) => set({ edaResults: results }),
  setEdaProgress: (progress) => set({ edaProgress: progress }),

  setPatternResults: (results) => set({ patternResults: results }),
  setDimensionResults: (results) => set({ dimensionResults: results }),
  setValidationSummaryResults: (results) => set({ validationSummaryResults: results }),
  setModelSelectionResults: (results) => set({ modelSelectionResults: results }),

  setActiveDomain: (id) => set({ activeDomainId: id }),

  setShouldGoHome: (value) => set({ shouldGoHome: value }),

  reset: () => set({ ...initialState, completedSteps: new Set() }),
}))
