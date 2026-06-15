/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Edit } from 'lucide-react';

export default function Scratchpad() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#38bdf8'); // sky-400
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to its display container size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = (rect?.width || 600) * 2;
      canvas.height = (rect?.height || 280) * 2;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoord(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    
    // Smooth out starting dot
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#1e293b' : color; // Slate-800 is the backing color
    ctx.lineWidth = isEraser ? 15 : lineWidth;
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoord(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#1e293b' : color;
    ctx.lineWidth = isEraser ? 15 : lineWidth;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoord = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl">
      {/* Control panel */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700/70 text-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400">VITRUAL SCRATCHPAD</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Colors */}
          <div className="flex items-center gap-1.5 bg-slate-955 p-1 rounded-lg border border-slate-700/50">
            {['#38bdf8', '#4ade80', '#f43f5e', '#ffffff'].map((c) => (
              <button
                key={c}
                id={`scratchpad-color-${c}`}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                className={`w-4 h-4 rounded-full transition-transform ${c === color && !isEraser ? 'scale-125 ring-2 ring-slate-400' : 'opacity-80 hover:opacity-100 hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Toggle Eraser */}
          <button
            id="scratchpad-toggle-eraser"
            onClick={() => setIsEraser(!isEraser)}
            title="Toggle Eraser"
            className={`p-1.5 rounded-lg transition-colors ${isEraser ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'hover:bg-slate-700/70 text-slate-400'}`}
          >
            <Eraser className="w-4 h-4" />
          </button>

          {/* Width */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-400">Size:</span>
            <input
              id="scratchpad-size-slider"
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 accent-cyan-500 cursor-pointer"
            />
          </div>

          <span className="h-4 w-px bg-slate-700" />

          {/* Clear */}
          <button
            id="scratchpad-clear-btn"
            onClick={clearCanvas}
            title="Clear all drawings"
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-slate-950/80 cursor-crosshair overflow-hidden touch-none" style={{ minHeight: '200px' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 block bg-slate-900/65"
        />
        <div className="absolute bottom-2 right-2 text-slate-600 text-[10px] pointer-events-none font-mono">
          Interactive Canvas • Solve calculations here
        </div>
      </div>
    </div>
  );
}
