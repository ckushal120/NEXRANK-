/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Send, Loader2, Compass, AlertTriangle, Play, BookOpen,
  Trophy, TrendingUp, HelpCircle, HeartHandshake, RefreshCw
} from 'lucide-react';
import { SubjectType } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface AICoachProps {
  nickname: string;
  xpValue: number;
  coinValue: number;
  streakValue: number;
  testSessions: any[];
  mistakesCount: number;
  theme?: string;
}

export default function AICoach({
  nickname,
  xpValue,
  coinValue,
  streakValue,
  testSessions,
  mistakesCount,
  theme = 'light'
}: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      sender: 'ai',
      text: `Hello, **${nickname}**! I am your **NEXRANK AI Coach**. 🎓\n\nI am here to guide your study adventure, analyze weak topics, predict and track your JEE rank, and give you custom study advice or shortcuts to claim World checkpoints. \n\nWhat would you like to discuss today? You can choose one of the quick advice shortcuts below or type your own question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Predictive metrics
  const [predictedPercentile, setPredictedPercentile] = useState(95.4);
  const [predictedRank, setPredictedRank] = useState(46000);
  const [recommendation, setRecommendation] = useState("Complete at least 2 full CBT mock tests to help me formulate highly accurate rank diagnostics.");
  const [weakSyllabusChapters, setWeakSyllabusChapters] = useState<{ chapter: string; accuracy: number; subject: SubjectType }[]>([]);

  // Refresh predictions using backend
  useEffect(() => {
    fetchDiagnosticData();
  }, [testSessions, mistakesCount]);

  const fetchDiagnosticData = async () => {
    try {
      // Calculate weak chapters local approximation to feed server-side AI
      const savedMistakes = localStorage.getItem('quantum_jee_mistake_book');
      const parsedMistakes = savedMistakes ? JSON.parse(savedMistakes) : [];
      
      const counts: Record<string, { subject: SubjectType; count: number }> = {};
      parsedMistakes.forEach((m: any) => {
        if (m.question) {
          counts[m.question.chapter] = {
            subject: m.question.subject,
            count: (counts[m.question.chapter]?.count || 0) + 1
          };
        }
      });

      const mappedWeak = Object.entries(counts).map(([chapter, info]) => ({
        chapter,
        subject: info.subject,
        accuracy: 42 // approximate accuracy of weak chapter
      })).slice(0, 3);

      setWeakSyllabusChapters(mappedWeak);

      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streak: streakValue,
          testHistory: testSessions,
          weakChapters: mappedWeak
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.predictedJEEPercentile) setPredictedPercentile(data.predictedJEEPercentile);
        if (data.predictedRank) setPredictedRank(data.predictedRank);
        if (data.dailyRevisionAdvice) setRecommendation(data.dailyRevisionAdvice);
      }
    } catch (e) {
      console.warn('Failed querying predictions', e);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const chatHistory = [...messages, userMsg];
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          userProfile: {
            nickname,
            score: xpValue,
            streak: streakValue
          }
        })
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('Chat gateway error');
      }

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `*Aspirant Connection Unstable*: I am facing an issue loading my central database files, but remember: revision makes a warrior! Make sure to solve daily quests and focus on mathematics Calculus and physics Rotation concepts.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Quick Action Pill Prompts
  const QUICK_PROMPTS = [
    { label: '📝 Create a 7-day JEE study plan', prompt: 'Please generate a robust, rigorous, customized study plan for the last 7 days of my JEE Mains exam prep.' },
    { label: '🔥 Explain my Rotational Torque mistakes', prompt: 'How do I solve rotational motion questions that involve drop-collisions coordinates of identical discs? I struggle with conserving speed.' },
    { label: '🚀 Motivate me for IIT Summit!', prompt: 'I feel stressed about the IIT summit mock exams. Give me a strategic motivational study advice and tell me how AIR rankings are unlocked!' },
    { label: '⚛️ Give me Organic Chemistry tricks', prompt: 'What are the top 3 high-yield organic chemistry mechanism tricks often asked in JEE Advanced Coordination sections?' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. RANK FORECASTER GRAPHICS BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className={`border rounded-[24px] p-5 shadow-sm hover:shadow-md flex flex-col justify-between transition-all duration-300 ${
          theme === 'dark'
            ? 'glass-card-dark bg-slate-900/65 border-slate-800 text-slate-100'
            : 'glass-card-light bg-white/75 border-slate-200 text-slate-900'
        }`}>
          <div className="space-y-1">
            <span className={`text-[9.5px] font-mono font-bold tracking-wider block uppercase ${
              theme === 'dark' ? 'text-cyan-400' : 'text-royal-blue'
            }`}>PREDICTED JEE PERCENTILE</span>
            <span className={`text-3xl font-black block tracking-tight font-sans ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {predictedPercentile}%
            </span>
            <p className={`text-[11px] leading-normal ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Based on rolling results metrics from your CBT test attempts. Maintain &gt;80% accuracies to cross high percentiles.
            </p>
          </div>
          
          <div className={`border-t pt-3 mt-4 flex items-center justify-between text-[11px] font-mono ${
            theme === 'dark' ? 'border-slate-800 text-slate-500' : 'border-slate-150 text-slate-500'
          }`}>
            <span>Predicted Rank Range</span>
            <span className="text-amber-500 dark:text-yellow-400 font-extrabold font-sans">AIR #{predictedRank}</span>
          </div>
        </div>

        <div className={`border rounded-[24px] p-5 shadow-sm hover:shadow-md flex flex-col justify-between transition-all duration-300 md:col-span-2 ${
          theme === 'dark'
            ? 'glass-card-dark bg-slate-900/65 border-slate-800'
            : 'glass-card-light bg-white/75 border-slate-205'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono text-amber-550 font-bold tracking-wider block uppercase">PERSONALIZED AI STUDY STRATEGY</span>
              <Sparkles className="w-4 h-4 text-royal-blue dark:text-cyan-400 animate-bounce" />
            </div>
            <strong className={`text-xs font-semibold block leading-snug mt-1 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
            }`}>
              ⚡ Action Recommendations from NEXRANK Virtual Guide:
            </strong>
            <p className={`text-xs leading-relaxed font-sans italic whitespace-pre-line ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              "{recommendation}"
            </p>
          </div>

          <div className={`border-t pt-3 mt-4 flex flex-wrap gap-2 text-[10px] font-mono ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-150'
          }`}>
            {weakSyllabusChapters.length > 0 ? (
              <>
                <span className="text-rose-500 font-bold block pt-1">Critical Areas:</span>
                {weakSyllabusChapters.map((w, idx) => (
                  <span key={idx} className="bg-rose-500/10 text-rose-500 border border-rose-500/15 py-0.5 px-2 rounded-lg">
                    {w.chapter.slice(0, 18)}... ({w.accuracy}% acc)
                  </span>
                ))}
              </>
            ) : (
              <span className="text-slate-500">Perfect alignment! No critical weak chapters logged. Maintain mock streaks!</span>
            )}
          </div>
        </div>

      </div>

      {/* 2. CHAT WORKSPACE AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Quick pill panel lists (Left sidebar on desktop) */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`border rounded-[24px] p-5 shadow-sm space-y-4 transition-all duration-300 ${
            theme === 'dark'
              ? 'glass-card-dark bg-slate-900/65 border-slate-800'
              : 'glass-card-light bg-white/75 border-slate-200'
          }`}>
            <span className="text-[10px] font-mono text-electric-purple font-bold block uppercase tracking-wider">Coach Diagnostic Prompts</span>
            <p className={`text-[11.5px] leading-normal ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Click any coaching card below to launch an instant tutorial review with NEXRANK.
            </p>
            
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  id={`quick-prompt-pill-${idx}`}
                  onClick={() => handleSendMessage(qp.prompt)}
                  className={`w-full text-left p-3 rounded-2xl border text-[11px] leading-snug transition-all cursor-pointer font-sans font-medium ${
                    theme === 'dark'
                      ? 'border-slate-850 hover:border-slate-600 bg-slate-950/60 hover:bg-slate-900 text-slate-300'
                      : 'border-slate-200 hover:border-slate-350 bg-slate-100 hover:bg-slate-200/50 text-slate-750 hover:text-slate-900'
                  }`}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Dialog interface (Right side box) */}
        <div className="lg:col-span-3">
          <div className={`border rounded-[24px] h-[460px] shadow-sm flex flex-col overflow-hidden relative transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Header Title bar */}
            <div className={`border-b px-5 py-4 flex items-center justify-between shrink-0 ${
              theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-black text-xs shadow-md">
                  NX
                </div>
                <div>
                  <h4 className={`text-xs font-black flex items-center gap-1.5 font-sans leading-none ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    NEXRANK AI COACH
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  </h4>
                  <span className="text-[9px] text-emerald-500 font-mono block mt-1 uppercase">IIT Academic Advisor • ONLINE</span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-550 hidden sm:block">Gemini-3.5-flash standard</span>
            </div>

            {/* Message Dialogue logs */}
            <div className={`flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar flex flex-col ${
              theme === 'dark' ? 'bg-slate-950/40' : 'bg-slate-50/50'
            }`}>
              {messages.map((m) => {
                const isAi = m.sender === 'ai';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[85%] ${
                      isAi ? 'self-start items-start' : 'self-end items-end'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-slate-500 block mb-1">
                      {isAi ? 'NEXRANK Advisor' : nickname} • {m.timestamp}
                    </span>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans border whitespace-pre-wrap ${
                      isAi 
                        ? theme === 'dark'
                          ? 'bg-slate-900/40 border-slate-850 text-slate-200 rounded-tl-none' 
                          : 'bg-white border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                        : theme === 'dark'
                          ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200 rounded-tr-none'
                          : 'bg-indigo-50 border-indigo-200/60 text-indigo-900 rounded-tr-none shadow-sm'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="self-start flex flex-col items-start max-w-[85%]">
                  <span className="text-[9px] font-mono text-slate-500 block mb-1">NEXRANK Advisor • Drafting guidance...</span>
                  <div className={`p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 border ${
                    theme === 'dark' ? 'bg-slate-900/40 border-slate-850 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <Loader2 className="w-3.5 h-3.5 text-[#3B82F6] animate-spin" />
                    <span>Analyzing IIT-JEE exam patterns...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input field text control */}
            <div className={`p-4 shrink-0 border-t ${
              theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/80 border-slate-200'
            }`}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask NEXRANK a question (e.g. explain rotational kinetics or compile study advice...)"
                  className={`flex-1 rounded-xl px-4 py-3 text-xs focus:outline-none transition-all font-sans border ${
                    theme === 'dark'
                      ? 'bg-slate-950/85 border-slate-800 text-slate-200 focus:border-cyan-500 placeholder-slate-700'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-[#3B82F6] placeholder-slate-400 shadow-sm'
                  }`}
                  disabled={isThinking}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className={`font-bold p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                    theme === 'dark'
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 disabled:opacity-40'
                      : 'bg-royal-blue hover:bg-blue-600 text-white disabled:opacity-40'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
