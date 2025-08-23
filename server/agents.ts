import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-fallback',
});

// Check if OpenAI is properly configured
const isOpenAIConfigured = () => {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
};

export interface ExperimentConfig {
  taskType: 'stroop' | 'image_recall';
  trialCount: number;
  colors?: string[];
  timings?: {
    fixationDuration: number;
    stimulusDuration: number;
    responseWindow: number;
  };
  stimuli?: any[];
  images?: {
    id: string;
    name: string;
    category: string;
    url: string;
  }[];
}

export interface ExperimentData {
  responses: any[];
  participantId: string;
  studyId: string;
  deviceInfo?: any;
}

export interface AnalysisResult {
  meanResponseTime: number;
  accuracy: number;
  stroopEffect?: number;
  outlierCount: number;
  qualityScore: number;
  insights: string[];
  recommendations: string[];
}

export class DesignerAgent {
  async generateExperimentConfig(taskType: 'stroop' | 'image_recall', customRequirements?: string, imageCount?: number): Promise<ExperimentConfig> {
    if (!isOpenAIConfigured()) {
      console.warn('OpenAI API key not configured, using fallback configuration');
      return this.getFallbackConfig(taskType);
    }

    const prompt = `You are a psychology experiment designer. Generate a comprehensive configuration for a ${taskType} task experiment.

${customRequirements ? `Additional requirements: ${customRequirements}` : ''}

For a Stroop task, include:
- Appropriate number of trials (typically 60-120)
- Color words and display colors
- Timing parameters (fixation: 500ms, stimulus: until response, response window: 3000ms)
- Balanced congruent/incongruent trials

For an image recall task, include:
- Number of study and test images (typically 15-30)
- Presentation timings (study: 2-3 seconds per image, recall: unlimited)
- Memory delay intervals (0-30 seconds)

Respond with a JSON object matching this TypeScript interface:
{
  taskType: '${taskType}',
  trialCount: number,
  colors?: string[],
  timings?: { fixationDuration: number, stimulusDuration: number, responseWindow: number },
  stimuli?: any[]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const configText = response.choices[0]?.message?.content;
      if (!configText) {
        throw new Error('No response from OpenAI');
      }

      let config = JSON.parse(configText) as ExperimentConfig;

      // Generate AI images for image recall tasks
      if (taskType === 'image_recall') {
        // Use provided imageCount, or fallback to config.trialCount, or default to 4
        const finalImageCount = imageCount || config.trialCount || 4;
        console.log(`Generating ${finalImageCount} AI images for image recall task...`);
        const aiImages = await this.generateImages(finalImageCount, 'mixed', 'photographic');
        
        if (aiImages.length > 0) {
          config.images = aiImages;
          config.trialCount = aiImages.length; // Set trial count to actual generated images
          console.log(`Successfully generated ${aiImages.length} AI images`);
        } else {
          console.warn('Failed to generate AI images, using fallback images');
          config.images = this.getFallbackImages(finalImageCount);
          config.trialCount = finalImageCount;
        }
      }

      return config;
    } catch (error) {
      console.error('Designer Agent error:', error);
      return this.getFallbackConfig(taskType);
    }
  }

  private getFallbackConfig(taskType: 'stroop' | 'image_recall'): ExperimentConfig {
    if (taskType === 'stroop') {
      return {
        taskType: 'stroop',
        trialCount: 80,
        colors: ['red', 'blue', 'green', 'yellow'],
        timings: {
          fixationDuration: 500,
          stimulusDuration: 0,
          responseWindow: 3000
        }
      };
    } else {
      return {
        taskType: 'image_recall',
        trialCount: 40,
        timings: {
          fixationDuration: 500,
          stimulusDuration: 2000,
          responseWindow: 5000
        }
      };
    }
  }

  async generateConsentForm(studyTitle: string, taskType: string, estimatedDuration: number): Promise<string> {
    if (!isOpenAIConfigured()) {
      return this.getFallbackConsentForm(studyTitle, taskType, estimatedDuration);
    }

    const prompt = `Generate a professional informed consent form for a psychology experiment titled "${studyTitle}".

Task type: ${taskType}
Estimated duration: ${estimatedDuration} minutes

Include:
- Purpose of the study
- What participants will do
- Time commitment
- Risks and benefits
- Confidentiality statement
- Right to withdraw
- Contact information placeholder
- Consent checkbox language

Keep it clear, concise, and IRB-compliant. Use professional academic language but ensure readability.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      return response.choices[0]?.message?.content || this.getFallbackConsentForm(studyTitle, taskType, estimatedDuration);
    } catch (error) {
      console.error('Consent form generation error:', error);
      return this.getFallbackConsentForm(studyTitle, taskType, estimatedDuration);
    }
  }

  private getFallbackConsentForm(studyTitle: string, taskType: string, estimatedDuration: number): string {
    return `# Informed Consent for Research Participation

## Study Title: ${studyTitle}

You are being invited to participate in a research study investigating cognitive processes. This study is conducted to better understand human psychology and behavior.

### What will happen during the study?
You will complete computer-based ${taskType} tasks and questionnaires. The study takes approximately ${estimatedDuration} minutes to complete. You will respond to various stimuli and answer questions about your demographic background.

### Risks and Benefits
There are no known risks associated with this study beyond those encountered in daily life. Your participation will contribute to our understanding of cognitive processes and may help advance psychological research.

### Confidentiality
All data collected will be anonymous and confidential. No personal identifying information will be stored with your responses. Data will be used solely for research purposes.

### Voluntary Participation
Your participation is completely voluntary. You may withdraw from the study at any time without penalty.

Contact: [Research Team Contact Information]`;
  }

  async generateDebriefText(studyTitle: string, taskType: string, findings?: string): Promise<string> {
    if (!isOpenAIConfigured()) {
      return this.getFallbackDebriefText(studyTitle, taskType, findings);
    }

    const prompt = `Generate a professional debrief message for a psychology experiment titled "${studyTitle}".

Task type: ${taskType}
${findings ? `Key findings to explain: ${findings}` : ''}

Include:
- Thank you message
- Explanation of the experiment's purpose
- What the task was designed to measure
- General findings (if provided)
- Why this research is important
- Resources for further reading
- Contact information placeholder

Keep it educational and engaging while maintaining scientific accuracy.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || this.getFallbackDebriefText(studyTitle, taskType, findings);
    } catch (error) {
      console.error('Debrief generation error:', error);
      return this.getFallbackDebriefText(studyTitle, taskType, findings);
    }
  }

  private getFallbackDebriefText(studyTitle: string, taskType: string, findings?: string): string {
    return `# Thank You for Participating!

## Study: ${studyTitle}

Thank you for completing our ${taskType} experiment. Your participation is valuable for psychological research.

### What was this study about?
This experiment was designed to measure cognitive processes related to attention and response control. The ${taskType} task helps us understand how the brain processes conflicting information.

### Why is this research important?
Studies like this contribute to our understanding of cognitive psychology and can inform educational practices, clinical interventions, and our general knowledge of human behavior.

${findings ? `### Key Findings: ${findings}` : ''}

### Contact Information
If you have questions about this research, please contact: [Researcher Contact Information]

Thank you again for your contribution to psychological science!`;
  }

  async generateImages(count: number, category: 'objects' | 'animals' | 'scenes' | 'mixed' = 'mixed', style: string = 'photographic'): Promise<{
    id: string;
    name: string;
    category: string;
    url: string;
  }[]> {
    if (!openai) {
      return this.getFallbackImages(count);
    }

    const prompts = this.generateImagePrompts(count, category, style);
    const results = [];

    try {
      // Generate images in parallel for faster processing
      const imagePromises = prompts.map(async (prompt, i) => {
        try {
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt.description,
            size: "1024x1024",
            quality: "standard",
            n: 1,
          });

          if (response.data && response.data[0]) {
            return {
              id: `ai_img_${i + 1}`,
              name: prompt.name,
              category: prompt.category,
              url: response.data[0].url!
            };
          } else {
            // Return fallback image if generation fails
            return {
              id: `fallback_img_${i + 1}`,
              name: prompt.name,
              category: prompt.category,
              url: this.getFallbackImageUrl(prompt.name)
            };
          }
        } catch (error) {
          console.error(`Image generation failed for prompt ${i + 1}:`, error);
          // Return fallback image
          return {
            id: `fallback_img_${i + 1}`,
            name: prompt.name,
            category: prompt.category,
            url: this.getFallbackImageUrl(prompt.name)
          };
        }
      });

      // Wait for all images to be generated in parallel
      const generatedImages = await Promise.all(imagePromises);
      results.push(...generatedImages);

      return results;
    } catch (error) {
      console.error('Batch image generation error:', error);
      return this.getFallbackImages(count);
    }
  }

  private generateImagePrompts(count: number, category: 'objects' | 'animals' | 'scenes' | 'mixed', style: string): {
    name: string;
    category: string;
    description: string;
  }[] {
    const basePrompts = {
      objects: [
        { name: "Chair", category: "Furniture" },
        { name: "Apple", category: "Fruit" },
        { name: "Book", category: "Object" },
        { name: "Clock", category: "Object" },
        { name: "Lamp", category: "Furniture" },
        { name: "Phone", category: "Technology" },
        { name: "Guitar", category: "Instrument" },
        { name: "Shoes", category: "Clothing" },
        { name: "Key", category: "Object" },
        { name: "Coffee Cup", category: "Object" },
      ],
      animals: [
        { name: "Dog", category: "Animal" },
        { name: "Cat", category: "Animal" },
        { name: "Bird", category: "Animal" },
        { name: "Fish", category: "Animal" },
        { name: "Rabbit", category: "Animal" },
        { name: "Horse", category: "Animal" },
        { name: "Butterfly", category: "Animal" },
        { name: "Elephant", category: "Animal" },
        { name: "Lion", category: "Animal" },
        { name: "Owl", category: "Animal" },
      ],
      scenes: [
        { name: "Mountain", category: "Landscape" },
        { name: "Beach", category: "Landscape" },
        { name: "Forest", category: "Nature" },
        { name: "City", category: "Urban" },
        { name: "Garden", category: "Nature" },
        { name: "Kitchen", category: "Interior" },
        { name: "Library", category: "Interior" },
        { name: "Park", category: "Outdoor" },
        { name: "Bridge", category: "Architecture" },
        { name: "Sunset", category: "Nature" },
      ]
    };

    let selectedPrompts: { name: string; category: string; }[] = [];
    
    if (category === 'mixed') {
      const allPrompts = [...basePrompts.objects, ...basePrompts.animals, ...basePrompts.scenes];
      selectedPrompts = allPrompts.sort(() => Math.random() - 0.5).slice(0, count);
    } else {
      selectedPrompts = basePrompts[category].slice(0, count);
    }

    return selectedPrompts.map(prompt => ({
      ...prompt,
      description: `A high-quality ${style} image of a ${prompt.name.toLowerCase()}, clean background, well-lit, suitable for psychology experiment, professional appearance, centered composition`
    }));
  }

  private getFallbackImages(count: number): {
    id: string;
    name: string;
    category: string;
    url: string;
  }[] {
    const fallbackImages = [
      { name: "Apple", category: "Fruit", url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop" },
      { name: "Car", category: "Vehicle", url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&h=300&fit=crop" },
      { name: "Book", category: "Object", url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop" },
      { name: "Tree", category: "Nature", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop" },
      { name: "House", category: "Building", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=300&fit=crop" },
      { name: "Cat", category: "Animal", url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=300&fit=crop" },
      { name: "Chair", category: "Furniture", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop" },
      { name: "Mountain", category: "Landscape", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop" },
      { name: "Phone", category: "Technology", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop" },
      { name: "Flower", category: "Nature", url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop" },
    ];

    return fallbackImages.slice(0, count).map((img, index) => ({
      id: `fallback_${index + 1}`,
      ...img
    }));
  }

  private getFallbackImageUrl(name: string): string {
    // Generate a simple colored placeholder if needed
    return `https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=${encodeURIComponent(name)}`;
  }

  async generateSurveyQuestions(
    surveyType: 'multiple_choice' | 'likert' | 'open_ended' | 'mixed', 
    topic: string, 
    questionCount: number = 5,
    customRequirements?: string
  ): Promise<{
    id: string;
    type: 'multiple_choice' | 'likert' | 'open_ended';
    question: string;
    options?: string[];
    scale?: { min: number; max: number; labels: string[] };
  }[]> {
    if (!openai) {
      return this.getFallbackSurveyQuestions(surveyType, questionCount);
    }

    const prompt = `You are a psychology research expert. Generate ${questionCount} high-quality ${surveyType} survey questions about: ${topic}

${customRequirements ? `Additional requirements: ${customRequirements}` : ''}

Guidelines:
- Questions should be scientifically valid and unbiased
- Use clear, concise language appropriate for research participants
- Avoid leading or loaded questions
- For multiple choice: provide 4-5 balanced options
- For Likert scales: use 1-7 scale with appropriate labels
- For open-ended: ask questions that encourage thoughtful responses

${surveyType === 'multiple_choice' ? `
For multiple choice questions, provide:
- Clear, unambiguous question text
- 4-5 response options that are mutually exclusive and exhaustive
- Include "Other" or "Prefer not to answer" when appropriate
` : ''}

${surveyType === 'likert' ? `
For Likert scale questions, provide:
- Statements for agreement/disagreement rating
- Use 7-point scale (1 = Strongly Disagree, 7 = Strongly Agree)
- Include neutral midpoint option
` : ''}

${surveyType === 'open_ended' ? `
For open-ended questions:
- Ask questions that encourage detailed, thoughtful responses
- Avoid yes/no questions
- Use "How", "Why", "What", "Describe" prompts
` : ''}

Respond with a JSON array of question objects. Each object should have:
{
  "id": "q1", 
  "type": "multiple_choice" | "likert" | "open_ended",
  "question": "Question text",
  "options": ["Option 1", "Option 2"] // for multiple choice only
  "scale": {"min": 1, "max": 7, "labels": ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]} // for likert only
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const questionsText = response.choices[0]?.message?.content;
      if (!questionsText) {
        throw new Error('No response from OpenAI');
      }

      const questions = JSON.parse(questionsText);
      return Array.isArray(questions) ? questions : [questions];
    } catch (error) {
      console.error('Survey generation error:', error);
      return this.getFallbackSurveyQuestions(surveyType, questionCount);
    }
  }

  private getFallbackSurveyQuestions(
    surveyType: 'multiple_choice' | 'likert' | 'open_ended' | 'mixed',
    questionCount: number
  ) {
    const fallbackQuestions = {
      multiple_choice: [
        {
          id: "q1",
          type: "multiple_choice" as const,
          question: "What is your current level of education?",
          options: ["High School", "Bachelor's Degree", "Master's Degree", "Doctoral Degree", "Other"]
        },
        {
          id: "q2", 
          type: "multiple_choice" as const,
          question: "How often do you use technology for learning?",
          options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
        }
      ],
      likert: [
        {
          id: "q1",
          type: "likert" as const,
          question: "I enjoy participating in research studies",
          scale: {
            min: 1,
            max: 7,
            labels: ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]
          }
        },
        {
          id: "q2",
          type: "likert" as const,
          question: "I find psychological experiments interesting",
          scale: {
            min: 1,
            max: 7,
            labels: ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]
          }
        }
      ],
      open_ended: [
        {
          id: "q1",
          type: "open_ended" as const,
          question: "What factors influence your decision to participate in research studies?"
        },
        {
          id: "q2",
          type: "open_ended" as const,
          question: "Describe your experience with psychological experiments."
        }
      ]
    };

    const questions = surveyType === 'mixed' 
      ? [...fallbackQuestions.multiple_choice.slice(0, 1), ...fallbackQuestions.likert.slice(0, 1), ...fallbackQuestions.open_ended.slice(0, 1)]
      : fallbackQuestions[surveyType] || [];

    return questions.slice(0, questionCount);
  }
}

