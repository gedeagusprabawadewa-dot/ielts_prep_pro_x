
import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, Sparkles, Zap, BookOpen, Mic, 
  ChevronRight, CheckCircle2, Globe, Heart, 
  Lock, Play, ArrowRight, Brain, Lightbulb, 
  Languages, Info, AlertCircle, Loader2, Volume2,
  Trophy, RefreshCw, Compass, ShieldCheck, Square,
  Ear, Eye, PenTool, Check, Trash2, Book, 
  ChevronLeft, Award, Headphones, X
} from 'lucide-react';
import { PLACEMENT_QUESTIONS, ACADEMY_VOCAB, ACADEMY_GRAMMAR, ACADEMY_BRIDGE, FOUNDATION_LESSONS } from '../constants';
import { AcademyLevel, AcademyVocab, AcademyGrammarLesson, AcademyProgress, AcademyBridgeLesson, Lesson } from '../types';
import { updateUserData, getSessionUser } from '../services/storageService';
import { checkPronunciation, explainMistakeIndonesian } from '../services/geminiService';

// Fix: Completed component definition and added return statement to satisfy React.FC type.
const AcademySection: React.FC = () => {
  const user = getSessionUser();
  const [activeStage, setActiveStage] = useState<'hub' | 'placement' | 'vocab' | 'grammar' | 'bridge' | 'pronunciation' | 'basics'>('hub');
  const [showId, setShowId] = useState(true);
  const [progress, setProgress] = useState<AcademyProgress>(user?.academyProgress || { level: 'unassigned', vocabCount: 0, completedLessons: [], learnedVocabIds: [] });
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [currentPIdx, setCurrentPIdx] = useState(0);
  const [pAnswers, setPAnswers] = useState<Record<string, string>>({});
  const [pResult, setPResult] = useState<AcademyLevel | null>(null);
  const [currentVIdx, setCurrentVIdx] = useState(0);
  const [currentGIdx, setCurrentGIdx] = useState(0);
  const [gQuizAnswer, setGQuizAnswer] = useState<string | null>(null);
  const [showGFeedback, setShowGFeedback] = useState(false);
  const [gTeacherExplanation, setGTeacherExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pFeedback, setPFeedback] = useState<{ score: string; feedback: string } | null>(null);
  const [pTargetIdx, setPTargetIdx] = useState(0);
  const pWords = ["Sustainable", "Significant", "Requirement", "Environment", "Development"];
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [currentBIdx, setCurrentBIdx] = useState(0);
  const [showBTranscript, setShowBTranscript] = useState(false);

  const handlePlacementFinish = () => {
    let score = 0;
    PLACEMENT_QUESTIONS.forEach(q => { if (pAnswers[q.id] === q.answer) score++; });
    let level: AcademyLevel = score >= 4 ? 'beginner' : score >= 2 ? 'bridge' : 'foundation';
    setPResult(level);
    const newProgress = { ...progress, level };
    setProgress(newProgress);
    updateUserData({ academyProgress: newProgress });
  };

  const handleLearnVocab = (id: string) => {
    if (!progress.learnedVocabIds.includes(id)) {
      const newLearned = [...progress.learnedVocabIds, id];
      const newProgress = { ...progress, learnedVocabIds: newLearned, vocabCount: newLearned.length };
      setProgress(newProgress);
      updateUserData({ academyProgress: newProgress });
    }
    setCurrentVIdx(prev => (prev + 1) % ACADEMY_VOCAB.length);
  };

  const handleGrammarQuiz = async (answer: string) => {
    const lesson = ACADEMY_GRAMMAR[currentGIdx];
    setGQuizAnswer(answer);
    setShowGFeedback(true);
    if (answer !== lesson.quiz.answer && showId) {
      setIsExplaining(true);
      try {
        const expl = await explainMistakeIndonesian(answer, `Topic: ${lesson.title}. Correct is: ${lesson.quiz.answer}`);
        setGTeacherExplanation(expl);
      } catch (e) { setGTeacherExplanation("Cek lagi bentuk katanya ya!"); }
      finally { setIsExplaining(false); }
    }
  };

  const startPronunciationRecording = async () => {
    setPFeedback(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const result = await checkPronunciation(base64, pWords[pTargetIdx]);
          setPFeedback(result);
        };
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) { console.error(e); }
  };

  const stopPronunciationRecording = () => { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setIsRecording(false); } };

  const renderBasics = () => {
    const lesson = FOUNDATION_LESSONS[selectedLessonIdx];
    return (
      <div className="max-w-4xl mx-auto py-6 sm:py-12 space-y-6 animate-in fade-in">
        <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Academy Hub</button>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 border-r border-slate-100 dark:border-slate-800">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lessons</h3>
             <div className="flex overflow-x-auto md:flex-col gap-2 pb-2 md:pb-0 scrollbar-hide">
               {FOUNDATION_LESSONS.map((l, i) => (
                 <button key={l.id} onClick={() => setSelectedLessonIdx(i)} className={`shrink-0 md:shrink-1 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${selectedLessonIdx === i ? 'bg-brand text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>{i + 1}. {l.title}</button>
               ))}
             </div>
          </div>
          <div className="md:w-2/3 p-6 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-4">{lesson.title}</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{lesson.content}</p>
            <div className="space-y-3 mb-8">
              {lesson.bullets.map((b, i) => (
                <div key={i} className="flex gap-3 items-start text-xs font-bold text-slate-700 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {b}
                </div>
              ))}
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
               <p className="text-[9px] font-black text-brand uppercase tracking-widest mb-1">Teacher's Tip</p>
               <p className="text-xs font-medium italic text-slate-500">"{lesson.teacherTip}"</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Return Block for AcademySection
  return (
    <div className="max-w-6xl mx-auto pb-10">
      {activeStage === 'basics' && renderBasics()}
      {activeStage === 'hub' && (
        <div className="space-y-10 animate-in fade-in duration-700">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Academy</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Foundations for scholarship success.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button 
              onClick={() => setActiveStage('basics')}
              className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 text-left hover:border-brand transition-all shadow-sm group"
            >
              <div className="w-12 h-12 bg-brand-soft rounded-2xl flex items-center justify-center text-brand mb-6 group-hover:bg-brand group-hover:text-white transition-all">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">IELTS Basics</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Everything you need to know about the test format and scoring.</p>
            </button>

            <button 
              onClick={() => setActiveStage('vocab')}
              className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 text-left hover:border-brand transition-all shadow-sm group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Essential Vocab</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Master high-frequency academic words for Writing and Reading.</p>
            </button>

            <button 
              onClick={() => setActiveStage('grammar')}
              className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 text-left hover:border-brand transition-all shadow-sm group"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Core Grammar</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Fix common sentence-level errors that pull down your GRA score.</p>
            </button>
          </div>
        </div>
      )}
      {(activeStage !== 'basics' && activeStage !== 'hub') && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm mx-4">
          <button onClick={() => setActiveStage('hub')} className="text-brand font-black flex items-center gap-2 mx-auto hover:opacity-80 transition-all">
            <ChevronLeft className="w-5 h-5" /> Back to Hub
          </button>
          <div className="mt-8 space-y-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-10 h-10 text-slate-400 animate-pulse" />
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Module under development</p>
            <p className="text-xs text-slate-500 italic max-w-xs mx-auto">We are building this {activeStage} module for the next update.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Fix: Added missing default export.
export default AcademySection;
