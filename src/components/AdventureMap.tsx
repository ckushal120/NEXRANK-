/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, CheckCircle2, Flame, Award, Swords, HelpCircle, 
  MapPin, Sparkles, BookOpen, Compass, ShieldAlert, Zap, 
  Trophy, Star, ChevronRight, PlayCircle
} from 'lucide-react';
import { Question, TestSession, SubjectType } from '../types';
import { PYQ_DATABASE } from '../data/pyqDatabase';

// Types for Adventure Map Nodes
export interface LocationNode {
  id: string;
  name: string;
  type: 'chapter' | 'boss';
  subject?: SubjectType;
  chapterKey?: string; // Maps to chapter name in database
  description: string;
  unlockedAtXp: number;
  bossName?: string;
  titleReward?: string;
  icon: string;
}

export interface WorldRegion {
  id: string;
  name: string;
  desc: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  nodes: LocationNode[];
}

export const ADVENTURE_WORLDS: WorldRegion[] = [
  {
    id: 'world-1',
    name: 'WORLD 1: FOUNDATION FOREST',
    desc: 'Unearth absolute roots of JEE. Establish sets, solve mechanics, master stoichiometry.',
    bgGradient: 'from-emerald-950/60 via-slate-900 to-slate-950',
    textColor: 'text-emerald-400',
    accentColor: 'emerald',
    nodes: [
      {
        id: 'w1-n1',
        name: 'Sets & Functions',
        type: 'chapter',
        subject: 'Mathematics',
        chapterKey: 'Sets, Relations & Functions',
        description: 'Explore set boundaries, mappings, and inverse relations used across advanced mathematics.',
        unlockedAtXp: 0,
        icon: 'Compass'
      },
      {
        id: 'w1-n2',
        name: 'Units & Dimensions',
        type: 'chapter',
        subject: 'Physics',
        chapterKey: 'Kinematics & Laws of Motion',
        description: 'Establish unit correctness, dimensional constants, and calculation errors tracking.',
        unlockedAtXp: 100,
        icon: 'MapPin'
      },
      {
        id: 'w1-n3',
        name: 'Mole Concept Village',
        type: 'chapter',
        subject: 'Chemistry',
        chapterKey: 'Mole Concept & Chemical Equilibrium',
        description: 'Learn mole calculations, concentration variables, and reactant stoichiometry.',
        unlockedAtXp: 250,
        icon: 'BookOpen'
      },
      {
        id: 'w1-boss',
        name: 'FOUNDATION BOSS: Dimensional Drake',
        type: 'boss',
        bossName: 'Dimensional Drake',
        description: 'Defeat the Foundation Boss with high-difficulty conceptual questions to clear World 1!',
        unlockedAtXp: 400,
        titleReward: 'Kinematics Master',
        icon: 'Swords'
      }
    ]
  },
  {
    id: 'world-2',
    name: 'WORLD 2: PHYSICS PEAKS',
    desc: 'Brave mechanical valleys, gravitational canyons, and the Rotation Fortress.',
    bgGradient: 'from-cyan-950/60 via-slate-900 to-slate-950',
    textColor: 'text-cyan-400',
    accentColor: 'cyan',
    nodes: [
      {
        id: 'w2-n1',
        name: 'Kinematics Valley',
        type: 'chapter',
        subject: 'Physics',
        chapterKey: 'Kinematics & Laws of Motion',
        description: 'Determine equations of motion, relative velocities, and projectile projectile paths.',
        unlockedAtXp: 500,
        icon: 'Compass'
      },
      {
        id: 'w2-n2',
        name: 'NLM Mountains',
        type: 'chapter',
        subject: 'Physics',
        chapterKey: 'Kinematics & Laws of Motion',
        description: 'Solve multi-block tension arrays, frictional forces on wedges, and equilibrium charts.',
        unlockedAtXp: 650,
        icon: 'MapPin'
      },
      {
        id: 'w2-n3',
        name: 'Work Power Energy Canyon',
        type: 'chapter',
        subject: 'Physics',
        chapterKey: 'Work, Energy & Power',
        description: 'Apply work-energy theorem, spring variables, and elastic/inelastic collisions.',
        unlockedAtXp: 800,
        icon: 'Zap'
      },
      {
        id: 'w2-n4',
        name: 'Rotation Fortress',
        type: 'chapter',
        subject: 'Physics',
        chapterKey: 'Rotational Motion & System of Particles',
        description: 'Calculate moment of inertia, rolling friction parameters, and angular conservation.',
        unlockedAtXp: 1000,
        icon: 'Trophy'
      },
      {
        id: 'w2-boss',
        name: 'PHYSICS BOSS: Angular Titan',
        type: 'boss',
        bossName: 'Angular Titan',
        description: 'Spin-locked battle requiring precise torque and moment equation solving!',
        unlockedAtXp: 1200,
        titleReward: 'Physics Warrior',
        icon: 'Swords'
      }
    ]
  },
  {
    id: 'world-3',
    name: 'WORLD 3: CHEMISTRY KINGDOM',
    desc: 'Synthesize molecules inside chemical bonding castles and general organic forests.',
    bgGradient: 'from-purple-950/60 via-slate-900 to-slate-950',
    textColor: 'text-purple-400',
    accentColor: 'purple',
    nodes: [
      {
        id: 'w3-n1',
        name: 'Chemical Bonding Castle',
        type: 'chapter',
        subject: 'Chemistry',
        chapterKey: 'Chemical Bonding & Molecular Structure',
        description: 'Determine hybridization, molecular orbital configurations, and dipole moments.',
        unlockedAtXp: 1400,
        icon: 'Compass'
      },
      {
        id: 'w3-n2',
        name: 'Organic Forest',
        type: 'chapter',
        subject: 'Chemistry',
        chapterKey: 'General Organic Chemistry & Hydrocarbons',
        description: 'Explore resonance stability, inductive parameters, and electrophilic additions.',
        unlockedAtXp: 1650,
        icon: 'MapPin'
      },
      {
        id: 'w3-n3',
        name: 'Coordination Citadel',
        type: 'chapter',
        subject: 'Chemistry',
        chapterKey: 'Coordination Compounds & d-Block',
        description: 'Master Crystal Field splitting parameter, Isomerism, and coordination ligands.',
        unlockedAtXp: 1900,
        icon: 'BookOpen'
      },
      {
        id: 'w3-boss',
        name: 'CHEMISTRY BOSS: Reaction Reaper',
        type: 'boss',
        bossName: 'Reaction Reaper',
        description: 'An exothermic boss battle across complex mechanism routes!',
        unlockedAtXp: 2200,
        titleReward: 'Organic Champion',
        icon: 'Swords'
      }
    ]
  },
  {
    id: 'world-4',
    name: 'WORLD 4: MATHEMATICS EMPIRE',
    desc: 'Solve matrix boundaries, trigonometry coordinates, derivatives, and vector equations.',
    bgGradient: 'from-amber-950/60 via-slate-900 to-slate-950',
    textColor: 'text-amber-400',
    accentColor: 'amber',
    nodes: [
      {
        id: 'w4-n1',
        name: 'Algebra Arena',
        type: 'chapter',
        subject: 'Mathematics',
        chapterKey: 'Matrices & Determinants',
        description: 'Evaluate system of linear equations, Cramer\'s rule limits, and matrix multiplications.',
        unlockedAtXp: 2400,
        icon: 'Compass'
      },
      {
        id: 'w4-n2',
        name: 'Trigonometry Temple',
        type: 'chapter',
        subject: 'Mathematics',
        chapterKey: 'Trigonometry & Coordinate Geometry',
        description: 'Evaluate trigonometric identities, height/distance properties, and general solutions.',
        unlockedAtXp: 2650,
        icon: 'MapPin'
      },
      {
        id: 'w4-n3',
        name: 'Calculus City',
        type: 'chapter',
        subject: 'Mathematics',
        chapterKey: 'Limits, Continuity & Derivatives',
        description: 'Determine derivatives, Rolle\'s theorem bounds, and L\'Hopital algebraic solutions.',
        unlockedAtXp: 2900,
        icon: 'Zap'
      },
      {
        id: 'w4-n4',
        name: 'Vector Volcano',
        type: 'chapter',
        subject: 'Mathematics',
        chapterKey: 'Vectors & 3D Geometry',
        description: 'Calculate scalar triple product, coplanar projections, and shortest distance lines.',
        unlockedAtXp: 3150,
        icon: 'Trophy'
      },
      {
        id: 'w4-boss',
        name: 'MATH BOSS: Infinite Matrix Dragon',
        type: 'boss',
        bossName: 'Infinite Matrix Dragon',
        description: 'Ultimate dimensional battle combining multi-topic vector and calculus calculus equations!',
        unlockedAtXp: 3400,
        titleReward: 'Calculus King',
        icon: 'Swords'
      }
    ]
  },
  {
    id: 'world-5',
    name: 'FINAL SUMMIT: IIT LANDING LOBBY',
    desc: 'The final destination. Crack a Full 2026 JEE mock exam to claim the rank of IIT Legend.',
    bgGradient: 'from-indigo-950/70 via-slate-900 to-slate-950',
    textColor: 'text-indigo-400',
    accentColor: 'indigo',
    nodes: [
      {
        id: 'w5-boss',
        name: 'IIT SUMMIT MOCK CHALLENGE',
        type: 'boss',
        bossName: 'The JEE Core Evaluator',
        description: 'Launch a challenging, multi-subject full-length practice paper representing the ultimate JEE trial.',
        unlockedAtXp: 4000,
        titleReward: 'IIT Legend',
        icon: 'Trophy'
      }
    ]
  }
];

