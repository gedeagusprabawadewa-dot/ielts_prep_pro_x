
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

  const renderPronunciation = () => (
    <div className="max-w-xl mx-auto py-6 sm:py-12 space-y-6 animate-in zoom-in-95">
      <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Academy Hub</button>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] border-b-8 border-indigo-500 shadow-2xl overflow-hidden p-8 sm:p-12 text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Say this word:</p>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">{pWords[pTargetIdx]}</h2>
        <div className="flex flex-col items-center gap-6">
          <button onMouseDown={startPronunciationRecording} onMouseUp={stopPronunciationRecording} onTouchStart={startPronunciationRecording} onTouchEnd={stopPronunciationRecording} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 scale-110 shadow-xl' : 'bg-indigo-600 hover:scale-105'}`}>
            {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8 text-white" />}
          </button>
          <p className={`text-[10px] font-bold ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>{isRecording ? 'RECORDING...' : 'HOLD TO RECORD'}</p>
        </div>
        {pFeedback && (
          <div className={`mt-10 p-6 rounded-3xl border animate-in slide-in-from-top-4 ${pFeedback.score === 'Clear' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100'}`}>
             <p className={`text-lg font-black ${pFeedback.score === 'Clear' ? 'text-emerald-600' : 'text-rose-600'}`}>{pFeedback.score === 'Clear' ? 'Bagus! ✅' : 'Coba lagi! ⚠'}</p>
             <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic mt-2">"{pFeedback.feedback}"</p>
             <button onClick={() => setPTargetIdx(prev => (prev + 1) % pWords.length)} className="mt-5 px-6 py-2 bg-white dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200">Next Word</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlacement = () => (
    <div className="max-w-2xl mx-auto py-6 sm:py-12 animate-in fade-in slide-in-from-bottom-4">
      {!pResult ? (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          <div className="bg-brand p-8 text-white text-center">
            <h2 className="text-xl font-black mb-1">Academy Placement</h2>
            <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest">Question {currentPIdx + 1} / {PLACEMENT_QUESTIONS.length}</p>
          </div>
          <div className="p-8 sm:p-12">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-6 leading-tight">{PLACEMENT_QUESTIONS[currentPIdx].question}</h3>
            <div className="grid gap-2">
              {PLACEMENT_QUESTIONS[currentPIdx].options.map(opt => (
                <button key={opt} onClick={() => setPAnswers(prev => ({ ...prev, [PLACEMENT_QUESTIONS[currentPIdx].id]: opt }))} className={`p-4 text-left rounded-2xl border transition-all text-sm font-bold ${pAnswers[PLACEMENT_QUESTIONS[currentPIdx].id] === opt ? 'bg-brand text-white border-brand' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>{opt}</button>
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <button disabled={currentPIdx === 0} onClick={() => setCurrentPIdx(prev => prev - 1)} className="px-4 py-2 font-black text-slate-400 text-xs">Back</button>
              {currentPIdx === PLACEMENT_QUESTIONS.length - 1 ? (
                <button onClick={handlePlacementFinish} disabled={!pAnswers[PLACEMENT_QUESTIONS[currentPIdx].id]} className="px-6 py-3 bg-brand text-white rounded-xl font-black text-xs shadow-lg">FINISH</button>
              ) : (
                <button onClick={() => setCurrentPIdx(prev => prev + 1)} disabled={!pAnswers[PLACEMENT_QUESTIONS[currentPIdx].id]} className="px-6 py-3 bg-brand text-white rounded-xl font-black text-xs">NEXT</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-slate-900 rounded-[32px] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl">
           <Trophy className="w-16 h-16 text-brand mx-auto mb-6" />
           <h2 className="text-2xl font-black mb-2">Level: {pResult.toUpperCase()}</h2>
           <p className="text-slate-500 text-sm mb-8">We've customized your path based on your results.</p>
           <button onClick={() => setActiveStage('hub')} className="px-8 py-4 bg-brand text-white rounded-2xl font-black">START TRAINING</button>
        </div>
      )}
    </div>
  );

  const renderVocab = () => (
    <div className="max-w-xl mx-auto py-6 sm:py-12 space-y-6 animate-in zoom-in-95">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Academy Hub</button>
        <button onClick={() => setShowId(!showId)} className="px-4 py-2 bg-brand-soft text-brand rounded-xl text-[9px] font-black uppercase tracking-widest">{showId ? 'EN ONLY' : 'SHOW ID'}</button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] border-b-8 border-brand shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-12 text-center">
          <span className="px-3 py-1 bg-brand-soft text-brand rounded-full text-[8px] font-black uppercase tracking-widest mb-4 inline-block">{ACADEMY_VOCAB[currentVIdx].category}</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">{ACADEMY_VOCAB[currentVIdx].word}</h2>
          {showId && <p className="text-xl font-bold text-brand mb-6">{ACADEMY_VOCAB[currentVIdx].meaningId}</p>}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl italic text-slate-500 text-base">"{ACADEMY_VOCAB[currentVIdx].example}"</div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/20 flex gap-3">
          <button onClick={() => setCurrentVIdx(prev => (prev - 1 + ACADEMY_VOCAB.length) % ACADEMY_VOCAB.length)} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black text-slate-400">PREV</button>
          <button onClick={() => handleLearnVocab(ACADEMY_VOCAB[currentVIdx].id)} className="flex-[2] py-3 bg-brand text-white rounded-xl text-xs font-black">LEARNED</button>
          <button onClick={() => setCurrentVIdx(prev => (prev + 1) % ACADEMY_VOCAB.length)} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black text-slate-400">NEXT</button>
        </div>
      </div>
    </div>
  );

  const renderGrammar = () => {
    const lesson = ACADEMY_GRAMMAR[currentGIdx];
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-12 space-y-6 animate-in fade-in">
        <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Academy Hub</button>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-4">{lesson.title}</h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">{lesson.explanationId}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100"><p className="text-[9px] font-black text-red-600 mb-1">WRONG</p><p className="text-xs font-bold text-red-900 italic">"{lesson.wrong}"</p></div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100"><p className="text-[9px] font-black text-emerald-600 mb-1">RIGHT</p><p className="text-xs font-bold text-emerald-900">"{lesson.correct}"</p></div>
            </div>
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold mb-4">{lesson.quiz.question}</p>
              <div className="grid gap-2">
                {lesson.quiz.options.map(opt => (
                  <button key={opt} onClick={() => handleGrammarQuiz(opt)} className={`p-4 text-left rounded-xl border text-xs font-bold ${gQuizAnswer === opt ? (opt === lesson.quiz.answer ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-50 dark:bg-slate-800'}`}>{opt}</button>
                ))}
              </div>
              {showGFeedback && (
                <div className="mt-6 p-5 bg-brand-soft rounded-2xl border border-brand/10">
                  {isExplaining ? <div className="text-[10px] text-brand italic flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</div> : <p className="text-[11px] text-brand-hover font-bold leading-relaxed">{gTeacherExplanation || "Bagus! Teruskan belajarmu."}</p>}
                </div>
              )}
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
            <button disabled={currentGIdx === 0} onClick={() => { setCurrentGIdx(prev => prev - 1); setShowGFeedback(false); }} className="px-4 py-2 text-xs font-black text-slate-400">PREV</button>
            <button onClick={() => { setCurrentGIdx(prev => (prev + 1) % ACADEMY_GRAMMAR.length); setShowGFeedback(false); }} className="px-6 py-2 bg-brand text-white rounded-xl text-xs font-black">NEXT</button>
          </div>
        </div>
      </div>
    );
  };

  const renderBridge = () => {
    const lesson = ACADEMY_BRIDGE[currentBIdx];
    return (
      <div className="max-w-3xl mx-auto py-6 sm:py-12 space-y-6 animate-in fade-in">
        <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Academy Hub</button>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-12">
          <h2 className="text-xl sm:text-2xl font-black mb-6">{lesson.title}</h2>
          <div className="space-y-6">
            {lesson.type === 'listening' ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] text-center"><button className="w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-4"><Play className="w-6 h-6 fill-current" /></button><p className="text-slate-400 font-black text-[9px] uppercase tracking-widest">Listen Carefully</p></div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] text-center"><p className="text-base sm:text-xl font-bold mb-6 italic">"{lesson.content}"</p><button className="px-8 py-3 bg-brand text-white rounded-xl font-black text-xs">RECORD ANSWER</button></div>
            )}
            <div className="pt-6 border-t border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Task:</p><p className="text-base sm:text-lg font-black">{lesson.task}</p></div>
          </div>
          <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
            <button disabled={currentBIdx === 0} onClick={() => setCurrentBIdx(prev => prev - 1)} className="px-4 py-2 text-xs font-black text-slate-400">PREV</button>
            <button onClick={() => setCurrentBIdx(prev => (prev + 1) % ACADEMY_BRIDGE.length)} className="px-6 py-2 bg-brand text-white rounded-xl text-xs font-black">NEXT</button>
          </div>
        </div>
      </div>
    );
  };

  const renderHub = () => (
    <div className="space-y-10 animate-in fade-in duration-700 pt-4 sm:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Academy</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 font-medium">Foundational training to reach Band 5.0.</p>
        </div>
        <button onClick={() => setActiveStage('placement')} className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between sm:justify-start gap-4 shadow-sm">
          <RefreshCw className="w-4 h-4 text-brand" />
          <div className="text-left"><p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Level</p><p className="text-xs font-black">{progress.level.toUpperCase()}</p></div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Foundation Card - Handles both 'foundation' and 'unassigned' as active states */}
        <div className={`p-8 sm:p-10 rounded-[32px] sm:rounded-[48px] border transition-all ${progress.level === 'foundation' || progress.level === 'unassigned' ? 'bg-brand text-white border-brand shadow-2xl' : 'bg-white dark:bg-slate-900 opacity-80'}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2.5 rounded-xl ${progress.level === 'foundation' || progress.level === 'unassigned' ? 'bg-white/20' : 'bg-brand-soft text-brand'}`}><Zap className="w-6 h-6" /></div>
            <h3 className="text-2xl font-black">Foundation</h3>
          </div>
          <div className="space-y-4">
            {[
              { id: 'basics', label: 'Basics', icon: BookOpen },
              { id: 'vocab', label: 'Vocab', icon: Languages },
              { id: 'grammar', label: 'Grammar', icon: ShieldCheck },
              { id: 'pronunciation', label: 'Speech', icon: Mic }
            ].map((btn) => (
              <button 
                key={btn.id}
                onClick={() => setActiveStage(btn.id as any)} 
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                  progress.level === 'foundation' || progress.level === 'unassigned' 
                    ? 'bg-white text-brand hover:bg-slate-50 shadow-sm border border-white/10' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <btn.icon className="w-4 h-4" /> {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`p-8 rounded-[32px] border transition-all ${progress.level === 'bridge' ? 'bg-indigo-600 text-white shadow-2xl' : 'bg-white dark:bg-slate-900 opacity-60'}`}>
          <div className="flex items-center gap-3 mb-6"><div className={`p-2.5 rounded-xl ${progress.level === 'bridge' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}><Compass className="w-5 h-5" /></div><h3 className="text-xl font-black">Pre-IELTS</h3></div>
          {progress.level !== 'bridge' && progress.level !== 'beginner' ? <div className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-400 flex items-center justify-center gap-2"><Lock className="w-3 h-3" /> Locked</div> : <button onClick={() => setActiveStage('bridge')} className="w-full py-3.5 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">START BRIDGE</button>}
        </div>

        <div className={`p-8 rounded-[32px] border transition-all ${progress.level === 'beginner' ? 'bg-emerald-600 text-white shadow-2xl' : 'bg-white dark:bg-slate-900 opacity-60'}`}>
          <div className="flex items-center gap-3 mb-6"><div className={`p-2.5 rounded-xl ${progress.level === 'beginner' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}><Trophy className="w-5 h-5" /></div><h3 className="text-xl font-black">Beginner</h3></div>
          {progress.level !== 'beginner' ? <div className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-400 flex items-center justify-center gap-2"><Lock className="w-3 h-3" /> Locked</div> : <button className="w-full py-3.5 bg-white text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">START PREP</button>}
        </div>
      </div>

      <div className="bg-slate-900 p-8 sm:p-12 rounded-[32px] sm:rounded-[48px] text-white flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center shrink-0 shadow-lg"><Brain className="w-8 h-8" /></div>
        <div className="flex-1 text-center md:text-left"><h3 className="text-lg font-black mb-1">Scholar's Path</h3><p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">Starting with foundations is the most effective way for Indonesian candidates to reach Band 7.0+.</p></div>
        <button onClick={() => setActiveStage('basics')} className="w-full md:w-auto px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-xs hover:bg-brand hover:text-white transition-all">Quick Review</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {activeStage === 'hub' && renderHub()}
      {activeStage === 'placement' && renderPlacement()}
      {activeStage === 'vocab' && renderVocab()}
      {activeStage === 'grammar' && renderGrammar()}
      {activeStage === 'bridge' && renderBridge()}
      {activeStage === 'pronunciation' && renderPronunciation()}
      {activeStage === 'basics' && renderBasics()}
    </div>
  );
};

export default AcademySection;
