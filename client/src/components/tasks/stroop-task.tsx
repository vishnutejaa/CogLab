import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface StroopConfig {
  trials?: number;
  trialCount?: number;
  duration?: number;
  randomize?: boolean;
  conditions?: string[];
  colors?: string[];
  timings?: {
    fixationDuration: number;
    stimulusDuration: number | string;
    responseWindow: number;
  };
  stimuli?: any[];
}

interface StroopTaskProps {
  config: StroopConfig;
  onResponse: (data: any) => void;
  onComplete: () => void;
  participantId?: string;
}

interface StroopStimulus {
  word: string;
  color: string;
  condition: "congruent" | "incongruent" | "neutral";
  correctResponse: string;
}

const COLORS = {
  red: { name: "red", hex: "#dc2626", key: "r" },
  green: { name: "green", hex: "#16a34a", key: "g" },
  blue: { name: "blue", hex: "#2563eb", key: "b" },
  yellow: { name: "yellow", hex: "#eab308", key: "y" }
};

const COLOR_NAMES = Object.keys(COLORS);
const NEUTRAL_WORDS = ["XXXX", "####", "****", "||||"];

// Helper function to get color key from color name or hex
const getColorKey = (colorValue: string): string => {
  // If it's a color name, return its key
  const colorName = colorValue.toLowerCase();
  if (COLORS[colorName as keyof typeof COLORS]) {
    return COLORS[colorName as keyof typeof COLORS].key;
  }
  
  // If it's a hex value, map to closest color
  const colorMap: { [key: string]: string } = {
    '#dc2626': 'r', // red
    '#16a34a': 'g', // green  
    '#2563eb': 'b', // blue
    '#eab308': 'y'  // yellow
  };
  
  return colorMap[colorValue] || 'r'; // default to red
};

