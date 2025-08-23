import { Card, CardContent } from "@/components/ui/card";
import { FileText, UserCircle, BookOpen, Eye, Image, CheckCircle, Star, Edit, Info, Bot } from "lucide-react";

interface ComponentPaletteProps {
  onAddBlock: (blockType: string) => void;
}

const components = [
  {
    category: "AI Experiments",
    items: [
      { type: "ai_stroop", icon: Bot, label: "AI Stroop Task", color: "text-cyan-500" },
      { type: "ai_memory", icon: Bot, label: "AI Memory Task", color: "text-cyan-600" },
      { type: "ai_survey", icon: Bot, label: "AI Survey", color: "text-cyan-700" },
    ]
  },
  {
    category: "Basic",
    items: [
      { type: "consent", icon: FileText, label: "Consent Form", color: "text-blue-500" },
      { type: "demographics", icon: UserCircle, label: "Demographics", color: "text-green-500" },
      { type: "instructions", icon: BookOpen, label: "Instructions", color: "text-purple-500" },
    ]
  },
  {
    category: "Tasks",
    items: [
      { type: "stroop", icon: Eye, label: "Stroop Task", color: "text-blue-500" },
      { type: "image_recall", icon: Image, label: "Image Recall", color: "text-purple-500" },
    ]
  },
  {
    category: "Survey",
    items: [
      { type: "mcq", icon: CheckCircle, label: "Multiple Choice", color: "text-green-500" },
      { type: "likert", icon: Star, label: "Likert Scale", color: "text-yellow-500" },
      { type: "openended", icon: Edit, label: "Open Ended", color: "text-orange-500" },
    ]
  },
  {
    category: "Other",
    items: [
      { type: "debrief", icon: Info, label: "Debrief", color: "text-gray-500" },
    ]
  }
];

export default function ComponentPalette({ onAddBlock }: ComponentPaletteProps) {
  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("text/plain", componentType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6" data-testid="component-palette">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Components</h3>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {components.map((category) => (
            <div key={category.category}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {category.category}
              </div>
              <div className="space-y-2">
                {category.items.map((component) => (
                  <div
                    key={component.type}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-move transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, component.type)}
                    onClick={() => onAddBlock(component.type)}
                    data-testid={`component-${component.type}`}
                  >
                    <component.icon className={`${component.color} h-4 w-4`} />
                    <span className="text-sm font-medium">{component.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
