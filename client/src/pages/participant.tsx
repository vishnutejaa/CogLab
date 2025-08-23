import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ParticipantHeader from "@/components/participant-header";
import ConsentForm from "@/components/forms/consent-form";
import DemographicsForm from "@/components/forms/demographics-form";
import StroopTask from "@/components/tasks/stroop-task";
import ImageRecallTask from "@/components/tasks/image-recall-task";

interface Study {
  id: string;
  title: string;
  experimentBlocks: any[];
}

interface Participant {
  id: string;
  sessionId: string;
  currentBlock: number;
  status: string;
  consentGiven: boolean;
  demographics: any;
}

interface ParticipationSession {
  participantId: string;
  sessionId: string;
  study: Study;
}

export default function ParticipantView() {
  const [, params] = useRoute("/participate/:studyId");
  const { toast } = useToast();
  
  const [session, setSession] = useState<ParticipationSession | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const studyId = params?.studyId;

  // Start participation session
  const startParticipationMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/participate/${studyId}`, {}),
    onSuccess: async (response) => {
      const sessionData = await response.json();
      setSession(sessionData);
      
      // Get participant details
      const participantResponse = await apiRequest("GET", `/api/participants/${sessionData.participantId}`, {});
      const participantData = await participantResponse.json();
      setParticipant(participantData);
      setCurrentBlockIndex(participantData.currentBlock || 0);
    },
    onError: () => {
      toast({
        title: "Error starting study",
        description: "There was a problem starting the study. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update participant
  const updateParticipantMutation = useMutation({
    mutationFn: (updates: any) => 
      apiRequest("PUT", `/api/participants/${participant?.id}`, updates),
    onSuccess: async (response) => {
      const updatedParticipant = await response.json();
      setParticipant(updatedParticipant);
    }
  });

  // Submit response
  const submitResponseMutation = useMutation({
    mutationFn: (responseData: any) =>
      apiRequest("POST", "/api/responses", responseData)
  });

  // Initialize session on mount
  useEffect(() => {
    if (studyId && !session) {
      startParticipationMutation.mutate();
    }
  }, [studyId]);

  const handleConsentSubmit = (consentData: any) => {
    if (!participant) return;

    // Submit consent response
    submitResponseMutation.mutate({
      participantId: participant.id,
      studyId: studyId!,
      blockId: "consent",
      blockType: "consent",
      response: consentData,
      responseTime: null,
      accuracy: null,
      stimulus: null
    });

    // Update participant
    updateParticipantMutation.mutate({
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      status: "consent_given",
      currentBlock: currentBlockIndex + 1
    });

    setCurrentBlockIndex(currentBlockIndex + 1);
  };

  const handleDemographicsSubmit = (demographicsData: any) => {
    if (!participant) return;

    // Submit demographics response
    submitResponseMutation.mutate({
      participantId: participant.id,
      studyId: studyId!,
      blockId: "demographics",
      blockType: "demographics",
      response: demographicsData,
      responseTime: null,
      accuracy: null,
      stimulus: null
    });

    // Update participant
    updateParticipantMutation.mutate({
      demographics: demographicsData,
      status: "in_progress",
      currentBlock: currentBlockIndex + 1
    });

    setCurrentBlockIndex(currentBlockIndex + 1);
  };

  const handleTaskResponse = (responseData: any) => {
    if (!participant) return;

    submitResponseMutation.mutate({
      participantId: participant.id,
      studyId: studyId!,
      ...responseData
    });
  };

  const handleTaskComplete = () => {
    if (!participant || !session) return;

    const nextBlock = currentBlockIndex + 1;
    
    if (nextBlock >= session.study.experimentBlocks.length) {
      // Study completed
      updateParticipantMutation.mutate({
        status: "completed",
        completedAt: new Date().toISOString()
      });
      setIsCompleted(true);
    } else {
      // Move to next block
      updateParticipantMutation.mutate({
        currentBlock: nextBlock
      });
      setCurrentBlockIndex(nextBlock);
    }
  };

  const handleBlockNext = () => {
    handleTaskComplete();
  };

  const handleBlockPrevious = () => {
    if (currentBlockIndex > 0) {
      const prevBlock = currentBlockIndex - 1;
      updateParticipantMutation.mutate({
        currentBlock: prevBlock
      });
      setCurrentBlockIndex(prevBlock);
    }
  };

  if (startParticipationMutation.isPending) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" data-testid="loading-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study...</p>
        </div>
      </div>
    );
  }

  if (!session || !participant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" data-testid="error-screen">
        <div className="text-center">
          <p className="text-gray-600">Study not found or unavailable.</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white" data-testid="completion-screen">
        <ParticipantHeader 
          studyTitle={session.study.title}
          currentBlock={session.study.experimentBlocks.length}
          totalBlocks={session.study.experimentBlocks.length}
        />
        
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="completion-title">Thank You!</h1>
            <p className="text-gray-600 mb-8" data-testid="completion-message">
              Your participation in this study has been completed successfully.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">About This Study</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Thank you for participating in our research. Your responses will help advance our understanding 
                of cognitive processes and psychological phenomena. All data collected is anonymous and will be 
                used solely for research purposes.
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">You may now close this window.</p>
              <p className="text-xs text-gray-500">
                Session ID: <span data-testid="session-id">{participant.sessionId}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentBlock = session.study.experimentBlocks[currentBlockIndex];
  
  if (!currentBlock) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Invalid block configuration.</p>
      </div>
    );
  }

  const renderCurrentBlock = () => {
    switch (currentBlock.type) {
      case "consent":
        return (
          <ConsentForm
            onSubmit={handleConsentSubmit}
            studyTitle={session.study.title}
          />
        );
      
      case "demographics":
        return (
          <DemographicsForm
            onSubmit={handleDemographicsSubmit}
            onNext={handleBlockNext}
            onPrevious={handleBlockPrevious}
            canGoBack={currentBlockIndex > 0}
          />
        );
      
      case "stroop":
        return (
          <StroopTask
            config={currentBlock}
            onResponse={handleTaskResponse}
            onComplete={handleTaskComplete}
          />
        );
      
      case "image_recall":
        return (
          <ImageRecallTask
            config={currentBlock}
            onResponse={handleTaskResponse}
            onComplete={handleTaskComplete}
          />
        );
      
      case "instructions":
        return (
          <div className="max-w-2xl mx-auto px-4 py-8" data-testid="instructions-block">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Instructions</h1>
              <p className="text-gray-600">Please read the following instructions carefully</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 leading-relaxed">
                {currentBlock.content || "Instructions for the upcoming task will be displayed here. Please read them carefully before proceeding."}
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBlockPrevious}
                disabled={currentBlockIndex === 0}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-previous"
              >
                Previous
              </button>
              <button
                onClick={handleBlockNext}
                className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-blue-700"
                data-testid="button-continue"
              >
                Continue
              </button>
            </div>
          </div>
        );
      
      case "debrief":
        return (
          <div className="max-w-2xl mx-auto px-4 py-8" data-testid="debrief-block">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Complete</h1>
              <p className="text-gray-600 mb-8">Thank you for your participation!</p>
              
              <button
                onClick={handleTaskComplete}
                className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-blue-700"
                data-testid="button-finish"
              >
                Finish
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <p className="text-gray-600">Unknown block type: {currentBlock.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="participant-view">
      <ParticipantHeader 
        studyTitle={session.study.title}
        currentBlock={currentBlockIndex + 1}
        totalBlocks={session.study.experimentBlocks.length}
      />
      
      {renderCurrentBlock()}
    </div>
  );
}
