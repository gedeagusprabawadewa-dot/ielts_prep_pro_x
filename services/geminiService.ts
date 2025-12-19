
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

export const getMindsetAdvice = async (userConcern: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userConcern,
      config: {
        systemInstruction: `You are an IELTS performance coach and learning psychologist. Your role is to guide IELTS candidates to improve technically, psychologically, and mentally, helping them become calm, focused, and confident learners.
        
        When a user asks for IELTS preparation advice, generate a response that includes:
        1. Technical Strategy (How to Score Better): Explain 2–3 practical IELTS strategies, focus on examiner expectations, avoid academic jargon, use simple, reassuring language.
        2. Psychological Guidance (Reducing Nervousness): Normalize anxiety, explain how stress affects performance, provide reframing techniques, emphasize control over perfection.
        3. Mindfulness Practice (1–2 Minutes): Simple breathing or grounding exercise with clear step-by-step instructions.
        4. Awareness Tips (During the Test): What to do after a mistake, how to refocus attention, how to stay present with the current task.
        5. Growth Mindset Reminder: Short motivational insight grounded in learning science, emphasize progress over scores, encourage consistency.
        
        TONE & STYLE: Calm, supportive, and realistic. No pressure language. No emojis. Short paragraphs. British English. Suitable for Band 5–8 learners.`,
      }
    });
    return response.text || "Breathe. Stay focused on the present task. You are making progress.";
  } catch (e) {
    return "Focus on your breath for one minute. One mistake does not define your band score. You are capable of handling the next question.";
  }
};

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
        "answers": [{ "questionId": string, "isCorrect": boolean, "studentAnswer": string, "correctAnswer": string, "logic": string }],
        "vocabulary": [{"word": string, "explanation": string}]
      }`,
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || '{}');
  } catch (e) { throw e; }
};

export const getLiveSuggestions = async (essay: string, taskQuestion: string): Promise<string[]> => {
  if (essay.length < 50) return [];
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft-in-progress tactical suggestions (max 10 words). Task: ${taskQuestion}. Essay: ${essay}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) { return []; }
};

export const getTaskResources = async (question: string): Promise<GroundingLink[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `High-quality IELTS resources for: "${question}".`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) chunks.forEach((chunk: any) => { if (chunk.web) links.push({ title: chunk.web.title, uri: chunk.web.uri }); });
    return links;
  } catch (e) { return []; }
};

export const evaluateWriting = async (essay: string, taskType: TaskType): Promise<WritingFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Evaluate IELTS Writing. Essay: """${essay}"""`,
      config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" },
    });
    const feedback = JSON.parse(response.text || '{}');
    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) chunks.forEach((chunk: any) => { if (chunk.web) links.push({ title: chunk.web.title, uri: chunk.web.uri }); });
    feedback.groundingLinks = links;
    return feedback;
  } catch (e) { throw e; }
};

export const evaluateSpeaking = async (audioBase64: string, taskInfo: string, part: number): Promise<SpeakingFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: [{ parts: [{ inlineData: { mimeType: 'audio/webm', data: audioBase64 } }, { text: `Evaluate Speaking Part ${part}. Task: ${taskInfo}` }] }],
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || '{}');
  } catch (e) { throw e; }
};

export const getTimelinePrediction = async (history: Submission[], targetBand: number): Promise<PredictionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Predict IELTS timeline. History: ${JSON.stringify(history)}. Target: ${targetBand}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) { return { estimatedSessions: 12, estimatedHours: 24, bottleneck: "Consistency", strategy: [], projectedDate: "TBD", confidenceScore: 50 }; }
};
