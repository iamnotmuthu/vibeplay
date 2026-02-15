import { create } from 'zustand'
import type {
  DatasetConfig,
  BusinessObjective,
  EDAResults,
  PatternResults,
  FeatureResults,
  ModelTrainingState,
  EvaluationResults,
  DriftSimulation,
  LogEntry,
  StageId,
} from './types'

interface PlaygroundState {
  // Navigation
  currentStep: StageId
  completedSteps: Set<StageId>
  sidebarOpen: boolean

  // Session
  sessionId: string | null
  sessionLog: LogEntry[]

  // Data
  datasets: DatasetConfig[]
  selectedDataset: DatasetConfig | null
  selectedObjective: BusinessObjective | null

  // Stage results
  edaResults: EDAResults | null
  edaProgress: { moduleId: string; percent: number } | null
  patternResults: PatternResults | null
  featureResults: FeatureResults | null
  trainingModels: ModelTrainingState[]
  champion: string | null
  evaluationResults: EvaluationResults | null
  driftSimulation: DriftSimulation | null
  driftWeek: number
  retrainingInProgress: boolean

  // Actions
  setStep: (step: StageId) => void
  completeStep: (step: StageId) => void
  toggleSidebar: () => void
  setSessionId: (id: string) => void
  addLog: (message: string, type: LogEntry['type']) => void
  setDatasets: (datasets: DatasetConfig[]) => void
  selectDataset: (dataset: DatasetConfig) => void
  selectObjective: (objective: BusinessObjective) => void
  setEdaResults: (results: EDAResults) => void
  setEdaProgress: (progress: { moduleId: string; percent: number } | null) => void
  setPatternResults: (results: PatternResults) => void
  setFeatureResults: (results: FeatureResults) => void
  setTrainingModels: (models: ModelTrainingState[]) => void
  updateTrainingModel: (name: string, update: Partial<ModelTrainingState>) => void
  setChampion: (name: string) => void
  setEvaluationResults: (results: EvaluationResults) => void
  setDriftSimulation: (data: DriftSimulation) => void
  setDriftWeek: (week: number) => void
  setRetrainingInProgress: (v: boolean) => void
  reset: () => void
}

const initialState = {
  currentStep: 1 as StageId,
  completedSteps: new Set<StageId>(),
  sidebarOpen: false,
  sessionId: null,
  sessionLog: [],
  datasets: [],
  selectedDataset: null,
  selectedObjective: null,
  edaResults: null,
  edaProgress: null,
  patternResults: null,
  featureResults: null,
  trainingModels: [],
  champion: null,
  evaluationResults: null,
  driftSimulation: null,
  driftWeek: 1,
  retrainingInProgress: false,
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

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSessionId: (id) => set({ sessionId: id }),

  addLog: (message, type) =>
    set((state) => ({
      sessionLog: [...state.sessionLog, { timestamp: Date.now(), message, type }],
    })),

  setDatasets: (datasets) => set({ datasets }),
  selectDataset: (dataset) => set({ selectedDataset: dataset }),
  selectObjective: (objective) => set({ selectedObjective: objective }),

  setEdaResults: (results) => set({ edaResults: results }),
  setEdaProgress: (progress) => set({ edaProgress: progress }),

  setPatternResults: (results) => set({ patternResults: results }),
  setFeatureResults: (results) => set({ featureResults: results }),

  setTrainingModels: (models) => set({ trainingModels: models }),
  updateTrainingModel: (name, update) =>
    set((state) => ({
      trainingModels: state.trainingModels.map((m) =>
        m.name === name ? { ...m, ...update } : m
      ),
    })),
  setChampion: (name) => set({ champion: name }),

  setEvaluationResults: (results) => set({ evaluationResults: results }),

  setDriftSimulation: (data) => set({ driftSimulation: data }),
  setDriftWeek: (week) => set({ driftWeek: week }),
  setRetrainingInProgress: (v) => set({ retrainingInProgress: v }),

  reset: () => set({ ...initialState, completedSteps: new Set() }),
}))
