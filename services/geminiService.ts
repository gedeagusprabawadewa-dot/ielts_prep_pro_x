
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { WritingFeedback, SpeakingFeedback, TaskType, Submission, PredictionResult } from "../types";

export const evaluateWriting = async (essay: string, taskType: TaskType): Promise<WritingFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (taskType === TaskType.WRITING_TASK_2) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an IELTS examiner. Evaluate the following IELTS Writing Task 2 essay. 
      Score each criterion from 0 to 9. Return JSON ONLY.
      
      Essay:
      """${essay}"""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task_response: { type: Type.NUMBER },
            coherence: { type: Type.NUMBER },
            lexical: { type: Type.NUMBER },
            grammar: { type: Type.NUMBER },
            overall: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["task_response", "coherence", "lexical", "grammar", "overall", "strengths", "weaknesses", "improvements"]
        },
      },
    });
    return JSON.parse(response.text || '{}') as WritingFeedback;
  } else {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an IELTS examiner and writing coach. Evaluate this IELTS Writing Task 1 response.
      
      Return JSON ONLY with this exact structure:
      {
        "task_response": number,
        "coherence": number,
        "lexical": number,
        "grammar": number,
        "overall": number,
        "strengths": [string],
        "weaknesses": [string],
        "improvements": [string],
        "learningModule": {
          "taskIdentification": { "type": string, "trends": string },
          "sampleAnswer": string,
          "scoreExplanation": { "ta": string, "cc": string, "lr": string, "gra": string },
          "improvementGuide": {
            "language": [{"word": string, "explanation": string}],
            "commonMistakes": [string],
            "tips": [string]
          },
          "bandUpgrades": [{"low": string, "high": string, "explanation": string}],
          "examinerNotes": [string],
          "practiceTask": string
        }
      }

      Student Submission:
      """${essay}"""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task_response: { type: Type.NUMBER },
            coherence: { type: Type.NUMBER },
            lexical: { type: Type.NUMBER },
            grammar: { type: Type.NUMBER },
            overall: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            learningModule: {
              type: Type.OBJECT,
              properties: {
                taskIdentification: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    trends: { type: Type.STRING }
                  },
                  required: ["type", "trends"]
                },
                sampleAnswer: { type: Type.STRING },
                scoreExplanation: {
                  type: Type.OBJECT,
                  properties: {
                    ta: { type: Type.STRING },
                    cc: { type: Type.STRING },
                    lr: { type: Type.STRING },
                    gra: { type: Type.STRING }
                  },
                  required: ["ta", "cc", "lr", "gra"]
                },
                improvementGuide: {
                  type: Type.OBJECT,
                  properties: {
                    language: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          word: { type: Type.STRING },
                          explanation: { type: Type.STRING }
                        },
                        required: ["word", "explanation"]
                      }
                    },
                    commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["language", "commonMistakes", "tips"]
                },
                bandUpgrades: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      low: { type: Type.STRING },
                      high: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ["low", "high", "explanation"]
                  }
                },
                examinerNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                practiceTask: { type: Type.STRING }
              },
              required: ["taskIdentification", "sampleAnswer", "scoreExplanation", "improvementGuide", "bandUpgrades", "examinerNotes", "practiceTask"]
            }
          },
          required: ["task_response", "coherence", "lexical", "grammar", "overall", "strengths", "weaknesses", "improvements", "learningModule"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as WritingFeedback;
  }
};

export const evaluateSpeaking = async (audioBase64: string): Promise<SpeakingFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: audioBase64
            }
          },
          {
            text: `You are an IELTS speaking examiner. Evaluate this speaking response for Part 1. 
            Provide a full transcription and assess fluency, lexical resource, grammatical range, and pronunciation (estimate).
            Return JSON ONLY.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fluency: { type: Type.NUMBER },
          lexical: { type: Type.NUMBER },
          grammar: { type: Type.NUMBER },
          pronunciation: { type: Type.NUMBER },
          overall: { type: Type.NUMBER },
          feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
          transcript: { type: Type.STRING },
        },
        required: ["fluency", "lexical", "grammar", "pronunciation", "overall", "feedback", "transcript"]
      },
    },
  });

  return JSON.parse(response.text || '{}') as SpeakingFeedback;
};

export const getTimelinePrediction = async (history: Submission[], targetBand: number): Promise<PredictionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const historyData = history.slice(0, 10).map(s => ({
    type: s.type,
    overall: (s.feedback as any).overall,
    date: s.createdAt
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an IELTS study consultant. Analyze the student's history and predict the time needed to reach a Band ${targetBand}.
    
    Current History: ${JSON.stringify(historyData)}
    Target: Band ${targetBand}
    
    Consider:
    1. Moving from 6 to 7 is much harder than 5 to 6.
    2. Estimated practice hours needed per 0.5 band increase (standard is approx 200 hours, but variable).
    3. The student's current frequency of practice.
    
    Return JSON ONLY.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          estimatedSessions: { type: Type.NUMBER, description: "Number of full practice sessions needed" },
          estimatedHours: { type: Type.NUMBER, description: "Total focused study hours needed" },
          bottleneck: { type: Type.STRING, description: "Main area slowing down progress" },
          strategy: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable steps" },
          projectedDate: { type: Type.STRING, description: "Estimated completion date (e.g., '3 months' or 'Oct 2025')" },
          confidenceScore: { type: Type.NUMBER, description: "AI confidence in this prediction 0-100" }
        },
        required: ["estimatedSessions", "estimatedHours", "bottleneck", "strategy", "projectedDate", "confidenceScore"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as PredictionResult;
};
