import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ConsentFormProps {
  onSubmit: (data: { consented: boolean; timestamp: string }) => void;
  studyTitle: string;
}

export default function ConsentForm({ onSubmit, studyTitle }: ConsentFormProps) {
  const [hasRead, setHasRead] = useState(false);
  const [willParticipate, setWillParticipate] = useState(false);
  const [isEighteen, setIsEighteen] = useState(false);

  const canConsent = hasRead && willParticipate && isEighteen;

  const handleAgree = () => {
    onSubmit({
      consented: true,
      timestamp: new Date().toISOString()
    });
  };

  const handleDecline = () => {
    // In a real app, this might redirect to a decline page
    window.close();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-testid="consent-form">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Informed Consent</h1>
        <p className="text-gray-600">Please read the following information carefully</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <div className="prose prose-sm max-w-none text-gray-800">
          <h3 className="font-semibold mb-3">Study Title: {studyTitle}</h3>
          <p className="mb-4">
            You are being invited to participate in a research study investigating cognitive processes. 
            This study is being conducted by researchers to better understand human psychology and behavior.
          </p>
          
          <h4 className="font-semibold mb-2">What will happen during the study?</h4>
          <p className="mb-4">
            You will complete computer-based tasks and questionnaires. The study takes approximately 
            15-20 minutes to complete. You will be asked to respond to various stimuli and answer questions 
            about your demographic background.
          </p>
          
          <h4 className="font-semibold mb-2">Risks and Benefits</h4>
          <p className="mb-4">
            There are no known risks associated with this study beyond those encountered in daily life. 
            Your participation will contribute to our understanding of cognitive processes and may help 
            advance psychological research.
          </p>
          
          <h4 className="font-semibold mb-2">Confidentiality</h4>
          <p className="mb-4">
            All data collected will be anonymous and confidential. No personal identifying information 
            will be stored with your responses. Data will be used solely for research purposes and may 
            be shared in aggregate form in scientific publications.
          </p>

          <h4 className="font-semibold mb-2">Voluntary Participation</h4>
          <p className="mb-4">
            Your participation is completely voluntary. You may withdraw from the study at any time 
            without penalty. You may also skip any questions you do not wish to answer.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <Checkbox
            id="hasRead"
            checked={hasRead}
            onCheckedChange={(checked) => setHasRead(checked === true)}
            className="mt-1"
            data-testid="checkbox-has-read"
          />
          <Label htmlFor="hasRead" className="ml-3 text-sm text-gray-700">
            I have read and understand the information provided above
          </Label>
        </div>
        
        <div className="flex items-start">
          <Checkbox
            id="willParticipate"
            checked={willParticipate}
            onCheckedChange={(checked) => setWillParticipate(checked === true)}
            className="mt-1"
            data-testid="checkbox-will-participate"
          />
          <Label htmlFor="willParticipate" className="ml-3 text-sm text-gray-700">
            I voluntarily agree to participate in this research study
          </Label>
        </div>
        
        <div className="flex items-start">
          <Checkbox
            id="isEighteen"
            checked={isEighteen}
            onCheckedChange={(checked) => setIsEighteen(checked === true)}
            className="mt-1"
            data-testid="checkbox-is-eighteen"
          />
          <Label htmlFor="isEighteen" className="ml-3 text-sm text-gray-700">
            I am 18 years of age or older
          </Label>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleDecline}
          className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          data-testid="button-decline"
        >
          Decline
        </Button>
        <Button
          onClick={handleAgree}
          disabled={!canConsent}
          className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          data-testid="button-agree"
        >
          I Agree to Participate
        </Button>
      </div>
    </div>
  );
}
