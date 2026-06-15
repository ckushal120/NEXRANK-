/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase request size limit for image uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Lazy initializer for Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY env variable is not declared. AI endpoints will fall back to mock generation.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// AI API ENDPOINTS
// ----------------------------------------------------

// 1. DYNAMIC JEE QUESTION GENERATOR
app.post('/api/ai/generate-question', async (req, res) => {
  const { subject, chapter, difficulty, questionType } = req.body;
  const ai = getAI();

  if (!ai) {
    // Elegant fallback simulation if API key is not configured.
    console.log('Simulating custom question generation due to missing key...');
    const fakeId = `ai-${Date.now()}`;
    const generated = {
      id: fakeId,
      subject: subject || 'Physics',
      chapter: chapter || 'Electrostatics & Capacitance',
      difficulty: difficulty || 'Medium',
      questionType: questionType || 'Single Choice',
      text: `[AI Practice Challenge] Consider a spherical conducting shell centered at the origin of radius R. A point charge +q is at r=0. What is the potential difference between two concentric points at r=R/2 and r=2R? (Simulated because GEMINI_API_KEY is not defined)`,
      options: ['3·q / (4·πε0·R)', 'q / (8·πε0·R)', 'q / (4·πε0·R)', 'Zero'],
      correctAnswer: 'A',
      solution: 'Using electric potential formulas, V(R/2) = q / (4πε0(R/2)) = q/(2πε0R) (conducting shielding ignores shell effect inside). V(2R) = q / (4πε0(2R)) = q/(8πε0R). The difference yields 3q / (8πε0R). This is a placeholder; add your real GEMINI_API_KEY inside AI Studio Secrets panel to unlock intelligent generation!',
      isPYQ: false,
      isAI: true
    };
    return res.json({ success: true, question: generated });
  }

  try {
    const prompt = `You are an elite IIT-JEE coach. Generate a brand-new, super high-quality question for the Indian competitive IIT-JEE (Joint Entrance Examination) standard matching the following settings:
Subject: ${subject}
Chapter/Topic: ${chapter}
Difficulty: ${difficulty} (Easy corresponds to JEE Main direct formulas, Medium corresponds to JEE Main tough / JEE Advanced standard, Hard corresponds to core JEE Advanced reasoning)
Question Type: ${questionType} (Single Choice, Multiple Choice, or Numerical)

Ensure:
1. Question is fully correct, highly realistic, and avoids typos.
2. The solution is step-by-step, thorough, and highly pedagogical.
3. For Numerical questions, the correct answer must be a single decimal or integer (e.g. 5, -2, or 2.5). Provide no options array.
4. For Single Choice, provide 4 options and set correctAnswer to the option letter index ("A", "B", "C", or "D").
5. For Multiple Choice, provide 4 options and set correctAnswer to an array of option letters (e.g. ["A", "C"]).

Return exactly a JSON object matching this schema. do not surround the JSON with markdown tags of your own unless required by output format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: 'The question text, including conditions, parameters, and variable indices.' },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Four option strings, only include this if questionType is Single Choice or Multiple Choice.'
            },
            correctAnswer: {
              type: Type.STRING,
              description: 'For Single Choice, e.g. "A". For Multiple Choice, return a comma-spaced string or JSON-parsable array, e.g. "A,C". For Numerical, return the exact number string e.g., "12.5"'
            },
            solution: { type: Type.STRING, description: 'Step-by-step mathematical or chemical solution explaining why the answer is correct.' }
          },
          required: ['text', 'correctAnswer', 'solution']
        }
      }
    });

    const body = response.text;
    if (!body) throw new Error('Empty response received from Gemini model.');

    let parsed = JSON.parse(body.trim());
    
    // Adapt response schema format to user state format
    let finalAnswer: any = parsed.correctAnswer;
    if (questionType === 'Multiple Choice') {
      if (typeof finalAnswer === 'string') {
        finalAnswer = finalAnswer.split(',').map(s => s.trim().toUpperCase());
      }
    } else if (questionType === 'Numerical') {
      const numVal = parseFloat(finalAnswer);
      finalAnswer = isNaN(numVal) ? parsed.correctAnswer : numVal;
    }

    const question = {
      id: `ai-${Date.now()}`,
      subject,
      chapter,
      difficulty,
      questionType,
      text: parsed.text,
      options: parsed.options,
      correctAnswer: finalAnswer,
      solution: parsed.solution,
      isPYQ: false,
      isAI: true
    };

    return res.json({ success: true, question });
  } catch (error: any) {
    console.error('Error in generate-question:', error);
    return res.status(500).json({ error: 'Failed to generate question. Please try again.', details: error.message });
  }
});

// 2. MISTAKE DISCUSSION / AI TUTOR EXPLANATION
app.post('/api/ai/explain', async (req, res) => {
  const { questionText, solution, userAnswer, correctAnswer } = req.body;
  const ai = getAI();

  if (!ai) {
    return res.json({
      success: true,
      explanation: `**AI Coach Review**: You answered **${JSON.stringify(userAnswer)}**, but the correct answer is **${JSON.stringify(correctAnswer)}**.\n\n*Review Advice*: Please study the formulas relating to the question parameters carefully. Try solving with a scratchpad step-by-step. To get personalized conceptual explanations using real AI, please enter your actual GEMINI_API_KEY inside AI Studio Secrets!`
    });
  }

  try {
    const prompt = `You are an extremely encouraging and talented IIT-JEE private tutor. A student attempted a question, got it wrong, and wants an explanation of their mistake and the underlying physics/chemistry/math concepts.
    
Question: "${questionText}"
Detailed Solution: "${solution}"
Student's Submitted Answer: "${JSON.stringify(userAnswer)}"
Official Correct Answer: "${JSON.stringify(correctAnswer)}"

Write a conversational, friendly guide that:
1. Validates the student's effort, keeping their confidence high.
2. Explains the step-by-step concepts they should have applied.
3. Pinpoints where a typical student slips up (calculation error, sign mistake, conceptual gap, etc.) when they reach the answer "${JSON.stringify(userAnswer)}".
4. Summarizes 1 fundamental "Golden Formula" or conceptual take-away for their next test.
Keep it beautifully formatted using standard Markdown. Avoid complex latex formatting that can break, but use standard plain symbols (like Delta, pi, sigma, superscript subscripts, fractions x/y)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    return res.json({ success: true, explanation: response.text || 'No explanation generated.' });
  } catch (error: any) {
    console.error('Error in mistake explanation:', error);
    return res.status(500).json({ error: 'Failed to explain mistake.', details: error.message });
  }
});

