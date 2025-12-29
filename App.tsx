
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AcademySection from './components/AcademySection';
import WritingSection from './components/WritingSection';
import SpeakingSection from './components/SpeakingSection';
import ReadingSection from './components/ReadingSection';
import MindsetSection from './components/MindsetSection';
import { getSessionUser, loginUserLocal, updateUserData } from './services/storageService';
import { User, AppTheme, AccentColor, FocusSettings } from './types';
import { 
  GraduationCap, ArrowRight, Sparkles, Zap, 
  Mic, Moon, Sun, Quote, Trophy, MapPin, 
  Database, User as UserIcon, Loader2, AlertCircle, 
  CheckCircle2, BookOpen, Library, Mail, Heart, Info, Lightbulb,
  ShieldCheck, Globe, Star, BadgeCheck, Compass, MessageSquareHeart
} from 'lucide-react';

const TRACK_URLS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", 
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",  
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"   
];

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
              <span className="inline-block px-3 py-1 rounded-full bg-brand-soft text-brand text-[10px] font-black uppercase tracking-widest mb-2">
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
  const [activeTab, setActiveTab] = useState('academy');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [focusSettings, setFocusSettings] = useState<FocusSettings>({
    isEnabled: false,
    volume: 0.3,
    trackIndex: 0
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedUser = getSessionUser();
    if (savedUser) {
      setUser(savedUser);
      applyTheme(savedUser.theme || 'light', savedUser.accentColor || 'emerald');
      // Default to Academy if placement isn't done
      if (!savedUser.academyProgress?.level || savedUser.academyProgress.level === 'unassigned') {
        setActiveTab('academy');
      }
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(TRACK_URLS[focusSettings.trackIndex]);
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;
    audio.volume = focusSettings.volume;

    const shouldBePlaying = focusSettings.isEnabled && activeTab !== 'speaking';

    if (shouldBePlaying) {
      audio.src = TRACK_URLS[focusSettings.trackIndex];
      audio.play().catch(e => console.warn("Audio play blocked"));
    } else {
      audio.pause();
    }

    return () => { audio.pause(); };
  }, [focusSettings.isEnabled, focusSettings.trackIndex, focusSettings.volume, activeTab]);

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
        applyTheme(newTheme, updated.accentColor || 'emerald');
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

  const handleUpdateFocus = (updates: Partial<FocusSettings>) => {
    setFocusSettings(prev => ({ ...prev, ...updates }));
  };

  const handleStartTrial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError("Please enter a valid academic or professional email.");
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    setTimeout(() => {
      const newUser = loginUserLocal(email);
      setUser(newUser);
      applyTheme(newUser.theme || 'light', newUser.accentColor || 'emerald');
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('ielts_prep_user');
    localStorage.removeItem('ielts_prep_submissions');
    setUser(null);
    window.document.documentElement.classList.remove('dark', 'theme-blue', 'theme-emerald', 'theme-indigo', 'theme-rose');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center gap-3">
               <div className="bg-brand-soft p-2 rounded-xl">
                 <BadgeCheck className="w-5 h-5 text-brand" />
               </div>
               <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                 Currently in <span className="text-brand">Public Beta v1.3.0</span>. Optimized for Indonesian Scholarship Candidates.
               </p>
             </div>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
                  <Globe className="w-3 h-3" /> Global Standards
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
                  <Star className="w-3 h-3 text-amber-400" /> AI Grounding
                </div>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 mb-24 min-h-[70vh]">
            <div className="lg:w-1/2 flex flex-col justify-center">
              <div className="mb-8 flex items-center gap-3">
                <div className="bg-brand p-3 rounded-2xl shadow-2xl shadow-brand/20 animate-float">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">IELTS Prep Pro</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Edition</p>
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
                The Scholarship <br/>
                <span className="text-brand">Gold Standard.</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
                Experience elite AI evaluation. Achieve your target band with precision-engineered feedback modules for Indonesian students.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                 <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:border-brand transition-colors">
                    <div className="bg-brand-soft p-2 rounded-xl text-brand"><Compass className="w-5 h-5" /></div>
                    <div>
                       <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">Scholarship Academy</p>
                       <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Foundation, Bridge, and Beginner modules for all learners.</p>
                    </div>
                 </div>
                 <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:border-brand transition-colors">
                    <div className="bg-brand-soft p-2 rounded-xl text-brand"><Mic className="w-5 h-5" /></div>
                    <div>
                       <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">Speech Analysis</p>
                       <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Instant native-level assessment of fluency & intonation.</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Begin Practice</h3>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-500 font-medium mb-6">Enter your email for immediate scholarship-standard assessment.</p>

                <form onSubmit={handleStartTrial} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all bg-slate-50 dark:bg-slate-800 dark:text-white font-bold"
                  />
                  {authError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-100">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {authError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-brand text-white rounded-2xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand/30 flex items-center justify-center gap-3 group text-lg"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        Start Training Session
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
                <p className="mt-4 text-[9px] text-slate-400 text-center font-medium leading-relaxed italic">
                  *This content is independently created for IELTS preparation purposes and is not affiliated with or endorsed by IELTS, British Council, IDP, or Cambridge.
                </p>
              </div>
            </div>

            <div className="lg:w-1/2 bg-brand rounded-[40px] relative overflow-hidden hidden lg:block shadow-2xl shadow-brand/40">
              <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-hover opacity-90"></div>
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" 
                alt="Students studying"
              />
              <div className="absolute top-[10%] left-[10%] p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl animate-float">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand font-black text-xl">8.5</div>
                    <div>
                      <p className="text-white font-black text-sm uppercase tracking-widest">Scholarship Target</p>
                      <p className="text-white/70 text-xs">University of Oxford</p>
                    </div>
                 </div>
                 <div className="flex gap-1">
                   {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-300 text-amber-300" />)}
                 </div>
              </div>
            </div>
          </div>

          <Testimonials />

          <footer className="mt-32 pt-16 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start justify-between gap-16 pb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2.5 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">IELTS Prep Pro</p>
                  <p className="text-[10px] font-black text-brand uppercase tracking-widest">Scholarship Mastery Edition</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                Empowering Indonesian students with expert AI-driven evaluation. Built for the scholarship dreamers of LPDP, AAS, and BPI.
              </p>
              <p className="text-[9px] text-slate-400 font-medium italic">
                Disclaimer: Not affiliated with or endorsed by IELTS, British Council, IDP, or Cambridge.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 flex-1">
              <div className="flex flex-col items-start">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Contact & Feedback</p>
                <a href="mailto:balipastika@gmail.com?subject=Feedback:%20IELTS%20Prep%20Pro" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-brand transition-colors mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Support
                </a>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                  "Feedback helps us always improve the app."
                </p>
              </div>

              <div className="flex flex-col items-start">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Creator & Support</p>
                <div className="mb-4">
                  <p className="text-[11px] font-black text-slate-900 dark:text-white">Dewa Prabawa</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand" /> Bali, Ubud, Gianyar
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">balipastika@gmail.com</p>
                </div>
                <a href="mailto:balipastika@gmail.com?subject=Support%20IELTS%20Prep%20Pro" className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-hover transition-all shadow-lg shadow-brand/20">
                  <Heart className="w-3 h-3 fill-current" /> Donate / Support
                </a>
              </div>
            </div>
          </footer>
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
      accentColor={user.accentColor || 'emerald'}
      onToggleTheme={handleToggleTheme}
      onChangeAccent={handleChangeAccent}
      authMode={user.authMode}
      focusSettings={focusSettings}
      onUpdateFocus={handleUpdateFocus}
    >
      {activeTab === 'academy' && <AcademySection />}
      {activeTab === 'foundations' && <AcademySection />}
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'writing' && <WritingSection />}
      {activeTab === 'reading' && <ReadingSection />}
      {activeTab === 'speaking' && <SpeakingSection />}
      {activeTab === 'mindset' && <MindsetSection />}
    </Layout>
  );
};

export default App;
