/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

interface Constant {
  symbol: string;
  name: string;
  value: string;
  unit: string;
}

const JEE_CONSTANTS: Constant[] = [
  { symbol: 'h', name: "Planck's Constant", value: '6.626 \u00d7 10^-34', unit: 'J·s' },
  { symbol: 'c', name: 'Speed of Light', value: '3.00 \u00d7 10^8', unit: 'm/s' },
  { symbol: 'e', name: 'Elementary Charge', value: '1.602 \u00d7 10^-19', unit: 'C' },
  { symbol: 'me', name: 'Electron Mass', value: '9.109 \u00d7 10^-31', unit: 'kg' },
  { symbol: 'mp', name: 'Proton Mass', value: '1.673 \u00d7 10^-27', unit: 'kg' },
  { symbol: 'R', name: 'Gas Constant', value: '8.314 (or 0.0821)', unit: 'J/K·mol (L·atm/K·mol)' },
  { symbol: 'N_A', name: "Avogadro's Number", value: '6.022 \u00d7 10^23', unit: 'mol^-1' },
  { symbol: 'g', name: 'Acceleration due to Gravity', value: '9.8 (often 10 in JEE)', unit: 'm/s^2' },
  { symbol: 'k_B', name: "Boltzmann's Constant", value: '1.380 \u00d7 10^-23', unit: 'J/K' },
  { symbol: 'F', name: "Faraday's Constant", value: '96500', unit: 'C/mol' },
  { symbol: 'R_H', name: 'Rydberg Constant', value: '1.097 \u00d7 10^7', unit: 'm^-1' },
];

export default function Calculators() {
  const [inputs, setInputs] = useState({ expression: '' });
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const calculateExpr = () => {
    try {
      // Safe mathematical expression evaluation using standard JS arithmetic
      // sanitize inputs
      const sanitized = inputs.expression.replace(/[^0-9+\-*/().\s]/g, '');
      if (!sanitized) {
        setCalcResult('Empty');
        return;
      }
      // eslint-disable-next-line no-eval
      const res = eval(sanitized);
      setCalcResult(String(res));
    } catch {
      setCalcResult('Error');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl">
      {/* Constants Reference */}
      <div className="flex flex-col">
        <h3 className="text-xs font-mono text-cyan-400 mb-3 flex items-center gap-1.5 uppercase">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          JEE Constants & Reference Values
        </h3>
        <div className="flex-1 overflow-y-auto max-h-[220px] pr-2 space-y-1.5 custom-scrollbar">
          {JEE_CONSTANTS.map((c) => (
            <div key={c.symbol} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/30 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center gap-2">
                <span className="font-mono text-yellow-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 w-9 text-center">
                  {c.symbol}
                </span>
                <span className="text-slate-300 font-medium">{c.name}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-cyan-300 font-medium">{c.value}</span>
                <span className="text-[10px] text-slate-400 ml-1 block">{c.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physics Quick Formulate Estimator */}
      <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-700/40 pt-4 md:pt-0 md:pl-4">
        <div>
          <h3 className="text-xs font-mono text-cyan-400 mb-2 flex items-center gap-1.5 uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            VIRTUAL TEST RUN CALCUATION
          </h3>
          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Perform side calculations without leaving your ongoing exam. Type simple digits or algebraic expressions below and solve.
          </p>

          <div className="space-y-3">
            <div>
              <input
                id="virtual-calculator-expression-input"
                type="text"
                placeholder="e.g. 1.2 * 10 / (1.6 * 4.5)"
                value={inputs.expression}
                onChange={(e) => setInputs({ expression: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && calculateExpr()}
              />
            </div>

            <div className="flex gap-2">
              <button
                id="virtual-calculator-submit-btn"
                onClick={calculateExpr}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-slate-900 border font-bold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
              >
                SOLVE EXPRESSION
              </button>
              <button
                id="virtual-calculator-clear-btn"
                onClick={() => {
                  setInputs({ expression: '' });
                  setCalcResult(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {calcResult !== null && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-700/50 flex justify-between items-center animate-fade-in">
            <span className="text-[10px] uppercase font-mono text-slate-400">Result:</span>
            <span className="font-mono text-sm font-bold text-green-400">{calcResult}</span>
          </div>
        )}
      </div>
    </div>
  );
}