// 3. MULTIMODAL QUESTION OCR / EXTRACTOR (PDF INLINE/IMAGE INPUT)
app.post('/api/ai/ocr-extract', async (req, res) => {
  const { imageBase64, mimeType } = req.body; // base64 encoded string & type (image/png, image/jpeg, etc.)
  const ai = getAI();

  if (!ai) {
    console.log('Faking OCR Extraction due to missing API Key...');
    return res.json({
      success: true,
      question: {
        id: `extracted-${Date.now()}`,
        subject: 'Physics',
        chapter: 'Modern Physics & Semiconductors',
        difficulty: 'Medium',
        questionType: 'Single Choice',
        text: 'The binding energy per nucleon of helium is 7.07 MeV. What is the total mass defect of Helium in atomic mass units (approx)? [Simulated extraction, provide active GEMINI_API_KEY to extract actual screenshots!]',
        options: ['0.030 u', '0.045 u', '0.015 u', '0.060 u'],
        correctAnswer: 'A',
        solution: 'Helium has 4 nucleons. Total binding energy = 4 \u00d7 7.07 = 28.28 MeV.\nSince 1 amu approx equals 931.5 MeV of energy:\nMass defect = 28.28 / 931.5 ≈ 0.030 u.\nOption A is correct.',
        isPYQ: false,
        isAI: true
      }
    });
  }

  try {
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required standard.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: cleanBase64
      }
    };

    const promptText = `Analyze this image containing an IIT-JEE standard physics, chemistry, or mathematics question.
Your task is to:
1. Extract the main question text. If it is high-difficulty or complex, extract all details fully.
2. Identify the Subject (Physics, Chemistry, or Mathematics).
3. Map it to one of the standard chapters:
   Physics: ['Kinematics & Laws of Motion', 'Work, Energy & Power', 'Rotational Motion & System of Particles', 'Gravitation', 'Thermodynamics & KTg', 'Electrostatics & Capacitance', 'Current Electricity', 'Magnetic Effects & AC', 'Optics (Ray and Wave)', 'Modern Physics & Semiconductors']
   Chemistry: ['Mole Concept & Chemical Equilibrium', 'Structure of Atom', 'Chemical Bonding & Molecular Structure', 'Thermodynamics & Thermochemistry', 'Electrochemistry & Chemical Kinetics', 'Coordination Compounds & d-Block', 'General Organic Chemistry & Hydrocarbons', 'Organic Halogen & Oxygen Compounds', 'Nitrogen Compounds & Biomolecules', 'Periodic Table & p-Block Elements']
   Mathematics: ['Sets, Relations & Functions', 'Complex Numbers & Quadratic Equations', 'Matrices & Determinants', 'Permutations, Combinations & Probability', 'Binomial Theorem & Sequences', 'Limits, Continuity & Derivatives', 'Integral Calculus & Area Under Curves', 'Differential Equations', 'Vectors & 3D Geometry', 'Trigonometry & Coordinate Geometry']
4. Identify the questionType: 'Single Choice', 'Multiple Choice', or 'Numerical'.
5. Extract options if it's Single or Multiple Choice (as exactly 4 items in array).
6. Find the correctAnswer (e.g. "A" or ["A", "C"] or a numerical value like 5 or 2.5).
7. Compose a robust, detailed step-by-step logical solution solving the question.

Output strictly as a valid JSON object matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [imagePart, { text: promptText }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, enum: ['Physics', 'Chemistry', 'Mathematics'] },
            chapter: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
            questionType: { type: Type.STRING, enum: ['Single Choice', 'Multiple Choice', 'Numerical'] },
            text: { type: Type.STRING, description: 'The text of the question extracted as accurately as possible.' },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Four option text strings, only include this if questionType is Single Choice or Multiple Choice.'
            },
            correctAnswer: {
              type: Type.STRING,
              description: 'For Single Choice, e.g. "C". For Multiple Choice, return a comma-spaced list of letters, e.g. "B,D". For Numerical, return the number string'
            },
            solution: { type: Type.STRING, description: 'Step-by-step rigorous solution.' }
          },
          required: ['subject', 'chapter', 'difficulty', 'questionType', 'text', 'correctAnswer', 'solution']
        }
      }
    });

    const body = response.text;
    if (!body) throw new Error('No content returned from OCR extraction.');

    const parsed = JSON.parse(body.trim());
    
    // Adapt formats
    let finalAnswer: any = parsed.correctAnswer;
    if (parsed.questionType === 'Multiple Choice') {
      if (typeof finalAnswer === 'string') {
        finalAnswer = finalAnswer.split(',').map(s => s.trim().toUpperCase());
      }
    } else if (parsed.questionType === 'Numerical') {
      const parsedNum = parseFloat(parsed.correctAnswer);
      finalAnswer = isNaN(parsedNum) ? parsed.correctAnswer : parsedNum;
    }

    const question = {
      id: `extracted-${Date.now()}`,
      subject: parsed.subject,
      chapter: parsed.chapter,
      difficulty: parsed.difficulty || 'Medium',
      questionType: parsed.questionType,
      text: parsed.text,
      options: parsed.options,
      correctAnswer: finalAnswer,
      solution: parsed.solution,
      isPYQ: false,
      isAI: true
    };

    return res.json({ success: true, question });
  } catch (error: any) {
    console.error('OCR Extraction error:', error);
    return res.status(500).json({ error: 'Failed to extract question from media.', details: error.message });
  }
});

// 4. PERFORMANCE FORECASTER & STUDY PLAN GENERATOR
app.post('/api/ai/study-plan', async (req, res) => {
  const { streak, testHistory, weakChapters } = req.body;
  const ai = getAI();

  if (!ai) {
    // Fallback study plan recommendation.
    return res.json({
      success: true,
      predictedJEEPercentile: 96.5,
      predictedRank: 35000,
      dailyRevisionAdvice: 'Excellent job keeping up your prep. Keep solving at least 10 Physics, 10 Chemistry, and 10 Maths PYQs daily. Make sure to strengthen weak areas. For real AI performance analysis and score forecasts, enter your GEMINI_API_KEY!',
      tasks: [
        { id: '1', title: 'Revise Nernst Equation and Electrochemistry Formulas', type: 'practice', subject: 'Chemistry', chapter: 'Electrochemistry & Chemical Kinetics', completed: false },
        { id: '2', title: 'Solve 5 PYQs on Moment of Inertia of Rigid Bodies', type: 'practice', subject: 'Physics', chapter: 'Rotational Motion & System of Particles', completed: false },
        { id: '3', title: 'Attempt a Definite Integration Chapter Quiz', type: 'quiz', subject: 'Mathematics', chapter: 'Integral Calculus & Area Under Curves', completed: false }
      ]
    });
  }

  try {
    const prompt = `You are an advanced IIT-JEE predictive counselor and analytics generator.
Analyze the following student preparation parameters:
Current Daily Streak: ${streak || 0}
Weak Chapters Identified: ${JSON.stringify(weakChapters || [])}
Recent Test Performance Logs: ${JSON.stringify(testHistory || [])}

Perform deep diagnostic logic to:
1. Predict their estimated JEE Main percentile (a value between 80.0 and 99.9) and estimated rank.
2. Compose 3 customized daily plan tasks focusing on their weak areas.
3. Give an encouraging 3-sentence general daily revision advice summary.

Return exactly a JSON object matching this schema:
{
  "predictedJEEPercentile": 98.4,
  "predictedRank": 16000,
  "dailyRevisionAdvice": "Focus on high-yield rotational torque problems. You are struggling with angular conservation, devote 30 mins to reviewing identical disc collisions.",
  "tasks": [
    { "id": "t1", "title": "Revise Electrostatics potential fields formulas", "type": "practice", "subject": "Physics", "chapter": "Electrostatics & Capacitance", "completed": false }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedJEEPercentile: { type: Type.NUMBER },
            predictedRank: { type: Type.INTEGER },
            dailyRevisionAdvice: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['theory', 'practice', 'quiz'] },
                  subject: { type: Type.STRING, enum: ['Physics', 'Chemistry', 'Mathematics'] },
                  chapter: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN }
                },
                required: ['id', 'title', 'type', 'subject', 'chapter', 'completed']
              }
            }
          },
          required: ['predictedJEEPercentile', 'predictedRank', 'dailyRevisionAdvice', 'tasks']
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Error calculating performance study plan:', error);
    return res.status(500).json({ error: 'Failed to forecast study plan.', details: error.message });
  }
});

