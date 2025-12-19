
import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, Sparkles, Zap, BookOpen, Mic, 
  ChevronRight, CheckCircle2, Globe, Heart, 
  Lock, Play, ArrowRight, Brain, Lightbulb, 
  Languages, Info, AlertCircle, Loader2, Volume2,
  Trophy, RefreshCw, Compass, ShieldCheck, Square,
  Ear, Eye, PenTool, Check, Trash2, Book, 
  ChevronLeft, Award, Headphones
} from 'lucide-react';
import { PLACEMENT_QUESTIONS, ACADEMY_VOCAB, ACADEMY_GRAMMAR, ACADEMY_BRIDGE, FOUNDATION_LESSONS } from '../constants';
import { AcademyLevel, AcademyVocab, AcademyGrammarLesson, AcademyProgress, AcademyBridgeLesson, Lesson } from '../types';
import { updateUserData, getSessionUser } from '../services/storageService';
import { checkPronunciation, explainMistakeIndonesian } from '../services/geminiService';

const AcademySection: React.FC = () => {
  const user = getSessionUser();
  const [activeStage, setActiveStage] = useState<'hub' | 'placement' | 'vocab' | 'grammar' | 'bridge' | 'pronunciation' | 'basics'>('hub');
  const [showId, setShowId] = useState(true); // Indonesian toggle
  const [progress, setProgress] = useState<AcademyProgress>(user?.academyProgress || { level: 'unassigned', vocabCount: 0, completedLessons: [], learnedVocabIds: [] });
  
  // Foundations/Basics State
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);

  // Placement Test State
  const [currentPIdx, setCurrentPIdx] = useState(0);
  const [pAnswers, setPAnswers] = useState<Record<string, string>>({});
  const [pResult, setPResult] = useState<AcademyLevel | null>(null);

  // Vocab State
  const [currentVIdx, setCurrentVIdx] = useState(0);

  // Grammar State
  const [currentGIdx, setCurrentGIdx] = useState(0);
  const [gQuizAnswer, setGQuizAnswer] = useState<string | null>(null);
  const [showGFeedback, setShowGFeedback] = useState(false);
  const [gTeacherExplanation, setGTeacherExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Pronunciation State
  const [isRecording, setIsRecording] = useState(false);
  const [pFeedback, setPFeedback] = useState<{ score: string; feedback: string } | null>(null);
  const [pTargetIdx, setPTargetIdx] = useState(0);
  const pWords = ["Sustainable", "Significant", "Requirement", "Environment", "Development"];
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Bridge State
  const [currentBIdx, setCurrentBIdx] = useState(0);
  const [showBTranscript, setShowBTranscript] = useState(false);

  const handlePlacementFinish = () => {
    let score = 0;
    PLACEMENT_QUESTIONS.forEach(q => {
      if (pAnswers[q.id] === q.answer) score++;
    });
    let level: AcademyLevel = 'foundation';
    if (score >= 4) level = 'beginner';
    else if (score >= 2) level = 'bridge';
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
      } catch (e) {
        setGTeacherExplanation("Perhatikan subjek dan bentuk kata kerjanya ya!");
      } finally {
        setIsExplaining(false);
      }
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

  const stopPronunciationRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const renderBasics = () => {
    const lesson = FOUNDATION_LESSONS[selectedLessonIdx];
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8 animate-in fade-in">
        <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Academy
        </button>
        <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-8 border-r border-slate-100 dark:border-slate-800">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Introduction Series</h3>
             <div className="space-y-3">
               {FOUNDATION_LESSONS.map((l, i) => (
                 <button 
                  key={l.id} 
                  onClick={() => setSelectedLessonIdx(i)}
                  className={`w-full p-4 rounded-2xl text-left text-sm font-bold transition-all ${selectedLessonIdx === i ? 'bg-brand text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 hover:border-brand border border-transparent'}`}
                 >
                   {i + 1}. {l.title}
                 </button>
               ))}
             </div>
          </div>
          <div className="md:w-2/3 p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-brand-soft p-3 rounded-2xl text-brand"><Sparkles className="w-5 h-5" /></div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{lesson.title}</h2>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">{lesson.content}</p>
            <div className="space-y-4 mb-10">
              {lesson.bullets.map((b, i) => (
                <div key={i} className="flex gap-4 items-start text-sm font-bold text-slate-700 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  {b}
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800">
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0"><Heart className="w-5 h-5" /></div>
                 <div>
                   <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Teacher's Advice</p>
                   <p className="text-sm font-medium italic text-slate-500 italic">"{lesson.teacherTip}"</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPronunciation = () => (
    <div className="max-w-xl mx-auto py-12 space-y-8 animate-in zoom-in-95">
      <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" /> Back to Academy
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[48px] border-b-8 border-indigo-500 shadow-2xl overflow-hidden p-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
           <Headphones className="w-3.5 h-3.5" /> Sound Check
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pronounce this word:</p>
        <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">{pWords[pTargetIdx]}</h2>
        
        <div className="flex flex-col items-center gap-8">
          <button 
            onMouseDown={startPronunciationRecording}
            onMouseUp={stopPronunciationRecording}
            onTouchStart={startPronunciationRecording}
            onTouchEnd={stopPronunciationRecording}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl ${isRecording ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-indigo-600 shadow-indigo-200 hover:scale-105'}`}
          >
            {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-10 h-10 text-white" />}
          </button>
          <p className={`text-xs font-bold ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
            {isRecording ? 'RECORDING... RELEASE TO STOP' : 'HOLD TO RECORD'}
          </p>
        </div>

        {pFeedback && (
          <div className={`mt-12 p-8 rounded-[32px] border animate-in slide-in-from-top-4 ${pFeedback.score === 'Clear' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100'}`}>
             <div className="flex items-center justify-center gap-3 mb-3">
                <p className={`text-xl font-black ${pFeedback.score === 'Clear' ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {pFeedback.score === 'Clear' ? 'Bagus! ✅' : 'Coba lagi! ⚠'}
                </p>
             </div>
             <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">"{pFeedback.feedback}"</p>
             <button 
              onClick={() => setPTargetIdx(prev => (prev + 1) % pWords.length)}
              className="mt-6 px-6 py-2 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:border-brand"
             >Next Word</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlacement = () => (
    <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4">
      {!pResult ? (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          <div className="bg-brand p-10 text-white text-center">
            <h2 className="text-2xl font-black mb-2">Academy Placement</h2>
            <p className="text-white/70 text-sm">Question {currentPIdx + 1} of {PLACEMENT_QUESTIONS.length}</p>
          </div>
          <div className="p-12">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 leading-tight">
              {PLACEMENT_QUESTIONS[currentPIdx].question}
            </h3>
            <div className="grid gap-3">
              {PLACEMENT_QUESTIONS[currentPIdx].options.map(opt => (
                <button 
                  key={opt}
                  onClick={() => setPAnswers(prev => ({ ...prev, [PLACEMENT_QUESTIONS[currentPIdx].id]: opt }))}
                  className={`p-5 text-left rounded-3xl border transition-all font-bold ${pAnswers[PLACEMENT_QUESTIONS[currentPIdx].id] === opt ? 'bg-brand text-white border-brand' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-brand'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button disabled={currentPIdx === 0} onClick={() => setCurrentPIdx(prev => prev - 1)} className="px-6 py-2 rounded-xl font-black text-slate-400 disabled:opacity-30">Back</button>
              {currentPIdx === PLACEMENT_QUESTIONS.length - 1 ? (
                <button onClick={handlePlacementFinish} disabled={!pAnswers[PLACEMENT_QUESTIONS[currentPIdx].id]} className="px-8 py-3 bg-brand text-white rounded-xl font-black shadow-lg">SEE MY LEVEL</button>
              ) : (
                <button onClick={() => setCurrentPIdx(prev => prev + 1)} disabled={!pAnswers[PLACEMENT_QUESTIONS[currentPIdx].id]} className="px-8 py-3 bg-brand text-white rounded-xl font-black">NEXT</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-slate-900 rounded-[48px] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
           <div className="w-24 h-24 bg-brand rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand/20"><Trophy className="w-12 h-12 text-white" /></div>
           <h2 className="text-3xl font-black mb-2">Welcome to {pResult.charAt(0).toUpperCase() + pResult.slice(1)}!</h2>
           <p className="text-slate-500 mb-8">We've customized your path based on your results.</p>
           <button onClick={() => setActiveStage('hub')} className="px-10 py-4 bg-brand text-white rounded-2xl font-black shadow-xl">START LEARNING</button>
        </div>
      )}
    </div>
  );

  const renderVocab = () => (
    <div className="max-w-xl mx-auto py-12 space-y-8 animate-in zoom-in-95">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back to Academy</button>
        <button onClick={() => setShowId(!showId)} className="px-4 py-2 bg-brand-soft text-brand rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> {showId ? 'EN ONLY' : 'ID TRANSLATION'}</button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[48px] border-b-8 border-brand shadow-2xl overflow-hidden">
        <div className="p-12 text-center">
          <span className="px-3 py-1 bg-brand-soft text-brand rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">{ACADEMY_VOCAB[currentVIdx].category}</span>
          <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">{ACADEMY_VOCAB[currentVIdx].word}</h2>
          {showId && <p className="text-2xl font-bold text-brand mb-8 animate-in fade-in">{ACADEMY_VOCAB[currentVIdx].meaningId}</p>}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl italic text-slate-500 text-lg leading-relaxed">"{ACADEMY_VOCAB[currentVIdx].example}"</div>
        </div>
        <div className="p-8 bg-slate-50 dark:bg-slate-800/20 flex justify-between gap-4">
          <button onClick={() => setCurrentVIdx(prev => (prev - 1 + ACADEMY_VOCAB.length) % ACADEMY_VOCAB.length)} className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-slate-400 hover:bg-white">PREV</button>
          <button onClick={() => handleLearnVocab(ACADEMY_VOCAB[currentVIdx].id)} className="flex-[2] py-4 bg-brand text-white rounded-2xl font-black shadow-lg">MARK AS LEARNED</button>
          <button onClick={() => setCurrentVIdx(prev => (prev + 1) % ACADEMY_VOCAB.length)} className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-slate-400 hover:bg-white">NEXT</button>
        </div>
      </div>
    </div>
  );

  const renderGrammar = () => {
    const lesson = ACADEMY_GRAMMAR[currentGIdx];
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in fade-in">
        <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back to Academy</button>
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-10">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{lesson.title}</h2>
            <div className="space-y-6 mb-10">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Penjelasan</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{lesson.explanationId}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                   <p className="text-[10px] font-black text-red-600 uppercase mb-2">Salah ❌</p>
                   <p className="text-sm font-bold text-red-900 dark:text-red-400 italic">"{lesson.wrong}"</p>
                </div>
                <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                   <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Benar ✅</p>
                   <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">"{lesson.correct}"</p>
                </div>
              </div>
            </div>
            <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black mb-6">Quick Quiz:</h3>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6">{lesson.quiz.question}</p>
              <div className="grid gap-3">
                {lesson.quiz.options.map(opt => (
                  <button key={opt} onClick={() => handleGrammarQuiz(opt)} className={`p-4 text-left rounded-2xl border transition-all font-bold text-sm ${gQuizAnswer === opt ? (opt === lesson.quiz.answer ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-red-500 text-white border-red-500') : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-brand'}`}>{opt}</button>
                ))}
              </div>
              {showGFeedback && (
                <div className="mt-8 p-6 bg-brand-soft rounded-3xl border border-brand/10 animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                    <p className="text-xs font-black text-brand uppercase tracking-widest">AI Teacher Explanation</p>
                  </div>
                  {isExplaining ? <div className="flex items-center gap-3 text-brand text-xs italic"><Loader2 className="w-4 h-4 animate-spin" /> Menulis penjelasan untukmu...</div> : <p className="text-sm text-brand-hover font-medium leading-relaxed">{gTeacherExplanation || (gQuizAnswer === lesson.quiz.answer ? "Bagus! Kamu sudah paham aturan dasarnya." : "Perhatikan lagi subjeknya ya.")}</p>}
                </div>
              )}
            </div>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
            <button disabled={currentGIdx === 0} onClick={() => { setCurrentGIdx(prev => prev - 1); setShowGFeedback(false); setGQuizAnswer(null); setGTeacherExplanation(null); }} className="px-6 py-2 font-black text-slate-400 disabled:opacity-30">PREV</button>
            <button onClick={() => { setCurrentGIdx(prev => (prev + 1) % ACADEMY_GRAMMAR.length); setShowGFeedback(false); setGQuizAnswer(null); setGTeacherExplanation(null); }} className="px-6 py-2 bg-brand text-white rounded-xl font-black">NEXT</button>
          </div>
        </div>
      </div>
    );
  };

  const renderBridge = () => {
    const lesson = ACADEMY_BRIDGE[currentBIdx];
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-8 animate-in fade-in">
        <header className="flex items-center justify-between">
          <button onClick={() => setActiveStage('hub')} className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back to Academy</button>
          <button onClick={() => setShowBTranscript(!showBTranscript)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{showBTranscript ? 'HIDE TRANSCRIPT' : 'SHOW TRANSCRIPT'}</button>
        </header>
        <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-brand-soft text-brand">{lesson.type === 'listening' ? <Ear className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{lesson.title}</h2>
          </div>
          <div className="space-y-8">
            {lesson.type === 'listening' ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
                 <button className="w-20 h-20 bg-brand text-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-6"><Play className="w-8 h-8 fill-current" /></button>
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Simulated Slow Audio</p>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 text-center">
                 <p className="text-xl font-bold text-slate-800 dark:text-white leading-relaxed mb-8 italic">"{lesson.content}"</p>
                 <button className="px-10 py-4 bg-brand text-white rounded-2xl font-black shadow-lg flex items-center gap-3 mx-auto"><Mic className="w-5 h-5" /> START RECORDING</button>
              </div>
            )}
            {showBTranscript && (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-8 bg-slate-900 text-white rounded-[32px] border border-white/5"><p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">English Text</p><p className="text-lg font-medium leading-relaxed italic">"{lesson.content}"</p></div>
                {lesson.indonesianTranslation && <div className="p-8 bg-brand-soft text-brand rounded-[32px] border border-brand/10"><p className="text-[10px] font-black opacity-60 uppercase mb-4 tracking-widest">Terjemahan Indonesia</p><p className="text-lg font-black leading-relaxed">{lesson.indonesianTranslation}</p></div>}
              </div>
            )}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800"><h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Task:</h3><p className="text-lg font-black text-slate-800 dark:text-white">{lesson.task}</p></div>
          </div>
          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
            <button disabled={currentBIdx === 0} onClick={() => { setCurrentBIdx(prev => prev - 1); setShowBTranscript(false); }} className="px-6 py-2 font-black text-slate-400 disabled:opacity-30">PREVIOUS</button>
            <button onClick={() => { setCurrentBIdx(prev => (prev + 1) % ACADEMY_BRIDGE.length); setShowBTranscript(false); }} className="px-8 py-3 bg-brand text-white rounded-xl font-black">NEXT</button>
          </div>
        </div>
      </div>
    );
  };

  const renderHub = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Academy Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Foundation to Band 5.0 training path.</p>
        </div>
        <button onClick={() => setActiveStage('placement')} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-brand transition-all">
          <div className="bg-brand-soft p-2 rounded-xl text-brand"><RefreshCw className="w-4 h-4" /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</p><p className="text-xs font-bold dark:text-white">{progress.level === 'unassigned' ? 'Retake Test' : progress.level.toUpperCase()}</p></div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Foundation Module (A0-A1) */}
        <div className={`p-10 rounded-[48px] border transition-all ${progress.level === 'foundation' || progress.level === 'unassigned' ? 'bg-brand text-white border-brand shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl ${progress.level === 'foundation' ? 'bg-white/20' : 'bg-brand-soft text-brand'}`}><Zap className="w-6 h-6" /></div>
            <h3 className="text-2xl font-black">Foundation</h3>
          </div>
          <p className={`text-sm mb-8 font-medium leading-relaxed ${progress.level === 'foundation' ? 'text-white/80' : 'text-slate-500'}`}>English foundation (A0–A1). Daily vocabulary, core grammar, and IELTS basics.</p>
          <div className="space-y-4">
            <button onClick={() => setActiveStage('basics')} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${progress.level === 'foundation' ? 'bg-white text-brand' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand'}`}>
              <BookOpen className="w-4 h-4" /> IELTS Basics (Foundations)
            </button>
            <button onClick={() => setActiveStage('vocab')} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${progress.level === 'foundation' ? 'bg-white text-brand' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand'}`}>
              <Languages className="w-4 h-4" /> Daily Vocab Builder
            </button>
            <button onClick={() => setActiveStage('grammar')} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${progress.level === 'foundation' ? 'bg-white text-brand' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand'}`}>
              <ShieldCheck className="w-4 h-4" /> Grammar Coach
            </button>
            <button onClick={() => setActiveStage('pronunciation')} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${progress.level === 'foundation' ? 'bg-white text-brand' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand'}`}>
              <Mic className="w-4 h-4" /> Pronunciation Trainer
            </button>
          </div>
        </div>

        {/* Bridge Module (A2-B1) */}
        <div className={`p-10 rounded-[48px] border transition-all ${progress.level === 'bridge' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl ${progress.level === 'bridge' ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}><Compass className="w-6 h-6" /></div>
            <h3 className="text-2xl font-black">Pre-IELTS</h3>
          </div>
          <p className={`text-sm mb-8 font-medium leading-relaxed ${progress.level === 'bridge' ? 'text-white/80' : 'text-slate-500'}`}>Bridge to IELTS. Slow English listening and speaking confidence building.</p>
          <div className="space-y-4">
             {progress.level !== 'bridge' && progress.level !== 'beginner' ? (
                <div className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-2"><Lock className="w-3.5 h-3.5" /> Locked</div>
             ) : (
                <button onClick={() => setActiveStage('bridge')} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg"><Play className="w-4 h-4" /> START BRIDGE</button>
             )}
          </div>
        </div>

        {/* Beginner Module (Band 4-5) */}
        <div className={`p-10 rounded-[48px] border transition-all ${progress.level === 'beginner' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl ${progress.level === 'beginner' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600'}`}><Trophy className="w-6 h-6" /></div>
            <h3 className="text-2xl font-black">IELTS Beginner</h3>
          </div>
          <p className={`text-sm mb-8 font-medium leading-relaxed ${progress.level === 'beginner' ? 'text-white/80' : 'text-slate-500'}`}>Kickstart your band. Guided Task 1 and Part 1 simulation (Band 4-5 level).</p>
          <div className="space-y-4">
             {progress.level !== 'beginner' ? (
                <div className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-2"><Lock className="w-3.5 h-3.5" /> Locked</div>
             ) : (
                <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg"><Award className="w-4 h-4" /> START PREP</button>
             )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-12 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-10">
        <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center shrink-0"><Brain className="w-10 h-10" /></div>
        <div className="flex-1 text-center md:text-left">
           <h3 className="text-xl font-black mb-2">Indonesian Scholar's Path</h3>
           <p className="text-slate-400 font-medium">Starting with foundations is the most effective way for Indonesian candidates to reach Band 7.0+. Master the basics first, then tackle the exam logic.</p>
        </div>
        <button onClick={() => setActiveStage('basics')} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black flex items-center gap-2 hover:bg-brand hover:text-white transition-all">Quick Review <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 pb-20">
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
