
import React, { useState, useEffect, useRef } from 'react';
import { WRITING_TASKS } from '../constants';
import { WritingTask, WritingFeedback, TaskType, Highlight, LanguagePoint, GroundingLink, InlineHighlight } from '../types';
import { evaluateWriting, getTaskResources, getLiveSuggestions, checkVocabUsage } from '../services/geminiService';
import { saveSubmission, saveDraft, getDraft, clearDraft } from '../services/storageService';
import { 
  BarChart, Bar, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  Send, CheckCircle2, ChevronRight, AlertCircle, Loader2, 
  BookOpen, Sparkles, GraduationCap, ArrowUpCircle, Info,
  LineChart as LineChartIcon, Mail, FileText, ClipboardCheck, Lightbulb,
  Table as TableIcon, ChartBar, Edit3, RotateCcw, PenTool, ExternalLink, Search, Globe, Cpu, Zap,
  Clock, Save, Trash2, Book, Target, Award, ShieldAlert, Check, TrendingUp, Presentation,
  Trophy, ArrowRight, WifiOff, Settings, Copy, Languages, PieChart as PieChartIcon, Map as MapIcon, RefreshCw, ChevronLeft,
  X, History, SearchCheck, MessageSquareWarning, MessageCircle, Pen, ArrowDown
} from 'lucide-react';

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

