
import React, { useState, useEffect } from 'react';
import { getSubmissions, getSessionUser, updateUserData } from '../services/storageService';
import { getTimelinePrediction } from '../services/geminiService';
import { TaskType, PredictionResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { 
  TrendingUp, Award, Clock, FileText, Mic, ChevronRight, 
  Target, Calendar, Zap, Loader2, Sparkles, AlertCircle, 
  CheckCircle2, ArrowUpRight, BrainCircuit, Flag, Trophy,
  Users, Cloud, ArrowRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const submissions = getSubmissions();
  const user = getSessionUser();
  
  const [targetBand, setTargetBand] = useState(user?.targetBand || 7.0);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const writingSubmissions = submissions.filter(s => s.type !== TaskType.SPEAKING);
  const speakingSubmissions = submissions.filter(s => s.type === TaskType.SPEAKING);

  const avgWriting = writingSubmissions.length > 0 
    ? (writingSubmissions.reduce((acc, s) => acc + (s.feedback as any).overall, 0) / writingSubmissions.length).toFixed(1)
    : '0.0';

  const avgSpeaking = speakingSubmissions.length > 0
    ? (speakingSubmissions.reduce((acc, s) => acc + (s.feedback as any).overall, 0) / speakingSubmissions.length).toFixed(1)
    : '0.0';

  const currentOverall = (parseFloat(avgWriting) > 0 && parseFloat(avgSpeaking) > 0)
    ? ((parseFloat(avgWriting) + parseFloat(avgSpeaking)) / 2).toFixed(1) 
    : parseFloat(avgWriting) > 0 ? avgWriting : parseFloat(avgSpeaking) > 0 ? avgSpeaking : '0.0';

  const progressPercentage = Math.min(100, Math.round((parseFloat(currentOverall) / targetBand) * 100));

  const getChartData = () => {
    return submissions
      .slice(0, 10)
      .reverse()
      .map(s => ({
        date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: (s.feedback as any).overall
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
          <p className="text-slate-500 dark:text-slate-400 mt-1">Visualize your path to Band {targetBand}.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Achievement</p>
            <p className="text-2xl font-black text-brand transition-colors">{progressPercentage}%</p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (175.9 * progressPercentage) / 100}
                strokeLinecap="round"
                className="text-brand transition-all duration-1000 ease-out"
              />
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

      {user?.authMode === 'trial' && (
        <div className="bg-blue-600 rounded-[32px] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200 dark:shadow-none animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
               <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-black leading-tight">Sync your progress to the cloud</h4>
              <p className="text-sm text-blue-100 font-medium opacity-80">Don't lose your Band {currentOverall} history. Create an account to study anywhere.</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} // Simple hack to return to login screen
            className="px-8 py-3 bg-white text-blue-600 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="bg-slate-900 dark:bg-black rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl transition-all flex-1">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit className="w-48 h-48" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-brand/20 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-brand" />
                </div>
                <h2 className="text-xl font-bold">Goal Forecaster</h2>
              </div>
              <p className="text-slate-400 text-sm mb-10 leading-relaxed">AI engine analyzing your lexical range and grammatical growth.</p>
              
              {!prediction ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-6">
                  <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-brand/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Zap className="w-10 h-10 text-brand relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-white">Generate Prediction</h3>
                    <p className="text-xs text-slate-500 leading-relaxed px-6">
                      {submissions.length < 3 
                        ? "Keep practicing! 3+ tasks needed for a high-confidence forecast." 
                        : "We'll calculate the hours of deliberate practice required to close the gap."}
                    </p>
                  </div>
                  <button
                    onClick={handlePredict}
                    disabled={isPredicting || submissions.length === 0}
                    className="w-full py-5 bg-brand hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-600 rounded-3xl font-black transition-all flex items-center justify-center gap-2 shadow-2xl shadow-brand/20 group text-white"
                  >
                    {isPredicting ? (
                      <><Loader2 className="w-6 h-6 animate-spin" /> CALCULATING...</>
                    ) : (
                      <>RUN FORECAST <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex-1 space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Effort Required</p>
                      <p className="text-3xl font-black text-brand">{prediction.estimatedHours}h</p>
                      <p className="text-[10px] text-slate-500 mt-1">{prediction.estimatedSessions} practice sessions</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Date</p>
                      <p className="text-3xl font-black text-emerald-400 truncate">{prediction.projectedDate}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{prediction.confidenceScore}% certainty</p>
                    </div>
                  </div>
                  <button onClick={() => setPrediction(null)} className="w-full py-4 text-xs font-bold text-slate-500 hover:text-white transition-colors border-t border-white/5">RECALCULATE FORECAST</button>
                </div>
              )}
            </div>
          </div>

          {/* Wall of Fame Widget */}
          <div className="bg-brand rounded-[32px] p-8 text-white shadow-xl shadow-brand/20 relative overflow-hidden group">
             <Users className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
             <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-300" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Wall of Fame</h4>
             </div>
             <p className="text-sm font-bold mb-4">"Achieved Band 8.0 for LPDP University of Edinburgh."</p>
             <p className="text-[10px] opacity-70 font-medium">Recently by Aditya P.</p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Growth Trajectory</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Average Band Score: {currentOverall}</p>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black tracking-widest uppercase">
                <span className="flex items-center gap-2 text-brand">
                  <span className="w-3 h-3 rounded-full bg-brand shadow-lg shadow-brand/20"></span> 
                  My Progress
                </span>
                <span className="flex items-center gap-2 text-slate-300 dark:text-slate-700">
                  <div className="w-8 h-[2px] bg-slate-200 dark:bg-slate-700 border-t-2 border-dashed border-slate-400"></div>
                  Target Band {targetBand}
                </span>
              </div>
            </div>
            
            <div className="h-[320px] w-full">
              {submissions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(var(--brand-primary))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="rgb(var(--brand-primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} domain={[0, 9]} ticks={[0, 2, 4, 6, 8, 9]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px 20px', backgroundColor: '#fff' }}
                    />
                    <ReferenceLine y={targetBand} stroke="#cbd5e1" strokeDasharray="8 8" strokeWidth={2} />
                    <Area type="monotone" dataKey="score" stroke="rgb(var(--brand-primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorScore)" animationDuration={2000}/>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] p-10">
                  <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-bold max-w-[200px] text-center">Complete your first evaluation to unlock growth tracking</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Writing Average</p>
                <div className="flex items-center justify-between">
                   <p className="text-2xl font-black">{avgWriting}</p>
                   <FileText className="w-5 h-5 text-blue-500 opacity-20" />
                </div>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">Speaking Average</p>
                <div className="flex items-center justify-between">
                   <p className="text-2xl font-black">{avgSpeaking}</p>
                   <Mic className="w-5 h-5 text-purple-500 opacity-20" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
