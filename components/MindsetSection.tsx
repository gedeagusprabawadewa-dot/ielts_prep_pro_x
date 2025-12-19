
import React, { useState } from 'react';
import { 
  Brain, ShieldCheck, Zap, Sparkles, Wind, 
  Target, Info, ArrowRight, Loader2, Send, 
  Heart, CheckCircle2, AlertCircle, RefreshCw,
  Trophy, BookOpen, Mic, Compass
} from 'lucide-react';
import { getMindsetAdvice } from '../services/geminiService';

const MindsetSection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isCoaching, setIsCoaching] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'strategy' | 'psychology' | 'mindfulness'>('strategy');

  const handleGetAdvice = async (customQuery?: string) => {
    const finalQuery = customQuery || query;
    if (!finalQuery.trim()) return;
    
    setIsCoaching(true);
    try {
      const result = await getMindsetAdvice(finalQuery);
      setAdvice(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCoaching(false);
    }
  };

  const strategyCards = [
    {
      title: "Writing: The Under 3 Min Rule",
      icon: BookOpen,
      desc: "Examiners scan for structure first. Use clear topic sentences and logical linking to win their approval instantly.",
      tip: "Structure > Vocabulary"
    },
    {
      title: "Speaking: Recovery Mastery",
      icon: Mic,
      desc: "Mistakes are normal. Use self-correction phrases like 'What I meant to say was...' to show high-level control.",
      tip: "Fluency > Perfect Grammar"
    },
    {
      title: "Reading: Intelligent Guessing",
      icon: Compass,
      desc: "One failed question isn't failure. Don't waste more than 60s on one question. Guess based on context and move on.",
      tip: "Time Psychology"
    }
  ];

  const psychologyResets = [
    { title: "Nervous? Reframe as 'Alert'", desc: "Science shows that 'anxiety' and 'excitement' are physically similar. Tell yourself: 'I am alert and ready' instead of 'I am nervous'." },
    { title: "Normalize Mistakes", desc: "Even Band 9 candidates make small slips. The test measures your ability to communicate despite them, not your perfection." }
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 pb-20 animate-in fade-in duration-700">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft text-brand rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Performance Mode
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Mindset & Strategy Lab</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">Build the psychological resilience and technical focus needed to reach your target band.</p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Interactive Coach */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-brand p-10 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Brain className="w-32 h-32" />
               </div>
               <div className="relative z-10">
                 <h2 className="text-2xl font-black mb-2">IELTS Performance Coach</h2>
                 <p className="text-white/70 text-sm font-medium">Professional guidance for technical and psychological hurdles.</p>
               </div>
            </div>

            <div className="p-10 flex-1">
              {advice ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                   <div className="prose prose-slate dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {advice}
                      </div>
                   </div>
                   <button 
                    onClick={() => { setAdvice(null); setQuery(''); }}
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                   >
                     <RefreshCw className="w-4 h-4" /> New Session
                   </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">How can I help you today?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "I freeze during Speaking",
                      "Writing Task 2 feels overwhelming",
                      "I keep making silly Reading errors",
                      "I'm scared of getting a low band"
                    ].map((q) => (
                      <button 
                        key={q} 
                        onClick={() => handleGetAdvice(q)}
                        className="px-6 py-4 text-left bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-soft border border-slate-100 dark:border-slate-800 hover:border-brand rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <textarea 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Describe your specific concern (e.g., 'I lose focus in Listening Section 4')..."
                      className="w-full h-32 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none font-medium mb-4"
                    />
                    <button
                      onClick={() => handleGetAdvice()}
                      disabled={isCoaching || !query.trim()}
                      className="w-full py-5 bg-brand text-white rounded-[28px] font-black flex items-center justify-center gap-3 shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isCoaching ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Zap className="w-5 h-5" /> GET COACHING</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Tools */}
        <div className="lg:col-span-5 space-y-6">
          {/* Panic Reset */}
          <div className="bg-rose-500 rounded-[40px] p-8 text-white shadow-xl shadow-rose-200 dark:shadow-none">
             <div className="flex items-center gap-3 mb-6">
               <div className="bg-white/20 p-2.5 rounded-2xl">
                 <Wind className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-black">Reset Focus</h3>
             </div>
             <p className="text-rose-100 text-sm font-medium mb-8 leading-relaxed">Feeling overwhelmed? This 3-breath cycle resets your nervous system instantly.</p>
             <button 
              onClick={() => handleGetAdvice("Provide a quick 1-minute mindfulness reset for immediate anxiety.")}
              className="w-full py-4 bg-white text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
             >
               START 60S RESET
             </button>
          </div>

          {/* Technical Strategies */}
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-brand" /> Strategy Vault
             </h3>
             <div className="space-y-6">
                {strategyCards.map((card, i) => (
                  <div key={i} className="group cursor-help">
                    <div className="flex items-start gap-4 mb-2">
                       <div className="bg-brand-soft p-2 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-all">
                         <card.icon className="w-4 h-4" />
                       </div>
                       <div>
                         <p className="text-sm font-black text-slate-800 dark:text-white">{card.title}</p>
                         <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">{card.desc}</p>
                       </div>
                    </div>
                    <div className="ml-10 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[9px] font-black text-brand inline-block uppercase tracking-wider">
                       Secret: {card.tip}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Psychology Tips */}
          <div className="bg-slate-900 rounded-[40px] p-8 text-white">
             <h3 className="text-[10px] font-black text-brand uppercase tracking-widest mb-6">Psychological Resilience</h3>
             <div className="space-y-6">
               {psychologyResets.map((reset, i) => (
                 <div key={i} className="space-y-2">
                    <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-brand" /> {reset.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{reset.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindsetSection;
