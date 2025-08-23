import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageRecallConfig {
  images?: number;
  studyTime?: number;
  recallTime?: number;
  trialCount?: number;
  timings?: {
    fixationDuration: number;
    stimulusDuration: number;
    responseWindow: number;
  };
  aiImages?: {
    id: string;
    name: string;
    category: string;
    url: string;
  }[];
}

interface ImageRecallTaskProps {
  config: ImageRecallConfig;
  onResponse: (data: any) => void;
  onComplete: () => void;
}

interface ImageStimulus {
  id: string;
  name: string;
  category: string;
  url: string;
}

// Using placeholder images for demo - in production, these would come from a proper image database
const SAMPLE_IMAGES: ImageStimulus[] = [
  { id: "img1", name: "Apple", category: "Fruit", url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop" },
  { id: "img2", name: "Car", category: "Vehicle", url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&h=300&fit=crop" },
  { id: "img3", name: "Book", category: "Object", url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop" },
  { id: "img4", name: "Tree", category: "Nature", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop" },
  { id: "img5", name: "House", category: "Building", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=300&fit=crop" },
  { id: "img6", name: "Cat", category: "Animal", url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=300&fit=crop" },
  { id: "img7", name: "Chair", category: "Furniture", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop" },
  { id: "img8", name: "Mountain", category: "Landscape", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop" },
  { id: "img9", name: "Phone", category: "Technology", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop" },
  { id: "img10", name: "Flower", category: "Nature", url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop" },
  { id: "img11", name: "Dog", category: "Animal", url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop" },
  { id: "img12", name: "Bicycle", category: "Vehicle", url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop" },
  { id: "img13", name: "Coffee", category: "Food", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop" },
  { id: "img14", name: "Shoes", category: "Clothing", url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" },
  { id: "img15", name: "Guitar", category: "Instrument", url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" },
  { id: "img16", name: "Clock", category: "Object", url: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=300&h=300&fit=crop" },
  { id: "img17", name: "Ball", category: "Toy", url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop" },
  { id: "img18", name: "Lamp", category: "Furniture", url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300&h=300&fit=crop" },
  { id: "img19", name: "Cake", category: "Food", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop" },
  { id: "img20", name: "Key", category: "Object", url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300&h=300&fit=crop" }
];

type Phase = "instructions" | "study" | "distractor" | "recall" | "complete";

export default function ImageRecallTask({ config, onResponse, onComplete }: ImageRecallTaskProps) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [studyImages, setStudyImages] = useState<ImageStimulus[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [studyStartTime, setStudyStartTime] = useState(0);
  const [recallResponses, setRecallResponses] = useState<string[]>([]);
  const [currentRecallInput, setCurrentRecallInput] = useState("");
  const [recallStartTime, setRecallStartTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Initialize study images
  useEffect(() => {
    if (config.aiImages && config.aiImages.length > 0) {
      // Use AI-generated images
      const shuffled = [...config.aiImages].sort(() => Math.random() - 0.5);
      const imageCount = config.trialCount || config.images || 5;
      setStudyImages(shuffled.slice(0, imageCount));
    } else {
      // Use fallback sample images
      const shuffled = [...SAMPLE_IMAGES].sort(() => Math.random() - 0.5);
      const imageCount = config.images || 5;
      setStudyImages(shuffled.slice(0, imageCount));
    }
  }, [config.images, config.aiImages, config.trialCount]);

  // Timer for study phase
  useEffect(() => {
    if (phase === "study" && currentImageIndex < studyImages.length) {
      setStudyStartTime(Date.now());
      const studyTime = config.studyTime || config.timings?.stimulusDuration || 4000;
      const timer = setTimeout(() => {
        if (currentImageIndex + 1 < studyImages.length) {
          setCurrentImageIndex(currentImageIndex + 1);
        } else {
          setPhase("distractor");
        }
      }, studyTime);
      return () => clearTimeout(timer);
    }
  }, [phase, currentImageIndex, studyImages.length, config.studyTime, config.timings]);

  // Timer for recall phase
  useEffect(() => {
    if (phase === "recall") {
      setRecallStartTime(Date.now());
      const recallTime = config.recallTime || config.timings?.responseWindow || 10000;
      setTimeRemaining(recallTime);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            setPhase("complete");
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [phase, config.recallTime, config.timings]);

  const startStudyPhase = () => {
    setPhase("study");
    setCurrentImageIndex(0);
  };

  const startRecallPhase = () => {
    setPhase("recall");
  };

  const handleRecallSubmit = () => {
    if (currentRecallInput.trim()) {
      const newResponses = [...recallResponses, currentRecallInput.trim()];
      setRecallResponses(newResponses);
      
      // Submit response data
      const responseData = {
        blockId: "image_recall",
        blockType: "image_recall",
        questionId: `recall_${newResponses.length}`,
        response: {
          recalledItem: currentRecallInput.trim(),
          position: newResponses.length,
          totalRecalled: newResponses.length
        },
        responseTime: Date.now() - recallStartTime,
        accuracy: null, // Will be calculated later based on study images
        stimulus: {
          studiedImages: studyImages.map(img => img.name),
          recallTimeLimit: config.recallTime
        }
      };
      
      onResponse(responseData);
      setCurrentRecallInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRecallSubmit();
    }
  };

  const finishRecall = () => {
    // Submit final summary response
    const finalResponseData = {
      blockId: "image_recall",
      blockType: "image_recall",
      questionId: "recall_summary",
      response: {
        totalRecalled: recallResponses.length,
        recallList: recallResponses,
        accuracy: calculateAccuracy()
      },
      responseTime: Date.now() - recallStartTime,
      accuracy: calculateAccuracy(),
      stimulus: {
        studiedImages: studyImages.map(img => img.name),
        totalImages: studyImages.length
      }
    };
    
    onResponse(finalResponseData);
    setPhase("complete");
  };

  const calculateAccuracy = () => {
    const studiedNames = studyImages.map(img => img.name.toLowerCase());
    const correctRecalls = recallResponses.filter(response => 
      studiedNames.includes(response.toLowerCase())
    );
    return correctRecalls.length / studyImages.length;
  };

  if (phase === "instructions") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="image-recall-instructions">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Image Recall Task</h1>
          <p className="text-gray-600">Test your visual memory</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Instructions:</h3>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li>• You will see {config.trialCount || config.images || 5} images, one at a time</li>
            <li>• Each image will be shown for {(config.studyTime || config.timings?.stimulusDuration || 3000) / 1000} seconds</li>
            <li>• Pay close attention and try to remember each image</li>
            <li>• After viewing all images, you'll be asked to recall as many as you can</li>
            <li>• You'll have {(config.recallTime || config.timings?.responseWindow || 10000) / 1000} seconds for the recall phase</li>
          </ul>
        </div>

        <div className="text-center">
          <Button 
            onClick={startStudyPhase}
            className="px-8 py-3 text-white bg-primary rounded-lg hover:bg-blue-700"
            data-testid="button-start-study"
          >
            Start Study Phase
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "study") {
    const currentImage = studyImages[currentImageIndex];
    if (!currentImage) return null;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="study-phase">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Phase</h1>
          <p className="text-gray-600">Memorize each image carefully</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg min-h-96 flex items-center justify-center mb-6">
          <div className="text-center">
            <img 
              src={currentImage.url}
              alt={currentImage.name}
              className="w-64 h-64 object-cover rounded-lg mb-4"
              data-testid="study-image"
            />
            <h3 className="text-lg font-medium text-gray-900" data-testid="image-name">
              {currentImage.name}
            </h3>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600" data-testid="study-progress">
            Image <span data-testid="current-image">{currentImageIndex + 1}</span> of <span data-testid="total-images">{studyImages.length}</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentImageIndex + 1) / studyImages.length) * 100}%` }}
              data-testid="study-progress-bar"
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "distractor") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="distractor-phase">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Quick Break</h1>
          <p className="text-gray-600 mb-8">
            You have finished studying the images. Now you will be asked to recall as many as you can remember.
          </p>
          <Button 
            onClick={startRecallPhase}
            className="px-8 py-3 text-white bg-primary rounded-lg hover:bg-blue-700"
            data-testid="button-start-recall"
          >
            Start Recall Phase
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "recall") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="recall-phase">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recall Phase</h1>
          <p className="text-gray-600">Type the names of images you remember</p>
          <p className="text-sm text-warning mt-2">
            Time remaining: <span data-testid="time-remaining">{Math.ceil(timeRemaining / 1000)}</span> seconds
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex space-x-2 mb-4">
            <Input
              value={currentRecallInput}
              onChange={(e) => setCurrentRecallInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type an image name and press Enter"
              className="flex-1"
              data-testid="recall-input"
            />
            <Button 
              onClick={handleRecallSubmit}
              disabled={!currentRecallInput.trim()}
              className="px-4 py-2"
              data-testid="button-submit-recall"
            >
              Add
            </Button>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Recalled Images ({recallResponses.length}):
            </h3>
            {recallResponses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recallResponses.map((response, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    data-testid={`recalled-item-${index}`}
                  >
                    {response}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No items recalled yet</p>
            )}
          </div>

          <div className="text-center">
            <Button 
              onClick={finishRecall}
              variant="outline"
              className="px-6 py-2"
              data-testid="button-finish-recall"
            >
              Finish Recall
            </Button>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-warning h-2 rounded-full transition-all duration-1000" 
            style={{ width: `${((config.recallTime || config.timings?.responseWindow || 10000) - timeRemaining) / (config.recallTime || config.timings?.responseWindow || 10000) * 100}%` }}
            data-testid="recall-progress-bar"
          />
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    const accuracy = calculateAccuracy();
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="recall-complete">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Complete!</h2>
          <p className="text-gray-600 mb-6">You have completed the image recall task.</p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Your Results:</h3>
            <div className="space-y-2 text-gray-700">
              <p>Images studied: <span className="font-medium" data-testid="images-studied">{studyImages.length}</span></p>
              <p>Items recalled: <span className="font-medium" data-testid="items-recalled">{recallResponses.length}</span></p>
              <p>Accuracy: <span className="font-medium" data-testid="recall-accuracy">{Math.round(accuracy * 100)}%</span></p>
            </div>
          </div>
          
          <Button 
            onClick={onComplete}
            className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-blue-700"
            data-testid="button-continue-task"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