export class RunnerAgent {
  async assessDataQuality(responses: any[], deviceInfo?: any): Promise<{
    quality: 'excellent' | 'good' | 'poor' | 'invalid';
    warnings: string[];
    suggestions: string[];
  }> {
    if (responses.length === 0) {
      return {
        quality: 'invalid',
        warnings: ['No responses recorded'],
        suggestions: ['Ensure participant completed at least some trials']
      };
    }

    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check response times
    const responseTimes = responses
      .filter(r => r.responseTime && r.responseTime > 0)
      .map(r => r.responseTime);

    if (responseTimes.length === 0) {
      warnings.push('No valid response times recorded');
    } else {
      const meanRT = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const fastResponses = responseTimes.filter(rt => rt < 200).length;
      const slowResponses = responseTimes.filter(rt => rt > 5000).length;

      if (meanRT < 300) {
        warnings.push('Very fast average response time - possible rushed responses');
        suggestions.push('Consider excluding participants with mean RT < 300ms');
      }

      if (fastResponses / responseTimes.length > 0.2) {
        warnings.push(`${Math.round(fastResponses / responseTimes.length * 100)}% of responses were very fast (<200ms)`);
      }

      if (slowResponses / responseTimes.length > 0.1) {
        warnings.push(`${Math.round(slowResponses / responseTimes.length * 100)}% of responses were very slow (>5s)`);
      }
    }

    // Check completion rate
    const completionRate = responses.length / (responses[0]?.totalTrials || responses.length);
    if (completionRate < 0.8) {
      warnings.push(`Low completion rate: ${Math.round(completionRate * 100)}%`);
    }

    // Determine overall quality
    let quality: 'excellent' | 'good' | 'poor' | 'invalid' = 'excellent';
    if (warnings.length === 0) {
      quality = 'excellent';
    } else if (warnings.length <= 2 && !warnings.some(w => w.includes('rushed') || w.includes('invalid'))) {
      quality = 'good';
    } else if (warnings.length <= 4) {
      quality = 'poor';
    } else {
      quality = 'invalid';
    }

    return { quality, warnings, suggestions };
  }

