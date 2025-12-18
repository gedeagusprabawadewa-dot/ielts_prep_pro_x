
import React, { useState, useEffect, useRef } from 'react';
import { WRITING_TASKS } from '../constants';
import { WritingTask, WritingFeedback, TaskType, Highlight, LanguagePoint, GroundingLink } from '../types';
import { evaluateWriting, getTaskResources, getLiveSuggestions } from '../services/geminiService';
import { saveSubmission, saveDraft, getDraft, clearDraft } from '../services/storageService';
import { 
  BarChart, Bar, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
// Added Copy and Languages to the imports from lucide-react
import { 
  Send, CheckCircle2, ChevronRight, AlertCircle, Loader2, 
  BookOpen, Sparkles, GraduationCap, ArrowUpCircle, Info,
  LineChart as LineChartIcon, Mail, FileText, ClipboardCheck, Lightbulb,
  Table as TableIcon, ChartBar, Edit3, RotateCcw, PenTool, ExternalLink, Search, Globe, Cpu, Zap,
  Clock, Save, Trash2, Book, Target, Award, ShieldAlert, Check, TrendingUp, Presentation,
  Trophy, ArrowRight, WifiOff, Settings, Copy, Languages
} from 'lucide-react';

const Task1Chart: React.FC<{ config: NonNullable<WritingTask['chartConfig']> }> = ({ config }) => {
  const colors = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  
  if (config.type === 'bar') {
    return (
      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={config.xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            {config.dataKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (config.type === 'line') {
    return (
      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={config.xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            {config.dataKeys.map((key, idx) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            ))}
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return null;
};

const WritingSection: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<WritingTask | null>(null);
  const [essay, setEssay] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [activeView, setActiveView] = useState<'feedback' | 'model'>('feedback');
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'task1' | 'task2'>('all');
  const [taskResources, setTaskResources] = useState<GroundingLink[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (selectedTask) {
      handleFetchResources();
      const draft = getDraft(selectedTask.id);
      if (draft && draft !== essay) setShowDraftBanner(true);
      else setShowDraftBanner(false);
    }
  }, [selectedTask]);

  useEffect(() => {
    if (selectedTask && essay.length > 0) {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setInterval(() => handleSaveDraft(), 30000);
    }
    return () => { if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current); };
  }, [essay, selectedTask]);

  useEffect(() => {
    if (essay.length < 50 || !selectedTask) {
      setLiveSuggestions([]);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setIsLiveLoading(true);
      try {
        const suggestions = await getLiveSuggestions(essay, selectedTask.question);
        setLiveSuggestions(suggestions);
      } catch (err) { console.error('Live suggestion failed'); }
      finally { setIsLiveLoading(false); }
    }, 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [essay, selectedTask]);

  const handleFetchResources = async () => {
    if (!selectedTask) return;
    setIsLoadingResources(true);
    try {
      const links = await getTaskResources(selectedTask.question);
      setTaskResources(links);
    } catch (err) { console.error('Failed to fetch resources'); }
    finally { setIsLoadingResources(false); }
  };

  const handleSaveDraft = () => {
    if (selectedTask && essay) {
      saveDraft(selectedTask.id, essay);
      setLastSaved(new Date());
    }
  };

  const handleLoadDraft = () => {
    if (selectedTask) {
      const draft = getDraft(selectedTask.id);
      if (draft) {
        setEssay(draft);
        setShowDraftBanner(false);
      }
    }
  };

  const handleDiscardDraft = () => {
    if (selectedTask) {
      clearDraft(selectedTask.id);
      setShowDraftBanner(false);
    }
  };

  const handleCopyModelAnswer = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    const minWords = selectedTask.type === TaskType.WRITING_TASK_2 ? 50 : 30;
    if (wordCount < minWords) {
      setError(`Please write at least ${minWords} words before submitting.`);
      return;
    }

    setIsGrading(true);
    setError(null);
    try {
      const result = await evaluateWriting(essay, selectedTask.type);
      
      if (!result || typeof result.overall === 'undefined') {
        throw new Error('MALFORMED_RESPONSE');
      }

      setFeedback(result);
      setActiveView('feedback');
      clearDraft(selectedTask.id);
      saveSubmission({
        id: Math.random().toString(36).substr(2, 9),
        type: selectedTask.type,
        taskId: selectedTask.id,
        content: essay,
        feedback: result,
        createdAt: new Date().toISOString(),
        wordCount
      });
    } catch (err: any) {
      let message = 'Evaluation failed. Please try again.';
      
      // Heuristic for error categorization
      const errStr = String(err).toLowerCase();
      if (!navigator.onLine || errStr.includes('network') || errStr.includes('fetch')) {
        message = 'Connection lost. Please check your internet and try again.';
      } else if (errStr.includes('403') || errStr.includes('key')) {
        message = 'API Authentication Error. This is likely a configuration issue with the server.';
      } else if (errStr.includes('malformed') || errStr.includes('json')) {
        message = 'The AI returned a response that couldn\'t be parsed. Please try a different approach or rewrite some parts.';
      } else if (errStr.includes('429')) {
        message = 'Rate limit exceeded. Please wait a moment before trying again.';
      }

      setError(message);
      console.error('Submission error:', err);
    } finally {
      setIsGrading(false);
    }
  };

  if (feedback) {
    const isTask1 = selectedTask?.type.includes('TASK_1');
    const module = feedback.learningModule;

    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveView('feedback')} 
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeView === 'feedback' ? 'bg-white dark:bg-slate-700 text-brand shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Award className="w-4 h-4" /> My Feedback
            </button>
            <button 
              onClick={() => setActiveView('model')} 
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeView === 'model' ? 'bg-white dark:bg-slate-700 text-brand shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Book className="w-4 h-4" /> Study Module
            </button>
          </div>
          <button onClick={() => setFeedback(null)} className="flex items-center gap-2 px-6 py-3 bg-brand-soft text-brand rounded-2xl text-sm font-black hover:opacity-80 transition-all shadow-sm">
            <Edit3 className="w-4 h-4" /> Revise Essay
          </button>
        </div>

        {activeView === 'feedback' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            {/* Primary Scores */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-brand px-10 py-12 text-white flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Trophy className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-4xl font-black mb-1">Band Score: {feedback.overall}</h2>
                    <p className="text-white/80 font-medium">Expert evaluation grounded in Cambridge Standards.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center min-w-[120px] relative z-10">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 text-white/50" />
                    <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">Status</span>
                    <span className="text-sm font-black">QUALIFIED</span>
                  </div>
                </div>
                <div className="p-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {[
                      { label: isTask1 ? 'Task Achievement' : 'Task Response', score: feedback.task_response },
                      { label: 'Cohesion', score: feedback.coherence },
                      { label: 'Lexical', score: feedback.lexical },
                      { label: 'Grammar', score: feedback.grammar }
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-brand transition-all">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black mb-1 uppercase tracking-widest">{item.label}</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{item.score}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-10">
                    <section>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        Key Strengths
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {feedback.strengths.map((s, i) => (
                          <div key={i} className="text-sm text-slate-600 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex gap-3">
                            <span className="text-emerald-500 font-bold">•</span>
                            {s}
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        Critical Improvement Areas
                      </h3>
                      <div className="space-y-4">
                        {feedback.improvements.map((imp, i) => (
                          <div key={i} className="text-sm text-slate-600 dark:text-slate-300 bg-amber-50/30 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center text-[10px] font-black">
                              {i+1}
                            </div>
                            {imp}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Resources */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 dark:bg-black rounded-[40px] p-8 text-white shadow-xl sticky top-8 border border-white/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-brand p-3 rounded-2xl">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Reference Sources</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Grounded Analysis</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {feedback.groundingLinks && feedback.groundingLinks.length > 0 ? (
                    feedback.groundingLinks.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block bg-white/5 p-5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-brand transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Resource {idx + 1}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-white transition-colors">{link.title}</h4>
                        <p className="mt-3 text-[10px] text-slate-500 truncate">{new URL(link.uri).hostname}</p>
                      </a>
                    ))
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl">
                      <p className="text-xs text-slate-500 italic">No external links found.</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <button 
                    onClick={() => setFeedback(null)}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-brand-soft hover:text-brand transition-all flex items-center justify-center gap-2"
                  >
                    <PenTool className="w-4 h-4" /> REWRITE NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-20 animate-in fade-in zoom-in-95 duration-700">
            {module ? (
               <div className="max-w-5xl mx-auto space-y-12">
                 {/* Identification Header */}
                 <div className="bg-brand p-12 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                      <Presentation className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">Mastery Report</div>
                      </div>
                      <h3 className="text-4xl font-black mb-6 leading-tight">{module.taskIdentification.type}</h3>
                      <div className="flex items-start gap-4 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                        <TrendingUp className="w-6 h-6 text-white shrink-0 mt-1" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Key Trend Analysis</p>
                          <p className="text-lg font-medium leading-relaxed">{module.taskIdentification.trends}</p>
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Sample Answer and Scores */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                      <div className="bg-slate-900 px-10 py-6 text-white font-black text-xs tracking-widest uppercase flex items-center justify-between">
                        <span>Expert Sample Answer (Band 8.5+)</span>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleCopyModelAnswer(module.sampleAnswer)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 text-[10px] font-black"
                          >
                            {copySuccess ? <><Check className="w-3 h-3 text-emerald-400" /> COPIED</> : <><Copy className="w-3 h-3" /> COPY TEXT</>}
                          </button>
                          <Award className="w-5 h-5 text-brand" />
                        </div>
                      </div>
                      <div className="p-10 bg-slate-50 dark:bg-slate-800/20 italic text-xl leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap flex-1">
                        {module.sampleAnswer}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score Breakdown</h4>
                      {[
                        { label: 'Task Achievement', text: module.scoreExplanation.ta },
                        { label: 'Coherence & Cohesion', text: module.scoreExplanation.cc },
                        { label: 'Lexical Resource', text: module.scoreExplanation.lr },
                        { label: 'Grammatical Range', text: module.scoreExplanation.gra }
                      ].map((item, i) => (
                        <div key={i} className="pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <p className="text-xs font-black text-brand mb-1 uppercase tracking-tight">{item.label}</p>
                          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">{item.text}</p>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Key Vocabulary Section */}
                 {module.keyVocabulary && module.keyVocabulary.length > 0 && (
                   <section className="space-y-6">
                     <h3 className="text-xl font-black flex items-center gap-3">
                       <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                         <Languages className="w-5 h-5" />
                       </div>
                       Key Vocabulary Vault
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       {module.keyVocabulary.map((item, i) => (
                         <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand transition-all flex flex-col h-full">
                           <p className="text-base font-black text-brand mb-2">{item.word}</p>
                           <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.explanation}</p>
                         </div>
                       ))}
                     </div>
                   </section>
                 )}

                 {/* Improvement Guide */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-6">
                      <h3 className="text-xl font-black flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-soft text-brand flex items-center justify-center">
                          <Zap className="w-5 h-5" />
                        </div>
                        Language Power-ups
                      </h3>
                      <div className="grid gap-4">
                        {module.improvementGuide.language.map((lang, i) => (
                          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 hover:border-brand transition-all group">
                             <p className="text-lg font-black text-slate-800 dark:text-white mb-2 group-hover:text-brand transition-colors">{lang.word}</p>
                             <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{lang.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h3 className="text-xl font-black flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        Examiner's Warning
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[32px] border border-amber-100 dark:border-amber-900/20">
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">Common Pitfalls</h4>
                          <ul className="space-y-3">
                            {module.improvementGuide.commonMistakes.map((mistake, i) => (
                              <li key={i} className="text-sm text-amber-900 dark:text-amber-400 font-bold flex gap-3">
                                <span className="text-amber-300">✕</span> {mistake}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-900/20">
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Tactical Tips</h4>
                          <ul className="space-y-3">
                            {module.improvementGuide.tips.map((tip, i) => (
                              <li key={i} className="text-sm text-emerald-900 dark:text-amber-400 font-bold flex gap-3">
                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </section>
                 </div>

                 {/* Band Upgrade Laboratory */}
                 <section className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      Sentence Upgrade Lab
                    </h3>
                    <div className="space-y-6">
                      {module.bandUpgrades.map((upgrade, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                           <div className="grid grid-cols-1 md:grid-cols-2">
                              <div className="p-8 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Basic (Band 5-6)</p>
                                 <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">"{upgrade.low}"</p>
                              </div>
                              <div className="p-8 bg-brand-soft text-brand">
                                 <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Professional (Band 8+)</p>
                                 <p className="text-lg font-black leading-relaxed">"{upgrade.high}"</p>
                              </div>
                           </div>
                           <div className="px-8 py-4 bg-slate-900 dark:bg-black text-[10px] font-bold text-slate-400 flex items-center gap-3">
                              <Info className="w-3 h-3 text-brand" />
                              Linguistic Shift: {upgrade.explanation}
                           </div>
                        </div>
                      ))}
                    </div>
                 </section>

                 {/* Examiner Corner */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800">
                       <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Target className="w-5 h-5 text-brand" /> Examiner Notes
                       </h4>
                       <div className="space-y-4">
                          {module.examinerNotes.map((note, i) => (
                            <p key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium pl-6 relative">
                              <span className="absolute left-0 top-0 text-brand font-black">/</span> {note}
                            </p>
                          ))}
                       </div>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl flex flex-col justify-center">
                       <h4 className="text-sm font-black uppercase tracking-widest mb-4 text-brand">Next Step: Rapid Fire Practice</h4>
                       <p className="text-lg font-bold mb-8 leading-relaxed opacity-80">{module.practiceTask}</p>
                       <button onClick={() => setFeedback(null)} className="w-full py-5 bg-brand text-white rounded-3xl font-black hover:bg-brand-hover transition-all flex items-center justify-center gap-3 group">
                         Start Practice Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 </div>
               </div>
            ) : (
               <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white">Study Module Unavailable</h3>
                 <p className="text-slate-500 dark:text-slate-400">Detailed modules are currently generated only for Writing Task 1 evaluations. Task 2 support is coming soon.</p>
                 <button onClick={() => setActiveView('feedback')} className="px-8 py-3 bg-brand text-white rounded-2xl font-black text-sm">Return to Feedback</button>
               </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Writing Masterclass</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Harness real-time AI guidance and elite Academic resources.</p>
        </header>
        <div className="flex gap-2 mb-10 bg-slate-200 dark:bg-slate-800 p-1 rounded-[24px] w-fit shadow-inner">
          {['all', 'task1', 'task2'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat as any)} 
              className={`px-8 py-3 rounded-[20px] text-sm font-black transition-all ${
                activeCategory === cat ? 'bg-white dark:bg-slate-700 text-brand shadow-xl' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Modules' : cat === 'task1' ? 'Task 1 (Data)' : 'Task 2 (Essays)'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WRITING_TASKS.filter(t => activeCategory === 'all' || (activeCategory === 'task1' ? t.type.includes('TASK_1') : t.type === TaskType.WRITING_TASK_2)).map((task) => (
            <button 
              key={task.id} 
              onClick={() => setSelectedTask(task)} 
              className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 text-left hover:border-brand hover:shadow-2xl hover:shadow-brand/5 transition-all flex flex-col group h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-brand bg-brand-soft px-3 py-1 rounded-full uppercase tracking-widest">{task.topic}</span>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <p className="text-slate-800 dark:text-white font-bold text-lg leading-snug line-clamp-3 mb-6 flex-1">"{task.question}"</p>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock className="w-4 h-4" /> {task.type.includes('TASK_1') ? '20 Mins' : '40 Mins'}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto flex flex-col h-full animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => setSelectedTask(null)} 
          className="text-slate-500 font-bold flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
          Task Library
        </button>
        <div className="flex items-center gap-4">
           {lastSaved && (
             <span className="text-[10px] font-bold text-slate-400 animate-in fade-in slide-in-from-right-2">
               Auto-saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
           )}
           <div className="bg-white dark:bg-slate-900 px-6 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-brand shadow-sm flex items-center gap-2">
             <Zap className="w-4 h-4" />
             {wordCount} Words
           </div>
        </div>
      </div>

      {showDraftBanner && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-xl text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-400">Incomplete Draft Found</p>
              <p className="text-xs text-amber-700 dark:text-amber-500">Would you like to resume where you left off?</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDiscardDraft} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors">Discard</button>
            <button onClick={handleLoadDraft} className="px-6 py-2 bg-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all active:scale-95">Load Draft</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 pb-10">
        <div className="lg:col-span-3 flex flex-col gap-6 sticky top-0 h-fit">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-900 dark:bg-black px-6 py-4 text-white text-[10px] font-black tracking-widest flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-brand" /> TASK PROMPT
            </div>
            <div className="p-6">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-bold italic mb-6">"{selectedTask.question}"</p>
              {selectedTask.chartConfig && (
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Task1Chart config={selectedTask.chartConfig} />
                 </div>
              )}
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-[32px] p-6">
             <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Globe className="w-4 h-4" /> Reference Links
             </h4>
             <div className="space-y-3">
               {isLoadingResources ? (
                 <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold py-4">
                   <Loader2 className="w-3 h-3 animate-spin" /> Fetching real-world samples...
                 </div>
               ) : (
                 taskResources.slice(0, 3).map((res, i) => (
                   <a key={i} href={res.uri} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 hover:border-emerald-400 transition-all group">
                     <h5 className="text-[10px] font-black text-slate-800 dark:text-white line-clamp-1 group-hover:text-emerald-600">{res.title}</h5>
                     <span className="text-[8px] text-slate-400 font-bold mt-1 block uppercase">{new URL(res.uri).hostname}</span>
                   </a>
                 ))
               )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden focus-within:border-brand transition-all relative">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-10 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
               <PenTool className="w-4 h-4 text-brand" /> DRAFTING AREA
            </h3>
            <div className="flex items-center gap-4">
              <button onClick={handleSaveDraft} className="text-[10px] text-slate-500 font-black tracking-widest flex items-center gap-2 hover:text-brand transition-colors"><Save className="w-3 h-3" /> SAVE DRAFT</button>
              <span className="text-[10px] text-slate-400 font-black tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> AUTOSAVE ACTIVE</span>
            </div>
          </div>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={isGrading}
            spellCheck={false}
            placeholder="Structure your response: Introduction, Overview, Details, Conclusion..."
            className="flex-1 p-10 text-xl leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent focus:outline-none resize-none placeholder:text-slate-200 dark:placeholder:text-slate-700 min-h-[500px]"
          />
          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
            {error && (
              <div className="animate-in slide-in-from-bottom-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-4 rounded-2xl flex items-start gap-3">
                <div className="mt-0.5">
                  {error.includes('Connection') ? <WifiOff className="w-4 h-4 text-red-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                </div>
                <div>
                   <p className="text-xs font-black text-red-600 uppercase tracking-tight mb-1">Evaluation Error</p>
                   <p className="text-xs text-red-700 dark:text-red-400 font-medium leading-relaxed">{error}</p>
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <button 
                onClick={handleSubmit} 
                disabled={isGrading || !essay.trim()} 
                className={`flex-1 py-5 rounded-[24px] font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl ${isGrading || !essay.trim() ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none' : 'bg-brand text-white hover:opacity-90 shadow-brand/20 active:scale-95'}`}
              >
                {isGrading ? <><Loader2 className="w-6 h-6 animate-spin" /> GENERATING BAND SCORE...</> : <><Send className="w-6 h-6" /> ANALYZE RESPONSE</>}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-brand-soft border border-brand/20 rounded-[32px] p-8 min-h-[400px] flex flex-col">
             <div className="flex items-center gap-3 mb-8">
               <div className="bg-brand p-2 rounded-xl">
                 <Cpu className="w-5 h-5 text-white" />
               </div>
               <div>
                 <h4 className="text-sm font-black text-brand">AI COPILOT</h4>
                 <p className="text-[9px] font-bold text-brand/50 uppercase tracking-widest">Live Coaching</p>
               </div>
             </div>
             <div className="flex-1 space-y-6">
                {isLiveLoading ? (
                  <div className="space-y-4"><div className="h-12 bg-brand/5 rounded-2xl animate-pulse"></div><div className="h-12 bg-brand/5 rounded-2xl animate-pulse w-3/4"></div></div>
                ) : essay.length > 50 ? (
                  liveSuggestions.length > 0 ? (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                       {liveSuggestions.map((tip, i) => (
                         <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-brand/10 shadow-sm flex gap-3 group hover:border-brand transition-all">
                           <div className="mt-1"><Zap className="w-3 h-3 text-brand" /></div>
                           <p className="text-xs font-bold text-brand dark:text-slate-300 leading-snug">{tip}</p>
                         </div>
                       ))}
                    </div>
                  ) : <p className="text-xs text-brand/50 italic text-center py-10 leading-relaxed px-4">AI is observing... Keep writing to get structural hints.</p>
                ) : (
                  <div className="text-center py-10 px-4">
                    <Lightbulb className="w-10 h-10 text-brand/20 mx-auto mb-4" />
                    <p className="text-[11px] text-brand/50 font-bold uppercase tracking-wider mb-2">Write 50+ words</p>
                    <p className="text-xs text-brand/60 leading-relaxed font-medium">Start drafting to activate real-time tactical suggestions.</p>
                  </div>
                )}
             </div>
             <div className="mt-8 pt-8 border-t border-brand/10">
                <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-black text-xs">9.0</div>
                  <p className="text-[10px] font-bold text-brand leading-tight">Focus on using complex transitions to increase Cohesion score.</p>
                </div>
             </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800">
             <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4">Writing Tip</h4>
             <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
               {selectedTask.type.includes('TASK_1') ? "Avoid listing every number. Use terms like 'peaked at', 'leveled off', or 'significant fluctuation'." : "Ensure each body paragraph has a clear topic sentence and is developed with a logical example."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingSection;
