import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DemographicsFormProps {
  onSubmit: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
}

export default function DemographicsForm({ onSubmit, onNext, onPrevious, canGoBack }: DemographicsFormProps) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [language, setLanguage] = useState("");

  const canContinue = age && gender && education && language;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;

    const demographicsData = {
      age: parseInt(age),
      gender,
      education,
      language
    };

    onSubmit(demographicsData);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-testid="demographics-form">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Demographics</h1>
        <p className="text-gray-600">Please provide some basic information about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            data-testid="input-age"
          />
        </div>

        <div>
          <Label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="select-gender"
            >
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
            Highest Level of Education
          </Label>
          <Select value={education} onValueChange={setEducation}>
            <SelectTrigger 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="select-education"
            >
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high-school">High School</SelectItem>
              <SelectItem value="some-college">Some College</SelectItem>
              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
              <SelectItem value="masters">Master's Degree</SelectItem>
              <SelectItem value="doctorate">Doctorate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Primary Language
          </Label>
          <Input
            id="language"
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Enter your primary language"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            data-testid="input-language"
          />
        </div>
      </form>

      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoBack}
          className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-previous"
        >
          Previous
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!canContinue}
          className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          data-testid="button-continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
