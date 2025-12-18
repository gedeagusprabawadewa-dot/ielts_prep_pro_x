
import React, { useState } from 'react';
import { WRITING_TASKS } from '../constants';
import { WritingTask, WritingFeedback, TaskType, Highlight, LanguagePoint } from '../types';
import { evaluateWriting } from '../services/geminiService';
import { saveSubmission } from '../services/storageService';
import { 
  BarChart, Bar, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  Send, CheckCircle2, ChevronRight, AlertCircle, Loader2, 
  BookOpen, Sparkles, GraduationCap, ArrowUpCircle, Info,
  LineChart as LineChartIcon, Mail, FileText, ClipboardCheck, Lightbulb,
  Table as TableIcon, ChartBar, Edit3, RotateCcw, PenTool
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
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f8fafc' }}
            />
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

  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length;

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
      setError('Evaluation failed. Please check your internet connection and try again.');
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const renderAnnotatedText = (text: string, highlights: Highlight[]) => {
    let lastIndex = 0;
    const parts = [];
    const sortedHighlights = [...highlights].sort((a, b) => text.indexOf(a.phrase) - text.indexOf(b.phrase));

    sortedHighlights.forEach((h, idx) => {
      const index = text.indexOf(h.phrase, lastIndex);
      if (index === -1) return;
      parts.push(text.substring(lastIndex, index));
      const typeColors = {
        topic: 'bg-blue-100 border-blue-200 text-blue-800',
        linking: 'bg-purple-100 border-purple-200 text-purple-800',
        vocab: 'bg-emerald-100 border-emerald-200 text-emerald-800',
        grammar: 'bg-amber-100 border-amber-200 text-amber-800'
      };
      parts.push(
        <span 
          key={idx}
          onClick={() => setActiveHighlight(h)}
          className={`px-1 rounded-md border cursor-help transition-all hover:brightness-95 ${typeColors[h.type as keyof typeof typeColors]}`}
        >
          {h.phrase}
        </span>
      );
      lastIndex = index + h.phrase.length;
    });
    parts.push(text.substring(lastIndex));
    return <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{parts}</p>;
  };

  const filteredTasks = WRITING_TASKS.filter(task => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'task1') return task.type.includes('TASK_1');
    if (activeCategory === 'task2') return task.type === TaskType.WRITING_TASK_2;
    return true;
  });

  if (feedback) {
    const isTask1 = selectedTask?.type.includes('TASK_1');
    const module = feedback.learningModule;

    return (
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveView('feedback')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'feedback' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              My Feedback
            </button>
            {(selectedTask?.modelAnswer || module) && (
              <button 
                onClick={() => setActiveView('model')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'model' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Study Module
              </button>
            )}
          </div>
          <button 
            onClick={() => setFeedback(null)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Revise Essay
          </button>
        </div>

        {activeView === 'feedback' ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-blue-600 px-8 py-10 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-1">Results</h2>
                <p className="opacity-90">Detailed analysis of your {isTask1 ? 'Task 1 response' : 'Task 2 essay'}.</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center min-w-[100px]">
                <div className="text-4xl font-black">{feedback.overall}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase opacity-80">Estimated Band</div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: isTask1 ? 'Task Achievement' : 'Task Response', score: feedback.task_response },
                  { label: 'Coherence', score: feedback.coherence },
                  { label: 'Lexical', score: feedback.lexical },
                  { label: 'Grammar', score: feedback.grammar },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-tight">{item.label}</p>
                    <p className="text-2xl font-bold text-slate-800">{item.score}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Key Strengths
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600 bg-emerald-50 p-3 rounded-xl">
                        <span className="text-emerald-500 font-bold">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {feedback.improvements.map((imp, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <span className="text-amber-500 font-bold">{i+1}.</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            {isTask1 && module ? (
              <>
                {/* Task Identification */}
                <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-4 opacity-80">
                    <ClipboardCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Task Identification</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{module.taskIdentification.type}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">{module.taskIdentification.trends}</p>
                </div>

                {/* Sample Answer */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      Band 8-9 Sample Answer
                    </h3>
                    <span className="text-xs font-bold px-3 py-1 bg-white/10 rounded-full">~{module.sampleAnswer.split(' ').length} words</span>
                  </div>
                  <div className="p-8 bg-slate-50 text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                    {module.sampleAnswer}
                  </div>
                </div>

                {/* Criteria-Based Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Examiner Score Explanation
                    </h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Task Achievement', text: module.scoreExplanation.ta },
                        { label: 'Coherence & Cohesion', text: module.scoreExplanation.cc },
                        { label: 'Lexical Resource', text: module.scoreExplanation.lr },
                        { label: 'Grammatical Accuracy', text: module.scoreExplanation.gra },
                      ].map((exp) => (
                        <div key={exp.label}>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{exp.label}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{exp.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Language Bank */}
                    <div className="bg-slate-900 text-white p-8 rounded-3xl">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
                        <Lightbulb className="w-5 h-5" />
                        Key Language to Learn
                      </h3>
                      <div className="grid gap-3">
                        {module.improvementGuide.language.map((lang, i) => (
                          <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10">
                            <span className="text-sm font-bold text-blue-300 block">{lang.word}</span>
                            <span className="text-xs text-slate-400">{lang.explanation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Common Mistakes */}
                    <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
                      <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Common Band 6 Mistakes
                      </h3>
                      <ul className="space-y-3">
                        {module.improvementGuide.commonMistakes.map((m, i) => (
                          <li key={i} className="text-xs text-red-800 leading-relaxed flex gap-2">
                            <span className="font-bold">•</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Band Upgrades */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                    Band Upgrade Comparisons
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {module.bandUpgrades.map((upgrade, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                        <div className="p-4 bg-red-50/50">
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Band 6 Version</span>
                          <p className="text-sm text-slate-600 italic mt-1">"{upgrade.low}"</p>
                        </div>
                        <div className="p-4 bg-emerald-50/50">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Band 9 Version</span>
                          <p className="text-sm text-slate-900 font-medium mt-1">"{upgrade.high}"</p>
                        </div>
                        <div className="p-4 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 leading-relaxed">{upgrade.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examiner Notes */}
                <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Examiner Study Tips
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {module.examinerNotes.map((note, i) => (
                      <div key={i} className="bg-white/50 p-4 rounded-2xl border border-amber-200 text-sm text-amber-900 font-medium">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Task */}
                <div className="bg-slate-900 text-white p-10 rounded-3xl text-center">
                  <h3 className="text-xl font-bold mb-4">Final Challenge</h3>
                  <p className="text-slate-400 mb-6 max-w-xl mx-auto">{module.practiceTask}</p>
                  <button 
                    onClick={() => {setFeedback(null);}}
                    className="px-8 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto"
                  >
                    <PenTool className="w-4 h-4" />
                    Rewrite and Resubmit
                  </button>
                </div>
              </>
            ) : (
              /* Original Task 2 Model Answer View */
              <div className="space-y-8">
                {selectedTask?.modelAnswer && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-900 px-8 py-8 text-white flex justify-between items-center">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                        Band 9 Model Answer
                      </h2>
                      <span className="text-xl font-black">9.0</span>
                    </div>
                    <div className="p-8 lg:p-12">
                      {renderAnnotatedText(selectedTask.modelAnswer.text, selectedTask.modelAnswer.highlights)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-4 mb-10">
          <button 
            onClick={() => {setFeedback(null); setEssay(''); setSelectedTask(null);}}
            className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try a Different Task
          </button>
        </div>
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Writing Practice</h1>
          <p className="text-slate-500">Master Task 1 (Data/Letters) and Task 2 (Essays) with AI coaching.</p>
        </header>

        <div className="flex gap-2 mb-8 bg-slate-200 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            All Tasks
          </button>
          <button 
            onClick={() => setActiveCategory('task1')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'task1' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Task 1 (Data/Letter)
          </button>
          <button 
            onClick={() => setActiveCategory('task2')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === 'task2' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Task 2 (Essay)
          </button>
        </div>

        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="bg-white p-6 rounded-3xl border border-slate-200 text-left hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                    task.type === TaskType.WRITING_TASK_2 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {task.type === TaskType.WRITING_TASK_2 ? 'Task 2 Essay' : 
                     task.type === TaskType.WRITING_TASK_1_ACADEMIC ? 'Task 1 Academic' : 'Task 1 General'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{task.topic}</span>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">{task.question}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {task.type === TaskType.WRITING_TASK_2 ? <FileText className="w-5 h-5" /> : 
                 task.type === TaskType.WRITING_TASK_1_ACADEMIC ? <LineChartIcon className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => setSelectedTask(null)}
          className="text-slate-500 text-sm hover:text-slate-800 flex items-center gap-1 group"
        >
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back to list
        </button>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Word Count</span>
            <span className={`text-sm font-black ${
              (selectedTask.type === TaskType.WRITING_TASK_2 && wordCount >= 250) || 
              (selectedTask.type !== TaskType.WRITING_TASK_2 && wordCount >= 150) ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              {wordCount} <span className="text-slate-300 font-medium">/ {selectedTask.type === TaskType.WRITING_TASK_2 ? '250' : '150'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px] mb-8">
        {/* Prompt Card */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-0 h-fit">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
               <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <ClipboardCheck className="w-4 h-4 text-blue-400" />
                 Task Instructions
               </h3>
               <span className="text-[10px] font-bold text-slate-400">{selectedTask.type.includes('TASK_1') ? '20 MINS' : '40 MINS'}</span>
            </div>
            <div className="p-6">
              <p className="text-slate-700 text-sm leading-relaxed font-medium mb-4 italic">
                "{selectedTask.question}"
              </p>
              
              {selectedTask.chartConfig && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ChartBar className="w-3 h-3" />
                      Visual Data
                    </h3>
                    <button 
                      onClick={() => setShowDataTable(!showDataTable)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {showDataTable ? <ChartBar className="w-3 h-3" /> : <TableIcon className="w-3 h-3" />}
                      {showDataTable ? 'VIEW GRAPH' : 'VIEW DATA TABLE'}
                    </button>
                  </div>
                  
                  {showDataTable ? (
                    <div className="mt-4 border border-slate-100 rounded-xl overflow-hidden overflow-x-auto">
                      <table className="w-full text-[10px] text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-3 py-2 font-bold text-slate-500 uppercase">{selectedTask.chartConfig.xAxisKey}</th>
                            {selectedTask.chartConfig.dataKeys.map(key => (
                              <th key={key} className="px-3 py-2 font-bold text-slate-500 uppercase">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {selectedTask.chartConfig.data.map((row, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 font-bold text-slate-800">{row[selectedTask.chartConfig!.xAxisKey]}</td>
                              {selectedTask.chartConfig!.dataKeys.map(key => (
                                <td key={key} className="px-3 py-2 text-slate-600">{row[key]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100">
                      <Task1Chart config={selectedTask.chartConfig} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 hidden lg:block">
            <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Lightbulb className="w-3 h-3" />
              Writing Tip
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              {selectedTask.type === TaskType.WRITING_TASK_2 
                ? "Ensure you have a clear thesis statement in your introduction and a balanced discussion in the body paragraphs."
                : "Focus on summarizing trends and making comparisons. Avoid listing every single data point in your report."}
            </p>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Your Response</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Live Saving Enabled</span>
            </div>
          </div>
          
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={isGrading}
            spellCheck={false}
            placeholder={`Start writing your ${selectedTask.type.includes('TASK_1') ? 'report or letter' : 'essay'} here...`}
            className="flex-1 p-8 text-lg leading-relaxed text-slate-700 focus:outline-none resize-none placeholder:text-slate-300 min-h-[300px]"
          />
          
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={isGrading || essay.trim().length === 0}
              className={`w-full flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl group ${
                isGrading || essay.trim().length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200'
              }`}
            >
              {isGrading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing Your Writing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Submit for Evaluation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingSection;
