
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { WritingFeedback, SpeakingFeedback, ReadingFeedback, TaskType, Submission, PredictionResult, GroundingLink } from "../types";

/**
 * Custom Error for AI Parsing Issues
 */
class AIResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIResponseError";
  }
}

// Fixed: evaluateReadingTest implementation
export const evaluateReadingTest = async (passage: string, studentAnswers: any[], correctAnswers: any[]): Promise<ReadingFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this IELTS Reading performance.
      
      Passage: """${passage}"""
      Student Performance: ${JSON.stringify(studentAnswers)}
      Correct Answers: ${JSON.stringify(correctAnswers)}
      
      Return JSON with this structure:
      {
        "score": number,
        "total": number,
        "bandScore": number,
        "skillAnalysis": { "skimming": number, "scanning": number, "detailedUnderstanding": number },
        "answers": [{
          "questionId": string,
          "isCorrect": boolean,
          "studentAnswer": string,
          "correctAnswer": string,
          "logic": string
        }],
        "vocabulary": [{"word": string, "explanation": string}]
      }
      
      INSTRUCTION: Logic should explain WHY the answer is correct based on the passage, citing specific phrases.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (!response.text) throw new AIResponseError("Empty AI response");
    return JSON.parse(response.text) as ReadingFeedback;
  } catch (e) {
    console.error("Reading evaluation failed:", e);
    throw e;
  }
};

// Fixed: getLiveSuggestions implementation
export const getLiveSuggestions = async (essay: string, taskQuestion: string): Promise<string[]> => {
  if (essay.length < 50) return [];
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an IELTS Writing tutor. Review this draft-in-progress and provide 3 SHORT (max 10 words) tactical suggestions to improve it right now.
      
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

/**
 * Fetches relevant study resources using Google Search grounding
 */
// Fixed: Added missing getTaskResources function
export const getTaskResources = async (question: string): Promise<GroundingLink[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find high-quality IELTS study resources (articles, model answers, or tips) specifically for this task question: "${question}". Return helpful links for learning.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }
    return links;
  } catch (e) {
    console.error("Resource fetch failed:", e);
    return [];
  }
};

// Fixed: evaluateWriting implementation with Search Grounding
export const evaluateWriting = async (essay: string, taskType: TaskType): Promise<WritingFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isTask1 = taskType.includes('TASK_1');
  const taskDescriptor = isTask1 ? "Academic Writing Task 1 (Data Description)" : "Writing Task 2 (Opinion Essay)";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Evaluate this IELTS ${taskDescriptor}. Use Google Search to cross-reference band 8+ standards for "${essay.substring(0, 40)}".
      
      Return JSON with this structure:
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
          "taskIdentification": { "type": string, "dataType": string, "trends": string },
          "sampleAnswer": string,
          "scoreExplanation": { "ta": string, "cc": string, "lr": string, "gra": string },
          "keyVocabulary": [{"word": string, "explanation": string}],
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

    if (!response.text) throw new AIResponseError("AI failed to generate evaluation.");
    const feedback = JSON.parse(response.text) as WritingFeedback;

    // Enhanced link extraction from grounding chunks
    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    feedback.groundingLinks = links;
    return feedback;
  } catch (e) {
    console.error("Writing evaluation error:", e);
    throw e;
  }
};

// Fixed: evaluateSpeaking implementation for multimodal audio input
export const evaluateSpeaking = async (audioBase64: string, taskInfo: string, part: number): Promise<SpeakingFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'audio/webm', data: audioBase64 } },
            { text: `Examiner Mode: Evaluate Part ${part}. Task: ${taskInfo}. Return JSON assessment.` }
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

    if (!response.text) throw new AIResponseError("Speech analysis failed.");
    return JSON.parse(response.text) as SpeakingFeedback;
  } catch (e) {
    console.error("Speaking evaluation error:", e);
    throw e;
  }
};

// Fixed: getTimelinePrediction implementation
export const getTimelinePrediction = async (history: Submission[], targetBand: number): Promise<PredictionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historyData = history.slice(0, 10).map(s => ({
    type: s.type,
    overall: (s.feedback as any).overall || (s.feedback as any).bandScore,
    date: s.createdAt
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `History: ${JSON.stringify(historyData)}. Predict timeline for Band ${targetBand}. JSON format.`,
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
  } catch (e) {
    return {
      estimatedSessions: 12,
      estimatedHours: 24,
      bottleneck: "Consistent practice data needed.",
      strategy: ["Complete more daily tasks"],
      projectedDate: "TBD",
      confidenceScore: 50
    };
  }
};
