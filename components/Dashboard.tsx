
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

  const avgWriting = writingSubmissions.length > 0 ? (writingSubmissions.reduce((acc, s) => acc + (s.feedback as any).overall, 0) / writingSubmissions.length).toFixed(1) : '0.0';
  const avgSpeaking = speakingSubmissions.length > 0 ? (speakingSubmissions.reduce((acc, s) => acc + (s.feedback as any).overall, 0) / speakingSubmissions.length).toFixed(1) : '0.0';
  const avgReading = readingSubmissions.length > 0 ? (readingSubmissions.reduce((acc, s) => acc + (s.feedback as any).bandScore, 0) / readingSubmissions.length).toFixed(1) : '0.0';

  const currentOverall = (parseFloat(avgWriting) > 0 || parseFloat(avgSpeaking) > 0 || parseFloat(avgReading) > 0)
    ? ((parseFloat(avgWriting) + parseFloat(avgSpeaking) + parseFloat(avgReading)) / ([parseFloat(avgWriting), parseFloat(avgSpeaking), parseFloat(avgReading)].filter(v => v > 0).length || 1)).toFixed(1) : '0.0';

  const progressPercentage = Math.min(100, Math.round((parseFloat(currentOverall) / targetBand) * 100));

  const handleUpdateTarget = (val: number) => { setTargetBand(val); updateUserData({ targetBand: val }); };
  const handlePredict = async () => { if (submissions.length === 0) return; setIsPredicting(true); try { setPrediction(await getTimelinePrediction(submissions, targetBand)); } catch (err) { console.error(err); } finally { setIsPredicting(false); } };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 pb-10 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Scholarship readiness analysis.</p>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="relative w-12 h-12 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90"><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800" /><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * progressPercentage) / 100} strokeLinecap="round" className="text-brand transition-all duration-1000" /></svg>
             <div className="absolute inset-0 flex items-center justify-center"><Target className="w-4 h-4 text-brand" /></div>
           </div>
           <div><p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Target Band</p>
             <select value={targetBand} onChange={(e) => handleUpdateTarget(parseFloat(e.target.value))} className="text-lg font-black text-slate-900 dark:text-white bg-transparent focus:outline-none cursor-pointer">
               {[5.0, 6.0, 7.0, 8.0, 9.0].map(v => <option key={v} value={v}>Band {v.toFixed(1)}</option>)}
             </select>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-4 h-fit">
          <div className="bg-slate-900 rounded-[32px] sm:rounded-[48px] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3"><div className="bg-brand/20 p-2 rounded-xl"><Activity className="w-5 h-5 text-brand" /></div><h2 className="text-xl font-black">Forecaster</h2></div>
              {!prediction ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6"><Sparkles className="w-10 h-10 text-brand" /></div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-8">Analyze your growth and predict your readiness date.</p>
                  <button onClick={handlePredict} disabled={isPredicting || submissions.length === 0} className="w-full py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                    {isPredicting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'RUN AI ANALYSIS'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10"><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Hours Needed</p><p className="text-2xl font-black text-brand">{prediction.estimatedHours}h</p></div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10"><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Projected</p><p className="text-lg font-black text-emerald-400">{prediction.projectedDate}</p></div>
                  </div>
                  <button onClick={() => setPrediction(null)} className="w-full py-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">Reset Analysis</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] sm:rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-black mb-10">Growth Chart</h2>
            <div className="h-[250px] sm:h-[300px] w-full">
              {submissions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={submissions.slice(0, 8).reverse().map(s => ({ date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), score: (s.feedback as any).overall || (s.feedback as any).bandScore }))} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                    <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="rgb(var(--brand-primary))" stopOpacity={0.2}/><stop offset="95%" stopColor="rgb(var(--brand-primary))" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} domain={[0, 9]} ticks={[0, 3, 6, 9]} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="score" stroke="rgb(var(--brand-primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">Complete an evaluation to see your data.</div>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {[{ l: 'Writing', v: avgWriting, i: FileText }, { l: 'Speaking', v: avgSpeaking, i: Mic }, { l: 'Reading', v: avgReading, i: BookOpen }].map((item) => (
               <div key={item.l} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div><p className="text-[8px] font-black text-slate-400 uppercase mb-1">{item.l}</p><p className="text-2xl font-black">{item.v}</p></div>
                  <item.i className="w-6 h-6 text-slate-200" />
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
