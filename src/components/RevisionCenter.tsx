/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, BookOpen, Trash2, CheckCircle2, ChevronRight, HelpCircle, 
  RotateCcw, Sparkles, Flame, PlayCircle, Star, Award, Layers
} from 'lucide-react';
import { MistakeBookItem, Question, SubjectType, TestSession } from '../types';
import { FORMULA_BOOK, PYQ_DATABASE } from '../data/pyqDatabase';

interface RevisionCenterProps {
  mistakes: MistakeBookItem[];
  onRemoveMistake: (qId: string) => void;
  onLaunchQuestionQuiz: (q: Question) => void;
  userScore: number;
  setUserScore: (score: number) => void;
  testSessions: any[];
  onInitiateQuizSession: (session: TestSession) => void;
  onGoToTestsTab: () => void;
  theme?: string;
}

// Concept flashcards list definition
interface ConceptCard {
  id: string;
  subject: SubjectType;
  title: string;
  frontText: string;
  backExplanation: string;
  highYieldFactor: string; // "High", "Critical", "Extreme"
}

const DEFAULT_CONCEPT_DECK: ConceptCard[] = [
  {
    id: 'cc-1',
    subject: 'Physics',
    title: 'Work-Energy Theorem with Variable Friction',
    frontText: 'State the Work-Energy Theorem for a system with conservative, non-conservative, and frictional work.',
    backExplanation: 'Work done by ALL forces (conservative + non-conservative + external) equals the change in kinetic energy of the system: W_all = \u0394K. Under variable sliding friction \u03bc(x), W_friction = -\u222b\u03bc(x)mg dx.',
    highYieldFactor: 'Critical'
  },
  {
    id: 'cc-2',
    subject: 'Physics',
    title: 'Photoelectric Threshold & Stopping Voltage',
    frontText: 'Explain the stopping potential formula as a function of light frequency \u03bd and threshold frequency \u03bd0.',
    backExplanation: 'Einstein photoelectric equation: eV_s = h\u03bd - h\u03bd0. Thus, stopping potential V_s = (h/e)\u03bd - \u03c6/e. The slope of V_s vs \u03bd graph is h/e, which is universal for all metals.',
    highYieldFactor: 'Extreme'
  },
  {
    id: 'cc-3',
    subject: 'Chemistry',
    title: 'Crystal Field Theory splitting of d-orbitals',
    frontText: 'How do d-orbitals split in an Octahedral Crystal Field structure?',
    backExplanation: 'Spherical symmetry is lifted. In octahedral environments, ligands align along x, y, z axes. d(x^2-y^2) and d(z^2) orbitals (e_g set) experience greater repulsion and rise by +0.6 \u0394o, while d(xy), d(yz), d(zx) orbitals (t_2g set) drop by -0.4 \u0394o.',
    highYieldFactor: 'Extreme'
  },
  {
    id: 'cc-4',
    subject: 'Chemistry',
    title: 'Nernst Equation for concentration cells',
    frontText: 'Write the EMF formulation of a hydrogen electrode concentration cell with differing positive cell pressures.',
    backExplanation: 'E_cell = E\u00ba_cell - (RT/nF)ln(Q). For identical half-cells under different pressures, E\u00ba_cell = 0. E_cell = -(0.0591/2) * log(P_anode / P_cathode) at 298 K. This means positive EMF is generated if P_cathode > P_anode.',
    highYieldFactor: 'Critical'
  },
  {
    id: 'cc-5',
    subject: 'Mathematics',
    title: 'Cramer\'s Rule for Infinite Solutions',
    frontText: 'What is the absolute criterion for a system of 3 linear equations to have infinitely many solutions?',
    backExplanation: 'The determinant \u0394 = 0, AND all coordinate determinants \u0394x = \u0394y = \u0394z = 0, provided the planes do not represent parallel configurations (which would render no solution).',
    highYieldFactor: 'Extreme'
  },
  {
    id: 'cc-6',
    subject: 'Mathematics',
    title: 'Coplanar Vectors triple product mapping',
    frontText: 'Define the mathematical requirement for three non-zero vectors A, B, and C to be strictly coplanar.',
    backExplanation: 'Their scalar triple product is zero: [A B C] = A \u00b7 (B \u00d7 C) = 0. In matrix form, the 3x3 determinant composed of their vector coordinates evaluates exactly to zero.',
    highYieldFactor: 'Critical'
  }
];

