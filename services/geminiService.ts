
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { WritingFeedback, SpeakingFeedback, ReadingFeedback, TaskType, Submission, PredictionResult, GroundingLink, ReadingTask } from "../types";

export const explainMistakeIndonesian = async (mistake: string, context: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain this English mistake to an Indonesian beginner (A1-A2). 
      Mistake: "${mistake}" 
      Context: "${context}"
      
      Response requirements:
      - Use simple Bahasa Indonesia.
      - Explain the "Why" (Grammar rule).
      - Provide 1-2 more examples.
      - Tone: Encouraging teacher.`,
    });
    return response.text || "Terjadi kesalahan. Coba lagi.";
  } catch (e) {
    return "Maaf, saya tidak bisa menjelaskan saat ini.";
  }
};

export const checkPronunciation = async (audioBase64: string, targetText: string): Promise<{ score: 'Clear' | 'Needs practice'; feedback: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: [
        { parts: [{ inlineData: { mimeType: 'audio/webm', data: audioBase64 } }, { text: `Target Text: "${targetText}". Is the pronunciation clear? Answer in JSON format: {"score": "Clear" | "Needs practice", "feedback": "Short feedback"}` }] }
      ],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { score: 'Needs practice', feedback: 'Could not analyze audio.' };
  }
};

export const checkVocabUsage = async (word: string, sentence: string): Promise<{ isCorrect: boolean; feedback: string; suggestion: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate this IELTS Task 1 practice sentence. 
      Target Word: "${word}"
      Student Sentence: "${sentence}"
      
      Requirements:
      1. Is the word used correctly in an academic Task 1 (data description) context?
      2. Is the grammar accurate?
      
      Return JSON:
      {
        "isCorrect": boolean,
        "feedback": "Short, supportive teacher-like feedback (max 20 words)",
        "suggestion": "An improved version of the sentence using the word naturally in a Task 1 context."
      }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { isCorrect: false, feedback: "I couldn't analyze this right now. Try a simpler sentence.", suggestion: "" };
  }
};

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

export const generateReadingTask = async (topic?: string, difficulty?: string): Promise<ReadingTask> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate an original IELTS Academic Reading test.
      Rules:
      - 100% original content.
      - Topic: ${topic || 'random academic topic (science, technology, environment, or history)'}
      - Difficulty: ${difficulty || 'Band 7.0'}
      - Length: 700-900 words.
      - Include 4 questions: mix of mcq, tfng, and gapfill.
      
      Return JSON with this structure:
      {
        "id": "generated_id",
        "title": "Title of the passage",
        "passage": "Full reading passage text",
        "questions": [
          { "id": "q1", "type": "mcq" | "tfng" | "gapfill", "question": "Question text", "options": ["A", "B", "C", "D"], "answer": "The correct answer exactly matching the text" }
        ]
      }`,
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    throw e;
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
      
      Scoring Table (Approximation):
      1/4 = Band 4.0, 2/4 = Band 5.5, 3/4 = Band 7.0, 4/4 = Band 9.0
      
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
      contents: `Evaluate this IELTS Writing submission. 
      Task Type: ${taskType}
      Essay: """${essay}"""
      
      CRITICAL EXAMINER INSTRUCTION:
      1. TASK MISMATCH DETECTION: If the student writes an essay (Task 2 style) for a Task 1 prompt (data description/letter), you MUST award a score of no higher than 3.0 for Task Achievement. Explain clearly that they wrote an essay instead of describing data/writing a letter.
      2. REALISTIC SCORING: Do not be overly generous. Follow the official IELTS Band Descriptors (9.0 scale) strictly.
      3. TEACHER MODE: Explain concepts as if to a beginner, but do not hide the reality of the score.
      
      Return JSON:
      {
        "task_response": number,
        "coherence": number,
        "lexical": number,
        "grammar": number,
        "overall": number,
        "strengths": string[],
        "weaknesses": string[],
        "improvements": string[],
        "inlineHighlights": [
          { "phrase": string, "type": "grammar" | "vocab" | "punctuation" | "style", "explanation": string, "suggestion": string }
        ],
        "learningModule": { 
           "taskIdentification": { "type": string, "dataType": string, "trends": string },
           "sampleAnswer": string,
           "scoreExplanation": { "ta": string, "cc": string, "lr": string, "gra": string },
           "keyVocabulary": [{ "word": string, "explanation": string }],
           "improvementGuide": {
             "language": [{ "word": string, "explanation": string }],
             "commonMistakes": string[],
             "tips": string[]
           },
           "bandUpgrades": [{ "low": string, "high": string, "explanation": string }],
           "examinerNotes": string[],
           "practiceTask": string
        }
      }`,
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
      contents: [{ parts: [{ inlineData: { mimeType: 'audio/webm', data: audioBase64 } }, { text: `Evaluate Speaking Part ${part}. Task: ${taskInfo}. Act as a supportive teacher for a beginner.` }] }],
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