const Task1Table: React.FC<{ config: NonNullable<WritingTask['chartConfig']> }> = ({ config }) => {
  return (
    <div className="mt-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <table className="w-full text-left border-collapse bg-white dark:bg-slate-900 min-w-[400px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-700">{config.xAxisKey}</th>
            {config.dataKeys.map(key => (
              <th key={key} className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-700">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {config.data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-xs">
              <td className="px-4 py-3 font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">{row.name}</td>
              {config.dataKeys.map(key => (
                <td key={key} className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                   {typeof row[key] === 'number' ? `${row[key]}${config.xAxisKey.includes('Percent') ? '%' : ''}` : row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Task1Process: React.FC<{ config: NonNullable<WritingTask['chartConfig']> }> = ({ config }) => {
  return (
    <div className="mt-6 space-y-3">
      {config.data.map((step, i) => (
        <React.Fragment key={i}>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4 hover:border-brand transition-all group">
            <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-black text-[10px] shrink-0 group-hover:scale-110 transition-transform">
              {i + 1}
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white mb-0.5 uppercase tracking-tight">{step.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">{step.Action}</p>
            </div>
          </div>
          {i < config.data.length - 1 && (
            <div className="flex justify-center py-1">
              <ArrowDown className="w-4 h-4 text-slate-300 animate-bounce" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const Task1Chart: React.FC<{ config: NonNullable<WritingTask['chartConfig']> }> = ({ config }) => {
  if (config.type === 'table') {
    return <Task1Table config={config} />;
  }

  if (config.type === 'process') {
    return <Task1Process config={config} />;
  }

  return (
    <div className="h-[220px] sm:h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        {config.type === 'pie' ? (
          <PieChart>
            <Pie data={config.data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
              {config.data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <ReTooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} formatter={(value) => `${value}%`} />
            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
          </PieChart>
        ) : config.type === 'bar' ? (
          <BarChart data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={config.xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <ReTooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
            {config.dataKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        ) : (
          <ReLineChart data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={config.xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <ReTooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
            {config.dataKeys.map((key, idx) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ))}
          </ReLineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

interface EssayAnnotatorProps {
  text: string;
  highlights: InlineHighlight[];
}

const EssayAnnotator: React.FC<EssayAnnotatorProps> = ({ text, highlights }) => {
  const [hoveredHighlight, setHoveredHighlight] = useState<InlineHighlight | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!highlights || highlights.length === 0) {
    return <p className="text-base sm:text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-serif whitespace-pre-wrap">{text}</p>;
  }

  const sortedHighlights = [...highlights].sort((a, b) => text.indexOf(a.phrase) - text.indexOf(b.phrase));

  const renderTextWithHighlights = () => {
    let lastIndex = 0;
    const parts = [];

    sortedHighlights.forEach((highlight, idx) => {
      const index = text.indexOf(highlight.phrase, lastIndex);
      if (index === -1) return;

      if (index > lastIndex) {
        parts.push(text.substring(lastIndex, index));
      }

      parts.push(
        <span
          key={`highlight-${idx}`}
          className={`relative cursor-help border-b-2 transition-all px-0.5 rounded ${
            highlight.type === 'grammar' ? 'border-rose-400 bg-rose-400/10' : 
            highlight.type === 'vocab' ? 'border-amber-400 bg-amber-400/10' : 
            'border-blue-400 bg-blue-400/10'
          }`}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredHighlight(highlight);
            setTooltipPos({ x: rect.left, y: rect.top - 10 });
          }}
          onMouseLeave={() => setHoveredHighlight(null)}
          onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             setHoveredHighlight(highlight);
             setTooltipPos({ x: rect.left, y: rect.top - 10 });
          }}
        >
          {highlight.phrase}
        </span>
      );

      lastIndex = index + highlight.phrase.length;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="relative">
      <div className="text-base sm:text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-serif whitespace-pre-wrap">
        {renderTextWithHighlights()}
      </div>

      {hoveredHighlight && (
        <div 
          className="fixed z-[100] w-64 sm:w-72 p-5 sm:p-6 bg-slate-900 text-white rounded-3xl shadow-2xl border border-white/10 animate-in zoom-in-95"
          style={{ 
            left: `${Math.min(window.innerWidth - 280, Math.max(10, tooltipPos.x))}px`, 
            top: `${tooltipPos.y}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hoveredHighlight.type === 'grammar' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{hoveredHighlight.type} Analysis</p>
             </div>
             <button onClick={() => setHoveredHighlight(null)} className="p-1 hover:bg-white/10 rounded-lg sm:hidden"><X className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
             <div>
               <p className="text-[9px] font-black uppercase text-slate-500 mb-0.5">Observation</p>
               <p className="text-xs font-medium leading-relaxed">{hoveredHighlight.explanation}</p>
             </div>
             <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
               <p className="text-[9px] font-black uppercase text-emerald-500 mb-0.5">Correction</p>
               <p className="text-xs font-black text-white italic">"{hoveredHighlight.suggestion}"</p>
             </div>
          </div>
          <div className="absolute bottom-0 left-6 w-3 h-3 bg-slate-900 border-r border-b border-white/10 rotate-45 translate-y-1.5 hidden sm:block"></div>
        </div>
      )}
    </div>
  );
};

const VocabularyPractice: React.FC<{ words: LanguagePoint[] }> = ({ words }) => {
  const [practiceWords] = useState(() => words.slice(0, 3));
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { isCorrect: boolean; feedback: string; suggestion: string } | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleCheck = async (word: string) => {
    const sentence = inputs[word];
    if (!sentence || sentence.trim().length < 5) return;

    setLoading(prev => ({ ...prev, [word]: true }));
    try {
      const result = await checkVocabUsage(word, sentence);
      setResults(prev => ({ ...prev, [word]: result }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [word]: false }));
    }
  };

  return (
    <section className="space-y-6 mt-8 sm:mt-12 animate-in fade-in duration-700">
      <div className="flex items-end justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-xl sm:text-2xl font-black flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
            <Pen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          Practice
        </h3>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Application Challenge</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {practiceWords.map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl sm:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-brand/50">
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 bg-brand rounded-full"></div>
                  <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.word}</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                  {item.explanation}
                </p>
              </div>

              <div className="space-y-3">
                <textarea
                  value={inputs[item.word] || ''}
                  onChange={(e) => setInputs(prev => ({ ...prev, [item.word]: e.target.value }))}
                  placeholder={`Write a sentence using "${item.word}"...`}
                  className="w-full h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none transition-all"
                  disabled={loading[item.word]}
                />
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleCheck(item.word)}
                    disabled={loading[item.word] || !inputs[item.word]}
                    className="px-5 py-2.5 bg-brand text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-hover transition-all flex items-center gap-2"
                  >
                    {loading[item.word] ? <Loader2 className="w-3 h-3 animate-spin" /> : 'CHECK SENTENCE'}
                  </button>
                </div>

                {results[item.word] && (
                  <div className={`mt-3 p-5 rounded-2xl border animate-in slide-in-from-top-2 ${results[item.word]?.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${results[item.word]?.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {results[item.word]?.isCorrect ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">{results[item.word]?.feedback}</p>
                        {results[item.word]?.suggestion && (
                          <div className="pt-2 border-t border-black/5 dark:border-white/5">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Suggestion:</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 italic">"{results[item.word]?.suggestion}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
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
      if (draft && draft.trim() !== '' && draft !== essay) {
        setShowDraftBanner(true);
      } else {
        setShowDraftBanner(false);
      }
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
      if (!result || typeof result.overall === 'undefined') throw new Error('MALFORMED_RESPONSE');
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
      setError('Evaluation failed. Please check your internet and try again.');
    } finally {
      setIsGrading(false);
    }
  };

  if (feedback) {
    const isTask1 = selectedTask?.type.includes('TASK_1');
    const module = feedback.learningModule;

    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto">
            <button 
              onClick={() => setActiveView('feedback')} 
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeView === 'feedback' ? 'bg-white dark:bg-slate-700 text-brand shadow-md' : 'text-slate-500'}`}
            >
              <Award className="w-4 h-4" /> Feedback
            </button>
            <button 
              onClick={() => setActiveView('model')} 
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeView === 'model' ? 'bg-white dark:bg-slate-700 text-brand shadow-md' : 'text-slate-500'}`}
            >
              <Book className="w-4 h-4" /> Study
            </button>
          </div>
          <button onClick={() => setFeedback(null)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-soft text-brand rounded-2xl text-xs font-black hover:opacity-80 transition-all shadow-sm">
            <Edit3 className="w-4 h-4" /> Revise Essay
          </button>
        </div>

        {activeView === 'feedback' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-brand px-6 py-8 sm:px-10 sm:py-12 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10 hidden sm:block">
                    <Trophy className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-black mb-1">Band: {feedback.overall}</h2>
                    <p className="text-white/80 text-xs sm:text-sm font-medium">Expert evaluation grounded in Cambridge Standards.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 text-center min-w-[100px] relative z-10 self-end sm:self-center">
                    <span className="text-[8px] font-black uppercase tracking-widest block opacity-70">Status</span>
                    <span className="text-xs sm:text-sm font-black uppercase">Graded</span>
                  </div>
                </div>
                <div className="p-6 sm:p-10">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
                    {[
                      { label: isTask1 ? 'Achievement' : 'Response', score: feedback.task_response },
                      { label: 'Cohesion', score: feedback.coherence },
                      { label: 'Lexical', score: feedback.lexical },
                      { label: 'Grammar', score: feedback.grammar }
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 group transition-all">
                        <p className="text-[9px] text-slate-400 font-black mb-1 uppercase tracking-widest">{item.label}</p>
                        <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">{item.score}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-8 sm:space-y-10">
                    <section>
                      <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0">
                          <SearchCheck className="w-5 h-5" />
                        </div>
                        In-Text Analysis
                      </h3>
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-6 sm:p-10 rounded-3xl sm:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner">
                        <EssayAnnotator text={essay} highlights={feedback.inlineHighlights || []} />
                      </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths
                        </h3>
                        {feedback.strengths.map((s, i) => (
                          <div key={i} className="text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                            {s}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" /> Improvements
                        </h3>
                        {feedback.improvements.map((imp, i) => (
                          <div key={i} className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50/30 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                            {imp}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 dark:bg-black rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 text-white shadow-xl lg:sticky lg:top-8 border border-white/5">
                <h3 className="text-base font-bold mb-6 flex items-center gap-3">
                  <Globe className="w-5 h-5 text-brand" /> Study Resources
                </h3>
                <div className="space-y-3">
                  {feedback.groundingLinks?.map((link, idx) => (
                    <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="block bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-brand transition-all">
                      <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{link.title}</h4>
                      <p className="mt-1 text-[9px] text-slate-500 truncate">{new URL(link.uri).hostname}</p>
                    </a>
                  )) || <p className="text-[10px] text-slate-500 italic">Finding relevant links...</p>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95">
            {module ? (
               <div className="max-w-4xl mx-auto space-y-8">
                 <div className="bg-brand p-8 sm:p-12 rounded-[32px] sm:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                    <h3 className="text-2xl sm:text-4xl font-black mb-4 leading-tight">{module.taskIdentification.type}</h3>
                    <p className="text-sm sm:text-lg font-medium opacity-90">{module.taskIdentification.trends}</p>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[40px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                      <div className="bg-slate-900 px-6 py-4 text-white font-black text-[10px] tracking-widest uppercase flex items-center justify-between">
                        <span>Expert Model Answer</span>
                        <Award className="w-4 h-4 text-brand" />
                      </div>
                      <div className="p-6 sm:p-10 bg-slate-50 dark:bg-slate-800/20 italic text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {module.sampleAnswer}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Examiner Commentary</h4>
                      {[
                        { label: 'Task Achievement', text: module.scoreExplanation.ta },
                        { label: 'Coherence', text: module.scoreExplanation.cc },
                        { label: 'Lexical', text: module.scoreExplanation.lr },
                        { label: 'Grammar', text: module.scoreExplanation.gra }
                      ].map((item, i) => (
                        <div key={i} className="pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <p className="text-[10px] font-black text-brand mb-0.5 uppercase">{item.label}</p>
                          <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">{item.text}</p>
                        </div>
                      ))}
                    </div>
                 </div>

                 {module.keyVocabulary && <VocabularyPractice words={module.keyVocabulary} />}
               </div>
            ) : <p className="text-center py-20 text-slate-400">No study module available for this task.</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700 pb-10">
      {!selectedTask ? (
        <>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Writing</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg">Master IELTS Writing with real-time AI feedback.</p>
          </header>

          <div className="flex gap-1 mb-8 bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl w-fit">
            {(['all', 'task1', 'task2'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white dark:bg-slate-700 text-brand shadow-sm' : 'text-slate-500'}`}
              >
                {cat === 'all' ? 'All' : cat === 'task1' ? 'Task 1' : 'Task 2'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {WRITING_TASKS.filter(t => activeCategory === 'all' || (activeCategory === 'task1' ? t.type.includes('TASK_1') : t.type === TaskType.WRITING_TASK_2)).map(task => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="group bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl sm:rounded-[40px] border border-slate-200 dark:border-slate-800 text-left hover:border-brand transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-brand-soft text-brand rounded-full text-[9px] font-black uppercase tracking-widest">
                    {task.type.replace(/_/g, ' ').replace('WRITING TASK ', 'T')}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-brand group-hover:text-white transition-all">
                    <Edit3 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 leading-tight group-hover:text-brand transition-colors">{task.topic}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{task.question}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-160px)]">
          <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm">
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 font-bold text-xs flex items-center gap-2 hover:text-brand transition-all mb-6">
                <ChevronLeft className="w-4 h-4" /> All Topics
              </button>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-4 leading-tight">{selectedTask.question}</h2>
              {selectedTask.chartConfig && <Task1Chart config={selectedTask.chartConfig} />}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4 relative h-full">
            <div className="bg-white dark:bg-slate-900 flex-1 rounded-3xl sm:rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Words</p>
                     <p className={`text-sm font-black ${wordCount < (selectedTask.type === TaskType.WRITING_TASK_2 ? 250 : 150) ? 'text-amber-500' : 'text-brand'}`}>{wordCount}</p>
                   </div>
                   <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                   <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Min</p>
                     <p className="text-sm font-black text-slate-600 dark:text-slate-300">{selectedTask.type === TaskType.WRITING_TASK_2 ? '250' : '150'}</p>
                   </div>
                </div>
                {isLiveLoading && <Loader2 className="w-4 h-4 animate-spin text-brand" />}
              </div>
              
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Start typing your response here..."
                className="flex-1 w-full p-6 sm:p-10 resize-none focus:outline-none text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-200 bg-transparent font-serif"
                disabled={isGrading}
              />

              <div className="p-4 sm:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button onClick={() => setEssay('')} className="hidden sm:flex w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center text-slate-400 hover:text-red-500 shadow-sm">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isGrading || essay.length < 20}
                  className="w-full sm:w-auto px-10 py-4 bg-brand text-white rounded-[24px] font-black text-xs sm:text-sm flex items-center justify-center gap-3 shadow-2xl shadow-brand/20 active:scale-95 transition-all"
                >
                  {isGrading ? <><Loader2 className="w-5 h-5 animate-spin" /> ANALYZING...</> : <><CheckCircle2 className="w-5 h-5" /> SCORE NOW</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingSection;
