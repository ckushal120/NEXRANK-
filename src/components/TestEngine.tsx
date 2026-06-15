/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, ArrowRight, ArrowLeft, Check, Bookmark, 
  HelpCircle, Clock, Award, CheckCircle2, ChevronRight, BookOpen, 
  Sparkles, AlertTriangle, Eye, RefreshCw, Layers, Loader2 
} from 'lucide-react';
import { Question, TestSession, SubjectType, DifficultyType, QuestionFormType, TestType } from '../types';
import { PYQ_DATABASE, JEE_CHAPTERS } from '../data/pyqDatabase';
import Scratchpad from './Scratchpad';
import Calculators from './Calculators';

interface TestEngineProps {
  onTestCompleted: (session: TestSession) => void;
  activePreExtractedQuestion?: Question | null;
  resetPreExtractedQuestion?: () => void;
  weakChapters?: string[];
  prelaunchedSession?: TestSession | null;
  resetPrelaunchedSession?: () => void;
  theme?: string;
}

function ProctorWebcam() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative aspect-[4/3] w-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col justify-between p-2">
      {/* Scanner laser animation */}
      <div className="absolute inset-x-0 h-[1px] bg-cyan-400/30 top-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_1%,transparent_60%)]" />

      {/* Target framing brackets */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-cyan-500/40" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-cyan-500/40" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-cyan-500/40" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-cyan-500/40" />

      {/* top dashboard telemetry line */}
      <div className="flex items-center justify-between z-10">
        <span className="text-[8px] font-mono font-bold text-red-500 flex items-center gap-1 bg-red-950/40 border border-red-900/30 px-1 py-0.5 rounded">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          REC {'.'.repeat(dots + 1)}
        </span>
        <span className="text-[8.5px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">SAFE FEED LINKED</span>
      </div>

      {/* centered user placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-xs shadow-inner">
          👤
        </div>
        <div className="w-16 h-4 border border-dashed border-cyan-400/20 rounded-full mt-1.5 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
        </div>
        <span className="text-[8px] font-mono text-cyan-500/50 absolute bottom-1 uppercase">CAMERA BOUND INSECURE iFRAME MOCK</span>
      </div>

      {/* bottom credentials line */}
      <div className="flex items-center justify-between z-10 text-[8px] font-mono text-slate-500 leading-none">
        <span>DEV-3000 CONSOLE</span>
        <span>99.2% DETECTED</span>
      </div>
    </div>
  );
}

