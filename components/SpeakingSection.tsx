
import React, { useState, useRef, useEffect } from 'react';
import { SPEAKING_QUESTIONS, SPEAKING_PART2_TASKS } from '../constants';
import { evaluateSpeaking } from '../services/geminiService';
import { saveSubmission } from '../services/storageService';
import { TaskType, SpeakingFeedback, SpeakingCueCard } from '../types';
import { 
  Mic, Square, RotateCcw, Send, Loader2, Sparkles, 
  Volume2, ChevronRight, ChevronLeft, LayoutGrid, Timer, 
  FileText, CheckCircle2, AlertCircle, PlayCircle, Info,
  PenTool, Clipboard, History, Users, Brain, X
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
          if (prev <= 1) { handleStopPreparation(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const handleStartPreparation = () => { setPhase('preparing'); setAudioBlob(null); setFeedback(null); setError(null); setPrepNotes(''); };
  const handleStopPreparation = () => { startRecording(); };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => { setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/webm' })); setPhase('idle'); };
      recorder.start();
      setPhase('recording');
      setFeedback(null);
      setError(null);
    } catch (err) { setError('Mic error. Check permissions.'); setPhase('idle'); }
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
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const taskInfo = activePart === 1 ? (SPEAKING_QUESTIONS[selectedTaskIndex] as any).question : JSON.stringify(SPEAKING_PART2_TASKS[selectedTaskIndex]);
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
    } catch (err) { setError('Evaluation failed.'); setPhase('idle'); }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedTaskIndex === null) {
    return (
      <div className="max-w-6xl mx-auto py-6 sm:py-10 animate-in fade-in duration-700">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Speaking</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg">Elite AI simulation for IELTS Speaking.</p>
        </header>

        <div className="grid grid-cols-2 gap-2 mb-8 bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl w-fit mx-auto sm:mx-0">
          <button onClick={() => setActivePart(1)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${activePart === 1 ? 'bg-white dark:bg-slate-700 text-brand shadow-md' : 'text-slate-500'}`}><Users className="w-3.5 h-3.5" /> Part 1</button>
          <button onClick={() => setActivePart(2)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${activePart === 2 ? 'bg-white dark:bg-slate-700 text-brand shadow-md' : 'text-slate-500'}`}><Clipboard className="w-3.5 h-3.5" /> Part 2</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {(activePart === 1 ? SPEAKING_QUESTIONS : SPEAKING_PART2_TASKS).map((task, idx) => (
            <button key={task.id} onClick={() => setSelectedTaskIndex(idx)} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 text-left hover:border-brand transition-all flex flex-col h-full group">
              <span className="text-[8px] font-black text-brand bg-brand-soft px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block w-fit">Topic {idx + 1}</span>
              <p className="text-slate-800 dark:text-white font-bold text-base leading-snug flex-1">{'question' in task ? task.question : task.topic}</p>
              <div className="mt-4 flex items-center justify-end text-slate-300 group-hover:text-brand transition-colors"><PlayCircle className="w-6 h-6" /></div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentTask = activePart === 1 ? (SPEAKING_QUESTIONS[selectedTaskIndex] as any) : (SPEAKING_PART2_TASKS[selectedTaskIndex] as SpeakingCueCard);

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-10 animate-in zoom-in-95 duration-500 pb-10">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => { setSelectedTaskIndex(null); setPhase('idle'); setAudioBlob(null); setPrepNotes(''); }} className="text-slate-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Topics</button>
        {phase === 'recording' && <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/10 border border-red-100 rounded-xl animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div><span className="text-[9px] font-black text-red-600 uppercase tracking-widest">RECORDING</span></div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className={`p-8 sm:p-12 text-center transition-colors duration-500 ${phase === 'preparing' ? 'bg-amber-50 dark:bg-amber-900/10' : phase === 'recording' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-brand'}`}>
              <h2 className={`text-xl sm:text-3xl font-black leading-tight ${phase === 'idle' || phase === 'result' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{activePart === 1 ? currentTask.question : currentTask.topic}</h2>
              {activePart === 1 && phase !== 'result' && <button onClick={() => window.speechSynthesis.speak(new SpeechSynthesisUtterance(currentTask.question))} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all mx-auto mt-6 shadow-lg"><Volume2 className="w-6 h-6" /></button>}
            </div>

            <div className="p-8 sm:p-12 -mt-6 bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-t-[48px]">
              {phase === 'result' && feedback ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[{ l: 'Fluency', s: feedback.fluency }, { l: 'Lexical', s: feedback.lexical }, { l: 'Grammar', s: feedback.grammar }, { l: 'Accent', s: feedback.pronunciation }].map((stat) => (
                      <div key={stat.l} className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-[24px] border border-slate-100 text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.l}</p>
                        <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">{stat.s}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-brand-soft p-6 sm:p-10 rounded-[32px] border border-brand/10">
                    <h3 className="font-black text-brand mb-6 flex items-center gap-2 text-base sm:text-xl"><Sparkles className="w-5 h-5" /> Feedback</h3>
                    <div className="space-y-3">{feedback.feedback.map((f, i) => <p key={i} className="text-[11px] sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">• {f}</p>)}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {phase === 'preparing' && (
                    <div className="text-center w-full space-y-6">
                      <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto flex items-center justify-center"><span className="text-2xl font-black text-amber-600 animate-none">{timer}</span></div>
                      <textarea value={prepNotes} onChange={(e) => setPrepNotes(e.target.value)} placeholder="Keywords for Part 2..." className="w-full h-32 bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none font-bold italic" />
                      <button onClick={handleStopPreparation} className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all">I'M READY</button>
                    </div>
                  )}

                  {phase === 'recording' && (
                    <div className="text-center w-full py-6 space-y-10">
                      <div className="text-5xl font-black text-red-500 tabular-nums">{formatTime(timer)}</div>
                      <button onClick={stopRecording} className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all"><Square className="w-8 h-8 fill-current" /></button>
                    </div>
                  )}

                  {(phase === 'idle' || phase === 'evaluating') && !feedback && (
                    <div className="flex flex-col items-center py-6 w-full">
                      {audioBlob ? (
                        <div className="w-full max-w-sm space-y-4 animate-in fade-in">
                           <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 text-center"><CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" /><p className="text-sm font-black text-emerald-900">Recording Saved</p></div>
                           <div className="flex gap-2">
                              <button onClick={() => {setAudioBlob(null); setTimer(0);}} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black">RETAKE</button>
                              <button onClick={handleEvaluate} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg">EVALUATE</button>
                           </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <button onClick={() => { if (activePart === 2) handleStartPreparation(); else startRecording(); }} className="w-28 h-28 rounded-full bg-brand text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all mb-6"><Mic className="w-12 h-12" /></button>
                          <p className="text-slate-800 dark:text-white font-black text-sm uppercase tracking-widest">{activePart === 2 ? 'Start Prep' : 'Tap to Record'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {phase === 'evaluating' && <div className="text-center py-10 space-y-4"><div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div><p className="text-xs font-black text-brand uppercase tracking-widest">Grading Submission...</p></div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {activePart === 2 && (
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Cue Card</h3>
             <ul className="space-y-4">
               {currentTask.bulletPoints?.map((bp: string, i: number) => (
                 <li key={i} className="text-slate-700 dark:text-slate-300 font-bold flex gap-3 text-sm"><span className="text-brand">•</span> {bp}</li>
               ))}
             </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingSection;
