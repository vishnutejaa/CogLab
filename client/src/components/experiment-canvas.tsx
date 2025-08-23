import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Settings, Trash2, Plus } from "lucide-react";

interface ExperimentBlock {
  id: string;
  type: string;
  title: string;
  [key: string]: any;
}

interface ExperimentCanvasProps {
  blocks: ExperimentBlock[];
  selectedBlock: ExperimentBlock | null;
  onSelectBlock: (block: ExperimentBlock) => void;
  onUpdateBlock: (blockId: string, updates: Partial<ExperimentBlock>) => void;
  onRemoveBlock: (blockId: string) => void;
  onReorderBlocks: (blocks: ExperimentBlock[]) => void;
  onAddBlock: (blockType: string) => void;
}

function getBlockColor(type: string) {
  switch (type) {
    case "consent":
      return "bg-blue-50 border-blue-200 text-blue-800";
    case "demographics":
      return "bg-green-50 border-green-200 text-green-800";
    case "stroop":
      return "bg-blue-50 border-blue-200 text-blue-800";
    case "image_recall":
      return "bg-purple-50 border-purple-200 text-purple-800";
    case "survey":
      return "bg-purple-50 border-purple-200 text-purple-800";
    case "mcq":
      return "bg-green-50 border-green-200 text-green-800";
    case "likert":
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    case "openended":
      return "bg-orange-50 border-orange-200 text-orange-800";
    case "instructions":
      return "bg-gray-50 border-gray-200 text-gray-800";
    case "debrief":
      return "bg-gray-50 border-gray-200 text-gray-800";
    default:
      return "bg-gray-50 border-gray-200 text-gray-800";
  }
}

function getBlockIcon(type: string) {
  switch (type) {
    case "consent":
      return "📋";
    case "demographics":
      return "👤";
    case "stroop":
      return "👁️";
    case "image_recall":
      return "🖼️";
    case "survey":
      return "📝";
    case "mcq":
      return "✅";
    case "likert":
      return "⭐";
    case "openended":
      return "✏️";
    case "instructions":
      return "📖";
    case "debrief":
      return "ℹ️";
    default:
      return "📄";
  }
}

function getBlockDescription(block: ExperimentBlock) {
  switch (block.type) {
    case "consent":
      return "Participant agreement required";
    case "demographics":
      return "Age, gender, education level";
    case "stroop":
      return `${block.trialCount || block.trials || 60} trials, ${block.duration ? block.duration/1000 : 5}s each`;
    case "image_recall":
      return `${block.trialCount || block.images || 5} images, memory assessment`;
    case "survey":
      return `${block.questions?.length || 5} questions, mixed types`;
    case "mcq":
      return `${block.questions?.length || 1} multiple choice questions`;
    case "likert":
      return `${block.questions?.length || 1} Likert scale questions`;
    case "openended":
      return `${block.questions?.length || 1} open-ended questions`;
    case "instructions":
      return "Task instructions and guidance";
    case "debrief":
      return "Thank you message and resources";
    default:
      return "Experiment component";
  }
}

export default function ExperimentCanvas({
  blocks,
  selectedBlock,
  onSelectBlock,
  onUpdateBlock,
  onRemoveBlock,
  onReorderBlocks,
  onAddBlock
}: ExperimentCanvasProps) {
  const [draggedBlock, setDraggedBlock] = useState<ExperimentBlock | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, block: ExperimentBlock) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    // Check if this is a new component from the palette
    const componentType = e.dataTransfer.getData("text/plain");
    
    if (componentType && !draggedBlock) {
      // This is a new component from the palette
      onAddBlock(componentType);
      return;
    }
    
    if (!draggedBlock) return;
    
    const dragIndex = blocks.findIndex(block => block.id === draggedBlock.id);
    if (dragIndex === -1 || dragIndex === dropIndex) return;
    
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(dropIndex, 0, removed);
    
    onReorderBlocks(newBlocks);
    setDraggedBlock(null);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-screen" data-testid="experiment-canvas">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Experiment Flow</h3>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4 min-h-96">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`
                ${getBlockColor(block.type)} 
                border rounded-lg p-4 flex items-center justify-between cursor-pointer
                ${selectedBlock?.id === block.id ? 'ring-2 ring-primary ring-offset-2' : ''}
                ${dragOverIndex === index ? 'border-primary border-2' : ''}
                transition-all duration-200
              `}
              draggable
              onDragStart={(e) => handleDragStart(e, block)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectBlock(block)}
              data-testid={`experiment-block-${block.id}`}
            >
              <div className="flex items-center space-x-3">
                <GripVertical className="text-gray-400 cursor-move" size={16} />
                <span className="text-lg">{getBlockIcon(block.type)}</span>
                <div>
                  <h4 className="font-medium">{block.title}</h4>
                  <p className="text-sm opacity-75">{getBlockDescription(block)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBlock(block);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  data-testid={`button-settings-${block.id}`}
                >
                  <Settings size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBlock(block.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                  data-testid={`button-remove-${block.id}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}

          {/* Drop Zone */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 hover:border-primary hover:bg-blue-50 transition-colors"
            onDragOver={(e) => handleDragOver(e, blocks.length)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, blocks.length)}
            data-testid="drop-zone"
          >
            <Plus className="mx-auto mb-2 h-8 w-8" />
            <p>Drag components here to add them to your experiment</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
