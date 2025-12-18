
import React, { useState, useEffect, useRef } from 'react';
import { WRITING_TASKS } from '../constants';
import { WritingTask, WritingFeedback, TaskType, Highlight, LanguagePoint, GroundingLink } from '../types';
import { evaluateWriting, getTaskResources, getLiveSuggestions } from '../services/geminiService';
import { saveSubmission, saveDraft, getDraft, clearDraft } from '../services/storageService';
import { 
  BarChart, Bar, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Send, CheckCircle2, ChevronRight, AlertCircle, Loader2, 
  BookOpen, Sparkles, GraduationCap, ArrowUpCircle, Info,
  LineChart as LineChartIcon, Mail, FileText, ClipboardCheck, Lightbulb,
  Table as TableIcon, ChartBar, Edit3, RotateCcw, PenTool, ExternalLink, Search, Globe, Cpu, Zap,
  Clock, Save, Trash2
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
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'task1' | 'task2'>('all');
  const [showDataTable, setShowDataTable] = useState(false);
  const [taskResources, setTaskResources] = useState<GroundingLink[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (selectedTask) {
      handleFetchResources();
      
      // Check for existing draft
      const draft = getDraft(selectedTask.id);
      if (draft && draft !== essay) {
        setShowDraftBanner(true);
      } else {
        setShowDraftBanner(false);
      }
    }
  }, [selectedTask]);

  // Auto-save logic
  useEffect(() => {
    if (selectedTask && essay.length > 0) {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      
      autoSaveTimerRef.current = setInterval(() => {
        handleSaveDraft();
      }, 30000); // Auto-save every 30 seconds
    }
    
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [essay, selectedTask]);

  // Debounced Live Suggestions
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
      } catch (err) {
        console.error('Live suggestion failed');
      } finally {
        setIsLiveLoading(false);
      }
    }, 3000); // 3-second debounce

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [essay, selectedTask]);

  const handleFetchResources = async () => {
    if (!selectedTask) return;
    setIsLoadingResources(true);
    try {
      const links = await getTaskResources(selectedTask.question);
      setTaskResources(links);
    } catch (err) {
      console.error('Failed to fetch resources');
    } finally {
      setIsLoadingResources(false);
    }
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
      setFeedback(result);
      setActiveView('feedback');
      
      // Clear draft on successful submission
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
    } catch (err) {
      setError('Evaluation failed. Please try again.');
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  if (feedback) {
    const isTask1 = selectedTask?.type.includes('TASK_1');
    const module = feedback.learningModule;

    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl">
            <button onClick={() => setActiveView('feedback')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'feedback' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>My Feedback</button>
            <button onClick={() => setActiveView('model')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'model' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Study Module</button>
          </div>
          <button onClick={() => setFeedback(null)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
            <Edit3 className="w-4 h-4" /> Revise Essay
          </button>
        </div>

        {activeView === 'feedback' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            {/* Primary Scores */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-12 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-4xl font-black mb-1">Band Score: {feedback.overall}</h2>
                    <p className="text-blue-100 font-medium">Expert examiner evaluation grounded in Academic Standards.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center min-w-[120px]">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 text-blue-200" />
                    <span className="text-[10px] font-bold uppercase tracking-widest block opacity-70">Status</span>
                    <span className="text-sm font-bold">QUALIFIED</span>
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
                      <div key={item.label} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                        <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">{item.label}</p>
                        <p className="text-3xl font-black text-slate-800">{item.score}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-10">
                    <section>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        Key Strengths
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {feedback.strengths.map((s, i) => (
                          <div key={i} className="text-sm text-slate-600 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                            <span className="text-emerald-500 font-bold">•</span>
                            {s}
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        Critical Improvement Areas
                      </h3>
                      <div className="space-y-4">
                        {feedback.improvements.map((imp, i) => (
                          <div key={i} className="text-sm text-slate-600 bg-amber-50/30 p-5 rounded-2xl border border-amber-100 flex gap-4">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">
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
              <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl sticky top-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-600 p-3 rounded-2xl">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Reference Sources</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Grounded Analysis</p>
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
                        className="block bg-white/5 p-5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Resource {idx + 1}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">{link.title}</h4>
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
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                  >
                    <PenTool className="w-4 h-4" /> REWRITE NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            {/* Model Answer / Module Views */}
            {module && (
               <div className="max-w-4xl mx-auto space-y-10">
                 <div className="bg-blue-600 p-10 rounded-[40px] text-white shadow-xl">
                    <h3 className="text-3xl font-black mb-4">{module.taskIdentification.type}</h3>
                    <p className="text-blue-100 text-lg leading-relaxed">{module.taskIdentification.trends}</p>
                 </div>
                 <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-900 px-10 py-6 text-white font-black text-sm tracking-widest uppercase">Expert Sample Answer (Band 8.5+)</div>
                    <div className="p-10 bg-slate-50 italic text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {module.sampleAnswer}
                    </div>
                 </div>
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
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Writing Masterclass</h1>
          <p className="text-slate-500 text-lg">Harness real-time AI guidance and elite Academic resources.</p>
        </header>
        <div className="flex gap-2 mb-10 bg-slate-200 p-1 rounded-[24px] w-fit shadow-inner">
          {['all', 'task1', 'task2'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat as any)} 
              className={`px-8 py-3 rounded-[20px] text-sm font-black transition-all ${
                activeCategory === cat ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500'
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
              className="bg-white p-8 rounded-[32px] border border-slate-200 text-left hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/5 transition-all flex flex-col group h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">{task.topic}</span>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <p className="text-slate-800 font-bold text-lg leading-snug line-clamp-3 mb-6 flex-1">"{task.question}"</p>
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
          className="text-slate-500 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors group"
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
           <div className="bg-white px-6 py-2 rounded-2xl border border-slate-200 font-black text-blue-600 shadow-sm flex items-center gap-2">
             <Zap className="w-4 h-4" />
             {wordCount} Words
           </div>
        </div>
      </div>

      {showDraftBanner && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Incomplete Draft Found</p>
              <p className="text-xs text-amber-700">Would you like to resume where you left off?</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDiscardDraft}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={handleLoadDraft}
              className="px-6 py-2 bg-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all active:scale-95"
            >
              Load Draft
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 pb-10">
        {/* Left Column: Stimulus */}
        <div className="lg:col-span-3 flex flex-col gap-6 sticky top-0 h-fit">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white text-[10px] font-black tracking-widest flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-400" /> TASK PROMPT
            </div>
            <div className="p-6">
              <p className="text-slate-700 text-sm leading-relaxed font-bold italic mb-6">"{selectedTask.question}"</p>
              {selectedTask.chartConfig && (
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Task1Chart config={selectedTask.chartConfig} />
                 </div>
              )}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-[32px] p-6">
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
                   <a key={i} href={res.uri} target="_blank" rel="noopener noreferrer" className="block bg-white p-4 rounded-2xl border border-emerald-100 hover:border-emerald-400 transition-all group">
                     <h5 className="text-[10px] font-black text-slate-800 line-clamp-1 group-hover:text-emerald-600">{res.title}</h5>
                     <span className="text-[8px] text-slate-400 font-bold mt-1 block uppercase">{new URL(res.uri).hostname}</span>
                   </a>
                 ))
               )}
             </div>
          </div>
        </div>

        {/* Center Column: Editor */}
        <div className="lg:col-span-6 flex flex-col bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden focus-within:border-blue-400 transition-all relative">
          <div className="bg-slate-50 px-10 py-5 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
               <PenTool className="w-4 h-4 text-blue-600" /> DRAFTING AREA
            </h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleSaveDraft}
                className="text-[10px] text-slate-500 font-black tracking-widest flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                <Save className="w-3 h-3" />
                SAVE DRAFT
              </button>
              <span className="text-[10px] text-slate-400 font-black tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                AUTOSAVE ACTIVE
              </span>
            </div>
          </div>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={isGrading}
            spellCheck={false}
            placeholder="Structure your response: Introduction, Overview, Details, Conclusion..."
            className="flex-1 p-10 text-xl leading-relaxed text-slate-700 focus:outline-none resize-none placeholder:text-slate-200 min-h-[500px]"
          />
          <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col gap-4">
            {error && <div className="text-red-500 text-sm font-black flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
            <div className="flex gap-4">
              <button 
                onClick={handleSubmit} 
                disabled={isGrading || !essay.trim()} 
                className={`flex-1 py-5 rounded-[24px] font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl ${
                  isGrading || !essay.trim() 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-95'
                }`}
              >
                {isGrading ? <><Loader2 className="w-6 h-6 animate-spin" /> GENERATING BAND SCORE...</> : <><Send className="w-6 h-6" /> ANALYZE RESPONSE</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Copilot */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-[32px] p-8 min-h-[400px] flex flex-col">
             <div className="flex items-center gap-3 mb-8">
               <div className="bg-blue-600 p-2 rounded-xl">
                 <Cpu className="w-5 h-5 text-white" />
               </div>
               <div>
                 <h4 className="text-sm font-black text-blue-900">AI COPILOT</h4>
                 <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Live Coaching</p>
               </div>
             </div>

             <div className="flex-1 space-y-6">
                {isLiveLoading ? (
                  <div className="space-y-4">
                    <div className="h-12 bg-blue-100 rounded-2xl animate-pulse"></div>
                    <div className="h-12 bg-blue-100 rounded-2xl animate-pulse w-3/4"></div>
                  </div>
                ) : essay.length > 50 ? (
                  liveSuggestions.length > 0 ? (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                       {liveSuggestions.map((tip, i) => (
                         <div key={i} className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex gap-3 group hover:border-blue-400 transition-all">
                           <div className="mt-1"><Zap className="w-3 h-3 text-blue-500" /></div>
                           <p className="text-xs font-bold text-blue-900 leading-snug">{tip}</p>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <p className="text-xs text-blue-400 italic text-center py-10 leading-relaxed px-4">AI is observing... Keep writing to get structural hints.</p>
                  )
                ) : (
                  <div className="text-center py-10 px-4">
                    <Lightbulb className="w-10 h-10 text-blue-200 mx-auto mb-4" />
                    <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider mb-2">Write 50+ words</p>
                    <p className="text-xs text-blue-800/60 leading-relaxed font-medium">Start drafting to activate real-time tactical suggestions.</p>
                  </div>
                )}
             </div>

             <div className="mt-8 pt-8 border-t border-blue-100">
                <div className="bg-blue-100/50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">9.0</div>
                  <p className="text-[10px] font-bold text-blue-900 leading-tight">Focus on using complex transitions to increase Cohesion score.</p>
                </div>
             </div>
          </div>
          
          <div className="bg-slate-100 p-8 rounded-[32px] border border-slate-200">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Writing Tip</h4>
             <p className="text-xs text-slate-600 leading-relaxed font-bold">
               {selectedTask.type.includes('TASK_1') 
                 ? "Avoid listing every number. Use terms like 'peaked at', 'leveled off', or 'significant fluctuation'." 
                 : "Ensure each body paragraph has a clear topic sentence and is developed with a logical example."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingSection;
