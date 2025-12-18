
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WritingSection from './components/WritingSection';
import SpeakingSection from './components/SpeakingSection';
import { getSessionUser, loginUser, logoutUser } from './services/storageService';
import { User } from './types';
// Fix: Added missing Mic icon import
import { GraduationCap, ArrowRight, Sparkles, ShieldCheck, Zap, Mic } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const savedUser = getSessionUser();
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const newUser = loginUser(email);
      setUser(newUser);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        <div className="lg:w-1/2 p-8 lg:p-24 flex flex-col justify-center">
          <div className="mb-12 flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-200">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">IELTS Prep Pro</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
            Master your IELTS <br/>
            <span className="text-blue-600">with AI Feedback.</span>
          </h1>
          <p className="text-lg text-slate-500 mb-12 max-w-lg leading-relaxed">
            Get instant Band 9 level insights on your Writing and Speaking. No more waiting days for feedback.
          </p>

          <form onSubmit={handleLogin} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group"
            >
              Start Free Practice
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-sm">Instant Scoring</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Grammar Correction</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">IELTS Criteria</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-[20%] right-[10%] p-6 bg-white rounded-3xl shadow-2xl animate-bounce duration-[3000ms]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">7.5</div>
              <p className="text-xs font-bold text-slate-800">Excellent Coherence!</p>
            </div>
          </div>
          <div className="absolute bottom-[20%] left-[15%] p-6 bg-slate-900 text-white rounded-3xl shadow-2xl">
             <div className="flex items-center gap-2 mb-3">
               <Mic className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Analysis</span>
             </div>
             <p className="text-sm leading-relaxed text-slate-300">"Your pronunciation of 'th' sounds is improving. Focus on intonation next."</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={handleLogout}
      userEmail={user.email}
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'writing' && <WritingSection />}
      {activeTab === 'speaking' && <SpeakingSection />}
    </Layout>
  );
};

export default App;
