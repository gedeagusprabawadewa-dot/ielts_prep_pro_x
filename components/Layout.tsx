
import React from 'react';
import { 
  BookOpen, Mic, LayoutDashboard, LogOut, GraduationCap, 
  Moon, Sun, Palette, Library, Mail, MapPin, 
  User as UserIcon, Heart, ShieldAlert, Lightbulb, 
  BadgeCheck, Brain, Compass, MessageCircle, Menu, X
} from 'lucide-react';
import { AppTheme, AccentColor, AuthMode, FocusSettings } from '../types';
import FocusController from './FocusController';

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
  focusSettings: FocusSettings;
  onUpdateFocus: (updates: Partial<FocusSettings>) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, onTabChange, onLogout, userEmail, 
  theme, accentColor, onToggleTheme, onChangeAccent,
  focusSettings, onUpdateFocus
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'academy', label: 'Academy', icon: GraduationCap },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'writing', label: 'Writing', icon: BookOpen },
    { id: 'reading', label: 'Reading', icon: Library },
    { id: 'speaking', label: 'Speaking', icon: Mic },
    { id: 'mindset', label: 'Mindset', icon: Brain },
  ];

  const handleTabClick = (id: string) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden lg:flex transition-colors duration-300 z-30">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand p-2 rounded-lg shadow-lg shadow-brand/10 transition-colors">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">IELTS Prep</span>
          </div>
          <span className="px-1.5 py-0.5 bg-brand/10 text-brand text-[8px] font-black rounded uppercase tracking-tighter border border-brand/20">v1.3.0</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
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
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Settings</p>
          </div>

          <div className="px-2 space-y-3">
            <FocusController settings={focusSettings} onUpdate={onUpdateFocus} />
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
          </div>
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-black text-sm shadow-md">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">Scholar</p>
              <p className="text-[10px] text-slate-500 truncate">{userEmail || 'trial@ielts.pro'}</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            End Practice
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between transition-colors z-40 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="bg-brand p-1.5 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-base dark:text-white tracking-tight uppercase">Prep Pro</span>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={onToggleTheme} className="p-2 text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl">
               {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-brand bg-brand-soft rounded-xl">
               {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
          </div>
        </header>

        {/* Mobile Overlay Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-top-4 lg:hidden pt-20">
            <nav className="p-6 space-y-2">
              <div className="flex items-center gap-4 p-5 mb-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white font-black text-lg">
                  {userInitial}
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white">{userEmail || 'Guest Scholar'}</p>
                  <p className="text-xs text-brand font-bold uppercase tracking-widest">Active Session</p>
                </div>
              </div>

              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-3xl text-lg font-black transition-all ${
                    activeTab === item.id 
                      ? 'bg-brand text-white shadow-2xl shadow-brand/20' 
                      : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
              <div className="pt-6">
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-5 text-red-600 font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/10 rounded-3xl">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth pb-24 lg:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Navigation - Sleek & Modern */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[32px] flex items-center justify-around px-2 shadow-2xl z-40">
          {menuItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                activeTab === item.id ? 'text-brand' : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {activeTab === item.id && (
                <span className="absolute -bottom-1 w-1 h-1 bg-brand rounded-full"></span>
              )}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
