/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, Award, BookOpen, Clock, AlertTriangle, CheckCircle2, 
  Sparkles, Check, ListChecks, Swords, PlayCircle, PlusCircle, 
  Trash2, HelpCircle, Trophy, TrendingUp, Zap, LogIn, Loader2 
} from 'lucide-react';
import { MistakeBookItem, NCERTChapter, LeaderboardEntry, StudyPlan, Question, SubjectType } from '../types';
import { FORMULA_BOOK, JEE_CHAPTERS } from '../data/pyqDatabase';

interface DashboardProps {
  testSessions: any[];
  onLaunchQuestionQuiz: (q: Question) => void;
  theme?: string;
}

const DEFAULT_NCERT_CHAPTERS: NCERTChapter[] = [
  { id: 'nc-1', subject: 'Physics', title: 'Units & Measurements', grade: 'Class 11', completed: true },
  { id: 'nc-2', subject: 'Physics', title: 'Kinematics', grade: 'Class 11', completed: false },
  { id: 'nc-3', subject: 'Physics', title: 'Electrostatics', grade: 'Class 12', completed: false },
  { id: 'nc-4', subject: 'Chemistry', title: 'Some Basic Concepts of Chemistry', grade: 'Class 11', completed: true },
  { id: 'nc-5', subject: 'Chemistry', title: 'Chemical Bonding', grade: 'Class 11', completed: false },
  { id: 'nc-6', subject: 'Chemistry', title: 'Coordination Compounds', grade: 'Class 12', completed: false },
  { id: 'nc-7', subject: 'Mathematics', title: 'Sets and Relations', grade: 'Class 11', completed: true },
  { id: 'nc-8', subject: 'Mathematics', title: 'Determinants & Matrices', grade: 'Class 12', completed: false },
  { id: 'nc-9', subject: 'Mathematics', title: 'Integrals', grade: 'Class 12', completed: false },
];

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { email: 'ankit.s@iit.in', displayName: 'Ankit Sharma (AIR 45)', streak: 28, score: 2840, testsCompleted: 42 },
  { email: 'priya.g@jee.org', displayName: 'Priya Gupta (AIR 102)', streak: 14, score: 2510, testsCompleted: 35 },
  { email: 'rohan.das@bits.in', displayName: 'Rohan Das', streak: 9, score: 2120, testsCompleted: 28 },
  { email: 'rashmi.m@iitd.ac.in', displayName: 'Rashmi Mishra', streak: 19, score: 1980, testsCompleted: 24 },
  { email: 'ckushal120@gmail.com', displayName: 'You (Aspirant)', streak: 3, score: 450, testsCompleted: 6 },
];

