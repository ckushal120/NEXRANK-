/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UploadCloud, FileText, Image, Sparkles, Loader2, PlayCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { Question } from '../types';

interface UploaderProps {
  onQuestionExtracted: (q: Question) => void;
  theme?: string;
}

export default function Uploader({ onQuestionExtracted, theme = 'light' }: UploaderProps) {
  const [loading, setLoading] = useState(false);
  const [extractedQuestion, setExtractedQuestion] = useState<Question | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a high-quality JPEG or PNG image screenshot of the JEE question.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setExtractedQuestion(null);

    try {
      const base64 = await convertToBase64(file);
      
      const response = await fetch('/api/ai/ocr-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server rejected request.');
      }

      setExtractedQuestion(data.question);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Error occurred while contacting Gemini OCR. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-lg">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-cyan-400" />
          AI Mock Paper & Question OCR Extractor
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload any screenshot, PDF snapshot, or direct photo of a JEE Main/Advanced question. Our AI coach parses variables, sets equations, drafts high-yield step-by-step solutions, and registers it as an active mock test!
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        id="ocr-uploader-drag-container"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 px-4 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-slate-700 hover:border-slate-500 bg-slate-950/60'
        }`}
      >
        <input
          id="ocr-uploader-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-slate-200">Processing question with Gemini Vision...</p>
              <p className="text-xs text-slate-400 mt-1 animate-pulse">Running OCR & parsing IIT-JEE mathematical variables...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Drag & drop or <span className="text-cyan-400 font-bold hover:underline">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG of questions or paper captures</p>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="flex gap-2 items-center text-rose-400 text-xs bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Extracted Preview Area */}
      {extractedQuestion && (
        <div className="border border-slate-700/60 rounded-xl bg-slate-950/55 p-4 animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono">
              <CheckCircle className="w-4 h-4" />
              JEE QUESTION EXTRACTED SUCCESSFULLY
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {extractedQuestion.subject}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {extractedQuestion.difficulty}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1">MAPPED CHAPTER:</span>
              <p className="text-xs font-semibold text-slate-300">{extractedQuestion.chapter}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1">QUESTION TEXT:</span>
              <p className="text-xs font-medium text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                {extractedQuestion.text}
              </p>
            </div>

            {extractedQuestion.options && extractedQuestion.options.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1.5">EXTRACTED OPTIONS:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {extractedQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center text-xs p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="font-bold text-cyan-400 font-mono">{String.fromCharCode(65 + idx)})</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                <span className="text-[10px] font-mono text-emerald-400 block mb-1">CORRECT KEY:</span>
                <span className="font-mono font-bold text-slate-200 text-sm">
                  {Array.isArray(extractedQuestion.correctAnswer)
                    ? extractedQuestion.correctAnswer.join(', ')
                    : extractedQuestion.correctAnswer}
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">EXTRACTED BY:</span>
                <span className="text-xs font-medium text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini Flash 3.5 Multimodal
                </span>
              </div>
            </div>

            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5">AI GENERATED SOLUTION:</span>
              <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">{extractedQuestion.solution}</p>
            </div>

            <button
              id="extactor-quiz-start-btn"
              onClick={() => onQuestionExtracted(extractedQuestion)}
              className="w-full bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-slate-900 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              CONVERT AND LAUNCH INTUITIVE PRACTICE QUIZ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
