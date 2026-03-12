import { create } from 'zustand'
import type { AgentStageId } from './agentTypes'
import { AGENT_STAGE_ORDER } from './agentTypes'

interface AgentPlaygroundState {
  // Navigation
  currentStage: AgentStageId
  completedStages: Set<AgentStageId>
  viewMode: 'business' | 'technical'

  // Tile selection
  activeTileId: string | null

  // Pattern Discovery — simulation drawer
  simulationOpen: boolean
  simulationQuestionIndex: number | null

  // Monitoring modal (launched from Step 6, NOT a stepper step)
  monitoringModalOpen: boolean

  // Completion modal (shown after all stages)
  completionModalOpen: boolean

  // Agent Evaluation — active tab
  evaluationTab: import('./agentTypes').EvaluationTab

  // Animation control
  animationComplete: Record<string, boolean>
  skipAnimation: boolean

  // Glossary
  glossaryOpen: boolean

  // Actions
  setStage: (stage: AgentStageId) => void
  nextStage: () => void
  prevStage: () => void
  completeStage: (stage: AgentStageId) => void
  selectTile: (tileId: string) => void
  setViewMode: (mode: 'business' | 'technical') => void
  openSimulation: (index: number) => void
  closeSimulation: () => void
  openMonitoringModal: () => void
  closeMonitoringModal: () => void
  openCompletionModal: () => void
  closeCompletionModal: () => void
  setEvaluationTab: (tab: import('./agentTypes').EvaluationTab) => void
  setAnimationComplete: (key: string) => void
  setSkipAnimation: (skip: boolean) => void
  toggleGlossary: () => void
  reset: () => void
  resetToTiles: () => void
}

export const useAgentPlaygroundStore = create<AgentPlaygroundState>((set, get) => ({
  currentStage: 'tiles',
  completedStages: new Set(),
  viewMode: 'business',
  activeTileId: null,
  simulationOpen: false,
  simulationQuestionIndex: null,
  monitoringModalOpen: false,
  completionModalOpen: false,
  evaluationTab: 'overview',
  animationComplete: {},
  skipAnimation: false,
  glossaryOpen: false,

  setStage: (stage) => set({ currentStage: stage }),

  nextStage: () => {
    const { currentStage } = get()
    const idx = AGENT_STAGE_ORDER.indexOf(currentStage)
    if (idx >= 0 && idx < AGENT_STAGE_ORDER.length - 1) {
      const next = AGENT_STAGE_ORDER[idx + 1]
      set((s) => ({
        currentStage: next,
        completedStages: new Set([...s.completedStages, currentStage]),
      }))
    }
  },

  prevStage: () => {
    const { currentStage } = get()
    const idx = AGENT_STAGE_ORDER.indexOf(currentStage)
    if (idx > 0) {
      set({ currentStage: AGENT_STAGE_ORDER[idx - 1] })
    }
  },

  completeStage: (stage) =>
    set((s) => ({ completedStages: new Set([...s.completedStages, stage]) })),

  selectTile: (tileId) =>
    set({
      activeTileId: tileId,
      currentStage: 'goal',
      completedStages: new Set(),
      animationComplete: {},
      simulationOpen: false,
      simulationQuestionIndex: null,
    }),

  setViewMode: (mode) => set({ viewMode: mode }),

  openSimulation: (index) =>
    set({ simulationOpen: true, simulationQuestionIndex: index, glossaryOpen: false }),

  closeSimulation: () =>
    set({ simulationOpen: false, simulationQuestionIndex: null }),

  openMonitoringModal: () => set({ monitoringModalOpen: true }),
  closeMonitoringModal: () => set({ monitoringModalOpen: false }),
  openCompletionModal: () => set({ completionModalOpen: true }),
  closeCompletionModal: () => set({ completionModalOpen: false }),

  setEvaluationTab: (tab) => set({ evaluationTab: tab }),

  setAnimationComplete: (key) =>
    set((s) => ({ animationComplete: { ...s.animationComplete, [key]: true } })),

  setSkipAnimation: (skip) => set({ skipAnimation: skip }),

  toggleGlossary: () =>
    set((s) => ({
      glossaryOpen: !s.glossaryOpen,
      simulationOpen: s.glossaryOpen ? s.simulationOpen : false,
    })),

  reset: () =>
    set({
      currentStage: 'tiles',
      completedStages: new Set(),
      activeTileId: null,
      simulationOpen: false,
      simulationQuestionIndex: null,
      monitoringModalOpen: false,
      completionModalOpen: false,
      evaluationTab: 'overview',
      animationComplete: {},
      skipAnimation: false,
      glossaryOpen: false,
    }),

  resetToTiles: () =>
    set({
      currentStage: 'tiles',
      completedStages: new Set(),
      activeTileId: null,
      simulationOpen: false,
      simulationQuestionIndex: null,
      monitoringModalOpen: false,
      completionModalOpen: false,
      evaluationTab: 'overview',
      animationComplete: {},
      glossaryOpen: false,
    }),
}))
