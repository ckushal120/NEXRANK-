/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, BookOpen, Layers, UploadCloud, Swords, Star, 
  HelpCircle, Sparkles, Moon, Sun, ShieldCheck, Zap,
  Compass, Flame, Award
} from 'lucide-react';
import { Question, TestSession } from './types';
import Dashboard from './components/Dashboard';
import TestEngine from './components/TestEngine';
import Uploader from './components/Uploader';
import AdventureMap from './components/AdventureMap';
import QuestSystem from './components/QuestSystem';
import RevisionCenter from './components/RevisionCenter';
import AICoach from './components/AICoach';

export function BrandLogo({ className = "w-12 h-12", withText = false }: { className?: string; withText?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center ${withText ? 'space-y-3' : ''}`}>
      <div className={`relative ${className} shrink-0`}>
        <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(59,130,246,0.15)] animate-bounce-slow" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="logoOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <linearGradient id="logoOrbit" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {/* Stars above the logo */}
          <path d="M120,25 L121.5,31 L127,32 L121.5,33 L120,39 L118.5,33 L113,32 L118.5,31 Z" fill="#EAB308" />
          <path d="M106,42 L106.8,45 L110,45.5 L106.8,46 L106,49 L105.2,46 L102,45.5 L105.2,45 Z" fill="#06B6D4" />
          <path d="M133,40 L133.8,43 L137,43.5 L133.8,44 L133,47 L132.2,44 L129,43.5 L132.2,43 Z" fill="#8B5CF6" />

          {/* Letter N (Polygonal Futuristic blocky blue character) */}
          <path d="M55,108 L68,108 L68,60 C68,60 62,64 55,70 Z" fill="url(#logoBlue)" />
          <path d="M68,60 L96,108 L108,108 L74,56 Z" fill="url(#logoBlue)" />
          <path d="M96,80 L96,108 L108,108 L108,60 Z" fill="url(#logoBlue)" />

          {/* Letter R (Orange/red character with futuristic loop and leg) */}
          <path d="M108,60 H140 C154,60 162,66 162,76 C162,85 152,90 140,90 H108 Z" fill="url(#logoOrange)" />
          <path d="M125,90 L156,120 H170 L136,90 Z" fill="url(#logoOrange)" />

          {/* Curved swooshing Orbit line */}
          <path d="M40,110 C45,135 100,125 152,70 C162,60 170,50 178,40" stroke="url(#logoOrbit)" strokeWidth="6.5" strokeLinecap="round" />

          {/* Soaring Rocket Ship at top right */}
          <g transform="translate(178, 38) rotate(-45)">
            <path d="M-2,6 L2,6 L0,11 Z" fill="#EF4444" />
            <path d="M-1,6 L1,6 L0,9 Z" fill="#F59E0B" />
            <path d="M-3.5,-6 L3.5,-6 L4,3 L-4,3 Z" fill="#1E3A8A" />
            <path d="M-3.5,-6 C-3.5,-12 0,-16 0,-16 C0,-16 3.5,-12 3.5,-6 Z" fill="#1D4ED8" />
            <path d="M-3.5,0 L-7,4 L-4,4 Z" fill="#3B82F6" />
            <path d="M3.5,0 L7,4 L4,4 Z" fill="#3B82F6" />
            <circle cx="0" cy="-4" r="1.5" fill="#E0F2FE" />
          </g>
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col items-center text-center space-y-1">
          <h1 className="text-2xl font-black tracking-wider flex items-center justify-center font-sans">
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#1D4ED8] bg-clip-text text-transparent font-sans">NEX</span>
            <span className="bg-gradient-to-r from-[#EA580C] to-[#EF4444] bg-clip-text text-transparent font-sans">RANK</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold leading-none">PRACTICE  •  ANALYZE  •  ACHIEVE</p>
          
          {/* Logo Book graphic */}
          <div className="flex items-center gap-2 pt-1 pb-1">
            <div className="h-[1.5px] w-8 bg-gradient-to-r from-transparent to-[#1D4ED8]" />
            <svg className="w-5 h-4 text-[#1D4ED8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <div className="h-[1.5px] w-8 bg-gradient-to-l from-transparent to-[#EF4444]" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'adventure' | 'tests' | 'quests' | 'revision' | 'coach' | 'ocr'>('adventure');
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [ocrPrelaunchQuestion, setOcrPrelaunchQuestion] = useState<Question | null>(null);
  const [prelaunchedSession, setPrelaunchedSession] = useState<TestSession | null>(null);

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('nexrank_logged_in') === 'true';
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('nexrank_user_email') || '';
  });
  const [aspirantName, setAspirantName] = useState(() => {
    return localStorage.getItem('quantum_jee_nickname') || 'Aspirant';
  });

  // State inside login form
  const [inputEmail, setInputEmail] = useState('ckushal120@gmail.com'); // Prefilled with active user email for frictionless login!
  const [inputPassword, setInputPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Gamification core states
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('nexrank_xp') || '120', 10));
  const [coins, setCoins] = useState(() => parseInt(localStorage.getItem('nexrank_coins') || '84', 10));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('nexrank_streak') || '3', 10));
  
  const [unlockedLocations, setUnlockedLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexrank_unlocked_locations');
    return saved ? JSON.parse(saved) : ['w1-n1'];
  });

  const [clearedBosses, setClearedBosses] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexrank_cleared_bosses');
    return saved ? JSON.parse(saved) : [];
  });

  const [equippedTitle, setEquippedTitle] = useState(() => {
    const nick = localStorage.getItem('quantum_jee_nickname');
    if (nick) return nick;
    return localStorage.getItem('nexrank_equipped_title') || 'Aspirant';
  });

  const [mistakes, setMistakes] = useState<any[]>([]);

  // Theme support - Enforced light day-mode permanently as requested
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => {};

  useEffect(() => {
    // Permanently disable dark class and force light styling
    document.documentElement.classList.remove('dark');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nexrank_logged_in');
    localStorage.removeItem('nexrank_user_email');
    localStorage.removeItem('quantum_jee_nickname');
    setIsLoggedIn(false);
    setUserEmail('');
    setAspirantName('Aspirant');
    setEquippedTitle('Aspirant');
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return 'Aspirant';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes('@')) {
      setLoginError('❌ Oops! Please write a correct Gmail address with @ symbol inside!');
      return;
    }
    
    const baseName = inputEmail.split('@')[0];
    const extractedName = capitalizeFirstLetter(baseName);
    
    localStorage.setItem('nexrank_logged_in', 'true');
    localStorage.setItem('nexrank_user_email', inputEmail);
    localStorage.setItem('quantum_jee_nickname', extractedName);
    
    setIsLoggedIn(true);
    setUserEmail(inputEmail);
    setAspirantName(extractedName);
    setEquippedTitle(extractedName);
    setLoginError('');
  };

  const handleGoogleQuickLogin = () => {
    const targetEmail = inputEmail || 'ckushal120@gmail.com';
    const baseName = targetEmail.split('@')[0];
    const extractedName = capitalizeFirstLetter(baseName);

    localStorage.setItem('nexrank_logged_in', 'true');
    localStorage.setItem('nexrank_user_email', targetEmail);
    localStorage.setItem('quantum_jee_nickname', extractedName);

    setIsLoggedIn(true);
    setUserEmail(targetEmail);
    setAspirantName(extractedName);
    setEquippedTitle(extractedName);
    setLoginError('');
  };

  // Analytics helper state
  const [weakChapters, setWeakChapters] = useState<string[]>([]);

  const addXpCoins = (xpToAdd: number, coinsToAdd: number) => {
    const updatedXp = xp + xpToAdd;
    const updatedCoins = coins + coinsToAdd;
    setXp(updatedXp);
    setCoins(updatedCoins);
    localStorage.setItem('nexrank_xp', String(updatedXp));
    localStorage.setItem('nexrank_coins', String(updatedCoins));
  };

  const handleUpdateEquippedTitle = (title: string) => {
    setEquippedTitle(title);
    localStorage.setItem('nexrank_equipped_title', title);
  };

  const handleUnlockedLocation = (nodeId: string) => {
    if (!unlockedLocations.includes(nodeId)) {
      const u = [...unlockedLocations, nodeId];
      setUnlockedLocations(u);
      localStorage.setItem('nexrank_unlocked_locations', JSON.stringify(u));
    }
  };

  const handleClearedBoss = (nodeId: string) => {
    if (!clearedBosses.includes(nodeId)) {
      const u = [...clearedBosses, nodeId];
      setClearedBosses(u);
      localStorage.setItem('nexrank_cleared_bosses', JSON.stringify(u));
    }
  };

  useEffect(() => {
    // Sync mistake book list
    const savedM = localStorage.getItem('quantum_jee_mistake_book');
    if (savedM) {
      try { setMistakes(JSON.parse(savedM)); } catch (e) { console.error(e); }
    }
  }, [activeTab]);

  useEffect(() => {
    // Standard initialization of sessions history
    const saved = localStorage.getItem('quantum_jee_sessions_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TestSession[];
        setTestSessions(parsed);

        // Calculate weak areas based on correct response percentages
        calculateWeakAreas(parsed);
      } catch (e) {
        console.error('Failed parsing logs', e);
      }
    }
  }, []);

  const calculateWeakAreas = (history: TestSession[]) => {
    const chapterTracker: Record<string, { total: number; correct: number }> = {};
    history.forEach((session) => {
      // Look at each question in completed tests and score key
      session.questions.forEach((q) => {
        const ans = session.answers[q.id];
        if (ans !== undefined && ans !== null) {
          const isCorrect = q.questionType === 'Single Choice'
            ? ans === q.correctAnswer
            : q.questionType === 'Numerical'
            ? parseFloat(String(ans)) === parseFloat(String(q.correctAnswer))
            : Array.isArray(ans) && Array.isArray(q.correctAnswer) &&
              ans.length === q.correctAnswer.length && ans.every((x) => (q.correctAnswer as string[]).includes(x));

          if (!chapterTracker[q.chapter]) {
            chapterTracker[q.chapter] = { total: 0, correct: 0 };
          }
          chapterTracker[q.chapter].total += 1;
          if (isCorrect) {
            chapterTracker[q.chapter].correct += 1;
          }
        }
      });
    });

    const weak = Object.entries(chapterTracker)
      .filter(([chap, data]) => {
        const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 100;
        return accuracy < 60; // Accuracy below 60% is flagged weak
      })
      .map(([chap]) => chap);

    setWeakChapters(weak);
  };

  // Callback when a CBT mock test is finished
  const handleTestFinished = (newSession: TestSession) => {
    const updatedHistory = [...testSessions, newSession];
    setTestSessions(updatedHistory);
    localStorage.setItem('quantum_jee_sessions_history', JSON.stringify(updatedHistory));

    // Re-render weak chapters map
    calculateWeakAreas(updatedHistory);

    // Give point rewards
    const currentPoints = Number(localStorage.getItem('quantum_jee_score') || '450');
    let bonusPoints = 100;
    if ((newSession.accuracy || 0) >= 80) bonusPoints += 50;
    const finalPoints = currentPoints + bonusPoints;
    localStorage.setItem('quantum_jee_score', String(finalPoints));

    // Gamified Level Rewards System (XP & Coins)
    const intendedNode = localStorage.getItem('nexrank_intended_clear_node');
    if (intendedNode) {
      if (intendedNode.endsWith('-boss')) {
        // Defeated a Boss!
        handleClearedBoss(intendedNode);
        addXpCoins(150, 100);
        alert(`🏆 WORLD BOSS DEFEATED!\n\nYou successfully took down the boss encounter!\nClaimed: +150 EXP & +100 Coins!\nEquip your new exclusive title inside the Quests screen.`);
      } else {
        // Cleared standard chapter location node
        handleUnlockedLocation(intendedNode);
        addXpCoins(50, 25);
        alert(`✓ LOCATION COMPLETED!\n\nYou successfully cleared the location checkpoint!\nClaimed: +50 EXP & +25 Coins!`);
      }
      
      // Clear intent
      localStorage.removeItem('nexrank_intended_clear_node');
    } else {
      // General custom/CBT mock test finished without adventure map route
      addXpCoins(40, 15);
    }

    // Increment overall solved questions state count
    const numSolved = parseInt(localStorage.getItem('nexrank_questions_solved') || '12', 10);
    localStorage.setItem('nexrank_questions_solved', String(numSolved + newSession.questions.length));

    // Increment streak
    const lastActiveDate = localStorage.getItem('quantum_jee_last_active_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastActiveDate !== todayStr) {
      const currentStreak = Number(localStorage.getItem('quantum_jee_streak') || '3');
      const updatedStreak = currentStreak + 1;
      setStreak(updatedStreak);
      localStorage.setItem('quantum_jee_streak', String(updatedStreak));
      localStorage.setItem('nexrank_streak', String(updatedStreak));
      localStorage.setItem('quantum_jee_last_active_date', todayStr);
    }
  };

  // Convert OCR question directly into instant quiz session
  const handleOCRQuestionExtractedJoinQuiz = (q: Question) => {
    setOcrPrelaunchQuestion(q);
    setActiveTab('tests'); // Navigate to test panel triggers active prelaunch useEffect
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans p-4 transition-all duration-300 ${
        theme === 'dark' 
          ? 'dark dark-gradient-bg text-slate-100' 
          : 'light-gradient-bg text-slate-900'
      }`} id="login-screen-root">
        <div id="login-card-container" className="max-w-md w-full relative">
          
          <div className={`border rounded-[28px] p-8 shadow-2xl transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md'
              : 'bg-white/95 border-slate-200 backdrop-blur-md shadow-slate-300/50'
          }`}>
            
            {/* Brand Logo and Header from Uploaded Image */}
            <div className="mb-6">
              <BrandLogo className="w-24 h-24" withText={true} />
            </div>

            {/* Simple English message description */}
            <div className={`p-4 rounded-xl text-center mb-6 text-xs leading-relaxed border ${
              theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-205 text-slate-700'
            }`}>
              👋 <b>Welcome Aspirant!</b> Please login with your Gmail to track your daily streaks, compare leaderboard ranks, and solve authentic <b>chapter-wise JEE PYQs</b>!
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 text-center bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold font-mono">
                  {loginError}
                </div>
              )}

              {/* Gmail Address Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider font-mono">
                  📧 Gmail Address:
                </label>
                <input
                  id="login-gmail-input"
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all focus:ring-2 focus:ring-cyan-500 font-mono ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-slate-100' 
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider font-mono">
                  🔑 Password (Optional):
                </label>
                <input
                  id="login-password-input"
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Enter custom password..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all focus:ring-2 focus:ring-cyan-500 font-mono ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-slate-100' 
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Simple Help Line */}
              <div className="text-[10px] text-slate-400 text-center italic leading-tight">
                💡 Passwords are local only! If you do not want to use a password, simply click <b>Continue with Google</b> below!
              </div>

              {/* Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  id="login-credential-button"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-lg hover:shadow-blue-500/20 transition-all font-mono"
                >
                  🔑 Sign In with Gmail & Pass
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-850"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-450 uppercase font-mono font-black">OR</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-850"></div>
                </div>

                <button
                  type="button"
                  id="login-google-button"
                  onClick={handleGoogleQuickLogin}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-cyan-400 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all font-mono"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.63-.35-1.33-.35-2.09c0-.76.13-1.46.35-2.09z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  🌐 Continue with Google Quick Sign-In
                </button>
              </div>

            </form>

          </div>

          <div className="absolute top-4 right-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-slate-205 text-slate-700 shadow-md'
              }`}
            >
              {theme === 'dark' ? <span className="text-xs">☀️</span> : <span className="text-xs">🌙</span>}
            </button>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-500 mt-6 uppercase tracking-wider">
            🔒 NEXRANK SECURE ENTRANCE PORTAL
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${
      theme === 'dark' 
        ? 'dark dark-gradient-bg text-slate-100' 
        : 'light-gradient-bg text-slate-900'
    }`} id="nexrank-app-root">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b px-4 py-3 shadow-sm flex items-center justify-between bg-white/95 border-slate-200" id="nexrank-header">
        <div className="flex items-center gap-3">
          {/* High-fidelity Brand Logo representing the uploaded image */}
          <BrandLogo className="w-10 h-10" withText={false} />

          <div>
            <h1 className="text-sm font-black tracking-tight flex items-center gap-1.5 font-sans">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">NEX</span>
              <span className="bg-gradient-to-r from-purple-600 to-violet-500 dark:from-orange-400 dark:to-amber-500 bg-clip-text text-transparent">RANK</span>
              <span className={`text-[9.5px] font-mono font-black tracking-wider border px-2 py-0.5 rounded-full ${
                theme === 'dark' 
                  ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' 
                  : 'text-blue-600 border-blue-200 bg-blue-50'
              }`}>
                PRO SIMULATOR
              </span>
            </h1>
            <span className={`text-[9.5px] font-mono block tracking-tight uppercase ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>PRACTICE • ANALYZE • ACHIEVE</span>
          </div>
        </div>

        {/* Desktop Navbar */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
          {[
            { id: 'adventure', name: 'Adventure Map', icon: Compass },
            { id: 'tests', name: 'Mock Center (CBT)', icon: Swords },
            { id: 'quests', name: 'Quests & Rewards', icon: Award },
            { id: 'revision', name: 'Revision Hub', icon: BookOpen },
            { id: 'coach', name: 'NEXRANK AI Coach', icon: Sparkles },
            { id: 'dashboard', name: 'Performance Statistics', icon: Trophy },
            { id: 'ocr', name: 'OCR Question Scan', icon: UploadCloud }
          ].map(tab => {
            const IsAct = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}-desktop`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs font-bold py-2.5 px-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border ${
                  IsAct
                    ? theme === 'dark'
                      ? 'bg-slate-900/90 text-cyan-400 border-slate-700/80 shadow-md'
                      : 'bg-white text-royal-blue border-slate-200/80 shadow-sm font-semibold'
                    : theme === 'dark'
                      ? 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/40'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${IsAct ? 'text-royal-blue dark:text-cyan-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} />
                {tab.name}
              </button>
            );
          })}
        </nav>

        {/* Medium screen Navbar fallback (less space) */}
        <nav className="hidden md:flex xl:hidden items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
          {[
            { id: 'adventure', name: 'Adventure', icon: Compass },
            { id: 'tests', name: 'Mocks', icon: Swords },
            { id: 'quests', name: 'Quests', icon: Award },
            { id: 'revision', name: 'Revision', icon: BookOpen },
            { id: 'coach', name: 'AI Coach', icon: Sparkles },
            { id: 'dashboard', name: 'Stats', icon: Trophy },
            { id: 'ocr', name: 'OCR', icon: UploadCloud }
          ].map(tab => {
            const IsAct = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}-md`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-[10.5px] font-bold py-2 px-2.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap border ${
                  IsAct
                    ? theme === 'dark'
                      ? 'bg-slate-800 text-cyan-400 border-slate-705'
                      : 'bg-white text-royal-blue border-slate-200 shadow-sm'
                    : theme === 'dark'
                      ? 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/20'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.name}
              </button>
            );
          })}
        </nav>

        {/* Global status tags */}
        <div className="flex items-center gap-2">
          <span className={`hidden lg:flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border ${
            theme === 'dark'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-emerald-600 bg-emerald-50 border-emerald-200/80'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            No-VPN Secure Sandbox
          </span>
          <span className={`text-[10px] font-mono px-2.5 py-1 rounded-xl border ${
            theme === 'dark'
              ? 'text-slate-300 bg-slate-850 border-slate-700'
              : 'text-slate-700 bg-slate-100 border-slate-200'
          }`}>
            {equippedTitle} Title
          </span>



          {/* Logout exit switch button */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              id="logout-switcher-btn"
              className={`p-2 rounded-xl border transition-all cursor-pointer text-xs font-bold font-mono uppercase flex items-center gap-1 ${
                theme === 'dark'
                  ? 'bg-red-950/20 border-red-900/30 text-red-400 hover:bg-slate-900'
                  : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 shadow-sm'
              }`}
              title="Logout Account"
            >
              <span>🚪 Exit</span>
            </button>
          )}
        </div>
      </header>
 
      {/* 2. Main content block wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
        
        {/* Active tab content switcher */}
        {activeTab === 'adventure' && (
          <div className="animate-fade-in">
            <AdventureMap 
              xp={xp}
              coins={coins}
              addXpCoins={addXpCoins}
              unlockedLocations={unlockedLocations}
              clearedBosses={clearedBosses}
              addClearedBoss={handleClearedBoss}
              addUnlockedLocation={handleUnlockedLocation}
              onInitiateQuizSession={setPrelaunchedSession}
              onGoToTestsTab={() => setActiveTab('tests')}
              theme={theme}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <Dashboard 
              testSessions={testSessions} 
              onLaunchQuestionQuiz={handleOCRQuestionExtractedJoinQuiz} 
              theme={theme}
            />
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="animate-fade-in">
            <TestEngine 
              onTestCompleted={handleTestFinished} 
              activePreExtractedQuestion={ocrPrelaunchQuestion}
              resetPreExtractedQuestion={() => setOcrPrelaunchQuestion(null)}
              weakChapters={weakChapters}
              prelaunchedSession={prelaunchedSession}
              resetPrelaunchedSession={() => setPrelaunchedSession(null)}
              theme={theme}
            />
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="animate-fade-in">
            <QuestSystem 
              xp={xp}
              coins={coins}
              addXpCoins={addXpCoins}
              testSessions={testSessions}
              equippedTitle={equippedTitle}
              setEquippedTitle={handleUpdateEquippedTitle}
              clearedBosses={clearedBosses}
              theme={theme}
            />
          </div>
        )}

        {activeTab === 'revision' && (
          <div className="animate-fade-in">
            <RevisionCenter 
              mistakes={mistakes}
              onRemoveMistake={(qId) => {
                const updated = mistakes.filter(m => m.question.id !== qId);
                setMistakes(updated);
                localStorage.setItem('quantum_jee_mistake_book', JSON.stringify(updated));
              }}
              onLaunchQuestionQuiz={handleOCRQuestionExtractedJoinQuiz}
              userScore={xp}
              setUserScore={(score) => {
                setXp(score);
                localStorage.setItem('nexrank_xp', String(score));
              }}
              testSessions={testSessions}
              onInitiateQuizSession={setPrelaunchedSession}
              onGoToTestsTab={() => setActiveTab('tests')}
              theme={theme}
            />
          </div>
        )}

        {activeTab === 'coach' && (
          <div className="animate-fade-in">
            <AICoach 
              nickname={equippedTitle === 'Aspirant' ? 'Aspirant' : `${equippedTitle}`}
              xpValue={xp}
              coinValue={coins}
              streakValue={streak}
              testSessions={testSessions}
              mistakesCount={mistakes.length}
              theme={theme}
            />
          </div>
        )}

        {activeTab === 'ocr' && (
          <div className="animate-fade-in">
            <Uploader onQuestionExtracted={handleOCRQuestionExtractedJoinQuiz} theme={theme} />
          </div>
        )}

      </main>
 
      {/* 3. Footer branding logline */}
      <footer className={`mt-auto border-t px-4 py-5 text-center text-xs font-sans transition-all duration-300 ${
        theme === 'dark' 
          ? 'border-slate-900 bg-slate-950 text-slate-500' 
          : 'border-slate-200 bg-white/40 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <p>© 2026 NEXRANK. Crafted under the Antigravity AI Engine.</p>
          <p className={`text-[10.5px] ${theme === 'dark' ? 'text-cyan-600/70' : 'text-blue-600/70'}`}>Custom-tailored preparation console for Mobile & Desktop</p>
        </div>
      </footer>
 
      {/* 4. Mobile Bottom Sticky Navigation Ribbon */}
      <div className={`md:hidden sticky bottom-0 z-40 py-2 px-2 shadow-2xl flex items-center justify-between overflow-x-auto scrollbar-none transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-950 border-t border-slate-900'
          : 'bg-white border-t border-slate-205'
      }`}>
        {[
          { id: 'adventure', name: 'Map', icon: Compass },
          { id: 'tests', name: 'Mocks', icon: Swords },
          { id: 'quests', name: 'Quests', icon: Award },
          { id: 'revision', name: 'Revision', icon: BookOpen },
          { id: 'coach', name: 'AI Coach', icon: Sparkles },
          { id: 'dashboard', name: 'Stats', icon: Trophy },
          { id: 'ocr', name: 'Import', icon: UploadCloud }
        ].map(tab => {
          const IsAct = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}-mobile`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 focus:outline-none transition-colors py-1 px-2.5 ${
                IsAct 
                  ? theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'
                  : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[8.5px] font-black">{tab.name}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