  async generateRealTimeWarnings(currentTrial: number, recentResponses: any[]): Promise<string[]> {
    const warnings: string[] = [];

    if (recentResponses.length < 5) return warnings;

    const recentRTs = recentResponses.slice(-5).map(r => r.responseTime).filter(rt => rt > 0);
    
    if (recentRTs.length > 0) {
      const meanRecentRT = recentRTs.reduce((a, b) => a + b, 0) / recentRTs.length;
      
      if (meanRecentRT < 250) {
        warnings.push('Participant may be responding too quickly');
      }
      
      if (meanRecentRT > 4000) {
        warnings.push('Participant may be taking too long to respond');
      }
    }

    return warnings;
  }
}

export class AnalystAgent {
  async analyzeExperimentData(data: ExperimentData): Promise<AnalysisResult> {
    const responses = data.responses.filter(r => r.responseTime && r.responseTime > 0);
    
    if (responses.length === 0) {
      return {
        meanResponseTime: 0,
        accuracy: 0,
        outlierCount: 0,
        qualityScore: 0,
        insights: ['No valid responses to analyze'],
        recommendations: ['Collect more data']
      };
    }

    // Basic statistics
    const responseTimes = responses.map(r => r.responseTime);
    const meanResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    const accurateResponses = responses.filter(r => r.accuracy === true);
    const accuracy = accurateResponses.length / responses.length;

    // Remove outliers (3 SD rule)
    const rtMean = meanResponseTime;
    const rtStd = Math.sqrt(responseTimes.reduce((acc, rt) => acc + Math.pow(rt - rtMean, 2), 0) / responseTimes.length);
    const outlierThreshold = 3 * rtStd;
    const outliers = responseTimes.filter(rt => Math.abs(rt - rtMean) > outlierThreshold);
    const outlierCount = outliers.length;

    // Stroop effect calculation
    let stroopEffect: number | undefined;
    const congruentRTs = responses.filter(r => r.stimulus?.congruent === true).map(r => r.responseTime);
    const incongruentRTs = responses.filter(r => r.stimulus?.congruent === false).map(r => r.responseTime);
    
    if (congruentRTs.length > 0 && incongruentRTs.length > 0) {
      const meanCongruent = congruentRTs.reduce((a, b) => a + b, 0) / congruentRTs.length;
      const meanIncongruent = incongruentRTs.reduce((a, b) => a + b, 0) / incongruentRTs.length;
      stroopEffect = meanIncongruent - meanCongruent;
    }

    // Quality score (0-100)
    let qualityScore = 100;
    if (accuracy < 0.7) qualityScore -= 30;
    if (meanResponseTime < 300 || meanResponseTime > 2000) qualityScore -= 20;
    if (outlierCount / responses.length > 0.1) qualityScore -= 20;
    if (responses.length < 20) qualityScore -= 30;

    const insights = await this.generateInsights({
      meanResponseTime,
      accuracy,
      stroopEffect,
      outlierCount,
      totalResponses: responses.length
    });

    const recommendations = await this.generateRecommendations({
      accuracy,
      meanResponseTime,
      qualityScore,
      outlierCount
    });

    return {
      meanResponseTime: Math.round(meanResponseTime),
      accuracy: Math.round(accuracy * 100) / 100,
      stroopEffect: stroopEffect ? Math.round(stroopEffect) : undefined,
      outlierCount,
      qualityScore: Math.max(0, qualityScore),
      insights,
      recommendations
    };
  }

