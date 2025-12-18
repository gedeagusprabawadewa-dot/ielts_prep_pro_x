
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { WritingFeedback, SpeakingFeedback, TaskType, Submission, PredictionResult, GroundingLink } from "../types";

export const getLiveSuggestions = async (essay: string, taskQuestion: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an IELTS Writing tutor. Review this draft-in-progress and provide 3-4 VERY SHORT (max 10 words each) tactical suggestions to improve it right now. Focus on vocabulary upgrades or structural transitions.
      
      Task Question: ${taskQuestion}
      Current Draft: ${essay}
      
      Return JSON array of strings ONLY.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export const evaluateWriting = async (essay: string, taskType: TaskType): Promise<WritingFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isTask1 = taskType.includes('TASK_1');
  const taskDescriptor = isTask1 ? "Academic Writing Task 1 (Data Description)" : "Writing Task 2 (Opinion Essay)";

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Evaluate the following IELTS ${taskDescriptor}. 
    
    INSTRUCTION: Use Google Search to find high-band (Band 8+) structural templates and academic vocabulary specifically from top-tier resources like "IELTS-Mentor" or "British Council" for this exact topic: "${essay.substring(0, 50)}...". 
    
    In your JSON response, ensure the "improvements" and "learningModule" sections reflect specific academic collocations used in professional IELTS reports.
    
    Return JSON ONLY with this structure:
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
    
    Submission:
    """${essay}"""`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    },
  });

  const feedback = JSON.parse(response.text || '{}') as WritingFeedback;

  const links: GroundingLink[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        links.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });
  }

  feedback.groundingLinks = links;
  return feedback;
};

export const getTaskResources = async (taskQuestion: string): Promise<GroundingLink[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Find high-quality IELTS Writing Task 1 model answers and structural guides for this specific question from the web: "${taskQuestion}". 
    Focus on sites like ielts-mentor.com, ieltsliz.com, and britishcouncil.org.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const links: GroundingLink[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        links.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });
  }
  return links;
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
    Return JSON ONLY.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          estimatedSessions: { type: Type.NUMBER },
          estimatedHours: { type: Type.NUMBER },
          bottleneck: { type: Type.STRING },
          strategy: { type: Type.ARRAY, items: { type: Type.STRING } },
          projectedDate: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER }
        },
        required: ["estimatedSessions", "estimatedHours", "bottleneck", "strategy", "projectedDate", "confidenceScore"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as PredictionResult;
};
