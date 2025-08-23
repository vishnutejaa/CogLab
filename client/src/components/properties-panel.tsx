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
                value={selectedBlock.trials || 60}
                onChange={(e) => handleUpdate("trials", parseInt(e.target.value))}
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
                onChange={(e) => handleUpdate("duration", parseInt(e.target.value))}
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
                        : conditions.filter(c => c !== "congruent");
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
                        : conditions.filter(c => c !== "incongruent");
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
                        : conditions.filter(c => c !== "neutral");
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
                value={selectedBlock.images || 20}
                onChange={(e) => handleUpdate("images", parseInt(e.target.value))}
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
                value={selectedBlock.studyTime || 3000}
                onChange={(e) => handleUpdate("studyTime", parseInt(e.target.value))}
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
                onChange={(e) => handleUpdate("recallTime", parseInt(e.target.value))}
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
        return (
          <div className="space-y-4" data-testid="survey-properties">
            <div>
              <Label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </Label>
              <Input
                id="questionCount"
                type="number"
                value={selectedBlock.questions?.length || 5}
                onChange={(e) => {
                  const count = parseInt(e.target.value);
                  const questions = Array(count).fill(null).map((_, i) => ({
                    id: `q${i + 1}`,
                    text: `Question ${i + 1}`,
                    type: "likert"
                  }));
                  handleUpdate("questions", questions);
                }}
                data-testid="input-question-count"
              />
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