export default function TestEngine({ 
  onTestCompleted, 
  activePreExtractedQuestion, 
  resetPreExtractedQuestion, 
  weakChapters = [],
  prelaunchedSession = null,
  resetPrelaunchedSession,
  theme = 'light'
}: TestEngineProps) {
  // Load dynamic candidate email/nickname from authenticated session
  const aspirantEmail = localStorage.getItem('nexrank_user_email') || 'ckushal120@gmail.com';
  const aspirantNick = localStorage.getItem('quantum_jee_nickname') || 'Aspirant';

  // Test generation states
  const [testType, setTestType] = useState<TestType>('Custom');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('Physics');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType | 'All'>('All');
  const [selectedType, setSelectedType] = useState<QuestionFormType | 'All'>('All');
  const [numQuestions, setNumQuestions] = useState(5);
  const [timeLimit, setTimeLimit] = useState(10); // in minutes

  // Customize marking systems & patterns
  const [markingPositive, setMarkingPositive] = useState(4);
  const [markingNegative, setMarkingNegative] = useState(-1);
  const [partialMarking, setPartialMarking] = useState(true);
  const [sectionTiming, setSectionTiming] = useState(false);
  const [antiCheating, setAntiCheating] = useState(false);
  const [cheatingWarnings, setCheatingWarnings] = useState(0);
  const [webcamProctored, setWebcamProctored] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'sleek' | 'nta-simulator'>('sleek');

  // Interactive video / animated solution whiteboard simulator
  const [videoSolvingId, setVideoSolvingId] = useState<string | null>(null);
  const [whiteboardFrame, setWhiteboardFrame] = useState(0);

  // Gamification & Streak settings tracker
  const [xpPoints, setXpPoints] = useState(() => parseInt(localStorage.getItem('nexrank_xp') || '560', 10));
  const [badges, setBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexrank_badges');
    return saved ? JSON.parse(saved) : ['Main Cracker', 'Formula Master', 'Calculus Squire'];
  });
  const [dailyStreak, setDailyStreak] = useState(() => parseInt(localStorage.getItem('nexrank_streak') || '5', 10));
  const [completedToday, setCompletedToday] = useState(false);

  // Multiplayer simulations & Rank battles lobby
  const [lobbyIsSearching, setLobbyIsSearching] = useState(false);
  const [battleRoomCode, setBattleRoomCode] = useState<string | null>(null);
  const [battleOpponent, setBattleOpponent] = useState<{name: string, rating: number, avatar: string, score: number} | null>(null);
  const [battleTimer, setBattleTimer] = useState(0);
  const [isBossMatch, setIsBossMatch] = useState(false);

  // Active Session states
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showConstants, setShowConstants] = useState(false);

  // Active custom filtered NTA subject segment tab
  const [activeNtaSubject, setActiveNtaSubject] = useState<SubjectType>('Physics');

  // Review & Explanation States
  const [reviewingQuestionId, setReviewingQuestionId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing ongoing session if any
  useEffect(() => {
    const saved = localStorage.getItem('quantum_jee_active_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TestSession;
        if (parsed.status === 'In Progress') {
          setActiveSession(parsed);
          setSecondsLeft(parsed.timeLimit);
          // Set visited for index 0
          if (parsed.questions.length > 0) {
            setVisited({ [parsed.questions[0].id]: true });
          }
        }
      } catch (e) {
        console.error('Error reviving local session', e);
      }
    }

    // Load bookmarked questions
    const bm = localStorage.getItem('quantum_jee_bookmarks');
    if (bm) {
      try {
        setBookmarkedIds(JSON.parse(bm));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Handle pre-extracted question from PDF/OCR uploader
  useEffect(() => {
    if (activePreExtractedQuestion) {
      // Direct launch single quiz session for the uploaded question
      const singleSession: TestSession = {
        id: `ocr-${Date.now()}`,
        name: `Extracted MCQ: ${activePreExtractedQuestion.chapter}`,
        type: 'Custom',
        questions: [activePreExtractedQuestion],
        duration: 3,
        timeLimit: 180,
        status: 'In Progress',
        answers: {},
        timeSpentPerQuestion: {},
      };
      setActiveSession(singleSession);
      setCurrentIndex(0);
      setSecondsLeft(180);
      setVisited({ [activePreExtractedQuestion.id]: true });
      localStorage.setItem('quantum_jee_active_session', JSON.stringify(singleSession));
      if (resetPreExtractedQuestion) resetPreExtractedQuestion();
    }
  }, [activePreExtractedQuestion, resetPreExtractedQuestion]);

  // Handle prelaunched full test session (from adventure map or checkpoints)
  useEffect(() => {
    if (prelaunchedSession) {
      setActiveSession(prelaunchedSession);
      setCurrentIndex(0);
      setSecondsLeft(prelaunchedSession.timeLimit);
      if (prelaunchedSession.questions.length > 0) {
        setVisited({ [prelaunchedSession.questions[0].id]: true });
      }
      localStorage.setItem('quantum_jee_active_session', JSON.stringify(prelaunchedSession));
      if (resetPrelaunchedSession) resetPrelaunchedSession();
    }
  }, [prelaunchedSession, resetPrelaunchedSession]);

  // Safeguards for tab switching (Anti-Cheating mode)
  useEffect(() => {
    if (activeSession && activeSession.status === 'In Progress' && antiCheating) {
      const handleBlur = () => {
        setCheatingWarnings((w) => {
          const nextW = w + 1;
          if (nextW >= 4) {
            alert("PROCTOR SAFEGUARD: AUTO-SUBMIT TRIGGERED!\n\nAnti-Cheating monitors detected more than 3 tab/window changes during this proctored JEE trial. Your answers have been submitted automatically.");
            submitTest();
            return 3;
          }
          alert(`PROCTOR ALERT! (Warning ${nextW}/3)\nYou hovered or switched away from the active CBT pane. Standard NTA units enforce full-screen locks. Navigating away 4 times will auto-submit.`);
          return nextW;
        });
      };
      window.addEventListener('blur', handleBlur);
      return () => {
        window.removeEventListener('blur', handleBlur);
      };
    }
  }, [activeSession, antiCheating]);

  // Simulated PvP Opponent Progress Ticker
  useEffect(() => {
    let pvpInterval: NodeJS.Timeout | null = null;
    if (activeSession && activeSession.status === 'In Progress' && battleOpponent) {
      pvpInterval = setInterval(() => {
        setBattleOpponent((prev) => {
          if (!prev) return null;
          // Slowly increase competitor score over time
          const limit = activeSession.questions.length;
          if (prev.score < limit && Math.random() > 0.7) {
            return { ...prev, score: prev.score + 1 };
          }
          return prev;
        });
      }, 5000);
    }
    return () => {
      if (pvpInterval) clearInterval(pvpInterval);
    };
  }, [activeSession, battleOpponent]);

  // Timer interval
  useEffect(() => {
    if (activeSession && activeSession.status === 'In Progress') {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto submit
            submitTest();
            return 0;
          }
          // Increment duration tracker
          const updatedSession = { ...activeSession };
          const activeQId = updatedSession.questions[currentIndex]?.id;
          if (activeQId) {
            updatedSession.timeSpentPerQuestion[activeQId] = (updatedSession.timeSpentPerQuestion[activeQId] || 0) + 1;
          }
          updatedSession.timeLimit = prev - 1;
          localStorage.setItem('quantum_jee_active_session', JSON.stringify(updatedSession));
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, currentIndex]);

  // Auto-save session helper
  const saveSessionState = (session: TestSession) => {
    localStorage.setItem('quantum_jee_active_session', JSON.stringify(session));
    setActiveSession(session);
  };

  // Chapter toggler helper
  const toggleChapter = (chap: string) => {
    setSelectedChapters((prev) => 
      prev.includes(chap) ? prev.filter((c) => c !== chap) : [...prev, chap]
    );
  };

  // Select all chapters helper
  const selectAllChapters = () => {
    const all = JEE_CHAPTERS[selectedSubject];
    if (selectedChapters.length === all.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters([...all]);
    }
  };

  // AI custom test request via Express
  const [generatingAI, setGeneratingAI] = useState(false);

  const startTest = async (isAIQuiz = false) => {
    setMarkedForReview({});
    setVisited({});
    setCurrentIndex(0);

    let testName = '';
    let questionsPoolToUse: Question[] = [];

    if (isAIQuiz) {
      setGeneratingAI(true);
      try {
        const chap = selectedChapters[0] || JEE_CHAPTERS[selectedSubject][0];
        const res = await fetch('/api/ai/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: selectedSubject,
            chapter: chap,
            difficulty: selectedDifficulty === 'All' ? 'Medium' : selectedDifficulty,
            questionType: selectedType === 'All' ? 'Single Choice' : selectedType
          })
        });
        const data = await res.json();
        if (data.success && data.question) {
          questionsPoolToUse = [data.question];
          testName = `AI Smart Quiz: ${chap}`;
        } else {
          throw new Error('Fallback to local database');
        }
      } catch (e) {
        console.warn('AI Generation failed, falling back to local database seed', e);
        // Fallback to offline databases
        questionsPoolToUse = PYQ_DATABASE.filter((q) => q.subject === selectedSubject);
        testName = `Smart Quiz: ${selectedSubject}`;
      } finally {
        setGeneratingAI(false);
      }
    } else {
      // Build offline test pool
      questionsPoolToUse = PYQ_DATABASE.filter((q) => {
        if (q.subject !== selectedSubject) return false;
        if (selectedChapters.length > 0 && !selectedChapters.includes(q.chapter)) return false;
        if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
        if (selectedType !== 'All' && q.questionType !== selectedType) return false;
        return true;
      });

      // Simple fallback if parameters are too restrictive
      if (questionsPoolToUse.length === 0) {
        questionsPoolToUse = PYQ_DATABASE.filter((q) => q.subject === selectedSubject);
      }

      // Limit array length
      questionsPoolToUse = questionsPoolToUse.slice(0, numQuestions);
      testName = `${testType} Practice - ${selectedSubject}`;
    }

    if (questionsPoolToUse.length === 0) {
      alert('Selected pool has 0 items. Seeding from primary database.');
      questionsPoolToUse = PYQ_DATABASE.slice(0, 3);
    }

    const session: TestSession = {
      id: `session-${Date.now()}`,
      name: testName,
      type: testType,
      subject: selectedSubject,
      chapters: selectedChapters,
      duration: timeLimit,
      timeLimit: timeLimit * 60,
      questions: questionsPoolToUse,
      status: 'In Progress',
      startedAt: new Date().toISOString(),
      answers: {},
      timeSpentPerQuestion: {},
    };

    setSecondsLeft(session.timeLimit);
    setVisited({ [questionsPoolToUse[0].id]: true });
    saveSessionState(session);
  };

  // Custom Answers managers
  const handleAnswerChange = (qId: string, value: any) => {
    if (!activeSession) return;
    const updatedAnswers = { ...activeSession.answers, [qId]: value };
    const updated = { ...activeSession, answers: updatedAnswers };
    saveSessionState(updated);
  };

  const handleMultipleAnswerToggle = (qId: string, optionLetter: string) => {
    if (!activeSession) return;
    const currentList: string[] = activeSession.answers[qId] || [];
    const newList = currentList.includes(optionLetter)
      ? currentList.filter((x) => x !== optionLetter)
      : [...currentList, optionLetter].sort();
    handleAnswerChange(qId, newList);
  };

  const nextQuestion = () => {
    if (!activeSession) return;
    const nextIdx = Math.min(currentIndex + 1, activeSession.questions.length - 1);
    setCurrentIndex(nextIdx);
    const nextQId = activeSession.questions[nextIdx].id;
    setVisited((v) => ({ ...v, [nextQId]: true }));
  };

  const prevQuestion = () => {
    if (!activeSession) return;
    const prevIdx = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prevIdx);
  };

  const toggleMarkForReview = (qId: string) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Evaluate marks based on custom marking setups (+4, -1, partial, etc.)
  const submitTest = () => {
    if (!activeSession) return;
    if (timerRef.current) clearInterval(timerRef.current);

    let score = 0;
    let correctCount = 0;
    const totalQuestions = activeSession.questions.length;

    activeSession.questions.forEach((q) => {
      const ans = activeSession.answers[q.id];
      if (ans === undefined || ans === null) {
        return; // Left unanswered
      }

      const isSingleCorrectFormat = q.questionType === 'Single Choice' || q.questionType === 'Assertion-Reason' || q.questionType === 'Match the Following';

      if (isSingleCorrectFormat) {
        if (ans === q.correctAnswer) {
          score += markingPositive;
          correctCount++;
        } else {
          score += markingNegative; // custom negative marking
        }
      } else if (q.questionType === 'Multiple Choice') {
        const correctLetters: string[] = Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer)];
        const userLetters: string[] = Array.isArray(ans) ? ans : [String(ans)];
        
        // Exact matching
        const match = correctLetters.length === userLetters.length && 
                      correctLetters.every((l) => userLetters.includes(l));
        if (match) {
          score += markingPositive;
          correctCount++;
        } else {
          // Check for partial correct
          const containsIncorrect = userLetters.some(l => !correctLetters.includes(l));
          if (partialMarking && !containsIncorrect && userLetters.length > 0) {
            // +1 for each option chosen
            score += userLetters.length;
            // Count partial as fractional correct representation for status bar
            correctCount += (userLetters.length / correctLetters.length);
          } else {
            score += markingNegative;
          }
        }
      } else if (q.questionType === 'Numerical') {
        const correctNum = parseFloat(String(q.correctAnswer));
        const userNum = parseFloat(String(ans));
        if (correctNum === userNum) {
          score += markingPositive;
          correctCount++;
        } else {
          // Numerical usually has no negative marks in official JEE Main rules
          score -= 0;
        }
      }
    });

    const completionTimeSpent = activeSession.timeLimit - secondsLeft;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    // Percentile prediction formula based on correct rates and streaks
    const predictedPercentile = Math.min(99.9, Math.max(82.0, 80 + (accuracy * 0.18) + (dailyStreak * 0.1)));

    // Gamification rewards calculations
    const earnedXp = Math.max(50, Math.round(correctCount * 100 + score * 40 + (isBossMatch ? 200 : 0)));
    const newXp = xpPoints + earnedXp;
    setXpPoints(newXp);
    localStorage.setItem('nexrank_xp', String(newXp));

    // Handle badge upgrades
    const newBadges = [...badges];
    if (accuracy === 100 && !newBadges.includes('Flawless Victor')) {
      newBadges.push('Flawless Victor');
    }
    const avgSpeed = totalQuestions > 0 ? completionTimeSpent / totalQuestions : 999;
    if (avgSpeed < 20 && !newBadges.includes('Speed Demon') && totalQuestions >= 3) {
      newBadges.push('Speed Demon');
    }
    if (score >= 12 && !newBadges.includes('JEE Advanced Master')) {
      newBadges.push('JEE Advanced Master');
    }
    if (cheatingWarnings === 0 && !newBadges.includes('Honorable Scholar')) {
      newBadges.push('Honorable Scholar');
    }
    setBadges(newBadges);
    localStorage.setItem('nexrank_badges', JSON.stringify(newBadges));

    // Adjust Streaks
    let nextStreak = dailyStreak;
    if (!completedToday) {
      nextStreak = dailyStreak + 1;
      setDailyStreak(nextStreak);
      localStorage.setItem('nexrank_streak', String(nextStreak));
      setCompletedToday(true);
    }

    const completedSession: TestSession = {
      ...activeSession,
      status: 'Completed',
      completedAt: new Date().toISOString(),
      score,
      accuracy,
      duration: Math.round(completionTimeSpent / 60),
      predictedPercentile
    };

    // If multiplayer battle active, freeze and announce result
    if (battleOpponent) {
      const isWon = score >= battleOpponent.score;
      setTimeout(() => {
        alert(isWon 
          ? `VICTORY! You scored ${score} marks, defeating ${battleOpponent.name} (${battleOpponent.score} marks)! +250 Duel XP awarded!` 
          : `DEFEAT! ${battleOpponent.name} scored ${battleOpponent.score} marks, outperforming your ${score} marks. Keep practicing!`
        );
      }, 1000);
    }

    // Push details to dashboard memory automatically
    onTestCompleted(completedSession);
    setActiveSession(completedSession);

    // Save mistaked questions to Mistake Book inside localStorage automatically
    saveMistakesToLocalStorage(completedSession);

    // Clear saved active ongoing session
    localStorage.removeItem('quantum_jee_active_session');
  };

  const saveMistakesToLocalStorage = (session: TestSession) => {
    try {
      const existingStr = localStorage.getItem('quantum_jee_mistake_book') || '[]';
      const existing = JSON.parse(existingStr);
      
      const newMistakes = session.questions.filter((q) => {
        const ans = session.answers[q.id];
        if (ans === undefined || ans === null) return false; // skipped questions aren't mistakes

        if (q.questionType === 'Single Choice') return ans !== q.correctAnswer;
        if (q.questionType === 'Numerical') return parseFloat(String(ans)) !== parseFloat(String(q.correctAnswer));
        if (q.questionType === 'Multiple Choice') {
          const correctLetters = Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer)];
          const userLetters = Array.isArray(ans) ? ans : [String(ans)];
          return !(correctLetters.length === userLetters.length && correctLetters.every((l) => userLetters.includes(l)));
        }
        return false;
      });

      const itemsToAdd = newMistakes.map((q) => ({
        question: q,
        userAnswer: session.answers[q.id],
        timestamp: new Date().toISOString(),
        resolved: false
      }));

      // Avoid duplicates
      const filteredExisting = existing.filter((item: any) => !itemsToAdd.some((newItem) => newItem.question.id === item.question.id));
      localStorage.setItem('quantum_jee_mistake_book', JSON.stringify([...filteredExisting, ...itemsToAdd]));
    } catch (e) {
      console.error('Failed to log mistakes', e);
    }
  };

  // Bookmark Toggle
  const toggleBookmark = (qId: string) => {
    const updated = { ...bookmarkedIds, [qId]: !bookmarkedIds[qId] };
    setBookmarkedIds(updated);
    localStorage.setItem('quantum_jee_bookmarks', JSON.stringify(updated));
  };

  // AI tutor explain mistake trigger
  const triggerAIExplanation = async (q: Question, userAnswer: any) => {
    setExplainingId(q.id);
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.text,
          solution: q.solution,
          userAnswer,
          correctAnswer: q.correctAnswer
        })
      });
      const data = await response.json();
      if (data.success && data.explanation) {
        setAiExplanations((prev) => ({ ...prev, [q.id]: data.explanation }));
      }
    } catch (e) {
      console.error(e);
      setAiExplanations((prev) => ({ ...prev, [q.id]: 'Failed to reach AI Tutor. Please connect your actual API key inside settings panel to enable interactive explanations.' }));
    } finally {
      setExplainingId(null);
    }
  };

  const getQuestionStatusColor = (q: Question, index: number) => {
    const qId = q.id;
    const answered = activeSession?.answers[qId] !== undefined && activeSession?.answers[qId] !== '';
    const marked = markedForReview[qId];
    const isVisited = visited[qId];

    if (index === currentIndex) return 'ring-2 ring-cyan-400 bg-slate-800 text-cyan-400 font-bold';
    if (marked && answered) return 'bg-purple-800 border-purple-500 text-white'; // Answered & Marked
    if (marked) return 'bg-purple-500/20 text-purple-300 border-purple-500/40'; // Marked un-answered
    if (answered) return 'bg-green-600 border-green-500 text-slate-100'; // Answered
    if (isVisited) return 'bg-rose-500/10 text-rose-300 border-rose-500/30'; // Visited but un-answered
    return 'bg-slate-800/40 text-slate-400 border-slate-700/60'; // Not visited
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. TEST SETUP SCREEN */}
      {!activeSession && (
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 font-sans">
                <Layers className="w-5.5 h-5.5 text-blue-650 text-blue-600" />
                ✍️ IIT-JEE Topic Wise Exam Center 📚
              </h2>
              <p className="text-xs text-slate-550 mt-1 leading-relaxed">
                Set up your exam practice! All questions below are 100% authentic IIT-JEE Previous Year Questions (PYQs) with clean symbols and simplified English summaries! 💯
              </p>
            </div>
            {weakChapters.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-yellow-400/10 text-yellow-500 text-[11px] px-2.5 py-1.5 rounded-lg border border-yellow-400/20">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>AI recommendation: Practice more {weakChapters[0]}!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Setting options */}
            <div className="md:col-span-2 space-y-5">
              {/* Type Category Selection */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2 font-black tracking-wider">👉 CHOOSE EXAM MODE 📝</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Custom', 'Chapter', 'Subject', 'Full Main', 'Full Advanced', 'PYP'] as TestType[]).map((t) => (
                    <button
                      key={t}
                      id={`test-setup-type-${t}`}
                      onClick={() => setTestType(t)}
                      className={`text-xs font-bold py-2.5 px-3 rounded-xl border transition-all text-center cursor-pointer ${
                        testType === t
                          ? 'bg-blue-600 border-blue-605 text-white shadow-md shadow-blue-500/10'
                          : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {t === 'Custom' && '⚙️ Custom quiz'}
                      {t === 'Chapter' && '📚 Topic-Wise Exam'}
                      {t === 'Subject' && '🔬 Subject Exam'}
                      {t === 'Full Main' && '🎯 JEE Main Full'}
                      {t === 'Full Advanced' && '🔥 JEE Advanced Full'}
                      {t === 'PYP' && '📑 Official PYP sets'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2 font-black tracking-wider">🔬 CHOOSE YOUR SUBJECT</span>
                <div className="flex gap-2">
                  {(['Physics', 'Chemistry', 'Mathematics'] as SubjectType[]).map((s) => (
                    <button
                      key={s}
                      id={`test-setup-subject-${s}`}
                      onClick={() => {
                        setSelectedSubject(s);
                        setSelectedChapters([]);
                      }}
                      className={`flex-1 text-xs font-black py-2.5 px-4 rounded-xl border transition-all text-center cursor-pointer ${
                        selectedSubject === s
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 font-extrabold shadow-md'
                          : 'bg-slate-50 border-slate-205 text-slate-650 hover:bg-slate-100/60 hover:text-slate-950'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Chapters Picker */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-black tracking-wider">📚 SELECT YOUR FAVORITE JEE TOPICS</span>
                  <button onClick={selectAllChapters} className="text-[10px] text-blue-600 font-mono hover:underline focus:outline-none cursor-pointer">
                    {selectedChapters.length === JEE_CHAPTERS[selectedSubject].length ? '❌ Deselect All' : '✅ Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {JEE_CHAPTERS[selectedSubject].map((c) => (
                    <button
                      key={c}
                      id={`test-setup-chapter-${c.replace(/\s+/g, '-')}`}
                      onClick={() => toggleChapter(c)}
                      className={`text-left text-xs p-2.5 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${
                        selectedChapters.includes(c)
                          ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                          : 'bg-white border-slate-200 text-[#475569] hover:bg-slate-50'
                      }`}
                    >
                      <span>{c}</span>
                      {selectedChapters.includes(c) && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 flex flex-col justify-between space-y-4 shadow-inner">
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase text-blue-600 font-bold block tracking-wider">⚙️ EXAM SETTINGS</span>
                
                {/* Difficulty */}
                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">📈 DIFFICULTY LEVEL</label>
                  <select
                    id="test-setup-difficulty"
                    value={selectedDifficulty}
                    onChange={(e: any) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 outline-none focus:border-blue-650 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="All">All Difficulty Mixed</option>
                    <option value="Easy">JEE Main standard (Easy)</option>
                    <option value="Medium">JEE Main rigorous (Medium)</option>
                    <option value="Hard">JEE Advanced standard (Hard)</option>
                  </select>
                </div>

                {/* Question Type */}
                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">🧠 PROBLEM STYLE</label>
                  <select
                    id="test-setup-pattern"
                    value={selectedType}
                    onChange={(e: any) => setSelectedType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 outline-none focus:border-blue-650 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="All">All Formats Mixed</option>
                    <option value="Single Choice">Single Option MCQs (+4, -1)</option>
                    <option value="Multiple Choice">Multi-Correct MCQs (+4, 0)</option>
                    <option value="Numerical">Numerical subjective Type (+4, 0)</option>
                  </select>
                </div>

                {/* Length & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">📝 MCQS COUNT</label>
                    <input
                      id="test-setup-num-questions"
                      type="number"
                      min="1"
                      max="30"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-200 rounded-xl py-1.5 text-center text-xs text-slate-800 outline-none focus:border-blue-600 transition-all shadow-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">⏱️ LIMIT (MINS)</label>
                    <input
                      id="test-setup-time-limit"
                      type="number"
                      min="1"
                      max="180"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-200 rounded-xl py-1.5 text-center text-xs text-slate-800 outline-none focus:border-blue-600 transition-all shadow-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Launcher buttons */}
              <div className="space-y-2 pt-2">
                <button
                  id="test-launcher-submit-btn"
                  onClick={() => startTest(false)}
                  disabled={generatingAI}
                  className="w-full bg-blue-600 hover:bg-blue-750 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-blue-500/20 transition-all font-sans"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  🚀 START MY TEST!
                </button>

                <button
                  id="test-ai-launcher-btn"
                  onClick={() => startTest(true)}
                  disabled={generatingAI}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:shadow-emerald-500/20"
                >
                  {generatingAI ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                  {generatingAI ? '🧠 GENERATING PROBLEMS...' : '🤖 AI MENTOR CHALLENGE GAME'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE TEST INTERACTIVE ENVIRONMENT */}
      {activeSession && activeSession.status === 'In Progress' && (
        <div id="active-test-container" className="space-y-4 animate-fade-in w-full text-slate-800">
          
          {/* Layout & Mode Switcher Console bar */}
          <div className="bg-white border border-slate-200 rounded-[24px] p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wide">CBT SHEETS LAYOUT:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-205">
                <button
                  id="layout-sleek-btn"
                  onClick={() => setLayoutMode('sleek')}
                  className={`text-[10.5px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    layoutMode === 'sleek'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Sleek Bento
                </button>
                <button
                  id="layout-nta-btn"
                  onClick={() => {
                    setLayoutMode('nta-simulator');
                    // auto trigger visited for candidate view
                    setVisited((v) => ({ ...v, [activeSession.questions[currentIndex].id]: true }));
                  }}
                  className={`text-[10.5px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    layoutMode === 'nta-simulator'
                      ? 'bg-amber-500 text-white font-extrabold shadow-sm'
                      : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  Official NTA CBT
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {antiCheating && (
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-red-650 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>Cheat Guards: {cheatingWarnings}/3 Flags</span>
                </div>
              )}
              {webcamProctored && (
                <span className="flex items-center gap-1 text-[9.5px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg animate-pulse uppercase font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  PROCTOR LOCK ON
                </span>
              )}
            </div>
          </div>

          {/* 2A. SLEEK BENTO GRID LAYOUT */}
          {layoutMode === 'sleek' ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column: Question Arena */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="bg-white border border-slate-250 rounded-[24px] p-6 shadow-xl shadow-slate-250/20 space-y-4 flex-1 text-slate-850">
                  
                  {/* Subject and Meta details */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono py-1 px-2.5 bg-slate-100 text-slate-600 rounded border border-slate-200 font-bold uppercase">
                        Q. {currentIndex + 1} OF {activeSession.questions.length}
                      </span>
                      <span className="text-[10px] font-mono py-1 px-2.5 bg-amber-500/10 text-amber-650 rounded border border-amber-550/20 uppercase font-bold">
                        {activeSession.questions[currentIndex].questionType}
                      </span>
                      <span className="text-[10px] font-mono py-1 px-2.5 bg-blue-500/10 text-blue-650 rounded border border-blue-500/20 uppercase font-bold">
                        {activeSession.questions[currentIndex].difficulty}
                      </span>
                      <span className="text-[10px] font-mono py-1 px-2.5 bg-emerald-500/10 text-emerald-600 rounded border border-emerald-500/20 uppercase font-bold flex items-center gap-1.5 animate-pulse">
                        🎯 AUTHENTIC JEE PYQ ({activeSession.questions[currentIndex].year || 2024})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600 font-mono text-sm bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-inner">
                      <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                      <span className="font-bold">{formatTimer(secondsLeft)}</span>
                    </div>
                  </div>

                  {/* Question Content Display */}
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                      {activeSession.questions[currentIndex].text}
                    </p>

                    {/* Standard Single Choice */}
                    {activeSession.questions[currentIndex].questionType === 'Single Choice' && (
                      <div className="space-y-2 pt-2">
                        {activeSession.questions[currentIndex].options?.map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const isSelected = activeSession.answers[activeSession.questions[currentIndex].id] === letter;
                          return (
                            <button
                              key={letter}
                              onClick={() => handleAnswerChange(activeSession.questions[currentIndex].id, letter)}
                              className={`w-full text-left text-xs p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-sm'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-black font-mono text-xs ${
                                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {letter}
                                </span>
                                <span className="font-sans font-medium">{opt}</span>
                              </div>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-scale-up" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Assertion-Reason Layout */}
                    {activeSession.questions[currentIndex].questionType === 'Assertion-Reason' && (
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col gap-2.5">
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                            <span className="text-[10px] font-mono text-blue-650 font-bold block uppercase mb-1">Assertion (A)</span>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                              {activeSession.questions[currentIndex].text.split('Assertion (A):')[1]?.split('Reason (R):')[0]?.trim() || activeSession.questions[currentIndex].text.split('\n')[0] || activeSession.questions[currentIndex].text}
                            </p>
                          </div>
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                            <span className="text-[10px] font-mono text-orange-600 font-bold block uppercase mb-1">Reason (R)</span>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                              {activeSession.questions[currentIndex].text.split('Reason (R):')[1]?.trim() || activeSession.questions[currentIndex].text.split('\n')[1] || "The explanation correlates with the physics system parameters defined."}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] text-slate-500 font-mono block uppercase font-bold tracking-wider">CHOOSE REASON MAPPING:</span>
                          {activeSession.questions[currentIndex].options?.map((opt, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isSelected = activeSession.answers[activeSession.questions[currentIndex].id] === letter;
                            return (
                              <button
                                key={letter}
                                onClick={() => handleAnswerChange(activeSession.questions[currentIndex].id, letter)}
                                className={`w-full text-left text-xs p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-sm'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-md flex items-center justify-center font-black font-mono text-xs ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {letter}
                                  </span>
                                  <span className="font-sans font-medium">{opt}</span>
                                </div>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-650 animate-scale-up" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Match the Following Layout */}
                    {activeSession.questions[currentIndex].questionType === 'Match the Following' && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-205 shadow-inner">
                            <span className="text-[10px] font-mono font-bold text-blue-650 mb-2 block uppercase tracking-wider">LIST I (Statements)</span>
                            <ul className="space-y-2">
                              {activeSession.questions[currentIndex].listA?.map((item, id) => (
                                <li key={id} className="text-xs text-slate-700 font-sans flex items-start gap-2 bg-white border border-slate-200 p-2 rounded-lg">
                                  <span className="text-[10px] py-0.5 px-2 bg-slate-100 rounded font-mono text-blue-600 font-bold shrink-0">{item.substring(0, 2)}</span>
                                  <span className="leading-tight font-medium">{item.substring(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-205 shadow-inner">
                            <span className="text-[10px] font-mono font-bold text-orange-600 mb-2 block uppercase tracking-wider">LIST II (Identifiers)</span>
                            <ul className="space-y-2">
                              {activeSession.questions[currentIndex].listB?.map((item, id) => (
                                <li key={id} className="text-xs text-slate-700 font-sans flex items-start gap-2 bg-white border border-slate-200 p-2 rounded-lg">
                                  <span className="text-[10px] py-0.5 px-2 bg-slate-100 rounded font-mono text-orange-600 font-bold shrink-0">{item.substring(0, 2)}</span>
                                  <span className="leading-tight font-medium">{item.substring(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] text-slate-500 font-mono block uppercase font-bold tracking-wide">CHOOSE MATCHING COMBINATION CODE:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeSession.questions[currentIndex].options?.map((opt, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isSelected = activeSession.answers[activeSession.questions[currentIndex].id] === letter;
                              return (
                                <button
                                  key={letter}
                                  onClick={() => handleAnswerChange(activeSession.questions[currentIndex].id, letter)}
                                  className={`text-left text-xs p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                                      : 'bg-slate-50 border-slate-150 text-slate-700 hover:bg-slate-100/60'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`w-5.5 h-5.5 rounded-md flex items-center justify-center font-black font-mono text-xs ${
                                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                      {letter}
                                    </span>
                                    <span className="font-mono text-xs text-blue-800 font-bold">{opt}</span>
                                  </div>
                                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-scale-up" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Standard Multiple Correct */}
                    {activeSession.questions[currentIndex].questionType === 'Multiple Choice' && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] text-yellow-605 font-mono flex items-center gap-1 font-bold">
                          <Sparkles className="w-3.5 h-3.5" /> MULTI-CORRECT MOCK RULES APPLIED (+{markingPositive} Positive, {partialMarking ? 'Partial Marks supported' : 'No Partial marking'})
                        </span>
                        {activeSession.questions[currentIndex].options?.map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const currentSelected: string[] = activeSession.answers[activeSession.questions[currentIndex].id] || [];
                          const isSelected = currentSelected.includes(letter);
                          return (
                            <button
                              key={letter}
                              onClick={() => handleMultipleAnswerToggle(activeSession.questions[currentIndex].id, letter)}
                              className={`w-full text-left text-xs p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-black font-mono text-xs ${
                                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {letter}
                                </span>
                                <span className="font-sans font-medium">{opt}</span>
                              </div>
                              <input type="checkbox" checked={isSelected} readOnly className="rounded accent-blue-650 border-slate-300 cursor-pointer pointer-events-none" />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Standard Objective Numerical */}
                    {activeSession.questions[currentIndex].questionType === 'Numerical' && (
                      <div className="space-y-3 pt-3 bg-slate-55 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="text-[10.5px] font-mono text-slate-550 block font-black uppercase tracking-wide">
                          SUBMIT CHOSEN SHIFT RESPONSE:
                        </label>
                        <input
                          id="nta-numerical-modern"
                          type="number"
                          step="any"
                          placeholder="e.g. 5 or -12 or 1.25"
                          value={activeSession.answers[activeSession.questions[currentIndex].id] || ''}
                          onChange={(e) => handleAnswerChange(activeSession.questions[currentIndex].id, e.target.value)}
                          className="w-full max-w-sm bg-white border border-slate-250 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          Note: Please input the numerical value according to standard integer conventions. Double-check decimal coordinates before saving.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Modern Option buttons bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 mt-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevQuestion}
                        disabled={currentIndex === 0}
                        className="p-2.5 border border-slate-200 bg-white rounded-lg text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleMarkForReview(activeSession.questions[currentIndex].id)}
                        className={`text-xs px-4 py-2 rounded-lg border font-mono transition-colors cursor-pointer font-bold ${
                          markedForReview[activeSession.questions[currentIndex].id]
                            ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-55 hover:bg-slate-50'
                        }`}
                      >
                        {markedForReview[activeSession.questions[currentIndex].id] ? '√ MARKED FOR REVIEW' : 'MARK FOR REVIEW'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const qId = activeSession.questions[currentIndex].id;
                          handleAnswerChange(qId, undefined);
                        }}
                        className="text-xs px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer font-medium"
                      >
                        CLEAR RESPONSE
                      </button>

                      <button
                        onClick={() => setShowScratchpad(!showScratchpad)}
                        className={`text-xs py-2 px-3.5 rounded-lg border flex items-center gap-1.5 font-mono cursor-pointer ${
                          showScratchpad ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        SCRATCHPAD
                      </button>

                      {currentIndex < activeSession.questions.length - 1 ? (
                        <button
                          onClick={nextQuestion}
                          className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                        >
                          SAVE & NEXT
                          <ArrowRight className="w-4 h-4 text-white stroke-[2.5px]" />
                        </button>
                      ) : (
                        <button
                          onClick={submitTest}
                          className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all font-sans uppercase animate-pulse"
                        >
                          SUBMIT EXAM BLOCK
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Constant calculator sheet drawers */}
                {showScratchpad && (
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <Scratchpad />
                  </div>
                )}

                <div className="bg-white border border-slate-250 rounded-[20px] p-4 shadow-sm text-slate-800">
                  <button
                    onClick={() => setShowConstants(!showConstants)}
                    className="text-xs font-mono text-blue-650 flex items-center gap-2 hover:underline focus:outline-none cursor-pointer font-bold"
                  >
                    <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
                    {showConstants ? 'HIDE FORMULAS & CONSTANTS CHART' : 'SHOW FORMULAS & CONSTANTS CHART'}
                  </button>
                  {showConstants && (
                    <div className="mt-3.5 animate-scale-up">
                      <Calculators />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Mini-Dashboard & Palette Controls */}
              <div className="space-y-4">
                {/* Simulated Webcam active container */}
                {webcamProctored && (
                  <div className="bg-white border border-slate-200 rounded-[20px] p-3 shadow-md space-y-2 text-slate-800">
                    <span className="text-[9px] font-mono text-amber-655 text-amber-600 block uppercase font-bold tracking-wider">LIVE PROCTOR FEED</span>
                    <ProctorWebcam />
                  </div>
                )}

                {/* Competitor widget in PvP Lobby mode */}
                {battleOpponent && (
                  <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-xl space-y-3 relative overflow-hidden bg-gradient-to-br from-slate-50 to-white text-slate-800">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{battleOpponent.avatar}</span>
                        <div>
                          <span className="text-xs font-black text-slate-800 block">{battleOpponent.name}</span>
                          <span className="text-[9.5px] font-mono text-slate-550">Competitive Rating: {battleOpponent.rating} SP</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full animate-pulse uppercase select-none font-bold">DUEL</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Your Progress:</span>
                      <span className="font-mono font-bold text-blue-600">{Object.keys(activeSession.answers).length} / {activeSession.questions.length} Solved</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-550">Rahul's Progress:</span>
                      <span className="font-mono font-bold text-amber-600">{battleOpponent.score} / {activeSession.questions.length} Solved</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(Object.keys(activeSession.answers).length / activeSession.questions.length) * 100}%` }} />
                      <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(battleOpponent.score / activeSession.questions.length) * 100}%` }} />
                    </div>
                  </div>
                )}

                {/* Standard Practice Statistics Card */}
                <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-xl space-y-4 text-slate-800">
                  <div className="border-b border-slate-205 pb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold tracking-wider block">MOCK EXAM NAVIGATION</span>
                    <span className="text-xs font-bold text-slate-800 mt-1 block leading-tight">{activeSession.name}</span>
                  </div>

                  {/* Numbers List */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {activeSession.questions.map((q, idx) => (
                      <button
                        key={q.id}
                        id={`palette-key-${idx}`}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setVisited((v) => ({ ...v, [q.id]: true }));
                        }}
                        className={`w-9 h-9 text-xs rounded-lg flex items-center justify-center font-bold border transition-all cursor-pointer ${getQuestionStatusColor(q, idx)}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Legend guide */}
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    <span className="text-[9px] font-mono text-slate-500 block mb-1">CBT COLORS LEGEND:</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-3.5 h-3.5 rounded bg-green-600 border border-green-500" />
                        <span>Answered</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-3.5 h-3.5 rounded bg-purple-800 border border-purple-500" />
                        <span>Marked & Ans</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-605">
                        <span className="w-3.5 h-3.5 rounded bg-purple-500/20 border border-purple-500/40" />
                        <span>Marked</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-605">
                        <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }} />
                        <span>Not Answered</span>
                      </div>
                    </div>
                  </div>

                  {/* Suspend Test action button */}
                  <button
                    onClick={() => {
                      localStorage.setItem('quantum_jee_active_session', JSON.stringify(activeSession));
                      setActiveSession(null);
                      if (timerRef.current) clearInterval(timerRef.current);
                    }}
                    className="w-full text-center text-[10px] font-mono text-amber-600 hover:underline border border-amber-200 bg-amber-500/5 py-2.5 rounded-lg cursor-pointer transition-colors font-bold"
                  >
                    PAUSE & SAVE PRACTICE STATE
                  </button>
                </div>
              </div>
            </div>
          ) : (
            
            // 2B. AUTHENTIC OFFICIAL NTA CBT SIMULATOR LAYOUT (Exact Jee Main Screen)
            <div className="bg-[#f4f7f9] text-slate-800 p-4 rounded-xl border border-slate-300 shadow-2xl flex flex-col font-sans select-none min-h-[560px]">
              
              {/* NTA Top candidate header banner bar */}
              <div className="bg-[#e4ebf2] border-b border-slate-300 p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold rounded-t-lg">
                <div className="flex items-center gap-2">
                  <span className="text-blue-900 font-black tracking-wide font-sans text-sm uppercase">NTA EXAM SERVICES</span>
                  <span className="text-[10px] bg-slate-400/20 text-slate-600 px-2 py-0.5 rounded font-mono">JEE CBT UNIT v8.5</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-705">
                  <div className="font-mono">PAPER ID: <span className="text-slate-900 font-bold">JEE-M_SHIFT-01_2026</span></div>
                  <div>Subject Exam: <span className="text-blue-700 font-extrabold uppercase">{activeSession.subject || 'IIT-JEE Paper'}</span></div>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white font-mono rounded font-black border border-red-700 shadow-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>TIME LEFT: {formatTimer(secondsLeft)}</span>
                </div>
              </div>

              {/* Subject Tabs CBT Bar */}
              <div className="bg-slate-100 border-b border-slate-300 flex text-xs">
                {(['Physics', 'Chemistry', 'Mathematics'] as SubjectType[]).map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setActiveNtaSubject(subj)}
                    className={`py-2.5 px-6 font-bold uppercase transition-all border-r border-slate-300 tracking-wide cursor-pointer ${
                      activeNtaSubject === subj
                        ? 'bg-blue-800 text-white font-black border-b-4 border-b-amber-500'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              {/* Split layout: Question on left, Palette on right */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-3 flex-1 items-stretch">
                
                {/* Left Panel: actual interactive question sheet */}
                <div className="lg:col-span-3 bg-white p-4.5 rounded border border-slate-300 flex flex-col justify-between shadow-sm min-h-[420px]">
                  <div>
                    {/* Header line */}
                    <div className="flex justify-between items-center border-b border-dashed border-slate-300 pb-1.5 mb-3 text-[11px] text-slate-500 font-mono">
                      <span>Section: <span className="text-blue-900 font-bold">{activeNtaSubject} Section A (MCQs)</span></span>
                      <span>Question Type: <span className="text-slate-700 font-bold">{activeSession.questions[currentIndex].questionType}</span></span>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">🎯 AUTHENTIC JEE PYQ ({activeSession.questions[currentIndex].year || 2024})</span>
                    </div>

                    {/* Question text block */}
                    <div className="space-y-4">
                      <div className="flex gap-2 text-sm font-semibold text-slate-900 leading-relaxed font-sans">
                        <span className="font-bold font-mono">Question No. {currentIndex + 1}:</span>
                        <p className="whitespace-pre-wrap text-slate-800">{activeSession.questions[currentIndex].text}</p>
                      </div>

                      {/* Display Column lists for Match the Following */}
                      {activeSession.questions[currentIndex].questionType === 'Match the Following' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded mb-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">List I</span>
                            <ul className="space-y-1 text-xs">
                              {activeSession.questions[currentIndex].listA?.map((it, idx) => (
                                <li key={idx} className="bg-white px-2 py-1.5 rounded border border-slate-200 font-sans">{it}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">List II</span>
                            <ul className="space-y-1 text-xs">
                              {activeSession.questions[currentIndex].listB?.map((it, idx) => (
                                <li key={idx} className="bg-white px-2 py-1.5 rounded border border-slate-200 font-sans">{it}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Render Options list */}
                      {activeSession.questions[currentIndex].questionType !== 'Numerical' ? (
                        <div className="space-y-2 pl-6 pt-2 select-none">
                          {activeSession.questions[currentIndex].options?.map((opt, optValIdx) => {
                            const optLetter = String.fromCharCode(65 + optValIdx);
                            const currentAns = activeSession.answers[activeSession.questions[currentIndex].id];
                            
                            // handles both arrays (multi correction) & strings (single correction)
                            const isSelected = Array.isArray(currentAns)
                              ? currentAns.includes(optLetter)
                              : currentAns === optLetter;

                            return (
                              <label
                                key={optLetter}
                                className="flex items-center gap-3.5 p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-250 hover:border-slate-350 cursor-pointer text-xs font-medium text-slate-800 transition-colors"
                              >
                                <input
                                  type={activeSession.questions[currentIndex].questionType === 'Multiple Choice' ? 'checkbox' : 'radio'}
                                  name={`nta-radio-${currentIndex}`}
                                  checked={isSelected}
                                  onChange={() => {
                                    if (activeSession.questions[currentIndex].questionType === 'Multiple Choice') {
                                      handleMultipleAnswerToggle(activeSession.questions[currentIndex].id, optLetter);
                                    } else {
                                      handleAnswerChange(activeSession.questions[currentIndex].id, optLetter);
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-500 hover:scale-105 cursor-pointer accent-blue-800"
                                />
                                <span className="font-mono bg-slate-200 border border-slate-305 rounded px-1.5 py-0.2 font-black">({optValIdx + 1})</span>
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        // Numerical type input
                        <div className="pl-6 pt-2 space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 font-mono block">ENTER NUMERICAL ANSWER DECIMALS:</span>
                          <input
                            id="nta-numerical-cbt"
                            type="number"
                            step="any"
                            placeholder="e.g. 1.25"
                            value={activeSession.answers[activeSession.questions[currentIndex].id] || ''}
                            onChange={(e) => handleAnswerChange(activeSession.questions[currentIndex].id, e.target.value)}
                            className="bg-white border border-slate-400 rounded p-2 text-sm font-mono w-64 text-slate-900 outline-none focus:border-blue-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom CBT NTA buttons panel */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200 mt-6 text-xs select-none">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => {
                          const qId = activeSession.questions[currentIndex].id;
                          setMarkedForReview((prev) => ({ ...prev, [qId]: true }));
                          // move next if not last
                          if (currentIndex < activeSession.questions.length - 1) {
                            nextQuestion();
                          }
                        }}
                        className="py-2.5 px-3 bg-[#e87722] hover:bg-orange-600 text-white font-bold rounded-sm border border-orange-700 shadow-xs cursor-pointer tracking-tight"
                      >
                        MARK FOR REVIEW & NEXT
                      </button>

                      <button
                        onClick={() => {
                          const qId = activeSession.questions[currentIndex].id;
                          handleAnswerChange(qId, undefined);
                        }}
                        className="py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-805 border border-slate-400 font-semibold rounded-sm shadow-xs cursor-pointer"
                      >
                        CLEAR RESPONSE
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => {
                          // Save response & mark for review
                          const qId = activeSession.questions[currentIndex].id;
                          setMarkedForReview((prev) => ({ ...prev, [qId]: true }));
                          if (currentIndex < activeSession.questions.length - 1) {
                            nextQuestion();
                          }
                        }}
                        className="py-2.5 px-3 bg-[#8a4df5] hover:bg-[#7237df] text-white font-bold rounded-sm border border-[#5d1ddf] shadow-xs cursor-pointer"
                      >
                        SAVE & MARK FOR REVIEW
                      </button>

                      <button
                        onClick={() => {
                          // NTA Save & Next (primary blue button!)
                          if (currentIndex < activeSession.questions.length - 1) {
                            nextQuestion();
                          } else {
                            if (confirm('You reached the final question. Submit the entire JEE examination block?')) {
                              submitTest();
                            }
                          }
                        }}
                        className="py-2.5 px-5 bg-[#1d4ed8] hover:bg-blue-800 text-white font-extrabold rounded-sm border border-blue-900 shadow-md cursor-pointer animate-pulse-slow"
                      >
                        {currentIndex < activeSession.questions.length - 1 ? 'SAVE & NEXT' : 'SAVE & SUBMIT'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Student profile & question navigation palette */}
                <div className="bg-slate-100 p-3 rounded border border-slate-300 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    
                    {/* Candidate Identity block */}
                    <div className="flex items-center gap-2 bg-white p-2 rounded border border-slate-300">
                      <div className="w-10 h-10 bg-slate-200 border border-slate-400 flex items-center justify-center font-bold text-slate-500 rounded text-sm shrink-0">
                        👤
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-500 leading-normal block">CANDIDATE:</span>
                        <span className="text-xs font-black text-slate-850 tracking-tight block truncate select-text">{aspirantEmail}</span>
                        <span className="text-[9.5px] font-mono font-bold text-blue-700 block uppercase truncate">{aspirantNick} (Aspirant)</span>
                        <span className="text-[9.5px] font-mono font-bold text-amber-600 block">WARNS: {cheatingWarnings}/3</span>
                      </div>
                    </div>

                    {/* Shapes Legends Guide Panel */}
                    <div className="p-2 bg-white rounded border border-slate-300 space-y-2">
                      <span className="text-[9.5px] font-black text-slate-505 block uppercase border-b border-slate-200 pb-1">CBT Legend Details</span>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] leading-tight text-slate-600 font-medium">
                        <div className="flex items-center gap-1">
                          <span className="w-4 h-4 bg-green-600 border border-green-750 text-white font-mono text-[8px] flex items-center justify-center rounded-sm font-bold shadow-xs">A</span>
                          <span>Answered</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-4 h-4 bg-red-600 border border-red-750 text-white font-mono text-[8px] flex items-center justify-center rounded-sm font-bold shadow-xs">U</span>
                          <span>Unanswered</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-4 h-4 bg-[#8a4df5] border border-violet-700 text-white font-mono text-[8.5px] flex items-center justify-center rounded-full font-bold">M</span>
                          <span>Marked</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-4 h-4 bg-slate-300 border border-slate-400 text-slate-700 font-mono text-[8.5px] flex items-center justify-center rounded-sm font-bold">NV</span>
                          <span>Not Visited</span>
                        </div>
                      </div>
                    </div>

                    {/* Palette block filtered by Subject */}
                    <div className="space-y-1.5">
                      <div className="p-1 px-2 bg-blue-900 border border-blue-950 text-white text-[10px] font-black tracking-wide uppercase font-mono rounded-sm text-center">
                        {activeNtaSubject} QUESTION CHANNELS
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1 pt-1 bg-white p-2 rounded border border-slate-300">
                        {activeSession.questions.map((q, qIndex) => {
                          const isVisited = visited[q.id];
                          const isAnswered = activeSession.answers[q.id] !== undefined && activeSession.answers[q.id] !== '';
                          const isMarked = markedForReview[q.id];
                          
                          let bgClass = 'bg-slate-300 border-slate-400 text-slate-700'; // Not Visited
                          let symbol = 'NV';
                          if (isMarked && isAnswered) {
                            bgClass = 'bg-indigo-600 border-indigo-805 text-white rounded-full';
                            symbol = 'MA';
                          } else if (isMarked) {
                            bgClass = 'bg-[#8a4df5] border-violet-700 text-white rounded-full';
                            symbol = 'M';
                          } else if (isAnswered) {
                            bgClass = 'bg-green-600 border-green-755 text-white';
                            symbol = 'A';
                          } else if (isVisited) {
                            bgClass = 'bg-red-600 border-red-755 text-white';
                            symbol = 'U';
                          }

                          return (
                            <button
                              key={q.id}
                              onClick={() => {
                                setCurrentIndex(qIndex);
                                setVisited((v) => ({ ...v, [q.id]: true }));
                              }}
                              className={`w-8 h-8 text-[11px] font-mono font-bold flex flex-col items-center justify-center border transition-all cursor-pointer shadow-2xs ${bgClass}`}
                              title={`Question ${qIndex + 1}`}
                            >
                              <span>{qIndex + 1}</span>
                              <span className="text-[6.5px] font-light font-mono block scale-80 leading-3 opacity-90">{symbol}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* NTA Proctor stream preview or CBT submit option */}
                  <div className="space-y-2 text-white">
                    {webcamProctored && (
                      <div className="border border-slate-300 bg-white p-1 rounded relative aspect-[4/3] shadow-xs">
                        <ProctorWebcam />
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Are you absolutely ready to submit this official IIT-JEE mock trial? Your calculated marks will be logged dynamically.')) {
                          submitTest();
                        }
                      }}
                      className="w-full text-center py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded border border-red-800 shadow-md cursor-pointer select-none uppercase tracking-wide"
                    >
                      SUBMIT JEE MAIN SHEET
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TEST RESULT SHEETS & DETAILS */}
      {activeSession && activeSession.status === 'Completed' && (
        <div className="bg-slate-900 border border-slate-750/80 rounded-2xl p-5 shadow-2xl space-y-6 animate-fade-in">
          {/* Header scores card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-5 rounded-xl border border-slate-800/80">
            <div className="md:col-span-2 space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase tracking-wider">RESULT DASHBOARD</span>
              <h2 className="text-lg font-bold text-slate-200">{activeSession.name}</h2>
              <p className="text-xs text-slate-400">Completed at {new Date(activeSession.completedAt || '').toLocaleDateString()}</p>
            </div>

            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-800 py-2 md:py-0">
              <span className="text-[11px] font-mono text-slate-400 mb-1">AGGREGATE SCORE</span>
              <span className="text-2xl font-black text-cyan-400">
                {activeSession.score} / {activeSession.questions.length * 4}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">IIT marking applied (+4, -1)</span>
            </div>

            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-800 py-2 md:py-0">
              <span className="text-[11px] font-mono text-slate-400 mb-1">ACCURACY / PERCENTILE</span>
              <span className="text-2xl font-black text-emerald-400">{activeSession.accuracy}%</span>
              <span className="text-[10px] text-cyan-500 font-mono mt-0.5">Percentile: ~{activeSession.predictedPercentile}%</span>
            </div>
          </div>

          {/* Solutions & Analysis review tray */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-yellow-400" /> Detail Performance Breakdowns
            </h3>

            <div className="space-y-4">
              {activeSession.questions.map((q, qIdx) => {
                const userAns = activeSession.answers[q.id];
                const isCorrect = q.questionType === 'Single Choice' 
                  ? userAns === q.correctAnswer
                  : q.questionType === 'Numerical' 
                  ? parseFloat(String(userAns)) === parseFloat(String(q.correctAnswer))
                  : Array.isArray(userAns) && Array.isArray(q.correctAnswer) && 
                    userAns.length === q.correctAnswer.length && userAns.every((x) => (q.correctAnswer as string[]).includes(x));

                return (
                  <div key={q.id} className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
                    {/* Collapsible header */}
                    <div className="p-4 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 border-b border-slate-850">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs font-mono">
                          {qIdx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-medium text-slate-200">
                            {q.chapter} ({q.difficulty})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Correct indicator */}
                        {userAns === undefined ? (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                            SKIPPED
                          </span>
                        ) : isCorrect ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> CORRECT (+4)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> INCORRECT ({q.questionType === 'Single Choice' ? '-1' : '0'})
                          </span>
                        )}

                        <button
                          id={`toggle-solution-btn-${q.id}`}
                          onClick={() => setReviewingQuestionId(reviewingQuestionId === q.id ? null : q.id)}
                          className="text-xs text-cyan-400 border border-slate-850 px-3 py-1 rounded hover:bg-slate-800 transition-colors"
                        >
                          {reviewingQuestionId === q.id ? 'HIDE SOLUTION' : 'VIEW SOLUTION'}
                        </button>
                      </div>
                    </div>

                    {/* Question texts always visible */}
                    <div className="p-4 text-xs font-medium leading-relaxed text-slate-200 bg-slate-950/20 border-b border-transparent">
                      <p className="font-sans text-slate-200">{q.text}</p>
                    </div>

                    {/* Solution details block */}
                    {reviewingQuestionId === q.id && (
                      <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-[10px] font-mono text-slate-400 block mb-1">YOUR SUBMISSION:</span>
                            <span className="font-mono text-xs font-bold text-slate-200">
                              {userAns === undefined ? '[Value Skipped]' : JSON.stringify(userAns)}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-[10px] font-mono text-slate-400 block mb-1">CORRECT KEY:</span>
                            <span className="font-mono text-xs font-bold text-cyan-400">
                              {JSON.stringify(q.correctAnswer)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
                          <span className="text-[10.5px] font-mono text-yellow-500 font-bold block uppercase tracking-wide">
                            STEP-BY-STEP MATHEMATICAL SOLUTION:
                          </span>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans whitespace-pre-wrap">
                            {q.solution}
                          </p>
                        </div>

                        {/* Explain mistake with AI coach */}
                        {!isCorrect && userAns !== undefined && (
                          <div className="border border-cyan-500/20 bg-cyan-500/5 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1.5 uppercase">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                Personal AI Mentor mistake explanation
                              </span>
                              {!aiExplanations[q.id] && (
                                <button
                                  id={`ai-explain-btn-${q.id}`}
                                  onClick={() => triggerAIExplanation(q, userAns)}
                                  disabled={explainingId === q.id}
                                  className="text-[10.5px] font-sans font-bold bg-cyan-600 active:bg-cyan-700 text-slate-950 px-3 py-1 rounded transition-all cursor-pointer"
                                >
                                  {explainingId === q.id ? 'GENERATING COCH EXPLAIN...' : 'EXPLAIN MY MISTAKE'}
                                </button>
                              )}
                            </div>

                            {aiExplanations[q.id] ? (
                              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap border-t border-slate-800/80 pt-2 font-sans">
                                {aiExplanations[q.id]}
                              </p>
                            ) : explainingId === q.id ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                                <span>AI tutor studying your answer formula logic...</span>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                Click explain button to consult your personal IIT coach. It reviews why answered {JSON.stringify(userAns)} is incorrect vs correct key {JSON.stringify(q.correctAnswer)} to close concepts gaps instantly.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete result and exit */}
          <button
            id="test-result-exit-btn"
            onClick={() => setActiveSession(null)}
            className="w-full bg-slate-800 hover:bg-slate-705 text-slate-200 border border-slate-700/80 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
          >
            RETURN TO PREPARATION COCKPIT
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
