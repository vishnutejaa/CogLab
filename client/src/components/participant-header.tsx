import { Brain } from "lucide-react";

interface ParticipantHeaderProps {
  studyTitle: string;
  currentBlock: number;
  totalBlocks: number;
}

export default function ParticipantHeader({ studyTitle, currentBlock, totalBlocks }: ParticipantHeaderProps) {
  const progressPercentage = (currentBlock / totalBlocks) * 100;

  return (
    <div className="bg-white border-b border-gray-200" data-testid="participant-header">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="text-white text-xs" />
            </div>
            <span className="font-medium text-gray-900" data-testid="study-title">CogLab Study</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Progress:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                  data-testid="progress-bar"
                />
              </div>
              <span className="text-sm font-medium text-gray-900" data-testid="progress-text">
                {currentBlock} of {totalBlocks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
