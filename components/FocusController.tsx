
import React, { useState } from 'react';
import { 
  Headphones, Play, Pause, Volume2, 
  ChevronRight, Sparkles, Brain, Info,
  Wind, Music, Coffee
} from 'lucide-react';
import { FocusSettings } from '../types';

interface FocusControllerProps {
  settings: FocusSettings;
  onUpdate: (updates: Partial<FocusSettings>) => void;
}

const FocusController: React.FC<FocusControllerProps> = ({ settings, onUpdate }) => {
  const [showCoach, setShowCoach] = useState(false);

  const tracks = [
    { name: "Deep Study", icon: Brain, color: "text-brand" },
    { name: "Soft Rain", icon: Wind, color: "text-blue-400" },
    { name: "City Cafe", icon: Coffee, color: "text-amber-500" }
  ];

  return (
    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group">
      {settings.isEnabled && (
        <div className="absolute inset-0 bg-brand/5 animate-pulse -z-10"></div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${settings.isEnabled ? 'bg-brand text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Focus Mode</span>
        </div>
        <button 
          onClick={() => onUpdate({ isEnabled: !settings.isEnabled })}
          className={`w-10 h-5 rounded-full p-1 transition-colors ${settings.isEnabled ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'}`}
        >
          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.isEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </button>
      </div>

      {settings.isEnabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${tracks[settings.trackIndex].color}`}>
                 {React.createElement(tracks[settings.trackIndex].icon, { className: "w-4 h-4" })}
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{tracks[settings.trackIndex].name}</p>
                 <p className="text-[8px] text-slate-400 font-bold">ATMOSPHERE ON</p>
               </div>
             </div>
             <button 
               onClick={() => onUpdate({ trackIndex: (settings.trackIndex + 1) % tracks.length })}
               className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
             >
               <ChevronRight className="w-4 h-4 text-slate-400" />
             </button>
          </div>

          <div className="flex items-center gap-3 px-1">
            <Volume2 className="w-3 h-3 text-slate-400" />
            <input 
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => onUpdate({ volume: parseFloat(e.target.value) })}
              className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand"
            />
          </div>

          <button 
            onMouseEnter={() => setShowCoach(true)}
            onMouseLeave={() => setShowCoach(false)}
            className="w-full py-1.5 bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-brand hover:border-brand transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-2.5 h-2.5" /> Why Focus?
          </button>

          {showCoach && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in zoom-in-95 z-50">
               <div className="flex items-center gap-2 mb-2">
                 <Brain className="w-4 h-4 text-brand" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-brand">Focus Coach</p>
               </div>
               <p className="text-[10px] leading-relaxed text-slate-300 font-medium">
                 Low-tempo, lyric-free sound reduces mental noise and exam anxiety. It helps you stay present during long writing tasks.
               </p>
               <div className="absolute bottom-0 left-6 w-3 h-3 bg-slate-900 rotate-45 translate-y-1.5"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FocusController;
