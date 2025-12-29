
import React, { useState, useEffect } from 'react';
import { READING_TASKS } from '../constants';
import { ReadingTask, ReadingFeedback, TaskType } from '../types';
import { evaluateReadingTest, generateReadingTask } from '../services/geminiService';
import { saveSubmission } from '../services/storageService';
import { 
  BookOpen, ChevronLeft, ChevronRight, CheckCircle2, 
  Loader2, Sparkles, AlertCircle, Info, Book,
  Clock, Award, Brain, Lightbulb, ArrowRight, Zap, RefreshCw
} from 'lucide-react';

const ReadingSection: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<ReadingTask | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<ReadingFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const handleSelectTask = (task: ReadingTask) => {
    setSelectedTask(task);
    setStudentAnswers({});
    setFeedback(null);
    setError(null);
    setCurrentQuestionIdx(0);
  };

  const handleAIRequest = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const task = await generateReadingTask();
      handleSelectTask(task);
    } catch (err) {
      setError("AI Generation failed. Please try a pre-loaded passage.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setStudentAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const answersArray = selectedTask.questions.map(q => ({
        id: q.id,
        answer: studentAnswers[q.id] || ''
      }));
      const correctArray = selectedTask.questions.map(q => ({
        id: q.id,
        answer: q.answer
      }));

      const result = await evaluateReadingTest(selectedTask.passage, answersArray, correctArray);
      setFeedback(result);
      
      saveSubmission({
        id: Math.random().toString(36).substr(2, 9),
        type: TaskType.READING_ACADEMIC,
        taskId: selectedTask.id,
        content: JSON.stringify(studentAnswers),
        feedback: result,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feedback && selectedTask) {
    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Reading Results</h2>
            <p className="text-slate-500">Comprehensive skill breakdown and logic analysis.</p>
          </div>
          <button onClick={() => setSelectedTask(null)} className="px-6 py-3 bg-brand text-white rounded-2xl font-black text-sm shadow-xl hover:opacity-90 transition-all flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Try Another Passage
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Score Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="bg-brand px-10 py-12 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Award className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-3 inline-block">Estimated Band</span>
                  <h3 className="text-6xl font-black mb-1">Band {feedback.bandScore}</h3>
                  <div className="flex items-center gap-2 mt-4">
                     <div className="px-3 py-1 bg-white/20 rounded-lg text-xs font-black">Raw Score: {feedback.score} / {feedback.total}</div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center min-w-[120px] relative z-10">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-white/50" />
                  <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">Analysis</span>
                  <span className="text-sm font-black uppercase">Graded</span>
                </div>
              </div>

              <div className="p-10">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Skill Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Skimming', value: feedback.skillAnalysis.skimming },
                    { label: 'Scanning', value: feedback.skillAnalysis.scanning },
                    { label: 'In-Depth', value: feedback.skillAnalysis.detailedUnderstanding }
                  ].map(skill => (
                    <div key={skill.label} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-500 mb-2">{skill.label}</p>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-brand transition-all duration-1000" style={{ width: `${skill.value}%` }}></div>
                      </div>
                      <p className="text-right text-[10px] font-black text-brand mt-2">{skill.value}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Answer Key Deep Dive */}
            <div className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-soft text-brand flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                Logic Breakdown
              </h3>
              {feedback.answers.map((ans, i) => (
                <div key={i} className={`bg-white dark:bg-slate-900 p-8 rounded-[32px] border ${ans.isCorrect ? 'border-emerald-100 dark:border-emerald-900/20' : 'border-red-100 dark:border-red-900/20'} shadow-sm`}>
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase">Question {i+1}</span>
                    {ans.isCorrect ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm"><CheckCircle2 className="w-4 h-4" /> Correct</div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 font-bold text-sm"><AlertCircle className="w-4 h-4" /> Incorrect</div>
                    )}
                  </div>
                  <p className="text-slate-800 dark:text-white font-bold mb-6">"{selectedTask.questions[i].question}"</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Your Answer</p>
                      <p className={`font-bold ${ans.isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>{ans.studentAnswer || '(Empty)'}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                      <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Correct Answer</p>
                      <p className="font-bold text-emerald-900 dark:text-emerald-400">{ans.correctAnswer}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-brand-soft rounded-2xl border border-brand/10 text-brand text-xs leading-relaxed font-medium">
                    <span className="font-black uppercase tracking-widest block mb-2 opacity-60">Examiner's Explanation:</span>
                    {ans.logic}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 dark:bg-black p-8 rounded-[40px] text-white shadow-xl">
               <h4 className="text-lg font-bold mb-6 flex items-center gap-3">
                 <Lightbulb className="w-6 h-6 text-brand" /> Lexical Lab
               </h4>
               <div className="space-y-4">
                 {feedback.vocabulary.map((v, i) => (
                   <div key={i} className="bg-white/5 p-5 rounded-3xl border border-white/10 hover:border-brand transition-all">
                      <p className="text-brand font-black text-sm mb-1">{v.word}</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{v.explanation}</p>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 italic">Legal Safety Notice</p>
               <p className="text-[9px] text-slate-500 leading-relaxed font-medium italic">
                 All reading passages, questions, and scoring are AI-generated practice materials designed to reflect the IELTS Academic Reading format. This platform is not affiliated with or endorsed by IELTS, British Council, IDP, or Cambridge.
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTask) {
    return (
      <div className="max-w-screen-2xl mx-auto h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-500">
        <header className="mb-6 flex items-center justify-between">
          <button onClick={() => setSelectedTask(null)} className="text-slate-500 font-bold flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-all group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Passage List
          </button>
          <div className="bg-white dark:bg-slate-900 px-6 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-brand flex items-center gap-2">
            <Clock className="w-4 h-4" /> 60:00
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
          {/* Passage Area */}
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-y-auto p-10 lg:p-14">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8 leading-tight">{selectedTask.title}</h1>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {selectedTask.passage.split('\n\n').map((para, i) => (
                <p key={i} className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6 font-serif selection:bg-brand selection:text-white">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Question Area */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/20 rounded-[40px] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
               <div className="bg-white dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <Book className="w-4 h-4 text-brand" /> QUESTION BOOKLET
                  </h3>
                  <div className="flex gap-2">
                    {selectedTask.questions.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentQuestionIdx(i)}
                        className={`w-8 h-8 rounded-full text-[10px] font-black transition-all ${currentQuestionIdx === i ? 'bg-brand text-white shadow-lg shadow-brand/20' : studentAnswers[selectedTask.questions[i].id] ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="flex-1 p-10 overflow-y-auto">
                 <div className="max-w-md mx-auto py-10">
                    <div className="mb-10 animate-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-brand-soft text-brand rounded-full text-[10px] font-black uppercase tracking-widest">Question {currentQuestionIdx + 1}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedTask.questions[currentQuestionIdx].type}</span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-8 leading-tight">
                        {selectedTask.questions[currentQuestionIdx].question}
                      </h4>

                      {selectedTask.questions[currentQuestionIdx].type === 'mcq' && (
                        <div className="space-y-3">
                          {selectedTask.questions[currentQuestionIdx].options?.map((opt, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleAnswerChange(selectedTask.questions[currentQuestionIdx].id, opt)}
                              className={`w-full p-6 text-left rounded-3xl border transition-all flex items-center gap-4 ${studentAnswers[selectedTask.questions[currentQuestionIdx].id] === opt ? 'bg-brand text-white border-brand shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-brand text-slate-600 dark:text-slate-300'}`}
                            >
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-xs ${studentAnswers[selectedTask.questions[currentQuestionIdx].id] === opt ? 'bg-white/20 border-white/40' : 'border-slate-200 dark:border-slate-700'}`}>
                                {String.fromCharCode(65 + i)}
                              </div>
                              <span className="font-bold">{opt}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedTask.questions[currentQuestionIdx].type === 'tfng' && (
                        <div className="flex flex-col gap-3">
                          {['True', 'False', 'Not Given'].map((opt) => (
                            <button 
                              key={opt} 
                              onClick={() => handleAnswerChange(selectedTask.questions[currentQuestionIdx].id, opt)}
                              className={`p-6 text-left rounded-3xl border font-black transition-all ${studentAnswers[selectedTask.questions[currentQuestionIdx].id] === opt ? 'bg-brand text-white border-brand shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-brand'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedTask.questions[currentQuestionIdx].type === 'gapfill' && (
                        <input 
                          type="text" 
                          value={studentAnswers[selectedTask.questions[currentQuestionIdx].id] || ''}
                          onChange={(e) => handleAnswerChange(selectedTask.questions[currentQuestionIdx].id, e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand dark:text-white"
                        />
                      )}
                    </div>
                 </div>
               </div>

               <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIdx === 0}
                      className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-brand hover:text-white disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => setCurrentQuestionIdx(prev => Math.min(selectedTask.questions.length - 1, prev + 1))}
                      disabled={currentQuestionIdx === selectedTask.questions.length - 1}
                      className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-brand hover:text-white disabled:opacity-30 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || Object.keys(studentAnswers).length === 0}
                    className="px-10 py-4 bg-brand text-white rounded-2xl font-black text-sm shadow-xl shadow-brand/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> ANALYZING...</> : <><CheckCircle2 className="w-4 h-4" /> FINISH & SCORE</>}
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 animate-in fade-in duration-700">
      <header className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Academic Reading</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Simulate the real IELTS environment with academic-grade passages.</p>
        </div>
        <button 
          onClick={handleAIRequest}
          disabled={isGenerating}
          className="px-8 py-4 bg-brand text-white rounded-2xl font-black text-sm shadow-xl shadow-brand/20 hover:scale-105 transition-all flex items-center gap-2 group"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5 group-hover:animate-pulse" /> GENERATE AI TEST</>}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {READING_TASKS.map(task => (
          <button 
            key={task.id} 
            onClick={() => handleSelectTask(task)}
            className="group bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 text-left hover:border-brand hover:shadow-2xl transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen className="w-32 h-32 text-brand" />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-brand-soft text-brand rounded-full text-[10px] font-black uppercase tracking-widest">Academic Passage</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4 leading-tight group-hover:text-brand transition-colors">{task.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-8">
              {task.passage.substring(0, 150)}...
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Info className="w-4 h-4" /> {task.questions.length} Questions
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Clock className="w-4 h-4" /> 20 Mins
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <footer className="mt-20 p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 italic">Commercial Use Disclaimer</p>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic max-w-2xl mx-auto">
          All reading passages, questions, and scoring are AI-generated practice materials designed to reflect the IELTS Academic Reading format. This platform is not affiliated with or endorsed by IELTS, British Council, IDP, or Cambridge.
        </p>
      </footer>
    </div>
  );
};

export default ReadingSection;
