
import React, { useState, useRef, useEffect } from 'react';
import { SPEAKING_QUESTIONS } from '../constants';
import { evaluateSpeaking } from '../services/geminiService';
import { saveSubmission } from '../services/storageService';
import { TaskType, SpeakingFeedback } from '../types';
// Fix: Added ChevronRight to imports
import { Mic, Square, Play, RotateCcw, Send, Loader2, Sparkles, Volume2, ChevronRight } from 'lucide-react';

const SpeakingSection: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser environment compatibility
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = SPEAKING_QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

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
      };

      recorder.start();
      setIsRecording(true);
      setTimer(0);
      setFeedback(null);
      setError(null);
    } catch (err) {
      setError('Could not access microphone.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleEvaluate = async () => {
    if (!audioBlob) return;

    setIsEvaluating(true);
    setError(null);
    try {
      // Need to convert audio to PCM for Gemini Live API or just base64 for content API
      // Since evaluating audio natively requires specific base64 format
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const result = await evaluateSpeaking(base64data);
        setFeedback(result);
        
        saveSubmission({
          id: Math.random().toString(36).substr(2, 9),
          type: TaskType.SPEAKING,
          taskId: currentQuestion.id,
          content: reader.result as string,
          feedback: result,
          createdAt: new Date().toISOString(),
          transcript: result.transcript
        });
        setIsEvaluating(false);
      };
    } catch (err) {
      setError('Evaluation failed. Please try again.');
      setIsEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Speaking Practice</h1>
        <p className="text-slate-500">IELTS Speaking Part 1 - Personal topics and common experiences.</p>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="bg-blue-600 px-10 py-16 text-center text-white relative">
          <div className="absolute top-6 left-10 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">
            Part 1: Questions {currentQuestionIndex + 1} of {SPEAKING_QUESTIONS.length}
          </div>
          
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-medium leading-relaxed mb-8">
              "{currentQuestion.question}"
            </h2>
            
            <div className="flex justify-center items-center gap-4">
              <button 
                onClick={() => {
                  const audio = new SpeechSynthesisUtterance(currentQuestion.question);
                  window.speechSynthesis.speak(audio);
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-10 -mt-10 bg-white rounded-t-[40px] relative">
          <div className="flex flex-col items-center">
            {/* Timer & Waveform Mock */}
            <div className="mb-8 text-center">
              <div className={`text-4xl font-mono font-bold mb-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
                {formatTime(timer)}
              </div>
              <div className="flex gap-1 h-8 items-center justify-center">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1 rounded-full bg-slate-200 transition-all duration-300 ${isRecording ? 'bg-blue-400' : ''}`}
                    style={{ height: isRecording ? `${Math.random() * 100}%` : '20%' }}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mb-10">
              {audioBlob && !isRecording && (
                <button 
                  onClick={() => {setAudioBlob(null); setTimer(0); setFeedback(null);}}
                  className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              )}

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isEvaluating}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${
                  isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-10 h-10" />}
              </button>

              {audioBlob && !isRecording && (
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                >
                  {isEvaluating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
              )}
            </div>

            {error && <p className="text-red-500 text-sm font-medium mb-6">{error}</p>}

            {!feedback && !isEvaluating && !isRecording && !audioBlob && (
              <p className="text-slate-400 text-sm animate-bounce">Tap the microphone to start answering</p>
            )}

            {isEvaluating && (
              <div className="text-center py-6 animate-pulse">
                <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">Examiner is listening...</p>
              </div>
            )}

            {feedback && (
              <div className="w-full space-y-8 animate-in zoom-in-95 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Fluency', score: feedback.fluency },
                    { label: 'Lexical', score: feedback.lexical },
                    { label: 'Grammar', score: feedback.grammar },
                    { label: 'Pronunciation', score: feedback.pronunciation },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-3xl font-black text-slate-800">{stat.score}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Examiner Feedback
                  </h3>
                  <ul className="space-y-2">
                    {feedback.feedback.map((f, i) => (
                      <li key={i} className="text-sm text-blue-700/80 leading-relaxed">• {f}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Transcript</h3>
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    "{feedback.transcript}"
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setFeedback(null);
                    setAudioBlob(null);
                    setTimer(0);
                    setCurrentQuestionIndex((prev) => (prev + 1) % SPEAKING_QUESTIONS.length);
                  }}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingSection;
