import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExperimentState {
  participantId: string | null;
  studyId: string | null;
  currentBlock: number;
  totalBlocks: number;
  blockHistory: any[];
  responses: any[];
  startTime: number;
  isComplete: boolean;
}

interface UseExperimentOptions {
  studyId: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useExperiment({ studyId, onComplete, onError }: UseExperimentOptions) {
  const [state, setState] = useState<ExperimentState>({
    participantId: null,
    studyId: null,
    currentBlock: 0,
    totalBlocks: 0,
    blockHistory: [],
    responses: [],
    startTime: Date.now(),
    isComplete: false
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize participation session
  const initializeSessionMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/participate/${studyId}`, {}),
    onSuccess: async (response) => {
      const sessionData = await response.json();
      setState(prev => ({
        ...prev,
        participantId: sessionData.participantId,
        studyId: sessionData.study.id,
        totalBlocks: sessionData.study.experimentBlocks.length,
        startTime: Date.now()
      }));
      setIsInitialized(true);
    },
    onError: (error) => {
      onError?.(error as Error);
    }
  });

  // Submit response
  const submitResponseMutation = useMutation({
    mutationFn: (responseData: any) => apiRequest("POST", "/api/responses", responseData),
    onError: (error) => {
      console.error("Failed to submit response:", error);
    }
  });

  // Update participant progress
  const updateParticipantMutation = useMutation({
    mutationFn: (updates: any) => 
      apiRequest("PUT", `/api/participants/${state.participantId}`, updates),
    onError: (error) => {
      console.error("Failed to update participant:", error);
    }
  });

  // Initialize session on mount
  useEffect(() => {
    if (!isInitialized && studyId) {
      initializeSessionMutation.mutate();
    }
  }, [studyId, isInitialized]);

  const submitResponse = useCallback((responseData: any) => {
    if (!state.participantId || !state.studyId) {
      console.error("No active session to submit response to");
      return;
    }

    const fullResponseData = {
      ...responseData,
      participantId: state.participantId,
      studyId: state.studyId,
    };

    setState(prev => ({
      ...prev,
      responses: [...prev.responses, fullResponseData]
    }));

    submitResponseMutation.mutate(fullResponseData);
  }, [state.participantId, state.studyId]);

  const nextBlock = useCallback(() => {
    const newBlockIndex = state.currentBlock + 1;
    
    if (newBlockIndex >= state.totalBlocks) {
      // Experiment complete
      setState(prev => ({ ...prev, isComplete: true }));
      updateParticipantMutation.mutate({
        status: "completed",
        completedAt: new Date().toISOString(),
        currentBlock: newBlockIndex
      });
      onComplete?.();
    } else {
      setState(prev => ({
        ...prev,
        currentBlock: newBlockIndex,
        blockHistory: [...prev.blockHistory, { block: prev.currentBlock, timestamp: Date.now() }]
      }));
      updateParticipantMutation.mutate({
        currentBlock: newBlockIndex
      });
    }
  }, [state.currentBlock, state.totalBlocks, onComplete]);

  const previousBlock = useCallback(() => {
    if (state.currentBlock > 0) {
      const newBlockIndex = state.currentBlock - 1;
      setState(prev => ({ ...prev, currentBlock: newBlockIndex }));
      updateParticipantMutation.mutate({
        currentBlock: newBlockIndex
      });
    }
  }, [state.currentBlock]);

  const updateParticipant = useCallback((updates: any) => {
    updateParticipantMutation.mutate(updates);
  }, []);

  const submitConsent = useCallback((consentData: any) => {
    submitResponse({
      blockId: "consent",
      blockType: "consent",
      response: consentData,
      responseTime: null,
      accuracy: null,
      stimulus: null
    });

    updateParticipant({
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      status: "consent_given"
    });
  }, [submitResponse, updateParticipant]);

  const submitDemographics = useCallback((demographicsData: any) => {
    submitResponse({
      blockId: "demographics",
      blockType: "demographics",
      response: demographicsData,
      responseTime: null,
      accuracy: null,
      stimulus: null
    });

    updateParticipant({
      demographics: demographicsData,
      status: "in_progress"
    });
  }, [submitResponse, updateParticipant]);

  const getProgress = useCallback(() => {
    return {
      current: state.currentBlock + 1,
      total: state.totalBlocks,
      percentage: state.totalBlocks > 0 ? ((state.currentBlock + 1) / state.totalBlocks) * 100 : 0
    };
  }, [state.currentBlock, state.totalBlocks]);

  const getSessionDuration = useCallback(() => {
    return Date.now() - state.startTime;
  }, [state.startTime]);

  const getResponseStats = useCallback(() => {
    const totalResponses = state.responses.length;
    const responsesWithTiming = state.responses.filter(r => r.responseTime !== null);
    const averageResponseTime = responsesWithTiming.length > 0 
      ? responsesWithTiming.reduce((sum, r) => sum + r.responseTime, 0) / responsesWithTiming.length
      : 0;
    
    const responsesWithAccuracy = state.responses.filter(r => r.accuracy !== null);
    const accuracy = responsesWithAccuracy.length > 0
      ? responsesWithAccuracy.reduce((sum, r) => sum + (r.accuracy ? 1 : 0), 0) / responsesWithAccuracy.length
      : 0;

    return {
      totalResponses,
      averageResponseTime,
      accuracy
    };
  }, [state.responses]);

  return {
    // State
    participantId: state.participantId,
    studyId: state.studyId,
    currentBlock: state.currentBlock,
    totalBlocks: state.totalBlocks,
    isComplete: state.isComplete,
    isInitialized,
    responses: state.responses,
    
    // Loading states
    isInitializing: initializeSessionMutation.isPending,
    isSubmitting: submitResponseMutation.isPending,
    isUpdating: updateParticipantMutation.isPending,
    
    // Actions
    submitResponse,
    submitConsent,
    submitDemographics,
    nextBlock,
    previousBlock,
    updateParticipant,
    
    // Utilities
    getProgress,
    getSessionDuration,
    getResponseStats,
    
    // Raw state for debugging
    debugState: state
  };
}

export type ExperimentHook = ReturnType<typeof useExperiment>;