export default function Dashboard({ testSessions, onLaunchQuestionQuiz, theme = 'light' }: DashboardProps) {
  // Persistence states
  const [streak, setStreak] = useState(3);
  const [userScore, setUserScore] = useState(450);
  const [nickName, setNickName] = useState('You (Aspirant)');
  const [ncertChapters, setNcertChapters] = useState<NCERTChapter[]>(DEFAULT_NCERT_CHAPTERS);
  const [mistakes, setMistakes] = useState<MistakeBookItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARD);

  // active sub-view toggler: "stats" | "mistakes" | "formula" | "ncert" | "battle"
  const [subView, setSubView] = useState<'stats' | 'mistakes' | 'formula' | 'ncert' | 'battle'>('stats');

  // AI study plan
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Goal settings
  const [targetRank, setTargetRank] = useState('5000');
  const [dailyHoursGoal, setDailyHoursGoal] = useState('6');

  // Formula quiz active state
  const [activeFormulaQuizSubject, setActiveFormulaQuizSubject] = useState<SubjectType | null>(null);
  const [formulaQuizQuestion, setFormulaQuizQuestion] = useState<{ formulaName: string; options: string[]; correctIdx: number } | null>(null);
  const [formulaQuizAnswered, setFormulaQuizAnswered] = useState<number | null>(null);

  // Battle simulator
  const [battleState, setBattleState] = useState<'idle' | 'searching' | 'fighting' | 'results'>('idle');
  const [battleOpponent, setBattleOpponent] = useState<string | null>(null);
  const [battleMyScore, setBattleMyScore] = useState(0);
  const [battleOpScore, setBattleOpScore] = useState(0);
  const [battleSecsLeft, setBattleSecsLeft] = useState(20);
  const [battleWinner, setBattleWinner] = useState<string | null>(null);

  useEffect(() => {
    // Sync NCERT chapters
    const savedNCERT = localStorage.getItem('quantum_jee_ncert');
    if (savedNCERT) {
      try { setNcertChapters(JSON.parse(savedNCERT)); } catch (e) { console.error(e); }
    }

    // Sync mistakes
    const savedMistakes = localStorage.getItem('quantum_jee_mistake_book');
    if (savedMistakes) {
      try { setMistakes(JSON.parse(savedMistakes)); } catch (e) { console.error(e); }
    }

    // Sync nickname
    const optNick = localStorage.getItem('quantum_jee_nickname');
    if (optNick) setNickName(optNick);

    // Sync score & streak from test sessions
    const savedScore = localStorage.getItem('quantum_jee_score');
    if (savedScore) {
      setUserScore(Number(savedScore));
    } else if (testSessions.length > 0) {
      // Calculate total points
      const points = 450 + testSessions.reduce((acc, curr) => acc + (curr.score || 0) * 10, 0);
      setUserScore(points);
      localStorage.setItem('quantum_jee_score', String(points));
    }

    fetchStudyPlan();
  }, [testSessions]);

  // Load and forecast AI Daily Study Plan
  const fetchStudyPlan = async () => {
    setLoadingPlan(true);
    try {
      // Generate weak chapters list from history
      const weakFreq: Record<string, { subject: SubjectType; count: number }> = {};
      mistakes.forEach((m) => {
        const item = m.question;
        weakFreq[item.chapter] = {
          subject: item.subject,
          count: (weakFreq[item.chapter]?.count || 0) + 1
        };
      });

      const mappedWeak = Object.entries(weakFreq)
        .map(([chap, detail]) => ({
          subject: detail.subject,
          chapter: chap,
          accuracy: 45,
          recommendedRevision: `Devote 45 minutes of practice problems to ${chap} with formula cards.`
        })).slice(0, 3);

      const response = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streak,
          testHistory: testSessions,
          weakChapters: mappedWeak
        })
      });

      const data = await response.json();
      if (data.success) {
        setStudyPlan({
          dailyStreak: streak,
          lastActive: new Date().toISOString().split('T')[0],
          todayTargetScore: 120,
          tasks: data.tasks || [],
          weakChapters: mappedWeak
        });
      }
    } catch (e) {
      console.error('Failed to generate Study Plan from server-side', e);
    } finally {
      setLoadingPlan(false);
    }
  };

  // Switch task state helper
  const toggleTaskCompleted = (id: string) => {
    if (!studyPlan) return;
    const updatedTasks = studyPlan.tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setStudyPlan({ ...studyPlan, tasks: updatedTasks });
  };

  // Toggle NCERT completion
  const toggleNcertChapter = (id: string) => {
    const updated = ncertChapters.map((c) =>
      c.id === id ? { ...c, completed: !c.completed } : c
    );
    setNcertChapters(updated);
    localStorage.setItem('quantum_jee_ncert', JSON.stringify(updated));
  };

  // Clear mistake helper
  const handleRemoveMistake = (qId: string) => {
    const updated = mistakes.filter((m) => m.question.id !== qId);
    setMistakes(updated);
    localStorage.setItem('quantum_jee_mistake_book', JSON.stringify(updated));
  };

  // Trigger Formula Quiz
  const startFormulaQuiz = (sub: SubjectType) => {
    setActiveFormulaQuizSubject(sub);
    setFormulaQuizAnswered(null);

    // Filter formulas for selected subject
    const categoryList = FORMULA_BOOK[sub];
    if (!categoryList || categoryList.length === 0) return;

    const allFormulas = categoryList.flatMap((cat) => cat.formulas);
    if (allFormulas.length === 0) return;

    // Pick a random formula
    const randomF = allFormulas[Math.floor(Math.random() * allFormulas.length)];

    // Create 4 options based on definitions
    const correctOption = randomF.latex;
    const wrongOptions = allFormulas
      .filter((f) => f.latex !== correctOption)
      .map((f) => f.latex)
      .slice(0, 3);

    // Make sure we have 4 options
    while (wrongOptions.length < 3) {
      wrongOptions.push('E = m · c^2 + \\Delta V');
    }

    const options = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5);
    const correctIdx = options.indexOf(correctOption);

    setFormulaQuizQuestion({
      formulaName: randomF.name + ': ' + randomF.desc,
      options,
      correctIdx
    });
  };

  // Solve Formula Answer
  const handleFormulaQuizAnswerSubmit = (idx: number) => {
    setFormulaQuizAnswered(idx);
    if (idx === formulaQuizQuestion?.correctIdx) {
      // Add point rewards
      const newScore = userScore + 20;
      setUserScore(newScore);
      localStorage.setItem('quantum_jee_score', String(newScore));
      
      // Update our placeholder in leaderboard
      setLeaderboard((prev) => 
        prev.map((entry) => 
          entry.email === 'ckushal120@gmail.com'
            ? { ...entry, score: newScore }
            : entry
        )
      );
    }
  };

  // BATTLE FRIENDS ARENA SIMULATOR
  const triggerBattleSearch = () => {
    setBattleState('searching');
    setBattleMyScore(0);
    setBattleOpScore(0);
    setBattleSecsLeft(12);

    const opponents = ['Rishabh (AIR 89)', 'Aakash Paul', 'Kartik (Aspirant 99%)', 'Sanya Iyer'];
    const chosen = opponents[Math.floor(Math.random() * opponents.length)];
    setBattleOpponent(chosen);

    // Wait 3 seconds to "find" game
    setTimeout(() => {
      setBattleState('fighting');
      startBattleTicks();
    }, 2800);
  };

  let battleTimer: NodeJS.Timeout;
  const startBattleTicks = () => {
    let tLeft = 12;
    battleTimer = setInterval(() => {
      tLeft--;
      setBattleSecsLeft(tLeft);
      
      // Randomly increase score to simulate live battle actions
      setBattleMyScore((my) => my + (Math.random() > 0.4 ? 40 : 0));
      setBattleOpScore((op) => op + (Math.random() > 0.45 ? 40 : 0));

      if (tLeft <= 0) {
        clearInterval(battleTimer);
        setBattleState('results');
      }
    }, 1000);
  };

  const handleSetNickName = () => {
    const updated = prompt('Enter your custom aspirant profile name:', nickName);
    if (updated !== null && updated.trim() !== '') {
      setNickName(updated);
      localStorage.setItem('quantum_jee_nickname', updated);

      setLeaderboard((prev) => 
        prev.map((entry) => 
          entry.email === 'ckushal120@gmail.com'
            ? { ...entry, displayName: updated }
            : entry
        )
      );
    }
  };

  // Accuracy breakdown
  const totalTests = testSessions.length;
  const averageAccuracy = totalTests > 0 
    ? Math.round(testSessions.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / totalTests)
    : 0;

  const currentEstimatedPercentile = testSessions.length > 0 
    ? Math.round(testSessions[testSessions.length - 1].predictedPercentile)
    : 95.8;

  const currentEstimatedRank = Math.round(Math.max(1000, 1000000 * (1 - currentEstimatedPercentile / 100)));

  return (    <div className="space-y-6">
      {/* Mini Profile Navbar - Styled as primary top grid panel */}
      <div className="bg-gradient-to-r from-slate-900/60 to-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl hover:border-slate-700/60 transition-all duration-300">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-amber-300 flex items-center justify-center font-black text-slate-950 font-mono text-lg shadow-lg shadow-cyan-500/10">
            {nickName ? nickName.charAt(0).toUpperCase() : 'Y'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-100 text-base tracking-tight">{nickName}</span>
              <button onClick={handleSetNickName} className="text-[10px] font-mono font-medium text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer transition-colors bg-cyan-400/10 px-1.5 py-0.5 rounded">
                Edit Nick
              </button>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5 font-mono">TARGET JEE RANK: <span className="text-cyan-400">#{targetRank}</span> • DAILY EFFORT: <span className="text-amber-400">{dailyHoursGoal} hrs/day</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-orange-400 shadow-inner">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-yellow-500 shadow-inner">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>{userScore} Prep Points</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1.5 scrollbar-none">
        {(['stats', 'mistakes', 'formula', 'ncert', 'battle'] as const).map((v) => (
          <button
            key={v}
            id={`dashboard-tab-${v}`}
            onClick={() => setSubView(v)}
            className={`text-xs font-bold py-2.5 px-4 rounded-xl transition-all focus:outline-none whitespace-nowrap cursor-pointer ${
              subView === v
                ? 'bg-slate-900/80 text-cyan-400 border border-slate-800 font-extrabold shadow-md shadow-slate-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            {v === 'stats' && 'Performance Analytics'}
            {v === 'mistakes' && `Mistake Book (${mistakes.length})`}
            {v === 'formula' && 'Formula Revision'}
            {v === 'ncert' && 'NCERT Tracker'}
            {v === 'battle' && 'Challenge Friends ⚔️'}
          </button>
        ))}
      </div>

      {/* SUBVIEW PANEL RENDERING */}

      {/* A. PERFORMANCE ANALYTICS */}
      {subView === 'stats' && (
        <div className="space-y-6">
          {/* Main quick statistics bento-grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Profile & Target Estimate */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700/60 transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-500/5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase tracking-wider">ESTIMATED JEE RANK COCH</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-100 tracking-tight font-sans">AIR #{currentEstimatedRank}</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Estimated based on an calculated <span className="text-cyan-300 tracking-tight font-mono">{currentEstimatedPercentile}%</span> predicted percentile from mock accuracy benchmarks.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-center shadow-inner">
                  <span className="text-[10px] font-mono text-slate-500 block font-bold">GOAL RANK</span>
                  <input
                    id="stats-input-target-rank"
                    type="text"
                    value={targetRank}
                    onChange={(e) => setTargetRank(e.target.value)}
                    className="w-full bg-transparent text-xs text-center text-cyan-400 font-bold outline-none mt-1"
                  />
                </div>
                <div className="flex-1 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-center shadow-inner">
                  <span className="text-[10px] font-mono text-slate-500 block font-bold">DAILY HOURS</span>
                  <input
                    id="stats-input-daily-hours"
                    type="text"
                    value={dailyHoursGoal}
                    onChange={(e) => setDailyHoursGoal(e.target.value)}
                    className="w-full bg-transparent text-xs text-center text-cyan-400 font-bold outline-none mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Subject performance levels */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-500/5">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 block mb-2 font-bold uppercase tracking-wider">Subject-wise PYQ Solved Range</span>
                <div className="space-y-3.5">
                  {['Physics', 'Chemistry', 'Mathematics'].map((s) => {
                    const count = testSessions.filter((t) => t.subject === s).length;
                    const pct = Math.min(100, Math.max(15, count * 20));
                    return (
                      <div key={s} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{s}</span>
                          <span className="text-cyan-400 font-mono text-[11px]">{count} Attempted</span>
                        </div>
                        <div className="w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono text-center">
                Keep attempting custom chapter-wise tests to balance coverage!
              </div>
            </div>

            {/* Box 3: AI study plan tasks */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700/60 transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-500/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-yellow-500 font-bold block uppercase tracking-wider">TODAY'S AI PREP CHECHLIST</span>
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-bounce" />
              </div>

              {loadingPlan ? (
                <div className="flex flex-col items-center justify-center h-28 space-y-2">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <p className="text-[10.5px] font-mono text-slate-400 animate-pulse">Consulting IIT-JEE coach database...</p>
                </div>
              ) : studyPlan && studyPlan.tasks.length > 0 ? (
                <div className="space-y-2 max-h-[145px] overflow-y-auto pr-1">
                  {studyPlan.tasks.map((t) => (
                    <button
                      key={t.id}
                      id={`study-task-btn-${t.id}`}
                      onClick={() => toggleTaskCompleted(t.id)}
                      className="w-full text-left flex gap-2 items-start text-xs p-2 rounded-xl bg-slate-950/50 hover:bg-slate-800/40 border border-slate-800/50 transition-colors cursor-pointer"
                    >
                      <input type="checkbox" checked={t.completed} readOnly className="mt-0.5 accent-cyan-500" />
                      <span className={`leading-relaxed ${t.completed ? 'line-through text-slate-500 font-medium' : 'text-slate-300 font-bold'}`}>
                        {t.title}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  No direct personalized tasks scheduled. Complete at least one comprehensive mock test to help the AI map your syllabus weak points!
                </p>
              )}
            </div>
          </div>

          {/* Leaderboards and PYQ logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 4: AIR Leaderboard */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700/60 transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-500/5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500" /> IIT-JEE aspirants leaderboard
              </span>

              <div className="space-y-2">
                {leaderboard.map((u, idx) => (
                  <div key={idx} className={`flex items-center justify-between text-xs p-3 rounded-xl border ${
                    u.email === 'ckushal120@gmail.com' ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-950/35 border-slate-800/80'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5.5 h-5.5 flex items-center justify-center rounded-lg font-mono text-[10px] font-black ${
                        idx === 0 
                          ? 'bg-yellow-500 text-slate-950' 
                          : idx === 1 
                          ? 'bg-slate-300 text-slate-950' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 font-extrabold">{u.displayName}</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="text-[9px] font-mono text-slate-500">Streak: {u.streak}d</span>
                      <span className="font-mono text-cyan-330 font-bold text-cyan-400">{u.score} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 5: Completed Sessions */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700/60 transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-500/5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase tracking-wider">JEE Completed Sessions History ({testSessions.length})</span>
              
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                {testSessions.length > 0 ? (
                  testSessions.map((hist, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-200 block text-xs">{hist.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Percentile Predicted: ~{hist.predictedPercentile}%</span>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Accuracy</span>
                          <span className="font-mono font-black text-emerald-400 text-right">{hist.accuracy}%</span>
                        </div>
                        <span className="font-mono font-bold text-slate-300 bg-slate-900 px-2 rounded-lg border border-slate-800 py-1 flex items-center justify-center">
                          {hist.score}m
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 font-mono text-xs">
                    No logged sessions yet. Make custom mock sets to begin.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B. MISTAKE BOOK */}
      {subView === 'mistakes' && (
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-md font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Ultimate JEE Mistake Book
            </h2>
            <p className="text-xs text-slate-450 mt-1">
              Any MCQ or Numerical questions you answer incorrectly inside active practice tests automatically register in this mistake catalog. Periodically retry them to build flawless accuracy!
            </p>
          </div>

          {mistakes.length > 0 ? (
            <div className="space-y-4">
              {mistakes.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded uppercase font-mono">
                        {m.question.subject}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                        {m.question.chapter}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`mistake-quiz-launch-btn-${m.question.id}`}
                        onClick={() => onLaunchQuestionQuiz(m.question)}
                        className="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-3 py-1 font-bold rounded cursor-pointer"
                      >
                        RE-TRY AS PRACTICE QUIZ
                      </button>
                      <button
                        id={`mistake-remove-btn-${m.question.id}`}
                        onClick={() => handleRemoveMistake(m.question.id)}
                        className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{m.question.text}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-900">
                    <div>
                      <span className="text-[9px] text-slate-450 block font-mono">YOUR ORIGINAL RESPONSE:</span>
                      <span className="font-bold text-rose-400 font-mono">{JSON.stringify(m.userAnswer)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 block font-mono">CORRECT SCHEMATIC KEY:</span>
                      <span className="font-bold text-cyan-400 font-mono">{JSON.stringify(m.question.correctAnswer)}</span>
                    </div>
                  </div>

                  {m.aiExplanation ? (
                    <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg text-xs space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase tracking-wide">SAVED tutor feedback:</span>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{m.aiExplanation}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-450">
                      Open active review inside test results to consult AI Mentor explanations on this.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-850">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Clean Slate! No active mistakes logged.</p>
              <p className="text-xs text-slate-450 mt-1">Keep solving question papers. Mistake items register automatically when you select wrong keys.</p>
            </div>
          )}
        </div>
      )}

      {/* C. FORMULA BOOK HANDBOOK & MINI-QUIZ */}
      {subView === 'formula' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-md font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Active Formula Handbook Reference
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Browse essential mathematics derivations, physical chemistry metrics, & electromagnetism laws. Challenge diagnostic equation tests here!
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Physics', 'Chemistry', 'Mathematics'].map((s: any) => (
                <button
                  key={s}
                  id={`formula-quiz-start-btn-${s}`}
                  onClick={() => startFormulaQuiz(s)}
                  className="bg-slate-800 hover:bg-slate-700 hover:text-slate-100 border border-slate-700/80 text-cyan-300 text-xs font-bold py-1.5 px-3.5 rounded-xl cursor-pointer transition-all duration-200"
                >
                  TEST {s.toUpperCase()} EQUATIONS
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE FORMULA DIAGNOSTIC QUIZ CARD */}
          {activeFormulaQuizSubject && formulaQuizQuestion && (
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/90 border border-cyan-500/30 rounded-2xl p-6 shadow-xl animate-fade-in space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wide">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  FORMULA SPEED TEST: {activeFormulaQuizSubject.toUpperCase()}
                </div>
                <button 
                  onClick={() => setActiveFormulaQuizSubject(null)} 
                  className="text-xs font-mono text-slate-500 hover:text-slate-300 cursor-pointer bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                >
                  Dismiss Quiz
                </button>
              </div>

              <p className="text-sm font-semibold text-slate-200">
                Identify the correct equation for: <span className="text-cyan-300 font-mono font-black italic">{formulaQuizQuestion.formulaName}</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {formulaQuizQuestion.options.map((opt, idx) => {
                  const isSubmitted = formulaQuizAnswered !== null;
                  const isCorrect = idx === formulaQuizQuestion.correctIdx;
                  const isSelected = idx === formulaQuizAnswered;

                  return (
                    <button
                      key={idx}
                      id={`formula-option-btn-${idx}`}
                      onClick={() => !isSubmitted && handleFormulaQuizAnswerSubmit(idx)}
                      disabled={isSubmitted}
                      className={`text-left p-4 rounded-xl border font-mono text-xs transition-all duration-150 cursor-pointer ${
                        isSubmitted
                          ? isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                            : isSelected
                            ? 'bg-rose-500/10 border-rose-500 text-rose-300'
                            : 'bg-slate-950/40 border-slate-850 text-slate-500'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-500 text-slate-300 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg font-mono text-xs font-bold ${
                          isSubmitted && isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {formulaQuizAnswered !== null && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  {formulaQuizAnswered === formulaQuizQuestion.correctIdx ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-4 h-4" /> Perfect! Correct Formula. Reward Point: +20 Points.
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1.5 font-mono">
                      Incorrect equation chosen! Correct was Option {formulaQuizQuestion.correctIdx + 1}. Review manual.
                    </span>
                  )}
                  <button
                    id="formula-quiz-retry-btn"
                    onClick={() => startFormulaQuiz(activeFormulaQuizSubject)}
                    className="text-[10px] font-mono font-bold bg-cyan-600 px-3 py-1.5 rounded-lg text-slate-950 cursor-pointer"
                  >
                    Next Question
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Formulas catalog list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(FORMULA_BOOK).map(([subject, categories]: any) => (
              <div key={subject} className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700/60 transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-500/5">
                <h3 className="text-sm font-bold text-cyan-300 font-mono uppercase tracking-wide border-b border-slate-800/60 pb-2">
                  {subject} Handbook
                </h3>

                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 select-all custom-scrollbar">
                  {categories.map((cat: any, cIdx: number) => (
                    <div key={cIdx} className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 font-bold block">{cat.category.toUpperCase()}</span>
                      <div className="space-y-1.5">
                        {cat.formulas.map((f: any, fIdx: number) => (
                          <div key={fIdx} className="p-3 rounded-xl bg-slate-950/50 border border-slate-850 space-y-1">
                            <span className="text-[11px] font-semibold text-slate-300 block leading-tight">{f.name}</span>
                            <code className="text-xs text-yellow-400 font-mono block py-0.5">{f.latex}</code>
                            <span className="text-[10px] text-slate-450 leading-normal block">{f.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D. NCERT CHECKLIST TRACKER */}
      {subView === 'ncert' && (
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-md font-bold text-slate-100 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-emerald-400" />
              JEE NCERT Complete Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              IIT-JEE asks direct conceptual prompts from NCERT textbooks. Keeping track of NCERT chapters coverage is highly critical to score full marks in chemistry inorganic sections and fundamental mechanics!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {['Physics', 'Chemistry', 'Mathematics'].map((subj) => {
              const filterChaps = ncertChapters.filter((c) => c.subject === subj);
              const completedCount = filterChaps.filter((c) => c.completed).length;
              const percent = Math.round((completedCount / filterChaps.length) * 100) || 0;

              return (
                <div key={subj} className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-850 space-y-3.5 shadow-inner">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                    <span className="tracking-tight">{subj} Syllabus</span>
                    <span className="font-mono text-emerald-400">{percent}% Done</span>
                  </div>

                  <div className="space-y-2">
                    {filterChaps.map((c) => (
                      <button
                        key={c.id}
                        id={`ncert-chapter-toggle-${c.id}`}
                        onClick={() => toggleNcertChapter(c.id)}
                        className={`w-full text-left flex gap-2.5 items-start text-xs p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                          c.completed 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300 font-bold' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${
                          c.completed ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                        }`}>
                          {c.completed && <Check className="w-3 stroke-[3px]" />}
                        </span>
                        <div>
                          <span className={`${c.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                            {c.title}
                          </span>
                          <span className="text-[9px] text-slate-500 block font-mono mt-0.5">{c.grade}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* E. BATTLE SIMULATOR */}
      {subView === 'battle' && (
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h2 className="text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
              <Swords className="w-6 h-6 text-cyan-400" />
              IIT-JEE Speed Battle Arena
            </h2>
            <p className="text-xs text-slate-400">
              Engage in high-speed, 12-second conceptual formula battles against elite peers from other states. Solve calculations correctly and maintain streaks to claim AIR titles!
            </p>
          </div>

          <div className="max-w-xl mx-auto border border-slate-800 rounded-2xl bg-slate-950/90 p-6 flex flex-col items-center justify-center space-y-6 min-h-[220px]">
            {battleState === 'idle' && (
              <div className="text-center space-y-4">
                <p className="text-xs text-slate-400">
                  Ready to battle? Opponents are matched live over simulated socket routes.
                </p>
                <button
                  id="battle-find-match-btn"
                  onClick={triggerBattleSearch}
                  className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 mx-auto cursor-pointer shadow-lg hover:shadow-cyan-500/20"
                >
                  <Swords className="w-4 h-4" />
                  FIND ACTIVE CHALLENGE OPPONENT
                </button>
              </div>
            )}

            {battleState === 'searching' && (
              <div className="text-center space-y-4 animate-pulse">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-200">Matching with IIT Aspirants...</p>
                  <p className="text-xs text-slate-550 mt-1">Checking candidates lobby on regional ports...</p>
                </div>
              </div>
            )}

            {battleState === 'fighting' && (
              <div className="w-full space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider animate-pulse">
                    LIVE SPEED BATTLE
                  </span>
                  <span className="font-mono text-yellow-500 text-xs font-bold leading-none bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
                    Remaining: {battleSecsLeft}s
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center space-y-2">
                    <span className="text-[10px] text-slate-550 uppercase font-mono block">YOUR SCORE</span>
                    <span className="text-3xl font-black text-cyan-400">{battleMyScore}</span>
                    <span className="text-xs text-slate-400 block font-medium">Attempting: Formula Quiz</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center space-y-2">
                    <span className="text-[10px] text-slate-550 uppercase font-mono block">OPPONENT: {battleOpponent}</span>
                    <span className="text-3xl font-black text-rose-400">{battleOpScore}</span>
                    <span className="text-xs text-slate-400 block font-medium">Attempting: Formulas Matrix</span>
                  </div>
                </div>

                {/* Simulated live button clickers during countdown */}
                <div className="flex gap-2">
                  <button
                    id="battle-attack-btn-1"
                    onClick={() => setBattleMyScore((pts) => pts + 50)}
                    className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-slate-100 font-mono text-[10px] py-2 rounded border border-cyan-500/20"
                  >
                    SELECT ANSWER B (CORRECT!)
                  </button>
                  <button
                    id="battle-attack-btn-2"
                    onClick={() => setBattleMyScore((pts) => pts + 20)}
                    className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-400 font-mono text-[10px] py-2 rounded border border-slate-800"
                  >
                    SELECT ALTERNATIVE (RISKY)
                  </button>
                </div>
              </div>
            )}

            {battleState === 'results' && (
              <div className="text-center space-y-4 animate-fade-in">
                <Award className="w-12 h-12 text-yellow-500 mx-auto fill-yellow-500/15" />
                
                <div>
                  <h3 className="text-md font-bold text-slate-200">
                    Battle Ended: {battleMyScore >= battleOpScore ? 'YOU WON THE COCH CONTEST! 🎉' : 'OPPONENT WIN! ⚔️'}
                  </h3>
                  <p className="text-xs text-slate-450 mt-1">
                    Your final score: <span className="text-cyan-400 font-bold font-mono">{battleMyScore}</span> vs Opponent final score: <span className="text-rose-400 font-bold font-mono">{battleOpScore}</span>
                  </p>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <button
                    id="battle-rematch-btn"
                    onClick={triggerBattleSearch}
                    className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold py-2 px-4 rounded-lg"
                  >
                    Challenge Another Opponent
                  </button>
                  <button
                    id="battle-quit-btn"
                    onClick={() => setBattleState('idle')}
                    className="bg-slate-800 text-slate-405 text-xs py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Exit Arena
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