interface AdventureMapProps {
  xp: number;
  coins: number;
  addXpCoins: (xpToAdd: number, coinsToAdd: number) => void;
  unlockedLocations: string[];
  clearedBosses: string[];
  addClearedBoss: (bossId: string) => void;
  addUnlockedLocation: (nodeId: string) => void;
  onInitiateQuizSession: (session: TestSession) => void;
  onGoToTestsTab: () => void;
  theme?: 'light' | 'dark';
}

export default function AdventureMap({
  xp,
  coins,
  addXpCoins,
  unlockedLocations,
  clearedBosses,
  addClearedBoss,
  addUnlockedLocation,
  onInitiateQuizSession,
  onGoToTestsTab,
  theme = 'light'
}: AdventureMapProps) {
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);
  const [activeWorldIdx, setActiveWorldIdx] = useState(0);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Auto detect active world based on XP
  useEffect(() => {
    let currentIdx = 0;
    for (let i = 0; i < ADVENTURE_WORLDS.length; i++) {
      const worldMinXp = ADVENTURE_WORLDS[i].nodes[0].unlockedAtXp;
      if (xp >= worldMinXp) {
        currentIdx = i;
      }
    }
    setActiveWorldIdx(currentIdx);
  }, [xp]);

  // Node helper functions
  const isNodeUnlocked = (node: LocationNode) => {
    return xp >= node.unlockedAtXp;
  };

  const isLocationCleared = (node: LocationNode) => {
    if (node.type === 'boss') {
      return clearedBosses.includes(node.id);
    }
    return unlockedLocations.includes(node.id);
  };

  const getRankName = (xpVal: number) => {
    if (xpVal < 500) return 'Beginner';
    if (xpVal < 1200) return 'Explorer';
    if (xpVal < 2200) return 'Challenger';
    if (xpVal < 3500) return 'Scholar';
    if (xpVal < 5000) return 'Master';
    if (xpVal < 7000) return 'JEE Warrior';
    return 'IIT Legend';
  };

  const getRankProgress = (xpVal: number) => {
    const limits = [0, 500, 1200, 2200, 3500, 5000, 7000, 10000];
    const rankIdx = limits.findIndex((val, i) => i > 0 && xpVal < val) - 1;
    const activeIdx = rankIdx >= 0 ? rankIdx : 6;
    
    const minXp = limits[activeIdx];
    const maxXp = limits[activeIdx + 1] || 10000;
    const range = maxXp - minXp;
    const progress = ((xpVal - minXp) / range) * 100;
    return {
      progress: Math.min(100, Math.max(0, progress)),
      nextLevelXp: maxXp,
      minLevelXp: minXp
    };
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Beginner': return 'bg-slate-700/30 border-slate-650 text-slate-300';
      case 'Explorer': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'Challenger': return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
      case 'Scholar': return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
      case 'Master': return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
      case 'JEE Warrior': return 'bg-red-500/10 border-red-500/30 text-red-300 animate-pulse';
      case 'IIT Legend': return 'bg-gradient-to-r from-yellow-500/15 to-amber-500/15 border-yellow-500/30 text-yellow-400 animate-bounce';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  const activeWorld = ADVENTURE_WORLDS[activeWorldIdx];

  const renderIcon = (iconName: string, isUnlocked: boolean, isCleared: boolean) => {
    const defaultClasses = "w-5 h-5 transition-transform duration-300 group-hover:scale-110";
    let colorClass = isUnlocked ? "text-cyan-400" : "text-slate-600";
    if (isCleared) colorClass = "text-emerald-400";
    
    switch (iconName) {
      case 'Compass': return <Compass className={`${defaultClasses} ${colorClass}`} />;
      case 'MapPin': return <MapPin className={`${defaultClasses} ${colorClass}`} />;
      case 'BookOpen': return <BookOpen className={`${defaultClasses} ${colorClass}`} />;
      case 'Zap': return <Zap className={`${defaultClasses} ${colorClass}`} />;
      case 'Trophy': return <Trophy className={`${defaultClasses} ${colorClass}`} />;
      case 'Swords': return <Swords className={`${defaultClasses} text-red-400 animate-pulse`} />;
      default: return <Compass className={`${defaultClasses} ${colorClass}`} />;
    }
  };

  // Launch a localized test session based on chapter node
  const handleStartPracticeQuiz = async (node: LocationNode, isBossFight = false) => {
    setIsLoadingQuiz(true);
    try {
      let questionsPoolToUse: Question[] = [];
      const isAIEnabled = coins >= 30; // 30 coins to buy an AI smart question, otherwise standard pyq pool
      
      if (node.type === 'boss') {
        // Boss fight matches high difficulty questions from relevant subject or all
        const subjectPool = node.subject ? PYQ_DATABASE.filter(q => q.subject === node.subject) : PYQ_DATABASE;
        const hardPool = subjectPool.filter(q => q.difficulty === 'Hard' || q.difficulty === 'Medium');
        questionsPoolToUse = hardPool.slice(0, 5); // 5 extreme boss questions
        
        if (questionsPoolToUse.length === 0) {
          questionsPoolToUse = PYQ_DATABASE.slice(0, 5);
        }
      } else {
        // Normal chapter quiz matches 3 location PYQs
        questionsPoolToUse = PYQ_DATABASE.filter(q => {
          return q.subject === node.subject && q.chapter === node.chapterKey;
        }).slice(0, 5);

        if (questionsPoolToUse.length === 0) {
          // Fallback if no exact questions matched in offline db
          questionsPoolToUse = PYQ_DATABASE.filter(q => q.subject === node.subject).slice(0, 5);
        }
      }

      // Generate the session
      const session: TestSession = {
        id: `adventure-${Date.now()}`,
        name: isBossFight ? `BOSS ENCOUNTER: ${node.bossName}` : `Checkpoint Quiz: ${node.name}`,
        type: node.type === 'boss' ? 'Full Main' : 'Chapter',
        subject: node.subject,
        chapters: node.chapterKey ? [node.chapterKey] : [],
        duration: isBossFight ? 12 : 8, // reduced timing for exciting rapid brawls
        timeLimit: (isBossFight ? 12 : 8) * 60,
        questions: questionsPoolToUse,
        status: 'In Progress',
        answers: {},
        timeSpentPerQuestion: {},
        startedAt: new Date().toISOString()
      };

      // Deduct coins if we spent any or just trigger transition
      if (isBossFight) {
        // boss battles are intense, no coin penalty but intense timer
      }

      // Register location as active so we can clear on test finish
      localStorage.setItem('nexrank_intended_clear_node', node.id);

      onInitiateQuizSession(session);
      setSelectedNode(null);
      onGoToTestsTab();
    } catch (e) {
      console.error(e);
      alert('Error launching adventure arena. Seeding from local database.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const levelInfo = getRankProgress(xp);
  const userRank = getRankName(xp);

  return (
    <div className="space-y-6">
      
      {/* 1. TOP STATS BAR GAMIFIED SUMMARY */}
      <div className={`border transition-all duration-300 rounded-[24px] p-5 shadow-sm hover:shadow-md ${
        theme === 'dark'
          ? 'glass-card-dark bg-slate-900/65 border-slate-800'
          : 'glass-card-light bg-white/75 border-slate-200/80'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`py-1.5 px-3.5 rounded-full border text-xs font-black font-mono shadow-sm uppercase ${getRankBadgeColor(userRank)}`}>
              🛡️ {userRank}
            </div>
            <div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest block ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-550'
              }`}>JEE RANK PATHWAY</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xl font-extrabold tracking-tight font-sans ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                }`}>NEX PREP PATHWAYS</span>
                <span className="text-xs text-electric-purple font-mono font-bold">Lvl {Math.floor(xp / 100) + 1}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`border py-2 px-4 rounded-2xl text-center ${
              theme === 'dark' ? 'bg-slate-950/80 border-slate-850' : 'bg-slate-50 border-slate-200/60'
            }`}>
              <span className="text-[9.5px] font-mono text-slate-500 uppercase font-black tracking-wide block">EXP POINTS</span>
              <span className="text-sm font-black text-royal-blue dark:text-cyan-400 font-mono">{xp} XP</span>
            </div>
            <div className={`border py-2 px-4 rounded-2xl text-center ${
              theme === 'dark' ? 'bg-slate-950/80 border-slate-850' : 'bg-slate-50 border-slate-200/60'
            }`}>
              <span className="text-[9.5px] font-mono text-slate-500 uppercase font-black tracking-wide block">NEX COINS</span>
              <span className="text-sm font-black text-amber-500 font-mono">🪙 {coins}</span>
            </div>
          </div>
        </div>

        {/* XP Level Progress Indicator */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-400">
            <span>Next Rank: <strong className="text-electric-purple dark:text-cyan-300">{getRankName(levelInfo.nextLevelXp)}</strong></span>
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}>{xp - levelInfo.minLevelXp} / {levelInfo.nextLevelXp - levelInfo.minLevelXp} XP</span>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden border shadow-inner ${
            theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-[#EEF2FF] border-slate-200'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-royal-blue via-electric-purple to-[#FB7185] rounded-full transition-all duration-500" 
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. ADVENTURE MAP BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Worlds & Connecting Nodes Pathway */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-850">
            <span className="text-xs font-mono font-black text-slate-400 uppercase tracking-wide">
              🧭 MAP COMPASS LANDSCAPE
            </span>
            
            {/* World Switcher Tabs */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none max-w-full">
              {ADVENTURE_WORLDS.map((world, idx) => {
                const isSelected = activeWorldIdx === idx;
                const isWorldLocked = xp < world.nodes[0].unlockedAtXp;
                
                return (
                  <button
                    key={world.id}
                    onClick={() => !isWorldLocked && setActiveWorldIdx(idx)}
                    disabled={isWorldLocked}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-md shadow-cyan-500/15'
                        : isWorldLocked
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isWorldLocked ? '🔒 World ' + (idx + 1) : world.name.split(':')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active World Map Area */}
          <div className={`relative rounded-3xl p-6 md:p-8 space-y-8 bg-gradient-to-b ${activeWorld.bgGradient} border border-slate-800 shadow-2xl`}>
            
            {/* Ambient decorations */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(6,182,212,0.06)_1%,transparent_60%)] pointer-events-none rounded-3xl" />
            
            <div className="border-b border-slate-800 pb-4">
              <h2 className={`text-base font-black tracking-wider ${activeWorld.textColor}`}>{activeWorld.name}</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeWorld.desc}</p>
            </div>

            {/* Connecting Nodes Path Canvas Simulation (Horizontal/Vertical Grid map sequence) */}
            <div className="relative pt-6 pb-12 flex flex-col items-center">
              
              <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
                
                {activeWorld.nodes.map((node, nIdx) => {
                  const unlocked = isNodeUnlocked(node);
                  const cleared = isLocationCleared(node);
                  const isSNode = selectedNode?.id === node.id;
                  
                  return (
                    <div key={node.id} className="flex flex-col items-center text-center relative z-10 group">
                      
                      {/* Connection Indicator line for HTML layout */}
                      {nIdx < activeWorld.nodes.length - 1 && (
                        <div className="hidden md:block absolute left-1/2 right-[-50%] top-9 h-[2px] bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 pointer-events-none -z-10 group-hover:from-cyan-400" />
                      )}

                      {/* The Node Button */}
                      <button
                        onClick={() => unlocked && setSelectedNode(node)}
                        className={`w-18 h-18 rounded-2xl flex items-center justify-center border transition-all duration-300 relative cursor-pointer ${
                          cleared
                            ? 'bg-gradient-to-br from-emerald-500/15 to-emerald-700/5 border-emerald-500 shadow-lg shadow-emerald-500/10 hover:border-emerald-400 scale-102'
                            : isSNode
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20 scale-105'
                            : unlocked
                            ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10'
                            : 'bg-slate-950/90 border-slate-900 text-slate-750 opacity-60 hover:opacity-80'
                        }`}
                      >
                        {/* Glow indicators if locked/unlocked */}
                        {unlocked && !cleared && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
                        )}

                        {renderIcon(node.icon, unlocked, cleared)}

                        {!unlocked && (
                          <Lock className="w-4 h-4 text-slate-700 absolute bottom-1.5" />
                        )}
                      </button>

                      <div className="mt-3.5 space-y-1">
                        <span className={`text-[11.5px] font-bold block leading-snug tracking-tight ${
                          unlocked ? 'text-slate-200' : 'text-slate-650'
                        }`}>
                          {node.name}
                        </span>
                        
                        {node.type === 'boss' ? (
                          <span className="text-[9px] font-mono leading-none bg-red-500/10 text-red-400 border border-red-500/15 py-0.5 px-1.5 rounded block font-black">
                            BOSS ENCOUNTER
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-500 block">
                            {cleared ? 'Cleared ✓' : unlocked ? 'Unlocked' : `Requires ${node.unlockedAtXp} XP`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce flex-shrink-0" />
                <span className="text-xs text-slate-400 leading-normal">
                  Want to defeat chapter bosses instantly? Level up your rank by solving practice tests inside the <strong>Mock Center</strong>! Defeated chapter-bosses award exclusive Titles and substantial XP.
                </span>
              </div>
              <button 
                onClick={onGoToTestsTab}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 py-1.5 px-4 rounded-xl text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              >
                Go to Testing Center
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Node Detail Inspector Drawer */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl min-h-[300px]">
            {selectedNode ? (
              <div className="space-y-5 animate-fade-in flex flex-col justify-between h-full">
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={`text-[9.5px] font-mono uppercase px-2 py-0.5 rounded border ${
                      selectedNode.type === 'boss'
                        ? 'bg-red-500/15 border-red-500/25 text-red-400'
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    }`}>
                      {selectedNode.type === 'boss' ? 'Brawl Arena' : selectedNode.subject}
                    </span>
                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="text-slate-500 hover:text-slate-300 text-xs font-mono"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 leading-snug">
                      {selectedNode.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2 bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                      {selectedNode.description}
                    </p>
                  </div>

                  {selectedNode.type === 'boss' && (
                    <div className="p-3 bg-red-955/30 border border-red-900/30 rounded-xl space-y-1">
                      <span className="text-[9px] font-mono text-red-400 tracking-wide font-black block uppercase">BOSS REWARD DETAILS:</span>
                      <span className="text-xs text-slate-300 font-bold block">🏆 Defeat {selectedNode.bossName} to earn:</span>
                      <span className="text-[11px] font-mono text-yellow-400 font-semibold block italic mt-0.5">
                        • Achievement Title: "{selectedNode.titleReward || 'Kinematics Master'}"
                      </span>
                      <span className="text-[10.5px] font-mono text-cyan-400 block">• +150 Points & +100 Coins</span>
                    </div>
                  )}

                  {selectedNode.type === 'chapter' && selectedNode.chapterKey && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-[11px]">
                      <span className="text-slate-450 block font-mono text-[9px] uppercase">EXAM SYLLABUS CORRELATION:</span>
                      <span className="text-slate-200 mt-1 font-semibold block">{selectedNode.chapterKey}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleStartPracticeQuiz(selectedNode, selectedNode.type === 'boss')}
                    disabled={isLoadingQuiz}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform ${
                      selectedNode.type === 'boss'
                        ? 'bg-red-500 hover:bg-red-400 text-white hover:shadow-red-500/20'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-500/25'
                    }`}
                  >
                    {isLoadingQuiz ? (
                      <span className="animate-pulse">BOOTING ARENA CORE...</span>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        {selectedNode.type === 'boss' ? 'BATTLE BOSS FIGHT!' : 'START LOCATION CONTEST'}
                      </>
                    )}
                  </button>
                  <span className="text-[9px] font-mono text-slate-500 text-center block mt-2">
                    {selectedNode.type === 'boss' 
                      ? 'WARNING: Tough questions, strict 12 min limit' 
                      : '5 PYQs, standard response marking system applies'}
                  </span>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Compass className="w-12 h-12 text-slate-700 animate-pulse mb-3" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">LOCATION INSPECTING TERMINAL</h4>
                <p className="text-[11px] text-slate-500 leading-normal max-w-[180px] mt-2 mx-auto">
                  Click on any unlocked location or epic boss node on the left world map to view syllabus guidelines and enter the arena!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
