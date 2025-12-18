
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WritingSection from './components/WritingSection';
import SpeakingSection from './components/SpeakingSection';
import ReadingSection from './components/ReadingSection';
import { getSessionUser, loginUserLocal, updateUserData } from './services/storageService';
import { User, AppTheme, AccentColor } from './types';
import { 
  GraduationCap, ArrowRight, Sparkles, Zap, 
  Mic, Moon, Sun, Quote, Trophy, MapPin, 
  Database, User as UserIcon, Loader2, AlertCircle, 
  CheckCircle2, BookOpen, Library
} from 'lucide-react';

const Testimonials = () => {
  const stories = [
    {
      name: "Aditya Pratama",
      scholarship: "LPDP Awardee 2024",
      destination: "MSc at University of Edinburgh",
      score: "6.5 → 8.0",
      text: "The Writing Task 2 feedback was precise. It caught my repetitive vocabulary that even my human tutors missed. Essential for LPDP prep!",
      avatar: "AP"
    },
    {
      name: "Siti Rahayu",
      scholarship: "AAS Scholar",
      destination: "PhD at University of Melbourne",
      score: "7.0 → 7.5",
      text: "Speaking practice helped me master the Australian accent nuances. The transcript analysis is a game changer for fluency.",
      avatar: "SR"
    },
    {
      name: "Budi Santoso",
      scholarship: "BPI (Kemendikbud) Awardee",
      destination: "MEd at Harvard University",
      score: "6.0 → 7.5",
      text: "I was struggling with Task 1 Data description. This app taught me how to highlight key trends effectively. Highly recommended!",
      avatar: "BS"
    }
  ];

  return (
    <div className="mt-24 space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Wall of Scholarship Fame</h2>
        <p className="text-slate-500 dark:text-slate-400">Join 10,000+ Indonesian scholars who reached their target band.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stories.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center font-black text-lg">
                {s.avatar}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{s.name}</h4>
                <div className="flex items-center gap-1 text-brand font-bold text-[10px] uppercase tracking-wider">
                  <Trophy className="w-3 h-3" /> {s.scholarship}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
                Result: {s.score}
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {s.destination}
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic relative">
              <Quote className="absolute -top-4 -left-2 w-8 h-8 text-slate-100 dark:text-slate-800 -z-10" />
              "{s.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = getSessionUser();
    if (savedUser) {
      setUser(savedUser);
      applyTheme(savedUser.theme || 'light', savedUser.accentColor || 'blue');
    }
  }, []);

  const applyTheme = (theme: AppTheme, accent: AccentColor) => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.classList.remove('theme-blue', 'theme-emerald', 'theme-indigo', 'theme-rose');
    root.classList.add(`theme-${accent}`);
  };

  const handleToggleTheme = () => {
    if (!user) return;
    const newTheme = user.theme === 'dark' ? 'light' : 'dark';
    updateUserData({ theme: newTheme }).then(updated => {
      if (updated) {
        setUser(updated);
        applyTheme(newTheme, updated.accentColor || 'blue');
      }
    });
  };

  const handleChangeAccent = (color: AccentColor) => {
    if (!user) return;
    updateUserData({ accentColor: color }).then(updated => {
      if (updated) {
        setUser(updated);
        applyTheme(updated.theme || 'light', color);
      }
    });
  };

  const handleStartTrial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setAuthError("Please enter your email to start practicing.");
      return;
    }
    setIsLoading(true);
    // Simulate a brief loading for feel
    setTimeout(() => {
      const newUser = loginUserLocal(email);
      setUser(newUser);
      applyTheme(newUser.theme || 'light', newUser.accentColor || 'blue');
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('ielts_prep_user');
    localStorage.removeItem('ielts_prep_submissions');
    setUser(null);
    window.document.documentElement.classList.remove('dark', 'theme-emerald', 'theme-indigo', 'theme-rose');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row gap-12 mb-24 min-h-[70vh]">
            <div className="lg:w-1/2 flex flex-col justify-center">
              <div className="mb-8 flex items-center gap-3">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-200">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">IELTS Prep Pro</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
                Scholarship standard <br/>
                <span className="text-blue-600">IELTS Training.</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
                Expert-level AI feedback for Writing, Speaking, and Reading. No password required—start your preparation journey instantly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                 <div className="p-5 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl text-blue-600"><BookOpen className="w-5 h-5" /></div>
                    <div>
                       <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">Writing Labs</p>
                       <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Task 1 & 2 analysis with band-upgrade suggestions.</p>
                    </div>
                 </div>
                 <div className="p-5 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl text-emerald-600"><Mic className="w-5 h-5" /></div>
                    <div>
                       <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">Speaking Studio</p>
                       <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Real-time fluency and pronunciation scoring.</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none max-w-md">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Get Started</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">Enter your email to create an instant session.</p>

                <form onSubmit={handleStartTrial} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50 dark:bg-slate-800 dark:text-white font-bold"
                    />
                  </div>
                  
                  {authError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/30">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group text-lg"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        Start Free Practice
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                    No credit card required • Instant access
                  </p>
                </form>
              </div>
            </div>

            {/* Visual Column */}
            <div className="lg:w-1/2 bg-blue-600 rounded-[40px] relative overflow-hidden hidden lg:block shadow-2xl shadow-blue-900/40">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square bg-white/5 rounded-full blur-3xl"></div>
              
              <div className="absolute top-[15%] right-[10%] p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl animate-bounce duration-[4000ms]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold">8.0</div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Writing Mastery</p>
                </div>
              </div>

              <div className="absolute bottom-[20%] left-[10%] p-6 bg-slate-900 dark:bg-black text-white rounded-3xl shadow-2xl max-w-[320px]">
                 <div className="flex items-center gap-2 mb-3">
                   <Trophy className="w-4 h-4 text-amber-300" />
                   <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Target: University of Cambridge</span>
                 </div>
                 <p className="text-sm leading-relaxed text-slate-300">"Personalized feedback loops helping you reach that Band 8.5 with surgical precision."</p>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5">
                <Sparkles className="w-64 h-64" />
              </div>
            </div>
          </div>

          <Testimonials />
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
      theme={user.theme || 'light'}
      accentColor={user.accentColor || 'blue'}
      onToggleTheme={handleToggleTheme}
      onChangeAccent={handleChangeAccent}
      authMode={user.authMode}
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'writing' && <WritingSection />}
      {activeTab === 'reading' && <ReadingSection />}
      {activeTab === 'speaking' && <SpeakingSection />}
    </Layout>
  );
};

export default App;
