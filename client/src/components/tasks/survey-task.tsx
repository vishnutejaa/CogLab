import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SurveyQuestion {
  id: string;
  type: 'multiple_choice' | 'likert' | 'open_ended';
  question: string;
  options?: string[];
  scale?: { min: number; max: number; labels: string[] };
}

interface SurveyConfig {
  questions?: SurveyQuestion[];
  surveyType?: string;
  topic?: string;
  title?: string;
}

interface SurveyTaskProps {
  config: SurveyConfig;
  onResponse: (data: any) => void;
  onComplete: () => void;
  participantId?: string;
}

export default function SurveyTask({ config, onResponse, onComplete }: SurveyTaskProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [showInstructions, setShowInstructions] = useState(true);

  const questions = config.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="survey-empty">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey</h1>
          <p className="text-gray-600">No questions available.</p>
          <Button onClick={onComplete} className="mt-4">Continue</Button>
        </div>
      </div>
    );
  }

  const handleResponse = (questionId: string, response: any) => {
    const newResponses = { ...responses, [questionId]: response };
    setResponses(newResponses);

    // Submit individual response
    const responseData = {
      blockId: "survey",
      blockType: "survey",
      questionId: questionId,
      response: response,
      responseTime: null,
      accuracy: null,
      stimulus: {
        question: currentQuestion.question,
        type: currentQuestion.type,
        questionIndex: currentQuestionIndex + 1
      }
    };

    onResponse(responseData);
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      // Survey complete
      onComplete();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const canProceed = responses[currentQuestion?.id];

  if (showInstructions) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="survey-instructions">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey</h1>
          <p className="text-gray-600">{config.topic || "Please answer the following questions"}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Instructions:</h3>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li>• You will be presented with {questions.length} questions</li>
            <li>• Please answer each question honestly and thoughtfully</li>
            <li>• You can navigate back to previous questions if needed</li>
            <li>• Take your time - there are no time limits</li>
          </ul>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => setShowInstructions(false)}
            className="px-8 py-3 text-white bg-primary rounded-lg hover:bg-blue-700"
            data-testid="button-start-survey"
          >
            Start Survey
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4" data-testid="multiple-choice-question">
            <RadioGroup 
              value={responses[currentQuestion.id] || ""}
              onValueChange={(value) => handleResponse(currentQuestion.id, value)}
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'likert':
        const scale = currentQuestion.scale || { min: 1, max: 7, labels: [] };
        return (
          <div className="space-y-4" data-testid="likert-question">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">{scale.labels[0] || 'Strongly Disagree'}</span>
              <span className="text-sm text-gray-600">{scale.labels[scale.labels.length - 1] || 'Strongly Agree'}</span>
            </div>
            <RadioGroup 
              value={responses[currentQuestion.id]?.toString() || ""}
              onValueChange={(value) => handleResponse(currentQuestion.id, parseInt(value))}
              className="flex justify-between"
            >
              {Array.from({ length: scale.max - scale.min + 1 }, (_, i) => {
                const value = scale.min + i;
                return (
                  <div key={value} className="flex flex-col items-center space-y-2">
                    <RadioGroupItem value={value.toString()} id={`scale-${value}`} />
                    <Label htmlFor={`scale-${value}`} className="text-sm cursor-pointer">
                      {value}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

      case 'open_ended':
        return (
          <div className="space-y-4" data-testid="open-ended-question">
            <Textarea
              value={responses[currentQuestion.id] || ""}
              onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
              placeholder="Please share your thoughts..."
              rows={4}
              className="w-full"
            />
          </div>
        );

      default:
        return (
          <div className="text-gray-500">
            Unsupported question type: {currentQuestion.type}
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-testid="survey-question">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey</h1>
        <p className="text-gray-600">{config.topic || "Survey Questions"}</p>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {currentQuestion.type.replace('_', ' ')}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>
        </div>

        {renderQuestion()}
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          data-testid="button-previous"
        >
          Previous
        </Button>

        <div className="flex-1 mx-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + (canProceed ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="px-6 py-2"
          data-testid="button-next"
        >
          {currentQuestionIndex + 1 >= questions.length ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}