  private async generateInsights(stats: any): Promise<string[]> {
    const prompt = `Analyze these psychology experiment results and provide 2-3 key insights:

Mean Response Time: ${stats.meanResponseTime}ms
Accuracy: ${Math.round(stats.accuracy * 100)}%
Stroop Effect: ${stats.stroopEffect ? stats.stroopEffect + 'ms' : 'N/A'}
Outliers: ${stats.outlierCount}/${stats.totalResponses} trials
Sample Size: ${stats.totalResponses} trials

Provide insights that would be valuable for researchers, focusing on:
- Performance patterns
- Data quality indicators  
- Comparison to typical findings
- Statistical significance considerations

Return as a JSON array of strings.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content) as string[];
      }
    } catch (error) {
      console.error('Insight generation error:', error);
    }

    // Fallback insights
    const insights = [];
    if (stats.accuracy > 0.9) {
      insights.push('High accuracy suggests good task engagement');
    } else if (stats.accuracy < 0.7) {
      insights.push('Low accuracy may indicate task difficulty or inattention');
    }
    
    if (stats.stroopEffect && stats.stroopEffect > 50) {
      insights.push('Strong Stroop effect observed, consistent with cognitive interference theory');
    }
    
    return insights;
  }

  private async generateRecommendations(stats: any): Promise<string[]> {
    const recommendations = [];
    
    if (stats.accuracy < 0.8) {
      recommendations.push('Consider excluding participants with accuracy < 80%');
    }
    
    if (stats.meanResponseTime < 300) {
      recommendations.push('Screen for participants responding too quickly (< 300ms)');
    }
    
    if (stats.qualityScore < 70) {
      recommendations.push('Data quality concerns - consider collecting additional participants');
    }
    
    if (stats.outlierCount > stats.totalResponses * 0.1) {
      recommendations.push('High outlier rate - consider stricter exclusion criteria');
    }

    return recommendations.length > 0 ? recommendations : ['Data quality appears acceptable'];
  }

  async generateExportData(data: ExperimentData, analysis: AnalysisResult): Promise<any[]> {
    return data.responses.map((response, index) => ({
      trial: index + 1,
      participant_id: data.participantId,
      study_id: data.studyId,
      response_time: response.responseTime,
      accuracy: response.accuracy ? 1 : 0,
      stimulus: JSON.stringify(response.stimulus),
      response: JSON.stringify(response.response),
      timestamp: response.timestamp,
      is_outlier: analysis.meanResponseTime ? 
        Math.abs(response.responseTime - analysis.meanResponseTime) > (analysis.meanResponseTime * 0.5) ? 1 : 0 : 0
    }));
  }
}

// Export singleton instances
export const designerAgent = new DesignerAgent();
export const runnerAgent = new RunnerAgent();
export const analystAgent = new AnalystAgent();