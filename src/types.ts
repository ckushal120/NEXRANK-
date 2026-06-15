/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubjectType = 'Physics' | 'Chemistry' | 'Mathematics';
export type DifficultyType = 'Easy' | 'Medium' | 'Hard';
export type QuestionFormType = 'Single Choice' | 'Multiple Choice' | 'Numerical' | 'Assertion-Reason' | 'Match the Following';
export type TestType = 'Chapter' | 'Subject' | 'Full Main' | 'Full Advanced' | 'PYP' | 'Custom';

export interface Question {
  id: string;
  subject: SubjectType;
  chapter: string;
  year?: number; // 2016-2026 for PYQs
  difficulty: DifficultyType;
  questionType: QuestionFormType;
  text: string;
  options?: string[]; // relevant for Single/Multiple Choice
  listA?: string[]; // Left Column for Match the Following
  listB?: string[]; // Right Column for Match the Following
  correctAnswer: string | string[] | number; // options indices (e.g. "A", ["A", "C"], or a number 12.5)
  solution: string;
  isPYQ: boolean;
  isAI?: boolean;
}

export interface TestSession {
  id: string;
  name: string;
  type: TestType;
  subject?: SubjectType;
  chapters?: string[];
  duration: number; // in minutes
  timeLimit: number; // in seconds
  questions: Question[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  startedAt?: string;
  completedAt?: string;
  answers: Record<string, any>; // questionId -> response
  timeSpentPerQuestion: Record<string, number>; // questionId -> duration in seconds
  score?: number;
  accuracy?: number;
  predictedPercentile?: number;
}

export interface MistakeBookItem {
  question: Question;
  userAnswer: any;
  timestamp: string;
  aiExplanation?: string;
  resolved: boolean;
}

export interface StudyPlan {
  dailyStreak: number;
  lastActive: string; // YYYY-MM-DD
  todayTargetScore: number;
  tasks: {
    id: string;
    title: string;
    type: 'theory' | 'practice' | 'quiz';
    subject: SubjectType;
    chapter: string;
    completed: boolean;
  }[];
  weakChapters: {
    subject: SubjectType;
    chapter: string;
    accuracy: number;
    recommendedRevision: string;
  }[];
}

export interface LeaderboardEntry {
  email: string;
  displayName: string;
  streak: number;
  score: number;
  testsCompleted: number;
  rank?: number;
}

export interface NCERTChapter {
  id: string;
  subject: SubjectType;
  title: string;
  grade: 'Class 11' | 'Class 12';
  completed: boolean;
  notes?: string;
}
