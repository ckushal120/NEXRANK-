/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, Calendar, Clock, Star, ShieldCheck, 
  Sparkles, CheckCircle2, Flame, RefreshCw, Layers
} from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
  coinReward: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
}

interface QuestSystemProps {
  xp: number;
  coins: number;
  addXpCoins: (xpToAdd: number, coinsToAdd: number) => void;
  testSessions: any[];
  equippedTitle: string;
  setEquippedTitle: (title: string) => void;
  clearedBosses: string[];
  theme?: string;
}

export default function QuestSystem({
  xp,
  coins,
  addXpCoins,
  testSessions,
  equippedTitle,
  setEquippedTitle,
  clearedBosses,
  theme = 'light'
}: QuestSystemProps) {
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  // Synchronize solved questions and test milestones
  useEffect(() => {
    // Read total solved questions from storage
    const solved = parseInt(localStorage.getItem('nexrank_questions_solved') || '12', 10);
    setQuestionsSolved(solved);

    // Sync badges
    const savedBadges = localStorage.getItem('nexrank_badges');
    if (savedBadges) {
      try { setUnlockedBadges(JSON.parse(savedBadges)); } catch (e) { console.error(e); }
    } else {
      const defaultBadges = ['AIR Chaser', 'Formula Knight'];
      setUnlockedBadges(defaultBadges);
      localStorage.setItem('nexrank_badges', JSON.stringify(defaultBadges));
    }

    // Initialize quests
    const completedTests = testSessions.length;
    const weeklyQuestsTests = testSessions.filter(t => {
      // simulate tests completed in last 7 days
      return t.startedAt ? (Date.now() - new Date(t.startedAt).getTime() < 7 * 24 * 3600 * 1000) : true;
    }).length;

    // Load claim logs
    const claimedState = localStorage.getItem('nexrank_claimed_quests');
    const claimedIds: string[] = claimedState ? JSON.parse(claimedState) : [];

    const isDailyQuizGoal = completedTests >= 1;
    const isSolveGoal = solved >= 20;
    const isWeakReviseGoal = testSessions.some(t => t.accuracy >= 65);

    const initialQuests: Quest[] = [
      // Daily
      {
        id: 'dq-1',
        title: 'Solve 20 Practice Questions',
        type: 'daily',
        xpReward: 30,
        coinReward: 15,
        targetCount: 20,
        currentCount: solved > 20 ? 20 : solved,
        completed: isSolveGoal,
        claimed: claimedIds.includes('dq-1')
      },
      {
        id: 'dq-2',
        title: 'Complete 1 CBT Mock Test',
        type: 'daily',
        xpReward: 40,
        coinReward: 20,
        targetCount: 1,
        currentCount: completedTests >= 1 ? 1 : 0,
        completed: isDailyQuizGoal,
        claimed: claimedIds.includes('dq-2')
      },
      {
        id: 'dq-3',
        title: 'Revise 1 weak chapter concept',
        type: 'daily',
        xpReward: 25,
        coinReward: 10,
        targetCount: 1,
        currentCount: isWeakReviseGoal ? 1 : 0,
        completed: isWeakReviseGoal,
        claimed: claimedIds.includes('dq-3')
      },
      // Weekly
      {
        id: 'wq-1',
        title: 'Complete 3 mock tests',
        type: 'weekly',
        xpReward: 100,
        coinReward: 50,
        targetCount: 3,
        currentCount: Math.min(3, weeklyQuestsTests),
        completed: weeklyQuestsTests >= 3,
        claimed: claimedIds.includes('wq-1')
      },
      {
        id: 'wq-2',
        title: 'Improve accuracy score by 5%',
        type: 'weekly',
        xpReward: 80,
        coinReward: 40,
        targetCount: 1,
        currentCount: testSessions.some(s => s.accuracy >= 80) ? 1 : 0,
        completed: testSessions.some(s => s.accuracy >= 80),
        claimed: claimedIds.includes('wq-2')
      },
      {
        id: 'wq-3',
        title: 'Finish World location node',
        type: 'weekly',
        xpReward: 70,
        coinReward: 35,
        targetCount: 1,
        currentCount: completedTests >= 2 ? 1 : 0,
        completed: completedTests >= 2,
        claimed: claimedIds.includes('wq-3')
      },
      // Monthly
      {
        id: 'mq-1',
        title: 'Master an entire subject chapter list',
        type: 'monthly',
        xpReward: 250,
        coinReward: 120,
        targetCount: 5,
        currentCount: Math.min(5, completedTests),
        completed: completedTests >= 5,
        claimed: claimedIds.includes('mq-1')
      },
      {
        id: 'mq-2',
        title: 'Reach a new level milestone rank',
        type: 'monthly',
        xpReward: 200,
        coinReward: 100,
        targetCount: 1,
        currentCount: xp >= 1200 ? 1 : 0,
        completed: xp >= 1200,
        claimed: claimedIds.includes('mq-2')
      }
    ];

    setQuests(initialQuests);
  }, [testSessions, xp]);

  // Claim awards helper
  const handleClaimReward = (quest: Quest) => {
    if (!quest.completed || quest.claimed) return;

    // Add awards
    addXpCoins(quest.xpReward, quest.coinReward);

    // Save claim history
    const claimedState = localStorage.getItem('nexrank_claimed_quests');
    const claimedIds: string[] = claimedState ? JSON.parse(claimedState) : [];
    const updatedClaims = [...claimedIds, quest.id];
    localStorage.setItem('nexrank_claimed_quests', JSON.stringify(updatedClaims));

    // Update state lists
    setQuests(prev => {
      return prev.map(q => q.id === quest.id ? { ...q, claimed: true } : q);
    });

    // Check if new badges unlocked and save inside checklist rules
    if (quest.type === 'monthly' && !unlockedBadges.includes('Syllabus conqueror')) {
      const updatedB = [...unlockedBadges, 'Syllabus conqueror'];
      setUnlockedBadges(updatedB);
      localStorage.setItem('nexrank_badges', JSON.stringify(updatedB));
    }
  };

  // List of achievement titles earned
  const AVAILABLE_TITLES = [
    { title: 'Aspirant', desc: 'Starting your JEE preparation grind.', requirements: 'Default' },
    { title: 'Kinematics Master', desc: 'Cleared World 1 Boss: Dimensional Drake.', requirements: 'Defeat World 1 Boss' },
    { title: 'Physics Warrior', desc: 'Cleared World 2 Boss: Angular Titan.', requirements: 'Defeat World 2 Boss' },
    { title: 'Organic Champion', desc: 'Cleared World 3 Boss: Reaction Reaper.', requirements: 'Defeat World 3 Boss' },
    { title: 'Calculus King', desc: 'Cleared World 4 Boss: Infinite Matrix Dragon.', requirements: 'Defeat World 4 Boss' },
    { title: 'IIT Legend', desc: 'Cleared the Summit Mock Exam.', requirements: 'Defeat Final Summit Boss' }
  ];

  const isTitleClaimable = (req: string) => {
    if (req === 'Default') return true;
    if (req === 'Defeat World 1 Boss') return clearedBosses.includes('w1-boss');
    if (req === 'Defeat World 2 Boss') return clearedBosses.includes('w2-boss');
    if (req === 'Defeat World 3 Boss') return clearedBosses.includes('w3-boss');
    if (req === 'Defeat World 4 Boss') return clearedBosses.includes('w4-boss');
    if (req === 'Defeat Final Summit Boss') return clearedBosses.includes('w5-boss');
    return false;
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction banner */}
      <div className={`border rounded-[24px] p-6 shadow-sm transition-all duration-300 ${
        theme === 'dark'
          ? 'glass-card-dark bg-slate-900/65 border-slate-800'
          : 'glass-card-light bg-gradient-to-r from-indigo-50/80 via-white/80 to-white/85 border-slate-200'
      }`}>
        <h2 className={`text-base font-black flex items-center gap-2 ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
        }`}>
          <Trophy className="w-5 h-5 text-yellow-500" />
          Quest Adventure Center & Rewards HUB
        </h2>
        <p className={`text-xs mt-1 leading-relaxed ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Unlock progress points by completing core JEE challenges! Progress through daily checklist items to trigger rank status upgrades and equip exclusive honors to claim school AIR ranks!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quests Tracker list */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`border rounded-[24px] p-5 shadow-sm space-y-4 transition-all duration-300 ${
            theme === 'dark'
              ? 'glass-card-dark bg-slate-900/65 border-slate-800'
              : 'glass-card-light bg-white/75 border-slate-200'
          }`}>
            <span className={`text-[10px] font-mono font-bold block uppercase tracking-wider ${
              theme === 'dark' ? 'text-cyan-400' : 'text-royal-blue'
            }`}>Active Educational Challenges</span>
            
            {/* Quest Groups (Daily, Weekly, Monthly) */}
            {(['daily', 'weekly', 'monthly'] as const).map(group => {
              const matchedQuests = quests.filter(q => q.type === group);
              
              return (
                <div key={group} className="space-y-2.5">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest block border-b pb-1.5 mt-2 ${
                    theme === 'dark' ? 'text-slate-500 border-slate-850' : 'text-slate-600 border-slate-150'
                  }`}>
                    {group === 'daily' ? '📅 Daily Quests' : group === 'weekly' ? '⚡ Weekly Milestones' : '👑 Monthly Expeditions'}
                  </span>
                  
                  <div className="space-y-2">
                    {matchedQuests.map(q => {
                      const completedPct = Math.min(100, Math.round((q.currentCount / q.targetCount) * 100));
                      
                      return (
                        <div key={q.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all duration-300 ${
                          q.claimed
                            ? theme === 'dark'
                              ? 'bg-slate-950/40 border-slate-900/60 opacity-60'
                              : 'bg-slate-50 border-slate-200/50 opacity-60'
                            : q.completed
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : theme === 'dark'
                            ? 'bg-slate-950/60 border-slate-850'
                            : 'bg-slate-50/50 border-slate-200/80'
                        }`}>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {q.claimed ? (
                                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                              ) : q.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-royal-blue dark:text-cyan-400 animate-pulse" />
                              )}
                              <span className={`text-xs font-bold ${
                                q.claimed 
                                  ? 'line-through text-slate-400' 
                                  : theme === 'dark'
                                  ? 'text-slate-200'
                                  : 'text-slate-800'
                              }`}>
                                {q.title}
                              </span>
                            </div>
 
                            <div className="flex items-center gap-3">
                              <div className={`w-full max-w-[150px] h-1.5 rounded-full overflow-hidden border ${
                                theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-200 border-slate-200/40'
                              }`}>
                                <div className={`h-full ${q.completed ? 'bg-emerald-500' : 'bg-[#3B82F6] dark:bg-cyan-500'} transition-all`} style={{ width: `${completedPct}%` }} />
                              </div>
                              <span className="text-[9.5px] font-mono text-slate-550">
                                {q.currentCount} / {q.targetCount}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[120px]">
                            <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                              <span className="block font-bold text-cyan-400">+{q.xpReward} XP</span>
                              <span className="block font-bold text-amber-400">🪙 +{q.coinReward} Coins</span>
                            </div>

                            <button
                              id={`quest-claim-btn-${q.id}`}
                              onClick={() => handleClaimReward(q)}
                              disabled={!q.completed || q.claimed}
                              className={`text-[10px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                                q.claimed
                                  ? 'bg-slate-950 border border-slate-900 text-slate-600 cursor-not-allowed'
                                  : q.completed
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow hover:scale-[1.03]'
                                  : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {q.claimed ? 'Claimed' : q.completed ? 'Claim Reward' : 'In Progress'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unlocked Badges & Equipped Title Sidebar */}
        <div className="space-y-6">
          
          {/* Section A: Equipped Honors Title select */}
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <span className="text-[10px] font-mono text-amber-400 font-bold block uppercase tracking-wider">🎖️ Achievement Title Closet</span>
            
            <p className="text-[11px] text-slate-450 leading-normal">
              Acquire prestigious ranking titles by beating chapter bosses and equip them to reflect your level in leaderboards!
            </p>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {AVAILABLE_TITLES.map(titleObj => {
                const claimable = isTitleClaimable(titleObj.requirements);
                const isEquipped = equippedTitle === titleObj.title;

                return (
                  <button
                    key={titleObj.title}
                    id={`closet-title-btn-${titleObj.title}`}
                    onClick={() => claimable && setEquippedTitle(titleObj.title)}
                    disabled={!claimable}
                    className={`w-full text-left p-3 rounded-xl border flex justify-between items-center transition-all ${
                      isEquipped
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                        : claimable
                        ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-350 cursor-pointer'
                        : 'bg-slate-950/40 border-slate-900 text-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-extrabold block">{titleObj.title}</span>
                      <span className="text-[9.5px] text-slate-500 block leading-tight mt-0.5">{titleObj.desc}</span>
                    </div>

                    <div className="text-right">
                      {isEquipped ? (
                        <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 py-0.5 px-1.5 rounded uppercase font-black">Active</span>
                      ) : claimable ? (
                        <span className="text-[9px] font-mono text-cyan-400">Equip</span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-600 block">Locked</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Achievement badges list */}
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <span className="text-[10px] font-mono text-purple-400 font-bold block uppercase tracking-wider">🏆 Badges & Trophies Catalog ({unlockedBadges.length})</span>
            
            <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {['AIR Chaser', 'Formula Knight', 'Syllabus conqueror', 'Kinematics Master', 'Organic Champion', 'Calculus King'].map(bName => {
                const isUnlocked = unlockedBadges.includes(bName) || (bName === 'Kinematics Master' && clearedBosses.includes('w1-boss')) || (bName === 'Organic Champion' && clearedBosses.includes('w3-boss')) || (bName === 'Calculus King' && clearedBosses.includes('w4-boss'));
                
                return (
                  <div key={bName} className={`p-2 rounded-xl border text-center font-sans ${
                    isUnlocked
                      ? 'bg-purple-500/5 border-purple-500/20 text-purple-300 font-bold'
                      : 'bg-slate-950/40 border-slate-900 text-slate-700 opacity-60'
                  }`}>
                    <Trophy className={`w-5 h-5 mx-auto mb-1 ${isUnlocked ? 'text-purple-400' : 'text-slate-800'}`} />
                    <span className="text-[10px] block leading-tight truncate">{bName}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
