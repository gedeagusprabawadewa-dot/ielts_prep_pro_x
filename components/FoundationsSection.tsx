
import React from 'react';
import { FOUNDATION_LESSONS } from '../constants';
import { Lesson } from '../types';
import { 
  GraduationCap, BookOpen, Mic, Library, 
  ArrowRight, Sparkles, CheckCircle2, Info, 
  Search, ShieldCheck, Heart, Zap
} from 'lucide-react';

const FoundationsSection: React.FC = () => {
  const getIcon = (category: Lesson['category']) => {
    switch (category) {
      case 'basics': return <Sparkles className="w-5 h-5" />;
      case 'writing': return <BookOpen className="w-5 h-5" />;
      case 'reading': return <Library className="w-5 h-5" />;
      case 'speaking': return <Mic className="w-5 h-5" />;
      default: return <GraduationCap className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 pb-20 animate-in fade-in duration-700">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft text-brand rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5" /> Start From Zero
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">IELTS Foundations</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Your first step in the IELTS journey. No prior knowledge required.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {FOUNDATION_LESSONS.map((lesson) => (
          <div 
            key={lesson.id} 
            className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-10 border-b border-slate-50 dark:border-slate-800/50 flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-brand-soft p-3 rounded-2xl text-brand">
                  {getIcon(lesson.category)}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{lesson.title}</h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8">
                {lesson.content}
              </p>

              <div className="space-y-4">
                {lesson.bullets.map((bullet, i) => (
                  <div key={i} className="flex gap-4 items-start text-sm font-bold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    {bullet}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/30">
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Teacher's Note</p>
                    <p className="text-sm font-medium italic text-slate-500 leading-relaxed">
                      "{lesson.teacherTip}"
                    </p>
                  </div>
               </div>
            </div>
          </div>
        ))}

        <div className="bg-slate-900 dark:bg-black rounded-[40px] p-10 text-white flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-10">
             <ShieldCheck className="w-48 h-48" />
           </div>
           <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4">Phase 1: Awareness</h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-8">
                You've completed the basic awareness training. Now you know the structure and goals of the test. 
              </p>
              <button className="w-full py-5 bg-brand text-white rounded-3xl font-black flex items-center justify-center gap-3 group">
                Continue to Guided Practice <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationsSection;