export default function RevisionCenter({
  mistakes,
  onRemoveMistake,
  onLaunchQuestionQuiz,
  userScore,
  setUserScore,
  testSessions,
  onInitiateQuizSession,
  onGoToTestsTab,
  theme = 'light'
}: RevisionCenterProps) {
  // Subview toggles: "mistakes" | "formula-speed" | "flashcards" | "7-days"
  const [subTab, setSubTab] = useState<'mistakes' | 'formula-speed' | 'flashcards' | '7-days'>('mistakes');

  // Formula speed-quiz state
  const [activeQuizSubject, setActiveQuizSubject] = useState<SubjectType | null>(null);
  const [speedQuestion, setSpeedQuestion] = useState<{ formulaName: string; options: string[]; correctIdx: number } | null>(null);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quick revision tests launcher helper
  const handleQuickRevisionTest = (sub: SubjectType) => {
    // Generate a quick test based on subject
    const questionsPool = testSessions.length > 0 ? testSessions : [];
    // select 5 moderate question items
    const pyqs = PYQ_DATABASE.filter((q: Question) => q.subject === sub).slice(0, 5);
    const session: TestSession = {
      id: `rev-${Date.now()}`,
      name: `Quick Revision Test: ${sub}`,
      type: 'Custom',
      duration: 5,
      timeLimit: 5 * 60,
      questions: pyqs,
      status: 'In Progress',
      answers: {},
      timeSpentPerQuestion: {},
    };
    onInitiateQuizSession(session);
    onGoToTestsTab();
  };

  // Launch speed formulas
  const triggerFormulaQuiz = (sub: SubjectType) => {
    setActiveQuizSubject(sub);
    setSelectedAnswerIdx(null);

    const categories = FORMULA_BOOK[sub];
    if (!categories || categories.length === 0) return;

    const all = categories.flatMap(cat => cat.formulas);
    if (all.length === 0) return;

    const randomF = all[Math.floor(Math.random() * all.length)];
    const correct = randomF.latex;
    const wrongOnes = all.filter(f => f.latex !== correct).map(f => f.latex).slice(0, 3);
    
    while (wrongOnes.length < 3) {
      wrongOnes.push('\\Delta H = \\Delta U + \\Delta n_g RT');
    }

    const options = [correct, ...wrongOnes].sort(() => Math.random() - 0.5);
    const correctIdx = options.indexOf(correct);

    setSpeedQuestion({
      formulaName: `${randomF.name}: ${randomF.desc}`,
      options,
      correctIdx
    });
  };

  const submitFormulaAnswer = (idx: number) => {
    setSelectedAnswerIdx(idx);
    if (idx === speedQuestion?.correctIdx) {
      const newScore = userScore + 20;
      setUserScore(newScore);
      localStorage.setItem('quantum_jee_score', String(newScore));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Ribbon Navigation Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {[
          { tabId: 'mistakes', tabTitle: `Mistake Book (${mistakes.length})`, icon: AlertTriangle },
          { tabId: 'formula-speed', tabTitle: 'Formula Speed Quiz', icon: BookOpen },
          { tabId: 'flashcards', tabTitle: 'Interactive Concept Cards', icon: Sparkles },
          { tabId: '7-days', tabTitle: 'Last 7 Days Revision Mode', icon: Flame }
        ].map(item => {
          const IsActive = subTab === item.tabId;
          const Icon = item.icon;
          
          return (
            <button
              key={item.tabId}
              id={`rev-sub-tab-${item.tabId}`}
              onClick={() => setSubTab(item.tabId as any)}
              className={`text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                IsActive
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800 font-extrabold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.tabTitle}
            </button>
          );
        })}
      </div>

      {/* A. MISTAKE BOOK SECTION */}
      {subTab === 'mistakes' && (
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 animate-fade-in">
          <div>
            <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 s-4 text-rose-500" />
              Ultimate JEE Mistake Book
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal mt-1">
              Wrong selections during mock sessions register below automatically. Re-try questions step-by-step and read AI Coach feedbacks to ensure perfect conceptual coverage.
            </p>
          </div>

          {mistakes.length > 0 ? (
            <div className="space-y-4">
              {mistakes.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-850 bg-slate-950/50 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-2">
                    <div className="flex gap-1.5">
                      <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono uppercase">
                        {m.question.subject}
                      </span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono truncate max-w-[130px]">
                        {m.question.chapter}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onLaunchQuestionQuiz(m.question)}
                        className="text-[9.5px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-2.5 py-1 rounded cursor-pointer"
                      >
                        RE-SOLVE AS INSTANT QUIZ
                      </button>
                      <button
                        onClick={() => onRemoveMistake(m.question.id)}
                        className="p-1 rounded bg-slate-900 hover:bg-rose-500/10 text-slate-500 hover:text-rose-450 transition-colors cursor-pointer"
                        title="Remove question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{m.question.text}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] bg-slate-950/80 p-3 rounded-lg border border-slate-900">
                    <div>
                      <span className="text-[9.5px] text-slate-500 block font-mono">YOUR OUTDATED RESPONSE:</span>
                      <span className="font-extrabold text-rose-400 font-mono italic">{JSON.stringify(m.userAnswer)}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-500 block font-mono">OFFICIAL SCHEMATIC ANSWER:</span>
                      <span className="font-extrabold text-emerald-400 font-mono italic">{JSON.stringify(m.question.correctAnswer)}</span>
                    </div>
                  </div>

                  {m.aiExplanation && (
                    <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl text-xs space-y-1">
                      <span className="text-[9px] font-mono text-cyan-350 font-black uppercase">Coach explanation card:</span>
                      <p className="text-slate-300 leading-normal whitespace-pre-wrap">{m.aiExplanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-850">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-extrabold text-slate-300">No mistakes logged yet.</p>
              <p className="text-[11px] text-slate-550 mt-1">Keep attempting practice papers inside the testing center to map errors automatically.</p>
            </div>
          )}
        </div>
      )}

      {/* B. FORMULA SPEED QUIZ SECTION */}
      {subTab === 'formula-speed' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Equation Identification Arena
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select a subject area to test equation recognition speeds. Correct options award <strong>+20 Prep Points</strong>.
              </p>
            </div>

            <div className="flex gap-2">
              {['Physics', 'Chemistry', 'Mathematics'].map(subject => (
                <button
                  key={subject}
                  id={`rev-formula-subject-${subject}`}
                  onClick={() => triggerFormulaQuiz(subject as SubjectType)}
                  className="bg-slate-800 hover:bg-slate-700 hover:text-slate-100 text-cyan-300 border border-slate-700/80 text-[10.5px] font-bold py-1.5 px-3 rounded-lg cursor-pointer"
                >
                  {subject.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {activeQuizSubject && speedQuestion && (
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/90 border border-cyan-500/20 p-5 rounded-2xl shadow-xl space-y-4">
              <span className="text-[9.5px] font-mono text-cyan-400 font-bold tracking-wide uppercase block border-b border-slate-850 pb-2">
                ⚡ CURRENT FORMULA INITIATED: {activeQuizSubject.toUpperCase()}
              </span>

              <p className="text-xs font-extrabold text-slate-200">
                Identify the correct equation representing: <span className="text-cyan-300 font-mono block mt-1 bg-slate-950 p-3 rounded-lg border border-slate-850">{speedQuestion.formulaName}</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {speedQuestion.options.map((opt, idx) => {
                  const isAnswered = selectedAnswerIdx !== null;
                  const isCorrect = idx === speedQuestion.correctIdx;
                  const isSelected = idx === selectedAnswerIdx;

                  return (
                    <button
                      key={idx}
                      id={`rev-formula-ans-${idx}`}
                      onClick={() => !isAnswered && submitFormulaAnswer(idx)}
                      disabled={isAnswered}
                      className={`text-left p-4 rounded-xl border font-mono text-xs transition-colors cursor-pointer ${
                        isAnswered
                          ? isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                            : isSelected
                            ? 'bg-rose-500/10 border-rose-500 text-rose-300'
                            : 'bg-slate-950/30 border-slate-900 text-slate-600'
                          : 'bg-slate-950/80 border-slate-850 hover:border-slate-500 text-slate-350'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-550 text-[10px] font-mono">[0{idx + 1}]</span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedAnswerIdx !== null && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs font-mono">
                  {selectedAnswerIdx === speedQuestion.correctIdx ? (
                    <span className="text-emerald-400 font-bold block">✓ Splendid! Equation mapped correctly. +20 Points added</span>
                  ) : (
                    <span className="text-rose-450 block">✗ Mistype! Correct equation was Option {speedQuestion.correctIdx + 1}.</span>
                  )}
                  <button
                    onClick={() => triggerFormulaQuiz(activeQuizSubject)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-1 px-3 rounded text-[10px] cursor-pointer"
                  >
                    Next Formula
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* C. CONCEPT DECK FLASHCARDS */}
      {subTab === 'flashcards' && (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto flex flex-col items-center">
          
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black text-slate-100 flex items-center justify-center gap-1.5">
              <Sparkles className="text-purple-400 w-5 h-5" />
              Dynamic Concept Cards Deck
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed max-w-[360px] mx-auto">
              Flip and swipe high-yield conceptual cards to review key formulations and mechanical proofs!
            </p>
          </div>

          {/* Flashcard Component layout wrapper */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-md h-64 relative cursor-pointer group perspe-1000"
          >
            {/* Flippable Card Container */}
            <div className={`w-full h-full rounded-2xl border transition-all duration-500 relative transform preserve-3d shadow-xl ${
              isFlipped 
                ? 'rotate-y-180 bg-gradient-to-br from-indigo-950/70 to-purple-950/80 border-purple-500/40' 
                : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700/80 group-hover:border-slate-500'
            }`}>
              
              {/* FRONT VIEW */}
              <div className={`absolute inset-0 p-5 flex flex-col justify-between back-hidden ${isFlipped ? 'opacity-0 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center text-[10px] font-mono text-purple-400">
                  <span className="font-bold uppercase tracking-wider">{DEFAULT_CONCEPT_DECK[cardIndex].subject}</span>
                  <span className="bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-black">
                    {DEFAULT_CONCEPT_DECK[cardIndex].highYieldFactor} Yield
                  </span>
                </div>

                <div className="my-auto text-center space-y-3">
                  <strong className="text-sm text-slate-200 block font-sans tracking-tight leading-snug">
                    {DEFAULT_CONCEPT_DECK[cardIndex].title}
                  </strong>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium px-4">
                    {DEFAULT_CONCEPT_DECK[cardIndex].frontText}
                  </p>
                </div>

                <div className="text-center text-[9.5px] font-mono text-slate-500 uppercase animate-pulse">
                  Click card area to Reveal Core Concept Answer
                </div>
              </div>

              {/* BACK VIEW */}
              <div className={`absolute inset-0 p-5 flex flex-col justify-between rotate-y-180 back-hidden ${!isFlipped ? 'opacity-0 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400">
                  <span className="font-bold uppercase">CORRECT MAPPED EXPLOIT</span>
                  <span>[0{cardIndex + 1} of 0{DEFAULT_CONCEPT_DECK.length}]</span>
                </div>

                <div className="my-auto p-3 bg-slate-950/60 rounded-xl border border-slate-850 select-all font-mono text-[11px] leading-relaxed text-slate-200 select-all overflow-y-auto max-h-[140px] scrollbar-none">
                  {DEFAULT_CONCEPT_DECK[cardIndex].backExplanation}
                </div>

                <div className="text-center text-[9.5px] font-mono text-slate-500">
                  Click area to return to Front Prompt
                </div>
              </div>

            </div>
          </div>

          {/* Flashcards control indicators */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex(prev => Math.max(0, prev - 1));
              }}
              disabled={cardIndex === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              Previous Card
            </button>
            <span className="text-xs font-mono text-slate-500">
              Card {cardIndex + 1} / {DEFAULT_CONCEPT_DECK.length}
            </span>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCardIndex(prev => Math.min(DEFAULT_CONCEPT_DECK.length - 1, prev + 1));
              }}
              disabled={cardIndex === DEFAULT_CONCEPT_DECK.length - 1}
              className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              Next Card
            </button>
          </div>

        </div>
      )}

      {/* D. LAST 7 DAYS REVISION MODE */}
      {subTab === '7-days' && (
        <div className="space-y-6 animate-fade-in bg-gradient-to-tr from-slate-950 to-indigo-950/40 p-5 rounded-2xl border border-rose-500/20">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs py-1 px-2 rounded-full bg-rose-500/10 text-rose-450 border border-rose-500/15 font-black font-mono uppercase">
                ⏰ Hyper Focus Mode
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-100 font-sans">
                  Last 7 Days Extreme Revision Mode
                </h3>
                <span className="text-[10px] text-slate-500 font-mono block">FINAL REVISION DEPLOYMENT PLATFORM</span>
              </div>
            </div>

            <span className="text-[10.5px] font-mono text-slate-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl">
              High-Yield Target Notes
            </span>
          </div>

          {/* Quick Cheat Sheets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-3">
              <span className="text-[10.5px] font-mono text-cyan-400 font-bold block uppercase border-b border-slate-900 pb-1.5">
                ⚛️ Physics Final 7 Days
              </span>
              <ul className="space-y-2 text-[11px] text-slate-400 leading-normal list-disc pl-3.5">
                <li><strong>Momentum conservation</strong> is always applied coaxial. Verify angular velocity calculations.</li>
                <li><strong>Stopping Voltage</strong> slope corresponds strictly to <code className="text-yellow-400">h/e</code>.</li>
                <li><strong>Capacitor Dielectrics</strong> filled vertical align as series capacitors. <code className="text-yellow-400">C_eq = (2K1K2)/(K1+K2)</code>.</li>
              </ul>
              <button
                onClick={() => handleQuickRevisionTest('Physics')}
                className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/25 py-2 rounded-xl text-[10px] tracking-wide cursor-pointer transition-colors"
                id="7d-quiz-phy"
              >
                QUICK PHYSICS TEST
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-3">
              <span className="text-[10.5px] font-mono text-purple-400 font-bold block uppercase border-b border-slate-900 pb-1.5">
                🧪 Chemistry Final 7 Days
              </span>
              <ul className="space-y-2 text-[11px] text-slate-400 leading-normal list-disc pl-3.5">
                <li>Under <strong>Octahedral splitting</strong>, d-orbitals split into <code className="text-yellow-400">e_g (+0.6 \u0394o)</code> and <code className="text-yellow-400">t_2g (-0.4 \u0394o)</code>.</li>
                <li><strong>Mole stoichiometry</strong>: reactant limiting agents determine overall product bounds.</li>
                <li>In concentration cells, positive potential arises when pressure on anode decreases relative to cathode.</li>
              </ul>
              <button
                onClick={() => handleQuickRevisionTest('Chemistry')}
                className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold border border-purple-500/25 py-2 rounded-xl text-[10px] tracking-wide cursor-pointer transition-colors"
                id="7d-quiz-chem"
              >
                QUICK CHEMISTRY TEST
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-3">
              <span className="text-[10.5px] font-mono text-amber-400 font-bold block uppercase border-b border-slate-900 pb-1.5">
                📐 Mathematics Final 7 Days
              </span>
              <ul className="space-y-2 text-[11px] text-slate-400 leading-normal list-disc pl-3.5">
                <li><strong>Cramer\'s Rule</strong>: Infinitely many solution configurations require all <code className="text-yellow-400">\u0394 = \u0394x = \u0394y = \u0394z = 0</code>.</li>
                <li><strong>Coplanar vectors</strong> triple box formulation evaluates exactly to zero: <code className="text-yellow-400">[a b c] = 0</code>.</li>
                <li>Derivatives continuity: always solve left limit variables relative to right limit equations.</li>
              </ul>
              <button
                onClick={() => handleQuickRevisionTest('Mathematics')}
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold border border-amber-500/25 py-2 rounded-xl text-[10px] tracking-wide cursor-pointer transition-colors"
                id="7d-quiz-math"
              >
                QUICK MATHS TEST
              </button>
            </div>

          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-850 text-center">
            <span className="text-[10.5px] font-mono text-rose-450 block font-bold leading-normal">
              ⏳ ALL COMPREHENSIVE REVISION CARDS COMPLETED
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              These final checklists synthesize historical JEE frequency tables from last 10 years of exams.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
