import React, { useState, useRef, useEffect } from 'react';
import { SPEAKING_QUESTIONS, SPEAKING_PART2_TASKS } from '../constants';
import { evaluateSpeaking } from '../services/geminiService';
import { saveSubmission } from '../services/storageService';
import { TaskType, SpeakingFeedback, SpeakingCueCard } from '../types';
// Added Users and Brain to the imports from lucide-react
import { 
  Mic, Square, RotateCcw, Send, Loader2, Sparkles, 
  Volume2, ChevronRight, ChevronLeft, LayoutGrid, Timer, 
  FileText, CheckCircle2, AlertCircle, PlayCircle, Info,
  PenTool, Clipboard, History, Users, Brain
} from 'lucide-react';

type SpeakingPart = 1 | 2;
type SpeakingPhase = 'idle' | 'preparing' | 'recording' | 'evaluating' | 'result';

const SpeakingSection: React.FC = () => {
  const [activePart, setActivePart] = useState<SpeakingPart>(1);
  const [phase, setPhase] = useState<SpeakingPhase>('idle');
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [prepNotes, setPrepNotes] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'recording') {
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else if (phase === 'preparing') {
      setTimer(60);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handleStopPreparation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const handleStartPreparation = () => {
    setPhase('preparing');
    setAudioBlob(null);
    setFeedback(null);
    setError(null);
    setPrepNotes('');
  };

  const handleStopPreparation = () => {
    startRecording();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setPhase('idle');
      };

      recorder.start();
      setPhase('recording');
      setFeedback(null);
      setError(null);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      setPhase('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && phase === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleEvaluate = async () => {
    if (!audioBlob || selectedTaskIndex === null) return;

    setPhase('evaluating');
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const taskInfo = activePart === 1 
          ? SPEAKING_QUESTIONS[selectedTaskIndex].question 
          : JSON.stringify(SPEAKING_PART2_TASKS[selectedTaskIndex]);
        
        const result = await evaluateSpeaking(base64data, taskInfo, activePart);
        setFeedback(result);
        setPhase('result');
        
        saveSubmission({
          id: Math.random().toString(36).substr(2, 9),
          type: TaskType.SPEAKING,
          taskId: activePart === 1 ? SPEAKING_QUESTIONS[selectedTaskIndex].id : SPEAKING_PART2_TASKS[selectedTaskIndex].id,
          content: reader.result as string,
          feedback: result,
          createdAt: new Date().toISOString(),
          transcript: result.transcript
        });
      };
    } catch (err) {
      setError('Evaluation failed. Please try again.');
      setPhase('idle');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedTaskIndex === null) {
    return (
      <div className="max-w-6xl mx-auto py-10 pb-20 animate-in fade-in duration-700">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Speaking Studio</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Elite AI simulation for Parts 1 & 2 of the IELTS Speaking test.</p>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-12 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-[28px] w-fit mx-auto md:mx-0 shadow-inner">
          <button 
            onClick={() => setActivePart(1)}
            className={`px-8 py-3.5 rounded-[22px] text-sm font-black transition-all flex items-center gap-2 ${activePart === 1 ? 'bg-white dark:bg-slate-700 text-brand shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" /> Part 1: Interview
          </button>
          <button 
            onClick={() => setActivePart(2)}
            className={`px-8 py-3.5 rounded-[22px] text-sm font-black transition-all flex items-center gap-2 ${activePart === 2 ? 'bg-white dark:bg-slate-700 text-brand shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Clipboard className="w-4 h-4" /> Part 2: Long Turn
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {(activePart === 1 ? SPEAKING_QUESTIONS : SPEAKING_PART2_TASKS).map((task, idx) => (
            <button 
              key={task.id}
              onClick={() => setSelectedTaskIndex(idx)}
              className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 text-left hover:border-brand hover:shadow-2xl transition-all group relative h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-brand bg-brand-soft px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Topic {idx + 1}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-brand group-hover:text-white transition-all">
                  <PlayCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-slate-800 dark:text-white font-bold text-lg leading-snug flex-1">
                {'question' in task ? task.question : task.topic}
              </p>
              {activePart === 2 && (
                <div className="mt-6 flex items-center gap-3 text-slate-400">
                  <History className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">2 Minute Monologue</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 dark:bg-black p-10 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl">
          <div className="w-20 h-20 bg-brand rounded-[28px] flex items-center justify-center shrink-0 shadow-xl shadow-brand/20">
            <Info className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black mb-3">Examiner's Briefing</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              {activePart === 1 
                ? "Part 1 tests your ability to speak naturally on familiar topics. Keep your answers balanced: not too short, but not long essays (approx. 20-30 seconds)." 
                : "Part 2 is the 'Long Turn'. You have exactly 1 minute to plan using our digital scratchpad. You must then speak for up to 2 minutes without interruption."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentTask = activePart === 1 
    ? SPEAKING_QUESTIONS[selectedTaskIndex] as { question: string } 
    : SPEAKING_PART2_TASKS[selectedTaskIndex] as SpeakingCueCard;

  return (
    <div className="max-w-6xl mx-auto py-10 pb-20 animate-in zoom-in-95 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => { setSelectedTaskIndex(null); setPhase('idle'); setAudioBlob(null); setPrepNotes(''); }}
          className="text-slate-500 font-bold flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-all group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Topics
        </button>
        {phase === 'recording' && (
          <div className="flex items-center gap-3 px-6 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <span className="text-xs font-black text-red-600 uppercase tracking-widest">Live Recording</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interaction Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
            <div className={`p-12 text-center transition-all duration-500 ${phase === 'preparing' ? 'bg-amber-50 dark:bg-amber-900/10' : phase === 'recording' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-brand'}`}>
              <div className="max-w-xl mx-auto">
                {activePart === 2 && (
                  <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest mb-6">
                    IELTS Speaking Part 2
                  </span>
                )}
                <h2 className={`text-3xl font-black leading-tight mb-8 ${phase === 'idle' || phase === 'result' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                  {activePart === 1 ? (currentTask as { question: string }).question : (currentTask as SpeakingCueCard).topic}
                </h2>
                
                {activePart === 1 && phase !== 'result' && (
                  <button 
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance((currentTask as { question: string }).question);
                      window.speechSynthesis.speak(utterance);
                    }}
                    className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all mx-auto shadow-lg"
                  >
                    <Volume2 className="w-7 h-7" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-12 -mt-8 bg-white dark:bg-slate-900 rounded-t-[48px] relative">
              {phase === 'result' && feedback ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Fluency', score: feedback.fluency },
                      { label: 'Lexical', score: feedback.lexical },
                      { label: 'Grammar', score: feedback.grammar },
                      { label: 'Pronunciation', score: feedback.pronunciation },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 text-center hover:border-brand transition-colors group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-brand transition-colors">{stat.label}</p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white">{stat.score}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-brand-soft p-10 rounded-[40px] border border-brand/10">
                    <h3 className="font-black text-brand mb-8 flex items-center gap-3 text-xl">
                      <Sparkles className="w-7 h-7" />
                      Examiner's Assessment
                    </h3>
                    <div className="grid gap-5">
                      {feedback.feedback.map((f, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-brand/5 flex gap-5 text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 dark:bg-black p-10 rounded-[40px] text-white">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Full Transcription
                    </h3>
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10 italic text-xl leading-relaxed text-slate-300 font-serif">
                      "{feedback.transcript}"
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {phase === 'preparing' && (
                    <div className="text-center w-full mb-12">
                      <div className="inline-flex flex-col items-center mb-10">
                        <div className="w-24 h-24 rounded-full border-4 border-amber-200 border-t-amber-500 animate-[spin_3s_linear_infinite] flex items-center justify-center mb-6">
                           <span className="text-3xl font-mono font-black text-amber-600 animate-none">{timer}</span>
                        </div>
                        <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em]">Planning Phase</p>
                      </div>
                      
                      <div className="w-full max-w-lg mx-auto bg-amber-50/50 dark:bg-amber-900/5 rounded-3xl border border-amber-100 dark:border-amber-900/20 p-8">
                         <h4 className="text-xs font-black text-amber-700 uppercase mb-4 flex items-center gap-2">
                            <PenTool className="w-4 h-4" /> Scratchpad (Keywords Only)
                         </h4>
                         <textarea 
                           value={prepNotes}
                           onChange={(e) => setPrepNotes(e.target.value)}
                           placeholder="Jot down key vocabulary and bullet points..."
                           className="w-full h-40 bg-white dark:bg-slate-800 rounded-2xl p-6 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none font-medium text-lg italic shadow-sm"
                         />
                         <p className="mt-4 text-[10px] text-amber-500 font-bold">IELTS Tip: Don't write full sentences. Use keywords to trigger your memory.</p>
                      </div>

                      <button 
                        onClick={handleStopPreparation}
                        className="mt-10 px-10 py-4 bg-amber-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-200 hover:bg-amber-700 transition-all active:scale-95"
                      >
                        I'M READY TO SPEAK
                      </button>
                    </div>
                  )}

                  {phase === 'recording' && (
                    <div className="text-center w-full py-10">
                      <div className="text-6xl font-mono font-black text-red-500 mb-10 tabular-nums">
                        {formatTime(timer)}
                      </div>
                      <div className="flex gap-2 h-20 items-center justify-center mb-16">
                        {[...Array(24)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-2 rounded-full bg-red-400 transition-all duration-300"
                            style={{ height: `${30 + Math.random() * 70}%` }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={stopRecording}
                        className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-200 hover:bg-red-600 transition-all active:scale-95 group"
                      >
                        <Square className="w-8 h-8 fill-current group-hover:scale-90 transition-transform" />
                      </button>
                    </div>
                  )}

                  {(phase === 'idle' || phase === 'evaluating') && !feedback && (
                    <div className="flex flex-col items-center py-10 w-full">
                      {audioBlob ? (
                        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4">
                           <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-900/20 text-center">
                              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                              <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400 mb-2">Recording Ready</h3>
                              <p className="text-xs text-emerald-600 font-medium">Ready for examiner evaluation.</p>
                           </div>
                           <div className="flex gap-4">
                              <button 
                                onClick={() => {setAudioBlob(null); setTimer(0); setFeedback(null);}}
                                className="flex-1 py-5 rounded-[28px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                              >
                                <RotateCcw className="w-5 h-5" /> RETAKE
                              </button>
                              <button
                                onClick={handleEvaluate}
                                disabled={phase === 'evaluating'}
                                className="flex-[2] py-5 rounded-[28px] bg-emerald-500 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-95"
                              >
                                {phase === 'evaluating' ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-6 h-6" /> ANALYZE NOW</>}
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <button
                            onClick={() => {
                              if (activePart === 2) handleStartPreparation();
                              else startRecording();
                            }}
                            className="w-32 h-32 rounded-full bg-brand text-white flex items-center justify-center shadow-2xl shadow-brand/40 hover:scale-105 transition-all active:scale-95 mb-8"
                          >
                            <Mic className="w-14 h-14" />
                          </button>
                          <p className="text-slate-800 dark:text-white font-black text-lg mb-2">Tap to Start</p>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            {activePart === 2 ? 'Starts 60s Planning' : 'Direct Interview'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {phase === 'evaluating' && (
                    <div className="text-center py-20 w-full space-y-8">
                       <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 border-4 border-brand/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                             <Brain className="w-10 h-10 text-brand" />
                          </div>
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-brand mb-2">Analyzing Performance...</h4>
                          <p className="text-slate-400 text-sm">Evaluating fluency, pronunciation, and lexical range.</p>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Context */}
        <div className="lg:col-span-4 space-y-6">
          {activePart === 2 && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-xl">
               <div className="flex items-center gap-3 mb-8">
                 <div className="bg-brand-soft p-3 rounded-2xl text-brand">
                    <Clipboard className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-black">Official Cue Card</h3>
               </div>
               <div className="space-y-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">You should say:</p>
                 <ul className="space-y-4">
                   {(currentTask as SpeakingCueCard).bulletPoints.map((bp, i) => (
                     <li key={i} className="text-slate-700 dark:text-slate-300 font-bold flex gap-4 text-base">
                       <span className="text-brand font-black">/</span> {bp}
                     </li>
                   ))}
                 </ul>
                 <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-widest">Preparation Notes</p>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-sm italic text-slate-500 min-h-[120px]">
                       {prepNotes || "Notes from your planning phase will appear here."}
                    </div>
                 </div>
               </div>
            </div>
          )}

          <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl">
             <h4 className="text-[10px] font-black text-brand uppercase tracking-widest mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Speaking Pro-Tip
             </h4>
             <p className="text-base font-medium leading-relaxed italic text-slate-300">
               {activePart === 1 
                 ? "Focus on using fillers like 'Actually...', 'To be honest...', or 'Well, if I think about it...' to sound more natural while thinking." 
                 : "The cue card bullet points are a guide. You don't have to follow them in order, but you must cover all of them to ensure a high coherence score."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingSection;