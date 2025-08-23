import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface StroopConfig {
  trials: number;
  duration: number;
  randomize: boolean;
  conditions: string[];
}

interface StroopTaskProps {
  config: StroopConfig;
  onResponse: (data: any) => void;
  onComplete: () => void;
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

export default function StroopTask({ config, onResponse, onComplete }: StroopTaskProps) {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [stimuli, setStimuli] = useState<StroopStimulus[]>([]);
  const [currentStimulus, setCurrentStimulus] = useState<StroopStimulus | null>(null);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [showStimulus, setShowStimulus] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [responses, setResponses] = useState<any[]>([]);

  // Generate stimuli
  useEffect(() => {
    const generateStimuli = () => {
      const newStimuli: StroopStimulus[] = [];
      const trialsPerCondition = Math.floor(config.trials / config.conditions.length);
      
      config.conditions.forEach(condition => {
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
      while (newStimuli.length < config.trials) {
        const colorName = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
        const colorObj = COLORS[colorName as keyof typeof COLORS];
        const condition = config.conditions[Math.floor(Math.random() * config.conditions.length)];
        
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

    onResponse(responseData);
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
            <li>• There will be {config.trials} trials in total</li>
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
          Trial <span data-testid="current-trial">{currentTrial + 1}</span> of <span data-testid="total-trials">{config.trials}</span>
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentTrial) / config.trials) * 100}%` }}
            data-testid="progress-bar"
          />
        </div>
      </div>
    </div>
  );
}
