import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface ExperimentBlock {
  id: string;
  type: string;
  title: string;
  [key: string]: any;
}

interface PropertiesPanelProps {
  selectedBlock: ExperimentBlock | null;
  onUpdateBlock: (blockId: string, updates: Partial<ExperimentBlock>) => void;
}

export default function PropertiesPanel({ selectedBlock, onUpdateBlock }: PropertiesPanelProps) {
  if (!selectedBlock) {
    return (
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6" data-testid="properties-panel">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Properties</h3>
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">Select a component to edit its properties</p>
        </CardContent>
      </Card>
    );
  }

  const handleUpdate = (field: string, value: any) => {
    onUpdateBlock(selectedBlock.id, { [field]: value });
  };

  const renderPropertiesForBlock = () => {
    switch (selectedBlock.type) {
      case "stroop":
        return (
          <div className="space-y-4" data-testid="stroop-properties">
            <div>
              <Label htmlFor="trials" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Trials
              </Label>
              <Input
                id="trials"
                type="number"
                value={selectedBlock.trialCount || selectedBlock.trials || 60}
                onChange={(e) => {
                  const count = e.target.value === '' ? 60 : parseInt(e.target.value) || 60;
                  // Update both properties for compatibility
                  handleUpdate("trials", count);
                  handleUpdate("trialCount", count);
                }}
                min="1"
                data-testid="input-trials"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Trial Duration (ms)
              </Label>
              <Input
                id="duration"
                type="number"
                value={selectedBlock.duration || 5000}
                onChange={(e) => handleUpdate("duration", e.target.value === '' ? 5000 : parseInt(e.target.value) || 5000)}
                data-testid="input-duration"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="randomize"
                checked={selectedBlock.randomize !== false}
                onCheckedChange={(checked) => handleUpdate("randomize", checked)}
                data-testid="checkbox-randomize"
              />
              <Label htmlFor="randomize" className="text-sm text-gray-600">
                Randomize stimulus presentation
              </Label>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Conditions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="congruent"
                    checked={selectedBlock.conditions?.includes("congruent") !== false}
                    onCheckedChange={(checked) => {
                      const conditions = selectedBlock.conditions || ["congruent", "incongruent"];
                      const newConditions = checked 
                        ? [...conditions, "congruent"].filter((c, i, arr) => arr.indexOf(c) === i)
                        : conditions.filter((c: string) => c !== "congruent");
                      handleUpdate("conditions", newConditions);
                    }}
                    data-testid="checkbox-congruent"
                  />
                  <Label htmlFor="congruent" className="text-sm text-gray-600">Congruent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incongruent"
                    checked={selectedBlock.conditions?.includes("incongruent") !== false}
                    onCheckedChange={(checked) => {
                      const conditions = selectedBlock.conditions || ["congruent", "incongruent"];
                      const newConditions = checked 
                        ? [...conditions, "incongruent"].filter((c, i, arr) => arr.indexOf(c) === i)
                        : conditions.filter((c: string) => c !== "incongruent");
                      handleUpdate("conditions", newConditions);
                    }}
                    data-testid="checkbox-incongruent"
                  />
                  <Label htmlFor="incongruent" className="text-sm text-gray-600">Incongruent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="neutral"
                    checked={selectedBlock.conditions?.includes("neutral") === true}
                    onCheckedChange={(checked) => {
                      const conditions = selectedBlock.conditions || ["congruent", "incongruent"];
                      const newConditions = checked 
                        ? [...conditions, "neutral"].filter((c, i, arr) => arr.indexOf(c) === i)
                        : conditions.filter((c: string) => c !== "neutral");
                      handleUpdate("conditions", newConditions);
                    }}
                    data-testid="checkbox-neutral"
                  />
                  <Label htmlFor="neutral" className="text-sm text-gray-600">Neutral</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case "image_recall":
        return (
          <div className="space-y-4" data-testid="image-recall-properties">
            <div>
              <Label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Images
              </Label>
              <Input
                id="images"
                type="number"
                value={selectedBlock.trialCount || selectedBlock.images || 4}
                onChange={(e) => {
                  const count = e.target.value === '' ? 4 : parseInt(e.target.value) || 4;
                  // Update both properties for compatibility
                  handleUpdate("images", count);
                  handleUpdate("trialCount", count);
                }}
                min="1"
                max="20"
                data-testid="input-images"
              />
            </div>
            <div>
              <Label htmlFor="studyTime" className="block text-sm font-medium text-gray-700 mb-2">
                Study Time per Image (ms)
              </Label>
              <Input
                id="studyTime"
                type="number"
                value={selectedBlock.studyTime || 4000}
                onChange={(e) => handleUpdate("studyTime", e.target.value === '' ? 4000 : parseInt(e.target.value) || 4000)}
                data-testid="input-study-time"
              />
            </div>
            <div>
              <Label htmlFor="recallTime" className="block text-sm font-medium text-gray-700 mb-2">
                Recall Time Limit (ms)
              </Label>
              <Input
                id="recallTime"
                type="number"
                value={selectedBlock.recallTime || 10000}
                onChange={(e) => handleUpdate("recallTime", e.target.value === '' ? 10000 : parseInt(e.target.value) || 10000)}
                data-testid="input-recall-time"
              />
            </div>
          </div>
        );

      case "instructions":
        return (
          <div className="space-y-4" data-testid="instructions-properties">
            <div>
              <Label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Instructions Content
              </Label>
              <Textarea
                id="content"
                value={selectedBlock.content || ""}
                onChange={(e) => handleUpdate("content", e.target.value)}
                placeholder="Enter instructions for participants..."
                rows={6}
                data-testid="textarea-content"
              />
            </div>
          </div>
        );

      case "survey":
      case "mcq":
      case "likert":
      case "openended":
        return (
          <div className="space-y-4" data-testid="survey-properties">
            <div>
              <Label htmlFor="surveyType" className="block text-sm font-medium text-gray-700 mb-2">
                Survey Type
              </Label>
              <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                {selectedBlock.type === "mcq" ? "Multiple Choice" :
                 selectedBlock.type === "likert" ? "Likert Scale" :
                 selectedBlock.type === "openended" ? "Open Ended" : "Survey"}
              </p>
            </div>
            <div>
              <Label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </Label>
              <Input
                id="questionCount"
                type="number"
                value={selectedBlock.questions?.length || 1}
                onChange={(e) => {
                  const count = e.target.value === '' ? 1 : parseInt(e.target.value) || 1;
                  const currentQuestions = selectedBlock.questions || [];
                  let newQuestions = [...currentQuestions];
                  
                  // Add or remove questions based on count
                  if (count > newQuestions.length) {
                    // Add new questions
                    for (let i = newQuestions.length; i < count; i++) {
                      const questionType = selectedBlock.type === "mcq" ? "multiple_choice" :
                                         selectedBlock.type === "likert" ? "likert" : "open_ended";
                      
                      const newQuestion = {
                        id: `q${i + 1}`,
                        type: questionType,
                        question: `Question ${i + 1}`,
                        ...(questionType === "multiple_choice" && {
                          options: ["Option 1", "Option 2", "Option 3", "Option 4"]
                        }),
                        ...(questionType === "likert" && {
                          scale: {
                            min: 1,
                            max: 7,
                            labels: ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]
                          }
                        })
                      };
                      newQuestions.push(newQuestion);
                    }
                  } else if (count < newQuestions.length) {
                    // Remove questions
                    newQuestions = newQuestions.slice(0, count);
                  }
                  
                  handleUpdate("questions", newQuestions);
                }}
                min="1"
                max="20"
                data-testid="input-question-count"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Questions Preview
              </Label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                {selectedBlock.questions?.length > 0 ? (
                  <div className="space-y-1 text-xs text-gray-600">
                    {selectedBlock.questions.map((q: any, index: number) => (
                      <div key={index}>
                        <strong>Q{index + 1}:</strong> {q.question}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No questions yet</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Block Title
              </Label>
              <Input
                id="title"
                value={selectedBlock.title || ""}
                onChange={(e) => handleUpdate("title", e.target.value)}
                data-testid="input-block-title"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6" data-testid="properties-panel">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Properties</h3>
      </div>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Component Type</Label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded" data-testid="component-type">
              {selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)}
            </p>
          </div>
          
          {renderPropertiesForBlock()}
        </div>
      </CardContent>
    </Card>
  );
}
