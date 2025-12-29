
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
    <div className="mt-6 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
      <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-700">{config.xAxisKey}</th>
            {config.dataKeys.map(key => (
              <th key={key} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-700">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {config.data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">{row.name}</td>
              {config.dataKeys.map(key => (
                <td key={key} className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
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
    <div className="mt-8 space-y-4">
      {config.data.map((step, i) => (
        <React.Fragment key={i}>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-5 hover:border-brand transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{step.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">{step.Action}</p>
            </div>
          </div>
          {i < config.data.length - 1 && (
            <div className="flex justify-center py-2">
              <ArrowDown className="w-5 h-5 text-slate-300 animate-bounce" />
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

  if (config.type === 'pie') {
    return (
      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={config.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {config.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ReTooltip 
               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
               formatter={(value) => `${value}%`}
            />
            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (config.type === 'bar') {
    return (
      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={config.xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <ReTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            {config.dataKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
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
            <ReTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            {config.dataKeys.map((key, idx) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            ))}
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return null;
};

interface EssayAnnotatorProps {
  text: string;
  highlights: InlineHighlight[];
}

const EssayAnnotator: React.FC<EssayAnnotatorProps> = ({ text, highlights }) => {
  const [hoveredHighlight, setHoveredHighlight] = useState<InlineHighlight | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!highlights || highlights.length === 0) {
    return <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-serif whitespace-pre-wrap">{text}</p>;
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
      <div className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-serif whitespace-pre-wrap">
        {renderTextWithHighlights()}
      </div>

      {hoveredHighlight && (
        <div 
          className="fixed z-[100] w-72 p-6 bg-slate-900 text-white rounded-[28px] shadow-2xl border border-white/10 animate-in zoom-in-95 pointer-events-none"
          style={{ 
            left: `${Math.min(window.innerWidth - 300, Math.max(20, tooltipPos.x))}px`, 
            top: `${tooltipPos.y}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
             <div className={`w-2 h-2 rounded-full ${hoveredHighlight.type === 'grammar' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{hoveredHighlight.type} Analysis</p>
          </div>
          <div className="space-y-4">
             <div>
               <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Observation</p>
               <p className="text-sm font-medium leading-relaxed">{hoveredHighlight.explanation}</p>
             </div>
             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
               <p className="text-[10px] font-black uppercase text-emerald-500 mb-1">Correction</p>
               <p className="text-sm font-black text-white italic">"{hoveredHighlight.suggestion}"</p>
             </div>
          </div>
          <div className="absolute bottom-0 left-6 w-3 h-3 bg-slate-900 border-r border-b border-white/10 rotate-45 translate-y-1.5"></div>
        </div>
      )}
    </div>
  );
};

const VocabularyPractice: React.FC<{ words: LanguagePoint[] }> = ({ words }) => {
  const [practiceWords] = useState(() => words.slice(0, 4));
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
    <section className="space-y-8 mt-12 animate-in fade-in duration-700">
      <div className="flex items-end justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-2xl font-black flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
            <Pen className="w-6 h-6" />
          </div>
          Vocabulary Practice
        </h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Challenge</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {practiceWords.map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-brand/50">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                  <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.word}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                  Definition: {item.explanation}
                </p>
              </div>

              <div className="md:w-2/3 space-y-4">
                <textarea
                  value={inputs[item.word] || ''}
                  onChange={(e) => setInputs(prev => ({ ...prev, [item.word]: e.target.value }))}
                  placeholder={`Write a sentence using "${item.word}" to describe Task 1 data...`}
                  className="w-full h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none transition-all"
                  disabled={loading[item.word]}
                />
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleCheck(item.word)}
                    disabled={loading[item.word] || !inputs[item.word]}
                    className="px-6 py-2.5 bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-hover transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading[item.word] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5" /> CHECK SENTENCE</>}
                  </button>
                </div>

                {results[item.word] && (
                  <div className={`mt-4 p-6 rounded-2xl border animate-in slide-in-from-top-2 ${results[item.word]?.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${results[item.word]?.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {results[item.word]?.isCorrect ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100">{results[item.word]?.feedback}</p>
                        {results[item.word]?.suggestion && (
                          <div className="pt-3 border-t border-black/5 dark:border-white/5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teacher's Suggestion:</p>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic">"{results[item.word]?.suggestion}"</p>
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
      const errStr = String(err).toLowerCase();
      if (!navigator.onLine || errStr.includes('network') || errStr.includes('fetch')) {
        message = 'Connection lost. Please check your internet and try again.';
      } else if (errStr.includes('403') || errStr.includes('key')) {
        message = 'API Authentication Error.';
      } else if (errStr.includes('malformed') || errStr.includes('json')) {
        message = 'The AI returned a response that couldn\'t be parsed.';
      }
      setError(message);
      console.error('Submission error:', err);
    } finally {
      setIsGrading(false);
    }
  };

  const getDataTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('line')) return <LineChartIcon className="w-3 h-3" />;
    if (t.includes('bar')) return <ChartBar className="w-3 h-3" />;
    if (t.includes('table')) return <TableIcon className="w-3 h-3" />;
    if (t.includes('pie')) return <PieChartIcon className="w-3 h-3" />;
    if (t.includes('map')) return <MapIcon className="w-3 h-3" />;
    if (t.includes('process')) return <RefreshCw className="w-3 h-3" />;
    return <Info className="w-3 h-3" />;
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
                      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-soft text-brand flex items-center justify-center">
                          <SearchCheck className="w-5 h-5" />
                        </div>
                        In-Text Analysis
                      </h3>
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner">
                        <EssayAnnotator text={essay} highlights={feedback.inlineHighlights || []} />
                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex gap-6">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div> Grammar
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> Vocabulary
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Punctuation
                           </div>
                        </div>
                      </div>
                    </section>

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
                 <div className="bg-brand p-12 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                      <Presentation className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">Mastery Report</div>
                        {module.taskIdentification.dataType && (
                          <div className="px-3 py-1 bg-brand-soft/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10 flex items-center gap-1.5">
                            {getDataTypeIcon(module.taskIdentification.dataType)}
                            {module.taskIdentification.dataType}
                          </div>
                        )}
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

                 {module.keyVocabulary && module.keyVocabulary.length > 0 && (
                   <section className="space-y-8">
                     <div className="flex items-end justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
                       <h3 className="text-2xl font-black flex items-center gap-3">
                         <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                           <Languages className="w-6 h-6" />
                         </div>
                         Key Vocabulary Vault
                       </h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Essential Collocations</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {module.keyVocabulary.map((item, i) => (
                         <div key={i} className="group bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                             <Languages className="w-12 h-12 text-brand" />
                           </div>
                           <p className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-brand transition-colors">{item.word}</p>
                           <div className="w-8 h-1 bg-brand-soft group-hover:w-16 transition-all duration-500 rounded-full mb-4"></div>
                           <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.explanation}</p>
                         </div>
                       ))}
                     </div>
                   </section>
                 )}

                 {/* New Section: Vocabulary Practice */}
                 {module.keyVocabulary && module.keyVocabulary.length > 0 && (
                    <VocabularyPractice words={module.keyVocabulary} />
                 )}

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
                 <p className="text-slate-500 dark:text-slate-400">Detailed modules are currently generated only for Writing Task 1 evaluations.</p>
                 <button onClick={() => setActiveView('feedback')} className="px-8 py-3 bg-brand text-white rounded-2xl font-black text-sm">Return to Feedback</button>
               </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 animate-in fade-in duration-700">
      {!selectedTask ? (
        <>
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Writing Practice</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Master Academic and General Training Writing with real-time AI feedback.</p>
          </header>

          <div className="flex gap-2 mb-8 bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl w-fit">
            {(['all', 'task1', 'task2'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white dark:bg-slate-700 text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {cat === 'all' ? 'All Tasks' : cat === 'task1' ? 'Task 1' : 'Task 2'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WRITING_TASKS.filter(t => activeCategory === 'all' || (activeCategory === 'task1' ? t.type.includes('TASK_1') : t.type === TaskType.WRITING_TASK_2)).map(task => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="group bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 text-left hover:border-brand hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-brand-soft text-brand rounded-full text-[10px] font-black uppercase tracking-widest">
                    {task.type.replace(/_/g, ' ')}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-brand group-hover:text-white transition-all">
                    {task.chartConfig?.type === 'pie' ? <PieChartIcon className="w-5 h-5" /> : 
                     task.chartConfig?.type === 'table' ? <TableIcon className="w-5 h-5" /> : 
                     task.chartConfig?.type === 'line' ? <LineChartIcon className="w-5 h-5" /> : 
                     task.chartConfig?.type === 'process' ? <RefreshCw className="w-5 h-5" /> :
                     <Edit3 className="w-5 h-5" />}
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-brand transition-colors">{task.topic}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{task.question}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
          <div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-y-auto flex-1">
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 font-bold flex items-center gap-2 hover:text-brand transition-all mb-8 group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> All Tasks
              </button>
              <span className="px-3 py-1 bg-brand-soft text-brand rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{selectedTask.topic}</span>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 leading-tight">{selectedTask.question}</h2>
              {selectedTask.chartConfig && <Task1Chart config={selectedTask.chartConfig} />}
              
              <div className="mt-12 space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Study Resources</h4>
                <div className="space-y-3">
                  {isLoadingResources ? (
                    <div className="flex items-center gap-3 text-slate-400 text-xs italic"><Loader2 className="w-4 h-4 animate-spin" /> Gathering resources...</div>
                  ) : taskResources.map((link, i) => (
                    <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand transition-all group">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{link.title}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-brand" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4 relative">
            {showDraftBanner && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-5 rounded-[32px] flex items-center justify-between animate-in slide-in-from-top-4 shadow-xl shadow-amber-200/20">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 dark:bg-amber-800 p-2.5 rounded-2xl">
                    <History className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-900 dark:text-amber-100">Found an unsaved draft.</p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Resume where you left off?</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleDiscardDraft} className="px-5 py-2.5 text-xs font-black text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-2xl transition-all">Discard</button>
                  <button onClick={handleLoadDraft} className="px-5 py-2.5 text-xs font-black bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-200 transition-all hover:bg-amber-700">Load Draft</button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 flex-1 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col min-w-[120px]">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Words</span>
                      <span className="text-[9px] font-bold text-slate-400">Min: {selectedTask.type === TaskType.WRITING_TASK_2 ? '250' : '150'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`text-sm font-black ${wordCount < (selectedTask.type === TaskType.WRITING_TASK_2 ? 250 : 150) ? 'text-amber-500' : 'text-brand'}`}>{wordCount}</span>
                       <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${wordCount < (selectedTask.type === TaskType.WRITING_TASK_2 ? 250 : 150) ? 'bg-amber-400' : 'bg-brand'}`} 
                            style={{ width: `${Math.min(100, (wordCount / (selectedTask.type === TaskType.WRITING_TASK_2 ? 250 : 150)) * 100)}%` }}
                          />
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Characters</span>
                    <span className="text-sm font-black text-slate-600 dark:text-slate-300">{essay.length}</span>
                  </div>

                  <div className="h-8 w-px bg-slate-100 dark:bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      {lastSaved ? <><Save className="w-3 h-3 text-emerald-500" /> Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</> : <><Clock className="w-3 h-3" /> Auto-saving enabled</>}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   {isLiveLoading && <Loader2 className="w-4 h-4 animate-spin text-brand" />}
                   {liveSuggestions.length > 0 && (
                     <div className="flex gap-2">
                       {liveSuggestions.map((s, i) => (
                         <div key={i} className="px-3 py-1.5 bg-brand-soft text-brand rounded-full text-[10px] font-black flex items-center gap-2 animate-in zoom-in">
                           <Zap className="w-3 h-3" /> {s}
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>
              
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Start writing your essay response here..."
                className="flex-1 w-full p-10 resize-none focus:outline-none text-lg leading-relaxed text-slate-700 dark:text-slate-200 bg-transparent font-serif"
                disabled={isGrading}
              />

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex gap-4">
                  <button onClick={() => setEssay('')} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-xs font-bold animate-pulse">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isGrading || essay.length < 20}
                  className="px-10 py-4 bg-brand text-white rounded-[28px] font-black text-sm flex items-center gap-3 shadow-2xl shadow-brand/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isGrading ? <><Loader2 className="w-5 h-5 animate-spin" /> ANALYZING...</> : <><CheckCircle2 className="w-5 h-5" /> SUBMIT FOR EVALUATION</>}
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
