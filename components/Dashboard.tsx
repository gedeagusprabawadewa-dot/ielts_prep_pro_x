
import React, { useState, useEffect } from 'react';
import { getSubmissions, getSessionUser, updateUserData } from '../services/storageService';
import { getTimelinePrediction } from '../services/geminiService';
import { TaskType, PredictionResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { 
  TrendingUp, Award, Clock, FileText, Mic, ChevronRight, 
  Target, Calendar, Zap, Loader2, Sparkles, AlertCircle, 
  CheckCircle2, ArrowUpRight, BrainCircuit, Flag, Trophy,
  Users, Cloud, ArrowRight, BookOpen, Brain, Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const submissions = getSubmissions();
  const user = getSessionUser();
  
  const [targetBand, setTargetBand] = useState(user?.targetBand || 7.0);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const writingSubmissions = submissions.filter(s => s.type !== TaskType.SPEAKING && s.type !== TaskType.READING_ACADEMIC);
  const speakingSubmissions = submissions.filter(s => s.type === TaskType.SPEAKING);
  const readingSubmissions = submissions.filter(s => s.type === TaskType.READING_ACADEMIC);

  const avgWriting = writingSubmissions.length > 0 
    ? (writingSubmissions.reduce((acc, s) => acc + (s.feedback as any).overall, 0) / writingSubmissions.length).toFixed(1)
    : '0.0';

  const avgSpeaking = speakingSubmissions.length > 0
    ? (speakingSubmissions.reduce((acc, s) => acc + (s.feedback as any).overall, 0) / speakingSubmissions.length).toFixed(1)
    : '0.0';
  
  const avgReading = readingSubmissions.length > 0
    ? (readingSubmissions.reduce((acc, s) => acc + (s.feedback as any).bandScore, 0) / readingSubmissions.length).toFixed(1)
    : '0.0';

  const currentOverall = (parseFloat(avgWriting) > 0 || parseFloat(avgSpeaking) > 0 || parseFloat(avgReading) > 0)
    ? ((parseFloat(avgWriting) + parseFloat(avgSpeaking) + parseFloat(avgReading)) / 
       ([parseFloat(avgWriting), parseFloat(avgSpeaking), parseFloat(avgReading)].filter(v => v > 0).length || 1)).toFixed(1) 
    : '0.0';

  const bandGap = Math.max(0, targetBand - parseFloat(currentOverall)).toFixed(1);
  const progressPercentage = Math.min(100, Math.round((parseFloat(currentOverall) / targetBand) * 100));

  const getChartData = () => {
    return submissions
      .slice(0, 10)
      .reverse()
      .map(s => ({
        date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: (s.feedback as any).overall || (s.feedback as any).bandScore
      }));
  };

  const handleUpdateTarget = (val: number) => {
    setTargetBand(val);
    updateUserData({ targetBand: val });
  };

  const handlePredict = async () => {
    if (submissions.length === 0) return;
    setIsPredicting(true);
    try {
      const result = await getTimelinePrediction(submissions, targetBand);
      setPrediction(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Performance Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Grounded analysis of your scholarship journey.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Target Gap</p>
            <p className="text-2xl font-black text-brand transition-colors">-{bandGap} Bands</p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progressPercentage) / 100} strokeLinecap="round" className="text-brand transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="w-5 h-5 text-brand" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 pr-6">
            <div className="bg-brand p-4 rounded-2xl text-white shadow-xl shadow-brand/20 transition-all">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Goal</p>
              <div className="flex items-center gap-2">
                <select 
                  value={targetBand} 
                  onChange={(e) => handleUpdateTarget(parseFloat(e.target.value))}
                  className="text-xl font-black text-slate-900 dark:text-white bg-transparent focus:outline-none cursor-pointer hover:text-brand transition-colors"
                >
                  {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(v => (
                    <option key={v} value={v}>Band {v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Goal Forecaster Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 dark:bg-black rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl transition-all h-full flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BrainCircuit className="w-64 h-64" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-brand/20 p-2.5 rounded-2xl">
                  <Activity className="w-6 h-6 text-brand" />
                </div>
                <h2 className="text-2xl font-black">AI Forecaster</h2>
              </div>
              
              {!prediction ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-6">
                  <div className="w-28 h-28 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-brand/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Sparkles className="w-12 h-12 text-brand relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-white">Project My Success</h3>
                    <p className="text-xs text-slate-500 leading-relaxed px-4">
                      {submissions.length < 3 
                        ? "Complete 3+ evaluations to unlock high-confidence timeline predictions." 
                        : "Analyze your band growth and predict your scholarship readiness date."}
                    </p>
                  </div>
                  <button
                    onClick={handlePredict}
                    disabled={isPredicting || submissions.length === 0}
                    className="w-full py-5 bg-brand hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-600 rounded-[28px] font-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand/20 group text-white text-lg"
                  >
                    {isPredicting ? (
                      <><Loader2 className="w-6 h-6 animate-spin" /> RUNNING...</>
                    ) : (
                      <>CALCULATE TIMELINE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex-1 space-y-6 animate-in zoom-in-95 duration-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Deliberate Practice</p>
                      <p className="text-3xl font-black text-brand">{prediction.estimatedHours}h</p>
                      <p className="text-[10px] text-slate-500 mt-1">Spread over {prediction.estimatedSessions} sessions</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Estimated Date</p>
                      <p className="text-3xl font-black text-emerald-400">{prediction.projectedDate}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{prediction.confidenceScore}% confidence</p>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                     <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> Core Bottleneck
                     </p>
                     <p className="text-sm font-medium text-slate-300 leading-relaxed italic">"{prediction.bottleneck}"</p>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Winning Strategy</p>
                     {prediction.strategy.slice(0, 2).map((s, i) => (
                       <div key={i} className="p-4 bg-brand/10 rounded-2xl border border-brand/20 flex gap-3 items-start text-xs font-medium text-brand">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> {s}
                       </div>
                     ))}
                  </div>

                  <button onClick={() => setPrediction(null)} className="w-full py-4 text-[10px] font-black text-slate-500 hover:text-white transition-colors border-t border-white/5 uppercase tracking-widest">
                    RELOAD PREDICTION
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Growth Tracking Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Growth Trajectory</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Real-time band tracking across all skills.</p>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black tracking-widest uppercase">
                <span className="flex items-center gap-2 text-brand">
                  <span className="w-3 h-3 rounded-full bg-brand shadow-lg shadow-brand/20"></span> 
                  My Score
                </span>
                <span className="flex items-center gap-2 text-slate-200 dark:text-slate-700">
                  <div className="w-10 h-[2px] bg-slate-300 dark:bg-slate-600 border-t-2 border-dashed border-slate-400"></div>
                  Target Band {targetBand}
                </span>
              </div>
            </div>
            
            <div className="h-[340px] w-full">
              {submissions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(var(--brand-primary))" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="rgb(var(--brand-primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} domain={[0, 9]} ticks={[0, 3, 6, 7, 8, 9]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px 20px', backgroundColor: '#fff' }}
                    />
                    <ReferenceLine y={targetBand} stroke="#cbd5e1" strokeDasharray="8 8" strokeWidth={2} />
                    <Area type="monotone" dataKey="score" stroke="rgb(var(--brand-primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorScore)" animationDuration={2500}/>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px] p-10">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-lg mb-6">
                    <TrendingUp className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-base font-black text-slate-800 dark:text-white">Chart Empty</p>
                  <p className="text-sm font-medium max-w-[240px] text-center mt-1">Complete your first evaluation to unlock growth tracking</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-brand transition-all">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 flex items-center justify-between">Writing <FileText className="w-3 h-3 text-blue-500 opacity-30" /></p>
                <div className="flex items-end justify-between">
                   <p className="text-3xl font-black text-slate-800 dark:text-white">{avgWriting}</p>
                   <span className="text-[10px] font-bold text-slate-400">Band</span>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-brand transition-all">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 flex items-center justify-between">Speaking <Mic className="w-3 h-3 text-purple-500 opacity-30" /></p>
                <div className="flex items-end justify-between">
                   <p className="text-3xl font-black text-slate-800 dark:text-white">{avgSpeaking}</p>
                   <span className="text-[10px] font-bold text-slate-400">Band</span>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-brand transition-all">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 flex items-center justify-between">Reading <BookOpen className="w-3 h-3 text-emerald-500 opacity-30" /></p>
                <div className="flex items-end justify-between">
                   <p className="text-3xl font-black text-slate-800 dark:text-white">{avgReading}</p>
                   <span className="text-[10px] font-bold text-slate-400">Band</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