// 5. LIVE INTERACTIVE AI MENTOR CHAT
app.post('/api/ai/chat', async (req, res) => {
  const { messages, userProfile } = req.body;
  const ai = getAI();

  if (!ai) {
    return res.json({
      success: true,
      message: `**NEXRANK AI Mentor**: Hello, **${userProfile?.nickname || 'Aspirant'}**! I am your IIT-JEE Virtual Coach. To experience real intelligent responses customized to your specific syllabus targets, please enter your actual GEMINI_API_KEY inside the Secrets panel.\n\n*General Advisor Tip*: Consistency is key in JEE prep. Keep your daily streak active, revise the weak formulas mapped in your Mistake Book, and make sure you complete daily quests. What topic can I help you with today?`
    });
  }

  try {
    const chatHistory = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Add a system prompt detailing personality
    const systemPrompt = `You are "NEXRANK COACH", an elite and encouraging AI Academic Mentor and Study Planner for Indian students prepping for the notoriously difficult IIT-JEE examination.
Profile of current student: Nickname: ${userProfile?.nickname || 'Aspirant'}, Score: ${userProfile?.score || 450} Prep Points, Streak: ${userProfile?.streak || 3} days.
Your tone: High motivation, empathetic, mathematically precise, strategically sharp. Teach them quick tricks, formula shortcuts, and help plan study timings. Keep responses highly parsed and structural using Markdown formatting. Maintain strong exam focus (JEE Main & Advanced).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
         ...chatHistory
      ]
    });

    return res.json({ success: true, message: response.text || 'Let us crack JEE together!' });
  } catch (error: any) {
    console.error('Error in AI Mentor Chat:', error);
    return res.status(500).json({ error: 'Failed to seek counsel.', details: error.message });
  }
});

// ----------------------------------------------------
// MAIN APPLICATION SETUP & INGRES
// ----------------------------------------------------

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the compiled assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
