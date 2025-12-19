
export enum TaskType {
  WRITING_TASK_1_ACADEMIC = 'WRITING_TASK_1_ACADEMIC',
  WRITING_TASK_1_GENERAL = 'WRITING_TASK_1_GENERAL',
  WRITING_TASK_2 = 'WRITING_TASK_2',
  SPEAKING = 'SPEAKING',
  READING_ACADEMIC = 'READING_ACADEMIC',
  ACADEMY_PLACEMENT = 'ACADEMY_PLACEMENT'
}

export type AcademyLevel = 'foundation' | 'bridge' | 'beginner' | 'unassigned';
export type AppTheme = 'light' | 'dark';
export type AccentColor = 'blue' | 'emerald' | 'indigo' | 'rose';
export type AuthMode = 'trial' | 'supabase';

export interface AcademyProgress {
  level: AcademyLevel;
  vocabCount: number;
  completedLessons: string[];
  learnedVocabIds: string[];
  lastPlacementDate?: string;
}

export interface PlacementQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  category: 'grammar' | 'vocab' | 'logic';
}

export interface AcademyVocab {
  id: string;
  word: string;
  meaningId: string; // Indonesian
  example: string;
  category: 'Daily Life' | 'Work' | 'Travel' | 'IELTS Common';
  learned?: boolean;
}

export interface AcademyGrammarLesson {
  id: string;
  title: string;
  explanationId: string; // Indonesian
  wrong: string;
  correct: string;
  quiz: {
    question: string;
    options: string[];
    answer: string;
  };
}

export interface AcademyBridgeLesson {
  id: string;
  title: string;
  type: 'listening' | 'speaking' | 'reading' | 'writing';
  content: string;
  indonesianTranslation?: string;
  audioUrl?: string;
  task: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: 'basics' | 'writing' | 'speaking' | 'reading' | 'listening';
  content: string;
  bullets: string[];
  teacherTip: string;
}

export interface FocusSettings {
  isEnabled: boolean;
  volume: number;
  trackIndex: number;
}

export interface ChartDataItem {
  name: string;
  [key: string]: string | number;
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface InlineHighlight {
  phrase: string;
  type: 'grammar' | 'vocab' | 'punctuation' | 'style';
  explanation: string;
  suggestion: string;
}

export interface ReadingQuestion {
  id: string;
  type: 'mcq' | 'tfng' | 'gapfill';
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface ReadingTask {
  id: string;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

export interface ReadingFeedback {
  score: number;
  total: number;
  bandScore: number;
  skillAnalysis: {
    skimming: number;
    scanning: number;
    detailedUnderstanding: number;
  };
  answers: {
    questionId: string;
    isCorrect: boolean;
    studentAnswer: string;
    correctAnswer: string;
    logic: string;
  }[];
  vocabulary: LanguagePoint[];
}

export interface WritingTask {
  id: string;
  topic: string;
  question: string;
  type: TaskType;
  modelAnswer?: ModelAnswer;
  task1Module?: Task1LearningModule;
  chartConfig?: {
    type: 'bar' | 'line' | 'pie';
    data: ChartDataItem[];
    dataKeys: string[];
    xAxisKey: string;
  };
}

export interface Highlight {
  phrase: string;
  type: 'topic' | 'linking' | 'vocab' | 'grammar';
  note: string;
}

export interface BandUpgrade {
  low: string;
  high: string;
  explanation: string;
}

export interface LanguagePoint {
  word: string;
  explanation: string;
}

export interface Task1LearningModule {
  taskIdentification: {
    type: string;
    dataType: string;
    trends: string;
  };
  sampleAnswer: string;
  scoreExplanation: {
    ta: string;
    cc: string;
    lr: string;
    gra: string;
  };
  keyVocabulary: LanguagePoint[];
  improvementGuide: {
    language: LanguagePoint[];
    commonMistakes: string[];
    tips: string[];
  };
  bandUpgrades: BandUpgrade[];
  examinerNotes: string[];
  practiceTask: string;
}

export interface ModelAnswer {
  text: string;
  overallBand: number;
  explanation: string;
  criteria: {
    taskResponse: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
  };
  strengths: string[];
  commonWeaknesses: string[];
  improvementTips: string[];
  bandUpgrades: BandUpgrade[];
  highlights: Highlight[];
}

export interface WritingFeedback {
  task_response: number;
  coherence: number;
  lexical: number;
  grammar: number;
  overall: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  inlineHighlights?: InlineHighlight[];
  learningModule?: Task1LearningModule;
  groundingLinks?: GroundingLink[];
}

export interface SpeakingFeedback {
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation: number;
  overall: number;
  feedback: string[];
  transcript: string;
}

export interface SpeakingCueCard {
  id: string;
  topic: string;
  bulletPoints: string[];
}

export interface PredictionResult {
  estimatedSessions: number;
  estimatedHours: number;
  bottleneck: string;
  strategy: string[];
  projectedDate: string;
  confidenceScore: number;
}

export interface Submission {
  id: string;
  type: TaskType;
  taskId: string;
  content: string; 
  transcript?: string;
  feedback: WritingFeedback | SpeakingFeedback | ReadingFeedback;
  createdAt: string;
  wordCount?: number;
}

export interface User {
  id: string;
  email: string;
  targetBand?: number;
  theme?: AppTheme;
  accentColor?: AccentColor;
  authMode: AuthMode;
  academyProgress?: AcademyProgress;
}
