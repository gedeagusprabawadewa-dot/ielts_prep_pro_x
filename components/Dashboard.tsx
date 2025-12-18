
import React, { useState, useEffect } from 'react';
import { getSubmissions, getSessionUser, updateUserData } from '../services/storageService';
import { getTimelinePrediction } from '../services/geminiService';
import { TaskType, PredictionResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  TrendingUp, Award, Clock, FileText, Mic, ChevronRight, 
  Target, Calendar, Zap, Loader2, Sparkles, AlertCircle, 
  CheckCircle2, ArrowUpRight, BrainCircuit
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const submissions = getSubmissions();
  const user = getSessionUser();
  
  const [targetBand, setTargetBand] = useState(user?.targetBand || 7.0);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);

  const writingSubmissions = submissions.filter(s => s.type !== TaskType.SPEAKING);
  const speakingSubmissions = submissions.filter(s => s.type === TaskType.SPEAKING);

  const avgWriting = writingSubmissions.length > 0 
    ? (writingSubmissions.reduce((acc, s) => acc + (s.feedback as any).overall, 0) / writingSubmissions.length).toFixed(1)
    : 'N/A';

  const avgSpeaking = speakingSubmissions.length > 0
    ? (speakingSubmissions.reduce((acc, s) => acc + (s.feedback as any).overall, 0) / speakingSubmissions.length).toFixed(1)
    : 'N/A';

  const currentOverall = avgWriting !== 'N/A' && avgSpeaking !== 'N/A' 
    ? ((parseFloat(avgWriting) + parseFloat(avgSpeaking)) / 2).toFixed(1) 
    : avgWriting !== 'N/A' ? avgWriting : avgSpeaking !== 'N/A' ? avgSpeaking : '0.0';

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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">My Progress</h1>
          <p className="text-slate-500">Track your trajectory and predict your exam success.</p>
        </div>
        
        {/* Goal Setting Widget */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 pr-6">
          <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-100">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Band</p>
            <div className="flex items-center gap-2">
              <select 
                value={targetBand} 
                onChange={(e) => handleUpdateTarget(parseFloat(e.target.value))}
                className="text-xl font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
              <span className="text-xs font-bold text-blue-600">
                {Math.max(0, targetBand - parseFloat(currentOverall)).toFixed(1)} to go
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Stats and Prediction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Prediction Card */}
        <div className="lg:col-span-4 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200/20">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Timeline Predictor
            </h2>
            <p className="text-slate-400 text-sm mb-8">AI analysis of your performance patterns and learning curve.</p>
            
            {!prediction ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Ready to Predict?</h3>
                  <p className="text-xs text-slate-500 leading-relaxed px-4">
                    {submissions.length < 3 
                      ? "Complete at least 3 tasks for higher accuracy." 
                      : "We'll analyze your current scores and calculate the estimated effort."}
                  </p>
                </div>
                <button
                  onClick={handlePredict}
                  disabled={isPredicting || submissions.length === 0}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group"
                >
                  {isPredicting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Predict My Success
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex-1 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Effort</p>
                    <p className="text-2xl font-black">{prediction.estimatedHours}h</p>
                    <p className="text-[10px] text-blue-400">approx. {prediction.estimatedSessions} tasks</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Completion</p>
                    <p className="text-2xl font-black text-emerald-400 truncate">{prediction.projectedDate}</p>
                    <p className="text-[10px] text-slate-500">{prediction.confidenceScore}% confidence</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      Critical Bottleneck
                    </h4>
                    <p className="text-sm text-slate-200 font-medium leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10 italic">
                      "{prediction.bottleneck}"
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Suggested Strategy
                    </h4>
                    <ul className="space-y-2">
                      {prediction.strategy.map((s, i) => (
                        <li key={i} className="text-xs text-slate-300 flex gap-2">
                          <span className="text-blue-500 font-bold">{i+1}.</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => setPrediction(null)}
                  className="w-full py-3 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                >
                  Reset Analysis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chart and Activity Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-black text-slate-800">Score Trajectory</h2>
                <p className="text-xs text-slate-400 mt-1">Current Band: {currentOverall}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-200"></span> 
                  Actual Band
                </span>
                <span className="flex items-center gap-1 opacity-50">
                  <span className="w-2 h-2 rounded-full bg-slate-300 border border-slate-400 border-dashed"></span> 
                  Target {targetBand}
                </span>
              </div>
            </div>
            <div className="h-[280px] w-full">
              {submissions.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} domain={[0, 9]} ticks={[0, 3, 6, 9]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                    {/* Visual representation of target band as a line could be added here if needed */}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-sm italic">Complete more tasks to visualize your growth</p>
                </div>
              )}
            </div>
          </div>

          {/* Sub-Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Writing', value: avgWriting, icon: FileText, color: 'text-blue-500' },
              { label: 'Speaking', value: avgSpeaking, icon: Mic, color: 'text-purple-500' },
              { label: 'Total Tasks', value: submissions.length, icon: TrendingUp, color: 'text-emerald-500' },
              { label: 'Target', value: targetBand, icon: Award, color: 'text-amber-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
                <p className="text-xl font-black text-slate-800">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="font-black text-slate-800 mb-6 flex items-center justify-between">
          Recent Activity
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{submissions.length} Total</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions.length > 0 ? (
            submissions.slice(0, 6).map((sub) => (
              <div key={sub.id} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${sub.type !== TaskType.SPEAKING ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {sub.type !== TaskType.SPEAKING ? <FileText className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      {sub.type === TaskType.SPEAKING ? 'Speaking' : 
                       sub.type === TaskType.WRITING_TASK_2 ? 'Writing T2' : 'Writing T1'}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-800">{(sub.feedback as any).overall}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 italic bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              Your practice journey starts here. Select a task to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