export default function StroopTask({ config, onResponse, onComplete, participantId }: StroopTaskProps) {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [stimuli, setStimuli] = useState<StroopStimulus[]>([]);
  const [currentStimulus, setCurrentStimulus] = useState<StroopStimulus | null>(null);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [showStimulus, setShowStimulus] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [responses, setResponses] = useState<any[]>([]);
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);

  // Generate stimuli
  useEffect(() => {
    const generateStimuli = () => {
      const newStimuli: StroopStimulus[] = [];
      
      // Handle AI-generated config format
      const trials = config.trialCount || config.trials || 60;
      const conditions = config.conditions || ['congruent', 'incongruent'];
      
      // If AI provided pre-generated stimuli, use those
      if (config.stimuli && config.stimuli.length > 0) {
        const aiStimuli = config.stimuli.slice(0, trials);
        const mappedStimuli = aiStimuli.map((stimulus: any) => ({
          word: stimulus.word?.toUpperCase() || 'RED',
          color: stimulus.displayColor || stimulus.color || '#dc2626',
          condition: (stimulus.congruence === 'congruent' ? 'congruent' : 
                     stimulus.congruence === 'incongruent' ? 'incongruent' : 'congruent') as "congruent" | "incongruent" | "neutral",
          correctResponse: getColorKey(stimulus.displayColor || stimulus.color || '#dc2626')
        }));
        return mappedStimuli;
      }
      
      const trialsPerCondition = Math.floor(trials / conditions.length);
      
      conditions.forEach(condition => {
        for (let i = 0; i < trialsPerCondition; i++) {
          const colorName = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
          const colorObj = COLORS[colorName as keyof typeof COLORS];
          
          let stimulus: StroopStimulus;
          
          if (condition === "congruent") {
            stimulus = {
              word: colorName.toUpperCase(),
              color: colorObj.hex,
              condition: "congruent",
              correctResponse: colorObj.key
            };
          } else if (condition === "incongruent") {
            const differentColorNames = COLOR_NAMES.filter(c => c !== colorName);
            const wordColor = differentColorNames[Math.floor(Math.random() * differentColorNames.length)];
            stimulus = {
              word: wordColor.toUpperCase(),
              color: colorObj.hex,
              condition: "incongruent",
              correctResponse: colorObj.key
            };
          } else { // neutral
            const neutralWord = NEUTRAL_WORDS[Math.floor(Math.random() * NEUTRAL_WORDS.length)];
            stimulus = {
              word: neutralWord,
              color: colorObj.hex,
              condition: "neutral",
              correctResponse: colorObj.key
            };
          }
          
          newStimuli.push(stimulus);
        }
      });

      // Fill remaining trials if needed
      while (newStimuli.length < trials) {
        const colorName = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
        const colorObj = COLORS[colorName as keyof typeof COLORS];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        if (condition === "congruent") {
          newStimuli.push({
            word: colorName.toUpperCase(),
            color: colorObj.hex,
            condition: "congruent",
            correctResponse: colorObj.key
          });
        } else {
          const differentColorNames = COLOR_NAMES.filter(c => c !== colorName);
          const wordColor = differentColorNames[Math.floor(Math.random() * differentColorNames.length)];
          newStimuli.push({
            word: wordColor.toUpperCase(),
            color: colorObj.hex,
            condition: "incongruent",
            correctResponse: colorObj.key
          });
        }
      }

      return config.randomize ? newStimuli.sort(() => Math.random() - 0.5) : newStimuli;
    };

    setStimuli(generateStimuli());
  }, [config]);

  const startTrial = useCallback(() => {
    if (currentTrial >= stimuli.length) {
      onComplete();
      return;
    }

    const stimulus = stimuli[currentTrial];
    setCurrentStimulus(stimulus);
    setShowStimulus(true);
    setTrialStartTime(Date.now());
  }, [currentTrial, stimuli, onComplete]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!showStimulus || !currentStimulus) return;

    const key = event.key.toLowerCase();
    const validKeys = Object.values(COLORS).map(c => c.key);
    
    if (!validKeys.includes(key)) return;

    const responseTime = Date.now() - trialStartTime;
    const isCorrect = key === currentStimulus.correctResponse;

    const responseData = {
      blockId: "stroop",
      blockType: "stroop",
      questionId: `trial_${currentTrial + 1}`,
      response: {
        keyPressed: key,
        correct: isCorrect,
        responseTime: responseTime,
        trialNumber: currentTrial + 1
      },
      responseTime: responseTime,
      accuracy: isCorrect,
      stimulus: {
        word: currentStimulus.word,
        color: currentStimulus.color,
        condition: currentStimulus.condition,
        correctResponse: currentStimulus.correctResponse
      }
    };

    // Submit response and check for AI warnings
    const submitResponse = async () => {
      try {
        const response = await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...responseData,
            participantId: participantId || 'anonymous'
          })
        });
        
        const result = await response.json();
        
        // Check for AI-generated warnings
        if (result.warnings && result.warnings.length > 0) {
          setAiWarnings(result.warnings);
          // Clear warnings after a few seconds
          setTimeout(() => setAiWarnings([]), 5000);
        }
        
        onResponse(responseData);
      } catch (error) {
        console.error('Error submitting response:', error);
        onResponse(responseData);
      }
    };
    
    submitResponse();
    setResponses(prev => [...prev, responseData]);

    // Move to next trial
    setShowStimulus(false);
    setCurrentTrial(prev => prev + 1);
    
    // Small delay before next trial
    setTimeout(() => {
      startTrial();
    }, 500);
  }, [showStimulus, currentStimulus, trialStartTime, currentTrial, onResponse, startTrial]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startTask = () => {
    setShowInstructions(false);
    startTrial();
  };

  if (showInstructions) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="stroop-instructions">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Stroop Task</h1>
          <p className="text-gray-600 mb-6">Identify the COLOR of the word, not the word itself</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Instructions:</h3>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li>• You will see words displayed in different colors</li>
            <li>• Press the key corresponding to the COLOR of the word (not the word itself)</li>
            <li>• Respond as quickly and accurately as possible</li>
            <li>• There will be {config.trialCount || config.trials || 60} trials in total</li>
          </ul>

          <h4 className="font-semibold text-gray-900 mb-3">Key Mappings:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(COLORS).map(([name, color]) => (
              <div key={name} className="text-center p-3 bg-white border rounded-lg">
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-2" 
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-sm font-medium">{color.key.toUpperCase()} - {name.charAt(0).toUpperCase() + name.slice(1)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={startTask}
            className="px-8 py-3 text-white bg-primary rounded-lg hover:bg-blue-700"
            data-testid="button-start-task"
          >
            Start Task
          </Button>
        </div>
      </div>
    );
  }

  if (currentTrial >= stimuli.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="stroop-complete">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Complete!</h2>
          <p className="text-gray-600 mb-6">You have completed the Stroop task.</p>
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-testid="stroop-trial">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Stroop Task</h1>
        <p className="text-gray-600">Identify the COLOR of the word, not the word itself</p>
        <p className="text-sm text-gray-500 mt-2">Use the keyboard keys: R (Red), G (Green), B (Blue), Y (Yellow)</p>
      </div>

      {/* AI Quality Warnings */}
      {aiWarnings.length > 0 && (
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="font-medium mb-1">AI Quality Monitor:</div>
            {aiWarnings.map((warning, index) => (
              <div key={index} className="text-sm">• {warning}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white border-2 border-gray-200 rounded-lg min-h-96 flex items-center justify-center mb-6">
        <div className="text-center">
          {showStimulus && currentStimulus ? (
            <div className="text-6xl font-bold mb-6" 
                 style={{ color: currentStimulus.color }}
                 data-testid="stimulus-word">
              {currentStimulus.word}
            </div>
          ) : (
            <div className="text-2xl text-gray-400" data-testid="fixation-cross">+</div>
          )}
          <div className="text-sm text-gray-600">
            Press the key corresponding to the color of the word
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {Object.entries(COLORS).map(([name, color]) => (
          <div key={name} className="px-4 py-2 rounded-lg" 
               style={{ backgroundColor: `${color.hex}20`, borderColor: color.hex, borderWidth: '1px' }}>
            <span className="font-medium" style={{ color: color.hex }}>
              {color.key.toUpperCase()} - {name.charAt(0).toUpperCase() + name.slice(1)}
            </span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600" data-testid="trial-progress">
          Trial <span data-testid="current-trial">{currentTrial + 1}</span> of <span data-testid="total-trials">{config.trialCount || config.trials || 60}</span>
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentTrial) / (config.trialCount || config.trials || 60)) * 100}%` }}
            data-testid="progress-bar"
          />
        </div>
      </div>
    </div>
  );
}
