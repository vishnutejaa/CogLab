import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Save, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExperimentCanvas from "@/components/experiment-canvas";
import ComponentPalette from "@/components/component-palette";
import PropertiesPanel from "@/components/properties-panel";

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
        { id: "instructions", type: "instructions", title: "Instructions" },
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

  const addBlock = (blockType: string) => {
    const newBlock: ExperimentBlock = {
      id: `${blockType}_${Date.now()}`,
      type: blockType,
      title: blockType.charAt(0).toUpperCase() + blockType.slice(1),
      // Add default properties based on block type
      ...(blockType === "stroop" && { trials: 60, duration: 5000, randomize: true }),
      ...(blockType === "image_recall" && { images: 20, studyTime: 3000, recallTime: 10000 }),
      ...(blockType === "survey" && { questions: [] }),
    };
    
    setExperimentBlocks([...experimentBlocks, newBlock]);
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
