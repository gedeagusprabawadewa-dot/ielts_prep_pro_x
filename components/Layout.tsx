
import React from 'react';
import { BookOpen, Mic, LayoutDashboard, LogOut, GraduationCap, Moon, Sun, Palette, Library, Mail, MapPin, User as UserIcon, Heart, ShieldAlert, Lightbulb, BadgeCheck } from 'lucide-react';
import { AppTheme, AccentColor, AuthMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userEmail?: string;
  theme: AppTheme;
  accentColor: AccentColor;
  onToggleTheme: () => void;
  onChangeAccent: (color: AccentColor) => void;
  authMode: AuthMode;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, onTabChange, onLogout, userEmail, 
  theme, accentColor, onToggleTheme, onChangeAccent
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'writing', label: 'Writing Practice', icon: BookOpen },
    { id: 'reading', label: 'Reading Practice', icon: Library },
    { id: 'speaking', label: 'Speaking Practice', icon: Mic },
  ];

  const colors: { id: AccentColor; class: string }[] = [
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'emerald', class: 'bg-emerald-500' },
    { id: 'indigo', class: 'bg-indigo-500' },
    { id: 'rose', class: 'bg-rose-500' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex transition-colors duration-300 z-30">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand p-2 rounded-lg shadow-lg shadow-brand/10 transition-colors">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">IELTS Prep</span>
          </div>
          <span className="px-1.5 py-0.5 bg-brand/10 text-brand text-[8px] font-black rounded uppercase tracking-tighter border border-brand/20">v1.0.0</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={`Go to ${item.label}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : ''}`} />
              {item.label}
            </button>
          ))}
          
          <div className="pt-8 pb-2 px-4">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Settings & UI</p>
          </div>

          <div className="px-2 space-y-2">
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Theme
              </div>
              <div className={`w-10 h-5 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-brand' : 'bg-slate-300'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </button>

            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Palette className="w-4 h-4" /> Accent Color
              </div>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onChangeAccent(c.id)}
                    className={`w-6 h-6 rounded-full ${c.class} transition-all ${accentColor === c.id ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mx-4 mt-8 p-4 bg-brand/5 dark:bg-brand/10 border border-brand/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-brand" />
              <p className="text-[10px] font-black text-brand uppercase tracking-wider">Public Beta</p>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-tight mb-3">Help us improve the AI by sharing your thoughts.</p>
            <a 
              href="mailto:balipastika@gmail.com?subject=IELTS%20Prep%20Pro%3A%20Feedback%20%26%20Suggestions" 
              className="w-full py-2 bg-white dark:bg-slate-800 border border-brand/10 hover:border-brand text-brand text-[9px] font-black rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              SHARE SUGGESTION
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-black">
              {userEmail?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{userEmail}</p>
              <div className="flex items-center gap-1">
                <BadgeCheck className="w-2.5 h-2.5 text-brand" />
                <p className="text-[8px] text-brand uppercase tracking-widest font-black">Verified Beta User</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mb-4"
          >
            <LogOut className="w-4 h-4" />
            End Practice
          </button>

          <div className="px-4 py-3 bg-slate-900 text-white rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Heart className="w-12 h-12" />
            </div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Creator</p>
            <p className="text-[10px] font-bold mb-2">Dewa Prabawa</p>
            <a 
              href="mailto:balipastika@gmail.com?subject=Support%20for%20IELTS%20Prep%20Pro" 
              className="flex items-center gap-1.5 text-[9px] font-black text-brand hover:text-white transition-colors uppercase tracking-widest"
            >
              <Heart className="w-2.5 h-2.5 fill-brand" /> Support Project
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between transition-colors z-20">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand" />
            <span className="font-bold text-lg dark:text-white">IELTS Prep</span>
            <span className="ml-1 px-1.5 py-0.5 bg-brand/10 text-brand text-[8px] font-black rounded uppercase border border-brand/20">BETA</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onToggleTheme} className="text-slate-600 dark:text-slate-400 p-2"><Moon className="w-5 h-5" /></button>
            <button onClick={onLogout} className="text-slate-600 dark:text-slate-400 p-2"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {children}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around transition-colors z-20">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.id ? 'text-brand' : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
