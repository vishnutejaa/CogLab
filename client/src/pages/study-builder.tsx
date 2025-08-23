import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Save, Share, Bot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExperimentCanvas from "@/components/experiment-canvas";
import ComponentPalette from "@/components/component-palette";
import PropertiesPanel from "@/components/properties-panel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ExperimentBlock {
  id: string;
  type: string;
  title: string;
  [key: string]: any;
}

interface Study {
  id: string;
  title: string;
  description: string;
  experimentBlocks: ExperimentBlock[];
  status: string;
}

export default function StudyBuilder() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/builder/:id?");
  const { toast } = useToast();
  
  const [selectedBlock, setSelectedBlock] = useState<ExperimentBlock | null>(null);
  const [experimentBlocks, setExperimentBlocks] = useState<ExperimentBlock[]>([]);
  const [studyTitle, setStudyTitle] = useState("New Study");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showAISurveyDialog, setShowAISurveyDialog] = useState(false);
  const [aiForm, setAIForm] = useState({
    taskType: '',
    title: '',
    customRequirements: '',
    estimatedDuration: 15,
    imageCount: 4
  });
  const [aiSurveyForm, setAISurveyForm] = useState({
    surveyType: '',
    topic: '',
    questionCount: 5,
    customRequirements: ''
  });

  const studyId = params?.id;
  const isEditing = !!studyId;

  // Load study if editing
  const { data: study } = useQuery<Study>({
    queryKey: ["/api/studies", studyId],
    enabled: isEditing
  });

  // Initialize blocks when study loads or create new study
  useEffect(() => {
    if (study) {
      setExperimentBlocks(study.experimentBlocks || []);
      setStudyTitle(study.title);
    } else {
      // Initialize with default blocks for new study
      const defaultBlocks: ExperimentBlock[] = [
        { id: "consent", type: "consent", title: "Consent Form" },
        { id: "demographics", type: "demographics", title: "Demographics" },
        { id: "debrief", type: "debrief", title: "Debrief" }
      ];
      setExperimentBlocks(defaultBlocks);
    }
  }, [study]);

  const saveStudyMutation = useMutation({
    mutationFn: async (studyData: any) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/studies/${studyId}`, studyData);
      } else {
        return apiRequest("POST", "/api/studies", studyData);
      }
    },
    onSuccess: async (response) => {
      const savedStudy = await response.json();
      toast({
        title: "Study saved successfully",
        description: "Your experiment has been saved."
      });
      
      if (!isEditing) {
        // Navigate to the editing view for the new study
        setLocation(`/builder/${savedStudy.id}`);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/studies"] });
    },
    onError: () => {
      toast({
        title: "Error saving study",
        description: "There was a problem saving your experiment.",
        variant: "destructive"
      });
    }
  });

  const publishStudyMutation = useMutation({
    mutationFn: async () => {
      const studyData = {
        title: studyTitle,
        description: "Created with CogLab experiment builder",
        experimentBlocks,
        status: "active"
      };
      
      if (isEditing) {
        return apiRequest("PUT", `/api/studies/${studyId}`, studyData);
      } else {
        return apiRequest("POST", "/api/studies", studyData);
      }
    },
    onSuccess: async (response) => {
      const publishedStudy = await response.json();
      toast({
        title: "Study published successfully",
        description: `Your experiment is now live. Share link: ${window.location.origin}/participate/${publishedStudy.id}`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/studies"] });
    },
    onError: () => {
      toast({
        title: "Error publishing study",
        description: "There was a problem publishing your experiment.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    const studyData = {
      title: studyTitle,
      description: "Created with CogLab experiment builder",
      experimentBlocks,
      status: study?.status || "draft"
    };
    saveStudyMutation.mutate(studyData);
  };

  const handlePublish = () => {
    publishStudyMutation.mutate();
  };

  const handlePreview = () => {
    if (studyId) {
      window.open(`/participate/${studyId}`, '_blank');
    } else {
      toast({
        title: "Save study first",
        description: "Please save your study before previewing.",
        variant: "destructive"
      });
    }
  };

  const generateAIExperiment = useMutation({
    mutationFn: async (formData: typeof aiForm) => {
      return apiRequest("POST", "/api/experiments/generate", formData);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      // Find the AI-generated task block and add it to existing blocks
      const aiTaskBlock = data.experimentBlocks.find((block: any) => 
        block.type === aiForm.taskType
      );
      
      if (aiTaskBlock) {
        // Insert the AI-generated task block before the debrief block
        setExperimentBlocks(prev => {
          const debriefIndex = prev.findIndex(block => block.type === 'debrief');
          if (debriefIndex !== -1) {
            // Insert before debrief
            const newBlocks = [...prev];
            newBlocks.splice(debriefIndex, 0, aiTaskBlock);
            return newBlocks;
          } else {
            // No debrief found, add to end
            return [...prev, aiTaskBlock];
          }
        });
      }
      
      setShowAIDialog(false);
      toast({
        title: "AI Task Generated!",
        description: `${aiForm.taskType.charAt(0).toUpperCase() + aiForm.taskType.slice(1)} task added to your experiment.`
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate AI experiment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generateAISurvey = useMutation({
    mutationFn: async (formData: typeof aiSurveyForm) => {
      return apiRequest("POST", "/api/surveys/generate", formData);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      // Create a survey block with AI-generated questions
      const aiSurveyBlock: ExperimentBlock = {
        id: `ai_survey_${Date.now()}`,
        type: "survey",
        title: `AI Survey: ${aiSurveyForm.topic}`,
        questions: data.questions,
        surveyType: data.surveyType,
        topic: data.topic
      };
      
      // Insert the AI-generated survey block before the debrief block
      setExperimentBlocks(prev => {
        const debriefIndex = prev.findIndex(block => block.type === 'debrief');
        if (debriefIndex !== -1) {
          // Insert before debrief
          const newBlocks = [...prev];
          newBlocks.splice(debriefIndex, 0, aiSurveyBlock);
          return newBlocks;
        } else {
          // No debrief found, add to end
          return [...prev, aiSurveyBlock];
        }
      });
      
      setShowAISurveyDialog(false);
      toast({
        title: "AI Survey Generated!",
        description: `Survey with ${data.questionCount} questions added to your experiment.`
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate AI survey. Please try again.",
        variant: "destructive"
      });
    }
  });

  const addBlock = (blockType: string) => {
    // Handle AI experiment types
    if (blockType === 'ai_stroop') {
      setAIForm({ ...aiForm, taskType: 'stroop', title: 'AI Stroop Experiment' });
      setShowAIDialog(true);
      return;
    }
    if (blockType === 'ai_memory') {
      setAIForm({ ...aiForm, taskType: 'image_recall', title: 'AI Memory Experiment' });
      setShowAIDialog(true);
      return;
    }
    if (blockType === 'ai_survey') {
      setAISurveyForm({ ...aiSurveyForm, surveyType: 'mixed', topic: 'Research Experience' });
      setShowAISurveyDialog(true);
      return;
    }
    
    const newBlock: ExperimentBlock = {
      id: `${blockType}_${Date.now()}`,
      type: blockType,
      title: blockType.charAt(0).toUpperCase() + blockType.slice(1),
      // Add default properties based on block type
      ...(blockType === "stroop" && { trials: 60, duration: 5000, randomize: true }),
      ...(blockType === "image_recall" && { images: 5, studyTime: 4000, recallTime: 10000 }),
      ...(blockType === "survey" && { questions: [] }),
      ...(blockType === "mcq" && { 
        questions: [
          {
            id: "q1",
            type: "multiple_choice",
            question: "What is your preferred learning style?",
            options: ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"]
          }
        ]
      }),
      ...(blockType === "likert" && { 
        questions: [
          {
            id: "q1",
            type: "likert",
            question: "I find this experiment engaging",
            scale: {
              min: 1,
              max: 7,
              labels: ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]
            }
          }
        ]
      }),
      ...(blockType === "openended" && { 
        questions: [
          {
            id: "q1",
            type: "open_ended",
            question: "Please describe your experience with this type of research study."
          }
        ]
      }),
    };
    
    // Insert the new block before the debrief block
    const debriefIndex = experimentBlocks.findIndex(block => block.type === 'debrief');
    if (debriefIndex !== -1) {
      // Insert before debrief
      const newBlocks = [...experimentBlocks];
      newBlocks.splice(debriefIndex, 0, newBlock);
      setExperimentBlocks(newBlocks);
    } else {
      // No debrief found, add to end
      setExperimentBlocks([...experimentBlocks, newBlock]);
    }
  };

  const updateBlock = (blockId: string, updates: Partial<ExperimentBlock>) => {
    setExperimentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const removeBlock = (blockId: string) => {
    setExperimentBlocks(blocks => blocks.filter(block => block.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const reorderBlocks = (newBlocks: ExperimentBlock[]) => {
    setExperimentBlocks(newBlocks);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="study-builder-page">
      {/* Builder Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900" data-testid="builder-title">Study Builder</h1>
                <input
                  type="text"
                  value={studyTitle}
                  onChange={(e) => setStudyTitle(e.target.value)}
                  className="text-sm text-gray-600 bg-transparent border-none outline-none focus:ring-0 p-0"
                  data-testid="input-study-title"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="px-4 py-2 text-cyan-700 bg-cyan-50 border-cyan-200 rounded-lg hover:bg-cyan-100"
                    data-testid="button-ai-generate"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-cyan-500" />
                      Generate AI Experiment
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="taskType">Task Type</Label>
                      <Select value={aiForm.taskType} onValueChange={(value) => setAIForm({ ...aiForm, taskType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose experiment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stroop">Stroop Task</SelectItem>
                          <SelectItem value="image_recall">Image Recall Task</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Study Title</Label>
                      <Input
                        value={aiForm.title}
                        onChange={(e) => setAIForm({ ...aiForm, title: e.target.value })}
                        placeholder="Enter study title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={aiForm.estimatedDuration}
                        onChange={(e) => setAIForm({ ...aiForm, estimatedDuration: e.target.value === '' ? 15 : parseInt(e.target.value) || 15 })}
                        placeholder="15"
                      />
                    </div>
                    {aiForm.taskType === 'image_recall' && (
                      <div className="space-y-2">
                        <Label htmlFor="imageCount">Number of Images</Label>
                        <Input
                          type="number"
                          value={aiForm.imageCount}
                          onChange={(e) => setAIForm({ ...aiForm, imageCount: e.target.value === '' ? 4 : parseInt(e.target.value) || 4 })}
                          min="1"
                          max="20"
                          placeholder="4"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="requirements">Custom Requirements (optional)</Label>
                      <Textarea
                        value={aiForm.customRequirements}
                        onChange={(e) => setAIForm({ ...aiForm, customRequirements: e.target.value })}
                        placeholder="Describe any specific requirements for your experiment..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAIDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => generateAIExperiment.mutate(aiForm)}
                        disabled={!aiForm.taskType || !aiForm.title || generateAIExperiment.isPending}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        {generateAIExperiment.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                          <><Bot className="h-4 w-4 mr-2" /> Generate</>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showAISurveyDialog} onOpenChange={setShowAISurveyDialog}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-cyan-500" />
                      Generate AI Survey
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="surveyType">Survey Type</Label>
                      <Select value={aiSurveyForm.surveyType} onValueChange={(value) => setAISurveyForm({ ...aiSurveyForm, surveyType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose survey type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="likert">Likert Scale</SelectItem>
                          <SelectItem value="open_ended">Open Ended</SelectItem>
                          <SelectItem value="mixed">Mixed Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topic">Survey Topic</Label>
                      <Input
                        value={aiSurveyForm.topic}
                        onChange={(e) => setAISurveyForm({ ...aiSurveyForm, topic: e.target.value })}
                        placeholder="e.g., User Experience, Learning Preferences, Stress Management"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="questionCount">Number of Questions</Label>
                      <Input
                        type="number"
                        value={aiSurveyForm.questionCount}
                        onChange={(e) => setAISurveyForm({ ...aiSurveyForm, questionCount: e.target.value === '' ? 5 : parseInt(e.target.value) || 5 })}
                        min="1"
                        max="20"
                        placeholder="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surveyRequirements">Custom Requirements (optional)</Label>
                      <Textarea
                        value={aiSurveyForm.customRequirements}
                        onChange={(e) => setAISurveyForm({ ...aiSurveyForm, customRequirements: e.target.value })}
                        placeholder="Describe any specific requirements for your survey questions..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAISurveyDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => generateAISurvey.mutate(aiSurveyForm)}
                        disabled={!aiSurveyForm.surveyType || !aiSurveyForm.topic || generateAISurvey.isPending}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        {generateAISurvey.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                          <><Bot className="h-4 w-4 mr-2" /> Generate Survey</>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={handlePreview}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                data-testid="button-preview-study"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveStudyMutation.isPending}
                className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-blue-700"
                data-testid="button-save-study"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveStudyMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishStudyMutation.isPending}
                className="px-4 py-2 text-white bg-success rounded-lg hover:bg-green-700"
                data-testid="button-publish-study"
              >
                <Share className="h-4 w-4 mr-2" />
                {publishStudyMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Component Palette */}
          <div className="col-span-3">
            <ComponentPalette onAddBlock={addBlock} />
          </div>

          {/* Builder Canvas */}
          <div className="col-span-6">
            <ExperimentCanvas
              blocks={experimentBlocks}
              selectedBlock={selectedBlock}
              onSelectBlock={setSelectedBlock}
              onUpdateBlock={updateBlock}
              onRemoveBlock={removeBlock}
              onReorderBlocks={reorderBlocks}
              onAddBlock={addBlock}
            />
          </div>

          {/* Properties Panel */}
          <div className="col-span-3">
            <PropertiesPanel
              selectedBlock={selectedBlock}
              onUpdateBlock={updateBlock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
